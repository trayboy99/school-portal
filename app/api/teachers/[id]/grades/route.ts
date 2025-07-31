import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: teacherId } = params
    const { subject, exam_type, max_score, class: className, grades } = await request.json()

    // First, create an exam record
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert([
        {
          exam_name: `${subject} ${exam_type}`,
          exam_type,
          subject,
          class_level: className,
          exam_date: new Date().toISOString().split("T")[0],
          max_score,
          created_by: teacherId,
          status: "completed",
        },
      ])
      .select()
      .single()

    if (examError) {
      console.error("Error creating exam:", examError)
      return NextResponse.json({ error: "Failed to create exam record" }, { status: 500 })
    }

    // Then, insert all the grade results
    const gradeResults = grades.map((grade: any) => ({
      exam_id: exam.id,
      student_id: grade.student_id,
      score: grade.score,
      grade: grade.grade,
      graded_at: new Date().toISOString(),
      graded_by: teacherId,
    }))

    const { error: resultsError } = await supabase.from("exam_results").insert(gradeResults)

    if (resultsError) {
      console.error("Error saving grade results:", resultsError)
      return NextResponse.json({ error: "Failed to save grade results" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Grades saved successfully",
      exam_id: exam.id,
      grades_count: gradeResults.length,
    })
  } catch (error) {
    console.error("Error saving grades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
