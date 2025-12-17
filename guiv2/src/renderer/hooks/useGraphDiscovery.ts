import { useGraphDiscoveryLogic } from "./useGraphDiscoveryLogic";

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

/**
 * Wrapper hook for Graph discovery - delegates to useGraphDiscoveryLogic
 * ✅ FIXED: Now uses event-driven useGraphDiscoveryLogic instead of deprecated useDiscovery
 */
export function useGraphDiscovery(profileId: string): UseDiscoveryResult {
  const logic = useGraphDiscoveryLogic();

  return {
    isRunning: logic.isRunning,
    results: logic.results ? [logic.results] : null,
    error: logic.error,
    progress: logic.progress?.percentage || 0,
    start: async (args?: Record<string, unknown>) => {
      await logic.startDiscovery();
    },
    cancelDiscovery: logic.cancelDiscovery,
    clearResults: () => {
      // Results are managed by discovery store
    },
    rows: logic.results ? [logic.results] : [],
  };
}
