import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export const revalidate = 3600; // cache 1h

const BASE_URL = "https://goal-mania.it";

// Google product category for football jerseys
const GOOGLE_CATEGORY = "Abbigliamento e accessori > Abbigliamento > Abbigliamento sportivo > Magliette sportive";

function escapeXml(str: string): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function productToItems(product: any): string {
  const slug = product.slug || product._id.toString();
  const link = `${BASE_URL}/products/${slug}`;
  const title = escapeXml(product.title);
  const description = escapeXml(
    (product.description ?? product.title).slice(0, 5000)
  );
  const imageLink = product.images?.[0] ?? "";
  const additionalImages = (product.images ?? []).slice(1, 10);

  const basePrice = product.basePrice ?? 30;
  const retroPrice = product.retroPrice ?? 35;
  const isRetro = product.isRetro ?? false;
  const price = isRetro ? retroPrice : basePrice;
  const shippingPrice = product.shippingPrice ?? 0;

  const brand = "Goal Mania";
  const condition = "new";
  const availability = (product.stockQuantity ?? 1) > 0 ? "in stock" : "out of stock";

  // Determine product type label
  let productType = "Maglie da Calcio";
  if (isRetro) productType = "Maglie da Calcio > Maglie Retro";
  else if (product.isWorldCup) productType = "Maglie da Calcio > Maglie Mondiali 2026";
  else productType = "Maglie da Calcio > Maglie Attuali";

  // Adult sizes — one item per size (variant grouping)
  const adultSizes: string[] = product.adultSizes ?? ["S", "M", "L", "XL", "XXL"];
  const kidsSizes: string[] = product.kidsSizes ?? [];
  const allSizes = [
    ...adultSizes.map((s: string) => ({ size: s, ageGroup: "adult" })),
    ...kidsSizes.map((s: string) => ({ size: s, ageGroup: "kids" })),
  ];

  if (allSizes.length === 0) {
    allSizes.push({ size: "M", ageGroup: "adult" });
  }

  const itemGroupId = `gm-${slug}`;

  return allSizes
    .map(({ size, ageGroup }) => {
      const itemId = `${itemGroupId}-${size}`.toLowerCase().replace(/\s+/g, "-");
      const sizeLabel = escapeXml(size);
      const additionalImagesXml = additionalImages
        .map((img: string) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("\n      ");

      return `  <item>
    <g:id>${escapeXml(itemId)}</g:id>
    <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>
    <title>${title} - Taglia ${sizeLabel}</title>
    <description>${description}</description>
    <link>${escapeXml(link)}</link>
    <g:image_link>${escapeXml(imageLink)}</g:image_link>
    ${additionalImagesXml}
    <g:condition>${condition}</g:condition>
    <g:availability>${availability}</g:availability>
    <g:price>${price.toFixed(2)} EUR</g:price>
    <g:shipping>
      <g:country>IT</g:country>
      <g:service>Standard</g:service>
      <g:price>${shippingPrice.toFixed(2)} EUR</g:price>
    </g:shipping>
    <g:brand>${brand}</g:brand>
    <g:google_product_category>${escapeXml(GOOGLE_CATEGORY)}</g:google_product_category>
    <g:product_type>${escapeXml(productType)}</g:product_type>
    <g:size>${sizeLabel}</g:size>
    <g:age_group>${ageGroup}</g:age_group>
    <g:gender>unisex</g:gender>
    <g:color>Vedi immagine</g:color>
    <g:material>Poliestere</g:material>
    <g:identifier_exists>false</g:identifier_exists>
    <g:custom_label_0>${isRetro ? "retro" : product.isWorldCup ? "mondiali-2026" : "attuale"}</g:custom_label_0>
    <g:custom_label_1>${escapeXml(product.country || product.nationalTeam || "")}</g:custom_label_1>
  </item>`;
    })
    .join("\n");
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({ isActive: true, isMysteryBox: false })
      .select("_id slug title description images basePrice retroPrice isRetro isWorldCup shippingPrice stockQuantity adultSizes kidsSizes country nationalTeam category")
      .lean();

    const items = (products as any[]).map(productToItems).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Goal Mania — Maglie da Calcio</title>
    <link>${BASE_URL}</link>
    <description>Maglie da calcio a partire da 30€. Serie A, Premier League, Mondiali 2026, maglie retro.</description>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("[MERCHANT_FEED]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
