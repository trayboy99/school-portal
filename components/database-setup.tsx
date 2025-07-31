"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { SupabaseSetup } from "./supabase-setup"
import { ManualDatabaseSetup } from "./manual-database-setup"

export function DatabaseSetup() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runSetup = async () => {
    setSetupStatus("loading")
    setMessage("Setting up database tables...")

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setSetupStatus("success")
        setMessage("Database setup completed successfully!")
      } else {
        setSetupStatus("error")
        setMessage(result.error || "Setup failed")
      }
    } catch (error) {
      setSetupStatus("error")
      setMessage("Network error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic Database Setup</CardTitle>
          <CardDescription>This will create all necessary tables and insert sample data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runSetup} disabled={setupStatus === "loading"} className="w-full">
            {setupStatus === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Database Setup
          </Button>

          {message && (
            <Alert
              className={
                setupStatus === "error" ? "border-red-200" : setupStatus === "success" ? "border-green-200" : ""
              }
            >
              {setupStatus === "success" && <CheckCircle className="h-4 w-4" />}
              {setupStatus === "error" && <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <SupabaseSetup />
      <ManualDatabaseSetup />
    </div>
  )
}
