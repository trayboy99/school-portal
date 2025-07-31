-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL, -- JSS1, JSS2, SSS1, etc.
    section VARCHAR(20) NOT NULL, -- Gold, Silver, Bronze
    class_teacher_id INTEGER REFERENCES teachers(id),
    academic_year VARCHAR(20) DEFAULT '2024/2025',
    max_students INTEGER DEFAULT 40,
    current_students INTEGER DEFAULT 0,
    room_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_name, section, academic_year)
);

-- Insert default classes
INSERT INTO classes (class_name, section, max_students, room_number) VALUES
('JSS 1', 'Gold', 40, 'Room 101'),
('JSS 1', 'Silver', 40, 'Room 102'),
('JSS 1', 'Bronze', 40, 'Room 103'),
('JSS 2', 'Gold', 40, 'Room 201'),
('JSS 2', 'Silver', 40, 'Room 202'),
('JSS 2', 'Bronze', 40, 'Room 203'),
('JSS 3', 'Gold', 40, 'Room 301'),
('JSS 3', 'Silver', 40, 'Room 302'),
('JSS 3', 'Bronze', 40, 'Room 303'),
('SSS 1', 'Gold', 35, 'Room 401'),
('SSS 1', 'Silver', 35, 'Room 402'),
('SSS 1', 'Bronze', 35, 'Room 403'),
('SSS 2', 'Gold', 35, 'Room 501'),
('SSS 2', 'Silver', 35, 'Room 502'),
('SSS 2', 'Bronze', 35, 'Room 503'),
('SSS 3', 'Gold', 35, 'Room 601'),
('SSS 3', 'Silver', 35, 'Room 602'),
('SSS 3', 'Bronze', 35, 'Room 603')
ON CONFLICT (class_name, section, academic_year) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_name_section ON classes(class_name, section);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year);
