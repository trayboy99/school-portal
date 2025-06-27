"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Calendar, Users, Eye, GraduationCap, Upload, X, Download } from "lucide-react"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
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
  submission_count: number
  total_students: number
  instructions?: string
}

interface TeacherSubjectClass {
  subject_name: string
  class_name: string
}

interface AssignmentFile {
  id: number
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

export function AssignmentsSection() {
  const { teacher } = useTeacherAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [teacherSubjectClasses, setTeacherSubjectClasses] = useState<TeacherSubjectClass[]>([])
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [assignmentFiles, setAssignmentFiles] = useState<AssignmentFile[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject_name: "",
    class_name: "",
    due_date: "",
    total_marks: 100,
    instructions: "",
  })

  // Load assignments on component mount
  useEffect(() => {
    if (teacher) {
      loadAssignments()
      loadTeacherSubjectClasses()
    }
  }, [teacher])

  const loadAssignments = async () => {
    if (!teacher) return

    console.log("=== LOADING TEACHER ASSIGNMENTS ===")
    console.log("Teacher:", teacher)

    try {
      setLoading(true)

      // Get assignments created by this teacher
      const { data: assignmentsData, error } = await supabase
        .from("assignments")
        .select(`
          *,
          assignment_submissions(count)
        `)
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading assignments:", error)
        return
      }

      console.log("Raw assignments data:", assignmentsData)

      // Process assignments with submission counts
      const processedAssignments = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          // Count submissions for this assignment
          const { count: submissionCount } = await supabase
            .from("assignment_submissions")
            .select("*", { count: "exact", head: true })
            .eq("assignment_id", assignment.id)

          // Count total students in the class
          const { count: totalStudents } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("class", assignment.class_name)

          return {
            ...assignment,
            submission_count: submissionCount || 0,
            total_students: totalStudents || 0,
          }
        }),
      )

      console.log("Processed assignments:", processedAssignments)
      setAssignments(processedAssignments)
    } catch (error) {
      console.error("Error in loadAssignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeacherSubjectClasses = async () => {
    if (!teacher) return

    console.log("=== LOADING TEACHER SUBJECT-CLASS COMBINATIONS ===")
    console.log("Teacher name:", teacher.first_name, teacher.middle_name, teacher.surname)

    try {
      // Construct teacher's full name to match with teacher_name in subjects table
      const teacherFullName = [teacher.first_name, teacher.middle_name, teacher.surname].filter(Boolean).join(" ")

      console.log("Looking for teacher name:", teacherFullName)

      // Get all subjects taught by this teacher using teacher_name
      const { data: subjectsData, error } = await supabase
        .from("subjects")
        .select("name, target_class, teacher_name")
        .eq("teacher_name", teacherFullName)

      if (error) {
        console.error("Error loading teacher subjects:", error)
        return
      }

      console.log("Teacher subjects data:", subjectsData)

      // Process the data to create subject-class combinations
      const subjectClassCombinations: TeacherSubjectClass[] = []

      subjectsData?.forEach((subject) => {
        if (subject.target_class) {
          subjectClassCombinations.push({
            subject_name: subject.name,
            class_name: subject.target_class,
          })
        }
      })

      console.log("Subject-Class combinations:", subjectClassCombinations)
      setTeacherSubjectClasses(subjectClassCombinations)
    } catch (error) {
      console.error("Error in loadTeacherSubjectClasses:", error)
    }
  }

  // Update available classes when subject is selected
  useEffect(() => {
    if (formData.subject_name) {
      const classesForSubject = teacherSubjectClasses
        .filter((item) => item.subject_name === formData.subject_name)
        .map((item) => item.class_name)

      console.log(`Classes for ${formData.subject_name}:`, classesForSubject)
      setAvailableClasses(classesForSubject)

      // Reset class selection if current class is not available for selected subject
      if (!classesForSubject.includes(formData.class_name)) {
        setFormData((prev) => ({ ...prev, class_name: "" }))
      }
    } else {
      setAvailableClasses([])
    }
  }, [formData.subject_name, teacherSubjectClasses])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (assignmentId: number) => {
    if (uploadedFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of uploadedFiles) {
        // In a real app, you'd upload to storage (like Supabase Storage)
        // For now, we'll simulate with a placeholder URL
        const fileUrl = `/uploads/assignments/${assignmentId}/${file.name}`

        const { error } = await supabase.from("assignment_files").insert([
          {
            assignment_id: assignmentId,
            file_name: file.name,
            file_url: fileUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: teacher?.id,
          },
        ])

        if (error) {
          console.error("Error uploading file:", error)
        }
      }
    } catch (error) {
      console.error("Error in uploadFiles:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateAssignment = async () => {
    if (!teacher) return

    console.log("Creating assignment:", formData)

    // Validation
    if (!formData.title || !formData.subject_name || !formData.class_name || !formData.due_date) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const { data, error } = await supabase
        .from("assignments")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            subject_name: formData.subject_name,
            class_name: formData.class_name,
            due_date: formData.due_date,
            total_marks: formData.total_marks,
            instructions: formData.instructions,
            teacher_id: teacher.id,
            teacher_name: [teacher.first_name, teacher.middle_name, teacher.surname].filter(Boolean).join(" "),
            status: "active",
          },
        ])
        .select()

      if (error) {
        console.error("Error creating assignment:", error)
        alert("Error creating assignment: " + error.message)
        return
      }

      console.log("Assignment created:", data)

      // Upload files if any
      if (data && data[0] && uploadedFiles.length > 0) {
        await uploadFiles(data[0].id)
      }

      alert("Assignment created successfully!")

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        subject_name: "",
        class_name: "",
        due_date: "",
        total_marks: 100,
        instructions: "",
      })
      setUploadedFiles([])
      setCreateDialogOpen(false)

      // Reload assignments
      loadAssignments()
    } catch (error) {
      console.error("Error in handleCreateAssignment:", error)
      alert("Error creating assignment")
    }
  }

  const handleViewDetails = async (assignment: Assignment) => {
    console.log("Viewing assignment details:", assignment)
    setSelectedAssignment(assignment)

    // Load submissions for this assignment
    try {
      const { data: submissionsData } = await supabase
        .from("assignment_submissions")
        .select(`
          *,
          students(first_name, middle_name, surname)
        `)
        .eq("assignment_id", assignment.id)

      // Load assignment files
      const { data: filesData } = await supabase.from("assignment_files").select("*").eq("assignment_id", assignment.id)

      console.log("Assignment submissions:", submissionsData)
      console.log("Assignment files:", filesData)
      setSubmissions(submissionsData || [])
      setAssignmentFiles(filesData || [])
      setDetailsDialogOpen(true)
    } catch (error) {
      console.error("Error loading assignment details:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "active":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getSubmissionPercentage = (submitted: number, total: number) => {
    if (total === 0) return 0
    return Math.round((submitted / total) * 100)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  // Get unique subjects taught by teacher
  const uniqueSubjects = [...new Set(teacherSubjectClasses.map((item) => item.subject_name))]

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-gray-600">Create and manage student assignments</p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Create a new assignment with instructions and supporting materials</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Shakespeare Essay Analysis"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Brief Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of what students need to do"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject_name}
                    onValueChange={(value) => setFormData({ ...formData, subject_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject you teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select
                    value={formData.class_name}
                    onValueChange={(value) => setFormData({ ...formData, class_name: value })}
                    disabled={!formData.subject_name}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.subject_name ? "Select class" : "Select subject first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: Number.parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="instructions">Detailed Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Detailed step-by-step instructions for students (format requirements, submission guidelines, etc.)"
                  rows={4}
                />
              </div>

              {/* File Upload Section */}
              <div className="grid gap-2">
                <Label>Assignment Materials (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                        <span className="text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, images up to 10MB each</p>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Debug info */}
              {formData.subject_name && (
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <p>
                    <strong>Selected:</strong> {formData.subject_name}
                  </p>
                  <p>
                    <strong>Available classes:</strong> {availableClasses.join(", ") || "None"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} disabled={uploading}>
                {uploading ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Created by you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.filter((a) => a.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">Finished assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.reduce((sum, a) => sum + a.submission_count, 0)}</div>
            <p className="text-xs text-muted-foreground">Student submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Create your first assignment to get started with managing student work.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span className="truncate">{assignment.title}</span>
                  </div>
                  <Badge variant={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                </CardTitle>
                <CardDescription>
                  {assignment.subject_name} - {assignment.class_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>
                      {assignment.submission_count}/{assignment.total_students} submitted
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${getSubmissionPercentage(assignment.submission_count, assignment.total_students)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewDetails(assignment)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => handleViewDetails(assignment)}>
                    <GraduationCap className="h-4 w-4 mr-1" />
                    Grade Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.subject_name} - {selectedAssignment?.class_name}
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

              {/* Assignment Files */}
              {assignmentFiles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Assignment Materials</h4>
                  <div className="space-y-2">
                    {assignmentFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.file_name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.file_size)})</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Submissions ({submissions.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No submissions yet</p>
                  ) : (
                    submissions.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">
                            {submission.students?.first_name} {submission.students?.middle_name}{" "}
                            {submission.students?.surname}
                          </p>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                            {submission.status}
                          </Badge>
                          {submission.marks_obtained && (
                            <p className="text-sm text-gray-600 mt-1">
                              {submission.marks_obtained}/{selectedAssignment.total_marks}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
