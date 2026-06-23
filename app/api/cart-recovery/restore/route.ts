import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { AbandonedCart } from "@/lib/models/AbandonedCart";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token mancante" }, { status: 400 });

  await connectDB();

  const cart = await AbandonedCart.findOne({ recoveryToken: token, recoveredAt: { $exists: false } });
  if (!cart) return NextResponse.json({ error: "Link scaduto o già usato" }, { status: 404 });

  // Marca come recuperato
  await AbandonedCart.updateOne({ _id: cart._id }, { recoveredAt: new Date() });

  return NextResponse.json({ items: cart.items, total: cart.total });
}
