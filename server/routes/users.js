import express from 'express'
import { User, Contact } from '../models/index.js'
import { protect } from '../middleware/auth.js'
import { getCachedUser, cacheUser } from '../utils/cache.js'
import { logError } from '../utils/logger.js'
import { escapeRegex } from '../utils/textUtils.js'

const router = express.Router()

// =================================================================
// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// The /:userId route must be defined LAST to avoid matching 
// "discover", "skills", "status", "search" as userId parameters
// =================================================================

// @route   GET /api/users
// @desc    Get all users (for directory) with skill/interest filtering
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { search, skill, interest, lookingFor, experience, limit = 20, page = 1 } = req.query
        const skip = (page - 1) * limit

        const query = { _id: { $ne: req.user._id } }

        // Intra-College Filter
        if (req.user.collegeName) {
            query.collegeName = req.user.collegeName
        }

        if (search) {
            const escapedSearch = escapeRegex(search)
            query.$or = [
                { name: { $regex: escapedSearch, $options: 'i' } },
                { email: { $regex: escapedSearch, $options: 'i' } },
                { headline: { $regex: escapedSearch, $options: 'i' } },
                { skills: { $regex: escapedSearch, $options: 'i' } },
                { interests: { $regex: escapedSearch, $options: 'i' } }
            ]
        }

        if (skill) {
            query.skills = { $regex: escapeRegex(skill), $options: 'i' }
        }

        if (interest) {
            query.interests = { $regex: escapeRegex(interest), $options: 'i' }
        }

        if (lookingFor) {
            query.lookingFor = lookingFor
        }

        if (experience) {
            query.experience = experience
        }

        const users = await User.find(query)
            .select('name email avatarUrl status lastSeen headline bio skills interests lookingFor experience location department degree batch phone createdAt')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ name: 1 })

        const total = await User.countDocuments(query)

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/discover/suggestions
// @desc    Get users with matching skills/interests (suggested connections)
// @access  Private
router.get('/discover/suggestions', protect, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id)
        const { limit = 10 } = req.query

        // If user has no skills or interests, return empty array
        if ((!currentUser.skills || currentUser.skills.length === 0) &&
            (!currentUser.interests || currentUser.interests.length === 0)) {
            return res.json({
                success: true,
                count: 0,
                data: [],
                message: 'Please add skills or interests to your profile to get personalized suggestions'
            })
        }

        // Get list of existing contact IDs to exclude
        const existingContacts = await Contact.find({ userId: req.user._id })
            .select('contactId')

        const excludedIds = existingContacts.map(c => c.contactId)
        excludedIds.push(req.user._id)

        // Find users with overlapping skills or interests
        const query = {
            _id: { $nin: excludedIds },
            $or: []
        }

        // Intra-College Filter
        if (req.user.collegeName) {
            query.collegeName = req.user.collegeName
        }

        if (currentUser.skills?.length > 0) {
            // Use case-insensitive regex for each skill to ensure matches like "React" and "react"
            const skillRegexes = currentUser.skills.map(skill => new RegExp(`^${skill.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
            query.$or.push({ skills: { $in: skillRegexes } })
        }

        if (currentUser.interests?.length > 0) {
            // Use case-insensitive regex for each interest
            const interestRegexes = currentUser.interests.map(interest => new RegExp(`^${interest.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
            query.$or.push({ interests: { $in: interestRegexes } })
        }

        const suggestedUsers = await User.find(query)
            .select('name email avatarUrl headline bio skills interests lookingFor experience location status department degree batch phone')
            .limit(parseInt(limit) * 2) // Get more to filter later
            .sort({ createdAt: -1 })

        // Calculate match score for each user and filter out zero matches
        // Max possible score calculation for percentage:
        // - Skills have higher weight (15 points each, max 5 skills = 75)
        // - Interests have lower weight (10 points each, max 5 interests = 50)
        // - Total max = 100+ but we cap at 100%
        const MAX_SKILL_MATCHES = Math.min(currentUser.skills?.length || 0, 5)
        const MAX_INTEREST_MATCHES = Math.min(currentUser.interests?.length || 0, 5)
        const MAX_SCORE = (MAX_SKILL_MATCHES * 15) + (MAX_INTEREST_MATCHES * 10) || 100

        const usersWithScore = suggestedUsers
            .map(user => {
                let rawScore = 0
                let matchingSkills = []
                let matchingInterests = []

                if (currentUser.skills && user.skills) {
                    matchingSkills = currentUser.skills.filter(s =>
                        user.skills.some(us => us.toLowerCase() === s.toLowerCase())
                    )
                    rawScore += matchingSkills.length * 15 // 15 points per matching skill
                }

                if (currentUser.interests && user.interests) {
                    matchingInterests = currentUser.interests.filter(i =>
                        user.interests.some(ui => ui.toLowerCase() === i.toLowerCase())
                    )
                    rawScore += matchingInterests.length * 10 // 10 points per matching interest
                }

                // Convert to percentage (0-100), capped at 99 to avoid false 100%
                const matchScore = rawScore > 0 ? Math.min(Math.round((rawScore / MAX_SCORE) * 100), 99) : 0

                return {
                    user: user.toObject(),
                    matchScore,
                    matchingSkills,
                    matchingInterests
                }
            })
            .filter(item => item.matchScore > 0) // ONLY show users with at least 1 match
            .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
            .slice(0, parseInt(limit)) // Limit results

        res.json({
            success: true,
            count: usersWithScore.length,
            data: usersWithScore
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/skills/popular
// @desc    Get popular skills across platform
// @access  Private
router.get('/skills/popular', protect, async (req, res) => {
    try {
        const skills = await User.aggregate([
            { $match: { collegeName: req.user.collegeName || { $exists: true } } }, // Filter by college
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ])

        res.json({
            success: true,
            data: skills.map(s => ({ skill: s._id, count: s.count }))
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/interests/popular
// @desc    Get popular interests across platform
// @access  Private
router.get('/interests/popular', protect, async (req, res) => {
    try {
        const interests = await User.aggregate([
            { $match: { collegeName: req.user.collegeName || { $exists: true } } }, // Filter by college
            { $unwind: '$interests' },
            { $group: { _id: '$interests', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ])

        res.json({
            success: true,
            data: interests.map(i => ({ interest: i._id, count: i.count }))
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/status/online
// @desc    Get online users
// @access  Private
router.get('/status/online', protect, async (req, res) => {
    try {
        const onlineUsers = await User.find({
            status: 'online',
            _id: { $ne: req.user._id },
            collegeName: req.user.collegeName || { $exists: true } // Filter by college
        }).select('name avatarUrl status headline department degree batch phone')

        res.json({
            success: true,
            count: onlineUsers.length,
            data: onlineUsers
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/search/advanced
// @desc    Advanced search with multiple filters
// @access  Private
router.get('/search/advanced', protect, async (req, res) => {
    try {
        const {
            search,
            skills,
            interests,
            lookingFor,
            location,
            experience,
            availability,
            limit = 20,
            page = 1
        } = req.query

        const skip = (page - 1) * limit
        const query = { _id: { $ne: req.user._id } }

        // Start Intra-College Filter
        if (req.user.collegeName) {
            query.collegeName = req.user.collegeName
        }
        // End Intra-College Filter

        // Text search across multiple fields
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { headline: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } },
                { interests: { $regex: search, $options: 'i' } }
            ]
        }

        // Skills filter (comma-separated)
        if (skills) {
            const skillsArray = skills.split(',').filter(Boolean)
            if (skillsArray.length > 0) {
                query.skills = { $in: skillsArray }
            }
        }

        // Interests filter (comma-separated)
        if (interests) {
            const interestsArray = interests.split(',').filter(Boolean)
            if (interestsArray.length > 0) {
                query.interests = { $in: interestsArray }
            }
        }

        // Looking for filter
        if (lookingFor) {
            query.lookingFor = lookingFor
        }

        // Location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' }
        }

        // Experience filter
        if (experience) {
            query.experience = experience
        }

        // Availability filter
        if (availability) {
            query.availability = availability
        }

        const users = await User.find(query)
            .select('name email avatarUrl status lastSeen headline bio skills interests lookingFor experience location availability department degree batch phone createdAt')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 })

        const total = await User.countDocuments(query)

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// =================================================================
// PARAMETERIZED ROUTE - MUST BE LAST
// This catches /:userId so it must come after all specific routes
// =================================================================

// @route   DELETE /api/users/:userId
// @desc    Delete a user (Admin only, same college)
// @access  Private/Admin
router.delete('/:userId', protect, async (req, res) => {
    try {
        const { userId } = req.params

        // Allow only college admins to delete
        if (req.user.role !== 'college_admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' })
        }

        const userToDelete = await User.findById(userId)

        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // Ensure admin is from the same college
        if (userToDelete.collegeName !== req.user.collegeName) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete users from other institutions' })
        }

        // Prevent self-deletion
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' })
        }

        await User.findByIdAndDelete(userId)

        // Clear cache if needed (optional but good practice)
        // cacheUser.del(userId) // If using a cache that supports deletion

        res.json({
            success: true,
            message: 'User deleted successfully'
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// @route   GET /api/users/:userId
// @desc    Get single user profile
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const { userId } = req.params

        // 1. Try to get from cache
        const cachedUser = await getCachedUser(userId)
        if (cachedUser) {
            return res.json({
                success: true,
                data: cachedUser
            })
        }

        // 2. Fetch from DB if not in cache
        const user = await User.findById(userId)
            .select('name email avatarUrl status lastSeen headline bio skills interests lookingFor experience location website linkedin github department degree batch phone createdAt')

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        // Privacy Check: Ensure same college for student accounts
        if (req.user.role === 'student' && user.collegeName !== req.user.collegeName) {
            return res.status(403).json({
                success: false,
                message: 'You can only view profiles from your own institution'
            })
        }

        // 3. Cache the result
        await cacheUser(userId, user.toObject())

        res.json({
            success: true,
            data: user
        })
    } catch (error) {
        logError(error, { component: 'getUserProfile', userId: req.params.userId })
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
