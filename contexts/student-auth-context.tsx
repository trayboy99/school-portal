"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Student {
  id: number
  first_name: string
  middle_name?: string
  surname: string
  email: string
  phone?: string
  gender?: string
  date_of_birth?: string
  current_class: string
  section?: string
  roll_no?: string
  reg_number?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  home_address?: string
  status: string
  created_at: string
  updated_at: string
}

interface StudentAuthContextType {
  student: Student | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined)

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if student is already logged in
    const storedStudent = localStorage.getItem("student")
    if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent))
      } catch (error) {
        console.error("Error parsing stored student:", error)
        localStorage.removeItem("student")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Student login attempt for:", email)

      // Query the students table directly
      const { data: studentData, error } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .eq("status", "Active")
        .single()

      console.log("Student query result:", { studentData, error })

      if (error) {
        console.error("Student login error:", error)
        return false
      }

      if (!studentData) {
        console.log("No student found with email:", email)
        return false
      }

      // Verify password (assuming password_hash column exists)
      if (studentData.password_hash !== password) {
        console.log("Password verification failed for student:", email)
        return false
      }

      console.log("Password verified, setting student in context")
      setStudent(studentData)
      localStorage.setItem("student", JSON.stringify(studentData))
      return true
    } catch (error) {
      console.error("Student login error:", error)
      return false
    }
  }

  const logout = () => {
    setStudent(null)
    localStorage.removeItem("student")
  }

  return (
    <StudentAuthContext.Provider value={{ student, login, logout, isLoading }}>{children}</StudentAuthContext.Provider>
  )
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext)
  if (context === undefined) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider")
  }
  return context
}
