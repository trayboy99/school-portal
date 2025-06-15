"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Lock, Mail, Phone, UserCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    userType: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions!")
      return
    }

    // Handle signup logic here
    console.log("Signup attempt:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
        {/* Left Panel - School Branding */}
        <div className="bg-slate-900 p-8 flex flex-col justify-center items-center text-white relative">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 border-4 border-white rounded-lg flex items-center justify-center mb-6">
              <div className="text-4xl font-bold">W</div>
            </div>
          </div>

          {/* School Name */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Westminster</h1>
            <h2 className="text-4xl font-bold mb-2">College</h2>
            <h3 className="text-4xl font-bold">Lagos</h3>
          </div>

          {/* Tagline */}
          <p className="text-lg text-center opacity-90">"Nurturing Excellence, Shaping Futures."</p>

          {/* Additional Info for Signup */}
          <div className="mt-8 text-center">
            <p className="text-sm opacity-80">Join our community of educators, students, and administrators</p>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="p-8 flex flex-col justify-center max-h-screen overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Join Westminster College Portal</h3>
              <p className="text-sm text-gray-600">Fill in your details to create a new account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* User Type */}
              <div>
                <Label htmlFor="userType" className="text-sm font-medium text-gray-700">
                  User Type
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                  </div>
                  <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                    <SelectTrigger className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-9 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create Account
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
