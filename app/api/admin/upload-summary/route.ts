import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get current academic info
    const { data: currentYear, error: yearError } = await supabase
      .from("academic_years")
      .select("id, name")
      .eq("is_current", true)
      .single()

    const { data: currentTerm, error: termError } = await supabase
      .from("academic_terms")
      .select("id, name")
      .eq("is_current", true)
      .single()

    if (yearError || termError) {
      console.error("Error fetching current academic period:", { yearError, termError })
      return NextResponse.json({
        summary: [],
        stats: {},
        academic_info: null,
      })
    }

    const academicInfo = {
      academic_year_id: currentYear.id,
      academic_term_id: currentTerm.id,
      year_name: currentYear.name,
      term_name: currentTerm.name,
    }

    // Get all teachers
    const { data: teachers, error: teachersError } = await supabase
      .from("teachers")
      .select("id, first_name, surname, email, department")
      .eq("status", "active")

    if (teachersError) {
      console.error("Error fetching teachers:", teachersError)
      return NextResponse.json({ error: teachersError.message }, { status: 500 })
    }

    // Get exam questions uploads for current academic period
    const { data: examUploads, error: examError } = await supabase
      .from("exam_questions_uploads")
      .select("teacher_id")
      .eq("academic_year_id", currentYear.id)
      .eq("academic_term_id", currentTerm.id)

    // Get e-notes uploads for current academic period
    const { data: eNotesUploads, error: eNotesError } = await supabase
      .from("e_notes_uploads")
      .select("teacher_id, week_number")
      .eq("academic_year_id", currentYear.id)
      .eq("academic_term_id", currentTerm.id)

    if (examError || eNotesError) {
      console.error("Error fetching uploads:", { examError, eNotesError })
      return NextResponse.json({ error: "Failed to fetch upload data" }, { status: 500 })
    }

    // Process teacher summary
    const teacherSummary =
      teachers?.map((teacher) => {
        const teacherExamUploads = examUploads?.filter((upload) => upload.teacher_id === teacher.id) || []
        const teacherENotesUploads = eNotesUploads?.filter((upload) => upload.teacher_id === teacher.id) || []

        const uniqueWeeks = new Set(teacherENotesUploads.map((upload) => upload.week_number))
        const weeksSubmitted = uniqueWeeks.size
        const completionPercentage = Math.round((weeksSubmitted / 11) * 100)

        return {
          teacher_id: teacher.id,
          teacher_name: `${teacher.first_name} ${teacher.surname}`,
          teacher_email: teacher.email,
          department: teacher.department,
          exam_questions_submitted: teacherExamUploads.length > 0,
          e_notes_weeks_submitted: weeksSubmitted,
          e_notes_completion_percentage: completionPercentage,
        }
      }) || []

    // Calculate statistics
    const stats = {
      total_teachers: teachers?.length || 0,
      exam_questions_submitted: teacherSummary.filter((t) => t.exam_questions_submitted).length,
      exam_questions_pending: teacherSummary.filter((t) => !t.exam_questions_submitted).length,
      e_notes_fully_completed: teacherSummary.filter((t) => t.e_notes_completion_percentage === 100).length,
      e_notes_partially_completed: teacherSummary.filter(
        (t) => t.e_notes_completion_percentage > 0 && t.e_notes_completion_percentage < 100,
      ).length,
      e_notes_not_started: teacherSummary.filter((t) => t.e_notes_completion_percentage === 0).length,
    }

    return NextResponse.json({
      summary: teacherSummary,
      stats,
      academic_info: academicInfo,
    })
  } catch (error) {
    console.error("Error in upload-summary GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
