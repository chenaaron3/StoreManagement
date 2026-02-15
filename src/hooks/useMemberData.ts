import { useEffect, useState } from 'react';

import { fetchUser } from '@/data/mockData';

import type { User } from "@/types/data";

export interface UseMemberDataResult {
  data: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches a User (profile + memberships + purchases) by member id.
 * Use on the sales associate page to load customer insights.
 */
export function useMemberData(memberId: string | null): UseMemberDataResult {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!memberId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchUser(memberId)
      .then(setData)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load member data",
        );
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [memberId]);

  return { data, loading, error, refetch: load };
}
