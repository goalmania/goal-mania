// lib/models/User.ts
import mongoose from "mongoose";

export interface IUser {
  name: string;
  email: string;
  username?: string;
  password: string;
  role: "admin" | "user" | "premium";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      index: true, // This creates the index automatically
    },
    username: {
      type: String,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["admin", "user", "premium"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Enhanced indexes for better query performance
userSchema.index({ role: 1 }); // For admin queries
userSchema.index({ createdAt: -1 }); // For recent users
userSchema.index({ name: "text", email: "text" }); // Text search capability
userSchema.index({ role: 1, createdAt: -1 }); // Compound index for admin dashboard

// Add any instance methods here if needed
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Check if the model is already defined to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
