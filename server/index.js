import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import helmet from 'helmet'
import path from 'path'
import { configurePassport } from './config/passport.js'
import { User } from './models/index.js'

// Load env vars
dotenv.config()

// Import utilities
import logger, { httpLogger, dbLogger, logInfo, logError } from './utils/logger.js'
import { initRedis, closeRedis, isRedisAvailable, getCacheStats } from './utils/cache.js'
import { createIndexes } from './utils/dbIndexes.js'

// Import middleware
import { generalLimiter } from './middleware/rateLimiter.js'
import requestIdMiddleware from './middleware/requestId.js'

// Import API router
import { setupApiRoutes } from './routes/apiVersions.js'

// Import socket handler
import setupSocket from './socket/index.js'
import { initNotifications } from './socket/notificationService.js'

const app = express()
const httpServer = createServer(app)

// Environment
const isDev = process.env.NODE_ENV !== 'production'

// Allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL
].filter(Boolean)

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
})

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: isDev ? false : undefined,
    crossOriginEmbedderPolicy: false
}))

// CORS with proper origin validation
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS not allowed'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}))

// Body parsers with limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use('/uploads', express.static('public/uploads'))

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1)

// ===========================================
// REQUEST TRACKING & LOGGING
// ===========================================

// Request ID tracking (MUST be before other middleware)
app.use(requestIdMiddleware)

// Structured HTTP logging
app.use(httpLogger)

// Apply general rate limiting
app.use('/api/', generalLimiter)

// Initialize Passport
configurePassport()
app.use(passport.initialize())

// ===========================================
// API ROUTES (with versioning)
// ===========================================
setupApiRoutes(app)

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve()
    app.use(express.static(path.join(__dirname, 'dist')))

    // Redirect all non-API routes to the frontend
    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
            return next()
        }
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
    })
}

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

// Health check with detailed status
// Health check with detailed status
app.get('/api/health', async (req, res) => {
    // Check MongoDB status
    const dbState = mongoose.connection.readyState
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }

    res.json({
        success: true,
        message: 'Nexora API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        services: {
            database: dbStatus[dbState] || 'unknown',
            cache: isRedisAvailable() ? 'connected' : 'disabled',
            socket: io.engine?.clientsCount >= 0 ? 'active' : 'inactive'
        },
        uptime: Math.floor(process.uptime()) + 's'
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        requestId: req.id
    })
})

// Global error handler
app.use((err, req, res, next) => {
    // Log error with request context
    logError(err, {
        requestId: req.id,
        method: req.method,
        url: req.url,
        userId: req.user?._id?.toString()
    })

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message),
            requestId: req.id
        })
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            requestId: req.id
        })
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate value error',
            requestId: req.id
        })
    }

    // Generic error response (don't expose stack in production)
    res.status(err.statusCode || 500).json({
        success: false,
        message: isDev ? err.message : 'Internal server error',
        requestId: req.id,
        ...(isDev && { stack: err.stack })
    })
})

// ===========================================
// SOCKET.IO SETUP
// ===========================================
setupSocket(io)
initNotifications(io)

// ===========================================
// DATABASE & SERVICES INITIALIZATION
// ===========================================
const PORT = process.env.PORT || 5000
const MAX_RETRIES = 5
let retryCount = 0

const initializeServices = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        })
        dbLogger.info('✅ Connected to MongoDB')

        // Reset all user statuses to offline on startup
        await User.updateMany({}, { status: 'offline' })
        dbLogger.info('✅ Reset all user statuses to offline')

        // Create database indexes
        const indexResult = await createIndexes()
        if (indexResult.success) {
            dbLogger.info(`✅ Database indexes created (${indexResult.duration}ms)`)
        }

        // Initialize Redis (optional - continues even if unavailable)
        try {
            await initRedis()
        } catch (redisErr) {
            logger.warn({ err: redisErr }, '⚠️ Redis not available, continuing without cache')
        }

        // Start HTTP server
        httpServer.listen(PORT, () => {
            logInfo('🚀 Server started', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                pid: process.pid
            })

            console.log('\n' + '='.repeat(50))
            console.log('  🚀 Nexora API Server')
            console.log('='.repeat(50))
            console.log(`  📡 Port:        ${PORT}`)
            console.log(`  🔒 Environment: ${process.env.NODE_ENV || 'development'}`)
            console.log(`  💾 Database:    Connected`)
            console.log(`  🔄 Cache:       ${isRedisAvailable() ? 'Redis' : 'Disabled'}`)
            console.log(`  📊 Logging:     Pino (structured)`)
            console.log(`  🔗 API:         /api/v1/*`)
            console.log('='.repeat(50) + '\n')
        })
    } catch (err) {
        dbLogger.error({ err }, '❌ MongoDB connection error')
        retryCount++

        if (retryCount < MAX_RETRIES) {
            logger.info(`🔄 Retrying connection (${retryCount}/${MAX_RETRIES})...`)
            setTimeout(initializeServices, 5000)
        } else {
            logger.error('❌ Max retries reached. Exiting.')
            process.exit(1)
        }
    }
}

initializeServices()

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================
const gracefulShutdown = async (signal) => {
    logger.info(`\n${signal} received. Gracefully shutting down...`)

    // Close HTTP server
    httpServer.close(() => {
        logger.info('✅ HTTP server closed')
    })

    // Close Socket.io connections
    io.close(() => {
        logger.info('✅ Socket.io connections closed')
    })

    // Close Redis connection
    await closeRedis()

    // Close MongoDB connection
    await mongoose.connection.close()
    logger.info('✅ MongoDB connection closed')

    process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, '❌ Uncaught Exception')
    gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, '❌ Unhandled Rejection')
})
