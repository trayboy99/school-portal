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

    // Get grades for the student
    const { data: grades, error } = await supabase
      .from("exam_results")
      .select(`
        *,
        exams (
          exam_name,
          exam_type,
          subject,
          max_score,
          exam_date
        )
      `)
      .eq("student_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching grades:", error)
      return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedGrades =
      grades?.map((grade) => ({
        id: grade.id,
        subject: grade.exams?.subject || "Unknown",
        exam_type: grade.exams?.exam_type || "Test",
        score: grade.score,
        max_score: grade.exams?.max_score || 100,
        grade: grade.grade,
        date: grade.exams?.exam_date || grade.created_at,
        term: "Current Term",
      })) || []

    return NextResponse.json(transformedGrades)
  } catch (error) {
    console.error("Error fetching grades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
