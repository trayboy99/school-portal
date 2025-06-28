"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, School, User, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login: adminLogin, user } = useAuth()
  const { login: teacherLogin, teacher } = useTeacherAuth()

  const [adminForm, setAdminForm] = useState({ email: "", password: "" })
  const [studentForm, setStudentForm] = useState({ email: "", password: "" })
  const [teacherForm, setTeacherForm] = useState({ email: "", password: "" })

  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)

  const [adminError, setAdminError] = useState("")
  const [studentError, setStudentError] = useState("")
  const [teacherError, setTeacherError] = useState("")

  const [adminLoading, setAdminLoading] = useState(false)
  const [studentLoading, setStudentLoading] = useState(false)
  const [teacherLoading, setTeacherLoading] = useState(false)

  // Check if already logged in and redirect
  useEffect(() => {
    if (user) {
      if (user.userType === "admin") {
        router.push("/")
      } else if (user.userType === "student") {
        router.push("/student-dashboard")
      }
    }
  }, [user, router])

  useEffect(() => {
    if (teacher) {
      console.log("Teacher logged in, redirecting to teacher dashboard")
      router.push("/teacher-dashboard")
    }
  }, [teacher, router])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError("")

    try {
      const result = await adminLogin(adminForm.email, adminForm.password, "admin")
      if (result.success) {
        router.push("/")
      } else {
        setAdminError(result.error || "Login failed")
      }
    } catch (error) {
      setAdminError("An unexpected error occurred")
    } finally {
      setAdminLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStudentLoading(true)
    setStudentError("")

    try {
      const result = await adminLogin(studentForm.email, studentForm.password, "student")
      if (result.success) {
        router.push("/student-dashboard")
      } else {
        setStudentError(result.error || "Login failed")
      }
    } catch (error) {
      setStudentError("An unexpected error occurred")
    } finally {
      setStudentLoading(false)
    }
  }

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTeacherLoading(true)
    setTeacherError("")

    try {
      console.log("=== TEACHER LOGIN FORM SUBMIT ===")
      console.log("Teacher form:", teacherForm)

      const success = await teacherLogin(teacherForm.email, teacherForm.password)
      console.log("Teacher login result:", success)

      if (success) {
        console.log("Teacher login successful, redirecting to teacher dashboard")
        // Force navigation
        window.location.href = "/teacher-dashboard"
      } else {
        setTeacherError("Invalid email or password")
      }
    } catch (error) {
      console.error("Teacher login error:", error)
      setTeacherError("An unexpected error occurred")
    } finally {
      setTeacherLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <School className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Westminster School</h1>
          <p className="text-gray-600 mt-2">School Management Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Choose your login type and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Teacher
                </TabsTrigger>
              </TabsList>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="super@school.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                      >
                        {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {adminError && (
                    <Alert variant="destructive">
                      <AlertDescription>{adminError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={adminLoading}>
                    {adminLoading ? "Signing in..." : "Sign in as Admin"}
                  </Button>
                </form>
              </TabsContent>

              {/* Student Login */}
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email Address</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="chioma.okafor@student.com"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="student-password"
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                      >
                        {showStudentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {studentError && (
                    <Alert variant="destructive">
                      <AlertDescription>{studentError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={studentLoading}>
                    {studentLoading ? "Signing in..." : "Sign in as Student"}
                  </Button>
                </form>
              </TabsContent>

              {/* Teacher Login */}
              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="mary.johnson@school.com"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="teacher-password"
                        type={showTeacherPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                      >
                        {showTeacherPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {teacherError && (
                    <Alert variant="destructive">
                      <AlertDescription>{teacherError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={teacherLoading}>
                    {teacherLoading ? "Signing in..." : "Sign in as Teacher"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">Admin:</span> super@school.com / admin123
                </p>
                <p>
                  <span className="font-medium">Teacher:</span> mary.johnson@school.com / teacher123
                </p>
                <p>
                  <span className="font-medium">Student:</span> chioma.okafor@student.com / student123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
