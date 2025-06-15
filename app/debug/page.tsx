"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, Key, Globe } from "lucide-react"
import { useState } from "react"

export default function DebugPage() {
  const [connectionTest, setConnectionTest] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [errorDetails, setErrorDetails] = useState<string>("")

  // Environment variables check
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const testConnection = async () => {
    setConnectionTest("testing")
    try {
      const { createClient } = await import("@supabase/supabase-js")

      if (!envVars.supabaseUrl || !envVars.supabaseAnonKey) {
        throw new Error("Missing environment variables")
      }

      const supabase = createClient(envVars.supabaseUrl, envVars.supabaseAnonKey)

      // Test connection
      const { error } = await supabase.from("students").select("count", { count: "exact", head: true })

      if (error) {
        throw error
      }

      setConnectionTest("success")
      setErrorDetails("")
    } catch (error: any) {
      setConnectionTest("error")
      setErrorDetails(error.message || "Unknown error")
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Configuration Debug</h1>
        <p className="text-gray-600 mt-2">Check your Supabase configuration and connection</p>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </CardTitle>
          <CardDescription>Check if all required environment variables are set</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
              {envVars.supabaseUrl ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary">{envVars.supabaseUrl}</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Missing</Badge>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              {envVars.supabaseAnonKey ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary">{envVars.supabaseAnonKey.substring(0, 20)}...</Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Missing</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Test
          </CardTitle>
          <CardDescription>Test the connection to your Supabase database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testConnection}
            disabled={connectionTest === "testing" || !envVars.supabaseUrl || !envVars.supabaseAnonKey}
            className="w-full"
          >
            {connectionTest === "testing" ? "Testing Connection..." : "Test Connection"}
          </Button>

          {connectionTest === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700">✅ Connection successful!</span>
            </div>
          )}

          {connectionTest === "error" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">❌ Connection failed</span>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm font-medium">Error Details:</p>
                <code className="text-xs text-red-600">{errorDetails}</code>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium">1. Get Supabase Credentials</h4>
              <p className="text-sm text-gray-600">Go to Supabase Dashboard → Settings → API</p>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium">2. Add to Vercel</h4>
              <p className="text-sm text-gray-600">Vercel Dashboard → Project → Settings → Environment Variables</p>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium">3. Redeploy</h4>
              <p className="text-sm text-gray-600">Trigger a new deployment after adding variables</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
