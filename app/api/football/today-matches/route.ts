import { NextResponse } from "next/server";

// Top leagues to show: Serie A, PL, La Liga, Bundesliga, Ligue 1, UCL, UEL, Conference
const TOP_LEAGUE_IDS = new Set([135, 39, 140, 78, 61, 2, 3, 848]);

export const revalidate = 60; // 1 min server-side cache

export async function GET() {
  const API_KEY = process.env.FOOTBALL_API;

  if (!API_KEY) {
    return NextResponse.json({ matches: [] }, { status: 200 });
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD UTC

  try {
    const [liveRes, todayRes] = await Promise.allSettled([
      fetch("https://v3.football.api-sports.io/fixtures?live=all", {
        headers: { "x-apisports-key": API_KEY },
        next: { revalidate: 60 },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
        headers: { "x-apisports-key": API_KEY },
        next: { revalidate: 60 },
      }),
    ]);

    const liveMatches: any[] = [];
    const todayMatches: any[] = [];
    const liveIds = new Set<number>();

    if (liveRes.status === "fulfilled" && liveRes.value.ok) {
      const data = await liveRes.value.json();
      (data.response || [])
        .filter((f: any) => TOP_LEAGUE_IDS.has(f.league.id))
        .forEach((f: any) => {
          liveIds.add(f.fixture.id);
          liveMatches.push(f);
        });
    }

    if (todayRes.status === "fulfilled" && todayRes.value.ok) {
      const data = await todayRes.value.json();
      (data.response || [])
        .filter((f: any) => TOP_LEAGUE_IDS.has(f.league.id) && !liveIds.has(f.fixture.id))
        .forEach((f: any) => todayMatches.push(f));
    }

    const transform = (f: any) => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      status: f.fixture.status.short as string,
      minute: f.fixture.status.elapsed as number | null,
      league: f.league.name as string,
    });

    const STATUS_ORDER: Record<string, number> = {
      "1H": 0, "2H": 0, "ET": 0, "P": 0, "HT": 1,
      "FT": 2, "AET": 2, "PEN": 2,
      "NS": 3, "TBD": 4,
    };

    const all = [
      ...liveMatches.map(transform),
      ...todayMatches.map(transform),
    ]
      .sort((a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5))
      .slice(0, 14);

    return NextResponse.json({ matches: all });
  } catch (err) {
    console.error("[today-matches]", err);
    return NextResponse.json({ matches: [] }, { status: 200 });
  }
}
