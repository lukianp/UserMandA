"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2541],{

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

/***/ 63683:
/*!****************************************************!*\
  !*** ./src/renderer/components/atoms/Checkbox.tsx ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Checkbox: () => (/* binding */ Checkbox),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Checkbox Component
 *
 * Fully accessible checkbox component with labels and error states.
 * Follows WCAG 2.1 AA guidelines.
 */



/**
 * Checkbox Component
 */
const Checkbox = ({ label, description, checked = false, onChange, error, disabled = false, indeterminate = false, className, 'data-cy': dataCy, }) => {
    const id = (0,react__WEBPACK_IMPORTED_MODULE_1__.useId)();
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;
    const hasError = Boolean(error);
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.checked);
        }
    };
    // Handle indeterminate via ref
    const checkboxRef = react__WEBPACK_IMPORTED_MODULE_1__.useRef(null);
    react__WEBPACK_IMPORTED_MODULE_1__.useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);
    const checkboxClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'h-5 w-5 rounded border-2', 'transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'dark:ring-offset-gray-900', 
    // State-based styles
    {
        // Normal state (unchecked)
        'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700': !hasError && !disabled && !checked,
        'focus:ring-blue-500': !hasError && !disabled,
        // Checked state
        'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500': checked && !disabled && !hasError,
        // Error state
        'border-red-500 text-red-600 dark:border-red-400': hasError && !disabled,
        'focus:ring-red-500': hasError && !disabled,
        // Disabled state
        'border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed': disabled,
    });
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('text-sm font-medium', {
        'text-gray-700 dark:text-gray-200': !hasError && !disabled,
        'text-red-700 dark:text-red-400': hasError && !disabled,
        'text-gray-500 dark:text-gray-500': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('flex flex-col', className), children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center h-5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: checkboxRef, id: id, type: "checkbox", checked: checked, onChange: handleChange, disabled: disabled, className: "sr-only peer", "aria-invalid": hasError, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                                    [errorId]: hasError,
                                    [descriptionId]: description,
                                }), "data-cy": dataCy }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(checkboxClasses, 'flex items-center justify-center cursor-pointer', {
                                    'cursor-not-allowed': disabled,
                                }), children: [checked && !indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Check, { className: "h-4 w-4 text-white", strokeWidth: 3 })), indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "h-0.5 w-3 bg-white rounded" }))] })] }), (label || description) && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "ml-3", children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(labelClasses, 'cursor-pointer'), children: label })), description && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: descriptionId, className: "text-sm text-gray-500 dark:text-gray-400 mt-0.5", children: description }))] }))] }), hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: errorId, className: "mt-1 ml-8 text-sm text-red-600", role: "alert", "aria-live": "polite", children: error }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Checkbox);


/***/ }),

/***/ 80099:
/*!******************************************************!*\
  !*** ./src/renderer/hooks/useAzureDiscoveryLogic.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAzureDiscoveryLogic: () => (/* binding */ useAzureDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useProfileStore */ 33813);
/* harmony import */ var _store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../store/useDiscoveryStore */ 92856);
/* harmony import */ var _lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/electron-api-fallback */ 58350);
/**
 * Azure Discovery View Logic Hook
 * Handles Azure AD/Microsoft 365 discovery operations
 */




const useAzureDiscoveryLogic = () => {
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__.useProfileStore)((state) => state.selectedSourceProfile);
    const { addResult, setProgress, getResultsByModuleName } = (0,_store_useDiscoveryStore__WEBPACK_IMPORTED_MODULE_2__.useDiscoveryStore)();
    // Form state
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        includeUsers: true,
        includeGroups: true,
        includeTeams: false,
        includeSharePoint: false,
        includeOneDrive: false,
        includeExchange: false,
        includeLicenses: true,
        maxResults: 50000,
        timeout: 1800, // 30 minutes (allows time for module installation on first run)
        showWindow: false, // Use integrated PowerShell dialog (set to true for external terminal window)
    });
    // Execution state
    const [isRunning, setIsRunning] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [isCancelling, setIsCancelling] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [currentToken, setCurrentToken] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const currentTokenRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null); // Ref to avoid closure issues in event handlers
    const [progress, setLocalProgress] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [results, setResults] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [logs, setLogs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    const [connectionStatus, setConnectionStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('disconnected');
    const [showExecutionDialog, setShowExecutionDialog] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    // Validation
    const isFormValid = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!selectedSourceProfile)
            return false;
        const hasService = formData.includeUsers || formData.includeGroups ||
            formData.includeTeams || formData.includeSharePoint ||
            formData.includeOneDrive || formData.includeExchange;
        return hasService;
    }, [formData, selectedSourceProfile]);
    // Form handlers
    const [config, setConfig] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
    const updateFormField = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);
    const resetForm = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setFormData({
            includeUsers: true,
            includeGroups: true,
            includeTeams: false,
            includeSharePoint: false,
            includeOneDrive: false,
            includeExchange: false,
            includeLicenses: true,
            maxResults: 50000,
            timeout: 600,
            showWindow: false, // Use integrated PowerShell dialog (set to true for external terminal window)
        });
        setError(null);
        setLogs([]);
    }, []);
    // Utility function for adding logs
    const addLog = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((message, level = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, level }]);
    }, []);
    // Load previous discovery results from store on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const previousResults = getResultsByModuleName('AzureDiscovery');
        if (previousResults && previousResults.length > 0) {
            console.log('[AzureDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
            setResults(previousResults);
            addLog(`Restored ${previousResults.length} previous discovery result(s)`, 'info');
        }
    }, [getResultsByModuleName, addLog]);
    // Safety mechanism: Reset state if discovery is running but hasn't received events for too long
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!isRunning || !currentToken)
            return;
        let lastEventTime = Date.now();
        const eventMonitor = setInterval(() => {
            const timeSinceLastEvent = Date.now() - lastEventTime;
            // If no events for 5 minutes and process is marked as running, assume it crashed
            if (timeSinceLastEvent > 5 * 60 * 1000) {
                addLog('No activity detected for 5 minutes. Resetting state...', 'warning');
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setLocalProgress(null);
            }
        }, 30000); // Check every 30 seconds
        // Update last event time whenever logs change
        const updateEventTime = () => {
            lastEventTime = Date.now();
        };
        // Monitor logs array changes as indicator of activity
        updateEventTime();
        return () => {
            clearInterval(eventMonitor);
        };
    }, [isRunning, currentToken, logs.length, addLog]);
    // Discovery event handlers - set up ONCE on mount to avoid race conditions
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        console.log('[AzureDiscoveryHook] Setting up GLOBAL event listeners (mount)');
        const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
            console.log('[AzureDiscoveryHook] Progress event received:', data, 'currentTokenRef:', currentTokenRef.current);
            // Check against the CURRENT token at the time of the event
            if (data.executionId === currentTokenRef.current) {
                const progressData = {
                    percentage: data.percentage,
                    message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
                    currentItem: data.currentPhase,
                    itemsProcessed: data.itemsProcessed,
                    totalItems: data.totalItems,
                    moduleName: 'AzureDiscovery',
                    currentOperation: data.currentPhase || 'Processing',
                    overallProgress: data.percentage,
                    moduleProgress: data.percentage,
                    status: 'Running',
                    timestamp: new Date().toISOString(),
                };
                setLocalProgress(progressData);
                setProgress(progressData);
                addLog(progressData.message, 'info');
            }
            else {
                console.log('[AzureDiscoveryHook] Progress event executionId mismatch:', data.executionId, 'vs', currentTokenRef.current);
            }
        });
        const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
            console.log('[AzureDiscoveryHook] Output event received:', data, 'currentTokenRef:', currentTokenRef.current);
            if (data.executionId === currentTokenRef.current) {
                const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
                addLog(data.message, logLevel);
            }
            else {
                console.log('[AzureDiscoveryHook] Output event executionId mismatch:', data.executionId, 'vs', currentTokenRef.current);
            }
        });
        const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
            console.log('[AzureDiscoveryHook] Complete event received:', data, 'currentTokenRef:', currentTokenRef.current);
            if (data.executionId === currentTokenRef.current) {
                const discoveryResult = {
                    id: `azure-discovery-${Date.now()}`,
                    name: 'Azure Discovery',
                    moduleName: 'AzureDiscovery',
                    displayName: 'Microsoft 365 / Azure AD Discovery',
                    itemCount: data?.result?.totalItems || 0,
                    discoveryTime: new Date().toISOString(),
                    duration: data.duration || 0,
                    status: 'Completed',
                    filePath: data?.result?.outputPath || '',
                    success: true,
                    summary: `Discovered ${data?.result?.totalItems || 0} items from ${selectedSourceProfile?.companyName || 'tenant'}`,
                    errorMessage: '',
                    additionalData: data.result,
                    createdAt: new Date().toISOString(),
                };
                setResults([discoveryResult]);
                addResult(discoveryResult);
                addLog(`Discovery completed successfully! Found ${data?.result?.totalItems} items.`, 'success');
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setLocalProgress(null);
            }
        });
        const unsubscribeError = window.electron.onDiscoveryError((data) => {
            console.log('[AzureDiscoveryHook] Error event received:', data, 'currentTokenRef:', currentTokenRef.current);
            if (data.executionId === currentTokenRef.current) {
                setError(data.error);
                addLog(`${data.error}`, 'error');
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setLocalProgress(null);
            }
        });
        const unsubscribeCancelled = window.electron.onDiscoveryCancelled?.((data) => {
            console.log('[AzureDiscoveryHook] Cancelled event received:', data, 'currentTokenRef:', currentTokenRef.current);
            if (data.executionId === currentTokenRef.current) {
                addLog('Discovery cancelled by user', 'warning');
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setLocalProgress(null);
            }
        });
        return () => {
            console.log('[AzureDiscoveryHook] Cleaning up event listeners');
            if (unsubscribeProgress)
                unsubscribeProgress();
            if (unsubscribeOutput)
                unsubscribeOutput();
            if (unsubscribeComplete)
                unsubscribeComplete();
            if (unsubscribeError)
                unsubscribeError();
            if (unsubscribeCancelled)
                unsubscribeCancelled();
        };
    }, []); // Empty dependency array - set up once on mount to avoid race conditions
    // Test connection to Azure
    const testConnection = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedSourceProfile) {
            setConnectionStatus('error');
            addLog('No company profile selected', 'error');
            return;
        }
        setConnectionStatus('connecting');
        addLog('Testing connection to Azure AD...', 'info');
        try {
            const electronAPI = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__.getElectronAPI)();
            await electronAPI.executeDiscoveryModule('Azure', selectedSourceProfile.companyName, {
                TestConnection: true,
            }, {
                timeout: 30000,
            });
            setConnectionStatus('connected');
            addLog(`Connection successful! Tenant: ${selectedSourceProfile.tenantId || selectedSourceProfile.companyName}`, 'success');
        }
        catch (err) {
            setConnectionStatus('error');
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            addLog(`Connection failed: ${errorMessage}`, 'error');
        }
    }, [selectedSourceProfile, addLog]);
    // Start discovery
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        // Check if a profile is selected
        if (!selectedSourceProfile) {
            const errorMessage = 'No company profile selected. Please select a profile first.';
            setError(errorMessage);
            addLog(errorMessage, 'error');
            return;
        }
        if (!isFormValid) {
            const errorMessage = 'Please select at least one service to discover';
            setError(errorMessage);
            addLog(errorMessage, 'error');
            return;
        }
        setIsRunning(true);
        setIsCancelling(false);
        setError(null);
        setResults([]);
        setLogs([]);
        setShowExecutionDialog(true);
        const token = `azure-discovery-${Date.now()}`;
        setCurrentToken(token);
        currentTokenRef.current = token; // Update ref immediately so event handlers have the latest value
        console.log(`[AzureDiscoveryHook] Starting Azure discovery for company: ${selectedSourceProfile.companyName}`);
        console.log('[AzureDiscoveryHook] Full profile:', selectedSourceProfile);
        addLog(`Starting Azure discovery for ${selectedSourceProfile.companyName}...`, 'info');
        const tenantId = selectedSourceProfile.tenantId || selectedSourceProfile.credentials?.azureTenantId || 'N/A';
        const clientId = selectedSourceProfile.clientId || selectedSourceProfile.credentials?.azureClientId || 'N/A';
        addLog(`Tenant ID: ${tenantId}`, 'info');
        addLog(`Client ID: ${clientId}`, 'info');
        addLog(`Profile has credentials: ${!!(selectedSourceProfile.credentials) ? 'Yes' : 'No'}`, 'info');
        // Log selected services
        const services = [];
        if (formData.includeUsers)
            services.push('Users');
        if (formData.includeGroups)
            services.push('Groups');
        if (formData.includeTeams)
            services.push('Teams');
        if (formData.includeSharePoint)
            services.push('SharePoint');
        if (formData.includeOneDrive)
            services.push('OneDrive');
        if (formData.includeExchange)
            services.push('Exchange');
        if (formData.includeLicenses)
            services.push('Licenses');
        addLog(`Services: ${services.join(', ')}`, 'info');
        console.log(`[AzureDiscoveryHook] Parameters:`, {
            includeUsers: formData.includeUsers,
            includeGroups: formData.includeGroups,
            includeTeams: formData.includeTeams,
            includeSharePoint: formData.includeSharePoint,
            includeOneDrive: formData.includeOneDrive,
            includeExchange: formData.includeExchange,
            includeLicenses: formData.includeLicenses,
        });
        try {
            addLog('Connecting to Azure and initializing discovery...', 'info');
            // Use the correct discovery:execute handler that emits streaming events
            console.log('[AzureDiscoveryHook] Calling executeDiscovery with token:', token);
            const result = await window.electron.executeDiscovery({
                moduleName: 'Azure',
                parameters: {
                    IncludeUsers: formData.includeUsers,
                    IncludeGroups: formData.includeGroups,
                    IncludeTeams: formData.includeTeams,
                    IncludeSharePoint: formData.includeSharePoint,
                    IncludeOneDrive: formData.includeOneDrive,
                    IncludeExchange: formData.includeExchange,
                    IncludeLicenses: formData.includeLicenses,
                    MaxResults: formData.maxResults,
                    timeout: formData.timeout * 1000, // Convert to milliseconds
                    showWindow: formData.showWindow, // Pass showWindow parameter
                },
                executionId: token, // Pass the token so events are matched correctly
            });
            console.log('[AzureDiscoveryHook] Discovery execution completed:', result);
            addLog('Discovery execution call completed', 'success');
            // Note: Completion will be handled by the discovery:complete event listener
            // Don't set isRunning to false here as the event listener will do it
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            addLog(errorMessage, 'error');
            setIsRunning(false);
            setCurrentToken(null);
            setLocalProgress(null);
        }
    }, [formData, isFormValid, selectedSourceProfile, addLog]);
    // Cancel discovery
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!currentToken)
            return;
        setIsCancelling(true);
        addLog('Cancelling discovery...', 'warning');
        try {
            await window.electron.cancelDiscovery(currentToken);
            addLog('Discovery cancellation requested successfully', 'info');
            // Set a timeout to reset state in case the cancelled event doesn't fire
            setTimeout(() => {
                setIsRunning(false);
                setIsCancelling(false);
                setCurrentToken(null);
                setLocalProgress(null);
                addLog('Discovery cancelled - reset to start state', 'warning');
            }, 2000);
        }
        catch (err) {
            addLog(`Error cancelling: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
            // Reset state even on error
            setIsRunning(false);
            setIsCancelling(false);
            setCurrentToken(null);
            setLocalProgress(null);
        }
    }, [currentToken, addLog]);
    // Export results
    const exportResults = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (results.length === 0)
            return;
        const api = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__.getElectronAPI)();
        api.writeFile(`azure-discovery-${Date.now()}.json`, JSON.stringify(results, null, 2));
    }, [results]);
    // Clear logs
    const clearLogs = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setLogs([]);
    }, []);
    return {
        // Form state
        formData,
        updateFormField,
        resetForm,
        isFormValid,
        // Execution state
        isRunning,
        isCancelling,
        progress,
        results,
        result: results,
        error,
        logs,
        connectionStatus,
        showExecutionDialog,
        setShowExecutionDialog,
        // Actions
        testConnection,
        startDiscovery,
        cancelDiscovery,
        exportResults,
        clearLogs,
        // Profile info
        selectedProfile: selectedSourceProfile,
        config,
        setConfig,
        // Additional properties for view compatibility
        isDiscovering: isRunning,
        currentResult: results,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDO0FBQ0Q7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUG93ZXJTaGVsbEV4ZWN1dGlvbkRpYWxvZy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQXp1cmVEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzLCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUG93ZXJTaGVsbCBFeGVjdXRpb24gRGlhbG9nXG4gKiBEaXNwbGF5cyBQb3dlclNoZWxsIHNjcmlwdCBleGVjdXRpb24gb3V0cHV0IHdpdGggY29udHJvbHNcbiAqIEluc3BpcmVkIGJ5IEdVSS9XaW5kb3dzL1Bvd2VyU2hlbGxXaW5kb3cueGFtbFxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUGxheSwgU3F1YXJlLCBDb3B5LCBUcmFzaDIsIFgsIERvd25sb2FkLCBDaGVja0NpcmNsZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuZXhwb3J0IGNvbnN0IFBvd2VyU2hlbGxFeGVjdXRpb25EaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIHNjcmlwdE5hbWUsIHNjcmlwdERlc2NyaXB0aW9uLCBsb2dzLCBpc1J1bm5pbmcsIGlzQ2FuY2VsbGluZywgcHJvZ3Jlc3MsIG9uU3RhcnQsIG9uU3RvcCwgb25DbGVhciwgc2hvd1N0YXJ0QnV0dG9uID0gZmFsc2UsIH0pID0+IHtcbiAgICBjb25zdCBvdXRwdXRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2NvcHlGZWVkYmFjaywgc2V0Q29weUZlZWRiYWNrXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbYXV0b1Njcm9sbCwgc2V0QXV0b1Njcm9sbF0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICAvLyBBdXRvLXNjcm9sbCB0byBib3R0b20gd2hlbiBuZXcgbG9ncyBhcnJpdmVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoYXV0b1Njcm9sbCAmJiBvdXRwdXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb3V0cHV0UmVmLmN1cnJlbnQuc2Nyb2xsVG9wID0gb3V0cHV0UmVmLmN1cnJlbnQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB9XG4gICAgfSwgW2xvZ3MsIGF1dG9TY3JvbGxdKTtcbiAgICAvLyBIYW5kbGUgc2Nyb2xsIC0gZGlzYWJsZSBhdXRvLXNjcm9sbCBpZiB1c2VyIHNjcm9sbHMgdXBcbiAgICBjb25zdCBoYW5kbGVTY3JvbGwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChvdXRwdXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3QgeyBzY3JvbGxUb3AsIHNjcm9sbEhlaWdodCwgY2xpZW50SGVpZ2h0IH0gPSBvdXRwdXRSZWYuY3VycmVudDtcbiAgICAgICAgICAgIGNvbnN0IGlzQXRCb3R0b20gPSBNYXRoLmFicyhzY3JvbGxIZWlnaHQgLSBjbGllbnRIZWlnaHQgLSBzY3JvbGxUb3ApIDwgMTA7XG4gICAgICAgICAgICBzZXRBdXRvU2Nyb2xsKGlzQXRCb3R0b20pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBDb3B5IGFsbCBvdXRwdXQgdG8gY2xpcGJvYXJkXG4gICAgY29uc3QgaGFuZGxlQ29weUFsbCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGxvZ3MubWFwKGxvZyA9PiBgWyR7bG9nLnRpbWVzdGFtcH1dICR7bG9nLm1lc3NhZ2V9YCkuam9pbignXFxuJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgICAgIHNldENvcHlGZWVkYmFjayh0cnVlKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29weUZlZWRiYWNrKGZhbHNlKSwgMjAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvcHk6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gRXhwb3J0IGxvZ3MgdG8gZmlsZVxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGxvZ3MubWFwKGxvZyA9PiBgWyR7bG9nLnRpbWVzdGFtcH1dIFske2xvZy5sZXZlbC50b1VwcGVyQ2FzZSgpfV0gJHtsb2cubWVzc2FnZX1gKS5qb2luKCdcXG4nKTtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt0ZXh0XSwgeyB0eXBlOiAndGV4dC9wbGFpbicgfSk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGEuaHJlZiA9IHVybDtcbiAgICAgICAgYS5kb3dubG9hZCA9IGAke3NjcmlwdE5hbWUucmVwbGFjZSgvXFxzKy9nLCAnXycpfV8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyl9LmxvZ2A7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYSk7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhKTtcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgIH07XG4gICAgaWYgKCFpc09wZW4pXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIHotNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctYmxhY2svNTAgYmFja2Ryb3AtYmx1ci1zbVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy1mdWxsIG1heC13LTV4bCBoLVs4MHZoXSBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LTJ4bCBmbGV4IGZsZXgtY29sXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTYgcHktNCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IFtfanN4cyhcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbaXNSdW5uaW5nID8gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy0zIGgtMyBiZy1ibHVlLTUwMCByb3VuZGVkLWZ1bGwgYW5pbWF0ZS1wdWxzZVwiIH0pKSA6IChfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JlZW4tNTAwXCIgfSkpLCBzY3JpcHROYW1lXSB9KSwgc2NyaXB0RGVzY3JpcHRpb24gJiYgKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogc2NyaXB0RGVzY3JpcHRpb24gfSkpXSB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uQ2xvc2UsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBkaXNhYmxlZDogaXNSdW5uaW5nIH0pXSB9KSwgaXNSdW5uaW5nICYmIHByb2dyZXNzICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC1zbSBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHByb2dyZXNzLm1lc3NhZ2UgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBbcHJvZ3Jlc3MucGVyY2VudGFnZSwgXCIlXCJdIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGwgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWZ1bGwgaC0yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNjAwIGgtMiByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwXCIsIHN0eWxlOiB7IHdpZHRoOiBgJHtwcm9ncmVzcy5wZXJjZW50YWdlfSVgIH0gfSkgfSldIH0pKSwgX2pzeChcImRpdlwiLCB7IHJlZjogb3V0cHV0UmVmLCBvblNjcm9sbDogaGFuZGxlU2Nyb2xsLCBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gcC00IGJnLWdyYXktOTAwIGRhcms6YmctYmxhY2sgZm9udC1tb25vIHRleHQtc21cIiwgc3R5bGU6IHsgc2Nyb2xsQmVoYXZpb3I6ICdzbW9vdGgnIH0sIGNoaWxkcmVuOiBsb2dzLmxlbmd0aCA9PT0gMCA/IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbFwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogc2hvd1N0YXJ0QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ0NsaWNrIFwiU3RhcnQgRGlzY292ZXJ5XCIgdG8gYmVnaW4gZXhlY3V0aW9uLi4uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdXYWl0aW5nIGZvciBvdXRwdXQuLi4nIH0pIH0pKSA6IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMVwiLCBjaGlsZHJlbjogbG9ncy5tYXAoKGxvZywgaW5kZXgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogYCR7bG9nLmxldmVsID09PSAnZXJyb3InXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3RleHQtcmVkLTQwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBsb2cubGV2ZWwgPT09ICd3YXJuaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC15ZWxsb3ctNDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBsb2cubGV2ZWwgPT09ICdzdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3RleHQtZ3JlZW4tNDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtZ3JheS0zMDAnfWAsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFtcIltcIiwgbG9nLnRpbWVzdGFtcCwgXCJdXCJdIH0pLCBcIiBcIiwgbG9nLm1lc3NhZ2VdIH0sIGluZGV4KSkpIH0pKSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTYgcHktNCBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW3Nob3dTdGFydEJ1dHRvbiAmJiAhaXNSdW5uaW5nICYmIG9uU3RhcnQgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uU3RhcnQsIGljb246IF9qc3goUGxheSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJTdGFydCBEaXNjb3ZlcnlcIiB9KSksIGlzUnVubmluZyAmJiBvblN0b3AgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIHNpemU6IFwic21cIiwgb25DbGljazogb25TdG9wLCBkaXNhYmxlZDogaXNDYW5jZWxsaW5nLCBsb2FkaW5nOiBpc0NhbmNlbGxpbmcsIGljb246IF9qc3goU3F1YXJlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBpc0NhbmNlbGxpbmcgPyAnU3RvcHBpbmcuLi4nIDogJ1N0b3AnIH0pKSwgIWlzUnVubmluZyAmJiBsb2dzLmxlbmd0aCA+IDAgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlQ29weUFsbCwgaWNvbjogY29weUZlZWRiYWNrID8gX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pIDogX2pzeChDb3B5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBjb3B5RmVlZGJhY2sgPyAnQ29waWVkIScgOiAnQ29weSBBbGwnIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KSwgb25DbGVhciAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvbkNsZWFyLCBpY29uOiBfanN4KFRyYXNoMiwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJDbGVhclwiIH0pKV0gfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbbG9ncy5sZW5ndGgsIFwiIGxvZyBlbnRyaWVzXCJdIH0pLCAhYXV0b1Njcm9sbCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBdXRvU2Nyb2xsKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxUb3AgPSBvdXRwdXRSZWYuY3VycmVudC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2hpbGRyZW46IFwiXFx1MjE5MyBTY3JvbGwgdG8gQm90dG9tXCIgfSkpXSB9KV0gfSldIH0pIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBQb3dlclNoZWxsRXhlY3V0aW9uRGlhbG9nO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKlxuICogRnVsbHkgYWNjZXNzaWJsZSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBsYWJlbHMgYW5kIGVycm9yIHN0YXRlcy5cbiAqIEZvbGxvd3MgV0NBRyAyLjEgQUEgZ3VpZGVsaW5lcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUlkIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQ2hlY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IENoZWNrYm94ID0gKHsgbGFiZWwsIGRlc2NyaXB0aW9uLCBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBlcnJvciwgZGlzYWJsZWQgPSBmYWxzZSwgaW5kZXRlcm1pbmF0ZSA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgaWQgPSB1c2VJZCgpO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpZH0tZXJyb3JgO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uSWQgPSBgJHtpZH0tZGVzY3JpcHRpb25gO1xuICAgIGNvbnN0IGhhc0Vycm9yID0gQm9vbGVhbihlcnJvcik7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIGluZGV0ZXJtaW5hdGUgdmlhIHJlZlxuICAgIGNvbnN0IGNoZWNrYm94UmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjaGVja2JveFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjaGVja2JveFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBpbmRldGVybWluYXRlO1xuICAgICAgICB9XG4gICAgfSwgW2luZGV0ZXJtaW5hdGVdKTtcbiAgICBjb25zdCBjaGVja2JveENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2gtNSB3LTUgcm91bmRlZCBib3JkZXItMicsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rhcms6cmluZy1vZmZzZXQtZ3JheS05MDAnLCBcbiAgICAvLyBTdGF0ZS1iYXNlZCBzdHlsZXNcbiAgICB7XG4gICAgICAgIC8vIE5vcm1hbCBzdGF0ZSAodW5jaGVja2VkKVxuICAgICAgICAnYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNTAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkICYmICFjaGVja2VkLFxuICAgICAgICAnZm9jdXM6cmluZy1ibHVlLTUwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIENoZWNrZWQgc3RhdGVcbiAgICAgICAgJ2JnLWJsdWUtNjAwIGJvcmRlci1ibHVlLTYwMCBkYXJrOmJnLWJsdWUtNTAwIGRhcms6Ym9yZGVyLWJsdWUtNTAwJzogY2hlY2tlZCAmJiAhZGlzYWJsZWQgJiYgIWhhc0Vycm9yLFxuICAgICAgICAvLyBFcnJvciBzdGF0ZVxuICAgICAgICAnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtNjAwIGRhcms6Ym9yZGVyLXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICdmb2N1czpyaW5nLXJlZC01MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIERpc2FibGVkIHN0YXRlXG4gICAgICAgICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS02MDAgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCd0ZXh0LXNtIGZvbnQtbWVkaXVtJywge1xuICAgICAgICAndGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS01MDAnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGZsZXgtY29sJywgY2xhc3NOYW1lKSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgaC01XCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgcmVmOiBjaGVja2JveFJlZiwgaWQ6IGlkLCB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGNoZWNrZWQsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBcInNyLW9ubHkgcGVlclwiLCBcImFyaWEtaW52YWxpZFwiOiBoYXNFcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Vycm9ySWRdOiBoYXNFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbklkXTogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pLCBfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChjaGVja2JveENsYXNzZXMsICdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItcG9pbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIGNoaWxkcmVuOiBbY2hlY2tlZCAmJiAhaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChDaGVjaywgeyBjbGFzc05hbWU6IFwiaC00IHctNCB0ZXh0LXdoaXRlXCIsIHN0cm9rZVdpZHRoOiAzIH0pKSwgaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTAuNSB3LTMgYmctd2hpdGUgcm91bmRlZFwiIH0pKV0gfSldIH0pLCAobGFiZWwgfHwgZGVzY3JpcHRpb24pICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtbC0zXCIsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3goXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3gobGFiZWxDbGFzc2VzLCAnY3Vyc29yLXBvaW50ZXInKSwgY2hpbGRyZW46IGxhYmVsIH0pKSwgZGVzY3JpcHRpb24gJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGRlc2NyaXB0aW9uSWQsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTAuNVwiLCBjaGlsZHJlbjogZGVzY3JpcHRpb24gfSkpXSB9KSldIH0pLCBoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBcIm10LTEgbWwtOCB0ZXh0LXNtIHRleHQtcmVkLTYwMFwiLCByb2xlOiBcImFsZXJ0XCIsIFwiYXJpYS1saXZlXCI6IFwicG9saXRlXCIsIGNoaWxkcmVuOiBlcnJvciB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDaGVja2JveDtcbiIsIi8qKlxuICogQXp1cmUgRGlzY292ZXJ5IFZpZXcgTG9naWMgSG9va1xuICogSGFuZGxlcyBBenVyZSBBRC9NaWNyb3NvZnQgMzY1IGRpc2NvdmVyeSBvcGVyYXRpb25zXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VNZW1vLCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5U3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VEaXNjb3ZlcnlTdG9yZSc7XG5pbXBvcnQgeyBnZXRFbGVjdHJvbkFQSSB9IGZyb20gJy4uL2xpYi9lbGVjdHJvbi1hcGktZmFsbGJhY2snO1xuZXhwb3J0IGNvbnN0IHVzZUF6dXJlRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICBjb25zdCB7IGFkZFJlc3VsdCwgc2V0UHJvZ3Jlc3MsIGdldFJlc3VsdHNCeU1vZHVsZU5hbWUgfSA9IHVzZURpc2NvdmVyeVN0b3JlKCk7XG4gICAgLy8gRm9ybSBzdGF0ZVxuICAgIGNvbnN0IFtmb3JtRGF0YSwgc2V0Rm9ybURhdGFdID0gdXNlU3RhdGUoe1xuICAgICAgICBpbmNsdWRlVXNlcnM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVHcm91cHM6IHRydWUsXG4gICAgICAgIGluY2x1ZGVUZWFtczogZmFsc2UsXG4gICAgICAgIGluY2x1ZGVTaGFyZVBvaW50OiBmYWxzZSxcbiAgICAgICAgaW5jbHVkZU9uZURyaXZlOiBmYWxzZSxcbiAgICAgICAgaW5jbHVkZUV4Y2hhbmdlOiBmYWxzZSxcbiAgICAgICAgaW5jbHVkZUxpY2Vuc2VzOiB0cnVlLFxuICAgICAgICBtYXhSZXN1bHRzOiA1MDAwMCxcbiAgICAgICAgdGltZW91dDogMTgwMCwgLy8gMzAgbWludXRlcyAoYWxsb3dzIHRpbWUgZm9yIG1vZHVsZSBpbnN0YWxsYXRpb24gb24gZmlyc3QgcnVuKVxuICAgICAgICBzaG93V2luZG93OiBmYWxzZSwgLy8gVXNlIGludGVncmF0ZWQgUG93ZXJTaGVsbCBkaWFsb2cgKHNldCB0byB0cnVlIGZvciBleHRlcm5hbCB0ZXJtaW5hbCB3aW5kb3cpXG4gICAgfSk7XG4gICAgLy8gRXhlY3V0aW9uIHN0YXRlXG4gICAgY29uc3QgW2lzUnVubmluZywgc2V0SXNSdW5uaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbaXNDYW5jZWxsaW5nLCBzZXRJc0NhbmNlbGxpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtjdXJyZW50VG9rZW4sIHNldEN1cnJlbnRUb2tlbl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBjdXJyZW50VG9rZW5SZWYgPSB1c2VSZWYobnVsbCk7IC8vIFJlZiB0byBhdm9pZCBjbG9zdXJlIGlzc3VlcyBpbiBldmVudCBoYW5kbGVyc1xuICAgIGNvbnN0IFtwcm9ncmVzcywgc2V0TG9jYWxQcm9ncmVzc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcmVzdWx0cywgc2V0UmVzdWx0c10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbbG9ncywgc2V0TG9nc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2Nvbm5lY3Rpb25TdGF0dXMsIHNldENvbm5lY3Rpb25TdGF0dXNdID0gdXNlU3RhdGUoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgIGNvbnN0IFtzaG93RXhlY3V0aW9uRGlhbG9nLCBzZXRTaG93RXhlY3V0aW9uRGlhbG9nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICAvLyBWYWxpZGF0aW9uXG4gICAgY29uc3QgaXNGb3JtVmFsaWQgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGhhc1NlcnZpY2UgPSBmb3JtRGF0YS5pbmNsdWRlVXNlcnMgfHwgZm9ybURhdGEuaW5jbHVkZUdyb3VwcyB8fFxuICAgICAgICAgICAgZm9ybURhdGEuaW5jbHVkZVRlYW1zIHx8IGZvcm1EYXRhLmluY2x1ZGVTaGFyZVBvaW50IHx8XG4gICAgICAgICAgICBmb3JtRGF0YS5pbmNsdWRlT25lRHJpdmUgfHwgZm9ybURhdGEuaW5jbHVkZUV4Y2hhbmdlO1xuICAgICAgICByZXR1cm4gaGFzU2VydmljZTtcbiAgICB9LCBbZm9ybURhdGEsIHNlbGVjdGVkU291cmNlUHJvZmlsZV0pO1xuICAgIC8vIEZvcm0gaGFuZGxlcnNcbiAgICBjb25zdCBbY29uZmlnLCBzZXRDb25maWddID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IHVwZGF0ZUZvcm1GaWVsZCA9IHVzZUNhbGxiYWNrKChmaWVsZCwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0Rm9ybURhdGEocHJldiA9PiAoeyAuLi5wcmV2LCBbZmllbGRdOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHJlc2V0Rm9ybSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0Rm9ybURhdGEoe1xuICAgICAgICAgICAgaW5jbHVkZVVzZXJzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUdyb3VwczogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVUZWFtczogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlU2hhcmVQb2ludDogZmFsc2UsXG4gICAgICAgICAgICBpbmNsdWRlT25lRHJpdmU6IGZhbHNlLFxuICAgICAgICAgICAgaW5jbHVkZUV4Y2hhbmdlOiBmYWxzZSxcbiAgICAgICAgICAgIGluY2x1ZGVMaWNlbnNlczogdHJ1ZSxcbiAgICAgICAgICAgIG1heFJlc3VsdHM6IDUwMDAwLFxuICAgICAgICAgICAgdGltZW91dDogNjAwLFxuICAgICAgICAgICAgc2hvd1dpbmRvdzogZmFsc2UsIC8vIFVzZSBpbnRlZ3JhdGVkIFBvd2VyU2hlbGwgZGlhbG9nIChzZXQgdG8gdHJ1ZSBmb3IgZXh0ZXJuYWwgdGVybWluYWwgd2luZG93KVxuICAgICAgICB9KTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldExvZ3MoW10pO1xuICAgIH0sIFtdKTtcbiAgICAvLyBVdGlsaXR5IGZ1bmN0aW9uIGZvciBhZGRpbmcgbG9nc1xuICAgIGNvbnN0IGFkZExvZyA9IHVzZUNhbGxiYWNrKChtZXNzYWdlLCBsZXZlbCA9ICdpbmZvJykgPT4ge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpO1xuICAgICAgICBzZXRMb2dzKHByZXYgPT4gWy4uLnByZXYsIHsgdGltZXN0YW1wLCBtZXNzYWdlLCBsZXZlbCB9XSk7XG4gICAgfSwgW10pO1xuICAgIC8vIExvYWQgcHJldmlvdXMgZGlzY292ZXJ5IHJlc3VsdHMgZnJvbSBzdG9yZSBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzUmVzdWx0cyA9IGdldFJlc3VsdHNCeU1vZHVsZU5hbWUoJ0F6dXJlRGlzY292ZXJ5Jyk7XG4gICAgICAgIGlmIChwcmV2aW91c1Jlc3VsdHMgJiYgcHJldmlvdXNSZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQXp1cmVEaXNjb3ZlcnlIb29rXSBSZXN0b3JpbmcnLCBwcmV2aW91c1Jlc3VsdHMubGVuZ3RoLCAncHJldmlvdXMgcmVzdWx0cyBmcm9tIHN0b3JlJyk7XG4gICAgICAgICAgICBzZXRSZXN1bHRzKHByZXZpb3VzUmVzdWx0cyk7XG4gICAgICAgICAgICBhZGRMb2coYFJlc3RvcmVkICR7cHJldmlvdXNSZXN1bHRzLmxlbmd0aH0gcHJldmlvdXMgZGlzY292ZXJ5IHJlc3VsdChzKWAsICdpbmZvJyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZSwgYWRkTG9nXSk7XG4gICAgLy8gU2FmZXR5IG1lY2hhbmlzbTogUmVzZXQgc3RhdGUgaWYgZGlzY292ZXJ5IGlzIHJ1bm5pbmcgYnV0IGhhc24ndCByZWNlaXZlZCBldmVudHMgZm9yIHRvbyBsb25nXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFpc1J1bm5pbmcgfHwgIWN1cnJlbnRUb2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgbGV0IGxhc3RFdmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBldmVudE1vbml0b3IgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0RXZlbnQgPSBEYXRlLm5vdygpIC0gbGFzdEV2ZW50VGltZTtcbiAgICAgICAgICAgIC8vIElmIG5vIGV2ZW50cyBmb3IgNSBtaW51dGVzIGFuZCBwcm9jZXNzIGlzIG1hcmtlZCBhcyBydW5uaW5nLCBhc3N1bWUgaXQgY3Jhc2hlZFxuICAgICAgICAgICAgaWYgKHRpbWVTaW5jZUxhc3RFdmVudCA+IDUgKiA2MCAqIDEwMDApIHtcbiAgICAgICAgICAgICAgICBhZGRMb2coJ05vIGFjdGl2aXR5IGRldGVjdGVkIGZvciA1IG1pbnV0ZXMuIFJlc2V0dGluZyBzdGF0ZS4uLicsICd3YXJuaW5nJyk7XG4gICAgICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRJc0NhbmNlbGxpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldEN1cnJlbnRUb2tlbihudWxsKTtcbiAgICAgICAgICAgICAgICBzZXRMb2NhbFByb2dyZXNzKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAzMDAwMCk7IC8vIENoZWNrIGV2ZXJ5IDMwIHNlY29uZHNcbiAgICAgICAgLy8gVXBkYXRlIGxhc3QgZXZlbnQgdGltZSB3aGVuZXZlciBsb2dzIGNoYW5nZVxuICAgICAgICBjb25zdCB1cGRhdGVFdmVudFRpbWUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsYXN0RXZlbnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gTW9uaXRvciBsb2dzIGFycmF5IGNoYW5nZXMgYXMgaW5kaWNhdG9yIG9mIGFjdGl2aXR5XG4gICAgICAgIHVwZGF0ZUV2ZW50VGltZSgpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChldmVudE1vbml0b3IpO1xuICAgICAgICB9O1xuICAgIH0sIFtpc1J1bm5pbmcsIGN1cnJlbnRUb2tlbiwgbG9ncy5sZW5ndGgsIGFkZExvZ10pO1xuICAgIC8vIERpc2NvdmVyeSBldmVudCBoYW5kbGVycyAtIHNldCB1cCBPTkNFIG9uIG1vdW50IHRvIGF2b2lkIHJhY2UgY29uZGl0aW9uc1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gU2V0dGluZyB1cCBHTE9CQUwgZXZlbnQgbGlzdGVuZXJzIChtb3VudCknKTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVQcm9ncmVzcyA9IHdpbmRvdy5lbGVjdHJvbi5vbkRpc2NvdmVyeVByb2dyZXNzKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gUHJvZ3Jlc3MgZXZlbnQgcmVjZWl2ZWQ6JywgZGF0YSwgJ2N1cnJlbnRUb2tlblJlZjonLCBjdXJyZW50VG9rZW5SZWYuY3VycmVudCk7XG4gICAgICAgICAgICAvLyBDaGVjayBhZ2FpbnN0IHRoZSBDVVJSRU5UIHRva2VuIGF0IHRoZSB0aW1lIG9mIHRoZSBldmVudFxuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiBkYXRhLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2RhdGEuY3VycmVudFBoYXNlfSAoJHtkYXRhLml0ZW1zUHJvY2Vzc2VkIHx8IDB9LyR7ZGF0YS50b3RhbEl0ZW1zIHx8IDB9KWAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtOiBkYXRhLmN1cnJlbnRQaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgaXRlbXNQcm9jZXNzZWQ6IGRhdGEuaXRlbXNQcm9jZXNzZWQsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsSXRlbXM6IGRhdGEudG90YWxJdGVtcyxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlTmFtZTogJ0F6dXJlRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wZXJhdGlvbjogZGF0YS5jdXJyZW50UGhhc2UgfHwgJ1Byb2Nlc3NpbmcnLFxuICAgICAgICAgICAgICAgICAgICBvdmVyYWxsUHJvZ3Jlc3M6IGRhdGEucGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlUHJvZ3Jlc3M6IGRhdGEucGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnUnVubmluZycsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0TG9jYWxQcm9ncmVzcyhwcm9ncmVzc0RhdGEpO1xuICAgICAgICAgICAgICAgIHNldFByb2dyZXNzKHByb2dyZXNzRGF0YSk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKHByb2dyZXNzRGF0YS5tZXNzYWdlLCAnaW5mbycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIFByb2dyZXNzIGV2ZW50IGV4ZWN1dGlvbklkIG1pc21hdGNoOicsIGRhdGEuZXhlY3V0aW9uSWQsICd2cycsIGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlT3V0cHV0ID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5T3V0cHV0KChkYXRhKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gT3V0cHV0IGV2ZW50IHJlY2VpdmVkOicsIGRhdGEsICdjdXJyZW50VG9rZW5SZWY6JywgY3VycmVudFRva2VuUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9nTGV2ZWwgPSBkYXRhLmxldmVsID09PSAnZXJyb3InID8gJ2Vycm9yJyA6IGRhdGEubGV2ZWwgPT09ICd3YXJuaW5nJyA/ICd3YXJuaW5nJyA6ICdpbmZvJztcbiAgICAgICAgICAgICAgICBhZGRMb2coZGF0YS5tZXNzYWdlLCBsb2dMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gT3V0cHV0IGV2ZW50IGV4ZWN1dGlvbklkIG1pc21hdGNoOicsIGRhdGEuZXhlY3V0aW9uSWQsICd2cycsIGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlQ29tcGxldGUgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlDb21wbGV0ZSgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIENvbXBsZXRlIGV2ZW50IHJlY2VpdmVkOicsIGRhdGEsICdjdXJyZW50VG9rZW5SZWY6JywgY3VycmVudFRva2VuUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogYGF6dXJlLWRpc2NvdmVyeS0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0F6dXJlIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdBenVyZURpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnTWljcm9zb2Z0IDM2NSAvIEF6dXJlIEFEIERpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1Db3VudDogZGF0YT8ucmVzdWx0Py50b3RhbEl0ZW1zIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdmVyeVRpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IGRhdGEuZHVyYXRpb24gfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnQ29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6IGRhdGE/LnJlc3VsdD8ub3V0cHV0UGF0aCB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogYERpc2NvdmVyZWQgJHtkYXRhPy5yZXN1bHQ/LnRvdGFsSXRlbXMgfHwgMH0gaXRlbXMgZnJvbSAke3NlbGVjdGVkU291cmNlUHJvZmlsZT8uY29tcGFueU5hbWUgfHwgJ3RlbmFudCd9YCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbERhdGE6IGRhdGEucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldFJlc3VsdHMoW2Rpc2NvdmVyeVJlc3VsdF0pO1xuICAgICAgICAgICAgICAgIGFkZFJlc3VsdChkaXNjb3ZlcnlSZXN1bHQpO1xuICAgICAgICAgICAgICAgIGFkZExvZyhgRGlzY292ZXJ5IGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkhIEZvdW5kICR7ZGF0YT8ucmVzdWx0Py50b3RhbEl0ZW1zfSBpdGVtcy5gLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIHNldElzUnVubmluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0SXNDYW5jZWxsaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRDdXJyZW50VG9rZW4obnVsbCk7XG4gICAgICAgICAgICAgICAgc2V0TG9jYWxQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlRXJyb3IgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlFcnJvcigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIEVycm9yIGV2ZW50IHJlY2VpdmVkOicsIGRhdGEsICdjdXJyZW50VG9rZW5SZWY6JywgY3VycmVudFRva2VuUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoZGF0YS5lcnJvcik7XG4gICAgICAgICAgICAgICAgYWRkTG9nKGAke2RhdGEuZXJyb3J9YCwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRJc0NhbmNlbGxpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldEN1cnJlbnRUb2tlbihudWxsKTtcbiAgICAgICAgICAgICAgICBzZXRMb2NhbFByb2dyZXNzKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdW5zdWJzY3JpYmVDYW5jZWxsZWQgPSB3aW5kb3cuZWxlY3Ryb24ub25EaXNjb3ZlcnlDYW5jZWxsZWQ/LigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIENhbmNlbGxlZCBldmVudCByZWNlaXZlZDonLCBkYXRhLCAnY3VycmVudFRva2VuUmVmOicsIGN1cnJlbnRUb2tlblJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjdXJyZW50VG9rZW5SZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGFkZExvZygnRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyJywgJ3dhcm5pbmcnKTtcbiAgICAgICAgICAgICAgICBzZXRJc1J1bm5pbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldElzQ2FuY2VsbGluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0Q3VycmVudFRva2VuKG51bGwpO1xuICAgICAgICAgICAgICAgIHNldExvY2FsUHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIENsZWFuaW5nIHVwIGV2ZW50IGxpc3RlbmVycycpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlUHJvZ3Jlc3MpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVQcm9ncmVzcygpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlT3V0cHV0KVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlT3V0cHV0KCk7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmVDb21wbGV0ZSlcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZUNvbXBsZXRlKCk7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmVFcnJvcilcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmVDYW5jZWxsZWQpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVDYW5jZWxsZWQoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7IC8vIEVtcHR5IGRlcGVuZGVuY3kgYXJyYXkgLSBzZXQgdXAgb25jZSBvbiBtb3VudCB0byBhdm9pZCByYWNlIGNvbmRpdGlvbnNcbiAgICAvLyBUZXN0IGNvbm5lY3Rpb24gdG8gQXp1cmVcbiAgICBjb25zdCB0ZXN0Q29ubmVjdGlvbiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldENvbm5lY3Rpb25TdGF0dXMoJ2Vycm9yJyk7XG4gICAgICAgICAgICBhZGRMb2coJ05vIGNvbXBhbnkgcHJvZmlsZSBzZWxlY3RlZCcsICdlcnJvcicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldENvbm5lY3Rpb25TdGF0dXMoJ2Nvbm5lY3RpbmcnKTtcbiAgICAgICAgYWRkTG9nKCdUZXN0aW5nIGNvbm5lY3Rpb24gdG8gQXp1cmUgQUQuLi4nLCAnaW5mbycpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZWxlY3Ryb25BUEkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICAgICAgYXdhaXQgZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeU1vZHVsZSgnQXp1cmUnLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWUsIHtcbiAgICAgICAgICAgICAgICBUZXN0Q29ubmVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0Q29ubmVjdGlvblN0YXR1cygnY29ubmVjdGVkJyk7XG4gICAgICAgICAgICBhZGRMb2coYENvbm5lY3Rpb24gc3VjY2Vzc2Z1bCEgVGVuYW50OiAke3NlbGVjdGVkU291cmNlUHJvZmlsZS50ZW5hbnRJZCB8fCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWV9YCwgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRDb25uZWN0aW9uU3RhdHVzKCdlcnJvcicpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBhZGRMb2coYENvbm5lY3Rpb24gZmFpbGVkOiAke2Vycm9yTWVzc2FnZX1gLCAnZXJyb3InKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGFkZExvZ10pO1xuICAgIC8vIFN0YXJ0IGRpc2NvdmVyeVxuICAgIGNvbnN0IHN0YXJ0RGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBDaGVjayBpZiBhIHByb2ZpbGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdObyBjb21wYW55IHByb2ZpbGUgc2VsZWN0ZWQuIFBsZWFzZSBzZWxlY3QgYSBwcm9maWxlIGZpcnN0Lic7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgYWRkTG9nKGVycm9yTWVzc2FnZSwgJ2Vycm9yJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0Zvcm1WYWxpZCkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gJ1BsZWFzZSBzZWxlY3QgYXQgbGVhc3Qgb25lIHNlcnZpY2UgdG8gZGlzY292ZXInO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGFkZExvZyhlcnJvck1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzUnVubmluZyh0cnVlKTtcbiAgICAgICAgc2V0SXNDYW5jZWxsaW5nKGZhbHNlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldFJlc3VsdHMoW10pO1xuICAgICAgICBzZXRMb2dzKFtdKTtcbiAgICAgICAgc2V0U2hvd0V4ZWN1dGlvbkRpYWxvZyh0cnVlKTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBgYXp1cmUtZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX1gO1xuICAgICAgICBzZXRDdXJyZW50VG9rZW4odG9rZW4pO1xuICAgICAgICBjdXJyZW50VG9rZW5SZWYuY3VycmVudCA9IHRva2VuOyAvLyBVcGRhdGUgcmVmIGltbWVkaWF0ZWx5IHNvIGV2ZW50IGhhbmRsZXJzIGhhdmUgdGhlIGxhdGVzdCB2YWx1ZVxuICAgICAgICBjb25zb2xlLmxvZyhgW0F6dXJlRGlzY292ZXJ5SG9va10gU3RhcnRpbmcgQXp1cmUgZGlzY292ZXJ5IGZvciBjb21wYW55OiAke3NlbGVjdGVkU291cmNlUHJvZmlsZS5jb21wYW55TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tBenVyZURpc2NvdmVyeUhvb2tdIEZ1bGwgcHJvZmlsZTonLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgICAgICBhZGRMb2coYFN0YXJ0aW5nIEF6dXJlIGRpc2NvdmVyeSBmb3IgJHtzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWV9Li4uYCwgJ2luZm8nKTtcbiAgICAgICAgY29uc3QgdGVuYW50SWQgPSBzZWxlY3RlZFNvdXJjZVByb2ZpbGUudGVuYW50SWQgfHwgc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNyZWRlbnRpYWxzPy5henVyZVRlbmFudElkIHx8ICdOL0EnO1xuICAgICAgICBjb25zdCBjbGllbnRJZCA9IHNlbGVjdGVkU291cmNlUHJvZmlsZS5jbGllbnRJZCB8fCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY3JlZGVudGlhbHM/LmF6dXJlQ2xpZW50SWQgfHwgJ04vQSc7XG4gICAgICAgIGFkZExvZyhgVGVuYW50IElEOiAke3RlbmFudElkfWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgQ2xpZW50IElEOiAke2NsaWVudElkfWAsICdpbmZvJyk7XG4gICAgICAgIGFkZExvZyhgUHJvZmlsZSBoYXMgY3JlZGVudGlhbHM6ICR7ISEoc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNyZWRlbnRpYWxzKSA/ICdZZXMnIDogJ05vJ31gLCAnaW5mbycpO1xuICAgICAgICAvLyBMb2cgc2VsZWN0ZWQgc2VydmljZXNcbiAgICAgICAgY29uc3Qgc2VydmljZXMgPSBbXTtcbiAgICAgICAgaWYgKGZvcm1EYXRhLmluY2x1ZGVVc2VycylcbiAgICAgICAgICAgIHNlcnZpY2VzLnB1c2goJ1VzZXJzJyk7XG4gICAgICAgIGlmIChmb3JtRGF0YS5pbmNsdWRlR3JvdXBzKVxuICAgICAgICAgICAgc2VydmljZXMucHVzaCgnR3JvdXBzJyk7XG4gICAgICAgIGlmIChmb3JtRGF0YS5pbmNsdWRlVGVhbXMpXG4gICAgICAgICAgICBzZXJ2aWNlcy5wdXNoKCdUZWFtcycpO1xuICAgICAgICBpZiAoZm9ybURhdGEuaW5jbHVkZVNoYXJlUG9pbnQpXG4gICAgICAgICAgICBzZXJ2aWNlcy5wdXNoKCdTaGFyZVBvaW50Jyk7XG4gICAgICAgIGlmIChmb3JtRGF0YS5pbmNsdWRlT25lRHJpdmUpXG4gICAgICAgICAgICBzZXJ2aWNlcy5wdXNoKCdPbmVEcml2ZScpO1xuICAgICAgICBpZiAoZm9ybURhdGEuaW5jbHVkZUV4Y2hhbmdlKVxuICAgICAgICAgICAgc2VydmljZXMucHVzaCgnRXhjaGFuZ2UnKTtcbiAgICAgICAgaWYgKGZvcm1EYXRhLmluY2x1ZGVMaWNlbnNlcylcbiAgICAgICAgICAgIHNlcnZpY2VzLnB1c2goJ0xpY2Vuc2VzJyk7XG4gICAgICAgIGFkZExvZyhgU2VydmljZXM6ICR7c2VydmljZXMuam9pbignLCAnKX1gLCAnaW5mbycpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW0F6dXJlRGlzY292ZXJ5SG9va10gUGFyYW1ldGVyczpgLCB7XG4gICAgICAgICAgICBpbmNsdWRlVXNlcnM6IGZvcm1EYXRhLmluY2x1ZGVVc2VycyxcbiAgICAgICAgICAgIGluY2x1ZGVHcm91cHM6IGZvcm1EYXRhLmluY2x1ZGVHcm91cHMsXG4gICAgICAgICAgICBpbmNsdWRlVGVhbXM6IGZvcm1EYXRhLmluY2x1ZGVUZWFtcyxcbiAgICAgICAgICAgIGluY2x1ZGVTaGFyZVBvaW50OiBmb3JtRGF0YS5pbmNsdWRlU2hhcmVQb2ludCxcbiAgICAgICAgICAgIGluY2x1ZGVPbmVEcml2ZTogZm9ybURhdGEuaW5jbHVkZU9uZURyaXZlLFxuICAgICAgICAgICAgaW5jbHVkZUV4Y2hhbmdlOiBmb3JtRGF0YS5pbmNsdWRlRXhjaGFuZ2UsXG4gICAgICAgICAgICBpbmNsdWRlTGljZW5zZXM6IGZvcm1EYXRhLmluY2x1ZGVMaWNlbnNlcyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhZGRMb2coJ0Nvbm5lY3RpbmcgdG8gQXp1cmUgYW5kIGluaXRpYWxpemluZyBkaXNjb3ZlcnkuLi4nLCAnaW5mbycpO1xuICAgICAgICAgICAgLy8gVXNlIHRoZSBjb3JyZWN0IGRpc2NvdmVyeTpleGVjdXRlIGhhbmRsZXIgdGhhdCBlbWl0cyBzdHJlYW1pbmcgZXZlbnRzXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gQ2FsbGluZyBleGVjdXRlRGlzY292ZXJ5IHdpdGggdG9rZW46JywgdG9rZW4pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uLmV4ZWN1dGVEaXNjb3Zlcnkoe1xuICAgICAgICAgICAgICAgIG1vZHVsZU5hbWU6ICdBenVyZScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlVXNlcnM6IGZvcm1EYXRhLmluY2x1ZGVVc2VycyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZUdyb3VwczogZm9ybURhdGEuaW5jbHVkZUdyb3VwcyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVRlYW1zOiBmb3JtRGF0YS5pbmNsdWRlVGVhbXMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVTaGFyZVBvaW50OiBmb3JtRGF0YS5pbmNsdWRlU2hhcmVQb2ludCxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZU9uZURyaXZlOiBmb3JtRGF0YS5pbmNsdWRlT25lRHJpdmUsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVFeGNoYW5nZTogZm9ybURhdGEuaW5jbHVkZUV4Y2hhbmdlLFxuICAgICAgICAgICAgICAgICAgICBJbmNsdWRlTGljZW5zZXM6IGZvcm1EYXRhLmluY2x1ZGVMaWNlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgTWF4UmVzdWx0czogZm9ybURhdGEubWF4UmVzdWx0cyxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogZm9ybURhdGEudGltZW91dCAqIDEwMDAsIC8vIENvbnZlcnQgdG8gbWlsbGlzZWNvbmRzXG4gICAgICAgICAgICAgICAgICAgIHNob3dXaW5kb3c6IGZvcm1EYXRhLnNob3dXaW5kb3csIC8vIFBhc3Mgc2hvd1dpbmRvdyBwYXJhbWV0ZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGV4ZWN1dGlvbklkOiB0b2tlbiwgLy8gUGFzcyB0aGUgdG9rZW4gc28gZXZlbnRzIGFyZSBtYXRjaGVkIGNvcnJlY3RseVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0F6dXJlRGlzY292ZXJ5SG9va10gRGlzY292ZXJ5IGV4ZWN1dGlvbiBjb21wbGV0ZWQ6JywgcmVzdWx0KTtcbiAgICAgICAgICAgIGFkZExvZygnRGlzY292ZXJ5IGV4ZWN1dGlvbiBjYWxsIGNvbXBsZXRlZCcsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICAvLyBOb3RlOiBDb21wbGV0aW9uIHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgZGlzY292ZXJ5OmNvbXBsZXRlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICAvLyBEb24ndCBzZXQgaXNSdW5uaW5nIHRvIGZhbHNlIGhlcmUgYXMgdGhlIGV2ZW50IGxpc3RlbmVyIHdpbGwgZG8gaXRcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGFkZExvZyhlcnJvck1lc3NhZ2UsICdlcnJvcicpO1xuICAgICAgICAgICAgc2V0SXNSdW5uaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldEN1cnJlbnRUb2tlbihudWxsKTtcbiAgICAgICAgICAgIHNldExvY2FsUHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgIH1cbiAgICB9LCBbZm9ybURhdGEsIGlzRm9ybVZhbGlkLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGFkZExvZ10pO1xuICAgIC8vIENhbmNlbCBkaXNjb3ZlcnlcbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghY3VycmVudFRva2VuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0NhbmNlbGxpbmcodHJ1ZSk7XG4gICAgICAgIGFkZExvZygnQ2FuY2VsbGluZyBkaXNjb3ZlcnkuLi4nLCAnd2FybmluZycpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uLmNhbmNlbERpc2NvdmVyeShjdXJyZW50VG9rZW4pO1xuICAgICAgICAgICAgYWRkTG9nKCdEaXNjb3ZlcnkgY2FuY2VsbGF0aW9uIHJlcXVlc3RlZCBzdWNjZXNzZnVsbHknLCAnaW5mbycpO1xuICAgICAgICAgICAgLy8gU2V0IGEgdGltZW91dCB0byByZXNldCBzdGF0ZSBpbiBjYXNlIHRoZSBjYW5jZWxsZWQgZXZlbnQgZG9lc24ndCBmaXJlXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRJc1J1bm5pbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHNldElzQ2FuY2VsbGluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgc2V0Q3VycmVudFRva2VuKG51bGwpO1xuICAgICAgICAgICAgICAgIHNldExvY2FsUHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKCdEaXNjb3ZlcnkgY2FuY2VsbGVkIC0gcmVzZXQgdG8gc3RhcnQgc3RhdGUnLCAnd2FybmluZycpO1xuICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYWRkTG9nKGBFcnJvciBjYW5jZWxsaW5nOiAke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcid9YCwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZSBldmVuIG9uIGVycm9yXG4gICAgICAgICAgICBzZXRJc1J1bm5pbmcoZmFsc2UpO1xuICAgICAgICAgICAgc2V0SXNDYW5jZWxsaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldEN1cnJlbnRUb2tlbihudWxsKTtcbiAgICAgICAgICAgIHNldExvY2FsUHJvZ3Jlc3MobnVsbCk7XG4gICAgICAgIH1cbiAgICB9LCBbY3VycmVudFRva2VuLCBhZGRMb2ddKTtcbiAgICAvLyBFeHBvcnQgcmVzdWx0c1xuICAgIGNvbnN0IGV4cG9ydFJlc3VsdHMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgYXBpID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgYXBpLndyaXRlRmlsZShgYXp1cmUtZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX0uanNvbmAsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMsIG51bGwsIDIpKTtcbiAgICB9LCBbcmVzdWx0c10pO1xuICAgIC8vIENsZWFyIGxvZ3NcbiAgICBjb25zdCBjbGVhckxvZ3MgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldExvZ3MoW10pO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBGb3JtIHN0YXRlXG4gICAgICAgIGZvcm1EYXRhLFxuICAgICAgICB1cGRhdGVGb3JtRmllbGQsXG4gICAgICAgIHJlc2V0Rm9ybSxcbiAgICAgICAgaXNGb3JtVmFsaWQsXG4gICAgICAgIC8vIEV4ZWN1dGlvbiBzdGF0ZVxuICAgICAgICBpc1J1bm5pbmcsXG4gICAgICAgIGlzQ2FuY2VsbGluZyxcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIHJlc3VsdDogcmVzdWx0cyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGxvZ3MsXG4gICAgICAgIGNvbm5lY3Rpb25TdGF0dXMsXG4gICAgICAgIHNob3dFeGVjdXRpb25EaWFsb2csXG4gICAgICAgIHNldFNob3dFeGVjdXRpb25EaWFsb2csXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgdGVzdENvbm5lY3Rpb24sXG4gICAgICAgIHN0YXJ0RGlzY292ZXJ5LFxuICAgICAgICBjYW5jZWxEaXNjb3ZlcnksXG4gICAgICAgIGV4cG9ydFJlc3VsdHMsXG4gICAgICAgIGNsZWFyTG9ncyxcbiAgICAgICAgLy8gUHJvZmlsZSBpbmZvXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgLy8gQWRkaXRpb25hbCBwcm9wZXJ0aWVzIGZvciB2aWV3IGNvbXBhdGliaWxpdHlcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogaXNSdW5uaW5nLFxuICAgICAgICBjdXJyZW50UmVzdWx0OiByZXN1bHRzLFxuICAgIH07XG59O1xuIiwiLyoqXG4gKiBEaXNjb3ZlcnkgU3RvcmVcbiAqXG4gKiBNYW5hZ2VzIGRpc2NvdmVyeSBvcGVyYXRpb25zLCByZXN1bHRzLCBhbmQgc3RhdGUuXG4gKiBIYW5kbGVzIGRvbWFpbiwgbmV0d29yaywgdXNlciwgYW5kIGFwcGxpY2F0aW9uIGRpc2NvdmVyeSBwcm9jZXNzZXMuXG4gKi9cbmltcG9ydCB7IGNyZWF0ZSB9IGZyb20gJ3p1c3RhbmQnO1xuaW1wb3J0IHsgZGV2dG9vbHMsIHN1YnNjcmliZVdpdGhTZWxlY3RvciB9IGZyb20gJ3p1c3RhbmQvbWlkZGxld2FyZSc7XG5leHBvcnQgY29uc3QgdXNlRGlzY292ZXJ5U3RvcmUgPSBjcmVhdGUoKShkZXZ0b29scyhzdWJzY3JpYmVXaXRoU2VsZWN0b3IoKHNldCwgZ2V0KSA9PiAoe1xuICAgIC8vIEluaXRpYWwgc3RhdGVcbiAgICBvcGVyYXRpb25zOiBuZXcgTWFwKCksXG4gICAgcmVzdWx0czogbmV3IE1hcCgpLFxuICAgIHNlbGVjdGVkT3BlcmF0aW9uOiBudWxsLFxuICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgIC8vIEFjdGlvbnNcbiAgICAvKipcbiAgICAgKiBTdGFydCBhIG5ldyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgc3RhcnREaXNjb3Zlcnk6IGFzeW5jICh0eXBlLCBwYXJhbWV0ZXJzKSA9PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbklkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3QgY2FuY2VsbGF0aW9uVG9rZW4gPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICBjb25zdCBvcGVyYXRpb24gPSB7XG4gICAgICAgICAgICBpZDogb3BlcmF0aW9uSWQsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgc3RhdHVzOiAncnVubmluZycsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbml0aWFsaXppbmcgZGlzY292ZXJ5Li4uJyxcbiAgICAgICAgICAgIGl0ZW1zRGlzY292ZXJlZDogMCxcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgb3BlcmF0aW9uIHRvIHN0YXRlXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5zZXQob3BlcmF0aW9uSWQsIG9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRPcGVyYXRpb246IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2V0dXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NDbGVhbnVwID0gd2luZG93LmVsZWN0cm9uQVBJLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIGdldCgpLnVwZGF0ZVByb2dyZXNzKG9wZXJhdGlvbklkLCBkYXRhLnBlcmNlbnRhZ2UsIGRhdGEubWVzc2FnZSB8fCAnUHJvY2Vzc2luZy4uLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgZGlzY292ZXJ5IG1vZHVsZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IGBNb2R1bGVzL0Rpc2NvdmVyeS8ke3R5cGV9LnBzbTFgLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogYFN0YXJ0LSR7dHlwZX1EaXNjb3ZlcnlgLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMsXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtT3V0cHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDAsIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIENsZWFudXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgICAgIHByb2dyZXNzQ2xlYW51cCgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgZ2V0KCkuY29tcGxldGVEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5kYXRhPy5yZXN1bHRzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdldCgpLmZhaWxEaXNjb3Zlcnkob3BlcmF0aW9uSWQsIHJlc3VsdC5lcnJvciB8fCAnRGlzY292ZXJ5IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBnZXQoKS5mYWlsRGlzY292ZXJ5KG9wZXJhdGlvbklkLCBlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbklkO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGEgcnVubmluZyBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgY2FuY2VsRGlzY292ZXJ5OiBhc3luYyAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICBpZiAoIW9wZXJhdGlvbiB8fCBvcGVyYXRpb24uc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihvcGVyYXRpb24uY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnY2FuY2VsbGVkJztcbiAgICAgICAgICAgICAgICAgICAgb3AubWVzc2FnZSA9ICdEaXNjb3ZlcnkgY2FuY2VsbGVkIGJ5IHVzZXInO1xuICAgICAgICAgICAgICAgICAgICBvcC5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IEFycmF5LmZyb20obmV3T3BlcmF0aW9ucy52YWx1ZXMoKSkuc29tZShvID0+IG8uc3RhdHVzID09PSAncnVubmluZycpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHByb2dyZXNzIGZvciBhIHJ1bm5pbmcgb3BlcmF0aW9uXG4gICAgICovXG4gICAgdXBkYXRlUHJvZ3Jlc3M6IChvcGVyYXRpb25JZCwgcHJvZ3Jlc3MsIG1lc3NhZ2UpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uICYmIG9wZXJhdGlvbi5zdGF0dXMgPT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IHByb2dyZXNzO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIG9wZXJhdGlvbiBhcyBjb21wbGV0ZWQgd2l0aCByZXN1bHRzXG4gICAgICovXG4gICAgY29tcGxldGVEaXNjb3Zlcnk6IChvcGVyYXRpb25JZCwgcmVzdWx0cykgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5zdGF0dXMgPSAnY29tcGxldGVkJztcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24ucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJlZCAke3Jlc3VsdHMubGVuZ3RofSBpdGVtc2A7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLml0ZW1zRGlzY292ZXJlZCA9IHJlc3VsdHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChvcGVyYXRpb25JZCwgcmVzdWx0cyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBBcnJheS5mcm9tKG5ld09wZXJhdGlvbnMudmFsdWVzKCkpLnNvbWUobyA9PiBvLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBvcGVyYXRpb24gYXMgZmFpbGVkXG4gICAgICovXG4gICAgZmFpbERpc2NvdmVyeTogKG9wZXJhdGlvbklkLCBlcnJvcikgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLmVycm9yID0gZXJyb3I7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLm1lc3NhZ2UgPSBgRGlzY292ZXJ5IGZhaWxlZDogJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5jb21wbGV0ZWRBdCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogQXJyYXkuZnJvbShuZXdPcGVyYXRpb25zLnZhbHVlcygpKS5zb21lKG8gPT4gby5zdGF0dXMgPT09ICdydW5uaW5nJyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENsZWFyIGEgc2luZ2xlIG9wZXJhdGlvbiBhbmQgaXRzIHJlc3VsdHNcbiAgICAgKi9cbiAgICBjbGVhck9wZXJhdGlvbjogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbmV3UmVzdWx0cyA9IG5ldyBNYXAoc3RhdGUucmVzdWx0cyk7XG4gICAgICAgICAgICBuZXdPcGVyYXRpb25zLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBuZXdSZXN1bHRzLmRlbGV0ZShvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgcmVzdWx0czogbmV3UmVzdWx0cyxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE9wZXJhdGlvbjogc3RhdGUuc2VsZWN0ZWRPcGVyYXRpb24gPT09IG9wZXJhdGlvbklkID8gbnVsbCA6IHN0YXRlLnNlbGVjdGVkT3BlcmF0aW9uLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgb3BlcmF0aW9ucyBhbmQgcmVzdWx0c1xuICAgICAqL1xuICAgIGNsZWFyQWxsT3BlcmF0aW9uczogKCkgPT4ge1xuICAgICAgICAvLyBPbmx5IGNsZWFyIGNvbXBsZXRlZCwgZmFpbGVkLCBvciBjYW5jZWxsZWQgb3BlcmF0aW9uc1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Jlc3VsdHMgPSBuZXcgTWFwKHN0YXRlLnJlc3VsdHMpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBbaWQsIG9wZXJhdGlvbl0gb2YgbmV3T3BlcmF0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAob3BlcmF0aW9uLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3UmVzdWx0cy5kZWxldGUoaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiBuZXdSZXN1bHRzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IHJlc3VsdHMgZm9yIGEgc3BlY2lmaWMgb3BlcmF0aW9uXG4gICAgICovXG4gICAgZ2V0UmVzdWx0czogKG9wZXJhdGlvbklkKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5yZXN1bHRzLmdldChvcGVyYXRpb25JZCk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgcmVzdWx0cyBieSBtb2R1bGUgbmFtZSAoZm9yIHBlcnNpc3RlbnQgcmV0cmlldmFsIGFjcm9zcyBjb21wb25lbnQgcmVtb3VudHMpXG4gICAgICovXG4gICAgZ2V0UmVzdWx0c0J5TW9kdWxlTmFtZTogKG1vZHVsZU5hbWUpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJlc3VsdHMuZ2V0KG1vZHVsZU5hbWUpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQWRkIGEgZGlzY292ZXJ5IHJlc3VsdCAoY29tcGF0aWJpbGl0eSBtZXRob2QgZm9yIGhvb2tzKVxuICAgICAqL1xuICAgIGFkZFJlc3VsdDogKHJlc3VsdCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdSZXN1bHRzID0gbmV3IE1hcChzdGF0ZS5yZXN1bHRzKTtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0cyA9IG5ld1Jlc3VsdHMuZ2V0KHJlc3VsdC5tb2R1bGVOYW1lKSB8fCBbXTtcbiAgICAgICAgICAgIG5ld1Jlc3VsdHMuc2V0KHJlc3VsdC5tb2R1bGVOYW1lLCBbLi4uZXhpc3RpbmdSZXN1bHRzLCByZXN1bHRdKTtcbiAgICAgICAgICAgIHJldHVybiB7IHJlc3VsdHM6IG5ld1Jlc3VsdHMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTZXQgcHJvZ3Jlc3MgaW5mb3JtYXRpb24gKGNvbXBhdGliaWxpdHkgbWV0aG9kIGZvciBob29rcylcbiAgICAgKi9cbiAgICBzZXRQcm9ncmVzczogKHByb2dyZXNzRGF0YSkgPT4ge1xuICAgICAgICAvLyBGaW5kIHRoZSBjdXJyZW50IG9wZXJhdGlvbiBmb3IgdGhpcyBtb2R1bGUgYW5kIHVwZGF0ZSBpdFxuICAgICAgICBjb25zdCBvcGVyYXRpb25zID0gZ2V0KCkub3BlcmF0aW9ucztcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBBcnJheS5mcm9tKG9wZXJhdGlvbnMua2V5cygpKS5maW5kKGlkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wID0gb3BlcmF0aW9ucy5nZXQoaWQpO1xuICAgICAgICAgICAgcmV0dXJuIG9wICYmIG9wLnR5cGUgPT09IHByb2dyZXNzRGF0YS5tb2R1bGVOYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wZXJhdGlvbklkKSB7XG4gICAgICAgICAgICBnZXQoKS51cGRhdGVQcm9ncmVzcyhvcGVyYXRpb25JZCwgcHJvZ3Jlc3NEYXRhLm92ZXJhbGxQcm9ncmVzcywgcHJvZ3Jlc3NEYXRhLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcbn0pKSwge1xuICAgIG5hbWU6ICdEaXNjb3ZlcnlTdG9yZScsXG59KSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=