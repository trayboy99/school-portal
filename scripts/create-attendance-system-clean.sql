-- Drop existing attendance table if it exists
DROP TABLE IF EXISTS attendance CASCADE;

-- Create attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Present',
    teacher_id INTEGER NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate attendance for same student on same date
    CONSTRAINT unique_student_date_attendance UNIQUE (student_id, date),
    
    -- Check constraint for valid status values
    CONSTRAINT check_attendance_status CHECK (status IN ('Present', 'Absent', 'Late', 'Excused'))
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class ON attendance(class_name);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_teacher ON attendance(teacher_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendance_timestamp
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_timestamp();

-- Create a view for attendance statistics
CREATE OR REPLACE VIEW attendance_stats AS
SELECT 
    class_name,
    date,
    COUNT(*) as total_students,
    COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
    COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_count,
    COUNT(CASE WHEN status = 'Excused' THEN 1 END) as excused_count,
    ROUND(
        (COUNT(CASE WHEN status = 'Present' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 
        2
    ) as attendance_percentage
FROM attendance
GROUP BY class_name, date
ORDER BY date DESC, class_name;

-- Verify the table was created successfully
SELECT 'Attendance table created successfully!' as status;
SELECT 'Table is empty and ready for real attendance data.' as info;
