import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Check authentication - either session or API token
    const session = await getServerSession(authOptions);
    const authHeader = request.headers.get("authorization");
    const adminToken = process.env.ADMIN_TOKEN;

    const isAuthenticated =
      (session?.user && (session.user as any).role === "admin") ||
      (adminToken && authHeader === `Bearer ${adminToken}`);

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the path to revalidate from the request body
    const { path, tag } = await request.json();

    if (path) {
      // Revalidate the specific path
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    } else if (tag) {
      // Revalidate based on cache tag
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag });
    } else {
      // Default paths to revalidate if no specific path provided

      // Product pages
      revalidatePath("/shop");
      revalidatePath("/shop/2024/25");
      revalidatePath("/shop/2025/26");
      revalidatePath("/shop/retro");
      revalidatePath("/shop/serieA/international");

      // Article/news pages
      revalidatePath("/news");
      revalidatePath("/serieA");
      revalidatePath("/transfer");
      revalidatePath("/international");

      return NextResponse.json({
        revalidated: true,
        message: "All product and article pages revalidated.",
      });
    }
  } catch (error) {
    console.error("Error revalidating:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
