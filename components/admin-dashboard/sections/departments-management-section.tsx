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
import { Plus, Edit, Trash2, Building2, Search, Eye, Users, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface Department {
  id: string
  name: string
  code: string
  description: string
  head_of_department: string | null
  status: string
  created_at: string
  updated_at: string
  teachers?: {
    id: string
    first_name: string
    surname: string
  }
}

interface Teacher {
  id: string
  first_name: string
  surname: string
  email: string
  department: string
}

export function DepartmentsManagementSection() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    head_of_department: "",
    status: "Active",
  })
  const { toast } = useToast()

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/admin/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
        setFilteredDepartments(data)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/admin/teachers")
      if (response.ok) {
        const data = await response.json()
        setTeachers(data)
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Name and code are required",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingDepartment ? `/api/admin/departments/${editingDepartment.id}` : "/api/admin/departments"
      const method = editingDepartment ? "PUT" : "POST"

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
          description: responseData.message || `Department ${editingDepartment ? "updated" : "created"} successfully`,
        })
        setDialogOpen(false)
        setEditingDepartment(null)
        resetForm()
        fetchDepartments()
      } else {
        throw new Error(responseData.error || "Failed to save department")
      }
    } catch (error) {
      console.error("Error saving department:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save department",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      head_of_department: department.head_of_department || "",
      status: department.status || "Active",
    })
    setDialogOpen(true)
  }

  const handleView = (department: Department) => {
    setViewingDepartment(department)
    setViewDialogOpen(true)
  }

  const handleDelete = async (departmentId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: "DELETE",
      })

      const responseData = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Department deleted successfully",
        })
        fetchDepartments()
      } else {
        throw new Error(responseData.error || "Failed to delete department")
      }
    } catch (error) {
      console.error("Error deleting department:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete department",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      head_of_department: "",
      status: "Active",
    })
  }

  const filterDepartments = () => {
    let filtered = departments

    if (searchTerm) {
      filtered = filtered.filter(
        (dept) =>
          dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dept.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((dept) => dept.status === statusFilter)
    }

    setFilteredDepartments(filtered)
  }

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingDepartment(null)
      resetForm()
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchTeachers()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [searchTerm, statusFilter, departments])

  if (loading) {
    return <div className="text-center py-8">Loading departments...</div>
  }

  const activeDepartments = departments.filter((d) => d.status === "Active").length
  const totalDepartments = departments.length
  const departmentsWithHeads = departments.filter((d) => d.head_of_department).length

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDepartments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Department Heads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentsWithHeads}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Departments Management
              </CardTitle>
              <CardDescription>Manage school departments and their heads</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
                  <DialogDescription>
                    {editingDepartment ? "Update department information" : "Create a new department"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Department Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Mathematics"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Department Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., MATH"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the department"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="head_of_department">Head of Department</Label>
                      <Select
                        value={formData.head_of_department}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, head_of_department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department head" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No head assigned</SelectItem>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.first_name} {teacher.surname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingDepartment ? "Update" : "Create"} Department</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Departments Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head of Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{department.name}</p>
                        {department.description && (
                          <p className="text-sm text-gray-600 truncate max-w-xs">{department.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{department.code}</TableCell>
                    <TableCell>
                      {department.teachers ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {department.teachers.first_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {department.teachers.first_name} {department.teachers.surname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.status === "Active" ? "default" : "secondary"}>
                        {department.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(department)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(department)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(department.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No departments found matching your filters"
                : "No departments found"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Department Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>Complete information about the department</DialogDescription>
          </DialogHeader>
          {viewingDepartment && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department Name</Label>
                  <p className="font-medium">{viewingDepartment.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department Code</Label>
                  <p className="font-mono">{viewingDepartment.code}</p>
                </div>
              </div>

              {viewingDepartment.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p>{viewingDepartment.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Head of Department</Label>
                  {viewingDepartment.teachers ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {viewingDepartment.teachers.first_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {viewingDepartment.teachers.first_name} {viewingDepartment.teachers.surname}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-500">Not assigned</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge variant={viewingDepartment.status === "Active" ? "default" : "secondary"}>
                      {viewingDepartment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p>{new Date(viewingDepartment.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p>{new Date(viewingDepartment.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

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
