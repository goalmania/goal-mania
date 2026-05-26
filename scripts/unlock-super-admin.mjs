#!/usr/bin/env node
/**
 * Unlock / elevate goalmaniaofficial@gmail.com to admin role.
 * Usage: node scripts/unlock-super-admin.mjs
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const ADMIN_EMAIL = "goalmaniaofficial@gmail.com";
const ADMIN_NAME  = "Goal Mania Admin";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String },
    email:    { type: String, unique: true, lowercase: true },
    username: { type: String, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "user", "premium", "journalist"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  MONGODB_URI not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅  Connected to MongoDB");

  let user = await User.findOne({ email: ADMIN_EMAIL });

  if (user) {
    const wasAdmin = user.role === "admin";
    user.role = "admin";
    await user.save();
    console.log(`✅  User found (${ADMIN_EMAIL})`);
    console.log(`   Role: ${wasAdmin ? "already admin" : "updated to admin"}`);
  } else {
    // User doesn't exist — create with a temp password
    const tempPassword = "GoalMania2025!";
    const hashed = await bcrypt.hash(tempPassword, 10);
    user = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    });
    console.log(`✅  User created: ${ADMIN_EMAIL}`);
    console.log(`   Temp password: ${tempPassword}`);
    console.log("   ⚠️  Change the password immediately after first login.");
  }

  console.log("\n📋  User record:");
  console.log(`   _id  : ${user._id}`);
  console.log(`   email: ${user.email}`);
  console.log(`   role : ${user.role}`);

  await mongoose.disconnect();
  console.log("\n✅  Done.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
