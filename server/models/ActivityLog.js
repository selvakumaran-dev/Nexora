import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    actionType: {
        type: String,
        enum: [
            'login', 'logout',
            'message_sent', 'message_deleted', 'message_edited',
            'chat_created', 'chat_joined', 'chat_left',
            'contact_added', 'contact_removed', 'contact_blocked',
            'profile_updated', 'settings_changed',
            'ai_query',
            'file_uploaded'
        ],
        required: true
    },
    metaData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }
})

// Index for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 })
activityLogSchema.index({ actionType: 1, timestamp: -1 })

// TTL index to auto-delete old logs after 90 days
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)
export default ActivityLog
