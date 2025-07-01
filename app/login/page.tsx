"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, GraduationCap, UserCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { useStudentAuth } from "@/contexts/student-auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login: adminLogin } = useAuth()
  const { login: teacherLogin } = useTeacherAuth()
  const { login: studentLogin } = useStudentAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form states for each user type
  const [adminForm, setAdminForm] = useState({ email: "", password: "" })
  const [teacherForm, setTeacherForm] = useState({ email: "", password: "" })
  const [studentForm, setStudentForm] = useState({ email: "", password: "" })

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const success = await adminLogin(adminForm.email, adminForm.password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (err) {
      setError("An error occurred during admin login")
      console.error("Admin login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const success = await teacherLogin(teacherForm.email, teacherForm.password)
      if (success) {
        router.push("/teacher-dashboard")
      } else {
        setError("Invalid teacher credentials")
      }
    } catch (err) {
      setError("An error occurred during teacher login")
      console.error("Teacher login error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const success = await studentLogin(studentForm.email, studentForm.password)
      if (success) {
        router.push("/student-dashboard")
      } else {
        setError("Invalid student credentials")
      }
    } catch (err) {
      setError("An error occurred during student login")
      console.error("Student login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">School Portal Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Teacher</span>
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Student</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Admin Login */}
              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Admin Login</span>
                    </CardTitle>
                    <CardDescription>Sign in with your administrator credentials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          placeholder="admin@school.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="admin-password"
                            type={showPassword ? "text" : "password"}
                            value={adminForm.password}
                            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in as Admin"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Teacher Login */}
              <TabsContent value="teacher">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Teacher Login</span>
                    </CardTitle>
                    <CardDescription>Sign in with your teacher credentials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleTeacherSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="teacher-email">Email</Label>
                        <Input
                          id="teacher-email"
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          placeholder="teacher@school.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="teacher-password"
                            type={showPassword ? "text" : "password"}
                            value={teacherForm.password}
                            onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in as Teacher"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Student Login */}
              <TabsContent value="student">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="h-5 w-5" />
                      <span>Student Login</span>
                    </CardTitle>
                    <CardDescription>Sign in with your student credentials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleStudentSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="student-email">Email</Label>
                        <Input
                          id="student-email"
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                          placeholder="student@school.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="student-password"
                            type={showPassword ? "text" : "password"}
                            value={studentForm.password}
                            onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in as Student"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Admin:</strong> super@school.com / admin123
                </p>
                <p>
                  <strong>Teacher:</strong> mary.johnson@school.com / teacher123
                </p>
                <p>
                  <strong>Student:</strong> chioma.okoro@student.com / student123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
