"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

interface Match {
  id: number;
  league: {
    name: string;
    logo: string;
    country: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  fixture: {
    date: string;
    status: {
      short: string;
      long: string;
    };
    venue: {
      name: string;
      city: string;
    };
  };
}

// Mock data for fallback
const mockMatches: Match[] = [
  {
    id: 1,
    league: {
      name: "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      country: "Italy",
    },
    teams: {
      home: {
        name: "Inter",
        logo: "https://media.api-sports.io/football/teams/505.png",
      },
      away: {
        name: "AC Milan",
        logo: "https://media.api-sports.io/football/teams/489.png",
      },
    },
    goals: {
      home: 2,
      away: 1,
    },
    fixture: {
      date: "2024-04-22T19:45:00+00:00",
      status: {
        short: "FT",
        long: "Match Finished",
      },
      venue: {
        name: "San Siro",
        city: "Milano",
      },
    },
  },
  {
    id: 2,
    league: {
      name: "Premier League",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      country: "England",
    },
    teams: {
      home: {
        name: "Manchester City",
        logo: "https://media.api-sports.io/football/teams/50.png",
      },
      away: {
        name: "Arsenal",
        logo: "https://media.api-sports.io/football/teams/42.png",
      },
    },
    goals: {
      home: 3,
      away: 1,
    },
    fixture: {
      date: "2024-04-23T19:00:00+00:00",
      status: {
        short: "FT",
        long: "Match Finished",
      },
      venue: {
        name: "Etihad Stadium",
        city: "Manchester",
      },
    },
  },
  {
    id: 3,
    league: {
      name: "La Liga",
      logo: "https://media.api-sports.io/football/leagues/140.png",
      country: "Spain",
    },
    teams: {
      home: {
        name: "Barcelona",
        logo: "https://media.api-sports.io/football/teams/529.png",
      },
      away: {
        name: "Real Madrid",
        logo: "https://media.api-sports.io/football/teams/541.png",
      },
    },
    goals: {
      home: 2,
      away: 3,
    },
    fixture: {
      date: "2024-04-21T19:00:00+00:00",
      status: {
        short: "FT",
        long: "Match Finished",
      },
      venue: {
        name: "Camp Nou",
        city: "Barcelona",
      },
    },
  },
];

export default function LiveFootballMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        // Attempt to fetch live matches from the API
        const response = await axios.get("/api/football/live-matches");

        if (
          response.data &&
          response.data.matches &&
          response.data.matches.length > 0
        ) {
          setMatches(response.data.matches);
        } else {
          // If no live matches, fallback to mock data
          setMatches(mockMatches);
        }
      } catch (err) {
        console.error("Error fetching live matches:", err);
        setError("Failed to load live matches. Using sample data instead.");
        // Use mock data as fallback
        setMatches(mockMatches);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 animate-pulse h-24 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-amber-800 bg-amber-50 rounded-md mb-4">
          {error}
        </div>
      )}

      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="bg-indigo-50 border-b border-indigo-100 text-indigo-800 px-4 py-2 text-sm flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative h-4 w-4 mr-2">
                <Image
                  src={match.league.logo}
                  alt={match.league.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              {match.league.name} - {match.league.country}
            </div>
            <div>
              {new Date(match.fixture.date).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative h-8 w-8">
                  <Image
                    src={match.teams.home.logo}
                    alt={match.teams.home.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="font-medium text-gray-800">
                  {match.teams.home.name}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {match.goals.home !== null ? match.goals.home : "-"}
                </span>
                <span className="text-xl text-gray-700">-</span>
                <span className="text-xl font-bold text-gray-900">
                  {match.goals.away !== null ? match.goals.away : "-"}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800 text-right">
                  {match.teams.away.name}
                </span>
                <div className="relative h-8 w-8">
                  <Image
                    src={match.teams.away.logo}
                    alt={match.teams.away.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-800">
                {match.fixture.status.short === "FT"
                  ? "Partita Terminata"
                  : match.fixture.status.short === "LIVE"
                  ? "In Diretta"
                  : match.fixture.status.short === "HT"
                  ? "Intervallo"
                  : "In Programma"}
              </span>
            </div>

            <div className="mt-2 text-xs text-gray-500 text-center">
              {match.fixture.venue.name}, {match.fixture.venue.city}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
