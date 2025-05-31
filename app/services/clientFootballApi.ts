import axios from "axios";

const FOOTBALL_API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
const FOOTBALL_API_URL = "https://v3.football.api-sports.io";

// Create a configured axios instance
const footballApiClient = axios.create({
  baseURL: FOOTBALL_API_URL,
  headers: {
    "x-apisports-key": FOOTBALL_API_KEY,
    "Content-Type": "application/json",
  },
});

/**
 * Get fixtures (matches) for a specific league and season
 * @param leagueId - The ID of the league
 * @param season - The season year (e.g., 2023)
 */
export const getFixtures = async (leagueId: number, season: number) => {
  try {
    const response = await footballApiClient.get("/fixtures", {
      params: {
        league: leagueId,
        season: season,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    // Add a return statement for the error case or rethrow
    // For now, rethrowing to align with other functions
    throw error;
  }
};

/**
 * Get standings for a specific league and season
 * @param leagueId - The ID of the league
 * @param season - The season year (e.g., 2023)
 */
export const getStandings = async (leagueId: number, season: number) => {
  try {
    const response = await footballApiClient.get("/standings", {
      params: {
        league: leagueId,
        season: season,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching standings:", error);
    throw error;
  }
};

/**
 * Get information about a team
 * @param teamId - The ID of the team
 */
export const getTeamInfo = async (teamId: number) => {
  try {
    const response = await footballApiClient.get("/teams", {
      params: { id: teamId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching team info:", error);
    throw error;
  }
};

/**
 * Get player statistics for a specific team
 * @param teamId - The ID of the team
 * @param season - The season year (e.g., 2023)
 */
export const getTeamPlayers = async (teamId: number, season: number) => {
  try {
    const response = await footballApiClient.get("/players", {
      params: {
        team: teamId,
        season: season,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching team players:", error);
    throw error;
  }
};

/**
 * Get available leagues
 */
export const getLeagues = async () => {
  try {
    const response = await footballApiClient.get("/leagues");
    return response.data;
  } catch (error) {
    console.error("Error fetching leagues:", error);
    throw error;
  }
};

/**
 * Get live matches
 * Fetches all live matches across all leagues.
 */
export const getLiveMatches = async () => {
  try {
    const response = await footballApiClient.get("/fixtures", {
      params: { live: "all" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching live matches:", error);
    // Consider how the RisultatiPage handles this. It expects an object with a response property or null.
    // For now, returning an empty response array to prevent crashes, but ideally, handle errors gracefully in the component.
    return {
      response: [],
      isMockData: true,
      error: "Failed to fetch live matches",
    };
  }
};

/**
 * Get fixtures (matches) for a specific date.
 * @param date - The date string in 'YYYY-MM-DD' format.
 */
export const getFixturesByDate = async (date: string) => {
  try {
    const response = await footballApiClient.get("/fixtures", {
      params: {
        date: date,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching fixtures for date ${date}:`, error);
    // Consistent with getLiveMatches error handling for RisultatiPage
    return {
      response: [],
      isMockData: true,
      error: `Failed to fetch fixtures for ${date}`,
    };
  }
};

/**
 * Get team statistics for a specific league and season
 * @param teamId - The ID of the team
 * @param leagueId - The ID of the league
 * @param season - The season year (e.g., 2023)
 */
export const getTeamStatistics = async (
  teamId: number,
  leagueId: number,
  season: number
) => {
  try {
    const response = await footballApiClient.get("/teams/statistics", {
      params: {
        team: teamId,
        league: leagueId,
        season: season,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching team statistics:", error);
    throw error;
  }
};

/**
 * Get top scorers for a league and season
 * @param leagueId - The ID of the league
 * @param season - The season year (e.g., 2023)
 */
export const getTopScorers = async (leagueId: number, season: number) => {
  try {
    const response = await footballApiClient.get("/players/topscorers", {
      params: {
        league: leagueId,
        season: season,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching top scorers:", error);
    throw error;
  }
};

// It's common to export individual functions, but if a default export is preferred by the project structure:
// export default {
//   getFixtures,
//   getStandings,
//   getTeamInfo,
//   getTeamPlayers,
//   getLeagues,
//   getLiveMatches,
//   getFixturesByDate,
// };
