"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const players = [
    {
      id: 1,
      name: "Lautaro Martinez",
      matches: 33,
      club: "Inter",
      score: 24,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Dusan Vlahovic",
      matches: 33,
      club: "Inter",
      score: 16,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Olivier Giroud",
      matches: 33,
      club: "Inter",
      score: 15,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Marcus Rashford",
      matches: 33,
      club: "Inter",
      score: 18,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face",
    },
    {
      id: 5,
      name: "Erling Haaland",
      matches: 33,
      club: "Inter",
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
    <div className="w-full max-w-4xl mx-auto p-6 font-munish">
      <div className="relative">
        {/* Player Cards Container */}
        <div className="flex gap-4 overflow-hidden">
          {visiblePlayers.map((player, index) => (
            <div
              key={player.id}
              className="flex-1 bg-[#0A1A2F] rounded-xl p-4 text-white relative overflow-hidden w-[555px] h-[140px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className=" space-y-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden ">
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
                    <p className=" text-xs leading-tight">
                      {player.matches} Matches • {player.club}
                    </p>
                  </div>
                </div>
                <div className=" flex items-center gap-1 text-[14px]">
                  <div className=" bg-orange-500 text-white  font-semibold h-3 w-3 rounded-full  text-center"></div>
                  <span>{player.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

export default Slider;
