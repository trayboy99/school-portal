import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get current academic year
    const { data: currentYear, error: yearError } = await supabase
      .from("academic_years")
      .select("id, name")
      .eq("is_current", true)
      .single()

    if (yearError) {
      console.error("Error fetching current academic year:", yearError)
      return NextResponse.json(
        {
          success: false,
          error: "No current academic year found",
        },
        { status: 404 },
      )
    }

    // Get current academic term
    const { data: currentTerm, error: termError } = await supabase
      .from("academic_terms")
      .select("id, name")
      .eq("is_current", true)
      .single()

    if (termError) {
      console.error("Error fetching current academic term:", termError)
      return NextResponse.json(
        {
          success: false,
          error: "No current academic term found",
        },
        { status: 404 },
      )
    }

    const academicInfo = {
      academic_year_id: currentYear.id,
      academic_term_id: currentTerm.id,
      year_name: currentYear.name,
      term_name: currentTerm.name,
    }

    return NextResponse.json({
      success: true,
      academic_info: academicInfo,
    })
  } catch (error) {
    console.error("Error in current-academic-info GET:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
