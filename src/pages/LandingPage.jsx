import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import landingService from '../services/landingService'
import {
    ArrowRight, CheckCircle, Globe, Shield, Zap, Users,
    MessageCircle, BookOpen, Search, Menu, X, Star, Quote, Loader2
} from 'lucide-react'

// Professional Button Component
function Button({ children, variant = 'primary', className = '', ...props }) {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:transform active:scale-[0.98] rounded-lg",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm rounded-lg",
        outline: "bg-transparent text-white border border-white/20 hover:bg-white/10 rounded-lg",
        ghost: "bg-transparent text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg"
    }

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm sm:text-base",
        lg: "px-6 py-3 text-base sm:text-lg"
    }

    const sizeClass = props.size ? sizes[props.size] : sizes.md

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

// Section Header
function SectionHeader({ title, subtitle, centered = true }) {
    return (
        <div className={`mb-12 sm:mb-16 ${centered ? 'text-center max-w-2xl mx-auto' : ''}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                {title}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
                {subtitle}
            </p>
        </div>
    )
}

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [stats, setStats] = useState(null)
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)

        loadLandingData()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const loadLandingData = async () => {
        try {
            const [statsRes, testimonialsRes] = await Promise.all([
                landingService.getStats(),
                landingService.getTestimonials()
            ])
            if (statsRes.success) setStats(statsRes.data)
            if (testimonialsRes.success) setTestimonials(testimonialsRes.data)
        } catch (error) {
            console.error('Failed to load landing data', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navbar */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">
                        {/* Brand */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                N
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">Nexora</span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">How It Works</a>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/login">
                                <Button size="sm">Sign In</Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg px-4 py-4 space-y-4">
                        <a href="#features" className="block text-base font-medium text-slate-600 py-2">Features</a>
                        <a href="#how-it-works" className="block text-base font-medium text-slate-600 py-2">How It Works</a>
                        <hr className="border-slate-100" />
                        <Link to="/login" className="block w-full">
                            <Button className="w-full">Sign In</Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Exclusive for Educational Institutions
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        The Operating System for <br className="hidden sm:block" />
                        <span className="text-blue-600">Campus Connectivity.</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        Nexora unifies your institution's talent, projects, and communications in one secure, exclusive environment. Bridge the gap between students, faculty, and alumni.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto px-8">
                                Student Login
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Social Proof / Stats */}
                    <div className="mt-16 pt-10 border-t border-slate-200 flex flex-wrap items-center justify-center gap-12 sm:gap-24 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        {[
                            { label: 'Institutions Connected', value: stats ? stats.totalInstitutions?.toLocaleString() + '+' : '50+' },
                            { label: 'Active Members', value: stats ? stats.totalMembers?.toLocaleString() + '+' : '10k+' }
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl sm:text-5xl font-bold text-slate-900 mb-2">
                                    {loading ? <div className="h-10 w-24 bg-slate-200 rounded animate-pulse mx-auto"></div> : stat.value}
                                </div>
                                <div className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <SectionHeader
                        title="Designed for Inner-College Ecosystems"
                        subtitle="Everything you need to build a powerful campus network without the noise of the open internet."
                    />

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        {[
                            {
                                icon: Shield,
                                title: 'Verified Campus Only',
                                desc: 'A secure, closed ecosystem. Connect exclusively with peers and faculty from your institution. No outsiders.'
                            },
                            {
                                icon: Users,
                                title: 'Cross-Department Collaboration',
                                desc: 'Break down silos. Find teammates for hackathons or research projects from any department effortlessly.'
                            },
                            {
                                icon: MessageCircle,
                                title: 'Direct Faculty Access',
                                desc: 'Streamlined communication channels for mentorship, doubt clearance, and official announcements.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-700 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <SectionHeader
                        title="Connect in three simple steps"
                        subtitle="We've removed the friction from professional networking."
                    />

                    <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
                        <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-slate-200 -z-10" />

                        {[
                            {
                                step: '01',
                                title: 'Admin Setup',
                                desc: 'College administrator creates a simplified account and receives a unique College Access Code.'
                            },
                            {
                                step: '02',
                                title: 'Student Onboarding',
                                desc: 'Students sign up using the Access Code, instantly linking them to the verification-free secure network.'
                            },
                            {
                                step: '03',
                                title: 'Unified Campus',
                                desc: 'Start collaborating, chatting, and growing within your exclusive college ecosystem immediately.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative bg-white md:bg-transparent p-6 md:p-0 rounded-2xl border md:border-none border-slate-100 shadow-sm md:shadow-none text-center">
                                <div className="w-16 h-16 bg-blue-600 text-white text-xl font-bold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20 z-10 relative">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Call to Action */}
            <section className="py-24 px-4 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight text-white">Ready to accelerate your career?</h2>
                    <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                        Empower your students and faculty with the tools they need to succeed.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/login">
                            <Button className="w-full sm:w-auto px-8 bg-blue-600 text-white hover:bg-blue-500 border-none">
                                Join Your Campus
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">N</div>
                        <span className="font-bold text-slate-900 text-lg">Nexora</span>
                        <span className="text-slate-400 text-sm ml-2">© 2025</span>
                    </div>

                    <div className="flex gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Cookies</a>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                            <Globe size={18} />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
