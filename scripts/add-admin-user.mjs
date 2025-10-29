#!/usr/bin/env node
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectToDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "user", "premium", "journalist"],
    default: "user",
  },
}, { timestamps: true });

// Create User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

const createAdminUser = async () => {
  try {
    // Get email and password from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4] || "Admin User";

    if (!email || !password) {
      console.error("Usage: node add-admin-user.mjs <email> <password> [name]");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists. Updating to admin role...");
      existingUser.role = "admin";
      await existingUser.save();
      console.log("User updated to admin successfully!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("Admin user created successfully!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

const main = async () => {
  await connectToDB();
  await createAdminUser();
};

main().catch(console.error);