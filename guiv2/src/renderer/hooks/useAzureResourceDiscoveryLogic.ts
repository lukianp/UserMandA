/**
 * Azure Resource Discovery Hook
 *
 * Event-driven hook for Azure Resource discovery operations.
 * Follows the standard discovery pattern with token-based event matching.
 *
 * ✅ FIXED: Migrated to event-driven architecture
 * - Uses window.electron.executeDiscovery() instead of deprecated API
 * - Token-based event matching with currentTokenRef
 * - Event listeners with empty dependency array []
 * - Proper cleanup of event listeners
 * - Results stored via addResult()
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export interface AzureResourceDiscoveryConfig {
  includeVirtualMachines?: boolean;
  includeStorageAccounts?: boolean;
  includeNetworkResources?: boolean;
  includeDatabases?: boolean;
  includeWebApps?: boolean;
  timeout?: number;
}

export interface AzureResourceDiscoveryResult {
  success: boolean;
  error?: string;
  data?: {
    virtualMachines?: any[];
    storageAccounts?: any[];
    networkResources?: any[];
    databases?: any[];
    webApps?: any[];
    summary?: {
      totalResources: number;
      resourceTypes: number;
      subscriptions: string[];
    };
  };
}

export interface AzureResourceDiscoveryProgress {
  percentage: number;
  currentPhase: string;
  message: string;
}

export const useAzureResourceDiscoveryLogic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AzureResourceDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<AzureResourceDiscoveryProgress | null>(null);
  const [logs, setLogs] = useState<Array<{ level: string; message: string; timestamp: string }>>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const addResult = useDiscoveryStore((state) => state.addResult);

  // ✅ CRITICAL: useRef for token to avoid stale closures
  const currentTokenRef = useRef<string | null>(null);

  const [config] = useState<AzureResourceDiscoveryConfig>({
    includeVirtualMachines: true,
    includeStorageAccounts: true,
    includeNetworkResources: true,
    includeDatabases: true,
    includeWebApps: true,
    timeout: 300000, // 5 minutes
  });

  const addLog = useCallback((level: string, message: string) => {
    setLogs((prev) => [...prev, { level, message, timestamp: new Date().toISOString() }]);
  }, []);

  // ✅ CRITICAL: Event listeners with empty dependency array []
  useEffect(() => {
    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(logLevel, data.message);
      }
    });

    const unsubscribeProgress = window.electron?.onDiscoveryProgress?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setProgress({
          percentage: data.percentage || 0,
          currentPhase: data.currentPhase || 'Processing',
          message: 'Processing...',
        });
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);

        // ✅ DEBUG: Log the exact structure received from PowerShell
        console.log('[AzureResourceDiscoveryHook] onDiscoveryComplete - raw data:', data);
        console.log('[AzureResourceDiscoveryHook] data.result:', data.result);
        console.log('[AzureResourceDiscoveryHook] data.result keys:', data.result ? Object.keys(data.result) : 'null');

        const discoveryResult: AzureResourceDiscoveryResult = {
          success: true, // Assume success if complete event fired
          error: undefined,
          data: data.result,
        };

        console.log('[AzureResourceDiscoveryHook] Setting results.data to:', discoveryResult.data);
        setResults(discoveryResult);

        if (discoveryResult.success) {
          // ✅ CRITICAL: Store result in discovery store
          addResult({
            id: `azure-resource-${Date.now()}`,
            name: 'Azure Resource Discovery',
            moduleName: 'AzureResource',
            displayName: 'Azure Resource Discovery',
            itemCount: discoveryResult.data?.summary?.totalResources || 0,
            discoveryTime: new Date(),
            duration: data.duration || 0,
            status: 'completed',
            filePath: '',
            createdAt: new Date(),
            success: true,
            summary: `Discovered ${discoveryResult.data?.summary?.totalResources || 0} Azure resources across ${discoveryResult.data?.summary?.resourceTypes || 0} types`,
            errorMessage: '',
            additionalData: discoveryResult.data || {},
          });

          addLog('success', 'Azure Resource discovery completed successfully');
          setError(null);
        } else {
          setError(discoveryResult.error || 'Discovery failed');
          addLog('error', discoveryResult.error || 'Discovery failed');
        }

        currentTokenRef.current = null;
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError(data.error || 'An unknown error occurred');
        addLog('error', data.error || 'An unknown error occurred');
        currentTokenRef.current = null;
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsRunning(false);
        setError('Discovery was cancelled');
        addLog('warning', 'Discovery was cancelled by user');
        currentTokenRef.current = null;
      }
    });

    // ✅ CRITICAL: Cleanup function
    return () => {
      unsubscribeOutput?.();
      unsubscribeProgress?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No profile selected');
      addLog('error', 'No profile selected');
      return;
    }

    if (isRunning) {
      addLog('warning', 'Discovery is already running');
      return;
    }

    setShowExecutionDialog(true);
    setIsRunning(true);
    setError(null);
    setResults(null);
    setProgress(null);
    setLogs([]);
    addLog('info', 'Starting Azure Resource discovery...');

    try {
      // ✅ CRITICAL: Generate token and set BEFORE API call
      const token = `azure-resource-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentTokenRef.current = token;

      // ✅ FIXED: Use window.electron.executeDiscovery with executionId
      const result = await window.electron.executeDiscovery({
        moduleName: 'AzureResource',
        parameters: {
          profileId: selectedSourceProfile.id,
          companyName: selectedSourceProfile.companyName,
          config: {
            includeVirtualMachines: config.includeVirtualMachines,
            includeStorageAccounts: config.includeStorageAccounts,
            includeNetworkResources: config.includeNetworkResources,
            includeDatabases: config.includeDatabases,
            includeWebApps: config.includeWebApps,
          },
        },
        executionOptions: {
          timeout: config.timeout || 300000,
          showWindow: false,
        },
        executionId: token, // ✅ CRITICAL: Token for event matching
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to start Azure Resource discovery');
      }

      addLog('info', 'Azure Resource discovery started successfully');
    } catch (err: any) {
      setIsRunning(false);
      const errorMessage = err?.message || 'Failed to start Azure Resource discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      currentTokenRef.current = null;
    }
  }, [isRunning, config, addLog, selectedSourceProfile, addResult]);

  const cancelDiscovery = useCallback(async () => {
    if (!currentTokenRef.current) {
      addLog('warning', 'No active discovery to cancel');
      return;
    }

    setIsCancelling(true);
    try {
      addLog('info', 'Cancelling Azure Resource discovery...');
      await window.electron.cancelDiscovery(currentTokenRef.current);

      // Wait for cancellation event (with 2-second timeout)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          setIsRunning(false);
          setIsCancelling(false);
          currentTokenRef.current = null;
          resolve();
        }, 2000);

        const checkCancelled = setInterval(() => {
          if (!currentTokenRef.current) {
            clearTimeout(timeout);
            clearInterval(checkCancelled);
            resolve();
          }
        }, 100);
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to cancel discovery';
      setError(errorMessage);
      addLog('error', errorMessage);
      setIsRunning(false);
      setIsCancelling(false);
      currentTokenRef.current = null;
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ✅ ADDED: Filter and tab state for view compatibility
  const [filter, setFilter] = useState({
    searchText: '',
    selectedResourceTypes: [] as string[],
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  const updateFilter = useCallback((updates: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const updateConfig = useCallback((updates: Partial<AzureResourceDiscoveryConfig>) => {
    // Config is read-only in this hook but we provide the function for compatibility
    console.log('[AzureResourceDiscoveryHook] Config update requested:', updates);
  }, []);

  // ✅ ADDED: Column definitions for AG Grid
  const columns = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, sortable: true, filter: true },
    { field: 'resourceType', headerName: 'Type', width: 180, sortable: true, filter: true },
    { field: 'resourceGroup', headerName: 'Resource Group', width: 180, sortable: true, filter: true },
    { field: 'location', headerName: 'Location', width: 120, sortable: true, filter: true },
    { field: 'subscriptionId', headerName: 'Subscription', width: 280, sortable: true, filter: true },
    { field: 'status', headerName: 'Status', width: 100, sortable: true, filter: true },
    { field: 'sku', headerName: 'SKU', width: 120, sortable: true, filter: true },
    { field: 'tags', headerName: 'Tags', width: 200, sortable: true, filter: true },
    { field: 'id', headerName: 'Resource ID', width: 400, sortable: true, filter: true },
  ], []);

  // ✅ FIXED: Extract and filter data from results - handles all Azure resource types
  const filteredData = useMemo(() => {
    console.log('[AzureResourceDiscoveryHook] filteredData useMemo - results:', results);
    console.log('[AzureResourceDiscoveryHook] filteredData useMemo - results?.data:', results?.data);

    if (!results?.data) {
      console.log('[AzureResourceDiscoveryHook] filteredData - No results.data, returning []');
      return [];
    }

    // Flatten all resource arrays into one - PowerShell returns these categories
    const allResources: any[] = [];
    // Cast to any to handle PowerShell PascalCase property names
    const data = results.data as any;
    console.log('[AzureResourceDiscoveryHook] filteredData - data keys:', Object.keys(data));

    // Map PowerShell output fields to resource types (PascalCase from PowerShell)
    if (data.Subscriptions) allResources.push(...data.Subscriptions.map((r: any) => ({ ...r, resourceType: 'Subscription' })));
    if (data.ResourceGroups) allResources.push(...data.ResourceGroups.map((r: any) => ({ ...r, resourceType: 'ResourceGroup', name: r.ResourceGroupName || r.Name })));
    if (data.VirtualMachines) allResources.push(...data.VirtualMachines.map((r: any) => ({ ...r, resourceType: 'VirtualMachine' })));
    if (data.StorageAccounts) allResources.push(...data.StorageAccounts.map((r: any) => ({ ...r, resourceType: 'StorageAccount', name: r.StorageAccountName || r.Name })));
    if (data.KeyVaults) allResources.push(...data.KeyVaults.map((r: any) => ({ ...r, resourceType: 'KeyVault', name: r.VaultName || r.Name })));
    if (data.NetworkSecurityGroups) allResources.push(...data.NetworkSecurityGroups.map((r: any) => ({ ...r, resourceType: 'NetworkSecurityGroup' })));
    if (data.VirtualNetworks) allResources.push(...data.VirtualNetworks.map((r: any) => ({ ...r, resourceType: 'VirtualNetwork' })));
    if (data.WebApps) allResources.push(...data.WebApps.map((r: any) => ({ ...r, resourceType: 'WebApp' })));
    if (data.SqlServers) allResources.push(...data.SqlServers.map((r: any) => ({ ...r, resourceType: 'SqlServer' })));

    // Also handle lower-case variants (backwards compatibility)
    if (data.virtualMachines) allResources.push(...data.virtualMachines.map((r: any) => ({ ...r, resourceType: 'VirtualMachine' })));
    if (data.storageAccounts) allResources.push(...data.storageAccounts.map((r: any) => ({ ...r, resourceType: 'StorageAccount' })));
    if (data.networkResources) allResources.push(...data.networkResources.map((r: any) => ({ ...r, resourceType: 'Network' })));
    if (data.databases) allResources.push(...data.databases.map((r: any) => ({ ...r, resourceType: 'Database' })));
    if (data.webApps) allResources.push(...data.webApps.map((r: any) => ({ ...r, resourceType: 'WebApp' })));

    console.log('[AzureResourceDiscoveryHook] filteredData - allResources count:', allResources.length);
    if (allResources.length > 0) {
      console.log('[AzureResourceDiscoveryHook] filteredData - first resource:', allResources[0]);
    }

    // Apply search filter
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      return allResources.filter((item: any) => {
        return (
          item.name?.toLowerCase()?.includes(search) ||
          item.Name?.toLowerCase()?.includes(search) ||
          item.resourceType?.toLowerCase()?.includes(search) ||
          item.resourceGroup?.toLowerCase()?.includes(search) ||
          item.ResourceGroupName?.toLowerCase()?.includes(search) ||
          item.location?.toLowerCase()?.includes(search) ||
          item.Location?.toLowerCase()?.includes(search)
        );
      });
    }

    return allResources;
  }, [results, filter.searchText]);

  // ✅ FIXED: Compute stats from results - handles all Azure resource types
  const stats = useMemo(() => {
    if (!results?.data) return null;

    // Cast to any to handle PowerShell PascalCase property names
    const data = results.data as any;
    const resourcesByType: Record<string, number> = {};

    // Count from PowerShell output (PascalCase) with camelCase fallback
    const subscriptionCount = data.Subscriptions?.length || 0;
    const resourceGroupCount = data.ResourceGroups?.length || 0;
    const vmCount = data.VirtualMachines?.length || data.virtualMachines?.length || 0;
    const storageCount = data.StorageAccounts?.length || data.storageAccounts?.length || 0;
    const keyVaultCount = data.KeyVaults?.length || 0;
    const nsgCount = data.NetworkSecurityGroups?.length || 0;
    const vnetCount = data.VirtualNetworks?.length || 0;
    const webAppCount = data.WebApps?.length || data.webApps?.length || 0;
    const sqlCount = data.SqlServers?.length || data.databases?.length || 0;
    const networkCount = nsgCount + vnetCount + (data.networkResources?.length || 0);

    // Build resourcesByType for charts
    if (subscriptionCount > 0) resourcesByType['Subscriptions'] = subscriptionCount;
    if (resourceGroupCount > 0) resourcesByType['Resource Groups'] = resourceGroupCount;
    if (vmCount > 0) resourcesByType['Virtual Machines'] = vmCount;
    if (storageCount > 0) resourcesByType['Storage Accounts'] = storageCount;
    if (keyVaultCount > 0) resourcesByType['Key Vaults'] = keyVaultCount;
    if (nsgCount > 0) resourcesByType['Network Security Groups'] = nsgCount;
    if (vnetCount > 0) resourcesByType['Virtual Networks'] = vnetCount;
    if (webAppCount > 0) resourcesByType['Web Apps'] = webAppCount;
    if (sqlCount > 0) resourcesByType['SQL Servers'] = sqlCount;

    const totalResources = data.summary?.totalResources ||
      subscriptionCount + resourceGroupCount + vmCount + storageCount + keyVaultCount + nsgCount + vnetCount + webAppCount + sqlCount;

    return {
      totalResources,
      resourceTypes: data.summary?.resourceTypes || Object.keys(resourcesByType).length,
      subscriptions: data.summary?.subscriptions || data.Subscriptions || [],
      resourcesByType,
      // Individual counts for stat cards
      virtualMachines: vmCount,
      storageAccounts: storageCount,
      keyVaults: keyVaultCount,
      networkResources: networkCount,
      webApps: webAppCount,
      resourceGroups: resourceGroupCount,
    };
  }, [results]);

  // Export helpers
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToExcel = useCallback((data: any[], filename: string) => {
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  }, [exportToCSV]);

  return {
    // Core state
    isRunning,
    isCancelling,
    error,
    results,
    progress,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    config,

    // Actions
    startDiscovery,
    cancelDiscovery,
    clearLogs,
    updateConfig,
    updateFilter,

    // ✅ ADDED: View compatibility properties
    result: results,
    isDiscovering: isRunning,
    filter,
    activeTab,
    setActiveTab,
    columns,
    filteredData,
    stats,
    clearError: () => setError(null),
    exportToCSV,
    exportToExcel,
  };
}
