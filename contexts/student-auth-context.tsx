"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Student {
  id: number
  roll_no: string
  reg_number: string
  first_name: string
  middle_name: string
  surname: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  home_address: string
  current_class: string
  section: string
  parent_name: string
  parent_phone: string
  parent_email: string
  status: string
}

interface StudentAuthContextType {
  student: Student | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined)

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionToken = sessionStorage.getItem("student_session")
      if (sessionToken) {
        const studentData = JSON.parse(sessionToken)
        setStudent(studentData)
      }
    } catch (error) {
      console.error("Student session check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log("Attempting student login for:", email)

      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .eq("status", "Active")
        .single()

      console.log("Student query result:", { studentData, studentError })

      if (studentData && !studentError) {
        console.log("Found student in database:", studentData)

        const student: Student = {
          id: studentData.id,
          roll_no: studentData.roll_no,
          reg_number: studentData.reg_number,
          first_name: studentData.first_name,
          middle_name: studentData.middle_name || "",
          surname: studentData.surname,
          email: studentData.email,
          phone: studentData.phone,
          date_of_birth: studentData.date_of_birth,
          gender: studentData.gender,
          home_address: studentData.home_address,
          current_class: studentData.current_class,
          section: studentData.section,
          parent_name: studentData.parent_name,
          parent_phone: studentData.parent_phone,
          parent_email: studentData.parent_email,
          status: studentData.status,
        }

        console.log("Password verified, setting student in context")

        setStudent(student)
        sessionStorage.setItem("student_session", JSON.stringify(student))
        return true
      }

      console.log("Student login failed - invalid credentials")
      return false
    } catch (error) {
      console.error("Student login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setStudent(null)
    sessionStorage.removeItem("student_session")
  }

  return (
    <StudentAuthContext.Provider value={{ student, loading, login, logout }}>{children}</StudentAuthContext.Provider>
  )
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext)
  if (context === undefined) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider")
  }
  return context
}
