import mongoose from 'mongoose';
import { MONGODB_URI, NODE_ENV, isVercel  } from '../api/lib/config.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
const isVercel = () => !!process.env.VERCEL;

// Log connection info (but hide sensitive data)
console.log(`🔌 Initializing MongoDB connection...`, {
  environment: NODE_ENV,
  isVercel: isVercel(),
  hasConnectionString: !!MONGODB_URI
});

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
     console.log('📊 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!MONGODB_URI) {
    const error = new Error('MONGODB_URI is not defined');
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
       bufferMaxEntries: 0,
      maxPoolSize: isVercel() ? 5 : 10, // Smaller pool for serverless
      minPoolSize: isVercel() ? 0 : 2,   // No min pool for serverless
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 20000,
      retryWrites: true,
      retryReads: true,
      family: 4 
    };

    console.log(`🔄 Connecting to MongoDB... (${NODE_ENV} mode)`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`📦 Host: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', {
           message: error.message,
          code: error.code,
          name: error.name
        });
        cached.promise = null; // Reset promise on error
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Optional: Add connection event listeners
mongoose.connection.on('disconnected', () => {
  console.log('📴 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});