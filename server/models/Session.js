import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    deviceInfo: {
        browser: String,
        os: String,
        device: String,
        userAgent: String
    },
    ipAddress: {
        type: String
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Index for cleanup of old sessions
sessionSchema.index({ lastActive: 1 }, { expireAfterSeconds: 604800 }) // 7 days

const Session = mongoose.model('Session', sessionSchema)
export default Session
