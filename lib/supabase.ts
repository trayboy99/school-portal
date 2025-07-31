import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xocxmeugzxycognruqkf.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvY3htZXVnenh5Y29nbnJ1cWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjAyODYsImV4cCI6MjA2NTU5NjI4Nn0.YSzYULXJV5f7lQHaJpOJXOJJQKJJQKJJQKJJQKJJQKJ"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log("=== Supabase Environment Debug ===")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("Platform:", process.env.VERCEL ? "Vercel" : "Local")
console.log("All SUPABASE env vars:", {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
})

let supabaseAdmin = null

try {
  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    console.log("✅ Admin Supabase client created successfully")
  } else {
    console.warn("❌ Cannot create admin Supabase client")
  }
} catch (error) {
  console.error("Error creating Supabase clients:", error)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { supabaseAdmin }

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
}

export function getSupabaseConfig() {
  return {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    url: supabaseUrl,
    isFullyConfigured: !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey),
    platform: process.env.VERCEL ? "Vercel" : "Local",
  }
}
