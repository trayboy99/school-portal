-- Check if teachers table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'teachers';

-- Check what columns actually exist in teachers table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

-- Show any existing data
SELECT * FROM teachers LIMIT 5;
