import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import landingService from '../services/landingService'
import {
    ArrowRight, Users, Sparkles, Target, BookOpen, MessageCircle,
    Lightbulb, Handshake, Globe, CheckCircle, Star, Zap, Brain,
    GraduationCap, Rocket, Heart, Search, Play, Shield, Clock,
    TrendingUp, Award, ChevronRight, Menu, X
} from 'lucide-react'

// Animated gradient button component
function GradientButton({ children, className = '', variant = 'primary', ...props }) {
    const baseStyles = "relative overflow-hidden group font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"

    if (variant === 'primary') {
        return (
            <button className={`${baseStyles} px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 ${className}`} {...props}>
                <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative flex items-center justify-center gap-2">{children}</span>
            </button>
        )
    }

    return (
        <button className={`${baseStyles} px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl sm:rounded-2xl hover:bg-white/20 ${className}`} {...props}>
            {children}
        </button>
    )
}

// Floating animated shapes
function FloatingShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 sm:top-20 left-[5%] sm:left-[10%] w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-20 sm:top-40 right-[5%] sm:right-[15%] w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 sm:bottom-20 left-[10%] sm:left-[20%] w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]"></div>
        </div>
    )
}

// Animated stats counter
function AnimatedCounter({ value, suffix = '', loading = false }) {
    const [count, setCount] = useState(0)
    const numValue = parseInt(String(value).replace(/\D/g, '')) || 0

    useEffect(() => {
        if (loading || numValue === 0) return

        const duration = 2000
        const steps = 60
        const increment = numValue / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= numValue) {
                setCount(numValue)
                clearInterval(timer)
            } else {
                setCount(Math.floor(current))
            }
        }, duration / steps)

        return () => clearInterval(timer)
    }, [numValue, loading])

    if (loading) {
        return <span className="inline-block w-16 h-8 bg-white/10 rounded animate-pulse"></span>
    }

    return <span>{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [stats, setStats] = useState(null)
    const [skills, setSkills] = useState([])
    const [_interests, setInterests] = useState([]) // Fetched for future use
    const [testimonials, setTestimonials] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsRes, skillsRes, interestsRes, testimonialsRes] = await Promise.all([
                    landingService.getStats(),
                    landingService.getPopularSkills(10),
                    landingService.getPopularInterests(8),
                    landingService.getTestimonials()
                ])

                if (statsRes.success) setStats(statsRes.data)
                if (skillsRes.success) setSkills(skillsRes.data)
                if (interestsRes.success) setInterests(interestsRes.data) // Store for future use
                if (testimonialsRes.success) setTestimonials(testimonialsRes.data)
            } catch (error) {
                console.error('Failed to fetch landing data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-sm sm:text-base group-hover:scale-110 transition-transform">N</div>
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Nexora</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
                            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                        </div>

                        {/* Desktop CTA */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                                Sign In
                            </Link>
                            <Link to="/login">
                                <GradientButton>
                                    Get Started <ArrowRight size={18} />
                                </GradientButton>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-white/10">
                            <div className="flex flex-col gap-4">
                                <a href="#features" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
                                <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
                                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
                                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                                    <Link to="/login" className="text-center py-2 text-gray-300 hover:text-white transition-colors font-medium">
                                        Sign In
                                    </Link>
                                    <Link to="/login">
                                        <GradientButton className="w-full">
                                            Get Started <ArrowRight size={18} />
                                        </GradientButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-0">
                <FloatingShapes />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-6 sm:mb-8">
                            <Sparkles size={14} className="sm:w-4 sm:h-4 text-violet-400" />
                            <span className="text-xs sm:text-sm font-medium text-gray-300">Connecting Minds, Building Futures</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                            Find Your Perfect
                            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 animate-gradient">
                                Learning Partner
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
                            Connect with people who share your skills and interests. Learn together, grow together, and build meaningful relationships that last.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16 px-4">
                            <Link to="/login">
                                <GradientButton>
                                    Start Connecting <ArrowRight size={20} />
                                </GradientButton>
                            </Link>
                            <GradientButton variant="secondary">
                                <Play size={20} /> Watch Demo
                            </GradientButton>
                        </div>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 sm:mb-16 px-4">
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 w-20 sm:w-24 h-8 sm:h-9 bg-white/5 rounded-full animate-pulse"></span>
                                ))
                            ) : (
                                skills.slice(0, 6).map((skill, i) => (
                                    <span
                                        key={skill.name}
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-gray-300 border border-white/10 hover:border-violet-500/50 hover:text-violet-300 transition-all cursor-pointer hover:scale-105"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        {skill.name}
                                        {skill.count > 0 && (
                                            <span className="ml-2 text-xs text-violet-400">({skill.count})</span>
                                        )}
                                    </span>
                                ))
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
                            {[
                                { key: 'totalMembers', suffix: '+', label: 'Active Members', icon: Users, color: 'from-violet-500 to-purple-500' },
                                { key: 'totalSkills', suffix: '+', label: 'Skills Shared', icon: Brain, color: 'from-cyan-500 to-blue-500' },
                                { key: 'totalConnections', suffix: '+', label: 'Connections Made', icon: Handshake, color: 'from-fuchsia-500 to-pink-500' },
                                { key: 'satisfactionRate', suffix: '%', label: 'Satisfaction', icon: Heart, color: 'from-orange-500 to-red-500' }
                            ].map((stat, i) => (
                                <div key={i} className="group relative p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:bg-white/10">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={18} className="sm:w-[22px] sm:h-[22px] text-white" />
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                        <AnimatedCounter
                                            value={stats?.[stat.key] || 0}
                                            suffix={stat.suffix}
                                            loading={loading}
                                        />
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
                        <span className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4">
                            How It Works
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                            Three Steps to Your
                            <span className="block sm:inline sm:ml-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Dream Network</span>
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg">Join thousands who are already learning and growing together</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
                        <div className="hidden md:block absolute top-32 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

                        {[
                            {
                                step: '01',
                                icon: Target,
                                title: 'Define Your Profile',
                                desc: 'Share your skills, interests, and aspirations. Build a profile that showcases what makes you unique.',
                                gradient: 'from-violet-600 to-indigo-600'
                            },
                            {
                                step: '02',
                                icon: Sparkles,
                                title: 'Smart Match',
                                desc: 'Our intelligent matching system finds professionals who share your skills and complement your goals.',
                                gradient: 'from-fuchsia-600 to-pink-600'
                            },
                            {
                                step: '03',
                                icon: MessageCircle,
                                title: 'Connect & Collaborate',
                                desc: 'Start real-time conversations, share knowledge, and build meaningful professional relationships.',
                                gradient: 'from-cyan-600 to-blue-600'
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -inset-px bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                                <div className="relative bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-white/20 transition-all h-full">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center shadow-lg`}>
                                            <item.icon size={22} className="sm:w-7 sm:h-7 text-white" />
                                        </div>
                                        <span className="text-5xl sm:text-6xl font-bold text-white/5 group-hover:text-white/10 transition-colors">{item.step}</span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{item.title}</h3>
                                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-16 sm:py-24 md:py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
                        <span className="inline-block px-4 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-fuchsia-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4">
                            Features
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                            Everything You Need to
                            <span className="block sm:inline sm:ml-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400">Succeed</span>
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg">Powerful tools designed for modern networking and collaboration</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: Search, title: 'Smart Discovery', desc: 'Find people who match your skills and interests with our intelligent matching algorithm', color: 'violet' },
                            { icon: MessageCircle, title: 'Real-time Chat', desc: 'Connect instantly with built-in messaging and video calls', color: 'fuchsia' },
                            { icon: BookOpen, title: 'Knowledge Sharing', desc: 'Share code snippets, resources, and learn from each other', color: 'cyan' },
                            { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and you control who sees your profile', color: 'green' },
                            { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor your learning journey and celebrate milestones', color: 'orange' },
                            { icon: Globe, title: 'Global Network', desc: 'Connect with professionals from around the world', color: 'blue' }
                        ].map((feature, i) => (
                            <div key={i} className="group relative">
                                <div className={`absolute -inset-px bg-gradient-to-r from-${feature.color}-500/0 via-${feature.color}-500/50 to-${feature.color}-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm`}></div>
                                <div className="relative bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all h-full">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <feature.icon size={22} className="sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{feature.title}</h3>
                                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-fuchsia-950/10 to-slate-950"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
                        <span className="inline-block px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-4">
                            Testimonials
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                            Loved by
                            <span className="block sm:inline sm:ml-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Thousands</span>
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg">See what our community members have to say</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 animate-pulse">
                                    <div className="flex gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-white/5 rounded"></div>
                                        <div className="h-3 bg-white/5 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))
                        ) : testimonials.length > 0 ? (
                            testimonials.map((testimonial, i) => (
                                <div key={i} className="group relative">
                                    <div className="absolute -inset-px bg-gradient-to-r from-pink-500/0 via-pink-500/50 to-pink-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                                    <div className="relative bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all h-full">
                                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                            <img
                                                src={testimonial.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${testimonial.name}`}
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
                                                alt=""
                                            />
                                            <div>
                                                <h4 className="font-bold text-white text-sm sm:text-base">{testimonial.name}</h4>
                                                <p className="text-xs sm:text-sm text-gray-400">{testimonial.role || 'Member'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 mb-3 sm:mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className="sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{testimonial.quote || testimonial.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                No testimonials available yet
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
                <FloatingShapes />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                        Ready to Start Your
                        <span className="block sm:inline sm:ml-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Learning Journey?</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
                        Join thousands of professionals who are already connecting, learning, and growing together
                    </p>
                    <Link to="/login">
                        <GradientButton>
                            Get Started for Free <ArrowRight size={20} />
                        </GradientButton>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
                        <div className="sm:col-span-2">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-white text-sm sm:text-base">N</div>
                                <span className="text-xl sm:text-2xl font-bold">Nexora</span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-md">
                                Connect with people who share your interests and skills. Learn together, grow together, and build meaningful relationships that last.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Product</h4>
                            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                                <li><a href="#features" className="hover:text-violet-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-violet-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-violet-400 transition-colors">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3 sm:mb-4 text-white text-sm sm:text-base">Company</h4>
                            <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                                <li><a href="#" className="hover:text-violet-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-violet-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-violet-400 transition-colors">Careers</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-xs sm:text-sm">© 2025 Nexora. All rights reserved.</p>
                        <div className="flex gap-4 sm:gap-6 text-gray-500 text-xs sm:text-sm">
                            <a href="#" className="hover:text-violet-400 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-violet-400 transition-colors">Terms</a>
                            <a href="https://www.linkedin.com/in/selva-kumaran-a6529a321/" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Support</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
