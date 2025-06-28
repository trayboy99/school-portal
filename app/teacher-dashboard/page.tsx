"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import TeacherDashboard from "@/components/teacher-dashboard/teacher-dashboard"

export default function TeacherDashboardPage() {
  const { teacher, isLoading } = useTeacherAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("=== TEACHER DASHBOARD PAGE ===")
    console.log("Teacher:", teacher)
    console.log("IsLoading:", isLoading)

    if (!isLoading && !teacher) {
      console.log("No teacher found, redirecting to login")
      router.push("/login")
    }
  }, [teacher, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in as a teacher to access this dashboard.</p>
        </div>
      </div>
    )
  }

  console.log("Rendering TeacherDashboard component")
  return <TeacherDashboard />
}
