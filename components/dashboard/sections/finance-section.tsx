"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react"

export function FinanceSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Manage fees, payments, and financial records</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦45.2M</div>
            <p className="text-xs text-muted-foreground">-2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦3.4M</div>
            <p className="text-xs text-muted-foreground">From 156 students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,091</div>
            <p className="text-xs text-muted-foreground">87.5% payment rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <p className="text-xs text-muted-foreground">+5.2% improvement</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest fee payments received</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { student: "John Doe", amount: "₦150,000", date: "Dec 10", status: "Completed" },
              { student: "Jane Smith", amount: "₦150,000", date: "Dec 9", status: "Completed" },
              { student: "Mike Johnson", amount: "₦75,000", date: "Dec 8", status: "Partial" },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{payment.student}</h3>
                  <p className="text-sm text-gray-600">{payment.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{payment.amount}</span>
                  <Badge variant={payment.status === "Completed" ? "default" : "secondary"}>{payment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
