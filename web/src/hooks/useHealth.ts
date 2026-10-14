import { useEffect, useState } from 'react';

export interface Health {
  status: 'ok' | 'unavailable';
  sdkVersion?: string;
  model?: string;
  chunks?: number;
}

/** Polls /api/health so the header shows whether the API and index are ready. */
export function useHealth(intervalMs = 15000): Health | null {
  const [health, setHealth] = useState<Health | null>(null);
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/health');
        const body = (await res.json()) as Health;
        if (!cancelled) setHealth(body);
      } catch {
        if (!cancelled) setHealth({ status: 'unavailable' });
      }
    };
    void check();
    const timer = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);
  return health;
}
