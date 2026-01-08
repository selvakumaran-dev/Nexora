import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { userService, contactService } from '../services/userService'
import {
    Search, Filter, X, Users, MapPin, Briefcase, GraduationCap,
    Code, Heart, Star, UserPlus, Check, ChevronDown, Sliders
} from 'lucide-react'
import { COMPUTER_SKILLS as SKILLS, INTERESTS } from '../data/skillsAndInterests'

// Advanced Search with Filters
export default function AdvancedSearchPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(true)
    const [connectingId, setConnectingId] = useState(null)

    // Filter states
    const [filters, setFilters] = useState({
        skills: [],
        interests: [],
        lookingFor: '',
        location: '',
        experience: '',
        availability: ''
    })

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    const handleSearch = async () => {
        setLoading(true)
        try {
            const params = {
                search: searchQuery,
                ...filters,
                skills: filters.skills.join(','),
                interests: filters.interests.join(',')
            }

            const res = await userService.searchAdvanced(params)
            if (res.success) {
                setResults(res.data.filter(u => u._id !== user?._id))
            }
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery || Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
                handleSearch()
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, filters])

    const handleConnect = async (userId) => {
        setConnectingId(userId)
        try {
            await contactService.sendRequest(userId)
            setResults(prev => prev.filter(r => r._id !== userId))
        } catch (error) {
            console.error('Failed to connect:', error)
        } finally {
            setConnectingId(null)
        }
    }

    const toggleSkill = (skill) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }))
    }

    const toggleInterest = (interest) => {
        setFilters(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const clearFilters = () => {
        setFilters({
            skills: [],
            interests: [],
            lookingFor: '',
            location: '',
            experience: '',
            availability: ''
        })
        setSearchQuery('')
    }

    const activeFilterCount = [
        filters.skills.length,
        filters.interests.length,
        filters.lookingFor ? 1 : 0,
        filters.location ? 1 : 0,
        filters.experience ? 1 : 0,
        filters.availability ? 1 : 0
    ].reduce((a, b) => a + b, 0)

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Advanced Search
                    </h1>
                    <p className="text-slate-600 text-lg">Find the perfect connections with powerful filters</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6 transition-all hover:border-blue-200">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skills, interests, or keywords..."
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-base bg-slate-50 focus:bg-white"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${showFilters
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Sliders size={18} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 sticky top-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Filter size={18} className="text-blue-600" />
                                        Filters
                                    </h3>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Looking For */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                                            Looking For
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={filters.lookingFor}
                                                onChange={(e) => setFilters({ ...filters, lookingFor: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white text-slate-700 font-medium"
                                            >
                                                <option value="">Any</option>
                                                <option value="mentorship">Seeking Mentor</option>
                                                <option value="teaching">Open to Mentor</option>
                                                <option value="collaboration">Collaboration</option>
                                                <option value="learning">Learning</option>
                                                <option value="networking">Networking</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center justify-between">
                                            Skills <span className="text-slate-400 font-normal text-xs">{filters.skills.length} selected</span>
                                        </label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {SKILLS.slice(0, 20).map(skill => (
                                                <label key={skill} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.skills.includes(skill) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                                        {filters.skills.includes(skill) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    {/* Hidden checkbox for accessibility */}
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.skills.includes(skill)}
                                                        onChange={() => toggleSkill(skill)}
                                                        className="hidden"
                                                    />
                                                    <span className={`text-sm transition-colors ${filters.skills.includes(skill) ? 'text-blue-700 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                        {skill}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center justify-between">
                                            Interests <span className="text-slate-400 font-normal text-xs">{filters.interests.length} selected</span>
                                        </label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {INTERESTS.slice(0, 15).map(interest => (
                                                <label key={interest} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.interests.includes(interest) ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-400'}`}>
                                                        {filters.interests.includes(interest) && <Check size={10} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.interests.includes(interest)}
                                                        onChange={() => toggleInterest(interest)}
                                                        className="hidden"
                                                    />
                                                    <span className={`text-sm transition-colors ${filters.interests.includes(interest) ? 'text-amber-700 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                        {interest}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                                            Location
                                        </label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={filters.location}
                                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                                placeholder="City, Country"
                                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4 flex items-center justify-between">
                            <p className="text-slate-600 font-medium">
                                {loading ? 'Searching...' : <><span className="text-slate-900 font-bold">{results.length}</span> results found</>}
                            </p>
                            {results.length > 0 && (
                                <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors font-medium">
                                    Sort by Relevance
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 h-64 animate-pulse">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-14 h-14 bg-slate-100 rounded-full"></div>
                                            <div className="flex-1 space-y-2 pt-2">
                                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {results.map(result => (
                                    <div key={result._id} className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group flex flex-col h-full">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="relative">
                                                <img
                                                    src={result.avatarUrl || `https://ui-avatars.com/api/?name=${result.name}&background=random`}
                                                    className="w-16 h-16 rounded-full bg-slate-100 object-cover border border-slate-100"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors">
                                                    {result.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 truncate mb-1">{result.headline || result.email}</p>
                                                {result.location && (
                                                    <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                                        <MapPin size={12} />
                                                        {result.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Skills & Interests */}
                                        <div className="flex-1">
                                            {(result.skills?.length > 0 || result.interests?.length > 0) && (
                                                <div className="space-y-3 mb-4">
                                                    {result.skills?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {result.skills.slice(0, 3).map((skill, i) => (
                                                                <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded text-xs font-medium">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {result.skills.length > 3 && (
                                                                <span className="px-2 py-1 text-slate-400 text-xs font-medium">
                                                                    +{result.skills.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleConnect(result._id)}
                                            disabled={connectingId === result._id}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm mt-auto"
                                        >
                                            {connectingId === result._id ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} />
                                                    Connect
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                                <p className="text-slate-500 mb-8 max-w-sm">
                                    We couldn't find anyone matching your specific criteria. Try refreshing filters or using a broader search.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
