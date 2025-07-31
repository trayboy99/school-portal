"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export function SupabaseSetup() {
  const [envStatus, setEnvStatus] = useState<"idle" | "checking" | "success" | "error">("idle")
  const [envMessage, setEnvMessage] = useState("")

  const checkEnvironment = async () => {
    setEnvStatus("checking")
    try {
      const response = await fetch("/api/test-env")
      const result = await response.json()

      if (response.ok) {
        setEnvStatus("success")
        setEnvMessage("Environment variables are properly configured!")
      } else {
        setEnvStatus("error")
        setEnvMessage(result.error || "Environment check failed")
      }
    } catch (error) {
      setEnvStatus("error")
      setEnvMessage("Failed to check environment variables")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Configuration</CardTitle>
        <CardDescription>Verify your Supabase environment variables are set up correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Required Environment Variables:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• NEXT_PUBLIC_SUPABASE_URL</li>
            <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>• SUPABASE_SERVICE_ROLE_KEY</li>
          </ul>
        </div>

        <Button onClick={checkEnvironment} disabled={envStatus === "checking"}>
          Check Environment Variables
        </Button>

        {envMessage && (
          <Alert
            className={envStatus === "error" ? "border-red-200" : envStatus === "success" ? "border-green-200" : ""}
          >
            {envStatus === "success" && <CheckCircle className="h-4 w-4" />}
            {envStatus === "error" && <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{envMessage}</AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Need help setting up Supabase? Visit the documentation:</p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Supabase Docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
