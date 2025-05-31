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

// League display names
const leagueNames = {
  premierLeague: "Premier League",
  laliga: "La Liga",
  bundesliga: "Bundesliga",
  ligue1: "Ligue 1",
  serieA: "Serie A",
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-bold mb-4 text-black">
        Classifica {leagueNames[league]}
      </h3>
      {error && (
        <p className="text-xs text-amber-600 mb-2">
          {error} Showing available data.
        </p>
      )}
      {dataSource === "cache" && (
        <p className="text-xs text-blue-600 mb-2">
          Showing cached data due to API rate limiting.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-black">
          <thead>
            <tr className="text-left text-xs text-gray-700 border-b">
              <th className="py-2 px-1">#</th>
              <th className="py-2 px-1">Squadra</th>
              <th className="py-2 px-1 text-center">PG</th>
              <th className="py-2 px-1 text-center">V</th>
              <th className="py-2 px-1 text-center">P</th>
              <th className="py-2 px-1 text-center">S</th>
              <th className="py-2 px-1 text-center">DR</th>
              <th className="py-2 px-1 text-center">PT</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((team) => (
              <tr
                key={team.teamId || team.team}
                className="border-b border-gray-100 hover:bg-gray-50 text-black"
              >
                <td className="py-2 px-1 text-center">{team.position}</td>
                <td className="py-2 px-1">
                  <div className="flex items-center">
                    {team.logo && (
                      <img
                        src={team.logo}
                        alt={`${team.team} logo`}
                        className="w-4 h-4 mr-2"
                        onError={(e) => {
                          // Hide broken images
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span className="font-medium">{team.team}</span>
                  </div>
                </td>
                <td className="py-2 px-1 text-center">{team.played}</td>
                <td className="py-2 px-1 text-center">{team.won}</td>
                <td className="py-2 px-1 text-center">{team.drawn}</td>
                <td className="py-2 px-1 text-center">{team.lost}</td>
                <td className="py-2 px-1 text-center">{team.goalDifference}</td>
                <td className="py-2 px-1 text-center font-bold">
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
