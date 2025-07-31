"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Save, Users, BookOpen, Calculator } from "lucide-react"

interface Student {
  id: string
  first_name: string
  surname: string
  username: string
  current_class: string
  section: string
}

interface GradeEntry {
  student_id: string
  score: number
  grade: string
}

interface GradeEntrySectionProps {
  teacherId: string
}

export function GradeEntrySection({ teacherId }: GradeEntrySectionProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [examType, setExamType] = useState("")
  const [maxScore, setMaxScore] = useState(100)
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const classes = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"]
  const subjects = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Geography"]
  const examTypes = ["Continuous Assessment", "Mid-term Exam", "Final Exam", "Quiz", "Assignment"]

  const fetchStudents = async () => {
    if (!selectedClass) return

    setLoading(true)
    try {
      const response = await fetch(`/api/teachers/${teacherId}/students?class=${selectedClass}`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        // Initialize grades object
        const initialGrades: Record<string, GradeEntry> = {}
        data.forEach((student: Student) => {
          initialGrades[student.id] = {
            student_id: student.id,
            score: 0,
            grade: "F",
          }
        })
        setGrades(initialGrades)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateGrade = (score: number, maxScore: number): string => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    if (percentage >= 50) return "D"
    return "F"
  }

  const updateScore = (studentId: string, score: number) => {
    const grade = calculateGrade(score, maxScore)
    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score,
        grade,
      },
    }))
  }

  const saveGrades = async () => {
    if (!selectedSubject || !examType) {
      toast({
        title: "Error",
        description: "Please select subject and exam type",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/teachers/${teacherId}/grades`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: selectedSubject,
          exam_type: examType,
          max_score: maxScore,
          class: selectedClass,
          grades: Object.values(grades),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Grades saved successfully",
        })
      } else {
        throw new Error("Failed to save grades")
      }
    } catch (error) {
      console.error("Error saving grades:", error)
      toast({
        title: "Error",
        description: "Failed to save grades",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [selectedClass])

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "B":
        return "bg-blue-100 text-blue-800"
      case "C":
        return "bg-yellow-100 text-yellow-800"
      case "D":
        return "bg-orange-100 text-orange-800"
      case "F":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Grade Entry Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Grade Entry Setup
          </CardTitle>
          <CardDescription>Configure exam details and select class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Max Score</Label>
              <Input
                id="maxScore"
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                min="1"
                max="200"
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={fetchStudents} disabled={!selectedClass || loading} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Load Students
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Entry Table */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Grade Entry - {selectedClass}
                </CardTitle>
                <CardDescription>Enter scores for {students.length} students</CardDescription>
              </div>
              <Button onClick={saveGrades} disabled={saving || !selectedSubject || !examType}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Grades"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Score (/{maxScore})</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const grade = grades[student.id]
                    const percentage = grade ? ((grade.score / maxScore) * 100).toFixed(1) : "0.0"

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student.first_name} {student.surname}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.current_class}-{student.section}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{student.username}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={maxScore}
                            value={grade?.score || 0}
                            onChange={(e) => updateScore(student.id, Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{percentage}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(grade?.grade || "F")}>{grade?.grade || "F"}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Grade Distribution Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Grade Distribution</h4>
              <div className="grid grid-cols-5 gap-4 text-center">
                {["A", "B", "C", "D", "F"].map((gradeLevel) => {
                  const count = Object.values(grades).filter((g) => g.grade === gradeLevel).length
                  return (
                    <div key={gradeLevel}>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-gray-600">Grade {gradeLevel}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="text-center py-8">Loading students...</div>}

      {!loading && students.length === 0 && selectedClass && (
        <div className="text-center py-8 text-gray-500">No students found for {selectedClass}</div>
      )}
    </div>
  )
}
