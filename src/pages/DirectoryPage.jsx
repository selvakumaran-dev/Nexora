import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { userService, contactService } from '../services/userService'
import { SKILL_FILTERS, LOOKING_FOR_OPTIONS } from '../data/skillsAndInterests'
import {
    Search, Filter, Grid, List, MessageSquare, UserPlus, Check,
    Sparkles, Users, Zap, TrendingUp, Award, Target, Star,
    MapPin, Briefcase, GraduationCap, Code, Brain, Heart,
    ArrowUpRight, X, SlidersHorizontal, ChevronDown, Verified
} from 'lucide-react'

export default function DirectoryPage() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { createPrivateChat } = useChat()

    const [viewMode, setViewMode] = useState('grid')
    const [members, setMembers] = useState([])
    const [contacts, setContacts] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [connecting, setConnecting] = useState({})
    const [skillFilter, setSkillFilter] = useState('All')
    const [lookingForFilter, setLookingForFilter] = useState('All')
    const [experienceFilter, setExperienceFilter] = useState('All')
    const [sortBy, setSortBy] = useState('matchScore') // matchScore, name, recent
    const [showFilters, setShowFilters] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)

    const isProfileComplete = user?.skills?.length > 0 && user?.interests?.length > 0

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadData()
    }, [isAuthenticated, navigate])

    const loadData = async () => {
        setLoading(true)
        try {
            let usersData = []

            if (isProfileComplete) {
                try {
                    const suggestionsRes = await userService.getDiscoverSuggestions(50)
                    if (suggestionsRes.success && suggestionsRes.data.length > 0) {
                        usersData = suggestionsRes.data.map(item => ({
                            ...item.user,
                            matchScore: item.matchScore,
                            matchingSkills: item.matchingSkills,
                            matchingInterests: item.matchingInterests
                        }))
                    }
                } catch (e) {
                    console.log('Error loading suggestions:', e)
                }
            }

            setMembers(usersData)

            const contactsRes = await contactService.getContacts()
            if (contactsRes.success) {
                const contactMap = {}
                contactsRes.data.forEach(c => {
                    contactMap[c.contactId._id || c.contactId] = c.status
                })
                setContacts(contactMap)
            }
        } catch (error) {
            console.error('Failed to load discover:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnect = async (userId) => {
        setConnecting(prev => ({ ...prev, [userId]: true }))
        try {
            await contactService.sendRequest(userId)
            setContacts(prev => ({ ...prev, [userId]: 'pending' }))
        } catch (error) {
            console.error('Failed to send request:', error)
        } finally {
            setConnecting(prev => ({ ...prev, [userId]: false }))
        }
    }

    const handleMessage = async (userId) => {
        try {
            await createPrivateChat(userId)
            navigate('/chat')
        } catch (error) {
            console.error('Failed to create chat:', error)
        }
    }

    const getConnectionStatus = (userId) => {
        return contacts[userId] || null
    }

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
            member.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesSkill = skillFilter === 'All' ||
            member.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))

        const matchesLookingFor = lookingForFilter === 'All' ||
            member.lookingFor === lookingForFilter

        const matchesExperience = experienceFilter === 'All' ||
            member.experience === experienceFilter

        return matchesSearch && matchesSkill && matchesLookingFor && matchesExperience
    })

    // Sort members
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        switch (sortBy) {
            case 'matchScore':
                return (b.matchScore || 0) - (a.matchScore || 0)
            case 'name':
                return (a.name || '').localeCompare(b.name || '')
            case 'recent':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            default:
                return 0
        }
    })

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-orange-50/30 pb-20 md:pb-0">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                {/* Premium Header with Stats */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 mb-2">
                                <Sparkles className="text-purple-600" size={28} />
                                Discover Professionals
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600">
                                {loading ? 'Finding your perfect matches...' :
                                    isProfileComplete
                                        ? `${members.length} professionals matched based on your skills & interests`
                                        : 'Complete your profile to see personalized matches'}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        {isProfileComplete && !loading && (
                            <div className="flex gap-3 sm:gap-4">
                                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <TrendingUp size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Avg Match</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {members.length > 0 ? Math.round(members.reduce((acc, m) => acc + (m.matchScore || 0), 0) / members.length) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                            <Users size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Available</p>
                                            <p className="text-lg font-bold text-gray-900">{members.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advanced Search & Filters Bar */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, skills, interests, or expertise..."
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
                                />
                            </div>

                            {/* Filter & Sort Controls */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm ${showFilters ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
                                            }`}
                                    >
                                        <SlidersHorizontal size={16} />
                                        <span className="hidden sm:inline">Advanced Filters</span>
                                        <span className="sm:hidden">Filters</span>
                                        {(skillFilter !== 'All' || lookingForFilter !== 'All' || experienceFilter !== 'All') && (
                                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        )}
                                    </button>

                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none px-3 sm:px-4 py-2 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-sm cursor-pointer"
                                        >
                                            <option value="matchScore">Best Match</option>
                                            <option value="name">Name (A-Z)</option>
                                            <option value="recent">Recently Joined</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 hidden sm:inline">View:</span>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <Grid size={16} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <List size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Filters Panel */}
                            {showFilters && (
                                <div className="grid gap-4 pt-4 border-t border-gray-100 animate-fade-in">
                                    {/* Skill Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Zap size={14} className="text-blue-500" />
                                            Filter by Skill
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {SKILL_FILTERS.map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => setSkillFilter(skill)}
                                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${skillFilter === skill
                                                        ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Looking For Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Target size={14} className="text-purple-500" />
                                            Looking For
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {LOOKING_FOR_OPTIONS.map(option => (
                                                <button
                                                    key={option}
                                                    onClick={() => setLookingForFilter(option)}
                                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize ${lookingForFilter === option
                                                        ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                                        }`}
                                                >
                                                    {option === 'All' ? 'All' : option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Experience Level Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Award size={14} className="text-orange-500" />
                                            Experience Level
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {['All', 'beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setExperienceFilter(level)}
                                                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize ${experienceFilter === level
                                                        ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm'
                                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                                                        }`}
                                                >
                                                    {level === 'All' ? 'All Levels' : level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    {(skillFilter !== 'All' || lookingForFilter !== 'All' || experienceFilter !== 'All') && (
                                        <button
                                            onClick={() => {
                                                setSkillFilter('All')
                                                setLookingForFilter('All')
                                                setExperienceFilter('All')
                                            }}
                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 self-start"
                                        >
                                            <X size={14} />
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{sortedMembers.length}</span> of <span className="font-semibold text-gray-900">{members.length}</span> professionals
                    </p>
                    {sortedMembers.length > 0 && (
                        <p className="text-xs text-gray-500">
                            Sorted by: <span className="font-medium text-gray-700">
                                {sortBy === 'matchScore' ? 'Best Match' : sortBy === 'name' ? 'Name' : 'Recently Joined'}
                            </span>
                        </p>
                    )}
                </div>

                {/* Members Grid/List */}
                {loading ? (
                    <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-3 sm:space-y-4'}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 animate-pulse">
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-200"></div>
                                    <div className="flex-1">
                                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 sm:h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
                                        <div className="flex gap-2">
                                            <div className="h-5 sm:h-6 bg-gray-100 rounded-full w-12 sm:w-16"></div>
                                            <div className="h-5 sm:h-6 bg-gray-100 rounded-full w-16 sm:w-20"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedMembers.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-purple-600 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            {!isProfileComplete ? 'Complete Your Profile' : 'No Matches Found'}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
                            {!isProfileComplete
                                ? 'Add skills and interests to your profile to discover people who match your expertise and passions'
                                : 'No members found matching your criteria. Try adjusting your filters or check back later'}
                        </p>
                        {!isProfileComplete && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md text-sm sm:text-base"
                            >
                                Complete Profile
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-3 sm:space-y-4'}>
                        {sortedMembers.map(member => (
                            <MemberCard
                                key={member._id}
                                member={member}
                                viewMode={viewMode}
                                connectionStatus={getConnectionStatus(member._id)}
                                connecting={connecting[member._id]}
                                onConnect={() => handleConnect(member._id)}
                                onMessage={() => handleMessage(member._id)}
                                onViewProfile={() => setSelectedMember(member)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Profile Detail Modal */}
            {selectedMember && (
                <ProfileDetailModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    connectionStatus={getConnectionStatus(selectedMember._id)}
                    connecting={connecting[selectedMember._id]}
                    onConnect={() => handleConnect(selectedMember._id)}
                    onMessage={() => handleMessage(selectedMember._id)}
                />
            )}
        </div>
    )
}

// Premium Member Card Component
function MemberCard({ member, viewMode, connectionStatus, connecting, onConnect, onMessage, onViewProfile }) {
    const statusColors = {
        online: 'bg-green-500',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
        offline: 'bg-gray-400'
    }

    const lookingForLabels = {
        mentorship: '🎓 Seeking Mentor',
        teaching: '👨‍🏫 Open to Mentor',
        collaboration: '🤝 Collaboration',
        learning: '📚 Learning',
        networking: '🌐 Networking'
    }

    const experienceColors = {
        beginner: 'bg-green-100 text-green-700 border-green-200',
        intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
        advanced: 'bg-purple-100 text-purple-700 border-purple-200',
        expert: 'bg-orange-100 text-orange-700 border-orange-200'
    }

    const matchScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50'
        if (score >= 60) return 'text-blue-600 bg-blue-50'
        if (score >= 40) return 'text-orange-600 bg-orange-50'
        return 'text-gray-600 bg-gray-50'
    }

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 border border-gray-100 hover:shadow-lg hover:border-purple-100 transition-all group cursor-pointer"
                onClick={onViewProfile}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                        <img
                            src={member.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.name}`}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gray-100"
                            alt=""
                        />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 ${statusColors[member.status]} rounded-full border-2 border-white`}></div>
                        {member.matchScore && member.matchScore >= 70 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Star size={10} className="text-white fill-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate group-hover:text-purple-600 transition-colors">{member.name}</h3>
                            {member.matchScore && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${matchScoreColor(member.matchScore)}`}>
                                    {member.matchScore}% Match
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 truncate mb-1">{member.headline || member.email}</p>
                        {member.matchingSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {member.matchingSkills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="px-1.5 sm:px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] sm:text-xs font-medium border border-purple-100">
                                        {skill}
                                    </span>
                                ))}
                                {member.matchingSkills.length > 3 && (
                                    <span className="text-[10px] sm:text-xs text-gray-500">+{member.matchingSkills.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {connectionStatus === 'accepted' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMessage(); }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                            >
                                <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Message</span>
                            </button>
                        ) : connectionStatus === 'pending' ? (
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-gray-500 rounded-lg text-xs sm:text-sm font-medium">
                                Pending
                            </span>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onConnect(); }}
                                disabled={connecting}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 shadow-md text-xs sm:text-sm"
                            >
                                {connecting ? (
                                    <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <UserPlus size={14} className="sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Connect</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            onClick={onViewProfile}>
            {/* Match Score Badge */}
            {member.matchScore && (
                <div className="absolute top-4 right-4 z-10">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${matchScoreColor(member.matchScore)} border shadow-sm`}>
                        {member.matchScore}% Match
                    </div>
                </div>
            )}

            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div className="relative">
                    <img
                        src={member.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.name}`}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100"
                        alt=""
                    />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 ${statusColors[member.status]} rounded-full border-2 border-white`}></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 truncate group-hover:text-purple-600 transition-colors">{member.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{member.headline || member.email}</p>
                    {member.lookingFor && (
                        <span className="inline-block mt-2 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            {lookingForLabels[member.lookingFor] || member.lookingFor}
                        </span>
                    )}
                </div>
            </div>

            {member.bio && (
                <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">{member.bio}</p>
            )}

            {/* Matching Skills */}
            {member.matchingSkills?.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <Zap size={12} /> Matching Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {member.matchingSkills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium border border-purple-100">
                                {skill}
                            </span>
                        ))}
                        {member.matchingSkills.length > 4 && (
                            <span className="px-2 py-1 text-gray-400 text-xs">+{member.matchingSkills.length - 4}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Matching Interests */}
            {member.matchingInterests?.length > 0 && (
                <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <Heart size={12} /> Matching Interests
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {member.matchingInterests.slice(0, 3).map((interest, i) => (
                            <span key={i} className="px-2 py-1 bg-pink-50 text-pink-600 rounded-lg text-xs font-medium border border-pink-100">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience Badge */}
            {member.experience && (
                <div className="mb-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${experienceColors[member.experience]}`}>
                        {member.experience === 'beginner' && '🌱 '}
                        {member.experience === 'intermediate' && '📈 '}
                        {member.experience === 'advanced' && '⚡ '}
                        {member.experience === 'expert' && '🏆 '}
                        {member.experience.charAt(0).toUpperCase() + member.experience.slice(1)}
                    </span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
                {connectionStatus === 'accepted' ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onMessage(); }}
                        className="flex-1 py-2 sm:py-2.5 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <MessageSquare size={16} />
                        Message
                    </button>
                ) : connectionStatus === 'pending' ? (
                    <button
                        disabled
                        className="flex-1 py-2 sm:py-2.5 bg-gray-100 text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2 text-sm"
                    >
                        <Check size={16} />
                        Request Sent
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onConnect(); }}
                        disabled={connecting}
                        className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md text-sm"
                    >
                        {connecting ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                Connect
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

// Profile Detail Modal Component
function ProfileDetailModal({ member, onClose, connectionStatus, connecting, onConnect, onMessage }) {
    const experienceColors = {
        beginner: 'bg-green-100 text-green-700',
        intermediate: 'bg-blue-100 text-blue-700',
        advanced: 'bg-purple-100 text-purple-700',
        expert: 'bg-orange-100 text-orange-700'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-start gap-4">
                        <img
                            src={member.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.name}`}
                            className="w-20 h-20 rounded-xl bg-white/10"
                            alt=""
                        />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
                            <p className="text-white/90">{member.headline || member.email}</p>
                            {member.matchScore && (
                                <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                                    {member.matchScore}% Match Score
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Bio */}
                    {member.bio && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">About</h3>
                            <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                        </div>
                    )}

                    {/* Experience Level */}
                    {member.experience && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Experience Level</h3>
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${experienceColors[member.experience]}`}>
                                {member.experience.charAt(0).toUpperCase() + member.experience.slice(1)}
                            </span>
                        </div>
                    )}

                    {/* Matching Skills */}
                    {member.matchingSkills?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Zap size={20} className="text-purple-600" />
                                Matching Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {member.matchingSkills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Skills */}
                    {member.skills?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Code size={20} className="text-blue-600" />
                                All Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {member.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Matching Interests */}
                    {member.matchingInterests?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Heart size={20} className="text-pink-600" />
                                Matching Interests
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {member.matchingInterests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium border border-pink-100">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Interests */}
                    {member.interests?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Sparkles size={20} className="text-orange-600" />
                                All Interests
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {member.interests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        {connectionStatus === 'accepted' ? (
                            <button
                                onClick={onMessage}
                                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} />
                                Send Message
                            </button>
                        ) : connectionStatus === 'pending' ? (
                            <button
                                disabled
                                className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Request Sent
                            </button>
                        ) : (
                            <button
                                onClick={onConnect}
                                disabled={connecting}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {connecting ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Send Connection Request
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
