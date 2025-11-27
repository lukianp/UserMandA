import { useState, useCallback } from "react";
import { useDiscovery } from "./useDiscovery";
import { LogEntry, ProgressInfo, Profile } from "./common/discoveryHookTypes";

export interface UseDiscoveryResult {
  isRunning: boolean;
  results: any[] | null;
  error: string | null;
  progress: number;
  start: (args?: Record<string, unknown>) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  clearResults: () => void;
  rows: any[];
}

export function useGCPDiscovery(profileId: string): UseDiscoveryResult {
  const discovery = useDiscovery("GCP", profileId);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async (args: Record<string, unknown> = {}) => {
    try {
      setError(null);
      await discovery.start(args);
    } catch (err: any) {
      setError(err.message || "Failed to start GCP discovery");
    }
  }, [discovery]);

  const cancelDiscovery = useCallback(async () => {
    // Note: The base useDiscovery hook doesn't have cancel functionality
    // This would need to be implemented in the base hook if needed
    console.warn("Cancel not implemented in base useDiscovery hook");
  }, []);

  const clearResults = useCallback(() => {
    // Note: The base useDiscovery hook doesn't expose clear functionality
    // This would need to be implemented in the base hook if needed
    console.warn("Clear results not implemented in base useDiscovery hook");
  }, []);

  return {
    isRunning: discovery.isRunning,
    results: discovery.rows,
    error: error || (discovery.error ? discovery.error : null),
    progress: discovery.progress,
    start,
    cancelDiscovery,
    clearResults,
    rows: discovery.rows,
  };
}
