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
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'uploaded', -- uploaded, expired, deleted
    
    -- Foreign key constraint
    CONSTRAINT fk_uploads_teacher 
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploads_teacher_id ON uploads(teacher_id);
CREATE INDEX IF NOT EXISTS idx_uploads_file_type ON uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_uploads_deadline ON uploads(deadline);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_subject ON uploads(subject);
CREATE INDEX IF NOT EXISTS idx_uploads_class ON uploads(class);

-- Insert some sample data for testing
INSERT INTO uploads (teacher_id, title, description, file_type, file_name, file_url, subject, class, deadline) VALUES
(1, 'Mathematics Mid-Term Exam Questions', 'Mid-term examination questions for JSS 1 Mathematics covering algebra and geometry', 'exam_questions', 'math_midterm_jss1.pdf', 'https://example.com/uploads/math_midterm_jss1.pdf', 'Mathematics', 'JSS 1', '2024-12-31 23:59:59'),
(1, 'Algebra Study Notes', 'Comprehensive study notes on algebraic expressions and equations', 'e_notes', 'algebra_notes.pdf', 'https://example.com/uploads/algebra_notes.pdf', 'Mathematics', 'JSS 2', '2024-12-25 23:59:59'),
(1, 'Geometry Assignment', 'Assignment on angles and triangles for JSS 1 students', 'assignments', 'geometry_assignment.docx', 'https://example.com/uploads/geometry_assignment.docx', 'Mathematics', 'JSS 1', '2024-12-20 23:59:59')
ON CONFLICT DO NOTHING;

-- Verify the table was created successfully
SELECT 'uploads table created successfully' as status;
SELECT COUNT(*) as sample_records FROM uploads;

-- Show sample data
SELECT 'Sample uploads:' as info;
SELECT u.id, u.title, u.file_type, u.subject, u.class, u.deadline, 
       t.first_name || ' ' || COALESCE(t.middle_name || ' ', '') || t.surname as teacher_name
FROM uploads u
JOIN teachers t ON u.teacher_id = t.id
LIMIT 5;
