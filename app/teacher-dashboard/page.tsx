"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import TeacherDashboard from "@/components/teacher-dashboard/teacher-dashboard"

export default function TeacherDashboardPage() {
  const { teacher, loading } = useTeacherAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !teacher) {
      router.push("/login")
    }
  }, [teacher, loading, router, mounted])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return null
  }

  return <TeacherDashboard />
}
