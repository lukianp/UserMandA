"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5711],{

/***/ 3179:
/*!**********************************************************!*\
  !*** ./src/renderer/hooks/useSQLServerDiscoveryLogic.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useSQLServerDiscoveryLogic: () => (/* binding */ useSQLServerDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useDiscoveryStore */ 92856);


const formatBytes = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
const useSQLServerDiscoveryLogic = () => {
    const { getResultsByModuleName } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_1__.useDiscoveryStore)();
    const [config, setConfig] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        servers: [],
        includeSystemDatabases: true,
        includeBackupHistory: true,
        includeDatabaseFiles: true,
        includeSecurityAudit: true,
        includePerformanceMetrics: true,
        includeConfiguration: true,
        authenticationType: 'Windows',
        timeout: 300,
        parallelScans: 5,
    });
    const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [progress, setProgress] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('overview');
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('SQLServerDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[SQLServerDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setResult(latestResult);
        }
    }, [getResultsByModuleName]);
    const templates = [
        {
            name: 'Quick Instance Scan',
            description: 'Fast scan of SQL Server instances and basic info',
            isDefault: false,
            category: 'Quick',
            config: {
                servers: [],
                includeSystemDatabases: false,
                includeBackupHistory: false,
                includeDatabaseFiles: false,
                includeSecurityAudit: false,
                includePerformanceMetrics: false,
                includeConfiguration: false,
                authenticationType: 'Windows',
                timeout: 60,
                parallelScans: 5,
            },
        },
        {
            name: 'Comprehensive Database Audit',
            description: 'Full audit including configuration, security, and backup status',
            isDefault: true,
            category: 'Full',
            config: {
                servers: [],
                includeSystemDatabases: true,
                includeBackupHistory: true,
                includeDatabaseFiles: true,
                includeSecurityAudit: true,
                includePerformanceMetrics: true,
                includeConfiguration: true,
                authenticationType: 'Windows',
                timeout: 600,
                parallelScans: 5,
            },
        },
        {
            name: 'Security & Compliance Audit',
            description: 'Security-focused scan with permissions and encryption analysis',
            isDefault: false,
            category: 'Security',
            config: {
                servers: [],
                includeSystemDatabases: true,
                includeBackupHistory: false,
                includeDatabaseFiles: false,
                includeSecurityAudit: true,
                includePerformanceMetrics: false,
                includeConfiguration: true,
                authenticationType: 'Windows',
                timeout: 300,
                parallelScans: 5,
            },
        },
    ];
    const handleStartDiscovery = async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        setResult(null);
        try {
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
            }, 500);
            const scriptResult = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/SQLServerDiscovery.psm1',
                functionName: 'Invoke-SQLServerDiscovery',
                parameters: {
                    Servers: config.servers,
                    IncludeSystemDatabases: config.includeSystemDatabases,
                    IncludeBackupHistory: config.includeBackupHistory,
                    IncludeDatabaseFiles: config.includeDatabaseFiles,
                    IncludeSecurityAudit: config.includeSecurityAudit,
                    IncludePerformanceMetrics: config.includePerformanceMetrics,
                    IncludeConfiguration: config.includeConfiguration,
                    AuthenticationType: config.authenticationType,
                    Timeout: config.timeout,
                    ParallelScans: config.parallelScans,
                },
            });
            clearInterval(progressInterval);
            setProgress(100);
            if (scriptResult.success) {
                setResult(scriptResult.data);
            }
            else {
                setError(scriptResult.error || 'SQL Server discovery failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleApplyTemplate = (template) => {
        setConfig(template.config);
    };
    const handleExport = async () => {
        if (!result)
            return;
        try {
            const csvContent = generateCSV(result);
            await window.electronAPI.writeFile(`SQLServerDiscovery_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };
    const generateCSV = (data) => {
        const headers = ['Type', 'Name', 'Version', 'Edition', 'Status', 'Details'];
        const rows = [];
        (data?.instances ?? []).forEach((instance) => {
            rows.push([
                'Instance',
                instance.instanceName,
                instance.version,
                instance.edition,
                instance.isSysAdmin ? 'Admin' : 'User',
                `Databases: ${instance.databases?.length ?? 0}, Auth: ${instance.authentication}`,
            ]);
        });
        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    };
    // Filter data based on search text
    const filteredInstances = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return [];
        const instances = result?.instances ?? [];
        if (!searchText)
            return instances;
        const search = searchText.toLowerCase();
        return instances.filter((instance) => (instance.instanceName ?? '').toLowerCase().includes(search) ||
            (instance.version ?? '').toLowerCase().includes(search) ||
            (instance.edition ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    const filteredDatabases = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return [];
        const databases = result?.databases ?? [];
        if (!searchText)
            return databases;
        const search = searchText.toLowerCase();
        return databases.filter((db) => (db.name ?? '').toLowerCase().includes(search) ||
            (db.owner ?? '').toLowerCase().includes(search) ||
            (db.recoveryModel ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    // Configurations not supported in current type structure
    // AG Grid column definitions
    const instanceColumns = [
        { field: 'instanceName', headerName: 'Instance Name', sortable: true, filter: true, flex: 1.5 },
        { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
        { field: 'edition', headerName: 'Edition', sortable: true, filter: true, flex: 1 },
        { field: 'authentication', headerName: 'Authentication', sortable: true, filter: true, flex: 1 },
        {
            field: 'databases',
            headerName: 'Databases',
            sortable: true,
            filter: true,
            flex: 0.8,
            valueGetter: (params) => params.data?.databases?.length || 0
        },
        {
            field: 'isSysAdmin',
            headerName: 'Admin',
            sortable: true,
            filter: true,
            flex: 0.8,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        { field: 'collation', headerName: 'Collation', sortable: true, filter: true, flex: 1.2 },
    ];
    const databaseColumns = [
        { field: 'name', headerName: 'Database Name', sortable: true, filter: true, flex: 1.5 },
        {
            field: 'size',
            headerName: 'Size',
            sortable: true,
            filter: true,
            flex: 1,
            valueGetter: (params) => params.data?.size?.totalMB || 0,
            valueFormatter: (params) => formatBytes((params.value || 0) * 1024 * 1024),
        },
        { field: 'owner', headerName: 'Owner', sortable: true, filter: true, flex: 1 },
        { field: 'recoveryModel', headerName: 'Recovery Model', sortable: true, filter: true, flex: 1 },
        {
            field: 'lastBackup',
            headerName: 'Last Backup',
            sortable: true,
            filter: true,
            flex: 1.2,
            valueGetter: (params) => params.data?.lastBackup?.date || null,
            valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'Never'),
        },
        { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
    ];
    // Configuration columns not supported in current type structure
    // Statistics
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return null;
        const instances = result?.instances ?? [];
        const databases = result?.databases ?? [];
        const totalInstances = instances.length;
        const activeInstances = instances.filter((i) => i.isSysAdmin).length; // Use isSysAdmin as proxy for "active"
        const totalDatabases = (databases.length ?? 0);
        const totalStorageMB = (databases ?? []).reduce((sum, db) => sum + (db.size?.totalMB || 0), 0);
        const outdatedBackups = (databases ?? []).filter((db) => {
            if (!db.lastBackup?.date)
                return true;
            const daysSinceBackup = (Date.now() - new Date(db.lastBackup.date).getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceBackup > 1;
        }).length;
        return {
            totalInstances,
            activeInstances,
            totalDatabases,
            totalStorageMB,
            outdatedBackups,
        };
    }, [result]);
    return {
        config,
        setConfig,
        result,
        isLoading,
        progress,
        error,
        searchText,
        setSearchText,
        activeTab,
        setActiveTab,
        templates,
        handleStartDiscovery,
        handleApplyTemplate,
        handleExport,
        filteredInstances,
        filteredDatabases,
        instanceColumns,
        databaseColumns,
        stats,
    };
};


/***/ }),

/***/ 34766:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Input.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Input: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

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
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Info, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


/***/ }),

/***/ 59944:
/*!*******************************************************************!*\
  !*** ./src/renderer/components/organisms/VirtualizedDataGrid.tsx ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VirtualizedDataGrid: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ag-grid-react */ 66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ag-grid-enterprise */ 71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../atoms/Spinner */ 28709);

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
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-grid.css */ 46479));
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-theme-alpine.css */ 64010));
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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Filter, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.EyeOff, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Eye, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Printer, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__.AgGridReact, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
                                            if (gridApi && col.field) {
                                                gridApi.setColumnsVisible([col.field], e.target.checked);
                                            }
                                        } }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: col.headerName || col.field })] }, col.field)))] }))] })] }));
}
const VirtualizedDataGrid = react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(VirtualizedDataGridInner);
// Set displayName for React DevTools
VirtualizedDataGrid.displayName = 'VirtualizedDataGrid';


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlU1FMU2VydmVyRGlzY292ZXJ5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZURpc2NvdmVyeVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUnO1xuY29uc3QgZm9ybWF0Qnl0ZXMgPSAoYnl0ZXMpID0+IHtcbiAgICBpZiAoYnl0ZXMgPT09IDApXG4gICAgICAgIHJldHVybiAnMCBCJztcbiAgICBjb25zdCBrID0gMTAyNDtcbiAgICBjb25zdCBzaXplcyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQiddO1xuICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcbiAgICByZXR1cm4gYCR7cGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZCgyKSl9ICR7c2l6ZXNbaV19YDtcbn07XG5leHBvcnQgY29uc3QgdXNlU1FMU2VydmVyRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lIH0gPSB1c2VEaXNjb3ZlcnlTdG9yZSgpO1xuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHNlcnZlcnM6IFtdLFxuICAgICAgICBpbmNsdWRlU3lzdGVtRGF0YWJhc2VzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlQmFja3VwSGlzdG9yeTogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZURhdGFiYXNlRmlsZXM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVTZWN1cml0eUF1ZGl0OiB0cnVlLFxuICAgICAgICBpbmNsdWRlUGVyZm9ybWFuY2VNZXRyaWNzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlQ29uZmlndXJhdGlvbjogdHJ1ZSxcbiAgICAgICAgYXV0aGVudGljYXRpb25UeXBlOiAnV2luZG93cycsXG4gICAgICAgIHRpbWVvdXQ6IDMwMCxcbiAgICAgICAgcGFyYWxsZWxTY2FuczogNSxcbiAgICB9KTtcbiAgICBjb25zdCBbcmVzdWx0LCBzZXRSZXN1bHRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKDApO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdTUUxTZXJ2ZXJEaXNjb3ZlcnknKTtcbiAgICAgICAgaWYgKHByZXZpb3VzUmVzdWx0cyAmJiBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTUUxTZXJ2ZXJEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RSZXN1bHQgPSBwcmV2aW91c1Jlc3VsdHNbcHJldmlvdXNSZXN1bHRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgc2V0UmVzdWx0KGxhdGVzdFJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZV0pO1xuICAgIGNvbnN0IHRlbXBsYXRlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1F1aWNrIEluc3RhbmNlIFNjYW4nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdGYXN0IHNjYW4gb2YgU1FMIFNlcnZlciBpbnN0YW5jZXMgYW5kIGJhc2ljIGluZm8nLFxuICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnUXVpY2snLFxuICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgc2VydmVyczogW10sXG4gICAgICAgICAgICAgICAgaW5jbHVkZVN5c3RlbURhdGFiYXNlczogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5jbHVkZUJhY2t1cEhpc3Rvcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVEYXRhYmFzZUZpbGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU2VjdXJpdHlBdWRpdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVBlcmZvcm1hbmNlTWV0cmljczogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5jbHVkZUNvbmZpZ3VyYXRpb246IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uVHlwZTogJ1dpbmRvd3MnLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwLFxuICAgICAgICAgICAgICAgIHBhcmFsbGVsU2NhbnM6IDUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29tcHJlaGVuc2l2ZSBEYXRhYmFzZSBBdWRpdCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgYXVkaXQgaW5jbHVkaW5nIGNvbmZpZ3VyYXRpb24sIHNlY3VyaXR5LCBhbmQgYmFja3VwIHN0YXR1cycsXG4gICAgICAgICAgICBpc0RlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0Z1bGwnLFxuICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgc2VydmVyczogW10sXG4gICAgICAgICAgICAgICAgaW5jbHVkZVN5c3RlbURhdGFiYXNlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlQmFja3VwSGlzdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlRGF0YWJhc2VGaWxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU2VjdXJpdHlBdWRpdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlUGVyZm9ybWFuY2VNZXRyaWNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVDb25maWd1cmF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0aW9uVHlwZTogJ1dpbmRvd3MnLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDYwMCxcbiAgICAgICAgICAgICAgICBwYXJhbGxlbFNjYW5zOiA1LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1NlY3VyaXR5ICYgQ29tcGxpYW5jZSBBdWRpdCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5LWZvY3VzZWQgc2NhbiB3aXRoIHBlcm1pc3Npb25zIGFuZCBlbmNyeXB0aW9uIGFuYWx5c2lzJyxcbiAgICAgICAgICAgIGlzRGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ1NlY3VyaXR5JyxcbiAgICAgICAgICAgIGNvbmZpZzoge1xuICAgICAgICAgICAgICAgIHNlcnZlcnM6IFtdLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVTeXN0ZW1EYXRhYmFzZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5jbHVkZUJhY2t1cEhpc3Rvcnk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVEYXRhYmFzZUZpbGVzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU2VjdXJpdHlBdWRpdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlUGVyZm9ybWFuY2VNZXRyaWNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlQ29uZmlndXJhdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGlvblR5cGU6ICdXaW5kb3dzJyxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAsXG4gICAgICAgICAgICAgICAgcGFyYWxsZWxTY2FuczogNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCBoYW5kbGVTdGFydERpc2NvdmVyeSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRQcm9ncmVzcygwKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldFJlc3VsdChudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0UHJvZ3Jlc3MoKHByZXYpID0+IE1hdGgubWluKHByZXYgKyBNYXRoLnJhbmRvbSgpICogMTUsIDk1KSk7XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgY29uc3Qgc2NyaXB0UmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9TUUxTZXJ2ZXJEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLVNRTFNlcnZlckRpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBTZXJ2ZXJzOiBjb25maWcuc2VydmVycyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVN5c3RlbURhdGFiYXNlczogY29uZmlnLmluY2x1ZGVTeXN0ZW1EYXRhYmFzZXMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVCYWNrdXBIaXN0b3J5OiBjb25maWcuaW5jbHVkZUJhY2t1cEhpc3RvcnksXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVEYXRhYmFzZUZpbGVzOiBjb25maWcuaW5jbHVkZURhdGFiYXNlRmlsZXMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVTZWN1cml0eUF1ZGl0OiBjb25maWcuaW5jbHVkZVNlY3VyaXR5QXVkaXQsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVQZXJmb3JtYW5jZU1ldHJpY3M6IGNvbmZpZy5pbmNsdWRlUGVyZm9ybWFuY2VNZXRyaWNzLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlQ29uZmlndXJhdGlvbjogY29uZmlnLmluY2x1ZGVDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBBdXRoZW50aWNhdGlvblR5cGU6IGNvbmZpZy5hdXRoZW50aWNhdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgICAgIFRpbWVvdXQ6IGNvbmZpZy50aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICBQYXJhbGxlbFNjYW5zOiBjb25maWcucGFyYWxsZWxTY2FucyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHByb2dyZXNzSW50ZXJ2YWwpO1xuICAgICAgICAgICAgc2V0UHJvZ3Jlc3MoMTAwKTtcbiAgICAgICAgICAgIGlmIChzY3JpcHRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNldFJlc3VsdChzY3JpcHRSZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihzY3JpcHRSZXN1bHQuZXJyb3IgfHwgJ1NRTCBTZXJ2ZXIgZGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEVycm9yKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQXBwbHlUZW1wbGF0ZSA9ICh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICBzZXRDb25maWcodGVtcGxhdGUuY29uZmlnKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjc3ZDb250ZW50ID0gZ2VuZXJhdGVDU1YocmVzdWx0KTtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS53cml0ZUZpbGUoYFNRTFNlcnZlckRpc2NvdmVyeV8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5jc3ZgLCBjc3ZDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0V4cG9ydCBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2VuZXJhdGVDU1YgPSAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gWydUeXBlJywgJ05hbWUnLCAnVmVyc2lvbicsICdFZGl0aW9uJywgJ1N0YXR1cycsICdEZXRhaWxzJ107XG4gICAgICAgIGNvbnN0IHJvd3MgPSBbXTtcbiAgICAgICAgKGRhdGE/Lmluc3RhbmNlcyA/PyBbXSkuZm9yRWFjaCgoaW5zdGFuY2UpID0+IHtcbiAgICAgICAgICAgIHJvd3MucHVzaChbXG4gICAgICAgICAgICAgICAgJ0luc3RhbmNlJyxcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbnN0YW5jZU5hbWUsXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UudmVyc2lvbixcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5lZGl0aW9uLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlLmlzU3lzQWRtaW4gPyAnQWRtaW4nIDogJ1VzZXInLFxuICAgICAgICAgICAgICAgIGBEYXRhYmFzZXM6ICR7aW5zdGFuY2UuZGF0YWJhc2VzPy5sZW5ndGggPz8gMH0sIEF1dGg6ICR7aW5zdGFuY2UuYXV0aGVudGljYXRpb259YCxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFtoZWFkZXJzLmpvaW4oJywnKSwgLi4ucm93cy5tYXAoKHJvdykgPT4gcm93LmpvaW4oJywnKSldLmpvaW4oJ1xcbicpO1xuICAgIH07XG4gICAgLy8gRmlsdGVyIGRhdGEgYmFzZWQgb24gc2VhcmNoIHRleHRcbiAgICBjb25zdCBmaWx0ZXJlZEluc3RhbmNlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2VzID0gcmVzdWx0Py5pbnN0YW5jZXMgPz8gW107XG4gICAgICAgIGlmICghc2VhcmNoVGV4dClcbiAgICAgICAgICAgIHJldHVybiBpbnN0YW5jZXM7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlcy5maWx0ZXIoKGluc3RhbmNlKSA9PiAoaW5zdGFuY2UuaW5zdGFuY2VOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIChpbnN0YW5jZS52ZXJzaW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIChpbnN0YW5jZS5lZGl0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgIH0sIFtyZXN1bHQsIHNlYXJjaFRleHRdKTtcbiAgICBjb25zdCBmaWx0ZXJlZERhdGFiYXNlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgZGF0YWJhc2VzID0gcmVzdWx0Py5kYXRhYmFzZXMgPz8gW107XG4gICAgICAgIGlmICghc2VhcmNoVGV4dClcbiAgICAgICAgICAgIHJldHVybiBkYXRhYmFzZXM7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGRhdGFiYXNlcy5maWx0ZXIoKGRiKSA9PiAoZGIubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAoZGIub3duZXIgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgKGRiLnJlY292ZXJ5TW9kZWwgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgfSwgW3Jlc3VsdCwgc2VhcmNoVGV4dF0pO1xuICAgIC8vIENvbmZpZ3VyYXRpb25zIG5vdCBzdXBwb3J0ZWQgaW4gY3VycmVudCB0eXBlIHN0cnVjdHVyZVxuICAgIC8vIEFHIEdyaWQgY29sdW1uIGRlZmluaXRpb25zXG4gICAgY29uc3QgaW5zdGFuY2VDb2x1bW5zID0gW1xuICAgICAgICB7IGZpZWxkOiAnaW5zdGFuY2VOYW1lJywgaGVhZGVyTmFtZTogJ0luc3RhbmNlIE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxLjUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3ZlcnNpb24nLCBoZWFkZXJOYW1lOiAnVmVyc2lvbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2VkaXRpb24nLCBoZWFkZXJOYW1lOiAnRWRpdGlvbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2F1dGhlbnRpY2F0aW9uJywgaGVhZGVyTmFtZTogJ0F1dGhlbnRpY2F0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2RhdGFiYXNlcycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGF0YWJhc2VzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgZmxleDogMC44LFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhPy5kYXRhYmFzZXM/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaXNTeXNBZG1pbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWRtaW4nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAwLjgsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nXG4gICAgICAgIH0sXG4gICAgICAgIHsgZmllbGQ6ICdjb2xsYXRpb24nLCBoZWFkZXJOYW1lOiAnQ29sbGF0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMS4yIH0sXG4gICAgXTtcbiAgICBjb25zdCBkYXRhYmFzZUNvbHVtbnMgPSBbXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0RhdGFiYXNlIE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxLjUgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzaXplJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTaXplJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8uc2l6ZT8udG90YWxNQiB8fCAwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdEJ5dGVzKChwYXJhbXMudmFsdWUgfHwgMCkgKiAxMDI0ICogMTAyNCksXG4gICAgICAgIH0sXG4gICAgICAgIHsgZmllbGQ6ICdvd25lcicsIGhlYWRlck5hbWU6ICdPd25lcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ3JlY292ZXJ5TW9kZWwnLCBoZWFkZXJOYW1lOiAnUmVjb3ZlcnkgTW9kZWwnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdEJhY2t1cCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTGFzdCBCYWNrdXAnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAxLjIsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/Lmxhc3RCYWNrdXA/LmRhdGUgfHwgbnVsbCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZVN0cmluZygpIDogJ05ldmVyJyksXG4gICAgICAgIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdGF0ZScsIGhlYWRlck5hbWU6ICdTdGF0ZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgIF07XG4gICAgLy8gQ29uZmlndXJhdGlvbiBjb2x1bW5zIG5vdCBzdXBwb3J0ZWQgaW4gY3VycmVudCB0eXBlIHN0cnVjdHVyZVxuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBpbnN0YW5jZXMgPSByZXN1bHQ/Lmluc3RhbmNlcyA/PyBbXTtcbiAgICAgICAgY29uc3QgZGF0YWJhc2VzID0gcmVzdWx0Py5kYXRhYmFzZXMgPz8gW107XG4gICAgICAgIGNvbnN0IHRvdGFsSW5zdGFuY2VzID0gaW5zdGFuY2VzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYWN0aXZlSW5zdGFuY2VzID0gaW5zdGFuY2VzLmZpbHRlcigoaSkgPT4gaS5pc1N5c0FkbWluKS5sZW5ndGg7IC8vIFVzZSBpc1N5c0FkbWluIGFzIHByb3h5IGZvciBcImFjdGl2ZVwiXG4gICAgICAgIGNvbnN0IHRvdGFsRGF0YWJhc2VzID0gKGRhdGFiYXNlcy5sZW5ndGggPz8gMCk7XG4gICAgICAgIGNvbnN0IHRvdGFsU3RvcmFnZU1CID0gKGRhdGFiYXNlcyA/PyBbXSkucmVkdWNlKChzdW0sIGRiKSA9PiBzdW0gKyAoZGIuc2l6ZT8udG90YWxNQiB8fCAwKSwgMCk7XG4gICAgICAgIGNvbnN0IG91dGRhdGVkQmFja3VwcyA9IChkYXRhYmFzZXMgPz8gW10pLmZpbHRlcigoZGIpID0+IHtcbiAgICAgICAgICAgIGlmICghZGIubGFzdEJhY2t1cD8uZGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGRheXNTaW5jZUJhY2t1cCA9IChEYXRlLm5vdygpIC0gbmV3IERhdGUoZGIubGFzdEJhY2t1cC5kYXRlKS5nZXRUaW1lKCkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpO1xuICAgICAgICAgICAgcmV0dXJuIGRheXNTaW5jZUJhY2t1cCA+IDE7XG4gICAgICAgIH0pLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsSW5zdGFuY2VzLFxuICAgICAgICAgICAgYWN0aXZlSW5zdGFuY2VzLFxuICAgICAgICAgICAgdG90YWxEYXRhYmFzZXMsXG4gICAgICAgICAgICB0b3RhbFN0b3JhZ2VNQixcbiAgICAgICAgICAgIG91dGRhdGVkQmFja3VwcyxcbiAgICAgICAgfTtcbiAgICB9LCBbcmVzdWx0XSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBzZXRDb25maWcsXG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIGFjdGl2ZVRhYixcbiAgICAgICAgc2V0QWN0aXZlVGFiLFxuICAgICAgICB0ZW1wbGF0ZXMsXG4gICAgICAgIGhhbmRsZVN0YXJ0RGlzY292ZXJ5LFxuICAgICAgICBoYW5kbGVBcHBseVRlbXBsYXRlLFxuICAgICAgICBoYW5kbGVFeHBvcnQsXG4gICAgICAgIGZpbHRlcmVkSW5zdGFuY2VzLFxuICAgICAgICBmaWx0ZXJlZERhdGFiYXNlcyxcbiAgICAgICAgaW5zdGFuY2VDb2x1bW5zLFxuICAgICAgICBkYXRhYmFzZUNvbHVtbnMsXG4gICAgICAgIHN0YXRzLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsIi8qKlxuICogRGlzY292ZXJ5IFN0b3JlXG4gKlxuICogTWFuYWdlcyBkaXNjb3Zlcnkgb3BlcmF0aW9ucywgcmVzdWx0cywgYW5kIHN0YXRlLlxuICogSGFuZGxlcyBkb21haW4sIG5ldHdvcmssIHVzZXIsIGFuZCBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcHJvY2Vzc2VzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICd6dXN0YW5kJztcbmltcG9ydCB7IGRldnRvb2xzLCBzdWJzY3JpYmVXaXRoU2VsZWN0b3IgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnO1xuZXhwb3J0IGNvbnN0IHVzZURpc2NvdmVyeVN0b3JlID0gY3JlYXRlKCkoZGV2dG9vbHMoc3Vic2NyaWJlV2l0aFNlbGVjdG9yKChzZXQsIGdldCkgPT4gKHtcbiAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgb3BlcmF0aW9uczogbmV3IE1hcCgpLFxuICAgIHJlc3VsdHM6IG5ldyBNYXAoKSxcbiAgICBzZWxlY3RlZE9wZXJhdGlvbjogbnVsbCxcbiAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAvLyBBY3Rpb25zXG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIHN0YXJ0RGlzY292ZXJ5OiBhc3luYyAodHlwZSwgcGFyYW1ldGVycykgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGRpc2NvdmVyeS4uLicsXG4gICAgICAgICAgICBpdGVtc0Rpc2NvdmVyZWQ6IDAsXG4gICAgICAgICAgICBzdGFydGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQWRkIG9wZXJhdGlvbiB0byBzdGF0ZVxuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuc2V0KG9wZXJhdGlvbklkLCBvcGVyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNldHVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzQ2xlYW51cCA9IHdpbmRvdy5lbGVjdHJvbkFQSS5vblByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgZGF0YS5wZXJjZW50YWdlLCBkYXRhLm1lc3NhZ2UgfHwgJ1Byb2Nlc3NpbmcuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGRpc2NvdmVyeSBtb2R1bGVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiBgTW9kdWxlcy9EaXNjb3ZlcnkvJHt0eXBlfS5wc20xYCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGBTdGFydC0ke3R5cGV9RGlzY292ZXJ5YCxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbU91dHB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDbGVhbnVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGdldCgpLmNvbXBsZXRlRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZGF0YT8ucmVzdWx0cyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZXJyb3IgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb25JZDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHJ1bm5pbmcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIGNhbmNlbERpc2NvdmVyeTogYXN5bmMgKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgaWYgKCFvcGVyYXRpb24gfHwgb3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24ob3BlcmF0aW9uLmNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAob3ApIHtcbiAgICAgICAgICAgICAgICAgICAgb3Auc3RhdHVzID0gJ2NhbmNlbGxlZCc7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1lc3NhZ2UgPSAnRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwcm9ncmVzcyBmb3IgYSBydW5uaW5nIG9wZXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiAob3BlcmF0aW9uSWQsIHByb2dyZXNzLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiAmJiBvcGVyYXRpb24uc3RhdHVzID09PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgY29tcGxldGVkIHdpdGggcmVzdWx0c1xuICAgICAqL1xuICAgIGNvbXBsZXRlRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyZWQgJHtyZXN1bHRzLmxlbmd0aH0gaXRlbXNgO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5pdGVtc0Rpc2NvdmVyZWQgPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQob3BlcmF0aW9uSWQsIHJlc3VsdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGZhaWxlZFxuICAgICAqL1xuICAgIGZhaWxEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgZXJyb3IpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyeSBmYWlsZWQ6ICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhIHNpbmdsZSBvcGVyYXRpb24gYW5kIGl0cyByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uID09PSBvcGVyYXRpb25JZCA/IG51bGwgOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9wZXJhdGlvbnMgYW5kIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhckFsbE9wZXJhdGlvbnM6ICgpID0+IHtcbiAgICAgICAgLy8gT25seSBjbGVhciBjb21wbGV0ZWQsIGZhaWxlZCwgb3IgY2FuY2VsbGVkIG9wZXJhdGlvbnNcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBvcGVyYXRpb25dIG9mIG5ld09wZXJhdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0T3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGZvciBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldFJlc3VsdHM6IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgYnkgbW9kdWxlIG5hbWUgKGZvciBwZXJzaXN0ZW50IHJldHJpZXZhbCBhY3Jvc3MgY29tcG9uZW50IHJlbW91bnRzKVxuICAgICAqL1xuICAgIGdldFJlc3VsdHNCeU1vZHVsZU5hbWU6IChtb2R1bGVOYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChtb2R1bGVOYW1lKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEFkZCBhIGRpc2NvdmVyeSByZXN1bHQgKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBhZGRSZXN1bHQ6IChyZXN1bHQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdHMgPSBuZXdSZXN1bHRzLmdldChyZXN1bHQubW9kdWxlTmFtZSkgfHwgW107XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChyZXN1bHQubW9kdWxlTmFtZSwgWy4uLmV4aXN0aW5nUmVzdWx0cywgcmVzdWx0XSk7XG4gICAgICAgICAgICByZXR1cm4geyByZXN1bHRzOiBuZXdSZXN1bHRzIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHByb2dyZXNzIGluZm9ybWF0aW9uIChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgc2V0UHJvZ3Jlc3M6IChwcm9ncmVzc0RhdGEpID0+IHtcbiAgICAgICAgLy8gRmluZCB0aGUgY3VycmVudCBvcGVyYXRpb24gZm9yIHRoaXMgbW9kdWxlIGFuZCB1cGRhdGUgaXRcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9ucyA9IGdldCgpLm9wZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gQXJyYXkuZnJvbShvcGVyYXRpb25zLmtleXMoKSkuZmluZChpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcCA9IG9wZXJhdGlvbnMuZ2V0KGlkKTtcbiAgICAgICAgICAgIHJldHVybiBvcCAmJiBvcC50eXBlID09PSBwcm9ncmVzc0RhdGEubW9kdWxlTmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcGVyYXRpb25JZCkge1xuICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIHByb2dyZXNzRGF0YS5vdmVyYWxsUHJvZ3Jlc3MsIHByb2dyZXNzRGF0YS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KSksIHtcbiAgICBuYW1lOiAnRGlzY292ZXJ5U3RvcmUnLFxufSkpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9