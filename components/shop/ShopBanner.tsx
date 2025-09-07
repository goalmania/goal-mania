import { useI18n } from "@/lib/hooks/useI18n";
import { ArrowRight } from "lucide-react";
import React from "react";
import StatsSection from "./StatsSection";

// Define the type for the component props
interface ShopBannerProps {
  title?: string;
  subtitle?: string;
  buttons: { text: string; href: string }[];
  imageUrl?: string;
  className?: string;
}

export default function ShopBanner({
  title,
  subtitle,
  buttons,
  imageUrl,
  className,
}: ShopBannerProps) {
  const containerClasses = `relative overflow-hidden w-full min-h-screen flex  items-end lg:items-center  ${
  // const containerClasses = `relative overflow-hidden w-full min-h-[580px] lg:min-h-[600px] flex  items-end lg:items-center  ${
    className || ""
  }`;

  const { t } = useI18n();

  return (
    <div className={containerClasses}>
      {/* Background Image with Overlay */}
      {/* MOBIE */}

      <div className="absolute lg:hidden inset-0">
        <img
          src={imageUrl}
           alt={t('shop.banner1.alt', 'Retro Collection')}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute lg:hidden inset-0">
        <img
          src={`/images/recentUpdate/home-overlay.png`}
          alt="Banner Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* DESKTOP */}
      <div className="absolute hidden lg:block inset-0">
        <img
          src={`/images/recentUpdate/shop-desktop-overlay.png`}
         alt={t('shop.banner1.alt', 'Retro Collection')}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 pb-35 lg:pb-10 flex flex-col items-center   text-center  lg:items-start lg:text-left max-w-4xl w-full px-3 md:px-8 lg:px-20 ">
        {/* Title */}
        <h1 className="text-white text-3xl max-w-md lg:max-w-xl  px-10 sm:px-0 md:text-5xl  font-bold mb-4 font-sans">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 text-base md:text-lg lg:text-xl font-light mb-8 max-w-2xl">
          {subtitle}
        </p>

        {/* Buttons */}
        {buttons && buttons.length > 0 && (
          <div className="flex  items-start space-y-4 gap-2 lg:max-w-md  sm:space-y-0 sm:space-x-4">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                className="lg:py-3 lg:px-6 px-3 py-1.5   rounded-full text-[#0A1A2F] font-semibold transition-all duration-300 bg-[#FF7A00] ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none whitespace-nowrap text-xs md:text-base"
            
              >
                {button.text}

              <ArrowRight  className="text-[#0A1A2F] text-sm lg:text-lg w-3 lg:w-5 ml-2 inline-flex lg:ml-4 " />

              </a>

            ))}
          </div>
        )}
      </div>


      <StatsSection />
    </div>
  );
}
