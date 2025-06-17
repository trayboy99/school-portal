-- Create subjects table with all form fields and proper relationships
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated subject ID (e.g., SUBJ001)
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    target_class VARCHAR(50) NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(255), -- Denormalized for quick access
    description TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher_id ON subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_target_class ON subjects(target_class);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON subjects(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_subjects_updated_at();

-- Insert some sample subjects for testing
INSERT INTO subjects (subject_id, name, code, department, target_class, teacher_name, description, status) VALUES
('SUBJ001', 'Mathematics', 'MATH101', 'Mathematics', 'JSS 1', 'Dr. Sarah Johnson', 'Core mathematics curriculum covering algebra and basic geometry', 'Active'),
('SUBJ002', 'English Language', 'ENG101', 'Languages', 'JSS 1', 'Mr. David Wilson', 'English language fundamentals including grammar and composition', 'Active'),
('SUBJ003', 'Basic Science', 'SCI101', 'Science', 'JSS 1', 'Mrs. Emily Brown', 'Introduction to basic scientific concepts and principles', 'Active'),
('SUBJ004', 'Physics', 'PHY201', 'Science', 'SSS 1', 'Dr. Sarah Johnson', 'Introduction to mechanics, thermodynamics, and basic physics', 'Active'),
('SUBJ005', 'Chemistry', 'CHEM201', 'Science', 'SSS 1', 'Mrs. Emily Brown', 'Basic chemistry principles and laboratory work', 'Active'),
('SUBJ006', 'Further Mathematics', 'MATH301', 'Mathematics', 'SSS 2', 'Dr. Sarah Johnson', 'Advanced mathematics including calculus and statistics', 'Active')
ON CONFLICT (subject_id) DO NOTHING;

-- Create a view to get subjects with teacher details
CREATE OR REPLACE VIEW subjects_with_teacher_details AS
SELECT 
    s.*,
    t.first_name || ' ' || t.last_name as full_teacher_name,
    t.employee_id as teacher_employee_id,
    t.email as teacher_email,
    t.phone as teacher_phone,
    t.department as teacher_department
FROM subjects s
LEFT JOIN teachers t ON s.teacher_id = t.id;

-- Function to generate next subject ID
CREATE OR REPLACE FUNCTION generate_subject_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
    new_id VARCHAR(20);
BEGIN
    -- Get the next number in sequence
    SELECT COALESCE(MAX(CAST(SUBSTRING(subject_id FROM 5) AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM subjects 
    WHERE subject_id ~ '^SUBJ[0-9]+$';
    
    -- Format as SUBJ001, SUBJ002, etc.
    new_id := 'SUBJ' || LPAD(next_num::TEXT, 3, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;
