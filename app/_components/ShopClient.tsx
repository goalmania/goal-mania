"use client";
import ProductGridWrapper from "@/app/_components/ProductGridWrapper";
import FAQ from "@/app/_components/FAQ";
import Guarantees from "@/app/_components/Guarantees";
import ReviewsSlider from "@/app/_components/ReviewsSlider";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ShopSearchBar from "./ShopSearchBar";
import TeamCarousel from "@/components/home/TeamCarousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/hooks/useI18n";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
}

export default function ShopClient({
  season2025Products = [],
  featuredProducts = [],
  mysteryBoxProducts = [],
}: {
  season2025Products: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts: Product[];
}) {
  const { t } = useI18n();

  // Extract featured products
  const featuredProduct = featuredProducts[0] || null;
  const featuredProduct2 = featuredProducts[1] || null;
  const featuredProduct3 = featuredProducts[2] || null;

  return (
    <div className="bg-white pt-[112px]">
      <ShopSearchBar />
      {/* Hero section - adjust height to account for fixed header */}
      <div className="relative px-0">
        <div className="mx-0 w-screen px-0 py-8">
          {/* Image section - full width */}
          <Card className="max-w-[80vw] bg-white h-screen flex flex-col justify-center items-center overflow-hidden rounded-2xl shadow-2xl p-0 mx-auto relative border-0">
            <Image
              src="/banners/banner_1.jpeg"
              alt={t('shop.banner1.alt', 'Retro Collection')}
              className="object-cover px-auto w-full"
              fill
              objectFit="cover"
              priority
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <Button asChild size="lg" className="bg-[#f5963c] hover:bg-[#e0852e] text-white font-semibold rounded-lg shadow-lg transition-transform duration-300 ease-in-out px-8 py-4 text-lg">
                <Link href="/shop/retro">{t('shop.banner2.cta', 'Scopri ora')}</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <TeamCarousel />


      {/* Customer Satisfaction Message */}
      <div className="bg-gray-800 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Oltre 1200 Clienti Felici ⭐️{" "}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white">
              Oltre 1200 persone hanno scelto di fare parte della nostra
              famiglia di clienti soddisfatti. La qualità dei nostri prodotti e
              l&apos;attenzione che dedichiamo a ogni dettaglio hanno reso ogni
              acquisto un&apos;esperienza positiva.
            </p>
          </div>
        </div>
      </div>

      {/* Maglie 2025/26 Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Maglie 2025/26
          </h2>
          <Link
            href="/shop/2025/26"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Vedi tutti
          </Link>
        </div>
        <div className="mt-6">
          {season2025Products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun prodotto disponibile in questa categoria.</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <ProductGridWrapper products={season2025Products} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Mystery Box Section */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-16 sm:py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-3xl">🎁</span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Mystery Box
            </h2>
            <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto">
              Scatole misteriose piene di sorprese! Ogni box contiene maglie selezionate con cura, 
              perfette per veri collezionisti che amano le sorprese.
            </p>
          </div>

          {/* Products Grid */}
          <div className="mb-8">
            {mysteryBoxProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <p className="text-white/80 text-lg">I Mystery Box stanno arrivando presto!</p>
                <p className="text-white/60 text-sm mt-2">Torna a controllare per le nostre sorprese speciali.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mysteryBoxProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="group relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in"
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    {/* Mystery Box Icon Overlay */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-pulse">
                      🎁
                    </div>
                    
                    <div className="aspect-square bg-white/20 rounded-xl mb-4 relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-yellow-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-purple-100 text-sm mb-4">
                      Contenuto a sorpresa • Valore garantito superiore al prezzo
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        €{product.price.toFixed(2)}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105"
                      >
                        Scopri →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="mr-4">
                <span className="text-4xl">✨</span>
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-lg">Garanzia Soddisfazione 100%</h3>
                <p className="text-purple-100 text-sm">Non sei soddisfatto? Rimborso completo entro 7 giorni!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantees Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Guarantees />
        </div>
      </div>

      {/* Featured Product Showcase 1 */}
      {featuredProduct && (
        <div className="bg-[#1e2937] py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Left side */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Right side */}
              <div className="w-full md:w-1/2 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Qualità Super 🧵
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Le nostre maglie sono capi curati nei minimi dettagli con
                  <span className="font-semibold"> materiali premium</span>.
                  Perfette per i veri appassionati che vogliono collezionare
                  emozioni, non solo tessuto.
                </p>
                <Link
                  href={`/products/${featuredProduct.id}`}
                  className="inline-block bg-white text-[#1e2937] px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-100 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Product Showcase 2 */}
      {featuredProduct2 && (
        <div className="bg-white py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Right side (reversed) */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct2.image}
                    alt={featuredProduct2.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Left side */}
              <div className="w-full md:w-1/2 text-gray-900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Modelli introvabili 🔥
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Associa un testo a un&apos;immagine per dare importanza al
                  prodotto, alla collezione o all&apos;articolo del blog di tua
                  scelta. Aggiungi dettagli sulla disponibilità, sullo stile o
                  fornisci una recensione.
                </p>
                <Link
                  href={`/products/${featuredProduct2.id}`}
                  className="inline-block bg-[#1e2937] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-800 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Product Showcase 3 */}
      {featuredProduct3 && (
        <div className="bg-gray-100 py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Left side */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct3.image}
                    alt={featuredProduct3.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Right side */}
              <div className="w-full md:w-1/2 text-gray-900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Vestibilità perfetta 🎯
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Associa un testo a un&apos;immagine per dare importanza al
                  prodotto, alla collezione o all&apos;articolo del blog di tua
                  scelta. Aggiungi dettagli sulla disponibilità, sullo stile o
                  fornisci una recensione.
                </p>
                <Link
                  href={`/products/${featuredProduct3.id}`}
                  className="inline-block bg-[#1e2937] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-800 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Customer Satisfaction Banner */}
      <div className="bg-gray-800 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Valutazioni Stellari: 4.8⭐️ di Media!{" "}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white">
              Oltre 1200 clienti felici e +40 recensioni tutte positive, che
              trovi scorrendo in basso! Unisciti a noi nel creare esperienze
              uniche e rendere ogni giorno migliore con le maglie che hanno
              scritto la storia. La nostra famiglia è pronta ad accoglierti a
              braccia aperte!
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <Suspense
        fallback={<div className="h-64 bg-gray-100 animate-pulse"></div>}
      >
        <ReviewsSlider />
      </Suspense>

      {/* FAQ Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FAQ />
        </div>
      </div>
    </div>
  );
}
