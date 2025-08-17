import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Team from "@/lib/models/Team";

// GET /api/teams - Get all teams with filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isInternational = searchParams.get("isInternational");
    const isActive = searchParams.get("isActive");

    // Build filter object
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { nickname: { $regex: search, $options: "i" } },
        { league: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ];
    }

    if (isInternational !== null && isInternational !== undefined) {
      filter.isInternational = isInternational === "true";
    }

    if (isActive !== null && isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get teams with pagination
    const teams = await Team.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Team.countDocuments(filter);

    return NextResponse.json({
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team (Admin only)
export async function POST(request: NextRequest) {
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
    const {
      name,
      nickname,
      logo,
      href,
      colors,
      bgGradient,
      borderColor,
      textColor,
      isInternational = false,
      league,
      country,
      slug,
      isActive = true,
      displayOrder = 0,
    } = body;

    // Validate required fields
    if (!name || !nickname || !logo || !colors || !bgGradient || !borderColor || !textColor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create team
    const team = new Team({
      name,
      nickname,
      logo,
      href,
      colors,
      bgGradient,
      borderColor,
      textColor,
      isInternational,
      league,
      country,
      slug,
      isActive,
      displayOrder,
    });

    await team.save();

    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team:", error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Team with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
} 