import { NextResponse, type NextRequest } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import {  updateProfileCompletion } from "@/lib/auth-server"
import { db } from "@/lib/database"

// Delete skill
async function deleteHandler(req: AuthenticatedRequest, context: { params: { id: string } }) {
  try {
    const skillId = Number.parseInt(context.params.id)

    if (isNaN(skillId)) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 })
    }

    // Verify skill belongs to user
    const checkResult = await db.query("SELECT id FROM skills WHERE id = $1 AND user_id = $2", [skillId, req.user!.id])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Delete skill
    await db.query("DELETE FROM skills WHERE id = $1", [skillId])

    // Update profile completion
    await updateProfileCompletion(req.user!.id)

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully",
    })
  } catch (error) {
    console.error("Delete skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const DELETE = (req: NextRequest, context: { params: { id: string } }) =>
  withAuth((authReq: AuthenticatedRequest) => deleteHandler(authReq, context))(req)
