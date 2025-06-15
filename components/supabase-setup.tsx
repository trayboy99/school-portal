"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupabaseSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const setupDatabase = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/setup-supabase", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setMessage("🎉 Supabase database tables created successfully!")
        setIsSuccess(true)
      } else {
        setMessage(`❌ Failed to create database tables: ${result.error}`)
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage("❌ Error setting up database")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Database Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Click the button below to create all database tables for your school portal in Supabase.
        </p>

        <Button onClick={setupDatabase} disabled={isLoading || isSuccess} className="w-full">
          {isLoading ? "Creating Tables..." : isSuccess ? "Setup Complete!" : "Setup Supabase Database"}
        </Button>

        {message && (
          <div
            className={`p-3 rounded text-sm ${isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message}
          </div>
        )}

        {isSuccess && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>✅ Students table</p>
            <p>✅ Teachers table</p>
            <p>✅ Classes table</p>
            <p>✅ Subjects table</p>
            <p>✅ Exams table</p>
            <p>✅ Student scores table</p>
            <p>✅ Settings table</p>
          </div>
        )}

        {isSuccess && (
          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-medium text-blue-800">Next Steps:</p>
            <p className="text-blue-700 text-xs mt-1">
              Visit your Supabase dashboard to see the tables and start migrating your existing functionality!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
