-- Check all table structures to verify column names
SELECT 'STUDENTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

SELECT 'SUBJECTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;

SELECT 'EXAMS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exams' 
ORDER BY ordinal_position;

SELECT 'STUDENT_EXAMS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_exams' 
ORDER BY ordinal_position;

SELECT 'TEACHERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

SELECT 'CLASSES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;

-- Sample data checks
SELECT 'SAMPLE STUDENTS DATA:' as info;
SELECT id, first_name, middle_name, surname, class FROM students LIMIT 5;

SELECT 'SAMPLE SUBJECTS DATA:' as info;
SELECT id, name FROM subjects LIMIT 10;

SELECT 'SAMPLE EXAMS DATA:' as info;
SELECT id, exam_name, mark_type, class, term, year, session FROM exams LIMIT 5;

SELECT 'SAMPLE STUDENT_EXAMS DATA:' as info;
SELECT id, student_id, exam_id, subject_id, ca1, ca2, exam, total, grade FROM student_exams LIMIT 5;
