"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, MessageSquare, Send, Users, Search, Eye, Megaphone, UserCheck, GraduationCap, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Message {
  id: number
  sender_name: string
  subject: string
  content: string
  priority: "low" | "normal" | "high" | "urgent"
  category: string
  student_name?: string
  class_name?: string
  status: string
  created_at: string
  recipient_count?: number
  delivery_status?: string
}

interface Recipient {
  id: number
  name: string
  email: string
  type: "parent" | "teacher" | "student"
  class?: string
  subject?: string
}

export function CommunicationsSection() {
  const [activeTab, setActiveTab] = useState("overview")
  const [messages, setMessages] = useState<Message[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([])
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [messageForm, setMessageForm] = useState({
    subject: "",
    content: "",
    priority: "normal" as const,
    category: "announcement",
    recipientType: "all_parents" as "all_parents" | "all_teachers" | "all_students" | "specific_class" | "custom",
    specificClass: "",
    messageType: "individual" as "individual" | "announcement",
  })
  const [classes, setClasses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Message templates for admin
  const adminTemplates = {
    school_announcement: {
      subject: "Important School Announcement",
      content:
        "Dear School Community,\n\n[Your announcement here]\n\nThank you for your attention.\n\nBest regards,\nSchool Administration",
    },
    parent_meeting: {
      subject: "Parent-Teacher Meeting Notification",
      content:
        "Dear Parents/Guardians,\n\nWe would like to invite you to our upcoming Parent-Teacher Meeting.\n\nDate: [Date]\nTime: [Time]\nVenue: [Venue]\n\nPlease confirm your attendance.\n\nBest regards,\nSchool Administration",
    },
    holiday_notice: {
      subject: "Holiday Schedule Notification",
      content:
        "Dear School Community,\n\nPlease note the following holiday schedule:\n\n[Holiday details]\n\nClasses will resume on [Date].\n\nBest regards,\nSchool Administration",
    },
    exam_schedule: {
      subject: "Examination Schedule Released",
      content:
        "Dear Students and Parents,\n\nThe examination schedule has been released:\n\n[Exam details]\n\nPlease prepare accordingly.\n\nBest regards,\nSchool Administration",
    },
    fee_reminder: {
      subject: "School Fee Payment Reminder",
      content:
        "Dear Parents/Guardians,\n\nThis is a reminder regarding school fee payment:\n\n[Payment details]\n\nDue date: [Date]\n\nPlease contact the accounts office for any queries.\n\nBest regards,\nSchool Administration",
    },
    emergency_notice: {
      subject: "URGENT: Emergency Notice",
      content:
        "Dear School Community,\n\nURGENT NOTICE:\n\n[Emergency details]\n\nPlease take immediate action as required.\n\nBest regards,\nSchool Administration",
    },
  }

  useEffect(() => {
    fetchMessages()
    fetchRecipients()
    fetchClasses()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          message_recipients(count)
        `)
        .eq("sender_type", "admin")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      // Mock data for development
      setMessages([
        {
          id: 1,
          sender_name: "School Administration",
          subject: "Parent-Teacher Meeting Scheduled",
          content: "Dear Parents, we have scheduled a parent-teacher meeting...",
          priority: "high",
          category: "announcement",
          status: "sent",
          created_at: new Date().toISOString(),
          recipient_count: 45,
        },
        {
          id: 2,
          sender_name: "School Administration",
          subject: "Holiday Schedule Update",
          content: "Please note the updated holiday schedule...",
          priority: "normal",
          category: "announcement",
          status: "sent",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          recipient_count: 120,
        },
      ])
    }
  }

  const fetchRecipients = async () => {
    try {
      // Fetch parents
      const { data: parents, error: parentsError } = await supabase
        .from("parent_accounts")
        .select("id, first_name, last_name, email")

      // Fetch teachers
      const { data: teachers, error: teachersError } = await supabase
        .from("teachers")
        .select("id, first_name, middle_name, surname, email")

      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, surname, email, class")

      if (parentsError || teachersError || studentsError) {
        throw new Error("Error fetching recipients")
      }

      const allRecipients: Recipient[] = [
        ...(parents || []).map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          type: "parent" as const,
        })),
        ...(teachers || []).map((t) => ({
          id: t.id,
          name: `${t.first_name} ${t.middle_name || ""} ${t.surname}`.trim(),
          email: t.email,
          type: "teacher" as const,
        })),
        ...(students || []).map((s) => ({
          id: s.id,
          name: `${s.first_name} ${s.surname}`,
          email: s.email,
          type: "student" as const,
          class: s.class,
        })),
      ]

      setRecipients(allRecipients)
    } catch (error) {
      console.error("Error fetching recipients:", error)
      // Mock data
      setRecipients([
        { id: 1, name: "Ngozi Okoro", email: "ngozi.okoro@parent.com", type: "parent" },
        { id: 2, name: "Mary Grace Johnson", email: "mary.johnson@school.com", type: "teacher" },
        { id: 3, name: "Chioma Okoro", email: "chioma.okoro@student.com", type: "student", class: "JSS 1A" },
      ])
    }
  }

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from("classes").select("name").order("name")

      if (error) throw error
      setClasses(data?.map((c) => c.name) || [])
    } catch (error) {
      console.error("Error fetching classes:", error)
      setClasses(["JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "JSS 3B"])
    }
  }

  const getRecipientsByType = () => {
    switch (messageForm.recipientType) {
      case "all_parents":
        return recipients.filter((r) => r.type === "parent")
      case "all_teachers":
        return recipients.filter((r) => r.type === "teacher")
      case "all_students":
        return recipients.filter((r) => r.type === "student")
      case "specific_class":
        return recipients.filter((r) => r.type === "student" && r.class === messageForm.specificClass)
      case "custom":
        return recipients.filter((r) => selectedRecipients.includes(r.id))
      default:
        return []
    }
  }

  const handleSendMessage = async () => {
    if (!messageForm.subject || !messageForm.content) {
      alert("Please fill in subject and content")
      return
    }

    setLoading(true)
    const targetRecipients = getRecipientsByType()

    if (targetRecipients.length === 0) {
      alert("Please select recipients")
      setLoading(false)
      return
    }

    try {
      // Insert message
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: 1, // Admin ID
          sender_type: "admin",
          sender_name: "School Administration",
          subject: messageForm.subject,
          content: messageForm.content,
          priority: messageForm.priority,
          category: messageForm.category,
          status: "sent",
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Insert recipients
      const recipientInserts = targetRecipients.map((recipient) => ({
        message_id: messageData.id,
        recipient_id: recipient.id,
        recipient_type: recipient.type,
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        delivery_status: "delivered",
      }))

      const { error: recipientsError } = await supabase.from("message_recipients").insert(recipientInserts)

      if (recipientsError) throw recipientsError

      // Add messages to recipients' inboxes
      const inboxInserts = targetRecipients.map((recipient) => ({
        user_id: recipient.id,
        user_type: recipient.type,
        message_id: messageData.id,
        folder: "inbox",
        is_read: false,
      }))

      const { error: recipientInboxError } = await supabase.from("user_message_inbox").insert(inboxInserts)

      if (recipientInboxError) {
        console.error("Error adding to recipient inboxes:", recipientInboxError)
      }

      // Add to admin's sent folder
      const { error: inboxError } = await supabase.from("user_message_inbox").insert({
        user_id: 1, // Admin ID
        user_type: "admin",
        message_id: messageData.id,
        folder: "sent",
      })

      if (inboxError) throw inboxError

      alert(`Message sent successfully to ${targetRecipients.length} recipients!`)
      setIsComposeOpen(false)
      setMessageForm({
        subject: "",
        content: "",
        priority: "normal",
        category: "announcement",
        recipientType: "all_parents",
        specificClass: "",
        messageType: "individual",
      })
      setSelectedRecipients([])
      fetchMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error sending message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = (templateKey: keyof typeof adminTemplates) => {
    const template = adminTemplates[templateKey]
    setMessageForm((prev) => ({
      ...prev,
      subject: template.subject,
      content: template.content,
    }))
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-600">Send messages and announcements to parents, teachers, and students</p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>Send messages or announcements to parents, teachers, and students</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Message Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="messageType">Message Type</Label>
                  <Select
                    value={messageForm.messageType}
                    onValueChange={(value: "individual" | "announcement") =>
                      setMessageForm((prev) => ({ ...prev, messageType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Message</SelectItem>
                      <SelectItem value="announcement">School Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={messageForm.priority}
                    onValueChange={(value: "low" | "normal" | "high" | "urgent") =>
                      setMessageForm((prev) => ({ ...prev, priority: value }))
                    }
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
              </div>

              {/* Recipients */}
              <div>
                <Label htmlFor="recipients">Send To</Label>
                <Select
                  value={messageForm.recipientType}
                  onValueChange={(value: any) => setMessageForm((prev) => ({ ...prev, recipientType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_parents">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        All Parents
                      </div>
                    </SelectItem>
                    <SelectItem value="all_teachers">
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        All Teachers
                      </div>
                    </SelectItem>
                    <SelectItem value="all_students">
                      <div className="flex items-center">
                        <UserCheck className="mr-2 h-4 w-4" />
                        All Students
                      </div>
                    </SelectItem>
                    <SelectItem value="specific_class">Specific Class</SelectItem>
                    <SelectItem value="custom">Custom Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Class Selection */}
              {messageForm.recipientType === "specific_class" && (
                <div>
                  <Label htmlFor="class">Select Class</Label>
                  <Select
                    value={messageForm.specificClass}
                    onValueChange={(value) => setMessageForm((prev) => ({ ...prev, specificClass: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
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
              )}

              {/* Custom Recipients */}
              {messageForm.recipientType === "custom" && (
                <div>
                  <Label>Select Recipients</Label>
                  <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="mb-2">
                      <Input
                        placeholder="Search recipients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredRecipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`recipient-${recipient.id}`}
                          checked={selectedRecipients.includes(recipient.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecipients((prev) => [...prev, recipient.id])
                            } else {
                              setSelectedRecipients((prev) => prev.filter((id) => id !== recipient.id))
                            }
                          }}
                        />
                        <label htmlFor={`recipient-${recipient.id}`} className="text-sm">
                          {recipient.name} ({recipient.type}) - {recipient.email}
                          {recipient.class && ` - ${recipient.class}`}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{selectedRecipients.length} recipients selected</p>
                </div>
              )}

              {/* Templates */}
              <div>
                <Label>Message Templates</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(adminTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(key as keyof typeof adminTemplates)}
                      className="text-left justify-start"
                    >
                      {template.subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={messageForm.content}
                  onChange={(e) => setMessageForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your message here..."
                  rows={8}
                />
              </div>

              {/* Recipient Count */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Users className="inline mr-1 h-4 w-4" />
                  This message will be sent to {getRecipientsByType().length} recipients
                </p>
              </div>

              {/* Send Button */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.filter((m) => m.category === "announcement").length}</div>
            <p className="text-xs text-muted-foreground">Active notices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients.length}</div>
            <p className="text-xs text-muted-foreground">Total contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sent">Sent Messages</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>Latest messages and announcements sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{message.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{message.content.substring(0, 100)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={message.priority === "urgent" ? "destructive" : "default"}>
                          {message.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                        {message.recipient_count && (
                          <span className="text-xs text-gray-500">• {message.recipient_count} recipients</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{message.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sent Messages</CardTitle>
              <CardDescription>All messages sent by administration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{message.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">{message.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={message.priority === "urgent" ? "destructive" : "default"}>
                          {message.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                        {message.recipient_count && (
                          <span className="text-xs text-gray-500">• {message.recipient_count} recipients</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{message.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Parents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipients.filter((r) => r.type === "parent").length}</div>
                <p className="text-sm text-gray-600">Registered parents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipients.filter((r) => r.type === "teacher").length}</div>
                <p className="text-sm text-gray-600">Active teachers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipients.filter((r) => r.type === "student").length}</div>
                <p className="text-sm text-gray-600">Enrolled students</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Recipients</CardTitle>
              <CardDescription>Complete list of message recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredRecipients.map((recipient) => (
                  <div key={recipient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{recipient.name}</h4>
                      <p className="text-sm text-gray-600">{recipient.email}</p>
                      {recipient.class && <p className="text-xs text-gray-500">Class: {recipient.class}</p>}
                    </div>
                    <Badge variant="outline">{recipient.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
