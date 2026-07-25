import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendPushToAdmins } from "@/lib/utils/push";

// Endpoint temporaneo per verificare la configurazione push. Da rimuovere
// dopo il test.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  await sendPushToAdmins({
    title: "Notifica di prova 🔔",
    body: "Se vedi questa notifica, tutto funziona!",
    url: "/admin/orders",
  });

  return NextResponse.json({ success: true });
}
