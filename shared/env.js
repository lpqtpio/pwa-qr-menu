import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if running on Vercel
const runningOnVercel = !!process.env.VERCEL;

// Load .env only for local development
if (!runningOnVercel) {
  dotenv.config({ path: path.join(__dirname, "../.env") });
  console.log(`📝 Loading local .env file (${process.env.NODE_ENV || "development"})`);
} else {
  console.log(`☁️ Running on Vercel, using platform environment variables`);
}

// Export environment variables
export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const VERCEL_ENV = process.env.VERCEL_ENV || null;
export const VERCEL_REGION = process.env.VERCEL_REGION || null;

// Validate required variables
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = [];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);

  if (NODE_ENV === "production") {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  }
} else {
  console.log(`✅ Environment loaded: ${NODE_ENV} mode`);

  if (VERCEL_ENV) {
    console.log(`🌍 Vercel: ${VERCEL_ENV} (${VERCEL_REGION || "unknown region"})`);
  }
}

// Helpers
export const isVercel = () => runningOnVercel;

export const getEnvInfo = () => ({
  nodeEnv: NODE_ENV,
  isVercel: runningOnVercel,
  vercelEnv: VERCEL_ENV,
  vercelRegion: VERCEL_REGION,
  hasMongoURI: !!MONGODB_URI,
  hasJWTSecret: !!JWT_SECRET
});