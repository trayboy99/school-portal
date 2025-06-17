-- Script to update all existing grades in student_exams table to match the correct grading system
-- This will recalculate grades based on percentage and update all existing records

-- First, let's see what we're working with
SELECT 
    'Before Update - Grade Distribution' as status,
    grade,
    COUNT(*) as count,
    ROUND(AVG(total), 2) as avg_score
FROM student_exams 
GROUP BY grade 
ORDER BY grade;

-- Update all existing grades based on correct percentage calculation
UPDATE student_exams 
SET 
    grade = CASE 
        -- Calculate percentage based on exam type (midterm=40, terminal=100)
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 80 THEN 'A'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 70 THEN 'B'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 60 THEN 'C'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 50 THEN 'D'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 40 THEN 'E'
        
        ELSE 'F'
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    -- Only update records where the grade would actually change
    grade != CASE 
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 80 THEN 'A'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 70 THEN 'B'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 60 THEN 'C'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 50 THEN 'D'
        
        WHEN (
            total::DECIMAL / 
            CASE 
                WHEN (SELECT mark_type FROM exams WHERE id = student_exams.exam_id) = 'midterm' 
                THEN 40.0 
                ELSE 100.0 
            END
        ) * 100 >= 40 THEN 'E'
        
        ELSE 'F'
    END;

-- Show the results after update
SELECT 
    'After Update - Grade Distribution' as status,
    grade,
    COUNT(*) as count,
    ROUND(AVG(total), 2) as avg_score
FROM student_exams 
GROUP BY grade 
ORDER BY grade;

-- Show detailed breakdown by exam type
SELECT 
    'Detailed Breakdown by Exam Type' as status,
    e.mark_type,
    se.grade,
    COUNT(*) as count,
    ROUND(AVG(se.total), 2) as avg_score,
    ROUND(AVG(
        CASE 
            WHEN e.mark_type = 'midterm' THEN (se.total::DECIMAL / 40.0) * 100
            ELSE (se.total::DECIMAL / 100.0) * 100
        END
    ), 2) as avg_percentage
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
GROUP BY e.mark_type, se.grade
ORDER BY e.mark_type, se.grade;

-- Show specific examples of grade changes
SELECT 
    'Sample Records with Corrected Grades' as status,
    se.id,
    s.first_name || ' ' || s.last_name as student_name,
    sub.subject_name,
    e.exam_name,
    e.mark_type,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    CASE 
        WHEN e.mark_type = 'midterm' THEN ROUND((se.total::DECIMAL / 40.0) * 100, 1)
        ELSE ROUND((se.total::DECIMAL / 100.0) * 100, 1)
    END as percentage,
    se.grade as current_grade
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects sub ON se.subject_id = sub.id
JOIN exams e ON se.exam_id = e.id
ORDER BY se.updated_at DESC
LIMIT 10;

-- Summary of changes made
SELECT 
    'Update Summary' as status,
    COUNT(*) as total_records_updated,
    MIN(updated_at) as first_update,
    MAX(updated_at) as last_update
FROM student_exams 
WHERE updated_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute';
