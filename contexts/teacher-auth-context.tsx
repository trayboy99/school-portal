"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

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
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if teacher is logged in on app start
    const savedTeacher = localStorage.getItem("teacher")
    if (savedTeacher) {
      setTeacher(JSON.parse(savedTeacher))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Query the teachers table for authentication
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .eq("status", "Active")
        .single()

      if (error || !data) {
        console.error("Teacher login error:", error)
        setIsLoading(false)
        return false
      }

      // In a real app, you'd verify the password hash here
      // For now, we'll use a simple check (replace with proper password verification)
      if (password === "teacher123" || password === "password") {
        const teacherData: Teacher = {
          id: data.id.toString(),
          teacher_id: data.teacher_id,
          first_name: data.first_name,
          middle_name: data.middle_name,
          surname: data.surname,
          full_name: `${data.first_name} ${data.middle_name || ""} ${data.surname}`.trim(),
          email: data.email,
          phone: data.phone || "",
          department: data.department,
          subjects: data.subjects || [],
          classes: data.classes || [],
          status: data.status,
        }

        setTeacher(teacherData)
        localStorage.setItem("teacher", JSON.stringify(teacherData))
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Teacher login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setTeacher(null)
    localStorage.removeItem("teacher")
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
