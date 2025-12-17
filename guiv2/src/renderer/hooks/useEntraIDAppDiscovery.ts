import { useEntraIDAppDiscoveryLogic } from "./useEntraIDAppDiscoveryLogic";

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
 * Wrapper hook for EntraID App discovery - delegates to useEntraIDAppDiscoveryLogic
 * ✅ FIXED: Now uses event-driven useEntraIDAppDiscoveryLogic instead of deprecated useDiscovery
 */
export function useEntraIDAppDiscovery(profileId: string): UseDiscoveryResult {
  const logic = useEntraIDAppDiscoveryLogic();

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
