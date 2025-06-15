"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Users, Clock } from "lucide-react"

export function LibrarySection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-600">Manage books and library resources</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,341</div>
            <p className="text-xs text-muted-foreground">In collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">Currently out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,885</div>
            <p className="text-xs text-muted-foreground">Ready to borrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Need return</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Books</CardTitle>
          <CardDescription>Most borrowed books this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "To Kill a Mockingbird", author: "Harper Lee", borrowed: 15, available: 3 },
              { title: "1984", author: "George Orwell", borrowed: 12, available: 5 },
              { title: "The Great Gatsby", author: "F. Scott Fitzgerald", borrowed: 10, available: 2 },
            ].map((book, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline">Borrowed: {book.borrowed}</Badge>
                  <Badge variant="secondary">Available: {book.available}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
