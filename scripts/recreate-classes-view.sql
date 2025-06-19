-- Recreate the classes_with_details view if needed
DROP VIEW IF EXISTS classes_with_details;

CREATE OR REPLACE VIEW classes_with_details AS
SELECT 
    c.id,
    c.name,
    c.category,
    c.academic_year,
    c.section,
    c.teacher_id,
    c.teacher_name,
    c.max_students,
    c.current_students,
    c.subjects_count,
    c.room,
    c.status,
    c.description,
    c.created_at,
    c.updated_at,
    -- Calculate capacity utilization percentage
    CASE 
        WHEN c.max_students > 0 THEN 
            ROUND((c.current_students::DECIMAL / c.max_students::DECIMAL) * 100, 2)
        ELSE 0 
    END as capacity_utilization_percent
FROM classes c
WHERE c.status = 'Active'
ORDER BY c.category, c.name;

-- Verify the view was created
SELECT 'Classes view recreated successfully' as status;
SELECT * FROM classes_with_details LIMIT 3;
