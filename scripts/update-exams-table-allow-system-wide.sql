-- Update exams table to support system-wide exams
-- This allows exams to be created for all classes or specific classes

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exams' 
ORDER BY ordinal_position;

-- Add class column if it doesn't exist
ALTER TABLE exams ADD COLUMN IF NOT EXISTS class VARCHAR(50);

-- Update existing exams that have NULL or empty class to 'ALL'
UPDATE exams 
SET class = 'ALL' 
WHERE class IS NULL OR class = '';

-- Modify the class column to allow 'ALL' as a value for system-wide exams
ALTER TABLE exams 
ALTER COLUMN class SET DEFAULT 'ALL';

-- Add a check constraint to ensure class is either a valid class name or 'ALL'
ALTER TABLE exams 
ADD CONSTRAINT check_exam_class 
CHECK (class = 'ALL' OR class IN (
  SELECT DISTINCT class FROM classes
) OR class ~ '^[A-Z]+[0-9]+[A-Z]*$');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(class);
CREATE INDEX IF NOT EXISTS idx_exams_term_year ON exams(term, year);
CREATE INDEX IF NOT EXISTS idx_exams_mark_type ON exams(mark_type);

-- Create an index for better performance when filtering by subject
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);

-- Create an index for better performance when filtering by exam_type
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(exam_type);

-- Create an index for better performance when filtering by exam_name
CREATE INDEX IF NOT EXISTS idx_exams_exam_name ON exams(exam_name);

-- Create an index for better performance when filtering by mark_type
CREATE INDEX IF NOT EXISTS idx_exams_mark_type ON exams(mark_type);

-- Update any existing system-wide exams
UPDATE exams SET class = 'ALL' WHERE exam_name LIKE '%System%' OR exam_name LIKE '%School%';

-- Add some sample system-wide exams if they don't exist
INSERT INTO exams (name, subject, exam_type, class, total_marks, date, created_at)
SELECT 'Mid-Term Mathematics', 'Mathematics', 'Mid-Term', 'ALL', 100, '2024-02-15', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM exams WHERE name = 'Mid-Term Mathematics' AND class = 'ALL'
);

INSERT INTO exams (name, subject, exam_type, class, total_marks, date, created_at)
SELECT 'Final English Examination', 'English', 'Final', 'ALL', 100, '2024-03-20', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM exams WHERE name = 'Final English Examination' AND class = 'ALL'
);

INSERT INTO exams (name, subject, exam_type, class, total_marks, date, created_at)
SELECT 'Science Quiz', 'Science', 'Quiz', 'ALL', 50, '2024-02-28', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM exams WHERE name = 'Science Quiz' AND class = 'ALL'
);

-- Make the class column nullable so we can have system-wide exams
ALTER TABLE exams ALTER COLUMN class DROP NOT NULL;

-- Add a comment to clarify the purpose
COMMENT ON COLUMN exams.class IS 'Class for exam. NULL means exam is available system-wide for all classes.';

-- Verify the changes
SELECT * FROM exams ORDER BY id;

-- Show all exams with their class assignments
SELECT 
  id,
  name AS exam_name,
  subject,
  exam_type AS mark_type,
  class,
  total_marks AS session,
  date AS term,
  created_at
FROM exams 
ORDER BY 
  CASE WHEN class IS NULL THEN 0 ELSE 1 END,
  class,
  subject,
  created_at DESC;
