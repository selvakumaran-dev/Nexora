import jwt from 'jsonwebtoken'
import { User, Session } from '../models/index.js'
import { getCachedSession, cacheSession, getCachedUser, cacheUser } from '../utils/cache.js'
import { logError } from '../utils/logger.js'

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })
}

// Verify JWT token
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

// Protect routes middleware
export const protect = async (req, res, next) => {
    try {
        let token

        // Check for token in headers
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please log in.'
            })
        }

        // Verify token
        const decoded = verifyToken(token)

        // 1. Try to get session from Redis Cache first
        let session = await getCachedSession(token)
        let user

        if (session) {
            // Cache hit! faster response
            // We need the user object too. Ideally we cache the minimal user data with the session
            // or fetch the user from cache/db.
            // For now, let's assume session contains essential user data or we fetch user.

            // To be safe and compliant with existing code, we still need the full user object attached to req.user
            // Let's try to get cached user too
            user = await getCachedUser(decoded.id)

            if (!user) {
                // User cache miss, fetch from DB
                user = await User.findById(decoded.id)
                if (user) {
                    await cacheUser(user._id.toString(), user.toObject())
                }
            } else {
                // Hydrate user object if needed (though plain object is usually fine, some code might rely on mongoose methods)
                // For performance, we prefer working with plain objects, but existing code might use .save()
                // If we need mongoose methods, we have to refetch or hydrate. 
                // Let's fetch from DB if we need to call .save() on it (like updating lastSeen), 
                // but we can optimize lastSeen updates to not happen on EVERY request.
            }
        }

        // If no session in cache or no user found (shouldn't happen if session is valid), fallback to DB
        if (!session || !user) {
            session = await Session.findOne({ token, isValid: true })
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please log in again.'
                })
            }

            // Cache the session for future requests
            await cacheSession(token, session.toObject())

            if (!user) {
                user = await User.findById(decoded.id)
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'User no longer exists.'
                    })
                }
                // Cache the user
                await cacheUser(user._id.toString(), user.toObject())
            }
        }

        // Optimization: Don't update lastActive/lastSeen on EVERY request
        // Update only if > 5 minutes passed (throttle updates)
        const lastActive = new Date(session.lastActive)
        const now = new Date()
        if (now - lastActive > 5 * 60 * 1000) {
            // Fire and forget updates to avoid blocking response
            Session.updateOne({ _id: session._id }, { lastActive: now }).exec()
            User.updateOne({ _id: user._id }, { lastSeen: now, status: 'online' }).exec()

            // Update cache
            session.lastActive = now
            await cacheSession(token, session) // Update session cache
        }

        // Attach user and session to request
        // Note: req.user is now a plain object if from cache, or mongoose doc if from DB.
        // If downstream code relies on .save(), we might need to handle that.
        // For safest transition, we fetch Mongoose document if not found, 
        // BUT strictly speaking, we want to avoid DB hits. 
        // Let's rely on the fact that we should move away from req.user.save() in routes 
        // and use Model.findByIdAndUpdate instead.

        // However, to prevent breaking specific existing logic that uses methods like user.comparePassword (not needed here),
        // let's stick to the plain object for performance where possible. 

        // IMPORTANT: If existing routes use req.user.save(), they will fail with a plain object.
        // Let's check if we really need to support that. Most reads don't.
        // The previous code had `req.user = user`.

        // HYBRID APPROACH: If we got it from cache, it's a plain object.
        // If Mongoose methods are absolutely required, we'll re-fetch in the specific route.
        // But for auth middleware, we want speed.

        // Actually, to be 100% compatible without refactoring ALL routes:
        // We will stick to DB fetch for User for now, but Cache Session (which is the main N+1 culprit).
        // Fetching User by ID is very fast (PK lookup). Session lookup by token is also fast but caching Session saves one query.

        // REVISED STRATEGY: 
        // 1. Cache Session.
        // 2. Fetch User from DB (keeps Mongoose methods and ensures fresh data). 
        //    (User profile doesn't change as often as session access, but `req.user` usage is ubiquitous).

        if (!user || !user.save) { // If user is missing or is just a plain object
            user = await User.findById(decoded.id)
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            })
        }

        req.user = user
        req.session = session
        next()
    } catch (error) {
        logError(error, { component: 'authMiddleware', token: req.headers.authorization })
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Token invalid.'
        })
    }
}

// Admin only middleware - must be used after protect
export const adminOnly = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        })
    }
    next()
}

// Socket authentication middleware
export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1]

        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = verifyToken(token)
        const user = await User.findById(decoded.id)

        if (!user) {
            return next(new Error('User not found'))
        }

        socket.user = user
        next()
    } catch (error) {
        next(new Error('Authentication error'))
    }
}
