-- First, check what the current status constraint allows
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass 
AND contype = 'c' 
AND conname LIKE '%status%';

-- Drop any existing status constraints
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'students'::regclass 
        AND contype = 'c' 
        AND conname LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE students DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- Update any existing records to use proper status values
UPDATE students 
SET status = CASE 
    WHEN LOWER(status) = 'active' THEN 'Active'
    WHEN LOWER(status) = 'inactive' THEN 'Inactive'
    WHEN LOWER(status) = 'suspended' THEN 'Suspended'
    WHEN LOWER(status) = 'graduated' THEN 'Graduated'
    WHEN LOWER(status) = 'transferred' THEN 'Transferred'
    WHEN LOWER(status) = 'withdrawn' THEN 'Withdrawn'
    ELSE 'Active'
END
WHERE status IS NOT NULL;

-- Set default status for any NULL values
UPDATE students 
SET status = 'Active' 
WHERE status IS NULL;

-- Create the new status constraint with exact case-sensitive values
ALTER TABLE students 
ADD CONSTRAINT students_status_check 
CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Graduated', 'Transferred', 'Withdrawn'));

-- Verify the constraint was created correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'students'::regclass 
AND contype = 'c' 
AND conname = 'students_status_check';

-- Test the constraint by trying to insert an invalid status (this should fail)
DO $$
BEGIN
    BEGIN
        INSERT INTO students (first_name, surname, username, status, current_class, section, reg_number) 
        VALUES ('Test', 'User', 'test.invalid.status', 'invalid_status', 'Test Class', 'A', 'REG2025999');
        RAISE EXCEPTION 'Constraint test failed - invalid status was accepted';
    EXCEPTION 
        WHEN check_violation THEN
            RAISE NOTICE 'SUCCESS: Constraint properly rejected invalid status';
            -- Clean up the test if it somehow got inserted
            DELETE FROM students WHERE username = 'test.invalid.status';
    END;
END $$;

-- Show current status distribution
SELECT status, COUNT(*) as count
FROM students 
GROUP BY status
ORDER BY status;

-- Show sample of updated records
SELECT id, first_name, surname, username, status, reg_number
FROM students 
LIMIT 5;
