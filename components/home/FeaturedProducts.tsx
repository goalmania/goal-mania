"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types/product";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const router = useRouter();
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();

  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = wishlistStore;
  const { addItem: addToCart } = cartStore;

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

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          Prodotti in Evidenza
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
              cardHeight="md"
              imageAspectRatio="portrait"
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
              isInWishlist={isInWishlist}
              showWishlistButton={true}
              product={product}
            />
          ))}
        </div>
        <div className="text-center mt-6 sm:mt-8 md:mt-10">
          <Button asChild variant="outline" size="lg" className="border-[#f5963c] text-[#f5963c] hover:bg-[#f5963c] hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg">
            <Link href="/shop">
              Vedi Tutti i Prodotti
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
} 