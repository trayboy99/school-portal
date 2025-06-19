"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileText, Download, Trash2, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"

interface UploadItem {
  id: number
  teacher_id: number
  title: string
  description: string
  file_type: string
  file_name: string
  file_url: string
  subject: string
  class: string
  deadline: string
  upload_date: string
  status: string
}

export function UploadsSection() {
  const { teacher } = useTeacherAuth()
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileType, setSelectedFileType] = useState("exam_questions")
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    subject: "",
    class: "",
    deadline: "",
  })

  useEffect(() => {
    if (teacher) {
      loadUploads()
    }
  }, [teacher])

  const loadUploads = async () => {
    if (!teacher) return

    try {
      setIsLoading(true)
      console.log("Loading uploads for teacher:", teacher.id)

      const { data: uploadsData, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("upload_date", { ascending: false })

      if (error) {
        console.error("Error loading uploads:", error)
        return
      }

      console.log("Uploads data:", uploadsData)
      setUploads(uploadsData || [])
    } catch (error) {
      console.error("Error in loadUploads:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !teacher) return

    // Check if deadline has passed
    const deadline = new Date(uploadForm.deadline)
    const now = new Date()

    if (deadline < now) {
      alert("Cannot upload: The deadline has passed!")
      return
    }

    try {
      setIsUploading(true)

      // For demo purposes, we'll simulate file upload
      // In a real app, you'd upload to Supabase Storage or another service
      const mockFileUrl = `https://example.com/uploads/${file.name}`

      const { error } = await supabase.from("uploads").insert({
        teacher_id: teacher.id,
        title: uploadForm.title,
        description: uploadForm.description,
        file_type: selectedFileType,
        file_name: file.name,
        file_url: mockFileUrl,
        subject: uploadForm.subject,
        class: uploadForm.class,
        deadline: uploadForm.deadline,
        status: "uploaded",
      })

      if (error) throw error

      // Reset form and reload uploads
      setUploadForm({
        title: "",
        description: "",
        subject: "",
        class: "",
        deadline: "",
      })

      await loadUploads()
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
      const { error } = await supabase.from("uploads").delete().eq("id", uploadId)

      if (error) throw error

      await loadUploads()
      alert("Upload deleted successfully!")
    } catch (error) {
      console.error("Error deleting upload:", error)
      alert("Error deleting upload. Please try again.")
    }
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) {
      return { status: "expired", color: "text-red-600", icon: AlertCircle }
    } else if (diffHours < 24) {
      return { status: "urgent", color: "text-orange-600", icon: Clock }
    } else {
      return { status: "active", color: "text-green-600", icon: CheckCircle }
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
          <p className="text-gray-600">Upload exam questions and e-notes with deadline management</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Upload className="h-4 w-4 mr-2" />
              New Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Upload exam questions or e-notes with deadline management</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* File Type Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">File Type:</label>
                <select
                  value={selectedFileType}
                  onChange={(e) => setSelectedFileType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="exam_questions">Exam Questions</option>
                  <option value="e_notes">E-Notes</option>
                  <option value="assignments">Assignments</option>
                  <option value="materials">Teaching Materials</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Title:</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter title for your upload"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description:</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>

              {/* Subject and Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Subject:</label>
                  <Input
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Class:</label>
                  <Input
                    value={uploadForm.class}
                    onChange={(e) => setUploadForm({ ...uploadForm, class: e.target.value })}
                    placeholder="Class"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Deadline:</label>
                <Input
                  type="datetime-local"
                  value={uploadForm.deadline}
                  onChange={(e) => setUploadForm({ ...uploadForm, deadline: e.target.value })}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select File:</label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading || !uploadForm.title || !uploadForm.deadline}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT</p>
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

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                <p className="text-2xl font-bold text-gray-900">{uploads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Exam Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uploads.filter((u) => u.file_type === "exam_questions").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">E-Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uploads.filter((u) => u.file_type === "e_notes").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uploads.filter((u) => isDeadlinePassed(u.deadline)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploads List */}
      <div className="grid grid-cols-1 gap-4">
        {uploads.map((upload) => {
          const deadlineStatus = getDeadlineStatus(upload.deadline)
          const StatusIcon = deadlineStatus.icon

          return (
            <Card key={upload.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{upload.title}</h3>
                      <p className="text-sm text-gray-600">
                        {upload.subject} • {upload.class} • {upload.file_name}
                      </p>
                      {upload.description && <p className="text-xs text-gray-500 mt-1">{upload.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className={`h-4 w-4 ${deadlineStatus.color}`} />
                        <span className={`text-sm ${deadlineStatus.color}`}>
                          {deadlineStatus.status === "expired"
                            ? "Expired"
                            : deadlineStatus.status === "urgent"
                              ? "Due Soon"
                              : "Active"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Deadline: {new Date(upload.deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <Badge
                      variant={upload.file_type === "exam_questions" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {upload.file_type.replace("_", " ").toUpperCase()}
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
          )
        })}
      </div>

      {/* No Uploads */}
      {uploads.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading your first exam questions or e-notes</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First File
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
