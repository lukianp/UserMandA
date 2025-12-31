/**
 * Error Monitoring Hook
 *
 * React hook for monitoring errors and logs
 */

import { useState, useCallback, useEffect } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: Record<string, any>;
  resolved: boolean;
  notes?: string;
}

export interface ErrorMonitoringState {
  logs: LogEntry[];
  errorReports: ErrorReport[];
  unresolvedErrors: number;
  isLoading: boolean;
  filter: {
    level?: LogLevel;
    category?: string;
    resolved?: boolean;
  };
}

/**
 * Hook for monitoring errors and logs
 */
export function useErrorMonitoring() {
  const [state, setState] = useState<ErrorMonitoringState>({
    logs: [],
    errorReports: [],
    unresolvedErrors: 0,
    isLoading: false,
    filter: {}
  });

  /**
   * Load error reports
   */
  const loadErrorReports = useCallback(async (filter?: { resolved?: boolean; since?: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await window.electron.invoke('error-monitoring:get-reports', filter);

      if (result.success) {
        const unresolvedCount = result.reports.filter((r: ErrorReport) => !r.resolved).length;

        setState(prev => ({
          ...prev,
          errorReports: result.reports,
          unresolvedErrors: unresolvedCount,
          isLoading: false
        }));
      } else {
        throw new Error(result.error || 'Failed to load error reports');
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      console.error('Failed to load error reports:', error);
    }
  }, []);

  /**
   * Resolve an error report
   */
  const resolveError = useCallback(async (reportId: string, notes?: string) => {
    try {
      const result = await window.electron.invoke('error-monitoring:resolve', {
        reportId,
        notes
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          errorReports: prev.errorReports.map(r =>
            r.id === reportId ? { ...r, resolved: true, notes } : r
          ),
          unresolvedErrors: prev.unresolvedErrors - 1
        }));
      } else {
        throw new Error(result.error || 'Failed to resolve error');
      }
    } catch (error: any) {
      console.error('Failed to resolve error:', error);
      throw error;
    }
  }, []);

  /**
   * Set filter
   */
  const setFilter = useCallback(
    (filter: { level?: LogLevel; category?: string; resolved?: boolean }) => {
      setState(prev => ({ ...prev, filter }));
    },
    []
  );

  /**
   * Clear logs
   */
  const clearLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  /**
   * Get filtered logs
   */
  const getFilteredLogs = useCallback((): LogEntry[] => {
    let filtered = state.logs;

    if (state.filter.level) {
      filtered = filtered.filter(log => log.level === state.filter.level);
    }

    if (state.filter.category) {
      filtered = filtered.filter(log => log.category === state.filter.category);
    }

    return filtered;
  }, [state.logs, state.filter]);

  /**
   * Get filtered error reports
   */
  const getFilteredErrorReports = useCallback((): ErrorReport[] => {
    let filtered = state.errorReports;

    if (state.filter.resolved !== undefined) {
      filtered = filtered.filter(report => report.resolved === state.filter.resolved);
    }

    return filtered;
  }, [state.errorReports, state.filter]);

  /**
   * Setup event listener for real-time log updates
   */
  useEffect(() => {
    const handleLog = (logEntry: LogEntry) => {
      setState(prev => ({
        ...prev,
        logs: [...prev.logs.slice(-999), logEntry] // Keep last 1000 logs
      }));
    };

    const handleError = (logEntry: LogEntry) => {
      // Automatically load error reports when a new error occurs
      loadErrorReports({ resolved: false });
    };

    // Subscribe to log events
    const unsubscribe = window.electron.invoke('error-monitoring:subscribe', {
      onLog: handleLog,
      onError: handleError
    });

    return () => {
      // Cleanup subscription
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [loadErrorReports]);

  /**
   * Load error reports on mount
   */
  useEffect(() => {
    loadErrorReports({ resolved: false });
  }, [loadErrorReports]);

  return {
    state,
    loadErrorReports,
    resolveError,
    setFilter,
    clearLogs,
    getFilteredLogs,
    getFilteredErrorReports
  };
}


