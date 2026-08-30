import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidatePath("/shop/retro", "page");
  revalidatePath("/shop", "layout");
  return NextResponse.json({ ok: true, revalidated: ["/shop/retro", "/shop"] });
}
