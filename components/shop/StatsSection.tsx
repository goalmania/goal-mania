"use client"

import React, { useState, useEffect } from 'react';

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

// Custom hook to get window width
const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

const StatsSection: React.FC = () => {
  const width = useWindowWidth();
  const isDesktop = width >= 1024; // Tailwind's lg breakpoint is 1024px

  // Show 2 stats on mobile, all 3 on desktop
  const visibleStats = isDesktop ? stats : stats.slice(0, 2);

  return (
    <section className="lg:bg-[#0A1A2F] bg-[#F5F5F5] text-black text-left lg:text-white lg:px-20 py-6 mt-10 absolute w-full bottom-0 lg:block z-10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:divide-x divide-white">
        {visibleStats.map((stat) => (
          <div key={stat.id} className="text-left px-4">
            <p className="text-xl font-extrabold mb-2">
              {stat.number}{' '}
              <span className="text-sm font-normal ml-2">{stat.label}</span>
            </p>
            <p className="text-sm text-gray-400">{stat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
