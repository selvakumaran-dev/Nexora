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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-orange-50/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent mb-2">
                        Advanced Search
                    </h1>
                    <p className="text-gray-600 text-lg">Find the perfect connections with powerful filters</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skills, interests, or keywords..."
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-lg"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${showFilters
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Sliders size={20} />
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
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
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Filter size={20} className="text-purple-600" />
                                        Filters
                                    </h3>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-purple-600 hover:underline font-medium"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Looking For */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Looking For
                                        </label>
                                        <select
                                            value={filters.lookingFor}
                                            onChange={(e) => setFilters({ ...filters, lookingFor: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        >
                                            <option value="">All</option>
                                            <option value="mentorship">Seeking Mentor</option>
                                            <option value="teaching">Open to Mentor</option>
                                            <option value="collaboration">Collaboration</option>
                                            <option value="learning">Learning</option>
                                            <option value="networking">Networking</option>
                                        </select>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Skills ({filters.skills.length})
                                        </label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                            {SKILLS.slice(0, 15).map(skill => (
                                                <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.skills.includes(skill)}
                                                        onChange={() => toggleSkill(skill)}
                                                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                                                        {skill}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interests */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Interests ({filters.interests.length})
                                        </label>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                            {INTERESTS.slice(0, 15).map(interest => (
                                                <label key={interest} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.interests.includes(interest)}
                                                        onChange={() => toggleInterest(interest)}
                                                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                                                    />
                                                    <span className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors">
                                                        {interest}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                            placeholder="City, Country"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                            <div className="flex items-center justify-between">
                                <p className="text-gray-600">
                                    {loading ? 'Searching...' : `${results.length} results found`}
                                </p>
                                {results.length > 0 && (
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            Sort by Relevance
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                        <div className="h-10 bg-gray-200 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {results.map(result => (
                                    <div key={result._id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group">
                                        <div className="flex items-start gap-4 mb-4">
                                            <img
                                                src={result.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${result.name}`}
                                                className="w-16 h-16 rounded-xl bg-gray-100"
                                                alt=""
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                                                    {result.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate">{result.headline || result.email}</p>
                                                {result.location && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} />
                                                        {result.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Skills & Interests */}
                                        {(result.skills?.length > 0 || result.interests?.length > 0) && (
                                            <div className="mb-4 space-y-2">
                                                {result.skills?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {result.skills.slice(0, 3).map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {result.skills.length > 3 && (
                                                            <span className="px-2.5 py-1 text-gray-500 text-xs">
                                                                +{result.skills.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleConnect(result._id)}
                                            disabled={connectingId === result._id}
                                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
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
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No results found</h3>
                                <p className="text-gray-500 mb-6">
                                    Try adjusting your filters or search query
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
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
