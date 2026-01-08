import express from 'express'
import { User, Chat, Message, Contact, ActivityLog } from '../models/index.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const userId = req.user._id

        // Get total members (same college only)
        const totalMembers = await User.countDocuments({
            collegeName: req.user.collegeName
        })

        // Get user's active chats (capsules)
        const activeChats = await Chat.countDocuments({
            'members.userId': userId
        })

        // Get contacts count
        const contacts = await Contact.countDocuments({
            userId,
            status: 'accepted'
        })

        // Get pending requests
        const pendingRequests = await Contact.countDocuments({
            userId,
            status: 'pending',
            initiatedBy: { $ne: userId }
        })

        // Get messages sent this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const messagesSentThisMonth = await Message.countDocuments({
            senderId: userId,
            createdAt: { $gte: startOfMonth }
        })

        // Get messages sent last month for comparison
        const startOfLastMonth = new Date(startOfMonth)
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)

        const messagesSentLastMonth = await Message.countDocuments({
            senderId: userId,
            createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }
        })

        // Calculate engagement trend
        const engagementTrend = messagesSentLastMonth > 0
            ? Math.round(((messagesSentThisMonth - messagesSentLastMonth) / messagesSentLastMonth) * 100)
            : 100

        res.json({
            success: true,
            data: {
                totalMembers,
                activeChats,
                contacts,
                pendingRequests,
                messagesSentThisMonth,
                engagementTrend
            }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/dashboard/activity
// @desc    Get activity feed (recent messages from user's chats)
// @access  Private
router.get('/activity', protect, async (req, res) => {
    try {
        const userId = req.user._id
        const { limit = 10 } = req.query

        // Get user's chats
        const userChats = await Chat.find({ 'members.userId': userId }).select('_id')
        const chatIds = userChats.map(c => c._id)

        // Find users from the same college to ensure activity is contextually relevant
        const collegeUserIds = await User.find({ collegeName: req.user.collegeName }).select('_id')
        const collegeUserIdsList = collegeUserIds.map(u => u._id)

        // Get recent messages from these chats sent by college peers
        const recentMessages = await Message.find({
            chatId: { $in: chatIds },
            senderId: { $in: collegeUserIdsList },
            isDeleted: false
        })
            .populate('senderId', 'name avatarUrl')
            .populate('chatId', 'name type')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        // Format as activity feed
        const feed = recentMessages.map(msg => ({
            _id: msg._id,
            type: 'message',
            user: msg.senderId,
            chat: msg.chatId,
            content: msg.content,
            createdAt: msg.createdAt,
            reactions: msg.reactions?.length || 0,
            replies: 0 // Could be enhanced with reply count
        }))

        res.json({
            success: true,
            count: feed.length,
            data: feed
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/dashboard/suggestions
// @desc    Get suggested connections (users not yet connected)
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
    try {
        const userId = req.user._id
        const { limit = 5 } = req.query

        // Get existing contacts
        const existingContacts = await Contact.find({ userId }).select('contactId')
        const contactIds = existingContacts.map(c => c.contactId)

        // Find users from the same college who are not in contacts
        const suggestions = await User.find({
            _id: { $nin: [...contactIds, userId] },
            collegeName: req.user.collegeName
        })
            .select('name email avatarUrl status')
            .limit(parseInt(limit))

        res.json({
            success: true,
            count: suggestions.length,
            data: suggestions
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/dashboard/recent-chats
// @desc    Get recent chats for quick access
// @access  Private
router.get('/recent-chats', protect, async (req, res) => {
    try {
        const userId = req.user._id
        const { limit = 5 } = req.query

        const recentChats = await Chat.find({ 'members.userId': userId })
            .populate('members.userId', 'name avatarUrl status')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))

        res.json({
            success: true,
            count: recentChats.length,
            data: recentChats
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/dashboard/online-users
// @desc    Get online users for status display
// @access  Private
router.get('/online-users', protect, async (req, res) => {
    try {
        const onlineUsers = await User.find({
            status: 'online',
            _id: { $ne: req.user._id },
            collegeName: req.user.collegeName
        })
            .select('name avatarUrl status')
            .limit(10)

        res.json({
            success: true,
            count: onlineUsers.length,
            data: onlineUsers
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
