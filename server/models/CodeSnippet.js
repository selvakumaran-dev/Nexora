import mongoose from 'mongoose'

const codeSnippetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        default: 'javascript'
    },
    visibility: {
        type: String,
        enum: ['private', 'connections', 'public'],
        default: 'private'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    starred: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    copies: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Index for efficient queries
codeSnippetSchema.index({ author: 1, createdAt: -1 })
codeSnippetSchema.index({ sharedWith: 1 })
codeSnippetSchema.index({ visibility: 1 })

export default mongoose.model('CodeSnippet', codeSnippetSchema)
