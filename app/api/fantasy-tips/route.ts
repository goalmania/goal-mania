import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FantasyTips from "@/lib/models/FantasyTips";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET handler to retrieve the latest fantasy tips
export async function GET() {
  try {
    await connectDB();

    // Get the most recent fantasy tips
    const tips = await FantasyTips.findOne().sort({ createdAt: -1 });

    // If no tips exist yet, return empty arrays
    if (!tips) {
      return NextResponse.json(
        {
          recommended: [],
          notRecommended: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(tips, { status: 200 });
  } catch (error) {
    console.error("Error fetching fantasy tips:", error);
    return NextResponse.json(
      { error: "Failed to fetch fantasy tips" },
      { status: 500 }
    );
  }
}

// POST handler to save new fantasy tips
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Optional: Check if user is authenticated or has admin role
    // Uncomment this if you want to restrict who can update tips
    /*
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }
    */

    const data = await request.json();

    // Validate input data
    if (
      !data.recommended ||
      !data.notRecommended ||
      !Array.isArray(data.recommended) ||
      !Array.isArray(data.notRecommended)
    ) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new fantasy tips entry
    const fantasyTips = new FantasyTips({
      recommended: data.recommended,
      notRecommended: data.notRecommended,
      createdBy: session?.user?.email || "system",
    });

    await fantasyTips.save();

    return NextResponse.json(fantasyTips, { status: 201 });
  } catch (error) {
    console.error("Error saving fantasy tips:", error);
    return NextResponse.json(
      { error: "Failed to save fantasy tips" },
      { status: 500 }
    );
  }
}
