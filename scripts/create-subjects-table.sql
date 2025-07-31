-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    class_level VARCHAR(20), -- JSS1, JSS2, SSS1, etc.
    is_core BOOLEAN DEFAULT false, -- Core or elective subject
    credit_hours INTEGER DEFAULT 1,
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (subject_name, subject_code, class_level, is_core, department) VALUES
('Mathematics', 'MATH', 'All', true, 'Science'),
('English Language', 'ENG', 'All', true, 'Languages'),
('Physics', 'PHY', 'SSS', true, 'Science'),
('Chemistry', 'CHEM', 'SSS', true, 'Science'),
('Biology', 'BIO', 'SSS', true, 'Science'),
('Geography', 'GEO', 'All', false, 'Social Studies'),
('History', 'HIST', 'All', false, 'Social Studies'),
('Economics', 'ECON', 'SSS', false, 'Social Studies'),
('Computer Science', 'CS', 'All', false, 'Technology'),
('Fine Arts', 'ART', 'All', false, 'Arts')
ON CONFLICT (subject_code) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(subject_code);
CREATE INDEX IF NOT EXISTS idx_subjects_class_level ON subjects(class_level);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
