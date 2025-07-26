// WARNING: Always memoize the filters object before passing to usePatches!
// Example: const filters = useMemo(() => ({ ... }), [/* deps */]);
// Passing a new object on every render will cause infinite fetches.

import { useState, useEffect, useCallback } from 'react';
import { IPatch, PatchFilters } from '@/lib/types/patch';

interface UsePatchesReturn {
  patches: IPatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPatch: (patchData: any) => Promise<IPatch | null>;
  updatePatch: (id: string, patchData: any) => Promise<IPatch | null>;
  deletePatch: (id: string) => Promise<boolean>;
}

export function usePatches(filters: PatchFilters = {}): UsePatchesReturn {
  const [patches, setPatches] = useState<IPatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters.isFeatured !== undefined) params.append('featured', filters.isFeatured.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/patches?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patches');
      }

      const data = await response.json();
      setPatches(data.patches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching patches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatch = useCallback(async (patchData: any): Promise<IPatch | null> => {
    try {
      setError(null);
      
      const response = await fetch('/api/patches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patch');
      }

      const data = await response.json();
      setPatches(prev => [data.patch, ...prev]);
      return data.patch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patch');
      console.error('Error creating patch:', err);
      return null;
    }
  }, []);

  const updatePatch = useCallback(async (id: string, patchData: any): Promise<IPatch | null> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/patches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patch');
      }

      const data = await response.json();
      setPatches(prev => prev.map(patch => 
        patch._id === id ? data.patch : patch
      ));
      return data.patch;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patch');
      console.error('Error updating patch:', err);
      return null;
    }
  }, []);

  const deletePatch = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/patches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete patch');
      }

      setPatches(prev => prev.filter(patch => patch._id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete patch');
      console.error('Error deleting patch:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPatches();
  }, [fetchPatches]);

  return {
    patches,
    loading,
    error,
    refetch: fetchPatches,
    createPatch,
    updatePatch,
    deletePatch,
  };
}

// Hook for fetching a single patch
export function usePatch(id: string) {
  const [patch, setPatch] = useState<IPatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatch = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/patches/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patch');
        }

        const data = await response.json();
        setPatch(data.patch);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching patch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatch();
  }, [id]);

  return { patch, loading, error };
} 