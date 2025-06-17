-- Check actual column names in existing tables
SELECT 'students' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position

UNION ALL

SELECT 'subjects' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position

UNION ALL

SELECT 'teachers' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;
