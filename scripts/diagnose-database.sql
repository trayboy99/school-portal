-- Check if students table exists and its current structure
SELECT 
    'Table exists: ' || CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'students' AND table_schema = 'public'
    ) THEN 'YES' ELSE 'NO' END as table_status;

-- List all tables in the database
SELECT 'All tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- If students table exists, show its columns
SELECT 
    'Column: ' || column_name as column_info,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' AND table_schema = 'public'
ORDER BY ordinal_position;
