import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get student information
    const { data: student, error: studentError } = await supabase.from("students").select("*").eq("id", id).single()

    if (studentError) {
      console.error("Error fetching student:", studentError)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get upcoming exams (mock data for now)
    const upcomingExams = [
      {
        id: "1",
        subject: "Mathematics",
        exam_type: "Mid-term Exam",
        exam_date: "2024-01-25",
        duration_minutes: 120,
      },
      {
        id: "2",
        subject: "Physics",
        exam_type: "Quiz",
        exam_date: "2024-01-22",
        duration_minutes: 60,
      },
    ]

    // Get recent grades (mock data for now)
    const recentGrades = [
      {
        id: "1",
        subject: "Mathematics",
        exam_type: "Assignment",
        score: 85,
        max_score: 100,
        grade: "A",
      },
      {
        id: "2",
        subject: "English",
        exam_type: "Test",
        score: 78,
        max_score: 100,
        grade: "B",
      },
    ]

    // Get announcements (mock data for now)
    const announcements = [
      {
        id: "1",
        title: "Parent-Teacher Meeting",
        message: "Scheduled for next Friday at 2:00 PM",
        created_at: "2024-01-15",
      },
      {
        id: "2",
        title: "Sports Day",
        message: "Annual sports day will be held on January 30th",
        created_at: "2024-01-14",
      },
    ]

    // Calculate attendance (mock data for now)
    const attendance = {
      present: 18,
      total: 20,
      percentage: 90,
    }

    return NextResponse.json({
      student,
      upcomingExams,
      recentGrades,
      announcements,
      attendance,
    })
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
