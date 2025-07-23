import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  name: string
  avatarUrl?: string
  bio?: string
  location?: string
  occupation?: string
  timeCredits: number
  profileCompletion: number
  isActive: boolean
  createdAt: string
  lastActive: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(userData.password)

    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, time_credits)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, time_credits, profile_completion, is_active, created_at, last_active`,
      [userData.email, hashedPassword, userData.firstName, userData.lastName, 10],
    )

    const user = result.rows[0]
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      timeCredits: user.time_credits,
      profileCompletion: user.profile_completion,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastActive: user.last_active,
    }
  } catch (error) {
    console.error("Create user error:", error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email])
    return result.rows[0] || null
  } catch (error) {
    console.error("Get user by email error:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, avatar_url, bio, location, occupation,
              time_credits, profile_completion, is_active, created_at, last_active
       FROM users WHERE id = $1`,
      [id],
    )

    const user = result.rows[0]
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location,
      occupation: user.occupation,
      timeCredits: user.time_credits,
      profileCompletion: user.profile_completion,
      isActive: user.is_active,
      createdAt: user.created_at,
      lastActive: user.last_active,
    }
  } catch (error) {
    console.error("Get user by ID error:", error)
    return null
  }
}

export async function updateUserProfile(userId: number, updates: any): Promise<boolean> {
  try {
    const fields: string[]= []
    const values: any[]= []
    let paramCount = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey =
          key === "firstName"
            ? "first_name"
            : key === "lastName"
              ? "last_name"
              : key === "avatarUrl"
                ? "avatar_url"
                : key
        fields.push(`${dbKey} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (fields.length === 0) return true

    values.push(userId)
    const query = `UPDATE users SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`

    await db.query(query, values)
    return true
  } catch (error) {
    console.error("Update user profile error:", error)
    return false
  }
}

export async function updateLastActive(userId: number): Promise<void> {
  try {
    await db.query("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [userId])
  } catch (error) {
    console.error("Update last active error:", error)
  }
}

export async function updateProfileCompletion(userId: number): Promise<void> {
  try {
    const result = await db.query(
      `SELECT 
        CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 20 ELSE 0 END +
        CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 20 ELSE 0 END +
        CASE WHEN bio IS NOT NULL AND bio != '' THEN 20 ELSE 0 END +
        CASE WHEN location IS NOT NULL AND location != '' THEN 10 ELSE 0 END +
        CASE WHEN occupation IS NOT NULL AND occupation != '' THEN 10 ELSE 0 END +
        CASE WHEN (SELECT COUNT(*) FROM skills WHERE user_id = $1) > 0 THEN 20 ELSE 0 END
        as completion
       FROM users WHERE id = $1`,
      [userId],
    )

    const completion = result.rows[0]?.completion || 0
    await db.query("UPDATE users SET profile_completion = $1 WHERE id = $2", [completion, userId])
  } catch (error) {
    console.error("Update profile completion error:", error)
  }
}

export { db }
