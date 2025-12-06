"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3311],{

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


/***/ }),

/***/ 99126:
/*!************************************************************!*\
  !*** ./src/renderer/hooks/useApplicationDiscoveryLogic.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useApplicationDiscoveryLogic: () => (/* binding */ useApplicationDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useProfileStore */ 33813);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../store/useDiscoveryStore */ 92856);
/**
 * Application Discovery Logic Hook
 * Provides state management and business logic for application discovery operations
 */



/**
 * Custom hook for application discovery logic
 */
const useApplicationDiscoveryLogic = () => {
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__.useProfileStore)((state) => state.selectedSourceProfile);
    const { addResult: addDiscoveryResult, getResultsByModuleName } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__.useDiscoveryStore)();
    const [isRunning, setIsRunning] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [isCancelling, setIsCancelling] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [progress, setProgress] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [results, setResults] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [logs, setLogs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [selectedProfile, setSelectedProfile] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [showExecutionDialog, setShowExecutionDialog] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [currentToken, setCurrentToken] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const currentTokenRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    // Additional state for view compatibility
    const [config, setConfig] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        includeSoftware: true,
        includeProcesses: true,
        includeServices: true,
        scanRegistry: false,
        scanFilesystem: false,
        scanPorts: false
    });
    const [templates, setTemplates] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [selectedTab, setSelectedTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('software');
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [errors, setErrors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    /**
     * Add a log entry
     */
    const addLog = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((level, message) => {
        const entry = {
            timestamp: new Date().toLocaleTimeString(),
            level,
            message,
        };
        setLogs(prev => [...prev, entry]);
    }, []);
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('ApplicationDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[ApplicationDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            const latestResult = previousResults[previousResults.length - 1];
            setResults(latestResult);
            addLog('info', `Restored ${previousResults.length} previous discovery result(s)`);
        }
    }, [getResultsByModuleName, addLog]);
    // Event listeners for PowerShell streaming
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'info';
                addLog(logLevel, data.message);
            }
        });
        const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                const result = {
                    id: `application-discovery-${Date.now()}`,
                    name: 'Application Discovery',
                    moduleName: 'ApplicationDiscovery',
                    displayName: 'Application Discovery',
                    itemCount: data?.result?.totalItems || data?.result?.RecordCount || 0,
                    discoveryTime: new Date().toISOString(),
                    duration: data.duration || 0,
                    status: 'Completed',
                    filePath: data?.result?.outputPath || '',
                    success: true,
                    summary: `Discovered ${data?.result?.totalItems || data?.result?.RecordCount || 0} applications`,
                    errorMessage: '',
                    additionalData: data.result,
                    createdAt: new Date().toISOString(),
                };
                setResults(result);
                addDiscoveryResult(result);
                addLog('info', `Discovery completed! Found ${result.itemCount} applications.`);
            }
        });
        const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                setIsRunning(false);
                setError(data.error);
                addLog('error', `Discovery failed: ${data.error}`);
            }
        });
        const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
            if (data.executionId === currentTokenRef.current) {
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                addLog('warn', 'Discovery cancelled by user');
            }
        });
        return () => {
            unsubscribeOutput?.();
            unsubscribeComplete?.();
            unsubscribeError?.();
            unsubscribeCancelled?.();
        };
    }, [addLog, addDiscoveryResult]);
    /**
     * Start the application discovery process
     */
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (isRunning)
            return;
        // Check if a profile is selected
        if (!selectedSourceProfile) {
            const errorMessage = 'No company profile selected. Please select a profile first.';
            setError(errorMessage);
            addLog('error', errorMessage);
            return;
        }
        setIsRunning(true);
        setIsCancelling(false);
        setProgress(null);
        setResults(null);
        setError(null);
        setLogs([]);
        setShowExecutionDialog(true);
        const token = `application-discovery-${Date.now()}`;
        setCurrentToken(token);
        currentTokenRef.current = token;
        addLog('info', `Starting application discovery for ${selectedSourceProfile.companyName}...`);
        try {
            // Call PowerShell module - Application Discovery uses Microsoft Graph for cloud applications
            // It doesn't accept ScanRegistry, ScanFilesystem, or ScanPorts parameters
            const result = await window.electron.executeDiscovery({
                moduleName: 'Application',
                parameters: {
                    // Application discovery parameters are handled via AdditionalParams in the PowerShell module
                    // The module automatically discovers enterprise applications from Microsoft Graph
                    showWindow: false, // Don't show PowerShell console window
                },
                executionId: token,
            });
            console.log('[ApplicationDiscoveryHook] Discovery execution completed:', result);
            addLog('info', 'Discovery execution call completed');
            // Note: Completion will be handled by the discovery:complete event listener
        }
        catch (err) {
            const errorMessage = err.message || 'Unknown error occurred during discovery';
            setError(errorMessage);
            addLog('error', errorMessage);
            setIsRunning(false);
            setCurrentToken(null);
            setProgress(null);
        }
    }, [isRunning, config, selectedSourceProfile, addLog]);
    /**
     * Cancel the ongoing discovery process
     */
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!isRunning || !currentToken)
            return;
        setIsCancelling(true);
        addLog('warn', 'Cancelling discovery...');
        try {
            await window.electron.cancelDiscovery(currentToken);
            addLog('info', 'Discovery cancellation requested successfully');
            // Set a timeout to reset state in case the cancelled event doesn't fire
            setTimeout(() => {
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setProgress(null);
                addLog('warn', 'Discovery cancelled - reset to start state');
            }, 2000);
        }
        catch (err) {
            const errorMessage = err.message || 'Error cancelling discovery';
            addLog('error', errorMessage);
            // Reset state even on error
            setIsRunning(false);
            setIsCancelling(false);
            setCurrentToken(null);
            setProgress(null);
        }
    }, [isRunning, currentToken, addLog]);
    /**
     * Export discovery results
     */
    const exportResults = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!results)
            return;
        try {
            addLog('info', 'Exporting discovery results...');
            // Mock export functionality
            const dataStr = JSON.stringify(results, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `application-discovery-results-${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            addLog('info', 'Results exported successfully.');
        }
        catch (err) {
            const errorMessage = err.message || 'Failed to export results';
            setError(errorMessage);
            addLog('error', errorMessage);
        }
    }, [results, addLog]);
    /**
     * Clear all logs
     */
    const clearLogs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setLogs([]);
    }, []);
    /**
     * Update configuration
     */
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setConfig((prev) => ({ ...prev, ...updates }));
    }, []);
    /**
     * Load a template
     */
    const loadTemplate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((template) => {
        setConfig(template.config || {});
        addLog('info', `Loaded template: ${template.name}`);
    }, [addLog]);
    /**
     * Save current config as template
     */
    const saveAsTemplate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((name) => {
        const template = { name, config };
        setTemplates(prev => [...prev, template]);
        addLog('info', `Saved template: ${name}`);
    }, [config, addLog]);
    /**
     * Export data in specified format
     */
    const exportData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (format) => {
        addLog('info', `Exporting data as ${format}...`);
        await exportResults();
    }, [exportResults, addLog]);
    return {
        isRunning,
        isCancelling,
        progress,
        results,
        result: results,
        error,
        logs,
        startDiscovery,
        cancelDiscovery,
        exportResults,
        clearLogs,
        selectedProfile,
        showExecutionDialog,
        setShowExecutionDialog,
        // Additional properties
        config,
        templates,
        currentResult: results,
        isDiscovering: isRunning,
        selectedTab,
        searchText,
        filteredData: results ? Object.values(results).flat() : [],
        columnDefs: [],
        errors,
        updateConfig,
        loadTemplate,
        saveAsTemplate,
        setSelectedTab,
        setSearchText,
        exportData,
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSx5QkFBeUIsa0RBQVc7QUFDcEMsK0JBQStCLHFCQUFxQjtBQUNwRCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGtEQUFXO0FBQ3BDLHVDQUF1QztBQUN2QywyQ0FBMkMsY0FBYztBQUN6RCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtEQUFXO0FBQ3RDLDJCQUEyQjtBQUMzQjtBQUNBLDBDQUEwQyxLQUFLO0FBQy9DLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0RBQVc7QUFDbEMsNENBQTRDLE9BQU87QUFDbkQ7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUG93ZXJTaGVsbEV4ZWN1dGlvbkRpYWxvZy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQXBwbGljYXRpb25EaXNjb3ZlcnlMb2dpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqXG4gKiBQcm9ncmVzcyBpbmRpY2F0b3Igd2l0aCBwZXJjZW50YWdlIGRpc3BsYXkgYW5kIG9wdGlvbmFsIGxhYmVsLlxuICogU3VwcG9ydHMgZGlmZmVyZW50IHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9ICh7IHZhbHVlLCBtYXggPSAxMDAsIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBzaG93TGFiZWwgPSB0cnVlLCBsYWJlbCwgbGFiZWxQb3NpdGlvbiA9ICdpbnNpZGUnLCBzdHJpcGVkID0gZmFsc2UsIGFuaW1hdGVkID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBDYWxjdWxhdGUgcGVyY2VudGFnZVxuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsICh2YWx1ZSAvIG1heCkgKiAxMDApKTtcbiAgICAvLyBWYXJpYW50IGNvbG9yc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS02MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy02MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNjAwJyxcbiAgICB9O1xuICAgIC8vIEJhY2tncm91bmQgY29sb3JzXG4gICAgY29uc3QgYmdDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS0xMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtMicsXG4gICAgICAgIG1kOiAnaC00JyxcbiAgICAgICAgbGc6ICdoLTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCcsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgdHJhY2tDbGFzc2VzID0gY2xzeCgndy1mdWxsIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW4nLCBiZ0NsYXNzZXNbdmFyaWFudF0sIHNpemVDbGFzc2VzW3NpemVdKTtcbiAgICBjb25zdCBiYXJDbGFzc2VzID0gY2xzeCgnaC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCcsIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCB7XG4gICAgICAgIC8vIFN0cmlwZWQgcGF0dGVyblxuICAgICAgICAnYmctZ3JhZGllbnQtdG8tciBmcm9tLXRyYW5zcGFyZW50IHZpYS1ibGFjay8xMCB0by10cmFuc3BhcmVudCBiZy1bbGVuZ3RoOjFyZW1fMTAwJV0nOiBzdHJpcGVkLFxuICAgICAgICAnYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzJzogc3RyaXBlZCAmJiBhbmltYXRlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbFRleHQgPSBsYWJlbCB8fCAoc2hvd0xhYmVsID8gYCR7TWF0aC5yb3VuZChwZXJjZW50YWdlKX0lYCA6ICcnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2xhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnb3V0c2lkZScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTFcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogdHJhY2tDbGFzc2VzLCByb2xlOiBcInByb2dyZXNzYmFyXCIsIFwiYXJpYS12YWx1ZW5vd1wiOiB2YWx1ZSwgXCJhcmlhLXZhbHVlbWluXCI6IDAsIFwiYXJpYS12YWx1ZW1heFwiOiBtYXgsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBiYXJDbGFzc2VzLCBzdHlsZTogeyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9LCBjaGlsZHJlbjogbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdpbnNpZGUnICYmIHNpemUgIT09ICdzbScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIHB4LTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXdoaXRlIHdoaXRlc3BhY2Utbm93cmFwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpIH0pIH0pXSB9KSk7XG59O1xuLy8gQWRkIGFuaW1hdGlvbiBmb3Igc3RyaXBlZCBwcm9ncmVzcyBiYXJzXG5jb25zdCBzdHlsZXMgPSBgXHJcbkBrZXlmcmFtZXMgcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgZnJvbSB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxcmVtIDA7XHJcbiAgfVxyXG4gIHRvIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcclxuICB9XHJcbn1cclxuXHJcbi5hbmltYXRlLXByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGFuaW1hdGlvbjogcHJvZ3Jlc3Mtc3RyaXBlcyAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbn1cclxuYDtcbi8vIEluamVjdCBzdHlsZXNcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3MtYmFyLXN0eWxlcycpKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGVTaGVldC5pZCA9ICdwcm9ncmVzcy1iYXItc3R5bGVzJztcbiAgICBzdHlsZVNoZWV0LnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG59XG5leHBvcnQgZGVmYXVsdCBQcm9ncmVzc0JhcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQb3dlclNoZWxsIEV4ZWN1dGlvbiBEaWFsb2dcbiAqIERpc3BsYXlzIFBvd2VyU2hlbGwgc2NyaXB0IGV4ZWN1dGlvbiBvdXRwdXQgd2l0aCBjb250cm9sc1xuICogSW5zcGlyZWQgYnkgR1VJL1dpbmRvd3MvUG93ZXJTaGVsbFdpbmRvdy54YW1sXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQbGF5LCBTcXVhcmUsIENvcHksIFRyYXNoMiwgWCwgRG93bmxvYWQsIENoZWNrQ2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5leHBvcnQgY29uc3QgUG93ZXJTaGVsbEV4ZWN1dGlvbkRpYWxvZyA9ICh7IGlzT3Blbiwgb25DbG9zZSwgc2NyaXB0TmFtZSwgc2NyaXB0RGVzY3JpcHRpb24sIGxvZ3MsIGlzUnVubmluZywgaXNDYW5jZWxsaW5nLCBwcm9ncmVzcywgb25TdGFydCwgb25TdG9wLCBvbkNsZWFyLCBzaG93U3RhcnRCdXR0b24gPSBmYWxzZSwgfSkgPT4ge1xuICAgIGNvbnN0IG91dHB1dFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbY29weUZlZWRiYWNrLCBzZXRDb3B5RmVlZGJhY2tdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFthdXRvU2Nyb2xsLCBzZXRBdXRvU2Nyb2xsXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIC8vIEF1dG8tc2Nyb2xsIHRvIGJvdHRvbSB3aGVuIG5ldyBsb2dzIGFycml2ZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChhdXRvU2Nyb2xsICYmIG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxUb3AgPSBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9LCBbbG9ncywgYXV0b1Njcm9sbF0pO1xuICAgIC8vIEhhbmRsZSBzY3JvbGwgLSBkaXNhYmxlIGF1dG8tc2Nyb2xsIGlmIHVzZXIgc2Nyb2xscyB1cFxuICAgIGNvbnN0IGhhbmRsZVNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCwgc2Nyb2xsSGVpZ2h0LCBjbGllbnRIZWlnaHQgfSA9IG91dHB1dFJlZi5jdXJyZW50O1xuICAgICAgICAgICAgY29uc3QgaXNBdEJvdHRvbSA9IE1hdGguYWJzKHNjcm9sbEhlaWdodCAtIGNsaWVudEhlaWdodCAtIHNjcm9sbFRvcCkgPCAxMDtcbiAgICAgICAgICAgIHNldEF1dG9TY3JvbGwoaXNBdEJvdHRvbSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENvcHkgYWxsIG91dHB1dCB0byBjbGlwYm9hcmRcbiAgICBjb25zdCBoYW5kbGVDb3B5QWxsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gbG9ncy5tYXAobG9nID0+IGBbJHtsb2cudGltZXN0YW1wfV0gJHtsb2cubWVzc2FnZX1gKS5qb2luKCdcXG4nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICAgICAgc2V0Q29weUZlZWRiYWNrKHRydWUpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb3B5RmVlZGJhY2soZmFsc2UpLCAyMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY29weTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBFeHBvcnQgbG9ncyB0byBmaWxlXG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gbG9ncy5tYXAobG9nID0+IGBbJHtsb2cudGltZXN0YW1wfV0gWyR7bG9nLmxldmVsLnRvVXBwZXJDYXNlKCl9XSAke2xvZy5tZXNzYWdlfWApLmpvaW4oJ1xcbicpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6ICd0ZXh0L3BsYWluJyB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBhLmRvd25sb2FkID0gYCR7c2NyaXB0TmFtZS5yZXBsYWNlKC9cXHMrL2csICdfJyl9XyR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKX0ubG9nYDtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgYS5jbGljaygpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGEpO1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfTtcbiAgICBpZiAoIWlzT3BlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1ibGFjay81MCBiYWNrZHJvcC1ibHVyLXNtXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGwgbWF4LXctNXhsIGgtWzgwdmhdIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3ctMnhsIGZsZXggZmxleC1jb2xcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNiBweS00IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtpc1J1bm5pbmcgPyAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIGJnLWJsdWUtNTAwIHJvdW5kZWQtZnVsbCBhbmltYXRlLXB1bHNlXCIgfSkpIDogKF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmVlbi01MDBcIiB9KSksIHNjcmlwdE5hbWVdIH0pLCBzY3JpcHREZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBzY3JpcHREZXNjcmlwdGlvbiB9KSldIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25DbG9zZSwgaWNvbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGRpc2FibGVkOiBpc1J1bm5pbmcgfSldIH0pLCBpc1J1bm5pbmcgJiYgcHJvZ3Jlc3MgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTYgcHktMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiB0ZXh0LXNtIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogcHJvZ3Jlc3MubWVzc2FnZSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFtwcm9ncmVzcy5wZXJjZW50YWdlLCBcIiVcIl0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctZnVsbCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBoLTJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctYmx1ZS02MDAgaC0yIHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDBcIiwgc3R5bGU6IHsgd2lkdGg6IGAke3Byb2dyZXNzLnBlcmNlbnRhZ2V9JWAgfSB9KSB9KV0gfSkpLCBfanN4KFwiZGl2XCIsIHsgcmVmOiBvdXRwdXRSZWYsIG9uU2Nyb2xsOiBoYW5kbGVTY3JvbGwsIGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTQgYmctZ3JheS05MDAgZGFyazpiZy1ibGFjayBmb250LW1vbm8gdGV4dC1zbVwiLCBzdHlsZTogeyBzY3JvbGxCZWhhdmlvcjogJ3Ntb290aCcgfSwgY2hpbGRyZW46IGxvZ3MubGVuZ3RoID09PSAwID8gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwXCIsIGNoaWxkcmVuOiBzaG93U3RhcnRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnQ2xpY2sgXCJTdGFydCBEaXNjb3ZlcnlcIiB0byBiZWdpbiBleGVjdXRpb24uLi4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ1dhaXRpbmcgZm9yIG91dHB1dC4uLicgfSkgfSkpIDogKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0xXCIsIGNoaWxkcmVuOiBsb2dzLm1hcCgobG9nLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgJHtsb2cubGV2ZWwgPT09ICdlcnJvcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1yZWQtNDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGxvZy5sZXZlbCA9PT0gJ3dhcm5pbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LXllbGxvdy00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGxvZy5sZXZlbCA9PT0gJ3N1Y2Nlc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1ncmVlbi00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTMwMCd9YCwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogW1wiW1wiLCBsb2cudGltZXN0YW1wLCBcIl1cIl0gfSksIFwiIFwiLCBsb2cubWVzc2FnZV0gfSwgaW5kZXgpKSkgfSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNiBweS00IGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yXCIsIGNoaWxkcmVuOiBbc2hvd1N0YXJ0QnV0dG9uICYmICFpc1J1bm5pbmcgJiYgb25TdGFydCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25TdGFydCwgaWNvbjogX2pzeChQbGF5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIlN0YXJ0IERpc2NvdmVyeVwiIH0pKSwgaXNSdW5uaW5nICYmIG9uU3RvcCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJkYW5nZXJcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvblN0b3AsIGRpc2FibGVkOiBpc0NhbmNlbGxpbmcsIGxvYWRpbmc6IGlzQ2FuY2VsbGluZywgaWNvbjogX2pzeChTcXVhcmUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IGlzQ2FuY2VsbGluZyA/ICdTdG9wcGluZy4uLicgOiAnU3RvcCcgfSkpLCAhaXNSdW5uaW5nICYmIGxvZ3MubGVuZ3RoID4gMCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBoYW5kbGVDb3B5QWxsLCBpY29uOiBjb3B5RmVlZGJhY2sgPyBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkgOiBfanN4KENvcHksIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IGNvcHlGZWVkYmFjayA/ICdDb3BpZWQhJyA6ICdDb3B5IEFsbCcgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlRXhwb3J0LCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pLCBvbkNsZWFyICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uQ2xlYXIsIGljb246IF9qc3goVHJhc2gyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIkNsZWFyXCIgfSkpXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtsb2dzLmxlbmd0aCwgXCIgbG9nIGVudHJpZXNcIl0gfSksICFhdXRvU2Nyb2xsICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEF1dG9TY3JvbGwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFJlZi5jdXJyZW50LnNjcm9sbFRvcCA9IG91dHB1dFJlZi5jdXJyZW50LnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjaGlsZHJlbjogXCJcXHUyMTkzIFNjcm9sbCB0byBCb3R0b21cIiB9KSldIH0pXSB9KV0gfSkgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFBvd2VyU2hlbGxFeGVjdXRpb25EaWFsb2c7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIERpc2NvdmVyeSBTdG9yZVxuICpcbiAqIE1hbmFnZXMgZGlzY292ZXJ5IG9wZXJhdGlvbnMsIHJlc3VsdHMsIGFuZCBzdGF0ZS5cbiAqIEhhbmRsZXMgZG9tYWluLCBuZXR3b3JrLCB1c2VyLCBhbmQgYXBwbGljYXRpb24gZGlzY292ZXJ5IHByb2Nlc3Nlcy5cbiAqL1xuaW1wb3J0IHsgY3JlYXRlIH0gZnJvbSAnenVzdGFuZCc7XG5pbXBvcnQgeyBkZXZ0b29scywgc3Vic2NyaWJlV2l0aFNlbGVjdG9yIH0gZnJvbSAnenVzdGFuZC9taWRkbGV3YXJlJztcbmV4cG9ydCBjb25zdCB1c2VEaXNjb3ZlcnlTdG9yZSA9IGNyZWF0ZSgpKGRldnRvb2xzKHN1YnNjcmliZVdpdGhTZWxlY3Rvcigoc2V0LCBnZXQpID0+ICh7XG4gICAgLy8gSW5pdGlhbCBzdGF0ZVxuICAgIG9wZXJhdGlvbnM6IG5ldyBNYXAoKSxcbiAgICByZXN1bHRzOiBuZXcgTWFwKCksXG4gICAgc2VsZWN0ZWRPcGVyYXRpb246IG51bGwsXG4gICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgLy8gQWN0aW9uc1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IGEgbmV3IGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBzdGFydERpc2NvdmVyeTogYXN5bmMgKHR5cGUsIHBhcmFtZXRlcnMpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBjYW5jZWxsYXRpb25Ub2tlbiA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHtcbiAgICAgICAgICAgIGlkOiBvcGVyYXRpb25JZCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBzdGF0dXM6ICdydW5uaW5nJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0luaXRpYWxpemluZyBkaXNjb3ZlcnkuLi4nLFxuICAgICAgICAgICAgaXRlbXNEaXNjb3ZlcmVkOiAwLFxuICAgICAgICAgICAgc3RhcnRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIC8vIEFkZCBvcGVyYXRpb24gdG8gc3RhdGVcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLnNldChvcGVyYXRpb25JZCwgb3BlcmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTZXR1cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICBjb25zdCBwcm9ncmVzc0NsZWFudXAgPSB3aW5kb3cuZWxlY3Ryb25BUEkub25Qcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIGRhdGEucGVyY2VudGFnZSwgZGF0YS5tZXNzYWdlIHx8ICdQcm9jZXNzaW5nLi4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBkaXNjb3ZlcnkgbW9kdWxlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogYE1vZHVsZXMvRGlzY292ZXJ5LyR7dHlwZX0ucHNtMWAsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBgU3RhcnQtJHt0eXBlfURpc2NvdmVyeWAsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ2xlYW51cCBwcm9ncmVzcyBsaXN0ZW5lclxuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBnZXQoKS5jb21wbGV0ZURpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmRhdGE/LnJlc3VsdHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuZmFpbERpc2NvdmVyeShvcGVyYXRpb25JZCwgcmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIGVycm9yLm1lc3NhZ2UgfHwgJ0Rpc2NvdmVyeSBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BlcmF0aW9uSWQ7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgYSBydW5uaW5nIGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBjYW5jZWxEaXNjb3Zlcnk6IGFzeW5jIChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgIGlmICghb3BlcmF0aW9uIHx8IG9wZXJhdGlvbi5zdGF0dXMgIT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuY2FuY2VsRXhlY3V0aW9uKG9wZXJhdGlvbi5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3AgPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICBvcC5tZXNzYWdlID0gJ0Rpc2NvdmVyeSBjYW5jZWxsZWQgYnkgdXNlcic7XG4gICAgICAgICAgICAgICAgICAgIG9wLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJvZ3Jlc3MgZm9yIGEgcnVubmluZyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB1cGRhdGVQcm9ncmVzczogKG9wZXJhdGlvbklkLCBwcm9ncmVzcywgbWVzc2FnZSkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gJiYgb3BlcmF0aW9uLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gcHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgb3BlcmF0aW9uIGFzIGNvbXBsZXRlZCB3aXRoIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjb21wbGV0ZURpc2NvdmVyeTogKG9wZXJhdGlvbklkLCByZXN1bHRzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnN0YXR1cyA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcmVkICR7cmVzdWx0cy5sZW5ndGh9IGl0ZW1zYDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uaXRlbXNEaXNjb3ZlcmVkID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KG9wZXJhdGlvbklkLCByZXN1bHRzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBmYWlsZWRcbiAgICAgKi9cbiAgICBmYWlsRGlzY292ZXJ5OiAob3BlcmF0aW9uSWQsIGVycm9yKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnZmFpbGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ubWVzc2FnZSA9IGBEaXNjb3ZlcnkgZmFpbGVkOiAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmNvbXBsZXRlZEF0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYSBzaW5nbGUgb3BlcmF0aW9uIGFuZCBpdHMgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyT3BlcmF0aW9uOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBzdGF0ZS5zZWxlY3RlZE9wZXJhdGlvbiA9PT0gb3BlcmF0aW9uSWQgPyBudWxsIDogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBvcGVyYXRpb25zIGFuZCByZXN1bHRzXG4gICAgICovXG4gICAgY2xlYXJBbGxPcGVyYXRpb25zOiAoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgY2xlYXIgY29tcGxldGVkLCBmYWlsZWQsIG9yIGNhbmNlbGxlZCBvcGVyYXRpb25zXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgb3BlcmF0aW9uXSBvZiBuZXdPcGVyYXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IG5ld1Jlc3VsdHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCBhIHNwZWNpZmljIG9wZXJhdGlvblxuICAgICAqL1xuICAgIGdldE9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5vcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBmb3IgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzOiAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIEdldCByZXN1bHRzIGJ5IG1vZHVsZSBuYW1lIChmb3IgcGVyc2lzdGVudCByZXRyaWV2YWwgYWNyb3NzIGNvbXBvbmVudCByZW1vdW50cylcbiAgICAgKi9cbiAgICBnZXRSZXN1bHRzQnlNb2R1bGVOYW1lOiAobW9kdWxlTmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkucmVzdWx0cy5nZXQobW9kdWxlTmFtZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBBZGQgYSBkaXNjb3ZlcnkgcmVzdWx0IChjb21wYXRpYmlsaXR5IG1ldGhvZCBmb3IgaG9va3MpXG4gICAgICovXG4gICAgYWRkUmVzdWx0OiAocmVzdWx0KSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZXN1bHRzID0gbmV3UmVzdWx0cy5nZXQocmVzdWx0Lm1vZHVsZU5hbWUpIHx8IFtdO1xuICAgICAgICAgICAgbmV3UmVzdWx0cy5zZXQocmVzdWx0Lm1vZHVsZU5hbWUsIFsuLi5leGlzdGluZ1Jlc3VsdHMsIHJlc3VsdF0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgcmVzdWx0czogbmV3UmVzdWx0cyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwcm9ncmVzcyBpbmZvcm1hdGlvbiAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIHNldFByb2dyZXNzOiAocHJvZ3Jlc3NEYXRhKSA9PiB7XG4gICAgICAgIC8vIEZpbmQgdGhlIGN1cnJlbnQgb3BlcmF0aW9uIGZvciB0aGlzIG1vZHVsZSBhbmQgdXBkYXRlIGl0XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbnMgPSBnZXQoKS5vcGVyYXRpb25zO1xuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IEFycmF5LmZyb20ob3BlcmF0aW9ucy5rZXlzKCkpLmZpbmQoaWQgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBvcGVyYXRpb25zLmdldChpZCk7XG4gICAgICAgICAgICByZXR1cm4gb3AgJiYgb3AudHlwZSA9PT0gcHJvZ3Jlc3NEYXRhLm1vZHVsZU5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3BlcmF0aW9uSWQpIHtcbiAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBwcm9ncmVzc0RhdGEub3ZlcmFsbFByb2dyZXNzLCBwcm9ncmVzc0RhdGEubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxufSkpLCB7XG4gICAgbmFtZTogJ0Rpc2NvdmVyeVN0b3JlJyxcbn0pKTtcbiIsIi8qKlxuICogQXBwbGljYXRpb24gRGlzY292ZXJ5IExvZ2ljIEhvb2tcbiAqIFByb3ZpZGVzIHN0YXRlIG1hbmFnZW1lbnQgYW5kIGJ1c2luZXNzIGxvZ2ljIGZvciBhcHBsaWNhdGlvbiBkaXNjb3Zlcnkgb3BlcmF0aW9uc1xuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmltcG9ydCB7IHVzZURpc2NvdmVyeVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlRGlzY292ZXJ5U3RvcmUnO1xuLyoqXG4gKiBDdXN0b20gaG9vayBmb3IgYXBwbGljYXRpb24gZGlzY292ZXJ5IGxvZ2ljXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VBcHBsaWNhdGlvbkRpc2NvdmVyeUxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlUHJvZmlsZSA9IHVzZVByb2ZpbGVTdG9yZSgoc3RhdGUpID0+IHN0YXRlLnNlbGVjdGVkU291cmNlUHJvZmlsZSk7XG4gICAgY29uc3QgeyBhZGRSZXN1bHQ6IGFkZERpc2NvdmVyeVJlc3VsdCwgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSB9ID0gdXNlRGlzY292ZXJ5U3RvcmUoKTtcbiAgICBjb25zdCBbaXNSdW5uaW5nLCBzZXRJc1J1bm5pbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpc0NhbmNlbGxpbmcsIHNldElzQ2FuY2VsbGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsb2dzLCBzZXRMb2dzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRQcm9maWxlLCBzZXRTZWxlY3RlZFByb2ZpbGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dFeGVjdXRpb25EaWFsb2csIHNldFNob3dFeGVjdXRpb25EaWFsb2ddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtjdXJyZW50VG9rZW4sIHNldEN1cnJlbnRUb2tlbl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBjdXJyZW50VG9rZW5SZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgLy8gQWRkaXRpb25hbCBzdGF0ZSBmb3IgdmlldyBjb21wYXRpYmlsaXR5XG4gICAgY29uc3QgW2NvbmZpZywgc2V0Q29uZmlnXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgaW5jbHVkZVNvZnR3YXJlOiB0cnVlLFxuICAgICAgICBpbmNsdWRlUHJvY2Vzc2VzOiB0cnVlLFxuICAgICAgICBpbmNsdWRlU2VydmljZXM6IHRydWUsXG4gICAgICAgIHNjYW5SZWdpc3RyeTogZmFsc2UsXG4gICAgICAgIHNjYW5GaWxlc3lzdGVtOiBmYWxzZSxcbiAgICAgICAgc2NhblBvcnRzOiBmYWxzZVxuICAgIH0pO1xuICAgIGNvbnN0IFt0ZW1wbGF0ZXMsIHNldFRlbXBsYXRlc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW3NlbGVjdGVkVGFiLCBzZXRTZWxlY3RlZFRhYl0gPSB1c2VTdGF0ZSgnc29mdHdhcmUnKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW2Vycm9ycywgc2V0RXJyb3JzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvKipcbiAgICAgKiBBZGQgYSBsb2cgZW50cnlcbiAgICAgKi9cbiAgICBjb25zdCBhZGRMb2cgPSB1c2VDYWxsYmFjaygobGV2ZWwsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCksXG4gICAgICAgICAgICBsZXZlbCxcbiAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIH07XG4gICAgICAgIHNldExvZ3MocHJldiA9PiBbLi4ucHJldiwgZW50cnldKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gTG9hZCBwcmV2aW91cyBkaXNjb3ZlcnkgcmVzdWx0cyBmcm9tIHN0b3JlIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNSZXN1bHRzID0gZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSgnQXBwbGljYXRpb25EaXNjb3ZlcnknKTtcbiAgICAgICAgaWYgKHByZXZpb3VzUmVzdWx0cyAmJiBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBcHBsaWNhdGlvbkRpc2NvdmVyeUhvb2tdIFJlc3RvcmluZycsIHByZXZpb3VzUmVzdWx0cy5sZW5ndGgsICdwcmV2aW91cyByZXN1bHRzIGZyb20gc3RvcmUnKTtcbiAgICAgICAgICAgIGNvbnN0IGxhdGVzdFJlc3VsdCA9IHByZXZpb3VzUmVzdWx0c1twcmV2aW91c1Jlc3VsdHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBzZXRSZXN1bHRzKGxhdGVzdFJlc3VsdCk7XG4gICAgICAgICAgICBhZGRMb2coJ2luZm8nLCBgUmVzdG9yZWQgJHtwcmV2aW91c1Jlc3VsdHMubGVuZ3RofSBwcmV2aW91cyBkaXNjb3ZlcnkgcmVzdWx0KHMpYCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSwgYWRkTG9nXSk7XG4gICAgLy8gRXZlbnQgbGlzdGVuZXJzIGZvciBQb3dlclNoZWxsIHN0cmVhbWluZ1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlT3V0cHV0ID0gd2luZG93LmVsZWN0cm9uPy5vbkRpc2NvdmVyeU91dHB1dD8uKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY3VycmVudFRva2VuUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2dMZXZlbCA9IGRhdGEubGV2ZWwgPT09ICdlcnJvcicgPyAnZXJyb3InIDogZGF0YS5sZXZlbCA9PT0gJ3dhcm5pbmcnID8gJ3dhcm4nIDogJ2luZm8nO1xuICAgICAgICAgICAgICAgIGFkZExvZyhsb2dMZXZlbCwgZGF0YS5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlQ29tcGxldGUgPSB3aW5kb3cuZWxlY3Ryb24/Lm9uRGlzY292ZXJ5Q29tcGxldGU/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRJc0NhbmNlbGxpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldEN1cnJlbnRUb2tlbihudWxsKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBgYXBwbGljYXRpb24tZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX1gLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBwbGljYXRpb24gRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogJ0FwcGxpY2F0aW9uRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdBcHBsaWNhdGlvbiBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgICAgICAgICBpdGVtQ291bnQ6IGRhdGE/LnJlc3VsdD8udG90YWxJdGVtcyB8fCBkYXRhPy5yZXN1bHQ/LlJlY29yZENvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdmVyeVRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb24gfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnQ29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGRhdGE/LnJlc3VsdD8ub3V0cHV0UGF0aCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYERpc2NvdmVyZWQgJHtkYXRhPy5yZXN1bHQ/LnRvdGFsSXRlbXMgfHwgZGF0YT8ucmVzdWx0Py5SZWNvcmRDb3VudCB8fCAwfSBhcHBsaWNhdGlvbnNgLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICcnLFxuICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogZGF0YS5yZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0cyhyZXN1bHQpO1xuICAgICAgICAgICAgICAgIGFkZERpc2NvdmVyeVJlc3VsdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIGFkZExvZygnaW5mbycsIGBEaXNjb3ZlcnkgY29tcGxldGVkISBGb3VuZCAke3Jlc3VsdC5pdGVtQ291bnR9IGFwcGxpY2F0aW9ucy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlRXJyb3IgPSB3aW5kb3cuZWxlY3Ryb24/Lm9uRGlzY292ZXJ5RXJyb3I/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihkYXRhLmVycm9yKTtcbiAgICAgICAgICAgICAgICBhZGRMb2coJ2Vycm9yJywgYERpc2NvdmVyeSBmYWlsZWQ6ICR7ZGF0YS5lcnJvcn1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlQ2FuY2VsbGVkID0gd2luZG93LmVsZWN0cm9uPy5vbkRpc2NvdmVyeUNhbmNlbGxlZD8uKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS5leGVjdXRpb25JZCA9PT0gY3VycmVudFRva2VuUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBzZXRJc1J1bm5pbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldElzQ2FuY2VsbGluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0Q3VycmVudFRva2VuKG51bGwpO1xuICAgICAgICAgICAgICAgIGFkZExvZygnd2FybicsICdEaXNjb3ZlcnkgY2FuY2VsbGVkIGJ5IHVzZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZU91dHB1dD8uKCk7XG4gICAgICAgICAgICB1bnN1YnNjcmliZUNvbXBsZXRlPy4oKTtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlRXJyb3I/LigpO1xuICAgICAgICAgICAgdW5zdWJzY3JpYmVDYW5jZWxsZWQ/LigpO1xuICAgICAgICB9O1xuICAgIH0sIFthZGRMb2csIGFkZERpc2NvdmVyeVJlc3VsdF0pO1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IHRoZSBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcHJvY2Vzc1xuICAgICAqL1xuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoaXNSdW5uaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBDaGVjayBpZiBhIHByb2ZpbGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdObyBjb21wYW55IHByb2ZpbGUgc2VsZWN0ZWQuIFBsZWFzZSBzZWxlY3QgYSBwcm9maWxlIGZpcnN0Lic7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgYWRkTG9nKCdlcnJvcicsIGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNSdW5uaW5nKHRydWUpO1xuICAgICAgICBzZXRJc0NhbmNlbGxpbmcoZmFsc2UpO1xuICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgc2V0UmVzdWx0cyhudWxsKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldExvZ3MoW10pO1xuICAgICAgICBzZXRTaG93RXhlY3V0aW9uRGlhbG9nKHRydWUpO1xuICAgICAgICBjb25zdCB0b2tlbiA9IGBhcHBsaWNhdGlvbi1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfWA7XG4gICAgICAgIHNldEN1cnJlbnRUb2tlbih0b2tlbik7XG4gICAgICAgIGN1cnJlbnRUb2tlblJlZi5jdXJyZW50ID0gdG9rZW47XG4gICAgICAgIGFkZExvZygnaW5mbycsIGBTdGFydGluZyBhcHBsaWNhdGlvbiBkaXNjb3ZlcnkgZm9yICR7c2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNvbXBhbnlOYW1lfS4uLmApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2FsbCBQb3dlclNoZWxsIG1vZHVsZSAtIEFwcGxpY2F0aW9uIERpc2NvdmVyeSB1c2VzIE1pY3Jvc29mdCBHcmFwaCBmb3IgY2xvdWQgYXBwbGljYXRpb25zXG4gICAgICAgICAgICAvLyBJdCBkb2Vzbid0IGFjY2VwdCBTY2FuUmVnaXN0cnksIFNjYW5GaWxlc3lzdGVtLCBvciBTY2FuUG9ydHMgcGFyYW1ldGVyc1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uLmV4ZWN1dGVEaXNjb3Zlcnkoe1xuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdBcHBsaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICAvLyBBcHBsaWNhdGlvbiBkaXNjb3ZlcnkgcGFyYW1ldGVycyBhcmUgaGFuZGxlZCB2aWEgQWRkaXRpb25hbFBhcmFtcyBpbiB0aGUgUG93ZXJTaGVsbCBtb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG1vZHVsZSBhdXRvbWF0aWNhbGx5IGRpc2NvdmVycyBlbnRlcnByaXNlIGFwcGxpY2F0aW9ucyBmcm9tIE1pY3Jvc29mdCBHcmFwaFxuICAgICAgICAgICAgICAgICAgICBzaG93V2luZG93OiBmYWxzZSwgLy8gRG9uJ3Qgc2hvdyBQb3dlclNoZWxsIGNvbnNvbGUgd2luZG93XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBleGVjdXRpb25JZDogdG9rZW4sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQXBwbGljYXRpb25EaXNjb3ZlcnlIb29rXSBEaXNjb3ZlcnkgZXhlY3V0aW9uIGNvbXBsZXRlZDonLCByZXN1bHQpO1xuICAgICAgICAgICAgYWRkTG9nKCdpbmZvJywgJ0Rpc2NvdmVyeSBleGVjdXRpb24gY2FsbCBjb21wbGV0ZWQnKTtcbiAgICAgICAgICAgIC8vIE5vdGU6IENvbXBsZXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5IHRoZSBkaXNjb3Zlcnk6Y29tcGxldGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvciBvY2N1cnJlZCBkdXJpbmcgZGlzY292ZXJ5JztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBhZGRMb2coJ2Vycm9yJywgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHNldElzUnVubmluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgIH0sIFtpc1J1bm5pbmcsIGNvbmZpZywgc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBhZGRMb2ddKTtcbiAgICAvKipcbiAgICAgKiBDYW5jZWwgdGhlIG9uZ29pbmcgZGlzY292ZXJ5IHByb2Nlc3NcbiAgICAgKi9cbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghaXNSdW5uaW5nIHx8ICFjdXJyZW50VG9rZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzQ2FuY2VsbGluZyh0cnVlKTtcbiAgICAgICAgYWRkTG9nKCd3YXJuJywgJ0NhbmNlbGxpbmcgZGlzY292ZXJ5Li4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb24uY2FuY2VsRGlzY292ZXJ5KGN1cnJlbnRUb2tlbik7XG4gICAgICAgICAgICBhZGRMb2coJ2luZm8nLCAnRGlzY292ZXJ5IGNhbmNlbGxhdGlvbiByZXF1ZXN0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgICAvLyBTZXQgYSB0aW1lb3V0IHRvIHJlc2V0IHN0YXRlIGluIGNhc2UgdGhlIGNhbmNlbGxlZCBldmVudCBkb2Vzbid0IGZpcmVcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldElzUnVubmluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0SXNDYW5jZWxsaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICAgICAgc2V0UHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKCd3YXJuJywgJ0Rpc2NvdmVyeSBjYW5jZWxsZWQgLSByZXNldCB0byBzdGFydCBzdGF0ZScpO1xuICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyLm1lc3NhZ2UgfHwgJ0Vycm9yIGNhbmNlbGxpbmcgZGlzY292ZXJ5JztcbiAgICAgICAgICAgIGFkZExvZygnZXJyb3InLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgLy8gUmVzZXQgc3RhdGUgZXZlbiBvbiBlcnJvclxuICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldElzQ2FuY2VsbGluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgIH0sIFtpc1J1bm5pbmcsIGN1cnJlbnRUb2tlbiwgYWRkTG9nXSk7XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGRpc2NvdmVyeSByZXN1bHRzXG4gICAgICovXG4gICAgY29uc3QgZXhwb3J0UmVzdWx0cyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHRzKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYWRkTG9nKCdpbmZvJywgJ0V4cG9ydGluZyBkaXNjb3ZlcnkgcmVzdWx0cy4uLicpO1xuICAgICAgICAgICAgLy8gTW9jayBleHBvcnQgZnVuY3Rpb25hbGl0eVxuICAgICAgICAgICAgY29uc3QgZGF0YVN0ciA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdHMsIG51bGwsIDIpO1xuICAgICAgICAgICAgY29uc3QgZGF0YVVyaSA9ICdkYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCwnICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFTdHIpO1xuICAgICAgICAgICAgY29uc3QgZXhwb3J0RmlsZURlZmF1bHROYW1lID0gYGFwcGxpY2F0aW9uLWRpc2NvdmVyeS1yZXN1bHRzLSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19Lmpzb25gO1xuICAgICAgICAgICAgY29uc3QgbGlua0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsaW5rRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBkYXRhVXJpKTtcbiAgICAgICAgICAgIGxpbmtFbGVtZW50LnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBleHBvcnRGaWxlRGVmYXVsdE5hbWUpO1xuICAgICAgICAgICAgbGlua0VsZW1lbnQuY2xpY2soKTtcbiAgICAgICAgICAgIGFkZExvZygnaW5mbycsICdSZXN1bHRzIGV4cG9ydGVkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGV4cG9ydCByZXN1bHRzJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBhZGRMb2coJ2Vycm9yJywgZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZXN1bHRzLCBhZGRMb2ddKTtcbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgbG9nc1xuICAgICAqL1xuICAgIGNvbnN0IGNsZWFyTG9ncyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0TG9ncyhbXSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBjb25maWd1cmF0aW9uXG4gICAgICovXG4gICAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0Q29uZmlnKChwcmV2KSA9PiAoeyAuLi5wcmV2LCAuLi51cGRhdGVzIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhIHRlbXBsYXRlXG4gICAgICovXG4gICAgY29uc3QgbG9hZFRlbXBsYXRlID0gdXNlQ2FsbGJhY2soKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgIHNldENvbmZpZyh0ZW1wbGF0ZS5jb25maWcgfHwge30pO1xuICAgICAgICBhZGRMb2coJ2luZm8nLCBgTG9hZGVkIHRlbXBsYXRlOiAke3RlbXBsYXRlLm5hbWV9YCk7XG4gICAgfSwgW2FkZExvZ10pO1xuICAgIC8qKlxuICAgICAqIFNhdmUgY3VycmVudCBjb25maWcgYXMgdGVtcGxhdGVcbiAgICAgKi9cbiAgICBjb25zdCBzYXZlQXNUZW1wbGF0ZSA9IHVzZUNhbGxiYWNrKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlID0geyBuYW1lLCBjb25maWcgfTtcbiAgICAgICAgc2V0VGVtcGxhdGVzKHByZXYgPT4gWy4uLnByZXYsIHRlbXBsYXRlXSk7XG4gICAgICAgIGFkZExvZygnaW5mbycsIGBTYXZlZCB0ZW1wbGF0ZTogJHtuYW1lfWApO1xuICAgIH0sIFtjb25maWcsIGFkZExvZ10pO1xuICAgIC8qKlxuICAgICAqIEV4cG9ydCBkYXRhIGluIHNwZWNpZmllZCBmb3JtYXRcbiAgICAgKi9cbiAgICBjb25zdCBleHBvcnREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKGZvcm1hdCkgPT4ge1xuICAgICAgICBhZGRMb2coJ2luZm8nLCBgRXhwb3J0aW5nIGRhdGEgYXMgJHtmb3JtYXR9Li4uYCk7XG4gICAgICAgIGF3YWl0IGV4cG9ydFJlc3VsdHMoKTtcbiAgICB9LCBbZXhwb3J0UmVzdWx0cywgYWRkTG9nXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaXNSdW5uaW5nLFxuICAgICAgICBpc0NhbmNlbGxpbmcsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICByZXN1bHQ6IHJlc3VsdHMsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBsb2dzLFxuICAgICAgICBzdGFydERpc2NvdmVyeSxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICBleHBvcnRSZXN1bHRzLFxuICAgICAgICBjbGVhckxvZ3MsXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZSxcbiAgICAgICAgc2hvd0V4ZWN1dGlvbkRpYWxvZyxcbiAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyxcbiAgICAgICAgLy8gQWRkaXRpb25hbCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdGVtcGxhdGVzLFxuICAgICAgICBjdXJyZW50UmVzdWx0OiByZXN1bHRzLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBpc1J1bm5pbmcsXG4gICAgICAgIHNlbGVjdGVkVGFiLFxuICAgICAgICBzZWFyY2hUZXh0LFxuICAgICAgICBmaWx0ZXJlZERhdGE6IHJlc3VsdHMgPyBPYmplY3QudmFsdWVzKHJlc3VsdHMpLmZsYXQoKSA6IFtdLFxuICAgICAgICBjb2x1bW5EZWZzOiBbXSxcbiAgICAgICAgZXJyb3JzLFxuICAgICAgICB1cGRhdGVDb25maWcsXG4gICAgICAgIGxvYWRUZW1wbGF0ZSxcbiAgICAgICAgc2F2ZUFzVGVtcGxhdGUsXG4gICAgICAgIHNldFNlbGVjdGVkVGFiLFxuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgICAgICBleHBvcnREYXRhLFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9