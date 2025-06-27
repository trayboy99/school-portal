-- Update status for Mary Grace Johnson's exam questions upload for JSS2
UPDATE uploads 
SET status = 'submitted'
WHERE teacher_name ILIKE '%Mary Grace Johnson%' 
  AND class_name = 'JSS2' 
  AND upload_type = 'exam_questions';

-- Let's also check what we updated
SELECT 
  id,
  teacher_name,
  class_name,
  subject_name,
  upload_type,
  status,
  uploaded_at
FROM uploads 
WHERE teacher_name ILIKE '%Mary Grace Johnson%' 
  AND class_name = 'JSS2' 
  AND upload_type = 'exam_questions';
