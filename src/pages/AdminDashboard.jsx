import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import {
    Building2, Users, Copy, CheckCircle, TrendingUp,
    Shield, Search, Mail, Phone, MapPin, Globe,
    ArrowRight, UserCheck, Calendar, X, Trash2, Info, ExternalLink
} from 'lucide-react'

// Premium Stat Card
function StatCard({ title, value, icon: Icon, colorClass, trend }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
                    <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <TrendingUp size={12} className="mr-1" />
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
                <p className="text-sm font-medium text-slate-500">{title}</p>
            </div>
        </div>
    )
}

// Student Details Modal
// Student Details Modal
function StudentDetailsModal({ student, onClose, onDelete }) {
    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-none sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="relative h-24 sm:h-32 bg-slate-900 overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#3b82f6,transparent)]"></div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>
                    <button onClick={onClose} className="sm:hidden absolute top-4 left-4 p-2 bg-white/10 rounded-xl text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest z-20">
                        Back
                    </button>
                </div>

                <div className="px-6 sm:px-10 pb-8 relative flex-1 overflow-y-auto pt-16 sm:pt-20">
                    <div className="absolute -top-10 sm:-top-12 left-10 z-10">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white p-1 shadow-xl border border-slate-100">
                            <img
                                src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name}&background=random`}
                                className="w-full h-full rounded-xl sm:rounded-2xl object-cover bg-slate-100"
                                alt=""
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="min-w-0 pr-4">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                                {student.name || 'Anonymous User'}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm sm:text-base mt-1 truncate">{student.email}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove ${student.name}?`)) {
                                        onDelete(student._id);
                                        onClose();
                                    }
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Academic Info</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Building2 size={16} /></div>
                                        <span className="text-sm font-bold">{student.department || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Calendar size={16} /></div>
                                        <span className="text-sm font-bold">Batch: {student.batch || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><MapPin size={16} /></div>
                                    <span className="text-sm font-bold">{student.location || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Details</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                                        <span className="text-sm font-bold">{student.phone || 'No phone provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                                        <span className="text-sm font-bold truncate">{student.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${student.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                    <span className="text-sm font-bold capitalize">{student.status || 'Offline'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Headline</label>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    {student.headline || 'No headline available.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 sm:hidden shrink-0">
                    <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm active:scale-95 transition-all">
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

// Institution Edit Modal
function InstitutionEditModal({ isOpen, onClose, user, updateProfile }) {
    const [formData, setFormData] = React.useState({
        collegeName: user?.collegeName || '',
        website: user?.website || '',
        phone: user?.phone || '',
        address: user?.address || ''
    })
    const [saving, setSaving] = React.useState(false)

    React.useEffect(() => {
        if (isOpen && user) {
            setFormData({
                collegeName: user.collegeName || '',
                website: user.website || '',
                phone: user.phone || '',
                address: user.address || ''
            })
        }
    }, [isOpen, user])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await updateProfile(formData)
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-none sm:rounded-[2.5rem] shadow-2xl w-full max-w-xl h-full sm:h-auto overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-900 p-6 sm:p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Edit Institution</h2>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional Profile Management</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">College Name</label>
                        <input
                            required
                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                            value={formData.collegeName}
                            onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Website URL</label>
                        <input
                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                            placeholder="e.g. www.university.edu"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <input
                            className="w-full h-14 rounded-2xl bg-slate-50 px-5 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-2xl bg-slate-50 p-5 font-bold text-slate-900 border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all resize-none"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { user, logout, updateProfile } = useAuth()
    const [students, setStudents] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showInstitutionModal, setShowInstitutionModal] = useState(false)
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeToday: 0,
        newThisWeek: 0
    })
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedStudent, setSelectedStudent] = useState(null)

    useEffect(() => {
        loadAdminData()
    }, [])

    const loadAdminData = async () => {
        try {
            const response = await userService.getUsers({ limit: 100 })

            if (response.success) {
                const allUsers = response.data
                const studentList = allUsers.filter(u => u._id !== user._id)

                setStudents(studentList)
                setStats({
                    totalStudents: studentList.length,
                    activeToday: studentList.filter(u => u.status === 'online').length,
                    newThisWeek: studentList.filter(u => {
                        const d = new Date(u.createdAt)
                        const now = new Date()
                        return (now - d) < 7 * 24 * 60 * 60 * 1000
                    }).length
                })
            }
        } catch (error) {
            console.error('Failed to load admin data', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            const res = await userService.deleteUser(userId);
            if (res.success) {
                setStudents(prev => prev.filter(s => s._id !== userId));
                setStats(prev => ({ ...prev, totalStudents: prev.totalStudents - 1 }));
            }
        } catch (err) {
            alert('Failed to delete user');
        }
    }

    const copyCode = () => {
        if (user?.collegeCode) {
            navigator.clipboard.writeText(user.collegeCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide">
                                Admin Console
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{user.collegeName}</h1>
                        <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                            <Shield size={16} className="text-blue-600 shrink-0" />
                            <span className="text-sm">verified institution dashboard</span>
                            {user.website && <span className="text-slate-300 hidden sm:inline">|</span>}
                            {user.website && <span className="text-xs text-slate-400 truncate max-w-[200px]">{user.website}</span>}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        {/* Access Code Card */}
                        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 pr-4">
                            <div className="bg-slate-900 text-white px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[100px]">
                                <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">Code</span>
                                <span className="text-xl font-mono font-bold tracking-widest">{user.collegeCode || '----'}</span>
                            </div>
                            <div className="flex-1 px-2">
                                <p className="text-xs text-slate-500 font-medium">Student Access Code</p>
                                <p className="text-xs text-slate-400">Share to invite</p>
                            </div>
                            <button
                                onClick={copyCode}
                                className="p-2.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors shrink-0"
                            >
                                {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                        </div>

                        <button
                            onClick={logout}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>



                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        icon={Users}
                        colorClass="bg-blue-600"
                        trend="+12% this month"
                    />
                    <StatCard
                        title="Active Today"
                        value={stats.activeToday}
                        icon={UserCheck}
                        colorClass="bg-green-600"
                    />
                    <StatCard
                        title="New Registrations"
                        value={stats.newThisWeek}
                        icon={Calendar}
                        colorClass="bg-purple-600"
                        trend="Just updated"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Student List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="font-bold text-slate-900 text-lg">Registered Students</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email..."
                                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full sm:w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden">
                                <div className="hidden sm:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading student data...</td>
                                                </tr>
                                            ) : filteredStudents.length > 0 ? (
                                                filteredStudents.map((student) => (
                                                    <tr key={student._id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                                    {student.avatarUrl ? (
                                                                        <img className="h-10 w-10 rounded-full object-cover" src={student.avatarUrl} alt="" />
                                                                    ) : (
                                                                        student.name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-semibold text-slate-900">{student.name}</div>
                                                                    <div className="text-[10px] text-slate-400 font-bold">{student.email}</div>
                                                                    {student.phone && <div className="text-[10px] text-blue-500 font-black mt-0.5">{student.phone}</div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${student.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {student.status || 'Offline'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                            {new Date(student.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => setSelectedStudent(student)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="View Details"
                                                                >
                                                                    <Info size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm(`Delete ${student.name}?`)) handleDeleteUser(student._id);
                                                                    }}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No students found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List View */}
                                <div className="block sm:hidden divide-y divide-slate-100">
                                    {loading ? (
                                        <div className="p-8 text-center text-slate-500">Loading...</div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <div key={student._id} className="p-4 active:bg-slate-50 transition-colors" onClick={() => setSelectedStudent(student)}>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
                                                            {student.avatarUrl ? (
                                                                <img className="h-10 w-10 rounded-full object-cover" src={student.avatarUrl} alt="" />
                                                            ) : (
                                                                student.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-bold text-slate-900 truncate">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-medium truncate">{student.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${student.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {student.status || 'Offline'}
                                                        </span>
                                                        <Info size={16} className="text-blue-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">No students found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Institution Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" />
                                Institution Profile
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Website</label>
                                    <div className="flex items-center gap-2 text-slate-700 group">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Globe size={16} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <a
                                                href={user.website && (user.website.startsWith('http') ? user.website : `https://${user.website}`)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-bold truncate hover:text-blue-600 transition-colors decoration-blue-200 underline-offset-4"
                                            >
                                                {user.website || 'No website added'}
                                            </a>
                                            {user.website && <span className="text-[10px] text-slate-400 font-medium">Click to visit institutional site</span>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Contact Phone</label>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Phone size={16} />
                                        </div>
                                        <span className="text-sm font-bold">{user.phone || 'No phone added'}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Address</label>
                                    <div className="flex items-start gap-2 text-slate-700">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="text-sm font-bold leading-relaxed">{user.address || 'No address added'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button
                                    onClick={() => setShowInstitutionModal(true)}
                                    className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-blue-600 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95"
                                >
                                    Edit Institution Details
                                </button>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                            <h4 className="font-black text-sm uppercase tracking-widest mb-3">Admin Tip</h4>
                            <p className="text-xs text-blue-100 leading-relaxed font-medium">
                                Use the search bar to quickly find students by department or name. You can remove inactive users to keep your directory clean.
                            </p>
                        </div>
                    </div>
                </div>
            </main >

            < StudentDetailsModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)
                }
                onDelete={handleDeleteUser}
            />

            <InstitutionEditModal
                isOpen={showInstitutionModal}
                onClose={() => setShowInstitutionModal(false)}
                user={user}
                updateProfile={updateProfile}
            />
        </div >
    )
}
