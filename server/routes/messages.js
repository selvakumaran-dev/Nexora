import express from 'express'
import { Chat, Message, ActivityLog } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/messages/:chatId
// @desc    Get messages for a chat (paginated)
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
    try {
        const { chatId } = req.params
        const { limit = 50, before, after } = req.query

        // Verify user is member of chat
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.isMember(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            })
        }

        // Build query
        const query = { chatId, isDeleted: false }
        if (before) query.createdAt = { $lt: new Date(before) }
        if (after) query.createdAt = { $gt: new Date(after) }

        const messages = await Message.find(query)
            .populate('senderId', 'name avatarUrl')
            .populate('replyTo')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        // Mark messages as read
        await Message.updateMany(
            {
                chatId,
                senderId: { $ne: req.user._id },
                'readBy.userId': { $ne: req.user._id }
            },
            {
                $push: { readBy: { userId: req.user._id, readAt: new Date() } }
            }
        )

        res.json({
            success: true,
            count: messages.length,
            data: messages.reverse()
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/messages/:chatId
// @desc    Send a message
// @access  Private
router.post('/:chatId', protect, async (req, res) => {
    try {
        const { chatId } = req.params
        const { content, type = 'text', attachments, replyTo } = req.body

        // Verify user is member of chat
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.isMember(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            })
        }

        // Create message
        const message = await Message.create({
            chatId,
            senderId: req.user._id,
            content,
            type,
            attachments: attachments || [],
            replyTo,
            readBy: [{ userId: req.user._id, readAt: new Date() }]
        })

        // Update chat's last message
        chat.lastMessage = message._id
        await chat.save()

        // Populate sender info
        await message.populate('senderId', 'name avatarUrl')

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'message_sent',
            metaData: { chatId, messageId: message._id }
        })

        res.status(201).json({
            success: true,
            data: message
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   PUT /api/messages/:messageId
// @desc    Edit a message
// @access  Private (Owner only)
router.put('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params
        const { content } = req.body

        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' })
        }

        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Cannot edit others\' messages' })
        }

        message.content = content
        message.isEdited = true
        message.editedAt = new Date()
        await message.save()

        await message.populate('senderId', 'name avatarUrl')

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'message_edited',
            metaData: { messageId }
        })

        res.json({
            success: true,
            data: message
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private (Owner only)
router.delete('/:messageId', protect, async (req, res) => {
    try {
        const { messageId } = req.params

        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' })
        }

        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Cannot delete others\' messages' })
        }

        message.isDeleted = true
        message.deletedAt = new Date()
        message.content = 'This message was deleted'
        await message.save()

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'message_deleted',
            metaData: { messageId }
        })

        res.json({
            success: true,
            message: 'Message deleted'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/messages/:messageId/reaction
// @desc    Add reaction to message
// @access  Private
router.post('/:messageId/reaction', protect, async (req, res) => {
    try {
        const { messageId } = req.params
        const { emoji } = req.body

        const message = await Message.findById(messageId)
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' })
        }

        // Remove existing reaction from user if any
        message.reactions = message.reactions.filter(
            r => r.userId.toString() !== req.user._id.toString()
        )

        // Add new reaction
        message.reactions.push({
            userId: req.user._id,
            emoji,
            createdAt: new Date()
        })

        await message.save()

        res.json({
            success: true,
            data: message.reactions
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
