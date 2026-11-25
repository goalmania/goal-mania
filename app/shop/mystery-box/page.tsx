import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { isRetroBox, mysteryUnitPrice } from "@/lib/serverPricing.pure";
import MysteryBoxPageClient from "@/app/_components/MysteryBoxPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mystery Box maglie da calcio: scegli quante, a partire da 35€ a maglia",
  description:
    "La Mystery Box di Goal Mania: scegli retro o attuali, quante maglie vuoi (35€ le attuali, 40€ le retro, ogni 3 una è in regalo) e le squadre da escludere. Spedizione gratuita in Italia.",
  alternates: { canonical: "https://goal-mania.it/shop/mystery-box" },
};

// Enable ISR for mystery box listing
export const revalidate = 300;

async function getMysteryBoxProducts() {
  await connectDB();
  const products = await Product.find({
    isMysteryBox: true,
    isActive: true,
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function MysteryBoxPage() {
  const serverProducts = await getMysteryBoxProducts();

  // Log products that might cause issues
  serverProducts.forEach((product: IProduct, index: number) => {
    if (!product._id) {
      console.warn(`Product at index ${index} is missing _id:`, product);
    }
    if (!product.images || !product.images.length) {
      console.warn(
        `Product with ID ${product._id || "unknown"} is missing images:`,
        product
      );
    }
  });

  // Filter out products with missing essential data
  const validProducts = serverProducts.filter(
    (product: IProduct) => product._id && product.title
  );

  const boxes = validProducts.map((p: any) => ({
    id: String(p._id),
    slug: p.slug || "",
    name: p.title || "Mystery box",
    // Niente foto di maglie: la sorpresa e il punto, quindi una grafica della box
    image: isRetroBox(p.title) ? "/mystery/box-retro.png" : "/mystery/box-current.png",
    kind: (isRetroBox(p.title) ? "retro" : "current") as "retro" | "current",
    unit: mysteryUnitPrice(p.title),
    adultSizes: p.adultSizes || [],
    kidsSizes: p.kidsSizes || [],
  }));

  return <MysteryBoxPageClient boxes={boxes} />;
}
