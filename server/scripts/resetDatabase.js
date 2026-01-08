import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User, Session, Contact, Chat, Message, AIResponse, ActivityLog } from '../models/index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to load .env from server root (one level up)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const resetDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined. Checking .env file location...')
            // Fallback: try loading from CWD if not found above
            dotenv.config()
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI is still not defined.')
            }
        }

        console.log('Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected.')

        console.log('Clearing Users...')
        await User.deleteMany({})

        console.log('Clearing Sessions...')
        await Session.deleteMany({})

        console.log('Clearing Contacts...')
        await Contact.deleteMany({})

        console.log('Clearing Chats...')
        await Chat.deleteMany({})

        console.log('Clearing Messages...')
        await Message.deleteMany({})

        console.log('Clearing AIResponses...')
        await AIResponse.deleteMany({})

        console.log('Clearing ActivityLogs...')
        await ActivityLog.deleteMany({})

        console.log('All collections cleared. Database is fresh.')
        process.exit(0)
    } catch (error) {
        console.error('Error resetting database:', error)
        process.exit(1)
    }
}

resetDatabase()
