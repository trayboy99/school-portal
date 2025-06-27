"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { StudentDashboard } from "@/components/student-dashboard/student-dashboard"

export default function StudentDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("Student dashboard page - User:", user, "Loading:", isLoading)
    if (!isLoading && (!user || user.userType !== "student")) {
      console.log("Redirecting to login - no user or not student")
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.userType !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  console.log("Rendering StudentDashboard component for user:", user)
  return <StudentDashboard />
}
