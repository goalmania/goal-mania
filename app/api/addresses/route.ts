import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Address from "@/lib/models/Address";
import dbConnect from "@/lib/db";

// Get all addresses for the current user
export async function GET() {
  try {
    const session = await getServerSession();
    console.log("GET /addresses: Session", session?.user);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get both possible user identifiers
    const userId = session.user.id || session.user.email;
    const userEmail = session.user.email;

    console.log("GET /addresses: Looking for addresses with userId:", userId);
    console.log("GET /addresses: User email:", userEmail);

    if (!userId) {
      return NextResponse.json(
        { error: "Unable to determine user ID" },
        { status: 400 }
      );
    }

    // Look for addresses using both userId and email as possible identifiers
    const addresses = await Address.find({
      $or: [{ userId: userId }, { userId: userEmail }],
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    console.log(`GET /addresses: Found ${addresses.length} addresses`);

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("GET /addresses: Error", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// Create a new address
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    console.log("POST /addresses: Session", session?.user);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Always use the id field if available, fallback to email
    const userId = session.user.id || session.user.email;

    console.log("POST /addresses: Creating address with userId:", userId);
    console.log("POST /addresses: User email:", session.user.email);

    if (!userId) {
      return NextResponse.json(
        { error: "Unable to determine user ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Count addresses with either userId or email
    const addressCount = await Address.countDocuments({
      $or: [{ userId: userId }, { userId: session.user.email }],
    });

    if (addressCount === 0) {
      body.isDefault = true;
    }

    const address = new Address({
      ...body,
      userId,
    });

    await address.save();
    console.log("POST /addresses: Created address with id:", address._id);

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("POST /addresses: Error", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
