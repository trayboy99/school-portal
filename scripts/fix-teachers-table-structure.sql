-- The issue is that the teachers table has 'name' but the login expects 'first_name', 'surname'
-- Let's add the missing columns and update the structure

-- Add missing columns to teachers table
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS surname VARCHAR(100),
ADD COLUMN IF NOT EXISTS classes TEXT[];

-- Update existing records to split name into first_name and surname
UPDATE teachers 
SET 
  first_name = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
    ELSE name
  END,
  surname = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', -1)
    ELSE ''
  END
WHERE first_name IS NULL;

-- Insert test teachers with proper structure
INSERT INTO teachers (
  teacher_id, first_name, surname, name, email, phone, 
  department, subjects, classes, status
) VALUES
('TCH001', 'John', 'Smith', 'John Smith', 'test@teacher.com', '08012345678', 
 'Mathematics', ARRAY['Mathematics'], ARRAY['JSS1A'], 'Active'),
('TCH002', 'Mary', 'Johnson', 'Mary Johnson', 'mary@teacher.com', '08087654321', 
 'English', ARRAY['English'], ARRAY['JSS2A'], 'Active'),
('TCH003', 'Test', 'Teacher', 'Test Teacher', 'teacher@test.com', '08011111111', 
 'Science', ARRAY['Physics'], ARRAY['JSS3A'], 'Active')
ON CONFLICT (teacher_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  surname = EXCLUDED.surname,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  department = EXCLUDED.department,
  subjects = EXCLUDED.subjects,
  classes = EXCLUDED.classes,
  status = EXCLUDED.status;

-- Verify the fix
SELECT teacher_id, first_name, surname, name, email, status FROM teachers;
