// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Define connection function
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from .env
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // Log successful connection
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log error and exit process with failure (1 indicates error)
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Export the connection function
module.exports = connectDB;
