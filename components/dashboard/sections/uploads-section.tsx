"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, FileText, Download } from "lucide-react"
import { supabase } from "@/lib/supabase"

type UploadEntry = {
  id: number
  upload_type: string
  teacher_id: number
  teacher_name?: string
  subject_name: string
  class_name: string
  file_name: string
  file_url?: string
  uploaded_at: string
  academic_year: string
  term: string
  week?: number
}

type Deadline = {
  id: number
  deadline_type: string
  deadline_date: string
  academic_year: string
  term: string
  is_active: boolean
}

export function UploadsSection() {
  const [uploads, setUploads] = useState<UploadEntry[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [loading, setLoading] = useState(true)
  const [showDeadlineForm, setShowDeadlineForm] = useState(false)
  const [activeTab, setActiveTab] = useState("exam")
  const [deadlineForm, setDeadlineForm] = useState({
    deadline_type: "",
    deadline_date: "",
    academic_year: "2024-2025",
    term: "Second Term",
  })
  const [examSubmissionSummary, setExamSubmissionSummary] = useState<any[]>([])
  const [enotesSubmissionSummary, setEnotesSubmissionSummary] = useState<any[]>([])

  const handleDownload = async (upload: UploadEntry) => {
    try {
      if (upload.file_url) {
        const link = document.createElement("a")
        link.href = upload.file_url
        link.download = upload.file_name
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      const { data, error } = await supabase.storage
        .from("uploads")
        .download(`${upload.upload_type}/${upload.file_name}`)

      if (error) {
        console.error("Download error:", error)
        alert(`Error downloading file: ${error.message}`)
        return
      }

      const url = URL.createObjectURL(data)
      const link = document.createElement("a")
      link.href = url
      link.download = upload.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert(`Error downloading file: ${upload.file_name}`)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedClass && uploads.length > 0) {
      loadSubmissionSummary("exam_questions")
      loadSubmissionSummary("e_notes")
    }
  }, [selectedClass, uploads])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load uploads with teacher names joined
      const { data: uploadsData, error: uploadsError } = await supabase
        .from("uploads")
        .select(`
          *,
          teachers!inner(first_name, middle_name, surname)
        `)
        .order("uploaded_at", { ascending: false })

      if (uploadsError) {
        console.error("Error loading uploads:", uploadsError)
      } else {
        // Transform the data to include teacher_name
        const transformedUploads =
          uploadsData?.map((upload) => ({
            ...upload,
            teacher_name:
              `${upload.teachers.first_name} ${upload.teachers.middle_name || ""} ${upload.teachers.surname}`
                .replace(/\s+/g, " ")
                .trim(),
          })) || []

        console.log("Loaded uploads with teacher names:", transformedUploads)
        setUploads(transformedUploads)
      }

      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from("admin_deadlines")
        .select("*")
        .eq("is_active", true)
        .order("deadline_date", { ascending: true })

      if (deadlinesError) {
        console.error("Error loading deadlines:", deadlinesError)
      } else {
        setDeadlines(deadlinesData || [])
      }

      const { data: classesData, error: classesError } = await supabase.from("classes").select("name").order("name")

      if (classesError) {
        console.error("Error loading classes:", classesError)
      } else {
        setClasses(classesData?.map((c) => c.name) || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDeadline = async () => {
    if (!deadlineForm.deadline_type || !deadlineForm.deadline_date) {
      alert("Please fill all required fields")
      return
    }

    try {
      await supabase
        .from("admin_deadlines")
        .update({ is_active: false })
        .eq("deadline_type", deadlineForm.deadline_type)
        .eq("academic_year", deadlineForm.academic_year)
        .eq("term", deadlineForm.term)

      const { error } = await supabase.from("admin_deadlines").insert({
        deadline_type: deadlineForm.deadline_type,
        deadline_date: deadlineForm.deadline_date,
        academic_year: deadlineForm.academic_year,
        term: deadlineForm.term,
        created_by: 1,
        is_active: true,
      })

      if (error) {
        console.error("Error setting deadline:", error)
        alert("Error setting deadline: " + error.message)
      } else {
        alert("Deadline set successfully!")
        setShowDeadlineForm(false)
        setDeadlineForm({
          deadline_type: "",
          deadline_date: "",
          academic_year: "2024-2025",
          term: "Second Term",
        })
        loadData()
      }
    } catch (error) {
      console.error("Error setting deadline:", error)
      alert("Error setting deadline")
    }
  }

  const getDeadlineStatus = (deadline: Deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline.deadline_date)
    const isExpired = deadlineDate < now

    if (isExpired) {
      return { status: "Deadline passed", color: "text-red-600", bgColor: "bg-red-50" }
    }

    const diff = deadlineDate.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)

    return {
      status: `${days}d ${hours}h left`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    }
  }

  const getUploadStats = (uploadType: string) => {
    const typeUploads = uploads.filter((u) => u.upload_type === uploadType)
    const totalUploads = typeUploads.length
    const classesWithUploads = new Set(typeUploads.map((u) => u.class_name)).size

    return { totalUploads, classesWithUploads }
  }

  const loadSubmissionSummary = async (uploadType: string) => {
    if (!selectedClass) {
      if (uploadType === "exam_questions") {
        setExamSubmissionSummary([])
      } else {
        setEnotesSubmissionSummary([])
      }
      return
    }

    try {
      console.log("Loading submission summary for:", { selectedClass, uploadType })

      // Get all subjects for the selected class with their teachers (including teacher IDs)
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          name, 
          teacher_name,
          teachers!inner(id, first_name, middle_name, surname)
        `)
        .eq("target_class", selectedClass)
        .order("name")

      if (subjectsError) {
        console.error("Error loading subjects:", subjectsError)
        return
      }

      console.log("Subjects for class:", subjectsData)

      // Get uploads for this class and upload type
      const classUploads = uploads.filter((u) => {
        return u.upload_type === uploadType && u.class_name === selectedClass
      })

      console.log("Uploads for class and type:", classUploads)

      // Create summary by combining all subjects with upload status
      const summary =
        subjectsData?.map((subject) => {
          // Find if this teacher/subject has uploaded using teacher_id
          const upload = classUploads.find(
            (u) => u.teacher_id === subject.teachers.id && u.subject_name === subject.name,
          )

          const teacherFullName =
            `${subject.teachers.first_name} ${subject.teachers.middle_name || ""} ${subject.teachers.surname}`
              .replace(/\s+/g, " ")
              .trim()

          return {
            subject: subject.name,
            teacher: teacherFullName,
            submitted: !!upload,
            uploadDate: upload?.uploaded_at || null,
            fileName: upload?.file_name || null,
            upload: upload || null,
          }
        }) || []

      console.log("Final summary for", uploadType, ":", summary)

      if (uploadType === "exam_questions") {
        setExamSubmissionSummary(summary)
      } else {
        setEnotesSubmissionSummary(summary)
      }
    } catch (error) {
      console.error("Error in loadSubmissionSummary:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const examDeadline = deadlines.find((d) => d.deadline_type === "exam_questions")
  const enotesDeadline = deadlines.find((d) => d.deadline_type === "e_notes")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uploads</h1>
          <p className="text-gray-600">Upload exam questions and e-notes</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Academic Period</div>
          <div className="font-semibold text-blue-600">2024-2025</div>
          <div className="text-sm text-green-600">Second Term</div>
        </div>
      </div>

      {/* Deadline Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Deadline Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Exam Questions Deadline */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Exam Questions</h3>
                {examDeadline && (
                  <Badge variant="outline" className={getDeadlineStatus(examDeadline).color}>
                    {getDeadlineStatus(examDeadline).status}
                  </Badge>
                )}
              </div>
              {examDeadline ? (
                <p className="text-sm text-gray-600">
                  Deadline: {new Date(examDeadline.deadline_date).toLocaleDateString()} at{" "}
                  {new Date(examDeadline.deadline_date).toLocaleTimeString()}
                </p>
              ) : (
                <p className="text-sm text-red-600">No deadline set</p>
              )}
            </div>

            {/* E-Notes Deadline */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">E-Notes</h3>
                {enotesDeadline && (
                  <Badge variant="outline" className={getDeadlineStatus(enotesDeadline).color}>
                    {getDeadlineStatus(enotesDeadline).status}
                  </Badge>
                )}
              </div>
              {enotesDeadline ? (
                <p className="text-sm text-gray-600">
                  Deadline: {new Date(enotesDeadline.deadline_date).toLocaleDateString()} at{" "}
                  {new Date(enotesDeadline.deadline_date).toLocaleTimeString()}
                </p>
              ) : (
                <p className="text-sm text-red-600">No deadline set</p>
              )}
            </div>
          </div>

          <Button onClick={() => setShowDeadlineForm(!showDeadlineForm)}>
            {showDeadlineForm ? "Cancel" : "Set New Deadline"}
          </Button>

          {showDeadlineForm && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Deadline Type</Label>
                  <Select
                    value={deadlineForm.deadline_type}
                    onValueChange={(value) => setDeadlineForm({ ...deadlineForm, deadline_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam_questions">Exam Questions</SelectItem>
                      <SelectItem value="e_notes">E-Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Deadline Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={deadlineForm.deadline_date}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Academic Year</Label>
                  <Input
                    value={deadlineForm.academic_year}
                    onChange={(e) => setDeadlineForm({ ...deadlineForm, academic_year: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Term</Label>
                  <Select
                    value={deadlineForm.term}
                    onValueChange={(value) => setDeadlineForm({ ...deadlineForm, term: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Term">First Term</SelectItem>
                      <SelectItem value="Second Term">Second Term</SelectItem>
                      <SelectItem value="Third Term">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSetDeadline} className="mt-4">
                Set Deadline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="exam">Exam Questions</TabsTrigger>
          <TabsTrigger value="enotes">E-Notes</TabsTrigger>
        </TabsList>

        {/* Exam Questions Tab */}
        <TabsContent value="exam" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button>Upload Exam Questions</Button>
            {examDeadline && (
              <div
                className={`px-3 py-1 rounded-full text-sm ${getDeadlineStatus(examDeadline).bgColor} ${getDeadlineStatus(examDeadline).color}`}
              >
                Deadline: {new Date(examDeadline.deadline_date).toDateString()} (
                {getDeadlineStatus(examDeadline).status})
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Uploads</p>
                    <p className="text-2xl font-bold">{getUploadStats("exam_questions").totalUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Classes Covered</p>
                    <p className="text-2xl font-bold">{getUploadStats("exam_questions").classesWithUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline Status</p>
                    <p className="text-lg font-bold">
                      {examDeadline ? getDeadlineStatus(examDeadline).status : "No deadline"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submission Summary */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Submission Summary for Class - Second Term [2024-2025]
            </h2>

            <div className="mb-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a class to view submission summary" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2 border">Subject</th>
                      <th className="text-left px-4 py-2 border">Teacher</th>
                      <th className="text-left px-4 py-2 border">File Name</th>
                      <th className="text-left px-4 py-2 border">Status</th>
                      <th className="text-left px-4 py-2 border">Upload Date</th>
                      <th className="text-left px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examSubmissionSummary.length > 0 ? (
                      examSubmissionSummary.map((row, i) => (
                        <tr key={i} className={row.submitted ? "bg-green-50" : "bg-yellow-50"}>
                          <td className="px-4 py-2 border">{row.subject}</td>
                          <td className="px-4 py-2 border font-medium">{row.teacher}</td>
                          <td className="px-4 py-2 border text-sm">{row.fileName || "-"}</td>
                          <td className="px-4 py-2 border">
                            <Badge variant={row.submitted ? "default" : "secondary"}>
                              {row.submitted ? "Submitted" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 border">
                            {row.uploadDate ? new Date(row.uploadDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-2 border">
                            {row.submitted && row.upload ? (
                              <Button size="sm" variant="outline" onClick={() => handleDownload(row.upload)}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No file</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          {selectedClass ? "Loading submission data..." : "No uploads found for " + selectedClass}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 border rounded-lg">
                Select a class to view submission summary
              </div>
            )}
          </div>
        </TabsContent>

        {/* E-Notes Tab */}
        <TabsContent value="enotes" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <Button>Upload E-Notes</Button>
            {enotesDeadline && (
              <div
                className={`px-3 py-1 rounded-full text-sm ${getDeadlineStatus(enotesDeadline).bgColor} ${getDeadlineStatus(enotesDeadline).color}`}
              >
                Deadline: {new Date(enotesDeadline.deadline_date).toDateString()} (
                {getDeadlineStatus(enotesDeadline).status})
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Uploads</p>
                    <p className="text-2xl font-bold">{getUploadStats("e_notes").totalUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Classes Covered</p>
                    <p className="text-2xl font-bold">{getUploadStats("e_notes").classesWithUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Deadline Status</p>
                    <p className="text-lg font-bold">
                      {enotesDeadline ? getDeadlineStatus(enotesDeadline).status : "No deadline"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* E-Notes Submission Summary */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              E-Notes Submission Summary for Class - Second Term [2024-2025]
            </h2>

            <div className="mb-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a class to view submission summary" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClass ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2 border">Subject</th>
                      <th className="text-left px-4 py-2 border">Teacher</th>
                      <th className="text-left px-4 py-2 border">File Name</th>
                      <th className="text-left px-4 py-2 border">Week</th>
                      <th className="text-left px-4 py-2 border">Status</th>
                      <th className="text-left px-4 py-2 border">Upload Date</th>
                      <th className="text-left px-4 py-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enotesSubmissionSummary.length > 0 ? (
                      enotesSubmissionSummary.map((row, i) => (
                        <tr key={i} className={row.submitted ? "bg-green-50" : "bg-yellow-50"}>
                          <td className="px-4 py-2 border">{row.subject}</td>
                          <td className="px-4 py-2 border font-medium">{row.teacher}</td>
                          <td className="px-4 py-2 border text-sm">{row.fileName || "-"}</td>
                          <td className="px-4 py-2 border">{row.upload?.week || "-"}</td>
                          <td className="px-4 py-2 border">
                            <Badge variant={row.submitted ? "default" : "secondary"}>
                              {row.submitted ? "Submitted" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 border">
                            {row.uploadDate ? new Date(row.uploadDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-2 border">
                            {row.submitted && row.upload ? (
                              <Button size="sm" variant="outline" onClick={() => handleDownload(row.upload)}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">No file</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          {selectedClass ? "Loading submission data..." : "No e-notes found for " + selectedClass}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 border rounded-lg">
                Select a class to view submission summary
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
