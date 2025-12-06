"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2908],{

/***/ 2908:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   U: () => (/* binding */ useGoogleWorkspaceDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33813);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92856);
/* harmony import */ var _lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(58350);
/**
 * Google Workspace Discovery Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for Google Workspace discovery
 * NO PLACEHOLDERS - Complete implementation with Users, Groups, Gmail, Drive, Calendar
 */




const useGoogleWorkspaceDiscoveryLogic = () => {
    // Get selected company profile from store
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K)((state) => state.selectedSourceProfile);
    const { getResultsByModuleName } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__/* .useDiscoveryStore */ .R)();
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            serviceTypes: ['users', 'groups', 'gmail', 'drive'],
            includeUserDetails: true,
            includeGroupMembership: true,
            includeMailboxSize: true,
            includeDriveUsage: true,
            includeCalendarDetails: false,
            timeout: 300000
        },
        result: null,
        isDiscovering: false,
        progress: { current: 0, total: 100, message: '', percentage: 0 },
        activeTab: 'overview',
        filter: {
            searchText: '',
            selectedOrgUnits: [],
            selectedStatuses: [],
            selectedServiceTypes: [],
            showOnlyAdmins: false
        },
        cancellationToken: null,
        error: null
    });
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('GoogleWorkspaceDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[GoogleWorkspaceDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setState(prev => ({ ...prev, result: latestResult }));
        }
    }, [getResultsByModuleName]);
    // Real-time progress tracking via IPC
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    progress: {
                        current: data.itemsProcessed || 0,
                        total: data.totalItems || 100,
                        message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
                        percentage: data.percentage || 0
                    }
                }));
            }
        });
        const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
            // Handle output if needed
        });
        const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    result: data.result,
                    isDiscovering: false,
                    cancellationToken: null,
                    progress: { current: 100, total: 100, message: 'Discovery completed', percentage: 100 }
                }));
            }
        });
        const unsubscribeError = window.electron.onDiscoveryError((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    cancellationToken: null,
                    error: data.error,
                    progress: { current: 0, total: 100, message: 'Error occurred', percentage: 0 }
                }));
            }
        });
        return () => {
            if (unsubscribeProgress)
                unsubscribeProgress();
            if (unsubscribeOutput)
                unsubscribeOutput();
            if (unsubscribeComplete)
                unsubscribeComplete();
            if (unsubscribeError)
                unsubscribeError();
        };
    }, [state.cancellationToken]);
    // Start discovery
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        // Check if a profile is selected
        if (!selectedSourceProfile) {
            setState(prev => ({
                ...prev,
                error: 'No company profile selected. Please select a profile first.',
            }));
            return;
        }
        const token = `google-workspace-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[GoogleWorkspaceDiscoveryHook] Starting Google Workspace discovery for company: ${selectedSourceProfile.companyName}`);
        console.log(`[GoogleWorkspaceDiscoveryHook] Parameters:`, {
            serviceTypes: state.config.serviceTypes,
            includeUserDetails: state.config.includeUserDetails,
            includeGroupMembership: state.config.includeGroupMembership,
            includeMailboxSize: state.config.includeMailboxSize,
            includeDriveUsage: state.config.includeDriveUsage,
            includeCalendarDetails: state.config.includeCalendarDetails,
        });
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            cancellationToken: token,
            error: null,
            progress: { current: 0, total: 100, message: 'Initializing Google Workspace discovery...', percentage: 0 }
        }));
        try {
            const electronAPI = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__/* .getElectronAPI */ .d)();
            // Execute discovery module with credentials from the profile
            const result = await electronAPI.executeDiscoveryModule('GoogleWorkspace', selectedSourceProfile.companyName, {
                ServiceTypes: state.config.serviceTypes,
                IncludeUserDetails: state.config.includeUserDetails,
                IncludeGroupMembership: state.config.includeGroupMembership,
                IncludeMailboxSize: state.config.includeMailboxSize,
                IncludeDriveUsage: state.config.includeDriveUsage,
                IncludeCalendarDetails: state.config.includeCalendarDetails,
                OrgUnits: state.config.orgUnits,
            }, {
                timeout: state.config.timeout || 300000,
            });
            if (result.success) {
                console.log(`[GoogleWorkspaceDiscoveryHook] ✅ Google Workspace discovery completed successfully`);
            }
            else {
                console.error(`[GoogleWorkspaceDiscoveryHook] ❌ Google Workspace discovery failed:`, result.error);
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    cancellationToken: null,
                    error: result.error || 'Discovery failed',
                    progress: { current: 0, total: 100, message: 'Error occurred', percentage: 0 }
                }));
            }
        }
        catch (error) {
            console.error('[GoogleWorkspaceDiscoveryHook] Error:', error);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                cancellationToken: null,
                error: error.message || 'Discovery failed'
            }));
        }
    }, [state.config, selectedSourceProfile]);
    // Cancel discovery
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (state.cancellationToken) {
            try {
                await window.electron.cancelDiscovery(state.cancellationToken);
            }
            catch (error) {
                console.error('Failed to cancel discovery:', error);
            }
        }
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
                case 'users':
                    data = state.result.users;
                    break;
                case 'groups':
                    data = state.result.groups;
                    break;
                case 'gmail':
                    data = state.result.gmailData?.largestMailboxes || [];
                    break;
                case 'drive':
                    data = state.result.driveData?.largestUsers || [];
                    break;
                case 'calendar':
                    data = state.result.calendarData?.topUsers || [];
                    break;
                case 'licenses':
                    data = state.result.licenseInfo;
                    break;
            }
            const csvData = convertToCSV(data);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `google-workspace-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
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
                functionName: 'Export-GoogleWorkspaceData',
                parameters: {
                    data: state.result,
                    tab: state.activeTab,
                    filename: `google-workspace-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
                }
            });
        }
        catch (error) {
            console.error('Excel export failed:', error);
        }
    }, [state.result, state.activeTab]);
    // Users columns
    const usersColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'primaryEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
        { field: 'name.fullName', headerName: 'Name', sortable: true, filter: true, width: 250 },
        { field: 'isAdmin', headerName: 'Admin', sortable: true, filter: true, width: 100,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'suspended', headerName: 'Suspended', sortable: true, filter: true, width: 120,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'orgUnitPath', headerName: 'Org Unit', sortable: true, filter: true, width: 250 },
        { field: 'mailboxSize', headerName: 'Mailbox Size', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
        { field: 'driveUsage', headerName: 'Drive Usage', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` : 'N/A' },
        { field: 'lastLoginTime', headerName: 'Last Login', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never' },
        { field: 'twoStepVerificationEnrolled', headerName: '2FA', sortable: true, filter: true, width: 80,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' }
    ], []);
    // Groups columns
    const groupsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'email', headerName: 'Email', sortable: true, filter: true, width: 300 },
        { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 250 },
        { field: 'description', headerName: 'Description', sortable: true, filter: true, width: 300 },
        { field: 'directMembersCount', headerName: 'Members', sortable: true, filter: true, width: 120 },
        { field: 'adminCreated', headerName: 'Admin Created', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'settings.allowExternalMembers', headerName: 'External Members', sortable: true, filter: true, width: 160,
            valueFormatter: (params) => params.value ? 'Allowed' : 'Not Allowed' },
        { field: 'settings.whoCanPostMessage', headerName: 'Who Can Post', sortable: true, filter: true, width: 180 }
    ], []);
    // Gmail columns
    const gmailColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
        { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
        { field: 'size', headerName: 'Mailbox Size', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` },
        { field: 'messageCount', headerName: 'Messages', sortable: true, filter: true, width: 120,
            valueFormatter: (params) => params.value?.toLocaleString() || 'N/A' },
        { field: 'lastActivityTime', headerName: 'Last Activity', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' }
    ], []);
    // Drive columns
    const driveColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
        { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
        { field: 'storageUsed', headerName: 'Storage Used', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => `${(params.value / 1024 / 1024 / 1024).toFixed(2)} GB` },
        { field: 'fileCount', headerName: 'Files', sortable: true, filter: true, width: 120,
            valueFormatter: (params) => params.value?.toLocaleString() || '0' },
        { field: 'sharedFileCount', headerName: 'Shared Files', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value?.toLocaleString() || '0' },
        { field: 'lastActivityTime', headerName: 'Last Activity', sortable: true, filter: true, width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A' }
    ], []);
    // Calendar columns
    const calendarColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'userEmail', headerName: 'Email', sortable: true, filter: true, width: 300 },
        { field: 'userName', headerName: 'Name', sortable: true, filter: true, width: 250 },
        { field: 'calendarCount', headerName: 'Calendars', sortable: true, filter: true, width: 120 },
        { field: 'eventCount', headerName: 'Events', sortable: true, filter: true, width: 120,
            valueFormatter: (params) => params.value?.toLocaleString() || 'N/A' },
        { field: 'sharedCalendars', headerName: 'Shared', sortable: true, filter: true, width: 120 }
    ], []);
    // Licenses columns
    const licensesColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'skuName', headerName: 'License SKU', sortable: true, filter: true, width: 300 },
        { field: 'productName', headerName: 'Product', sortable: true, filter: true, width: 250 },
        { field: 'assignedLicenses', headerName: 'Assigned', sortable: true, filter: true, width: 120 },
        { field: 'availableLicenses', headerName: 'Available', sortable: true, filter: true, width: 120 },
        { field: 'utilization', headerName: 'Utilization', sortable: true, filter: true, width: 150,
            valueGetter: (params) => {
                const assigned = params.data.assignedLicenses || 0;
                const total = assigned + (params.data.availableLicenses || 0);
                return total > 0 ? ((assigned / total) * 100).toFixed(1) + '%' : 'N/A';
            }
        }
    ], []);
    // Dynamic columns based on active tab
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'users':
                return usersColumns;
            case 'groups':
                return groupsColumns;
            case 'gmail':
                return gmailColumns;
            case 'drive':
                return driveColumns;
            case 'calendar':
                return calendarColumns;
            case 'licenses':
                return licensesColumns;
            default:
                return [];
        }
    }, [state.activeTab, usersColumns, groupsColumns, gmailColumns, driveColumns, calendarColumns, licensesColumns]);
    // Filtered data
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        let data = [];
        switch (state.activeTab) {
            case 'users':
                data = state.result?.users || [];
                // Filter by org units
                if (state.filter.selectedOrgUnits.length > 0) {
                    data = (data ?? []).filter((u) => state.filter.selectedOrgUnits.includes(u.orgUnitPath));
                }
                // Filter by status
                if (state.filter.selectedStatuses.length > 0) {
                    data = (data ?? []).filter((u) => {
                        if (u.suspended && state.filter.selectedStatuses.includes('suspended'))
                            return true;
                        if (u.archived && state.filter.selectedStatuses.includes('archived'))
                            return true;
                        if (!u.suspended && !u.archived && state.filter.selectedStatuses.includes('active'))
                            return true;
                        return false;
                    });
                }
                // Filter by admin status
                if (state.filter.showOnlyAdmins) {
                    data = (data ?? []).filter((u) => u.isAdmin);
                }
                break;
            case 'groups':
                data = state.result?.groups || [];
                break;
            case 'gmail':
                data = state.result?.gmailData?.largestMailboxes || [];
                break;
            case 'drive':
                data = state.result?.driveData?.largestUsers || [];
                break;
            case 'calendar':
                data = state.result?.calendarData?.topUsers || [];
                break;
            case 'licenses':
                data = state.result?.licenseInfo || [];
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
        const users = state.result.users || [];
        const totalStorageUsed = state.result.totalStorageUsed || 0;
        return {
            totalUsers: state.result.totalUsersFound,
            activeUsers: users.filter(u => !u.suspended && !u.archived).length,
            suspendedUsers: users.filter(u => u.suspended).length,
            totalGroups: state.result.totalGroupsFound,
            totalStorageUsed,
            averageStoragePerUser: state.result.totalUsersFound > 0 ? totalStorageUsed / state.result.totalUsersFound : 0,
            licenseUtilization: state.result.licenseInfo?.reduce((acc, lic) => {
                const total = lic.assignedLicenses + lic.availableLicenses;
                acc[lic.skuName] = total > 0 ? (lic.assignedLicenses / total) * 100 : 0;
                return acc;
            }, {}) || {},
            topStorageUsers: users
                .sort((a, b) => (b.driveUsage || 0) - (a.driveUsage || 0))
                .slice(0, 5)
                .map(u => ({
                email: u.primaryEmail,
                name: u.name.fullName,
                storage: u.driveUsage || 0
            }))
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGdCQUFnQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELE1BQU07QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VHb29nbGVXb3Jrc3BhY2VEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEdvb2dsZSBXb3Jrc3BhY2UgRGlzY292ZXJ5IExvZ2ljIEhvb2tcbiAqIEZVTExZIEZVTkNUSU9OQUwgcHJvZHVjdGlvbi1yZWFkeSBidXNpbmVzcyBsb2dpYyBmb3IgR29vZ2xlIFdvcmtzcGFjZSBkaXNjb3ZlcnlcbiAqIE5PIFBMQUNFSE9MREVSUyAtIENvbXBsZXRlIGltcGxlbWVudGF0aW9uIHdpdGggVXNlcnMsIEdyb3VwcywgR21haWwsIERyaXZlLCBDYWxlbmRhclxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5pbXBvcnQgeyB1c2VEaXNjb3ZlcnlTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZURpc2NvdmVyeVN0b3JlJztcbmltcG9ydCB7IGdldEVsZWN0cm9uQVBJIH0gZnJvbSAnLi4vbGliL2VsZWN0cm9uLWFwaS1mYWxsYmFjayc7XG5leHBvcnQgY29uc3QgdXNlR29vZ2xlV29ya3NwYWNlRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgLy8gR2V0IHNlbGVjdGVkIGNvbXBhbnkgcHJvZmlsZSBmcm9tIHN0b3JlXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICBjb25zdCB7IGdldFJlc3VsdHNCeU1vZHVsZU5hbWUgfSA9IHVzZURpc2NvdmVyeVN0b3JlKCk7XG4gICAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgc2VydmljZVR5cGVzOiBbJ3VzZXJzJywgJ2dyb3VwcycsICdnbWFpbCcsICdkcml2ZSddLFxuICAgICAgICAgICAgaW5jbHVkZVVzZXJEZXRhaWxzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUdyb3VwTWVtYmVyc2hpcDogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVNYWlsYm94U2l6ZTogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVEcml2ZVVzYWdlOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUNhbGVuZGFyRGV0YWlsczogZmFsc2UsXG4gICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDBcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJycsIHBlcmNlbnRhZ2U6IDAgfSxcbiAgICAgICAgYWN0aXZlVGFiOiAnb3ZlcnZpZXcnLFxuICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRPcmdVbml0czogW10sXG4gICAgICAgICAgICBzZWxlY3RlZFN0YXR1c2VzOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkU2VydmljZVR5cGVzOiBbXSxcbiAgICAgICAgICAgIHNob3dPbmx5QWRtaW5zOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICB9KTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdHb29nbGVXb3Jrc3BhY2VEaXNjb3ZlcnknKTtcbiAgICAgICAgaWYgKHByZXZpb3VzUmVzdWx0cyAmJiBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tHb29nbGVXb3Jrc3BhY2VEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RSZXN1bHQgPSBwcmV2aW91c1Jlc3VsdHNbcHJldmlvdXNSZXN1bHRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCByZXN1bHQ6IGxhdGVzdFJlc3VsdCB9KSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZV0pO1xuICAgIC8vIFJlYWwtdGltZSBwcm9ncmVzcyB0cmFja2luZyB2aWEgSVBDXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVQcm9ncmVzcyA9IHdpbmRvdy5lbGVjdHJvbi5vbkRpc2NvdmVyeVByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBkYXRhLml0ZW1zUHJvY2Vzc2VkIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbDogZGF0YS50b3RhbEl0ZW1zIHx8IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2RhdGEuY3VycmVudFBoYXNlfSAoJHtkYXRhLml0ZW1zUHJvY2Vzc2VkIHx8IDB9LyR7ZGF0YS50b3RhbEl0ZW1zIHx8IDB9KWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiBkYXRhLnBlcmNlbnRhZ2UgfHwgMFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVPdXRwdXQgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlPdXRwdXQoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBvdXRwdXQgaWYgbmVlZGVkXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZUNvbXBsZXRlID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5Q29tcGxldGUoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBkYXRhLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAxMDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdEaXNjb3ZlcnkgY29tcGxldGVkJywgcGVyY2VudGFnZTogMTAwIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZUVycm9yID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5RXJyb3IoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZGF0YS5lcnJvcixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ0Vycm9yIG9jY3VycmVkJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZVByb2dyZXNzKVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZU91dHB1dClcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZU91dHB1dCgpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlQ29tcGxldGUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVDb21wbGV0ZSgpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlRXJyb3IpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVFcnJvcigpO1xuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbl0pO1xuICAgIC8vIFN0YXJ0IGRpc2NvdmVyeVxuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiBhIHByb2ZpbGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGVycm9yOiAnTm8gY29tcGFueSBwcm9maWxlIHNlbGVjdGVkLiBQbGVhc2Ugc2VsZWN0IGEgcHJvZmlsZSBmaXJzdC4nLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gYGdvb2dsZS13b3Jrc3BhY2UtZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICAgICAgY29uc29sZS5sb2coYFtHb29nbGVXb3Jrc3BhY2VEaXNjb3ZlcnlIb29rXSBTdGFydGluZyBHb29nbGUgV29ya3NwYWNlIGRpc2NvdmVyeSBmb3IgY29tcGFueTogJHtzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWV9YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbR29vZ2xlV29ya3NwYWNlRGlzY292ZXJ5SG9va10gUGFyYW1ldGVyczpgLCB7XG4gICAgICAgICAgICBzZXJ2aWNlVHlwZXM6IHN0YXRlLmNvbmZpZy5zZXJ2aWNlVHlwZXMsXG4gICAgICAgICAgICBpbmNsdWRlVXNlckRldGFpbHM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlVXNlckRldGFpbHMsXG4gICAgICAgICAgICBpbmNsdWRlR3JvdXBNZW1iZXJzaGlwOiBzdGF0ZS5jb25maWcuaW5jbHVkZUdyb3VwTWVtYmVyc2hpcCxcbiAgICAgICAgICAgIGluY2x1ZGVNYWlsYm94U2l6ZTogc3RhdGUuY29uZmlnLmluY2x1ZGVNYWlsYm94U2l6ZSxcbiAgICAgICAgICAgIGluY2x1ZGVEcml2ZVVzYWdlOiBzdGF0ZS5jb25maWcuaW5jbHVkZURyaXZlVXNhZ2UsXG4gICAgICAgICAgICBpbmNsdWRlQ2FsZW5kYXJEZXRhaWxzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNhbGVuZGFyRGV0YWlscyxcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIEdvb2dsZSBXb3Jrc3BhY2UgZGlzY292ZXJ5Li4uJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgZGlzY292ZXJ5IG1vZHVsZSB3aXRoIGNyZWRlbnRpYWxzIGZyb20gdGhlIHByb2ZpbGVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGVsZWN0cm9uQVBJLmV4ZWN1dGVEaXNjb3ZlcnlNb2R1bGUoJ0dvb2dsZVdvcmtzcGFjZScsIHNlbGVjdGVkU291cmNlUHJvZmlsZS5jb21wYW55TmFtZSwge1xuICAgICAgICAgICAgICAgIFNlcnZpY2VUeXBlczogc3RhdGUuY29uZmlnLnNlcnZpY2VUeXBlcyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlVXNlckRldGFpbHM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlVXNlckRldGFpbHMsXG4gICAgICAgICAgICAgICAgSW5jbHVkZUdyb3VwTWVtYmVyc2hpcDogc3RhdGUuY29uZmlnLmluY2x1ZGVHcm91cE1lbWJlcnNoaXAsXG4gICAgICAgICAgICAgICAgSW5jbHVkZU1haWxib3hTaXplOiBzdGF0ZS5jb25maWcuaW5jbHVkZU1haWxib3hTaXplLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVEcml2ZVVzYWdlOiBzdGF0ZS5jb25maWcuaW5jbHVkZURyaXZlVXNhZ2UsXG4gICAgICAgICAgICAgICAgSW5jbHVkZUNhbGVuZGFyRGV0YWlsczogc3RhdGUuY29uZmlnLmluY2x1ZGVDYWxlbmRhckRldGFpbHMsXG4gICAgICAgICAgICAgICAgT3JnVW5pdHM6IHN0YXRlLmNvbmZpZy5vcmdVbml0cyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBzdGF0ZS5jb25maWcudGltZW91dCB8fCAzMDAwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbR29vZ2xlV29ya3NwYWNlRGlzY292ZXJ5SG9va10g4pyFIEdvb2dsZSBXb3Jrc3BhY2UgZGlzY292ZXJ5IGNvbXBsZXRlZCBzdWNjZXNzZnVsbHlgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtHb29nbGVXb3Jrc3BhY2VEaXNjb3ZlcnlIb29rXSDinYwgR29vZ2xlIFdvcmtzcGFjZSBkaXNjb3ZlcnkgZmFpbGVkOmAsIHJlc3VsdC5lcnJvcik7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiByZXN1bHQuZXJyb3IgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnRXJyb3Igb2NjdXJyZWQnLCBwZXJjZW50YWdlOiAwIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbR29vZ2xlV29ya3NwYWNlRGlzY292ZXJ5SG9va10gRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuY29uZmlnLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGVdKTtcbiAgICAvLyBDYW5jZWwgZGlzY292ZXJ5XG4gICAgY29uc3QgY2FuY2VsRGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uLmNhbmNlbERpc2NvdmVyeShzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnQ2FuY2VsbGVkJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgIH0pKTtcbiAgICB9LCBbc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW5dKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9DU1YgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndXNlcnMnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LnVzZXJzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdncm91cHMnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Lmdyb3VwcztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZ21haWwnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmdtYWlsRGF0YT8ubGFyZ2VzdE1haWxib3hlcyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZHJpdmUnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmRyaXZlRGF0YT8ubGFyZ2VzdFVzZXJzIHx8IFtdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjYWxlbmRhcic6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5yZXN1bHQuY2FsZW5kYXJEYXRhPy50b3BVc2VycyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbGljZW5zZXMnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmxpY2Vuc2VJbmZvO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNzdkRhdGEgPSBjb252ZXJ0VG9DU1YoZGF0YSk7XG4gICAgICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NzdkRhdGFdLCB7IHR5cGU6ICd0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04OycgfSk7XG4gICAgICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgICAgICAgIGxpbmsuZG93bmxvYWQgPSBgZ29vZ2xlLXdvcmtzcGFjZS0ke3N0YXRlLmFjdGl2ZVRhYn0tJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YDtcbiAgICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NTViBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0V4cG9ydC9FeHBvcnRUb0V4Y2VsLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1Hb29nbGVXb3Jrc3BhY2VEYXRhJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHN0YXRlLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgdGFiOiBzdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBgZ29vZ2xlLXdvcmtzcGFjZS0ke3N0YXRlLmFjdGl2ZVRhYn0tJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0ueGxzeGBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4Y2VsIGV4cG9ydCBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLnJlc3VsdCwgc3RhdGUuYWN0aXZlVGFiXSk7XG4gICAgLy8gVXNlcnMgY29sdW1uc1xuICAgIGNvbnN0IHVzZXJzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAncHJpbWFyeUVtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnbmFtZS5mdWxsTmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnaXNBZG1pbicsIGhlYWRlck5hbWU6ICdBZG1pbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdXNwZW5kZWQnLCBoZWFkZXJOYW1lOiAnU3VzcGVuZGVkJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnWWVzJyA6ICdObycgfSxcbiAgICAgICAgeyBmaWVsZDogJ29yZ1VuaXRQYXRoJywgaGVhZGVyTmFtZTogJ09yZyBVbml0Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDI1MCB9LFxuICAgICAgICB7IGZpZWxkOiAnbWFpbGJveFNpemUnLCBoZWFkZXJOYW1lOiAnTWFpbGJveCBTaXplJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBgJHsocGFyYW1zLnZhbHVlIC8gMTAyNCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBHQmAgOiAnTi9BJyB9LFxuICAgICAgICB7IGZpZWxkOiAnZHJpdmVVc2FnZScsIGhlYWRlck5hbWU6ICdEcml2ZSBVc2FnZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gYCR7KHBhcmFtcy52YWx1ZSAvIDEwMjQgLyAxMDI0IC8gMTAyNCkudG9GaXhlZCgyKX0gR0JgIDogJ04vQScgfSxcbiAgICAgICAgeyBmaWVsZDogJ2xhc3RMb2dpblRpbWUnLCBoZWFkZXJOYW1lOiAnTGFzdCBMb2dpbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdOZXZlcicgfSxcbiAgICAgICAgeyBmaWVsZDogJ3R3b1N0ZXBWZXJpZmljYXRpb25FbnJvbGxlZCcsIGhlYWRlck5hbWU6ICcyRkEnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gR3JvdXBzIGNvbHVtbnNcbiAgICBjb25zdCBncm91cHNDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICdlbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2Rlc2NyaXB0aW9uJywgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnZGlyZWN0TWVtYmVyc0NvdW50JywgaGVhZGVyTmFtZTogJ01lbWJlcnMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTIwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhZG1pbkNyZWF0ZWQnLCBoZWFkZXJOYW1lOiAnQWRtaW4gQ3JlYXRlZCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzZXR0aW5ncy5hbGxvd0V4dGVybmFsTWVtYmVycycsIGhlYWRlck5hbWU6ICdFeHRlcm5hbCBNZW1iZXJzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE2MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnQWxsb3dlZCcgOiAnTm90IEFsbG93ZWQnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzZXR0aW5ncy53aG9DYW5Qb3N0TWVzc2FnZScsIGhlYWRlck5hbWU6ICdXaG8gQ2FuIFBvc3QnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTgwIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gR21haWwgY29sdW1uc1xuICAgIGNvbnN0IGdtYWlsQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAndXNlckVtYWlsJywgaGVhZGVyTmFtZTogJ0VtYWlsJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGZpZWxkOiAndXNlck5hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3NpemUnLCBoZWFkZXJOYW1lOiAnTWFpbGJveCBTaXplJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJHsocGFyYW1zLnZhbHVlIC8gMTAyNCAvIDEwMjQgLyAxMDI0KS50b0ZpeGVkKDIpfSBHQmAgfSxcbiAgICAgICAgeyBmaWVsZDogJ21lc3NhZ2VDb3VudCcsIGhlYWRlck5hbWU6ICdNZXNzYWdlcycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlPy50b0xvY2FsZVN0cmluZygpIHx8ICdOL0EnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdsYXN0QWN0aXZpdHlUaW1lJywgaGVhZGVyTmFtZTogJ0xhc3QgQWN0aXZpdHknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJyB9XG4gICAgXSwgW10pO1xuICAgIC8vIERyaXZlIGNvbHVtbnNcbiAgICBjb25zdCBkcml2ZUNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJFbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJOYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdG9yYWdlVXNlZCcsIGhlYWRlck5hbWU6ICdTdG9yYWdlIFVzZWQnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAkeyhwYXJhbXMudmFsdWUgLyAxMDI0IC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMil9IEdCYCB9LFxuICAgICAgICB7IGZpZWxkOiAnZmlsZUNvdW50JywgaGVhZGVyTmFtZTogJ0ZpbGVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/LnRvTG9jYWxlU3RyaW5nKCkgfHwgJzAnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzaGFyZWRGaWxlQ291bnQnLCBoZWFkZXJOYW1lOiAnU2hhcmVkIEZpbGVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/LnRvTG9jYWxlU3RyaW5nKCkgfHwgJzAnIH0sXG4gICAgICAgIHsgZmllbGQ6ICdsYXN0QWN0aXZpdHlUaW1lJywgaGVhZGVyTmFtZTogJ0xhc3QgQWN0aXZpdHknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJyB9XG4gICAgXSwgW10pO1xuICAgIC8vIENhbGVuZGFyIGNvbHVtbnNcbiAgICBjb25zdCBjYWxlbmRhckNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJFbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3VzZXJOYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdjYWxlbmRhckNvdW50JywgaGVhZGVyTmFtZTogJ0NhbGVuZGFycycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2V2ZW50Q291bnQnLCBoZWFkZXJOYW1lOiAnRXZlbnRzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/LnRvTG9jYWxlU3RyaW5nKCkgfHwgJ04vQScgfSxcbiAgICAgICAgeyBmaWVsZDogJ3NoYXJlZENhbGVuZGFycycsIGhlYWRlck5hbWU6ICdTaGFyZWQnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTIwIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gTGljZW5zZXMgY29sdW1uc1xuICAgIGNvbnN0IGxpY2Vuc2VzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnc2t1TmFtZScsIGhlYWRlck5hbWU6ICdMaWNlbnNlIFNLVScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3Byb2R1Y3ROYW1lJywgaGVhZGVyTmFtZTogJ1Byb2R1Y3QnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhc3NpZ25lZExpY2Vuc2VzJywgaGVhZGVyTmFtZTogJ0Fzc2lnbmVkJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAnYXZhaWxhYmxlTGljZW5zZXMnLCBoZWFkZXJOYW1lOiAnQXZhaWxhYmxlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAndXRpbGl6YXRpb24nLCBoZWFkZXJOYW1lOiAnVXRpbGl6YXRpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NpZ25lZCA9IHBhcmFtcy5kYXRhLmFzc2lnbmVkTGljZW5zZXMgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IGFzc2lnbmVkICsgKHBhcmFtcy5kYXRhLmF2YWlsYWJsZUxpY2Vuc2VzIHx8IDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b3RhbCA+IDAgPyAoKGFzc2lnbmVkIC8gdG90YWwpICogMTAwKS50b0ZpeGVkKDEpICsgJyUnIDogJ04vQSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gRHluYW1pYyBjb2x1bW5zIGJhc2VkIG9uIGFjdGl2ZSB0YWJcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICBjYXNlICd1c2Vycyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJzQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2dyb3Vwcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdyb3Vwc0NvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdnbWFpbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdtYWlsQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2RyaXZlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZHJpdmVDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAnY2FsZW5kYXInOlxuICAgICAgICAgICAgICAgIHJldHVybiBjYWxlbmRhckNvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdsaWNlbnNlcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpY2Vuc2VzQ29sdW1ucztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmFjdGl2ZVRhYiwgdXNlcnNDb2x1bW5zLCBncm91cHNDb2x1bW5zLCBnbWFpbENvbHVtbnMsIGRyaXZlQ29sdW1ucywgY2FsZW5kYXJDb2x1bW5zLCBsaWNlbnNlc0NvbHVtbnNdKTtcbiAgICAvLyBGaWx0ZXJlZCBkYXRhXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCBkYXRhID0gW107XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICBjYXNlICd1c2Vycyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8udXNlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIGJ5IG9yZyB1bml0c1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRPcmdVbml0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKCh1KSA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRPcmdVbml0cy5pbmNsdWRlcyh1Lm9yZ1VuaXRQYXRoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZpbHRlciBieSBzdGF0dXNcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlbGVjdGVkU3RhdHVzZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigodSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHUuc3VzcGVuZGVkICYmIHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXR1c2VzLmluY2x1ZGVzKCdzdXNwZW5kZWQnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1LmFyY2hpdmVkICYmIHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXR1c2VzLmluY2x1ZGVzKCdhcmNoaXZlZCcpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF1LnN1c3BlbmRlZCAmJiAhdS5hcmNoaXZlZCAmJiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRTdGF0dXNlcy5pbmNsdWRlcygnYWN0aXZlJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXIgYnkgYWRtaW4gc3RhdHVzXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zaG93T25seUFkbWlucykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigodSkgPT4gdS5pc0FkbWluKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncm91cHMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5yZXN1bHQ/Lmdyb3VwcyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dtYWlsJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5nbWFpbERhdGE/Lmxhcmdlc3RNYWlsYm94ZXMgfHwgW107XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkcml2ZSc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8uZHJpdmVEYXRhPy5sYXJnZXN0VXNlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYWxlbmRhcic6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8uY2FsZW5kYXJEYXRhPy50b3BVc2VycyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xpY2Vuc2VzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5saWNlbnNlSW5mbyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCBmaWx0ZXJcbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hMb3dlciA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcihpdGVtID0+IEpTT04uc3RyaW5naWZ5KGl0ZW0pLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCBbc3RhdGUucmVzdWx0LCBzdGF0ZS5hY3RpdmVUYWIsIHN0YXRlLmZpbHRlcl0pO1xuICAgIC8vIFN0YXRpc3RpY3MgY2FsY3VsYXRpb25cbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCB1c2VycyA9IHN0YXRlLnJlc3VsdC51c2VycyB8fCBbXTtcbiAgICAgICAgY29uc3QgdG90YWxTdG9yYWdlVXNlZCA9IHN0YXRlLnJlc3VsdC50b3RhbFN0b3JhZ2VVc2VkIHx8IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbFVzZXJzOiBzdGF0ZS5yZXN1bHQudG90YWxVc2Vyc0ZvdW5kLFxuICAgICAgICAgICAgYWN0aXZlVXNlcnM6IHVzZXJzLmZpbHRlcih1ID0+ICF1LnN1c3BlbmRlZCAmJiAhdS5hcmNoaXZlZCkubGVuZ3RoLFxuICAgICAgICAgICAgc3VzcGVuZGVkVXNlcnM6IHVzZXJzLmZpbHRlcih1ID0+IHUuc3VzcGVuZGVkKS5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbEdyb3Vwczogc3RhdGUucmVzdWx0LnRvdGFsR3JvdXBzRm91bmQsXG4gICAgICAgICAgICB0b3RhbFN0b3JhZ2VVc2VkLFxuICAgICAgICAgICAgYXZlcmFnZVN0b3JhZ2VQZXJVc2VyOiBzdGF0ZS5yZXN1bHQudG90YWxVc2Vyc0ZvdW5kID4gMCA/IHRvdGFsU3RvcmFnZVVzZWQgLyBzdGF0ZS5yZXN1bHQudG90YWxVc2Vyc0ZvdW5kIDogMCxcbiAgICAgICAgICAgIGxpY2Vuc2VVdGlsaXphdGlvbjogc3RhdGUucmVzdWx0LmxpY2Vuc2VJbmZvPy5yZWR1Y2UoKGFjYywgbGljKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWwgPSBsaWMuYXNzaWduZWRMaWNlbnNlcyArIGxpYy5hdmFpbGFibGVMaWNlbnNlcztcbiAgICAgICAgICAgICAgICBhY2NbbGljLnNrdU5hbWVdID0gdG90YWwgPiAwID8gKGxpYy5hc3NpZ25lZExpY2Vuc2VzIC8gdG90YWwpICogMTAwIDogMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSwge30pIHx8IHt9LFxuICAgICAgICAgICAgdG9wU3RvcmFnZVVzZXJzOiB1c2Vyc1xuICAgICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiAoYi5kcml2ZVVzYWdlIHx8IDApIC0gKGEuZHJpdmVVc2FnZSB8fCAwKSlcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgNSlcbiAgICAgICAgICAgICAgICAubWFwKHUgPT4gKHtcbiAgICAgICAgICAgICAgICBlbWFpbDogdS5wcmltYXJ5RW1haWwsXG4gICAgICAgICAgICAgICAgbmFtZTogdS5uYW1lLmZ1bGxOYW1lLFxuICAgICAgICAgICAgICAgIHN0b3JhZ2U6IHUuZHJpdmVVc2FnZSB8fCAwXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgfTtcbiAgICB9LCBbc3RhdGUucmVzdWx0XSk7XG4gICAgLy8gVXBkYXRlIGNvbmZpZ1xuICAgIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgY29uZmlnOiB7IC4uLnByZXYuY29uZmlnLCAuLi51cGRhdGVzIH0gfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBVcGRhdGUgZmlsdGVyXG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBmaWx0ZXI6IHsgLi4ucHJldi5maWx0ZXIsIC4uLnVwZGF0ZXMgfSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIFNldCBhY3RpdmUgdGFiXG4gICAgY29uc3Qgc2V0QWN0aXZlVGFiID0gdXNlQ2FsbGJhY2soKHRhYikgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGFjdGl2ZVRhYjogdGFiIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgIHJlc3VsdDogc3RhdGUucmVzdWx0LFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBzdGF0ZS5pc0Rpc2NvdmVyaW5nLFxuICAgICAgICBwcm9ncmVzczogc3RhdGUucHJvZ3Jlc3MsXG4gICAgICAgIGFjdGl2ZVRhYjogc3RhdGUuYWN0aXZlVGFiLFxuICAgICAgICBmaWx0ZXI6IHN0YXRlLmZpbHRlcixcbiAgICAgICAgZXJyb3I6IHN0YXRlLmVycm9yLFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGZpbHRlcmVkRGF0YSxcbiAgICAgICAgc3RhdHMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIHNldEFjdGl2ZVRhYixcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgZXhwb3J0VG9DU1YsXG4gICAgICAgIGV4cG9ydFRvRXhjZWxcbiAgICB9O1xufTtcbi8vIEhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IGRhdGEgdG8gQ1NWXG5mdW5jdGlvbiBjb252ZXJ0VG9DU1YoZGF0YSkge1xuICAgIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIGNvbnN0IGZsYXR0ZW5PYmplY3QgPSAob2JqLCBwcmVmaXggPSAnJykgPT4ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoKGFjYywga2V5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhY2NbbmV3S2V5XSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihhY2MsIGZsYXR0ZW5PYmplY3QodmFsdWUsIG5ld0tleSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBhY2NbbmV3S2V5XSA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gdmFsdWUudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSk7XG4gICAgfTtcbiAgICBjb25zdCBmbGF0RGF0YSA9IChkYXRhID8/IFtdKS5tYXAoaXRlbSA9PiBmbGF0dGVuT2JqZWN0KGl0ZW0pKTtcbiAgICBjb25zdCBoZWFkZXJzID0gT2JqZWN0LmtleXMoZmxhdERhdGFbMF0pO1xuICAgIGNvbnN0IHJvd3MgPSBmbGF0RGF0YS5tYXAoaXRlbSA9PiBoZWFkZXJzLm1hcChoZWFkZXIgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGl0ZW1baGVhZGVyXTtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgKHZhbHVlLmluY2x1ZGVzKCcsJykgfHwgdmFsdWUuaW5jbHVkZXMoJ1wiJykpKSB7XG4gICAgICAgICAgICByZXR1cm4gYFwiJHt2YWx1ZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSkuam9pbignLCcpKTtcbiAgICByZXR1cm4gW2hlYWRlcnMuam9pbignLCcpLCAuLi5yb3dzXS5qb2luKCdcXG4nKTtcbn1cbiIsIi8qKlxuICogRGlzY292ZXJ5IFN0b3JlXG4gKlxuICogTWFuYWdlcyBkaXNjb3Zlcnkgb3BlcmF0aW9ucywgcmVzdWx0cywgYW5kIHN0YXRlLlxuICogSGFuZGxlcyBkb21haW4sIG5ldHdvcmssIHVzZXIsIGFuZCBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcHJvY2Vzc2VzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICd6dXN0YW5kJztcbmltcG9ydCB7IGRldnRvb2xzLCBzdWJzY3JpYmVXaXRoU2VsZWN0b3IgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnO1xuZXhwb3J0IGNvbnN0IHVzZURpc2NvdmVyeVN0b3JlID0gY3JlYXRlKCkoZGV2dG9vbHMoc3Vic2NyaWJlV2l0aFNlbGVjdG9yKChzZXQsIGdldCkgPT4gKHtcbiAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgb3BlcmF0aW9uczogbmV3IE1hcCgpLFxuICAgIHJlc3VsdHM6IG5ldyBNYXAoKSxcbiAgICBzZWxlY3RlZE9wZXJhdGlvbjogbnVsbCxcbiAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAvLyBBY3Rpb25zXG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIHN0YXJ0RGlzY292ZXJ5OiBhc3luYyAodHlwZSwgcGFyYW1ldGVycykgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGRpc2NvdmVyeS4uLicsXG4gICAgICAgICAgICBpdGVtc0Rpc2NvdmVyZWQ6IDAsXG4gICAgICAgICAgICBzdGFydGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQWRkIG9wZXJhdGlvbiB0byBzdGF0ZVxuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuc2V0KG9wZXJhdGlvbklkLCBvcGVyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNldHVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzQ2xlYW51cCA9IHdpbmRvdy5lbGVjdHJvbkFQSS5vblByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgZGF0YS5wZXJjZW50YWdlLCBkYXRhLm1lc3NhZ2UgfHwgJ1Byb2Nlc3NpbmcuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGRpc2NvdmVyeSBtb2R1bGVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiBgTW9kdWxlcy9EaXNjb3ZlcnkvJHt0eXBlfS5wc20xYCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGBTdGFydC0ke3R5cGV9RGlzY292ZXJ5YCxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbU91dHB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDbGVhbnVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGdldCgpLmNvbXBsZXRlRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZGF0YT8ucmVzdWx0cyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZXJyb3IgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb25JZDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHJ1bm5pbmcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIGNhbmNlbERpc2NvdmVyeTogYXN5bmMgKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgaWYgKCFvcGVyYXRpb24gfHwgb3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24ob3BlcmF0aW9uLmNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAob3ApIHtcbiAgICAgICAgICAgICAgICAgICAgb3Auc3RhdHVzID0gJ2NhbmNlbGxlZCc7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1lc3NhZ2UgPSAnRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwcm9ncmVzcyBmb3IgYSBydW5uaW5nIG9wZXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiAob3BlcmF0aW9uSWQsIHByb2dyZXNzLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiAmJiBvcGVyYXRpb24uc3RhdHVzID09PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgY29tcGxldGVkIHdpdGggcmVzdWx0c1xuICAgICAqL1xuICAgIGNvbXBsZXRlRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyZWQgJHtyZXN1bHRzLmxlbmd0aH0gaXRlbXNgO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5pdGVtc0Rpc2NvdmVyZWQgPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQob3BlcmF0aW9uSWQsIHJlc3VsdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGZhaWxlZFxuICAgICAqL1xuICAgIGZhaWxEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgZXJyb3IpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyeSBmYWlsZWQ6ICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhIHNpbmdsZSBvcGVyYXRpb24gYW5kIGl0cyByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uID09PSBvcGVyYXRpb25JZCA/IG51bGwgOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9wZXJhdGlvbnMgYW5kIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhckFsbE9wZXJhdGlvbnM6ICgpID0+IHtcbiAgICAgICAgLy8gT25seSBjbGVhciBjb21wbGV0ZWQsIGZhaWxlZCwgb3IgY2FuY2VsbGVkIG9wZXJhdGlvbnNcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBvcGVyYXRpb25dIG9mIG5ld09wZXJhdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0T3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGZvciBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldFJlc3VsdHM6IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgYnkgbW9kdWxlIG5hbWUgKGZvciBwZXJzaXN0ZW50IHJldHJpZXZhbCBhY3Jvc3MgY29tcG9uZW50IHJlbW91bnRzKVxuICAgICAqL1xuICAgIGdldFJlc3VsdHNCeU1vZHVsZU5hbWU6IChtb2R1bGVOYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChtb2R1bGVOYW1lKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEFkZCBhIGRpc2NvdmVyeSByZXN1bHQgKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBhZGRSZXN1bHQ6IChyZXN1bHQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdHMgPSBuZXdSZXN1bHRzLmdldChyZXN1bHQubW9kdWxlTmFtZSkgfHwgW107XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChyZXN1bHQubW9kdWxlTmFtZSwgWy4uLmV4aXN0aW5nUmVzdWx0cywgcmVzdWx0XSk7XG4gICAgICAgICAgICByZXR1cm4geyByZXN1bHRzOiBuZXdSZXN1bHRzIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHByb2dyZXNzIGluZm9ybWF0aW9uIChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgc2V0UHJvZ3Jlc3M6IChwcm9ncmVzc0RhdGEpID0+IHtcbiAgICAgICAgLy8gRmluZCB0aGUgY3VycmVudCBvcGVyYXRpb24gZm9yIHRoaXMgbW9kdWxlIGFuZCB1cGRhdGUgaXRcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9ucyA9IGdldCgpLm9wZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gQXJyYXkuZnJvbShvcGVyYXRpb25zLmtleXMoKSkuZmluZChpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcCA9IG9wZXJhdGlvbnMuZ2V0KGlkKTtcbiAgICAgICAgICAgIHJldHVybiBvcCAmJiBvcC50eXBlID09PSBwcm9ncmVzc0RhdGEubW9kdWxlTmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcGVyYXRpb25JZCkge1xuICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIHByb2dyZXNzRGF0YS5vdmVyYWxsUHJvZ3Jlc3MsIHByb2dyZXNzRGF0YS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KSksIHtcbiAgICBuYW1lOiAnRGlzY292ZXJ5U3RvcmUnLFxufSkpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9