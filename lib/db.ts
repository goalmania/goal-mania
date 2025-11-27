// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Use a global variable to cache the connection in serverless environments
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, lastError: null };
}

// Check if connection is ready
const isConnected = () => {
  return cached.conn && mongoose.connection.readyState === 1;
};

// Retry connection with exponential backoff
const connectWithRetry = async (retries = 3, delay = 1000): Promise<typeof mongoose> => {
  for (let i = 0; i < retries; i++) {
    try {
      const mongooseInstance = await mongoose.connect(MONGODB_URI, {
        dbName: "GoalMania",
        // Connection pool optimization
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 10000, // Increased to 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        connectTimeoutMS: 10000, // 10 seconds to establish connection
        bufferCommands: false, // Disable mongoose buffering
        // Performance optimizations
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        // Compression
        compressors: ["zlib"],
        // Read preference: use primary for consistency (critical for auth)
        readPreference: "primary",
        // Retry configuration
        retryWrites: true,
        retryReads: true,
      });
      
      console.log("✅ MongoDB connected with optimized settings");
      // Set default query options for better performance
      mongooseInstance.set("strictQuery", false);
      
      // Set up connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        cached.lastError = err;
        cached.conn = null;
        cached.promise = null;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        cached.lastError = null;
      });
      
      return mongooseInstance;
    } catch (error: any) {
      const isLastAttempt = i === retries - 1;
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, {
          code: error.code,
          message: error.message,
          hostname: error.hostname || 'unknown',
        });
        
        if (isLastAttempt) {
          cached.lastError = error;
          throw new Error(
            `Failed to connect to MongoDB after ${retries} attempts. ` +
            `Please check: 1) MongoDB URI is correct, 2) Network connectivity, 3) MongoDB Atlas cluster is not paused, 4) IP whitelist includes your IP. ` +
            `Error: ${error.message}`
          );
        }
        
        // Exponential backoff: wait longer between retries
        const waitTime = delay * Math.pow(2, i);
        console.log(`⏳ Retrying MongoDB connection in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // For other errors, don't retry
        cached.lastError = error;
        throw error;
      }
    }
  }
  
  throw new Error('MongoDB connection failed after all retries');
};

const connectDB = async () => {
  // If already connected, return cached connection
  if (isConnected()) {
    return cached.conn;
  }

  // If there's a pending connection attempt, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      // If previous attempt failed, clear it and try again
      cached.promise = null;
    }
  }

  // Start new connection attempt
  cached.promise = connectWithRetry();
  try {
    cached.conn = await cached.promise;
    cached.lastError = null;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

// Export both names for backward compatibility
export const connectToDatabase = connectDB;
export default connectDB;
