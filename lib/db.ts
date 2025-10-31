// lib/db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Use a global variable to cache the connection in serverless environments
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "GoalMania",
      // Connection pool optimization
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      // Performance optimizations
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // Compression
      compressors: ["zlib"],
      // Read preference for better load distribution
      readPreference: "secondaryPreferred",
    }).then((mongoose) => {
      console.log("✅ MongoDB connected with optimized settings");
      // Set default query options for better performance
      mongoose.set("strictQuery", false);
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

// Export both names for backward compatibility
export const connectToDatabase = connectDB;
export default connectDB;
