"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3730],{

/***/ 63730:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   U: () => (/* binding */ usePowerPlatformDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);

const usePowerPlatformDiscoveryLogic = () => {
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            tenantId: '',
            includeApps: true,
            includeFlows: true,
            includeConnectors: true,
            includeEnvironments: true,
            timeout: 600000
        },
        result: null,
        isDiscovering: false,
        progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0
        },
        activeTab: 'overview',
        filter: {
            searchText: '',
            selectedEnvironments: [],
            selectedAppTypes: [],
            selectedFlowStates: []
        },
        cancellationToken: null,
        error: null
    });
    // IPC progress tracking
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'powerplatform-discovery' && data.token === state.cancellationToken) {
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
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [state.cancellationToken]);
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        const token = `powerplatform-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            error: null,
            cancellationToken: token,
            progress: { current: 0, total: 100, message: 'Starting Power Platform discovery...', percentage: 0 }
        }));
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/PowerPlatformDiscovery.psm1',
                functionName: 'Invoke-PowerPlatformDiscovery',
                parameters: {
                    TenantId: state.config.tenantId,
                    IncludeApps: state.config.includeApps,
                    IncludeFlows: state.config.includeFlows,
                    IncludeConnectors: state.config.includeConnectors,
                    IncludeEnvironments: state.config.includeEnvironments,
                    Timeout: state.config.timeout,
                    CancellationToken: token
                },
                options: {
                    timeout: state.config.timeout,
                    streamOutput: true
                }
            });
            setState(prev => ({
                ...prev,
                result: result.data,
                isDiscovering: false,
                progress: { current: 100, total: 100, message: 'Discovery completed', percentage: 100 }
            }));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                error: error.message || 'Discovery failed',
                progress: { current: 0, total: 100, message: 'Discovery failed', percentage: 0 }
            }));
        }
    }, [state.config]);
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (state.cancellationToken) {
            try {
                await window.electronAPI.cancelExecution(state.cancellationToken);
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    cancellationToken: null,
                    progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
                }));
            }
            catch (error) {
                console.error('Failed to cancel discovery:', error);
            }
        }
    }, [state.cancellationToken]);
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            config: { ...prev.config, ...updates }
        }));
    }, []);
    const setActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);
    const updateFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            filter: { ...prev.filter, ...updates }
        }));
    }, []);
    const clearError = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);
    // Environment columns
    const environmentColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Environment Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'type',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => {
                const type = params.value;
                return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
            }
        },
        {
            field: 'location',
            headerName: 'Location',
            sortable: true,
            filter: true,
            width: 180
        },
        {
            field: 'apps',
            headerName: 'Apps',
            sortable: true,
            filter: true,
            width: 100
        },
        {
            field: 'flows',
            headerName: 'Flows',
            sortable: true,
            filter: true,
            width: 100
        },
        {
            field: 'isDefault',
            headerName: 'Default',
            sortable: true,
            filter: true,
            width: 110,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'createdBy.displayName',
            headerName: 'Created By',
            sortable: true,
            filter: true,
            width: 200,
            valueGetter: (params) => params.data?.createdBy?.displayName || 'Unknown'
        },
        {
            field: 'createdTime',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], []);
    // App columns
    const appColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'App Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'appType',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: (params) => {
                const type = params.value;
                return type === 'canvas' ? 'Canvas' : type === 'model-driven' ? 'Model-Driven' : 'Unknown';
            }
        },
        {
            field: 'owner.displayName',
            headerName: 'Owner',
            sortable: true,
            filter: true,
            width: 200,
            valueGetter: (params) => params.data?.owner?.displayName || 'Unknown'
        },
        {
            field: 'owner.email',
            headerName: 'Owner Email',
            sortable: true,
            filter: true,
            width: 240,
            valueGetter: (params) => params.data?.owner?.email || 'N/A'
        },
        {
            field: 'environmentId',
            headerName: 'Environment',
            sortable: true,
            filter: true,
            width: 200,
            valueGetter: (params) => {
                const envId = params.data?.environmentId;
                if (!envId || !state.result)
                    return envId || 'Unknown';
                const env = state.result.environments?.find(e => e.id === envId);
                return env?.displayName || envId;
            }
        },
        {
            field: 'sharedUsersCount',
            headerName: 'Shared Users',
            sortable: true,
            filter: true,
            width: 140
        },
        {
            field: 'sharedGroupsCount',
            headerName: 'Shared Groups',
            sortable: true,
            filter: true,
            width: 150
        },
        {
            field: 'isFeaturedApp',
            headerName: 'Featured',
            sortable: true,
            filter: true,
            width: 110,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'createdTime',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        },
        {
            field: 'lastModifiedTime',
            headerName: 'Modified',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], [state.result]);
    // Flow columns
    const flowColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Flow Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'triggerType',
            headerName: 'Trigger Type',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: (params) => {
                const type = params.value;
                return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';
            }
        },
        {
            field: 'state',
            headerName: 'State',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: (params) => {
                const state = params.value;
                return state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Unknown';
            }
        },
        {
            field: 'owner.displayName',
            headerName: 'Owner',
            sortable: true,
            filter: true,
            width: 200,
            valueGetter: (params) => params.data?.owner?.displayName || 'Unknown'
        },
        {
            field: 'owner.email',
            headerName: 'Owner Email',
            sortable: true,
            filter: true,
            width: 240,
            valueGetter: (params) => params.data?.owner?.email || 'N/A'
        },
        {
            field: 'environmentId',
            headerName: 'Environment',
            sortable: true,
            filter: true,
            width: 200,
            valueGetter: (params) => {
                const envId = params.data?.environmentId;
                if (!envId || !state.result)
                    return envId || 'Unknown';
                const env = state.result.environments?.find(e => e.id === envId);
                return env?.displayName || envId;
            }
        },
        {
            field: 'runHistory.successCount',
            headerName: 'Success Runs',
            sortable: true,
            filter: true,
            width: 140,
            valueGetter: (params) => params.data?.runHistory?.successCount || 0
        },
        {
            field: 'runHistory.failedCount',
            headerName: 'Failed Runs',
            sortable: true,
            filter: true,
            width: 130,
            valueGetter: (params) => params.data?.runHistory?.failedCount || 0
        },
        {
            field: 'connectionReferences',
            headerName: 'Connections',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: (params) => params.value?.length || 0
        },
        {
            field: 'createdTime',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], [state.result]);
    // Connector columns
    const connectorColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Connector Name',
            sortable: true,
            filter: true,
            width: 280
        },
        {
            field: 'publisher',
            headerName: 'Publisher',
            sortable: true,
            filter: true,
            width: 200
        },
        {
            field: 'tier',
            headerName: 'Tier',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: (params) => {
                const tier = params.value;
                return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Unknown';
            }
        },
        {
            field: 'isCustomApi',
            headerName: 'Custom',
            sortable: true,
            filter: true,
            width: 110,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 400
        }
    ], []);
    // Dynamic columns based on active tab
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'environments':
                return environmentColumns;
            case 'apps':
                return appColumns;
            case 'flows':
                return flowColumns;
            case 'connectors':
                return connectorColumns;
            default:
                return [];
        }
    }, [state.activeTab, environmentColumns, appColumns, flowColumns, connectorColumns]);
    // Filtered data based on active tab and filters
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return [];
        let data = [];
        switch (state.activeTab) {
            case 'environments':
                data = state.result.environments || [];
                break;
            case 'apps':
                data = state.result.apps || [];
                break;
            case 'flows':
                data = state.result.flows || [];
                break;
            case 'connectors':
                data = state.result.connectors || [];
                break;
            default:
                return [];
        }
        // Apply filters
        if (state.activeTab === 'apps') {
            const apps = data;
            let filtered = apps;
            if (state.filter.searchText) {
                const search = state.filter.searchText.toLowerCase();
                filtered = filtered.filter(a => a.displayName?.toLowerCase().includes(search) ||
                    a.owner?.displayName?.toLowerCase().includes(search) ||
                    a.owner?.email?.toLowerCase().includes(search));
            }
            if (state.filter.selectedEnvironments.length > 0) {
                filtered = filtered.filter(a => state.filter.selectedEnvironments.includes(a.environmentId));
            }
            if (state.filter.selectedAppTypes.length > 0) {
                filtered = filtered.filter(a => state.filter.selectedAppTypes.includes(a.appType));
            }
            return filtered;
        }
        if (state.activeTab === 'flows') {
            const flows = data;
            let filtered = flows;
            if (state.filter.searchText) {
                const search = state.filter.searchText.toLowerCase();
                filtered = filtered.filter(f => f.displayName?.toLowerCase().includes(search) ||
                    f.owner?.displayName?.toLowerCase().includes(search) ||
                    f.owner?.email?.toLowerCase().includes(search));
            }
            if (state.filter.selectedEnvironments.length > 0) {
                filtered = filtered.filter(f => state.filter.selectedEnvironments.includes(f.environmentId));
            }
            if (state.filter.selectedFlowStates.length > 0) {
                filtered = filtered.filter(f => state.filter.selectedFlowStates.includes(f.state));
            }
            return filtered;
        }
        // For other tabs, just apply search filter
        if (state.filter.searchText) {
            const search = state.filter.searchText.toLowerCase();
            return (data ?? []).filter((item) => JSON.stringify(item).toLowerCase().includes(search));
        }
        return data;
    }, [state.result, state.activeTab, state.filter]);
    // Statistics
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const environments = state.result.environments || [];
        const apps = state.result.apps || [];
        const flows = state.result.flows || [];
        const connectors = state.result.connectors || [];
        const appsByType = {};
        const flowsByState = {};
        const environmentsByType = {};
        const appOwnerCounts = {};
        const flowOwnerCounts = {};
        let totalSuccessRuns = 0;
        let totalFailedRuns = 0;
        environments.forEach(env => {
            const type = env.type || 'Unknown';
            environmentsByType[type] = (environmentsByType[type] || 0) + 1;
        });
        apps.forEach(app => {
            const type = app.appType || 'Unknown';
            appsByType[type] = (appsByType[type] || 0) + 1;
            const owner = app.owner?.displayName || 'Unknown';
            appOwnerCounts[owner] = (appOwnerCounts[owner] || 0) + 1;
        });
        flows.forEach(flow => {
            const state = flow.state || 'Unknown';
            flowsByState[state] = (flowsByState[state] || 0) + 1;
            const owner = flow.owner?.displayName || 'Unknown';
            flowOwnerCounts[owner] = (flowOwnerCounts[owner] || 0) + 1;
            if (flow.runHistory) {
                totalSuccessRuns += flow.runHistory.successCount || 0;
                totalFailedRuns += flow.runHistory.failedCount || 0;
            }
        });
        const topAppOwners = Object.entries(appOwnerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([owner, count]) => ({ owner, count }));
        const topFlowOwners = Object.entries(flowOwnerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([owner, count]) => ({ owner, count }));
        return {
            totalEnvironments: environments.length,
            totalApps: apps.length,
            totalFlows: flows.length,
            totalConnectors: connectors.length,
            appsByType,
            flowsByState,
            environmentsByType,
            topAppOwners,
            topFlowOwners,
            flowRunStats: { successCount: totalSuccessRuns, failedCount: totalFailedRuns }
        };
    }, [state.result]);
    // CSV Export
    const exportToCSV = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        const flattenObject = (obj, prefix = '') => {
            const flattened = {};
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (value === null || value === undefined) {
                    flattened[newKey] = '';
                }
                else if (value instanceof Date) {
                    flattened[newKey] = value.toISOString();
                }
                else if (Array.isArray(value)) {
                    flattened[newKey] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('; ');
                }
                else if (typeof value === 'object') {
                    Object.assign(flattened, flattenObject(value, newKey));
                }
                else {
                    flattened[newKey] = value;
                }
            });
            return flattened;
        };
        const flattenedData = (data ?? []).map(item => flattenObject(item));
        const headers = Object.keys(flattenedData[0]);
        const csvContent = [
            headers.join(','),
            ...flattenedData.map(row => headers.map(header => {
                const value = row[header];
                const stringValue = value?.toString() || '';
                return stringValue.includes(',') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }, []);
    // Excel Export
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportToExcel.psm1',
                functionName: 'Export-PowerPlatformData',
                parameters: {
                    Data: data,
                    SheetName: state.activeTab,
                    FileName: filename
                }
            });
        }
        catch (error) {
            console.error('Excel export failed:', error);
            alert('Excel export failed: ' + error.message);
        }
    }, [state.activeTab]);
    return {
        // State
        config: state.config,
        result: state.result,
        currentResult: state.result,
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
        startDiscovery,
        cancelDiscovery,
        updateConfig,
        setActiveTab,
        updateFilter,
        clearError,
        exportToCSV,
        exportToExcel
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qiw4Q0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsOENBQU87QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsOENBQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EseUJBQXlCLDhDQUFPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGtCQUFrQiw4Q0FBTztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsY0FBYztBQUN0RDtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsY0FBYztBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBLEtBQUs7QUFDTDtBQUNBLHdCQUF3QixrREFBVztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLE9BQU8sR0FBRyxJQUFJO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEdBQThHO0FBQzlHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGdDQUFnQztBQUMxRDtBQUNBLGFBQWE7QUFDYjtBQUNBLDhDQUE4QyxnQkFBZ0IsY0FBYyxHQUFHO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsMEJBQTBCLGtEQUFXO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VQb3dlclBsYXRmb3JtRGlzY292ZXJ5TG9naWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5leHBvcnQgY29uc3QgdXNlUG93ZXJQbGF0Zm9ybURpc2NvdmVyeUxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIHRlbmFudElkOiAnJyxcbiAgICAgICAgICAgIGluY2x1ZGVBcHBzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUZsb3dzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUNvbm5lY3RvcnM6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlRW52aXJvbm1lbnRzOiB0cnVlLFxuICAgICAgICAgICAgdGltZW91dDogNjAwMDAwXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgICBjdXJyZW50OiAwLFxuICAgICAgICAgICAgdG90YWw6IDEwMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICcnLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogMFxuICAgICAgICB9LFxuICAgICAgICBhY3RpdmVUYWI6ICdvdmVydmlldycsXG4gICAgICAgIGZpbHRlcjoge1xuICAgICAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgICAgICAgICBzZWxlY3RlZEVudmlyb25tZW50czogW10sXG4gICAgICAgICAgICBzZWxlY3RlZEFwcFR5cGVzOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkRmxvd1N0YXRlczogW11cbiAgICAgICAgfSxcbiAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgfSk7XG4gICAgLy8gSVBDIHByb2dyZXNzIHRyYWNraW5nXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSB3aW5kb3cuZWxlY3Ryb25BUEk/Lm9uUHJvZ3Jlc3M/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ3Bvd2VycGxhdGZvcm0tZGlzY292ZXJ5JyAmJiBkYXRhLnRva2VuID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGRhdGEuY3VycmVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGRhdGEudG90YWwgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wZXJjZW50YWdlIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW5dKTtcbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBgcG93ZXJwbGF0Zm9ybS1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ1N0YXJ0aW5nIFBvd2VyIFBsYXRmb3JtIGRpc2NvdmVyeS4uLicsIHBlcmNlbnRhZ2U6IDAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L1Bvd2VyUGxhdGZvcm1EaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLVBvd2VyUGxhdGZvcm1EaXNjb3ZlcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgVGVuYW50SWQ6IHN0YXRlLmNvbmZpZy50ZW5hbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUFwcHM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQXBwcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUZsb3dzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUZsb3dzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlQ29ubmVjdG9yczogc3RhdGUuY29uZmlnLmluY2x1ZGVDb25uZWN0b3JzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlRW52aXJvbm1lbnRzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUVudmlyb25tZW50cyxcbiAgICAgICAgICAgICAgICAgICAgVGltZW91dDogc3RhdGUuY29uZmlnLnRpbWVvdXQsXG4gICAgICAgICAgICAgICAgICAgIENhbmNlbGxhdGlvblRva2VuOiB0b2tlblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiBzdGF0ZS5jb25maWcudGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICByZXN1bHQ6IHJlc3VsdC5kYXRhLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDEwMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ0Rpc2NvdmVyeSBjb21wbGV0ZWQnLCBwZXJjZW50YWdlOiAxMDAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdEaXNjb3ZlcnkgZmFpbGVkJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuY29uZmlnXSk7XG4gICAgY29uc3QgY2FuY2VsRGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdEaXNjb3ZlcnkgY2FuY2VsbGVkJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmNhbmNlbGxhdGlvblRva2VuXSk7XG4gICAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGNvbmZpZzogeyAuLi5wcmV2LmNvbmZpZywgLi4udXBkYXRlcyB9XG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3Qgc2V0QWN0aXZlVGFiID0gdXNlQ2FsbGJhY2soKHRhYikgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGFjdGl2ZVRhYjogdGFiIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGZpbHRlcjogeyAuLi5wcmV2LmZpbHRlciwgLi4udXBkYXRlcyB9XG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgY2xlYXJFcnJvciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBlcnJvcjogbnVsbCB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIEVudmlyb25tZW50IGNvbHVtbnNcbiAgICBjb25zdCBlbnZpcm9ubWVudENvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW52aXJvbm1lbnQgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyNTBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0eXBlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZSA9IHBhcmFtcy52YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZSA/IHR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eXBlLnNsaWNlKDEpIDogJ1Vua25vd24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2xvY2F0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMb2NhdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxODBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdhcHBzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBcHBzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Zsb3dzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdGbG93cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpc0RlZmF1bHQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0RlZmF1bHQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NyZWF0ZWRCeS5kaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ3JlYXRlZCBCeScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/LmNyZWF0ZWRCeT8uZGlzcGxheU5hbWUgfHwgJ1Vua25vd24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY3JlYXRlZFRpbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gQXBwIGNvbHVtbnNcbiAgICBjb25zdCBhcHBDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzcGxheU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FwcCBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI1MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FwcFR5cGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlID09PSAnY2FudmFzJyA/ICdDYW52YXMnIDogdHlwZSA9PT0gJ21vZGVsLWRyaXZlbicgPyAnTW9kZWwtRHJpdmVuJyA6ICdVbmtub3duJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdvd25lci5kaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnT3duZXInLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhPy5vd25lcj8uZGlzcGxheU5hbWUgfHwgJ1Vua25vd24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnb3duZXIuZW1haWwnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ093bmVyIEVtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI0MCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8ub3duZXI/LmVtYWlsIHx8ICdOL0EnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZW52aXJvbm1lbnRJZCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW52aXJvbm1lbnQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnZJZCA9IHBhcmFtcy5kYXRhPy5lbnZpcm9ubWVudElkO1xuICAgICAgICAgICAgICAgIGlmICghZW52SWQgfHwgIXN0YXRlLnJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVudklkIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgICAgICBjb25zdCBlbnYgPSBzdGF0ZS5yZXN1bHQuZW52aXJvbm1lbnRzPy5maW5kKGUgPT4gZS5pZCA9PT0gZW52SWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbnY/LmRpc3BsYXlOYW1lIHx8IGVudklkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3NoYXJlZFVzZXJzQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NoYXJlZCBVc2VycycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzaGFyZWRHcm91cHNDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU2hhcmVkIEdyb3VwcycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNTBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpc0ZlYXR1cmVkQXBwJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdGZWF0dXJlZCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY3JlYXRlZFRpbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdE1vZGlmaWVkVGltZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTW9kaWZpZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH1cbiAgICBdLCBbc3RhdGUucmVzdWx0XSk7XG4gICAgLy8gRmxvdyBjb2x1bW5zXG4gICAgY29uc3QgZmxvd0NvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRmxvdyBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI1MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3RyaWdnZXJUeXBlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUcmlnZ2VyIFR5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlID8gdHlwZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR5cGUuc2xpY2UoMSkgOiAnVW5rbm93bic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXRlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlID8gc3RhdGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0ZS5zbGljZSgxKSA6ICdVbmtub3duJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdvd25lci5kaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnT3duZXInLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhPy5vd25lcj8uZGlzcGxheU5hbWUgfHwgJ1Vua25vd24nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnb3duZXIuZW1haWwnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ093bmVyIEVtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI0MCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8ub3duZXI/LmVtYWlsIHx8ICdOL0EnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZW52aXJvbm1lbnRJZCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW52aXJvbm1lbnQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnZJZCA9IHBhcmFtcy5kYXRhPy5lbnZpcm9ubWVudElkO1xuICAgICAgICAgICAgICAgIGlmICghZW52SWQgfHwgIXN0YXRlLnJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVudklkIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgICAgICBjb25zdCBlbnYgPSBzdGF0ZS5yZXN1bHQuZW52aXJvbm1lbnRzPy5maW5kKGUgPT4gZS5pZCA9PT0gZW52SWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbnY/LmRpc3BsYXlOYW1lIHx8IGVudklkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3J1bkhpc3Rvcnkuc3VjY2Vzc0NvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdWNjZXNzIFJ1bnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhPy5ydW5IaXN0b3J5Py5zdWNjZXNzQ291bnQgfHwgMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3J1bkhpc3RvcnkuZmFpbGVkQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0ZhaWxlZCBSdW5zJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8ucnVuSGlzdG9yeT8uZmFpbGVkQ291bnQgfHwgMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Nvbm5lY3Rpb25SZWZlcmVuY2VzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb25uZWN0aW9ucycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlPy5sZW5ndGggfHwgMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NyZWF0ZWRUaW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICB9XG4gICAgXSwgW3N0YXRlLnJlc3VsdF0pO1xuICAgIC8vIENvbm5lY3RvciBjb2x1bW5zXG4gICAgY29uc3QgY29ubmVjdG9yQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb25uZWN0b3IgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyODBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdwdWJsaXNoZXInLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1B1Ymxpc2hlcicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyMDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0aWVyJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUaWVyJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGllciA9IHBhcmFtcy52YWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGllciA/IHRpZXIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aWVyLnNsaWNlKDEpIDogJ1Vua25vd24nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2lzQ3VzdG9tQXBpJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDdXN0b20nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiA0MDBcbiAgICAgICAgfVxuICAgIF0sIFtdKTtcbiAgICAvLyBEeW5hbWljIGNvbHVtbnMgYmFzZWQgb24gYWN0aXZlIHRhYlxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Vudmlyb25tZW50cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudmlyb25tZW50Q29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2FwcHMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhcHBDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAnZmxvd3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiBmbG93Q29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RvcnMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0b3JDb2x1bW5zO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuYWN0aXZlVGFiLCBlbnZpcm9ubWVudENvbHVtbnMsIGFwcENvbHVtbnMsIGZsb3dDb2x1bW5zLCBjb25uZWN0b3JDb2x1bW5zXSk7XG4gICAgLy8gRmlsdGVyZWQgZGF0YSBiYXNlZCBvbiBhY3RpdmUgdGFiIGFuZCBmaWx0ZXJzXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgZGF0YSA9IFtdO1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgY2FzZSAnZW52aXJvbm1lbnRzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmVudmlyb25tZW50cyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FwcHMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5yZXN1bHQuYXBwcyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Zsb3dzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmZsb3dzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29ubmVjdG9ycyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdC5jb25uZWN0b3JzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyc1xuICAgICAgICBpZiAoc3RhdGUuYWN0aXZlVGFiID09PSAnYXBwcycpIHtcbiAgICAgICAgICAgIGNvbnN0IGFwcHMgPSBkYXRhO1xuICAgICAgICAgICAgbGV0IGZpbHRlcmVkID0gYXBwcztcbiAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoYSA9PiBhLmRpc3BsYXlOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAgICAgYS5vd25lcj8uZGlzcGxheU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICBhLm93bmVyPy5lbWFpbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRFbnZpcm9ubWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKGEgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkRW52aXJvbm1lbnRzLmluY2x1ZGVzKGEuZW52aXJvbm1lbnRJZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZEFwcFR5cGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihhID0+IHN0YXRlLmZpbHRlci5zZWxlY3RlZEFwcFR5cGVzLmluY2x1ZGVzKGEuYXBwVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZS5hY3RpdmVUYWIgPT09ICdmbG93cycpIHtcbiAgICAgICAgICAgIGNvbnN0IGZsb3dzID0gZGF0YTtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJlZCA9IGZsb3dzO1xuICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihmID0+IGYuZGlzcGxheU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICBmLm93bmVyPy5kaXNwbGF5TmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgIGYub3duZXI/LmVtYWlsPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZEVudmlyb25tZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRFbnZpcm9ubWVudHMuaW5jbHVkZXMoZi5lbnZpcm9ubWVudElkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlbGVjdGVkRmxvd1N0YXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZiA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRGbG93U3RhdGVzLmluY2x1ZGVzKGYuc3RhdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3Igb3RoZXIgdGFicywganVzdCBhcHBseSBzZWFyY2ggZmlsdGVyXG4gICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiAoZGF0YSA/PyBbXSkuZmlsdGVyKChpdGVtKSA9PiBKU09OLnN0cmluZ2lmeShpdGVtKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYiwgc3RhdGUuZmlsdGVyXSk7XG4gICAgLy8gU3RhdGlzdGljc1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGVudmlyb25tZW50cyA9IHN0YXRlLnJlc3VsdC5lbnZpcm9ubWVudHMgfHwgW107XG4gICAgICAgIGNvbnN0IGFwcHMgPSBzdGF0ZS5yZXN1bHQuYXBwcyB8fCBbXTtcbiAgICAgICAgY29uc3QgZmxvd3MgPSBzdGF0ZS5yZXN1bHQuZmxvd3MgfHwgW107XG4gICAgICAgIGNvbnN0IGNvbm5lY3RvcnMgPSBzdGF0ZS5yZXN1bHQuY29ubmVjdG9ycyB8fCBbXTtcbiAgICAgICAgY29uc3QgYXBwc0J5VHlwZSA9IHt9O1xuICAgICAgICBjb25zdCBmbG93c0J5U3RhdGUgPSB7fTtcbiAgICAgICAgY29uc3QgZW52aXJvbm1lbnRzQnlUeXBlID0ge307XG4gICAgICAgIGNvbnN0IGFwcE93bmVyQ291bnRzID0ge307XG4gICAgICAgIGNvbnN0IGZsb3dPd25lckNvdW50cyA9IHt9O1xuICAgICAgICBsZXQgdG90YWxTdWNjZXNzUnVucyA9IDA7XG4gICAgICAgIGxldCB0b3RhbEZhaWxlZFJ1bnMgPSAwO1xuICAgICAgICBlbnZpcm9ubWVudHMuZm9yRWFjaChlbnYgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGVudi50eXBlIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgIGVudmlyb25tZW50c0J5VHlwZVt0eXBlXSA9IChlbnZpcm9ubWVudHNCeVR5cGVbdHlwZV0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcbiAgICAgICAgYXBwcy5mb3JFYWNoKGFwcCA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gYXBwLmFwcFR5cGUgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgYXBwc0J5VHlwZVt0eXBlXSA9IChhcHBzQnlUeXBlW3R5cGVdIHx8IDApICsgMTtcbiAgICAgICAgICAgIGNvbnN0IG93bmVyID0gYXBwLm93bmVyPy5kaXNwbGF5TmFtZSB8fCAnVW5rbm93bic7XG4gICAgICAgICAgICBhcHBPd25lckNvdW50c1tvd25lcl0gPSAoYXBwT3duZXJDb3VudHNbb3duZXJdIHx8IDApICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZsb3dzLmZvckVhY2goZmxvdyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IGZsb3cuc3RhdGUgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgZmxvd3NCeVN0YXRlW3N0YXRlXSA9IChmbG93c0J5U3RhdGVbc3RhdGVdIHx8IDApICsgMTtcbiAgICAgICAgICAgIGNvbnN0IG93bmVyID0gZmxvdy5vd25lcj8uZGlzcGxheU5hbWUgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgZmxvd093bmVyQ291bnRzW293bmVyXSA9IChmbG93T3duZXJDb3VudHNbb3duZXJdIHx8IDApICsgMTtcbiAgICAgICAgICAgIGlmIChmbG93LnJ1bkhpc3RvcnkpIHtcbiAgICAgICAgICAgICAgICB0b3RhbFN1Y2Nlc3NSdW5zICs9IGZsb3cucnVuSGlzdG9yeS5zdWNjZXNzQ291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICB0b3RhbEZhaWxlZFJ1bnMgKz0gZmxvdy5ydW5IaXN0b3J5LmZhaWxlZENvdW50IHx8IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB0b3BBcHBPd25lcnMgPSBPYmplY3QuZW50cmllcyhhcHBPd25lckNvdW50cylcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiWzFdIC0gYVsxXSlcbiAgICAgICAgICAgIC5zbGljZSgwLCA1KVxuICAgICAgICAgICAgLm1hcCgoW293bmVyLCBjb3VudF0pID0+ICh7IG93bmVyLCBjb3VudCB9KSk7XG4gICAgICAgIGNvbnN0IHRvcEZsb3dPd25lcnMgPSBPYmplY3QuZW50cmllcyhmbG93T3duZXJDb3VudHMpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgICAgICAgICAuc2xpY2UoMCwgNSlcbiAgICAgICAgICAgIC5tYXAoKFtvd25lciwgY291bnRdKSA9PiAoeyBvd25lciwgY291bnQgfSkpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxFbnZpcm9ubWVudHM6IGVudmlyb25tZW50cy5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbEFwcHM6IGFwcHMubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxGbG93czogZmxvd3MubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxDb25uZWN0b3JzOiBjb25uZWN0b3JzLmxlbmd0aCxcbiAgICAgICAgICAgIGFwcHNCeVR5cGUsXG4gICAgICAgICAgICBmbG93c0J5U3RhdGUsXG4gICAgICAgICAgICBlbnZpcm9ubWVudHNCeVR5cGUsXG4gICAgICAgICAgICB0b3BBcHBPd25lcnMsXG4gICAgICAgICAgICB0b3BGbG93T3duZXJzLFxuICAgICAgICAgICAgZmxvd1J1blN0YXRzOiB7IHN1Y2Nlc3NDb3VudDogdG90YWxTdWNjZXNzUnVucywgZmFpbGVkQ291bnQ6IHRvdGFsRmFpbGVkUnVucyB9XG4gICAgICAgIH07XG4gICAgfSwgW3N0YXRlLnJlc3VsdF0pO1xuICAgIC8vIENTViBFeHBvcnRcbiAgICBjb25zdCBleHBvcnRUb0NTViA9IHVzZUNhbGxiYWNrKChkYXRhLCBmaWxlbmFtZSkgPT4ge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFsZXJ0KCdObyBkYXRhIHRvIGV4cG9ydCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZsYXR0ZW5PYmplY3QgPSAob2JqLCBwcmVmaXggPSAnJykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmxhdHRlbmVkID0ge307XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtrZXl9YCA6IGtleTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBmbGF0dGVuZWRbbmV3S2V5XSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhdHRlbmVkW25ld0tleV0gPSB2YWx1ZS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBmbGF0dGVuZWRbbmV3S2V5XSA9IHZhbHVlLm1hcCh2ID0+IHR5cGVvZiB2ID09PSAnb2JqZWN0JyA/IEpTT04uc3RyaW5naWZ5KHYpIDogdikuam9pbignOyAnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGZsYXR0ZW5lZCwgZmxhdHRlbk9iamVjdCh2YWx1ZSwgbmV3S2V5KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmbGF0dGVuZWRbbmV3S2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZsYXR0ZW5lZDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZmxhdHRlbmVkRGF0YSA9IChkYXRhID8/IFtdKS5tYXAoaXRlbSA9PiBmbGF0dGVuT2JqZWN0KGl0ZW0pKTtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IE9iamVjdC5rZXlzKGZsYXR0ZW5lZERhdGFbMF0pO1xuICAgICAgICBjb25zdCBjc3ZDb250ZW50ID0gW1xuICAgICAgICAgICAgaGVhZGVycy5qb2luKCcsJyksXG4gICAgICAgICAgICAuLi5mbGF0dGVuZWREYXRhLm1hcChyb3cgPT4gaGVhZGVycy5tYXAoaGVhZGVyID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJvd1toZWFkZXJdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ1ZhbHVlID0gdmFsdWU/LnRvU3RyaW5nKCkgfHwgJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1ZhbHVlLmluY2x1ZGVzKCcsJykgfHwgc3RyaW5nVmFsdWUuaW5jbHVkZXMoJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgPyBgXCIke3N0cmluZ1ZhbHVlLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgXG4gICAgICAgICAgICAgICAgICAgIDogc3RyaW5nVmFsdWU7XG4gICAgICAgICAgICB9KS5qb2luKCcsJykpXG4gICAgICAgIF0uam9pbignXFxuJyk7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY3N2Q29udGVudF0sIHsgdHlwZTogJ3RleHQvY3N2O2NoYXJzZXQ9dXRmLTg7JyB9KTtcbiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEV4Y2VsIEV4cG9ydFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoZGF0YSwgZmlsZW5hbWUpID0+IHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhbGVydCgnTm8gZGF0YSB0byBleHBvcnQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0V4cG9ydC9FeHBvcnRUb0V4Y2VsLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1Qb3dlclBsYXRmb3JtRGF0YScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBEYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICBTaGVldE5hbWU6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgICAgICAgICAgICAgRmlsZU5hbWU6IGZpbGVuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlbCBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIGFsZXJ0KCdFeGNlbCBleHBvcnQgZmFpbGVkOiAnICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuYWN0aXZlVGFiXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgIHJlc3VsdDogc3RhdGUucmVzdWx0LFxuICAgICAgICBjdXJyZW50UmVzdWx0OiBzdGF0ZS5yZXN1bHQsXG4gICAgICAgIGlzRGlzY292ZXJpbmc6IHN0YXRlLmlzRGlzY292ZXJpbmcsXG4gICAgICAgIHByb2dyZXNzOiBzdGF0ZS5wcm9ncmVzcyxcbiAgICAgICAgYWN0aXZlVGFiOiBzdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgIGZpbHRlcjogc3RhdGUuZmlsdGVyLFxuICAgICAgICBlcnJvcjogc3RhdGUuZXJyb3IsXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgZmlsdGVyZWREYXRhLFxuICAgICAgICBzdGF0cyxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICB1cGRhdGVDb25maWcsXG4gICAgICAgIHNldEFjdGl2ZVRhYixcbiAgICAgICAgdXBkYXRlRmlsdGVyLFxuICAgICAgICBjbGVhckVycm9yLFxuICAgICAgICBleHBvcnRUb0NTVixcbiAgICAgICAgZXhwb3J0VG9FeGNlbFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9