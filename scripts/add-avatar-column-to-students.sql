-- Add avatar column to students table if it doesn't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '/placeholder.svg?height=40&width=40';

-- Update existing students with default avatar
UPDATE students 
SET avatar = '/placeholder.svg?height=40&width=40'
WHERE avatar IS NULL OR avatar = '';

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name = 'avatar';
