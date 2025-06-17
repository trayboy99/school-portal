-- Check the current structure of the students table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Also check if there are any students in the table
SELECT COUNT(*) as total_students FROM students;

-- Show a sample of student records to understand the structure
SELECT * FROM students LIMIT 5;
