import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import Container from "@/app/_sections/container";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Category: ${slug}`,
    description: `Products in category ${slug}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  
  // Decode the slug from URL (it might be URL encoded)
  const slug = decodeURIComponent(rawSlug);
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // First, try to fetch the category from the database to get its name
    let categoryName = slug;
    try {
      const categoryRes = await fetch(`${baseUrl}/api/admin/categories`, {
        cache: 'no-store',
      });
      if (categoryRes.ok) {
        const categories = await categoryRes.json();
        // Try to find category by slug (handle both encoded and decoded slugs)
        const category = categories.find((cat: any) => 
          cat.slug === slug || 
          cat.slug === rawSlug ||
          decodeURIComponent(cat.slug) === slug
        );
        if (category) {
          categoryName = category.name;
          console.log(`[Category Page] Found category: ${categoryName} for slug: ${slug}`);
        } else {
          console.log(`[Category Page] Category not found for slug: ${slug}, available slugs:`, 
            categories.map((c: any) => c.slug));
        }
      }
    } catch (err) {
      console.log('Could not fetch category, using slug as name:', slug, err);
    }

    // Fetch products using the category name (products store category by name, not slug)
    const res = await fetch(`${baseUrl}/api/products?category=${encodeURIComponent(categoryName)}&noPagination=true`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch products for category', categoryName, res.status, await res.text());
      return (
        <Container>
          <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-semibold">Category: {categoryName}</h1>
            <p className="mt-4 text-sm text-muted-foreground">Failed to load products for this category.</p>
          </div>
        </Container>
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
      <Container>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold mb-2">Category: {categoryName}</h1>
          <p className="text-sm text-muted-foreground">Showing {list.length} product(s)</p>

          {list.length === 0 ? (
            <div className="mt-8 text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Products will appear here once they are assigned to this category.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              {/* ProductGridWrapper is a client component that handles wishlist/cart actions */}
              <ProductGridWrapper products={list} />
            </div>
          )}
        </div>
      </Container>
    );
  } catch (error) {
    console.error('Error loading category page', error);
    return (
      <Container>
        <div className="max-w-7xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-semibold">Category: {slug}</h1>
          <p className="mt-4 text-sm text-muted-foreground">An error occurred while loading products.</p>
          <p className="mt-2 text-xs text-muted-foreground">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </Container>
    );
  }
}
