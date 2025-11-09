// lib/utils/footballApi.ts - Unified football API utilities with error handling and fallbacks

import { FootballCache } from "@/lib/cache";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial delay in ms
const TIMEOUT_MS = 10000; // 10 seconds

// API Configuration
export const FOOTBALL_API_CONFIG = {
  apiSports: {
    baseUrl: "https://v3.football.api-sports.io",
    keyEnvVar: "FOOTBALL_API",
  },
  footballData: {
    baseUrl: "https://api.football-data.org/v4",
    keyEnvVar: "NEXT_FOOTBALL_API",
  },
};

// League ID mappings for API-Sports
export const LEAGUE_IDS = {
  premierLeague: 39,
  laliga: 140,
  bundesliga: 78,
  ligue1: 61,
  serieA: 135,
} as const;

// League codes for Football-Data.org
export const LEAGUE_CODES = {
  PL: "premierLeague",
  PD: "laliga",
  BL1: "bundesliga",
  FL1: "ligue1",
  SA: "serieA",
} as const;

// Mock/Fallback Data
export const FALLBACK_FIXTURES = [
  {
    id: 1001,
    league: {
      id: 135,
      name: "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      round: "Regular Season - 10",
    },
    teams: {
      home: {
        id: 489,
        name: "AC Milan",
        logo: "https://media.api-sports.io/football/teams/489.png",
      },
      away: {
        id: 496,
        name: "Juventus",
        logo: "https://media.api-sports.io/football/teams/496.png",
      },
    },
    goals: {
      home: null,
      away: null,
    },
    fixture: {
      id: 1001,
      date: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: {
        short: "NS",
        long: "Not Started",
      },
      venue: {
        name: "San Siro",
        city: "Milano",
      },
    },
  },
  {
    id: 1002,
    league: {
      id: 135,
      name: "Serie A",
      logo: "https://media.api-sports.io/football/leagues/135.png",
      round: "Regular Season - 10",
    },
    teams: {
      home: {
        id: 487,
        name: "Inter",
        logo: "https://media.api-sports.io/football/teams/487.png",
      },
      away: {
        id: 492,
        name: "Napoli",
        logo: "https://media.api-sports.io/football/teams/492.png",
      },
    },
    goals: {
      home: null,
      away: null,
    },
    fixture: {
      id: 1002,
      date: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: {
        short: "NS",
        long: "Not Started",
      },
      venue: {
        name: "Giuseppe Meazza",
        city: "Milano",
      },
    },
  },
];

export const FALLBACK_LIVE_MATCHES = [];

export const FALLBACK_STANDINGS = {
  standings: [
    {
      table: [
        {
          position: 1,
          team: { name: "Inter", id: 108, crest: "" },
          playedGames: 10,
          won: 8,
          draw: 1,
          lost: 1,
          goalsFor: 24,
          goalsAgainst: 7,
          goalDifference: 17,
          points: 25,
        },
        {
          position: 2,
          team: { name: "Juventus", id: 109, crest: "" },
          playedGames: 10,
          won: 7,
          draw: 2,
          lost: 1,
          goalsFor: 20,
          goalsAgainst: 8,
          goalDifference: 12,
          points: 23,
        },
        {
          position: 3,
          team: { name: "AC Milan", id: 98, crest: "" },
          playedGames: 10,
          won: 6,
          draw: 2,
          lost: 2,
          goalsFor: 19,
          goalsAgainst: 10,
          goalDifference: 9,
          points: 20,
        },
      ],
    },
  ],
};

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle rate limiting with exponential backoff
    if (response.status === 429 && retries > 0) {
      console.log(
        `⚠️  Rate limited (429), retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    // Handle server errors with retry
    if (response.status >= 500 && retries > 0) {
      console.log(
        `⚠️  Server error (${response.status}), retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry on network errors or timeouts
    if (retries > 0) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `⚠️  Fetch error (${errorMessage}), retrying in ${delay}ms... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    throw error;
  }
}

/**
 * Generic API fetch with caching and error handling
 */
export async function fetchFootballData<T>(
  endpoint: string,
  cacheKey: string,
  cacheTTL: number,
  fallbackData: T,
  fetchOptions?: {
    apiType?: "apiSports" | "footballData";
    headers?: Record<string, string>;
  }
): Promise<{ data: T; cached: boolean; error?: string }> {
  // Check cache first
  const cachedData = FootballCache.get(cacheKey);
  if (cachedData) {
    console.log(`✅ Cache HIT: ${cacheKey}`);
    return { data: cachedData as T, cached: true };
  }

  const apiType = fetchOptions?.apiType || "apiSports";
  const config = FOOTBALL_API_CONFIG[apiType];
  const apiKey = process.env[config.keyEnvVar];

  // Return fallback if no API key configured
  if (!apiKey) {
    console.warn(
      `⚠️  ${config.keyEnvVar} not configured, using fallback data for ${endpoint}`
    );
    return {
      data: fallbackData,
      cached: false,
      error: "API key not configured",
    };
  }

  try {
    const url = `${config.baseUrl}${endpoint}`;
    const headers =
      apiType === "apiSports"
        ? {
            "x-apisports-key": apiKey,
            "Content-Type": "application/json",
            ...fetchOptions?.headers,
          }
        : {
            "X-Auth-Token": apiKey,
            ...fetchOptions?.headers,
          };

    console.log(`🔄 Fetching: ${url}`);
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful response
    FootballCache.set(cacheKey, data, cacheTTL);
    console.log(`✅ Cache SET: ${cacheKey} (TTL: ${cacheTTL}ms)`);

    return { data, cached: false };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error fetching ${endpoint}:`, errorMessage);

    // Return fallback data on error
    return {
      data: fallbackData,
      cached: false,
      error: errorMessage,
    };
  }
}

/**
 * Calculate current season based on date
 */
export function getCurrentSeason(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  // Most European leagues start in August/September
  return currentMonth < 8 ? currentYear - 1 : currentYear;
}

/**
 * Get date range for upcoming fixtures
 */
export function getUpcomingFixturesDateRange(
  daysAhead = 14
): { from: string; to: string } {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return {
    from: today.toISOString().split("T")[0],
    to: futureDate.toISOString().split("T")[0],
  };
}

/**
 * Validate league parameter
 */
export function validateLeague(
  league: string | null
): { valid: boolean; leagueId?: number; error?: string } {
  if (!league) {
    return { valid: false, error: "League parameter is required" };
  }

  const leagueId = LEAGUE_IDS[league as keyof typeof LEAGUE_IDS];
  if (!leagueId) {
    return {
      valid: false,
      error: `Invalid league: ${league}. Valid leagues: ${Object.keys(LEAGUE_IDS).join(", ")}`,
    };
  }

  return { valid: true, leagueId };
}

/**
 * Error response helper
 */
export function createErrorResponse(message: string, status = 500) {
  return {
    error: message,
    timestamp: new Date().toISOString(),
    fallbackUsed: true,
  };
}

/**
 * Success response helper with cache headers
 */
export function createSuccessHeaders(cached: boolean, maxAge = 3600) {
  return {
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    "X-Cache": cached ? "HIT" : "MISS",
    "X-Timestamp": new Date().toISOString(),
  };
}
