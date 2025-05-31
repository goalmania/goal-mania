import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// Update user role (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("Update user role API: Starting request");
    const session = await getServerSession(authOptions);
    console.log("Update user role API: Session", session?.user?.role);

    if (!session?.user?.role || session.user.role !== "admin") {
      console.log("Update user role API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    console.log("Update user role API: User ID", id);

    const { role } = await req.json();
    console.log("Update user role API: New role", role);

    if (!role || !["admin", "user", "premium"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("Update user role API: Connected to database");

    const user = await User.findById(id);

    if (!user) {
      console.log("Update user role API: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    user.role = role;
    await user.save();
    console.log("Update user role API: Role updated successfully");

    return NextResponse.json({
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role API: Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
