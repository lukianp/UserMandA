"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5735],{

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Info */ .R2D, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


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

/***/ 85735:
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
    const selectedSourceProfile = (0,useProfileStore/* useProfileStore */.K)((state) => state.selectedSourceProfile);
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
        __webpack_require__.e(/* import() */ 310).then(__webpack_require__.bind(__webpack_require__, 10310)).then(({ CreateUserDialog }) => {
            const { openModal, updateModal } = (__webpack_require__(23361)/* .useModalStore */ .K).getState();
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col p-6", "data-cy": "users-view", "data-testid": "users-view", children: [(0,jsx_runtime.jsxs)("div", { className: "mb-6", children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Users" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mt-1", children: "Manage user accounts across Active Directory and Azure AD" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search users...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "w-64", "data-cy": "user-search", "data-testid": "user-search" }), (0,jsx_runtime.jsxs)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [(users ?? []).length, " users"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: loadUsers, variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { size: 18 }), loading: isLoading, "data-cy": "refresh-users", "data-testid": "refresh-users", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleAddUser, variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* UserPlus */.ypN, { size: 18 }), "data-cy": "add-user", "data-testid": "add-user", children: "Add User" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExport, variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { size: 18 }), "data-cy": "export-users", "data-testid": "export-users", children: "Export" }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: handleDelete, variant: "danger", icon: (0,jsx_runtime.jsx)(lucide_react/* Trash */.lMJ, { size: 18 }), disabled: selectedUsers.length === 0, "data-cy": "delete-users", "data-testid": "delete-users", children: ["Delete (", selectedUsers.length, ")"] })] })] }), error && ((0,jsx_runtime.jsx)("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400", role: "alert", children: error })), (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: users, columns: columnDefs, loading: isLoading, onSelectionChange: setSelectedUsers, enablePrint: true, height: "calc(100vh - 320px)" }) })] }));
};
/* harmony default export */ const users_UsersView = (UsersView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0EscUJBQXFCLG9CQUFXO0FBQ2hDO0FBQ0EsWUFBWSx5SkFBeUosRUFBRSxpQkFBaUI7QUFDeEw7QUFDQSw4QkFBOEIscUJBQVc7QUFDekM7QUFDQTtBQUNBLDJCQUEyQiwyQkFBMkI7QUFDdEQsS0FBSztBQUNMLFlBQVksb0JBQUssVUFBVSx3R0FBd0csb0JBQUssVUFBVSw4QkFBOEIsbUJBQUksU0FBUyxrRkFBa0YsR0FBRyxtQkFBSSxRQUFRLDJIQUEySCxJQUFJLEdBQUcsb0JBQUssVUFBVSxnRUFBZ0Usb0JBQUssVUFBVSxpREFBaUQsbUJBQUksQ0FBQyxrQkFBSyxJQUFJLDhLQUE4SyxHQUFHLG9CQUFLLFdBQVcsbUdBQW1HLElBQUksR0FBRyxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxDQUFDLG9CQUFNLElBQUksZ0RBQWdELG1CQUFJLENBQUMsK0JBQVMsSUFBSSxVQUFVLHdHQUF3RyxHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxrREFBa0QsbUJBQUksQ0FBQyw4QkFBUSxJQUFJLFVBQVUsMkVBQTJFLEdBQUcsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLG1EQUFtRCxtQkFBSSxDQUFDLDhCQUFRLElBQUksVUFBVSxpRkFBaUYsR0FBRyxvQkFBSyxDQUFDLG9CQUFNLElBQUksZ0RBQWdELG1CQUFJLENBQUMsMkJBQUssSUFBSSxVQUFVLHNKQUFzSixJQUFJLElBQUksYUFBYSxtQkFBSSxVQUFVLHdLQUF3SyxJQUFJLG1CQUFJLFVBQVUsK0JBQStCLG1CQUFJLENBQUMsOENBQW1CLElBQUksNklBQTZJLEdBQUcsSUFBSTtBQUNubUU7QUFDQSxzREFBZSxTQUFTLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VVc2Vyc1ZpZXdMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy91c2Vycy9Vc2Vyc1ZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCIvKipcbiAqIFVzZXJzIFZpZXcgTG9naWMgSG9va1xuICogTWFuYWdlcyBzdGF0ZSBhbmQgbG9naWMgZm9yIHRoZSBVc2VycyB2aWV3XG4gKlxuICogUmVwbGljYXRlcyAvZ3VpLyBVc2Vyc1ZpZXdNb2RlbC5jcyBwYXR0ZXJuOlxuICogLSBMb2FkcyBkYXRhIGZyb20gTG9naWNFbmdpbmUgb24gbW91bnRcbiAqIC0gUmVsb2FkcyB3aGVuIHByb2ZpbGUgY2hhbmdlc1xuICogLSBBdXRvLXJlZnJlc2hlcyBvbiBmaWxlIGNoYW5nZXNcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlVXNlcnNWaWV3TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3VzZXJzLCBzZXRVc2Vyc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkVXNlcnMsIHNldFNlbGVjdGVkVXNlcnNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gU3Vic2NyaWJlIHRvIHNlbGVjdGVkIHNvdXJjZSBwcm9maWxlIGNoYW5nZXNcbiAgICBjb25zdCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgPSB1c2VQcm9maWxlU3RvcmUoKHN0YXRlKSA9PiBzdGF0ZS5zZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgIC8vIExvYWQgdXNlcnMgb24gbW91bnQgYW5kIHdoZW4gcHJvZmlsZSBjaGFuZ2VzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFVzZXJzKCk7XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZV0pOyAvLyBSZWxvYWQgd2hlbiBwcm9maWxlIGNoYW5nZXNcbiAgICAvLyBTdWJzY3JpYmUgdG8gZmlsZSBjaGFuZ2UgZXZlbnRzIGZvciBhdXRvLXJlZnJlc2hcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVEYXRhUmVmcmVzaCA9IChkYXRhVHlwZSkgPT4ge1xuICAgICAgICAgICAgaWYgKChkYXRhVHlwZSA9PT0gJ1VzZXJzJyB8fCBkYXRhVHlwZSA9PT0gJ0FsbCcpICYmICFpc0xvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1VzZXJzVmlld10gQXV0by1yZWZyZXNoaW5nIGR1ZSB0byBmaWxlIGNoYW5nZXMnKTtcbiAgICAgICAgICAgICAgICBsb2FkVXNlcnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gVE9ETzogU3Vic2NyaWJlIHRvIGZpbGUgd2F0Y2hlciBldmVudHMgd2hlbiBhdmFpbGFibGVcbiAgICAgICAgLy8gd2luZG93LmVsZWN0cm9uQVBJLm9uKCdmaWxld2F0Y2hlcjpkYXRhQ2hhbmdlZCcsIGhhbmRsZURhdGFSZWZyZXNoKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIC8vIFRPRE86IENsZWFudXAgc3Vic2NyaXB0aW9uXG4gICAgICAgICAgICAvLyB3aW5kb3cuZWxlY3Ryb25BUEkub2ZmKCdmaWxld2F0Y2hlcjpkYXRhQ2hhbmdlZCcsIGhhbmRsZURhdGFSZWZyZXNoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbaXNMb2FkaW5nXSk7XG4gICAgLyoqXG4gICAgICogTWFwIFVzZXJEdG8gZnJvbSBMb2dpYyBFbmdpbmUgdG8gVXNlckRhdGEgZm9yIHRoZSB2aWV3XG4gICAgICovXG4gICAgY29uc3QgbWFwVXNlckR0b1RvVXNlckRhdGEgPSAoZHRvKSA9PiB7XG4gICAgICAgIC8vIERldGVybWluZSBzb3VyY2UgZnJvbSBEaXNjb3ZlcnlNb2R1bGVcbiAgICAgICAgbGV0IHVzZXJTb3VyY2UgPSAnQWN0aXZlRGlyZWN0b3J5JztcbiAgICAgICAgY29uc3QgZGlzY292ZXJ5TW9kdWxlID0gZHRvLkRpc2NvdmVyeU1vZHVsZSB8fCAnJztcbiAgICAgICAgaWYgKGRpc2NvdmVyeU1vZHVsZS5pbmNsdWRlcygnQXp1cmUnKSkge1xuICAgICAgICAgICAgdXNlclNvdXJjZSA9ICdBenVyZUFEJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkaXNjb3ZlcnlNb2R1bGUuaW5jbHVkZXMoJ0FjdGl2ZURpcmVjdG9yeScpIHx8IGRpc2NvdmVyeU1vZHVsZS5pbmNsdWRlcygnQUQnKSkge1xuICAgICAgICAgICAgdXNlclNvdXJjZSA9ICdBY3RpdmVEaXJlY3RvcnknO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBDb3JlIFVzZXJEYXRhIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGlkOiBkdG8uVVBOIHx8IGR0by5TaWQsXG4gICAgICAgICAgICBuYW1lOiBkdG8uRGlzcGxheU5hbWUgfHwgZHRvLlNhbSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogZHRvLkRpc3BsYXlOYW1lIHx8IGR0by5TYW0gfHwgbnVsbCxcbiAgICAgICAgICAgIHVzZXJQcmluY2lwYWxOYW1lOiBkdG8uVVBOIHx8IG51bGwsXG4gICAgICAgICAgICBtYWlsOiBkdG8uTWFpbCB8fCBudWxsLFxuICAgICAgICAgICAgZW1haWw6IGR0by5NYWlsIHx8IG51bGwsXG4gICAgICAgICAgICBhY2NvdW50RW5hYmxlZDogZHRvLkVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IGR0by5FbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgIHNhbUFjY291bnROYW1lOiBkdG8uU2FtIHx8IG51bGwsXG4gICAgICAgICAgICBkZXBhcnRtZW50OiBkdG8uRGVwdCB8fCBudWxsLFxuICAgICAgICAgICAgam9iVGl0bGU6IG51bGwsIC8vIE5vdCBhdmFpbGFibGUgaW4gVXNlckR0b1xuICAgICAgICAgICAgb2ZmaWNlTG9jYXRpb246IG51bGwsIC8vIE5vdCBhdmFpbGFibGUgaW4gVXNlckR0b1xuICAgICAgICAgICAgY29tcGFueU5hbWU6IG51bGwsXG4gICAgICAgICAgICBtYW5hZ2VyRGlzcGxheU5hbWU6IG51bGwsXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZVRpbWU6IGR0by5EaXNjb3ZlcnlUaW1lc3RhbXAgfHwgbnVsbCxcbiAgICAgICAgICAgIHVzZXJTb3VyY2UsXG4gICAgICAgICAgICAvLyBBZGRpdGlvbmFsIHByb3BlcnRpZXNcbiAgICAgICAgICAgIGZpcnN0TmFtZTogbnVsbCxcbiAgICAgICAgICAgIGxhc3ROYW1lOiBudWxsLFxuICAgICAgICAgICAgZ3JvdXBzOiBkdG8uR3JvdXBzPy5qb2luKCcsICcpIHx8IG51bGwsXG4gICAgICAgICAgICBtYW5hZ2VyOiBkdG8uTWFuYWdlciB8fCBudWxsLFxuICAgICAgICAgICAgc3RhdHVzOiBkdG8uRW5hYmxlZCA/ICdhY3RpdmUnIDogJ2Rpc2FibGVkJyxcbiAgICAgICAgICAgIC8vIFJlcXVpcmVkIGJ5IFRpbWVzdGFtcE1ldGFkYXRhIGludGVyZmFjZVxuICAgICAgICAgICAgY3JlYXRlZEF0OiBkdG8uRGlzY292ZXJ5VGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIExvYWQgdXNlcnMgZnJvbSBMb2dpYyBFbmdpbmUgKENTViBkYXRhKVxuICAgICAqIFJlcGxpY2F0ZXMgL2d1aS8gVXNlcnNWaWV3TW9kZWwuTG9hZEFzeW5jKCkgcGF0dGVyblxuICAgICAqL1xuICAgIGNvbnN0IGxvYWRVc2VycyA9IGFzeW5jIChmb3JjZVJlbG9hZCA9IGZhbHNlKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1VzZXJzVmlld10gTG9hZGluZyB1c2VycyBmcm9tIExvZ2ljRW5naW5lLi4uJHtmb3JjZVJlbG9hZCA/ICcgKGZvcmNlIHJlbG9hZCknIDogJyd9YCk7XG4gICAgICAgICAgICAvLyBGb3JjZSByZWxvYWQgZGF0YSBmcm9tIENTViBpZiByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmIChmb3JjZVJlbG9hZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVXNlcnNWaWV3XSBGb3JjaW5nIExvZ2ljRW5naW5lIGRhdGEgcmVsb2FkLi4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkUmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnbG9naWNFbmdpbmU6Zm9yY2VSZWxvYWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbG9hZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZWxvYWRSZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byByZWxvYWQgTG9naWNFbmdpbmUgZGF0YScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW1VzZXJzVmlld10gTG9naWNFbmdpbmUgZGF0YSByZWxvYWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdldCB1c2VycyBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnbG9naWNFbmdpbmU6Z2V0QWxsVXNlcnMnKTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCB1c2VycyBmcm9tIExvZ2ljRW5naW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlc3BvbnNlIGZvcm1hdCBmcm9tIExvZ2ljRW5naW5lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYXAgVXNlckR0b1tdIHRvIFVzZXJEYXRhW11cbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZFVzZXJzID0gcmVzdWx0LmRhdGEubWFwKG1hcFVzZXJEdG9Ub1VzZXJEYXRhKTtcbiAgICAgICAgICAgIHNldFVzZXJzKG1hcHBlZFVzZXJzKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtVc2Vyc1ZpZXddIExvYWRlZCAke21hcHBlZFVzZXJzLmxlbmd0aH0gdXNlcnMgZnJvbSBMb2dpY0VuZ2luZWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tVc2Vyc1ZpZXddIEZhaWxlZCB0byBsb2FkIHVzZXJzOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIHVzZXJzIGZyb20gTG9naWMgRW5naW5lLicpO1xuICAgICAgICAgICAgc2V0VXNlcnMoW10pOyAvLyBTZXQgZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiBtb2NrIGRhdGFcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZpbHRlciB1c2VycyBiYXNlZCBvbiBzZWFyY2ggdGV4dFxuICAgICAqL1xuICAgIGNvbnN0IGZpbHRlcmVkVXNlcnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzZWFyY2hUZXh0KVxuICAgICAgICAgICAgcmV0dXJuIHVzZXJzO1xuICAgICAgICBjb25zdCBzZWFyY2ggPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiB1c2Vycy5maWx0ZXIoKHUpID0+IHUuZGlzcGxheU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgdS5lbWFpbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICB1LmRlcGFydG1lbnQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgdS5qb2JUaXRsZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICB1LnVzZXJQcmluY2lwYWxOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgIH0sIFt1c2Vycywgc2VhcmNoVGV4dF0pO1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBkZWZpbml0aW9ucyBmb3IgQUcgR3JpZFxuICAgICAqL1xuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgbWluV2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbWFpbCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW1haWwnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMjAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2RlcGFydG1lbnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0RlcGFydG1lbnQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2pvYlRpdGxlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdKb2IgVGl0bGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBtaW5XaWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ29mZmljZUxvY2F0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMb2NhdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAxMjAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWNjb3VudEVuYWJsZWQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCcsXG4gICAgICAgICAgICBjZWxsU3R5bGU6IChwYXJhbXMpID0+ICh7XG4gICAgICAgICAgICAgICAgY29sb3I6IHBhcmFtcy52YWx1ZSA/ICdncmVlbicgOiAncmVkJyxcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnYm9sZCdcbiAgICAgICAgICAgIH0pLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3VzZXJTb3VyY2UnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NvdXJjZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAxMjAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBY2NvdW50IFN0YXR1cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8qKlxuICAgICAqIEhhbmRsZSBleHBvcnQgdXNlcnMgdG8gQ1NWL0V4Y2VsXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gUmVxdWVzdCBmaWxlIHNhdmUgbG9jYXRpb25cbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLnNob3dTYXZlRGlhbG9nKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0V4cG9ydCBVc2VycycsXG4gICAgICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGB1c2Vycy1leHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YCxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0NTViBGaWxlcycsIGV4dGVuc2lvbnM6IFsnY3N2J10gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnRXhjZWwgRmlsZXMnLCBleHRlbnNpb25zOiBbJ3hsc3gnXSB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgLy8gQ29udmVydCB1c2VycyB0byBDU1ZcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbJ0Rpc3BsYXkgTmFtZScsICdFbWFpbCcsICdEZXBhcnRtZW50JywgJ0pvYiBUaXRsZScsICdMb2NhdGlvbicsICdTdGF0dXMnLCAnU291cmNlJywgJ01GQSddO1xuICAgICAgICAgICAgY29uc3Qgcm93cyA9IGZpbHRlcmVkVXNlcnMubWFwKCh1KSA9PiBbXG4gICAgICAgICAgICAgICAgdS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICB1Lm1haWwsXG4gICAgICAgICAgICAgICAgdS5kZXBhcnRtZW50IHx8ICcnLFxuICAgICAgICAgICAgICAgIHUuam9iVGl0bGUgfHwgJycsXG4gICAgICAgICAgICAgICAgdS5vZmZpY2VMb2NhdGlvbiB8fCAnJyxcbiAgICAgICAgICAgICAgICB1LmFjY291bnRFbmFibGVkID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJyxcbiAgICAgICAgICAgICAgICB1LnVzZXJTb3VyY2UgfHwgJycsXG4gICAgICAgICAgICAgICAgdS5zdGF0dXMgfHwgJycsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnN0IGNzdiA9IFtoZWFkZXJzLCAuLi5yb3dzXS5tYXAoKHJvdykgPT4gcm93Lm1hcCgoY2VsbCkgPT4gYFwiJHtjZWxsfVwiYCkuam9pbignLCcpKS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIC8vIFdyaXRlIGZpbGVcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS53cml0ZUZpbGUoZmlsZVBhdGgsIGNzdik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRXhwb3J0ZWQgJHtmaWx0ZXJlZFVzZXJzLmxlbmd0aH0gdXNlcnMgdG8gJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBvcnQgZmFpbGVkOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGV4cG9ydCB1c2Vycy4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogSGFuZGxlIGRlbGV0ZSBzZWxlY3RlZCB1c2Vyc1xuICAgICAqIE5vdGU6IEZvciBDU1YtYmFzZWQgZGlzY292ZXJ5IGRhdGEsIHRoaXMgcmVtb3ZlcyBpdGVtcyBmcm9tIGxvY2FsIHN0YXRlIG9ubHkuXG4gICAgICogRGF0YSB3aWxsIHJlbG9hZCBmcm9tIENTViBmaWxlcyBvbiBuZXh0IHJlZnJlc2guXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlRGVsZXRlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkVXNlcnMubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBjb25maXJtZWQgPSB3aW5kb3cuY29uZmlybShgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSAke3NlbGVjdGVkVXNlcnMubGVuZ3RofSB1c2VyKHMpIGZyb20gdGhlIHZpZXc/XFxuXFxuTm90ZTogVGhpcyByZW1vdmVzIGl0ZW1zIGZyb20gdGhlIGN1cnJlbnQgdmlldyBvbmx5LiBEYXRhIHdpbGwgcmVsb2FkIGZyb20gQ1NWIGZpbGVzIG9uIG5leHQgcmVmcmVzaC5gKTtcbiAgICAgICAgaWYgKCFjb25maXJtZWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBHZXQgSURzIG9mIHVzZXJzIHRvIHJlbW92ZVxuICAgICAgICAgICAgY29uc3QgaWRzVG9SZW1vdmUgPSBuZXcgU2V0KHNlbGVjdGVkVXNlcnMubWFwKCh1KSA9PiB1LmlkKSk7XG4gICAgICAgICAgICAvLyBSZW1vdmUgZnJvbSBsb2NhbCBzdGF0ZVxuICAgICAgICAgICAgc2V0VXNlcnMoKHByZXZVc2VycykgPT4gcHJldlVzZXJzLmZpbHRlcigodSkgPT4gIWlkc1RvUmVtb3ZlLmhhcyh1LmlkKSkpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRVc2VycyhbXSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW1VzZXJzVmlld10gUmVtb3ZlZCAke3NlbGVjdGVkVXNlcnMubGVuZ3RofSB1c2VycyBmcm9tIHZpZXdgKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbVXNlcnNWaWV3XSBEZWxldGUgZmFpbGVkOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcignRmFpbGVkIHRvIHJlbW92ZSB1c2VycyBmcm9tIHZpZXcuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEhhbmRsZSBhZGQgbmV3IHVzZXJcbiAgICAgKiBPcGVucyBDcmVhdGVVc2VyRGlhbG9nIG1vZGFsXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlQWRkVXNlciA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tVc2Vyc1ZpZXddIE9wZW5pbmcgYWRkIHVzZXIgZGlhbG9nLi4uJyk7XG4gICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBhbmQgcmVuZGVyIENyZWF0ZVVzZXJEaWFsb2dcbiAgICAgICAgaW1wb3J0KCcuLi9jb21wb25lbnRzL2RpYWxvZ3MvQ3JlYXRlVXNlckRpYWxvZycpLnRoZW4oKHsgQ3JlYXRlVXNlckRpYWxvZyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IG9wZW5Nb2RhbCwgdXBkYXRlTW9kYWwgfSA9IHJlcXVpcmUoJy4uL3N0b3JlL3VzZU1vZGFsU3RvcmUnKS51c2VNb2RhbFN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgICAgICBjb25zdCBtb2RhbElkID0gb3Blbk1vZGFsKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NyZWF0ZSBOZXcgVXNlcicsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBDcmVhdGVVc2VyRGlhbG9nLFxuICAgICAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsSWQ6ICcnLCAvLyBXaWxsIGJlIHVwZGF0ZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgb25Vc2VyQ3JlYXRlZDogKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbVXNlcnNWaWV3XSBVc2VyIGNyZWF0ZWQsIHJlbG9hZGluZyB1c2Vycy4uLicsIHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFVzZXJzKCk7IC8vIFJlbG9hZCB1c2VycyBhZnRlciBjcmVhdGlvblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIG1vZGFsIHByb3BzIHdpdGggYWN0dWFsIG1vZGFsSWRcbiAgICAgICAgICAgIHVwZGF0ZU1vZGFsKG1vZGFsSWQsIHtcbiAgICAgICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbElkLFxuICAgICAgICAgICAgICAgICAgICBvblVzZXJDcmVhdGVkOiAodXNlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tVc2Vyc1ZpZXddIFVzZXIgY3JlYXRlZCwgcmVsb2FkaW5nIHVzZXJzLi4uJywgdXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkVXNlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSGFuZGxlIHJlZnJlc2ggYnV0dG9uIGNsaWNrXG4gICAgICogRm9yY2VzIHJlbG9hZCBvZiBkYXRhIGZyb20gQ1NWIGZpbGVzXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlUmVmcmVzaCA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tVc2Vyc1ZpZXddIFJlZnJlc2ggYnV0dG9uIGNsaWNrZWQsIGZvcmNpbmcgZGF0YSByZWxvYWQnKTtcbiAgICAgICAgbG9hZFVzZXJzKHRydWUpOyAvLyBQYXNzIHRydWUgdG8gZm9yY2UgcmVsb2FkXG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICB1c2VyczogZmlsdGVyZWRVc2VycyxcbiAgICAgICAgYWxsVXNlcnM6IHVzZXJzLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNlbGVjdGVkVXNlcnMsXG4gICAgICAgIGVycm9yLFxuICAgICAgICAvLyBBY3Rpb25zXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlbGVjdGVkVXNlcnMsXG4gICAgICAgIGxvYWRVc2VycyxcbiAgICAgICAgaGFuZGxlUmVmcmVzaCxcbiAgICAgICAgaGFuZGxlRXhwb3J0LFxuICAgICAgICBoYW5kbGVEZWxldGUsXG4gICAgICAgIGhhbmRsZUFkZFVzZXIsXG4gICAgICAgIC8vIEdyaWQgY29uZmlnXG4gICAgICAgIGNvbHVtbkRlZnMsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBVc2Vyc1ZpZXcgQ29tcG9uZW50XG4gKlxuICogVXNlciBtYW5hZ2VtZW50IHZpZXcgd2l0aCBkYXRhIGdyaWQgYW5kIGFjdGlvbnNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlTmF2aWdhdGUgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJztcbmltcG9ydCB7IHVzZURyYWcgfSBmcm9tICdyZWFjdC1kbmQnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFRyYXNoLCBVc2VyUGx1cywgUmVmcmVzaEN3LCBHcmlwVmVydGljYWwgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmltcG9ydCB7IHVzZVVzZXJzVmlld0xvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlVXNlcnNWaWV3TG9naWMnO1xuLyoqXG4gKiBEcmFnZ2FibGUgY2VsbCBjb21wb25lbnQgZm9yIGRyYWcgaGFuZGxlXG4gKi9cbmNvbnN0IERyYWdIYW5kbGVDZWxsID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgY29uc3QgW3sgaXNEcmFnZ2luZyB9LCBkcmFnXSA9IHVzZURyYWcoe1xuICAgICAgICB0eXBlOiAnVVNFUicsXG4gICAgICAgIGl0ZW06ICgpID0+ICh7XG4gICAgICAgICAgICBpZDogZGF0YS51c2VyUHJpbmNpcGFsTmFtZSB8fCBkYXRhLmlkIHx8IGRhdGEuZW1haWwgfHwgJycsXG4gICAgICAgICAgICB0eXBlOiAnVVNFUicsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB9KSxcbiAgICAgICAgY29sbGVjdDogKG1vbml0b3IpID0+ICh7XG4gICAgICAgICAgICBpc0RyYWdnaW5nOiBtb25pdG9yLmlzRHJhZ2dpbmcoKSxcbiAgICAgICAgfSksXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgcmVmOiBkcmFnLCBjbGFzc05hbWU6IGNsc3goJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1tb3ZlIGgtZnVsbCcsIGlzRHJhZ2dpbmcgJiYgJ29wYWNpdHktNTAnKSwgdGl0bGU6IFwiRHJhZyB0byBhZGQgdG8gbWlncmF0aW9uIHdhdmVcIiwgXCJkYXRhLWN5XCI6IFwidXNlci1kcmFnLWhhbmRsZVwiLCBcImRhdGEtdGVzdGlkXCI6IFwidXNlci1kcmFnLWhhbmRsZVwiLCBjaGlsZHJlbjogX2pzeChHcmlwVmVydGljYWwsIHsgc2l6ZTogMTYsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIgfSkgfSkpO1xufTtcbi8qKlxuICogVXNlcnMgbWFuYWdlbWVudCB2aWV3XG4gKi9cbmNvbnN0IFVzZXJzVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gICAgLy8gVXNlIHRoZSB1c2VycyB2aWV3IGxvZ2ljIGhvb2sgKGxvYWRzIGRhdGEgZnJvbSBMb2dpYyBFbmdpbmUgQ1NWKVxuICAgIGNvbnN0IHsgdXNlcnMsIGlzTG9hZGluZywgc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dCwgc2VsZWN0ZWRVc2Vycywgc2V0U2VsZWN0ZWRVc2VycywgbG9hZFVzZXJzLCBoYW5kbGVFeHBvcnQsIGhhbmRsZURlbGV0ZSwgaGFuZGxlQWRkVXNlciwgZXJyb3IsIGNvbHVtbkRlZnMsIH0gPSB1c2VVc2Vyc1ZpZXdMb2dpYygpO1xuICAgIC8vIEhhbmRsZSB2aWV3IGRldGFpbHNcbiAgICBjb25zdCBoYW5kbGVWaWV3RGV0YWlscyA9IHVzZUNhbGxiYWNrKCh1c2VyKSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHVzZXIudXNlclByaW5jaXBhbE5hbWUgfHwgdXNlci5pZCB8fCB1c2VyLmVtYWlsIHx8ICcnO1xuICAgICAgICAvLyBOYXZpZ2F0ZSB0byB1c2VyIGRldGFpbCB2aWV3XG4gICAgICAgIG5hdmlnYXRlKGAvdXNlcnMvJHtlbmNvZGVVUklDb21wb25lbnQodXNlcklkKX1gKTtcbiAgICB9LCBbbmF2aWdhdGVdKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIHAtNlwiLCBcImRhdGEtY3lcIjogXCJ1c2Vycy12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ1c2Vycy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiVXNlcnNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogXCJNYW5hZ2UgdXNlciBhY2NvdW50cyBhY3Jvc3MgQWN0aXZlIERpcmVjdG9yeSBhbmQgQXp1cmUgQURcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KElucHV0LCB7IHBsYWNlaG9sZGVyOiBcIlNlYXJjaCB1c2Vycy4uLlwiLCB2YWx1ZTogc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hUZXh0KGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInctNjRcIiwgXCJkYXRhLWN5XCI6IFwidXNlci1zZWFyY2hcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInVzZXItc2VhcmNoXCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbKHVzZXJzID8/IFtdKS5sZW5ndGgsIFwiIHVzZXJzXCJdIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBsb2FkVXNlcnMsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IHNpemU6IDE4IH0pLCBsb2FkaW5nOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtdXNlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtdXNlcnNcIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVBZGRVc2VyLCB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChVc2VyUGx1cywgeyBzaXplOiAxOCB9KSwgXCJkYXRhLWN5XCI6IFwiYWRkLXVzZXJcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImFkZC11c2VyXCIsIGNoaWxkcmVuOiBcIkFkZCBVc2VyXCIgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxOCB9KSwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtdXNlcnNcIiwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSksIF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVEZWxldGUsIHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIGljb246IF9qc3goVHJhc2gsIHsgc2l6ZTogMTggfSksIGRpc2FibGVkOiBzZWxlY3RlZFVzZXJzLmxlbmd0aCA9PT0gMCwgXCJkYXRhLWN5XCI6IFwiZGVsZXRlLXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkZWxldGUtdXNlcnNcIiwgY2hpbGRyZW46IFtcIkRlbGV0ZSAoXCIsIHNlbGVjdGVkVXNlcnMubGVuZ3RoLCBcIilcIl0gfSldIH0pXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNCBwLTQgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLWxnIHRleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMFwiLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBlcnJvciB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogdXNlcnMsIGNvbHVtbnM6IGNvbHVtbkRlZnMsIGxvYWRpbmc6IGlzTG9hZGluZywgb25TZWxlY3Rpb25DaGFuZ2U6IHNldFNlbGVjdGVkVXNlcnMsIGVuYWJsZVByaW50OiB0cnVlLCBoZWlnaHQ6IFwiY2FsYygxMDB2aCAtIDMyMHB4KVwiIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgVXNlcnNWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9