import { Pool } from "pg"

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Mock database for development (no PostgreSQL required)
const mockDatabase = {
  users: [] as any[],
  skills: [] as any[],
  matches: [] as any[],
  messages: [] as any[],
}

// Database schema types
export interface User {
  id: number
  email: string
  password_hash: string
  first_name: string
  last_name: string
  avatar_url?: string
  bio?: string
  location?: string
  occupation?: string
  website?: string
  time_credits: number
  is_verified: boolean
  is_active: boolean
  profile_completion: number
  created_at: Date
  updated_at: Date
  last_active: Date
}

export interface Skill {
  id: number
  user_id: number
  name: string
  category: string
  type: "offering" | "seeking"
  proficiency_level: number
  description?: string
  created_at: Date
}

export interface Match {
  id: number
  user1_id: number
  user2_id: number
  status: "pending" | "accepted" | "rejected"
  created_at: Date
  updated_at: Date
}

export interface Exchange {
  id: number
  match_id: number
  teacher_id: number
  student_id: number
  skill_offered: string
  skill_requested: string
  duration_minutes: number
  credits_amount: number
  status: "scheduled" | "completed" | "cancelled"
  scheduled_at?: Date
  completed_at?: Date
  rating?: number
  feedback?: string
  created_at: Date
}

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: boolean
  created_at: Date
}

export interface TimeCredit {
  id: number
  user_id: number
  amount: number
  type: "earned" | "spent" | "bonus"
  description: string
  exchange_id?: number
  created_at: Date
}

// Database utility functions
export const db = {
  query: async (text: string, params?: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log("Mock DB Query:", text, params)
      return { rows: [] }
    } else {
      return pool.query(text, params)
    }
  },
  getClient: () => {
    if (process.env.NODE_ENV === "development") {
      return {
        query: async (text: string, params?: any[]) => {
          console.log("Mock DB Client Query:", text, params)
          return { rows: [] }
        },
        release: () => {},
      }
    } else {
      return pool.connect()
    }
  },
}

// Initialize database tables
export async function initializeDatabase() {
  if (process.env.NODE_ENV === "development") {
    console.log("Mock database initialized")
  } else {
    const client = await pool.connect()

    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          avatar_url TEXT,
          bio TEXT,
          location VARCHAR(255),
          occupation VARCHAR(255),
          website VARCHAR(255),
          time_credits INTEGER DEFAULT 5,
          is_verified BOOLEAN DEFAULT FALSE,
          is_active BOOLEAN DEFAULT TRUE,
          profile_completion INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Skills table
      await client.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          type VARCHAR(20) CHECK (type IN ('offering', 'seeking')),
          proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Matches table
      await client.query(`
        CREATE TABLE IF NOT EXISTS matches (
          id SERIAL PRIMARY KEY,
          user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user1_id, user2_id)
        )
      `)

      // Exchanges table
      await client.query(`
        CREATE TABLE IF NOT EXISTS exchanges (
          id SERIAL PRIMARY KEY,
          match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
          teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          skill_offered VARCHAR(255) NOT NULL,
          skill_requested VARCHAR(255) NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          credits_amount INTEGER DEFAULT 1,
          status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
          scheduled_at TIMESTAMP,
          completed_at TIMESTAMP,
          rating INTEGER CHECK (rating BETWEEN 1 AND 5),
          feedback TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Time credits table
      await client.query(`
        CREATE TABLE IF NOT EXISTS time_credits (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          amount INTEGER NOT NULL,
          type VARCHAR(20) CHECK (type IN ('earned', 'spent', 'bonus')),
          description TEXT NOT NULL,
          exchange_id INTEGER REFERENCES exchanges(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Documents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          mime_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes for better performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
        CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(type);
        CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
        CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      `)

      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization error:", error)
      throw error
    } finally {
      client.release()
    }
  }
}
