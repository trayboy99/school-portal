-- Fix message delivery to teachers
-- This script ensures all messages sent to teachers appear in their inboxes

-- First, let's see what messages exist and their recipients
SELECT 
    m.id as message_id,
    m.subject,
    m.sender_name,
    mr.recipient_type,
    mr.recipient_name,
    mr.recipient_id
FROM messages m
JOIN message_recipients mr ON m.id = mr.message_id
WHERE mr.recipient_type = 'teacher'
ORDER BY m.created_at DESC;

-- Insert missing inbox entries for teachers
INSERT INTO user_message_inbox (user_id, user_type, message_id, folder, is_read)
SELECT DISTINCT
    mr.recipient_id,
    'teacher',
    mr.message_id,
    'inbox',
    false
FROM message_recipients mr
JOIN messages m ON mr.message_id = m.id
WHERE mr.recipient_type = 'teacher'
  AND mr.recipient_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM user_message_inbox umi 
    WHERE umi.user_id = mr.recipient_id 
      AND umi.user_type = 'teacher' 
      AND umi.message_id = mr.message_id 
      AND umi.folder = 'inbox'
  );

-- Show summary of what was fixed
SELECT 
    'Messages delivered to teacher inboxes' as status,
    COUNT(*) as messages_delivered
FROM user_message_inbox umi
JOIN message_recipients mr ON umi.message_id = mr.message_id
WHERE umi.user_type = 'teacher' 
  AND umi.folder = 'inbox'
  AND mr.recipient_type = 'teacher';

-- Show teachers and their message counts
SELECT 
    t.first_name || ' ' || COALESCE(t.middle_name || ' ', '') || t.surname as teacher_name,
    t.email,
    COUNT(umi.id) as inbox_messages,
    COUNT(CASE WHEN umi.is_read = false THEN 1 END) as unread_messages
FROM teachers t
LEFT JOIN user_message_inbox umi ON t.id = umi.user_id AND umi.user_type = 'teacher' AND umi.folder = 'inbox'
GROUP BY t.id, t.first_name, t.middle_name, t.surname, t.email
ORDER BY t.surname;
