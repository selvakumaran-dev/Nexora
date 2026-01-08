import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallback() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { loginWithToken } = useAuth()
    const [status, setStatus] = useState('processing')
    const [error, setError] = useState('')

    useEffect(() => {
        const token = searchParams.get('token')
        const errorParam = searchParams.get('error')

        if (errorParam) {
            setStatus('error')
            setError('Authentication failed. Please try again.')
            setTimeout(() => navigate('/login'), 3000)
            return
        }

        if (token) {
            handleTokenLogin(token)
        } else {
            setStatus('error')
            setError('No authentication token received')
            setTimeout(() => navigate('/login'), 3000)
        }
    }, [searchParams])

    const handleTokenLogin = async (token) => {
        try {
            await loginWithToken(token)
            setStatus('success')
            setTimeout(() => navigate('/dashboard'), 1500)
        } catch (error) {
            console.error('Token login failed:', error)
            setStatus('error')
            setError('Failed to authenticate. Please try again.')
            setTimeout(() => navigate('/login'), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center max-w-md w-full mx-4">
                {status === 'processing' && (
                    <>
                        <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Signing you in...</h2>
                        <p className="text-slate-500">Please wait while we complete your authentication.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
                            <CheckCircle size={32} className="text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to Nexora!</h2>
                        <p className="text-slate-500">Redirecting you to the dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200">
                            <XCircle size={32} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Failed</h2>
                        <p className="text-slate-500 mb-4">{error}</p>
                        <p className="text-sm text-slate-400">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    )
}
