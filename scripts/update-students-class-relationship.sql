-- First, let's check the current classes in the database
SELECT id, name, category, section, current_students FROM classes ORDER BY id;

-- Check if students table has a class_id column that references classes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' AND column_name LIKE '%class%';

-- If the students table doesn't have proper class reference, let's add it
-- Add class_id column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'class_id'
    ) THEN
        ALTER TABLE students ADD COLUMN class_id INTEGER REFERENCES classes(id);
        CREATE INDEX idx_students_class_id ON students(class_id);
    END IF;
END $$;

-- Update the existing students to reference actual classes
-- First, let's see what classes we have
WITH class_mapping AS (
    SELECT 
        id,
        name,
        section,
        ROW_NUMBER() OVER (ORDER BY id) as row_num
    FROM classes 
    WHERE status = 'Active'
)
SELECT * FROM class_mapping;

-- Update students to reference real classes based on their current class field
-- This is a sample update - adjust based on your actual data
UPDATE students 
SET class_id = (
    SELECT c.id 
    FROM classes c 
    WHERE c.name = students.class 
    AND c.section = students.section
    LIMIT 1
)
WHERE class_id IS NULL;

-- Create a function to automatically update class student counts
CREATE OR REPLACE FUNCTION update_class_student_counts()
RETURNS VOID AS $$
BEGIN
    -- Update current_students count for all classes
    UPDATE classes 
    SET current_students = (
        SELECT COUNT(*) 
        FROM students 
        WHERE students.class_id = classes.id 
        AND students.status = 'Active'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Run the function to update all counts
SELECT update_class_student_counts();

-- Create a trigger to automatically update class counts when students are added/removed/updated
CREATE OR REPLACE FUNCTION trigger_update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.class_id IS NOT NULL THEN
            UPDATE classes 
            SET current_students = (
                SELECT COUNT(*) 
                FROM students 
                WHERE class_id = NEW.class_id AND status = 'Active'
            ),
            updated_at = NOW()
            WHERE id = NEW.class_id;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Update old class count if class changed
        IF OLD.class_id IS NOT NULL AND OLD.class_id != COALESCE(NEW.class_id, -1) THEN
            UPDATE classes 
            SET current_students = (
                SELECT COUNT(*) 
                FROM students 
                WHERE class_id = OLD.class_id AND status = 'Active'
            ),
            updated_at = NOW()
            WHERE id = OLD.class_id;
        END IF;
        
        -- Update new class count
        IF NEW.class_id IS NOT NULL THEN
            UPDATE classes 
            SET current_students = (
                SELECT COUNT(*) 
                FROM students 
                WHERE class_id = NEW.class_id AND status = 'Active'
            ),
            updated_at = NOW()
            WHERE id = NEW.class_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.class_id IS NOT NULL THEN
            UPDATE classes 
            SET current_students = (
                SELECT COUNT(*) 
                FROM students 
                WHERE class_id = OLD.class_id AND status = 'Active'
            ),
            updated_at = NOW()
            WHERE id = OLD.class_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_class_student_count_trigger ON students;
CREATE TRIGGER update_class_student_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_class_student_count();

-- Verify the results
SELECT 
    c.id,
    c.name,
    c.section,
    c.current_students,
    c.max_students,
    ROUND((c.current_students::DECIMAL / c.max_students::DECIMAL) * 100, 2) as utilization_percent
FROM classes c
ORDER BY c.name;

-- Show students and their assigned classes
SELECT 
    s.id,
    s.first_name || ' ' || s.surname as student_name,
    s.class as original_class,
    s.section,
    c.name as assigned_class_name,
    c.id as class_id
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
ORDER BY c.name, s.first_name;
