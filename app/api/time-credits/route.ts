import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

async function getHandler(req: AuthenticatedRequest) {
  try {
    // Get user's current time credits
    const userResult = await db.query("SELECT time_credits FROM users WHERE id = $1", [req.user!.id])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent transactions
    const transactionsResult = await db.query(
      `SELECT 
        tc.id,
        tc.amount,
        tc.type,
        tc.description,
        tc.created_at,
        u.first_name,
        u.last_name
       FROM time_credit_transactions tc
       LEFT JOIN users u ON tc.related_user_id = u.id
       WHERE tc.user_id = $1
       ORDER BY tc.created_at DESC
       LIMIT 20`,
      [req.user!.id],
    )

    const transactions = transactionsResult.rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      relatedUser: row.first_name ? `${row.first_name} ${row.last_name}` : null,
      createdAt: row.created_at,
    }))

    return NextResponse.json({
      success: true,
      timeCredits: userResult.rows[0].time_credits,
      transactions,
    })
  } catch (error) {
    console.error("Get time credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
