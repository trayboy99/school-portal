"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, BookOpen, Eye, Filter, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Upload {
  id: number
  teacher_id: number
  upload_type: string
  subject_name: string
  class_name: string
  academic_year: string
  term: string
  week_ids: number[] | null
  file_name: string
  file_url: string
  file_size: number
  uploaded_at: string
  status: string
  teacher_name?: string
}

interface AcademicWeek {
  id: number
  week_number: number
  week_name: string
  description: string
}

export function NotesSection() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedWeek, setSelectedWeek] = useState("all")
  const [notes, setNotes] = useState<Upload[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [academicWeeks, setAcademicWeeks] = useState<AcademicWeek[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.userType === "student") {
      loadNotesData()
    }
  }, [user])

  const loadNotesData = async () => {
    if (!user || user.userType !== "student") return

    try {
      setIsLoading(true)
      setError(null)

      const studentClass = user.class || user.current_class

      console.log("Loading notes for student:", user.first_name, "Class:", studentClass)

      // First load academic weeks to have them available for processing
      const { data: weeksData, error: weeksError } = await supabase
        .from("academic_weeks")
        .select("*")
        .order("week_number")

      if (weeksError) {
        console.error("Error loading weeks:", weeksError)
      } else {
        console.log("Academic weeks data:", weeksData)
        setAcademicWeeks(weeksData || [])
      }

      // Load e-notes from uploads table
      const { data: uploadsData, error: uploadsError } = await supabase
        .from("uploads")
        .select(`
          *,
          teachers!inner(
            first_name,
            middle_name,
            surname,
            email,
            phone
          )
        `)
        .eq("upload_type", "e_notes")
        .eq("class_name", studentClass)
        .eq("status", "active")
        .order("uploaded_at", { ascending: false })

      if (uploadsError) {
        console.error("Error loading uploads:", uploadsError)
        throw uploadsError
      }

      console.log("Raw uploads data:", uploadsData)

      // Process uploads data and add teacher names
      const processedNotes =
        uploadsData?.map((upload) => ({
          ...upload,
          teacher_name: upload.teachers
            ? `${upload.teachers.first_name} ${upload.teachers.middle_name ? upload.teachers.middle_name + " " : ""}${upload.teachers.surname}`
            : "Unknown Teacher",
        })) || []

      console.log("Processed notes:", processedNotes)
      setNotes(processedNotes)

      // Get unique subjects from the uploads data (subjects that actually have e-notes)
      const uniqueSubjects = [...new Set(processedNotes.map((note) => note.subject_name))].sort()
      console.log("Available subjects with e-notes:", uniqueSubjects)
      setAvailableSubjects(uniqueSubjects)
    } catch (error) {
      console.error("Error in loadNotesData:", error)
      setError("Failed to load notes. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getWeekNames = (weekIds: number[] | null) => {
    console.log("Getting week names for weekIds:", weekIds)
    console.log("Available academic weeks:", academicWeeks)

    if (!weekIds || !Array.isArray(weekIds) || weekIds.length === 0) {
      return "No weeks specified"
    }

    const weekNames = weekIds
      .map((weekId) => {
        const week = academicWeeks.find((w) => w.id === weekId)
        console.log(`Looking for week ID ${weekId}, found:`, week)
        return week ? week.week_name : `Week ${weekId}`
      })
      .filter(Boolean) // Remove any null/undefined values

    return weekNames.length > 0 ? weekNames.join(", ") : "Unknown weeks"
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.teacher_name && note.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSubject = selectedSubject === "all" || note.subject_name === selectedSubject

    const matchesWeek =
      selectedWeek === "all" || (note.week_ids && note.week_ids.includes(Number.parseInt(selectedWeek)))

    return matchesSearch && matchesSubject && matchesWeek
  })

  const stats = {
    totalNotes: notes.length,
    newNotes: notes.filter((note) => {
      const uploadDate = new Date(note.uploaded_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate > weekAgo
    }).length,
    subjects: availableSubjects.length,
    totalSize: notes.reduce((sum, note) => sum + note.file_size / (1024 * 1024), 0).toFixed(1),
  }

  if (!user || user.userType !== "student") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in as a student to access this section.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading e-notes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Error Loading Notes</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={loadNotesData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">E-Notes</h1>
        <p className="text-gray-600">
          Access your study materials and class notes for {user.class || user.current_class}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalNotes}</div>
            <div className="text-sm text-gray-500">Total Notes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Badge className="h-8 w-8 mx-auto text-green-600 mb-2 rounded-full flex items-center justify-center">
              {stats.newNotes}
            </Badge>
            <div className="text-2xl font-bold text-gray-900">{stats.newNotes}</div>
            <div className="text-sm text-gray-500">New This Week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.subjects}</div>
            <div className="text-sm text-gray-500">Subjects</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalSize} MB</div>
            <div className="text-sm text-gray-500">Total Size</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Week</label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {academicWeeks.map((week) => (
                    <SelectItem key={week.id} value={week.id.toString()}>
                      {week.week_name} - {week.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      {notes.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <p>Total notes loaded: {notes.length}</p>
              <p>Academic weeks loaded: {academicWeeks.length}</p>
              <p>Sample note week_ids: {JSON.stringify(notes[0]?.week_ids)}</p>
              <p>Sample week names: {getWeekNames(notes[0]?.week_ids)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center">
                    {note.file_name}
                    {(() => {
                      const uploadDate = new Date(note.uploaded_at)
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return uploadDate > weekAgo ? (
                        <Badge variant="default" className="ml-2 text-xs">
                          New
                        </Badge>
                      ) : null
                    })()}
                  </CardTitle>
                  <CardDescription className="mt-1">{note.subject_name}</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Teacher:</span>
                  <span className="font-medium text-right">{note.teacher_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weeks:</span>
                  <Badge variant="outline" className="text-xs">
                    {getWeekNames(note.week_ids)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Upload Date:</span>
                  <span>{new Date(note.uploaded_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">File Size:</span>
                  <span>{(note.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Year:</span>
                  <span>{note.academic_year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Term:</span>
                  <span>{note.term}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0 ? "No e-notes available" : "No notes found"}
            </h3>
            <p className="text-gray-600">
              {notes.length === 0
                ? `No e-notes have been uploaded for ${user.class || user.current_class} yet.`
                : "Try adjusting your search or filter criteria"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
