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

-- Create student_exams table for storing marks (CORRECTED SCORING)
CREATE TABLE IF NOT EXISTS student_exams (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    ca1 INTEGER CHECK (ca1 >= 0 AND ca1 <= 10),  -- CA1 out of 10
    ca2 INTEGER CHECK (ca2 >= 0 AND ca2 <= 10),  -- CA2 out of 10
    exam INTEGER CHECK (exam >= 0 AND exam <= 20), -- Exam out of 20
    total INTEGER GENERATED ALWAYS AS (COALESCE(ca1, 0) + COALESCE(ca2, 0) + COALESCE(exam, 0)) STORED, -- Total out of 40
    grade VARCHAR(2),
    teacher_id INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_id, subject_id)
);

-- Create exam_subjects table to track which subjects are part of each exam
CREATE TABLE IF NOT EXISTS exam_subjects (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, subject_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_class_year_term ON exams(class, year, term);
CREATE INDEX IF NOT EXISTS idx_student_exams_exam_id ON student_exams(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_student_id ON student_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exams_subject_id ON student_exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_id ON exam_subjects(exam_id);

-- Create a view for easy exam data retrieval with student counts
CREATE OR REPLACE VIEW exams_with_details AS
SELECT 
    e.*,
    COUNT(DISTINCT es.subject_id) as subject_count,
    COUNT(DISTINCT se.student_id) as enrolled_students,
    COUNT(DISTINCT CASE WHEN se.total IS NOT NULL THEN se.student_id END) as students_with_marks
FROM exams e
LEFT JOIN exam_subjects es ON e.id = es.exam_id
LEFT JOIN student_exams se ON e.id = se.exam_id
GROUP BY e.id, e.exam_name, e.class, e.year, e.term, e.mark_type, e.session, e.start_date, e.end_date, e.created_at, e.updated_at;

-- Create a view for broadsheet data (CORRECTED FOR 40-POINT SCALE)
CREATE OR REPLACE VIEW broadsheet_data AS
SELECT 
    s.id as student_id,
    s.first_name,
    s.last_name,
    s.class,
    e.exam_name,
    e.year,
    e.term,
    e.session,
    e.mark_type,
    subj.subject_name,
    subj.department,
    t.first_name as teacher_first_name,
    t.last_name as teacher_last_name,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    se.grade,
    CASE 
        WHEN se.total < 20 THEN 'Below 50%'  -- 50% of 40 = 20
        ELSE 'Above 50%'
    END as performance_status,
    CASE 
        WHEN se.total IS NULL THEN 'No Marks Entered'
        ELSE 'Marks Entered'
    END as marks_status
FROM students s
CROSS JOIN exams e
CROSS JOIN subjects subj
LEFT JOIN student_exams se ON s.id = se.student_id AND e.id = se.exam_id AND subj.id = se.subject_id
LEFT JOIN teachers t ON se.teacher_id = t.id
WHERE s.class = e.class
ORDER BY s.class, s.last_name, s.first_name, subj.subject_name;

-- Function to automatically calculate and update grades (CORRECTED FOR 40-POINT SCALE)
CREATE OR REPLACE FUNCTION update_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade := CASE 
        WHEN NEW.total >= 32 THEN 'A'  -- 80% of 40 = 32
        WHEN NEW.total >= 28 THEN 'B'  -- 70% of 40 = 28
        WHEN NEW.total >= 24 THEN 'C'  -- 60% of 40 = 24
        WHEN NEW.total >= 20 THEN 'D'  -- 50% of 40 = 20
        WHEN NEW.total >= 16 THEN 'E'  -- 40% of 40 = 16
        ELSE 'F'
    END;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update grades
DROP TRIGGER IF EXISTS trigger_update_grade ON student_exams;
CREATE TRIGGER trigger_update_grade
    BEFORE INSERT OR UPDATE ON student_exams
    FOR EACH ROW
    EXECUTE FUNCTION update_grade();

-- Function to copy midterm scores to terminal
CREATE OR REPLACE FUNCTION copy_midterm_to_terminal(
    p_class VARCHAR(50),
    p_year VARCHAR(4),
    p_term VARCHAR(20),
    p_session VARCHAR(20)
)
RETURNS INTEGER AS $$
DECLARE
    rows_affected INTEGER := 0;
BEGIN
    -- Copy midterm scores to terminal for the same class, year, term, session
    INSERT INTO student_exams (exam_id, student_id, subject_id, ca1, ca2, exam, teacher_id)
    SELECT 
        t_exam.id as exam_id,
        m_se.student_id,
        m_se.subject_id,
        m_se.ca1,
        m_se.ca2,
        m_se.exam,
        m_se.teacher_id
    FROM student_exams m_se
    JOIN exams m_exam ON m_se.exam_id = m_exam.id
    JOIN exams t_exam ON (
        t_exam.class = m_exam.class 
        AND t_exam.year = m_exam.year 
        AND t_exam.term = m_exam.term 
        AND t_exam.session = m_exam.session
        AND t_exam.mark_type = 'terminal'
    )
    WHERE m_exam.mark_type = 'midterm'
        AND m_exam.class = p_class
        AND m_exam.year = p_year
        AND m_exam.term = p_term
        AND m_exam.session = p_session
    ON CONFLICT (exam_id, student_id, subject_id) 
    DO UPDATE SET
        ca1 = EXCLUDED.ca1,
        ca2 = EXCLUDED.ca2,
        exam = EXCLUDED.exam,
        teacher_id = EXCLUDED.teacher_id,
        updated_at = CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    RETURN rows_affected;
END;
$$ LANGUAGE plpgsql;
