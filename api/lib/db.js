
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isVercel = () => !!process.env.VERCEL;

console.log(`🔌 Initializing MongoDB connection...`, {
  environment: NODE_ENV,
  isVercel: isVercel(),
  hasConnectionString: !!MONGODB_URI
});

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('📊 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: isVercel() ? 5 : 10,
      minPoolSize: isVercel() ? 0 : 2,
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
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        cached.promise = null;
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

// Prevent duplicate event listeners
if (!globalThis._mongooseEventsSet) {
  mongoose.connection.on('disconnected', () => {
    console.log('📴 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });

  globalThis._mongooseEventsSet = true;
}