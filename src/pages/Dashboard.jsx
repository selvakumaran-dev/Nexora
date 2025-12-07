import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import dashboardService from '../services/dashboardService'
import { userService, contactService } from '../services/userService'
import {
    MessageSquare, Users, TrendingUp, Clock, ArrowRight, Sparkles,
    Target, UserPlus, Zap, Star, Search, Heart, Code, Send, Eye,
    Activity, Calendar, CheckCircle, XCircle, UserCheck, Mail, Bell,
    Award, Briefcase, Coffee, GitBranch, Terminal
} from 'lucide-react'

// Premium KPI Card
function KPICard({ title, value, change, changeLabel, icon: Icon, color = 'purple', loading }) {
    const colors = {
        purple: 'from-purple-500 to-purple-600',
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600',
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
            </div>
            {change !== undefined && (
                <div className="flex items-center gap-1">
                    <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                    <span className="text-xs text-gray-500">{changeLabel}</span>
                </div>
            )}
        </div>
    )
}

// Activity Timeline Item
function ActivityItem({ activity, formatTime }) {
    const activityType = activity.actionType || (activity.type === 'message' ? 'message_sent' : activity.type)

    const getIcon = (type) => {
        switch (type) {
            case 'message_sent': return MessageSquare
            case 'message': return MessageSquare
            case 'connection_accepted': return UserCheck
            case 'connection_sent': return UserPlus
            case 'profile_updated': return Star
            case 'code_shared': return Code
            default: return Activity
        }
    }

    const getColor = (type) => {
        switch (type) {
            case 'message_sent': return 'purple'
            case 'message': return 'purple'
            case 'connection_accepted': return 'green'
            case 'connection_sent': return 'blue'
            case 'profile_updated': return 'yellow'
            case 'code_shared': return 'orange'
            default: return 'gray'
        }
    }

    const getDescription = (activity) => {
        // Standardize type field - API returns 'type', not 'actionType'
        const type = activity.type || activity.actionType

        switch (type) {
            case 'message_sent':
            case 'message':
                const chatName = activity.chat?.name || activity.user?.name || 'someone'
                const preview = activity.content?.substring(0, 50) || 'Sent a message'
                return `${chatName}: ${preview}${activity.content?.length > 50 ? '...' : ''}`
            case 'connection_accepted':
                return `Connected with ${activity.metadata?.userName || activity.user?.name || 'someone'}`
            case 'connection_sent':
                return `Sent connection request to ${activity.metadata?.userName || 'someone'}`
            case 'profile_updated':
                return 'Updated profile'
            case 'code_shared':
                return `Shared code snippet: ${activity.metadata?.title || 'Untitled'}`
            default:
                return activity.description || 'Activity'
        }
    }

    const Icon = getIcon(activityType)
    const color = getColor(activityType)
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        orange: 'bg-orange-100 text-orange-600',
        gray: 'bg-gray-100 text-gray-600'
    }

    return (
        <div className="flex gap-3 sm:gap-4 group hover:bg-gray-50 p-2 sm:p-3 rounded-xl transition-colors">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colorClasses[color]} flex items-center justify-center shrink-0`}>
                <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">{getDescription(activity)}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{formatTime(activity.createdAt)}</p>
            </div>
        </div>
    )
}

// Quick Action Card
function QuickAction({ title, description, icon: Icon, color, onClick, to }) {
    const colorClasses = {
        purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
        blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
        green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    }

    const Component = to ? Link : 'button'
    const props = to ? { to } : { onClick }

    return (
        <Component
            {...props}
            className={`bg-gradient-to-br ${colorClasses[color]} p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
        >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-white/80">{description}</p>
        </Component>
    )
}

// Match Card (Skill-based suggestions)
function MatchCard({ user, matchScore, matchingSkills, matchingInterests, onConnect, connecting }) {
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group">
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="relative">
                    <img
                        src={user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100"
                        alt=""
                    />
                    {matchScore > 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <Star size={10} className="text-white fill-white sm:w-3 sm:h-3" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">{user.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{user.headline || 'Nexora Member'}</p>
                </div>
            </div>

            {/* Matching Tags */}
            {(matchingSkills?.length > 0 || matchingInterests?.length > 0) && (
                <div className="mb-3 sm:mb-4">
                    <div className="text-[10px] sm:text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
                        <Sparkles size={10} className="text-purple-500 sm:w-3 sm:h-3" /> Why you match
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {matchingSkills?.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] sm:text-xs font-medium">
                                {skill}
                            </span>
                        ))}
                        {matchingInterests?.slice(0, 2).map((interest, i) => (
                            <span key={i} className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] sm:text-xs font-medium">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => onConnect(user._id)}
                disabled={connecting}
                className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
                {connecting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connecting...
                    </>
                ) : (
                    <>
                        <UserPlus size={14} className="sm:w-4 sm:h-4" />
                        Connect
                    </>
                )}
            </button>
        </div>
    )
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [stats, setStats] = useState({ connections: 0, messages: 0, chats: 0 })
    const [activity, setActivity] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [connectingId, setConnectingId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
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
                dashboardService.getActivity(10)
            ])

            if (statsRes.success) setStats(statsRes.data)
            if (activityRes.success) setActivity(activityRes.data)

            // Load skill-matched suggestions
            if (user?.skills?.length > 0 || user?.interests?.length > 0) {
                try {
                    const suggestionsRes = await userService.getDiscoverSuggestions(6)
                    if (suggestionsRes.success) {
                        // Extract user objects from discover suggestions format
                        const extractedSuggestions = suggestionsRes.data.map(item => {
                            // Handle both formats: {user, matchScore} and flat user object
                            if (item.user) {
                                return { ...item.user, matchScore: item.matchScore }
                            }
                            return item
                        })
                        setSuggestions(extractedSuggestions)
                    }
                } catch (err) {
                    console.log('Discover suggestions failed, trying fallback:', err.message)
                    const fallbackRes = await dashboardService.getSuggestions(6)
                    if (fallbackRes.success) setSuggestions(fallbackRes.data)
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (userId) => {
        setConnectingId(userId)
        try {
            await contactService.sendRequest(userId)
            setSuggestions(prev => prev.filter(s => s._id !== userId))
        } catch (error) {
            console.error('Failed to send request:', error)
        } finally {
            setConnectingId(null)
        }
    }

    // Debounced search to prevent excessive API calls
    const [searchTimeout, setSearchTimeout] = useState(null)

    const handleSearch = async (query) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setSearchResults([])
            setIsSearching(false)
            return
        }

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        // Set new timeout for debouncing (300ms delay)
        const timeout = setTimeout(async () => {
            setIsSearching(true)
            try {
                const res = await userService.getUsers({ search: query, limit: 10 })
                if (res.success) {
                    setSearchResults(res.data.filter(u => user && u._id !== user._id))
                }
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsSearching(false)
            }
        }, 300)

        setSearchTimeout(timeout)
    }

    const formatTime = (date) => {
        const now = new Date()
        const msgDate = new Date(date)
        const diffMs = now - msgDate
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return msgDate.toLocaleDateString()
    }

    if (!isAuthenticated || !user) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-orange-50/30">
            <Navbar
                externalProfileModal={showProfileModal}
                onCloseExternalModal={() => setShowProfileModal(false)}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
                {/* Premium Welcome Header */}
                <div className="mb-4 sm:mb-6 md:mb-8 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent mb-1 sm:mb-2">
                                {(() => {
                                    const hour = new Date().getHours()
                                    if (hour < 12) return 'Good Morning'
                                    if (hour < 17) return 'Good Afternoon'
                                    return 'Good Evening'
                                })()}, {user?.name?.split(' ')[0]}
                            </h1>
                            <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Your professional network at a glance</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-xs sm:text-sm text-gray-500">Today</p>
                                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-4 sm:mb-6 md:mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search by name, skills, interests..."
                            className="w-full pl-9 sm:pl-11 md:pl-12 pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        />
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-3 sm:mt-4 space-y-2 max-h-64 overflow-y-auto">
                            {searchResults.map(result => (
                                <Link
                                    key={result._id}
                                    to={`/directory`}
                                    className="flex items-center gap-3 p-2 sm:p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    <img
                                        src={result.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${result.name}`}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">{result.headline || result.email}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                    <KPICard
                        title="Total Connections"
                        value={stats?.contacts || 0}
                        change={stats?.engagementTrend || 0}
                        changeLabel="vs last month"
                        icon={Users}
                        color="purple"
                        loading={loading}
                    />
                    <KPICard
                        title="Messages Sent"
                        value={stats?.messagesSentThisMonth || 0}
                        change={stats?.engagementTrend || 0}
                        changeLabel="vs last month"
                        icon={MessageSquare}
                        color="blue"
                        loading={loading}
                    />
                    <KPICard
                        title="Active Chats"
                        value={stats?.activeChats || 0}
                        change={stats?.pendingRequests || 0}
                        changeLabel="pending requests"
                        icon={TrendingUp}
                        color="green"
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                    <QuickAction
                        title="Start Chat"
                        description="Message connections"
                        icon={Send}
                        color="purple"
                        to="/chat"
                    />
                    <QuickAction
                        title="Discover"
                        description="Find matches"
                        icon={Users}
                        color="blue"
                        to="/directory"
                    />
                    <QuickAction
                        title="Share Code"
                        description="Share snippets"
                        icon={Code}
                        color="orange"
                        to="/code"
                    />
                    <QuickAction
                        title="Edit Profile"
                        description="Update info"
                        icon={Star}
                        color="green"
                        onClick={() => setShowProfileModal(true)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* Main Content - Activity Feed */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-orange-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Activity size={20} className="text-purple-600 sm:w-[22px] sm:h-[22px]" />
                                            Recent Activity
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Your latest actions and updates</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4 space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex gap-3 sm:gap-4 p-2 sm:p-3 animate-pulse">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-2 sm:h-3 bg-gray-100 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : activity.length > 0 ? (
                                    activity.map((item, i) => (
                                        <ActivityItem key={i} activity={item} formatTime={formatTime} />
                                    ))
                                ) : (
                                    <div className="p-8 sm:p-12 text-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <Activity size={24} className="text-gray-400 sm:w-7 sm:h-7" />
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-500 font-medium">No recent activity</p>
                                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Start connecting and chatting to see your activity here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Your Profile Overview */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-4 sm:mb-5">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Award size={20} className="text-yellow-500 sm:w-[22px] sm:h-[22px]" />
                                    Your Profile
                                </h2>
                                <button
                                    onClick={() => setShowProfileModal(true)}
                                    className="text-purple-600 text-xs sm:text-sm font-semibold hover:underline"
                                >
                                    Edit Profile
                                </button>
                            </div>

                            {user?.skills?.length > 0 || user?.interests?.length > 0 ? (
                                <div className="space-y-4 sm:space-y-5">
                                    {user.skills?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                                                <Zap size={14} className="text-blue-500 sm:w-4 sm:h-4" /> Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {user.skills.slice(0, 8).map((skill, i) => (
                                                    <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium border border-blue-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {user.skills.length > 8 && (
                                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-gray-500 text-xs sm:text-sm">+{user.skills.length - 8} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {user.interests?.length > 0 && (
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                                                <Heart size={14} className="text-pink-500 sm:w-4 sm:h-4" /> Interests
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {user.interests.slice(0, 8).map((interest, i) => (
                                                    <span key={i} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-pink-50 text-pink-700 rounded-lg text-xs sm:text-sm font-medium border border-pink-100">
                                                        {interest}
                                                    </span>
                                                ))}
                                                {user.interests.length > 8 && (
                                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-gray-500 text-xs sm:text-sm">+{user.interests.length - 8} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Star size={24} className="text-purple-500 sm:w-7 sm:h-7" />
                                    </div>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">Complete your profile</p>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Add skills and interests to get better matches</p>
                                    <button
                                        onClick={() => setShowProfileModal(true)}
                                        className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md"
                                    >
                                        Complete Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Suggested Connections */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-orange-50">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles size={18} className="text-purple-600 sm:w-5 sm:h-5" />
                                    Suggested Connections
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">Based on your skills</p>
                            </div>
                            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="p-4 sm:p-5 border border-gray-100 rounded-xl sm:rounded-2xl animate-pulse">
                                            <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-xl"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 sm:h-3 bg-gray-100 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                            <div className="h-8 sm:h-10 bg-gray-200 rounded-xl"></div>
                                        </div>
                                    ))
                                ) : suggestions.length > 0 ? (
                                    suggestions
                                        .filter(suggestion => {
                                            // Handle both formats: {user, matchScore} or flat user object with _id
                                            const userData = suggestion.user || suggestion
                                            return userData && userData._id
                                        })
                                        .map(suggestion => {
                                            // Handle both formats
                                            const userData = suggestion.user || suggestion
                                            return (
                                                <MatchCard
                                                    key={userData._id}
                                                    user={userData}
                                                    matchScore={suggestion.matchScore || userData.matchScore}
                                                    matchingSkills={suggestion.matchingSkills || userData.matchingSkills}
                                                    matchingInterests={suggestion.matchingInterests || userData.matchingInterests}
                                                    onConnect={handleConnect}
                                                    connecting={connectingId === userData._id}
                                                />
                                            )
                                        })
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <Users size={24} className="text-gray-400 sm:w-7 sm:h-7" />
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-500 font-medium mb-2">No suggestions yet</p>
                                        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Complete your profile to get personalized matches</p>
                                        <button
                                            onClick={() => setShowProfileModal(true)}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-purple-700 transition-colors"
                                        >
                                            Add Skills
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
