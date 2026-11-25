import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { sendSupplierTelegram } from "@/lib/supplier";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") redirect("/auth/signin?callbackUrl=/admin/orders/telegram");
}

// Manda su Telegram il messaggio per il fornitore di uno o piu ordini. Per sicurezza ci si riesce solo agli ordini con un pagamento Stripe collegato.
async function sendOrders(formData: FormData) {
  "use server";
  await requireAdmin();
  const ids = String(formData.get("ids") || "").split(",").filter((i) => mongoose.Types.ObjectId.isValid(i));
  await connectDB();
  let ok = 0, ko = 0;
  for (const id of ids) {
    const o = await Order.findById(id).lean<any>();
    if (!o || !o.paymentIntentId) { ko++; continue; }
    const r = await sendSupplierTelegram(o);
    r.ok ? ok++ : ko++;
  }
  redirect(`/admin/orders/telegram?dal=${encodeURIComponent(String(formData.get("dal") || ""))}&ok=${ok}&ko=${ko}`);
}

export default async function TelegramOrdersPage({ searchParams }: { searchParams: Promise<{ dal?: string; id?: string; ok?: string; ko?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const dal = sp.dal || "2026-11-24";
  await connectDB();
  const q: any = sp.id && mongoose.Types.ObjectId.isValid(sp.id) ? { _id: sp.id } : { createdAt: { $gte: new Date(`${dal}T00:00:00+01:00`) } };
  const orders = await Order.find(q).sort({ createdAt: -1 }).lean<any[]>();
  const paid = orders.filter((o) => o.paymentIntentId);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Ordini → Telegram</h1>
      <p className="text-sm text-muted-foreground">Il messaggio per il fornitore (articolo, taglia, personalizzazioni, foto, indirizzo) arriva a te su Telegram. Si inviano solo gli ordini con un pagamento Stripe collegato.</p>
      {sp.ok !== undefined && <p className="rounded-xl border p-3 text-sm">Inviati: <b>{sp.ok}</b> · non inviati: <b>{sp.ko}</b></p>}
      <form className="flex gap-2">
        <input type="date" name="dal" defaultValue={dal} className="h-10 rounded-lg border px-3 text-sm" />
        <button className="h-10 rounded-lg border px-4 text-sm font-semibold">Mostra ordini dal</button>
      </form>
      <p className="text-sm">{orders.length} ordini · <b>{paid.length}</b> con pagamento Stripe · {orders.length - paid.length} senza pagamento</p>
      {paid.length > 0 && (
        <form action={sendOrders}>
          <input type="hidden" name="ids" value={paid.map((o) => String(o._id)).join(",")} />
          <input type="hidden" name="dal" value={dal} />
          <button className="h-12 w-full rounded-full bg-[#229ed9] px-6 font-bold text-white">Invia su Telegram i {paid.length} ordini pagati</button>
        </form>
      )}
      <ul className="space-y-3">
        {orders.map((o) => (
          <li key={String(o._id)} className="rounded-xl border p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <b>#{String(o._id).slice(-6).toUpperCase()} · €{Number(o.amount).toFixed(2)}</b>
              <span>{new Date(o.createdAt).toLocaleString("it-IT", { timeZone: "Europe/Rome" })}</span>
            </div>
            <p className="mt-1">{(o.items || []).map((i: any) => `${i.name} x${i.quantity}${i.customization?.size ? ` (${i.customization.size})` : ""}`).join(" · ")}</p>
            <p className="mt-1 text-muted-foreground">{o.shippingAddress?.fullName || o.guestEmail || "—"} · stato: {o.status}</p>
            <p className={`mt-1 font-semibold ${o.paymentIntentId ? "text-green-600" : "text-red-500"}`}>{o.paymentIntentId ? `Pagato su Stripe (${String(o.paymentIntentId).slice(0, 14)}…)` : "NESSUN pagamento collegato: non è un ordine pagato"}</p>
            {o.paymentIntentId && (
              <form action={sendOrders} className="mt-2">
                <input type="hidden" name="ids" value={String(o._id)} />
                <input type="hidden" name="dal" value={dal} />
                <button className="h-9 rounded-lg border px-3 font-semibold">Invia questo su Telegram</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
