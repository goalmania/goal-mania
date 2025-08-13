"use client";

import { useEffect, useState } from "react";

interface TeamRanking {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  teamId?: number;
  logo?: string;
}

interface LeagueRankingsProps {
  league: "premierLeague" | "laliga" | "bundesliga" | "ligue1" | "serieA";
}

// Map our league identifiers to API league IDs
const leagueApiIds = {
  premierLeague: "PL", // Premier League
  laliga: "PD", // La Liga
  bundesliga: "BL1", // Bundesliga
  ligue1: "FL1", // Ligue 1
  serieA: "SA", // Serie A
};

// League display names and colors
const leagueConfig = {
  premierLeague: {
    name: "Premier League",
    primaryColor: "#37003c",
    accentColor: "#00ff85",
    gradient: "from-purple-900 via-purple-800 to-purple-700"
  },
  laliga: {
    name: "La Liga",
    primaryColor: "#ff6b35",
    accentColor: "#f7931e",
    gradient: "from-orange-600 via-red-500 to-orange-400"
  },
  bundesliga: {
    name: "Bundesliga",
    primaryColor: "#d20515",
    accentColor: "#ffffff",
    gradient: "from-red-600 via-red-500 to-red-400"
  },
  ligue1: {
    name: "Ligue 1",
    primaryColor: "#091c3e",
    accentColor: "#ffffff",
    gradient: "from-blue-900 via-blue-800 to-blue-700"
  },
  serieA: {
    name: "Serie A",
    primaryColor: "#0e1924",
    accentColor: "#f5963c",
    gradient: "from-blue-900 via-blue-800 to-orange-500"
  },
};

// Current season
const CURRENT_SEASON = "2024";

export function LeagueRankings({ league }: LeagueRankingsProps) {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "cache" | "fallback">(
    "api"
  );

  useEffect(() => {
    const fetchRankings = async (retryCount = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const leagueId = leagueApiIds[league];

        // API call to fetch standings
        const response = await fetch(
          `/api/football/standings?league=${leagueId}&season=${CURRENT_SEASON}`
        );

        // Check if data is from stale cache
        const source = response.headers.get("X-Data-Source");
        if (source === "stale-cache") {
          setDataSource("cache");
        }

        if (!response.ok) {
          if (response.status === 429 && retryCount < 2) {
            // Rate limited - wait and retry with exponential backoff
            const delay = Math.pow(2, retryCount) * 2000;
            console.log(`Rate limited, retrying in ${delay}ms...`);
            setTimeout(() => fetchRankings(retryCount + 1), delay);
            return;
          }
          throw new Error(`Error fetching standings: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to our format
        if (data && data.standings && data.standings[0]?.table) {
          const apiStandings = data.standings[0].table;

          const formattedRankings = apiStandings.map((standing: any) => ({
            position: standing.position,
            team: standing.team.name,
            teamId: standing.team.id,
            logo: standing.team.crest,
            played: standing.playedGames,
            won: standing.won,
            drawn: standing.draw,
            lost: standing.lost,
            goalsFor: standing.goalsFor,
            goalsAgainst: standing.goalsAgainst,
            goalDifference: standing.goalDifference,
            points: standing.points,
          }));

          setRankings(formattedRankings);
          setDataSource("api");
        } else {
          // Fallback to mock data if API response is not in expected format
          console.warn(
            "API response not in expected format, using fallback data"
          );
          const mockRankings = getMockRankings(league);
          setRankings(mockRankings);
          setDataSource("fallback");
          setError("API data format unexpected. Using fallback data.");
        }
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError("Failed to load rankings. Using fallback data.");
        // Fallback to mock data on error
        const mockRankings = getMockRankings(league);
        setRankings(mockRankings);
        setDataSource("fallback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [league]);

  const config = leagueConfig[league];

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <div className="relative">
          <div className="h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg mb-6 animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-xl animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="w-6 h-6 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && rankings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-2xl p-6 shadow-2xl">
        <p className="text-red-100 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-gray-700/50">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      
            {/* Header */}
      <div className="relative p-4 sm:p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              {config.name} Rankings
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">Season {CURRENT_SEASON}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${config.gradient}`}></div>
            <span className="text-white font-semibold text-sm sm:text-base">LIVE</span>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
          {error && (
            <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 bg-amber-900/50 rounded-full border border-amber-500/30">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-300 text-xs">{error}</span>
            </div>
          )}
          {dataSource === "cache" && (
            <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 bg-blue-900/50 rounded-full border border-blue-500/30">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300 text-xs">Cached Data</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="relative p-3 sm:p-4 md:p-6">
        <div className="overflow-x-auto">
          <div className="max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] lg:max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                <tr className="text-left text-xs text-gray-400 border-b border-gray-700/50">
                  <th className="py-2 sm:py-3 px-1 sm:px-2 font-semibold">POS</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 font-semibold">TEAM</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold hidden sm:table-cell">P</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold">W</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold">D</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold">L</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold hidden md:table-cell">GD</th>
                  <th className="py-2 sm:py-3 px-1 sm:px-2 text-center font-semibold">PTS</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {rankings.map((team, index) => {
                  const isTop4 = team.position <= 4;
                  const isRelegation = team.position >= rankings.length - 3;
                  
                  return (
                    <tr
                      key={team.teamId || team.team}
                      className={`group transition-all duration-300 hover:bg-white/5 border-b border-gray-800/50 ${
                        isTop4 ? 'bg-gradient-to-r from-green-900/20 to-green-800/10' : ''
                      } ${
                        isRelegation ? 'bg-gradient-to-r from-red-900/20 to-red-800/10' : ''
                      }`}
                    >
                      <td className="py-3 sm:py-4 px-1 sm:px-2">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                          team.position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                          team.position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-black' :
                          team.position === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                          isTop4 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                          isRelegation ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                          'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                        }`}>
                          {team.position}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {team.logo && (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                              <img
                                src={team.logo}
                                alt={`${team.team} logo`}
                                className="w-4 h-4 sm:w-6 sm:h-6 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-white group-hover:text-gray-200 transition-colors text-sm sm:text-base truncate block">
                              {team.team}
                            </span>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                isTop4 ? 'bg-green-400' : isRelegation ? 'bg-red-400' : 'bg-gray-400'
                              }`}></div>
                              <span className="text-xs text-gray-400 hidden sm:block">
                                {isTop4 ? 'Champions League' : isRelegation ? 'Relegation Zone' : 'Mid Table'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center font-medium hidden sm:table-cell">{team.played}</td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                        <span className="bg-green-500/20 text-green-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                          {team.won}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                        <span className="bg-gray-500/20 text-gray-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                          {team.drawn}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                        <span className="bg-red-500/20 text-red-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                          {team.lost}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center hidden md:table-cell">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          team.goalDifference > 0 ? 'bg-green-500/20 text-green-300' :
                          team.goalDifference < 0 ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-1 sm:px-2 text-center">
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                          {team.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer with stats */}
      <div className="relative p-3 sm:p-4 bg-gray-800/30 border-t border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-400 space-y-2 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">Champions League</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Relegation</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs">Updated: {new Date().toLocaleTimeString()}</p>
            <p className="text-xs">Source: {dataSource === 'api' ? 'Live API' : dataSource === 'cache' ? 'Cached' : 'Fallback'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data function as fallback
function getMockRankings(league: string): TeamRanking[] {
  switch (league) {
    case "premierLeague":
      return [
        {
          position: 1,
          team: "Manchester City",
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 25,
          goalsAgainst: 8,
          goalDifference: 17,
          points: 25,
        },
        {
          position: 2,
          team: "Liverpool",
          played: 10,
          won: 7,
          drawn: 2,
          lost: 1,
          goalsFor: 22,
          goalsAgainst: 9,
          goalDifference: 13,
          points: 23,
        },
        {
          position: 3,
          team: "Arsenal",
          played: 10,
          won: 7,
          drawn: 1,
          lost: 2,
          goalsFor: 19,
          goalsAgainst: 8,
          goalDifference: 11,
          points: 22,
        },
        {
          position: 4,
          team: "Chelsea",
          played: 10,
          won: 6,
          drawn: 2,
          lost: 2,
          goalsFor: 18,
          goalsAgainst: 10,
          goalDifference: 8,
          points: 20,
        },
        {
          position: 5,
          team: "Tottenham",
          played: 10,
          won: 5,
          drawn: 3,
          lost: 2,
          goalsFor: 17,
          goalsAgainst: 12,
          goalDifference: 5,
          points: 18,
        },
        {
          position: 6,
          team: "Manchester United",
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 14,
          goalsAgainst: 12,
          goalDifference: 2,
          points: 17,
        },
        {
          position: 7,
          team: "Newcastle",
          played: 10,
          won: 4,
          drawn: 4,
          lost: 2,
          goalsFor: 16,
          goalsAgainst: 11,
          goalDifference: 5,
          points: 16,
        },
        {
          position: 8,
          team: "Brighton",
          played: 10,
          won: 4,
          drawn: 3,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 14,
          goalDifference: 1,
          points: 15,
        },
      ];
    case "laliga":
      return [
        {
          position: 1,
          team: "Real Madrid",
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 24,
          goalsAgainst: 7,
          goalDifference: 17,
          points: 25,
        },
        {
          position: 2,
          team: "Barcelona",
          played: 10,
          won: 7,
          drawn: 2,
          lost: 1,
          goalsFor: 25,
          goalsAgainst: 10,
          goalDifference: 15,
          points: 23,
        },
        {
          position: 3,
          team: "Atlético Madrid",
          played: 10,
          won: 6,
          drawn: 3,
          lost: 1,
          goalsFor: 18,
          goalsAgainst: 8,
          goalDifference: 10,
          points: 21,
        },
        {
          position: 4,
          team: "Girona",
          played: 10,
          won: 6,
          drawn: 1,
          lost: 3,
          goalsFor: 19,
          goalsAgainst: 13,
          goalDifference: 6,
          points: 19,
        },
        {
          position: 5,
          team: "Athletic Bilbao",
          played: 10,
          won: 5,
          drawn: 3,
          lost: 2,
          goalsFor: 16,
          goalsAgainst: 10,
          goalDifference: 6,
          points: 18,
        },
        {
          position: 6,
          team: "Real Sociedad",
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 12,
          goalDifference: 3,
          points: 17,
        },
        {
          position: 7,
          team: "Real Betis",
          played: 10,
          won: 4,
          drawn: 4,
          lost: 2,
          goalsFor: 14,
          goalsAgainst: 11,
          goalDifference: 3,
          points: 16,
        },
        {
          position: 8,
          team: "Valencia",
          played: 10,
          won: 4,
          drawn: 2,
          lost: 4,
          goalsFor: 13,
          goalsAgainst: 13,
          goalDifference: 0,
          points: 14,
        },
      ];
    case "bundesliga":
      return [
        {
          position: 1,
          team: "Bayern Munich",
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 30,
          goalsAgainst: 9,
          goalDifference: 21,
          points: 25,
        },
        {
          position: 2,
          team: "Bayer Leverkusen",
          played: 10,
          won: 8,
          drawn: 0,
          lost: 2,
          goalsFor: 26,
          goalsAgainst: 10,
          goalDifference: 16,
          points: 24,
        },
        {
          position: 3,
          team: "RB Leipzig",
          played: 10,
          won: 7,
          drawn: 1,
          lost: 2,
          goalsFor: 22,
          goalsAgainst: 9,
          goalDifference: 13,
          points: 22,
        },
        {
          position: 4,
          team: "Borussia Dortmund",
          played: 10,
          won: 6,
          drawn: 2,
          lost: 2,
          goalsFor: 20,
          goalsAgainst: 12,
          goalDifference: 8,
          points: 20,
        },
        {
          position: 5,
          team: "VfB Stuttgart",
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 18,
          goalsAgainst: 13,
          goalDifference: 5,
          points: 17,
        },
        {
          position: 6,
          team: "Eintracht Frankfurt",
          played: 10,
          won: 4,
          drawn: 4,
          lost: 2,
          goalsFor: 16,
          goalsAgainst: 12,
          goalDifference: 4,
          points: 16,
        },
        {
          position: 7,
          team: "Wolfsburg",
          played: 10,
          won: 4,
          drawn: 3,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 14,
          goalDifference: 1,
          points: 15,
        },
        {
          position: 8,
          team: "Freiburg",
          played: 10,
          won: 4,
          drawn: 2,
          lost: 4,
          goalsFor: 14,
          goalsAgainst: 15,
          goalDifference: -1,
          points: 14,
        },
      ];
    case "ligue1":
      return [
        {
          position: 1,
          team: "PSG",
          played: 10,
          won: 7,
          drawn: 3,
          lost: 0,
          goalsFor: 26,
          goalsAgainst: 8,
          goalDifference: 18,
          points: 24,
        },
        {
          position: 2,
          team: "Monaco",
          played: 10,
          won: 7,
          drawn: 1,
          lost: 2,
          goalsFor: 22,
          goalsAgainst: 11,
          goalDifference: 11,
          points: 22,
        },
        {
          position: 3,
          team: "Marseille",
          played: 10,
          won: 6,
          drawn: 2,
          lost: 2,
          goalsFor: 19,
          goalsAgainst: 9,
          goalDifference: 10,
          points: 20,
        },
        {
          position: 4,
          team: "Lille",
          played: 10,
          won: 5,
          drawn: 3,
          lost: 2,
          goalsFor: 16,
          goalsAgainst: 10,
          goalDifference: 6,
          points: 18,
        },
        {
          position: 5,
          team: "Nice",
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 11,
          goalDifference: 4,
          points: 17,
        },
        {
          position: 6,
          team: "Lyon",
          played: 10,
          won: 4,
          drawn: 3,
          lost: 3,
          goalsFor: 14,
          goalsAgainst: 12,
          goalDifference: 2,
          points: 15,
        },
        {
          position: 7,
          team: "Rennes",
          played: 10,
          won: 3,
          drawn: 5,
          lost: 2,
          goalsFor: 13,
          goalsAgainst: 11,
          goalDifference: 2,
          points: 14,
        },
        {
          position: 8,
          team: "Lens",
          played: 10,
          won: 3,
          drawn: 4,
          lost: 3,
          goalsFor: 12,
          goalsAgainst: 12,
          goalDifference: 0,
          points: 13,
        },
      ];
    case "serieA":
      return [
        {
          position: 1,
          team: "Napoli",
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 25,
          goalsAgainst: 8,
          goalDifference: 17,
          points: 25,
        },
        {
          position: 2,
          team: "Inter Milan",
          played: 10,
          won: 7,
          drawn: 2,
          lost: 1,
          goalsFor: 22,
          goalsAgainst: 9,
          goalDifference: 13,
          points: 23,
        },
        {
          position: 3,
          team: "AC Milan",
          played: 10,
          won: 7,
          drawn: 1,
          lost: 2,
          goalsFor: 19,
          goalsAgainst: 8,
          goalDifference: 11,
          points: 22,
        },
        {
          position: 4,
          team: "Juventus",
          played: 10,
          won: 6,
          drawn: 2,
          lost: 2,
          goalsFor: 18,
          goalsAgainst: 10,
          goalDifference: 8,
          points: 20,
        },
        {
          position: 5,
          team: "Lazio",
          played: 10,
          won: 5,
          drawn: 3,
          lost: 2,
          goalsFor: 17,
          goalsAgainst: 12,
          goalDifference: 5,
          points: 18,
        },
        {
          position: 6,
          team: "Roma",
          played: 10,
          won: 5,
          drawn: 2,
          lost: 3,
          goalsFor: 14,
          goalsAgainst: 12,
          goalDifference: 2,
          points: 17,
        },
        {
          position: 7,
          team: "Atalanta",
          played: 10,
          won: 4,
          drawn: 4,
          lost: 2,
          goalsFor: 16,
          goalsAgainst: 11,
          goalDifference: 5,
          points: 16,
        },
        {
          position: 8,
          team: "Milan",
          played: 10,
          won: 4,
          drawn: 3,
          lost: 3,
          goalsFor: 15,
          goalsAgainst: 14,
          goalDifference: 1,
          points: 15,
        },
      ];
    default:
      return [];
  }
}
