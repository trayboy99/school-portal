-- First, let's check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'students_status_check';

-- Drop the existing constraint if it exists
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check;

-- Add the correct constraint with proper status values
ALTER TABLE students ADD CONSTRAINT students_status_check 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated', 'Transferred', 'Withdrawn'));

-- Update any existing records that might have invalid status values
UPDATE students 
SET status = 'Active' 
WHERE status IS NULL OR status NOT IN ('Active', 'Inactive', 'Suspended', 'Graduated', 'Transferred', 'Withdrawn');

-- Verify the constraint is working
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'students_status_check';

-- Show current status values in the table
SELECT DISTINCT status, COUNT(*) as count
FROM students 
GROUP BY status
ORDER BY status;
