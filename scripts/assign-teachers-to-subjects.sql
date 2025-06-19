-- First, let's check what teachers and subjects we have
SELECT 'Teachers:' as info;
SELECT id, first_name, last_name, department FROM teachers LIMIT 5;

SELECT 'Subjects:' as info;
SELECT id, name, target_class, teacher_id FROM subjects LIMIT 10;

-- Update subjects to assign them to teachers
-- Assign Mathematics subjects to a Math teacher
UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE department = 'Mathematics' LIMIT 1)
WHERE name LIKE '%Mathematics%' OR name LIKE '%Math%';

-- Assign English subjects to an English teacher
UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE department = 'Languages' LIMIT 1)
WHERE name LIKE '%English%';

-- Assign Science subjects to Science teachers
UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE department = 'Science' LIMIT 1)
WHERE name LIKE '%Science%' OR name LIKE '%Physics%' OR name LIKE '%Chemistry%' OR name LIKE '%Biology%';

-- If no teachers exist, create some sample teachers
INSERT INTO teachers (
    employee_id, first_name, last_name, email, phone, department, 
    qualification, hire_date, status, created_at
) VALUES 
('TCH001', 'Sarah', 'Johnson', 'sarah.johnson@school.edu', '+1234567890', 'Mathematics', 'M.Sc Mathematics', '2023-01-15', 'Active', CURRENT_TIMESTAMP),
('TCH002', 'David', 'Wilson', 'david.wilson@school.edu', '+1234567891', 'Languages', 'B.A English Literature', '2023-02-01', 'Active', CURRENT_TIMESTAMP),
('TCH003', 'Emily', 'Brown', 'emily.brown@school.edu', '+1234567892', 'Science', 'M.Sc Physics', '2023-03-01', 'Active', CURRENT_TIMESTAMP),
('TCH004', 'Michael', 'Davis', 'michael.davis@school.edu', '+1234567893', 'Social Studies', 'B.A History', '2023-04-01', 'Active', CURRENT_TIMESTAMP)
ON CONFLICT (employee_id) DO NOTHING;

-- Now assign subjects to these teachers
UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE employee_id = 'TCH001'),
    teacher_name = 'Sarah Johnson'
WHERE name IN ('Mathematics', 'Further Mathematics') AND teacher_id IS NULL;

UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE employee_id = 'TCH002'),
    teacher_name = 'David Wilson'
WHERE name IN ('English Language', 'English') AND teacher_id IS NULL;

UPDATE subjects 
SET teacher_id = (SELECT id FROM teachers WHERE employee_id = 'TCH003'),
    teacher_name = 'Emily Brown'
WHERE name IN ('Basic Science', 'Physics', 'Chemistry', 'Biology') AND teacher_id IS NULL;

-- Show the updated assignments
SELECT 
    s.name as subject_name,
    s.target_class,
    s.teacher_name,
    t.first_name || ' ' || t.last_name as teacher_full_name,
    t.department
FROM subjects s
LEFT JOIN teachers t ON s.teacher_id = t.id
ORDER BY s.target_class, s.name;
