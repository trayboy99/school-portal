-- Check if assignments table exists and what data it contains
SELECT 'assignments_table_exists' as check_type, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') 
            THEN 'YES' ELSE 'NO' END as result;

-- Check total assignments in database
SELECT 'total_assignments' as check_type, COUNT(*) as result FROM assignments;

-- Check what classes have assignments
SELECT 'classes_with_assignments' as check_type, class_name, COUNT(*) as assignment_count 
FROM assignments 
GROUP BY class_name 
ORDER BY class_name;

-- Check if JSS 2 has any assignments
SELECT 'jss2_assignments' as check_type, COUNT(*) as result 
FROM assignments 
WHERE class_name = 'JSS 2';

-- Show all assignments for JSS 2 if any exist
SELECT 'jss2_assignment_details' as check_type, * 
FROM assignments 
WHERE class_name = 'JSS 2' 
ORDER BY due_date;

-- Check what teachers exist for creating assignments
SELECT 'available_teachers' as check_type, id, first_name, middle_name, surname 
FROM teachers 
ORDER BY first_name;

-- Check what subjects exist for JSS 2
SELECT 'jss2_subjects' as check_type, name as subject_name, teacher_name 
FROM subjects 
WHERE target_class = 'JSS 2' 
ORDER BY name;
