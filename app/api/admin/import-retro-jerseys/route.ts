import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { RETRO_IMPORT_TITLES } from "@/lib/data/retro-import-titles";

/**
 * Importa in blocco le maglie retro mancanti dal catalogo.
 * Protetto da sessione admin, va eseguito manualmente dal pannello
 * (pulsante "Importa maglie mancanti" in /admin/products).
 *
 * Tutti i prodotti creati sono:
 * - categoria "Retro", isRetro: true, isWorldCup: false
 * - prezzo fisso 40€ (basePrice e retroPrice)
 * - immagine placeholder (da sostituire con foto vere)
 * - isActive: false (bozza, non visibile sul sito finché non attivata a mano)
 */

function normalize(t: string): string {
  return t
    .toLowerCase()
    .replace(/maglia/g, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .sort()
    .join(" ");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();

    const existing = await Product.find({}, "title slug").lean();
    const existingNormalized = new Set(existing.map((p: any) => normalize(p.title)));
    const existingSlugs = new Set(existing.map((p: any) => p.slug));

    const missing = RETRO_IMPORT_TITLES.filter(
      (title) => !existingNormalized.has(normalize(title))
    );

    const created: string[] = [];
    const failed: { title: string; error: string }[] = [];

    for (const title of missing) {
      let slug = slugify(title);
      if (existingSlugs.has(slug)) slug = `${slug}-${Date.now()}`;
      existingSlugs.add(slug);

      const description = `${title} disponibile su Goal Mania a soli 40€. Maglia storica di qualità premium. Personalizzazione gratuita con nome e numero sulla schiena. Spedizione gratuita in tutta Italia. Consegna in 5-10 giorni lavorativi.`;

      try {
        await Product.create({
          title,
          slug,
          description,
          basePrice: 40,
          retroPrice: 40,
          shippingPrice: 0,
          stockQuantity: 20,
          images: ["/images/image.png"],
          videos: [],
          category: "Retro",
          isRetro: true,
          isWorldCup: false,
          isMysteryBox: false,
          hasShorts: false,
          hasSocks: false,
          hasPlayerEdition: false,
          hasLongSleeve: false,
          country: "",
          nationalTeam: "",
          adultSizes: ["S", "M", "L", "XL", "XXL"],
          kidsSizes: [],
          allowsNumberOnShirt: true,
          allowsNameOnShirt: true,
          isActive: false,
          feature: false,
          reviews: [],
        });
        created.push(title);
      } catch (err: unknown) {
        failed.push({ title, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return NextResponse.json({
      candidateCount: RETRO_IMPORT_TITLES.length,
      alreadyExisted: RETRO_IMPORT_TITLES.length - missing.length,
      attempted: missing.length,
      createdCount: created.length,
      failedCount: failed.length,
      failed: failed.slice(0, 20),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[IMPORT_RETRO_JERSEYS]", err);
    return NextResponse.json({ error: "Import failed", message }, { status: 500 });
  }
}
