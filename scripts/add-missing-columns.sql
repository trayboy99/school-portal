-- Check current table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add credential_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'credential_method') THEN
        ALTER TABLE students ADD COLUMN credential_method VARCHAR(20) DEFAULT 'auto' CHECK (credential_method IN ('auto', 'manual', 'email-setup'));
    END IF;
    
    -- Add credentials_sent_to column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'credentials_sent_to') THEN
        ALTER TABLE students ADD COLUMN credentials_sent_to VARCHAR(20) CHECK (credentials_sent_to IN ('student', 'parent', 'both'));
    END IF;
    
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'username') THEN
        ALTER TABLE students ADD COLUMN username VARCHAR(100) UNIQUE;
    END IF;
    
    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'password_hash') THEN
        ALTER TABLE students ADD COLUMN password_hash VARCHAR(255);
    END IF;
    
    -- Add surname column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'surname') THEN
        ALTER TABLE students ADD COLUMN surname VARCHAR(100);
    END IF;
    
    -- Add middle_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'middle_name') THEN
        ALTER TABLE students ADD COLUMN middle_name VARCHAR(100);
    END IF;
    
    -- Add first_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'first_name') THEN
        ALTER TABLE students ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    -- Add home_address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'home_address') THEN
        ALTER TABLE students ADD COLUMN home_address TEXT;
    END IF;
    
    RAISE NOTICE 'Missing columns have been added successfully!';
END $$;

-- Show updated table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'students' 
ORDER BY ordinal_position;
