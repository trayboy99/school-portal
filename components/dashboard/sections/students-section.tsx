"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  X,
  ChevronDown,
  AlertCircle,
  Database,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

interface Student {
  id: number
  name: string
  rollNo: string
  class: string
  section: string
  email: string
  phone: string
  status: string
  avatar: string
  admissionDate: string
  dateOfBirth: string
  gender: string
  address: string
  parentName: string
  parentPhone: string
  parentEmail: string
}

interface Filters {
  class: string[]
  gender: string[]
}

// Class and Section Management Settings (should be shared across the app)
const classCategories = [
  {
    id: 1,
    name: "Junior",
    description: "Junior Secondary School",
    defaultSubjects: 9,
    classes: ["JSS 1", "JSS 2", "JSS 3"],
    order: 1,
  },
  {
    id: 2,
    name: "Senior",
    description: "Senior Secondary School",
    defaultSubjects: 6,
    classes: ["SSS 1", "SSS 2", "SSS 3"],
    order: 2,
  },
]

const classSections = [
  {
    id: 1,
    name: "Gold",
    description: "Gold section for high-performing students",
    color: "#FFD700",
    order: 1,
  },
  {
    id: 2,
    name: "Silver",
    description: "Silver section for regular students",
    color: "#C0C0C0",
    order: 2,
  },
]

export function StudentsSection() {
  // Move ALL hooks to the top - before any conditional logic
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const [students, setStudents] = useState<Student[]>([])

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    class: [],
    gender: [],
  })

  const [formData, setFormData] = useState({
    surname: "",
    middleName: "",
    firstName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    class: "",
    section: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalInfo: "",
    credentialMethod: "",
    customUsername: "",
    customPassword: "",
    sendCredentialsTo: "",
    avatar: "",
  })

  const [editFormData, setEditFormData] = useState({
    surname: "",
    middleName: "",
    firstName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    class: "",
    section: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    avatar: "",
  })

  // Add useEffect to load students from database
  useEffect(() => {
    loadStudents()
  }, [])

  // NOW do the conditional checks AFTER all hooks are declared
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Database Not Configured
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <p className="mb-4">
              Supabase database is not properly configured. Please check your environment variables.
            </p>
            <Button variant="outline" asChild>
              <a href="/debug">Check Configuration</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const createTables = async () => {
    setIsCreatingTables(true)
    try {
      const response = await fetch("/api/setup-supabase", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        alert("Database tables created successfully!")
        setDatabaseError(null)
        // Try loading students again
        await loadStudents()
      } else {
        alert("Failed to create tables: " + result.error)
      }
    } catch (error) {
      console.error("Error creating tables:", error)
      alert("Failed to create database tables")
    } finally {
      setIsCreatingTables(false)
    }
  }

  const loadStudents = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      if (error) {
        // Check if it's a "table doesn't exist" error
        if (error.message.includes("does not exist") || error.code === "42P01") {
          setDatabaseError("tables_missing")
          return
        }
        throw error
      }

      // Transform database data to match component interface
      const transformedStudents =
        data?.map((student) => ({
          id: student.id,
          name: student.name,
          rollNo: student.roll_no,
          class: student.class,
          section: student.section,
          email: student.email,
          phone: student.phone || "",
          status: student.status,
          avatar: student.avatar || `/placeholder.svg?height=40&width=40`,
          admissionDate: student.admission_date,
          dateOfBirth: student.date_of_birth,
          gender: student.gender,
          address: student.address || "",
          parentName: student.parent_name || "",
          parentPhone: student.parent_phone || "",
          parentEmail: student.parent_email || "",
        })) || []

      setStudents(transformedStudents)
      setDatabaseError(null)
    } catch (error) {
      console.error("Error loading students:", error)
      setDatabaseError("connection_error")
    }
  }

  // Show database setup UI if tables are missing
  if (databaseError === "tables_missing") {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tables Missing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700">
            <p className="mb-4">
              The database tables haven't been created yet. Click the button below to create them automatically.
            </p>
            <div className="flex gap-3">
              <Button onClick={createTables} disabled={isCreatingTables}>
                {isCreatingTables ? "Creating Tables..." : "Create Database Tables"}
              </Button>
              <Button variant="outline" asChild>
                <a href="/setup">Manual Setup</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Show demo data while tables are missing */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Demo Data (Database Not Ready)
            </CardTitle>
            <CardDescription>
              This is sample data. Create the database tables above to start using real data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{student.class}</span>
                        {student.section && (
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: classSections.find((s) => s.name === student.section)?.color || "#000",
                              }}
                            ></div>
                            <span className="text-xs text-gray-500">{student.section}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateRollNumber = () => {
    const year = new Date().getFullYear()
    const nextNumber = students.length + 1
    return `${year}${nextNumber.toString().padStart(3, "0")}`
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        handleInputChange("avatar", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setEditImagePreview(result)
        handleEditInputChange("avatar", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImageUpload = () => {
    setImagePreview(null)
    handleInputChange("avatar", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const clearEditImageUpload = () => {
    setEditImagePreview(null)
    handleEditInputChange("avatar", "")
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = getSupabaseClient()
      // Insert into Supabase
      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            name: `${formData.firstName} ${formData.middleName} ${formData.surname}`.replace(/\s+/g, " ").trim(),
            roll_no: generateRollNumber(),
            class: formData.class,
            section: formData.section,
            email: formData.email,
            phone: formData.phone,
            status: "Active",
            avatar: formData.avatar || `/placeholder.svg?height=40&width=40&query=student`,
            admission_date: new Date().toISOString().split("T")[0],
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            parent_name: formData.parentName,
            parent_phone: formData.parentPhone,
            parent_email: formData.parentEmail,
          },
        ])
        .select()

      if (error) throw error

      // Reload students from database
      await loadStudents()

      alert("Student added successfully!")
      setIsAddDialogOpen(false)

      // Reset form
      setFormData({
        surname: "",
        middleName: "",
        firstName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        class: "",
        section: "",
        address: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        emergencyContact: "",
        emergencyPhone: "",
        medicalInfo: "",
        credentialMethod: "",
        customUsername: "",
        customPassword: "",
        sendCredentialsTo: "",
        avatar: "",
      })
      setImagePreview(null)
    } catch (error) {
      console.error("Error adding student:", error)
      alert("Failed to add student to database")
    }
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsViewDialogOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    const nameParts = student.name.split(" ")
    const firstName = nameParts[0] || ""
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : ""
    const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""

    setEditFormData({
      surname: surname,
      middleName: middleName,
      firstName: firstName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      class: student.class,
      section: student.section,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      avatar: student.avatar,
    })
    setEditImagePreview(student.avatar)
    setSelectedStudent(student)
    setIsEditDialogOpen(true)
  }

  const handleUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    const updatedStudent: Student = {
      ...selectedStudent,
      name: `${editFormData.firstName} ${editFormData.middleName} ${editFormData.surname}`.replace(/\s+/g, " ").trim(),
      email: editFormData.email,
      phone: editFormData.phone,
      dateOfBirth: editFormData.dateOfBirth,
      gender: editFormData.gender,
      class: editFormData.class,
      section: editFormData.section,
      address: editFormData.address,
      parentName: editFormData.parentName,
      parentPhone: editFormData.parentPhone,
      parentEmail: editFormData.parentEmail,
      avatar: editFormData.avatar || selectedStudent.avatar,
    }

    setStudents((prev) => prev.map((student) => (student.id === selectedStudent.id ? updatedStudent : student)))
    setIsEditDialogOpen(false)
    setSelectedStudent(null)
    setEditImagePreview(null)
    alert("Student updated successfully!")
  }

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteStudent = () => {
    if (!selectedStudent) return

    setStudents((prev) => prev.filter((student) => student.id !== selectedStudent.id))
    setIsDeleteDialogOpen(false)
    setSelectedStudent(null)
    alert("Student deleted successfully!")
  }

  // Filter functions
  const toggleClassFilter = (className: string) => {
    setFilters((prev) => {
      if (prev.class.includes(className)) {
        return { ...prev, class: prev.class.filter((c) => c !== className) }
      } else {
        return { ...prev, class: [...prev.class, className] }
      }
    })
  }

  const toggleGenderFilter = (gender: string) => {
    setFilters((prev) => {
      if (prev.gender.includes(gender)) {
        return { ...prev, gender: prev.gender.filter((g) => g !== gender) }
      } else {
        return { ...prev, gender: [...prev.gender, gender] }
      }
    })
  }

  const clearFilters = () => {
    setFilters({ class: [], gender: [] })
  }

  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(students.map((student) => student.class)))

  // Get all available classes from settings
  const getAllClasses = () => {
    return classCategories.sort((a, b) => a.order - b.order).flatMap((category) => category.classes)
  }

  // Get all available sections from settings
  const getAllSections = () => {
    return classSections.sort((a, b) => a.order - b.order)
  }

  // Apply filters and search
  const filteredStudents = students.filter((student) => {
    // Apply search
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply class filter
    const matchesClass = filters.class.length === 0 || filters.class.includes(student.class)

    // Apply gender filter
    const matchesGender = filters.gender.length === 0 || filters.gender.includes(student.gender)

    return matchesSearch && matchesClass && matchesGender
  })

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student information and records</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Enter the student's information to create a new student record.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent}>
                <div className="grid gap-4 py-4 px-1">
                  {/* Student Photo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Student Photo</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          {imagePreview ? (
                            <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Preview" />
                          ) : (
                            <>
                              <AvatarFallback>
                                <User className="h-12 w-12 text-gray-400" />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={clearImageUpload}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="photo">Upload Photo</Label>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="surname">Surname *</Label>
                        <Input
                          id="surname"
                          value={formData.surname}
                          onChange={(e) => handleInputChange("surname", e.target.value)}
                          placeholder="Enter surname"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                          id="middleName"
                          value={formData.middleName}
                          onChange={(e) => handleInputChange("middleName", e.target.value)}
                          placeholder="Enter middle name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="student@email.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+234 xxx xxx xxxx"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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

                    <div className="space-y-2">
                      <Label htmlFor="address">Home Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full home address"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class">Class *</Label>
                        <Select value={formData.class} onValueChange={(value) => handleInputChange("class", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classCategories
                              .sort((a, b) => a.order - b.order)
                              .map((category) => (
                                <div key={category.id}>
                                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                                    {category.name} ({category.defaultSubjects} subjects)
                                  </div>
                                  {category.classes.map((className) => (
                                    <SelectItem key={className} value={className}>
                                      {className}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="section">Section *</Label>
                        <Select value={formData.section} onValueChange={(value) => handleInputChange("section", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAllSections().map((section) => (
                              <SelectItem key={section.id} value={section.name}>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: section.color }}
                                  ></div>
                                  <span>{section.name}</span>
                                  <span className="text-xs text-gray-500">({section.description})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input
                        id="parentName"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange("parentName", e.target.value)}
                        placeholder="Enter parent/guardian full name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentPhone">Parent Phone *</Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                          placeholder="+234 xxx xxx xxxx"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">Parent Email</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                          placeholder="parent@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                          placeholder="+234 xxx xxx xxxx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Medical Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="medicalInfo">Medical Conditions/Allergies</Label>
                      <Textarea
                        id="medicalInfo"
                        value={formData.medicalInfo}
                        onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                        placeholder="Any medical conditions, allergies, or special requirements"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Login Credentials</h3>

                    <div className="space-y-2">
                      <Label htmlFor="credentialMethod">Credential Setup Method *</Label>
                      <Select
                        value={formData.credentialMethod}
                        onValueChange={(value) => handleInputChange("credentialMethod", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select credential setup method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto-generate">Auto-generate credentials (recommended)</SelectItem>
                          <SelectItem value="custom">Set custom credentials</SelectItem>
                          <SelectItem value="email-setup">Send setup link via email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.credentialMethod === "auto-generate" && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Auto-Generated Credentials</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          System will automatically generate secure login credentials for the student.
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Username:</strong> Will be auto-generated (e.g., john.doe.2024)
                          </div>
                          <div className="text-sm">
                            <strong>Password:</strong> Will be auto-generated (8-character secure password)
                          </div>
                          <div className="text-sm text-blue-600">
                            ✓ Student will be required to change password on first login
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.credentialMethod === "custom" && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Setting custom credentials requires you to securely share them with the student.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="customUsername">Username *</Label>
                            <Input
                              id="customUsername"
                              value={formData.customUsername}
                              onChange={(e) => handleInputChange("customUsername", e.target.value)}
                              placeholder="Enter username"
                              required={formData.credentialMethod === "custom"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="customPassword">Temporary Password *</Label>
                            <Input
                              id="customPassword"
                              type="password"
                              value={formData.customPassword}
                              onChange={(e) => handleInputChange("customPassword", e.target.value)}
                              placeholder="Enter temporary password"
                              required={formData.credentialMethod === "custom"}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.credentialMethod === "email-setup" && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Email Setup Process</h4>
                        <p className="text-sm text-green-700 mb-3">
                          A secure setup link will be sent to the student's email address. They can create their own
                          username and password.
                        </p>
                        <div className="text-sm text-green-600">
                          ✓ Most secure method - student creates their own credentials
                          <br />✓ Setup link expires in 24 hours
                          <br />✓ Email verification included
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="sendCredentialsTo">Send Credentials To</Label>
                      <Select
                        value={formData.sendCredentialsTo}
                        onChange={(value) => handleInputChange("sendCredentialsTo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select who receives the credentials" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student Email</SelectItem>
                          <SelectItem value="parent">Parent Email</SelectItem>
                          <SelectItem value="both">Both Student and Parent</SelectItem>
                          <SelectItem value="print">Print Credentials (Manual Delivery)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.sendCredentialsTo && formData.sendCredentialsTo !== "print" && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          📧 Credentials will be sent to:{" "}
                          {formData.sendCredentialsTo === "student"
                            ? formData.email
                            : formData.sendCredentialsTo === "parent"
                              ? formData.parentEmail
                              : formData.sendCredentialsTo === "both"
                                ? `${formData.email} and ${formData.parentEmail}`
                                : ""}
                        </p>
                      </div>
                    )}

                    {formData.sendCredentialsTo === "print" && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-700">
                          📄 Credentials will be available for printing after student creation. You can manually deliver
                          them to the student.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Add Student
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-white/70">Registered students in the system</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>Search and manage student records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students by name, roll number, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {(filters.class.length > 0 || filters.gender.length > 0) && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1">
                      {filters.class.length + filters.gender.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Students</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-medium text-gray-500 pt-2">Class</DropdownMenuLabel>
                {uniqueClasses.map((className) => (
                  <DropdownMenuCheckboxItem
                    key={className}
                    checked={filters.class.includes(className)}
                    onCheckedChange={() => toggleClassFilter(className)}
                  >
                    {className}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-medium text-gray-500 pt-2">Gender</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.gender.includes("Male")}
                  onCheckedChange={() => toggleGenderFilter("Male")}
                >
                  Male
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.gender.includes("Female")}
                  onCheckedChange={() => toggleGenderFilter("Female")}
                >
                  Female
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-4">
            {filters.class.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.class.map((className) => (
                  <Badge key={className} variant="secondary" className="flex items-center gap-1">
                    {className}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleClassFilter(className)} />
                  </Badge>
                ))}
              </div>
            )}

            {filters.gender.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.gender.map((gender) => (
                  <Badge key={gender} variant="secondary" className="flex items-center gap-1">
                    {gender}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleGenderFilter(gender)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No students found matching your search or filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{student.class}</span>
                        {student.section && (
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: classSections.find((s) => s.name === student.section)?.color || "#000",
                              }}
                            ></div>
                            <span className="text-xs text-gray-500">{student.section}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStudent(student)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Student Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Complete information for {selectedStudent?.name}</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="grid gap-6 py-4">
              {/* Student Profile */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedStudent.avatar || "/placeholder.svg"} alt={selectedStudent.name} />
                  <AvatarFallback className="text-lg">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-gray-600">Roll No: {selectedStudent.rollNo}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{selectedStudent.class}</Badge>
                    {selectedStudent.section && (
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              classSections.find((s) => s.name === selectedStudent.section)?.color || "#000",
                          }}
                        ></div>
                        <Badge variant="secondary" className="text-xs">
                          {selectedStudent.section}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                      <p className="text-sm">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Gender</Label>
                      <p className="text-sm">{selectedStudent.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Admission Date</Label>
                      <p className="text-sm">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Address</Label>
                    <p className="text-sm">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="text-sm">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="text-sm">{selectedStudent.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Parent/Guardian</Label>
                      <p className="text-sm">{selectedStudent.parentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Parent Phone</Label>
                      <p className="text-sm">{selectedStudent.parentPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Parent Email</Label>
                      <p className="text-sm">{selectedStudent.parentEmail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedStudent && handleEditStudent(selectedStudent)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student information</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStudent}>
            <div className="grid gap-4 py-4 px-1">
              {/* Student Photo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Student Photo</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {editImagePreview ? (
                        <AvatarImage src={editImagePreview || "/placeholder.svg"} alt="Preview" />
                      ) : (
                        <>
                          <AvatarFallback>
                            <User className="h-12 w-12 text-gray-400" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    {editImagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={clearEditImageUpload}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhoto">Change Photo</Label>
                    <Input
                      id="editPhoto"
                      type="file"
                      accept="image/*"
                      ref={editFileInputRef}
                      onChange={handleEditImageUpload}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSurname">Surname *</Label>
                    <Input
                      id="editSurname"
                      value={editFormData.surname}
                      onChange={(e) => handleEditInputChange("surname", e.target.value)}
                      placeholder="Enter surname"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editMiddleName">Middle Name</Label>
                    <Input
                      id="editMiddleName"
                      value={editFormData.middleName}
                      onChange={(e) => handleEditInputChange("middleName", e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">First Name *</Label>
                    <Input
                      id="editFirstName"
                      value={editFormData.firstName}
                      onChange={(e) => handleEditInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editEmail">Email Address *</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange("email", e.target.value)}
                      placeholder="student@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPhone">Phone Number</Label>
                    <Input
                      id="editPhone"
                      value={editFormData.phone}
                      onChange={(e) => handleEditInputChange("phone", e.target.value)}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editDateOfBirth">Date of Birth *</Label>
                    <Input
                      id="editDateOfBirth"
                      type="date"
                      value={editFormData.dateOfBirth}
                      onChange={(e) => handleEditInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editGender">Gender *</Label>
                    <Select value={editFormData.gender} onChange={(value) => handleEditInputChange("gender", value)}>
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

                <div className="space-y-2">
                  <Label htmlFor="editAddress">Home Address</Label>
                  <Textarea
                    id="editAddress"
                    value={editFormData.address}
                    onChange={(e) => handleEditInputChange("address", e.target.value)}
                    placeholder="Enter full home address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editClass">Class *</Label>
                    <Select value={editFormData.class} onChange={(value) => handleEditInputChange("class", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classCategories
                          .sort((a, b) => a.order - b.order)
                          .map((category) => (
                            <div key={category.id}>
                              <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                                {category.name} ({category.defaultSubjects} subjects)
                              </div>
                              {category.classes.map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSection">Section *</Label>
                    <Select value={editFormData.section} onChange={(value) => handleEditInputChange("section", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllSections().map((section) => (
                          <SelectItem key={section.id} value={section.name}>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: section.color }}></div>
                              <span>{section.name}</span>
                              <span className="text-xs text-gray-500">({section.description})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Parent/Guardian Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="editParentName">Parent/Guardian Name *</Label>
                  <Input
                    id="editParentName"
                    value={editFormData.parentName}
                    onChange={(e) => handleEditInputChange("parentName", e.target.value)}
                    placeholder="Enter parent/guardian full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editParentPhone">Parent Phone *</Label>
                    <Input
                      id="editParentPhone"
                      value={editFormData.parentPhone}
                      onChange={(e) => handleEditInputChange("parentPhone", e.target.value)}
                      placeholder="+234 xxx xxx xxxx"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editParentEmail">Parent Email</Label>
                    <Input
                      id="editParentEmail"
                      type="email"
                      value={editFormData.parentEmail}
                      onChange={(e) => handleEditInputChange("parentEmail", e.target.value)}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="w-full sm:w-auto"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Update Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone and will permanently
              remove the student from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStudent} className="bg-red-600 hover:bg-red-700">
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
