"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4728],{

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

/***/ 94728:
/*!****************************************************************************!*\
  !*** ./src/renderer/views/compliance/ComplianceReportView.tsx + 1 modules ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ compliance_ComplianceReportView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useComplianceReportLogic.ts
/**
 * Compliance Report Logic Hook
 * Handles compliance framework reporting and assessment
 */


const useComplianceReportLogic = () => {
    const { selectedSourceProfile } = (0,useProfileStore.useProfileStore)();
    const [data, setData] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [filters, setFilters] = (0,react.useState)({
        framework: '',
        status: '',
        riskLevel: '',
        owner: '',
        searchText: '',
    });
    const [selectedItems, setSelectedItems] = (0,react.useState)([]);
    const columns = (0,react.useMemo)(() => [
        {
            headerName: 'Control ID',
            field: 'controlId',
            pinned: 'left',
            width: 140,
            filter: 'agTextColumnFilter',
            checkboxSelection: true,
            headerCheckboxSelection: true,
        },
        {
            headerName: 'Framework',
            field: 'framework',
            width: 120,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Title',
            field: 'title',
            width: 250,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 140,
            cellRenderer: (params) => {
                const colorMap = {
                    Compliant: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    NonCompliant: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    PartiallyCompliant: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    NotAssessed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                };
                const color = colorMap[params.value] || '';
                return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
            },
        },
        {
            headerName: 'Risk Level',
            field: 'riskLevel',
            width: 120,
            cellRenderer: (params) => {
                const colorMap = {
                    Critical: 'text-red-600',
                    High: 'text-orange-600',
                    Medium: 'text-yellow-600',
                    Low: 'text-green-600',
                };
                const color = colorMap[params.value] || 'text-gray-600';
                return `<span class="${color} font-semibold">${params.value}</span>`;
            },
        },
        {
            headerName: 'Score',
            field: 'score',
            width: 100,
            type: 'numericColumn',
            cellRenderer: (params) => {
                const value = params.value;
                const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
                return `<span class="${color} font-semibold">${value}%</span>`;
            },
        },
        {
            headerName: 'Category',
            field: 'category',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Owner',
            field: 'owner',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Due Date',
            field: 'dueDate',
            width: 140,
            valueFormatter: (params) => {
                if (!params.value)
                    return '';
                return new Date(params.value).toLocaleDateString();
            },
        },
        {
            headerName: 'Description',
            field: 'description',
            width: 300,
            wrapText: true,
        },
        {
            headerName: 'Evidence',
            field: 'evidence',
            width: 200,
        },
        {
            headerName: 'Remediation',
            field: 'remediation',
            width: 250,
        },
    ], []);
    const filteredData = (0,react.useMemo)(() => {
        let result = [...data];
        if (filters.framework)
            result = result.filter((item) => item.framework === filters.framework);
        if (filters.status)
            result = result.filter((item) => item.status === filters.status);
        if (filters.riskLevel)
            result = result.filter((item) => item.riskLevel === filters.riskLevel);
        if (filters.owner)
            result = result.filter((item) => item.owner?.toLowerCase().includes(filters.owner.toLowerCase()));
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((item) => item.title?.toLowerCase().includes(search) ||
                item.controlId?.toLowerCase().includes(search) ||
                item.description?.toLowerCase().includes(search));
        }
        return result;
    }, [data, filters]);
    const filterOptions = (0,react.useMemo)(() => {
        const frameworks = [...new Set((data ?? []).map((d) => d.framework).filter(Boolean))].sort();
        const statuses = [...new Set((data ?? []).map((d) => d.status).filter(Boolean))].sort();
        const riskLevels = ['Critical', 'High', 'Medium', 'Low'];
        const owners = [...new Set((data ?? []).map((d) => d.owner).filter(Boolean))].sort();
        return { frameworks, statuses, riskLevels, owners };
    }, [data]);
    const loadData = (0,react.useCallback)(async () => {
        if (!selectedSourceProfile) {
            setError('No source profile selected');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Compliance/ComplianceReport.psm1',
                functionName: 'Get-ComplianceControls',
                parameters: {
                    Domain: selectedSourceProfile.domain,
                    Credential: selectedSourceProfile.credential,
                },
                options: { timeout: 300000 },
            });
            if (result.success && result.data) {
                setData(result.data.controls || []);
            }
            else {
                throw new Error(result.error || 'Failed to load compliance data');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedSourceProfile]);
    const updateFilter = (0,react.useCallback)((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);
    const clearFilters = (0,react.useCallback)(() => {
        setFilters({ framework: '', status: '', riskLevel: '', owner: '', searchText: '' });
    }, []);
    const exportData = (0,react.useCallback)(async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return { filename: `compliance-report-${timestamp}.csv`, data: filteredData };
    }, [filteredData]);
    const stats = (0,react.useMemo)(() => {
        const total = filteredData.length;
        const compliant = filteredData.filter((d) => d.status === 'Compliant').length;
        const nonCompliant = filteredData.filter((d) => d.status === 'NonCompliant').length;
        const avgScore = total > 0 ? filteredData.reduce((sum, d) => sum + d.score, 0) / total : 0;
        return {
            total,
            compliant,
            nonCompliant,
            complianceRate: total > 0 ? ((compliant / total) * 100).toFixed(1) : '0',
            avgScore: avgScore.toFixed(1),
        };
    }, [filteredData]);
    (0,react.useEffect)(() => {
        if (selectedSourceProfile)
            loadData();
    }, [selectedSourceProfile, loadData]);
    return {
        data: filteredData,
        columns,
        isLoading,
        error,
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        selectedItems,
        setSelectedItems,
        loadData,
        exportData,
        stats,
        selectedProfile: selectedSourceProfile,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
;// ./src/renderer/views/compliance/ComplianceReportView.tsx

/**
 * Compliance Report View
 */






const ComplianceReportView = () => {
    const { data, columns, isLoading, error, filters, filterOptions, updateFilter, clearFilters, selectedItems, setSelectedItems, loadData, exportData, stats, selectedProfile, } = useComplianceReportLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "compliance-report-view", "data-testid": "compliance-report-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-8 h-8 text-green-600 dark:text-green-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Compliance Report" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Monitor compliance across frameworks" })] })] }), selectedProfile && (0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Total Controls" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Compliant" }), (0,jsx_runtime.jsxs)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: [stats?.compliant ?? 0, " ", (0,jsx_runtime.jsxs)("span", { className: "text-sm", children: ["(", stats?.complianceRate ?? 0, "%)"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Non-Compliant" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.nonCompliant ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Avg Score" }), (0,jsx_runtime.jsxs)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: [stats?.avgScore ?? 0, "%"] })] })] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react.Filter, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.framework || filters.status || filters.riskLevel || filters.owner || filters.searchText) && ((0,jsx_runtime.jsx)(Button.Button, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input.Input, { placeholder: "Search controls...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsxs)("select", { value: filters.framework || '', onChange: (e) => updateFilter('framework', e.target.value), "data-cy": "framework-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Frameworks" }), (filterOptions?.frameworks ?? []).map((fw) => ((0,jsx_runtime.jsx)("option", { value: fw || '', children: fw }, fw || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.status || '', onChange: (e) => updateFilter('status', e.target.value), "data-cy": "status-select", "data-testid": "status-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Statuses" }), (filterOptions?.statuses ?? []).map((st) => ((0,jsx_runtime.jsx)("option", { value: st || '', children: st }, st || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.riskLevel || '', onChange: (e) => updateFilter('riskLevel', e.target.value), "data-cy": "risk-level-select", "data-testid": "risk-level-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Risk Levels" }), (filterOptions?.riskLevels ?? []).map((rl) => ((0,jsx_runtime.jsx)("option", { value: rl || '', children: rl }, rl || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.owner || '', onChange: (e) => updateFilter('owner', e.target.value), "data-cy": "owner-select", "data-testid": "owner-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Owners" }), (filterOptions?.owners ?? []).map((own) => ((0,jsx_runtime.jsx)("option", { value: own || '', children: own }, own || 'unknown')))] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: exportData, disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", children: "Export Report" })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedItems, height: "calc(100vh - 500px)" }) })] }));
};
/* harmony default export */ const compliance_ComplianceReportView = (ComplianceReportView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RCxHQUFHLG1CQUFJLFNBQVMsK0VBQStFLHlHQUF5RyxtQkFBSSxDQUFDLGFBQU0sSUFBSSxvQ0FBb0MsbUJBQUksQ0FBQyxjQUFDLElBQUksc0JBQXNCLHFIQUFxSCxLQUFLLEdBQUcsb0JBQUssVUFBVSwrREFBK0QsbUJBQUksQ0FBQyxXQUFLLElBQUkscUxBQXFMLEdBQUcsb0JBQUssYUFBYSx1UEFBdVAsbUJBQUksYUFBYSx1Q0FBdUMsa0RBQWtELG1CQUFJLGFBQWEsK0JBQStCLHVCQUF1QixHQUFHLG9CQUFLLGFBQWEsOFFBQThRLG1CQUFJLGFBQWEscUNBQXFDLGdEQUFnRCxtQkFBSSxhQUFhLCtCQUErQix1QkFBdUIsR0FBRyxvQkFBSyxhQUFhLDRSQUE0UixtQkFBSSxhQUFhLHdDQUF3QyxrREFBa0QsbUJBQUksYUFBYSwrQkFBK0IsdUJBQXVCLEdBQUcsb0JBQUssYUFBYSwwUUFBMFEsbUJBQUksYUFBYSxtQ0FBbUMsK0NBQStDLG1CQUFJLGFBQWEsaUNBQWlDLHdCQUF3QixJQUFJLElBQUksR0FBRyxtQkFBSSxVQUFVLDBHQUEwRyxvQkFBSyxVQUFVLDJEQUEyRCxtQkFBSSxDQUFDLGFBQU0sSUFBSSwwQkFBMEIsbUJBQUksQ0FBQyxzQkFBUyxJQUFJLHNCQUFzQix1SEFBdUgsR0FBRyxtQkFBSSxDQUFDLGFBQU0sSUFBSSw0QkFBNEIsbUJBQUksQ0FBQyxxQkFBUSxJQUFJLHNCQUFzQixpSEFBaUgsSUFBSSxHQUFHLGFBQWEsbUJBQUksVUFBVSx3SEFBd0gsbUJBQUksUUFBUSxzRUFBc0UsR0FBRyxJQUFJLG1CQUFJLFVBQVUsbURBQW1ELG1CQUFJLENBQUMsdUNBQW1CLElBQUksd0tBQXdLLEdBQUcsSUFBSTtBQUMzME07QUFDQSxzRUFBZSxvQkFBb0IsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUNvbXBsaWFuY2VSZXBvcnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9jb21wbGlhbmNlL0NvbXBsaWFuY2VSZXBvcnRWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiLyoqXG4gKiBDb21wbGlhbmNlIFJlcG9ydCBMb2dpYyBIb29rXG4gKiBIYW5kbGVzIGNvbXBsaWFuY2UgZnJhbWV3b3JrIHJlcG9ydGluZyBhbmQgYXNzZXNzbWVudFxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlQ29tcGxpYW5jZVJlcG9ydExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgc2VsZWN0ZWRTb3VyY2VQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtmaWx0ZXJzLCBzZXRGaWx0ZXJzXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgZnJhbWV3b3JrOiAnJyxcbiAgICAgICAgc3RhdHVzOiAnJyxcbiAgICAgICAgcmlza0xldmVsOiAnJyxcbiAgICAgICAgb3duZXI6ICcnLFxuICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICB9KTtcbiAgICBjb25zdCBbc2VsZWN0ZWRJdGVtcywgc2V0U2VsZWN0ZWRJdGVtc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ29udHJvbCBJRCcsXG4gICAgICAgICAgICBmaWVsZDogJ2NvbnRyb2xJZCcsXG4gICAgICAgICAgICBwaW5uZWQ6ICdsZWZ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0ZyYW1ld29yaycsXG4gICAgICAgICAgICBmaWVsZDogJ2ZyYW1ld29yaycsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpdGxlJyxcbiAgICAgICAgICAgIGZpZWxkOiAndGl0bGUnLFxuICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBDb21wbGlhbnQ6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgZGFyazpiZy1ncmVlbi05MDAvMjAgZGFyazp0ZXh0LWdyZWVuLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIE5vbkNvbXBsaWFudDogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGRhcms6YmctcmVkLTkwMC8yMCBkYXJrOnRleHQtcmVkLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIFBhcnRpYWxseUNvbXBsaWFudDogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGRhcms6YmcteWVsbG93LTkwMC8yMCBkYXJrOnRleHQteWVsbG93LTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIE5vdEFzc2Vzc2VkOiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBkYXJrOmJnLWdyYXktOTAwLzIwIGRhcms6dGV4dC1ncmF5LTQwMCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yTWFwW3BhcmFtcy52YWx1ZV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInB4LTIgcHktMSByb3VuZGVkIHRleHQteHMgZm9udC1zZW1pYm9sZCAke2NvbG9yfVwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Jpc2sgTGV2ZWwnLFxuICAgICAgICAgICAgZmllbGQ6ICdyaXNrTGV2ZWwnLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBDcml0aWNhbDogJ3RleHQtcmVkLTYwMCcsXG4gICAgICAgICAgICAgICAgICAgIEhpZ2g6ICd0ZXh0LW9yYW5nZS02MDAnLFxuICAgICAgICAgICAgICAgICAgICBNZWRpdW06ICd0ZXh0LXllbGxvdy02MDAnLFxuICAgICAgICAgICAgICAgICAgICBMb3c6ICd0ZXh0LWdyZWVuLTYwMCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yTWFwW3BhcmFtcy52YWx1ZV0gfHwgJ3RleHQtZ3JheS02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHtwYXJhbXMudmFsdWV9PC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU2NvcmUnLFxuICAgICAgICAgICAgZmllbGQ6ICdzY29yZScsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICAgICAgdHlwZTogJ251bWVyaWNDb2x1bW4nLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSB2YWx1ZSA+PSA4MCA/ICd0ZXh0LWdyZWVuLTYwMCcgOiB2YWx1ZSA+PSA2MCA/ICd0ZXh0LXllbGxvdy02MDAnIDogJ3RleHQtcmVkLTYwMCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cIiR7Y29sb3J9IGZvbnQtc2VtaWJvbGRcIj4ke3ZhbHVlfSU8L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDYXRlZ29yeScsXG4gICAgICAgICAgICBmaWVsZDogJ2NhdGVnb3J5JyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnT3duZXInLFxuICAgICAgICAgICAgZmllbGQ6ICdvd25lcicsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0R1ZSBEYXRlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZHVlRGF0ZScsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgICAgIHdyYXBUZXh0OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRXZpZGVuY2UnLFxuICAgICAgICAgICAgZmllbGQ6ICdldmlkZW5jZScsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUmVtZWRpYXRpb24nLFxuICAgICAgICAgICAgZmllbGQ6ICdyZW1lZGlhdGlvbicsXG4gICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFsuLi5kYXRhXTtcbiAgICAgICAgaWYgKGZpbHRlcnMuZnJhbWV3b3JrKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5mcmFtZXdvcmsgPT09IGZpbHRlcnMuZnJhbWV3b3JrKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuc3RhdHVzKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5zdGF0dXMgPT09IGZpbHRlcnMuc3RhdHVzKTtcbiAgICAgICAgaWYgKGZpbHRlcnMucmlza0xldmVsKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5yaXNrTGV2ZWwgPT09IGZpbHRlcnMucmlza0xldmVsKTtcbiAgICAgICAgaWYgKGZpbHRlcnMub3duZXIpXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLm93bmVyPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMub3duZXIudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICBpZiAoZmlsdGVycy5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBmaWx0ZXJzLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0udGl0bGU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIGl0ZW0uY29udHJvbElkPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICBpdGVtLmRlc2NyaXB0aW9uPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGEsIGZpbHRlcnNdKTtcbiAgICBjb25zdCBmaWx0ZXJPcHRpb25zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZyYW1ld29ya3MgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLmZyYW1ld29yaykuZmlsdGVyKEJvb2xlYW4pKV0uc29ydCgpO1xuICAgICAgICBjb25zdCBzdGF0dXNlcyA9IFsuLi5uZXcgU2V0KChkYXRhID8/IFtdKS5tYXAoKGQpID0+IGQuc3RhdHVzKS5maWx0ZXIoQm9vbGVhbikpXS5zb3J0KCk7XG4gICAgICAgIGNvbnN0IHJpc2tMZXZlbHMgPSBbJ0NyaXRpY2FsJywgJ0hpZ2gnLCAnTWVkaXVtJywgJ0xvdyddO1xuICAgICAgICBjb25zdCBvd25lcnMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLm93bmVyKS5maWx0ZXIoQm9vbGVhbikpXS5zb3J0KCk7XG4gICAgICAgIHJldHVybiB7IGZyYW1ld29ya3MsIHN0YXR1c2VzLCByaXNrTGV2ZWxzLCBvd25lcnMgfTtcbiAgICB9LCBbZGF0YV0pO1xuICAgIGNvbnN0IGxvYWREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIHNvdXJjZSBwcm9maWxlIHNlbGVjdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9Db21wbGlhbmNlL0NvbXBsaWFuY2VSZXBvcnQucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LUNvbXBsaWFuY2VDb250cm9scycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBEb21haW46IHNlbGVjdGVkU291cmNlUHJvZmlsZS5kb21haW4sXG4gICAgICAgICAgICAgICAgICAgIENyZWRlbnRpYWw6IHNlbGVjdGVkU291cmNlUHJvZmlsZS5jcmVkZW50aWFsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczogeyB0aW1lb3V0OiAzMDAwMDAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXN1bHQuZGF0YS5jb250cm9scyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCBjb21wbGlhbmNlIGRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlXSk7XG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycygocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHZhbHVlIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgY2xlYXJGaWx0ZXJzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRGaWx0ZXJzKHsgZnJhbWV3b3JrOiAnJywgc3RhdHVzOiAnJywgcmlza0xldmVsOiAnJywgb3duZXI6ICcnLCBzZWFyY2hUZXh0OiAnJyB9KTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgZXhwb3J0RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKTtcbiAgICAgICAgcmV0dXJuIHsgZmlsZW5hbWU6IGBjb21wbGlhbmNlLXJlcG9ydC0ke3RpbWVzdGFtcH0uY3N2YCwgZGF0YTogZmlsdGVyZWREYXRhIH07XG4gICAgfSwgW2ZpbHRlcmVkRGF0YV0pO1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gZmlsdGVyZWREYXRhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgY29tcGxpYW50ID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5zdGF0dXMgPT09ICdDb21wbGlhbnQnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG5vbkNvbXBsaWFudCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQuc3RhdHVzID09PSAnTm9uQ29tcGxpYW50JykubGVuZ3RoO1xuICAgICAgICBjb25zdCBhdmdTY29yZSA9IHRvdGFsID4gMCA/IGZpbHRlcmVkRGF0YS5yZWR1Y2UoKHN1bSwgZCkgPT4gc3VtICsgZC5zY29yZSwgMCkgLyB0b3RhbCA6IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIGNvbXBsaWFudCxcbiAgICAgICAgICAgIG5vbkNvbXBsaWFudCxcbiAgICAgICAgICAgIGNvbXBsaWFuY2VSYXRlOiB0b3RhbCA+IDAgPyAoKGNvbXBsaWFudCAvIHRvdGFsKSAqIDEwMCkudG9GaXhlZCgxKSA6ICcwJyxcbiAgICAgICAgICAgIGF2Z1Njb3JlOiBhdmdTY29yZS50b0ZpeGVkKDEpLFxuICAgICAgICB9O1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRTb3VyY2VQcm9maWxlKVxuICAgICAgICAgICAgbG9hZERhdGEoKTtcbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBsb2FkRGF0YV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IGZpbHRlcmVkRGF0YSxcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgdXBkYXRlRmlsdGVyLFxuICAgICAgICBjbGVhckZpbHRlcnMsXG4gICAgICAgIHNlbGVjdGVkSXRlbXMsXG4gICAgICAgIHNldFNlbGVjdGVkSXRlbXMsXG4gICAgICAgIGxvYWREYXRhLFxuICAgICAgICBleHBvcnREYXRhLFxuICAgICAgICBzdGF0cyxcbiAgICAgICAgc2VsZWN0ZWRQcm9maWxlOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDb21wbGlhbmNlIFJlcG9ydCBWaWV3XG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDaGVja0NpcmNsZSwgUmVmcmVzaEN3LCBEb3dubG9hZCwgRmlsdGVyLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUNvbXBsaWFuY2VSZXBvcnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUNvbXBsaWFuY2VSZXBvcnRMb2dpYyc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQnO1xuY29uc3QgQ29tcGxpYW5jZVJlcG9ydFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBkYXRhLCBjb2x1bW5zLCBpc0xvYWRpbmcsIGVycm9yLCBmaWx0ZXJzLCBmaWx0ZXJPcHRpb25zLCB1cGRhdGVGaWx0ZXIsIGNsZWFyRmlsdGVycywgc2VsZWN0ZWRJdGVtcywgc2V0U2VsZWN0ZWRJdGVtcywgbG9hZERhdGEsIGV4cG9ydERhdGEsIHN0YXRzLCBzZWxlY3RlZFByb2ZpbGUsIH0gPSB1c2VDb21wbGlhbmNlUmVwb3J0TG9naWMoKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJjb21wbGlhbmNlLXJlcG9ydC12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjb21wbGlhbmNlLXJlcG9ydC12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNvbXBsaWFuY2UgUmVwb3J0XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTW9uaXRvciBjb21wbGlhbmNlIGFjcm9zcyBmcmFtZXdvcmtzXCIgfSldIH0pXSB9KSwgc2VsZWN0ZWRQcm9maWxlICYmIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlByb2ZpbGU6IFwiLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiBzZWxlY3RlZFByb2ZpbGUubmFtZSB9KV0gfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtNSBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJUb3RhbCBDb250cm9sc1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWJsdWUtOTAwIGRhcms6dGV4dC1ibHVlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LnRvdGFsID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNvbXBsaWFudFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTEwMFwiLCBjaGlsZHJlbjogW3N0YXRzPy5jb21wbGlhbnQgPz8gMCwgXCIgXCIsIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbXCIoXCIsIHN0YXRzPy5jb21wbGlhbmNlUmF0ZSA/PyAwLCBcIiUpXCJdIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIk5vbi1Db21wbGlhbnRcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ubm9uQ29tcGxpYW50ID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1wdXJwbGUtNTAgZGFyazpiZy1wdXJwbGUtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcHVycGxlLTYwMCBkYXJrOnRleHQtcHVycGxlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJBdmcgU2NvcmVcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcHVycGxlLTkwMCBkYXJrOnRleHQtcHVycGxlLTEwMFwiLCBjaGlsZHJlbjogW3N0YXRzPy5hdmdTY29yZSA/PyAwLCBcIiVcIl0gfSldIH0pXSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItM1wiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSwgKGZpbHRlcnMuZnJhbWV3b3JrIHx8IGZpbHRlcnMuc3RhdHVzIHx8IGZpbHRlcnMucmlza0xldmVsIHx8IGZpbHRlcnMub3duZXIgfHwgZmlsdGVycy5zZWFyY2hUZXh0KSAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBjbGVhckZpbHRlcnMsIFwiZGF0YS1jeVwiOiBcImNsZWFyLWZpbHRlcnMtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBjaGlsZHJlbjogXCJDbGVhciBBbGxcIiB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy01IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJTZWFyY2ggY29udHJvbHMuLi5cIiwgdmFsdWU6IGZpbHRlcnMuc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3NlYXJjaFRleHQnLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInNlYXJjaC1pbnB1dFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VhcmNoLWlucHV0XCIgfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IGZpbHRlcnMuZnJhbWV3b3JrIHx8ICcnLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpbHRlcignZnJhbWV3b3JrJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJmcmFtZXdvcmstc2VsZWN0XCIsIGNsYXNzTmFtZTogXCJweC0zIHB5LTIgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgdGV4dC1zbVwiLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgY2hpbGRyZW46IFwiQWxsIEZyYW1ld29ya3NcIiB9KSwgKGZpbHRlck9wdGlvbnM/LmZyYW1ld29ya3MgPz8gW10pLm1hcCgoZncpID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IGZ3IHx8ICcnLCBjaGlsZHJlbjogZncgfSwgZncgfHwgJ3Vua25vd24nKSkpXSB9KSwgX2pzeHMoXCJzZWxlY3RcIiwgeyB2YWx1ZTogZmlsdGVycy5zdGF0dXMgfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdzdGF0dXMnLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInN0YXR1cy1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXR1cy1zZWxlY3RcIiwgY2xhc3NOYW1lOiBcInB4LTMgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIlwiLCBjaGlsZHJlbjogXCJBbGwgU3RhdHVzZXNcIiB9KSwgKGZpbHRlck9wdGlvbnM/LnN0YXR1c2VzID8/IFtdKS5tYXAoKHN0KSA9PiAoX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBzdCB8fCAnJywgY2hpbGRyZW46IHN0IH0sIHN0IHx8ICd1bmtub3duJykpKV0gfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IGZpbHRlcnMucmlza0xldmVsIHx8ICcnLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpbHRlcigncmlza0xldmVsJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJyaXNrLWxldmVsLXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmlzay1sZXZlbC1zZWxlY3RcIiwgY2xhc3NOYW1lOiBcInB4LTMgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIlwiLCBjaGlsZHJlbjogXCJBbGwgUmlzayBMZXZlbHNcIiB9KSwgKGZpbHRlck9wdGlvbnM/LnJpc2tMZXZlbHMgPz8gW10pLm1hcCgocmwpID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IHJsIHx8ICcnLCBjaGlsZHJlbjogcmwgfSwgcmwgfHwgJ3Vua25vd24nKSkpXSB9KSwgX2pzeHMoXCJzZWxlY3RcIiwgeyB2YWx1ZTogZmlsdGVycy5vd25lciB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ293bmVyJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJvd25lci1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm93bmVyLXNlbGVjdFwiLCBjbGFzc05hbWU6IFwicHgtMyBweS0yIGJvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgcm91bmRlZC1tZCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwIHRleHQtc21cIiwgY2hpbGRyZW46IFtfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiXCIsIGNoaWxkcmVuOiBcIkFsbCBPd25lcnNcIiB9KSwgKGZpbHRlck9wdGlvbnM/Lm93bmVycyA/PyBbXSkubWFwKChvd24pID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IG93biB8fCAnJywgY2hpbGRyZW46IG93biB9LCBvd24gfHwgJ3Vua25vd24nKSkpXSB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktM1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGxvYWREYXRhLCBsb2FkaW5nOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLWJ0blwiLCBjaGlsZHJlbjogXCJSZWZyZXNoXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogZXhwb3J0RGF0YSwgZGlzYWJsZWQ6IChkYXRhPy5sZW5ndGggPz8gMCkgPT09IDAsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IFJlcG9ydFwiIH0pXSB9KSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXgtNiBtdC00IHAtNCBiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIGJvcmRlciBib3JkZXItcmVkLTIwMCBkYXJrOmJvcmRlci1yZWQtODAwIHJvdW5kZWQtbWRcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWhpZGRlbiBwLTZcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBkYXRhLCBjb2x1bW5zOiBjb2x1bW5zLCBsb2FkaW5nOiBpc0xvYWRpbmcsIGVuYWJsZVNlbGVjdGlvbjogdHJ1ZSwgc2VsZWN0aW9uTW9kZTogXCJtdWx0aXBsZVwiLCBvblNlbGVjdGlvbkNoYW5nZTogc2V0U2VsZWN0ZWRJdGVtcywgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSA1MDBweClcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENvbXBsaWFuY2VSZXBvcnRWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9