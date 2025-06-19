"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Dashboard from "@/components/dashboard/dashboard"
import TeacherDashboard from "@/components/teacher-dashboard/teacher-dashboard"
import LoginPage from "@/login-page"

export default function Home() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect automatically - let users stay where they are
    // Only redirect if they're not logged in and trying to access a protected route
  }, [user, isLoading, router])

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
          <p className="text-gray-600 mb-4">Welcome, {user.firstName}!</p>
          <button onClick={() => logout()} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    )
  }

  // Default to admin dashboard
  return <Dashboard />
}
