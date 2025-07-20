"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCartIcon, SparklesIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store/cart";
import { Product } from "@/lib/types/home";

interface MysteryBoxPageClientProps {
  products: Product[];
}

export default function MysteryBoxPageClient({ products }: MysteryBoxPageClientProps) {
  const { addItem } = useCartStore();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleAddToCart = async (product: Product) => {
    setLoadingStates(prev => ({ ...prev, [product.id]: true }));
    
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        customization: {
          size: "M", // Default size for mystery box
          selectedPatches: [],
          includeShorts: false,
          includeSocks: false,
          isPlayerEdition: false,
          isKidSize: false,
          hasCustomization: false,
          excludedShirts: [], // Start with empty exclusion list
        },
        quantity: 1,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [product.id]: false }));
    }
  };

  return (
    <div className="bg-white pt-[112px] min-h-screen">
      {/* Hero Section with Purple/Pink Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <GiftIcon className="h-16 w-16 text-white" />
                <SparklesIcon className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-ping" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
              Scatola Misteriosa
            </h1>
            
            <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-purple-100 mb-8">
              Scopri la magia delle nostre scatole misteriose! Ogni scatola contiene una maglia a sorpresa 
              delle migliori squadre italiane e internazionali.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">🎁</div>
                <div className="text-sm">Maglia a Sorpresa</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">⚽</div>
                <div className="text-sm">Squadre Top</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">🚚</div>
                <div className="text-sm">Spedizione Gratuita</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Le Nostre Scatole Misteriose
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scegli la tua scatola misteriosa e preparati per una sorpresa emozionante! 
              Ogni scatola è unica e contiene maglie di qualità premium.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <GiftIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna Scatola Misteriosa Disponibile
              </h3>
              <p className="text-gray-600">
                Torna presto per scoprire le nostre nuove scatole misteriose!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Mystery Box Badge */}
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <GiftIcon className="h-4 w-4" />
                      Mystery Box
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      Una scatola misteriosa piena di sorprese! Contiene una maglia a sorpresa 
                      delle migliori squadre italiane e internazionali.
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-purple-600">
                        €{product.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Spedizione gratuita
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <SparklesIcon className="h-4 w-4 text-purple-500 mr-2" />
                        Maglia a sorpresa di qualità premium
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <SparklesIcon className="h-4 w-4 text-purple-500 mr-2" />
                        Squadre italiane e internazionali
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <SparklesIcon className="h-4 w-4 text-purple-500 mr-2" />
                        Possibilità di escludere fino a 5 maglie
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={loadingStates[product.id]}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingStates[product.id] ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <ShoppingCartIcon className="h-5 w-5" />
                            Aggiungi al Carrello
                          </>
                        )}
                      </button>
                      
                      <Link
                        href={`/products/${product.id}`}
                        className="block w-full text-center text-purple-600 hover:text-purple-700 font-medium py-2 px-4 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                      >
                        Scopri di Più
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Come Funziona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Il processo è semplice e divertente! Ecco come funziona la nostra scatola misteriosa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Scegli la Scatola</h3>
              <p className="text-gray-600">
                Seleziona la scatola misteriosa che preferisci e aggiungila al carrello.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Escludi le Maglie</h3>
              <p className="text-gray-600">
                Puoi escludere fino a 5 maglie che non vuoi ricevere nella tua scatola.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ricevi la Sorpresa</h3>
              <p className="text-gray-600">
                Ricevi la tua scatola misteriosa con una maglia a sorpresa di qualità premium!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto per l'Avventura?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di clienti che hanno già scoperto la magia delle nostre scatole misteriose!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Esplora Tutti i Prodotti
          </Link>
        </div>
      </div>
    </div>
  );
} 