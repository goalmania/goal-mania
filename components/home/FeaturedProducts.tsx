import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Product } from "@/lib/types/home";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-6 sm:mb-8 md:mb-10">
          Prodotti in Evidenza
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
              <Link href={`/products/${product.id}`} className="block h-full flex flex-col">
                <div className="relative h-40 sm:h-48 md:h-56 w-full flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <CardContent className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-[#0e1924] mb-2 line-clamp-2 text-sm sm:text-base md:text-lg">
                    {product.name}
                  </h3>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#f5963c] mt-auto">
                    €{product.price.toFixed(2)}
                  </p>
                </CardContent>
              </Link>
            </Card>
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