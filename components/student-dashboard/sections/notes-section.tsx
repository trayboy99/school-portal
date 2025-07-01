"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Eye, Search, BookOpen, Calendar, User } from "lucide-react"
import { useStudentAuth } from "@/contexts/student-auth-context"
import { supabase } from "@/lib/supabase"

interface Note {
  id: number
  title: string
  description: string
  subject_name: string
  class_name: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  teacher_name: string
  upload_date: string
  week_name?: string
  week_description?: string
}

export default function NotesSection() {
  const { student } = useStudentAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")

  useEffect(() => {
    if (student) {
      loadNotes()
    }
  }, [student])

  const loadNotes = async () => {
    if (!student) return

    try {
      setLoading(true)

      // Load notes/uploads for student's class
      const { data: notesData, error } = await supabase
        .from("uploads")
        .select(`
          id,
          title,
          description,
          subject,
          class_name,
          file_name,
          file_url,
          file_type,
          file_size,
          teacher_name,
          upload_date,
          week_ids,
          academic_weeks (
            week_name,
            description
          )
        `)
        .eq("class_name", student.class)
        .eq("status", "approved")
        .order("upload_date", { ascending: false })

      if (error) throw error

      // Transform the data
      const transformedNotes = (notesData || []).map((note) => ({
        id: note.id,
        title: note.title,
        description: note.description || "",
        subject_name: note.subject,
        class_name: note.class_name,
        file_name: note.file_name,
        file_url: note.file_url,
        file_type: note.file_type,
        file_size: note.file_size,
        teacher_name: note.teacher_name,
        upload_date: note.upload_date,
        week_name: note.academic_weeks?.week_name,
        week_description: note.academic_weeks?.description,
      }))

      setNotes(transformedNotes)
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word") || fileType.includes("doc")) return "📝"
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📊"
    if (fileType.includes("image")) return "🖼️"
    return "📁"
  }

  const handleDownload = (note: Note) => {
    // In a real app, this would handle the actual file download
    console.log("Downloading:", note.file_name)
    // For now, just show an alert
    alert(`Downloading ${note.file_name}...`)
  }

  const handlePreview = (note: Note) => {
    // In a real app, this would open a preview modal or new tab
    console.log("Previewing:", note.file_name)
    alert(`Opening preview for ${note.file_name}...`)
  }

  // Get unique subjects for filtering
  const uniqueSubjects = [...new Set(notes.map((note) => note.subject_name))].filter(Boolean)

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.file_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject = selectedSubject === "all" || note.subject_name === selectedSubject

    return matchesSearch && matchesSubject
  })

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your notes.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
          <p className="text-gray-600">Access your class notes and study materials</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">{notes.length} notes available</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notes by title, subject, teacher, or filename..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Notes</p>
                <p className="text-2xl font-bold">{notes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Subjects</p>
                <p className="text-2xl font-bold">{uniqueSubjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Downloads</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">This Week</p>
                <p className="text-2xl font-bold">
                  {
                    notes.filter((note) => {
                      const noteDate = new Date(note.upload_date)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return noteDate > weekAgo
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getFileIcon(note.file_type)}</span>
                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {note.subject_name}
                    </Badge>
                  </div>

                  {note.description && <p className="text-sm text-gray-600 mb-2">{note.description}</p>}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {note.teacher_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(note.upload_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {note.file_name} ({formatFileSize(note.file_size)})
                    </span>
                  </div>

                  {note.week_name && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Week:</strong> {note.week_name}
                        {note.week_description && <span className="block mt-1">{note.week_description}</span>}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(note)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>

                  <Button size="sm" onClick={() => handleDownload(note)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredNotes.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSubject !== "all"
                ? "Try adjusting your search criteria"
                : "No study notes available at the moment"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
