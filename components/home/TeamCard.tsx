'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Team } from "@/lib/types/home";
import { Button } from "@/components/ui/button";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  const handleShopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(team.href);
  };

  return (
    <div 
      className="relative mx-2 sm:mx-3 md:mx-4 min-w-[140px] sm:min-w-[160px] md:min-w-[180px] h-[180px] sm:h-[200px] md:h-[220px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      {/* Front of Card */}
      <div className={`absolute inset-0 overflow-hidden rounded-xl shadow-md bg-gradient-to-br ${team.bgGradient} border border-white/20 transition-opacity duration-700 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        {/* Football Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 w-6 h-6 border border-current rounded-full"></div>
          <div className="absolute bottom-3 left-2 w-3 h-3 border border-current rounded-full"></div>
          <div className="absolute top-1/2 right-3 w-1.5 h-1.5 bg-current rounded-full"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6">
          {/* Team Logo */}
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 mb-3 sm:mb-4 transition-transform duration-300">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-sm transition-all duration-300"></div>
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 640px) 56px, (max-width: 768px) 72px, 80px"
            />
          </div>

          {/* Team Name */}
          <h3 className={`font-bold text-white text-sm sm:text-base md:text-lg mb-1 transition-colors duration-300 drop-shadow-lg`}>
            {team.name}
          </h3>

          {/* Team Nickname */}
          <p className={`text-xs sm:text-sm ${team.textColor} font-medium opacity-80 transition-opacity duration-300`}>
            {team.nickname}
          </p>

          {/* Corner Accent */}
          <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${team.borderColor} opacity-40 transition-opacity duration-300`}></div>
        </div>
      </div>

      {/* Back of Card */}
      <div className={`absolute inset-0 overflow-hidden rounded-xl shadow-md bg-gradient-to-br from-[#0e1924] via-[#1a2a3a] to-[#0e1924] border border-[#f5963c]/30 transition-opacity duration-700 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
        {/* Dark Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5963c]/5 to-transparent"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 right-3 w-4 h-4 border border-[#f5963c]/30 rounded"></div>
          <div className="absolute bottom-4 left-3 w-3 h-3 border border-[#f5963c]/30 rounded"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6">
          {/* Team Logo (Smaller on back) */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 opacity-60">
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
            />
          </div>

          {/* Shop Now Button */}
          <Button 
            variant="orange" 
            onClick={handleShopClick}
            className="relative z-20 cursor-pointer"
          >
            Shop Now
          </Button>

          {/* Team Name (Small) */}
          <p className="text-white/60 text-xs sm:text-sm mt-3 font-medium">
            {team.name} Collection
          </p>
        </div>
      </div>
    </div>
  );
} 