import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDiscovery } from "./useDiscovery";
import { LogEntry, ProgressInfo, Profile } from "./common/discoveryHookTypes";

export interface AzureResource {
  id: string;
  type: string;
  resourceGroup: string;
  subscriptionId: string;
  location: string;
  name?: string;
  kind?: string;
  sku?: any;
  tags?: Record<string, string>;
  properties?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AzureDiscoveryArgs {
  subscriptions?: string[];
  resourceGroups?: string[];
  locations?: string[];
  resourceTypes?: string[];
  tagFilters?: Record<string, string[]>;
  includeTags?: boolean;
  maxResults?: number;
  nextLink?: string;
}

export interface AzureDiscoveryResult {
  resources: AzureResource[];
  subscriptionId: string;
  resourceGroup?: string;
  location?: string;
  resourceType?: string;
  nextLink?: string;
  totalCount?: number;
}

export interface UseAzureDiscoveryResult {
  // Core state
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: AzureDiscoveryResult[] | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // Azure-specific state
  discoveredResources: AzureResource[];
  subscriptionSummary: Record<string, number>;
  resourceGroupSummary: Record<string, number>;
  locationSummary: Record<string, number>;
  resourceTypeSummary: Record<string, number>;

  // Actions
  startDiscovery: (args?: AzureDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  exportBySubscription: (subscriptionId: string) => Promise<void>;
  exportByResourceGroup: (resourceGroup: string) => Promise<void>;
}

/**
 * Azure Discovery Hook with specialized logic
 */
export function useAzureDiscovery(profileId: string): UseAzureDiscoveryResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [discoveredResources, setDiscoveredResources] = useState<AzureResource[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  }, []);

  // Azure-specific validation schema
  const validationSchema = useMemo(() => ({
    required: ['id', 'type', 'location'],
    transform: (row: any): AzureResource => ({
      id: row.id,
      type: row.type,
      resourceGroup: row.resourceGroup || 'unknown',
      subscriptionId: row.subscriptionId || row.subscription?.subscriptionId,
      location: row.location,
      name: row.name,
      kind: row.kind,
      sku: row.sku,
      tags: row.tags || {},
      properties: row.properties || {},
      metadata: row,
    }),
  }), []);

  // Azure-specific discovery options
  const discoveryOptions = useMemo(() => ({
    enableCaching: true,
    cacheTTL: 10 * 60 * 1000, // 10 minutes for Azure data
    enableRetry: true,
    maxRetries: 3,
    enableProgressTracking: true,
    enableCancellation: true,
    incremental: false, // Azure API supports some incremental queries
    validationSchema,
  }), [validationSchema]);

  const discovery = useDiscovery("Azure", profileId, discoveryOptions);

  // Transform discovery results to Azure-specific format
  const results = useMemo((): AzureDiscoveryResult[] | null => {
    if (!discovery.rows || discovery.rows.length === 0) return null;

    const groupedBySubscription = new Map<string, AzureResource[]>();

    discovery.rows.forEach((row: any) => {
      const subscriptionId = row.subscriptionId || 'unknown';
      if (!groupedBySubscription.has(subscriptionId)) {
        groupedBySubscription.set(subscriptionId, []);
      }
      groupedBySubscription.get(subscriptionId)!.push(row);
    });

    return Array.from(groupedBySubscription.entries()).map(([subscriptionId, resources]) => ({
      resources,
      subscriptionId,
      totalCount: resources.length,
    }));
  }, [discovery.rows]);

  // Compute summaries
  const subscriptionSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.subscriptionId] = (summary[resource.subscriptionId] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  const resourceGroupSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.resourceGroup] = (summary[resource.resourceGroup] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  const locationSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.location] = (summary[resource.location] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  const resourceTypeSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.type] = (summary[resource.type] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  // Update discovered resources when results change
  useEffect(() => {
    if (results) {
      const allResources = results.flatMap(r => r.resources);
      setDiscoveredResources(allResources);
    }
  }, [results]);

  const startDiscovery = useCallback(async (args: AzureDiscoveryArgs = {}) => {
    addLog('info', `Starting Azure discovery for profile: ${profileId}`);

    // Validate Azure-specific arguments
    if (args.subscriptions && args.subscriptions.length === 0) {
      addLog('warn', 'No subscriptions specified, discovery may be limited');
    }

    if (args.resourceGroups && args.resourceGroups.length === 0) {
      addLog('warn', 'No resource groups specified, will discover all accessible resources');
    }

    // Set selected profile for context
    setSelectedProfile({
      name: `Azure-${profileId}`,
      description: `Azure discovery profile ${profileId}`
    });

    try {
      await discovery.start(args as Record<string, unknown>);
      addLog('info', 'Azure discovery completed successfully');
    } catch (error: any) {
      addLog('error', `Azure discovery failed: ${error.message}`);
      throw error;
    }
  }, [discovery, profileId, addLog]);

  const cancelDiscovery = useCallback(async () => {
    addLog('info', 'Cancelling Azure discovery');
    await discovery.cancel?.();
  }, [discovery, addLog]);

  const exportResults = useCallback(async () => {
    if (!results) {
      addLog('warn', 'No results to export');
      return;
    }

    // Export logic would go here
    addLog('info', `Exporting ${discoveredResources.length} Azure resources`);
  }, [results, discoveredResources, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportBySubscription = useCallback(async (subscriptionId: string) => {
    const subscriptionResources = discoveredResources.filter(r => r.subscriptionId === subscriptionId);
    addLog('info', `Exporting ${subscriptionResources.length} resources for subscription ${subscriptionId}`);
    // Export logic here
  }, [discoveredResources, addLog]);

  const exportByResourceGroup = useCallback(async (resourceGroup: string) => {
    const rgResources = discoveredResources.filter(r => r.resourceGroup === resourceGroup);
    addLog('info', `Exporting ${rgResources.length} resources for resource group ${resourceGroup}`);
    // Export logic here
  }, [discoveredResources, addLog]);

  return {
    // Core state
    isRunning: discovery.isRunning,
    isCancelling: discovery.isCancelling || false,
    progress: discovery.progress ? {
      current: discoveredResources.length,
      total: discoveredResources.length || 100,
      percentage: discovery.progress,
      message: `Discovered ${discoveredResources.length} Azure resources`,
    } : null,
    results,
    error: discovery.error,
    logs,
    selectedProfile,

    // Azure-specific state
    discoveredResources,
    subscriptionSummary,
    resourceGroupSummary,
    locationSummary,
    resourceTypeSummary,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    exportBySubscription,
    exportByResourceGroup,
  };
}

// Legacy interface compatibility
export interface UseDiscoveryResult {
  isRunning: boolean;
  results: AzureDiscoveryResult[] | null;
  error: string | null;
  progress: number;
  start: (args?: AzureDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  clearResults: () => void;
  rows: AzureResource[];
}

/**
 * Legacy Azure Discovery Hook (backwards compatibility)
 */
export function useAzureDiscoveryLegacy(profileId: string): UseDiscoveryResult {
  const azureDiscovery = useAzureDiscovery(profileId);

  return {
    isRunning: azureDiscovery.isRunning,
    results: azureDiscovery.results,
    error: azureDiscovery.error,
    progress: azureDiscovery.progress?.percentage || 0,
    start: azureDiscovery.startDiscovery,
    cancelDiscovery: azureDiscovery.cancelDiscovery,
    clearResults: () => {
      // Clear results logic
    },
    rows: azureDiscovery.discoveredResources,
  };
}

// Main export is the enhanced implementation
