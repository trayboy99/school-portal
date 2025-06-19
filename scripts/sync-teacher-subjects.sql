-- First, let's see John's teacher ID
SELECT id, teacher_id, first_name, surname, subjects, classes FROM teachers WHERE email = 'test@teacher.com';

-- Insert subjects into subjects table based on teachers table data
-- For John Smith (Mathematics teacher)
INSERT INTO subjects (name, code, target_class, department, teacher_id, status, created_at)
SELECT 
    'Mathematics' as name,
    'MATH' as code,
    unnest(classes) as target_class,
    department,
    id as teacher_id,
    'Active' as status,
    CURRENT_TIMESTAMP as created_at
FROM teachers 
WHERE email = 'test@teacher.com'
ON CONFLICT (name, target_class, teacher_id) DO NOTHING;

-- For Mary Johnson (English teacher)
INSERT INTO subjects (name, code, target_class, department, teacher_id, status, created_at)
SELECT 
    'English' as name,
    'ENG' as code,
    unnest(classes) as target_class,
    department,
    id as teacher_id,
    'Active' as status,
    CURRENT_TIMESTAMP as created_at
FROM teachers 
WHERE email = 'mary@teacher.com'
ON CONFLICT (name, target_class, teacher_id) DO NOTHING;

-- For Test Teacher (Science subjects)
INSERT INTO subjects (name, code, target_class, department, teacher_id, status, created_at)
VALUES 
    ('Physics', 'PHY', 'JSS3A', 'Science', (SELECT id FROM teachers WHERE email = 'teacher@test.com'), 'Active', CURRENT_TIMESTAMP),
    ('Physics', 'PHY', 'JSS3B', 'Science', (SELECT id FROM teachers WHERE email = 'teacher@test.com'), 'Active', CURRENT_TIMESTAMP),
    ('Chemistry', 'CHEM', 'JSS3A', 'Science', (SELECT id FROM teachers WHERE email = 'teacher@test.com'), 'Active', CURRENT_TIMESTAMP),
    ('Chemistry', 'CHEM', 'JSS3B', 'Science', (SELECT id FROM teachers WHERE email = 'teacher@test.com'), 'Active', CURRENT_TIMESTAMP)
ON CONFLICT (name, target_class, teacher_id) DO NOTHING;

-- For Sarah Wilson (Biology teacher)
INSERT INTO subjects (name, code, target_class, department, teacher_id, status, created_at)
SELECT 
    'Biology' as name,
    'BIO' as code,
    unnest(classes) as target_class,
    department,
    id as teacher_id,
    'Active' as status,
    CURRENT_TIMESTAMP as created_at
FROM teachers 
WHERE email = 'sarah@teacher.com'
ON CONFLICT (name, target_class, teacher_id) DO NOTHING;

-- Verify the subjects were created
SELECT s.name, s.code, s.target_class, t.first_name, t.surname, t.email
FROM subjects s
JOIN teachers t ON s.teacher_id = t.id
ORDER BY t.first_name, s.name, s.target_class;
