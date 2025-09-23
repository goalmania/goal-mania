// src/components/FeatureCards.tsx
"use client";
import React from "react";
import { ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Feature {
  id: number;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const FeaturesCardStats: React.FC = () => {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      id: 1,
      icon: <ShieldCheck size={36} strokeWidth={1} />,
      label: t("keyFeatures.warranty.title"),
      description: t("keyFeatures.warranty.subtitle"),
    },
    {
      id: 2,
      icon: <Truck size={36} strokeWidth={1} />,
      label: t("keyFeatures.delivery.title"),
      description: t("keyFeatures.delivery.subtitle"),
    },
    {
      id: 3,
      icon: <RotateCcw size={36} strokeWidth={1} />,
      label: t("keyFeatures.replacement.title"),
      description: t("keyFeatures.replacement.subtitle"),
    },
    {
      id: 4,
      icon: <CreditCard size={36} strokeWidth={1} />,
      label: t("keyFeatures.payments.title"),
      description: t("keyFeatures.payments.subtitle"),
    },
  ];

  return (
    <section className="bg-[#F5F5F5] text-black font-munish md:py-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex md:flex-row flex-col items-center md:gap-3 justify-center border border-gray-300 md:border-none p-6 text-center"
            >
              <div className="text-black mb-2">{feature.icon}</div>
              <div className="md:text-left text-center">
                <p className="text-lg font-semibold text-gray-800">
                  {feature.label}
                </p>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesCardStats;
