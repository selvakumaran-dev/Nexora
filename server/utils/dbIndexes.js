import mongoose from 'mongoose'
import { dbLogger } from './logger.js'

/**
 * Create optimized database indexes for common queries
 * Run this script during application startup or as a migration
 */
export const createIndexes = async () => {
    const startTime = Date.now()
    dbLogger.info('Starting database index creation...')

    try {
        const db = mongoose.connection.db

        // ============================================
        // USER INDEXES
        // ============================================
        const usersCollection = db.collection('users')

        // Only creating performance indexes not defined in schema
        await usersCollection.createIndexes([

            // Status lookup (for online users)
            {
                key: { status: 1 },
                name: 'status_lookup'
            },
            // Profile completion + looking for filtering
            {
                key: { profileCompleted: 1, lookingFor: 1 },
                name: 'profile_lookingFor_compound'
            },
            // Experience level filtering
            {
                key: { experience: 1 },
                name: 'experience_filter'
            },
            // Location-based search
            {
                key: { location: 1 },
                name: 'location_filter'
            },
            // Text search on multiple fields
            {
                key: {
                    name: 'text',
                    headline: 'text',
                    bio: 'text',
                    skills: 'text',
                    interests: 'text'
                },
                name: 'user_text_search',
                weights: {
                    name: 10,
                    headline: 5,
                    skills: 3,
                    interests: 2,
                    bio: 1
                }
            }
        ])
        dbLogger.info('✅ User indexes created')

        // ============================================
        // SESSION INDEXES
        // ============================================
        const sessionsCollection = db.collection('sessions')

        await sessionsCollection.createIndexes([
            // User sessions lookup
            {
                key: { userId: 1, isValid: 1 },
                name: 'userId_valid_compound'
            }
        ])
        dbLogger.info('✅ Session indexes created')

        // ============================================
        // CONTACT INDEXES
        // ============================================
        const contactsCollection = db.collection('contacts')

        await contactsCollection.createIndexes([
            // User's contacts lookup
            {
                key: { userId: 1, status: 1 },
                name: 'userId_status_compound'
            },
            // Pending requests lookup
            {
                key: { userId: 1, status: 1, initiatedBy: 1 },
                name: 'pending_requests_compound'
            },
            // Contact lookup by ID
            {
                key: { contactId: 1 },
                name: 'contactId_lookup'
            }
        ])
        dbLogger.info('✅ Contact indexes created')

        // ============================================
        // CHAT INDEXES
        // ============================================
        const chatsCollection = db.collection('chats')

        await chatsCollection.createIndexes([
            // User's chats lookup (most common query)
            {
                key: { 'members.userId': 1 },
                name: 'members_userId'
            },
            // User chats sorted by update time
            {
                key: { 'members.userId': 1, updatedAt: -1 },
                name: 'members_updatedAt_compound'
            },
            // Chat type filtering
            {
                key: { type: 1 },
                name: 'type_filter'
            },
            // Private chat lookup (for finding existing private chats)
            {
                key: { type: 1, 'members.userId': 1 },
                name: 'type_members_compound'
            },
            // Creator lookup
            {
                key: { createdBy: 1 },
                name: 'createdBy_lookup'
            }
        ])
        dbLogger.info('✅ Chat indexes created')

        // ============================================
        // MESSAGE INDEXES
        // ============================================
        const messagesCollection = db.collection('messages')

        await messagesCollection.createIndexes([
            // Messages by chat (primary query) - sorted by time
            {
                key: { chatId: 1, createdAt: -1 },
                name: 'chatId_createdAt_compound'
            },
            // Non-deleted messages in chat
            {
                key: { chatId: 1, isDeleted: 1, createdAt: -1 },
                name: 'chat_notDeleted_time'
            },
            // Messages by sender
            {
                key: { senderId: 1, createdAt: -1 },
                name: 'senderId_time_compound'
            },
            // Unread messages lookup
            {
                key: { chatId: 1, 'readBy.userId': 1 },
                name: 'unread_messages'
            },
            // Reply thread lookup
            {
                key: { replyTo: 1 },
                sparse: true,
                name: 'replyTo_sparse'
            }
        ])
        dbLogger.info('✅ Message indexes created')

        // ============================================
        // CODE SNIPPET INDEXES
        // ============================================
        const codeSnippetsCollection = db.collection('codesnippets')

        await codeSnippetsCollection.createIndexes([
            // Author's snippets
            {
                key: { author: 1, createdAt: -1 },
                name: 'author_time_compound'
            },
            // Shared with user
            {
                key: { sharedWith: 1 },
                name: 'sharedWith_array'
            },
            // Visibility filter
            {
                key: { visibility: 1 },
                name: 'visibility_filter'
            },
            // Public snippets by language
            {
                key: { visibility: 1, language: 1 },
                name: 'visibility_language_compound'
            },
            // Starred by user
            {
                key: { starred: 1 },
                name: 'starred_array'
            },
            // Tags search
            {
                key: { tags: 1 },
                name: 'tags_array'
            },
            // Text search on code snippets
            {
                key: {
                    title: 'text',
                    description: 'text',
                    tags: 'text'
                },
                name: 'snippet_text_search',
                weights: {
                    title: 10,
                    tags: 5,
                    description: 1
                }
            }
        ])
        dbLogger.info('✅ Code snippet indexes created')

        // ============================================
        // ACTIVITY LOG INDEXES
        // ============================================
        const activityLogsCollection = db.collection('activitylogs')

        await activityLogsCollection.createIndexes([
            // User activity lookup
            {
                key: { userId: 1, createdAt: -1 },
                name: 'userId_time_compound'
            },
            // Action type filtering
            {
                key: { actionType: 1, createdAt: -1 },
                name: 'actionType_time_compound'
            },
            // TTL index for auto-cleanup (90 days)
            {
                key: { createdAt: 1 },
                expireAfterSeconds: 7776000, // 90 days
                name: 'createdAt_ttl'
            }
        ])
        dbLogger.info('✅ Activity log indexes created')

        // ============================================
        // NOTIFICATION INDEXES
        // ============================================
        const notificationsCollection = db.collection('notifications')

        await notificationsCollection.createIndexes([
            // User notifications (most common query)
            {
                key: { recipient: 1, createdAt: -1 },
                name: 'recipient_time_compound'
            },
            // Unread notifications
            {
                key: { recipient: 1, read: 1, createdAt: -1 },
                name: 'recipient_unread_time'
            },
            // TTL index for auto-cleanup (30 days)
            {
                key: { createdAt: 1 },
                expireAfterSeconds: 2592000, // 30 days
                name: 'notification_ttl'
            }
        ])
        dbLogger.info('✅ Notification indexes created')

        const duration = Date.now() - startTime
        dbLogger.info({ duration: `${duration}ms` }, '✅ All database indexes created successfully')

        return { success: true, duration }
    } catch (error) {
        dbLogger.error({ err: error }, '❌ Error creating database indexes')
        return { success: false, error: error.message }
    }
}

/**
 * Get index statistics
 */
export const getIndexStats = async () => {
    try {
        const db = mongoose.connection.db
        const collections = ['users', 'sessions', 'contacts', 'chats', 'messages', 'codesnippets', 'activitylogs', 'notifications']

        const stats = {}

        for (const collName of collections) {
            try {
                const collection = db.collection(collName)
                const indexes = await collection.indexes()
                stats[collName] = {
                    indexCount: indexes.length,
                    indexes: indexes.map(idx => ({
                        name: idx.name,
                        key: idx.key,
                        unique: idx.unique || false,
                        sparse: idx.sparse || false
                    }))
                }
            } catch (e) {
                stats[collName] = { error: e.message }
            }
        }

        return stats
    } catch (error) {
        return { error: error.message }
    }
}

/**
 * Analyze query performance
 */
export const analyzeQuery = async (collectionName, query, options = {}) => {
    try {
        const db = mongoose.connection.db
        const collection = db.collection(collectionName)

        const explanation = await collection.find(query, options).explain('executionStats')

        return {
            queryPlanner: explanation.queryPlanner,
            executionStats: {
                nReturned: explanation.executionStats.nReturned,
                executionTimeMillis: explanation.executionStats.executionTimeMillis,
                totalDocsExamined: explanation.executionStats.totalDocsExamined,
                totalKeysExamined: explanation.executionStats.totalKeysExamined
            },
            indexUsed: explanation.queryPlanner.winningPlan.inputStage?.indexName || 'COLLSCAN'
        }
    } catch (error) {
        return { error: error.message }
    }
}

export default {
    createIndexes,
    getIndexStats,
    analyzeQuery
}
