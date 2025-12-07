import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { contactService } from '../services/userService'
import socketService from '../services/socketService'
import { COMPUTER_SKILLS, INTERESTS } from '../data/skillsAndInterests'
import {
    Search, Bell, Menu, User, Settings, LogOut, Shield, ChevronDown, HelpCircle,
    UserPlus, Check, X, MessageSquare, Users, Clock, Camera, Mail, Calendar,
    Lock, Trash2, Sparkles, Heart, Zap
} from 'lucide-react'

export default function Navbar({ externalProfileModal = false, onCloseExternalModal }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout, isAuthenticated, updateProfile } = useAuth()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [loadingNotifications, setLoadingNotifications] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const menuRef = useRef(null)
    const notifRef = useRef(null)

    // Handle external profile modal control
    useEffect(() => {
        if (externalProfileModal) {
            setShowProfileModal(true)
        }
    }, [externalProfileModal])

    const handleCloseProfileModal = () => {
        setShowProfileModal(false)
        if (onCloseExternalModal) {
            onCloseExternalModal()
        }
    }

    const isActive = (path) => location.pathname === path ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-50'

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Listen for new messages and update unread count
    useEffect(() => {
        if (!isAuthenticated) return

        let socket = socketService.getSocket()

        const handleNewMessage = (message) => {
            console.log('📩 New message received in Navbar:', message)
            // Only increment if not on chat page and message is from someone else
            if (location.pathname !== '/chat' && message.senderId?._id !== user?._id) {
                setUnreadMessages(prev => prev + 1)
            }
        }

        // If socket exists, attach listener immediately
        if (socket) {
            socket.on('message:new', handleNewMessage)
        }

        // Check for socket every second (in case it connects after mount)
        const interval = setInterval(() => {
            const currentSocket = socketService.getSocket()
            if (currentSocket && currentSocket !== socket) {
                // Socket changed, update listener
                if (socket) {
                    socket.off('message:new', handleNewMessage)
                }
                socket = currentSocket
                socket.on('message:new', handleNewMessage)
            }
        }, 1000)

        return () => {
            clearInterval(interval)
            if (socket) {
                socket.off('message:new', handleNewMessage)
            }
        }
    }, [location.pathname, user, isAuthenticated])

    // Clear unread count when navigating to chat
    useEffect(() => {
        if (location.pathname === '/chat') {
            setUnreadMessages(0)
        }
    }, [location.pathname])

    // Load notifications
    const loadNotifications = async () => {
        setLoadingNotifications(true)
        try {
            const res = await contactService.getPendingRequests()
            if (res.success) {
                setPendingRequests(res.data || [])
            }
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setLoadingNotifications(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications()
        }
    }, [isAuthenticated])

    const handleAcceptRequest = async (contactId) => {
        try {
            await contactService.acceptRequest(contactId)
            setPendingRequests(prev => prev.filter(r => r._id !== contactId))
        } catch (error) {
            console.error('Failed to accept:', error)
        }
    }

    const handleRejectRequest = async (contactId) => {
        try {
            await contactService.removeContact(contactId)
            setPendingRequests(prev => prev.filter(r => r._id !== contactId))
        } catch (error) {
            console.error('Failed to reject:', error)
        }
    }

    const handleLogout = async () => {
        setShowProfileMenu(false)
        await logout()
        navigate('/login')
    }

    const totalNotifications = pendingRequests.length

    // Menu items with Help & Support linking to developer LinkedIn
    const menuItems = [
        { icon: User, label: 'My Profile', action: () => { setShowProfileMenu(false); setShowProfileModal(true) } },
        { icon: HelpCircle, label: 'Help & Support', action: () => { setShowProfileMenu(false); window.open('https://www.linkedin.com/in/selva-kumaran-a6529a321/', '_blank') } },
    ]

    return (
        <>
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="flex items-center gap-4 sm:gap-8">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:shadow-md transition-all">
                            N
                        </div>
                        <span className="font-semibold text-lg font-heading text-nexora-navy tracking-tight hidden sm:inline">Nexora</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            { name: 'Dashboard', path: '/dashboard' },
                            { name: 'Discover', path: '/directory' },
                            { name: 'Chat', path: '/chat', badge: unreadMessages },
                            { name: 'Code', path: '/code' },
                        ].map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path)}`}
                            >
                                {item.name}
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 px-4 lg:px-6 max-w-xl mx-auto hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-nexora-primary transition-colors" size={18} />
                        <input
                            aria-label="Search"
                            className="w-full rounded-lg py-2 pl-10 pr-4 bg-gray-50 border border-transparent focus:bg-white focus:border-nexora-accent focus:ring-2 focus:ring-nexora-accent/20 focus:outline-none transition-all text-sm"
                            placeholder="Search members, groups, tasks..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notifications Dropdown */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) loadNotifications() }}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-nexora-primary transition-colors relative"
                        >
                            <Bell size={20} />
                            {totalNotifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
                                    {totalNotifications > 9 ? '9+' : totalNotifications}
                                </span>

                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-nexora-navy">Notifications</h3>
                                    {totalNotifications > 0 && (
                                        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                                            {totalNotifications} new
                                        </span>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {loadingNotifications ? (
                                        <div className="p-8 text-center">
                                            <div className="animate-spin w-6 h-6 border-2 border-nexora-primary border-t-transparent rounded-full mx-auto"></div>
                                        </div>
                                    ) : pendingRequests.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Contact Requests Section */}
                                            {pendingRequests.length > 0 && (
                                                <div>
                                                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                        <UserPlus size={12} /> Contact Requests
                                                    </div>
                                                    {pendingRequests.map((request) => (
                                                        <div key={request._id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                                                            <div className="flex items-start gap-3">
                                                                <img
                                                                    src={request.initiatedBy?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${request.initiatedBy?.name}`}
                                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                                    alt=""
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-nexora-navy truncate">
                                                                        {request.initiatedBy?.name || 'Unknown'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">wants to connect</p>
                                                                    <div className="flex gap-2 mt-2">
                                                                        <button
                                                                            onClick={() => handleAcceptRequest(request._id)}
                                                                            className="flex items-center gap-1 px-3 py-1 bg-nexora-primary text-white text-xs rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                                                        >
                                                                            <Check size={12} /> Accept
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectRequest(request._id)}
                                                                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                                                        >
                                                                            <X size={12} /> Decline
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                                    <button className="text-nexora-primary text-sm font-medium hover:underline w-full text-center">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gray-200 p-0.5 ring-2 ring-white shadow-sm group-hover:ring-nexora-primary/20 transition-all overflow-hidden">
                                <img
                                    src={user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full bg-white object-cover"
                                />
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 hidden sm:block transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nexora-primary/10 to-nexora-accent/10 p-0.5">
                                            <img
                                                src={user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                                alt="Avatar"
                                                className="w-full h-full rounded-full bg-white"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-nexora-navy truncate">{user?.name || 'User'}</p>
                                            <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
                                            {user?.role === 'admin' && (
                                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                                                    <Shield size={10} /> Admin
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="py-2">
                                    {menuItems.map((item, index) => {
                                        if (item.adminOnly && user?.role !== 'admin') return null

                                        if (item.path) {
                                            return (
                                                <Link
                                                    key={index}
                                                    to={item.path}
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <item.icon size={18} className="text-gray-400" />
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                </Link>
                                            )
                                        }

                                        return (
                                            <button
                                                key={index}
                                                onClick={item.action}
                                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                                            >
                                                <item.icon size={18} className="text-gray-400" />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="border-t border-gray-100 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden p-2 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}

            {/* Mobile Sidebar Menu */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-orange-400">
                    <span className="font-bold text-white text-lg">Menu</span>
                    <button
                        onClick={() => setShowMobileMenu(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name || 'User'}`}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full bg-gray-100"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="p-2">
                    {[
                        { name: 'Dashboard', path: '/dashboard', icon: Users },
                        { name: 'Discover', path: '/directory', icon: Search },
                        { name: 'Chat', path: '/chat', icon: MessageSquare, badge: unreadMessages },
                        { name: 'Code', path: '/code', icon: UserPlus },
                    ].map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowMobileMenu(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.path)}`}
                        >
                            <item.icon size={20} />
                            {item.name}
                            {item.badge > 0 && (
                                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 mt-auto absolute bottom-0 left-0 right-0 bg-white">
                    <button
                        onClick={() => {
                            setShowMobileMenu(false)
                            setShowProfileModal(true)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mb-2"
                    >
                        <User size={18} />
                        <span className="text-sm font-medium">My Profile</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowMobileMenu(false)
                            handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Only on mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    {[
                        { name: 'Home', path: '/dashboard', icon: Users },
                        { name: 'Discover', path: '/directory', icon: Search },
                        { name: 'Chat', path: '/chat', icon: MessageSquare, badge: unreadMessages },
                        { name: 'Profile', action: () => setShowProfileModal(true), icon: User },
                    ].map((item, index) => (
                        item.path ? (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${location.pathname === item.path ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="relative">
                                    <item.icon size={22} />
                                    {item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        ) : (
                            <button
                                key={index}
                                onClick={item.action}
                                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
                            >
                                <item.icon size={22} />
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </button>
                        )
                    ))}
                </div>
            </nav>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={handleCloseProfileModal}
                user={user}
                updateProfile={updateProfile}
            />
        </>
    )
}

// Profile Modal Component
function ProfileModal({ isOpen, onClose, user, updateProfile }) {
    const [activeTab, setActiveTab] = useState('profile')
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || '',
        gender: 'male',
        headline: user?.headline || '',
        bio: user?.bio || '',
        skills: user?.skills || [],
        interests: user?.interests || [],
        lookingFor: user?.lookingFor || '',
        experience: user?.experience || '',
        location: user?.location || ''
    })
    const [skillInput, setSkillInput] = useState('')
    const [interestInput, setInterestInput] = useState('')
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [passwordSaving, setPasswordSaving] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')
    const [skillSearchQuery, setSkillSearchQuery] = useState('')
    const [interestSearchQuery, setInterestSearchQuery] = useState('')

    // Use comprehensive skills and interests from data file
    const suggestedSkills = COMPUTER_SKILLS.slice(0, 20)
    const suggestedInterests = INTERESTS.slice(0, 20)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatarUrl: user.avatarUrl || '',
                gender: 'male',
                headline: user.headline || '',
                bio: user.bio || '',
                skills: user.skills || [],
                interests: user.interests || [],
                lookingFor: user.lookingFor || '',
                experience: user.experience || '',
                location: user.location || ''
            })
        }
    }, [user])

    if (!isOpen) return null

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
            setSkillInput('')
        }
    }

    const removeSkill = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
    }

    const addInterest = () => {
        if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
            setFormData(prev => ({ ...prev, interests: [...prev.interests, interestInput.trim()] }))
            setInterestInput('')
        }
    }

    const removeInterest = (interest) => {
        setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateProfile({
                name: formData.name,
                avatarUrl: formData.avatarUrl,
                headline: formData.headline,
                bio: formData.bio,
                skills: formData.skills,
                interests: formData.interests,
                lookingFor: formData.lookingFor,
                experience: formData.experience,
                location: formData.location
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) {
            console.error('Failed to update profile:', error)
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        setPasswordError('')
        setPasswordSuccess('')

        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setPasswordError('Please fill in all fields')
            return
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters')
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        setPasswordSaving(true)
        try {
            const { authService } = await import('../services/authService')
            const result = await authService.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            )
            if (result.success) {
                setPasswordSuccess('Password changed successfully!')
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                setPasswordError(result.message || 'Failed to change password')
            }
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password')
        } finally {
            setPasswordSaving(false)
        }
    }

    // Avatar styles for different genders
    const avatarStyles = {
        male: [
            'adventurer', 'avataaars', 'lorelei', 'micah', 'bottts', 'pixel-art'
        ],
        female: [
            'adventurer', 'avataaars', 'lorelei', 'micah', 'fun-emoji', 'big-smile'
        ]
    }

    const generateGenderAvatar = (gender) => {
        const styles = avatarStyles[gender] || avatarStyles.male
        const style = styles[Math.floor(Math.random() * styles.length)]
        const seed = formData.name + Date.now()
        setFormData(prev => ({
            ...prev,
            gender,
            avatarUrl: `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`
        }))
    }

    const formatMemberSince = (date) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header with Website Color Theme */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-400 p-6 text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-white/20 p-1 ring-4 ring-white/30">
                                <img
                                    src={formData.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.name}`}
                                    className="w-full h-full rounded-full bg-white object-cover"
                                    alt=""
                                />
                            </div>
                            <button
                                onClick={() => generateGenderAvatar(formData.gender)}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-purple-600"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                            <p className="text-purple-100 text-sm">{user?.email}</p>
                            {user?.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full">
                                    <Shield size={10} /> Administrator
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-100">
                    <div className="flex">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'skills', label: 'Skills & Interests', icon: Sparkles },
                            { id: 'account', label: 'Account', icon: Settings },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                            </div>

                            {/* Gender-based Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Avatar Style</label>
                                <div className="flex gap-3 mb-4">
                                    <button
                                        onClick={() => generateGenderAvatar('male')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.gender === 'male'
                                            ? 'border-nexora-primary bg-blue-50 text-nexora-primary'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">👨</span>
                                        <span className="font-medium">Male</span>
                                    </button>
                                    <button
                                        onClick={() => generateGenderAvatar('female')}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${formData.gender === 'female'
                                            ? 'border-nexora-primary bg-blue-50 text-nexora-primary'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">👩</span>
                                        <span className="font-medium">Female</span>
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary transition-all text-sm"
                                        placeholder="Or enter custom avatar URL..."
                                    />
                                    <button
                                        onClick={() => generateGenderAvatar(formData.gender)}
                                        className="px-4 py-3 bg-nexora-primary text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Users size={14} />
                                        <span className="text-xs font-medium">Role</span>
                                    </div>
                                    <p className="font-semibold text-nexora-navy capitalize">{user?.role || 'User'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-xs font-medium">Member Since</span>
                                    </div>
                                    <p className="font-semibold text-nexora-navy">
                                        {formatMemberSince(user?.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            {/* Skills Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Zap size={16} className="text-blue-500" />
                                    Your Skills
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary"
                                        placeholder="Add a skill..."
                                    />
                                    <button
                                        onClick={addSkill}
                                        className="px-4 py-2.5 bg-nexora-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.skills.map((skill, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            {skill}
                                            <button onClick={() => removeSkill(skill)} className="hover:text-blue-900">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {formData.skills.length === 0 && (
                                        <p className="text-gray-400 text-sm">No skills added yet</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Suggested:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedSkills.filter(s => !formData.skills.includes(s)).slice(0, 5).map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }))}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                + {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Interests Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Heart size={16} className="text-purple-500" />
                                    Your Interests
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={interestInput}
                                        onChange={(e) => setInterestInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                        placeholder="Add an interest..."
                                    />
                                    <button
                                        onClick={addInterest}
                                        className="px-4 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {formData.interests.map((interest, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                            {interest}
                                            <button onClick={() => removeInterest(interest)} className="hover:text-purple-900">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    {formData.interests.length === 0 && (
                                        <p className="text-gray-400 text-sm">No interests added yet</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Suggested:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedInterests.filter(i => !formData.interests.includes(i)).slice(0, 5).map(interest => (
                                            <button
                                                key={interest}
                                                onClick={() => setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }))}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                + {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-sm text-gray-700">
                                    💡 <strong>Tip:</strong> Adding skills and interests helps you connect with like-minded people!
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            {/* Change Password Section */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5">
                                <h4 className="font-semibold text-nexora-navy mb-4 flex items-center gap-2">
                                    <Lock size={18} />
                                    Change Password
                                </h4>

                                {passwordError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                                        <Check size={16} /> {passwordSuccess}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary transition-all"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary transition-all"
                                            placeholder="Enter new password (min 6 characters)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexora-primary/20 focus:border-nexora-primary transition-all"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={passwordSaving}
                                        className="w-full py-3 bg-nexora-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {passwordSaving ? (
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <Lock size={16} />
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                <h4 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                                    <Trash2 size={16} />
                                    Danger Zone
                                </h4>
                                <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
                                <button className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    {(activeTab === 'profile' || activeTab === 'skills') && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-orange-400 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
                        >
                            {saving ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : saved ? (
                                <>
                                    <Check size={16} /> Saved!
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

