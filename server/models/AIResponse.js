import mongoose from 'mongoose'

const aiResponseSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
        index: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modelUsed: {
        type: String,
        required: true,
        default: 'gpt-4'
    },
    inputTokens: Number,
    outputTokens: Number,
    intentDetected: {
        type: String,
        enum: ['question', 'command', 'conversation', 'translation', 'summarization', 'other'],
        default: 'conversation'
    },
    confidenceScore: {
        type: Number,
        min: 0,
        max: 1
    },
    prompt: String,
    result: {
        type: String,
        required: true
    },
    processingTimeMs: Number,
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: Date
    }
}, {
    timestamps: true
})

// Index for analytics
aiResponseSchema.index({ userId: 1, createdAt: -1 })
aiResponseSchema.index({ modelUsed: 1 })

const AIResponse = mongoose.model('AIResponse', aiResponseSchema)
export default AIResponse
