-- Check the actual structure of the students table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Check sample student data to see actual column names
SELECT * FROM students LIMIT 3;

-- Check the subjects table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;

-- Check the exams table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exams' 
ORDER BY ordinal_position;

-- Check the student_exams table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_exams' 
ORDER BY ordinal_position;
