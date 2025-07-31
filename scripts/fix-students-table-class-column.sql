-- Add class column to students table if it doesn't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS class VARCHAR(50);

-- Update existing students to have class same as current_class
UPDATE students 
SET class = current_class
WHERE class IS NULL AND current_class IS NOT NULL;

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name IN ('class', 'current_class');
