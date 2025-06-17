-- First, let's see what trigger functions exist
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'student_exams';

-- Check the current trigger function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%student_exam%';

-- Drop the existing problematic trigger and function
DROP TRIGGER IF EXISTS trigger_validate_and_update_student_exam ON student_exams;
DROP FUNCTION IF EXISTS validate_and_update_student_exam();

-- Create a new, correct trigger function
CREATE OR REPLACE FUNCTION calculate_student_exam_grade()
RETURNS TRIGGER AS $$
DECLARE
    exam_mark_type VARCHAR(20);
    total_percentage DECIMAL(5,2);
    max_total INTEGER;
BEGIN
    -- Get the exam type to determine max total
    SELECT mark_type INTO exam_mark_type FROM exams WHERE id = NEW.exam_id;
    
    -- Set max total based on exam type
    IF exam_mark_type = 'midterm' THEN
        max_total := 40;
        
        -- Validate midterm score limits
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 10) THEN
            RAISE EXCEPTION 'Midterm CA1 must be between 0 and 10, got %', NEW.ca1;
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 10) THEN
            RAISE EXCEPTION 'Midterm CA2 must be between 0 and 10, got %', NEW.ca2;
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 20) THEN
            RAISE EXCEPTION 'Midterm Exam must be between 0 and 20, got %', NEW.exam;
        END IF;
        
    ELSE -- terminal
        max_total := 100;
        
        -- Validate terminal score limits
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 20) THEN
            RAISE EXCEPTION 'Terminal CA1 must be between 0 and 20, got %', NEW.ca1;
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 20) THEN
            RAISE EXCEPTION 'Terminal CA2 must be between 0 and 20, got %', NEW.ca2;
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 60) THEN
            RAISE EXCEPTION 'Terminal Exam must be between 0 and 60, got %', NEW.exam;
        END IF;
    END IF;
    
    -- Calculate total if not provided
    NEW.total := COALESCE(NEW.ca1, 0) + COALESCE(NEW.ca2, 0) + COALESCE(NEW.exam, 0);
    
    -- Calculate percentage
    total_percentage := (NEW.total::DECIMAL / max_total::DECIMAL) * 100;
    
    -- Assign grade based on percentage (EXACT same logic as frontend)
    IF total_percentage >= 80 THEN
        NEW.grade := 'A';
    ELSIF total_percentage >= 70 THEN
        NEW.grade := 'B';
    ELSIF total_percentage >= 60 THEN
        NEW.grade := 'C';
    ELSIF total_percentage >= 50 THEN
        NEW.grade := 'D';
    ELSIF total_percentage >= 40 THEN
        NEW.grade := 'E';
    ELSE
        NEW.grade := 'F';
    END IF;
    
    -- Update timestamp
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    -- Debug: Log the calculation (remove this in production)
    RAISE NOTICE 'Score: %, Max: %, Percentage: %, Grade: %', NEW.total, max_total, total_percentage, NEW.grade;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_calculate_student_exam_grade
    BEFORE INSERT OR UPDATE ON student_exams
    FOR EACH ROW
    EXECUTE FUNCTION calculate_student_exam_grade();

-- Test the trigger with your specific case
INSERT INTO student_exams (exam_id, student_id, subject_id, ca1, ca2, exam) 
VALUES (
    (SELECT id FROM exams WHERE mark_type = 'midterm' LIMIT 1),
    (SELECT id FROM students LIMIT 1),
    (SELECT id FROM subjects LIMIT 1),
    10, 10, 18  -- This should give total=38, percentage=95%, grade=A
) 
ON CONFLICT (exam_id, student_id, subject_id) 
DO UPDATE SET 
    ca1 = EXCLUDED.ca1,
    ca2 = EXCLUDED.ca2,
    exam = EXCLUDED.exam;

-- Check the result
SELECT 
    'Test Result' as status,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    e.mark_type,
    ROUND((se.total::DECIMAL / 
        CASE WHEN e.mark_type = 'midterm' THEN 40.0 ELSE 100.0 END
    ) * 100, 2) as calculated_percentage,
    se.grade
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
WHERE se.total = 38;

-- Fix your existing 38/40 record
UPDATE student_exams 
SET grade = 'A', updated_at = CURRENT_TIMESTAMP
WHERE total = 38 
AND exam_id IN (SELECT id FROM exams WHERE mark_type = 'midterm');

-- Verify the fix
SELECT 
    'Your 38/40 Record Fixed' as status,
    se.id,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    ROUND((se.total::DECIMAL / 40.0) * 100, 1) as percentage,
    se.grade as corrected_grade
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
WHERE se.total = 38 AND e.mark_type = 'midterm';
