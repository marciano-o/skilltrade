import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { db } from "./database"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  name: string
  avatarUrl?: string
  location?: string
  occupation?: string
  bio?: string
  timeCredits: number
  profileCompletion: number
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastActive: string
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  location?: string
  occupation?: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  location?: string
  occupation?: string
  bio?: string
  avatarUrl?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined")
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number }
    return decoded
  } catch {
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const hashedPassword = await hashPassword(userData.password)

  const result = await db.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, location, occupation, time_credits, is_active, profile_completion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, email, first_name, last_name, avatar_url, location, occupation, bio, time_credits, profile_completion, is_active, is_verified, created_at, last_active`,
    [
      userData.email.toLowerCase(),
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.location || null,
      userData.occupation || null,
      10,
      true,
      20,
    ],
  )

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    avatarUrl: user.avatar_url,
    location: user.location,
    occupation: user.occupation,
    bio: user.bio,
    timeCredits: user.time_credits,
    profileCompletion: user.profile_completion,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at?.toISOString() || new Date().toISOString(),
    lastActive: user.last_active?.toISOString() || new Date().toISOString(),
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(
    `SELECT id, email, first_name, last_name, avatar_url, location, occupation, bio, 
            time_credits, profile_completion, is_active, is_verified, created_at, last_active 
     FROM users WHERE email = $1 AND is_active = true`,
    [email.toLowerCase()],
  )

  if (result.rows.length === 0) return null

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    avatarUrl: user.avatar_url,
    location: user.location,
    occupation: user.occupation,
    bio: user.bio,
    timeCredits: user.time_credits,
    profileCompletion: user.profile_completion,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at?.toISOString() || new Date().toISOString(),
    lastActive: user.last_active?.toISOString() || new Date().toISOString(),
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await db.query(
    `SELECT id, email, first_name, last_name, avatar_url, location, occupation, bio, 
            time_credits, profile_completion, is_active, is_verified, created_at, last_active 
     FROM users WHERE id = $1 AND is_active = true`,
    [id],
  )

  if (result.rows.length === 0) return null

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    avatarUrl: user.avatar_url,
    location: user.location,
    occupation: user.occupation,
    bio: user.bio,
    timeCredits: user.time_credits,
    profileCompletion: user.profile_completion,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at?.toISOString() || new Date().toISOString(),
    lastActive: user.last_active?.toISOString() || new Date().toISOString(),
  }
}

export async function getUserWithPassword(email: string): Promise<any | null> {
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, is_active 
     FROM users WHERE email = $1`,
    [email.toLowerCase()],
  )

  return result.rows[0] || null
}

export async function updateUser(userId: number, updates: UpdateUserData): Promise<User | null> {
  const fields: string[] = []
  const values: any[] = []
  let paramCount = 1

  const fieldMap: Record<string, string> = {
    firstName: "first_name",
    lastName: "last_name",
    avatarUrl: "avatar_url",
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      const dbField = fieldMap[key] || key
      fields.push(`${dbField} = $${paramCount}`)
      values.push(value)
      paramCount++
    }
  })

  if (fields.length === 0) {
    return getUserById(userId)
  }

  values.push(userId)
  const query = `
    UPDATE users 
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING id, email, first_name, last_name, avatar_url, location, occupation, bio, 
              time_credits, profile_completion, is_active, is_verified, created_at, last_active
  `

  const result = await db.query(query, values)
  if (result.rows.length === 0) return null

  const user = result.rows[0]
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    avatarUrl: user.avatar_url,
    location: user.location,
    occupation: user.occupation,
    bio: user.bio,
    timeCredits: user.time_credits,
    profileCompletion: user.profile_completion,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at?.toISOString() || new Date().toISOString(),
    lastActive: user.last_active?.toISOString() || new Date().toISOString(),
  }
}

export async function updateLastActive(userId: number): Promise<void> {
  try {
    await db.query("UPDATE users SET last_active = NOW() WHERE id = $1", [userId])
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
