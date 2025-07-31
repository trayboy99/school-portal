-- First, let's see the current constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname LIKE '%teachers_status%';

-- Drop the existing constraint if it exists
ALTER TABLE teachers DROP CONSTRAINT IF EXISTS teachers_status_check;

-- Add the correct constraint
ALTER TABLE teachers ADD CONSTRAINT teachers_status_check 
CHECK (status IN ('active', 'inactive', 'suspended'));

-- Update any existing invalid status values to 'active'
UPDATE teachers 
SET status = 'active' 
WHERE status NOT IN ('active', 'inactive', 'suspended');
