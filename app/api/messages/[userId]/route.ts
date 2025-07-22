import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

// Get messages between current user and specific user
async function getHandler(req: AuthenticatedRequest, { params }: { params: { userId: string } }) {
  try {
    const otherUserId = Number.parseInt(params.userId)

    if (isNaN(otherUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get messages between users
    const result = await db.query(
      `
      SELECT 
        id,
        sender_id,
        receiver_id,
        content,
        is_read,
        created_at
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `,
      [req.user!.id, otherUserId, limit, offset],
    )

    // Mark messages as read
    await db.query("UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE", [
      otherUserId,
      req.user!.id,
    ])

    const messages = result.rows.reverse().map((row) => ({
      id: row.id,
      text: row.content,
      sender: row.sender_id === req.user!.id ? "me" : "them",
      time: new Date(row.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: row.is_read ? "read" : "delivered",
    }))

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        limit,
        offset,
        hasMore: result.rows.length === limit,
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
