import { NextRequest, NextResponse } from "next/server";

// Try different environment variable names for the API key
const API_KEY =
  process.env.NEXT_PUBLIC_FOOTBALL_API_KEY ||
  process.env.FOOTBALL_API ||
  process.env.NEXT_FOOTBALL_API ||
  "YOUR_API_KEY";

const API_BASE_URL = "https://api.football-data.org/v4";

// In-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial delay in ms

// Mock data for fallback
const mockStandings = {
  premierLeague: [
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
  ],
  laliga: [
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
  ],
  bundesliga: [
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
  ],
  ligue1: [
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
  ],
  serieA: [
    {
      position: 1,
      team: "Inter",
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
      team: "Juventus",
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 8,
      goalDifference: 12,
      points: 23,
    },
    {
      position: 3,
      team: "Milan",
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      goalsFor: 19,
      goalsAgainst: 10,
      goalDifference: 9,
      points: 20,
    },
    {
      position: 4,
      team: "Napoli",
      played: 10,
      won: 6,
      drawn: 1,
      lost: 3,
      goalsFor: 18,
      goalsAgainst: 11,
      goalDifference: 7,
      points: 19,
    },
    {
      position: 5,
      team: "Atalanta",
      played: 10,
      won: 5,
      drawn: 3,
      lost: 2,
      goalsFor: 17,
      goalsAgainst: 10,
      goalDifference: 7,
      points: 18,
    },
  ],
};

// Map our league IDs to football-data.org competition codes and mock data keys
const leagueMapping: Record<string, { code: string; mockKey: string }> = {
  "39": { code: "PL", mockKey: "premierLeague" }, // Premier League
  "140": { code: "PD", mockKey: "laliga" }, // La Liga
  "78": { code: "BL1", mockKey: "bundesliga" }, // Bundesliga
  "61": { code: "FL1", mockKey: "ligue1" }, // Ligue 1
  "135": { code: "SA", mockKey: "serieA" }, // Serie A
};

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
) {
  try {
    const response = await fetch(url, options);

    if (response.status === 429 && retries > 0) {
      console.log(
        `Rate limited (429), retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Fetch error, retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

function getMockResponse(leagueId: string) {
  const mockKey = leagueMapping[leagueId]?.mockKey || "premierLeague";
  const standings =
    mockStandings[mockKey as keyof typeof mockStandings] ||
    mockStandings.premierLeague;

  return {
    response: [
      {
        league: {
          standings: [
            standings.map((item) => ({
              rank: item.position,
              team: {
                id: item.position * 100, // Generate a fake ID
                name: item.team,
                logo: null,
              },
              all: {
                played: item.played,
                win: item.won,
                draw: item.drawn,
                lose: item.lost,
                goals: {
                  for: item.goalsFor,
                  against: item.goalsAgainst,
                },
              },
              goalsDiff: item.goalDifference,
              points: item.points,
            })),
          ],
        },
      },
    ],
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("league");
  const season = searchParams.get("season");

  if (!leagueId || !season) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${leagueId}/standings?season=${season}`,
      {
        headers: {
          "X-Auth-Token": process.env.NEXT_FOOTBALL_API || "",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching standings:", error);
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}
