"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"

const SQL_SCRIPT = `-- School Portal Database Tables
-- Run this script in your Supabase SQL Editor

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Active',
  avatar TEXT,
  admission_date DATE,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  subjects TEXT[],
  experience TEXT,
  status TEXT DEFAULT 'Active',
  avatar TEXT,
  department TEXT,
  qualification TEXT,
  hire_date DATE,
  employment_type TEXT,
  salary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  teacher TEXT,
  teacher_id TEXT,
  students INTEGER DEFAULT 0,
  max_students INTEGER DEFAULT 40,
  subjects INTEGER DEFAULT 0,
  room TEXT,
  section TEXT,
  academic_year TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department TEXT,
  credits INTEGER DEFAULT 1,
  description TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  session TEXT,
  year TEXT,
  term TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Scheduled',
  exam_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student scores table
CREATE TABLE IF NOT EXISTS student_scores (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT REFERENCES students(id),
  exam_id BIGINT REFERENCES exams(id),
  subject TEXT,
  class TEXT,
  ca1 INTEGER DEFAULT 0,
  ca2 INTEGER DEFAULT 0,
  exam INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  grade TEXT,
  session TEXT,
  term TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default settings
INSERT INTO settings (key, value, category, description) VALUES
('current_session', '2024/2025', 'academic', 'Current academic session'),
('current_term', 'First Term', 'academic', 'Current academic term'),
('school_name', 'Your School Name', 'general', 'Name of the school'),
('school_address', 'School Address', 'general', 'School address')
ON CONFLICT (key) DO NOTHING;
`

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

  const openSupabase = () => {
    window.open("https://supabase.com/dashboard", "_blank")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🗄️ Manual Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
              <li>Copy the SQL script below</li>
              <li>Go to your Supabase Dashboard</li>
              <li>Click on "SQL Editor" in the sidebar</li>
              <li>Paste the script and click "Run"</li>
              <li>Come back here to verify the setup</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy SQL Script"}
            </Button>
            <Button onClick={openSupabase} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{SQL_SCRIPT}</pre>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ After Running the Script:</h3>
            <p className="text-green-700 text-sm">
              You should see 7 new tables in your Supabase Table Editor: students, teachers, classes, subjects, exams,
              student_scores, and settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
