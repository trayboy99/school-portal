-- Fix the student class relationship and update counts

-- Step 1: Add class_id column to students table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'class_id'
    ) THEN
        ALTER TABLE students ADD COLUMN class_id INTEGER;
        CREATE INDEX idx_students_class_id ON students(class_id);
    END IF;
END $$;

-- Step 2: Update students.class_id to reference the actual classes
UPDATE students 
SET class_id = c.id
FROM classes c 
WHERE students.class = c.name 
  AND students.section = c.section
  AND students.class_id IS NULL;

-- Step 3: Add foreign key constraint (optional, but recommended)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_students_class_id'
    ) THEN
        ALTER TABLE students 
        ADD CONSTRAINT fk_students_class_id 
        FOREIGN KEY (class_id) REFERENCES classes(id);
    END IF;
END $$;

-- Step 4: Create or replace the function to update class student counts
CREATE OR REPLACE FUNCTION update_class_student_counts()
RETURNS VOID AS $$
BEGIN
    -- Update current_students count for all classes based on actual student data
    UPDATE classes 
    SET current_students = (
        SELECT COUNT(*) 
        FROM students 
        WHERE students.class_id = classes.id 
        AND students.status = 'Active'
    ),
    updated_at = NOW()
    WHERE status = 'Active';
    
    RAISE NOTICE 'Updated student counts for all classes';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create or replace trigger function for automatic updates
CREATE OR REPLACE FUNCTION trigger_update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.class_id IS NOT NULL AND NEW.status = 'Active' THEN
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
        -- Update old class count if class changed or status changed
        IF OLD.class_id IS NOT NULL AND (
            OLD.class_id != COALESCE(NEW.class_id, -1) OR 
            OLD.status != NEW.status
        ) THEN
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

-- Step 6: Create the trigger
DROP TRIGGER IF EXISTS update_class_student_count_trigger ON students;
CREATE TRIGGER update_class_student_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_class_student_count();

-- Step 7: Run the function to update all counts immediately
SELECT update_class_student_counts();

-- Step 8: Verify the results
SELECT 
    c.id,
    c.name,
    c.section,
    c.current_students as database_count,
    COUNT(s.id) as actual_count,
    CASE 
        WHEN c.current_students = COUNT(s.id) THEN '✅ Match'
        ELSE '❌ Mismatch'
    END as status
FROM classes c
LEFT JOIN students s ON s.class_id = c.id AND s.status = 'Active'
WHERE c.status = 'Active'
GROUP BY c.id, c.name, c.section, c.current_students
ORDER BY c.name;

-- Step 9: Show summary
SELECT 
    'Total Classes' as metric,
    COUNT(*) as count
FROM classes WHERE status = 'Active'
UNION ALL
SELECT 
    'Total Students' as metric,
    COUNT(*) as count
FROM students WHERE status = 'Active'
UNION ALL
SELECT 
    'Students with Class Assignment' as metric,
    COUNT(*) as count
FROM students WHERE status = 'Active' AND class_id IS NOT NULL
UNION ALL
SELECT 
    'Classes with Students' as metric,
    COUNT(*) as count
FROM classes WHERE status = 'Active' AND current_students > 0;
