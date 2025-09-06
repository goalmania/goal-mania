import { useI18n } from "@/lib/hooks/useI18n";
import { ArrowRight } from "lucide-react";
import React from "react";

// Define the type for the component props
interface HeroBannerProps {
  className?: string;
}

export default function ContactBanner({

  className,
}: HeroBannerProps) {
  const containerClasses = `relative overflow-hidden w-full min-h-[510px] lg:min-h-[580px] flex items-end lg:items-center p-4 md:p-8 lg:pl-14 ${
    className || ""
  }`;

  const { t } = useI18n();

  return (
    <div className={containerClasses}>
      {/* Background Image with Overlay */}
      {/* MOBIE */}

      <div className="absolute lg:hidden inset-0">
        <img
          src={'/images/recentUpdate/contact-main.png'}
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

      {/* Content Wrapper */}
      <div className="relative z-10  flex flex-col items-center   text-center  lg:items-start lg:text-left max-w-4xl w-full  ">
        {/* Title */}
        <h1 className="text-white text-3xl max-w-md lg:max-w-xl  px-10 sm:px-0 md:text-5xl  font-bold mb-4 font-sans">
          Scrivici
        </h1>

        {/* Subtitle */}
        <p className="text-gray-200 text-base md:text-lg lg:text-xl font-light mb-8 max-w-2xl">
          Scrivici Hai una domanda, un suggerimento o semplicemente vuoi
          salutarci? Compila il modulo qui sotto e il nostro team ti risponderà
          al più presto siamo qui per aiutarti!
        </p>
      </div>
    </div>
  );
}
