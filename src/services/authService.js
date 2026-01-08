import api from './api'

export const authService = {
    // Register new user
    async register(userData) {
        const response = await api.post('/auth/register', userData)
        if (response.data.success) {
            localStorage.setItem('nexora_token', response.data.data.token)
            localStorage.setItem('nexora_user', JSON.stringify(response.data.data.user))
        }
        return response.data
    },

    // Login user
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password })
        if (response.data.success) {
            localStorage.setItem('nexora_token', response.data.data.token)
            localStorage.setItem('nexora_user', JSON.stringify(response.data.data.user))
        }
        return response.data
    },

    // Login with token (OAuth)
    async loginWithToken(token) {
        localStorage.setItem('nexora_token', token)
        const response = await api.get('/auth/me')
        if (response.data.success) {
            localStorage.setItem('nexora_user', JSON.stringify(response.data.data.user))
        }
        return response.data
    },

    // Logout user
    async logout() {
        try {
            await api.post('/auth/logout')
        } finally {
            localStorage.removeItem('nexora_token')
            localStorage.removeItem('nexora_user')
        }
    },

    // Get current user
    async me() {
        const response = await api.get('/auth/me')
        return response.data
    },

    // Update profile
    async updateProfile(data) {
        const response = await api.put('/auth/profile', data)
        if (response.data.success) {
            localStorage.setItem('nexora_user', JSON.stringify(response.data.data.user))
        }
        return response.data
    },

    // Get stored user
    getStoredUser() {
        const user = localStorage.getItem('nexora_user')
        return user ? JSON.parse(user) : null
    },

    // Check if authenticated
    isAuthenticated() {
        return !!localStorage.getItem('nexora_token')
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        const response = await api.put('/auth/password', { currentPassword, newPassword })
        return response.data
    },

    // Request password reset
    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email })
        return response.data
    },

    // Reset password with token
    async resetPassword(token, password) {
        const response = await api.post(`/auth/reset-password/${token}`, { password })
        return response.data
    }
}

export default authService
