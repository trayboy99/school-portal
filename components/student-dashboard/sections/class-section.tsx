"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, User, BookOpen, GraduationCap, Phone, Mail } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface ClassInfo {
  id: number
  name: string
  category: string
  section: string
  academic_year: string
  teacher_name: string
  teacher_email?: string
  teacher_phone?: string
  max_students: number
  current_students: number
}

interface Classmate {
  id: number
  first_name: string
  middle_name?: string
  surname: string
  reg_number: string
  email: string
  phone?: string
  avatar?: string
}

interface Subject {
  id: number
  name: string
  code: string
  teacher_name: string
  department: string
}

export default function ClassSection() {
  const { student } = useStudentAuth()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student) {
      loadClassInfo()
    }
  }, [student])

  const loadClassInfo = async () => {
    if (!student) return

    try {
      setLoading(true)

      // Load class information
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("name", student.class)
        .single()

      if (classError) {
        console.error("Error loading class info:", classError)
      } else {
        setClassInfo(classData)
      }

      // Load classmates
      const { data: classmatesData, error: classmatesError } = await supabase
        .from("students")
        .select("id, first_name, middle_name, surname, reg_number, email, phone, avatar")
        .eq("class", student.class)
        .eq("status", "Active")
        .neq("id", student.id) // Exclude current student
        .order("first_name")

      if (classmatesError) {
        console.error("Error loading classmates:", classmatesError)
      } else {
        setClassmates(classmatesData || [])
      }

      // Load subjects for this class
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("id, name, code, teacher_name, department")
        .eq("target_class", student.class)
        .eq("status", "Active")
        .order("name")

      if (subjectsError) {
        console.error("Error loading subjects:", subjectsError)
      } else {
        setSubjects(subjectsData || [])
      }
    } catch (error) {
      console.error("Error in loadClassInfo:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStudentInitials = (firstName: string, surname: string) => {
    return `${firstName.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }

  const getStudentFullName = (classmate: Classmate) => {
    return [classmate.first_name, classmate.middle_name, classmate.surname].filter(Boolean).join(" ")
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your class information.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading class information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Class</h1>
          <p className="text-gray-600">Class information and classmates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{student.class}</span>
        </div>
      </div>

      {/* Class Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Class Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Class Name</p>
                <p className="text-lg font-semibold">{student.class}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Section</p>
                <p className="text-lg font-semibold">{classInfo?.section || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <p className="text-lg font-semibold">{classInfo?.category || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Academic Year</p>
                <p className="text-lg font-semibold">{classInfo?.academic_year || "N/A"}</p>
              </div>
            </div>

            {classInfo && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">Class Statistics</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Class Size:</span>
                  <span className="font-medium">
                    {classmates.length + 1}/{classInfo.max_students}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((classmates.length + 1) / classInfo.max_students) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Teacher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Class Teacher</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classInfo ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                    <AvatarFallback>
                      {classInfo.teacher_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{classInfo.teacher_name}</p>
                    <p className="text-sm text-gray-600">Class Teacher</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {classInfo.teacher_email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{classInfo.teacher_email}</span>
                    </div>
                  )}
                  {classInfo.teacher_phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{classInfo.teacher_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Class teacher information not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Class Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Class Subjects</span>
          </CardTitle>
          <CardDescription>Subjects offered in your class</CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No subjects information available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{subject.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {subject.code}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{subject.department}</p>
                  <p className="text-sm text-gray-500">Teacher: {subject.teacher_name}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classmates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Classmates ({classmates.length})</span>
          </CardTitle>
          <CardDescription>Your fellow students in {student.class}</CardDescription>
        </CardHeader>
        <CardContent>
          {classmates.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No classmates found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classmates.map((classmate) => (
                <div
                  key={classmate.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={classmate.avatar || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>{getStudentInitials(classmate.first_name, classmate.surname)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{getStudentFullName(classmate)}</p>
                    <p className="text-xs text-gray-500">{classmate.reg_number}</p>
                    {classmate.email && <p className="text-xs text-gray-400 truncate">{classmate.email}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{classmates.length + 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Class Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classInfo ? `${Math.round(((classmates.length + 1) / classInfo.max_students) * 100)}%` : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
