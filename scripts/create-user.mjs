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

const createUser = async () => {
  try {
    // Get user details from command line arguments
    const email = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];
    const role = process.argv[5] || "user"; // Optional role parameter, defaults to "user"

    if (!email || !password || !name) {
      console.error("Usage: node create-user.mjs <email> <password> <name> [role]");
      console.error("Available roles: user, premium, journalist, admin");
      console.error("Example: node create-user.mjs john@example.com password123 'John Doe' premium");
      process.exit(1);
    }

    // Validate role
    const validRoles = ["admin", "user", "premium", "journalist"];
    if (!validRoles.includes(role)) {
      console.error("Invalid role. Available roles:", validRoles.join(", "));
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("User with this email already exists!");
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    console.log(`User created successfully with role: ${role}`);
    console.log({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    });

  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

const main = async () => {
  await connectToDB();
  await createUser();
};

main().catch(console.error);