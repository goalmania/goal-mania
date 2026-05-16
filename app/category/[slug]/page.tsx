import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolveCategoryName(slug: string): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it"}/api/admin/categories`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const cats = await res.json();
      const match = cats.find((c: any) => c.slug === slug);
      if (match) return match.name;
    }
  } catch {}
  return slug
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = await resolveCategoryName(slug);
  return {
    title: categoryName,
    description: `Acquista le migliori maglie ${categoryName} su Goal Mania. Spedizione gratuita in Italia.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    // First, try to fetch the category from the database to get its name
    let categoryName = slug;
    try {
      const categoryRes = await fetch(`/api/admin/categories`, {
        cache: 'no-store',
      });
      if (categoryRes.ok) {
        const categories = await categoryRes.json();
        const category = categories.find((cat: any) => cat.slug === slug);
        if (category) {
          categoryName = category.name;
        }
      }
    } catch (err) {
      console.log('Could not fetch category, using slug as name:', slug);
    }

    // Fetch products using the category name (products store category by name, not slug)
    const res = await fetch(`/api/products?category=${encodeURIComponent(categoryName)}&noPagination=true`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch products for category', categoryName, res.status, await res.text());
      return (
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold">Category: {categoryName}</h1>
          <p className="mt-4 text-sm text-muted-foreground">Failed to load products for this category.</p>
        </div>
      );
    }

    const products = await res.json();

    // `products` might be either an array (when noPagination) or { products, pagination }
    const rawList = Array.isArray(products) ? products : products.products || [];

    // Transform API product format to match Product interface expected by ProductGridWrapper
    // Include all fields that ProductCard might need
    const list = rawList.map((product: any) => {
      // Calculate average rating from reviews
      const reviews = product.reviews || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / reviews.length
        : 0;

      return {
        id: product._id || product.id,
        name: product.title || 'Untitled Product',
        price: typeof product.basePrice === 'number' ? product.basePrice : parseFloat(product.basePrice) || 0,
        image: product.images?.[0] || '/placeholder-product.jpg',
        category: product.category || '',
        team: product.title ? product.title.split(' ')[0] : '',
        availablePatches: product.patchIds || [],
        videos: product.videos || [],
        // Include additional fields for proper card display
        reviews: reviews,
        averageRating: averageRating,
        reviewCount: reviews.length,
        stockQuantity: product.stockQuantity || 0,
        isRetro: product.isRetro || false,
        hasShorts: product.hasShorts || false,
        hasSocks: product.hasSocks || false,
        hasPlayerEdition: product.hasPlayerEdition || false,
      };
    });

    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold mb-2">Category: {categoryName}</h1>
        <p className="text-sm text-muted-foreground">Showing {list.length} product(s)</p>

        {list.length === 0 ? (
          <div className="mt-8 text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        ) : (
          <div className="mt-6">
            {/* ProductGridWrapper is a client component that handles wishlist/cart actions */}
            <ProductGridWrapper products={list} />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading category page', error);
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold">Category: {slug}</h1>
        <p className="mt-4 text-sm text-muted-foreground">An error occurred while loading products.</p>
      </div>
    );
  }
}
