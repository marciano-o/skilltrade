import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"

async function getHandler(req: AuthenticatedRequest) {
  try {
    if (!req.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        location: req.user.location,
        occupation: req.user.occupation,
        bio: req.user.bio,
        timeCredits: req.user.timeCredits,
        profileCompletion: req.user.profileCompletion,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
        lastActive: req.user.lastActive,
      },
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
