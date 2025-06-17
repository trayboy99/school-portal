-- Verify the grade calculation is working correctly
SELECT 
    se.id,
    se.exam_id,
    e.exam_name,
    e.mark_type,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    se.grade as current_grade,
    CASE 
        WHEN e.mark_type = 'midterm' THEN
            CASE 
                WHEN (se.total::DECIMAL / 40.0) * 100 >= 80 THEN 'A'
                WHEN (se.total::DECIMAL / 40.0) * 100 >= 70 THEN 'B'
                WHEN (se.total::DECIMAL / 40.0) * 100 >= 60 THEN 'C'
                WHEN (se.total::DECIMAL / 40.0) * 100 >= 50 THEN 'D'
                WHEN (se.total::DECIMAL / 40.0) * 100 >= 40 THEN 'E'
                ELSE 'F'
            END
        ELSE -- terminal
            CASE 
                WHEN (se.total::DECIMAL / 100.0) * 100 >= 80 THEN 'A'
                WHEN (se.total::DECIMAL / 100.0) * 100 >= 70 THEN 'B'
                WHEN (se.total::DECIMAL / 100.0) * 100 >= 60 THEN 'C'
                WHEN (se.total::DECIMAL / 100.0) * 100 >= 50 THEN 'D'
                WHEN (se.total::DECIMAL / 100.0) * 100 >= 40 THEN 'E'
                ELSE 'F'
            END
    END as expected_grade,
    CASE 
        WHEN e.mark_type = 'midterm' THEN 
            ROUND((se.total::DECIMAL / 40.0) * 100, 2)
        ELSE 
            ROUND((se.total::DECIMAL / 100.0) * 100, 2)
    END as percentage
FROM student_exams se
JOIN exams e ON se.exam_id = e.id
ORDER BY se.id;
