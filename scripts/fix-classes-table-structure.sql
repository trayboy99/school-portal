-- Remove room column from classes table and verify structure
-- This script removes the room column and shows the correct structure

-- Drop the room column
ALTER TABLE classes DROP COLUMN IF EXISTS room;

-- Verify the classes table structure
SELECT 'CLASSES TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'classes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data with correct columns
SELECT 'SAMPLE CLASSES DATA:' as info;
SELECT 
    id,
    name,
    category,
    section,
    academic_year,
    teacher_name,
    max_students,
    current_students,
    subjects_count,
    status
FROM classes 
LIMIT 5;

-- Update current_students count based on actual students in database
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE students.class = classes.name 
    AND students.status = 'Active'
);

-- Update subjects_count based on actual subjects in database
UPDATE classes 
SET subjects_count = (
    SELECT COUNT(*) 
    FROM subjects 
    WHERE subjects.target_class = classes.name 
    AND subjects.status = 'Active'
);

-- Show updated counts
SELECT 'UPDATED CLASSES WITH CORRECT COUNTS:' as info;
SELECT 
    name as class_name,
    category,
    section,
    teacher_name,
    current_students,
    subjects_count,
    max_students,
    academic_year
FROM classes 
ORDER BY category, name;
