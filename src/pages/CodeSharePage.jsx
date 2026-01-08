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

// New Code Modal - Professional Version
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 p-5 text-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                                {editSnippet ? <Edit3 size={20} /> : <Code size={20} />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{editSnippet ? 'Edit Snippet' : 'New Code Snippet'}</h2>
                                <p className="text-slate-400 text-xs">Share fully formatted code with your team</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-5 flex-1">
                    {/* Title & Language Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Auth Middleware Authentication"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white transition-all text-sm"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe what this code does..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all text-sm"
                        />
                    </div>

                    {/* Code Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Code <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                                </div>
                                <span className="text-slate-400 text-xs font-mono">{LANGUAGES.find(l => l.id === language)?.name}</span>
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="// Paste your code here..."
                                rows={12}
                                className="w-full px-4 py-4 bg-slate-900 text-slate-300 font-mono text-sm focus:outline-none resize-none"
                                style={{ tabSize: 2 }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tags <span className="text-slate-400 font-normal text-xs">(comma-separated)</span>
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., api, utils, database"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                        />
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                        <div className="grid grid-cols-2 gap-3">
                            {VISIBILITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setVisibility(opt.id)}
                                    className={`p-3 rounded-lg border transition-all text-left flex items-start gap-3 ${visibility === opt.id
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <opt.icon size={18} className={`mt-0.5 ${visibility === opt.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                    <div>
                                        <p className={`font-medium text-sm ${visibility === opt.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {opt.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Share With (only for connections visibility) */}
                    {visibility === 'connections' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Share With <span className="text-red-500">*</span>
                                <span className="text-slate-400 text-xs ml-2 font-normal">({shareWith.length} selected)</span>
                            </label>
                            {contacts.length === 0 ? (
                                <div className="text-slate-500 text-sm py-8 text-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                    No connections yet. Connect with professionals to share code!
                                </div>
                            ) : (
                                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                                    {contacts.map(contact => (
                                        <label
                                            key={contact._id}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${shareWith.includes(contact._id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={shareWith.includes(contact._id)}
                                                onChange={() => toggleShare(contact._id)}
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                            />
                                            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                                                <img
                                                    src={contact.avatarUrl || `https://ui-avatars.com/api/?name=${contact.name}&background=random`}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{contact.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !code.trim() || (visibility === 'connections' && shareWith.length === 0)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                        {editSnippet ? <Check size={16} /> : <Plus size={16} />}
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={24} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Snippet?</h3>
                    <p className="text-slate-500 text-center mb-6 text-sm">
                        Are you sure you want to delete "<strong>{snippetTitle}</strong>"?
                        This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Professional Code Card
function CodeCard({ snippet, onCopy, onView, onEdit, onDelete, onStar, isOwner, currentUserId }) {
    const lang = LANGUAGES.find(l => l.id === snippet.language) || LANGUAGES[0]
    const [showMenu, setShowMenu] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code)
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
        return d.toLocaleDateString()
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                        {lang.icon}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate" title={snippet.title}>
                            {snippet.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700">{lang.name}</span>
                            <span>•</span>
                            <span>{formatDate(snippet.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Menu */}
                <div className="relative flex-shrink-0 ml-2">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                                <button
                                    onClick={() => { onView?.(); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Eye size={14} /> View
                                </button>
                                <button
                                    onClick={() => { handleCopy(); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Copy size={14} /> Copy
                                </button>
                                <button
                                    onClick={() => { handleDownload(); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Download size={14} /> Download
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                    onClick={() => { onStar?.(snippet._id); setShowMenu(false); }}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <Star size={14} className={snippet.starred?.some(u => (u._id === currentUserId || u === currentUserId)) ? 'text-yellow-500 fill-yellow-500' : ''} />
                                    {snippet.starred?.some(u => (u._id === currentUserId || u === currentUserId)) ? 'Unstar' : 'Star'}
                                </button>
                                {isOwner && (
                                    <>
                                        <div className="border-t border-slate-100 my-1" />
                                        <button
                                            onClick={() => { onEdit?.(snippet); setShowMenu(false); }}
                                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => { onDelete?.(snippet); setShowMenu(false); }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Code Preview */}
            <div
                className="bg-slate-900 p-4 h-32 overflow-hidden relative cursor-pointer"
                onClick={onView}
            >
                <div className="text-xs text-slate-300 font-mono leading-relaxed opacity-80 break-all select-none">
                    {snippet.code.substring(0, 300)}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 text-xs text-slate-500 group-hover:text-blue-400 transition-colors flex items-center gap-1 font-medium z-10">
                    <Code size={12} /> View Code
                </div>
            </div>

            <div className="p-3 flex-1">
                {snippet.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{snippet.description}</p>
                )}
                {/* Tags */}
                {snippet.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {snippet.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium border border-slate-200">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200">
                        <img
                            src={snippet.author?.avatarUrl || `https://ui-avatars.com/api/?name=${snippet.author?.name}&background=random`}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    </div>
                    <span className="font-medium text-slate-700 truncate max-w-[100px]">{snippet.author?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1" title="Views">
                        <Eye size={12} /> {snippet.views || 0}
                    </span>
                    {snippet.starred?.some(u => (u._id === currentUserId || u === currentUserId)) && (
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    )}
                    {snippet.visibility === 'private' && <Lock size={12} />}
                    {snippet.visibility === 'connections' && <Users size={12} />}
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-800">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-slate-800 text-white">
                            {lang.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{snippet.title}</h3>
                            <p className="text-sm text-slate-400">{lang.name} • {snippet.code.split('\n').length} lines</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Code */}
                <div className="flex-1 overflow-auto p-0 bg-slate-950">
                    <pre className="text-sm text-slate-300 font-mono p-6">
                        <code>{snippet.code}</code>
                    </pre>
                </div>

                {/* Footer */}
                {snippet.description && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <p className="text-sm text-slate-400">{snippet.description}</p>
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
                const res = await codeService.updateSnippet(snippetData._id, snippetData)
                if (res.success) {
                    setSnippets(prev => prev.map(s => s._id === res.data._id ? res.data : s))
                }
            } else {
                const res = await codeService.createSnippet(snippetData)
                if (res.success) {
                    setSnippets(prev => [res.data, ...prev])
                }
            }
        } catch (err) {
            console.error('Failed to save snippet:', err)
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
        setSnippets(prev => prev.map(s =>
            s._id === snippet._id ? { ...s, views: (s.views || 0) + 1 } : s
        ))
        try {
            await codeService.incrementView(snippet._id)
        } catch (err) { }
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
            } catch (err) { }
        }
        localStorage.removeItem('nexora_snippets')
        setLocalSnippetsCount(0)
        setMigrating(false)
        loadData()
    }

    // Filter snippets logic
    const filteredSnippets = snippets.filter(s => {
        const isAuthor = s.author?._id === user?._id || s.author === user?._id
        const isSharedWithMe = s.sharedWith?.some(u => (u._id === user?._id || u === user?._id))
        const isPublic = s.visibility === 'public'
        const hasAccess = isAuthor || isSharedWithMe || isPublic
        if (!hasAccess) return false
        if (filterTab === 'my' && !isAuthor) return false
        if (filterTab === 'starred') {
            const isStarred = s.starred?.some(u => (u._id === user?._id || u === user?._id))
            if (!isStarred) return false
        }
        if (filterTab === 'shared' && isAuthor) return false
        const matchesSearch = searchQuery === '' ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesLanguage = selectedLanguage === 'all' || s.language === selectedLanguage
        return matchesSearch && matchesLanguage
    })

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                            Code Snippets
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage and share your code library</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {localSnippetsCount > 0 && (
                            <button
                                onClick={handleMigrate}
                                disabled={migrating}
                                className="px-4 py-3 sm:py-2 bg-blue-50 text-blue-600 rounded-xl sm:rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                {migrating ? 'Syncing...' : `Sync ${localSnippetsCount} Old Snippets`}
                            </button>
                        )}
                        <button
                            onClick={() => setShowNewCode(true)}
                            className="px-5 py-3.5 sm:py-2.5 bg-blue-600 text-white rounded-xl sm:rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={18} />
                            Create Snippet
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {[
                                { id: 'all', label: 'All Snippets', icon: Code },
                                { id: 'my', label: 'My Code', icon: User },
                                { id: 'starred', label: 'Starred', icon: Star },
                                { id: 'shared', label: 'Shared with me', icon: Users },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${filterTab === tab.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search snippets..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div className="relative w-40">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white font-medium text-slate-700"
                                >
                                    <option value="all">All Languages</option>
                                    {LANGUAGES.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse p-4">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="mt-4 h-32 bg-slate-50 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredSnippets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSnippets.map(snippet => (
                            <CodeCard
                                key={snippet._id}
                                snippet={snippet}
                                onCopy={() => { }}
                                onView={() => handleView(snippet)}
                                onEdit={() => setEditSnippet(snippet) || setShowNewCode(true)}
                                onDelete={() => setDeleteSnippet(snippet)}
                                onStar={() => handleStar(snippet._id)}
                                isOwner={snippet.author?._id === user._id || snippet.author === user._id}
                                currentUserId={user._id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Code size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No Snippets Found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your filters or create a new snippet</p>
                        <button
                            onClick={() => setShowNewCode(true)}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Create Snippet
                        </button>
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
