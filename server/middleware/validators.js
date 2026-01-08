import Joi from 'joi'

// User validation schemas
export const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .trim()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .pattern(/^\d{8}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must be exactly an 8-digit PIN',
            'any.required': '8-digit PIN is required'
        }),
    role: Joi.string().valid('student', 'college_admin').default('student'),
    collegeName: Joi.string().trim().max(100).when('role', { is: 'college_admin', then: Joi.required() }),
    collegeCode: Joi.string().trim().max(20).when('role', { is: 'student', then: Joi.required() }),
    address: Joi.string().trim().max(200).allow(''),
    phone: Joi.string().trim().max(20).allow(''),
    department: Joi.string().trim().max(100).allow(''),
    degree: Joi.string().trim().max(100).allow(''),
    batch: Joi.string().trim().max(20).allow(''),
    website: Joi.string().trim().max(200).allow('')
})

export const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
})

export const passwordChangeSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),
    newPassword: Joi.string()
        .pattern(/^\d{8}$/)
        .required()
        .messages({
            'string.pattern.base': 'New PIN must be exactly 8 digits',
            'any.required': 'New PIN is required'
        })
})

export const profileUpdateSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    avatarUrl: Joi.string().uri().allow(''),
    headline: Joi.string().trim().max(120).allow(''),
    bio: Joi.string().trim().max(500).allow(''),
    skills: Joi.array().items(Joi.string().trim().max(50)).max(20),
    interests: Joi.array().items(Joi.string().trim().max(50)).max(20),
    lookingFor: Joi.string().valid('mentorship', 'collaboration', 'networking', 'learning', 'teaching', ''),
    experience: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert', ''),
    location: Joi.string().trim().max(100).allow(''),
    website: Joi.string().trim().max(200).allow(''),
    linkedin: Joi.string().max(200).allow(''),
    github: Joi.string().max(200).allow(''),
    settings: Joi.object({
        notifications: Joi.boolean(),
        theme: Joi.string().valid('light', 'dark', 'system'),
        language: Joi.string().max(10)
    })
})

// Message validation schemas
export const messageSchema = Joi.object({
    content: Joi.string()
        .trim()
        .min(1)
        .max(5000)
        .required()
        .messages({
            'string.min': 'Message cannot be empty',
            'string.max': 'Message cannot exceed 5000 characters',
            'any.required': 'Message content is required'
        }),
    type: Joi.string().valid('text', 'image', 'file', 'code').default('text'),
    attachments: Joi.array().items(Joi.object({
        url: Joi.string().uri().required(),
        type: Joi.string().required(),
        name: Joi.string().max(255)
    })).max(10),
    replyTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
})

// Chat validation schemas
export const groupChatSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': 'Group name is required',
            'string.max': 'Group name cannot exceed 100 characters',
            'any.required': 'Group name is required'
        }),
    description: Joi.string().trim().max(500).allow(''),
    memberIds: Joi.array()
        .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one member is required',
            'any.required': 'Member IDs are required'
        })
})

// Code snippet validation schemas
export const codeSnippetSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title is required',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    code: Joi.string()
        .min(1)
        .max(50000)
        .required()
        .messages({
            'string.min': 'Code is required',
            'string.max': 'Code cannot exceed 50000 characters',
            'any.required': 'Code is required'
        }),
    language: Joi.string()
        .trim()
        .max(50)
        .required()
        .default('javascript'),
    description: Joi.string().trim().max(500).allow(''),
    visibility: Joi.string().valid('private', 'connections', 'public').default('private'),
    sharedWith: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)),
    tags: Joi.array().items(Joi.string().trim().max(30)).max(10)
})

// MongoDB ObjectId validation
export const objectIdSchema = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'Invalid ID format'
    })

// Validation middleware factory
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        })

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }))

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            })
        }

        req.body = value
        next()
    }
}

// Validate params middleware
export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false
        })

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid parameters',
                errors: error.details.map(d => d.message)
            })
        }

        req.params = value
        next()
    }
}

export default {
    registerSchema,
    loginSchema,
    passwordChangeSchema,
    profileUpdateSchema,
    messageSchema,
    groupChatSchema,
    codeSnippetSchema,
    objectIdSchema,
    validate,
    validateParams
}
