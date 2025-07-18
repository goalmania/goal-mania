import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types/home";

interface MysteryBoxSectionProps {
  products: Product[];
}

export default function MysteryBoxSection({ products }: MysteryBoxSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6">
            🎁 Mystery Box
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-purple-200 max-w-2xl mx-auto px-4">
            Scopri la sorpresa! Ogni box contiene maglie esclusive con valore garantito superiore al prezzo.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {products.map((product: Product, index: number) => (
            <div 
              key={product.id} 
              className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 p-4 sm:p-6 md:p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs sm:text-sm animate-pulse">
                🎁
              </div>
              
              <div className="aspect-square bg-white/20 rounded-xl mb-3 sm:mb-4 relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              
              <h3 className="text-white font-bold text-base sm:text-lg md:text-xl mb-2 group-hover:text-yellow-300 transition-colors">
                {product.name}
              </h3>
              <p className="text-purple-100 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                Contenuto a sorpresa • Valore garantito superiore al prezzo
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  €{product.price.toFixed(2)}
                </span>
                <Link
                  href={`/products/${product.id}`}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 sm:px-4 py-2 rounded-full font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  Scopri →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 