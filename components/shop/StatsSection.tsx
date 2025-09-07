// src/components/StatsSection.tsx
import React from 'react';

// Define a type for your stat data
interface Stat {
  id: number;
  number: string;
  label: string;
  description: string;
}

// Sample data for the statistics
const stats: Stat[] = [
  {
    id: 1,
    number: '1,200+',
    label: 'Clienti Felici',
    description: 'La nostra più grande soddisfazione.',
  },
  {
    id: 2,
    number: '1,200+',
    label: 'Scelta',
    description: 'Ogni acquisto conta.',
  },
  {
    id: 3,
    number: '1,200+',
    label: 'Esperienze',
    description: 'Positive e memorabili.',
  },
];

const StatsSection: React.FC = () => {
  return (
    <section className="bg-[#0A1A2F] text-white py-6  mt-10 absolute w-full bottom-0 hidden lg:block z-10 ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:divide-x divide-white">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center px-4">
              <p className="text-3xl font-extrabold mb-2">
                {stat.number} <span className="text-xl  font-normal ml-2">{stat.label}</span>
              </p>
              <p className="text-lg text-gray-400">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;