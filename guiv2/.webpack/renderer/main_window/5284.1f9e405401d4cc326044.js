"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5284],{

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

/***/ 69272:
/*!*******************************************************************!*\
  !*** ./src/renderer/hooks/useVMwareDiscoveryLogic.ts + 1 modules ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  useVMwareDiscoveryLogic: () => (/* binding */ useVMwareDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/vmware.ts
/**
 * VMware Discovery Type Definitions
 * Maps to VMwareDiscovery.psm1 PowerShell module
 */
const DEFAULT_VMWARE_CONFIG = {
    includeHosts: true,
    includeVMs: true,
    includeClusters: true,
    includeDatastores: true,
    includeNetworking: true,
    includeResourcePools: true,
    includeSnapshots: true,
    includeTemplates: false,
    collectPerformanceMetrics: true,
    detectSecurityIssues: true,
    timeout: 300,
    parallelScans: 5,
};
const VMWARE_TEMPLATES = [
    {
        name: 'Full VMware Discovery',
        description: 'Complete VMware infrastructure discovery',
        isDefault: true,
        category: 'Full',
        config: DEFAULT_VMWARE_CONFIG,
    },
    {
        name: 'Quick Inventory',
        description: 'Fast inventory of VMs and hosts',
        isDefault: false,
        category: 'Quick',
        config: {
            ...DEFAULT_VMWARE_CONFIG,
            includeNetworking: false,
            includeResourcePools: false,
            includeSnapshots: false,
            collectPerformanceMetrics: false,
            detectSecurityIssues: false,
            timeout: 120,
        },
    },
    {
        name: 'VM Inventory',
        description: 'Focus on virtual machine inventory',
        isDefault: false,
        category: 'Inventory',
        config: {
            ...DEFAULT_VMWARE_CONFIG,
            includeHosts: false,
            includeDatastores: false,
            includeNetworking: false,
            includeResourcePools: false,
            collectPerformanceMetrics: false,
            detectSecurityIssues: false,
        },
    },
    {
        name: 'Performance Analysis',
        description: 'Collect performance metrics',
        isDefault: false,
        category: 'Performance',
        config: {
            ...DEFAULT_VMWARE_CONFIG,
            includeNetworking: false,
            includeResourcePools: false,
            includeSnapshots: false,
            detectSecurityIssues: false,
        },
    },
    {
        name: 'Security Audit',
        description: 'Security and compliance scanning',
        isDefault: false,
        category: 'Security',
        config: {
            ...DEFAULT_VMWARE_CONFIG,
            includeNetworking: false,
            includeResourcePools: false,
            collectPerformanceMetrics: false,
        },
    },
];

// EXTERNAL MODULE: ./src/renderer/store/useDiscoveryStore.ts
var useDiscoveryStore = __webpack_require__(92856);
;// ./src/renderer/hooks/useVMwareDiscoveryLogic.ts



const formatBytes = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
const useVMwareDiscoveryLogic = () => {
    const { getResultsByModuleName } = (0,useDiscoveryStore.useDiscoveryStore)();
    const [config, setConfig] = (0,react.useState)({
        vCenters: [],
        includeHosts: true,
        includeVMs: true,
        includeClusters: true,
        includeDatastores: true,
        includeNetworking: false,
        includeResourcePools: false,
        includeSnapshots: false,
        includeTemplates: false,
        collectPerformanceMetrics: true,
        detectSecurityIssues: false,
        timeout: 300,
        parallelScans: 5,
    });
    const [result, setResult] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [progress, setProgress] = (0,react.useState)(0);
    const [error, setError] = (0,react.useState)(null);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [activeTab, setActiveTab] = (0,react.useState)('overview');
    const templates = VMWARE_TEMPLATES.map(template => ({
        ...template,
        id: template.name.toLowerCase().replace(/\s+/g, '-'),
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        createdBy: 'system',
    }));
    // Load previous discovery results from store on mount
    (0,react.useEffect)(() => {
        const previousResults = getResultsByModuleName('VMwareDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[VMwareDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setResult(latestResult);
        }
    }, [getResultsByModuleName]);
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
                modulePath: 'Modules/Discovery/VMwareDiscovery.psm1',
                functionName: 'Invoke-VMwareDiscovery',
                parameters: {
                    VCenters: config.vCenters,
                    IncludeHosts: config.includeHosts,
                    IncludeVMs: config.includeVMs,
                    IncludeClusters: config.includeClusters,
                    IncludeDatastores: config.includeDatastores,
                    IncludeSnapshots: config.includeSnapshots,
                    IncludeNetworking: config.includeNetworking,
                    Timeout: config.timeout,
                },
            });
            clearInterval(progressInterval);
            setProgress(100);
            if (scriptResult.success) {
                setResult(scriptResult.data);
            }
            else {
                setError(scriptResult.error || 'VMware discovery failed');
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
        setConfig((prev) => ({
            ...prev,
            name: template.name,
            parameters: { ...template.config },
        }));
    };
    const handleExport = async () => {
        if (!result)
            return;
        try {
            const csvContent = generateCSV(result);
            await window.electronAPI.writeFile(`VMwareDiscovery_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };
    const generateCSV = (data) => {
        const headers = ['Type', 'Name', 'Cluster', 'Status', 'CPU', 'Memory', 'Details'];
        const rows = [];
        (data?.hosts ?? []).forEach((host) => {
            rows.push([
                'Host',
                host.name ?? 'Unknown',
                host.cluster ?? 'N/A',
                host.status ?? 'Unknown',
                `${host.cpuCores ?? 0} cores`,
                formatBytes((host.memoryGB ?? 0) * 1024 * 1024 * 1024),
                `VMs: ${host.vmCount ?? 0}`,
            ]);
        });
        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    };
    // Filter data based on search text
    const filteredHosts = (0,react.useMemo)(() => {
        if (!result)
            return [];
        const hosts = result?.hosts ?? [];
        if (!searchText)
            return hosts;
        const search = searchText.toLowerCase();
        return hosts.filter((host) => (host.name ?? '').toLowerCase().includes(search) ||
            host.cluster?.toLowerCase().includes(search) ||
            (host.version ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    const filteredVMs = (0,react.useMemo)(() => {
        if (!result)
            return [];
        const vms = result?.vms ?? [];
        if (!searchText)
            return vms;
        const search = searchText.toLowerCase();
        return vms.filter((vm) => (vm.name ?? '').toLowerCase().includes(search) ||
            (vm.guestOS ?? '').toLowerCase().includes(search) ||
            (vm.powerState ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    const filteredClusters = (0,react.useMemo)(() => {
        if (!result)
            return [];
        const clusters = result?.clusters ?? [];
        if (!searchText)
            return clusters;
        const search = searchText.toLowerCase();
        return clusters.filter((cluster) => (cluster.name ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    // AG Grid column definitions
    const hostColumns = [
        { field: 'name', headerName: 'Host Name', sortable: true, filter: true, flex: 1.5 },
        { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
        { field: 'cluster', headerName: 'Cluster', sortable: true, filter: true, flex: 1 },
        { field: 'vmCount', headerName: 'VMs', sortable: true, filter: true, flex: 0.7 },
        { field: 'cpuCores', headerName: 'CPU Cores', sortable: true, filter: true, flex: 0.8 },
        {
            field: 'memoryGB',
            headerName: 'Memory',
            sortable: true,
            filter: true,
            flex: 0.8,
            valueFormatter: (params) => `${params.value} GB`,
        },
        { field: 'uptime', headerName: 'Uptime (days)', sortable: true, filter: true, flex: 0.8 },
        { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
    ];
    const vmColumns = [
        { field: 'name', headerName: 'VM Name', sortable: true, filter: true, flex: 1.5 },
        { field: 'powerState', headerName: 'Power State', sortable: true, filter: true, flex: 0.8 },
        { field: 'guestOS', headerName: 'Guest OS', sortable: true, filter: true, flex: 1.2 },
        { field: 'cpuCount', headerName: 'CPUs', sortable: true, filter: true, flex: 0.6 },
        {
            field: 'memoryGB',
            headerName: 'Memory',
            sortable: true,
            filter: true,
            flex: 0.7,
            valueFormatter: (params) => `${params.value} GB`,
        },
        {
            field: 'diskGB',
            headerName: 'Disk',
            sortable: true,
            filter: true,
            flex: 0.8,
            valueFormatter: (params) => `${params.value} GB`,
        },
        { field: 'toolsStatus', headerName: 'Tools', sortable: true, filter: true, flex: 0.8 },
        { field: 'snapshotCount', headerName: 'Snapshots', sortable: true, filter: true, flex: 0.8 },
    ];
    const clusterColumns = [
        { field: 'name', headerName: 'Cluster Name', sortable: true, filter: true, flex: 1.5 },
        { field: 'hostCount', headerName: 'Hosts', sortable: true, filter: true, flex: 0.7 },
        { field: 'vmCount', headerName: 'VMs', sortable: true, filter: true, flex: 0.7 },
        { field: 'drsEnabled', headerName: 'DRS', sortable: true, filter: true, flex: 0.6 },
        { field: 'haEnabled', headerName: 'HA', sortable: true, filter: true, flex: 0.6 },
        { field: 'totalCpuCores', headerName: 'Total CPU', sortable: true, filter: true, flex: 0.8 },
        {
            field: 'totalMemoryGB',
            headerName: 'Total Memory',
            sortable: true,
            filter: true,
            flex: 1,
            valueFormatter: (params) => `${params.value} GB`,
        },
    ];
    // Statistics
    const stats = (0,react.useMemo)(() => {
        if (!result)
            return null;
        const totalHosts = result?.hosts?.length ?? 0;
        const totalVMs = result?.vms?.length ?? 0;
        const poweredOnVMs = (result?.vms ?? []).filter((vm) => vm.powerState === 'PoweredOn').length;
        const totalClusters = result?.clusters?.length ?? 0;
        const totalStorageTB = (result?.datastores ?? []).reduce((sum, ds) => sum + ds.capacityGB, 0) / 1024 || 0;
        const usedStorageTB = (result?.datastores ?? []).reduce((sum, ds) => sum + (ds.capacityGB - (ds.freeGB || ds.freeSpaceGB)), 0) / 1024 || 0;
        return {
            totalHosts,
            totalVMs,
            poweredOnVMs,
            totalClusters,
            totalStorageTB,
            usedStorageTB,
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
        filteredHosts,
        filteredVMs,
        filteredClusters,
        hostColumns,
        vmColumns,
        clusterColumns,
        stats,
    };
};


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RCxNQUFNO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdHlwZXMvbW9kZWxzL3Ztd2FyZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VWTXdhcmVEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiLyoqXG4gKiBWTXdhcmUgRGlzY292ZXJ5IFR5cGUgRGVmaW5pdGlvbnNcbiAqIE1hcHMgdG8gVk13YXJlRGlzY292ZXJ5LnBzbTEgUG93ZXJTaGVsbCBtb2R1bGVcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfVk1XQVJFX0NPTkZJRyA9IHtcbiAgICBpbmNsdWRlSG9zdHM6IHRydWUsXG4gICAgaW5jbHVkZVZNczogdHJ1ZSxcbiAgICBpbmNsdWRlQ2x1c3RlcnM6IHRydWUsXG4gICAgaW5jbHVkZURhdGFzdG9yZXM6IHRydWUsXG4gICAgaW5jbHVkZU5ldHdvcmtpbmc6IHRydWUsXG4gICAgaW5jbHVkZVJlc291cmNlUG9vbHM6IHRydWUsXG4gICAgaW5jbHVkZVNuYXBzaG90czogdHJ1ZSxcbiAgICBpbmNsdWRlVGVtcGxhdGVzOiBmYWxzZSxcbiAgICBjb2xsZWN0UGVyZm9ybWFuY2VNZXRyaWNzOiB0cnVlLFxuICAgIGRldGVjdFNlY3VyaXR5SXNzdWVzOiB0cnVlLFxuICAgIHRpbWVvdXQ6IDMwMCxcbiAgICBwYXJhbGxlbFNjYW5zOiA1LFxufTtcbmV4cG9ydCBjb25zdCBWTVdBUkVfVEVNUExBVEVTID0gW1xuICAgIHtcbiAgICAgICAgbmFtZTogJ0Z1bGwgVk13YXJlIERpc2NvdmVyeScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tcGxldGUgVk13YXJlIGluZnJhc3RydWN0dXJlIGRpc2NvdmVyeScsXG4gICAgICAgIGlzRGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgY2F0ZWdvcnk6ICdGdWxsJyxcbiAgICAgICAgY29uZmlnOiBERUZBVUxUX1ZNV0FSRV9DT05GSUcsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdRdWljayBJbnZlbnRvcnknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Zhc3QgaW52ZW50b3J5IG9mIFZNcyBhbmQgaG9zdHMnLFxuICAgICAgICBpc0RlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjYXRlZ29yeTogJ1F1aWNrJyxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAuLi5ERUZBVUxUX1ZNV0FSRV9DT05GSUcsXG4gICAgICAgICAgICBpbmNsdWRlTmV0d29ya2luZzogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlUmVzb3VyY2VQb29sczogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlU25hcHNob3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbGxlY3RQZXJmb3JtYW5jZU1ldHJpY3M6IGZhbHNlLFxuICAgICAgICAgICAgZGV0ZWN0U2VjdXJpdHlJc3N1ZXM6IGZhbHNlLFxuICAgICAgICAgICAgdGltZW91dDogMTIwLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnVk0gSW52ZW50b3J5JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGb2N1cyBvbiB2aXJ0dWFsIG1hY2hpbmUgaW52ZW50b3J5JyxcbiAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgY2F0ZWdvcnk6ICdJbnZlbnRvcnknLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIC4uLkRFRkFVTFRfVk1XQVJFX0NPTkZJRyxcbiAgICAgICAgICAgIGluY2x1ZGVIb3N0czogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlRGF0YXN0b3JlczogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlTmV0d29ya2luZzogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlUmVzb3VyY2VQb29sczogZmFsc2UsXG4gICAgICAgICAgICBjb2xsZWN0UGVyZm9ybWFuY2VNZXRyaWNzOiBmYWxzZSxcbiAgICAgICAgICAgIGRldGVjdFNlY3VyaXR5SXNzdWVzOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ1BlcmZvcm1hbmNlIEFuYWx5c2lzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDb2xsZWN0IHBlcmZvcm1hbmNlIG1ldHJpY3MnLFxuICAgICAgICBpc0RlZmF1bHQ6IGZhbHNlLFxuICAgICAgICBjYXRlZ29yeTogJ1BlcmZvcm1hbmNlJyxcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAuLi5ERUZBVUxUX1ZNV0FSRV9DT05GSUcsXG4gICAgICAgICAgICBpbmNsdWRlTmV0d29ya2luZzogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlUmVzb3VyY2VQb29sczogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlU25hcHNob3RzOiBmYWxzZSxcbiAgICAgICAgICAgIGRldGVjdFNlY3VyaXR5SXNzdWVzOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ1NlY3VyaXR5IEF1ZGl0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTZWN1cml0eSBhbmQgY29tcGxpYW5jZSBzY2FubmluZycsXG4gICAgICAgIGlzRGVmYXVsdDogZmFsc2UsXG4gICAgICAgIGNhdGVnb3J5OiAnU2VjdXJpdHknLFxuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIC4uLkRFRkFVTFRfVk1XQVJFX0NPTkZJRyxcbiAgICAgICAgICAgIGluY2x1ZGVOZXR3b3JraW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGluY2x1ZGVSZXNvdXJjZVBvb2xzOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbGxlY3RQZXJmb3JtYW5jZU1ldHJpY3M6IGZhbHNlLFxuICAgICAgICB9LFxuICAgIH0sXG5dO1xuIiwiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZU1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFZNV0FSRV9URU1QTEFURVMgfSBmcm9tICcuLi90eXBlcy9tb2RlbHMvdm13YXJlJztcbmltcG9ydCB7IHVzZURpc2NvdmVyeVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUnO1xuY29uc3QgZm9ybWF0Qnl0ZXMgPSAoYnl0ZXMpID0+IHtcbiAgICBpZiAoYnl0ZXMgPT09IDApXG4gICAgICAgIHJldHVybiAnMCBCJztcbiAgICBjb25zdCBrID0gMTAyNDtcbiAgICBjb25zdCBzaXplcyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQiddO1xuICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcbiAgICByZXR1cm4gYCR7cGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZCgyKSl9ICR7c2l6ZXNbaV19YDtcbn07XG5leHBvcnQgY29uc3QgdXNlVk13YXJlRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lIH0gPSB1c2VEaXNjb3ZlcnlTdG9yZSgpO1xuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHZDZW50ZXJzOiBbXSxcbiAgICAgICAgaW5jbHVkZUhvc3RzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlVk1zOiB0cnVlLFxuICAgICAgICBpbmNsdWRlQ2x1c3RlcnM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVEYXRhc3RvcmVzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlTmV0d29ya2luZzogZmFsc2UsXG4gICAgICAgIGluY2x1ZGVSZXNvdXJjZVBvb2xzOiBmYWxzZSxcbiAgICAgICAgaW5jbHVkZVNuYXBzaG90czogZmFsc2UsXG4gICAgICAgIGluY2x1ZGVUZW1wbGF0ZXM6IGZhbHNlLFxuICAgICAgICBjb2xsZWN0UGVyZm9ybWFuY2VNZXRyaWNzOiB0cnVlLFxuICAgICAgICBkZXRlY3RTZWN1cml0eUlzc3VlczogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IDMwMCxcbiAgICAgICAgcGFyYWxsZWxTY2FuczogNSxcbiAgICB9KTtcbiAgICBjb25zdCBbcmVzdWx0LCBzZXRSZXN1bHRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKDApO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcbiAgICBjb25zdCB0ZW1wbGF0ZXMgPSBWTVdBUkVfVEVNUExBVEVTLm1hcCh0ZW1wbGF0ZSA9PiAoe1xuICAgICAgICAuLi50ZW1wbGF0ZSxcbiAgICAgICAgaWQ6IHRlbXBsYXRlLm5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICctJyksXG4gICAgICAgIGNyZWF0ZWREYXRlOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIG1vZGlmaWVkRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBjcmVhdGVkQnk6ICdzeXN0ZW0nLFxuICAgIH0pKTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdWTXdhcmVEaXNjb3ZlcnknKTtcbiAgICAgICAgaWYgKHByZXZpb3VzUmVzdWx0cyAmJiBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tWTXdhcmVEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RSZXN1bHQgPSBwcmV2aW91c1Jlc3VsdHNbcHJldmlvdXNSZXN1bHRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgc2V0UmVzdWx0KGxhdGVzdFJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZV0pO1xuICAgIGNvbnN0IGhhbmRsZVN0YXJ0RGlzY292ZXJ5ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldFByb2dyZXNzKDApO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgc2V0UmVzdWx0KG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRQcm9ncmVzcygocHJldikgPT4gTWF0aC5taW4ocHJldiArIE1hdGgucmFuZG9tKCkgKiAxNSwgOTUpKTtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICBjb25zdCBzY3JpcHRSZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L1ZNd2FyZURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdJbnZva2UtVk13YXJlRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFZDZW50ZXJzOiBjb25maWcudkNlbnRlcnMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVIb3N0czogY29uZmlnLmluY2x1ZGVIb3N0cyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVZNczogY29uZmlnLmluY2x1ZGVWTXMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVDbHVzdGVyczogY29uZmlnLmluY2x1ZGVDbHVzdGVycyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZURhdGFzdG9yZXM6IGNvbmZpZy5pbmNsdWRlRGF0YXN0b3JlcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVNuYXBzaG90czogY29uZmlnLmluY2x1ZGVTbmFwc2hvdHMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVOZXR3b3JraW5nOiBjb25maWcuaW5jbHVkZU5ldHdvcmtpbmcsXG4gICAgICAgICAgICAgICAgICAgIFRpbWVvdXQ6IGNvbmZpZy50aW1lb3V0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocHJvZ3Jlc3NJbnRlcnZhbCk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcygxMDApO1xuICAgICAgICAgICAgaWYgKHNjcmlwdFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0KHNjcmlwdFJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKHNjcmlwdFJlc3VsdC5lcnJvciB8fCAnVk13YXJlIGRpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0FuIHVua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUFwcGx5VGVtcGxhdGUgPSAodGVtcGxhdGUpID0+IHtcbiAgICAgICAgc2V0Q29uZmlnKChwcmV2KSA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIG5hbWU6IHRlbXBsYXRlLm5hbWUsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IC4uLnRlbXBsYXRlLmNvbmZpZyB9LFxuICAgICAgICB9KSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY3N2Q29udGVudCA9IGdlbmVyYXRlQ1NWKHJlc3VsdCk7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkud3JpdGVGaWxlKGBWTXdhcmVEaXNjb3ZlcnlfJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YCwgY3N2Q29udGVudCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdFeHBvcnQgZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdlbmVyYXRlQ1NWID0gKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IFsnVHlwZScsICdOYW1lJywgJ0NsdXN0ZXInLCAnU3RhdHVzJywgJ0NQVScsICdNZW1vcnknLCAnRGV0YWlscyddO1xuICAgICAgICBjb25zdCByb3dzID0gW107XG4gICAgICAgIChkYXRhPy5ob3N0cyA/PyBbXSkuZm9yRWFjaCgoaG9zdCkgPT4ge1xuICAgICAgICAgICAgcm93cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAnSG9zdCcsXG4gICAgICAgICAgICAgICAgaG9zdC5uYW1lID8/ICdVbmtub3duJyxcbiAgICAgICAgICAgICAgICBob3N0LmNsdXN0ZXIgPz8gJ04vQScsXG4gICAgICAgICAgICAgICAgaG9zdC5zdGF0dXMgPz8gJ1Vua25vd24nLFxuICAgICAgICAgICAgICAgIGAke2hvc3QuY3B1Q29yZXMgPz8gMH0gY29yZXNgLFxuICAgICAgICAgICAgICAgIGZvcm1hdEJ5dGVzKChob3N0Lm1lbW9yeUdCID8/IDApICogMTAyNCAqIDEwMjQgKiAxMDI0KSxcbiAgICAgICAgICAgICAgICBgVk1zOiAke2hvc3Qudm1Db3VudCA/PyAwfWAsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbaGVhZGVycy5qb2luKCcsJyksIC4uLnJvd3MubWFwKChyb3cpID0+IHJvdy5qb2luKCcsJykpXS5qb2luKCdcXG4nKTtcbiAgICB9O1xuICAgIC8vIEZpbHRlciBkYXRhIGJhc2VkIG9uIHNlYXJjaCB0ZXh0XG4gICAgY29uc3QgZmlsdGVyZWRIb3N0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgaG9zdHMgPSByZXN1bHQ/Lmhvc3RzID8/IFtdO1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gaG9zdHM7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGhvc3RzLmZpbHRlcigoaG9zdCkgPT4gKGhvc3QubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICBob3N0LmNsdXN0ZXI/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgKGhvc3QudmVyc2lvbiA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICB9LCBbcmVzdWx0LCBzZWFyY2hUZXh0XSk7XG4gICAgY29uc3QgZmlsdGVyZWRWTXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IHZtcyA9IHJlc3VsdD8udm1zID8/IFtdO1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gdm1zO1xuICAgICAgICBjb25zdCBzZWFyY2ggPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiB2bXMuZmlsdGVyKCh2bSkgPT4gKHZtLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgKHZtLmd1ZXN0T1MgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgKHZtLnBvd2VyU3RhdGUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgfSwgW3Jlc3VsdCwgc2VhcmNoVGV4dF0pO1xuICAgIGNvbnN0IGZpbHRlcmVkQ2x1c3RlcnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJzID0gcmVzdWx0Py5jbHVzdGVycyA/PyBbXTtcbiAgICAgICAgaWYgKCFzZWFyY2hUZXh0KVxuICAgICAgICAgICAgcmV0dXJuIGNsdXN0ZXJzO1xuICAgICAgICBjb25zdCBzZWFyY2ggPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBjbHVzdGVycy5maWx0ZXIoKGNsdXN0ZXIpID0+IChjbHVzdGVyLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgfSwgW3Jlc3VsdCwgc2VhcmNoVGV4dF0pO1xuICAgIC8vIEFHIEdyaWQgY29sdW1uIGRlZmluaXRpb25zXG4gICAgY29uc3QgaG9zdENvbHVtbnMgPSBbXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0hvc3QgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEuNSB9LFxuICAgICAgICB7IGZpZWxkOiAndmVyc2lvbicsIGhlYWRlck5hbWU6ICdWZXJzaW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnY2x1c3RlcicsIGhlYWRlck5hbWU6ICdDbHVzdGVyJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAndm1Db3VudCcsIGhlYWRlck5hbWU6ICdWTXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjcgfSxcbiAgICAgICAgeyBmaWVsZDogJ2NwdUNvcmVzJywgaGVhZGVyTmFtZTogJ0NQVSBDb3JlcycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ21lbW9yeUdCJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdNZW1vcnknLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAwLjgsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCR7cGFyYW1zLnZhbHVlfSBHQmAsXG4gICAgICAgIH0sXG4gICAgICAgIHsgZmllbGQ6ICd1cHRpbWUnLCBoZWFkZXJOYW1lOiAnVXB0aW1lIChkYXlzKScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgIF07XG4gICAgY29uc3Qgdm1Db2x1bW5zID0gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdWTSBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMS41IH0sXG4gICAgICAgIHsgZmllbGQ6ICdwb3dlclN0YXRlJywgaGVhZGVyTmFtZTogJ1Bvd2VyIFN0YXRlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC44IH0sXG4gICAgICAgIHsgZmllbGQ6ICdndWVzdE9TJywgaGVhZGVyTmFtZTogJ0d1ZXN0IE9TJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMS4yIH0sXG4gICAgICAgIHsgZmllbGQ6ICdjcHVDb3VudCcsIGhlYWRlck5hbWU6ICdDUFVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC42IH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbWVtb3J5R0InLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01lbW9yeScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGZsZXg6IDAuNyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJHtwYXJhbXMudmFsdWV9IEdCYCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNrR0InLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rpc2snLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAwLjgsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCR7cGFyYW1zLnZhbHVlfSBHQmAsXG4gICAgICAgIH0sXG4gICAgICAgIHsgZmllbGQ6ICd0b29sc1N0YXR1cycsIGhlYWRlck5hbWU6ICdUb29scycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgICAgICB7IGZpZWxkOiAnc25hcHNob3RDb3VudCcsIGhlYWRlck5hbWU6ICdTbmFwc2hvdHMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjggfSxcbiAgICBdO1xuICAgIGNvbnN0IGNsdXN0ZXJDb2x1bW5zID0gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdDbHVzdGVyIE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxLjUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2hvc3RDb3VudCcsIGhlYWRlck5hbWU6ICdIb3N0cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuNyB9LFxuICAgICAgICB7IGZpZWxkOiAndm1Db3VudCcsIGhlYWRlck5hbWU6ICdWTXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjcgfSxcbiAgICAgICAgeyBmaWVsZDogJ2Ryc0VuYWJsZWQnLCBoZWFkZXJOYW1lOiAnRFJTJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC42IH0sXG4gICAgICAgIHsgZmllbGQ6ICdoYUVuYWJsZWQnLCBoZWFkZXJOYW1lOiAnSEEnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjYgfSxcbiAgICAgICAgeyBmaWVsZDogJ3RvdGFsQ3B1Q29yZXMnLCBoZWFkZXJOYW1lOiAnVG90YWwgQ1BVJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC44IH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndG90YWxNZW1vcnlHQicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVG90YWwgTWVtb3J5JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJHtwYXJhbXMudmFsdWV9IEdCYCxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCB0b3RhbEhvc3RzID0gcmVzdWx0Py5ob3N0cz8ubGVuZ3RoID8/IDA7XG4gICAgICAgIGNvbnN0IHRvdGFsVk1zID0gcmVzdWx0Py52bXM/Lmxlbmd0aCA/PyAwO1xuICAgICAgICBjb25zdCBwb3dlcmVkT25WTXMgPSAocmVzdWx0Py52bXMgPz8gW10pLmZpbHRlcigodm0pID0+IHZtLnBvd2VyU3RhdGUgPT09ICdQb3dlcmVkT24nKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHRvdGFsQ2x1c3RlcnMgPSByZXN1bHQ/LmNsdXN0ZXJzPy5sZW5ndGggPz8gMDtcbiAgICAgICAgY29uc3QgdG90YWxTdG9yYWdlVEIgPSAocmVzdWx0Py5kYXRhc3RvcmVzID8/IFtdKS5yZWR1Y2UoKHN1bSwgZHMpID0+IHN1bSArIGRzLmNhcGFjaXR5R0IsIDApIC8gMTAyNCB8fCAwO1xuICAgICAgICBjb25zdCB1c2VkU3RvcmFnZVRCID0gKHJlc3VsdD8uZGF0YXN0b3JlcyA/PyBbXSkucmVkdWNlKChzdW0sIGRzKSA9PiBzdW0gKyAoZHMuY2FwYWNpdHlHQiAtIChkcy5mcmVlR0IgfHwgZHMuZnJlZVNwYWNlR0IpKSwgMCkgLyAxMDI0IHx8IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbEhvc3RzLFxuICAgICAgICAgICAgdG90YWxWTXMsXG4gICAgICAgICAgICBwb3dlcmVkT25WTXMsXG4gICAgICAgICAgICB0b3RhbENsdXN0ZXJzLFxuICAgICAgICAgICAgdG90YWxTdG9yYWdlVEIsXG4gICAgICAgICAgICB1c2VkU3RvcmFnZVRCLFxuICAgICAgICB9O1xuICAgIH0sIFtyZXN1bHRdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25maWcsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VhcmNoVGV4dCxcbiAgICAgICAgc2V0U2VhcmNoVGV4dCxcbiAgICAgICAgYWN0aXZlVGFiLFxuICAgICAgICBzZXRBY3RpdmVUYWIsXG4gICAgICAgIHRlbXBsYXRlcyxcbiAgICAgICAgaGFuZGxlU3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGhhbmRsZUFwcGx5VGVtcGxhdGUsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgZmlsdGVyZWRIb3N0cyxcbiAgICAgICAgZmlsdGVyZWRWTXMsXG4gICAgICAgIGZpbHRlcmVkQ2x1c3RlcnMsXG4gICAgICAgIGhvc3RDb2x1bW5zLFxuICAgICAgICB2bUNvbHVtbnMsXG4gICAgICAgIGNsdXN0ZXJDb2x1bW5zLFxuICAgICAgICBzdGF0cyxcbiAgICB9O1xufTtcbiIsIi8qKlxuICogRGlzY292ZXJ5IFN0b3JlXG4gKlxuICogTWFuYWdlcyBkaXNjb3Zlcnkgb3BlcmF0aW9ucywgcmVzdWx0cywgYW5kIHN0YXRlLlxuICogSGFuZGxlcyBkb21haW4sIG5ldHdvcmssIHVzZXIsIGFuZCBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcHJvY2Vzc2VzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICd6dXN0YW5kJztcbmltcG9ydCB7IGRldnRvb2xzLCBzdWJzY3JpYmVXaXRoU2VsZWN0b3IgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnO1xuZXhwb3J0IGNvbnN0IHVzZURpc2NvdmVyeVN0b3JlID0gY3JlYXRlKCkoZGV2dG9vbHMoc3Vic2NyaWJlV2l0aFNlbGVjdG9yKChzZXQsIGdldCkgPT4gKHtcbiAgICAvLyBJbml0aWFsIHN0YXRlXG4gICAgb3BlcmF0aW9uczogbmV3IE1hcCgpLFxuICAgIHJlc3VsdHM6IG5ldyBNYXAoKSxcbiAgICBzZWxlY3RlZE9wZXJhdGlvbjogbnVsbCxcbiAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAvLyBBY3Rpb25zXG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIHN0YXJ0RGlzY292ZXJ5OiBhc3luYyAodHlwZSwgcGFyYW1ldGVycykgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW5pdGlhbGl6aW5nIGRpc2NvdmVyeS4uLicsXG4gICAgICAgICAgICBpdGVtc0Rpc2NvdmVyZWQ6IDAsXG4gICAgICAgICAgICBzdGFydGVkQXQ6IERhdGUubm93KCksXG4gICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgfTtcbiAgICAgICAgLy8gQWRkIG9wZXJhdGlvbiB0byBzdGF0ZVxuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuc2V0KG9wZXJhdGlvbklkLCBvcGVyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiB0cnVlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFNldHVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgIGNvbnN0IHByb2dyZXNzQ2xlYW51cCA9IHdpbmRvdy5lbGVjdHJvbkFQSS5vblByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgZGF0YS5wZXJjZW50YWdlLCBkYXRhLm1lc3NhZ2UgfHwgJ1Byb2Nlc3NpbmcuLi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGRpc2NvdmVyeSBtb2R1bGVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiBgTW9kdWxlcy9EaXNjb3ZlcnkvJHt0eXBlfS5wc20xYCxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGBTdGFydC0ke3R5cGV9RGlzY292ZXJ5YCxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbU91dHB1dDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDbGVhbnVwIHByb2dyZXNzIGxpc3RlbmVyXG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGdldCgpLmNvbXBsZXRlRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZGF0YT8ucmVzdWx0cyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCByZXN1bHQuZXJyb3IgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb25JZDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHJ1bm5pbmcgZGlzY292ZXJ5IG9wZXJhdGlvblxuICAgICAqL1xuICAgIGNhbmNlbERpc2NvdmVyeTogYXN5bmMgKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgaWYgKCFvcGVyYXRpb24gfHwgb3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24ob3BlcmF0aW9uLmNhbmNlbGxhdGlvblRva2VuKTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgICAgICBjb25zdCBvcCA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgICAgICBpZiAob3ApIHtcbiAgICAgICAgICAgICAgICAgICAgb3Auc3RhdHVzID0gJ2NhbmNlbGxlZCc7XG4gICAgICAgICAgICAgICAgICAgIG9wLm1lc3NhZ2UgPSAnRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBwcm9ncmVzcyBmb3IgYSBydW5uaW5nIG9wZXJhdGlvblxuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiAob3BlcmF0aW9uSWQsIHByb2dyZXNzLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbiAmJiBvcGVyYXRpb24uc3RhdHVzID09PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgY29tcGxldGVkIHdpdGggcmVzdWx0c1xuICAgICAqL1xuICAgIGNvbXBsZXRlRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2NvbXBsZXRlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyZWQgJHtyZXN1bHRzLmxlbmd0aH0gaXRlbXNgO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5pdGVtc0Rpc2NvdmVyZWQgPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQob3BlcmF0aW9uSWQsIHJlc3VsdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGZhaWxlZFxuICAgICAqL1xuICAgIGZhaWxEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgZXJyb3IpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5lcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gYERpc2NvdmVyeSBmYWlsZWQ6ICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhIHNpbmdsZSBvcGVyYXRpb24gYW5kIGl0cyByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uID09PSBvcGVyYXRpb25JZCA/IG51bGwgOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG9wZXJhdGlvbnMgYW5kIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhckFsbE9wZXJhdGlvbnM6ICgpID0+IHtcbiAgICAgICAgLy8gT25seSBjbGVhciBjb21wbGV0ZWQsIGZhaWxlZCwgb3IgY2FuY2VsbGVkIG9wZXJhdGlvbnNcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2lkLCBvcGVyYXRpb25dIG9mIG5ld09wZXJhdGlvbnMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0T3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLm9wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGZvciBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldFJlc3VsdHM6IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgYnkgbW9kdWxlIG5hbWUgKGZvciBwZXJzaXN0ZW50IHJldHJpZXZhbCBhY3Jvc3MgY29tcG9uZW50IHJlbW91bnRzKVxuICAgICAqL1xuICAgIGdldFJlc3VsdHNCeU1vZHVsZU5hbWU6IChtb2R1bGVOYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChtb2R1bGVOYW1lKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEFkZCBhIGRpc2NvdmVyeSByZXN1bHQgKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBhZGRSZXN1bHQ6IChyZXN1bHQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdHMgPSBuZXdSZXN1bHRzLmdldChyZXN1bHQubW9kdWxlTmFtZSkgfHwgW107XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChyZXN1bHQubW9kdWxlTmFtZSwgWy4uLmV4aXN0aW5nUmVzdWx0cywgcmVzdWx0XSk7XG4gICAgICAgICAgICByZXR1cm4geyByZXN1bHRzOiBuZXdSZXN1bHRzIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHByb2dyZXNzIGluZm9ybWF0aW9uIChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgc2V0UHJvZ3Jlc3M6IChwcm9ncmVzc0RhdGEpID0+IHtcbiAgICAgICAgLy8gRmluZCB0aGUgY3VycmVudCBvcGVyYXRpb24gZm9yIHRoaXMgbW9kdWxlIGFuZCB1cGRhdGUgaXRcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9ucyA9IGdldCgpLm9wZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gQXJyYXkuZnJvbShvcGVyYXRpb25zLmtleXMoKSkuZmluZChpZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcCA9IG9wZXJhdGlvbnMuZ2V0KGlkKTtcbiAgICAgICAgICAgIHJldHVybiBvcCAmJiBvcC50eXBlID09PSBwcm9ncmVzc0RhdGEubW9kdWxlTmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChvcGVyYXRpb25JZCkge1xuICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIHByb2dyZXNzRGF0YS5vdmVyYWxsUHJvZ3Jlc3MsIHByb2dyZXNzRGF0YS5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KSksIHtcbiAgICBuYW1lOiAnRGlzY292ZXJ5U3RvcmUnLFxufSkpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9