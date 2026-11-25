import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import { buildSupplierMessage, whatsappLink } from "@/lib/supplier";

export const dynamic = "force-dynamic";

// Si apre dalla notifica del nuovo ordine: il messaggio per il fornitore e pronto, un tocco e si apre WhatsApp
export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") redirect(`/auth/signin?callbackUrl=/admin/orders/fornitore/${id}`);
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) notFound();
  const message = await buildSupplierMessage(order);
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Invia l&apos;ordine al fornitore</h1>
      <p className="text-sm text-muted-foreground">Controlla il messaggio e tocca il pulsante: si apre WhatsApp con tutto già scritto, pronto da inviare.</p>
      <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center justify-center rounded-full bg-[#25d366] px-6 text-lg font-bold text-black">
        Apri WhatsApp con il fornitore
      </a>
      <pre className="whitespace-pre-wrap break-words rounded-xl border p-4 text-sm leading-relaxed">{message}</pre>
      <a href="/admin/orders" className="block text-center text-sm underline">Torna agli ordini</a>
    </div>
  );
}
