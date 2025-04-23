const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected");
        logger.info(`Mongo URI: ${process.env.MONGO_URI}`);
    } catch (err) {
        logger.error(`Database connection error: ${err.message}`);
        console.error("Error connecting to MongoDB", err);
        process.exit(1);
    }
};

module.exports = connectDB;
