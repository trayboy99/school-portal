-- Check John's data in teachers table
SELECT teacher_id, first_name, surname, email, department, subjects, classes, status 
FROM teachers 
WHERE first_name = 'John' AND surname = 'Smith';

-- Check if there are any subjects in the subjects table assigned to John
SELECT * FROM subjects WHERE teacher_id = (
    SELECT id FROM teachers WHERE first_name = 'John' AND surname = 'Smith'
);

-- Check the structure of subjects table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subjects';

-- Show all subjects in subjects table
SELECT id, name, code, target_class, teacher_id FROM subjects LIMIT 10;
