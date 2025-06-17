-- Test adding a student directly to verify the table works
INSERT INTO students (
    roll_no, 
    surname, 
    middle_name, 
    first_name, 
    email, 
    phone,
    date_of_birth, 
    gender, 
    home_address, 
    class, 
    section,
    parent_name, 
    parent_phone, 
    parent_email,
    credential_method, 
    credentials_sent_to,
    avatar
) VALUES (
    '2024004', 
    'Test', 
    'Middle', 
    'Student', 
    'test.student@email.com', 
    '+234 901 234 5678',
    '2010-01-15', 
    'Male', 
    '123 Test Street, Lagos, Nigeria', 
    'JSS 1', 
    'Gold',
    'Test Parent', 
    '+234 902 345 6789', 
    'test.parent@email.com',
    'auto', 
    'parent',
    '/placeholder.svg?height=40&width=40'
);

-- Check if the student was added
SELECT 
    id,
    roll_no,
    full_name,
    email,
    class,
    section,
    parent_name,
    credential_method,
    created_at
FROM students 
ORDER BY created_at DESC 
LIMIT 5;
