-- Check what exams exist for JSS2 class
SELECT 
    id,
    exam_name,
    mark_type,
    class,
    term,
    year,
    session,
    created_at
FROM exams 
WHERE class = 'JSS2'
ORDER BY id;

-- Check if there are any student exam results for JSS2 students
SELECT 
    se.id,
    se.exam_id,
    se.student_id,
    se.subject_id,
    se.ca1,
    se.ca2,
    se.exam,
    se.total,
    se.grade,
    s.first_name,
    s.last_name,
    s.class,
    sub.subject_name,
    e.exam_name,
    e.mark_type
FROM student_exams se
JOIN students s ON se.student_id = s.id
JOIN subjects sub ON se.subject_id = sub.id
JOIN exams e ON se.exam_id = e.id
WHERE s.class = 'JSS2'
ORDER BY se.exam_id, se.student_id, se.subject_id;

-- Check specific exam IDs 4 and 5
SELECT 
    id,
    exam_name,
    mark_type,
    class,
    term,
    year,
    session
FROM exams 
WHERE id IN (4, 5);
