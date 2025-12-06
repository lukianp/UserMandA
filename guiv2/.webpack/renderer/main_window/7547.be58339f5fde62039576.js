"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7547],{

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

/***/ 95893:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  T: () => (/* binding */ useSecurityInfrastructureDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/securityInfrastructure.ts
/**
 * Security Infrastructure Discovery Type Definitions
 * Comprehensive types for security infrastructure discovery operations
 */
/**
 * Default configuration factory
 */
const createDefaultSecurityConfig = () => ({
    id: crypto.randomUUID(),
    name: 'New Security Discovery',
    description: '',
    discoverDevices: true,
    discoverPolicies: true,
    discoverIncidents: true,
    discoverVulnerabilities: true,
    deviceTypes: ['firewall', 'ids', 'ips', 'waf', 'proxy', 'endpoint', 'dlp', 'siem', 'vpn'],
    networkRanges: [],
    includeOfflineDevices: false,
    includeDraftPolicies: false,
    includeDeprecatedPolicies: false,
    complianceFrameworks: [],
    incidentDateRange: null,
    includeClosed: false,
    minSeverity: 'medium',
    performVulnerabilityScan: true,
    scanDepth: 'standard',
    minCvssScore: 7.0,
    includeAcceptedRisks: false,
    maxConcurrentRequests: 5,
    timeout: 3600,
    throttleDelayMs: 100,
    credentialId: null,
    isScheduled: false,
    schedule: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});
/**
 * Default filter factory
 */
const createDefaultSecurityFilter = () => ({
    deviceTypes: null,
    deviceStatus: null,
    healthStatus: null,
    policyTypes: null,
    policyStatus: null,
    complianceStatus: null,
    incidentTypes: null,
    incidentSeverity: null,
    incidentStatus: null,
    vulnerabilitySeverity: null,
    vulnerabilityStatus: null,
    cvssScoreRange: null,
    hasActiveExploits: null,
    searchQuery: null,
});

// EXTERNAL MODULE: ./src/renderer/hooks/useDebounce.ts
var useDebounce = __webpack_require__(99305);
// EXTERNAL MODULE: ./src/renderer/store/useDiscoveryStore.ts
var useDiscoveryStore = __webpack_require__(92856);
;// ./src/renderer/hooks/useSecurityInfrastructureDiscoveryLogic.ts
/**
 * Security Infrastructure Discovery View Logic Hook
 * Manages state and business logic for security infrastructure discovery operations
 */




/**
 * Security Infrastructure Discovery Logic Hook
 */
const useSecurityInfrastructureDiscoveryLogic = () => {
    const { getResultsByModuleName } = (0,useDiscoveryStore/* useDiscoveryStore */.R)();
    // State
    const [state, setState] = (0,react.useState)({
        config: createDefaultSecurityConfig(),
        templates: [],
        currentResult: null,
        historicalResults: [],
        filter: createDefaultSecurityFilter(),
        searchText: '',
        isDiscovering: false,
        progress: null,
        selectedTab: 'overview',
        selectedObjects: [],
        errors: [],
    });
    const debouncedSearch = (0,useDebounce/* useDebounce */.d)(state.searchText, 300);
    // Load previous discovery results from store on mount
    (0,react.useEffect)(() => {
        const previousResults = getResultsByModuleName('SecurityInfrastructureDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[SecurityInfrastructureDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setState(prev => ({ ...prev, currentResult: latestResult }));
        }
    }, [getResultsByModuleName]);
    // Load templates and historical results on mount
    (0,react.useEffect)(() => {
        loadTemplates();
        loadHistoricalResults();
    }, []);
    // Subscribe to discovery progress
    (0,react.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'security-discovery') {
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
                modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
                functionName: 'Get-SecurityDiscoveryTemplates',
                parameters: {},
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, templates: result.data.templates }));
            }
        }
        catch (error) {
            console.error('Failed to load security discovery templates:', error);
        }
    };
    /**
     * Load historical discovery results
     */
    const loadHistoricalResults = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
                functionName: 'Get-SecurityDiscoveryHistory',
                parameters: { limit: 10 },
            });
            if (result.success && result.data) {
                setState(prev => ({ ...prev, historicalResults: result.data.results }));
            }
        }
        catch (error) {
            console.error('Failed to load security discovery history:', error);
        }
    };
    /**
     * Start security infrastructure discovery
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
                modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
                functionName: 'Invoke-SecurityInfrastructureDiscovery',
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
            await window.electronAPI.cancelExecution('security-discovery');
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                progress: null,
            }));
        }
        catch (error) {
            console.error('Failed to cancel security discovery:', error);
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
                modulePath: 'Modules/Discovery/SecurityInfrastructureDiscovery.psm1',
                functionName: 'Save-SecurityDiscoveryTemplate',
                parameters: { template },
            });
            await loadTemplates();
        }
        catch (error) {
            console.error('Failed to save security discovery template:', error);
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
                functionName: 'Export-SecurityDiscoveryResults',
                parameters: {
                    result: state.currentResult,
                    format,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Failed to export security discovery results:', error);
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
            case 'devices':
                data = state.currentResult.devices;
                break;
            case 'policies':
                data = state.currentResult.policies;
                break;
            case 'incidents':
                data = state.currentResult.incidents;
                break;
            case 'vulnerabilities':
                data = state.currentResult.vulnerabilities;
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
        if (state.selectedTab === 'devices') {
            if (state.filter.deviceTypes) {
                data = (data ?? []).filter((device) => state.filter.deviceTypes?.includes(device.deviceType));
            }
            if (state.filter.deviceStatus) {
                data = (data ?? []).filter((device) => state.filter.deviceStatus?.includes(device.operationalStatus));
            }
        }
        if (state.selectedTab === 'incidents' && state.filter.incidentSeverity) {
            data = (data ?? []).filter((incident) => state.filter.incidentSeverity?.includes(incident.severity));
        }
        if (state.selectedTab === 'vulnerabilities' && state.filter.vulnerabilitySeverity) {
            data = (data ?? []).filter((vuln) => state.filter.vulnerabilitySeverity?.includes(vuln.severity));
        }
        return data;
    }, [state.currentResult, state.selectedTab, debouncedSearch, state.filter]);
    /**
     * Column definitions for AG Grid
     */
    const columnDefs = (0,react.useMemo)(() => {
        switch (state.selectedTab) {
            case 'devices':
                return [
                    { field: 'name', headerName: 'Device Name', sortable: true, filter: true, pinned: 'left' },
                    { field: 'deviceType', headerName: 'Type', sortable: true, filter: true },
                    { field: 'vendor', headerName: 'Vendor', sortable: true, filter: true },
                    { field: 'model', headerName: 'Model', sortable: true },
                    { field: 'version', headerName: 'Version', sortable: true },
                    { field: 'ipAddress', headerName: 'IP Address', sortable: true },
                    { field: 'location', headerName: 'Location', sortable: true, filter: true },
                    { field: 'operationalStatus', headerName: 'Status', sortable: true, filter: true },
                    { field: 'healthStatus', headerName: 'Health', sortable: true, filter: true },
                    {
                        field: 'riskScore',
                        headerName: 'Risk Score',
                        sortable: true,
                        valueFormatter: (params) => `${params.value}/100`,
                    },
                    { field: 'vulnerabilitiesCount', headerName: 'Vulnerabilities', sortable: true },
                    { field: 'licenseStatus', headerName: 'License', sortable: true, filter: true },
                ];
            case 'policies':
                return [
                    { field: 'name', headerName: 'Policy Name', sortable: true, filter: true, pinned: 'left' },
                    { field: 'policyType', headerName: 'Type', sortable: true, filter: true },
                    { field: 'category', headerName: 'Category', sortable: true, filter: true },
                    { field: 'status', headerName: 'Status', sortable: true, filter: true },
                    { field: 'enforcementMode', headerName: 'Enforcement', sortable: true, filter: true },
                    { field: 'complianceStatus', headerName: 'Compliance', sortable: true, filter: true },
                    { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
                    { field: 'ruleCount', headerName: 'Rules', sortable: true },
                    { field: 'activeRules', headerName: 'Active', sortable: true },
                    { field: 'violationCount', headerName: 'Violations', sortable: true },
                    {
                        field: 'lastModified',
                        headerName: 'Last Modified',
                        sortable: true,
                        valueFormatter: (params) => formatDate(params.value),
                    },
                    { field: 'modifiedBy', headerName: 'Modified By', sortable: true },
                ];
            case 'incidents':
                return [
                    { field: 'title', headerName: 'Incident', sortable: true, filter: true, pinned: 'left' },
                    { field: 'incidentType', headerName: 'Type', sortable: true, filter: true },
                    { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
                    { field: 'priority', headerName: 'Priority', sortable: true, filter: true },
                    { field: 'status', headerName: 'Status', sortable: true, filter: true },
                    {
                        field: 'riskScore',
                        headerName: 'Risk Score',
                        sortable: true,
                        valueFormatter: (params) => `${params.value}/100`,
                    },
                    {
                        field: 'detectedAt',
                        headerName: 'Detected',
                        sortable: true,
                        valueFormatter: (params) => formatDate(params.value),
                    },
                    { field: 'assignedTo', headerName: 'Assigned To', sortable: true, filter: true },
                    { field: 'sourceDevice', headerName: 'Source', sortable: true },
                    { field: 'targetAsset', headerName: 'Target', sortable: true },
                    {
                        field: 'timeToResolve',
                        headerName: 'Time to Resolve',
                        sortable: true,
                        valueFormatter: (params) => params.value ? formatDuration(params.value * 1000) : 'N/A',
                    },
                ];
            case 'vulnerabilities':
                return [
                    { field: 'title', headerName: 'Vulnerability', sortable: true, filter: true, pinned: 'left' },
                    { field: 'cveId', headerName: 'CVE ID', sortable: true, filter: true },
                    { field: 'severity', headerName: 'Severity', sortable: true, filter: true },
                    { field: 'cvssScore', headerName: 'CVSS Score', sortable: true },
                    { field: 'status', headerName: 'Status', sortable: true, filter: true },
                    { field: 'affectedCount', headerName: 'Affected', sortable: true },
                    { field: 'exploitability', headerName: 'Exploitability', sortable: true, filter: true },
                    { field: 'patchAvailable', headerName: 'Patch Available', sortable: true },
                    { field: 'remediationStatus', headerName: 'Remediation', sortable: true, filter: true },
                    {
                        field: 'discoveredAt',
                        headerName: 'Discovered',
                        sortable: true,
                        valueFormatter: (params) => formatDate(params.value),
                    },
                    {
                        field: 'targetRemediationDate',
                        headerName: 'Target Date',
                        sortable: true,
                        valueFormatter: (params) => params.value ? formatDate(params.value) : 'Not set',
                    },
                ];
            default:
                return [];
        }
    }, [state.selectedTab]);
    // Helper functions
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    };
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNzU0Ny40OGVlMTI3NzNjMmM3YWVkMDM4Ni5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQStEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwQjtBQUNFO0FBQzVCO0FBQ0E7QUFDQTtBQUNPLHVCQUF1Qix5S0FBeUs7QUFDdk07QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLG1EQUFJO0FBQ2pDLHlCQUF5QixtREFBSTtBQUM3Qix1QkFBdUIsbURBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLCtDQUErQyx1QkFBdUI7QUFDdEUsWUFBWSx1REFBSyxVQUFVLHdHQUF3RyxzREFBSSxVQUFVLCtEQUErRCxzREFBSSxXQUFXLHFFQUFxRSxHQUFHLElBQUksc0RBQUksVUFBVSwwSEFBMEgsc0RBQUksVUFBVSxnQ0FBZ0MsVUFBVSxXQUFXLElBQUkseUVBQXlFLHNEQUFJLFVBQVUscUVBQXFFLHNEQUFJLFdBQVcsc0ZBQXNGLEdBQUcsSUFBSSxHQUFHLElBQUk7QUFDendCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxXQUFXLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRW9DO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNnRTtBQUNwQztBQUNhO0FBQ3pDO0FBQ0E7QUFDQTtBQUNPLHFCQUFxQixxSkFBcUo7QUFDakwsd0NBQXdDLCtDQUFRO0FBQ2hEO0FBQ0EsSUFBSSxnREFBUztBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxnREFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0RBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixtREFBSTtBQUNqQyx5QkFBeUIsbURBQUk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWSx1REFBSyxVQUFVLDJEQUEyRCxzREFBSSxDQUFDLDJEQUFNLElBQUksV0FBVyxtREFBSSxxR0FBcUcsR0FBRyxzREFBSSxZQUFZLDZKQUE2SiwrQkFBK0Isc0RBQUksYUFBYSxpREFBaUQsbURBQUksb01BQW9NLHNEQUFJLENBQUMsMkNBQUMsSUFBSSxrQ0FBa0MsR0FBRyxLQUFLO0FBQ3R1QjtBQUNBLGlFQUFlLFNBQVMsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlENkQ7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3VFO0FBQzNCO0FBQ2hCO0FBQ0E7QUFDMEM7QUFDN0I7QUFDRTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGdzREFBOEM7QUFDbEQsSUFBSSwrckRBQXNEO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0Msd1hBQXdYO0FBQzVaLG9CQUFvQiw2Q0FBTTtBQUMxQixrQ0FBa0MsMkNBQWM7QUFDaEQsa0RBQWtELDJDQUFjO0FBQ2hFLG9CQUFvQiw4Q0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLGdEQUFTO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQSwwQkFBMEIsOENBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLHdCQUF3Qiw4Q0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsbUVBQW1FO0FBQ3JGLGtCQUFrQiw2REFBNkQ7QUFDL0Usa0JBQWtCLHVEQUF1RDtBQUN6RTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLGtEQUFXO0FBQ25DO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSwyQkFBMkIsa0RBQVc7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esa0NBQWtDLGtEQUFXO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLGtEQUFXO0FBQ25DO0FBQ0E7QUFDQSxvQ0FBb0MseUJBQXlCO0FBQzdELGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLDBCQUEwQixrREFBVztBQUNyQztBQUNBO0FBQ0Esb0NBQW9DLHlCQUF5QjtBQUM3RDtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLHNCQUFzQixrREFBVztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOEJBQThCLGtEQUFXO0FBQ3pDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNEJBQTRCLGtEQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNkJBQTZCLG1EQUFJO0FBQ2pDLFlBQVksdURBQUssVUFBVSxxRUFBcUUsdURBQUssVUFBVSw2R0FBNkcsc0RBQUksVUFBVSxnREFBZ0Qsc0RBQUksV0FBVyw0RUFBNEUsc0RBQUksQ0FBQyw0REFBTyxJQUFJLFlBQVksU0FBUyxpQ0FBaUMsUUFBUSxHQUFHLEdBQUcsdURBQUssVUFBVSxxRUFBcUUsc0RBQUksQ0FBQywwREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLDJEQUFNLElBQUksVUFBVTtBQUN6bUI7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLDZFQUE2RSxJQUFJLHNEQUFJLENBQUMsMERBQU0sSUFBSSxzREFBc0Qsc0RBQUksQ0FBQywyREFBTSxJQUFJLFVBQVUsSUFBSSxzREFBSSxDQUFDLHdEQUFHLElBQUksVUFBVSxvSEFBb0gsR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUksbUlBQW1JLG9CQUFvQix1REFBSyxDQUFDLHVEQUFTLElBQUksV0FBVyxzREFBSSxDQUFDLDBEQUFNLElBQUksb0NBQW9DLHNEQUFJLENBQUMsNkRBQVEsSUFBSSxVQUFVLDJGQUEyRixHQUFHLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw2REFBUSxJQUFJLFVBQVUsbUdBQW1HLElBQUksb0JBQW9CLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw0REFBTyxJQUFJLFVBQVUsOEVBQThFLEtBQUssSUFBSSxHQUFHLHVEQUFLLFVBQVUscURBQXFELHNEQUFJLFVBQVUsdU5BQXVOLHNEQUFJLENBQUMsNERBQU8sSUFBSSxzQ0FBc0MsR0FBRyxJQUFJLHNEQUFJLFVBQVUsV0FBVyxtREFBSSxxRUFBcUUsUUFBUSxZQUFZLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSx5YUFBeWEsR0FBRyx1QkFBdUIsdURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEsrRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDMEI7QUFDRTtBQUM1QjtBQUNBO0FBQ0E7QUFDTyxpQkFBaUIsOElBQThJO0FBQ3RLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLG1EQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksdURBQUssV0FBVyw0RkFBNEYsc0RBQUksV0FBVyxXQUFXLG1EQUFJLG9GQUFvRixJQUFJLHNEQUFJLFdBQVcsb0JBQW9CLHlDQUF5QyxzREFBSSxXQUFXLFdBQVcsbURBQUksb0ZBQW9GLDhCQUE4QixzREFBSSxhQUFhLDhDQUE4QyxtREFBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLG1EQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDOzs7Ozs7Ozs7Ozs7O0FDM0RyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDaUM7QUFDb0M7QUFDOUQsMEJBQTBCLHlEQUFNLEdBQUcsc0VBQVEsQ0FBQyxtRkFBcUI7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsS0FBSztBQUN0RCx1Q0FBdUMsS0FBSztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGdCQUFnQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELE1BQU07QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztB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QTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE1BQU0sSUFBSSxhQUFhO0FBQzdDO0FBQ0E7QUFDQSxzQkFBc0IsUUFBUSxJQUFJLGFBQWE7QUFDL0M7QUFDQTtBQUNBLHNCQUFzQixRQUFRO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDamJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUM0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLGdEQUFnRCwrQ0FBUTtBQUN4RCxJQUFJLGdEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxzRUFBZSwyREFBVyxJQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdHlwZXMvbW9kZWxzL3NlY3VyaXR5SW5mcmFzdHJ1Y3R1cmUudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlU2VjdXJpdHlJbmZyYXN0cnVjdHVyZURpc2NvdmVyeUxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZURlYm91bmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICpcbiAqIFByb2dyZXNzIGluZGljYXRvciB3aXRoIHBlcmNlbnRhZ2UgZGlzcGxheSBhbmQgb3B0aW9uYWwgbGFiZWwuXG4gKiBTdXBwb3J0cyBkaWZmZXJlbnQgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFByb2dyZXNzQmFyID0gKHsgdmFsdWUsIG1heCA9IDEwMCwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIHNob3dMYWJlbCA9IHRydWUsIGxhYmVsLCBsYWJlbFBvc2l0aW9uID0gJ2luc2lkZScsIHN0cmlwZWQgPSBmYWxzZSwgYW5pbWF0ZWQgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIENhbGN1bGF0ZSBwZXJjZW50YWdlXG4gICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgKHZhbHVlIC8gbWF4KSAqIDEwMCkpO1xuICAgIC8vIFZhcmlhbnQgY29sb3JzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTYwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi02MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTYwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC02MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi02MDAnLFxuICAgIH07XG4gICAgLy8gQmFja2dyb3VuZCBjb2xvcnNcbiAgICBjb25zdCBiZ0NsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTEwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC0yJyxcbiAgICAgICAgbWQ6ICdoLTQnLFxuICAgICAgICBsZzogJ2gtNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgndy1mdWxsJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCB0cmFja0NsYXNzZXMgPSBjbHN4KCd3LWZ1bGwgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlbicsIGJnQ2xhc3Nlc1t2YXJpYW50XSwgc2l6ZUNsYXNzZXNbc2l6ZV0pO1xuICAgIGNvbnN0IGJhckNsYXNzZXMgPSBjbHN4KCdoLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIGVhc2Utb3V0JywgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIHtcbiAgICAgICAgLy8gU3RyaXBlZCBwYXR0ZXJuXG4gICAgICAgICdiZy1ncmFkaWVudC10by1yIGZyb20tdHJhbnNwYXJlbnQgdmlhLWJsYWNrLzEwIHRvLXRyYW5zcGFyZW50IGJnLVtsZW5ndGg6MXJlbV8xMDAlXSc6IHN0cmlwZWQsXG4gICAgICAgICdhbmltYXRlLXByb2dyZXNzLXN0cmlwZXMnOiBzdHJpcGVkICYmIGFuaW1hdGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsVGV4dCA9IGxhYmVsIHx8IChzaG93TGFiZWwgPyBgJHtNYXRoLnJvdW5kKHBlcmNlbnRhZ2UpfSVgIDogJycpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdvdXRzaWRlJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiB0cmFja0NsYXNzZXMsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXCJhcmlhLXZhbHVlbm93XCI6IHZhbHVlLCBcImFyaWEtdmFsdWVtaW5cIjogMCwgXCJhcmlhLXZhbHVlbWF4XCI6IG1heCwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGJhckNsYXNzZXMsIHN0eWxlOiB7IHdpZHRoOiBgJHtwZXJjZW50YWdlfSVgIH0sIGNoaWxkcmVuOiBsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ2luc2lkZScgJiYgc2l6ZSAhPT0gJ3NtJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgcHgtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtd2hpdGUgd2hpdGVzcGFjZS1ub3dyYXBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSkgfSkgfSldIH0pKTtcbn07XG4vLyBBZGQgYW5pbWF0aW9uIGZvciBzdHJpcGVkIHByb2dyZXNzIGJhcnNcbmNvbnN0IHN0eWxlcyA9IGBcclxuQGtleWZyYW1lcyBwcm9ncmVzcy1zdHJpcGVzIHtcclxuICBmcm9tIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDFyZW0gMDtcclxuICB9XHJcbiAgdG8ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xyXG4gIH1cclxufVxyXG5cclxuLmFuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgYW5pbWF0aW9uOiBwcm9ncmVzcy1zdHJpcGVzIDFzIGxpbmVhciBpbmZpbml0ZTtcclxufVxyXG5gO1xuLy8gSW5qZWN0IHN0eWxlc1xuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmVzcy1iYXItc3R5bGVzJykpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZVNoZWV0LmlkID0gJ3Byb2dyZXNzLWJhci1zdHlsZXMnO1xuICAgIHN0eWxlU2hlZXQudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcbn1cbmV4cG9ydCBkZWZhdWx0IFByb2dyZXNzQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICpcbiAqIFNlYXJjaCBpbnB1dCB3aXRoIGljb24sIGNsZWFyIGJ1dHRvbiwgYW5kIGRlYm91bmNlZCBvbkNoYW5nZS5cbiAqIFVzZWQgZm9yIGZpbHRlcmluZyBsaXN0cyBhbmQgdGFibGVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBTZWFyY2gsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hCYXIgPSAoeyB2YWx1ZTogY29udHJvbGxlZFZhbHVlID0gJycsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBkZWJvdW5jZURlbGF5ID0gMzAwLCBkaXNhYmxlZCA9IGZhbHNlLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpbnB1dFZhbHVlLCBzZXRJbnB1dFZhbHVlXSA9IHVzZVN0YXRlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgLy8gU3luYyB3aXRoIGNvbnRyb2xsZWQgdmFsdWVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgfSwgW2NvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIC8vIERlYm91bmNlZCBvbkNoYW5nZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkNoYW5nZSAmJiBpbnB1dFZhbHVlICE9PSBjb250cm9sbGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVib3VuY2VEZWxheSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW2lucHV0VmFsdWUsIG9uQ2hhbmdlLCBkZWJvdW5jZURlbGF5LCBjb250cm9sbGVkVmFsdWVdKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZV0pO1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtOCB0ZXh0LXNtIHB4LTMnLFxuICAgICAgICBtZDogJ2gtMTAgdGV4dC1iYXNlIHB4LTQnLFxuICAgICAgICBsZzogJ2gtMTIgdGV4dC1sZyBweC01JyxcbiAgICB9O1xuICAgIGNvbnN0IGljb25TaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTQgdy00JyxcbiAgICAgICAgbWQ6ICdoLTUgdy01JyxcbiAgICAgICAgbGc6ICdoLTYgdy02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlcicsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICd3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwJywgJ3BsLTEwIHByLTEwJywgJ2JnLXdoaXRlIHRleHQtZ3JheS05MDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIFxuICAgIC8vIERpc2FibGVkXG4gICAge1xuICAgICAgICAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTUwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgbGVmdC0zIHRleHQtZ3JheS00MDAgcG9pbnRlci1ldmVudHMtbm9uZScsIGljb25TaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogaW5wdXRWYWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUlucHV0Q2hhbmdlLCBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaFwiIH0pLCBpbnB1dFZhbHVlICYmICFkaXNhYmxlZCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IGhhbmRsZUNsZWFyLCBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIHJpZ2h0LTMnLCAndGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcpLCBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBzZWFyY2hcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IGljb25TaXplQ2xhc3Nlc1tzaXplXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIERpc2NvdmVyeSBTdG9yZVxuICpcbiAqIE1hbmFnZXMgZGlzY292ZXJ5IG9wZXJhdGlvbnMsIHJlc3VsdHMsIGFuZCBzdGF0ZS5cbiAqIEhhbmRsZXMgZG9tYWluLCBuZXR3b3JrLCB1c2VyLCBhbmQgYXBwbGljYXRpb24gZGlzY292ZXJ5IHByb2Nlc3Nlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAnenVzdGFuZCc7XG5pbXBvcnQgeyBkZXZ0b29scywgc3Vic2NyaWJlV2l0aFNlbGVjdG9yIH0gZnJvbSAnenVzdGFuZC9taWRkbGV3YXJlJztcbmV4cG9ydCBjb25zdCB1c2VEaXNjb3ZlcnlTdG9yZSA9IGNyZWF0ZSgpKGRldnRvb2xzKHN1YnNjcmliZVdpdGhTZWxlY3Rvcigoc2V0LCBnZXQpID0+ICh7XG4gICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgIG9wZXJhdGlvbnM6IG5ldyBNYXAoKSxcbiAgICByZXN1bHRzOiBuZXcgTWFwKCksXG4gICAgc2VsZWN0ZWRPcGVyYXRpb246IG51bGwsXG4gICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgLy8gQWN0aW9uc1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IGEgbmV3IGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBzdGFydERpc2NvdmVyeTogYXN5bmMgKHR5cGUsIHBhcmFtZXRlcnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBjYW5jZWxsYXRpb25Ub2tlbiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0luaXRpYWxpemluZyBkaXNjb3ZlcnkuLi4nLFxuICAgICAgICAgICAgaXRlbXNEaXNjb3ZlcmVkOiAwLFxuICAgICAgICAgICAgc3RhcnRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBvcGVyYXRpb24gdG8gc3RhdGVcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLnNldChvcGVyYXRpb25JZCwgb3BlcmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTZXR1cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICBjb25zdCBwcm9ncmVzc0NsZWFudXAgPSB3aW5kb3cuZWxlY3Ryb25BUEkub25Qcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIGRhdGEucGVyY2VudGFnZSwgZGF0YS5tZXNzYWdlIHx8ICdQcm9jZXNzaW5nLi4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBkaXNjb3ZlcnkgbW9kdWxlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogYE1vZHVsZXMvRGlzY292ZXJ5LyR7dHlwZX0ucHNtMWAsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBgU3RhcnQtJHt0eXBlfURpc2NvdmVyeWAsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ2xlYW51cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5jb21wbGV0ZURpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmRhdGE/LnJlc3VsdHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BlcmF0aW9uSWQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSBydW5uaW5nIGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBjYW5jZWxEaXNjb3Zlcnk6IGFzeW5jIChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgIGlmICghb3BlcmF0aW9uIHx8IG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKG9wZXJhdGlvbi5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3AgPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICBvcC5tZXNzYWdlID0gJ0Rpc2NvdmVyeSBjYW5jZWxsZWQgYnkgdXNlcic7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJvZ3Jlc3MgZm9yIGEgcnVubmluZyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGVQcm9ncmVzczogKG9wZXJhdGlvbklkLCBwcm9ncmVzcywgbWVzc2FnZSkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gJiYgb3BlcmF0aW9uLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGNvbXBsZXRlZCB3aXRoIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb21wbGV0ZURpc2NvdmVyeTogKG9wZXJhdGlvbklkLCByZXN1bHRzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcmVkICR7cmVzdWx0cy5sZW5ndGh9IGl0ZW1zYDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uaXRlbXNEaXNjb3ZlcmVkID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KG9wZXJhdGlvbklkLCByZXN1bHRzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBmYWlsZWRcbiAgICAgKi9cbiAgICBmYWlsRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIGVycm9yKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcnkgZmFpbGVkOiAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYSBzaW5nbGUgb3BlcmF0aW9uIGFuZCBpdHMgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyT3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbiA9PT0gb3BlcmF0aW9uSWQgPyBudWxsIDogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvcGVyYXRpb25zIGFuZCByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJBbGxPcGVyYXRpb25zOiAoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgY2xlYXIgY29tcGxldGVkLCBmYWlsZWQsIG9yIGNhbmNlbGxlZCBvcGVyYXRpb25zXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgb3BlcmF0aW9uXSBvZiBuZXdPcGVyYXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldE9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBmb3IgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGJ5IG1vZHVsZSBuYW1lIChmb3IgcGVyc2lzdGVudCByZXRyaWV2YWwgYWNyb3NzIGNvbXBvbmVudCByZW1vdW50cylcbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lOiAobW9kdWxlTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQobW9kdWxlTmFtZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBkaXNjb3ZlcnkgcmVzdWx0IChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgYWRkUmVzdWx0OiAocmVzdWx0KSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZXN1bHRzID0gbmV3UmVzdWx0cy5nZXQocmVzdWx0Lm1vZHVsZU5hbWUpIHx8IFtdO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQocmVzdWx0Lm1vZHVsZU5hbWUsIFsuLi5leGlzdGluZ1Jlc3VsdHMsIHJlc3VsdF0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgcmVzdWx0czogbmV3UmVzdWx0cyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwcm9ncmVzcyBpbmZvcm1hdGlvbiAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIHNldFByb2dyZXNzOiAocHJvZ3Jlc3NEYXRhKSA9PiB7XG4gICAgICAgIC8vIEZpbmQgdGhlIGN1cnJlbnQgb3BlcmF0aW9uIGZvciB0aGlzIG1vZHVsZSBhbmQgdXBkYXRlIGl0XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbnMgPSBnZXQoKS5vcGVyYXRpb25zO1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IEFycmF5LmZyb20ob3BlcmF0aW9ucy5rZXlzKCkpLmZpbmQoaWQgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBvcGVyYXRpb25zLmdldChpZCk7XG4gICAgICAgICAgICByZXR1cm4gb3AgJiYgb3AudHlwZSA9PT0gcHJvZ3Jlc3NEYXRhLm1vZHVsZU5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3BlcmF0aW9uSWQpIHtcbiAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBwcm9ncmVzc0RhdGEub3ZlcmFsbFByb2dyZXNzLCBwcm9ncmVzc0RhdGEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxufSkpLCB7XG4gICAgbmFtZTogJ0Rpc2NvdmVyeVN0b3JlJyxcbn0pKTtcbiIsIi8qKlxuICogU2VjdXJpdHkgSW5mcmFzdHJ1Y3R1cmUgRGlzY292ZXJ5IFR5cGUgRGVmaW5pdGlvbnNcbiAqIENvbXByZWhlbnNpdmUgdHlwZXMgZm9yIHNlY3VyaXR5IGluZnJhc3RydWN0dXJlIGRpc2NvdmVyeSBvcGVyYXRpb25zXG4gKi9cbi8qKlxuICogRGVmYXVsdCBjb25maWd1cmF0aW9uIGZhY3RvcnlcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZURlZmF1bHRTZWN1cml0eUNvbmZpZyA9ICgpID0+ICh7XG4gICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgbmFtZTogJ05ldyBTZWN1cml0eSBEaXNjb3ZlcnknLFxuICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICBkaXNjb3ZlckRldmljZXM6IHRydWUsXG4gICAgZGlzY292ZXJQb2xpY2llczogdHJ1ZSxcbiAgICBkaXNjb3ZlckluY2lkZW50czogdHJ1ZSxcbiAgICBkaXNjb3ZlclZ1bG5lcmFiaWxpdGllczogdHJ1ZSxcbiAgICBkZXZpY2VUeXBlczogWydmaXJld2FsbCcsICdpZHMnLCAnaXBzJywgJ3dhZicsICdwcm94eScsICdlbmRwb2ludCcsICdkbHAnLCAnc2llbScsICd2cG4nXSxcbiAgICBuZXR3b3JrUmFuZ2VzOiBbXSxcbiAgICBpbmNsdWRlT2ZmbGluZURldmljZXM6IGZhbHNlLFxuICAgIGluY2x1ZGVEcmFmdFBvbGljaWVzOiBmYWxzZSxcbiAgICBpbmNsdWRlRGVwcmVjYXRlZFBvbGljaWVzOiBmYWxzZSxcbiAgICBjb21wbGlhbmNlRnJhbWV3b3JrczogW10sXG4gICAgaW5jaWRlbnREYXRlUmFuZ2U6IG51bGwsXG4gICAgaW5jbHVkZUNsb3NlZDogZmFsc2UsXG4gICAgbWluU2V2ZXJpdHk6ICdtZWRpdW0nLFxuICAgIHBlcmZvcm1WdWxuZXJhYmlsaXR5U2NhbjogdHJ1ZSxcbiAgICBzY2FuRGVwdGg6ICdzdGFuZGFyZCcsXG4gICAgbWluQ3Zzc1Njb3JlOiA3LjAsXG4gICAgaW5jbHVkZUFjY2VwdGVkUmlza3M6IGZhbHNlLFxuICAgIG1heENvbmN1cnJlbnRSZXF1ZXN0czogNSxcbiAgICB0aW1lb3V0OiAzNjAwLFxuICAgIHRocm90dGxlRGVsYXlNczogMTAwLFxuICAgIGNyZWRlbnRpYWxJZDogbnVsbCxcbiAgICBpc1NjaGVkdWxlZDogZmFsc2UsXG4gICAgc2NoZWR1bGU6IG51bGwsXG4gICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG59KTtcbi8qKlxuICogRGVmYXVsdCBmaWx0ZXIgZmFjdG9yeVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlRGVmYXVsdFNlY3VyaXR5RmlsdGVyID0gKCkgPT4gKHtcbiAgICBkZXZpY2VUeXBlczogbnVsbCxcbiAgICBkZXZpY2VTdGF0dXM6IG51bGwsXG4gICAgaGVhbHRoU3RhdHVzOiBudWxsLFxuICAgIHBvbGljeVR5cGVzOiBudWxsLFxuICAgIHBvbGljeVN0YXR1czogbnVsbCxcbiAgICBjb21wbGlhbmNlU3RhdHVzOiBudWxsLFxuICAgIGluY2lkZW50VHlwZXM6IG51bGwsXG4gICAgaW5jaWRlbnRTZXZlcml0eTogbnVsbCxcbiAgICBpbmNpZGVudFN0YXR1czogbnVsbCxcbiAgICB2dWxuZXJhYmlsaXR5U2V2ZXJpdHk6IG51bGwsXG4gICAgdnVsbmVyYWJpbGl0eVN0YXR1czogbnVsbCxcbiAgICBjdnNzU2NvcmVSYW5nZTogbnVsbCxcbiAgICBoYXNBY3RpdmVFeHBsb2l0czogbnVsbCxcbiAgICBzZWFyY2hRdWVyeTogbnVsbCxcbn0pO1xuIiwiLyoqXG4gKiBTZWN1cml0eSBJbmZyYXN0cnVjdHVyZSBEaXNjb3ZlcnkgVmlldyBMb2dpYyBIb29rXG4gKiBNYW5hZ2VzIHN0YXRlIGFuZCBidXNpbmVzcyBsb2dpYyBmb3Igc2VjdXJpdHkgaW5mcmFzdHJ1Y3R1cmUgZGlzY292ZXJ5IG9wZXJhdGlvbnNcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjcmVhdGVEZWZhdWx0U2VjdXJpdHlDb25maWcsIGNyZWF0ZURlZmF1bHRTZWN1cml0eUZpbHRlciwgfSBmcm9tICcuLi90eXBlcy9tb2RlbHMvc2VjdXJpdHlJbmZyYXN0cnVjdHVyZSc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZSB9IGZyb20gJy4vdXNlRGVib3VuY2UnO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5U3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZSc7XG4vKipcbiAqIFNlY3VyaXR5IEluZnJhc3RydWN0dXJlIERpc2NvdmVyeSBMb2dpYyBIb29rXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTZWN1cml0eUluZnJhc3RydWN0dXJlRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lIH0gPSB1c2VEaXNjb3ZlcnlTdG9yZSgpO1xuICAgIC8vIFN0YXRlXG4gICAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGNvbmZpZzogY3JlYXRlRGVmYXVsdFNlY3VyaXR5Q29uZmlnKCksXG4gICAgICAgIHRlbXBsYXRlczogW10sXG4gICAgICAgIGN1cnJlbnRSZXN1bHQ6IG51bGwsXG4gICAgICAgIGhpc3RvcmljYWxSZXN1bHRzOiBbXSxcbiAgICAgICAgZmlsdGVyOiBjcmVhdGVEZWZhdWx0U2VjdXJpdHlGaWx0ZXIoKSxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgc2VsZWN0ZWRUYWI6ICdvdmVydmlldycsXG4gICAgICAgIHNlbGVjdGVkT2JqZWN0czogW10sXG4gICAgICAgIGVycm9yczogW10sXG4gICAgfSk7XG4gICAgY29uc3QgZGVib3VuY2VkU2VhcmNoID0gdXNlRGVib3VuY2Uoc3RhdGUuc2VhcmNoVGV4dCwgMzAwKTtcbiAgICAvLyBMb2FkIHByZXZpb3VzIGRpc2NvdmVyeSByZXN1bHRzIGZyb20gc3RvcmUgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lKCdTZWN1cml0eUluZnJhc3RydWN0dXJlRGlzY292ZXJ5Jyk7XG4gICAgICAgIGlmIChwcmV2aW91c1Jlc3VsdHMgJiYgcHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU2VjdXJpdHlJbmZyYXN0cnVjdHVyZURpc2NvdmVyeUhvb2tdIFJlc3RvcmluZycsIHByZXZpb3VzUmVzdWx0cy5sZW5ndGgsICdwcmV2aW91cyByZXN1bHRzIGZyb20gc3RvcmUnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdFJlc3VsdCA9IHByZXZpb3VzUmVzdWx0c1twcmV2aW91c1Jlc3VsdHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGN1cnJlbnRSZXN1bHQ6IGxhdGVzdFJlc3VsdCB9KSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZV0pO1xuICAgIC8vIExvYWQgdGVtcGxhdGVzIGFuZCBoaXN0b3JpY2FsIHJlc3VsdHMgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkVGVtcGxhdGVzKCk7XG4gICAgICAgIGxvYWRIaXN0b3JpY2FsUmVzdWx0cygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBTdWJzY3JpYmUgdG8gZGlzY292ZXJ5IHByb2dyZXNzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmUgPSB3aW5kb3cuZWxlY3Ryb25BUEk/Lm9uUHJvZ3Jlc3M/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ3NlY3VyaXR5LWRpc2NvdmVyeScpIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHByb2dyZXNzOiBkYXRhIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBkaXNjb3ZlcnkgdGVtcGxhdGVzXG4gICAgICovXG4gICAgY29uc3QgbG9hZFRlbXBsYXRlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvU2VjdXJpdHlJbmZyYXN0cnVjdHVyZURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtU2VjdXJpdHlEaXNjb3ZlcnlUZW1wbGF0ZXMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHRlbXBsYXRlczogcmVzdWx0LmRhdGEudGVtcGxhdGVzIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHNlY3VyaXR5IGRpc2NvdmVyeSB0ZW1wbGF0ZXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGhpc3RvcmljYWwgZGlzY292ZXJ5IHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkSGlzdG9yaWNhbFJlc3VsdHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L1NlY3VyaXR5SW5mcmFzdHJ1Y3R1cmVEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LVNlY3VyaXR5RGlzY292ZXJ5SGlzdG9yeScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogeyBsaW1pdDogMTAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBoaXN0b3JpY2FsUmVzdWx0czogcmVzdWx0LmRhdGEucmVzdWx0cyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBzZWN1cml0eSBkaXNjb3ZlcnkgaGlzdG9yeTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IHNlY3VyaXR5IGluZnJhc3RydWN0dXJlIGRpc2NvdmVyeVxuICAgICAqL1xuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9TZWN1cml0eUluZnJhc3RydWN0dXJlRGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0ludm9rZS1TZWN1cml0eUluZnJhc3RydWN0dXJlRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IGNvbmZpZzogc3RhdGUuY29uZmlnIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczogeyBzdHJlYW1PdXRwdXQ6IHRydWUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVzdWx0OiByZXN1bHQuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBsb2FkSGlzdG9yaWNhbFJlc3VsdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiBbcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJ10sXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBlcnJvcnM6IFtlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkIHVuZXhwZWN0ZWRseSddLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgb25nb2luZyBkaXNjb3ZlcnlcbiAgICAgKi9cbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKCdzZWN1cml0eS1kaXNjb3ZlcnknKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBzZWN1cml0eSBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMsIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0sXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhIHRlbXBsYXRlXG4gICAgICovXG4gICAgY29uc3QgbG9hZFRlbXBsYXRlID0gdXNlQ2FsbGJhY2soKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4udGVtcGxhdGUuY29uZmlnLCBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSB9LFxuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFNhdmUgY3VycmVudCBjb25maWcgYXMgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBjb25zdCBzYXZlQXNUZW1wbGF0ZSA9IGFzeW5jIChuYW1lLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGUgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogJ2N1c3RvbScsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc1JlYWRPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICAgICAgICBhdXRob3I6IG51bGwsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMCcsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9TZWN1cml0eUluZnJhc3RydWN0dXJlRGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1NhdmUtU2VjdXJpdHlEaXNjb3ZlcnlUZW1wbGF0ZScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogeyB0ZW1wbGF0ZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBsb2FkVGVtcGxhdGVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBzZWN1cml0eSBkaXNjb3ZlcnkgdGVtcGxhdGU6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgZGlzY292ZXJ5IHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb25zdCBleHBvcnRSZXN1bHRzID0gYXN5bmMgKGZvcm1hdCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLmN1cnJlbnRSZXN1bHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvUmVwb3J0aW5nL0V4cG9ydFNlcnZpY2UucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LVNlY3VyaXR5RGlzY292ZXJ5UmVzdWx0cycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6IHN0YXRlLmN1cnJlbnRSZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGV4cG9ydCBzZWN1cml0eSBkaXNjb3ZlcnkgcmVzdWx0czonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBmaWx0ZXJcbiAgICAgKi9cbiAgICBjb25zdCB1cGRhdGVGaWx0ZXIgPSB1c2VDYWxsYmFjaygodXBkYXRlcykgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgZmlsdGVyOiB7IC4uLnByZXYuZmlsdGVyLCAuLi51cGRhdGVzIH0sXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogU2V0IHNlbGVjdGVkIHRhYlxuICAgICAqL1xuICAgIGNvbnN0IHNldFNlbGVjdGVkVGFiID0gdXNlQ2FsbGJhY2soKHRhYikgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHNlbGVjdGVkVGFiOiB0YWIgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBTZXQgc2VhcmNoIHRleHRcbiAgICAgKi9cbiAgICBjb25zdCBzZXRTZWFyY2hUZXh0ID0gdXNlQ2FsbGJhY2soKHRleHQpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBzZWFyY2hUZXh0OiB0ZXh0IH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogR2V0IGZpbHRlcmVkIGRhdGEgYmFzZWQgb24gY3VycmVudCB0YWJcbiAgICAgKi9cbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5jdXJyZW50UmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgZGF0YSA9IFtdO1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLnNlbGVjdGVkVGFiKSB7XG4gICAgICAgICAgICBjYXNlICdkZXZpY2VzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUuY3VycmVudFJlc3VsdC5kZXZpY2VzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncG9saWNpZXMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5jdXJyZW50UmVzdWx0LnBvbGljaWVzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5jaWRlbnRzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUuY3VycmVudFJlc3VsdC5pbmNpZGVudHM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd2dWxuZXJhYmlsaXRpZXMnOlxuICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5jdXJyZW50UmVzdWx0LnZ1bG5lcmFiaWxpdGllcztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCBmaWx0ZXJcbiAgICAgICAgaWYgKGRlYm91bmNlZFNlYXJjaCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBkZWJvdW5jZWRTZWFyY2gudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKChpdGVtKSA9PiBPYmplY3QudmFsdWVzKGl0ZW0pLnNvbWUodmFsdWUgPT4gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IGZpbHRlcnMgYmFzZWQgb24gdGFiXG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ2RldmljZXMnKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLmRldmljZVR5cGVzKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKGRldmljZSkgPT4gc3RhdGUuZmlsdGVyLmRldmljZVR5cGVzPy5pbmNsdWRlcyhkZXZpY2UuZGV2aWNlVHlwZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5kZXZpY2VTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoZGV2aWNlKSA9PiBzdGF0ZS5maWx0ZXIuZGV2aWNlU3RhdHVzPy5pbmNsdWRlcyhkZXZpY2Uub3BlcmF0aW9uYWxTdGF0dXMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRUYWIgPT09ICdpbmNpZGVudHMnICYmIHN0YXRlLmZpbHRlci5pbmNpZGVudFNldmVyaXR5KSB7XG4gICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigoaW5jaWRlbnQpID0+IHN0YXRlLmZpbHRlci5pbmNpZGVudFNldmVyaXR5Py5pbmNsdWRlcyhpbmNpZGVudC5zZXZlcml0eSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFRhYiA9PT0gJ3Z1bG5lcmFiaWxpdGllcycgJiYgc3RhdGUuZmlsdGVyLnZ1bG5lcmFiaWxpdHlTZXZlcml0eSkge1xuICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKHZ1bG4pID0+IHN0YXRlLmZpbHRlci52dWxuZXJhYmlsaXR5U2V2ZXJpdHk/LmluY2x1ZGVzKHZ1bG4uc2V2ZXJpdHkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCBbc3RhdGUuY3VycmVudFJlc3VsdCwgc3RhdGUuc2VsZWN0ZWRUYWIsIGRlYm91bmNlZFNlYXJjaCwgc3RhdGUuZmlsdGVyXSk7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGRlZmluaXRpb25zIGZvciBBRyBHcmlkXG4gICAgICovXG4gICAgY29uc3QgY29sdW1uRGVmcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLnNlbGVjdGVkVGFiKSB7XG4gICAgICAgICAgICBjYXNlICdkZXZpY2VzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdEZXZpY2UgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHBpbm5lZDogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdkZXZpY2VUeXBlJywgaGVhZGVyTmFtZTogJ1R5cGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd2ZW5kb3InLCBoZWFkZXJOYW1lOiAnVmVuZG9yJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnbW9kZWwnLCBoZWFkZXJOYW1lOiAnTW9kZWwnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAndmVyc2lvbicsIGhlYWRlck5hbWU6ICdWZXJzaW9uJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2lwQWRkcmVzcycsIGhlYWRlck5hbWU6ICdJUCBBZGRyZXNzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2xvY2F0aW9uJywgaGVhZGVyTmFtZTogJ0xvY2F0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnb3BlcmF0aW9uYWxTdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnaGVhbHRoU3RhdHVzJywgaGVhZGVyTmFtZTogJ0hlYWx0aCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdyaXNrU2NvcmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Jpc2sgU2NvcmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCR7cGFyYW1zLnZhbHVlfS8xMDBgLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAndnVsbmVyYWJpbGl0aWVzQ291bnQnLCBoZWFkZXJOYW1lOiAnVnVsbmVyYWJpbGl0aWVzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2xpY2Vuc2VTdGF0dXMnLCBoZWFkZXJOYW1lOiAnTGljZW5zZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgY2FzZSAncG9saWNpZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ1BvbGljeSBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgcGlubmVkOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3BvbGljeVR5cGUnLCBoZWFkZXJOYW1lOiAnVHlwZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2NhdGVnb3J5JywgaGVhZGVyTmFtZTogJ0NhdGVnb3J5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2VuZm9yY2VtZW50TW9kZScsIGhlYWRlck5hbWU6ICdFbmZvcmNlbWVudCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2NvbXBsaWFuY2VTdGF0dXMnLCBoZWFkZXJOYW1lOiAnQ29tcGxpYW5jZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3NldmVyaXR5JywgaGVhZGVyTmFtZTogJ1NldmVyaXR5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAncnVsZUNvdW50JywgaGVhZGVyTmFtZTogJ1J1bGVzJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2FjdGl2ZVJ1bGVzJywgaGVhZGVyTmFtZTogJ0FjdGl2ZScsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd2aW9sYXRpb25Db3VudCcsIGhlYWRlck5hbWU6ICdWaW9sYXRpb25zJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdsYXN0TW9kaWZpZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgTW9kaWZpZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gZm9ybWF0RGF0ZShwYXJhbXMudmFsdWUpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnbW9kaWZpZWRCeScsIGhlYWRlck5hbWU6ICdNb2RpZmllZCBCeScsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGNhc2UgJ2luY2lkZW50cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3RpdGxlJywgaGVhZGVyTmFtZTogJ0luY2lkZW50Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgcGlubmVkOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2luY2lkZW50VHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc2V2ZXJpdHknLCBoZWFkZXJOYW1lOiAnU2V2ZXJpdHknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdwcmlvcml0eScsIGhlYWRlck5hbWU6ICdQcmlvcml0eScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3N0YXR1cycsIGhlYWRlck5hbWU6ICdTdGF0dXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkOiAncmlza1Njb3JlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSaXNrIFNjb3JlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAke3BhcmFtcy52YWx1ZX0vMTAwYCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdkZXRlY3RlZEF0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXRlY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBmb3JtYXREYXRlKHBhcmFtcy52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdhc3NpZ25lZFRvJywgaGVhZGVyTmFtZTogJ0Fzc2lnbmVkIFRvJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc291cmNlRGV2aWNlJywgaGVhZGVyTmFtZTogJ1NvdXJjZScsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd0YXJnZXRBc3NldCcsIGhlYWRlck5hbWU6ICdUYXJnZXQnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogJ3RpbWVUb1Jlc29sdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWUgdG8gUmVzb2x2ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBmb3JtYXREdXJhdGlvbihwYXJhbXMudmFsdWUgKiAxMDAwKSA6ICdOL0EnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjYXNlICd2dWxuZXJhYmlsaXRpZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd0aXRsZScsIGhlYWRlck5hbWU6ICdWdWxuZXJhYmlsaXR5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgcGlubmVkOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2N2ZUlkJywgaGVhZGVyTmFtZTogJ0NWRSBJRCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ3NldmVyaXR5JywgaGVhZGVyTmFtZTogJ1NldmVyaXR5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnY3Zzc1Njb3JlJywgaGVhZGVyTmFtZTogJ0NWU1MgU2NvcmUnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2FmZmVjdGVkQ291bnQnLCBoZWFkZXJOYW1lOiAnQWZmZWN0ZWQnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnZXhwbG9pdGFiaWxpdHknLCBoZWFkZXJOYW1lOiAnRXhwbG9pdGFiaWxpdHknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdwYXRjaEF2YWlsYWJsZScsIGhlYWRlck5hbWU6ICdQYXRjaCBBdmFpbGFibGUnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAncmVtZWRpYXRpb25TdGF0dXMnLCBoZWFkZXJOYW1lOiAnUmVtZWRpYXRpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkOiAnZGlzY292ZXJlZEF0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEaXNjb3ZlcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGZvcm1hdERhdGUocGFyYW1zLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICd0YXJnZXRSZW1lZGlhdGlvbkRhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RhcmdldCBEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IGZvcm1hdERhdGUocGFyYW1zLnZhbHVlKSA6ICdOb3Qgc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuc2VsZWN0ZWRUYWJdKTtcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXG4gICAgY29uc3QgZm9ybWF0RGF0ZSA9IChkYXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnICcgKyBkLnRvTG9jYWxlVGltZVN0cmluZygpO1xuICAgIH07XG4gICAgY29uc3QgZm9ybWF0RHVyYXRpb24gPSAobXMpID0+IHtcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobXMgLyAxMDAwKTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MCk7XG4gICAgICAgIGlmIChob3VycyA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBgJHtob3Vyc31oICR7bWludXRlcyAlIDYwfW1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbnV0ZXMgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7bWludXRlc31tICR7c2Vjb25kcyAlIDYwfXNgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGAke3NlY29uZHN9c2A7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIGNvbmZpZzogc3RhdGUuY29uZmlnLFxuICAgICAgICB0ZW1wbGF0ZXM6IHN0YXRlLnRlbXBsYXRlcyxcbiAgICAgICAgY3VycmVudFJlc3VsdDogc3RhdGUuY3VycmVudFJlc3VsdCxcbiAgICAgICAgaGlzdG9yaWNhbFJlc3VsdHM6IHN0YXRlLmhpc3RvcmljYWxSZXN1bHRzLFxuICAgICAgICBmaWx0ZXI6IHN0YXRlLmZpbHRlcixcbiAgICAgICAgc2VhcmNoVGV4dDogc3RhdGUuc2VhcmNoVGV4dCxcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogc3RhdGUuaXNEaXNjb3ZlcmluZyxcbiAgICAgICAgcHJvZ3Jlc3M6IHN0YXRlLnByb2dyZXNzLFxuICAgICAgICBzZWxlY3RlZFRhYjogc3RhdGUuc2VsZWN0ZWRUYWIsXG4gICAgICAgIHNlbGVjdGVkT2JqZWN0czogc3RhdGUuc2VsZWN0ZWRPYmplY3RzLFxuICAgICAgICBlcnJvcnM6IHN0YXRlLmVycm9ycyxcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbkRlZnMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICBsb2FkVGVtcGxhdGUsXG4gICAgICAgIHNhdmVBc1RlbXBsYXRlLFxuICAgICAgICBleHBvcnRSZXN1bHRzLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIHNldFNlbGVjdGVkVGFiLFxuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgIH07XG59O1xuIiwiLyoqXG4gKiBEZWJvdW5jZSBIb29rXG4gKlxuICogUmV0dXJucyBhIGRlYm91bmNlZCB2YWx1ZSB0aGF0IG9ubHkgdXBkYXRlcyBhZnRlciB0aGUgc3BlY2lmaWVkIGRlbGF5LlxuICogVXNlZnVsIGZvciBzZWFyY2ggaW5wdXRzIGFuZCBleHBlbnNpdmUgb3BlcmF0aW9ucy5cbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogRGVib3VuY2UgYSB2YWx1ZVxuICogQHBhcmFtIHZhbHVlIFZhbHVlIHRvIGRlYm91bmNlXG4gKiBAcGFyYW0gZGVsYXkgRGVsYXkgaW4gbWlsbGlzZWNvbmRzIChkZWZhdWx0OiA1MDBtcylcbiAqIEByZXR1cm5zIERlYm91bmNlZCB2YWx1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVib3VuY2UodmFsdWUsIGRlbGF5ID0gNTAwKSB7XG4gICAgY29uc3QgW2RlYm91bmNlZFZhbHVlLCBzZXREZWJvdW5jZWRWYWx1ZV0gPSB1c2VTdGF0ZSh2YWx1ZSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgLy8gU2V0IHVwIGEgdGltZW91dCB0byB1cGRhdGUgdGhlIGRlYm91bmNlZCB2YWx1ZVxuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzZXREZWJvdW5jZWRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgLy8gQ2xlYW51cCB0aW1lb3V0IG9uIHZhbHVlIGNoYW5nZSBvciB1bm1vdW50XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW3ZhbHVlLCBkZWxheV0pO1xuICAgIHJldHVybiBkZWJvdW5jZWRWYWx1ZTtcbn1cbmV4cG9ydCBkZWZhdWx0IHVzZURlYm91bmNlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9