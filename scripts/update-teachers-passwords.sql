-- Update Teachers Table Password Structure
-- This script will standardize the password storage and set passwords for all teachers

BEGIN;

-- First, let's see what we currently have
SELECT 'Current teacher passwords:' as info;
SELECT username, password_hash, custom_password FROM teachers;

-- Add a new 'password' column if it doesn't exist
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update the password column with the correct passwords for each teacher
UPDATE teachers SET password = 'teacher123' WHERE username = 'john.smith';
UPDATE teachers SET password = 'teacher123' WHERE username = 'mary.johnson';
UPDATE teachers SET password = 'teacher123' WHERE username = 'david.wilson';
UPDATE teachers SET password = 'teacher123' WHERE username = 'sarah.okafor';
UPDATE teachers SET password = 'teacher123' WHERE username = 'test.teacher';

-- Remove the old password columns to avoid confusion
ALTER TABLE teachers DROP COLUMN IF EXISTS password_hash;
ALTER TABLE teachers DROP COLUMN IF EXISTS custom_password;

-- Verify the updates
SELECT 'Updated teacher passwords:' as info;
SELECT username, password, first_name, surname, department FROM teachers ORDER BY username;

-- Show final table structure
SELECT 'Teachers table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;

-- Final verification query
SELECT 
  username,
  password,
  CONCAT(first_name, ' ', surname) as full_name,
  department,
  status
FROM teachers 
WHERE password IS NOT NULL
ORDER BY username;
