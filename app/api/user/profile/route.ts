import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    // Connect to database
    await connectDB();

    // Check if email is already taken by another user
    if (validatedData.email !== session.user.email) {
      const existingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: session.user.id },
      }).lean();

      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Find the user first
    const user = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update user profile with only name and email
    const result = await User.updateOne(
      { email: session.user.email },
      {
        $set: {
          name: validatedData.name,
          email: validatedData.email,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes were made" },
        { status: 400 }
      );
    }

    // Get updated user
    const updatedUser = await User.findOne({
      email: validatedData.email,
    }).lean();

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: JSON.parse(JSON.stringify(updatedUser)),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
