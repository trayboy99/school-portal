-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    head_of_department UUID REFERENCES teachers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_departments_updated_at();

-- Insert default departments
INSERT INTO departments (name, code, description, status) VALUES
('Mathematics', 'MATH', 'Mathematics and related subjects', 'Active'),
('English Language', 'ENG', 'English language and literature', 'Active'),
('Sciences', 'SCI', 'Physics, Chemistry, Biology', 'Active'),
('Social Studies', 'SS', 'History, Geography, Government', 'Active'),
('Languages', 'LANG', 'Foreign languages and local languages', 'Active'),
('Arts', 'ARTS', 'Fine arts, music, drama', 'Active'),
('Physical Education', 'PE', 'Sports and physical education', 'Active'),
('Computer Studies', 'CS', 'Computer science and ICT', 'Active'),
('Vocational Studies', 'VOC', 'Technical and vocational subjects', 'Active')
ON CONFLICT (name) DO NOTHING;
