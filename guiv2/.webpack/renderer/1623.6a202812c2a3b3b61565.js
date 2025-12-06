"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1623],{

/***/ 28436:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  $: () => (/* binding */ useFileSystemDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/filesystem.ts
/**
 * File System Discovery Type Definitions
 * Maps to FileSystemDiscovery.psm1 PowerShell module
 */
const DEFAULT_FILESYSTEM_CONFIG = {
    servers: ['localhost'],
    includeHiddenShares: false,
    includeAdministrativeShares: false,
    scanPermissions: true,
    scanLargeFiles: true,
    largeFileThresholdMB: 1024,
    analyzeStorage: true,
    detectSecurityRisks: true,
    maxDepth: 10,
    timeout: 300,
    parallelScans: 5,
};
const FILESYSTEM_TEMPLATES = [
    {
        name: 'Full Discovery',
        description: 'Complete file system discovery with all features enabled',
        isDefault: true,
        category: 'Full',
        config: DEFAULT_FILESYSTEM_CONFIG,
    },
    {
        name: 'Quick Scan',
        description: 'Fast scan of shares without deep analysis',
        isDefault: false,
        category: 'Quick',
        config: {
            ...DEFAULT_FILESYSTEM_CONFIG,
            scanPermissions: false,
            scanLargeFiles: false,
            analyzeStorage: false,
            detectSecurityRisks: false,
            maxDepth: 1,
        },
    },
    {
        name: 'Permissions Audit',
        description: 'Focus on detailed permission analysis',
        isDefault: false,
        category: 'Permissions',
        config: {
            ...DEFAULT_FILESYSTEM_CONFIG,
            scanLargeFiles: false,
            analyzeStorage: false,
            maxDepth: 3,
        },
    },
    {
        name: 'Storage Analysis',
        description: 'Analyze storage usage and large files',
        isDefault: false,
        category: 'Storage',
        config: {
            ...DEFAULT_FILESYSTEM_CONFIG,
            scanPermissions: false,
            detectSecurityRisks: false,
            largeFileThresholdMB: 500,
        },
    },
    {
        name: 'Security Scan',
        description: 'Detect security risks and misconfigurations',
        isDefault: false,
        category: 'Security',
        config: {
            ...DEFAULT_FILESYSTEM_CONFIG,
            scanLargeFiles: false,
            analyzeStorage: false,
            detectSecurityRisks: true,
        },
    },
];

// EXTERNAL MODULE: ./src/renderer/store/useDiscoveryStore.ts
var useDiscoveryStore = __webpack_require__(92856);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
// EXTERNAL MODULE: ./src/renderer/lib/electron-api-fallback.ts
var electron_api_fallback = __webpack_require__(58350);
;// ./src/renderer/hooks/useFileSystemDiscoveryLogic.ts





const useFileSystemDiscoveryLogic = () => {
    console.log('[FileSystemDiscoveryHook] ========== HOOK INITIALIZATION ==========');
    console.log('[FileSystemDiscoveryHook] Hook function called');
    // ELECTRON API VALIDATION
    console.log('[FileSystemDiscoveryHook] ========== ELECTRON API VALIDATION ==========');
    console.log('[FileSystemDiscoveryHook] window.electronAPI exists:', !!window.electronAPI);
    if (window.electronAPI) {
        console.log('[FileSystemDiscoveryHook] electronAPI methods:', Object.keys(window.electronAPI));
        console.log('[FileSystemDiscoveryHook] executeDiscoveryModule exists:', !!window.electronAPI.executeDiscoveryModule);
        console.log('[FileSystemDiscoveryHook] executeDiscoveryModule type:', typeof window.electronAPI.executeDiscoveryModule);
    }
    else {
        console.error('[FileSystemDiscoveryHook] ❌ CRITICAL: window.electronAPI is undefined!');
    }
    const selectedSourceProfile = (0,useProfileStore/* useProfileStore */.K)((state) => {
        console.log('[FileSystemDiscoveryHook] Accessing profile store...');
        const profile = state.selectedSourceProfile;
        console.log('[FileSystemDiscoveryHook] selectedSourceProfile:', profile);
        return profile;
    });
    const { getResultsByModuleName, addResult: addDiscoveryResult } = (0,useDiscoveryStore/* useDiscoveryStore */.R)();
    console.log('[FileSystemDiscoveryHook] Discovery store hooks obtained');
    const [result, setResult] = (0,react.useState)(null);
    const [isRunning, setIsRunning] = (0,react.useState)(false);
    const [progress, setProgress] = (0,react.useState)(null);
    const [error, setError] = (0,react.useState)(null);
    const [logs, setLogs] = (0,react.useState)([]);
    const [showExecutionDialog, setShowExecutionDialog] = (0,react.useState)(false);
    const [currentToken, setCurrentToken] = (0,react.useState)(null);
    const [config, setConfig] = (0,react.useState)(DEFAULT_FILESYSTEM_CONFIG);
    const [templates] = (0,react.useState)([]);
    const [selectedTemplate, setSelectedTemplate] = (0,react.useState)(null);
    const [activeTab, setActiveTab] = (0,react.useState)('overview');
    const [shares, setShares] = (0,react.useState)([]);
    const [shareFilter, setShareFilter] = (0,react.useState)({});
    const [selectedShares, setSelectedShares] = (0,react.useState)([]);
    const [permissions, setPermissions] = (0,react.useState)([]);
    const [permissionFilter, setPermissionFilter] = (0,react.useState)({});
    const [selectedPermissions, setSelectedPermissions] = (0,react.useState)([]);
    const [largeFiles, setLargeFiles] = (0,react.useState)([]);
    const [largeFileFilter, setLargeFileFilter] = (0,react.useState)({});
    const [selectedLargeFiles, setSelectedLargeFiles] = (0,react.useState)([]);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [discoveryHistory, setDiscoveryHistory] = (0,react.useState)([]);
    // Load previous discovery results from store on mount
    (0,react.useEffect)(() => {
        const previousResults = getResultsByModuleName('FileSystemDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[FileSystemDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            // Type assertion through unknown to avoid type errors
            setResult(latestResult.result);
        }
    }, [getResultsByModuleName]);
    // Utility function to add logs
    const addLog = (0,react.useCallback)((message, level = 'info') => {
        const newLog = { timestamp: new Date().toISOString(), message, level };
        setLogs((prevLogs) => [...prevLogs, newLog]);
    }, []);
    // ✅ REMOVED: Event-driven code - File System uses synchronous executeDiscoveryModule
    // No event listeners needed since we get results directly from the API call
    const startDiscovery = (0,react.useCallback)(async () => {
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
            phase: 'initializing',
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
            console.log('[FileSystemDiscoveryHook] electronAPI.executeDiscovery exists:', !!electronAPI.executeDiscovery);
            // PRE-CALL VALIDATION
            if (!electronAPI.executeDiscovery) {
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
            const result = await electronAPI.executeDiscovery(discoveryParams);
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
                }
                catch (e) {
                    console.warn('[FileSystemDiscoveryHook] Debug logging error:', e);
                }
                // Extract structured data from PowerShell result
                // PowerShell returns nested structure: result.result.data.Data = { shares: [], permissions: [], ... }
                // The actual data is at: result.result.data.Data
                const resultAny = result;
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
                }
                else {
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
                const fsResult = {
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
                });
            }
            else {
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
        }
        catch (err) {
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
    const cancelDiscovery = (0,react.useCallback)(async () => {
        if (!isRunning || !currentToken)
            return;
        try {
            addLog('Cancelling File System discovery...', 'warning');
            await window.electron.cancelDiscovery(currentToken);
            setIsRunning(false);
            setProgress(null);
            setShowExecutionDialog(false);
            setCurrentToken(null);
            addLog('File System discovery cancelled', 'warning');
        }
        catch (err) {
            console.error('Failed to cancel discovery:', err);
            addLog(`Failed to cancel: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
    }, [isRunning, currentToken, addLog]);
    const exportResults = (0,react.useCallback)(async (format) => {
        if (!result)
            return;
        try {
            const electronAPI = (0,electron_api_fallback/* getElectronAPI */.d)();
            await electronAPI.executeModule('FileSystemExport', {
                Result: result,
                Format: format,
                IncludeShares: true,
                IncludePermissions: true,
                IncludeLargeFiles: true,
                IncludeStatistics: true,
                IncludeSecurityRisks: true,
                OutputPath: 'C:\\discoverydata\\default\\Raw',
            });
        }
        catch (err) {
            console.error('Export failed:', err);
        }
    }, [result]);
    const selectTemplate = (0,react.useCallback)((template) => {
        setSelectedTemplate(template);
        setConfig(template.config);
    }, []);
    const loadHistory = (0,react.useCallback)(async () => {
        try {
            const electronAPI = (0,electron_api_fallback/* getElectronAPI */.d)();
            const historyResult = await electronAPI.executeModule('FileSystemHistory', {});
            if (historyResult?.success && historyResult?.data?.history) {
                setDiscoveryHistory(historyResult.data.history);
            }
        }
        catch (err) {
            console.error('Failed to load history:', err);
        }
    }, []);
    const loadHistoryItem = (0,react.useCallback)(async (id) => {
        try {
            const electronAPI = (0,electron_api_fallback/* getElectronAPI */.d)();
            const historyResult = await electronAPI.executeModule('FileSystemHistoryItem', { Id: id });
            if (historyResult?.success && historyResult?.data) {
                const typedResult = historyResult.data;
                setResult(typedResult);
                setShares(typedResult.shares || []);
                setPermissions(typedResult.permissions || []);
                setLargeFiles(typedResult.largeFiles || []);
            }
        }
        catch (err) {
            console.error('Failed to load history item:', err);
        }
    }, []);
    const filteredShares = (0,react.useMemo)(() => {
        console.log('[FileSystemDiscoveryHook] Computing filteredShares from shares:', shares?.length || 0);
        let filtered = shares;
        if (shareFilter.type?.length) {
            filtered = filtered.filter(s => shareFilter.type.includes(s.type));
        }
        if (shareFilter.minSize !== undefined) {
            filtered = filtered.filter(s => s.size.totalBytes >= shareFilter.minSize * 1024 * 1024 * 1024);
        }
        if (shareFilter.maxSize !== undefined) {
            filtered = filtered.filter(s => s.size.totalBytes <= shareFilter.maxSize * 1024 * 1024 * 1024);
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
            filtered = filtered.filter(s => (s.name ?? '').toLowerCase().includes(search) ||
                (s.path ?? '').toLowerCase().includes(search) ||
                s.description?.toLowerCase().includes(search));
        }
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(s => (s.name ?? '').toLowerCase().includes(search) ||
                (s.path ?? '').toLowerCase().includes(search));
        }
        console.log('[FileSystemDiscoveryHook] filteredShares result:', filtered?.length || 0);
        return filtered;
    }, [shares, shareFilter, searchText]);
    const filteredPermissions = (0,react.useMemo)(() => {
        let filtered = permissions;
        if (permissionFilter.accessType?.length) {
            filtered = filtered.filter(p => permissionFilter.accessType.includes(p.accessType));
        }
        if (permissionFilter.principalType?.length) {
            filtered = filtered.filter(p => permissionFilter.principalType.includes(p.principal.type));
        }
        if (permissionFilter.share) {
            filtered = filtered.filter(p => p.shareName === permissionFilter.share);
        }
        if (permissionFilter.searchText) {
            const search = permissionFilter.searchText.toLowerCase();
            filtered = filtered.filter(p => (p.principal?.name ?? '').toLowerCase().includes(search) ||
                (p.shareName ?? '').toLowerCase().includes(search));
        }
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(p => (p.principal?.name ?? '').toLowerCase().includes(search) ||
                (p.shareName ?? '').toLowerCase().includes(search));
        }
        return filtered;
    }, [permissions, permissionFilter, searchText]);
    const filteredLargeFiles = (0,react.useMemo)(() => {
        let filtered = largeFiles;
        if (largeFileFilter.minSize !== undefined) {
            filtered = filtered.filter(f => f.sizeBytes >= largeFileFilter.minSize * 1024 * 1024);
        }
        if (largeFileFilter.extension?.length) {
            filtered = filtered.filter(f => largeFileFilter.extension.includes(f.extension));
        }
        if (largeFileFilter.share) {
            filtered = filtered.filter(f => f.share === largeFileFilter.share);
        }
        if (largeFileFilter.isEncrypted !== undefined) {
            filtered = filtered.filter(f => f.isEncrypted === largeFileFilter.isEncrypted);
        }
        if (largeFileFilter.searchText) {
            const search = largeFileFilter.searchText.toLowerCase();
            filtered = filtered.filter(f => (f.name ?? '').toLowerCase().includes(search) ||
                (f.path ?? '').toLowerCase().includes(search));
        }
        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter(f => (f.name ?? '').toLowerCase().includes(search) ||
                (f.path ?? '').toLowerCase().includes(search));
        }
        return filtered;
    }, [largeFiles, largeFileFilter, searchText]);
    const shareColumnDefs = (0,react.useMemo)(() => [
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
    const permissionColumnDefs = (0,react.useMemo)(() => [
        { field: 'ShareName', headerName: 'Share', sortable: true, filter: true, pinned: 'left', width: 200 },
        { field: 'IdentityReference', headerName: 'Principal', sortable: true, filter: true, width: 250 },
        { field: 'FileSystemRights', headerName: 'Rights', sortable: true, filter: true, width: 250 },
        { field: 'AccessControlType', headerName: 'Access', sortable: true, filter: true, width: 100 },
    ], []);
    const largeFileColumnDefs = (0,react.useMemo)(() => [
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
    (0,react.useEffect)(() => {
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
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}


/***/ }),

/***/ 33523:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   z: () => (/* binding */ ProgressBar)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);

/**
 * ProgressBar Component
 *
 * Progress indicator with percentage display and optional label.
 * Supports different variants and sizes.
 */


/**
 * ProgressBar Component
 */
const ProgressBar = ({ value, max = 100, variant = 'default', size = 'md', showLabel = true, label, labelPosition = 'inside', striped = false, animated = false, className, 'data-cy': dataCy, }) => {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    // Variant colors
    const variantClasses = {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-cyan-600',
    };
    // Background colors
    const bgClasses = {
        default: 'bg-blue-100',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        info: 'bg-cyan-100',
    };
    // Size classes
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('w-full', className);
    const trackClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('w-full rounded-full overflow-hidden', bgClasses[variant], sizeClasses[size]);
    const barClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('h-full transition-all duration-300 ease-out', variantClasses[variant], {
        // Striped pattern
        'bg-gradient-to-r from-transparent via-black/10 to-transparent bg-[length:1rem_100%]': striped,
        'animate-progress-stripes': striped && animated,
    });
    const labelText = label || (showLabel ? `${Math.round(percentage)}%` : '');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [labelText && labelPosition === 'outside' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-between mb-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium text-gray-700", children: labelText }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: trackClasses, role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: barClasses, style: { width: `${percentage}%` }, children: labelText && labelPosition === 'inside' && size !== 'sm' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full px-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs font-semibold text-white whitespace-nowrap", children: labelText }) })) }) })] }));
};
// Add animation for striped progress bars
const styles = `
@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
`;
// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'progress-bar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProgressBar);


/***/ }),

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

/**
 * Input Component
 *
 * Accessible input field with label, error states, and help text
 */



/**
 * Input component with full accessibility support
 */
const Input = (0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(({ label, helperText, error, required = false, showOptional = true, inputSize = 'md', fullWidth = false, startIcon, endIcon, className, id, 'data-cy': dataCy, disabled = false, ...props }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };
    // Input classes
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Info */ .R2D, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


/***/ }),

/***/ 50364:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* unused harmony export FileSystemConfigDialog */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34766);
/* harmony import */ var _atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(63683);

/**
 * File System Discovery Configuration Dialog
 * Modal dialog for configuring file system discovery parameters
 */





const FileSystemConfigDialog = ({ isOpen, onClose, config, onSave, }) => {
    const [localConfig, setLocalConfig] = react__WEBPACK_IMPORTED_MODULE_1__.useState(config);
    const [newServer, setNewServer] = react__WEBPACK_IMPORTED_MODULE_1__.useState('');
    const [errors, setErrors] = react__WEBPACK_IMPORTED_MODULE_1__.useState([]);
    // Update local config when prop changes
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(() => {
        setLocalConfig(config);
    }, [config]);
    const handleAddServer = () => {
        if (!newServer.trim()) {
            setErrors(['Server name cannot be empty']);
            return;
        }
        // Validate server format (basic check)
        const serverName = newServer.trim();
        if (localConfig.servers.includes(serverName)) {
            setErrors([`Server "${serverName}" is already in the list`]);
            return;
        }
        setLocalConfig({
            ...localConfig,
            servers: [...localConfig.servers, serverName],
        });
        setNewServer('');
        setErrors([]);
    };
    const handleRemoveServer = (index) => {
        setLocalConfig({
            ...localConfig,
            servers: localConfig.servers.filter((_, i) => i !== index),
        });
    };
    const handleSave = () => {
        // Validate configuration
        const validationErrors = [];
        if (localConfig.servers.length === 0) {
            validationErrors.push('At least one server must be configured');
        }
        if (localConfig.largeFileThresholdMB < 1) {
            validationErrors.push('Large file threshold must be at least 1 MB');
        }
        if (localConfig.maxDepth < 1) {
            validationErrors.push('Max depth must be at least 1');
        }
        if (localConfig.timeout < 60) {
            validationErrors.push('Timeout must be at least 60 seconds');
        }
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSave(localConfig);
        setErrors([]);
        onClose();
    };
    const handleCancel = () => {
        setLocalConfig(config);
        setErrors([]);
        setNewServer('');
        onClose();
    };
    if (!isOpen)
        return null;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "File System Discovery Configuration" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleCancel, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-180px)]", children: [errors.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertCircle */ .RIJ, { className: "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-sm font-semibold text-red-900 dark:text-red-100 mb-1", children: "Configuration Errors" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("ul", { className: "list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1", children: errors.map((error, index) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("li", { children: error }, index))) })] })] }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mb-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "File Servers" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-3", children: "Add server names or IP addresses to scan. Supports UNC paths (e.g., \\\\SERVER01) or FQDN (e.g., fileserver.domain.com)" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-2 mb-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { type: "text", value: newServer, onChange: (e) => setNewServer(e.target.value), placeholder: "\\\\SERVER01 or fileserver.domain.com", onKeyPress: (e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddServer();
                                                    }
                                                } }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "primary", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Plus */ .FWt, { className: "w-4 h-4" }), onClick: handleAddServer, children: "Add" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-2", children: localConfig.servers.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-center py-4 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Server */ .gq4, { className: "w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "No servers configured. Add at least one server to begin discovery." })] })) : (localConfig.servers.map((server, index) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Server */ .gq4, { className: "w-4 h-4 text-amber-600 dark:text-amber-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: server })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: () => handleRemoveServer(index), className: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Trash2 */ .TBR, { className: "w-4 h-4" }) })] }, index)))) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mb-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Scan Options" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Include Hidden Shares", checked: localConfig.includeHiddenShares, onChange: (checked) => setLocalConfig({ ...localConfig, includeHiddenShares: checked }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Include Administrative Shares (C$, ADMIN$, etc.)", checked: localConfig.includeAdministrativeShares, onChange: (checked) => setLocalConfig({ ...localConfig, includeAdministrativeShares: checked }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Scan Permissions", checked: localConfig.scanPermissions, onChange: (checked) => setLocalConfig({ ...localConfig, scanPermissions: checked }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Scan for Large Files", checked: localConfig.scanLargeFiles, onChange: (checked) => setLocalConfig({ ...localConfig, scanLargeFiles: checked }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Analyze Storage Statistics", checked: localConfig.analyzeStorage, onChange: (checked) => setLocalConfig({ ...localConfig, analyzeStorage: checked }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: "Detect Security Risks", checked: localConfig.detectSecurityRisks, onChange: (checked) => setLocalConfig({ ...localConfig, detectSecurityRisks: checked }) })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "mb-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3", children: "Advanced Options" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { label: "Large File Threshold (MB)", type: "number", value: localConfig.largeFileThresholdMB.toString(), onChange: (e) => setLocalConfig({
                                                ...localConfig,
                                                largeFileThresholdMB: parseInt(e.target.value) || 100,
                                            }), min: 1, max: 10000 }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { label: "Max Scan Depth", type: "number", value: localConfig.maxDepth.toString(), onChange: (e) => setLocalConfig({
                                                ...localConfig,
                                                maxDepth: parseInt(e.target.value) || 5,
                                            }), min: 1, max: 20, helperText: "Maximum directory depth to scan" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { label: "Timeout (seconds)", type: "number", value: localConfig.timeout.toString(), onChange: (e) => setLocalConfig({
                                                ...localConfig,
                                                timeout: parseInt(e.target.value) || 3600,
                                            }), min: 60, max: 7200 }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { label: "Parallel Scans", type: "number", value: localConfig.parallelScans.toString(), onChange: (e) => setLocalConfig({
                                                ...localConfig,
                                                parallelScans: parseInt(e.target.value) || 4,
                                            }), min: 1, max: 10, helperText: "Number of concurrent share scans" })] })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "secondary", onClick: handleCancel, children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "primary", onClick: handleSave, children: "Save Configuration" })] })] }) }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FileSystemConfigDialog);


/***/ }),

/***/ 53404:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   I: () => (/* binding */ SearchBar)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

/**
 * SearchBar Component
 *
 * Search input with icon, clear button, and debounced onChange.
 * Used for filtering lists and tables.
 */



/**
 * SearchBar Component
 */
const SearchBar = ({ value: controlledValue = '', onChange, placeholder = 'Search...', debounceDelay = 300, disabled = false, size = 'md', className, 'data-cy': dataCy, }) => {
    const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(controlledValue);
    // Sync with controlled value
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        setInputValue(controlledValue);
    }, [controlledValue]);
    // Debounced onChange
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const handler = setTimeout(() => {
            if (onChange && inputValue !== controlledValue) {
                onChange(inputValue);
            }
        }, debounceDelay);
        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, onChange, debounceDelay, controlledValue]);
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleClear = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setInputValue('');
        if (onChange) {
            onChange('');
        }
    }, [onChange]);
    // Size classes
    const sizeClasses = {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 text-base px-4',
        lg: 'h-12 text-lg px-5',
    };
    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Search */ .vji, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


/***/ }),

/***/ 59944:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(28709);

/**
 * VirtualizedDataGrid Component
 *
 * Enterprise-grade data grid using AG Grid Enterprise
 * Handles 100,000+ rows with virtual scrolling at 60 FPS
 */







// Lazy load AG Grid CSS - only load once when first grid mounts
let agGridStylesLoaded = false;
const loadAgGridStyles = () => {
    if (agGridStylesLoaded)
        return;
    // Dynamically import AG Grid styles
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, 46479));
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, 64010));
    agGridStylesLoaded = true;
};
/**
 * High-performance data grid component
 */
function VirtualizedDataGridInner({ data, columns, loading = false, virtualRowHeight = 32, enableColumnReorder = true, enableColumnResize = true, enableExport = true, enablePrint = true, enableGrouping = false, enableFiltering = true, enableSelection = true, selectionMode = 'multiple', pagination = true, paginationPageSize = 100, onRowClick, onSelectionChange, className, height = '600px', 'data-cy': dataCy, }, ref) {
    const gridRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const [gridApi, setGridApi] = react__WEBPACK_IMPORTED_MODULE_1__.useState(null);
    const [showColumnPanel, setShowColumnPanel] = react__WEBPACK_IMPORTED_MODULE_1__.useState(false);
    const rowData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const result = data ?? [];
        console.log('[VirtualizedDataGrid] rowData computed:', result.length, 'rows');
        return result;
    }, [data]);
    // Load AG Grid styles on component mount
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        loadAgGridStyles();
    }, []);
    // Default column definition
    const defaultColDef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        sortable: true,
        filter: enableFiltering,
        resizable: enableColumnResize,
        floatingFilter: enableFiltering,
        minWidth: 100,
    }), [enableFiltering, enableColumnResize]);
    // Grid options
    const gridOptions = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        rowHeight: virtualRowHeight,
        headerHeight: 40,
        floatingFiltersHeight: 40,
        suppressRowClickSelection: !enableSelection,
        rowSelection: enableSelection ? selectionMode : undefined,
        animateRows: true,
        // FIX: Disable charts to avoid error #200 (requires IntegratedChartsModule)
        enableCharts: false,
        // FIX: Use cellSelection instead of deprecated enableRangeSelection
        cellSelection: true,
        // FIX: Use legacy theme to prevent theming API conflict (error #239)
        // Must be set to 'legacy' to use v32 style themes with CSS files
        theme: 'legacy',
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
                { statusPanel: 'agAggregationComponent', align: 'right' },
            ],
        },
        sideBar: enableGrouping
            ? {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        labelKey: 'filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                    },
                ],
                defaultToolPanel: '',
            }
            : false,
    }), [virtualRowHeight, enableSelection, selectionMode, enableGrouping]);
    // Handle grid ready event
    const onGridReady = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
    }, []);
    // Handle row click
    const handleRowClick = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onRowClick && event.data) {
            onRowClick(event.data);
        }
    }, [onRowClick]);
    // Handle selection change
    const handleSelectionChange = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onSelectionChange) {
            const selectedRows = event.api.getSelectedRows();
            onSelectionChange(selectedRows);
        }
    }, [onSelectionChange]);
    // Export to CSV
    const exportToCsv = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsCsv({
                fileName: `export-${new Date().toISOString()}.csv`,
            });
        }
    }, [gridApi]);
    // Export to Excel
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsExcel({
                fileName: `export-${new Date().toISOString()}.xlsx`,
                sheetName: 'Data',
            });
        }
    }, [gridApi]);
    // Print grid
    const printGrid = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.setGridOption('domLayout', 'print');
            setTimeout(() => {
                window.print();
                gridApi.setGridOption('domLayout', undefined);
            }, 100);
        }
    }, [gridApi]);
    // Toggle column visibility panel
    const toggleColumnPanel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setShowColumnPanel(!showColumnPanel);
    }, [showColumnPanel]);
    // Auto-size all columns
    const autoSizeColumns = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            const allColumnIds = columns.map(c => c.field).filter(Boolean);
            gridApi.autoSizeColumns(allColumnIds);
        }
    }, [gridApi, columns]);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Filter */ .dJT, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .EyeOff */ .X_F, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Eye */ .kU3, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Printer */ .xjr, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__/* .AgGridReact */ .W6, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
                                            if (gridApi && col.field) {
                                                gridApi.setColumnsVisible([col.field], e.target.checked);
                                            }
                                        } }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: col.headerName || col.field })] }, col.field)))] }))] })] }));
}
const VirtualizedDataGrid = react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(VirtualizedDataGridInner);
// Set displayName for React DevTools
VirtualizedDataGrid.displayName = 'VirtualizedDataGrid';


/***/ }),

/***/ 63683:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   S: () => (/* binding */ Checkbox)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

/**
 * Checkbox Component
 *
 * Fully accessible checkbox component with labels and error states.
 * Follows WCAG 2.1 AA guidelines.
 */



/**
 * Checkbox Component
 */
const Checkbox = ({ label, description, checked = false, onChange, error, disabled = false, indeterminate = false, className, 'data-cy': dataCy, }) => {
    const id = (0,react__WEBPACK_IMPORTED_MODULE_1__.useId)();
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;
    const hasError = Boolean(error);
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    // Handle indeterminate via ref
    const checkboxRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef(null);
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);
    const checkboxClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'h-5 w-5 rounded border-2', 'transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'dark:ring-offset-gray-900', 
    // State-based styles
    {
        // Normal state (unchecked)
        'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700': !hasError && !disabled && !checked,
        'focus:ring-blue-500': !hasError && !disabled,
        // Checked state
        'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500': checked && !disabled && !hasError,
        // Error state
        'border-red-500 text-red-600 dark:border-red-400': hasError && !disabled,
        'focus:ring-red-500': hasError && !disabled,
        // Disabled state
        'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed': disabled,
    });
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('text-sm font-medium', {
        'text-gray-700 dark:text-gray-200': !hasError && !disabled,
        'text-red-700 dark:text-red-400': hasError && !disabled,
        'text-gray-500 dark:text-gray-500': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('flex flex-col', className), children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center h-5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: checkboxRef, id: id, type: "checkbox", checked: checked, onChange: handleChange, disabled: disabled, className: "sr-only peer", "aria-invalid": hasError, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)({
                                    [errorId]: hasError,
                                    [descriptionId]: description,
                                }), "data-cy": dataCy }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(checkboxClasses, 'flex items-center justify-center cursor-pointer', {
                                    'cursor-not-allowed': disabled,
                                }), children: [checked && !indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Check */ .Jlk, { className: "h-4 w-4 text-white", strokeWidth: 3 })), indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "h-0.5 w-3 bg-white rounded" }))] })] }), (label || description) && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "ml-3", children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(labelClasses, 'cursor-pointer'), children: label })), description && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: descriptionId, className: "text-sm text-gray-500 dark:text-gray-400 mt-0.5", children: description }))] }))] }), hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: errorId, className: "mt-1 ml-8 text-sm text-red-600", role: "alert", "aria-live": "polite", children: error }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Checkbox);


/***/ }),

/***/ 92856:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useDiscoveryStore)
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55618);
/* harmony import */ var zustand_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(87134);
/**
 * Discovery Store
 *
 * Manages discovery operations, results, and state.
 * Handles domain, network, user, and application discovery processes.
 */


const useDiscoveryStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__/* .create */ .vt)()((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__/* .devtools */ .lt)((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__/* .subscribeWithSelector */ .eh)((set, get) => ({
    // Initial state
    operations: new Map(),
    results: new Map(),
    selectedOperation: null,
    isDiscovering: false,
    // Actions
    /**
     * Start a new discovery operation
     */
    startDiscovery: async (type, parameters) => {
        const operationId = crypto.randomUUID();
        const cancellationToken = crypto.randomUUID();
        const operation = {
            id: operationId,
            type,
            status: 'running',
            progress: 0,
            message: 'Initializing discovery...',
            itemsDiscovered: 0,
            startedAt: Date.now(),
            cancellationToken,
        };
        // Add operation to state
        set((state) => {
            const newOperations = new Map(state.operations);
            newOperations.set(operationId, operation);
            return {
                operations: newOperations,
                selectedOperation: operationId,
                isDiscovering: true,
            };
        });
        // Setup progress listener
        const progressCleanup = window.electronAPI.onProgress((data) => {
            if (data.executionId === cancellationToken) {
                get().updateProgress(operationId, data.percentage, data.message || 'Processing...');
            }
        });
        try {
            // Execute discovery module
            const result = await window.electronAPI.executeModule({
                modulePath: `Modules/Discovery/${type}.psm1`,
                functionName: `Start-${type}Discovery`,
                parameters,
                options: {
                    cancellationToken,
                    streamOutput: true,
                    timeout: 300000, // 5 minutes
                },
            });
            // Cleanup progress listener
            progressCleanup();
            if (result.success) {
                get().completeDiscovery(operationId, result.data?.results || []);
            }
            else {
                get().failDiscovery(operationId, result.error || 'Discovery failed');
            }
        }
        catch (error) {
            progressCleanup();
            get().failDiscovery(operationId, error.message || 'Discovery failed');
        }
        return operationId;
    },
    /**
     * Cancel a running discovery operation
     */
    cancelDiscovery: async (operationId) => {
        const operation = get().operations.get(operationId);
        if (!operation || operation.status !== 'running') {
            return;
        }
        try {
            await window.electronAPI.cancelExecution(operation.cancellationToken);
            set((state) => {
                const newOperations = new Map(state.operations);
                const op = newOperations.get(operationId);
                if (op) {
                    op.status = 'cancelled';
                    op.message = 'Discovery cancelled by user';
                    op.completedAt = Date.now();
                }
                return {
                    operations: newOperations,
                    isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
                };
            });
        }
        catch (error) {
            console.error('Failed to cancel discovery:', error);
        }
    },
    /**
     * Update progress for a running operation
     */
    updateProgress: (operationId, progress, message) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation && operation.status === 'running') {
                operation.progress = progress;
                operation.message = message;
            }
            return { operations: newOperations };
        });
    },
    /**
     * Mark operation as completed with results
     */
    completeDiscovery: (operationId, results) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const newResults = new Map(state.results);
            const operation = newOperations.get(operationId);
            if (operation) {
                operation.status = 'completed';
                operation.progress = 100;
                operation.message = `Discovered ${results.length} items`;
                operation.itemsDiscovered = results.length;
                operation.completedAt = Date.now();
            }
            newResults.set(operationId, results);
            return {
                operations: newOperations,
                results: newResults,
                isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
            };
        });
    },
    /**
     * Mark operation as failed
     */
    failDiscovery: (operationId, error) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation) {
                operation.status = 'failed';
                operation.error = error;
                operation.message = `Discovery failed: ${error}`;
                operation.completedAt = Date.now();
            }
            return {
                operations: newOperations,
                isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
            };
        });
    },
    /**
     * Clear a single operation and its results
     */
    clearOperation: (operationId) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const newResults = new Map(state.results);
            newOperations.delete(operationId);
            newResults.delete(operationId);
            return {
                operations: newOperations,
                results: newResults,
                selectedOperation: state.selectedOperation === operationId ? null : state.selectedOperation,
            };
        });
    },
    /**
     * Clear all operations and results
     */
    clearAllOperations: () => {
        // Only clear completed, failed, or cancelled operations
        set((state) => {
            const newOperations = new Map(state.operations);
            const newResults = new Map(state.results);
            for (const [id, operation] of newOperations.entries()) {
                if (operation.status !== 'running') {
                    newOperations.delete(id);
                    newResults.delete(id);
                }
            }
            return {
                operations: newOperations,
                results: newResults,
            };
        });
    },
    /**
     * Get a specific operation
     */
    getOperation: (operationId) => {
        return get().operations.get(operationId);
    },
    /**
     * Get results for a specific operation
     */
    getResults: (operationId) => {
        return get().results.get(operationId);
    },
    /**
     * Get results by module name (for persistent retrieval across component remounts)
     */
    getResultsByModuleName: (moduleName) => {
        return get().results.get(moduleName);
    },
    /**
     * Add a discovery result (compatibility method for hooks)
     */
    addResult: (result) => {
        set((state) => {
            const newResults = new Map(state.results);
            const existingResults = newResults.get(result.moduleName) || [];
            newResults.set(result.moduleName, [...existingResults, result]);
            return { results: newResults };
        });
    },
    /**
     * Set progress information (compatibility method for hooks)
     */
    setProgress: (progressData) => {
        // Find the current operation for this module and update it
        const operations = get().operations;
        const operationId = Array.from(operations.keys()).find(id => {
            const op = operations.get(id);
            return op && op.type === progressData.moduleName;
        });
        if (operationId) {
            get().updateProgress(operationId, progressData.overallProgress, progressData.message);
        }
    },
})), {
    name: 'DiscoveryStore',
}));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGdCQUFnQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELE1BQU07QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci90eXBlcy9tb2RlbHMvZmlsZXN5c3RlbS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VGaWxlU3lzdGVtRGlzY292ZXJ5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL0ZpbGVTeXN0ZW1Db25maWdEaWFsb2cudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGaWxlIFN5c3RlbSBEaXNjb3ZlcnkgVHlwZSBEZWZpbml0aW9uc1xuICogTWFwcyB0byBGaWxlU3lzdGVtRGlzY292ZXJ5LnBzbTEgUG93ZXJTaGVsbCBtb2R1bGVcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRklMRVNZU1RFTV9DT05GSUcgPSB7XG4gICAgc2VydmVyczogWydsb2NhbGhvc3QnXSxcbiAgICBpbmNsdWRlSGlkZGVuU2hhcmVzOiBmYWxzZSxcbiAgICBpbmNsdWRlQWRtaW5pc3RyYXRpdmVTaGFyZXM6IGZhbHNlLFxuICAgIHNjYW5QZXJtaXNzaW9uczogdHJ1ZSxcbiAgICBzY2FuTGFyZ2VGaWxlczogdHJ1ZSxcbiAgICBsYXJnZUZpbGVUaHJlc2hvbGRNQjogMTAyNCxcbiAgICBhbmFseXplU3RvcmFnZTogdHJ1ZSxcbiAgICBkZXRlY3RTZWN1cml0eVJpc2tzOiB0cnVlLFxuICAgIG1heERlcHRoOiAxMCxcbiAgICB0aW1lb3V0OiAzMDAsXG4gICAgcGFyYWxsZWxTY2FuczogNSxcbn07XG5leHBvcnQgY29uc3QgRklMRVNZU1RFTV9URU1QTEFURVMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiAnRnVsbCBEaXNjb3ZlcnknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbXBsZXRlIGZpbGUgc3lzdGVtIGRpc2NvdmVyeSB3aXRoIGFsbCBmZWF0dXJlcyBlbmFibGVkJyxcbiAgICAgICAgaXNEZWZhdWx0OiB0cnVlLFxuICAgICAgICBjYXRlZ29yeTogJ0Z1bGwnLFxuICAgICAgICBjb25maWc6IERFRkFVTFRfRklMRVNZU1RFTV9DT05GSUcsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdRdWljayBTY2FuJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGYXN0IHNjYW4gb2Ygc2hhcmVzIHdpdGhvdXQgZGVlcCBhbmFseXNpcycsXG4gICAgICAgIGlzRGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNhdGVnb3J5OiAnUXVpY2snLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIC4uLkRFRkFVTFRfRklMRVNZU1RFTV9DT05GSUcsXG4gICAgICAgICAgICBzY2FuUGVybWlzc2lvbnM6IGZhbHNlLFxuICAgICAgICAgICAgc2NhbkxhcmdlRmlsZXM6IGZhbHNlLFxuICAgICAgICAgICAgYW5hbHl6ZVN0b3JhZ2U6IGZhbHNlLFxuICAgICAgICAgICAgZGV0ZWN0U2VjdXJpdHlSaXNrczogZmFsc2UsXG4gICAgICAgICAgICBtYXhEZXB0aDogMSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ1Blcm1pc3Npb25zIEF1ZGl0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGb2N1cyBvbiBkZXRhaWxlZCBwZXJtaXNzaW9uIGFuYWx5c2lzJyxcbiAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY2F0ZWdvcnk6ICdQZXJtaXNzaW9ucycsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgLi4uREVGQVVMVF9GSUxFU1lTVEVNX0NPTkZJRyxcbiAgICAgICAgICAgIHNjYW5MYXJnZUZpbGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGFuYWx5emVTdG9yYWdlOiBmYWxzZSxcbiAgICAgICAgICAgIG1heERlcHRoOiAzLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnU3RvcmFnZSBBbmFseXNpcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQW5hbHl6ZSBzdG9yYWdlIHVzYWdlIGFuZCBsYXJnZSBmaWxlcycsXG4gICAgICAgIGlzRGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNhdGVnb3J5OiAnU3RvcmFnZScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgLi4uREVGQVVMVF9GSUxFU1lTVEVNX0NPTkZJRyxcbiAgICAgICAgICAgIHNjYW5QZXJtaXNzaW9uczogZmFsc2UsXG4gICAgICAgICAgICBkZXRlY3RTZWN1cml0eVJpc2tzOiBmYWxzZSxcbiAgICAgICAgICAgIGxhcmdlRmlsZVRocmVzaG9sZE1COiA1MDAsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdTZWN1cml0eSBTY2FuJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEZXRlY3Qgc2VjdXJpdHkgcmlza3MgYW5kIG1pc2NvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY2F0ZWdvcnk6ICdTZWN1cml0eScsXG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgLi4uREVGQVVMVF9GSUxFU1lTVEVNX0NPTkZJRyxcbiAgICAgICAgICAgIHNjYW5MYXJnZUZpbGVzOiBmYWxzZSxcbiAgICAgICAgICAgIGFuYWx5emVTdG9yYWdlOiBmYWxzZSxcbiAgICAgICAgICAgIGRldGVjdFNlY3VyaXR5Umlza3M6IHRydWUsXG4gICAgICAgIH0sXG4gICAgfSxcbl07XG4iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERFRkFVTFRfRklMRVNZU1RFTV9DT05GSUcsIH0gZnJvbSAnLi4vdHlwZXMvbW9kZWxzL2ZpbGVzeXN0ZW0nO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5U3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZSc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgZ2V0RWxlY3Ryb25BUEkgfSBmcm9tICcuLi9saWIvZWxlY3Ryb24tYXBpLWZhbGxiYWNrJztcbmV4cG9ydCBjb25zdCB1c2VGaWxlU3lzdGVtRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gPT09PT09PT09PSBIT09LIElOSVRJQUxJWkFUSU9OID09PT09PT09PT0nKTtcbiAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBIb29rIGZ1bmN0aW9uIGNhbGxlZCcpO1xuICAgIC8vIEVMRUNUUk9OIEFQSSBWQUxJREFUSU9OXG4gICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gPT09PT09PT09PSBFTEVDVFJPTiBBUEkgVkFMSURBVElPTiA9PT09PT09PT09Jyk7XG4gICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gd2luZG93LmVsZWN0cm9uQVBJIGV4aXN0czonLCAhIXdpbmRvdy5lbGVjdHJvbkFQSSk7XG4gICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQSSkge1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBlbGVjdHJvbkFQSSBtZXRob2RzOicsIE9iamVjdC5rZXlzKHdpbmRvdy5lbGVjdHJvbkFQSSkpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBleGVjdXRlRGlzY292ZXJ5TW9kdWxlIGV4aXN0czonLCAhIXdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlRGlzY292ZXJ5TW9kdWxlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gZXhlY3V0ZURpc2NvdmVyeU1vZHVsZSB0eXBlOicsIHR5cGVvZiB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeU1vZHVsZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIOKdjCBDUklUSUNBTDogd2luZG93LmVsZWN0cm9uQVBJIGlzIHVuZGVmaW5lZCEnKTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBBY2Nlc3NpbmcgcHJvZmlsZSBzdG9yZS4uLicpO1xuICAgICAgICBjb25zdCBwcm9maWxlID0gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBzZWxlY3RlZFNvdXJjZVByb2ZpbGU6JywgcHJvZmlsZSk7XG4gICAgICAgIHJldHVybiBwcm9maWxlO1xuICAgIH0pO1xuICAgIGNvbnN0IHsgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSwgYWRkUmVzdWx0OiBhZGREaXNjb3ZlcnlSZXN1bHQgfSA9IHVzZURpc2NvdmVyeVN0b3JlKCk7XG4gICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRGlzY292ZXJ5IHN0b3JlIGhvb2tzIG9idGFpbmVkJyk7XG4gICAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc1J1bm5pbmcsIHNldElzUnVubmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsb2dzLCBzZXRMb2dzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2hvd0V4ZWN1dGlvbkRpYWxvZywgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2N1cnJlbnRUb2tlbiwgc2V0Q3VycmVudFRva2VuXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZShERUZBVUxUX0ZJTEVTWVNURU1fQ09ORklHKTtcbiAgICBjb25zdCBbdGVtcGxhdGVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRUZW1wbGF0ZSwgc2V0U2VsZWN0ZWRUZW1wbGF0ZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoJ292ZXJ2aWV3Jyk7XG4gICAgY29uc3QgW3NoYXJlcywgc2V0U2hhcmVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2hhcmVGaWx0ZXIsIHNldFNoYXJlRmlsdGVyXSA9IHVzZVN0YXRlKHt9KTtcbiAgICBjb25zdCBbc2VsZWN0ZWRTaGFyZXMsIHNldFNlbGVjdGVkU2hhcmVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbcGVybWlzc2lvbnMsIHNldFBlcm1pc3Npb25zXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbcGVybWlzc2lvbkZpbHRlciwgc2V0UGVybWlzc2lvbkZpbHRlcl0gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW3NlbGVjdGVkUGVybWlzc2lvbnMsIHNldFNlbGVjdGVkUGVybWlzc2lvbnNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtsYXJnZUZpbGVzLCBzZXRMYXJnZUZpbGVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbbGFyZ2VGaWxlRmlsdGVyLCBzZXRMYXJnZUZpbGVGaWx0ZXJdID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFtzZWxlY3RlZExhcmdlRmlsZXMsIHNldFNlbGVjdGVkTGFyZ2VGaWxlc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtkaXNjb3ZlcnlIaXN0b3J5LCBzZXREaXNjb3ZlcnlIaXN0b3J5XSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdGaWxlU3lzdGVtRGlzY292ZXJ5Jyk7XG4gICAgICAgIGlmIChwcmV2aW91c1Jlc3VsdHMgJiYgcHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFJlc3RvcmluZycsIHByZXZpb3VzUmVzdWx0cy5sZW5ndGgsICdwcmV2aW91cyByZXN1bHRzIGZyb20gc3RvcmUnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdFJlc3VsdCA9IHByZXZpb3VzUmVzdWx0c1twcmV2aW91c1Jlc3VsdHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAvLyBUeXBlIGFzc2VydGlvbiB0aHJvdWdoIHVua25vd24gdG8gYXZvaWQgdHlwZSBlcnJvcnNcbiAgICAgICAgICAgIHNldFJlc3VsdChsYXRlc3RSZXN1bHQucmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH0sIFtnZXRSZXN1bHRzQnlNb2R1bGVOYW1lXSk7XG4gICAgLy8gVXRpbGl0eSBmdW5jdGlvbiB0byBhZGQgbG9nc1xuICAgIGNvbnN0IGFkZExvZyA9IHVzZUNhbGxiYWNrKChtZXNzYWdlLCBsZXZlbCA9ICdpbmZvJykgPT4ge1xuICAgICAgICBjb25zdCBuZXdMb2cgPSB7IHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLCBtZXNzYWdlLCBsZXZlbCB9O1xuICAgICAgICBzZXRMb2dzKChwcmV2TG9ncykgPT4gWy4uLnByZXZMb2dzLCBuZXdMb2ddKTtcbiAgICB9LCBbXSk7XG4gICAgLy8g4pyFIFJFTU9WRUQ6IEV2ZW50LWRyaXZlbiBjb2RlIC0gRmlsZSBTeXN0ZW0gdXNlcyBzeW5jaHJvbm91cyBleGVjdXRlRGlzY292ZXJ5TW9kdWxlXG4gICAgLy8gTm8gZXZlbnQgbGlzdGVuZXJzIG5lZWRlZCBzaW5jZSB3ZSBnZXQgcmVzdWx0cyBkaXJlY3RseSBmcm9tIHRoZSBBUEkgY2FsbFxuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSA9PT09PT09PT09IFNUQVJUIERJU0NPVkVSWSBDQUxMRUQgPT09PT09PT09PScpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBzdGFydERpc2NvdmVyeSBjYWxsYmFjayB0cmlnZ2VyZWQnKTtcbiAgICAgICAgc2V0SXNSdW5uaW5nKHRydWUpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBzZXRJc1J1bm5pbmcodHJ1ZSkgY2FsbGVkJyk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBzZXRFcnJvcihudWxsKSBjYWxsZWQnKTtcbiAgICAgICAgc2V0TG9ncyhbXSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIHNldExvZ3MoW10pIGNhbGxlZCcpO1xuICAgICAgICBzZXRTaG93RXhlY3V0aW9uRGlhbG9nKHRydWUpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBzZXRTaG93RXhlY3V0aW9uRGlhbG9nKHRydWUpIGNhbGxlZCcpO1xuICAgICAgICBjb25zdCBpbml0aWFsUHJvZ3Jlc3MgPSB7XG4gICAgICAgICAgICBwaGFzZTogJ2luaXRpYWxpemluZycsXG4gICAgICAgICAgICBzZXJ2ZXJzQ29tcGxldGVkOiAwLFxuICAgICAgICAgICAgdG90YWxTZXJ2ZXJzOiBjb25maWc/LnNlcnZlcnM/Lmxlbmd0aCB8fCAxLFxuICAgICAgICAgICAgc2hhcmVzQ29tcGxldGVkOiAwLFxuICAgICAgICAgICAgdG90YWxTaGFyZXM6IDAsXG4gICAgICAgICAgICBwZXJjZW50Q29tcGxldGU6IDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGZpbGUgc3lzdGVtIGRpc2NvdmVyeS4uLicsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIEluaXRpYWwgcHJvZ3Jlc3M6JywgaW5pdGlhbFByb2dyZXNzKTtcbiAgICAgICAgc2V0UHJvZ3Jlc3MoaW5pdGlhbFByb2dyZXNzKTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBgZmlsZXN5c3RlbS1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIEdlbmVyYXRlZCB0b2tlbjonLCB0b2tlbik7XG4gICAgICAgIHNldEN1cnJlbnRUb2tlbih0b2tlbik7XG4gICAgICAgIC8vIFVzZSBwcm9maWxlJ3MgY29tcGFueSBuYW1lIChub3QgdGhlIHByb2ZpbGUgbmFtZSBpdHNlbGYpXG4gICAgICAgIGNvbnN0IGNvbXBhbnlOYW1lID0gc2VsZWN0ZWRTb3VyY2VQcm9maWxlPy5jb21wYW55TmFtZSB8fCBzZWxlY3RlZFNvdXJjZVByb2ZpbGU/Lm5hbWUgfHwgJ1Vua25vd24nO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBjb21wYW55TmFtZSBkZXRlcm1pbmVkOicsIGNvbXBhbnlOYW1lKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gc2VsZWN0ZWRTb3VyY2VQcm9maWxlOicsIHNlbGVjdGVkU291cmNlUHJvZmlsZSk7XG4gICAgICAgIGFkZExvZygnU3RhcnRpbmcgRmlsZSBTeXN0ZW0gZGlzY292ZXJ5Li4uJywgJ2luZm8nKTtcbiAgICAgICAgYWRkTG9nKGBDb21wYW55OiAke2NvbXBhbnlOYW1lfWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgU2VydmVycyB0byBzY2FuOiAke2NvbmZpZy5zZXJ2ZXJzPy5sZW5ndGggfHwgMH0gKGxvY2FsaG9zdCBpZiBub25lKWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgSW5jbHVkZSBoaWRkZW4gc2hhcmVzOiAke2NvbmZpZy5pbmNsdWRlSGlkZGVuU2hhcmVzfWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgU2NhbiBwZXJtaXNzaW9uczogJHtjb25maWcuc2NhblBlcm1pc3Npb25zfWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgU2NhbiBsYXJnZSBmaWxlczogJHtjb25maWcuc2NhbkxhcmdlRmlsZXN9YCwgJ2luZm8nKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gQ29uZmlnIHZhbGlkYXRpb246Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gc2VydmVyczonLCBjb25maWcuc2VydmVycyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gaW5jbHVkZUhpZGRlblNoYXJlczonLCBjb25maWcuaW5jbHVkZUhpZGRlblNoYXJlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gc2NhblBlcm1pc3Npb25zOicsIGNvbmZpZy5zY2FuUGVybWlzc2lvbnMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSAtIHNjYW5MYXJnZUZpbGVzOicsIGNvbmZpZy5zY2FuTGFyZ2VGaWxlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gbGFyZ2VGaWxlVGhyZXNob2xkTUI6JywgY29uZmlnLmxhcmdlRmlsZVRocmVzaG9sZE1CKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFByb2dyZXNzKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogJ2luaXRpYWxpemluZycsXG4gICAgICAgICAgICAgICAgcGVyY2VudENvbXBsZXRlOiAxMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGZpbGUgc3lzdGVtIHNjYW4uLi4nLFxuICAgICAgICAgICAgICAgIHNlcnZlcnNDb21wbGV0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxTZXJ2ZXJzOiBjb25maWc/LnNlcnZlcnM/Lmxlbmd0aCB8fCAxLFxuICAgICAgICAgICAgICAgIHNoYXJlc0NvbXBsZXRlZDogMCxcbiAgICAgICAgICAgICAgICB0b3RhbFNoYXJlczogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gUHJvZ3Jlc3MgdXBkYXRlZCB0byAxMCUnKTtcbiAgICAgICAgICAgIGFkZExvZygnSW5pdGlhbGl6aW5nIGZpbGUgc3lzdGVtIHNjYW4uLi4nLCAnaW5mbycpO1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDUwMCkpO1xuICAgICAgICAgICAgc2V0UHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgIHBoYXNlOiAnZGlzY292ZXJpbmdfc2hhcmVzJyxcbiAgICAgICAgICAgICAgICBwZXJjZW50Q29tcGxldGU6IDMwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdTY2FubmluZyBmaWxlIHNoYXJlcy4uLicsXG4gICAgICAgICAgICAgICAgc2VydmVyc0NvbXBsZXRlZDogMCxcbiAgICAgICAgICAgICAgICB0b3RhbFNlcnZlcnM6IGNvbmZpZz8uc2VydmVycz8ubGVuZ3RoIHx8IDEsXG4gICAgICAgICAgICAgICAgc2hhcmVzQ29tcGxldGVkOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU2hhcmVzOiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBQcm9ncmVzcyB1cGRhdGVkIHRvIDMwJScpO1xuICAgICAgICAgICAgYWRkTG9nKCdTY2FubmluZyBmaWxlIHNoYXJlcy4uLicsICdpbmZvJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBHZXR0aW5nIGVsZWN0cm9uQVBJLi4uJyk7XG4gICAgICAgICAgICBjb25zdCBlbGVjdHJvbkFQSSA9IHdpbmRvdy5lbGVjdHJvbkFQSTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIGVsZWN0cm9uQVBJIG9idGFpbmVkOicsICEhZWxlY3Ryb25BUEkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gZWxlY3Ryb25BUEkgdHlwZTonLCB0eXBlb2YgZWxlY3Ryb25BUEkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeSBleGlzdHM6JywgISFlbGVjdHJvbkFQSS5leGVjdXRlRGlzY292ZXJ5KTtcbiAgICAgICAgICAgIC8vIFBSRS1DQUxMIFZBTElEQVRJT05cbiAgICAgICAgICAgIGlmICghZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10g4p2MIENSSVRJQ0FMOiBleGVjdXRlRGlzY292ZXJ5IG1ldGhvZCBub3QgZm91bmQhJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gQXZhaWxhYmxlIGVsZWN0cm9uQVBJIG1ldGhvZHM6JywgT2JqZWN0LmtleXMoZWxlY3Ryb25BUEkgfHwge30pKTtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcignRWxlY3Ryb24gQVBJIGV4ZWN1dGVEaXNjb3ZlcnkgbWV0aG9kIG5vdCBhdmFpbGFibGUnKTtcbiAgICAgICAgICAgICAgICBzZXRJc1J1bm5pbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldFNob3dFeGVjdXRpb25EaWFsb2coZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIOKchSBleGVjdXRlRGlzY292ZXJ5IG1ldGhvZCBmb3VuZCwgcHJvY2VlZGluZy4uLicpO1xuICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdGaWxlU3lzdGVtJyxcbiAgICAgICAgICAgICAgICBjb21wYW55TmFtZTogY29tcGFueU5hbWUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBTZXJ2ZXJzOiBjb25maWcuc2VydmVycyAmJiBjb25maWcuc2VydmVycy5sZW5ndGggPiAwID8gY29uZmlnLnNlcnZlcnMgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlSGlkZGVuU2hhcmVzOiBjb25maWcuaW5jbHVkZUhpZGRlblNoYXJlcyB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUFkbWluaXN0cmF0aXZlU2hhcmVzOiBjb25maWcuaW5jbHVkZUFkbWluaXN0cmF0aXZlU2hhcmVzIHx8IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBTY2FuUGVybWlzc2lvbnM6IGNvbmZpZy5zY2FuUGVybWlzc2lvbnMgIT09IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBTY2FuTGFyZ2VGaWxlczogY29uZmlnLnNjYW5MYXJnZUZpbGVzICE9PSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgTGFyZ2VGaWxlVGhyZXNob2xkTUI6IGNvbmZpZy5sYXJnZUZpbGVUaHJlc2hvbGRNQiB8fCAxMDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBleGVjdXRpb25PcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgc2hvd1dpbmRvdzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIENhbGxpbmcgZXhlY3V0ZURpc2NvdmVyeSB3aXRoOicpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gZGlzY292ZXJ5UGFyYW1zOicsIEpTT04uc3RyaW5naWZ5KGRpc2NvdmVyeVBhcmFtcywgbnVsbCwgMikpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeShkaXNjb3ZlcnlQYXJhbXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10g4pyFIGV4ZWN1dGVEaXNjb3ZlcnlNb2R1bGUgcmV0dXJuZWQnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFJlc3VsdCB0eXBlOicsIHR5cGVvZiByZXN1bHQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gUmVzdWx0IGtleXM6JywgcmVzdWx0ID8gT2JqZWN0LmtleXMocmVzdWx0KSA6ICdOVUxMIFJFU1VMVCcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gUmVzdWx0LnN1Y2Nlc3M6JywgcmVzdWx0Py5zdWNjZXNzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFJlc3VsdC5lcnJvcjonLCByZXN1bHQ/LmVycm9yKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFJlc3VsdC5kYXRhIGV4aXN0czonLCAhIXJlc3VsdD8uZGF0YSk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyh7XG4gICAgICAgICAgICAgICAgcGhhc2U6ICdhbmFseXppbmdfc3RvcmFnZScsXG4gICAgICAgICAgICAgICAgcGVyY2VudENvbXBsZXRlOiA3MCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUHJvY2Vzc2luZyBkaXNjb3ZlcnkgcmVzdWx0cy4uLicsXG4gICAgICAgICAgICAgICAgc2VydmVyc0NvbXBsZXRlZDogY29uZmlnPy5zZXJ2ZXJzPy5sZW5ndGggfHwgMSxcbiAgICAgICAgICAgICAgICB0b3RhbFNlcnZlcnM6IGNvbmZpZz8uc2VydmVycz8ubGVuZ3RoIHx8IDEsXG4gICAgICAgICAgICAgICAgc2hhcmVzQ29tcGxldGVkOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU2hhcmVzOiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhZGRMb2coJ1Byb2Nlc3NpbmcgZGlzY292ZXJ5IHJlc3VsdHMuLi4nLCAnaW5mbycpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gQ2hlY2tpbmcgcmVzdWx0LnN1Y2Nlc3M6JywgcmVzdWx0LnN1Y2Nlc3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10g4pyFIFJlc3VsdCBpbmRpY2F0ZXMgc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIGFkZExvZygnRmlsZSBTeXN0ZW0gZGlzY292ZXJ5IGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIC8vIOKchSBNQVhJTVVNIERFQlVHR0lORzogV3JpdGUgcmF3IHJlc3VsdCB0byBDOlxcdGVtcFxuICAgICAgICAgICAgICAgIGNvbnN0IGRlYnVnUGF0aCA9IGBDOlxcXFx0ZW1wXFxcXGZpbGVzeXN0ZW0tcmVzdWx0LSR7RGF0ZS5ub3coKX0uanNvbmA7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gPT09PT09PT09PSBNQVhJTVVNIERFQlVHIE1PREUgPT09PT09PT09PScpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBXb3VsZCB3cml0ZSBkZWJ1ZyBmaWxlIHRvOicsIGRlYnVnUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFJhdyByZXN1bHQgKGZpcnN0IDIwMDAgY2hhcnMpOicsIEpTT04uc3RyaW5naWZ5KHJlc3VsdCkuc2xpY2UoMCwgMjAwMCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBGdWxsIHJlc3VsdCBzdHJ1Y3R1cmU6JywgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBEZWJ1ZyBsb2dnaW5nIGVycm9yOicsIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IHN0cnVjdHVyZWQgZGF0YSBmcm9tIFBvd2VyU2hlbGwgcmVzdWx0XG4gICAgICAgICAgICAgICAgLy8gUG93ZXJTaGVsbCByZXR1cm5zIG5lc3RlZCBzdHJ1Y3R1cmU6IHJlc3VsdC5yZXN1bHQuZGF0YS5EYXRhID0geyBzaGFyZXM6IFtdLCBwZXJtaXNzaW9uczogW10sIC4uLiB9XG4gICAgICAgICAgICAgICAgLy8gVGhlIGFjdHVhbCBkYXRhIGlzIGF0OiByZXN1bHQucmVzdWx0LmRhdGEuRGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdEFueSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBjb25zdCBwc1dyYXBwZXIgPSByZXN1bHRBbnk/LnJlc3VsdCB8fCByZXN1bHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgcHNEYXRhQ29udGFpbmVyID0gcHNXcmFwcGVyPy5kYXRhIHx8IHBzV3JhcHBlcjtcbiAgICAgICAgICAgICAgICBjb25zdCBwc0RhdGEgPSBwc0RhdGFDb250YWluZXI/LkRhdGEgfHwgcHNEYXRhQ29udGFpbmVyO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdID09PT09PT09PT0gREFUQSBFWFRSQUNUSU9OIERFQlVHID09PT09PT09PT0nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc1dyYXBwZXIga2V5czonLCBPYmplY3Qua2V5cyhwc1dyYXBwZXIgfHwge30pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc0RhdGFDb250YWluZXIga2V5czonLCBPYmplY3Qua2V5cyhwc0RhdGFDb250YWluZXIgfHwge30pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc0RhdGEgdHlwZTonLCB0eXBlb2YgcHNEYXRhKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc0RhdGEgaXMgYXJyYXk6JywgQXJyYXkuaXNBcnJheShwc0RhdGEpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc0RhdGEga2V5czonLCBPYmplY3Qua2V5cyhwc0RhdGEgfHwge30pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Jyk7XG4gICAgICAgICAgICAgICAgLy8gUG93ZXJTaGVsbCByZXR1cm5zIHN0cnVjdHVyZWQgZGF0YSB3aXRoIHByZS1ncm91cGVkIGFycmF5cywgTk9UIGZsYXQgYXJyYXlcbiAgICAgICAgICAgICAgICBsZXQgZ3JvdXBlZDtcbiAgICAgICAgICAgICAgICBpZiAocHNEYXRhICYmIHR5cGVvZiBwc0RhdGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHBzRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGlyZWN0IGV4dHJhY3Rpb24gZnJvbSBQb3dlclNoZWxsIHN0cnVjdHVyZWQgcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFVzaW5nIHN0cnVjdHVyZWQgZGF0YSBleHRyYWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIHBzRGF0YS5zaGFyZXMgZXhpc3RzOicsICEhcHNEYXRhLnNoYXJlcyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIHBzRGF0YS5zaGFyZXMgbGVuZ3RoOicsIHBzRGF0YS5zaGFyZXM/Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIHBzRGF0YS5wZXJtaXNzaW9ucyBsZW5ndGg6JywgcHNEYXRhLnBlcm1pc3Npb25zPy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBwc0RhdGEubGFyZ2VGaWxlcyBsZW5ndGg6JywgcHNEYXRhLmxhcmdlRmlsZXM/Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIHBzRGF0YS5maWxlU2VydmVycyBsZW5ndGg6JywgcHNEYXRhLmZpbGVTZXJ2ZXJzPy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBncm91cGVkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVzOiBBcnJheS5pc0FycmF5KHBzRGF0YS5zaGFyZXMpID8gcHNEYXRhLnNoYXJlcyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IEFycmF5LmlzQXJyYXkocHNEYXRhLnBlcm1pc3Npb25zKSA/IHBzRGF0YS5wZXJtaXNzaW9ucyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyZ2VGaWxlczogQXJyYXkuaXNBcnJheShwc0RhdGEubGFyZ2VGaWxlcykgPyBwc0RhdGEubGFyZ2VGaWxlcyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVNlcnZlcnM6IEFycmF5LmlzQXJyYXkocHNEYXRhLmZpbGVTZXJ2ZXJzKSA/IHBzRGF0YS5maWxlU2VydmVycyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUFuYWx5c2lzOiBBcnJheS5pc0FycmF5KHBzRGF0YS5maWxlQW5hbHlzaXMpID8gcHNEYXRhLmZpbGVBbmFseXNpcyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRmFsbGJhY2sgZm9yIHVuZXhwZWN0ZWQgc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFVzaW5nIGZhbGxiYWNrIGVtcHR5IGFycmF5cycpO1xuICAgICAgICAgICAgICAgICAgICBncm91cGVkID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcmdlRmlsZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVNlcnZlcnM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUFuYWx5c2lzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRmluYWwgZ3JvdXBlZCBjb3VudHM6Jywge1xuICAgICAgICAgICAgICAgICAgICBzaGFyZXM6IGdyb3VwZWQuc2hhcmVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbnM6IGdyb3VwZWQucGVybWlzc2lvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBsYXJnZUZpbGVzOiBncm91cGVkLmxhcmdlRmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBmaWxlU2VydmVyczogZ3JvdXBlZC5maWxlU2VydmVycy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVBbmFseXNpczogZ3JvdXBlZC5maWxlQW5hbHlzaXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIFVzZSBkYXRhIGRpcmVjdGx5IC0gUG93ZXJTaGVsbCBhbHJlYWR5IHByb3ZpZGVzIHN0cnVjdHVyZWQgYXJyYXlzXG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRTaGFyZXMgPSBncm91cGVkLnNoYXJlcztcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFBlcm1pc3Npb25zID0gZ3JvdXBlZC5wZXJtaXNzaW9ucztcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZExhcmdlRmlsZXMgPSBncm91cGVkLmxhcmdlRmlsZXM7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gVHJhbnNmb3JtZWQgY291bnRzOicsIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcmVzOiB0cmFuc2Zvcm1lZFNoYXJlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25zOiB0cmFuc2Zvcm1lZFBlcm1pc3Npb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgbGFyZ2VGaWxlczogdHJhbnNmb3JtZWRMYXJnZUZpbGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBTYW1wbGUgdHJhbnNmb3JtZWQgc2hhcmU6JywgdHJhbnNmb3JtZWRTaGFyZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFNhbXBsZSB0cmFuc2Zvcm1lZCBwZXJtaXNzaW9uOicsIHRyYW5zZm9ybWVkUGVybWlzc2lvbnNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIFNhbXBsZSB0cmFuc2Zvcm1lZCBsYXJnZSBmaWxlOicsIHRyYW5zZm9ybWVkTGFyZ2VGaWxlc1swXSk7XG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBzdGF0aXN0aWNzIGZyb20gUG93ZXJTaGVsbCAobWF5IGJlIGluIHBzRGF0YSBvciBwc1dyYXBwZXIpXG4gICAgICAgICAgICAgICAgY29uc3QgcHNTdGF0cyA9IHBzRGF0YT8uc3RhdGlzdGljcyB8fCBwc1dyYXBwZXI/LnN0YXRpc3RpY3MgfHwge307XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gcHNEYXRhLnN0YXRpc3RpY3M6JywgSlNPTi5zdHJpbmdpZnkocHNEYXRhPy5zdGF0aXN0aWNzKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gcHNXcmFwcGVyLnN0YXRpc3RpY3M6JywgSlNPTi5zdHJpbmdpZnkocHNXcmFwcGVyPy5zdGF0aXN0aWNzKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRmluYWwgcHNTdGF0czonLCBKU09OLnN0cmluZ2lmeShwc1N0YXRzKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxJdGVtcyA9IHRyYW5zZm9ybWVkU2hhcmVzLmxlbmd0aCArIHRyYW5zZm9ybWVkUGVybWlzc2lvbnMubGVuZ3RoICsgdHJhbnNmb3JtZWRMYXJnZUZpbGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBhZGRMb2coYEZvdW5kICR7dG90YWxJdGVtc30gdG90YWwgaXRlbXMgKCR7dHJhbnNmb3JtZWRTaGFyZXMubGVuZ3RofSBzaGFyZXMsICR7dHJhbnNmb3JtZWRQZXJtaXNzaW9ucy5sZW5ndGh9IHBlcm1pc3Npb25zLCAke3RyYW5zZm9ybWVkTGFyZ2VGaWxlcy5sZW5ndGh9IGxhcmdlIGZpbGVzKWAsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCBQb3dlclNoZWxsIHN0YXRpc3RpY3MgKHRvdGFsU2l6ZU1CLCBsYXJnZXN0RmlsZU1CLCBhdmVyYWdlRmlsZVNpemVNQikgdG8gVHlwZVNjcmlwdCBmb3JtYXRcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFNpemVNQiA9IHBzU3RhdHMudG90YWxTaXplTUIgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFNpemVHQiA9IHRvdGFsU2l6ZU1CIC8gMTAyNDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFN0b3JhZ2VCeXRlcyA9IHRvdGFsU2l6ZU1CICogMTAyNCAqIDEwMjQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZlcmFnZUZpbGVTaXplTUIgPSBwc1N0YXRzLmF2ZXJhZ2VGaWxlU2l6ZU1CIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZlcmFnZUZpbGVTaXplQnl0ZXMgPSBhdmVyYWdlRmlsZVNpemVNQiAqIDEwMjQgKiAxMDI0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGF2ZXJhZ2VGaWxlU2l6ZUZvcm1hdHRlZCA9IGF2ZXJhZ2VGaWxlU2l6ZU1CID49IDFcbiAgICAgICAgICAgICAgICAgICAgPyBgJHthdmVyYWdlRmlsZVNpemVNQi50b0ZpeGVkKDIpfSBNQmBcbiAgICAgICAgICAgICAgICAgICAgOiBgJHsoYXZlcmFnZUZpbGVTaXplTUIgKiAxMDI0KS50b0ZpeGVkKDIpfSBLQmA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gU3RhdGlzdGljcyBjb252ZXJzaW9uOicpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gdG90YWxTaXplTUI6JywgdG90YWxTaXplTUIsICfihpInLCB0b3RhbFNpemVHQi50b0ZpeGVkKDIpLCAnR0InKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSAtIGF2ZXJhZ2VGaWxlU2l6ZU1COicsIGF2ZXJhZ2VGaWxlU2l6ZU1CLCAn4oaSJywgYXZlcmFnZUZpbGVTaXplRm9ybWF0dGVkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSAtIHRvdGFsU2hhcmVzOicsIHBzU3RhdHMudG90YWxTaGFyZXMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gdG90YWxQZXJtaXNzaW9uczonLCBwc1N0YXRzLnRvdGFsUGVybWlzc2lvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIC0gaGlnaFJpc2tQZXJtaXNzaW9uczonLCBwc1N0YXRzLmhpZ2hSaXNrUGVybWlzc2lvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZzUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogdG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgICAgICBzaGFyZXM6IHRyYW5zZm9ybWVkU2hhcmVzLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uczogdHJhbnNmb3JtZWRQZXJtaXNzaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgbGFyZ2VGaWxlczogdHJhbnNmb3JtZWRMYXJnZUZpbGVzLFxuICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSYXcgUG93ZXJTaGVsbCB2YWx1ZXMgKGZvciBWaWV3IGNvbXBhdGliaWxpdHkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFNpemVNQjogcHNTdGF0cy50b3RhbFNpemVNQiB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxQZXJtaXNzaW9uczogcHNTdGF0cy50b3RhbFBlcm1pc3Npb25zIHx8IHRyYW5zZm9ybWVkUGVybWlzc2lvbnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaFJpc2tQZXJtaXNzaW9uczogcHNTdGF0cy5oaWdoUmlza1Blcm1pc3Npb25zIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmVyYWdlRmlsZVNpemVNQjogcHNTdGF0cy5hdmVyYWdlRmlsZVNpemVNQiB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydGVkIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTaGFyZXM6IHBzU3RhdHMudG90YWxTaGFyZXMgfHwgdHJhbnNmb3JtZWRTaGFyZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxMYXJnZUZpbGVzOiBwc1N0YXRzLnRvdGFsTGFyZ2VGaWxlcyB8fCB0cmFuc2Zvcm1lZExhcmdlRmlsZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTZXJ2ZXJzU2Nhbm5lZDogcHNTdGF0cy50b3RhbEZpbGVTZXJ2ZXJzIHx8IChjb25maWcuc2VydmVycz8ubGVuZ3RoIHx8IDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxTdG9yYWdlOiB7IGJ5dGVzOiB0b3RhbFN0b3JhZ2VCeXRlcywgZm9ybWF0dGVkOiBgJHt0b3RhbFNpemVHQi50b0ZpeGVkKDIpfSBHQmAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZWRTdG9yYWdlOiB7IGJ5dGVzOiB0b3RhbFN0b3JhZ2VCeXRlcywgZm9ybWF0dGVkOiBgJHt0b3RhbFNpemVHQi50b0ZpeGVkKDIpfSBHQmAsIHBlcmNlbnQ6IDEwMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJlZVN0b3JhZ2U6IHsgYnl0ZXM6IDAsIGZvcm1hdHRlZDogJzAgR0InLCBwZXJjZW50OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJnZXN0U2hhcmU6IHBzU3RhdHMubGFyZ2VzdFNoYXJlIHx8IHsgbmFtZTogJ04vQScsIHNpemVHQjogMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkZXN0RmlsZTogcHNTdGF0cy5vbGRlc3RGaWxlIHx8IHsgbmFtZTogJ04vQScsIGFnZTogMCwgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2ZXJhZ2VGaWxlU2l6ZTogeyBieXRlczogYXZlcmFnZUZpbGVTaXplQnl0ZXMsIGZvcm1hdHRlZDogYXZlcmFnZUZpbGVTaXplRm9ybWF0dGVkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3N0Q29tbW9uRmlsZVR5cGU6IHBzU3RhdHMubW9zdENvbW1vbkZpbGVUeXBlIHx8IHsgZXh0ZW5zaW9uOiAnTi9BJywgY291bnQ6IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cGxpY2F0ZUZpbGVzQ291bnQ6IHBzU3RhdHMuZHVwbGljYXRlRmlsZXNDb3VudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVwbGljYXRlRmlsZXNTaXplOiBwc1N0YXRzLmR1cGxpY2F0ZUZpbGVzU2l6ZSB8fCB7IGJ5dGVzOiAwLCBmb3JtYXR0ZWQ6ICcwIEdCJyB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nczogcmVzdWx0Lndhcm5pbmdzIHx8IFtdLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRmluYWwgZnNSZXN1bHQ6Jywge1xuICAgICAgICAgICAgICAgICAgICBpZDogZnNSZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgIHNoYXJlc0NvdW50OiBmc1Jlc3VsdC5zaGFyZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uc0NvdW50OiBmc1Jlc3VsdC5wZXJtaXNzaW9ucy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGxhcmdlRmlsZXNDb3VudDogZnNSZXN1bHQubGFyZ2VGaWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRpc3RpY3M6IGZzUmVzdWx0LnN0YXRpc3RpY3MsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0KGZzUmVzdWx0KTtcbiAgICAgICAgICAgICAgICBzZXRTaGFyZXMoZnNSZXN1bHQuc2hhcmVzKTtcbiAgICAgICAgICAgICAgICBzZXRQZXJtaXNzaW9ucyhmc1Jlc3VsdC5wZXJtaXNzaW9ucyk7XG4gICAgICAgICAgICAgICAgc2V0TGFyZ2VGaWxlcyhmc1Jlc3VsdC5sYXJnZUZpbGVzKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBTdGF0ZSB1cGRhdGVkIC0gc2hhcmVzOicsIGZzUmVzdWx0LnNoYXJlcy5sZW5ndGgsICdwZXJtaXNzaW9uczonLCBmc1Jlc3VsdC5wZXJtaXNzaW9ucy5sZW5ndGgsICdsYXJnZSBmaWxlczonLCBmc1Jlc3VsdC5sYXJnZUZpbGVzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IGZpbmFsIHByb2dyZXNzXG4gICAgICAgICAgICAgICAgc2V0UHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICAgICAgICBwaGFzZTogJ2ZpbmFsaXppbmcnLFxuICAgICAgICAgICAgICAgICAgICBwZXJjZW50Q29tcGxldGU6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0Rpc2NvdmVyeSBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyc0NvbXBsZXRlZDogY29uZmlnPy5zZXJ2ZXJzPy5sZW5ndGggfHwgMSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTZXJ2ZXJzOiBjb25maWc/LnNlcnZlcnM/Lmxlbmd0aCB8fCAxLFxuICAgICAgICAgICAgICAgICAgICBzaGFyZXNDb21wbGV0ZWQ6IHRyYW5zZm9ybWVkU2hhcmVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxTaGFyZXM6IHRyYW5zZm9ybWVkU2hhcmVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhZGREaXNjb3ZlcnlSZXN1bHQoe1xuICAgICAgICAgICAgICAgICAgICBpZDogZnNSZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdGaWxlU3lzdGVtRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFueU5hbWU6IHNlbGVjdGVkU291cmNlUHJvZmlsZT8uY29tcGFueU5hbWUgfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IGZzUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10g4p2MIFJlc3VsdCBpbmRpY2F0ZXMgRkFJTFVSRScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gcmVzdWx0Py5lcnJvciB8fCAnRGlzY292ZXJ5IGZhaWxlZCB3aXRoIHVua25vd24gZXJyb3InO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRXJyb3IgbWVzc2FnZTonLCBlcnJvck1zZyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBGdWxsIHJlc3VsdCBvYmplY3Q6JywgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKGBEaXNjb3ZlcnkgZmFpbGVkOiAke2Vycm9yTXNnfWAsICdlcnJvcicpO1xuICAgICAgICAgICAgICAgIHNldEVycm9yKGVycm9yTXNnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIENsZWFuaW5nIHVwIGRpc2NvdmVyeSBzdGF0ZS4uLicpO1xuICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldFByb2dyZXNzKG51bGwpO1xuICAgICAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBEaXNjb3Zlcnkgc3RhdGUgY2xlYW5lZCB1cCcpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10g4p2MIENSSVRJQ0FMOiBleGVjdXRlRGlzY292ZXJ5TW9kdWxlIHRocmV3IGV4Y2VwdGlvbicpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBFeGNlcHRpb246JywgZXJyKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tGaWxlU3lzdGVtRGlzY292ZXJ5SG9va10gRXhjZXB0aW9uIHR5cGU6JywgdHlwZW9mIGVycik7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIEV4Y2VwdGlvbiBtZXNzYWdlOicsIGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIEV4Y2VwdGlvbiBzdGFjazonLCBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5zdGFjayA6ICdObyBzdGFjaycpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIGFkZExvZyhgRXJyb3I6ICR7ZXJyb3JNZXNzYWdlfWAsICdlcnJvcicpO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHNldFByb2dyZXNzKG51bGwpO1xuICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldFNob3dFeGVjdXRpb25EaWFsb2coZmFsc2UpO1xuICAgICAgICAgICAgc2V0Q3VycmVudFRva2VuKG51bGwpO1xuICAgICAgICB9XG4gICAgfSwgW2NvbmZpZywgc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBhZGRMb2csIGFkZERpc2NvdmVyeVJlc3VsdF0pO1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFpc1J1bm5pbmcgfHwgIWN1cnJlbnRUb2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGFkZExvZygnQ2FuY2VsbGluZyBGaWxlIFN5c3RlbSBkaXNjb3ZlcnkuLi4nLCAnd2FybmluZycpO1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uLmNhbmNlbERpc2NvdmVyeShjdXJyZW50VG9rZW4pO1xuICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldFByb2dyZXNzKG51bGwpO1xuICAgICAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICBhZGRMb2coJ0ZpbGUgU3lzdGVtIGRpc2NvdmVyeSBjYW5jZWxsZWQnLCAnd2FybmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycik7XG4gICAgICAgICAgICBhZGRMb2coYEZhaWxlZCB0byBjYW5jZWw6ICR7ZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ31gLCAnZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH0sIFtpc1J1bm5pbmcsIGN1cnJlbnRUb2tlbiwgYWRkTG9nXSk7XG4gICAgY29uc3QgZXhwb3J0UmVzdWx0cyA9IHVzZUNhbGxiYWNrKGFzeW5jIChmb3JtYXQpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbGVjdHJvbkFQSSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgICAgICBhd2FpdCBlbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKCdGaWxlU3lzdGVtRXhwb3J0Jywge1xuICAgICAgICAgICAgICAgIFJlc3VsdDogcmVzdWx0LFxuICAgICAgICAgICAgICAgIEZvcm1hdDogZm9ybWF0LFxuICAgICAgICAgICAgICAgIEluY2x1ZGVTaGFyZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgSW5jbHVkZVBlcm1pc3Npb25zOiB0cnVlLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVMYXJnZUZpbGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVTdGF0aXN0aWNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVTZWN1cml0eVJpc2tzOiB0cnVlLFxuICAgICAgICAgICAgICAgIE91dHB1dFBhdGg6ICdDOlxcXFxkaXNjb3ZlcnlkYXRhXFxcXGRlZmF1bHRcXFxcUmF3JyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZXN1bHRdKTtcbiAgICBjb25zdCBzZWxlY3RUZW1wbGF0ZSA9IHVzZUNhbGxiYWNrKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgc2V0Q29uZmlnKHRlbXBsYXRlLmNvbmZpZyk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGxvYWRIaXN0b3J5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZWxlY3Ryb25BUEkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeVJlc3VsdCA9IGF3YWl0IGVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoJ0ZpbGVTeXN0ZW1IaXN0b3J5Jywge30pO1xuICAgICAgICAgICAgaWYgKGhpc3RvcnlSZXN1bHQ/LnN1Y2Nlc3MgJiYgaGlzdG9yeVJlc3VsdD8uZGF0YT8uaGlzdG9yeSkge1xuICAgICAgICAgICAgICAgIHNldERpc2NvdmVyeUhpc3RvcnkoaGlzdG9yeVJlc3VsdC5kYXRhLmhpc3RvcnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGhpc3Rvcnk6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICBjb25zdCBsb2FkSGlzdG9yeUl0ZW0gPSB1c2VDYWxsYmFjayhhc3luYyAoaWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnlSZXN1bHQgPSBhd2FpdCBlbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKCdGaWxlU3lzdGVtSGlzdG9yeUl0ZW0nLCB7IElkOiBpZCB9KTtcbiAgICAgICAgICAgIGlmIChoaXN0b3J5UmVzdWx0Py5zdWNjZXNzICYmIGhpc3RvcnlSZXN1bHQ/LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlZFJlc3VsdCA9IGhpc3RvcnlSZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICBzZXRSZXN1bHQodHlwZWRSZXN1bHQpO1xuICAgICAgICAgICAgICAgIHNldFNoYXJlcyh0eXBlZFJlc3VsdC5zaGFyZXMgfHwgW10pO1xuICAgICAgICAgICAgICAgIHNldFBlcm1pc3Npb25zKHR5cGVkUmVzdWx0LnBlcm1pc3Npb25zIHx8IFtdKTtcbiAgICAgICAgICAgICAgICBzZXRMYXJnZUZpbGVzKHR5cGVkUmVzdWx0LmxhcmdlRmlsZXMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGhpc3RvcnkgaXRlbTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGZpbHRlcmVkU2hhcmVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbRmlsZVN5c3RlbURpc2NvdmVyeUhvb2tdIENvbXB1dGluZyBmaWx0ZXJlZFNoYXJlcyBmcm9tIHNoYXJlczonLCBzaGFyZXM/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgbGV0IGZpbHRlcmVkID0gc2hhcmVzO1xuICAgICAgICBpZiAoc2hhcmVGaWx0ZXIudHlwZT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihzID0+IHNoYXJlRmlsdGVyLnR5cGUuaW5jbHVkZXMocy50eXBlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoYXJlRmlsdGVyLm1pblNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIocyA9PiBzLnNpemUudG90YWxCeXRlcyA+PSBzaGFyZUZpbHRlci5taW5TaXplICogMTAyNCAqIDEwMjQgKiAxMDI0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hhcmVGaWx0ZXIubWF4U2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihzID0+IHMuc2l6ZS50b3RhbEJ5dGVzIDw9IHNoYXJlRmlsdGVyLm1heFNpemUgKiAxMDI0ICogMTAyNCAqIDEwMjQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaGFyZUZpbHRlci5oYXNRdW90YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihzID0+IHMucXVvdGFFbmFibGVkID09PSBzaGFyZUZpbHRlci5oYXNRdW90YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNoYXJlRmlsdGVyLmhhc0VuY3J5cHRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIocyA9PiBzLmVuY3J5cHRpb25FbmFibGVkID09PSBzaGFyZUZpbHRlci5oYXNFbmNyeXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2hhcmVGaWx0ZXIuc2VydmVyKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihzID0+IHMuc2VydmVyID09PSBzaGFyZUZpbHRlci5zZXJ2ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaGFyZUZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBzaGFyZUZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihzID0+IChzLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChzLnBhdGggPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIHMuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKHMgPT4gKHMubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKHMucGF0aCA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnW0ZpbGVTeXN0ZW1EaXNjb3ZlcnlIb29rXSBmaWx0ZXJlZFNoYXJlcyByZXN1bHQ6JywgZmlsdGVyZWQ/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sIFtzaGFyZXMsIHNoYXJlRmlsdGVyLCBzZWFyY2hUZXh0XSk7XG4gICAgY29uc3QgZmlsdGVyZWRQZXJtaXNzaW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBsZXQgZmlsdGVyZWQgPSBwZXJtaXNzaW9ucztcbiAgICAgICAgaWYgKHBlcm1pc3Npb25GaWx0ZXIuYWNjZXNzVHlwZT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihwID0+IHBlcm1pc3Npb25GaWx0ZXIuYWNjZXNzVHlwZS5pbmNsdWRlcyhwLmFjY2Vzc1R5cGUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGVybWlzc2lvbkZpbHRlci5wcmluY2lwYWxUeXBlPy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKHAgPT4gcGVybWlzc2lvbkZpbHRlci5wcmluY2lwYWxUeXBlLmluY2x1ZGVzKHAucHJpbmNpcGFsLnR5cGUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGVybWlzc2lvbkZpbHRlci5zaGFyZSkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIocCA9PiBwLnNoYXJlTmFtZSA9PT0gcGVybWlzc2lvbkZpbHRlci5zaGFyZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBlcm1pc3Npb25GaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gcGVybWlzc2lvbkZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihwID0+IChwLnByaW5jaXBhbD8ubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKHAuc2hhcmVOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihwID0+IChwLnByaW5jaXBhbD8ubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKHAuc2hhcmVOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICB9LCBbcGVybWlzc2lvbnMsIHBlcm1pc3Npb25GaWx0ZXIsIHNlYXJjaFRleHRdKTtcbiAgICBjb25zdCBmaWx0ZXJlZExhcmdlRmlsZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IGZpbHRlcmVkID0gbGFyZ2VGaWxlcztcbiAgICAgICAgaWYgKGxhcmdlRmlsZUZpbHRlci5taW5TaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKGYgPT4gZi5zaXplQnl0ZXMgPj0gbGFyZ2VGaWxlRmlsdGVyLm1pblNpemUgKiAxMDI0ICogMTAyNCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhcmdlRmlsZUZpbHRlci5leHRlbnNpb24/Lmxlbmd0aCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiBsYXJnZUZpbGVGaWx0ZXIuZXh0ZW5zaW9uLmluY2x1ZGVzKGYuZXh0ZW5zaW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhcmdlRmlsZUZpbHRlci5zaGFyZSkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiBmLnNoYXJlID09PSBsYXJnZUZpbGVGaWx0ZXIuc2hhcmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXJnZUZpbGVGaWx0ZXIuaXNFbmNyeXB0ZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiBmLmlzRW5jcnlwdGVkID09PSBsYXJnZUZpbGVGaWx0ZXIuaXNFbmNyeXB0ZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsYXJnZUZpbGVGaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gbGFyZ2VGaWxlRmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKGYgPT4gKGYubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKGYucGF0aCA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiAoZi5uYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAoZi5wYXRoID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICB9LCBbbGFyZ2VGaWxlcywgbGFyZ2VGaWxlRmlsdGVyLCBzZWFyY2hUZXh0XSk7XG4gICAgY29uc3Qgc2hhcmVDb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICdOYW1lJywgaGVhZGVyTmFtZTogJ1NoYXJlIE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBwaW5uZWQ6ICdsZWZ0Jywgd2lkdGg6IDIwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnUGF0aCcsIGhlYWRlck5hbWU6ICdQYXRoJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnU2VydmVyJywgaGVhZGVyTmFtZTogJ1NlcnZlcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdTaXplR0InLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RvdGFsIFNpemUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSAhPT0gdW5kZWZpbmVkID8gYCR7cGFyYW1zLnZhbHVlLnRvRml4ZWQoMil9IEdCYCA6ICdOL0EnLFxuICAgICAgICB9LFxuICAgICAgICB7IGZpZWxkOiAnRmlsZUNvdW50JywgaGVhZGVyTmFtZTogJ0ZpbGVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJywgd2lkdGg6IDEwMCB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBwZXJtaXNzaW9uQ29sdW1uRGVmcyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnU2hhcmVOYW1lJywgaGVhZGVyTmFtZTogJ1NoYXJlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgcGlubmVkOiAnbGVmdCcsIHdpZHRoOiAyMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ0lkZW50aXR5UmVmZXJlbmNlJywgaGVhZGVyTmFtZTogJ1ByaW5jaXBhbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ0ZpbGVTeXN0ZW1SaWdodHMnLCBoZWFkZXJOYW1lOiAnUmlnaHRzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnQWNjZXNzQ29udHJvbFR5cGUnLCBoZWFkZXJOYW1lOiAnQWNjZXNzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEwMCB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBsYXJnZUZpbGVDb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICdOYW1lJywgaGVhZGVyTmFtZTogJ0ZpbGUgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHBpbm5lZDogJ2xlZnQnLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdQYXRoJywgaGVhZGVyTmFtZTogJ1BhdGgnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMzUwIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnU2l6ZU1CJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTaXplJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgIT09IHVuZGVmaW5lZCA/IGAke3BhcmFtcy52YWx1ZS50b0xvY2FsZVN0cmluZygpfSBNQmAgOiAnTi9BJyxcbiAgICAgICAgfSxcbiAgICAgICAgeyBmaWVsZDogJ1NoYXJlTmFtZScsIGhlYWRlck5hbWU6ICdTaGFyZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyMDAgfSxcbiAgICBdLCBbXSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEhpc3RvcnkoKTtcbiAgICB9LCBbbG9hZEhpc3RvcnldKTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQsXG4gICAgICAgIGN1cnJlbnRSZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgaXNSdW5uaW5nLFxuICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgc2V0Q29uZmlnLFxuICAgICAgICB0ZW1wbGF0ZXMsXG4gICAgICAgIHNlbGVjdGVkVGVtcGxhdGUsXG4gICAgICAgIHNlbGVjdFRlbXBsYXRlLFxuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICBleHBvcnRSZXN1bHRzLFxuICAgICAgICBhY3RpdmVUYWIsXG4gICAgICAgIHNldEFjdGl2ZVRhYixcbiAgICAgICAgc2hhcmVzLFxuICAgICAgICBzaGFyZUZpbHRlcixcbiAgICAgICAgc2V0U2hhcmVGaWx0ZXIsXG4gICAgICAgIGZpbHRlcmVkU2hhcmVzLFxuICAgICAgICBzaGFyZUNvbHVtbkRlZnMsXG4gICAgICAgIHNlbGVjdGVkU2hhcmVzLFxuICAgICAgICBzZXRTZWxlY3RlZFNoYXJlcyxcbiAgICAgICAgcGVybWlzc2lvbnMsXG4gICAgICAgIHBlcm1pc3Npb25GaWx0ZXIsXG4gICAgICAgIHNldFBlcm1pc3Npb25GaWx0ZXIsXG4gICAgICAgIGZpbHRlcmVkUGVybWlzc2lvbnMsXG4gICAgICAgIHBlcm1pc3Npb25Db2x1bW5EZWZzLFxuICAgICAgICBzZWxlY3RlZFBlcm1pc3Npb25zLFxuICAgICAgICBzZXRTZWxlY3RlZFBlcm1pc3Npb25zLFxuICAgICAgICBsYXJnZUZpbGVzLFxuICAgICAgICBsYXJnZUZpbGVGaWx0ZXIsXG4gICAgICAgIHNldExhcmdlRmlsZUZpbHRlcixcbiAgICAgICAgZmlsdGVyZWRMYXJnZUZpbGVzLFxuICAgICAgICBsYXJnZUZpbGVDb2x1bW5EZWZzLFxuICAgICAgICBzZWxlY3RlZExhcmdlRmlsZXMsXG4gICAgICAgIHNldFNlbGVjdGVkTGFyZ2VGaWxlcyxcbiAgICAgICAgc2VhcmNoVGV4dCxcbiAgICAgICAgc2V0U2VhcmNoVGV4dCxcbiAgICAgICAgZGlzY292ZXJ5SGlzdG9yeSxcbiAgICAgICAgbG9hZEhpc3RvcnksXG4gICAgICAgIGxvYWRIaXN0b3J5SXRlbSxcbiAgICAgICAgbG9ncyxcbiAgICAgICAgc2hvd0V4ZWN1dGlvbkRpYWxvZyxcbiAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyxcbiAgICB9O1xufTtcbmZ1bmN0aW9uIGZvcm1hdEJ5dGVzKGJ5dGVzKSB7XG4gICAgaWYgKGJ5dGVzID09PSAwKVxuICAgICAgICByZXR1cm4gJzAgQic7XG4gICAgY29uc3QgayA9IDEwMjQ7XG4gICAgY29uc3Qgc2l6ZXMgPSBbJ0InLCAnS0InLCAnTUInLCAnR0InLCAnVEInXTtcbiAgICBjb25zdCBpID0gTWF0aC5mbG9vcihNYXRoLmxvZyhieXRlcykgLyBNYXRoLmxvZyhrKSk7XG4gICAgcmV0dXJuIGAkeyhieXRlcyAvIE1hdGgucG93KGssIGkpKS50b0ZpeGVkKDIpfSAke3NpemVzW2ldfWA7XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqXG4gKiBQcm9ncmVzcyBpbmRpY2F0b3Igd2l0aCBwZXJjZW50YWdlIGRpc3BsYXkgYW5kIG9wdGlvbmFsIGxhYmVsLlxuICogU3VwcG9ydHMgZGlmZmVyZW50IHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9ICh7IHZhbHVlLCBtYXggPSAxMDAsIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBzaG93TGFiZWwgPSB0cnVlLCBsYWJlbCwgbGFiZWxQb3NpdGlvbiA9ICdpbnNpZGUnLCBzdHJpcGVkID0gZmFsc2UsIGFuaW1hdGVkID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBDYWxjdWxhdGUgcGVyY2VudGFnZVxuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsICh2YWx1ZSAvIG1heCkgKiAxMDApKTtcbiAgICAvLyBWYXJpYW50IGNvbG9yc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS02MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy02MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNjAwJyxcbiAgICB9O1xuICAgIC8vIEJhY2tncm91bmQgY29sb3JzXG4gICAgY29uc3QgYmdDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS0xMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtMicsXG4gICAgICAgIG1kOiAnaC00JyxcbiAgICAgICAgbGc6ICdoLTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCcsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgdHJhY2tDbGFzc2VzID0gY2xzeCgndy1mdWxsIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW4nLCBiZ0NsYXNzZXNbdmFyaWFudF0sIHNpemVDbGFzc2VzW3NpemVdKTtcbiAgICBjb25zdCBiYXJDbGFzc2VzID0gY2xzeCgnaC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCcsIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCB7XG4gICAgICAgIC8vIFN0cmlwZWQgcGF0dGVyblxuICAgICAgICAnYmctZ3JhZGllbnQtdG8tciBmcm9tLXRyYW5zcGFyZW50IHZpYS1ibGFjay8xMCB0by10cmFuc3BhcmVudCBiZy1bbGVuZ3RoOjFyZW1fMTAwJV0nOiBzdHJpcGVkLFxuICAgICAgICAnYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzJzogc3RyaXBlZCAmJiBhbmltYXRlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbFRleHQgPSBsYWJlbCB8fCAoc2hvd0xhYmVsID8gYCR7TWF0aC5yb3VuZChwZXJjZW50YWdlKX0lYCA6ICcnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2xhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnb3V0c2lkZScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTFcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogdHJhY2tDbGFzc2VzLCByb2xlOiBcInByb2dyZXNzYmFyXCIsIFwiYXJpYS12YWx1ZW5vd1wiOiB2YWx1ZSwgXCJhcmlhLXZhbHVlbWluXCI6IDAsIFwiYXJpYS12YWx1ZW1heFwiOiBtYXgsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBiYXJDbGFzc2VzLCBzdHlsZTogeyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9LCBjaGlsZHJlbjogbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdpbnNpZGUnICYmIHNpemUgIT09ICdzbScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIHB4LTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXdoaXRlIHdoaXRlc3BhY2Utbm93cmFwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpIH0pIH0pXSB9KSk7XG59O1xuLy8gQWRkIGFuaW1hdGlvbiBmb3Igc3RyaXBlZCBwcm9ncmVzcyBiYXJzXG5jb25zdCBzdHlsZXMgPSBgXHJcbkBrZXlmcmFtZXMgcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgZnJvbSB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxcmVtIDA7XHJcbiAgfVxyXG4gIHRvIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcclxuICB9XHJcbn1cclxuXHJcbi5hbmltYXRlLXByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGFuaW1hdGlvbjogcHJvZ3Jlc3Mtc3RyaXBlcyAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbn1cclxuYDtcbi8vIEluamVjdCBzdHlsZXNcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3MtYmFyLXN0eWxlcycpKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGVTaGVldC5pZCA9ICdwcm9ncmVzcy1iYXItc3R5bGVzJztcbiAgICBzdHlsZVNoZWV0LnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG59XG5leHBvcnQgZGVmYXVsdCBQcm9ncmVzc0JhcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogRmlsZSBTeXN0ZW0gRGlzY292ZXJ5IENvbmZpZ3VyYXRpb24gRGlhbG9nXG4gKiBNb2RhbCBkaWFsb2cgZm9yIGNvbmZpZ3VyaW5nIGZpbGUgc3lzdGVtIGRpc2NvdmVyeSBwYXJhbWV0ZXJzXG4gKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFgsIFNlcnZlciwgUGx1cywgVHJhc2gyLCBBbGVydENpcmNsZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vYXRvbXMvQ2hlY2tib3gnO1xuZXhwb3J0IGNvbnN0IEZpbGVTeXN0ZW1Db25maWdEaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIGNvbmZpZywgb25TYXZlLCB9KSA9PiB7XG4gICAgY29uc3QgW2xvY2FsQ29uZmlnLCBzZXRMb2NhbENvbmZpZ10gPSBSZWFjdC51c2VTdGF0ZShjb25maWcpO1xuICAgIGNvbnN0IFtuZXdTZXJ2ZXIsIHNldE5ld1NlcnZlcl0gPSBSZWFjdC51c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW2Vycm9ycywgc2V0RXJyb3JzXSA9IFJlYWN0LnVzZVN0YXRlKFtdKTtcbiAgICAvLyBVcGRhdGUgbG9jYWwgY29uZmlnIHdoZW4gcHJvcCBjaGFuZ2VzXG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0TG9jYWxDb25maWcoY29uZmlnKTtcbiAgICB9LCBbY29uZmlnXSk7XG4gICAgY29uc3QgaGFuZGxlQWRkU2VydmVyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIW5ld1NlcnZlci50cmltKCkpIHtcbiAgICAgICAgICAgIHNldEVycm9ycyhbJ1NlcnZlciBuYW1lIGNhbm5vdCBiZSBlbXB0eSddKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBWYWxpZGF0ZSBzZXJ2ZXIgZm9ybWF0IChiYXNpYyBjaGVjaylcbiAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IG5ld1NlcnZlci50cmltKCk7XG4gICAgICAgIGlmIChsb2NhbENvbmZpZy5zZXJ2ZXJzLmluY2x1ZGVzKHNlcnZlck5hbWUpKSB7XG4gICAgICAgICAgICBzZXRFcnJvcnMoW2BTZXJ2ZXIgXCIke3NlcnZlck5hbWV9XCIgaXMgYWxyZWFkeSBpbiB0aGUgbGlzdGBdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXRMb2NhbENvbmZpZyh7XG4gICAgICAgICAgICAuLi5sb2NhbENvbmZpZyxcbiAgICAgICAgICAgIHNlcnZlcnM6IFsuLi5sb2NhbENvbmZpZy5zZXJ2ZXJzLCBzZXJ2ZXJOYW1lXSxcbiAgICAgICAgfSk7XG4gICAgICAgIHNldE5ld1NlcnZlcignJyk7XG4gICAgICAgIHNldEVycm9ycyhbXSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVSZW1vdmVTZXJ2ZXIgPSAoaW5kZXgpID0+IHtcbiAgICAgICAgc2V0TG9jYWxDb25maWcoe1xuICAgICAgICAgICAgLi4ubG9jYWxDb25maWcsXG4gICAgICAgICAgICBzZXJ2ZXJzOiBsb2NhbENvbmZpZy5zZXJ2ZXJzLmZpbHRlcigoXywgaSkgPT4gaSAhPT0gaW5kZXgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVNhdmUgPSAoKSA9PiB7XG4gICAgICAgIC8vIFZhbGlkYXRlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgY29uc3QgdmFsaWRhdGlvbkVycm9ycyA9IFtdO1xuICAgICAgICBpZiAobG9jYWxDb25maWcuc2VydmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMucHVzaCgnQXQgbGVhc3Qgb25lIHNlcnZlciBtdXN0IGJlIGNvbmZpZ3VyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9jYWxDb25maWcubGFyZ2VGaWxlVGhyZXNob2xkTUIgPCAxKSB7XG4gICAgICAgICAgICB2YWxpZGF0aW9uRXJyb3JzLnB1c2goJ0xhcmdlIGZpbGUgdGhyZXNob2xkIG11c3QgYmUgYXQgbGVhc3QgMSBNQicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhbENvbmZpZy5tYXhEZXB0aCA8IDEpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMucHVzaCgnTWF4IGRlcHRoIG11c3QgYmUgYXQgbGVhc3QgMScpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhbENvbmZpZy50aW1lb3V0IDwgNjApIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMucHVzaCgnVGltZW91dCBtdXN0IGJlIGF0IGxlYXN0IDYwIHNlY29uZHMnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZXRFcnJvcnModmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb25TYXZlKGxvY2FsQ29uZmlnKTtcbiAgICAgICAgc2V0RXJyb3JzKFtdKTtcbiAgICAgICAgb25DbG9zZSgpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICBzZXRMb2NhbENvbmZpZyhjb25maWcpO1xuICAgICAgICBzZXRFcnJvcnMoW10pO1xuICAgICAgICBzZXROZXdTZXJ2ZXIoJycpO1xuICAgICAgICBvbkNsb3NlKCk7XG4gICAgfTtcbiAgICBpZiAoIWlzT3BlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1ibGFjayBiZy1vcGFjaXR5LTUwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LXhsIG1heC13LTJ4bCB3LWZ1bGwgbWF4LWgtWzkwdmhdIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkZpbGUgU3lzdGVtIERpc2NvdmVyeSBDb25maWd1cmF0aW9uXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBoYW5kbGVDYW5jZWwsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBvdmVyZmxvdy15LWF1dG8gbWF4LWgtW2NhbGMoOTB2aC0xODBweCldXCIsIGNoaWxkcmVuOiBbZXJyb3JzLmxlbmd0aCA+IDAgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNCBwLTMgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgZmxleC1zaHJpbmstMCBtdC0wLjVcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LXJlZC05MDAgZGFyazp0ZXh0LXJlZC0xMDAgbWItMVwiLCBjaGlsZHJlbjogXCJDb25maWd1cmF0aW9uIEVycm9yc1wiIH0pLCBfanN4KFwidWxcIiwgeyBjbGFzc05hbWU6IFwibGlzdC1kaXNjIGxpc3QtaW5zaWRlIHRleHQtc20gdGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtMzAwIHNwYWNlLXktMVwiLCBjaGlsZHJlbjogZXJyb3JzLm1hcCgoZXJyb3IsIGluZGV4KSA9PiAoX2pzeChcImxpXCIsIHsgY2hpbGRyZW46IGVycm9yIH0sIGluZGV4KSkpIH0pXSB9KV0gfSkgfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYi02XCIsIGNoaWxkcmVuOiBbX2pzeChcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgbWItMlwiLCBjaGlsZHJlbjogXCJGaWxlIFNlcnZlcnNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi0zXCIsIGNoaWxkcmVuOiBcIkFkZCBzZXJ2ZXIgbmFtZXMgb3IgSVAgYWRkcmVzc2VzIHRvIHNjYW4uIFN1cHBvcnRzIFVOQyBwYXRocyAoZS5nLiwgXFxcXFxcXFxTRVJWRVIwMSkgb3IgRlFETiAoZS5nLiwgZmlsZXNlcnZlci5kb21haW4uY29tKVwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChJbnB1dCwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IG5ld1NlcnZlciwgb25DaGFuZ2U6IChlKSA9PiBzZXROZXdTZXJ2ZXIoZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJcXFxcXFxcXFNFUlZFUjAxIG9yIGZpbGVzZXJ2ZXIuZG9tYWluLmNvbVwiLCBvbktleVByZXNzOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVBZGRTZXJ2ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChQbHVzLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGhhbmRsZUFkZFNlcnZlciwgY2hpbGRyZW46IFwiQWRkXCIgfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogbG9jYWxDb25maWcuc2VydmVycy5sZW5ndGggPT09IDAgPyAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgcHktNCBweC0zIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTcwMC81MCByb3VuZGVkLWxnIGJvcmRlci0yIGJvcmRlci1kYXNoZWQgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwXCIsIGNoaWxkcmVuOiBbX2pzeChTZXJ2ZXIsIHsgY2xhc3NOYW1lOiBcInctOCBoLTggbXgtYXV0byB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTUwMCBtYi0yXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTm8gc2VydmVycyBjb25maWd1cmVkLiBBZGQgYXQgbGVhc3Qgb25lIHNlcnZlciB0byBiZWdpbiBkaXNjb3ZlcnkuXCIgfSldIH0pKSA6IChsb2NhbENvbmZpZy5zZXJ2ZXJzLm1hcCgoc2VydmVyLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktNzAwLzUwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goU2VydmVyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtYW1iZXItNjAwIGRhcms6dGV4dC1hbWJlci00MDBcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogc2VydmVyIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IGhhbmRsZVJlbW92ZVNlcnZlcihpbmRleCksIGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgaG92ZXI6dGV4dC1yZWQtNzAwIGRhcms6aG92ZXI6dGV4dC1yZWQtMzAwXCIsIGNoaWxkcmVuOiBfanN4KFRyYXNoMiwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pIH0pXSB9LCBpbmRleCkpKSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYi02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgbWItM1wiLCBjaGlsZHJlbjogXCJTY2FuIE9wdGlvbnNcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0zXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJJbmNsdWRlIEhpZGRlbiBTaGFyZXNcIiwgY2hlY2tlZDogbG9jYWxDb25maWcuaW5jbHVkZUhpZGRlblNoYXJlcywgb25DaGFuZ2U6IChjaGVja2VkKSA9PiBzZXRMb2NhbENvbmZpZyh7IC4uLmxvY2FsQ29uZmlnLCBpbmNsdWRlSGlkZGVuU2hhcmVzOiBjaGVja2VkIH0pIH0pLCBfanN4KENoZWNrYm94LCB7IGxhYmVsOiBcIkluY2x1ZGUgQWRtaW5pc3RyYXRpdmUgU2hhcmVzIChDJCwgQURNSU4kLCBldGMuKVwiLCBjaGVja2VkOiBsb2NhbENvbmZpZy5pbmNsdWRlQWRtaW5pc3RyYXRpdmVTaGFyZXMsIG9uQ2hhbmdlOiAoY2hlY2tlZCkgPT4gc2V0TG9jYWxDb25maWcoeyAuLi5sb2NhbENvbmZpZywgaW5jbHVkZUFkbWluaXN0cmF0aXZlU2hhcmVzOiBjaGVja2VkIH0pIH0pLCBfanN4KENoZWNrYm94LCB7IGxhYmVsOiBcIlNjYW4gUGVybWlzc2lvbnNcIiwgY2hlY2tlZDogbG9jYWxDb25maWcuc2NhblBlcm1pc3Npb25zLCBvbkNoYW5nZTogKGNoZWNrZWQpID0+IHNldExvY2FsQ29uZmlnKHsgLi4ubG9jYWxDb25maWcsIHNjYW5QZXJtaXNzaW9uczogY2hlY2tlZCB9KSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJTY2FuIGZvciBMYXJnZSBGaWxlc1wiLCBjaGVja2VkOiBsb2NhbENvbmZpZy5zY2FuTGFyZ2VGaWxlcywgb25DaGFuZ2U6IChjaGVja2VkKSA9PiBzZXRMb2NhbENvbmZpZyh7IC4uLmxvY2FsQ29uZmlnLCBzY2FuTGFyZ2VGaWxlczogY2hlY2tlZCB9KSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJBbmFseXplIFN0b3JhZ2UgU3RhdGlzdGljc1wiLCBjaGVja2VkOiBsb2NhbENvbmZpZy5hbmFseXplU3RvcmFnZSwgb25DaGFuZ2U6IChjaGVja2VkKSA9PiBzZXRMb2NhbENvbmZpZyh7IC4uLmxvY2FsQ29uZmlnLCBhbmFseXplU3RvcmFnZTogY2hlY2tlZCB9KSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJEZXRlY3QgU2VjdXJpdHkgUmlza3NcIiwgY2hlY2tlZDogbG9jYWxDb25maWcuZGV0ZWN0U2VjdXJpdHlSaXNrcywgb25DaGFuZ2U6IChjaGVja2VkKSA9PiBzZXRMb2NhbENvbmZpZyh7IC4uLmxvY2FsQ29uZmlnLCBkZXRlY3RTZWN1cml0eVJpc2tzOiBjaGVja2VkIH0pIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBtYi0zXCIsIGNoaWxkcmVuOiBcIkFkdmFuY2VkIE9wdGlvbnNcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiTGFyZ2UgRmlsZSBUaHJlc2hvbGQgKE1CKVwiLCB0eXBlOiBcIm51bWJlclwiLCB2YWx1ZTogbG9jYWxDb25maWcubGFyZ2VGaWxlVGhyZXNob2xkTUIudG9TdHJpbmcoKSwgb25DaGFuZ2U6IChlKSA9PiBzZXRMb2NhbENvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sb2NhbENvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhcmdlRmlsZVRocmVzaG9sZE1COiBwYXJzZUludChlLnRhcmdldC52YWx1ZSkgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgbWluOiAxLCBtYXg6IDEwMDAwIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIk1heCBTY2FuIERlcHRoXCIsIHR5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiBsb2NhbENvbmZpZy5tYXhEZXB0aC50b1N0cmluZygpLCBvbkNoYW5nZTogKGUpID0+IHNldExvY2FsQ29uZmlnKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmxvY2FsQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGVwdGg6IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgbWluOiAxLCBtYXg6IDIwLCBoZWxwZXJUZXh0OiBcIk1heGltdW0gZGlyZWN0b3J5IGRlcHRoIHRvIHNjYW5cIiB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJUaW1lb3V0IChzZWNvbmRzKVwiLCB0eXBlOiBcIm51bWJlclwiLCB2YWx1ZTogbG9jYWxDb25maWcudGltZW91dC50b1N0cmluZygpLCBvbkNoYW5nZTogKGUpID0+IHNldExvY2FsQ29uZmlnKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmxvY2FsQ29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDM2MDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBtaW46IDYwLCBtYXg6IDcyMDAgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiUGFyYWxsZWwgU2NhbnNcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IGxvY2FsQ29uZmlnLnBhcmFsbGVsU2NhbnMudG9TdHJpbmcoKSwgb25DaGFuZ2U6IChlKSA9PiBzZXRMb2NhbENvbmZpZyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5sb2NhbENvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFsbGVsU2NhbnM6IHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSB8fCA0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgbWluOiAxLCBtYXg6IDEwLCBoZWxwZXJUZXh0OiBcIk51bWJlciBvZiBjb25jdXJyZW50IHNoYXJlIHNjYW5zXCIgfSldIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0zIHAtNiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBoYW5kbGVDYW5jZWwsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlU2F2ZSwgY2hpbGRyZW46IFwiU2F2ZSBDb25maWd1cmF0aW9uXCIgfSldIH0pXSB9KSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRmlsZVN5c3RlbUNvbmZpZ0RpYWxvZztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqXG4gKiBGdWxseSBhY2Nlc3NpYmxlIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGxhYmVscyBhbmQgZXJyb3Igc3RhdGVzLlxuICogRm9sbG93cyBXQ0FHIDIuMSBBQSBndWlkZWxpbmVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGVjayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQ2hlY2tib3ggPSAoeyBsYWJlbCwgZGVzY3JpcHRpb24sIGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGVycm9yLCBkaXNhYmxlZCA9IGZhbHNlLCBpbmRldGVybWluYXRlID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgZGVzY3JpcHRpb25JZCA9IGAke2lkfS1kZXNjcmlwdGlvbmA7XG4gICAgY29uc3QgaGFzRXJyb3IgPSBCb29sZWFuKGVycm9yKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgaW5kZXRlcm1pbmF0ZSB2aWEgcmVmXG4gICAgY29uc3QgY2hlY2tib3hSZWYgPSBSZWFjdC51c2VSZWYobnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNoZWNrYm94UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNoZWNrYm94UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9LCBbaW5kZXRlcm1pbmF0ZV0pO1xuICAgIGNvbnN0IGNoZWNrYm94Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaC01IHctNSByb3VuZGVkIGJvcmRlci0yJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGFyazpyaW5nLW9mZnNldC1ncmF5LTkwMCcsIFxuICAgIC8vIFN0YXRlLWJhc2VkIHN0eWxlc1xuICAgIHtcbiAgICAgICAgLy8gTm9ybWFsIHN0YXRlICh1bmNoZWNrZWQpXG4gICAgICAgICdib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS01MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQgJiYgIWNoZWNrZWQsXG4gICAgICAgICdmb2N1czpyaW5nLWJsdWUtNTAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gQ2hlY2tlZCBzdGF0ZVxuICAgICAgICAnYmctYmx1ZS02MDAgYm9yZGVyLWJsdWUtNjAwIGRhcms6YmctYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS01MDAnOiBjaGVja2VkICYmICFkaXNhYmxlZCAmJiAhaGFzRXJyb3IsXG4gICAgICAgIC8vIEVycm9yIHN0YXRlXG4gICAgICAgICdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC02MDAgZGFyazpib3JkZXItcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktODAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ3RleHQtc20gZm9udC1tZWRpdW0nLCB7XG4gICAgICAgICd0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wnLCBjbGFzc05hbWUpLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBoLTVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGNoZWNrYm94UmVmLCBpZDogaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogY2hlY2tlZCwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IFwic3Itb25seSBwZWVyXCIsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXJyb3JJZF06IGhhc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uSWRdOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSksIF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGNoZWNrYm94Q2xhc3NlcywgJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1wb2ludGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgY2hpbGRyZW46IFtjaGVja2VkICYmICFpbmRldGVybWluYXRlICYmIChfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00IHRleHQtd2hpdGVcIiwgc3Ryb2tlV2lkdGg6IDMgfSkpLCBpbmRldGVybWluYXRlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMC41IHctMyBiZy13aGl0ZSByb3VuZGVkXCIgfSkpXSB9KV0gfSksIChsYWJlbCB8fCBkZXNjcmlwdGlvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1sLTNcIiwgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChsYWJlbENsYXNzZXMsICdjdXJzb3ItcG9pbnRlcicpLCBjaGlsZHJlbjogbGFiZWwgfSkpLCBkZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBpZDogZGVzY3JpcHRpb25JZCwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMC41XCIsIGNoaWxkcmVuOiBkZXNjcmlwdGlvbiB9KSldIH0pKV0gfSksIGhhc0Vycm9yICYmIChfanN4KFwicFwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IFwibXQtMSBtbC04IHRleHQtc20gdGV4dC1yZWQtNjAwXCIsIHJvbGU6IFwiYWxlcnRcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGVycm9yIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94O1xuIiwiLyoqXG4gKiBEaXNjb3ZlcnkgU3RvcmVcbiAqXG4gKiBNYW5hZ2VzIGRpc2NvdmVyeSBvcGVyYXRpb25zLCByZXN1bHRzLCBhbmQgc3RhdGUuXG4gKiBIYW5kbGVzIGRvbWFpbiwgbmV0d29yaywgdXNlciwgYW5kIGFwcGxpY2F0aW9uIGRpc2NvdmVyeSBwcm9jZXNzZXMuXG4gKi9cbmltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ3p1c3RhbmQnO1xuaW1wb3J0IHsgZGV2dG9vbHMsIHN1YnNjcmliZVdpdGhTZWxlY3RvciB9IGZyb20gJ3p1c3RhbmQvbWlkZGxld2FyZSc7XG5leHBvcnQgY29uc3QgdXNlRGlzY292ZXJ5U3RvcmUgPSBjcmVhdGUoKShkZXZ0b29scyhzdWJzY3JpYmVXaXRoU2VsZWN0b3IoKHNldCwgZ2V0KSA9PiAoe1xuICAgIC8vIEluaXRpYWwgc3RhdGVcbiAgICBvcGVyYXRpb25zOiBuZXcgTWFwKCksXG4gICAgcmVzdWx0czogbmV3IE1hcCgpLFxuICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBudWxsLFxuICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgIC8vIEFjdGlvbnNcbiAgICAvKipcbiAgICAgKiBTdGFydCBhIG5ldyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgc3RhcnREaXNjb3Zlcnk6IGFzeW5jICh0eXBlLCBwYXJhbWV0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3QgY2FuY2VsbGF0aW9uVG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgc3RhdHVzOiAncnVubmluZycsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbml0aWFsaXppbmcgZGlzY292ZXJ5Li4uJyxcbiAgICAgICAgICAgIGl0ZW1zRGlzY292ZXJlZDogMCxcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgb3BlcmF0aW9uIHRvIHN0YXRlXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5zZXQob3BlcmF0aW9uSWQsIG9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2V0dXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NDbGVhbnVwID0gd2luZG93LmVsZWN0cm9uQVBJLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBkYXRhLnBlcmNlbnRhZ2UsIGRhdGEubWVzc2FnZSB8fCAnUHJvY2Vzc2luZy4uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgZGlzY292ZXJ5IG1vZHVsZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IGBNb2R1bGVzL0Rpc2NvdmVyeS8ke3R5cGV9LnBzbTFgLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogYFN0YXJ0LSR7dHlwZX1EaXNjb3ZlcnlgLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDAsIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIENsZWFudXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuY29tcGxldGVEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5kYXRhPy5yZXN1bHRzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5lcnJvciB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCBlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbklkO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGEgcnVubmluZyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgY2FuY2VsRGlzY292ZXJ5OiBhc3luYyAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICBpZiAoIW9wZXJhdGlvbiB8fCBvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihvcGVyYXRpb24uY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnY2FuY2VsbGVkJztcbiAgICAgICAgICAgICAgICAgICAgb3AubWVzc2FnZSA9ICdEaXNjb3ZlcnkgY2FuY2VsbGVkIGJ5IHVzZXInO1xuICAgICAgICAgICAgICAgICAgICBvcC5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHByb2dyZXNzIGZvciBhIHJ1bm5pbmcgb3BlcmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlUHJvZ3Jlc3M6IChvcGVyYXRpb25JZCwgcHJvZ3Jlc3MsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uICYmIG9wZXJhdGlvbi5zdGF0dXMgPT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBjb21wbGV0ZWQgd2l0aCByZXN1bHRzXG4gICAgICovXG4gICAgY29tcGxldGVEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgcmVzdWx0cykgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJlZCAke3Jlc3VsdHMubGVuZ3RofSBpdGVtc2A7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLml0ZW1zRGlzY292ZXJlZCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChvcGVyYXRpb25JZCwgcmVzdWx0cyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgZmFpbGVkXG4gICAgICovXG4gICAgZmFpbERpc2NvdmVyeTogKG9wZXJhdGlvbklkLCBlcnJvcikgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJ5IGZhaWxlZDogJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGEgc2luZ2xlIG9wZXJhdGlvbiBhbmQgaXRzIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhck9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24gPT09IG9wZXJhdGlvbklkID8gbnVsbCA6IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgb3BlcmF0aW9ucyBhbmQgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyQWxsT3BlcmF0aW9uczogKCkgPT4ge1xuICAgICAgICAvLyBPbmx5IGNsZWFyIGNvbXBsZXRlZCwgZmFpbGVkLCBvciBjYW5jZWxsZWQgb3BlcmF0aW9uc1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIG9wZXJhdGlvbl0gb2YgbmV3T3BlcmF0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgZm9yIGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0UmVzdWx0czogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBieSBtb2R1bGUgbmFtZSAoZm9yIHBlcnNpc3RlbnQgcmV0cmlldmFsIGFjcm9zcyBjb21wb25lbnQgcmVtb3VudHMpXG4gICAgICovXG4gICAgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZTogKG1vZHVsZU5hbWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG1vZHVsZU5hbWUpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQWRkIGEgZGlzY292ZXJ5IHJlc3VsdCAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIGFkZFJlc3VsdDogKHJlc3VsdCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0cyA9IG5ld1Jlc3VsdHMuZ2V0KHJlc3VsdC5tb2R1bGVOYW1lKSB8fCBbXTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KHJlc3VsdC5tb2R1bGVOYW1lLCBbLi4uZXhpc3RpbmdSZXN1bHRzLCByZXN1bHRdKTtcbiAgICAgICAgICAgIHJldHVybiB7IHJlc3VsdHM6IG5ld1Jlc3VsdHMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZXQgcHJvZ3Jlc3MgaW5mb3JtYXRpb24gKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBzZXRQcm9ncmVzczogKHByb2dyZXNzRGF0YSkgPT4ge1xuICAgICAgICAvLyBGaW5kIHRoZSBjdXJyZW50IG9wZXJhdGlvbiBmb3IgdGhpcyBtb2R1bGUgYW5kIHVwZGF0ZSBpdFxuICAgICAgICBjb25zdCBvcGVyYXRpb25zID0gZ2V0KCkub3BlcmF0aW9ucztcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBBcnJheS5mcm9tKG9wZXJhdGlvbnMua2V5cygpKS5maW5kKGlkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gb3BlcmF0aW9ucy5nZXQoaWQpO1xuICAgICAgICAgICAgcmV0dXJuIG9wICYmIG9wLnR5cGUgPT09IHByb2dyZXNzRGF0YS5tb2R1bGVOYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wZXJhdGlvbklkKSB7XG4gICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgcHJvZ3Jlc3NEYXRhLm92ZXJhbGxQcm9ncmVzcywgcHJvZ3Jlc3NEYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcbn0pKSwge1xuICAgIG5hbWU6ICdEaXNjb3ZlcnlTdG9yZScsXG59KSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=