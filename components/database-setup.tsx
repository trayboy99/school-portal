"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const setupDatabase = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setMessage("🎉 Database tables created successfully!")
        setIsSuccess(true)
      } else {
        setMessage("❌ Failed to create database tables")
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
        <CardTitle>Database Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Click the button below to create all database tables for your school portal.
        </p>

        <Button onClick={setupDatabase} disabled={isLoading || isSuccess} className="w-full">
          {isLoading ? "Creating Tables..." : isSuccess ? "Setup Complete!" : "Setup Database"}
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
            <p>✅ Users table</p>
            <p>✅ Settings table</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
