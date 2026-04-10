import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import connectDB from "@/lib/db"; 
import Product from "@/lib/models/Product"; 

export const revalidate = 3600; // Revalidate every hour

const TEAM_THEMES: Record<string, string> = {
  nigeria: "group-hover:border-green-500",
  italy: "group-hover:border-blue-600",
  argentina: "group-hover:border-sky-400",
  brazil: "group-hover:border-yellow-400",
  france: "group-hover:border-blue-900",
  england: "group-hover:border-red-600",
  usa: "group-hover:border-blue-500",
  germany: "group-hover:border-gray-900",
  spain: "group-hover:border-red-500",
  portugal: "group-hover:border-red-700",
};

const ELITE_TEAMS = ["argentina", "france", "brazil", "italy", "germany", "spain", "england", "portugal", "nigeria"];

import { getFlagUrl } from "@/lib/utils/flags";

async function getRankedDbTeams() {
  const API_KEY = process.env.FOOTBALL_API;
  
  try {
    await connectDB();
    
    // 1. Get unique national teams from the Product collection 
    // We check both nationalTeam and country fields for compatibility
    const activeWorldCupTeams = await Product.distinct("nationalTeam", { 
      isWorldCup: true, 
      isActive: true 
    });

    // Fallback if nationalTeam is empty (in case it's only in 'country' field)
    if (!activeWorldCupTeams || activeWorldCupTeams.length === 0) {
      const byCountry = await Product.distinct("country", { 
        isWorldCup: true, 
        isActive: true 
      });
      activeWorldCupTeams.push(...byCountry.filter(c => !activeWorldCupTeams.includes(c)));
    }

    // Clean up strings to match API (lowercase)
    const availableTeamIds = activeWorldCupTeams
      .filter(Boolean)
      .map((name: any) => String(name).toLowerCase());

    const teamsMap = new Map();
    availableTeamIds.forEach(id => {
      teamsMap.set(id, {
        _id: id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        representativeImage: getFlagUrl(id),
        points: 0,
        goalDifference: 0,
        isFromApi: false
      });
    });

    // 2. Fetch live standings (optional, don't throw if fails)
    try {
      if (API_KEY) {
        const response = await fetch("https://api.football-data.org/v4/competitions/WC/standings", {
          headers: { "X-Auth-Token": API_KEY },
          next: { revalidate: 3600 },
        });

        if (response.ok) {
          const data = await response.json();
          // 3. Match API data with your DB teams
          data.standings.forEach((group: any) => {
            group.table.forEach((entry: any) => {
              const teamId = entry.team.name.toLowerCase();
              
              if (teamsMap.has(teamId)) {
                const existing = teamsMap.get(teamId);
                teamsMap.set(teamId, {
                  _id: teamId,
                  name: entry.team.name,
                  // Prioritize our reliable mapping, use API as fallback if mapping is placeholder
                  representativeImage: existing.representativeImage && !existing.representativeImage.includes('placeholder')
                    ? existing.representativeImage
                    : (entry.team.crest || getFlagUrl(teamId)),
                  points: entry.points,
                  goalDifference: entry.goalDifference,
                  isFromApi: true
                });
              }
            });
          });
        }
      }
    } catch (apiError) {
      console.warn("Football API fetch failed, using DB defaults:", apiError);
    }

    const rankedTeams = Array.from(teamsMap.values());

    // 4. Sort by Elite status first, then Tournament Points
    return rankedTeams.sort((a, b) => {
      const aIsElite = ELITE_TEAMS.includes(a._id);
      const bIsElite = ELITE_TEAMS.includes(b._id);
      if (aIsElite && !bIsElite) return -1;
      if (!aIsElite && bIsElite) return 1;
      return b.points - a.points || b.goalDifference - a.goalDifference;
    });
  } catch (error) {
    console.error("Database failure:", error);
    return [];
  }
}

export default async function WorldCupHub({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const teams = await getRankedDbTeams();
  
  const itemsPerPage = 12;
  const currentPage = Number((await searchParams).page) || 1;
  const totalPages = Math.ceil(teams.length / itemsPerPage);
  
  const paginatedTeams = teams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col items-start gap-2">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-600">
            Estate 2026
          </p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            Collezioni <span className="text-transparent [text-stroke:1px_black] [-webkit-text-stroke:1px_black]">Mondiali</span>
          </h1>
          <p className="max-w-xl mt-4 text-sm text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
            Seleziona la tua nazionale per scoprire i kit e il merchandising ufficiale.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {teams.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Nessun kit caricato nel database
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedTeams.map((team: any) => {
              const teamId = team._id;
              const accentBorder = TEAM_THEMES[teamId] || "group-hover:border-indigo-600";
              
              return (
                <Link 
                  key={teamId} 
                  href={`/shop/worldcup/${teamId}`}
                  className="group flex flex-col"
                >
                  <div className={`relative aspect-square overflow-hidden rounded-xl bg-gray-50 border-2 border-transparent transition-all duration-500 ${accentBorder}`}>
                    <div className="absolute inset-0 p-4 md:p-10 flex items-center justify-center">
                      <Image 
                        src={team.representativeImage || "/placeholder.jpg"}
                        alt={team.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="mt-4 flex items-center justify-between px-1">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-lg font-black italic uppercase tracking-tighter text-gray-900 truncate">
                        {team.name}
                      </h3>
                      <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Kit Disponibili
                      </p>
                    </div>
                    <div className="hidden sm:flex h-8 w-8 rounded-full border border-gray-100 items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shrink-0">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <Link
              href={`?page=${Math.max(1, currentPage - 1)}`}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 transition-all ${
                currentPage === 1 ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              Precedente
            </Link>
            <span className="text-xs font-black italic">
              {currentPage} / {totalPages}
            </span>
            <Link
              href={`?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 border-gray-900 transition-all ${
                currentPage === totalPages ? "opacity-20 pointer-events-none" : "hover:bg-gray-900 hover:text-white"
              }`}
            >
              Successivo
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
