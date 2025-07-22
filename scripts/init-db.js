// Database initialization script
const { Pool } = require("pg")
require("dotenv").config({ path: ".env.local" })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

async function initializeDatabase() {
  const client = await pool.connect()

  try {
    console.log("🔄 Initializing SkillTrade database...")

    if (process.env.NODE_ENV === "development") {
      console.log("🗑️  Dropping existing tables...")
      await client.query("DROP TABLE IF EXISTS time_credits CASCADE")
      await client.query("DROP TABLE IF EXISTS documents CASCADE")
      await client.query("DROP TABLE IF EXISTS messages CASCADE")
      await client.query("DROP TABLE IF EXISTS exchanges CASCADE")
      await client.query("DROP TABLE IF EXISTS matches CASCADE")
      await client.query("DROP TABLE IF EXISTS skills CASCADE")
      await client.query("DROP TABLE IF EXISTS users CASCADE")
    }

    console.log("👥 Creating users table...")
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

    console.log("🎯 Creating skills table...")
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

    console.log("💕 Creating matches table...")
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

    console.log("🔄 Creating exchanges table...")
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

    console.log("💬 Creating messages table...")
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

    console.log("⏰ Creating time_credits table...")
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

    console.log("📄 Creating documents table...")
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

    console.log("📊 Creating database indexes...")
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
      CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
      CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(type);
      CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
      CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
      CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
      CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
      CREATE INDEX IF NOT EXISTS idx_time_credits_user ON time_credits(user_id);
      CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);
    `)

    if (process.env.NODE_ENV === "development") {
      console.log("🌱 Seeding sample data...")

      await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, bio, location, occupation, time_credits, profile_completion) VALUES
        ('john.doe@example.com', '$2b$10$example_hash_1', 'John', 'Doe', 'Experienced web developer passionate about teaching React and Node.js', 'San Francisco, CA', 'Software Engineer', 10, 85),
        ('jane.smith@example.com', '$2b$10$example_hash_2', 'Jane', 'Smith', 'Graphic designer with 5+ years experience. Love to share design knowledge!', 'New York, NY', 'UX Designer', 8, 90),
        ('mike.wilson@example.com', '$2b$10$example_hash_3', 'Mike', 'Wilson', 'Marketing professional looking to learn programming skills', 'Austin, TX', 'Marketing Manager', 5, 70)
        ON CONFLICT (email) DO NOTHING
      `)

      await client.query(`
        INSERT INTO skills (user_id, name, category, type, proficiency_level, description) VALUES
        (1, 'React Development', 'Programming', 'offering', 5, 'Advanced React development including hooks, context, and performance optimization'),
        (1, 'Node.js', 'Programming', 'offering', 4, 'Backend development with Express, APIs, and database integration'),
        (1, 'Graphic Design', 'Design', 'seeking', 2, 'Want to learn basic graphic design principles and tools'),
        (2, 'UI/UX Design', 'Design', 'offering', 5, 'Complete user interface and experience design process'),
        (2, 'Adobe Creative Suite', 'Design', 'offering', 4, 'Photoshop, Illustrator, and InDesign expertise'),
        (2, 'JavaScript', 'Programming', 'seeking', 3, 'Looking to improve JavaScript skills for better design-dev collaboration'),
        (3, 'Digital Marketing', 'Marketing', 'offering', 4, 'SEO, social media marketing, and content strategy'),
        (3, 'Python Programming', 'Programming', 'seeking', 1, 'Complete beginner wanting to learn Python for data analysis')
        ON CONFLICT DO NOTHING
      `)
    }

    console.log("✅ Database initialization completed successfully!")
    console.log("🚀 You can now start the development server with: npm run dev")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("🎉 Setup complete!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Setup failed:", error)
      process.exit(1)
    })
}

module.exports = { initializeDatabase }
