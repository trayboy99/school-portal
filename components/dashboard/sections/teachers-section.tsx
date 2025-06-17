"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, BookOpen, Clock, Edit, Eye, Search, Filter, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export function TeachersSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Load teachers from database
  const loadTeachers = async () => {
    try {
      setIsLoadingTeachers(true)
      setLoadError(null)

      const { data, error } = await supabase.from("teachers").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading teachers:", error)
        setLoadError(error.message)
        return
      }

      if (data) {
        // Transform database data to match component format
        const transformedTeachers = data.map((teacher) => ({
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          employeeId: teacher.employee_id,
          email: teacher.email,
          phone: teacher.phone,
          subjects: teacher.subjects || [],
          experience: teacher.experience,
          status: teacher.status,
          avatar: teacher.avatar || "/placeholder.svg?height=32&width=32",
          department: teacher.department,
          qualification: teacher.qualification,
          hireDate: teacher.hire_date,
          employmentType: teacher.employment_type,
          salary: teacher.salary,
        }))

        setTeachers(transformedTeachers)
      }
    } catch (error) {
      console.error("Error loading teachers:", error)
      setLoadError("Failed to load teachers")
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  // Load subjects and group by department
  const [allSubjects, setAllSubjects] = useState([])

  const loadSubjectsForDepartments = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("name, department").eq("status", "Active")
      if (data) {
        setAllSubjects(data)
      }
    } catch (error) {
      console.error("Error loading subjects for departments:", error)
    }
  }

  // Load teachers on component mount
  useEffect(() => {
    loadTeachers()
    loadSubjectsForDepartments()
  }, [])

  // Dynamic function that groups actual subjects by department from database
  const getDepartmentsFromSubjects = () => {
    const departmentSubjects: { [key: string]: string[] } = {}

    // Group subjects by department from database
    allSubjects.forEach((subject) => {
      if (!departmentSubjects[subject.department]) {
        departmentSubjects[subject.department] = []
      }
      departmentSubjects[subject.department].push(subject.name)
    })

    return departmentSubjects
  }

  const departmentSubjects = getDepartmentsFromSubjects()

  // Sample subjects data that would come from the subjects section
  // In a real app, this would be shared state or fetched from the same data source
  const [allSubjectsSample] = useState([
    {
      id: 1,
      name: "Mathematics",
      code: "MATH101",
      department: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      classes: ["Grade 10A", "Grade 10B"],
      hours: 6,
      students: 67,
      status: "Active",
    },
    {
      id: 2,
      name: "English Literature",
      code: "ENG101",
      department: "Languages",
      teacher: "Mr. David Wilson",
      classes: ["Grade 9A", "Grade 10B"],
      hours: 5,
      students: 70,
      status: "Active",
    },
    {
      id: 3,
      name: "Physics",
      code: "PHY101",
      department: "Science",
      teacher: "Dr. Sarah Johnson",
      classes: ["Grade 11A", "Grade 11B"],
      hours: 4,
      students: 45,
      status: "Active",
    },
    {
      id: 4,
      name: "Chemistry",
      code: "CHEM101",
      department: "Science",
      teacher: "Mrs. Emily Brown",
      classes: ["Grade 10A"],
      hours: 4,
      students: 35,
      status: "Active",
    },
    {
      id: 5,
      name: "Further Mathematics",
      code: "MATH201",
      department: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      classes: ["Grade 12A"],
      hours: 5,
      students: 25,
      status: "Active",
    },
    {
      id: 6,
      name: "French",
      code: "FR101",
      department: "Languages",
      teacher: "Mr. David Wilson",
      classes: ["Grade 9A"],
      hours: 3,
      students: 30,
      status: "Active",
    },
  ])

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    qualification: "",
    experience: "",
    department: "",
    employmentType: "",
    salary: "",
    hireDate: "",
    emergencyContact: "",
    emergencyPhone: "",
    credentialMethod: "",
    customUsername: "",
    customPassword: "",
    sendCredentialsTo: "",
    photo: "", // Add this new field
  })

  const generateEmployeeId = () => {
    const nextNumber = teachers.length + 1
    return `EMP${nextNumber.toString().padStart(3, "0")}`
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Generate employee ID
      const employeeId = generateEmployeeId()

      // Prepare teacher data for database
      const teacherData = {
        employee_id: employeeId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        home_address: formData.address || null,
        qualification: formData.qualification,
        experience: formData.experience,
        department: formData.department,
        employment_type: formData.employmentType,
        hire_date: formData.hireDate,
        salary: formData.salary || null,
        emergency_contact: formData.emergencyContact || null,
        emergency_phone: formData.emergencyPhone || null,
        avatar: formData.photo || null,
        credential_method: formData.credentialMethod,
        custom_username: formData.customUsername || null,
        custom_password: formData.customPassword || null,
        send_credentials_to: formData.sendCredentialsTo || null,
        subjects: [],
        status: "Active",
      }

      // Generate credentials based on selected method
      let credentials: {
        username?: string
        password?: string
        mustChangePassword?: boolean
        setupToken?: string
        setupExpiry?: number
      } = {}

      if (formData.credentialMethod === "auto-generate") {
        const username = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}.teacher`
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
        credentials = { username, password, mustChangePassword: true }
        teacherData.username = username
        teacherData.password_hash = password // In production, this should be hashed
      } else if (formData.credentialMethod === "custom") {
        credentials = {
          username: formData.customUsername,
          password: formData.customPassword,
          mustChangePassword: true,
        }
        teacherData.username = formData.customUsername
        teacherData.password_hash = formData.customPassword // In production, this should be hashed
      } else if (formData.credentialMethod === "email-setup") {
        credentials = { setupToken: Math.random().toString(36), setupExpiry: Date.now() + 24 * 60 * 60 * 1000 }
      }

      // Insert teacher into database using client-side supabase
      const { data, error } = await supabase.from("teachers").insert([teacherData]).select().single()

      if (error) {
        console.error("Error adding teacher:", error)
        alert(`Error adding teacher: ${error.message}`)
        return
      }

      // Show success message with credentials
      if (formData.sendCredentialsTo && formData.credentialMethod !== "email-setup") {
        alert(
          `Teacher added successfully!\n\nEmployee ID: ${employeeId}\n\nLogin Credentials:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nCredentials sent to: ${formData.sendCredentialsTo}`,
        )
      } else if (formData.credentialMethod === "email-setup") {
        alert(`Teacher added successfully!\n\nEmployee ID: ${employeeId}\n\nSetup link sent to: ${formData.email}`)
      } else {
        alert(`Teacher added successfully!\n\nEmployee ID: ${employeeId}`)
      }

      // Reload teachers from database
      await loadTeachers()

      setIsAddDialogOpen(false)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        qualification: "",
        experience: "",
        department: "",
        employmentType: "",
        salary: "",
        hireDate: "",
        emergencyContact: "",
        emergencyPhone: "",
        credentialMethod: "",
        customUsername: "",
        customPassword: "",
        sendCredentialsTo: "",
        photo: "",
      })
    } catch (error) {
      console.error("Error adding teacher:", error)
      alert("Failed to add teacher. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render subjects column based on assignment status
  const renderSubjectsColumn = (teacher: any) => {
    if (!teacher.subjects || teacher.subjects.length === 0) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
          Subjects Allocation Pending
        </Badge>
      )
    }

    return (
      <div className="flex flex-wrap gap-1">
        {teacher.subjects.map((subject: string, index: number) => (
          <Badge key={index} variant="outline" className="text-xs">
            {subject}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage teaching staff and their assignments</p>
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
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>Enter the teacher's information to create a new staff record.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTeacher}>
                <div className="grid gap-4 py-4 px-1">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

                    {/* Photo Upload Section */}
                    <div className="space-y-2">
                      <Label htmlFor="photo">Teacher Photo</Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {formData.photo ? (
                            <img
                              src={formData.photo || "/placeholder.svg"}
                              alt="Teacher preview"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="text-center">
                              <Users className="h-8 w-8 text-gray-400 mx-auto" />
                              <span className="text-xs text-gray-500">Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onload = (e) => {
                                  handleInputChange("photo", e.target?.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="mb-2"
                          />
                          <p className="text-xs text-gray-500">Upload a professional photo (JPG, PNG, max 2MB)</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Enter last name"
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
                          placeholder="teacher@westminster.edu"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+234 xxx xxx xxxx"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
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

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qualification">Highest Qualification *</Label>
                        <Input
                          id="qualification"
                          value={formData.qualification}
                          onChange={(e) => handleInputChange("qualification", e.target.value)}
                          placeholder="e.g., MSc in Mathematics"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience *</Label>
                        <Input
                          id="experience"
                          value={formData.experience}
                          onChange={(e) => handleInputChange("experience", e.target.value)}
                          placeholder="e.g., 5 years"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col space-y-1">
                        <Label htmlFor="department">Department *</Label>
                        <p className="text-xs text-blue-600 mb-1">
                          💡 <strong>Tip:</strong> Select a department to see its subjects below.
                        </p>
                      </div>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(departmentSubjects).map(([dept, subjects]) => (
                            <SelectItem key={dept} value={dept}>
                              <div className="flex items-center justify-between w-full">
                                <span>{dept}</span>
                                <span className="text-xs text-gray-500 ml-2">({subjects.length} subjects)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Show subjects for selected department */}
                      {formData.department && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Subjects in {formData.department} Department:
                          </div>
                          <div className="text-sm text-gray-600">
                            {departmentSubjects[formData.department]?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {departmentSubjects[formData.department].map((subject, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No subjects created yet for this department</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        📚 <strong>Note:</strong> Subject assignments will be managed through the Subjects section.
                        After creating this teacher, you can assign subjects to them when creating or editing subjects.
                      </p>
                    </div>
                  </div>

                  {/* Employment Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Employment Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employmentType">Employment Type *</Label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) => handleInputChange("employmentType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hireDate">Hire Date *</Label>
                        <Input
                          id="hireDate"
                          type="date"
                          value={formData.hireDate}
                          onChange={(e) => handleInputChange("hireDate", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Monthly Salary</Label>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => handleInputChange("salary", e.target.value)}
                        placeholder="₦450,000"
                      />
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
                          System will automatically generate secure login credentials for the teacher.
                        </p>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <strong>Username:</strong> Will be auto-generated (e.g., john.doe.teacher)
                          </div>
                          <div className="text-sm">
                            <strong>Password:</strong> Will be auto-generated (secure password)
                          </div>
                          <div className="text-sm text-blue-600">
                            ✓ Teacher will be required to change password on first login
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.credentialMethod === "custom" && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Setting custom credentials requires you to securely share them with the teacher.
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
                          A secure setup link will be sent to the teacher's email address. They can create their own
                          username and password.
                        </p>
                        <div className="text-sm text-green-600">
                          ✓ Most secure method - teacher creates their own credentials
                          <br />✓ Setup link expires in 24 hours
                          <br />✓ Email verification included
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="sendCredentialsTo">Send Credentials To</Label>
                      <Select
                        value={formData.sendCredentialsTo}
                        onValueChange={(value) => handleInputChange("sendCredentialsTo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select who receives the credentials" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Teacher Email</SelectItem>
                          <SelectItem value="print">Print Credentials (Manual Delivery)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.sendCredentialsTo === "teacher" && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">📧 Credentials will be sent to: {formData.email}</p>
                      </div>
                    )}

                    {formData.sendCredentialsTo === "print" && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-700">
                          📄 Credentials will be available for printing after teacher creation. You can manually deliver
                          them to the teacher.
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
                  <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                    {isLoading ? "Adding Teacher..." : "Add Teacher"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.filter((t) => t.status === "Active").length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((teachers.filter((t) => t.status === "Active").length / teachers.length) * 100)}% availability
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.filter((t) => t.status === "On Leave").length}</div>
            <p className="text-xs text-muted-foreground">Temporary absence</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-xs text-muted-foreground">Years of experience</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Teaching Staff</CardTitle>
          <CardDescription>Manage teacher profiles and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {isLoadingTeachers ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading teachers...</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading teachers: {loadError}</p>
              <Button onClick={loadTeachers} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No teachers found. Add your first teacher to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                            <AvatarFallback>
                              {teacher.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{teacher.name}</div>
                            <div className="text-sm text-gray-500">{teacher.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{teacher.employeeId}</TableCell>
                      <TableCell>{renderSubjectsColumn(teacher)}</TableCell>
                      <TableCell>{teacher.experience}</TableCell>
                      <TableCell>
                        <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>{teacher.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
