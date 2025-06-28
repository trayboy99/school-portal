-- Check if users table exists and has correct structure
DO $$
BEGIN
    -- Check if users table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Create users table if it doesn't exist
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            user_type VARCHAR(50) NOT NULL DEFAULT 'admin',
            status VARCHAR(50) NOT NULL DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default admin users
        INSERT INTO users (username, email, password_hash, first_name, last_name, user_type, status) VALUES
        ('admin', 'admin@school.com', 'password', 'System', 'Administrator', 'admin', 'Active'),
        ('superadmin', 'super@school.com', 'admin123', 'Super', 'Admin', 'admin', 'Active');
        
        RAISE NOTICE 'Users table created and populated with default admin accounts';
    ELSE
        RAISE NOTICE 'Users table already exists';
    END IF;
END
$$;

-- Verify the data exists
SELECT 'Users in database:' as info;
SELECT id, username, email, password_hash, first_name, last_name, user_type, status FROM users;
