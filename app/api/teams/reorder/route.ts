import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";

// PUT /api/teams/reorder - Update display order of teams (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { teamOrders } = body;

    if (!Array.isArray(teamOrders)) {
      return NextResponse.json(
        { error: "teamOrders must be an array" },
        { status: 400 }
      );
    }

    // Update each team's display order
    const updatePromises = teamOrders.map(({ id, displayOrder }: { id: string, displayOrder: number }) =>
      Team.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true, message: "Team order updated successfully" });
  } catch (error) {
    console.error("Error updating team order:", error);
    return NextResponse.json(
      { error: "Failed to update team order" },
      { status: 500 }
    );
  }
} 