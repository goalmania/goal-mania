import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";
import mongoose from "mongoose";

// PUT /api/teams/[id]/toggle-status - Toggle team active status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid team ID" },
        { status: 400 }
      );
    }

    // Find the team and toggle its status
    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    team.isActive = !team.isActive;
    await team.save();

    return NextResponse.json({
      success: true,
      team,
      message: `Team ${team.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error("Error toggling team status:", error);
    return NextResponse.json(
      { error: "Failed to toggle team status" },
      { status: 500 }
    );
  }
} 