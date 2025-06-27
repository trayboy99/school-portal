"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, MessageSquare, User, Plus, Edit, Save } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface Student {
  id: number
  first_name: string
  middle_name: string
  surname: string
  class: string
  reg_number: string
}

interface Comment {
  id: number
  student_id: number
  teacher_id: number
  term: string
  academic_year: string
  comment: string
  comment_type: string
  created_at: string
  updated_at: string
  student?: Student
}

interface Exam {
  id: number
  exam_name: string
  mark_type: string
  term: string
  session: string
  year: string
}

const COMMENT_TEMPLATES = [
  "Excellent performance in all subjects. Keep up the good work!",
  "Good academic performance. Needs to improve in punctuality.",
  "Shows great potential. Encourage more participation in class activities.",
  "Satisfactory performance. Needs more focus on weak subjects.",
  "Outstanding student with excellent behavior and academic performance.",
  "Good student but needs to improve handwriting and neatness.",
  "Very intelligent student. Encourage more reading culture.",
  "Hardworking student with good moral behavior.",
]

export function ReportCommentsSection() {
  const { teacher } = useTeacherAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("First Term")
  const [selectedYear, setSelectedYear] = useState("2024/2025")
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [selectedSession, setSelectedSession] = useState<string>("2024-2025")
  const [exams, setExams] = useState<any[]>([])
  const [teacherClass, setTeacherClass] = useState<string>("")

  useEffect(() => {
    if (teacher) {
      loadStudentsAndComments()
    }
  }, [teacher, selectedExam])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm])

  const loadStudentsAndComments = async () => {
    if (!teacher) return

    try {
      setIsLoading(true)
      console.log("Loading teacher's assigned class and students...")

      // First, get teacher's assigned class
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("name")
        .eq("teacher_id", teacher.id)
        .single()

      if (classError) {
        console.log("No class assigned to teacher")
        setStudents([])
        setComments([])
        setIsLoading(false)
        return
      }

      setTeacherClass(classData.name)

      // Get students from teacher's assigned class only
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, middle_name, surname, class, reg_number")
        .eq("class", classData.name)
        .eq("status", "Active")
        .order("first_name")

      if (studentsError) {
        console.error("Error loading students:", studentsError)
        return
      }

      console.log("Students data:", studentsData)
      setStudents(studentsData || [])

      // Load available exams
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("id, exam_name, mark_type, term, session, year")
        .order("created_at", { ascending: false })

      if (examsError) {
        console.error("Error loading exams:", examsError)
      } else {
        setExams(examsData || [])
      }

      // Get existing comments for selected filters
      if (selectedExam) {
        const { data: commentsData, error: commentsError } = await supabase
          .from("report_comments")
          .select(`
          id,
          student_id,
          teacher_id,
          exam_id,
          term,
          academic_year,
          comment,
          comment_type,
          created_at,
          updated_at
        `)
          .eq("teacher_id", teacher.id)
          .eq("exam_id", selectedExam)

        if (commentsError) {
          console.error("Error loading comments:", commentsError)
        } else {
          setComments(commentsData || [])
        }
      }
    } catch (error) {
      console.error("Error in loadStudentsAndComments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          `${student.first_name} ${student.middle_name} ${student.surname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredStudents(filtered)
  }

  const getStudentComment = (studentId: number) => {
    return comments.find((comment) => comment.student_id === studentId)
  }

  const handleSaveComment = async () => {
    if (!teacher || !selectedStudent || !newComment.trim() || !selectedExam) {
      alert("Please select exam and enter comment")
      return
    }

    try {
      const selectedExamData = exams.find((exam) => exam.id.toString() === selectedExam)
      if (!selectedExamData) return

      const existingComment = getStudentComment(selectedStudent.id)

      if (existingComment) {
        // Update existing comment
        const { error } = await supabase
          .from("report_comments")
          .update({
            comment: newComment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingComment.id)

        if (error) throw error
      } else {
        // Create new comment
        const { error } = await supabase.from("report_comments").insert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          exam_id: Number.parseInt(selectedExam),
          term: selectedExamData.term,
          academic_year: selectedExamData.session,
          comment: newComment,
          comment_type: "general",
        })

        if (error) throw error
      }

      // Reload comments
      await loadStudentsAndComments()

      // Reset form
      setNewComment("")
      setSelectedStudent(null)
      setIsAddingComment(false)
      setEditingComment(null)
    } catch (error) {
      console.error("Error saving comment:", error)
      alert("Error saving comment. Please try again.")
    }
  }

  const handleEditComment = (comment: Comment) => {
    const student = students.find((s) => s.id === comment.student_id)
    if (student) {
      setSelectedStudent(student)
      setNewComment(comment.comment)
      setEditingComment(comment)
      setIsAddingComment(true)
    }
  }

  const handleUseTemplate = (template: string) => {
    setNewComment(template)
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in as a teacher to access this section.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading students and comments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Card Comments</h1>
          <p className="text-gray-600">Add and manage student report card comments</p>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-green-600" />
          <span className="text-sm text-gray-600">
            {comments.length} comments for {selectedTerm}
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Exam Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Exam *</label>
              <select
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value)
                  const exam = exams.find((ex) => ex.id.toString() === e.target.value)
                  if (exam) {
                    setSelectedExamType(exam.mark_type)
                    setSelectedTerm(exam.term)
                    setSelectedSession(exam.session)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.exam_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type (Auto-filled) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Exam Type</label>
              <input
                type="text"
                value={selectedExamType}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto-filled from exam"
              />
            </div>

            {/* Term (Auto-filled) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Term</label>
              <input
                type="text"
                value={selectedTerm}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto-filled from exam"
              />
            </div>

            {/* Session (Auto-filled) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Session</label>
              <input
                type="text"
                value={selectedSession}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto-filled from exam"
              />
            </div>

            {/* Class (Teacher's Assigned Class) */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Class</label>
              <input
                type="text"
                value={teacherClass}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Your assigned class"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name or reg number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {!selectedExam && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Please select an exam first</strong> to load students and add comments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      {selectedExam && (
        <div className="grid grid-cols-1 gap-4">
          {filteredStudents.map((student) => {
            const comment = getStudentComment(student.id)
            const studentName = [student.first_name, student.middle_name, student.surname].filter(Boolean).join(" ")

            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{studentName}</h3>
                        <p className="text-sm text-gray-600">
                          {student.reg_number} • {student.class}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {comment ? (
                        <>
                          <Badge variant="default" className="text-xs">
                            Comment Added
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => handleEditComment(comment)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setNewComment("")
                            setEditingComment(null)
                            setIsAddingComment(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Comment
                        </Button>
                      )}
                    </div>
                  </div>

                  {comment && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(comment.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {filteredStudents.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search criteria" : "No students available for comments"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Comment Dialog */}
      <Dialog open={isAddingComment} onOpenChange={setIsAddingComment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingComment ? "Edit Comment" : "Add Comment"} for{" "}
              {selectedStudent &&
                [selectedStudent.first_name, selectedStudent.middle_name, selectedStudent.surname]
                  .filter(Boolean)
                  .join(" ")}
            </DialogTitle>
            <DialogDescription>
              {selectedTerm} • {selectedYear}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Comment Templates */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Templates (click to use):</label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {COMMENT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseTemplate(template)}
                    className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Comment:</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment for this student..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingComment(false)
                  setNewComment("")
                  setSelectedStudent(null)
                  setEditingComment(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveComment} disabled={!newComment.trim()}>
                <Save className="h-4 w-4 mr-1" />
                {editingComment ? "Update Comment" : "Save Comment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
