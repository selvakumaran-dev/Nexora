import Redis from 'ioredis'
import { cacheLogger } from './logger.js'

// Environment configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const CACHE_PREFIX = 'nexora:'
const DEFAULT_TTL = 300 // 5 minutes

// Redis client instance
let redisClient = null
let isConnected = false

/**
 * Initialize Redis connection
 */
export const initRedis = async () => {
    if (redisClient) return redisClient

    try {
        redisClient = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            enableReadyCheck: true,
            lazyConnect: true,
            // Reconnect strategy
            retryStrategy: (times) => {
                if (times > 10) {
                    cacheLogger.error('Redis max retries reached, giving up')
                    return null
                }
                return Math.min(times * 100, 3000)
            }
        })

        redisClient.on('connect', () => {
            isConnected = true
            cacheLogger.info('✅ Redis connected')
        })

        redisClient.on('error', (err) => {
            isConnected = false
            cacheLogger.error({ err }, 'Redis connection error')
        })

        redisClient.on('close', () => {
            isConnected = false
            cacheLogger.warn('Redis connection closed')
        })

        await redisClient.connect()
        return redisClient
    } catch (error) {
        cacheLogger.warn({ err: error }, 'Redis not available, caching disabled')
        return null
    }
}

/**
 * Check if Redis is available
 */
export const isRedisAvailable = () => isConnected && redisClient !== null

/**
 * Get cached value
 */
export const getCache = async (key) => {
    if (!isRedisAvailable()) return null

    try {
        const fullKey = CACHE_PREFIX + key
        const value = await redisClient.get(fullKey)

        if (value) {
            cacheLogger.debug({ key }, 'Cache HIT')
            return JSON.parse(value)
        }

        cacheLogger.debug({ key }, 'Cache MISS')
        return null
    } catch (error) {
        cacheLogger.error({ err: error, key }, 'Cache get error')
        return null
    }
}

/**
 * Set cached value
 */
export const setCache = async (key, value, ttlSeconds = DEFAULT_TTL) => {
    if (!isRedisAvailable()) return false

    try {
        const fullKey = CACHE_PREFIX + key
        const serialized = JSON.stringify(value)

        await redisClient.setex(fullKey, ttlSeconds, serialized)
        cacheLogger.debug({ key, ttl: ttlSeconds }, 'Cache SET')
        return true
    } catch (error) {
        cacheLogger.error({ err: error, key }, 'Cache set error')
        return false
    }
}

/**
 * Delete cached value
 */
export const deleteCache = async (key) => {
    if (!isRedisAvailable()) return false

    try {
        const fullKey = CACHE_PREFIX + key
        await redisClient.del(fullKey)
        cacheLogger.debug({ key }, 'Cache DELETE')
        return true
    } catch (error) {
        cacheLogger.error({ err: error, key }, 'Cache delete error')
        return false
    }
}

/**
 * Delete multiple cached values by pattern
 */
export const deleteCachePattern = async (pattern) => {
    if (!isRedisAvailable()) return false

    try {
        const fullPattern = CACHE_PREFIX + pattern
        const keys = await redisClient.keys(fullPattern)

        if (keys.length > 0) {
            await redisClient.del(...keys)
            cacheLogger.debug({ pattern, count: keys.length }, 'Cache pattern DELETE')
        }
        return true
    } catch (error) {
        cacheLogger.error({ err: error, pattern }, 'Cache pattern delete error')
        return false
    }
}

// ============================================
// SESSION CACHING
// ============================================

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 3600 // 1 hour

/**
 * Cache a session
 */
export const cacheSession = async (token, sessionData) => {
    return setCache(SESSION_PREFIX + token, sessionData, SESSION_TTL)
}

/**
 * Get cached session
 */
export const getCachedSession = async (token) => {
    return getCache(SESSION_PREFIX + token)
}

/**
 * Invalidate cached session
 */
export const invalidateSession = async (token) => {
    return deleteCache(SESSION_PREFIX + token)
}

/**
 * Invalidate all sessions for a user
 */
export const invalidateUserSessions = async (userId) => {
    return deleteCachePattern(`${SESSION_PREFIX}*:user:${userId}`)
}

// ============================================
// USER CACHING
// ============================================

const USER_PREFIX = 'user:'
const USER_TTL = 600 // 10 minutes

/**
 * Cache user data
 * Automatically sanitizes sensitive fields
 */
export const cacheUser = async (userId, userData) => {
    // Sanitize sensitive fields
    const safeData = { ...userData }
    delete safeData.passwordHash
    delete safeData.salt
    delete safeData.resetPasswordToken
    delete safeData.resetPasswordExpires

    return setCache(USER_PREFIX + userId, safeData, USER_TTL)
}

/**
 * Get cached user
 */
export const getCachedUser = async (userId) => {
    return getCache(USER_PREFIX + userId)
}

/**
 * Invalidate user cache
 */
export const invalidateUser = async (userId) => {
    return deleteCache(USER_PREFIX + userId)
}

// ============================================
// CHAT CACHING
// ============================================

const CHAT_PREFIX = 'chat:'
const CHAT_TTL = 300 // 5 minutes

/**
 * Cache chat list for user
 */
export const cacheUserChats = async (userId, chats) => {
    return setCache(`${CHAT_PREFIX}user:${userId}`, chats, CHAT_TTL)
}

/**
 * Get cached chats for user
 */
export const getCachedUserChats = async (userId) => {
    return getCache(`${CHAT_PREFIX}user:${userId}`)
}

/**
 * Invalidate user's chat cache
 */
export const invalidateUserChats = async (userId) => {
    return deleteCache(`${CHAT_PREFIX}user:${userId}`)
}

// ============================================
// RATE LIMITING CACHE
// ============================================

/**
 * Increment rate limit counter
 */
export const incrementRateLimit = async (key, windowSeconds = 60) => {
    if (!isRedisAvailable()) return { count: 0, remaining: Infinity }

    try {
        const fullKey = `${CACHE_PREFIX}ratelimit:${key}`

        const multi = redisClient.multi()
        multi.incr(fullKey)
        multi.expire(fullKey, windowSeconds)

        const results = await multi.exec()
        const count = results[0][1]

        return { count, remaining: Math.max(0, 100 - count) }
    } catch (error) {
        cacheLogger.error({ err: error, key }, 'Rate limit error')
        return { count: 0, remaining: Infinity }
    }
}

// ============================================
// CACHE STATS
// ============================================

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
    if (!isRedisAvailable()) {
        return { available: false }
    }

    try {
        const info = await redisClient.info('memory')
        const dbSize = await redisClient.dbsize()

        return {
            available: true,
            keys: dbSize,
            memoryInfo: info
        }
    } catch (error) {
        return { available: false, error: error.message }
    }
}

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
        isConnected = false
        cacheLogger.info('Redis connection closed')
    }
}

export default {
    initRedis,
    isRedisAvailable,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    cacheSession,
    getCachedSession,
    invalidateSession,
    cacheUser,
    getCachedUser,
    invalidateUser,
    cacheUserChats,
    getCachedUserChats,
    invalidateUserChats,
    incrementRateLimit,
    getCacheStats,
    closeRedis
}
