-- Script to fix ALL existing midterm grades that are incorrect
-- This will update 36/40, 33/40, 32/40 and any other incorrect grades

-- First, let's see all current midterm records and their grades
SELECT 
    'Current Midterm Records' as status,
    se.id,
    s.first_name as student_name,
    sub.name as subject_name,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    ROUND((se.total::DECIMAL / 40.0) * 100, 1) as should_be_percentage,
    CASE 
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END as should_be_grade,
    se.grade as current_grade,
    CASE 
        WHEN se.grade != CASE 
            WHEN (se.total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
            WHEN (se.total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
            WHEN (se.total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
            WHEN (se.total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
            WHEN (se.total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
            ELSE 'F'
        END THEN 'NEEDS FIX'
        ELSE 'CORRECT'
    END as status
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects sub ON se.subject_id = sub.id
JOIN exams e ON se.exam_id = e.id
WHERE e.mark_type = 'midterm'
ORDER BY se.total DESC;

-- Show specifically the records you mentioned
SELECT 
    'Your Specific Records (36, 33, 32 out of 40)' as status,
    se.id,
    s.first_name as student_name,
    sub.name as subject_name,
    se.total,
    ROUND((se.total::DECIMAL / 40.0) * 100, 1) as percentage,
    se.grade as current_grade,
    CASE 
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END as should_be_grade
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects sub ON se.subject_id = sub.id
JOIN exams e ON se.exam_id = e.id
WHERE e.mark_type = 'midterm' 
AND se.total IN (36, 33, 32)
ORDER BY se.total DESC;

-- Update ALL midterm records with incorrect grades
UPDATE student_exams 
SET 
    grade = CASE 
        WHEN (total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
        WHEN (total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
        WHEN (total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
        WHEN (total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
        WHEN (total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE exam_id IN (SELECT id FROM exams WHERE mark_type = 'midterm')
AND grade != CASE 
    WHEN (total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
    WHEN (total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
    WHEN (total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
    WHEN (total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
    WHEN (total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
    ELSE 'F'
END;

-- Update ALL terminal records with incorrect grades
UPDATE student_exams 
SET 
    grade = CASE 
        WHEN (total::DECIMAL / 100.0) * 100 >= 80 THEN 'A'
        WHEN (total::DECIMAL / 100.0) * 100 >= 70 THEN 'B'
        WHEN (total::DECIMAL / 100.0) * 100 >= 60 THEN 'C'
        WHEN (total::DECIMAL / 100.0) * 100 >= 50 THEN 'D'
        WHEN (total::DECIMAL / 100.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE exam_id IN (SELECT id FROM exams WHERE mark_type = 'terminal')
AND grade != CASE 
    WHEN (total::DECIMAL / 100.0) * 100 >= 80 THEN 'A'
    WHEN (total::DECIMAL / 100.0) * 100 >= 70 THEN 'B'
    WHEN (total::DECIMAL / 100.0) * 100 >= 60 THEN 'C'
    WHEN (total::DECIMAL / 100.0) * 100 >= 50 THEN 'D'
    WHEN (total::DECIMAL / 100.0) * 100 >= 40 THEN 'E'
    ELSE 'F'
END;

-- Show how many records were updated
SELECT 
    'Update Summary' as status,
    COUNT(*) as total_records_updated
FROM student_exams 
WHERE updated_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute';

-- Verify your specific records are now fixed
SELECT 
    'FIXED: Your Specific Records (36, 33, 32 out of 40)' as status,
    se.id,
    s.first_name as student_name,
    sub.name as subject_name,
    se.total,
    ROUND((se.total::DECIMAL / 40.0) * 100, 1) as percentage,
    se.grade as corrected_grade
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects sub ON se.subject_id = sub.id
JOIN exams e ON se.exam_id = e.id
WHERE e.mark_type = 'midterm' 
AND se.total IN (36, 33, 32)
ORDER BY se.total DESC;

-- Show all midterm records after fix
SELECT 
    'All Midterm Records After Fix' as status,
    se.total,
    ROUND((se.total::DECIMAL / 40.0) * 100, 1) as percentage,
    se.grade,
    COUNT(*) as count
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
WHERE e.mark_type = 'midterm'
GROUP BY se.total, se.grade
ORDER BY se.total DESC;

-- Final verification - should show no incorrect grades
SELECT 
    'Verification: Any Remaining Incorrect Grades?' as status,
    COUNT(*) as incorrect_count
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
WHERE (
    (e.mark_type = 'midterm' AND se.grade != CASE 
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
        WHEN (se.total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END)
    OR
    (e.mark_type = 'terminal' AND se.grade != CASE 
        WHEN (se.total::DECIMAL / 100.0) * 100 >= 80 THEN 'A'
        WHEN (se.total::DECIMAL / 100.0) * 100 >= 70 THEN 'B'
        WHEN (se.total::DECIMAL / 100.0) * 100 >= 60 THEN 'C'
        WHEN (se.total::DECIMAL / 100.0) * 100 >= 50 THEN 'D'
        WHEN (se.total::DECIMAL / 100.0) * 100 >= 40 THEN 'E'
        ELSE 'F'
    END)
);
