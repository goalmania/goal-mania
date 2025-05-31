"use client";

import { useState, useEffect } from "react";

interface TeamRanking {
  position: number;
  team: string;
  teamId: number;
  logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export default function LeagueTestPage() {
  const [league, setLeague] = useState<string>("39"); // Default to Premier League
  const [rankings, setRankings] = useState<TeamRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available leagues with their IDs
  const leagues = [
    { id: "39", name: "Premier League (PL)" },
    { id: "140", name: "La Liga (PD)" },
    { id: "78", name: "Bundesliga (BL1)" },
    { id: "61", name: "Ligue 1 (FL1)" },
    { id: "135", name: "Serie A (SA)" },
  ];

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // API call to fetch standings
        const response = await fetch(
          `/api/football/standings?league=${league}&season=2023`
        );

        if (!response.ok) {
          throw new Error(`Error fetching standings: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to our format
        if (data && data.response && data.response[0]?.league?.standings?.[0]) {
          const apiStandings = data.response[0].league.standings[0];

          const formattedRankings = apiStandings.map((standing: any) => ({
            position: standing.rank,
            team: standing.team.name,
            teamId: standing.team.id,
            logo: standing.team.logo,
            played: standing.all.played,
            won: standing.all.win,
            drawn: standing.all.draw,
            lost: standing.all.lose,
            goalsFor: standing.all.goals.for,
            goalsAgainst: standing.all.goals.against,
            goalDifference: standing.goalsDiff,
            points: standing.points,
          }));

          setRankings(formattedRankings);
        } else {
          setError("API response not in expected format.");
        }
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(
          `Failed to load rankings: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [league]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">League Standings Test</h1>

      <div className="mb-4">
        <label htmlFor="league-select" className="mr-2">
          Select League:
        </label>
        <select
          id="league-select"
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="select select-bordered"
        >
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="loading loading-spinner loading-md"></div>}

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>Played</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((team) => (
                <tr key={team.teamId}>
                  <td>{team.position}</td>
                  <td>
                    <div className="flex items-center">
                      {team.logo && (
                        <img
                          src={team.logo}
                          alt={`${team.team} logo`}
                          className="w-6 h-6 mr-2"
                        />
                      )}
                      {team.team}
                    </div>
                  </td>
                  <td>{team.played}</td>
                  <td>{team.won}</td>
                  <td>{team.drawn}</td>
                  <td>{team.lost}</td>
                  <td>{team.goalsFor}</td>
                  <td>{team.goalsAgainst}</td>
                  <td>{team.goalDifference}</td>
                  <td className="font-bold">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
