-- Create teacher_classes table to track which classes each teacher teaches
CREATE TABLE IF NOT EXISTS teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject_id INTEGER,
    academic_year VARCHAR(20) DEFAULT '2024/2025',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_teacher_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_classes_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate assignments
    UNIQUE(teacher_id, class_name, subject_id, academic_year)
);

-- Insert sample teacher-class assignments
-- First, let's check if we have teachers and get their IDs
DO $$
DECLARE
    teacher_record RECORD;
    math_subject_id INTEGER;
    english_subject_id INTEGER;
    science_subject_id INTEGER;
BEGIN
    -- Get subject IDs
    SELECT id INTO math_subject_id FROM subjects WHERE LOWER(name) LIKE '%math%' LIMIT 1;
    SELECT id INTO english_subject_id FROM subjects WHERE LOWER(name) LIKE '%english%' LIMIT 1;
    SELECT id INTO science_subject_id FROM subjects WHERE LOWER(name) LIKE '%science%' LIMIT 1;
    
    -- Assign teachers to classes
    FOR teacher_record IN SELECT id, first_name, surname FROM teachers LIMIT 5
    LOOP
        -- Assign each teacher to 2-3 classes with different subjects
        INSERT INTO teacher_classes (teacher_id, class_name, subject_id, academic_year, status)
        VALUES 
            (teacher_record.id, 'JSS1', math_subject_id, '2024/2025', 'active'),
            (teacher_record.id, 'JSS2', english_subject_id, '2024/2025', 'active'),
            (teacher_record.id, 'JSS3', science_subject_id, '2024/2025', 'active')
        ON CONFLICT (teacher_id, class_name, subject_id, academic_year) DO NOTHING;
        
        RAISE NOTICE 'Assigned teacher % % to classes JSS1, JSS2, JSS3', teacher_record.first_name, teacher_record.surname;
    END LOOP;
    
    -- If no subjects found, create basic assignments without subject constraints
    IF math_subject_id IS NULL THEN
        FOR teacher_record IN SELECT id, first_name, surname FROM teachers LIMIT 3
        LOOP
            INSERT INTO teacher_classes (teacher_id, class_name, academic_year, status)
            VALUES 
                (teacher_record.id, 'JSS1', '2024/2025', 'active'),
                (teacher_record.id, 'JSS2', '2024/2025', 'active'),
                (teacher_record.id, 'SSS1', '2024/2025', 'active')
            ON CONFLICT (teacher_id, class_name, subject_id, academic_year) DO NOTHING;
            
            RAISE NOTICE 'Assigned teacher % % to classes (without subject constraint)', teacher_record.first_name, teacher_record.surname;
        END LOOP;
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class_name ON teacher_classes(class_name);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_status ON teacher_classes(status);

-- Display the assignments
SELECT 
    tc.id,
    t.first_name || ' ' || t.surname AS teacher_name,
    tc.class_name,
    s.name AS subject_name,
    tc.academic_year,
    tc.status
FROM teacher_classes tc
JOIN teachers t ON tc.teacher_id = t.id
LEFT JOIN subjects s ON tc.subject_id = s.id
ORDER BY t.surname, tc.class_name;
