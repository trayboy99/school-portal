"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Users, Search, Eye, Download, Upload, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
  id: string
  reg_number: string
  status: string
  admission_date: string
  first_name: string
  middle_name: string
  surname: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  home_address: string
  class: string
  current_class: string
  section: string
  parent_name: string
  parent_phone: string
  parent_email: string
  emergency_contact: string
  emergency_phone: string
  medical_info: string
  username: string
  password_hash: string
  credential_method: string
  credentials_sent_to: string
  custom_username: string
  custom_password: string
  send_credentials_to: string
  avatar: string
  notes: string
  created_at: string
  updated_at: string
}

interface Class {
  id: string
  class_name: string
  section: string
}

// Valid status values that EXACTLY match the database constraint
const VALID_STATUS_VALUES = ["Active", "Inactive", "Suspended", "Graduated", "Transferred", "Withdrawn"]

export function StudentManagementSection() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [generatedRegNumber, setGeneratedRegNumber] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [formData, setFormData] = useState({
    reg_number: "",
    status: "Active", // Default to exactly "Active" to match constraint
    first_name: "",
    middle_name: "",
    surname: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    home_address: "",
    class: "",
    current_class: "",
    section: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_info: "",
    credential_method: "auto",
    custom_username: "",
    custom_password: "",
    send_credentials_to: "parent",
    notes: "",
    avatar: "",
  })
  const { toast } = useToast()

  const sections = ["Gold", "Silver", "Bronze"]

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/admin/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
        setFilteredStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/admin/classes")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched classes:", data)
        setClasses(data)
      } else {
        console.error("Failed to fetch classes:", response.status)
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const generateRegNumber = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const response = await fetch("/api/admin/students")

      if (response.ok) {
        const students = await response.json()
        const existingRegNumbers = students
          .map((s: Student) => s.reg_number)
          .filter((reg: string) => reg && reg.startsWith(`REG${currentYear}`))

        let nextNumber = 1
        let newRegNumber = ""

        do {
          newRegNumber = `REG${currentYear}${String(nextNumber).padStart(3, "0")}`
          nextNumber++
        } while (existingRegNumbers.includes(newRegNumber))

        setGeneratedRegNumber(newRegNumber)
        setFormData((prev) => ({ ...prev, reg_number: newRegNumber }))
      }
    } catch (error) {
      console.error("Error generating reg number:", error)
      // Fallback generation
      const currentYear = new Date().getFullYear()
      const fallbackRegNumber = `REG${currentYear}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
      setGeneratedRegNumber(fallbackRegNumber)
      setFormData((prev) => ({ ...prev, reg_number: fallbackRegNumber }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData((prev) => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.first_name || !formData.surname) {
      toast({
        title: "Error",
        description: "First name and surname are required",
        variant: "destructive",
      })
      return
    }

    if (!formData.current_class || !formData.section) {
      toast({
        title: "Error",
        description: "Class and section are required",
        variant: "destructive",
      })
      return
    }

    // Validate status - ensure it's exactly one of the valid values
    if (!VALID_STATUS_VALUES.includes(formData.status)) {
      toast({
        title: "Error",
        description: `Invalid status "${formData.status}". Must be one of: ${VALID_STATUS_VALUES.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    if (formData.credential_method === "custom" && (!formData.custom_username || !formData.custom_password)) {
      toast({
        title: "Error",
        description: "Custom username and password are required when using custom credentials",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingStudent ? `/api/admin/students/${editingStudent.id}` : "/api/admin/students"
      const method = editingStudent ? "PUT" : "POST"

      console.log("Submitting form data with status:", formData.status)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: responseData.message || `Student ${editingStudent ? "updated" : "created"} successfully`,
        })
        setDialogOpen(false)
        setEditingStudent(null)
        resetForm()
        fetchStudents()
      } else {
        console.error("Server error:", responseData)

        // Show more detailed error information
        let errorMessage = responseData.error || "Failed to save student"
        if (responseData.attempted_status && responseData.valid_statuses) {
          errorMessage += `\nAttempted status: "${responseData.attempted_status}"\nValid statuses: ${responseData.valid_statuses.join(", ")}`
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Error saving student:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save student",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)

    // Ensure the status from the database is valid, default to "Active" if not
    let validStatus = student.status || "Active"
    if (!VALID_STATUS_VALUES.includes(validStatus)) {
      validStatus = "Active"
    }

    setFormData({
      reg_number: student.reg_number || "",
      status: validStatus,
      first_name: student.first_name || "",
      middle_name: student.middle_name || "",
      surname: student.surname || "",
      email: student.email || "",
      phone: student.phone || "",
      date_of_birth: student.date_of_birth || "",
      gender: student.gender || "",
      home_address: student.home_address || "",
      class: student.class || "",
      current_class: student.current_class || "",
      section: student.section || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      parent_email: student.parent_email || "",
      emergency_contact: student.emergency_contact || "",
      emergency_phone: student.emergency_phone || "",
      medical_info: student.medical_info || "",
      credential_method: student.credential_method || "auto",
      custom_username: student.custom_username || "",
      custom_password: student.custom_password || "",
      send_credentials_to: student.send_credentials_to || "parent",
      notes: student.notes || "",
      avatar: student.avatar || "",
    })
    setAvatarPreview(student.avatar || "")
    setDialogOpen(true)
  }

  const handleView = (student: Student) => {
    setViewingStudent(student)
    setViewDialogOpen(true)
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const response = await fetch(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        })
        fetchStudents()
      } else {
        throw new Error("Failed to delete student")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      reg_number: "",
      status: "Active", // Always default to exactly "Active"
      first_name: "",
      middle_name: "",
      surname: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      home_address: "",
      class: "",
      current_class: "",
      section: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
      emergency_contact: "",
      emergency_phone: "",
      medical_info: "",
      credential_method: "auto",
      custom_username: "",
      custom_password: "",
      send_credentials_to: "parent",
      notes: "",
      avatar: "",
    })
    setGeneratedRegNumber("")
    setAvatarFile(null)
    setAvatarPreview("")
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.reg_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (classFilter !== "all") {
      filtered = filtered.filter((student) => student.current_class === classFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter)
    }

    setFilteredStudents(filtered)
  }

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open)
    if (open && !editingStudent) {
      generateRegNumber()
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchClasses()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, classFilter, statusFilter, students])

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>
  }

  // Get unique class names from classes data
  const uniqueClasses = Array.from(new Set(classes.map((c) => c.class_name)))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>Manage student accounts and information</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                    <DialogDescription>
                      {editingStudent ? "Update student information" : "Create a new student account"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Profile Picture</h3>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Student avatar" />
                          <AvatarFallback className="bg-blue-600 text-white text-lg">
                            {formData.first_name ? formData.first_name.charAt(0).toUpperCase() : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Label htmlFor="avatar">Upload Profile Picture</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="w-auto"
                            />
                            <Button type="button" variant="outline" size="sm">
                              <Camera className="h-4 w-4 mr-2" />
                              Choose
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Upload a profile picture (Max 5MB, JPG/PNG)</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middle_name">Middle Name</Label>
                          <Input
                            id="middle_name"
                            value={formData.middle_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, middle_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="surname">Surname *</Label>
                          <Input
                            id="surname"
                            value={formData.surname}
                            onChange={(e) => setFormData((prev) => ({ ...prev, surname: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+234-811-111-1111"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VALID_STATUS_VALUES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Current status: "{formData.status}" (Valid options: {VALID_STATUS_VALUES.join(", ")})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="home_address">Home Address</Label>
                        <Input
                          id="home_address"
                          value={formData.home_address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, home_address: e.target.value }))}
                          placeholder="Full home address"
                        />
                      </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="current_class">Current Class *</Label>
                          <Select
                            value={formData.current_class}
                            onValueChange={(value) => {
                              setFormData((prev) => ({ ...prev, current_class: value, class: value }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {uniqueClasses.map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {uniqueClasses.length === 0 && (
                            <p className="text-xs text-red-500">No classes found. Please create classes first.</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="section">Section *</Label>
                          <Select
                            value={formData.section}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {sections.map((section) => (
                                <SelectItem key={section} value={section}>
                                  {section}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg_number">Registration Number</Label>
                          <Input
                            id="reg_number"
                            value={formData.reg_number}
                            readOnly
                            className="bg-gray-50 cursor-not-allowed"
                            placeholder="Auto-generated"
                          />
                          <p className="text-xs text-gray-500">Registration number is auto-generated and unique</p>
                        </div>
                      </div>
                    </div>

                    {/* Parent/Guardian Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                          <Input
                            id="parent_name"
                            value={formData.parent_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, parent_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent_phone">Parent Phone</Label>
                          <Input
                            id="parent_phone"
                            value={formData.parent_phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, parent_phone: e.target.value }))}
                            placeholder="+234-812-222-2222"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent_email">Parent Email</Label>
                          <Input
                            id="parent_email"
                            type="email"
                            value={formData.parent_email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, parent_email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                          <Input
                            id="emergency_contact"
                            value={formData.emergency_contact}
                            onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                          <Input
                            id="emergency_phone"
                            value={formData.emergency_phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, emergency_phone: e.target.value }))}
                            placeholder="+234-813-333-3333"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Login Credentials Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Login Credentials</h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="credential_method">Credential Method</Label>
                          <Select
                            value={formData.credential_method}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, credential_method: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto-generate (Recommended)</SelectItem>
                              <SelectItem value="custom">Custom Credentials</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Auto-generate will create username and password automatically
                          </p>
                        </div>

                        {formData.credential_method === "custom" && (
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="custom_username">Custom Username *</Label>
                              <Input
                                id="custom_username"
                                value={formData.custom_username}
                                onChange={(e) => setFormData((prev) => ({ ...prev, custom_username: e.target.value }))}
                                placeholder="Enter custom username"
                                required={formData.credential_method === "custom"}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="custom_password">Custom Password *</Label>
                              <Input
                                id="custom_password"
                                type="password"
                                value={formData.custom_password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, custom_password: e.target.value }))}
                                placeholder="Enter custom password"
                                required={formData.credential_method === "custom"}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="send_credentials_to">Send Credentials To</Label>
                          <Select
                            value={formData.send_credentials_to}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, send_credentials_to: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="parent">Parent/Guardian Only</SelectItem>
                              <SelectItem value="student">Student Only</SelectItem>
                              <SelectItem value="both">Both Parent and Student</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">
                            Login credentials will be sent via email/SMS to selected recipients
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>

                      <div className="space-y-2">
                        <Label htmlFor="medical_info">Medical Information</Label>
                        <Input
                          id="medical_info"
                          value={formData.medical_info}
                          onChange={(e) => setFormData((prev) => ({ ...prev, medical_info: e.target.value }))}
                          placeholder="Any medical conditions, allergies, or special needs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes about the student"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingStudent ? "Update" : "Create"} Student</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {VALID_STATUS_VALUES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Reg No.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={student.avatar || "/placeholder.svg"}
                            alt={`${student.first_name} ${student.surname}`}
                          />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {(student.first_name || student.username || "S").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {`${student.first_name || ""} ${student.middle_name || ""} ${student.surname || ""}`.trim() ||
                              student.username ||
                              "Unknown"}
                          </p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.username}</TableCell>
                    <TableCell>
                      {student.current_class}-{student.section}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.reg_number}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "Active"
                            ? "default"
                            : student.status === "Suspended"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(student)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || classFilter !== "all" || statusFilter !== "all"
                ? "No students found matching your filters"
                : "No students found"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Complete information about the student</DialogDescription>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={viewingStudent.avatar || "/placeholder.svg"}
                    alt={`${viewingStudent.first_name} ${viewingStudent.surname}`}
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                    {(viewingStudent.first_name || viewingStudent.username || "S").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {`${viewingStudent.first_name || ""} ${viewingStudent.middle_name || ""} ${
                      viewingStudent.surname || ""
                    }`.trim() || viewingStudent.username}
                  </h3>
                  <p className="text-gray-600">{viewingStudent.email}</p>
                  <Badge
                    variant={
                      viewingStudent.status === "Active"
                        ? "default"
                        : viewingStudent.status === "Suspended"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {viewingStudent.status}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Username</Label>
                      <p className="font-mono">{viewingStudent.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p>{viewingStudent.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                      <p>
                        {viewingStudent.date_of_birth
                          ? new Date(viewingStudent.date_of_birth).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Gender</Label>
                      <p>{viewingStudent.gender || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Home Address</Label>
                      <p>{viewingStudent.home_address || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Academic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Class</Label>
                      <p>
                        {viewingStudent.current_class}-{viewingStudent.section}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Registration Number</Label>
                      <p className="font-mono">{viewingStudent.reg_number}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Admission Date</Label>
                      <p>
                        {viewingStudent.admission_date
                          ? new Date(viewingStudent.admission_date).toLocaleDateString()
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Parent/Guardian Information</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Parent Name</Label>
                      <p>{viewingStudent.parent_name || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Parent Phone</Label>
                      <p>{viewingStudent.parent_phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Parent Email</Label>
                      <p>{viewingStudent.parent_email || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Emergency Contact</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                      <p>{viewingStudent.emergency_contact || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Emergency Phone</Label>
                      <p>{viewingStudent.emergency_phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(viewingStudent.medical_info || viewingStudent.notes) && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Additional Information</h4>
                  {viewingStudent.medical_info && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Medical Information</Label>
                      <p>{viewingStudent.medical_info}</p>
                    </div>
                  )}
                  {viewingStudent.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Notes</Label>
                      <p>{viewingStudent.notes}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
