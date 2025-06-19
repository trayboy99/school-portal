"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import TeacherDashboard from "@/components/teacher-dashboard/teacher-dashboard"

export default function TeacherDashboardPage() {
  const { teacher, isLoading } = useTeacherAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !teacher) {
      router.push("/teacher-login")
    }
  }, [teacher, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return null
  }

  return <TeacherDashboard />
}
