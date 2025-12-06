"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2862],{

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

/***/ 93624:
/*!********************************************************!*\
  !*** ./src/renderer/hooks/useMigrationMappingLogic.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useMigrationMappingLogic: () => (/* binding */ useMigrationMappingLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useMigrationStore */ 2782);
/**
 * Migration Mapping Logic Hook
 *
 * Manages resource mapping functionality including:
 * - Loading and displaying resource mappings
 * - Creating, updating, and deleting mappings
 * - Importing/exporting mappings from files
 * - Auto-mapping resources with fuzzy matching
 * - Conflict resolution
 */


const useMigrationMappingLogic = () => {
    const { selectedWave, mappings, isLoading, error, mapResource, importMappings, exportMappings, autoMapResources, resolveConflict, } = (0,_store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__.useMigrationStore)();
    // Local state
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [selectedMappings, setSelectedMappings] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [filterType, setFilterType] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('all');
    const [filterStatus, setFilterStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('all');
    const [showConflictPanel, setShowConflictPanel] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [selectedConflict, setSelectedConflict] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [exportFormat, setExportFormat] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('csv');
    const [autoMapFuzzy, setAutoMapFuzzy] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
    // Auto-mapping strategy based on fuzzy setting
    const autoMapStrategy = autoMapFuzzy ? 'displayName' : 'upn';
    // Load mappings when selected wave changes
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Mappings are already loaded from the store
    }, [selectedWave?.id]);
    // Filtered mappings based on search and filters
    const filteredMappings = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        let result = mappings;
        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(m => m.type === filterType);
        }
        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter(m => m.status === filterStatus);
        }
        // Search filter
        if ((searchText ?? '').trim()) {
            const searchLower = searchText.toLowerCase();
            result = result.filter(m => (m.sourceName ?? '').toLowerCase().includes(searchLower) ||
                m.targetName?.toLowerCase().includes(searchLower) ||
                (m.sourceId ?? '').toLowerCase().includes(searchLower));
        }
        return result;
    }, [mappings, searchText, filterType, filterStatus]);
    // Count mappings by status
    const statusCounts = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        return {
            total: mappings.length,
            pending: mappings.filter(m => m.status === 'Pending').length,
            mapped: mappings.filter(m => m.status === 'Mapped').length,
            valid: mappings.filter(m => m.status === 'Valid').length,
            invalid: mappings.filter(m => m.status === 'Invalid').length,
            conflicted: mappings.filter(m => m.status === 'Conflicted').length,
            resolved: mappings.filter(m => m.status === 'Resolved').length,
            skipped: mappings.filter(m => m.status === 'Skipped').length,
            conflicts: mappings.filter(m => m.conflicts && m.conflicts.length > 0).length,
        };
    }, [mappings]);
    // AG Grid column definitions
    const columnDefs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'sourceName',
            headerName: 'Source',
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'targetName',
            headerName: 'Target',
            sortable: true,
            filter: true,
            flex: 1,
            minWidth: 200,
        },
        {
            field: 'type',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 120,
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            width: 130,
        },
        {
            field: 'conflicts',
            headerName: 'Conflicts',
            sortable: true,
            width: 110,
            valueGetter: (params) => params.data.conflicts?.length || 0,
        },
    ], []);
    // Event handlers
    const handleImport = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (file) => {
        try {
            await importMappings(file);
        }
        catch (error) {
            console.error('Failed to import mappings:', error);
        }
    }, [importMappings]);
    const handleExport = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave?.id)
            return;
        try {
            await exportMappings(selectedWave.id);
        }
        catch (error) {
            console.error('Failed to export mappings:', error);
        }
    }, [selectedWave, exportFormat, exportMappings]);
    const handleAutoMap = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave?.id)
            return;
        try {
            await autoMapResources(autoMapStrategy);
        }
        catch (error) {
            console.error('Failed to auto-map resources:', error);
        }
    }, [selectedWave, autoMapFuzzy, autoMapResources]);
    const handleResolveConflict = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (mappingId, resolution) => {
        try {
            await resolveConflict(mappingId, resolution);
            setShowConflictPanel(false);
            setSelectedConflict(null);
        }
        catch (error) {
            console.error('Failed to resolve conflict:', error);
        }
    }, [resolveConflict]);
    const handleDeleteMapping = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (mappingId) => {
        if (!confirm('Are you sure you want to delete this mapping?'))
            return;
        try {
            // Remove mapping from local state
            const updatedMappings = mappings.filter(m => m.id !== mappingId);
            // Note: This is a temporary client-side only deletion
            // In a real implementation, this would call a store method to persist the change
            console.log('Mapping deleted locally:', mappingId);
        }
        catch (error) {
            console.error('Failed to delete mapping:', error);
        }
    }, [mappings]);
    const handleShowConflicts = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((mapping) => {
        setSelectedConflict(mapping);
        setShowConflictPanel(true);
    }, []);
    const handleFileUpload = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImport(file);
        }
    }, [handleImport]);
    return {
        // State
        mappings: filteredMappings,
        selectedWave,
        isLoading,
        error,
        searchText,
        selectedMappings,
        filterType,
        filterStatus,
        showConflictPanel,
        selectedConflict,
        exportFormat,
        autoMapFuzzy,
        statusCounts,
        // Column definitions
        columnDefs,
        // Handlers
        setSearchText,
        setSelectedMappings,
        setFilterType,
        setFilterStatus,
        setShowConflictPanel,
        setExportFormat,
        setAutoMapFuzzy,
        handleImport,
        handleExport,
        handleAutoMap,
        handleResolveConflict,
        handleDeleteMapping,
        handleShowConflicts,
        handleFileUpload,
        // Computed
        hasWaveSelected: !!selectedWave,
        hasMappings: mappings.length > 0,
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSx5QkFBeUIsa0RBQVc7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHlCQUF5QixrREFBVztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDBCQUEwQixrREFBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGtDQUFrQyxrREFBVztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLGdDQUFnQyxrREFBVztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsZ0NBQWdDLGtEQUFXO0FBQzNDO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsNkJBQTZCLGtEQUFXO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VNaWdyYXRpb25NYXBwaW5nTG9naWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICpcbiAqIFNlYXJjaCBpbnB1dCB3aXRoIGljb24sIGNsZWFyIGJ1dHRvbiwgYW5kIGRlYm91bmNlZCBvbkNoYW5nZS5cbiAqIFVzZWQgZm9yIGZpbHRlcmluZyBsaXN0cyBhbmQgdGFibGVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBTZWFyY2gsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hCYXIgPSAoeyB2YWx1ZTogY29udHJvbGxlZFZhbHVlID0gJycsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBkZWJvdW5jZURlbGF5ID0gMzAwLCBkaXNhYmxlZCA9IGZhbHNlLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpbnB1dFZhbHVlLCBzZXRJbnB1dFZhbHVlXSA9IHVzZVN0YXRlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgLy8gU3luYyB3aXRoIGNvbnRyb2xsZWQgdmFsdWVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgfSwgW2NvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIC8vIERlYm91bmNlZCBvbkNoYW5nZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkNoYW5nZSAmJiBpbnB1dFZhbHVlICE9PSBjb250cm9sbGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVib3VuY2VEZWxheSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW2lucHV0VmFsdWUsIG9uQ2hhbmdlLCBkZWJvdW5jZURlbGF5LCBjb250cm9sbGVkVmFsdWVdKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZV0pO1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtOCB0ZXh0LXNtIHB4LTMnLFxuICAgICAgICBtZDogJ2gtMTAgdGV4dC1iYXNlIHB4LTQnLFxuICAgICAgICBsZzogJ2gtMTIgdGV4dC1sZyBweC01JyxcbiAgICB9O1xuICAgIGNvbnN0IGljb25TaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTQgdy00JyxcbiAgICAgICAgbWQ6ICdoLTUgdy01JyxcbiAgICAgICAgbGc6ICdoLTYgdy02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlcicsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICd3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwJywgJ3BsLTEwIHByLTEwJywgJ2JnLXdoaXRlIHRleHQtZ3JheS05MDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIFxuICAgIC8vIERpc2FibGVkXG4gICAge1xuICAgICAgICAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTUwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgbGVmdC0zIHRleHQtZ3JheS00MDAgcG9pbnRlci1ldmVudHMtbm9uZScsIGljb25TaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogaW5wdXRWYWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUlucHV0Q2hhbmdlLCBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaFwiIH0pLCBpbnB1dFZhbHVlICYmICFkaXNhYmxlZCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IGhhbmRsZUNsZWFyLCBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIHJpZ2h0LTMnLCAndGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcpLCBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBzZWFyY2hcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IGljb25TaXplQ2xhc3Nlc1tzaXplXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsIi8qKlxuICogTWlncmF0aW9uIE1hcHBpbmcgTG9naWMgSG9va1xuICpcbiAqIE1hbmFnZXMgcmVzb3VyY2UgbWFwcGluZyBmdW5jdGlvbmFsaXR5IGluY2x1ZGluZzpcbiAqIC0gTG9hZGluZyBhbmQgZGlzcGxheWluZyByZXNvdXJjZSBtYXBwaW5nc1xuICogLSBDcmVhdGluZywgdXBkYXRpbmcsIGFuZCBkZWxldGluZyBtYXBwaW5nc1xuICogLSBJbXBvcnRpbmcvZXhwb3J0aW5nIG1hcHBpbmdzIGZyb20gZmlsZXNcbiAqIC0gQXV0by1tYXBwaW5nIHJlc291cmNlcyB3aXRoIGZ1enp5IG1hdGNoaW5nXG4gKiAtIENvbmZsaWN0IHJlc29sdXRpb25cbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VNaWdyYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU1pZ3JhdGlvblN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25NYXBwaW5nTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBzZWxlY3RlZFdhdmUsIG1hcHBpbmdzLCBpc0xvYWRpbmcsIGVycm9yLCBtYXBSZXNvdXJjZSwgaW1wb3J0TWFwcGluZ3MsIGV4cG9ydE1hcHBpbmdzLCBhdXRvTWFwUmVzb3VyY2VzLCByZXNvbHZlQ29uZmxpY3QsIH0gPSB1c2VNaWdyYXRpb25TdG9yZSgpO1xuICAgIC8vIExvY2FsIHN0YXRlXG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtzZWxlY3RlZE1hcHBpbmdzLCBzZXRTZWxlY3RlZE1hcHBpbmdzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbZmlsdGVyVHlwZSwgc2V0RmlsdGVyVHlwZV0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgW2ZpbHRlclN0YXR1cywgc2V0RmlsdGVyU3RhdHVzXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbc2hvd0NvbmZsaWN0UGFuZWwsIHNldFNob3dDb25mbGljdFBhbmVsXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRDb25mbGljdCwgc2V0U2VsZWN0ZWRDb25mbGljdF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZXhwb3J0Rm9ybWF0LCBzZXRFeHBvcnRGb3JtYXRdID0gdXNlU3RhdGUoJ2NzdicpO1xuICAgIGNvbnN0IFthdXRvTWFwRnV6enksIHNldEF1dG9NYXBGdXp6eV0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICAvLyBBdXRvLW1hcHBpbmcgc3RyYXRlZ3kgYmFzZWQgb24gZnV6enkgc2V0dGluZ1xuICAgIGNvbnN0IGF1dG9NYXBTdHJhdGVneSA9IGF1dG9NYXBGdXp6eSA/ICdkaXNwbGF5TmFtZScgOiAndXBuJztcbiAgICAvLyBMb2FkIG1hcHBpbmdzIHdoZW4gc2VsZWN0ZWQgd2F2ZSBjaGFuZ2VzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgLy8gTWFwcGluZ3MgYXJlIGFscmVhZHkgbG9hZGVkIGZyb20gdGhlIHN0b3JlXG4gICAgfSwgW3NlbGVjdGVkV2F2ZT8uaWRdKTtcbiAgICAvLyBGaWx0ZXJlZCBtYXBwaW5ncyBiYXNlZCBvbiBzZWFyY2ggYW5kIGZpbHRlcnNcbiAgICBjb25zdCBmaWx0ZXJlZE1hcHBpbmdzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBtYXBwaW5ncztcbiAgICAgICAgLy8gRmlsdGVyIGJ5IHR5cGVcbiAgICAgICAgaWYgKGZpbHRlclR5cGUgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKG0gPT4gbS50eXBlID09PSBmaWx0ZXJUeXBlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBGaWx0ZXIgYnkgc3RhdHVzXG4gICAgICAgIGlmIChmaWx0ZXJTdGF0dXMgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKG0gPT4gbS5zdGF0dXMgPT09IGZpbHRlclN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VhcmNoIGZpbHRlclxuICAgICAgICBpZiAoKHNlYXJjaFRleHQgPz8gJycpLnRyaW0oKSkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKG0gPT4gKG0uc291cmNlTmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikgfHxcbiAgICAgICAgICAgICAgICBtLnRhcmdldE5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgKG0uc291cmNlSWQgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFttYXBwaW5ncywgc2VhcmNoVGV4dCwgZmlsdGVyVHlwZSwgZmlsdGVyU3RhdHVzXSk7XG4gICAgLy8gQ291bnQgbWFwcGluZ3MgYnkgc3RhdHVzXG4gICAgY29uc3Qgc3RhdHVzQ291bnRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbDogbWFwcGluZ3MubGVuZ3RoLFxuICAgICAgICAgICAgcGVuZGluZzogbWFwcGluZ3MuZmlsdGVyKG0gPT4gbS5zdGF0dXMgPT09ICdQZW5kaW5nJykubGVuZ3RoLFxuICAgICAgICAgICAgbWFwcGVkOiBtYXBwaW5ncy5maWx0ZXIobSA9PiBtLnN0YXR1cyA9PT0gJ01hcHBlZCcpLmxlbmd0aCxcbiAgICAgICAgICAgIHZhbGlkOiBtYXBwaW5ncy5maWx0ZXIobSA9PiBtLnN0YXR1cyA9PT0gJ1ZhbGlkJykubGVuZ3RoLFxuICAgICAgICAgICAgaW52YWxpZDogbWFwcGluZ3MuZmlsdGVyKG0gPT4gbS5zdGF0dXMgPT09ICdJbnZhbGlkJykubGVuZ3RoLFxuICAgICAgICAgICAgY29uZmxpY3RlZDogbWFwcGluZ3MuZmlsdGVyKG0gPT4gbS5zdGF0dXMgPT09ICdDb25mbGljdGVkJykubGVuZ3RoLFxuICAgICAgICAgICAgcmVzb2x2ZWQ6IG1hcHBpbmdzLmZpbHRlcihtID0+IG0uc3RhdHVzID09PSAnUmVzb2x2ZWQnKS5sZW5ndGgsXG4gICAgICAgICAgICBza2lwcGVkOiBtYXBwaW5ncy5maWx0ZXIobSA9PiBtLnN0YXR1cyA9PT0gJ1NraXBwZWQnKS5sZW5ndGgsXG4gICAgICAgICAgICBjb25mbGljdHM6IG1hcHBpbmdzLmZpbHRlcihtID0+IG0uY29uZmxpY3RzICYmIG0uY29uZmxpY3RzLmxlbmd0aCA+IDApLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9LCBbbWFwcGluZ3NdKTtcbiAgICAvLyBBRyBHcmlkIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzb3VyY2VOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTb3VyY2UnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgbWluV2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0YXJnZXROYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUYXJnZXQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgbWluV2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0eXBlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY29uZmxpY3RzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb25mbGljdHMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhLmNvbmZsaWN0cz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8vIEV2ZW50IGhhbmRsZXJzXG4gICAgY29uc3QgaGFuZGxlSW1wb3J0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKGZpbGUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGltcG9ydE1hcHBpbmdzKGZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGltcG9ydCBtYXBwaW5nczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbaW1wb3J0TWFwcGluZ3NdKTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc2VsZWN0ZWRXYXZlPy5pZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGV4cG9ydE1hcHBpbmdzKHNlbGVjdGVkV2F2ZS5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IG1hcHBpbmdzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFdhdmUsIGV4cG9ydEZvcm1hdCwgZXhwb3J0TWFwcGluZ3NdKTtcbiAgICBjb25zdCBoYW5kbGVBdXRvTWFwID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkV2F2ZT8uaWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhdXRvTWFwUmVzb3VyY2VzKGF1dG9NYXBTdHJhdGVneSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gYXV0by1tYXAgcmVzb3VyY2VzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFdhdmUsIGF1dG9NYXBGdXp6eSwgYXV0b01hcFJlc291cmNlc10pO1xuICAgIGNvbnN0IGhhbmRsZVJlc29sdmVDb25mbGljdCA9IHVzZUNhbGxiYWNrKGFzeW5jIChtYXBwaW5nSWQsIHJlc29sdXRpb24pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHJlc29sdmVDb25mbGljdChtYXBwaW5nSWQsIHJlc29sdXRpb24pO1xuICAgICAgICAgICAgc2V0U2hvd0NvbmZsaWN0UGFuZWwoZmFsc2UpO1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRDb25mbGljdChudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZXNvbHZlIGNvbmZsaWN0OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZXNvbHZlQ29uZmxpY3RdKTtcbiAgICBjb25zdCBoYW5kbGVEZWxldGVNYXBwaW5nID0gdXNlQ2FsbGJhY2soYXN5bmMgKG1hcHBpbmdJZCkgPT4ge1xuICAgICAgICBpZiAoIWNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBtYXBwaW5nPycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIG1hcHBpbmcgZnJvbSBsb2NhbCBzdGF0ZVxuICAgICAgICAgICAgY29uc3QgdXBkYXRlZE1hcHBpbmdzID0gbWFwcGluZ3MuZmlsdGVyKG0gPT4gbS5pZCAhPT0gbWFwcGluZ0lkKTtcbiAgICAgICAgICAgIC8vIE5vdGU6IFRoaXMgaXMgYSB0ZW1wb3JhcnkgY2xpZW50LXNpZGUgb25seSBkZWxldGlvblxuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNhbGwgYSBzdG9yZSBtZXRob2QgdG8gcGVyc2lzdCB0aGUgY2hhbmdlXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTWFwcGluZyBkZWxldGVkIGxvY2FsbHk6JywgbWFwcGluZ0lkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBkZWxldGUgbWFwcGluZzonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbbWFwcGluZ3NdKTtcbiAgICBjb25zdCBoYW5kbGVTaG93Q29uZmxpY3RzID0gdXNlQ2FsbGJhY2soKG1hcHBpbmcpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRDb25mbGljdChtYXBwaW5nKTtcbiAgICAgICAgc2V0U2hvd0NvbmZsaWN0UGFuZWwodHJ1ZSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGhhbmRsZUZpbGVVcGxvYWQgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdO1xuICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgaGFuZGxlSW1wb3J0KGZpbGUpO1xuICAgICAgICB9XG4gICAgfSwgW2hhbmRsZUltcG9ydF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIG1hcHBpbmdzOiBmaWx0ZXJlZE1hcHBpbmdzLFxuICAgICAgICBzZWxlY3RlZFdhdmUsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNlbGVjdGVkTWFwcGluZ3MsXG4gICAgICAgIGZpbHRlclR5cGUsXG4gICAgICAgIGZpbHRlclN0YXR1cyxcbiAgICAgICAgc2hvd0NvbmZsaWN0UGFuZWwsXG4gICAgICAgIHNlbGVjdGVkQ29uZmxpY3QsXG4gICAgICAgIGV4cG9ydEZvcm1hdCxcbiAgICAgICAgYXV0b01hcEZ1enp5LFxuICAgICAgICBzdGF0dXNDb3VudHMsXG4gICAgICAgIC8vIENvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICBjb2x1bW5EZWZzLFxuICAgICAgICAvLyBIYW5kbGVyc1xuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgICAgICBzZXRTZWxlY3RlZE1hcHBpbmdzLFxuICAgICAgICBzZXRGaWx0ZXJUeXBlLFxuICAgICAgICBzZXRGaWx0ZXJTdGF0dXMsXG4gICAgICAgIHNldFNob3dDb25mbGljdFBhbmVsLFxuICAgICAgICBzZXRFeHBvcnRGb3JtYXQsXG4gICAgICAgIHNldEF1dG9NYXBGdXp6eSxcbiAgICAgICAgaGFuZGxlSW1wb3J0LFxuICAgICAgICBoYW5kbGVFeHBvcnQsXG4gICAgICAgIGhhbmRsZUF1dG9NYXAsXG4gICAgICAgIGhhbmRsZVJlc29sdmVDb25mbGljdCxcbiAgICAgICAgaGFuZGxlRGVsZXRlTWFwcGluZyxcbiAgICAgICAgaGFuZGxlU2hvd0NvbmZsaWN0cyxcbiAgICAgICAgaGFuZGxlRmlsZVVwbG9hZCxcbiAgICAgICAgLy8gQ29tcHV0ZWRcbiAgICAgICAgaGFzV2F2ZVNlbGVjdGVkOiAhIXNlbGVjdGVkV2F2ZSxcbiAgICAgICAgaGFzTWFwcGluZ3M6IG1hcHBpbmdzLmxlbmd0aCA+IDAsXG4gICAgfTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=