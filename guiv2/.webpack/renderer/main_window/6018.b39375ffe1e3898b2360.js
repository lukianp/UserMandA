"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6018],{

/***/ 15420:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   w: () => (/* binding */ useOffice365DiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _useDebounce__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(99305);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92856);
/**
 * Office 365 Discovery View Logic Hook
 * Manages state and business logic for Office 365 discovery operations
 */



/**
 * Office 365 Discovery Logic Hook
 */
const useOffice365DiscoveryLogic = () => {
    const { getResultsByModuleName } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__/* .useDiscoveryStore */ .R)();
    // State
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: createDefaultConfig(),
        templates: [],
        currentResult: null,
        historicalResults: [],
        filter: createDefaultFilter(),
        searchText: '',
        isDiscovering: false,
        progress: null,
        selectedTab: 'overview',
        selectedObjects: [],
        errors: [],
    });
    const debouncedSearch = (0,_useDebounce__WEBPACK_IMPORTED_MODULE_1__/* .useDebounce */ .d)(state.searchText, 300);
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('Office365Discovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[Office365DiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setState(prev => ({ ...prev, currentResult: latestResult }));
        }
    }, [getResultsByModuleName]);
    // Load templates and historical results on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        loadTemplates();
        loadHistoricalResults();
    }, []);
    // Subscribe to discovery progress
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'office365-discovery') {
                setState(prev => ({ ...prev, progress: data }));
            }
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, []);
    /**
     * Load discovery templates
     */
    const loadTemplates = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Get-Office365DiscoveryTemplates',
                parameters: {},
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, templates: result.data.templates }));
            }
        }
        catch (error) {
            console.error('Failed to load templates:', error);
        }
    };
    /**
     * Load historical discovery results
     */
    const loadHistoricalResults = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Get-Office365DiscoveryHistory',
                parameters: { Limit: 10 },
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, historicalResults: result.data.results }));
            }
        }
        catch (error) {
            console.error('Failed to load historical results:', error);
        }
    };
    /**
     * Start Office 365 Discovery
     */
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        setState(prev => ({ ...prev, isDiscovering: true, errors: [], progress: null }));
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Invoke-Office365Discovery',
                parameters: {
                    TenantId: state.config.tenantId,
                    TenantDomain: state.config.tenantDomain,
                    IncludeUsers: state.config.includeUsers,
                    IncludeGuests: state.config.includeGuests,
                    IncludeLicenses: state.config.includeLicenses,
                    IncludeServices: state.config.includeServices,
                    IncludeSecurity: state.config.includeSecurity,
                    IncludeCompliance: state.config.includeCompliance,
                    IncludeConditionalAccess: state.config.includeConditionalAccess,
                    IncludeMFAStatus: state.config.includeMFAStatus,
                    IncludeAdminRoles: state.config.includeAdminRoles,
                    IncludeServiceHealth: state.config.includeServiceHealth,
                    StreamProgress: true,
                },
            });
            if (result.success && result.data) {
                const discoveryResult = result.data;
                setState(prev => ({
                    ...prev,
                    currentResult: discoveryResult,
                    isDiscovering: false,
                    progress: null,
                }));
            }
            else {
                throw new Error(result.error || 'Discovery failed');
            }
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                errors: [...prev.errors, error.message || 'Unknown error occurred'],
                progress: null,
            }));
        }
    }, [state.config]);
    /**
     * Cancel ongoing discovery
     */
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.currentResult?.id)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Stop-Office365Discovery',
                parameters: { ResultId: state.currentResult.id },
            });
            setState(prev => ({ ...prev, isDiscovering: false, progress: null }));
        }
        catch (error) {
            console.error('Failed to cancel discovery:', error);
        }
    }, [state.currentResult?.id]);
    /**
     * Update discovery configuration
     */
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            config: { ...prev.config, ...updates },
        }));
    }, []);
    /**
     * Load a template
     */
    const loadTemplate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((template) => {
        setState(prev => ({
            ...prev,
            config: { ...template.config, id: generateId() },
        }));
    }, []);
    /**
     * Save current config as template
     */
    const saveAsTemplate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (name, description, category) => {
        try {
            const template = {
                name,
                description,
                category: category,
                config: state.config,
                createdBy: 'CurrentUser',
                isSystem: false,
            };
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Save-Office365DiscoveryTemplate',
                parameters: { Template: template },
            });
            if (result.success) {
                await loadTemplates();
            }
        }
        catch (error) {
            console.error('Failed to save template:', error);
        }
    }, [state.config]);
    /**
     * Export discovery results
     */
    const exportResults = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (format) => {
        if (!state.currentResult)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/Office365Discovery.psm1',
                functionName: 'Export-Office365DiscoveryResults',
                parameters: {
                    ResultId: state.currentResult.id,
                    Format: format,
                    IncludeAll: true,
                },
            });
        }
        catch (error) {
            console.error('Failed to export results:', error);
        }
    }, [state.currentResult]);
    /**
     * Filter results based on current filter settings
     */
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.currentResult)
            return [];
        const { filter } = state;
        let data = [];
        switch (state.selectedTab) {
            case 'users':
                data = [...state.currentResult.users, ...(state.currentResult.guestUsers || [])];
                break;
            case 'licenses':
                data = state.currentResult.licenses;
                break;
            case 'services':
                data = state.currentResult.services;
                break;
            case 'security':
                data = state.currentResult.securityConfig?.conditionalAccessPolicies || [];
                break;
            default:
                return [];
        }
        // Apply search text filter
        if (debouncedSearch) {
            data = (data ?? []).filter((item) => {
                const searchLower = debouncedSearch.toLowerCase();
                return (item.displayName?.toLowerCase().includes(searchLower) ||
                    item.userPrincipalName?.toLowerCase().includes(searchLower) ||
                    item.mail?.toLowerCase().includes(searchLower) ||
                    item.productName?.toLowerCase().includes(searchLower) ||
                    item.serviceName?.toLowerCase().includes(searchLower) ||
                    item.name?.toLowerCase().includes(searchLower));
            });
        }
        // Apply user type filter
        if (state.selectedTab === 'users' && filter.userType !== 'all') {
            data = (data ?? []).filter((item) => item.userType === filter.userType);
        }
        // Apply account status filter
        if (state.selectedTab === 'users' && filter.accountStatus !== 'all') {
            const enabled = filter.accountStatus === 'enabled';
            data = (data ?? []).filter((item) => item.accountEnabled === enabled);
        }
        // Apply MFA status filter
        if (state.selectedTab === 'users' && filter.mfaStatus !== 'all') {
            const mfaEnabled = filter.mfaStatus === 'enabled';
            data = (data ?? []).filter((item) => {
                const hasMFA = item.mfaStatus?.state === 'enabled' || item.mfaStatus?.state === 'enforced';
                return hasMFA === mfaEnabled;
            });
        }
        // Apply license status filter
        if (state.selectedTab === 'users' && filter.licenseStatus !== 'all') {
            const isLicensed = filter.licenseStatus === 'licensed';
            data = (data ?? []).filter((item) => {
                const hasLicense = item.licenses && item.licenses.length > 0;
                return hasLicense === isLicensed;
            });
        }
        // Apply admin status filter
        if (state.selectedTab === 'users' && filter.adminStatus !== 'all') {
            const isAdmin = filter.adminStatus === 'admin';
            data = (data ?? []).filter((item) => item.isAdmin === isAdmin);
        }
        return data;
    }, [state.selectedTab, state.currentResult, state.filter, debouncedSearch]);
    /**
     * Column definitions for AG Grid
     */
    const columnDefs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
        users: [
            { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true, flex: 2, pinned: 'left' },
            { field: 'userPrincipalName', headerName: 'UPN', sortable: true, filter: true, flex: 2 },
            { field: 'mail', headerName: 'Email', sortable: true, filter: true, flex: 2 },
            { field: 'userType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
            {
                field: 'accountEnabled',
                headerName: 'Status',
                sortable: true,
                filter: true,
                flex: 1,
                cellRenderer: (params) => params.value ? '✓ Enabled' : '✗ Disabled',
                cellStyle: (params) => params.value ? { color: 'green' } : { color: 'red' }
            },
            {
                field: 'mfaStatus.state',
                headerName: 'MFA',
                sortable: true,
                filter: true,
                flex: 1,
                valueGetter: (params) => params.data.mfaStatus?.state || 'disabled',
                cellStyle: (params) => {
                    const state = params.data.mfaStatus?.state;
                    if (state === 'enabled' || state === 'enforced')
                        return { color: 'green', fontWeight: 'bold' };
                    return { color: 'red' };
                }
            },
            {
                field: 'licenses',
                headerName: 'Licenses',
                sortable: true,
                flex: 1,
                valueGetter: (params) => params.data.licenses?.length || 0
            },
            {
                field: 'isAdmin',
                headerName: 'Admin',
                sortable: true,
                filter: true,
                flex: 1,
                cellRenderer: (params) => params.value ? '✓ Admin' : '',
                cellStyle: (params) => params.value ? { color: 'orange', fontWeight: 'bold' } : {}
            },
            { field: 'department', headerName: 'Department', sortable: true, filter: true, flex: 1 },
            { field: 'jobTitle', headerName: 'Job Title', sortable: true, filter: true, flex: 2 },
            {
                field: 'lastSignIn',
                headerName: 'Last Sign In',
                sortable: true,
                filter: true,
                flex: 1,
                valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never'
            },
        ],
        licenses: [
            { field: 'productName', headerName: 'Product', sortable: true, filter: true, flex: 2, pinned: 'left' },
            { field: 'skuPartNumber', headerName: 'SKU', sortable: true, filter: true, flex: 1 },
            {
                field: 'status',
                headerName: 'Status',
                sortable: true,
                filter: true,
                flex: 1,
                cellStyle: (params) => {
                    if (params.value === 'active')
                        return { color: 'green', fontWeight: 'bold' };
                    if (params.value === 'warning')
                        return { color: 'orange', fontWeight: 'bold' };
                    return { color: 'red' };
                }
            },
            {
                field: 'assignedDate',
                headerName: 'Assigned Date',
                sortable: true,
                filter: true,
                flex: 1,
                valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
            },
            {
                field: 'servicePlans',
                headerName: 'Service Plans',
                sortable: true,
                flex: 1,
                valueGetter: (params) => params.data.servicePlans?.length || 0
            },
            {
                field: 'disabledPlans',
                headerName: 'Disabled Plans',
                sortable: true,
                flex: 1,
                valueGetter: (params) => params.data.disabledPlans?.length || 0
            },
        ],
        services: [
            { field: 'displayName', headerName: 'Service', sortable: true, filter: true, flex: 2, pinned: 'left' },
            { field: 'serviceName', headerName: 'Service Name', sortable: true, filter: true, flex: 2 },
            { field: 'featureName', headerName: 'Feature', sortable: true, filter: true, flex: 2 },
            {
                field: 'healthStatus',
                headerName: 'Health Status',
                sortable: true,
                filter: true,
                flex: 2,
                cellStyle: (params) => {
                    if (params.value === 'serviceOperational')
                        return { color: 'green', fontWeight: 'bold' };
                    if (params.value?.includes('Degradation') || params.value?.includes('investigating'))
                        return { color: 'orange', fontWeight: 'bold' };
                    return { color: 'red', fontWeight: 'bold' };
                }
            },
            {
                field: 'status.activeIncidents',
                headerName: 'Active Incidents',
                sortable: true,
                flex: 1,
                valueGetter: (params) => params.data.status?.activeIncidents || 0,
                cellStyle: (params) => {
                    if (params.value > 0)
                        return { color: 'red', fontWeight: 'bold' };
                    return {};
                }
            },
            {
                field: 'status.activeAdvisories',
                headerName: 'Active Advisories',
                sortable: true,
                flex: 1,
                valueGetter: (params) => params.data.status?.activeAdvisories || 0
            },
            {
                field: 'lastUpdated',
                headerName: 'Last Updated',
                sortable: true,
                filter: true,
                flex: 1,
                valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
            },
        ],
        security: [
            { field: 'displayName', headerName: 'Policy Name', sortable: true, filter: true, flex: 2, pinned: 'left' },
            {
                field: 'state',
                headerName: 'State',
                sortable: true,
                filter: true,
                flex: 1,
                cellStyle: (params) => {
                    if (params.value === 'enabled')
                        return { color: 'green', fontWeight: 'bold' };
                    if (params.value === 'disabled')
                        return { color: 'red' };
                    return { color: 'orange' };
                }
            },
            {
                field: 'createdDateTime',
                headerName: 'Created',
                sortable: true,
                filter: true,
                flex: 1,
                valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
            },
            {
                field: 'modifiedDateTime',
                headerName: 'Modified',
                sortable: true,
                filter: true,
                flex: 1,
                valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
            },
        ],
    }), []);
    return {
        // State
        config: state.config,
        templates: state.templates,
        currentResult: state.currentResult,
        historicalResults: state.historicalResults,
        isDiscovering: state.isDiscovering,
        progress: state.progress,
        selectedTab: state.selectedTab,
        selectedObjects: state.selectedObjects,
        errors: state.errors,
        searchText: state.searchText,
        // Data
        filteredData,
        columnDefs: columnDefs[state.selectedTab] || [],
        // Actions
        startDiscovery,
        cancelDiscovery,
        updateConfig,
        loadTemplate,
        saveAsTemplate,
        exportResults,
        setSelectedTab: (tab) => setState(prev => ({ ...prev, selectedTab: tab })),
        setSearchText: (text) => setState(prev => ({ ...prev, searchText: text })),
        setSelectedObjects: (objects) => setState(prev => ({ ...prev, selectedObjects: objects })),
        updateFilter: (filter) => setState(prev => ({ ...prev, filter: { ...prev.filter, ...filter } })),
    };
};
/**
 * Create default discovery configuration
 */
function createDefaultConfig() {
    return {
        id: generateId(),
        name: 'New Office 365 Discovery',
        tenantId: null,
        tenantDomain: null,
        useCurrentCredentials: true,
        credentialProfileId: null,
        includeTenantInfo: true,
        includeUsers: true,
        includeGuests: true,
        includeLicenses: true,
        includeServices: true,
        includeSecurity: true,
        includeCompliance: true,
        includeConditionalAccess: true,
        includeMFAStatus: true,
        includeAdminRoles: true,
        includeServiceHealth: true,
        includeDomains: true,
        userFilter: null,
        licenseFilter: null,
        departmentFilter: null,
        includeDisabledUsers: false,
        includeDeletedUsers: false,
        maxUsers: null,
        timeout: 600,
        batchSize: 100,
        isScheduled: false,
        schedule: null,
    };
}
/**
 * Create default filter
 */
function createDefaultFilter() {
    return {
        objectType: 'all',
        searchText: '',
        userType: 'all',
        accountStatus: 'all',
        mfaStatus: 'all',
        licenseStatus: 'all',
        adminStatus: 'all',
    };
}
/**
 * Generate unique ID
 */
function generateId() {
    return `o365-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

/***/ 61315:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   E: () => (/* binding */ Badge)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);

/**
 * Badge Component
 *
 * Small label component for status indicators, counts, and tags.
 * Supports multiple variants and sizes.
 */


/**
 * Badge Component
 */
const Badge = ({ children, variant = 'default', size = 'md', dot = false, dotPosition = 'leading', removable = false, onRemove, className, 'data-cy': dataCy, }) => {
    // Variant styles
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-blue-100 text-blue-800 border-blue-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    // Dot color classes
    const dotClasses = {
        default: 'bg-gray-500',
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-cyan-500',
    };
    // Size styles
    const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-sm',
        md: 'px-3 py-1 text-sm',
        lg: 'px-3.5 py-1.5 text-base',
    };
    const dotSizeClasses = {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
    };
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


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


/***/ }),

/***/ 99305:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   d: () => (/* binding */ useDebounce)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/**
 * Debounce Hook
 *
 * Returns a debounced value that only updates after the specified delay.
 * Useful for search inputs and expensive operations.
 */

/**
 * Debounce a value
 * @param value Value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(value);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Set up a timeout to update the debounced value
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Cleanup timeout on value change or unmount
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (useDebounce)));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7QUMvT0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQzRDO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1AsZ0RBQWdELCtDQUFRO0FBQ3hELElBQUksZ0RBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLHNFQUFlLDJEQUFXLElBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VPZmZpY2UzNjVEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9Qcm9ncmVzc0Jhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0JhZGdlLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VEZWJvdW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE9mZmljZSAzNjUgRGlzY292ZXJ5IFZpZXcgTG9naWMgSG9va1xuICogTWFuYWdlcyBzdGF0ZSBhbmQgYnVzaW5lc3MgbG9naWMgZm9yIE9mZmljZSAzNjUgZGlzY292ZXJ5IG9wZXJhdGlvbnNcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZSB9IGZyb20gJy4vdXNlRGVib3VuY2UnO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5U3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZSc7XG4vKipcbiAqIE9mZmljZSAzNjUgRGlzY292ZXJ5IExvZ2ljIEhvb2tcbiAqL1xuZXhwb3J0IGNvbnN0IHVzZU9mZmljZTM2NURpc2NvdmVyeUxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSB9ID0gdXNlRGlzY292ZXJ5U3RvcmUoKTtcbiAgICAvLyBTdGF0ZVxuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IGNyZWF0ZURlZmF1bHRDb25maWcoKSxcbiAgICAgICAgdGVtcGxhdGVzOiBbXSxcbiAgICAgICAgY3VycmVudFJlc3VsdDogbnVsbCxcbiAgICAgICAgaGlzdG9yaWNhbFJlc3VsdHM6IFtdLFxuICAgICAgICBmaWx0ZXI6IGNyZWF0ZURlZmF1bHRGaWx0ZXIoKSxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgc2VsZWN0ZWRUYWI6ICdvdmVydmlldycsXG4gICAgICAgIHNlbGVjdGVkT2JqZWN0czogW10sXG4gICAgICAgIGVycm9yczogW10sXG4gICAgfSk7XG4gICAgY29uc3QgZGVib3VuY2VkU2VhcmNoID0gdXNlRGVib3VuY2Uoc3RhdGUuc2VhcmNoVGV4dCwgMzAwKTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdPZmZpY2UzNjVEaXNjb3ZlcnknKTtcbiAgICAgICAgaWYgKHByZXZpb3VzUmVzdWx0cyAmJiBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tPZmZpY2UzNjVEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RSZXN1bHQgPSBwcmV2aW91c1Jlc3VsdHNbcHJldmlvdXNSZXN1bHRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBjdXJyZW50UmVzdWx0OiBsYXRlc3RSZXN1bHQgfSkpO1xuICAgICAgICB9XG4gICAgfSwgW2dldFJlc3VsdHNCeU1vZHVsZU5hbWVdKTtcbiAgICAvLyBMb2FkIHRlbXBsYXRlcyBhbmQgaGlzdG9yaWNhbCByZXN1bHRzIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFRlbXBsYXRlcygpO1xuICAgICAgICBsb2FkSGlzdG9yaWNhbFJlc3VsdHMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gU3Vic2NyaWJlIHRvIGRpc2NvdmVyeSBwcm9ncmVzc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJPy5vblByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdvZmZpY2UzNjUtZGlzY292ZXJ5Jykge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcHJvZ3Jlc3M6IGRhdGEgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGRpc2NvdmVyeSB0ZW1wbGF0ZXNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkVGVtcGxhdGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9PZmZpY2UzNjVEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LU9mZmljZTM2NURpc2NvdmVyeVRlbXBsYXRlcycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge30sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgdGVtcGxhdGVzOiByZXN1bHQuZGF0YS50ZW1wbGF0ZXMgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdGVtcGxhdGVzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTG9hZCBoaXN0b3JpY2FsIGRpc2NvdmVyeSByZXN1bHRzXG4gICAgICovXG4gICAgY29uc3QgbG9hZEhpc3RvcmljYWxSZXN1bHRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9PZmZpY2UzNjVEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LU9mZmljZTM2NURpc2NvdmVyeUhpc3RvcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgTGltaXQ6IDEwIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgaGlzdG9yaWNhbFJlc3VsdHM6IHJlc3VsdC5kYXRhLnJlc3VsdHMgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgaGlzdG9yaWNhbCByZXN1bHRzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogU3RhcnQgT2ZmaWNlIDM2NSBEaXNjb3ZlcnlcbiAgICAgKi9cbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBpc0Rpc2NvdmVyaW5nOiB0cnVlLCBlcnJvcnM6IFtdLCBwcm9ncmVzczogbnVsbCB9KSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L09mZmljZTM2NURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdJbnZva2UtT2ZmaWNlMzY1RGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFRlbmFudElkOiBzdGF0ZS5jb25maWcudGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgIFRlbmFudERvbWFpbjogc3RhdGUuY29uZmlnLnRlbmFudERvbWFpbixcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVVzZXJzOiBzdGF0ZS5jb25maWcuaW5jbHVkZVVzZXJzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlR3Vlc3RzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUd1ZXN0cyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUxpY2Vuc2VzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUxpY2Vuc2VzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlU2VydmljZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlU2VydmljZXMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVTZWN1cml0eTogc3RhdGUuY29uZmlnLmluY2x1ZGVTZWN1cml0eSxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUNvbXBsaWFuY2U6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQ29tcGxpYW5jZSxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUNvbmRpdGlvbmFsQWNjZXNzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNvbmRpdGlvbmFsQWNjZXNzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlTUZBU3RhdHVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZU1GQVN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUFkbWluUm9sZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQWRtaW5Sb2xlcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVNlcnZpY2VIZWFsdGg6IHN0YXRlLmNvbmZpZy5pbmNsdWRlU2VydmljZUhlYWx0aCxcbiAgICAgICAgICAgICAgICAgICAgU3RyZWFtUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVzdWx0OiBkaXNjb3ZlcnlSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IFsuLi5wcmV2LmVycm9ycywgZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvciBvY2N1cnJlZCddLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmNvbmZpZ10pO1xuICAgIC8qKlxuICAgICAqIENhbmNlbCBvbmdvaW5nIGRpc2NvdmVyeVxuICAgICAqL1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5jdXJyZW50UmVzdWx0Py5pZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvT2ZmaWNlMzY1RGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1N0b3AtT2ZmaWNlMzY1RGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IFJlc3VsdElkOiBzdGF0ZS5jdXJyZW50UmVzdWx0LmlkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgaXNEaXNjb3ZlcmluZzogZmFsc2UsIHByb2dyZXNzOiBudWxsIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jdXJyZW50UmVzdWx0Py5pZF0pO1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBkaXNjb3ZlcnkgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMgfSxcbiAgICAgICAgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGEgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkVGVtcGxhdGUgPSB1c2VDYWxsYmFjaygodGVtcGxhdGUpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGNvbmZpZzogeyAuLi50ZW1wbGF0ZS5jb25maWcsIGlkOiBnZW5lcmF0ZUlkKCkgfSxcbiAgICAgICAgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBTYXZlIGN1cnJlbnQgY29uZmlnIGFzIHRlbXBsYXRlXG4gICAgICovXG4gICAgY29uc3Qgc2F2ZUFzVGVtcGxhdGUgPSB1c2VDYWxsYmFjayhhc3luYyAobmFtZSwgZGVzY3JpcHRpb24sIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBjb25maWc6IHN0YXRlLmNvbmZpZyxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQnk6ICdDdXJyZW50VXNlcicsXG4gICAgICAgICAgICAgICAgaXNTeXN0ZW06IGZhbHNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvT2ZmaWNlMzY1RGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1NhdmUtT2ZmaWNlMzY1RGlzY292ZXJ5VGVtcGxhdGUnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgVGVtcGxhdGU6IHRlbXBsYXRlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGF3YWl0IGxvYWRUZW1wbGF0ZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzYXZlIHRlbXBsYXRlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jb25maWddKTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZGlzY292ZXJ5IHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb25zdCBleHBvcnRSZXN1bHRzID0gdXNlQ2FsbGJhY2soYXN5bmMgKGZvcm1hdCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLmN1cnJlbnRSZXN1bHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L09mZmljZTM2NURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtT2ZmaWNlMzY1RGlzY292ZXJ5UmVzdWx0cycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBSZXN1bHRJZDogc3RhdGUuY3VycmVudFJlc3VsdC5pZCxcbiAgICAgICAgICAgICAgICAgICAgRm9ybWF0OiBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVBbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGV4cG9ydCByZXN1bHRzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jdXJyZW50UmVzdWx0XSk7XG4gICAgLyoqXG4gICAgICogRmlsdGVyIHJlc3VsdHMgYmFzZWQgb24gY3VycmVudCBmaWx0ZXIgc2V0dGluZ3NcbiAgICAgKi9cbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5jdXJyZW50UmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBjb25zdCB7IGZpbHRlciB9ID0gc3RhdGU7XG4gICAgICAgIGxldCBkYXRhID0gW107XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuc2VsZWN0ZWRUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ3VzZXJzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gWy4uLnN0YXRlLmN1cnJlbnRSZXN1bHQudXNlcnMsIC4uLihzdGF0ZS5jdXJyZW50UmVzdWx0Lmd1ZXN0VXNlcnMgfHwgW10pXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xpY2Vuc2VzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUuY3VycmVudFJlc3VsdC5saWNlbnNlcztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlcnZpY2VzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUuY3VycmVudFJlc3VsdC5zZXJ2aWNlcztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlY3VyaXR5JzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUuY3VycmVudFJlc3VsdC5zZWN1cml0eUNvbmZpZz8uY29uZGl0aW9uYWxBY2Nlc3NQb2xpY2llcyB8fCBbXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCB0ZXh0IGZpbHRlclxuICAgICAgICBpZiAoZGVib3VuY2VkU2VhcmNoKSB7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gZGVib3VuY2VkU2VhcmNoLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpdGVtLmRpc3BsYXlOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxuICAgICAgICAgICAgICAgICAgICBpdGVtLnVzZXJQcmluY2lwYWxOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxuICAgICAgICAgICAgICAgICAgICBpdGVtLm1haWw/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ucHJvZHVjdE5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc2VydmljZU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgdXNlciB0eXBlIGZpbHRlclxuICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRUYWIgPT09ICd1c2VycycgJiYgZmlsdGVyLnVzZXJUeXBlICE9PSAnYWxsJykge1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0udXNlclR5cGUgPT09IGZpbHRlci51c2VyVHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgYWNjb3VudCBzdGF0dXMgZmlsdGVyXG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ3VzZXJzJyAmJiBmaWx0ZXIuYWNjb3VudFN0YXR1cyAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVuYWJsZWQgPSBmaWx0ZXIuYWNjb3VudFN0YXR1cyA9PT0gJ2VuYWJsZWQnO1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uYWNjb3VudEVuYWJsZWQgPT09IGVuYWJsZWQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IE1GQSBzdGF0dXMgZmlsdGVyXG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ3VzZXJzJyAmJiBmaWx0ZXIubWZhU3RhdHVzICE9PSAnYWxsJykge1xuICAgICAgICAgICAgY29uc3QgbWZhRW5hYmxlZCA9IGZpbHRlci5tZmFTdGF0dXMgPT09ICdlbmFibGVkJztcbiAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzTUZBID0gaXRlbS5tZmFTdGF0dXM/LnN0YXRlID09PSAnZW5hYmxlZCcgfHwgaXRlbS5tZmFTdGF0dXM/LnN0YXRlID09PSAnZW5mb3JjZWQnO1xuICAgICAgICAgICAgICAgIHJldHVybiBoYXNNRkEgPT09IG1mYUVuYWJsZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBcHBseSBsaWNlbnNlIHN0YXR1cyBmaWx0ZXJcbiAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVGFiID09PSAndXNlcnMnICYmIGZpbHRlci5saWNlbnNlU3RhdHVzICE9PSAnYWxsJykge1xuICAgICAgICAgICAgY29uc3QgaXNMaWNlbnNlZCA9IGZpbHRlci5saWNlbnNlU3RhdHVzID09PSAnbGljZW5zZWQnO1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNMaWNlbnNlID0gaXRlbS5saWNlbnNlcyAmJiBpdGVtLmxpY2Vuc2VzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhc0xpY2Vuc2UgPT09IGlzTGljZW5zZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBcHBseSBhZG1pbiBzdGF0dXMgZmlsdGVyXG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ3VzZXJzJyAmJiBmaWx0ZXIuYWRtaW5TdGF0dXMgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICBjb25zdCBpc0FkbWluID0gZmlsdGVyLmFkbWluU3RhdHVzID09PSAnYWRtaW4nO1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaXNBZG1pbiA9PT0gaXNBZG1pbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSwgW3N0YXRlLnNlbGVjdGVkVGFiLCBzdGF0ZS5jdXJyZW50UmVzdWx0LCBzdGF0ZS5maWx0ZXIsIGRlYm91bmNlZFNlYXJjaF0pO1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBkZWZpbml0aW9ucyBmb3IgQUcgR3JpZFxuICAgICAqL1xuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHVzZXJzOiBbXG4gICAgICAgICAgICB7IGZpZWxkOiAnZGlzcGxheU5hbWUnLCBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMiwgcGlubmVkOiAnbGVmdCcgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICd1c2VyUHJpbmNpcGFsTmFtZScsIGhlYWRlck5hbWU6ICdVUE4nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAyIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnbWFpbCcsIGhlYWRlck5hbWU6ICdFbWFpbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDIgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICd1c2VyVHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYWNjb3VudEVuYWJsZWQnLFxuICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ+KckyBFbmFibGVkJyA6ICfinJcgRGlzYWJsZWQnLFxuICAgICAgICAgICAgICAgIGNlbGxTdHlsZTogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8geyBjb2xvcjogJ2dyZWVuJyB9IDogeyBjb2xvcjogJ3JlZCcgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ21mYVN0YXR1cy5zdGF0ZScsXG4gICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01GQScsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLm1mYVN0YXR1cz8uc3RhdGUgfHwgJ2Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICBjZWxsU3R5bGU6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBwYXJhbXMuZGF0YS5tZmFTdGF0dXM/LnN0YXRlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09ICdlbmFibGVkJyB8fCBzdGF0ZSA9PT0gJ2VuZm9yY2VkJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbG9yOiAnZ3JlZW4nLCBmb250V2VpZ2h0OiAnYm9sZCcgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdyZWQnIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2xpY2Vuc2VzJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnTGljZW5zZXMnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLmxpY2Vuc2VzPy5sZW5ndGggfHwgMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2lzQWRtaW4nLFxuICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBZG1pbicsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAn4pyTIEFkbWluJyA6ICcnLFxuICAgICAgICAgICAgICAgIGNlbGxTdHlsZTogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8geyBjb2xvcjogJ29yYW5nZScsIGZvbnRXZWlnaHQ6ICdib2xkJyB9IDoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IGZpZWxkOiAnZGVwYXJ0bWVudCcsIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ2pvYlRpdGxlJywgaGVhZGVyTmFtZTogJ0pvYiBUaXRsZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDIgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ2xhc3RTaWduSW4nLFxuICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IFNpZ24gSW4nLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpIDogJ05ldmVyJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgbGljZW5zZXM6IFtcbiAgICAgICAgICAgIHsgZmllbGQ6ICdwcm9kdWN0TmFtZScsIGhlYWRlck5hbWU6ICdQcm9kdWN0Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMiwgcGlubmVkOiAnbGVmdCcgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdza3VQYXJ0TnVtYmVyJywgaGVhZGVyTmFtZTogJ1NLVScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3N0YXR1cycsXG4gICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgY2VsbFN0eWxlOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUgPT09ICdhY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdncmVlbicsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnZhbHVlID09PSAnd2FybmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ29yYW5nZScsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ3JlZCcgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnYXNzaWduZWREYXRlJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnQXNzaWduZWQgRGF0ZScsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3NlcnZpY2VQbGFucycsXG4gICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NlcnZpY2UgUGxhbnMnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLnNlcnZpY2VQbGFucz8ubGVuZ3RoIHx8IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdkaXNhYmxlZFBsYW5zJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzYWJsZWQgUGxhbnMnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLmRpc2FibGVkUGxhbnM/Lmxlbmd0aCB8fCAwXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzZXJ2aWNlczogW1xuICAgICAgICAgICAgeyBmaWVsZDogJ2Rpc3BsYXlOYW1lJywgaGVhZGVyTmFtZTogJ1NlcnZpY2UnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAyLCBwaW5uZWQ6ICdsZWZ0JyB9LFxuICAgICAgICAgICAgeyBmaWVsZDogJ3NlcnZpY2VOYW1lJywgaGVhZGVyTmFtZTogJ1NlcnZpY2UgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDIgfSxcbiAgICAgICAgICAgIHsgZmllbGQ6ICdmZWF0dXJlTmFtZScsIGhlYWRlck5hbWU6ICdGZWF0dXJlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMiB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnaGVhbHRoU3RhdHVzJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnSGVhbHRoIFN0YXR1cycsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgICAgICAgICAgY2VsbFN0eWxlOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUgPT09ICdzZXJ2aWNlT3BlcmF0aW9uYWwnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdncmVlbicsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnZhbHVlPy5pbmNsdWRlcygnRGVncmFkYXRpb24nKSB8fCBwYXJhbXMudmFsdWU/LmluY2x1ZGVzKCdpbnZlc3RpZ2F0aW5nJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ29yYW5nZScsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ3JlZCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMuYWN0aXZlSW5jaWRlbnRzJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aXZlIEluY2lkZW50cycsXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGEuc3RhdHVzPy5hY3RpdmVJbmNpZGVudHMgfHwgMCxcbiAgICAgICAgICAgICAgICBjZWxsU3R5bGU6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA+IDApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ3JlZCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWVsZDogJ3N0YXR1cy5hY3RpdmVBZHZpc29yaWVzJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aXZlIEFkdmlzb3JpZXMnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLnN0YXR1cz8uYWN0aXZlQWR2aXNvcmllcyB8fCAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbGFzdFVwZGF0ZWQnLFxuICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IFVwZGF0ZWQnLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc2VjdXJpdHk6IFtcbiAgICAgICAgICAgIHsgZmllbGQ6ICdkaXNwbGF5TmFtZScsIGhlYWRlck5hbWU6ICdQb2xpY3kgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDIsIHBpbm5lZDogJ2xlZnQnIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXRlJyxcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgICBjZWxsU3R5bGU6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA9PT0gJ2VuYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdncmVlbicsIGZvbnRXZWlnaHQ6ICdib2xkJyB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnZhbHVlID09PSAnZGlzYWJsZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdyZWQnIH07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGNvbG9yOiAnb3JhbmdlJyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdjcmVhdGVkRGF0ZVRpbWUnLFxuICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAnbW9kaWZpZWREYXRlVGltZScsXG4gICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01vZGlmaWVkJyxcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pLCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgIHRlbXBsYXRlczogc3RhdGUudGVtcGxhdGVzLFxuICAgICAgICBjdXJyZW50UmVzdWx0OiBzdGF0ZS5jdXJyZW50UmVzdWx0LFxuICAgICAgICBoaXN0b3JpY2FsUmVzdWx0czogc3RhdGUuaGlzdG9yaWNhbFJlc3VsdHMsXG4gICAgICAgIGlzRGlzY292ZXJpbmc6IHN0YXRlLmlzRGlzY292ZXJpbmcsXG4gICAgICAgIHByb2dyZXNzOiBzdGF0ZS5wcm9ncmVzcyxcbiAgICAgICAgc2VsZWN0ZWRUYWI6IHN0YXRlLnNlbGVjdGVkVGFiLFxuICAgICAgICBzZWxlY3RlZE9iamVjdHM6IHN0YXRlLnNlbGVjdGVkT2JqZWN0cyxcbiAgICAgICAgZXJyb3JzOiBzdGF0ZS5lcnJvcnMsXG4gICAgICAgIHNlYXJjaFRleHQ6IHN0YXRlLnNlYXJjaFRleHQsXG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgZmlsdGVyZWREYXRhLFxuICAgICAgICBjb2x1bW5EZWZzOiBjb2x1bW5EZWZzW3N0YXRlLnNlbGVjdGVkVGFiXSB8fCBbXSxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICB1cGRhdGVDb25maWcsXG4gICAgICAgIGxvYWRUZW1wbGF0ZSxcbiAgICAgICAgc2F2ZUFzVGVtcGxhdGUsXG4gICAgICAgIGV4cG9ydFJlc3VsdHMsXG4gICAgICAgIHNldFNlbGVjdGVkVGFiOiAodGFiKSA9PiBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHNlbGVjdGVkVGFiOiB0YWIgfSkpLFxuICAgICAgICBzZXRTZWFyY2hUZXh0OiAodGV4dCkgPT4gc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBzZWFyY2hUZXh0OiB0ZXh0IH0pKSxcbiAgICAgICAgc2V0U2VsZWN0ZWRPYmplY3RzOiAob2JqZWN0cykgPT4gc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBzZWxlY3RlZE9iamVjdHM6IG9iamVjdHMgfSkpLFxuICAgICAgICB1cGRhdGVGaWx0ZXI6IChmaWx0ZXIpID0+IHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgZmlsdGVyOiB7IC4uLnByZXYuZmlsdGVyLCAuLi5maWx0ZXIgfSB9KSksXG4gICAgfTtcbn07XG4vKipcbiAqIENyZWF0ZSBkZWZhdWx0IGRpc2NvdmVyeSBjb25maWd1cmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGdlbmVyYXRlSWQoKSxcbiAgICAgICAgbmFtZTogJ05ldyBPZmZpY2UgMzY1IERpc2NvdmVyeScsXG4gICAgICAgIHRlbmFudElkOiBudWxsLFxuICAgICAgICB0ZW5hbnREb21haW46IG51bGwsXG4gICAgICAgIHVzZUN1cnJlbnRDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgY3JlZGVudGlhbFByb2ZpbGVJZDogbnVsbCxcbiAgICAgICAgaW5jbHVkZVRlbmFudEluZm86IHRydWUsXG4gICAgICAgIGluY2x1ZGVVc2VyczogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZUd1ZXN0czogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZUxpY2Vuc2VzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlU2VydmljZXM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVTZWN1cml0eTogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZUNvbXBsaWFuY2U6IHRydWUsXG4gICAgICAgIGluY2x1ZGVDb25kaXRpb25hbEFjY2VzczogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZU1GQVN0YXR1czogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZUFkbWluUm9sZXM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVTZXJ2aWNlSGVhbHRoOiB0cnVlLFxuICAgICAgICBpbmNsdWRlRG9tYWluczogdHJ1ZSxcbiAgICAgICAgdXNlckZpbHRlcjogbnVsbCxcbiAgICAgICAgbGljZW5zZUZpbHRlcjogbnVsbCxcbiAgICAgICAgZGVwYXJ0bWVudEZpbHRlcjogbnVsbCxcbiAgICAgICAgaW5jbHVkZURpc2FibGVkVXNlcnM6IGZhbHNlLFxuICAgICAgICBpbmNsdWRlRGVsZXRlZFVzZXJzOiBmYWxzZSxcbiAgICAgICAgbWF4VXNlcnM6IG51bGwsXG4gICAgICAgIHRpbWVvdXQ6IDYwMCxcbiAgICAgICAgYmF0Y2hTaXplOiAxMDAsXG4gICAgICAgIGlzU2NoZWR1bGVkOiBmYWxzZSxcbiAgICAgICAgc2NoZWR1bGU6IG51bGwsXG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIGRlZmF1bHQgZmlsdGVyXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRGaWx0ZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb2JqZWN0VHlwZTogJ2FsbCcsXG4gICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICB1c2VyVHlwZTogJ2FsbCcsXG4gICAgICAgIGFjY291bnRTdGF0dXM6ICdhbGwnLFxuICAgICAgICBtZmFTdGF0dXM6ICdhbGwnLFxuICAgICAgICBsaWNlbnNlU3RhdHVzOiAnYWxsJyxcbiAgICAgICAgYWRtaW5TdGF0dXM6ICdhbGwnLFxuICAgIH07XG59XG4vKipcbiAqIEdlbmVyYXRlIHVuaXF1ZSBJRFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUlkKCkge1xuICAgIHJldHVybiBgbzM2NS1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKlxuICogUHJvZ3Jlc3MgaW5kaWNhdG9yIHdpdGggcGVyY2VudGFnZSBkaXNwbGF5IGFuZCBvcHRpb25hbCBsYWJlbC5cbiAqIFN1cHBvcnRzIGRpZmZlcmVudCB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgUHJvZ3Jlc3NCYXIgPSAoeyB2YWx1ZSwgbWF4ID0gMTAwLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgc2hvd0xhYmVsID0gdHJ1ZSwgbGFiZWwsIGxhYmVsUG9zaXRpb24gPSAnaW5zaWRlJywgc3RyaXBlZCA9IGZhbHNlLCBhbmltYXRlZCA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCAodmFsdWUgLyBtYXgpICogMTAwKSk7XG4gICAgLy8gVmFyaWFudCBjb2xvcnNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtNjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTYwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTYwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTYwMCcsXG4gICAgfTtcbiAgICAvLyBCYWNrZ3JvdW5kIGNvbG9yc1xuICAgIGNvbnN0IGJnQ2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtMTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTInLFxuICAgICAgICBtZDogJ2gtNCcsXG4gICAgICAgIGxnOiAnaC02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCd3LWZ1bGwnLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IHRyYWNrQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuJywgYmdDbGFzc2VzW3ZhcmlhbnRdLCBzaXplQ2xhc3Nlc1tzaXplXSk7XG4gICAgY29uc3QgYmFyQ2xhc3NlcyA9IGNsc3goJ2gtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgZWFzZS1vdXQnLCB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwge1xuICAgICAgICAvLyBTdHJpcGVkIHBhdHRlcm5cbiAgICAgICAgJ2JnLWdyYWRpZW50LXRvLXIgZnJvbS10cmFuc3BhcmVudCB2aWEtYmxhY2svMTAgdG8tdHJhbnNwYXJlbnQgYmctW2xlbmd0aDoxcmVtXzEwMCVdJzogc3RyaXBlZCxcbiAgICAgICAgJ2FuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyc6IHN0cmlwZWQgJiYgYW5pbWF0ZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbGFiZWwgfHwgKHNob3dMYWJlbCA/IGAke01hdGgucm91bmQocGVyY2VudGFnZSl9JWAgOiAnJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ291dHNpZGUnICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0xXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IHRyYWNrQ2xhc3Nlcywgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBcImFyaWEtdmFsdWVub3dcIjogdmFsdWUsIFwiYXJpYS12YWx1ZW1pblwiOiAwLCBcImFyaWEtdmFsdWVtYXhcIjogbWF4LCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYmFyQ2xhc3Nlcywgc3R5bGU6IHsgd2lkdGg6IGAke3BlcmNlbnRhZ2V9JWAgfSwgY2hpbGRyZW46IGxhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnaW5zaWRlJyAmJiBzaXplICE9PSAnc20nICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbCBweC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC13aGl0ZSB3aGl0ZXNwYWNlLW5vd3JhcFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSB9KSB9KV0gfSkpO1xufTtcbi8vIEFkZCBhbmltYXRpb24gZm9yIHN0cmlwZWQgcHJvZ3Jlc3MgYmFyc1xuY29uc3Qgc3R5bGVzID0gYFxyXG5Aa2V5ZnJhbWVzIHByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGZyb20ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMXJlbSAwO1xyXG4gIH1cclxuICB0byB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XHJcbiAgfVxyXG59XHJcblxyXG4uYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzIHtcclxuICBhbmltYXRpb246IHByb2dyZXNzLXN0cmlwZXMgMXMgbGluZWFyIGluZmluaXRlO1xyXG59XHJcbmA7XG4vLyBJbmplY3Qgc3R5bGVzXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzLWJhci1zdHlsZXMnKSkge1xuICAgIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlU2hlZXQuaWQgPSAncHJvZ3Jlc3MtYmFyLXN0eWxlcyc7XG4gICAgc3R5bGVTaGVldC50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlU2hlZXQpO1xufVxuZXhwb3J0IGRlZmF1bHQgUHJvZ3Jlc3NCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKlxuICogU2VhcmNoIGlucHV0IHdpdGggaWNvbiwgY2xlYXIgYnV0dG9uLCBhbmQgZGVib3VuY2VkIG9uQ2hhbmdlLlxuICogVXNlZCBmb3IgZmlsdGVyaW5nIGxpc3RzIGFuZCB0YWJsZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IFNlYXJjaCwgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFNlYXJjaEJhciA9ICh7IHZhbHVlOiBjb250cm9sbGVkVmFsdWUgPSAnJywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyID0gJ1NlYXJjaC4uLicsIGRlYm91bmNlRGVsYXkgPSAzMDAsIGRpc2FibGVkID0gZmFsc2UsIHNpemUgPSAnbWQnLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgW2lucHV0VmFsdWUsIHNldElucHV0VmFsdWVdID0gdXNlU3RhdGUoY29udHJvbGxlZFZhbHVlKTtcbiAgICAvLyBTeW5jIHdpdGggY29udHJvbGxlZCB2YWx1ZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoY29udHJvbGxlZFZhbHVlKTtcbiAgICB9LCBbY29udHJvbGxlZFZhbHVlXSk7XG4gICAgLy8gRGVib3VuY2VkIG9uQ2hhbmdlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9uQ2hhbmdlICYmIGlucHV0VmFsdWUgIT09IGNvbnRyb2xsZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKGlucHV0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBkZWJvdW5jZURlbGF5KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbaW5wdXRWYWx1ZSwgb25DaGFuZ2UsIGRlYm91bmNlRGVsYXksIGNvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIGNvbnN0IGhhbmRsZUlucHV0Q2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVDbGVhciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZSgnJyk7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoJycpO1xuICAgICAgICB9XG4gICAgfSwgW29uQ2hhbmdlXSk7XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC04IHRleHQtc20gcHgtMycsXG4gICAgICAgIG1kOiAnaC0xMCB0ZXh0LWJhc2UgcHgtNCcsXG4gICAgICAgIGxnOiAnaC0xMiB0ZXh0LWxnIHB4LTUnLFxuICAgIH07XG4gICAgY29uc3QgaWNvblNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtNCB3LTQnLFxuICAgICAgICBtZDogJ2gtNSB3LTUnLFxuICAgICAgICBsZzogJ2gtNiB3LTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3JlbGF0aXZlIGZsZXggaXRlbXMtY2VudGVyJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ3ctZnVsbCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0zMDAnLCAncGwtMTAgcHItMTAnLCAnYmctd2hpdGUgdGV4dC1ncmF5LTkwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgXG4gICAgLy8gRGlzYWJsZWRcbiAgICB7XG4gICAgICAgICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktNTAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSBsZWZ0LTMgdGV4dC1ncmF5LTQwMCBwb2ludGVyLWV2ZW50cy1ub25lJywgaWNvblNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBpbnB1dFZhbHVlLCBvbkNoYW5nZTogaGFuZGxlSW5wdXRDaGFuZ2UsIHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlciwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWxhYmVsXCI6IFwiU2VhcmNoXCIgfSksIGlucHV0VmFsdWUgJiYgIWRpc2FibGVkICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogaGFuZGxlQ2xlYXIsIGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgcmlnaHQtMycsICd0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIHJvdW5kZWQnLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJyksIFwiYXJpYS1sYWJlbFwiOiBcIkNsZWFyIHNlYXJjaFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogaWNvblNpemVDbGFzc2VzW3NpemVdIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaEJhcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiIsIi8qKlxuICogRGlzY292ZXJ5IFN0b3JlXG4gKlxuICogTWFuYWdlcyBkaXNjb3Zlcnkgb3BlcmF0aW9ucywgcmVzdWx0cywgYW5kIHN0YXRlLlxuICogSGFuZGxlcyBkb21haW4sIG5ldHdvcmssIHVzZXIsIGFuZCBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcHJvY2Vzc2VzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICd6dXN0YW5kJztcbmltcG9ydCB7IGRldnRvb2xzLCBzdWJzY3JpYmVXaXRoU2VsZWN0b3IgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnO1xuZXhwb3J0IGNvbnN0IHVzZURpc2NvdmVyeVN0b3JlID0gY3JlYXRlKCkoZGV2dG9vbHMoc3Vic2NyaWJlV2l0aFNlbGVjdG9yKChzZXQsIGdldCkgPT4gKHtcbiAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgb3BlcmF0aW9uczogbmV3IE1hcCgpLFxuICAgIHJlc3VsdHM6IG5ldyBNYXAoKSxcbiAgICBzZWxlY3RlZE9wZXJhdGlvbjogbnVsbCxcbiAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAvLyBBY3Rpb25zXG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIHN0YXJ0RGlzY292ZXJ5OiBhc3luYyAodHlwZSwgcGFyYW1ldGVycykgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGRpc2NvdmVyeS4uLicsXG4gICAgICAgICAgICBpdGVtc0Rpc2NvdmVyZWQ6IDAsXG4gICAgICAgICAgICBzdGFydGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQWRkIG9wZXJhdGlvbiB0byBzdGF0ZVxuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuc2V0KG9wZXJhdGlvbklkLCBvcGVyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNldHVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzQ2xlYW51cCA9IHdpbmRvdy5lbGVjdHJvbkFQSS5vblByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgZGF0YS5wZXJjZW50YWdlLCBkYXRhLm1lc3NhZ2UgfHwgJ1Byb2Nlc3NpbmcuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGRpc2NvdmVyeSBtb2R1bGVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiBgTW9kdWxlcy9EaXNjb3ZlcnkvJHt0eXBlfS5wc20xYCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGBTdGFydC0ke3R5cGV9RGlzY292ZXJ5YCxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbU91dHB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDbGVhbnVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGdldCgpLmNvbXBsZXRlRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZGF0YT8ucmVzdWx0cyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZXJyb3IgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb25JZDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHJ1bm5pbmcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIGNhbmNlbERpc2NvdmVyeTogYXN5bmMgKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgaWYgKCFvcGVyYXRpb24gfHwgb3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24ob3BlcmF0aW9uLmNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAob3ApIHtcbiAgICAgICAgICAgICAgICAgICAgb3Auc3RhdHVzID0gJ2NhbmNlbGxlZCc7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1lc3NhZ2UgPSAnRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwcm9ncmVzcyBmb3IgYSBydW5uaW5nIG9wZXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiAob3BlcmF0aW9uSWQsIHByb2dyZXNzLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiAmJiBvcGVyYXRpb24uc3RhdHVzID09PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgY29tcGxldGVkIHdpdGggcmVzdWx0c1xuICAgICAqL1xuICAgIGNvbXBsZXRlRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyZWQgJHtyZXN1bHRzLmxlbmd0aH0gaXRlbXNgO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5pdGVtc0Rpc2NvdmVyZWQgPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQob3BlcmF0aW9uSWQsIHJlc3VsdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGZhaWxlZFxuICAgICAqL1xuICAgIGZhaWxEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgZXJyb3IpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyeSBmYWlsZWQ6ICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhIHNpbmdsZSBvcGVyYXRpb24gYW5kIGl0cyByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uID09PSBvcGVyYXRpb25JZCA/IG51bGwgOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9wZXJhdGlvbnMgYW5kIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhckFsbE9wZXJhdGlvbnM6ICgpID0+IHtcbiAgICAgICAgLy8gT25seSBjbGVhciBjb21wbGV0ZWQsIGZhaWxlZCwgb3IgY2FuY2VsbGVkIG9wZXJhdGlvbnNcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBvcGVyYXRpb25dIG9mIG5ld09wZXJhdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0T3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGZvciBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldFJlc3VsdHM6IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgYnkgbW9kdWxlIG5hbWUgKGZvciBwZXJzaXN0ZW50IHJldHJpZXZhbCBhY3Jvc3MgY29tcG9uZW50IHJlbW91bnRzKVxuICAgICAqL1xuICAgIGdldFJlc3VsdHNCeU1vZHVsZU5hbWU6IChtb2R1bGVOYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChtb2R1bGVOYW1lKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEFkZCBhIGRpc2NvdmVyeSByZXN1bHQgKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBhZGRSZXN1bHQ6IChyZXN1bHQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdHMgPSBuZXdSZXN1bHRzLmdldChyZXN1bHQubW9kdWxlTmFtZSkgfHwgW107XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChyZXN1bHQubW9kdWxlTmFtZSwgWy4uLmV4aXN0aW5nUmVzdWx0cywgcmVzdWx0XSk7XG4gICAgICAgICAgICByZXR1cm4geyByZXN1bHRzOiBuZXdSZXN1bHRzIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHByb2dyZXNzIGluZm9ybWF0aW9uIChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgc2V0UHJvZ3Jlc3M6IChwcm9ncmVzc0RhdGEpID0+IHtcbiAgICAgICAgLy8gRmluZCB0aGUgY3VycmVudCBvcGVyYXRpb24gZm9yIHRoaXMgbW9kdWxlIGFuZCB1cGRhdGUgaXRcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9ucyA9IGdldCgpLm9wZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gQXJyYXkuZnJvbShvcGVyYXRpb25zLmtleXMoKSkuZmluZChpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcCA9IG9wZXJhdGlvbnMuZ2V0KGlkKTtcbiAgICAgICAgICAgIHJldHVybiBvcCAmJiBvcC50eXBlID09PSBwcm9ncmVzc0RhdGEubW9kdWxlTmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcGVyYXRpb25JZCkge1xuICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIHByb2dyZXNzRGF0YS5vdmVyYWxsUHJvZ3Jlc3MsIHByb2dyZXNzRGF0YS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KSksIHtcbiAgICBuYW1lOiAnRGlzY292ZXJ5U3RvcmUnLFxufSkpO1xuIiwiLyoqXG4gKiBEZWJvdW5jZSBIb29rXG4gKlxuICogUmV0dXJucyBhIGRlYm91bmNlZCB2YWx1ZSB0aGF0IG9ubHkgdXBkYXRlcyBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5LlxuICogVXNlZnVsIGZvciBzZWFyY2ggaW5wdXRzIGFuZCBleHBlbnNpdmUgb3BlcmF0aW9ucy5cbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogRGVib3VuY2UgYSB2YWx1ZVxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGRlYm91bmNlXG4gKiBAcGFyYW0gZGVsYXkgRGVsYXkgaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiA1MDBtcylcbiAqIEByZXR1cm5zIERlYm91bmNlZCB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVib3VuY2UodmFsdWUsIGRlbGF5ID0gNTAwKSB7XG4gICAgY29uc3QgW2RlYm91bmNlZFZhbHVlLCBzZXREZWJvdW5jZWRWYWx1ZV0gPSB1c2VTdGF0ZSh2YWx1ZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgLy8gU2V0IHVwIGEgdGltZW91dCB0byB1cGRhdGUgdGhlIGRlYm91bmNlZCB2YWx1ZVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXREZWJvdW5jZWRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgLy8gQ2xlYW51cCB0aW1lb3V0IG9uIHZhbHVlIGNoYW5nZSBvciB1bm1vdW50XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW3ZhbHVlLCBkZWxheV0pO1xuICAgIHJldHVybiBkZWJvdW5jZWRWYWx1ZTtcbn1cbmV4cG9ydCBkZWZhdWx0IHVzZURlYm91bmNlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9