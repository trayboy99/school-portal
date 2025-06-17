-- 1. First, let's check what's in the students table
SELECT 
    id,
    first_name,
    surname,
    class,
    section,
    status,
    created_at
FROM students 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check what's in the classes table
SELECT 
    id,
    name,
    section,
    current_students,
    max_students,
    status,
    created_at
FROM classes 
ORDER BY created_at DESC;

-- 3. Check if there's a class_id column in students table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- 4. Check if the trigger function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%student%' OR routine_name LIKE '%class%';

-- 5. Check if triggers exist
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('students', 'classes');

-- 6. Try to manually count students per class based on class name matching
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.section as class_section,
    c.current_students as db_count,
    COUNT(s.id) as actual_count
FROM classes c
LEFT JOIN students s ON s.class = c.name AND s.section = c.section AND s.status = 'Active'
WHERE c.status = 'Active'
GROUP BY c.id, c.name, c.section, c.current_students
ORDER BY c.name;

-- 7. Show any mismatches
SELECT 
    c.name as class_name,
    c.section,
    c.current_students as database_count,
    COUNT(s.id) as actual_student_count,
    (COUNT(s.id) - c.current_students) as difference
FROM classes c
LEFT JOIN students s ON s.class = c.name AND s.section = c.section AND s.status = 'Active'
WHERE c.status = 'Active'
GROUP BY c.id, c.name, c.section, c.current_students
HAVING COUNT(s.id) != c.current_students
ORDER BY difference DESC;
