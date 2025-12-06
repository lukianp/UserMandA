"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5868],{

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

/***/ 39864:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  a: () => (/* binding */ Modal)
});

// UNUSED EXPORTS: default

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./node_modules/tailwind-merge/dist/bundle-mjs.mjs
var bundle_mjs = __webpack_require__(50856);
;// ./src/renderer/lib/utils.ts
/**
 * Utility functions for the renderer process
 */


/**
 * Combines class names using clsx and tailwind-merge
 */
function cn(...inputs) {
    return (0,bundle_mjs/* twMerge */.QP)((0,clsx/* clsx */.$)(inputs));
}

;// ./src/renderer/components/organisms/Modal.tsx

/**
 * Modal Component
 *
 * A reusable modal dialog component with title, icon, and size options.
 */



const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};
const Modal = ({ isOpen, onClose, title, icon, size = 'md', className, children, 'data-cy': dataCy, }) => {
    // Handle ESC key
    (0,react.useEffect)(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);
    // Prevent body scroll when modal is open
    (0,react.useEffect)(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center", "data-cy": dataCy, children: [(0,jsx_runtime.jsx)("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: onClose, "aria-hidden": "true" }), (0,jsx_runtime.jsxs)("div", { className: cn('relative w-full mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl', sizeClasses[size], className), role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, children: [(title || icon) && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [icon && ((0,jsx_runtime.jsx)("div", { className: "text-gray-500 dark:text-gray-400", children: icon })), title && ((0,jsx_runtime.jsx)("h2", { id: "modal-title", className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: title }))] }), (0,jsx_runtime.jsx)("button", { onClick: onClose, className: "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", "aria-label": "Close modal", children: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] })), (0,jsx_runtime.jsx)("div", { className: "px-6 py-4", children: children })] })] }));
};
/* harmony default export */ const organisms_Modal = ((/* unused pure expression or super */ null && (Modal)));


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

/***/ 51782:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   w: () => (/* binding */ useAppRegistration)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33813);
/**
 * App Registration Hook
 *
 * Provides functionality for Azure App Registration setup including:
 * - Launching the PowerShell app registration script
 * - Monitoring for credential file creation
 * - Auto-importing credentials into profiles
 *
 * Pattern from GUI/MainViewModel.cs:2041-2087 (RunAppRegistrationAsync)
 */


/**
 * Hook for managing Azure App Registration workflow
 */
function useAppRegistration() {
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: null,
        success: false
    });
    const monitorIntervalRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const { addTargetProfile, updateTargetProfile } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K)();
    /**
     * Starts monitoring for credential files
     */
    const startMonitoring = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (companyName) => {
        setState(prev => ({
            ...prev,
            isMonitoring: true,
            progress: 'Waiting for app registration to complete...'
        }));
        const startTime = Date.now();
        const maxDuration = 5 * 60 * 1000; // 5 minutes
        const pollInterval = 5000; // 5 seconds
        monitorIntervalRef.current = setInterval(async () => {
            try {
                // Check if credentials exist
                const hasCredentials = await window.electronAPI.appRegistration.hasCredentials(companyName);
                if (hasCredentials) {
                    // Stop monitoring
                    if (monitorIntervalRef.current) {
                        clearInterval(monitorIntervalRef.current);
                        monitorIntervalRef.current = null;
                    }
                    setState(prev => ({
                        ...prev,
                        isMonitoring: false,
                        progress: 'Loading credentials...'
                    }));
                    // Read credential summary
                    const summary = await window.electronAPI.appRegistration.readSummary(companyName);
                    if (summary) {
                        // Decrypt client secret
                        const clientSecret = await window.electronAPI.appRegistration.decryptCredential(summary.CredentialFile);
                        if (clientSecret) {
                            // Auto-import into profile
                            const profileName = `${companyName} - Azure`;
                            // Check if profile already exists
                            const existingProfiles = _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K.getState().targetProfiles;
                            const existingProfile = existingProfiles.find(p => p.companyName === companyName && p.profileType === 'Azure');
                            if (existingProfile) {
                                // Update existing profile
                                updateTargetProfile(existingProfile.id, {
                                    tenantId: summary.TenantId,
                                    clientId: summary.ClientId,
                                    clientSecret: clientSecret,
                                    domain: summary.Domain || '',
                                    lastModified: new Date().toISOString()
                                });
                                setState({
                                    isRunning: false,
                                    isMonitoring: false,
                                    progress: '',
                                    error: null,
                                    success: true
                                });
                            }
                            else {
                                // Create new profile with required fields - cast to TargetProfile to avoid type mismatch
                                addTargetProfile({
                                    id: crypto.randomUUID(),
                                    name: profileName,
                                    companyName: companyName,
                                    profileType: 'Azure',
                                    tenantId: summary.TenantId,
                                    clientId: summary.ClientId,
                                    clientSecret: clientSecret,
                                    domain: summary.Domain || '',
                                    isConnected: false,
                                    created: summary.Created,
                                    lastModified: new Date().toISOString(),
                                    // Add missing required fields with defaults
                                    environment: 'Azure',
                                    region: 'Global',
                                    tenantName: summary.Domain || companyName,
                                    clientSecretEncrypted: 'true',
                                    sharePointUrl: '',
                                    sqlConnectionString: '',
                                    usernameEncrypted: '',
                                    passwordEncrypted: '',
                                    certificateThumbprint: '',
                                    scopes: [],
                                    lastConnectionTest: null,
                                    lastConnectionTestResult: null,
                                    lastConnectionTestMessage: '',
                                    isActive: false,
                                    createdAt: summary.Created,
                                });
                                setState({
                                    isRunning: false,
                                    isMonitoring: false,
                                    progress: '',
                                    error: null,
                                    success: true
                                });
                            }
                        }
                        else {
                            throw new Error('Failed to decrypt credential file');
                        }
                    }
                    else {
                        throw new Error('Failed to read credential summary');
                    }
                }
                else {
                    // Check for timeout
                    const elapsed = Date.now() - startTime;
                    if (elapsed > maxDuration) {
                        if (monitorIntervalRef.current) {
                            clearInterval(monitorIntervalRef.current);
                            monitorIntervalRef.current = null;
                        }
                        setState({
                            isRunning: false,
                            isMonitoring: false,
                            progress: '',
                            error: 'Timeout: App registration did not complete within 5 minutes',
                            success: false
                        });
                    }
                    else {
                        // Update progress
                        const remainingSeconds = Math.floor((maxDuration - elapsed) / 1000);
                        setState(prev => ({
                            ...prev,
                            progress: `Waiting for app registration... (${remainingSeconds}s remaining)`
                        }));
                    }
                }
            }
            catch (error) {
                // Stop monitoring on error
                if (monitorIntervalRef.current) {
                    clearInterval(monitorIntervalRef.current);
                    monitorIntervalRef.current = null;
                }
                setState({
                    isRunning: false,
                    isMonitoring: false,
                    progress: '',
                    error: error.message || 'Failed to import credentials',
                    success: false
                });
            }
        }, pollInterval);
    }, [addTargetProfile, updateTargetProfile]);
    /**
     * Stops monitoring for credential files
     */
    const stopMonitoring = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (monitorIntervalRef.current) {
            clearInterval(monitorIntervalRef.current);
            monitorIntervalRef.current = null;
        }
        setState(prev => ({
            ...prev,
            isMonitoring: false,
            isRunning: false,
            progress: ''
        }));
    }, []);
    /**
     * Launches the Azure App Registration script
     */
    const launchAppRegistration = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (options) => {
        try {
            setState({
                isRunning: true,
                isMonitoring: false,
                progress: 'Launching app registration script...',
                error: null,
                success: false
            });
            // Launch the PowerShell script
            const result = await window.electronAPI.appRegistration.launch(options);
            if (result.success) {
                // Start monitoring for credential files
                await startMonitoring(options.companyName);
            }
            else {
                setState({
                    isRunning: false,
                    isMonitoring: false,
                    progress: '',
                    error: result.error || 'Failed to launch app registration script',
                    success: false
                });
            }
        }
        catch (error) {
            setState({
                isRunning: false,
                isMonitoring: false,
                progress: '',
                error: error.message || 'An unexpected error occurred',
                success: false
            });
        }
    }, [startMonitoring]);
    /**
     * Checks if credentials already exist for a company
     */
    const checkExistingCredentials = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (companyName) => {
        try {
            return await window.electronAPI.appRegistration.hasCredentials(companyName);
        }
        catch (error) {
            console.error('Failed to check existing credentials:', error);
            return false;
        }
    }, []);
    /**
     * Imports existing credentials for a company
     */
    const importExistingCredentials = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (companyName) => {
        try {
            setState({
                isRunning: true,
                isMonitoring: false,
                progress: 'Importing credentials...',
                error: null,
                success: false
            });
            // Read credential summary
            const summary = await window.electronAPI.appRegistration.readSummary(companyName);
            if (!summary) {
                throw new Error('Credential summary not found');
            }
            // Decrypt client secret
            const clientSecret = await window.electronAPI.appRegistration.decryptCredential(summary.CredentialFile);
            if (!clientSecret) {
                throw new Error('Failed to decrypt credential file');
            }
            // Import into profile
            const profileName = `${companyName} - Azure`;
            // Check if profile already exists
            const existingProfiles = _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K.getState().targetProfiles;
            const existingProfile = existingProfiles.find(p => p.companyName === companyName && p.profileType === 'Azure');
            if (existingProfile) {
                // Update existing profile
                updateTargetProfile(existingProfile.id, {
                    tenantId: summary.TenantId,
                    clientId: summary.ClientId,
                    clientSecret: clientSecret,
                    domain: summary.Domain || '',
                    lastModified: new Date().toISOString()
                });
            }
            else {
                // Create new profile - cast to any to bypass type checking
                addTargetProfile({
                    id: crypto.randomUUID(),
                    name: profileName,
                    companyName: companyName,
                    profileType: 'Azure',
                    tenantId: summary.TenantId,
                    clientId: summary.ClientId,
                    clientSecret: clientSecret,
                    domain: summary.Domain || '',
                    isConnected: false,
                    created: summary.Created,
                    lastModified: new Date().toISOString()
                });
            }
            setState({
                isRunning: false,
                isMonitoring: false,
                progress: '',
                error: null,
                success: true
            });
        }
        catch (error) {
            setState({
                isRunning: false,
                isMonitoring: false,
                progress: '',
                error: error.message || 'Failed to import credentials',
                success: false
            });
        }
    }, [addTargetProfile, updateTargetProfile]);
    /**
     * Resets the state
     */
    const reset = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        stopMonitoring();
        setState({
            isRunning: false,
            isMonitoring: false,
            progress: '',
            error: null,
            success: false
        });
    }, [stopMonitoring]);
    return {
        state,
        launchAppRegistration,
        checkExistingCredentials,
        importExistingCredentials,
        stopMonitoring,
        reset
    };
}


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


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtBQUNBLGlFQUFlLFFBQVEsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2xpYi91dGlscy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9Nb2RhbC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9Mb2FkaW5nU3Bpbm5lci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQXBwUmVnaXN0cmF0aW9uLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgdGhlIHJlbmRlcmVyIHByb2Nlc3NcbiAqL1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgdHdNZXJnZSB9IGZyb20gJ3RhaWx3aW5kLW1lcmdlJztcbi8qKlxuICogQ29tYmluZXMgY2xhc3MgbmFtZXMgdXNpbmcgY2xzeCBhbmQgdGFpbHdpbmQtbWVyZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNuKC4uLmlucHV0cykge1xuICAgIHJldHVybiB0d01lcmdlKGNsc3goaW5wdXRzKSk7XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBNb2RhbCBDb21wb25lbnRcbiAqXG4gKiBBIHJldXNhYmxlIG1vZGFsIGRpYWxvZyBjb21wb25lbnQgd2l0aCB0aXRsZSwgaWNvbiwgYW5kIHNpemUgb3B0aW9ucy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgY24gfSBmcm9tICcuLi8uLi9saWIvdXRpbHMnO1xuY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgc206ICdtYXgtdy1tZCcsXG4gICAgbWQ6ICdtYXgtdy1sZycsXG4gICAgbGc6ICdtYXgtdy0yeGwnLFxuICAgIHhsOiAnbWF4LXctNHhsJyxcbn07XG5leHBvcnQgY29uc3QgTW9kYWwgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIHRpdGxlLCBpY29uLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCBjaGlsZHJlbiwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBIYW5kbGUgRVNDIGtleVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghaXNPcGVuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBoYW5kbGVFc2NhcGUgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICAgICAgICAgIG9uQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVFc2NhcGUpO1xuICAgICAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVFc2NhcGUpO1xuICAgIH0sIFtpc09wZW4sIG9uQ2xvc2VdKTtcbiAgICAvLyBQcmV2ZW50IGJvZHkgc2Nyb2xsIHdoZW4gbW9kYWwgaXMgb3BlblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChpc09wZW4pIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICB9O1xuICAgIH0sIFtpc09wZW5dKTtcbiAgICBpZiAoIWlzT3BlbilcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIHotNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgYmctYmxhY2svNTAgYmFja2Ryb3AtYmx1ci1zbVwiLCBvbkNsaWNrOiBvbkNsb3NlLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY24oJ3JlbGF0aXZlIHctZnVsbCBteC00IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGwnLCBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKSwgcm9sZTogXCJkaWFsb2dcIiwgXCJhcmlhLW1vZGFsXCI6IFwidHJ1ZVwiLCBcImFyaWEtbGFiZWxsZWRieVwiOiB0aXRsZSA/ICdtb2RhbC10aXRsZScgOiB1bmRlZmluZWQsIGNoaWxkcmVuOiBbKHRpdGxlIHx8IGljb24pICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNiBweS00IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbaWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogaWNvbiB9KSksIHRpdGxlICYmIChfanN4KFwiaDJcIiwgeyBpZDogXCJtb2RhbC10aXRsZVwiLCBjbGFzc05hbWU6IFwidGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiB0aXRsZSB9KSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbG9zZSwgY2xhc3NOYW1lOiBcInAtMSByb3VuZGVkLW1kIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgdHJhbnNpdGlvbi1jb2xvcnNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xvc2UgbW9kYWxcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiIH0pIH0pXSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHgtNiBweS00XCIsIGNoaWxkcmVuOiBjaGlsZHJlbiB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBNb2RhbDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIExvYWRpbmdTcGlubmVyIENvbXBvbmVudFxuICpcbiAqIFNpbXBsZSBsb2FkaW5nIHNwaW5uZXIgZm9yIGlubGluZSBsb2FkaW5nIHN0YXRlc1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTG9hZGVyMiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIExvYWRpbmdTcGlubmVyIGNvbXBvbmVudCBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmNvbnN0IExvYWRpbmdTcGlubmVyID0gKHsgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBTaXplIG1hcHBpbmdzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAxNixcbiAgICAgICAgbWQ6IDI0LFxuICAgICAgICBsZzogMzIsXG4gICAgICAgIHhsOiA0OCxcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeChMb2FkZXIyLCB7IGNsYXNzTmFtZTogY2xzeCgnYW5pbWF0ZS1zcGluIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwJywgY2xhc3NOYW1lKSwgc2l6ZTogc2l6ZXNbc2l6ZV0sIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTcGlubmVyO1xuIiwiLyoqXG4gKiBBcHAgUmVnaXN0cmF0aW9uIEhvb2tcbiAqXG4gKiBQcm92aWRlcyBmdW5jdGlvbmFsaXR5IGZvciBBenVyZSBBcHAgUmVnaXN0cmF0aW9uIHNldHVwIGluY2x1ZGluZzpcbiAqIC0gTGF1bmNoaW5nIHRoZSBQb3dlclNoZWxsIGFwcCByZWdpc3RyYXRpb24gc2NyaXB0XG4gKiAtIE1vbml0b3JpbmcgZm9yIGNyZWRlbnRpYWwgZmlsZSBjcmVhdGlvblxuICogLSBBdXRvLWltcG9ydGluZyBjcmVkZW50aWFscyBpbnRvIHByb2ZpbGVzXG4gKlxuICogUGF0dGVybiBmcm9tIEdVSS9NYWluVmlld01vZGVsLmNzOjIwNDEtMjA4NyAoUnVuQXBwUmVnaXN0cmF0aW9uQXN5bmMpXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbi8qKlxuICogSG9vayBmb3IgbWFuYWdpbmcgQXp1cmUgQXBwIFJlZ2lzdHJhdGlvbiB3b3JrZmxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQXBwUmVnaXN0cmF0aW9uKCkge1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgIH0pO1xuICAgIGNvbnN0IG1vbml0b3JJbnRlcnZhbFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCB7IGFkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnRNb25pdG9yaW5nID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm9ncmVzczogJ1dhaXRpbmcgZm9yIGFwcCByZWdpc3RyYXRpb24gdG8gY29tcGxldGUuLi4nXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgbWF4RHVyYXRpb24gPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbiAgICAgICAgY29uc3QgcG9sbEludGVydmFsID0gNTAwMDsgLy8gNSBzZWNvbmRzXG4gICAgICAgIG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50ID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBjcmVkZW50aWFscyBleGlzdFxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc0NyZWRlbnRpYWxzID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5oYXNDcmVkZW50aWFscyhjb21wYW55TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN0b3AgbW9uaXRvcmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICdMb2FkaW5nIGNyZWRlbnRpYWxzLi4uJ1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWQgY3JlZGVudGlhbCBzdW1tYXJ5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLnJlYWRTdW1tYXJ5KGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlY3J5cHQgY2xpZW50IHNlY3JldFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50U2VjcmV0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5kZWNyeXB0Q3JlZGVudGlhbChzdW1tYXJ5LkNyZWRlbnRpYWxGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGllbnRTZWNyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBdXRvLWltcG9ydCBpbnRvIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGAke2NvbXBhbnlOYW1lfSAtIEF6dXJlYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBwcm9maWxlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcm9maWxlcyA9IHVzZVByb2ZpbGVTdG9yZS5nZXRTdGF0ZSgpLnRhcmdldFByb2ZpbGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZSA9IGV4aXN0aW5nUHJvZmlsZXMuZmluZChwID0+IHAuY29tcGFueU5hbWUgPT09IGNvbXBhbnlOYW1lICYmIHAucHJvZmlsZVR5cGUgPT09ICdBenVyZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1Byb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlVGFyZ2V0UHJvZmlsZShleGlzdGluZ1Byb2ZpbGUuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHN1bW1hcnkuQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHByb2ZpbGUgd2l0aCByZXF1aXJlZCBmaWVsZHMgLSBjYXN0IHRvIFRhcmdldFByb2ZpbGUgdG8gYXZvaWQgdHlwZSBtaXNtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRUYXJnZXRQcm9maWxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55TmFtZTogY29tcGFueU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlVHlwZTogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHN1bW1hcnkuQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Nvbm5lY3RlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkOiBzdW1tYXJ5LkNyZWF0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyB3aXRoIGRlZmF1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudDogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogJ0dsb2JhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnROYW1lOiBzdW1tYXJ5LkRvbWFpbiB8fCBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldEVuY3J5cHRlZDogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVQb2ludFVybDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcWxDb25uZWN0aW9uU3RyaW5nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lRW5jcnlwdGVkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkRW5jcnlwdGVkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0UmVzdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0TWVzc2FnZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHN1bW1hcnkuQ3JlYXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlY3J5cHQgY3JlZGVudGlhbCBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZWFkIGNyZWRlbnRpYWwgc3VtbWFyeScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgdGltZW91dFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsYXBzZWQgPiBtYXhEdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdUaW1lb3V0OiBBcHAgcmVnaXN0cmF0aW9uIGRpZCBub3QgY29tcGxldGUgd2l0aGluIDUgbWludXRlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHByb2dyZXNzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdTZWNvbmRzID0gTWF0aC5mbG9vcigobWF4RHVyYXRpb24gLSBlbGFwc2VkKSAvIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IGBXYWl0aW5nIGZvciBhcHAgcmVnaXN0cmF0aW9uLi4uICgke3JlbWFpbmluZ1NlY29uZHN9cyByZW1haW5pbmcpYFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gU3RvcCBtb25pdG9yaW5nIG9uIGVycm9yXG4gICAgICAgICAgICAgICAgaWYgKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGltcG9ydCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHBvbGxJbnRlcnZhbCk7XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBTdG9wcyBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RvcE1vbml0b3JpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTGF1bmNoZXMgdGhlIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gc2NyaXB0XG4gICAgICovXG4gICAgY29uc3QgbGF1bmNoQXBwUmVnaXN0cmF0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xhdW5jaGluZyBhcHAgcmVnaXN0cmF0aW9uIHNjcmlwdC4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gTGF1bmNoIHRoZSBQb3dlclNoZWxsIHNjcmlwdFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5sYXVuY2gob3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RhcnRNb25pdG9yaW5nKG9wdGlvbnMuY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBsYXVuY2ggYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0FuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGFydE1vbml0b3JpbmddKTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgY3JlZGVudGlhbHMgYWxyZWFkeSBleGlzdCBmb3IgYSBjb21wYW55XG4gICAgICovXG4gICAgY29uc3QgY2hlY2tFeGlzdGluZ0NyZWRlbnRpYWxzID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5oYXNDcmVkZW50aWFscyhjb21wYW55TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2hlY2sgZXhpc3RpbmcgY3JlZGVudGlhbHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIEltcG9ydHMgZXhpc3RpbmcgY3JlZGVudGlhbHMgZm9yIGEgY29tcGFueVxuICAgICAqL1xuICAgIGNvbnN0IGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMgPSB1c2VDYWxsYmFjayhhc3luYyAoY29tcGFueU5hbWUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0ltcG9ydGluZyBjcmVkZW50aWFscy4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVhZCBjcmVkZW50aWFsIHN1bW1hcnlcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLnJlYWRTdW1tYXJ5KGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3JlZGVudGlhbCBzdW1tYXJ5IG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGVjcnlwdCBjbGllbnQgc2VjcmV0XG4gICAgICAgICAgICBjb25zdCBjbGllbnRTZWNyZXQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmRlY3J5cHRDcmVkZW50aWFsKHN1bW1hcnkuQ3JlZGVudGlhbEZpbGUpO1xuICAgICAgICAgICAgaWYgKCFjbGllbnRTZWNyZXQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBkZWNyeXB0IGNyZWRlbnRpYWwgZmlsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSW1wb3J0IGludG8gcHJvZmlsZVxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSBgJHtjb21wYW55TmFtZX0gLSBBenVyZWA7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwcm9maWxlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGVzID0gdXNlUHJvZmlsZVN0b3JlLmdldFN0YXRlKCkudGFyZ2V0UHJvZmlsZXM7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGUgPSBleGlzdGluZ1Byb2ZpbGVzLmZpbmQocCA9PiBwLmNvbXBhbnlOYW1lID09PSBjb21wYW55TmFtZSAmJiBwLnByb2ZpbGVUeXBlID09PSAnQXp1cmUnKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1Byb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcHJvZmlsZVxuICAgICAgICAgICAgICAgIHVwZGF0ZVRhcmdldFByb2ZpbGUoZXhpc3RpbmdQcm9maWxlLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHByb2ZpbGUgLSBjYXN0IHRvIGFueSB0byBieXBhc3MgdHlwZSBjaGVja2luZ1xuICAgICAgICAgICAgICAgIGFkZFRhcmdldFByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZVR5cGU6ICdBenVyZScsXG4gICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZDogc3VtbWFyeS5DcmVhdGVkLFxuICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGltcG9ydCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHN0YXRlXG4gICAgICovXG4gICAgY29uc3QgcmVzZXQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHN0b3BNb25pdG9yaW5nKCk7XG4gICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9LCBbc3RvcE1vbml0b3JpbmddKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZSxcbiAgICAgICAgbGF1bmNoQXBwUmVnaXN0cmF0aW9uLFxuICAgICAgICBjaGVja0V4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIHN0b3BNb25pdG9yaW5nLFxuICAgICAgICByZXNldFxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqXG4gKiBGdWxseSBhY2Nlc3NpYmxlIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGxhYmVscyBhbmQgZXJyb3Igc3RhdGVzLlxuICogRm9sbG93cyBXQ0FHIDIuMSBBQSBndWlkZWxpbmVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGVjayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQ2hlY2tib3ggPSAoeyBsYWJlbCwgZGVzY3JpcHRpb24sIGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGVycm9yLCBkaXNhYmxlZCA9IGZhbHNlLCBpbmRldGVybWluYXRlID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgZGVzY3JpcHRpb25JZCA9IGAke2lkfS1kZXNjcmlwdGlvbmA7XG4gICAgY29uc3QgaGFzRXJyb3IgPSBCb29sZWFuKGVycm9yKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgaW5kZXRlcm1pbmF0ZSB2aWEgcmVmXG4gICAgY29uc3QgY2hlY2tib3hSZWYgPSBSZWFjdC51c2VSZWYobnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNoZWNrYm94UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNoZWNrYm94UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9LCBbaW5kZXRlcm1pbmF0ZV0pO1xuICAgIGNvbnN0IGNoZWNrYm94Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaC01IHctNSByb3VuZGVkIGJvcmRlci0yJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGFyazpyaW5nLW9mZnNldC1ncmF5LTkwMCcsIFxuICAgIC8vIFN0YXRlLWJhc2VkIHN0eWxlc1xuICAgIHtcbiAgICAgICAgLy8gTm9ybWFsIHN0YXRlICh1bmNoZWNrZWQpXG4gICAgICAgICdib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS01MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQgJiYgIWNoZWNrZWQsXG4gICAgICAgICdmb2N1czpyaW5nLWJsdWUtNTAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gQ2hlY2tlZCBzdGF0ZVxuICAgICAgICAnYmctYmx1ZS02MDAgYm9yZGVyLWJsdWUtNjAwIGRhcms6YmctYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS01MDAnOiBjaGVja2VkICYmICFkaXNhYmxlZCAmJiAhaGFzRXJyb3IsXG4gICAgICAgIC8vIEVycm9yIHN0YXRlXG4gICAgICAgICdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC02MDAgZGFyazpib3JkZXItcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktODAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ3RleHQtc20gZm9udC1tZWRpdW0nLCB7XG4gICAgICAgICd0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wnLCBjbGFzc05hbWUpLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBoLTVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGNoZWNrYm94UmVmLCBpZDogaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogY2hlY2tlZCwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IFwic3Itb25seSBwZWVyXCIsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXJyb3JJZF06IGhhc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uSWRdOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSksIF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGNoZWNrYm94Q2xhc3NlcywgJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1wb2ludGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgY2hpbGRyZW46IFtjaGVja2VkICYmICFpbmRldGVybWluYXRlICYmIChfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00IHRleHQtd2hpdGVcIiwgc3Ryb2tlV2lkdGg6IDMgfSkpLCBpbmRldGVybWluYXRlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMC41IHctMyBiZy13aGl0ZSByb3VuZGVkXCIgfSkpXSB9KV0gfSksIChsYWJlbCB8fCBkZXNjcmlwdGlvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1sLTNcIiwgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChsYWJlbENsYXNzZXMsICdjdXJzb3ItcG9pbnRlcicpLCBjaGlsZHJlbjogbGFiZWwgfSkpLCBkZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBpZDogZGVzY3JpcHRpb25JZCwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMC41XCIsIGNoaWxkcmVuOiBkZXNjcmlwdGlvbiB9KSldIH0pKV0gfSksIGhhc0Vycm9yICYmIChfanN4KFwicFwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IFwibXQtMSBtbC04IHRleHQtc20gdGV4dC1yZWQtNjAwXCIsIHJvbGU6IFwiYWxlcnRcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGVycm9yIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9