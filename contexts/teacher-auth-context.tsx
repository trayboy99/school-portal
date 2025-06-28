"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Teacher {
  id: number
  employee_id: string
  first_name: string
  middle_name?: string
  surname: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  home_address: string
  qualification: string
  experience: string
  department: string
  employment_type: string
  hire_date: string
  salary: string
  emergency_contact: string
  emergency_phone: string
  username: string
  password_hash: string
  credential_method: string
  custom_username?: string
  custom_password?: string
  send_credentials_to?: string
  avatar: string
  status: string
  subjects: string[]
  classes: string[]
  created_at: string
  updated_at: string
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
    // Check if teacher is stored in localStorage
    const storedTeacher = localStorage.getItem("teacher")
    if (storedTeacher) {
      try {
        const parsedTeacher = JSON.parse(storedTeacher)
        console.log("Restored teacher from localStorage:", parsedTeacher)
        setTeacher(parsedTeacher)
      } catch (error) {
        console.error("Error parsing stored teacher:", error)
        localStorage.removeItem("teacher")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("=== TEACHER LOGIN ATTEMPT ===")
      console.log("Email:", email)
      console.log("Password:", password)

      // Query the teachers table from Supabase
      const { data: teachers, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .eq("status", "Active")

      console.log("Teachers query result:", teachers)
      console.log("Teachers query error:", error)

      if (error) {
        console.error("Database error:", error)
        return false
      }

      if (!teachers || teachers.length === 0) {
        console.log("No teacher found with email:", email)
        return false
      }

      const teacher = teachers[0]
      console.log("Found teacher:", teacher)

      // Check password - accepting both "teacher123" and the stored password_hash
      if (password === "teacher123" || password === teacher.password_hash) {
        console.log("Password verified, logging in teacher")
        setTeacher(teacher)
        localStorage.setItem("teacher", JSON.stringify(teacher))
        return true
      } else {
        console.log("Password verification failed")
        console.log("Expected: teacher123 or", teacher.password_hash)
        console.log("Received:", password)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
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
