-- Drop existing classes table if it exists (be careful in production!)
DROP TABLE IF EXISTS classes CASCADE;

-- Create comprehensive classes table with all required fields
CREATE TABLE classes (
    -- Primary key and system fields
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic class information
    name VARCHAR(100) NOT NULL, -- e.g., "JSS 1", "SSS 2", etc.
    category VARCHAR(50) NOT NULL, -- "Junior" or "Senior"
    
    -- Academic information
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    section VARCHAR(50) NOT NULL, -- "Gold", "Silver", etc.
    
    -- Teacher assignment
    teacher_id VARCHAR(50), -- Employee ID of assigned teacher
    teacher_name VARCHAR(255), -- Full name of teacher (for quick access)
    
    -- Capacity and subjects
    max_students INTEGER DEFAULT 40,
    current_students INTEGER DEFAULT 0, -- Will be updated via triggers/functions
    subjects_count INTEGER DEFAULT 0, -- Number of subjects for this class
    
    -- Physical location
    room VARCHAR(100) DEFAULT 'TBD',
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Archived')),
    description TEXT,
    
    -- Additional metadata
    notes TEXT,
    
    -- Audit fields
    created_by INTEGER, -- Reference to user who created the record
    updated_by INTEGER  -- Reference to user who last updated the record
);

-- Create indexes for better performance
CREATE INDEX idx_classes_name ON classes(name);
CREATE INDEX idx_classes_category ON classes(category);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_section ON classes(section);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_created_at ON classes(created_at);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classes_updated_at 
    BEFORE UPDATE ON classes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_classes_updated_at();

-- Insert some sample data to test the table
INSERT INTO classes (
    name, category, academic_year, section, teacher_id, teacher_name,
    max_students, subjects_count, room, description
) VALUES 
(
    'JSS 1', 'Junior', '2024-2025', 'Gold', 'TCH001', 'Dr. Sarah Johnson',
    40, 9, 'Room 101', 'Junior Secondary School Class 1 - Gold Section'
),
(
    'JSS 2', 'Junior', '2024-2025', 'Silver', 'TCH002', 'Mr. David Wilson',
    40, 9, 'Room 102', 'Junior Secondary School Class 2 - Silver Section'
),
(
    'SSS 1', 'Senior', '2024-2025', 'Gold', 'TCH003', 'Mrs. Emily Brown',
    35, 6, 'Room 201', 'Senior Secondary School Class 1 - Gold Section'
);

-- Create a view for easy class information retrieval with teacher details
CREATE OR REPLACE VIEW classes_with_details AS
SELECT 
    c.id,
    c.name,
    c.category,
    c.academic_year,
    c.section,
    c.teacher_id,
    c.teacher_name,
    c.max_students,
    c.current_students,
    c.subjects_count,
    c.room,
    c.status,
    c.description,
    c.created_at,
    c.updated_at,
    -- Calculate capacity utilization percentage
    CASE 
        WHEN c.max_students > 0 THEN 
            ROUND((c.current_students::DECIMAL / c.max_students::DECIMAL) * 100, 2)
        ELSE 0 
    END as capacity_utilization_percent
FROM classes c
WHERE c.status = 'Active'
ORDER BY c.category, c.name;

-- Function to update student count for a class
CREATE OR REPLACE FUNCTION update_class_student_count(class_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    student_count INTEGER;
BEGIN
    -- Count students in this class (when students table is properly linked)
    -- For now, we'll return 0 as placeholder
    student_count := 0;
    
    -- Update the class record
    UPDATE classes 
    SET current_students = student_count,
        updated_at = NOW()
    WHERE id = class_id;
    
    RETURN student_count;
END;
$$ LANGUAGE plpgsql;

-- Grant appropriate permissions (adjust based on your needs)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON classes TO authenticated;
-- GRANT SELECT ON classes_with_details TO authenticated;
-- GRANT USAGE, SELECT ON SEQUENCE classes_id_seq TO authenticated;

-- Display table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;

-- Display sample data
SELECT * FROM classes_with_details;
