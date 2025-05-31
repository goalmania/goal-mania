import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import mongoose from "mongoose";

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email?: string;
  name?: string;
  role?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("API /users/[id]: Starting request for user ID:", id);
    const userId = id;

    // Connect to database
    await connectDB();
    console.log("API /users/[id]: Database connected");

    // Get session for authorization
    const session = await getServerSession(authOptions);
    console.log("API /users/[id]: Session:", session ? "Valid" : "Invalid");

    // Find the user by ID
    const user = (await User.findById(userId)
      .select("-password")
      .lean()) as UserDocument;

    if (!user) {
      console.log("API /users/[id]: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("API /users/[id]: User found:", user.email);

    // Format the user data
    const formattedUser = {
      id: user._id.toString(),
      name: user.name || "Unknown User",
      email: user.email || "No Email",
      role: user.role || "user",
    };

    return NextResponse.json(
      { user: formattedUser },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("API /users/[id]: Error fetching user:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
