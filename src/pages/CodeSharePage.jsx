import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { contactService } from '../services/userService'
import codeService from '../services/codeService'
import {
    Code, Plus, Search, Share2, Copy, Check, User, Clock, Heart,
    MessageSquare, GitBranch, Terminal, Sparkles, ChevronDown, X, Eye,
    Trash2, Edit3, Download, Star, MoreVertical, Lock, Globe, Users,
    FolderOpen, Filter, SortAsc, Bookmark, ExternalLink, Play
} from 'lucide-react'

// Code snippet languages with icons
const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', color: '#F7DF1E', icon: '⚡' },
    { id: 'python', name: 'Python', color: '#3776AB', icon: '🐍' },
    { id: 'typescript', name: 'TypeScript', color: '#3178C6', icon: '📘' },
    { id: 'react', name: 'React/JSX', color: '#61DAFB', icon: '⚛️' },
    { id: 'html', name: 'HTML', color: '#E34F26', icon: '🌐' },
    { id: 'css', name: 'CSS', color: '#1572B6', icon: '🎨' },
    { id: 'java', name: 'Java', color: '#ED8B00', icon: '☕' },
    { id: 'csharp', name: 'C#', color: '#239120', icon: '🔷' },
    { id: 'go', name: 'Go', color: '#00ADD8', icon: '🐹' },
    { id: 'rust', name: 'Rust', color: '#DEA584', icon: '🦀' },
    { id: 'sql', name: 'SQL', color: '#336791', icon: '🗃️' },
    { id: 'bash', name: 'Bash', color: '#4EAA25', icon: '💻' },
    { id: 'php', name: 'PHP', color: '#777BB4', icon: '🐘' },
    { id: 'ruby', name: 'Ruby', color: '#CC342D', icon: '💎' },
    { id: 'swift', name: 'Swift', color: '#FA7343', icon: '🍎' },
    { id: 'kotlin', name: 'Kotlin', color: '#7F52FF', icon: '🎯' },
]

// Visibility options (no public option - only private or connections)
const VISIBILITY_OPTIONS = [
    { id: 'private', name: 'Private', icon: Lock, description: 'Only you can see' },
    { id: 'connections', name: 'Connections', icon: Users, description: 'Share with selected connections' },
]

// New Code Modal - Premium Version
function NewCodeModal({ isOpen, onClose, onSubmit, contacts, editSnippet = null }) {
    const [title, setTitle] = useState(editSnippet?.title || '')
    const [language, setLanguage] = useState(editSnippet?.language || 'javascript')
    const [code, setCode] = useState(editSnippet?.code || '')
    const [description, setDescription] = useState(editSnippet?.description || '')
    const [visibility, setVisibility] = useState(editSnippet?.visibility || 'connections')
    const [shareWith, setShareWith] = useState(editSnippet?.sharedWith?.map(u => u._id || u) || [])
    const [tags, setTags] = useState(editSnippet?.tags?.join(', ') || '')

    useEffect(() => {
        if (editSnippet) {
            setTitle(editSnippet.title || '')
            setLanguage(editSnippet.language || 'javascript')
            setCode(editSnippet.code || '')
            setDescription(editSnippet.description || '')
            setVisibility(editSnippet.visibility || 'connections')
            setShareWith(editSnippet.sharedWith?.map(u => u._id || u) || [])
            setTags(editSnippet.tags?.join(', ') || '')
        }
    }, [editSnippet])

    if (!isOpen) return null

    const handleSubmit = () => {
        if (!title.trim() || !code.trim()) return
        onSubmit({
            _id: editSnippet?._id,
            title: title.trim(),
            language,
            code: code.trim(),
            description: description.trim(),
            visibility,
            sharedWith: visibility === 'connections' ? shareWith : [],
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        })
        resetForm()
        onClose()
    }

    const resetForm = () => {
        setTitle('')
        setCode('')
        setDescription('')
        setVisibility('connections')
        setShareWith([])
        setTags('')
    }

    const toggleShare = (userId) => {
        setShareWith(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-400 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                {editSnippet ? <Edit3 size={24} /> : <Code size={24} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{editSnippet ? 'Edit Snippet' : 'Create Code Snippet'}</h2>
                                <p className="text-purple-100 text-sm">Share your code with your network</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
                    {/* Title & Language Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Quick Sort Algorithm"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 appearance-none bg-white transition-all"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>
                                            {lang.icon} {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this code do? Any special notes?"
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all"
                        />
                    </div>

                    {/* Code Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Code <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900 rounded-t-xl flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-gray-400 text-xs ml-2">{LANGUAGES.find(l => l.id === language)?.name}</span>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Paste your code here..."
                                rows={10}
                                className="w-full px-4 py-4 pt-14 bg-slate-950 text-green-400 font-mono text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                                style={{ tabSize: 4 }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tags <span className="text-gray-400 text-xs">(comma-separated)</span>
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., algorithm, sorting, performance"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Visibility</label>
                        <div className="grid grid-cols-3 gap-3">
                            {VISIBILITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setVisibility(opt.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left ${visibility === opt.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <opt.icon size={20} className={visibility === opt.id ? 'text-purple-600' : 'text-gray-400'} />
                                    <p className={`font-medium mt-1 text-sm ${visibility === opt.id ? 'text-purple-700' : 'text-gray-700'}`}>
                                        {opt.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{opt.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Share With (only for connections visibility) */}
                    {visibility === 'connections' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Share With <span className="text-red-500">*</span>
                                <span className="text-gray-400 text-xs ml-2">({shareWith.length} selected)</span>
                            </label>
                            {contacts.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-xl">
                                    No connections yet. Connect with people to share code!
                                </p>
                            ) : (
                                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                                    {contacts.map(contact => (
                                        <label
                                            key={contact._id}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${shareWith.includes(contact._id) ? 'bg-purple-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={shareWith.includes(contact._id)}
                                                onChange={() => toggleShare(contact._id)}
                                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                            />
                                            <img
                                                src={contact.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${contact.name}`}
                                                className="w-8 h-8 rounded-full bg-gray-100"
                                                alt=""
                                            />
                                            <span className="text-sm font-medium text-gray-700">{contact.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !code.trim() || (visibility === 'connections' && shareWith.length === 0)}
                        className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    >
                        {editSnippet ? <Check size={18} /> : <Plus size={18} />}
                        {editSnippet ? 'Save Changes' : 'Create Snippet'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Delete Confirmation Modal
function DeleteModal({ isOpen, onClose, onConfirm, snippetTitle }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Snippet?</h3>
                    <p className="text-gray-600 text-center mb-6">
                        Are you sure you want to delete "<strong>{snippetTitle}</strong>"?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Premium Code Card
function CodeCard({ snippet, onCopy, onView, onEdit, onDelete, onStar, isOwner, currentUserId }) {
    const lang = LANGUAGES.find(l => l.id === snippet.language) || LANGUAGES[0]
    const [copied, setCopied] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        onCopy?.()
    }

    const handleDownload = () => {
        const blob = new Blob([snippet.code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${snippet.title.replace(/\s+/g, '_')}.${lang.id === 'react' ? 'jsx' : lang.id}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const formatDate = (date) => {
        const d = new Date(date)
        const now = new Date()
        const diffMs = now - d
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return d.toLocaleDateString()
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden group">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${lang.color}15` }}
                        >
                            {lang.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                                {snippet.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span className="px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${lang.color}20`, color: lang.color }}>
                                    {lang.name}
                                </span>
                                <span>•</span>
                                <Clock size={12} />
                                <span>{formatDate(snippet.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                                    <button
                                        onClick={() => { onView?.(); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Eye size={16} /> View Code
                                    </button>
                                    <button
                                        onClick={() => { handleCopy(); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Copy size={16} /> Copy Code
                                    </button>
                                    <button
                                        onClick={() => { handleDownload(); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                    <button
                                        onClick={() => { onStar?.(snippet._id); setShowMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Star size={16} className={snippet.starred?.some(u => (u._id === currentUserId || u === currentUserId)) ? 'text-yellow-500 fill-yellow-500' : ''} />
                                        {snippet.starred?.some(u => (u._id === currentUserId || u === currentUserId)) ? 'Unstar' : 'Star'}
                                    </button>
                                    {isOwner && (
                                        <>
                                            <div className="border-t border-gray-100 my-1" />
                                            <button
                                                onClick={() => { onEdit?.(snippet); setShowMenu(false); }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit3 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => { onDelete?.(snippet); setShowMenu(false); }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Description */}
                {snippet.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{snippet.description}</p>
                )}

                {/* Tags */}
                {snippet.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {snippet.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                        {snippet.tags.length > 4 && (
                            <span className="text-xs text-gray-400">+{snippet.tags.length - 4}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Code Preview */}
            <div className="bg-slate-950 p-4 max-h-36 overflow-hidden relative cursor-pointer" onClick={onView}>
                <pre className="text-xs text-green-400 font-mono overflow-hidden">
                    <code>{snippet.code.substring(0, 500)}</code>
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-xs text-gray-400 bg-slate-800 px-3 py-1 rounded-full">
                        Click to view full code
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <img
                        src={snippet.author?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${snippet.author?.name}`}
                        className="w-7 h-7 rounded-full bg-gray-100"
                        alt=""
                    />
                    <span className="text-sm text-gray-600 font-medium">{snippet.author?.name}</span>
                    {isOwner && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                            You
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <span className="flex items-center gap-1 text-xs">
                        <Eye size={14} /> {snippet.views || 0}
                    </span>
                    {snippet.starred && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    )}
                    {snippet.visibility === 'private' && <Lock size={14} />}
                    {snippet.visibility === 'connections' && <Users size={14} />}
                </div>
            </div>
        </div>
    )
}

// View Code Modal
function ViewCodeModal({ snippet, isOpen, onClose }) {
    const [copied, setCopied] = useState(false)
    const lang = LANGUAGES.find(l => l.id === snippet?.language) || LANGUAGES[0]

    if (!isOpen || !snippet) return null

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${lang.color}20` }}
                        >
                            {lang.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{snippet.title}</h3>
                            <p className="text-sm text-gray-400">{lang.name} • {snippet.code.split('\n').length} lines</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Code */}
                <div className="max-h-[70vh] overflow-auto p-6">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                        <code>{snippet.code}</code>
                    </pre>
                </div>

                {/* Footer */}
                {snippet.description && (
                    <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                        <p className="text-sm text-gray-400">{snippet.description}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// Main Page
export default function CodeSharePage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [snippets, setSnippets] = useState([])
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showNewCode, setShowNewCode] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('all')
    const [viewSnippet, setViewSnippet] = useState(null)
    const [editSnippet, setEditSnippet] = useState(null)
    const [deleteSnippet, setDeleteSnippet] = useState(null)
    const [filterTab, setFilterTab] = useState('all') // all, my, starred, shared
    const [localSnippetsCount, setLocalSnippetsCount] = useState(0)
    const [migrating, setMigrating] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadData()
        // Check for local snippets
        const saved = JSON.parse(localStorage.getItem('nexora_snippets') || '[]')
        setLocalSnippetsCount(saved.length)
    }, [isAuthenticated, navigate])

    const loadData = async () => {
        setLoading(true)
        try {
            const contactsRes = await contactService.getContacts()
            if (contactsRes.success) {
                const acceptedContacts = contactsRes.data
                    .filter(c => c.status === 'accepted')
                    .map(c => c.contactId)
                setContacts(acceptedContacts)
            }

            const codeRes = await codeService.getSnippets()
            if (codeRes.success) {
                setSnippets(codeRes.data)
            }
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewSnippet = async (snippetData) => {
        try {
            if (snippetData._id) {
                // Edit existing
                const res = await codeService.updateSnippet(snippetData._id, snippetData)
                if (res.success) {
                    setSnippets(prev => prev.map(s => s._id === res.data._id ? res.data : s))
                }
            } else {
                // Create new
                const res = await codeService.createSnippet(snippetData)
                if (res.success) {
                    setSnippets(prev => [res.data, ...prev])
                }
            }
        } catch (err) {
            console.error('Failed to save snippet:', err)
            if (err.response && err.response.status === 404) {
                alert('Server Update Required: Please restart your backend server to enable Code Sharing features.')
            }
        }
        setEditSnippet(null)
    }

    const handleDelete = async () => {
        if (!deleteSnippet) return
        try {
            const res = await codeService.deleteSnippet(deleteSnippet._id)
            if (res.success) {
                setSnippets(prev => prev.filter(s => s._id !== deleteSnippet._id))
            }
        } catch (err) {
            console.error('Failed to delete snippet:', err)
        }
        setDeleteSnippet(null)
    }

    const handleStar = async (snippetId) => {
        try {
            const res = await codeService.toggleStar(snippetId)
            if (res.success) {
                setSnippets(prev => prev.map(s => {
                    if (s._id === snippetId) {
                        const isStarred = s.starred?.some(id => id === user._id) || s.starred?.includes(user._id)
                        let newStarred = s.starred || []
                        if (isStarred) {
                            newStarred = newStarred.filter(id => id !== user._id && id._id !== user._id)
                        } else {
                            newStarred = [...newStarred, user._id]
                        }
                        return { ...s, starred: newStarred }
                    }
                    return s
                }))
            }
        } catch (err) {
            console.error('Failed to star:', err)
        }
    }

    const handleView = async (snippet) => {
        // Optimistic update
        setSnippets(prev => prev.map(s =>
            s._id === snippet._id ? { ...s, views: (s.views || 0) + 1 } : s
        ))

        try {
            await codeService.incrementView(snippet._id)
        } catch (err) {
            console.error('Failed to update views:', err)
        }
        setViewSnippet(snippet)
    }

    const handleMigrate = async () => {
        setMigrating(true)
        const saved = JSON.parse(localStorage.getItem('nexora_snippets') || '[]')

        for (const snippet of saved) {
            const { _id, createdAt, updatedAt, ...data } = snippet
            const cleanData = {
                title: data.title,
                code: data.code,
                language: data.language || 'javascript',
                description: data.description || '',
                visibility: 'private',
                tags: data.tags || []
            }

            try {
                await codeService.createSnippet(cleanData)
            } catch (err) {
                console.error('Migration failed for:', snippet.title)
                if (err.response && err.response.status === 404) {
                    alert('Server Update Required: Please restart your backend server.')
                    setMigrating(false)
                    return
                }
            }
        }

        localStorage.removeItem('nexora_snippets')
        setLocalSnippetsCount(0)
        setMigrating(false)
        loadData()
    }

    // Filter snippets
    const filteredSnippets = snippets.filter(s => {
        const isAuthor = s.author?._id === user?._id || s.author === user?._id
        const isSharedWithMe = s.sharedWith?.some(u => (u._id === user?._id || u === user?._id))
        const isPublic = s.visibility === 'public'

        const hasAccess = isAuthor || isSharedWithMe || isPublic

        if (!hasAccess) return false

        // Tab filters
        if (filterTab === 'my' && !isAuthor) return false
        if (filterTab === 'starred') {
            const isStarred = s.starred?.some(u => (u._id === user?._id || u === user?._id))
            if (!isStarred) return false
        }
        if (filterTab === 'shared' && isAuthor) return false

        // Search filter
        const matchesSearch = searchQuery === '' ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))

        // Language filter
        const matchesLanguage = selectedLanguage === 'all' || s.language === selectedLanguage

        return matchesSearch && matchesLanguage
    })

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-orange-50/30 pb-20 md:pb-0">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                            <Terminal className="text-purple-600" size={28} />
                            Code Share
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Share code snippets with your network</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {localSnippetsCount > 0 && (
                            <button
                                onClick={handleMigrate}
                                disabled={migrating}
                                className="px-4 py-2.5 sm:py-3 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                            >
                                {migrating ? 'Syncing...' : `Sync ${localSnippetsCount} Old Snippets`}
                            </button>
                        )}
                        <button
                            onClick={() => setShowNewCode(true)}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <Plus size={18} className="sm:w-5 sm:h-5" />
                            New Snippet
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {[
                        { label: 'Total Snippets', value: snippets.filter(s => s.author?._id === user?._id || s.author === user?._id).length, icon: Code, color: 'purple' },
                        { label: 'Shared With Me', value: snippets.filter(s => s.sharedWith?.some(u => u._id === user?._id || u === user?._id)).length, icon: Share2, color: 'blue' },
                        { label: 'Starred', value: snippets.filter(s => s.starred?.some(u => u._id === user?._id || u === user?._id)).length, icon: Star, color: 'yellow' },
                        { label: 'Total Views', value: snippets.reduce((acc, s) => acc + (s.views || 0), 0), icon: Eye, color: 'green' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3`}>
                                <stat.icon size={16} className={`sm:w-5 sm:h-5 text-${stat.color}-600`} />
                            </div>
                            <p className="text-lg sm:text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-4 sm:mb-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Tabs - Horizontal scroll on mobile */}
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 sm:border-b border-gray-200">
                            {[
                                { id: 'all', label: 'All', icon: FolderOpen },
                                { id: 'my', label: 'My', icon: User },
                                { id: 'shared', label: 'Shared', icon: Share2 },
                                { id: 'starred', label: 'Starred', icon: Star },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterTab(tab.id)}
                                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap ${filterTab === tab.id
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <tab.icon size={14} className="sm:w-4 sm:h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search snippets..."
                                    className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm sm:text-base"
                                />
                            </div>

                            {/* Language Filter */}
                            <div className="relative">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="appearance-none w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-sm sm:text-base"
                                >
                                    <option value="all">All Languages</option>
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="sm:w-4 sm:h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-500">{filteredSnippets.length} snippets found</p>
                </div>

                {/* Snippets Grid */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 animate-pulse">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-24 sm:h-32 bg-gray-200 rounded-lg sm:rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredSnippets.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code size={32} className="sm:w-10 sm:h-10 text-purple-600" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Snippets Found</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                            {filterTab === 'my'
                                ? "You haven't created any snippets yet"
                                : filterTab === 'shared'
                                    ? "No one has shared code with you yet"
                                    : filterTab === 'starred'
                                        ? "You haven't starred any snippets"
                                        : "Create your first code snippet!"}
                        </p>
                        <button
                            onClick={() => setShowNewCode(true)}
                            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-md text-sm sm:text-base"
                        >
                            Create Snippet
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredSnippets.map(snippet => (
                            <CodeCard
                                key={snippet._id}
                                snippet={snippet}
                                isOwner={snippet.author?._id === user?._id}
                                currentUserId={user?._id}
                                onView={() => handleView(snippet)}
                                onEdit={(s) => { setEditSnippet(s); setShowNewCode(true); }}
                                onDelete={(s) => setDeleteSnippet(s)}
                                onStar={handleStar}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modals */}
            <NewCodeModal
                isOpen={showNewCode}
                onClose={() => { setShowNewCode(false); setEditSnippet(null); }}
                onSubmit={handleNewSnippet}
                contacts={contacts}
                editSnippet={editSnippet}
            />

            <ViewCodeModal
                snippet={viewSnippet}
                isOpen={!!viewSnippet}
                onClose={() => setViewSnippet(null)}
            />

            <DeleteModal
                isOpen={!!deleteSnippet}
                onClose={() => setDeleteSnippet(null)}
                onConfirm={handleDelete}
                snippetTitle={deleteSnippet?.title}
            />
        </div>
    )
}
