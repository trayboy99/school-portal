"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageSquare, Bell, Send, Users, CalendarClock, BookOpenCheck, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function CommunicationsSection() {
  const isAdmin = true
  const [announcements] = useState([
    { title: "Parent-Teacher Meeting", date: "Dec 12", recipients: "All Parents", status: "Active" },
    { title: "Holiday Schedule", date: "Dec 10", recipients: "All Students", status: "Active" },
    { title: "Exam Timetable Released", date: "Dec 8", recipients: "Grade 10-12", status: "Sent" },
  ])

  const [uploadStatus, setUploadStatus] = useState({
    examUploads: [
      { teacher: "Mr. James", subject: "Mathematics", status: "submitted", date: "2025-06-10" },
      { teacher: "Mrs. Grace", subject: "Basic Science", status: "pending", date: null },
      { teacher: "Mr. John", subject: "English", status: "submitted", date: "2025-06-09" },
    ],
    enotesUploads: [
      { teacher: "Mr. James", subject: "Mathematics", status: "submitted", date: "2025-06-11" },
      { teacher: "Mrs. Grace", subject: "Basic Science", status: "pending", date: null },
      { teacher: "Mr. John", subject: "English", status: "pending", date: null },
    ],
  })

  const [deadlines, setDeadlines] = useState({
    exam: new Date("2025-06-21"),
    enotes: new Date("2025-06-25"),
    examSetBy: "",
    enotesSetBy: "",
  })
  const [history, setHistory] = useState([])
  const [reminderWindow, setReminderWindow] = useState(5)
  const [showModal, setShowModal] = useState(false)
  const [selectedType, setSelectedType] = useState("exam")
  const [inputDate, setInputDate] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem("school_deadlines")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDeadlines({
        exam: new Date(parsed.exam),
        enotes: new Date(parsed.enotes),
        examSetBy: parsed.examSetBy || "",
        enotesSetBy: parsed.enotesSetBy || "",
      })
    }

    const logs = localStorage.getItem("deadlineHistory")
    if (logs) {
      setHistory(JSON.parse(logs))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("school_deadlines", JSON.stringify(deadlines))
  }, [deadlines])

  const calculateCountdown = (deadline) => {
    const diff = deadline.getTime() - new Date().getTime()
    if (diff <= 0) return "Deadline passed"
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    return `${days}d ${hours}h ${minutes}m left`
  }

  const daysLeft = (deadline) => Math.floor((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const openDeadlineModal = (type) => {
    if (!isAdmin) return
    setSelectedType(type)
    setInputDate("")
    setShowModal(true)
  }

  const saveDeadline = () => {
    if (!inputDate) return
    const newDate = new Date(inputDate)
    const updated = {
      ...deadlines,
      [selectedType]: newDate,
      [`${selectedType}SetBy`]: "Admin User",
    }
    const log = {
      type: selectedType,
      date: inputDate,
      by: "Admin User",
      timestamp: new Date().toLocaleString(),
    }
    const updatedHistory = [log, ...history]
    setHistory(updatedHistory)
    localStorage.setItem("deadlineHistory", JSON.stringify(updatedHistory))
    setDeadlines(updated)

    // Store deadline globally for uploads section
    localStorage.setItem("global_deadlines", JSON.stringify(updated))

    setShowModal(false)
    alert(
      `${selectedType === "exam" ? "Exam" : "E-Notes"} deadline updated to ${inputDate}. Notification sent to all teachers.`,
    )
  }

  return (
    <Tabs defaultValue="announcements" className="space-y-6">
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set {selectedType === "exam" ? "Exam" : "E-Notes"} Deadline</DialogTitle>
          </DialogHeader>
          <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} />
          <Button onClick={saveDeadline} className="mt-2">
            Save Deadline
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Manage announcements and deadlines</p>
        </div>
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="uploads">Upload Status</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="announcements">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Announcements</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Active notices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Messages delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Active contacts</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Latest School Communications</CardTitle>
            <CardDescription>These messages have been sent recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{a.title}</h3>
                    <p className="text-sm text-gray-600">
                      {a.date} • {a.recipients}
                    </p>
                  </div>
                  <Badge variant={a.status === "Active" ? "default" : "secondary"}>{a.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="deadlines">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["exam", "enotes"].map((type) => (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {type === "exam" ? "Exam Questions Upload" : "E-Notes Upload"}
                </CardTitle>
                {type === "exam" ? (
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">Deadline: {deadlines[type].toDateString()}</div>
                <p className="text-sm text-muted-foreground">{calculateCountdown(deadlines[type])}</p>
                <p className="text-xs text-muted-foreground">Set by: {deadlines[`${type}SetBy`] || "-"}</p>
                {isAdmin && (
                  <Button onClick={() => openDeadlineModal(type)} className="mt-2">
                    Set {type === "exam" ? "Exam" : "E-Notes"} Deadline
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Reminders</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Show before (days):</span>
            <input
              type="number"
              className="w-16 h-8 border rounded px-1"
              value={reminderWindow}
              min={1}
              max={30}
              onChange={(e) => setReminderWindow(Number.parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Deadline History</h3>

          <ul className="text-sm text-muted-foreground space-y-1">
            {history.slice(0, 5).map((log, i) => (
              <li key={i}>
                {log.timestamp} — {log.by} updated {log.type} deadline to {log.date}
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="uploads">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Uploads Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Exam Questions Upload Status
                </CardTitle>
                <CardDescription>
                  Deadline: {deadlines.exam.toDateString()} ({calculateCountdown(deadlines.exam)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadStatus.examUploads.map((upload, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{upload.teacher}</p>
                        <p className="text-sm text-gray-600">{upload.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={upload.status === "submitted" ? "default" : "destructive"}>
                          {upload.status === "submitted" ? "Submitted" : "Pending"}
                        </Badge>
                        {upload.date && <p className="text-xs text-gray-500 mt-1">{upload.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Progress:</strong> {uploadStatus.examUploads.filter((u) => u.status === "submitted").length}{" "}
                    of {uploadStatus.examUploads.length} submitted
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* E-Notes Uploads Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5" />
                  E-Notes Upload Status
                </CardTitle>
                <CardDescription>
                  Deadline: {deadlines.enotes.toDateString()} ({calculateCountdown(deadlines.enotes)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadStatus.enotesUploads.map((upload, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{upload.teacher}</p>
                        <p className="text-sm text-gray-600">{upload.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={upload.status === "submitted" ? "default" : "destructive"}>
                          {upload.status === "submitted" ? "Submitted" : "Pending"}
                        </Badge>
                        {upload.date && <p className="text-xs text-gray-500 mt-1">{upload.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Progress:</strong>{" "}
                    {uploadStatus.enotesUploads.filter((u) => u.status === "submitted").length} of{" "}
                    {uploadStatus.enotesUploads.length} submitted
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Upload Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadStatus.examUploads.filter((u) => u.status === "pending").length > 0 && (
                  <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <p className="text-sm font-medium text-orange-800">
                      {uploadStatus.examUploads.filter((u) => u.status === "pending").length} teachers haven't submitted
                      exam questions
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Deadline: {calculateCountdown(deadlines.exam)}</p>
                  </div>
                )}
                {uploadStatus.enotesUploads.filter((u) => u.status === "pending").length > 0 && (
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm font-medium text-blue-800">
                      {uploadStatus.enotesUploads.filter((u) => u.status === "pending").length} teachers haven't
                      submitted e-notes
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Deadline: {calculateCountdown(deadlines.enotes)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
