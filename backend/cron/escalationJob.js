const cron = require('node-cron');
const Complaint = require('../models/Complaint');

// Initialize the escalation job
const initEscalationJob = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running automatic escalation job...');

            // Find complaints older than 48 hours that are Submitted or InProgress
            const hoursThreshold = 48;
            const cutoffDate = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

            const agingComplaints = await Complaint.find({
                status: { $in: ['Submitted', 'InProgress'] },
                createdAt: { $lt: cutoffDate }
            });

            if (agingComplaints.length === 0) {
                return; // Nothing to escalate
            }

            let escalatedCount = 0;

            for (const complaint of agingComplaints) {
                // Update status
                complaint.status = 'Escalated';

                // Add timeline entry
                complaint.timeline.push({
                    message: 'Complaint automatically escalated due to 48+ hours delay.',
                    createdAt: new Date()
                    // updatedBy is intentionally omitted; implies a System-level action
                });

                await complaint.save();
                escalatedCount++;
            }

            console.log(`Successfully escalated ${escalatedCount} complaints.`);
        } catch (error) {
            console.error('Error in escalation job:', error);
        }
    });

    console.log('Escalation job initialized (Production Ready)');
};

module.exports = initEscalationJob;
