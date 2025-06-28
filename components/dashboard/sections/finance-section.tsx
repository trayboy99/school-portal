"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Plus, Search, Filter, Download } from "lucide-react"

export function FinanceSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("All Classes")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")

  const classes = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]
  const statuses = ["Paid", "Partial", "Pending", "Overdue"]

  const feeRecords = [
    {
      id: 1,
      studentName: "John Doe",
      rollNo: "JSS1/001",
      class: "JSS 1",
      feeType: "Tuition Fee",
      amount: 50000,
      paidAmount: 50000,
      status: "Paid",
      dueDate: "2024-01-15",
      paidDate: "2024-01-10",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      rollNo: "JSS1/002",
      class: "JSS 1",
      feeType: "Tuition Fee",
      amount: 50000,
      paidAmount: 25000,
      status: "Partial",
      dueDate: "2024-01-15",
      paidDate: "2024-01-05",
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      rollNo: "JSS2/001",
      class: "JSS 2",
      feeType: "Examination Fee",
      amount: 15000,
      paidAmount: 0,
      status: "Overdue",
      dueDate: "2024-01-10",
      paidDate: null,
    },
    {
      id: 4,
      studentName: "Sarah Wilson",
      rollNo: "SS1/001",
      class: "SS 1",
      feeType: "Laboratory Fee",
      amount: 20000,
      paidAmount: 0,
      status: "Pending",
      dueDate: "2024-01-25",
      paidDate: null,
    },
  ]

  const filteredRecords = feeRecords.filter((record) => {
    return (
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedClass === "All Classes" || record.class === selectedClass) &&
      (selectedStatus === "All Statuses" || record.status === selectedStatus)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Partial":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-blue-100 text-blue-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const financeStats = {
    totalRevenue: 12500000,
    collectedThisMonth: 3200000,
    pendingPayments: 1800000,
    overdueAmount: 450000,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance Management</h2>
          <p className="text-gray-600">Track fees, payments, and financial records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Finance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financeStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financeStats.collectedThisMonth)}</div>
            <p className="text-xs text-muted-foreground">Collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financeStats.pendingPayments)}</div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financeStats.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">Past due</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Statuses">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Records
          </CardTitle>
          <CardDescription>Student payment records and outstanding fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">Roll No.</th>
                  <th className="text-left p-4 font-medium">Class</th>
                  <th className="text-left p-4 font-medium">Fee Type</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-right p-4 font-medium">Paid</th>
                  <th className="text-right p-4 font-medium">Balance</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{record.studentName}</td>
                    <td className="p-4 text-gray-600">{record.rollNo}</td>
                    <td className="p-4 text-gray-600">{record.class}</td>
                    <td className="p-4 text-gray-600">{record.feeType}</td>
                    <td className="p-4 text-right font-bold">{formatCurrency(record.amount)}</td>
                    <td className="p-4 text-right font-bold text-green-600">{formatCurrency(record.paidAmount)}</td>
                    <td className="p-4 text-right font-bold text-red-600">
                      {formatCurrency(record.amount - record.paidAmount)}
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </td>
                    <td className="p-4 text-gray-600">{record.dueDate}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {record.status !== "Paid" && <Button size="sm">Pay</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No fee records found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
