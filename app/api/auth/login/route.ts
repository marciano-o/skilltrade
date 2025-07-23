import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getUserWithPassword, verifyPassword, generateToken, getUserById } from "@/lib/auth-server"

export const dynamic = 'force-dynamic'

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    // Get user with password hash - use getUserWithPassword instead
    const dbUser = await getUserWithPassword(email)
    if (!dbUser || !dbUser.is_active) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, dbUser.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get formatted user data (without password)
    const user = await getUserById(dbUser.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}