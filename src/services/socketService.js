import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''

class SocketService {
    constructor() {
        this.socket = null
        this.listeners = new Map()
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
    }

    connect(token) {
        if (this.socket?.connected) return this.socket

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            timeout: 20000
        })

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected')
            this.reconnectAttempts = 0
        })

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason)
            // If server disconnected, try to reconnect
            if (reason === 'io server disconnect') {
                this.socket.connect()
            }
        })

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message)
            this.reconnectAttempts++
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnect attempts reached')
            }
        })

        this.socket.on('error', (error) => {
            console.error('Socket error:', error.message)
        })

        return this.socket
    }

    disconnect() {
        if (this.socket) {
            // Remove all custom listeners
            this.listeners.forEach((callback, event) => {
                this.socket.off(event, callback)
            })
            this.listeners.clear()
            this.socket.disconnect()
            this.socket = null
        }
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false
    }

    // Get the socket instance
    getSocket() {
        return this.socket
    }

    // Join a chat room
    joinChat(chatId) {
        if (this.isConnected()) {
            this.socket.emit('chat:join', { chatId })
        }
    }

    // Leave a chat room
    leaveChat(chatId) {
        if (this.isConnected()) {
            this.socket.emit('chat:leave', { chatId })
        }
    }

    // Send a message
    sendMessage(chatId, content, type = 'text', attachments = [], replyTo = null) {
        if (this.isConnected()) {
            this.socket.emit('message:send', { chatId, content, type, attachments, replyTo })
        }
    }

    // Start typing indicator
    startTyping(chatId) {
        if (this.isConnected()) {
            this.socket.emit('typing:start', { chatId })
        }
    }

    // Stop typing indicator
    stopTyping(chatId) {
        if (this.isConnected()) {
            this.socket.emit('typing:stop', { chatId })
        }
    }

    // Mark messages as read
    markAsRead(chatId, messageIds) {
        if (this.isConnected() && messageIds?.length > 0) {
            this.socket.emit('message:read', { chatId, messageIds })
        }
    }

    // Set user status to away
    setAway() {
        if (this.isConnected()) {
            this.socket.emit('user:away')
        }
    }

    // Listen for events (with proper cleanup)
    on(event, callback) {
        if (!this.socket) return

        // Remove existing listener for this event to prevent duplicates
        const existingCallback = this.listeners.get(event)
        if (existingCallback) {
            this.socket.off(event, existingCallback)
        }

        this.socket.on(event, callback)
        this.listeners.set(event, callback)
    }

    // Remove listener
    off(event) {
        const callback = this.listeners.get(event)
        if (callback && this.socket) {
            this.socket.off(event, callback)
            this.listeners.delete(event)
        }
    }

    // Remove all listeners
    offAll() {
        this.listeners.forEach((callback, event) => {
            this.socket?.off(event, callback)
        })
        this.listeners.clear()
    }

    // Common event listeners
    onNewMessage(callback) {
        this.on('message:new', callback)
    }

    onTypingUpdate(callback) {
        this.on('typing:update', callback)
    }

    onMessageRead(callback) {
        this.on('message:read', callback)
    }

    onUserOnline(callback) {
        this.on('user:online', callback)
    }

    onUserOffline(callback) {
        this.on('user:offline', callback)
    }

    onUserStatus(callback) {
        this.on('user:status', callback)
    }

    // --- WebRTC Signaling ---
    startCall(toUserId, offer, type) {
        if (this.isConnected()) {
            this.socket.emit('call:start', { toUserId, offer, type })
        }
    }

    answerCall(toUserId, answer) {
        if (this.isConnected()) {
            this.socket.emit('call:answer', { toUserId, answer })
        }
    }

    sendIceCandidate(toUserId, candidate) {
        if (this.isConnected()) {
            this.socket.emit('call:ice-candidate', { toUserId, candidate })
        }
    }

    endCall(toUserId) {
        if (this.isConnected()) {
            this.socket.emit('call:end', { toUserId })
        }
    }

    onIncomingCall(callback) {
        this.on('call:incoming', callback)
    }

    onCallAccepted(callback) {
        this.on('call:accepted', callback)
    }

    onIceCandidate(callback) {
        this.on('call:ice-candidate', callback)
    }

    onCallEnded(callback) {
        this.on('call:ended', callback)
    }
}

export const socketService = new SocketService()
export default socketService
