"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Calendar, Clock, Upload, Eye, CheckCircle, AlertCircle, Search } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface Assignment {
  id: number
  title: string
  description: string
  subject_name: string
  class_name: string
  due_date: string
  total_marks: number
  status: string
  created_at: string
  instructions?: string
  teacher_name: string
}

interface Submission {
  id: number
  assignment_id: number
  student_id: number
  submission_text: string
  submitted_at: string
  status: string
  marks_obtained?: number
  feedback?: string
}

export default function AssignmentsSection() {
  const { student } = useStudentAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (student) {
      loadAssignments()
      loadSubmissions()
    }
  }, [student])

  const loadAssignments = async () => {
    if (!student) return

    try {
      setLoading(true)

      const { data: assignmentsData, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("class_name", student.class)
        .order("due_date", { ascending: true })

      if (error) throw error

      setAssignments(assignmentsData || [])
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async () => {
    if (!student) return

    try {
      const { data: submissionsData, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", student.id)

      if (error) throw error

      setSubmissions(submissionsData || [])
    } catch (error) {
      console.error("Error loading submissions:", error)
    }
  }

  const getSubmissionForAssignment = (assignmentId: number) => {
    return submissions.find((s) => s.assignment_id === assignmentId)
  }

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setViewDialogOpen(true)
  }

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setSubmissionText("")
    setSubmitDialogOpen(true)
  }

  const submitAssignment = async () => {
    if (!selectedAssignment || !student || !submissionText.trim()) {
      alert("Please enter your submission")
      return
    }

    try {
      setSubmitting(true)

      const { error } = await supabase.from("assignment_submissions").insert([
        {
          assignment_id: selectedAssignment.id,
          student_id: student.id,
          submission_text: submissionText,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      alert("Assignment submitted successfully!")
      setSubmitDialogOpen(false)
      setSubmissionText("")
      loadSubmissions() // Reload submissions
    } catch (error) {
      console.error("Error submitting assignment:", error)
      alert("Error submitting assignment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (assignment: Assignment) => {
    const submission = getSubmissionForAssignment(assignment.id)
    const dueDate = new Date(assignment.due_date)
    const now = new Date()

    if (submission) {
      if (submission.status === "graded") return "default"
      return "secondary"
    }

    if (dueDate < now) return "destructive"
    return "outline"
  }

  const getStatusText = (assignment: Assignment) => {
    const submission = getSubmissionForAssignment(assignment.id)
    const dueDate = new Date(assignment.due_date)
    const now = new Date()

    if (submission) {
      if (submission.status === "graded") return "Graded"
      return "Submitted"
    }

    if (dueDate < now) return "Overdue"
    return "Pending"
  }

  const getStatusIcon = (assignment: Assignment) => {
    const submission = getSubmissionForAssignment(assignment.id)
    const dueDate = new Date(assignment.due_date)
    const now = new Date()

    if (submission) {
      if (submission.status === "graded") return <CheckCircle className="h-4 w-4 text-green-500" />
      return <Clock className="h-4 w-4 text-blue-500" />
    }

    if (dueDate < now) return <AlertCircle className="h-4 w-4 text-red-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your assignments.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{assignments.length} assignments</span>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assignments by title, subject, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">
                  {
                    assignments.filter((a) => !getSubmissionForAssignment(a.id) && new Date(a.due_date) > new Date())
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Submitted</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold">
                  {
                    assignments.filter((a) => !getSubmissionForAssignment(a.id) && new Date(a.due_date) < new Date())
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const submission = getSubmissionForAssignment(assignment.id)

          return (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(assignment)}
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <Badge variant={getStatusColor(assignment)} className="text-xs">
                        {getStatusText(assignment)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {assignment.subject_name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      <span>{assignment.total_marks} marks</span>
                    </div>

                    {submission && submission.status === "graded" && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Grade:</strong> {submission.marks_obtained}/{assignment.total_marks}
                          {submission.feedback && (
                            <span className="block mt-1">
                              <strong>Feedback:</strong> {submission.feedback}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleViewAssignment(assignment)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {!submission && new Date(assignment.due_date) > new Date() && (
                      <Button size="sm" onClick={() => handleSubmitAssignment(assignment)}>
                        <Upload className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Results */}
      {filteredAssignments.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search criteria" : "No assignments available at the moment"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Assignment Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.subject_name} • Due:{" "}
              {selectedAssignment && new Date(selectedAssignment.due_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedAssignment.description}</p>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Due Date</h4>
                  <p className="text-gray-600">{new Date(selectedAssignment.due_date).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Total Marks</h4>
                  <p className="text-gray-600">{selectedAssignment.total_marks}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Teacher</h4>
                <p className="text-gray-600">{selectedAssignment.teacher_name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title} • {selectedAssignment?.subject_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your Submission</label>
              <Textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your assignment submission here..."
                rows={8}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={submitAssignment} disabled={submitting || !submissionText.trim()}>
                {submitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
