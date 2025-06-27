-- Create messages table to store all teacher communications
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER,
    from_user_type VARCHAR(20) NOT NULL CHECK (from_user_type IN ('teacher', 'parent', 'admin', 'student')),
    from_name VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    to_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general',
    student_id INTEGER,
    student_name VARCHAR(255),
    class_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'replied')),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id, from_user_type);
CREATE INDEX IF NOT EXISTS idx_messages_to_email ON messages(to_email);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- Insert some sample messages for testing
INSERT INTO messages (
    from_user_id, from_user_type, from_name, to_email, to_name, 
    subject, content, priority, category, student_id, student_name, class_name
) VALUES 
(
    1, 'teacher', 'Mary Grace Johnson', 'parent.mike.johnson@email.com', 'Mrs. Johnson',
    'Mike''s Mathematics Performance', 
    'Dear Parent/Guardian,

I hope this message finds you well. I would like to discuss Mike''s recent academic performance in Mathematics.

Mike has been struggling with algebraic equations and needs additional support at home.

I believe with your support at home, we can help Mike improve. Please let me know when would be a convenient time for us to discuss this further.

Best regards,
Mary Grace Johnson',
    'high', 'academic_concern', 1, 'Mike Johnson', 'JSS 2A'
),
(
    1, 'teacher', 'Mary Grace Johnson', 'parent.emma.wilson@email.com', 'Mr. Wilson',
    'Excellent Work - Emma Wilson',
    'Dear Parent/Guardian,

I wanted to share some wonderful news about Emma''s performance in Mathematics.

Emma scored 95% on her recent test and has shown exceptional understanding of geometric concepts.

Please congratulate Emma on this achievement. It''s a pleasure having such a dedicated student in my class.

Best regards,
Mary Grace Johnson',
    'normal', 'excellent_work', 2, 'Emma Wilson', 'JSS 1B'
);
