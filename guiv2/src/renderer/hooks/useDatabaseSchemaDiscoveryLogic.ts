/**
 * Database Schema Discovery Logic Hook
 * Contains all business logic for database schema discovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

interface DatabaseSchemaDiscoveryConfig {
  includeTables: boolean;
  includeViews: boolean;
  includeStoredProcedures: boolean;
  includeFunctions: boolean;
  includeTriggers: boolean;
  includeIndexes: boolean;
  includeConstraints: boolean;
  databaseEngines: string[]; // 'SQLServer', 'MySQL', 'PostgreSQL', 'Oracle'
}

interface DatabaseSchemaDiscoveryResult {
  totalDatabases?: number;
  totalTables?: number;
  totalViews?: number;
  totalStoredProcedures?: number;
  totalItems?: number;
  outputPath?: string;
  databases?: any[];
  tables?: any[];
  views?: any[];
  storedProcedures?: any[];
  functions?: any[];
  triggers?: any[];
  indexes?: any[];
  statistics?: {
    totalRows?: number;
    totalSize?: number;
    largestTables?: Array<{ name: string; size: number }>;
    databasesByEngine?: Record<string, number>;
  };
}

interface DatabaseSchemaDiscoveryState {
  config: DatabaseSchemaDiscoveryConfig;
  result: DatabaseSchemaDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useDatabaseSchemaDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<DatabaseSchemaDiscoveryState>({
    config: {
      includeTables: true,
      includeViews: true,
      includeStoredProcedures: true,
      includeFunctions: true,
      includeTriggers: true,
      includeIndexes: true,
      includeConstraints: true,
      databaseEngines: ['SQLServer'],
    },
    result: null,
    isDiscovering: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
    },
    error: null,
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[DatabaseSchemaDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('DatabaseSchemaDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[DatabaseSchemaDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as DatabaseSchemaDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[DatabaseSchemaDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[DatabaseSchemaDiscoveryHook] Discovery output:', data.message);
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[DatabaseSchemaDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `databaseschema-discovery-${Date.now()}`,
          name: 'Database Schema Discovery',
          moduleName: 'DatabaseSchemaDiscovery',
          displayName: 'Database Schema Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalDatabases || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalDatabases || 0} databases with ${data?.result?.totalTables || 0} tables and ${data?.result?.totalStoredProcedures || 0} stored procedures`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as DatabaseSchemaDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[DatabaseSchemaDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[DatabaseSchemaDiscoveryHook] Discovery error:', data.error);
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          error: data.error,
          progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0,
          },
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[DatabaseSchemaDiscoveryHook] Discovery cancelled');
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addResult]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[DatabaseSchemaDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `databaseschema-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Database Schema discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[DatabaseSchemaDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[DatabaseSchemaDiscoveryHook] Parameters:', {
      IncludeTables: state.config.includeTables,
      IncludeViews: state.config.includeViews,
      IncludeStoredProcedures: state.config.includeStoredProcedures,
      IncludeFunctions: state.config.includeFunctions,
      IncludeTriggers: state.config.includeTriggers,
      IncludeIndexes: state.config.includeIndexes,
      IncludeConstraints: state.config.includeConstraints,
      DatabaseEngines: state.config.databaseEngines,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'DatabaseSchema',
        parameters: {
          IncludeTables: state.config.includeTables,
          IncludeViews: state.config.includeViews,
          IncludeStoredProcedures: state.config.includeStoredProcedures,
          IncludeFunctions: state.config.includeFunctions,
          IncludeTriggers: state.config.includeTriggers,
          IncludeIndexes: state.config.includeIndexes,
          IncludeConstraints: state.config.includeConstraints,
          DatabaseEngines: state.config.databaseEngines,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[DatabaseSchemaDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[DatabaseSchemaDiscoveryHook] Discovery failed:', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        error: errorMessage,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config, state.isDiscovering]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !currentTokenRef.current) return;

    console.warn('[DatabaseSchemaDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[DatabaseSchemaDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[DatabaseSchemaDiscoveryHook]', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<DatabaseSchemaDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    error: state.error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
  };
};
