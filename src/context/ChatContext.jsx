import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import chatService from '../services/chatService'
import socketService from '../services/socketService'
import notificationService from '../services/notificationService'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
    const { user, isAuthenticated } = useAuth()
    const [chats, setChats] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [typingUsers, setTypingUsers] = useState({})
    const [loading, setLoading] = useState(false)

    // Use ref to track activeChat in socket callbacks to avoid stale closures
    const activeChatRef = useRef(activeChat)
    const userRef = useRef(user)

    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    useEffect(() => {
        userRef.current = user
    }, [user])

    const chatsRef = useRef(chats)
    useEffect(() => {
        chatsRef.current = chats
    }, [chats])

    // Initialize notification service when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            notificationService.initialize().catch(err => {
                console.log('Notification permission denied or not supported:', err)
            })
        }
    }, [isAuthenticated])

    // Load chats when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadChats()
        } else {
            setChats([])
            setActiveChat(null)
            setMessages([])
        }
    }, [isAuthenticated])

    // Socket event listeners - separate useEffect to prevent re-registration
    useEffect(() => {
        if (!isAuthenticated) return

        const handleNewMessage = (message) => {
            const currentUser = userRef.current
            const currentActiveChat = activeChatRef.current

            // Safely check sender ID
            const senderId = message.senderId?._id || message.senderId
            const isFromOtherUser = senderId !== currentUser?._id
            const isNotActiveChat = message.chatId !== currentActiveChat?._id
            const isNotOnChatPage = !window.location.pathname.includes('/chat')

            if (isFromOtherUser && (isNotActiveChat || isNotOnChatPage)) {
                // Show browser notification
                const sender = message.senderId
                if (sender?.name) {
                    notificationService.notifyNewMessage(message, sender)
                }
            }

            // Add to messages if it's for active chat
            if (message.chatId === currentActiveChat?._id) {
                setMessages(prev => {
                    // Prevent duplicate messages
                    if (prev.some(m => m._id === message._id)) {
                        return prev
                    }
                    return [...prev, message]
                })
            }

            // Update chat list with last message and unread count
            setChats(prev => prev.map(chat => {
                if (chat._id === message.chatId) {
                    const shouldIncrementUnread = isFromOtherUser && (isNotActiveChat || isNotOnChatPage)
                    return {
                        ...chat,
                        lastMessage: message,
                        unreadCount: shouldIncrementUnread ? (chat.unreadCount || 0) + 1 : chat.unreadCount
                    }
                }
                return chat
            }))
        }

        const handleTypingUpdate = ({ chatId, userId, userName, isTyping }) => {
            const currentActiveChat = activeChatRef.current
            const currentUser = userRef.current

            if (chatId === currentActiveChat?._id && userId !== currentUser?._id) {
                setTypingUsers(prev => {
                    if (isTyping) {
                        return { ...prev, [userId]: userName }
                    } else {
                        const { [userId]: _, ...rest } = prev
                        return rest
                    }
                })
            }
        }

        const handleMessageRead = ({ chatId, messageIds, userId }) => {
            const currentActiveChat = activeChatRef.current

            if (chatId === currentActiveChat?._id) {
                setMessages(prev => prev.map(msg =>
                    messageIds.includes(msg._id)
                        ? { ...msg, readBy: [...(msg.readBy || []), { userId, readAt: new Date() }] }
                        : msg
                ))
            }
        }

        const handleUserOnline = ({ userId }) => {
            setChats(prev => prev.map(chat => ({
                ...chat,
                members: chat.members?.map(m =>
                    (m.userId?._id === userId || m.userId === userId)
                        ? { ...m, userId: typeof m.userId === 'object' ? { ...m.userId, status: 'online' } : m.userId }
                        : m
                )
            })))
        }

        const handleUserOffline = ({ userId }) => {
            setChats(prev => prev.map(chat => ({
                ...chat,
                members: chat.members?.map(m =>
                    (m.userId?._id === userId || m.userId === userId)
                        ? { ...m, userId: typeof m.userId === 'object' ? { ...m.userId, status: 'offline', lastSeen: new Date() } : m.userId }
                        : m
                )
            })))
        }

        const handleUserStatus = ({ userId, status }) => {
            setChats(prev => prev.map(chat => ({
                ...chat,
                members: chat.members?.map(m =>
                    (m.userId?._id === userId || m.userId === userId)
                        ? { ...m, userId: typeof m.userId === 'object' ? { ...m.userId, status } : m.userId }
                        : m
                )
            })))
        }

        // Register listeners
        socketService.onNewMessage(handleNewMessage)
        socketService.onTypingUpdate(handleTypingUpdate)
        socketService.onMessageRead(handleMessageRead)
        socketService.onUserOnline(handleUserOnline)
        socketService.onUserOffline(handleUserOffline)
        socketService.onUserStatus(handleUserStatus)

        return () => {
            socketService.off('message:new')
            socketService.off('typing:update')
            socketService.off('message:read')
            socketService.off('user:online')
            socketService.off('user:offline')
            socketService.off('user:status')
        }
    }, [isAuthenticated]) // Only depend on isAuthenticated

    const loadChats = useCallback(async () => {
        setLoading(true)
        try {
            const result = await chatService.getChats()
            if (result.success) {
                setChats(result.data)
            }
        } catch (err) {
            console.error('Failed to load chats:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const selectChat = useCallback(async (chat) => {
        // Leave previous chat room
        if (activeChatRef.current) {
            socketService.leaveChat(activeChatRef.current._id)
        }

        setActiveChat(chat)
        setMessages([])
        setTypingUsers({})

        if (chat) {
            // Reset unread count for this chat
            setChats(prev => prev.map(c =>
                c._id === chat._id ? { ...c, unreadCount: 0 } : c
            ))

            // Join new chat room
            socketService.joinChat(chat._id)

            // Load messages
            try {
                const result = await chatService.getMessages(chat._id)
                if (result.success) {
                    setMessages(result.data)
                }
            } catch (err) {
                console.error('Failed to load messages:', err)
            }
        }
    }, [])

    const sendMessage = useCallback(async (content, type = 'text') => {
        if (!activeChatRef.current) return { success: false, message: 'No active chat' }

        try {
            const result = await chatService.sendMessage(activeChatRef.current._id, content, type)
            if (result.success) {
                setMessages(prev => {
                    // Prevent duplicate
                    if (prev.some(m => m._id === result.data._id)) {
                        return prev
                    }
                    return [...prev, result.data]
                })
                // Update chat's last message
                setChats(prev => prev.map(chat =>
                    chat._id === activeChatRef.current._id ? { ...chat, lastMessage: result.data } : chat
                ))
            }
            return result
        } catch (err) {
            console.error('Failed to send message:', err)
            return { success: false, message: err.message }
        }
    }, [])

    const startTyping = useCallback(() => {
        if (activeChatRef.current) {
            socketService.startTyping(activeChatRef.current._id)
        }
    }, [])

    const stopTyping = useCallback(() => {
        if (activeChatRef.current) {
            socketService.stopTyping(activeChatRef.current._id)
        }
    }, [])

    const markAsRead = useCallback((chatId) => {
        // Optimistically update local state
        setChats(prev => prev.map(c =>
            c._id === chatId ? { ...c, unreadCount: 0 } : c
        ))

        const currentChats = chatsRef.current
        const currentUser = userRef.current
        const chat = currentChats.find(c => c._id === chatId)
        if (chat && chat.lastMessage && !chat.lastMessage.readBy?.some(r => r.userId === currentUser?._id)) {
            socketService.markAsRead(chatId, [chat.lastMessage._id])
        }
    }, []) // Now fully stable

    const createPrivateChat = useCallback(async (userId) => {
        try {
            const result = await chatService.createPrivateChat(userId)
            if (result.success) {
                if (!result.existing) {
                    setChats(prev => [result.data, ...prev])
                } else {
                    // Move existing chat to top
                    setChats(prev => {
                        const filtered = prev.filter(c => c._id !== result.data._id)
                        return [result.data, ...filtered]
                    })
                }
                setActiveChat(result.data)
                socketService.joinChat(result.data._id)
                return result
            }
            return { success: false, message: 'Failed to create chat' }
        } catch (err) {
            console.error('Failed to create chat:', err)
            return { success: false, message: err.message }
        }
    }, [])

    const createGroupChat = useCallback(async (name, memberIds, description = '') => {
        try {
            const result = await chatService.createGroup(name, description, memberIds)
            if (result.success) {
                setChats(prev => [result.data, ...prev])
                setActiveChat(result.data)
                socketService.joinChat(result.data._id)
                return result
            }
            return { success: false, message: 'Failed to create group' }
        } catch (err) {
            console.error('Failed to create group:', err)
            return { success: false, message: err.message }
        }
    }, [])

    const value = {
        chats,
        activeChat,
        messages,
        typingUsers,
        loading,
        loadChats,
        selectChat,
        sendMessage,
        markAsRead,
        startTyping,
        stopTyping,
        createPrivateChat,
        createGroupChat
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}

export default ChatContext
