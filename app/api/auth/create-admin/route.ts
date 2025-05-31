import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// Endpoint to create an admin account - for development use only
export async function POST(request: Request) {
  try {
    // This would typically have more security and validation
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "admin",
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { message: "Admin created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}
