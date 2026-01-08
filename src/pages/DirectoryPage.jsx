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
    const [sortBy, setSortBy] = useState('matchScore')
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

    const getConnectionStatus = (userId) => contacts[userId] || null

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

    const sortedMembers = [...filteredMembers].sort((a, b) => {
        switch (sortBy) {
            case 'matchScore': return (b.matchScore || 0) - (a.matchScore || 0)
            case 'name': return (a.name || '').localeCompare(b.name || '')
            case 'recent': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            default: return 0
        }
    })

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <Navbar />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                                <Sparkles className="text-blue-600 shrink-0" size={24} />
                                <span className="truncate">Discover Professionals</span>
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
                                {loading ? 'Finding your perfect matches...' :
                                    isProfileComplete
                                        ? `${members.length} professionals matched based on your skills & interests`
                                        : 'Complete your profile to see personalized matches'}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        {isProfileComplete && !loading && members.length > 0 && (
                            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                                <div className="bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-4 border border-slate-200 shadow-sm shrink-0 min-w-[140px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100/50 rounded-lg flex items-center justify-center shrink-0">
                                            <TrendingUp size={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Match</p>
                                            <p className="text-lg sm:text-xl font-bold text-slate-900">
                                                {members.length > 0 ? Math.round(members.reduce((acc, m) => acc + (m.matchScore || 0), 0) / members.length) : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl px-4 sm:px-5 py-3 sm:py-4 border border-slate-200 shadow-sm shrink-0 min-w-[140px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100/50 rounded-lg flex items-center justify-center shrink-0">
                                            <Users size={16} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Available</p>
                                            <p className="text-lg sm:text-xl font-bold text-slate-900">{members.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 sm:mb-8 sticky top-[72px] sm:top-[88px] z-30 transition-all">
                        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, skills, or headline..."
                                    className="w-full h-11 sm:h-12 pl-12 pr-4 bg-slate-50 border-2 border-transparent rounded-xl sm:rounded-2xl text-sm focus:bg-white focus:border-blue-100 transition-all font-medium"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex-1 md:flex-none h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-black transition-all ${showFilters ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'}`}
                                >
                                    <SlidersHorizontal size={18} />
                                    <span>Filters</span>
                                    {(skillFilter !== 'All' || lookingForFilter !== 'All' || experienceFilter !== 'All') && (
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                <div className="flex p-1 bg-slate-50 rounded-xl sm:rounded-2xl gap-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="animate-in slide-in-from-top-4 duration-200 mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                                    <select
                                        value={skillFilter}
                                        onChange={(e) => setSkillFilter(e.target.value)}
                                        className="w-full h-11 rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-700 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                    >
                                        <option value="All">All Specialist</option>
                                        {SKILL_FILTERS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Goal Indicator</label>
                                    <select
                                        value={lookingForFilter}
                                        onChange={(e) => setLookingForFilter(e.target.value)}
                                        className="w-full h-11 rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-700 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                    >
                                        <option value="All">All Goals</option>
                                        {LOOKING_FOR_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Members</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full h-11 rounded-xl bg-slate-50 px-4 text-sm font-bold text-slate-700 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                    >
                                        <option value="matchScore">Best Match First</option>
                                        <option value="name">Alphabetical</option>
                                        <option value="recent">Recently Joined</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Matching with peers...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="py-20 px-6 text-center bg-white rounded-3xl border border-slate-200">
                        <Users className="w-16 h-16 mx-auto mb-6 text-slate-200" strokeWidth={1.5} />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No professionals found</h3>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
                            {members.length === 0
                                ? 'Add skills and interests to see professionals that match your profile.'
                                : 'We couldn\'t find any members matching your criteria. Try adjusting your filters.'}
                        </p>
                        {!isProfileComplete && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                            >
                                Sync Profile
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6' : 'flex flex-col gap-4'}>
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

function MemberCard({ member, viewMode, connectionStatus, connecting, onConnect, onMessage, onViewProfile }) {
    const statusColors = { online: 'bg-emerald-500', away: 'bg-amber-500', busy: 'bg-red-500', offline: 'bg-slate-300' }
    const experienceColors = {
        beginner: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        intermediate: 'bg-blue-50 text-blue-700 border-blue-100',
        advanced: 'bg-purple-50 text-purple-700 border-purple-100',
        expert: 'bg-amber-50 text-amber-700 border-amber-100'
    }

    const matchScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100'
        if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-100'
        return 'text-slate-700 bg-slate-50 border-slate-100'
    }

    if (viewMode === 'list') {
        return (
            <div className={`bg-white rounded-xl p-5 border border-slate-200 transition-all hover:border-blue-300 hover:shadow-md cursor-pointer group ${connectionStatus === 'accepted' ? 'hover:border-slate-300' : ''}`} onClick={onViewProfile}>
                <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        <img
                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                            className="w-14 h-14 rounded-full bg-slate-100 object-cover border border-slate-100"
                            alt=""
                        />
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[member.status] || statusColors.offline}`} />
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{member.name}</h3>
                                {member.matchScore && (
                                    <span className={`px-2 py-0.5 rounded textxs font-bold border ${matchScoreColor(member.matchScore)}`}>
                                        {member.matchScore}%
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 truncate">{member.headline || member.email}</p>
                        </div>

                        <div className="hidden md:flex flex-wrap gap-1.5">
                            {member.matchingSkills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs font-medium border border-slate-100">{skill}</span>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <ActionButton
                                status={connectionStatus}
                                connecting={connecting}
                                onConnect={onConnect}
                                onMessage={onMessage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group cursor-pointer flex flex-col h-full" onClick={onViewProfile}>
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                        <img
                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                            className="w-16 h-16 rounded-full bg-slate-100 object-cover border border-slate-100"
                            alt=""
                        />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusColors[member.status] || statusColors.offline}`} />
                    </div>
                    {member.matchScore && (
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${matchScoreColor(member.matchScore)}`}>
                            {member.matchScore}% Match
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-1">{member.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{member.headline || member.email}</p>
                </div>

                {member.experience && (
                    <div className="mb-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${experienceColors[member.experience]}`}>
                            {member.experience.charAt(0).toUpperCase() + member.experience.slice(1)}
                        </span>
                    </div>
                )}

                {member.matchingSkills?.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <Zap size={12} /> Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {member.matchingSkills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs font-medium border border-slate-100">
                                    {skill}
                                </span>
                            ))}
                            {member.matchingSkills.length > 3 && (
                                <span className="px-2 py-1 text-slate-400 text-xs font-medium">+{member.matchingSkills.length - 3}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/50 rounded-b-xl">
                <ActionButton
                    status={connectionStatus}
                    connecting={connecting}
                    onConnect={onConnect}
                    onMessage={onMessage}
                    fullWidth
                />
            </div>
        </div>
    )
}

function ActionButton({ status, connecting, onConnect, onMessage, fullWidth }) {
    const baseClass = `font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${fullWidth ? 'w-full py-2.5' : 'px-4 py-2'}`

    if (status === 'accepted') {
        return (
            <button
                onClick={(e) => { e.stopPropagation(); onMessage(); }}
                className={`${baseClass} bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200`}
            >
                <MessageSquare size={16} /> <span className={!fullWidth ? 'hidden sm:inline' : ''}>Message</span>
            </button>
        )
    }

    if (status === 'pending') {
        return (
            <button disabled className={`${baseClass} bg-slate-100 text-slate-500 cursor-not-allowed`}>
                <Check size={16} /> <span className={!fullWidth ? 'hidden sm:inline' : ''}>Pending</span>
            </button>
        )
    }

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onConnect(); }}
            disabled={connecting}
            className={`${baseClass} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 shadow-sm`}
        >
            {connecting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    <UserPlus size={16} /> <span className={!fullWidth ? 'hidden sm:inline' : ''}>Connect</span>
                </>
            )}
        </button>
    )
}

function ProfileDetailModal({ member, onClose, connectionStatus, connecting, onConnect, onMessage }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Profile Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <img
                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                            className="w-24 h-24 rounded-full bg-slate-100 object-cover border-4 border-slate-50 shadow-sm"
                            alt=""
                        />
                        <div className="flex-1 space-y-2">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
                                <p className="text-slate-500 font-medium">{member.headline || member.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {member.experience && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-sm font-medium border border-slate-200 capitalize">
                                        {member.experience}
                                    </span>
                                )}
                                {member.matchScore && (
                                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-sm font-bold border border-green-200">
                                        {member.matchScore}% Match
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {member.bio && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">About</h3>
                            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{member.bio}</p>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        {member.skills?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Code size={16} className="text-blue-500" /> Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {member.interests?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-500" /> Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.interests.map((interest, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-100">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    <div className="flex gap-3">
                        {connectionStatus === 'accepted' ? (
                            <button
                                onClick={onMessage}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} /> Send Message
                            </button>
                        ) : (
                            <button
                                onClick={onConnect}
                                disabled={connectionStatus === 'pending' || connecting}
                                className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${connectionStatus === 'pending'
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                    }`}
                            >
                                {connectionStatus === 'pending' ? (
                                    <>
                                        <Check size={18} /> Request Pending
                                    </>
                                ) : connecting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus size={18} /> Connect
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
