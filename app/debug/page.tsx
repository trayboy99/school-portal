"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Database, Users, GraduationCap } from "lucide-react"

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug")
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      setError("Failed to fetch debug information")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading debug information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchDebugInfo} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Database Debug Information</h1>
          <div className="flex gap-2">
            <Button onClick={fetchDebugInfo} variant="outline">
              Refresh
            </Button>
            <Button asChild>
              <a href="/">Back to Login</a>
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Environment Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span>Supabase URL:</span>
                {debugInfo?.environment?.hasUrl ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Service Key:</span>
                {debugInfo?.environment?.hasServiceKey ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Set
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Platform:</span>
                <Badge variant="outline">{debugInfo?.environment?.platform}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {debugInfo?.connection?.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Connected successfully</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Connection failed: {debugInfo?.connection?.error}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tables Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Students Table
              </CardTitle>
              <CardDescription>Student login credentials and data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {debugInfo?.tables?.students?.exists ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Exists
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>

                {debugInfo?.tables?.students?.exists && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Records found: {debugInfo.tables.students.count}</p>
                    {debugInfo.tables.students.sampleData?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Sample records:</p>
                        {debugInfo.tables.students.sampleData.map((student, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                            <p>
                              <strong>Username:</strong> {student.username}
                            </p>
                            <p>
                              <strong>Name:</strong> {student.first_name} {student.surname}
                            </p>
                            <p>
                              <strong>Class:</strong> {student.current_class}
                            </p>
                            <p>
                              <strong>Has Password:</strong>{" "}
                              {student.password_hash || student.custom_password ? "Yes" : "No"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {debugInfo?.tables?.students?.error && (
                  <p className="text-sm text-red-600">Error: {debugInfo.tables.students.error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teachers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teachers Table
              </CardTitle>
              <CardDescription>Teacher login credentials and data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {debugInfo?.tables?.teachers?.exists ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Exists
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>

                {debugInfo?.tables?.teachers?.exists && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Records found: {debugInfo.tables.teachers.count}</p>
                    {debugInfo.tables.teachers.sampleData?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Sample records:</p>
                        {debugInfo.tables.teachers.sampleData.map((teacher, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                            <p>
                              <strong>Username:</strong> {teacher.username}
                            </p>
                            <p>
                              <strong>Name:</strong> {teacher.first_name} {teacher.surname}
                            </p>
                            <p>
                              <strong>Department:</strong> {teacher.department}
                            </p>
                            <p>
                              <strong>Has Password:</strong> {teacher.custom_password ? "Yes" : "No"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {debugInfo?.tables?.teachers?.error && (
                  <p className="text-sm text-red-600">Error: {debugInfo.tables.teachers.error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Available Login Credentials</CardTitle>
            <CardDescription>Use these credentials to test the login system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600">Admin (Always Available)</h4>
                <p className="text-sm text-gray-600">Username: admin | Password: admin123</p>
              </div>

              {debugInfo?.tables?.students?.count > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600">Students ({debugInfo.tables.students.count} available)</h4>
                  <p className="text-sm text-gray-600">Check the sample data above for usernames and passwords</p>
                </div>
              )}

              {debugInfo?.tables?.teachers?.count > 0 && (
                <div>
                  <h4 className="font-medium text-purple-600">
                    Teachers ({debugInfo.tables.teachers.count} available)
                  </h4>
                  <p className="text-sm text-gray-600">Check the sample data above for usernames and passwords</p>
                </div>
              )}

              {!debugInfo?.tables?.students?.count && !debugInfo?.tables?.teachers?.count && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    No student or teacher records found. Visit the{" "}
                    <a href="/setup" className="underline">
                      setup page
                    </a>{" "}
                    to create sample data.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">Last updated: {debugInfo?.timestamp}</div>
      </div>
    </div>
  )
}
