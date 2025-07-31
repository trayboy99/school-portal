import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyMDI4NiwiZXhwIjoyMDY1NTk2Mjg2fQ.Pp5C-NEFfEd6JuKFN7E662AueNP88fu_UspOm6FSdy4"

export async function GET() {
  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Test connection
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from("students")
      .select("count", { count: "exact", head: true })

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_KEY,
        platform: process.env.VERCEL ? "Vercel" : "Local",
      },
      connection: {
        success: !connectionError,
        error: connectionError?.message,
      },
      tables: {},
    }

    // Check students table
    try {
      const { data: students, error: studentsError } = await supabaseAdmin.from("students").select("*").limit(5)

      debugInfo.tables.students = {
        exists: !studentsError,
        count: students?.length || 0,
        error: studentsError?.message,
        sampleData: students?.slice(0, 3) || [],
      }
    } catch (error) {
      debugInfo.tables.students = {
        exists: false,
        error: error.message,
      }
    }

    // Check teachers table
    try {
      const { data: teachers, error: teachersError } = await supabaseAdmin.from("teachers").select("*").limit(5)

      debugInfo.tables.teachers = {
        exists: !teachersError,
        count: teachers?.length || 0,
        error: teachersError?.message,
        sampleData: teachers?.slice(0, 3) || [],
      }
    } catch (error) {
      debugInfo.tables.teachers = {
        exists: false,
        error: error.message,
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
