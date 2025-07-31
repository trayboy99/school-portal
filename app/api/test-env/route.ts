import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const missing = []
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing environment variables: ${missing.join(", ")}` }, { status: 400 })
    }

    // Check if we're on Vercel
    const isVercel = process.env.VERCEL === "1"
    const vercelEnv = process.env.VERCEL_ENV || "development"

    return NextResponse.json({
      message: "All environment variables are set",
      platform: isVercel ? "Vercel" : "Local",
      environment: vercelEnv,
      supabaseUrl: supabaseUrl?.substring(0, 20) + "...",
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check environment" }, { status: 500 })
  }
}
