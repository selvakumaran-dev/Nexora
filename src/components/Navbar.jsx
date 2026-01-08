import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { contactService } from '../services/userService'
import socketService from '../services/socketService'
import { COMPUTER_SKILLS, INTERESTS } from '../data/skillsAndInterests'
import {
    Search, Bell, Menu, User, Settings, LogOut, Shield, ChevronDown, HelpCircle,
    UserPlus, Check, X, MessageSquare, Users, Clock, Camera, Mail, Calendar,
    Lock, Trash2, Sparkles, Heart, Zap, LayoutDashboard, Code, Building2
} from 'lucide-react'

export default function Navbar({ externalProfileModal = false, onCloseExternalModal }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout, isAuthenticated, updateProfile } = useAuth()
    const { chats } = useChat()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [pendingRequests, setPendingRequests] = useState([])
    const [loadingNotifications, setLoadingNotifications] = useState(false)
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

    const isActive = (path) => location.pathname === path
        ? 'text-blue-600 bg-blue-50/50 shadow-sm'
        : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'

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


    const loadNotifications = async () => {
        setLoadingNotifications(true)
        try {
            const res = await contactService.getPendingRequests()
            if (res.success) setPendingRequests(res.data || [])
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setLoadingNotifications(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) loadNotifications()
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

    const totalUnreadMessages = useMemo(() =>
        chats?.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0) || 0
        , [chats])

    const totalNotifications = pendingRequests.length

    return (
        <>
            <header className="flex items-center justify-between px-6 sm:px-10 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60] shadow-sm shadow-slate-200/20">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 group-hover:scale-105 transition-all">
                            N
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">Nexora</span>
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-1">Nexus of Peers</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {[
                            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                            { name: 'Discover', path: '/directory', icon: Users },
                            { name: 'Messaging', path: '/chat', icon: MessageSquare, badge: totalUnreadMessages },
                            { name: 'Workbench', path: '/code', icon: Code, badge: totalUnreadMessages },
                        ].map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all group ${isActive(item.path)}`}
                            >
                                <item.icon size={18} className={`${location.pathname === item.path ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
                                <span>{item.name}</span>
                                {item.badge > 0 && (
                                    <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 px-8 lg:px-12 max-w-2xl mx-auto hidden xl:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            aria-label="Search"
                            className="w-full h-11 rounded-2xl pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                            placeholder="Connect with peers, projects, or knowledge..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) loadNotifications() }}
                            className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Bell size={22} strokeWidth={2.5} />
                            {totalNotifications > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-black flex items-center justify-center">
                                    {totalNotifications}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[70] overflow-hidden drop-shadow-2xl">
                                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                                    {totalNotifications > 0 && (
                                        <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded-full uppercase tracking-widest">
                                            {totalNotifications} New
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {loadingNotifications ? (
                                        <div className="p-12 text-center">
                                            <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                                        </div>
                                    ) : pendingRequests.length === 0 ? (
                                        <div className="p-12 text-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Bell size={32} strokeWidth={1.5} className="opacity-30" />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-widest">All caught up!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {pendingRequests.map((request) => (
                                                <div key={request._id} className="p-5 hover:bg-slate-50/80 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                            <img src={request.initiatedBy?.avatarUrl} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-slate-900 truncate">
                                                                {request.initiatedBy?.name}
                                                            </p>
                                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Connection Request</p>
                                                            <div className="flex gap-2 mt-4">
                                                                <button
                                                                    onClick={() => handleAcceptRequest(request._id)}
                                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                                                                >
                                                                    Connect
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectRequest(request._id)}
                                                                    className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
                                                                >
                                                                    Dismiss
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all group ${showProfileMenu ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border-2 border-white ring-1 ring-slate-100">
                                <img
                                    src={user?.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover bg-slate-50"
                                />
                            </div>
                            <div className="hidden lg:flex flex-col items-start pr-2">
                                <span className="text-xs font-black text-slate-900 tracking-tight">{user?.name}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180 text-blue-600' : ''}`} strokeWidth={3} />
                        </button>

                        {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-4 z-[70] drop-shadow-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                                    <p className="font-black text-slate-900 truncate tracking-tight">{user?.email}</p>
                                </div>

                                <div className="py-2">
                                    <button
                                        onClick={() => { setShowProfileMenu(false); setShowProfileModal(true) }}
                                        className="flex items-center gap-4 px-6 py-3.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all w-full text-left group"
                                    >
                                        <div className="p-2 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors">
                                            <User size={18} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-black tracking-tight">Edit Profile</span>
                                    </button>
                                    <button
                                        onClick={() => { setShowProfileMenu(false); window.open('https://www.linkedin.com/in/selva-kumaran-a6529a321/', '_blank') }}
                                        className="flex items-center gap-4 px-6 py-3.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all w-full text-left group"
                                    >
                                        <div className="p-2 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors">
                                            <HelpCircle size={18} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-sm font-black tracking-tight">Support</span>
                                    </button>
                                </div>

                                <div className="px-4 mt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-4 px-4 py-3.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all w-full group"
                                    >
                                        <LogOut size={18} strokeWidth={2.5} />
                                        <span className="text-sm font-black tracking-tight">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl">
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden" onClick={() => setShowMobileMenu(false)}>
                    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900">
                            <span className="font-black text-white uppercase tracking-[0.2em]">Menu</span>
                            <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-white/10 text-white rounded-xl"><X size={20} /></button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            {[
                                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                                { name: 'Discover', path: '/directory', icon: Users },
                                { name: 'Messaging', path: '/chat', icon: MessageSquare, badge: totalUnreadMessages },
                                { name: 'Workbench', path: '/code', icon: Code, badge: totalUnreadMessages },
                            ].map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMobileMenu(false)}
                                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                    {item.badge > 0 && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <ProfileModal
                isOpen={showProfileModal}
                onClose={handleCloseProfileModal}
                user={user}
                updateProfile={updateProfile}
            />
        </>
    )
}

function ProfileModal({ isOpen, onClose, user, updateProfile }) {
    const [activeTab, setActiveTab] = useState('profile')
    const [formData, setFormData] = useState({
        name: user?.name || '',
        avatarUrl: user?.avatarUrl || '',
        headline: user?.headline || '',
        bio: user?.bio || '',
        skills: user?.skills || [],
        interests: user?.interests || [],
        lookingFor: user?.lookingFor || '',
        experience: user?.experience || '',
        location: user?.location || '',
        department: user?.department || '',
        degree: user?.degree || '',
        batch: user?.batch || '',
        phone: user?.phone || ''
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

    useEffect(() => {
        if (user) setFormData({ ...formData, ...user })
    }, [user])

    if (!isOpen) return null

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await updateProfile(formData)
            if (res) setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error) { console.error(error) }
        finally { setSaving(false) }
    }

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword.length !== 8 || !/^\d+$/.test(passwordData.newPassword)) {
            setPasswordError('New PIN must be exactly 8 digits')
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('PINs do not match')
            return
        }
        setPasswordSaving(true)
        try {
            const { authService } = await import('../services/authService')
            const res = await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
            if (res.success) {
                setPasswordSuccess('PIN updated successfully!')
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else setPasswordError(res.message || 'Update failed')
        } catch (error) { setPasswordError('Update failed') }
        finally { setPasswordSaving(false) }
    }

    const addTag = (type, val) => {
        if (val.trim() && !formData[type].includes(val.trim())) {
            setFormData(prev => ({ ...prev, [type]: [...prev[type], val.trim()] }))
            type === 'skills' ? setSkillInput('') : setInterestInput('')
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-none sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                <div className="bg-slate-900 p-6 sm:p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={20} /></button>
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-blue-600 p-1 shadow-2xl overflow-hidden shrink-0">
                            <img src={formData.avatarUrl} className="w-full h-full object-cover rounded-xl sm:rounded-[1.25rem]" alt="" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white truncate">{formData.name || user?.name || 'User'}</h2>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-[8px] sm:text-[10px] mt-1 truncate">{user?.role} @ {user?.collegeName || 'Nexora Network'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-50 px-4 sm:px-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
                    {['profile', 'academics', 'skills', 'security'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 sm:px-6 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Headline</label>
                                <input
                                    className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                    value={formData.headline}
                                    onChange={e => setFormData({ ...formData, headline: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">About You</label>
                                <textarea
                                    className="w-full rounded-2xl bg-slate-50 px-6 py-4 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all min-h-[120px]"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Experience Level</label>
                                    <select
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all appearance-none"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    >
                                        <option value="">Select Level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Goal</label>
                                    <select
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all appearance-none"
                                        value={formData.lookingFor}
                                        onChange={e => setFormData({ ...formData, lookingFor: e.target.value })}
                                    >
                                        <option value="">What are you looking for?</option>
                                        <option value="mentorship">Mentorship</option>
                                        <option value="collaboration">Collaboration</option>
                                        <option value="networking">Networking</option>
                                        <option value="learning">Learning</option>
                                        <option value="teaching">Teaching</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academics' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { label: 'Department', key: 'department', placeholder: 'Computer Science' },
                                { label: 'Degree', key: 'degree', placeholder: 'B.Tech' },
                                { label: 'Batch', key: 'batch', placeholder: '2021-2025' },
                                { label: 'Campus Location', key: 'location', placeholder: 'Chennai' },
                                { label: 'Contact Number', key: 'phone', placeholder: '10-digit Phone' }
                            ].map(field => (
                                <div key={field.key} className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{field.label}</label>
                                    <input
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                        value={formData[field.key]}
                                        onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Expertise & Skills</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag('skills', skillInput)}
                                    />
                                    <button onClick={() => addTag('skills', skillInput)} className="h-14 px-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px]">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map(s => (
                                        <span key={s} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex items-center gap-2 border border-blue-100">
                                            {s} <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter(x => x !== s) })}><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Aim Role / Job Target</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                                        value={interestInput}
                                        onChange={e => setInterestInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag('interests', interestInput)}
                                    />
                                    <button onClick={() => addTag('interests', interestInput)} className="h-14 px-6 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px]">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.interests.map(i => (
                                        <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-100">
                                            {i} <button onClick={() => setFormData({ ...formData, interests: formData.interests.filter(x => x !== i) })}><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 max-w-md">
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4">
                                <Lock className="text-amber-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Security Note</p>
                                    <p className="text-[10px] text-amber-700 font-bold mt-1">Nexora uses 8-digit secure PINs for authentication.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {passwordError && <p className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest">{passwordError}</p>}
                                {passwordSuccess && <p className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest">{passwordSuccess}</p>}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current PIN</label>
                                    <input
                                        type="password"
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all tracking-[0.5em]"
                                        value={passwordData.currentPassword}
                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New 8-Digit PIN</label>
                                    <input
                                        type="password"
                                        maxLength={8}
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all tracking-[0.5em]"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm PIN</label>
                                    <input
                                        type="password"
                                        maxLength={8}
                                        className="w-full h-14 rounded-2xl bg-slate-50 px-6 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all tracking-[0.5em]"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                                <button
                                    onClick={handlePasswordUpdate}
                                    className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-200"
                                >
                                    {passwordSaving ? 'Updating...' : 'Update Security PIN'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button onClick={onClose} className="px-4 py-2 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-[10px]">Cancel</button>
                    {activeTab !== 'security' && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-black rounded-xl sm:rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-2"
                        >
                            {saving ? 'Saving...' : saved ? <><Check size={16} /> Saved</> : 'Sync Profile'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
