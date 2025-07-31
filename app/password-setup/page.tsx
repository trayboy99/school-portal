"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Key, Users, GraduationCap, Save, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  first_name?: string
  surname?: string
  name?: string
  department?: string
  current_class?: string
  custom_password?: string
  password_hash?: string
  type: "teacher" | "student"
}

export default function PasswordSetupPage() {
  const [teachers, setTeachers] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const router = useRouter()

  const fetchUsers = async () => {
    try {
      const [teachersRes, studentsRes] = await Promise.all([fetch("/api/admin/teachers"), fetch("/api/admin/students")])

      if (teachersRes.ok) {
        const teacherData = await teachersRes.json()
        setTeachers(teacherData.map((t: any) => ({ ...t, type: "teacher" as const })))
      }

      if (studentsRes.ok) {
        const studentData = await studentsRes.json()
        setStudents(studentData.map((s: any) => ({ ...s, type: "student" as const })))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (user: User, password: string) => {
    setUpdating(user.id)
    try {
      const endpoint = user.type === "teacher" ? `/api/admin/teachers/${user.id}` : `/api/admin/students/${user.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          custom_password: password,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Password updated for ${user.username}`,
        })

        // Update local state
        if (user.type === "teacher") {
          setTeachers((prev) => prev.map((t) => (t.id === user.id ? { ...t, custom_password: password } : t)))
        } else {
          setStudents((prev) => prev.map((s) => (s.id === user.id ? { ...s, custom_password: password } : s)))
        }

        // Clear password input
        setPasswords((prev) => ({ ...prev, [user.id]: "" }))
      } else {
        throw new Error("Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const generateDefaultPasswords = async () => {
    setUpdating("bulk")
    try {
      const allUsers = [...teachers, ...students]
      const updates = []

      for (const user of allUsers) {
        if (!user.custom_password) {
          const defaultPassword = user.type === "teacher" ? "teacher123" : "student123"
          const endpoint = user.type === "teacher" ? `/api/admin/teachers/${user.id}` : `/api/admin/students/${user.id}`

          updates.push(
            fetch(endpoint, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                custom_password: defaultPassword,
              }),
            }),
          )
        }
      }

      await Promise.all(updates)

      toast({
        title: "Success",
        description: "Default passwords generated for all users without passwords",
      })

      fetchUsers() // Refresh data
    } catch (error) {
      console.error("Error generating passwords:", error)
      toast({
        title: "Error",
        description: "Failed to generate default passwords",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  const usersWithoutPasswords = [...teachers, ...students].filter((u) => !u.custom_password)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Setup</h1>
              <p className="text-gray-600">Set up login passwords for teachers and students</p>
            </div>

            {usersWithoutPasswords.length > 0 && (
              <Button
                onClick={generateDefaultPasswords}
                disabled={updating === "bulk"}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Key className="h-4 w-4 mr-2" />
                {updating === "bulk" ? "Generating..." : `Generate Default Passwords (${usersWithoutPasswords.length})`}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Teachers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teachers ({teachers.length})
              </CardTitle>
              <CardDescription>Set up login passwords for teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {teacher.first_name} {teacher.surname}
                      </p>
                      <p className="text-sm text-gray-600">@{teacher.username}</p>
                      <p className="text-xs text-gray-500">{teacher.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {teacher.custom_password ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Has Password
                        </Badge>
                      ) : (
                        <>
                          <Input
                            type="password"
                            placeholder="Set password"
                            value={passwords[teacher.id] || ""}
                            onChange={(e) => setPasswords((prev) => ({ ...prev, [teacher.id]: e.target.value }))}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => updatePassword(teacher, passwords[teacher.id] || "teacher123")}
                            disabled={updating === teacher.id}
                          >
                            {updating === teacher.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students ({students.length})
              </CardTitle>
              <CardDescription>Set up login passwords for students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {student.first_name} {student.surname}
                      </p>
                      <p className="text-sm text-gray-600">@{student.username}</p>
                      <p className="text-xs text-gray-500">{student.current_class}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.custom_password ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Has Password
                        </Badge>
                      ) : (
                        <>
                          <Input
                            type="password"
                            placeholder="Set password"
                            value={passwords[student.id] || ""}
                            onChange={(e) => setPasswords((prev) => ({ ...prev, [student.id]: e.target.value }))}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => updatePassword(student, passwords[student.id] || "student123")}
                            disabled={updating === student.id}
                          >
                            {updating === student.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{teachers.length}</p>
                <p className="text-sm text-gray-600">Total Teachers</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{students.length}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{usersWithoutPasswords.length}</p>
                <p className="text-sm text-gray-600">Without Passwords</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Default Login Credentials:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p>
                  <strong>Teachers:</strong> [username] / teacher123 (default)
                </p>
                <p>
                  <strong>Students:</strong> [username] / student123 (default)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
