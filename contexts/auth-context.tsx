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
  login: (email: string, password: string) => Promise<boolean>
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
      const sessionToken = sessionStorage.getItem("admin_session")
      if (sessionToken) {
        const userData = JSON.parse(sessionToken)
        setUser(userData)
      }
    } catch (error) {
      console.error("Admin session check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log("Attempting admin login for:", email)

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .eq("user_type", "admin")
        .eq("status", "Active")
        .single()

      console.log("Admin query result:", { userData, userError })

      if (userData && !userError) {
        console.log("Found admin in database:", userData)

        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_type: userData.user_type,
          status: userData.status,
        }

        console.log("Password verified, setting admin in context")

        setUser(user)
        sessionStorage.setItem("admin_session", JSON.stringify(user))
        return true
      }

      console.log("Admin login failed - invalid credentials")
      return false
    } catch (error) {
      console.error("Admin login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("admin_session")
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
