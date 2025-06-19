-- Check if teachers table exists and its structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'teachers';

-- Check teachers table columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

-- Check if there are any teachers in the table
SELECT COUNT(*) as teacher_count FROM teachers;

-- Show sample data if any exists
SELECT * FROM teachers LIMIT 3;
