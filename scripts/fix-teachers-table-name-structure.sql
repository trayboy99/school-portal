-- Fix teachers table to have first_name, middle_name, and surname columns
-- This script will update the teachers table structure and existing data

-- First, let's check the current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

-- Add middle_name column if it doesn't exist
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);

-- Rename last_name to surname if last_name exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teachers' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE teachers RENAME COLUMN last_name TO surname;
    END IF;
END $$;

-- Add surname column if it doesn't exist (in case last_name didn't exist)
ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS surname VARCHAR(100);

-- Update existing teacher data to split names properly
-- This assumes current names might be in first_name field as "First Last" format
UPDATE teachers 
SET 
    middle_name = CASE 
        WHEN array_length(string_to_array(first_name, ' '), 1) = 3 THEN 
            split_part(first_name, ' ', 2)
        ELSE NULL 
    END,
    surname = CASE 
        WHEN array_length(string_to_array(first_name, ' '), 1) >= 2 THEN 
            split_part(first_name, ' ', -1)
        ELSE surname 
    END,
    first_name = split_part(first_name, ' ', 1)
WHERE first_name LIKE '% %' AND (surname IS NULL OR surname = '');

-- Update any teachers that might have empty names
UPDATE teachers 
SET 
    first_name = COALESCE(first_name, 'Unknown'),
    surname = COALESCE(surname, 'Teacher')
WHERE first_name IS NULL OR first_name = '' OR surname IS NULL OR surname = '';

-- Verify the structure after changes
SELECT 
    id,
    employee_id,
    first_name,
    middle_name,
    surname,
    email,
    department,
    status
FROM teachers 
ORDER BY id;

-- Show the final table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'teachers' 
AND column_name IN ('first_name', 'middle_name', 'surname')
ORDER BY ordinal_position;

COMMIT;
