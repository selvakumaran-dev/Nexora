import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { User } from '../models/index.js'

export function configurePassport() {
    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            done(null, user)
        } catch (error) {
            done(error, null)
        }
    })

    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            scope: ['profile', 'email']
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id })

                if (user) {
                    // Update last seen
                    user.lastSeen = new Date()
                    user.status = 'online'
                    await user.save()
                    return done(null, user)
                }

                // Check if user exists with same email
                user = await User.findOne({ email: profile.emails[0].value })

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id
                    user.avatarUrl = user.avatarUrl || profile.photos[0]?.value
                    user.lastSeen = new Date()
                    user.status = 'online'
                    await user.save()
                    return done(null, user)
                }

                // Create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatarUrl: profile.photos[0]?.value || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.displayName}`,
                    passwordHash: 'GOOGLE_OAUTH_USER_' + Date.now(), // Placeholder, not used for OAuth
                    status: 'online',
                    lastSeen: new Date()
                })

                done(null, newUser)
            } catch (error) {
                console.error('Google OAuth error:', error)
                done(error, null)
            }
        }))

        console.log('✅ Google OAuth configured')
    } else {
        console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)')
    }

    return passport
}

export default passport
