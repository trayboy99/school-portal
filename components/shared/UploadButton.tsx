"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"

interface UploadButtonProps {
  onUpload?: (files: File[]) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  multiple?: boolean
  title?: string
  description?: string
}

export function UploadButton({
  onUpload,
  acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".png"],
  maxSize = 10,
  multiple = true,
  title = "Upload Files",
  description = "Select files to upload",
}: UploadButtonProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setError("")
    setSuccess("")

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    selectedFiles.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${maxSize}MB)`)
        return
      }

      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!acceptedTypes.includes(fileExtension)) {
        errors.push(`${file.name} has unsupported file type`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      setError(errors.join(", "))
      return
    }

    if (multiple) {
      setFiles((prev) => [...prev, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select files to upload")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError("")
    setSuccess("")

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Call the onUpload callback if provided
      if (onUpload) {
        onUpload(files)
      }

      setSuccess(`Successfully uploaded ${files.length} file(s)`)
      setFiles([])
    } catch (error) {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="file-upload">Select Files</Label>
          <Input
            id="file-upload"
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={uploading}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Accepted types: {acceptedTypes.join(", ")} (max {maxSize}MB each)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Label>Upload Progress</Label>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={uploading || files.length === 0} className="flex-1">
            {uploading ? "Uploading..." : "Upload Files"}
          </Button>
          {files.length > 0 && !uploading && (
            <Button variant="outline" onClick={() => setFiles([])}>
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
