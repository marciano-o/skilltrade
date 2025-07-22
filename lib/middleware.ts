// Authentication middleware for API routes
import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById, updateLastActive } from "./auth-server"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number
    email: string
    firstName: string
    lastName: string
    name: string
  }
}

export async function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get("authorization")?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      const user = await getUserById(decoded.userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
      }

      // Update last active timestamp
      await updateLastActive(user.id)

      // Add user to request
      ;(req as AuthenticatedRequest).user = user

      return handler(req as AuthenticatedRequest)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export function validateRequest(schema: any) {
  return (handler: (req: NextRequest, validatedData: any) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json()
        const validatedData = schema.parse(body)
        return handler(req, validatedData)
      } catch (error) {
        return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 })
      }
    }
  }
}
