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
  RefreshCw,
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

// Sample data for demo purposes
const sampleStudents: Student[] = [
  {
    id: 1,
    name: "John Doe",
    rollNo: "2024001",
    class: "JSS 1",
    section: "Gold",
    email: "john.doe@email.com",
    phone: "+234 801 234 5678",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    admissionDate: "2024-01-15",
    dateOfBirth: "2010-05-20",
    gender: "Male",
    address: "123 Main Street, Lagos",
    parentName: "Jane Doe",
    parentPhone: "+234 802 345 6789",
    parentEmail: "jane.doe@email.com",
  },
  {
    id: 2,
    name: "Sarah Smith",
    rollNo: "2024002",
    class: "JSS 2",
    section: "Silver",
    email: "sarah.smith@email.com",
    phone: "+234 803 456 7890",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    admissionDate: "2024-01-16",
    dateOfBirth: "2009-08-15",
    gender: "Female",
    address: "456 Oak Avenue, Abuja",
    parentName: "Robert Smith",
    parentPhone: "+234 804 567 8901",
    parentEmail: "robert.smith@email.com",
  },
]

// Class and Section Management Settings
const getClassCategoriesFromSettings = () => {
  return [
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
}

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
  const [students, setStudents] = useState<Student[]>(sampleStudents)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error" | "not_configured">(
    "checking",
  )
  const [errorMessage, setErrorMessage] = useState<string>("")

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

  const [selectedCategory, setSelectedCategory] = useState("")
  const [editSelectedCategory, setEditSelectedCategory] = useState("")

  // Check Supabase configuration and connection
  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    try {
      console.log("🔍 Checking Supabase configuration...")

      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("Environment variables:")
      console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
      console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing")

      if (!supabaseUrl || !supabaseAnonKey) {
        setConnectionStatus("not_configured")
        setErrorMessage("Missing Supabase environment variables")
        return
      }

      // Try to create Supabase client
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      console.log("🔗 Testing Supabase connection...")

      // Test the connection with more detailed error handling
      console.log("🔗 Testing Supabase connection...")

      try {
        // First test: Simple query to check if we can connect
        const { data, error, status, statusText } = await supabase
          .from("students")
          .select("count", { count: "exact", head: true })

        console.log("Connection test results:")
        console.log("- Status:", status)
        console.log("- Status Text:", statusText)
        console.log("- Data:", data)
        console.log("- Error:", error)

        if (error) {
          console.error("❌ Supabase connection failed:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })

          // Check for specific error types
          if (status === 401) {
            setConnectionStatus("error")
            setDatabaseError("invalid_api_key")
            setErrorMessage(
              `401 Unauthorized: Invalid API key or insufficient permissions. Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY.`,
            )
            return
          } else if (error.message.includes("relation") && error.message.includes("does not exist")) {
            setConnectionStatus("error")
            setDatabaseError("tables_missing")
            setErrorMessage("Database tables don't exist yet")
          } else if (error.message.includes("Invalid API key") || error.message.includes("JWT")) {
            setConnectionStatus("error")
            setDatabaseError("invalid_api_key")
            setErrorMessage(`Invalid Supabase API key: ${error.message}`)
          } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            setConnectionStatus("error")
            setDatabaseError("network_error")
            setErrorMessage(`Network error: Cannot reach Supabase server. Check your URL: ${supabaseUrl}`)
          } else if (error.message.includes("CORS")) {
            setConnectionStatus("error")
            setDatabaseError("cors_error")
            setErrorMessage("CORS error: Check your Supabase project settings")
          } else {
            setConnectionStatus("error")
            setDatabaseError("connection_error")
            setErrorMessage(error.message || "Unknown connection error")
          }
          return
        }

        console.log("✅ Supabase connection successful!")
        setConnectionStatus("connected")
        setErrorMessage("")

        // Load students from database
        await loadStudentsFromDatabase(supabase)
      } catch (networkError: any) {
        console.error("❌ Network/Connection Error:", networkError)
        setConnectionStatus("error")
        setDatabaseError("network_error")
        setErrorMessage(`Connection failed: ${networkError.message || "Cannot reach Supabase server"}`)
        return
      }
    } catch (error: any) {
      console.error("❌ Error checking Supabase:", error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "Failed to connect to database")
    }
  }

  const loadStudentsFromDatabase = async (supabase?: any) => {
    try {
      if (!supabase) {
        const { createClient } = await import("@supabase/supabase-js")
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase configuration")
        }

        supabase = createClient(supabaseUrl, supabaseAnonKey)
      }

      console.log("🔍 Loading students from database...")

      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Database query error:", error)
        throw error
      }

      console.log("📊 Raw database data:", data)

      // Transform database data to match component interface
      const transformedStudents =
        data?.map((student: any) => ({
          id: student.id,
          name: student.full_name || `${student.first_name} ${student.middle_name || ""} ${student.surname}`.trim(),
          rollNo: student.roll_no,
          class: student.class,
          section: student.section,
          email: student.email,
          phone: student.phone || "",
          status: student.status,
          avatar: student.avatar || `/placeholder.svg?height=40&width=40&query=student`,
          admissionDate: student.admission_date,
          dateOfBirth: student.date_of_birth,
          gender: student.gender,
          address: student.home_address || "",
          parentName: student.parent_name || "",
          parentPhone: student.parent_phone || "",
          parentEmail: student.parent_email || "",
        })) || []

      setStudents(transformedStudents)
      console.log(`✅ Loaded ${transformedStudents.length} students from database`)
    } catch (error: any) {
      console.error("❌ Error loading students from database:", error)
      console.log("📝 Using sample data as fallback")
      // Keep using sample data if database fails
    }
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
        // Recheck connection
        await checkSupabaseConnection()
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

  // Show configuration error
  if (connectionStatus === "not_configured") {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Supabase Not Configured
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <div className="space-y-4">
              <p>Supabase environment variables are missing. Please configure them in Vercel.</p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium mb-2">Required Variables:</p>
                <ul className="text-xs space-y-1">
                  <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/debug">Debug Configuration</a>
                </Button>
                <Button onClick={checkSupabaseConnection}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show demo data */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Demo Mode (Database Not Connected)
            </CardTitle>
            <CardDescription>Configure Supabase to use real data. Currently showing sample data.</CardDescription>
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
              <Button variant="outline" onClick={checkSupabaseConnection}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show API key error if invalid
  if (databaseError === "invalid_api_key") {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Invalid Supabase API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <div className="space-y-4">
              <p>The Supabase API key is invalid or malformed.</p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <code className="text-xs text-red-600">{errorMessage}</code>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/debug">Debug Configuration</a>
                </Button>
                <Button onClick={checkSupabaseConnection}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show connection error
  if (connectionStatus === "error" && databaseError === "connection_error") {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Database Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700">
            <div className="space-y-4">
              <p>Failed to connect to the Supabase database.</p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <code className="text-xs text-red-600">{errorMessage}</code>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/debug">Debug Configuration</a>
                </Button>
                <Button onClick={checkSupabaseConnection}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show network error
  if (databaseError === "network_error") {
    return (
      <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 -m-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Network Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <div className="space-y-4">
              <p>Cannot reach the Supabase server. This could be due to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Incorrect Supabase URL</li>
                <li>Network connectivity issues</li>
                <li>Supabase service temporarily unavailable</li>
                <li>Firewall blocking the connection</li>
              </ul>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <code className="text-xs text-orange-600">{errorMessage}</code>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <a href="/debug">Debug Configuration</a>
                </Button>
                <Button onClick={checkSupabaseConnection}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </Button>
              </div>
            </div>
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

    // Validate credential method
    if (!formData.credentialMethod) {
      alert("Please select a password generation method")
      return
    }

    if (formData.credentialMethod === "manual" && !formData.customPassword) {
      alert("Please enter a custom password")
      return
    }

    if (formData.credentialMethod === "manual" && formData.customPassword.length < 6) {
      alert("Password must be at least 6 characters long")
      return
    }

    if (
      (formData.credentialMethod === "auto" || formData.credentialMethod === "email-setup") &&
      !formData.sendCredentialsTo
    ) {
      alert("Please select who should receive the login credentials")
      return
    }

    // TODO: Implement actual credential generation/sending logic here
    console.log("Credential setup:", {
      method: formData.credentialMethod,
      customUsername: formData.customUsername,
      customPassword: formData.customPassword ? "[HIDDEN]" : null,
      sendTo: formData.sendCredentialsTo,
    })

    const newStudent: Student = {
      id: students.length + 1,
      name: `${formData.firstName} ${formData.middleName} ${formData.surname}`.replace(/\s+/g, " ").trim(),
      rollNo: generateRollNumber(),
      class: formData.class,
      section: formData.section,
      email: formData.email,
      phone: formData.phone,
      status: "Active",
      avatar: formData.avatar || `/placeholder.svg?height=40&width=40&query=student`,
      admissionDate: new Date().toISOString().split("T")[0],
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      address: formData.address,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
    }

    // If connected to database, try to save there
    if (connectionStatus === "connected") {
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)

          const { error } = await supabase.from("students").insert([
            {
              roll_no: newStudent.rollNo,
              surname: formData.surname,
              middle_name: formData.middleName || null,
              first_name: formData.firstName,
              email: newStudent.email,
              phone: newStudent.phone,
              date_of_birth: newStudent.dateOfBirth,
              gender: newStudent.gender,
              home_address: newStudent.address,
              class: newStudent.class,
              section: newStudent.section,
              parent_name: formData.parentName,
              parent_phone: formData.parentPhone,
              parent_email: formData.parentEmail,
              avatar: newStudent.avatar,
              status: newStudent.status,
              admission_date: newStudent.admissionDate,
              credential_method: formData.credentialMethod,
              credentials_sent_to: formData.sendCredentialsTo,
              username: formData.customUsername || null,
              // Note: In production, you'd hash the password before storing
              password_hash: formData.credentialMethod === "manual" ? formData.customPassword : null,
            },
          ])

          if (error) {
            console.error("❌ Database insert error:", error)
            throw error
          }

          console.log("✅ Student saved to database successfully")

          // Reload from database
          await loadStudentsFromDatabase(supabase)
        }
      } catch (error) {
        console.error("Error saving to database:", error)
        // Fall back to local storage
        setStudents((prev) => [...prev, newStudent])
      }
    } else {
      // Add to local state only
      setStudents((prev) => [...prev, newStudent])
    }

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
    setSelectedCategory("")
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
    setEditSelectedCategory(getCategoryFromClass(student.class))
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
    setEditSelectedCategory("")
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
    const classCategories = getClassCategoriesFromSettings()
    return classCategories.sort((a, b) => a.order - b.order).flatMap((category) => category.classes)
  }

  // Get all available sections from settings
  const getAllSections = () => {
    return classSections.sort((a, b) => a.order - b.order)
  }

  const getCategoryFromClass = (className: string) => {
    const classCategories = getClassCategoriesFromSettings()
    for (const category of classCategories) {
      if (category.classes.includes(className)) {
        return category.name
      }
    }
    return ""
  }

  const handleClassChange = (className: string) => {
    handleInputChange("class", className)
    const category = getCategoryFromClass(className)
    setSelectedCategory(category)
  }

  const handleEditClassChange = (className: string) => {
    handleEditInputChange("class", className)
    const category = getCategoryFromClass(className)
    setEditSelectedCategory(category)
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
          {connectionStatus === "connected" && (
            <Badge variant="secondary" className="mt-1">
              ✅ Connected to Database
            </Badge>
          )}
          {connectionStatus === "checking" && (
            <Badge variant="outline" className="mt-1">
              🔄 Checking Connection...
            </Badge>
          )}
          {connectionStatus !== "connected" && connectionStatus !== "checking" && (
            <Badge variant="destructive" className="mt-1">
              ⚠️ Using Demo Data
            </Badge>
          )}
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
                            <AvatarFallback>
                              <User className="h-12 w-12 text-gray-400" />
                            </AvatarFallback>
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
                        <Select value={formData.class} onValueChange={handleClassChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {getClassCategoriesFromSettings()
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
                      {selectedCategory && (
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={selectedCategory}
                            disabled
                            className="bg-gray-50 text-gray-600"
                            placeholder="Category will be auto-filled"
                          />
                          <p className="text-xs text-gray-500">Auto-filled based on selected class</p>
                        </div>
                      )}
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

                  {/* Login Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Login Credentials</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="credentialMethod">Password Generation Method *</Label>
                        <Select
                          value={formData.credentialMethod}
                          onChange={(value) => handleInputChange("credentialMethod", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select how to generate login credentials" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto-generate secure password</SelectItem>
                            <SelectItem value="manual">Set custom password</SelectItem>
                            <SelectItem value="email-setup">Send setup link to email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.credentialMethod === "auto" && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-blue-800">Auto-generate Password</p>
                              <p className="text-xs text-blue-600 mt-1">
                                A secure 8-character password will be automatically generated and sent to the selected
                                recipient.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.credentialMethod === "manual" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="customUsername">Username (Optional)</Label>
                              <Input
                                id="customUsername"
                                value={formData.customUsername}
                                onChange={(e) => handleInputChange("customUsername", e.target.value)}
                                placeholder="Leave blank to use email"
                              />
                              <p className="text-xs text-gray-500">If empty, email will be used as username</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="customPassword">Password *</Label>
                              <Input
                                id="customPassword"
                                type="password"
                                value={formData.customPassword}
                                onChange={(e) => handleInputChange("customPassword", e.target.value)}
                                placeholder="Enter secure password"
                                required={formData.credentialMethod === "manual"}
                              />
                              <p className="text-xs text-gray-500">Minimum 6 characters</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.credentialMethod === "email-setup" && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-green-800">Email Setup Link</p>
                              <p className="text-xs text-green-600 mt-1">
                                A secure setup link will be sent to the selected email address. The recipient can set
                                their own password on first login.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(formData.credentialMethod === "auto" || formData.credentialMethod === "email-setup") && (
                        <div className="space-y-2">
                          <Label htmlFor="sendCredentialsTo">Send Credentials To *</Label>
                          <Select
                            value={formData.sendCredentialsTo}
                            onChange={(value) => handleInputChange("sendCredentialsTo", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select who should receive the login credentials" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">
                                Student Email ({formData.email || "student@email.com"})
                              </SelectItem>
                              <SelectItem value="parent">
                                Parent Email ({formData.parentEmail || "parent@email.com"})
                              </SelectItem>
                              <SelectItem value="both">Both Student and Parent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {formData.credentialMethod && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          <div className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-xs text-yellow-700">
                                <strong>Security Note:</strong> Login credentials will be processed securely.
                                {formData.credentialMethod === "auto" &&
                                  " Auto-generated passwords use secure random generation."}
                                {formData.credentialMethod === "manual" &&
                                  " Ensure the password meets security requirements."}
                                {formData.credentialMethod === "email-setup" &&
                                  " Setup links expire after 24 hours for security."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
            <p className="text-xs text-white/70">
              {connectionStatus === "connected" ? "Students in database" : "Sample students (demo mode)"}
            </p>
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
                    onChange={() => toggleClassFilter(className)}
                  >
                    {className}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-medium text-gray-500 pt-2">Gender</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filters.gender.includes("Male")}
                  onChange={() => toggleGenderFilter("Male")}
                >
                  Male
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.gender.includes("Female")}
                  onChange={() => toggleGenderFilter("Female")}
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
      <Dialog open={isViewDialogOpen} onChange={setIsViewDialogOpen}>
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
      <Dialog open={isEditDialogOpen} onChange={setIsEditDialogOpen}>
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
                        <AvatarFallback>
                          <User className="h-12 w-12 text-gray-400" />
                        </AvatarFallback>
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
                    <Select value={editFormData.class} onChange={(value) => handleEditClassChange(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {getClassCategoriesFromSettings()
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
                  {editSelectedCategory && (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={editSelectedCategory}
                        disabled
                        className="bg-gray-50 text-gray-600"
                        placeholder="Category will be auto-filled"
                      />
                      <p className="text-xs text-gray-500">Auto-filled based on selected class</p>
                    </div>
                  )}
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
      <AlertDialog open={isDeleteDialogOpen} onChange={setIsDeleteDialogOpen}>
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
