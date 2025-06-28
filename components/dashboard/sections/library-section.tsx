"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Filter, Plus, Download, Calendar, User } from "lucide-react"

export function LibrarySection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")

  const categories = ["Fiction", "Non-Fiction", "Science", "Mathematics", "History", "Literature", "Reference"]
  const statuses = ["Available", "Borrowed", "Reserved", "Maintenance"]

  const books = [
    {
      id: 1,
      title: "Introduction to Mathematics",
      author: "Dr. John Smith",
      isbn: "978-0123456789",
      category: "Mathematics",
      status: "Available",
      copies: 5,
      borrowedBy: null,
      dueDate: null,
    },
    {
      id: 2,
      title: "World History",
      author: "Prof. Jane Doe",
      isbn: "978-0987654321",
      category: "History",
      status: "Borrowed",
      copies: 3,
      borrowedBy: "John Doe (JSS1/001)",
      dueDate: "2024-01-25",
    },
    {
      id: 3,
      title: "English Literature",
      author: "William Shakespeare",
      isbn: "978-0456789123",
      category: "Literature",
      status: "Available",
      copies: 8,
      borrowedBy: null,
      dueDate: null,
    },
    {
      id: 4,
      title: "Basic Science Principles",
      author: "Dr. Sarah Wilson",
      isbn: "978-0789123456",
      category: "Science",
      status: "Reserved",
      copies: 2,
      borrowedBy: "Jane Smith (JSS2/005)",
      dueDate: "2024-01-20",
    },
  ]

  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All Categories" || book.category === selectedCategory) &&
      (selectedStatus === "All Statuses" || book.status === selectedStatus)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Borrowed":
        return "bg-blue-100 text-blue-800"
      case "Reserved":
        return "bg-yellow-100 text-yellow-800"
      case "Maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const libraryStats = {
    totalBooks: 1250,
    availableBooks: 980,
    borrowedBooks: 245,
    overdueBooks: 25,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
          <p className="text-gray-600">Manage books, borrowing, and library resources</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Catalog
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      {/* Library Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">In library catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{libraryStats.availableBooks}</div>
            <p className="text-xs text-muted-foreground">Ready to borrow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{libraryStats.borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">Currently borrowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{libraryStats.overdueBooks}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
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
              <Label htmlFor="search">Search Books</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Library Catalog
          </CardTitle>
          <CardDescription>Manage books and borrowing records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Author</th>
                  <th className="text-left p-4 font-medium">ISBN</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-center p-4 font-medium">Copies</th>
                  <th className="text-center p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Borrowed By</th>
                  <th className="text-left p-4 font-medium">Due Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{book.title}</td>
                    <td className="p-4 text-gray-600">{book.author}</td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{book.isbn}</td>
                    <td className="p-4 text-gray-600">{book.category}</td>
                    <td className="p-4 text-center font-bold">{book.copies}</td>
                    <td className="p-4 text-center">
                      <Badge className={getStatusColor(book.status)}>{book.status}</Badge>
                    </td>
                    <td className="p-4 text-gray-600">{book.borrowedBy || "-"}</td>
                    <td className="p-4 text-gray-600">{book.dueDate || "-"}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {book.status === "Available" && <Button size="sm">Lend</Button>}
                        {book.status === "Borrowed" && (
                          <Button size="sm" variant="secondary">
                            Return
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No books found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
