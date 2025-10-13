import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    electronAPI: any;
  }
}

export interface ProgressEvent {
  runId: string;
  pct?: number;
  msg?: string;
  stage?: string;
  row?: Record<string, any>;
}

export interface ResultEvent {
  runId: string;
  rowsFile?: string;
  stats?: Record<string, number>;
  durationMs: number;
}

export interface IpcError {
  runId?: string;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Generic discovery hook for PowerShell module execution
 * @param type - Discovery type (e.g., "TestDLP", "ActiveDirectory")
 * @param profileId - Profile identifier
 */
export function useDiscovery(type: string, profileId: string) {
  const [runId, setRunId] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const buffer = useRef<any[]>([]);

  const start = useCallback(
    async (args: Record<string, unknown>) => {
      if (!window.electronAPI) {
        setError("Electron API not available");
        return;
      }

      if (!profileId) {
        setError("No profile selected");
        return;
      }

      try {
        setError(null);
        setProgress(0);
        setRows([]);
        setIsRunning(true);

        const result = await window.electronAPI.startDiscovery({
          type,
          profileId,
          args,
        });

        setRunId(result.runId);
        console.log(`[useDiscovery] Started ${type} discovery with runId: ${result.runId}`);
      } catch (err: any) {
        console.error(`[useDiscovery] Failed to start discovery:`, err);
        setError(err.message || "Failed to start discovery");
        setIsRunning(false);
      }
    },
    [type, profileId]
  );

  // Listen for progress events
  useEffect(() => {
    if (!window.electronAPI || !runId) return;

    const onProgress = (e: ProgressEvent) => {
      if (e.runId !== runId) return;

      if (e.pct !== undefined) {
        setProgress(e.pct);
      }

      if (e.msg) {
        console.log(`[useDiscovery] ${type}: ${e.msg}`);
      }

      if (e.row) {
        buffer.current.push(e.row);
        // Batch updates for performance - flush every 200 rows
        if (buffer.current.length >= 200) {
          setRows((prev) => prev.concat(buffer.current));
          buffer.current = [];
        }
      }
    };

    const onResult = (e: ResultEvent) => {
      if (e.runId !== runId) return;

      // Flush remaining buffered rows
      if (buffer.current.length > 0) {
        setRows((prev) => prev.concat(buffer.current));
        buffer.current = [];
      }

      setProgress(100);
      setIsRunning(false);
      console.log(`[useDiscovery] ${type} completed in ${e.durationMs}ms`);
    };

    const onError = (e: IpcError) => {
      if (e.runId !== runId) return;

      setError(e.message);
      setIsRunning(false);
      console.error(`[useDiscovery] ${type} error:`, e);
    };

    window.electronAPI.onDiscoveryProgress(onProgress);
    window.electronAPI.onDiscoveryResult(onResult);
    window.electronAPI.onDiscoveryError(onError);

    // Cleanup listeners on unmount (if API supports it)
    return () => {
      // Note: Electron IPC doesn't have a built-in "off" by default
      // If you add removeListener support to preload, wire it here
    };
  }, [runId, type]);

  // Periodic flush of buffered rows (every 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (buffer.current.length > 0) {
        setRows((prev) => prev.concat(buffer.current));
        buffer.current = [];
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return {
    start,
    progress,
    rows,
    error,
    isRunning,
    runId,
  };
}
