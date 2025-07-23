import { NextResponse } from "next/server"
import { z } from "zod"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { updateUser, getUserById } from "@/lib/auth-server"

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  occupation: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatarUrl: z.string().optional(),
})

async function getHandler(req: AuthenticatedRequest) {
  try {
    const user = await getUserById(req.user!.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function putHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const validatedData = updateProfileSchema.parse(body)

    const success = await updateUser(req.user!.id, validatedData)

    if (!success) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    // Get updated user data
    const user = await getUserById(req.user!.id)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const PUT = withAuth(putHandler)
