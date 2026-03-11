import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Only load .env file in development (not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  dotenv.config({ path: path.join(__dirname, "../../.env") });
  console.log(`📝 Loading .env file for ${process.env.NODE_ENV || 'development'} mode`);
} else {
  console.log(`☁️ Running on Vercel, using environment variables`);
}

// Export environment variables (prioritize process.env for Vercel)
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const VERCEL_ENV = process.env.VERCEL_ENV || null;
export const VERCEL_REGION = process.env.VERCEL_REGION || null;

// Validate required environment variables (but don't exit in serverless)
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = [];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
    console.error(`❌ Error: ${envVar} is not defined`);
  }
});

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  
  // In serverless, we throw instead of process.exit
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
} else {
  console.log(`✅ Environment loaded: ${NODE_ENV} mode`);
  if (VERCEL_ENV) {
    console.log(`🌍 Vercel: ${VERCEL_ENV} (${VERCEL_REGION || 'unknown region'})`);
  }
}

// Helper function to check if running on Vercel
export const isVercel = () => !!process.env.VERCEL;

// Helper function to get environment info
export const getEnvInfo = () => ({
  nodeEnv: NODE_ENV,
  isVercel: isVercel(),
  vercelEnv: VERCEL_ENV,
  vercelRegion: VERCEL_REGION,
  hasMongoURI: !!MONGODB_URI,
  hasJWTSecret: !!JWT_SECRET
});