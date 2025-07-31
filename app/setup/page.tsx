"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Database } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState("")

  const runSetup = async () => {
    try {
      setLoading(true)
      setError("")
      setResults(null)

      const response = await fetch("/api/setup-database", {
        method: "POST",
      })

      const data = await response.json()
      setResults(data)

      if (!data.success) {
        setError(data.message || "Setup failed")
      }
    } catch (err) {
      setError("Failed to run database setup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Database Setup</h1>
          <Button asChild variant="outline">
            <a href="/">Back to Login</a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Initialize School Database
            </CardTitle>
            <CardDescription>
              This will create the necessary tables and add sample data for testing the login system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">What this setup will do:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create students table with sample student records</li>
                <li>• Create teachers table with sample teacher records</li>
                <li>• Add login credentials for testing</li>
                <li>• Set up basic school data structure</li>
              </ul>
            </div>

            {error && (
              <Alert className="border-red-200">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={runSetup} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Setting up database..." : "Run Database Setup"}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Setup Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.steps?.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {step.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={step.success ? "text-green-700" : "text-red-700"}>{step.message}</span>
                  </div>
                ))}

                {results.success && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Test Credentials Created:</h4>
                    <div className="text-sm text-green-700 space-y-2">
                      <div>
                        <strong>Admin:</strong> admin / admin123
                      </div>
                      <div>
                        <strong>Student:</strong> student1 / student123
                      </div>
                      <div>
                        <strong>Teacher:</strong> teacher1 / teacher123
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button asChild>
                    <a href="/">Test Login</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/debug">View Debug Info</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
