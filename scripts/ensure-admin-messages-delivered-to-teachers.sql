-- Ensure all admin messages are properly delivered to teacher inboxes

-- First, let's see what admin messages exist
SELECT 
    m.id,
    m.sender_name,
    m.subject,
    m.content,
    m.created_at,
    COUNT(mr.id) as recipient_count
FROM messages m
LEFT JOIN message_recipients mr ON m.id = mr.message_id
WHERE m.sender_type = 'admin'
GROUP BY m.id, m.sender_name, m.subject, m.content, m.created_at
ORDER BY m.created_at DESC;

-- Check which teachers exist
SELECT 
    id,
    first_name,
    middle_name,
    surname,
    email,
    status
FROM teachers
WHERE status = 'Active'
ORDER BY surname;

-- For each admin message, ensure it's delivered to ALL active teachers
-- First, let's get all admin messages that should be delivered to teachers
WITH admin_messages AS (
    SELECT id, sender_name, subject, content, created_at
    FROM messages 
    WHERE sender_type = 'admin'
),
active_teachers AS (
    SELECT id, first_name, middle_name, surname, email
    FROM teachers 
    WHERE status = 'Active'
)
-- Insert message recipients for admin messages to all teachers
INSERT INTO message_recipients (
    message_id,
    recipient_id,
    recipient_type,
    recipient_email,
    recipient_name,
    delivery_status
)
SELECT DISTINCT
    am.id,
    at.id,
    'teacher',
    at.email,
    at.first_name || ' ' || COALESCE(at.middle_name || ' ', '') || at.surname,
    'delivered'
FROM admin_messages am
CROSS JOIN active_teachers at
WHERE NOT EXISTS (
    SELECT 1 
    FROM message_recipients mr 
    WHERE mr.message_id = am.id 
      AND mr.recipient_id = at.id 
      AND mr.recipient_type = 'teacher'
);

-- Now ensure all admin messages appear in teacher inboxes
WITH admin_messages AS (
    SELECT id FROM messages WHERE sender_type = 'admin'
),
active_teachers AS (
    SELECT id FROM teachers WHERE status = 'Active'
)
INSERT INTO user_message_inbox (
    user_id,
    user_type,
    message_id,
    folder,
    is_read
)
SELECT DISTINCT
    at.id,
    'teacher',
    am.id,
    'inbox',
    false
FROM admin_messages am
CROSS JOIN active_teachers at
WHERE NOT EXISTS (
    SELECT 1 
    FROM user_message_inbox umi 
    WHERE umi.user_id = at.id 
      AND umi.user_type = 'teacher' 
      AND umi.message_id = am.id 
      AND umi.folder = 'inbox'
);

-- Verify the delivery - show what each teacher should see
SELECT 
    t.first_name || ' ' || COALESCE(t.middle_name || ' ', '') || t.surname as teacher_name,
    t.email,
    m.subject,
    m.sender_name,
    m.created_at,
    umi.is_read,
    umi.folder
FROM teachers t
JOIN user_message_inbox umi ON t.id = umi.user_id AND umi.user_type = 'teacher'
JOIN messages m ON umi.message_id = m.id
WHERE m.sender_type = 'admin'
ORDER BY t.surname, m.created_at DESC;

-- Summary report
SELECT 
    'Admin Messages' as type,
    COUNT(*) as count
FROM messages 
WHERE sender_type = 'admin'

UNION ALL

SELECT 
    'Active Teachers' as type,
    COUNT(*) as count
FROM teachers 
WHERE status = 'Active'

UNION ALL

SELECT 
    'Teacher Inbox Entries' as type,
    COUNT(*) as count
FROM user_message_inbox umi
JOIN messages m ON umi.message_id = m.id
WHERE umi.user_type = 'teacher' 
  AND m.sender_type = 'admin'
  AND umi.folder = 'inbox';
