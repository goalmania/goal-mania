"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const players = [
    {
      id: 1,
      name: "Lautaro Martinez",
      stats: "33 matches • 9 Inter",
      score: 24,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Dusan Vlahovic",
      stats: "30 games • 9 Juventus",
      score: 16,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Olivier Giroud",
      stats: "32 games • 4 AC Milan",
      score: 15,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Marcus Rashford",
      stats: "28 games • 7 Man United",
      score: 18,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Erling Haaland",
      stats: "25 games • 12 Man City",
      score: 22,
      avatar:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=60&h=60&fit=crop&crop=face",
    },
  ];

  const itemsPerView = 3;
  const maxIndex = Math.max(0, players.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const visiblePlayers = players.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="relative">
        {/* Player Cards Container */}
        <div className="flex gap-4 overflow-hidden">
          {visiblePlayers.map((player, index) => (
            <div
              key={player.id}
              className="flex-1 bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden min-w-0"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

              {/* Score badge */}
              <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded-full min-w-8 text-center">
                {player.score}
              </div>

              {/* Player info */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-700">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {player.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-tight">
                    {player.stats}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous players"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next players"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? "bg-slate-700" : "bg-slate-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
