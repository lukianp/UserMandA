(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2639],{

/***/ 12470:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

"use strict";
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

"use strict";
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

/***/ 63338:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3959);
/* harmony import */ var jspdf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13596);
/**
 * Enhanced Export Service
 * Multi-format export (CSV, Excel, PDF, JSON, XML, HTML) with templates and progress tracking
 */


/**
 * Enhanced Export Service
 */
class ExportService {
    templates = new Map();
    /**
     * Export data to specified format
     * @param data Data to export
     * @param format Export format
     * @param options Export options
     */
    async export(data, format, options = {}) {
        const filename = options.filename || `export_${Date.now()}`;
        switch (format) {
            case 'csv':
                return this.exportToCSV(data, filename, options);
            case 'excel':
                return this.exportToExcel(data, filename, options);
            case 'json':
                return this.exportToJSON(data, filename, options);
            case 'pdf':
                return this.exportToPDF(data, filename, options);
            case 'xml':
                return this.exportToXML(data, filename, options);
            case 'html':
                return this.exportToHTML(data, filename, options);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Export data to CSV
     */
    async exportToCSV(data, filename, options = {}) {
        const csv = this.convertToCSV(data, options);
        this.downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Export data to Excel with enhanced features
     */
    async exportToExcel(data, filename, options = {}) {
        const workbook = xlsx__WEBPACK_IMPORTED_MODULE_0__/* .utils */ .Wp.book_new();
        if (options.sheets && options.sheets.length > 0) {
            // Multiple sheets
            for (const sheet of options.sheets) {
                const ws = this.createWorksheet(sheet.data, options);
                xlsx__WEBPACK_IMPORTED_MODULE_0__/* .utils */ .Wp.book_append_sheet(workbook, ws, sheet.name);
            }
        }
        else {
            // Single sheet
            const ws = this.createWorksheet(data, options);
            const sheetName = options.sheetName || 'Sheet1';
            xlsx__WEBPACK_IMPORTED_MODULE_0__/* .utils */ .Wp.book_append_sheet(workbook, ws, sheetName);
        }
        // Write file
        xlsx__WEBPACK_IMPORTED_MODULE_0__/* .writeFile */ ._h(workbook, `${filename}.xlsx`);
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Create Excel worksheet
     */
    createWorksheet(data, options) {
        const filtered = this.filterColumns(data, options);
        const ws = xlsx__WEBPACK_IMPORTED_MODULE_0__/* .utils */ .Wp.json_to_sheet(filtered, {
            header: options.columns,
            skipHeader: !options.includeHeaders,
        });
        // Auto-size columns
        if (options.autoSize) {
            const colWidths = this.calculateColumnWidths(filtered);
            ws['!cols'] = colWidths.map((width) => ({ wch: width }));
        }
        // Freeze header row
        if (options.freezeHeader && options.includeHeaders !== false) {
            ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        }
        return ws;
    }
    /**
     * Calculate optimal column widths
     */
    calculateColumnWidths(data) {
        if (data.length === 0)
            return [];
        const keys = Object.keys(data[0]);
        const widths = keys.map((key) => {
            const values = data.map((row) => String(row[key] || ''));
            const maxLength = Math.max(key.length, ...values.map((v) => v.length));
            return Math.min(maxLength + 2, 50); // Cap at 50 characters
        });
        return widths;
    }
    /**
     * Export data to JSON
     */
    async exportToJSON(data, filename, options = {}) {
        const filtered = this.filterColumns(data, options);
        const json = JSON.stringify(filtered, null, 2);
        this.downloadBlob(json, `${filename}.json`, 'application/json');
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Export data to PDF with tables
     */
    async exportToPDF(data, filename, options = {}) {
        const orientation = options.orientation || 'portrait';
        const doc = new jspdf__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Ay({ orientation, unit: 'pt' });
        // Add title
        if (options.title) {
            doc.setFontSize(16);
            doc.text(options.title, 40, 40);
        }
        // Prepare table data
        const filtered = this.filterColumns(data, options);
        const columns = options.columns || Object.keys(filtered[0] || {});
        const headers = columns.map((col) => options.headers?.[col] || col);
        const rows = filtered.map((row) => columns.map((col) => String(row[col] || '')));
        // Add table
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: options.title ? 60 : 40,
            theme: 'grid',
            styles: {
                fontSize: options.fontSize || 10,
                cellPadding: 5,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: 'bold',
            },
            didDrawPage: (data) => {
                // Add page numbers
                if (options.pageNumbers !== false) {
                    const pageCount = doc.getNumberOfPages();
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height || pageSize.getHeight();
                    doc.setFontSize(10);
                    doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, pageHeight - 10);
                }
            },
        });
        // Save PDF
        doc.save(`${filename}.pdf`);
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Export data to XML
     */
    async exportToXML(data, filename, options = {}) {
        const filtered = this.filterColumns(data, options);
        const xml = this.convertToXML(filtered);
        this.downloadBlob(xml, `${filename}.xml`, 'application/xml');
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Export data to HTML table
     */
    async exportToHTML(data, filename, options = {}) {
        const filtered = this.filterColumns(data, options);
        const html = this.convertToHTML(filtered, options);
        this.downloadBlob(html, `${filename}.html`, 'text/html');
        if (options.onProgress) {
            options.onProgress(100);
        }
    }
    /**
     * Convert data to CSV string
     */
    convertToCSV(data, options = {}) {
        if (data.length === 0)
            return '';
        const filtered = this.filterColumns(data, options);
        const delimiter = options.delimiter || ',';
        const lineEnding = options.lineEnding || '\r\n';
        const quoteAll = options.quoteAll || false;
        const columns = options.columns || Object.keys(filtered[0]);
        const headers = columns.map((col) => options.headers?.[col] || col);
        const lines = [];
        // Add header row
        if (options.includeHeaders !== false) {
            lines.push(this.formatCSVRow(headers, delimiter, quoteAll));
        }
        // Add data rows
        for (const row of filtered) {
            const values = columns.map((col) => row[col]);
            lines.push(this.formatCSVRow(values, delimiter, quoteAll));
        }
        return lines.join(lineEnding);
    }
    /**
     * Format CSV row with proper quoting
     */
    formatCSVRow(values, delimiter, quoteAll) {
        return values
            .map((value) => {
            if (value === null || value === undefined) {
                return '';
            }
            const stringValue = String(value);
            // Quote if contains delimiter, quotes, or newlines, or if quoteAll is true
            const needsQuotes = quoteAll ||
                stringValue.includes(delimiter) ||
                stringValue.includes('"') ||
                stringValue.includes('\n') ||
                stringValue.includes('\r');
            if (needsQuotes) {
                const escaped = stringValue.replace(/"/g, '""');
                return `"${escaped}"`;
            }
            return stringValue;
        })
            .join(delimiter);
    }
    /**
     * Convert data to XML string
     */
    convertToXML(data) {
        const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<data>'];
        for (const row of data) {
            lines.push('  <row>');
            for (const [key, value] of Object.entries(row)) {
                const escaped = this.escapeXML(String(value || ''));
                lines.push(`    <${key}>${escaped}</${key}>`);
            }
            lines.push('  </row>');
        }
        lines.push('</data>');
        return lines.join('\n');
    }
    /**
     * Escape XML special characters
     */
    escapeXML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    /**
     * Convert data to HTML table
     */
    convertToHTML(data, options = {}) {
        const columns = options.columns || Object.keys(data[0] || {});
        const headers = columns.map((col) => options.headers?.[col] || col);
        const lines = [
            '<!DOCTYPE html>',
            '<html>',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <title>Export</title>',
            '  <style>',
            '    table { border-collapse: collapse; width: 100%; }',
            '    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }',
            '    th { background-color: #4CAF50; color: white; }',
            '    tr:nth-child(even) { background-color: #f2f2f2; }',
            '  </style>',
            '</head>',
            '<body>',
            '  <table>',
        ];
        // Add header row
        if (options.includeHeaders !== false) {
            lines.push('    <thead>');
            lines.push('      <tr>');
            for (const header of headers) {
                lines.push(`        <th>${this.escapeHTML(header)}</th>`);
            }
            lines.push('      </tr>');
            lines.push('    </thead>');
        }
        // Add data rows
        lines.push('    <tbody>');
        for (const row of data) {
            lines.push('      <tr>');
            for (const col of columns) {
                const value = row[col] || '';
                lines.push(`        <td>${this.escapeHTML(String(value))}</td>`);
            }
            lines.push('      </tr>');
        }
        lines.push('    </tbody>');
        lines.push('  </table>');
        lines.push('</body>');
        lines.push('</html>');
        return lines.join('\n');
    }
    /**
     * Escape HTML special characters
     */
    escapeHTML(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    /**
     * Filter columns based on options
     */
    filterColumns(data, options) {
        if (!options.columns) {
            return data;
        }
        return data.map((row) => {
            const filtered = {};
            for (const col of options.columns) {
                if (col in row) {
                    filtered[col] = row[col];
                }
            }
            return filtered;
        });
    }
    /**
     * Download blob as file
     */
    downloadBlob(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    /**
     * Save export template
     */
    saveTemplate(template) {
        const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullTemplate = { ...template, id };
        this.templates.set(id, fullTemplate);
        return fullTemplate;
    }
    /**
     * Get export template
     */
    getTemplate(id) {
        return this.templates.get(id);
    }
    /**
     * Get all templates
     */
    getTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Delete template
     */
    deleteTemplate(id) {
        return this.templates.delete(id);
    }
    /**
     * Export using template
     */
    async exportWithTemplate(data, templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Export template not found: ${templateId}`);
        }
        return this.export(data, template.format, template.options);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new ExportService());


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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L2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXHhsc3h8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3NlcnZpY2VzL2V4cG9ydFNlcnZpY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIEVuaGFuY2VkIEV4cG9ydCBTZXJ2aWNlXG4gKiBNdWx0aS1mb3JtYXQgZXhwb3J0IChDU1YsIEV4Y2VsLCBQREYsIEpTT04sIFhNTCwgSFRNTCkgd2l0aCB0ZW1wbGF0ZXMgYW5kIHByb2dyZXNzIHRyYWNraW5nXG4gKi9cbmltcG9ydCAqIGFzIFhMU1ggZnJvbSAneGxzeCc7XG5pbXBvcnQganNQREYgZnJvbSAnanNwZGYnO1xuLyoqXG4gKiBFbmhhbmNlZCBFeHBvcnQgU2VydmljZVxuICovXG5jbGFzcyBFeHBvcnRTZXJ2aWNlIHtcbiAgICB0ZW1wbGF0ZXMgPSBuZXcgTWFwKCk7XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGRhdGEgdG8gc3BlY2lmaWVkIGZvcm1hdFxuICAgICAqIEBwYXJhbSBkYXRhIERhdGEgdG8gZXhwb3J0XG4gICAgICogQHBhcmFtIGZvcm1hdCBFeHBvcnQgZm9ybWF0XG4gICAgICogQHBhcmFtIG9wdGlvbnMgRXhwb3J0IG9wdGlvbnNcbiAgICAgKi9cbiAgICBhc3luYyBleHBvcnQoZGF0YSwgZm9ybWF0LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBvcHRpb25zLmZpbGVuYW1lIHx8IGBleHBvcnRfJHtEYXRlLm5vdygpfWA7XG4gICAgICAgIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgICAgICAgICBjYXNlICdjc3YnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cG9ydFRvQ1NWKGRhdGEsIGZpbGVuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNhc2UgJ2V4Y2VsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leHBvcnRUb0V4Y2VsKGRhdGEsIGZpbGVuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNhc2UgJ2pzb24nOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cG9ydFRvSlNPTihkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjYXNlICdwZGYnOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4cG9ydFRvUERGKGRhdGEsIGZpbGVuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNhc2UgJ3htbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0VG9YTUwoZGF0YSwgZmlsZW5hbWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgY2FzZSAnaHRtbCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhwb3J0VG9IVE1MKGRhdGEsIGZpbGVuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBleHBvcnQgZm9ybWF0OiAke2Zvcm1hdH1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZGF0YSB0byBDU1ZcbiAgICAgKi9cbiAgICBhc3luYyBleHBvcnRUb0NTVihkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGNzdiA9IHRoaXMuY29udmVydFRvQ1NWKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmRvd25sb2FkQmxvYihjc3YsIGAke2ZpbGVuYW1lfS5jc3ZgLCAndGV4dC9jc3Y7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgICBpZiAob3B0aW9ucy5vblByb2dyZXNzKSB7XG4gICAgICAgICAgICBvcHRpb25zLm9uUHJvZ3Jlc3MoMTAwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZGF0YSB0byBFeGNlbCB3aXRoIGVuaGFuY2VkIGZlYXR1cmVzXG4gICAgICovXG4gICAgYXN5bmMgZXhwb3J0VG9FeGNlbChkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHdvcmtib29rID0gWExTWC51dGlscy5ib29rX25ldygpO1xuICAgICAgICBpZiAob3B0aW9ucy5zaGVldHMgJiYgb3B0aW9ucy5zaGVldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gTXVsdGlwbGUgc2hlZXRzXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNoZWV0IG9mIG9wdGlvbnMuc2hlZXRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgd3MgPSB0aGlzLmNyZWF0ZVdvcmtzaGVldChzaGVldC5kYXRhLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBYTFNYLnV0aWxzLmJvb2tfYXBwZW5kX3NoZWV0KHdvcmtib29rLCB3cywgc2hlZXQubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBTaW5nbGUgc2hlZXRcbiAgICAgICAgICAgIGNvbnN0IHdzID0gdGhpcy5jcmVhdGVXb3Jrc2hlZXQoZGF0YSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBzaGVldE5hbWUgPSBvcHRpb25zLnNoZWV0TmFtZSB8fCAnU2hlZXQxJztcbiAgICAgICAgICAgIFhMU1gudXRpbHMuYm9va19hcHBlbmRfc2hlZXQod29ya2Jvb2ssIHdzLCBzaGVldE5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdyaXRlIGZpbGVcbiAgICAgICAgWExTWC53cml0ZUZpbGUod29ya2Jvb2ssIGAke2ZpbGVuYW1lfS54bHN4YCk7XG4gICAgICAgIGlmIChvcHRpb25zLm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25Qcm9ncmVzcygxMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBFeGNlbCB3b3Jrc2hlZXRcbiAgICAgKi9cbiAgICBjcmVhdGVXb3Jrc2hlZXQoZGF0YSwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuZmlsdGVyQ29sdW1ucyhkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgd3MgPSBYTFNYLnV0aWxzLmpzb25fdG9fc2hlZXQoZmlsdGVyZWQsIHtcbiAgICAgICAgICAgIGhlYWRlcjogb3B0aW9ucy5jb2x1bW5zLFxuICAgICAgICAgICAgc2tpcEhlYWRlcjogIW9wdGlvbnMuaW5jbHVkZUhlYWRlcnMsXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBBdXRvLXNpemUgY29sdW1uc1xuICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgY29sV2lkdGhzID0gdGhpcy5jYWxjdWxhdGVDb2x1bW5XaWR0aHMoZmlsdGVyZWQpO1xuICAgICAgICAgICAgd3NbJyFjb2xzJ10gPSBjb2xXaWR0aHMubWFwKCh3aWR0aCkgPT4gKHsgd2NoOiB3aWR0aCB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRnJlZXplIGhlYWRlciByb3dcbiAgICAgICAgaWYgKG9wdGlvbnMuZnJlZXplSGVhZGVyICYmIG9wdGlvbnMuaW5jbHVkZUhlYWRlcnMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB3c1snIWZyZWV6ZSddID0geyB4U3BsaXQ6IDAsIHlTcGxpdDogMSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3cztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlIG9wdGltYWwgY29sdW1uIHdpZHRoc1xuICAgICAqL1xuICAgIGNhbGN1bGF0ZUNvbHVtbldpZHRocyhkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGRhdGFbMF0pO1xuICAgICAgICBjb25zdCB3aWR0aHMgPSBrZXlzLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSBkYXRhLm1hcCgocm93KSA9PiBTdHJpbmcocm93W2tleV0gfHwgJycpKTtcbiAgICAgICAgICAgIGNvbnN0IG1heExlbmd0aCA9IE1hdGgubWF4KGtleS5sZW5ndGgsIC4uLnZhbHVlcy5tYXAoKHYpID0+IHYubGVuZ3RoKSk7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4obWF4TGVuZ3RoICsgMiwgNTApOyAvLyBDYXAgYXQgNTAgY2hhcmFjdGVyc1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHdpZHRocztcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGRhdGEgdG8gSlNPTlxuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydFRvSlNPTihkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5maWx0ZXJDb2x1bW5zKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZmlsdGVyZWQsIG51bGwsIDIpO1xuICAgICAgICB0aGlzLmRvd25sb2FkQmxvYihqc29uLCBgJHtmaWxlbmFtZX0uanNvbmAsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgIGlmIChvcHRpb25zLm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25Qcm9ncmVzcygxMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4cG9ydCBkYXRhIHRvIFBERiB3aXRoIHRhYmxlc1xuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydFRvUERGKGRhdGEsIGZpbGVuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgY29uc3Qgb3JpZW50YXRpb24gPSBvcHRpb25zLm9yaWVudGF0aW9uIHx8ICdwb3J0cmFpdCc7XG4gICAgICAgIGNvbnN0IGRvYyA9IG5ldyBqc1BERih7IG9yaWVudGF0aW9uLCB1bml0OiAncHQnIH0pO1xuICAgICAgICAvLyBBZGQgdGl0bGVcbiAgICAgICAgaWYgKG9wdGlvbnMudGl0bGUpIHtcbiAgICAgICAgICAgIGRvYy5zZXRGb250U2l6ZSgxNik7XG4gICAgICAgICAgICBkb2MudGV4dChvcHRpb25zLnRpdGxlLCA0MCwgNDApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFByZXBhcmUgdGFibGUgZGF0YVxuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHRoaXMuZmlsdGVyQ29sdW1ucyhkYXRhLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgY29sdW1ucyA9IG9wdGlvbnMuY29sdW1ucyB8fCBPYmplY3Qua2V5cyhmaWx0ZXJlZFswXSB8fCB7fSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBjb2x1bW5zLm1hcCgoY29sKSA9PiBvcHRpb25zLmhlYWRlcnM/Lltjb2xdIHx8IGNvbCk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBmaWx0ZXJlZC5tYXAoKHJvdykgPT4gY29sdW1ucy5tYXAoKGNvbCkgPT4gU3RyaW5nKHJvd1tjb2xdIHx8ICcnKSkpO1xuICAgICAgICAvLyBBZGQgdGFibGVcbiAgICAgICAgZG9jLmF1dG9UYWJsZSh7XG4gICAgICAgICAgICBoZWFkOiBbaGVhZGVyc10sXG4gICAgICAgICAgICBib2R5OiByb3dzLFxuICAgICAgICAgICAgc3RhcnRZOiBvcHRpb25zLnRpdGxlID8gNjAgOiA0MCxcbiAgICAgICAgICAgIHRoZW1lOiAnZ3JpZCcsXG4gICAgICAgICAgICBzdHlsZXM6IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogb3B0aW9ucy5mb250U2l6ZSB8fCAxMCxcbiAgICAgICAgICAgICAgICBjZWxsUGFkZGluZzogNSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWFkU3R5bGVzOiB7XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiBbNjYsIDEzOSwgMjAyXSxcbiAgICAgICAgICAgICAgICB0ZXh0Q29sb3I6IDI1NSxcbiAgICAgICAgICAgICAgICBmb250U3R5bGU6ICdib2xkJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkaWREcmF3UGFnZTogKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBBZGQgcGFnZSBudW1iZXJzXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucGFnZU51bWJlcnMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VDb3VudCA9IGRvYy5nZXROdW1iZXJPZlBhZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VTaXplID0gZG9jLmludGVybmFsLnBhZ2VTaXplO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlSGVpZ2h0ID0gcGFnZVNpemUuaGVpZ2h0IHx8IHBhZ2VTaXplLmdldEhlaWdodCgpO1xuICAgICAgICAgICAgICAgICAgICBkb2Muc2V0Rm9udFNpemUoMTApO1xuICAgICAgICAgICAgICAgICAgICBkb2MudGV4dChgUGFnZSAke2RhdGEucGFnZU51bWJlcn0gb2YgJHtwYWdlQ291bnR9YCwgZGF0YS5zZXR0aW5ncy5tYXJnaW4ubGVmdCwgcGFnZUhlaWdodCAtIDEwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2F2ZSBQREZcbiAgICAgICAgZG9jLnNhdmUoYCR7ZmlsZW5hbWV9LnBkZmApO1xuICAgICAgICBpZiAob3B0aW9ucy5vblByb2dyZXNzKSB7XG4gICAgICAgICAgICBvcHRpb25zLm9uUHJvZ3Jlc3MoMTAwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZGF0YSB0byBYTUxcbiAgICAgKi9cbiAgICBhc3luYyBleHBvcnRUb1hNTChkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5maWx0ZXJDb2x1bW5zKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCB4bWwgPSB0aGlzLmNvbnZlcnRUb1hNTChmaWx0ZXJlZCk7XG4gICAgICAgIHRoaXMuZG93bmxvYWRCbG9iKHhtbCwgYCR7ZmlsZW5hbWV9LnhtbGAsICdhcHBsaWNhdGlvbi94bWwnKTtcbiAgICAgICAgaWYgKG9wdGlvbnMub25Qcm9ncmVzcykge1xuICAgICAgICAgICAgb3B0aW9ucy5vblByb2dyZXNzKDEwMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGRhdGEgdG8gSFRNTCB0YWJsZVxuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydFRvSFRNTChkYXRhLCBmaWxlbmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5maWx0ZXJDb2x1bW5zKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBodG1sID0gdGhpcy5jb252ZXJ0VG9IVE1MKGZpbHRlcmVkLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5kb3dubG9hZEJsb2IoaHRtbCwgYCR7ZmlsZW5hbWV9Lmh0bWxgLCAndGV4dC9odG1sJyk7XG4gICAgICAgIGlmIChvcHRpb25zLm9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25Qcm9ncmVzcygxMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgZGF0YSB0byBDU1Ygc3RyaW5nXG4gICAgICovXG4gICAgY29udmVydFRvQ1NWKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5maWx0ZXJDb2x1bW5zKGRhdGEsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBkZWxpbWl0ZXIgPSBvcHRpb25zLmRlbGltaXRlciB8fCAnLCc7XG4gICAgICAgIGNvbnN0IGxpbmVFbmRpbmcgPSBvcHRpb25zLmxpbmVFbmRpbmcgfHwgJ1xcclxcbic7XG4gICAgICAgIGNvbnN0IHF1b3RlQWxsID0gb3B0aW9ucy5xdW90ZUFsbCB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgY29sdW1ucyA9IG9wdGlvbnMuY29sdW1ucyB8fCBPYmplY3Qua2V5cyhmaWx0ZXJlZFswXSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBjb2x1bW5zLm1hcCgoY29sKSA9PiBvcHRpb25zLmhlYWRlcnM/Lltjb2xdIHx8IGNvbCk7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gW107XG4gICAgICAgIC8vIEFkZCBoZWFkZXIgcm93XG4gICAgICAgIGlmIChvcHRpb25zLmluY2x1ZGVIZWFkZXJzICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgbGluZXMucHVzaCh0aGlzLmZvcm1hdENTVlJvdyhoZWFkZXJzLCBkZWxpbWl0ZXIsIHF1b3RlQWxsKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGRhdGEgcm93c1xuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiBmaWx0ZXJlZCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gY29sdW1ucy5tYXAoKGNvbCkgPT4gcm93W2NvbF0pO1xuICAgICAgICAgICAgbGluZXMucHVzaCh0aGlzLmZvcm1hdENTVlJvdyh2YWx1ZXMsIGRlbGltaXRlciwgcXVvdGVBbGwpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluZXMuam9pbihsaW5lRW5kaW5nKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRm9ybWF0IENTViByb3cgd2l0aCBwcm9wZXIgcXVvdGluZ1xuICAgICAqL1xuICAgIGZvcm1hdENTVlJvdyh2YWx1ZXMsIGRlbGltaXRlciwgcXVvdGVBbGwpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlc1xuICAgICAgICAgICAgLm1hcCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgICAgICAgICAgLy8gUXVvdGUgaWYgY29udGFpbnMgZGVsaW1pdGVyLCBxdW90ZXMsIG9yIG5ld2xpbmVzLCBvciBpZiBxdW90ZUFsbCBpcyB0cnVlXG4gICAgICAgICAgICBjb25zdCBuZWVkc1F1b3RlcyA9IHF1b3RlQWxsIHx8XG4gICAgICAgICAgICAgICAgc3RyaW5nVmFsdWUuaW5jbHVkZXMoZGVsaW1pdGVyKSB8fFxuICAgICAgICAgICAgICAgIHN0cmluZ1ZhbHVlLmluY2x1ZGVzKCdcIicpIHx8XG4gICAgICAgICAgICAgICAgc3RyaW5nVmFsdWUuaW5jbHVkZXMoJ1xcbicpIHx8XG4gICAgICAgICAgICAgICAgc3RyaW5nVmFsdWUuaW5jbHVkZXMoJ1xccicpO1xuICAgICAgICAgICAgaWYgKG5lZWRzUXVvdGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXNjYXBlZCA9IHN0cmluZ1ZhbHVlLnJlcGxhY2UoL1wiL2csICdcIlwiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBcIiR7ZXNjYXBlZH1cImA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWU7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbihkZWxpbWl0ZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGRhdGEgdG8gWE1MIHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnZlcnRUb1hNTChkYXRhKSB7XG4gICAgICAgIGNvbnN0IGxpbmVzID0gWyc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz4nLCAnPGRhdGE+J107XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goJyAgPHJvdz4nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHJvdykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5lc2NhcGVYTUwoU3RyaW5nKHZhbHVlIHx8ICcnKSk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChgICAgIDwke2tleX0+JHtlc2NhcGVkfTwvJHtrZXl9PmApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluZXMucHVzaCgnICA8L3Jvdz4nKTtcbiAgICAgICAgfVxuICAgICAgICBsaW5lcy5wdXNoKCc8L2RhdGE+Jyk7XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXNjYXBlIFhNTCBzcGVjaWFsIGNoYXJhY3RlcnNcbiAgICAgKi9cbiAgICBlc2NhcGVYTUwodGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dFxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmYXBvczsnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCBkYXRhIHRvIEhUTUwgdGFibGVcbiAgICAgKi9cbiAgICBjb252ZXJ0VG9IVE1MKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCBjb2x1bW5zID0gb3B0aW9ucy5jb2x1bW5zIHx8IE9iamVjdC5rZXlzKGRhdGFbMF0gfHwge30pO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gY29sdW1ucy5tYXAoKGNvbCkgPT4gb3B0aW9ucy5oZWFkZXJzPy5bY29sXSB8fCBjb2wpO1xuICAgICAgICBjb25zdCBsaW5lcyA9IFtcbiAgICAgICAgICAgICc8IURPQ1RZUEUgaHRtbD4nLFxuICAgICAgICAgICAgJzxodG1sPicsXG4gICAgICAgICAgICAnPGhlYWQ+JyxcbiAgICAgICAgICAgICcgIDxtZXRhIGNoYXJzZXQ9XCJVVEYtOFwiPicsXG4gICAgICAgICAgICAnICA8dGl0bGU+RXhwb3J0PC90aXRsZT4nLFxuICAgICAgICAgICAgJyAgPHN0eWxlPicsXG4gICAgICAgICAgICAnICAgIHRhYmxlIHsgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTsgd2lkdGg6IDEwMCU7IH0nLFxuICAgICAgICAgICAgJyAgICB0aCwgdGQgeyBib3JkZXI6IDFweCBzb2xpZCAjZGRkOyBwYWRkaW5nOiA4cHg7IHRleHQtYWxpZ246IGxlZnQ7IH0nLFxuICAgICAgICAgICAgJyAgICB0aCB7IGJhY2tncm91bmQtY29sb3I6ICM0Q0FGNTA7IGNvbG9yOiB3aGl0ZTsgfScsXG4gICAgICAgICAgICAnICAgIHRyOm50aC1jaGlsZChldmVuKSB7IGJhY2tncm91bmQtY29sb3I6ICNmMmYyZjI7IH0nLFxuICAgICAgICAgICAgJyAgPC9zdHlsZT4nLFxuICAgICAgICAgICAgJzwvaGVhZD4nLFxuICAgICAgICAgICAgJzxib2R5PicsXG4gICAgICAgICAgICAnICA8dGFibGU+JyxcbiAgICAgICAgXTtcbiAgICAgICAgLy8gQWRkIGhlYWRlciByb3dcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5jbHVkZUhlYWRlcnMgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcgICAgPHRoZWFkPicpO1xuICAgICAgICAgICAgbGluZXMucHVzaCgnICAgICAgPHRyPicpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCAgICAgICAgPHRoPiR7dGhpcy5lc2NhcGVIVE1MKGhlYWRlcil9PC90aD5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxpbmVzLnB1c2goJyAgICAgIDwvdHI+Jyk7XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcgICAgPC90aGVhZD4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgZGF0YSByb3dzXG4gICAgICAgIGxpbmVzLnB1c2goJyAgICA8dGJvZHk+Jyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIGRhdGEpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goJyAgICAgIDx0cj4nKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29sIG9mIGNvbHVtbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJvd1tjb2xdIHx8ICcnO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goYCAgICAgICAgPHRkPiR7dGhpcy5lc2NhcGVIVE1MKFN0cmluZyh2YWx1ZSkpfTwvdGQ+YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5lcy5wdXNoKCcgICAgICA8L3RyPicpO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVzLnB1c2goJyAgICA8L3Rib2R5PicpO1xuICAgICAgICBsaW5lcy5wdXNoKCcgIDwvdGFibGU+Jyk7XG4gICAgICAgIGxpbmVzLnB1c2goJzwvYm9keT4nKTtcbiAgICAgICAgbGluZXMucHVzaCgnPC9odG1sPicpO1xuICAgICAgICByZXR1cm4gbGluZXMuam9pbignXFxuJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVzY2FwZSBIVE1MIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAqL1xuICAgIGVzY2FwZUhUTUwodGV4dCkge1xuICAgICAgICByZXR1cm4gdGV4dFxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csICcmIzAzOTsnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlsdGVyIGNvbHVtbnMgYmFzZWQgb24gb3B0aW9uc1xuICAgICAqL1xuICAgIGZpbHRlckNvbHVtbnMoZGF0YSwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMuY29sdW1ucykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGEubWFwKChyb3cpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0ge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbCBvZiBvcHRpb25zLmNvbHVtbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29sIGluIHJvdykge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFtjb2xdID0gcm93W2NvbF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRG93bmxvYWQgYmxvYiBhcyBmaWxlXG4gICAgICovXG4gICAgZG93bmxvYWRCbG9iKGNvbnRlbnQsIGZpbGVuYW1lLCBtaW1lVHlwZSkge1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvbnRlbnRdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiAgICAgICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2F2ZSBleHBvcnQgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBzYXZlVGVtcGxhdGUodGVtcGxhdGUpIHtcbiAgICAgICAgY29uc3QgaWQgPSBgdGVtcGxhdGVfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBjb25zdCBmdWxsVGVtcGxhdGUgPSB7IC4uLnRlbXBsYXRlLCBpZCB9O1xuICAgICAgICB0aGlzLnRlbXBsYXRlcy5zZXQoaWQsIGZ1bGxUZW1wbGF0ZSk7XG4gICAgICAgIHJldHVybiBmdWxsVGVtcGxhdGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBleHBvcnQgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBnZXRUZW1wbGF0ZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZW1wbGF0ZXMuZ2V0KGlkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGFsbCB0ZW1wbGF0ZXNcbiAgICAgKi9cbiAgICBnZXRUZW1wbGF0ZXMoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudGVtcGxhdGVzLnZhbHVlcygpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIHRlbXBsYXRlXG4gICAgICovXG4gICAgZGVsZXRlVGVtcGxhdGUoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVzLmRlbGV0ZShpZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4cG9ydCB1c2luZyB0ZW1wbGF0ZVxuICAgICAqL1xuICAgIGFzeW5jIGV4cG9ydFdpdGhUZW1wbGF0ZShkYXRhLCB0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZXMuZ2V0KHRlbXBsYXRlSWQpO1xuICAgICAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cG9ydCB0ZW1wbGF0ZSBub3QgZm91bmQ6ICR7dGVtcGxhdGVJZH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5leHBvcnQoZGF0YSwgdGVtcGxhdGUuZm9ybWF0LCB0ZW1wbGF0ZS5vcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBuZXcgRXhwb3J0U2VydmljZSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9