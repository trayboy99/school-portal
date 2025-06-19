"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, BookOpen, Layers } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export function SubjectsSection() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [isAddingNewDepartment, setIsAddingNewDepartment] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    class: "",
    teacher: "",
    department: "",
  })

  const [subjects, setSubjects] = useState([])

  const [classCategories] = useState([
    {
      id: 1,
      name: "Junior",
      classes: ["JSS 1", "JSS 2", "JSS 3"],
      order: 1,
    },
    {
      id: 2,
      name: "Senior",
      classes: ["SSS 1", "SSS 2", "SSS 3"],
      order: 2,
    },
  ])

  // Get unique departments from existing subjects
  const getUniqueDepartments = () => {
    const departments = Array.from(new Set(subjects.map((subject) => subject.department).filter(Boolean)))
    return departments.sort()
  }

  const availableDepartments = getUniqueDepartments()

  // Load teachers from database
  const loadTeachers = async () => {
    try {
      setIsLoadingTeachers(true)

      // First try the expected structure, then fallback to other possible structures
      let { data, error } = await supabase
        .from("teachers")
        .select("id, first_name, surname, employee_id, department, email, status")
        .eq("status", "Active")
        .order("first_name", { ascending: true })

      // If that fails, try with different column names
      if (error || !data || data.length === 0) {
        console.log("Trying alternative teacher table structure...")
        const { data: altData, error: altError } = await supabase.from("teachers").select("*").eq("status", "Active")

        if (altData && altData.length > 0) {
          data = altData
          error = altError
        }
      }

      if (error) {
        console.error("Error loading teachers:", error)
        setLoadError(error.message)
        return
      }

      if (data && data.length > 0) {
        console.log("Loaded teachers:", data) // Debug log

        const formattedTeachers = data.map((teacher) => ({
          id: teacher.id,
          // Handle different possible name structures
          name:
            teacher.first_name && teacher.surname
              ? `${teacher.first_name} ${teacher.surname}`
              : teacher.first_name && teacher.last_name
                ? `${teacher.first_name} ${teacher.last_name}`
                : teacher.name || `Teacher ${teacher.id}`,
          employeeId: teacher.employee_id || `EMP${teacher.id}`,
          department: teacher.department || "General",
          email: teacher.email || "",
        }))

        console.log("Formatted teachers:", formattedTeachers) // Debug log
        setTeachers(formattedTeachers)
      } else {
        console.log("No teachers found in database")
        setLoadError("No teachers found in database")
      }
    } catch (error) {
      console.error("Error loading teachers:", error)
      setLoadError("Failed to load teachers")
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  // Load subjects from database
  const loadSubjects = async () => {
    try {
      setIsLoadingSubjects(true)
      const { data, error } = await supabase.from("subjects").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading subjects:", error)
        return
      }

      if (data) {
        const formattedSubjects = data.map((subject) => ({
          id: subject.id,
          name: subject.name,
          code: subject.code,
          department: subject.department,
          teacher: subject.teacher_name || "Unassigned",
          classes: [subject.target_class],
          description: subject.description || "",
          status: subject.status,
        }))
        setSubjects(formattedSubjects)
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadTeachers()
    loadSubjects()
  }, [])

  // Generate subject ID
  const generateSubjectId = () => {
    const nextNumber = subjects.length + 1
    return `SUBJ${nextNumber.toString().padStart(3, "0")}`
  }

  const handleAddSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Find selected teacher details
      const selectedTeacher = teachers.find((t) => t.name === formData.teacher)

      // Generate subject ID
      const subjectId = generateSubjectId()

      // Prepare subject data for database
      const subjectData = {
        subject_id: subjectId,
        name: formData.name,
        code: formData.code,
        department: formData.department,
        target_class: formData.class,
        teacher_id: selectedTeacher?.id || null,
        teacher_name: formData.teacher === "unassigned" ? null : formData.teacher,
        description: "",
        status: "Active",
      }

      // Insert subject into database
      const { data, error } = await supabase.from("subjects").insert([subjectData]).select().single()

      if (error) {
        console.error("Error adding subject:", error)
        alert(`Error adding subject: ${error.message}`)
        return
      }

      // Show success message
      alert(
        `Subject added successfully!\n\nSubject ID: ${subjectId}\nSubject: ${formData.name}\nCode: ${formData.code}`,
      )

      // Reload subjects from database
      await loadSubjects()

      setIsCreateDialogOpen(false)

      // Reset form
      setFormData({
        name: "",
        code: "",
        class: "",
        teacher: "",
        department: "",
      })
      setIsAddingNewDepartment(false)
      setNewDepartmentName("")
    } catch (error) {
      console.error("Error adding subject:", error)
      alert("Failed to add subject. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubject = async () => {
    if (selectedSubject) {
      try {
        const { error } = await supabase.from("subjects").delete().eq("id", selectedSubject.id)

        if (error) {
          console.error("Error deleting subject:", error)
          alert(`Error deleting subject: ${error.message}`)
          return
        }

        // Reload subjects
        await loadSubjects()

        setIsDeleteDialogOpen(false)
        setSelectedSubject(null)
      } catch (error) {
        console.error("Error deleting subject:", error)
        alert("Failed to delete subject. Please try again.")
      }
    }
  }

  const handleEditSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (selectedSubject) {
        // Find selected teacher details
        const selectedTeacher = teachers.find((t) => t.name === formData.teacher)

        const updateData = {
          name: formData.name,
          code: formData.code,
          department: formData.department,
          target_class: formData.class,
          teacher_id: selectedTeacher?.id || null,
          teacher_name: formData.teacher === "unassigned" ? null : formData.teacher,
        }

        const { error } = await supabase.from("subjects").update(updateData).eq("id", selectedSubject.id)

        if (error) {
          console.error("Error updating subject:", error)
          alert(`Error updating subject: ${error.message}`)
          return
        }

        // Reload subjects
        await loadSubjects()

        setIsEditDialogOpen(false)
        setSelectedSubject(null)
        setFormData({
          name: "",
          code: "",
          class: "",
          teacher: "",
          department: "",
        })
        setIsAddingNewDepartment(false)
        setNewDepartmentName("")
      }
    } catch (error) {
      console.error("Error updating subject:", error)
      alert("Failed to update subject. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (subject: any) => {
    setSelectedSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code,
      class: subject.classes[0],
      teacher: subject.teacher,
      department: subject.department,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (subject: any) => {
    setSelectedSubject(subject)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (subject: any) => {
    setSelectedSubject(subject)
    setIsDeleteDialogOpen(true)
  }

  // Get unique departments from subjects
  const departments = Array.from(new Set(subjects.map((subject) => subject.department).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage academic subjects and curriculum</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Create a new subject for the curriculum. Fill in the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubject}>
              <div className="grid gap-4 py-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name *</Label>
                  <Input
                    id="subject-name"
                    name="subject-name"
                    placeholder="e.g. Advanced Mathematics"
                    className="w-full"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-code">Subject Code *</Label>
                  <Input
                    id="subject-code"
                    name="subject-code"
                    placeholder="e.g. MATH201"
                    className="w-full"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject-department">Department *</Label>
                  <Select
                    name="subject-department"
                    required
                    value={formData.department}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, department: value }))
                      setIsAddingNewDepartment(value === "new-department")
                      if (value !== "new-department") {
                        setNewDepartmentName("")
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                      <SelectItem value="new-department">+ Add New Department</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Select existing department or add new one</p>
                </div>

                {/* Show input for new department */}
                {isAddingNewDepartment && (
                  <div className="space-y-2">
                    <Label htmlFor="new-department-name">New Department Name *</Label>
                    <Input
                      id="new-department-name"
                      placeholder="e.g. Computer Science, Arts"
                      className="w-full"
                      required
                      value={newDepartmentName}
                      onChange={(e) => {
                        setNewDepartmentName(e.target.value)
                        setFormData((prev) => ({ ...prev, department: e.target.value }))
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="subject-class">Target Class *</Label>
                  <Select
                    name="subject-class"
                    required
                    value={formData.class}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classCategories
                        .sort((a, b) => a.order - b.order)
                        .map((category) => (
                          <div key={category.id}>
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                              {category.name}
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
                  <Label htmlFor="subject-teacher">Assigned Teacher *</Label>
                  <Select
                    name="subject-teacher"
                    required
                    value={formData.teacher}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, teacher: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={isLoadingTeachers ? "Loading teachers..." : "Select teacher"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Teacher Assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{teacher.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({teacher.department})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingTeachers && <p className="text-xs text-gray-500">Loading teachers from database...</p>}
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                  {isLoading ? "Adding Subject..." : "Add Subject"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Active curriculum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Academic departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Management</CardTitle>
          <CardDescription>View and manage academic subjects</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSubjects ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading subjects...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No subjects found. Add your first subject to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>
                        {subject.teacher === "Unassigned" ? (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                          >
                            Unassigned
                          </Badge>
                        ) : (
                          subject.teacher
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {subject.classes.map((cls, index) => {
                            // Define colors for different class types
                            const getClassColor = (className: string) => {
                              if (className.startsWith("JSS")) {
                                return "bg-blue-100 text-blue-800 border-blue-200"
                              } else if (className.startsWith("SSS")) {
                                return "bg-green-100 text-green-800 border-green-200"
                              } else if (className.includes("Grade")) {
                                return "bg-purple-100 text-purple-800 border-purple-200"
                              } else {
                                return "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            }

                            return (
                              <Badge key={index} variant="outline" className={`text-xs ${getClassColor(cls)}`}>
                                {cls}
                              </Badge>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(subject)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openViewDialog(subject)}>
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(subject)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
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

      {/* View Subject Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Subject Details</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject Name</h3>
                  <p className="mt-1">{selectedSubject.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Subject Code</h3>
                  <p className="mt-1">{selectedSubject.code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1">{selectedSubject.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teacher</h3>
                  <p className="mt-1">{selectedSubject.teacher}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Classes</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSubject.classes.map((cls: string, index: number) => {
                    const getClassColor = (className: string) => {
                      if (className.startsWith("JSS")) {
                        return "bg-blue-100 text-blue-800 border-blue-200"
                      } else if (className.startsWith("SSS")) {
                        return "bg-green-100 text-green-800 border-green-200"
                      } else if (className.includes("Grade")) {
                        return "bg-purple-100 text-purple-800 border-purple-200"
                      } else {
                        return "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    }

                    return (
                      <Badge key={index} variant="outline" className={`text-xs ${getClassColor(cls)}`}>
                        {cls}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedSubject.description || "No description available."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update the subject information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubject}>
            <div className="grid gap-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="edit-subject-name">Subject Name *</Label>
                <Input
                  id="edit-subject-name"
                  name="edit-subject-name"
                  placeholder="e.g. Advanced Mathematics"
                  className="w-full"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-subject-code">Subject Code *</Label>
                <Input
                  id="edit-subject-code"
                  name="edit-subject-code"
                  placeholder="e.g. MATH201"
                  className="w-full"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-department">Department *</Label>
                <Select
                  name="subject-department"
                  required
                  value={formData.department}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, department: value }))
                    setIsAddingNewDepartment(value === "new-department")
                    if (value !== "new-department") {
                      setNewDepartmentName("")
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                    <SelectItem value="new-department">+ Add New Department</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Select existing department or add new one</p>
              </div>

              {/* Show input for new department in edit dialog */}
              {isAddingNewDepartment && (
                <div className="space-y-2">
                  <Label htmlFor="edit-new-department-name">New Department Name *</Label>
                  <Input
                    id="edit-new-department-name"
                    placeholder="e.g. Computer Science, Arts"
                    className="w-full"
                    required
                    value={newDepartmentName}
                    onChange={(e) => {
                      setNewDepartmentName(e.target.value)
                      setFormData((prev) => ({ ...prev, department: e.target.value }))
                    }}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-subject-class">Target Class *</Label>
                <Select
                  name="edit-subject-class"
                  required
                  value={formData.class}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, class: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classCategories
                      .sort((a, b) => a.order - b.order)
                      .map((category) => (
                        <div key={category.id}>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">
                            {category.name}
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
                <Label htmlFor="edit-subject-teacher">Assigned Teacher *</Label>
                <Select
                  name="edit-subject-teacher"
                  required
                  value={formData.teacher}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, teacher: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No Teacher Assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{teacher.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({teacher.department})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <div className="py-4">
              <p className="font-medium">
                {selectedSubject.name} ({selectedSubject.code})
              </p>
              <p className="text-sm text-gray-500 mt-1">Department: {selectedSubject.department}</p>
              <p className="text-sm text-gray-500">Teacher: {selectedSubject.teacher}</p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteSubject}>
              Delete Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
