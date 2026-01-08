import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dashboardService from '../services/dashboardService'
import { userService, contactService } from '../services/userService'
import {
    MessageSquare, Users, TrendingUp, ArrowRight,
    UserPlus, Search, Star, Activity, Briefcase, Building2, Key, Copy, CheckCircle, Sparkles
} from 'lucide-react'
import AdminDashboard from './AdminDashboard'

// Professional KPI Card
function KPICard({ title, value, label, icon: Icon, colorClass }) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                    <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
                </div>
            </div>
            {label && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        {label}
                    </p>
                </div>
            )}
        </div>
    )
}

// Activity List Item
function ActivityItem({ activity, formatTime }) {
    const getIcon = (type) => {
        if (type === 'message' || type === 'message_sent') return MessageSquare
        if (type === 'connection_accepted' || type === 'connection_sent') return UserPlus
        return Activity
    }

    const Icon = getIcon(activity.type || activity.actionType)

    return (
        <div className="flex gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="mt-1">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 line-clamp-2 font-medium">
                    {activity.description || activity.content || 'New activity recorded'}
                </p>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    {formatTime(activity.createdAt)}
                </span>
            </div>
        </div>
    )
}

// Quick Action Button
function QuickAction({ icon: Icon, label, desc, onClick, to, primary = false }) {
    const Component = to ? Link : 'button'
    const props = to ? { to } : { onClick }

    return (
        <Component
            {...props}
            className={`flex flex-col items-start p-5 rounded-2xl border transition-all duration-300 text-left h-full group ${primary
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1'
                : 'bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:shadow-md hover:-translate-y-1'
                }`}
        >
            <div className={`mb-4 p-3 rounded-xl transition-colors ${primary ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                <Icon size={24} className={primary ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'} />
            </div>
            <div className="mt-auto">
                <span className="block font-bold text-sm mb-1 group-hover:text-blue-600 transition-colors">{label}</span>
                <span className={`block text-xs ${primary ? 'text-blue-100' : 'text-slate-500'}`}>{desc}</span>
            </div>
        </Component>
    )
}

// User Suggestion Card
function UserSuggestionCard({ suggestion }) {
    const { user: suggestedUser, matchScore, matchingSkills } = suggestion
    const { sendRequest } = contactService
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleConnect = async () => {
        setLoading(true)
        try {
            const res = await sendRequest(suggestedUser._id)
            if (res.success) setSent(true)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col h-full hover:shadow-lg hover:shadow-slate-100 transition-all border-b-4 border-b-transparent hover:border-b-blue-600">
            <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm border border-slate-50">
                    <img src={suggestedUser.avatarUrl} alt={suggestedUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                        {matchScore}% Match
                    </span>
                </div>
            </div>

            <div className="mb-4 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">{suggestedUser.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{suggestedUser.headline || 'Fellow Student'}</p>

                {matchingSkills?.length > 0 && (
                    <div className="mt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 underline decoration-blue-200">Matching Skills</p>
                        <div className="flex flex-wrap gap-1">
                            {matchingSkills.slice(0, 3).map(skill => (
                                <span key={skill} className="text-[9px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleConnect}
                disabled={sent || loading}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${sent
                    ? 'bg-emerald-50 text-emerald-600 cursor-default'
                    : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95'
                    }`}
            >
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : sent ? <><CheckCircle size={14} /> Sent</> : <><UserPlus size={14} /> Connect</>}
            </button>
        </div>
    )
}

// Suggestions Section
function SuggestionsSection({ user, setShowProfileModal }) {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await userService.getDiscoverSuggestions(3)
                if (res.success) setSuggestions(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSuggestions()
    }, [])

    if (loading) return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200">
            <div className="animate-pulse flex flex-col gap-4">
                <div className="h-6 w-48 bg-slate-100 rounded-lg"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                    <div className="h-48 bg-slate-50 rounded-2xl"></div>
                    <div className="h-48 bg-slate-50 rounded-2xl"></div>
                    <div className="h-48 bg-slate-50 rounded-2xl"></div>
                </div>
            </div>
        </div>
    )

    if (suggestions.length === 0) return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 border-dashed">
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                    <Sparkles size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Expand Your Nexora</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                    Add more skills or interests to your profile to discover like-minded peers in <strong>{user?.collegeName || 'your campus'}</strong>.
                </p>
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95"
                >
                    Update My Skills
                </button>
            </div>
        </div>
    )

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Sparkles size={20} className="text-orange-400" />
                        People You May Know
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Based on your college and shared skills</p>
                </div>
                <Link to="/directory" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                    View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {suggestions.map((item, idx) => (
                    <UserSuggestionCard key={idx} suggestion={item} />
                ))}
            </div>
        </div>
    )
}

import Navbar from '../components/Navbar'

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [stats, setStats] = useState({ connections: 0, messages: 0, chats: 0 })
    const [activity, setActivity] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProfileModal, setShowProfileModal] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadDashboardData()
    }, [isAuthenticated, navigate])

    const loadDashboardData = async () => {
        setLoading(true)
        try {
            const [statsRes, activityRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getActivity(5)
            ])
            if (statsRes.success) setStats(statsRes.data)
            if (activityRes.success) setActivity(activityRes.data)
        } catch (error) {
            console.error('Failed to load dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (date) => {
        const d = new Date(date)
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (!isAuthenticated || !user) return null

    if (user.role === 'college_admin') {
        return <AdminDashboard />
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <Navbar
                externalProfileModal={showProfileModal}
                onCloseExternalModal={() => setShowProfileModal(false)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 mb-8 sm:mb-10 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-blue-600/10 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-600/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-100">
                                    Student
                                </span>
                                {user.collegeName && (
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 truncate max-w-[200px]">
                                        <Building2 size={13} className="text-slate-300 shrink-0" />
                                        {user.collegeName}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Welcome back, <span className="text-blue-600">{(user?.name || 'User').split(' ')[0]}</span>!
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium max-w-md text-sm sm:text-base">Your personalized nexus for campus networking and professional growth.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/directory" className="w-full sm:w-auto">
                                <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                                    <Users size={18} />
                                    Browse People
                                </button>
                            </Link>
                            <Link to="/chat" className="w-full sm:w-auto">
                                <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 rounded-2xl text-sm font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                                    <MessageSquare size={18} />
                                    Messages
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                    <KPICard
                        title="Network Size"
                        value={stats?.connections || 0}
                        label="Connections in your college"
                        icon={Users}
                        colorClass="bg-blue-600 text-blue-600"
                    />
                    <KPICard
                        title="Interaction"
                        value={stats?.messagesSentThisMonth || 0}
                        label="Messages shared this month"
                        icon={MessageSquare}
                        colorClass="bg-indigo-600 text-indigo-600"
                    />
                    <KPICard
                        title="Visibility"
                        value={stats?.profileViews || 0}
                        label="Profile views last 30 days"
                        icon={TrendingUp}
                        colorClass="bg-purple-600 text-purple-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                    <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <QuickAction
                                icon={MessageSquare}
                                label="Messages"
                                desc="Stay in touch with peers"
                                to="/chat"
                                primary={true}
                            />
                            <QuickAction
                                icon={Users}
                                label="Join Groups"
                                desc="Connect with your batch"
                                to="/directory"
                            />
                            <QuickAction
                                icon={Briefcase}
                                label="Collaborate"
                                desc="Share and edit code"
                                to="/code"
                            />
                        </div>

                        {/* Suggestions */}
                        <SuggestionsSection user={user} setShowProfileModal={setShowProfileModal} />

                        {/* Recent Activity */}
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                <h2 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Activity size={20} className="text-blue-600" />
                                    Recent Activity
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-400 font-medium">Syncing activity...</div>
                                ) : activity.length > 0 ? (
                                    activity.map((item, i) => (
                                        <ActivityItem key={i} activity={item} formatTime={formatTime} />
                                    ))
                                ) : (
                                    <div className="p-12 sm:p-16 text-center text-slate-500">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Activity size={32} />
                                        </div>
                                        <p className="font-bold text-slate-900">No activity yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Activities will appear here as you interact.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 p-6 sm:p-8 lg:sticky lg:top-24">
                            <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-50">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.75rem] bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden flex-shrink-0 border-4 border-white shadow-xl">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-2xl sm:text-3xl">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-lg sm:text-xl text-slate-900 truncate tracking-tight">{user?.name || 'User'}</h3>
                                    <p className="text-xs sm:text-sm font-bold text-slate-400 truncate">{user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-6 sm:space-y-8">
                                {user.profileCompletion === 100 && (
                                    <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle size={20} />
                                            <p className="text-sm font-black uppercase tracking-widest">Profile 100%</p>
                                        </div>
                                        <p className="text-xs text-emerald-50 font-medium">Your account is fully optimized for discovery!</p>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Strength</span>
                                        <span className={`text-sm font-black ${user.profileCompletion >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                            {user.profileCompletion || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner p-1">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 shadow-sm ${user.profileCompletion >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
                                            style={{ width: `${user.profileCompletion || 0}%` }}
                                        ></div>
                                    </div>
                                    {user.profileCompletion < 100 ? (
                                        <div className="space-y-4 mt-6">
                                            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
                                                Complete your profile to unlock <span className="text-blue-600">Premium Suggestions</span>!
                                            </p>
                                            <button
                                                onClick={() => setShowProfileModal(true)}
                                                className="w-full py-3 sm:py-4 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-95"
                                            >
                                                Update Profile
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowProfileModal(true)}
                                            className="w-full mt-6 py-3 sm:py-4 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div className="pt-6 sm:pt-8 border-t border-slate-50">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 sm:mb-5 underline underline-offset-8 decoration-slate-100">Your Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills && user.skills.length > 0 ? (
                                            user.skills.slice(0, 8).map((skill, index) => (
                                                <span key={index} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[10px] font-black rounded-xl border-b-2 border-slate-100 hover:border-blue-200 hover:text-blue-600 transition-all cursor-default">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <div className="text-center w-full py-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                                <p className="text-[10px] text-slate-400 font-bold italic">No skills added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
