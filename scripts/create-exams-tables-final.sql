-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    exam_name VARCHAR(200) NOT NULL,
    exam_type VARCHAR(50) NOT NULL, -- 'Continuous Assessment', 'Mid-term', 'Final'
    subject VARCHAR(100) NOT NULL,
    class_level VARCHAR(20) NOT NULL, -- JSS1, JSS2, SSS1, etc.
    section VARCHAR(20), -- Gold, Silver, Bronze (NULL means all sections)
    exam_date DATE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_score INTEGER DEFAULT 100,
    instructions TEXT,
    academic_year VARCHAR(20) DEFAULT '2024/2025',
    term VARCHAR(20) DEFAULT 'First Term',
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_by INTEGER, -- teacher who created the exam
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_results table
CREATE TABLE IF NOT EXISTS exam_results (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    grade VARCHAR(2), -- A, B, C, D, F
    remarks TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by INTEGER, -- teacher who graded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- Function to calculate grade based on score
CREATE OR REPLACE FUNCTION calculate_grade(score DECIMAL, max_score INTEGER DEFAULT 100)
RETURNS VARCHAR(2) AS $$
BEGIN
    DECLARE
        percentage DECIMAL;
    BEGIN
        percentage := (score / max_score) * 100;
        
        IF percentage >= 80 THEN
            RETURN 'A';
        ELSIF percentage >= 70 THEN
            RETURN 'B';
        ELSIF percentage >= 60 THEN
            RETURN 'C';
        ELSIF percentage >= 50 THEN
            RETURN 'D';
        ELSE
            RETURN 'F';
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate grade when score is inserted/updated
CREATE OR REPLACE FUNCTION update_grade()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grade := calculate_grade(NEW.score, (SELECT max_score FROM exams WHERE id = NEW.exam_id));
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_grade
    BEFORE INSERT OR UPDATE ON exam_results
    FOR EACH ROW
    EXECUTE FUNCTION update_grade();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);
CREATE INDEX IF NOT EXISTS idx_exams_class_level ON exams(class_level);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_grade ON exam_results(grade);
