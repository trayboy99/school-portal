import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exam_questions_uploads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching exam questions uploads:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ uploads: data || [] })
  } catch (error) {
    console.error("Error in exam-questions-uploads GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const teacherId = formData.get("teacher_id") as string
    const subjectId = formData.get("subject_id") as string
    const classId = formData.get("class_id") as string
    const academicYearId = formData.get("academic_year_id") as string
    const academicTermId = formData.get("academic_term_id") as string
    const uploadedByAdmin = formData.get("uploaded_by_admin") as string

    console.log("Received exam questions form data:", {
      teacherId,
      subjectId,
      classId,
      academicYearId,
      academicTermId,
      uploadedByAdmin,
      fileName: file?.name,
    })

    if (!file || !teacherId || !subjectId || !classId || !academicYearId || !academicTermId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate file type
    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Only DOCX files are allowed" }, { status: 400 })
    }

    // Check if upload already exists for this combination
    const { data: existingUpload, error: checkError } = await supabase
      .from("exam_questions_uploads")
      .select("id")
      .eq("teacher_id", Number.parseInt(teacherId))
      .eq("subject_id", Number.parseInt(subjectId))
      .eq("class_id", Number.parseInt(classId))
      .eq("academic_year_id", Number.parseInt(academicYearId))
      .eq("academic_term_id", Number.parseInt(academicTermId))
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing exam questions upload:", checkError)
      return NextResponse.json({ error: "Error checking existing upload" }, { status: 500 })
    }

    const uploadData = {
      teacher_id: Number.parseInt(teacherId),
      subject_id: Number.parseInt(subjectId),
      class_id: Number.parseInt(classId),
      academic_year_id: Number.parseInt(academicYearId),
      academic_term_id: Number.parseInt(academicTermId),
      file_name: file.name,
      file_path: `/uploads/exam-questions/${file.name}`,
      file_size: file.size,
      upload_date: new Date().toISOString(),
      uploaded_by_admin: uploadedByAdmin === "true",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingUpload) {
      // Update existing upload
      const { data, error } = await supabase
        .from("exam_questions_uploads")
        .update({
          ...uploadData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUpload.id)
        .select()

      if (error) {
        console.error("Error updating exam questions:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, upload: data?.[0], updated: true })
    } else {
      // Create new upload
      const { data, error } = await supabase.from("exam_questions_uploads").insert(uploadData).select()

      if (error) {
        console.error("Error uploading exam questions:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, upload: data?.[0], updated: false })
    }
  } catch (error) {
    console.error("Error in exam-questions-uploads POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
