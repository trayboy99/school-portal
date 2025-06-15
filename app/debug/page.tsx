"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { supabaseConfig, isSupabaseConfigured } from "@/lib/supabase"

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const testConnection = async () => {
    try {
      if (!isSupabaseConfigured()) {
        alert("❌ Supabase is not properly configured. Check environment variables.")
        return
      }

      const { supabase } = await import("@/lib/supabase")
      const { data, error } = await supabase.from("students").select("count", { count: "exact", head: true })

      if (error) {
        alert(`❌ Connection failed: ${error.message}`)
      } else {
        alert("✅ Supabase connection successful!")
      }
    } catch (error) {
      alert(`❌ Connection error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Connection Debug</h1>
          <p className="text-gray-600">Check your database connection and configuration</p>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSupabaseConfigured() ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isSupabaseConfigured() ? "default" : "destructive"}>
                {isSupabaseConfigured() ? "✅ Ready" : "❌ Not Configured"}
              </Badge>
              {isSupabaseConfigured() && (
                <Button onClick={testConnection} size="sm">
                  Test Connection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Status */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables Status:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(supabaseConfig).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-medium">{key}:</span>
                <Badge variant={status.includes("✅") ? "default" : "destructive"}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environment Variable Values (for debugging) */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variable Values:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{key}:</span>
                  <Badge variant={value ? "default" : "destructive"}>{value ? "Set" : "Missing"}</Badge>
                </div>
                {value && (
                  <div className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                    {key.includes("KEY") ? `${value.substring(0, 20)}...` : value}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Supabase Dashboard
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/setup" target="_blank" rel="noopener noreferrer">
                  Database Setup
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        {!isSupabaseConfigured() && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">🚨 Configuration Issues Detected</CardTitle>
            </CardHeader>
            <CardContent className="text-red-700 space-y-2">
              <p>
                <strong>To fix this:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Go to your <strong>Vercel Dashboard</strong>
                </li>
                <li>
                  Click your project → <strong>Settings</strong> → <strong>Environment Variables</strong>
                </li>
                <li>Add the missing environment variables from your Supabase project</li>
                <li>
                  <strong>Redeploy</strong> your project
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
