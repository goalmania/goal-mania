"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface BannerBlockProps {
  imageSrc: string;
  ctaHref: string;
  className?: string;
}

export default function BannerBlock({ imageSrc, ctaHref, className }: BannerBlockProps) {
  const { t } = useTranslation();
  return (
    <div className={cn(`rounded-2xl overflow-hidden shadow-xl bg-white/90 flex flex-col items-center p-4 md:p-8`, className)}>
      <div className="w-full flex justify-center relative">
        <Image
          src={imageSrc}
          alt={t('banners.alt')}
          width={600}
          height={320}
          className="rounded-xl object-cover w-full h-auto max-h-64"
          priority
        />
        <Button
          asChild
          size="lg"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#f5963c] hover:bg-[#e0852e] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 z-10"
        >
          <Link href={ctaHref}>{t('banners.cta')}</Link>
        </Button>
      </div>
    </div>
  );
} 