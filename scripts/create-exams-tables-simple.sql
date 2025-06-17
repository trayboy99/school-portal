-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    class VARCHAR(50) NOT NULL,
    year VARCHAR(4) NOT NULL,
    term VARCHAR(20) NOT NULL,
    mark_type VARCHAR(20) NOT NULL CHECK (mark_type IN ('midterm', 'terminal')),
    session VARCHAR(20) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_name, class, year, term, mark_type, session)
);

-- Create student_exams table
CREATE TABLE IF NOT EXISTS student_exams (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    
    ca1 INTEGER CHECK (ca1 >= 0),
    ca2 INTEGER CHECK (ca2 >= 0),
    exam INTEGER CHECK (exam >= 0),
    
    total INTEGER GENERATED ALWAYS AS (COALESCE(ca1, 0) + COALESCE(ca2, 0) + COALESCE(exam, 0)) STORED,
    grade VARCHAR(2),
    teacher_id INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id, subject_id)
);

-- Create exam_subjects table
CREATE TABLE IF NOT EXISTS exam_subjects (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, subject_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exams_class_year_term ON exams(class, year, term);
CREATE INDEX IF NOT EXISTS idx_student_exams_exam_id ON student_exams(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_student_id ON student_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_subject_id ON student_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_id ON exam_subjects(exam_id);

-- Function to validate scores based on exam type
CREATE OR REPLACE FUNCTION validate_and_update_student_exam()
RETURNS TRIGGER AS $$
DECLARE
    exam_mark_type VARCHAR(20);
BEGIN
    SELECT mark_type INTO exam_mark_type FROM exams WHERE id = NEW.exam_id;
    
    IF exam_mark_type = 'midterm' THEN
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 10) THEN
            RAISE EXCEPTION 'Midterm CA1 must be between 0 and 10';
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 10) THEN
            RAISE EXCEPTION 'Midterm CA2 must be between 0 and 10';
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 20) THEN
            RAISE EXCEPTION 'Midterm Exam must be between 0 and 20';
        END IF;
        
        NEW.grade := CASE 
            WHEN NEW.total >= 32 THEN 'A'
            WHEN NEW.total >= 28 THEN 'B'
            WHEN NEW.total >= 24 THEN 'C'
            WHEN NEW.total >= 20 THEN 'D'
            WHEN NEW.total >= 16 THEN 'E'
            ELSE 'F'
        END;
    ELSE
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 20) THEN
            RAISE EXCEPTION 'Terminal CA1 must be between 0 and 20';
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 20) THEN
            RAISE EXCEPTION 'Terminal CA2 must be between 0 and 20';
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 60) THEN
            RAISE EXCEPTION 'Terminal Exam must be between 0 and 60';
        END IF;
        
        NEW.grade := CASE 
            WHEN NEW.total >= 80 THEN 'A'
            WHEN NEW.total >= 70 THEN 'B'
            WHEN NEW.total >= 60 THEN 'C'
            WHEN NEW.total >= 50 THEN 'D'
            WHEN NEW.total >= 40 THEN 'E'
            ELSE 'F'
        END;
    END IF;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_validate_and_update_student_exam ON student_exams;
CREATE TRIGGER trigger_validate_and_update_student_exam
    BEFORE INSERT OR UPDATE ON student_exams
    FOR EACH ROW
    EXECUTE FUNCTION validate_and_update_student_exam();
