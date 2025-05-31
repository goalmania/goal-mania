// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

// Define interface for item with customization
interface ItemWithCustomization {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches?: Array<
      string | { id: string; name: string; image: string; price?: number }
    >;
    includeShorts?: boolean;
    includeSocks?: boolean;
    isPlayerEdition?: boolean;
    size?: string;
    isKidSize?: boolean;
    hasCustomization?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

// GET /api/orders - Get all orders (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { orders: JSON.parse(JSON.stringify(orders)) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to create an order" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();

    // Validate order data
    if (!data.items || !data.amount || data.items.length === 0) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Process items to ensure proper format for selectedPatches
    const processedItems = data.items.map((item: ItemWithCustomization) => {
      // Deep clone the item to avoid mutations
      const processedItem = JSON.parse(JSON.stringify(item));

      // If customization exists and has selectedPatches
      if (
        processedItem.customization &&
        processedItem.customization.selectedPatches
      ) {
        // If selectedPatches is an array of strings, convert to proper objects
        processedItem.customization.selectedPatches =
          processedItem.customization.selectedPatches.map(
            (
              patch:
                | string
                | { id: string; name: string; image: string; price?: number }
            ) => {
              if (typeof patch === "string") {
                return {
                  id: patch,
                  name: patch,
                  image: `/patches/${patch}.png`,
                  price: 5, // Default price, adjust as needed
                };
              }
              return patch;
            }
          );
      }

      return processedItem;
    });

    const newOrder = new Order({
      userId,
      items: processedItems,
      amount: data.amount,
      status: "pending",
      shippingAddress: data.shippingAddress || {},
      coupon: data.coupon || null,
    });

    await newOrder.save();

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: JSON.parse(JSON.stringify(newOrder)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
