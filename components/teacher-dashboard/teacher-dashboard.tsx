"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import { useEffect } from "react"

const TeacherDashboard = () => {
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const teacherData =
    user?.userType === "teacher"
      ? {
          id: user.dbId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          department: user.department,
          phone: user.phone,
        }
      : null

  if (!teacherData) {
    return <div>Loading or not authorized...</div>
  }

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {teacherData.name}!</p>
      <p>Email: {teacherData.email}</p>
      <p>Department: {teacherData.department}</p>
      <p>Phone: {teacherData.phone}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default TeacherDashboard
