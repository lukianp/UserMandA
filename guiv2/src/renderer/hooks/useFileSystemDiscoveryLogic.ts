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
          console.log('[FileSystemDiscoveryHook] PowerShell return value:', psReturnValue);
          console.log('[FileSystemDiscoveryHook] PowerShell return value type:', typeof psReturnValue);
          console.log('[FileSystemDiscoveryHook] PowerShell return value is array?', Array.isArray(psReturnValue));

          // Handle nested data structure from PowerShell
          // PowerShell returns: { data: { Data: { shares: [...], permissions: [...] } } }
          const psWrapper = psReturnValue?.data || psReturnValue;
          let structuredData = psWrapper?.Data || psWrapper;
          console.log('[FileSystemDiscoveryHook] psWrapper:', psWrapper);
          console.log('[FileSystemDiscoveryHook] structuredData (after unwrapping):', structuredData);
          console.log('[FileSystemDiscoveryHook] structuredData keys:', Object.keys(structuredData || {}));
          console.log('[FileSystemDiscoveryHook] Data is array?', Array.isArray(structuredData));

          // If data is a flat array with _DataType properties, group by type
          if (Array.isArray(structuredData) && structuredData.length > 0 && structuredData[0]._DataType) {
            console.log('[FileSystemDiscoveryHook] Data is flat array, grouping by _DataType...');
            const grouped: any = {
              shares: [],
              permissions: [],
              largeFiles: [],
            };

            structuredData.forEach((item: any) => {
              if (item._DataType === 'Share') {
                grouped.shares.push(item);
              } else if (item._DataType === 'Permission') {
                grouped.permissions.push(item);
              } else if (item._DataType === 'LargeFile') {
                grouped.largeFiles.push(item);
              }
            });

            console.log('[FileSystemDiscoveryHook] Grouped data types:', Object.keys(grouped));
            structuredData = grouped;
          }

          // Build final result
          // Extract metadata from the Data level
          const metadata = psWrapper?.Data || structuredData;

          const fileSystemResult: FileSystemDiscoveryResult = {
            id: metadata?.id || data.executionId || `filesystem-discovery-${Date.now()}`,
            startTime: metadata?.startTime?.DateTime || metadata?.startTime || new Date().toISOString(),
            endTime: metadata?.endTime?.DateTime || metadata?.endTime || new Date().toISOString(),
            duration: metadata?.duration || 0,
            status: 'completed',
            config: config,
            shares: structuredData?.shares || [],
            permissions: structuredData?.permissions || [],
            largeFiles: structuredData?.largeFiles || [],
            statistics: metadata?.statistics || {
              totalShares: structuredData?.shares?.length || 0,
              totalPermissions: structuredData?.permissions?.length || 0,
              totalLargeFiles: structuredData?.largeFiles?.length || 0,
              totalServers: structuredData?.fileServers?.length || 0,
              totalSizeMB: 0,
              averageFileSizeMB: 0,
              largestFileMB: 0,
            },
            errors: psWrapper?.Errors || [],
            warnings: psWrapper?.Warnings || [],
          };

          console.log('[FileSystemDiscoveryHook] Final fileSystemResult:', fileSystemResult);
          console.log('[FileSystemDiscoveryHook] Final fileSystemResult.shares:', fileSystemResult.shares?.length || 0);
          console.log('[FileSystemDiscoveryHook] Final fileSystemResult.permissions:', fileSystemResult.permissions?.length || 0);
          console.log('[FileSystemDiscoveryHook] Final fileSystemResult.largeFiles:', fileSystemResult.largeFiles?.length || 0);

          setResult(fileSystemResult);
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

      // Handle the result - the discovery module returns synchronously
      if (result && result.success) {
        addLog('File System discovery completed successfully', 'success');

        // Process the result data - nested structure unwrapping
        // result = { success: true, data: { Success: true, Data: {...} } }
        const psWrapper = result.data || result;
        console.log('[FileSystemDiscoveryHook] psWrapper:', psWrapper);
        let structuredData = psWrapper?.Data || psWrapper;
        console.log('[FileSystemDiscoveryHook] structuredData:', structuredData);
        console.log('[FileSystemDiscoveryHook] structuredData keys:', Object.keys(structuredData || {}));

        // If data is a flat array with _DataType properties, group by type
        if (Array.isArray(structuredData) && structuredData.length > 0 && structuredData[0]?._DataType) {
          const grouped: any = { shares: [], permissions: [], largeFiles: [] };
          structuredData.forEach((item: any) => {
            if (item._DataType === 'Share') grouped.shares.push(item);
            else if (item._DataType === 'Permission') grouped.permissions.push(item);
            else if (item._DataType === 'LargeFile') grouped.largeFiles.push(item);
          });
          structuredData = grouped;
        }

        // Build final result
        const fileSystemResult: FileSystemDiscoveryResult = {
          id: token,
          startTime: psReturnValue?.startTime ? new Date(psReturnValue.startTime) : new Date(),
          endTime: psReturnValue?.endTime ? new Date(psReturnValue.endTime) : new Date(),
          duration: psReturnValue?.duration || 0,
          status: 'completed',
          config: config,
          shares: structuredData?.shares || [],
          permissions: structuredData?.permissions || [],
          largeFiles: structuredData?.largeFiles || [],
          statistics: psReturnValue?.statistics || {
            totalShares: structuredData?.shares?.length || 0,
            totalPermissions: structuredData?.permissions?.length || 0,
            totalLargeFiles: structuredData?.largeFiles?.length || 0,
            totalServers: config.servers?.length || 1,
            totalSizeMB: 0,
            averageFileSizeMB: 0,
            largestFileMB: 0,
          },
          errors: psReturnValue?.errors || [],
          warnings: psReturnValue?.warnings || [],
        };

        const totalItems = fileSystemResult.shares.length +
                          fileSystemResult.permissions.length +
                          fileSystemResult.largeFiles.length;
        addLog(`Found ${fileSystemResult.shares.length} shares, ${fileSystemResult.permissions.length} permissions, ${fileSystemResult.largeFiles.length} large files`, 'success');

        setResult(fileSystemResult);

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
    { field: 'name', headerName: 'Share Name', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'path', headerName: 'Path', sortable: true, filter: true, width: 300 },
    { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'server', headerName: 'Server', sortable: true, filter: true, width: 150 },
    {
      field: 'size.totalBytes',
      headerName: 'Total Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => formatBytes(params.value),
    },
    {
      field: 'size.percentUsed',
      headerName: 'Used %',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: (params) => `${params.value?.toFixed(1)}%`,
    },
    { field: 'statistics.totalFiles', headerName: 'Files', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { field: 'statistics.totalFolders', headerName: 'Folders', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { field: 'encryptionEnabled', headerName: 'Encrypted', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'deduplicationEnabled', headerName: 'Dedupe', sortable: true, filter: true, width: 100, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const permissionColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'shareName', headerName: 'Share', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'principal.name', headerName: 'Principal', sortable: true, filter: true, width: 250 },
    { field: 'principal.type', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'accessType', headerName: 'Access', sortable: true, filter: true, width: 100 },
    {
      field: 'rights',
      headerName: 'Rights',
      sortable: false,
      filter: false,
      width: 250,
      valueFormatter: (params) => params.value?.join(', ') || '',
    },
    { field: 'inheritance', headerName: 'Inheritance', sortable: true, filter: true, width: 150 },
    { field: 'isInherited', headerName: 'Inherited', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const largeFileColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'File Name', sortable: true, filter: true, pinned: 'left', width: 250 },
    { field: 'path', headerName: 'Path', sortable: true, filter: true, width: 350 },
    { field: 'extension', headerName: 'Type', sortable: true, filter: true, width: 100 },
    {
      field: 'sizeBytes',
      headerName: 'Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => formatBytes(params.value),
    },
    { field: 'owner', headerName: 'Owner', sortable: true, filter: true, width: 200 },
    { field: 'share', headerName: 'Share', sortable: true, filter: true, width: 200 },
    { field: 'modifiedDate', headerName: 'Modified', sortable: true, filter: 'agDateColumnFilter', width: 180 },
    { field: 'isEncrypted', headerName: 'Encrypted', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'isCompressed', headerName: 'Compressed', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
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
