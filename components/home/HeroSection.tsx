"use client";
import Link from "next/link";
import { AuroraText } from "../magicui/aurora-text";
import { useI18n } from "@/lib/hooks/useI18n";
import BannerBlock from "./BannerBlock";
import HeroBanner from "./HeroBanner";

export default function HeroSection() {
  const { t } = useI18n();
  const bannerData = {
    title: `${t('hero.title')}`,
    subtitle:
      `${t('hero.subtitle')}`,
    buttons: [
      { text: `${t('Latest News')}`, href: `news` },
      { text: `${t('Results')}`, href: `/risultati`},
      { text: "Shop Now", href: `/shop` },
    ],
    imageUrl: `/images/recentUpdate/home-banner.jpg`, // This uses the uploaded image
  };

  return (
    <section className="relative">
      <img
        src={`/images/recentUpdate/mobile-banner-logo.png`}
        alt="Banner Background"
        className="w-10 h-10 absolute  top-10 right-3 "
      />
      <HeroBanner
        title={bannerData.title}
        subtitle={bannerData.subtitle}
        buttons={bannerData.buttons}
        imageUrl={bannerData.imageUrl}
      />
    </section>
  );
}
