import { useAzureResourceDiscoveryLogic } from "./useAzureResourceDiscoveryLogic";

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
 * Wrapper hook for Azure Resource discovery - delegates to useAzureResourceDiscoveryLogic
 * ✅ FIXED: Now uses event-driven useAzureResourceDiscoveryLogic instead of deprecated useDiscovery
 */
export function useAzureResourceDiscovery(profileId: string): UseDiscoveryResult {
  const logic = useAzureResourceDiscoveryLogic();

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
