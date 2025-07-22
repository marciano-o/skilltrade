import { NextResponse } from "next/server"
import { z } from "zod"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

const createMatchSchema = z.object({
  targetUserId: z.number(),
  action: z.enum(["like", "pass"]),
})

// Get potential matches for user
async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get users who have skills that match what current user is seeking
    const result = await db.query(
      `
      SELECT DISTINCT
        u.id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.bio,
        u.location,
        u.occupation,
        array_agg(DISTINCT s_offering.name) as offering_skills,
        array_agg(DISTINCT s_seeking.name) as seeking_skills
      FROM users u
      JOIN skills s_offering ON u.id = s_offering.user_id AND s_offering.type = 'offering'
      LEFT JOIN skills s_seeking ON u.id = s_seeking.user_id AND s_seeking.type = 'seeking'
      WHERE u.id != $1
        AND u.is_active = TRUE
        AND s_offering.name IN (
          SELECT name FROM skills 
          WHERE user_id = $1 AND type = 'seeking'
        )
        AND u.id NOT IN (
          SELECT CASE 
            WHEN user1_id = $1 THEN user2_id 
            ELSE user1_id 
          END
          FROM matches 
          WHERE user1_id = $1 OR user2_id = $1
        )
      GROUP BY u.id, u.first_name, u.last_name, u.avatar_url, u.bio, u.location, u.occupation
      ORDER BY RANDOM()
      LIMIT $2
    `,
      [req.user!.id, limit],
    )

    const matches = result.rows.map((row) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      avatar: row.avatar_url || "/placeholder.svg?height=300&width=300",
      bio: row.bio || `Hi! I'm ${row.first_name}, excited to share my skills.`,
      location: row.location,
      occupation: row.occupation,
      offering: row.offering_skills.filter(Boolean),
      seeking: row.seeking_skills.filter(Boolean),
      tags: row.offering_skills.filter(Boolean).slice(0, 3),
    }))

    return NextResponse.json({
      success: true,
      matches,
    })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a match (like/pass)
async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { targetUserId, action } = createMatchSchema.parse(body)

    if (targetUserId === req.user!.id) {
      return NextResponse.json({ error: "Cannot match with yourself" }, { status: 400 })
    }

    if (action === "like") {
      // Check if target user already liked current user
      const existingMatch = await db.query("SELECT * FROM matches WHERE user1_id = $1 AND user2_id = $2", [
        targetUserId,
        req.user!.id,
      ])

      if (existingMatch.rows.length > 0) {
        // It's a mutual match! Update status
        await db.query("UPDATE matches SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
          "accepted",
          existingMatch.rows[0].id,
        ])

        return NextResponse.json({
          success: true,
          isMatch: true,
          message: "It's a match!",
        })
      } else {
        // Create new pending match
        await db.query("INSERT INTO matches (user1_id, user2_id, status) VALUES ($1, $2, $3)", [
          req.user!.id,
          targetUserId,
          "pending",
        ])

        return NextResponse.json({
          success: true,
          isMatch: false,
          message: "Like recorded",
        })
      }
    } else {
      // Just record the pass (no database entry needed for passes)
      return NextResponse.json({
        success: true,
        isMatch: false,
        message: "Pass recorded",
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Create match error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
