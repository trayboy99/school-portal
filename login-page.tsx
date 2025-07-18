"use client"

import type React from "react"
import { useState } from "react"
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
  const { login: adminLogin } = useAuth()
  const { login: teacherLogin } = useTeacherAuth()

  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" })
  const [studentCredentials, setStudentCredentials] = useState({ email: "", password: "" })
  const [teacherCredentials, setTeacherCredentials] = useState({ email: "", password: "" })

  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await adminLogin(adminCredentials.username, adminCredentials.password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid admin credentials")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await adminLogin(studentCredentials.email, studentCredentials.password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid student credentials")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await teacherLogin(teacherCredentials.email, teacherCredentials.password)
      if (success) {
        router.push("/")
      } else {
        setError("Invalid teacher credentials")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
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

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Email</Label>
                    <Input
                      id="admin-username"
                      type="email"
                      placeholder="super@school.com"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
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
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Admin"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email Address</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="chioma.okafor@student.com"
                      value={studentCredentials.email}
                      onChange={(e) => setStudentCredentials({ ...studentCredentials, email: e.target.value })}
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
                        value={studentCredentials.password}
                        onChange={(e) => setStudentCredentials({ ...studentCredentials, password: e.target.value })}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Student"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      placeholder="mary.johnson@school.com"
                      value={teacherCredentials.email}
                      onChange={(e) => setTeacherCredentials({ ...teacherCredentials, email: e.target.value })}
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
                        value={teacherCredentials.password}
                        onChange={(e) => setTeacherCredentials({ ...teacherCredentials, password: e.target.value })}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Teacher"}
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
