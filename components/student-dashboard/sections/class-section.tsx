"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, GraduationCap, Calendar, Phone, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export function ClassSection() {
  const { user } = useAuth()
  const [classInfo, setClassInfo] = useState({
    name: "",
    section: "",
    teacher: "",
    teacherEmail: "",
    teacherPhone: "",
    totalStudents: 0,
    academicYear: "2024-2025",
    term: "Second Term",
  })
  const [classmates, setClassmates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [classSchedule] = useState([
    {
      time: "8:00 - 8:40",
      monday: "Mathematics",
      tuesday: "English",
      wednesday: "Physics",
      thursday: "Chemistry",
      friday: "Biology",
    },
    {
      time: "8:40 - 9:20",
      monday: "English",
      tuesday: "Mathematics",
      wednesday: "Chemistry",
      thursday: "Physics",
      friday: "Geography",
    },
    {
      time: "9:20 - 10:00",
      monday: "Physics",
      tuesday: "Biology",
      wednesday: "Mathematics",
      thursday: "English",
      friday: "History",
    },
    {
      time: "10:00 - 10:20",
      monday: "Break",
      tuesday: "Break",
      wednesday: "Break",
      thursday: "Break",
      friday: "Break",
    },
    {
      time: "10:20 - 11:00",
      monday: "Chemistry",
      tuesday: "Geography",
      wednesday: "English",
      thursday: "Mathematics",
      friday: "Civic Ed",
    },
    {
      time: "11:00 - 11:40",
      monday: "Biology",
      tuesday: "History",
      wednesday: "Biology",
      thursday: "Geography",
      friday: "Computer",
    },
    {
      time: "11:40 - 12:20",
      monday: "Geography",
      tuesday: "Civic Ed",
      wednesday: "History",
      thursday: "Biology",
      friday: "Mathematics",
    },
  ])

  // Fetch class information and teacher details
  const fetchClassData = async () => {
    if (!user?.class) return

    try {
      setIsLoading(true)
      console.log("Fetching class data for:", user.class)

      // Get class information and teacher details
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          section,
          teacher_id,
          teacher_name,
          current_students,
          academic_year
        `)
        .eq("name", user.class)
        .eq("status", "Active")
        .single()

      if (classError) {
        console.error("Error fetching class data:", classError)
        // If no class found in classes table, use student's data
        setClassInfo((prev) => ({
          ...prev,
          name: user.class,
          section: user.section || "",
          teacher: "Not Assigned",
          teacherEmail: "",
          teacherPhone: "",
          totalStudents: 0,
        }))
      } else {
        console.log("Class data found:", classData)

        // Get teacher details if teacher_id exists
        let teacherData = null
        if (classData.teacher_id) {
          const { data: teacher, error: teacherError } = await supabase
            .from("teachers")
            .select("first_name, middle_name, surname, email, phone")
            .eq("employee_id", classData.teacher_id)
            .eq("status", "Active")
            .single()

          if (!teacherError && teacher) {
            teacherData = teacher
            console.log("Teacher data found:", teacher)
          }
        }

        setClassInfo((prev) => ({
          ...prev,
          name: classData.name,
          section: classData.section || user.section || "",
          teacher: teacherData
            ? `${teacherData.first_name} ${teacherData.middle_name ? teacherData.middle_name + " " : ""}${teacherData.surname}`
            : classData.teacher_name || "Not Assigned",
          teacherEmail: teacherData?.email || "",
          teacherPhone: teacherData?.phone || "",
          totalStudents: classData.current_students || 0,
          academicYear: classData.academic_year || "2024-2025",
        }))
      }

      // Get classmates
      const { data: classmatesData, error: classmatesError } = await supabase
        .from("students")
        .select("id, first_name, middle_name, surname, section")
        .eq("class", user.class)
        .eq("status", "Active")
        .order("first_name", { ascending: true })

      if (!classmatesError && classmatesData) {
        console.log("Classmates found:", classmatesData.length)
        const transformedClassmates = classmatesData.map((student, index) => ({
          id: student.id,
          name: `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.surname}`,
          position: index + 1,
          avatar: "/placeholder.svg?height=40&width=40",
          isCurrentUser: student.id === user.id,
          section: student.section,
        }))
        setClassmates(transformedClassmates)

        // Update total students count if not from classes table
        if (!classData || classError) {
          setClassInfo((prev) => ({
            ...prev,
            totalStudents: classmatesData.length,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching class data:", error)
      setError("Failed to load class information")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchClassData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Class</h1>
          <p className="text-gray-600">Loading class information...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Class</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Class</h1>
        <p className="text-gray-600">Information about your class and classmates</p>
      </div>

      {/* Class Overview - Removed Classroom card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classInfo.name}</div>
            <p className="text-xs text-muted-foreground">{classInfo.section} Section</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Class Teacher</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{classInfo.teacher}</div>
            <p className="text-xs text-muted-foreground">Form Teacher</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classInfo.totalStudents}</div>
            <p className="text-xs text-muted-foreground">In your class</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Details */}
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>Details about your current class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Academic Year:</span>
              <Badge variant="outline">{classInfo.academicYear}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Term:</span>
              <Badge variant="default">{classInfo.term}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Section:</span>
              <Badge variant="secondary">{classInfo.section}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Class Teacher */}
        <Card>
          <CardHeader>
            <CardTitle>Class Teacher</CardTitle>
            <CardDescription>Your form teacher contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg?height=48&width=48" alt={classInfo.teacher} />
                <AvatarFallback>
                  {classInfo.teacher
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{classInfo.teacher}</h3>
                <p className="text-sm text-gray-600">Form Teacher</p>
              </div>
            </div>
            <div className="space-y-2">
              {classInfo.teacherEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{classInfo.teacherEmail}</span>
                </div>
              )}
              {classInfo.teacherPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{classInfo.teacherPhone}</span>
                </div>
              )}
              {!classInfo.teacherEmail && !classInfo.teacherPhone && (
                <p className="text-sm text-gray-500">Contact information not available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Class Timetable
          </CardTitle>
          <CardDescription>Your weekly class schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Time</th>
                  <th className="border border-gray-300 p-2 text-center">Monday</th>
                  <th className="border border-gray-300 p-2 text-center">Tuesday</th>
                  <th className="border border-gray-300 p-2 text-center">Wednesday</th>
                  <th className="border border-gray-300 p-2 text-center">Thursday</th>
                  <th className="border border-gray-300 p-2 text-center">Friday</th>
                </tr>
              </thead>
              <tbody>
                {classSchedule.map((period, index) => (
                  <tr key={index} className={period.monday === "Break" ? "bg-yellow-50" : ""}>
                    <td className="border border-gray-300 p-2 font-medium">{period.time}</td>
                    <td className="border border-gray-300 p-2 text-center">{period.monday}</td>
                    <td className="border border-gray-300 p-2 text-center">{period.tuesday}</td>
                    <td className="border border-gray-300 p-2 text-center">{period.wednesday}</td>
                    <td className="border border-gray-300 p-2 text-center">{period.thursday}</td>
                    <td className="border border-gray-300 p-2 text-center">{period.friday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Class Students</CardTitle>
          <CardDescription>Students in your class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classmates.length > 0 ? (
              classmates.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    student.isCurrentUser ? "bg-green-50 border-green-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                      {student.position}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {student.name}
                        {student.isCurrentUser && <span className="text-green-600 ml-2">(You)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{student.section}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No classmates found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
