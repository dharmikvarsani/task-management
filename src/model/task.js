import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'medium' },
    status: { type: String, enum: ['In Progress', 'R&D Phase', 'Completed'], default: 'In Progress' },
    assignedDate: { type: Date, required: true },
    targetDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },

    history: [{
        at: { type: Date, default: Date.now },
        action: { type: String, enum: ['created', 'reassigned', 'status_changed', 'updated'], required: true },
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        statusFrom: String,
        statusTo: String,
        note: String
    }],

}, { timestamps: true })

taskSchema.index({ assignee: 1, status: 1, priority: 1, targetDeliveryDate: 1 });


export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)