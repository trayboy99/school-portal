"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Send,
  Users,
  User,
  Search,
  Filter,
  Plus,
  Reply,
  Forward,
  Archive,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
import { useTeacherAuth } from "@/contexts/teacher-auth-context"
import { supabase } from "@/lib/supabase"

interface Message {
  id: number
  from: string
  from_type: "parent" | "admin" | "staff" | "student"
  to: string
  subject: string
  content: string
  preview: string
  time: string
  unread: boolean
  priority: "low" | "normal" | "high" | "urgent"
  student_id?: number
  student_name?: string
  class_name?: string
  category: string
  delivery_status?: string
  attachments?: string[]
}

interface Student {
  id: number
  first_name: string
  surname: string
  class: string
  parent_email?: string
  parent_phone?: string
}

const messageTemplates = {
  academic_concern: {
    subject: "Academic Performance Discussion - {student_name}",
    content:
      "Dear Parent/Guardian,\n\nI hope this message finds you well. I would like to discuss {student_name}'s recent academic performance in {subject}.\n\n{specific_details}\n\nI believe with your support at home, we can help {student_name} improve. Please let me know when would be a convenient time for us to discuss this further.\n\nBest regards,\n{teacher_name}",
  },
  excellent_work: {
    subject: "Excellent Work - {student_name}",
    content:
      "Dear Parent/Guardian,\n\nI wanted to share some wonderful news about {student_name}'s performance in {subject}.\n\n{specific_achievement}\n\nPlease congratulate {student_name} on this achievement. It's a pleasure having such a dedicated student in my class.\n\nBest regards,\n{teacher_name}",
  },
  behavioral_concern: {
    subject: "Behavioral Discussion - {student_name}",
    content:
      "Dear Parent/Guardian,\n\nI hope you are doing well. I would like to discuss some behavioral concerns regarding {student_name} in my {subject} class.\n\n{specific_behavior}\n\nI believe that with our combined effort, we can help {student_name} develop better classroom habits. Could we schedule a meeting to discuss this?\n\nBest regards,\n{teacher_name}",
  },
  assignment_missing: {
    subject: "Missing Assignment - {student_name}",
    content:
      "Dear Parent/Guardian,\n\n{student_name} has not submitted the following assignment(s):\n\n{assignment_details}\n\nDue date: {due_date}\n\nPlease ensure {student_name} completes and submits the work. If there are any challenges, please don't hesitate to contact me.\n\nBest regards,\n{teacher_name}",
  },
  meeting_request: {
    subject: "Parent-Teacher Meeting Request - {student_name}",
    content:
      "Dear Parent/Guardian,\n\nI would like to schedule a meeting to discuss {student_name}'s progress in {subject}.\n\nProposed times:\n- {time_option_1}\n- {time_option_2}\n- {time_option_3}\n\nPlease let me know which time works best for you, or suggest an alternative.\n\nBest regards,\n{teacher_name}",
  },
}

export function CommunicationsSection() {
  const { teacher } = useTeacherAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    content: "",
    priority: "normal" as const,
    category: "parent_communication",
  })
  const [sentMessages, setSentMessages] = useState<Message[]>([])

  useEffect(() => {
    if (teacher) {
      fetchMessages()
      fetchSentMessages()
      fetchStudents()
    }
  }, [teacher])

  const fetchMessages = async () => {
    if (!teacher) return

    setIsLoading(true)
    console.log("=== FETCHING MESSAGES FOR TEACHER ===")
    console.log("Teacher ID:", teacher.id)
    console.log("Teacher Name:", teacher.full_name)

    try {
      // Primary method: Fetch from user_message_inbox
      const { data: inboxData, error: inboxError } = await supabase
        .from("user_message_inbox")
        .select(`
          id,
          is_read,
          read_at,
          created_at,
          messages (
            id,
            sender_name,
            sender_type,
            subject,
            content,
            priority,
            category,
            student_name,
            class_name,
            created_at
          )
        `)
        .eq("user_id", teacher.id)
        .eq("user_type", "teacher")
        .eq("folder", "inbox")
        .order("created_at", { ascending: false })

      console.log("=== INBOX QUERY RESULT ===")
      console.log("Data:", inboxData)
      console.log("Error:", inboxError)

      if (inboxError) {
        console.error("Inbox query error:", inboxError)
        throw inboxError
      }

      // Format the messages
      const formattedMessages: Message[] = (inboxData || [])
        .filter((item) => item.messages) // Only include items with valid message data
        .map((item: any) => ({
          id: item.messages.id,
          from: item.messages.sender_name,
          from_type: item.messages.sender_type,
          to: teacher.full_name,
          subject: item.messages.subject,
          content: item.messages.content,
          preview: item.messages.content.substring(0, 100) + "...",
          time: formatTime(item.messages.created_at),
          unread: !item.is_read,
          priority: item.messages.priority || "normal",
          student_name: item.messages.student_name,
          class_name: item.messages.class_name,
          category: item.messages.category || "general",
        }))

      console.log("=== FORMATTED MESSAGES ===")
      console.log("Count:", formattedMessages.length)
      console.log("Messages:", formattedMessages)

      setMessages(formattedMessages)

      // If no messages found, let's debug what's available
      if (formattedMessages.length === 0) {
        console.log("=== NO MESSAGES FOUND - DEBUGGING ===")

        // Check if there are any admin messages at all
        const { data: adminMessages, error: adminError } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_type", "admin")

        console.log("Admin messages in database:", adminMessages)
        console.log("Admin messages error:", adminError)

        // Check if this teacher has any inbox entries
        const { data: teacherInbox, error: teacherInboxError } = await supabase
          .from("user_message_inbox")
          .select("*")
          .eq("user_id", teacher.id)
          .eq("user_type", "teacher")

        console.log("Teacher inbox entries:", teacherInbox)
        console.log("Teacher inbox error:", teacherInboxError)

        // Check message recipients for this teacher
        const { data: recipientData, error: recipientError } = await supabase
          .from("message_recipients")
          .select("*")
          .eq("recipient_id", teacher.id)
          .eq("recipient_type", "teacher")

        console.log("Teacher as recipient:", recipientData)
        console.log("Recipient error:", recipientError)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSentMessages = async () => {
    if (!teacher) return

    try {
      // Fetch messages sent by this teacher
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          subject,
          content,
          priority,
          category,
          student_name,
          class_name,
          created_at,
          message_recipients (
            recipient_email,
            recipient_name,
            delivery_status,
            delivered_at,
            read_at
          )
        `)
        .eq("sender_id", teacher.id)
        .eq("sender_type", "teacher")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching sent messages:", error)
        return
      }

      const formattedSentMessages =
        data?.map((message: any) => ({
          id: message.id,
          from: teacher.full_name,
          from_type: "staff" as const,
          to: message.message_recipients[0]?.recipient_email || "",
          subject: message.subject,
          content: message.content,
          preview: message.content.substring(0, 100) + "...",
          time: formatTime(message.created_at),
          unread: false,
          priority: message.priority,
          student_name: message.student_name,
          class_name: message.class_name,
          category: message.category,
          delivery_status: message.message_recipients[0]?.delivery_status || "sent",
        })) || []

      setSentMessages(formattedSentMessages)
    } catch (error) {
      console.error("Error in fetchSentMessages:", error)
    }
  }

  const fetchStudents = async () => {
    if (!teacher) return

    try {
      console.log("Fetching students for teacher ID:", teacher.id)

      // First, get classes assigned to this teacher
      const { data: teacherClasses, error: classError } = await supabase
        .from("classes")
        .select("name")
        .eq("teacher_id", teacher.id)

      if (classError) {
        console.error("Error fetching teacher classes:", classError)
        return
      }

      if (!teacherClasses || teacherClasses.length === 0) {
        console.log("No classes assigned to this teacher")
        setStudents([])
        return
      }

      const classNames = teacherClasses.map((cls) => cls.name)
      console.log("Teacher assigned to classes:", classNames)

      // Now get students from those classes
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, middle_name, surname, class, parent_email, parent_phone, parent_name")
        .in("class", classNames)
        .order("first_name")

      if (studentsError) {
        console.error("Error fetching students:", studentsError)
        return
      }

      const formattedStudents =
        studentsData?.map((student) => ({
          id: student.id,
          first_name: student.first_name,
          surname: student.surname,
          class: student.class,
          parent_email:
            student.parent_email || `${student.first_name.toLowerCase()}.${student.surname.toLowerCase()}@parent.com`,
          parent_phone: student.parent_phone || "+234 xxx xxx xxxx",
        })) || []

      console.log("Fetched students:", formattedStudents)
      setStudents(formattedStudents)
    } catch (error) {
      console.error("Error in fetchStudents:", error)

      // Fallback with mock data for development
      const mockStudents = [
        {
          id: 1,
          first_name: "Chioma",
          surname: "Okoro",
          class: "JSS 2A",
          parent_email: "ngozi.okoro@parent.com",
          parent_phone: "+234 801 234 5678",
        },
        {
          id: 2,
          first_name: "Mike",
          surname: "Johnson",
          class: "JSS 2A",
          parent_email: "sarah.johnson@parent.com",
          parent_phone: "+234 802 345 6789",
        },
      ]

      setStudents(mockStudents)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const handleSendMessage = async () => {
    if (!teacher || !composeForm.to || !composeForm.subject || !composeForm.content) {
      alert("Please fill in all required fields")
      return
    }

    try {
      // 1. Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: teacher.id,
          sender_type: "teacher",
          sender_name: teacher.full_name,
          subject: composeForm.subject,
          content: composeForm.content,
          priority: composeForm.priority,
          category: composeForm.category,
          student_id: selectedStudent?.id,
          student_name: selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.surname}` : null,
          class_name: selectedStudent?.class,
        })
        .select()
        .single()

      if (messageError) {
        console.error("Error creating message:", messageError)
        alert("Failed to send message. Please try again.")
        return
      }

      // 2. Add recipient
      const { error: recipientError } = await supabase.from("message_recipients").insert({
        message_id: messageData.id,
        recipient_email: composeForm.to,
        recipient_type: "parent",
        recipient_name: selectedStudent
          ? `Parent of ${selectedStudent.first_name} ${selectedStudent.surname}`
          : "Parent",
        delivery_status: "delivered",
      })

      if (recipientError) {
        console.error("Error adding recipient:", recipientError)
      }

      // 3. Add to teacher's sent folder
      const { error: inboxError } = await supabase.from("user_message_inbox").insert({
        user_id: teacher.id,
        user_type: "teacher",
        message_id: messageData.id,
        folder: "sent",
        is_read: true,
      })

      if (inboxError) {
        console.error("Error adding to sent folder:", inboxError)
      }

      // 4. Check if parent has an account and add to their inbox
      const { data: parentAccount } = await supabase
        .from("parent_accounts")
        .select("id")
        .eq("email", composeForm.to)
        .single()

      if (parentAccount) {
        await supabase.from("user_message_inbox").insert({
          user_id: parentAccount.id,
          user_type: "parent",
          message_id: messageData.id,
          folder: "inbox",
          is_read: false,
        })
      }

      // Refresh sent messages
      fetchSentMessages()

      alert("Message sent successfully!")

      // Reset form and close dialog
      setComposeForm({
        to: "",
        subject: "",
        content: "",
        priority: "normal",
        category: "parent_communication",
      })
      setSelectedStudent(null)
      setSelectedTemplate("")
      setIsComposeOpen(false)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <Users className="h-4 w-4 text-blue-600" />
      case "parent":
        return <User className="h-4 w-4 text-green-600" />
      case "staff":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "student":
        return <User className="h-4 w-4 text-orange-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "normal":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "low":
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || message.from_type === filterType

    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter((m) => m.unread).length
  const parentMessages = messages.filter((m) => m.from_type === "parent")
  const adminMessages = messages.filter((m) => m.from_type === "admin")

  const handleTemplateSelect = (templateKey: string) => {
    if (!selectedStudent || !teacher) return

    const template = messageTemplates[templateKey as keyof typeof messageTemplates]
    if (!template) return

    setComposeForm({
      ...composeForm,
      to: selectedStudent.parent_email || "",
      subject: template.subject
        .replace("{student_name}", `${selectedStudent.first_name} ${selectedStudent.surname}`)
        .replace("{subject}", teacher.subjects[0] || "your subject"),
      content: template.content
        .replace(/{student_name}/g, `${selectedStudent.first_name} ${selectedStudent.surname}`)
        .replace(/{subject}/g, teacher.subjects[0] || "your subject")
        .replace(/{teacher_name}/g, teacher.full_name),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-gray-600">Communicate with parents, students, and staff</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchMessages} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>Send a message to parents, students, or staff members</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Student (for parent communication)</label>
                  <Select
                    onValueChange={(value) => {
                      const student = students.find((s) => s.id.toString() === value)
                      setSelectedStudent(student || null)
                      if (student) {
                        setComposeForm({ ...composeForm, to: student.parent_email || "" })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.first_name} {student.surname} - {student.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selection */}
                {selectedStudent && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Use Template (Optional)</label>
                    <Select
                      onValueChange={(value) => {
                        setSelectedTemplate(value)
                        handleTemplateSelect(value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic_concern">Academic Concern</SelectItem>
                        <SelectItem value="excellent_work">Excellent Work</SelectItem>
                        <SelectItem value="behavioral_concern">Behavioral Concern</SelectItem>
                        <SelectItem value="assignment_missing">Missing Assignment</SelectItem>
                        <SelectItem value="meeting_request">Meeting Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <Input
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                    placeholder="Enter subject"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select
                    value={composeForm.priority}
                    onValueChange={(value: any) => setComposeForm({ ...composeForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={composeForm.content}
                    onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                    placeholder="Type your message here..."
                    rows={8}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Parent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{parentMessages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{adminMessages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sentMessages.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="parent">Parent Messages</SelectItem>
            <SelectItem value="admin">Admin Messages</SelectItem>
            <SelectItem value="staff">Staff Messages</SelectItem>
            <SelectItem value="student">Student Messages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentMessages.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Your received messages</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        message.unread ? "bg-blue-50 border-blue-200" : ""
                      } ${selectedMessage?.id === message.id ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getMessageIcon(message.from_type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`font-medium truncate ${message.unread ? "font-bold" : ""}`}>
                                {message.from}
                              </h3>
                              {message.unread && (
                                <Badge variant="destructive" className="text-xs">
                                  New
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </Badge>
                            </div>
                            <h4 className={`text-sm truncate ${message.unread ? "font-semibold" : ""}`}>
                              {message.subject}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.preview}</p>
                            {message.student_name && (
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {message.student_name} - {message.class_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="text-xs text-gray-500">{message.time}</div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages found</p>
                  <p className="text-sm mt-2">
                    Check the browser console for debugging information or click Refresh to try again
                  </p>
                  <Button variant="outline" onClick={fetchMessages} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Messages
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>Messages you have sent</CardDescription>
            </CardHeader>
            <CardContent>
              {sentMessages.length > 0 ? (
                <div className="space-y-3">
                  {sentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Send className="h-4 w-4 text-blue-600 mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium truncate">To: {message.to}</h3>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </Badge>
                              {message.delivery_status && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {message.delivery_status}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-sm truncate font-semibold">{message.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.preview}</p>
                            {message.student_name && (
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <User className="h-3 w-3 mr-1" />
                                {message.student_name} - {message.class_name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="text-xs text-gray-500">{message.time}</div>
                          <Badge variant="secondary" className="text-xs">
                            Sent
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Send className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No sent messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Messages</CardTitle>
              <CardDescription>Messages you haven't sent yet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No draft messages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Archived Messages</CardTitle>
              <CardDescription>Messages you have archived</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Archive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No archived messages</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Detail View */}
      {selectedMessage && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {getMessageIcon(selectedMessage.from_type)}
                  <span>{selectedMessage.subject}</span>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  From: {selectedMessage.from} • {selectedMessage.time}
                  {selectedMessage.student_name && (
                    <span>
                      {" "}
                      • Student: {selectedMessage.student_name} ({selectedMessage.class_name})
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
