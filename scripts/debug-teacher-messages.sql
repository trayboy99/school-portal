-- Debug script to see what messages exist and why teachers can't see them

-- 1. Check what messages exist from admin
SELECT 
    m.id,
    m.sender_name,
    m.sender_type,
    m.subject,
    m.content,
    m.created_at
FROM messages m
WHERE m.sender_type = 'admin'
ORDER BY m.created_at DESC;

-- 2. Check message recipients for admin messages
SELECT 
    m.id as message_id,
    m.subject,
    mr.recipient_id,
    mr.recipient_type,
    mr.recipient_name,
    mr.recipient_email
FROM messages m
JOIN message_recipients mr ON m.id = mr.message_id
WHERE m.sender_type = 'admin'
ORDER BY m.created_at DESC;

-- 3. Check user_message_inbox for teachers
SELECT 
    umi.id,
    umi.user_id,
    umi.user_type,
    umi.message_id,
    umi.folder,
    umi.is_read,
    m.subject,
    m.sender_name
FROM user_message_inbox umi
JOIN messages m ON umi.message_id = m.id
WHERE umi.user_type = 'teacher'
ORDER BY umi.created_at DESC;

-- 4. Check teachers table to see IDs
SELECT 
    id,
    first_name,
    middle_name,
    surname,
    email
FROM teachers
ORDER BY id;

-- 5. Check if Mary Grace Johnson has any inbox entries
SELECT 
    t.id as teacher_id,
    t.first_name || ' ' || COALESCE(t.middle_name || ' ', '') || t.surname as teacher_name,
    umi.message_id,
    umi.folder,
    umi.is_read,
    m.subject,
    m.sender_name
FROM teachers t
LEFT JOIN user_message_inbox umi ON t.id = umi.user_id AND umi.user_type = 'teacher'
LEFT JOIN messages m ON umi.message_id = m.id
WHERE t.first_name = 'Mary' AND t.surname = 'Johnson'
ORDER BY umi.created_at DESC;
