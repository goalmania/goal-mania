// src/components/FeatureCards.tsx
import React from 'react';
import { ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

// Define a type for your feature card data
interface Feature {
  id: number;
  icon: React.ReactNode;
  label: string;
  description: string;
}

// Sample data for the features
const features: Feature[] = [
  {
    id: 1,
    icon: <ShieldCheck size={36} />,
    label: '1 Years',
    description: 'Warranty',
  },
  {
    id: 2,
    icon: <Truck size={36} />,
    label: 'Free Express',
    description: 'Delivery',
  },
  {
    id: 3,
    icon: <RotateCcw size={36} />,
    label: '7-Day',
    description: 'Replacement',
  },
  {
    id: 4,
    icon: <CreditCard size={36} />,
    label: '100% Secure',
    description: 'Payments',
  },
];

const FeatureCards: React.FC = () => {
  return (
    <section className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center space-x-4 md:flex-col md:text-center md:space-x-0 md:space-y-2 p-4"
            >
              <div className="text-gray-500 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">
                  {feature.label}
                </p>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;