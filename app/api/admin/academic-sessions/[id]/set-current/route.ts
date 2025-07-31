import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // First, set all academic sessions to not current
    await supabase.from("academic_sessions").update({ is_current: false }).neq("id", "dummy")

    // Then set the specified session as current
    const { data, error } = await supabase
      .from("academic_sessions")
      .update({ is_current: true, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select(`
        *,
        academic_years (
          id,
          name
        )
      `)

    if (error) {
      console.error("Error setting current academic session:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in set current academic session API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
