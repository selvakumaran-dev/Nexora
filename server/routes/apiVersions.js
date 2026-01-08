import express from 'express'

// Import all route modules
import authRoutes from '../routes/auth.js'
import usersRoutes from '../routes/users.js'
import contactsRoutes from '../routes/contacts.js'
import chatsRoutes from '../routes/chats.js'
import messagesRoutes from '../routes/messages.js'
import dashboardRoutes from '../routes/dashboard.js'
import landingRoutes from '../routes/landing.js'
import codeRoutes from '../routes/code.js'
import uploadRoutes from '../routes/upload.js'

// Import rate limiters
import { authLimiter, messageLimiter } from '../middleware/rateLimiter.js'

/**
 * API v1 Router
 * All routes are prefixed with /api/v1
 */
const v1Router = express.Router()

// Apply routes with appropriate middleware
v1Router.use('/auth', authLimiter, authRoutes)
v1Router.use('/users', usersRoutes)
v1Router.use('/contacts', contactsRoutes)
v1Router.use('/chats', chatsRoutes)
v1Router.use('/messages', messageLimiter, messagesRoutes)
v1Router.use('/dashboard', dashboardRoutes)
v1Router.use('/landing', landingRoutes)
v1Router.use('/code', codeRoutes)
v1Router.use('/upload', uploadRoutes)

// API v1 info endpoint
v1Router.get('/', (req, res) => {
    res.json({
        success: true,
        version: 'v1',
        message: 'Nexora API v1',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            contacts: '/api/v1/contacts',
            chats: '/api/v1/chats',
            messages: '/api/v1/messages',
            dashboard: '/api/v1/dashboard',
            landing: '/api/v1/landing',
            code: '/api/v1/code',
            upload: '/api/v1/upload'
        },
        documentation: '/api/v1/docs'
    })
})

/**
 * Legacy API Router (for backwards compatibility)
 * Maps /api/* to /api/v1/* for existing clients
 */
const legacyRouter = express.Router()

legacyRouter.use('/auth', authLimiter, authRoutes)
legacyRouter.use('/users', usersRoutes)
legacyRouter.use('/contacts', contactsRoutes)
legacyRouter.use('/chats', chatsRoutes)
legacyRouter.use('/messages', messageLimiter, messagesRoutes)
legacyRouter.use('/dashboard', dashboardRoutes)
legacyRouter.use('/landing', landingRoutes)
legacyRouter.use('/code', codeRoutes)

/**
 * Setup API routes on an Express app
 * @param {Express} app - Express application instance
 */
export const setupApiRoutes = (app) => {
    // API v1 routes (versioned)
    app.use('/api/v1', v1Router)

    // Legacy routes (backwards compatible, maps to v1)
    app.use('/api', legacyRouter)



    // API versions info
    app.get('/api/versions', (req, res) => {
        res.json({
            success: true,
            versions: [
                {
                    version: 'v1',
                    status: 'current',
                    baseUrl: '/api/v1',
                    deprecated: false
                }
            ],
            current: 'v1',
            message: 'Use /api/v1 for the latest stable API'
        })
    })
}

export { v1Router, legacyRouter }
export default setupApiRoutes
