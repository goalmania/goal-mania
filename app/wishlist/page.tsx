/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useTranslation } from "@/lib/hooks/useTranslation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  EyeIcon, 
  TrashIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const { items: wishlistItems, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const moveToCart = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    removeItem(item.id);
    toast.success(`${item.name} moved to your cart`);
  };

  // Ensure image path has proper format
  const getImagePath = (imagePath: string) => {
    if (!imagePath) return "/images/image.png";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return imagePath;
    return `/${imagePath}`;
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <HeartIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                {t("wishlist.empty.title")}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                {t("wishlist.empty.description")}
              </p>
            </div>
            <div className="pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/shop">
                  {t("wishlist.empty.cta")}
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <div className="mb-8 sm:mb-12 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {t("wishlist.title")}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Your saved items and favorites. Add them to cart when you're ready to purchase.
          </p>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Wishlist</span>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={getImagePath(item.image)}
                  alt={item.name || "Product image"}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Remove Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/products/${item.id}`} className="hover:underline">
                      {item.name}
                    </Link>
                  </h3>
                  {item.team && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {item.team}
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">
                    €{item.price.toFixed(2)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    asChild 
                    className="w-full"
                  >
                    <Link href={`/products/${item.id}`}>
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => moveToCart(item)}
                  >
                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        {wishlistItems.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <Separator className="mb-8" />
            <div className="text-center space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Ready to shop more?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover more amazing products and add them to your wishlist.
              </p>
              <Button asChild size="lg">
                <Link href="/shop">
                  Continue Shopping
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
