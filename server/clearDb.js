import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Contact, Chat, Message, ActivityLog } from './models/index.js'

dotenv.config()

async function clearDatabase() {
    try {
        console.log('🗑️  Starting database cleanup...\n')

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        // Clear ALL data
        console.log('   Deleting all Users...')
        await User.deleteMany({})

        console.log('   Deleting all Contacts...')
        await Contact.deleteMany({})

        console.log('   Deleting all Chats...')
        await Chat.deleteMany({})

        console.log('   Deleting all Messages...')
        await Message.deleteMany({})

        if (ActivityLog) {
            console.log('   Deleting all Activity Logs...')
            await ActivityLog.deleteMany({})
        }

        console.log('\n✅ Database completely cleared! (0 users)')

        await mongoose.connection.close()
        process.exit(0)
    } catch (error) {
        console.error('❌ Cleanup failed:', error)
        process.exit(1)
    }
}

clearDatabase()
