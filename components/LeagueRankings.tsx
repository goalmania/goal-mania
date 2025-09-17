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

const leagueApiIds = {
  premierLeague: "PL",
  laliga: "PD",
  bundesliga: "BL1",
  ligue1: "FL1",
  serieA: "SA",
};

const CURRENT_SEASON = "2024";

export function LeagueRankings({ league }: LeagueRankingsProps) {
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async (retryCount = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/football/standings?league=${leagueApiIds[league]}&season=${CURRENT_SEASON}`
        );

        if (!response.ok) {
          if (response.status === 429 && retryCount < 2) {
            const delay = Math.pow(2, retryCount) * 2000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchRankings(retryCount + 1);
          }
          throw new Error(`Error fetching standings: ${response.status}`);
        }

        const data = await response.json();
        const apiStandings = data?.standings?.[0]?.table;

        if (apiStandings) {
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
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError("Failed to load rankings. Showing sample data.");
        setRankings(getMockRankings(league));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [league]);

  if (isLoading) {
    return (
      <div className="rounded-lg bg-gray-100 p-4">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && rankings.length === 0) {
    return (
      <div className="rounded-lg bg-red-100 p-4">
        <p className="text-center text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-[#F5F5F5] overflow-auto scrollbar-hide p-6 font-munish">
      <table className="w-full text-sm">
        <thead className="bg-[#0A1A2F] text-white font-light px-3">
          <tr>
            <th className="p-2 text-left font-light rounded-l-full pl-3">
              <span className="rounded-tl-full">POC</span>
            </th>
            <th className="p-2 text-left font-light">Squad</th>
            <th className="p-2 text-center font-light">PG</th>
            <th className="p-2 text-center font-light">W</th>
            <th className="p-2 text-center font-light">D</th>
            <th className="p-2 text-center font-light">L</th>
            <th className="p-2 text-center font-light">GF</th>
            <th className="p-2 text-center font-light">GS</th>
            <th className="p-2 text-center font-light">DR</th>
            <th className="p-2 text-center font-light rounded-r-full pr-3">
              Pti
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((team) => (
            <tr
              key={team.teamId || team.team}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="p-2 text-center text-[14px]">{team.position}</td>
              <td className="p-2 flex items-center space-x-2 text-[14px]">
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={`${team.team} logo`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <span className="truncate">{team.team}</span>
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.played}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.won}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.drawn}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.lost}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.goalsFor}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.goalsAgainst}
              </td>
              <td className="p-2 text-center text-[#848A90] text-[14px]">
                {team.goalDifference > 0
                  ? `+${team.goalDifference}`
                  : team.goalDifference}
              </td>
              <td className="p-2 text-center font-bold text-[14px]">
                {team.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          logo: "https://example.com/man-city.png",
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
          logo: "https://example.com/liverpool.png",
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
          logo: "https://example.com/arsenal.png",
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
          logo: "https://example.com/chelsea.png",
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
          logo: "https://example.com/tottenham.png",
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
          logo: "https://example.com/real-madrid.png",
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
          logo: "https://example.com/barcelona.png",
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
          logo: "https://example.com/atletico.png",
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
          logo: "https://example.com/girona.png",
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
          logo: "https://example.com/athletic.png",
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
          logo: "https://example.com/bayern.png",
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
          logo: "https://example.com/leverkusen.png",
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
          logo: "https://example.com/rb-leipzig.png",
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
          logo: "https://example.com/dortmund.png",
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
          logo: "https://example.com/stuttgart.png",
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
          logo: "https://example.com/psg.png",
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
          logo: "https://example.com/monaco.png",
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
          logo: "https://example.com/marseille.png",
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
          logo: "https://example.com/lille.png",
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
          logo: "https://example.com/nice.png",
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
          logo: "https://example.com/napoli.png",
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
          logo: "https://example.com/inter.png",
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
          logo: "https://example.com/ac-milan.png",
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
          logo: "https://example.com/juventus.png",
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
          logo: "https://example.com/lazio.png",
        },
      ];
    default:
      return [];
  }
}
