const { Pool } = require("pg")
require("dotenv").config({ path: ".env.local" })

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...")
  console.log("📍 Database URL:", process.env.DATABASE_URL ? "✅ Found" : "❌ Missing")

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local")
    console.log("📝 Please create .env.local file with your database connection string")
    console.log("💡 Example:")
    console.log('   DATABASE_URL="postgresql://username:password@host:5432/database"')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log("🔌 Attempting to connect to database...")
    const client = await pool.connect()

    console.log("✅ Database connection successful!")

    // Test basic query
    console.log("🧪 Testing basic query...")
    const result = await client.query("SELECT version()")
    console.log(
      "📊 PostgreSQL Version:",
      result.rows[0].version.split(" ")[0] + " " + result.rows[0].version.split(" ")[1],
    )

    // Test database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as username,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `)

    console.log("📋 Database Info:")
    console.log("   Database:", dbInfo.rows[0].database_name)
    console.log("   Username:", dbInfo.rows[0].username)
    console.log("   Server:", dbInfo.rows[0].server_ip || "localhost")
    console.log("   Port:", dbInfo.rows[0].server_port || "5432")

    // Test table creation (to verify permissions)
    console.log("🔐 Testing database permissions...")
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query(`
      INSERT INTO connection_test (test_message) VALUES ('Connection test successful')
    `)

    const testResult = await client.query(`
      SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1
    `)

    console.log("✅ Database permissions verified!")
    console.log("📝 Test record:", testResult.rows[0].test_message)

    // Clean up test table
    await client.query("DROP TABLE IF EXISTS connection_test")

    client.release()
    console.log("🎉 Database connection test completed successfully!")
    console.log("🚀 You can now run: npm run db:init")
  } catch (error) {
    console.error("❌ Database connection failed!")
    console.error("🔍 Error details:", error.message)

    if (error.code === "ENOTFOUND") {
      console.log("💡 Possible solutions:")
      console.log("   - Check if the database host is correct")
      console.log("   - Verify your internet connection")
      console.log("   - Make sure the database server is running")
    } else if (error.code === "28P01") {
      console.log("💡 Authentication failed:")
      console.log("   - Check your username and password")
      console.log("   - Verify the connection string is correct")
    } else if (error.code === "3D000") {
      console.log("💡 Database not found:")
      console.log("   - Check if the database name is correct")
      console.log("   - Make sure the database exists on the server")
    } else if (error.code === "ECONNREFUSED") {
      console.log("💡 Connection refused:")
      console.log("   - Check if the database server is running")
      console.log("   - Verify the port number is correct")
      console.log("   - Check firewall settings")
    }

    process.exit(1)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  testDatabaseConnection()
}

module.exports = { testDatabaseConnection }
