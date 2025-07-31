-- Update the current_students count in classes table based on actual student data
-- This script counts students in each class and updates the classes table

-- First, let's see what we have
SELECT 
  c.id,
  c.class_name,
  c.section,
  c.current_students as old_count,
  COUNT(s.id) as actual_count
FROM classes c
LEFT JOIN students s ON (
  s.current_class = CONCAT(c.class_name, ' ', c.section) OR
  s.current_class = c.class_name
) AND s.status = 'active'
GROUP BY c.id, c.class_name, c.section, c.current_students
ORDER BY c.class_name, c.section;

-- Update the current_students count for each class
-- Method 1: Update based on exact match (class_name + section)
UPDATE classes 
SET current_students = (
  SELECT COUNT(*)
  FROM students 
  WHERE students.current_class = CONCAT(classes.class_name, ' ', classes.section)
  AND students.status = 'active'
);

-- Method 2: Update based on class_name only (if students don't have section in current_class)
UPDATE classes 
SET current_students = (
  SELECT COUNT(*)
  FROM students 
  WHERE students.current_class = classes.class_name
  AND students.status = 'active'
)
WHERE current_students = 0;

-- Method 3: Update based on partial matching
UPDATE classes 
SET current_students = (
  SELECT COUNT(*)
  FROM students 
  WHERE students.current_class ILIKE CONCAT('%', classes.class_name, '%')
  AND students.status = 'active'
)
WHERE current_students = 0;

-- Verify the updates (fixed ROUND function)
SELECT 
  c.id,
  c.class_name,
  c.section,
  c.current_students,
  c.max_students,
  ROUND((c.current_students::numeric / c.max_students::numeric) * 100, 1) as occupancy_percentage
FROM classes c
WHERE c.status = 'active'
ORDER BY c.class_name, c.section;

-- Show students and their current_class values for debugging
SELECT 
  id,
  first_name,
  surname,
  current_class,
  section,
  status
FROM students 
WHERE status = 'active'
ORDER BY current_class, first_name;
