import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import { connectDB } from '../src/config/db.js';
import logger from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    logger.error('❌ Error: Missing required admin seed environment variables: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD');
    process.exit(1);
  }

  try {
    // Connect to database using mongoose connection utility wrapped inside try/catch
    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Idempotency: check if the configured ADMIN_EMAIL already exists in the database
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      logger.info(`ℹ️ Admin account with email [${normalizedEmail}] already exists. Skipping creation.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create the admin user (pre-save hook in user.model.js handles hashing automatically)
    await User.create({
      name: ADMIN_NAME,
      email: normalizedEmail,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });

    logger.info(`🚀 Admin account [${ADMIN_NAME}] with email [${normalizedEmail}] seeded successfully.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding admin account:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors during fallback shutdown
    }
    process.exit(1);
  }
};

seedAdmin();
