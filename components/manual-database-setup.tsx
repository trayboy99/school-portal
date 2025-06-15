"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Database, CheckCircle } from "lucide-react"

const SQL_SCRIPT = `-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  roll_no VARCHAR(50) UNIQUE NOT NULL,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'Active',
  avatar TEXT,
  admission_date DATE,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(100),
  qualification VARCHAR(255),
  experience INTEGER,
  status VARCHAR(20) DEFAULT 'Active',
  avatar TEXT,
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  class VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  section VARCHAR(50),
  teacher_id INTEGER REFERENCES teachers(id),
  academic_year VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  subject_id INTEGER REFERENCES subjects(id),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  score DECIMAL(5,2),
  grade VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data (optional)
INSERT INTO students (name, roll_no, class, section, email, phone, admission_date, date_of_birth, gender, parent_name, parent_phone) VALUES
('John Doe', '2024001', 'JSS 1', 'Gold', 'john.doe@school.com', '+234 123 456 7890', '2024-01-15', '2010-05-20', 'Male', 'Mr. Doe', '+234 123 456 7891'),
('Jane Smith', '2024002', 'JSS 1', 'Silver', 'jane.smith@school.com', '+234 123 456 7892', '2024-01-15', '2010-08-15', 'Female', 'Mrs. Smith', '+234 123 456 7893'),
('Mike Johnson', '2024003', 'SSS 1', 'Gold', 'mike.johnson@school.com', '+234 123 456 7894', '2024-01-15', '2008-03-10', 'Male', 'Mr. Johnson', '+234 123 456 7895')
ON CONFLICT (roll_no) DO NOTHING;

INSERT INTO teachers (name, employee_id, email, phone, subject, qualification, experience, hire_date) VALUES
('Dr. Sarah Wilson', 'TCH001', 'sarah.wilson@school.com', '+234 123 456 7896', 'Mathematics', 'PhD Mathematics', 10, '2020-08-01'),
('Mr. David Brown', 'TCH002', 'david.brown@school.com', '+234 123 456 7897', 'English', 'MA English Literature', 8, '2021-01-15'),
('Mrs. Lisa Davis', 'TCH003', 'lisa.davis@school.com', '+234 123 456 7898', 'Science', 'MSc Physics', 6, '2022-03-01')
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO subjects (name, code, description, class) VALUES
('Mathematics', 'MATH101', 'Basic Mathematics for Junior Secondary', 'JSS 1'),
('English Language', 'ENG101', 'English Language and Literature', 'JSS 1'),
('Basic Science', 'SCI101', 'Introduction to Science', 'JSS 1'),
('Advanced Mathematics', 'MATH201', 'Advanced Mathematics for Senior Secondary', 'SSS 1'),
('Physics', 'PHY201', 'Introduction to Physics', 'SSS 1'),
('Chemistry', 'CHE201', 'Introduction to Chemistry', 'SSS 1')
ON CONFLICT (code) DO NOTHING;`

export default function ManualDatabaseSetup() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCRIPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manual Database Setup
          </CardTitle>
          <CardDescription>Follow these steps to manually create your database tables in Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Step-by-step Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Supabase Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Select your project</li>
              <li>Click on "SQL Editor" in the left sidebar</li>
              <li>Copy the SQL script below and paste it into the editor</li>
              <li>Click "Run" to execute the script</li>
              <li>Verify that the tables were created in the "Table Editor"</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">SQL Script:</h3>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy SQL
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">{SQL_SCRIPT}</pre>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">What this script does:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Creates all necessary tables (students, teachers, subjects, classes, grades, attendance)</li>
              <li>• Sets up proper relationships between tables</li>
              <li>• Adds sample data to get you started</li>
              <li>• Uses "IF NOT EXISTS" to avoid errors if tables already exist</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Supabase Dashboard
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/debug">Check Configuration</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">After Running the Script</CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <p className="mb-3">Once you've successfully run the SQL script:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Go back to your school portal application</li>
            <li>Navigate to the Students section</li>
            <li>You should see the sample students that were created</li>
            <li>Try adding a new student to test the functionality</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
