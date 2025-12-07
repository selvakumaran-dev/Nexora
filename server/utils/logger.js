import pino from 'pino'

// Environment detection
const isDev = process.env.NODE_ENV !== 'production'
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info')

// Create logger instance
const logger = pino({
    level: logLevel,

    // Base fields included in all logs
    base: {
        service: 'nexora-api',
        version: process.env.npm_package_version || '1.0.0',
        env: process.env.NODE_ENV || 'development'
    },

    // Timestamp formatting
    timestamp: pino.stdTimeFunctions.isoTime,

    // Redact sensitive fields
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.currentPassword',
            'req.body.newPassword',
            'res.headers["set-cookie"]',
            '*.passwordHash',
            '*.token'
        ],
        censor: '[REDACTED]'
    },

    // Pretty print in development
    transport: isDev ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,service,version,env',
            messageFormat: '{msg}',
            errorLikeObjectKeys: ['err', 'error']
        }
    } : undefined,

    // Serializers for consistent formatting
    serializers: {
        req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            path: req.path,
            query: req.query,
            params: req.params,
            remoteAddress: req.ip || req.remoteAddress,
            userAgent: req.headers?.['user-agent']
        }),
        res: (res) => ({
            statusCode: res.statusCode
        }),
        err: pino.stdSerializers.err,
        user: (user) => ({
            id: user?._id?.toString(),
            email: user?.email,
            role: user?.role
        })
    }
})

// Child loggers for different components
export const authLogger = logger.child({ component: 'auth' })
export const chatLogger = logger.child({ component: 'chat' })
export const socketLogger = logger.child({ component: 'socket' })
export const dbLogger = logger.child({ component: 'database' })
export const cacheLogger = logger.child({ component: 'cache' })

// Express HTTP logging middleware
export const httpLogger = (req, res, next) => {
    const startTime = Date.now()

    // Generate or use existing request ID
    req.log = logger.child({ requestId: req.id })

    // Log request start
    req.log.info({
        type: 'request',
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']
    }, `→ ${req.method} ${req.url}`)

    // Log response on finish
    res.on('finish', () => {
        const duration = Date.now() - startTime
        const level = res.statusCode >= 500 ? 'error' :
            res.statusCode >= 400 ? 'warn' : 'info'

        req.log[level]({
            type: 'response',
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        }, `← ${req.method} ${req.url} ${res.statusCode} (${duration}ms)`)
    })

    next()
}

// Utility logging functions
export const logError = (error, context = {}) => {
    logger.error({
        err: error,
        ...context
    }, error.message)
}

export const logInfo = (message, context = {}) => {
    logger.info(context, message)
}

export const logDebug = (message, context = {}) => {
    logger.debug(context, message)
}

export const logWarn = (message, context = {}) => {
    logger.warn(context, message)
}

// Performance logging helper
export const logPerformance = (operation, startTime, metadata = {}) => {
    const duration = Date.now() - startTime
    const level = duration > 1000 ? 'warn' : 'debug'

    logger[level]({
        type: 'performance',
        operation,
        duration: `${duration}ms`,
        ...metadata
    }, `${operation} completed in ${duration}ms`)
}

export default logger
