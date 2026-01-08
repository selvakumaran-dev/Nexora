import api from './api'

export const userService = {
    // Get all users (directory)
    async getUsers(params = {}) {
        const response = await api.get('/users', { params })
        return response.data
    },

    // Get single user
    async getUser(userId) {
        const response = await api.get(`/users/${userId}`)
        return response.data
    },

    // Get online users
    async getOnlineUsers() {
        const response = await api.get('/users/status/online')
        return response.data
    },

    // Get skill-based suggestions
    async getDiscoverSuggestions(limit = 10) {
        const response = await api.get('/users/discover/suggestions', { params: { limit } })
        return response.data
    },

    // Get popular skills
    async getPopularSkills() {
        const response = await api.get('/users/skills/popular')
        return response.data
    },

    // Get popular interests
    async getPopularInterests() {
        const response = await api.get('/users/interests/popular')
        return response.data
    },

    // Advanced search with filters
    async searchAdvanced(params = {}) {
        const response = await api.get('/users/search/advanced', { params })
        return response.data
    },

    // Delete user (Admin requirement handled by backend)
    async deleteUser(userId) {
        const response = await api.delete(`/users/${userId}`)
        return response.data
    }
}

export const contactService = {
    // Get all contacts
    async getContacts() {
        const response = await api.get('/contacts')
        return response.data
    },

    // Send contact request
    async sendRequest(contactId) {
        const response = await api.post('/contacts/request', { contactId })
        return response.data
    },

    // Accept contact request
    async acceptRequest(contactId) {
        const response = await api.put(`/contacts/${contactId}/accept`)
        return response.data
    },

    // Remove contact
    async removeContact(contactId) {
        const response = await api.delete(`/contacts/${contactId}`)
        return response.data
    },

    // Get pending requests
    async getPendingRequests() {
        const response = await api.get('/contacts/pending')
        return response.data
    }
}

export { userService as default }
