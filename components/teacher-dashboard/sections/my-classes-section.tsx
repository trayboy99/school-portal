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
import { Users, TrendingUp, Loader2, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface ClassData {
  id: number
  name: string
  category: string
  section: string
  academic_year: string
  current_students: number
  subjects_taught: string[]
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
      console.log("=== FETCHING CLASSES WHERE TEACHER TEACHES SUBJECTS ===")
      console.log("Teacher object:", teacher)

      // Get all subjects this teacher teaches (this gives us the classes)
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("name, target_class")
        .eq("teacher_id", teacher.id)
        .eq("status", "Active")

      console.log("Subjects taught by teacher:", subjectsData)

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError)
        setError(`Error fetching subjects: ${subjectsError.message}`)
        return
      }

      if (!subjectsData || subjectsData.length === 0) {
        console.log("No subjects assigned to teacher")
        setClasses([])
        setLoading(false)
        return
      }

      // Get unique classes from subjects
      const uniqueClasses = [...new Set(subjectsData.map((subject) => subject.target_class))]
      console.log("Unique classes where teacher teaches:", uniqueClasses)

      // For each class, get class details and subjects taught there
      const classesWithDetails = await Promise.all(
        uniqueClasses.map(async (className) => {
          console.log(`Getting details for class: ${className}`)

          // Get class details
          const { data: classData, error: classError } = await supabase
            .from("classes")
            .select("*")
            .eq("name", className)
            .single()

          if (classError) {
            console.error(`Error fetching class ${className}:`, classError)
            return null
          }

          // Get subjects taught by this teacher in this class
          const subjectsTaught = subjectsData
            .filter((subject) => subject.target_class === className)
            .map((subject) => subject.name)

          // Get students in this class
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("id, roll_no, first_name, middle_name, surname, email, phone, status")
            .eq("class", className)
            .eq("status", "Active")
            .order("roll_no")

          console.log(`Students in ${className}:`, studentsData)

          if (studentsError) {
            console.error(`Error fetching students for ${className}:`, studentsError)
          }

          return {
            id: classData.id,
            name: classData.name,
            category: classData.category || "N/A",
            section: classData.section || "N/A",
            academic_year: classData.academic_year || "N/A",
            current_students: studentsData?.length || 0,
            subjects_taught: subjectsTaught,
            students: studentsData || [],
          }
        }),
      )

      // Filter out null results
      const validClasses = classesWithDetails.filter(Boolean) as ClassData[]
      console.log("Final classes where teacher teaches:", validClasses)
      setClasses(validClasses)
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
        <span className="ml-2">Loading classes where you teach...</span>
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
        <p className="text-gray-500 mb-2">No subjects assigned to you yet.</p>
        <p className="text-sm text-gray-400">You need to be assigned subjects to see classes.</p>
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
        <p className="text-gray-600">Classes where you teach subjects</p>
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
                <div className="flex items-center mt-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span className="text-xs">
                    Teaching:{" "}
                    {classItem.subjects_taught.length > 0 ? classItem.subjects_taught.join(", ") : "No subjects"}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-xs text-gray-500">Avg Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{classItem.subjects_taught.length}</div>
                  <div className="text-xs text-gray-500">Subjects</div>
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
                      <DialogTitle>Teaching Overview - {classItem.name}</DialogTitle>
                      <DialogDescription>Your teaching metrics for this class</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold">{classItem.current_students}</div>
                          <div className="text-sm text-gray-500">Students</div>
                        </div>
                        <div className="text-center p-4 border rounded">
                          <div className="text-2xl font-bold">{classItem.subjects_taught.length}</div>
                          <div className="text-sm text-gray-500">Subjects Teaching</div>
                        </div>
                      </div>
                      <div className="p-4 border rounded">
                        <h4 className="font-medium mb-2">Subjects You Teach:</h4>
                        <div className="flex flex-wrap gap-2">
                          {classItem.subjects_taught.map((subject, index) => (
                            <Badge key={index} variant="outline">
                              {subject}
                            </Badge>
                          ))}
                        </div>
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
