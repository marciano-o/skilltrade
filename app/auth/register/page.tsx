"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "First name is required"
        } else if (value.trim().length < 2) {
          newErrors.firstName = "First name must be at least 2 characters"
        } else {
          delete newErrors.firstName
        }
        break

      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Last name is required"
        } else if (value.trim().length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters"
        } else {
          delete newErrors.lastName
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.email = "Email is required"
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "Password is required"
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain uppercase, lowercase, and number"
        } else {
          delete newErrors.password
        }

        // Re-validate confirm password if it exists
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
          } else {
            delete newErrors.confirmPassword
          }
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password"
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break
    }

    setErrors(newErrors)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Real-time validation
    validateField(name, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData])
    })

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false)
      return
    }

    // Check if all fields are filled
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrors({ general: "Please fill in all fields" })
      setIsSubmitting(false)
      return
    }

    try {
      const success = await register(formData)
      if (success) {
        // Show success message briefly before redirect
        setTimeout(() => {
          router.push("/profile?welcome=true")
        }, 1000)
      } else {
        setErrors({ general: "Registration failed. Please try again." })
      }
    } catch (err) {
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldStatus = (fieldName: string) => {
    const value = formData[fieldName as keyof typeof formData]
    const hasError = errors[fieldName]
    const hasValue = value && value.length > 0

    if (hasError) return "error"
    if (hasValue && !hasError) return "success"
    return "default"
  }

  const getFieldIcon = (fieldName: string) => {
    const status = getFieldStatus(fieldName)
    if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />
    return null
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to join SkillTrade and start exchanging skills</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First name *
                </label>
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-red-500" : ""}
                    placeholder="Alex"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">{getFieldIcon("firstName")}</div>
                </div>
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last name *
                </label>
                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="Johnson"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">{getFieldIcon("lastName")}</div>
                </div>
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="alex@example.com"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">{getFieldIcon("email")}</div>
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500 pr-20" : "pr-20"}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {getFieldIcon("password")}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password *
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500 pr-20" : "pr-20"}
                  placeholder="••••••••"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {getFieldIcon("confirmPassword")}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            {errors.general && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {errors.general}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
