"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4728],{

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

/***/ 94728:
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
    const { selectedSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "compliance-report-view", "data-testid": "compliance-report-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-8 h-8 text-green-600 dark:text-green-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Compliance Report" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Monitor compliance across frameworks" })] })] }), selectedProfile && (0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Total Controls" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Compliant" }), (0,jsx_runtime.jsxs)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: [stats?.compliant ?? 0, " ", (0,jsx_runtime.jsxs)("span", { className: "text-sm", children: ["(", stats?.complianceRate ?? 0, "%)"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Non-Compliant" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.nonCompliant ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Avg Score" }), (0,jsx_runtime.jsxs)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: [stats?.avgScore ?? 0, "%"] })] })] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.framework || filters.status || filters.riskLevel || filters.owner || filters.searchText) && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search controls...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsxs)("select", { value: filters.framework || '', onChange: (e) => updateFilter('framework', e.target.value), "data-cy": "framework-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Frameworks" }), (filterOptions?.frameworks ?? []).map((fw) => ((0,jsx_runtime.jsx)("option", { value: fw || '', children: fw }, fw || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.status || '', onChange: (e) => updateFilter('status', e.target.value), "data-cy": "status-select", "data-testid": "status-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Statuses" }), (filterOptions?.statuses ?? []).map((st) => ((0,jsx_runtime.jsx)("option", { value: st || '', children: st }, st || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.riskLevel || '', onChange: (e) => updateFilter('riskLevel', e.target.value), "data-cy": "risk-level-select", "data-testid": "risk-level-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Risk Levels" }), (filterOptions?.riskLevels ?? []).map((rl) => ((0,jsx_runtime.jsx)("option", { value: rl || '', children: rl }, rl || 'unknown')))] }), (0,jsx_runtime.jsxs)("select", { value: filters.owner || '', onChange: (e) => updateFilter('owner', e.target.value), "data-cy": "owner-select", "data-testid": "owner-select", className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All Owners" }), (filterOptions?.owners ?? []).map((own) => ((0,jsx_runtime.jsx)("option", { value: own || '', children: own }, own || 'unknown')))] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: exportData, disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", children: "Export Report" })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedItems, height: "calc(100vh - 500px)" }) })] }));
};
/* harmony default export */ const compliance_ComplianceReportView = (ComplianceReportView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLFNBQVMsK0VBQStFLHlHQUF5RyxtQkFBSSxDQUFDLG9CQUFNLElBQUksb0NBQW9DLG1CQUFJLENBQUMsY0FBQyxJQUFJLHNCQUFzQixxSEFBcUgsS0FBSyxHQUFHLG9CQUFLLFVBQVUsK0RBQStELG1CQUFJLENBQUMsa0JBQUssSUFBSSxxTEFBcUwsR0FBRyxvQkFBSyxhQUFhLHVQQUF1UCxtQkFBSSxhQUFhLHVDQUF1QyxrREFBa0QsbUJBQUksYUFBYSwrQkFBK0IsdUJBQXVCLEdBQUcsb0JBQUssYUFBYSw4UUFBOFEsbUJBQUksYUFBYSxxQ0FBcUMsZ0RBQWdELG1CQUFJLGFBQWEsK0JBQStCLHVCQUF1QixHQUFHLG9CQUFLLGFBQWEsNFJBQTRSLG1CQUFJLGFBQWEsd0NBQXdDLGtEQUFrRCxtQkFBSSxhQUFhLCtCQUErQix1QkFBdUIsR0FBRyxvQkFBSyxhQUFhLDBRQUEwUSxtQkFBSSxhQUFhLG1DQUFtQywrQ0FBK0MsbUJBQUksYUFBYSxpQ0FBaUMsd0JBQXdCLElBQUksSUFBSSxHQUFHLG1CQUFJLFVBQVUsMEdBQTBHLG9CQUFLLFVBQVUsMkRBQTJELG1CQUFJLENBQUMsb0JBQU0sSUFBSSwwQkFBMEIsbUJBQUksQ0FBQywrQkFBUyxJQUFJLHNCQUFzQix1SEFBdUgsR0FBRyxtQkFBSSxDQUFDLG9CQUFNLElBQUksNEJBQTRCLG1CQUFJLENBQUMsOEJBQVEsSUFBSSxzQkFBc0IsaUhBQWlILElBQUksR0FBRyxhQUFhLG1CQUFJLFVBQVUsd0hBQXdILG1CQUFJLFFBQVEsc0VBQXNFLEdBQUcsSUFBSSxtQkFBSSxVQUFVLG1EQUFtRCxtQkFBSSxDQUFDLDhDQUFtQixJQUFJLHdLQUF3SyxHQUFHLElBQUk7QUFDMzBNO0FBQ0Esc0VBQWUsb0JBQW9CLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VDb21wbGlhbmNlUmVwb3J0TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvY29tcGxpYW5jZS9Db21wbGlhbmNlUmVwb3J0Vmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsIi8qKlxuICogQ29tcGxpYW5jZSBSZXBvcnQgTG9naWMgSG9va1xuICogSGFuZGxlcyBjb21wbGlhbmNlIGZyYW1ld29yayByZXBvcnRpbmcgYW5kIGFzc2Vzc21lbnRcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuZXhwb3J0IGNvbnN0IHVzZUNvbXBsaWFuY2VSZXBvcnRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkU291cmNlUHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZmlsdGVycywgc2V0RmlsdGVyc10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGZyYW1ld29yazogJycsXG4gICAgICAgIHN0YXR1czogJycsXG4gICAgICAgIHJpc2tMZXZlbDogJycsXG4gICAgICAgIG93bmVyOiAnJyxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgfSk7XG4gICAgY29uc3QgW3NlbGVjdGVkSXRlbXMsIHNldFNlbGVjdGVkSXRlbXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NvbnRyb2wgSUQnLFxuICAgICAgICAgICAgZmllbGQ6ICdjb250cm9sSWQnLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdGcmFtZXdvcmsnLFxuICAgICAgICAgICAgZmllbGQ6ICdmcmFtZXdvcmsnLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUaXRsZScsXG4gICAgICAgICAgICBmaWVsZDogJ3RpdGxlJyxcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgQ29tcGxpYW50OiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGRhcms6YmctZ3JlZW4tOTAwLzIwIGRhcms6dGV4dC1ncmVlbi00MDAnLFxuICAgICAgICAgICAgICAgICAgICBOb25Db21wbGlhbnQ6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAvMjAgZGFyazp0ZXh0LXJlZC00MDAnLFxuICAgICAgICAgICAgICAgICAgICBQYXJ0aWFsbHlDb21wbGlhbnQ6ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBkYXJrOmJnLXllbGxvdy05MDAvMjAgZGFyazp0ZXh0LXllbGxvdy00MDAnLFxuICAgICAgICAgICAgICAgICAgICBOb3RBc3Nlc3NlZDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgZGFyazpiZy1ncmF5LTkwMC8yMCBkYXJrOnRleHQtZ3JheS00MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJweC0yIHB5LTEgcm91bmRlZCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgJHtjb2xvcn1cIj4ke3BhcmFtcy52YWx1ZX08L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSaXNrIExldmVsJyxcbiAgICAgICAgICAgIGZpZWxkOiAncmlza0xldmVsJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgQ3JpdGljYWw6ICd0ZXh0LXJlZC02MDAnLFxuICAgICAgICAgICAgICAgICAgICBIaWdoOiAndGV4dC1vcmFuZ2UtNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgTWVkaXVtOiAndGV4dC15ZWxsb3ctNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgTG93OiAndGV4dC1ncmVlbi02MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICd0ZXh0LWdyYXktNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Njb3JlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnc2NvcmUnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHR5cGU6ICdudW1lcmljQ29sdW1uJyxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gdmFsdWUgPj0gODAgPyAndGV4dC1ncmVlbi02MDAnIDogdmFsdWUgPj0gNjAgPyAndGV4dC15ZWxsb3ctNjAwJyA6ICd0ZXh0LXJlZC02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHt2YWx1ZX0lPC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ2F0ZWdvcnknLFxuICAgICAgICAgICAgZmllbGQ6ICdjYXRlZ29yeScsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ093bmVyJyxcbiAgICAgICAgICAgIGZpZWxkOiAnb3duZXInLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEdWUgRGF0ZScsXG4gICAgICAgICAgICBmaWVsZDogJ2R1ZURhdGUnLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBmaWVsZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgICAgICB3cmFwVGV4dDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0V2aWRlbmNlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZXZpZGVuY2UnLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JlbWVkaWF0aW9uJyxcbiAgICAgICAgICAgIGZpZWxkOiAncmVtZWRpYXRpb24nLFxuICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbLi4uZGF0YV07XG4gICAgICAgIGlmIChmaWx0ZXJzLmZyYW1ld29yaylcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZnJhbWV3b3JrID09PSBmaWx0ZXJzLmZyYW1ld29yayk7XG4gICAgICAgIGlmIChmaWx0ZXJzLnN0YXR1cylcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uc3RhdHVzID09PSBmaWx0ZXJzLnN0YXR1cyk7XG4gICAgICAgIGlmIChmaWx0ZXJzLnJpc2tMZXZlbClcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0ucmlza0xldmVsID09PSBmaWx0ZXJzLnJpc2tMZXZlbCk7XG4gICAgICAgIGlmIChmaWx0ZXJzLm93bmVyKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5vd25lcj8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLm93bmVyLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gZmlsdGVycy5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLnRpdGxlPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICBpdGVtLmNvbnRyb2xJZD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgaXRlbS5kZXNjcmlwdGlvbj8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhLCBmaWx0ZXJzXSk7XG4gICAgY29uc3QgZmlsdGVyT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBmcmFtZXdvcmtzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5mcmFtZXdvcmspLmZpbHRlcihCb29sZWFuKSldLnNvcnQoKTtcbiAgICAgICAgY29uc3Qgc3RhdHVzZXMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLnN0YXR1cykuZmlsdGVyKEJvb2xlYW4pKV0uc29ydCgpO1xuICAgICAgICBjb25zdCByaXNrTGV2ZWxzID0gWydDcml0aWNhbCcsICdIaWdoJywgJ01lZGl1bScsICdMb3cnXTtcbiAgICAgICAgY29uc3Qgb3duZXJzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5vd25lcikuZmlsdGVyKEJvb2xlYW4pKV0uc29ydCgpO1xuICAgICAgICByZXR1cm4geyBmcmFtZXdvcmtzLCBzdGF0dXNlcywgcmlza0xldmVscywgb3duZXJzIH07XG4gICAgfSwgW2RhdGFdKTtcbiAgICBjb25zdCBsb2FkRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdObyBzb3VyY2UgcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvQ29tcGxpYW5jZS9Db21wbGlhbmNlUmVwb3J0LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0dldC1Db21wbGlhbmNlQ29udHJvbHMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgRG9tYWluOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuZG9tYWluLFxuICAgICAgICAgICAgICAgICAgICBDcmVkZW50aWFsOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY3JlZGVudGlhbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgdGltZW91dDogMzAwMDAwIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzdWx0LmRhdGEuY29udHJvbHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgY29tcGxpYW5jZSBkYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZV0pO1xuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGNsZWFyRmlsdGVycyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycyh7IGZyYW1ld29yazogJycsIHN0YXR1czogJycsIHJpc2tMZXZlbDogJycsIG93bmVyOiAnJywgc2VhcmNoVGV4dDogJycgfSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGV4cG9ydERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyk7XG4gICAgICAgIHJldHVybiB7IGZpbGVuYW1lOiBgY29tcGxpYW5jZS1yZXBvcnQtJHt0aW1lc3RhbXB9LmNzdmAsIGRhdGE6IGZpbHRlcmVkRGF0YSB9O1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbCA9IGZpbHRlcmVkRGF0YS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNvbXBsaWFudCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQuc3RhdHVzID09PSAnQ29tcGxpYW50JykubGVuZ3RoO1xuICAgICAgICBjb25zdCBub25Db21wbGlhbnQgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLnN0YXR1cyA9PT0gJ05vbkNvbXBsaWFudCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYXZnU2NvcmUgPSB0b3RhbCA+IDAgPyBmaWx0ZXJlZERhdGEucmVkdWNlKChzdW0sIGQpID0+IHN1bSArIGQuc2NvcmUsIDApIC8gdG90YWwgOiAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWwsXG4gICAgICAgICAgICBjb21wbGlhbnQsXG4gICAgICAgICAgICBub25Db21wbGlhbnQsXG4gICAgICAgICAgICBjb21wbGlhbmNlUmF0ZTogdG90YWwgPiAwID8gKChjb21wbGlhbnQgLyB0b3RhbCkgKiAxMDApLnRvRml4ZWQoMSkgOiAnMCcsXG4gICAgICAgICAgICBhdmdTY29yZTogYXZnU2NvcmUudG9GaXhlZCgxKSxcbiAgICAgICAgfTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkU291cmNlUHJvZmlsZSlcbiAgICAgICAgICAgIGxvYWREYXRhKCk7XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZSwgbG9hZERhdGFdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGZpbHRlcnMsXG4gICAgICAgIGZpbHRlck9wdGlvbnMsXG4gICAgICAgIHVwZGF0ZUZpbHRlcixcbiAgICAgICAgY2xlYXJGaWx0ZXJzLFxuICAgICAgICBzZWxlY3RlZEl0ZW1zLFxuICAgICAgICBzZXRTZWxlY3RlZEl0ZW1zLFxuICAgICAgICBsb2FkRGF0YSxcbiAgICAgICAgZXhwb3J0RGF0YSxcbiAgICAgICAgc3RhdHMsXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ29tcGxpYW5jZSBSZXBvcnQgVmlld1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2hlY2tDaXJjbGUsIFJlZnJlc2hDdywgRG93bmxvYWQsIEZpbHRlciwgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VDb21wbGlhbmNlUmVwb3J0TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VDb21wbGlhbmNlUmVwb3J0TG9naWMnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmNvbnN0IENvbXBsaWFuY2VSZXBvcnRWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgY29sdW1ucywgaXNMb2FkaW5nLCBlcnJvciwgZmlsdGVycywgZmlsdGVyT3B0aW9ucywgdXBkYXRlRmlsdGVyLCBjbGVhckZpbHRlcnMsIHNlbGVjdGVkSXRlbXMsIHNldFNlbGVjdGVkSXRlbXMsIGxvYWREYXRhLCBleHBvcnREYXRhLCBzdGF0cywgc2VsZWN0ZWRQcm9maWxlLCB9ID0gdXNlQ29tcGxpYW5jZVJlcG9ydExvZ2ljKCk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwiY29tcGxpYW5jZS1yZXBvcnQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiY29tcGxpYW5jZS1yZXBvcnQtdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctOCBoLTggdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJDb21wbGlhbmNlIFJlcG9ydFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk1vbml0b3IgY29tcGxpYW5jZSBhY3Jvc3MgZnJhbWV3b3Jrc1wiIH0pXSB9KV0gfSksIHNlbGVjdGVkUHJvZmlsZSAmJiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbXCJQcm9maWxlOiBcIiwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogc2VsZWN0ZWRQcm9maWxlLm5hbWUgfSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTUgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiVG90YWwgQ29udHJvbHNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy50b3RhbCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJDb21wbGlhbnRcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0xMDBcIiwgY2hpbGRyZW46IFtzdGF0cz8uY29tcGxpYW50ID8/IDAsIFwiIFwiLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogW1wiKFwiLCBzdGF0cz8uY29tcGxpYW5jZVJhdGUgPz8gMCwgXCIlKVwiXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJOb24tQ29tcGxpYW50XCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcmVkLTkwMCBkYXJrOnRleHQtcmVkLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/Lm5vbkNvbXBsaWFudCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcHVycGxlLTUwIGRhcms6YmctcHVycGxlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXB1cnBsZS02MDAgZGFyazp0ZXh0LXB1cnBsZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiQXZnIFNjb3JlXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXB1cnBsZS05MDAgZGFyazp0ZXh0LXB1cnBsZS0xMDBcIiwgY2hpbGRyZW46IFtzdGF0cz8uYXZnU2NvcmUgPz8gMCwgXCIlXCJdIH0pXSB9KV0gfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4KEZpbHRlciwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSksIChmaWx0ZXJzLmZyYW1ld29yayB8fCBmaWx0ZXJzLnN0YXR1cyB8fCBmaWx0ZXJzLnJpc2tMZXZlbCB8fCBmaWx0ZXJzLm93bmVyIHx8IGZpbHRlcnMuc2VhcmNoVGV4dCkgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZ2hvc3RcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogY2xlYXJGaWx0ZXJzLCBcImRhdGEtY3lcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2xlYXItZmlsdGVycy1idG5cIiwgY2hpbGRyZW46IFwiQ2xlYXIgQWxsXCIgfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNSBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGNvbnRyb2xzLi4uXCIsIHZhbHVlOiBmaWx0ZXJzLnNlYXJjaFRleHQsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdzZWFyY2hUZXh0JywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJzZWFyY2gtaW5wdXRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNlYXJjaC1pbnB1dFwiIH0pLCBfanN4cyhcInNlbGVjdFwiLCB7IHZhbHVlOiBmaWx0ZXJzLmZyYW1ld29yayB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ2ZyYW1ld29yaycsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwiZnJhbWV3b3JrLXNlbGVjdFwiLCBjbGFzc05hbWU6IFwicHgtMyBweS0yIGJvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgcm91bmRlZC1tZCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwIHRleHQtc21cIiwgY2hpbGRyZW46IFtfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiXCIsIGNoaWxkcmVuOiBcIkFsbCBGcmFtZXdvcmtzXCIgfSksIChmaWx0ZXJPcHRpb25zPy5mcmFtZXdvcmtzID8/IFtdKS5tYXAoKGZ3KSA9PiAoX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBmdyB8fCAnJywgY2hpbGRyZW46IGZ3IH0sIGZ3IHx8ICd1bmtub3duJykpKV0gfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IGZpbHRlcnMuc3RhdHVzIHx8ICcnLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpbHRlcignc3RhdHVzJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJzdGF0dXMtc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0dXMtc2VsZWN0XCIsIGNsYXNzTmFtZTogXCJweC0zIHB5LTIgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgdGV4dC1zbVwiLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgY2hpbGRyZW46IFwiQWxsIFN0YXR1c2VzXCIgfSksIChmaWx0ZXJPcHRpb25zPy5zdGF0dXNlcyA/PyBbXSkubWFwKChzdCkgPT4gKF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogc3QgfHwgJycsIGNoaWxkcmVuOiBzdCB9LCBzdCB8fCAndW5rbm93bicpKSldIH0pLCBfanN4cyhcInNlbGVjdFwiLCB7IHZhbHVlOiBmaWx0ZXJzLnJpc2tMZXZlbCB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3Jpc2tMZXZlbCcsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwicmlzay1sZXZlbC1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJpc2stbGV2ZWwtc2VsZWN0XCIsIGNsYXNzTmFtZTogXCJweC0zIHB5LTIgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgdGV4dC1zbVwiLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgY2hpbGRyZW46IFwiQWxsIFJpc2sgTGV2ZWxzXCIgfSksIChmaWx0ZXJPcHRpb25zPy5yaXNrTGV2ZWxzID8/IFtdKS5tYXAoKHJsKSA9PiAoX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBybCB8fCAnJywgY2hpbGRyZW46IHJsIH0sIHJsIHx8ICd1bmtub3duJykpKV0gfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IGZpbHRlcnMub3duZXIgfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdvd25lcicsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwib3duZXItc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJvd25lci1zZWxlY3RcIiwgY2xhc3NOYW1lOiBcInB4LTMgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIlwiLCBjaGlsZHJlbjogXCJBbGwgT3duZXJzXCIgfSksIChmaWx0ZXJPcHRpb25zPy5vd25lcnMgPz8gW10pLm1hcCgob3duKSA9PiAoX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBvd24gfHwgJycsIGNoaWxkcmVuOiBvd24gfSwgb3duIHx8ICd1bmtub3duJykpKV0gfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBsb2FkRGF0YSwgbG9hZGluZzogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVmcmVzaC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGV4cG9ydERhdGEsIGRpc2FibGVkOiAoZGF0YT8ubGVuZ3RoID8/IDApID09PSAwLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KV0gfSkgfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm14LTYgbXQtNCBwLTQgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLW1kXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMFwiLCBjaGlsZHJlbjogZXJyb3IgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1oaWRkZW4gcC02XCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogZGF0YSwgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nLCBlbmFibGVTZWxlY3Rpb246IHRydWUsIHNlbGVjdGlvbk1vZGU6IFwibXVsdGlwbGVcIiwgb25TZWxlY3Rpb25DaGFuZ2U6IHNldFNlbGVjdGVkSXRlbXMsIGhlaWdodDogXCJjYWxjKDEwMHZoIC0gNTAwcHgpXCIgfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDb21wbGlhbmNlUmVwb3J0VmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==