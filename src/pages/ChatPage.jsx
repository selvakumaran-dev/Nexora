import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { userService, contactService } from '../services/userService'
import socketService from '../services/socketService'
import {
    Send, Paperclip, Phone, Video, Search, Smile,
    Plus, Users, X, Check, CheckCheck,
    Image, Link2, Mic, Trash2, Reply, Copy, Star, Info,
    MessageSquare, Circle, ChevronLeft, MoreVertical, Loader2
} from 'lucide-react'

// Emoji Picker Component
const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '✨', '🎉', '👏', '💯', '🙏', '😢', '😮', '🤯', '💪', '🚀', '😊', '🙌', '💖', '🎯', '💡', '🌟', '😇', '🤩', '🥳', '😋']

function EmojiPicker({ onSelect, onClose }) {
    const pickerRef = useRef(null)

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
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500">Emojis</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                    <X size={14} />
                </button>
            </div>
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
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        setUrl('')
        setFile(null)
        setPreview(null)
        setUploading(false)
    }, [isOpen])

    const isImage = type === 'image'

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result)
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleSubmit = async () => {
        if (isImage && file) {
            setUploading(true)
            try {
                const res = await chatService.uploadFile(file)
                if (res.success) {
                    onSubmit(res.data.url)
                    onClose()
                }
            } catch (err) {
                console.error('Upload failed', err)
            } finally {
                setUploading(false)
            }
        } else if (url.trim()) {
            onSubmit(url.trim())
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-slate-900 p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                                {isImage ? <Image size={20} /> : <Link2 size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white">
                                    {isImage ? 'Share Image' : 'Share Link'}
                                </h3>
                                <p className="text-slate-400 text-xs">
                                    {isImage ? 'Enter an image URL to share' : 'Enter a URL to share'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* File Selection for Image */}
                    {isImage && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Select Image from Device</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-900">{file ? file.name : 'Click to browse files'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Direct upload supported</p>
                            </div>
                        </div>
                    )}

                    {/* URL Input for Link */}
                    {!isImage && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Link URL</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Link2 size={18} />
                                </div>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full pl-12 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {isImage && preview && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-40 object-cover"
                                onError={() => setPreview(null)}
                            />
                        </div>
                    )}

                    {!isImage && preview && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <Link2 size={18} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{preview}</p>
                                <p className="text-xs text-slate-500 truncate">{url}</p>
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-xs text-blue-700">
                            💡 {isImage
                                ? 'Tip: Use direct image links ending in .jpg, .png, .gif, etc.'
                                : 'Tip: Paste any URL to share with your connection'
                            }
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-0">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={uploading || (isImage ? !file : !url.trim())}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Message Content with Link & Image Preview
function MessageContent({ content, isOwn }) {
    const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url)
    const isUrl = (str) => /^https?:\/\/[^\s]+$/i.test(str)

    const urlPattern = /(https?:\/\/[^\s]+)/gi
    const urls = content.match(urlPattern) || []
    const imageUrls = urls.filter(isImageUrl)
    const linkUrls = urls.filter(url => !isImageUrl(url))

    const renderContent = () => {
        const parts = content.split(urlPattern)
        return parts.map((part, i) => {
            if (isUrl(part)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`underline font-medium break-all ${isOwn ? 'text-white/90 hover:text-white' : 'text-blue-600 hover:text-blue-700'}`}
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
            <p className="whitespace-pre-wrap break-words">{renderContent()}</p>

            {imageUrls.length > 0 && (
                <div className={`grid gap-2 mt-2 ${imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                            <img
                                src={url}
                                alt="Shared image"
                                className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity border border-black/5"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        </a>
                    ))}
                </div>
            )}

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
                                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${isOwn
                                    ? 'bg-white/10 border-white/20 hover:bg-white/20'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? 'bg-white/20' : 'bg-blue-100'
                                    }`}>
                                    <Link2 className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${isOwn ? 'text-white' : 'text-slate-800'}`}>
                                        {hostname}
                                    </p>
                                    <p className={`text-[11px] truncate ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
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

// New Chat Modal - Professional Theme
function NewChatModal({ isOpen, onClose, onCreateChat, users, contacts = [] }) {
    const [chatType, setChatType] = useState('private')
    const [selectedUsers, setSelectedUsers] = useState([])
    const [groupName, setGroupName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    if (!isOpen) return null

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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 p-5 text-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">New Message</h3>
                                <p className="text-slate-400 text-xs">Start a conversation</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Chat Type Toggle */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setChatType('private'); setSelectedUsers([]) }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${chatType === 'private'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <MessageSquare size={16} /> Direct
                        </button>
                        <button
                            onClick={() => { setChatType('group'); setSelectedUsers([]) }}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${chatType === 'group'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users size={16} /> Group
                        </button>
                    </div>
                </div>

                {/* Group Name */}
                {chatType === 'group' && (
                    <div className="p-4 border-b border-slate-100">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400"
                        />
                    </div>
                )}

                {/* Search */}
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="overflow-y-auto flex-1 p-2">
                    {connectedUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium">No Connections</p>
                            <p className="text-slate-400 text-sm mt-1">Connect with people to chat</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <p>No results found</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredUsers.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => toggleUser(user._id)}
                                    className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors rounded-lg border text-left ${selectedUsers.includes(user._id)
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                            className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                                            alt=""
                                        />
                                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm truncate ${selectedUsers.includes(user._id) ? 'text-blue-700' : 'text-slate-900'}`}>{user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    {selectedUsers.includes(user._id) && (
                                        <Check size={18} className="text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                    <button
                        onClick={handleCreate}
                        disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {chatType === 'private' ? 'Start Chat' : 'Create Group'}
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
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm z-20">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-500">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 content-start">
                {/* Avatar & Name */}
                <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 p-1 mb-3 ring-1 ring-slate-100">
                        <img
                            src={isGroup
                                ? `https://api.dicebear.com/9.x/shapes/svg?seed=${chat.name}`
                                : otherMember?.avatarUrl || `https://ui-avatars.com/api/?name=${otherMember?.name}&background=random`
                            }
                            className="w-full h-full rounded-full bg-white object-cover"
                            alt=""
                        />
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 truncate px-2">
                        {isGroup ? chat.name : otherMember?.name || 'Unknown'}
                    </h4>
                    {!isGroup && (
                        <p className="text-sm text-slate-500 truncate px-2">{otherMember?.email}</p>
                    )}
                    {!isGroup && (
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                            <Circle size={8} className={otherMember?.status === 'online' ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-300 text-slate-300'} />
                            <span className="text-xs font-medium text-slate-600">
                                {otherMember?.status === 'online' ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('startCall', { detail: { type: 'voice', user: otherMember } }))}
                        className="p-3 flex flex-col items-center gap-2 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100 group"
                    >
                        <Phone size={20} className="text-slate-600 group-hover:text-blue-600" />
                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Call</span>
                    </button>
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('startCall', { detail: { type: 'video', user: otherMember } }))}
                        className="p-3 flex flex-col items-center gap-2 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100 group"
                    >
                        <Video size={20} className="text-slate-600 group-hover:text-blue-600" />
                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Video</span>
                    </button>
                    <button className="p-3 flex flex-col items-center gap-2 bg-slate-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100 group">
                        <Search size={20} className="text-slate-600 group-hover:text-blue-600" />
                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Search</span>
                    </button>
                </div>

                {/* Group Members */}
                {isGroup && (
                    <div className="mb-6">
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">{chat.members?.length || 0} Members</h5>
                        <div className="space-y-1">
                            {chat.members?.map(member => (
                                <div key={member.userId?._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <img
                                        src={member.userId?.avatarUrl || `https://ui-avatars.com/api/?name=${member.userId?.name}&background=random`}
                                        className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{member.userId?.name}</p>
                                        <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${member.userId?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Options List */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                        <Star size={18} className="text-slate-400 group-hover:text-yellow-500" />
                        <span className="text-sm text-slate-700 font-medium">Starred Messages</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                        <Image size={18} className="text-slate-400 group-hover:text-blue-500" />
                        <span className="text-sm text-slate-700 font-medium">Media & Files</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600 group">
                        <Trash2 size={18} className="text-red-400 group-hover:text-red-600" />
                        <span className="text-sm font-medium">Delete Chat</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Call Interface Component - Professional
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
        return () => endCallCleanup()
    }, [])

    useEffect(() => {
        if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream
        if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
    }, [localStream, remoteStream])

    useEffect(() => {
        if (status === 'connected') {
            const timer = setInterval(() => setDuration(prev => prev + 1), 1000)
            return () => clearInterval(timer)
        }
    }, [status])

    const initializeCall = async () => {
        try {
            const mediaConstraints = {
                audio: true,
                video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
            }
            const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
            setLocalStream(stream)

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            })
            peerConnection.current = pc

            stream.getTracks().forEach(track => pc.addTrack(track, stream))

            pc.ontrack = (event) => setRemoteStream(event.streams[0])
            pc.onicecandidate = (event) => {
                if (event.candidate) socketService.sendIceCandidate(user._id, event.candidate)
            }
            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'connected') setStatus('connected')
            }

            socketService.onIceCandidate(async ({ candidate }) => {
                try { if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch (e) { }
            })
            socketService.onCallEnded(() => onClose())

            if (isIncoming && offer) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer))
            } else if (!isIncoming) {
                const newOffer = await pc.createOffer()
                await pc.setLocalDescription(newOffer)
                socketService.startCall(user._id, newOffer, type)
                socketService.onCallAccepted(async ({ answer }) => {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer))
                    setStatus('connected')
                })
            }
        } catch (err) {
            console.error('Call initialization failed', err)
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
        } catch (err) { }
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
        <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center text-white">
            {type === 'video' && remoteStream && (
                <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            )}
            {(!remoteStream || type === 'voice') && (
                <div className="absolute inset-0 overflow-hidden bg-slate-900">
                    <img
                        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                        className="w-full h-full object-cover opacity-10 blur-3xl scale-125"
                        alt=""
                    />
                </div>
            )}
            {type === 'video' && localStream && (
                <div className="absolute top-6 right-6 w-32 h-48 bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
                <div className="mb-16 text-center">
                    {(!remoteStream || type === 'voice') && (
                        <div className="w-32 h-32 rounded-full border-4 border-white/5 p-1 mb-8 mx-auto relative bg-slate-800">
                            <img
                                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                className="w-full h-full rounded-full object-cover"
                                alt=""
                            />
                            {(status === 'calling' || status === 'incoming') && (
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-50"></div>
                            )}
                        </div>
                    )}
                    <h2 className="text-3xl font-bold mb-3">{user?.name}</h2>
                    <p className="text-blue-200 text-lg font-medium">
                        {status === 'incoming' ? 'Incoming Call...' :
                            status === 'calling' ? 'Calling...' :
                                status === 'connected' ? formatDuration(duration) : 'Ended'}
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    {status === 'incoming' ? (
                        <>
                            <button onClick={onClose} className="p-5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-transform hover:scale-110">
                                <Phone size={32} className="rotate-[135deg]" />
                            </button>
                            <button onClick={handleAnswer} className="p-5 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg transition-transform hover:scale-110 animate-pulse">
                                <Phone size={32} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={toggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20'}`}>
                                <Mic size={24} className={isMuted ? 'fill-current' : ''} />
                            </button>
                            {type === 'video' && (
                                <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20'}`}>
                                    <Video size={24} className={isVideoOff ? 'fill-current' : ''} />
                                </button>
                            )}
                            <button onClick={onClose} className="p-5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-transform hover:scale-110">
                                <Phone size={28} className="rotate-[135deg]" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main Chat Page - Professional
export default function ChatPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const {
        chats, activeChat, messages, loading, selectChat, sendMessage, markAsRead,
        loadChats, typingUsers, createPrivateChat, createGroupChat, startTyping, stopTyping
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
    const [showMobileList, setShowMobileList] = useState(true)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const markedAsReadRef = useRef(new Set())

    useEffect(() => {
        if (!isAuthenticated) return navigate('/login')
        loadChats()
        loadUsers()
    }, [isAuthenticated, navigate, loadChats])

    useEffect(() => {
        if (activeChat) {
            markAsRead(activeChat._id)
            setShowMobileList(false)
        }
    }, [activeChat?._id, markAsRead]) // Only run when chat changes or messages change (implicitly via context update if we really wanted to, but markAsRead takes care of unreadCount)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (!isAuthenticated) return
        socketService.onIncomingCall(data => { setActiveCall(data); setIsIncomingCall(true) })
        socketService.onCallAccepted(data => { setActiveCall(data); setIsIncomingCall(false) })
        socketService.onCallEnded(() => { setActiveCall(null); setIsIncomingCall(false) })

        const handleStartCall = (e) => {
            const { type, user } = e.detail
            setActiveCall({ type, user, fromUserId: user._id })
            setIsIncomingCall(false)
        }
        window.addEventListener('startCall', handleStartCall)

        return () => {
            socketService.off('call:incoming')
            socketService.off('call:accepted')
            socketService.off('call:ended')
            window.removeEventListener('startCall', handleStartCall)
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (activeChat && messages.length > 0 && user?._id) {
            const timeoutId = setTimeout(() => {
                const unread = messages.filter(msg => {
                    const senderId = msg.senderId?._id || msg.senderId
                    if (senderId === user._id) return false
                    if (markedAsReadRef.current.has(msg._id)) return false
                    return !msg.readBy?.some(r => (r.userId === user._id) || (r.userId?._id === user._id))
                }).map(m => m._id)

                if (unread.length > 0) {
                    unread.forEach(id => markedAsReadRef.current.add(id))
                    socketService.markAsRead(activeChat._id, unread)
                }
            }, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [messages, activeChat, user])

    useEffect(() => markedAsReadRef.current.clear(), [activeChat?._id])

    const loadUsers = async () => {
        try {
            const [usersRes, contactsRes] = await Promise.all([userService.getUsers({ limit: 50 }), contactService.getContacts()])
            if (usersRes.success) setUsers(usersRes.data.filter(u => u._id !== user?._id))
            if (contactsRes.success) setContacts(contactsRes.data || [])
        } catch (error) { }
    }

    const handleSend = async () => {
        if (!message.trim() || sending) return
        setSending(true)
        stopTyping()
        try {
            await sendMessage(message)
            setMessage('')
        } catch (err) { }
        finally { setSending(false) }
    }

    const handleInputChange = (e) => {
        setMessage(e.target.value)
        startTyping()
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000)
    }

    const getChatName = (chat) => chat.type === 'group' ? chat.name : (chat.members?.find(m => m.userId?._id !== user?._id)?.userId?.name || 'Unknown')

    // Helper to get consistent avatar
    const getChatAvatar = (chat) => {
        if (chat.type === 'group') return `https://api.dicebear.com/9.x/shapes/svg?seed=${chat.name}`
        const other = chat.members?.find(m => m.userId?._id !== user?._id)
        return other?.userId?.avatarUrl || `https://ui-avatars.com/api/?name=${other?.userId?.name || 'User'}&background=random`
    }

    const isOnline = (chat) => {
        if (chat.type === 'group') return true
        return chat.members?.find(m => m.userId?._id !== user?._id)?.userId?.status === 'online'
    }

    const groupMessagesByDate = (msgs) => {
        const groups = {}
        msgs.forEach(msg => {
            const d = new Date(msg.createdAt)
            const dateStr = d.toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : d.toLocaleDateString()
            if (!groups[dateStr]) groups[dateStr] = []
            groups[dateStr].push(msg)
        })
        return groups
    }

    const handleStartCall = (type) => {
        if (!activeChat) return
        const otherMember = activeChat.members?.find(m => m.userId?._id !== user?._id)?.userId
        if (otherMember) {
            setActiveCall({ type, user: otherMember, fromUserId: user._id })
            setIsIncomingCall(false)
        }
    }

    const filteredChats = useMemo(() => {
        return chats.filter(chat => getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase()))
    }, [chats, searchQuery])

    if (!isAuthenticated) return null

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden relative">
            <div className="relative z-50"><Navbar /></div>
            {activeCall && <CallInterface callData={activeCall} isIncoming={isIncomingCall} onClose={() => { setActiveCall(null); setIsIncomingCall(false) }} />}

            <div className="flex-1 flex max-w-[1600px] mx-auto w-full p-2 sm:p-4 gap-2 sm:gap-6 h-[calc(100vh-80px)] pb-20 md:pb-4 relative z-10">

                {/* Sidebar */}
                <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex-col overflow-hidden`}>
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-xl text-slate-800">Messages</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {!loading && filteredChats.length === 0 && (
                            <div className="p-10 text-center text-slate-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="font-medium text-sm">No conversations</p>
                            </div>
                        )}
                        {filteredChats.map(chat => (
                            <div
                                key={chat._id}
                                onClick={() => selectChat(chat)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4 ${chat._id === activeChat?._id
                                    ? 'bg-blue-50 border-blue-600'
                                    : 'hover:bg-slate-50 border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <img src={getChatAvatar(chat)} className="w-12 h-12 rounded-full bg-slate-200 object-cover" alt="" />
                                    {chat.type === 'private' && (
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(chat) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`font-semibold text-sm truncate ${chat._id === activeChat?._id ? 'text-blue-900' : 'text-slate-900'}`}>{getChatName(chat)}</span>
                                        <span className="text-xs text-slate-400">{chat.lastMessage?.createdAt && new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-slate-500 truncate flex-1">
                                            {chat.lastMessage?.content || 'No messages yet'}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${showMobileList ? 'hidden' : 'flex'} md:flex flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex-col overflow-hidden relative`}>
                    {activeChat ? (
                        <>
                            {/* Header */}
                            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button onClick={() => setShowMobileList(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="relative">
                                        <img src={getChatAvatar(activeChat)} className="w-10 h-10 rounded-full bg-slate-200 object-cover" alt="" />
                                        {isOnline(activeChat) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">{getChatName(activeChat)}</h3>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            {isOnline(activeChat) ? 'Active now' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => handleStartCall('voice')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Phone size={20} /></button>
                                    <button onClick={() => handleStartCall('video')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Video size={20} /></button>
                                    <button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}><Info size={20} /></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
                                {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="flex justify-center mb-4"><span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-medium">{date}</span></div>
                                        <div className="space-y-2">
                                            {msgs.map((msg) => {
                                                const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id
                                                return (
                                                    <div key={msg._id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} group`}>
                                                        <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isOwn ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-slate-700 rounded-tl-sm'}`}>
                                                                <MessageContent content={msg.content} isOwn={isOwn} />
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                                <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {isOwn && <CheckCheck size={12} className={msg.readBy?.length > 1 ? 'text-blue-500' : 'text-slate-300'} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-xl border border-transparent focus-within:border-blue-200 transition-colors">
                                    <div className="flex pb-1">
                                        <button onClick={() => { setShareType('link'); setShowShareModal(true) }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Paperclip size={20} /></button>
                                        <button onClick={() => { setShareType('image'); setShowShareModal(true) }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Image size={20} /></button>
                                    </div>
                                    <textarea
                                        ref={inputRef}
                                        rows={1}
                                        className="flex-1 bg-transparent py-2 px-2 text-sm focus:outline-none resize-none max-h-32 text-slate-700 placeholder:text-slate-400"
                                        value={message}
                                        onChange={handleInputChange}
                                        onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                        style={{ minHeight: '40px' }}
                                    />
                                    <div className="relative pb-1">
                                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-400 hover:text-yellow-500 transition-colors"><Smile size={20} /></button>
                                        {showEmojiPicker && <EmojiPicker onSelect={(e) => setMessage(prev => prev + e)} onClose={() => setShowEmojiPicker(false)} />}
                                    </div>
                                    <button onClick={handleSend} disabled={!message.trim() || sending} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm mb-0.5">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Select a conversation</h3>
                            <button onClick={() => setShowNewChat(true)} className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                Start New Chat
                            </button>
                        </div>
                    )}
                </div>

                {showInfo && activeChat && <ChatInfoPanel chat={activeChat} user={user} onClose={() => setShowInfo(false)} />}
            </div>

            <NewChatModal isOpen={showNewChat} onClose={() => setShowNewChat(false)} onCreateChat={(data) => { if (data.type === 'private') createPrivateChat(data.userId); else createGroupChat(data.name, data.userIds); }} users={users} contacts={contacts} />
            <ShareMediaModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} type={shareType} onSubmit={(url) => { setMessage(prev => prev + (prev ? '\n' : '') + url); inputRef.current?.focus(); }} />
        </div>
    )
}
