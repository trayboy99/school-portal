"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { StudentDashboard } from "@/components/student-dashboard/student-dashboard"

export default function StudentDashboardPage() {
  const { student, loading } = useStudentAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !student) {
      router.push("/login")
    }
  }, [student, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return <StudentDashboard />
}
