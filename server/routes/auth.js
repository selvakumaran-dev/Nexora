import express from 'express'
import passport from 'passport'
import { User, Session, ActivityLog } from '../models/index.js'
import { generateToken, protect } from '../middleware/auth.js'
import { cacheSession, cacheUser, invalidateSession, invalidateUserSessions, invalidateUser } from '../utils/cache.js'
import { logInfo, logError } from '../utils/logger.js'
import { validate, registerSchema, loginSchema, passwordChangeSchema, profileUpdateSchema } from '../middleware/validators.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { name, email, password, role, collegeName, collegeCode, address, phone, website, department, degree, batch } = req.body

        let finalEmail = email
        let finalCollegeCode = collegeCode
        let finalCollegeName = collegeName
        let finalRole = role || 'student'

        // Intra-College Logic
        if (finalRole === 'college_admin') {
            // Generate unique college code for the admin
            const codePrefix = (collegeName || 'CLG').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
            const randomNum = Math.floor(1000 + Math.random() * 9000)
            finalCollegeCode = `${codePrefix}${randomNum}`
            finalCollegeName = collegeName
        } else if (finalRole === 'student') {
            // Verify college code exists
            const adminUser = await User.findOne({
                role: 'college_admin',
                collegeCode: collegeCode ? collegeCode.toUpperCase() : ''
            })

            if (!adminUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid College Code. Please contact your administrator.'
                })
            }
            finalCollegeCode = adminUser.collegeCode
            finalCollegeName = adminUser.collegeName
        }

        // Check if user exists with this email
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            })
        }

        // Create user with final email and college details
        const user = await User.create({
            name,
            email: finalEmail,
            passwordHash: password,
            role: finalRole,
            collegeName: finalCollegeName,
            collegeCode: finalCollegeCode,
            address,
            phone,
            website,
            department,
            degree,
            batch
        })

        // Generate token and create session
        const token = generateToken(user._id)
        const session = await Session.create({
            userId: user._id,
            token,
            deviceInfo: {
                userAgent: req.headers['user-agent']
            },
            ipAddress: req.ip
        })

        // Cache session and user
        await cacheSession(token, session.toObject())
        await cacheUser(user._id.toString(), user.toObject())

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            actionType: 'login',
            metaData: { method: 'register' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        })

        logInfo('User registered', { userId: user._id, email: finalEmail, requestId: req.id })

        res.status(201).json({
            success: true,
            data: {
                user: user.publicProfile,
                token
            },
            message: finalEmail !== email ? `Account created with email: ${finalEmail}` : undefined
        })
    } catch (error) {
        logError(error, { component: 'authRegister', requestId: req.id })
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body

        // Find user with password
        const user = await User.findOne({ email }).select('+passwordHash')
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Update user status
        user.status = 'online'
        user.lastSeen = new Date()
        await user.save()

        // Generate token and create session
        const token = generateToken(user._id)
        const session = await Session.create({
            userId: user._id,
            token,
            deviceInfo: {
                userAgent: req.headers['user-agent']
            },
            ipAddress: req.ip
        })

        // Cache session and user
        await cacheSession(token, session.toObject())
        await cacheUser(user._id.toString(), user.toObject())

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            actionType: 'login',
            metaData: { method: 'password' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        })

        logInfo('User logged in', { userId: user._id, email: user.email, requestId: req.id })

        res.json({
            success: true,
            data: {
                user: user.publicProfile,
                token
            }
        })
    } catch (error) {
        logError(error, { component: 'authLogin', requestId: req.id })
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        // Invalidate session in DB
        if (req.session) {
            await Session.findByIdAndUpdate(req.session._id, { isValid: false })

            // Invalidate session in Cache
            await invalidateSession(req.session.token)
        }

        // Update user status if user exists
        if (req.user && req.user._id) {
            // Need to fetch full doc to save if req.user is plain object from cache
            // But for simple status update, findByIdAndUpdate is better
            await User.findByIdAndUpdate(req.user._id, {
                status: 'offline',
                lastSeen: new Date()
            })

            // Invalidate user cache to reflect offline status
            await invalidateUser(req.user._id.toString())

            // Log activity
            await ActivityLog.create({
                userId: req.user._id,
                actionType: 'logout',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            })
        }

        logInfo('User logged out', { userId: req.user?._id, requestId: req.id })

        res.json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (error) {
        logError(error, { component: 'authLogout', requestId: req.id })
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    // req.user is populated by protect middleware (cached or from DB)
    // If it's a mongoose doc, convert to object, otherwise use as is
    const user = req.user.toObject ? req.user.toObject() : req.user

    // Construct public profile
    // Use the publicProfile virtual if available (req.user might be a lean object from cache)
    // If from cache, it won't have the virtual unless we store it.
    // However, initializeServices normally caches user.toObject() which doesn't include virtuals unless specified.

    let profileData
    if (req.user.publicProfile) {
        profileData = req.user.publicProfile
    } else {
        // Handle lean object from cache
        profileData = { ...req.user }
        delete profileData.passwordHash
        delete profileData.salt
        delete profileData.resetPasswordToken
        delete profileData.resetPasswordExpires
    }

    res.json({
        success: true,
        data: {
            user: profileData
        }
    })
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, validate(profileUpdateSchema), async (req, res) => {
    try {
        const {
            name, avatarUrl, settings, headline, bio,
            skills, interests, lookingFor, experience,
            location, website, linkedin, github
        } = req.body

        const updateFields = {}
        if (name) updateFields.name = name
        if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl
        if (settings) updateFields.settings = { ...(req.user.settings || {}), ...settings }
        if (headline !== undefined) updateFields.headline = headline
        if (bio !== undefined) updateFields.bio = bio
        if (skills) updateFields.skills = skills
        if (interests) updateFields.interests = interests
        if (lookingFor !== undefined) updateFields.lookingFor = lookingFor
        if (experience !== undefined) updateFields.experience = experience
        if (location !== undefined) updateFields.location = location
        if (website !== undefined) updateFields.website = website
        if (linkedin !== undefined) updateFields.linkedin = linkedin
        if (github !== undefined) updateFields.github = github

        // Mark profile as completed if key fields are filled
        if ((skills?.length > 0 || req.user.skills?.length > 0) ||
            (interests?.length > 0 || req.user.interests?.length > 0) ||
            (headline || req.user.headline)) {
            updateFields.profileCompleted = true
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        )

        // Update user cache with new data
        await cacheUser(user._id.toString(), user.toObject())

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'profile_updated',
            metaData: { fields: Object.keys(updateFields) },
            ipAddress: req.ip
        })

        logInfo('Profile updated', { userId: user._id, fields: Object.keys(updateFields), requestId: req.id })

        res.json({
            success: true,
            data: { user: user.publicProfile }
        })
    } catch (error) {
        logError(error, { component: 'authProfileUpdate', requestId: req.id })
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, validate(passwordChangeSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        // Get user with password
        const user = await User.findById(req.user._id).select('+passwordHash')

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            })
        }

        // Update password
        user.passwordHash = newPassword
        await user.save()

        // Invalidate all sessions except current one (optional, but good security practice)
        // Or terminate all other sessions
        await Session.updateMany(
            { userId: user._id, _id: { $ne: req.session._id } },
            { isValid: false }
        )
        // Invalidate cached sessions for this user
        await invalidateUserSessions(user._id.toString())

        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            actionType: 'password_changed',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        })

        logInfo('Password changed', { userId: user._id, requestId: req.id })

        res.json({
            success: true,
            message: 'Password changed successfully'
        })
    } catch (error) {
        logError(error, { component: 'authPasswordChange', requestId: req.id })
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            })
        }

        // Find user by email
        const user = await User.findOne({ email })

        // For security, always return success even if user doesn't exist
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link'
            })
        }

        // Generate reset token (valid for 1 hour)
        const crypto = await import('crypto')
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

        // Save hashed token and expiry to user
        user.resetPasswordToken = resetTokenHash
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        await user.save()

        // In production, you would send an email here
        // For now, we'll just log the reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`

        console.log('Password Reset URL:', resetUrl)
        console.log('Reset token for', email, ':', resetToken)
        logInfo('Password reset requested', { userId: user._id, email, requestId: req.id })

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            actionType: 'password_reset_requested',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        })

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link',
            // In development, include the token for testing
            ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
        })
    } catch (error) {
        logError(error, { component: 'authForgotPassword', requestId: req.id })
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request'
        })
    }
})

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params
        const { password } = req.body

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            })
        }

        // Hash the token from URL to compare with stored hash
        const crypto = await import('crypto')
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex')

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+passwordHash')

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            })
        }

        // Update password
        user.passwordHash = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        // Invalidate all existing sessions for security
        await Session.updateMany(
            { userId: user._id },
            { isValid: false }
        )
        // Invalidate all cached sessions
        await invalidateUserSessions(user._id.toString())

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            actionType: 'password_reset_completed',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        })

        logInfo('Password reset completed', { userId: user._id, requestId: req.id })

        res.json({
            success: true,
            message: 'Password has been reset successfully. Please login with your new password.'
        })
    } catch (error) {
        logError(error, { component: 'authResetPassword', requestId: req.id })
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        })
    }
})

// ============================================
// GOOGLE OAUTH ROUTES
// ============================================

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
)

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login?error=google_auth_failed'
    }),
    async (req, res) => {
        try {
            const user = req.user

            // Generate token
            const token = generateToken(user._id)

            // Create session
            const session = await Session.create({
                userId: user._id,
                token,
                deviceInfo: {
                    userAgent: req.headers['user-agent']
                },
                ipAddress: req.ip
            })

            // Cache session and user
            await cacheSession(token, session.toObject())
            await cacheUser(user._id.toString(), user.toObject())

            // Log activity
            await ActivityLog.create({
                userId: user._id,
                actionType: 'login',
                metaData: { method: 'google_oauth' },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            })

            logInfo('User logged in via Google', { userId: user._id, requestId: req.id })

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
            res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
        } catch (error) {
            logError(error, { component: 'authGoogleCallback', requestId: req.id })
            res.redirect('/login?error=oauth_failed')
        }
    }
)

// @route   GET /api/auth/google/status
// @desc    Check if Google OAuth is configured
// @access  Public
router.get('/google/status', (req, res) => {
    res.json({
        success: true,
        enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    })
})

export default router
