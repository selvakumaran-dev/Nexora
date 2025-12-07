// Script to delete all users except one
// Run with: node cleanUsers.js

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexora'

async function cleanUsers() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('✅ Connected to MongoDB')

        const db = mongoose.connection.db

        // Get all users
        const usersCollection = db.collection('users')
        const allUsers = await usersCollection.find({}).toArray()

        console.log(`📊 Total users found: ${allUsers.length}`)

        if (allUsers.length <= 1) {
            console.log('✅ Only one or no users exist. Nothing to delete.')
            await mongoose.disconnect()
            process.exit(0)
        }

        // Keep the first user (or you can modify to keep a specific user)
        const userToKeep = allUsers[0]
        console.log(`🔒 Keeping user: ${userToKeep.name} (${userToKeep.email})`)

        // Delete all other users
        const result = await usersCollection.deleteMany({ _id: { $ne: userToKeep._id } })
        console.log(`🗑️  Deleted ${result.deletedCount} users`)

        // Also clean up related data
        const collections = ['contacts', 'messages', 'chats', 'sessions', 'activitylogs']

        for (const collName of collections) {
            try {
                const coll = db.collection(collName)
                const deleteResult = await coll.deleteMany({ userId: { $ne: userToKeep._id } })
                console.log(`   - Cleaned ${collName}: ${deleteResult.deletedCount} records`)
            } catch (e) {
                // Collection might not exist
            }
        }

        // Clean chats that don't involve the kept user
        try {
            const chatsCollection = db.collection('chats')
            await chatsCollection.deleteMany({
                participants: { $nin: [userToKeep._id] }
            })
            console.log('   - Cleaned orphan chats')
        } catch (e) { }

        console.log('\n✅ Cleanup complete!')
        console.log(`\n📋 Remaining user:`)
        console.log(`   Name: ${userToKeep.name}`)
        console.log(`   Email: ${userToKeep.email}`)
        console.log(`   ID: ${userToKeep._id}`)

        await mongoose.disconnect()
        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error.message)
        await mongoose.disconnect()
        process.exit(1)
    }
}

cleanUsers()
