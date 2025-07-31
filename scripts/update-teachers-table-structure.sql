-- Add missing columns to teachers table if they don't exist

-- Add avatar field for teacher photo
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Add personal information fields
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

-- Add professional information fields  
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS qualification VARCHAR(255);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS salary VARCHAR(100);

-- Add emergency contact fields
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);

-- Check the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;
