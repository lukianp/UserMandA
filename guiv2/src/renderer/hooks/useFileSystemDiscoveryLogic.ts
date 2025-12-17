import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  FileSystemDiscoveryConfig,
  FileSystemDiscoveryResult,
  FileShare,
  FilePermission,
  LargeFile,
  ShareFilter,
  PermissionFilter,
  LargeFileFilter,
  FileSystemDiscoveryTemplate,
  DEFAULT_FILESYSTEM_CONFIG,
  FILESYSTEM_TEMPLATES,
  FileSystemProgress,
} from '../types/models/filesystem';
import type { ProgressData } from '../../shared/types';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

// NO TRANSFORMATION NEEDED - PowerShell returns PascalCase, AG Grid uses PascalCase field names

export interface UseFileSystemDiscoveryLogicReturn {
  // Discovery state
  result: FileSystemDiscoveryResult | null;
  currentResult: FileSystemDiscoveryResult | null;
  isRunning: boolean;
  progress: FileSystemProgress | null;
  error: string | null;
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;

  // Configuration
  config: FileSystemDiscoveryConfig;
  setConfig: (config: FileSystemDiscoveryConfig) => void;
  templates: FileSystemDiscoveryTemplate[];
  selectedTemplate: FileSystemDiscoveryTemplate | null;
  selectTemplate: (template: FileSystemDiscoveryTemplate) => void;

  // Actions
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: (format: 'CSV' | 'JSON' | 'Excel') => Promise<void>;

  // Tabs data
  activeTab: 'overview' | 'shares' | 'permissions' | 'large-files';
  setActiveTab: (tab: 'overview' | 'shares' | 'permissions' | 'large-files') => void;

  // Shares tab
  shares: FileShare[];
  shareFilter: ShareFilter;
  setShareFilter: (filter: ShareFilter) => void;
  filteredShares: FileShare[];
  shareColumnDefs: ColDef[];
  selectedShares: FileShare[];
  setSelectedShares: (shares: FileShare[]) => void;

  // Permissions tab
  permissions: FilePermission[];
  permissionFilter: PermissionFilter;
  setPermissionFilter: (filter: PermissionFilter) => void;
  filteredPermissions: FilePermission[];
  permissionColumnDefs: ColDef[];
  selectedPermissions: FilePermission[];
  setSelectedPermissions: (permissions: FilePermission[]) => void;

  // Large files tab
  largeFiles: LargeFile[];
  largeFileFilter: LargeFileFilter;
  setLargeFileFilter: (filter: LargeFileFilter) => void;
  filteredLargeFiles: LargeFile[];
  largeFileColumnDefs: ColDef[];
  selectedLargeFiles: LargeFile[];
  setSelectedLargeFiles: (files: LargeFile[]) => void;

  // Search
  searchText: string;
  setSearchText: (text: string) => void;

  // History
  discoveryHistory: FileSystemDiscoveryResult[];
  loadHistory: () => Promise<void>;
  loadHistoryItem: (id: string) => Promise<void>;
}

export const useFileSystemDiscoveryLogic = (): UseFileSystemDiscoveryLogicReturn => {
  console.log('[FileSystemDiscoveryHook] ========== HOOK INITIALIZATION ==========');
  console.log('[FileSystemDiscoveryHook] Hook function called');

  // ELECTRON API VALIDATION
  console.log('[FileSystemDiscoveryHook] ========== ELECTRON API VALIDATION ==========');
  console.log('[FileSystemDiscoveryHook] window.electronAPI exists:', !!window.electronAPI);
  if (window.electronAPI) {
    console.log('[FileSystemDiscoveryHook] electronAPI methods:', Object.keys(window.electronAPI));
    console.log('[FileSystemDiscoveryHook] executeDiscoveryModule exists:', !!(window.electronAPI as any).executeDiscoveryModule);
    console.log('[FileSystemDiscoveryHook] executeDiscoveryModule type:', typeof (window.electronAPI as any).executeDiscoveryModule);
  } else {
    console.error('[FileSystemDiscoveryHook] ❌ CRITICAL: window.electronAPI is undefined!');
  }

  const selectedSourceProfile = useProfileStore((state) => {
    console.log('[FileSystemDiscoveryHook] Accessing profile store...');
    const profile = state.selectedSourceProfile;
    console.log('[FileSystemDiscoveryHook] selectedSourceProfile:', profile);
    return profile;
  });

  const { getResultsByModuleName, addResult } = useDiscoveryStore();
  console.log('[FileSystemDiscoveryHook] Discovery store hooks obtained');

  const [result, setResult] = useState<FileSystemDiscoveryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<FileSystemProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null); // For event matching

  const [config, setConfig] = useState<FileSystemDiscoveryConfig>(DEFAULT_FILESYSTEM_CONFIG);
  const [templates] = useState<FileSystemDiscoveryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FileSystemDiscoveryTemplate | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'shares' | 'permissions' | 'large-files'>('overview');

  const [shares, setShares] = useState<FileShare[]>([]);
  const [shareFilter, setShareFilter] = useState<ShareFilter>({});
  const [selectedShares, setSelectedShares] = useState<FileShare[]>([]);

  const [permissions, setPermissions] = useState<FilePermission[]>([]);
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>({});
  const [selectedPermissions, setSelectedPermissions] = useState<FilePermission[]>([]);

  const [largeFiles, setLargeFiles] = useState<LargeFile[]>([]);
  const [largeFileFilter, setLargeFileFilter] = useState<LargeFileFilter>({});
  const [selectedLargeFiles, setSelectedLargeFiles] = useState<LargeFile[]>([]);

  const [searchText, setSearchText] = useState('');
  const [discoveryHistory, setDiscoveryHistory] = useState<FileSystemDiscoveryResult[]>([]);

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('FileSystemDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[FileSystemDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      // Type assertion through unknown to avoid type errors
      setResult(latestResult.additionalData as unknown as FileSystemDiscoveryResult);
    }
  }, [getResultsByModuleName]);

  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[FileSystemDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        console.log('[FileSystemDiscoveryHook] Discovery output:', message);
        addLog(message, 'info');
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[FileSystemDiscoveryHook] Discovery completed event received');

        // Extract structured data from PowerShell result
        const resultAny = data as any;
        const psWrapper = resultAny?.result || data;
        const psDataContainer = psWrapper?.data || psWrapper;
        const psData = psDataContainer?.Data || psDataContainer;

        let grouped;
        if (psData && typeof psData === 'object' && !Array.isArray(psData)) {
          grouped = {
            shares: Array.isArray(psData.shares) ? psData.shares : [],
            permissions: Array.isArray(psData.permissions) ? psData.permissions : [],
            largeFiles: Array.isArray(psData.largeFiles) ? psData.largeFiles : [],
            fileServers: Array.isArray(psData.fileServers) ? psData.fileServers : [],
            fileAnalysis: Array.isArray(psData.fileAnalysis) ? psData.fileAnalysis : [],
          };
        } else {
          grouped = {
            shares: [],
            permissions: [],
            largeFiles: [],
            fileServers: [],
            fileAnalysis: [],
          };
        }

        const transformedShares = grouped.shares;
        const transformedPermissions = grouped.permissions;
        const transformedLargeFiles = grouped.largeFiles;

        // Extract statistics
        const psStats = psData?.statistics || psWrapper?.statistics || {};
        const totalSizeMB = psStats.totalSizeMB || 0;
        const totalSizeGB = totalSizeMB / 1024;
        const totalStorageBytes = totalSizeMB * 1024 * 1024;
        const averageFileSizeMB = psStats.averageFileSizeMB || 0;
        const averageFileSizeBytes = averageFileSizeMB * 1024 * 1024;
        const averageFileSizeFormatted = averageFileSizeMB >= 1
          ? `${averageFileSizeMB.toFixed(2)} MB`
          : `${(averageFileSizeMB * 1024).toFixed(2)} KB`;

        const token = currentTokenRef.current || `filesystem-discovery-${Date.now()}`;
        const fsResult: FileSystemDiscoveryResult = {
          id: token,
          configId: token,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          servers: config.servers || [],
          shares: transformedShares,
          permissions: transformedPermissions,
          largeFiles: transformedLargeFiles,
          statistics: {
            totalSizeMB: psStats.totalSizeMB || 0,
            totalPermissions: psStats.totalPermissions || transformedPermissions.length,
            highRiskPermissions: psStats.highRiskPermissions || 0,
            averageFileSizeMB: psStats.averageFileSizeMB || 0,
            totalShares: psStats.totalShares || transformedShares.length,
            totalFiles: psStats.totalFiles || transformedLargeFiles.length,
            totalFolders: psStats.totalFolders || 0,
            totalStorage: { bytes: totalStorageBytes, formatted: `${totalSizeGB.toFixed(2)} GB` },
            usedStorage: { bytes: totalStorageBytes, formatted: `${totalSizeGB.toFixed(2)} GB`, percent: 100 },
            freeStorage: { bytes: 0, formatted: '0 GB', percent: 0 },
            largestShare: psStats.largestShare || null,
            oldestShare: psStats.oldestShare || null,
            sharesWithQuota: psStats.sharesWithQuota || 0,
            sharesWithEncryption: psStats.sharesWithEncryption || 0,
            sharesWithDeduplication: psStats.sharesWithDeduplication || 0,
            averageShareSize: psStats.averageShareSize || 0,
          },
          securityRisks: [],
          errors: [],
          warnings: [],
        };

        setResult(fsResult);
        setShares(fsResult.shares);
        setPermissions(fsResult.permissions);
        setLargeFiles(fsResult.largeFiles);
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;

        addLog('File System discovery completed successfully', 'success');
        addLog(`Found ${transformedShares.length} shares, ${transformedPermissions.length} permissions, ${transformedLargeFiles.length} large files`, 'success');

        // Add to discovery store
        const discoveryResult = {
          id: fsResult.id,
          moduleName: 'FileSystemDiscovery',
          companyName: selectedSourceProfile?.companyName || 'Unknown',
          result: fsResult,
          timestamp: new Date().toISOString().toISOString(),
        };
        addResult(discoveryResult as any);
        console.log('[FileSystemDiscoveryHook] Discovery result added to store');
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[FileSystemDiscoveryHook] Discovery error event:', data.error);
        setError(data.error);
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
        addLog(`Discovery failed: ${data.error}`, 'error');
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[FileSystemDiscoveryHook] Discovery cancelled event');
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
        addLog('Discovery cancelled by user', 'warning');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, []); // ✅ CRITICAL: Empty dependency array - event listeners set up once

  const startDiscovery = useCallback(async () => {
    console.log('[FileSystemDiscoveryHook] ========== START DISCOVERY CALLED ==========');

    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      console.error('[FileSystemDiscoveryHook]', errorMessage);
      return;
    }

    if (isRunning) {
      console.warn('[FileSystemDiscoveryHook] Discovery already running, ignoring request');
      return;
    }

    const token = `filesystem-discovery-${Date.now()}`;
    console.log('[FileSystemDiscoveryHook] Generated token:', token);

    setIsRunning(true);
    setError(null);
    setLogs([]);
    setShowExecutionDialog(true);
    setCurrentToken(token);
    currentTokenRef.current = token; // CRITICAL: Set ref for event matching

    const initialProgress: FileSystemProgress = {
      phase: 'initializing',
      serversCompleted: 0,
      totalServers: config?.servers?.length || 1,
      sharesCompleted: 0,
      totalShares: 0,
      percentComplete: 0,
      message: 'Initializing file system discovery...',
    };
    setProgress(initialProgress);

    const companyName = selectedSourceProfile.companyName || selectedSourceProfile.name || 'Unknown';
    console.log('[FileSystemDiscoveryHook] Company:', companyName);

    addLog('Starting File System discovery...', 'info');
    addLog(`Company: ${companyName}`, 'info');
    addLog(`Servers to scan: ${config.servers?.length || 0} (localhost if none)`, 'info');
    addLog(`Include hidden shares: ${config.includeHiddenShares}`, 'info');
    addLog(`Scan permissions: ${config.scanPermissions}`, 'info');
    addLog(`Scan large files: ${config.scanLargeFiles}`, 'info');

    try {
      console.log('[FileSystemDiscoveryHook] Calling window.electron.executeDiscovery...');

      // Use event-driven API instead of deprecated executeDiscoveryModule
      const result = await window.electron.executeDiscovery({
        moduleName: 'FileSystem',
        parameters: {
          Servers: config.servers && config.servers.length > 0 ? config.servers : null,
          IncludeHiddenShares: config.includeHiddenShares || false,
          IncludeAdministrativeShares: config.includeAdministrativeShares || false,
          ScanPermissions: config.scanPermissions !== false,
          ScanLargeFiles: config.scanLargeFiles !== false,
          LargeFileThresholdMB: config.largeFileThresholdMB || 100,
        },
        executionOptions: {
          timeout: 300000, // 5 minutes for file system discovery
          showWindow: false, // Use integrated dialog
        },
        executionId: token, // CRITICAL: Pass token for event matching
      });

      console.log('[FileSystemDiscoveryHook] Discovery execution initiated:', result);

      // Note: Completion will be handled by the discovery:complete event listener
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[FileSystemDiscoveryHook] Discovery failed:', errorMessage);
      setError(errorMessage);
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
      addLog(`Error: ${errorMessage}`, 'error');
    }
  }, [config, selectedSourceProfile, isRunning, addLog]);

  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) {
      console.warn('[FileSystemDiscoveryHook] Cannot cancel - not running or no token');
      return;
    }

    console.warn('[FileSystemDiscoveryHook] Cancelling discovery...');

    try {
      addLog('Cancelling File System discovery...', 'warning');
      await window.electron.cancelDiscovery(currentToken);
      console.log('[FileSystemDiscoveryHook] Discovery cancellation requested successfully');

      // Set timeout as fallback in case cancelled event doesn't fire
      setTimeout(() => {
        setIsRunning(false);
        setProgress(null);
        setShowExecutionDialog(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
        addLog('File System discovery cancelled', 'warning');
        console.warn('[FileSystemDiscoveryHook] Discovery cancelled (fallback timeout)');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[FileSystemDiscoveryHook]', errorMessage);
      // Reset state even on error
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
      addLog(`Failed to cancel: ${errorMessage}`, 'error');
    }
  }, [isRunning, currentToken, addLog]);

  const exportResults = useCallback(async (format: 'CSV' | 'JSON' | 'Excel') => {
    if (!result) return;

    try {
      const electronAPI = getElectronAPI();

      await (electronAPI as any).executeModule(
        'FileSystemExport',
        {
          Result: result,
          Format: format,
          IncludeShares: true,
          IncludePermissions: true,
          IncludeLargeFiles: true,
          IncludeStatistics: true,
          IncludeSecurityRisks: true,
          OutputPath: 'C:\\discoverydata\\default\\Raw',
        }
      );
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [result]);

  const selectTemplate = useCallback((template: FileSystemDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const electronAPI = getElectronAPI();
      const historyResult = await (electronAPI as any).executeModule(
        'FileSystemHistory',
        {}
      );

      if (historyResult?.success && historyResult?.data?.history) {
        setDiscoveryHistory(historyResult.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  const loadHistoryItem = useCallback(async (id: string) => {
    try {
      const electronAPI = getElectronAPI();
      const historyResult = await (electronAPI as any).executeModule(
        'FileSystemHistoryItem',
        { Id: id }
      );

      if (historyResult?.success && historyResult?.data) {
        const typedResult = historyResult.data as FileSystemDiscoveryResult;
        setResult(typedResult);
        setShares(typedResult.shares || []);
        setPermissions(typedResult.permissions || []);
        setLargeFiles(typedResult.largeFiles || []);
      }
    } catch (err) {
      console.error('Failed to load history item:', err);
    }
  }, []);

  const filteredShares = useMemo(() => {
    console.log('[FileSystemDiscoveryHook] Computing filteredShares from shares:', shares?.length || 0);
    let filtered = shares;

    if (shareFilter.type?.length) {
      filtered = filtered.filter(s => shareFilter.type!.includes(s.type));
    }

    if (shareFilter.minSize !== undefined) {
      filtered = filtered.filter(s => s.size.totalBytes >= shareFilter.minSize! * 1024 * 1024 * 1024);
    }

    if (shareFilter.maxSize !== undefined) {
      filtered = filtered.filter(s => s.size.totalBytes <= shareFilter.maxSize! * 1024 * 1024 * 1024);
    }

    if (shareFilter.hasQuota !== undefined) {
      filtered = filtered.filter(s => s.quotaEnabled === shareFilter.hasQuota);
    }

    if (shareFilter.hasEncryption !== undefined) {
      filtered = filtered.filter(s => s.encryptionEnabled === shareFilter.hasEncryption);
    }

    if (shareFilter.server) {
      filtered = filtered.filter(s => s.server === shareFilter.server);
    }

    if (shareFilter.searchText) {
      const search = shareFilter.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name ?? '').toLowerCase().includes(search) ||
        (s.path ?? '').toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name ?? '').toLowerCase().includes(search) ||
        (s.path ?? '').toLowerCase().includes(search)
      );
    }

    console.log('[FileSystemDiscoveryHook] filteredShares result:', filtered?.length || 0);
    return filtered;
  }, [shares, shareFilter, searchText]);

  const filteredPermissions = useMemo(() => {
    let filtered = permissions;

    if (permissionFilter.accessType?.length) {
      filtered = filtered.filter(p => permissionFilter.accessType!.includes(p.accessType));
    }

    if (permissionFilter.principalType?.length) {
      filtered = filtered.filter(p => permissionFilter.principalType!.includes(p.principal.type));
    }

    if (permissionFilter.share) {
      filtered = filtered.filter(p => p.shareName === permissionFilter.share);
    }

    if (permissionFilter.searchText) {
      const search = permissionFilter.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.principal?.name ?? '').toLowerCase().includes(search) ||
        (p.shareName ?? '').toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.principal?.name ?? '').toLowerCase().includes(search) ||
        (p.shareName ?? '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [permissions, permissionFilter, searchText]);

  const filteredLargeFiles = useMemo(() => {
    let filtered = largeFiles;

    if (largeFileFilter.minSize !== undefined) {
      filtered = filtered.filter(f => f.sizeBytes >= largeFileFilter.minSize! * 1024 * 1024);
    }

    if (largeFileFilter.extension?.length) {
      filtered = filtered.filter(f => largeFileFilter.extension!.includes(f.extension));
    }

    if (largeFileFilter.share) {
      filtered = filtered.filter(f => f.share === largeFileFilter.share);
    }

    if (largeFileFilter.isEncrypted !== undefined) {
      filtered = filtered.filter(f => f.isEncrypted === largeFileFilter.isEncrypted);
    }

    if (largeFileFilter.searchText) {
      const search = largeFileFilter.searchText.toLowerCase();
      filtered = filtered.filter(f =>
        (f.name ?? '').toLowerCase().includes(search) ||
        (f.path ?? '').toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(f =>
        (f.name ?? '').toLowerCase().includes(search) ||
        (f.path ?? '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [largeFiles, largeFileFilter, searchText]);

  const shareColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Share Name', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'Path', headerName: 'Path', sortable: true, filter: true, width: 300 },
    { field: 'Server', headerName: 'Server', sortable: true, filter: true, width: 150 },
    {
      field: 'SizeGB',
      headerName: 'Total Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => params.value !== undefined ? `${params.value.toFixed(2)} GB` : 'N/A',
    },
    { field: 'FileCount', headerName: 'Files', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
  ], []);

  const permissionColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'ShareName', headerName: 'Share', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'IdentityReference', headerName: 'Principal', sortable: true, filter: true, width: 250 },
    { field: 'FileSystemRights', headerName: 'Rights', sortable: true, filter: true, width: 250 },
    { field: 'AccessControlType', headerName: 'Access', sortable: true, filter: true, width: 100 },
  ], []);

  const largeFileColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'File Name', sortable: true, filter: true, pinned: 'left', width: 250 },
    { field: 'Path', headerName: 'Path', sortable: true, filter: true, width: 350 },
    {
      field: 'SizeMB',
      headerName: 'Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => params.value !== undefined ? `${params.value.toLocaleString()} MB` : 'N/A',
    },
    { field: 'ShareName', headerName: 'Share', sortable: true, filter: true, width: 200 },
  ], []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    result,
    currentResult: result,
    isRunning,
    progress,
    error,
    config,
    setConfig,
    templates,
    selectedTemplate,
    selectTemplate,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    activeTab,
    setActiveTab,
    shares,
    shareFilter,
    setShareFilter,
    filteredShares,
    shareColumnDefs,
    selectedShares,
    setSelectedShares,
    permissions,
    permissionFilter,
    setPermissionFilter,
    filteredPermissions,
    permissionColumnDefs,
    selectedPermissions,
    setSelectedPermissions,
    largeFiles,
    largeFileFilter,
    setLargeFileFilter,
    filteredLargeFiles,
    largeFileColumnDefs,
    selectedLargeFiles,
    setSelectedLargeFiles,
    searchText,
    setSearchText,
    discoveryHistory,
    loadHistory,
    loadHistoryItem,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
  };
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
