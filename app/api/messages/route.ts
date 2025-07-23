import { NextResponse } from "next/server"
import { z } from "zod"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

export const dynamic = 'force-dynamic'

const sendMessageSchema = z.object({
  receiverId: z.number(),
  content: z.string().min(1).max(1000),
})

// Get conversations for user
async function getHandler(req: AuthenticatedRequest) {
  try {
    const result = await db.query(
      `
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.last_active,
        (
          SELECT content 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = other_user_id) 
             OR (sender_id = other_user_id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE (sender_id = $1 AND receiver_id = other_user_id) 
             OR (sender_id = other_user_id AND receiver_id = $1)
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = other_user_id 
            AND receiver_id = $1 
            AND is_read = FALSE
        ) as unread_count
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id 
          ELSE m.sender_id 
        END = u.id
      )
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY last_message_time DESC
    `,
      [req.user!.id],
    )

    const conversations = result.rows.map((row) => ({
      id: row.other_user_id,
      user: {
        id: row.other_user_id,
        name: `${row.first_name} ${row.last_name}`,
        avatar: row.avatar_url || "/placeholder.svg?height=40&width=40",
        status: new Date(row.last_active) > new Date(Date.now() - 5 * 60 * 1000) ? "online" : "offline",
      },
      lastMessage: {
        text: row.last_message,
        time: new Date(row.last_message_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isRead: row.unread_count === 0,
      },
      unreadCount: Number.parseInt(row.unread_count),
    }))

    return NextResponse.json({
      success: true,
      conversations,
    })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Send message
async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { receiverId, content } = sendMessageSchema.parse(body)

    // Verify receiver exists and is active
    const receiverResult = await db.query("SELECT id FROM users WHERE id = $1 AND is_active = TRUE", [receiverId])

    if (receiverResult.rows.length === 0) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Insert message
    const result = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user!.id, receiverId, content],
    )

    const message = result.rows[0]

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
        isRead: message.is_read,
        createdAt: message.created_at,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
