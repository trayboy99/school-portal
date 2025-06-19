"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, TrendingUp, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface ClassData {
  id: number
  name: string
  category: string
  section: string
  academic_year: string
  current_students: number
  subjects_count: number
  subjects: string[]
  students: Student[]
}

interface Student {
  id: number
  roll_no: string
  first_name: string
  middle_name?: string
  surname: string
  email: string
  phone?: string
  status: string
}

export function MyClassesSection() {
  const { teacher } = useTeacherAuth()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClassStudents, setSelectedClassStudents] = useState<Student[]>([])
  const [selectedClassName, setSelectedClassName] = useState("")

  useEffect(() => {
    if (teacher) {
      fetchTeacherClasses()
    } else {
      setLoading(false)
    }
  }, [teacher])

  const fetchTeacherClasses = async () => {
    if (!teacher) return

    setLoading(true)
    setError(null)

    try {
      console.log("=== DEBUGGING TEACHER CLASSES ===")
      console.log("Teacher object:", teacher)
      console.log("Looking for classes with teacher_id:", teacher.id)

      // Fetch classes where this teacher is assigned (using teacher_id foreign key)
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacher.id)
        .eq("status", "Active")

      console.log("Classes query result:", { classesData, classesError })

      if (classesError) {
        console.error("Database error:", classesError)
        setError(`Database error: ${classesError.message}`)
        return
      }

      if (!classesData || classesData.length === 0) {
        console.log("No classes found for teacher_id:", teacher.id)

        // Debug: Show all classes to see what teacher_ids exist
        const { data: allClasses } = await supabase.from("classes").select("id, name, teacher_id").limit(10)
        console.log("All classes in database:", allClasses)

        setClasses([])
        setLoading(false)
        return
      }

      console.log("Found classes for teacher:", classesData)

      // For each class, get students and other details
      const classesWithDetails = await Promise.all(
        classesData.map(async (classItem) => {
          console.log(`Getting details for class: ${classItem.name}`)

          // Get students for this class (using class name to match students.class field)
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, roll_no, first_name, middle_name, surname, email, phone, status")
            .eq("class", classItem.name) // Match by class name
            .eq("status", "Active")
            .order("roll_no")

          console.log(`Students for ${classItem.name}:`, studentsData)

          if (studentsError) {
            console.error(`Error fetching students for ${classItem.name}:`, studentsError)
          }

          // Get subjects for this teacher and class
          const { data: subjectsData } = await supabase
            .from("subjects")
            .select("name")
            .eq("teacher_id", teacher.id)
            .eq("target_class", classItem.name)
            .eq("status", "Active")

          console.log(`Subjects for ${classItem.name}:`, subjectsData)

          return {
            id: classItem.id,
            name: classItem.name,
            category: classItem.category || "N/A",
            section: classItem.section || "N/A",
            academic_year: classItem.academic_year || "N/A",
            current_students: classItem.current_students || studentsData?.length || 0,
            subjects_count: subjectsData?.length || 0,
            subjects: subjectsData?.map((s) => s.name) || [],
            students: studentsData || [],
          }
        }),
      )

      console.log("Final classes with details:", classesWithDetails)
      setClasses(classesWithDetails)
    } catch (error) {
      console.error("Error in fetchTeacherClasses:", error)
      setError(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudents = (classItem: ClassData) => {
    setSelectedClassStudents(classItem.students)
    setSelectedClassName(classItem.name)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your classes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchTeacherClasses}>Retry</Button>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please log in as a teacher to view your classes.</p>
      </div>
    )
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">No classes assigned to you yet.</p>
        <p className="text-sm text-gray-400">Check the browser console for debugging information.</p>
        <Button onClick={fetchTeacherClasses} className="mt-4">
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Classes</h1>
        <p className="text-gray-600">Manage your assigned classes and students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {classItem.name}
                <Badge variant="secondary">{classItem.current_students} students</Badge>
              </CardTitle>
              <CardDescription>
                {classItem.category} • {classItem.section} • {classItem.academic_year}
                <br />
                Subjects: {classItem.subjects.length > 0 ? classItem.subjects.join(", ") : "None assigned"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-xs text-gray-500">Avg Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-xs text-gray-500">Attendance</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1" onClick={() => handleViewStudents(classItem)}>
                      <Users className="h-4 w-4 mr-2" />
                      View Students
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Students in {selectedClassName}</DialogTitle>
                      <DialogDescription>View all students in this class (Read-only)</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      {selectedClassStudents.length === 0 ? (
                        <p className="text-center py-4 text-gray-500">No students found in this class.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Roll No</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedClassStudents.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>{student.roll_no}</TableCell>
                                <TableCell>
                                  {[student.first_name, student.middle_name, student.surname].filter(Boolean).join(" ")}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                                    {student.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Performance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Performance Overview - {classItem.name}</DialogTitle>
                      <DialogDescription>Basic performance metrics for this class</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold">{classItem.current_students}</div>
                          <div className="text-sm text-gray-500">Total Students</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold">{classItem.subjects.length}</div>
                          <div className="text-sm text-gray-500">Subjects Taught</div>
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <p className="text-sm text-gray-500">Detailed performance analytics will be available soon.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
