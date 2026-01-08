class NotificationService {
    constructor() {
        this.permission = 'default'
        this.registration = null
        this.initialized = false
    }

    // Request notification permission
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications')
            return false
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted'
            return true
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission()
                this.permission = permission
                return permission === 'granted'
            } catch (error) {
                console.error('Error requesting notification permission:', error)
                return false
            }
        }

        return false
    }

    // Show browser notification
    showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            return
        }

        // Don't show notification if page is focused
        if (document.hasFocus()) {
            return
        }

        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: options.tag || 'nexora-notification-' + Date.now(),
            requireInteraction: false,
            silent: false,
            ...options
        }

        try {
            if (this.registration?.showNotification) {
                // Use service worker notification
                this.registration.showNotification(title, defaultOptions)
            } else if ('Notification' in window) {
                // Fallback to regular notification
                const notification = new Notification(title, defaultOptions)

                // Auto close after 5 seconds
                setTimeout(() => notification.close(), 5000)

                // Handle click
                notification.onclick = () => {
                    window.focus()
                    if (options.data?.url) {
                        window.location.href = options.data.url
                    }
                    notification.close()
                }
            }
        } catch (error) {
            console.error('Error showing notification:', error)
        }
    }

    // Register service worker for push notifications
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service workers not supported')
            return false
        }

        try {
            // Check if already registered
            const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js')
            if (existingRegistration) {
                this.registration = existingRegistration
                return true
            }

            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            })
            console.log('Service Worker registered')
            return true
        } catch (error) {
            console.error('Service Worker registration failed:', error)
            return false
        }
    }

    // Subscribe to push notifications (optional - requires VAPID key)
    async subscribeToPush() {
        if (!this.registration) {
            return null
        }

        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (!vapidKey) {
            console.log('VAPID key not configured, skipping push subscription')
            return null
        }

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
            })

            return subscription
        } catch (error) {
            console.log('Push subscription not available:', error.message)
            return null
        }
    }

    // Helper to convert VAPID key
    urlBase64ToUint8Array(base64String) {
        if (!base64String) return new Uint8Array()

        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        try {
            const rawData = window.atob(base64)
            const outputArray = new Uint8Array(rawData.length)

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i)
            }
            return outputArray
        } catch (error) {
            console.error('Error converting VAPID key:', error)
            return new Uint8Array()
        }
    }

    // Initialize notification system
    async initialize() {
        if (this.initialized) return true

        try {
            const hasPermission = await this.requestPermission()
            if (!hasPermission) {
                console.log('Notification permission not granted')
                return false
            }

            await this.registerServiceWorker()
            await this.subscribeToPush()

            this.initialized = true
            return true
        } catch (error) {
            console.error('Error initializing notifications:', error)
            return false
        }
    }

    // Notify for new message
    notifyNewMessage(message, sender) {
        if (!sender?.name) return

        const content = message.content || 'New message'
        const truncatedContent = content.length > 100
            ? content.substring(0, 100) + '...'
            : content

        this.showNotification(`New message from ${sender.name}`, {
            body: truncatedContent,
            icon: sender.avatarUrl || '/icon-192.png',
            tag: `message-${message.chatId}`,
            data: {
                type: 'message',
                chatId: message.chatId,
                url: '/chat'
            }
        })
    }

    // Notify for connection request
    notifyConnectionRequest(user) {
        if (!user?.name) return

        this.showNotification('New Connection Request', {
            body: `${user.name} wants to connect with you`,
            icon: user.avatarUrl || '/icon-192.png',
            tag: `connection-${user._id}`,
            data: {
                type: 'connection',
                userId: user._id,
                url: '/dashboard'
            }
        })
    }

    // Notify for connection accepted
    notifyConnectionAccepted(user) {
        if (!user?.name) return

        this.showNotification('Connection Accepted', {
            body: `${user.name} accepted your connection request`,
            icon: user.avatarUrl || '/icon-192.png',
            tag: `connection-accepted-${user._id}`,
            data: {
                type: 'connection_accepted',
                userId: user._id,
                url: '/chat'
            }
        })
    }

    // Notify for code share
    notifyCodeShare(user, snippetTitle) {
        if (!user?.name) return

        this.showNotification('Code Shared With You', {
            body: `${user.name} shared "${snippetTitle}" with you`,
            icon: user.avatarUrl || '/icon-192.png',
            tag: `code-share-${Date.now()}`,
            data: {
                type: 'code_share',
                url: '/code'
            }
        })
    }
}

export const notificationService = new NotificationService()
export default notificationService
