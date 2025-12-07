import api from './api'

export const dashboardService = {
    // Get dashboard statistics
    async getStats() {
        const response = await api.get('/dashboard/stats')
        return response.data
    },

    // Get activity feed
    async getActivity(limit = 10) {
        const response = await api.get('/dashboard/activity', { params: { limit } })
        return response.data
    },

    // Get suggested connections
    async getSuggestions(limit = 5) {
        const response = await api.get('/dashboard/suggestions', { params: { limit } })
        return response.data
    },

    // Get recent chats
    async getRecentChats(limit = 5) {
        const response = await api.get('/dashboard/recent-chats', { params: { limit } })
        return response.data
    },

    // Get online users
    async getOnlineUsers() {
        const response = await api.get('/dashboard/online-users')
        return response.data
    }
}

export default dashboardService
