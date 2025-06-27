-- Create comprehensive messaging system

-- 1. Messages table (stores all messages)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('teacher', 'parent', 'admin', 'student')),
    sender_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(50) DEFAULT 'general',
    student_id INTEGER, -- Reference student if message is about a specific student
    student_name VARCHAR(255),
    class_name VARCHAR(100),
    thread_id INTEGER, -- For grouping related messages (replies)
    parent_message_id INTEGER, -- For reply chains
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (parent_message_id) REFERENCES messages(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 2. Message recipients table (who receives each message)
CREATE TABLE IF NOT EXISTS message_recipients (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    recipient_id INTEGER, -- User ID if they have an account
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('teacher', 'parent', 'admin', 'student')),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'read', 'replied', 'failed')),
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- 3. User message inbox (personalized inbox for each user)
CREATE TABLE IF NOT EXISTS user_message_inbox (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('teacher', 'parent', 'admin', 'student')),
    message_id INTEGER NOT NULL,
    folder VARCHAR(20) DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'archived', 'trash')),
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    archived_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    UNIQUE(user_id, user_type, message_id, folder)
);

-- 4. Parent accounts table (for parents to access the system)
CREATE TABLE IF NOT EXISTS parent_accounts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Parent-student relationships
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    relationship_type VARCHAR(20) DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'emergency_contact')),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES parent_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_student ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_email ON message_recipients(recipient_email);
CREATE INDEX IF NOT EXISTS idx_user_inbox_user ON user_message_inbox(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_user_inbox_folder ON user_message_inbox(folder, is_read);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON parent_student_relationships(student_id);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parent_accounts_updated_at BEFORE UPDATE ON parent_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample parent accounts
INSERT INTO parent_accounts (email, password_hash, first_name, last_name, phone) VALUES
('ngozi.okoro@parent.com', 'hashed_password_123', 'Ngozi', 'Okoro', '+234 801 234 5678'),
('sarah.johnson@parent.com', 'hashed_password_123', 'Sarah', 'Johnson', '+234 802 345 6789'),
('david.wilson@parent.com', 'hashed_password_123', 'David', 'Wilson', '+234 803 456 7890')
ON CONFLICT (email) DO NOTHING;

-- Link parents to students (assuming we have students with these names)
INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type) 
SELECT p.id, s.id, 'parent'
FROM parent_accounts p, students s 
WHERE (p.first_name = 'Ngozi' AND p.last_name = 'Okoro' AND s.first_name = 'Chioma' AND s.surname = 'Okoro')
   OR (p.first_name = 'Sarah' AND p.last_name = 'Johnson' AND s.first_name = 'Mike' AND s.surname = 'Johnson')
   OR (p.first_name = 'David' AND p.last_name = 'Wilson' AND s.first_name = 'Emma' AND s.surname = 'Wilson')
ON CONFLICT (parent_id, student_id) DO NOTHING;
