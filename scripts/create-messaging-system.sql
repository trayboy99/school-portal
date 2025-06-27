-- Create messages table for teacher communications
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER,
    from_user_type VARCHAR(20) NOT NULL, -- 'teacher', 'parent', 'admin', 'student'
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255),
    to_user_id INTEGER,
    to_user_type VARCHAR(20) NOT NULL,
    to_name VARCHAR(255) NOT NULL,
    to_email VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    category VARCHAR(50) DEFAULT 'general', -- 'academic_concern', 'behavioral', 'appreciation', etc.
    student_id INTEGER REFERENCES students(id),
    class_name VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subject_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Array of variable names like ['student_name', 'subject', 'teacher_name']
    created_by INTEGER,
    is_system_template BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert system message templates
INSERT INTO message_templates (name, category, subject_template, content_template, variables, is_system_template) VALUES
('Academic Concern', 'academic_concern', 'Academic Performance Discussion - {student_name}', 
'Dear Parent/Guardian,

I hope this message finds you well. I would like to discuss {student_name}''s recent academic performance in {subject}.

{specific_details}

I believe with your support at home, we can help {student_name} improve. Please let me know when would be a convenient time for us to discuss this further.

Best regards,
{teacher_name}', 
'["student_name", "subject", "specific_details", "teacher_name"]', TRUE),

('Excellent Work', 'excellent_work', 'Excellent Work - {student_name}',
'Dear Parent/Guardian,

I wanted to share some wonderful news about {student_name}''s performance in {subject}.

{specific_achievement}

Please congratulate {student_name} on this achievement. It''s a pleasure having such a dedicated student in my class.

Best regards,
{teacher_name}',
'["student_name", "subject", "specific_achievement", "teacher_name"]', TRUE),

('Behavioral Concern', 'behavioral_concern', 'Behavioral Discussion - {student_name}',
'Dear Parent/Guardian,

I hope you are doing well. I would like to discuss some behavioral concerns regarding {student_name} in my {subject} class.

{specific_behavior}

I believe that with our combined effort, we can help {student_name} develop better classroom habits. Could we schedule a meeting to discuss this?

Best regards,
{teacher_name}',
'["student_name", "subject", "specific_behavior", "teacher_name"]', TRUE),

('Missing Assignment', 'assignment_missing', 'Missing Assignment - {student_name}',
'Dear Parent/Guardian,

{student_name} has not submitted the following assignment(s):

{assignment_details}

Due date: {due_date}

Please ensure {student_name} completes and submits the work. If there are any challenges, please don''t hesitate to contact me.

Best regards,
{teacher_name}',
'["student_name", "assignment_details", "due_date", "teacher_name"]', TRUE),

('Meeting Request', 'meeting_request', 'Parent-Teacher Meeting Request - {student_name}',
'Dear Parent/Guardian,

I would like to schedule a meeting to discuss {student_name}''s progress in {subject}.

Proposed times:
- {time_option_1}
- {time_option_2}
- {time_option_3}

Please let me know which time works best for you, or suggest an alternative.

Best regards,
{teacher_name}',
'["student_name", "subject", "time_option_1", "time_option_2", "time_option_3", "teacher_name"]', TRUE);

-- Add parent contact information to students table if not exists
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);

-- Update existing students with mock parent data
UPDATE students SET 
    parent_email = LOWER(first_name) || '.' || LOWER(surname) || '.parent@email.com',
    parent_phone = '+234 80' || (RANDOM() * 9)::INTEGER || ' ' || (RANDOM() * 899 + 100)::INTEGER || ' ' || (RANDOM() * 8999 + 1000)::INTEGER,
    parent_name = 'Mr/Mrs ' || surname
WHERE parent_email IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id, to_user_type);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id, from_user_type);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
