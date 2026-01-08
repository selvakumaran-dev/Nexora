import { User, Chat, Message } from '../models/index.js'
import { socketAuth } from '../middleware/auth.js'

export default function setupSocket(io) {
    // Authentication middleware
    io.use(socketAuth)

    // Connected users map
    const onlineUsers = new Map()

    io.on('connection', async (socket) => {
        const user = socket.user

        if (!user || !user._id) {
            console.error('Socket connection without valid user')
            socket.disconnect()
            return
        }

        console.log(`User connected: ${user.name} (${user._id})`)

        try {
            // Update user status
            await User.findByIdAndUpdate(user._id, {
                status: 'online',
                lastSeen: new Date()
            })
            onlineUsers.set(user._id.toString(), socket.id)

            // Join user's personal room
            socket.join(`user:${user._id}`)

            // Join all chat rooms
            const chats = await Chat.find({ 'members.userId': user._id }).select('_id')
            chats.forEach(chat => {
                socket.join(`chat:${chat._id}`)
            })

            // Broadcast online status
            socket.broadcast.emit('user:online', {
                userId: user._id.toString(),
                name: user.name,
                avatarUrl: user.avatarUrl
            })
        } catch (error) {
            console.error('Error initializing socket connection:', error)
        }

        // Handle new message
        socket.on('message:send', async (data) => {
            try {
                const { chatId, content, type = 'text', attachments, replyTo } = data

                if (!chatId || !content?.trim()) {
                    return socket.emit('error', { message: 'Invalid message data' })
                }

                const chat = await Chat.findById(chatId)
                if (!chat) {
                    return socket.emit('error', { message: 'Chat not found' })
                }

                if (!chat.isMember(user._id)) {
                    return socket.emit('error', { message: 'Not authorized' })
                }

                const message = await Message.create({
                    chatId,
                    senderId: user._id,
                    content: content.trim(),
                    type,
                    attachments: attachments || [],
                    replyTo: replyTo || undefined,
                    readBy: [{ userId: user._id, readAt: new Date() }]
                })

                chat.lastMessage = message._id
                await chat.save()

                await message.populate('senderId', 'name avatarUrl')

                // Broadcast to chat room
                io.to(`chat:${chatId}`).emit('message:new', {
                    ...message.toObject(),
                    chatId: chatId.toString()
                })
            } catch (error) {
                console.error('Error sending message:', error)
                socket.emit('error', { message: 'Failed to send message' })
            }
        })

        // Handle typing indicator
        socket.on('typing:start', ({ chatId }) => {
            if (!chatId) return
            socket.to(`chat:${chatId}`).emit('typing:update', {
                chatId,
                userId: user._id.toString(),
                userName: user.name,
                isTyping: true
            })
        })

        socket.on('typing:stop', ({ chatId }) => {
            if (!chatId) return
            socket.to(`chat:${chatId}`).emit('typing:update', {
                chatId,
                userId: user._id.toString(),
                userName: user.name,
                isTyping: false
            })
        })

        // Handle message read
        socket.on('message:read', async ({ chatId, messageIds }) => {
            try {
                if (!chatId || !messageIds?.length) return

                await Message.updateMany(
                    {
                        _id: { $in: messageIds },
                        'readBy.userId': { $ne: user._id }
                    },
                    {
                        $push: { readBy: { userId: user._id, readAt: new Date() } }
                    }
                )

                socket.to(`chat:${chatId}`).emit('message:read', {
                    chatId,
                    messageIds,
                    userId: user._id.toString()
                })
            } catch (error) {
                console.error('Error marking messages as read:', error)
            }
        })

        // Handle joining new chat (with security check)
        socket.on('chat:join', async ({ chatId }) => {
            try {
                if (!chatId) return

                const chat = await Chat.findById(chatId)
                if (chat && chat.isMember(user._id)) {
                    socket.join(`chat:${chatId}`)
                } else {
                    socket.emit('error', { message: 'Not authorized to join this chat room' })
                }
            } catch (error) {
                console.error('Error joining chat room:', error)
            }
        })

        // Handle leaving chat
        socket.on('chat:leave', ({ chatId }) => {
            if (chatId) {
                socket.leave(`chat:${chatId}`)
            }
        })

        // Handle user going away
        socket.on('user:away', async () => {
            try {
                await User.findByIdAndUpdate(user._id, { status: 'away' })
                socket.broadcast.emit('user:status', {
                    userId: user._id.toString(),
                    status: 'away'
                })
            } catch (error) {
                console.error('Error updating user status:', error)
            }
        })

        // --- WebRTC Signaling ---
        socket.on('call:start', ({ toUserId, offer, type }) => {
            if (!toUserId || !offer) return
            console.log(`Call started from ${user.name} to ${toUserId}`)
            io.to(`user:${toUserId}`).emit('call:incoming', {
                fromUserId: user._id.toString(),
                fromName: user.name,
                fromAvatar: user.avatarUrl,
                offer,
                type
            })
        })

        socket.on('call:answer', ({ toUserId, answer }) => {
            if (!toUserId || !answer) return
            console.log(`Call answered by ${user.name} to ${toUserId}`)
            io.to(`user:${toUserId}`).emit('call:accepted', {
                fromUserId: user._id.toString(),
                answer
            })
        })

        socket.on('call:ice-candidate', ({ toUserId, candidate }) => {
            if (!toUserId) return
            io.to(`user:${toUserId}`).emit('call:ice-candidate', {
                fromUserId: user._id.toString(),
                candidate
            })
        })

        socket.on('call:end', ({ toUserId }) => {
            if (!toUserId) return
            io.to(`user:${toUserId}`).emit('call:ended', {
                fromUserId: user._id.toString()
            })
        })

        socket.on('call:reject', ({ toUserId }) => {
            if (!toUserId) return
            io.to(`user:${toUserId}`).emit('call:rejected', {
                fromUserId: user._id.toString()
            })
        })
        // ------------------------

        // Handle disconnect
        socket.on('disconnect', async (reason) => {
            console.log(`User disconnected: ${user.name} - ${reason}`)

            onlineUsers.delete(user._id.toString())

            try {
                await User.findByIdAndUpdate(user._id, {
                    status: 'offline',
                    lastSeen: new Date()
                })

                socket.broadcast.emit('user:offline', {
                    userId: user._id.toString(),
                    lastSeen: new Date()
                })
            } catch (error) {
                console.error('Error updating user status on disconnect:', error)
            }
        })

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error for user', user.name, ':', error)
        })
    })

    return io
}
