import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.FOOTBALL_API;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch live matches from the API
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        method: "GET",
        headers: {
          "x-apisports-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Check if the API response is valid
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

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
          name: fixture.fixture.venue.name || "Unknown Venue",
          city: fixture.fixture.venue.city || "Unknown City",
        },
      },
    }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching live matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch live matches" },
      { status: 500 }
    );
  }
}
