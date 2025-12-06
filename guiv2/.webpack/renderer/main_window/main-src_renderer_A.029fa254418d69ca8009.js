"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2429],{

/***/ 1156:
/*!**************************************************!*\
  !*** ./src/renderer/components/atoms/Select.tsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Select: () => (/* binding */ Select)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * Select Component
 *
 * Fully accessible dropdown select component with error states and validation.
 * Follows WCAG 2.1 AA guidelines.
 */


/**
 * Select Component
 */
const Select = ({ label, name, value, onChange, options, placeholder = 'Select an option...', error, helperText, required = false, disabled = false, className, 'data-cy': dataCy, }) => {
    const id = (0,react__WEBPACK_IMPORTED_MODULE_1__.useId)();
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };
    const selectClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'block w-full rounded-md border px-3 py-2 shadow-sm', 'text-base leading-6', 'transition-colors duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 
    // State-based styles
    {
        // Normal state
        'border-gray-300 bg-white text-gray-900': !hasError && !disabled,
        'focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,
        // Error state
        'border-red-300 bg-red-50 text-red-900': hasError && !disabled,
        'focus:border-red-500 focus:ring-red-500': hasError && !disabled,
        // Disabled state
        'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    }, className);
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block text-sm font-medium mb-1', {
        'text-gray-700': !hasError,
        'text-red-700': hasError,
        'text-gray-500': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "w-full", children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: id, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "ml-1 text-red-500", "aria-label": "required", children: "*" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { id: id, name: name, value: value, onChange: handleChange, disabled: disabled, required: required, className: selectClasses, "aria-invalid": hasError, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                    [errorId]: hasError,
                    [helperId]: helperText && !hasError,
                }), "aria-required": required, "data-cy": dataCy, children: [placeholder && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "", disabled: true, children: placeholder })), options.map((option) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }), hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: errorId, className: "mt-1 text-sm text-red-600", role: "alert", "aria-live": "polite", children: error })), helperText && !hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: helperId, className: "mt-1 text-sm text-gray-500", children: helperText }))] }));
};
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (Select)));


/***/ }),

/***/ 14503:
/*!*******************************************!*\
  !*** ./src/renderer/App.tsx + 11 modules ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ renderer_App)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/index.js
var dist = __webpack_require__(84976);
// EXTERNAL MODULE: ./node_modules/react-dnd/dist/index.js + 44 modules
var react_dnd_dist = __webpack_require__(64074);
// EXTERNAL MODULE: ./node_modules/react-dnd-html5-backend/dist/index.js + 13 modules
var react_dnd_html5_backend_dist = __webpack_require__(33631);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
;// ./src/renderer/components/ErrorBoundary.tsx

/**
 * Error Boundary Component
 *
 * Catches React errors in the component tree and displays a fallback UI.
 * Logs errors for debugging and provides recovery options.
 */



class ErrorBoundary extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showErrorDetails: false,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Update state
        this.setState({
            errorInfo,
        });
        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Send error to main process for logging
        if (window.electron?.logError) {
            window.electron.logError({
                message: error.message,
                stack: error.stack || '',
                componentStack: errorInfo.componentStack || '',
                timestamp: new Date().toISOString(),
            });
        }
    }
    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showErrorDetails: false,
        });
    };
    handleGoHome = () => {
        window.location.hash = '#/';
        this.handleReset();
    };
    handleReload = () => {
        window.location.reload();
    };
    toggleErrorDetails = () => {
        this.setState(prevState => ({
            showErrorDetails: !prevState.showErrorDetails,
        }));
    };
    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const { error, errorInfo, showErrorDetails } = this.state;
            return ((0,jsx_runtime.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", children: (0,jsx_runtime.jsxs)("div", { className: "max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8", children: [(0,jsx_runtime.jsx)("div", { className: "flex justify-center mb-6", children: (0,jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center", children: (0,jsx_runtime.jsx)(lucide_react.AlertCircle, { className: "w-10 h-10 text-red-600 dark:text-red-400" }) }) }), (0,jsx_runtime.jsxs)("div", { className: "text-center mb-8", children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Something Went Wrong" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "We apologize for the inconvenience. An unexpected error has occurred." })] }), this.props.showDetails !== false && ((0,jsx_runtime.jsxs)("div", { className: "mb-6", children: [(0,jsx_runtime.jsxs)("button", { onClick: this.toggleErrorDetails, className: "flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2", children: [(0,jsx_runtime.jsx)(lucide_react.Bug, { className: "w-4 h-4" }), showErrorDetails ? 'Hide' : 'Show', " Error Details"] }), showErrorDetails && ((0,jsx_runtime.jsxs)("div", { className: "bg-gray-100 dark:bg-gray-900 rounded-md p-4 space-y-4", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-1", children: "Error Message:" }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-red-600 dark:text-red-400 font-mono", children: error?.message || 'Unknown error' })] }), error?.stack && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-1", children: "Stack Trace:" }), (0,jsx_runtime.jsx)("pre", { className: "text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded", children: error.stack })] })), errorInfo?.componentStack && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-1", children: "Component Stack:" }), (0,jsx_runtime.jsx)("pre", { className: "text-xs text-gray-700 dark:text-gray-300 font-mono overflow-x-auto bg-white dark:bg-gray-800 p-2 rounded max-h-40", children: errorInfo.componentStack })] }))] }))] })), (0,jsx_runtime.jsxs)("div", { className: "flex flex-col sm:flex-row gap-3", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: this.handleReset, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), className: "flex-1", children: "Try Again" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: this.handleGoHome, icon: (0,jsx_runtime.jsx)(lucide_react.Home, { className: "w-4 h-4" }), className: "flex-1", children: "Go to Home" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: this.handleReload, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), className: "flex-1", children: "Reload App" })] }), (0,jsx_runtime.jsx)("div", { className: "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 text-center", children: "If this problem persists, please contact support with the error details above." }) })] }) }));
        }
        return this.props.children;
    }
}
/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
function withErrorBoundary(Component, errorBoundaryProps) {
    return (props) => (_jsx(ErrorBoundary, { ...errorBoundaryProps, children: _jsx(Component, { ...props }) }));
}
/* harmony default export */ const components_ErrorBoundary = ((/* unused pure expression or super */ null && (ErrorBoundary)));

// EXTERNAL MODULE: ./src/renderer/store/useNotificationStore.ts
var useNotificationStore = __webpack_require__(79455);
;// ./src/renderer/components/NotificationContainer.tsx

/**
 * Notification Container Component
 *
 * Displays toast notifications in the UI.
 */



const NotificationContainer = () => {
    const notifications = (0,useNotificationStore.useNotificationStore)((state) => state.toasts);
    const dismissToast = (0,useNotificationStore.useNotificationStore)((state) => state.dismissToast);
    const handleDismiss = (id) => {
        dismissToast(id);
    };
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return (0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'error':
                return (0,jsx_runtime.jsx)(lucide_react.XCircle, { className: "w-5 h-5 text-red-500" });
            case 'warning':
                return (0,jsx_runtime.jsx)(lucide_react.AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            case 'info':
                return (0,jsx_runtime.jsx)(lucide_react.Info, { className: "w-5 h-5 text-blue-500" });
            default:
                return (0,jsx_runtime.jsx)(lucide_react.Info, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getBackgroundClass = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };
    const getTextClass = (type) => {
        switch (type) {
            case 'success':
                return 'text-green-800 dark:text-green-200';
            case 'error':
                return 'text-red-800 dark:text-red-200';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-gray-800 dark:text-gray-200';
        }
    };
    const getActions = (notification) => {
        const legacyAction = notification.action;
        const optionActions = notification.options?.actions ?? [];
        return legacyAction ? [legacyAction, ...optionActions] : optionActions;
    };
    if (notifications.length === 0) {
        return null;
    }
    return ((0,jsx_runtime.jsx)("div", { className: "fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md", children: notifications.map((notification) => {
            const actions = getActions(notification);
            return ((0,jsx_runtime.jsxs)("div", { className: `flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right ${getBackgroundClass(notification.type)} ${notification.options?.className ?? ''}`, role: "alert", children: [(0,jsx_runtime.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: getIcon(notification.type) }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [notification.title && ((0,jsx_runtime.jsx)("h4", { className: `text-sm font-semibold ${getTextClass(notification.type)}`, children: notification.title })), (0,jsx_runtime.jsx)("p", { className: `text-sm mt-1 whitespace-pre-line ${getTextClass(notification.type)}`, children: notification.message }), actions.length === 1 && ((0,jsx_runtime.jsx)("button", { onClick: () => {
                                    const action = actions[0];
                                    action?.onClick();
                                    if (action?.dismissOnClick) {
                                        handleDismiss(notification.id);
                                    }
                                }, className: `text-sm font-medium mt-2 underline ${getTextClass(notification.type)} hover:opacity-80`, children: actions[0].label })), actions.length > 1 && ((0,jsx_runtime.jsx)("div", { className: "flex flex-wrap gap-2 mt-2", children: actions.map((action, index) => ((0,jsx_runtime.jsx)("button", { onClick: () => {
                                        action.onClick();
                                        if (action.dismissOnClick) {
                                            handleDismiss(notification.id);
                                        }
                                    }, className: `text-sm font-medium underline ${getTextClass(notification.type)} hover:opacity-80`, children: action.label }, `${notification.id}-action-${index}`))) }))] }), (notification.options?.dismissible ?? true) && ((0,jsx_runtime.jsx)("button", { onClick: () => handleDismiss(notification.id), className: `flex-shrink-0 ${getTextClass(notification.type)} hover:opacity-80`, "aria-label": "Dismiss notification", children: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }) }))] }, notification.id));
        }) }));
};
/* harmony default export */ const components_NotificationContainer = ((/* unused pure expression or super */ null && (NotificationContainer)));

// EXTERNAL MODULE: ./src/renderer/store/useModalStore.ts
var useModalStore = __webpack_require__(23361);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Spinner.tsx
var Spinner = __webpack_require__(28709);
;// ./src/renderer/components/organisms/ModalContainer.tsx

/**
 * ModalContainer Component
 *
 * Global modal container that renders all active modals from the modal store.
 * Dynamically imports and renders the appropriate dialog component based on modal type.
 */



// Lazy load dialog components
const CreateProfileDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(3353)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/CreateProfileDialog */ 35292)));
const EditProfileDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(9161)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/EditProfileDialog */ 75580)));
const DeleteConfirmationDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(3844)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/DeleteConfirmationDialog */ 5877)));
const ConfirmDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(3130)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/ConfirmDialog */ 27195)));
const ExportDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(8964)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/ExportDialog */ 91845)));
const ImportDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(7773)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/ImportDialog */ 74560)));
const ColumnVisibilityDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(1272)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/ColumnVisibilityDialog */ 76553)));
const WaveSchedulingDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(7735)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/WaveSchedulingDialog */ 77218)));
const SettingsDialog = (0,react.lazy)(() => __webpack_require__.e(/*! import() */ 5424).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/SettingsDialog */ 25424)));
const AboutDialog = (0,react.lazy)(() => Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(9701)]).then(__webpack_require__.bind(__webpack_require__, /*! ../dialogs/AboutDialog */ 7288)));
/**
 * Loading fallback for lazy-loaded dialogs
 */
const DialogLoadingFallback = () => ((0,jsx_runtime.jsx)("div", { className: "fixed inset-0 bg-black/30 z-50 flex items-center justify-center", children: (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl", children: (0,jsx_runtime.jsx)(Spinner.Spinner, { size: "lg", label: "Loading dialog..." }) }) }));
/**
 * Modal Container Component
 */
const ModalContainer = () => {
    const { modals, closeModal } = (0,useModalStore.useModalStore)();
    if (modals.length === 0) {
        return null;
    }
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: modals.map((modal) => {
            const handleClose = () => {
                if (modal.dismissable) {
                    closeModal(modal.id);
                }
            };
            const handleConfirm = (result) => {
                closeModal(modal.id, result);
            };
            // Render the appropriate dialog component based on type
            const renderDialog = () => {
                switch (modal.type) {
                    case 'createProfile':
                        // CreateProfileDialog manages its own state via useModalStore
                        return (0,jsx_runtime.jsx)(CreateProfileDialog, {}, modal.id);
                    case 'editProfile':
                        return ((0,jsx_runtime.jsx)(EditProfileDialog, { isOpen: true, onClose: handleClose, onSave: async (profile) => {
                                if (modal.onConfirm) {
                                    modal.onConfirm(profile);
                                }
                                closeModal(modal.id, profile);
                            }, profile: modal.data?.profile, onTestConnection: modal.data?.onTestConnection, "data-cy": "modal-edit-profile" }));
                    case 'deleteConfirm':
                        return ((0,jsx_runtime.jsx)(DeleteConfirmationDialog, { isOpen: true, onClose: handleClose, onConfirm: async () => {
                                if (modal.onConfirm) {
                                    await modal.onConfirm();
                                }
                                closeModal(modal.id, true);
                            }, title: modal.title, message: modal.data?.message || 'Are you sure you want to delete this item?', itemName: modal.data?.itemName, "data-cy": "modal-delete-confirm" }));
                    case 'warning':
                    case 'error':
                    case 'success':
                    case 'info':
                        return ((0,jsx_runtime.jsx)(ConfirmDialog, { isOpen: true, onClose: handleClose, onConfirm: async () => {
                                if (modal.onConfirm) {
                                    await modal.onConfirm();
                                }
                                closeModal(modal.id, true);
                            }, title: modal.title, message: modal.data?.message || '', variant: modal.type === 'warning' ? 'warning' : modal.type === 'error' ? 'danger' : modal.type === 'success' ? 'success' : 'info', confirmText: modal.data?.confirmText || 'OK', cancelText: modal.data?.cancelText, "data-cy": `modal-${modal.type}` }));
                    case 'exportData':
                        return ((0,jsx_runtime.jsx)(ExportDialog, { isOpen: true, onClose: handleClose, onExport: async (options) => {
                                if (modal.onConfirm) {
                                    await modal.onConfirm(options);
                                }
                                closeModal(modal.id, options);
                            }, availableColumns: modal.data?.availableColumns, defaultFormat: modal.data?.defaultFormat, "data-cy": "modal-export" }));
                    case 'importData':
                        return ((0,jsx_runtime.jsx)(ImportDialog, { isOpen: true, onClose: handleClose, onImport: async (file, format) => {
                                if (modal.onConfirm) {
                                    await modal.onConfirm({ file, format });
                                }
                                closeModal(modal.id, { file, format });
                            }, formats: modal.data?.formats, showPreview: modal.data?.showPreview, "data-cy": "modal-import" }));
                    case 'columnVisibility':
                        return ((0,jsx_runtime.jsx)(ColumnVisibilityDialog, { isOpen: true, onClose: handleClose, columns: modal.data?.columns || [], onApply: (selectedColumns) => {
                                if (modal.onConfirm) {
                                    modal.onConfirm(selectedColumns);
                                }
                                closeModal(modal.id, selectedColumns);
                            }, "data-cy": "modal-column-visibility" }));
                    case 'waveScheduling':
                        return ((0,jsx_runtime.jsx)(WaveSchedulingDialog, { isOpen: true, onClose: handleClose, onSchedule: async (scheduleData) => {
                                if (modal.onConfirm) {
                                    await modal.onConfirm(scheduleData);
                                }
                                closeModal(modal.id, scheduleData);
                            }, wave: modal.data?.wave, "data-cy": "modal-wave-scheduling" }));
                    case 'settings':
                        return ((0,jsx_runtime.jsx)(SettingsDialog, { isOpen: true, onClose: handleClose, onSave: (settings) => {
                                if (modal.onConfirm) {
                                    modal.onConfirm(settings);
                                }
                                closeModal(modal.id, settings);
                            }, "data-cy": "modal-settings" }));
                    case 'about':
                        return ((0,jsx_runtime.jsx)(AboutDialog, { isOpen: true, onClose: handleClose, "data-cy": "modal-about" }));
                    case 'custom':
                        // For custom modals, render the component passed in data
                        if (modal.data?.Component) {
                            const CustomComponent = modal.data.Component;
                            return ((0,jsx_runtime.jsx)(CustomComponent, { isOpen: true, onClose: handleClose, onConfirm: handleConfirm, ...modal.data.props }));
                        }
                        return null;
                    default:
                        return null;
                }
            };
            return ((0,jsx_runtime.jsx)(react.Suspense, { fallback: (0,jsx_runtime.jsx)(DialogLoadingFallback, {}), children: renderDialog() }, modal.id));
        }) }));
};
/* harmony default export */ const organisms_ModalContainer = ((/* unused pure expression or super */ null && (ModalContainer)));

// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
// EXTERNAL MODULE: ./src/renderer/components/atoms/StatusIndicator.tsx
var StatusIndicator = __webpack_require__(25119);
;// ./src/renderer/components/molecules/SystemStatus.tsx

/**
 * SystemStatus Component
 *
 * Displays real-time system health indicators for Logic Engine, PowerShell, and Data Connection.
 * Shows status for critical services with color-coded indicators and last sync timestamp.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 *
 * @component
 * @example
 * ```tsx
 * const { systemStatus } = useSystemHealthLogic();
 * <SystemStatus indicators={systemStatus} />
 * ```
 */



/**
 * SystemStatus Component
 *
 * Displays real-time health status for critical system services.
 * Updates automatically via useSystemHealthLogic hook.
 */
const SystemStatus = ({ indicators, showLastSync = true, className = '', 'data-cy': dataCy, }) => {
    /**
     * Convert service status to StatusIndicator type
     */
    const getStatusType = (status) => {
        switch (status) {
            case 'online':
                return 'success';
            case 'degraded':
                return 'warning';
            case 'offline':
                return 'error';
            default:
                return 'error';
        }
    };
    /**
     * Format last sync timestamp
     */
    const formatLastSync = (timestamp) => {
        if (!timestamp)
            return 'Never';
        try {
            return new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        catch {
            return 'Invalid';
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { className: `space-y-2 ${className}`, "data-cy": dataCy || 'system-status', children: [(0,jsx_runtime.jsx)("h3", { className: "text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3", children: "System Status" }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", "data-cy": "status-logic-engine", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Database, { className: "w-3 h-3 text-gray-400 dark:text-gray-500", "aria-hidden": "true" }), (0,jsx_runtime.jsx)("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Logic Engine" })] }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(indicators.logicEngine), text: indicators.logicEngine, size: "sm", animate: indicators.logicEngine === 'degraded' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", "data-cy": "status-powershell", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Server, { className: "w-3 h-3 text-gray-400 dark:text-gray-500", "aria-hidden": "true" }), (0,jsx_runtime.jsx)("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: "PowerShell" })] }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(indicators.powerShell), text: indicators.powerShell, size: "sm", animate: indicators.powerShell === 'degraded' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", "data-cy": "status-data-connection", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Shield, { className: "w-3 h-3 text-gray-400 dark:text-gray-500", "aria-hidden": "true" }), (0,jsx_runtime.jsx)("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: "Data Connection" })] }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(indicators.dataConnection), text: indicators.dataConnection, size: "sm", animate: indicators.dataConnection === 'degraded' })] }), showLastSync && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700", "data-cy": "status-last-sync", children: [(0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-3 h-3 text-gray-400 dark:text-gray-500", "aria-hidden": "true" }), (0,jsx_runtime.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Sync: ", formatLastSync(indicators.lastSync)] })] }))] }));
};
/* harmony default export */ const molecules_SystemStatus = ((/* unused pure expression or super */ null && (SystemStatus)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
;// ./src/renderer/components/molecules/ProfileSelector.tsx

/**
 * ProfileSelector Component
 *
 * Dropdown selector for source/target profiles with connection testing and management.
 * Integrates with useProfileStore for state management.
 */








/**
 * ProfileSelector Component
 */
const ProfileSelector = ({ type, label, showActions = true, onCreateProfile, className, 'data-cy': dataCy, }) => {
    const { sourceProfiles, targetProfiles, selectedSourceProfile, selectedTargetProfile, connectionStatus, isLoading, error, setSelectedSourceProfile, setSelectedTargetProfile, deleteSourceProfile, testConnection, loadSourceProfiles, } = (0,useProfileStore.useProfileStore)();
    const [isTesting, setIsTesting] = (0,react.useState)(false);
    const profiles = type === 'source' ? sourceProfiles : targetProfiles;
    const selectedProfile = type === 'source' ? selectedSourceProfile : selectedTargetProfile;
    // Auto-load profiles on component mount
    (0,react.useEffect)(() => {
        if (type === 'source' && sourceProfiles.length === 0) {
            loadSourceProfiles();
        }
    }, [type]); // Only run when type changes or on mount
    const handleProfileChange = async (profileId) => {
        if (!profileId)
            return;
        const profile = profiles.find(p => p.id === profileId);
        if (!profile) {
            console.error(`[ProfileSelector] Profile not found: ${profileId}`);
            return;
        }
        console.log(`[ProfileSelector] Switching to profile: ${getProfileDisplayName(profile)}`);
        try {
            if (type === 'source') {
                await setSelectedSourceProfile(profile);
                console.log(`[ProfileSelector] Successfully switched to source profile: ${getProfileDisplayName(profile)}`);
            }
            else {
                setSelectedTargetProfile(profile);
                console.log(`[ProfileSelector] Successfully switched to target profile: ${getProfileDisplayName(profile)}`);
            }
        }
        catch (error) {
            console.error('[ProfileSelector] Failed to switch profile:', error);
        }
    };
    const handleTestConnection = async () => {
        if (!selectedProfile) {
            console.warn('[ProfileSelector] No profile selected for testing');
            return;
        }
        const profileName = getProfileDisplayName(selectedProfile);
        console.log(`[ProfileSelector] Testing connection for profile: ${profileName}`);
        setIsTesting(true);
        try {
            const result = await testConnection(selectedProfile);
            console.log('[ProfileSelector] ✅ Connection test successful:', result);
            alert(`✅ Connection test successful for profile "${profileName}"\n\nCredentials are valid and Azure API is accessible.`);
        }
        catch (error) {
            console.error('[ProfileSelector] ❌ Connection test failed:', error);
            const errorMsg = error instanceof Error ? error.message : String(error);
            alert(`❌ Connection test failed for profile "${profileName}"\n\n${errorMsg}`);
        }
        finally {
            setIsTesting(false);
        }
    };
    const handleDeleteProfile = async () => {
        if (!selectedProfile) {
            console.warn('[ProfileSelector] No profile selected for deletion');
            return;
        }
        const profileName = getProfileDisplayName(selectedProfile);
        const profileId = selectedProfile.id;
        if (!confirm(`Are you sure you want to delete profile "${profileName}"?\n\nThis action cannot be undone.`)) {
            return;
        }
        try {
            if (type === 'source') {
                await deleteSourceProfile(profileId);
                console.log(`[ProfileSelector] ✅ Successfully deleted profile: ${profileName}`);
                // Reload profiles to update UI
                await loadSourceProfiles();
            }
            else {
                // TODO: Add deleteTargetProfile action to store
                console.warn('[ProfileSelector] Target profile deletion not yet implemented');
                alert('Target profile deletion is not yet implemented');
            }
        }
        catch (error) {
            console.error('[ProfileSelector] Failed to delete profile:', error);
            alert(`Failed to delete profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    };
    // Helper function to get profile display name
    const getProfileDisplayName = (profile) => {
        if ('companyName' in profile && profile.companyName) {
            return profile.companyName;
        }
        if ('name' in profile && profile.name) {
            return profile.name;
        }
        if ('id' in profile) {
            return profile.id;
        }
        return 'Unknown Profile';
    };
    const handleRefreshProfiles = async () => {
        try {
            await loadSourceProfiles();
        }
        catch (error) {
            console.error('Failed to refresh profiles:', error);
        }
    };
    const handleCreateProfile = () => {
        if (onCreateProfile) {
            onCreateProfile();
        }
        else {
            // Open the create profile modal
            const { openModal } = useModalStore.useModalStore.getState();
            openModal({
                type: 'createProfile',
                title: 'Create New Profile',
                dismissable: true,
                size: 'lg',
            });
        }
    };
    // Get status for indicator
    const getConnectionStatus = () => {
        if (isTesting)
            return 'info'; // Use 'info' for loading state
        switch (connectionStatus) {
            case 'connected':
                return 'success';
            case 'connecting':
                return 'info'; // Use 'info' for connecting state
            case 'error':
                return 'error';
            default:
                return 'unknown'; // Use 'unknown' for neutral/disconnected state
        }
    };
    const getConnectionLabel = () => {
        if (isTesting)
            return 'Testing...';
        const { consecutiveHeartbeatFailures } = useProfileStore.useProfileStore.getState();
        switch (connectionStatus) {
            case 'connected':
                return 'Online';
            case 'connecting':
                // 'connecting' is used for degraded state (1 failure)
                if (consecutiveHeartbeatFailures > 0) {
                    return 'Degraded';
                }
                return 'Connecting...';
            case 'error':
                return 'Offline';
            default:
                return 'Not Connected';
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { className: (0,clsx.clsx)('flex flex-col gap-3', className), "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [label && (0,jsx_runtime.jsx)("span", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide", children: label }), selectedProfile && ((0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getConnectionStatus(), text: getConnectionLabel(), size: "sm", animate: isTesting || connectionStatus === 'connecting' }))] }), (0,jsx_runtime.jsx)(Select.Select, { value: selectedProfile?.id || '', onChange: handleProfileChange, options: profiles.map(profile => {
                    // Get profile display name
                    const profileName = getProfileDisplayName(profile);
                    // Both types have environment property
                    const envLabel = profile.environment ? ` (${profile.environment})` : '';
                    return {
                        value: profile.id,
                        label: `${profileName}${envLabel}`,
                    };
                }), placeholder: profiles.length > 0 ? "Select a profile..." : "No profiles found - click Refresh", disabled: isLoading, error: type === 'source' && error ? error : undefined, "data-cy": `profile-select-${type}` }), showActions && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", size: "sm", onClick: handleCreateProfile, icon: (0,jsx_runtime.jsx)(lucide_react.Plus, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "create-profile-btn", children: "Create" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", size: "sm", onClick: handleRefreshProfiles, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: (0,clsx.clsx)('h-4 w-4', { 'animate-spin': isLoading }) }), disabled: isLoading, "data-cy": "refresh-profiles-btn", children: "Refresh" }), selectedProfile && ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", size: "sm", onClick: handleTestConnection, icon: (0,jsx_runtime.jsx)(lucide_react.TestTube, { className: "h-4 w-4" }), disabled: isLoading || isTesting, loading: isTesting, "data-cy": "test-connection-btn", children: "Test" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "danger", size: "sm", onClick: handleDeleteProfile, icon: (0,jsx_runtime.jsx)(lucide_react.Trash2, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "delete-profile-btn", children: "Delete" })] }))] })), selectedProfile && ((0,jsx_runtime.jsx)("div", { className: "px-3 py-2 bg-gray-800 rounded-md border border-gray-700 text-sm", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 gap-1", children: ['companyName' in selectedProfile && selectedProfile.companyName && ((0,jsx_runtime.jsxs)("div", { className: "flex justify-between", children: [(0,jsx_runtime.jsx)("span", { className: "font-medium text-gray-400", children: "Company:" }), (0,jsx_runtime.jsx)("span", { className: "text-gray-300", children: selectedProfile.companyName })] })), selectedProfile.environment && ((0,jsx_runtime.jsxs)("div", { className: "flex justify-between", children: [(0,jsx_runtime.jsx)("span", { className: "font-medium text-gray-400", children: "Environment:" }), (0,jsx_runtime.jsx)("span", { className: "text-gray-300", children: selectedProfile.environment })] })), 'domainController' in selectedProfile && selectedProfile.domainController && ((0,jsx_runtime.jsxs)("div", { className: "flex justify-between", children: [(0,jsx_runtime.jsx)("span", { className: "font-medium text-gray-400", children: "Domain:" }), (0,jsx_runtime.jsx)("span", { className: "text-gray-300", children: selectedProfile.domainController })] })), selectedProfile.tenantId && ((0,jsx_runtime.jsxs)("div", { className: "col-span-2", children: [(0,jsx_runtime.jsx)("span", { className: "font-medium text-gray-400", children: "Tenant:" }), (0,jsx_runtime.jsx)("div", { className: "mt-1 text-gray-300 font-mono text-xs break-all", children: selectedProfile.tenantId })] }))] }) }))] }));
};
/* harmony default export */ const molecules_ProfileSelector = ((/* unused pure expression or super */ null && (ProfileSelector)));

// EXTERNAL MODULE: ./src/renderer/lib/electron-api-fallback.ts
var electron_api_fallback = __webpack_require__(58350);
;// ./src/renderer/hooks/useSystemHealthLogic.ts
/**
 * useSystemHealthLogic Hook
 *
 * Manages system health monitoring with automatic polling.
 * Checks Logic Engine, PowerShell, and data connection status every 30 seconds.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 *
 * @returns System health state and manual check function
 *
 * @example
 * ```tsx
 * const { systemStatus, checkHealth, isChecking } = useSystemHealthLogic();
 *
 * return (
 *   <SystemStatus indicators={systemStatus} />
 * );
 * ```
 */



/**
 * Health check interval (30 seconds)
 */
const HEALTH_CHECK_INTERVAL = 30000;
/**
 * Default system status (all services offline)
 */
const DEFAULT_STATUS = {
    logicEngine: 'offline',
    powerShell: 'offline',
    dataConnection: 'offline',
    lastSync: undefined,
};
/**
 * useSystemHealthLogic Hook
 */
const useSystemHealthLogic = () => {
    const [systemStatus, setSystemStatus] = (0,react.useState)(DEFAULT_STATUS);
    const [isChecking, setIsChecking] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    // Get profile connection status from store
    const profileConnectionStatus = (0,useProfileStore.useProfileStore)((state) => state.connectionStatus);
    /**
     * Check system health status
     */
    const checkHealth = (0,react.useCallback)(async () => {
        setIsChecking(true);
        setError(null);
        try {
            // Get electronAPI with fallback
            const electronAPI = (0,electron_api_fallback.getElectronAPI)();
            // Call dashboard service to get system health
            const healthResult = await electronAPI.dashboard.getSystemHealth();
            if (healthResult.success && healthResult.data) {
                const health = healthResult.data;
                // Extract status from health objects (they may be objects with {status, lastCheck, responseTimeMs})
                const extractStatus = (statusObj) => {
                    if (typeof statusObj === 'string')
                        return statusObj;
                    if (statusObj && typeof statusObj === 'object' && statusObj.status) {
                        return statusObj.status;
                    }
                    return 'offline';
                };
                // Map health data to status indicators
                setSystemStatus({
                    logicEngine: extractStatus(health.logicEngineStatus),
                    powerShell: extractStatus(health.powerShellStatus),
                    dataConnection: determineDataConnectionStatus(),
                    lastSync: new Date().toISOString(),
                });
            }
            else {
                // Health check failed, set degraded status
                // But preserve dataConnection status from profile connection test
                console.warn('Health check returned no data:', healthResult.error);
                setSystemStatus((prev) => ({
                    logicEngine: 'degraded',
                    powerShell: 'degraded',
                    dataConnection: determineDataConnectionStatus(),
                    lastSync: prev.lastSync, // Keep previous sync time
                }));
                setError(healthResult.error || 'Health check failed');
            }
        }
        catch (err) {
            // Exception during health check
            // But preserve dataConnection status from profile connection test
            console.error('Health check exception:', err);
            setSystemStatus((prev) => ({
                logicEngine: 'degraded',
                powerShell: 'degraded',
                dataConnection: determineDataConnectionStatus(),
                lastSync: prev.lastSync, // Keep previous sync time
            }));
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setIsChecking(false);
        }
    }, []); // No dependencies - use functional updates for state
    /**
     * Determine data connection status based on credential test results
     * Only shows 'online' after a successful test connection to Azure/on-premises
     */
    const determineDataConnectionStatus = () => {
        // Map profile connection status to system status indicator
        switch (profileConnectionStatus) {
            case 'connected':
                return 'online';
            case 'connecting':
                return 'degraded';
            case 'error':
                return 'degraded';
            case 'disconnected':
            default:
                return 'offline';
        }
    };
    /**
     * Initialize health check on mount and set up polling interval
     */
    (0,react.useEffect)(() => {
        // Initial health check
        checkHealth();
        // Set up polling interval
        const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []); // Empty deps - checkHealth is stable now
    /**
     * Update data connection status when profile connection status changes
     * This ensures the "Data Connection" indicator reflects credential test results
     */
    (0,react.useEffect)(() => {
        setSystemStatus((prev) => ({
            ...prev,
            dataConnection: determineDataConnectionStatus(),
        }));
    }, [profileConnectionStatus]); // Only depend on profileConnectionStatus, not the function itself
    return {
        systemStatus,
        isChecking,
        error,
        checkHealth,
    };
};
/* harmony default export */ const hooks_useSystemHealthLogic = ((/* unused pure expression or super */ null && (useSystemHealthLogic)));

// EXTERNAL MODULE: ./src/renderer/views/discovered/_sidebar.generated.ts
var _sidebar_generated = __webpack_require__(7572);
;// ./src/renderer/components/organisms/Sidebar.tsx

/**
 * Sidebar Component
 *
 * Application sidebar with navigation, profile management, and system status.
 * Enhanced with SystemStatus component for real-time health monitoring.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 */









/**
 * Sidebar navigation component
 */
const Sidebar = () => {
    const { selectedSourceProfile, selectedTargetProfile } = (0,useProfileStore.useProfileStore)();
    const { systemStatus } = useSystemHealthLogic();
    const location = (0,dist.useLocation)();
    // State for collapsible sections
    const [expandedSections, setExpandedSections] = (0,react.useState)({
        setup: false,
        discovery: false,
        migration: false,
    });
    // Toggle section expansion
    const toggleSection = (0,react.useCallback)((section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);
    // Check if a section should be expanded based on current path
    const isSectionActive = (0,react.useCallback)((paths) => {
        return paths.some(path => location.pathname.startsWith(path));
    }, [location.pathname]);
    // Discovered Data - Shows results from discovery operations
    // These are DATA DISPLAY views, not discovery execution interfaces
    // Now using auto-generated navigation items from _sidebar.generated.ts
    const discoveredItems = (0,react.useMemo)(() => _sidebar_generated.discoveredNavItems, []);
    // Setup menu items (admin-only)
    const setupItems = [
        {
            path: '/setup/company',
            label: 'Company',
            icon: (0,jsx_runtime.jsx)(lucide_react.Building2, { size: 16 }),
        },
        {
            path: '/setup/azure-prerequisites',
            label: 'Azure Prerequisites',
            icon: (0,jsx_runtime.jsx)(lucide_react.Cloud, { size: 16 }),
        },
        {
            path: '/setup/installers',
            label: 'Installers',
            icon: (0,jsx_runtime.jsx)(lucide_react.Download, { size: 16 }),
        },
    ];
    // Navigation items
    const navItems = [
        {
            path: '/',
            label: 'Overview',
            icon: (0,jsx_runtime.jsx)(lucide_react.LayoutDashboard, { size: 20 }),
        },
        {
            path: '/setup',
            label: 'Setup',
            icon: (0,jsx_runtime.jsx)(lucide_react.Wrench, { size: 20 }),
            children: setupItems,
        },
        {
            path: '/discovery',
            label: 'Discovery',
            icon: (0,jsx_runtime.jsx)(lucide_react.Search, { size: 20 }),
            children: [
                {
                    path: '/discovered',
                    label: 'Discovered',
                    icon: (0,jsx_runtime.jsx)(lucide_react.FileSearch, { size: 18 }),
                    children: discoveredItems,
                },
            ],
        },
        {
            path: '/users',
            label: 'Users',
            icon: (0,jsx_runtime.jsx)(lucide_react.Users, { size: 20 }),
        },
        {
            path: '/groups',
            label: 'Groups',
            icon: (0,jsx_runtime.jsx)(lucide_react.UserCheck, { size: 20 }),
        },
        {
            path: '/infrastructure',
            label: 'Infrastructure',
            icon: (0,jsx_runtime.jsx)(lucide_react.Server, { size: 20 }),
        },
        {
            path: '/organisation-map',
            label: 'Organisation Map',
            icon: (0,jsx_runtime.jsx)(lucide_react.Workflow, { size: 20 }),
        },
        {
            path: '/migration',
            label: 'Migration',
            icon: (0,jsx_runtime.jsx)(lucide_react.ArrowRightLeft, { size: 20 }),
            children: [
                { path: '/migration/planning', label: 'Planning', icon: (0,jsx_runtime.jsx)(lucide_react.ChevronRight, { size: 16 }) },
                { path: '/migration/mapping', label: 'Mapping', icon: (0,jsx_runtime.jsx)(lucide_react.ChevronRight, { size: 16 }) },
                { path: '/migration/validation', label: 'Validation', icon: (0,jsx_runtime.jsx)(lucide_react.ChevronRight, { size: 16 }) },
                { path: '/migration/execution', label: 'Execution', icon: (0,jsx_runtime.jsx)(lucide_react.ChevronRight, { size: 16 }) },
            ],
        },
        {
            path: '/reports',
            label: 'Reports',
            icon: (0,jsx_runtime.jsx)(lucide_react.FileText, { size: 20 }),
        },
        {
            path: '/settings',
            label: 'Settings',
            icon: (0,jsx_runtime.jsx)(lucide_react.Settings, { size: 20 }),
        },
    ];
    return ((0,jsx_runtime.jsxs)("aside", { className: "w-64 bg-gray-900 text-white flex flex-col relative z-50", children: [(0,jsx_runtime.jsx)("div", { className: "p-4 border-b border-gray-800", children: (0,jsx_runtime.jsx)("h1", { className: "text-xl font-bold", children: "M&A Discovery Suite" }) }), (0,jsx_runtime.jsxs)("div", { className: "p-4 border-b border-gray-800", children: [(0,jsx_runtime.jsx)(ProfileSelector, { type: "source", label: "Source Profile", showActions: true, className: "mb-3", "data-cy": "sidebar-source-profile" }), (0,jsx_runtime.jsx)("div", { className: "h-px bg-gray-800 my-3" }), (0,jsx_runtime.jsx)(ProfileSelector, { type: "target", label: "Target Profile", showActions: true, "data-cy": "sidebar-target-profile" })] }), (0,jsx_runtime.jsx)("nav", { className: "flex-1 overflow-y-auto py-4", children: navItems.map((item) => ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsxs)(dist.NavLink, { to: item.path, className: ({ isActive }) => (0,clsx.clsx)('flex items-center gap-3 px-4 py-2 text-sm transition-colors', 'hover:bg-gray-800 hover:text-white', isActive
                                ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                                : 'text-gray-300'), children: [item.icon, (0,jsx_runtime.jsx)("span", { children: item.label })] }), item.children && ((0,jsx_runtime.jsx)("div", { className: "ml-4", children: item.children.map((child) => ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsxs)(dist.NavLink, { to: child.path, className: ({ isActive }) => (0,clsx.clsx)('flex items-center gap-2 px-4 py-1.5 text-sm transition-colors', 'hover:bg-gray-800 hover:text-white', isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-400'), children: [child.icon, (0,jsx_runtime.jsx)("span", { children: child.label })] }), child.children && ((0,jsx_runtime.jsx)("div", { className: "ml-4", children: child.children.map((grandchild) => ((0,jsx_runtime.jsxs)(dist.NavLink, { to: grandchild.path, className: ({ isActive }) => (0,clsx.clsx)('flex items-center gap-2 px-4 py-1.5 text-xs transition-colors', 'hover:bg-gray-800 hover:text-white', isActive
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-500'), children: [grandchild.icon, (0,jsx_runtime.jsx)("span", { children: grandchild.label })] }, grandchild.path))) }))] }, child.path))) }))] }, item.path))) }), (0,jsx_runtime.jsx)("div", { className: "p-4 border-t border-gray-800", children: (0,jsx_runtime.jsx)(SystemStatus, { indicators: systemStatus, showLastSync: true }) })] }));
};

// EXTERNAL MODULE: ./src/renderer/store/useTabStore.ts
var useTabStore = __webpack_require__(63543);
;// ./src/renderer/components/organisms/TabView.tsx

/**
 * TabView Component
 *
 * Tab management component
 */




/**
 * Tab view component for managing open tabs
 */
const TabView = () => {
    const { tabs, selectedTabId, setSelectedTab, closeTab } = (0,useTabStore.useTabStore)();
    if (tabs.length === 0) {
        return null;
    }
    return ((0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)("div", { className: "flex overflow-x-auto", children: tabs.map((tab) => ((0,jsx_runtime.jsxs)("div", { className: (0,clsx.clsx)('flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer', 'hover:bg-gray-50 dark:hover:bg-gray-700', selectedTabId === tab.id && 'bg-gray-100 dark:bg-gray-700'), onClick: () => setSelectedTab(tab.id), children: [(0,jsx_runtime.jsx)("span", { className: "text-sm", children: tab.title }), (0,jsx_runtime.jsx)("button", { onClick: (e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                        }, className: "p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded", children: (0,jsx_runtime.jsx)(lucide_react.X, { size: 14 }) })] }, tab.id))) }) }));
};

;// ./src/renderer/lib/commandRegistry.ts
/**
 * Command Registry
 *
 * Central registry of all commands available in the command palette.
 * Commands are organized by category and include keyboard shortcuts.
 */

/**
 * Create command registry with navigation and action callbacks
 */
const createCommandRegistry = (navigate, openModal, triggerAction) => {
    return [
        // Navigation Commands
        {
            id: 'nav-overview',
            label: 'Go to Overview',
            description: 'Navigate to the overview dashboard',
            category: 'Navigation',
            icon: lucide_react.Home,
            shortcut: 'Ctrl+Shift+H',
            action: () => navigate('/'),
            keywords: ['home', 'dashboard', 'overview'],
        },
        {
            id: 'nav-discovery',
            label: 'Go to Discovery',
            description: 'Navigate to discovery hub',
            category: 'Navigation',
            icon: lucide_react.Search,
            shortcut: 'Ctrl+Shift+D',
            action: () => navigate('/discovery'),
            keywords: ['find', 'scan', 'discover'],
        },
        {
            id: 'nav-users',
            label: 'Go to Users',
            description: 'Navigate to users view',
            category: 'Navigation',
            icon: lucide_react.Users,
            shortcut: 'Ctrl+Shift+U',
            action: () => navigate('/users'),
            keywords: ['people', 'accounts'],
        },
        {
            id: 'nav-groups',
            label: 'Go to Groups',
            description: 'Navigate to groups view',
            category: 'Navigation',
            icon: lucide_react.Users,
            shortcut: 'Ctrl+Shift+G',
            action: () => navigate('/groups'),
            keywords: ['teams', 'distribution'],
        },
        {
            id: 'nav-computers',
            label: 'Go to Computers',
            description: 'Navigate to computers view',
            category: 'Navigation',
            icon: lucide_react.Server,
            action: () => navigate('/computers'),
            keywords: ['devices', 'machines', 'workstations'],
        },
        {
            id: 'nav-infrastructure',
            label: 'Go to Infrastructure',
            description: 'Navigate to infrastructure view',
            category: 'Navigation',
            icon: lucide_react.Box,
            action: () => navigate('/infrastructure'),
            keywords: ['servers', 'network', 'systems'],
        },
        {
            id: 'nav-migration',
            label: 'Go to Migration Planning',
            description: 'Navigate to migration planning',
            category: 'Navigation',
            icon: lucide_react.Calendar,
            shortcut: 'Ctrl+Shift+M',
            action: () => navigate('/migration/planning'),
            keywords: ['waves', 'move', 'transfer'],
        },
        {
            id: 'nav-reports',
            label: 'Go to Reports',
            description: 'Navigate to reports view',
            category: 'Navigation',
            icon: lucide_react.FileText,
            shortcut: 'Ctrl+Shift+R',
            action: () => navigate('/reports'),
            keywords: ['analytics', 'data', 'export'],
        },
        {
            id: 'nav-settings',
            label: 'Go to Settings',
            description: 'Navigate to settings',
            category: 'Navigation',
            icon: lucide_react.Settings,
            shortcut: 'Ctrl+,',
            action: () => navigate('/settings'),
            keywords: ['preferences', 'configuration', 'options'],
        },
        // Action Commands
        {
            id: 'action-new-profile',
            label: 'Create New Profile',
            description: 'Create a new connection profile',
            category: 'Actions',
            icon: lucide_react.Plus,
            shortcut: 'Ctrl+N',
            action: () => openModal('createProfile'),
            keywords: ['add', 'connection', 'tenant'],
        },
        {
            id: 'action-export',
            label: 'Export Data',
            description: 'Export current view data',
            category: 'Actions',
            icon: lucide_react.Download,
            shortcut: 'Ctrl+E',
            action: () => triggerAction('export'),
            keywords: ['save', 'download', 'csv'],
        },
        {
            id: 'action-import',
            label: 'Import Data',
            description: 'Import data from file',
            category: 'Actions',
            icon: lucide_react.Upload,
            action: () => openModal('importData'),
            keywords: ['load', 'upload', 'csv'],
        },
        {
            id: 'action-refresh',
            label: 'Refresh Current View',
            description: 'Reload data in current view',
            category: 'Actions',
            icon: lucide_react.RefreshCw,
            shortcut: 'F5',
            action: () => triggerAction('refresh'),
            keywords: ['reload', 'update', 'sync'],
        },
        {
            id: 'action-search',
            label: 'Focus Search',
            description: 'Focus the search input',
            category: 'Actions',
            icon: lucide_react.Search,
            shortcut: 'Ctrl+F',
            action: () => triggerAction('focus-search'),
            keywords: ['find', 'filter', 'query'],
        },
        // Discovery Commands
        {
            id: 'discovery-domain',
            label: 'Run Domain Discovery',
            description: 'Start domain discovery process',
            category: 'Discovery',
            action: () => navigate('/discovery/domain'),
            keywords: ['scan', 'active directory', 'ad'],
        },
        {
            id: 'discovery-azure',
            label: 'Run Azure Discovery',
            description: 'Start Azure AD discovery',
            category: 'Discovery',
            action: () => navigate('/discovery/azure'),
            keywords: ['scan', 'aad', 'entra'],
        },
        {
            id: 'discovery-office365',
            label: 'Run Office 365 Discovery',
            description: 'Start Office 365 discovery',
            category: 'Discovery',
            action: () => navigate('/discovery/office365'),
            keywords: ['scan', 'o365', 'microsoft'],
        },
        {
            id: 'discovery-exchange',
            label: 'Run Exchange Discovery',
            description: 'Start Exchange discovery',
            category: 'Discovery',
            action: () => navigate('/discovery/exchange'),
            keywords: ['scan', 'email', 'mailbox'],
        },
        {
            id: 'discovery-sharepoint',
            label: 'Run SharePoint Discovery',
            description: 'Start SharePoint discovery',
            category: 'Discovery',
            action: () => navigate('/discovery/sharepoint'),
            keywords: ['scan', 'spo', 'sites'],
        },
        {
            id: 'discovery-teams',
            label: 'Run Teams Discovery',
            description: 'Start Microsoft Teams discovery',
            category: 'Discovery',
            action: () => navigate('/discovery/teams'),
            keywords: ['scan', 'chat', 'channels'],
        },
        // Migration Commands
        {
            id: 'migration-schedule-wave',
            label: 'Schedule Migration Wave',
            description: 'Create and schedule a new migration wave',
            category: 'Migration',
            icon: lucide_react.Calendar,
            action: () => openModal('waveScheduling'),
            keywords: ['plan', 'batch', 'cutover'],
        },
        {
            id: 'migration-validation',
            label: 'Run Migration Validation',
            description: 'Validate migration readiness',
            category: 'Migration',
            action: () => navigate('/migration/validation'),
            keywords: ['check', 'verify', 'test'],
        },
        {
            id: 'migration-execution',
            label: 'View Migration Execution',
            description: 'Monitor active migrations',
            category: 'Migration',
            action: () => navigate('/migration/execution'),
            keywords: ['run', 'progress', 'status'],
        },
        // Data Commands
        {
            id: 'data-export-users',
            label: 'Export Users',
            description: 'Export user data to file',
            category: 'Data',
            action: () => {
                navigate('/users');
                setTimeout(() => triggerAction('export'), 100);
            },
            keywords: ['save', 'download', 'accounts'],
        },
        {
            id: 'data-export-groups',
            label: 'Export Groups',
            description: 'Export group data to file',
            category: 'Data',
            action: () => {
                navigate('/groups');
                setTimeout(() => triggerAction('export'), 100);
            },
            keywords: ['save', 'download', 'teams'],
        },
        // System Commands
        {
            id: 'system-about',
            label: 'About',
            description: 'View application information',
            category: 'System',
            action: () => openModal('about'),
            keywords: ['version', 'info', 'help'],
        },
        {
            id: 'system-settings',
            label: 'Open Settings',
            description: 'Configure application settings',
            category: 'System',
            icon: lucide_react.Settings,
            action: () => openModal('settings'),
            keywords: ['preferences', 'config', 'options'],
        },
    ];
};
/**
 * Filter commands based on search query
 */
const filterCommands = (commands, query) => {
    if (!query.trim()) {
        return commands;
    }
    const lowerQuery = query.toLowerCase();
    return commands.filter((command) => {
        // Search in label, description, category, and keywords
        const searchableText = [
            command.label,
            command.description,
            command.category,
            ...(command.keywords || []),
        ].join(' ').toLowerCase();
        return searchableText.includes(lowerQuery);
    });
};
/**
 * Group commands by category
 */
const groupCommandsByCategory = (commands) => {
    const categories = {};
    commands.forEach((command) => {
        if (!categories[command.category]) {
            categories[command.category] = [];
        }
        categories[command.category].push(command);
    });
    return Object.entries(categories).map(([name, commands]) => ({
        name,
        commands,
    }));
};
/* harmony default export */ const commandRegistry = ((/* unused pure expression or super */ null && (createCommandRegistry)));

;// ./src/renderer/components/organisms/CommandPalette.tsx

/**
 * CommandPalette Component
 *
 * Global command palette for quick actions with fuzzy search,
 * keyboard navigation, and categorized commands.
 */





/**
 * Command Palette Component
 */
const CommandPalette = () => {
    const navigate = (0,dist.useNavigate)();
    const { closeCommandPalette, openModal } = (0,useModalStore.useModalStore)();
    const [searchQuery, setSearchQuery] = (0,react.useState)('');
    const [selectedIndex, setSelectedIndex] = (0,react.useState)(0);
    const inputRef = (0,react.useRef)(null);
    // Create command registry
    const commands = createCommandRegistry(navigate, (type, data) => {
        closeCommandPalette();
        setTimeout(() => openModal({ type: type, title: '', dismissable: true, data }), 100);
    }, (action) => {
        closeCommandPalette();
        setTimeout(() => {
            const event = new CustomEvent(`app:${action}`);
            window.dispatchEvent(event);
        }, 100);
    });
    // Filter commands based on search
    const filteredCommands = filterCommands(commands, searchQuery);
    const groupedCommands = groupCommandsByCategory(filteredCommands);
    // Focus input on mount
    (0,react.useEffect)(() => {
        inputRef.current?.focus();
    }, []);
    // Reset selected index when search changes
    (0,react.useEffect)(() => {
        setSelectedIndex(0);
    }, [searchQuery]);
    // Keyboard navigation
    (0,react.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeCommandPalette();
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedCommand = filteredCommands[selectedIndex];
                if (selectedCommand) {
                    executeCommand(selectedCommand);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, filteredCommands, closeCommandPalette]);
    const executeCommand = (command) => {
        command.action();
        closeCommandPalette();
    };
    const handleCommandClick = (command) => {
        executeCommand(command);
    };
    return ((0,jsx_runtime.jsx)("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4", onClick: closeCommandPalette, "data-cy": "command-palette-overlay", children: (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden", onClick: (e) => e.stopPropagation(), "data-cy": "command-palette", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)(lucide_react.Search, { className: "w-5 h-5 text-gray-400" }), (0,jsx_runtime.jsx)("input", { ref: inputRef, type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Type a command or search...", className: "flex-1 bg-transparent text-gray-900 dark:text-gray-100 outline-none placeholder-gray-400 text-lg", "data-cy": "command-palette-input" }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsx)("kbd", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded", children: "ESC" }), (0,jsx_runtime.jsx)("span", { children: "to close" })] })] }), (0,jsx_runtime.jsx)("div", { className: "max-h-96 overflow-y-auto", "data-cy": "command-list", children: filteredCommands.length === 0 ? ((0,jsx_runtime.jsxs)("div", { className: "p-8 text-center text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsx)(lucide_react.Search, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }), (0,jsx_runtime.jsx)("p", { className: "text-sm", children: "No commands found" }), (0,jsx_runtime.jsx)("p", { className: "text-xs mt-1", children: "Try a different search term" })] })) : (groupedCommands.map((category, categoryIndex) => ((0,jsx_runtime.jsxs)("div", { className: categoryIndex > 0 ? 'mt-2' : '', children: [(0,jsx_runtime.jsx)("div", { className: "px-4 py-2 bg-gray-50 dark:bg-gray-900/50", children: (0,jsx_runtime.jsx)("h3", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: category.name }) }), category.commands.map((command, index) => {
                                const globalIndex = filteredCommands.indexOf(command);
                                const isSelected = globalIndex === selectedIndex;
                                return ((0,jsx_runtime.jsxs)("button", { onClick: () => handleCommandClick(command), onMouseEnter: () => setSelectedIndex(globalIndex), className: `w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-600'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent'}`, "data-cy": `command-${command.id}`, children: [command.icon && ((0,jsx_runtime.jsx)(command.icon, { className: `w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}` })), (0,jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [(0,jsx_runtime.jsx)("div", { className: `text-sm font-medium ${isSelected
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-900 dark:text-gray-100'}`, children: command.label }), (0,jsx_runtime.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: command.description })] }), command.shortcut && ((0,jsx_runtime.jsx)("div", { className: "flex items-center gap-1 flex-shrink-0", children: command.shortcut.split('+').map((key, i) => ((0,jsx_runtime.jsxs)(react.Fragment, { children: [i > 0 && (0,jsx_runtime.jsx)("span", { className: "text-gray-400 text-xs", children: "+" }), (0,jsx_runtime.jsx)("kbd", { className: `px-2 py-1 text-xs rounded ${isSelected
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`, children: key })] }, i))) }))] }, command.id));
                            })] }, category.name)))) }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-1", children: [(0,jsx_runtime.jsx)("kbd", { className: "px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600", children: "\u2191\u2193" }), (0,jsx_runtime.jsx)("span", { children: "Navigate" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-1", children: [(0,jsx_runtime.jsx)("kbd", { className: "px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600", children: "\u21B5" }), (0,jsx_runtime.jsx)("span", { children: "Select" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsx)(lucide_react.Keyboard, { className: "w-4 h-4" }), (0,jsx_runtime.jsxs)("span", { children: [filteredCommands.length, " commands"] })] })] })] }) }));
};

;// ./src/renderer/components/layouts/MainLayout.tsx

/**
 * MainLayout Component
 *
 * Main application layout with sidebar and content area
 */





/**
 * Main application layout
 */
const MainLayout = ({ children }) => {
    const { isCommandPaletteOpen } = (0,useModalStore.useModalStore)();
    return ((0,jsx_runtime.jsxs)("div", { className: "flex h-screen bg-gray-50 dark:bg-gray-900", children: [(0,jsx_runtime.jsx)(Sidebar, {}), (0,jsx_runtime.jsxs)("div", { className: "flex-1 flex flex-col overflow-hidden", children: [(0,jsx_runtime.jsx)(TabView, {}), (0,jsx_runtime.jsx)("main", { className: "flex-1 overflow-y-auto", children: children })] }), isCommandPaletteOpen && (0,jsx_runtime.jsx)(CommandPalette, {})] }));
};

// EXTERNAL MODULE: ./src/renderer/store/useThemeStore.ts
var useThemeStore = __webpack_require__(92665);
// EXTERNAL MODULE: ./src/renderer/routes.tsx + 1 modules
var routes = __webpack_require__(97651);
;// ./src/renderer/App.tsx

/**
 * Main Application Component
 *
 * Implements routing with lazy loading for optimal performance.
 * Wraps the application with error handling and notification systems.
 */










/**
 * Theme Initializer - Ensures theme is applied on mount
 */
const ThemeInitializer = () => {
    const { mode, actualMode } = (0,useThemeStore.useThemeStore)();
    (0,react.useEffect)(() => {
        // Apply theme to DOM on mount
        const root = document.documentElement;
        if (actualMode === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
    }, [mode, actualMode]);
    return null;
};
/**
 * AppContent - Renders routes within MainLayout
 */
const AppContent = () => {
    const routing = (0,dist.useRoutes)(routes["default"]);
    return ((0,jsx_runtime.jsx)(MainLayout, { children: routing }));
};
/**
 * App - Main application entry point
 */
const App = () => {
    // Handle errors from ErrorBoundary
    const handleError = (error, errorInfo) => {
        // Log error to main process
        if (window.electronAPI?.logging) {
            window.electronAPI.logging.error('App', error.message, error.stack, {
                componentStack: errorInfo.componentStack
            });
        }
    };
    return ((0,jsx_runtime.jsxs)(ErrorBoundary, { onError: handleError, showDetails: true, children: [(0,jsx_runtime.jsx)(ThemeInitializer, {}), (0,jsx_runtime.jsx)(NotificationContainer, {}), (0,jsx_runtime.jsx)(ModalContainer, {}), (0,jsx_runtime.jsx)(react_dnd_dist.DndProvider, { backend: react_dnd_html5_backend_dist.HTML5Backend, children: (0,jsx_runtime.jsx)(dist.HashRouter, { children: (0,jsx_runtime.jsx)(AppContent, {}) }) })] }));
};
/* harmony default export */ const renderer_App = (App);


/***/ }),

/***/ 25119:
/*!***********************************************************!*\
  !*** ./src/renderer/components/atoms/StatusIndicator.tsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StatusIndicator: () => (/* binding */ StatusIndicator),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * StatusIndicator Component
 *
 * Displays a colored dot with text to indicate status (online, offline, error, etc.)
 * Used for connection status, environment indicators, and general state display.
 *
 * Epic 0: UI/UX Parity - Replaces WPF StatusIndicator.xaml
 *
 * @component
 * @example
 * ```tsx
 * <StatusIndicator status="success" text="Connected" size="md" />
 * <StatusIndicator status="online" text="Active Directory" size="lg" animate />
 * ```
 */


/**
 * StatusIndicator Component
 *
 * Replicates WPF StatusIndicator with semantic color coding and animations.
 * Uses design system colors from Epic 0 architecture.
 */
const StatusIndicator = react__WEBPACK_IMPORTED_MODULE_1__.memo(({ status, text, size = 'md', animate = false, description, className, 'data-cy': dataCy, }) => {
    // Status color classes matching architectural specifications
    const statusColorClasses = {
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        info: 'bg-info',
        online: 'bg-status-online',
        offline: 'bg-status-offline',
        idle: 'bg-status-idle',
        unknown: 'bg-status-unknown',
    };
    // Status text color classes
    const textColorClasses = {
        success: 'text-success',
        warning: 'text-warning',
        error: 'text-error',
        info: 'text-info',
        online: 'text-status-online',
        offline: 'text-status-offline',
        idle: 'text-status-idle',
        unknown: 'text-status-unknown',
    };
    // Size classes for container
    const containerSizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };
    // Size classes for dot
    const dotSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('status-indicator', containerSizeClasses[size], className);
    const dotClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', statusColorClasses[status], dotSizeClasses[size], {
        'animate-pulse': animate,
    });
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('font-medium', textColorClasses[status]);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, title: description || `Status: ${status}`, "data-cy": dataCy || `status-${status}`, role: "status", "aria-label": `${text} - ${status}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "relative inline-flex", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: dotClasses, "aria-hidden": "true" }), animate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute inline-flex h-full w-full rounded-full opacity-75', statusColorClasses[status], 'animate-ping'), "aria-hidden": "true" }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: labelClasses, children: text })] }));
});
StatusIndicator.displayName = 'StatusIndicator';
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (StatusIndicator);


/***/ }),

/***/ 28709:
/*!***************************************************!*\
  !*** ./src/renderer/components/atoms/Spinner.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Spinner: () => (/* binding */ Spinner)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Spinner Component
 *
 * Loading spinner with various sizes and colors
 */



/**
 * Spinner component for loading states
 */
const Spinner = ({ size = 'md', color = 'primary', label = 'Loading...', center = false, fullScreen = false, className, 'data-cy': dataCy, }) => {
    // Size mappings
    const sizes = {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 48,
    };
    // Color classes
    const colors = {
        primary: 'text-blue-600 dark:text-blue-400',
        secondary: 'text-gray-600 dark:text-gray-400',
        white: 'text-white',
        current: 'text-current',
    };
    // Container classes for centering
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(center && !fullScreen && 'flex items-center justify-center', fullScreen && 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50', className);
    // Spinner element
    const spinnerElement = ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Loader2, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('animate-spin', colors[color]), size: sizes[size], "aria-hidden": "true", "data-cy": dataCy }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "sr-only", children: label })] }));
    // If centering or fullscreen, wrap in container
    if (center || fullScreen) {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: containerClasses, role: "status", "aria-label": label, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex flex-col items-center", children: [spinnerElement, fullScreen && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "mt-4 text-white text-sm", children: label }))] }) }));
    }
    // Otherwise return spinner directly
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: className, role: "status", "aria-label": label, children: spinnerElement }));
};


/***/ }),

/***/ 58350:
/*!***************************************************!*\
  !*** ./src/renderer/lib/electron-api-fallback.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getElectronAPI: () => (/* binding */ getElectronAPI)
/* harmony export */ });
/* unused harmony export electronAPIFallback */
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ 33834);
/**
 * Fallback implementations for when electronAPI is not available
 * This provides mock implementations to prevent crashes during development
 */
const electronAPIFallback = {
    // ========================================
    // PowerShell Execution
    // ========================================
    executeScript: async () => ({
        success: true,
        data: [],
        duration: 0,
        warnings: ['Running in development mode - returning mock data'],
        error: undefined,
    }),
    executeModule: async () => ({
        success: true,
        data: [],
        duration: 0,
        warnings: ['Running in development mode - returning mock data'],
        error: undefined,
    }),
    cancelExecution: async () => false,
    discoverModules: async () => [],
    executeParallel: async () => [],
    executeWithRetry: async () => ({
        success: false,
        error: 'Electron API not available',
        duration: 0,
        warnings: [],
    }),
    // ========================================
    // File Operations
    // ========================================
    readFile: async () => {
        throw new Error('Electron API not available');
    },
    writeFile: async () => {
        throw new Error('Electron API not available');
    },
    fileExists: async () => false,
    deleteFile: async () => {
        throw new Error('Electron API not available');
    },
    listFiles: async () => [],
    logToFile: async () => {
        // No-op in fallback mode
    },
    // ========================================
    // Configuration Management
    // ========================================
    getConfig: async () => null,
    setConfig: async () => { },
    getAllConfig: async () => ({}),
    deleteConfig: async () => { },
    // ========================================
    // Profile Management
    // ========================================
    loadSourceProfiles: async () => [],
    loadTargetProfiles: async () => [],
    getActiveSourceProfile: async () => null,
    getActiveTargetProfile: async () => null,
    createSourceProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),
    createTargetProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),
    updateSourceProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),
    updateTargetProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),
    deleteSourceProfile: async () => ({ success: false, error: 'Electron API not available' }),
    deleteTargetProfile: async () => ({ success: false, error: 'Electron API not available' }),
    setActiveSourceProfile: async () => ({ success: false, error: 'Electron API not available', dataPath: '' }),
    setActiveTargetProfile: async () => ({ success: false, error: 'Electron API not available' }),
    refreshProfiles: async () => ({ success: false, error: 'Electron API not available', profiles: [] }),
    getProfileDataPath: async () => ({ success: false, error: 'Electron API not available', path: '' }),
    // ========================================
    // Event Listeners (for streaming)
    // ========================================
    onProgress: () => () => { },
    onOutput: () => () => { },
    onOutputStream: () => () => { },
    onErrorStream: () => () => { },
    onWarningStream: () => () => { },
    onVerboseStream: () => () => { },
    onDebugStream: () => () => { },
    onInformationStream: () => () => { },
    onExecutionCancelled: () => () => { },
    // ========================================
    // File Watcher Operations
    // ========================================
    startFileWatcher: async () => ({ success: false }),
    stopFileWatcher: async () => ({ success: false }),
    stopAllFileWatchers: async () => ({ success: false }),
    getWatchedFiles: async () => [],
    getFileWatcherStatistics: async () => ({
        activeWatchers: 0,
        watchedDirectories: [],
        totalEvents: 0,
        eventsByType: { added: 0, changed: 0, deleted: 0 }
    }),
    onFileChanged: () => () => { },
    // ========================================
    // System / App Operations
    // ========================================
    getAppVersion: async () => 'development',
    getDataPath: async () => process.cwd(),
    openExternal: async () => { },
    showOpenDialog: async () => null,
    showSaveDialog: async () => null,
    // ========================================
    // Generic IPC Invoke (for custom handlers)
    // ========================================
    invoke: async () => {
        throw new Error('Electron API not available');
    },
    // ========================================
    // Environment Detection
    // ========================================
    detectEnvironment: async () => ({
        id: 'fallback',
        startTime: new Date(),
        endTime: new Date(),
        status: 'failed',
        detectedEnvironment: 'unknown',
        detectedServices: [],
        recommendations: [],
        totalServicesFound: 0,
        confidence: 0,
        errors: [{ timestamp: new Date(), serviceType: 'system', message: 'Electron API not available' }],
        warnings: [],
    }),
    validateEnvironmentCredentials: async () => ({
        valid: false,
        message: 'Electron API not available'
    }),
    cancelEnvironmentDetection: async () => false,
    getEnvironmentStatistics: async () => ({
        activeDetections: 0,
        totalDetectionsRun: 0
    }),
    onEnvironmentDetectionStarted: () => () => { },
    onEnvironmentDetectionProgress: () => () => { },
    onEnvironmentDetectionCompleted: () => () => { },
    onEnvironmentDetectionFailed: () => () => { },
    onEnvironmentDetectionCancelled: () => () => { },
    // ========================================
    // Discovery Module Execution
    // ========================================
    executeDiscovery: async () => ({
        success: false,
        error: 'Electron API not available',
    }),
    cancelDiscovery: async () => ({
        success: false,
        error: 'Electron API not available',
    }),
    getDiscoveryModules: async () => ({
        success: false,
        modules: [],
        error: 'Electron API not available',
    }),
    getDiscoveryModuleInfo: async () => ({
        success: false,
        error: 'Electron API not available',
    }),
    onDiscoveryOutput: () => () => { },
    onDiscoveryProgress: () => () => { },
    onDiscoveryComplete: () => () => { },
    onDiscoveryError: () => () => { },
    onDiscoveryCancelled: () => () => { },
    // ========================================
    // Logic Engine API
    // ========================================
    logicEngine: {
        loadAll: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        getUserDetail: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        getStatistics: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        invalidateCache: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        onProgress: () => () => { },
        onLoaded: () => () => { },
        onError: () => () => { },
        analyzeMigrationComplexity: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        batchAnalyzeMigrationComplexity: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        getComplexityStatistics: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
    },
    // ========================================
    // Dashboard API
    // ========================================
    dashboard: {
        getStats: async () => ({
            success: true,
            data: {
                totalUsers: 0,
                totalGroups: 0,
                totalComputers: 0,
                totalApplications: 0,
                migrationReadiness: {
                    ready: 0,
                    needsReview: 0,
                    notReady: 0,
                },
            },
        }),
        getProjectTimeline: async () => ({
            success: true,
            data: {
                projectName: 'Development Mode',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                currentPhase: 'Planning',
                phases: [],
                waves: [],
            },
        }),
        getSystemHealth: async () => ({
            success: true,
            data: {
                logicEngineStatus: 'offline',
                powerShellStatus: 'offline',
                dataConnectionStatus: 'offline',
                lastHealthCheck: new Date().toISOString(),
                warnings: ['Running in development mode without Electron'],
            },
        }),
        getRecentActivity: async () => ({
            success: true,
            data: [],
        }),
        acknowledgeAlert: async () => {
            // No-op in fallback mode
        },
    },
    // ========================================
    // Project Management API
    // ========================================
    project: {
        getConfiguration: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        saveConfiguration: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        updateStatus: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        addWave: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
        updateWaveStatus: async () => ({
            success: false,
            error: 'Electron API not available'
        }),
    },
};
/**
 * Get the electronAPI from window, falling back to fallback implementation
 */
const getElectronAPI = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
        return window.electronAPI;
    }
    console.warn('Using fallback Electron API - running in development mode without Electron');
    return electronAPIFallback;
};


/***/ }),

/***/ 74160:
/*!**************************************************!*\
  !*** ./src/renderer/components/atoms/Button.tsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: () => (/* binding */ Button)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Button Component
 *
 * Fully accessible button with multiple variants and sizes
 */



/**
 * Button component with full accessibility support
 */
const Button = (0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(({ variant = 'primary', size = 'md', icon, iconPosition = 'leading', loading = false, disabled = false, fullWidth = false, children, className, onClick, 'data-cy': dataCy, ...props }, ref) => {
    // Variant styles
    const variants = {
        primary: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500', 'disabled:bg-blue-300 disabled:cursor-not-allowed', 'dark:bg-blue-500 dark:hover:bg-blue-600'),
        secondary: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400', 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed', 'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'),
        danger: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', 'disabled:bg-red-300 disabled:cursor-not-allowed', 'dark:bg-red-500 dark:hover:bg-red-600'),
        ghost: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400', 'disabled:text-gray-400 disabled:cursor-not-allowed', 'dark:text-gray-300 dark:hover:bg-gray-800'),
        link: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline', 'disabled:text-blue-300 disabled:cursor-not-allowed', 'dark:text-blue-400 dark:hover:text-blue-300'),
    };
    // Size styles
    const sizes = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
        xl: 'px-6 py-3 text-base',
    };
    // Base button classes
    const baseClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('inline-flex items-center justify-center', 'font-medium rounded-md', 'transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:opacity-50', fullWidth && 'w-full', variants[variant], sizes[size], className);
    // Handle click with loading state
    const handleClick = (e) => {
        if (!loading && !disabled && onClick) {
            onClick(e);
        }
    };
    // Render loading spinner
    const renderLoadingIcon = () => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Loader2, { className: "animate-spin", size: 16, "aria-hidden": "true" }));
    // Render icon
    const renderIcon = () => {
        if (loading)
            return renderLoadingIcon();
        return icon;
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { ref: ref, className: baseClasses, onClick: handleClick, disabled: disabled || loading, "aria-busy": loading, "aria-disabled": disabled || loading, "data-cy": dataCy, ...props, children: [iconPosition === 'leading' && renderIcon() && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "mr-2", children: renderIcon() })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), iconPosition === 'trailing' && renderIcon() && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "ml-2", children: renderIcon() }))] }));
});
Button.displayName = 'Button';


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zcmNfcmVuZGVyZXJfQS4wMjlmYTI1NDQxOGQ2OWNhODAwOS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3FDO0FBQ1Q7QUFDNUI7QUFDQTtBQUNBO0FBQ08sa0JBQWtCLGtLQUFrSztBQUMzTCxlQUFlLDRDQUFLO0FBQ3BCLHVCQUF1QixHQUFHO0FBQzFCLHdCQUF3QixHQUFHO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQiwwQ0FBSTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLDBDQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZLHVEQUFLLFVBQVUsMENBQTBDLHVEQUFLLFlBQVkscUVBQXFFLHNEQUFJLFdBQVcseUVBQXlFLEtBQUssSUFBSSx1REFBSyxhQUFhLDBLQUEwSywwQ0FBSTtBQUM1YjtBQUNBO0FBQ0EsaUJBQWlCLDRFQUE0RSxzREFBSSxhQUFhLGtEQUFrRCw2QkFBNkIsc0RBQUksYUFBYSx3RUFBd0Usb0JBQW9CLGdCQUFnQixzREFBSSxRQUFRLDRHQUE0RyxnQ0FBZ0Msc0RBQUksUUFBUSw2RUFBNkUsS0FBSztBQUNoakI7QUFDQSxzRUFBZSxzREFBTSxJQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlDeUM7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3lDO0FBQ3dCO0FBQ3pCO0FBQ2pDLDRCQUE0QixlQUFTO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNB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VDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHFCQUFRO0FBQzFCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHFCQUFRO0FBQzFCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsaUJBQUk7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IscUJBQVE7QUFDMUI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsbUJBQU07QUFDeEI7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLHNCQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLG1CQUFNO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixxQkFBUTtBQUMxQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QSxpQkFBaUIsMENBQUk7QUFDckIsbUJBQW1CLDBDQUFJO0FBQ3ZCLGdCQUFnQiwwQ0FBSTtBQUNwQixlQUFlLDBDQUFJO0FBQ25CLGNBQWMsMENBQUk7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsMENBQUk7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsc0RBQUksQ0FBQyxpREFBTyxJQUFJLDREQUE0RDtBQUNqSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLGFBQWEsME9BQTBPLHNEQUFJLFdBQVcsMkNBQTJDLElBQUksc0RBQUksV0FBVyxvQkFBb0IsbURBQW1ELHNEQUFJLFdBQVcsMkNBQTJDLEtBQUs7QUFDM2QsQ0FBQztBQUNEIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9TZWxlY3QudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvRXJyb3JCb3VuZGFyeS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9Ob3RpZmljYXRpb25Db250YWluZXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL01vZGFsQ29udGFpbmVyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9TeXN0ZW1TdGF0dXMudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1Byb2ZpbGVTZWxlY3Rvci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlU3lzdGVtSGVhbHRoTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvU2lkZWJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVGFiVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvbGliL2NvbW1hbmRSZWdpc3RyeS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9Db21tYW5kUGFsZXR0ZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9sYXlvdXRzL01haW5MYXlvdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL0FwcC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9TdGF0dXNJbmRpY2F0b3IudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvU3Bpbm5lci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvbGliL2VsZWN0cm9uLWFwaS1mYWxsYmFjay50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0J1dHRvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VsZWN0IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgZHJvcGRvd24gc2VsZWN0IGNvbXBvbmVudCB3aXRoIGVycm9yIHN0YXRlcyBhbmQgdmFsaWRhdGlvbi5cbiAqIEZvbGxvd3MgV0NBRyAyLjEgQUEgZ3VpZGVsaW5lcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUlkIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBTZWxlY3QgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3QgPSAoeyBsYWJlbCwgbmFtZSwgdmFsdWUsIG9uQ2hhbmdlLCBvcHRpb25zLCBwbGFjZWhvbGRlciA9ICdTZWxlY3QgYW4gb3B0aW9uLi4uJywgZXJyb3IsIGhlbHBlclRleHQsIHJlcXVpcmVkID0gZmFsc2UsIGRpc2FibGVkID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpZH0taGVscGVyYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQudmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBzZWxlY3RDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdibG9jayB3LWZ1bGwgcm91bmRlZC1tZCBib3JkZXIgcHgtMyBweS0yIHNoYWRvdy1zbScsICd0ZXh0LWJhc2UgbGVhZGluZy02JywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCBcbiAgICAvLyBTdGF0ZS1iYXNlZCBzdHlsZXNcbiAgICB7XG4gICAgICAgIC8vIE5vcm1hbCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMzAwIGJnLXdoaXRlIHRleHQtZ3JheS05MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBFcnJvciBzdGF0ZVxuICAgICAgICAnYm9yZGVyLXJlZC0zMDAgYmctcmVkLTUwIHRleHQtcmVkLTkwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBiZy1ncmF5LTEwMCB0ZXh0LWdyYXktNTAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0sIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSBtYi0xJywge1xuICAgICAgICAndGV4dC1ncmF5LTcwMCc6ICFoYXNFcnJvcixcbiAgICAgICAgJ3RleHQtcmVkLTcwMCc6IGhhc0Vycm9yLFxuICAgICAgICAndGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy1mdWxsXCIsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJtbC0xIHRleHQtcmVkLTUwMFwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpXSB9KSksIF9qc3hzKFwic2VsZWN0XCIsIHsgaWQ6IGlkLCBuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIGRpc2FibGVkOiBkaXNhYmxlZCwgcmVxdWlyZWQ6IHJlcXVpcmVkLCBjbGFzc05hbWU6IHNlbGVjdENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIFtoZWxwZXJJZF06IGhlbHBlclRleHQgJiYgIWhhc0Vycm9yLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbcGxhY2Vob2xkZXIgJiYgKF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgZGlzYWJsZWQ6IHRydWUsIGNoaWxkcmVuOiBwbGFjZWhvbGRlciB9KSksIG9wdGlvbnMubWFwKChvcHRpb24pID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IG9wdGlvbi52YWx1ZSwgZGlzYWJsZWQ6IG9wdGlvbi5kaXNhYmxlZCwgY2hpbGRyZW46IG9wdGlvbi5sYWJlbCB9LCBvcHRpb24udmFsdWUpKSldIH0pLCBoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBcIm10LTEgdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpLCBoZWxwZXJUZXh0ICYmICFoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogXCJtdC0xIHRleHQtc20gdGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogaGVscGVyVGV4dCB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWxlY3Q7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBFcnJvciBCb3VuZGFyeSBDb21wb25lbnRcbiAqXG4gKiBDYXRjaGVzIFJlYWN0IGVycm9ycyBpbiB0aGUgY29tcG9uZW50IHRyZWUgYW5kIGRpc3BsYXlzIGEgZmFsbGJhY2sgVUkuXG4gKiBMb2dzIGVycm9ycyBmb3IgZGVidWdnaW5nIGFuZCBwcm92aWRlcyByZWNvdmVyeSBvcHRpb25zLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIFJlZnJlc2hDdywgSG9tZSwgQnVnIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vYXRvbXMvQnV0dG9uJztcbmV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBoYXNFcnJvcjogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGVycm9ySW5mbzogbnVsbCxcbiAgICAgICAgICAgIHNob3dFcnJvckRldGFpbHM6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoYXNFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgZXJyb3JJbmZvKSB7XG4gICAgICAgIC8vIExvZyBlcnJvciB0byBjb25zb2xlXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yQm91bmRhcnkgY2F1Z2h0IGFuIGVycm9yOicsIGVycm9yLCBlcnJvckluZm8pO1xuICAgICAgICAvLyBVcGRhdGUgc3RhdGVcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlcnJvckluZm8sXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDYWxsIGN1c3RvbSBlcnJvciBoYW5kbGVyIGlmIHByb3ZpZGVkXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25FcnJvcihlcnJvciwgZXJyb3JJbmZvKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTZW5kIGVycm9yIHRvIG1haW4gcHJvY2VzcyBmb3IgbG9nZ2luZ1xuICAgICAgICBpZiAod2luZG93LmVsZWN0cm9uPy5sb2dFcnJvcikge1xuICAgICAgICAgICAgd2luZG93LmVsZWN0cm9uLmxvZ0Vycm9yKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayB8fCAnJyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRTdGFjazogZXJyb3JJbmZvLmNvbXBvbmVudFN0YWNrIHx8ICcnLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaGFuZGxlUmVzZXQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGFzRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBlcnJvckluZm86IG51bGwsXG4gICAgICAgICAgICBzaG93RXJyb3JEZXRhaWxzOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBoYW5kbGVHb0hvbWUgPSAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMvJztcbiAgICAgICAgdGhpcy5oYW5kbGVSZXNldCgpO1xuICAgIH07XG4gICAgaGFuZGxlUmVsb2FkID0gKCkgPT4ge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfTtcbiAgICB0b2dnbGVFcnJvckRldGFpbHMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUocHJldlN0YXRlID0+ICh7XG4gICAgICAgICAgICBzaG93RXJyb3JEZXRhaWxzOiAhcHJldlN0YXRlLnNob3dFcnJvckRldGFpbHMsXG4gICAgICAgIH0pKTtcbiAgICB9O1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaGFzRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFVzZSBjdXN0b20gZmFsbGJhY2sgaWYgcHJvdmlkZWRcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmZhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVycm9yLCBlcnJvckluZm8sIHNob3dFcnJvckRldGFpbHMgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMCBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1heC13LTJ4bCB3LWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy1sZyBwLThcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1jZW50ZXIgbWItNlwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTE2IGgtMTYgYmctcmVkLTEwMCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTEwIGgtMTAgdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwXCIgfSkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIG1iLThcIiwgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTJcIiwgY2hpbGRyZW46IFwiU29tZXRoaW5nIFdlbnQgV3JvbmdcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZS4gQW4gdW5leHBlY3RlZCBlcnJvciBoYXMgb2NjdXJyZWQuXCIgfSldIH0pLCB0aGlzLnByb3BzLnNob3dEZXRhaWxzICE9PSBmYWxzZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogdGhpcy50b2dnbGVFcnJvckRldGFpbHMsIGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwIGhvdmVyOnRleHQtZ3JheS05MDAgZGFyazpob3Zlcjp0ZXh0LXdoaXRlIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1ZywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBzaG93RXJyb3JEZXRhaWxzID8gJ0hpZGUnIDogJ1Nob3cnLCBcIiBFcnJvciBEZXRhaWxzXCJdIH0pLCBzaG93RXJyb3JEZXRhaWxzICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbWQgcC00IHNwYWNlLXktNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTFcIiwgY2hpbGRyZW46IFwiRXJyb3IgTWVzc2FnZTpcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgZm9udC1tb25vXCIsIGNoaWxkcmVuOiBlcnJvcj8ubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcicgfSldIH0pLCBlcnJvcj8uc3RhY2sgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTFcIiwgY2hpbGRyZW46IFwiU3RhY2sgVHJhY2U6XCIgfSksIF9qc3goXCJwcmVcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBmb250LW1vbm8gb3ZlcmZsb3cteC1hdXRvIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC0yIHJvdW5kZWRcIiwgY2hpbGRyZW46IGVycm9yLnN0YWNrIH0pXSB9KSksIGVycm9ySW5mbz8uY29tcG9uZW50U3RhY2sgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTFcIiwgY2hpbGRyZW46IFwiQ29tcG9uZW50IFN0YWNrOlwiIH0pLCBfanN4KFwicHJlXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgZm9udC1tb25vIG92ZXJmbG93LXgtYXV0byBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtMiByb3VuZGVkIG1heC1oLTQwXCIsIGNoaWxkcmVuOiBlcnJvckluZm8uY29tcG9uZW50U3RhY2sgfSldIH0pKV0gfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogdGhpcy5oYW5kbGVSZXNldCwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogXCJUcnkgQWdhaW5cIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogdGhpcy5oYW5kbGVHb0hvbWUsIGljb246IF9qc3goSG9tZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBcIkdvIHRvIEhvbWVcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogdGhpcy5oYW5kbGVSZWxvYWQsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IFwiUmVsb2FkIEFwcFwiIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC02IHB0LTYgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBcIklmIHRoaXMgcHJvYmxlbSBwZXJzaXN0cywgcGxlYXNlIGNvbnRhY3Qgc3VwcG9ydCB3aXRoIHRoZSBlcnJvciBkZXRhaWxzIGFib3ZlLlwiIH0pIH0pXSB9KSB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW47XG4gICAgfVxufVxuLyoqXG4gKiBIaWdoZXItb3JkZXIgY29tcG9uZW50IHRvIHdyYXAgYSBjb21wb25lbnQgd2l0aCBFcnJvckJvdW5kYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aXRoRXJyb3JCb3VuZGFyeShDb21wb25lbnQsIGVycm9yQm91bmRhcnlQcm9wcykge1xuICAgIHJldHVybiAocHJvcHMpID0+IChfanN4KEVycm9yQm91bmRhcnksIHsgLi4uZXJyb3JCb3VuZGFyeVByb3BzLCBjaGlsZHJlbjogX2pzeChDb21wb25lbnQsIHsgLi4ucHJvcHMgfSkgfSkpO1xufVxuZXhwb3J0IGRlZmF1bHQgRXJyb3JCb3VuZGFyeTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE5vdGlmaWNhdGlvbiBDb250YWluZXIgQ29tcG9uZW50XG4gKlxuICogRGlzcGxheXMgdG9hc3Qgbm90aWZpY2F0aW9ucyBpbiB0aGUgVUkuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBYLCBDaGVja0NpcmNsZSwgWENpcmNsZSwgQWxlcnRUcmlhbmdsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VOb3RpZmljYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU5vdGlmaWNhdGlvblN0b3JlJztcbmV4cG9ydCBjb25zdCBOb3RpZmljYXRpb25Db250YWluZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgbm90aWZpY2F0aW9ucyA9IHVzZU5vdGlmaWNhdGlvblN0b3JlKChzdGF0ZSkgPT4gc3RhdGUudG9hc3RzKTtcbiAgICBjb25zdCBkaXNtaXNzVG9hc3QgPSB1c2VOb3RpZmljYXRpb25TdG9yZSgoc3RhdGUpID0+IHN0YXRlLmRpc21pc3NUb2FzdCk7XG4gICAgY29uc3QgaGFuZGxlRGlzbWlzcyA9IChpZCkgPT4ge1xuICAgICAgICBkaXNtaXNzVG9hc3QoaWQpO1xuICAgIH07XG4gICAgY29uc3QgZ2V0SWNvbiA9ICh0eXBlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnc3VjY2Vzcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmVlbi01MDBcIiB9KTtcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gX2pzeChYQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTUwMFwiIH0pO1xuICAgICAgICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qc3goQWxlcnRUcmlhbmdsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LXllbGxvdy01MDBcIiB9KTtcbiAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIHJldHVybiBfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ibHVlLTUwMFwiIH0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS01MDBcIiB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0QmFja2dyb3VuZENsYXNzID0gKHR5cGUpID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTUwIGRhcms6YmctZ3JlZW4tOTAwLzIwIGJvcmRlci1ncmVlbi0yMDAgZGFyazpib3JkZXItZ3JlZW4tODAwJztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCc7XG4gICAgICAgICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAgYm9yZGVyLXllbGxvdy0yMDAgZGFyazpib3JkZXIteWVsbG93LTgwMCc7XG4gICAgICAgICAgICBjYXNlICdpbmZvJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCBib3JkZXItYmx1ZS0yMDAgZGFyazpib3JkZXItYmx1ZS04MDAnO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMC8yMCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS04MDAnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBnZXRUZXh0Q2xhc3MgPSAodHlwZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1ncmVlbi04MDAgZGFyazp0ZXh0LWdyZWVuLTIwMCc7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LXJlZC04MDAgZGFyazp0ZXh0LXJlZC0yMDAnO1xuICAgICAgICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LXllbGxvdy04MDAgZGFyazp0ZXh0LXllbGxvdy0yMDAnO1xuICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LWJsdWUtODAwIGRhcms6dGV4dC1ibHVlLTIwMCc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0yMDAnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBnZXRBY3Rpb25zID0gKG5vdGlmaWNhdGlvbikgPT4ge1xuICAgICAgICBjb25zdCBsZWdhY3lBY3Rpb24gPSBub3RpZmljYXRpb24uYWN0aW9uO1xuICAgICAgICBjb25zdCBvcHRpb25BY3Rpb25zID0gbm90aWZpY2F0aW9uLm9wdGlvbnM/LmFjdGlvbnMgPz8gW107XG4gICAgICAgIHJldHVybiBsZWdhY3lBY3Rpb24gPyBbbGVnYWN5QWN0aW9uLCAuLi5vcHRpb25BY3Rpb25zXSA6IG9wdGlvbkFjdGlvbnM7XG4gICAgfTtcbiAgICBpZiAobm90aWZpY2F0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCB0b3AtNCByaWdodC00IHotNTAgZmxleCBmbGV4LWNvbCBnYXAtMiBtYXgtdy1tZFwiLCBjaGlsZHJlbjogbm90aWZpY2F0aW9ucy5tYXAoKG5vdGlmaWNhdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9ucyA9IGdldEFjdGlvbnMobm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIHAtNCByb3VuZGVkLWxnIGJvcmRlciBzaGFkb3ctbGcgYW5pbWF0ZS1zbGlkZS1pbi1yaWdodCAke2dldEJhY2tncm91bmRDbGFzcyhub3RpZmljYXRpb24udHlwZSl9ICR7bm90aWZpY2F0aW9uLm9wdGlvbnM/LmNsYXNzTmFtZSA/PyAnJ31gLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LXNocmluay0wIG10LTAuNVwiLCBjaGlsZHJlbjogZ2V0SWNvbihub3RpZmljYXRpb24udHlwZSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBtaW4tdy0wXCIsIGNoaWxkcmVuOiBbbm90aWZpY2F0aW9uLnRpdGxlICYmIChfanN4KFwiaDRcIiwgeyBjbGFzc05hbWU6IGB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgJHtnZXRUZXh0Q2xhc3Mobm90aWZpY2F0aW9uLnR5cGUpfWAsIGNoaWxkcmVuOiBub3RpZmljYXRpb24udGl0bGUgfSkpLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogYHRleHQtc20gbXQtMSB3aGl0ZXNwYWNlLXByZS1saW5lICR7Z2V0VGV4dENsYXNzKG5vdGlmaWNhdGlvbi50eXBlKX1gLCBjaGlsZHJlbjogbm90aWZpY2F0aW9uLm1lc3NhZ2UgfSksIGFjdGlvbnMubGVuZ3RoID09PSAxICYmIChfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gYWN0aW9uc1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbj8ub25DbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbj8uZGlzbWlzc09uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVEaXNtaXNzKG5vdGlmaWNhdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNsYXNzTmFtZTogYHRleHQtc20gZm9udC1tZWRpdW0gbXQtMiB1bmRlcmxpbmUgJHtnZXRUZXh0Q2xhc3Mobm90aWZpY2F0aW9uLnR5cGUpfSBob3ZlcjpvcGFjaXR5LTgwYCwgY2hpbGRyZW46IGFjdGlvbnNbMF0ubGFiZWwgfSkpLCBhY3Rpb25zLmxlbmd0aCA+IDEgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LXdyYXAgZ2FwLTIgbXQtMlwiLCBjaGlsZHJlbjogYWN0aW9ucy5tYXAoKGFjdGlvbiwgaW5kZXgpID0+IChfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbi5vbkNsaWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGlvbi5kaXNtaXNzT25DbGljaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVEaXNtaXNzKG5vdGlmaWNhdGlvbi5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2xhc3NOYW1lOiBgdGV4dC1zbSBmb250LW1lZGl1bSB1bmRlcmxpbmUgJHtnZXRUZXh0Q2xhc3Mobm90aWZpY2F0aW9uLnR5cGUpfSBob3ZlcjpvcGFjaXR5LTgwYCwgY2hpbGRyZW46IGFjdGlvbi5sYWJlbCB9LCBgJHtub3RpZmljYXRpb24uaWR9LWFjdGlvbi0ke2luZGV4fWApKSkgfSkpXSB9KSwgKG5vdGlmaWNhdGlvbi5vcHRpb25zPy5kaXNtaXNzaWJsZSA/PyB0cnVlKSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IGhhbmRsZURpc21pc3Mobm90aWZpY2F0aW9uLmlkKSwgY2xhc3NOYW1lOiBgZmxleC1zaHJpbmstMCAke2dldFRleHRDbGFzcyhub3RpZmljYXRpb24udHlwZSl9IGhvdmVyOm9wYWNpdHktODBgLCBcImFyaWEtbGFiZWxcIjogXCJEaXNtaXNzIG5vdGlmaWNhdGlvblwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkgfSkpXSB9LCBub3RpZmljYXRpb24uaWQpKTtcbiAgICAgICAgfSkgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE5vdGlmaWNhdGlvbkNvbnRhaW5lcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTW9kYWxDb250YWluZXIgQ29tcG9uZW50XG4gKlxuICogR2xvYmFsIG1vZGFsIGNvbnRhaW5lciB0aGF0IHJlbmRlcnMgYWxsIGFjdGl2ZSBtb2RhbHMgZnJvbSB0aGUgbW9kYWwgc3RvcmUuXG4gKiBEeW5hbWljYWxseSBpbXBvcnRzIGFuZCByZW5kZXJzIHRoZSBhcHByb3ByaWF0ZSBkaWFsb2cgY29tcG9uZW50IGJhc2VkIG9uIG1vZGFsIHR5cGUuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyBsYXp5LCBTdXNwZW5zZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU1vZGFsU3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZS91c2VNb2RhbFN0b3JlJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBkaWFsb2cgY29tcG9uZW50c1xuY29uc3QgQ3JlYXRlUHJvZmlsZURpYWxvZyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9kaWFsb2dzL0NyZWF0ZVByb2ZpbGVEaWFsb2cnKSk7XG5jb25zdCBFZGl0UHJvZmlsZURpYWxvZyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9kaWFsb2dzL0VkaXRQcm9maWxlRGlhbG9nJykpO1xuY29uc3QgRGVsZXRlQ29uZmlybWF0aW9uRGlhbG9nID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL2RpYWxvZ3MvRGVsZXRlQ29uZmlybWF0aW9uRGlhbG9nJykpO1xuY29uc3QgQ29uZmlybURpYWxvZyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9kaWFsb2dzL0NvbmZpcm1EaWFsb2cnKSk7XG5jb25zdCBFeHBvcnREaWFsb2cgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vZGlhbG9ncy9FeHBvcnREaWFsb2cnKSk7XG5jb25zdCBJbXBvcnREaWFsb2cgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vZGlhbG9ncy9JbXBvcnREaWFsb2cnKSk7XG5jb25zdCBDb2x1bW5WaXNpYmlsaXR5RGlhbG9nID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL2RpYWxvZ3MvQ29sdW1uVmlzaWJpbGl0eURpYWxvZycpKTtcbmNvbnN0IFdhdmVTY2hlZHVsaW5nRGlhbG9nID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL2RpYWxvZ3MvV2F2ZVNjaGVkdWxpbmdEaWFsb2cnKSk7XG5jb25zdCBTZXR0aW5nc0RpYWxvZyA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9kaWFsb2dzL1NldHRpbmdzRGlhbG9nJykpO1xuY29uc3QgQWJvdXREaWFsb2cgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vZGlhbG9ncy9BYm91dERpYWxvZycpKTtcbi8qKlxuICogTG9hZGluZyBmYWxsYmFjayBmb3IgbGF6eS1sb2FkZWQgZGlhbG9nc1xuICovXG5jb25zdCBEaWFsb2dMb2FkaW5nRmFsbGJhY2sgPSAoKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwIHotNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHAtOCBzaGFkb3ctMnhsXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRpYWxvZy4uLlwiIH0pIH0pIH0pKTtcbi8qKlxuICogTW9kYWwgQ29udGFpbmVyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgTW9kYWxDb250YWluZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBtb2RhbHMsIGNsb3NlTW9kYWwgfSA9IHVzZU1vZGFsU3RvcmUoKTtcbiAgICBpZiAobW9kYWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4KF9GcmFnbWVudCwgeyBjaGlsZHJlbjogbW9kYWxzLm1hcCgobW9kYWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChtb2RhbC5kaXNtaXNzYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsKG1vZGFsLmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlQ29uZmlybSA9IChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBjbG9zZU1vZGFsKG1vZGFsLmlkLCByZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIFJlbmRlciB0aGUgYXBwcm9wcmlhdGUgZGlhbG9nIGNvbXBvbmVudCBiYXNlZCBvbiB0eXBlXG4gICAgICAgICAgICBjb25zdCByZW5kZXJEaWFsb2cgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChtb2RhbC50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NyZWF0ZVByb2ZpbGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlUHJvZmlsZURpYWxvZyBtYW5hZ2VzIGl0cyBvd24gc3RhdGUgdmlhIHVzZU1vZGFsU3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfanN4KENyZWF0ZVByb2ZpbGVEaWFsb2csIHt9LCBtb2RhbC5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VkaXRQcm9maWxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChFZGl0UHJvZmlsZURpYWxvZywgeyBpc09wZW46IHRydWUsIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBvblNhdmU6IGFzeW5jIChwcm9maWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2RhbC5vbkNvbmZpcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGFsLm9uQ29uZmlybShwcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsKG1vZGFsLmlkLCBwcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBwcm9maWxlOiBtb2RhbC5kYXRhPy5wcm9maWxlLCBvblRlc3RDb25uZWN0aW9uOiBtb2RhbC5kYXRhPy5vblRlc3RDb25uZWN0aW9uLCBcImRhdGEtY3lcIjogXCJtb2RhbC1lZGl0LXByb2ZpbGVcIiB9KSk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZUNvbmZpcm0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KERlbGV0ZUNvbmZpcm1hdGlvbkRpYWxvZywgeyBpc09wZW46IHRydWUsIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBvbkNvbmZpcm06IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsLm9uQ29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwub25Db25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IG1vZGFsLnRpdGxlLCBtZXNzYWdlOiBtb2RhbC5kYXRhPy5tZXNzYWdlIHx8ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgaXRlbT8nLCBpdGVtTmFtZTogbW9kYWwuZGF0YT8uaXRlbU5hbWUsIFwiZGF0YS1jeVwiOiBcIm1vZGFsLWRlbGV0ZS1jb25maXJtXCIgfSkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goQ29uZmlybURpYWxvZywgeyBpc09wZW46IHRydWUsIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBvbkNvbmZpcm06IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsLm9uQ29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwub25Db25maXJtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IG1vZGFsLnRpdGxlLCBtZXNzYWdlOiBtb2RhbC5kYXRhPy5tZXNzYWdlIHx8ICcnLCB2YXJpYW50OiBtb2RhbC50eXBlID09PSAnd2FybmluZycgPyAnd2FybmluZycgOiBtb2RhbC50eXBlID09PSAnZXJyb3InID8gJ2RhbmdlcicgOiBtb2RhbC50eXBlID09PSAnc3VjY2VzcycgPyAnc3VjY2VzcycgOiAnaW5mbycsIGNvbmZpcm1UZXh0OiBtb2RhbC5kYXRhPy5jb25maXJtVGV4dCB8fCAnT0snLCBjYW5jZWxUZXh0OiBtb2RhbC5kYXRhPy5jYW5jZWxUZXh0LCBcImRhdGEtY3lcIjogYG1vZGFsLSR7bW9kYWwudHlwZX1gIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXhwb3J0RGF0YSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goRXhwb3J0RGlhbG9nLCB7IGlzT3BlbjogdHJ1ZSwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIG9uRXhwb3J0OiBhc3luYyAob3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kYWwub25Db25maXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBtb2RhbC5vbkNvbmZpcm0ob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgYXZhaWxhYmxlQ29sdW1uczogbW9kYWwuZGF0YT8uYXZhaWxhYmxlQ29sdW1ucywgZGVmYXVsdEZvcm1hdDogbW9kYWwuZGF0YT8uZGVmYXVsdEZvcm1hdCwgXCJkYXRhLWN5XCI6IFwibW9kYWwtZXhwb3J0XCIgfSkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbXBvcnREYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChJbXBvcnREaWFsb2csIHsgaXNPcGVuOiB0cnVlLCBvbkNsb3NlOiBoYW5kbGVDbG9zZSwgb25JbXBvcnQ6IGFzeW5jIChmaWxlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsLm9uQ29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwub25Db25maXJtKHsgZmlsZSwgZm9ybWF0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTW9kYWwobW9kYWwuaWQsIHsgZmlsZSwgZm9ybWF0IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZvcm1hdHM6IG1vZGFsLmRhdGE/LmZvcm1hdHMsIHNob3dQcmV2aWV3OiBtb2RhbC5kYXRhPy5zaG93UHJldmlldywgXCJkYXRhLWN5XCI6IFwibW9kYWwtaW1wb3J0XCIgfSkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjb2x1bW5WaXNpYmlsaXR5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChDb2x1bW5WaXNpYmlsaXR5RGlhbG9nLCB7IGlzT3BlbjogdHJ1ZSwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIGNvbHVtbnM6IG1vZGFsLmRhdGE/LmNvbHVtbnMgfHwgW10sIG9uQXBwbHk6IChzZWxlY3RlZENvbHVtbnMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsLm9uQ29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kYWwub25Db25maXJtKHNlbGVjdGVkQ29sdW1ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCwgc2VsZWN0ZWRDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBcImRhdGEtY3lcIjogXCJtb2RhbC1jb2x1bW4tdmlzaWJpbGl0eVwiIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd2F2ZVNjaGVkdWxpbmcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KFdhdmVTY2hlZHVsaW5nRGlhbG9nLCB7IGlzT3BlbjogdHJ1ZSwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIG9uU2NoZWR1bGU6IGFzeW5jIChzY2hlZHVsZURhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGFsLm9uQ29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kYWwub25Db25maXJtKHNjaGVkdWxlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCwgc2NoZWR1bGVEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB3YXZlOiBtb2RhbC5kYXRhPy53YXZlLCBcImRhdGEtY3lcIjogXCJtb2RhbC13YXZlLXNjaGVkdWxpbmdcIiB9KSk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NldHRpbmdzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChTZXR0aW5nc0RpYWxvZywgeyBpc09wZW46IHRydWUsIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBvblNhdmU6IChzZXR0aW5ncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kYWwub25Db25maXJtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RhbC5vbkNvbmZpcm0oc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTW9kYWwobW9kYWwuaWQsIHNldHRpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBcImRhdGEtY3lcIjogXCJtb2RhbC1zZXR0aW5nc1wiIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWJvdXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KEFib3V0RGlhbG9nLCB7IGlzT3BlbjogdHJ1ZSwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIFwiZGF0YS1jeVwiOiBcIm1vZGFsLWFib3V0XCIgfSkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjdXN0b20nOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGN1c3RvbSBtb2RhbHMsIHJlbmRlciB0aGUgY29tcG9uZW50IHBhc3NlZCBpbiBkYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kYWwuZGF0YT8uQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgQ3VzdG9tQ29tcG9uZW50ID0gbW9kYWwuZGF0YS5Db21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KEN1c3RvbUNvbXBvbmVudCwgeyBpc09wZW46IHRydWUsIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBvbkNvbmZpcm06IGhhbmRsZUNvbmZpcm0sIC4uLm1vZGFsLmRhdGEucHJvcHMgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIChfanN4KFN1c3BlbnNlLCB7IGZhbGxiYWNrOiBfanN4KERpYWxvZ0xvYWRpbmdGYWxsYmFjaywge30pLCBjaGlsZHJlbjogcmVuZGVyRGlhbG9nKCkgfSwgbW9kYWwuaWQpKTtcbiAgICAgICAgfSkgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE1vZGFsQ29udGFpbmVyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU3lzdGVtU3RhdHVzIENvbXBvbmVudFxuICpcbiAqIERpc3BsYXlzIHJlYWwtdGltZSBzeXN0ZW0gaGVhbHRoIGluZGljYXRvcnMgZm9yIExvZ2ljIEVuZ2luZSwgUG93ZXJTaGVsbCwgYW5kIERhdGEgQ29ubmVjdGlvbi5cbiAqIFNob3dzIHN0YXR1cyBmb3IgY3JpdGljYWwgc2VydmljZXMgd2l0aCBjb2xvci1jb2RlZCBpbmRpY2F0b3JzIGFuZCBsYXN0IHN5bmMgdGltZXN0YW1wLlxuICpcbiAqIEVwaWMgMDogVUkvVVggRW5oYW5jZW1lbnQgLSBOYXZpZ2F0aW9uICYgVVggKFRBU0sgNilcbiAqXG4gKiBAY29tcG9uZW50XG4gKiBAZXhhbXBsZVxuICogYGBgdHN4XG4gKiBjb25zdCB7IHN5c3RlbVN0YXR1cyB9ID0gdXNlU3lzdGVtSGVhbHRoTG9naWMoKTtcbiAqIDxTeXN0ZW1TdGF0dXMgaW5kaWNhdG9ycz17c3lzdGVtU3RhdHVzfSAvPlxuICogYGBgXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEYXRhYmFzZSwgU2VydmVyLCBTaGllbGQsIEFjdGl2aXR5IH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IFN0YXR1c0luZGljYXRvciB9IGZyb20gJy4uL2F0b21zL1N0YXR1c0luZGljYXRvcic7XG4vKipcbiAqIFN5c3RlbVN0YXR1cyBDb21wb25lbnRcbiAqXG4gKiBEaXNwbGF5cyByZWFsLXRpbWUgaGVhbHRoIHN0YXR1cyBmb3IgY3JpdGljYWwgc3lzdGVtIHNlcnZpY2VzLlxuICogVXBkYXRlcyBhdXRvbWF0aWNhbGx5IHZpYSB1c2VTeXN0ZW1IZWFsdGhMb2dpYyBob29rLlxuICovXG5leHBvcnQgY29uc3QgU3lzdGVtU3RhdHVzID0gKHsgaW5kaWNhdG9ycywgc2hvd0xhc3RTeW5jID0gdHJ1ZSwgY2xhc3NOYW1lID0gJycsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLyoqXG4gICAgICogQ29udmVydCBzZXJ2aWNlIHN0YXR1cyB0byBTdGF0dXNJbmRpY2F0b3IgdHlwZVxuICAgICAqL1xuICAgIGNvbnN0IGdldFN0YXR1c1R5cGUgPSAoc3RhdHVzKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlICdvbmxpbmUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnc3VjY2Vzcyc7XG4gICAgICAgICAgICBjYXNlICdkZWdyYWRlZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgICAgICAgIGNhc2UgJ29mZmxpbmUnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnZXJyb3InO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Vycm9yJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRm9ybWF0IGxhc3Qgc3luYyB0aW1lc3RhbXBcbiAgICAgKi9cbiAgICBjb25zdCBmb3JtYXRMYXN0U3luYyA9ICh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgaWYgKCF0aW1lc3RhbXApXG4gICAgICAgICAgICByZXR1cm4gJ05ldmVyJztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXApLnRvTG9jYWxlVGltZVN0cmluZyhbXSwge1xuICAgICAgICAgICAgICAgIGhvdXI6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgICAgICBtaW51dGU6ICcyLWRpZ2l0JyxcbiAgICAgICAgICAgICAgICBzZWNvbmQ6ICcyLWRpZ2l0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuICdJbnZhbGlkJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogYHNwYWNlLXktMiAke2NsYXNzTmFtZX1gLCBcImRhdGEtY3lcIjogZGF0YUN5IHx8ICdzeXN0ZW0tc3RhdHVzJywgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS00MDAgZGFyazp0ZXh0LWdyYXktNTAwIHVwcGVyY2FzZSBtYi0zXCIsIGNoaWxkcmVuOiBcIlN5c3RlbSBTdGF0dXNcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIFwiZGF0YS1jeVwiOiBcInN0YXR1cy1sb2dpYy1lbmdpbmVcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRGF0YWJhc2UsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgdGV4dC1ncmF5LTQwMCBkYXJrOnRleHQtZ3JheS01MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJMb2dpYyBFbmdpbmVcIiB9KV0gfSksIF9qc3goU3RhdHVzSW5kaWNhdG9yLCB7IHN0YXR1czogZ2V0U3RhdHVzVHlwZShpbmRpY2F0b3JzLmxvZ2ljRW5naW5lKSwgdGV4dDogaW5kaWNhdG9ycy5sb2dpY0VuZ2luZSwgc2l6ZTogXCJzbVwiLCBhbmltYXRlOiBpbmRpY2F0b3JzLmxvZ2ljRW5naW5lID09PSAnZGVncmFkZWQnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIFwiZGF0YS1jeVwiOiBcInN0YXR1cy1wb3dlcnNoZWxsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFNlcnZlciwgeyBjbGFzc05hbWU6IFwidy0zIGgtMyB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTUwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlBvd2VyU2hlbGxcIiB9KV0gfSksIF9qc3goU3RhdHVzSW5kaWNhdG9yLCB7IHN0YXR1czogZ2V0U3RhdHVzVHlwZShpbmRpY2F0b3JzLnBvd2VyU2hlbGwpLCB0ZXh0OiBpbmRpY2F0b3JzLnBvd2VyU2hlbGwsIHNpemU6IFwic21cIiwgYW5pbWF0ZTogaW5kaWNhdG9ycy5wb3dlclNoZWxsID09PSAnZGVncmFkZWQnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIFwiZGF0YS1jeVwiOiBcInN0YXR1cy1kYXRhLWNvbm5lY3Rpb25cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIHRleHQtZ3JheS00MDAgZGFyazp0ZXh0LWdyYXktNTAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiRGF0YSBDb25uZWN0aW9uXCIgfSldIH0pLCBfanN4KFN0YXR1c0luZGljYXRvciwgeyBzdGF0dXM6IGdldFN0YXR1c1R5cGUoaW5kaWNhdG9ycy5kYXRhQ29ubmVjdGlvbiksIHRleHQ6IGluZGljYXRvcnMuZGF0YUNvbm5lY3Rpb24sIHNpemU6IFwic21cIiwgYW5pbWF0ZTogaW5kaWNhdG9ycy5kYXRhQ29ubmVjdGlvbiA9PT0gJ2RlZ3JhZGVkJyB9KV0gfSksIHNob3dMYXN0U3luYyAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHQtMiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgXCJkYXRhLWN5XCI6IFwic3RhdHVzLWxhc3Qtc3luY1wiLCBjaGlsZHJlbjogW19qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgdGV4dC1ncmF5LTQwMCBkYXJrOnRleHQtZ3JheS01MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlN5bmM6IFwiLCBmb3JtYXRMYXN0U3luYyhpbmRpY2F0b3JzLmxhc3RTeW5jKV0gfSldIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFN5c3RlbVN0YXR1cztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzLCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUHJvZmlsZVNlbGVjdG9yIENvbXBvbmVudFxuICpcbiAqIERyb3Bkb3duIHNlbGVjdG9yIGZvciBzb3VyY2UvdGFyZ2V0IHByb2ZpbGVzIHdpdGggY29ubmVjdGlvbiB0ZXN0aW5nIGFuZCBtYW5hZ2VtZW50LlxuICogSW50ZWdyYXRlcyB3aXRoIHVzZVByb2ZpbGVTdG9yZSBmb3Igc3RhdGUgbWFuYWdlbWVudC5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBQbHVzLCBUcmFzaDIsIFRlc3RUdWJlLCBSZWZyZXNoQ3cgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmltcG9ydCB7IHVzZU1vZGFsU3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZS91c2VNb2RhbFN0b3JlJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL2F0b21zL1NlbGVjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3RhdHVzSW5kaWNhdG9yIH0gZnJvbSAnLi4vYXRvbXMvU3RhdHVzSW5kaWNhdG9yJztcbi8qKlxuICogUHJvZmlsZVNlbGVjdG9yIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgUHJvZmlsZVNlbGVjdG9yID0gKHsgdHlwZSwgbGFiZWwsIHNob3dBY3Rpb25zID0gdHJ1ZSwgb25DcmVhdGVQcm9maWxlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgeyBzb3VyY2VQcm9maWxlcywgdGFyZ2V0UHJvZmlsZXMsIHNlbGVjdGVkU291cmNlUHJvZmlsZSwgc2VsZWN0ZWRUYXJnZXRQcm9maWxlLCBjb25uZWN0aW9uU3RhdHVzLCBpc0xvYWRpbmcsIGVycm9yLCBzZXRTZWxlY3RlZFNvdXJjZVByb2ZpbGUsIHNldFNlbGVjdGVkVGFyZ2V0UHJvZmlsZSwgZGVsZXRlU291cmNlUHJvZmlsZSwgdGVzdENvbm5lY3Rpb24sIGxvYWRTb3VyY2VQcm9maWxlcywgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIGNvbnN0IFtpc1Rlc3RpbmcsIHNldElzVGVzdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgcHJvZmlsZXMgPSB0eXBlID09PSAnc291cmNlJyA/IHNvdXJjZVByb2ZpbGVzIDogdGFyZ2V0UHJvZmlsZXM7XG4gICAgY29uc3Qgc2VsZWN0ZWRQcm9maWxlID0gdHlwZSA9PT0gJ3NvdXJjZScgPyBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgOiBzZWxlY3RlZFRhcmdldFByb2ZpbGU7XG4gICAgLy8gQXV0by1sb2FkIHByb2ZpbGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlID09PSAnc291cmNlJyAmJiBzb3VyY2VQcm9maWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGxvYWRTb3VyY2VQcm9maWxlcygpO1xuICAgICAgICB9XG4gICAgfSwgW3R5cGVdKTsgLy8gT25seSBydW4gd2hlbiB0eXBlIGNoYW5nZXMgb3Igb24gbW91bnRcbiAgICBjb25zdCBoYW5kbGVQcm9maWxlQ2hhbmdlID0gYXN5bmMgKHByb2ZpbGVJZCkgPT4ge1xuICAgICAgICBpZiAoIXByb2ZpbGVJZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHByb2ZpbGVzLmZpbmQocCA9PiBwLmlkID09PSBwcm9maWxlSWQpO1xuICAgICAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtQcm9maWxlU2VsZWN0b3JdIFByb2ZpbGUgbm90IGZvdW5kOiAke3Byb2ZpbGVJZH1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhgW1Byb2ZpbGVTZWxlY3Rvcl0gU3dpdGNoaW5nIHRvIHByb2ZpbGU6ICR7Z2V0UHJvZmlsZURpc3BsYXlOYW1lKHByb2ZpbGUpfWApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzb3VyY2UnKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgc2V0U2VsZWN0ZWRTb3VyY2VQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUHJvZmlsZVNlbGVjdG9yXSBTdWNjZXNzZnVsbHkgc3dpdGNoZWQgdG8gc291cmNlIHByb2ZpbGU6ICR7Z2V0UHJvZmlsZURpc3BsYXlOYW1lKHByb2ZpbGUpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRUYXJnZXRQcm9maWxlKHByb2ZpbGUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbUHJvZmlsZVNlbGVjdG9yXSBTdWNjZXNzZnVsbHkgc3dpdGNoZWQgdG8gdGFyZ2V0IHByb2ZpbGU6ICR7Z2V0UHJvZmlsZURpc3BsYXlOYW1lKHByb2ZpbGUpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Byb2ZpbGVTZWxlY3Rvcl0gRmFpbGVkIHRvIHN3aXRjaCBwcm9maWxlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlVGVzdENvbm5lY3Rpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc2VsZWN0ZWRQcm9maWxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tQcm9maWxlU2VsZWN0b3JdIE5vIHByb2ZpbGUgc2VsZWN0ZWQgZm9yIHRlc3RpbmcnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGdldFByb2ZpbGVEaXNwbGF5TmFtZShzZWxlY3RlZFByb2ZpbGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW1Byb2ZpbGVTZWxlY3Rvcl0gVGVzdGluZyBjb25uZWN0aW9uIGZvciBwcm9maWxlOiAke3Byb2ZpbGVOYW1lfWApO1xuICAgICAgICBzZXRJc1Rlc3RpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0ZXN0Q29ubmVjdGlvbihzZWxlY3RlZFByb2ZpbGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tQcm9maWxlU2VsZWN0b3JdIOKchSBDb25uZWN0aW9uIHRlc3Qgc3VjY2Vzc2Z1bDonLCByZXN1bHQpO1xuICAgICAgICAgICAgYWxlcnQoYOKchSBDb25uZWN0aW9uIHRlc3Qgc3VjY2Vzc2Z1bCBmb3IgcHJvZmlsZSBcIiR7cHJvZmlsZU5hbWV9XCJcXG5cXG5DcmVkZW50aWFscyBhcmUgdmFsaWQgYW5kIEF6dXJlIEFQSSBpcyBhY2Nlc3NpYmxlLmApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW1Byb2ZpbGVTZWxlY3Rvcl0g4p2MIENvbm5lY3Rpb24gdGVzdCBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgICAgICBhbGVydChg4p2MIENvbm5lY3Rpb24gdGVzdCBmYWlsZWQgZm9yIHByb2ZpbGUgXCIke3Byb2ZpbGVOYW1lfVwiXFxuXFxuJHtlcnJvck1zZ31gKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzVGVzdGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZURlbGV0ZVByb2ZpbGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc2VsZWN0ZWRQcm9maWxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tQcm9maWxlU2VsZWN0b3JdIE5vIHByb2ZpbGUgc2VsZWN0ZWQgZm9yIGRlbGV0aW9uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSBnZXRQcm9maWxlRGlzcGxheU5hbWUoc2VsZWN0ZWRQcm9maWxlKTtcbiAgICAgICAgY29uc3QgcHJvZmlsZUlkID0gc2VsZWN0ZWRQcm9maWxlLmlkO1xuICAgICAgICBpZiAoIWNvbmZpcm0oYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgcHJvZmlsZSBcIiR7cHJvZmlsZU5hbWV9XCI/XFxuXFxuVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS5gKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3NvdXJjZScpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVTb3VyY2VQcm9maWxlKHByb2ZpbGVJZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtQcm9maWxlU2VsZWN0b3JdIOKchSBTdWNjZXNzZnVsbHkgZGVsZXRlZCBwcm9maWxlOiAke3Byb2ZpbGVOYW1lfWApO1xuICAgICAgICAgICAgICAgIC8vIFJlbG9hZCBwcm9maWxlcyB0byB1cGRhdGUgVUlcbiAgICAgICAgICAgICAgICBhd2FpdCBsb2FkU291cmNlUHJvZmlsZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRPRE86IEFkZCBkZWxldGVUYXJnZXRQcm9maWxlIGFjdGlvbiB0byBzdG9yZVxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1Byb2ZpbGVTZWxlY3Rvcl0gVGFyZ2V0IHByb2ZpbGUgZGVsZXRpb24gbm90IHlldCBpbXBsZW1lbnRlZCcpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdUYXJnZXQgcHJvZmlsZSBkZWxldGlvbiBpcyBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbUHJvZmlsZVNlbGVjdG9yXSBGYWlsZWQgdG8gZGVsZXRlIHByb2ZpbGU6JywgZXJyb3IpO1xuICAgICAgICAgICAgYWxlcnQoYEZhaWxlZCB0byBkZWxldGUgcHJvZmlsZTogJHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhlbHBlciBmdW5jdGlvbiB0byBnZXQgcHJvZmlsZSBkaXNwbGF5IG5hbWVcbiAgICBjb25zdCBnZXRQcm9maWxlRGlzcGxheU5hbWUgPSAocHJvZmlsZSkgPT4ge1xuICAgICAgICBpZiAoJ2NvbXBhbnlOYW1lJyBpbiBwcm9maWxlICYmIHByb2ZpbGUuY29tcGFueU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9maWxlLmNvbXBhbnlOYW1lO1xuICAgICAgICB9XG4gICAgICAgIGlmICgnbmFtZScgaW4gcHJvZmlsZSAmJiBwcm9maWxlLm5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9maWxlLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCdpZCcgaW4gcHJvZmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGUuaWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICdVbmtub3duIFByb2ZpbGUnO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlUmVmcmVzaFByb2ZpbGVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbG9hZFNvdXJjZVByb2ZpbGVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVmcmVzaCBwcm9maWxlczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNyZWF0ZVByb2ZpbGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChvbkNyZWF0ZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIG9uQ3JlYXRlUHJvZmlsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gT3BlbiB0aGUgY3JlYXRlIHByb2ZpbGUgbW9kYWxcbiAgICAgICAgICAgIGNvbnN0IHsgb3Blbk1vZGFsIH0gPSB1c2VNb2RhbFN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgICAgICBvcGVuTW9kYWwoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjcmVhdGVQcm9maWxlJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0NyZWF0ZSBOZXcgUHJvZmlsZScsXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBHZXQgc3RhdHVzIGZvciBpbmRpY2F0b3JcbiAgICBjb25zdCBnZXRDb25uZWN0aW9uU3RhdHVzID0gKCkgPT4ge1xuICAgICAgICBpZiAoaXNUZXN0aW5nKVxuICAgICAgICAgICAgcmV0dXJuICdpbmZvJzsgLy8gVXNlICdpbmZvJyBmb3IgbG9hZGluZyBzdGF0ZVxuICAgICAgICBzd2l0Y2ggKGNvbm5lY3Rpb25TdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnaW5mbyc7IC8vIFVzZSAnaW5mbycgZm9yIGNvbm5lY3Rpbmcgc3RhdGVcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2Vycm9yJztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd1bmtub3duJzsgLy8gVXNlICd1bmtub3duJyBmb3IgbmV1dHJhbC9kaXNjb25uZWN0ZWQgc3RhdGVcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0Q29ubmVjdGlvbkxhYmVsID0gKCkgPT4ge1xuICAgICAgICBpZiAoaXNUZXN0aW5nKVxuICAgICAgICAgICAgcmV0dXJuICdUZXN0aW5nLi4uJztcbiAgICAgICAgY29uc3QgeyBjb25zZWN1dGl2ZUhlYXJ0YmVhdEZhaWx1cmVzIH0gPSB1c2VQcm9maWxlU3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgc3dpdGNoIChjb25uZWN0aW9uU3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlICdjb25uZWN0ZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnT25saW5lJztcbiAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RpbmcnOlxuICAgICAgICAgICAgICAgIC8vICdjb25uZWN0aW5nJyBpcyB1c2VkIGZvciBkZWdyYWRlZCBzdGF0ZSAoMSBmYWlsdXJlKVxuICAgICAgICAgICAgICAgIGlmIChjb25zZWN1dGl2ZUhlYXJ0YmVhdEZhaWx1cmVzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ0RlZ3JhZGVkJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICdDb25uZWN0aW5nLi4uJztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ09mZmxpbmUnO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ05vdCBDb25uZWN0ZWQnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGZsZXgtY29sIGdhcC0zJywgY2xhc3NOYW1lKSwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtsYWJlbCAmJiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTQwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZVwiLCBjaGlsZHJlbjogbGFiZWwgfSksIHNlbGVjdGVkUHJvZmlsZSAmJiAoX2pzeChTdGF0dXNJbmRpY2F0b3IsIHsgc3RhdHVzOiBnZXRDb25uZWN0aW9uU3RhdHVzKCksIHRleHQ6IGdldENvbm5lY3Rpb25MYWJlbCgpLCBzaXplOiBcInNtXCIsIGFuaW1hdGU6IGlzVGVzdGluZyB8fCBjb25uZWN0aW9uU3RhdHVzID09PSAnY29ubmVjdGluZycgfSkpXSB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IHNlbGVjdGVkUHJvZmlsZT8uaWQgfHwgJycsIG9uQ2hhbmdlOiBoYW5kbGVQcm9maWxlQ2hhbmdlLCBvcHRpb25zOiBwcm9maWxlcy5tYXAocHJvZmlsZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCBwcm9maWxlIGRpc3BsYXkgbmFtZVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGdldFByb2ZpbGVEaXNwbGF5TmFtZShwcm9maWxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQm90aCB0eXBlcyBoYXZlIGVudmlyb25tZW50IHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVudkxhYmVsID0gcHJvZmlsZS5lbnZpcm9ubWVudCA/IGAgKCR7cHJvZmlsZS5lbnZpcm9ubWVudH0pYCA6ICcnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2ZpbGUuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogYCR7cHJvZmlsZU5hbWV9JHtlbnZMYWJlbH1gLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pLCBwbGFjZWhvbGRlcjogcHJvZmlsZXMubGVuZ3RoID4gMCA/IFwiU2VsZWN0IGEgcHJvZmlsZS4uLlwiIDogXCJObyBwcm9maWxlcyBmb3VuZCAtIGNsaWNrIFJlZnJlc2hcIiwgZGlzYWJsZWQ6IGlzTG9hZGluZywgZXJyb3I6IHR5cGUgPT09ICdzb3VyY2UnICYmIGVycm9yID8gZXJyb3IgOiB1bmRlZmluZWQsIFwiZGF0YS1jeVwiOiBgcHJvZmlsZS1zZWxlY3QtJHt0eXBlfWAgfSksIHNob3dBY3Rpb25zICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlQ3JlYXRlUHJvZmlsZSwgaWNvbjogX2pzeChQbHVzLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00XCIgfSksIGRpc2FibGVkOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcImNyZWF0ZS1wcm9maWxlLWJ0blwiLCBjaGlsZHJlbjogXCJDcmVhdGVcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBoYW5kbGVSZWZyZXNoUHJvZmlsZXMsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogY2xzeCgnaC00IHctNCcsIHsgJ2FuaW1hdGUtc3Bpbic6IGlzTG9hZGluZyB9KSB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1wcm9maWxlcy1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBzZWxlY3RlZFByb2ZpbGUgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlVGVzdENvbm5lY3Rpb24sIGljb246IF9qc3goVGVzdFR1YmUsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZyB8fCBpc1Rlc3RpbmcsIGxvYWRpbmc6IGlzVGVzdGluZywgXCJkYXRhLWN5XCI6IFwidGVzdC1jb25uZWN0aW9uLWJ0blwiLCBjaGlsZHJlbjogXCJUZXN0XCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlRGVsZXRlUHJvZmlsZSwgaWNvbjogX2pzeChUcmFzaDIsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwiZGVsZXRlLXByb2ZpbGUtYnRuXCIsIGNoaWxkcmVuOiBcIkRlbGV0ZVwiIH0pXSB9KSldIH0pKSwgc2VsZWN0ZWRQcm9maWxlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTMgcHktMiBiZy1ncmF5LTgwMCByb3VuZGVkLW1kIGJvcmRlciBib3JkZXItZ3JheS03MDAgdGV4dC1zbVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBnYXAtMVwiLCBjaGlsZHJlbjogWydjb21wYW55TmFtZScgaW4gc2VsZWN0ZWRQcm9maWxlICYmIHNlbGVjdGVkUHJvZmlsZS5jb21wYW55TmFtZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkNvbXBhbnk6XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IHNlbGVjdGVkUHJvZmlsZS5jb21wYW55TmFtZSB9KV0gfSkpLCBzZWxlY3RlZFByb2ZpbGUuZW52aXJvbm1lbnQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJFbnZpcm9ubWVudDpcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTMwMFwiLCBjaGlsZHJlbjogc2VsZWN0ZWRQcm9maWxlLmVudmlyb25tZW50IH0pXSB9KSksICdkb21haW5Db250cm9sbGVyJyBpbiBzZWxlY3RlZFByb2ZpbGUgJiYgc2VsZWN0ZWRQcm9maWxlLmRvbWFpbkNvbnRyb2xsZXIgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJEb21haW46XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IHNlbGVjdGVkUHJvZmlsZS5kb21haW5Db250cm9sbGVyIH0pXSB9KSksIHNlbGVjdGVkUHJvZmlsZS50ZW5hbnRJZCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiY29sLXNwYW4tMlwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtbWVkaXVtIHRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiVGVuYW50OlwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTEgdGV4dC1ncmF5LTMwMCBmb250LW1vbm8gdGV4dC14cyBicmVhay1hbGxcIiwgY2hpbGRyZW46IHNlbGVjdGVkUHJvZmlsZS50ZW5hbnRJZCB9KV0gfSkpXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBQcm9maWxlU2VsZWN0b3I7XG4iLCIvKipcbiAqIHVzZVN5c3RlbUhlYWx0aExvZ2ljIEhvb2tcbiAqXG4gKiBNYW5hZ2VzIHN5c3RlbSBoZWFsdGggbW9uaXRvcmluZyB3aXRoIGF1dG9tYXRpYyBwb2xsaW5nLlxuICogQ2hlY2tzIExvZ2ljIEVuZ2luZSwgUG93ZXJTaGVsbCwgYW5kIGRhdGEgY29ubmVjdGlvbiBzdGF0dXMgZXZlcnkgMzAgc2Vjb25kcy5cbiAqXG4gKiBFcGljIDA6IFVJL1VYIEVuaGFuY2VtZW50IC0gTmF2aWdhdGlvbiAmIFVYIChUQVNLIDYpXG4gKlxuICogQHJldHVybnMgU3lzdGVtIGhlYWx0aCBzdGF0ZSBhbmQgbWFudWFsIGNoZWNrIGZ1bmN0aW9uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzeFxuICogY29uc3QgeyBzeXN0ZW1TdGF0dXMsIGNoZWNrSGVhbHRoLCBpc0NoZWNraW5nIH0gPSB1c2VTeXN0ZW1IZWFsdGhMb2dpYygpO1xuICpcbiAqIHJldHVybiAoXG4gKiAgIDxTeXN0ZW1TdGF0dXMgaW5kaWNhdG9ycz17c3lzdGVtU3RhdHVzfSAvPlxuICogKTtcbiAqIGBgYFxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGdldEVsZWN0cm9uQVBJIH0gZnJvbSAnLi4vbGliL2VsZWN0cm9uLWFwaS1mYWxsYmFjayc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuLyoqXG4gKiBIZWFsdGggY2hlY2sgaW50ZXJ2YWwgKDMwIHNlY29uZHMpXG4gKi9cbmNvbnN0IEhFQUxUSF9DSEVDS19JTlRFUlZBTCA9IDMwMDAwO1xuLyoqXG4gKiBEZWZhdWx0IHN5c3RlbSBzdGF0dXMgKGFsbCBzZXJ2aWNlcyBvZmZsaW5lKVxuICovXG5jb25zdCBERUZBVUxUX1NUQVRVUyA9IHtcbiAgICBsb2dpY0VuZ2luZTogJ29mZmxpbmUnLFxuICAgIHBvd2VyU2hlbGw6ICdvZmZsaW5lJyxcbiAgICBkYXRhQ29ubmVjdGlvbjogJ29mZmxpbmUnLFxuICAgIGxhc3RTeW5jOiB1bmRlZmluZWQsXG59O1xuLyoqXG4gKiB1c2VTeXN0ZW1IZWFsdGhMb2dpYyBIb29rXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VTeXN0ZW1IZWFsdGhMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbc3lzdGVtU3RhdHVzLCBzZXRTeXN0ZW1TdGF0dXNdID0gdXNlU3RhdGUoREVGQVVMVF9TVEFUVVMpO1xuICAgIGNvbnN0IFtpc0NoZWNraW5nLCBzZXRJc0NoZWNraW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIEdldCBwcm9maWxlIGNvbm5lY3Rpb24gc3RhdHVzIGZyb20gc3RvcmVcbiAgICBjb25zdCBwcm9maWxlQ29ubmVjdGlvblN0YXR1cyA9IHVzZVByb2ZpbGVTdG9yZSgoc3RhdGUpID0+IHN0YXRlLmNvbm5lY3Rpb25TdGF0dXMpO1xuICAgIC8qKlxuICAgICAqIENoZWNrIHN5c3RlbSBoZWFsdGggc3RhdHVzXG4gICAgICovXG4gICAgY29uc3QgY2hlY2tIZWFsdGggPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzQ2hlY2tpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR2V0IGVsZWN0cm9uQVBJIHdpdGggZmFsbGJhY2tcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIC8vIENhbGwgZGFzaGJvYXJkIHNlcnZpY2UgdG8gZ2V0IHN5c3RlbSBoZWFsdGhcbiAgICAgICAgICAgIGNvbnN0IGhlYWx0aFJlc3VsdCA9IGF3YWl0IGVsZWN0cm9uQVBJLmRhc2hib2FyZC5nZXRTeXN0ZW1IZWFsdGgoKTtcbiAgICAgICAgICAgIGlmIChoZWFsdGhSZXN1bHQuc3VjY2VzcyAmJiBoZWFsdGhSZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlYWx0aCA9IGhlYWx0aFJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3Qgc3RhdHVzIGZyb20gaGVhbHRoIG9iamVjdHMgKHRoZXkgbWF5IGJlIG9iamVjdHMgd2l0aCB7c3RhdHVzLCBsYXN0Q2hlY2ssIHJlc3BvbnNlVGltZU1zfSlcbiAgICAgICAgICAgICAgICBjb25zdCBleHRyYWN0U3RhdHVzID0gKHN0YXR1c09iaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHN0YXR1c09iaiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdHVzT2JqO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzT2JqICYmIHR5cGVvZiBzdGF0dXNPYmogPT09ICdvYmplY3QnICYmIHN0YXR1c09iai5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNPYmouc3RhdHVzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnb2ZmbGluZSc7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBNYXAgaGVhbHRoIGRhdGEgdG8gc3RhdHVzIGluZGljYXRvcnNcbiAgICAgICAgICAgICAgICBzZXRTeXN0ZW1TdGF0dXMoe1xuICAgICAgICAgICAgICAgICAgICBsb2dpY0VuZ2luZTogZXh0cmFjdFN0YXR1cyhoZWFsdGgubG9naWNFbmdpbmVTdGF0dXMpLFxuICAgICAgICAgICAgICAgICAgICBwb3dlclNoZWxsOiBleHRyYWN0U3RhdHVzKGhlYWx0aC5wb3dlclNoZWxsU3RhdHVzKSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YUNvbm5lY3Rpb246IGRldGVybWluZURhdGFDb25uZWN0aW9uU3RhdHVzKCksXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTeW5jOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBIZWFsdGggY2hlY2sgZmFpbGVkLCBzZXQgZGVncmFkZWQgc3RhdHVzXG4gICAgICAgICAgICAgICAgLy8gQnV0IHByZXNlcnZlIGRhdGFDb25uZWN0aW9uIHN0YXR1cyBmcm9tIHByb2ZpbGUgY29ubmVjdGlvbiB0ZXN0XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdIZWFsdGggY2hlY2sgcmV0dXJuZWQgbm8gZGF0YTonLCBoZWFsdGhSZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIHNldFN5c3RlbVN0YXR1cygocHJldikgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgbG9naWNFbmdpbmU6ICdkZWdyYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgIHBvd2VyU2hlbGw6ICdkZWdyYWRlZCcsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFDb25uZWN0aW9uOiBkZXRlcm1pbmVEYXRhQ29ubmVjdGlvblN0YXR1cygpLFxuICAgICAgICAgICAgICAgICAgICBsYXN0U3luYzogcHJldi5sYXN0U3luYywgLy8gS2VlcCBwcmV2aW91cyBzeW5jIHRpbWVcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoaGVhbHRoUmVzdWx0LmVycm9yIHx8ICdIZWFsdGggY2hlY2sgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gRXhjZXB0aW9uIGR1cmluZyBoZWFsdGggY2hlY2tcbiAgICAgICAgICAgIC8vIEJ1dCBwcmVzZXJ2ZSBkYXRhQ29ubmVjdGlvbiBzdGF0dXMgZnJvbSBwcm9maWxlIGNvbm5lY3Rpb24gdGVzdFxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignSGVhbHRoIGNoZWNrIGV4Y2VwdGlvbjonLCBlcnIpO1xuICAgICAgICAgICAgc2V0U3lzdGVtU3RhdHVzKChwcmV2KSA9PiAoe1xuICAgICAgICAgICAgICAgIGxvZ2ljRW5naW5lOiAnZGVncmFkZWQnLFxuICAgICAgICAgICAgICAgIHBvd2VyU2hlbGw6ICdkZWdyYWRlZCcsXG4gICAgICAgICAgICAgICAgZGF0YUNvbm5lY3Rpb246IGRldGVybWluZURhdGFDb25uZWN0aW9uU3RhdHVzKCksXG4gICAgICAgICAgICAgICAgbGFzdFN5bmM6IHByZXYubGFzdFN5bmMsIC8vIEtlZXAgcHJldmlvdXMgc3luYyB0aW1lXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzQ2hlY2tpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW10pOyAvLyBObyBkZXBlbmRlbmNpZXMgLSB1c2UgZnVuY3Rpb25hbCB1cGRhdGVzIGZvciBzdGF0ZVxuICAgIC8qKlxuICAgICAqIERldGVybWluZSBkYXRhIGNvbm5lY3Rpb24gc3RhdHVzIGJhc2VkIG9uIGNyZWRlbnRpYWwgdGVzdCByZXN1bHRzXG4gICAgICogT25seSBzaG93cyAnb25saW5lJyBhZnRlciBhIHN1Y2Nlc3NmdWwgdGVzdCBjb25uZWN0aW9uIHRvIEF6dXJlL29uLXByZW1pc2VzXG4gICAgICovXG4gICAgY29uc3QgZGV0ZXJtaW5lRGF0YUNvbm5lY3Rpb25TdGF0dXMgPSAoKSA9PiB7XG4gICAgICAgIC8vIE1hcCBwcm9maWxlIGNvbm5lY3Rpb24gc3RhdHVzIHRvIHN5c3RlbSBzdGF0dXMgaW5kaWNhdG9yXG4gICAgICAgIHN3aXRjaCAocHJvZmlsZUNvbm5lY3Rpb25TdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdvbmxpbmUnO1xuICAgICAgICAgICAgY2FzZSAnY29ubmVjdGluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkZWdyYWRlZCc7XG4gICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdkZWdyYWRlZCc7XG4gICAgICAgICAgICBjYXNlICdkaXNjb25uZWN0ZWQnOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ29mZmxpbmUnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGhlYWx0aCBjaGVjayBvbiBtb3VudCBhbmQgc2V0IHVwIHBvbGxpbmcgaW50ZXJ2YWxcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICAvLyBJbml0aWFsIGhlYWx0aCBjaGVja1xuICAgICAgICBjaGVja0hlYWx0aCgpO1xuICAgICAgICAvLyBTZXQgdXAgcG9sbGluZyBpbnRlcnZhbFxuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKGNoZWNrSGVhbHRoLCBIRUFMVEhfQ0hFQ0tfSU5URVJWQUwpO1xuICAgICAgICAvLyBDbGVhbnVwIG9uIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0sIFtdKTsgLy8gRW1wdHkgZGVwcyAtIGNoZWNrSGVhbHRoIGlzIHN0YWJsZSBub3dcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZGF0YSBjb25uZWN0aW9uIHN0YXR1cyB3aGVuIHByb2ZpbGUgY29ubmVjdGlvbiBzdGF0dXMgY2hhbmdlc1xuICAgICAqIFRoaXMgZW5zdXJlcyB0aGUgXCJEYXRhIENvbm5lY3Rpb25cIiBpbmRpY2F0b3IgcmVmbGVjdHMgY3JlZGVudGlhbCB0ZXN0IHJlc3VsdHNcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRTeXN0ZW1TdGF0dXMoKHByZXYpID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgZGF0YUNvbm5lY3Rpb246IGRldGVybWluZURhdGFDb25uZWN0aW9uU3RhdHVzKCksXG4gICAgICAgIH0pKTtcbiAgICB9LCBbcHJvZmlsZUNvbm5lY3Rpb25TdGF0dXNdKTsgLy8gT25seSBkZXBlbmQgb24gcHJvZmlsZUNvbm5lY3Rpb25TdGF0dXMsIG5vdCB0aGUgZnVuY3Rpb24gaXRzZWxmXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3lzdGVtU3RhdHVzLFxuICAgICAgICBpc0NoZWNraW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgY2hlY2tIZWFsdGgsXG4gICAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCB1c2VTeXN0ZW1IZWFsdGhMb2dpYztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNpZGViYXIgQ29tcG9uZW50XG4gKlxuICogQXBwbGljYXRpb24gc2lkZWJhciB3aXRoIG5hdmlnYXRpb24sIHByb2ZpbGUgbWFuYWdlbWVudCwgYW5kIHN5c3RlbSBzdGF0dXMuXG4gKiBFbmhhbmNlZCB3aXRoIFN5c3RlbVN0YXR1cyBjb21wb25lbnQgZm9yIHJlYWwtdGltZSBoZWFsdGggbW9uaXRvcmluZy5cbiAqXG4gKiBFcGljIDA6IFVJL1VYIEVuaGFuY2VtZW50IC0gTmF2aWdhdGlvbiAmIFVYIChUQVNLIDYpXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBOYXZMaW5rLCB1c2VMb2NhdGlvbiB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTGF5b3V0RGFzaGJvYXJkLCBVc2VycywgVXNlckNoZWNrLCBTZXJ2ZXIsIEFycm93UmlnaHRMZWZ0LCBGaWxlVGV4dCwgU2V0dGluZ3MsIFNlYXJjaCwgQ2hldnJvblJpZ2h0LCBDbG91ZCwgV29ya2Zsb3csIEZpbGVTZWFyY2gsIFdyZW5jaCwgQnVpbGRpbmcyLCBEb3dubG9hZCwgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmltcG9ydCB7IFN5c3RlbVN0YXR1cyB9IGZyb20gJy4uL21vbGVjdWxlcy9TeXN0ZW1TdGF0dXMnO1xuaW1wb3J0IHsgUHJvZmlsZVNlbGVjdG9yIH0gZnJvbSAnLi4vbW9sZWN1bGVzL1Byb2ZpbGVTZWxlY3Rvcic7XG5pbXBvcnQgeyB1c2VTeXN0ZW1IZWFsdGhMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVN5c3RlbUhlYWx0aExvZ2ljJztcbmltcG9ydCB7IGRpc2NvdmVyZWROYXZJdGVtcyB9IGZyb20gJy4uLy4uL3ZpZXdzL2Rpc2NvdmVyZWQvX3NpZGViYXIuZ2VuZXJhdGVkJztcbi8qKlxuICogU2lkZWJhciBuYXZpZ2F0aW9uIGNvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2lkZWJhciA9ICgpID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkU291cmNlUHJvZmlsZSwgc2VsZWN0ZWRUYXJnZXRQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICBjb25zdCB7IHN5c3RlbVN0YXR1cyB9ID0gdXNlU3lzdGVtSGVhbHRoTG9naWMoKTtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKCk7XG4gICAgLy8gU3RhdGUgZm9yIGNvbGxhcHNpYmxlIHNlY3Rpb25zXG4gICAgY29uc3QgW2V4cGFuZGVkU2VjdGlvbnMsIHNldEV4cGFuZGVkU2VjdGlvbnNdID0gdXNlU3RhdGUoe1xuICAgICAgICBzZXR1cDogZmFsc2UsXG4gICAgICAgIGRpc2NvdmVyeTogZmFsc2UsXG4gICAgICAgIG1pZ3JhdGlvbjogZmFsc2UsXG4gICAgfSk7XG4gICAgLy8gVG9nZ2xlIHNlY3Rpb24gZXhwYW5zaW9uXG4gICAgY29uc3QgdG9nZ2xlU2VjdGlvbiA9IHVzZUNhbGxiYWNrKChzZWN0aW9uKSA9PiB7XG4gICAgICAgIHNldEV4cGFuZGVkU2VjdGlvbnMocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIFtzZWN0aW9uXTogIXByZXZbc2VjdGlvbl1cbiAgICAgICAgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBDaGVjayBpZiBhIHNlY3Rpb24gc2hvdWxkIGJlIGV4cGFuZGVkIGJhc2VkIG9uIGN1cnJlbnQgcGF0aFxuICAgIGNvbnN0IGlzU2VjdGlvbkFjdGl2ZSA9IHVzZUNhbGxiYWNrKChwYXRocykgPT4ge1xuICAgICAgICByZXR1cm4gcGF0aHMuc29tZShwYXRoID0+IGxvY2F0aW9uLnBhdGhuYW1lLnN0YXJ0c1dpdGgocGF0aCkpO1xuICAgIH0sIFtsb2NhdGlvbi5wYXRobmFtZV0pO1xuICAgIC8vIERpc2NvdmVyZWQgRGF0YSAtIFNob3dzIHJlc3VsdHMgZnJvbSBkaXNjb3Zlcnkgb3BlcmF0aW9uc1xuICAgIC8vIFRoZXNlIGFyZSBEQVRBIERJU1BMQVkgdmlld3MsIG5vdCBkaXNjb3ZlcnkgZXhlY3V0aW9uIGludGVyZmFjZXNcbiAgICAvLyBOb3cgdXNpbmcgYXV0by1nZW5lcmF0ZWQgbmF2aWdhdGlvbiBpdGVtcyBmcm9tIF9zaWRlYmFyLmdlbmVyYXRlZC50c1xuICAgIGNvbnN0IGRpc2NvdmVyZWRJdGVtcyA9IHVzZU1lbW8oKCkgPT4gZGlzY292ZXJlZE5hdkl0ZW1zLCBbXSk7XG4gICAgLy8gU2V0dXAgbWVudSBpdGVtcyAoYWRtaW4tb25seSlcbiAgICBjb25zdCBzZXR1cEl0ZW1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiAnL3NldHVwL2NvbXBhbnknLFxuICAgICAgICAgICAgbGFiZWw6ICdDb21wYW55JyxcbiAgICAgICAgICAgIGljb246IF9qc3goQnVpbGRpbmcyLCB7IHNpemU6IDE2IH0pLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiAnL3NldHVwL2F6dXJlLXByZXJlcXVpc2l0ZXMnLFxuICAgICAgICAgICAgbGFiZWw6ICdBenVyZSBQcmVyZXF1aXNpdGVzJyxcbiAgICAgICAgICAgIGljb246IF9qc3goQ2xvdWQsIHsgc2l6ZTogMTYgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICcvc2V0dXAvaW5zdGFsbGVycycsXG4gICAgICAgICAgICBsYWJlbDogJ0luc3RhbGxlcnMnLFxuICAgICAgICAgICAgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIC8vIE5hdmlnYXRpb24gaXRlbXNcbiAgICBjb25zdCBuYXZJdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICAgICAgbGFiZWw6ICdPdmVydmlldycsXG4gICAgICAgICAgICBpY29uOiBfanN4KExheW91dERhc2hib2FyZCwgeyBzaXplOiAyMCB9KSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJy9zZXR1cCcsXG4gICAgICAgICAgICBsYWJlbDogJ1NldHVwJyxcbiAgICAgICAgICAgIGljb246IF9qc3goV3JlbmNoLCB7IHNpemU6IDIwIH0pLFxuICAgICAgICAgICAgY2hpbGRyZW46IHNldHVwSXRlbXMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICcvZGlzY292ZXJ5JyxcbiAgICAgICAgICAgIGxhYmVsOiAnRGlzY292ZXJ5JyxcbiAgICAgICAgICAgIGljb246IF9qc3goU2VhcmNoLCB7IHNpemU6IDIwIH0pLFxuICAgICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICcvZGlzY292ZXJlZCcsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRGlzY292ZXJlZCcsXG4gICAgICAgICAgICAgICAgICAgIGljb246IF9qc3goRmlsZVNlYXJjaCwgeyBzaXplOiAxOCB9KSxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IGRpc2NvdmVyZWRJdGVtcyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJy91c2VycycsXG4gICAgICAgICAgICBsYWJlbDogJ1VzZXJzJyxcbiAgICAgICAgICAgIGljb246IF9qc3goVXNlcnMsIHsgc2l6ZTogMjAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICcvZ3JvdXBzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnR3JvdXBzJyxcbiAgICAgICAgICAgIGljb246IF9qc3goVXNlckNoZWNrLCB7IHNpemU6IDIwIH0pLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBwYXRoOiAnL2luZnJhc3RydWN0dXJlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnSW5mcmFzdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgaWNvbjogX2pzeChTZXJ2ZXIsIHsgc2l6ZTogMjAgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICcvb3JnYW5pc2F0aW9uLW1hcCcsXG4gICAgICAgICAgICBsYWJlbDogJ09yZ2FuaXNhdGlvbiBNYXAnLFxuICAgICAgICAgICAgaWNvbjogX2pzeChXb3JrZmxvdywgeyBzaXplOiAyMCB9KSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJy9taWdyYXRpb24nLFxuICAgICAgICAgICAgbGFiZWw6ICdNaWdyYXRpb24nLFxuICAgICAgICAgICAgaWNvbjogX2pzeChBcnJvd1JpZ2h0TGVmdCwgeyBzaXplOiAyMCB9KSxcbiAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgeyBwYXRoOiAnL21pZ3JhdGlvbi9wbGFubmluZycsIGxhYmVsOiAnUGxhbm5pbmcnLCBpY29uOiBfanN4KENoZXZyb25SaWdodCwgeyBzaXplOiAxNiB9KSB9LFxuICAgICAgICAgICAgICAgIHsgcGF0aDogJy9taWdyYXRpb24vbWFwcGluZycsIGxhYmVsOiAnTWFwcGluZycsIGljb246IF9qc3goQ2hldnJvblJpZ2h0LCB7IHNpemU6IDE2IH0pIH0sXG4gICAgICAgICAgICAgICAgeyBwYXRoOiAnL21pZ3JhdGlvbi92YWxpZGF0aW9uJywgbGFiZWw6ICdWYWxpZGF0aW9uJywgaWNvbjogX2pzeChDaGV2cm9uUmlnaHQsIHsgc2l6ZTogMTYgfSkgfSxcbiAgICAgICAgICAgICAgICB7IHBhdGg6ICcvbWlncmF0aW9uL2V4ZWN1dGlvbicsIGxhYmVsOiAnRXhlY3V0aW9uJywgaWNvbjogX2pzeChDaGV2cm9uUmlnaHQsIHsgc2l6ZTogMTYgfSkgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBhdGg6ICcvcmVwb3J0cycsXG4gICAgICAgICAgICBsYWJlbDogJ1JlcG9ydHMnLFxuICAgICAgICAgICAgaWNvbjogX2pzeChGaWxlVGV4dCwgeyBzaXplOiAyMCB9KSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICBsYWJlbDogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgIGljb246IF9qc3goU2V0dGluZ3MsIHsgc2l6ZTogMjAgfSksXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICByZXR1cm4gKF9qc3hzKFwiYXNpZGVcIiwgeyBjbGFzc05hbWU6IFwidy02NCBiZy1ncmF5LTkwMCB0ZXh0LXdoaXRlIGZsZXggZmxleC1jb2wgcmVsYXRpdmUgei01MFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJvcmRlci1iIGJvcmRlci1ncmF5LTgwMFwiLCBjaGlsZHJlbjogX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1ib2xkXCIsIGNoaWxkcmVuOiBcIk0mQSBEaXNjb3ZlcnkgU3VpdGVcIiB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJvcmRlci1iIGJvcmRlci1ncmF5LTgwMFwiLCBjaGlsZHJlbjogW19qc3goUHJvZmlsZVNlbGVjdG9yLCB7IHR5cGU6IFwic291cmNlXCIsIGxhYmVsOiBcIlNvdXJjZSBQcm9maWxlXCIsIHNob3dBY3Rpb25zOiB0cnVlLCBjbGFzc05hbWU6IFwibWItM1wiLCBcImRhdGEtY3lcIjogXCJzaWRlYmFyLXNvdXJjZS1wcm9maWxlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1weCBiZy1ncmF5LTgwMCBteS0zXCIgfSksIF9qc3goUHJvZmlsZVNlbGVjdG9yLCB7IHR5cGU6IFwidGFyZ2V0XCIsIGxhYmVsOiBcIlRhcmdldCBQcm9maWxlXCIsIHNob3dBY3Rpb25zOiB0cnVlLCBcImRhdGEtY3lcIjogXCJzaWRlYmFyLXRhcmdldC1wcm9maWxlXCIgfSldIH0pLCBfanN4KFwibmF2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy15LWF1dG8gcHktNFwiLCBjaGlsZHJlbjogbmF2SXRlbXMubWFwKChpdGVtKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3hzKE5hdkxpbmssIHsgdG86IGl0ZW0ucGF0aCwgY2xhc3NOYW1lOiAoeyBpc0FjdGl2ZSB9KSA9PiBjbHN4KCdmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC00IHB5LTIgdGV4dC1zbSB0cmFuc2l0aW9uLWNvbG9ycycsICdob3ZlcjpiZy1ncmF5LTgwMCBob3Zlcjp0ZXh0LXdoaXRlJywgaXNBY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JheS04MDAgdGV4dC13aGl0ZSBib3JkZXItbC00IGJvcmRlci1ibHVlLTUwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTMwMCcpLCBjaGlsZHJlbjogW2l0ZW0uaWNvbiwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogaXRlbS5sYWJlbCB9KV0gfSksIGl0ZW0uY2hpbGRyZW4gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtNFwiLCBjaGlsZHJlbjogaXRlbS5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3hzKE5hdkxpbmssIHsgdG86IGNoaWxkLnBhdGgsIGNsYXNzTmFtZTogKHsgaXNBY3RpdmUgfSkgPT4gY2xzeCgnZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0xLjUgdGV4dC1zbSB0cmFuc2l0aW9uLWNvbG9ycycsICdob3ZlcjpiZy1ncmF5LTgwMCBob3Zlcjp0ZXh0LXdoaXRlJywgaXNBY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JheS04MDAgdGV4dC13aGl0ZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTQwMCcpLCBjaGlsZHJlbjogW2NoaWxkLmljb24sIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGNoaWxkLmxhYmVsIH0pXSB9KSwgY2hpbGQuY2hpbGRyZW4gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtNFwiLCBjaGlsZHJlbjogY2hpbGQuY2hpbGRyZW4ubWFwKChncmFuZGNoaWxkKSA9PiAoX2pzeHMoTmF2TGluaywgeyB0bzogZ3JhbmRjaGlsZC5wYXRoLCBjbGFzc05hbWU6ICh7IGlzQWN0aXZlIH0pID0+IGNsc3goJ2ZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTQgcHktMS41IHRleHQteHMgdHJhbnNpdGlvbi1jb2xvcnMnLCAnaG92ZXI6YmctZ3JheS04MDAgaG92ZXI6dGV4dC13aGl0ZScsIGlzQWN0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ncmF5LTgwMCB0ZXh0LXdoaXRlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTUwMCcpLCBjaGlsZHJlbjogW2dyYW5kY2hpbGQuaWNvbiwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogZ3JhbmRjaGlsZC5sYWJlbCB9KV0gfSwgZ3JhbmRjaGlsZC5wYXRoKSkpIH0pKV0gfSwgY2hpbGQucGF0aCkpKSB9KSldIH0sIGl0ZW0ucGF0aCkpKSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTQgYm9yZGVyLXQgYm9yZGVyLWdyYXktODAwXCIsIGNoaWxkcmVuOiBfanN4KFN5c3RlbVN0YXR1cywgeyBpbmRpY2F0b3JzOiBzeXN0ZW1TdGF0dXMsIHNob3dMYXN0U3luYzogdHJ1ZSB9KSB9KV0gfSkpO1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFRhYlZpZXcgQ29tcG9uZW50XG4gKlxuICogVGFiIG1hbmFnZW1lbnQgY29tcG9uZW50XG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IHVzZVRhYlN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlVGFiU3RvcmUnO1xuLyoqXG4gKiBUYWIgdmlldyBjb21wb25lbnQgZm9yIG1hbmFnaW5nIG9wZW4gdGFic1xuICovXG5leHBvcnQgY29uc3QgVGFiVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHRhYnMsIHNlbGVjdGVkVGFiSWQsIHNldFNlbGVjdGVkVGFiLCBjbG9zZVRhYiB9ID0gdXNlVGFiU3RvcmUoKTtcbiAgICBpZiAodGFicy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IG92ZXJmbG93LXgtYXV0b1wiLCBjaGlsZHJlbjogdGFicy5tYXAoKHRhYikgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC00IHB5LTIgYm9yZGVyLXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIGN1cnNvci1wb2ludGVyJywgJ2hvdmVyOmJnLWdyYXktNTAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCcsIHNlbGVjdGVkVGFiSWQgPT09IHRhYi5pZCAmJiAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCcpLCBvbkNsaWNrOiAoKSA9PiBzZXRTZWxlY3RlZFRhYih0YWIuaWQpLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IHRhYi50aXRsZSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZVRhYih0YWIuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2xhc3NOYW1lOiBcInAtMC41IGhvdmVyOmJnLWdyYXktMjAwIGRhcms6aG92ZXI6YmctZ3JheS02MDAgcm91bmRlZFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IHNpemU6IDE0IH0pIH0pXSB9LCB0YWIuaWQpKSkgfSkgfSkpO1xufTtcbiIsIi8qKlxuICogQ29tbWFuZCBSZWdpc3RyeVxuICpcbiAqIENlbnRyYWwgcmVnaXN0cnkgb2YgYWxsIGNvbW1hbmRzIGF2YWlsYWJsZSBpbiB0aGUgY29tbWFuZCBwYWxldHRlLlxuICogQ29tbWFuZHMgYXJlIG9yZ2FuaXplZCBieSBjYXRlZ29yeSBhbmQgaW5jbHVkZSBrZXlib2FyZCBzaG9ydGN1dHMuXG4gKi9cbmltcG9ydCB7IEhvbWUsIFNlYXJjaCwgVXNlcnMsIFNlcnZlciwgQm94LCBGaWxlVGV4dCwgU2V0dGluZ3MsIFBsdXMsIERvd25sb2FkLCBVcGxvYWQsIFJlZnJlc2hDdywgQ2FsZW5kYXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBDcmVhdGUgY29tbWFuZCByZWdpc3RyeSB3aXRoIG5hdmlnYXRpb24gYW5kIGFjdGlvbiBjYWxsYmFja3NcbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUNvbW1hbmRSZWdpc3RyeSA9IChuYXZpZ2F0ZSwgb3Blbk1vZGFsLCB0cmlnZ2VyQWN0aW9uKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gTmF2aWdhdGlvbiBDb21tYW5kc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ25hdi1vdmVydmlldycsXG4gICAgICAgICAgICBsYWJlbDogJ0dvIHRvIE92ZXJ2aWV3JyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmF2aWdhdGUgdG8gdGhlIG92ZXJ2aWV3IGRhc2hib2FyZCcsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ05hdmlnYXRpb24nLFxuICAgICAgICAgICAgaWNvbjogSG9tZSxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ3RybCtTaGlmdCtIJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy8nKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ2hvbWUnLCAnZGFzaGJvYXJkJywgJ292ZXJ2aWV3J10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbmF2LWRpc2NvdmVyeScsXG4gICAgICAgICAgICBsYWJlbDogJ0dvIHRvIERpc2NvdmVyeScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05hdmlnYXRlIHRvIGRpc2NvdmVyeSBodWInLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdOYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgIGljb246IFNlYXJjaCxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ3RybCtTaGlmdCtEJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy9kaXNjb3ZlcnknKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ2ZpbmQnLCAnc2NhbicsICdkaXNjb3ZlciddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ25hdi11c2VycycsXG4gICAgICAgICAgICBsYWJlbDogJ0dvIHRvIFVzZXJzJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmF2aWdhdGUgdG8gdXNlcnMgdmlldycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ05hdmlnYXRpb24nLFxuICAgICAgICAgICAgaWNvbjogVXNlcnMsXG4gICAgICAgICAgICBzaG9ydGN1dDogJ0N0cmwrU2hpZnQrVScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvdXNlcnMnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ3Blb3BsZScsICdhY2NvdW50cyddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ25hdi1ncm91cHMnLFxuICAgICAgICAgICAgbGFiZWw6ICdHbyB0byBHcm91cHMnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOYXZpZ2F0ZSB0byBncm91cHMgdmlldycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ05hdmlnYXRpb24nLFxuICAgICAgICAgICAgaWNvbjogVXNlcnMsXG4gICAgICAgICAgICBzaG9ydGN1dDogJ0N0cmwrU2hpZnQrRycsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvZ3JvdXBzJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWyd0ZWFtcycsICdkaXN0cmlidXRpb24nXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICduYXYtY29tcHV0ZXJzJyxcbiAgICAgICAgICAgIGxhYmVsOiAnR28gdG8gQ29tcHV0ZXJzJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmF2aWdhdGUgdG8gY29tcHV0ZXJzIHZpZXcnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdOYXZpZ2F0aW9uJyxcbiAgICAgICAgICAgIGljb246IFNlcnZlcixcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy9jb21wdXRlcnMnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ2RldmljZXMnLCAnbWFjaGluZXMnLCAnd29ya3N0YXRpb25zJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbmF2LWluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnR28gdG8gSW5mcmFzdHJ1Y3R1cmUnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdOYXZpZ2F0ZSB0byBpbmZyYXN0cnVjdHVyZSB2aWV3JyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTmF2aWdhdGlvbicsXG4gICAgICAgICAgICBpY29uOiBCb3gsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvaW5mcmFzdHJ1Y3R1cmUnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ3NlcnZlcnMnLCAnbmV0d29yaycsICdzeXN0ZW1zJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbmF2LW1pZ3JhdGlvbicsXG4gICAgICAgICAgICBsYWJlbDogJ0dvIHRvIE1pZ3JhdGlvbiBQbGFubmluZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05hdmlnYXRlIHRvIG1pZ3JhdGlvbiBwbGFubmluZycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ05hdmlnYXRpb24nLFxuICAgICAgICAgICAgaWNvbjogQ2FsZW5kYXIsXG4gICAgICAgICAgICBzaG9ydGN1dDogJ0N0cmwrU2hpZnQrTScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvbWlncmF0aW9uL3BsYW5uaW5nJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWyd3YXZlcycsICdtb3ZlJywgJ3RyYW5zZmVyJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbmF2LXJlcG9ydHMnLFxuICAgICAgICAgICAgbGFiZWw6ICdHbyB0byBSZXBvcnRzJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmF2aWdhdGUgdG8gcmVwb3J0cyB2aWV3JyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTmF2aWdhdGlvbicsXG4gICAgICAgICAgICBpY29uOiBGaWxlVGV4dCxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ3RybCtTaGlmdCtSJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy9yZXBvcnRzJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydhbmFseXRpY3MnLCAnZGF0YScsICdleHBvcnQnXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICduYXYtc2V0dGluZ3MnLFxuICAgICAgICAgICAgbGFiZWw6ICdHbyB0byBTZXR0aW5ncycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05hdmlnYXRlIHRvIHNldHRpbmdzJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTmF2aWdhdGlvbicsXG4gICAgICAgICAgICBpY29uOiBTZXR0aW5ncyxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ3RybCssJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy9zZXR0aW5ncycpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsncHJlZmVyZW5jZXMnLCAnY29uZmlndXJhdGlvbicsICdvcHRpb25zJ10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIEFjdGlvbiBDb21tYW5kc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2FjdGlvbi1uZXctcHJvZmlsZScsXG4gICAgICAgICAgICBsYWJlbDogJ0NyZWF0ZSBOZXcgUHJvZmlsZScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBhIG5ldyBjb25uZWN0aW9uIHByb2ZpbGUnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdBY3Rpb25zJyxcbiAgICAgICAgICAgIGljb246IFBsdXMsXG4gICAgICAgICAgICBzaG9ydGN1dDogJ0N0cmwrTicsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG9wZW5Nb2RhbCgnY3JlYXRlUHJvZmlsZScpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsnYWRkJywgJ2Nvbm5lY3Rpb24nLCAndGVuYW50J10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnYWN0aW9uLWV4cG9ydCcsXG4gICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBEYXRhJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRXhwb3J0IGN1cnJlbnQgdmlldyBkYXRhJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnQWN0aW9ucycsXG4gICAgICAgICAgICBpY29uOiBEb3dubG9hZCxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnQ3RybCtFJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gdHJpZ2dlckFjdGlvbignZXhwb3J0JyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydzYXZlJywgJ2Rvd25sb2FkJywgJ2NzdiddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2FjdGlvbi1pbXBvcnQnLFxuICAgICAgICAgICAgbGFiZWw6ICdJbXBvcnQgRGF0YScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0ltcG9ydCBkYXRhIGZyb20gZmlsZScsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0FjdGlvbnMnLFxuICAgICAgICAgICAgaWNvbjogVXBsb2FkLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBvcGVuTW9kYWwoJ2ltcG9ydERhdGEnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ2xvYWQnLCAndXBsb2FkJywgJ2NzdiddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2FjdGlvbi1yZWZyZXNoJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUmVmcmVzaCBDdXJyZW50IFZpZXcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxvYWQgZGF0YSBpbiBjdXJyZW50IHZpZXcnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdBY3Rpb25zJyxcbiAgICAgICAgICAgIGljb246IFJlZnJlc2hDdyxcbiAgICAgICAgICAgIHNob3J0Y3V0OiAnRjUnLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiB0cmlnZ2VyQWN0aW9uKCdyZWZyZXNoJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydyZWxvYWQnLCAndXBkYXRlJywgJ3N5bmMnXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdhY3Rpb24tc2VhcmNoJyxcbiAgICAgICAgICAgIGxhYmVsOiAnRm9jdXMgU2VhcmNoJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRm9jdXMgdGhlIHNlYXJjaCBpbnB1dCcsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0FjdGlvbnMnLFxuICAgICAgICAgICAgaWNvbjogU2VhcmNoLFxuICAgICAgICAgICAgc2hvcnRjdXQ6ICdDdHJsK0YnLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiB0cmlnZ2VyQWN0aW9uKCdmb2N1cy1zZWFyY2gnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ2ZpbmQnLCAnZmlsdGVyJywgJ3F1ZXJ5J10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIERpc2NvdmVyeSBDb21tYW5kc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2Rpc2NvdmVyeS1kb21haW4nLFxuICAgICAgICAgICAgbGFiZWw6ICdSdW4gRG9tYWluIERpc2NvdmVyeScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IGRvbWFpbiBkaXNjb3ZlcnkgcHJvY2VzcycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0Rpc2NvdmVyeScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvZGlzY292ZXJ5L2RvbWFpbicpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2NhbicsICdhY3RpdmUgZGlyZWN0b3J5JywgJ2FkJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnZGlzY292ZXJ5LWF6dXJlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUnVuIEF6dXJlIERpc2NvdmVyeScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IEF6dXJlIEFEIGRpc2NvdmVyeScsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0Rpc2NvdmVyeScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvZGlzY292ZXJ5L2F6dXJlJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydzY2FuJywgJ2FhZCcsICdlbnRyYSddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2Rpc2NvdmVyeS1vZmZpY2UzNjUnLFxuICAgICAgICAgICAgbGFiZWw6ICdSdW4gT2ZmaWNlIDM2NSBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTdGFydCBPZmZpY2UgMzY1IGRpc2NvdmVyeScsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0Rpc2NvdmVyeScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvZGlzY292ZXJ5L29mZmljZTM2NScpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2NhbicsICdvMzY1JywgJ21pY3Jvc29mdCddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2Rpc2NvdmVyeS1leGNoYW5nZScsXG4gICAgICAgICAgICBsYWJlbDogJ1J1biBFeGNoYW5nZSBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTdGFydCBFeGNoYW5nZSBkaXNjb3ZlcnknLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdEaXNjb3ZlcnknLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBuYXZpZ2F0ZSgnL2Rpc2NvdmVyeS9leGNoYW5nZScpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2NhbicsICdlbWFpbCcsICdtYWlsYm94J10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnZGlzY292ZXJ5LXNoYXJlcG9pbnQnLFxuICAgICAgICAgICAgbGFiZWw6ICdSdW4gU2hhcmVQb2ludCBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTdGFydCBTaGFyZVBvaW50IGRpc2NvdmVyeScsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0Rpc2NvdmVyeScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG5hdmlnYXRlKCcvZGlzY292ZXJ5L3NoYXJlcG9pbnQnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ3NjYW4nLCAnc3BvJywgJ3NpdGVzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnZGlzY292ZXJ5LXRlYW1zJyxcbiAgICAgICAgICAgIGxhYmVsOiAnUnVuIFRlYW1zIERpc2NvdmVyeScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0IE1pY3Jvc29mdCBUZWFtcyBkaXNjb3ZlcnknLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdEaXNjb3ZlcnknLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBuYXZpZ2F0ZSgnL2Rpc2NvdmVyeS90ZWFtcycpLFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2NhbicsICdjaGF0JywgJ2NoYW5uZWxzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIE1pZ3JhdGlvbiBDb21tYW5kc1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ21pZ3JhdGlvbi1zY2hlZHVsZS13YXZlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnU2NoZWR1bGUgTWlncmF0aW9uIFdhdmUnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDcmVhdGUgYW5kIHNjaGVkdWxlIGEgbmV3IG1pZ3JhdGlvbiB3YXZlJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTWlncmF0aW9uJyxcbiAgICAgICAgICAgIGljb246IENhbGVuZGFyLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBvcGVuTW9kYWwoJ3dhdmVTY2hlZHVsaW5nJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydwbGFuJywgJ2JhdGNoJywgJ2N1dG92ZXInXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdtaWdyYXRpb24tdmFsaWRhdGlvbicsXG4gICAgICAgICAgICBsYWJlbDogJ1J1biBNaWdyYXRpb24gVmFsaWRhdGlvbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ZhbGlkYXRlIG1pZ3JhdGlvbiByZWFkaW5lc3MnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdNaWdyYXRpb24nLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBuYXZpZ2F0ZSgnL21pZ3JhdGlvbi92YWxpZGF0aW9uJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydjaGVjaycsICd2ZXJpZnknLCAndGVzdCddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ21pZ3JhdGlvbi1leGVjdXRpb24nLFxuICAgICAgICAgICAgbGFiZWw6ICdWaWV3IE1pZ3JhdGlvbiBFeGVjdXRpb24nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdNb25pdG9yIGFjdGl2ZSBtaWdyYXRpb25zJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTWlncmF0aW9uJyxcbiAgICAgICAgICAgIGFjdGlvbjogKCkgPT4gbmF2aWdhdGUoJy9taWdyYXRpb24vZXhlY3V0aW9uJyksXG4gICAgICAgICAgICBrZXl3b3JkczogWydydW4nLCAncHJvZ3Jlc3MnLCAnc3RhdHVzJ10sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIERhdGEgQ29tbWFuZHNcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdkYXRhLWV4cG9ydC11c2VycycsXG4gICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBVc2VycycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0V4cG9ydCB1c2VyIGRhdGEgdG8gZmlsZScsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0RhdGEnLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbmF2aWdhdGUoJy91c2VycycpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdHJpZ2dlckFjdGlvbignZXhwb3J0JyksIDEwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2F2ZScsICdkb3dubG9hZCcsICdhY2NvdW50cyddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2RhdGEtZXhwb3J0LWdyb3VwcycsXG4gICAgICAgICAgICBsYWJlbDogJ0V4cG9ydCBHcm91cHMnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdFeHBvcnQgZ3JvdXAgZGF0YSB0byBmaWxlJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnRGF0YScsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0ZSgnL2dyb3VwcycpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdHJpZ2dlckFjdGlvbignZXhwb3J0JyksIDEwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2V5d29yZHM6IFsnc2F2ZScsICdkb3dubG9hZCcsICd0ZWFtcyddLFxuICAgICAgICB9LFxuICAgICAgICAvLyBTeXN0ZW0gQ29tbWFuZHNcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdzeXN0ZW0tYWJvdXQnLFxuICAgICAgICAgICAgbGFiZWw6ICdBYm91dCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1ZpZXcgYXBwbGljYXRpb24gaW5mb3JtYXRpb24nLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdTeXN0ZW0nLFxuICAgICAgICAgICAgYWN0aW9uOiAoKSA9PiBvcGVuTW9kYWwoJ2Fib3V0JyksXG4gICAgICAgICAgICBrZXl3b3JkczogWyd2ZXJzaW9uJywgJ2luZm8nLCAnaGVscCddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3N5c3RlbS1zZXR0aW5ncycsXG4gICAgICAgICAgICBsYWJlbDogJ09wZW4gU2V0dGluZ3MnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb25maWd1cmUgYXBwbGljYXRpb24gc2V0dGluZ3MnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdTeXN0ZW0nLFxuICAgICAgICAgICAgaWNvbjogU2V0dGluZ3MsXG4gICAgICAgICAgICBhY3Rpb246ICgpID0+IG9wZW5Nb2RhbCgnc2V0dGluZ3MnKSxcbiAgICAgICAgICAgIGtleXdvcmRzOiBbJ3ByZWZlcmVuY2VzJywgJ2NvbmZpZycsICdvcHRpb25zJ10sXG4gICAgICAgIH0sXG4gICAgXTtcbn07XG4vKipcbiAqIEZpbHRlciBjb21tYW5kcyBiYXNlZCBvbiBzZWFyY2ggcXVlcnlcbiAqL1xuZXhwb3J0IGNvbnN0IGZpbHRlckNvbW1hbmRzID0gKGNvbW1hbmRzLCBxdWVyeSkgPT4ge1xuICAgIGlmICghcXVlcnkudHJpbSgpKSB7XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9XG4gICAgY29uc3QgbG93ZXJRdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCk7XG4gICAgcmV0dXJuIGNvbW1hbmRzLmZpbHRlcigoY29tbWFuZCkgPT4ge1xuICAgICAgICAvLyBTZWFyY2ggaW4gbGFiZWwsIGRlc2NyaXB0aW9uLCBjYXRlZ29yeSwgYW5kIGtleXdvcmRzXG4gICAgICAgIGNvbnN0IHNlYXJjaGFibGVUZXh0ID0gW1xuICAgICAgICAgICAgY29tbWFuZC5sYWJlbCxcbiAgICAgICAgICAgIGNvbW1hbmQuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBjb21tYW5kLmNhdGVnb3J5LFxuICAgICAgICAgICAgLi4uKGNvbW1hbmQua2V5d29yZHMgfHwgW10pLFxuICAgICAgICBdLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gc2VhcmNoYWJsZVRleHQuaW5jbHVkZXMobG93ZXJRdWVyeSk7XG4gICAgfSk7XG59O1xuLyoqXG4gKiBHcm91cCBjb21tYW5kcyBieSBjYXRlZ29yeVxuICovXG5leHBvcnQgY29uc3QgZ3JvdXBDb21tYW5kc0J5Q2F0ZWdvcnkgPSAoY29tbWFuZHMpID0+IHtcbiAgICBjb25zdCBjYXRlZ29yaWVzID0ge307XG4gICAgY29tbWFuZHMuZm9yRWFjaCgoY29tbWFuZCkgPT4ge1xuICAgICAgICBpZiAoIWNhdGVnb3JpZXNbY29tbWFuZC5jYXRlZ29yeV0pIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXNbY29tbWFuZC5jYXRlZ29yeV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBjYXRlZ29yaWVzW2NvbW1hbmQuY2F0ZWdvcnldLnB1c2goY29tbWFuZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKGNhdGVnb3JpZXMpLm1hcCgoW25hbWUsIGNvbW1hbmRzXSkgPT4gKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgY29tbWFuZHMsXG4gICAgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUNvbW1hbmRSZWdpc3RyeTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENvbW1hbmRQYWxldHRlIENvbXBvbmVudFxuICpcbiAqIEdsb2JhbCBjb21tYW5kIHBhbGV0dGUgZm9yIHF1aWNrIGFjdGlvbnMgd2l0aCBmdXp6eSBzZWFyY2gsXG4gKiBrZXlib2FyZCBuYXZpZ2F0aW9uLCBhbmQgY2F0ZWdvcml6ZWQgY29tbWFuZHMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgU2VhcmNoLCBLZXlib2FyZCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VNb2RhbFN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlTW9kYWxTdG9yZSc7XG5pbXBvcnQgeyBjcmVhdGVDb21tYW5kUmVnaXN0cnksIGZpbHRlckNvbW1hbmRzLCBncm91cENvbW1hbmRzQnlDYXRlZ29yeSB9IGZyb20gJy4uLy4uL2xpYi9jb21tYW5kUmVnaXN0cnknO1xuLyoqXG4gKiBDb21tYW5kIFBhbGV0dGUgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDb21tYW5kUGFsZXR0ZSA9ICgpID0+IHtcbiAgICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gICAgY29uc3QgeyBjbG9zZUNvbW1hbmRQYWxldHRlLCBvcGVuTW9kYWwgfSA9IHVzZU1vZGFsU3RvcmUoKTtcbiAgICBjb25zdCBbc2VhcmNoUXVlcnksIHNldFNlYXJjaFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRJbmRleCwgc2V0U2VsZWN0ZWRJbmRleF0gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBpbnB1dFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICAvLyBDcmVhdGUgY29tbWFuZCByZWdpc3RyeVxuICAgIGNvbnN0IGNvbW1hbmRzID0gY3JlYXRlQ29tbWFuZFJlZ2lzdHJ5KG5hdmlnYXRlLCAodHlwZSwgZGF0YSkgPT4ge1xuICAgICAgICBjbG9zZUNvbW1hbmRQYWxldHRlKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gb3Blbk1vZGFsKHsgdHlwZTogdHlwZSwgdGl0bGU6ICcnLCBkaXNtaXNzYWJsZTogdHJ1ZSwgZGF0YSB9KSwgMTAwKTtcbiAgICB9LCAoYWN0aW9uKSA9PiB7XG4gICAgICAgIGNsb3NlQ29tbWFuZFBhbGV0dGUoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBDdXN0b21FdmVudChgYXBwOiR7YWN0aW9ufWApO1xuICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9LCAxMDApO1xuICAgIH0pO1xuICAgIC8vIEZpbHRlciBjb21tYW5kcyBiYXNlZCBvbiBzZWFyY2hcbiAgICBjb25zdCBmaWx0ZXJlZENvbW1hbmRzID0gZmlsdGVyQ29tbWFuZHMoY29tbWFuZHMsIHNlYXJjaFF1ZXJ5KTtcbiAgICBjb25zdCBncm91cGVkQ29tbWFuZHMgPSBncm91cENvbW1hbmRzQnlDYXRlZ29yeShmaWx0ZXJlZENvbW1hbmRzKTtcbiAgICAvLyBGb2N1cyBpbnB1dCBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlucHV0UmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIFJlc2V0IHNlbGVjdGVkIGluZGV4IHdoZW4gc2VhcmNoIGNoYW5nZXNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZEluZGV4KDApO1xuICAgIH0sIFtzZWFyY2hRdWVyeV0pO1xuICAgIC8vIEtleWJvYXJkIG5hdmlnYXRpb25cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVLZXlEb3duID0gKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBjbG9zZUNvbW1hbmRQYWxldHRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLmtleSA9PT0gJ0Fycm93RG93bicpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRJbmRleCgocHJldikgPT4gTWF0aC5taW4ocHJldiArIDEsIGZpbHRlcmVkQ29tbWFuZHMubGVuZ3RoIC0gMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXkgPT09ICdBcnJvd1VwJykge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZEluZGV4KChwcmV2KSA9PiBNYXRoLm1heChwcmV2IC0gMSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDb21tYW5kID0gZmlsdGVyZWRDb21tYW5kc1tzZWxlY3RlZEluZGV4XTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRDb21tYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVDb21tYW5kKHNlbGVjdGVkQ29tbWFuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleURvd24pO1xuICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlEb3duKTtcbiAgICB9LCBbc2VsZWN0ZWRJbmRleCwgZmlsdGVyZWRDb21tYW5kcywgY2xvc2VDb21tYW5kUGFsZXR0ZV0pO1xuICAgIGNvbnN0IGV4ZWN1dGVDb21tYW5kID0gKGNvbW1hbmQpID0+IHtcbiAgICAgICAgY29tbWFuZC5hY3Rpb24oKTtcbiAgICAgICAgY2xvc2VDb21tYW5kUGFsZXR0ZSgpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ29tbWFuZENsaWNrID0gKGNvbW1hbmQpID0+IHtcbiAgICAgICAgZXhlY3V0ZUNvbW1hbmQoY29tbWFuZCk7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay81MCB6LTUwIGZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1jZW50ZXIgcHQtMjAgcHgtNFwiLCBvbkNsaWNrOiBjbG9zZUNvbW1hbmRQYWxldHRlLCBcImRhdGEtY3lcIjogXCJjb21tYW5kLXBhbGV0dGUtb3ZlcmxheVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy0yeGwgdy1mdWxsIG1heC13LTJ4bCBvdmVyZmxvdy1oaWRkZW5cIiwgb25DbGljazogKGUpID0+IGUuc3RvcFByb3BhZ2F0aW9uKCksIFwiZGF0YS1jeVwiOiBcImNvbW1hbmQtcGFsZXR0ZVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHAtNCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogaW5wdXRSZWYsIHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogc2VhcmNoUXVlcnksIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VhcmNoUXVlcnkoZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogXCJUeXBlIGEgY29tbWFuZCBvciBzZWFyY2guLi5cIiwgY2xhc3NOYW1lOiBcImZsZXgtMSBiZy10cmFuc3BhcmVudCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBvdXRsaW5lLW5vbmUgcGxhY2Vob2xkZXItZ3JheS00MDAgdGV4dC1sZ1wiLCBcImRhdGEtY3lcIjogXCJjb21tYW5kLXBhbGV0dGUtaW5wdXRcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgdGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3goXCJrYmRcIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0xIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZFwiLCBjaGlsZHJlbjogXCJFU0NcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJ0byBjbG9zZVwiIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWF4LWgtOTYgb3ZlcmZsb3cteS1hdXRvXCIsIFwiZGF0YS1jeVwiOiBcImNvbW1hbmQtbGlzdFwiLCBjaGlsZHJlbjogZmlsdGVyZWRDb21tYW5kcy5sZW5ndGggPT09IDAgPyAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC04IHRleHQtY2VudGVyIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBcInctMTIgaC0xMiBteC1hdXRvIG1iLTMgb3BhY2l0eS01MFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBcIk5vIGNvbW1hbmRzIGZvdW5kXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgbXQtMVwiLCBjaGlsZHJlbjogXCJUcnkgYSBkaWZmZXJlbnQgc2VhcmNoIHRlcm1cIiB9KV0gfSkpIDogKGdyb3VwZWRDb21tYW5kcy5tYXAoKGNhdGVnb3J5LCBjYXRlZ29yeUluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNhdGVnb3J5SW5kZXggPiAwID8gJ210LTInIDogJycsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC00IHB5LTIgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwLzUwXCIsIGNoaWxkcmVuOiBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiLCBjaGlsZHJlbjogY2F0ZWdvcnkubmFtZSB9KSB9KSwgY2F0ZWdvcnkuY29tbWFuZHMubWFwKChjb21tYW5kLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnbG9iYWxJbmRleCA9IGZpbHRlcmVkQ29tbWFuZHMuaW5kZXhPZihjb21tYW5kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IGdsb2JhbEluZGV4ID09PSBzZWxlY3RlZEluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gaGFuZGxlQ29tbWFuZENsaWNrKGNvbW1hbmQpLCBvbk1vdXNlRW50ZXI6ICgpID0+IHNldFNlbGVjdGVkSW5kZXgoZ2xvYmFsSW5kZXgpLCBjbGFzc05hbWU6IGB3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtNCBweS0zIHRleHQtbGVmdCB0cmFuc2l0aW9uLWNvbG9ycyAke2lzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgYm9yZGVyLWwtMiBib3JkZXItYmx1ZS02MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwLzUwIGJvcmRlci1sLTIgYm9yZGVyLXRyYW5zcGFyZW50J31gLCBcImRhdGEtY3lcIjogYGNvbW1hbmQtJHtjb21tYW5kLmlkfWAsIGNoaWxkcmVuOiBbY29tbWFuZC5pY29uICYmIChfanN4KGNvbW1hbmQuaWNvbiwgeyBjbGFzc05hbWU6IGB3LTUgaC01IGZsZXgtc2hyaW5rLTAgJHtpc1NlbGVjdGVkID8gJ3RleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwJyA6ICd0ZXh0LWdyYXktNDAwJ31gIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG1pbi13LTBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgdGV4dC1zbSBmb250LW1lZGl1bSAke2lzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwJ31gLCBjaGlsZHJlbjogY29tbWFuZC5sYWJlbCB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIHRydW5jYXRlXCIsIGNoaWxkcmVuOiBjb21tYW5kLmRlc2NyaXB0aW9uIH0pXSB9KSwgY29tbWFuZC5zaG9ydGN1dCAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSBmbGV4LXNocmluay0wXCIsIGNoaWxkcmVuOiBjb21tYW5kLnNob3J0Y3V0LnNwbGl0KCcrJykubWFwKChrZXksIGkpID0+IChfanN4cyhSZWFjdC5GcmFnbWVudCwgeyBjaGlsZHJlbjogW2kgPiAwICYmIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIrXCIgfSksIF9qc3goXCJrYmRcIiwgeyBjbGFzc05hbWU6IGBweC0yIHB5LTEgdGV4dC14cyByb3VuZGVkICR7aXNTZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMC80MCB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS0zMDAnfWAsIGNoaWxkcmVuOiBrZXkgfSldIH0sIGkpKSkgfSkpXSB9LCBjb21tYW5kLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldIH0sIGNhdGVnb3J5Lm5hbWUpKSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNCBweS0zIGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDAvNTBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCB0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFwia2JkXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIgcHktMSBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMFwiLCBjaGlsZHJlbjogXCJcXHUyMTkxXFx1MjE5M1wiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIk5hdmlnYXRlXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goXCJrYmRcIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0xIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZCBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwXCIsIGNoaWxkcmVuOiBcIlxcdTIxQjVcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJTZWxlY3RcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeChLZXlib2FyZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjaGlsZHJlbjogW2ZpbHRlcmVkQ29tbWFuZHMubGVuZ3RoLCBcIiBjb21tYW5kc1wiXSB9KV0gfSldIH0pXSB9KSB9KSk7XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTWFpbkxheW91dCBDb21wb25lbnRcbiAqXG4gKiBNYWluIGFwcGxpY2F0aW9uIGxheW91dCB3aXRoIHNpZGViYXIgYW5kIGNvbnRlbnQgYXJlYVxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2lkZWJhciB9IGZyb20gJy4uL29yZ2FuaXNtcy9TaWRlYmFyJztcbmltcG9ydCB7IFRhYlZpZXcgfSBmcm9tICcuLi9vcmdhbmlzbXMvVGFiVmlldyc7XG5pbXBvcnQgeyBDb21tYW5kUGFsZXR0ZSB9IGZyb20gJy4uL29yZ2FuaXNtcy9Db21tYW5kUGFsZXR0ZSc7XG5pbXBvcnQgeyB1c2VNb2RhbFN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlTW9kYWxTdG9yZSc7XG4vKipcbiAqIE1haW4gYXBwbGljYXRpb24gbGF5b3V0XG4gKi9cbmV4cG9ydCBjb25zdCBNYWluTGF5b3V0ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xuICAgIGNvbnN0IHsgaXNDb21tYW5kUGFsZXR0ZU9wZW4gfSA9IHVzZU1vZGFsU3RvcmUoKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaC1zY3JlZW4gYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIGNoaWxkcmVuOiBbX2pzeChTaWRlYmFyLCB7fSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBmbGV4IGZsZXgtY29sIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW19qc3goVGFiVmlldywge30pLCBfanN4KFwibWFpblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3cteS1hdXRvXCIsIGNoaWxkcmVuOiBjaGlsZHJlbiB9KV0gfSksIGlzQ29tbWFuZFBhbGV0dGVPcGVuICYmIF9qc3goQ29tbWFuZFBhbGV0dGUsIHt9KV0gfSkpO1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE1haW4gQXBwbGljYXRpb24gQ29tcG9uZW50XG4gKlxuICogSW1wbGVtZW50cyByb3V0aW5nIHdpdGggbGF6eSBsb2FkaW5nIGZvciBvcHRpbWFsIHBlcmZvcm1hbmNlLlxuICogV3JhcHMgdGhlIGFwcGxpY2F0aW9uIHdpdGggZXJyb3IgaGFuZGxpbmcgYW5kIG5vdGlmaWNhdGlvbiBzeXN0ZW1zLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSGFzaFJvdXRlciwgdXNlUm91dGVzIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyBEbmRQcm92aWRlciB9IGZyb20gJ3JlYWN0LWRuZCc7XG5pbXBvcnQgeyBIVE1MNUJhY2tlbmQgfSBmcm9tICdyZWFjdC1kbmQtaHRtbDUtYmFja2VuZCc7XG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi9jb21wb25lbnRzL0Vycm9yQm91bmRhcnknO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uQ29udGFpbmVyIH0gZnJvbSAnLi9jb21wb25lbnRzL05vdGlmaWNhdGlvbkNvbnRhaW5lcic7XG5pbXBvcnQgeyBNb2RhbENvbnRhaW5lciB9IGZyb20gJy4vY29tcG9uZW50cy9vcmdhbmlzbXMvTW9kYWxDb250YWluZXInO1xuaW1wb3J0IHsgTWFpbkxheW91dCB9IGZyb20gJy4vY29tcG9uZW50cy9sYXlvdXRzL01haW5MYXlvdXQnO1xuaW1wb3J0IHsgdXNlVGhlbWVTdG9yZSB9IGZyb20gJy4vc3RvcmUvdXNlVGhlbWVTdG9yZSc7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcbi8qKlxuICogVGhlbWUgSW5pdGlhbGl6ZXIgLSBFbnN1cmVzIHRoZW1lIGlzIGFwcGxpZWQgb24gbW91bnRcbiAqL1xuY29uc3QgVGhlbWVJbml0aWFsaXplciA9ICgpID0+IHtcbiAgICBjb25zdCB7IG1vZGUsIGFjdHVhbE1vZGUgfSA9IHVzZVRoZW1lU3RvcmUoKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICAvLyBBcHBseSB0aGVtZSB0byBET00gb24gbW91bnRcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgaWYgKGFjdHVhbE1vZGUgPT09ICdkYXJrJykge1xuICAgICAgICAgICAgcm9vdC5jbGFzc0xpc3QuYWRkKCdkYXJrJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoJ2RhcmsnKTtcbiAgICAgICAgfVxuICAgIH0sIFttb2RlLCBhY3R1YWxNb2RlXSk7XG4gICAgcmV0dXJuIG51bGw7XG59O1xuLyoqXG4gKiBBcHBDb250ZW50IC0gUmVuZGVycyByb3V0ZXMgd2l0aGluIE1haW5MYXlvdXRcbiAqL1xuY29uc3QgQXBwQ29udGVudCA9ICgpID0+IHtcbiAgICBjb25zdCByb3V0aW5nID0gdXNlUm91dGVzKHJvdXRlcyk7XG4gICAgcmV0dXJuIChfanN4KE1haW5MYXlvdXQsIHsgY2hpbGRyZW46IHJvdXRpbmcgfSkpO1xufTtcbi8qKlxuICogQXBwIC0gTWFpbiBhcHBsaWNhdGlvbiBlbnRyeSBwb2ludFxuICovXG5jb25zdCBBcHAgPSAoKSA9PiB7XG4gICAgLy8gSGFuZGxlIGVycm9ycyBmcm9tIEVycm9yQm91bmRhcnlcbiAgICBjb25zdCBoYW5kbGVFcnJvciA9IChlcnJvciwgZXJyb3JJbmZvKSA9PiB7XG4gICAgICAgIC8vIExvZyBlcnJvciB0byBtYWluIHByb2Nlc3NcbiAgICAgICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQST8ubG9nZ2luZykge1xuICAgICAgICAgICAgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2dpbmcuZXJyb3IoJ0FwcCcsIGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YWNrLCB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50U3RhY2s6IGVycm9ySW5mby5jb21wb25lbnRTdGFja1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoRXJyb3JCb3VuZGFyeSwgeyBvbkVycm9yOiBoYW5kbGVFcnJvciwgc2hvd0RldGFpbHM6IHRydWUsIGNoaWxkcmVuOiBbX2pzeChUaGVtZUluaXRpYWxpemVyLCB7fSksIF9qc3goTm90aWZpY2F0aW9uQ29udGFpbmVyLCB7fSksIF9qc3goTW9kYWxDb250YWluZXIsIHt9KSwgX2pzeChEbmRQcm92aWRlciwgeyBiYWNrZW5kOiBIVE1MNUJhY2tlbmQsIGNoaWxkcmVuOiBfanN4KEhhc2hSb3V0ZXIsIHsgY2hpbGRyZW46IF9qc3goQXBwQ29udGVudCwge30pIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU3RhdHVzSW5kaWNhdG9yIENvbXBvbmVudFxuICpcbiAqIERpc3BsYXlzIGEgY29sb3JlZCBkb3Qgd2l0aCB0ZXh0IHRvIGluZGljYXRlIHN0YXR1cyAob25saW5lLCBvZmZsaW5lLCBlcnJvciwgZXRjLilcbiAqIFVzZWQgZm9yIGNvbm5lY3Rpb24gc3RhdHVzLCBlbnZpcm9ubWVudCBpbmRpY2F0b3JzLCBhbmQgZ2VuZXJhbCBzdGF0ZSBkaXNwbGF5LlxuICpcbiAqIEVwaWMgMDogVUkvVVggUGFyaXR5IC0gUmVwbGFjZXMgV1BGIFN0YXR1c0luZGljYXRvci54YW1sXG4gKlxuICogQGNvbXBvbmVudFxuICogQGV4YW1wbGVcbiAqIGBgYHRzeFxuICogPFN0YXR1c0luZGljYXRvciBzdGF0dXM9XCJzdWNjZXNzXCIgdGV4dD1cIkNvbm5lY3RlZFwiIHNpemU9XCJtZFwiIC8+XG4gKiA8U3RhdHVzSW5kaWNhdG9yIHN0YXR1cz1cIm9ubGluZVwiIHRleHQ9XCJBY3RpdmUgRGlyZWN0b3J5XCIgc2l6ZT1cImxnXCIgYW5pbWF0ZSAvPlxuICogYGBgXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIFN0YXR1c0luZGljYXRvciBDb21wb25lbnRcbiAqXG4gKiBSZXBsaWNhdGVzIFdQRiBTdGF0dXNJbmRpY2F0b3Igd2l0aCBzZW1hbnRpYyBjb2xvciBjb2RpbmcgYW5kIGFuaW1hdGlvbnMuXG4gKiBVc2VzIGRlc2lnbiBzeXN0ZW0gY29sb3JzIGZyb20gRXBpYyAwIGFyY2hpdGVjdHVyZS5cbiAqL1xuZXhwb3J0IGNvbnN0IFN0YXR1c0luZGljYXRvciA9IFJlYWN0Lm1lbW8oKHsgc3RhdHVzLCB0ZXh0LCBzaXplID0gJ21kJywgYW5pbWF0ZSA9IGZhbHNlLCBkZXNjcmlwdGlvbiwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFN0YXR1cyBjb2xvciBjbGFzc2VzIG1hdGNoaW5nIGFyY2hpdGVjdHVyYWwgc3BlY2lmaWNhdGlvbnNcbiAgICBjb25zdCBzdGF0dXNDb2xvckNsYXNzZXMgPSB7XG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1zdWNjZXNzJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXdhcm5pbmcnLFxuICAgICAgICBlcnJvcjogJ2JnLWVycm9yJyxcbiAgICAgICAgaW5mbzogJ2JnLWluZm8nLFxuICAgICAgICBvbmxpbmU6ICdiZy1zdGF0dXMtb25saW5lJyxcbiAgICAgICAgb2ZmbGluZTogJ2JnLXN0YXR1cy1vZmZsaW5lJyxcbiAgICAgICAgaWRsZTogJ2JnLXN0YXR1cy1pZGxlJyxcbiAgICAgICAgdW5rbm93bjogJ2JnLXN0YXR1cy11bmtub3duJyxcbiAgICB9O1xuICAgIC8vIFN0YXR1cyB0ZXh0IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCB0ZXh0Q29sb3JDbGFzc2VzID0ge1xuICAgICAgICBzdWNjZXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgd2FybmluZzogJ3RleHQtd2FybmluZycsXG4gICAgICAgIGVycm9yOiAndGV4dC1lcnJvcicsXG4gICAgICAgIGluZm86ICd0ZXh0LWluZm8nLFxuICAgICAgICBvbmxpbmU6ICd0ZXh0LXN0YXR1cy1vbmxpbmUnLFxuICAgICAgICBvZmZsaW5lOiAndGV4dC1zdGF0dXMtb2ZmbGluZScsXG4gICAgICAgIGlkbGU6ICd0ZXh0LXN0YXR1cy1pZGxlJyxcbiAgICAgICAgdW5rbm93bjogJ3RleHQtc3RhdHVzLXVua25vd24nLFxuICAgIH07XG4gICAgLy8gU2l6ZSBjbGFzc2VzIGZvciBjb250YWluZXJcbiAgICBjb25zdCBjb250YWluZXJTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtNCBweS0xLjUgdGV4dC1iYXNlJyxcbiAgICB9O1xuICAgIC8vIFNpemUgY2xhc3NlcyBmb3IgZG90XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAndy0yIGgtMicsXG4gICAgICAgIG1kOiAndy0yLjUgaC0yLjUnLFxuICAgICAgICBsZzogJ3ctMyBoLTMnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3N0YXR1cy1pbmRpY2F0b3InLCBjb250YWluZXJTaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICBjb25zdCBkb3RDbGFzc2VzID0gY2xzeCgncm91bmRlZC1mdWxsJywgc3RhdHVzQ29sb3JDbGFzc2VzW3N0YXR1c10sIGRvdFNpemVDbGFzc2VzW3NpemVdLCB7XG4gICAgICAgICdhbmltYXRlLXB1bHNlJzogYW5pbWF0ZSxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdmb250LW1lZGl1bScsIHRleHRDb2xvckNsYXNzZXNbc3RhdHVzXSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgdGl0bGU6IGRlc2NyaXB0aW9uIHx8IGBTdGF0dXM6ICR7c3RhdHVzfWAsIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfHwgYHN0YXR1cy0ke3N0YXR1c31gLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogYCR7dGV4dH0gLSAke3N0YXR1c31gLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZSBpbmxpbmUtZmxleFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBkb3RDbGFzc2VzLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBhbmltYXRlICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgaW5saW5lLWZsZXggaC1mdWxsIHctZnVsbCByb3VuZGVkLWZ1bGwgb3BhY2l0eS03NScsIHN0YXR1c0NvbG9yQ2xhc3Nlc1tzdGF0dXNdLCAnYW5pbWF0ZS1waW5nJyksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IHRleHQgfSldIH0pKTtcbn0pO1xuU3RhdHVzSW5kaWNhdG9yLmRpc3BsYXlOYW1lID0gJ1N0YXR1c0luZGljYXRvcic7XG5leHBvcnQgZGVmYXVsdCBTdGF0dXNJbmRpY2F0b3I7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNwaW5uZXIgQ29tcG9uZW50XG4gKlxuICogTG9hZGluZyBzcGlubmVyIHdpdGggdmFyaW91cyBzaXplcyBhbmQgY29sb3JzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBMb2FkZXIyIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU3Bpbm5lciBjb21wb25lbnQgZm9yIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmV4cG9ydCBjb25zdCBTcGlubmVyID0gKHsgc2l6ZSA9ICdtZCcsIGNvbG9yID0gJ3ByaW1hcnknLCBsYWJlbCA9ICdMb2FkaW5nLi4uJywgY2VudGVyID0gZmFsc2UsIGZ1bGxTY3JlZW4gPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFNpemUgbWFwcGluZ3NcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgeHM6IDE2LFxuICAgICAgICBzbTogMjAsXG4gICAgICAgIG1kOiAyNCxcbiAgICAgICAgbGc6IDMyLFxuICAgICAgICB4bDogNDgsXG4gICAgfTtcbiAgICAvLyBDb2xvciBjbGFzc2VzXG4gICAgY29uc3QgY29sb3JzID0ge1xuICAgICAgICBwcmltYXJ5OiAndGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLFxuICAgICAgICBzZWNvbmRhcnk6ICd0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCcsXG4gICAgICAgIHdoaXRlOiAndGV4dC13aGl0ZScsXG4gICAgICAgIGN1cnJlbnQ6ICd0ZXh0LWN1cnJlbnQnLFxuICAgIH07XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXMgZm9yIGNlbnRlcmluZ1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGNlbnRlciAmJiAhZnVsbFNjcmVlbiAmJiAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCBmdWxsU2NyZWVuICYmICdmaXhlZCBpbnNldC0wIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLWJsYWNrIGJnLW9wYWNpdHktNTAgei01MCcsIGNsYXNzTmFtZSk7XG4gICAgLy8gU3Bpbm5lciBlbGVtZW50XG4gICAgY29uc3Qgc3Bpbm5lckVsZW1lbnQgPSAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChMb2FkZXIyLCB7IGNsYXNzTmFtZTogY2xzeCgnYW5pbWF0ZS1zcGluJywgY29sb3JzW2NvbG9yXSksIHNpemU6IHNpemVzW3NpemVdLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJzci1vbmx5XCIsIGNoaWxkcmVuOiBsYWJlbCB9KV0gfSkpO1xuICAgIC8vIElmIGNlbnRlcmluZyBvciBmdWxsc2NyZWVuLCB3cmFwIGluIGNvbnRhaW5lclxuICAgIGlmIChjZW50ZXIgfHwgZnVsbFNjcmVlbikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBsYWJlbCwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbc3Bpbm5lckVsZW1lbnQsIGZ1bGxTY3JlZW4gJiYgKF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgdGV4dC13aGl0ZSB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBsYWJlbCB9KSldIH0pIH0pKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIHJldHVybiBzcGlubmVyIGRpcmVjdGx5XG4gICAgcmV0dXJuIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogbGFiZWwsIGNoaWxkcmVuOiBzcGlubmVyRWxlbWVudCB9KSk7XG59O1xuIiwiLyoqXG4gKiBGYWxsYmFjayBpbXBsZW1lbnRhdGlvbnMgZm9yIHdoZW4gZWxlY3Ryb25BUEkgaXMgbm90IGF2YWlsYWJsZVxuICogVGhpcyBwcm92aWRlcyBtb2NrIGltcGxlbWVudGF0aW9ucyB0byBwcmV2ZW50IGNyYXNoZXMgZHVyaW5nIGRldmVsb3BtZW50XG4gKi9cbmV4cG9ydCBjb25zdCBlbGVjdHJvbkFQSUZhbGxiYWNrID0ge1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBQb3dlclNoZWxsIEV4ZWN1dGlvblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBleGVjdXRlU2NyaXB0OiBhc3luYyAoKSA9PiAoe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgIHdhcm5pbmdzOiBbJ1J1bm5pbmcgaW4gZGV2ZWxvcG1lbnQgbW9kZSAtIHJldHVybmluZyBtb2NrIGRhdGEnXSxcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZCxcbiAgICB9KSxcbiAgICBleGVjdXRlTW9kdWxlOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgIHdhcm5pbmdzOiBbJ1J1bm5pbmcgaW4gZGV2ZWxvcG1lbnQgbW9kZSAtIHJldHVybmluZyBtb2NrIGRhdGEnXSxcbiAgICAgICAgZXJyb3I6IHVuZGVmaW5lZCxcbiAgICB9KSxcbiAgICBjYW5jZWxFeGVjdXRpb246IGFzeW5jICgpID0+IGZhbHNlLFxuICAgIGRpc2NvdmVyTW9kdWxlczogYXN5bmMgKCkgPT4gW10sXG4gICAgZXhlY3V0ZVBhcmFsbGVsOiBhc3luYyAoKSA9PiBbXSxcbiAgICBleGVjdXRlV2l0aFJldHJ5OiBhc3luYyAoKSA9PiAoe1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZScsXG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICB3YXJuaW5nczogW10sXG4gICAgfSksXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEZpbGUgT3BlcmF0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICByZWFkRmlsZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJyk7XG4gICAgfSxcbiAgICB3cml0ZUZpbGU6IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZScpO1xuICAgIH0sXG4gICAgZmlsZUV4aXN0czogYXN5bmMgKCkgPT4gZmFsc2UsXG4gICAgZGVsZXRlRmlsZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJyk7XG4gICAgfSxcbiAgICBsaXN0RmlsZXM6IGFzeW5jICgpID0+IFtdLFxuICAgIGxvZ1RvRmlsZTogYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBOby1vcCBpbiBmYWxsYmFjayBtb2RlXG4gICAgfSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQ29uZmlndXJhdGlvbiBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGdldENvbmZpZzogYXN5bmMgKCkgPT4gbnVsbCxcbiAgICBzZXRDb25maWc6IGFzeW5jICgpID0+IHsgfSxcbiAgICBnZXRBbGxDb25maWc6IGFzeW5jICgpID0+ICh7fSksXG4gICAgZGVsZXRlQ29uZmlnOiBhc3luYyAoKSA9PiB7IH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFByb2ZpbGUgTWFuYWdlbWVudFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBsb2FkU291cmNlUHJvZmlsZXM6IGFzeW5jICgpID0+IFtdLFxuICAgIGxvYWRUYXJnZXRQcm9maWxlczogYXN5bmMgKCkgPT4gW10sXG4gICAgZ2V0QWN0aXZlU291cmNlUHJvZmlsZTogYXN5bmMgKCkgPT4gbnVsbCxcbiAgICBnZXRBY3RpdmVUYXJnZXRQcm9maWxlOiBhc3luYyAoKSA9PiBudWxsLFxuICAgIGNyZWF0ZVNvdXJjZVByb2ZpbGU6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJywgcHJvZmlsZTogbnVsbCB9KSxcbiAgICBjcmVhdGVUYXJnZXRQcm9maWxlOiBhc3luYyAoKSA9PiAoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZScsIHByb2ZpbGU6IG51bGwgfSksXG4gICAgdXBkYXRlU291cmNlUHJvZmlsZTogYXN5bmMgKCkgPT4gKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnLCBwcm9maWxlOiBudWxsIH0pLFxuICAgIHVwZGF0ZVRhcmdldFByb2ZpbGU6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJywgcHJvZmlsZTogbnVsbCB9KSxcbiAgICBkZWxldGVTb3VyY2VQcm9maWxlOiBhc3luYyAoKSA9PiAoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZScgfSksXG4gICAgZGVsZXRlVGFyZ2V0UHJvZmlsZTogYXN5bmMgKCkgPT4gKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnIH0pLFxuICAgIHNldEFjdGl2ZVNvdXJjZVByb2ZpbGU6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJywgZGF0YVBhdGg6ICcnIH0pLFxuICAgIHNldEFjdGl2ZVRhcmdldFByb2ZpbGU6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJyB9KSxcbiAgICByZWZyZXNoUHJvZmlsZXM6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJywgcHJvZmlsZXM6IFtdIH0pLFxuICAgIGdldFByb2ZpbGVEYXRhUGF0aDogYXN5bmMgKCkgPT4gKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnLCBwYXRoOiAnJyB9KSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRXZlbnQgTGlzdGVuZXJzIChmb3Igc3RyZWFtaW5nKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBvblByb2dyZXNzOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgb25PdXRwdXQ6ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbk91dHB1dFN0cmVhbTogKCkgPT4gKCkgPT4geyB9LFxuICAgIG9uRXJyb3JTdHJlYW06ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbldhcm5pbmdTdHJlYW06ICgpID0+ICgpID0+IHsgfSxcbiAgICBvblZlcmJvc2VTdHJlYW06ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbkRlYnVnU3RyZWFtOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgb25JbmZvcm1hdGlvblN0cmVhbTogKCkgPT4gKCkgPT4geyB9LFxuICAgIG9uRXhlY3V0aW9uQ2FuY2VsbGVkOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEZpbGUgV2F0Y2hlciBPcGVyYXRpb25zXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHN0YXJ0RmlsZVdhdGNoZXI6IGFzeW5jICgpID0+ICh7IHN1Y2Nlc3M6IGZhbHNlIH0pLFxuICAgIHN0b3BGaWxlV2F0Y2hlcjogYXN5bmMgKCkgPT4gKHsgc3VjY2VzczogZmFsc2UgfSksXG4gICAgc3RvcEFsbEZpbGVXYXRjaGVyczogYXN5bmMgKCkgPT4gKHsgc3VjY2VzczogZmFsc2UgfSksXG4gICAgZ2V0V2F0Y2hlZEZpbGVzOiBhc3luYyAoKSA9PiBbXSxcbiAgICBnZXRGaWxlV2F0Y2hlclN0YXRpc3RpY3M6IGFzeW5jICgpID0+ICh7XG4gICAgICAgIGFjdGl2ZVdhdGNoZXJzOiAwLFxuICAgICAgICB3YXRjaGVkRGlyZWN0b3JpZXM6IFtdLFxuICAgICAgICB0b3RhbEV2ZW50czogMCxcbiAgICAgICAgZXZlbnRzQnlUeXBlOiB7IGFkZGVkOiAwLCBjaGFuZ2VkOiAwLCBkZWxldGVkOiAwIH1cbiAgICB9KSxcbiAgICBvbkZpbGVDaGFuZ2VkOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFN5c3RlbSAvIEFwcCBPcGVyYXRpb25zXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGdldEFwcFZlcnNpb246IGFzeW5jICgpID0+ICdkZXZlbG9wbWVudCcsXG4gICAgZ2V0RGF0YVBhdGg6IGFzeW5jICgpID0+IHByb2Nlc3MuY3dkKCksXG4gICAgb3BlbkV4dGVybmFsOiBhc3luYyAoKSA9PiB7IH0sXG4gICAgc2hvd09wZW5EaWFsb2c6IGFzeW5jICgpID0+IG51bGwsXG4gICAgc2hvd1NhdmVEaWFsb2c6IGFzeW5jICgpID0+IG51bGwsXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEdlbmVyaWMgSVBDIEludm9rZSAoZm9yIGN1c3RvbSBoYW5kbGVycylcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgaW52b2tlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnKTtcbiAgICB9LFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBFbnZpcm9ubWVudCBEZXRlY3Rpb25cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgZGV0ZWN0RW52aXJvbm1lbnQ6IGFzeW5jICgpID0+ICh7XG4gICAgICAgIGlkOiAnZmFsbGJhY2snLFxuICAgICAgICBzdGFydFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgIGVuZFRpbWU6IG5ldyBEYXRlKCksXG4gICAgICAgIHN0YXR1czogJ2ZhaWxlZCcsXG4gICAgICAgIGRldGVjdGVkRW52aXJvbm1lbnQ6ICd1bmtub3duJyxcbiAgICAgICAgZGV0ZWN0ZWRTZXJ2aWNlczogW10sXG4gICAgICAgIHJlY29tbWVuZGF0aW9uczogW10sXG4gICAgICAgIHRvdGFsU2VydmljZXNGb3VuZDogMCxcbiAgICAgICAgY29uZmlkZW5jZTogMCxcbiAgICAgICAgZXJyb3JzOiBbeyB0aW1lc3RhbXA6IG5ldyBEYXRlKCksIHNlcnZpY2VUeXBlOiAnc3lzdGVtJywgbWVzc2FnZTogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJyB9XSxcbiAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgIH0pLFxuICAgIHZhbGlkYXRlRW52aXJvbm1lbnRDcmVkZW50aWFsczogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgdmFsaWQ6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgfSksXG4gICAgY2FuY2VsRW52aXJvbm1lbnREZXRlY3Rpb246IGFzeW5jICgpID0+IGZhbHNlLFxuICAgIGdldEVudmlyb25tZW50U3RhdGlzdGljczogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgYWN0aXZlRGV0ZWN0aW9uczogMCxcbiAgICAgICAgdG90YWxEZXRlY3Rpb25zUnVuOiAwXG4gICAgfSksXG4gICAgb25FbnZpcm9ubWVudERldGVjdGlvblN0YXJ0ZWQ6ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbkVudmlyb25tZW50RGV0ZWN0aW9uUHJvZ3Jlc3M6ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbkVudmlyb25tZW50RGV0ZWN0aW9uQ29tcGxldGVkOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgb25FbnZpcm9ubWVudERldGVjdGlvbkZhaWxlZDogKCkgPT4gKCkgPT4geyB9LFxuICAgIG9uRW52aXJvbm1lbnREZXRlY3Rpb25DYW5jZWxsZWQ6ICgpID0+ICgpID0+IHsgfSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRGlzY292ZXJ5IE1vZHVsZSBFeGVjdXRpb25cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgZXhlY3V0ZURpc2NvdmVyeTogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnLFxuICAgIH0pLFxuICAgIGNhbmNlbERpc2NvdmVyeTogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnLFxuICAgIH0pLFxuICAgIGdldERpc2NvdmVyeU1vZHVsZXM6IGFzeW5jICgpID0+ICh7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBtb2R1bGVzOiBbXSxcbiAgICAgICAgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZScsXG4gICAgfSksXG4gICAgZ2V0RGlzY292ZXJ5TW9kdWxlSW5mbzogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnLFxuICAgIH0pLFxuICAgIG9uRGlzY292ZXJ5T3V0cHV0OiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgb25EaXNjb3ZlcnlQcm9ncmVzczogKCkgPT4gKCkgPT4geyB9LFxuICAgIG9uRGlzY292ZXJ5Q29tcGxldGU6ICgpID0+ICgpID0+IHsgfSxcbiAgICBvbkRpc2NvdmVyeUVycm9yOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgb25EaXNjb3ZlcnlDYW5jZWxsZWQ6ICgpID0+ICgpID0+IHsgfSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gTG9naWMgRW5naW5lIEFQSVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBsb2dpY0VuZ2luZToge1xuICAgICAgICBsb2FkQWxsOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJ1xuICAgICAgICB9KSxcbiAgICAgICAgZ2V0VXNlckRldGFpbDogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZSdcbiAgICAgICAgfSksXG4gICAgICAgIGdldFN0YXRpc3RpY3M6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgICAgICBpbnZhbGlkYXRlQ2FjaGU6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgICAgICBvblByb2dyZXNzOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgICAgIG9uTG9hZGVkOiAoKSA9PiAoKSA9PiB7IH0sXG4gICAgICAgIG9uRXJyb3I6ICgpID0+ICgpID0+IHsgfSxcbiAgICAgICAgYW5hbHl6ZU1pZ3JhdGlvbkNvbXBsZXhpdHk6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgICAgICBiYXRjaEFuYWx5emVNaWdyYXRpb25Db21wbGV4aXR5OiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJ1xuICAgICAgICB9KSxcbiAgICAgICAgZ2V0Q29tcGxleGl0eVN0YXRpc3RpY3M6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIERhc2hib2FyZCBBUElcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgZGFzaGJvYXJkOiB7XG4gICAgICAgIGdldFN0YXRzOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB0b3RhbFVzZXJzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsR3JvdXBzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsQ29tcHV0ZXJzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsQXBwbGljYXRpb25zOiAwLFxuICAgICAgICAgICAgICAgIG1pZ3JhdGlvblJlYWRpbmVzczoge1xuICAgICAgICAgICAgICAgICAgICByZWFkeTogMCxcbiAgICAgICAgICAgICAgICAgICAgbmVlZHNSZXZpZXc6IDAsXG4gICAgICAgICAgICAgICAgICAgIG5vdFJlYWR5OiAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgICAgZ2V0UHJvamVjdFRpbWVsaW5lOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0TmFtZTogJ0RldmVsb3BtZW50IE1vZGUnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6IG5ldyBEYXRlKERhdGUubm93KCkgKyA5MCAqIDI0ICogNjAgKiA2MCAqIDEwMDApLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgY3VycmVudFBoYXNlOiAnUGxhbm5pbmcnLFxuICAgICAgICAgICAgICAgIHBoYXNlczogW10sXG4gICAgICAgICAgICAgICAgd2F2ZXM6IFtdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICAgIGdldFN5c3RlbUhlYWx0aDogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbG9naWNFbmdpbmVTdGF0dXM6ICdvZmZsaW5lJyxcbiAgICAgICAgICAgICAgICBwb3dlclNoZWxsU3RhdHVzOiAnb2ZmbGluZScsXG4gICAgICAgICAgICAgICAgZGF0YUNvbm5lY3Rpb25TdGF0dXM6ICdvZmZsaW5lJyxcbiAgICAgICAgICAgICAgICBsYXN0SGVhbHRoQ2hlY2s6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB3YXJuaW5nczogWydSdW5uaW5nIGluIGRldmVsb3BtZW50IG1vZGUgd2l0aG91dCBFbGVjdHJvbiddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICAgIGdldFJlY2VudEFjdGl2aXR5OiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICB9KSxcbiAgICAgICAgYWNrbm93bGVkZ2VBbGVydDogYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgLy8gTm8tb3AgaW4gZmFsbGJhY2sgbW9kZVxuICAgICAgICB9LFxuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFByb2plY3QgTWFuYWdlbWVudCBBUElcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgcHJvamVjdDoge1xuICAgICAgICBnZXRDb25maWd1cmF0aW9uOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJ1xuICAgICAgICB9KSxcbiAgICAgICAgc2F2ZUNvbmZpZ3VyYXRpb246IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgICAgICB1cGRhdGVTdGF0dXM6IGFzeW5jICgpID0+ICh7XG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiAnRWxlY3Ryb24gQVBJIG5vdCBhdmFpbGFibGUnXG4gICAgICAgIH0pLFxuICAgICAgICBhZGRXYXZlOiBhc3luYyAoKSA9PiAoe1xuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBlcnJvcjogJ0VsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlJ1xuICAgICAgICB9KSxcbiAgICAgICAgdXBkYXRlV2F2ZVN0YXR1czogYXN5bmMgKCkgPT4gKHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6ICdFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZSdcbiAgICAgICAgfSksXG4gICAgfSxcbn07XG4vKipcbiAqIEdldCB0aGUgZWxlY3Ryb25BUEkgZnJvbSB3aW5kb3csIGZhbGxpbmcgYmFjayB0byBmYWxsYmFjayBpbXBsZW1lbnRhdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0RWxlY3Ryb25BUEkgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5lbGVjdHJvbkFQSSkge1xuICAgICAgICByZXR1cm4gd2luZG93LmVsZWN0cm9uQVBJO1xuICAgIH1cbiAgICBjb25zb2xlLndhcm4oJ1VzaW5nIGZhbGxiYWNrIEVsZWN0cm9uIEFQSSAtIHJ1bm5pbmcgaW4gZGV2ZWxvcG1lbnQgbW9kZSB3aXRob3V0IEVsZWN0cm9uJyk7XG4gICAgcmV0dXJuIGVsZWN0cm9uQVBJRmFsbGJhY2s7XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQnV0dG9uIENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgYnV0dG9uIHdpdGggbXVsdGlwbGUgdmFyaWFudHMgYW5kIHNpemVzXG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTG9hZGVyMiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIEJ1dHRvbiBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgQnV0dG9uID0gZm9yd2FyZFJlZigoeyB2YXJpYW50ID0gJ3ByaW1hcnknLCBzaXplID0gJ21kJywgaWNvbiwgaWNvblBvc2l0aW9uID0gJ2xlYWRpbmcnLCBsb2FkaW5nID0gZmFsc2UsIGRpc2FibGVkID0gZmFsc2UsIGZ1bGxXaWR0aCA9IGZhbHNlLCBjaGlsZHJlbiwgY2xhc3NOYW1lLCBvbkNsaWNrLCAnZGF0YS1jeSc6IGRhdGFDeSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50cyA9IHtcbiAgICAgICAgcHJpbWFyeTogY2xzeCgnYmctYmx1ZS02MDAgdGV4dC13aGl0ZSBob3ZlcjpiZy1ibHVlLTcwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rpc2FibGVkOmJnLWJsdWUtMzAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWJsdWUtNTAwIGRhcms6aG92ZXI6YmctYmx1ZS02MDAnKSxcbiAgICAgICAgc2Vjb25kYXJ5OiBjbHN4KCdiZy1ncmF5LTIwMCB0ZXh0LWdyYXktOTAwIGhvdmVyOmJnLWdyYXktMzAwIGZvY3VzOnJpbmctZ3JheS00MDAnLCAnZGlzYWJsZWQ6YmctZ3JheS0xMDAgZGlzYWJsZWQ6dGV4dC1ncmF5LTQwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTYwMCcpLFxuICAgICAgICBkYW5nZXI6IGNsc3goJ2JnLXJlZC02MDAgdGV4dC13aGl0ZSBob3ZlcjpiZy1yZWQtNzAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkaXNhYmxlZDpiZy1yZWQtMzAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLXJlZC01MDAgZGFyazpob3ZlcjpiZy1yZWQtNjAwJyksXG4gICAgICAgIGdob3N0OiBjbHN4KCdiZy10cmFuc3BhcmVudCB0ZXh0LWdyYXktNzAwIGhvdmVyOmJnLWdyYXktMTAwIGZvY3VzOnJpbmctZ3JheS00MDAnLCAnZGlzYWJsZWQ6dGV4dC1ncmF5LTQwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazp0ZXh0LWdyYXktMzAwIGRhcms6aG92ZXI6YmctZ3JheS04MDAnKSxcbiAgICAgICAgbGluazogY2xzeCgnYmctdHJhbnNwYXJlbnQgdGV4dC1ibHVlLTYwMCBob3Zlcjp0ZXh0LWJsdWUtNzAwIHVuZGVybGluZS1vZmZzZXQtNCBob3Zlcjp1bmRlcmxpbmUnLCAnZGlzYWJsZWQ6dGV4dC1ibHVlLTMwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazp0ZXh0LWJsdWUtNDAwIGRhcms6aG92ZXI6dGV4dC1ibHVlLTMwMCcpLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTEgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtc20nLFxuICAgICAgICBsZzogJ3B4LTUgcHktMi41IHRleHQtYmFzZScsXG4gICAgICAgIHhsOiAncHgtNiBweS0zIHRleHQtYmFzZScsXG4gICAgfTtcbiAgICAvLyBCYXNlIGJ1dHRvbiBjbGFzc2VzXG4gICAgY29uc3QgYmFzZUNsYXNzZXMgPSBjbHN4KCdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAnZm9udC1tZWRpdW0gcm91bmRlZC1tZCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOm9wYWNpdHktNTAnLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHZhcmlhbnRzW3ZhcmlhbnRdLCBzaXplc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICAvLyBIYW5kbGUgY2xpY2sgd2l0aCBsb2FkaW5nIHN0YXRlXG4gICAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBpZiAoIWxvYWRpbmcgJiYgIWRpc2FibGVkICYmIG9uQ2xpY2spIHtcbiAgICAgICAgICAgIG9uQ2xpY2soZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIFJlbmRlciBsb2FkaW5nIHNwaW5uZXJcbiAgICBjb25zdCByZW5kZXJMb2FkaW5nSWNvbiA9ICgpID0+IChfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcImFuaW1hdGUtc3BpblwiLCBzaXplOiAxNiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSk7XG4gICAgLy8gUmVuZGVyIGljb25cbiAgICBjb25zdCByZW5kZXJJY29uID0gKCkgPT4ge1xuICAgICAgICBpZiAobG9hZGluZylcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJMb2FkaW5nSWNvbigpO1xuICAgICAgICByZXR1cm4gaWNvbjtcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoXCJidXR0b25cIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBiYXNlQ2xhc3Nlcywgb25DbGljazogaGFuZGxlQ2xpY2ssIGRpc2FibGVkOiBkaXNhYmxlZCB8fCBsb2FkaW5nLCBcImFyaWEtYnVzeVwiOiBsb2FkaW5nLCBcImFyaWEtZGlzYWJsZWRcIjogZGlzYWJsZWQgfHwgbG9hZGluZywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMsIGNoaWxkcmVuOiBbaWNvblBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgcmVuZGVySWNvbigpICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJtci0yXCIsIGNoaWxkcmVuOiByZW5kZXJJY29uKCkgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgaWNvblBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIHJlbmRlckljb24oKSAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwibWwtMlwiLCBjaGlsZHJlbjogcmVuZGVySWNvbigpIH0pKV0gfSkpO1xufSk7XG5CdXR0b24uZGlzcGxheU5hbWUgPSAnQnV0dG9uJztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==