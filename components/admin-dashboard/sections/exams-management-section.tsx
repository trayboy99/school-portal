"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit, Plus, Calendar, Clock, BookOpen, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Exam {
  id: string
  name: string
  academic_year_id: number
  academic_term_id: number
  exam_date: string
  end_date: string
  status: "scheduled" | "ongoing" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  academic_years?: { name: string }
  academic_terms?: { name: string }
}

interface AcademicYear {
  id: number
  name: string
  is_current: boolean
}

interface AcademicTerm {
  id: number
  name: string
  is_current: boolean
}

export function ExamsManagementSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    academic_year_id: "",
    academic_term_id: "",
    exam_date: "",
    end_date: "",
    status: "scheduled" as "scheduled" | "ongoing" | "completed" | "cancelled",
  })
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
    fetchAcademicYears()
    fetchAcademicTerms()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/admin/exams")
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch exams",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive",
      })
    }
  }

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/admin/academic-years")
      if (response.ok) {
        const data = await response.json()
        setAcademicYears(data)
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
    }
  }

  const fetchAcademicTerms = async () => {
    try {
      const response = await fetch("/api/admin/academic-terms")
      if (response.ok) {
        const data = await response.json()
        setAcademicTerms(data)
      }
    } catch (error) {
      console.error("Error fetching academic terms:", error)
    }
  }

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate dates
    if (new Date(formData.end_date) < new Date(formData.exam_date)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      console.log("Submitting exam data:", formData)
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam created successfully",
        })
        setIsAddDialogOpen(false)
        setFormData({
          name: "",
          academic_year_id: "",
          academic_term_id: "",
          exam_date: "",
          end_date: "",
          status: "scheduled",
        })
        fetchExams()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating exam:", error)
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExam) return

    setIsLoading(true)

    // Validate dates
    if (new Date(formData.end_date) < new Date(formData.exam_date)) {
      toast({
        title: "Error",
        description: "End date cannot be before start date",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/exams/${editingExam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingExam(null)
        fetchExams()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating exam:", error)
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return

    try {
      const response = await fetch(`/api/admin/exams/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Exam deleted successfully",
        })
        fetchExams()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete exam",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting exam:", error)
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      name: exam.name,
      academic_year_id: exam.academic_year_id.toString(),
      academic_term_id: exam.academic_term_id.toString(),
      exam_date: exam.exam_date,
      end_date: exam.end_date,
      status: exam.status,
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
      ongoing: { color: "bg-yellow-100 text-yellow-800", label: "Ongoing" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const filteredExams = exams.filter((exam) => {
    const statusMatch = filterStatus === "all" || exam.status === filterStatus
    return statusMatch
  })

  const examStats = {
    total: exams.length,
    scheduled: exams.filter((e) => e.status === "scheduled").length,
    ongoing: exams.filter((e) => e.status === "ongoing").length,
    completed: exams.filter((e) => e.status === "completed").length,
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold">{examStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{examStats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-2xl font-bold">{examStats.ongoing}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{examStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Exams Management</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Exam</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <form onSubmit={handleAddExam} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Exam Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., First Term Midterm Exam"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="academic_year_id">Academic Year</Label>
                      <Select
                        value={formData.academic_year_id}
                        onValueChange={(value) => setFormData({ ...formData, academic_year_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id.toString()}>
                              {year.name} {year.is_current && "(Current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="academic_term_id">Academic Term</Label>
                      <Select
                        value={formData.academic_term_id}
                        onValueChange={(value) => setFormData({ ...formData, academic_term_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic term" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicTerms.map((term) => (
                            <SelectItem key={term.id} value={term.id.toString()}>
                              {term.name} {term.is_current && "(Current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="exam_date">Start Date</Label>
                      <Input
                        id="exam_date"
                        type="date"
                        value={formData.exam_date}
                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.exam_date}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "scheduled" | "ongoing" | "completed" | "cancelled") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Exam"}
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <div>
              <Label htmlFor="filter-status">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Exams Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{exam.academic_years?.name || "N/A"}</TableCell>
                  <TableCell>{exam.academic_terms?.name || "N/A"}</TableCell>
                  <TableCell>{new Date(exam.exam_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(exam.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(exam)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteExam(exam.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredExams.length === 0 && (
            <div className="text-center py-8 text-gray-500">No exams found matching the current filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <form onSubmit={handleEditExam} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Exam Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-academic_year_id">Academic Year</Label>
                <Select
                  value={formData.academic_year_id}
                  onValueChange={(value) => setFormData({ ...formData, academic_year_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id.toString()}>
                        {year.name} {year.is_current && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-academic_term_id">Academic Term</Label>
                <Select
                  value={formData.academic_term_id}
                  onValueChange={(value) => setFormData({ ...formData, academic_term_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic term" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicTerms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name} {term.is_current && "(Current)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-exam_date">Start Date</Label>
                <Input
                  id="edit-exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.exam_date}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "scheduled" | "ongoing" | "completed" | "cancelled") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Exam"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
