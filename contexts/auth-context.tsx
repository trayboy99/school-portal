"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  userType: "student" | "teacher" | "parent" | "admin"
  dbId?: number // Database ID for the specific user type
  department?: string // For teachers
  class?: string // For students
  phone?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      // First check if it's an admin login
      if (username === "admin" && password === "password") {
        const userData: User = {
          id: "admin-1",
          username: "admin",
          email: "admin@westminster.edu",
          firstName: "Admin",
          lastName: "User",
          userType: "admin",
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        setIsLoading(false)
        return true
      }

      // Check teachers table
      try {
        const { data: teacherData, error: teacherError } = await supabase
          .from("teachers")
          .select("*")
          .eq("email", username)
          .eq("status", "Active")
          .single()

        if (!teacherError && teacherData) {
          // Simple password check (replace with proper authentication)
          if (password === "teacher123" || password === "password") {
            const userData: User = {
              id: `teacher-${teacherData.id}`,
              username: teacherData.email,
              email: teacherData.email,
              firstName: teacherData.first_name,
              lastName: teacherData.surname,
              userType: "teacher",
              dbId: teacherData.id,
              department: teacherData.department,
              phone: teacherData.phone,
            }
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
            setIsLoading(false)
            return true
          }
        }
      } catch (error) {
        console.log("Teacher lookup failed, trying student...")
      }

      // Check students table
      try {
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("email", username)
          .eq("status", "Active")
          .single()

        if (!studentError && studentData) {
          // Simple password check (replace with proper authentication)
          if (password === "student123" || password === "password") {
            const userData: User = {
              id: `student-${studentData.id}`,
              username: studentData.email,
              email: studentData.email,
              firstName: studentData.first_name,
              lastName: studentData.surname,
              userType: "student",
              dbId: studentData.id,
              class: studentData.class,
              phone: studentData.phone,
            }
            setUser(userData)
            localStorage.setItem("user", JSON.stringify(userData))
            setIsLoading(false)
            return true
          }
        }
      } catch (error) {
        console.log("Student lookup failed")
      }

      // If no match found
      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock signup - in real app, this would be an API call
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType,
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
