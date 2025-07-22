import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

// Get user's time credit history
async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get current balance
    const balanceResult = await db.query("SELECT time_credits FROM users WHERE id = $1", [req.user!.id])

    const currentBalance = balanceResult.rows[0]?.time_credits || 0

    // Get transaction history
    const historyResult = await db.query(
      `
      SELECT 
        tc.id,
        tc.amount,
        tc.type,
        tc.description,
        tc.created_at,
        e.skill_offered,
        e.skill_requested,
        CASE 
          WHEN e.teacher_id = $1 THEN 'taught'
          WHEN e.student_id = $1 THEN 'learned'
          ELSE NULL
        END as exchange_role
      FROM time_credits tc
      LEFT JOIN exchanges e ON tc.exchange_id = e.id
      WHERE tc.user_id = $1
      ORDER BY tc.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [req.user!.id, limit, offset],
    )

    const history = historyResult.rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      description: row.description,
      createdAt: row.created_at,
      exchange: row.skill_offered
        ? {
            skillOffered: row.skill_offered,
            skillRequested: row.skill_requested,
            role: row.exchange_role,
          }
        : null,
    }))

    return NextResponse.json({
      success: true,
      currentBalance,
      history,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit,
      },
    })
  } catch (error) {
    console.error("Get time credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
