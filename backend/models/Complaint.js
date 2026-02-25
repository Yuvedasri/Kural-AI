const mongoose = require('mongoose');

// Define the Complaint Schema
const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    transcriptText: {
        type: String,
        required: [true, 'Please add a transcript text']
    },
    language: {
        type: String,
        enum: ['en', 'ta', 'hi'],
        default: 'en'
    },
    category: {
        type: String,
        default: 'General'
    },
    priorityScore: {
        type: Number,
        default: 0.2 // Default to Low
    },
    priorityLabel: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    },
    similarityBreakdown: {
        type: Map,
        of: Number
    },
    status: {
        type: String,
        enum: ['Submitted', 'InProgress', 'Completed', 'Rejected', 'Escalated'],
        default: 'Submitted'
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String, required: [true, 'Please provide an address'] }
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eta: {
        type: Date
    },
    timeline: [
        {
            message: {
                type: String,
                required: true
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the model
const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
