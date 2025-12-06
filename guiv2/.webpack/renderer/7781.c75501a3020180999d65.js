"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7781],{

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

/***/ 40391:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

/**
 * LoadingSpinner Component
 *
 * Simple loading spinner for inline loading states
 */



/**
 * LoadingSpinner component for inline loading states
 */
const LoadingSpinner = ({ size = 'md', className, 'data-cy': dataCy, }) => {
    // Size mappings
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Loader2 */ .krw, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('animate-spin text-blue-600 dark:text-blue-400', className), size: sizes[size], "data-cy": dataCy }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadingSpinner);


/***/ }),

/***/ 63683:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   S: () => (/* binding */ Checkbox)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const checkboxClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
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
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('text-sm font-medium', {
        'text-gray-700 dark:text-gray-200': !hasError && !disabled,
        'text-red-700 dark:text-red-400': hasError && !disabled,
        'text-gray-500 dark:text-gray-500': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('flex flex-col', className), children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center h-5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: checkboxRef, id: id, type: "checkbox", checked: checked, onChange: handleChange, disabled: disabled, className: "sr-only peer", "aria-invalid": hasError, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)({
                                    [errorId]: hasError,
                                    [descriptionId]: description,
                                }), "data-cy": dataCy }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(checkboxClasses, 'flex items-center justify-center cursor-pointer', {
                                    'cursor-not-allowed': disabled,
                                }), children: [checked && !indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Check */ .Jlk, { className: "h-4 w-4 text-white", strokeWidth: 3 })), indeterminate && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "h-0.5 w-3 bg-white rounded" }))] })] }), (label || description) && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "ml-3", children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { htmlFor: id, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(labelClasses, 'cursor-pointer'), children: label })), description && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: descriptionId, className: "text-sm text-gray-500 dark:text-gray-400 mt-0.5", children: description }))] }))] }), hasError && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { id: errorId, className: "mt-1 ml-8 text-sm text-red-600", role: "alert", "aria-live": "polite", children: error }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Checkbox);


/***/ }),

/***/ 87781:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72832);
/* harmony import */ var _components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(74160);
/* harmony import */ var _components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(63683);
/* harmony import */ var _components_molecules_ProgressBar__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(33523);
/* harmony import */ var _components_atoms_LoadingSpinner__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(40391);

/**
 * Setup Azure Prerequisites View
 *
 * A beautiful module management interface for PowerShell prerequisites.
 * Features:
 * - Visual dependency tracking with animated connections
 * - Real-time installation progress with step tracking
 * - Module version detection and conflict resolution
 * - Elevated permissions check with visual feedback
 * - Smart verification with retry capability
 * - Terminal-style logging with syntax highlighting
 */






// ============================================================================
// Module definitions
// ============================================================================
const POWERSHELL_MODULES = [
    {
        name: 'Microsoft.Graph',
        displayName: 'Microsoft Graph SDK',
        description: 'Microsoft Graph PowerShell SDK for accessing Microsoft 365 services',
        category: 'graph',
        version: '2.x',
        required: true,
        dependencies: ['Microsoft.Graph.Authentication'],
        size: '~50 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .GitBranch */ .ZrO, { className: "w-5 h-5" }),
    },
    {
        name: 'Microsoft.Graph.Authentication',
        displayName: 'Graph Authentication',
        description: 'Authentication module for Microsoft Graph SDK',
        category: 'graph',
        version: '2.x',
        required: true,
        dependencies: [],
        size: '~5 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Shield */ .ekZ, { className: "w-5 h-5" }),
    },
    {
        name: 'Az.Accounts',
        displayName: 'Azure Accounts',
        description: 'Azure Resource Manager authentication and account management',
        category: 'azure',
        version: '2.x',
        required: true,
        dependencies: [],
        size: '~15 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Cloud */ .Esr, { className: "w-5 h-5" }),
        conflictsWith: 'AzureRM',
    },
    {
        name: 'Az.Resources',
        displayName: 'Azure Resources',
        description: 'Azure Resource Manager cmdlets for managing resources',
        category: 'azure',
        version: '6.x',
        required: false,
        dependencies: ['Az.Accounts'],
        size: '~10 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Box */ .azJ, { className: "w-5 h-5" }),
    },
    {
        name: 'ExchangeOnlineManagement',
        displayName: 'Exchange Online',
        description: 'Exchange Online PowerShell V3 module for mailbox management',
        category: 'core',
        version: '3.x',
        required: true,
        dependencies: [],
        size: '~20 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Layers */ .zgK, { className: "w-5 h-5" }),
    },
    {
        name: 'MicrosoftTeams',
        displayName: 'Microsoft Teams',
        description: 'Manage Teams settings, channels, and policies',
        category: 'core',
        version: '5.x',
        required: false,
        dependencies: [],
        size: '~30 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Activity */ .Ilq, { className: "w-5 h-5" }),
    },
    {
        name: 'PnP.PowerShell',
        displayName: 'PnP PowerShell',
        description: 'Community-driven SharePoint and Microsoft 365 management',
        category: 'core',
        version: '2.x',
        required: false,
        dependencies: [],
        size: '~25 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Cpu */ .fX, { className: "w-5 h-5" }),
    },
    {
        name: 'MSAL.PS',
        displayName: 'MSAL PowerShell',
        description: 'Microsoft Authentication Library for PowerShell',
        category: 'utility',
        version: '4.x',
        required: false,
        dependencies: [],
        size: '~2 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Shield */ .ekZ, { className: "w-5 h-5" }),
    },
    {
        name: 'ImportExcel',
        displayName: 'ImportExcel',
        description: 'Import/Export Excel spreadsheets without Excel installed',
        category: 'utility',
        version: '7.x',
        required: false,
        dependencies: [],
        size: '~3 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .HardDrive */ .akk, { className: "w-5 h-5" }),
    },
    {
        name: 'PSWriteHTML',
        displayName: 'PSWriteHTML',
        description: 'Create beautiful HTML reports from PowerShell',
        category: 'utility',
        version: '1.x',
        required: false,
        dependencies: [],
        size: '~5 MB',
        icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Activity */ .Ilq, { className: "w-5 h-5" }),
    },
];
// ============================================================================
// Sub-components
// ============================================================================
/**
 * System requirements panel with visual indicators
 */
const SystemRequirementsPanel = ({ requirements, onRefresh, isChecking }) => {
    const items = [
        {
            label: 'PowerShell Version',
            value: requirements.powershellVersion.installed
                ? `${requirements.powershellVersion.installed} (requires ${requirements.powershellVersion.required}+)`
                : 'Checking...',
            met: requirements.powershellVersion.met,
            icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Terminal */ .BKt, { className: "w-4 h-4" }),
        },
        {
            label: 'Administrator Privileges',
            value: requirements.elevated === null
                ? 'Checking...'
                : requirements.elevated
                    ? 'Running as Administrator'
                    : 'Standard User (CurrentUser scope)',
            met: requirements.elevated,
            icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Shield */ .ekZ, { className: "w-4 h-4" }),
        },
        {
            label: 'Disk Space',
            value: `${requirements.diskSpace.available.toFixed(1)} GB available`,
            met: requirements.diskSpace.met,
            icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .HardDrive */ .akk, { className: "w-4 h-4" }),
        },
        {
            label: 'Network Access',
            value: requirements.networkAccess === null
                ? 'Checking...'
                : requirements.networkAccess
                    ? 'PowerShell Gallery accessible'
                    : 'Cannot reach PSGallery',
            met: requirements.networkAccess,
            icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Activity */ .Ilq, { className: "w-4 h-4" }),
        },
    ];
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Settings */ .wB_, { className: "w-5 h-5 text-purple-500" }), "System Requirements"] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "ghost", size: "sm", onClick: onRefresh, loading: isChecking, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .RefreshCw */ .e9t, { className: "w-4 h-4" }), children: "Refresh" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "grid grid-cols-2 gap-4", children: items.map((item) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `
              p-4 rounded-lg border-2 transition-all duration-300
              ${item.met === null
                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                        : item.met
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                            : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'}
            `, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: item.met === null
                                        ? 'text-gray-500 dark:text-gray-400'
                                        : item.met
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-yellow-600 dark:text-yellow-400', children: item.icon }), item.met === null ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_LoadingSpinner__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { size: "sm" })) : item.met ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .CheckCircle */ .rAV, { className: "w-5 h-5 text-green-500" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertTriangle */ .hcu, { className: "w-5 h-5 text-yellow-500" }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: item.label }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1", children: item.value })] }, item.label))) })] }));
};
/**
 * Module card with status indicator and controls
 */
const ModuleCard = ({ module, selected, onToggle, onInstall, expanded, onExpand, disabled }) => {
    const getStatusBadge = () => {
        switch (module.status) {
            case 'installed':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Check */ .Jlk, { className: "w-3 h-3" }), "Installed"] }));
            case 'outdated':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertTriangle */ .hcu, { className: "w-3 h-3" }), "Update Available"] }));
            case 'not_installed':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.X, { className: "w-3 h-3" }), "Not Installed"] }));
            case 'installing':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Loader2 */ .krw, { className: "w-3 h-3 animate-spin" }), "Installing"] }));
            case 'checking':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Loader2 */ .krw, { className: "w-3 h-3 animate-spin" }), "Checking"] }));
            case 'error':
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertCircle */ .RIJ, { className: "w-3 h-3" }), "Error"] }));
            default:
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full", children: "Unknown" }));
        }
    };
    const getCategoryColor = () => {
        switch (module.category) {
            case 'graph':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'azure':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            case 'core':
                return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
        }
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `
        group rounded-xl border-2 transition-all duration-300
        ${selected
            ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}
      `, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "pt-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__/* .Checkbox */ .S, { checked: selected, onChange: () => onToggle(), disabled: module.required || module.status === 'installing' || module.status === 'installed' || disabled }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `p-3 rounded-xl ${getCategoryColor()} transition-transform group-hover:scale-110 cursor-pointer`, onClick: onExpand, children: module.icon }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: onExpand, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 flex-wrap", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h4", { className: "font-semibold text-gray-900 dark:text-white", children: module.displayName }), module.required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded", children: "Required" })), getStatusBadge()] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: module.description }), module.errorMessage && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertCircle */ .RIJ, { className: "w-4 h-4" }), module.errorMessage] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Package */ .lPX, { className: "w-3 h-3" }), module.installedVersion ? `v${module.installedVersion}` : module.version] }), module.size && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .HardDrive */ .akk, { className: "w-3 h-3" }), module.size] })), module.dependencies.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .GitBranch */ .ZrO, { className: "w-3 h-3" }), module.dependencies.length, " dep", module.dependencies.length > 1 ? 's' : ''] }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [module.status === 'not_installed' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "primary", size: "sm", onClick: onInstall, disabled: disabled, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Download */ .f5X, { className: "w-4 h-4" }), children: "Install" })), module.status === 'outdated' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "secondary", size: "sm", onClick: onInstall, disabled: disabled, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .RefreshCw */ .e9t, { className: "w-4 h-4" }), children: "Update" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onExpand, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: expanded ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ChevronDown */ .yQN, { className: "w-4 h-4" }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ChevronRight */ .c_$, { className: "w-4 h-4" }) })] })] }), expanded && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-4 pt-4 border-t border-gray-200 dark:border-gray-700", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Category:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "ml-2 text-gray-900 dark:text-white capitalize", children: module.category })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Module Name:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("code", { className: "ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 text-xs", children: module.name })] }), module.dependencies.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "col-span-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: "Dependencies:" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex flex-wrap gap-2 mt-1", children: module.dependencies.map((dep) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded", children: dep }, dep))) })] })), module.conflictsWith && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "col-span-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-yellow-600 dark:text-yellow-400 flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertTriangle */ .hcu, { className: "w-4 h-4" }), "Conflicts with: ", module.conflictsWith] }) }))] }) }))] }) }));
};
/**
 * Terminal-style log viewer
 */
const LogViewer = ({ logs, onClear }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-400';
            case 'warning':
                return 'text-yellow-400';
            case 'error':
                return 'text-red-400';
            default:
                return 'text-gray-300';
        }
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-gray-900 rounded-lg overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-1.5", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-red-500" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-3 h-3 rounded-full bg-green-500" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-400 ml-2", children: "Installation Log" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClear, className: "p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors", title: "Clear logs", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Trash2 */ .TBR, { className: "w-4 h-4" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-4 max-h-64 overflow-auto font-mono text-sm", children: logs.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-500", children: "$ Waiting for operations..." })) : (logs.map((log) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `py-0.5 ${getStatusColor(log.status)}`, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-gray-500", children: ["[", new Date(log.timestamp).toLocaleTimeString(), "]"] }), ' ', (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-cyan-400", children: ["[", log.module, "]"] }), ' ', (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-purple-400", children: log.action }), ":", ' ', log.message, log.duration && (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-gray-500", children: [" (", (log.duration / 1000).toFixed(1), "s)"] })] }, log.id)))) })] }));
};
// ============================================================================
// Main Component
// ============================================================================
const SetupAzurePrerequisitesView = () => {
    // Module state
    const [modules, setModules] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => POWERSHELL_MODULES.map((m) => ({ ...m, status: 'unknown', installedVersion: undefined, errorMessage: undefined })));
    const [selectedModules, setSelectedModules] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(() => new Set(POWERSHELL_MODULES.filter((m) => m.required).map((m) => m.name)));
    const [expandedModule, setExpandedModule] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    // System requirements
    const [requirements, setRequirements] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        powershellVersion: { required: '5.1', installed: null, met: null },
        elevated: null,
        diskSpace: { required: 0.5, available: 100, met: true },
        networkAccess: null,
    });
    const [isCheckingRequirements, setIsCheckingRequirements] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    // Process state
    const [isInstalling, setIsInstalling] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [isVerifying, setIsVerifying] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [overallProgress, setOverallProgress] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
    const [setupComplete, setSetupComplete] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    // Logs
    const [logs, setLogs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [showLogs, setShowLogs] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    // Filter state
    const [categoryFilter, setCategoryFilter] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('all');
    const [searchQuery, setSearchQuery] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    // Add log entry
    const addLog = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((module, action, status, message, duration) => {
        const newLog = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            module,
            action,
            status,
            message,
            duration,
        };
        setLogs((prev) => [...prev, newLog]);
    }, []);
    // Check system requirements
    const checkRequirements = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsCheckingRequirements(true);
        addLog('System', 'Check', 'info', 'Checking system requirements...');
        try {
            // Check admin rights
            if (window.electronAPI?.executeScript) {
                const adminResult = await window.electronAPI.executeScript({
                    script: `
            $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
            $principal = New-Object Security.Principal.WindowsPrincipal $identity
            $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
            @{ IsAdmin = $isAdmin } | ConvertTo-Json
          `,
                    timeout: 10000,
                });
                if (adminResult.success && adminResult.data) {
                    const parsed = typeof adminResult.data === 'string' ? JSON.parse(adminResult.data) : adminResult.data;
                    setRequirements((prev) => ({ ...prev, elevated: parsed.IsAdmin }));
                    addLog('System', 'AdminCheck', parsed.IsAdmin ? 'success' : 'warning', parsed.IsAdmin ? 'Running with administrator privileges' : 'Running without admin (CurrentUser scope)');
                }
                // Check PowerShell version
                const versionResult = await window.electronAPI.executeScript({
                    script: `$PSVersionTable.PSVersion.ToString()`,
                    timeout: 10000,
                });
                if (versionResult.success && versionResult.data) {
                    const version = versionResult.data.toString().trim();
                    const majorVersion = parseFloat(version.split('.')[0]);
                    setRequirements((prev) => ({
                        ...prev,
                        powershellVersion: {
                            ...prev.powershellVersion,
                            installed: version,
                            met: majorVersion >= 5.1,
                        },
                    }));
                    addLog('System', 'VersionCheck', 'info', `PowerShell version: ${version}`);
                }
            }
            else {
                // Simulated for development
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setRequirements((prev) => ({
                    ...prev,
                    powershellVersion: { required: '5.1', installed: '7.3.4', met: true },
                    elevated: true,
                    networkAccess: navigator.onLine,
                }));
                addLog('System', 'Check', 'success', 'Environment check complete (simulated)');
            }
            // Check network
            setRequirements((prev) => ({ ...prev, networkAccess: navigator.onLine }));
            // Check completion flag
            if (window.electronAPI?.getConfig) {
                const completedFlag = await window.electronAPI.getConfig('azurePrerequisitesCompleted');
                setSetupComplete(!!completedFlag);
            }
        }
        catch (error) {
            addLog('System', 'Check', 'error', `Environment check failed: ${error.message}`);
        }
        finally {
            setIsCheckingRequirements(false);
        }
    }, [addLog]);
    // Verify module status
    const verifyModules = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsVerifying(true);
        addLog('Modules', 'Verify', 'info', 'Checking installed modules...');
        const updatedModules = [...modules];
        let installedCount = 0;
        for (let i = 0; i < updatedModules.length; i++) {
            const module = updatedModules[i];
            module.status = 'checking';
            setModules([...updatedModules]);
            try {
                if (window.electronAPI?.executeScript) {
                    const result = await window.electronAPI.executeScript({
                        script: `
              $module = Get-Module -ListAvailable -Name '${module.name}' | Select-Object -First 1
              if ($module) {
                @{ Installed = $true; Version = $module.Version.ToString() } | ConvertTo-Json
              } else {
                @{ Installed = $false } | ConvertTo-Json
              }
            `,
                        timeout: 30000,
                    });
                    if (result.success && result.data) {
                        const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
                        module.status = parsed.Installed ? 'installed' : 'not_installed';
                        module.installedVersion = parsed.Version;
                        if (parsed.Installed) {
                            installedCount++;
                            addLog(module.name, 'Verify', 'success', `Installed (v${parsed.Version})`);
                        }
                        else {
                            addLog(module.name, 'Verify', 'info', 'Not installed');
                        }
                    }
                }
                else {
                    // Simulated for development
                    await new Promise((resolve) => setTimeout(resolve, 200));
                    const isInstalled = Math.random() > 0.4;
                    module.status = isInstalled ? 'installed' : 'not_installed';
                    module.installedVersion = isInstalled ? module.version : undefined;
                    if (isInstalled)
                        installedCount++;
                }
            }
            catch (error) {
                module.status = 'error';
                module.errorMessage = error.message;
                addLog(module.name, 'Verify', 'error', error.message);
            }
            setModules([...updatedModules]);
            setOverallProgress(((i + 1) / updatedModules.length) * 100);
        }
        addLog('Modules', 'Verify', 'success', `Verification complete: ${installedCount}/${updatedModules.length} installed`);
        setIsVerifying(false);
        setOverallProgress(0);
    }, [modules, addLog]);
    // Toggle module selection
    const toggleModule = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((name) => {
        setSelectedModules((prev) => {
            const next = new Set(prev);
            if (next.has(name)) {
                next.delete(name);
            }
            else {
                next.add(name);
            }
            return next;
        });
    }, []);
    // Install single module
    const installModule = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async (moduleName) => {
        const module = modules.find((m) => m.name === moduleName);
        if (!module)
            return;
        setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installing', errorMessage: undefined } : m)));
        addLog(moduleName, 'Install', 'info', 'Starting installation...');
        const startTime = Date.now();
        try {
            if (window.electronAPI?.executeScript) {
                const result = await window.electronAPI.executeScript({
                    script: `
            try {
              Install-Module -Name '${moduleName}' -Force -AllowClobber -Scope CurrentUser -ErrorAction Stop
              @{ Success = $true } | ConvertTo-Json
            } catch {
              @{ Success = $false; Error = $_.Exception.Message } | ConvertTo-Json
            }
          `,
                    timeout: 300000,
                });
                const duration = Date.now() - startTime;
                if (result.success) {
                    const parsed = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
                    if (parsed.Success) {
                        setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installed', installedVersion: m.version } : m)));
                        addLog(moduleName, 'Install', 'success', 'Installed successfully', duration);
                    }
                    else {
                        setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'error', errorMessage: parsed.Error } : m)));
                        addLog(moduleName, 'Install', 'error', parsed.Error || 'Installation failed', duration);
                    }
                }
            }
            else {
                // Simulated for development
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const duration = Date.now() - startTime;
                setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'installed', installedVersion: m.version } : m)));
                addLog(moduleName, 'Install', 'success', 'Installed successfully (simulated)', duration);
            }
        }
        catch (error) {
            const duration = Date.now() - startTime;
            setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, status: 'error', errorMessage: error.message } : m)));
            addLog(moduleName, 'Install', 'error', error.message, duration);
        }
    }, [modules, addLog]);
    // Install all selected modules
    const installSelectedModules = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsInstalling(true);
        setOverallProgress(0);
        const toInstall = modules.filter((m) => selectedModules.has(m.name) && m.status !== 'installed');
        addLog('Installation', 'Start', 'info', `Installing ${toInstall.length} module(s)...`);
        for (let i = 0; i < toInstall.length; i++) {
            await installModule(toInstall[i].name);
            setOverallProgress(((i + 1) / toInstall.length) * 100);
        }
        // Check if all required modules are installed
        const allRequiredInstalled = modules.filter((m) => m.required).every((m) => m.status === 'installed');
        if (allRequiredInstalled) {
            if (window.electronAPI?.setConfig) {
                await window.electronAPI.setConfig('azurePrerequisitesCompleted', true);
            }
            setSetupComplete(true);
            addLog('Installation', 'Complete', 'success', 'All required prerequisites installed');
        }
        setIsInstalling(false);
        setOverallProgress(0);
        setSelectedModules(new Set(POWERSHELL_MODULES.filter((m) => m.required).map((m) => m.name)));
    }, [modules, selectedModules, installModule, addLog]);
    // Filter modules
    const filteredModules = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        return modules.filter((m) => {
            const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
            const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [modules, categoryFilter, searchQuery]);
    // Summary stats
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const installed = modules.filter((m) => m.status === 'installed').length;
        const required = modules.filter((m) => m.required).length;
        const requiredInstalled = modules.filter((m) => m.required && m.status === 'installed').length;
        return { installed, total: modules.length, required, requiredInstalled };
    }, [modules]);
    // Initial check
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        checkRequirements();
        verifyModules();
    }, []);
    const allRequirementsMet = requirements.powershellVersion.met !== false && requirements.networkAccess !== false;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950", "data-cy": "setup-prerequisites-view", "data-testid": "setup-prerequisites-view", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between max-w-7xl mx-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Package */ .lPX, { className: "w-6 h-6 text-white" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Azure Prerequisites" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "PowerShell Module Manager" })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [setupComplete && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .CheckCircle */ .rAV, { className: "w-4 h-4" }), "Complete"] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "secondary", onClick: verifyModules, loading: isVerifying, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Search */ .vji, { className: "w-4 h-4" }), children: "Verify All" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "primary", onClick: installSelectedModules, disabled: isInstalling || !allRequirementsMet || selectedModules.size === 0, loading: isInstalling, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Download */ .f5X, { className: "w-4 h-4" }), children: ["Install Selected (", selectedModules.size, ")"] })] })] }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex-1 overflow-auto py-6", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "max-w-7xl mx-auto px-6 space-y-6", children: [setupComplete && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-2 bg-green-500 rounded-full", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .CheckCircle */ .rAV, { className: "w-5 h-5 text-white" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-green-800 dark:text-green-200", children: "Prerequisites Complete!" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-green-700 dark:text-green-300", children: "All required PowerShell modules have been installed successfully." })] })] }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "grid grid-cols-4 gap-4", children: [
                                { label: 'Total Modules', value: stats.total, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Package */ .lPX, { className: "w-5 h-5" }), color: 'blue' },
                                { label: 'Installed', value: stats.installed, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .CheckCircle */ .rAV, { className: "w-5 h-5" }), color: 'green' },
                                { label: 'Required', value: `${stats.requiredInstalled}/${stats.required}`, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .AlertTriangle */ .hcu, { className: "w-5 h-5" }), color: 'yellow' },
                                { label: 'Selected', value: selectedModules.size, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Check */ .Jlk, { className: "w-5 h-5" }), color: 'purple' },
                            ].map((stat) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`, children: stat.icon }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stat.value }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: stat.label })] })] }) }, stat.label))) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(SystemRequirementsPanel, { requirements: requirements, onRefresh: checkRequirements, isChecking: isCheckingRequirements }), (isInstalling || isVerifying) && overallProgress > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "font-medium text-gray-900 dark:text-white", children: isInstalling ? 'Installing modules...' : 'Verifying modules...' }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-sm font-bold text-blue-600 dark:text-blue-400", children: [Math.round(overallProgress), "%"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_molecules_ProgressBar__WEBPACK_IMPORTED_MODULE_5__/* .ProgressBar */ .z, { value: overallProgress, max: 100, variant: "info", size: "lg", animated: true, striped: true })] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "PowerShell Modules" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Search */ .vji, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", placeholder: "Search modules...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: ['all', 'graph', 'azure', 'core', 'utility'].map((cat) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: () => setCategoryFilter(cat), className: `px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${categoryFilter === cat
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`, children: cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1) }, cat))) })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: filteredModules.map((module) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ModuleCard, { module: module, selected: selectedModules.has(module.name), onToggle: () => toggleModule(module.name), onInstall: () => installModule(module.name), expanded: expandedModule === module.name, onExpand: () => setExpandedModule(expandedModule === module.name ? null : module.name), disabled: isInstalling || isVerifying }, module.name))) }), filteredModules.length === 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-center py-12", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Package */ .lPX, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No modules found" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Try adjusting your search or filter criteria." })] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { onClick: () => setShowLogs(!showLogs), className: "w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Terminal */ .BKt, { className: "w-5 h-5 text-green-500" }), "Installation Logs", logs.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full", children: logs.length }))] }), showLogs ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ChevronDown */ .yQN, { className: "w-5 h-5" }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ChevronRight */ .c_$, { className: "w-5 h-5" })] }), showLogs && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "px-6 pb-6", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(LogViewer, { logs: logs, onClear: () => setLogs([]) }) }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Info */ .R2D, { className: "w-6 h-6 text-blue-500 flex-shrink-0" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-blue-800 dark:text-blue-200 mb-2", children: "Need Help?" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-blue-700 dark:text-blue-300 mb-3", children: "These modules are required for the M&A Discovery Suite to function properly. Required modules are automatically selected and cannot be deselected." }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("a", { href: "https://docs.microsoft.com/powershell/microsoftgraph/", target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ExternalLink */ .GrD, { className: "w-4 h-4" }), "Microsoft Graph Docs"] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("a", { href: "https://www.powershellgallery.com/", target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .ExternalLink */ .GrD, { className: "w-4 h-4" }), "PowerShell Gallery"] })] })] })] }) })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SetupAzurePrerequisitesView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUEwRyxJQUFJLElBQUksdURBQUssVUFBVSwwSEFBMEgsdURBQUssYUFBYSwwTEFBMEwsdURBQUssU0FBUyxxR0FBcUcsc0RBQUksQ0FBQyw2REFBUSxJQUFJLHFDQUFxQyw0Q0FBNEMsc0RBQUksV0FBVyxvSUFBb0ksS0FBSyxjQUFjLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSxzQkFBc0IsSUFBSSxzREFBSSxDQUFDLGlFQUFZLElBQUksc0JBQXNCLElBQUksZ0JBQWdCLHNEQUFJLFVBQVUsa0NBQWtDLHNEQUFJLGNBQWMsd0NBQXdDLEdBQUcsS0FBSyxHQUFHLHNEQUFJLFVBQVUsa0hBQWtILHVEQUFLLFVBQVUsZ0RBQWdELHNEQUFJLENBQUMseURBQUksSUFBSSxrREFBa0QsR0FBRyx1REFBSyxVQUFVLFdBQVcsc0RBQUksU0FBUywwRkFBMEYsR0FBRyxzREFBSSxRQUFRLDROQUE0TixHQUFHLHVEQUFLLFVBQVUsaURBQWlELHVEQUFLLFFBQVEsdU5BQXVOLHNEQUFJLENBQUMsaUVBQVksSUFBSSxzQkFBc0IsNEJBQTRCLEdBQUcsdURBQUssUUFBUSxvTUFBb00sc0RBQUksQ0FBQyxpRUFBWSxJQUFJLHNCQUFzQiwwQkFBMEIsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSTtBQUN6eUc7QUFDQSxpRUFBZSwyQkFBMkIsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1Byb2dyZXNzQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0xvYWRpbmdTcGlubmVyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0NoZWNrYm94LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9zZXR1cC9TZXR1cEF6dXJlUHJlcmVxdWlzaXRlc1ZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICpcbiAqIFByb2dyZXNzIGluZGljYXRvciB3aXRoIHBlcmNlbnRhZ2UgZGlzcGxheSBhbmQgb3B0aW9uYWwgbGFiZWwuXG4gKiBTdXBwb3J0cyBkaWZmZXJlbnQgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFByb2dyZXNzQmFyID0gKHsgdmFsdWUsIG1heCA9IDEwMCwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIHNob3dMYWJlbCA9IHRydWUsIGxhYmVsLCBsYWJlbFBvc2l0aW9uID0gJ2luc2lkZScsIHN0cmlwZWQgPSBmYWxzZSwgYW5pbWF0ZWQgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIENhbGN1bGF0ZSBwZXJjZW50YWdlXG4gICAgY29uc3QgcGVyY2VudGFnZSA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgKHZhbHVlIC8gbWF4KSAqIDEwMCkpO1xuICAgIC8vIFZhcmlhbnQgY29sb3JzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTYwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi02MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTYwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC02MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi02MDAnLFxuICAgIH07XG4gICAgLy8gQmFja2dyb3VuZCBjb2xvcnNcbiAgICBjb25zdCBiZ0NsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ibHVlLTEwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC0yJyxcbiAgICAgICAgbWQ6ICdoLTQnLFxuICAgICAgICBsZzogJ2gtNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgndy1mdWxsJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCB0cmFja0NsYXNzZXMgPSBjbHN4KCd3LWZ1bGwgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlbicsIGJnQ2xhc3Nlc1t2YXJpYW50XSwgc2l6ZUNsYXNzZXNbc2l6ZV0pO1xuICAgIGNvbnN0IGJhckNsYXNzZXMgPSBjbHN4KCdoLWZ1bGwgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIGVhc2Utb3V0JywgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIHtcbiAgICAgICAgLy8gU3RyaXBlZCBwYXR0ZXJuXG4gICAgICAgICdiZy1ncmFkaWVudC10by1yIGZyb20tdHJhbnNwYXJlbnQgdmlhLWJsYWNrLzEwIHRvLXRyYW5zcGFyZW50IGJnLVtsZW5ndGg6MXJlbV8xMDAlXSc6IHN0cmlwZWQsXG4gICAgICAgICdhbmltYXRlLXByb2dyZXNzLXN0cmlwZXMnOiBzdHJpcGVkICYmIGFuaW1hdGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsVGV4dCA9IGxhYmVsIHx8IChzaG93TGFiZWwgPyBgJHtNYXRoLnJvdW5kKHBlcmNlbnRhZ2UpfSVgIDogJycpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdvdXRzaWRlJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiB0cmFja0NsYXNzZXMsIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXCJhcmlhLXZhbHVlbm93XCI6IHZhbHVlLCBcImFyaWEtdmFsdWVtaW5cIjogMCwgXCJhcmlhLXZhbHVlbWF4XCI6IG1heCwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGJhckNsYXNzZXMsIHN0eWxlOiB7IHdpZHRoOiBgJHtwZXJjZW50YWdlfSVgIH0sIGNoaWxkcmVuOiBsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ2luc2lkZScgJiYgc2l6ZSAhPT0gJ3NtJyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgcHgtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtd2hpdGUgd2hpdGVzcGFjZS1ub3dyYXBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSkgfSkgfSldIH0pKTtcbn07XG4vLyBBZGQgYW5pbWF0aW9uIGZvciBzdHJpcGVkIHByb2dyZXNzIGJhcnNcbmNvbnN0IHN0eWxlcyA9IGBcclxuQGtleWZyYW1lcyBwcm9ncmVzcy1zdHJpcGVzIHtcclxuICBmcm9tIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDFyZW0gMDtcclxuICB9XHJcbiAgdG8ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAwO1xyXG4gIH1cclxufVxyXG5cclxuLmFuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgYW5pbWF0aW9uOiBwcm9ncmVzcy1zdHJpcGVzIDFzIGxpbmVhciBpbmZpbml0ZTtcclxufVxyXG5gO1xuLy8gSW5qZWN0IHN0eWxlc1xuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmVzcy1iYXItc3R5bGVzJykpIHtcbiAgICBjb25zdCBzdHlsZVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZVNoZWV0LmlkID0gJ3Byb2dyZXNzLWJhci1zdHlsZXMnO1xuICAgIHN0eWxlU2hlZXQudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVNoZWV0KTtcbn1cbmV4cG9ydCBkZWZhdWx0IFByb2dyZXNzQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgQ29tcG9uZW50XG4gKlxuICogU2ltcGxlIGxvYWRpbmcgc3Bpbm5lciBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBMb2FkZXIyIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgY29tcG9uZW50IGZvciBpbmxpbmUgbG9hZGluZyBzdGF0ZXNcbiAqL1xuY29uc3QgTG9hZGluZ1NwaW5uZXIgPSAoeyBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFNpemUgbWFwcGluZ3NcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206IDE2LFxuICAgICAgICBtZDogMjQsXG4gICAgICAgIGxnOiAzMixcbiAgICAgICAgeGw6IDQ4LFxuICAgIH07XG4gICAgcmV0dXJuIChfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhbmltYXRlLXNwaW4gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLCBjbGFzc05hbWUpLCBzaXplOiBzaXplc1tzaXplXSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NwaW5uZXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqXG4gKiBGdWxseSBhY2Nlc3NpYmxlIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGxhYmVscyBhbmQgZXJyb3Igc3RhdGVzLlxuICogRm9sbG93cyBXQ0FHIDIuMSBBQSBndWlkZWxpbmVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGVjayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQ2hlY2tib3ggPSAoeyBsYWJlbCwgZGVzY3JpcHRpb24sIGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGVycm9yLCBkaXNhYmxlZCA9IGZhbHNlLCBpbmRldGVybWluYXRlID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgZGVzY3JpcHRpb25JZCA9IGAke2lkfS1kZXNjcmlwdGlvbmA7XG4gICAgY29uc3QgaGFzRXJyb3IgPSBCb29sZWFuKGVycm9yKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgaW5kZXRlcm1pbmF0ZSB2aWEgcmVmXG4gICAgY29uc3QgY2hlY2tib3hSZWYgPSBSZWFjdC51c2VSZWYobnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNoZWNrYm94UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNoZWNrYm94UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9LCBbaW5kZXRlcm1pbmF0ZV0pO1xuICAgIGNvbnN0IGNoZWNrYm94Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaC01IHctNSByb3VuZGVkIGJvcmRlci0yJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGFyazpyaW5nLW9mZnNldC1ncmF5LTkwMCcsIFxuICAgIC8vIFN0YXRlLWJhc2VkIHN0eWxlc1xuICAgIHtcbiAgICAgICAgLy8gTm9ybWFsIHN0YXRlICh1bmNoZWNrZWQpXG4gICAgICAgICdib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS01MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQgJiYgIWNoZWNrZWQsXG4gICAgICAgICdmb2N1czpyaW5nLWJsdWUtNTAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gQ2hlY2tlZCBzdGF0ZVxuICAgICAgICAnYmctYmx1ZS02MDAgYm9yZGVyLWJsdWUtNjAwIGRhcms6YmctYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS01MDAnOiBjaGVja2VkICYmICFkaXNhYmxlZCAmJiAhaGFzRXJyb3IsXG4gICAgICAgIC8vIEVycm9yIHN0YXRlXG4gICAgICAgICdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC02MDAgZGFyazpib3JkZXItcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktODAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ3RleHQtc20gZm9udC1tZWRpdW0nLCB7XG4gICAgICAgICd0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wnLCBjbGFzc05hbWUpLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBoLTVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGNoZWNrYm94UmVmLCBpZDogaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogY2hlY2tlZCwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IFwic3Itb25seSBwZWVyXCIsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXJyb3JJZF06IGhhc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uSWRdOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSksIF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGNoZWNrYm94Q2xhc3NlcywgJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1wb2ludGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgY2hpbGRyZW46IFtjaGVja2VkICYmICFpbmRldGVybWluYXRlICYmIChfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00IHRleHQtd2hpdGVcIiwgc3Ryb2tlV2lkdGg6IDMgfSkpLCBpbmRldGVybWluYXRlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMC41IHctMyBiZy13aGl0ZSByb3VuZGVkXCIgfSkpXSB9KV0gfSksIChsYWJlbCB8fCBkZXNjcmlwdGlvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1sLTNcIiwgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChsYWJlbENsYXNzZXMsICdjdXJzb3ItcG9pbnRlcicpLCBjaGlsZHJlbjogbGFiZWwgfSkpLCBkZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBpZDogZGVzY3JpcHRpb25JZCwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMC41XCIsIGNoaWxkcmVuOiBkZXNjcmlwdGlvbiB9KSldIH0pKV0gfSksIGhhc0Vycm9yICYmIChfanN4KFwicFwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IFwibXQtMSBtbC04IHRleHQtc20gdGV4dC1yZWQtNjAwXCIsIHJvbGU6IFwiYWxlcnRcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGVycm9yIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2V0dXAgQXp1cmUgUHJlcmVxdWlzaXRlcyBWaWV3XG4gKlxuICogQSBiZWF1dGlmdWwgbW9kdWxlIG1hbmFnZW1lbnQgaW50ZXJmYWNlIGZvciBQb3dlclNoZWxsIHByZXJlcXVpc2l0ZXMuXG4gKiBGZWF0dXJlczpcbiAqIC0gVmlzdWFsIGRlcGVuZGVuY3kgdHJhY2tpbmcgd2l0aCBhbmltYXRlZCBjb25uZWN0aW9uc1xuICogLSBSZWFsLXRpbWUgaW5zdGFsbGF0aW9uIHByb2dyZXNzIHdpdGggc3RlcCB0cmFja2luZ1xuICogLSBNb2R1bGUgdmVyc2lvbiBkZXRlY3Rpb24gYW5kIGNvbmZsaWN0IHJlc29sdXRpb25cbiAqIC0gRWxldmF0ZWQgcGVybWlzc2lvbnMgY2hlY2sgd2l0aCB2aXN1YWwgZmVlZGJhY2tcbiAqIC0gU21hcnQgdmVyaWZpY2F0aW9uIHdpdGggcmV0cnkgY2FwYWJpbGl0eVxuICogLSBUZXJtaW5hbC1zdHlsZSBsb2dnaW5nIHdpdGggc3ludGF4IGhpZ2hsaWdodGluZ1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQYWNrYWdlLCBDaGVjaywgWCwgQWxlcnRUcmlhbmdsZSwgUmVmcmVzaEN3LCBEb3dubG9hZCwgU2hpZWxkLCBDaGVja0NpcmNsZSwgQWxlcnRDaXJjbGUsIEluZm8sIENoZXZyb25Eb3duLCBDaGV2cm9uUmlnaHQsIEV4dGVybmFsTGluaywgVGVybWluYWwsIENwdSwgQm94LCBMYXllcnMsIEdpdEJyYW5jaCwgSGFyZERyaXZlLCBBY3Rpdml0eSwgU2V0dGluZ3MsIFNlYXJjaCwgQ2xvdWQsIExvYWRlcjIsIFRyYXNoMiwgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgQ2hlY2tib3ggfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0NoZWNrYm94JztcbmltcG9ydCB7IFByb2dyZXNzQmFyIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXInO1xuaW1wb3J0IExvYWRpbmdTcGlubmVyIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvTG9hZGluZ1NwaW5uZXInO1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTW9kdWxlIGRlZmluaXRpb25zXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jb25zdCBQT1dFUlNIRUxMX01PRFVMRVMgPSBbXG4gICAge1xuICAgICAgICBuYW1lOiAnTWljcm9zb2Z0LkdyYXBoJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdNaWNyb3NvZnQgR3JhcGggU0RLJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdNaWNyb3NvZnQgR3JhcGggUG93ZXJTaGVsbCBTREsgZm9yIGFjY2Vzc2luZyBNaWNyb3NvZnQgMzY1IHNlcnZpY2VzJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdncmFwaCcsXG4gICAgICAgIHZlcnNpb246ICcyLngnLFxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbJ01pY3Jvc29mdC5HcmFwaC5BdXRoZW50aWNhdGlvbiddLFxuICAgICAgICBzaXplOiAnfjUwIE1CJyxcbiAgICAgICAgaWNvbjogX2pzeChHaXRCcmFuY2gsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ01pY3Jvc29mdC5HcmFwaC5BdXRoZW50aWNhdGlvbicsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnR3JhcGggQXV0aGVudGljYXRpb24nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0F1dGhlbnRpY2F0aW9uIG1vZHVsZSBmb3IgTWljcm9zb2Z0IEdyYXBoIFNESycsXG4gICAgICAgIGNhdGVnb3J5OiAnZ3JhcGgnLFxuICAgICAgICB2ZXJzaW9uOiAnMi54JyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHNpemU6ICd+NSBNQicsXG4gICAgICAgIGljb246IF9qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdBei5BY2NvdW50cycsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnQXp1cmUgQWNjb3VudHMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0F6dXJlIFJlc291cmNlIE1hbmFnZXIgYXV0aGVudGljYXRpb24gYW5kIGFjY291bnQgbWFuYWdlbWVudCcsXG4gICAgICAgIGNhdGVnb3J5OiAnYXp1cmUnLFxuICAgICAgICB2ZXJzaW9uOiAnMi54JyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHNpemU6ICd+MTUgTUInLFxuICAgICAgICBpY29uOiBfanN4KENsb3VkLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgICAgIGNvbmZsaWN0c1dpdGg6ICdBenVyZVJNJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ0F6LlJlc291cmNlcycsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnQXp1cmUgUmVzb3VyY2VzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBenVyZSBSZXNvdXJjZSBNYW5hZ2VyIGNtZGxldHMgZm9yIG1hbmFnaW5nIHJlc291cmNlcycsXG4gICAgICAgIGNhdGVnb3J5OiAnYXp1cmUnLFxuICAgICAgICB2ZXJzaW9uOiAnNi54JyxcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFsnQXouQWNjb3VudHMnXSxcbiAgICAgICAgc2l6ZTogJ34xMCBNQicsXG4gICAgICAgIGljb246IF9qc3goQm94LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdFeGNoYW5nZU9ubGluZU1hbmFnZW1lbnQnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ0V4Y2hhbmdlIE9ubGluZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRXhjaGFuZ2UgT25saW5lIFBvd2VyU2hlbGwgVjMgbW9kdWxlIGZvciBtYWlsYm94IG1hbmFnZW1lbnQnLFxuICAgICAgICBjYXRlZ29yeTogJ2NvcmUnLFxuICAgICAgICB2ZXJzaW9uOiAnMy54JyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHNpemU6ICd+MjAgTUInLFxuICAgICAgICBpY29uOiBfanN4KExheWVycywgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnTWljcm9zb2Z0VGVhbXMnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ01pY3Jvc29mdCBUZWFtcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTWFuYWdlIFRlYW1zIHNldHRpbmdzLCBjaGFubmVscywgYW5kIHBvbGljaWVzJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdjb3JlJyxcbiAgICAgICAgdmVyc2lvbjogJzUueCcsXG4gICAgICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgc2l6ZTogJ34zMCBNQicsXG4gICAgICAgIGljb246IF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ1BuUC5Qb3dlclNoZWxsJyxcbiAgICAgICAgZGlzcGxheU5hbWU6ICdQblAgUG93ZXJTaGVsbCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbXVuaXR5LWRyaXZlbiBTaGFyZVBvaW50IGFuZCBNaWNyb3NvZnQgMzY1IG1hbmFnZW1lbnQnLFxuICAgICAgICBjYXRlZ29yeTogJ2NvcmUnLFxuICAgICAgICB2ZXJzaW9uOiAnMi54JyxcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFtdLFxuICAgICAgICBzaXplOiAnfjI1IE1CJyxcbiAgICAgICAgaWNvbjogX2pzeChDcHUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgbmFtZTogJ01TQUwuUFMnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ01TQUwgUG93ZXJTaGVsbCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTWljcm9zb2Z0IEF1dGhlbnRpY2F0aW9uIExpYnJhcnkgZm9yIFBvd2VyU2hlbGwnLFxuICAgICAgICBjYXRlZ29yeTogJ3V0aWxpdHknLFxuICAgICAgICB2ZXJzaW9uOiAnNC54JyxcbiAgICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxuICAgICAgICBkZXBlbmRlbmNpZXM6IFtdLFxuICAgICAgICBzaXplOiAnfjIgTUInLFxuICAgICAgICBpY29uOiBfanN4KFNoaWVsZCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLFxuICAgIH0sXG4gICAge1xuICAgICAgICBuYW1lOiAnSW1wb3J0RXhjZWwnLFxuICAgICAgICBkaXNwbGF5TmFtZTogJ0ltcG9ydEV4Y2VsJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdJbXBvcnQvRXhwb3J0IEV4Y2VsIHNwcmVhZHNoZWV0cyB3aXRob3V0IEV4Y2VsIGluc3RhbGxlZCcsXG4gICAgICAgIGNhdGVnb3J5OiAndXRpbGl0eScsXG4gICAgICAgIHZlcnNpb246ICc3LngnLFxuICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHNpemU6ICd+MyBNQicsXG4gICAgICAgIGljb246IF9qc3goSGFyZERyaXZlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksXG4gICAgfSxcbiAgICB7XG4gICAgICAgIG5hbWU6ICdQU1dyaXRlSFRNTCcsXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnUFNXcml0ZUhUTUwnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0NyZWF0ZSBiZWF1dGlmdWwgSFRNTCByZXBvcnRzIGZyb20gUG93ZXJTaGVsbCcsXG4gICAgICAgIGNhdGVnb3J5OiAndXRpbGl0eScsXG4gICAgICAgIHZlcnNpb246ICcxLngnLFxuICAgICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICAgIGRlcGVuZGVuY2llczogW10sXG4gICAgICAgIHNpemU6ICd+NSBNQicsXG4gICAgICAgIGljb246IF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSxcbiAgICB9LFxuXTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFN1Yi1jb21wb25lbnRzXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vKipcbiAqIFN5c3RlbSByZXF1aXJlbWVudHMgcGFuZWwgd2l0aCB2aXN1YWwgaW5kaWNhdG9yc1xuICovXG5jb25zdCBTeXN0ZW1SZXF1aXJlbWVudHNQYW5lbCA9ICh7IHJlcXVpcmVtZW50cywgb25SZWZyZXNoLCBpc0NoZWNraW5nIH0pID0+IHtcbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdQb3dlclNoZWxsIFZlcnNpb24nLFxuICAgICAgICAgICAgdmFsdWU6IHJlcXVpcmVtZW50cy5wb3dlcnNoZWxsVmVyc2lvbi5pbnN0YWxsZWRcbiAgICAgICAgICAgICAgICA/IGAke3JlcXVpcmVtZW50cy5wb3dlcnNoZWxsVmVyc2lvbi5pbnN0YWxsZWR9IChyZXF1aXJlcyAke3JlcXVpcmVtZW50cy5wb3dlcnNoZWxsVmVyc2lvbi5yZXF1aXJlZH0rKWBcbiAgICAgICAgICAgICAgICA6ICdDaGVja2luZy4uLicsXG4gICAgICAgICAgICBtZXQ6IHJlcXVpcmVtZW50cy5wb3dlcnNoZWxsVmVyc2lvbi5tZXQsXG4gICAgICAgICAgICBpY29uOiBfanN4KFRlcm1pbmFsLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnQWRtaW5pc3RyYXRvciBQcml2aWxlZ2VzJyxcbiAgICAgICAgICAgIHZhbHVlOiByZXF1aXJlbWVudHMuZWxldmF0ZWQgPT09IG51bGxcbiAgICAgICAgICAgICAgICA/ICdDaGVja2luZy4uLidcbiAgICAgICAgICAgICAgICA6IHJlcXVpcmVtZW50cy5lbGV2YXRlZFxuICAgICAgICAgICAgICAgICAgICA/ICdSdW5uaW5nIGFzIEFkbWluaXN0cmF0b3InXG4gICAgICAgICAgICAgICAgICAgIDogJ1N0YW5kYXJkIFVzZXIgKEN1cnJlbnRVc2VyIHNjb3BlKScsXG4gICAgICAgICAgICBtZXQ6IHJlcXVpcmVtZW50cy5lbGV2YXRlZCxcbiAgICAgICAgICAgIGljb246IF9qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRGlzayBTcGFjZScsXG4gICAgICAgICAgICB2YWx1ZTogYCR7cmVxdWlyZW1lbnRzLmRpc2tTcGFjZS5hdmFpbGFibGUudG9GaXhlZCgxKX0gR0IgYXZhaWxhYmxlYCxcbiAgICAgICAgICAgIG1ldDogcmVxdWlyZW1lbnRzLmRpc2tTcGFjZS5tZXQsXG4gICAgICAgICAgICBpY29uOiBfanN4KEhhcmREcml2ZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ05ldHdvcmsgQWNjZXNzJyxcbiAgICAgICAgICAgIHZhbHVlOiByZXF1aXJlbWVudHMubmV0d29ya0FjY2VzcyA9PT0gbnVsbFxuICAgICAgICAgICAgICAgID8gJ0NoZWNraW5nLi4uJ1xuICAgICAgICAgICAgICAgIDogcmVxdWlyZW1lbnRzLm5ldHdvcmtBY2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgPyAnUG93ZXJTaGVsbCBHYWxsZXJ5IGFjY2Vzc2libGUnXG4gICAgICAgICAgICAgICAgICAgIDogJ0Nhbm5vdCByZWFjaCBQU0dhbGxlcnknLFxuICAgICAgICAgICAgbWV0OiByZXF1aXJlbWVudHMubmV0d29ya0FjY2VzcyxcbiAgICAgICAgICAgIGljb246IF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02IHNoYWRvdy1zbVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFNldHRpbmdzLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcHVycGxlLTUwMFwiIH0pLCBcIlN5c3RlbSBSZXF1aXJlbWVudHNcIl0gfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZ2hvc3RcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvblJlZnJlc2gsIGxvYWRpbmc6IGlzQ2hlY2tpbmcsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogaXRlbXMubWFwKChpdGVtKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBcclxuICAgICAgICAgICAgICBwLTQgcm91bmRlZC1sZyBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDBcclxuICAgICAgICAgICAgICAke2l0ZW0ubWV0ID09PSBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS02MDAgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktODAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLm1ldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JvcmRlci1ncmVlbi0yMDAgZGFyazpib3JkZXItZ3JlZW4tODAwIGJnLWdyZWVuLTUwIGRhcms6YmctZ3JlZW4tOTAwLzIwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JvcmRlci15ZWxsb3ctMjAwIGRhcms6Ym9yZGVyLXllbGxvdy04MDAgYmcteWVsbG93LTUwIGRhcms6YmcteWVsbG93LTkwMC8yMCd9XHJcbiAgICAgICAgICAgIGAsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogaXRlbS5tZXQgPT09IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGl0ZW0ubWV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3RleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQteWVsbG93LTYwMCBkYXJrOnRleHQteWVsbG93LTQwMCcsIGNoaWxkcmVuOiBpdGVtLmljb24gfSksIGl0ZW0ubWV0ID09PSBudWxsID8gKF9qc3goTG9hZGluZ1NwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IGl0ZW0ubWV0ID8gKF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmVlbi01MDBcIiB9KSkgOiAoX2pzeChBbGVydFRyaWFuZ2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQteWVsbG93LTUwMFwiIH0pKV0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGl0ZW0ubGFiZWwgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogaXRlbS52YWx1ZSB9KV0gfSwgaXRlbS5sYWJlbCkpKSB9KV0gfSkpO1xufTtcbi8qKlxuICogTW9kdWxlIGNhcmQgd2l0aCBzdGF0dXMgaW5kaWNhdG9yIGFuZCBjb250cm9sc1xuICovXG5jb25zdCBNb2R1bGVDYXJkID0gKHsgbW9kdWxlLCBzZWxlY3RlZCwgb25Ub2dnbGUsIG9uSW5zdGFsbCwgZXhwYW5kZWQsIG9uRXhwYW5kLCBkaXNhYmxlZCB9KSA9PiB7XG4gICAgY29uc3QgZ2V0U3RhdHVzQmFkZ2UgPSAoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobW9kdWxlLnN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSAnaW5zdGFsbGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yIHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSBiZy1ncmVlbi0xMDAgZGFyazpiZy1ncmVlbi05MDAvMzAgdGV4dC1ncmVlbi03MDAgZGFyazp0ZXh0LWdyZWVuLTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zXCIgfSksIFwiSW5zdGFsbGVkXCJdIH0pKTtcbiAgICAgICAgICAgIGNhc2UgJ291dGRhdGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yIHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSBiZy15ZWxsb3ctMTAwIGRhcms6YmcteWVsbG93LTkwMC8zMCB0ZXh0LXllbGxvdy03MDAgZGFyazp0ZXh0LXllbGxvdy0zMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydFRyaWFuZ2xlLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zXCIgfSksIFwiVXBkYXRlIEF2YWlsYWJsZVwiXSB9KSk7XG4gICAgICAgICAgICBjYXNlICdub3RfaW5zdGFsbGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJweC0yIHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktNzAwIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktMzAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goWCwgeyBjbGFzc05hbWU6IFwidy0zIGgtM1wiIH0pLCBcIk5vdCBJbnN0YWxsZWRcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnaW5zdGFsbGluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMC8zMCB0ZXh0LWJsdWUtNzAwIGRhcms6dGV4dC1ibHVlLTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgYW5pbWF0ZS1zcGluXCIgfSksIFwiSW5zdGFsbGluZ1wiXSB9KSk7XG4gICAgICAgICAgICBjYXNlICdjaGVja2luZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgYW5pbWF0ZS1zcGluXCIgfSksIFwiQ2hlY2tpbmdcIl0gfSkpO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIGJnLXJlZC0xMDAgZGFyazpiZy1yZWQtOTAwLzMwIHRleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTMwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zXCIgfSksIFwiRXJyb3JcIl0gfSkpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS0zMDAgcm91bmRlZC1mdWxsXCIsIGNoaWxkcmVuOiBcIlVua25vd25cIiB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdldENhdGVnb3J5Q29sb3IgPSAoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobW9kdWxlLmNhdGVnb3J5KSB7XG4gICAgICAgICAgICBjYXNlICdncmFwaCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ibHVlLTEwMCBkYXJrOmJnLWJsdWUtOTAwLzMwIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwJztcbiAgICAgICAgICAgIGNhc2UgJ2F6dXJlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLXB1cnBsZS0xMDAgZGFyazpiZy1wdXJwbGUtOTAwLzMwIHRleHQtcHVycGxlLTYwMCBkYXJrOnRleHQtcHVycGxlLTQwMCc7XG4gICAgICAgICAgICBjYXNlICdjb3JlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTEwMCBkYXJrOmJnLWdyZWVuLTkwMC8zMCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktNzAwIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgXHJcbiAgICAgICAgZ3JvdXAgcm91bmRlZC14bCBib3JkZXItMiB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDBcclxuICAgICAgICAke3NlbGVjdGVkXG4gICAgICAgICAgICA/ICdib3JkZXItYmx1ZS00MDAgZGFyazpib3JkZXItYmx1ZS02MDAgYmctYmx1ZS01MC81MCBkYXJrOmJnLWJsdWUtOTAwLzEwIHNoYWRvdy1sZyBzaGFkb3ctYmx1ZS01MDAvMTAnXG4gICAgICAgICAgICA6ICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBob3Zlcjpib3JkZXItZ3JheS0zMDAgZGFyazpob3Zlcjpib3JkZXItZ3JheS02MDAnfVxyXG4gICAgICBgLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHQtMVwiLCBjaGlsZHJlbjogX2pzeChDaGVja2JveCwgeyBjaGVja2VkOiBzZWxlY3RlZCwgb25DaGFuZ2U6ICgpID0+IG9uVG9nZ2xlKCksIGRpc2FibGVkOiBtb2R1bGUucmVxdWlyZWQgfHwgbW9kdWxlLnN0YXR1cyA9PT0gJ2luc3RhbGxpbmcnIHx8IG1vZHVsZS5zdGF0dXMgPT09ICdpbnN0YWxsZWQnIHx8IGRpc2FibGVkIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgcC0zIHJvdW5kZWQteGwgJHtnZXRDYXRlZ29yeUNvbG9yKCl9IHRyYW5zaXRpb24tdHJhbnNmb3JtIGdyb3VwLWhvdmVyOnNjYWxlLTExMCBjdXJzb3ItcG9pbnRlcmAsIG9uQ2xpY2s6IG9uRXhwYW5kLCBjaGlsZHJlbjogbW9kdWxlLmljb24gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBtaW4tdy0wIGN1cnNvci1wb2ludGVyXCIsIG9uQ2xpY2s6IG9uRXhwYW5kLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGZsZXgtd3JhcFwiLCBjaGlsZHJlbjogW19qc3goXCJoNFwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBtb2R1bGUuZGlzcGxheU5hbWUgfSksIG1vZHVsZS5yZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0wLjUgdGV4dC14cyBmb250LW1lZGl1bSBiZy1yZWQtMTAwIGRhcms6YmctcmVkLTkwMC8zMCB0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC0zMDAgcm91bmRlZFwiLCBjaGlsZHJlbjogXCJSZXF1aXJlZFwiIH0pKSwgZ2V0U3RhdHVzQmFkZ2UoKV0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogbW9kdWxlLmRlc2NyaXB0aW9uIH0pLCBtb2R1bGUuZXJyb3JNZXNzYWdlICYmIChfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgbXQtMiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgbW9kdWxlLmVycm9yTWVzc2FnZV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCBtdC0zIHRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFBhY2thZ2UsIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgbW9kdWxlLmluc3RhbGxlZFZlcnNpb24gPyBgdiR7bW9kdWxlLmluc3RhbGxlZFZlcnNpb259YCA6IG1vZHVsZS52ZXJzaW9uXSB9KSwgbW9kdWxlLnNpemUgJiYgKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goSGFyZERyaXZlLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zXCIgfSksIG1vZHVsZS5zaXplXSB9KSksIG1vZHVsZS5kZXBlbmRlbmNpZXMubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChHaXRCcmFuY2gsIHsgY2xhc3NOYW1lOiBcInctMyBoLTNcIiB9KSwgbW9kdWxlLmRlcGVuZGVuY2llcy5sZW5ndGgsIFwiIGRlcFwiLCBtb2R1bGUuZGVwZW5kZW5jaWVzLmxlbmd0aCA+IDEgPyAncycgOiAnJ10gfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbbW9kdWxlLnN0YXR1cyA9PT0gJ25vdF9pbnN0YWxsZWQnICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvbkluc3RhbGwsIGRpc2FibGVkOiBkaXNhYmxlZCwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJJbnN0YWxsXCIgfSkpLCBtb2R1bGUuc3RhdHVzID09PSAnb3V0ZGF0ZWQnICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uSW5zdGFsbCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJVcGRhdGVcIiB9KSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkV4cGFuZCwgY2xhc3NOYW1lOiBcInAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IGV4cGFuZGVkID8gX2pzeChDaGV2cm9uRG93biwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pIDogX2pzeChDaGV2cm9uUmlnaHQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSB9KV0gfSldIH0pLCBleHBhbmRlZCAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IHB0LTQgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC00IHRleHQtc21cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiQ2F0ZWdvcnk6XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcIm1sLTIgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgY2FwaXRhbGl6ZVwiLCBjaGlsZHJlbjogbW9kdWxlLmNhdGVnb3J5IH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk1vZHVsZSBOYW1lOlwiIH0pLCBfanN4KFwiY29kZVwiLCB7IGNsYXNzTmFtZTogXCJtbC0yIHB4LTIgcHktMC41IGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZCB0ZXh0LWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTIwMCB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBtb2R1bGUubmFtZSB9KV0gfSksIG1vZHVsZS5kZXBlbmRlbmNpZXMubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiY29sLXNwYW4tMlwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkRlcGVuZGVuY2llczpcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtd3JhcCBnYXAtMiBtdC0xXCIsIGNoaWxkcmVuOiBtb2R1bGUuZGVwZW5kZW5jaWVzLm1hcCgoZGVwKSA9PiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwicHgtMiBweS0xIHRleHQteHMgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCByb3VuZGVkXCIsIGNoaWxkcmVuOiBkZXAgfSwgZGVwKSkpIH0pXSB9KSksIG1vZHVsZS5jb25mbGljdHNXaXRoICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0VHJpYW5nbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJDb25mbGljdHMgd2l0aDogXCIsIG1vZHVsZS5jb25mbGljdHNXaXRoXSB9KSB9KSldIH0pIH0pKV0gfSkgfSkpO1xufTtcbi8qKlxuICogVGVybWluYWwtc3R5bGUgbG9nIHZpZXdlclxuICovXG5jb25zdCBMb2dWaWV3ZXIgPSAoeyBsb2dzLCBvbkNsZWFyIH0pID0+IHtcbiAgICBjb25zdCBnZXRTdGF0dXNDb2xvciA9IChzdGF0dXMpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1ncmVlbi00MDAnO1xuICAgICAgICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LXllbGxvdy00MDAnO1xuICAgICAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1yZWQtNDAwJztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LWdyYXktMzAwJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmF5LTkwMCByb3VuZGVkLWxnIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC00IHB5LTIgYmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0xLjVcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctMyBoLTMgcm91bmRlZC1mdWxsIGJnLXJlZC01MDBcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTMgaC0zIHJvdW5kZWQtZnVsbCBiZy15ZWxsb3ctNTAwXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy0zIGgtMyByb3VuZGVkLWZ1bGwgYmctZ3JlZW4tNTAwXCIgfSldIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS00MDAgbWwtMlwiLCBjaGlsZHJlbjogXCJJbnN0YWxsYXRpb24gTG9nXCIgfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbGVhciwgY2xhc3NOYW1lOiBcInAtMSByb3VuZGVkIGhvdmVyOmJnLWdyYXktNzAwIHRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTIwMCB0cmFuc2l0aW9uLWNvbG9yc1wiLCB0aXRsZTogXCJDbGVhciBsb2dzXCIsIGNoaWxkcmVuOiBfanN4KFRyYXNoMiwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTQgbWF4LWgtNjQgb3ZlcmZsb3ctYXV0byBmb250LW1vbm8gdGV4dC1zbVwiLCBjaGlsZHJlbjogbG9ncy5sZW5ndGggPT09IDAgPyAoX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogXCIkIFdhaXRpbmcgZm9yIG9wZXJhdGlvbnMuLi5cIiB9KSkgOiAobG9ncy5tYXAoKGxvZykgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgcHktMC41ICR7Z2V0U3RhdHVzQ29sb3IobG9nLnN0YXR1cyl9YCwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogW1wiW1wiLCBuZXcgRGF0ZShsb2cudGltZXN0YW1wKS50b0xvY2FsZVRpbWVTdHJpbmcoKSwgXCJdXCJdIH0pLCAnICcsIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWN5YW4tNDAwXCIsIGNoaWxkcmVuOiBbXCJbXCIsIGxvZy5tb2R1bGUsIFwiXVwiXSB9KSwgJyAnLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXB1cnBsZS00MDBcIiwgY2hpbGRyZW46IGxvZy5hY3Rpb24gfSksIFwiOlwiLCAnICcsIGxvZy5tZXNzYWdlLCBsb2cuZHVyYXRpb24gJiYgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFtcIiAoXCIsIChsb2cuZHVyYXRpb24gLyAxMDAwKS50b0ZpeGVkKDEpLCBcInMpXCJdIH0pXSB9LCBsb2cuaWQpKSkpIH0pXSB9KSk7XG59O1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gTWFpbiBDb21wb25lbnRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNvbnN0IFNldHVwQXp1cmVQcmVyZXF1aXNpdGVzVmlldyA9ICgpID0+IHtcbiAgICAvLyBNb2R1bGUgc3RhdGVcbiAgICBjb25zdCBbbW9kdWxlcywgc2V0TW9kdWxlc10gPSB1c2VTdGF0ZSgoKSA9PiBQT1dFUlNIRUxMX01PRFVMRVMubWFwKChtKSA9PiAoeyAuLi5tLCBzdGF0dXM6ICd1bmtub3duJywgaW5zdGFsbGVkVmVyc2lvbjogdW5kZWZpbmVkLCBlcnJvck1lc3NhZ2U6IHVuZGVmaW5lZCB9KSkpO1xuICAgIGNvbnN0IFtzZWxlY3RlZE1vZHVsZXMsIHNldFNlbGVjdGVkTW9kdWxlc10gPSB1c2VTdGF0ZSgoKSA9PiBuZXcgU2V0KFBPV0VSU0hFTExfTU9EVUxFUy5maWx0ZXIoKG0pID0+IG0ucmVxdWlyZWQpLm1hcCgobSkgPT4gbS5uYW1lKSkpO1xuICAgIGNvbnN0IFtleHBhbmRlZE1vZHVsZSwgc2V0RXhwYW5kZWRNb2R1bGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gU3lzdGVtIHJlcXVpcmVtZW50c1xuICAgIGNvbnN0IFtyZXF1aXJlbWVudHMsIHNldFJlcXVpcmVtZW50c10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHBvd2Vyc2hlbGxWZXJzaW9uOiB7IHJlcXVpcmVkOiAnNS4xJywgaW5zdGFsbGVkOiBudWxsLCBtZXQ6IG51bGwgfSxcbiAgICAgICAgZWxldmF0ZWQ6IG51bGwsXG4gICAgICAgIGRpc2tTcGFjZTogeyByZXF1aXJlZDogMC41LCBhdmFpbGFibGU6IDEwMCwgbWV0OiB0cnVlIH0sXG4gICAgICAgIG5ldHdvcmtBY2Nlc3M6IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3QgW2lzQ2hlY2tpbmdSZXF1aXJlbWVudHMsIHNldElzQ2hlY2tpbmdSZXF1aXJlbWVudHNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIC8vIFByb2Nlc3Mgc3RhdGVcbiAgICBjb25zdCBbaXNJbnN0YWxsaW5nLCBzZXRJc0luc3RhbGxpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpc1ZlcmlmeWluZywgc2V0SXNWZXJpZnlpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtvdmVyYWxsUHJvZ3Jlc3MsIHNldE92ZXJhbGxQcm9ncmVzc10gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBbc2V0dXBDb21wbGV0ZSwgc2V0U2V0dXBDb21wbGV0ZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgLy8gTG9nc1xuICAgIGNvbnN0IFtsb2dzLCBzZXRMb2dzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2hvd0xvZ3MsIHNldFNob3dMb2dzXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICAvLyBGaWx0ZXIgc3RhdGVcbiAgICBjb25zdCBbY2F0ZWdvcnlGaWx0ZXIsIHNldENhdGVnb3J5RmlsdGVyXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbc2VhcmNoUXVlcnksIHNldFNlYXJjaFF1ZXJ5XSA9IHVzZVN0YXRlKCcnKTtcbiAgICAvLyBBZGQgbG9nIGVudHJ5XG4gICAgY29uc3QgYWRkTG9nID0gdXNlQ2FsbGJhY2soKG1vZHVsZSwgYWN0aW9uLCBzdGF0dXMsIG1lc3NhZ2UsIGR1cmF0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0xvZyA9IHtcbiAgICAgICAgICAgIGlkOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBtb2R1bGUsXG4gICAgICAgICAgICBhY3Rpb24sXG4gICAgICAgICAgICBzdGF0dXMsXG4gICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIH07XG4gICAgICAgIHNldExvZ3MoKHByZXYpID0+IFsuLi5wcmV2LCBuZXdMb2ddKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gQ2hlY2sgc3lzdGVtIHJlcXVpcmVtZW50c1xuICAgIGNvbnN0IGNoZWNrUmVxdWlyZW1lbnRzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc0NoZWNraW5nUmVxdWlyZW1lbnRzKHRydWUpO1xuICAgICAgICBhZGRMb2coJ1N5c3RlbScsICdDaGVjaycsICdpbmZvJywgJ0NoZWNraW5nIHN5c3RlbSByZXF1aXJlbWVudHMuLi4nKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGFkbWluIHJpZ2h0c1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQST8uZXhlY3V0ZVNjcmlwdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkbWluUmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6IGBcclxuICAgICAgICAgICAgJGlkZW50aXR5ID0gW1NlY3VyaXR5LlByaW5jaXBhbC5XaW5kb3dzSWRlbnRpdHldOjpHZXRDdXJyZW50KClcclxuICAgICAgICAgICAgJHByaW5jaXBhbCA9IE5ldy1PYmplY3QgU2VjdXJpdHkuUHJpbmNpcGFsLldpbmRvd3NQcmluY2lwYWwgJGlkZW50aXR5XHJcbiAgICAgICAgICAgICRpc0FkbWluID0gJHByaW5jaXBhbC5Jc0luUm9sZShbU2VjdXJpdHkuUHJpbmNpcGFsLldpbmRvd3NCdWlsdEluUm9sZV06OkFkbWluaXN0cmF0b3IpXHJcbiAgICAgICAgICAgIEB7IElzQWRtaW4gPSAkaXNBZG1pbiB9IHwgQ29udmVydFRvLUpzb25cclxuICAgICAgICAgIGAsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChhZG1pblJlc3VsdC5zdWNjZXNzICYmIGFkbWluUmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gdHlwZW9mIGFkbWluUmVzdWx0LmRhdGEgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShhZG1pblJlc3VsdC5kYXRhKSA6IGFkbWluUmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIHNldFJlcXVpcmVtZW50cygocHJldikgPT4gKHsgLi4ucHJldiwgZWxldmF0ZWQ6IHBhcnNlZC5Jc0FkbWluIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkTG9nKCdTeXN0ZW0nLCAnQWRtaW5DaGVjaycsIHBhcnNlZC5Jc0FkbWluID8gJ3N1Y2Nlc3MnIDogJ3dhcm5pbmcnLCBwYXJzZWQuSXNBZG1pbiA/ICdSdW5uaW5nIHdpdGggYWRtaW5pc3RyYXRvciBwcml2aWxlZ2VzJyA6ICdSdW5uaW5nIHdpdGhvdXQgYWRtaW4gKEN1cnJlbnRVc2VyIHNjb3BlKScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBQb3dlclNoZWxsIHZlcnNpb25cbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJzaW9uUmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6IGAkUFNWZXJzaW9uVGFibGUuUFNWZXJzaW9uLlRvU3RyaW5nKClgLFxuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvblJlc3VsdC5zdWNjZXNzICYmIHZlcnNpb25SZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gdmVyc2lvblJlc3VsdC5kYXRhLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtYWpvclZlcnNpb24gPSBwYXJzZUZsb2F0KHZlcnNpb24uc3BsaXQoJy4nKVswXSk7XG4gICAgICAgICAgICAgICAgICAgIHNldFJlcXVpcmVtZW50cygocHJldikgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3dlcnNoZWxsVmVyc2lvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYucG93ZXJzaGVsbFZlcnNpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFsbGVkOiB2ZXJzaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldDogbWFqb3JWZXJzaW9uID49IDUuMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkTG9nKCdTeXN0ZW0nLCAnVmVyc2lvbkNoZWNrJywgJ2luZm8nLCBgUG93ZXJTaGVsbCB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gU2ltdWxhdGVkIGZvciBkZXZlbG9wbWVudFxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcbiAgICAgICAgICAgICAgICBzZXRSZXF1aXJlbWVudHMoKHByZXYpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgIHBvd2Vyc2hlbGxWZXJzaW9uOiB7IHJlcXVpcmVkOiAnNS4xJywgaW5zdGFsbGVkOiAnNy4zLjQnLCBtZXQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgZWxldmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG5ldHdvcmtBY2Nlc3M6IG5hdmlnYXRvci5vbkxpbmUsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGFkZExvZygnU3lzdGVtJywgJ0NoZWNrJywgJ3N1Y2Nlc3MnLCAnRW52aXJvbm1lbnQgY2hlY2sgY29tcGxldGUgKHNpbXVsYXRlZCknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIG5ldHdvcmtcbiAgICAgICAgICAgIHNldFJlcXVpcmVtZW50cygocHJldikgPT4gKHsgLi4ucHJldiwgbmV0d29ya0FjY2VzczogbmF2aWdhdG9yLm9uTGluZSB9KSk7XG4gICAgICAgICAgICAvLyBDaGVjayBjb21wbGV0aW9uIGZsYWdcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZWxlY3Ryb25BUEk/LmdldENvbmZpZykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZEZsYWcgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZ2V0Q29uZmlnKCdhenVyZVByZXJlcXVpc2l0ZXNDb21wbGV0ZWQnKTtcbiAgICAgICAgICAgICAgICBzZXRTZXR1cENvbXBsZXRlKCEhY29tcGxldGVkRmxhZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGRMb2coJ1N5c3RlbScsICdDaGVjaycsICdlcnJvcicsIGBFbnZpcm9ubWVudCBjaGVjayBmYWlsZWQ6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzQ2hlY2tpbmdSZXF1aXJlbWVudHMoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2FkZExvZ10pO1xuICAgIC8vIFZlcmlmeSBtb2R1bGUgc3RhdHVzXG4gICAgY29uc3QgdmVyaWZ5TW9kdWxlcyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNWZXJpZnlpbmcodHJ1ZSk7XG4gICAgICAgIGFkZExvZygnTW9kdWxlcycsICdWZXJpZnknLCAnaW5mbycsICdDaGVja2luZyBpbnN0YWxsZWQgbW9kdWxlcy4uLicpO1xuICAgICAgICBjb25zdCB1cGRhdGVkTW9kdWxlcyA9IFsuLi5tb2R1bGVzXTtcbiAgICAgICAgbGV0IGluc3RhbGxlZENvdW50ID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cGRhdGVkTW9kdWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlID0gdXBkYXRlZE1vZHVsZXNbaV07XG4gICAgICAgICAgICBtb2R1bGUuc3RhdHVzID0gJ2NoZWNraW5nJztcbiAgICAgICAgICAgIHNldE1vZHVsZXMoWy4uLnVwZGF0ZWRNb2R1bGVzXSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cuZWxlY3Ryb25BUEk/LmV4ZWN1dGVTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0OiBgXHJcbiAgICAgICAgICAgICAgJG1vZHVsZSA9IEdldC1Nb2R1bGUgLUxpc3RBdmFpbGFibGUgLU5hbWUgJyR7bW9kdWxlLm5hbWV9JyB8IFNlbGVjdC1PYmplY3QgLUZpcnN0IDFcclxuICAgICAgICAgICAgICBpZiAoJG1vZHVsZSkge1xyXG4gICAgICAgICAgICAgICAgQHsgSW5zdGFsbGVkID0gJHRydWU7IFZlcnNpb24gPSAkbW9kdWxlLlZlcnNpb24uVG9TdHJpbmcoKSB9IHwgQ29udmVydFRvLUpzb25cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgQHsgSW5zdGFsbGVkID0gJGZhbHNlIH0gfCBDb252ZXJ0VG8tSnNvblxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSB0eXBlb2YgcmVzdWx0LmRhdGEgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShyZXN1bHQuZGF0YSkgOiByZXN1bHQuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZS5zdGF0dXMgPSBwYXJzZWQuSW5zdGFsbGVkID8gJ2luc3RhbGxlZCcgOiAnbm90X2luc3RhbGxlZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGUuaW5zdGFsbGVkVmVyc2lvbiA9IHBhcnNlZC5WZXJzaW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlZC5JbnN0YWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YWxsZWRDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZExvZyhtb2R1bGUubmFtZSwgJ1ZlcmlmeScsICdzdWNjZXNzJywgYEluc3RhbGxlZCAodiR7cGFyc2VkLlZlcnNpb259KWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkTG9nKG1vZHVsZS5uYW1lLCAnVmVyaWZ5JywgJ2luZm8nLCAnTm90IGluc3RhbGxlZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW11bGF0ZWQgZm9yIGRldmVsb3BtZW50XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDIwMCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0luc3RhbGxlZCA9IE1hdGgucmFuZG9tKCkgPiAwLjQ7XG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZS5zdGF0dXMgPSBpc0luc3RhbGxlZCA/ICdpbnN0YWxsZWQnIDogJ25vdF9pbnN0YWxsZWQnO1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGUuaW5zdGFsbGVkVmVyc2lvbiA9IGlzSW5zdGFsbGVkID8gbW9kdWxlLnZlcnNpb24gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0luc3RhbGxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxlZENvdW50Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbW9kdWxlLnN0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgbW9kdWxlLmVycm9yTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgYWRkTG9nKG1vZHVsZS5uYW1lLCAnVmVyaWZ5JywgJ2Vycm9yJywgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRNb2R1bGVzKFsuLi51cGRhdGVkTW9kdWxlc10pO1xuICAgICAgICAgICAgc2V0T3ZlcmFsbFByb2dyZXNzKCgoaSArIDEpIC8gdXBkYXRlZE1vZHVsZXMubGVuZ3RoKSAqIDEwMCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkTG9nKCdNb2R1bGVzJywgJ1ZlcmlmeScsICdzdWNjZXNzJywgYFZlcmlmaWNhdGlvbiBjb21wbGV0ZTogJHtpbnN0YWxsZWRDb3VudH0vJHt1cGRhdGVkTW9kdWxlcy5sZW5ndGh9IGluc3RhbGxlZGApO1xuICAgICAgICBzZXRJc1ZlcmlmeWluZyhmYWxzZSk7XG4gICAgICAgIHNldE92ZXJhbGxQcm9ncmVzcygwKTtcbiAgICB9LCBbbW9kdWxlcywgYWRkTG9nXSk7XG4gICAgLy8gVG9nZ2xlIG1vZHVsZSBzZWxlY3Rpb25cbiAgICBjb25zdCB0b2dnbGVNb2R1bGUgPSB1c2VDYWxsYmFjaygobmFtZSkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZE1vZHVsZXMoKHByZXYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpO1xuICAgICAgICAgICAgaWYgKG5leHQuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgbmV4dC5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0LmFkZChuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9KTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSW5zdGFsbCBzaW5nbGUgbW9kdWxlXG4gICAgY29uc3QgaW5zdGFsbE1vZHVsZSA9IHVzZUNhbGxiYWNrKGFzeW5jIChtb2R1bGVOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IG1vZHVsZXMuZmluZCgobSkgPT4gbS5uYW1lID09PSBtb2R1bGVOYW1lKTtcbiAgICAgICAgaWYgKCFtb2R1bGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldE1vZHVsZXMoKHByZXYpID0+IHByZXYubWFwKChtKSA9PiAobS5uYW1lID09PSBtb2R1bGVOYW1lID8geyAuLi5tLCBzdGF0dXM6ICdpbnN0YWxsaW5nJywgZXJyb3JNZXNzYWdlOiB1bmRlZmluZWQgfSA6IG0pKSk7XG4gICAgICAgIGFkZExvZyhtb2R1bGVOYW1lLCAnSW5zdGFsbCcsICdpbmZvJywgJ1N0YXJ0aW5nIGluc3RhbGxhdGlvbi4uLicpO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQST8uZXhlY3V0ZVNjcmlwdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0OiBgXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgSW5zdGFsbC1Nb2R1bGUgLU5hbWUgJyR7bW9kdWxlTmFtZX0nIC1Gb3JjZSAtQWxsb3dDbG9iYmVyIC1TY29wZSBDdXJyZW50VXNlciAtRXJyb3JBY3Rpb24gU3RvcFxyXG4gICAgICAgICAgICAgIEB7IFN1Y2Nlc3MgPSAkdHJ1ZSB9IHwgQ29udmVydFRvLUpzb25cclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgQHsgU3VjY2VzcyA9ICRmYWxzZTsgRXJyb3IgPSAkXy5FeGNlcHRpb24uTWVzc2FnZSB9IHwgQ29udmVydFRvLUpzb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgYCxcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gdHlwZW9mIHJlc3VsdC5kYXRhID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UocmVzdWx0LmRhdGEpIDogcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZWQuU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TW9kdWxlcygocHJldikgPT4gcHJldi5tYXAoKG0pID0+IChtLm5hbWUgPT09IG1vZHVsZU5hbWUgPyB7IC4uLm0sIHN0YXR1czogJ2luc3RhbGxlZCcsIGluc3RhbGxlZFZlcnNpb246IG0udmVyc2lvbiB9IDogbSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZExvZyhtb2R1bGVOYW1lLCAnSW5zdGFsbCcsICdzdWNjZXNzJywgJ0luc3RhbGxlZCBzdWNjZXNzZnVsbHknLCBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2R1bGVzKChwcmV2KSA9PiBwcmV2Lm1hcCgobSkgPT4gKG0ubmFtZSA9PT0gbW9kdWxlTmFtZSA/IHsgLi4ubSwgc3RhdHVzOiAnZXJyb3InLCBlcnJvck1lc3NhZ2U6IHBhcnNlZC5FcnJvciB9IDogbSkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZExvZyhtb2R1bGVOYW1lLCAnSW5zdGFsbCcsICdlcnJvcicsIHBhcnNlZC5FcnJvciB8fCAnSW5zdGFsbGF0aW9uIGZhaWxlZCcsIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFNpbXVsYXRlZCBmb3IgZGV2ZWxvcG1lbnRcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAyMDAwKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgIHNldE1vZHVsZXMoKHByZXYpID0+IHByZXYubWFwKChtKSA9PiAobS5uYW1lID09PSBtb2R1bGVOYW1lID8geyAuLi5tLCBzdGF0dXM6ICdpbnN0YWxsZWQnLCBpbnN0YWxsZWRWZXJzaW9uOiBtLnZlcnNpb24gfSA6IG0pKSk7XG4gICAgICAgICAgICAgICAgYWRkTG9nKG1vZHVsZU5hbWUsICdJbnN0YWxsJywgJ3N1Y2Nlc3MnLCAnSW5zdGFsbGVkIHN1Y2Nlc3NmdWxseSAoc2ltdWxhdGVkKScsIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIHNldE1vZHVsZXMoKHByZXYpID0+IHByZXYubWFwKChtKSA9PiAobS5uYW1lID09PSBtb2R1bGVOYW1lID8geyAuLi5tLCBzdGF0dXM6ICdlcnJvcicsIGVycm9yTWVzc2FnZTogZXJyb3IubWVzc2FnZSB9IDogbSkpKTtcbiAgICAgICAgICAgIGFkZExvZyhtb2R1bGVOYW1lLCAnSW5zdGFsbCcsICdlcnJvcicsIGVycm9yLm1lc3NhZ2UsIGR1cmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH0sIFttb2R1bGVzLCBhZGRMb2ddKTtcbiAgICAvLyBJbnN0YWxsIGFsbCBzZWxlY3RlZCBtb2R1bGVzXG4gICAgY29uc3QgaW5zdGFsbFNlbGVjdGVkTW9kdWxlcyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNJbnN0YWxsaW5nKHRydWUpO1xuICAgICAgICBzZXRPdmVyYWxsUHJvZ3Jlc3MoMCk7XG4gICAgICAgIGNvbnN0IHRvSW5zdGFsbCA9IG1vZHVsZXMuZmlsdGVyKChtKSA9PiBzZWxlY3RlZE1vZHVsZXMuaGFzKG0ubmFtZSkgJiYgbS5zdGF0dXMgIT09ICdpbnN0YWxsZWQnKTtcbiAgICAgICAgYWRkTG9nKCdJbnN0YWxsYXRpb24nLCAnU3RhcnQnLCAnaW5mbycsIGBJbnN0YWxsaW5nICR7dG9JbnN0YWxsLmxlbmd0aH0gbW9kdWxlKHMpLi4uYCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9JbnN0YWxsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhd2FpdCBpbnN0YWxsTW9kdWxlKHRvSW5zdGFsbFtpXS5uYW1lKTtcbiAgICAgICAgICAgIHNldE92ZXJhbGxQcm9ncmVzcygoKGkgKyAxKSAvIHRvSW5zdGFsbC5sZW5ndGgpICogMTAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBpZiBhbGwgcmVxdWlyZWQgbW9kdWxlcyBhcmUgaW5zdGFsbGVkXG4gICAgICAgIGNvbnN0IGFsbFJlcXVpcmVkSW5zdGFsbGVkID0gbW9kdWxlcy5maWx0ZXIoKG0pID0+IG0ucmVxdWlyZWQpLmV2ZXJ5KChtKSA9PiBtLnN0YXR1cyA9PT0gJ2luc3RhbGxlZCcpO1xuICAgICAgICBpZiAoYWxsUmVxdWlyZWRJbnN0YWxsZWQpIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuZWxlY3Ryb25BUEk/LnNldENvbmZpZykge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5zZXRDb25maWcoJ2F6dXJlUHJlcmVxdWlzaXRlc0NvbXBsZXRlZCcsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0U2V0dXBDb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgIGFkZExvZygnSW5zdGFsbGF0aW9uJywgJ0NvbXBsZXRlJywgJ3N1Y2Nlc3MnLCAnQWxsIHJlcXVpcmVkIHByZXJlcXVpc2l0ZXMgaW5zdGFsbGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNJbnN0YWxsaW5nKGZhbHNlKTtcbiAgICAgICAgc2V0T3ZlcmFsbFByb2dyZXNzKDApO1xuICAgICAgICBzZXRTZWxlY3RlZE1vZHVsZXMobmV3IFNldChQT1dFUlNIRUxMX01PRFVMRVMuZmlsdGVyKChtKSA9PiBtLnJlcXVpcmVkKS5tYXAoKG0pID0+IG0ubmFtZSkpKTtcbiAgICB9LCBbbW9kdWxlcywgc2VsZWN0ZWRNb2R1bGVzLCBpbnN0YWxsTW9kdWxlLCBhZGRMb2ddKTtcbiAgICAvLyBGaWx0ZXIgbW9kdWxlc1xuICAgIGNvbnN0IGZpbHRlcmVkTW9kdWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICByZXR1cm4gbW9kdWxlcy5maWx0ZXIoKG0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNDYXRlZ29yeSA9IGNhdGVnb3J5RmlsdGVyID09PSAnYWxsJyB8fCBtLmNhdGVnb3J5ID09PSBjYXRlZ29yeUZpbHRlcjtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSBtLm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIG0uZGlzcGxheU5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIG0uZGVzY3JpcHRpb24udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzQ2F0ZWdvcnkgJiYgbWF0Y2hlc1NlYXJjaDtcbiAgICAgICAgfSk7XG4gICAgfSwgW21vZHVsZXMsIGNhdGVnb3J5RmlsdGVyLCBzZWFyY2hRdWVyeV0pO1xuICAgIC8vIFN1bW1hcnkgc3RhdHNcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnN0YWxsZWQgPSBtb2R1bGVzLmZpbHRlcigobSkgPT4gbS5zdGF0dXMgPT09ICdpbnN0YWxsZWQnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVkID0gbW9kdWxlcy5maWx0ZXIoKG0pID0+IG0ucmVxdWlyZWQpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcmVxdWlyZWRJbnN0YWxsZWQgPSBtb2R1bGVzLmZpbHRlcigobSkgPT4gbS5yZXF1aXJlZCAmJiBtLnN0YXR1cyA9PT0gJ2luc3RhbGxlZCcpLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHsgaW5zdGFsbGVkLCB0b3RhbDogbW9kdWxlcy5sZW5ndGgsIHJlcXVpcmVkLCByZXF1aXJlZEluc3RhbGxlZCB9O1xuICAgIH0sIFttb2R1bGVzXSk7XG4gICAgLy8gSW5pdGlhbCBjaGVja1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNoZWNrUmVxdWlyZW1lbnRzKCk7XG4gICAgICAgIHZlcmlmeU1vZHVsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgYWxsUmVxdWlyZW1lbnRzTWV0ID0gcmVxdWlyZW1lbnRzLnBvd2Vyc2hlbGxWZXJzaW9uLm1ldCAhPT0gZmFsc2UgJiYgcmVxdWlyZW1lbnRzLm5ldHdvcmtBY2Nlc3MgIT09IGZhbHNlO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JhZGllbnQtdG8tYnIgZnJvbS1ncmF5LTUwIHRvLWdyYXktMTAwIGRhcms6ZnJvbS1ncmF5LTkwMCBkYXJrOnRvLWdyYXktOTUwXCIsIFwiZGF0YS1jeVwiOiBcInNldHVwLXByZXJlcXVpc2l0ZXMtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic2V0dXAtcHJlcmVxdWlzaXRlcy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTQgc2hhZG93LXNtXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWF4LXctN3hsIG14LWF1dG9cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC0yIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tcHVycGxlLTUwMCB0by1pbmRpZ28tNjAwIHJvdW5kZWQteGwgc2hhZG93LWxnIHNoYWRvdy1wdXJwbGUtNTAwLzIwXCIsIGNoaWxkcmVuOiBfanN4KFBhY2thZ2UsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkF6dXJlIFByZXJlcXVpc2l0ZXNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJQb3dlclNoZWxsIE1vZHVsZSBNYW5hZ2VyXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtzZXR1cENvbXBsZXRlICYmIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgcHgtMyBweS0xIGJnLWdyZWVuLTEwMCBkYXJrOmJnLWdyZWVuLTkwMC8zMCB0ZXh0LWdyZWVuLTgwMCBkYXJrOnRleHQtZ3JlZW4tMzAwIHJvdW5kZWQtZnVsbCB0ZXh0LXNtIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBcIkNvbXBsZXRlXCJdIH0pKSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogdmVyaWZ5TW9kdWxlcywgbG9hZGluZzogaXNWZXJpZnlpbmcsIGljb246IF9qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIlZlcmlmeSBBbGxcIiB9KSwgX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiBpbnN0YWxsU2VsZWN0ZWRNb2R1bGVzLCBkaXNhYmxlZDogaXNJbnN0YWxsaW5nIHx8ICFhbGxSZXF1aXJlbWVudHNNZXQgfHwgc2VsZWN0ZWRNb2R1bGVzLnNpemUgPT09IDAsIGxvYWRpbmc6IGlzSW5zdGFsbGluZywgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogW1wiSW5zdGFsbCBTZWxlY3RlZCAoXCIsIHNlbGVjdGVkTW9kdWxlcy5zaXplLCBcIilcIl0gfSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBweS02XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYXgtdy03eGwgbXgtYXV0byBweC02IHNwYWNlLXktNlwiLCBjaGlsZHJlbjogW3NldHVwQ29tcGxldGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IHJvdW5kZWQteGwgYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgYm9yZGVyIGJvcmRlci1ncmVlbi0yMDAgZGFyazpib3JkZXItZ3JlZW4tODAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC0yIGJnLWdyZWVuLTUwMCByb3VuZGVkLWZ1bGxcIiwgY2hpbGRyZW46IF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC13aGl0ZVwiIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmVlbi04MDAgZGFyazp0ZXh0LWdyZWVuLTIwMFwiLCBjaGlsZHJlbjogXCJQcmVyZXF1aXNpdGVzIENvbXBsZXRlIVwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JlZW4tNzAwIGRhcms6dGV4dC1ncmVlbi0zMDBcIiwgY2hpbGRyZW46IFwiQWxsIHJlcXVpcmVkIFBvd2VyU2hlbGwgbW9kdWxlcyBoYXZlIGJlZW4gaW5zdGFsbGVkIHN1Y2Nlc3NmdWxseS5cIiB9KV0gfSldIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdUb3RhbCBNb2R1bGVzJywgdmFsdWU6IHN0YXRzLnRvdGFsLCBpY29uOiBfanN4KFBhY2thZ2UsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgY29sb3I6ICdibHVlJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSW5zdGFsbGVkJywgdmFsdWU6IHN0YXRzLmluc3RhbGxlZCwgaWNvbjogX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBjb2xvcjogJ2dyZWVuJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnUmVxdWlyZWQnLCB2YWx1ZTogYCR7c3RhdHMucmVxdWlyZWRJbnN0YWxsZWR9LyR7c3RhdHMucmVxdWlyZWR9YCwgaWNvbjogX2pzeChBbGVydFRyaWFuZ2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGNvbG9yOiAneWVsbG93JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGxhYmVsOiAnU2VsZWN0ZWQnLCB2YWx1ZTogc2VsZWN0ZWRNb2R1bGVzLnNpemUsIGljb246IF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgY29sb3I6ICdwdXJwbGUnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5tYXAoKHN0YXQpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNCByb3VuZGVkLXhsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBob3ZlcjpzaGFkb3ctbGcgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBwLTIgcm91bmRlZC1sZyBiZy0ke3N0YXQuY29sb3J9LTEwMCBkYXJrOmJnLSR7c3RhdC5jb2xvcn0tOTAwLzMwIHRleHQtJHtzdGF0LmNvbG9yfS02MDAgZGFyazp0ZXh0LSR7c3RhdC5jb2xvcn0tNDAwYCwgY2hpbGRyZW46IHN0YXQuaWNvbiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBzdGF0LnZhbHVlIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHN0YXQubGFiZWwgfSldIH0pXSB9KSB9LCBzdGF0LmxhYmVsKSkpIH0pLCBfanN4KFN5c3RlbVJlcXVpcmVtZW50c1BhbmVsLCB7IHJlcXVpcmVtZW50czogcmVxdWlyZW1lbnRzLCBvblJlZnJlc2g6IGNoZWNrUmVxdWlyZW1lbnRzLCBpc0NoZWNraW5nOiBpc0NoZWNraW5nUmVxdWlyZW1lbnRzIH0pLCAoaXNJbnN0YWxsaW5nIHx8IGlzVmVyaWZ5aW5nKSAmJiBvdmVyYWxsUHJvZ3Jlc3MgPiAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItM1wiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBpc0luc3RhbGxpbmcgPyAnSW5zdGFsbGluZyBtb2R1bGVzLi4uJyA6ICdWZXJpZnlpbmcgbW9kdWxlcy4uLicgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMFwiLCBjaGlsZHJlbjogW01hdGgucm91bmQob3ZlcmFsbFByb2dyZXNzKSwgXCIlXCJdIH0pXSB9KSwgX2pzeChQcm9ncmVzc0JhciwgeyB2YWx1ZTogb3ZlcmFsbFByb2dyZXNzLCBtYXg6IDEwMCwgdmFyaWFudDogXCJpbmZvXCIsIHNpemU6IFwibGdcIiwgYW5pbWF0ZWQ6IHRydWUsIHN0cmlwZWQ6IHRydWUgfSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJQb3dlclNoZWxsIE1vZHVsZXNcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBsZWZ0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIHctNCBoLTQgdGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIG1vZHVsZXMuLi5cIiwgdmFsdWU6IHNlYXJjaFF1ZXJ5LCBvbkNoYW5nZTogKGUpID0+IHNldFNlYXJjaFF1ZXJ5KGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInBsLTEwIHByLTQgcHktMiB0ZXh0LXNtIGJvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgcm91bmRlZC1sZyBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci10cmFuc3BhcmVudFwiIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogWydhbGwnLCAnZ3JhcGgnLCAnYXp1cmUnLCAnY29yZScsICd1dGlsaXR5J10ubWFwKChjYXQpID0+IChfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0Q2F0ZWdvcnlGaWx0ZXIoY2F0KSwgY2xhc3NOYW1lOiBgcHgtMyBweS0xLjUgdGV4dC1zbSBmb250LW1lZGl1bSByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsICR7Y2F0ZWdvcnlGaWx0ZXIgPT09IGNhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWJsdWUtNjAwIHRleHQtd2hpdGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBob3ZlcjpiZy1ncmF5LTIwMCBkYXJrOmhvdmVyOmJnLWdyYXktNjAwJ31gLCBjaGlsZHJlbjogY2F0ID09PSAnYWxsJyA/ICdBbGwnIDogY2F0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY2F0LnNsaWNlKDEpIH0sIGNhdCkpKSB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTRcIiwgY2hpbGRyZW46IGZpbHRlcmVkTW9kdWxlcy5tYXAoKG1vZHVsZSkgPT4gKF9qc3goTW9kdWxlQ2FyZCwgeyBtb2R1bGU6IG1vZHVsZSwgc2VsZWN0ZWQ6IHNlbGVjdGVkTW9kdWxlcy5oYXMobW9kdWxlLm5hbWUpLCBvblRvZ2dsZTogKCkgPT4gdG9nZ2xlTW9kdWxlKG1vZHVsZS5uYW1lKSwgb25JbnN0YWxsOiAoKSA9PiBpbnN0YWxsTW9kdWxlKG1vZHVsZS5uYW1lKSwgZXhwYW5kZWQ6IGV4cGFuZGVkTW9kdWxlID09PSBtb2R1bGUubmFtZSwgb25FeHBhbmQ6ICgpID0+IHNldEV4cGFuZGVkTW9kdWxlKGV4cGFuZGVkTW9kdWxlID09PSBtb2R1bGUubmFtZSA/IG51bGwgOiBtb2R1bGUubmFtZSksIGRpc2FibGVkOiBpc0luc3RhbGxpbmcgfHwgaXNWZXJpZnlpbmcgfSwgbW9kdWxlLm5hbWUpKSkgfSksIGZpbHRlcmVkTW9kdWxlcy5sZW5ndGggPT09IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHB5LTEyXCIsIGNoaWxkcmVuOiBbX2pzeChQYWNrYWdlLCB7IGNsYXNzTmFtZTogXCJ3LTEyIGgtMTIgbXgtYXV0byB0ZXh0LWdyYXktNDAwIG1iLTRcIiB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogXCJObyBtb2R1bGVzIGZvdW5kXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlRyeSBhZGp1c3RpbmcgeW91ciBzZWFyY2ggb3IgZmlsdGVyIGNyaXRlcmlhLlwiIH0pXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0U2hvd0xvZ3MoIXNob3dMb2dzKSwgY2xhc3NOYW1lOiBcInctZnVsbCBweC02IHB5LTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQtbGVmdCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAvNTAgdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4cyhcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goVGVybWluYWwsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJJbnN0YWxsYXRpb24gTG9nc1wiLCBsb2dzLmxlbmd0aCA+IDAgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInB4LTIgcHktMC41IHRleHQteHMgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTMwMCByb3VuZGVkLWZ1bGxcIiwgY2hpbGRyZW46IGxvZ3MubGVuZ3RoIH0pKV0gfSksIHNob3dMb2dzID8gX2pzeChDaGV2cm9uRG93biwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIDogX2pzeChDaGV2cm9uUmlnaHQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KV0gfSksIHNob3dMb2dzICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTYgcGItNlwiLCBjaGlsZHJlbjogX2pzeChMb2dWaWV3ZXIsIHsgbG9nczogbG9ncywgb25DbGVhcjogKCkgPT4gc2V0TG9ncyhbXSkgfSkgfSkpXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgcm91bmRlZC14bCBiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCBkYXJrOmJvcmRlci1ibHVlLTgwMFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LWJsdWUtNTAwIGZsZXgtc2hyaW5rLTBcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtYmx1ZS04MDAgZGFyazp0ZXh0LWJsdWUtMjAwIG1iLTJcIiwgY2hpbGRyZW46IFwiTmVlZCBIZWxwP1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtYmx1ZS03MDAgZGFyazp0ZXh0LWJsdWUtMzAwIG1iLTNcIiwgY2hpbGRyZW46IFwiVGhlc2UgbW9kdWxlcyBhcmUgcmVxdWlyZWQgZm9yIHRoZSBNJkEgRGlzY292ZXJ5IFN1aXRlIHRvIGZ1bmN0aW9uIHByb3Blcmx5LiBSZXF1aXJlZCBtb2R1bGVzIGFyZSBhdXRvbWF0aWNhbGx5IHNlbGVjdGVkIGFuZCBjYW5ub3QgYmUgZGVzZWxlY3RlZC5cIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImFcIiwgeyBocmVmOiBcImh0dHBzOi8vZG9jcy5taWNyb3NvZnQuY29tL3Bvd2Vyc2hlbGwvbWljcm9zb2Z0Z3JhcGgvXCIsIHRhcmdldDogXCJfYmxhbmtcIiwgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgaG92ZXI6dW5kZXJsaW5lIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChFeHRlcm5hbExpbmssIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJNaWNyb3NvZnQgR3JhcGggRG9jc1wiXSB9KSwgX2pzeHMoXCJhXCIsIHsgaHJlZjogXCJodHRwczovL3d3dy5wb3dlcnNoZWxsZ2FsbGVyeS5jb20vXCIsIHRhcmdldDogXCJfYmxhbmtcIiwgcmVsOiBcIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgaG92ZXI6dW5kZXJsaW5lIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChFeHRlcm5hbExpbmssIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJQb3dlclNoZWxsIEdhbGxlcnlcIl0gfSldIH0pXSB9KV0gfSkgfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2V0dXBBenVyZVByZXJlcXVpc2l0ZXNWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9