"use client";

import { StarIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/hooks/useI18n";

export default function GuaranteesSection() {
  const { t } = useI18n();

  // Guarantees data
  const guarantees = [
    {
      icon: TruckIcon,
      title: t('guarantees.freeShipping.title'),
      description: t('guarantees.freeShipping.description')
    },
    {
      icon: ShieldCheckIcon,
      title: t('guarantees.quality.title'),
      description: t('guarantees.quality.description')
    },
    {
      icon: ArrowPathIcon,
      title: t('guarantees.returns.title'),
      description: t('guarantees.returns.description')
    },
    {
      icon: StarIcon,
      title: t('guarantees.rating.title'),
      description: t('guarantees.rating.description')
    }
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#0e1924] mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          {t('guarantees.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {guarantees.map((guarantee, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-[#f5963c] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <guarantee.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="font-semibold text-[#0e1924] mb-2 text-sm sm:text-base md:text-lg">
                {guarantee.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                {guarantee.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 