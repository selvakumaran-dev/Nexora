import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Loader2, X, CheckCircle, Building2, Key } from 'lucide-react'

// Forgot Password Modal Component
function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState('')
    const [step, setStep] = useState('email') // 'email', 'sending', 'success'
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('Please enter your email address')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setStep('sending')

        try {
            const { authService } = await import('../services/authService')
            const result = await authService.forgotPassword(email)

            if (result.success) {
                setStep('success')
                if (result.resetUrl) {
                    console.log('Password Reset URL:', result.resetUrl)
                }
            } else {
                setError(result.message || 'Failed to send reset link')
                setStep('email')
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            setError('An error occurred. Please try again.')
            setStep('email')
        }
    }

    const handleClose = () => {
        setEmail('')
        setStep('email')
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="border-b border-slate-100 p-5 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">Reset Password</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'email' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-slate-600 text-sm mb-4">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Send Reset Link
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    )}

                    {step === 'sending' && (
                        <div className="text-center py-8">
                            <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                            <h4 className="font-bold text-slate-800 mb-2">Sending Reset Link...</h4>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">Check Your Email</h4>
                            <p className="text-slate-500 text-sm mb-6">
                                If an account exists with <span className="font-medium text-slate-900">{email}</span>, you'll receive a password reset link shortly.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, register, error } = useAuth()

    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        collegeCode: '',
        department: '',
        degree: '',
        batch: '',
        phone: ''
    })
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [showForgotPassword, setShowForgotPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setLoading(true)

        // Frontend validation
        if (!isLogin) {
            if (!formData.name.trim()) {
                setFormError('Please enter your full name')
                setLoading(false)
                return
            }
            if (formData.password.length !== 8 || !/^\d+$/.test(formData.password)) {
                setFormError('PIN must be exactly 8 digits')
                setLoading(false)
                return
            }
        }

        if (!formData.email.trim()) {
            setFormError('Please enter a valid email address')
            setLoading(false)
            return
        }

        try {
            let result
            if (isLogin) {
                result = await login(formData.email, formData.password)
            } else {
                result = await register(formData)
            }

            if (result.success) {
                navigate('/dashboard')
            } else {
                let errorMsg = result.message || 'Something went wrong'

                if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
                    const firstError = result.errors[0]
                    errorMsg = typeof firstError === 'string' ? firstError : (firstError.message || JSON.stringify(firstError))
                } else if (errorMsg.includes('passwordHash') || errorMsg.includes('shortest')) {
                    errorMsg = 'Password does not meet complexity requirements'
                }

                setFormError(errorMsg)
            }
        } catch (err) {
            const responseData = err.response?.data
            let errorMsg = responseData?.message || 'An error occurred. Please try again.'

            if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
                const firstError = responseData.errors[0]
                errorMsg = typeof firstError === 'string' ? firstError : (firstError.message || JSON.stringify(firstError))
            } else if (errorMsg.includes('passwordHash') || errorMsg.includes('shortest')) {
                errorMsg = 'Password does not meet complexity requirements'
            }

            setFormError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const newData = { ...prev, [name]: value }
            if (!isLogin && name === 'name' && value) {
                const firstName = value.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
                if (firstName) {
                    newData.email = `${firstName}@nexora.io`
                }
            }
            return newData
        })
    }

    return (
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* Left Side - Brand / Marketing (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg group-hover:scale-105 transition-transform">N</div>
                        <span className="font-bold text-2xl tracking-tight text-white">Nexora</span>
                    </Link>

                    <h1 className="text-5xl font-bold leading-tight mb-8 max-w-lg tracking-tight text-white">
                        Build your professional legacy.
                    </h1>
                    <p className="text-blue-100 text-lg max-w-md leading-relaxed text-white">
                        Join a community of forward-thinking professionals. Mentorship, collaboration, and growth opportunities await.
                    </p>
                </div>

                {/* Subtle Geometric Decor */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-800/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex items-center gap-6 text-sm text-blue-200">
                    <span>© 2025 Nexora Inc.</span>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
                <div className="lg:hidden w-full mb-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">N</div>
                        <span className="font-bold text-xl text-slate-900">Nexora</span>
                    </Link>
                </div>

                <div className="max-w-[400px] w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create your account'}
                        </h2>
                        <p className="text-slate-600">
                            {isLogin ? 'Please enter your details to sign in.' : 'Join the Nexora community. It’s free for everyone.'}
                        </p>
                    </div>

                    {(formError || error) && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm border border-red-100 flex items-start gap-3">
                            <div className="mt-0.5 min-w-[6px] h-1.5 bg-red-500 rounded-full"></div>
                            <span className="leading-snug">{formError || error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1.5">College Access Code</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Key size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="collegeCode"
                                        value={formData.collegeCode}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">Department</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">Degree</label>
                                        <input
                                            type="text"
                                            name="degree"
                                            value={formData.degree}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">Batch/Year</label>
                                        <input
                                            type="text"
                                            name="batch"
                                            value={formData.batch}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 mb-1.5">Mobile Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-1.5">{isLogin ? 'Sign-in PIN' : 'Create 8-digit PIN'}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => {
                                        // Only allow digits if strictly enforcing PIN on input
                                        const val = e.target.value
                                        if (/^\d*$/.test(val) && val.length <= 8) {
                                            handleChange(e)
                                        }
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono tracking-widest"
                                    required
                                    inputMode="numeric"
                                />
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Create an 8-digit numeric PIN for login.
                                </p>
                            )}
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isLogin ? 'Sign in' : 'Create account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>



                    <div className="mt-8 text-center">
                        <p className="text-slate-700 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setFormError('')
                                }}
                                className="ml-2 text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>


                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
            />
        </div >
    )
}
