import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseUsersOptions {
  initialLimit?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface CacheEntry {
  data: User[];
  pagination: PaginationInfo;
  timestamp: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const {
    initialLimit = 10,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateCacheKey = useCallback((params: FetchUsersParams) => {
    return `users_${params.page}_${params.limit}_${params.search || ""}`;
  }, []);

  const isCacheValid = useCallback((entry: CacheEntry) => {
    return Date.now() - entry.timestamp < cacheTimeout;
  }, [cacheTimeout]);

  const fetchUsers = useCallback(
    async (params: FetchUsersParams = {}) => {
      const { page = currentPage, limit = currentLimit, search = searchTerm } = params;
      
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      const cacheKey = generateCacheKey({ page, limit, search });

      // Check cache first
      if (enableCache) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && isCacheValid(cached)) {
          setUsers(cached.data);
          setPagination(cached.pagination);
          setCurrentPage(page);
          setCurrentLimit(limit);
          setSearchTerm(search);
          setError(null);
          return;
        }
      }

      try {
        setIsLoading(true);
        setError(null);

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/admin/users?page=${page}&limit=${limit}&search=${search}&_t=${timestamp}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            cache: "no-store",
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API response error:", response.status, errorText);
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        console.log("Users data received:", data);

        if (!data.users || !Array.isArray(data.users)) {
          console.error("Invalid data format:", data);
          throw new Error("Invalid response format");
        }

        const paginationInfo: PaginationInfo = {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || limit,
          totalPages: data.totalPages || 1,
          hasNextPage: data.page < data.totalPages,
          hasPreviousPage: data.page > 1,
        };

        // Cache the result
        if (enableCache) {
          cacheRef.current.set(cacheKey, {
            data: data.users,
            pagination: paginationInfo,
            timestamp: Date.now(),
          });
        }

        setUsers(data.users);
        setPagination(paginationInfo);
        setCurrentPage(page);
        setCurrentLimit(limit);
        // Only update searchTerm if it's different to avoid unnecessary re-renders
        if (searchTerm !== search) {
          setSearchTerm(search);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was cancelled, don't show error
          return;
        }
        console.error("Error fetching users:", error);
        setError(error instanceof Error ? error.message : "Failed to load users");
        toast.error("Failed to load users. Please try again.");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, currentLimit, searchTerm, enableCache, generateCacheKey, isCacheValid]
  );

  const refreshUsers = useCallback(() => {
    // Clear cache and refetch
    cacheRef.current.clear();
    return fetchUsers();
  }, [fetchUsers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success("User role updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
      return false;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      
      // Update pagination
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      }));

      toast.success("User deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
      return false;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: { name: string; role: string }) => {
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          name: updates.name,
          role: updates.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, ...updates } : user
        )
      );

      toast.success("User updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update user");
      return false;
    }
  }, []);

  // Cleanup function to abort requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    users,
    pagination,
    isLoading,
    error,
    searchTerm,
    currentPage,
    currentLimit,
    fetchUsers,
    refreshUsers,
    clearError,
    updateUserRole,
    deleteUser,
    updateUser,
    setSearchTerm,
    setCurrentPage,
    setCurrentLimit,
  };
} 