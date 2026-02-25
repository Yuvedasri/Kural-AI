// Import express
const express = require('express');

// Create a new router instance
const router = express.Router();

// Define a GET route for /test
// This will be mounted on /api in server.js, so the full path is /api/test
router.get('/test', (req, res) => {
    try {
        // Return a JSON response confirming the backend is working
        res.status(200).json({ message: "Backend working successfully" });
    } catch (error) {
        // Handle any potential errors
        res.status(500).json({ message: "Error in test route", error: error.message });
    }
});

// Export the router to be used in server.js
module.exports = router;
