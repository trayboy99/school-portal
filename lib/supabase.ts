import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks and validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create singleton instances to avoid multiple client warnings
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

// Create the main Supabase client for client-side operations (singleton)
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  }
  return supabaseInstance
})()

// Create admin client for server-side operations (singleton)
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    return null
  }

  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdminInstance
})()

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Export configuration status for debugging
export const supabaseConfig = {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  anonKey: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  serviceRoleKey: supabaseServiceRoleKey ? "✅ Set" : "❌ Missing",
  isConfigured: isSupabaseConfigured(),
}

// Helper function to get a fresh client instance if needed
export const getSupabaseClient = () => supabase

// Helper function to get admin client if available
export const getSupabaseAdmin = () => supabaseAdmin
