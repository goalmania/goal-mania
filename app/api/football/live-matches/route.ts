import { NextResponse } from "next/server";
import { FootballCache } from "@/lib/cache";
import {
  fetchFootballData,
  FALLBACK_LIVE_MATCHES,
  createSuccessHeaders,
} from "@/lib/utils/footballApi";

interface LiveMatchesResponse {
  response: any[];
}

export async function GET() {
  // Create cache key (short TTL since live data changes quickly)
  const cacheKey = FootballCache.createKey("live-matches", "all");

  try {
    // Fetch live matches with caching (5 minute cache for live data)
    const endpoint = `/fixtures?live=all`;
    const { data, cached, error } = await fetchFootballData<LiveMatchesResponse>(
      endpoint,
      cacheKey,
      300000, // 5 minutes cache (live data needs to be fresh)
      { response: FALLBACK_LIVE_MATCHES },
      { apiType: "apiSports" }
    );

    // Transform API response to match our interface
    const matches = data.response.map((fixture: any) => ({
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
          long: fixture.fixture.status.long,
        },
        venue: {
          name: fixture.fixture.venue?.name || "Unknown Venue",
          city: fixture.fixture.venue?.city || "Unknown City",
        },
      },
    }));

    const response = {
      matches,
      ...(error && { warning: error, fallbackUsed: true }),
    };

    return NextResponse.json(response, {
      headers: createSuccessHeaders(cached, 300), // 5 minute cache
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in live-matches endpoint:", errorMessage);

    // Return empty array with 200 status (no matches is valid state)
    return NextResponse.json(
      {
        matches: FALLBACK_LIVE_MATCHES,
        warning: `Failed to fetch live matches: ${errorMessage}`,
        fallbackUsed: true,
      },
      {
        status: 200,
        headers: createSuccessHeaders(false, 60), // Very short cache for errors
      }
    );
  }
}
