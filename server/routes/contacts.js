import express from 'express'
import { User, Contact, Chat, ActivityLog } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/contacts
// @desc    Get all contacts for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.user._id })
            .populate('contactId', 'name email avatarUrl status lastSeen')
            .sort({ updatedAt: -1 })

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/contacts/request
// @desc    Send a contact/friend request
// @access  Private
// NOTE: This version works with standalone MongoDB (no replica set required)
router.post('/request', protect, async (req, res) => {
    try {
        const { contactId } = req.body

        // Validate contactId format
        if (!contactId || !/^[0-9a-fA-F]{24}$/.test(contactId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID format'
            })
        }

        if (contactId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot add yourself as a contact'
            })
        }

        // Check if contact exists
        const targetUser = await User.findById(contactId)
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Check for existing contact (either direction)
        const existingContact = await Contact.findOne({
            $or: [
                { userId: req.user._id, contactId },
                { userId: contactId, contactId: req.user._id }
            ]
        })

        if (existingContact) {
            return res.status(400).json({
                success: false,
                message: 'Contact request already exists'
            })
        }

        // Create contact request (both directions)
        // The unique compound index will prevent duplicates if there's a race condition
        try {
            await Contact.insertMany([
                {
                    userId: req.user._id,
                    contactId,
                    status: 'pending',
                    initiatedBy: req.user._id
                },
                {
                    userId: contactId,
                    contactId: req.user._id,
                    status: 'pending',
                    initiatedBy: req.user._id
                }
            ], { ordered: false }) // ordered: false continues on error
        } catch (insertError) {
            // Handle duplicate key error (race condition)
            if (insertError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Contact request already exists'
                })
            }
            throw insertError
        }

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'contact_added',
            metaData: { targetUserId: contactId }
        })

        res.status(201).json({
            success: true,
            message: 'Contact request sent'
        })
    } catch (error) {
        // Handle duplicate key error (race condition fallback)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Contact request already exists'
            })
        }
        res.status(500).json({ success: false, message: error.message })
    }
})


// @route   PUT /api/contacts/:contactId/accept
// @desc    Accept a contact request
// @access  Private
router.put('/:contactId/accept', protect, async (req, res) => {
    try {
        const { contactId } = req.params

        // First, try to find the contact record by its ID
        let contact = await Contact.findById(contactId)

        // If not found by record ID, assume contactId is a user ID
        if (!contact) {
            contact = await Contact.findOne({
                userId: req.user._id,
                contactId: contactId,
                status: 'pending'
            })
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact request not found'
            })
        }

        // Get the other user's ID
        const otherUserId = contact.userId.toString() === req.user._id.toString()
            ? contact.contactId
            : contact.userId

        // Update both contact records to accepted
        await Contact.updateMany(
            {
                $or: [
                    { userId: req.user._id, contactId: otherUserId },
                    { userId: otherUserId, contactId: req.user._id }
                ]
            },
            { status: 'accepted' }
        )

        // Create a private chat if doesn't exist
        const existingChat = await Chat.findOne({
            type: 'private',
            'members.userId': { $all: [req.user._id, otherUserId] }
        })

        if (!existingChat) {
            await Chat.create({
                type: 'private',
                createdBy: req.user._id,
                members: [
                    { userId: req.user._id, role: 'member' },
                    { userId: otherUserId, role: 'member' }
                ]
            })
        }

        res.json({
            success: true,
            message: 'Contact request accepted'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   DELETE /api/contacts/:contactId
// @desc    Remove a contact or reject request
// @access  Private
router.delete('/:contactId', protect, async (req, res) => {
    try {
        const { contactId } = req.params

        // First, try to find the contact record by its ID
        let contact = await Contact.findById(contactId)

        // If not found by record ID, assume contactId is a user ID
        if (!contact) {
            contact = await Contact.findOne({
                $or: [
                    { userId: req.user._id, contactId: contactId },
                    { userId: contactId, contactId: req.user._id }
                ]
            })
        }

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            })
        }

        // Get the other user's ID
        const otherUserId = contact.userId.toString() === req.user._id.toString()
            ? contact.contactId
            : contact.userId

        // Delete both contact records
        await Contact.deleteMany({
            $or: [
                { userId: req.user._id, contactId: otherUserId },
                { userId: otherUserId, contactId: req.user._id }
            ]
        })

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'contact_removed',
            metaData: { targetUserId: otherUserId.toString() }
        })

        res.json({
            success: true,
            message: 'Contact removed'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/contacts/pending
// @desc    Get pending contact requests
// @access  Private
router.get('/pending', protect, async (req, res) => {
    try {
        const pending = await Contact.find({
            userId: req.user._id,
            status: 'pending',
            initiatedBy: { $ne: req.user._id }
        })
            .populate('contactId', 'name email avatarUrl')
            .populate('initiatedBy', 'name email avatarUrl')

        res.json({
            success: true,
            count: pending.length,
            data: pending
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
