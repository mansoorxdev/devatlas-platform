import mongoose from 'mongoose';
import config from '#config/env.config.js';
import logger from '#utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    logger.info(`💾 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB Connection Failure:', error);
    process.exit(1);
  }
};
