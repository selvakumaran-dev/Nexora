import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Mail, Lock, User, MapPin, Globe, Phone, ArrowRight, Loader2, CheckCircle, School } from 'lucide-react'

export default function CollegeRegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        collegeName: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        website: '',
        phone: '',
        role: 'college_admin'
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (formData.password.length !== 8 || !/^\d+$/.test(formData.password)) {
            setError('PIN must be exactly 8 digits')
            setLoading(false)
            return
        }

        try {
            // Register as college_admin
            // We pass name as collegeName effectively, or just "Admin"
            // The User model requires 'name'. Let's use collegeName as the user name for the admin account
            const payload = {
                name: formData.collegeName, // Admin name defaults to College Name
                email: formData.email,
                password: formData.password,
                role: 'college_admin',
                collegeName: formData.collegeName,
                address: formData.address,
                phone: formData.phone,
                website: formData.website
            }

            const result = await register(payload)

            if (result.success) {
                navigate('/dashboard')
            } else {
                setError(result.message || 'Registration failed')
            }
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <School size={28} />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
                    Register Your Institution
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Create an exclusive network for your campus
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 mb-6 text-sm flex items-start gap-3">
                            <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* College Details Section */}
                        <div className="pb-6 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" />
                                Institution Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">College Name</label>
                                    <input
                                        name="collegeName"
                                        type="text"
                                        required
                                        value={formData.collegeName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Website</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Globe size={18} />
                                        </div>
                                        <input
                                            name="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            name="phone"
                                            type="text"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Address</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-slate-400">
                                            <MapPin size={18} />
                                        </div>
                                        <textarea
                                            name="address"
                                            rows={2}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Account Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <User size={20} className="text-blue-600" />
                                Admin Account
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Official Email</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Admin PIN (8-digits)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (/^\d*$/.test(val) && val.length <= 8) {
                                                    handleChange(e)
                                                }
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono tracking-widest"
                                            maxLength={8}
                                            inputMode="numeric"
                                            placeholder="8-digit PIN"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm PIN</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <CheckCircle size={18} />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (/^\d*$/.test(val) && val.length <= 8) {
                                                    handleChange(e)
                                                }
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono tracking-widest"
                                            maxLength={8}
                                            inputMode="numeric"
                                            placeholder="Repeat PIN"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Register Institution
                                        <ArrowRight className="ml-2" size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already registered?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
