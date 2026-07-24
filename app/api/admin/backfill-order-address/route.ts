import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Address from "@/lib/models/Address";
import User from "@/lib/models/User";

// Ripristino una tantum: recupera lo shippingAddress per gli ordini creati
// con indirizzo vuoto a causa del bug di sessione in /api/addresses
// (corretto il 24/07 - vedi commit 42cfab9). Da rimuovere dopo l'uso.
const AFFECTED_ORDERS = [
  { orderId: "6a638e1ae5db5fa9b35694ad", userEmail: "davideguiducci38@gmail.com" },
  { orderId: "6a6359d57735e9bfda3db5d3", userEmail: "pietrogiancristiano@yahoo.it" },
];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await connectDB();
  const results = [];

  for (const { orderId, userEmail } of AFFECTED_ORDERS) {
    const order = await Order.findById(orderId);
    if (!order) {
      results.push({ orderId, status: "order_not_found" });
      continue;
    }

    const current = order.shippingAddress || {};
    if (current.street || current.city || current.postalCode) {
      results.push({ orderId, status: "already_has_data" });
      continue;
    }

    const address = await Address.findOne({ userId: userEmail }).sort({ isDefault: -1, createdAt: -1 });
    if (!address) {
      results.push({ orderId, status: "address_not_found" });
      continue;
    }

    order.shippingAddress = {
      street: address.addressLine1 + (address.addressLine2 ? `, ${address.addressLine2}` : ""),
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      fullName: address.fullName,
      phone: address.phone,
    };
    await order.save();

    const user = await User.findOne({ email: userEmail }).select("_id");
    if (user) {
      address.userId = user._id.toString();
      await address.save();
    }

    results.push({
      orderId,
      status: "recovered",
      city: address.city,
      postalCode: address.postalCode,
      addressUserIdFixed: !!user,
    });
  }

  return NextResponse.json({ results });
}
