import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Contact, Chat, Message } from './models/index.js'
import ActivityLog from './models/ActivityLog.js'

dotenv.config()

// Only Admin and one User - No mock data
const USERS = [
    {
        name: 'Nexora Admin',
        email: 'admin@nexora.io',
        password: 'Admin@123',
        role: 'admin',
        headline: 'Platform Administrator',
        bio: 'Building a community where passionate individuals connect and grow together.',
        skills: ['Community Management', 'Leadership'],
        interests: ['Tech Communities', 'Networking'],
        lookingFor: '',
        experience: 'expert'
    },
    {
        name: 'Alex Johnson',
        email: 'user@nexora.io',
        password: 'User@123',
        role: 'user',
        headline: 'Full Stack Developer',
        bio: 'Passionate about building scalable web applications.',
        skills: ['JavaScript', 'React', 'Node.js'],
        interests: ['Web Development', 'Open Source'],
        lookingFor: 'collaboration',
        experience: 'intermediate'
    }
]

async function seed() {
    try {
        console.log('🌱 Starting clean seed process...\n')

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB\n')

        // Clear ALL existing data
        console.log('🗑️  Clearing all existing data...')
        await User.deleteMany({})
        await Contact.deleteMany({})
        await Chat.deleteMany({})
        await Message.deleteMany({})
        await ActivityLog.deleteMany({})
        console.log('✅ Cleared all data\n')

        // Create users
        console.log('👥 Creating users...')
        const users = []
        for (const userData of USERS) {
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.password,
                role: userData.role,
                status: 'offline',
                avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${userData.name}`,
                headline: userData.headline,
                bio: userData.bio,
                skills: userData.skills,
                interests: userData.interests,
                lookingFor: userData.lookingFor,
                experience: userData.experience,
                profileCompleted: true
            })
            users.push(user)
            console.log(`   ✓ Created: ${user.name} (${user.email}) [${user.role}]`)
        }
        console.log(`✅ Created ${users.length} users\n`)

        // Summary
        console.log('═'.repeat(50))
        console.log('🎉 CLEAN SEED COMPLETE!')
        console.log('═'.repeat(50))
        console.log('\n🔐 ADMIN Credentials:')
        console.log('   Email: admin@nexora.io')
        console.log('   Password: Admin@123')
        console.log('\n👤 USER Credentials:')
        console.log('   Email: user@nexora.io')
        console.log('   Password: User@123')
        console.log('\n📝 Database reset to initial state.\n')

        await mongoose.connection.close()
        console.log('✅ Database connection closed')
        process.exit(0)
    } catch (error) {
        console.error('❌ Seed failed:', error)
        process.exit(1)
    }
}

seed()
