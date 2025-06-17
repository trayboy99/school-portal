-- Fix the grade calculation trigger to match frontend logic
CREATE OR REPLACE FUNCTION validate_and_update_student_exam()
RETURNS TRIGGER AS $$
DECLARE
    exam_mark_type VARCHAR(20);
    total_percentage DECIMAL(5,2);
BEGIN
    SELECT mark_type INTO exam_mark_type FROM exams WHERE id = NEW.exam_id;
    
    -- Validate score limits based on exam type
    IF exam_mark_type = 'midterm' THEN
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 10) THEN
            RAISE EXCEPTION 'Midterm CA1 must be between 0 and 10';
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 10) THEN
            RAISE EXCEPTION 'Midterm CA2 must be between 0 and 10';
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 20) THEN
            RAISE EXCEPTION 'Midterm Exam must be between 0 and 20';
        END IF;
        
        -- Calculate percentage for midterm (total out of 40)
        total_percentage := (NEW.total::DECIMAL / 40.0) * 100;
        
    ELSE -- terminal
        IF NEW.ca1 IS NOT NULL AND (NEW.ca1 < 0 OR NEW.ca1 > 20) THEN
            RAISE EXCEPTION 'Terminal CA1 must be between 0 and 20';
        END IF;
        IF NEW.ca2 IS NOT NULL AND (NEW.ca2 < 0 OR NEW.ca2 > 20) THEN
            RAISE EXCEPTION 'Terminal CA2 must be between 0 and 20';
        END IF;
        IF NEW.exam IS NOT NULL AND (NEW.exam < 0 OR NEW.exam > 60) THEN
            RAISE EXCEPTION 'Terminal Exam must be between 0 and 60';
        END IF;
        
        -- Calculate percentage for terminal (total out of 100)
        total_percentage := (NEW.total::DECIMAL / 100.0) * 100;
    END IF;
    
    -- Assign grade based on percentage (same logic as frontend)
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
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS trigger_validate_and_update_student_exam ON student_exams;
CREATE TRIGGER trigger_validate_and_update_student_exam
    BEFORE INSERT OR UPDATE ON student_exams
    FOR EACH ROW
    EXECUTE FUNCTION validate_and_update_student_exam();

-- Update existing records with incorrect grades
UPDATE student_exams 
SET grade = CASE 
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 80 THEN 'A'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 70 THEN 'B'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 60 THEN 'C'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 50 THEN 'D'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 40 THEN 'E'
    ELSE 'F'
END,
updated_at = CURRENT_TIMESTAMP
WHERE grade != CASE 
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 80 THEN 'A'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 70 THEN 'B'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 60 THEN 'C'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 50 THEN 'D'
    WHEN (total::DECIMAL / CASE 
        WHEN (SELECT mark_type FROM exams WHERE id = exam_id) = 'midterm' THEN 40.0 
        ELSE 100.0 
    END) * 100 >= 40 THEN 'E'
    ELSE 'F'
END;
