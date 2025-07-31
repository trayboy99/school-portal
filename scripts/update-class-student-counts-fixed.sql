-- Update the current_students count in classes table based on actual student data
-- This script will properly count students and update the classes table

-- First, let's see what students we have and their current_class values
SELECT 
  current_class,
  COUNT(*) as student_count
FROM students 
WHERE status = 'active'
GROUP BY current_class
ORDER BY current_class;

-- Now let's see what classes we have
SELECT 
  id,
  class_name,
  section,
  CONCAT(class_name, ' ', section) as full_class_name,
  current_students
FROM classes
ORDER BY class_name, section;

-- Update current_students count for each class
-- This will match students based on their current_class field
UPDATE classes 
SET current_students = COALESCE((
  SELECT COUNT(*)::integer
  FROM students 
  WHERE students.status = 'active'
  AND (
    students.current_class = CONCAT(classes.class_name, ' ', classes.section) OR
    students.current_class = classes.class_name OR
    students.current_class ILIKE CONCAT('%', classes.class_name, '%')
  )
), 0);

-- Verify the updates
SELECT 
  c.id,
  c.class_name,
  c.section,
  c.current_students,
  c.max_students,
  CASE 
    WHEN c.max_students > 0 THEN 
      ROUND((c.current_students::numeric / c.max_students::numeric) * 100, 1)
    ELSE 0 
  END as occupancy_percentage
FROM classes c
WHERE c.status = 'active'
ORDER BY c.class_name, c.section;

-- Show the total count to verify
SELECT 
  SUM(current_students) as total_students_in_classes,
  (SELECT COUNT(*) FROM students WHERE status = 'active') as total_active_students
FROM classes 
WHERE status = 'active';
