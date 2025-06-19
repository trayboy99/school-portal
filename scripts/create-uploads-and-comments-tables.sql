-- Create report_comments table for student report card comments
CREATE TABLE IF NOT EXISTS report_comments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    term VARCHAR(20) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(20) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_report_comments_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_report_comments_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate comments for same student/teacher/term
    CONSTRAINT unique_student_teacher_term UNIQUE (student_id, teacher_id, term, academic_year)
);

-- Create uploads table for teacher file uploads
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_type VARCHAR(50) NOT NULL, -- exam_questions, e_notes, assignments, materials
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    subject VARCHAR(100),
    class VARCHAR(50),
    deadline TIMESTAMP NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'uploaded', -- uploaded, expired, deleted
    
    -- Foreign key constraint
    CONSTRAINT fk_uploads_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_comments_student_id ON report_comments(student_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_teacher_id ON report_comments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_term ON report_comments(term, academic_year);

CREATE INDEX IF NOT EXISTS idx_uploads_teacher_id ON uploads(teacher_id);
CREATE INDEX IF NOT EXISTS idx_uploads_file_type ON uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_uploads_deadline ON uploads(deadline);

-- Insert some sample data for testing
INSERT INTO report_comments (student_id, teacher_id, term, academic_year, comment, comment_type) VALUES
(1, 1, 'First Term', '2024/2025', 'Excellent performance in Mathematics. Shows great understanding of concepts and consistently produces quality work.', 'general'),
(2, 1, 'First Term', '2024/2025', 'Good student with potential. Needs to improve participation in class discussions.', 'general'),
(3, 2, 'First Term', '2024/2025', 'Outstanding performance in English Language. Excellent writing skills and vocabulary.', 'general');

INSERT INTO uploads (teacher_id, title, description, file_type, file_name, file_url, subject, class, deadline) VALUES
(1, 'Mathematics Mid-Term Exam Questions', 'Mid-term examination questions for JSS 1 Mathematics covering algebra and geometry', 'exam_questions', 'math_midterm_jss1.pdf', 'https://example.com/uploads/math_midterm_jss1.pdf', 'Mathematics', 'JSS 1', '2024-12-31 23:59:59'),
(1, 'Algebra Study Notes', 'Comprehensive study notes on algebraic expressions and equations', 'e_notes', 'algebra_notes.pdf', 'https://example.com/uploads/algebra_notes.pdf', 'Mathematics', 'JSS 2', '2024-12-25 23:59:59'),
(2, 'English Grammar Assignment', 'Assignment on parts of speech and sentence construction', 'assignments', 'grammar_assignment.docx', 'https://example.com/uploads/grammar_assignment.docx', 'English', 'JSS 1', '2024-12-20 23:59:59');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for report_comments table
CREATE TRIGGER update_report_comments_updated_at 
    BEFORE UPDATE ON report_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created successfully
SELECT 'report_comments table created successfully' as status;
SELECT 'uploads table created successfully' as status;

-- Show sample data
SELECT 'Sample report comments:' as info;
SELECT rc.*, s.first_name, s.surname, t.first_name as teacher_first_name, t.surname as teacher_surname
FROM report_comments rc
JOIN students s ON rc.student_id = s.id
JOIN teachers t ON rc.teacher_id = t.id
LIMIT 3;

SELECT 'Sample uploads:' as info;
SELECT u.*, t.first_name as teacher_first_name, t.surname as teacher_surname
FROM uploads u
JOIN teachers t ON u.teacher_id = t.id
LIMIT 3;
