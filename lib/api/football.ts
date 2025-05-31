import { cache } from "react";

export type League =
  | "premierLeague"
  | "laliga"
  | "bundesliga"
  | "ligue1"
  | "serieA"
  | "serie-a"
  | "other";

// Map frontend league names to API league codes (using football-data.org codes)
const leagueCodeMap: Record<string, string> = {
  premierLeague: "PL", // Premier League
  laliga: "PD", // La Liga (Primera Division)
  bundesliga: "BL1", // Bundesliga
  ligue1: "FL1", // Ligue 1
  serieA: "SA", // Serie A
  "serie-a": "SA", // Serie A (alternate format)
  other: "OTHER", // Other leagues
};

interface FixtureResponse {
  league: {
    id: number;
    name: string;
    logo: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue: { name: string; city: string };
  };
}

interface StandingResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    standings: Array<
      Array<{
        rank: number;
        team: {
          id: number;
          name: string;
          logo: string;
        };
        points: number;
        goalsDiff: number;
        all: {
          played: number;
          win: number;
          draw: number;
          lose: number;
          goals: {
            for: number;
            against: number;
          };
        };
      }>
    >;
  };
}

interface ScorerResponse {
  player: {
    id: number;
    name: string;
    photo: string;
    nationality: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    goals: {
      total: number;
      assists?: number;
    };
    games: {
      appearences: number;
      minutes: number;
    };
  }>;
}

interface TeamStatisticsResponse {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
  };
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
      minute: Record<string, { total: number; percentage: string }>;
    };
    against: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
      minute: Record<string, { total: number; percentage: string }>;
    };
  };
}

interface PlayerResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    height: string;
    weight: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      position: string;
      rating: string;
    };
    goals: {
      total: number;
      assists: number;
    };
    shots: {
      total: number;
      on: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
  }>;
}

type FixturesResult = {
  fixtures: FixtureResponse[];
  error?: string;
};

type StandingsResult = {
  standings: StandingResponse | null;
  error?: string;
};

type TopScorersResult = {
  topScorers: ScorerResponse[];
  error?: string;
};

type TeamStatisticsResult = {
  statistics: TeamStatisticsResponse | null;
  error?: string;
};

type PlayersResult = {
  players: PlayerResponse[];
  error?: string;
};

type MatchResultsResult = {
  results: FixtureResponse[];
  error?: string;
};

const API_URL = "https://api.football-data.org/v4";
// Using server-side environment variable
const API_KEY = process.env.NEXT_FOOTBALL_API || "YOUR_API_KEY_HERE"; // Provide a placeholder for development

// Updated headers with proper key names
const getHeaders = () => {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    console.error("API key not configured");
    return {};
  }

  return {
    "X-Auth-Token": API_KEY,
    "Content-Type": "application/json",
  };
};

/**
 * Fetches upcoming fixtures for a specific league
 */
export const getFixtures = cache(
  async (league: League, next = 10): Promise<FixturesResult> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { fixtures: [], error: "API key not configured" };
    }

    const leagueCode = leagueCodeMap[league];

    try {
      const headers = getHeaders();

      // Calculate date range for upcoming matches
      const today = new Date();
      const twoMonthsAhead = new Date();
      twoMonthsAhead.setDate(today.getDate() + 60); // Look ahead 60 days

      const fromDate = today.toISOString().split("T")[0];
      const toDate = twoMonthsAhead.toISOString().split("T")[0];

      // Fetch upcoming fixtures within the date range using v4 API
      const url = `${API_URL}/competitions/${leagueCode}/matches?dateFrom=${fromDate}&dateTo=${toDate}&status=SCHEDULED`;

      console.log(
        `Fetching upcoming fixtures for ${league} from ${fromDate} to ${toDate}`
      );

      const response = await fetch(url, {
        method: "GET",
        headers: headers as HeadersInit,
        next: { revalidate: 3600 }, // Revalidate every hour
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fixtures: ${response.status}`);
      }

      const data = await response.json();
      let matches = data.matches || [];

      // If no fixtures found in date range, try getting future matches
      if (matches.length === 0) {
        console.log(
          `No upcoming fixtures found for ${league}, using mock data`
        );
        return getMockFixtures(league);
      }

      // Transform the data to match our expected format
      const fixtures = matches.map((match: any) => ({
        league: {
          id: data.competition.id,
          name: data.competition.name,
          logo: data.competition.emblem,
          round: match.matchday
            ? `Matchday ${match.matchday}`
            : "Regular Season",
        },
        teams: {
          home: {
            id: match.homeTeam.id,
            name: match.homeTeam.name,
            logo: match.homeTeam.crest,
          },
          away: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            logo: match.awayTeam.crest,
          },
        },
        goals: {
          home: match.score?.fullTime?.home,
          away: match.score?.fullTime?.away,
        },
        fixture: {
          id: match.id,
          date: match.utcDate,
          status: {
            short: match.status,
            long: getStatusLong(match.status),
          },
          venue: {
            name: match.venue || "TBD",
            city: "",
          },
        },
      }));

      // Sort fixtures by date
      fixtures.sort((a: any, b: any) => {
        return (
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
        );
      });

      // Limit to requested number of fixtures
      const limitedFixtures = fixtures.slice(0, next);

      console.log(
        `Successfully fetched ${limitedFixtures.length} upcoming fixtures for ${league}`
      );
      return { fixtures: limitedFixtures };
    } catch (error) {
      console.error(`Error fetching fixtures for ${league}:`, error);
      return {
        fixtures: [],
        error: `Failed to fetch fixtures: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
);

// Helper function to convert API status to long form
function getStatusLong(status: string): string {
  const statusMap: Record<string, string> = {
    SCHEDULED: "Scheduled",
    LIVE: "Live",
    IN_PLAY: "In Play",
    PAUSED: "Paused",
    FINISHED: "Match Finished",
    POSTPONED: "Match Postponed",
    SUSPENDED: "Match Suspended",
    CANCELLED: "Match Cancelled",
  };

  return statusMap[status] || status;
}

/**
 * Fetches league standings
 */
export const getStandings = cache(
  async (league: League | string): Promise<StandingsResult> => {
    // Normalize league name (handle both "serieA" and "serie-a")
    const normalizedLeague =
      league === "serie-a" ? ("serieA" as League) : (league as League);

    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { standings: null, error: "API key not configured" };
    }

    const leagueCode = leagueCodeMap[normalizedLeague];
    const currentSeason = getCurrentSeason();

    try {
      const headers = getHeaders();

      console.log(
        `Attempting to fetch standings for ${normalizedLeague} (${leagueCode}) season ${currentSeason}`
      );

      // The v4 API includes current season standings by default
      const response = await fetch(
        `${API_URL}/competitions/${leagueCode}/standings`,
        {
          method: "GET",
          headers: headers as HeadersInit,
          next: { revalidate: 3600 }, // Revalidate every hour
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch standings: ${response.status}`);
        return getMockStandings(normalizedLeague);
      }

      const data = await response.json();

      // Transform the API response to match our expected format
      if (!data.standings || data.standings.length === 0) {
        console.warn(`No standings data found for ${normalizedLeague}`);
        // Provide mock data to avoid errors
        return getMockStandings(normalizedLeague);
      }

      // Find the total league standings (typically the first table)
      const totalStandings = data.standings.find(
        (standing: any) => standing.type === "TOTAL"
      );

      if (!totalStandings) {
        console.warn(`No total standings found for ${normalizedLeague}`);
        return getMockStandings(normalizedLeague);
      }

      // Format the response to match our expected structure
      const formattedResponse = {
        league: {
          id: data.competition.id,
          name: data.competition.name,
          country: data.area.name,
          logo: data.competition.emblem,
          standings: [
            totalStandings.table.map((entry: any) => ({
              rank: entry.position,
              team: {
                id: entry.team.id,
                name: entry.team.name,
                logo: entry.team.crest,
              },
              points: entry.points,
              goalsDiff: entry.goalDifference,
              all: {
                played: entry.playedGames,
                win: entry.won,
                draw: entry.draw,
                lose: entry.lost,
                goals: {
                  for: entry.goalsFor,
                  against: entry.goalsAgainst,
                },
              },
            })),
          ],
        },
      };

      console.log(`Successfully fetched standings for ${normalizedLeague}`);
      return { standings: formattedResponse };
    } catch (error) {
      console.error(`Error fetching standings for ${normalizedLeague}:`, error);

      // Provide mock data on error
      return getMockStandings(normalizedLeague);
    }
  }
);

/**
 * Fetches top scorers for a league
 */
export const getTopScorers = cache(
  async (league: League | string, limit = 10): Promise<TopScorersResult> => {
    // Normalize league name (handle both "serieA" and "serie-a")
    const normalizedLeague =
      league === "serie-a" ? ("serieA" as League) : (league as League);

    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { topScorers: [], error: "API key not configured" };
    }

    const leagueCode = leagueCodeMap[normalizedLeague];

    try {
      const headers = getHeaders();

      console.log(
        `Attempting to fetch top scorers for ${normalizedLeague} (${leagueCode})`
      );

      // In v4 API, scorers endpoint returns current season by default
      const response = await fetch(
        `${API_URL}/competitions/${leagueCode}/scorers?limit=${limit}`,
        {
          method: "GET",
          headers: headers as HeadersInit,
          next: { revalidate: 3600 }, // Revalidate every hour
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch top scorers: ${response.status}`);
        return getMockTopScorers(normalizedLeague);
      }

      const data = await response.json();

      if (!data.scorers || data.scorers.length === 0) {
        console.warn(`No top scorers data found for ${normalizedLeague}`);
        // Provide mock data to avoid errors
        return getMockTopScorers(normalizedLeague);
      }

      // Transform the data to match our expected format
      const formattedScorers = data.scorers.map((scorer: any) => ({
        player: {
          id: scorer.player.id,
          name: scorer.player.name,
          photo: `https://media.api-sports.io/football/players/${scorer.player.id}.png`, // We'll use a placeholder since the new API might not provide photos
          nationality: scorer.player.nationality,
        },
        statistics: [
          {
            team: {
              id: scorer.team.id,
              name: scorer.team.name,
              logo: scorer.team.crest,
            },
            goals: {
              total: scorer.goals,
              assists: scorer.assists || 0,
            },
            games: {
              appearences: scorer.playedMatches,
              minutes: scorer.minutesPlayed || 0,
            },
          },
        ],
      }));

      console.log(
        `Successfully fetched ${formattedScorers.length} top scorers for ${normalizedLeague}`
      );
      return { topScorers: formattedScorers };
    } catch (error) {
      console.error(
        `Error fetching top scorers for ${normalizedLeague}:`,
        error
      );

      // Provide mock data on error
      return getMockTopScorers(normalizedLeague);
    }
  }
);

/**
 * Fetches team statistics for a specific team in a league
 */
export const getTeamStatistics = cache(
  async (league: League, teamId: number): Promise<TeamStatisticsResult> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { statistics: null, error: "API key not configured" };
    }

    const leagueCode = leagueCodeMap[league];

    try {
      const headers = getHeaders();

      console.log(
        `Fetching team statistics for team ${teamId} in ${league} (${leagueCode})`
      );

      // First we need to get team matches to calculate stats
      const matchesResponse = await fetch(
        `${API_URL}/teams/${teamId}/matches?competitions=${leagueCode}&status=FINISHED`,
        {
          method: "GET",
          headers: headers as HeadersInit,
          next: { revalidate: 3600 },
        }
      );

      if (!matchesResponse.ok) {
        throw new Error(
          `Failed to fetch team matches: ${matchesResponse.status}`
        );
      }

      const matchesData = await matchesResponse.json();
      const matches = matchesData.matches || [];

      if (matches.length === 0) {
        console.warn(`No matches found for team ${teamId} in ${league}`);
        return getMockTeamStatistics(league, teamId);
      }

      // Get team info
      const teamResponse = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "GET",
        headers: headers as HeadersInit,
        next: { revalidate: 86400 }, // Cache for a day
      });

      if (!teamResponse.ok) {
        throw new Error(`Failed to fetch team info: ${teamResponse.status}`);
      }

      const teamData = await teamResponse.json();

      // Calculate statistics from matches
      const homeMatches = matches.filter(
        (match: any) => match.homeTeam.id === teamId
      );
      const awayMatches = matches.filter(
        (match: any) => match.awayTeam.id === teamId
      );

      const totalMatches = matches.length;
      const homePlayed = homeMatches.length;
      const awayPlayed = awayMatches.length;

      // Calculate wins, draws, losses
      const homeWins = homeMatches.filter(
        (match: any) => match.score.winner === "HOME_TEAM"
      ).length;
      const homeDraws = homeMatches.filter(
        (match: any) => match.score.winner === "DRAW"
      ).length;
      const homeLosses = homeMatches.filter(
        (match: any) => match.score.winner === "AWAY_TEAM"
      ).length;

      const awayWins = awayMatches.filter(
        (match: any) => match.score.winner === "AWAY_TEAM"
      ).length;
      const awayDraws = awayMatches.filter(
        (match: any) => match.score.winner === "DRAW"
      ).length;
      const awayLosses = awayMatches.filter(
        (match: any) => match.score.winner === "HOME_TEAM"
      ).length;

      const totalWins = homeWins + awayWins;
      const totalDraws = homeDraws + awayDraws;
      const totalLosses = homeLosses + awayLosses;

      // Calculate goals
      const homeGoalsFor = homeMatches.reduce(
        (sum: number, match: any) => sum + (match.score.fullTime.home || 0),
        0
      );
      const homeGoalsAgainst = homeMatches.reduce(
        (sum: number, match: any) => sum + (match.score.fullTime.away || 0),
        0
      );

      const awayGoalsFor = awayMatches.reduce(
        (sum: number, match: any) => sum + (match.score.fullTime.away || 0),
        0
      );
      const awayGoalsAgainst = awayMatches.reduce(
        (sum: number, match: any) => sum + (match.score.fullTime.home || 0),
        0
      );

      const totalGoalsFor = homeGoalsFor + awayGoalsFor;
      const totalGoalsAgainst = homeGoalsAgainst + awayGoalsAgainst;

      // Calculate average goals
      const homeGoalsForAvg =
        homePlayed > 0 ? (homeGoalsFor / homePlayed).toFixed(2) : "0.00";
      const homeGoalsAgainstAvg =
        homePlayed > 0 ? (homeGoalsAgainst / homePlayed).toFixed(2) : "0.00";
      const awayGoalsForAvg =
        awayPlayed > 0 ? (awayGoalsFor / awayPlayed).toFixed(2) : "0.00";
      const awayGoalsAgainstAvg =
        awayPlayed > 0 ? (awayGoalsAgainst / awayPlayed).toFixed(2) : "0.00";
      const totalGoalsForAvg =
        totalMatches > 0 ? (totalGoalsFor / totalMatches).toFixed(2) : "0.00";
      const totalGoalsAgainstAvg =
        totalMatches > 0
          ? (totalGoalsAgainst / totalMatches).toFixed(2)
          : "0.00";

      // Create form string (last 5 matches: W, D, L)
      const lastFiveMatches = [...matches]
        .sort(
          (a: any, b: any) =>
            new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
        )
        .slice(0, 5);

      const form = lastFiveMatches
        .map((match: any) => {
          if (match.homeTeam.id === teamId) {
            if (match.score.winner === "HOME_TEAM") return "W";
            if (match.score.winner === "DRAW") return "D";
            return "L";
          } else {
            if (match.score.winner === "AWAY_TEAM") return "W";
            if (match.score.winner === "DRAW") return "D";
            return "L";
          }
        })
        .join("");

      // Construct statistics object
      const statistics = {
        team: {
          id: teamId,
          name: teamData.name || teamData.shortName,
          logo: teamData.crest,
        },
        league: {
          id: parseInt(matchesData.competition?.id) || 0,
          name: matchesData.competition?.name || "",
          country: matchesData.competition?.area?.name || "",
          logo: matchesData.competition?.emblem || "",
          season: matchesData.competition?.season?.id || getCurrentSeason(),
        },
        form,
        fixtures: {
          played: { home: homePlayed, away: awayPlayed, total: totalMatches },
          wins: { home: homeWins, away: awayWins, total: totalWins },
          draws: { home: homeDraws, away: awayDraws, total: totalDraws },
          loses: { home: homeLosses, away: awayLosses, total: totalLosses },
        },
        goals: {
          for: {
            total: {
              home: homeGoalsFor,
              away: awayGoalsFor,
              total: totalGoalsFor,
            },
            average: {
              home: homeGoalsForAvg,
              away: awayGoalsForAvg,
              total: totalGoalsForAvg,
            },
            minute: {}, // We don't have minute data from football-data.org
          },
          against: {
            total: {
              home: homeGoalsAgainst,
              away: awayGoalsAgainst,
              total: totalGoalsAgainst,
            },
            average: {
              home: homeGoalsAgainstAvg,
              away: awayGoalsAgainstAvg,
              total: totalGoalsAgainstAvg,
            },
            minute: {}, // We don't have minute data from football-data.org
          },
        },
      };

      console.log(
        `Successfully fetched statistics for team ${teamId} in ${league}`
      );
      return { statistics };
    } catch (error) {
      console.error(
        `Error fetching team statistics for ${teamId} in ${league}:`,
        error
      );
      return getMockTeamStatistics(league, teamId);
    }
  }
);

/**
 * Get mock team statistics
 */
function getMockTeamStatistics(
  league: League,
  teamId: number
): TeamStatisticsResult {
  console.log(`Using mock team statistics for team ${teamId} in ${league}`);

  // Default mock statistics
  return {
    statistics: {
      team: {
        id: teamId,
        name: "Team " + teamId,
        logo: `https://media.api-sports.io/football/teams/${teamId}.png`,
      },
      league: {
        id: 0,
        name: league,
        country: "Country",
        logo: `https://media.api-sports.io/football/leagues/0.png`,
        season: getCurrentSeason(),
      },
      form: "WDWLW",
      fixtures: {
        played: { home: 10, away: 10, total: 20 },
        wins: { home: 6, away: 4, total: 10 },
        draws: { home: 2, away: 3, total: 5 },
        loses: { home: 2, away: 3, total: 5 },
      },
      goals: {
        for: {
          total: { home: 18, away: 12, total: 30 },
          average: { home: "1.80", away: "1.20", total: "1.50" },
          minute: {},
        },
        against: {
          total: { home: 8, away: 15, total: 23 },
          average: { home: "0.80", away: "1.50", total: "1.15" },
          minute: {},
        },
      },
    },
  };
}

/**
 * Fetches players for a team
 */
export const getTeamPlayers = cache(
  async (teamId: number): Promise<PlayersResult> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { players: [], error: "API key not configured" };
    }

    try {
      const headers = getHeaders();

      console.log(`Fetching players for team ${teamId}`);

      // In v4 API, teams endpoint includes the squad
      const response = await fetch(`${API_URL}/teams/${teamId}`, {
        method: "GET",
        headers: headers as HeadersInit,
        next: { revalidate: 86400 }, // Cache for a day
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch team players: ${response.status}`);
      }

      const data = await response.json();

      if (!data.squad || data.squad.length === 0) {
        console.warn(`No players found for team ${teamId}`);
        return getMockPlayers(teamId);
      }

      // Transform the data to our expected format
      const players = data.squad.map((player: any) => ({
        player: {
          id: player.id,
          name: player.name,
          firstname: player.name.split(" ")[0] || "",
          lastname: player.name.split(" ").slice(1).join(" ") || "",
          age: calculateAge(player.dateOfBirth),
          nationality: player.nationality,
          height: "", // Not provided by the API
          weight: "", // Not provided by the API
          photo: `https://media.api-sports.io/football/players/${player.id}.png`, // Placeholder
        },
        statistics: [
          {
            team: {
              id: teamId,
              name: data.name || data.shortName,
              logo: data.crest,
            },
            league: {
              id: 0, // We don't have league info here
              name: "",
              country: "",
              logo: "",
              season: getCurrentSeason(),
            },
            games: {
              appearences: 0, // Not provided by the API
              lineups: 0,
              minutes: 0,
              position: player.position,
              rating: "0",
            },
            goals: {
              total: 0, // Not provided by the API
              assists: 0,
            },
            shots: {
              total: 0, // Not provided by the API
              on: 0,
            },
            passes: {
              total: 0, // Not provided by the API
              key: 0,
              accuracy: 0,
            },
          },
        ],
      }));

      console.log(
        `Successfully fetched ${players.length} players for team ${teamId}`
      );
      return { players };
    } catch (error) {
      console.error(`Error fetching players for team ${teamId}:`, error);
      return getMockPlayers(teamId);
    }
  }
);

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Get mock players for a team
 */
function getMockPlayers(teamId: number): PlayersResult {
  console.log(`Using mock players for team ${teamId}`);

  // Generate mock players
  const positions = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];
  const nationalities = [
    "England",
    "Spain",
    "Germany",
    "France",
    "Italy",
    "Brazil",
    "Argentina",
  ];

  const players = Array.from({ length: 18 }, (_, i) => {
    const position = positions[Math.floor(Math.random() * positions.length)];
    const nationality =
      nationalities[Math.floor(Math.random() * nationalities.length)];
    const playerId = 10000 + i;

    return {
      player: {
        id: playerId,
        name: `Player ${playerId}`,
        firstname: `Player`,
        lastname: `${playerId}`,
        age: 20 + Math.floor(Math.random() * 15),
        nationality,
        height: `${175 + Math.floor(Math.random() * 20)} cm`,
        weight: `${70 + Math.floor(Math.random() * 20)} kg`,
        photo: `https://media.api-sports.io/football/players/${playerId}.png`,
      },
      statistics: [
        {
          team: {
            id: teamId,
            name: `Team ${teamId}`,
            logo: `https://media.api-sports.io/football/teams/${teamId}.png`,
          },
          league: {
            id: 0,
            name: "League",
            country: "Country",
            logo: "https://media.api-sports.io/football/leagues/0.png",
            season: getCurrentSeason(),
          },
          games: {
            appearences: Math.floor(Math.random() * 30),
            lineups: Math.floor(Math.random() * 25),
            minutes: Math.floor(Math.random() * 2500),
            position,
            rating: (6 + Math.random() * 2).toFixed(1),
          },
          goals: {
            total:
              position === "Attacker"
                ? Math.floor(Math.random() * 20)
                : position === "Midfielder"
                ? Math.floor(Math.random() * 10)
                : Math.floor(Math.random() * 3),
            assists:
              position === "Attacker" || position === "Midfielder"
                ? Math.floor(Math.random() * 10)
                : Math.floor(Math.random() * 3),
          },
          shots: {
            total: Math.floor(Math.random() * 50),
            on: Math.floor(Math.random() * 30),
          },
          passes: {
            total: Math.floor(Math.random() * 1000),
            key: Math.floor(Math.random() * 30),
            accuracy: Math.floor(Math.random() * 90),
          },
        },
      ],
    };
  });

  return { players };
}

/**
 * Fetches live scores for a specific league
 */
export const getLiveScores = cache(
  async (league?: League): Promise<FixturesResult> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { fixtures: [], error: "API key not configured" };
    }

    try {
      const headers = getHeaders();

      let url = `${API_URL}/matches?status=LIVE,IN_PLAY,PAUSED`;

      // Add league filter if specified
      if (league) {
        const leagueCode = leagueCodeMap[league];
        url = `${API_URL}/competitions/${leagueCode}/matches?status=LIVE,IN_PLAY,PAUSED`;
      }

      console.log(`Fetching live scores${league ? ` for ${league}` : ""}`);

      const response = await fetch(url, {
        method: "GET",
        headers: headers as HeadersInit,
        cache: "no-store", // Don't cache live scores
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch live scores: ${response.status}`);
      }

      const data = await response.json();
      const matches = data.matches || [];

      if (matches.length === 0) {
        console.log("No live matches found, using mock data");
        return getMockLiveScores(league);
      }

      // Transform the data to match our expected format
      const fixtures = matches.map((match: any) => ({
        league: {
          id: match.competition?.id || 0,
          name: match.competition?.name || "Unknown League",
          logo: match.competition?.emblem || "",
          round: match.matchday
            ? `Matchday ${match.matchday}`
            : "Regular Season",
        },
        teams: {
          home: {
            id: match.homeTeam.id,
            name: match.homeTeam.name || match.homeTeam.shortName,
            logo: match.homeTeam.crest,
          },
          away: {
            id: match.awayTeam.id,
            name: match.awayTeam.name || match.awayTeam.shortName,
            logo: match.awayTeam.crest,
          },
        },
        goals: {
          home:
            match.score?.fullTime?.home !== null
              ? match.score.fullTime.home
              : match.score?.halfTime?.home,
          away:
            match.score?.fullTime?.away !== null
              ? match.score.fullTime.away
              : match.score?.halfTime?.away,
        },
        fixture: {
          id: match.id,
          date: match.utcDate,
          status: {
            short: match.status,
            long: getStatusLong(match.status),
          },
          venue: {
            name: match.venue || "Unknown Venue",
            city: "",
          },
        },
      }));

      console.log(`Successfully fetched ${fixtures.length} live matches`);
      return { fixtures };
    } catch (error) {
      console.error(`Error fetching live scores:`, error);
      return getMockLiveScores(league);
    }
  }
);

/**
 * Fetches match results for a specific league
 */
export const getMatchResults = cache(
  async (league: League, last = 10): Promise<MatchResultsResult> => {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
      console.error("API key not configured in environment variables");
      return { results: [], error: "API key not configured" };
    }

    const leagueCode = leagueCodeMap[league];

    try {
      const headers = getHeaders();

      // Calculate date range for past matches
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(today.getDate() - 30); // Look back 30 days

      const fromDate = oneMonthAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      // Fetch finished matches within the date range using v4 API
      const url = `${API_URL}/competitions/${leagueCode}/matches?dateFrom=${fromDate}&dateTo=${toDate}&status=FINISHED`;

      console.log(
        `Fetching match results for ${league} from ${fromDate} to ${toDate}`
      );

      const response = await fetch(url, {
        method: "GET",
        headers: headers as HeadersInit,
        next: { revalidate: 3600 }, // Revalidate every hour
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch match results: ${response.status}`);
      }

      const data = await response.json();
      let matches = data.matches || [];

      if (matches.length === 0) {
        console.log(`No match results found for ${league}, using mock data`);
        return getMockMatchResults(league);
      }

      // Transform the data to match our expected format
      const results = matches.map((match: any) => ({
        league: {
          id: data.competition?.id || 0,
          name: data.competition?.name || "Unknown League",
          logo: data.competition?.emblem || "",
          round: match.matchday
            ? `Matchday ${match.matchday}`
            : "Regular Season",
        },
        teams: {
          home: {
            id: match.homeTeam.id,
            name: match.homeTeam.name || match.homeTeam.shortName,
            logo: match.homeTeam.crest,
          },
          away: {
            id: match.awayTeam.id,
            name: match.awayTeam.name || match.awayTeam.shortName,
            logo: match.awayTeam.crest,
          },
        },
        goals: {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away,
        },
        fixture: {
          id: match.id,
          date: match.utcDate,
          status: {
            short: match.status,
            long: getStatusLong(match.status),
          },
          venue: {
            name: match.venue || "Unknown Venue",
            city: "",
          },
        },
      }));

      // Sort results by date, most recent first
      results.sort((a: any, b: any) => {
        return (
          new Date(b.fixture.date).getTime() -
          new Date(a.fixture.date).getTime()
        );
      });

      // Limit to requested number of results
      const limitedResults = results.slice(0, last);

      console.log(
        `Successfully fetched ${limitedResults.length} match results for ${league}`
      );
      return { results: limitedResults };
    } catch (error) {
      console.error(`Error fetching match results for ${league}:`, error);
      return getMockMatchResults(league);
    }
  }
);

/**
 * Get mock live scores
 */
function getMockLiveScores(league?: League): FixturesResult {
  const mockLiveFixtures: Record<string, FixtureResponse[]> = {
    // Mock fixtures for each league
    premierLeague: [
      // ... existing mock data ...
    ],
    serieA: [
      // ... existing mock data ...
    ],
    laliga: [
      // ... existing mock data ...
    ],
    bundesliga: [
      // ... existing mock data ...
    ],
    ligue1: [
      // ... existing mock data ...
    ],
    "serie-a": [], // Add empty array for serie-a
    other: [], // Add empty array for other leagues
  };

  // If a specific league is requested, return only those fixtures
  if (league) {
    return { fixtures: mockLiveFixtures[league] || [] };
  }

  // If no specific league is requested, return all mock live fixtures
  const allFixtures: FixtureResponse[] = Object.values(mockLiveFixtures).flat();
  return { fixtures: allFixtures };
}

/**
 * Get mock match results
 */
function getMockMatchResults(league: League): MatchResultsResult {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const mockResultsMap: Record<League, FixtureResponse[]> = {
    premierLeague: [
      // ... existing mock data ...
    ],
    serieA: [
      // ... existing mock data ...
    ],
    laliga: [
      // ... existing mock data ...
    ],
    bundesliga: [
      // ... existing mock data ...
    ],
    ligue1: [
      // ... existing mock data ...
    ],
    "serie-a": [], // Add empty array for serie-a
    other: [], // Add empty array for other leagues
  };

  return { results: mockResultsMap[league] || [] };
}

/**
 * Helper function to determine the current football season
 * Football seasons typically run from August to May
 */
function getCurrentSeason(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

  // Football season typically starts in August.
  // If we're in the first half of the year, we're in the previous season's year
  if (currentMonth < 8) {
    return currentYear - 1;
  }
  return currentYear;
}

/**
 * Get mock standings data for a league
 */
function getMockStandings(league: League | string): StandingsResult {
  console.log(`Using mock standings data for ${league}`);

  // Normalize league name for mock data lookup
  const normalizedLeague = league === "serie-a" ? "serieA" : league;

  const mockStandings: Record<string, StandingResponse> = {
    premierLeague: {
      league: {
        id: 39,
        name: "Premier League",
        country: "England",
        logo: "https://media.api-sports.io/football/leagues/39.png",
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 50,
                name: "Manchester City",
                logo: "https://media.api-sports.io/football/teams/50.png",
              },
              points: 84,
              goalsDiff: 61,
              all: {
                played: 38,
                win: 27,
                draw: 3,
                lose: 8,
                goals: {
                  for: 94,
                  against: 33,
                },
              },
            },
            {
              rank: 2,
              team: {
                id: 42,
                name: "Arsenal",
                logo: "https://media.api-sports.io/football/teams/42.png",
              },
              points: 82,
              goalsDiff: 54,
              all: {
                played: 38,
                win: 26,
                draw: 4,
                lose: 8,
                goals: {
                  for: 85,
                  against: 31,
                },
              },
            },
            {
              rank: 3,
              team: {
                id: 40,
                name: "Liverpool",
                logo: "https://media.api-sports.io/football/teams/40.png",
              },
              points: 75,
              goalsDiff: 46,
              all: {
                played: 38,
                win: 23,
                draw: 6,
                lose: 9,
                goals: {
                  for: 77,
                  against: 31,
                },
              },
            },
          ],
        ],
      },
    },
    serieA: {
      league: {
        id: 135,
        name: "Serie A",
        country: "Italy",
        logo: "https://media.api-sports.io/football/leagues/135.png",
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 505,
                name: "Inter",
                logo: "https://media.api-sports.io/football/teams/505.png",
              },
              points: 86,
              goalsDiff: 54,
              all: {
                played: 38,
                win: 27,
                draw: 5,
                lose: 6,
                goals: {
                  for: 81,
                  against: 27,
                },
              },
            },
            {
              rank: 2,
              team: {
                id: 489,
                name: "AC Milan",
                logo: "https://media.api-sports.io/football/teams/489.png",
              },
              points: 71,
              goalsDiff: 24,
              all: {
                played: 38,
                win: 21,
                draw: 8,
                lose: 9,
                goals: {
                  for: 63,
                  against: 39,
                },
              },
            },
            {
              rank: 3,
              team: {
                id: 496,
                name: "Juventus",
                logo: "https://media.api-sports.io/football/teams/496.png",
              },
              points: 67,
              goalsDiff: 22,
              all: {
                played: 38,
                win: 19,
                draw: 10,
                lose: 9,
                goals: {
                  for: 53,
                  against: 31,
                },
              },
            },
          ],
        ],
      },
    },
    laliga: {
      league: {
        id: 140,
        name: "La Liga",
        country: "Spain",
        logo: "https://media.api-sports.io/football/leagues/140.png",
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 541,
                name: "Real Madrid",
                logo: "https://media.api-sports.io/football/teams/541.png",
              },
              points: 85,
              goalsDiff: 52,
              all: {
                played: 38,
                win: 26,
                draw: 7,
                lose: 5,
                goals: {
                  for: 76,
                  against: 24,
                },
              },
            },
            {
              rank: 2,
              team: {
                id: 529,
                name: "Barcelona",
                logo: "https://media.api-sports.io/football/teams/529.png",
              },
              points: 73,
              goalsDiff: 41,
              all: {
                played: 38,
                win: 22,
                draw: 7,
                lose: 9,
                goals: {
                  for: 68,
                  against: 27,
                },
              },
            },
            {
              rank: 3,
              team: {
                id: 530,
                name: "Atletico Madrid",
                logo: "https://media.api-sports.io/football/teams/530.png",
              },
              points: 70,
              goalsDiff: 21,
              all: {
                played: 38,
                win: 21,
                draw: 7,
                lose: 10,
                goals: {
                  for: 63,
                  against: 42,
                },
              },
            },
          ],
        ],
      },
    },
    bundesliga: {
      league: {
        id: 78,
        name: "Bundesliga",
        country: "Germany",
        logo: "https://media.api-sports.io/football/leagues/78.png",
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 157,
                name: "Bayern Munich",
                logo: "https://media.api-sports.io/football/teams/157.png",
              },
              points: 79,
              goalsDiff: 56,
              all: {
                played: 34,
                win: 24,
                draw: 7,
                lose: 3,
                goals: {
                  for: 92,
                  against: 36,
                },
              },
            },
            {
              rank: 2,
              team: {
                id: 165,
                name: "Borussia Dortmund",
                logo: "https://media.api-sports.io/football/teams/165.png",
              },
              points: 67,
              goalsDiff: 32,
              all: {
                played: 34,
                win: 20,
                draw: 7,
                lose: 7,
                goals: {
                  for: 75,
                  against: 43,
                },
              },
            },
            {
              rank: 3,
              team: {
                id: 168,
                name: "Bayer Leverkusen",
                logo: "https://media.api-sports.io/football/teams/168.png",
              },
              points: 59,
              goalsDiff: 23,
              all: {
                played: 34,
                win: 17,
                draw: 8,
                lose: 9,
                goals: {
                  for: 67,
                  against: 44,
                },
              },
            },
          ],
        ],
      },
    },
    ligue1: {
      league: {
        id: 61,
        name: "Ligue 1",
        country: "France",
        logo: "https://media.api-sports.io/football/leagues/61.png",
        standings: [
          [
            {
              rank: 1,
              team: {
                id: 85,
                name: "Paris Saint Germain",
                logo: "https://media.api-sports.io/football/teams/85.png",
              },
              points: 82,
              goalsDiff: 53,
              all: {
                played: 38,
                win: 25,
                draw: 7,
                lose: 6,
                goals: {
                  for: 86,
                  against: 33,
                },
              },
            },
            {
              rank: 2,
              team: {
                id: 79,
                name: "Lille",
                logo: "https://media.api-sports.io/football/teams/79.png",
              },
              points: 70,
              goalsDiff: 26,
              all: {
                played: 38,
                win: 20,
                draw: 10,
                lose: 8,
                goals: {
                  for: 60,
                  against: 34,
                },
              },
            },
            {
              rank: 3,
              team: {
                id: 80,
                name: "Monaco",
                logo: "https://media.api-sports.io/football/teams/80.png",
              },
              points: 65,
              goalsDiff: 20,
              all: {
                played: 38,
                win: 19,
                draw: 8,
                lose: 11,
                goals: {
                  for: 68,
                  against: 48,
                },
              },
            },
          ],
        ],
      },
    },
    "serie-a": {
      league: {
        id: 135,
        name: "Serie A",
        country: "Italy",
        logo: "https://media.api-sports.io/football/leagues/135.png",
        standings: [[]],
      },
    },
    other: {
      league: {
        id: 0,
        name: "Other",
        country: "International",
        logo: "https://media.api-sports.io/football/leagues/0.png",
        standings: [[]],
      },
    },
  };

  return {
    standings: mockStandings[normalizedLeague as string] || null,
  };
}

/**
 * Get mock top scorers data for a league
 */
function getMockTopScorers(league: League | string): TopScorersResult {
  console.log(`Using mock top scorers data for ${league}`);

  // Normalize league name for mock data lookup
  const normalizedLeague = league === "serie-a" ? "serieA" : league;

  const mockTopScorers: Record<string, ScorerResponse[]> = {
    premierLeague: [
      {
        player: {
          id: 1100,
          name: "Erling Haaland",
          photo: "https://media.api-sports.io/football/players/1100.png",
          nationality: "Norway",
        },
        statistics: [
          {
            team: {
              id: 50,
              name: "Manchester City",
              logo: "https://media.api-sports.io/football/teams/50.png",
            },
            goals: {
              total: 27,
              assists: 5,
            },
            games: {
              appearences: 30,
              minutes: 2650,
            },
          },
        ],
      },
      {
        player: {
          id: 1161,
          name: "Mohamed Salah",
          photo: "https://media.api-sports.io/football/players/1161.png",
          nationality: "Egypt",
        },
        statistics: [
          {
            team: {
              id: 40,
              name: "Liverpool",
              logo: "https://media.api-sports.io/football/teams/40.png",
            },
            goals: {
              total: 19,
              assists: 10,
            },
            games: {
              appearences: 32,
              minutes: 2800,
            },
          },
        ],
      },
      {
        player: {
          id: 909,
          name: "Son Heung-Min",
          photo: "https://media.api-sports.io/football/players/909.png",
          nationality: "South Korea",
        },
        statistics: [
          {
            team: {
              id: 47,
              name: "Tottenham",
              logo: "https://media.api-sports.io/football/teams/47.png",
            },
            goals: {
              total: 17,
              assists: 8,
            },
            games: {
              appearences: 32,
              minutes: 2700,
            },
          },
        ],
      },
    ],
    serieA: [
      {
        player: {
          id: 1500,
          name: "Lautaro Martinez",
          photo: "https://media.api-sports.io/football/players/1500.png",
          nationality: "Argentina",
        },
        statistics: [
          {
            team: {
              id: 505,
              name: "Inter",
              logo: "https://media.api-sports.io/football/teams/505.png",
            },
            goals: {
              total: 24,
              assists: 6,
            },
            games: {
              appearences: 33,
              minutes: 2750,
            },
          },
        ],
      },
      {
        player: {
          id: 317,
          name: "Dusan Vlahovic",
          photo: "https://media.api-sports.io/football/players/317.png",
          nationality: "Serbia",
        },
        statistics: [
          {
            team: {
              id: 496,
              name: "Juventus",
              logo: "https://media.api-sports.io/football/teams/496.png",
            },
            goals: {
              total: 16,
              assists: 4,
            },
            games: {
              appearences: 30,
              minutes: 2600,
            },
          },
        ],
      },
      {
        player: {
          id: 882,
          name: "Olivier Giroud",
          photo: "https://media.api-sports.io/football/players/882.png",
          nationality: "France",
        },
        statistics: [
          {
            team: {
              id: 489,
              name: "AC Milan",
              logo: "https://media.api-sports.io/football/teams/489.png",
            },
            goals: {
              total: 15,
              assists: 7,
            },
            games: {
              appearences: 32,
              minutes: 2500,
            },
          },
        ],
      },
    ],
    laliga: [
      {
        player: {
          id: 732,
          name: "Jude Bellingham",
          photo: "https://media.api-sports.io/football/players/732.png",
          nationality: "England",
        },
        statistics: [
          {
            team: {
              id: 541,
              name: "Real Madrid",
              logo: "https://media.api-sports.io/football/teams/541.png",
            },
            goals: {
              total: 19,
              assists: 6,
            },
            games: {
              appearences: 31,
              minutes: 2700,
            },
          },
        ],
      },
      {
        player: {
          id: 635,
          name: "Robert Lewandowski",
          photo: "https://media.api-sports.io/football/players/635.png",
          nationality: "Poland",
        },
        statistics: [
          {
            team: {
              id: 529,
              name: "Barcelona",
              logo: "https://media.api-sports.io/football/teams/529.png",
            },
            goals: {
              total: 18,
              assists: 5,
            },
            games: {
              appearences: 30,
              minutes: 2600,
            },
          },
        ],
      },
      {
        player: {
          id: 774,
          name: "Antoine Griezmann",
          photo: "https://media.api-sports.io/football/players/774.png",
          nationality: "France",
        },
        statistics: [
          {
            team: {
              id: 530,
              name: "Atletico Madrid",
              logo: "https://media.api-sports.io/football/teams/530.png",
            },
            goals: {
              total: 15,
              assists: 8,
            },
            games: {
              appearences: 32,
              minutes: 2800,
            },
          },
        ],
      },
    ],
    bundesliga: [
      {
        player: {
          id: 521,
          name: "Robert Lewandowski",
          photo: "https://media.api-sports.io/football/players/521.png",
          nationality: "Poland",
        },
        statistics: [
          {
            team: {
              id: 157,
              name: "Bayern Munich",
              logo: "https://media.api-sports.io/football/teams/157.png",
            },
            goals: {
              total: 22,
              assists: 7,
            },
            games: {
              appearences: 30,
              minutes: 2700,
            },
          },
        ],
      },
      {
        player: {
          id: 1,
          name: "Erling Haaland",
          photo: "https://media.api-sports.io/football/players/1.png",
          nationality: "Norway",
        },
        statistics: [
          {
            team: {
              id: 165,
              name: "Borussia Dortmund",
              logo: "https://media.api-sports.io/football/teams/165.png",
            },
            goals: {
              total: 18,
              assists: 5,
            },
            games: {
              appearences: 28,
              minutes: 2520,
            },
          },
        ],
      },
      {
        player: {
          id: 56,
          name: "Patrik Schick",
          photo: "https://media.api-sports.io/football/players/56.png",
          nationality: "Czech Republic",
        },
        statistics: [
          {
            team: {
              id: 168,
              name: "Bayer Leverkusen",
              logo: "https://media.api-sports.io/football/teams/168.png",
            },
            goals: {
              total: 16,
              assists: 3,
            },
            games: {
              appearences: 27,
              minutes: 2400,
            },
          },
        ],
      },
    ],
    ligue1: [
      {
        player: {
          id: 278,
          name: "Kylian Mbappe",
          photo: "https://media.api-sports.io/football/players/278.png",
          nationality: "France",
        },
        statistics: [
          {
            team: {
              id: 85,
              name: "Paris Saint Germain",
              logo: "https://media.api-sports.io/football/teams/85.png",
            },
            goals: {
              total: 26,
              assists: 8,
            },
            games: {
              appearences: 29,
              minutes: 2500,
            },
          },
        ],
      },
      {
        player: {
          id: 2664,
          name: "Jonathan David",
          photo: "https://media.api-sports.io/football/players/2664.png",
          nationality: "Canada",
        },
        statistics: [
          {
            team: {
              id: 79,
              name: "Lille",
              logo: "https://media.api-sports.io/football/teams/79.png",
            },
            goals: {
              total: 17,
              assists: 4,
            },
            games: {
              appearences: 33,
              minutes: 2850,
            },
          },
        ],
      },
      {
        player: {
          id: 3247,
          name: "Wissam Ben Yedder",
          photo: "https://media.api-sports.io/football/players/3247.png",
          nationality: "France",
        },
        statistics: [
          {
            team: {
              id: 80,
              name: "Monaco",
              logo: "https://media.api-sports.io/football/teams/80.png",
            },
            goals: {
              total: 16,
              assists: 3,
            },
            games: {
              appearences: 31,
              minutes: 2600,
            },
          },
        ],
      },
    ],
    "serie-a": [],
    other: [],
  };

  return {
    topScorers: mockTopScorers[normalizedLeague as string] || [],
  };
}

/**
 * Get mock fixtures data for a league
 */
function getMockFixtures(league: League): FixturesResult {
  console.log(`Using mock fixtures data for ${league}`);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(now.getDate() + 2);

  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);

  const mockFixtures: Record<string, FixtureResponse[]> = {
    premierLeague: [
      {
        league: {
          id: 39,
          name: "Premier League",
          logo: "https://media.api-sports.io/football/leagues/39.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 40,
            name: "Liverpool",
            logo: "https://media.api-sports.io/football/teams/40.png",
          },
          away: {
            id: 50,
            name: "Manchester City",
            logo: "https://media.api-sports.io/football/teams/50.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000001,
          date: tomorrow.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Anfield", city: "Liverpool" },
        },
      },
      {
        league: {
          id: 39,
          name: "Premier League",
          logo: "https://media.api-sports.io/football/leagues/39.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 33,
            name: "Manchester United",
            logo: "https://media.api-sports.io/football/teams/33.png",
          },
          away: {
            id: 47,
            name: "Tottenham",
            logo: "https://media.api-sports.io/football/teams/47.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000002,
          date: twoDaysLater.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Old Trafford", city: "Manchester" },
        },
      },
    ],
    serieA: [
      {
        league: {
          id: 135,
          name: "Serie A",
          logo: "https://media.api-sports.io/football/leagues/135.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 505,
            name: "Inter",
            logo: "https://media.api-sports.io/football/teams/505.png",
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
          id: 1000003,
          date: tomorrow.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Stadio Giuseppe Meazza", city: "Milano" },
        },
      },
      {
        league: {
          id: 135,
          name: "Serie A",
          logo: "https://media.api-sports.io/football/leagues/135.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 489,
            name: "AC Milan",
            logo: "https://media.api-sports.io/football/teams/489.png",
          },
          away: {
            id: 497,
            name: "AS Roma",
            logo: "https://media.api-sports.io/football/teams/497.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000004,
          date: threeDaysLater.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Stadio San Siro", city: "Milano" },
        },
      },
    ],
    laliga: [
      {
        league: {
          id: 140,
          name: "La Liga",
          logo: "https://media.api-sports.io/football/leagues/140.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 541,
            name: "Real Madrid",
            logo: "https://media.api-sports.io/football/teams/541.png",
          },
          away: {
            id: 529,
            name: "Barcelona",
            logo: "https://media.api-sports.io/football/teams/529.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000005,
          date: tomorrow.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Santiago Bernabéu", city: "Madrid" },
        },
      },
      {
        league: {
          id: 140,
          name: "La Liga",
          logo: "https://media.api-sports.io/football/leagues/140.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 530,
            name: "Atletico Madrid",
            logo: "https://media.api-sports.io/football/teams/530.png",
          },
          away: {
            id: 532,
            name: "Valencia",
            logo: "https://media.api-sports.io/football/teams/532.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000006,
          date: twoDaysLater.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Wanda Metropolitano", city: "Madrid" },
        },
      },
    ],
    bundesliga: [
      {
        league: {
          id: 78,
          name: "Bundesliga",
          logo: "https://media.api-sports.io/football/leagues/78.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 157,
            name: "Bayern Munich",
            logo: "https://media.api-sports.io/football/teams/157.png",
          },
          away: {
            id: 165,
            name: "Borussia Dortmund",
            logo: "https://media.api-sports.io/football/teams/165.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000007,
          date: tomorrow.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Allianz Arena", city: "München" },
        },
      },
      {
        league: {
          id: 78,
          name: "Bundesliga",
          logo: "https://media.api-sports.io/football/leagues/78.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 168,
            name: "Bayer Leverkusen",
            logo: "https://media.api-sports.io/football/teams/168.png",
          },
          away: {
            id: 167,
            name: "RB Leipzig",
            logo: "https://media.api-sports.io/football/teams/167.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000008,
          date: twoDaysLater.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "BayArena", city: "Leverkusen" },
        },
      },
    ],
    ligue1: [
      {
        league: {
          id: 61,
          name: "Ligue 1",
          logo: "https://media.api-sports.io/football/leagues/61.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 85,
            name: "Paris Saint Germain",
            logo: "https://media.api-sports.io/football/teams/85.png",
          },
          away: {
            id: 80,
            name: "Monaco",
            logo: "https://media.api-sports.io/football/teams/80.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000009,
          date: tomorrow.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Parc des Princes", city: "Paris" },
        },
      },
      {
        league: {
          id: 61,
          name: "Ligue 1",
          logo: "https://media.api-sports.io/football/leagues/61.png",
          round: "Regular Season - 12",
        },
        teams: {
          home: {
            id: 79,
            name: "Lille",
            logo: "https://media.api-sports.io/football/teams/79.png",
          },
          away: {
            id: 81,
            name: "Marseille",
            logo: "https://media.api-sports.io/football/teams/81.png",
          },
        },
        goals: {
          home: null,
          away: null,
        },
        fixture: {
          id: 1000010,
          date: twoDaysLater.toISOString(),
          status: { short: "SCHEDULED", long: "Scheduled" },
          venue: { name: "Stade Pierre-Mauroy", city: "Lille" },
        },
      },
    ],
    "serie-a": [],
    other: [],
  };

  return {
    fixtures: mockFixtures[league] || [],
  };
}
