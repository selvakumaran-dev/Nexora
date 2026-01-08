import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import authService from '../services/authService'
import socketService from '../services/socketService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const initializingRef = useRef(false)

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            // Prevent double initialization
            if (initializingRef.current) return
            initializingRef.current = true

            try {
                const token = localStorage.getItem('nexora_token')
                if (token && authService.isAuthenticated()) {
                    // Fetch fresh user data from server
                    try {
                        const result = await authService.me()
                        if (result.success && result.data?.user) {
                            setUser(result.data.user)
                            // Update stored user with fresh data
                            localStorage.setItem('nexora_user', JSON.stringify(result.data.user))
                            // Connect socket
                            socketService.connect(token)
                        } else {
                            // Token invalid, clear storage
                            clearAuthData()
                        }
                    } catch (err) {
                        console.error('Failed to fetch user data:', err)
                        // Fallback to stored user if server unavailable
                        const storedUser = authService.getStoredUser()
                        if (storedUser) {
                            setUser(storedUser)
                            socketService.connect(token)
                        } else {
                            clearAuthData()
                        }
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err)
                clearAuthData()
            } finally {
                setLoading(false)
                initializingRef.current = false
            }
        }
        initAuth()
    }, [])

    const clearAuthData = () => {
        localStorage.removeItem('nexora_token')
        localStorage.removeItem('nexora_user')
        setUser(null)
        socketService.disconnect()
    }

    const login = useCallback(async (email, password) => {
        setError(null)
        try {
            const result = await authService.login(email, password)
            if (result.success && result.data?.user && result.data?.token) {
                setUser(result.data.user)
                // Connect socket
                socketService.connect(result.data.token)
                return { success: true }
            }
            const message = result.message || 'Login failed'
            setError(message)
            return { success: false, message }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed'
            setError(message)
            return { success: false, message }
        }
    }, [])

    const register = useCallback(async (userData) => {
        setError(null)
        try {
            const result = await authService.register(userData)
            if (result.success && result.data?.user && result.data?.token) {
                setUser(result.data.user)
                socketService.connect(result.data.token)
                return { success: true }
            }
            const message = result.message || 'Registration failed'
            setError(message)
            return { success: false, message }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Registration failed'
            setError(message)
            return { success: false, message }
        }
    }, [])

    const loginWithToken = useCallback(async (token) => {
        setError(null)
        try {
            const result = await authService.loginWithToken(token)
            if (result.success && result.data?.user) {
                setUser(result.data.user)
                socketService.connect(token)
                return { success: true }
            }
            const message = result.message || 'Token login failed'
            setError(message)
            return { success: false, message }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Token login failed'
            setError(message)
            return { success: false, message }
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await authService.logout()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            clearAuthData()
        }
    }, [])

    const updateProfile = useCallback(async (data) => {
        try {
            const result = await authService.updateProfile(data)
            if (result.success && result.data?.user) {
                setUser(result.data.user)
                localStorage.setItem('nexora_user', JSON.stringify(result.data.user))
                return { success: true, data: result.data }
            }
            return { success: false, message: result.message || 'Update failed' }
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Update failed' }
        }
    }, [])

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        loginWithToken,
        logout,
        updateProfile,
        clearError: () => setError(null)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
