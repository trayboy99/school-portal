"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Download, Trash2, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface UploadItem {
  id: number
  teacher_id: number
  upload_type: string
  subject_name: string
  class_name: string
  academic_year: string
  term: string
  weeks?: number[] // Changed from string to number array
  file_name: string
  file_url: string
  file_size: number
  uploaded_at: string
  status: string
}

interface Deadline {
  deadline_type: string
  deadline_date: string
  academic_year: string
  term: string
}

interface TeacherClass {
  class_name: string
  subject_name: string
}

interface AcademicWeek {
  id: number
  week_number: number
  week_name: string
  description: string
}

export function UploadsSection() {
  const { teacher } = useTeacherAuth()
  const [activeTab, setActiveTab] = useState<"exam_questions" | "e_notes">("exam_questions")
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [academicWeeks, setAcademicWeeks] = useState<AcademicWeek[]>([])
  const [uploadForm, setUploadForm] = useState({
    subject_name: "",
    class_name: "",
    week_ids: [] as number[], // Changed from weeks string to week_ids array
  })

  const currentAcademicYear = "2024-2025"
  const currentTerm = "Second Term"

  useEffect(() => {
    if (teacher) {
      loadData()
    }
  }, [teacher])

  const loadData = async () => {
    if (!teacher) return

    try {
      setIsLoading(true)

      // Load uploads
      const { data: uploadsData, error: uploadsError } = await supabase
        .from("uploads")
        .select("*")
        .eq("teacher_id", teacher.id)
        .eq("status", "active")
        .order("uploaded_at", { ascending: false })

      if (uploadsError) {
        console.error("Error loading uploads:", uploadsError)
      } else {
        setUploads(uploadsData || [])
      }

      // Load deadlines
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from("admin_deadlines")
        .select("*")
        .eq("is_active", true)

      if (deadlinesError) {
        console.error("Error loading deadlines:", deadlinesError)
      } else {
        setDeadlines(deadlinesData || [])
      }

      // Load academic weeks
      const { data: weeksData, error: weeksError } = await supabase
        .from("academic_weeks")
        .select("*")
        .eq("is_active", true)
        .order("week_number", { ascending: true })

      if (weeksError) {
        console.error("Error loading academic weeks:", weeksError)
      } else {
        setAcademicWeeks(weeksData || [])
      }

      // Load teacher's subjects and classes from teachers table
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("subjects, classes")
        .eq("id", teacher.id)
        .single()

      if (teacherError) {
        console.error("Error loading teacher data:", teacherError)
      } else {
        console.log("Teacher data:", teacherData)

        // Parse subjects (assuming it's a comma-separated string or JSON)
        let subjects = []
        if (teacherData.subjects) {
          if (typeof teacherData.subjects === "string") {
            subjects = teacherData.subjects.split(",").map((s) => s.trim())
          } else if (Array.isArray(teacherData.subjects)) {
            subjects = teacherData.subjects
          }
        }

        // Parse classes (assuming it's a comma-separated string or JSON)
        let classes = []
        if (teacherData.classes) {
          if (typeof teacherData.classes === "string") {
            classes = teacherData.classes.split(",").map((c) => c.trim())
          } else if (Array.isArray(teacherData.classes)) {
            classes = teacherData.classes
          }
        }

        // Create combinations for the dropdown
        const combinations = []
        subjects.forEach((subject) => {
          classes.forEach((className) => {
            combinations.push({
              subject_name: subject,
              class_name: className,
            })
          })
        })

        console.log("Teacher subjects:", subjects)
        console.log("Teacher classes:", classes)
        console.log("Combinations:", combinations)

        setTeacherClasses(combinations)
      }
    } catch (error) {
      console.error("Error in loadData:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentDeadline = (type: "exam_questions" | "e_notes") => {
    return deadlines.find((d) => d.deadline_type === type)
  }

  const isDeadlinePassed = (deadline: Deadline) => {
    return new Date(deadline.deadline_date) < new Date()
  }

  const getDeadlineStatus = (deadline: Deadline) => {
    const deadlineDate = new Date(deadline.deadline_date)
    const now = new Date()
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      return {
        status: "Deadline passed",
        color: "text-red-600",
        icon: AlertCircle,
        canUpload: false, // Teachers cannot upload after deadline
      }
    } else if (diffHours < 24) {
      return {
        status: "Due soon",
        color: "text-orange-600",
        icon: Clock,
        canUpload: true,
      }
    } else {
      return {
        status: "Active",
        color: "text-green-600",
        icon: CheckCircle,
        canUpload: true,
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !teacher) return

    const currentDeadline = getCurrentDeadline(activeTab)
    if (!currentDeadline) {
      alert("No deadline set for this upload type!")
      return
    }

    const deadlineStatus = getDeadlineStatus(currentDeadline)
    if (!deadlineStatus.canUpload) {
      alert("Cannot upload: The deadline has passed!")
      return
    }

    if (!uploadForm.subject_name || !uploadForm.class_name) {
      alert("Please select subject and class!")
      return
    }

    if (activeTab === "e_notes" && uploadForm.week_ids.length === 0) {
      alert("Please select at least one week for e-notes!")
      return
    }

    try {
      setIsUploading(true)

      // For demo purposes, simulate file upload
      const mockFileUrl = `/uploads/${file.name}`

      const uploadData = {
        teacher_id: teacher.id,
        upload_type: activeTab,
        subject_name: uploadForm.subject_name,
        class_name: uploadForm.class_name,
        academic_year: currentAcademicYear,
        term: currentTerm,
        weeks: activeTab === "e_notes" ? uploadForm.week_ids : null,
        file_name: file.name,
        file_url: mockFileUrl,
        file_size: file.size,
        status: "active",
      }

      const { error } = await supabase.from("uploads").insert(uploadData)

      if (error) throw error

      // Reset form and reload data
      setUploadForm({
        subject_name: "",
        class_name: "",
        week_ids: [],
      })

      await loadData()
      alert("File uploaded successfully!")
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteUpload = async (uploadId: number) => {
    if (!confirm("Are you sure you want to delete this upload?")) return

    try {
      const { error } = await supabase.from("uploads").update({ status: "deleted" }).eq("id", uploadId)

      if (error) throw error

      await loadData()
      alert("Upload deleted successfully!")
    } catch (error) {
      console.error("Error deleting upload:", error)
      alert("Error deleting upload. Please try again.")
    }
  }

  const getFilteredUploads = () => {
    let filtered = uploads.filter((upload) => upload.upload_type === activeTab)

    if (selectedClass) {
      filtered = filtered.filter((upload) => upload.class_name === selectedClass)
    }

    return filtered
  }

  const getUploadStats = () => {
    const filtered = getFilteredUploads()
    const totalUploads = filtered.length
    const uniqueClasses = [...new Set(filtered.map((u) => u.class_name))].length

    return { totalUploads, uniqueClasses }
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
          <p className="text-gray-600 mt-4">Loading uploads...</p>
        </div>
      </div>
    )
  }

  const currentDeadline = getCurrentDeadline(activeTab)
  const deadlineStatus = currentDeadline ? getDeadlineStatus(currentDeadline) : null
  const stats = getUploadStats()

  return (
    <div className="space-y-6">
      {/* Header - Matching Admin UI */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
          <p className="text-gray-600">Upload exam questions and e-notes</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Academic Period</p>
          <p className="text-lg font-semibold text-blue-600">{currentAcademicYear}</p>
          <p className="text-lg font-semibold text-green-600">{currentTerm}</p>
        </div>
      </div>

      {/* Tabs - Matching Admin UI */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("exam_questions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "exam_questions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Exam Questions
          </button>
          <button
            onClick={() => setActiveTab("e_notes")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "e_notes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            E-Notes
          </button>
        </nav>
      </div>

      {/* Upload Button and Deadline - Matching Admin UI */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gray-600 hover:bg-gray-700" disabled={!deadlineStatus?.canUpload}>
                Upload {activeTab === "exam_questions" ? "Exam Questions" : "E-Notes"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload {activeTab === "exam_questions" ? "Exam Questions" : "E-Notes"}</DialogTitle>
                <DialogDescription>
                  Upload {activeTab === "exam_questions" ? "exam questions" : "e-notes"} for your assigned classes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pb-6">
                {/* Subject Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Subject:</label>
                  <Select
                    value={uploadForm.subject_name}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, subject_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(teacherClasses.map((tc) => tc.subject_name))].map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Class:</label>
                  <Select
                    value={uploadForm.class_name}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, class_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses
                        .filter((tc) => !uploadForm.subject_name || tc.subject_name === uploadForm.subject_name)
                        .map((tc) => (
                          <SelectItem key={`${tc.class_name}-${tc.subject_name}`} value={tc.class_name}>
                            {tc.class_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weeks Selection (E-Notes only) */}
                {activeTab === "e_notes" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Weeks:</label>
                    <Select
                      value={uploadForm.week_ids.length > 0 ? uploadForm.week_ids.join(",") : ""}
                      onValueChange={(value) => {
                        if (value) {
                          const selectedIds = value.split(",").map((id) => Number.parseInt(id))
                          setUploadForm({ ...uploadForm, week_ids: selectedIds })
                        } else {
                          setUploadForm({ ...uploadForm, week_ids: [] })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weeks" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {academicWeeks.map((week) => (
                          <SelectItem key={week.id} value={week.id.toString()}>
                            {week.week_name} - {week.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {uploadForm.week_ids.map((weekId) => {
                        const week = academicWeeks.find((w) => w.id === weekId)
                        return week ? (
                          <Badge key={weekId} variant="secondary" className="text-xs">
                            {week.week_name}
                            <button
                              onClick={() =>
                                setUploadForm({
                                  ...uploadForm,
                                  week_ids: uploadForm.week_ids.filter((id) => id !== weekId),
                                })
                              }
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select multiple weeks by clicking on different weeks. Click × to remove.
                    </p>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select File:</label>
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={
                      isUploading ||
                      !uploadForm.subject_name ||
                      !uploadForm.class_name ||
                      (activeTab === "e_notes" && uploadForm.week_ids.length === 0)
                    }
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, PPT, PPTX</p>
                </div>

                {/* Upload Status */}
                {isUploading && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Deadline Display - Matching Admin UI */}
        {currentDeadline && deadlineStatus && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Deadline:</span>
            <span className="text-sm font-medium">{new Date(currentDeadline.deadline_date).toDateString()}</span>
            <span className={`text-sm font-medium ${deadlineStatus.color}`}>({deadlineStatus.status})</span>
          </div>
        )}
      </div>

      {/* Section Headers - Matching Admin UI */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploaded {activeTab === "exam_questions" ? "Exams" : "E-Notes"} for: {currentTerm} [{currentAcademicYear}]
        </h2>

        <h3 className="text-lg font-semibold text-gray-900">
          Submission Summary for Class - {currentTerm} [{currentAcademicYear}]
        </h3>

        {/* Class Selection for Summary */}
        <div className="max-w-xs">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class to view submission summary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {[...new Set(teacherClasses.map((tc) => tc.class_name))].map((className) => (
                <SelectItem key={className} value={className}>
                  {className}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total {activeTab === "exam_questions" ? "Exam Questions" : "E-Notes"}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUploads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Classes Covered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              {deadlineStatus?.icon && <deadlineStatus.icon className={`h-8 w-8 ${deadlineStatus.color}`} />}
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deadline Status</p>
                <p className={`text-lg font-bold ${deadlineStatus?.color || "text-gray-900"}`}>
                  {deadlineStatus?.status || "No deadline set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploads List */}
      <div className="space-y-4">
        {getFilteredUploads().map((upload) => (
          <Card key={upload.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{upload.file_name}</h3>
                    <p className="text-sm text-gray-600">
                      {upload.subject_name} • {upload.class_name}
                      {upload.weeks && (
                        <span>
                          {" • "}
                          {(() => {
                            try {
                              // Handle different formats of weeks data
                              let weekIds = []
                              if (Array.isArray(upload.weeks)) {
                                weekIds = upload.weeks
                              } else if (typeof upload.weeks === "string") {
                                weekIds = JSON.parse(upload.weeks)
                              } else if (typeof upload.weeks === "object") {
                                weekIds = Object.values(upload.weeks)
                              }

                              return weekIds
                                .map((weekId) => {
                                  const week = academicWeeks.find((w) => w.id === weekId)
                                  return week ? week.week_name : `Week ${weekId}`
                                })
                                .join(", ")
                            } catch (error) {
                              console.error("Error parsing weeks:", error)
                              return "Weeks data"
                            }
                          })()}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(upload.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {(upload.file_size / 1024 / 1024).toFixed(2)} MB
                  </Badge>

                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUpload(upload.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Uploads Message */}
      {getFilteredUploads().length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === "exam_questions" ? "exam questions" : "e-notes"} uploaded yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by uploading your first {activeTab === "exam_questions" ? "exam questions" : "e-notes"}
              {selectedClass && ` for ${selectedClass}`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
