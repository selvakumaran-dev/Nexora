import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

// Compound index to prevent duplicate contacts
contactSchema.index({ userId: 1, contactId: 1 }, { unique: true })

// Static method to get mutual contacts (friends)
contactSchema.statics.getMutualContacts = async function (userId) {
    return this.find({
        userId,
        status: 'accepted'
    }).populate('contactId', 'name email avatarUrl status lastSeen')
}

const Contact = mongoose.model('Contact', contactSchema)
export default Contact
