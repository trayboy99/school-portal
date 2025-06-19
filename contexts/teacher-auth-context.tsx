"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Teacher {
  id: string
  teacher_id: string
  first_name: string
  middle_name?: string
  surname: string
  full_name: string
  email: string
  phone: string
  department: string
  subjects: string[]
  classes: string[]
  status: string
}

interface TeacherAuthContextType {
  teacher: Teacher | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined)

export function TeacherAuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth() // Get user from main auth context
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // When user changes, fetch teacher data if user is a teacher
    if (user && user.userType === "teacher") {
      fetchTeacherData(user.email)
    } else {
      setTeacher(null)
      setIsLoading(false)
    }
  }, [user])

  const fetchTeacherData = async (email: string) => {
    setIsLoading(true)
    console.log("Fetching teacher data for email:", email)

    try {
      // Get teacher details from teachers table
      const { data: teacherData, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .eq("status", "Active")
        .single()

      console.log("Teacher data from database:", teacherData)

      if (error || !teacherData) {
        console.error("Error fetching teacher data:", error)
        setTeacher(null)
        setIsLoading(false)
        return
      }

      // Convert to teacher object format
      const teacherObj: Teacher = {
        id: teacherData.id.toString(),
        teacher_id: teacherData.teacher_id,
        first_name: teacherData.first_name,
        middle_name: teacherData.middle_name,
        surname: teacherData.surname,
        full_name: `${teacherData.first_name} ${teacherData.middle_name || ""} ${teacherData.surname}`.trim(),
        email: teacherData.email,
        phone: teacherData.phone || "",
        department: teacherData.department,
        subjects: teacherData.subjects || [],
        classes: teacherData.classes || [],
        status: teacherData.status,
      }

      console.log("Converted teacher object:", teacherObj)
      setTeacher(teacherObj)
    } catch (error) {
      console.error("Error in fetchTeacherData:", error)
      setTeacher(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is handled by the main auth context now
    return false
  }

  const logout = () => {
    setTeacher(null)
  }

  return (
    <TeacherAuthContext.Provider value={{ teacher, login, logout, isLoading }}>{children}</TeacherAuthContext.Provider>
  )
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext)
  if (context === undefined) {
    throw new Error("useTeacherAuth must be used within a TeacherAuthProvider")
  }
  return context
}
