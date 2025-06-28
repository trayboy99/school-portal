-- Add email addresses to existing students for login purposes
-- This script adds email addresses to students so they can login with email instead of roll_no

-- First, let's check the current students table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Update students with email addresses based on their names
-- Format: firstname.lastname@school.com

UPDATE students 
SET email = LOWER(first_name || '.' || surname || '@school.com')
WHERE email IS NULL OR email = '';

-- For students with middle names, use first name + middle name + surname
UPDATE students 
SET email = LOWER(first_name || '.' || COALESCE(middle_name || '.', '') || surname || '@school.com')
WHERE middle_name IS NOT NULL AND middle_name != '';

-- Clean up any double dots in email addresses
UPDATE students 
SET email = REPLACE(email, '..', '.');

-- Verify the email updates
SELECT id, roll_no, first_name, middle_name, surname, email, class 
FROM students 
ORDER BY class, roll_no;

-- Show sample login credentials for testing
SELECT 
  'Student Login Credentials:' as info,
  email as username,
  'student123' as password,
  first_name || ' ' || COALESCE(middle_name || ' ', '') || surname as full_name,
  class
FROM students 
WHERE status = 'Active'
ORDER BY class, roll_no
LIMIT 10;
