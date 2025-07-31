import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET() {
  try {
    console.log("Fetching subjects from database...")

    // First, check if the subjects table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("subjects")
      .select("count", { count: "exact", head: true })

    if (tableError) {
      console.error("Table check error:", tableError)
      return NextResponse.json({ error: "Subjects table not found", details: tableError }, { status: 500 })
    }

    console.log("Subjects table exists, fetching data...")

    // Fetch all subjects
    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching subjects:", error)
      return NextResponse.json({ error: "Failed to fetch subjects", details: error }, { status: 500 })
    }

    console.log(`Successfully fetched ${subjects?.length || 0} subjects`)
    console.log("Sample subject data:", subjects?.[0])

    return NextResponse.json(subjects || [])
  } catch (error) {
    console.error("Unexpected error in subjects API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Creating new subject with data:", body)

    const { subject_name, subject_code, department, class_level, description, is_core, is_elective, status } = body

    // Validate required fields (matching actual database structure)
    if (!subject_name || !subject_code || !department || !class_level) {
      console.log("Missing required fields:", { subject_name, subject_code, department, class_level })
      return NextResponse.json(
        { error: "Missing required fields: subject_name, subject_code, department, class_level" },
        { status: 400 },
      )
    }

    const subjectData = {
      subject_name,
      subject_code,
      department,
      class_level,
      description: description || null,
      is_core: is_core || false,
      is_elective: is_elective || false,
      credit_hours: 1, // Default credit hours
      status: status || "active",
    }

    console.log("Inserting subject data:", subjectData)

    const { data: newSubject, error } = await supabase.from("subjects").insert([subjectData]).select().single()

    if (error) {
      console.error("Error creating subject:", error)
      return NextResponse.json({ error: "Failed to create subject", details: error }, { status: 500 })
    }

    console.log("Subject created successfully:", newSubject)
    return NextResponse.json(newSubject)
  } catch (error) {
    console.error("Unexpected error creating subject:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
