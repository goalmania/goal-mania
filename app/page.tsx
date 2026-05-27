import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HeroSection from "@/components/home/HeroSection";
import TeamLogoTicker from "@/components/home/TeamLogoTicker";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SocialProofSection from "@/components/home/SocialProofSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import EditorialCommerceSection from "@/components/home/EditorialCommerceSection";
import HomeCategoryCards from "@/app/_components/HomeCategoryCards";
import ProductModel from "@/lib/models/Product";

export const revalidate = 300;

async function getFeaturedProducts() {
  try {
    await connectDB();
    const products = await ProductModel.find({ isActive: true, feature: true })
      .limit(10)
      .lean();

    return JSON.parse(JSON.stringify(products)).map((p: any) => ({
      id: p._id.toString(),
      name: p.title || "Featured Product",
      price: p.basePrice || 0,
      image: p.images?.[0] || "/images/placeholder.png",
      category: p.category || "Uncategorized",
      slug: p.slug || "",
      team: p.title ? p.title.split(" ")[0] : "Unknown",
      availablePatches: p.availablePatches || [],
      isMysteryBox: p.isMysteryBox || false,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function Home() {
  const featuredArticles = await (async () => {
    try {
      await connectDB();
      const articles = await Article.find({ status: "published", featured: true })
        .sort({ publishedAt: -1 })
        .limit(20)
        .lean();
      return JSON.parse(JSON.stringify(articles));
    } catch {
      return [];
    }
  })();

  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="bg-[#070707] min-h-screen relative font-munish">

      {/* 1. HERO — "MAGLIE DA CALCIO A 30€" + maglie reali rotanti */}
      <HeroSection products={featuredProducts} />

      {/* 2. CATEGORIE — navigazione per campionato */}
      <HomeCategoryCards />

      {/* 3. OFFERTA LAMPO — urgency + prodotto reale */}
      <FlashSaleSection product={featuredProducts[0]} />

      {/* 4. MAGLIE IN EVIDENZA — grid prodotti featured */}
      <FeaturedProducts products={featuredProducts} />

      {/* 5. LOGHI SQUADRE — social proof visivo */}
      <TeamLogoTicker />

      {/* 6. NOTIZIE + MAGLIE — editoriale ibrido */}
      <EditorialCommerceSection
        articles={featuredArticles.slice(0, 3)}
        products={featuredProducts.slice(0, 3)}
      />

      {/* 7. RECENSIONI */}
      <SocialProofSection />
    </div>
  );
}
