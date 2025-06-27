-- Check if Chioma exists in students table
SELECT 
    id,
    first_name,
    middle_name,
    surname,
    email,
    phone,
    class,
    status,
    admission_number
FROM students 
WHERE email ILIKE '%chioma%' OR first_name ILIKE '%chioma%';
