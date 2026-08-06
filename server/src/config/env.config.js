import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
const envResult = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (envResult.error) {
  console.warn('⚠️ Warning: .env file not found. Relying on system environment variables.');
}

// Define environment variable schema using Zod
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Run validation
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Environment configuration validation failed:');
  parseResult.error.issues.forEach((issue) => {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config = parseResult.data;
export default config;
