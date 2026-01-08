import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['private', 'group'],
        required: true
    },
    name: {
        type: String,
        trim: true,
        maxlength: 100,
        // Required only for group chats
        required: function () { return this.type === 'group' }
    },
    description: {
        type: String,
        maxlength: 500
    },
    avatarUrl: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        lastRead: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    pinnedMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    settings: {
        muteNotifications: { type: Boolean, default: false },
        onlyAdminsCanPost: { type: Boolean, default: false }
    }
}, {
    timestamps: true
})

// Index for faster member lookup
chatSchema.index({ 'members.userId': 1 })
chatSchema.index({ createdBy: 1 })

// Virtual for member count
chatSchema.virtual('memberCount').get(function () {
    return this.members.length
})

// Method to check if user is member
chatSchema.methods.isMember = function (userId) {
    return this.members.some(m => m.userId.toString() === userId.toString())
}

// Method to check if user is admin
chatSchema.methods.isAdmin = function (userId) {
    const member = this.members.find(m => m.userId.toString() === userId.toString())
    return member && member.role === 'admin'
}

const Chat = mongoose.model('Chat', chatSchema)
export default Chat
