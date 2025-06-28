"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  user_type: string
  status: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, userType: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionToken = sessionStorage.getItem("auth_session")
      if (sessionToken) {
        const userData = JSON.parse(sessionToken)
        setUser(userData)
      }
    } catch (error) {
      console.error("Session check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, userType: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log(`Attempting ${userType} login for:`, email)

      if (userType === "admin") {
        const { data: adminData, error: adminError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("password_hash", password)
          .eq("user_type", "admin")
          .eq("status", "Active")
          .single()

        console.log("Admin query result:", { adminData, adminError })

        if (adminData && !adminError) {
          const userData = {
            id: adminData.id,
            username: adminData.username,
            email: adminData.email,
            first_name: adminData.first_name,
            last_name: adminData.last_name,
            user_type: adminData.user_type,
            status: adminData.status,
          }

          setUser(userData)
          sessionStorage.setItem("auth_session", JSON.stringify(userData))
          console.log("Admin login successful")
          return true
        }
      }

      console.log("Login failed - invalid credentials")
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("auth_session")
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
