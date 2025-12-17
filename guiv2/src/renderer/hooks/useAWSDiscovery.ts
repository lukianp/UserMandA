import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDiscovery } from "./useDiscovery";
import { LogEntry, ProgressInfo, Profile } from "./common/discoveryHookTypes";

export interface AWSResource {
  id: string;
  type: string;
  region: string;
  accountId: string;
  arn?: string;
  name?: string;
  state?: string;
  createdDate?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AWSDiscoveryArgs {
  regions?: string[];
  services?: string[];
  accountIds?: string[];
  includeGlobal?: boolean;
  tagFilters?: Record<string, string[]>;
  resourceTypes?: string[];
  maxResults?: number;
  nextToken?: string;
}

export interface AWSDiscoveryResult {
  resources: AWSResource[];
  accountId: string;
  region: string;
  service: string;
  nextToken?: string;
  totalCount?: number;
}

export interface UseAWSDiscoveryResult {
  // Core state
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: AWSDiscoveryResult[] | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // AWS-specific state
  discoveredResources: AWSResource[];
  accountSummary: Record<string, number>;
  regionSummary: Record<string, number>;
  serviceSummary: Record<string, number>;

  // Actions
  startDiscovery: (args?: AWSDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  exportByAccount: (accountId: string) => Promise<void>;
  exportByRegion: (region: string) => Promise<void>;
}

/**
 * AWS Discovery Hook with specialized logic
 */
export function useAWSDiscovery(profileId: string): UseAWSDiscoveryResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [discoveredResources, setDiscoveredResources] = useState<AWSResource[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  }, []);

  // AWS-specific validation schema
  const validationSchema = useMemo(() => ({
    required: ['id', 'type', 'region'],
    transform: (row: any): AWSResource => ({
      id: row.id || row.ResourceId || row.InstanceId || row.DBInstanceIdentifier,
      type: row.type || row.ResourceType || row.ServiceName,
      region: row.region || row.Region || row.AvailabilityZone?.substring(0, row.AvailabilityZone.length - 1),
      accountId: row.accountId || row.AccountId || row.OwnerId,
      arn: row.arn || row.Arn || row.DBInstanceArn,
      name: row.name || row.Name || row.DBInstanceIdentifier || row.ResourceName,
      state: row.state || row.State || row.DBInstanceStatus,
      createdDate: row.createdDate || row.CreatedTime || row.LaunchTime,
      tags: row.tags || row.Tags || {},
      metadata: row,
    }),
  }), []);

  // AWS-specific discovery options
  const discoveryOptions = useMemo(() => ({
    enableCaching: true,
    cacheTTL: 10 * 60 * 1000, // 10 minutes for AWS data
    enableRetry: true,
    maxRetries: 3,
    enableProgressTracking: true,
    enableCancellation: true,
    incremental: false, // AWS API doesn't support incremental well
    validationSchema,
  }), [validationSchema]);

  const discovery = useDiscovery("AWS", profileId, discoveryOptions);

  // Transform discovery results to AWS-specific format
  const results = useMemo((): AWSDiscoveryResult[] | null => {
    if (!discovery.rows || discovery.rows.length === 0) return null;

    const groupedByService = new Map<string, AWSResource[]>();

    discovery.rows.forEach((row: any) => {
      if (!row.service) return;
      if (!groupedByService.has(row.service)) {
        groupedByService.set(row.service, []);
      }
      groupedByService.get(row.service)!.push(row);
    });

    return Array.from(groupedByService.entries()).map(([service, resources]) => ({
      resources,
      accountId: resources[0]?.accountId || 'unknown',
      region: resources[0]?.region || 'unknown',
      service,
      totalCount: resources.length,
    }));
  }, [discovery.rows]);

  // Compute summaries
  const accountSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.accountId] = (summary[resource.accountId] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  const regionSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredResources.forEach(resource => {
      summary[resource.region] = (summary[resource.region] || 0) + 1;
    });
    return summary;
  }, [discoveredResources]);

  const serviceSummary = useMemo(() => {
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

  const startDiscovery = useCallback(async (args: AWSDiscoveryArgs = {}) => {
    addLog('info', `Starting AWS discovery for profile: ${profileId}`);

    // Validate AWS-specific arguments
    if (args.regions && args.regions.length === 0) {
      addLog('warning', 'No regions specified, discovery may be limited');
    }

    if (args.services && args.services.length === 0) {
      addLog('warning', 'No services specified, will discover all supported services');
    }

    // Set selected profile for context
    setSelectedProfile({
      name: `AWS-${profileId}`,
      description: `AWS discovery profile ${profileId}`
    });

    try {
      await discovery.start(args as Record<string, unknown>);
      addLog('info', 'AWS discovery completed successfully');
    } catch (error: any) {
      addLog('error', `AWS discovery failed: ${error.message}`);
      throw error;
    }
  }, [discovery, profileId, addLog]);

  const cancelDiscovery = useCallback(async () => {
    addLog('info', 'Cancelling AWS discovery');
    await discovery.cancel?.();
  }, [discovery, addLog]);

  const exportResults = useCallback(async () => {
    if (!results) {
      addLog('warning', 'No results to export');
      return;
    }

    // Export logic would go here
    addLog('info', `Exporting ${discoveredResources.length} AWS resources`);
  }, [results, discoveredResources, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportByAccount = useCallback(async (accountId: string) => {
    const accountResources = discoveredResources.filter(r => r.accountId === accountId);
    addLog('info', `Exporting ${accountResources.length} resources for account ${accountId}`);
    // Export logic here
  }, [discoveredResources, addLog]);

  const exportByRegion = useCallback(async (region: string) => {
    const regionResources = discoveredResources.filter(r => r.region === region);
    addLog('info', `Exporting ${regionResources.length} resources for region ${region}`);
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
      message: `Discovered ${discoveredResources.length} AWS resources`,
    } : null,
    results,
    error: discovery.error,
    logs,
    selectedProfile,

    // AWS-specific state
    discoveredResources,
    accountSummary,
    regionSummary,
    serviceSummary,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    exportByAccount,
    exportByRegion,
  };
}

// Legacy interface compatibility
export interface UseDiscoveryResult {
  isRunning: boolean;
  results: AWSDiscoveryResult[] | null;
  error: string | null;
  progress: number;
  start: (args?: AWSDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  clearResults: () => void;
  rows: AWSResource[];
}

/**
 * Legacy AWS Discovery Hook (backwards compatibility)
 */
export function useAWSDiscoveryLegacy(profileId: string): UseDiscoveryResult {
  const awsDiscovery = useAWSDiscovery(profileId);

  return {
    isRunning: awsDiscovery.isRunning,
    results: awsDiscovery.results,
    error: awsDiscovery.error,
    progress: awsDiscovery.progress?.percentage || 0,
    start: awsDiscovery.startDiscovery,
    cancelDiscovery: awsDiscovery.cancelDiscovery,
    clearResults: () => {
      // Clear results logic
    },
    rows: awsDiscovery.discoveredResources,
  };
}
