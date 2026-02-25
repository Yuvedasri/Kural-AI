const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard overview stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        // Run aggregations to get counts
        const priorityCounts = await Complaint.aggregate([
            { $group: { _id: "$priorityLabel", count: { $sum: 1 } } }
        ]);

        const statusCounts = await Complaint.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Calculate average resolution time for completed complaints
        const resolutionTimeStats = await Complaint.aggregate([
            { $match: { status: "Completed" } },
            {
                $project: {
                    resolutionTimeMs: { $subtract: ["$updatedAt", "$createdAt"] }
                }
            },
            {
                $group: {
                    _id: null,
                    averageTimeMs: { $avg: "$resolutionTimeMs" }
                }
            }
        ]);

        // Helper to extract specific metric count
        const getCount = (aggregations, key) => {
            const item = aggregations.find(a => a._id === key);
            return item ? item.count : 0;
        };

        const totalComplaints = await Complaint.countDocuments();

        let averageResolutionTimeHours = 0;
        if (resolutionTimeStats.length > 0) {
            // Convert milliseconds to hours
            averageResolutionTimeHours = resolutionTimeStats[0].averageTimeMs / (1000 * 60 * 60);
        }

        res.json({
            totalComplaints,
            highPriority: getCount(priorityCounts, 'High'),
            mediumPriority: getCount(priorityCounts, 'Medium'),
            lowPriority: getCount(priorityCounts, 'Low'),
            submitted: getCount(statusCounts, 'Submitted'),
            inProgress: getCount(statusCounts, 'InProgress'),
            completed: getCount(statusCounts, 'Completed'),
            rejected: getCount(statusCounts, 'Rejected'),
            escalated: getCount(statusCounts, 'Escalated'),
            averageResolutionTimeHours: parseFloat(averageResolutionTimeHours.toFixed(2))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @route   GET /api/dashboard/priority-distribution
// @desc    Get breakdown of complaints by priority
// @access  Private/Admin
router.get('/priority-distribution', protect, admin, async (req, res) => {
    try {
        const priorityCounts = await Complaint.aggregate([
            { $group: { _id: "$priorityLabel", count: { $sum: 1 } } }
        ]);

        // Initialize default breakdown
        const distribution = {
            High: 0,
            Medium: 0,
            Low: 0
        };

        // Populate object with aggregation results
        priorityCounts.forEach(item => {
            if (distribution[item._id] !== undefined) {
                distribution[item._id] = item.count;
            }
        });

        res.json(distribution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching priority distribution' });
    }
});

// @route   GET /api/dashboard/category-distribution
// @desc    Get breakdown of complaints by assigned category
// @access  Private/Admin
router.get('/category-distribution', protect, admin, async (req, res) => {
    try {
        const categoryCounts = await Complaint.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Initialize default breakdown
        const distribution = {
            Healthcare: 0,
            Education: 0,
            Water: 0,
            Electricity: 0,
            Roads: 0,
            Sanitation: 0,
            General: 0
        };

        // Populate object with aggregation results
        categoryCounts.forEach(item => {
            if (distribution[item._id] !== undefined) {
                distribution[item._id] = item.count;
            } else if (item._id) {
                // Catch any dynamically generated categories not listed
                distribution[item._id] = item.count;
            }
        });

        res.json(distribution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching category distribution' });
    }
});

// @route   GET /api/dashboard/aging
// @desc    Get unresolved complaints older than 48 hours
// @access  Private/Admin
router.get('/aging', protect, admin, async (req, res) => {
    try {
        const hoursThreshold = 48;
        const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

        // Find complaints created before cutoff date that are still pending
        const agingComplaints = await Complaint.find({
            status: { $in: ['Submitted', 'InProgress'] },
            createdAt: { $lt: cutoffDate }
        }).select('category priorityLabel createdAt status transcriptText location'); // select only needed fields

        // Format the output by dynamically calculating pending hours
        const formattedComplaints = agingComplaints.map(complaint => {
            const timeDiffMs = Date.now() - new Date(complaint.createdAt).getTime();
            const hoursPending = Math.floor(timeDiffMs / (1000 * 60 * 60));

            return {
                _id: complaint._id,
                category: complaint.category,
                priorityLabel: complaint.priorityLabel,
                createdAt: complaint.createdAt,
                hoursPending
            };
        });

        // Sort descending by pending hours (oldest first)
        formattedComplaints.sort((a, b) => b.hoursPending - a.hoursPending);

        res.json(formattedComplaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching aging complaints' });
    }
});

module.exports = router;
