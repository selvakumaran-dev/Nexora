import api from './api'

export const chatService = {
    // Get all chats
    async getChats() {
        const response = await api.get('/chats')
        return response.data
    },

    // Get single chat
    async getChat(chatId) {
        const response = await api.get(`/chats/${chatId}`)
        return response.data
    },

    // Create private chat
    async createPrivateChat(userId) {
        const response = await api.post('/chats/private', { userId })
        return response.data
    },

    // Create group chat
    async createGroup(name, description, memberIds) {
        const response = await api.post('/chats/group', { name, description, memberIds })
        return response.data
    },

    // Update group
    async updateGroup(chatId, data) {
        const response = await api.put(`/chats/${chatId}`, data)
        return response.data
    },

    // Add members to group
    async addMembers(chatId, memberIds) {
        const response = await api.post(`/chats/${chatId}/members`, { memberIds })
        return response.data
    },

    // Remove member from group
    async removeMember(chatId, userId) {
        const response = await api.delete(`/chats/${chatId}/members/${userId}`)
        return response.data
    },

    // Get messages for chat
    async getMessages(chatId, params = {}) {
        const response = await api.get(`/messages/${chatId}`, { params })
        return response.data
    },

    // Send message
    async sendMessage(chatId, content, type = 'text', attachments = []) {
        const response = await api.post(`/messages/${chatId}`, { content, type, attachments })
        return response.data
    },

    // Edit message
    async editMessage(messageId, content) {
        const response = await api.put(`/messages/${messageId}`, { content })
        return response.data
    },

    // Delete message
    async deleteMessage(messageId) {
        const response = await api.delete(`/messages/${messageId}`)
        return response.data
    },

    // Add reaction
    async addReaction(messageId, emoji) {
        const response = await api.post(`/messages/${messageId}/reaction`, { emoji })
        return response.data
    },

    // Upload file
    async uploadFile(file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    }
}

export default chatService
