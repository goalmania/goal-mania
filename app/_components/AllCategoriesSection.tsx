"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";
import { useI18n } from "@/lib/hooks/useI18n";
import ProductCard from "@/components/ui/ProductCard";

interface Category {
  _id: string;
  name: string;
  slug: string;
  order?: number;
  isActive?: boolean;
}

interface AllCategoriesSectionProps {
  categories: Category[];
}

function getCategoryProducts(categoryName: string): Promise<Product[]> {
  return fetch(`/api/products?category=${encodeURIComponent(categoryName)}&noPagination=true`, {
    cache: 'no-store',
  })
    .then((res) => {
      if (!res.ok) return [];
      return res.json();
    })
    .then((data) => {
      const rawList = Array.isArray(data) ? data : data.products || [];
      return rawList.map((product: any) => ({
        id: product._id || "",
        name: product.title || "Product",
        price: product.basePrice || 0,
        image: product.images?.[0] || "/images/image.png",
        category: product.category || "Uncategorized",
        team: product.team || "Unknown",
        availablePatches: product.availablePatches || [],
        isMysteryBox: product.isMysteryBox || false,
        videos: product.videos || [],
        badges: product.badges || [],
        product,
      }));
    })
    .catch(() => []);
}

function CategoryProductsSection({ categoryName }: { categoryName: string }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const { t } = useI18n();

  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = wishlistStore;
  const { addItem: addToCart } = cartStore;

  React.useEffect(() => {
    setIsLoading(true);
    getCategoryProducts(categoryName).then((prods) => {
      setProducts(prods);
      setIsLoading(false);
    });
  }, [categoryName]);

  const handleWishlistToggle = (product: Product) => {
    const productId = product.id.toString();
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        team: product.team || "",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 bg-gray-50 animate-pulse rounded-lg"></div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="pt-2 sm:pt-4 pb-12 sm:pb-16 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0e1924] font-munish">
            {categoryName}
          </h2>
          <Link href={`/category/${encodeURIComponent(categoryName)}`}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-[#0e1924] font-munish text-sm"
            >
              View All
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {/* Display all products in a grid - always show grid, never carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category || ""}
              team={product.team || ""}
              availablePatches={product.availablePatches || []}
              href={`/products/${product.id}`}
              cardHeight="lg"
              imageAspectRatio="portrait"
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              isInWishlist={isInWishlist}
              showWishlistButton={true}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AllCategoriesSection({ categories }: AllCategoriesSectionProps) {
  // Filter out categories that don't have a name or are inactive
  const validCategories = categories.filter((cat) => cat.name && cat.isActive !== false);

  if (validCategories.length === 0) return null;

  return (
    <>
      {validCategories.map((category) => (
        <CategoryProductsSection key={category._id} categoryName={category.name} />
      ))}
    </>
  );
}

