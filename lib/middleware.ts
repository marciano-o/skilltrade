import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, getUserById, updateLastActive, type User } from "./auth-server"

export interface AuthenticatedRequest extends NextRequest {
  user?: User
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.replace("Bearer ", "")

      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      const user = await getUserById(decoded.userId)
      if (!user || !user.isActive) {
        return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
      }

      // Update last active
      await updateLastActive(user.id)

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = user

      return handler(authenticatedReq)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}
