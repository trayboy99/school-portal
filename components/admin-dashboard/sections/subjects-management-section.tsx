"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, Search, Plus, Eye, Edit, Trash2, RefreshCw, AlertCircle } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

interface Subject {
  id: string
  subject_code: string
  subject_name: string
  department: string
  description: string
  credit_hours: number
  class_level: string
  is_core: boolean
  is_elective: boolean
  status: string
  created_at: string
  updated_at: string
}

export function SubjectsManagementSection() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    department: "",
    description: "",
    class_level: "",
    is_core: false,
    is_elective: false,
    status: "active",
  })

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/admin/subjects")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setAddLoading(true)
      console.log("Form data being sent:", JSON.stringify(formData, null, 2))

      const response = await fetch("/api/admin/subjects", {
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
        subject_name: "",
        subject_code: "",
        department: "",
        description: "",
        class_level: "",
        is_core: false,
        is_elective: false,
        status: "active",
      })
      setShowAddDialog(false)

      // Refresh the subjects list
      await fetchSubjects()
    } catch (error) {
      console.error("Error adding subject:", error)
      setError(error instanceof Error ? error.message : "Failed to add subject")
    } finally {
      setAddLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  // Filter subjects based on search term and filters with safe string handling
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      (subject.subject_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.subject_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.department || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment =
      departmentFilter === "all" || (subject.department || "").toLowerCase() === departmentFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || (subject.status || "").toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Calculate statistics with safe handling
  const totalSubjects = subjects.length
  const activeSubjects = subjects.filter((s) => s.status === "active").length
  const coreSubjects = subjects.filter((s) => s.is_core === true).length
  const electiveSubjects = subjects.filter((s) => s.is_elective === true).length

  // Get unique departments for filter with safe handling
  const departments = Array.from(new Set(subjects.map((s) => s.department).filter(Boolean)))

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

  const getTypeBadge = (subject: Subject) => {
    if (subject.is_core) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Core</Badge>
    } else if (subject.is_elective) {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Elective</Badge>
    } else {
      return <Badge variant="outline">Regular</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading subjects...</span>
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
                <h3 className="text-lg font-medium text-red-900">Error Loading Subjects</h3>
                <p className="text-red-700 mt-2">{error}</p>
              </div>
              <Button onClick={fetchSubjects} variant="outline">
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
          <h2 className="text-2xl font-bold">Subjects Management</h2>
          <p className="text-muted-foreground">Manage academic subjects and curriculum</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchSubjects} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>Create a new subject by filling out the form below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject_code">Subject Code *</Label>
                    <Input
                      id="subject_code"
                      value={formData.subject_code}
                      onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                      placeholder="e.g., MATH001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject_name">Subject Name *</Label>
                    <Input
                      id="subject_name"
                      value={formData.subject_name}
                      onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Languages">Languages</SelectItem>
                        <SelectItem value="Social Studies">Social Studies</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class_level">Class Level *</Label>
                    <Select
                      value={formData.class_level}
                      onValueChange={(value) => setFormData({ ...formData, class_level: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Classes</SelectItem>
                        <SelectItem value="JSS">JSS (1-3)</SelectItem>
                        <SelectItem value="SSS">SSS (1-3)</SelectItem>
                        <SelectItem value="JSS 1">JSS 1</SelectItem>
                        <SelectItem value="JSS 2">JSS 2</SelectItem>
                        <SelectItem value="JSS 3">JSS 3</SelectItem>
                        <SelectItem value="SSS 1">SSS 1</SelectItem>
                        <SelectItem value="SSS 2">SSS 2</SelectItem>
                        <SelectItem value="SSS 3">SSS 3</SelectItem>
                      </SelectContent>
                    </Select>
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
                    placeholder="Enter subject description"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_core"
                      checked={formData.is_core}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_core: checked as boolean })}
                    />
                    <Label htmlFor="is_core">Core Subject</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_elective"
                      checked={formData.is_elective}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_elective: checked as boolean })}
                    />
                    <Label htmlFor="is_elective">Elective Subject</Label>
                  </div>
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
                        Add Subject
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
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">All subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubjects}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coreSubjects}</div>
            <p className="text-xs text-muted-foreground">Mandatory subjects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elective Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electiveSubjects}</div>
            <p className="text-xs text-muted-foreground">Optional subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Subjects</CardTitle>
          <CardDescription>Search and filter subjects by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by subject name, code, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
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

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects List</CardTitle>
          <CardDescription>
            Showing {filteredSubjects.length} of {totalSubjects} subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Class Level</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                        <p className="text-muted-foreground">No subjects found</p>
                        {searchTerm && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("")
                              setDepartmentFilter("all")
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
                  filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div className="font-medium">{subject.subject_code || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subject.subject_name || "N/A"}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {subject.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.department || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.class_level || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <Badge variant="outline">{subject.credit_hours || 0}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(subject)}</TableCell>
                      <TableCell>{getStatusBadge(subject.status)}</TableCell>
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
