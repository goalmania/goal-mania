import { NextRequest, NextResponse } from "next/server";
import { FootballCache } from "@/lib/cache";
import {
  fetchFootballData,
  validateLeague,
  getCurrentSeason,
  getUpcomingFixturesDateRange,
  FALLBACK_FIXTURES,
  createSuccessHeaders,
  createErrorResponse,
} from "@/lib/utils/footballApi";

// Define types for the football API response
interface FootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      long: string;
    };
    venue?: {
      name?: string;
      city?: string;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

// Define the transformed fixture type
interface TransformedFixture {
  id: number;
  league: {
    id: number;
    name: string;
    logo: string;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  fixture: {
    id: number;
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

interface FixturesResponse {
  response: FootballFixture[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get("league");

  // Validate league parameter
  const validation = validateLeague(league);
  if (!validation.valid) {
    return NextResponse.json(
      createErrorResponse(validation.error!, 400),
      { status: 400 }
    );
  }

  const leagueId = validation.leagueId!;
  const season = getCurrentSeason();
  const { from, to } = getUpcomingFixturesDateRange(14);

  // Create cache key
  const cacheKey = FootballCache.createKey("fixtures", league!, season.toString(), from, to);

  try {
    // Fetch fixtures with caching and error handling
    const endpoint = `/fixtures?league=${leagueId}&season=${season}&from=${from}&to=${to}&status=NS-TBD-CANC-PST-SUSP`;
    const { data, cached, error } = await fetchFootballData<FixturesResponse>(
      endpoint,
      cacheKey,
      3600000, // 1 hour cache
      { response: FALLBACK_FIXTURES },
      { apiType: "apiSports" }
    );

    // Transform API response
    const fixtures = data.response.map(
      (fixture: FootballFixture): TransformedFixture => ({
        id: fixture.fixture.id,
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          logo: fixture.league.logo,
          round: fixture.league.round,
        },
        teams: {
          home: {
            id: fixture.teams.home.id,
            name: fixture.teams.home.name,
            logo: fixture.teams.home.logo,
          },
          away: {
            id: fixture.teams.away.id,
            name: fixture.teams.away.name,
            logo: fixture.teams.away.logo,
          },
        },
        goals: {
          home: fixture.goals.home,
          away: fixture.goals.away,
        },
        fixture: {
          id: fixture.fixture.id,
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
      })
    );

    // Sort fixtures by date
    fixtures.sort((a: TransformedFixture, b: TransformedFixture) => {
      return (
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
      );
    });

    const response = {
      fixtures,
      ...(error && { warning: error, fallbackUsed: true }),
    };

    return NextResponse.json(response, {
      headers: createSuccessHeaders(cached, 3600),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error in fixtures endpoint for ${league}:`, errorMessage);
    
    // Return fallback data with 200 status so frontend doesn't break
    return NextResponse.json(
      {
        fixtures: FALLBACK_FIXTURES,
        warning: `Failed to fetch fixtures: ${errorMessage}`,
        fallbackUsed: true,
      },
      { 
        status: 200,
        headers: createSuccessHeaders(false, 300), // Short cache for errors
      }
    );
  }
}
