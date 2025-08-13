"use client";
import Link from "next/link";
import { AuroraText } from "../magicui/aurora-text";
import { useI18n } from "@/lib/hooks/useI18n";
import BannerBlock from "./BannerBlock";

export default function HeroSection() {
  const { t } = useI18n();
  return (
    <section className="relative h-screen bg-[#0e1924] text-white flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-6xl text-center flex flex-col items-center">
        <h1 className="mb-3">
          <span className="block text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(14,25,36,0.15)]">
            <span className="inline-block align-middle">
              <AuroraText colors={["#f5963c", "#ff7433"]} className="[&>*]:!bg-clip-text [&>*]:!text-transparent">
                {t('hero.title')}
              </AuroraText>
            </span>
          </span>
          <span className="block mt-2 text-sm md:text-lg font-medium text-white/80">
            {t('hero.subtitle')}
          </span>
        </h1>
        {/* Larger BannerBlock(s) for CTA below hero text */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-8">
          <BannerBlock imageSrc="/banners/banner_1.jpeg" ctaHref="/shop" className="max-w-md w-full bg-transparent shadow-none" />
          <BannerBlock imageSrc="/banners/banner_2.jpeg" ctaHref="/shop" className="max-w-md w-full bg-transparent shadow-none" />
        </div>
      </div>
    </section>
  );
} 