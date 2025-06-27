-- First, find Mary Grace Johnson's teacher_id
SELECT id, first_name, middle_name, surname 
FROM teachers 
WHERE CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', surname) ILIKE '%Mary Grace Johnson%'
   OR CONCAT(first_name, ' ', surname) ILIKE '%Mary Grace Johnson%';

-- Update status for Mary Grace Johnson's uploads using teacher_id
-- Replace 'X' with the actual teacher_id from the query above
UPDATE uploads 
SET status = 'submitted'
WHERE teacher_id IN (
  SELECT id FROM teachers 
  WHERE CONCAT(first_name, ' ', COALESCE(middle_name, ''), ' ', surname) ILIKE '%Mary Grace Johnson%'
     OR CONCAT(first_name, ' ', surname) ILIKE '%Mary Grace Johnson%'
) 
AND class_name = 'JSS2' 
AND upload_type IN ('exam_questions', 'e_notes');

-- Verify the updates
SELECT 
  u.id,
  CONCAT(t.first_name, ' ', COALESCE(t.middle_name, ''), ' ', t.surname) as teacher_name,
  u.class_name,
  u.subject_name,
  u.upload_type,
  u.status,
  u.uploaded_at
FROM uploads u
JOIN teachers t ON u.teacher_id = t.id
WHERE CONCAT(t.first_name, ' ', COALESCE(t.middle_name, ''), ' ', t.surname) ILIKE '%Mary Grace Johnson%'
   OR CONCAT(t.first_name, ' ', t.surname) ILIKE '%Mary Grace Johnson%';
