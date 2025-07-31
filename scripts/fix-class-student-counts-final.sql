-- First, let's see what we're working with
SELECT 'Current classes table data:' as info;
SELECT id, class_name, section, current_students, max_students FROM classes ORDER BY id;

SELECT 'Current students table data:' as info;
SELECT id, first_name, surname, current_class FROM students WHERE status = 'active' ORDER BY current_class;

-- Update each class individually based on your data
-- JSS 1 Gold (assuming students are assigned to this class)
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 1 Gold' 
        OR current_class = 'JSS 1' 
        OR current_class ILIKE '%JSS 1%Gold%'
        OR (current_class ILIKE '%JSS 1%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'JSS 1' AND section = 'Gold';

-- JSS 1 Silver
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 1 Silver' 
        OR (current_class ILIKE '%JSS 1%' AND current_class ILIKE '%Silver%')
    )
)
WHERE class_name = 'JSS 1' AND section = 'Silver';

-- JSS 1 Bronze
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 1 Bronze' 
        OR (current_class ILIKE '%JSS 1%' AND current_class ILIKE '%Bronze%')
    )
)
WHERE class_name = 'JSS 1' AND section = 'Bronze';

-- JSS 2 Gold
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 2 Gold' 
        OR (current_class ILIKE '%JSS 2%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'JSS 2' AND section = 'Gold';

-- JSS 2 Silver
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 2 Silver' 
        OR (current_class ILIKE '%JSS 2%' AND current_class ILIKE '%Silver%')
    )
)
WHERE class_name = 'JSS 2' AND section = 'Silver';

-- JSS 3 Gold
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'JSS 3 Gold' 
        OR (current_class ILIKE '%JSS 3%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'JSS 3' AND section = 'Gold';

-- SSS 1 Gold
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'SSS 1 Gold' 
        OR (current_class ILIKE '%SSS 1%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'SSS 1' AND section = 'Gold';

-- SSS 1 Silver
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'SSS 1 Silver' 
        OR (current_class ILIKE '%SSS 1%' AND current_class ILIKE '%Silver%')
    )
)
WHERE class_name = 'SSS 1' AND section = 'Silver';

-- SSS 2 Gold
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'SSS 2 Gold' 
        OR (current_class ILIKE '%SSS 2%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'SSS 2' AND section = 'Gold';

-- SSS 3 Gold
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'SSS 3 Gold' 
        OR (current_class ILIKE '%SSS 3%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'SSS 3' AND section = 'Gold';

-- SS 3 Gold (the one with different academic year format)
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = 'SS 3 Gold' 
        OR (current_class ILIKE '%SS 3%' AND current_class ILIKE '%Gold%')
    )
)
WHERE class_name = 'SS 3' AND section = 'Gold';

-- Generic update for any remaining classes
UPDATE classes 
SET current_students = (
    SELECT COUNT(*) 
    FROM students 
    WHERE status = 'active' 
    AND (
        current_class = CONCAT(classes.class_name, ' ', classes.section)
        OR current_class ILIKE CONCAT('%', classes.class_name, '%', classes.section, '%')
        OR current_class ILIKE CONCAT('%', classes.class_name, '%')
    )
)
WHERE current_students = 0;

-- Show results
SELECT 'Updated classes table:' as info;
SELECT 
    id, 
    class_name, 
    section, 
    CONCAT(class_name, ' ', section) as full_class_name,
    current_students, 
    max_students,
    CASE 
        WHEN max_students > 0 THEN ROUND((current_students::numeric / max_students::numeric) * 100, 1)
        ELSE 0 
    END as occupancy_percentage
FROM classes 
ORDER BY id;

-- Show total student count
SELECT 'Total students across all classes:' as info;
SELECT SUM(current_students) as total_students FROM classes;

-- Show which students are assigned to which classes
SELECT 'Student assignments:' as info;
SELECT 
    current_class,
    COUNT(*) as student_count,
    STRING_AGG(CONCAT(first_name, ' ', surname), ', ') as students
FROM students 
WHERE status = 'active' 
GROUP BY current_class 
ORDER BY current_class;
