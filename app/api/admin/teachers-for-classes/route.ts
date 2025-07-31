import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET() {
  try {
    console.log("Fetching teachers for classes dropdown...")

    // Fetch only the columns that exist in the teachers table
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("id, first_name, surname, email, phone, status")
      .eq("status", "Active")
      .order("first_name", { ascending: true })

    if (error) {
      console.error("Error fetching teachers:", error)
      return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
    }

    console.log(`Found ${teachers?.length || 0} active teachers`)

    // Format the data for dropdown usage
    const formattedTeachers =
      teachers?.map((teacher) => ({
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.surname}`.trim(),
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status,
      })) || []

    return NextResponse.json(formattedTeachers)
  } catch (error) {
    console.error("Error in teachers-for-classes API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
