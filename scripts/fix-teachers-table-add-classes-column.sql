-- Add classes column to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS classes TEXT[];

-- Update existing teachers with sample class assignments
UPDATE teachers SET classes = ARRAY['JSS 1', 'JSS 2'] WHERE id = 1;
UPDATE teachers SET classes = ARRAY['JSS 3', 'SSS 1'] WHERE id = 2;
UPDATE teachers SET classes = ARRAY['SSS 2', 'SSS 3'] WHERE id = 3;

-- Add more sample teachers if needed
INSERT INTO teachers (first_name, surname, email, phone, subject_specialization, qualification, hire_date, status, classes, created_at, updated_at)
VALUES 
('John', 'Smith', 'john.smith@school.com', '+234-801-111-1111', 'Mathematics', 'B.Sc Mathematics', '2024-01-15', 'active', ARRAY['JSS 1', 'JSS 2'], NOW(), NOW()),
('Mary', 'Johnson', 'mary.johnson@school.com', '+234-802-222-2222', 'English', 'B.A English', '2024-02-01', 'active', ARRAY['JSS 3', 'SSS 1'], NOW(), NOW()),
('David', 'Wilson', 'david.wilson@school.com', '+234-803-333-3333', 'Science', 'B.Sc Physics', '2024-03-01', 'active', ARRAY['SSS 2', 'SSS 3'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
