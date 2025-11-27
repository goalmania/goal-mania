#!/usr/bin/env node

/**
 * Script to reset a user's password in the database
 * Usage: node scripts/reset-user-password.mjs <email> <new-password>
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("❌ Error: MONGODB_URI environment variable is not set");
    console.error("Please set MONGODB_URI in your .env.local file");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "GoalMania",
    });
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

// Define User Schema (must match lib/models/User.ts)
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: {
      type: String,
      enum: ["admin", "user", "premium", "journalist"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Create User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

const resetPassword = async () => {
  try {
    // Get email and new password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error("Usage: node scripts/reset-user-password.mjs <email> <new-password>");
      console.error("Example: node scripts/reset-user-password.mjs goalmaniaofficial@gmail.com dimuropaolo7");
      process.exit(1);
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.error("❌ Error: Password must be at least 6 characters long");
      process.exit(1);
    }

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ Error: User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`📧 Found user: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 Role: ${user.role}`);

    // Hash the new password (using salt rounds 10 to match most of the codebase)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`🔐 Password hashed successfully`);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`\nYou can now login with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
};

const main = async () => {
  await connectToDB();
  await resetPassword();
};

main();

