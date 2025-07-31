"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Upload,
  FileText,
  Calendar,
  Users,
  BookOpen,
  Eye,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
  status: string
}

interface Subject {
  id: number
  subject_name: string
  subject_code: string
  department: string
}

interface Teacher {
  id: string
  first_name: string
  surname: string
  username: string
  department: string
  subjects: number[]
}

interface Class {
  id: number
  class_name: string
}

interface AcademicYear {
  id: number
  name: string
}

interface AcademicTerm {
  id: number
  name: string
}

interface UploadDeadline {
  id: number
  deadline_type: string
  deadline_date: string
  year_name: string
  term_name: string
  academic_year_id: number
  academic_term_id: number
}

interface ENotesUpload {
  id: number
  teacher_id: number
  subject_id: number
  class_id: number
  academic_year_id: number
  academic_term_id: number
  week_number: number
  file_name: string
  file_path: string
  upload_date: string
  uploaded_by_admin: boolean
}

interface ExamQuestionsUpload {
  id: number
  teacher_id: number
  subject_id: number
  class_id: number
  academic_year_id: number
  academic_term_id: number
  file_name: string
  file_path: string
  upload_date: string
  uploaded_by_admin: boolean
}

interface UploadSummary {
  teacher_id: number
  teacher_name: string
  teacher_email: string
  department: string
  exam_questions_submitted: boolean
  e_notes_weeks_submitted: number
  e_notes_completion_percentage: number
}

interface AcademicInfo {
  academic_year_id: number
  academic_term_id: number
  year_name: string
  term_name: string
}

export function UploadsManagementSection() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([])
  const [currentAcademicInfo, setCurrentAcademicInfo] = useState<AcademicInfo | null>(null)
  const [uploadDeadlines, setUploadDeadlines] = useState<UploadDeadline[]>([])
  const [eNotesUploads, setENotesUploads] = useState<ENotesUpload[]>([])
  const [examQuestionsUploads, setExamQuestionsUploads] = useState<ExamQuestionsUpload[]>([])
  const [uploadSummary, setUploadSummary] = useState<UploadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("deadlines")
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Form states
  const [deadlineForm, setDeadlineForm] = useState({
    deadline_type: "",
    deadline_date: "",
  })

  const [eNotesForm, setENotesForm] = useState({
    teacher_id: "",
    subject_id: "",
    class_id: "",
    week_number: "",
    file: null as File | null,
  })

  const [examQuestionsForm, setExamQuestionsForm] = useState({
    teacher_id: "",
    subject_id: "",
    class_id: "",
    file: null as File | null,
  })

  // Dialog states
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false)
  const [eNotesDialogOpen, setENotesDialogOpen] = useState(false)
  const [examQuestionsDialogOpen, setExamQuestionsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/admin/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(Array.isArray(data) ? data.filter((dept: Department) => dept.status === "Active") : [])
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/admin/subjects")
      if (response.ok) {
        const data = await response.json()
        setSubjects(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setSubjects([])
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/admin/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setTeachers([])
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
      setClasses([])
    }
  }

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/admin/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
      setAcademicYears([])
    }
  }

  const fetchAcademicTerms = async () => {
    try {
      const response = await fetch("/api/admin/academic-terms")
      if (response.ok) {
        const data = await response.json()
        setAcademicTerms(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching academic terms:", error)
      setAcademicTerms([])
    }
  }

  const fetchCurrentAcademicInfo = async () => {
    try {
      const response = await fetch("/api/admin/current-academic-info")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.academic_info) {
          setCurrentAcademicInfo(data.academic_info)
        }
      }
    } catch (error) {
      console.error("Error fetching current academic info:", error)
      setCurrentAcademicInfo(null)
    }
  }

  const fetchUploadDeadlines = async () => {
    try {
      const response = await fetch("/api/admin/upload-deadlines")
      if (response.ok) {
        const data = await response.json()
        setUploadDeadlines(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching upload deadlines:", error)
      setUploadDeadlines([])
    }
  }

  const fetchENotesUploads = async () => {
    try {
      const response = await fetch("/api/admin/e-notes-uploads")
      if (response.ok) {
        const data = await response.json()
        setENotesUploads(Array.isArray(data.uploads) ? data.uploads : [])
      }
    } catch (error) {
      console.error("Error fetching e-notes uploads:", error)
      setENotesUploads([])
    }
  }

  const fetchExamQuestionsUploads = async () => {
    try {
      const response = await fetch("/api/admin/exam-questions-uploads")
      if (response.ok) {
        const data = await response.json()
        setExamQuestionsUploads(Array.isArray(data.uploads) ? data.uploads : [])
      }
    } catch (error) {
      console.error("Error fetching exam questions uploads:", error)
      setExamQuestionsUploads([])
    }
  }

  const fetchUploadSummary = async () => {
    try {
      const response = await fetch("/api/admin/upload-summary")
      if (response.ok) {
        const data = await response.json()
        setUploadSummary(Array.isArray(data.summary) ? data.summary : [])
      }
    } catch (error) {
      console.error("Error fetching upload summary:", error)
      setUploadSummary([])
    }
  }

  const getSubjectName = (subjectId: number): string => {
    const subject = subjects.find((s) => s.id === subjectId)
    return subject ? subject.subject_name : `Subject ${subjectId}`
  }

  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find((t) => Number(t.id) === teacherId)
    return teacher ? `${teacher.first_name} ${teacher.surname}` : `Teacher ${teacherId}`
  }

  const getClassName = (classId: number): string => {
    const classItem = classes.find((c) => c.id === classId)
    return classItem ? classItem.class_name : `Class ${classId}`
  }

  const getTeachersForSubject = (subjectId: string) => {
    if (!subjectId) return teachers
    const subjectIdNum = Number.parseInt(subjectId)
    return teachers.filter((teacher) => Array.isArray(teacher.subjects) && teacher.subjects.includes(subjectIdNum))
  }

  const handleDeadlineSubmit = async () => {
    if (!deadlineForm.deadline_type || !deadlineForm.deadline_date) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!currentAcademicInfo) {
      toast({
        title: "Error",
        description: "Academic information not available",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/upload-deadlines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deadline_type: deadlineForm.deadline_type,
          academic_year_id: currentAcademicInfo.academic_year_id,
          academic_term_id: currentAcademicInfo.academic_term_id,
          deadline_date: deadlineForm.deadline_date,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Deadline set successfully",
        })
        setDeadlineForm({ deadline_type: "", deadline_date: "" })
        setDeadlineDialogOpen(false)
        fetchUploadDeadlines()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to set deadline")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set deadline",
        variant: "destructive",
      })
    }
  }

  const handleENotesUpload = async () => {
    if (
      !eNotesForm.teacher_id ||
      !eNotesForm.subject_id ||
      !eNotesForm.class_id ||
      !eNotesForm.week_number ||
      !eNotesForm.file
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!currentAcademicInfo) {
      toast({
        title: "Error",
        description: "Academic information not available",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("teacher_id", eNotesForm.teacher_id)
      formData.append("academic_year_id", currentAcademicInfo.academic_year_id.toString())
      formData.append("academic_term_id", currentAcademicInfo.academic_term_id.toString())
      formData.append("subject_id", eNotesForm.subject_id)
      formData.append("class_id", eNotesForm.class_id)
      formData.append("week_number", eNotesForm.week_number)
      formData.append("uploaded_by_admin", "true")
      formData.append("file", eNotesForm.file)

      const response = await fetch("/api/admin/e-notes-uploads", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.updated ? "E-notes updated successfully" : "E-notes uploaded successfully",
        })
        setENotesForm({ teacher_id: "", subject_id: "", class_id: "", week_number: "", file: null })
        setENotesDialogOpen(false)
        fetchENotesUploads()
        fetchUploadSummary()
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload e-notes",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleExamQuestionsUpload = async () => {
    if (
      !examQuestionsForm.teacher_id ||
      !examQuestionsForm.subject_id ||
      !examQuestionsForm.class_id ||
      !examQuestionsForm.file
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    if (!currentAcademicInfo) {
      toast({
        title: "Error",
        description: "Academic information not available",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("teacher_id", examQuestionsForm.teacher_id)
      formData.append("academic_year_id", currentAcademicInfo.academic_year_id.toString())
      formData.append("academic_term_id", currentAcademicInfo.academic_term_id.toString())
      formData.append("subject_id", examQuestionsForm.subject_id)
      formData.append("class_id", examQuestionsForm.class_id)
      formData.append("uploaded_by_admin", "true")
      formData.append("file", examQuestionsForm.file)

      const response = await fetch("/api/admin/exam-questions-uploads", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.updated ? "Exam questions updated successfully" : "Exam questions uploaded successfully",
        })
        setExamQuestionsForm({ teacher_id: "", subject_id: "", class_id: "", file: null })
        setExamQuestionsDialogOpen(false)
        fetchExamQuestionsUploads()
        fetchUploadSummary()
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload exam questions",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const isDeadlinePassed = (deadlineDate: string) => {
    return new Date() > new Date(deadlineDate)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([
        fetchDepartments(),
        fetchSubjects(),
        fetchTeachers(),
        fetchClasses(),
        fetchAcademicYears(),
        fetchAcademicTerms(),
        fetchCurrentAcademicInfo(),
        fetchUploadDeadlines(),
        fetchENotesUploads(),
        fetchExamQuestionsUploads(),
        fetchUploadSummary(),
      ])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading uploads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Academic Info Banner */}
      {currentAcademicInfo ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Current Academic Period</h3>
                <p className="text-blue-700">
                  {currentAcademicInfo.year_name} • {currentAcademicInfo.term_name}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Academic Period</h3>
                <p className="text-yellow-700">
                  No current academic period found. Please set up academic years and terms.
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadDeadlines.length}</div>
            <p className="text-xs text-muted-foreground">Active deadlines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Notes Uploads</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eNotesUploads.length}</div>
            <p className="text-xs text-muted-foreground">Total uploads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exam Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examQuestionsUploads.length}</div>
            <p className="text-xs text-muted-foreground">Question papers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">Contributing teachers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Uploads Management
              </CardTitle>
              <CardDescription>Manage upload deadlines and submissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="deadlines" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deadlines
              </TabsTrigger>
              <TabsTrigger value="enotes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                E-Notes
              </TabsTrigger>
              <TabsTrigger value="exams" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exam Questions
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deadlines" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Upload Deadlines</h3>
                <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!currentAcademicInfo}>
                      <Plus className="h-4 w-4 mr-2" />
                      Set Deadline
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Upload Deadline</DialogTitle>
                      <DialogDescription>Set a deadline for the current academic period</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deadline_type">Upload Type</Label>
                        <Select
                          value={deadlineForm.deadline_type}
                          onValueChange={(value) => setDeadlineForm({ ...deadlineForm, deadline_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select upload type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exam_questions">Exam Questions</SelectItem>
                            <SelectItem value="e_notes">E-Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="deadline_date">Deadline Date</Label>
                        <Input
                          id="deadline_date"
                          type="datetime-local"
                          value={deadlineForm.deadline_date}
                          onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline_date: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleDeadlineSubmit} className="w-full">
                        Set Deadline
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Academic Period</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadDeadlines.map((deadline) => (
                      <TableRow key={deadline.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {deadline.deadline_type === "exam_questions" ? "Exam Questions" : "E-Notes"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{deadline.year_name}</p>
                            <p className="text-sm text-gray-600">{deadline.term_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDateTime(deadline.deadline_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={isDeadlinePassed(deadline.deadline_date) ? "destructive" : "default"}>
                            {isDeadlinePassed(deadline.deadline_date) ? "Expired" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {uploadDeadlines.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deadlines set</h3>
                  <p className="text-gray-600">Set your first upload deadline to get started</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="enotes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">E-Notes Uploads</h3>
                <Dialog open={eNotesDialogOpen} onOpenChange={setENotesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!currentAcademicInfo}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload E-Notes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Upload E-Notes</DialogTitle>
                      <DialogDescription>Upload weekly e-notes for the current academic period</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Academic Year</Label>
                          <Input
                            value={currentAcademicInfo?.year_name || "Not available"}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Academic Term</Label>
                          <Input
                            value={currentAcademicInfo?.term_name || "Not available"}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={eNotesForm.subject_id}
                          onValueChange={(value) => setENotesForm({ ...eNotesForm, subject_id: value, teacher_id: "" })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.subject_name} ({subject.subject_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="teacher">Teacher</Label>
                        <Select
                          value={eNotesForm.teacher_id}
                          onValueChange={(value) => setENotesForm({ ...eNotesForm, teacher_id: value })}
                          disabled={!eNotesForm.subject_id}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={eNotesForm.subject_id ? "Select teacher" : "Select subject first"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getTeachersForSubject(eNotesForm.subject_id).map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.first_name} {teacher.surname} - {teacher.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {eNotesForm.subject_id && getTeachersForSubject(eNotesForm.subject_id).length === 0 && (
                          <p className="text-sm text-amber-600 mt-1">No teachers assigned to this subject</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="class">Class</Label>
                        <Select
                          value={eNotesForm.class_id}
                          onValueChange={(value) => setENotesForm({ ...eNotesForm, class_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.class_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="week">Week Number</Label>
                        <Select
                          value={eNotesForm.week_number}
                          onValueChange={(value) => setENotesForm({ ...eNotesForm, week_number: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select week" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 11 }, (_, i) => i + 1).map((week) => (
                              <SelectItem key={week} value={week.toString()}>
                                Week {week}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="file">Upload File (DOCX only)</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".docx"
                          onChange={(e) => setENotesForm({ ...eNotesForm, file: e.target.files?.[0] || null })}
                        />
                      </div>
                      <Button onClick={handleENotesUpload} disabled={uploading} className="w-full">
                        {uploading ? "Uploading..." : "Upload E-Notes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Week</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eNotesUploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {getTeacherName(upload.teacher_id).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{getTeacherName(upload.teacher_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getSubjectName(upload.subject_id)}</Badge>
                        </TableCell>
                        <TableCell>{getClassName(upload.class_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Week {upload.week_number}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono">{upload.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(upload.upload_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {eNotesUploads.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No e-notes uploads</h3>
                  <p className="text-gray-600">Upload e-notes to get started</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="exams" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Exam Questions Uploads</h3>
                <Dialog open={examQuestionsDialogOpen} onOpenChange={setExamQuestionsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!currentAcademicInfo}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Exam Questions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Upload Exam Questions</DialogTitle>
                      <DialogDescription>Upload exam questions for the current academic period</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Academic Year</Label>
                          <Input
                            value={currentAcademicInfo?.year_name || "Not available"}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Academic Term</Label>
                          <Input
                            value={currentAcademicInfo?.term_name || "Not available"}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={examQuestionsForm.subject_id}
                          onValueChange={(value) =>
                            setExamQuestionsForm({ ...examQuestionsForm, subject_id: value, teacher_id: "" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.subject_name} ({subject.subject_code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="teacher">Teacher</Label>
                        <Select
                          value={examQuestionsForm.teacher_id}
                          onValueChange={(value) => setExamQuestionsForm({ ...examQuestionsForm, teacher_id: value })}
                          disabled={!examQuestionsForm.subject_id}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={examQuestionsForm.subject_id ? "Select teacher" : "Select subject first"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {getTeachersForSubject(examQuestionsForm.subject_id).map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.first_name} {teacher.surname} - {teacher.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {examQuestionsForm.subject_id &&
                          getTeachersForSubject(examQuestionsForm.subject_id).length === 0 && (
                            <p className="text-sm text-amber-600 mt-1">No teachers assigned to this subject</p>
                          )}
                      </div>
                      <div>
                        <Label htmlFor="class">Class</Label>
                        <Select
                          value={examQuestionsForm.class_id}
                          onValueChange={(value) => setExamQuestionsForm({ ...examQuestionsForm, class_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.class_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="file">Upload File (DOCX only)</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".docx"
                          onChange={(e) =>
                            setExamQuestionsForm({ ...examQuestionsForm, file: e.target.files?.[0] || null })
                          }
                        />
                      </div>
                      <Button onClick={handleExamQuestionsUpload} disabled={uploading} className="w-full">
                        {uploading ? "Uploading..." : "Upload Exam Questions"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examQuestionsUploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-green-600 text-white text-xs">
                                {getTeacherName(upload.teacher_id).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{getTeacherName(upload.teacher_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getSubjectName(upload.subject_id)}</Badge>
                        </TableCell>
                        <TableCell>{getClassName(upload.class_id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono">{upload.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(upload.upload_date)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {examQuestionsUploads.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exam questions uploads</h3>
                  <p className="text-gray-600">Upload exam questions to get started</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <h3 className="text-lg font-medium">Teacher Submission Summary</h3>

              {uploadSummary.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Exam Questions</TableHead>
                        <TableHead>E-Notes Progress</TableHead>
                        <TableHead>Completion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadSummary.map((teacher) => (
                        <TableRow key={teacher.teacher_id}>
                          <TableCell className="font-medium">{teacher.teacher_name}</TableCell>
                          <TableCell>{teacher.teacher_email}</TableCell>
                          <TableCell>{teacher.department}</TableCell>
                          <TableCell>
                            {teacher.exam_questions_submitted ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Submitted
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{teacher.e_notes_weeks_submitted}/11 weeks</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${teacher.e_notes_completion_percentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                teacher.e_notes_completion_percentage === 100
                                  ? "default"
                                  : teacher.e_notes_completion_percentage > 0
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {teacher.e_notes_completion_percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No summary data</h3>
                  <p className="text-gray-600">Teacher submission data will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
