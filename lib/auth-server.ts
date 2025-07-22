import { Pool } from "pg"

// Server-side authentication utilities using Web Crypto API
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = "7d"

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  name: string
  avatar?: string
  bio?: string
  timeCredits: number
  location?: string
  occupation?: string
  website?: string
  profileCompletion: number
  isVerified: boolean
  joinDate: string
  lastActive: string
}

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "skilltrade-salt-2024") // Better salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

// Simple JWT implementation (for development only)
export function generateToken(userId: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = btoa(
    JSON.stringify({
      userId,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    }),
  )
  const signature = btoa(`${header}.${payload}.${JWT_SECRET}`) // Simplified signature
  return `${header}.${payload}.${signature}`
}

// Verify JWT token
export function verifyToken(token: string): { userId: number } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return { userId: payload.userId }
  } catch (error) {
    return null
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<AuthUser | null> {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, avatar_url, bio, location, 
              occupation, website, time_credits, is_verified, profile_completion,
              created_at, last_active
       FROM users 
       WHERE id = $1 AND is_active = true`,
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
      avatar: user.avatar_url,
      bio: user.bio,
      timeCredits: user.time_credits,
      location: user.location,
      occupation: user.occupation,
      website: user.website,
      profileCompletion: user.profile_completion,
      isVerified: user.is_verified,
      joinDate: user.created_at.toISOString(),
      lastActive: user.last_active.toISOString(),
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Get user by email (returns raw database user for authentication)
export async function getUserByEmail(email: string): Promise<any | null> {
  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, is_active
       FROM users 
       WHERE email = $1 AND is_active = true`,
      [email.toLowerCase()],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Create new user
export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<AuthUser | null> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const hashedPassword = await hashPassword(userData.password)
    const now = new Date()

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, bio, created_at, updated_at, last_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userData.email.toLowerCase(),
        hashedPassword,
        userData.firstName,
        userData.lastName,
        `Hello! I'm ${userData.firstName}, excited to start trading skills on SkillTrade.`,
        now,
        now,
        now,
      ],
    )

    const userId = userResult.rows[0].id

    // Update profile completion
    await updateProfileCompletion(userId, client)

    await client.query("COMMIT")

    // Return the created user
    return await getUserById(userId)
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error creating user:", error)
    return null
  } finally {
    client.release()
  }
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  updates: Partial<{
    firstName: string
    lastName: string
    bio: string
    location: string
    occupation: string
    website: string
    avatarUrl: string
  }>,
): Promise<boolean> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (updates.firstName) {
      updateFields.push(`first_name = $${paramIndex}`)
      updateValues.push(updates.firstName)
      paramIndex++
    }
    if (updates.lastName) {
      updateFields.push(`last_name = $${paramIndex}`)
      updateValues.push(updates.lastName)
      paramIndex++
    }
    if (updates.bio !== undefined) {
      updateFields.push(`bio = $${paramIndex}`)
      updateValues.push(updates.bio)
      paramIndex++
    }
    if (updates.location !== undefined) {
      updateFields.push(`location = $${paramIndex}`)
      updateValues.push(updates.location)
      paramIndex++
    }
    if (updates.occupation !== undefined) {
      updateFields.push(`occupation = $${paramIndex}`)
      updateValues.push(updates.occupation)
      paramIndex++
    }
    if (updates.website !== undefined) {
      updateFields.push(`website = $${paramIndex}`)
      updateValues.push(updates.website)
      paramIndex++
    }
    if (updates.avatarUrl !== undefined) {
      updateFields.push(`avatar_url = $${paramIndex}`)
      updateValues.push(updates.avatarUrl)
      paramIndex++
    }

    if (updateFields.length === 0) return true

    updateFields.push(`updated_at = $${paramIndex}`)
    updateValues.push(new Date())
    paramIndex++

    updateFields.push(`last_active = $${paramIndex}`)
    updateValues.push(new Date())
    updateValues.push(userId)

    await client.query(`UPDATE users SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`, updateValues)

    // Update profile completion
    await updateProfileCompletion(userId, client)

    await client.query("COMMIT")
    return true
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error updating user profile:", error)
    return false
  } finally {
    client.release()
  }
}

// Calculate and update profile completion
export async function updateProfileCompletion(userId: number, client?: any): Promise<void> {
  const dbClient = client || pool

  try {
    const result = await dbClient.query(
      `SELECT first_name, last_name, email, bio, location, occupation, avatar_url
       FROM users WHERE id = $1`,
      [userId],
    )

    if (result.rows.length === 0) return

    const user = result.rows[0]
    const fields = [
      user.first_name,
      user.last_name,
      user.email,
      user.bio && user.bio.length > 20,
      user.location,
      user.occupation,
      user.avatar_url && user.avatar_url !== "/placeholder.svg?height=200&width=200",
    ]

    const completedFields = fields.filter(Boolean).length
    const completion = Math.round((completedFields / fields.length) * 100)

    await dbClient.query("UPDATE users SET profile_completion = $1 WHERE id = $2", [completion, userId])
  } catch (error) {
    console.error("Error updating profile completion:", error)
  }
}

// Update last active timestamp
export async function updateLastActive(userId: number): Promise<void> {
  try {
    await pool.query("UPDATE users SET last_active = $1 WHERE id = $2", [new Date(), userId])
  } catch (error) {
    console.error("Error updating last active:", error)
  }
}
