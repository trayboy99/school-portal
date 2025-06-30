"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Teacher {
  id: number
  employee_id: string
  first_name: string
  middle_name: string
  surname: string
  email: string
  phone: string
  department: string
  qualification: string
  experience: string
  employment_type: string
  hire_date: string
  status: string
  subjects: string[]
  classes: string[]
}

interface TeacherAuthContextType {
  teacher: Teacher | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined)

export function TeacherAuthProvider({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionToken = sessionStorage.getItem("teacher_session")
      if (sessionToken) {
        const teacherData = JSON.parse(sessionToken)
        setTeacher(teacherData)
      }
    } catch (error) {
      console.error("Teacher session check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const parseJsonArray = (jsonString: any): string[] => {
  try {
    if (!jsonString) return [];

    const str = String(jsonString).trim();

    // Handle PostgreSQL array format like {"English","Maths"}
    if (str.startsWith("{") && str.endsWith("}")) {
      const cleaned = str.slice(1, -1);
      return cleaned.split(",").map((item) => item.replace(/"/g, "").trim());
    }

    // Handle plain CSV string like "Physics,Chemistry"
    if (str.includes(",") && !str.startsWith("[") && !str.startsWith("{")) {
      return str.split(",").map((item) => item.trim());
    }

    // Handle proper JSON array string
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing JSON array:", error);
    return [];
  }
};


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log("Attempting teacher login for:", email)

      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .eq("status", "Active")
        .single()

      console.log("Teacher query result:", { teacherData, teacherError })

      if (teacherData && !teacherError) {
        console.log("Found teacher in database:", teacherData)

        const teacher: Teacher = {
          id: teacherData.id,
          employee_id: teacherData.employee_id,
          first_name: teacherData.first_name,
          middle_name: teacherData.middle_name || "",
          surname: teacherData.surname,
          email: teacherData.email,
          phone: teacherData.phone,
          department: teacherData.department,
          qualification: teacherData.qualification,
          experience: teacherData.experience,
          employment_type: teacherData.employment_type,
          hire_date: teacherData.hire_date,
          status: teacherData.status,
          subjects: parseJsonArray(teacherData.subjects),
          classes: parseJsonArray(teacherData.classes),
        }

        console.log("Parsed teacher data:", teacher)
        console.log("Password verified, setting teacher in context")

        setTeacher(teacher)
        sessionStorage.setItem("teacher_session", JSON.stringify(teacher))
        return true
      }

      console.log("Teacher login failed - invalid credentials")
      return false
    } catch (error) {
      console.error("Teacher login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setTeacher(null)
    sessionStorage.removeItem("teacher_session")
  }

  return (
    <TeacherAuthContext.Provider value={{ teacher, loading, login, logout }}>{children}</TeacherAuthContext.Provider>
  )
}

export function useTeacherAuth() {
  const context = useContext(TeacherAuthContext)
  if (context === undefined) {
    throw new Error("useTeacherAuth must be used within a TeacherAuthProvider")
  }
  return context
}
