import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createUser, getUserByEmail, generateToken } from "@/lib/auth-server"

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    })

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
