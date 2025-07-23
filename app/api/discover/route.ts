import { NextResponse } from "next/server"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { db } from "@/lib/database"

export const dynamic = 'force-dynamic'

async function getHandler(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category") || ""
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50)
    const offset = Math.max(Number.parseInt(searchParams.get("offset") || "0"), 0)

    let sqlQuery = `
      SELECT 
        s.id,
        s.name,
        s.category,
        s.description,
        s.proficiency_level,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.location,
        u.occupation
      FROM skills s
      JOIN users u ON s.user_id = u.id
      WHERE s.type = 'offering' 
        AND s.user_id != $1
        AND u.is_active = TRUE
    `

    const params: any[] = [req.user!.id]
    let paramCount = 2

    if (query) {
      sqlQuery += ` AND (s.name ILIKE $${paramCount} OR s.description ILIKE $${paramCount})`
      params.push(`%${query}%`)
      paramCount++
    }

    if (category) {
      sqlQuery += ` AND s.category = $${paramCount}`
      params.push(category)
      paramCount++
    }

    sqlQuery += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(limit, offset)

    const result = await db.query(sqlQuery, params)

    const skills = result.rows.map((row) => ({
      id: row.id,
      title: row.name,
      description: row.description || `Learn ${row.name} from an experienced practitioner`,
      category: row.category,
      proficiencyLevel: row.proficiency_level,
      user: {
        id: row.user_id,
        name: `${row.first_name} ${row.last_name}`,
        avatar: row.avatar_url || "/placeholder.svg?height=40&width=40",
        location: row.location,
        occupation: row.occupation,
      },
      image: "/placeholder.svg?height=200&width=300",
      tags: [row.category, row.name],
    }))

    return NextResponse.json({
      success: true,
      skills,
      pagination: {
        limit,
        offset,
        hasMore: skills.length === limit,
      },
    })
  } catch (error) {
    console.error("Discover skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
