"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGrid from "@/components/ui/ProductGrid";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
  isRetro?: boolean;
  isMysteryBox?: boolean;
  feature?: boolean;
}

interface RelatedProductsProps {
  productId: string;
  currentProductTitle: string;
}

export default function RelatedProducts({ productId, currentProductTitle }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${productId}/related`);
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
        
        const data = await response.json();
        setRelatedProducts(data);
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId]);

  const handleWishlistToggle = (product: RelatedProduct) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        team: product.team || "",
      });
    }
  };

  const handleAddToCart = (product: RelatedProduct) => {
    // For related products, redirect to product page for customization
    router.push(`/products/${product.id}`);
  };

  const customBadges = (product: RelatedProduct) => {
    const badges = [];
    if (product.feature) {
      badges.push({ text: t('products.featured'), color: 'text-white', bgColor: 'bg-blue-600' });
    }
    if (product.isRetro) {
      badges.push({ text: t('products.retro'), color: 'text-white', bgColor: 'bg-purple-600' });
    }
    if (product.isMysteryBox) {
      badges.push({ text: '🎁 Mystery Box', color: 'text-white', bgColor: 'bg-gradient-to-r from-purple-600 to-pink-600' });
    }
    return badges;
  };

  // Don't render anything if there are no related products and not loading
  if (!loading && relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-black">
              {t('products.relatedProducts')}
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              {t('products.discoverSimilarItems')}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6 md:px-8 py-6">
                {[...Array(4)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{error}</p>
              </div>
            ) : relatedProducts.length > 0 ? (
              <ProductGrid
                products={relatedProducts}
                onWishlistToggle={handleWishlistToggle}
                onAddToCart={handleAddToCart}
                isInWishlist={isInWishlist}
                showWishlistButton={true}
                showAddToCartButton={false}
                gridCols={4}
                gap="md"
                cardHeight="md"
                imageAspectRatio="portrait"
                customBadges={customBadges}
                className="!px-0" // Remove default padding since we're inside a Card
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 