import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    passwordHash: {
        type: String,
        minlength: 6,
        select: false // Don't return password by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values while maintaining uniqueness
    },
    avatarUrl: {
        type: String,
        default: function () {
            return `https://api.dicebear.com/9.x/avataaars/svg?seed=${this.name}`
        }
    },
    // Professional networking fields
    headline: {
        type: String,
        maxlength: 120,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    interests: [{
        type: String,
        trim: true
    }],
    lookingFor: {
        type: String,
        enum: ['mentorship', 'collaboration', 'networking', 'learning', 'teaching', ''],
        default: ''
    },
    experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert', ''],
        default: ''
    },
    location: {
        type: String,
        maxlength: 100,
        default: ''
    },
    website: {
        type: String,
        maxlength: 200,
        default: ''
    },
    address: {
        type: String,
        maxlength: 200,
        default: ''
    },
    phone: {
        type: String,
        maxlength: 20,
        default: ''
    },
    linkedin: {
        type: String,
        maxlength: 200,
        default: ''
    },
    github: {
        type: String,
        maxlength: 200,
        default: ''
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away', 'busy'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['student', 'college_admin', 'admin'],
        default: 'student'
    },
    collegeName: {
        type: String,
        trim: true,
        default: ''
    },
    collegeCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: ''
    },
    department: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    batch: { type: String, trim: true, default: '' },
    settings: {
        notifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        language: { type: String, default: 'en' }
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next()
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
    next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash)
}

// Virtual for public profile
userSchema.virtual('publicProfile').get(function () {
    return {
        _id: this._id,
        name: this.name,
        email: this.email,
        avatarUrl: this.avatarUrl,
        headline: this.headline,
        bio: this.bio,
        skills: this.skills,
        interests: this.interests,
        lookingFor: this.lookingFor,
        experience: this.experience,
        location: this.location,
        website: this.website,
        linkedin: this.linkedin,
        github: this.github,
        status: this.status,
        lastSeen: this.lastSeen,
        role: this.role,
        collegeName: this.collegeName,
        collegeCode: this.collegeCode,
        address: this.address,
        phone: this.phone,
        profileCompleted: this.profileCompleted,
        profileCompletion: this.profileCompletion, // Include the calculated percentage
        department: this.department,
        degree: this.degree,
        batch: this.batch,
        createdAt: this.createdAt
    }
})

// Calculate profile completion percentage
userSchema.virtual('profileCompletion').get(function () {
    const coreFields = [
        'name', 'headline', 'bio', 'skills', 'interests',
        'lookingFor', 'experience', 'location', 'phone',
        'department', 'degree', 'batch'
    ]

    let completed = 0
    coreFields.forEach(field => {
        const value = this[field]
        if (Array.isArray(value)) {
            if (value.length > 0) completed++
        } else if (value && value !== '') {
            completed++
        }
    })

    return Math.round((completed / coreFields.length) * 100)
})

// Index for skill/interest matching
userSchema.index({ skills: 1 })
userSchema.index({ interests: 1 })

const User = mongoose.model('User', userSchema)
export default User
