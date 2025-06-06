"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  getLiveMatches,
  getFixturesByDate,
} from "@/app/services/clientFootballApi";

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
    };
  };
}

// List of allowed competitions
const allowedCompetitions = [
  "Serie A",
  "Champions League",
  "Europa League",
  "Conference League",
  "Coppa Italia",
  "Premier League",
  "FA Cup",
  "Carabao Cup",
  "Supercoppa Europea",
  "EURO",
  "World Cup",
  "Club World Cup",
  "Ligue 1",
  "Coupe de France",
  "Supercoppa di Francia",
  "La Liga",
  "Coppa del Rey",
  "Supercoppa di Spagna",
  "Bundesliga",
  "DFB Pokal",
  "Supercoppa di Germania",
  "Eredivisie",
  "Coppa d'Olanda",
  "MLS",
  "Roshn Super League",
  "Serie B",
];

// Second divisions map
const secondDivisions = [
  "Championship", // England
  "Ligue 2", // France
  "2. Bundesliga", // Germany
  "LaLiga2",
  "Segunda División", // Spain
  "Eerste Divisie", // Netherlands
];

// Mock match results data as fallback
const mockResults: Match[] = [
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
      },
    },
  },
  {
    id: 2,
    league: {
      name: "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      country: "Italy",
    },
    teams: {
      home: {
        name: "Juventus",
        logo: "https://media.api-sports.io/football/teams/496.png",
      },
      away: {
        name: "Roma",
        logo: "https://media.api-sports.io/football/teams/497.png",
      },
    },
    goals: {
      home: 0,
      away: 0,
    },
    fixture: {
      date: "2024-04-21T16:00:00+00:00",
      status: {
        short: "FT",
      },
    },
  },
  {
    id: 3,
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
      date: "2024-04-20T14:00:00+00:00",
      status: {
        short: "FT",
      },
    },
  },
  {
    id: 4,
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
      },
    },
  },
  {
    id: 5,
    league: {
      name: "Bundesliga",
      logo: "https://media.api-sports.io/football/leagues/78.png",
      country: "Germany",
    },
    teams: {
      home: {
        name: "Bayern Munich",
        logo: "https://media.api-sports.io/football/teams/157.png",
      },
      away: {
        name: "Borussia Dortmund",
        logo: "https://media.api-sports.io/football/teams/165.png",
      },
    },
    goals: {
      home: 4,
      away: 0,
    },
    fixture: {
      date: "2024-04-20T16:30:00+00:00",
      status: {
        short: "FT",
      },
    },
  },
];

export default function RisultatiPage() {
  const [results, setResults] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      setUsingMockData(false);

      try {
        // Try to get today's matches first
        const todayFixtures = await getFixturesByDate(date);

        if (
          todayFixtures &&
          todayFixtures.response &&
          todayFixtures.response.length > 0
        ) {
          // Transform API response to match our interface
          const formattedResults = todayFixtures.response
            .map((fixture: any) => ({
              id: fixture.fixture.id,
              league: {
                name: fixture.league.name,
                logo: fixture.league.logo,
                country: fixture.league.country,
              },
              teams: {
                home: {
                  name: fixture.teams.home.name,
                  logo: fixture.teams.home.logo,
                },
                away: {
                  name: fixture.teams.away.name,
                  logo: fixture.teams.away.logo,
                },
              },
              goals: {
                home: fixture.goals.home,
                away: fixture.goals.away,
              },
              fixture: {
                date: fixture.fixture.date,
                status: {
                  short: fixture.fixture.status.short,
                },
              },
            }))
            // Filter to include only allowed competitions and second divisions
            .filter(
              (match: Match) =>
                allowedCompetitions.includes(match.league.name) ||
                secondDivisions.includes(match.league.name)
            );

          setResults(formattedResults);

          // Check if we're using mock data from the API fallback
          if (todayFixtures.isMockData) {
            setUsingMockData(true);
          }
        } else {
          // If no fixtures are available, try to get live matches
          const liveMatches = await getLiveMatches();

          if (
            liveMatches &&
            liveMatches.response &&
            liveMatches.response.length > 0
          ) {
            // Transform API response to match our interface
            const formattedResults = liveMatches.response
              .map((fixture: any) => ({
                id: fixture.fixture.id,
                league: {
                  name: fixture.league.name,
                  logo: fixture.league.logo,
                  country: fixture.league.country,
                },
                teams: {
                  home: {
                    name: fixture.teams.home.name,
                    logo: fixture.teams.home.logo,
                  },
                  away: {
                    name: fixture.teams.away.name,
                    logo: fixture.teams.away.logo,
                  },
                },
                goals: {
                  home: fixture.goals.home,
                  away: fixture.goals.away,
                },
                fixture: {
                  date: fixture.fixture.date,
                  status: {
                    short: fixture.fixture.status.short,
                  },
                },
              }))
              // Filter to include only allowed competitions and second divisions
              .filter(
                (match: Match) =>
                  allowedCompetitions.includes(match.league.name) ||
                  secondDivisions.includes(match.league.name)
              );

            setResults(formattedResults);

            // Check if we're using mock data from the API fallback
            if (liveMatches.isMockData) {
              setUsingMockData(true);
            }
          } else {
            // If still no results, use our local mock data
            // Filter mock data to include only allowed competitions
            const filteredMockResults = mockResults.filter(
              (match) =>
                allowedCompetitions.includes(match.league.name) ||
                secondDivisions.includes(match.league.name)
            );
            setResults(filteredMockResults);
            setUsingMockData(true);
          }
        }
      } catch (err) {
        console.error("Error fetching match results:", err);
        setError("Failed to load match results. Please try again later.");
        // Filter mock data to include only allowed competitions
        const filteredMockResults = mockResults.filter(
          (match) =>
            allowedCompetitions.includes(match.league.name) ||
            secondDivisions.includes(match.league.name)
        );
        setResults(filteredMockResults);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [date]);

  // Filter results by league if a specific league is selected
  const filteredResults =
    selectedLeague === "all"
      ? results
      : results.filter((match) => match.league.name === selectedLeague);

  // Get unique leagues for the filter
  const uniqueLeagues = Array.from(
    new Set(results.map((match) => match.league.name))
  ).sort();

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm", { locale: it });
  };

  // Handle date change
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  // Get yesterday, today, and tomorrow dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formattedToday = format(today, "yyyy-MM-dd");
  const formattedYesterday = format(yesterday, "yyyy-MM-dd");
  const formattedTomorrow = format(tomorrow, "yyyy-MM-dd");

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-oswald font-bold text-black mb-2 inline-block px-3 py-1 rounded-md shadow-sm">
            Risultati
          </h1>
          <p className="text-black font-roboto font-medium">
            Risultati delle partite in tempo reale e aggiornamenti
          </p>
        </div>

        {/* API Status Banner */}
        {usingMockData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-700 mb-2">
              Utilizzo dati di esempio
            </h3>
            <p className="text-yellow-600">
              Stai visualizzando dati di esempio perché abbiamo raggiunto il
              limite di richieste API o si è verificato un errore.
            </p>
          </div>
        )}

        {/* Quick date selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDateChange(formattedYesterday)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${
                date === formattedYesterday
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Ieri
            </button>
            <button
              onClick={() => handleDateChange(formattedToday)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${
                date === formattedToday
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Oggi
            </button>
            <button
              onClick={() => handleDateChange(formattedTomorrow)}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border ${
                date === formattedTomorrow
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Domani
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg border bg-white"
            />
          </div>
        </div>

        {/* League filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLeague("all")}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm ${
              selectedLeague === "all"
                ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                : "bg-white text-gray-700 hover:bg-gray-50 border"
            }`}
          >
            Tutte le leghe
          </button>
          {uniqueLeagues.map((league) => (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-sm ${
                selectedLeague === league
                  ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {league}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-4 animate-pulse h-28"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-gray-50 p-10 rounded-lg text-center">
            <h3 className="text-lg font-oswald font-medium text-black">
              Nessun risultato trovato
            </h3>
            <p className="text-gray-700 font-roboto mt-2">
              Non ci sono partite disponibili per la data o la lega selezionata.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-indigo-50 border-b border-indigo-100 text-indigo-800 px-4 py-2 text-sm font-roboto flex justify-between items-center flex-wrap">
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
                  <div>{formatMatchDate(match.fixture.date)}</div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
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
                      <span className="font-oswald font-medium text-black">
                        {match.teams.home.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-oswald font-bold text-black">
                        {match.goals.home !== null ? match.goals.home : "-"}
                      </span>
                      <span className="text-xl font-oswald text-black">-</span>
                      <span className="text-xl font-oswald font-bold text-black">
                        {match.goals.away !== null ? match.goals.away : "-"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-oswald font-medium text-black text-right">
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
                        : match.fixture.status.short === "NS"
                        ? "Non Iniziata"
                        : match.fixture.status.short === "HT"
                        ? "Intervallo"
                        : `In Corso (${match.fixture.status.short})`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
