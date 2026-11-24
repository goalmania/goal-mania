import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { revalidatePath, revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

// Azioni di gruppo sui prodotti selezionati: attiva, disattiva, in evidenza, prezzo.
// Solo admin. Max 200 prodotti per richiesta.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any)?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((i: string) => mongoose.Types.ObjectId.isValid(i)) : [];
  const action: string = body?.action;
  if (!ids.length || ids.length > 200) return NextResponse.json({ error: "Seleziona da 1 a 200 prodotti" }, { status: 400 });

  let update: Record<string, unknown>;
  if (action === "activate") update = { isActive: true };
  else if (action === "deactivate") update = { isActive: false };
  else if (action === "feature") update = { feature: true };
  else if (action === "unfeature") update = { feature: false };
  else if (action === "price") {
    const price = Number(body?.value);
    if (!(price > 0 && price < 1000)) return NextResponse.json({ error: "Prezzo non valido" }, { status: 400 });
    update = { basePrice: price };
  } else return NextResponse.json({ error: "Azione non valida" }, { status: 400 });

  await connectDB();
  const res = await Product.updateMany({ _id: { $in: ids } }, { $set: update });
  // Il prezzo dei retro vive in retroPrice: aggiorna anche quello per i prodotti retro selezionati
  if (action === "price") await Product.updateMany({ _id: { $in: ids }, isRetro: true }, { $set: { retroPrice: Number(body.value) } });

  revalidateTag("archive", "default");
  for (const p of ["/", "/shop", "/archivio"]) revalidatePath(p);
  return NextResponse.json({ ok: true, modified: res.modifiedCount });
}
