import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { userService, contactService } from '../services/userService'
import socketService from '../services/socketService'
import notificationService from '../services/notificationService'
import {
    Send, Paperclip, MoreVertical, Phone, Video, Search, Smile,
    Plus, Users, Hash, Lock, Image, File, Mic, X, Check, CheckCheck, Edit3,
    Trash2, Reply, Copy, Star, Pin, ArrowLeft, Info, Settings, UserPlus,
    MessageSquare, Clock, Circle, ChevronDown, ChevronLeft, AtSign, Laugh, Heart, ThumbsUp, Link2, ExternalLink
} from 'lucide-react'

// Emoji Picker Component - Fixed positioning and spacing
const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '✨', '🎉', '👏', '💯', '🙏', '😢', '😮', '🤯', '💪', '🚀', '😊', '🙌', '💖', '🎯', '💡', '🌟', '😇', '🤩', '🥳', '😋']

function EmojiPicker({ onSelect, onClose }) {
    const pickerRef = useRef(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[100] min-w-[280px]"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">Emojis</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                    <X size={14} />
                </button>
            </div>
            {/* Emoji Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-1">
                {EMOJI_LIST.map((emoji, i) => (
                    <button
                        key={i}
                        onClick={() => { onSelect(emoji); onClose() }}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-xl transition-all hover:scale-110"
                        type="button"
                    >
                        <span className="leading-none">{emoji}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// Professional Share Media Modal (Link/Image)
function ShareMediaModal({ isOpen, onClose, type, onSubmit }) {
    const [url, setUrl] = useState('')
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setUrl('')
        setPreview(null)
    }, [isOpen])

    const isImage = type === 'image'
    const isValidUrl = (str) => {
        try {
            new URL(str)
            return true
        } catch {
            return false
        }
    }

    const isImageUrl = (str) => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(str)
    }

    const handleUrlChange = (e) => {
        const value = e.target.value
        setUrl(value)

        if (isImage && isValidUrl(value) && isImageUrl(value)) {
            setPreview(value)
        } else if (!isImage && isValidUrl(value)) {
            try {
                const urlObj = new URL(value)
                setPreview(urlObj.hostname.replace('www.', ''))
            } catch {
                setPreview(null)
            }
        } else {
            setPreview(null)
        }
    }

    const handleSubmit = () => {
        if (url.trim() && isValidUrl(url.trim())) {
            onSubmit(url.trim())
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-400 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                {isImage ? <Image size={20} /> : <Link2 size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {isImage ? 'Share Image' : 'Share Link'}
                                </h3>
                                <p className="text-purple-100 text-xs">
                                    {isImage ? 'Enter an image URL to share' : 'Enter a URL to share'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* URL Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {isImage ? 'Image URL' : 'Link URL'}
                        </label>
                        <div className="relative">
                            {isImage ? (
                                <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            ) : (
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            )}
                            <input
                                type="url"
                                value={url}
                                onChange={handleUrlChange}
                                placeholder={isImage
                                    ? 'https://example.com/image.jpg'
                                    : 'https://example.com'
                                }
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {isImage && preview && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                                onError={() => setPreview(null)}
                            />
                        </div>
                    )}

                    {!isImage && preview && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                <Link2 size={18} className="text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{preview}</p>
                                <p className="text-xs text-gray-500 truncate">{url}</p>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                        <p className="text-xs text-purple-600">
                            💡 {isImage
                                ? 'Tip: Use direct image links ending in .jpg, .png, .gif, etc.'
                                : 'Tip: Paste any URL to share with your connection'
                            }
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!url.trim() || !isValidUrl(url.trim())}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 shadow-lg flex items-center justify-center gap-2"
                        >
                            <Send size={16} />
                            Add to Message
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Message Content with Link & Image Preview
function MessageContent({ content, isOwn }) {
    // Check if content is an image URL
    const isImageUrl = (url) => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url)
    }

    // Check if string is a URL
    const isUrl = (str) => {
        return /^https?:\/\/[^\s]+$/i.test(str)
    }

    // Extract URLs from content
    const urlPattern = /(https?:\/\/[^\s]+)/gi
    const urls = content.match(urlPattern) || []
    const imageUrls = urls.filter(isImageUrl)
    const linkUrls = urls.filter(url => !isImageUrl(url))

    // Render text with clickable links
    const renderContent = () => {
        // Split by URLs but keep the URLs in the result
        const parts = content.split(urlPattern)

        return parts.map((part, i) => {
            if (isUrl(part)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline font-medium break-all ${isOwn ? 'text-white/90 hover:text-white' : 'text-purple-600 hover:text-purple-700'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part.length > 50 ? part.slice(0, 50) + '...' : part}
                    </a>
                )
            }
            return <span key={i}>{part}</span>
        })
    }

    return (
        <div className="space-y-2">
            {/* Text Content with Links */}
            <p className="whitespace-pre-wrap break-words">
                {renderContent()}
            </p>

            {/* Image Preview */}
            {imageUrls.length > 0 && (
                <div className={`grid gap-2 mt-2 ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                            <img
                                src={url}
                                alt="Shared image"
                                className="rounded-xl max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/20"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        </a>
                    ))}
                </div>
            )}

            {/* Link Preview Card */}
            {linkUrls.length > 0 && (
                <div className="mt-2 space-y-2">
                    {linkUrls.slice(0, 1).map((url, i) => {
                        let hostname = ''
                        try {
                            hostname = new URL(url).hostname.replace('www.', '')
                        } catch (e) {
                            hostname = url.slice(0, 30)
                        }

                        return (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${isOwn
                                    ? 'bg-white/10 border-white/20 hover:bg-white/20'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? 'bg-white/20' : 'bg-purple-100'
                                    }`}>
                                    <svg className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                                        {hostname}
                                    </p>
                                    <p className={`text-[11px] truncate ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                        {url.length > 50 ? url.slice(0, 50) + '...' : url}
                                    </p>
                                </div>
                            </a>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// New Chat Modal - Shows only connected users with website theme
function NewChatModal({ isOpen, onClose, onCreateChat, users, contacts = [] }) {
    const [chatType, setChatType] = useState('private')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [groupName, setGroupName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    if (!isOpen) return null

    // Filter to show only connected users (contacts with accepted status)
    const connectedUsers = users.filter(u =>
        contacts.some(c => (c.contactId?._id || c.contactId) === u._id && c.status === 'accepted')
    )

    const filteredUsers = connectedUsers.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleUser = (userId) => {
        if (chatType === 'private') {
            setSelectedUsers([userId])
        } else {
            setSelectedUsers(prev =>
                prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
            )
        }
    }

    const handleCreate = () => {
        if (chatType === 'private' && selectedUsers.length === 1) {
            onCreateChat({ type: 'private', userId: selectedUsers[0] })
        } else if (chatType === 'group' && selectedUsers.length > 0 && groupName.trim()) {
            onCreateChat({ type: 'group', userIds: selectedUsers, name: groupName })
        }
        onClose()
        setSelectedUsers([])
        setGroupName('')
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-400 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">New Conversation</h3>
                                <p className="text-purple-100 text-xs">Chat with your connections</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Chat Type Toggle */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                            onClick={() => { setChatType('private'); setSelectedUsers([]) }}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${chatType === 'private'
                                ? 'bg-gradient-to-r from-purple-600 to-orange-400 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MessageSquare size={16} /> Direct
                        </button>
                        <button
                            onClick={() => { setChatType('group'); setSelectedUsers([]) }}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${chatType === 'group'
                                ? 'bg-gradient-to-r from-purple-600 to-orange-400 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Users size={16} /> Group
                        </button>
                    </div>
                </div>

                {/* Group Name (for group chats) */}
                {chatType === 'group' && (
                    <div className="p-4 border-b border-gray-100">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Group name..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                )}

                {/* Search Users */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search connections..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="max-h-64 overflow-y-auto">
                    {connectedUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-purple-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No Connections Yet</p>
                            <p className="text-gray-400 text-sm mt-1">Connect with people to start chatting</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No connections match your search</p>
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <button
                                key={user._id}
                                onClick={() => toggleUser(user._id)}
                                className={`w-full p-3 flex items-center gap-3 hover:bg-purple-50 transition-colors border-l-4 ${selectedUsers.includes(user._id)
                                    ? 'bg-purple-50 border-purple-500'
                                    : 'border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.name}`}
                                        className="w-11 h-11 rounded-full bg-gray-100"
                                        alt=""
                                    />
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.headline || user.email}</p>
                                </div>
                                {selectedUsers.includes(user._id) && (
                                    <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleCreate}
                        disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        <MessageSquare size={18} />
                        {chatType === 'private' ? 'Start Conversation' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Chat Info Panel
function ChatInfoPanel({ chat, user, onClose }) {
    if (!chat) return null

    const isGroup = chat.type === 'group'
    const otherMember = !isGroup ? chat.members?.find(m => m.userId?._id !== user?._id)?.userId : null

    return (
        <div className="w-80 bg-white border-l border-gray-100 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-nexora-navy">Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Avatar & Name */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-nexora-primary/10 to-nexora-accent/10 p-1 mb-3">
                        <img
                            src={isGroup
                                ? `https://api.dicebear.com/9.x/shapes/svg?seed=${chat.name}`
                                : otherMember?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=default`
                            }
                            className="w-full h-full rounded-full bg-white"
                            alt=""
                        />
                    </div>
                    <h4 className="font-bold text-xl text-nexora-navy">
                        {isGroup ? chat.name : otherMember?.name || 'Unknown'}
                    </h4>
                    {!isGroup && (
                        <p className="text-sm text-gray-500">{otherMember?.email}</p>
                    )}
                    {!isGroup && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                            <Circle size={8} className={otherMember?.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'} />
                            <span className="text-xs text-gray-500">
                                {otherMember?.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <button className="p-3 flex flex-col items-center gap-1 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Phone size={18} className="text-nexora-primary" />
                        <span className="text-xs text-gray-600">Call</span>
                    </button>
                    <button className="p-3 flex flex-col items-center gap-1 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Video size={18} className="text-nexora-primary" />
                        <span className="text-xs text-gray-600">Video</span>
                    </button>
                    <button className="p-3 flex flex-col items-center gap-1 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Search size={18} className="text-nexora-primary" />
                        <span className="text-xs text-gray-600">Search</span>
                    </button>
                </div>

                {/* Members (for groups) */}
                {isGroup && (
                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-500 mb-3">{chat.members?.length || 0} Members</h5>
                        <div className="space-y-2">
                            {chat.members?.map(member => (
                                <div key={member.userId?._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <img
                                        src={member.userId?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.userId?.name}`}
                                        className="w-8 h-8 rounded-full bg-gray-100"
                                        alt=""
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-nexora-navy">{member.userId?.name}</p>
                                        <p className="text-xs text-gray-400">{member.role}</p>
                                    </div>
                                    <Circle size={6} className={member.userId?.status === 'online' ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Options */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                        <Star size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700">Starred Messages</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                        <Image size={18} className="text-gray-400" />
                        <span className="text-sm text-gray-700">Media & Files</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600">
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Delete Chat</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Call Interface Component
function CallInterface({ callData, onClose, isIncoming = false }) {
    const { type, user, offer } = callData
    const [status, setStatus] = useState(isIncoming ? 'incoming' : 'calling')
    const [duration, setDuration] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)

    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const peerConnection = useRef(null)

    useEffect(() => {
        initializeCall()

        return () => {
            endCallCleanup()
        }
    }, [])

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream
        }
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [localStream, remoteStream])

    useEffect(() => {
        if (status === 'connected') {
            const timer = setInterval(() => setDuration(prev => prev + 1), 1000)
            return () => clearInterval(timer)
        }
    }, [status])

    const initializeCall = async () => {
        try {
            // Request media with fallback options for better compatibility
            const mediaConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: type === 'video' ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false
            }

            let stream
            try {
                stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
            } catch (mediaError) {
                console.error('Media access error:', mediaError)
                // Try with basic constraints if advanced fails
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: type === 'video'
                })
            }
            setLocalStream(stream)

            // Create peer connection with multiple ICE servers for better connectivity
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' },
                    { urls: 'stun:stun.services.mozilla.com' }
                ],
                iceCandidatePoolSize: 10
            })
            peerConnection.current = pc

            // Add tracks to peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            // Handle incoming tracks from remote peer
            pc.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind)
                setRemoteStream(event.streams[0])
            }

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('Sending ICE candidate')
                    socketService.sendIceCandidate(user._id, event.candidate)
                }
            }

            // Monitor connection state
            pc.onconnectionstatechange = () => {
                console.log('Connection state:', pc.connectionState)
                if (pc.connectionState === 'connected') {
                    setStatus('connected')
                } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    console.error('Connection failed or disconnected')
                }
            }

            pc.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', pc.iceConnectionState)
            }

            // Listen for ICE candidates from remote peer
            socketService.onIceCandidate(async ({ candidate }) => {
                try {
                    if (candidate && pc.remoteDescription) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                        console.log('Added ICE candidate')
                    }
                } catch (e) {
                    console.error('Error adding ICE candidate:', e)
                }
            })

            // Listen for call ended
            socketService.onCallEnded(() => {
                console.log('Call ended by remote peer')
                onClose()
            })

            if (isIncoming && offer) {
                // For incoming call, set remote description with the offer
                console.log('Setting remote offer for incoming call')
                await pc.setRemoteDescription(new RTCSessionDescription(offer))
            } else if (!isIncoming) {
                // Caller logic - create and send offer
                console.log('Creating offer for outgoing call')
                const newOffer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: type === 'video'
                })
                await pc.setLocalDescription(newOffer)
                socketService.startCall(user._id, newOffer, type)

                // Listen for answer
                socketService.onCallAccepted(async ({ answer }) => {
                    try {
                        console.log('Received answer from remote peer')
                        await pc.setRemoteDescription(new RTCSessionDescription(answer))
                        setStatus('connected')
                    } catch (e) {
                        console.error('Error setting remote description:', e)
                    }
                })
            }
        } catch (err) {
            console.error('Failed to initialize call:', err)
            alert('Could not access camera/microphone. Please check permissions.')
            onClose()
        }
    }

    const handleAnswer = async () => {
        try {
            const pc = peerConnection.current
            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            socketService.answerCall(user._id, answer)
            setStatus('connected')
        } catch (err) {
            console.error('Failed to answer call:', err)
        }
    }

    const endCallCleanup = () => {
        localStream?.getTracks().forEach(track => track.stop())
        peerConnection.current?.close()
        socketService.endCall(user._id)
        socketService.off('call:accepted')
        socketService.off('call:ice-candidate')
        socketService.off('call:ended')
    }

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60)
        const remainingSecs = secs % 60
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
    }

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (localStream && type === 'video') {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
            setIsVideoOff(!isVideoOff)
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-900 z-[200] flex flex-col items-center justify-center text-white">
            {/* Remote Video (Background) */}
            {type === 'video' && remoteStream && (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}

            {/* Background Blur (if no video or audio call) */}
            {(!remoteStream || type === 'voice') && (
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name}`}
                        className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
                        alt=""
                    />
                </div>
            )}

            {/* Local Video (PIP) */}
            {type === 'video' && localStream && (
                <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
                <div className="mb-12 text-center">
                    {(!remoteStream || type === 'voice') && (
                        <div className="w-32 h-32 rounded-full border-4 border-white/10 p-1 mb-6 mx-auto relative">
                            <img
                                src={user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name}`}
                                className="w-full h-full rounded-full bg-gray-800 object-cover"
                                alt=""
                            />
                            {(status === 'calling' || status === 'incoming') && (
                                <div className="absolute inset-0 rounded-full border-4 border-purple-500 animate-ping opacity-50"></div>
                            )}
                        </div>
                    )}
                    <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{user?.name}</h2>
                    <p className="text-purple-200 text-lg font-medium drop-shadow-md">
                        {status === 'incoming' ? 'Incoming Call...' :
                            status === 'calling' ? 'Calling...' :
                                status === 'connected' ? formatDuration(duration) : 'Ended'}
                    </p>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-6">
                    {status === 'incoming' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="p-5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30 transition-all transform hover:scale-110"
                            >
                                <Phone size={28} className="rotate-[135deg]" />
                            </button>
                            <button
                                onClick={handleAnswer}
                                className="p-5 bg-green-500 hover:bg-green-600 rounded-full shadow-lg shadow-green-500/30 transition-all transform hover:scale-110 animate-pulse"
                            >
                                <Phone size={28} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full backdrop-blur-md transition-all ${isMuted ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                <Mic size={24} className={isMuted ? 'fill-current' : ''} />
                            </button>

                            {type === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`p-4 rounded-full backdrop-blur-md transition-all ${isVideoOff ? 'bg-white text-gray-900' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    <Video size={24} className={isVideoOff ? 'fill-current' : ''} />
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className="p-5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30 transition-all transform hover:scale-110"
                            >
                                <Phone size={28} className="rotate-[135deg]" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main Chat Page
export default function ChatPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const {
        chats,
        activeChat,
        messages,
        loading,
        selectChat,
        sendMessage,
        markAsRead,
        loadChats,
        typingUsers,
        createPrivateChat,
        createGroupChat,
        startTyping,
        stopTyping
    } = useChat()

    const [message, setMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showNewChat, setShowNewChat] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareType, setShareType] = useState('link')
    const [users, setUsers] = useState([])
    const [contacts, setContacts] = useState([])
    const [activeCall, setActiveCall] = useState(null)
    const [isIncomingCall, setIsIncomingCall] = useState(false)
    const [sending, setSending] = useState(false)
    const [showMobileList, setShowMobileList] = useState(true) // Mobile: show list by default

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadChats()
        loadUsers()
    }, [isAuthenticated, navigate, loadChats])

    useEffect(() => {
        if (activeChat) {
            markAsRead(activeChat._id)
            // On mobile, hide list when chat is selected
            setShowMobileList(false)
        }
    }, [activeChat, messages, markAsRead])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [activeChat])

    // Socket listeners for calls - using socketService instead of window.socket
    useEffect(() => {
        if (!isAuthenticated) return

        const handleIncomingCall = (data) => {
            setActiveCall(data)
            setIsIncomingCall(true)
        }

        const handleCallAccepted = (data) => {
            setActiveCall(data)
            setIsIncomingCall(false)
        }

        const handleCallEnded = () => {
            setActiveCall(null)
            setIsIncomingCall(false)
        }

        // Register call event listeners using socketService
        socketService.onIncomingCall(handleIncomingCall)
        socketService.onCallAccepted(handleCallAccepted)
        socketService.onCallEnded(handleCallEnded)

        return () => {
            socketService.off('call:incoming')
            socketService.off('call:accepted')
            socketService.off('call:ended')
        }
    }, [isAuthenticated])

    // Use ref to track which messages we've already marked as read
    const markedAsReadRef = useRef(new Set())

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

        // Mark unread messages as read when viewing the chat (with debounce)
        if (activeChat && messages.length > 0 && user?._id) {
            const timeoutId = setTimeout(() => {
                const unreadMessageIds = messages
                    .filter(msg => {
                        // Skip own messages
                        const senderId = msg.senderId?._id || msg.senderId
                        if (senderId === user._id) return false
                        // Skip already processed
                        if (markedAsReadRef.current.has(msg._id)) return false
                        // Check if already read by current user
                        const isRead = msg.readBy?.some(r =>
                            (r.userId === user._id) || (r.userId?._id === user._id)
                        )
                        return !isRead
                    })
                    .map(msg => msg._id)

                if (unreadMessageIds.length > 0) {
                    // Mark as processed
                    unreadMessageIds.forEach(id => markedAsReadRef.current.add(id))
                    socketService.markAsRead(activeChat._id, unreadMessageIds)
                }
            }, 500) // Debounce by 500ms

            return () => clearTimeout(timeoutId)
        }
    }, [messages, activeChat, user])

    // Clear the marked set when chat changes
    useEffect(() => {
        markedAsReadRef.current.clear()
    }, [activeChat?._id])

    // NOTE: loadUsers is already called in the authentication useEffect above

    const loadUsers = async () => {
        try {
            const [usersRes, contactsRes] = await Promise.all([
                userService.getUsers({ limit: 50 }),
                contactService.getContacts()
            ])
            if (usersRes.success) {
                setUsers(usersRes.data.filter(u => u._id !== user?._id))
            }
            if (contactsRes.success) {
                setContacts(contactsRes.data || [])
            }
        } catch (error) {
            console.error('Failed to load users:', error)
        }
    }

    const handleSend = async () => {
        if (!message.trim() || sending) return

        setSending(true)
        stopTyping()

        try {
            await sendMessage(message)
            setMessage('')
        } catch (err) {
            console.error('Failed to send:', err)
        } finally {
            setSending(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInputChange = (e) => {
        setMessage(e.target.value)
        startTyping()
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000)
    }

    // Handle image upload - opens professional modal
    const handleImageUpload = () => {
        setShareType('image')
        setShowShareModal(true)
    }

    // Handle file attachment click - opens professional modal
    const handleAttachmentClick = () => {
        setShareType('link')
        setShowShareModal(true)
    }

    // Handle URL submission from modal
    // Handle URL submission from modal
    const handleShareSubmit = (url) => {
        setMessage(prev => prev + (prev ? '\n' : '') + url)
        inputRef.current?.focus()
    }

    const handleCreateChat = async ({ type, userId, userIds, name }) => {
        try {
            if (type === 'private') {
                await createPrivateChat(userId)
            } else {
                await createGroupChat(name, userIds)
            }
        } catch (error) {
            console.error('Failed to create chat:', error)
        }
    }

    const handleStartCall = (type) => {
        if (!activeChat) return
        const otherMember = activeChat.members?.find(m => m.userId?._id !== user?._id)?.userId
        if (otherMember) {
            setActiveCall({ type, user: otherMember })
            setIsIncomingCall(false)
        }
    }

    const handleEndCall = () => {
        setActiveCall(null)
        setIsIncomingCall(false)
    }

    const getChatName = (chat) => {
        if (chat.type === 'group') return chat.name
        const otherMember = chat.members?.find(m => m.userId?._id !== user?._id)
        return otherMember?.userId?.name || 'Unknown'
    }

    const getChatAvatar = (chat) => {
        if (chat.type === 'group') {
            return `https://api.dicebear.com/9.x/shapes/svg?seed=${chat.name}`
        }
        const otherMember = chat.members?.find(m => m.userId?._id !== user?._id)
        return otherMember?.userId?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=default`
    }

    const formatLastSeen = (date) => {
        if (!date) return 'Offline'
        const now = new Date()
        const lastSeen = new Date(date)
        const diffMs = now - lastSeen
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Last seen just now'
        if (diffMins < 60) return `Last seen ${diffMins}m ago`
        if (diffHours < 24) return `Last seen ${diffHours}h ago`
        if (diffDays === 1) return 'Last seen yesterday'
        if (diffDays < 7) return `Last seen ${diffDays}d ago`
        return `Last seen ${lastSeen.toLocaleDateString()}`
    }

    const getChatStatus = (chat) => {
        if (chat.type === 'group') {
            const onlineCount = chat.members?.filter(m => m.userId?.status === 'online').length || 0
            return `${chat.members?.length || 0} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}`
        }
        const otherMember = chat.members?.find(m => m.userId?._id !== user?._id)
        const status = otherMember?.userId?.status
        if (status === 'online') return '🟢 Online'
        if (status === 'away') return '🟡 Away'
        if (status === 'busy') return '🔴 Busy'
        return formatLastSeen(otherMember?.userId?.lastSeen)
    }

    const isOnline = (chat) => {
        if (chat.type === 'group') return true
        const otherMember = chat.members?.find(m => m.userId?._id !== user?._id)
        return otherMember?.userId?.status === 'online'
    }

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const formatDate = (date) => {
        const d = new Date(date)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (d.toDateString() === today.toDateString()) return 'Today'
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return d.toLocaleDateString()
    }

    const groupMessagesByDate = (msgs) => {
        const groups = {}
        msgs.forEach(msg => {
            const date = formatDate(msg.createdAt)
            if (!groups[date]) groups[date] = []
            groups[date].push(msg)
        })
        return groups
    }

    const filteredChats = chats.filter(chat =>
        getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isAuthenticated) return null

    const messageGroups = groupMessagesByDate(messages)

    return (
        <div className="h-screen bg-[#F4F7FA] flex flex-col overflow-hidden relative">
            {/* Navbar with higher z-index to ensure navigation works */}
            <div className="relative z-50">
                <Navbar />
            </div>

            {/* Call Interface Overlay */}
            {activeCall && (
                <CallInterface
                    callData={activeCall}
                    isIncoming={isIncomingCall}
                    onClose={handleEndCall}
                />
            )}

            <div className="flex-1 flex max-w-[1600px] mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-4 h-[calc(100vh-80px)] pb-20 md:pb-4 relative z-10">
                {/* Sidebar - Responsive */}
                <div className={`${showMobileList ? 'flex' : 'hidden'
                    } md:flex w-full md:w-64 lg:w-80 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-xl text-gray-800 font-heading">Messages</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl hover:opacity-90 transition-all shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-gray-200 transition-all"
                                placeholder="Search conversations..."
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                            </div>
                        )}
                        {!loading && filteredChats.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No conversations yet</p>
                                <p className="text-sm mt-1">Start a new chat to begin</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                >
                                    New Chat
                                </button>
                            </div>
                        )}
                        {filteredChats.map(chat => (
                            <div
                                key={chat._id}
                                onClick={() => selectChat(chat)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-l-4 ${chat._id === activeChat?._id
                                    ? 'bg-purple-50 border-purple-600'
                                    : 'hover:bg-gray-50 border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <img src={getChatAvatar(chat)} className="w-12 h-12 rounded-full bg-gray-100" alt="" />
                                    {chat.type === 'private' && (
                                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline(chat) ? 'bg-green-500' : 'bg-gray-300'
                                            }`} />
                                    )}
                                    {chat.type === 'group' && (
                                        <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {chat.members?.length}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`font-semibold text-sm truncate ${chat._id === activeChat?._id ? 'text-purple-700' : 'text-gray-900'
                                            }`}>
                                            {getChatName(chat)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                                            {chat.lastMessage?.createdAt && formatTime(chat.lastMessage.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500 truncate flex-1 flex items-center gap-1">
                                            {/* Show read receipt for own messages */}
                                            {chat.lastMessage?.senderId === user?._id || chat.lastMessage?.senderId?._id === user?._id ? (
                                                <>
                                                    <CheckCheck
                                                        size={12}
                                                        className={chat.lastMessage?.readBy?.length > 1 ? 'text-blue-500' : 'text-gray-400'}
                                                    />
                                                    <span className="truncate">{chat.lastMessage?.content || 'No messages yet'}</span>
                                                </>
                                            ) : (
                                                <span className="truncate">{chat.lastMessage?.content || 'No messages yet'}</span>
                                            )}
                                        </p>
                                        {/* Unread badge - shown when there are unread messages */}
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area - Responsive */}
                <div className={`${showMobileList ? 'hidden' : 'flex'
                    } md:flex flex-1 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    {/* Back Button - Mobile Only */}
                                    <button
                                        onClick={() => setShowMobileList(true)}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="relative">
                                        <img src={getChatAvatar(activeChat)} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gray-100" alt="" />
                                        {activeChat.type === 'private' && (
                                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${isOnline(activeChat) ? 'bg-green-500' : 'bg-gray-300'
                                                }`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">{getChatName(activeChat)}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {Object.keys(typingUsers).length > 0 ? (
                                                <span className="text-purple-600 flex items-center gap-1">
                                                    <span className="flex gap-0.5">
                                                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-1 h-1 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </span>
                                                    typing...
                                                </span>
                                            ) : (
                                                getChatStatus(activeChat)
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Premium AI Toggle Button */}
                                    <button
                                        onClick={() => handleStartCall('voice')}
                                        className="p-2.5 hover:bg-purple-50 hover:text-purple-600 rounded-xl text-gray-400 transition-colors"
                                        title="Voice Call"
                                    >
                                        <Phone size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleStartCall('video')}
                                        className="p-2.5 hover:bg-purple-50 hover:text-purple-600 rounded-xl text-gray-400 transition-colors"
                                        title="Video Call"
                                    >
                                        <Video size={20} />
                                    </button>
                                    <button
                                        onClick={() => setShowInfo(!showInfo)}
                                        className={`p-2.5 rounded-xl transition-all ${showInfo ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        <Info size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                                {Object.entries(messageGroups).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
                                                {date}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {msgs.map((msg, idx) => {
                                                const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id
                                                const showAvatar = !isOwn && (idx === 0 || msgs[idx - 1]?.senderId?._id !== msg.senderId?._id)

                                                return (
                                                    <div key={msg._id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} group`}>
                                                        {!isOwn && (
                                                            <div className="w-8 shrink-0">
                                                                {showAvatar && (
                                                                    <img
                                                                        src={msg.senderId?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=default`}
                                                                        className="w-8 h-8 rounded-full bg-gray-100"
                                                                        alt=""
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isOwn
                                                                    ? 'bg-gradient-to-br from-purple-600 to-orange-400 text-white rounded-tr-sm'
                                                                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                                                                    }`}
                                                            >
                                                                <MessageContent content={msg.content} isOwn={isOwn} />
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {formatTime(msg.createdAt)}
                                                                </span>
                                                                {isOwn && (
                                                                    (() => {
                                                                        // Check if message is read by anyone other than sender
                                                                        const isRead = msg.readBy?.some(r => r.userId !== user?._id && r.userId?._id !== user?._id)
                                                                        return isRead ? (
                                                                            // Blue double ticks - Read
                                                                            <CheckCheck size={14} className="text-blue-500" title="Read" />
                                                                        ) : (
                                                                            // Gray double ticks - Delivered/Sent
                                                                            <CheckCheck size={14} className="text-gray-400" title="Sent" />
                                                                        )
                                                                    })()
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Message Actions */}
                                                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                                                <Reply size={14} />
                                                            </button>
                                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                                                <Smile size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Composer */}
                            <div className="p-4 border-t border-gray-100 bg-white">
                                <div className="flex items-end gap-3">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleAttachmentClick}
                                            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-purple-500 transition-colors"
                                            title="Share a link"
                                        >
                                            <Paperclip size={20} />
                                        </button>
                                        <button
                                            onClick={handleImageUpload}
                                            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-purple-500 transition-colors"
                                            title="Share an image"
                                        >
                                            <Image size={20} />
                                        </button>
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={inputRef}
                                            rows={1}
                                            className="w-full bg-gray-50 rounded-xl py-3 px-4 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white border border-transparent focus:border-gray-200 resize-none transition-all"
                                            placeholder="Type a message..."
                                            value={message}
                                            onChange={handleInputChange}
                                            onKeyPress={handleKeyPress}
                                            style={{ minHeight: '48px', maxHeight: '120px' }}
                                        />
                                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
                                                >
                                                    <Smile size={18} />
                                                </button>
                                                {showEmojiPicker && (
                                                    <EmojiPicker
                                                        onSelect={(emoji) => setMessage(prev => prev + emoji)}
                                                        onClose={() => setShowEmojiPicker(false)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!message.trim() || sending}
                                        className="p-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:shadow-none bg-gradient-to-r from-purple-600 to-orange-400 text-white hover:shadow-purple-500/30"
                                    >
                                        {sending ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full block"></span>
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                            <div className="text-center max-w-sm">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageSquare size={40} className="text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Select a conversation</h3>
                                <p className="text-gray-500 mb-6">Choose from your existing chats or start a new conversation</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg flex items-center gap-2 mx-auto"
                                >
                                    <Plus size={18} />
                                    New Conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                {showInfo && activeChat && (
                    <ChatInfoPanel chat={activeChat} user={user} onClose={() => setShowInfo(false)} />
                )}
            </div>

            {/* New Chat Modal */}
            <NewChatModal
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                onCreateChat={handleCreateChat}
                users={users}
                contacts={contacts}
            />

            {/* Share Media Modal (Link/Image) */}
            <ShareMediaModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                type={shareType}
                onSubmit={handleShareSubmit}
            />
        </div>
    )
}
