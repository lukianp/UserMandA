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
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { getResultsByModuleName, addResult: addDiscoveryResult } = useDiscoveryStore();

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
      setResult(latestResult as FileSystemDiscoveryResult);
    }
  }, [getResultsByModuleName]);

  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // Event Handlers for Streaming Discovery
  useEffect(() => {
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        if (data.executionId === currentToken) {
          console.log('[FileSystemDiscoveryHook] Progress event:', data);
          addLog(`Progress: ${data.message}`, 'info');
        }
      }
    });

    const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        if (data.executionId === currentToken) {
          console.log('[FileSystemDiscoveryHook] Output:', data.output);
          addLog(data.output, 'info');
        }
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        if (data.executionId === currentToken) {
          console.log('[FileSystemDiscoveryHook] Discovery complete event received:', data);
          addLog('File System discovery completed successfully', 'success');

          // Extract PowerShell return value
          const psReturnValue = data.result;
          console.log('[FileSystemDiscoveryHook] Event: PowerShell return value:', JSON.stringify(psReturnValue).slice(0, 500));

          // Handle nested data structure from PowerShell
          // PowerShell returns: { data: { Success: true, Data: { shares: [], statistics: {} } } }
          const psWrapper = psReturnValue?.data || psReturnValue;
          console.log('[FileSystemDiscoveryHook] Event: psWrapper keys:', Object.keys(psWrapper || {}));

          // CRITICAL: Extract the Data object (capital D) which contains the structured data
          const psData = psWrapper?.Data || psWrapper?.data || psWrapper;
          console.log('[FileSystemDiscoveryHook] Event: psData keys:', Object.keys(psData || {}));
          console.log('[FileSystemDiscoveryHook] Event: psData.shares length:', psData?.shares?.length);
          console.log('[FileSystemDiscoveryHook] Event: psData.permissions length:', psData?.permissions?.length);
          console.log('[FileSystemDiscoveryHook] Event: psData.largeFiles length:', psData?.largeFiles?.length);
          console.log('[FileSystemDiscoveryHook] Event: psData.statistics:', JSON.stringify(psData?.statistics));

          // Extract structured data directly from psData (PowerShell already grouped it)
          const grouped = {
            shares: Array.isArray(psData?.shares) ? psData.shares : [],
            permissions: Array.isArray(psData?.permissions) ? psData.permissions : [],
            largeFiles: Array.isArray(psData?.largeFiles) ? psData.largeFiles : [],
          };

          console.log('[FileSystemDiscoveryHook] Event: Grouped data:', {
            shares: grouped.shares.length,
            permissions: grouped.permissions.length,
            largeFiles: grouped.largeFiles.length,
          });

          // Extract statistics from psData (not psWrapper!)
          const psStats = psData?.statistics || {};
          console.log('[FileSystemDiscoveryHook] Event: Extracted statistics:', JSON.stringify(psStats));

          // Build final result
          const fileSystemResult: FileSystemDiscoveryResult = {
            id: psData?.id || data.executionId || `filesystem-discovery-${Date.now()}`,
            configId: config?.servers?.join('-') || 'default',
            startTime: psData?.startTime?.DateTime || psData?.startTime || psWrapper?.StartTime?.DateTime || new Date().toISOString(),
            endTime: psData?.endTime?.DateTime || psData?.endTime || psWrapper?.EndTime?.DateTime || new Date().toISOString(),
            duration: psData?.duration || psWrapper?.Duration || 0,
            status: 'completed',
            servers: config.servers || ['localhost'],
            shares: grouped.shares,
            permissions: grouped.permissions,
            largeFiles: grouped.largeFiles,
            statistics: psStats && Object.keys(psStats).length > 0 ? psStats : {
              totalShares: grouped.shares.length,
              totalPermissions: grouped.permissions.length,
              totalLargeFiles: grouped.largeFiles.length,
              totalServers: config.servers?.length || 1,
              totalSizeMB: 0,
              averageFileSizeMB: 0,
              largestFileMB: 0,
            } as any,
            securityRisks: psData?.securityRisks || [],
            errors: psData?.errors || psWrapper?.Errors || [],
            warnings: psData?.warnings || psWrapper?.Warnings || [],
            metadata: {
              totalServersScanned: config.servers?.length || 1,
              totalSharesDiscovered: grouped.shares.length,
              totalPermissionsAnalyzed: grouped.permissions.length,
              totalFilesScanned: 0,
              totalFoldersScanned: 0,
              totalStorageAnalyzed: 0,
            },
          };

          console.log('[FileSystemDiscoveryHook] Event: Final fileSystemResult:', {
            shares: fileSystemResult.shares.length,
            permissions: fileSystemResult.permissions.length,
            largeFiles: fileSystemResult.largeFiles.length,
            statistics: fileSystemResult.statistics,
          });

          setResult(fileSystemResult);

          // CRITICAL: Update state arrays so tabs can display data
          console.log('[FileSystemDiscoveryHook] Event: Setting state arrays:', {
            shares: fileSystemResult.shares?.length || 0,
            permissions: fileSystemResult.permissions?.length || 0,
            largeFiles: fileSystemResult.largeFiles?.length || 0,
          });
          setShares(fileSystemResult.shares || []);
          setPermissions(fileSystemResult.permissions || []);
          setLargeFiles(fileSystemResult.largeFiles || []);

          setIsRunning(false);
          setShowExecutionDialog(false);
          setCurrentToken(null);

          // Store result
          addDiscoveryResult({
            id: fileSystemResult.id,
            moduleName: 'FileSystemDiscovery',
            companyName: selectedSourceProfile?.companyName || 'Unknown',
            result: fileSystemResult,
            timestamp: new Date(),
          });
        }
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        if (data.executionId === currentToken) {
          console.error('[FileSystemDiscoveryHook] Discovery error:', data.error);
          addLog(`Error: ${data.error}`, 'error');
          setError(data.error);
          setIsRunning(false);
          setShowExecutionDialog(false);
          setCurrentToken(null);
        }
      }
    });

    return () => {
      unsubscribeProgress();
      unsubscribeOutput();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [currentToken, config, selectedSourceProfile, addLog, addDiscoveryResult]);

  const startDiscovery = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setLogs([]);
    setProgress({
      phase: 'initializing',
      serversCompleted: 0,
      totalServers: config?.servers?.length,
      sharesCompleted: 0,
      totalShares: 0,
      percentComplete: 0,
      message: 'Initializing file system discovery...',
    });

    try {
      // Generate unique execution token
      const token = `filesystem-discovery-${Date.now()}`;
      setCurrentToken(token);
      setShowExecutionDialog(true);

      const companyName = selectedSourceProfile?.companyName || 'FileSystemDiscovery';
      addLog('Starting File System discovery...', 'info');
      addLog(`Company: ${companyName}`, 'info');
      addLog(`Servers to scan: ${config.servers?.length || 0} (localhost if none)`, 'info');
      addLog(`Include hidden shares: ${config.includeHiddenShares}`, 'info');
      addLog(`Scan permissions: ${config.scanPermissions}`, 'info');
      addLog(`Scan large files: ${config.scanLargeFiles}`, 'info');

      // Get electron API (matches Azure pattern)
      const electronAPI = getElectronAPI();

      // Execute FileSystem discovery using executeDiscoveryModule (matches Azure pattern)
      // This correctly routes to powershell:executeDiscoveryModule IPC handler
      // which loads credentials and constructs the proper module path
      const result = await electronAPI.executeDiscoveryModule(
        'FileSystem',
        companyName,
        {
          Servers: config.servers && config.servers.length > 0 ? config.servers : null,
          IncludeHiddenShares: config.includeHiddenShares || false,
          IncludeAdministrativeShares: config.includeAdministrativeShares || false,
          ScanPermissions: config.scanPermissions !== false,
          ScanLargeFiles: config.scanLargeFiles !== false,
          LargeFileThresholdMB: config.largeFileThresholdMB || 100,
        },
        {
          timeout: 300000, // 5 minute timeout
          showWindow: true, // Show PowerShell window for debugging
        }
      );

      console.log('[FileSystemDiscoveryHook] executeDiscoveryModule result:', result);

      // Write debug output to temp file for troubleshooting
      const debugPath = `C:\\temp\\filesystem-result-${Date.now()}.json`;
      try {
        await window.electronAPI.writeFile(debugPath, JSON.stringify(result, null, 2));
        console.log(`[FileSystemDiscoveryHook] Debug file written to: ${debugPath}`);
      } catch (e) {
        console.warn('[FileSystemDiscoveryHook] Could not write debug file:', e);
      }

      // Handle the result - the discovery module returns synchronously
      if (result && result.success) {
        addLog('File System discovery completed successfully', 'success');

        // Process the result data - nested structure unwrapping
        // PowerShell returns: { success: true, data: { Success: true, Data: { shares: [], statistics: {} } } }
        const psWrapper = result.data || result;
        console.log('[FileSystemDiscoveryHook] psWrapper:', JSON.stringify(psWrapper).slice(0, 500));
        console.log('[FileSystemDiscoveryHook] psWrapper keys:', Object.keys(psWrapper || {}));

        // CRITICAL: Extract the Data object (capital D) which contains the structured data
        const psData = psWrapper?.Data || psWrapper?.data || psWrapper;
        console.log('[FileSystemDiscoveryHook] psData keys:', Object.keys(psData || {}));
        console.log('[FileSystemDiscoveryHook] psData.shares length:', psData?.shares?.length);
        console.log('[FileSystemDiscoveryHook] psData.permissions length:', psData?.permissions?.length);
        console.log('[FileSystemDiscoveryHook] psData.largeFiles length:', psData?.largeFiles?.length);
        console.log('[FileSystemDiscoveryHook] psData.statistics:', JSON.stringify(psData?.statistics));

        // Extract structured data directly from psData (PowerShell already grouped it)
        const grouped = {
          shares: Array.isArray(psData?.shares) ? psData.shares : [],
          permissions: Array.isArray(psData?.permissions) ? psData.permissions : [],
          largeFiles: Array.isArray(psData?.largeFiles) ? psData.largeFiles : [],
        };

        console.log('[FileSystemDiscoveryHook] Grouped data:', {
          shares: grouped.shares.length,
          permissions: grouped.permissions.length,
          largeFiles: grouped.largeFiles.length,
        });

        // Extract statistics from psData (not psWrapper!)
        const psStats = psData?.statistics || {};
        console.log('[FileSystemDiscoveryHook] Extracted statistics:', JSON.stringify(psStats));

        // Build final result
        const fileSystemResult: FileSystemDiscoveryResult = {
          id: psData?.id || token,
          configId: config?.servers?.join('-') || 'default',
          startTime: psData?.startTime?.DateTime || psData?.startTime || psWrapper?.StartTime?.DateTime || new Date().toISOString(),
          endTime: psData?.endTime?.DateTime || psData?.endTime || psWrapper?.EndTime?.DateTime || new Date().toISOString(),
          duration: psData?.duration || psWrapper?.Duration || result?.duration || 0,
          status: 'completed',
          servers: config.servers || ['localhost'],
          shares: grouped.shares,
          permissions: grouped.permissions,
          largeFiles: grouped.largeFiles,
          statistics: psStats && Object.keys(psStats).length > 0 ? psStats : {
            totalShares: grouped.shares.length,
            totalPermissions: grouped.permissions.length,
            totalLargeFiles: grouped.largeFiles.length,
            totalServers: config.servers?.length || 1,
            totalSizeMB: 0,
            averageFileSizeMB: 0,
            largestFileMB: 0,
          } as any,
          securityRisks: psData?.securityRisks || [],
          errors: psData?.errors || psWrapper?.Errors || [],
          warnings: psData?.warnings || psWrapper?.Warnings || [],
          metadata: {
            totalServersScanned: config.servers?.length || 1,
            totalSharesDiscovered: grouped.shares.length,
            totalPermissionsAnalyzed: grouped.permissions.length,
            totalFilesScanned: 0,
            totalFoldersScanned: 0,
            totalStorageAnalyzed: 0,
          },
        };

        const totalItems = fileSystemResult.shares.length +
                          fileSystemResult.permissions.length +
                          fileSystemResult.largeFiles.length;
        addLog(`Found ${fileSystemResult.shares.length} shares, ${fileSystemResult.permissions.length} permissions, ${fileSystemResult.largeFiles.length} large files`, 'success');

        setResult(fileSystemResult);

        // CRITICAL: Update state arrays so tabs can display data
        setShares(fileSystemResult.shares || []);
        setPermissions(fileSystemResult.permissions || []);
        setLargeFiles(fileSystemResult.largeFiles || []);

        // Store result in discovery store
        addDiscoveryResult({
          id: fileSystemResult.id,
          moduleName: 'FileSystemDiscovery',
          companyName: companyName,
          result: fileSystemResult,
          timestamp: new Date(),
        });
      } else {
        const errorMsg = result?.error || 'Discovery failed with unknown error';
        addLog(`Discovery failed: ${errorMsg}`, 'error');
        setError(errorMsg);
      }

      setIsRunning(false);
      setShowExecutionDialog(false);
      setCurrentToken(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addLog(`Error starting discovery: ${errorMessage}`, 'error');
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
      const outputPath = selectedSourceProfile?.outputPath || 'C:\\discoverydata\\default\\Raw';

      await electronAPI.executeDiscoveryModule(
        'FileSystemExport',
        selectedSourceProfile?.companyName || 'Unknown',
        {
          Result: result,
          Format: format,
          IncludeShares: true,
          IncludePermissions: true,
          IncludeLargeFiles: true,
          IncludeStatistics: true,
          IncludeSecurityRisks: true,
          OutputPath: outputPath,
        },
        { timeout: 60000 }
      );
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [result, selectedSourceProfile]);

  const selectTemplate = useCallback((template: FileSystemDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const electronAPI = getElectronAPI();
      const historyResult = await electronAPI.executeDiscoveryModule(
        'FileSystemHistory',
        selectedSourceProfile?.companyName || 'Unknown',
        {},
        { timeout: 30000 }
      );

      if (historyResult?.success && historyResult?.data?.history) {
        setDiscoveryHistory(historyResult.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, [selectedSourceProfile]);

  const loadHistoryItem = useCallback(async (id: string) => {
    try {
      const electronAPI = getElectronAPI();
      const historyResult = await electronAPI.executeDiscoveryModule(
        'FileSystemHistoryItem',
        selectedSourceProfile?.companyName || 'Unknown',
        { Id: id },
        { timeout: 30000 }
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
  }, [selectedSourceProfile]);

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
    {
      field: 'ShareType',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => params.value !== undefined ? `Type ${params.value}` : 'SMB'
    },
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
    { field: 'FolderCount', headerName: 'Folders', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { field: 'EncryptData', headerName: 'Encrypted', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const permissionColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'ShareName', headerName: 'Share', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'IdentityReference', headerName: 'Principal', sortable: true, filter: true, width: 250 },
    { field: 'AccessControlType', headerName: 'Access', sortable: true, filter: true, width: 100 },
    { field: 'FileSystemRights', headerName: 'Rights', sortable: true, filter: true, width: 250 },
    { field: 'InheritanceFlags', headerName: 'Inheritance', sortable: true, filter: true, width: 180 },
    { field: 'IsInherited', headerName: 'Inherited', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const largeFileColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'File Name', sortable: true, filter: true, pinned: 'left', width: 250 },
    { field: 'Path', headerName: 'Path', sortable: true, filter: true, width: 350 },
    { field: 'Extension', headerName: 'Type', sortable: true, filter: true, width: 100 },
    {
      field: 'SizeMB',
      headerName: 'Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => params.value !== undefined ? `${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MB` : 'N/A',
    },
    { field: 'ShareName', headerName: 'Share', sortable: true, filter: true, width: 200 },
    { field: 'Server', headerName: 'Server', sortable: true, filter: true, width: 150 },
    { field: 'IsReadOnly', headerName: 'ReadOnly', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'IsHidden', headerName: 'Hidden', sortable: true, filter: true, width: 100, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
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
