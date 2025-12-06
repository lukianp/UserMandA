"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6302],{

/***/ 66302:
/*!*******************************************************!*\
  !*** ./src/renderer/hooks/useHyperVDiscoveryLogic.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useHyperVDiscoveryLogic: () => (/* binding */ useHyperVDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useDiscoveryStore */ 92856);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../store/useProfileStore */ 33813);
/**
 * Hyper-V Discovery Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for Hyper-V infrastructure discovery
 * NO PLACEHOLDERS - Complete implementation with Hosts, VMs, Switches, VHDs
 */



const useHyperVDiscoveryLogic = () => {
    const { getResultsByModuleName, addResult: addDiscoveryResult } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_1__.useDiscoveryStore)();
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__.useProfileStore)((state) => state.selectedSourceProfile);
    const currentTokenRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            includeVMs: true,
            includeVirtualSwitches: true,
            includeVHDs: true,
            includeVirtualNetworks: true,
            includeStorage: true,
            hostAddresses: [],
            timeout: 300000,
            companyName: ''
        },
        result: null,
        isDiscovering: false,
        progress: { current: 0, total: 100, message: '', percentage: 0 },
        activeTab: 'overview',
        filter: {
            searchText: '',
            selectedHosts: [],
            selectedStates: [],
            showOnlyRunning: false
        },
        cancellationToken: null,
        error: null
    });
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('HyperVDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[HyperVDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setState(prev => ({ ...prev, result: latestResult }));
        }
    }, [getResultsByModuleName]);
    // Real-time progress tracking via IPC
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribeProgress = window.electronAPI?.onDiscoveryProgress?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                setState(prev => ({
                    ...prev,
                    progress: {
                        current: data.current || 0,
                        total: data.total || 100,
                        message: data.message || '',
                        percentage: data.percentage || 0
                    }
                }));
            }
        });
        const unsubscribeComplete = window.electronAPI?.onDiscoveryComplete?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                console.log('[HyperVDiscoveryHook] Discovery completed, raw data:', JSON.stringify(data).slice(0, 500));
                const result = data.result || data.data;
                setState(prev => ({
                    ...prev,
                    result: result,
                    isDiscovering: false,
                    cancellationToken: null,
                    progress: {
                        current: 100,
                        total: 100,
                        message: 'Discovery completed',
                        percentage: 100
                    }
                }));
                // Store result in discovery store
                const discoveryResult = {
                    id: `hyperv-discovery-${Date.now()}`,
                    moduleName: 'VirtualizationDiscovery',
                    displayName: 'Hyper-V Discovery',
                    itemCount: result?.RecordCount || 0,
                    discoveryTime: new Date().toISOString(),
                    duration: data.duration || 0,
                    status: 'Completed',
                    additionalData: result
                };
                addDiscoveryResult(discoveryResult);
            }
        });
        const unsubscribeError = window.electronAPI?.onDiscoveryError?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                console.error('[HyperVDiscoveryHook] Discovery error:', data);
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    error: data.error || 'Discovery failed',
                    cancellationToken: null
                }));
            }
        });
        return () => {
            if (unsubscribeProgress)
                unsubscribeProgress();
            if (unsubscribeComplete)
                unsubscribeComplete();
            if (unsubscribeError)
                unsubscribeError();
        };
    }, [addDiscoveryResult]);
    // Start discovery
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        const token = `hyperv-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        currentTokenRef.current = token;
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            cancellationToken: token,
            error: null,
            progress: { current: 0, total: 100, message: 'Initializing Hyper-V discovery...', percentage: 0 }
        }));
        try {
            const companyName = state.config.companyName || selectedSourceProfile?.companyName || 'default';
            const discoveryResult = await window.electronAPI.executeDiscovery({
                moduleName: 'Virtualization',
                parameters: {
                    Configuration: {
                        includeVMs: state.config.includeVMs ?? true,
                        includeVirtualSwitches: state.config.includeVirtualSwitches ?? true,
                        includeVHDs: state.config.includeVHDs ?? true,
                        includeVirtualNetworks: state.config.includeVirtualNetworks ?? true,
                        includeStorage: state.config.includeStorage ?? true,
                        hostAddresses: state.config.hostAddresses || [],
                        timeout: state.config.timeout ?? 300000
                    },
                    Context: {
                        Paths: {
                            RawDataOutput: `C:\\DiscoveryData\\${companyName}\\Raw`,
                            Logs: `C:\\DiscoveryData\\${companyName}\\Logs`
                        },
                        SessionInfo: {
                            StartTime: new Date().toISOString(),
                            Operator: 'System'
                        },
                        CompanyName: companyName
                    },
                    SessionId: token
                },
                executionId: token,
                showWindow: false
            });
            // Note: Actual completion will be handled by onDiscoveryComplete event
            console.log('[HyperVDiscoveryHook] Discovery started successfully:', discoveryResult);
        }
        catch (error) {
            console.error('[HyperVDiscoveryHook] Discovery failed to start:', error);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                cancellationToken: null,
                error: error.message || 'Discovery failed to start'
            }));
        }
    }, [state.config, selectedSourceProfile]);
    // Cancel discovery
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (state.cancellationToken) {
            try {
                await window.electronAPI.cancelDiscovery(state.cancellationToken);
                console.log('[HyperVDiscoveryHook] Discovery cancelled:', state.cancellationToken);
            }
            catch (error) {
                console.error('[HyperVDiscoveryHook] Failed to cancel discovery:', error);
            }
        }
        currentTokenRef.current = null;
        setState(prev => ({
            ...prev,
            isDiscovering: false,
            cancellationToken: null,
            progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
        }));
    }, [state.cancellationToken]);
    // Export to CSV
    const exportToCSV = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            let data = [];
            switch (state.activeTab) {
                case 'hosts':
                    data = state.result.hosts;
                    break;
                case 'vms':
                    data = state.result.hosts.flatMap(h => h.virtualMachines.map(vm => ({ ...vm, hostName: h.name })));
                    break;
                case 'switches':
                    data = state.result.hosts.flatMap(h => h.virtualSwitches.map(sw => ({ ...sw, hostName: h.name })));
                    break;
                case 'checkpoints':
                    data = state.result.hosts.flatMap(h => h.virtualMachines.flatMap(vm => vm.checkpoints.map(cp => ({ ...cp, vmName: vm.name, hostName: h.name }))));
                    break;
            }
            const csvData = convertToCSV(data);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hyperv-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('CSV export failed:', error);
        }
    }, [state.result, state.activeTab]);
    // Export to Excel
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportToExcel.psm1',
                functionName: 'Export-HyperVData',
                parameters: {
                    data: state.result,
                    tab: state.activeTab,
                    filename: `hyperv-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
                }
            });
        }
        catch (error) {
            console.error('Excel export failed:', error);
        }
    }, [state.result, state.activeTab]);
    // Hosts columns
    const hostsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'name', headerName: 'Host Name', sortable: true, filter: true, width: 250 },
        { field: 'fqdn', headerName: 'FQDN', sortable: true, filter: true, width: 300 },
        { field: 'version', headerName: 'Version', sortable: true, filter: true, width: 150 },
        { field: 'operatingSystem', headerName: 'OS', sortable: true, filter: true, width: 200 },
        { field: 'totalVMs', headerName: 'Total VMs', sortable: true, filter: true, width: 120 },
        { field: 'runningVMs', headerName: 'Running VMs', sortable: true, filter: true, width: 130 },
        { field: 'processorInfo.logicalProcessorCount', headerName: 'Processors', sortable: true, filter: true, width: 120 },
        { field: 'memoryInfo.totalMemory', headerName: 'Total Memory', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
        { field: 'memoryInfo.availableMemory', headerName: 'Available Memory', sortable: true, filter: true, width: 160,
            valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' }
    ], []);
    // VMs columns
    const vmsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
        { field: 'name', headerName: 'VM Name', sortable: true, filter: true, width: 250 },
        { field: 'state', headerName: 'State', sortable: true, filter: true, width: 120 },
        { field: 'generation', headerName: 'Gen', sortable: true, filter: true, width: 80 },
        { field: 'cpuCount', headerName: 'vCPUs', sortable: true, filter: true, width: 100 },
        { field: 'memoryAssigned', headerName: 'Memory', sortable: true, filter: true, width: 130,
            valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
        { field: 'dynamicMemoryEnabled', headerName: 'Dynamic RAM', sortable: true, filter: true, width: 140,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'uptime', headerName: 'Uptime', sortable: true, filter: true, width: 150 },
        { field: 'networkAdapters', headerName: 'NICs', sortable: false, filter: false, width: 80,
            valueFormatter: (params) => params.value?.length || 0 },
        { field: 'checkpoints', headerName: 'Checkpoints', sortable: false, filter: false, width: 120,
            valueFormatter: (params) => params.value?.length || 0 }
    ], []);
    // Switches columns
    const switchesColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
        { field: 'name', headerName: 'Switch Name', sortable: true, filter: true, width: 250 },
        { field: 'switchType', headerName: 'Type', sortable: true, filter: true, width: 120 },
        { field: 'allowManagementOS', headerName: 'Management OS', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? 'Allowed' : 'Not Allowed' },
        { field: 'netAdapterInterfaceDescription', headerName: 'Network Adapter', sortable: true, filter: true, width: 300 },
        { field: 'extensions', headerName: 'Extensions', sortable: false, filter: false, width: 120,
            valueFormatter: (params) => params.value?.length || 0 }
    ], []);
    // Checkpoints columns
    const checkpointsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'hostName', headerName: 'Host', sortable: true, filter: true, width: 200 },
        { field: 'vmName', headerName: 'VM Name', sortable: true, filter: true, width: 250 },
        { field: 'name', headerName: 'Checkpoint Name', sortable: true, filter: true, width: 250 },
        { field: 'snapshotType', headerName: 'Type', sortable: true, filter: true, width: 120 },
        { field: 'creationTime', headerName: 'Created', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A' }
    ], []);
    // Dynamic columns based on active tab
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'hosts':
                return hostsColumns;
            case 'vms':
                return vmsColumns;
            case 'switches':
                return switchesColumns;
            case 'checkpoints':
                return checkpointsColumns;
            default:
                return [];
        }
    }, [state.activeTab, hostsColumns, vmsColumns, switchesColumns, checkpointsColumns]);
    // Filtered data
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        let data = [];
        switch (state.activeTab) {
            case 'hosts':
                data = state.result?.hosts || [];
                // Filter by selected hosts
                if (state.filter.selectedHosts.length > 0) {
                    data = (data ?? []).filter((h) => state.filter.selectedHosts.includes(h.name));
                }
                break;
            case 'vms':
                data = state.result?.hosts.flatMap(h => h.virtualMachines.map(vm => ({ ...vm, hostName: h.name }))) || [];
                // Filter by state
                if (state.filter.selectedStates.length > 0) {
                    data = (data ?? []).filter((vm) => state.filter.selectedStates.includes(vm.state));
                }
                // Filter by running only
                if (state.filter.showOnlyRunning) {
                    data = (data ?? []).filter((vm) => vm.state === 'running');
                }
                // Filter by host
                if (state.filter.selectedHosts.length > 0) {
                    data = (data ?? []).filter((vm) => state.filter.selectedHosts.includes(vm.hostName));
                }
                break;
            case 'switches':
                data = state.result?.hosts.flatMap(h => h.virtualSwitches.map(sw => ({ ...sw, hostName: h.name }))) || [];
                if (state.filter.selectedHosts.length > 0) {
                    data = (data ?? []).filter((sw) => state.filter.selectedHosts.includes(sw.hostName));
                }
                break;
            case 'checkpoints':
                data = state.result?.hosts.flatMap(h => h.virtualMachines.flatMap(vm => vm.checkpoints.map(cp => ({ ...cp, vmName: vm.name, hostName: h.name })))) || [];
                if (state.filter.selectedHosts.length > 0) {
                    data = (data ?? []).filter((cp) => state.filter.selectedHosts.includes(cp.hostName));
                }
                break;
            default:
                return [];
        }
        // Apply search filter
        if (state.filter.searchText) {
            const searchLower = state.filter.searchText.toLowerCase();
            data = (data ?? []).filter(item => JSON.stringify(item).toLowerCase().includes(searchLower));
        }
        return data;
    }, [state.result, state.activeTab, state.filter]);
    // Statistics calculation
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const hosts = state.result.hosts || [];
        const allVMs = hosts.flatMap(h => h.virtualMachines);
        const vmsByState = {
            running: 0,
            off: 0,
            paused: 0,
            saved: 0,
            starting: 0,
            stopping: 0,
            saving: 0,
            pausing: 0,
            resuming: 0
        };
        allVMs.forEach(vm => {
            vmsByState[vm.state] = (vmsByState[vm.state] || 0) + 1;
        });
        const totalMemoryAllocated = allVMs.reduce((sum, vm) => sum + (vm.memoryAssigned || 0), 0);
        const totalVCPUs = allVMs.reduce((sum, vm) => sum + (vm.cpuCount || 0), 0);
        return {
            totalHosts: hosts.length,
            totalVMs: allVMs.length,
            runningVMs: vmsByState.running,
            vmsByState,
            totalMemoryAllocated,
            totalVCPUs
        };
    }, [state.result]);
    // Update config
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
    }, []);
    // Update filter
    const updateFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
    }, []);
    // Set active tab
    const setActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);
    return {
        // State
        config: state.config,
        result: state.result,
        isDiscovering: state.isDiscovering,
        progress: state.progress,
        activeTab: state.activeTab,
        filter: state.filter,
        error: state.error,
        // Data
        columns,
        filteredData,
        stats,
        // Actions
        updateConfig,
        updateFilter,
        setActiveTab,
        startDiscovery,
        cancelDiscovery,
        exportToCSV,
        exportToExcel
    };
};
// Helper function to convert data to CSV
function convertToCSV(data) {
    if (!data || data.length === 0)
        return '';
    const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value === null || value === undefined) {
                acc[newKey] = '';
            }
            else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                Object.assign(acc, flattenObject(value, newKey));
            }
            else if (Array.isArray(value)) {
                acc[newKey] = value.length;
            }
            else if (value instanceof Date) {
                acc[newKey] = value.toISOString();
            }
            else {
                acc[newKey] = value;
            }
            return acc;
        }, {});
    };
    const flatData = (data ?? []).map(item => flattenObject(item));
    const headers = Object.keys(flatData[0]);
    const rows = flatData.map(item => headers.map(header => {
        const value = item[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
}


/***/ }),

/***/ 92856:
/*!*************************************************!*\
  !*** ./src/renderer/store/useDiscoveryStore.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDiscoveryStore: () => (/* binding */ useDiscoveryStore)
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ 55618);
/* harmony import */ var zustand_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! zustand/middleware */ 87134);
/**
 * Discovery Store
 *
 * Manages discovery operations, results, and state.
 * Handles domain, network, user, and application discovery processes.
 */


const useDiscoveryStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)()((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__.devtools)((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__.subscribeWithSelector)((set, get) => ({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBLHlEQUF5RCxNQUFNO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlSHlwZXJWRGlzY292ZXJ5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIeXBlci1WIERpc2NvdmVyeSBMb2dpYyBIb29rXG4gKiBGVUxMWSBGVU5DVElPTkFMIHByb2R1Y3Rpb24tcmVhZHkgYnVzaW5lc3MgbG9naWMgZm9yIEh5cGVyLVYgaW5mcmFzdHJ1Y3R1cmUgZGlzY292ZXJ5XG4gKiBOTyBQTEFDRUhPTERFUlMgLSBDb21wbGV0ZSBpbXBsZW1lbnRhdGlvbiB3aXRoIEhvc3RzLCBWTXMsIFN3aXRjaGVzLCBWSERzXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlTWVtbywgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VEaXNjb3ZlcnlTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZURpc2NvdmVyeVN0b3JlJztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlSHlwZXJWRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lLCBhZGRSZXN1bHQ6IGFkZERpc2NvdmVyeVJlc3VsdCB9ID0gdXNlRGlzY292ZXJ5U3RvcmUoKTtcbiAgICBjb25zdCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgPSB1c2VQcm9maWxlU3RvcmUoKHN0YXRlKSA9PiBzdGF0ZS5zZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgIGNvbnN0IGN1cnJlbnRUb2tlblJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICBpbmNsdWRlVk1zOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZVZpcnR1YWxTd2l0Y2hlczogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVWSERzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZVZpcnR1YWxOZXR3b3JrczogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVTdG9yYWdlOiB0cnVlLFxuICAgICAgICAgICAgaG9zdEFkZHJlc3NlczogW10sXG4gICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDAsXG4gICAgICAgICAgICBjb21wYW55TmFtZTogJydcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJycsIHBlcmNlbnRhZ2U6IDAgfSxcbiAgICAgICAgYWN0aXZlVGFiOiAnb3ZlcnZpZXcnLFxuICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRIb3N0czogW10sXG4gICAgICAgICAgICBzZWxlY3RlZFN0YXRlczogW10sXG4gICAgICAgICAgICBzaG93T25seVJ1bm5pbmc6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuICAgIC8vIExvYWQgcHJldmlvdXMgZGlzY292ZXJ5IHJlc3VsdHMgZnJvbSBzdG9yZSBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVzdWx0cyA9IGdldFJlc3VsdHNCeU1vZHVsZU5hbWUoJ0h5cGVyVkRpc2NvdmVyeScpO1xuICAgICAgICBpZiAocHJldmlvdXNSZXN1bHRzICYmIHByZXZpb3VzUmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0h5cGVyVkRpc2NvdmVyeUhvb2tdIFJlc3RvcmluZycsIHByZXZpb3VzUmVzdWx0cy5sZW5ndGgsICdwcmV2aW91cyByZXN1bHRzIGZyb20gc3RvcmUnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdFJlc3VsdCA9IHByZXZpb3VzUmVzdWx0c1twcmV2aW91c1Jlc3VsdHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHJlc3VsdDogbGF0ZXN0UmVzdWx0IH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtnZXRSZXN1bHRzQnlNb2R1bGVOYW1lXSk7XG4gICAgLy8gUmVhbC10aW1lIHByb2dyZXNzIHRyYWNraW5nIHZpYSBJUENcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZVByb2dyZXNzID0gd2luZG93LmVsZWN0cm9uQVBJPy5vbkRpc2NvdmVyeVByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjdXJyZW50VG9rZW5SZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGRhdGEuY3VycmVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGRhdGEudG90YWwgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wZXJjZW50YWdlIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlQ29tcGxldGUgPSB3aW5kb3cuZWxlY3Ryb25BUEk/Lm9uRGlzY292ZXJ5Q29tcGxldGU/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tIeXBlclZEaXNjb3ZlcnlIb29rXSBEaXNjb3ZlcnkgY29tcGxldGVkLCByYXcgZGF0YTonLCBKU09OLnN0cmluZ2lmeShkYXRhKS5zbGljZSgwLCA1MDApKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhLnJlc3VsdCB8fCBkYXRhLmRhdGE7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudDogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdEaXNjb3ZlcnkgY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDEwMFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHJlc3VsdCBpbiBkaXNjb3Zlcnkgc3RvcmVcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNjb3ZlcnlSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBgaHlwZXJ2LWRpc2NvdmVyeS0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogJ1ZpcnR1YWxpemF0aW9uRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdIeXBlci1WIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Db3VudDogcmVzdWx0Py5SZWNvcmRDb3VudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBkaXNjb3ZlcnlUaW1lOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBkYXRhLmR1cmF0aW9uIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiByZXN1bHRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFkZERpc2NvdmVyeVJlc3VsdChkaXNjb3ZlcnlSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVFcnJvciA9IHdpbmRvdy5lbGVjdHJvbkFQST8ub25EaXNjb3ZlcnlFcnJvcj8uKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY3VycmVudFRva2VuUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbSHlwZXJWRGlzY292ZXJ5SG9va10gRGlzY292ZXJ5IGVycm9yOicsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkYXRhLmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlUHJvZ3Jlc3MpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVQcm9ncmVzcygpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlQ29tcGxldGUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVDb21wbGV0ZSgpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlRXJyb3IpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVFcnJvcigpO1xuICAgICAgICB9O1xuICAgIH0sIFthZGREaXNjb3ZlcnlSZXN1bHRdKTtcbiAgICAvLyBTdGFydCBkaXNjb3ZlcnlcbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBgaHlwZXJ2LWRpc2NvdmVyeS0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgICAgIGN1cnJlbnRUb2tlblJlZi5jdXJyZW50ID0gdG9rZW47XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIEh5cGVyLVYgZGlzY292ZXJ5Li4uJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlOYW1lID0gc3RhdGUuY29uZmlnLmNvbXBhbnlOYW1lIHx8IHNlbGVjdGVkU291cmNlUHJvZmlsZT8uY29tcGFueU5hbWUgfHwgJ2RlZmF1bHQnO1xuICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVEaXNjb3Zlcnkoe1xuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdWaXJ0dWFsaXphdGlvbicsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBDb25maWd1cmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdWRlVk1zOiBzdGF0ZS5jb25maWcuaW5jbHVkZVZNcyA/PyB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVkZVZpcnR1YWxTd2l0Y2hlczogc3RhdGUuY29uZmlnLmluY2x1ZGVWaXJ0dWFsU3dpdGNoZXMgPz8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVWSERzOiBzdGF0ZS5jb25maWcuaW5jbHVkZVZIRHMgPz8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVWaXJ0dWFsTmV0d29ya3M6IHN0YXRlLmNvbmZpZy5pbmNsdWRlVmlydHVhbE5ldHdvcmtzID8/IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU3RvcmFnZTogc3RhdGUuY29uZmlnLmluY2x1ZGVTdG9yYWdlID8/IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBob3N0QWRkcmVzc2VzOiBzdGF0ZS5jb25maWcuaG9zdEFkZHJlc3NlcyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHN0YXRlLmNvbmZpZy50aW1lb3V0ID8/IDMwMDAwMFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBDb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQYXRoczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJhd0RhdGFPdXRwdXQ6IGBDOlxcXFxEaXNjb3ZlcnlEYXRhXFxcXCR7Y29tcGFueU5hbWV9XFxcXFJhd2AsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nczogYEM6XFxcXERpc2NvdmVyeURhdGFcXFxcJHtjb21wYW55TmFtZX1cXFxcTG9nc2BcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBTZXNzaW9uSW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0YXJ0VGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wZXJhdG9yOiAnU3lzdGVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbXBhbnlOYW1lOiBjb21wYW55TmFtZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBTZXNzaW9uSWQ6IHRva2VuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBleGVjdXRpb25JZDogdG9rZW4sXG4gICAgICAgICAgICAgICAgc2hvd1dpbmRvdzogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gTm90ZTogQWN0dWFsIGNvbXBsZXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5IG9uRGlzY292ZXJ5Q29tcGxldGUgZXZlbnRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbSHlwZXJWRGlzY292ZXJ5SG9va10gRGlzY292ZXJ5IHN0YXJ0ZWQgc3VjY2Vzc2Z1bGx5OicsIGRpc2NvdmVyeVJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbSHlwZXJWRGlzY292ZXJ5SG9va10gRGlzY292ZXJ5IGZhaWxlZCB0byBzdGFydDonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCB0byBzdGFydCdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jb25maWcsIHNlbGVjdGVkU291cmNlUHJvZmlsZV0pO1xuICAgIC8vIENhbmNlbCBkaXNjb3ZlcnlcbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRGlzY292ZXJ5KHN0YXRlLmNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0h5cGVyVkRpc2NvdmVyeUhvb2tdIERpc2NvdmVyeSBjYW5jZWxsZWQ6Jywgc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0h5cGVyVkRpc2NvdmVyeUhvb2tdIEZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50VG9rZW5SZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ0NhbmNlbGxlZCcsIHBlcmNlbnRhZ2U6IDAgfVxuICAgICAgICB9KSk7XG4gICAgfSwgW3N0YXRlLmNhbmNlbGxhdGlvblRva2VuXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ1NWID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gW107XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2hvc3RzJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdC5ob3N0cztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndm1zJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdC5ob3N0cy5mbGF0TWFwKGggPT4gaC52aXJ0dWFsTWFjaGluZXMubWFwKHZtID0+ICh7IC4uLnZtLCBob3N0TmFtZTogaC5uYW1lIH0pKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3N3aXRjaGVzJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdC5ob3N0cy5mbGF0TWFwKGggPT4gaC52aXJ0dWFsU3dpdGNoZXMubWFwKHN3ID0+ICh7IC4uLnN3LCBob3N0TmFtZTogaC5uYW1lIH0pKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NoZWNrcG9pbnRzJzpcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdC5ob3N0cy5mbGF0TWFwKGggPT4gaC52aXJ0dWFsTWFjaGluZXMuZmxhdE1hcCh2bSA9PiB2bS5jaGVja3BvaW50cy5tYXAoY3AgPT4gKHsgLi4uY3AsIHZtTmFtZTogdm0ubmFtZSwgaG9zdE5hbWU6IGgubmFtZSB9KSkpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjc3ZEYXRhID0gY29udmVydFRvQ1NWKGRhdGEpO1xuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjc3ZEYXRhXSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICBsaW5rLmRvd25sb2FkID0gYGh5cGVydi0ke3N0YXRlLmFjdGl2ZVRhYn0tJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YDtcbiAgICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NTViBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0V4cG9ydC9FeHBvcnRUb0V4Y2VsLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1IeXBlclZEYXRhJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHN0YXRlLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgdGFiOiBzdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgaHlwZXJ2LSR7c3RhdGUuYWN0aXZlVGFifS0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS54bHN4YFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhjZWwgZXhwb3J0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUucmVzdWx0LCBzdGF0ZS5hY3RpdmVUYWJdKTtcbiAgICAvLyBIb3N0cyBjb2x1bW5zXG4gICAgY29uc3QgaG9zdHNDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0hvc3QgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2ZxZG4nLCBoZWFkZXJOYW1lOiAnRlFETicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3ZlcnNpb24nLCBoZWFkZXJOYW1lOiAnVmVyc2lvbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ29wZXJhdGluZ1N5c3RlbScsIGhlYWRlck5hbWU6ICdPUycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3RvdGFsVk1zJywgaGVhZGVyTmFtZTogJ1RvdGFsIFZNcycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3J1bm5pbmdWTXMnLCBoZWFkZXJOYW1lOiAnUnVubmluZyBWTXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTMwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdwcm9jZXNzb3JJbmZvLmxvZ2ljYWxQcm9jZXNzb3JDb3VudCcsIGhlYWRlck5hbWU6ICdQcm9jZXNzb3JzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAnbWVtb3J5SW5mby50b3RhbE1lbW9yeScsIGhlYWRlck5hbWU6ICdUb3RhbCBNZW1vcnknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IGAkeyhwYXJhbXMudmFsdWUgLyAxMDI0IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMil9IEdCYCA6ICdOL0EnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdtZW1vcnlJbmZvLmF2YWlsYWJsZU1lbW9yeScsIGhlYWRlck5hbWU6ICdBdmFpbGFibGUgTWVtb3J5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE2MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBgJHsocGFyYW1zLnZhbHVlIC8gMTAyNCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBHQmAgOiAnTi9BJyB9XG4gICAgXSwgW10pO1xuICAgIC8vIFZNcyBjb2x1bW5zXG4gICAgY29uc3Qgdm1zQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnaG9zdE5hbWUnLCBoZWFkZXJOYW1lOiAnSG9zdCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnVk0gTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3N0YXRlJywgaGVhZGVyTmFtZTogJ1N0YXRlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAnZ2VuZXJhdGlvbicsIGhlYWRlck5hbWU6ICdHZW4nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogODAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2NwdUNvdW50JywgaGVhZGVyTmFtZTogJ3ZDUFVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnbWVtb3J5QXNzaWduZWQnLCBoZWFkZXJOYW1lOiAnTWVtb3J5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBgJHsocGFyYW1zLnZhbHVlIC8gMTAyNCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBHQmAgOiAnTi9BJyB9LFxuICAgICAgICB7IGZpZWxkOiAnZHluYW1pY01lbW9yeUVuYWJsZWQnLCBoZWFkZXJOYW1lOiAnRHluYW1pYyBSQU0nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJyB9LFxuICAgICAgICB7IGZpZWxkOiAndXB0aW1lJywgaGVhZGVyTmFtZTogJ1VwdGltZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ25ldHdvcmtBZGFwdGVycycsIGhlYWRlck5hbWU6ICdOSUNzJywgc29ydGFibGU6IGZhbHNlLCBmaWx0ZXI6IGZhbHNlLCB3aWR0aDogODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlPy5sZW5ndGggfHwgMCB9LFxuICAgICAgICB7IGZpZWxkOiAnY2hlY2twb2ludHMnLCBoZWFkZXJOYW1lOiAnQ2hlY2twb2ludHMnLCBzb3J0YWJsZTogZmFsc2UsIGZpbHRlcjogZmFsc2UsIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlPy5sZW5ndGggfHwgMCB9XG4gICAgXSwgW10pO1xuICAgIC8vIFN3aXRjaGVzIGNvbHVtbnNcbiAgICBjb25zdCBzd2l0Y2hlc0NvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgeyBmaWVsZDogJ2hvc3ROYW1lJywgaGVhZGVyTmFtZTogJ0hvc3QnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjAwIH0sXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ1N3aXRjaCBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnc3dpdGNoVHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAnYWxsb3dNYW5hZ2VtZW50T1MnLCBoZWFkZXJOYW1lOiAnTWFuYWdlbWVudCBPUycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ0FsbG93ZWQnIDogJ05vdCBBbGxvd2VkJyB9LFxuICAgICAgICB7IGZpZWxkOiAnbmV0QWRhcHRlckludGVyZmFjZURlc2NyaXB0aW9uJywgaGVhZGVyTmFtZTogJ05ldHdvcmsgQWRhcHRlcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2V4dGVuc2lvbnMnLCBoZWFkZXJOYW1lOiAnRXh0ZW5zaW9ucycsIHNvcnRhYmxlOiBmYWxzZSwgZmlsdGVyOiBmYWxzZSwgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/Lmxlbmd0aCB8fCAwIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gQ2hlY2twb2ludHMgY29sdW1uc1xuICAgIGNvbnN0IGNoZWNrcG9pbnRzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnaG9zdE5hbWUnLCBoZWFkZXJOYW1lOiAnSG9zdCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3ZtTmFtZScsIGhlYWRlck5hbWU6ICdWTSBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdDaGVja3BvaW50IE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzbmFwc2hvdFR5cGUnLCBoZWFkZXJOYW1lOiAnVHlwZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2NyZWF0aW9uVGltZScsIGhlYWRlck5hbWU6ICdDcmVhdGVkJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTi9BJyB9XG4gICAgXSwgW10pO1xuICAgIC8vIER5bmFtaWMgY29sdW1ucyBiYXNlZCBvbiBhY3RpdmUgdGFiXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgY2FzZSAnaG9zdHMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBob3N0c0NvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICd2bXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiB2bXNDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAnc3dpdGNoZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBzd2l0Y2hlc0NvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdjaGVja3BvaW50cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrcG9pbnRzQ29sdW1ucztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmFjdGl2ZVRhYiwgaG9zdHNDb2x1bW5zLCB2bXNDb2x1bW5zLCBzd2l0Y2hlc0NvbHVtbnMsIGNoZWNrcG9pbnRzQ29sdW1uc10pO1xuICAgIC8vIEZpbHRlcmVkIGRhdGFcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ2hvc3RzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5ob3N0cyB8fCBbXTtcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgYnkgc2VsZWN0ZWQgaG9zdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlbGVjdGVkSG9zdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoaCkgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkSG9zdHMuaW5jbHVkZXMoaC5uYW1lKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndm1zJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5ob3N0cy5mbGF0TWFwKGggPT4gaC52aXJ0dWFsTWFjaGluZXMubWFwKHZtID0+ICh7IC4uLnZtLCBob3N0TmFtZTogaC5uYW1lIH0pKSkgfHwgW107XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIGJ5IHN0YXRlXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKCh2bSkgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkU3RhdGVzLmluY2x1ZGVzKHZtLnN0YXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZpbHRlciBieSBydW5uaW5nIG9ubHlcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNob3dPbmx5UnVubmluZykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigodm0pID0+IHZtLnN0YXRlID09PSAncnVubmluZycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgYnkgaG9zdFxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRIb3N0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKCh2bSkgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkSG9zdHMuaW5jbHVkZXModm0uaG9zdE5hbWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzd2l0Y2hlcyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8uaG9zdHMuZmxhdE1hcChoID0+IGgudmlydHVhbFN3aXRjaGVzLm1hcChzdyA9PiAoeyAuLi5zdywgaG9zdE5hbWU6IGgubmFtZSB9KSkpIHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRIb3N0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKChzdykgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkSG9zdHMuaW5jbHVkZXMoc3cuaG9zdE5hbWUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjaGVja3BvaW50cyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8uaG9zdHMuZmxhdE1hcChoID0+IGgudmlydHVhbE1hY2hpbmVzLmZsYXRNYXAodm0gPT4gdm0uY2hlY2twb2ludHMubWFwKGNwID0+ICh7IC4uLmNwLCB2bU5hbWU6IHZtLm5hbWUsIGhvc3ROYW1lOiBoLm5hbWUgfSkpKSkgfHwgW107XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZEhvc3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGNwKSA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRIb3N0cy5pbmNsdWRlcyhjcC5ob3N0TmFtZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCBmaWx0ZXJcbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hMb3dlciA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcihpdGVtID0+IEpTT04uc3RyaW5naWZ5KGl0ZW0pLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCBbc3RhdGUucmVzdWx0LCBzdGF0ZS5hY3RpdmVUYWIsIHN0YXRlLmZpbHRlcl0pO1xuICAgIC8vIFN0YXRpc3RpY3MgY2FsY3VsYXRpb25cbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBob3N0cyA9IHN0YXRlLnJlc3VsdC5ob3N0cyB8fCBbXTtcbiAgICAgICAgY29uc3QgYWxsVk1zID0gaG9zdHMuZmxhdE1hcChoID0+IGgudmlydHVhbE1hY2hpbmVzKTtcbiAgICAgICAgY29uc3Qgdm1zQnlTdGF0ZSA9IHtcbiAgICAgICAgICAgIHJ1bm5pbmc6IDAsXG4gICAgICAgICAgICBvZmY6IDAsXG4gICAgICAgICAgICBwYXVzZWQ6IDAsXG4gICAgICAgICAgICBzYXZlZDogMCxcbiAgICAgICAgICAgIHN0YXJ0aW5nOiAwLFxuICAgICAgICAgICAgc3RvcHBpbmc6IDAsXG4gICAgICAgICAgICBzYXZpbmc6IDAsXG4gICAgICAgICAgICBwYXVzaW5nOiAwLFxuICAgICAgICAgICAgcmVzdW1pbmc6IDBcbiAgICAgICAgfTtcbiAgICAgICAgYWxsVk1zLmZvckVhY2godm0gPT4ge1xuICAgICAgICAgICAgdm1zQnlTdGF0ZVt2bS5zdGF0ZV0gPSAodm1zQnlTdGF0ZVt2bS5zdGF0ZV0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdG90YWxNZW1vcnlBbGxvY2F0ZWQgPSBhbGxWTXMucmVkdWNlKChzdW0sIHZtKSA9PiBzdW0gKyAodm0ubWVtb3J5QXNzaWduZWQgfHwgMCksIDApO1xuICAgICAgICBjb25zdCB0b3RhbFZDUFVzID0gYWxsVk1zLnJlZHVjZSgoc3VtLCB2bSkgPT4gc3VtICsgKHZtLmNwdUNvdW50IHx8IDApLCAwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsSG9zdHM6IGhvc3RzLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsVk1zOiBhbGxWTXMubGVuZ3RoLFxuICAgICAgICAgICAgcnVubmluZ1ZNczogdm1zQnlTdGF0ZS5ydW5uaW5nLFxuICAgICAgICAgICAgdm1zQnlTdGF0ZSxcbiAgICAgICAgICAgIHRvdGFsTWVtb3J5QWxsb2NhdGVkLFxuICAgICAgICAgICAgdG90YWxWQ1BVc1xuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5yZXN1bHRdKTtcbiAgICAvLyBVcGRhdGUgY29uZmlnXG4gICAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMgfSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIFVwZGF0ZSBmaWx0ZXJcbiAgICBjb25zdCB1cGRhdGVGaWx0ZXIgPSB1c2VDYWxsYmFjaygodXBkYXRlcykgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGZpbHRlcjogeyAuLi5wcmV2LmZpbHRlciwgLi4udXBkYXRlcyB9IH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gU2V0IGFjdGl2ZSB0YWJcbiAgICBjb25zdCBzZXRBY3RpdmVUYWIgPSB1c2VDYWxsYmFjaygodGFiKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgYWN0aXZlVGFiOiB0YWIgfSkpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICBjb25maWc6IHN0YXRlLmNvbmZpZyxcbiAgICAgICAgcmVzdWx0OiBzdGF0ZS5yZXN1bHQsXG4gICAgICAgIGlzRGlzY292ZXJpbmc6IHN0YXRlLmlzRGlzY292ZXJpbmcsXG4gICAgICAgIHByb2dyZXNzOiBzdGF0ZS5wcm9ncmVzcyxcbiAgICAgICAgYWN0aXZlVGFiOiBzdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgIGZpbHRlcjogc3RhdGUuZmlsdGVyLFxuICAgICAgICBlcnJvcjogc3RhdGUuZXJyb3IsXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgZmlsdGVyZWREYXRhLFxuICAgICAgICBzdGF0cyxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICB1cGRhdGVDb25maWcsXG4gICAgICAgIHVwZGF0ZUZpbHRlcixcbiAgICAgICAgc2V0QWN0aXZlVGFiLFxuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICBleHBvcnRUb0NTVixcbiAgICAgICAgZXhwb3J0VG9FeGNlbFxuICAgIH07XG59O1xuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgZGF0YSB0byBDU1ZcbmZ1bmN0aW9uIGNvbnZlcnRUb0NTVihkYXRhKSB7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgZmxhdHRlbk9iamVjdCA9IChvYmosIHByZWZpeCA9ICcnKSA9PiB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBwcmVmaXggPyBgJHtwcmVmaXh9LiR7a2V5fWAgOiBrZXk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGFjYywgZmxhdHRlbk9iamVjdCh2YWx1ZSwgbmV3S2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgYWNjW25ld0tleV0gPSB2YWx1ZS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWNjW25ld0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9O1xuICAgIGNvbnN0IGZsYXREYXRhID0gKGRhdGEgPz8gW10pLm1hcChpdGVtID0+IGZsYXR0ZW5PYmplY3QoaXRlbSkpO1xuICAgIGNvbnN0IGhlYWRlcnMgPSBPYmplY3Qua2V5cyhmbGF0RGF0YVswXSk7XG4gICAgY29uc3Qgcm93cyA9IGZsYXREYXRhLm1hcChpdGVtID0+IGhlYWRlcnMubWFwKGhlYWRlciA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaXRlbVtoZWFkZXJdO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAodmFsdWUuaW5jbHVkZXMoJywnKSB8fCB2YWx1ZS5pbmNsdWRlcygnXCInKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3ZhbHVlLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KS5qb2luKCcsJykpO1xuICAgIHJldHVybiBbaGVhZGVycy5qb2luKCcsJyksIC4uLnJvd3NdLmpvaW4oJ1xcbicpO1xufVxuIiwiLyoqXG4gKiBEaXNjb3ZlcnkgU3RvcmVcbiAqXG4gKiBNYW5hZ2VzIGRpc2NvdmVyeSBvcGVyYXRpb25zLCByZXN1bHRzLCBhbmQgc3RhdGUuXG4gKiBIYW5kbGVzIGRvbWFpbiwgbmV0d29yaywgdXNlciwgYW5kIGFwcGxpY2F0aW9uIGRpc2NvdmVyeSBwcm9jZXNzZXMuXG4gKi9cbmltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ3p1c3RhbmQnO1xuaW1wb3J0IHsgZGV2dG9vbHMsIHN1YnNjcmliZVdpdGhTZWxlY3RvciB9IGZyb20gJ3p1c3RhbmQvbWlkZGxld2FyZSc7XG5leHBvcnQgY29uc3QgdXNlRGlzY292ZXJ5U3RvcmUgPSBjcmVhdGUoKShkZXZ0b29scyhzdWJzY3JpYmVXaXRoU2VsZWN0b3IoKHNldCwgZ2V0KSA9PiAoe1xuICAgIC8vIEluaXRpYWwgc3RhdGVcbiAgICBvcGVyYXRpb25zOiBuZXcgTWFwKCksXG4gICAgcmVzdWx0czogbmV3IE1hcCgpLFxuICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBudWxsLFxuICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgIC8vIEFjdGlvbnNcbiAgICAvKipcbiAgICAgKiBTdGFydCBhIG5ldyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgc3RhcnREaXNjb3Zlcnk6IGFzeW5jICh0eXBlLCBwYXJhbWV0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3QgY2FuY2VsbGF0aW9uVG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgc3RhdHVzOiAncnVubmluZycsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbml0aWFsaXppbmcgZGlzY292ZXJ5Li4uJyxcbiAgICAgICAgICAgIGl0ZW1zRGlzY292ZXJlZDogMCxcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgb3BlcmF0aW9uIHRvIHN0YXRlXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5zZXQob3BlcmF0aW9uSWQsIG9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2V0dXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NDbGVhbnVwID0gd2luZG93LmVsZWN0cm9uQVBJLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBkYXRhLnBlcmNlbnRhZ2UsIGRhdGEubWVzc2FnZSB8fCAnUHJvY2Vzc2luZy4uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgZGlzY292ZXJ5IG1vZHVsZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IGBNb2R1bGVzL0Rpc2NvdmVyeS8ke3R5cGV9LnBzbTFgLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogYFN0YXJ0LSR7dHlwZX1EaXNjb3ZlcnlgLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDAsIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIENsZWFudXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuY29tcGxldGVEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5kYXRhPy5yZXN1bHRzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5lcnJvciB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCBlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbklkO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGEgcnVubmluZyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgY2FuY2VsRGlzY292ZXJ5OiBhc3luYyAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICBpZiAoIW9wZXJhdGlvbiB8fCBvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihvcGVyYXRpb24uY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnY2FuY2VsbGVkJztcbiAgICAgICAgICAgICAgICAgICAgb3AubWVzc2FnZSA9ICdEaXNjb3ZlcnkgY2FuY2VsbGVkIGJ5IHVzZXInO1xuICAgICAgICAgICAgICAgICAgICBvcC5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHByb2dyZXNzIGZvciBhIHJ1bm5pbmcgb3BlcmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlUHJvZ3Jlc3M6IChvcGVyYXRpb25JZCwgcHJvZ3Jlc3MsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uICYmIG9wZXJhdGlvbi5zdGF0dXMgPT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBjb21wbGV0ZWQgd2l0aCByZXN1bHRzXG4gICAgICovXG4gICAgY29tcGxldGVEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgcmVzdWx0cykgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJlZCAke3Jlc3VsdHMubGVuZ3RofSBpdGVtc2A7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLml0ZW1zRGlzY292ZXJlZCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChvcGVyYXRpb25JZCwgcmVzdWx0cyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgZmFpbGVkXG4gICAgICovXG4gICAgZmFpbERpc2NvdmVyeTogKG9wZXJhdGlvbklkLCBlcnJvcikgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJ5IGZhaWxlZDogJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGEgc2luZ2xlIG9wZXJhdGlvbiBhbmQgaXRzIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhck9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24gPT09IG9wZXJhdGlvbklkID8gbnVsbCA6IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgb3BlcmF0aW9ucyBhbmQgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyQWxsT3BlcmF0aW9uczogKCkgPT4ge1xuICAgICAgICAvLyBPbmx5IGNsZWFyIGNvbXBsZXRlZCwgZmFpbGVkLCBvciBjYW5jZWxsZWQgb3BlcmF0aW9uc1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIG9wZXJhdGlvbl0gb2YgbmV3T3BlcmF0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgZm9yIGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0UmVzdWx0czogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBieSBtb2R1bGUgbmFtZSAoZm9yIHBlcnNpc3RlbnQgcmV0cmlldmFsIGFjcm9zcyBjb21wb25lbnQgcmVtb3VudHMpXG4gICAgICovXG4gICAgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZTogKG1vZHVsZU5hbWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG1vZHVsZU5hbWUpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQWRkIGEgZGlzY292ZXJ5IHJlc3VsdCAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIGFkZFJlc3VsdDogKHJlc3VsdCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0cyA9IG5ld1Jlc3VsdHMuZ2V0KHJlc3VsdC5tb2R1bGVOYW1lKSB8fCBbXTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KHJlc3VsdC5tb2R1bGVOYW1lLCBbLi4uZXhpc3RpbmdSZXN1bHRzLCByZXN1bHRdKTtcbiAgICAgICAgICAgIHJldHVybiB7IHJlc3VsdHM6IG5ld1Jlc3VsdHMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZXQgcHJvZ3Jlc3MgaW5mb3JtYXRpb24gKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBzZXRQcm9ncmVzczogKHByb2dyZXNzRGF0YSkgPT4ge1xuICAgICAgICAvLyBGaW5kIHRoZSBjdXJyZW50IG9wZXJhdGlvbiBmb3IgdGhpcyBtb2R1bGUgYW5kIHVwZGF0ZSBpdFxuICAgICAgICBjb25zdCBvcGVyYXRpb25zID0gZ2V0KCkub3BlcmF0aW9ucztcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBBcnJheS5mcm9tKG9wZXJhdGlvbnMua2V5cygpKS5maW5kKGlkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gb3BlcmF0aW9ucy5nZXQoaWQpO1xuICAgICAgICAgICAgcmV0dXJuIG9wICYmIG9wLnR5cGUgPT09IHByb2dyZXNzRGF0YS5tb2R1bGVOYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wZXJhdGlvbklkKSB7XG4gICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgcHJvZ3Jlc3NEYXRhLm92ZXJhbGxQcm9ncmVzcywgcHJvZ3Jlc3NEYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcbn0pKSwge1xuICAgIG5hbWU6ICdEaXNjb3ZlcnlTdG9yZScsXG59KSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=