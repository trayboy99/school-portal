-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist (excluding roll number columns)
DO $$
BEGIN
    -- Add reg_number column (the critical missing one)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'reg_number') THEN
        ALTER TABLE students ADD COLUMN reg_number VARCHAR(50) UNIQUE;
        RAISE NOTICE 'Added reg_number column';
    END IF;

    -- Add emergency contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'emergency_contact') THEN
        ALTER TABLE students ADD COLUMN emergency_contact VARCHAR(200);
        RAISE NOTICE 'Added emergency_contact column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'emergency_phone') THEN
        ALTER TABLE students ADD COLUMN emergency_phone VARCHAR(20);
        RAISE NOTICE 'Added emergency_phone column';
    END IF;

    -- Add medical and notes fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'medical_info') THEN
        ALTER TABLE students ADD COLUMN medical_info TEXT;
        RAISE NOTICE 'Added medical_info column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'notes') THEN
        ALTER TABLE students ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;

    -- Add credential tracking fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'credential_method') THEN
        ALTER TABLE students ADD COLUMN credential_method VARCHAR(20) DEFAULT 'auto';
        RAISE NOTICE 'Added credential_method column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'custom_username') THEN
        ALTER TABLE students ADD COLUMN custom_username VARCHAR(50);
        RAISE NOTICE 'Added custom_username column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'custom_password') THEN
        ALTER TABLE students ADD COLUMN custom_password VARCHAR(255);
        RAISE NOTICE 'Added custom_password column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'send_credentials_to') THEN
        ALTER TABLE students ADD COLUMN send_credentials_to VARCHAR(20) DEFAULT 'parent';
        RAISE NOTICE 'Added send_credentials_to column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'credentials_sent_to') THEN
        ALTER TABLE students ADD COLUMN credentials_sent_to VARCHAR(20) DEFAULT 'parent';
        RAISE NOTICE 'Added credentials_sent_to column';
    END IF;

    -- Add avatar field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'avatar') THEN
        ALTER TABLE students ADD COLUMN avatar TEXT;
        RAISE NOTICE 'Added avatar column';
    END IF;

    -- Add class field (in addition to current_class)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'class') THEN
        ALTER TABLE students ADD COLUMN class VARCHAR(50);
        RAISE NOTICE 'Added class column';
    END IF;

    -- Add address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'address') THEN
        ALTER TABLE students ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'home_address') THEN
        ALTER TABLE students ADD COLUMN home_address TEXT;
        RAISE NOTICE 'Added home_address column';
    END IF;

    -- Add admission_date field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'admission_date') THEN
        ALTER TABLE students ADD COLUMN admission_date DATE;
        RAISE NOTICE 'Added admission_date column';
    END IF;

    -- Add password_hash field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'password_hash') THEN
        ALTER TABLE students ADD COLUMN password_hash VARCHAR(255);
        RAISE NOTICE 'Added password_hash column';
    END IF;

END $$;

-- Generate unique registration numbers for existing students
DO $$
DECLARE
    student_record RECORD;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    counter INTEGER := 1;
    new_reg_number VARCHAR(50);
BEGIN
    FOR student_record IN 
        SELECT id FROM students WHERE reg_number IS NULL OR reg_number = ''
        ORDER BY created_at ASC
    LOOP
        -- Generate unique reg number
        LOOP
            new_reg_number := 'REG' || current_year || LPAD(counter::TEXT, 3, '0');
            
            -- Check if this reg number already exists
            IF NOT EXISTS (SELECT 1 FROM students WHERE reg_number = new_reg_number) THEN
                EXIT;
            END IF;
            
            counter := counter + 1;
        END LOOP;
        
        -- Update the student with the new reg number
        UPDATE students 
        SET reg_number = new_reg_number 
        WHERE id = student_record.id;
        
        RAISE NOTICE 'Generated reg_number % for student ID %', new_reg_number, student_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Set default values for existing records
UPDATE students 
SET 
    class = current_class,
    address = home_address,
    admission_date = COALESCE(admission_date, CURRENT_DATE),
    credential_method = COALESCE(credential_method, 'auto'),
    send_credentials_to = COALESCE(send_credentials_to, 'parent'),
    credentials_sent_to = COALESCE(credentials_sent_to, 'parent'),
    avatar = COALESCE(avatar, '/placeholder.svg?height=40&width=40')
WHERE class IS NULL OR address IS NULL OR admission_date IS NULL 
   OR credential_method IS NULL OR send_credentials_to IS NULL 
   OR credentials_sent_to IS NULL OR avatar IS NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_students_username ON students(username);
CREATE INDEX IF NOT EXISTS idx_students_reg_number ON students(reg_number);
CREATE INDEX IF NOT EXISTS idx_students_current_class ON students(current_class);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Show sample data
SELECT id, first_name, surname, username, reg_number, status, current_class, section
FROM students 
LIMIT 5;
