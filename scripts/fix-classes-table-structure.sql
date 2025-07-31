-- Add missing columns to classes table
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'category'
    ) THEN
        ALTER TABLE classes ADD COLUMN category VARCHAR(50);
    END IF;

    -- Add teacher_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'teacher_name'
    ) THEN
        ALTER TABLE classes ADD COLUMN teacher_name VARCHAR(255);
    END IF;

    -- Add subjects_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'subjects_count'
    ) THEN
        ALTER TABLE classes ADD COLUMN subjects_count INTEGER DEFAULT 0;
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'classes' AND column_name = 'description'
    ) THEN
        ALTER TABLE classes ADD COLUMN description TEXT;
    END IF;
END $$;

-- Update existing classes with sample data
UPDATE classes SET category = 'Junior' WHERE class_name LIKE 'JSS%';
UPDATE classes SET category = 'Senior' WHERE class_name LIKE 'SSS%';

-- Update teacher names based on class_teacher_id
UPDATE classes 
SET teacher_name = CONCAT(t.first_name, ' ', COALESCE(t.middle_name, ''), ' ', t.surname)
FROM teachers t 
WHERE classes.class_teacher_id::text = t.id::text;

-- Set default subjects count
UPDATE classes SET subjects_count = 8 WHERE subjects_count IS NULL;

-- Verify the updates
SELECT id, class_name, category, section, teacher_name, subjects_count FROM classes;
