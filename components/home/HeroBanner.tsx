import { useI18n } from "@/lib/hooks/useI18n";
import React from "react";

// Define the type for the component props
interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  buttons: { text: string; href: string }[];
  imageUrl?: string;
  className?: string;
}

export default function HeroBanner({
  title,
  subtitle,
  buttons,
  imageUrl,
  className,
}: HeroBannerProps) {
  const containerClasses = `relative overflow-hidden w-full min-h-[510px] lg:min-h-[580px] flex items-end lg:items-center p-4 md:p-8 ${
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
          alt={t("banners.alt")}
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
          src={`/images/recentUpdate/desktop-overlay.png`}
          alt="Banner Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10  flex flex-col items-center   text-center  lg:items-start lg:text-left max-w-4xl w-full  ">
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
          <div className="flex  items-start space-y-4 gap-2 sm:space-y-0 sm:space-x-4">
            {buttons.map((button, index) => (
              <a
                key={index}
                href={button.href}
                className="py-3 px-6 rounded-full text-[#0A1A2F] font-semibold transition-all duration-300 bg-[#FF7A00] ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none whitespace-nowrap text-xs md:text-lg"
            
              >
                {button.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
