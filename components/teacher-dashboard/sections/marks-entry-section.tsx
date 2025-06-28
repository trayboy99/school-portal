"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { supabase } from "@/lib/supabase"
import { Loader2, Save, Users } from "lucide-react"

interface Student {
  id: number
  first_name: string
  middle_name: string
  surname: string
  roll_no: string
  current_class: string
}

interface Exam {
  id: number
  exam_name: string
  exam_type: string
  academic_year: string
  term: string
  total_marks: number
}

interface StudentScore {
  student_id: number
  exam_id: number
  subject_id: number
  midterm_score: number
  terminal_score: number
  total_score: number
  grade: string
  position: number
}

export function MarksEntrySection() {
  const { teacher } = useTeacherAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [scores, setScores] = useState<{ [key: string]: { midterm: string; terminal: string } }>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setExams(data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchStudents = async () => {
    if (!selectedClass) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, middle_name, surname, roll_no, current_class")
        .eq("current_class", selectedClass)
        .eq("status", "Active")
        .order("roll_no")

      if (error) throw error
      setStudents(data || [])

      // Initialize scores object
      const initialScores: { [key: string]: { midterm: string; terminal: string } } = {}
      data?.forEach((student) => {
        initialScores[student.id] = { midterm: "", terminal: "" }
      })
      setScores(initialScores)

      // Fetch existing scores if exam is selected
      if (selectedExam && selectedSubject) {
        await fetchExistingScores()
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingScores = async () => {
    if (!selectedExam || !selectedSubject) return

    try {
      const { data, error } = await supabase
        .from("student_scores")
        .select("student_id, midterm_score, terminal_score")
        .eq("exam_id", selectedExam)
        .eq("subject_id", selectedSubject)

      if (error) throw error

      const existingScores: { [key: string]: { midterm: string; terminal: string } } = {}
      students.forEach((student) => {
        const existingScore = data?.find((score) => score.student_id === student.id)
        existingScores[student.id] = {
          midterm: existingScore?.midterm_score?.toString() || "",
          terminal: existingScore?.terminal_score?.toString() || "",
        }
      })
      setScores(existingScores)
    } catch (error) {
      console.error("Error fetching existing scores:", error)
    }
  }

  const handleScoreChange = (studentId: number, type: "midterm" | "terminal", value: string) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: value,
      },
    }))
  }

  const calculateGrade = (total: number, maxMarks = 100): string => {
    const percentage = (total / maxMarks) * 100
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    if (percentage >= 50) return "D"
    if (percentage >= 40) return "E"
    return "F"
  }

  const saveScores = async () => {
    if (!selectedExam || !selectedSubject) {
      alert("Please select exam and subject")
      return
    }

    setSaving(true)
    try {
      const scoresToSave = students.map((student) => {
        const midterm = Number.parseFloat(scores[student.id]?.midterm || "0")
        const terminal = Number.parseFloat(scores[student.id]?.terminal || "0")
        const total = midterm + terminal
        const selectedExamData = exams.find((exam) => exam.id.toString() === selectedExam)
        const maxMarks = selectedExamData?.total_marks || 100

        return {
          student_id: student.id,
          exam_id: Number.parseInt(selectedExam),
          subject_id: Number.parseInt(selectedSubject),
          midterm_score: midterm,
          terminal_score: terminal,
          total_score: total,
          grade: calculateGrade(total, maxMarks),
          position: 0, // Will be calculated later
          teacher_id: teacher?.id,
        }
      })

      const { error } = await supabase.from("student_scores").upsert(scoresToSave, {
        onConflict: "student_id,exam_id,subject_id",
      })

      if (error) throw error

      alert("Scores saved successfully!")
    } catch (error) {
      console.error("Error saving scores:", error)
      alert("Error saving scores. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Marks Entry</h2>
        <p className="text-gray-600">Enter and manage student examination scores</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Parameters</CardTitle>
          <CardDescription>Choose class, subject, and exam to enter marks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {teacher?.classes?.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacher?.subjects?.map((subject, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.exam_name} - {exam.exam_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students in {selectedClass}
            </CardTitle>
            <CardDescription>Enter midterm and terminal scores for each student</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Midterm Score</TableHead>
                      <TableHead>Terminal Score</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const midterm = Number.parseFloat(scores[student.id]?.midterm || "0")
                      const terminal = Number.parseFloat(scores[student.id]?.terminal || "0")
                      const total = midterm + terminal
                      const selectedExamData = exams.find((exam) => exam.id.toString() === selectedExam)
                      const maxMarks = selectedExamData?.total_marks || 100

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.roll_no}</TableCell>
                          <TableCell>
                            {student.first_name} {student.middle_name} {student.surname}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={scores[student.id]?.midterm || ""}
                              onChange={(e) => handleScoreChange(student.id, "midterm", e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={scores[student.id]?.terminal || ""}
                              onChange={(e) => handleScoreChange(student.id, "terminal", e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{total.toFixed(1)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                calculateGrade(total, maxMarks) === "A"
                                  ? "bg-green-100 text-green-800"
                                  : calculateGrade(total, maxMarks) === "B"
                                    ? "bg-blue-100 text-blue-800"
                                    : calculateGrade(total, maxMarks) === "C"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {calculateGrade(total, maxMarks)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <Button onClick={saveScores} disabled={saving || !selectedExam || !selectedSubject}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Scores
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No students found in the selected class.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
