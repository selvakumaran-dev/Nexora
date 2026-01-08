import { v4 as uuidv4 } from 'uuid'

/**
 * Request ID middleware
 * Generates or uses existing request ID for request tracking and debugging
 */
export const requestIdMiddleware = (req, res, next) => {
    // Check for existing request ID in headers (from load balancer, API gateway, etc.)
    const existingId = req.headers['x-request-id'] ||
        req.headers['x-correlation-id'] ||
        req.headers['x-trace-id']

    // Generate new ID or use existing
    req.id = existingId || uuidv4()

    // Set response header for client tracking
    res.setHeader('x-request-id', req.id)

    // Also set correlation ID for distributed tracing
    res.setHeader('x-correlation-id', req.id)

    next()
}

/**
 * Extract request metadata for logging
 */
export const getRequestMetadata = (req) => ({
    requestId: req.id,
    method: req.method,
    url: req.url,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?._id?.toString()
})

/**
 * Create child context for async operations
 */
export const createRequestContext = (req) => ({
    requestId: req.id,
    userId: req.user?._id?.toString(),
    startTime: Date.now()
})

export default requestIdMiddleware
