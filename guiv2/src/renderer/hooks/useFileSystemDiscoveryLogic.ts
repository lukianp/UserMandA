import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const { getResultsByModuleName, addResult: addDiscoveryResult } = useDiscoveryStore();
  console.log('[FileSystemDiscoveryHook] Discovery store hooks obtained');

  const [result, setResult] = useState<FileSystemDiscoveryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<FileSystemProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

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
      setResult(latestResult.result as unknown as FileSystemDiscoveryResult);
    }
  }, [getResultsByModuleName]);

  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // ✅ REMOVED: Event-driven code - File System uses synchronous executeDiscoveryModule
  // No event listeners needed since we get results directly from the API call

  const startDiscovery = useCallback(async () => {
    console.log('[FileSystemDiscoveryHook] ========== START DISCOVERY CALLED ==========');
    console.log('[FileSystemDiscoveryHook] startDiscovery callback triggered');

    setIsRunning(true);
    console.log('[FileSystemDiscoveryHook] setIsRunning(true) called');

    setError(null);
    console.log('[FileSystemDiscoveryHook] setError(null) called');

    setLogs([]);
    console.log('[FileSystemDiscoveryHook] setLogs([]) called');

    setShowExecutionDialog(true);
    console.log('[FileSystemDiscoveryHook] setShowExecutionDialog(true) called');

    const initialProgress = {
      phase: 'initializing' as const,
      serversCompleted: 0,
      totalServers: config?.servers?.length || 1,
      sharesCompleted: 0,
      totalShares: 0,
      percentComplete: 0,
      message: 'Initializing file system discovery...',
    };
    console.log('[FileSystemDiscoveryHook] Initial progress:', initialProgress);
    setProgress(initialProgress);

    const token = `filesystem-discovery-${Date.now()}`;
    console.log('[FileSystemDiscoveryHook] Generated token:', token);
    setCurrentToken(token);

    // Use profile's company name (not the profile name itself)
    const companyName = selectedSourceProfile?.companyName || selectedSourceProfile?.name || 'Unknown';
    console.log('[FileSystemDiscoveryHook] companyName determined:', companyName);
    console.log('[FileSystemDiscoveryHook] selectedSourceProfile:', selectedSourceProfile);

    addLog('Starting File System discovery...', 'info');
    addLog(`Company: ${companyName}`, 'info');
    addLog(`Servers to scan: ${config.servers?.length || 0} (localhost if none)`, 'info');
    addLog(`Include hidden shares: ${config.includeHiddenShares}`, 'info');
    addLog(`Scan permissions: ${config.scanPermissions}`, 'info');
    addLog(`Scan large files: ${config.scanLargeFiles}`, 'info');

    console.log('[FileSystemDiscoveryHook] Config validation:');
    console.log('[FileSystemDiscoveryHook] - servers:', config.servers);
    console.log('[FileSystemDiscoveryHook] - includeHiddenShares:', config.includeHiddenShares);
    console.log('[FileSystemDiscoveryHook] - scanPermissions:', config.scanPermissions);
    console.log('[FileSystemDiscoveryHook] - scanLargeFiles:', config.scanLargeFiles);
    console.log('[FileSystemDiscoveryHook] - largeFileThresholdMB:', config.largeFileThresholdMB);

    try {
      setProgress({
        phase: 'initializing',
        percentComplete: 10,
        message: 'Initializing file system scan...',
        serversCompleted: 0,
        totalServers: config?.servers?.length || 1,
        sharesCompleted: 0,
        totalShares: 0,
      });
      console.log('[FileSystemDiscoveryHook] Progress updated to 10%');
      addLog('Initializing file system scan...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress({
        phase: 'discovering_shares',
        percentComplete: 30,
        message: 'Scanning file shares...',
        serversCompleted: 0,
        totalServers: config?.servers?.length || 1,
        sharesCompleted: 0,
        totalShares: 0,
      });
      console.log('[FileSystemDiscoveryHook] Progress updated to 30%');
      addLog('Scanning file shares...', 'info');

      console.log('[FileSystemDiscoveryHook] Getting electronAPI...');
      const electronAPI = window.electronAPI;
      console.log('[FileSystemDiscoveryHook] electronAPI obtained:', !!electronAPI);
      console.log('[FileSystemDiscoveryHook] electronAPI type:', typeof electronAPI);
      console.log('[FileSystemDiscoveryHook] electronAPI.executeDiscovery exists:', !!(electronAPI as any).executeDiscovery);

      // PRE-CALL VALIDATION
      if (!(electronAPI as any).executeDiscovery) {
        console.error('[FileSystemDiscoveryHook] ❌ CRITICAL: executeDiscovery method not found!');
        console.log('[FileSystemDiscoveryHook] Available electronAPI methods:', Object.keys(electronAPI || {}));
        setError('Electron API executeDiscovery method not available');
        setIsRunning(false);
        setShowExecutionDialog(false);
        return;
      }

      console.log('[FileSystemDiscoveryHook] ✅ executeDiscovery method found, proceeding...');

      const discoveryParams = {
        moduleName: 'FileSystem',
        companyName: companyName,
        configuration: {
          Servers: config.servers && config.servers.length > 0 ? config.servers : null,
          IncludeHiddenShares: config.includeHiddenShares || false,
          IncludeAdministrativeShares: config.includeAdministrativeShares || false,
          ScanPermissions: config.scanPermissions !== false,
          ScanLargeFiles: config.scanLargeFiles !== false,
          LargeFileThresholdMB: config.largeFileThresholdMB || 100,
        },
        executionOptions: {
          timeout: 300000,
          showWindow: false,
        }
      };

      console.log('[FileSystemDiscoveryHook] Calling executeDiscovery with:');
      console.log('[FileSystemDiscoveryHook] discoveryParams:', JSON.stringify(discoveryParams, null, 2));

      const result = await (electronAPI as any).executeDiscovery(discoveryParams);

      console.log('[FileSystemDiscoveryHook] ✅ executeDiscoveryModule returned');
      console.log('[FileSystemDiscoveryHook] Result type:', typeof result);
      console.log('[FileSystemDiscoveryHook] Result keys:', result ? Object.keys(result) : 'NULL RESULT');
      console.log('[FileSystemDiscoveryHook] Result.success:', result?.success);
      console.log('[FileSystemDiscoveryHook] Result.error:', result?.error);
      console.log('[FileSystemDiscoveryHook] Result.data exists:', !!result?.data);

      setProgress({
        phase: 'analyzing_storage',
        percentComplete: 70,
        message: 'Processing discovery results...',
        serversCompleted: config?.servers?.length || 1,
        totalServers: config?.servers?.length || 1,
        sharesCompleted: 0,
        totalShares: 0,
      });
      addLog('Processing discovery results...', 'info');

      console.log('[FileSystemDiscoveryHook] Checking result.success:', result.success);

      if (result.success) {
        console.log('[FileSystemDiscoveryHook] ✅ Result indicates success');
        addLog('File System discovery completed successfully', 'success');

        // ✅ MAXIMUM DEBUGGING: Write raw result to C:\temp
        const debugPath = `C:\\temp\\filesystem-result-${Date.now()}.json`;
        try {
          console.log('[FileSystemDiscoveryHook] ========== MAXIMUM DEBUG MODE ==========');
          console.log('[FileSystemDiscoveryHook] Would write debug file to:', debugPath);
          console.log('[FileSystemDiscoveryHook] Raw result (first 2000 chars):', JSON.stringify(result).slice(0, 2000));
          console.log('[FileSystemDiscoveryHook] Full result structure:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.warn('[FileSystemDiscoveryHook] Debug logging error:', e);
        }

        // Extract structured data from PowerShell result
        // PowerShell returns nested structure: result.result.data.Data = { shares: [], permissions: [], ... }
        // The actual data is at: result.result.data.Data
        const resultAny = result as any;
        const psWrapper = resultAny?.result || result;
        const psDataContainer = psWrapper?.data || psWrapper;
        const psData = psDataContainer?.Data || psDataContainer;

        console.log('[FileSystemDiscoveryHook] ========== DATA EXTRACTION DEBUG ==========');
        console.log('[FileSystemDiscoveryHook] psWrapper keys:', Object.keys(psWrapper || {}));
        console.log('[FileSystemDiscoveryHook] psDataContainer keys:', Object.keys(psDataContainer || {}));
        console.log('[FileSystemDiscoveryHook] psData type:', typeof psData);
        console.log('[FileSystemDiscoveryHook] psData is array:', Array.isArray(psData));
        console.log('[FileSystemDiscoveryHook] psData keys:', Object.keys(psData || {}));
        console.log('[FileSystemDiscoveryHook] ===========================================');

        // PowerShell returns structured data with pre-grouped arrays, NOT flat array
        let grouped;
        if (psData && typeof psData === 'object' && !Array.isArray(psData)) {
          // Direct extraction from PowerShell structured result
          console.log('[FileSystemDiscoveryHook] Using structured data extraction');
          console.log('[FileSystemDiscoveryHook] psData.shares exists:', !!psData.shares);
          console.log('[FileSystemDiscoveryHook] psData.shares length:', psData.shares?.length);
          console.log('[FileSystemDiscoveryHook] psData.permissions length:', psData.permissions?.length);
          console.log('[FileSystemDiscoveryHook] psData.largeFiles length:', psData.largeFiles?.length);
          console.log('[FileSystemDiscoveryHook] psData.fileServers length:', psData.fileServers?.length);

          grouped = {
            shares: Array.isArray(psData.shares) ? psData.shares : [],
            permissions: Array.isArray(psData.permissions) ? psData.permissions : [],
            largeFiles: Array.isArray(psData.largeFiles) ? psData.largeFiles : [],
            fileServers: Array.isArray(psData.fileServers) ? psData.fileServers : [],
            fileAnalysis: Array.isArray(psData.fileAnalysis) ? psData.fileAnalysis : [],
          };
        } else {
          // Fallback for unexpected structure
          console.log('[FileSystemDiscoveryHook] Using fallback empty arrays');
          grouped = {
            shares: [],
            permissions: [],
            largeFiles: [],
            fileServers: [],
            fileAnalysis: [],
          };
        }

        console.log('[FileSystemDiscoveryHook] Final grouped counts:', {
          shares: grouped.shares.length,
          permissions: grouped.permissions.length,
          largeFiles: grouped.largeFiles.length,
          fileServers: grouped.fileServers.length,
          fileAnalysis: grouped.fileAnalysis.length,
        });

        // Use data directly - PowerShell already provides structured arrays
        const transformedShares = grouped.shares;
        const transformedPermissions = grouped.permissions;
        const transformedLargeFiles = grouped.largeFiles;

        console.log('[FileSystemDiscoveryHook] Transformed counts:', {
          shares: transformedShares.length,
          permissions: transformedPermissions.length,
          largeFiles: transformedLargeFiles.length,
        });
        console.log('[FileSystemDiscoveryHook] Sample transformed share:', transformedShares[0]);
        console.log('[FileSystemDiscoveryHook] Sample transformed permission:', transformedPermissions[0]);
        console.log('[FileSystemDiscoveryHook] Sample transformed large file:', transformedLargeFiles[0]);

        // Extract statistics from PowerShell (may be in psData or psWrapper)
        const psStats = psData?.statistics || psWrapper?.statistics || {};
        console.log('[FileSystemDiscoveryHook] psData.statistics:', JSON.stringify(psData?.statistics));
        console.log('[FileSystemDiscoveryHook] psWrapper.statistics:', JSON.stringify(psWrapper?.statistics));
        console.log('[FileSystemDiscoveryHook] Final psStats:', JSON.stringify(psStats));

        const totalItems = transformedShares.length + transformedPermissions.length + transformedLargeFiles.length;
        addLog(`Found ${totalItems} total items (${transformedShares.length} shares, ${transformedPermissions.length} permissions, ${transformedLargeFiles.length} large files)`, 'success');

        // Convert PowerShell statistics (totalSizeMB, largestFileMB, averageFileSizeMB) to TypeScript format
        const totalSizeMB = psStats.totalSizeMB || 0;
        const totalSizeGB = totalSizeMB / 1024;
        const totalStorageBytes = totalSizeMB * 1024 * 1024;

        const averageFileSizeMB = psStats.averageFileSizeMB || 0;
        const averageFileSizeBytes = averageFileSizeMB * 1024 * 1024;
        const averageFileSizeFormatted = averageFileSizeMB >= 1
          ? `${averageFileSizeMB.toFixed(2)} MB`
          : `${(averageFileSizeMB * 1024).toFixed(2)} KB`;

        console.log('[FileSystemDiscoveryHook] Statistics conversion:');
        console.log('[FileSystemDiscoveryHook] - totalSizeMB:', totalSizeMB, '→', totalSizeGB.toFixed(2), 'GB');
        console.log('[FileSystemDiscoveryHook] - averageFileSizeMB:', averageFileSizeMB, '→', averageFileSizeFormatted);
        console.log('[FileSystemDiscoveryHook] - totalShares:', psStats.totalShares);
        console.log('[FileSystemDiscoveryHook] - totalPermissions:', psStats.totalPermissions);
        console.log('[FileSystemDiscoveryHook] - highRiskPermissions:', psStats.highRiskPermissions);

        const fsResult: FileSystemDiscoveryResult = {
          id: token,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          config: config,
          shares: transformedShares,
          permissions: transformedPermissions,
          largeFiles: transformedLargeFiles,
          statistics: {
            // Raw PowerShell values (for View compatibility)
            totalSizeMB: psStats.totalSizeMB || 0,
            totalPermissions: psStats.totalPermissions || transformedPermissions.length,
            highRiskPermissions: psStats.highRiskPermissions || 0,
            averageFileSizeMB: psStats.averageFileSizeMB || 0,
            // Converted values
            totalShares: psStats.totalShares || transformedShares.length,
            totalLargeFiles: psStats.totalLargeFiles || transformedLargeFiles.length,
            totalServersScanned: psStats.totalFileServers || (config.servers?.length || 1),
            totalStorage: { bytes: totalStorageBytes, formatted: `${totalSizeGB.toFixed(2)} GB` },
            usedStorage: { bytes: totalStorageBytes, formatted: `${totalSizeGB.toFixed(2)} GB`, percent: 100 },
            freeStorage: { bytes: 0, formatted: '0 GB', percent: 0 },
            largestShare: psStats.largestShare || { name: 'N/A', sizeGB: 0 },
            oldestFile: psStats.oldestFile || { name: 'N/A', age: 0, lastModified: new Date().toISOString() },
            averageFileSize: { bytes: averageFileSizeBytes, formatted: averageFileSizeFormatted },
            mostCommonFileType: psStats.mostCommonFileType || { extension: 'N/A', count: 0 },
            duplicateFilesCount: psStats.duplicateFilesCount || 0,
            duplicateFilesSize: psStats.duplicateFilesSize || { bytes: 0, formatted: '0 GB' },
          },
          errors: [],
          warnings: result.warnings || [],
        };

        console.log('[FileSystemDiscoveryHook] Final fsResult:', {
          id: fsResult.id,
          sharesCount: fsResult.shares.length,
          permissionsCount: fsResult.permissions.length,
          largeFilesCount: fsResult.largeFiles.length,
          statistics: fsResult.statistics,
        });

        setResult(fsResult);
        setShares(fsResult.shares);
        setPermissions(fsResult.permissions);
        setLargeFiles(fsResult.largeFiles);

        console.log('[FileSystemDiscoveryHook] State updated - shares:', fsResult.shares.length, 'permissions:', fsResult.permissions.length, 'large files:', fsResult.largeFiles.length);

        // Set final progress
        setProgress({
          phase: 'finalizing',
          percentComplete: 100,
          message: 'Discovery completed successfully',
          serversCompleted: config?.servers?.length || 1,
          totalServers: config?.servers?.length || 1,
          sharesCompleted: transformedShares.length,
          totalShares: transformedShares.length,
        });

        addDiscoveryResult({
          id: fsResult.id,
          moduleName: 'FileSystemDiscovery',
          companyName: selectedSourceProfile?.companyName || 'Unknown',
          result: fsResult,
          timestamp: new Date().toISOString(),
        } as any);
      } else {
        console.error('[FileSystemDiscoveryHook] ❌ Result indicates FAILURE');
        const errorMsg = result?.error || 'Discovery failed with unknown error';
        console.error('[FileSystemDiscoveryHook] Error message:', errorMsg);
        console.error('[FileSystemDiscoveryHook] Full result object:', JSON.stringify(result, null, 2));
        addLog(`Discovery failed: ${errorMsg}`, 'error');
        setError(errorMsg);
      }

      console.log('[FileSystemDiscoveryHook] Cleaning up discovery state...');
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      console.log('[FileSystemDiscoveryHook] Discovery state cleaned up');

    } catch (err) {
      console.error('[FileSystemDiscoveryHook] ❌ CRITICAL: executeDiscoveryModule threw exception');
      console.error('[FileSystemDiscoveryHook] Exception:', err);
      console.error('[FileSystemDiscoveryHook] Exception type:', typeof err);
      console.error('[FileSystemDiscoveryHook] Exception message:', err instanceof Error ? err.message : String(err));
      console.error('[FileSystemDiscoveryHook] Exception stack:', err instanceof Error ? err.stack : 'No stack');

      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addLog(`Error: ${errorMessage}`, 'error');
      setError(errorMessage);
      setProgress(null);
      setIsRunning(false);
      setShowExecutionDialog(false);
      setCurrentToken(null);
    }
  }, [config, selectedSourceProfile, addLog, addDiscoveryResult]);

  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) return;

    try {
      addLog('Cancelling File System discovery...', 'warning');
      await window.electron.cancelDiscovery(currentToken);
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      addLog('File System discovery cancelled', 'warning');
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
      addLog(`Failed to cancel: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
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
