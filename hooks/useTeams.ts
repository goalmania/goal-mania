import { useState, useEffect, useCallback } from "react";

export interface Team {
  _id: string;
  name: string;
  nickname: string;
  logo: string;
  href?: string;
  colors: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  isInternational: boolean;
  league?: string;
  country?: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseTeamsOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialIsInternational?: boolean | null;
  initialIsActive?: boolean | null;
}

export function useTeams(options: UseTeamsOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = "",
    initialIsInternational = null,
    initialIsActive = null,
  } = options;

  const [teams, setTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState<TeamPagination>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [isInternationalFilter, setIsInternationalFilter] = useState<boolean | null>(initialIsInternational);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(initialIsActive);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: currentLimit.toString(),
    });

    if (searchTerm) params.append("search", searchTerm);
    if (isInternationalFilter !== null) params.append("isInternational", isInternationalFilter.toString());
    if (isActiveFilter !== null) params.append("isActive", isActiveFilter.toString());

    return params.toString();
  }, [currentPage, currentLimit, searchTerm, isInternationalFilter, isActiveFilter]);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/teams?${queryString}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.statusText}`);
      }

      const data = await response.json();
      setTeams(data.teams);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch teams";
      setError(errorMessage);
      console.error("Error fetching teams:", err);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString]);

  const refreshTeams = useCallback(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(async (teamData: Omit<Team, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create team");
      }

      const newTeam = await response.json();
      
      // Refresh the teams list
      await fetchTeams();
      
      return newTeam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create team";
      setError(errorMessage);
      throw err;
    }
  }, [fetchTeams]);

  const updateTeam = useCallback(async (teamId: string, teamData: Partial<Team>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update team");
      }

      const updatedTeam = await response.json();
      
      // Update the team in local state
      setTeams(prev => prev.map(team => team._id === teamId ? updatedTeam : team));
      
      return updatedTeam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update team";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete team");
      }

      // Remove the team from local state
      setTeams(prev => prev.filter(team => team._id !== teamId));
      
      // Refresh if needed to maintain pagination
      await fetchTeams();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete team";
      setError(errorMessage);
      throw err;
    }
  }, [fetchTeams]);

  const reorderTeams = useCallback(async (reorderedTeams: Team[]) => {
    try {
      const teamOrders = reorderedTeams.map((team, index) => ({
        id: team._id,
        displayOrder: index + 1
      }));

      const response = await fetch("/api/teams/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamOrders }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reorder teams");
      }

      // Update local state with new order
      setTeams(reorderedTeams);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reorder teams";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const toggleTeamStatus = useCallback(async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/toggle-status`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle team status");
      }

      const result = await response.json();
      
      // Update the team in local state
      setTeams(prev => prev.map(team => 
        team._id === teamId ? { ...team, isActive: !team.isActive } : team
      ));
      
      return result.team;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle team status";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Effect to fetch teams when dependencies change
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentLimit,
    setCurrentLimit,
    isInternationalFilter,
    setIsInternationalFilter,
    isActiveFilter,
    setIsActiveFilter,
    fetchTeams,
    refreshTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    reorderTeams,
    toggleTeamStatus,
    clearError,
  };
} 