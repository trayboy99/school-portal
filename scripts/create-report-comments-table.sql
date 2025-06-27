-- Create report_comments table for teacher report card comments
CREATE TABLE IF NOT EXISTS report_comments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    term VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_report_comments_student 
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_comments_teacher 
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_comments_exam 
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate comments for same student-teacher-exam combination
    CONSTRAINT unique_student_teacher_exam_comment 
        UNIQUE (student_id, teacher_id, exam_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_comments_student_id ON report_comments(student_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_teacher_id ON report_comments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_exam_id ON report_comments(exam_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_term ON report_comments(term);
CREATE INDEX IF NOT EXISTS idx_report_comments_academic_year ON report_comments(academic_year);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_report_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_report_comments_updated_at
    BEFORE UPDATE ON report_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_report_comments_updated_at();

-- Insert some sample data for testing
INSERT INTO report_comments (student_id, teacher_id, exam_id, term, academic_year, comment, comment_type) VALUES
(1, 1, 1, 'First Term', '2024/2025', 'Excellent performance in all subjects. Keep up the good work!', 'general'),
(2, 1, 1, 'First Term', '2024/2025', 'Good academic performance. Needs to improve in punctuality.', 'general'),
(3, 1, 1, 'First Term', '2024/2025', 'Shows great potential. Encourage more participation in class activities.', 'general')
ON CONFLICT (student_id, teacher_id, exam_id) DO NOTHING;

-- Verify the table was created successfully
SELECT 'report_comments table created successfully' as status;
SELECT COUNT(*) as sample_records FROM report_comments;
