const readline = require("readline")
const fs = require("fs")
const path = require("path")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function generateJWTSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let result = ""
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateNextAuthSecret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function setupCloudDatabase() {
  console.log("🚀 SkillTrade Cloud Database Setup")
  console.log("=====================================\n")

  console.log("Choose your cloud database provider:")
  Object.entries(cloudProviders).forEach(([key, provider]) => {
    console.log(`${key}. ${provider.name} (${provider.url})`)
  })

  const providerChoice = await new Promise((resolve) => {
    rl.question("\nEnter your choice (1-4): ", resolve)
  })

  const provider = cloudProviders[providerChoice]
  if (!provider) {
    console.log("❌ Invalid choice. Please run the script again.")
    rl.close()
    return
  }

  console.log(`\n📋 Setting up ${provider.name}`)
  console.log("=====================================")

  console.log("\nInstructions:")
  provider.instructions.forEach((instruction) => {
    console.log(`   ${instruction}`)
  })

  console.log(`\nExample connection string:`)
  console.log(`   ${provider.example}`)

  const connectionString = await new Promise((resolve) => {
    rl.question("\nPaste your database connection string: ", resolve)
  })

  if (!connectionString.startsWith("postgresql://")) {
    console.log('❌ Invalid connection string. It should start with "postgresql://"')
    rl.close()
    return
  }

  // Generate secrets
  const jwtSecret = generateJWTSecret()
  const nextAuthSecret = generateNextAuthSecret()

  // Create .env.local file
  const envContent = `# ${provider.name} Database Configuration
DATABASE_URL="${connectionString}"

# JWT Configuration
JWT_SECRET="${jwtSecret}"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Development
NODE_ENV="development"

# Generated on ${new Date().toISOString()}
`

  const envPath = path.join(process.cwd(), ".env.local")
  fs.writeFileSync(envPath, envContent)

  console.log("\n✅ .env.local file created successfully!")
  console.log("\n🧪 Testing database connection...")

  // Test connection
  try {
    const { testDatabaseConnection } = require("./test-db-connection.js")
    await testDatabaseConnection()

    console.log("\n🎉 Setup completed successfully!")
    console.log("\nNext steps:")
    console.log("   1. npm run db:init    # Initialize database tables")
    console.log("   2. npm run dev        # Start development server")
  } catch (error) {
    console.log("\n❌ Database connection test failed.")
    console.log("Please check your connection string and try again.")
    console.log("Error:", error.message)
  }

  rl.close()
}

if (require.main === module) {
  setupCloudDatabase().catch(console.error)
}

module.exports = { setupCloudDatabase }
