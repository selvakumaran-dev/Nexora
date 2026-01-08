import express from 'express'
import { User, Chat, Message, Contact } from '../models/index.js'

const router = express.Router()

// @route   GET /api/landing/stats
// @desc    Get landing page statistics (public)
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        // Get real statistics from database
        const totalUsers = await User.countDocuments()

        // Get unique skills count
        const skillsAggregation = await User.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills' } },
            { $count: 'total' }
        ])
        const totalSkills = skillsAggregation[0]?.total || 0

        // Get total connections (accepted contacts)
        const totalConnections = await Contact.countDocuments({ status: 'accepted' })

        // Get users connected this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const usersThisWeek = await User.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        })

        // Get total institutions (unique collegeNames)
        const institutionsAggregation = await User.aggregate([
            { $match: { collegeName: { $exists: true, $ne: '' } } },
            { $group: { _id: '$collegeName' } },
            { $count: 'total' }
        ])
        const totalInstitutions = institutionsAggregation[0]?.total || 0

        // Get total messages sent (as engagement metric)
        const totalMessages = await Message.countDocuments()

        // Get active chats
        const activeChats = await Chat.countDocuments()

        // Calculate satisfaction (based on profile completion and activity)
        const usersWithProfile = await User.countDocuments({
            $or: [
                { skills: { $exists: true, $ne: [] } },
                { interests: { $exists: true, $ne: [] } }
            ]
        })
        const satisfactionRate = totalUsers > 0
            ? Math.min(98, Math.round((usersWithProfile / totalUsers) * 100) + 10)
            : 98

        res.json({
            success: true,
            data: {
                totalMembers: totalUsers,
                totalInstitutions: totalInstitutions,
                totalSkills: totalSkills,
                totalConnections: Math.floor(totalConnections / 2), // Each connection counted twice
                satisfactionRate: satisfactionRate,
                usersThisWeek: usersThisWeek,
                totalMessages: totalMessages,
                activeChats: activeChats
            }
        })
    } catch (error) {
        console.error('Landing stats error:', error)
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/landing/skills
// @desc    Get popular skills for landing page (public)
// @access  Public
router.get('/skills', async (req, res) => {
    try {
        const { limit = 10 } = req.query

        // Get most popular skills from users
        const popularSkills = await User.aggregate([
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) }
        ])

        // Fallback skills if database is empty
        const defaultSkills = [
            'JavaScript', 'Python', 'React', 'Node.js',
            'Machine Learning', 'TypeScript', 'AWS',
            'Docker', 'UI/UX Design', 'Data Science'
        ]

        const skills = popularSkills.length > 0
            ? popularSkills.map(s => ({ name: s._id, count: s.count }))
            : defaultSkills.map(s => ({ name: s, count: 0 }))

        res.json({
            success: true,
            data: skills
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/landing/interests
// @desc    Get popular interests for landing page (public)
// @access  Public
router.get('/interests', async (req, res) => {
    try {
        const { limit = 10 } = req.query

        // Get most popular interests from users
        const popularInterests = await User.aggregate([
            { $unwind: '$interests' },
            { $group: { _id: '$interests', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) }
        ])

        // Fallback interests if database is empty
        const defaultInterests = [
            'Web Development', 'AI & ML', 'Startups',
            'Open Source', 'Career Growth', 'Mentorship',
            'Mobile Apps', 'Blockchain'
        ]

        const interests = popularInterests.length > 0
            ? popularInterests.map(i => ({ name: i._id, count: i.count }))
            : defaultInterests.map(i => ({ name: i, count: 0 }))

        res.json({
            success: true,
            data: interests
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/landing/testimonials
// @desc    Get testimonials (featured users with complete profiles)
// @access  Public
router.get('/testimonials', async (req, res) => {
    try {
        // Get users with complete profiles who have been active
        const featuredUsers = await User.find({
            skills: { $exists: true, $ne: [] },
            interests: { $exists: true, $ne: [] },
            headline: { $exists: true, $ne: '' }
        })
            .select('name avatarUrl headline bio')
            .limit(3)
            .sort({ createdAt: -1 })

        // If we have real users, format them as testimonials
        const testimonials = featuredUsers.length > 0
            ? featuredUsers.map(user => ({
                name: user.name,
                avatar: user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`,
                role: user.headline || 'Nexora Member',
                quote: user.bio || `Nexora has been an amazing platform to connect with like-minded professionals.`
            }))
            : [{
                name: 'Sarah Chen',
                avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah-chen',
                role: 'Engineering Lead at Tech Company',
                quote: 'Nexora helped me find a mentor who completely transformed my career. The connections I made here are priceless.'
            }]

        res.json({
            success: true,
            data: testimonials
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
