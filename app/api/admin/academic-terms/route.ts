import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export async function GET() {
  try {
    const { data, error } = await supabase.from("academic_terms").select("*").order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching academic terms:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in academic terms API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { term_name, academic_year_id, start_date, end_date, is_active, description } = body

    if (!term_name || !academic_year_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("academic_terms")
      .insert([
        {
          name: term_name,
          academic_year_id,
          start_date,
          end_date,
          is_active: is_active ?? true,
          is_current: false,
          description,
        },
      ])
      .select("*")

    if (error) {
      console.error("Error creating academic term:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error in academic terms POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
