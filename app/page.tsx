"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Dashboard from "@/components/dashboard/dashboard"
import TeacherDashboard from "@/components/teacher-dashboard/teacher-dashboard"
import { StudentDashboard } from "@/components/student-dashboard/student-dashboard"
import LoginPage from "@/login-page"

export default function Home() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  // Show appropriate dashboard based on user type WITHOUT redirecting
  if (user.userType === "teacher") {
    return <TeacherDashboard />
  }

  if (user.userType === "student") {
    return <StudentDashboard />
  }

  // Default to admin dashboard
  return <Dashboard />
}
