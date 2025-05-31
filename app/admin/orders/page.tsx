import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import OrdersManager from "./OrdersManager";

export default async function OrdersPage() {
  // Check admin authorization
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/auth/signin");
  }

  await connectDB();

  // Fetch orders from database
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

  // Convert ObjectIds to strings and dates to ISO strings for serialization
  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage and track customer orders.
        </p>
      </div>

      <OrdersManager initialOrders={serializedOrders} />
    </div>
  );
}
