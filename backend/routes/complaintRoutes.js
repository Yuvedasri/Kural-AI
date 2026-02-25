const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');
const { getEmbedding } = require('../services/embeddingService');
const { classifyComplaint } = require('../services/categoryService');

// @route   POST /api/complaints/classify
// @desc    Classify a complaint transcript without saving
// @access  Public or Private (User)
router.post('/classify', async (req, res) => {
    try {
        const { transcriptText, language } = req.body;

        if (!transcriptText) {
            return res.status(400).json({ message: 'Please provide transcript text' });
        }

        // Generate embedding
        const transcriptEmbedding = await getEmbedding(transcriptText);

        // Find best matching category
        const { bestCategory, bestScore: highestSimilarityScore, similarityBreakdown } = classifyComplaint(transcriptEmbedding);

        // Set priority
        let priorityLabel;
        if (highestSimilarityScore > 0.65) {
            priorityLabel = 'High';
        } else if (highestSimilarityScore > 0.40) {
            priorityLabel = 'Medium';
        } else {
            priorityLabel = 'Low';
        }

        res.json({
            category: bestCategory,
            priorityLabel,
            priorityScore: highestSimilarityScore,
            similarityBreakdown
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error classifying complaint' });
    }
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (User only)
router.post('/', protect, async (req, res) => {
    try {
        const { transcriptText, location, language } = req.body;

        // Validate request
        if (!transcriptText || !location) {
            return res.status(400).json({ message: 'Please provide transcript text and location' });
        }

        // Generate embedding for transcript text (Step 1)
        const transcriptEmbedding = await getEmbedding(transcriptText);

        // Find best matching category using the precomputed category embeddings (Step 3, 4, 5)
        // similarityBreakdown provides an Explainable AI (XAI) transparent insight into the model's confidence distribution.
        const { bestCategory, bestScore: highestSimilarityScore, similarityBreakdown } = classifyComplaint(transcriptEmbedding);

        // Set priority based on similarity score (Step 6 & 7)
        // Scores adjusted for local MiniLM model
        let priorityLabel;
        if (highestSimilarityScore > 0.65) {
            priorityLabel = 'High';
        } else if (highestSimilarityScore > 0.40) {
            priorityLabel = 'Medium';
        } else {
            priorityLabel = 'Low';
        }

        // Create initial timeline entry
        const initialTimeline = [{
            message: 'Complaint submitted',
            updatedBy: req.user._id
        }];

        // Create complaint (Step 8)
        const complaint = await Complaint.create({
            userId: req.user._id,
            transcriptText,
            location,
            priorityScore: highestSimilarityScore,
            priorityLabel,
            category: bestCategory,
            language: language || 'en',
            similarityBreakdown,
            timeline: initialTimeline
        });

        res.status(201).json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating complaint' });
    }
});

// @route   GET /api/complaints
// @desc    Get all complaints sorted by priority score descending
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        // Find all complaints and sort by priorityScore (highest first)
        // Populate user and assignedTo details
        const complaints = await Complaint.find()
            .sort({ priorityScore: -1 })
            .populate('userId', 'name phone')
            .populate('assignedTo', 'name');

        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching complaints' });
    }
});

// @route   GET /api/complaints/:id
// @desc    Get details of a single complaint
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'name phone')
            .populate('assignedTo', 'name');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching complaint' });
    }
});

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private/Admin
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, message } = req.body;

        // Validate request
        if (!status) {
            return res.status(400).json({ message: 'Please provide a validation status' });
        }

        // valid statuses: Submitted, InProgress, Completed, Rejected
        const validStatuses = ['Submitted', 'InProgress', 'Completed', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Create timeline message
        const timelineMsg = message || `Status updated to ${status}`;

        // Add timeline entry
        complaint.timeline.push({
            message: timelineMsg,
            updatedBy: req.user._id
        });

        // Update status
        complaint.status = status;

        // Save updated complaint, bypassing validation for unmodified missing fields (like address in old records)
        const updatedComplaint = await complaint.save({ validateModifiedOnly: true });

        res.json(updatedComplaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating complaint' });
    }
});

module.exports = router;
