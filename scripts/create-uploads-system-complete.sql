-- Drop existing uploads table if it exists
DROP TABLE IF EXISTS uploads CASCADE;

-- Create uploads table matching the admin interface design
CREATE TABLE uploads (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    upload_type VARCHAR(20) NOT NULL CHECK (upload_type IN ('exam_questions', 'e_notes')),
    subject_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    weeks VARCHAR(100), -- For e-notes only (e.g., "Week 1-4", "Week 5-8")
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT, -- File size in bytes
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    
    -- Foreign key constraints
    CONSTRAINT fk_uploads_teacher 
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_uploads_teacher_id ON uploads(teacher_id);
CREATE INDEX idx_uploads_type ON uploads(upload_type);
CREATE INDEX idx_uploads_subject ON uploads(subject_name);
CREATE INDEX idx_uploads_class ON uploads(class_name);
CREATE INDEX idx_uploads_academic_year ON uploads(academic_year);
CREATE INDEX idx_uploads_term ON uploads(term);
CREATE INDEX idx_uploads_status ON uploads(status);

-- Create admin_deadlines table for deadline management
CREATE TABLE IF NOT EXISTS admin_deadlines (
    id SERIAL PRIMARY KEY,
    deadline_type VARCHAR(20) NOT NULL UNIQUE CHECK (deadline_type IN ('exam_questions', 'e_notes')),
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Insert current deadlines
INSERT INTO admin_deadlines (deadline_type, deadline_date, academic_year, term) VALUES
('exam_questions', '2025-06-21 23:59:59', '2024-2025', 'Second Term'),
('e_notes', '2025-06-15 23:59:59', '2024-2025', 'Second Term')
ON CONFLICT (deadline_type) DO UPDATE SET
    deadline_date = EXCLUDED.deadline_date,
    academic_year = EXCLUDED.academic_year,
    term = EXCLUDED.term,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample uploads for testing
INSERT INTO uploads (teacher_id, upload_type, subject_name, class_name, academic_year, term, weeks, file_name, file_url, file_size) VALUES
(1, 'exam_questions', 'Mathematics', 'JSS 1', '2024-2025', 'Second Term', NULL, 'math_exam_jss1.pdf', '/uploads/math_exam_jss1.pdf', 2048576),
(1, 'e_notes', 'Mathematics', 'JSS 1', '2024-2025', 'Second Term', 'Week 1-4', 'algebra_notes_week1-4.pdf', '/uploads/algebra_notes_week1-4.pdf', 1536000),
(1, 'e_notes', 'Mathematics', 'JSS 2', '2024-2025', 'Second Term', 'Week 5-8', 'geometry_notes_week5-8.pdf', '/uploads/geometry_notes_week5-8.pdf', 1843200)
ON CONFLICT DO NOTHING;

-- Verify tables created successfully
SELECT 'Uploads system created successfully' as status;
SELECT COUNT(*) as total_uploads FROM uploads;
SELECT COUNT(*) as active_deadlines FROM admin_deadlines WHERE is_active = true;
