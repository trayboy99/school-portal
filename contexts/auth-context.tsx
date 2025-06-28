"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "student"
  userType?: "admin" | "student"
  firstName?: string
  middleName?: string
  lastName?: string
  dbId?: number
  class?: string
}

interface Student {
  id: number
  roll_no: string
  first_name: string
  middle_name?: string
  surname: string
  class: string
  status: string
  email?: string
  phone?: string
  address?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  student: Student | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("user")
    const savedStudent = localStorage.getItem("student")

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        console.log("Restored user from localStorage:", parsedUser)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }

    if (savedStudent) {
      try {
        const parsedStudent = JSON.parse(savedStudent)
        setStudent(parsedStudent)
        console.log("Restored student from localStorage:", parsedStudent)
      } catch (error) {
        console.error("Error parsing saved student:", error)
        localStorage.removeItem("student")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("=== LOGIN ATTEMPT ===")
      console.log("Username:", username)

      // Check admin login first
      if (username === "super@school.com" && password === "admin123") {
        const adminUser: User = {
          id: "1",
          username: "super@school.com",
          email: "super@school.com",
          role: "admin",
          userType: "admin",
          firstName: "Super",
          lastName: "Admin",
        }
        setUser(adminUser)
        localStorage.setItem("user", JSON.stringify(adminUser))
        console.log("Admin login successful")
        return true
      }

      // Check student login using EMAIL
      console.log("Checking student login with email:", username)
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("email", username)
        .eq("status", "Active")
        .single()

      console.log("Student query result:", { studentData, studentError })

      if (!studentError && studentData) {
        // Simple password check for students
        if (password === "student123" || password === studentData.roll_no) {
          console.log("Student password verified, creating user objects...")

          const studentInfo: Student = {
            id: studentData.id,
            roll_no: studentData.roll_no,
            first_name: studentData.first_name,
            middle_name: studentData.middle_name,
            surname: studentData.surname,
            class: studentData.class,
            status: studentData.status,
            email: studentData.email,
            phone: studentData.phone,
            address: studentData.address,
            parent_name: studentData.parent_name,
            parent_phone: studentData.parent_phone,
            parent_email: studentData.parent_email,
            created_at: studentData.created_at,
          }

          // Create user object for student with proper data for results section
          const studentUser: User = {
            id: studentData.id.toString(),
            username: studentData.email || studentData.roll_no,
            email: studentData.email || "",
            role: "student",
            userType: "student",
            firstName: studentData.first_name,
            middleName: studentData.middle_name,
            lastName: studentData.surname,
            dbId: studentData.id, // This is crucial for results section
            class: studentData.class, // This is crucial for results section
          }

          console.log("Setting student user data:", studentUser)
          console.log("Setting student info:", studentInfo)

          setStudent(studentInfo)
          setUser(studentUser) // Set both student and user for compatibility
          localStorage.setItem("student", JSON.stringify(studentInfo))
          localStorage.setItem("user", JSON.stringify(studentUser))

          console.log("Student login successful!")
          return true
        } else {
          console.log("Student password verification failed")
        }
      } else {
        console.log("Student not found or error:", studentError)
      }

      console.log("Login failed")
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setStudent(null)
    localStorage.removeItem("user")
    localStorage.removeItem("student")
    localStorage.removeItem("teacher")
  }

  return <AuthContext.Provider value={{ user, student, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
