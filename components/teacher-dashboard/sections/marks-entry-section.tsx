"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { supabase } from "@/lib/supabase"

interface Student {
  id: number
  roll_no: string
  reg_number: string
  first_name: string
  middle_name?: string
  surname: string
  current_class: string
  section: string
}

interface Exam {
  id: number
  exam_name: string
  exam_type: string
  term: string
  academic_year: string
}

interface Score {
  student_id: number
  midterm_score?: number
  terminal_score?: number
}

export function MarksEntrySection() {
  const { teacher } = useTeacherAuth()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedExam, setSelectedExam] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [scores, setScores] = useState<Record<number, Score>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch exams when component mounts
  useEffect(() => {
    fetchExams()
  }, [])

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  // Fetch existing scores when exam and class are selected
  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      fetchExistingScores()
    }
  }, [selectedClass, selectedExam, selectedSubject])

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase.from("exams").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching exams:", error)
        return
      }

      setExams(data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
    }
  }

  const fetchStudents = async () => {
    if (!selectedClass) return

    try {
      setLoading(true)
      console.log("Fetching students for class:", selectedClass)

      const { data, error } = await supabase
        .from("students")
        .select("id, roll_no, reg_number, first_name, middle_name, surname, current_class, section")
        .eq("current_class", selectedClass)
        .eq("status", "Active")
        .order("roll_no")

      console.log("Students query result:", { data, error })

      if (error) {
        console.error("Error fetching students:", error)
        return
      }

      setStudents(data || [])
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingScores = async () => {
    if (!selectedClass || !selectedExam || !selectedSubject) return

    try {
      const { data, error } = await supabase
        .from("student_scores")
        .select("student_id, midterm_score, terminal_score")
        .eq("exam_id", selectedExam)
        .eq("subject", selectedSubject)

      if (error) {
        console.error("Error fetching existing scores:", error)
        return
      }

      const scoresMap: Record<number, Score> = {}
      data?.forEach((score) => {
        scoresMap[score.student_id] = {
          student_id: score.student_id,
          midterm_score: score.midterm_score,
          terminal_score: score.terminal_score,
        }
      })

      setScores(scoresMap)
    } catch (error) {
      console.error("Error fetching existing scores:", error)
    }
  }

  const updateScore = (studentId: number, field: "midterm_score" | "terminal_score", value: string) => {
    const numValue = value === "" ? undefined : Number(value)
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        [field]: numValue,
      },
    }))
  }

  const saveScores = async () => {
    if (!selectedExam || !selectedSubject) {
      alert("Please select an exam and subject")
      return
    }

    try {
      setSaving(true)

      const scoresToSave = Object.values(scores).filter(
        (score) => score.midterm_score !== undefined || score.terminal_score !== undefined,
      )

      for (const score of scoresToSave) {
        const { error } = await supabase.from("student_scores").upsert(
          {
            student_id: score.student_id,
            exam_id: Number(selectedExam),
            subject: selectedSubject,
            midterm_score: score.midterm_score,
            terminal_score: score.terminal_score,
            teacher_id: teacher?.id,
          },
          {
            onConflict: "student_id,exam_id,subject",
          },
        )

        if (error) {
          console.error("Error saving score:", error)
          alert(`Error saving scores: ${error.message}`)
          return
        }
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
      <Card>
        <CardContent className="p-6">
          <p>Please log in to access marks entry.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marks Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teacher Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Teacher ID</Label>
              <p className="text-lg font-semibold">{teacher.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Assigned Classes</Label>
              <p className="text-lg font-semibold">{teacher.classes.length} classes</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.classes.map((cls, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Total Subjects</Label>
              <p className="text-lg font-semibold">{teacher.subjects.length} subjects</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.subjects.map((subject, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="class-select">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {teacher.classes.map((cls, index) => (
                    <SelectItem key={index} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject-select">Select Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {teacher.subjects.map((subject, index) => (
                    <SelectItem key={index} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="exam-select">Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id.toString()}>
                      {exam.exam_name} ({exam.exam_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Students List */}
          {selectedClass && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Students in {selectedClass} ({students.length} students)
              </h3>

              {loading ? (
                <p>Loading students...</p>
              ) : students.length === 0 ? (
                <p>No students found in {selectedClass}</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 font-semibold text-sm bg-gray-100 p-2 rounded">
                    <div className="col-span-1">Roll No</div>
                    <div className="col-span-2">Reg Number</div>
                    <div className="col-span-3">Student Name</div>
                    <div className="col-span-1">Section</div>
                    <div className="col-span-2">Midterm Score</div>
                    <div className="col-span-2">Terminal Score</div>
                    <div className="col-span-1">Total</div>
                  </div>

                  {students.map((student) => {
                    const studentScore = scores[student.id] || {}
                    const total = (studentScore.midterm_score || 0) + (studentScore.terminal_score || 0)

                    return (
                      <div key={student.id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
                        <div className="col-span-1 text-sm">{student.roll_no}</div>
                        <div className="col-span-2 text-sm">{student.reg_number}</div>
                        <div className="col-span-3 text-sm">
                          {student.first_name} {student.middle_name} {student.surname}
                        </div>
                        <div className="col-span-1 text-sm">{student.section}</div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0-50"
                            value={studentScore.midterm_score || ""}
                            onChange={(e) => updateScore(student.id, "midterm_score", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0-50"
                            value={studentScore.terminal_score || ""}
                            onChange={(e) => updateScore(student.id, "terminal_score", e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-1 text-sm font-semibold">{total}</div>
                      </div>
                    )
                  })}

                  <div className="flex justify-end mt-4">
                    <Button onClick={saveScores} disabled={saving || !selectedExam || !selectedSubject}>
                      {saving ? "Saving..." : "Save Scores"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
