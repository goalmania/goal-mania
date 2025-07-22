"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { AuroraText } from "../magicui/aurora-text";
import clsx from "clsx";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-screen bg-gradient-to-br from-[#0e1924] via-[#0e1924] to-[#1a2a3a] text-white overflow-hidden min-h-[60vh] flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/banners/banner_1.jpeg')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 animate-gradient-move bg-gradient-to-tr from-[#0e1924]/80 via-[#f5963c]/30 to-[#0e1924]/80 opacity-60 mix-blend-lighten pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <div className="max-w-3xl w-full text-center flex flex-col items-center px-4 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 bg-transparent">
          <h1 className="mb-4 sm:mb-6">
            <span className="block text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_4px_24px_rgba(14,25,36,0.25)]">
              {/* Minimal aurora effect, just for accent */}
              <span className="inline-block align-middle">
                <AuroraText colors={["#f5963c", "#ff7433"]} className="[&>*]:!bg-clip-text [&>*]:!text-transparent">
                  Maglie attuali
                </AuroraText>
              </span>
              <span className="block mt-1 text-white">e retrò a partire da 30€</span>
            </span>
            <span className="block mt-4 text-base md:text-xl lg:text-2xl font-medium text-white/80">
              Spedizione sempre gratuita, qualità garantita.
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4 mt-2">
            <Button
              asChild
              size="lg"
              className={clsx(
                "bg-[#f5963c] hover:bg-[#e0852e] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg shadow-lg transition-transform duration-300 ease-in-out",
                "hover:scale-105 hover:shadow-xl focus:scale-105 focus:shadow-xl"
              )}
            >
              <Link href="/shop">
                Scopri le Maglie
                <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-primary hover:bg-white hover:text-[#0e1924] px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-300"
            >
              <Link href="/shop/serieA">Serie A</Link>
            </Button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
} 