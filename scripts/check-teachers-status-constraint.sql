-- Check the current teachers table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

-- Check current status constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname LIKE '%teachers_status%';

-- Check existing status values
SELECT DISTINCT status FROM teachers;
