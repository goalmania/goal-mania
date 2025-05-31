import { NextRequest, NextResponse } from "next/server";

// Map frontend league names to API league IDs
const leagueIdMap: Record<string, number> = {
  premierLeague: 39, // Premier League
  laliga: 140, // La Liga
  bundesliga: 78, // Bundesliga
  ligue1: 61, // Ligue 1
  serieA: 135, // Serie A
};

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

export async function GET(request: NextRequest) {
  const API_KEY = process.env.FOOTBALL_API;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  // Get league from query params
  const searchParams = request.nextUrl.searchParams;
  const league = searchParams.get("league");

  if (!league || !leagueIdMap[league]) {
    return NextResponse.json(
      { error: "Invalid or missing league parameter" },
      { status: 400 }
    );
  }

  const leagueId = leagueIdMap[league];

  // Calculate current season
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
  const season = currentMonth < 8 ? currentYear - 1 : currentYear;

  try {
    // Calculate date range for upcoming matches
    const twoWeeksAhead = new Date();
    twoWeeksAhead.setDate(today.getDate() + 14); // Look ahead 14 days

    const fromDate = today.toISOString().split("T")[0];
    const toDate = twoWeeksAhead.toISOString().split("T")[0];

    // Fetch upcoming fixtures within the date range
    const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&from=${fromDate}&to=${toDate}&status=NS-TBD-CANC-PST-SUSP`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Check if the API response is valid
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

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

    return NextResponse.json({ fixtures });
  } catch (error) {
    console.error(`Error fetching fixtures for ${league}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch fixtures for ${league}` },
      { status: 500 }
    );
  }
}
