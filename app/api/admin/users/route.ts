import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { Types } from "mongoose";

interface UserDocument {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: Date;
}

export async function GET(req: NextRequest) {
  try {
    console.log("Admin users API: Starting request");
    const session = await getServerSession(authOptions);
    console.log("Admin users API: Session", session?.user?.role);

    if (!session?.user?.role || session.user.role !== "admin") {
      console.log("Admin users API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    console.log("Admin users API: Connected to database");

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    console.log("Admin users API: Query params", { page, limit, search });

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    try {
      // Count total users matching the query
      const total = await User.countDocuments(query);
      console.log("Admin users API: Total users found", total);

      // Fetch users with pagination
      const users = (await User.find(query)
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()) as UserDocument[];

      console.log("Admin users API: Returning users", users.length);

      // Ensure all users have the expected fields
      const formattedUsers = users.map((user) => ({
        _id: user._id.toString(),
        name: user.name || "Unknown",
        email: user.email || "No email",
        role: user.role || "user",
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString(),
      }));

      return NextResponse.json(
        {
          users: formattedUsers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    } catch (dbError) {
      console.error("Admin users API: Database error:", dbError);
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Admin users API: Error fetching users:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
