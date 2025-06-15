"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type UploadEntry = {
  type: string
  name: string
  subject: string
  file: File | null
}

export function UploadsSection() {
  // Dynamic data from settings
  const [sessions, setSessions] = useState<string[]>([])
  const [terms, setTerms] = useState<{ id: number; name: string; status: string }[]>([])
  const [weeks] = useState(Array.from({ length: 12 }, (_, i) => i + 1))
  const [classes, setClasses] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [teachersUploaded, setTeachersUploaded] = useState<UploadEntry[]>([])

  const [selectedSession, setSelectedSession] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedWeek, setSelectedWeek] = useState<number | "">("")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [showExamForm, setShowExamForm] = useState(false)
  const [showEnoteForm, setShowEnoteForm] = useState(false)
  const [examFile, setExamFile] = useState<File | null>(null)
  const [enotesFile, setEnotesFile] = useState<File | null>(null)

  const userRole: "teacher" | "admin" = "teacher"
  const [deadlines, setDeadlines] = useState({
    exam: new Date("2025-06-21"),
    enotes: new Date("2025-06-25"),
  })

  // Fetch data from settings on component mount
  useEffect(() => {
    // Fetch academic calendar data
    const academicData = localStorage.getItem("academic_settings")
    if (academicData) {
      const parsed = JSON.parse(academicData)
      setSessions([parsed.academicYear?.year || "2024-2025"])
      setTerms(
        parsed.terms || [
          { id: 1, name: "First Term", status: "completed" },
          { id: 2, name: "Second Term", status: "active" },
          { id: 3, name: "Third Term", status: "upcoming" },
        ],
      )
    } else {
      // Default fallback data
      setSessions(["2024-2025"])
      setTerms([
        { id: 1, name: "First Term", status: "completed" },
        { id: 2, name: "Second Term", status: "active" },
        { id: 3, name: "Third Term", status: "upcoming" },
      ])
    }

    // Fetch class categories data
    const classData = localStorage.getItem("class_categories")
    if (classData) {
      const parsed = JSON.parse(classData)
      const allClasses = parsed.flatMap((category: any) => category.classes)
      setClasses(allClasses)
    } else {
      // Default fallback data from settings
      setClasses(["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"])
    }

    // Fetch subjects based on selected class
    const subjectsData = localStorage.getItem("subjects_by_class")
    if (subjectsData) {
      const parsed = JSON.parse(subjectsData)
      if (selectedClass && parsed[selectedClass]) {
        setSubjects(parsed[selectedClass])
      }
    } else {
      // Default subjects
      setSubjects(["Mathematics", "English", "Basic Science", "Physics", "Chemistry", "Biology"])
    }

    // Fetch global deadlines
    const globalDeadlines = localStorage.getItem("global_deadlines")
    if (globalDeadlines) {
      const parsed = JSON.parse(globalDeadlines)
      setDeadlines({
        exam: new Date(parsed.exam),
        enotes: new Date(parsed.enotes),
      })
    }
  }, [selectedClass])

  // Update subjects when class changes
  useEffect(() => {
    if (selectedClass) {
      const subjectsData = localStorage.getItem("subjects_by_class")
      if (subjectsData) {
        const parsed = JSON.parse(subjectsData)
        setSubjects(parsed[selectedClass] || [])
      } else {
        // Default subjects mapping
        const defaultSubjects: { [key: string]: string[] } = {
          "JSS 1": [
            "Mathematics",
            "English",
            "Basic Science",
            "Social Studies",
            "Civic Education",
            "Computer Studies",
            "French",
            "Creative Arts",
            "Physical Education",
          ],
          "JSS 2": [
            "Mathematics",
            "English",
            "Basic Science",
            "Social Studies",
            "Civic Education",
            "Computer Studies",
            "French",
            "Creative Arts",
            "Physical Education",
          ],
          "JSS 3": [
            "Mathematics",
            "English",
            "Basic Science",
            "Social Studies",
            "Civic Education",
            "Computer Studies",
            "French",
            "Creative Arts",
            "Physical Education",
          ],
          "SSS 1": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
          "SSS 2": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
          "SSS 3": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"],
        }
        setSubjects(defaultSubjects[selectedClass] || [])
      }
    }
  }, [selectedClass])

  const isDeadlinePassed = (type: "exam" | "enotes") => {
    const now = new Date()
    return userRole === "teacher" && deadlines[type].getTime() < now.getTime()
  }

  const countdownMessage = (type: "exam" | "enotes") => {
    const now = new Date()
    const deadline = deadlines[type]
    const diff = deadline.getTime() - now.getTime()
    if (diff <= 0) return "Deadline passed"
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    return `${days}d ${hours}h ${minutes}m left`
  }

  const handleUpload = (type: "exam" | "enotes") => {
    const name = userRole === "teacher" ? "Mr. John" : "Admin"
    const newUpload = {
      type,
      name,
      subject: selectedSubject,
      file: type === "exam" ? examFile : enotesFile,
    }

    setTeachersUploaded((prev) => [...prev, newUpload])

    // Update global upload status for communications
    const currentStatus = JSON.parse(localStorage.getItem("upload_status") || "{}")
    const uploadKey = `${type}Uploads`
    const updatedStatus = {
      ...currentStatus,
      [uploadKey]: (currentStatus[uploadKey] || []).map((upload: any) =>
        upload.teacher === name && upload.subject === selectedSubject
          ? { ...upload, status: "submitted", date: new Date().toISOString().split("T")[0] }
          : upload,
      ),
    }
    localStorage.setItem("upload_status", JSON.stringify(updatedStatus))

    alert(`${type} uploaded successfully by ${name}!`)

    // Reset form
    if (type === "exam") {
      setShowExamForm(false)
      setExamFile(null)
    } else {
      setShowEnoteForm(false)
      setEnotesFile(null)
    }
  }

  // Dynamic submission summary logic
  const teacherSubjectMap = subjects.map((subject) => ({
    subject,
    teacher: `Teacher of ${subject}`, // This could be fetched from teacher assignments
  }))

  const submittedKeys = teachersUploaded.filter((u) => u.type === "exam").map((u) => `${u.name}-${u.subject}`)

  const dynamicSummary = teacherSubjectMap.map((row) => ({
    ...row,
    submitted: submittedKeys.includes(`${row.teacher}-${row.subject}`),
  }))

  // Get current term info
  const currentTerm = terms.find((term) => term.status === "active")
  const currentSession = sessions[0] || "2024-2025"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uploads</h1>
          <p className="text-gray-600">Upload exam questions and e-notes</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Academic Period</div>
          <div className="font-semibold text-blue-600">{currentSession}</div>
          <div className="text-sm text-green-600">{currentTerm?.name || "No Active Term"}</div>
        </div>
      </div>

      {deadlines.exam.getTime() !== new Date("2025-06-21").getTime() && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            📢 Deadline Update: New deadlines have been set by administration
          </p>
        </div>
      )}

      <Tabs defaultValue="exam" className="w-full">
        <TabsList>
          <TabsTrigger value="exam">Exam Questions</TabsTrigger>
          <TabsTrigger value="enotes">E-Notes</TabsTrigger>
        </TabsList>

        {/* ------------------- EXAM UPLOAD ------------------- */}
        <TabsContent value="exam" className="mt-4 space-y-4">
          <Button onClick={() => setShowExamForm(true)} disabled={isDeadlinePassed("exam")}>
            Upload Exam Questions
          </Button>
          <p className="text-xs text-gray-600">
            Deadline: {deadlines.exam.toDateString()} ({countdownMessage("exam")})
          </p>

          {showExamForm && (
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
              <div className="space-y-2">
                <Label>Session</Label>
                <Select onValueChange={setSelectedSession} value={selectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Term</Label>
                <Select onValueChange={setSelectedTerm} value={selectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id.toString()} value={t.name.toLowerCase().replace(" ", "-")}>
                        <div className="flex items-center justify-between w-full">
                          <span>{t.name}</span>
                          {t.status === "active" && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Class</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Subject</Label>
                <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClass ? "Select subject" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedClass && (
                  <p className="text-xs text-amber-600">💡 Select a class to see available subjects</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Upload DOCX File</Label>
                <Input type="file" accept=".docx" onChange={(e) => setExamFile(e.target.files?.[0] || null)} />
                <Button onClick={() => handleUpload("exam")} className="mt-4" disabled={!selectedSubject || !examFile}>
                  Submit Exam Upload
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold text-md mb-2">
              Uploaded Exams for: {selectedTerm || currentTerm?.name || "Term"} [{selectedSession || currentSession}]
            </h3>
            <ul className="text-sm text-muted-foreground list-disc ml-6">
              {teachersUploaded
                .filter((t) => t.type === "exam")
                .map((u, i) => (
                  <li key={i}>
                    <strong>{u.name}</strong> — {u.subject} —{" "}
                    {u.file && (
                      <a href={URL.createObjectURL(u.file)} download={u.file.name} className="text-blue-600 underline">
                        {u.file.name}
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          {/* 🧾 SUBMISSION SUMMARY TABLE */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Submission Summary for {selectedClass || "Class"} - {selectedTerm || currentTerm?.name || "Term"} [
              {selectedSession || currentSession}]
            </h2>
            {selectedClass ? (
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 border">Subject</th>
                    <th className="text-left px-4 py-2 border">Teacher</th>
                    <th className="text-left px-4 py-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicSummary.map((row, i) => (
                    <tr key={i} className={row.submitted ? "bg-green-50" : "bg-red-50"}>
                      <td className="px-4 py-2 border">{row.subject}</td>
                      <td className="px-4 py-2 border">{row.teacher}</td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${row.submitted ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                        >
                          {row.submitted ? "Submitted" : "Not Submitted"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 bg-gray-50 border rounded-lg text-center">
                <p className="text-gray-600">Select a class to view submission summary</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ------------------- ENOTES UPLOAD ------------------- */}
        <TabsContent value="enotes" className="mt-4 space-y-4">
          <Button onClick={() => setShowEnoteForm(true)} disabled={isDeadlinePassed("enotes")}>
            Upload E-Notes
          </Button>
          <p className="text-xs text-gray-600">
            Deadline: {deadlines.enotes.toDateString()} ({countdownMessage("enotes")})
          </p>

          {showEnoteForm && (
            <div className="grid grid-cols-2 gap-4 border p-4 mt-4 rounded-md">
              <div className="space-y-2">
                <Label>Session</Label>
                <Select onValueChange={setSelectedSession} value={selectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Term</Label>
                <Select onValueChange={setSelectedTerm} value={selectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.id.toString()} value={t.name.toLowerCase().replace(" ", "-")}>
                        <div className="flex items-center justify-between w-full">
                          <span>{t.name}</span>
                          {t.status === "active" && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Week</Label>
                <Select onValueChange={(val) => setSelectedWeek(Number(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map((w) => (
                      <SelectItem key={w} value={String(w)}>{`Week ${w}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Class</Label>
                <Select onValueChange={setSelectedClass} value={selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Subject</Label>
                <Select onValueChange={setSelectedSubject} value={selectedSubject} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClass ? "Select subject" : "Select class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Topic</Label>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter lesson topic"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload PDF File</Label>
                <Input type="file" accept=".pdf" onChange={(e) => setEnotesFile(e.target.files?.[0] || null)} />
                <Button
                  onClick={() => handleUpload("enotes")}
                  className="mt-4"
                  disabled={!selectedSubject || !enotesFile || !topic}
                >
                  Submit E-Note Upload
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
