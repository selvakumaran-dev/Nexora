import api from './api'

const landingService = {
    // Get landing page statistics
    getStats: async () => {
        try {
            const response = await api.get('/landing/stats')
            return response.data
        } catch (error) {
            console.error('Failed to fetch landing stats:', error)
            // Return default stats on error
            return {
                success: true,
                data: {
                    totalMembers: 10000,
                    totalInstitutions: 50,
                    totalSkills: 500,
                    totalConnections: 5000,
                    satisfactionRate: 98,
                    usersThisWeek: 1000
                }
            }
        }
    },

    // Get popular skills
    getPopularSkills: async (limit = 10) => {
        try {
            const response = await api.get(`/landing/skills?limit=${limit}`)
            return response.data
        } catch (error) {
            console.error('Failed to fetch skills:', error)
            return {
                success: true,
                data: [
                    { name: 'JavaScript', count: 0 },
                    { name: 'Python', count: 0 },
                    { name: 'React', count: 0 },
                    { name: 'Node.js', count: 0 },
                    { name: 'Machine Learning', count: 0 },
                    { name: 'TypeScript', count: 0 },
                    { name: 'AWS', count: 0 },
                    { name: 'Docker', count: 0 }
                ]
            }
        }
    },

    // Get popular interests
    getPopularInterests: async (limit = 10) => {
        try {
            const response = await api.get(`/landing/interests?limit=${limit}`)
            return response.data
        } catch (error) {
            console.error('Failed to fetch interests:', error)
            return {
                success: true,
                data: [
                    { name: 'Web Development', count: 0 },
                    { name: 'AI & ML', count: 0 },
                    { name: 'Startups', count: 0 },
                    { name: 'Open Source', count: 0 },
                    { name: 'Career Growth', count: 0 },
                    { name: 'Mentorship', count: 0 }
                ]
            }
        }
    },

    // Get testimonials
    getTestimonials: async () => {
        try {
            const response = await api.get('/landing/testimonials')
            return response.data
        } catch (error) {
            console.error('Failed to fetch testimonials:', error)
            return {
                success: true,
                data: [{
                    name: 'Sarah Chen',
                    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah-chen',
                    role: 'Engineering Lead at Tech Company',
                    quote: 'Nexora helped me find a mentor who completely transformed my career.'
                }]
            }
        }
    }
}

export default landingService
