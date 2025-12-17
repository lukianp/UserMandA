import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useDiscovery } from "./useDiscovery";
import { LogEntry, ProgressInfo, Profile } from "./common/discoveryHookTypes";

export interface Application {
  id: string;
  name: string;
  version?: string;
  vendor?: string;
  installPath?: string;
  executablePath?: string;
  description?: string;
  installDate?: string;
  uninstallString?: string;
  publisher?: string;
  displayName?: string;
  estimatedSize?: number;
  isSystemComponent?: boolean;
  dependencies?: string[];
  services?: ApplicationService[];
  registryEntries?: any[];
  metadata?: Record<string, any>;
}

export interface ApplicationService {
  name: string;
  displayName: string;
  status: string;
  startupType: string;
  description?: string;
}

export interface ApplicationDiscoveryArgs {
  scanLocations?: string[];
  includeSystemApps?: boolean;
  includeHiddenApps?: boolean;
  vendorFilter?: string[];
  categoryFilter?: string[];
  minInstallDate?: Date;
  maxInstallDate?: Date;
  sizeRange?: { min?: number; max?: number };
  includeServices?: boolean;
  registryPaths?: string[];
}

export interface ApplicationDiscoveryResult {
  applications: Application[];
  scanLocation: string;
  totalCount?: number;
  scanTime?: number;
}

export interface UseApplicationDiscoveryResult {
  // Core state
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: ApplicationDiscoveryResult[] | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // Application-specific state
  discoveredApplications: Application[];
  vendorSummary: Record<string, number>;
  categorySummary: Record<string, number>;
  systemApps: Application[];
  userApps: Application[];

  // Actions
  startDiscovery: (args?: ApplicationDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  exportByVendor: (vendor: string) => Promise<void>;
  exportSystemApps: () => Promise<void>;
  exportUserApps: () => Promise<void>;
}

/**
 * Application Discovery Hook with specialized logic
 */
export function useApplicationDiscovery(profileId: string): UseApplicationDiscoveryResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [discoveredApplications, setDiscoveredApplications] = useState<Application[]>([]);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  }, []);

  // Application-specific validation schema
  const validationSchema = useMemo(() => ({
    required: ['name'],
    transform: (row: any): Application => ({
      id: row.id || row.appId || `${row.name}_${row.version || 'unknown'}`,
      name: row.name || row.displayName,
      version: row.version || row.displayVersion,
      vendor: row.vendor || row.publisher || row.manufacturer,
      installPath: row.installPath || row.installLocation,
      executablePath: row.executablePath || row.exePath,
      description: row.description || row.comments,
      installDate: row.installDate,
      uninstallString: row.uninstallString,
      publisher: row.publisher,
      displayName: row.displayName,
      estimatedSize: row.estimatedSize || row.size,
      isSystemComponent: row.isSystemComponent || row.systemComponent,
      dependencies: Array.isArray(row.dependencies) ? row.dependencies : [],
      services: Array.isArray(row.services) ? row.services : [],
      registryEntries: row.registryEntries || [],
      metadata: row,
    }),
  }), []);

  // Application-specific discovery options
  const discoveryOptions = useMemo(() => ({
    enableCaching: true,
    cacheTTL: 30 * 60 * 1000, // 30 minutes for application data
    enableRetry: true,
    maxRetries: 2,
    enableProgressTracking: true,
    enableCancellation: true,
    incremental: false, // Application scans are typically full scans
    validationSchema,
  }), [validationSchema]);

  const discovery = useDiscovery("Application", profileId, discoveryOptions);

  // Transform discovery results to application-specific format
  const results = useMemo((): ApplicationDiscoveryResult[] | null => {
    if (!discovery.rows || discovery.rows.length === 0) return null;

    const groupedByLocation = new Map<string, Application[]>();

    discovery.rows.forEach((row: any) => {
      const location = row.scanLocation || row.source || 'local';
      if (!groupedByLocation.has(location)) {
        groupedByLocation.set(location, []);
      }
      groupedByLocation.get(location)!.push(row);
    });

    return Array.from(groupedByLocation.entries()).map(([location, applications]) => ({
      applications,
      scanLocation: location,
      totalCount: applications.length,
    }));
  }, [discovery.rows]);

  // Categorize applications
  const systemApps = useMemo(() => {
    return discoveredApplications.filter(app => app.isSystemComponent);
  }, [discoveredApplications]);

  const userApps = useMemo(() => {
    return discoveredApplications.filter(app => !app.isSystemComponent);
  }, [discoveredApplications]);

  // Compute summaries
  const vendorSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    discoveredApplications.forEach(app => {
      const vendor = app.vendor || 'Unknown';
      summary[vendor] = (summary[vendor] || 0) + 1;
    });
    return summary;
  }, [discoveredApplications]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {
      system: systemApps.length,
      user: userApps.length,
    };
    return summary;
  }, [systemApps.length, userApps.length]);

  // Update discovered applications when results change
  useEffect(() => {
    if (results) {
      const allApplications = results.flatMap(r => r.applications);
      setDiscoveredApplications(allApplications);
    }
  }, [results]);

  const startDiscovery = useCallback(async (args: ApplicationDiscoveryArgs = {}) => {
    addLog('info', `Starting Application discovery for profile: ${profileId}`);

    // Validate application-specific arguments
    if (args.scanLocations && args.scanLocations.length === 0) {
      addLog('warning', 'No scan locations specified, will scan default locations only');
    }

    if (args.registryPaths && args.registryPaths.length === 0) {
      addLog('warning', 'No registry paths specified, will scan standard registry locations');
    }

    // Set selected profile for context
    setSelectedProfile({
      name: `App-${profileId}`,
      description: `Application discovery profile ${profileId}`
    });

    try {
      await discovery.start(args as Record<string, unknown>);
      addLog('info', 'Application discovery completed successfully');
    } catch (error: any) {
      addLog('error', `Application discovery failed: ${error.message}`);
      throw error;
    }
  }, [discovery, profileId, addLog]);

  const cancelDiscovery = useCallback(async () => {
    addLog('info', 'Cancelling Application discovery');
    await discovery.cancel?.();
  }, [discovery, addLog]);

  const exportResults = useCallback(async () => {
    if (!results) {
      addLog('warning', 'No results to export');
      return;
    }

    // Export logic would go here
    addLog('info', `Exporting ${discoveredApplications.length} applications`);
  }, [results, discoveredApplications, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportByVendor = useCallback(async (vendor: string) => {
    const vendorApps = discoveredApplications.filter(app => app.vendor === vendor);
    addLog('info', `Exporting ${vendorApps.length} applications from vendor ${vendor}`);
    // Export logic here
  }, [discoveredApplications, addLog]);

  const exportSystemApps = useCallback(async () => {
    addLog('info', `Exporting ${systemApps.length} system applications`);
    // Export logic here
  }, [systemApps, addLog]);

  const exportUserApps = useCallback(async () => {
    addLog('info', `Exporting ${userApps.length} user applications`);
    // Export logic here
  }, [userApps, addLog]);

  return {
    // Core state
    isRunning: discovery.isRunning,
    isCancelling: discovery.isCancelling || false,
    progress: discovery.progress ? {
      current: discoveredApplications.length,
      total: discoveredApplications.length || 100,
      percentage: discovery.progress,
      message: `Discovered ${discoveredApplications.length} applications`,
    } : null,
    results,
    error: discovery.error,
    logs,
    selectedProfile,

    // Application-specific state
    discoveredApplications,
    vendorSummary,
    categorySummary,
    systemApps,
    userApps,

    // Actions
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    exportByVendor,
    exportSystemApps,
    exportUserApps,
  };
}

// Legacy interface compatibility
export interface UseDiscoveryResult {
  isRunning: boolean;
  results: ApplicationDiscoveryResult[] | null;
  error: string | null;
  progress: number;
  start: (args?: ApplicationDiscoveryArgs) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  clearResults: () => void;
  rows: Application[];
}

/**
 * Legacy Application Discovery Hook (backwards compatibility)
 */
export function useApplicationDiscoveryLegacy(profileId: string): UseDiscoveryResult {
  const appDiscovery = useApplicationDiscovery(profileId);

  return {
    isRunning: appDiscovery.isRunning,
    results: appDiscovery.results,
    error: appDiscovery.error,
    progress: appDiscovery.progress?.percentage || 0,
    start: appDiscovery.startDiscovery,
    cancelDiscovery: appDiscovery.cancelDiscovery,
    clearResults: () => {
      // Clear results logic
    },
    rows: appDiscovery.discoveredApplications,
  };
}
