import api from './api'

export const codeService = {
    // Get all snippets
    async getSnippets() {
        const response = await api.get('/code')
        return response.data
    },

    // Create snippet
    async createSnippet(data) {
        const response = await api.post('/code', data)
        return response.data
    },

    // Update snippet
    async updateSnippet(id, data) {
        const response = await api.put(`/code/${id}`, data)
        return response.data
    },

    // Delete snippet
    async deleteSnippet(id) {
        const response = await api.delete(`/code/${id}`)
        return response.data
    },

    // Toggle star
    async toggleStar(id) {
        const response = await api.post(`/code/${id}/star`)
        return response.data
    },

    // Increment view
    async incrementView(id) {
        const response = await api.post(`/code/${id}/view`)
        return response.data
    }
}

export default codeService
