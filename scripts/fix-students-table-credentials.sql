-- Add missing credential-related columns to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS credential_method VARCHAR(20) DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS custom_username VARCHAR(100),
ADD COLUMN IF NOT EXISTS custom_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS send_credentials_to VARCHAR(20) DEFAULT 'parent',
ADD COLUMN IF NOT EXISTS credentials_sent_to VARCHAR(20) DEFAULT 'parent';

-- Add comments to the new columns
COMMENT ON COLUMN students.credential_method IS 'Method used to generate credentials: auto or custom';
COMMENT ON COLUMN students.custom_username IS 'Custom username if credential_method is custom';
COMMENT ON COLUMN students.custom_password IS 'Custom password if credential_method is custom';
COMMENT ON COLUMN students.send_credentials_to IS 'Who to send credentials to: parent, student, or both';
COMMENT ON COLUMN students.credentials_sent_to IS 'Record of who credentials were sent to';

-- Update existing students to have default values
UPDATE students 
SET 
  credential_method = 'auto',
  send_credentials_to = 'parent',
  credentials_sent_to = 'parent'
WHERE credential_method IS NULL;
