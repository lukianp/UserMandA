"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2605],{

/***/ 33523:
/*!***********************************************************!*\
  !*** ./src/renderer/components/molecules/ProgressBar.tsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full', className);
    const trackClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full rounded-full overflow-hidden', bgClasses[variant], sizeClasses[size]);
    const barClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('h-full transition-all duration-300 ease-out', variantClasses[variant], {
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

/***/ 59156:
/*!*************************************************************************!*\
  !*** ./src/renderer/components/molecules/PowerShellExecutionDialog.tsx ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* unused harmony export PowerShellExecutionDialog */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../atoms/Button */ 74160);

/**
 * PowerShell Execution Dialog
 * Displays PowerShell script execution output with controls
 * Inspired by GUI/Windows/PowerShellWindow.xaml
 */



const PowerShellExecutionDialog = ({ isOpen, onClose, scriptName, scriptDescription, logs, isRunning, isCancelling, progress, onStart, onStop, onClear, showStartButton = false, }) => {
    const outputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const [copyFeedback, setCopyFeedback] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [autoScroll, setAutoScroll] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
    // Auto-scroll to bottom when new logs arrive
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (autoScroll && outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);
    // Handle scroll - disable auto-scroll if user scrolls up
    const handleScroll = () => {
        if (outputRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = outputRef.current;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
            setAutoScroll(isAtBottom);
        }
    };
    // Copy all output to clipboard
    const handleCopyAll = async () => {
        const text = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }
        catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    // Export logs to file
    const handleExport = () => {
        const text = logs.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scriptName.replace(/\s+/g, '_')}_${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (!isOpen)
        return null;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h2", { className: "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2", children: [isRunning ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 bg-blue-500 rounded-full animate-pulse" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.CheckCircle, { className: "w-5 h-5 text-green-500" })), scriptName] }), scriptDescription && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: scriptDescription }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "ghost", size: "sm", onClick: onClose, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.X, { className: "w-5 h-5" }), disabled: isRunning })] }), isRunning && progress && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex justify-between text-sm mb-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-600 dark:text-gray-400", children: progress.message }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "font-semibold text-gray-900 dark:text-white", children: [progress.percentage, "%"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress.percentage}%` } }) })] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { ref: outputRef, onScroll: handleScroll, className: "flex-1 overflow-auto p-4 bg-gray-900 dark:bg-black font-mono text-sm", style: { scrollBehavior: 'smooth' }, children: logs.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-500", children: showStartButton
                                ? 'Click "Start Discovery" to begin execution...'
                                : 'Waiting for output...' }) })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-1", children: logs.map((log, index) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `${log.level === 'error'
                                ? 'text-red-400'
                                : log.level === 'warning'
                                    ? 'text-yellow-400'
                                    : log.level === 'success'
                                        ? 'text-green-400'
                                        : 'text-gray-300'}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-gray-500", children: ["[", log.timestamp, "]"] }), " ", log.message] }, index))) })) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-2", children: [showStartButton && !isRunning && onStart && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "primary", size: "sm", onClick: onStart, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Play, { className: "w-4 h-4" }), children: "Start Discovery" })), isRunning && onStop && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "danger", size: "sm", onClick: onStop, disabled: isCancelling, loading: isCancelling, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Square, { className: "w-4 h-4" }), children: isCancelling ? 'Stopping...' : 'Stop' })), !isRunning && logs.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", size: "sm", onClick: handleCopyAll, icon: copyFeedback ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.CheckCircle, { className: "w-4 h-4" }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Copy, { className: "w-4 h-4" }), children: copyFeedback ? 'Copied!' : 'Copy All' }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", size: "sm", onClick: handleExport, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Download, { className: "w-4 h-4" }), children: "Export" }), onClear && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", size: "sm", onClick: onClear, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Trash2, { className: "w-4 h-4" }), children: "Clear" }))] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: [logs.length, " log entries"] }), !autoScroll && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "ghost", size: "sm", onClick: () => {
                                        setAutoScroll(true);
                                        if (outputRef.current) {
                                            outputRef.current.scrollTop = outputRef.current.scrollHeight;
                                        }
                                    }, children: "\u2193 Scroll to Bottom" }))] })] })] }) }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PowerShellExecutionDialog);


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

/***/ 61315:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Badge.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Badge: () => (/* binding */ Badge),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

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
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


/***/ }),

/***/ 79673:
/*!*********************************************************************!*\
  !*** ./src/renderer/hooks/useExchangeDiscoveryLogic.ts + 1 modules ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  useExchangeDiscoveryLogic: () => (/* binding */ useExchangeDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/exchange.ts
/**
 * Exchange Discovery Type Definitions
 * Defines all types for Exchange Online and On-Premises discovery
 */
const DEFAULT_EXCHANGE_CONFIG = {
    discoverMailboxes: true,
    discoverDistributionGroups: true,
    discoverTransportRules: true,
    discoverConnectors: false,
    discoverPublicFolders: false,
    includeArchiveData: true,
    includeMailboxPermissions: true,
    includeMailboxStatistics: true,
    includeMobileDevices: false,
    includeGroupMembership: true,
    includeNestedGroups: false,
    maxConcurrentQueries: 5,
    batchSize: 100,
    throttleDelay: 100,
    exportFormat: 'JSON',
    includeDetailedLogs: false,
};

// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
// EXTERNAL MODULE: ./src/renderer/store/useDiscoveryStore.ts
var useDiscoveryStore = __webpack_require__(92856);
;// ./src/renderer/hooks/useExchangeDiscoveryLogic.ts
/**
 * Exchange Discovery Logic Hook
 * Contains all business logic for Exchange discovery view
 */




/**
 * Parse PowerShell date objects into JavaScript Date objects
 * PowerShell serializes dates as complex objects with DateTime property
 */
const parsePowerShellDate = (dateObj) => {
    if (!dateObj) {
        console.log('[parsePowerShellDate] Received null/undefined');
        return undefined;
    }
    // Handle PowerShell serialized date objects with DateTime property
    if (dateObj.DateTime) {
        console.log('[parsePowerShellDate] Using DateTime property:', dateObj.DateTime);
        return new Date(dateObj.DateTime);
    }
    // Handle Microsoft JSON date format /Date(timestamp)/
    if (dateObj.value && typeof dateObj.value === 'string' && dateObj.value.startsWith('/Date(')) {
        const timestamp = dateObj.value.match(/\/Date\((\d+)\)\//)?.[1];
        console.log('[parsePowerShellDate] Using /Date() timestamp:', timestamp);
        return timestamp ? new Date(parseInt(timestamp)) : undefined;
    }
    // Handle ISO date strings directly
    if (typeof dateObj === 'string') {
        console.log('[parsePowerShellDate] Using ISO string:', dateObj);
        try {
            return new Date(dateObj);
        }
        catch {
            return undefined;
        }
    }
    // Fallback for direct date objects
    console.log('[parsePowerShellDate] Using direct date object conversion');
    try {
        return new Date(dateObj);
    }
    catch {
        return undefined;
    }
};
function useExchangeDiscoveryLogic() {
    // Get selected company profile from store
    const selectedSourceProfile = (0,useProfileStore.useProfileStore)((state) => state.selectedSourceProfile);
    const { addResult: addDiscoveryResult, getResultsByModuleName } = (0,useDiscoveryStore.useDiscoveryStore)();
    // ============================================================================
    // State Management
    // ============================================================================
    const [config, setConfig] = (0,react.useState)(DEFAULT_EXCHANGE_CONFIG);
    const [result, setResult] = (0,react.useState)(null);
    const [progress, setProgress] = (0,react.useState)(null);
    const [isDiscovering, setIsDiscovering] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [logs, setLogs] = (0,react.useState)([]);
    const [showExecutionDialog, setShowExecutionDialog] = (0,react.useState)(false);
    // Templates
    const [templates, setTemplates] = (0,react.useState)([]);
    const [selectedTemplate, setSelectedTemplate] = (0,react.useState)(null);
    // Filters
    const [mailboxFilter, setMailboxFilter] = (0,react.useState)({});
    const [groupFilter, setGroupFilter] = (0,react.useState)({});
    const [ruleFilter, setRuleFilter] = (0,react.useState)({});
    // UI state
    const [selectedTab, setSelectedTab] = (0,react.useState)('overview');
    // ============================================================================
    // Utility Functions
    // ============================================================================
    // Utility function for adding logs
    const addLog = (0,react.useCallback)((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, level }]);
    }, []);
    // ============================================================================
    // Data Fetching
    // ============================================================================
    (0,react.useEffect)(() => {
        loadTemplates();
    }, []);
    // Restore previous discovery results from store on mount
    (0,react.useEffect)(() => {
        const previousResults = getResultsByModuleName('ExchangeDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[ExchangeDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setResult(latestResult.additionalData);
        }
    }, [getResultsByModuleName]);
    // Event handlers for discovery - similar to Azure discovery pattern
    const [currentToken, setCurrentToken] = (0,react.useState)(null);
    (0,react.useEffect)(() => {
        const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
            console.log('[ExchangeDiscoveryHook] Progress event received:', data);
            if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
                // Construct progress message from available properties (no 'message' property on progress events)
                const progressMessage = data.currentPhase
                    ? `${data.currentPhase}${data.itemsProcessed !== undefined && data.totalItems !== undefined ? ` (${data.itemsProcessed}/${data.totalItems})` : ''}`
                    : 'Processing...';
                addLog(progressMessage, 'info');
                setProgress(data);
            }
        });
        const unsubscribeOutput = window.electron.onDiscoveryOutput?.((data) => {
            console.log('[ExchangeDiscoveryHook] Output event received:', data);
            if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
                const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
                addLog(data.message, logLevel);
            }
        });
        const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
            console.log('[ExchangeDiscoveryHook] Complete event received:', data);
            if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
                // ENHANCED: Robust data extraction handling multiple PowerShell output formats
                // PowerShellReturnValue can be: { Success, Data: {...}, RecordCount, ... } OR { success, data: {...} } OR direct data
                const executionResult = data.result;
                const psReturnValue = executionResult?.data || executionResult; // Handle both formats
                console.log('[ExchangeDiscoveryHook] PowerShell return value:', JSON.stringify(psReturnValue).slice(0, 500));
                console.log('[ExchangeDiscoveryHook] PowerShell return value keys:', Object.keys(psReturnValue || {}));
                // Extract the structured data - handle nested Data property or direct structure
                const structuredData = psReturnValue?.Data || psReturnValue?.data || psReturnValue || {};
                console.log('[ExchangeDiscoveryHook] Structured data type:', Array.isArray(structuredData) ? 'Array' : typeof structuredData);
                console.log('[ExchangeDiscoveryHook] Structured data keys:', Array.isArray(structuredData) ? `Array[${structuredData.length}]` : Object.keys(structuredData));
                // Initialize result containers
                let mailboxes = [];
                let distributionGroups = [];
                let transportRules = [];
                let connectors = [];
                let publicFolders = [];
                let mailContacts = [];
                // Handle both flat array (with _DataType) and structured object formats
                if (Array.isArray(structuredData)) {
                    console.log('[ExchangeDiscoveryHook] Processing flat array with _DataType grouping...');
                    // Flat array with _DataType property - group by type
                    mailboxes = structuredData.filter((item) => item._DataType === 'Mailbox' || item._DataType === 'SharedMailbox');
                    distributionGroups = structuredData.filter((item) => item._DataType === 'DistributionGroup');
                    transportRules = structuredData.filter((item) => item._DataType === 'TransportRule');
                    connectors = structuredData.filter((item) => item._DataType === 'Connector');
                    publicFolders = structuredData.filter((item) => item._DataType === 'PublicFolder');
                    mailContacts = structuredData.filter((item) => item._DataType === 'MailContact');
                }
                else {
                    console.log('[ExchangeDiscoveryHook] Processing structured object format...');
                    // Structured object format - extract arrays (handle both camelCase and PascalCase)
                    mailboxes = structuredData.mailboxes || structuredData.Mailboxes || [];
                    distributionGroups = structuredData.distributionGroups || structuredData.DistributionGroups || [];
                    transportRules = structuredData.transportRules || structuredData.TransportRules || [];
                    connectors = structuredData.connectors || structuredData.Connectors || [];
                    publicFolders = structuredData.publicFolders || structuredData.PublicFolders || [];
                    mailContacts = structuredData.mailContacts || structuredData.MailContacts || [];
                }
                console.log('[ExchangeDiscoveryHook] Extracted counts:', {
                    mailboxes: mailboxes.length,
                    distributionGroups: distributionGroups.length,
                    transportRules: transportRules.length,
                    connectors: connectors.length,
                    publicFolders: publicFolders.length,
                    mailContacts: mailContacts.length
                });
                // DEBUG: Log data samples and column field verification
                console.log('[ExchangeDiscoveryHook] ========== DEBUG DATA VERIFICATION ==========');
                console.log('[ExchangeDiscoveryHook] PowerShell return keys:', Object.keys(psReturnValue || {}));
                if (mailboxes.length > 0) {
                    console.log('[ExchangeDiscoveryHook] First mailbox sample:', mailboxes[0]);
                    console.log('[ExchangeDiscoveryHook] First mailbox keys:', Object.keys(mailboxes[0]));
                }
                if (distributionGroups.length > 0) {
                    console.log('[ExchangeDiscoveryHook] First group sample:', distributionGroups[0]);
                    console.log('[ExchangeDiscoveryHook] First group keys:', Object.keys(distributionGroups[0]));
                }
                console.log('[ExchangeDiscoveryHook] Mailbox column fields:', mailboxColumns.map(c => c.field));
                console.log('[ExchangeDiscoveryHook] Group column fields:', groupColumns.map(c => c.field));
                console.log('[ExchangeDiscoveryHook] ========================================');
                // Build the ExchangeDiscoveryResult with all required properties
                const exchangeResult = {
                    // Required metadata properties
                    id: psReturnValue?.id || `exchange-discovery-${Date.now()}`,
                    discoveredBy: 'ExchangeDiscovery',
                    environment: 'Online',
                    // Timing properties - use parsePowerShellDate to handle complex date objects
                    startTime: parsePowerShellDate(psReturnValue?.startTime) || new Date(),
                    endTime: parsePowerShellDate(psReturnValue?.endTime),
                    duration: psReturnValue?.duration || 0,
                    status: 'completed',
                    // Configuration
                    config: config,
                    // Data arrays (using extracted data)
                    mailboxes: mailboxes,
                    distributionGroups: distributionGroups,
                    transportRules: transportRules,
                    connectors: connectors,
                    publicFolders: publicFolders,
                    // Statistics and errors
                    statistics: psReturnValue?.statistics || {
                        totalMailboxes: mailboxes.length,
                        totalDistributionGroups: distributionGroups.length,
                        totalTransportRules: transportRules.length,
                        totalConnectors: connectors.length,
                        totalPublicFolders: publicFolders.length
                    },
                    errors: (psReturnValue?.Errors || []).map((err) => ({
                        message: typeof err === 'string' ? err : err.message || 'Unknown error',
                        timestamp: new Date(),
                        severity: 'error'
                    })),
                    warnings: (psReturnValue?.Warnings || []).map((warn) => ({
                        message: typeof warn === 'string' ? warn : warn.message || 'Unknown warning',
                        timestamp: new Date(),
                        severity: 'warning'
                    })),
                };
                console.log('[ExchangeDiscoveryHook] Final exchangeResult:', exchangeResult);
                console.log('[ExchangeDiscoveryHook] Final exchangeResult.mailboxes:', exchangeResult.mailboxes?.length || 0);
                console.log('[ExchangeDiscoveryHook] Final exchangeResult.distributionGroups:', exchangeResult.distributionGroups?.length || 0);
                setResult(exchangeResult);
                setIsDiscovering(false);
                setProgress(null);
                const mailboxCount = exchangeResult?.mailboxes?.length || 0;
                const groupCount = exchangeResult?.distributionGroups?.length || 0;
                addLog(`Exchange discovery completed: ${mailboxCount} mailboxes, ${groupCount} groups`, 'success');
                // Store result in discovery store for persistence
                const discoveryResult = {
                    id: `exchange-discovery-${Date.now()}`,
                    name: 'Exchange Discovery',
                    moduleName: 'ExchangeDiscovery',
                    displayName: 'Exchange Online Discovery',
                    itemCount: mailboxCount + groupCount,
                    discoveryTime: new Date().toISOString(),
                    duration: data.duration || 0,
                    status: 'Completed',
                    filePath: '',
                    success: true,
                    summary: `Discovered ${mailboxCount} mailboxes, ${groupCount} groups`,
                    errorMessage: '',
                    additionalData: exchangeResult,
                    createdAt: new Date().toISOString(),
                };
                addDiscoveryResult(discoveryResult);
            }
        });
        const unsubscribeError = window.electron.onDiscoveryError((data) => {
            console.log('[ExchangeDiscoveryHook] Error event received:', data);
            if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
                setError(data.error);
                addLog(`Error: ${data.error}`, 'error');
                setIsDiscovering(false);
                setProgress(null);
            }
        });
        return () => {
            if (unsubscribeProgress)
                unsubscribeProgress();
            if (unsubscribeOutput)
                unsubscribeOutput();
            if (unsubscribeComplete)
                unsubscribeComplete();
            if (unsubscribeError)
                unsubscribeError();
        };
    }, [addDiscoveryResult, addLog]);
    const loadTemplates = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
                functionName: 'Get-ExchangeDiscoveryTemplates',
                parameters: {},
            });
            setTemplates(result.data?.templates || []);
        }
        catch (err) {
            console.error('Failed to load templates:', err);
        }
    };
    // ============================================================================
    // Discovery Execution
    // ============================================================================
    const startDiscovery = (0,react.useCallback)(async () => {
        // Check if a profile is selected
        if (!selectedSourceProfile) {
            const errorMessage = 'No company profile selected. Please select a profile first.';
            setError(errorMessage);
            addLog(errorMessage, 'error');
            return;
        }
        console.log(`[ExchangeDiscoveryHook] Starting Exchange discovery for company: ${selectedSourceProfile.companyName}`);
        console.log(`[ExchangeDiscoveryHook] Parameters:`, config);
        setIsDiscovering(true);
        setError(null);
        setLogs([]);
        setShowExecutionDialog(true);
        addLog(`Starting Exchange discovery for ${selectedSourceProfile.companyName}...`, 'info');
        const token = `exchange-discovery-${Date.now()}`;
        setProgress({
            phase: 'initializing',
            phaseLabel: 'Initializing Exchange discovery...',
            percentComplete: 0,
            itemsProcessed: 0,
            totalItems: 0,
            errors: 0,
            warnings: 0,
        });
        try {
            // Use the streaming discovery handler for real-time updates
            const result = await window.electron.executeDiscovery({
                moduleName: 'Exchange',
                parameters: {
                    // Profile information (passed as parameters, not as top-level property)
                    ProfileName: selectedSourceProfile?.companyName || 'Default',
                    TenantId: selectedSourceProfile?.tenantId || '',
                    // Discovery options
                    DiscoverMailboxes: config.discoverMailboxes,
                    DiscoverDistributionGroups: config.discoverDistributionGroups,
                    DiscoverTransportRules: config.discoverTransportRules,
                    DiscoverConnectors: config.discoverConnectors,
                    DiscoverPublicFolders: config.discoverPublicFolders,
                    IncludeArchiveData: config.includeArchiveData,
                    IncludeMailboxPermissions: config.includeMailboxPermissions,
                    IncludeMailboxStatistics: config.includeMailboxStatistics,
                    IncludeMobileDevices: config.includeMobileDevices,
                    IncludeGroupMembership: config.includeGroupMembership,
                    IncludeNestedGroups: config.includeNestedGroups,
                    showWindow: false,
                    timeout: 300000,
                },
                executionId: token,
            });
            if (result.success) {
                console.log(`[ExchangeDiscoveryHook] ✅ Exchange discovery completed successfully`);
                addLog('Exchange discovery completed successfully', 'success');
            }
            else {
                console.error(`[ExchangeDiscoveryHook] ❌ Exchange discovery failed:`, result.error);
                const errorMsg = result.error || 'Discovery failed';
                setError(errorMsg);
                addLog(errorMsg, 'error');
                setIsDiscovering(false);
                setProgress(null);
            }
        }
        catch (err) {
            console.error(`[ExchangeDiscoveryHook] Error:`, err);
            const errorMsg = err instanceof Error ? err.message : 'Discovery failed';
            setError(errorMsg);
            addLog(errorMsg, 'error');
            setIsDiscovering(false);
            setProgress(null);
        }
    }, [config, selectedSourceProfile, addLog]);
    const cancelDiscovery = (0,react.useCallback)(async () => {
        try {
            await window.electron.cancelDiscovery('exchange-discovery');
            setIsDiscovering(false);
            setProgress(null);
        }
        catch (err) {
            console.error('Failed to cancel discovery:', err);
        }
    }, []);
    // ============================================================================
    // Template Management
    // ============================================================================
    const loadTemplate = (0,react.useCallback)((template) => {
        setSelectedTemplate(template);
        setConfig(template.config);
    }, []);
    const saveAsTemplate = (0,react.useCallback)(async (name, description) => {
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
                functionName: 'Save-ExchangeDiscoveryTemplate',
                parameters: {
                    Name: name,
                    Description: description,
                    Config: config,
                },
            });
            await loadTemplates();
        }
        catch (err) {
            console.error('Failed to save template:', err);
            throw err;
        }
    }, [config]);
    // ============================================================================
    // Filtered Data
    // ============================================================================
    const filteredMailboxes = (0,react.useMemo)(() => {
        console.log('[DEBUG filteredMailboxes] ========== START ==========');
        console.log('[DEBUG filteredMailboxes] result exists:', !!result);
        console.log('[DEBUG filteredMailboxes] result?.mailboxes exists:', !!result?.mailboxes);
        console.log('[DEBUG filteredMailboxes] result?.mailboxes type:', typeof result?.mailboxes);
        console.log('[DEBUG filteredMailboxes] result?.mailboxes isArray:', Array.isArray(result?.mailboxes));
        console.log('[DEBUG filteredMailboxes] result?.mailboxes length:', result?.mailboxes?.length);
        console.log('[DEBUG filteredMailboxes] result?.mailboxes[0]:', result?.mailboxes?.[0]);
        // More robust check
        if (!result || !result.mailboxes || !Array.isArray(result.mailboxes) || result.mailboxes.length === 0) {
            console.log('[DEBUG filteredMailboxes] No valid mailbox data, returning []');
            console.log('[DEBUG filteredMailboxes] - result:', !!result);
            console.log('[DEBUG filteredMailboxes] - result.mailboxes:', !!result?.mailboxes);
            console.log('[DEBUG filteredMailboxes] - isArray:', Array.isArray(result?.mailboxes));
            console.log('[DEBUG filteredMailboxes] - length:', result?.mailboxes?.length);
            return [];
        }
        console.log('[DEBUG filteredMailboxes] Filtering', result.mailboxes.length, 'mailboxes');
        const filtered = result.mailboxes.filter((mailbox) => {
            // Search text
            if (mailboxFilter.searchText) {
                const search = mailboxFilter.searchText.toLowerCase();
                const matches = (mailbox.displayName ?? '').toLowerCase().includes(search) ||
                    (mailbox.userPrincipalName ?? '').toLowerCase().includes(search) ||
                    (mailbox.primarySmtpAddress ?? '').toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            // Mailbox types
            if (mailboxFilter.mailboxTypes?.length) {
                if (!mailboxFilter.mailboxTypes.includes(mailbox.mailboxType))
                    return false;
            }
            // Size filters
            if (mailboxFilter.minSize !== undefined && mailbox.totalItemSize < mailboxFilter.minSize) {
                return false;
            }
            if (mailboxFilter.maxSize !== undefined && mailbox.totalItemSize > mailboxFilter.maxSize) {
                return false;
            }
            // Inactive filter
            if (mailboxFilter.isInactive !== undefined && mailbox.isInactive !== mailboxFilter.isInactive) {
                return false;
            }
            // Archive filter
            if (mailboxFilter.hasArchive !== undefined && mailbox.archiveEnabled !== mailboxFilter.hasArchive) {
                return false;
            }
            // Litigation hold
            if (mailboxFilter.hasLitigationHold !== undefined && mailbox.litigationHoldEnabled !== mailboxFilter.hasLitigationHold) {
                return false;
            }
            return true;
        });
        console.log('[DEBUG filteredMailboxes] Filtered result length:', filtered.length);
        console.log('[DEBUG filteredMailboxes] ========== END ==========');
        return filtered;
    }, [result, mailboxFilter]);
    const filteredGroups = (0,react.useMemo)(() => {
        console.log('[DEBUG filteredGroups] result?.distributionGroups length:', result?.distributionGroups?.length || 0);
        if (!result || !result.distributionGroups || !Array.isArray(result.distributionGroups) || result.distributionGroups.length === 0) {
            return [];
        }
        const filtered = result.distributionGroups.filter((group) => {
            if (groupFilter.searchText) {
                const search = groupFilter.searchText.toLowerCase();
                const matches = (group.displayName ?? '').toLowerCase().includes(search) ||
                    (group.primarySmtpAddress ?? '').toLowerCase().includes(search) ||
                    (group.alias ?? '').toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (groupFilter.groupTypes?.length) {
                if (!groupFilter.groupTypes.includes(group.groupType))
                    return false;
            }
            if (groupFilter.minMemberCount !== undefined && group.memberCount < groupFilter.minMemberCount) {
                return false;
            }
            if (groupFilter.maxMemberCount !== undefined && group.memberCount > groupFilter.maxMemberCount) {
                return false;
            }
            if (groupFilter.moderationEnabled !== undefined && group.moderationEnabled !== groupFilter.moderationEnabled) {
                return false;
            }
            if (groupFilter.hiddenFromAddressList !== undefined && group.hiddenFromAddressListsEnabled !== groupFilter.hiddenFromAddressList) {
                return false;
            }
            return true;
        });
        console.log('[DEBUG filteredGroups] Filtered result length:', filtered.length);
        return filtered;
    }, [result, groupFilter]);
    const filteredRules = (0,react.useMemo)(() => {
        if (!result || !result.transportRules || !Array.isArray(result.transportRules) || result.transportRules.length === 0) {
            return [];
        }
        const filtered = result.transportRules.filter((rule) => {
            if (ruleFilter.searchText) {
                const search = ruleFilter.searchText.toLowerCase();
                const matches = (rule.name ?? '').toLowerCase().includes(search) ||
                    rule.description?.toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (ruleFilter.state?.length) {
                if (!ruleFilter.state.includes(rule.state))
                    return false;
            }
            if (ruleFilter.priority) {
                if (ruleFilter.priority.min !== undefined && rule.priority < ruleFilter.priority.min) {
                    return false;
                }
                if (ruleFilter.priority.max !== undefined && rule.priority > ruleFilter.priority.max) {
                    return false;
                }
            }
            return true;
        });
        return filtered;
    }, [result, ruleFilter]);
    // ============================================================================
    // AG Grid Column Definitions
    // ============================================================================
    const mailboxColumns = (0,react.useMemo)(() => [
        {
            field: 'DisplayName', // ✅ PascalCase to match PowerShell output
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 200,
        },
        {
            field: 'UserPrincipalName', // ✅ PascalCase
            headerName: 'UPN',
            sortable: true,
            filter: true,
            width: 250,
        },
        {
            field: 'PrimarySmtpAddress', // ✅ PascalCase
            headerName: 'Email',
            sortable: true,
            filter: true,
            width: 250,
        },
        {
            field: 'MailboxType', // ✅ PascalCase
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 150,
        },
        {
            field: 'TotalItemSize', // ✅ PascalCase
            headerName: 'Size (MB)',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => {
                const value = params.value;
                if (value === null || value === undefined || isNaN(value))
                    return 'N/A';
                return (Number(value) / 1024 / 1024).toFixed(2);
            },
            width: 120,
        },
        {
            field: 'ItemCount', // ✅ PascalCase
            headerName: 'Item Count',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => {
                const value = params.value;
                if (value === null || value === undefined || isNaN(value))
                    return 'N/A';
                return Number(value).toLocaleString();
            },
            width: 120,
        },
        {
            field: 'ArchiveEnabled', // ✅ PascalCase
            headerName: 'Archive',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            width: 100,
        },
        {
            field: 'LitigationHoldEnabled', // ✅ PascalCase
            headerName: 'Litigation Hold',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            width: 140,
        },
        {
            field: 'IsInactive', // ✅ PascalCase
            headerName: 'Status',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Inactive' : 'Active'),
            width: 100,
        },
        {
            field: 'LastLogonTime', // ✅ PascalCase
            headerName: 'Last Logon',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => {
                if (!params.value)
                    return 'Never';
                // Handle PowerShell date format
                if (params.value.value && params.value.value.startsWith('/Date(')) {
                    const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
                    return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
                }
                if (params.value.DateTime) {
                    return new Date(params.value.DateTime).toLocaleDateString();
                }
                return new Date(params.value).toLocaleDateString();
            },
            width: 120,
        },
    ], []);
    const groupColumns = (0,react.useMemo)(() => [
        {
            field: 'DisplayName', // ✅ PascalCase to match PowerShell output
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 200,
        },
        {
            field: 'PrimarySmtpAddress', // ✅ PascalCase
            headerName: 'Email',
            sortable: true,
            filter: true,
            width: 250,
        },
        {
            field: 'GroupType', // ✅ PascalCase
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 120,
        },
        {
            field: 'MemberCount', // ✅ PascalCase
            headerName: 'Members',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: 'ModerationEnabled', // ✅ PascalCase
            headerName: 'Moderation',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            width: 120,
        },
        {
            field: 'HiddenFromAddressListsEnabled', // ✅ PascalCase
            headerName: 'Hidden',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            width: 100,
        },
        {
            field: 'WhenCreated', // ✅ PascalCase
            headerName: 'Created',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => {
                if (!params.value)
                    return 'N/A';
                // Handle PowerShell date format
                if (params.value.value && params.value.value.startsWith('/Date(')) {
                    const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
                    return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
                }
                if (params.value.DateTime) {
                    return new Date(params.value.DateTime).toLocaleDateString();
                }
                return new Date(params.value).toLocaleDateString();
            },
            width: 120,
        },
    ], []);
    const ruleColumns = (0,react.useMemo)(() => [
        {
            field: 'Name', // ✅ PascalCase to match PowerShell output
            headerName: 'Rule Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 250,
        },
        {
            field: 'Description', // ✅ PascalCase
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300,
        },
        {
            field: 'Priority', // ✅ PascalCase
            headerName: 'Priority',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: 'State', // ✅ PascalCase
            headerName: 'State',
            sortable: true,
            filter: true,
            width: 100,
        },
        {
            field: 'CreatedBy', // ✅ PascalCase
            headerName: 'Created By',
            sortable: true,
            filter: true,
            width: 150,
        },
        {
            field: 'CreatedDate', // ✅ PascalCase
            headerName: 'Created',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => {
                if (!params.value)
                    return 'N/A';
                // Handle PowerShell date format
                if (params.value.value && params.value.value.startsWith('/Date(')) {
                    const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
                    return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
                }
                if (params.value.DateTime) {
                    return new Date(params.value.DateTime).toLocaleDateString();
                }
                return new Date(params.value).toLocaleDateString();
            },
            width: 120,
        },
        {
            field: 'ModifiedDate', // ✅ PascalCase
            headerName: 'Modified',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => {
                if (!params.value)
                    return 'N/A';
                // Handle PowerShell date format
                if (params.value.value && params.value.value.startsWith('/Date(')) {
                    const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
                    return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
                }
                if (params.value.DateTime) {
                    return new Date(params.value.DateTime).toLocaleDateString();
                }
                return new Date(params.value).toLocaleDateString();
            },
            width: 120,
        },
    ], []);
    // ============================================================================
    // Export Functionality
    // ============================================================================
    const exportData = (0,react.useCallback)(async (options) => {
        if (!result)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportService.psm1',
                functionName: 'Export-ExchangeDiscoveryData',
                parameters: {
                    Result: result,
                    Options: options,
                },
            });
        }
        catch (err) {
            console.error('Failed to export data:', err);
            throw err;
        }
    }, [result]);
    // ============================================================================
    // Return Hook API
    // ============================================================================
    return {
        // State
        config,
        setConfig,
        result,
        currentResult: result,
        progress,
        isDiscovering,
        error,
        logs,
        showExecutionDialog,
        setShowExecutionDialog,
        // Templates
        templates,
        selectedTemplate,
        loadTemplate,
        saveAsTemplate,
        // Discovery control
        startDiscovery,
        cancelDiscovery,
        // Filtered data
        mailboxes: filteredMailboxes,
        groups: filteredGroups,
        rules: filteredRules,
        // Filters
        mailboxFilter,
        setMailboxFilter,
        groupFilter,
        setGroupFilter,
        ruleFilter,
        setRuleFilter,
        // AG Grid columns
        mailboxColumns,
        groupColumns,
        ruleColumns,
        // Export
        exportData,
        // UI
        selectedTab,
        setSelectedTab,
        // Statistics (from result)
        statistics: result?.statistics,
    };
}


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMjYwNS44MTM1ZTU3MTFiNmZkZmMwN2E3Ni5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQStEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwQjtBQUNFO0FBQzVCO0FBQ0E7QUFDQTtBQUNPLHVCQUF1Qix5S0FBeUs7QUFDdk07QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLDBDQUFJO0FBQ2pDLHlCQUF5QiwwQ0FBSTtBQUM3Qix1QkFBdUIsMENBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLCtDQUErQyx1QkFBdUI7QUFDdEUsWUFBWSx1REFBSyxVQUFVLHdHQUF3RyxzREFBSSxVQUFVLCtEQUErRCxzREFBSSxXQUFXLHFFQUFxRSxHQUFHLElBQUksc0RBQUksVUFBVSwwSEFBMEgsc0RBQUksVUFBVSxnQ0FBZ0MsVUFBVSxXQUFXLElBQUkseUVBQXlFLHNEQUFJLFVBQVUscUVBQXFFLHNEQUFJLFdBQVcsc0ZBQXNGLEdBQUcsSUFBSSxHQUFHLElBQUk7QUFDendCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxXQUFXLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyRTJEO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDMkQ7QUFDeUI7QUFDM0M7QUFDbEMscUNBQXFDLDZJQUE2STtBQUN6TCxzQkFBc0IsNkNBQU07QUFDNUIsNENBQTRDLCtDQUFRO0FBQ3BELHdDQUF3QywrQ0FBUTtBQUNoRDtBQUNBLElBQUksZ0RBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHdDQUF3QztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsY0FBYyxJQUFJLFlBQVk7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxjQUFjLEtBQUssd0JBQXdCLElBQUksWUFBWTtBQUNwRyx3Q0FBd0Msb0JBQW9CO0FBQzVEO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnQ0FBZ0MsR0FBRywrQ0FBK0M7QUFDMUc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHNEQUFJLFVBQVUseUdBQXlHLHVEQUFLLFVBQVUsaUhBQWlILHVEQUFLLFVBQVUsbUhBQW1ILHVEQUFLLFVBQVUsZ0NBQWdDLHVEQUFLLFNBQVMsOEdBQThHLHNEQUFJLFVBQVUsNkRBQTZELE1BQU0sc0RBQUksQ0FBQyxxREFBVyxJQUFJLHFDQUFxQyxpQkFBaUIseUJBQXlCLHNEQUFJLFFBQVEseUZBQXlGLEtBQUssR0FBRyxzREFBSSxDQUFDLGlEQUFNLElBQUksc0RBQXNELHNEQUFJLENBQUMsMkNBQUMsSUFBSSxzQkFBc0Isd0JBQXdCLElBQUksNkJBQTZCLHVEQUFLLFVBQVUsaUZBQWlGLHVEQUFLLFVBQVUsMkRBQTJELHNEQUFJLFdBQVcsMkVBQTJFLEdBQUcsdURBQUssV0FBVyxnR0FBZ0csSUFBSSxHQUFHLHNEQUFJLFVBQVUsNkVBQTZFLHNEQUFJLFVBQVUsZ0ZBQWdGLFVBQVUsb0JBQW9CLE1BQU0sR0FBRyxJQUFJLElBQUksc0RBQUksVUFBVSxvSUFBb0ksMEJBQTBCLGlDQUFpQyxzREFBSSxVQUFVLGdFQUFnRSxzREFBSSxRQUFRO0FBQzUzRDtBQUNBLDJEQUEyRCxHQUFHLE1BQU0sc0RBQUksVUFBVSw0REFBNEQsdURBQUssVUFBVSxjQUFjO0FBQzNLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsY0FBYyx1REFBSyxXQUFXLGlFQUFpRSxzQkFBc0IsWUFBWSxJQUFJLEdBQUcsdURBQUssVUFBVSwrSUFBK0ksdURBQUssVUFBVSxpRkFBaUYsc0RBQUksQ0FBQyxpREFBTSxJQUFJLHdEQUF3RCxzREFBSSxDQUFDLDhDQUFJLElBQUksc0JBQXNCLGdDQUFnQyw0QkFBNEIsc0RBQUksQ0FBQyxpREFBTSxJQUFJLHFHQUFxRyxzREFBSSxDQUFDLGdEQUFNLElBQUksc0JBQXNCLG9EQUFvRCxzQ0FBc0MsdURBQUssQ0FBQyx1REFBUyxJQUFJLFdBQVcsc0RBQUksQ0FBQyxpREFBTSxJQUFJLCtFQUErRSxzREFBSSxDQUFDLHFEQUFXLElBQUksc0JBQXNCLElBQUksc0RBQUksQ0FBQyw4Q0FBSSxJQUFJLHNCQUFzQixvREFBb0QsR0FBRyxzREFBSSxDQUFDLGlEQUFNLElBQUksK0RBQStELHNEQUFJLENBQUMsa0RBQVEsSUFBSSxzQkFBc0IsdUJBQXVCLGVBQWUsc0RBQUksQ0FBQyxpREFBTSxJQUFJLDBEQUEwRCxzREFBSSxDQUFDLGdEQUFNLElBQUksc0JBQXNCLHNCQUFzQixLQUFLLEtBQUssR0FBRyx1REFBSyxVQUFVLGlEQUFpRCx1REFBSyxVQUFVLGdHQUFnRyxtQkFBbUIsc0RBQUksQ0FBQyxpREFBTSxJQUFJO0FBQzFsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyx1Q0FBdUMsS0FBSyxJQUFJLElBQUksR0FBRztBQUM1RjtBQUNBLGlFQUFlLHlCQUF5QixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckU2QztBQUN0RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDdUU7QUFDM0I7QUFDaEI7QUFDQTtBQUMwQztBQUM3QjtBQUNFO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksc3ZEQUE4QztBQUNsRCxJQUFJLDZ2REFBc0Q7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyx3WEFBd1g7QUFDNVosb0JBQW9CLDZDQUFNO0FBQzFCLGtDQUFrQywyQ0FBYztBQUNoRCxrREFBa0QsMkNBQWM7QUFDaEUsb0JBQW9CLDhDQUFPO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksZ0RBQVM7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLDBCQUEwQiw4Q0FBTztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLDhDQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixtRUFBbUU7QUFDckYsa0JBQWtCLDZEQUE2RDtBQUMvRSxrQkFBa0IsdURBQXVEO0FBQ3pFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0Isa0RBQVc7QUFDbkM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDJCQUEyQixrREFBVztBQUN0QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxrQ0FBa0Msa0RBQVc7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0Isa0RBQVc7QUFDbkM7QUFDQTtBQUNBLG9DQUFvQyx5QkFBeUI7QUFDN0QsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsMEJBQTBCLGtEQUFXO0FBQ3JDO0FBQ0E7QUFDQSxvQ0FBb0MseUJBQXlCO0FBQzdEO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0JBQXNCLGtEQUFXO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQSw4QkFBOEIsa0RBQVc7QUFDekM7QUFDQSxLQUFLO0FBQ0w7QUFDQSw0QkFBNEIsa0RBQVc7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSw2QkFBNkIsMENBQUk7QUFDakMsWUFBWSx1REFBSyxVQUFVLHFFQUFxRSx1REFBSyxVQUFVLDZHQUE2RyxzREFBSSxVQUFVLGdEQUFnRCxzREFBSSxXQUFXLDRFQUE0RSxzREFBSSxDQUFDLG1EQUFPLElBQUksWUFBWSxTQUFTLGlDQUFpQyxRQUFRLEdBQUcsR0FBRyx1REFBSyxVQUFVLHFFQUFxRSxzREFBSSxDQUFDLGlEQUFNLElBQUksb0NBQW9DLHNEQUFJLENBQUMsZ0RBQU0sSUFBSSxVQUFVO0FBQ3ptQjtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsNkVBQTZFLElBQUksc0RBQUksQ0FBQyxpREFBTSxJQUFJLHNEQUFzRCxzREFBSSxDQUFDLGdEQUFNLElBQUksVUFBVSxJQUFJLHNEQUFJLENBQUMsNkNBQUcsSUFBSSxVQUFVLG9IQUFvSCxHQUFHLHNEQUFJLENBQUMsaURBQU0sSUFBSSxtSUFBbUksb0JBQW9CLHVEQUFLLENBQUMsdURBQVMsSUFBSSxXQUFXLHNEQUFJLENBQUMsaURBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyxrREFBUSxJQUFJLFVBQVUsMkZBQTJGLEdBQUcsc0RBQUksQ0FBQyxpREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLGtEQUFRLElBQUksVUFBVSxtR0FBbUcsSUFBSSxvQkFBb0Isc0RBQUksQ0FBQyxpREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLGlEQUFPLElBQUksVUFBVSw4RUFBOEUsS0FBSyxJQUFJLEdBQUcsdURBQUssVUFBVSxxREFBcUQsc0RBQUksVUFBVSx1TkFBdU4sc0RBQUksQ0FBQyxtREFBTyxJQUFJLHNDQUFzQyxHQUFHLElBQUksc0RBQUksVUFBVSxXQUFXLDBDQUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxzREFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNsSytEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwQjtBQUNFO0FBQzVCO0FBQ0E7QUFDQTtBQUNPLGlCQUFpQiw4SUFBOEk7QUFDdEs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsMENBQUk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1REFBSyxXQUFXLDRGQUE0RixzREFBSSxXQUFXLFdBQVcsMENBQUksb0ZBQW9GLElBQUksc0RBQUksV0FBVyxvQkFBb0IseUNBQXlDLHNEQUFJLFdBQVcsV0FBVywwQ0FBSSxvRkFBb0YsOEJBQThCLHNEQUFJLGFBQWEsOENBQThDLDBDQUFJO0FBQzdnQjtBQUNBO0FBQ0EsaUJBQWlCLHFDQUFxQyxzREFBSSxVQUFVLFdBQVcsMENBQUk7QUFDbkY7QUFDQTtBQUNBLHFCQUFxQix5REFBeUQsc0RBQUksV0FBVyxtUEFBbVAsR0FBRyxHQUFHLEtBQUs7QUFDM1Y7QUFDQSxpRUFBZSxLQUFLLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0RyQjtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNrRTtBQUNFO0FBQ1Q7QUFDSTtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0Esa0NBQWtDLG1DQUFlO0FBQ2pELFlBQVksd0RBQXdELEVBQUUsdUNBQWlCO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxrQkFBUSxDQUFDLHVCQUF1QjtBQUNoRSxnQ0FBZ0Msa0JBQVE7QUFDeEMsb0NBQW9DLGtCQUFRO0FBQzVDLDhDQUE4QyxrQkFBUTtBQUN0RCw4QkFBOEIsa0JBQVE7QUFDdEMsNEJBQTRCLGtCQUFRO0FBQ3BDLDBEQUEwRCxrQkFBUTtBQUNsRTtBQUNBLHNDQUFzQyxrQkFBUTtBQUM5QyxvREFBb0Qsa0JBQVE7QUFDNUQ7QUFDQSw4Q0FBOEMsa0JBQVEsR0FBRztBQUN6RCwwQ0FBMEMsa0JBQVEsR0FBRztBQUNyRCx3Q0FBd0Msa0JBQVEsR0FBRztBQUNuRDtBQUNBLDBDQUEwQyxrQkFBUTtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixxQkFBVztBQUM5QjtBQUNBLG9DQUFvQywyQkFBMkI7QUFDL0QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksbUJBQVM7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksbUJBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSw0Q0FBNEMsa0JBQVE7QUFDcEQsSUFBSSxtQkFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsa0JBQWtCLEVBQUUsMEVBQTBFLG9CQUFvQixHQUFHLGdCQUFnQixRQUFRO0FBQ3RLO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxnQkFBZ0IsSUFBSSxxQkFBcUIsS0FBSyxnQkFBZ0IsT0FBTztBQUN4SDtBQUNBLGdGQUFnRjtBQUNoRjtBQUNBLG9IQUFvSDtBQUNwSDtBQUNBO0FBQ0E7QUFDQSxzSEFBc0gsc0JBQXNCO0FBQzVJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLDhHQUE4RztBQUM5RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FLFdBQVc7QUFDOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELGNBQWMsYUFBYSxZQUFZO0FBQy9GO0FBQ0E7QUFDQSw4Q0FBOEMsV0FBVztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsY0FBYyxhQUFhLFlBQVk7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLFdBQVc7QUFDNUM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixxQkFBVztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdGQUF3RixrQ0FBa0M7QUFDMUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCxrQ0FBa0M7QUFDcEYsNENBQTRDLFdBQVc7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsNEJBQTRCLHFCQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHFCQUFXO0FBQ3BDO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsMkJBQTJCLHFCQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsaUJBQU87QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDJCQUEyQixpQkFBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTCwwQkFBMEIsaUJBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixpQkFBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0EseUJBQXlCLGlCQUFPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQSx3QkFBd0IsaUJBQU87QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1Bvd2VyU2hlbGxFeGVjdXRpb25EaWFsb2cudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3R5cGVzL21vZGVscy9leGNoYW5nZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VFeGNoYW5nZURpc2NvdmVyeUxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3N0b3JlL3VzZURpc2NvdmVyeVN0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICpcbiAqIFByb2dyZXNzIGluZGljYXRvciB3aXRoIHBlcmNlbnRhZ2UgZGlzcGxheSBhbmQgb3B0aW9uYWwgbGFiZWwuXG4gKiBTdXBwb3J0cyBkaWZmZXJlbnQgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFByb2dyZXNzQmFyID0gKHsgdmFsdWUsIG1heCA9IDEwMCwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIHNob3dMYWJlbCA9IHRydWUsIGxhYmVsLCBsYWJlbFBvc2l0aW9uID0gJ2luc2lkZScsIHN0cmlwZWQgPSBmYWxzZSwgYW5pbWF0ZWQgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIENhbGN1bGF0ZSBwZXJjZW50YWdlXG4gICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgKHZhbHVlIC8gbWF4KSAqIDEwMCkpO1xuICAgIC8vIFZhcmlhbnQgY29sb3JzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTYwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi02MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTYwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC02MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi02MDAnLFxuICAgIH07XG4gICAgLy8gQmFja2dyb3VuZCBjb2xvcnNcbiAgICBjb25zdCBiZ0NsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTEwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC0yJyxcbiAgICAgICAgbWQ6ICdoLTQnLFxuICAgICAgICBsZzogJ2gtNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgndy1mdWxsJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCB0cmFja0NsYXNzZXMgPSBjbHN4KCd3LWZ1bGwgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlbicsIGJnQ2xhc3Nlc1t2YXJpYW50XSwgc2l6ZUNsYXNzZXNbc2l6ZV0pO1xuICAgIGNvbnN0IGJhckNsYXNzZXMgPSBjbHN4KCdoLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIGVhc2Utb3V0JywgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIHtcbiAgICAgICAgLy8gU3RyaXBlZCBwYXR0ZXJuXG4gICAgICAgICdiZy1ncmFkaWVudC10by1yIGZyb20tdHJhbnNwYXJlbnQgdmlhLWJsYWNrLzEwIHRvLXRyYW5zcGFyZW50IGJnLVtsZW5ndGg6MXJlbV8xMDAlXSc6IHN0cmlwZWQsXG4gICAgICAgICdhbmltYXRlLXByb2dyZXNzLXN0cmlwZXMnOiBzdHJpcGVkICYmIGFuaW1hdGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsVGV4dCA9IGxhYmVsIHx8IChzaG93TGFiZWwgPyBgJHtNYXRoLnJvdW5kKHBlcmNlbnRhZ2UpfSVgIDogJycpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdvdXRzaWRlJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiB0cmFja0NsYXNzZXMsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXCJhcmlhLXZhbHVlbm93XCI6IHZhbHVlLCBcImFyaWEtdmFsdWVtaW5cIjogMCwgXCJhcmlhLXZhbHVlbWF4XCI6IG1heCwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGJhckNsYXNzZXMsIHN0eWxlOiB7IHdpZHRoOiBgJHtwZXJjZW50YWdlfSVgIH0sIGNoaWxkcmVuOiBsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ2luc2lkZScgJiYgc2l6ZSAhPT0gJ3NtJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgcHgtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtd2hpdGUgd2hpdGVzcGFjZS1ub3dyYXBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSkgfSkgfSldIH0pKTtcbn07XG4vLyBBZGQgYW5pbWF0aW9uIGZvciBzdHJpcGVkIHByb2dyZXNzIGJhcnNcbmNvbnN0IHN0eWxlcyA9IGBcclxuQGtleWZyYW1lcyBwcm9ncmVzcy1zdHJpcGVzIHtcclxuICBmcm9tIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDFyZW0gMDtcclxuICB9XHJcbiAgdG8ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xyXG4gIH1cclxufVxyXG5cclxuLmFuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgYW5pbWF0aW9uOiBwcm9ncmVzcy1zdHJpcGVzIDFzIGxpbmVhciBpbmZpbml0ZTtcclxufVxyXG5gO1xuLy8gSW5qZWN0IHN0eWxlc1xuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmVzcy1iYXItc3R5bGVzJykpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZVNoZWV0LmlkID0gJ3Byb2dyZXNzLWJhci1zdHlsZXMnO1xuICAgIHN0eWxlU2hlZXQudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcbn1cbmV4cG9ydCBkZWZhdWx0IFByb2dyZXNzQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQb3dlclNoZWxsIEV4ZWN1dGlvbiBEaWFsb2dcbiAqIERpc3BsYXlzIFBvd2VyU2hlbGwgc2NyaXB0IGV4ZWN1dGlvbiBvdXRwdXQgd2l0aCBjb250cm9sc1xuICogSW5zcGlyZWQgYnkgR1VJL1dpbmRvd3MvUG93ZXJTaGVsbFdpbmRvdy54YW1sXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQbGF5LCBTcXVhcmUsIENvcHksIFRyYXNoMiwgWCwgRG93bmxvYWQsIENoZWNrQ2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5leHBvcnQgY29uc3QgUG93ZXJTaGVsbEV4ZWN1dGlvbkRpYWxvZyA9ICh7IGlzT3Blbiwgb25DbG9zZSwgc2NyaXB0TmFtZSwgc2NyaXB0RGVzY3JpcHRpb24sIGxvZ3MsIGlzUnVubmluZywgaXNDYW5jZWxsaW5nLCBwcm9ncmVzcywgb25TdGFydCwgb25TdG9wLCBvbkNsZWFyLCBzaG93U3RhcnRCdXR0b24gPSBmYWxzZSwgfSkgPT4ge1xuICAgIGNvbnN0IG91dHB1dFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbY29weUZlZWRiYWNrLCBzZXRDb3B5RmVlZGJhY2tdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFthdXRvU2Nyb2xsLCBzZXRBdXRvU2Nyb2xsXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIC8vIEF1dG8tc2Nyb2xsIHRvIGJvdHRvbSB3aGVuIG5ldyBsb2dzIGFycml2ZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChhdXRvU2Nyb2xsICYmIG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxUb3AgPSBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9LCBbbG9ncywgYXV0b1Njcm9sbF0pO1xuICAgIC8vIEhhbmRsZSBzY3JvbGwgLSBkaXNhYmxlIGF1dG8tc2Nyb2xsIGlmIHVzZXIgc2Nyb2xscyB1cFxuICAgIGNvbnN0IGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCwgc2Nyb2xsSGVpZ2h0LCBjbGllbnRIZWlnaHQgfSA9IG91dHB1dFJlZi5jdXJyZW50O1xuICAgICAgICAgICAgY29uc3QgaXNBdEJvdHRvbSA9IE1hdGguYWJzKHNjcm9sbEhlaWdodCAtIGNsaWVudEhlaWdodCAtIHNjcm9sbFRvcCkgPCAxMDtcbiAgICAgICAgICAgIHNldEF1dG9TY3JvbGwoaXNBdEJvdHRvbSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENvcHkgYWxsIG91dHB1dCB0byBjbGlwYm9hcmRcbiAgICBjb25zdCBoYW5kbGVDb3B5QWxsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gbG9ncy5tYXAobG9nID0+IGBbJHtsb2cudGltZXN0YW1wfV0gJHtsb2cubWVzc2FnZX1gKS5qb2luKCdcXG4nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICAgICAgc2V0Q29weUZlZWRiYWNrKHRydWUpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb3B5RmVlZGJhY2soZmFsc2UpLCAyMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY29weTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBFeHBvcnQgbG9ncyB0byBmaWxlXG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gbG9ncy5tYXAobG9nID0+IGBbJHtsb2cudGltZXN0YW1wfV0gWyR7bG9nLmxldmVsLnRvVXBwZXJDYXNlKCl9XSAke2xvZy5tZXNzYWdlfWApLmpvaW4oJ1xcbicpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6ICd0ZXh0L3BsYWluJyB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBhLmRvd25sb2FkID0gYCR7c2NyaXB0TmFtZS5yZXBsYWNlKC9cXHMrL2csICdfJyl9XyR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKX0ubG9nYDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgYS5jbGljaygpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGEpO1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfTtcbiAgICBpZiAoIWlzT3BlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1ibGFjay81MCBiYWNrZHJvcC1ibHVyLXNtXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGwgbWF4LXctNXhsIGgtWzgwdmhdIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3ctMnhsIGZsZXggZmxleC1jb2xcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNiBweS00IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtpc1J1bm5pbmcgPyAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIGJnLWJsdWUtNTAwIHJvdW5kZWQtZnVsbCBhbmltYXRlLXB1bHNlXCIgfSkpIDogKF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmVlbi01MDBcIiB9KSksIHNjcmlwdE5hbWVdIH0pLCBzY3JpcHREZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBzY3JpcHREZXNjcmlwdGlvbiB9KSldIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25DbG9zZSwgaWNvbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGRpc2FibGVkOiBpc1J1bm5pbmcgfSldIH0pLCBpc1J1bm5pbmcgJiYgcHJvZ3Jlc3MgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTYgcHktMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiB0ZXh0LXNtIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogcHJvZ3Jlc3MubWVzc2FnZSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFtwcm9ncmVzcy5wZXJjZW50YWdlLCBcIiVcIl0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctZnVsbCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBoLTJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctYmx1ZS02MDAgaC0yIHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDBcIiwgc3R5bGU6IHsgd2lkdGg6IGAke3Byb2dyZXNzLnBlcmNlbnRhZ2V9JWAgfSB9KSB9KV0gfSkpLCBfanN4KFwiZGl2XCIsIHsgcmVmOiBvdXRwdXRSZWYsIG9uU2Nyb2xsOiBoYW5kbGVTY3JvbGwsIGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTQgYmctZ3JheS05MDAgZGFyazpiZy1ibGFjayBmb250LW1vbm8gdGV4dC1zbVwiLCBzdHlsZTogeyBzY3JvbGxCZWhhdmlvcjogJ3Ntb290aCcgfSwgY2hpbGRyZW46IGxvZ3MubGVuZ3RoID09PSAwID8gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwXCIsIGNoaWxkcmVuOiBzaG93U3RhcnRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnQ2xpY2sgXCJTdGFydCBEaXNjb3ZlcnlcIiB0byBiZWdpbiBleGVjdXRpb24uLi4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dhaXRpbmcgZm9yIG91dHB1dC4uLicgfSkgfSkpIDogKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0xXCIsIGNoaWxkcmVuOiBsb2dzLm1hcCgobG9nLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgJHtsb2cubGV2ZWwgPT09ICdlcnJvcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1yZWQtNDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGxvZy5sZXZlbCA9PT0gJ3dhcm5pbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LXllbGxvdy00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGxvZy5sZXZlbCA9PT0gJ3N1Y2Nlc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1ncmVlbi00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTMwMCd9YCwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogW1wiW1wiLCBsb2cudGltZXN0YW1wLCBcIl1cIl0gfSksIFwiIFwiLCBsb2cubWVzc2FnZV0gfSwgaW5kZXgpKSkgfSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNiBweS00IGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yXCIsIGNoaWxkcmVuOiBbc2hvd1N0YXJ0QnV0dG9uICYmICFpc1J1bm5pbmcgJiYgb25TdGFydCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25TdGFydCwgaWNvbjogX2pzeChQbGF5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIlN0YXJ0IERpc2NvdmVyeVwiIH0pKSwgaXNSdW5uaW5nICYmIG9uU3RvcCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJkYW5nZXJcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvblN0b3AsIGRpc2FibGVkOiBpc0NhbmNlbGxpbmcsIGxvYWRpbmc6IGlzQ2FuY2VsbGluZywgaWNvbjogX2pzeChTcXVhcmUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IGlzQ2FuY2VsbGluZyA/ICdTdG9wcGluZy4uLicgOiAnU3RvcCcgfSkpLCAhaXNSdW5uaW5nICYmIGxvZ3MubGVuZ3RoID4gMCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBoYW5kbGVDb3B5QWxsLCBpY29uOiBjb3B5RmVlZGJhY2sgPyBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkgOiBfanN4KENvcHksIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IGNvcHlGZWVkYmFjayA/ICdDb3BpZWQhJyA6ICdDb3B5IEFsbCcgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlRXhwb3J0LCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pLCBvbkNsZWFyICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uQ2xlYXIsIGljb246IF9qc3goVHJhc2gyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIkNsZWFyXCIgfSkpXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtsb2dzLmxlbmd0aCwgXCIgbG9nIGVudHJpZXNcIl0gfSksICFhdXRvU2Nyb2xsICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEF1dG9TY3JvbGwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFJlZi5jdXJyZW50LnNjcm9sbFRvcCA9IG91dHB1dFJlZi5jdXJyZW50LnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjaGlsZHJlbjogXCJcXHUyMTkzIFNjcm9sbCB0byBCb3R0b21cIiB9KSldIH0pXSB9KV0gfSkgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFBvd2VyU2hlbGxFeGVjdXRpb25EaWFsb2c7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIEV4Y2hhbmdlIERpc2NvdmVyeSBUeXBlIERlZmluaXRpb25zXG4gKiBEZWZpbmVzIGFsbCB0eXBlcyBmb3IgRXhjaGFuZ2UgT25saW5lIGFuZCBPbi1QcmVtaXNlcyBkaXNjb3ZlcnlcbiAqL1xuZXhwb3J0IGNvbnN0IERFRkFVTFRfRVhDSEFOR0VfQ09ORklHID0ge1xuICAgIGRpc2NvdmVyTWFpbGJveGVzOiB0cnVlLFxuICAgIGRpc2NvdmVyRGlzdHJpYnV0aW9uR3JvdXBzOiB0cnVlLFxuICAgIGRpc2NvdmVyVHJhbnNwb3J0UnVsZXM6IHRydWUsXG4gICAgZGlzY292ZXJDb25uZWN0b3JzOiBmYWxzZSxcbiAgICBkaXNjb3ZlclB1YmxpY0ZvbGRlcnM6IGZhbHNlLFxuICAgIGluY2x1ZGVBcmNoaXZlRGF0YTogdHJ1ZSxcbiAgICBpbmNsdWRlTWFpbGJveFBlcm1pc3Npb25zOiB0cnVlLFxuICAgIGluY2x1ZGVNYWlsYm94U3RhdGlzdGljczogdHJ1ZSxcbiAgICBpbmNsdWRlTW9iaWxlRGV2aWNlczogZmFsc2UsXG4gICAgaW5jbHVkZUdyb3VwTWVtYmVyc2hpcDogdHJ1ZSxcbiAgICBpbmNsdWRlTmVzdGVkR3JvdXBzOiBmYWxzZSxcbiAgICBtYXhDb25jdXJyZW50UXVlcmllczogNSxcbiAgICBiYXRjaFNpemU6IDEwMCxcbiAgICB0aHJvdHRsZURlbGF5OiAxMDAsXG4gICAgZXhwb3J0Rm9ybWF0OiAnSlNPTicsXG4gICAgaW5jbHVkZURldGFpbGVkTG9nczogZmFsc2UsXG59O1xuIiwiLyoqXG4gKiBFeGNoYW5nZSBEaXNjb3ZlcnkgTG9naWMgSG9va1xuICogQ29udGFpbnMgYWxsIGJ1c2luZXNzIGxvZ2ljIGZvciBFeGNoYW5nZSBkaXNjb3Zlcnkgdmlld1xuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERFRkFVTFRfRVhDSEFOR0VfQ09ORklHLCB9IGZyb20gJy4uL3R5cGVzL21vZGVscy9leGNoYW5nZSc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5U3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZSc7XG4vKipcbiAqIFBhcnNlIFBvd2VyU2hlbGwgZGF0ZSBvYmplY3RzIGludG8gSmF2YVNjcmlwdCBEYXRlIG9iamVjdHNcbiAqIFBvd2VyU2hlbGwgc2VyaWFsaXplcyBkYXRlcyBhcyBjb21wbGV4IG9iamVjdHMgd2l0aCBEYXRlVGltZSBwcm9wZXJ0eVxuICovXG5jb25zdCBwYXJzZVBvd2VyU2hlbGxEYXRlID0gKGRhdGVPYmopID0+IHtcbiAgICBpZiAoIWRhdGVPYmopIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1twYXJzZVBvd2VyU2hlbGxEYXRlXSBSZWNlaXZlZCBudWxsL3VuZGVmaW5lZCcpO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgUG93ZXJTaGVsbCBzZXJpYWxpemVkIGRhdGUgb2JqZWN0cyB3aXRoIERhdGVUaW1lIHByb3BlcnR5XG4gICAgaWYgKGRhdGVPYmouRGF0ZVRpbWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1twYXJzZVBvd2VyU2hlbGxEYXRlXSBVc2luZyBEYXRlVGltZSBwcm9wZXJ0eTonLCBkYXRlT2JqLkRhdGVUaW1lKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGRhdGVPYmouRGF0ZVRpbWUpO1xuICAgIH1cbiAgICAvLyBIYW5kbGUgTWljcm9zb2Z0IEpTT04gZGF0ZSBmb3JtYXQgL0RhdGUodGltZXN0YW1wKS9cbiAgICBpZiAoZGF0ZU9iai52YWx1ZSAmJiB0eXBlb2YgZGF0ZU9iai52YWx1ZSA9PT0gJ3N0cmluZycgJiYgZGF0ZU9iai52YWx1ZS5zdGFydHNXaXRoKCcvRGF0ZSgnKSkge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBkYXRlT2JqLnZhbHVlLm1hdGNoKC9cXC9EYXRlXFwoKFxcZCspXFwpXFwvLyk/LlsxXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1twYXJzZVBvd2VyU2hlbGxEYXRlXSBVc2luZyAvRGF0ZSgpIHRpbWVzdGFtcDonLCB0aW1lc3RhbXApO1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wID8gbmV3IERhdGUocGFyc2VJbnQodGltZXN0YW1wKSkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIEhhbmRsZSBJU08gZGF0ZSBzdHJpbmdzIGRpcmVjdGx5XG4gICAgaWYgKHR5cGVvZiBkYXRlT2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zb2xlLmxvZygnW3BhcnNlUG93ZXJTaGVsbERhdGVdIFVzaW5nIElTTyBzdHJpbmc6JywgZGF0ZU9iaik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGYWxsYmFjayBmb3IgZGlyZWN0IGRhdGUgb2JqZWN0c1xuICAgIGNvbnNvbGUubG9nKCdbcGFyc2VQb3dlclNoZWxsRGF0ZV0gVXNpbmcgZGlyZWN0IGRhdGUgb2JqZWN0IGNvbnZlcnNpb24nKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZU9iaik7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59O1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUV4Y2hhbmdlRGlzY292ZXJ5TG9naWMoKSB7XG4gICAgLy8gR2V0IHNlbGVjdGVkIGNvbXBhbnkgcHJvZmlsZSBmcm9tIHN0b3JlXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICBjb25zdCB7IGFkZFJlc3VsdDogYWRkRGlzY292ZXJ5UmVzdWx0LCBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lIH0gPSB1c2VEaXNjb3ZlcnlTdG9yZSgpO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTdGF0ZSBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZShERUZBVUxUX0VYQ0hBTkdFX0NPTkZJRyk7XG4gICAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtwcm9ncmVzcywgc2V0UHJvZ3Jlc3NdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzRGlzY292ZXJpbmcsIHNldElzRGlzY292ZXJpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2xvZ3MsIHNldExvZ3NdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtzaG93RXhlY3V0aW9uRGlhbG9nLCBzZXRTaG93RXhlY3V0aW9uRGlhbG9nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICAvLyBUZW1wbGF0ZXNcbiAgICBjb25zdCBbdGVtcGxhdGVzLCBzZXRUZW1wbGF0ZXNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtzZWxlY3RlZFRlbXBsYXRlLCBzZXRTZWxlY3RlZFRlbXBsYXRlXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIEZpbHRlcnNcbiAgICBjb25zdCBbbWFpbGJveEZpbHRlciwgc2V0TWFpbGJveEZpbHRlcl0gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW2dyb3VwRmlsdGVyLCBzZXRHcm91cEZpbHRlcl0gPSB1c2VTdGF0ZSh7fSk7XG4gICAgY29uc3QgW3J1bGVGaWx0ZXIsIHNldFJ1bGVGaWx0ZXJdID0gdXNlU3RhdGUoe30pO1xuICAgIC8vIFVJIHN0YXRlXG4gICAgY29uc3QgW3NlbGVjdGVkVGFiLCBzZXRTZWxlY3RlZFRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVXRpbGl0eSBmdW5jdGlvbiBmb3IgYWRkaW5nIGxvZ3NcbiAgICBjb25zdCBhZGRMb2cgPSB1c2VDYWxsYmFjaygobWVzc2FnZSwgbGV2ZWwgPSAnaW5mbycpID0+IHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKTtcbiAgICAgICAgc2V0TG9ncyhwcmV2ID0+IFsuLi5wcmV2LCB7IHRpbWVzdGFtcCwgbWVzc2FnZSwgbGV2ZWwgfV0pO1xuICAgIH0sIFtdKTtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRGF0YSBGZXRjaGluZ1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkVGVtcGxhdGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIFJlc3RvcmUgcHJldmlvdXMgZGlzY292ZXJ5IHJlc3VsdHMgZnJvbSBzdG9yZSBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVzdWx0cyA9IGdldFJlc3VsdHNCeU1vZHVsZU5hbWUoJ0V4Y2hhbmdlRGlzY292ZXJ5Jyk7XG4gICAgICAgIGlmIChwcmV2aW91c1Jlc3VsdHMgJiYgcHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBjb25zdCBsYXRlc3RSZXN1bHQgPSBwcmV2aW91c1Jlc3VsdHNbcHJldmlvdXNSZXN1bHRzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgc2V0UmVzdWx0KGxhdGVzdFJlc3VsdC5hZGRpdGlvbmFsRGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZV0pO1xuICAgIC8vIEV2ZW50IGhhbmRsZXJzIGZvciBkaXNjb3ZlcnkgLSBzaW1pbGFyIHRvIEF6dXJlIGRpc2NvdmVyeSBwYXR0ZXJuXG4gICAgY29uc3QgW2N1cnJlbnRUb2tlbiwgc2V0Q3VycmVudFRva2VuXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlUHJvZ3Jlc3MgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlQcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIFByb2dyZXNzIGV2ZW50IHJlY2VpdmVkOicsIGRhdGEpO1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgJiYgZGF0YS5leGVjdXRpb25JZC5zdGFydHNXaXRoKCdleGNoYW5nZS1kaXNjb3ZlcnktJykpIHtcbiAgICAgICAgICAgICAgICAvLyBDb25zdHJ1Y3QgcHJvZ3Jlc3MgbWVzc2FnZSBmcm9tIGF2YWlsYWJsZSBwcm9wZXJ0aWVzIChubyAnbWVzc2FnZScgcHJvcGVydHkgb24gcHJvZ3Jlc3MgZXZlbnRzKVxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzTWVzc2FnZSA9IGRhdGEuY3VycmVudFBoYXNlXG4gICAgICAgICAgICAgICAgICAgID8gYCR7ZGF0YS5jdXJyZW50UGhhc2V9JHtkYXRhLml0ZW1zUHJvY2Vzc2VkICE9PSB1bmRlZmluZWQgJiYgZGF0YS50b3RhbEl0ZW1zICE9PSB1bmRlZmluZWQgPyBgICgke2RhdGEuaXRlbXNQcm9jZXNzZWR9LyR7ZGF0YS50b3RhbEl0ZW1zfSlgIDogJyd9YFxuICAgICAgICAgICAgICAgICAgICA6ICdQcm9jZXNzaW5nLi4uJztcbiAgICAgICAgICAgICAgICBhZGRMb2cocHJvZ3Jlc3NNZXNzYWdlLCAnaW5mbycpO1xuICAgICAgICAgICAgICAgIHNldFByb2dyZXNzKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVPdXRwdXQgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlPdXRwdXQ/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIE91dHB1dCBldmVudCByZWNlaXZlZDonLCBkYXRhKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkICYmIGRhdGEuZXhlY3V0aW9uSWQuc3RhcnRzV2l0aCgnZXhjaGFuZ2UtZGlzY292ZXJ5LScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9nTGV2ZWwgPSBkYXRhLmxldmVsID09PSAnZXJyb3InID8gJ2Vycm9yJyA6IGRhdGEubGV2ZWwgPT09ICd3YXJuaW5nJyA/ICd3YXJuaW5nJyA6ICdpbmZvJztcbiAgICAgICAgICAgICAgICBhZGRMb2coZGF0YS5tZXNzYWdlLCBsb2dMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZUNvbXBsZXRlID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5Q29tcGxldGUoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBDb21wbGV0ZSBldmVudCByZWNlaXZlZDonLCBkYXRhKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkICYmIGRhdGEuZXhlY3V0aW9uSWQuc3RhcnRzV2l0aCgnZXhjaGFuZ2UtZGlzY292ZXJ5LScpKSB7XG4gICAgICAgICAgICAgICAgLy8gRU5IQU5DRUQ6IFJvYnVzdCBkYXRhIGV4dHJhY3Rpb24gaGFuZGxpbmcgbXVsdGlwbGUgUG93ZXJTaGVsbCBvdXRwdXQgZm9ybWF0c1xuICAgICAgICAgICAgICAgIC8vIFBvd2VyU2hlbGxSZXR1cm5WYWx1ZSBjYW4gYmU6IHsgU3VjY2VzcywgRGF0YTogey4uLn0sIFJlY29yZENvdW50LCAuLi4gfSBPUiB7IHN1Y2Nlc3MsIGRhdGE6IHsuLi59IH0gT1IgZGlyZWN0IGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBleGVjdXRpb25SZXN1bHQgPSBkYXRhLnJlc3VsdDtcbiAgICAgICAgICAgICAgICBjb25zdCBwc1JldHVyblZhbHVlID0gZXhlY3V0aW9uUmVzdWx0Py5kYXRhIHx8IGV4ZWN1dGlvblJlc3VsdDsgLy8gSGFuZGxlIGJvdGggZm9ybWF0c1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBQb3dlclNoZWxsIHJldHVybiB2YWx1ZTonLCBKU09OLnN0cmluZ2lmeShwc1JldHVyblZhbHVlKS5zbGljZSgwLCA1MDApKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10gUG93ZXJTaGVsbCByZXR1cm4gdmFsdWUga2V5czonLCBPYmplY3Qua2V5cyhwc1JldHVyblZhbHVlIHx8IHt9KSk7XG4gICAgICAgICAgICAgICAgLy8gRXh0cmFjdCB0aGUgc3RydWN0dXJlZCBkYXRhIC0gaGFuZGxlIG5lc3RlZCBEYXRhIHByb3BlcnR5IG9yIGRpcmVjdCBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJ1Y3R1cmVkRGF0YSA9IHBzUmV0dXJuVmFsdWU/LkRhdGEgfHwgcHNSZXR1cm5WYWx1ZT8uZGF0YSB8fCBwc1JldHVyblZhbHVlIHx8IHt9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBTdHJ1Y3R1cmVkIGRhdGEgdHlwZTonLCBBcnJheS5pc0FycmF5KHN0cnVjdHVyZWREYXRhKSA/ICdBcnJheScgOiB0eXBlb2Ygc3RydWN0dXJlZERhdGEpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBTdHJ1Y3R1cmVkIGRhdGEga2V5czonLCBBcnJheS5pc0FycmF5KHN0cnVjdHVyZWREYXRhKSA/IGBBcnJheVske3N0cnVjdHVyZWREYXRhLmxlbmd0aH1dYCA6IE9iamVjdC5rZXlzKHN0cnVjdHVyZWREYXRhKSk7XG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSByZXN1bHQgY29udGFpbmVyc1xuICAgICAgICAgICAgICAgIGxldCBtYWlsYm94ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgZGlzdHJpYnV0aW9uR3JvdXBzID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zcG9ydFJ1bGVzID0gW107XG4gICAgICAgICAgICAgICAgbGV0IGNvbm5lY3RvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgcHVibGljRm9sZGVycyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBtYWlsQ29udGFjdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgYm90aCBmbGF0IGFycmF5ICh3aXRoIF9EYXRhVHlwZSkgYW5kIHN0cnVjdHVyZWQgb2JqZWN0IGZvcm1hdHNcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzdHJ1Y3R1cmVkRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIFByb2Nlc3NpbmcgZmxhdCBhcnJheSB3aXRoIF9EYXRhVHlwZSBncm91cGluZy4uLicpO1xuICAgICAgICAgICAgICAgICAgICAvLyBGbGF0IGFycmF5IHdpdGggX0RhdGFUeXBlIHByb3BlcnR5IC0gZ3JvdXAgYnkgdHlwZVxuICAgICAgICAgICAgICAgICAgICBtYWlsYm94ZXMgPSBzdHJ1Y3R1cmVkRGF0YS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uX0RhdGFUeXBlID09PSAnTWFpbGJveCcgfHwgaXRlbS5fRGF0YVR5cGUgPT09ICdTaGFyZWRNYWlsYm94Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbkdyb3VwcyA9IHN0cnVjdHVyZWREYXRhLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5fRGF0YVR5cGUgPT09ICdEaXN0cmlidXRpb25Hcm91cCcpO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRSdWxlcyA9IHN0cnVjdHVyZWREYXRhLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5fRGF0YVR5cGUgPT09ICdUcmFuc3BvcnRSdWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnMgPSBzdHJ1Y3R1cmVkRGF0YS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uX0RhdGFUeXBlID09PSAnQ29ubmVjdG9yJyk7XG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY0ZvbGRlcnMgPSBzdHJ1Y3R1cmVkRGF0YS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uX0RhdGFUeXBlID09PSAnUHVibGljRm9sZGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIG1haWxDb250YWN0cyA9IHN0cnVjdHVyZWREYXRhLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5fRGF0YVR5cGUgPT09ICdNYWlsQ29udGFjdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIFByb2Nlc3Npbmcgc3RydWN0dXJlZCBvYmplY3QgZm9ybWF0Li4uJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN0cnVjdHVyZWQgb2JqZWN0IGZvcm1hdCAtIGV4dHJhY3QgYXJyYXlzIChoYW5kbGUgYm90aCBjYW1lbENhc2UgYW5kIFBhc2NhbENhc2UpXG4gICAgICAgICAgICAgICAgICAgIG1haWxib3hlcyA9IHN0cnVjdHVyZWREYXRhLm1haWxib3hlcyB8fCBzdHJ1Y3R1cmVkRGF0YS5NYWlsYm94ZXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbkdyb3VwcyA9IHN0cnVjdHVyZWREYXRhLmRpc3RyaWJ1dGlvbkdyb3VwcyB8fCBzdHJ1Y3R1cmVkRGF0YS5EaXN0cmlidXRpb25Hcm91cHMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydFJ1bGVzID0gc3RydWN0dXJlZERhdGEudHJhbnNwb3J0UnVsZXMgfHwgc3RydWN0dXJlZERhdGEuVHJhbnNwb3J0UnVsZXMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnMgPSBzdHJ1Y3R1cmVkRGF0YS5jb25uZWN0b3JzIHx8IHN0cnVjdHVyZWREYXRhLkNvbm5lY3RvcnMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY0ZvbGRlcnMgPSBzdHJ1Y3R1cmVkRGF0YS5wdWJsaWNGb2xkZXJzIHx8IHN0cnVjdHVyZWREYXRhLlB1YmxpY0ZvbGRlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgIG1haWxDb250YWN0cyA9IHN0cnVjdHVyZWREYXRhLm1haWxDb250YWN0cyB8fCBzdHJ1Y3R1cmVkRGF0YS5NYWlsQ29udGFjdHMgfHwgW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBFeHRyYWN0ZWQgY291bnRzOicsIHtcbiAgICAgICAgICAgICAgICAgICAgbWFpbGJveGVzOiBtYWlsYm94ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBkaXN0cmlidXRpb25Hcm91cHM6IGRpc3RyaWJ1dGlvbkdyb3Vwcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydFJ1bGVzOiB0cmFuc3BvcnRSdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBwdWJsaWNGb2xkZXJzOiBwdWJsaWNGb2xkZXJzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgbWFpbENvbnRhY3RzOiBtYWlsQ29udGFjdHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gREVCVUc6IExvZyBkYXRhIHNhbXBsZXMgYW5kIGNvbHVtbiBmaWVsZCB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10gPT09PT09PT09PSBERUJVRyBEQVRBIFZFUklGSUNBVElPTiA9PT09PT09PT09Jyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIFBvd2VyU2hlbGwgcmV0dXJuIGtleXM6JywgT2JqZWN0LmtleXMocHNSZXR1cm5WYWx1ZSB8fCB7fSkpO1xuICAgICAgICAgICAgICAgIGlmIChtYWlsYm94ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10gRmlyc3QgbWFpbGJveCBzYW1wbGU6JywgbWFpbGJveGVzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIEZpcnN0IG1haWxib3gga2V5czonLCBPYmplY3Qua2V5cyhtYWlsYm94ZXNbMF0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RyaWJ1dGlvbkdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBGaXJzdCBncm91cCBzYW1wbGU6JywgZGlzdHJpYnV0aW9uR3JvdXBzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIEZpcnN0IGdyb3VwIGtleXM6JywgT2JqZWN0LmtleXMoZGlzdHJpYnV0aW9uR3JvdXBzWzBdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBNYWlsYm94IGNvbHVtbiBmaWVsZHM6JywgbWFpbGJveENvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBHcm91cCBjb2x1bW4gZmllbGRzOicsIGdyb3VwQ29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0nKTtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCB0aGUgRXhjaGFuZ2VEaXNjb3ZlcnlSZXN1bHQgd2l0aCBhbGwgcmVxdWlyZWQgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2hhbmdlUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXF1aXJlZCBtZXRhZGF0YSBwcm9wZXJ0aWVzXG4gICAgICAgICAgICAgICAgICAgIGlkOiBwc1JldHVyblZhbHVlPy5pZCB8fCBgZXhjaGFuZ2UtZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICAgICAgICBkaXNjb3ZlcmVkQnk6ICdFeGNoYW5nZURpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiAnT25saW5lJyxcbiAgICAgICAgICAgICAgICAgICAgLy8gVGltaW5nIHByb3BlcnRpZXMgLSB1c2UgcGFyc2VQb3dlclNoZWxsRGF0ZSB0byBoYW5kbGUgY29tcGxleCBkYXRlIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBwYXJzZVBvd2VyU2hlbGxEYXRlKHBzUmV0dXJuVmFsdWU/LnN0YXJ0VGltZSkgfHwgbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogcGFyc2VQb3dlclNoZWxsRGF0ZShwc1JldHVyblZhbHVlPy5lbmRUaW1lKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IHBzUmV0dXJuVmFsdWU/LmR1cmF0aW9uIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgICAgIC8vIERhdGEgYXJyYXlzICh1c2luZyBleHRyYWN0ZWQgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgbWFpbGJveGVzOiBtYWlsYm94ZXMsXG4gICAgICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbkdyb3VwczogZGlzdHJpYnV0aW9uR3JvdXBzLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRSdWxlczogdHJhbnNwb3J0UnVsZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3RvcnM6IGNvbm5lY3RvcnMsXG4gICAgICAgICAgICAgICAgICAgIHB1YmxpY0ZvbGRlcnM6IHB1YmxpY0ZvbGRlcnMsXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YXRpc3RpY3MgYW5kIGVycm9yc1xuICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWNzOiBwc1JldHVyblZhbHVlPy5zdGF0aXN0aWNzIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsTWFpbGJveGVzOiBtYWlsYm94ZXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxEaXN0cmlidXRpb25Hcm91cHM6IGRpc3RyaWJ1dGlvbkdyb3Vwcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRyYW5zcG9ydFJ1bGVzOiB0cmFuc3BvcnRSdWxlcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbENvbm5lY3RvcnM6IGNvbm5lY3RvcnMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxQdWJsaWNGb2xkZXJzOiBwdWJsaWNGb2xkZXJzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IChwc1JldHVyblZhbHVlPy5FcnJvcnMgfHwgW10pLm1hcCgoZXJyKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdHlwZW9mIGVyciA9PT0gJ3N0cmluZycgPyBlcnIgOiBlcnIubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJ1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzOiAocHNSZXR1cm5WYWx1ZT8uV2FybmluZ3MgfHwgW10pLm1hcCgod2FybikgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHR5cGVvZiB3YXJuID09PSAnc3RyaW5nJyA/IHdhcm4gOiB3YXJuLm1lc3NhZ2UgfHwgJ1Vua25vd24gd2FybmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnXG4gICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBGaW5hbCBleGNoYW5nZVJlc3VsdDonLCBleGNoYW5nZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tFeGNoYW5nZURpc2NvdmVyeUhvb2tdIEZpbmFsIGV4Y2hhbmdlUmVzdWx0Lm1haWxib3hlczonLCBleGNoYW5nZVJlc3VsdC5tYWlsYm94ZXM/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10gRmluYWwgZXhjaGFuZ2VSZXN1bHQuZGlzdHJpYnV0aW9uR3JvdXBzOicsIGV4Y2hhbmdlUmVzdWx0LmRpc3RyaWJ1dGlvbkdyb3Vwcz8ubGVuZ3RoIHx8IDApO1xuICAgICAgICAgICAgICAgIHNldFJlc3VsdChleGNoYW5nZVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgc2V0SXNEaXNjb3ZlcmluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0UHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFpbGJveENvdW50ID0gZXhjaGFuZ2VSZXN1bHQ/Lm1haWxib3hlcz8ubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JvdXBDb3VudCA9IGV4Y2hhbmdlUmVzdWx0Py5kaXN0cmlidXRpb25Hcm91cHM/Lmxlbmd0aCB8fCAwO1xuICAgICAgICAgICAgICAgIGFkZExvZyhgRXhjaGFuZ2UgZGlzY292ZXJ5IGNvbXBsZXRlZDogJHttYWlsYm94Q291bnR9IG1haWxib3hlcywgJHtncm91cENvdW50fSBncm91cHNgLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHJlc3VsdCBpbiBkaXNjb3Zlcnkgc3RvcmUgZm9yIHBlcnNpc3RlbmNlXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogYGV4Y2hhbmdlLWRpc2NvdmVyeS0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0V4Y2hhbmdlIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdFeGNoYW5nZURpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnRXhjaGFuZ2UgT25saW5lIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Db3VudDogbWFpbGJveENvdW50ICsgZ3JvdXBDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgZGlzY292ZXJ5VGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogZGF0YS5kdXJhdGlvbiB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdDb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogJycsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN1bW1hcnk6IGBEaXNjb3ZlcmVkICR7bWFpbGJveENvdW50fSBtYWlsYm94ZXMsICR7Z3JvdXBDb3VudH0gZ3JvdXBzYCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbERhdGE6IGV4Y2hhbmdlUmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFkZERpc2NvdmVyeVJlc3VsdChkaXNjb3ZlcnlSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVFcnJvciA9IHdpbmRvdy5lbGVjdHJvbi5vbkRpc2NvdmVyeUVycm9yKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10gRXJyb3IgZXZlbnQgcmVjZWl2ZWQ6JywgZGF0YSk7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCAmJiBkYXRhLmV4ZWN1dGlvbklkLnN0YXJ0c1dpdGgoJ2V4Y2hhbmdlLWRpc2NvdmVyeS0nKSkge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKGRhdGEuZXJyb3IpO1xuICAgICAgICAgICAgICAgIGFkZExvZyhgRXJyb3I6ICR7ZGF0YS5lcnJvcn1gLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICBzZXRJc0Rpc2NvdmVyaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmVQcm9ncmVzcylcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZVByb2dyZXNzKCk7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmVPdXRwdXQpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVPdXRwdXQoKTtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZUNvbXBsZXRlKVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlQ29tcGxldGUoKTtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZUVycm9yKVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlRXJyb3IoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbYWRkRGlzY292ZXJ5UmVzdWx0LCBhZGRMb2ddKTtcbiAgICBjb25zdCBsb2FkVGVtcGxhdGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9FeGNoYW5nZURpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtRXhjaGFuZ2VEaXNjb3ZlcnlUZW1wbGF0ZXMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUZW1wbGF0ZXMocmVzdWx0LmRhdGE/LnRlbXBsYXRlcyB8fCBbXSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgdGVtcGxhdGVzOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBEaXNjb3ZlcnkgRXhlY3V0aW9uXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiBhIHByb2ZpbGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdObyBjb21wYW55IHByb2ZpbGUgc2VsZWN0ZWQuIFBsZWFzZSBzZWxlY3QgYSBwcm9maWxlIGZpcnN0Lic7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgYWRkTG9nKGVycm9yTWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYFtFeGNoYW5nZURpc2NvdmVyeUhvb2tdIFN0YXJ0aW5nIEV4Y2hhbmdlIGRpc2NvdmVyeSBmb3IgY29tcGFueTogJHtzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWV9YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBQYXJhbWV0ZXJzOmAsIGNvbmZpZyk7XG4gICAgICAgIHNldElzRGlzY292ZXJpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBzZXRMb2dzKFtdKTtcbiAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyh0cnVlKTtcbiAgICAgICAgYWRkTG9nKGBTdGFydGluZyBFeGNoYW5nZSBkaXNjb3ZlcnkgZm9yICR7c2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNvbXBhbnlOYW1lfS4uLmAsICdpbmZvJyk7XG4gICAgICAgIGNvbnN0IHRva2VuID0gYGV4Y2hhbmdlLWRpc2NvdmVyeS0ke0RhdGUubm93KCl9YDtcbiAgICAgICAgc2V0UHJvZ3Jlc3Moe1xuICAgICAgICAgICAgcGhhc2U6ICdpbml0aWFsaXppbmcnLFxuICAgICAgICAgICAgcGhhc2VMYWJlbDogJ0luaXRpYWxpemluZyBFeGNoYW5nZSBkaXNjb3ZlcnkuLi4nLFxuICAgICAgICAgICAgcGVyY2VudENvbXBsZXRlOiAwLFxuICAgICAgICAgICAgaXRlbXNQcm9jZXNzZWQ6IDAsXG4gICAgICAgICAgICB0b3RhbEl0ZW1zOiAwLFxuICAgICAgICAgICAgZXJyb3JzOiAwLFxuICAgICAgICAgICAgd2FybmluZ3M6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBzdHJlYW1pbmcgZGlzY292ZXJ5IGhhbmRsZXIgZm9yIHJlYWwtdGltZSB1cGRhdGVzXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb24uZXhlY3V0ZURpc2NvdmVyeSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogJ0V4Y2hhbmdlJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2ZpbGUgaW5mb3JtYXRpb24gKHBhc3NlZCBhcyBwYXJhbWV0ZXJzLCBub3QgYXMgdG9wLWxldmVsIHByb3BlcnR5KVxuICAgICAgICAgICAgICAgICAgICBQcm9maWxlTmFtZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlPy5jb21wYW55TmFtZSB8fCAnRGVmYXVsdCcsXG4gICAgICAgICAgICAgICAgICAgIFRlbmFudElkOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGU/LnRlbmFudElkIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAvLyBEaXNjb3Zlcnkgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICBEaXNjb3Zlck1haWxib3hlczogY29uZmlnLmRpc2NvdmVyTWFpbGJveGVzLFxuICAgICAgICAgICAgICAgICAgICBEaXNjb3ZlckRpc3RyaWJ1dGlvbkdyb3VwczogY29uZmlnLmRpc2NvdmVyRGlzdHJpYnV0aW9uR3JvdXBzLFxuICAgICAgICAgICAgICAgICAgICBEaXNjb3ZlclRyYW5zcG9ydFJ1bGVzOiBjb25maWcuZGlzY292ZXJUcmFuc3BvcnRSdWxlcyxcbiAgICAgICAgICAgICAgICAgICAgRGlzY292ZXJDb25uZWN0b3JzOiBjb25maWcuZGlzY292ZXJDb25uZWN0b3JzLFxuICAgICAgICAgICAgICAgICAgICBEaXNjb3ZlclB1YmxpY0ZvbGRlcnM6IGNvbmZpZy5kaXNjb3ZlclB1YmxpY0ZvbGRlcnMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVBcmNoaXZlRGF0YTogY29uZmlnLmluY2x1ZGVBcmNoaXZlRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZU1haWxib3hQZXJtaXNzaW9uczogY29uZmlnLmluY2x1ZGVNYWlsYm94UGVybWlzc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVNYWlsYm94U3RhdGlzdGljczogY29uZmlnLmluY2x1ZGVNYWlsYm94U3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZU1vYmlsZURldmljZXM6IGNvbmZpZy5pbmNsdWRlTW9iaWxlRGV2aWNlcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUdyb3VwTWVtYmVyc2hpcDogY29uZmlnLmluY2x1ZGVHcm91cE1lbWJlcnNoaXAsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVOZXN0ZWRHcm91cHM6IGNvbmZpZy5pbmNsdWRlTmVzdGVkR3JvdXBzLFxuICAgICAgICAgICAgICAgICAgICBzaG93V2luZG93OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXhlY3V0aW9uSWQ6IHRva2VuLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0V4Y2hhbmdlRGlzY292ZXJ5SG9va10g4pyFIEV4Y2hhbmdlIGRpc2NvdmVyeSBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5YCk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKCdFeGNoYW5nZSBkaXNjb3ZlcnkgY29tcGxldGVkIHN1Y2Nlc3NmdWxseScsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSDinYwgRXhjaGFuZ2UgZGlzY292ZXJ5IGZhaWxlZDpgLCByZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJztcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihlcnJvck1zZyk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKGVycm9yTXNnLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICBzZXRJc0Rpc2NvdmVyaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbRXhjaGFuZ2VEaXNjb3ZlcnlIb29rXSBFcnJvcjpgLCBlcnIpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0Rpc2NvdmVyeSBmYWlsZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICAgICAgYWRkTG9nKGVycm9yTXNnLCAnZXJyb3InKTtcbiAgICAgICAgICAgIHNldElzRGlzY292ZXJpbmcoZmFsc2UpO1xuICAgICAgICAgICAgc2V0UHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgIH1cbiAgICB9LCBbY29uZmlnLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGFkZExvZ10pO1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbi5jYW5jZWxEaXNjb3ZlcnkoJ2V4Y2hhbmdlLWRpc2NvdmVyeScpO1xuICAgICAgICAgICAgc2V0SXNEaXNjb3ZlcmluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUZW1wbGF0ZSBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxvYWRUZW1wbGF0ZSA9IHVzZUNhbGxiYWNrKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgc2V0Q29uZmlnKHRlbXBsYXRlLmNvbmZpZyk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHNhdmVBc1RlbXBsYXRlID0gdXNlQ2FsbGJhY2soYXN5bmMgKG5hbWUsIGRlc2NyaXB0aW9uKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L0V4Y2hhbmdlRGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1NhdmUtRXhjaGFuZ2VEaXNjb3ZlcnlUZW1wbGF0ZScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBOYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIENvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGxvYWRUZW1wbGF0ZXMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSB0ZW1wbGF0ZTonLCBlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfSwgW2NvbmZpZ10pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBGaWx0ZXJlZCBEYXRhXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGZpbHRlcmVkTWFpbGJveGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdID09PT09PT09PT0gU1RBUlQgPT09PT09PT09PScpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSByZXN1bHQgZXhpc3RzOicsICEhcmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tERUJVRyBmaWx0ZXJlZE1haWxib3hlc10gcmVzdWx0Py5tYWlsYm94ZXMgZXhpc3RzOicsICEhcmVzdWx0Py5tYWlsYm94ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSByZXN1bHQ/Lm1haWxib3hlcyB0eXBlOicsIHR5cGVvZiByZXN1bHQ/Lm1haWxib3hlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdIHJlc3VsdD8ubWFpbGJveGVzIGlzQXJyYXk6JywgQXJyYXkuaXNBcnJheShyZXN1bHQ/Lm1haWxib3hlcykpO1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSByZXN1bHQ/Lm1haWxib3hlcyBsZW5ndGg6JywgcmVzdWx0Py5tYWlsYm94ZXM/Lmxlbmd0aCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdIHJlc3VsdD8ubWFpbGJveGVzWzBdOicsIHJlc3VsdD8ubWFpbGJveGVzPy5bMF0pO1xuICAgICAgICAvLyBNb3JlIHJvYnVzdCBjaGVja1xuICAgICAgICBpZiAoIXJlc3VsdCB8fCAhcmVzdWx0Lm1haWxib3hlcyB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHQubWFpbGJveGVzKSB8fCByZXN1bHQubWFpbGJveGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tERUJVRyBmaWx0ZXJlZE1haWxib3hlc10gTm8gdmFsaWQgbWFpbGJveCBkYXRhLCByZXR1cm5pbmcgW10nKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdIC0gcmVzdWx0OicsICEhcmVzdWx0KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdIC0gcmVzdWx0Lm1haWxib3hlczonLCAhIXJlc3VsdD8ubWFpbGJveGVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdIC0gaXNBcnJheTonLCBBcnJheS5pc0FycmF5KHJlc3VsdD8ubWFpbGJveGVzKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSAtIGxlbmd0aDonLCByZXN1bHQ/Lm1haWxib3hlcz8ubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSBGaWx0ZXJpbmcnLCByZXN1bHQubWFpbGJveGVzLmxlbmd0aCwgJ21haWxib3hlcycpO1xuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHJlc3VsdC5tYWlsYm94ZXMuZmlsdGVyKChtYWlsYm94KSA9PiB7XG4gICAgICAgICAgICAvLyBTZWFyY2ggdGV4dFxuICAgICAgICAgICAgaWYgKG1haWxib3hGaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IG1haWxib3hGaWx0ZXIuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSAobWFpbGJveC5kaXNwbGF5TmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtYWlsYm94LnVzZXJQcmluY2lwYWxOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG1haWxib3gucHJpbWFyeVNtdHBBZGRyZXNzID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCk7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNYWlsYm94IHR5cGVzXG4gICAgICAgICAgICBpZiAobWFpbGJveEZpbHRlci5tYWlsYm94VHlwZXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghbWFpbGJveEZpbHRlci5tYWlsYm94VHlwZXMuaW5jbHVkZXMobWFpbGJveC5tYWlsYm94VHlwZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNpemUgZmlsdGVyc1xuICAgICAgICAgICAgaWYgKG1haWxib3hGaWx0ZXIubWluU2l6ZSAhPT0gdW5kZWZpbmVkICYmIG1haWxib3gudG90YWxJdGVtU2l6ZSA8IG1haWxib3hGaWx0ZXIubWluU2l6ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYWlsYm94RmlsdGVyLm1heFNpemUgIT09IHVuZGVmaW5lZCAmJiBtYWlsYm94LnRvdGFsSXRlbVNpemUgPiBtYWlsYm94RmlsdGVyLm1heFNpemUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJbmFjdGl2ZSBmaWx0ZXJcbiAgICAgICAgICAgIGlmIChtYWlsYm94RmlsdGVyLmlzSW5hY3RpdmUgIT09IHVuZGVmaW5lZCAmJiBtYWlsYm94LmlzSW5hY3RpdmUgIT09IG1haWxib3hGaWx0ZXIuaXNJbmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFyY2hpdmUgZmlsdGVyXG4gICAgICAgICAgICBpZiAobWFpbGJveEZpbHRlci5oYXNBcmNoaXZlICE9PSB1bmRlZmluZWQgJiYgbWFpbGJveC5hcmNoaXZlRW5hYmxlZCAhPT0gbWFpbGJveEZpbHRlci5oYXNBcmNoaXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTGl0aWdhdGlvbiBob2xkXG4gICAgICAgICAgICBpZiAobWFpbGJveEZpbHRlci5oYXNMaXRpZ2F0aW9uSG9sZCAhPT0gdW5kZWZpbmVkICYmIG1haWxib3gubGl0aWdhdGlvbkhvbGRFbmFibGVkICE9PSBtYWlsYm94RmlsdGVyLmhhc0xpdGlnYXRpb25Ib2xkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkTWFpbGJveGVzXSBGaWx0ZXJlZCByZXN1bHQgbGVuZ3RoOicsIGZpbHRlcmVkLmxlbmd0aCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbREVCVUcgZmlsdGVyZWRNYWlsYm94ZXNdID09PT09PT09PT0gRU5EID09PT09PT09PT0nKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sIFtyZXN1bHQsIG1haWxib3hGaWx0ZXJdKTtcbiAgICBjb25zdCBmaWx0ZXJlZEdyb3VwcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0RFQlVHIGZpbHRlcmVkR3JvdXBzXSByZXN1bHQ/LmRpc3RyaWJ1dGlvbkdyb3VwcyBsZW5ndGg6JywgcmVzdWx0Py5kaXN0cmlidXRpb25Hcm91cHM/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlc3VsdC5kaXN0cmlidXRpb25Hcm91cHMgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0LmRpc3RyaWJ1dGlvbkdyb3VwcykgfHwgcmVzdWx0LmRpc3RyaWJ1dGlvbkdyb3Vwcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IHJlc3VsdC5kaXN0cmlidXRpb25Hcm91cHMuZmlsdGVyKChncm91cCkgPT4ge1xuICAgICAgICAgICAgaWYgKGdyb3VwRmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBncm91cEZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IChncm91cC5kaXNwbGF5TmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgIChncm91cC5wcmltYXJ5U210cEFkZHJlc3MgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICAoZ3JvdXAuYWxpYXMgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChncm91cEZpbHRlci5ncm91cFR5cGVzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWdyb3VwRmlsdGVyLmdyb3VwVHlwZXMuaW5jbHVkZXMoZ3JvdXAuZ3JvdXBUeXBlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdyb3VwRmlsdGVyLm1pbk1lbWJlckNvdW50ICE9PSB1bmRlZmluZWQgJiYgZ3JvdXAubWVtYmVyQ291bnQgPCBncm91cEZpbHRlci5taW5NZW1iZXJDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChncm91cEZpbHRlci5tYXhNZW1iZXJDb3VudCAhPT0gdW5kZWZpbmVkICYmIGdyb3VwLm1lbWJlckNvdW50ID4gZ3JvdXBGaWx0ZXIubWF4TWVtYmVyQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JvdXBGaWx0ZXIubW9kZXJhdGlvbkVuYWJsZWQgIT09IHVuZGVmaW5lZCAmJiBncm91cC5tb2RlcmF0aW9uRW5hYmxlZCAhPT0gZ3JvdXBGaWx0ZXIubW9kZXJhdGlvbkVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JvdXBGaWx0ZXIuaGlkZGVuRnJvbUFkZHJlc3NMaXN0ICE9PSB1bmRlZmluZWQgJiYgZ3JvdXAuaGlkZGVuRnJvbUFkZHJlc3NMaXN0c0VuYWJsZWQgIT09IGdyb3VwRmlsdGVyLmhpZGRlbkZyb21BZGRyZXNzTGlzdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tERUJVRyBmaWx0ZXJlZEdyb3Vwc10gRmlsdGVyZWQgcmVzdWx0IGxlbmd0aDonLCBmaWx0ZXJlZC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfSwgW3Jlc3VsdCwgZ3JvdXBGaWx0ZXJdKTtcbiAgICBjb25zdCBmaWx0ZXJlZFJ1bGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0IHx8ICFyZXN1bHQudHJhbnNwb3J0UnVsZXMgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0LnRyYW5zcG9ydFJ1bGVzKSB8fCByZXN1bHQudHJhbnNwb3J0UnVsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSByZXN1bHQudHJhbnNwb3J0UnVsZXMuZmlsdGVyKChydWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAocnVsZUZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gcnVsZUZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IChydWxlLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICBydWxlLmRlc2NyaXB0aW9uPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCk7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVsZUZpbHRlci5zdGF0ZT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFydWxlRmlsdGVyLnN0YXRlLmluY2x1ZGVzKHJ1bGUuc3RhdGUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocnVsZUZpbHRlci5wcmlvcml0eSkge1xuICAgICAgICAgICAgICAgIGlmIChydWxlRmlsdGVyLnByaW9yaXR5Lm1pbiAhPT0gdW5kZWZpbmVkICYmIHJ1bGUucHJpb3JpdHkgPCBydWxlRmlsdGVyLnByaW9yaXR5Lm1pbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChydWxlRmlsdGVyLnByaW9yaXR5Lm1heCAhPT0gdW5kZWZpbmVkICYmIHJ1bGUucHJpb3JpdHkgPiBydWxlRmlsdGVyLnByaW9yaXR5Lm1heCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfSwgW3Jlc3VsdCwgcnVsZUZpbHRlcl0pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBBRyBHcmlkIENvbHVtbiBEZWZpbml0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCBtYWlsYm94Q29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ0Rpc3BsYXlOYW1lJywgLy8g4pyFIFBhc2NhbENhc2UgdG8gbWF0Y2ggUG93ZXJTaGVsbCBvdXRwdXRcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEaXNwbGF5IE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBwaW5uZWQ6ICdsZWZ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnVXNlclByaW5jaXBhbE5hbWUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VQTicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnUHJpbWFyeVNtdHBBZGRyZXNzJywgLy8g4pyFIFBhc2NhbENhc2VcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdFbWFpbCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnTWFpbGJveFR5cGUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ1RvdGFsSXRlbVNpemUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NpemUgKE1CKScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgaXNOYU4odmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ04vQSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChOdW1iZXIodmFsdWUpIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdJdGVtQ291bnQnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0l0ZW0gQ291bnQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOL0EnO1xuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdBcmNoaXZlRW5hYmxlZCcsIC8vIOKchSBQYXNjYWxDYXNlXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQXJjaGl2ZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnTGl0aWdhdGlvbkhvbGRFbmFibGVkJywgLy8g4pyFIFBhc2NhbENhc2VcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMaXRpZ2F0aW9uIEhvbGQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gKHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJyksXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ0lzSW5hY3RpdmUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXR1cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gJ0luYWN0aXZlJyA6ICdBY3RpdmUnKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnTGFzdExvZ29uVGltZScsIC8vIOKchSBQYXNjYWxDYXNlXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTGFzdCBMb2dvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnRGF0ZUNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ05ldmVyJztcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgUG93ZXJTaGVsbCBkYXRlIGZvcm1hdFxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUudmFsdWUgJiYgcGFyYW1zLnZhbHVlLnZhbHVlLnN0YXJ0c1dpdGgoJy9EYXRlKCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gcGFyYW1zLnZhbHVlLnZhbHVlLm1hdGNoKC9cXC9EYXRlXFwoKFxcZCspXFwpXFwvLyk/LlsxXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRzID8gbmV3IERhdGUocGFyc2VJbnQodHMpKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdJbnZhbGlkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZS5EYXRlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlLkRhdGVUaW1lKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgY29uc3QgZ3JvdXBDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnRGlzcGxheU5hbWUnLCAvLyDinIUgUGFzY2FsQ2FzZSB0byBtYXRjaCBQb3dlclNoZWxsIG91dHB1dFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rpc3BsYXkgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHBpbm5lZDogJ2xlZnQnLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdQcmltYXJ5U210cEFkZHJlc3MnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdHcm91cFR5cGUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ01lbWJlckNvdW50JywgLy8g4pyFIFBhc2NhbENhc2VcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdNZW1iZXJzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdNb2RlcmF0aW9uRW5hYmxlZCcsIC8vIOKchSBQYXNjYWxDYXNlXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTW9kZXJhdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnSGlkZGVuRnJvbUFkZHJlc3NMaXN0c0VuYWJsZWQnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0hpZGRlbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnV2hlbkNyZWF0ZWQnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOL0EnO1xuICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBQb3dlclNoZWxsIGRhdGUgZm9ybWF0XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZS52YWx1ZSAmJiBwYXJhbXMudmFsdWUudmFsdWUuc3RhcnRzV2l0aCgnL0RhdGUoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHMgPSBwYXJhbXMudmFsdWUudmFsdWUubWF0Y2goL1xcL0RhdGVcXCgoXFxkKylcXClcXC8vKT8uWzFdO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHMgPyBuZXcgRGF0ZShwYXJzZUludCh0cykpLnRvTG9jYWxlRGF0ZVN0cmluZygpIDogJ0ludmFsaWQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGFyYW1zLnZhbHVlLkRhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJhbXMudmFsdWUuRGF0ZVRpbWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBydWxlQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ05hbWUnLCAvLyDinIUgUGFzY2FsQ2FzZSB0byBtYXRjaCBQb3dlclNoZWxsIG91dHB1dFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1J1bGUgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHBpbm5lZDogJ2xlZnQnLFxuICAgICAgICAgICAgd2lkdGg6IDI1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdEZXNjcmlwdGlvbicsIC8vIOKchSBQYXNjYWxDYXNlXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ1ByaW9yaXR5JywgLy8g4pyFIFBhc2NhbENhc2VcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQcmlvcml0eScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnU3RhdGUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXRlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdDcmVhdGVkQnknLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQgQnknLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ0NyZWF0ZWREYXRlJywgLy8g4pyFIFBhc2NhbENhc2VcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTi9BJztcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgUG93ZXJTaGVsbCBkYXRlIGZvcm1hdFxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUudmFsdWUgJiYgcGFyYW1zLnZhbHVlLnZhbHVlLnN0YXJ0c1dpdGgoJy9EYXRlKCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gcGFyYW1zLnZhbHVlLnZhbHVlLm1hdGNoKC9cXC9EYXRlXFwoKFxcZCspXFwpXFwvLyk/LlsxXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRzID8gbmV3IERhdGUocGFyc2VJbnQodHMpKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdJbnZhbGlkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZS5EYXRlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlLkRhdGVUaW1lKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdNb2RpZmllZERhdGUnLCAvLyDinIUgUGFzY2FsQ2FzZVxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01vZGlmaWVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTi9BJztcbiAgICAgICAgICAgICAgICAvLyBIYW5kbGUgUG93ZXJTaGVsbCBkYXRlIGZvcm1hdFxuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUudmFsdWUgJiYgcGFyYW1zLnZhbHVlLnZhbHVlLnN0YXJ0c1dpdGgoJy9EYXRlKCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRzID0gcGFyYW1zLnZhbHVlLnZhbHVlLm1hdGNoKC9cXC9EYXRlXFwoKFxcZCspXFwpXFwvLyk/LlsxXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRzID8gbmV3IERhdGUocGFyc2VJbnQodHMpKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICdJbnZhbGlkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZS5EYXRlVGltZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlLkRhdGVUaW1lKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEV4cG9ydCBGdW5jdGlvbmFsaXR5XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGV4cG9ydERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9FeHBvcnQvRXhwb3J0U2VydmljZS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtRXhjaGFuZ2VEaXNjb3ZlcnlEYXRhJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFJlc3VsdDogcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBPcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IGRhdGE6JywgZXJyKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgIH0sIFtyZXN1bHRdKTtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUmV0dXJuIEhvb2sgQVBJXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgc2V0Q29uZmlnLFxuICAgICAgICByZXN1bHQsXG4gICAgICAgIGN1cnJlbnRSZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGlzRGlzY292ZXJpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBsb2dzLFxuICAgICAgICBzaG93RXhlY3V0aW9uRGlhbG9nLFxuICAgICAgICBzZXRTaG93RXhlY3V0aW9uRGlhbG9nLFxuICAgICAgICAvLyBUZW1wbGF0ZXNcbiAgICAgICAgdGVtcGxhdGVzLFxuICAgICAgICBzZWxlY3RlZFRlbXBsYXRlLFxuICAgICAgICBsb2FkVGVtcGxhdGUsXG4gICAgICAgIHNhdmVBc1RlbXBsYXRlLFxuICAgICAgICAvLyBEaXNjb3ZlcnkgY29udHJvbFxuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICAvLyBGaWx0ZXJlZCBkYXRhXG4gICAgICAgIG1haWxib3hlczogZmlsdGVyZWRNYWlsYm94ZXMsXG4gICAgICAgIGdyb3VwczogZmlsdGVyZWRHcm91cHMsXG4gICAgICAgIHJ1bGVzOiBmaWx0ZXJlZFJ1bGVzLFxuICAgICAgICAvLyBGaWx0ZXJzXG4gICAgICAgIG1haWxib3hGaWx0ZXIsXG4gICAgICAgIHNldE1haWxib3hGaWx0ZXIsXG4gICAgICAgIGdyb3VwRmlsdGVyLFxuICAgICAgICBzZXRHcm91cEZpbHRlcixcbiAgICAgICAgcnVsZUZpbHRlcixcbiAgICAgICAgc2V0UnVsZUZpbHRlcixcbiAgICAgICAgLy8gQUcgR3JpZCBjb2x1bW5zXG4gICAgICAgIG1haWxib3hDb2x1bW5zLFxuICAgICAgICBncm91cENvbHVtbnMsXG4gICAgICAgIHJ1bGVDb2x1bW5zLFxuICAgICAgICAvLyBFeHBvcnRcbiAgICAgICAgZXhwb3J0RGF0YSxcbiAgICAgICAgLy8gVUlcbiAgICAgICAgc2VsZWN0ZWRUYWIsXG4gICAgICAgIHNldFNlbGVjdGVkVGFiLFxuICAgICAgICAvLyBTdGF0aXN0aWNzIChmcm9tIHJlc3VsdClcbiAgICAgICAgc3RhdGlzdGljczogcmVzdWx0Py5zdGF0aXN0aWNzLFxuICAgIH07XG59XG4iLCIvKipcbiAqIERpc2NvdmVyeSBTdG9yZVxuICpcbiAqIE1hbmFnZXMgZGlzY292ZXJ5IG9wZXJhdGlvbnMsIHJlc3VsdHMsIGFuZCBzdGF0ZS5cbiAqIEhhbmRsZXMgZG9tYWluLCBuZXR3b3JrLCB1c2VyLCBhbmQgYXBwbGljYXRpb24gZGlzY292ZXJ5IHByb2Nlc3Nlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAnenVzdGFuZCc7XG5pbXBvcnQgeyBkZXZ0b29scywgc3Vic2NyaWJlV2l0aFNlbGVjdG9yIH0gZnJvbSAnenVzdGFuZC9taWRkbGV3YXJlJztcbmV4cG9ydCBjb25zdCB1c2VEaXNjb3ZlcnlTdG9yZSA9IGNyZWF0ZSgpKGRldnRvb2xzKHN1YnNjcmliZVdpdGhTZWxlY3Rvcigoc2V0LCBnZXQpID0+ICh7XG4gICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgIG9wZXJhdGlvbnM6IG5ldyBNYXAoKSxcbiAgICByZXN1bHRzOiBuZXcgTWFwKCksXG4gICAgc2VsZWN0ZWRPcGVyYXRpb246IG51bGwsXG4gICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgLy8gQWN0aW9uc1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IGEgbmV3IGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBzdGFydERpc2NvdmVyeTogYXN5bmMgKHR5cGUsIHBhcmFtZXRlcnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBjYW5jZWxsYXRpb25Ub2tlbiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0luaXRpYWxpemluZyBkaXNjb3ZlcnkuLi4nLFxuICAgICAgICAgICAgaXRlbXNEaXNjb3ZlcmVkOiAwLFxuICAgICAgICAgICAgc3RhcnRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBvcGVyYXRpb24gdG8gc3RhdGVcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLnNldChvcGVyYXRpb25JZCwgb3BlcmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTZXR1cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICBjb25zdCBwcm9ncmVzc0NsZWFudXAgPSB3aW5kb3cuZWxlY3Ryb25BUEkub25Qcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIGRhdGEucGVyY2VudGFnZSwgZGF0YS5tZXNzYWdlIHx8ICdQcm9jZXNzaW5nLi4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBkaXNjb3ZlcnkgbW9kdWxlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogYE1vZHVsZXMvRGlzY292ZXJ5LyR7dHlwZX0ucHNtMWAsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBgU3RhcnQtJHt0eXBlfURpc2NvdmVyeWAsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ2xlYW51cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5jb21wbGV0ZURpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmRhdGE/LnJlc3VsdHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BlcmF0aW9uSWQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSBydW5uaW5nIGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBjYW5jZWxEaXNjb3Zlcnk6IGFzeW5jIChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgIGlmICghb3BlcmF0aW9uIHx8IG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKG9wZXJhdGlvbi5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3AgPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICBvcC5tZXNzYWdlID0gJ0Rpc2NvdmVyeSBjYW5jZWxsZWQgYnkgdXNlcic7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJvZ3Jlc3MgZm9yIGEgcnVubmluZyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGVQcm9ncmVzczogKG9wZXJhdGlvbklkLCBwcm9ncmVzcywgbWVzc2FnZSkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gJiYgb3BlcmF0aW9uLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGNvbXBsZXRlZCB3aXRoIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb21wbGV0ZURpc2NvdmVyeTogKG9wZXJhdGlvbklkLCByZXN1bHRzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcmVkICR7cmVzdWx0cy5sZW5ndGh9IGl0ZW1zYDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uaXRlbXNEaXNjb3ZlcmVkID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KG9wZXJhdGlvbklkLCByZXN1bHRzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBmYWlsZWRcbiAgICAgKi9cbiAgICBmYWlsRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIGVycm9yKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcnkgZmFpbGVkOiAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYSBzaW5nbGUgb3BlcmF0aW9uIGFuZCBpdHMgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyT3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbiA9PT0gb3BlcmF0aW9uSWQgPyBudWxsIDogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvcGVyYXRpb25zIGFuZCByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJBbGxPcGVyYXRpb25zOiAoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgY2xlYXIgY29tcGxldGVkLCBmYWlsZWQsIG9yIGNhbmNlbGxlZCBvcGVyYXRpb25zXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgb3BlcmF0aW9uXSBvZiBuZXdPcGVyYXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldE9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBmb3IgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGJ5IG1vZHVsZSBuYW1lIChmb3IgcGVyc2lzdGVudCByZXRyaWV2YWwgYWNyb3NzIGNvbXBvbmVudCByZW1vdW50cylcbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lOiAobW9kdWxlTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQobW9kdWxlTmFtZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBkaXNjb3ZlcnkgcmVzdWx0IChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgYWRkUmVzdWx0OiAocmVzdWx0KSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZXN1bHRzID0gbmV3UmVzdWx0cy5nZXQocmVzdWx0Lm1vZHVsZU5hbWUpIHx8IFtdO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQocmVzdWx0Lm1vZHVsZU5hbWUsIFsuLi5leGlzdGluZ1Jlc3VsdHMsIHJlc3VsdF0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgcmVzdWx0czogbmV3UmVzdWx0cyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwcm9ncmVzcyBpbmZvcm1hdGlvbiAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIHNldFByb2dyZXNzOiAocHJvZ3Jlc3NEYXRhKSA9PiB7XG4gICAgICAgIC8vIEZpbmQgdGhlIGN1cnJlbnQgb3BlcmF0aW9uIGZvciB0aGlzIG1vZHVsZSBhbmQgdXBkYXRlIGl0XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbnMgPSBnZXQoKS5vcGVyYXRpb25zO1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IEFycmF5LmZyb20ob3BlcmF0aW9ucy5rZXlzKCkpLmZpbmQoaWQgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBvcGVyYXRpb25zLmdldChpZCk7XG4gICAgICAgICAgICByZXR1cm4gb3AgJiYgb3AudHlwZSA9PT0gcHJvZ3Jlc3NEYXRhLm1vZHVsZU5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3BlcmF0aW9uSWQpIHtcbiAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBwcm9ncmVzc0RhdGEub3ZlcmFsbFByb2dyZXNzLCBwcm9ncmVzc0RhdGEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxufSkpLCB7XG4gICAgbmFtZTogJ0Rpc2NvdmVyeVN0b3JlJyxcbn0pKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==