"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7551],{

/***/ 7551:
/*!******************************************************************************!*\
  !*** ./src/renderer/views/infrastructure/InfrastructureView.tsx + 1 modules ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ infrastructure_InfrastructureView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/store/useDiscoveryStore.ts
var useDiscoveryStore = __webpack_require__(92856);
// EXTERNAL MODULE: ./src/renderer/lib/electron-api-fallback.ts
var electron_api_fallback = __webpack_require__(58350);
;// ./src/renderer/hooks/useInfrastructureLogic.ts
/**
 * Infrastructure View Logic Hook
 * Handles network infrastructure and server discovery
 */



const useInfrastructureLogic = () => {
    const { addResult } = (0,useDiscoveryStore.useDiscoveryStore)();
    const [infrastructure, setInfrastructure] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [selectedItems, setSelectedItems] = (0,react.useState)([]);
    const [filterType, setFilterType] = (0,react.useState)('all');
    const loadInfrastructure = (0,react.useCallback)(async () => {
        setIsLoading(true);
        try {
            const electronAPI = (0,electron_api_fallback.getElectronAPI)();
            const result = await electronAPI.executeModule({
                modulePath: 'Modules/Discovery/InfrastructureDiscovery.psm1',
                functionName: 'Get-InfrastructureInventory',
                parameters: {},
            });
            if (result.success) {
                setInfrastructure(result.data.infrastructure || []);
                const discoveryResult = {
                    id: `infra-${Date.now()}`,
                    name: 'Infrastructure Discovery',
                    moduleName: 'InfrastructureDiscovery',
                    displayName: 'Network Infrastructure Discovery',
                    itemCount: result.data.infrastructure?.length || 0,
                    discoveryTime: new Date().toISOString(),
                    duration: result.duration || 0,
                    status: 'Completed',
                    filePath: result.data.outputPath || '',
                    success: true,
                    summary: `Discovered ${result.data.infrastructure?.length || 0} infrastructure items`,
                    errorMessage: '',
                    additionalData: result.data,
                    createdAt: new Date().toISOString(),
                };
                addResult(discoveryResult);
            }
        }
        catch (error) {
            console.error('Failed to load infrastructure:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [addResult]);
    const filteredInfrastructure = infrastructure.filter(item => {
        const matchesSearch = !searchText ||
            (item.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
            item.ipAddress.includes(searchText);
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });
    const handleExport = (0,react.useCallback)(() => {
        const electronAPI = (0,electron_api_fallback.getElectronAPI)();
        electronAPI.writeFile(`infrastructure-${Date.now()}.json`, JSON.stringify(filteredInfrastructure, null, 2));
    }, [filteredInfrastructure]);
    return {
        infrastructure: filteredInfrastructure,
        isLoading,
        searchText,
        setSearchText,
        selectedItems,
        setSelectedItems,
        filterType,
        setFilterType,
        loadInfrastructure,
        handleExport,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/molecules/SearchBar.tsx
var SearchBar = __webpack_require__(53404);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
;// ./src/renderer/views/infrastructure/InfrastructureView.tsx

/**
 * Infrastructure View
 * Network infrastructure and server inventory
 */







const InfrastructureView = () => {
    const { infrastructure, isLoading, searchText, setSearchText, selectedItems, setSelectedItems, filterType, setFilterType, loadInfrastructure, handleExport, } = useInfrastructureLogic();
    (0,react.useEffect)(() => {
        loadInfrastructure();
    }, [loadInfrastructure]);
    const columnDefs = [
        { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 200 },
        { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 120 },
        { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, width: 150 },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            width: 120,
            cellRenderer: (params) => {
                const statusColors = {
                    online: 'text-green-600 bg-green-50',
                    offline: 'text-red-600 bg-red-50',
                    unknown: 'text-gray-600 bg-gray-50',
                };
                return ((0,jsx_runtime.jsx)("span", { className: `px-2 py-1 rounded text-xs font-semibold ${statusColors[params.value] || statusColors.unknown}`, children: params.value }));
            },
        },
        { field: 'os', headerName: 'Operating System', sortable: true, filter: true, width: 200 },
        { field: 'lastSeen', headerName: 'Last Seen', sortable: true, filter: true, width: 180 },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "infrastructure-view", "data-testid": "infrastructure-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.Server, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Infrastructure" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Network infrastructure and server inventory" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: loadInfrastructure, loading: isLoading, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: handleExport, disabled: infrastructure.length === 0, icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), "data-cy": "export-btn", "data-testid": "export-btn", children: "Export" })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(SearchBar["default"], { value: searchText, onChange: setSearchText, placeholder: "Search by name or IP address...", "data-cy": "infrastructure-search", "data-testid": "infrastructure-search" }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select.Select, { value: filterType, onChange: (value) => setFilterType(value), options: [
                                    { value: 'all', label: 'All Types' },
                                    { value: 'server', label: 'Servers' },
                                    { value: 'network', label: 'Network Devices' },
                                    { value: 'storage', label: 'Storage' },
                                    { value: 'virtualization', label: 'Virtualization' },
                                ], "data-cy": "type-filter", "data-testid": "type-filter" }) })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 p-6", children: (0,jsx_runtime.jsx)("div", { className: "h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: infrastructure, columns: columnDefs, loading: isLoading, onSelectionChange: setSelectedItems, enableExport: true, "data-cy": "infrastructure-grid", "data-testid": "infrastructure-grid" }) }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { children: ["Total items: ", infrastructure.length] }), (0,jsx_runtime.jsxs)("span", { children: ["Selected: ", (selectedItems?.length ?? 0)] })] }) })] }));
};
/* harmony default export */ const infrastructure_InfrastructureView = (InfrastructureView);


/***/ }),

/***/ 53404:
/*!*********************************************************!*\
  !*** ./src/renderer/components/molecules/SearchBar.tsx ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SearchBar: () => (/* binding */ SearchBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Search, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGdCQUFnQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELE1BQU07QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VJbmZyYXN0cnVjdHVyZUxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2luZnJhc3RydWN0dXJlL0luZnJhc3RydWN0dXJlVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEluZnJhc3RydWN0dXJlIFZpZXcgTG9naWMgSG9va1xuICogSGFuZGxlcyBuZXR3b3JrIGluZnJhc3RydWN0dXJlIGFuZCBzZXJ2ZXIgZGlzY292ZXJ5XG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZURpc2NvdmVyeVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUnO1xuaW1wb3J0IHsgZ2V0RWxlY3Ryb25BUEkgfSBmcm9tICcuLi9saWIvZWxlY3Ryb24tYXBpLWZhbGxiYWNrJztcbmV4cG9ydCBjb25zdCB1c2VJbmZyYXN0cnVjdHVyZUxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgYWRkUmVzdWx0IH0gPSB1c2VEaXNjb3ZlcnlTdG9yZSgpO1xuICAgIGNvbnN0IFtpbmZyYXN0cnVjdHVyZSwgc2V0SW5mcmFzdHJ1Y3R1cmVdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtzZWxlY3RlZEl0ZW1zLCBzZXRTZWxlY3RlZEl0ZW1zXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbZmlsdGVyVHlwZSwgc2V0RmlsdGVyVHlwZV0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgbG9hZEluZnJhc3RydWN0dXJlID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbGVjdHJvbkFQSSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBlbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvSW5mcmFzdHJ1Y3R1cmVEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LUluZnJhc3RydWN0dXJlSW52ZW50b3J5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2V0SW5mcmFzdHJ1Y3R1cmUocmVzdWx0LmRhdGEuaW5mcmFzdHJ1Y3R1cmUgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpc2NvdmVyeVJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGBpbmZyYS0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0luZnJhc3RydWN0dXJlIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdJbmZyYXN0cnVjdHVyZURpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnTmV0d29yayBJbmZyYXN0cnVjdHVyZSBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgICAgICAgICBpdGVtQ291bnQ6IHJlc3VsdC5kYXRhLmluZnJhc3RydWN0dXJlPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgZGlzY292ZXJ5VGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogcmVzdWx0LmR1cmF0aW9uIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOiByZXN1bHQuZGF0YS5vdXRwdXRQYXRoIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiBgRGlzY292ZXJlZCAke3Jlc3VsdC5kYXRhLmluZnJhc3RydWN0dXJlPy5sZW5ndGggfHwgMH0gaW5mcmFzdHJ1Y3R1cmUgaXRlbXNgLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogcmVzdWx0LmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRkUmVzdWx0KGRpc2NvdmVyeVJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBpbmZyYXN0cnVjdHVyZTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2FkZFJlc3VsdF0pO1xuICAgIGNvbnN0IGZpbHRlcmVkSW5mcmFzdHJ1Y3R1cmUgPSBpbmZyYXN0cnVjdHVyZS5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSAhc2VhcmNoVGV4dCB8fFxuICAgICAgICAgICAgKGl0ZW0ubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICBpdGVtLmlwQWRkcmVzcy5pbmNsdWRlcyhzZWFyY2hUZXh0KTtcbiAgICAgICAgY29uc3QgbWF0Y2hlc1R5cGUgPSBmaWx0ZXJUeXBlID09PSAnYWxsJyB8fCBpdGVtLnR5cGUgPT09IGZpbHRlclR5cGU7XG4gICAgICAgIHJldHVybiBtYXRjaGVzU2VhcmNoICYmIG1hdGNoZXNUeXBlO1xuICAgIH0pO1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWxlY3Ryb25BUEkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICBlbGVjdHJvbkFQSS53cml0ZUZpbGUoYGluZnJhc3RydWN0dXJlLSR7RGF0ZS5ub3coKX0uanNvbmAsIEpTT04uc3RyaW5naWZ5KGZpbHRlcmVkSW5mcmFzdHJ1Y3R1cmUsIG51bGwsIDIpKTtcbiAgICB9LCBbZmlsdGVyZWRJbmZyYXN0cnVjdHVyZV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGluZnJhc3RydWN0dXJlOiBmaWx0ZXJlZEluZnJhc3RydWN0dXJlLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIHNlbGVjdGVkSXRlbXMsXG4gICAgICAgIHNldFNlbGVjdGVkSXRlbXMsXG4gICAgICAgIGZpbHRlclR5cGUsXG4gICAgICAgIHNldEZpbHRlclR5cGUsXG4gICAgICAgIGxvYWRJbmZyYXN0cnVjdHVyZSxcbiAgICAgICAgaGFuZGxlRXhwb3J0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5mcmFzdHJ1Y3R1cmUgVmlld1xuICogTmV0d29yayBpbmZyYXN0cnVjdHVyZSBhbmQgc2VydmVyIGludmVudG9yeVxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFJlZnJlc2hDdywgU2VydmVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUluZnJhc3RydWN0dXJlTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VJbmZyYXN0cnVjdHVyZUxvZ2ljJztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCBTZWFyY2hCYXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmNvbnN0IEluZnJhc3RydWN0dXJlVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGluZnJhc3RydWN0dXJlLCBpc0xvYWRpbmcsIHNlYXJjaFRleHQsIHNldFNlYXJjaFRleHQsIHNlbGVjdGVkSXRlbXMsIHNldFNlbGVjdGVkSXRlbXMsIGZpbHRlclR5cGUsIHNldEZpbHRlclR5cGUsIGxvYWRJbmZyYXN0cnVjdHVyZSwgaGFuZGxlRXhwb3J0LCB9ID0gdXNlSW5mcmFzdHJ1Y3R1cmVMb2dpYygpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRJbmZyYXN0cnVjdHVyZSgpO1xuICAgIH0sIFtsb2FkSW5mcmFzdHJ1Y3R1cmVdKTtcbiAgICBjb25zdCBjb2x1bW5EZWZzID0gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDIwMCB9LFxuICAgICAgICB7IGZpZWxkOiAndHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDEyMCB9LFxuICAgICAgICB7IGZpZWxkOiAnaXBBZGRyZXNzJywgaGVhZGVyTmFtZTogJ0lQIEFkZHJlc3MnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ29sb3JzID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6ICd0ZXh0LWdyZWVuLTYwMCBiZy1ncmVlbi01MCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZmxpbmU6ICd0ZXh0LXJlZC02MDAgYmctcmVkLTUwJyxcbiAgICAgICAgICAgICAgICAgICAgdW5rbm93bjogJ3RleHQtZ3JheS02MDAgYmctZ3JheS01MCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBgcHgtMiBweS0xIHJvdW5kZWQgdGV4dC14cyBmb250LXNlbWlib2xkICR7c3RhdHVzQ29sb3JzW3BhcmFtcy52YWx1ZV0gfHwgc3RhdHVzQ29sb3JzLnVua25vd259YCwgY2hpbGRyZW46IHBhcmFtcy52YWx1ZSB9KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7IGZpZWxkOiAnb3MnLCBoZWFkZXJOYW1lOiAnT3BlcmF0aW5nIFN5c3RlbScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2xhc3RTZWVuJywgaGVhZGVyTmFtZTogJ0xhc3QgU2VlbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxODAgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImluZnJhc3RydWN0dXJlLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImluZnJhc3RydWN0dXJlLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFNlcnZlciwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LXB1cnBsZS02MDAgZGFyazp0ZXh0LXB1cnBsZS00MDBcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiSW5mcmFzdHJ1Y3R1cmVcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJOZXR3b3JrIGluZnJhc3RydWN0dXJlIGFuZCBzZXJ2ZXIgaW52ZW50b3J5XCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBsb2FkSW5mcmFzdHJ1Y3R1cmUsIGxvYWRpbmc6IGlzTG9hZGluZywgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgZGlzYWJsZWQ6IGluZnJhc3RydWN0dXJlLmxlbmd0aCA9PT0gMCwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pXSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS0zXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBfanN4KFNlYXJjaEJhciwgeyB2YWx1ZTogc2VhcmNoVGV4dCwgb25DaGFuZ2U6IHNldFNlYXJjaFRleHQsIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBieSBuYW1lIG9yIElQIGFkZHJlc3MuLi5cIiwgXCJkYXRhLWN5XCI6IFwiaW5mcmFzdHJ1Y3R1cmUtc2VhcmNoXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJpbmZyYXN0cnVjdHVyZS1zZWFyY2hcIiB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQ4XCIsIGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVyVHlwZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0RmlsdGVyVHlwZSh2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBUeXBlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdzZXJ2ZXInLCBsYWJlbDogJ1NlcnZlcnMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnbmV0d29yaycsIGxhYmVsOiAnTmV0d29yayBEZXZpY2VzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ3N0b3JhZ2UnLCBsYWJlbDogJ1N0b3JhZ2UnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAndmlydHVhbGl6YXRpb24nLCBsYWJlbDogJ1ZpcnR1YWxpemF0aW9uJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCBcImRhdGEtY3lcIjogXCJ0eXBlLWZpbHRlclwiLCBcImRhdGEtdGVzdGlkXCI6IFwidHlwZS1maWx0ZXJcIiB9KSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHAtNlwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy1tZCBwLTRcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBpbmZyYXN0cnVjdHVyZSwgY29sdW1uczogY29sdW1uRGVmcywgbG9hZGluZzogaXNMb2FkaW5nLCBvblNlbGVjdGlvbkNoYW5nZTogc2V0U2VsZWN0ZWRJdGVtcywgZW5hYmxlRXhwb3J0OiB0cnVlLCBcImRhdGEtY3lcIjogXCJpbmZyYXN0cnVjdHVyZS1ncmlkXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJpbmZyYXN0cnVjdHVyZS1ncmlkXCIgfSkgfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS0yXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJUb3RhbCBpdGVtczogXCIsIGluZnJhc3RydWN0dXJlLmxlbmd0aF0gfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJTZWxlY3RlZDogXCIsIChzZWxlY3RlZEl0ZW1zPy5sZW5ndGggPz8gMCldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEluZnJhc3RydWN0dXJlVmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCIvKipcbiAqIERpc2NvdmVyeSBTdG9yZVxuICpcbiAqIE1hbmFnZXMgZGlzY292ZXJ5IG9wZXJhdGlvbnMsIHJlc3VsdHMsIGFuZCBzdGF0ZS5cbiAqIEhhbmRsZXMgZG9tYWluLCBuZXR3b3JrLCB1c2VyLCBhbmQgYXBwbGljYXRpb24gZGlzY292ZXJ5IHByb2Nlc3Nlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAnenVzdGFuZCc7XG5pbXBvcnQgeyBkZXZ0b29scywgc3Vic2NyaWJlV2l0aFNlbGVjdG9yIH0gZnJvbSAnenVzdGFuZC9taWRkbGV3YXJlJztcbmV4cG9ydCBjb25zdCB1c2VEaXNjb3ZlcnlTdG9yZSA9IGNyZWF0ZSgpKGRldnRvb2xzKHN1YnNjcmliZVdpdGhTZWxlY3Rvcigoc2V0LCBnZXQpID0+ICh7XG4gICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgIG9wZXJhdGlvbnM6IG5ldyBNYXAoKSxcbiAgICByZXN1bHRzOiBuZXcgTWFwKCksXG4gICAgc2VsZWN0ZWRPcGVyYXRpb246IG51bGwsXG4gICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgLy8gQWN0aW9uc1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IGEgbmV3IGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBzdGFydERpc2NvdmVyeTogYXN5bmMgKHR5cGUsIHBhcmFtZXRlcnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBjYW5jZWxsYXRpb25Ub2tlbiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0luaXRpYWxpemluZyBkaXNjb3ZlcnkuLi4nLFxuICAgICAgICAgICAgaXRlbXNEaXNjb3ZlcmVkOiAwLFxuICAgICAgICAgICAgc3RhcnRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBvcGVyYXRpb24gdG8gc3RhdGVcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLnNldChvcGVyYXRpb25JZCwgb3BlcmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTZXR1cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICBjb25zdCBwcm9ncmVzc0NsZWFudXAgPSB3aW5kb3cuZWxlY3Ryb25BUEkub25Qcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIGRhdGEucGVyY2VudGFnZSwgZGF0YS5tZXNzYWdlIHx8ICdQcm9jZXNzaW5nLi4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBkaXNjb3ZlcnkgbW9kdWxlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogYE1vZHVsZXMvRGlzY292ZXJ5LyR7dHlwZX0ucHNtMWAsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBgU3RhcnQtJHt0eXBlfURpc2NvdmVyeWAsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ2xlYW51cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5jb21wbGV0ZURpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmRhdGE/LnJlc3VsdHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BlcmF0aW9uSWQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSBydW5uaW5nIGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBjYW5jZWxEaXNjb3Zlcnk6IGFzeW5jIChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgIGlmICghb3BlcmF0aW9uIHx8IG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKG9wZXJhdGlvbi5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3AgPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICBvcC5tZXNzYWdlID0gJ0Rpc2NvdmVyeSBjYW5jZWxsZWQgYnkgdXNlcic7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJvZ3Jlc3MgZm9yIGEgcnVubmluZyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGVQcm9ncmVzczogKG9wZXJhdGlvbklkLCBwcm9ncmVzcywgbWVzc2FnZSkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gJiYgb3BlcmF0aW9uLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGNvbXBsZXRlZCB3aXRoIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb21wbGV0ZURpc2NvdmVyeTogKG9wZXJhdGlvbklkLCByZXN1bHRzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcmVkICR7cmVzdWx0cy5sZW5ndGh9IGl0ZW1zYDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uaXRlbXNEaXNjb3ZlcmVkID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KG9wZXJhdGlvbklkLCByZXN1bHRzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBmYWlsZWRcbiAgICAgKi9cbiAgICBmYWlsRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIGVycm9yKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcnkgZmFpbGVkOiAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYSBzaW5nbGUgb3BlcmF0aW9uIGFuZCBpdHMgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyT3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbiA9PT0gb3BlcmF0aW9uSWQgPyBudWxsIDogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvcGVyYXRpb25zIGFuZCByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJBbGxPcGVyYXRpb25zOiAoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgY2xlYXIgY29tcGxldGVkLCBmYWlsZWQsIG9yIGNhbmNlbGxlZCBvcGVyYXRpb25zXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgb3BlcmF0aW9uXSBvZiBuZXdPcGVyYXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldE9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBmb3IgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGJ5IG1vZHVsZSBuYW1lIChmb3IgcGVyc2lzdGVudCByZXRyaWV2YWwgYWNyb3NzIGNvbXBvbmVudCByZW1vdW50cylcbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lOiAobW9kdWxlTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQobW9kdWxlTmFtZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBkaXNjb3ZlcnkgcmVzdWx0IChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgYWRkUmVzdWx0OiAocmVzdWx0KSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZXN1bHRzID0gbmV3UmVzdWx0cy5nZXQocmVzdWx0Lm1vZHVsZU5hbWUpIHx8IFtdO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQocmVzdWx0Lm1vZHVsZU5hbWUsIFsuLi5leGlzdGluZ1Jlc3VsdHMsIHJlc3VsdF0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgcmVzdWx0czogbmV3UmVzdWx0cyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwcm9ncmVzcyBpbmZvcm1hdGlvbiAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIHNldFByb2dyZXNzOiAocHJvZ3Jlc3NEYXRhKSA9PiB7XG4gICAgICAgIC8vIEZpbmQgdGhlIGN1cnJlbnQgb3BlcmF0aW9uIGZvciB0aGlzIG1vZHVsZSBhbmQgdXBkYXRlIGl0XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbnMgPSBnZXQoKS5vcGVyYXRpb25zO1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IEFycmF5LmZyb20ob3BlcmF0aW9ucy5rZXlzKCkpLmZpbmQoaWQgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBvcGVyYXRpb25zLmdldChpZCk7XG4gICAgICAgICAgICByZXR1cm4gb3AgJiYgb3AudHlwZSA9PT0gcHJvZ3Jlc3NEYXRhLm1vZHVsZU5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3BlcmF0aW9uSWQpIHtcbiAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBwcm9ncmVzc0RhdGEub3ZlcmFsbFByb2dyZXNzLCBwcm9ncmVzc0RhdGEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxufSkpLCB7XG4gICAgbmFtZTogJ0Rpc2NvdmVyeVN0b3JlJyxcbn0pKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==