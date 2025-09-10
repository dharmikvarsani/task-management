import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, },
    password: { type: String, required: true },
    role: { type: String, enum: ['manager', 'tl', 'developer'], default: 'developer', required: true },
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

UserSchema.index({ role: 1 })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)