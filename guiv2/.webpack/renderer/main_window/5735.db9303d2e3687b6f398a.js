"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5735],{

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

/***/ 85735:
/*!************************************************************!*\
  !*** ./src/renderer/views/users/UsersView.tsx + 1 modules ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ users_UsersView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/index.js
var dist = __webpack_require__(84976);
// EXTERNAL MODULE: ./node_modules/react-dnd/dist/index.js + 44 modules
var react_dnd_dist = __webpack_require__(64074);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var dist_clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useUsersViewLogic.ts
/**
 * Users View Logic Hook
 * Manages state and logic for the Users view
 *
 * Replicates /gui/ UsersViewModel.cs pattern:
 * - Loads data from LogicEngine on mount
 * - Reloads when profile changes
 * - Auto-refreshes on file changes
 */


const useUsersViewLogic = () => {
    const [users, setUsers] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [selectedUsers, setSelectedUsers] = (0,react.useState)([]);
    const [error, setError] = (0,react.useState)(null);
    // Subscribe to selected source profile changes
    const selectedSourceProfile = (0,useProfileStore.useProfileStore)((state) => state.selectedSourceProfile);
    // Load users on mount and when profile changes
    (0,react.useEffect)(() => {
        loadUsers();
    }, [selectedSourceProfile]); // Reload when profile changes
    // Subscribe to file change events for auto-refresh
    (0,react.useEffect)(() => {
        const handleDataRefresh = (dataType) => {
            if ((dataType === 'Users' || dataType === 'All') && !isLoading) {
                console.log('[UsersView] Auto-refreshing due to file changes');
                loadUsers();
            }
        };
        // TODO: Subscribe to file watcher events when available
        // window.electronAPI.on('filewatcher:dataChanged', handleDataRefresh);
        return () => {
            // TODO: Cleanup subscription
            // window.electronAPI.off('filewatcher:dataChanged', handleDataRefresh);
        };
    }, [isLoading]);
    /**
     * Map UserDto from Logic Engine to UserData for the view
     */
    const mapUserDtoToUserData = (dto) => {
        // Determine source from DiscoveryModule
        let userSource = 'ActiveDirectory';
        const discoveryModule = dto.DiscoveryModule || '';
        if (discoveryModule.includes('Azure')) {
            userSource = 'AzureAD';
        }
        else if (discoveryModule.includes('ActiveDirectory') || discoveryModule.includes('AD')) {
            userSource = 'ActiveDirectory';
        }
        return {
            // Core UserData properties
            id: dto.UPN || dto.Sid,
            name: dto.DisplayName || dto.Sam || 'Unknown',
            displayName: dto.DisplayName || dto.Sam || null,
            userPrincipalName: dto.UPN || null,
            mail: dto.Mail || null,
            email: dto.Mail || null,
            accountEnabled: dto.Enabled !== undefined ? dto.Enabled : true,
            samAccountName: dto.Sam || null,
            department: dto.Dept || null,
            jobTitle: null, // Not available in UserDto
            officeLocation: null, // Not available in UserDto
            companyName: null,
            managerDisplayName: null,
            createdDateTime: dto.DiscoveryTimestamp || null,
            userSource,
            // Additional properties
            firstName: null,
            lastName: null,
            groups: dto.Groups?.join(', ') || null,
            manager: dto.Manager || null,
            status: dto.Enabled ? 'active' : 'disabled',
            // Required by TimestampMetadata interface
            createdAt: dto.DiscoveryTimestamp || new Date().toISOString(),
        };
    };
    /**
     * Load users from Logic Engine (CSV data)
     * Replicates /gui/ UsersViewModel.LoadAsync() pattern
     */
    const loadUsers = async (forceReload = false) => {
        setIsLoading(true);
        setError(null);
        try {
            console.log(`[UsersView] Loading users from LogicEngine...${forceReload ? ' (force reload)' : ''}`);
            // Force reload data from CSV if requested
            if (forceReload) {
                console.log('[UsersView] Forcing LogicEngine data reload...');
                const reloadResult = await window.electronAPI.invoke('logicEngine:forceReload');
                if (!reloadResult.success) {
                    throw new Error(reloadResult.error || 'Failed to reload LogicEngine data');
                }
                console.log('[UsersView] LogicEngine data reloaded successfully');
            }
            // Get users from Logic Engine
            const result = await window.electronAPI.invoke('logicEngine:getAllUsers');
            if (!result.success) {
                throw new Error(result.error || 'Failed to load users from LogicEngine');
            }
            if (!Array.isArray(result.data)) {
                throw new Error('Invalid response format from LogicEngine');
            }
            // Map UserDto[] to UserData[]
            const mappedUsers = result.data.map(mapUserDtoToUserData);
            setUsers(mappedUsers);
            setError(null);
            console.log(`[UsersView] Loaded ${mappedUsers.length} users from LogicEngine`);
        }
        catch (err) {
            console.error('[UsersView] Failed to load users:', err);
            setError(err instanceof Error ? err.message : 'Failed to load users from Logic Engine.');
            setUsers([]); // Set empty array instead of mock data
        }
        finally {
            setIsLoading(false);
        }
    };
    /**
     * Filter users based on search text
     */
    const filteredUsers = (0,react.useMemo)(() => {
        if (!searchText)
            return users;
        const search = searchText.toLowerCase();
        return users.filter((u) => u.displayName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search) ||
            u.department?.toLowerCase().includes(search) ||
            u.jobTitle?.toLowerCase().includes(search) ||
            u.userPrincipalName?.toLowerCase().includes(search));
    }, [users, searchText]);
    /**
     * Column definitions for AG Grid
     */
    const columnDefs = (0,react.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            minWidth: 150,
            checkboxSelection: true,
            headerCheckboxSelection: true,
        },
        {
            field: 'mail',
            headerName: 'Email',
            sortable: true,
            filter: true,
            minWidth: 200,
        },
        {
            field: 'department',
            headerName: 'Department',
            sortable: true,
            filter: true,
            minWidth: 120,
        },
        {
            field: 'jobTitle',
            headerName: 'Job Title',
            sortable: true,
            filter: true,
            minWidth: 150,
        },
        {
            field: 'officeLocation',
            headerName: 'Location',
            sortable: true,
            filter: true,
            minWidth: 120,
        },
        {
            field: 'accountEnabled',
            headerName: 'Status',
            sortable: true,
            filter: true,
            minWidth: 100,
            cellRenderer: (params) => params.value ? 'Enabled' : 'Disabled',
            cellStyle: (params) => ({
                color: params.value ? 'green' : 'red',
                fontWeight: 'bold'
            }),
        },
        {
            field: 'userSource',
            headerName: 'Source',
            sortable: true,
            filter: true,
            minWidth: 120,
        },
        {
            field: 'status',
            headerName: 'Account Status',
            sortable: true,
            filter: true,
            minWidth: 100,
        },
    ], []);
    /**
     * Handle export users to CSV/Excel
     */
    const handleExport = async () => {
        try {
            // Request file save location
            const filePath = await window.electronAPI.showSaveDialog({
                title: 'Export Users',
                defaultPath: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
                filters: [
                    { name: 'CSV Files', extensions: ['csv'] },
                    { name: 'Excel Files', extensions: ['xlsx'] },
                ],
            });
            if (!filePath)
                return;
            // Convert users to CSV
            const headers = ['Display Name', 'Email', 'Department', 'Job Title', 'Location', 'Status', 'Source', 'MFA'];
            const rows = filteredUsers.map((u) => [
                u.displayName,
                u.mail,
                u.department || '',
                u.jobTitle || '',
                u.officeLocation || '',
                u.accountEnabled ? 'Enabled' : 'Disabled',
                u.userSource || '',
                u.status || '',
            ]);
            const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
            // Write file
            await window.electronAPI.writeFile(filePath, csv);
            console.log(`Exported ${filteredUsers.length} users to ${filePath}`);
        }
        catch (err) {
            console.error('Export failed:', err);
            setError('Failed to export users. Please try again.');
        }
    };
    /**
     * Handle delete selected users
     * Note: For CSV-based discovery data, this removes items from local state only.
     * Data will reload from CSV files on next refresh.
     */
    const handleDelete = async () => {
        if (!selectedUsers.length)
            return;
        const confirmed = window.confirm(`Are you sure you want to remove ${selectedUsers.length} user(s) from the view?\n\nNote: This removes items from the current view only. Data will reload from CSV files on next refresh.`);
        if (!confirmed)
            return;
        try {
            // Get IDs of users to remove
            const idsToRemove = new Set(selectedUsers.map((u) => u.id));
            // Remove from local state
            setUsers((prevUsers) => prevUsers.filter((u) => !idsToRemove.has(u.id)));
            setSelectedUsers([]);
            console.log(`[UsersView] Removed ${selectedUsers.length} users from view`);
        }
        catch (err) {
            console.error('[UsersView] Delete failed:', err);
            setError('Failed to remove users from view. Please try again.');
        }
    };
    /**
     * Handle add new user
     * Opens CreateUserDialog modal
     */
    const handleAddUser = () => {
        console.log('[UsersView] Opening add user dialog...');
        // Dynamically import and render CreateUserDialog
        __webpack_require__.e(/*! import() */ 310).then(__webpack_require__.bind(__webpack_require__, /*! ../components/dialogs/CreateUserDialog */ 10310)).then(({ CreateUserDialog }) => {
            const { openModal, updateModal } = (__webpack_require__(/*! ../store/useModalStore */ 23361).useModalStore).getState();
            const modalId = openModal({
                type: 'custom',
                title: 'Create New User',
                component: CreateUserDialog,
                props: {
                    modalId: '', // Will be updated below
                    onUserCreated: (user) => {
                        console.log('[UsersView] User created, reloading users...', user);
                        loadUsers(); // Reload users after creation
                    },
                },
                dismissable: true,
                size: 'lg',
            });
            // Update modal props with actual modalId
            updateModal(modalId, {
                props: {
                    modalId,
                    onUserCreated: (user) => {
                        console.log('[UsersView] User created, reloading users...', user);
                        loadUsers();
                    },
                },
            });
        });
    };
    /**
     * Handle refresh button click
     * Forces reload of data from CSV files
     */
    const handleRefresh = () => {
        console.log('[UsersView] Refresh button clicked, forcing data reload');
        loadUsers(true); // Pass true to force reload
    };
    return {
        // State
        users: filteredUsers,
        allUsers: users,
        isLoading,
        searchText,
        selectedUsers,
        error,
        // Actions
        setSearchText,
        setSelectedUsers,
        loadUsers,
        handleRefresh,
        handleExport,
        handleDelete,
        handleAddUser,
        // Grid config
        columnDefs,
    };
};

;// ./src/renderer/views/users/UsersView.tsx

/**
 * UsersView Component
 *
 * User management view with data grid and actions
 */









/**
 * Draggable cell component for drag handle
 */
const DragHandleCell = ({ data }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'USER',
        item: () => ({
            id: data.userPrincipalName || data.id || data.email || '',
            type: 'USER',
            data: data,
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    return (_jsx("div", { ref: drag, className: clsx('flex items-center justify-center cursor-move h-full', isDragging && 'opacity-50'), title: "Drag to add to migration wave", "data-cy": "user-drag-handle", "data-testid": "user-drag-handle", children: _jsx(GripVertical, { size: 16, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" }) }));
};
/**
 * Users management view
 */
const UsersView = () => {
    const navigate = (0,dist.useNavigate)();
    // Use the users view logic hook (loads data from Logic Engine CSV)
    const { users, isLoading, searchText, setSearchText, selectedUsers, setSelectedUsers, loadUsers, handleExport, handleDelete, handleAddUser, error, columnDefs, } = useUsersViewLogic();
    // Handle view details
    const handleViewDetails = (0,react.useCallback)((user) => {
        const userId = user.userPrincipalName || user.id || user.email || '';
        // Navigate to user detail view
        navigate(`/users/${encodeURIComponent(userId)}`);
    }, [navigate]);
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col p-6", "data-cy": "users-view", "data-testid": "users-view", children: [(0,jsx_runtime.jsxs)("div", { className: "mb-6", children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Users" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mt-1", children: "Manage user accounts across Active Directory and Azure AD" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)(Input.Input, { placeholder: "Search users...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "w-64", "data-cy": "user-search", "data-testid": "user-search" }), (0,jsx_runtime.jsxs)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [(users ?? []).length, " users"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { onClick: loadUsers, variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { size: 18 }), loading: isLoading, "data-cy": "refresh-users", "data-testid": "refresh-users", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleAddUser, variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.UserPlus, { size: 18 }), "data-cy": "add-user", "data-testid": "add-user", children: "Add User" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExport, variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { size: 18 }), "data-cy": "export-users", "data-testid": "export-users", children: "Export" }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: handleDelete, variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react.Trash, { size: 18 }), disabled: selectedUsers.length === 0, "data-cy": "delete-users", "data-testid": "delete-users", children: ["Delete (", selectedUsers.length, ")"] })] })] }), error && ((0,jsx_runtime.jsx)("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400", role: "alert", children: error })), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: users, columns: columnDefs, loading: isLoading, onSelectionChange: setSelectedUsers, enablePrint: true, height: "calc(100vh - 320px)" }) })] }));
};
/* harmony default export */ const users_UsersView = (UsersView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0EscUJBQXFCLG9CQUFXO0FBQ2hDO0FBQ0EsWUFBWSx5SkFBeUosRUFBRSxpQkFBaUI7QUFDeEw7QUFDQSw4QkFBOEIscUJBQVc7QUFDekM7QUFDQTtBQUNBLDJCQUEyQiwyQkFBMkI7QUFDdEQsS0FBSztBQUNMLFlBQVksb0JBQUssVUFBVSx3R0FBd0csb0JBQUssVUFBVSw4QkFBOEIsbUJBQUksU0FBUyxrRkFBa0YsR0FBRyxtQkFBSSxRQUFRLDJIQUEySCxJQUFJLEdBQUcsb0JBQUssVUFBVSxnRUFBZ0Usb0JBQUssVUFBVSxpREFBaUQsbUJBQUksQ0FBQyxXQUFLLElBQUksOEtBQThLLEdBQUcsb0JBQUssV0FBVyxtR0FBbUcsSUFBSSxHQUFHLG9CQUFLLFVBQVUsaURBQWlELG1CQUFJLENBQUMsYUFBTSxJQUFJLGdEQUFnRCxtQkFBSSxDQUFDLHNCQUFTLElBQUksVUFBVSx3R0FBd0csR0FBRyxtQkFBSSxDQUFDLGFBQU0sSUFBSSxrREFBa0QsbUJBQUksQ0FBQyxxQkFBUSxJQUFJLFVBQVUsMkVBQTJFLEdBQUcsbUJBQUksQ0FBQyxhQUFNLElBQUksbURBQW1ELG1CQUFJLENBQUMscUJBQVEsSUFBSSxVQUFVLGlGQUFpRixHQUFHLG9CQUFLLENBQUMsYUFBTSxJQUFJLGdEQUFnRCxtQkFBSSxDQUFDLGtCQUFLLElBQUksVUFBVSxzSkFBc0osSUFBSSxJQUFJLGFBQWEsbUJBQUksVUFBVSx3S0FBd0ssSUFBSSxtQkFBSSxVQUFVLCtCQUErQixtQkFBSSxDQUFDLHVDQUFtQixJQUFJLDZJQUE2SSxHQUFHLElBQUk7QUFDbm1FO0FBQ0Esc0RBQWUsU0FBUyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlVXNlcnNWaWV3TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvdXNlcnMvVXNlcnNWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiLyoqXG4gKiBVc2VycyBWaWV3IExvZ2ljIEhvb2tcbiAqIE1hbmFnZXMgc3RhdGUgYW5kIGxvZ2ljIGZvciB0aGUgVXNlcnMgdmlld1xuICpcbiAqIFJlcGxpY2F0ZXMgL2d1aS8gVXNlcnNWaWV3TW9kZWwuY3MgcGF0dGVybjpcbiAqIC0gTG9hZHMgZGF0YSBmcm9tIExvZ2ljRW5naW5lIG9uIG1vdW50XG4gKiAtIFJlbG9hZHMgd2hlbiBwcm9maWxlIGNoYW5nZXNcbiAqIC0gQXV0by1yZWZyZXNoZXMgb24gZmlsZSBjaGFuZ2VzXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuZXhwb3J0IGNvbnN0IHVzZVVzZXJzVmlld0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFt1c2Vycywgc2V0VXNlcnNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtzZWxlY3RlZFVzZXJzLCBzZXRTZWxlY3RlZFVzZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIFN1YnNjcmliZSB0byBzZWxlY3RlZCBzb3VyY2UgcHJvZmlsZSBjaGFuZ2VzXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICAvLyBMb2FkIHVzZXJzIG9uIG1vdW50IGFuZCB3aGVuIHByb2ZpbGUgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRVc2VycygpO1xuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGVdKTsgLy8gUmVsb2FkIHdoZW4gcHJvZmlsZSBjaGFuZ2VzXG4gICAgLy8gU3Vic2NyaWJlIHRvIGZpbGUgY2hhbmdlIGV2ZW50cyBmb3IgYXV0by1yZWZyZXNoXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlRGF0YVJlZnJlc2ggPSAoZGF0YVR5cGUpID0+IHtcbiAgICAgICAgICAgIGlmICgoZGF0YVR5cGUgPT09ICdVc2VycycgfHwgZGF0YVR5cGUgPT09ICdBbGwnKSAmJiAhaXNMb2FkaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tVc2Vyc1ZpZXddIEF1dG8tcmVmcmVzaGluZyBkdWUgdG8gZmlsZSBjaGFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgbG9hZFVzZXJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IFN1YnNjcmliZSB0byBmaWxlIHdhdGNoZXIgZXZlbnRzIHdoZW4gYXZhaWxhYmxlXG4gICAgICAgIC8vIHdpbmRvdy5lbGVjdHJvbkFQSS5vbignZmlsZXdhdGNoZXI6ZGF0YUNoYW5nZWQnLCBoYW5kbGVEYXRhUmVmcmVzaCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPOiBDbGVhbnVwIHN1YnNjcmlwdGlvblxuICAgICAgICAgICAgLy8gd2luZG93LmVsZWN0cm9uQVBJLm9mZignZmlsZXdhdGNoZXI6ZGF0YUNoYW5nZWQnLCBoYW5kbGVEYXRhUmVmcmVzaCk7XG4gICAgICAgIH07XG4gICAgfSwgW2lzTG9hZGluZ10pO1xuICAgIC8qKlxuICAgICAqIE1hcCBVc2VyRHRvIGZyb20gTG9naWMgRW5naW5lIHRvIFVzZXJEYXRhIGZvciB0aGUgdmlld1xuICAgICAqL1xuICAgIGNvbnN0IG1hcFVzZXJEdG9Ub1VzZXJEYXRhID0gKGR0bykgPT4ge1xuICAgICAgICAvLyBEZXRlcm1pbmUgc291cmNlIGZyb20gRGlzY292ZXJ5TW9kdWxlXG4gICAgICAgIGxldCB1c2VyU291cmNlID0gJ0FjdGl2ZURpcmVjdG9yeSc7XG4gICAgICAgIGNvbnN0IGRpc2NvdmVyeU1vZHVsZSA9IGR0by5EaXNjb3ZlcnlNb2R1bGUgfHwgJyc7XG4gICAgICAgIGlmIChkaXNjb3ZlcnlNb2R1bGUuaW5jbHVkZXMoJ0F6dXJlJykpIHtcbiAgICAgICAgICAgIHVzZXJTb3VyY2UgPSAnQXp1cmVBRCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlzY292ZXJ5TW9kdWxlLmluY2x1ZGVzKCdBY3RpdmVEaXJlY3RvcnknKSB8fCBkaXNjb3ZlcnlNb2R1bGUuaW5jbHVkZXMoJ0FEJykpIHtcbiAgICAgICAgICAgIHVzZXJTb3VyY2UgPSAnQWN0aXZlRGlyZWN0b3J5JztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gQ29yZSBVc2VyRGF0YSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBpZDogZHRvLlVQTiB8fCBkdG8uU2lkLFxuICAgICAgICAgICAgbmFtZTogZHRvLkRpc3BsYXlOYW1lIHx8IGR0by5TYW0gfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGR0by5EaXNwbGF5TmFtZSB8fCBkdG8uU2FtIHx8IG51bGwsXG4gICAgICAgICAgICB1c2VyUHJpbmNpcGFsTmFtZTogZHRvLlVQTiB8fCBudWxsLFxuICAgICAgICAgICAgbWFpbDogZHRvLk1haWwgfHwgbnVsbCxcbiAgICAgICAgICAgIGVtYWlsOiBkdG8uTWFpbCB8fCBudWxsLFxuICAgICAgICAgICAgYWNjb3VudEVuYWJsZWQ6IGR0by5FbmFibGVkICE9PSB1bmRlZmluZWQgPyBkdG8uRW5hYmxlZCA6IHRydWUsXG4gICAgICAgICAgICBzYW1BY2NvdW50TmFtZTogZHRvLlNhbSB8fCBudWxsLFxuICAgICAgICAgICAgZGVwYXJ0bWVudDogZHRvLkRlcHQgfHwgbnVsbCxcbiAgICAgICAgICAgIGpvYlRpdGxlOiBudWxsLCAvLyBOb3QgYXZhaWxhYmxlIGluIFVzZXJEdG9cbiAgICAgICAgICAgIG9mZmljZUxvY2F0aW9uOiBudWxsLCAvLyBOb3QgYXZhaWxhYmxlIGluIFVzZXJEdG9cbiAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBudWxsLFxuICAgICAgICAgICAgbWFuYWdlckRpc3BsYXlOYW1lOiBudWxsLFxuICAgICAgICAgICAgY3JlYXRlZERhdGVUaW1lOiBkdG8uRGlzY292ZXJ5VGltZXN0YW1wIHx8IG51bGwsXG4gICAgICAgICAgICB1c2VyU291cmNlLFxuICAgICAgICAgICAgLy8gQWRkaXRpb25hbCBwcm9wZXJ0aWVzXG4gICAgICAgICAgICBmaXJzdE5hbWU6IG51bGwsXG4gICAgICAgICAgICBsYXN0TmFtZTogbnVsbCxcbiAgICAgICAgICAgIGdyb3VwczogZHRvLkdyb3Vwcz8uam9pbignLCAnKSB8fCBudWxsLFxuICAgICAgICAgICAgbWFuYWdlcjogZHRvLk1hbmFnZXIgfHwgbnVsbCxcbiAgICAgICAgICAgIHN0YXR1czogZHRvLkVuYWJsZWQgPyAnYWN0aXZlJyA6ICdkaXNhYmxlZCcsXG4gICAgICAgICAgICAvLyBSZXF1aXJlZCBieSBUaW1lc3RhbXBNZXRhZGF0YSBpbnRlcmZhY2VcbiAgICAgICAgICAgIGNyZWF0ZWRBdDogZHRvLkRpc2NvdmVyeVRpbWVzdGFtcCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb2FkIHVzZXJzIGZyb20gTG9naWMgRW5naW5lIChDU1YgZGF0YSlcbiAgICAgKiBSZXBsaWNhdGVzIC9ndWkvIFVzZXJzVmlld01vZGVsLkxvYWRBc3luYygpIHBhdHRlcm5cbiAgICAgKi9cbiAgICBjb25zdCBsb2FkVXNlcnMgPSBhc3luYyAoZm9yY2VSZWxvYWQgPSBmYWxzZSkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtVc2Vyc1ZpZXddIExvYWRpbmcgdXNlcnMgZnJvbSBMb2dpY0VuZ2luZS4uLiR7Zm9yY2VSZWxvYWQgPyAnIChmb3JjZSByZWxvYWQpJyA6ICcnfWApO1xuICAgICAgICAgICAgLy8gRm9yY2UgcmVsb2FkIGRhdGEgZnJvbSBDU1YgaWYgcmVxdWVzdGVkXG4gICAgICAgICAgICBpZiAoZm9yY2VSZWxvYWQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1VzZXJzVmlld10gRm9yY2luZyBMb2dpY0VuZ2luZSBkYXRhIHJlbG9hZC4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZFJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5pbnZva2UoJ2xvZ2ljRW5naW5lOmZvcmNlUmVsb2FkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWxvYWRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVsb2FkUmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gcmVsb2FkIExvZ2ljRW5naW5lIGRhdGEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tVc2Vyc1ZpZXddIExvZ2ljRW5naW5lIGRhdGEgcmVsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZXQgdXNlcnMgZnJvbSBMb2dpYyBFbmdpbmVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5pbnZva2UoJ2xvZ2ljRW5naW5lOmdldEFsbFVzZXJzJyk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgdXNlcnMgZnJvbSBMb2dpY0VuZ2luZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZXNwb25zZSBmb3JtYXQgZnJvbSBMb2dpY0VuZ2luZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFwIFVzZXJEdG9bXSB0byBVc2VyRGF0YVtdXG4gICAgICAgICAgICBjb25zdCBtYXBwZWRVc2VycyA9IHJlc3VsdC5kYXRhLm1hcChtYXBVc2VyRHRvVG9Vc2VyRGF0YSk7XG4gICAgICAgICAgICBzZXRVc2VycyhtYXBwZWRVc2Vycyk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbVXNlcnNWaWV3XSBMb2FkZWQgJHttYXBwZWRVc2Vycy5sZW5ndGh9IHVzZXJzIGZyb20gTG9naWNFbmdpbmVgKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVXNlcnNWaWV3XSBGYWlsZWQgdG8gbG9hZCB1c2VyczonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdGYWlsZWQgdG8gbG9hZCB1c2VycyBmcm9tIExvZ2ljIEVuZ2luZS4nKTtcbiAgICAgICAgICAgIHNldFVzZXJzKFtdKTsgLy8gU2V0IGVtcHR5IGFycmF5IGluc3RlYWQgb2YgbW9jayBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGaWx0ZXIgdXNlcnMgYmFzZWQgb24gc2VhcmNoIHRleHRcbiAgICAgKi9cbiAgICBjb25zdCBmaWx0ZXJlZFVzZXJzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc2VhcmNoVGV4dClcbiAgICAgICAgICAgIHJldHVybiB1c2VycztcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gdXNlcnMuZmlsdGVyKCh1KSA9PiB1LmRpc3BsYXlOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIHUuZW1haWw/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgdS5kZXBhcnRtZW50Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIHUuam9iVGl0bGU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgdS51c2VyUHJpbmNpcGFsTmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICB9LCBbdXNlcnMsIHNlYXJjaFRleHRdKTtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgZm9yIEFHIEdyaWRcbiAgICAgKi9cbiAgICBjb25zdCBjb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzcGxheU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rpc3BsYXkgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAxNTAsXG4gICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ21haWwnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgbWluV2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkZXBhcnRtZW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXBhcnRtZW50JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgbWluV2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdqb2JUaXRsZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSm9iIFRpdGxlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgbWluV2lkdGg6IDE1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdvZmZpY2VMb2NhdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTG9jYXRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FjY291bnRFbmFibGVkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnLFxuICAgICAgICAgICAgY2VsbFN0eWxlOiAocGFyYW1zKSA9PiAoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiBwYXJhbXMudmFsdWUgPyAnZ3JlZW4nIDogJ3JlZCcsXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJ2JvbGQnXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd1c2VyU291cmNlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTb3VyY2UnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N0YXR1cycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWNjb3VudCBTdGF0dXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBIYW5kbGUgZXhwb3J0IHVzZXJzIHRvIENTVi9FeGNlbFxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJlcXVlc3QgZmlsZSBzYXZlIGxvY2F0aW9uXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5zaG93U2F2ZURpYWxvZyh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFeHBvcnQgVXNlcnMnLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBgdXNlcnMtZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19LmNzdmAsXG4gICAgICAgICAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdDU1YgRmlsZXMnLCBleHRlbnNpb25zOiBbJ2NzdiddIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0V4Y2VsIEZpbGVzJywgZXh0ZW5zaW9uczogWyd4bHN4J10gfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIWZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdXNlcnMgdG8gQ1NWXG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWydEaXNwbGF5IE5hbWUnLCAnRW1haWwnLCAnRGVwYXJ0bWVudCcsICdKb2IgVGl0bGUnLCAnTG9jYXRpb24nLCAnU3RhdHVzJywgJ1NvdXJjZScsICdNRkEnXTtcbiAgICAgICAgICAgIGNvbnN0IHJvd3MgPSBmaWx0ZXJlZFVzZXJzLm1hcCgodSkgPT4gW1xuICAgICAgICAgICAgICAgIHUuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgdS5tYWlsLFxuICAgICAgICAgICAgICAgIHUuZGVwYXJ0bWVudCB8fCAnJyxcbiAgICAgICAgICAgICAgICB1LmpvYlRpdGxlIHx8ICcnLFxuICAgICAgICAgICAgICAgIHUub2ZmaWNlTG9jYXRpb24gfHwgJycsXG4gICAgICAgICAgICAgICAgdS5hY2NvdW50RW5hYmxlZCA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCcsXG4gICAgICAgICAgICAgICAgdS51c2VyU291cmNlIHx8ICcnLFxuICAgICAgICAgICAgICAgIHUuc3RhdHVzIHx8ICcnLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb25zdCBjc3YgPSBbaGVhZGVycywgLi4ucm93c10ubWFwKChyb3cpID0+IHJvdy5tYXAoKGNlbGwpID0+IGBcIiR7Y2VsbH1cImApLmpvaW4oJywnKSkuam9pbignXFxuJyk7XG4gICAgICAgICAgICAvLyBXcml0ZSBmaWxlXG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkud3JpdGVGaWxlKGZpbGVQYXRoLCBjc3YpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEV4cG9ydGVkICR7ZmlsdGVyZWRVc2Vycy5sZW5ndGh9IHVzZXJzIHRvICR7ZmlsZVBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwb3J0IGZhaWxlZDonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBleHBvcnQgdXNlcnMuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEhhbmRsZSBkZWxldGUgc2VsZWN0ZWQgdXNlcnNcbiAgICAgKiBOb3RlOiBGb3IgQ1NWLWJhc2VkIGRpc2NvdmVyeSBkYXRhLCB0aGlzIHJlbW92ZXMgaXRlbXMgZnJvbSBsb2NhbCBzdGF0ZSBvbmx5LlxuICAgICAqIERhdGEgd2lsbCByZWxvYWQgZnJvbSBDU1YgZmlsZXMgb24gbmV4dCByZWZyZXNoLlxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZURlbGV0ZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFVzZXJzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgY29uZmlybWVkID0gd2luZG93LmNvbmZpcm0oYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgJHtzZWxlY3RlZFVzZXJzLmxlbmd0aH0gdXNlcihzKSBmcm9tIHRoZSB2aWV3P1xcblxcbk5vdGU6IFRoaXMgcmVtb3ZlcyBpdGVtcyBmcm9tIHRoZSBjdXJyZW50IHZpZXcgb25seS4gRGF0YSB3aWxsIHJlbG9hZCBmcm9tIENTViBmaWxlcyBvbiBuZXh0IHJlZnJlc2guYCk7XG4gICAgICAgIGlmICghY29uZmlybWVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR2V0IElEcyBvZiB1c2VycyB0byByZW1vdmVcbiAgICAgICAgICAgIGNvbnN0IGlkc1RvUmVtb3ZlID0gbmV3IFNldChzZWxlY3RlZFVzZXJzLm1hcCgodSkgPT4gdS5pZCkpO1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gbG9jYWwgc3RhdGVcbiAgICAgICAgICAgIHNldFVzZXJzKChwcmV2VXNlcnMpID0+IHByZXZVc2Vycy5maWx0ZXIoKHUpID0+ICFpZHNUb1JlbW92ZS5oYXModS5pZCkpKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkVXNlcnMoW10pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtVc2Vyc1ZpZXddIFJlbW92ZWQgJHtzZWxlY3RlZFVzZXJzLmxlbmd0aH0gdXNlcnMgZnJvbSB2aWV3YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1VzZXJzVmlld10gRGVsZXRlIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byByZW1vdmUgdXNlcnMgZnJvbSB2aWV3LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBIYW5kbGUgYWRkIG5ldyB1c2VyXG4gICAgICogT3BlbnMgQ3JlYXRlVXNlckRpYWxvZyBtb2RhbFxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZUFkZFVzZXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVXNlcnNWaWV3XSBPcGVuaW5nIGFkZCB1c2VyIGRpYWxvZy4uLicpO1xuICAgICAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgYW5kIHJlbmRlciBDcmVhdGVVc2VyRGlhbG9nXG4gICAgICAgIGltcG9ydCgnLi4vY29tcG9uZW50cy9kaWFsb2dzL0NyZWF0ZVVzZXJEaWFsb2cnKS50aGVuKCh7IENyZWF0ZVVzZXJEaWFsb2cgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBvcGVuTW9kYWwsIHVwZGF0ZU1vZGFsIH0gPSByZXF1aXJlKCcuLi9zdG9yZS91c2VNb2RhbFN0b3JlJykudXNlTW9kYWxTdG9yZS5nZXRTdGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgbW9kYWxJZCA9IG9wZW5Nb2RhbCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2N1c3RvbScsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdDcmVhdGUgTmV3IFVzZXInLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudDogQ3JlYXRlVXNlckRpYWxvZyxcbiAgICAgICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbElkOiAnJywgLy8gV2lsbCBiZSB1cGRhdGVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIG9uVXNlckNyZWF0ZWQ6ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1VzZXJzVmlld10gVXNlciBjcmVhdGVkLCByZWxvYWRpbmcgdXNlcnMuLi4nLCB1c2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRVc2VycygpOyAvLyBSZWxvYWQgdXNlcnMgYWZ0ZXIgY3JlYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNpemU6ICdsZycsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBtb2RhbCBwcm9wcyB3aXRoIGFjdHVhbCBtb2RhbElkXG4gICAgICAgICAgICB1cGRhdGVNb2RhbChtb2RhbElkLCB7XG4gICAgICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyQ3JlYXRlZDogKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVXNlcnNWaWV3XSBVc2VyIGNyZWF0ZWQsIHJlbG9hZGluZyB1c2Vycy4uLicsIHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFVzZXJzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEhhbmRsZSByZWZyZXNoIGJ1dHRvbiBjbGlja1xuICAgICAqIEZvcmNlcyByZWxvYWQgb2YgZGF0YSBmcm9tIENTViBmaWxlc1xuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVXNlcnNWaWV3XSBSZWZyZXNoIGJ1dHRvbiBjbGlja2VkLCBmb3JjaW5nIGRhdGEgcmVsb2FkJyk7XG4gICAgICAgIGxvYWRVc2Vycyh0cnVlKTsgLy8gUGFzcyB0cnVlIHRvIGZvcmNlIHJlbG9hZFxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgdXNlcnM6IGZpbHRlcmVkVXNlcnMsXG4gICAgICAgIGFsbFVzZXJzOiB1c2VycyxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBzZWFyY2hUZXh0LFxuICAgICAgICBzZWxlY3RlZFVzZXJzLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgICAgICBzZXRTZWxlY3RlZFVzZXJzLFxuICAgICAgICBsb2FkVXNlcnMsXG4gICAgICAgIGhhbmRsZVJlZnJlc2gsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgaGFuZGxlRGVsZXRlLFxuICAgICAgICBoYW5kbGVBZGRVc2VyLFxuICAgICAgICAvLyBHcmlkIGNvbmZpZ1xuICAgICAgICBjb2x1bW5EZWZzLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVXNlcnNWaWV3IENvbXBvbmVudFxuICpcbiAqIFVzZXIgbWFuYWdlbWVudCB2aWV3IHdpdGggZGF0YSBncmlkIGFuZCBhY3Rpb25zXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyB1c2VEcmFnIH0gZnJvbSAncmVhY3QtZG5kJztcbmltcG9ydCB7IERvd25sb2FkLCBUcmFzaCwgVXNlclBsdXMsIFJlZnJlc2hDdywgR3JpcFZlcnRpY2FsIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyB1c2VVc2Vyc1ZpZXdMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVVzZXJzVmlld0xvZ2ljJztcbi8qKlxuICogRHJhZ2dhYmxlIGNlbGwgY29tcG9uZW50IGZvciBkcmFnIGhhbmRsZVxuICovXG5jb25zdCBEcmFnSGFuZGxlQ2VsbCA9ICh7IGRhdGEgfSkgPT4ge1xuICAgIGNvbnN0IFt7IGlzRHJhZ2dpbmcgfSwgZHJhZ10gPSB1c2VEcmFnKHtcbiAgICAgICAgdHlwZTogJ1VTRVInLFxuICAgICAgICBpdGVtOiAoKSA9PiAoe1xuICAgICAgICAgICAgaWQ6IGRhdGEudXNlclByaW5jaXBhbE5hbWUgfHwgZGF0YS5pZCB8fCBkYXRhLmVtYWlsIHx8ICcnLFxuICAgICAgICAgICAgdHlwZTogJ1VTRVInLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbGxlY3Q6IChtb25pdG9yKSA9PiAoe1xuICAgICAgICAgICAgaXNEcmFnZ2luZzogbW9uaXRvci5pc0RyYWdnaW5nKCksXG4gICAgICAgIH0pLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IHJlZjogZHJhZywgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItbW92ZSBoLWZ1bGwnLCBpc0RyYWdnaW5nICYmICdvcGFjaXR5LTUwJyksIHRpdGxlOiBcIkRyYWcgdG8gYWRkIHRvIG1pZ3JhdGlvbiB3YXZlXCIsIFwiZGF0YS1jeVwiOiBcInVzZXItZHJhZy1oYW5kbGVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInVzZXItZHJhZy1oYW5kbGVcIiwgY2hpbGRyZW46IF9qc3goR3JpcFZlcnRpY2FsLCB7IHNpemU6IDE2LCBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwIGRhcms6aG92ZXI6dGV4dC1ncmF5LTMwMFwiIH0pIH0pKTtcbn07XG4vKipcbiAqIFVzZXJzIG1hbmFnZW1lbnQgdmlld1xuICovXG5jb25zdCBVc2Vyc1ZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICAgIC8vIFVzZSB0aGUgdXNlcnMgdmlldyBsb2dpYyBob29rIChsb2FkcyBkYXRhIGZyb20gTG9naWMgRW5naW5lIENTVilcbiAgICBjb25zdCB7IHVzZXJzLCBpc0xvYWRpbmcsIHNlYXJjaFRleHQsIHNldFNlYXJjaFRleHQsIHNlbGVjdGVkVXNlcnMsIHNldFNlbGVjdGVkVXNlcnMsIGxvYWRVc2VycywgaGFuZGxlRXhwb3J0LCBoYW5kbGVEZWxldGUsIGhhbmRsZUFkZFVzZXIsIGVycm9yLCBjb2x1bW5EZWZzLCB9ID0gdXNlVXNlcnNWaWV3TG9naWMoKTtcbiAgICAvLyBIYW5kbGUgdmlldyBkZXRhaWxzXG4gICAgY29uc3QgaGFuZGxlVmlld0RldGFpbHMgPSB1c2VDYWxsYmFjaygodXNlcikgPT4ge1xuICAgICAgICBjb25zdCB1c2VySWQgPSB1c2VyLnVzZXJQcmluY2lwYWxOYW1lIHx8IHVzZXIuaWQgfHwgdXNlci5lbWFpbCB8fCAnJztcbiAgICAgICAgLy8gTmF2aWdhdGUgdG8gdXNlciBkZXRhaWwgdmlld1xuICAgICAgICBuYXZpZ2F0ZShgL3VzZXJzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KHVzZXJJZCl9YCk7XG4gICAgfSwgW25hdmlnYXRlXSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBwLTZcIiwgXCJkYXRhLWN5XCI6IFwidXNlcnMtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwidXNlcnMtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIlVzZXJzXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFwiTWFuYWdlIHVzZXIgYWNjb3VudHMgYWNyb3NzIEFjdGl2ZSBEaXJlY3RvcnkgYW5kIEF6dXJlIEFEXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJTZWFyY2ggdXNlcnMuLi5cIiwgdmFsdWU6IHNlYXJjaFRleHQsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VhcmNoVGV4dChlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJ3LTY0XCIsIFwiZGF0YS1jeVwiOiBcInVzZXItc2VhcmNoXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ1c2VyLXNlYXJjaFwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogWyh1c2VycyA/PyBbXSkubGVuZ3RoLCBcIiB1c2Vyc1wiXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgb25DbGljazogbG9hZFVzZXJzLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBzaXplOiAxOCB9KSwgbG9hZGluZzogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLXVzZXJzXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlQWRkVXNlciwgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goVXNlclBsdXMsIHsgc2l6ZTogMTggfSksIFwiZGF0YS1jeVwiOiBcImFkZC11c2VyXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJhZGQtdXNlclwiLCBjaGlsZHJlbjogXCJBZGQgVXNlclwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnQsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTggfSksIFwiZGF0YS1jeVwiOiBcImV4cG9ydC11c2Vyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LXVzZXJzXCIsIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pLCBfanN4cyhCdXR0b24sIHsgb25DbGljazogaGFuZGxlRGVsZXRlLCB2YXJpYW50OiBcImRhbmdlclwiLCBpY29uOiBfanN4KFRyYXNoLCB7IHNpemU6IDE4IH0pLCBkaXNhYmxlZDogc2VsZWN0ZWRVc2Vycy5sZW5ndGggPT09IDAsIFwiZGF0YS1jeVwiOiBcImRlbGV0ZS11c2Vyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGVsZXRlLXVzZXJzXCIsIGNoaWxkcmVuOiBbXCJEZWxldGUgKFwiLCBzZWxlY3RlZFVzZXJzLmxlbmd0aCwgXCIpXCJdIH0pXSB9KV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTQgcC00IGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDAgcm91bmRlZC1sZyB0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDBcIiwgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogZXJyb3IgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IHVzZXJzLCBjb2x1bW5zOiBjb2x1bW5EZWZzLCBsb2FkaW5nOiBpc0xvYWRpbmcsIG9uU2VsZWN0aW9uQ2hhbmdlOiBzZXRTZWxlY3RlZFVzZXJzLCBlbmFibGVQcmludDogdHJ1ZSwgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSAzMjBweClcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFVzZXJzVmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==