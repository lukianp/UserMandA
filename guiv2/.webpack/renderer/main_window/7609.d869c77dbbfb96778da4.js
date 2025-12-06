"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7609],{

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

/***/ 53011:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  a: () => (/* binding */ useOneDriveDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/onedrive.ts
/**
 * OneDrive Discovery Type Definitions
 * Comprehensive types for OneDrive/OneDrive for Business discovery operations
 */
/**
 * Default configuration factory
 */
const createDefaultOneDriveConfig = () => ({
    id: crypto.randomUUID(),
    name: 'New OneDrive Discovery',
    description: '',
    includePersonalOneDrive: true,
    includeBusinessOneDrive: true,
    includeSharedLibraries: false,
    discoverAccounts: true,
    discoverFiles: true,
    discoverSharing: true,
    discoverVersions: false,
    discoverPermissions: true,
    userFilter: null,
    minFileSize: null,
    maxFileSize: null,
    fileExtensions: [],
    modifiedAfter: null,
    modifiedBefore: null,
    includeExternalShares: true,
    includeAnonymousShares: true,
    includeExpiredShares: false,
    scanForMalware: true,
    checkSensitivityLabels: true,
    identifyOversharing: true,
    maxConcurrentRequests: 5,
    pageSize: 100,
    throttleDelayMs: 100,
    timeout: 3600,
    tenantId: null,
    credentialId: null,
    isScheduled: false,
    schedule: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});
/**
 * Default filter factory
 */
const createDefaultOneDriveFilter = () => ({
    accountStatus: null,
    accountType: null,
    minStorageUsed: null,
    maxStorageUsed: null,
    storageUsagePercentage: null,
    fileTypes: null,
    fileSizeRange: null,
    modifiedDateRange: null,
    sharingStatus: null,
    shareTypes: null,
    shareStatus: null,
    riskLevel: null,
    hasMalware: null,
    hasExternalAccess: null,
    hasAnonymousAccess: null,
    isClassified: null,
    searchQuery: null,
});

// EXTERNAL MODULE: ./src/renderer/hooks/useDebounce.ts
var useDebounce = __webpack_require__(99305);
;// ./src/renderer/hooks/useOneDriveDiscoveryLogic.ts
/**
 * OneDrive Discovery View Logic Hook
 * Manages state and business logic for OneDrive discovery operations
 */



/**
 * OneDrive Discovery Logic Hook
 */
const useOneDriveDiscoveryLogic = () => {
    // State
    const [state, setState] = (0,react.useState)({
        config: createDefaultOneDriveConfig(),
        templates: [],
        currentResult: null,
        historicalResults: [],
        filter: createDefaultOneDriveFilter(),
        searchText: '',
        isDiscovering: false,
        progress: null,
        selectedTab: 'overview',
        selectedObjects: [],
        errors: [],
    });
    const debouncedSearch = (0,useDebounce/* useDebounce */.d)(state.searchText, 300);
    // Load templates and historical results on mount
    (0,react.useEffect)(() => {
        loadTemplates();
        loadHistoricalResults();
    }, []);
    // Subscribe to discovery progress
    (0,react.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'onedrive-discovery') {
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
                modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
                functionName: 'Get-OneDriveDiscoveryTemplates',
                parameters: {},
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, templates: result.data.templates }));
            }
        }
        catch (error) {
            console.error('Failed to load OneDrive discovery templates:', error);
        }
    };
    /**
     * Load historical discovery results
     */
    const loadHistoricalResults = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
                functionName: 'Get-OneDriveDiscoveryHistory',
                parameters: { limit: 10 },
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, historicalResults: result.data.results }));
            }
        }
        catch (error) {
            console.error('Failed to load OneDrive discovery history:', error);
        }
    };
    /**
     * Start OneDrive discovery
     */
    const startDiscovery = async () => {
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            progress: null,
            errors: [],
        }));
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
                functionName: 'Invoke-OneDriveDiscovery',
                parameters: { config: state.config },
                options: { streamOutput: true },
            });
            if (result.success && result.data) {
                setState(prev => ({
                    ...prev,
                    currentResult: result.data,
                    isDiscovering: false,
                    progress: null,
                }));
                await loadHistoricalResults();
            }
            else {
                setState(prev => ({
                    ...prev,
                    errors: [result.error || 'Discovery failed'],
                    isDiscovering: false,
                    progress: null,
                }));
            }
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                errors: [error.message || 'Discovery failed unexpectedly'],
                isDiscovering: false,
                progress: null,
            }));
        }
    };
    /**
     * Cancel ongoing discovery
     */
    const cancelDiscovery = async () => {
        try {
            await window.electronAPI.cancelExecution('onedrive-discovery');
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                progress: null,
            }));
        }
        catch (error) {
            console.error('Failed to cancel OneDrive discovery:', error);
        }
    };
    /**
     * Update configuration
     */
    const updateConfig = (0,react.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            config: { ...prev.config, ...updates, updatedAt: new Date().toISOString() },
        }));
    }, []);
    /**
     * Load a template
     */
    const loadTemplate = (0,react.useCallback)((template) => {
        setState(prev => ({
            ...prev,
            config: { ...template.config, id: crypto.randomUUID() },
        }));
    }, []);
    /**
     * Save current config as template
     */
    const saveAsTemplate = async (name, description) => {
        try {
            const template = {
                id: crypto.randomUUID(),
                name,
                description,
                category: 'custom',
                config: state.config,
                isDefault: false,
                isReadOnly: false,
                tags: [],
                author: null,
                version: '1.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/OneDriveDiscovery.psm1',
                functionName: 'Save-OneDriveDiscoveryTemplate',
                parameters: { template },
            });
            await loadTemplates();
        }
        catch (error) {
            console.error('Failed to save OneDrive discovery template:', error);
        }
    };
    /**
     * Export discovery results
     */
    const exportResults = async (format) => {
        if (!state.currentResult)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Reporting/ExportService.psm1',
                functionName: 'Export-OneDriveDiscoveryResults',
                parameters: {
                    result: state.currentResult,
                    format,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Failed to export OneDrive discovery results:', error);
        }
    };
    /**
     * Update filter
     */
    const updateFilter = (0,react.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            filter: { ...prev.filter, ...updates },
        }));
    }, []);
    /**
     * Set selected tab
     */
    const setSelectedTab = (0,react.useCallback)((tab) => {
        setState(prev => ({ ...prev, selectedTab: tab }));
    }, []);
    /**
     * Set search text
     */
    const setSearchText = (0,react.useCallback)((text) => {
        setState(prev => ({ ...prev, searchText: text }));
    }, []);
    /**
     * Get filtered data based on current tab
     */
    const filteredData = (0,react.useMemo)(() => {
        if (!state.currentResult)
            return [];
        let data = [];
        switch (state.selectedTab) {
            case 'accounts':
                data = state.currentResult.accounts;
                break;
            case 'files':
                data = state.currentResult.files;
                break;
            case 'sharing':
                data = state.currentResult.sharing;
                break;
            default:
                return [];
        }
        // Apply search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            data = (data ?? []).filter((item) => Object.values(item).some(value => String(value).toLowerCase().includes(searchLower)));
        }
        // Apply filters based on tab
        if (state.selectedTab === 'accounts' && state.filter.accountStatus) {
            data = (data ?? []).filter((account) => state.filter.accountStatus?.includes(account.status));
        }
        if (state.selectedTab === 'files' && state.filter.fileTypes) {
            data = (data ?? []).filter((file) => state.filter.fileTypes?.includes(file.extension));
        }
        if (state.selectedTab === 'sharing' && state.filter.riskLevel) {
            data = (data ?? []).filter((share) => state.filter.riskLevel?.includes(share.securityRisk));
        }
        return data;
    }, [state.currentResult, state.selectedTab, debouncedSearch, state.filter]);
    /**
     * Column definitions for AG Grid
     */
    const columnDefs = (0,react.useMemo)(() => {
        switch (state.selectedTab) {
            case 'accounts':
                return [
                    { field: 'userPrincipalName', headerName: 'User', sortable: true, filter: true, pinned: 'left' },
                    { field: 'displayName', headerName: 'Display Name', sortable: true, filter: true },
                    { field: 'accountType', headerName: 'Type', sortable: true, filter: true },
                    {
                        field: 'storageUsed',
                        headerName: 'Storage Used',
                        sortable: true,
                        valueFormatter: (params) => formatBytes(params.value),
                    },
                    {
                        field: 'storageQuota',
                        headerName: 'Quota',
                        sortable: true,
                        valueFormatter: (params) => formatBytes(params.value),
                    },
                    {
                        field: 'storagePercentUsed',
                        headerName: 'Usage %',
                        sortable: true,
                        valueFormatter: (params) => `${params.value.toFixed(1)}%`,
                    },
                    { field: 'totalFiles', headerName: 'Files', sortable: true },
                    { field: 'totalFolders', headerName: 'Folders', sortable: true },
                    { field: 'sharedFiles', headerName: 'Shared', sortable: true },
                    { field: 'externalShares', headerName: 'External', sortable: true },
                    { field: 'status', headerName: 'Status', sortable: true, filter: true },
                ];
            case 'files':
                return [
                    { field: 'name', headerName: 'Name', sortable: true, filter: true, pinned: 'left' },
                    { field: 'relativePath', headerName: 'Path', sortable: true, filter: true },
                    { field: 'owner', headerName: 'Owner', sortable: true, filter: true },
                    {
                        field: 'size',
                        headerName: 'Size',
                        sortable: true,
                        valueFormatter: (params) => formatBytes(params.value),
                    },
                    { field: 'extension', headerName: 'Type', sortable: true, filter: true },
                    {
                        field: 'modifiedDate',
                        headerName: 'Modified',
                        sortable: true,
                        valueFormatter: (params) => formatDate(params.value),
                    },
                    { field: 'sharingType', headerName: 'Sharing', sortable: true, filter: true },
                    { field: 'shareCount', headerName: 'Share Count', sortable: true },
                    { field: 'sensitivityLabel', headerName: 'Label', sortable: true, filter: true },
                    { field: 'securityRiskLevel', headerName: 'Risk', sortable: true, filter: true },
                ];
            case 'sharing':
                return [
                    { field: 'fileName', headerName: 'File', sortable: true, filter: true, pinned: 'left' },
                    { field: 'filePath', headerName: 'Path', sortable: true, filter: true },
                    { field: 'fileOwner', headerName: 'Owner', sortable: true, filter: true },
                    { field: 'shareType', headerName: 'Type', sortable: true, filter: true },
                    { field: 'linkType', headerName: 'Access', sortable: true, filter: true },
                    { field: 'recipientCount', headerName: 'Recipients', sortable: true },
                    { field: 'externalRecipientCount', headerName: 'External', sortable: true },
                    {
                        field: 'createdDate',
                        headerName: 'Created',
                        sortable: true,
                        valueFormatter: (params) => formatDate(params.value),
                    },
                    {
                        field: 'expirationDate',
                        headerName: 'Expires',
                        sortable: true,
                        valueFormatter: (params) => params.value ? formatDate(params.value) : 'Never',
                    },
                    { field: 'viewCount', headerName: 'Views', sortable: true },
                    { field: 'downloadCount', headerName: 'Downloads', sortable: true },
                    { field: 'securityRisk', headerName: 'Risk', sortable: true, filter: true },
                    { field: 'status', headerName: 'Status', sortable: true, filter: true },
                ];
            default:
                return [];
        }
    }, [state.selectedTab]);
    // Helper functions
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    };
    return {
        // State
        config: state.config,
        templates: state.templates,
        currentResult: state.currentResult,
        historicalResults: state.historicalResults,
        filter: state.filter,
        searchText: state.searchText,
        isDiscovering: state.isDiscovering,
        progress: state.progress,
        selectedTab: state.selectedTab,
        selectedObjects: state.selectedObjects,
        errors: state.errors,
        // Data
        filteredData,
        columnDefs,
        // Actions
        startDiscovery,
        cancelDiscovery,
        updateConfig,
        loadTemplate,
        saveAsTemplate,
        exportResults,
        updateFilter,
        setSelectedTab,
        setSearchText,
    };
};


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLG9GQUFvRixJQUFJLHNEQUFJLFdBQVcsb0JBQW9CLHlDQUF5QyxzREFBSSxXQUFXLFdBQVcsbURBQUksb0ZBQW9GLDhCQUE4QixzREFBSSxhQUFhLDhDQUE4QyxtREFBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLG1EQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDOzs7Ozs7Ozs7Ozs7QUMzRHJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUM0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLGdEQUFnRCwrQ0FBUTtBQUN4RCxJQUFJLGdEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxzRUFBZSwyREFBVyxJQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3R5cGVzL21vZGVscy9vbmVkcml2ZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VPbmVEcml2ZURpc2NvdmVyeUxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlRGVib3VuY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKlxuICogUHJvZ3Jlc3MgaW5kaWNhdG9yIHdpdGggcGVyY2VudGFnZSBkaXNwbGF5IGFuZCBvcHRpb25hbCBsYWJlbC5cbiAqIFN1cHBvcnRzIGRpZmZlcmVudCB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgUHJvZ3Jlc3NCYXIgPSAoeyB2YWx1ZSwgbWF4ID0gMTAwLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgc2hvd0xhYmVsID0gdHJ1ZSwgbGFiZWwsIGxhYmVsUG9zaXRpb24gPSAnaW5zaWRlJywgc3RyaXBlZCA9IGZhbHNlLCBhbmltYXRlZCA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCAodmFsdWUgLyBtYXgpICogMTAwKSk7XG4gICAgLy8gVmFyaWFudCBjb2xvcnNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtNjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTYwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTYwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTYwMCcsXG4gICAgfTtcbiAgICAvLyBCYWNrZ3JvdW5kIGNvbG9yc1xuICAgIGNvbnN0IGJnQ2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtMTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTInLFxuICAgICAgICBtZDogJ2gtNCcsXG4gICAgICAgIGxnOiAnaC02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCd3LWZ1bGwnLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IHRyYWNrQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuJywgYmdDbGFzc2VzW3ZhcmlhbnRdLCBzaXplQ2xhc3Nlc1tzaXplXSk7XG4gICAgY29uc3QgYmFyQ2xhc3NlcyA9IGNsc3goJ2gtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgZWFzZS1vdXQnLCB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwge1xuICAgICAgICAvLyBTdHJpcGVkIHBhdHRlcm5cbiAgICAgICAgJ2JnLWdyYWRpZW50LXRvLXIgZnJvbS10cmFuc3BhcmVudCB2aWEtYmxhY2svMTAgdG8tdHJhbnNwYXJlbnQgYmctW2xlbmd0aDoxcmVtXzEwMCVdJzogc3RyaXBlZCxcbiAgICAgICAgJ2FuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyc6IHN0cmlwZWQgJiYgYW5pbWF0ZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbGFiZWwgfHwgKHNob3dMYWJlbCA/IGAke01hdGgucm91bmQocGVyY2VudGFnZSl9JWAgOiAnJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ291dHNpZGUnICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0xXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IHRyYWNrQ2xhc3Nlcywgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBcImFyaWEtdmFsdWVub3dcIjogdmFsdWUsIFwiYXJpYS12YWx1ZW1pblwiOiAwLCBcImFyaWEtdmFsdWVtYXhcIjogbWF4LCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYmFyQ2xhc3Nlcywgc3R5bGU6IHsgd2lkdGg6IGAke3BlcmNlbnRhZ2V9JWAgfSwgY2hpbGRyZW46IGxhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnaW5zaWRlJyAmJiBzaXplICE9PSAnc20nICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbCBweC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC13aGl0ZSB3aGl0ZXNwYWNlLW5vd3JhcFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSB9KSB9KV0gfSkpO1xufTtcbi8vIEFkZCBhbmltYXRpb24gZm9yIHN0cmlwZWQgcHJvZ3Jlc3MgYmFyc1xuY29uc3Qgc3R5bGVzID0gYFxyXG5Aa2V5ZnJhbWVzIHByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGZyb20ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMXJlbSAwO1xyXG4gIH1cclxuICB0byB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XHJcbiAgfVxyXG59XHJcblxyXG4uYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzIHtcclxuICBhbmltYXRpb246IHByb2dyZXNzLXN0cmlwZXMgMXMgbGluZWFyIGluZmluaXRlO1xyXG59XHJcbmA7XG4vLyBJbmplY3Qgc3R5bGVzXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzLWJhci1zdHlsZXMnKSkge1xuICAgIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlU2hlZXQuaWQgPSAncHJvZ3Jlc3MtYmFyLXN0eWxlcyc7XG4gICAgc3R5bGVTaGVldC50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlU2hlZXQpO1xufVxuZXhwb3J0IGRlZmF1bHQgUHJvZ3Jlc3NCYXI7XG4iLCIvKipcbiAqIE9uZURyaXZlIERpc2NvdmVyeSBUeXBlIERlZmluaXRpb25zXG4gKiBDb21wcmVoZW5zaXZlIHR5cGVzIGZvciBPbmVEcml2ZS9PbmVEcml2ZSBmb3IgQnVzaW5lc3MgZGlzY292ZXJ5IG9wZXJhdGlvbnNcbiAqL1xuLyoqXG4gKiBEZWZhdWx0IGNvbmZpZ3VyYXRpb24gZmFjdG9yeVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlRGVmYXVsdE9uZURyaXZlQ29uZmlnID0gKCkgPT4gKHtcbiAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICBuYW1lOiAnTmV3IE9uZURyaXZlIERpc2NvdmVyeScsXG4gICAgZGVzY3JpcHRpb246ICcnLFxuICAgIGluY2x1ZGVQZXJzb25hbE9uZURyaXZlOiB0cnVlLFxuICAgIGluY2x1ZGVCdXNpbmVzc09uZURyaXZlOiB0cnVlLFxuICAgIGluY2x1ZGVTaGFyZWRMaWJyYXJpZXM6IGZhbHNlLFxuICAgIGRpc2NvdmVyQWNjb3VudHM6IHRydWUsXG4gICAgZGlzY292ZXJGaWxlczogdHJ1ZSxcbiAgICBkaXNjb3ZlclNoYXJpbmc6IHRydWUsXG4gICAgZGlzY292ZXJWZXJzaW9uczogZmFsc2UsXG4gICAgZGlzY292ZXJQZXJtaXNzaW9uczogdHJ1ZSxcbiAgICB1c2VyRmlsdGVyOiBudWxsLFxuICAgIG1pbkZpbGVTaXplOiBudWxsLFxuICAgIG1heEZpbGVTaXplOiBudWxsLFxuICAgIGZpbGVFeHRlbnNpb25zOiBbXSxcbiAgICBtb2RpZmllZEFmdGVyOiBudWxsLFxuICAgIG1vZGlmaWVkQmVmb3JlOiBudWxsLFxuICAgIGluY2x1ZGVFeHRlcm5hbFNoYXJlczogdHJ1ZSxcbiAgICBpbmNsdWRlQW5vbnltb3VzU2hhcmVzOiB0cnVlLFxuICAgIGluY2x1ZGVFeHBpcmVkU2hhcmVzOiBmYWxzZSxcbiAgICBzY2FuRm9yTWFsd2FyZTogdHJ1ZSxcbiAgICBjaGVja1NlbnNpdGl2aXR5TGFiZWxzOiB0cnVlLFxuICAgIGlkZW50aWZ5T3ZlcnNoYXJpbmc6IHRydWUsXG4gICAgbWF4Q29uY3VycmVudFJlcXVlc3RzOiA1LFxuICAgIHBhZ2VTaXplOiAxMDAsXG4gICAgdGhyb3R0bGVEZWxheU1zOiAxMDAsXG4gICAgdGltZW91dDogMzYwMCxcbiAgICB0ZW5hbnRJZDogbnVsbCxcbiAgICBjcmVkZW50aWFsSWQ6IG51bGwsXG4gICAgaXNTY2hlZHVsZWQ6IGZhbHNlLFxuICAgIHNjaGVkdWxlOiBudWxsLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxufSk7XG4vKipcbiAqIERlZmF1bHQgZmlsdGVyIGZhY3RvcnlcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZURlZmF1bHRPbmVEcml2ZUZpbHRlciA9ICgpID0+ICh7XG4gICAgYWNjb3VudFN0YXR1czogbnVsbCxcbiAgICBhY2NvdW50VHlwZTogbnVsbCxcbiAgICBtaW5TdG9yYWdlVXNlZDogbnVsbCxcbiAgICBtYXhTdG9yYWdlVXNlZDogbnVsbCxcbiAgICBzdG9yYWdlVXNhZ2VQZXJjZW50YWdlOiBudWxsLFxuICAgIGZpbGVUeXBlczogbnVsbCxcbiAgICBmaWxlU2l6ZVJhbmdlOiBudWxsLFxuICAgIG1vZGlmaWVkRGF0ZVJhbmdlOiBudWxsLFxuICAgIHNoYXJpbmdTdGF0dXM6IG51bGwsXG4gICAgc2hhcmVUeXBlczogbnVsbCxcbiAgICBzaGFyZVN0YXR1czogbnVsbCxcbiAgICByaXNrTGV2ZWw6IG51bGwsXG4gICAgaGFzTWFsd2FyZTogbnVsbCxcbiAgICBoYXNFeHRlcm5hbEFjY2VzczogbnVsbCxcbiAgICBoYXNBbm9ueW1vdXNBY2Nlc3M6IG51bGwsXG4gICAgaXNDbGFzc2lmaWVkOiBudWxsLFxuICAgIHNlYXJjaFF1ZXJ5OiBudWxsLFxufSk7XG4iLCIvKipcbiAqIE9uZURyaXZlIERpc2NvdmVyeSBWaWV3IExvZ2ljIEhvb2tcbiAqIE1hbmFnZXMgc3RhdGUgYW5kIGJ1c2luZXNzIGxvZ2ljIGZvciBPbmVEcml2ZSBkaXNjb3Zlcnkgb3BlcmF0aW9uc1xuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNyZWF0ZURlZmF1bHRPbmVEcml2ZUNvbmZpZywgY3JlYXRlRGVmYXVsdE9uZURyaXZlRmlsdGVyLCB9IGZyb20gJy4uL3R5cGVzL21vZGVscy9vbmVkcml2ZSc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZSB9IGZyb20gJy4vdXNlRGVib3VuY2UnO1xuLyoqXG4gKiBPbmVEcml2ZSBEaXNjb3ZlcnkgTG9naWMgSG9va1xuICovXG5leHBvcnQgY29uc3QgdXNlT25lRHJpdmVEaXNjb3ZlcnlMb2dpYyA9ICgpID0+IHtcbiAgICAvLyBTdGF0ZVxuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IGNyZWF0ZURlZmF1bHRPbmVEcml2ZUNvbmZpZygpLFxuICAgICAgICB0ZW1wbGF0ZXM6IFtdLFxuICAgICAgICBjdXJyZW50UmVzdWx0OiBudWxsLFxuICAgICAgICBoaXN0b3JpY2FsUmVzdWx0czogW10sXG4gICAgICAgIGZpbHRlcjogY3JlYXRlRGVmYXVsdE9uZURyaXZlRmlsdGVyKCksXG4gICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IG51bGwsXG4gICAgICAgIHNlbGVjdGVkVGFiOiAnb3ZlcnZpZXcnLFxuICAgICAgICBzZWxlY3RlZE9iamVjdHM6IFtdLFxuICAgICAgICBlcnJvcnM6IFtdLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlYXJjaCA9IHVzZURlYm91bmNlKHN0YXRlLnNlYXJjaFRleHQsIDMwMCk7XG4gICAgLy8gTG9hZCB0ZW1wbGF0ZXMgYW5kIGhpc3RvcmljYWwgcmVzdWx0cyBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRUZW1wbGF0ZXMoKTtcbiAgICAgICAgbG9hZEhpc3RvcmljYWxSZXN1bHRzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIFN1YnNjcmliZSB0byBkaXNjb3ZlcnkgcHJvZ3Jlc3NcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZSA9IHdpbmRvdy5lbGVjdHJvbkFQST8ub25Qcm9ncmVzcz8uKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnb25lZHJpdmUtZGlzY292ZXJ5Jykge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcHJvZ3Jlc3M6IGRhdGEgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZSlcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGRpc2NvdmVyeSB0ZW1wbGF0ZXNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkVGVtcGxhdGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9PbmVEcml2ZURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtT25lRHJpdmVEaXNjb3ZlcnlUZW1wbGF0ZXMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHRlbXBsYXRlczogcmVzdWx0LmRhdGEudGVtcGxhdGVzIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIE9uZURyaXZlIGRpc2NvdmVyeSB0ZW1wbGF0ZXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGhpc3RvcmljYWwgZGlzY292ZXJ5IHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkSGlzdG9yaWNhbFJlc3VsdHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L09uZURyaXZlRGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0dldC1PbmVEcml2ZURpc2NvdmVyeUhpc3RvcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgbGltaXQ6IDEwIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgaGlzdG9yaWNhbFJlc3VsdHM6IHJlc3VsdC5kYXRhLnJlc3VsdHMgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgT25lRHJpdmUgZGlzY292ZXJ5IGhpc3Rvcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTdGFydCBPbmVEcml2ZSBkaXNjb3ZlcnlcbiAgICAgKi9cbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgIGVycm9yczogW10sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvT25lRHJpdmVEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLU9uZURyaXZlRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IGNvbmZpZzogc3RhdGUuY29uZmlnIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczogeyBzdHJlYW1PdXRwdXQ6IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVzdWx0OiByZXN1bHQuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBsb2FkSGlzdG9yaWNhbFJlc3VsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiBbcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJ10sXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBlcnJvcnM6IFtlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkIHVuZXhwZWN0ZWRseSddLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgb25nb2luZyBkaXNjb3ZlcnlcbiAgICAgKi9cbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKCdvbmVkcml2ZS1kaXNjb3ZlcnknKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBPbmVEcml2ZSBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMsIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0sXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhIHRlbXBsYXRlXG4gICAgICovXG4gICAgY29uc3QgbG9hZFRlbXBsYXRlID0gdXNlQ2FsbGJhY2soKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4udGVtcGxhdGUuY29uZmlnLCBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSB9LFxuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFNhdmUgY3VycmVudCBjb25maWcgYXMgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBjb25zdCBzYXZlQXNUZW1wbGF0ZSA9IGFzeW5jIChuYW1lLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2N1c3RvbScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc1JlYWRPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICAgICAgICBhdXRob3I6IG51bGwsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMCcsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9PbmVEcml2ZURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdTYXZlLU9uZURyaXZlRGlzY292ZXJ5VGVtcGxhdGUnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgdGVtcGxhdGUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXdhaXQgbG9hZFRlbXBsYXRlcygpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHNhdmUgT25lRHJpdmUgZGlzY292ZXJ5IHRlbXBsYXRlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGRpc2NvdmVyeSByZXN1bHRzXG4gICAgICovXG4gICAgY29uc3QgZXhwb3J0UmVzdWx0cyA9IGFzeW5jIChmb3JtYXQpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5jdXJyZW50UmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL1JlcG9ydGluZy9FeHBvcnRTZXJ2aWNlLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1PbmVEcml2ZURpc2NvdmVyeVJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBzdGF0ZS5jdXJyZW50UmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBleHBvcnQgT25lRHJpdmUgZGlzY292ZXJ5IHJlc3VsdHM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZmlsdGVyXG4gICAgICovXG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGZpbHRlcjogeyAuLi5wcmV2LmZpbHRlciwgLi4udXBkYXRlcyB9LFxuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFNldCBzZWxlY3RlZCB0YWJcbiAgICAgKi9cbiAgICBjb25zdCBzZXRTZWxlY3RlZFRhYiA9IHVzZUNhbGxiYWNrKCh0YWIpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBzZWxlY3RlZFRhYjogdGFiIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogU2V0IHNlYXJjaCB0ZXh0XG4gICAgICovXG4gICAgY29uc3Qgc2V0U2VhcmNoVGV4dCA9IHVzZUNhbGxiYWNrKCh0ZXh0KSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgc2VhcmNoVGV4dDogdGV4dCB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIEdldCBmaWx0ZXJlZCBkYXRhIGJhc2VkIG9uIGN1cnJlbnQgdGFiXG4gICAgICovXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUuY3VycmVudFJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5zZWxlY3RlZFRhYikge1xuICAgICAgICAgICAgY2FzZSAnYWNjb3VudHMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5jdXJyZW50UmVzdWx0LmFjY291bnRzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZmlsZXMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5jdXJyZW50UmVzdWx0LmZpbGVzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2hhcmluZyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLmN1cnJlbnRSZXN1bHQuc2hhcmluZztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCBmaWx0ZXJcbiAgICAgICAgaWYgKGRlYm91bmNlZFNlYXJjaCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBkZWJvdW5jZWRTZWFyY2gudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKChpdGVtKSA9PiBPYmplY3QudmFsdWVzKGl0ZW0pLnNvbWUodmFsdWUgPT4gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IGZpbHRlcnMgYmFzZWQgb24gdGFiXG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ2FjY291bnRzJyAmJiBzdGF0ZS5maWx0ZXIuYWNjb3VudFN0YXR1cykge1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGFjY291bnQpID0+IHN0YXRlLmZpbHRlci5hY2NvdW50U3RhdHVzPy5pbmNsdWRlcyhhY2NvdW50LnN0YXR1cykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ2ZpbGVzJyAmJiBzdGF0ZS5maWx0ZXIuZmlsZVR5cGVzKSB7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoZmlsZSkgPT4gc3RhdGUuZmlsdGVyLmZpbGVUeXBlcz8uaW5jbHVkZXMoZmlsZS5leHRlbnNpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRUYWIgPT09ICdzaGFyaW5nJyAmJiBzdGF0ZS5maWx0ZXIucmlza0xldmVsKSB7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoc2hhcmUpID0+IHN0YXRlLmZpbHRlci5yaXNrTGV2ZWw/LmluY2x1ZGVzKHNoYXJlLnNlY3VyaXR5UmlzaykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIFtzdGF0ZS5jdXJyZW50UmVzdWx0LCBzdGF0ZS5zZWxlY3RlZFRhYiwgZGVib3VuY2VkU2VhcmNoLCBzdGF0ZS5maWx0ZXJdKTtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgZm9yIEFHIEdyaWRcbiAgICAgKi9cbiAgICBjb25zdCBjb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuc2VsZWN0ZWRUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ2FjY291bnRzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAndXNlclByaW5jaXBhbE5hbWUnLCBoZWFkZXJOYW1lOiAnVXNlcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHBpbm5lZDogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdkaXNwbGF5TmFtZScsIGhlYWRlck5hbWU6ICdEaXNwbGF5IE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdhY2NvdW50VHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogJ3N0b3JhZ2VVc2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdG9yYWdlIFVzZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gZm9ybWF0Qnl0ZXMocGFyYW1zLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdzdG9yYWdlUXVvdGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1F1b3RhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdEJ5dGVzKHBhcmFtcy52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkOiAnc3RvcmFnZVBlcmNlbnRVc2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVc2FnZSAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAke3BhcmFtcy52YWx1ZS50b0ZpeGVkKDEpfSVgLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAndG90YWxGaWxlcycsIGhlYWRlck5hbWU6ICdGaWxlcycsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd0b3RhbEZvbGRlcnMnLCBoZWFkZXJOYW1lOiAnRm9sZGVycycsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdzaGFyZWRGaWxlcycsIGhlYWRlck5hbWU6ICdTaGFyZWQnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnZXh0ZXJuYWxTaGFyZXMnLCBoZWFkZXJOYW1lOiAnRXh0ZXJuYWwnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgY2FzZSAnZmlsZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ05hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBwaW5uZWQ6ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAncmVsYXRpdmVQYXRoJywgaGVhZGVyTmFtZTogJ1BhdGgnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdvd25lcicsIGhlYWRlck5hbWU6ICdPd25lcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdzaXplJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTaXplJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdEJ5dGVzKHBhcmFtcy52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdleHRlbnNpb24nLCBoZWFkZXJOYW1lOiAnVHlwZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdtb2RpZmllZERhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01vZGlmaWVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdERhdGUocGFyYW1zLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3NoYXJpbmdUeXBlJywgaGVhZGVyTmFtZTogJ1NoYXJpbmcnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdzaGFyZUNvdW50JywgaGVhZGVyTmFtZTogJ1NoYXJlIENvdW50Jywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3NlbnNpdGl2aXR5TGFiZWwnLCBoZWFkZXJOYW1lOiAnTGFiZWwnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdzZWN1cml0eVJpc2tMZXZlbCcsIGhlYWRlck5hbWU6ICdSaXNrJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjYXNlICdzaGFyaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnZmlsZU5hbWUnLCBoZWFkZXJOYW1lOiAnRmlsZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHBpbm5lZDogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdmaWxlUGF0aCcsIGhlYWRlck5hbWU6ICdQYXRoJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnZmlsZU93bmVyJywgaGVhZGVyTmFtZTogJ093bmVyJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc2hhcmVUeXBlJywgaGVhZGVyTmFtZTogJ1R5cGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdsaW5rVHlwZScsIGhlYWRlck5hbWU6ICdBY2Nlc3MnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdyZWNpcGllbnRDb3VudCcsIGhlYWRlck5hbWU6ICdSZWNpcGllbnRzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2V4dGVybmFsUmVjaXBpZW50Q291bnQnLCBoZWFkZXJOYW1lOiAnRXh0ZXJuYWwnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogJ2NyZWF0ZWREYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdERhdGUocGFyYW1zLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdleHBpcmF0aW9uRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJOYW1lOiAnRXhwaXJlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBmb3JtYXREYXRlKHBhcmFtcy52YWx1ZSkgOiAnTmV2ZXInLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAndmlld0NvdW50JywgaGVhZGVyTmFtZTogJ1ZpZXdzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2Rvd25sb2FkQ291bnQnLCBoZWFkZXJOYW1lOiAnRG93bmxvYWRzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3NlY3VyaXR5UmlzaycsIGhlYWRlck5hbWU6ICdSaXNrJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuc2VsZWN0ZWRUYWJdKTtcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXG4gICAgY29uc3QgZm9ybWF0Qnl0ZXMgPSAoYnl0ZXMpID0+IHtcbiAgICAgICAgaWYgKGJ5dGVzID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuICcwIEInO1xuICAgICAgICBjb25zdCBrID0gMTAyNDtcbiAgICAgICAgY29uc3Qgc2l6ZXMgPSBbJ0InLCAnS0InLCAnTUInLCAnR0InLCAnVEInXTtcbiAgICAgICAgY29uc3QgaSA9IE1hdGguZmxvb3IoTWF0aC5sb2coYnl0ZXMpIC8gTWF0aC5sb2coaykpO1xuICAgICAgICByZXR1cm4gYCR7KGJ5dGVzIC8gTWF0aC5wb3coaywgaSkpLnRvRml4ZWQoMil9ICR7c2l6ZXNbaV19YDtcbiAgICB9O1xuICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoZGF0ZSk7XG4gICAgICAgIHJldHVybiBkLnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJyAnICsgZC50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIGNvbmZpZzogc3RhdGUuY29uZmlnLFxuICAgICAgICB0ZW1wbGF0ZXM6IHN0YXRlLnRlbXBsYXRlcyxcbiAgICAgICAgY3VycmVudFJlc3VsdDogc3RhdGUuY3VycmVudFJlc3VsdCxcbiAgICAgICAgaGlzdG9yaWNhbFJlc3VsdHM6IHN0YXRlLmhpc3RvcmljYWxSZXN1bHRzLFxuICAgICAgICBmaWx0ZXI6IHN0YXRlLmZpbHRlcixcbiAgICAgICAgc2VhcmNoVGV4dDogc3RhdGUuc2VhcmNoVGV4dCxcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogc3RhdGUuaXNEaXNjb3ZlcmluZyxcbiAgICAgICAgcHJvZ3Jlc3M6IHN0YXRlLnByb2dyZXNzLFxuICAgICAgICBzZWxlY3RlZFRhYjogc3RhdGUuc2VsZWN0ZWRUYWIsXG4gICAgICAgIHNlbGVjdGVkT2JqZWN0czogc3RhdGUuc2VsZWN0ZWRPYmplY3RzLFxuICAgICAgICBlcnJvcnM6IHN0YXRlLmVycm9ycyxcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbkRlZnMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICBsb2FkVGVtcGxhdGUsXG4gICAgICAgIHNhdmVBc1RlbXBsYXRlLFxuICAgICAgICBleHBvcnRSZXN1bHRzLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIHNldFNlbGVjdGVkVGFiLFxuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICpcbiAqIFNlYXJjaCBpbnB1dCB3aXRoIGljb24sIGNsZWFyIGJ1dHRvbiwgYW5kIGRlYm91bmNlZCBvbkNoYW5nZS5cbiAqIFVzZWQgZm9yIGZpbHRlcmluZyBsaXN0cyBhbmQgdGFibGVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBTZWFyY2gsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hCYXIgPSAoeyB2YWx1ZTogY29udHJvbGxlZFZhbHVlID0gJycsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBkZWJvdW5jZURlbGF5ID0gMzAwLCBkaXNhYmxlZCA9IGZhbHNlLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpbnB1dFZhbHVlLCBzZXRJbnB1dFZhbHVlXSA9IHVzZVN0YXRlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgLy8gU3luYyB3aXRoIGNvbnRyb2xsZWQgdmFsdWVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgfSwgW2NvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIC8vIERlYm91bmNlZCBvbkNoYW5nZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkNoYW5nZSAmJiBpbnB1dFZhbHVlICE9PSBjb250cm9sbGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVib3VuY2VEZWxheSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW2lucHV0VmFsdWUsIG9uQ2hhbmdlLCBkZWJvdW5jZURlbGF5LCBjb250cm9sbGVkVmFsdWVdKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZV0pO1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtOCB0ZXh0LXNtIHB4LTMnLFxuICAgICAgICBtZDogJ2gtMTAgdGV4dC1iYXNlIHB4LTQnLFxuICAgICAgICBsZzogJ2gtMTIgdGV4dC1sZyBweC01JyxcbiAgICB9O1xuICAgIGNvbnN0IGljb25TaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTQgdy00JyxcbiAgICAgICAgbWQ6ICdoLTUgdy01JyxcbiAgICAgICAgbGc6ICdoLTYgdy02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlcicsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICd3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwJywgJ3BsLTEwIHByLTEwJywgJ2JnLXdoaXRlIHRleHQtZ3JheS05MDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIFxuICAgIC8vIERpc2FibGVkXG4gICAge1xuICAgICAgICAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTUwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgbGVmdC0zIHRleHQtZ3JheS00MDAgcG9pbnRlci1ldmVudHMtbm9uZScsIGljb25TaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogaW5wdXRWYWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUlucHV0Q2hhbmdlLCBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaFwiIH0pLCBpbnB1dFZhbHVlICYmICFkaXNhYmxlZCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IGhhbmRsZUNsZWFyLCBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIHJpZ2h0LTMnLCAndGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcpLCBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBzZWFyY2hcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IGljb25TaXplQ2xhc3Nlc1tzaXplXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIERlYm91bmNlIEhvb2tcbiAqXG4gKiBSZXR1cm5zIGEgZGVib3VuY2VkIHZhbHVlIHRoYXQgb25seSB1cGRhdGVzIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXkuXG4gKiBVc2VmdWwgZm9yIHNlYXJjaCBpbnB1dHMgYW5kIGV4cGVuc2l2ZSBvcGVyYXRpb25zLlxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBEZWJvdW5jZSBhIHZhbHVlXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gZGVib3VuY2VcbiAqIEBwYXJhbSBkZWxheSBEZWxheSBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDUwMG1zKVxuICogQHJldHVybnMgRGVib3VuY2VkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWJvdW5jZSh2YWx1ZSwgZGVsYXkgPSA1MDApIHtcbiAgICBjb25zdCBbZGVib3VuY2VkVmFsdWUsIHNldERlYm91bmNlZFZhbHVlXSA9IHVzZVN0YXRlKHZhbHVlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICAvLyBTZXQgdXAgYSB0aW1lb3V0IHRvIHVwZGF0ZSB0aGUgZGVib3VuY2VkIHZhbHVlXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHNldERlYm91bmNlZFZhbHVlKHZhbHVlKTtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAvLyBDbGVhbnVwIHRpbWVvdXQgb24gdmFsdWUgY2hhbmdlIG9yIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbdmFsdWUsIGRlbGF5XSk7XG4gICAgcmV0dXJuIGRlYm91bmNlZFZhbHVlO1xufVxuZXhwb3J0IGRlZmF1bHQgdXNlRGVib3VuY2U7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=