import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0e1924] via-[#0e1924] to-[#1a2a3a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/shop/shophome.jpg')] bg-cover bg-center opacity-20"></div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">
            Le Migliori{" "}
            <span className="text-[#f5963c]">Maglie da Calcio</span>
            <br className="hidden sm:block" />
            <span className="block sm:hidden">delle Squadre Italiane</span>
            <span className="hidden sm:block">delle Squadre Italiane</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Scopri la nostra collezione esclusiva di maglie autentiche. 
            Qualità premium, spedizione gratuita e garanzia 100%.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-4">
            <Button asChild size="lg" className="bg-[#f5963c] hover:bg-[#e0852e] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg">
              <Link href="/shop">
                Scopri le Maglie
                <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#0e1924] px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg">
              <Link href="/shop/serieA">
                Serie A
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 