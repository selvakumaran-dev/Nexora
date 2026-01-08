import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('nexora_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle network errors
        if (!error.response) {
            console.error('Network Error:', error.message)
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                originalError: error
            })
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname
            // Don't redirect if already on login/register pages
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                localStorage.removeItem('nexora_token')
                localStorage.removeItem('nexora_user')
                window.location.href = '/login'
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access Denied:', error.response.data?.message)
        }

        // Handle 404 Not Found
        if (error.response?.status === 404) {
            console.error('Resource Not Found:', error.config?.url)
        }

        // Handle 500 Server Error
        if (error.response?.status >= 500) {
            console.error('Server Error:', error.response.data?.message)
        }

        return Promise.reject(error)
    }
)

export default api
