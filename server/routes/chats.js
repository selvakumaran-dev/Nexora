import express from 'express'
import { Chat, Message, ActivityLog } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({
            'members.userId': req.user._id
        })
            .populate('members.userId', 'name avatarUrl status lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })

        // Calculate unread count for each chat
        const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
            const unreadCount = await Message.countDocuments({
                chatId: chat._id,
                senderId: { $ne: req.user._id },
                'readBy.userId': { $ne: req.user._id }
            })
            return {
                ...chat.toObject(),
                unreadCount
            }
        }))

        res.json({
            success: true,
            count: chatsWithUnread.length,
            data: chatsWithUnread
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/chats/:chatId
// @desc    Get single chat by ID
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('members.userId', 'name email avatarUrl status lastSeen')
            .populate('lastMessage')

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            })
        }

        if (!chat.isMember(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            })
        }

        res.json({
            success: true,
            data: chat
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/chats/private
// @desc    Create or get private chat with another user
// @access  Private
router.post('/private', protect, async (req, res) => {
    try {
        const { userId } = req.body

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create chat with yourself'
            })
        }

        // Check for existing private chat
        let chat = await Chat.findOne({
            type: 'private',
            'members.userId': { $all: [req.user._id, userId] }
        }).populate('members.userId', 'name avatarUrl status lastSeen')

        if (chat) {
            return res.json({
                success: true,
                data: chat,
                existing: true
            })
        }

        // Create new private chat
        chat = await Chat.create({
            type: 'private',
            createdBy: req.user._id,
            members: [
                { userId: req.user._id, role: 'member' },
                { userId, role: 'member' }
            ]
        })

        chat = await chat.populate('members.userId', 'name avatarUrl status lastSeen')

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'chat_created',
            metaData: { chatId: chat._id, type: 'private' }
        })

        res.status(201).json({
            success: true,
            data: chat,
            existing: false
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/chats/group
// @desc    Create a group chat
// @access  Private
router.post('/group', protect, async (req, res) => {
    try {
        const { name, description, memberIds } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            })
        }

        const members = [
            { userId: req.user._id, role: 'admin' },
            ...memberIds.map(id => ({ userId: id, role: 'member' }))
        ]

        const chat = await Chat.create({
            type: 'group',
            name,
            description,
            createdBy: req.user._id,
            members
        })

        await chat.populate('members.userId', 'name avatarUrl status')

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'chat_created',
            metaData: { chatId: chat._id, type: 'group', name }
        })

        res.status(201).json({
            success: true,
            data: chat
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   PUT /api/chats/:chatId
// @desc    Update group chat (name, description)
// @access  Private (Admin only)
router.put('/:chatId', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)

        if (!chat) {
            return res.status(404).json({ success: false, message: 'Chat not found' })
        }

        if (chat.type !== 'group') {
            return res.status(400).json({ success: false, message: 'Cannot update private chats' })
        }

        if (!chat.isAdmin(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Only admins can update the group' })
        }

        const { name, description, avatarUrl } = req.body
        if (name) chat.name = name
        if (description !== undefined) chat.description = description
        if (avatarUrl) chat.avatarUrl = avatarUrl

        await chat.save()
        await chat.populate('members.userId', 'name avatarUrl status')

        res.json({
            success: true,
            data: chat
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   POST /api/chats/:chatId/members
// @desc    Add members to group
// @access  Private (Admin only)
router.post('/:chatId/members', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)

        if (!chat || chat.type !== 'group') {
            return res.status(404).json({ success: false, message: 'Group not found' })
        }

        if (!chat.isAdmin(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Only admins can add members' })
        }

        const { memberIds } = req.body
        for (const id of memberIds) {
            if (!chat.isMember(id)) {
                chat.members.push({ userId: id, role: 'member' })
            }
        }

        await chat.save()
        await chat.populate('members.userId', 'name avatarUrl status')

        res.json({
            success: true,
            data: chat
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   DELETE /api/chats/:chatId/members/:userId
// @desc    Remove member from group
// @access  Private (Admin only or self)
router.delete('/:chatId/members/:userId', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
        const targetUserId = req.params.userId

        if (!chat || chat.type !== 'group') {
            return res.status(404).json({ success: false, message: 'Group not found' })
        }

        const isAdmin = chat.isAdmin(req.user._id)
        const isSelf = targetUserId === req.user._id.toString()

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ success: false, message: 'Not authorized' })
        }

        chat.members = chat.members.filter(m => m.userId.toString() !== targetUserId)
        await chat.save()

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: isSelf ? 'chat_left' : 'chat_removed_member',
            metaData: { chatId: chat._id, targetUserId }
        })

        res.json({
            success: true,
            message: isSelf ? 'Left group' : 'Member removed'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
