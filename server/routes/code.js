import express from 'express'
import CodeSnippet from '../models/CodeSnippet.js'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import notificationService from '../socket/notificationService.js'
import { validate, codeSnippetSchema } from '../middleware/validators.js'

const router = express.Router()

// Get all accessible snippets (My snippets + Shared with me)
// @route   GET /api/code
// @desc    Get all code snippets accessible to the user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const snippets = await CodeSnippet.find({
            $or: [
                { author: req.user._id },
                { sharedWith: req.user._id },
                { visibility: 'public' }
            ]
        })
            .populate('author', 'name avatarUrl headline')
            .populate('sharedWith', 'name avatarUrl')
            .sort({ createdAt: -1 })

        res.json({ success: true, data: snippets })
    } catch (err) {
        console.error('Get snippets error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Create new snippet
// @route   POST /api/code
// @desc    Create a new code snippet
// @access  Private
router.post('/', protect, validate(codeSnippetSchema), async (req, res) => {
    try {
        const { title, code, language, description, visibility, sharedWith, tags } = req.body

        const snippet = await CodeSnippet.create({
            title,
            code,
            language,
            description,
            visibility,
            sharedWith: visibility === 'connections' ? sharedWith : [],
            tags,
            author: req.user._id
        })

        const populatedSnippet = await CodeSnippet.findById(snippet._id)
            .populate('author', 'name avatarUrl headline')
            .populate('sharedWith', 'name avatarUrl')

        // Notify shared users
        if (snippet.sharedWith.length > 0) {
            snippet.sharedWith.forEach(userId => {
                notificationService.createNotification(userId, {
                    type: 'code_share',
                    title: 'New Code Snippet Shared',
                    message: `${req.user.name} shared a code snippet "${title}" with you`,
                    senderId: req.user._id,
                    data: { snippetId: snippet._id }
                })
            })
        }

        res.json({ success: true, data: populatedSnippet })
    } catch (err) {
        console.error('Create snippet error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Update snippet
// @route   PUT /api/code/:id
// @desc    Update an existing code snippet
// @access  Private (owner only)
router.put('/:id', protect, validate(codeSnippetSchema), async (req, res) => {
    try {
        const snippet = await CodeSnippet.findOne({
            _id: req.params.id,
            author: req.user._id
        })

        if (!snippet) return res.status(404).json({ success: false, message: 'Snippet not found or unauthorized' })

        const { title, code, language, description, visibility, sharedWith, tags } = req.body

        snippet.title = title
        snippet.code = code
        snippet.language = language
        snippet.description = description
        snippet.visibility = visibility
        snippet.sharedWith = visibility === 'connections' ? sharedWith : []
        snippet.tags = tags

        await snippet.save()

        const updatedSnippet = await CodeSnippet.findById(snippet._id)
            .populate('author', 'name avatarUrl headline')
            .populate('sharedWith', 'name avatarUrl')

        res.json({ success: true, data: updatedSnippet })
    } catch (err) {
        console.error('Update snippet error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Delete snippet
// @route   DELETE /api/code/:id
// @desc    Delete a code snippet
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const snippet = await CodeSnippet.findOneAndDelete({
            _id: req.params.id,
            author: req.user._id
        })

        if (!snippet) return res.status(404).json({ success: false, message: 'Snippet not found or unauthorized' })

        res.json({ success: true, message: 'Snippet deleted' })
    } catch (err) {
        console.error('Delete snippet error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Toggle star
// @route   POST /api/code/:id/star
// @desc    Toggle star on a snippet
// @access  Private
router.post('/:id/star', protect, async (req, res) => {
    try {
        const snippet = await CodeSnippet.findById(req.params.id)
        if (!snippet) return res.status(404).json({ success: false, message: 'Snippet not found' })

        // Check if user has access
        const isAuthor = snippet.author.toString() === req.user._id.toString()
        const isShared = snippet.sharedWith.includes(req.user._id)
        const isPublic = snippet.visibility === 'public'

        if (!isAuthor && !isShared && !isPublic) {
            return res.status(403).json({ success: false, message: 'Access denied' })
        }

        const isStarred = snippet.starred.includes(req.user._id)

        if (isStarred) {
            snippet.starred = snippet.starred.filter(id => id.toString() !== req.user._id.toString())
        } else {
            snippet.starred.push(req.user._id)
        }

        await snippet.save()

        res.json({ success: true, starred: !isStarred })
    } catch (err) {
        console.error('Star error:', err)
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

// Increment view count
// @route   POST /api/code/:id/view
// @desc    Increment view count on a snippet
// @access  Public (no auth required for view counts)
router.post('/:id/view', async (req, res) => {
    try {
        const snippet = await CodeSnippet.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        )
        if (!snippet) {
            return res.status(404).json({ success: false, message: 'Snippet not found' })
        }
        res.json({ success: true, views: snippet.views })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' })
    }
})

export default router

