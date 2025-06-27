-- Add parent contact columns to students table if they don't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);

-- Update existing students with mock parent contact information
UPDATE students SET 
    parent_email = CASE 
        WHEN parent_email IS NULL THEN 
            'parent.' || LOWER(first_name) || '.' || LOWER(surname) || '@email.com'
        ELSE parent_email 
    END,
    parent_phone = CASE 
        WHEN parent_phone IS NULL THEN 
            '+234 80' || (RANDOM() * 9)::INTEGER || ' ' || (RANDOM() * 899 + 100)::INTEGER || ' ' || (RANDOM() * 8999 + 1000)::INTEGER
        ELSE parent_phone 
    END,
    parent_name = CASE 
        WHEN parent_name IS NULL THEN 
            'Mr/Mrs ' || surname
        ELSE parent_name 
    END;

-- Verify the relationship works by checking teacher-class-student connections
SELECT 
    t.first_name || ' ' || t.surname as teacher_name,
    c.name as class_name,
    COUNT(s.id) as student_count
FROM teachers t
JOIN classes c ON c.teacher_id = t.id
LEFT JOIN students s ON s.class = c.name
GROUP BY t.id, t.first_name, t.surname, c.name
ORDER BY teacher_name, class_name;
