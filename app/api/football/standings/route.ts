import { NextRequest, NextResponse } from "next/server";
import { FootballCache } from "@/lib/cache";
import {
  fetchFootballData,
  FALLBACK_STANDINGS,
  createSuccessHeaders,
  createErrorResponse,
} from "@/lib/utils/footballApi";

const API_BASE_URL = "https://api.football-data.org/v4";

// Map league codes to competition codes for football-data.org
const leagueCodeMap: Record<string, string> = {
  PL: "PL", // Premier League
  PD: "PD", // La Liga
  BL1: "BL1", // Bundesliga
  FL1: "FL1", // Ligue 1
  SA: "SA", // Serie A
};

// Legacy mock data (kept for reference but not used)
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leagueCode = searchParams.get("league"); // e.g., "PL", "SA"
  const season = searchParams.get("season");

  if (!leagueCode || !season) {
    return NextResponse.json(
      createErrorResponse("Missing required parameters: league and season", 400),
      { status: 400 }
    );
  }

  // Validate league code
  if (!leagueCodeMap[leagueCode]) {
    return NextResponse.json(
      createErrorResponse(
        `Invalid league code: ${leagueCode}. Valid codes: ${Object.keys(leagueCodeMap).join(", ")}`,
        400
      ),
      { status: 400 }
    );
  }

  // Create cache key
  const cacheKey = FootballCache.createKey("standings", leagueCode, season);

  // Check cache first
  const cachedData = FootballCache.get(cacheKey);
  if (cachedData) {
    console.log(`✅ Standings cache HIT: ${cacheKey}`);
    return NextResponse.json(cachedData, {
      headers: createSuccessHeaders(true, 3600),
    });
  }

  const API_KEY = process.env.NEXT_FOOTBALL_API;

  // Return fallback if no API key
  if (!API_KEY) {
    console.warn("⚠️  NEXT_FOOTBALL_API not configured, using fallback data");
    return NextResponse.json(
      {
        ...FALLBACK_STANDINGS,
        warning: "API key not configured, using fallback data",
        fallbackUsed: true,
      },
      {
        headers: createSuccessHeaders(false, 300),
      }
    );
  }

  try {
    // Use football-data.org API
    const url = `${API_BASE_URL}/competitions/${leagueCode}/standings?season=${season}`;
    
    console.log(`🔄 Fetching standings: ${url}`);
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": API_KEY,
      },
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      if (response.status === 403) {
        throw new Error("Invalid API key or access forbidden");
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response for 1 hour
    FootballCache.set(cacheKey, data, 3600000);
    console.log(`✅ Standings cache SET: ${cacheKey}`);

    return NextResponse.json(data, {
      headers: createSuccessHeaders(false, 3600),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error fetching standings for ${leagueCode}:`, errorMessage);

    // Return fallback data with 200 status so frontend doesn't break
    return NextResponse.json(
      {
        ...FALLBACK_STANDINGS,
        warning: `Failed to fetch standings: ${errorMessage}`,
        fallbackUsed: true,
      },
      {
        status: 200,
        headers: createSuccessHeaders(false, 300), // Short cache for errors
      }
    );
  }
}
