import { NextResponse } from "next/server"
import { z } from "zod"
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware"
import { updateProfileCompletion } from "@/lib/auth-server"
import { db } from "@/lib/database"

export const dynamic = 'force-dynamic'

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().optional(),
  type: z.enum(["offering", "seeking"]),
  proficiencyLevel: z.number().min(1).max(5).optional(),
  description: z.string().optional(),
})

const bulkSkillsSchema = z.object({
  offering: z.array(z.string()),
  seeking: z.array(z.string()),
})

// Get user's skills
async function getHandler(req: AuthenticatedRequest) {
  try {
    const result = await db.query("SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC", [req.user!.id])

    const skills = {
      offering: result.rows
        .filter((skill) => skill.type === "offering")
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiency_level,
          description: skill.description,
          createdAt: skill.created_at,
        })),
      seeking: result.rows
        .filter((skill) => skill.type === "seeking")
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiency_level,
          description: skill.description,
          createdAt: skill.created_at,
        })),
    }

    return NextResponse.json({
      success: true,
      skills,
    })
  } catch (error) {
    console.error("Get skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add new skill
async function postHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const validatedData = skillSchema.parse(body)

    const result = await db.query(
      `INSERT INTO skills (user_id, name, category, type, proficiency_level, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user!.id,
        validatedData.name,
        validatedData.category || "General",
        validatedData.type,
        validatedData.proficiencyLevel || 1,
        validatedData.description,
      ],
    )

    // Update profile completion
    await updateProfileCompletion(req.user!.id)

    return NextResponse.json({
      success: true,
      skill: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        category: result.rows[0].category,
        type: result.rows[0].type,
        proficiencyLevel: result.rows[0].proficiency_level,
        description: result.rows[0].description,
        createdAt: result.rows[0].created_at,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Add skill error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Bulk update skills
async function putHandler(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { offering, seeking } = bulkSkillsSchema.parse(body)

    // Use transaction
    await db.query("BEGIN")

    try {
      // Delete existing skills
      await db.query("DELETE FROM skills WHERE user_id = $1", [req.user!.id])

      // Insert offering skills
      for (const skillName of offering) {
        await db.query("INSERT INTO skills (user_id, name, category, type) VALUES ($1, $2, $3, $4)", [
          req.user!.id,
          skillName,
          "General",
          "offering",
        ])
      }

      // Insert seeking skills
      for (const skillName of seeking) {
        await db.query("INSERT INTO skills (user_id, name, category, type) VALUES ($1, $2, $3, $4)", [
          req.user!.id,
          skillName,
          "General",
          "seeking",
        ])
      }

      await db.query("COMMIT")

      // Update profile completion
      await updateProfileCompletion(req.user!.id)

      return NextResponse.json({
        success: true,
        message: "Skills updated successfully",
      })
    } catch (error) {
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Bulk update skills error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getHandler)
export const POST = withAuth(postHandler)
export const PUT = withAuth(putHandler)
