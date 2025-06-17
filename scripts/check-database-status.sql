-- Check if students table exists and its current structure
SELECT 
    'Table Status: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'students' AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Show all columns in the students table (if it exists)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count how many students are in the table
SELECT 'Total Students: ' || COUNT(*) as student_count
FROM students;

-- Show sample data (if any exists)
SELECT 
    id,
    roll_no,
    surname,
    first_name,
    email,
    class,
    section,
    created_at
FROM students 
ORDER BY created_at DESC 
LIMIT 3;
