import api from './api'

const adminService = {
    // Stats
    getStats: async () => {
        try {
            const res = await api.get('/admin/stats')
            return res.data
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Failed to get stats' }
        }
    },

    // Users
    getUsers: async (params = {}) => {
        try {
            const res = await api.get('/admin/users', { params })
            return res.data
        } catch (error) {
            return { success: false, data: { users: [], totalPages: 1 } }
        }
    },

    getRecentUsers: async (limit = 5) => {
        try {
            const res = await api.get('/admin/users/recent', { params: { limit } })
            return res.data
        } catch (error) {
            return { success: false, data: [] }
        }
    },

    updateUser: async (userId, data) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, data)
            return res.data
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Update failed' }
        }
    },

    deleteUser: async (userId) => {
        try {
            const res = await api.delete(`/admin/users/${userId}`)
            return res.data
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Delete failed' }
        }
    },

    // Chats
    getChats: async (params = {}) => {
        try {
            const res = await api.get('/admin/chats', { params })
            return res.data
        } catch (error) {
            return { success: false, data: { chats: [] } }
        }
    },

    deleteChat: async (chatId) => {
        try {
            const res = await api.delete(`/admin/chats/${chatId}`)
            return res.data
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Delete failed' }
        }
    },

    // Activity Logs
    getActivityLogs: async (params = {}) => {
        try {
            const res = await api.get('/admin/activity', { params })
            return res.data
        } catch (error) {
            return { success: false, data: { logs: [], totalPages: 1 } }
        }
    },

    getRecentActivity: async (limit = 5) => {
        try {
            const res = await api.get('/admin/activity/recent', { params: { limit } })
            return res.data
        } catch (error) {
            return { success: false, data: [] }
        }
    },

    // Analytics
    getAnalytics: async (timeRange = '7d') => {
        try {
            const res = await api.get('/admin/analytics', { params: { timeRange } })
            return res.data
        } catch (error) {
            return { success: false }
        }
    }
}

export default adminService
