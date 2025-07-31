"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Users, GraduationCap, Search, Plus, Eye, Edit, Trash2, RefreshCw, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Class {
  id: string
  class_name: string
  category: string
  section: string
  academic_year: string
  class_teacher_id: string
  teacher_name: string
  max_students: number
  current_students: number
  subjects_count: number
  status: string
  description: string
  created_at: string
  updated_at: string
}

interface Teacher {
  id: string
  first_name: string
  middle_name: string
  surname: string
  full_name: string
  email: string
  status: string
  assigned_classes: string[]
}

export function ClassesManagementSection() {
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    section: "",
    academic_year: "2024-2025",
    selected_teacher_id: "",
    max_students: "",
    status: "active",
    description: "",
  })

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/classes")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error("Error fetching classes:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch classes")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      setTeachersLoading(true)
      console.log("Fetching teachers for class assignment...")

      const response = await fetch("/api/admin/teachers-for-classes")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Teachers fetch error:", errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Teachers fetched successfully:", data)
      setTeachers(data)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch teachers")
    } finally {
      setTeachersLoading(false)
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setAddLoading(true)

      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        category: "",
        section: "",
        academic_year: "2024-2025",
        selected_teacher_id: "",
        max_students: "",
        status: "active",
        description: "",
      })
      setShowAddDialog(false)

      // Refresh the classes list and teachers list
      await Promise.all([fetchClasses(), fetchTeachers()])
    } catch (error) {
      console.error("Error adding class:", error)
      setError(error instanceof Error ? error.message : "Failed to add class")
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (showAddDialog) {
      console.log("Dialog opened, fetching teachers...")
      fetchTeachers()
    }
  }, [showAddDialog])

  // Filter classes based on search term and filters
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      (classItem.class_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.section || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === "all" || (classItem.category || "").toLowerCase() === categoryFilter.toLowerCase()
    const matchesStatus =
      statusFilter === "all" || (classItem.status || "").toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate statistics using the actual data from the classes table
  const totalClasses = classes.length
  const activeClasses = classes.filter((c) => c.status === "active").length

  // Calculate total students by summing up current_students from all classes
  const totalStudents = classes.reduce((sum, classItem) => {
    const studentCount = Number.parseInt(classItem.current_students?.toString() || "0") || 0
    return sum + studentCount
  }, 0)

  const totalCapacity = classes.reduce((sum, c) => sum + (c.max_students || 0), 0)

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch ((category || "").toLowerCase()) {
      case "junior":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Junior</Badge>
      case "senior":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Senior</Badge>
      default:
        return <Badge variant="outline">{category || "Unknown"}</Badge>
    }
  }

  // Get selected teacher for display
  const selectedTeacher = teachers.find((t) => t.id === formData.selected_teacher_id)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading classes...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-red-900">Error Loading Classes</h3>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
              <Button onClick={fetchClasses} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classes Management</h2>
          <p className="text-muted-foreground">Manage school classes and their details</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchClasses} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>Create a new class by filling out the form below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., JSS 1, SSS 2"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section *</Label>
                    <Select
                      value={formData.section}
                      onValueChange={(value) => setFormData({ ...formData, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academic_year">Academic Year *</Label>
                    <Input
                      id="academic_year"
                      value={formData.academic_year}
                      onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                      placeholder="e.g., 2024-2025"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="selected_teacher_id">Assign Teacher *</Label>
                    <Select
                      value={formData.selected_teacher_id}
                      onValueChange={(value) => setFormData({ ...formData, selected_teacher_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachersLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading teachers...
                          </SelectItem>
                        ) : teachers.length === 0 ? (
                          <SelectItem value="no-teachers" disabled>
                            No teachers available
                          </SelectItem>
                        ) : (
                          teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.full_name} ({teacher.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedTeacher && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTeacher.assigned_classes && selectedTeacher.assigned_classes.length > 0
                          ? `Currently teaching: ${selectedTeacher.assigned_classes.join(", ")}`
                          : "No classes currently assigned"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_students">Max Students *</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                      placeholder="e.g., 40"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter class description (optional)"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} disabled={addLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addLoading}>
                    {addLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">All classes in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClasses}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStudents}/{totalCapacity} filled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Classes</CardTitle>
          <CardDescription>Search and filter classes by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by class name, teacher, or section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classes List</CardTitle>
          <CardDescription>
            Showing {filteredClasses.length} of {totalClasses} classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                        <p className="text-muted-foreground">No classes found</p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("")
                              setCategoryFilter("all")
                              setStatusFilter("all")
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{classItem.class_name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{classItem.academic_year || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(classItem.category)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{classItem.section || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{classItem.teacher_name || "N/A"}</div>
                          <div className="text-muted-foreground">ID: {classItem.class_teacher_id || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {Number.parseInt(classItem.current_students?.toString() || "0") || 0}/
                            {classItem.max_students || 0}
                          </div>
                          <div className="text-muted-foreground">
                            {classItem.max_students > 0
                              ? Math.round(
                                  ((Number.parseInt(classItem.current_students?.toString() || "0") || 0) /
                                    classItem.max_students) *
                                    100,
                                )
                              : 0}
                            % full
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{classItem.subjects_count || 0}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(classItem.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
