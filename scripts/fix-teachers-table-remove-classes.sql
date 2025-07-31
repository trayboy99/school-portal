-- Remove the classes column from teachers table
ALTER TABLE teachers DROP COLUMN IF EXISTS classes;

-- Update the teachers table structure to match what we actually need
-- (This ensures the table structure is clean and consistent)

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

SELECT 'Teachers table updated - classes column removed successfully!' as status;
