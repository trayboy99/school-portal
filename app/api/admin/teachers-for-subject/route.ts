import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subject_id")

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 })
    }

    // Get teachers who teach this subject
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("id, first_name, surname, email, department, subjects")
      .eq("status", "active")

    if (error) {
      console.error("Error fetching teachers:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter teachers who have this subject in their subjects array
    const filteredTeachers =
      teachers?.filter((teacher) => {
        const teacherSubjects = Array.isArray(teacher.subjects) ? teacher.subjects : []
        return teacherSubjects.includes(Number.parseInt(subjectId))
      }) || []

    return NextResponse.json(filteredTeachers)
  } catch (error) {
    console.error("Error in teachers-for-subject GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
