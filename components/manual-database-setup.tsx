"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy } from "lucide-react"

export function ManualDatabaseSetup() {
  const sqlCommands = [
    "-- Create users table",
    "-- Create students table",
    "-- Create teachers table",
    "-- Create subjects table",
    "-- Create classes table",
    "-- Create exams table",
    "-- Create exam_results table",
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Database Setup</CardTitle>
        <CardDescription>If automatic setup fails, you can manually create the tables in Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">SQL Commands:</h4>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">{sqlCommands.join("\n")}</pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 bg-transparent"
              onClick={() => copyToClipboard(sqlCommands.join("\n"))}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy SQL
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Run these commands in your Supabase SQL editor:</p>
          <Button variant="outline" size="sm" asChild>
            <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Supabase Dashboard
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
