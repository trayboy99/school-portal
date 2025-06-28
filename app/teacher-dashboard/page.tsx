"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { TeacherDashboard } from "@/components/teacher-dashboard/teacher-dashboard"

export default function TeacherDashboardPage() {
  const { teacher, loading } = useTeacherAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !teacher) {
      router.push("/login")
    }
  }, [teacher, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!teacher) {
    return null
  }

  return <TeacherDashboard />
}
