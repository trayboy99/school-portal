"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Database, Server, Users, Settings } from "lucide-react"

interface DebugInfo {
  environment: any
  database: any
  students: any[]
  teachers: any[]
}

export function DebugDashboard() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      // Check environment
      const envResponse = await fetch("/api/test-env")
      const envData = await envResponse.json()

      // Check students
      const studentsResponse = await fetch("/api/admin/students")
      const studentsData = await studentsResponse.json()

      // Check teachers
      const teachersResponse = await fetch("/api/admin/teachers")
      const teachersData = await teachersResponse.json()

      setDebugInfo({
        environment: envData,
        database: { connected: true },
        students: Array.isArray(studentsData) ? studentsData : [],
        teachers: Array.isArray(teachersData) ? teachersData : [],
      })
    } catch (error) {
      console.error("Diagnostics failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  if (!debugInfo) {
    return <div className="text-center py-8">Loading diagnostics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment Status
          </CardTitle>
          <CardDescription>System environment and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Platform Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <Badge variant="outline">{debugInfo.environment.platform}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge variant="outline">{debugInfo.environment.environment}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Supabase URL:</span>
                  <span className="font-mono text-xs">{debugInfo.environment.supabaseUrl}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Environment Variables</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {debugInfo.environment.hasAnonKey ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">SUPABASE_ANON_KEY</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugInfo.environment.hasServiceKey ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">SUPABASE_SERVICE_KEY</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>Database connectivity and data overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{debugInfo.students.length}</div>
              <p className="text-sm text-gray-600">Students</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{debugInfo.teachers.length}</div>
              <p className="text-sm text-gray-600">Teachers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <p className="text-sm text-gray-600">Admin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sample Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugInfo.students.slice(0, 3).map((student) => (
              <div key={student.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">
                    {student.first_name} {student.surname}
                  </p>
                  <p className="text-sm text-gray-600">{student.username}</p>
                </div>
                <Badge variant="outline">
                  {student.current_class}-{student.section}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={runDiagnostics} disabled={loading} className="w-full">
              Refresh Diagnostics
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href="/setup">Database Setup</a>
            </Button>
            <Button variant="outline" asChild className="w-full bg-transparent">
              <a href="/admin">Admin Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
