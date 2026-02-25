// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoutes');
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { initCategoryEmbeddings } = require('./services/categoryService');
const initEscalationJob = require('./cron/escalationJob');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Allow all origins for now in production, can restrict later to a specific frontend domain
app.use(cors({ origin: '*' }));
app.use(express.json()); // Parse incoming JSON requests

// Define Routes
// @route   GET /api/health
// @desc    Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use('/api', testRoutes); // Mount test routes at /api
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/complaints', complaintRoutes); // Mount complaint routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard analytics routes

// Handle undefined routes (404 Error Handler)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start the server and initialize resources for production
const startServer = async () => {
  try {
    // Wait to initialize category embeddings locally in memory
    await initCategoryEmbeddings();

    // Initialize automatic escalation cron job
    initEscalationJob();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to initialization error:', error);
    process.exit(1); // Exit with failure
  }
};

startServer();
