"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { supabase } from "@/lib/supabase"
import { BookOpen, Users, GraduationCap, Save, AlertCircle } from "lucide-react"

interface Student {
  id: number
  roll_no: string
  reg_number: string
  first_name: string
  middle_name: string
  surname: string
  current_class: string
  section: string
}

interface StudentScore {
  student_id: number
  midterm_score: number
  terminal_score: number
}

export function MarksEntrySection() {
  const { teacher } = useTeacherAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [scores, setScores] = useState<Record<number, StudentScore>>({})
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch exams when class and subject are selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchExams()
    }
  }, [selectedClass, selectedSubject])

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("subject", selectedSubject)
        .eq("status", "Active")

      if (error) {
        console.error("Error fetching exams:", error)
        return
      }

      console.log("Fetched exams:", data)
      setExams(data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      console.log("Fetching students for class:", selectedClass)

      const { data, error } = await supabase
        .from("students")
        .select("id, roll_no, reg_number, first_name, middle_name, surname, current_class, section")
        .eq("current_class", selectedClass)
        .eq("status", "Active")
        .order("roll_no")

      if (error) {
        console.error("Error fetching students:", error)
        return
      }

      console.log("Fetched students:", data)
      setStudents(data || [])

      // Initialize scores for each student
      const initialScores: Record<number, StudentScore> = {}
      data?.forEach((student) => {
        initialScores[student.id] = {
          student_id: student.id,
          midterm_score: 0,
          terminal_score: 0,
        }
      })
      setScores(initialScores)

      // Fetch existing scores if exam is selected
      if (selectedExam) {
        fetchExistingScores(data || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingScores = async (studentList: Student[]) => {
    try {
      const { data, error } = await supabase
        .from("student_scores")
        .select("*")
        .eq("exam_id", selectedExam)
        .in(
          "student_id",
          studentList.map((s) => s.id),
        )

      if (error) {
        console.error("Error fetching existing scores:", error)
        return
      }

      console.log("Existing scores:", data)

      // Update scores with existing data
      const updatedScores = { ...scores }
      data?.forEach((score) => {
        if (updatedScores[score.student_id]) {
          updatedScores[score.student_id] = {
            student_id: score.student_id,
            midterm_score: score.midterm_score || 0,
            terminal_score: score.terminal_score || 0,
          }
        }
      })
      setScores(updatedScores)
    } catch (error) {
      console.error("Error fetching existing scores:", error)
    }
  }

  const handleScoreChange = (studentId: number, field: "midterm_score" | "terminal_score", value: string) => {
    const numValue = Math.max(0, Math.min(100, Number.parseInt(value) || 0))
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue,
      },
    }))
  }

  const saveScores = async () => {
    if (!selectedExam) {
      alert("Please select an exam first")
      return
    }

    try {
      setSaving(true)
      console.log("Saving scores for exam:", selectedExam)

      const scoresToSave = Object.values(scores).map((score) => ({
        student_id: score.student_id,
        exam_id: Number.parseInt(selectedExam),
        subject: selectedSubject,
        midterm_score: score.midterm_score,
        terminal_score: score.terminal_score,
        total_score: score.midterm_score + score.terminal_score,
        teacher_id: teacher?.id,
      }))

      console.log("Scores to save:", scoresToSave)

      const { error } = await supabase.from("student_scores").upsert(scoresToSave, {
        onConflict: "student_id,exam_id",
      })

      if (error) {
        console.error("Error saving scores:", error)
        alert("Error saving scores: " + error.message)
        return
      }

      alert("Scores saved successfully!")
    } catch (error) {
      console.error("Error saving scores:", error)
      alert("Error saving scores")
    } finally {
      setSaving(false)
    }
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading teacher information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Marks Entry</h1>
        <p className="text-green-100">Enter and manage student examination scores</p>
      </div>

      {/* Teacher Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Teacher Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Teacher ID</p>
              <p className="text-lg font-semibold">{teacher.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned Classes</p>
              <p className="text-lg font-semibold">{teacher.classes?.length || 0} classes</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.classes?.map((cls, index) => (
                  <Badge key={index} variant="outline">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-lg font-semibold">{teacher.subjects?.length || 0} subjects</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.subjects?.map((subject, index) => (
                  <Badge key={index} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Class, Subject & Exam
          </CardTitle>
          <CardDescription>Choose the class, subject, and exam to enter marks for</CardDescription>
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
                  {teacher.classes?.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacher.subjects?.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam">Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedSubject}>
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

      {/* Students List */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students in {selectedClass}
            </CardTitle>
            <CardDescription>{students.length} students found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students found in {selectedClass}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Roll No</th>
                        <th className="text-left p-2">Reg Number</th>
                        <th className="text-left p-2">Student Name</th>
                        <th className="text-left p-2">Section</th>
                        <th className="text-left p-2">Midterm Score</th>
                        <th className="text-left p-2">Terminal Score</th>
                        <th className="text-left p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{student.roll_no}</td>
                          <td className="p-2">{student.reg_number}</td>
                          <td className="p-2">
                            {student.first_name} {student.middle_name} {student.surname}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{student.section}</Badge>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scores[student.id]?.midterm_score || 0}
                              onChange={(e) => handleScoreChange(student.id, "midterm_score", e.target.value)}
                              className="w-20"
                              disabled={!selectedExam}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={scores[student.id]?.terminal_score || 0}
                              onChange={(e) => handleScoreChange(student.id, "terminal_score", e.target.value)}
                              className="w-20"
                              disabled={!selectedExam}
                            />
                          </td>
                          <td className="p-2 font-semibold">
                            {(scores[student.id]?.midterm_score || 0) + (scores[student.id]?.terminal_score || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedExam && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={saveScores} disabled={saving} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Scores"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
