"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  is_current: boolean
  created_at: string
}

interface AcademicTerm {
  id: string
  name: string
  academic_year_id: string
  start_date: string
  end_date: string
  is_active: boolean
  is_current: boolean
  description?: string
  created_at: string
}

export function AcademicCalendarSection() {
  const [activeTab, setActiveTab] = useState("years")
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [academicTerms, setAcademicTerms] = useState<AcademicTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const { toast } = useToast()

  // Form states
  const [yearForm, setYearForm] = useState({
    year_name: "",
    start_date: "",
    end_date: "",
    is_active: true,
  })

  const [termForm, setTermForm] = useState({
    term_name: "",
    academic_year_id: "",
    start_date: "",
    end_date: "",
    is_active: true,
    description: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [yearsRes, termsRes] = await Promise.all([
        fetch("/api/admin/academic-years"),
        fetch("/api/admin/academic-terms"),
      ])

      if (yearsRes.ok) {
        const yearsData = await yearsRes.json()
        setAcademicYears(yearsData)
      }

      if (termsRes.ok) {
        const termsData = await termsRes.json()
        setAcademicTerms(termsData)
      }
    } catch (error) {
      console.error("Error fetching academic calendar data:", error)
      toast({
        title: "Error",
        description: "Failed to load academic calendar data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateYear = async () => {
    try {
      const response = await fetch("/api/admin/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yearForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Academic year created successfully",
        })
        setDialogOpen(false)
        setYearForm({ year_name: "", start_date: "", end_date: "", is_active: true })
        fetchData()
      } else {
        throw new Error("Failed to create academic year")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create academic year",
        variant: "destructive",
      })
    }
  }

  const handleCreateTerm = async () => {
    try {
      const response = await fetch("/api/admin/academic-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(termForm),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Academic term created successfully",
        })
        setDialogOpen(false)
        setTermForm({
          term_name: "",
          academic_year_id: "",
          start_date: "",
          end_date: "",
          is_active: true,
          description: "",
        })
        fetchData()
      } else {
        throw new Error("Failed to create academic term")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create academic term",
        variant: "destructive",
      })
    }
  }

  const handleSetCurrent = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/admin/academic-${type}/${id}/set-current`, {
        method: "PATCH",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Current ${type.slice(0, -1)} updated successfully`,
        })
        fetchData()
      } else {
        throw new Error(`Failed to set current ${type.slice(0, -1)}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to set current ${type.slice(0, -1)}`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return

    try {
      const response = await fetch(`/api/admin/academic-${type}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type.slice(0, -1)} deleted successfully`,
        })
        fetchData()
      } else {
        throw new Error(`Failed to delete ${type.slice(0, -1)}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type.slice(0, -1)}`,
        variant: "destructive",
      })
    }
  }

  const renderYearsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Academic Years</h3>
          <p className="text-sm text-muted-foreground">Manage academic years for your institution</p>
        </div>
        <Dialog open={dialogOpen && activeTab === "years"} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab("years")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Academic Year
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
              <DialogDescription>Create a new academic year for your institution</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="year_name">Academic Year Name</Label>
                <Input
                  id="year_name"
                  placeholder="e.g., 2023-2024"
                  value={yearForm.year_name}
                  onChange={(e) => setYearForm({ ...yearForm, year_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={yearForm.start_date}
                    onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={yearForm.end_date}
                    onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={yearForm.is_active}
                  onCheckedChange={(checked) => setYearForm({ ...yearForm, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateYear}>Create Academic Year</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell className="font-medium">{year.name}</TableCell>
                  <TableCell>{new Date(year.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(year.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={year.is_active ? "default" : "secondary"}>
                      {year.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {year.is_current ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleSetCurrent("years", year.id)}>
                        Set Current
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete("years", year.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderTermsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Academic Terms</h3>
          <p className="text-sm text-muted-foreground">Manage terms within academic years</p>
        </div>
        <Dialog open={dialogOpen && activeTab === "terms"} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab("terms")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add Academic Term</DialogTitle>
              <DialogDescription>Create a new term within an academic year</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="term_name">Term Name</Label>
                  <Input
                    id="term_name"
                    placeholder="e.g., First Term, Second Term"
                    value={termForm.term_name}
                    onChange={(e) => setTermForm({ ...termForm, term_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="academic_year_id">Academic Year</Label>
                  <Select
                    value={termForm.academic_year_id}
                    onValueChange={(value) => setTermForm({ ...termForm, academic_year_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="term_start_date">Start Date</Label>
                    <Input
                      id="term_start_date"
                      type="date"
                      value={termForm.start_date}
                      onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term_end_date">End Date</Label>
                    <Input
                      id="term_end_date"
                      type="date"
                      value={termForm.end_date}
                      onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="term_description">Description (Optional)</Label>
                  <Textarea
                    id="term_description"
                    placeholder="Term description..."
                    value={termForm.description}
                    onChange={(e) => setTermForm({ ...termForm, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="term_is_active"
                    checked={termForm.is_active}
                    onCheckedChange={(checked) => setTermForm({ ...termForm, is_active: checked })}
                  />
                  <Label htmlFor="term_is_active">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTerm}>Create Term</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Term Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicTerms.map((term) => {
                const academicYear = academicYears.find((year) => year.id === term.academic_year_id)
                return (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.name}</TableCell>
                    <TableCell>{academicYear?.name || "N/A"}</TableCell>
                    <TableCell>{new Date(term.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(term.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={term.is_active ? "default" : "secondary"}>
                        {term.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {term.is_current ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleSetCurrent("terms", term.id)}>
                          Set Current
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete("terms", term.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading academic calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Calendar Settings</h2>
          <p className="text-muted-foreground">Manage academic years and terms for your institution</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium">Calendar Management</span>
        </div>
      </div>

      {/* Current Academic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Academic Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicYears.find((year) => year.is_current)?.name || "Not Set"}</div>
            <p className="text-xs text-muted-foreground">Active academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Term</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{academicTerms.find((term) => term.is_current)?.name || "Not Set"}</div>
            <p className="text-xs text-muted-foreground">Active term</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("years")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "years"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Academic Years
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "terms"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Terms
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "years" && renderYearsTab()}
      {activeTab === "terms" && renderTermsTab()}
    </div>
  )
}
