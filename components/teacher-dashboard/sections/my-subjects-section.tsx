"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ClipboardList, TrendingUp, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface Subject {
  id: string
  name: string
  classes: string[]
  totalStudents: number
  avgScore: string
  assignmentCount: number
}

export function MySubjectsSection() {
  const { teacher } = useTeacherAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (teacher) {
      fetchTeacherSubjects()
    }
  }, [teacher])

  const fetchTeacherSubjects = async () => {
    if (!teacher) {
      console.log("No teacher found, cannot fetch subjects")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    console.log("=== FETCHING TEACHER SUBJECTS ===")
    console.log("Teacher ID:", teacher.id)
    console.log("Teacher Name:", teacher.full_name)

    try {
      // Fetch subjects assigned to this teacher
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("teacher_id", teacher.id)

      console.log("Subjects query result:", { subjectsData, subjectsError })

      if (subjectsError) {
        throw subjectsError
      }

      if (!subjectsData || subjectsData.length === 0) {
        console.log("No subjects found for teacher")
        setSubjects([])
        setLoading(false)
        return
      }

      // Process each subject to get additional data
      const processedSubjects: Subject[] = []

      for (const subject of subjectsData) {
        console.log(`Processing subject: ${subject.name}`)

        // Get classes where this subject is taught
        const classes = subject.target_class ? [subject.target_class] : []

        // Count students for this subject across all classes
        let totalStudents = 0
        if (classes.length > 0) {
          for (const className of classes) {
            const { data: studentsData, error: studentsError } = await supabase
              .from("students")
              .select("id")
              .eq("class", className)

            if (!studentsError && studentsData) {
              totalStudents += studentsData.length
            }
          }
        }

        // Get average score for this subject (from student_exams)
        const { data: examData, error: examError } = await supabase
          .from("student_exams")
          .select("total")
          .eq("subject", subject.name)
          .not("total", "is", null)

        let avgScore = "N/A"
        if (!examError && examData && examData.length > 0) {
          const totalMarks = examData.reduce((sum, exam) => sum + (exam.total || 0), 0)
          const average = totalMarks / examData.length
          avgScore = `${Math.round(average)}%`
        }

        processedSubjects.push({
          id: subject.id.toString(),
          name: subject.name,
          classes: classes,
          totalStudents: totalStudents,
          avgScore: avgScore,
          assignmentCount: 0, // We'll implement this later
        })
      }

      console.log("Processed subjects:", processedSubjects)
      setSubjects(processedSubjects)
    } catch (error) {
      console.error("Error fetching teacher subjects:", error)
      setError("Failed to load subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleEnterMarks = (subjectName: string) => {
    console.log(`Navigate to marks entry for subject: ${subjectName}`)
    // TODO: Navigate to marks entry with pre-selected subject
  }

  const handleViewPerformance = (subjectName: string) => {
    console.log(`View performance for subject: ${subjectName}`)
    // TODO: Show subject performance analytics
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Subjects</h1>
          <p className="text-gray-600">Loading your subjects...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Subjects</h1>
          <p className="text-red-600">{error}</p>
        </div>
        <Button onClick={fetchTeacherSubjects} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Subjects</h1>
          <p className="text-gray-600">No subjects assigned to you yet.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              You don't have any subjects assigned yet.
              <br />
              Contact the administrator to assign subjects to you.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Subjects</h1>
        <p className="text-gray-600">Subjects you're currently teaching ({subjects.length} subjects)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  {subject.name}
                </div>
                <Badge variant="secondary">{subject.classes.length} classes</Badge>
              </CardTitle>
              <CardDescription>
                {subject.classes.length > 0 ? `Classes: ${subject.classes.join(", ")}` : "No classes assigned"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{subject.totalStudents}</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{subject.assignmentCount}</div>
                  <div className="text-xs text-gray-500">Assignments</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{subject.avgScore}</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" className="flex-1" onClick={() => handleEnterMarks(subject.name)}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Enter Marks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewPerformance(subject.name)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
