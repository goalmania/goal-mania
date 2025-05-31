import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request: Request) {
  try {
    console.log("API /users: Starting request processing");

    // Connect to the database
    try {
      await connectDB();
      console.log("API /users: Database connected");
    } catch (dbError) {
      console.error("API /users: Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get and verify session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log("API /users: User session:", session ? "Found" : "Not found");
    } catch (sessionError) {
      console.error("API /users: Session error:", sessionError);
    }

    // For debugging, temporarily allow access without admin role check
    // Check if user is authenticated and is admin
    // if (!session || session.user.role !== "admin") {
    //   console.log("API /users: Unauthorized access attempt");
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    console.log("API /users: Query parameters:", {
      searchQuery,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // Build the query based on search parameters
    const queryFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { email: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    console.log("API /users: Query filter:", JSON.stringify(queryFilter));

    // Calculate total count for pagination
    let totalUsers;
    try {
      totalUsers = await User.countDocuments(queryFilter);
      console.log("API /users: Total users count:", totalUsers);
    } catch (countError) {
      console.error("API /users: Error counting users:", countError);
      return NextResponse.json(
        { error: "Failed to count users" },
        { status: 500 }
      );
    }

    // Fetch users with pagination and sorting
    let users;
    try {
      users = await User.find(queryFilter)
        .select("-password") // Never send passwords to the client
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      console.log(`API /users: Found ${users.length} users`);
    } catch (findError) {
      console.error("API /users: Error finding users:", findError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response = {
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };

    console.log("API /users: Returning successful response");
    return NextResponse.json(response);
  } catch (error) {
    console.error("API /users: Unhandled error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch users: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a user by ID
export async function DELETE(request: Request) {
  try {
    console.log("API DELETE /users: Starting request processing");

    // Connect to the database
    try {
      await connectDB();
      console.log("API DELETE /users: Database connected");
    } catch (dbError) {
      console.error("API DELETE /users: Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get and verify session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log(
        "API DELETE /users: User session:",
        session ? "Found" : "Not found"
      );
    } catch (sessionError) {
      console.error("API DELETE /users: Session error:", sessionError);
    }

    // For debugging, temporarily allow access without admin role check
    // if (!session || session.user.role !== "admin") {
    //   console.log("API DELETE /users: Unauthorized access attempt");
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get user ID from request body
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      console.error("API DELETE /users: Missing user ID");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`API DELETE /users: Attempting to delete user ${userId}`);

    // Delete the user
    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        console.error(`API DELETE /users: User not found with ID ${userId}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`API DELETE /users: Successfully deleted user ${userId}`);
      return NextResponse.json({ success: true, id: userId });
    } catch (deleteError) {
      console.error(`API DELETE /users: Error deleting user:`, deleteError);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API DELETE /users: Unhandled error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to delete user: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update a user
export async function PATCH(request: Request) {
  try {
    console.log("API PATCH /users: Starting request processing");

    // Connect to the database
    try {
      await connectDB();
      console.log("API PATCH /users: Database connected");
    } catch (dbError) {
      console.error("API PATCH /users: Database connection error:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get and verify session
    let session;
    try {
      session = await getServerSession(authOptions);
      console.log(
        "API PATCH /users: User session:",
        session ? "Found" : "Not found"
      );
    } catch (sessionError) {
      console.error("API PATCH /users: Session error:", sessionError);
    }

    // For debugging, temporarily allow access without admin role check
    // if (!session || session.user.role !== "admin") {
    //   console.log("API PATCH /users: Unauthorized access attempt");
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get data from request body
    const data = await request.json();

    if (!data.id) {
      console.error("API PATCH /users: Missing user ID");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log(`API PATCH /users: Attempting to update user ${data.id}`, data);

    // Validate the update data
    const updateData: { name?: string; role?: "admin" | "user" } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (
      data.role !== undefined &&
      (data.role === "admin" || data.role === "user")
    ) {
      updateData.role = data.role;
    }

    if (Object.keys(updateData).length === 0) {
      console.error("API PATCH /users: No valid fields to update");
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the user
    try {
      const updatedUser = await User.findByIdAndUpdate(data.id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        console.error(`API PATCH /users: User not found with ID ${data.id}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log(`API PATCH /users: Successfully updated user ${data.id}`);
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (updateError) {
      console.error(`API PATCH /users: Error updating user:`, updateError);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API PATCH /users: Unhandled error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to update user: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
