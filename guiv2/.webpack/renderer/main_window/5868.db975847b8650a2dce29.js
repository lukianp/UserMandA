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
/* unused harmony export REGISTRATION_STEPS */
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


// Registration steps in order
const REGISTRATION_STEPS = [
    { id: 'Initialization', label: 'Initializing', description: 'Setting up script environment' },
    { id: 'Prerequisites', label: 'Prerequisites', description: 'Validating system requirements' },
    { id: 'ModuleManagement', label: 'Modules', description: 'Loading PowerShell modules' },
    { id: 'GraphConnection', label: 'Graph Connection', description: 'Connecting to Microsoft Graph' },
    { id: 'AzureConnection', label: 'Azure Connection', description: 'Connecting to Azure' },
    { id: 'AppRegistration', label: 'App Registration', description: 'Creating Azure AD application' },
    { id: 'PermissionGrant', label: 'Permissions', description: 'Granting admin consent' },
    { id: 'RoleAssignment', label: 'Role Assignment', description: 'Assigning directory roles' },
    { id: 'SubscriptionAccess', label: 'Subscriptions', description: 'Configuring subscription access' },
    { id: 'SecretCreation', label: 'Secret', description: 'Creating client secret' },
    { id: 'CredentialStorage', label: 'Storage', description: 'Saving encrypted credentials' },
    { id: 'Complete', label: 'Complete', description: 'Registration complete' },
];
/**
 * Hook for managing Azure App Registration workflow
 */
function useAppRegistration() {
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        isRunning: false,
        isMonitoring: false,
        progress: '',
        error: null,
        success: false,
        currentStep: null,
        registrationStatus: null,
    });
    const monitorIntervalRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const { addTargetProfile, updateTargetProfile } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K)();
    /**
     * Starts monitoring for credential files and status updates
     */
    const startMonitoring = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (companyName) => {
        setState(prev => ({
            ...prev,
            isMonitoring: true,
            progress: 'Waiting for app registration to complete...',
            currentStep: 'Initialization',
        }));
        const startTime = Date.now();
        const maxDuration = 10 * 60 * 1000; // 10 minutes (increased for module loading)
        const pollInterval = 500; // 500ms for snappy UI updates through each step
        monitorIntervalRef.current = setInterval(async () => {
            try {
                // Check status file and credentials in parallel for faster updates
                const [status, hasCredentials] = await Promise.all([
                    window.electronAPI.appRegistration.readStatus(companyName),
                    window.electronAPI.appRegistration.hasCredentials(companyName)
                ]);
                if (status) {
                    // Update state with current step and status
                    setState(prev => ({
                        ...prev,
                        currentStep: status.step,
                        registrationStatus: status,
                        progress: status.message,
                    }));
                    // Check if script failed
                    if (status.status === 'failed') {
                        if (monitorIntervalRef.current) {
                            clearInterval(monitorIntervalRef.current);
                            monitorIntervalRef.current = null;
                        }
                        setState({
                            isRunning: false,
                            isMonitoring: false,
                            progress: '',
                            error: status.error || 'App registration failed',
                            success: false,
                            currentStep: 'Error',
                            registrationStatus: status,
                        });
                        return;
                    }
                    // Check if script succeeded - also check credentials
                    if (status.status === 'success') {
                        // Script finished successfully, now import credentials
                        setState(prev => ({
                            ...prev,
                            progress: 'Loading credentials...',
                            currentStep: 'Complete',
                        }));
                    }
                }
                // Check if credentials exist (already fetched in parallel above)
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
                                    success: true,
                                    currentStep: 'Complete',
                                    registrationStatus: null,
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
                                    success: true,
                                    currentStep: 'Complete',
                                    registrationStatus: null,
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
                            error: 'Timeout: App registration did not complete within 10 minutes',
                            success: false,
                            currentStep: null,
                            registrationStatus: null,
                        });
                    }
                    // Progress is now updated from status file, no need for countdown here
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
                    success: false,
                    currentStep: null,
                    registrationStatus: null,
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
            // Clear any previous status file
            await window.electronAPI.appRegistration.clearStatus(options.companyName);
            setState({
                isRunning: true,
                isMonitoring: false,
                progress: 'Launching app registration script...',
                error: null,
                success: false,
                currentStep: null,
                registrationStatus: null,
            });
            // Launch the PowerShell script
            const result = await window.electronAPI.appRegistration.launch(options);
            if (result.success) {
                // Start monitoring for credential files and status updates
                await startMonitoring(options.companyName);
            }
            else {
                setState({
                    isRunning: false,
                    isMonitoring: false,
                    progress: '',
                    error: result.error || 'Failed to launch app registration script',
                    success: false,
                    currentStep: null,
                    registrationStatus: null,
                });
            }
        }
        catch (error) {
            setState({
                isRunning: false,
                isMonitoring: false,
                progress: '',
                error: error.message || 'An unexpected error occurred',
                success: false,
                currentStep: null,
                registrationStatus: null,
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
                success: false,
                currentStep: null,
                registrationStatus: null,
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
                success: true,
                currentStep: 'Complete',
                registrationStatus: null,
            });
        }
        catch (error) {
            setState({
                isRunning: false,
                isMonitoring: false,
                progress: '',
                error: error.message || 'Failed to import credentials',
                success: false,
                currentStep: null,
                registrationStatus: null,
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
            success: false,
            currentStep: null,
            registrationStatus: null,
        });
    }, [stopMonitoring]);
    return {
        state,
        launchAppRegistration,
        checkExistingCredentials,
        importExistingCredentials,
        stopMonitoring,
        reset,
        REGISTRATION_STEPS, // Export for UI consumption
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixtREFBSTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHlCQUF5QixtREFBSTtBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWSx1REFBSyxVQUFVLFdBQVcsbURBQUkseUNBQXlDLHVEQUFLLFVBQVUsMENBQTBDLHVEQUFLLFVBQVUsK0NBQStDLHNEQUFJLFlBQVksbUxBQW1MLG1EQUFJO0FBQ2paO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLEdBQUcsdURBQUssWUFBWSx3QkFBd0IsbURBQUk7QUFDdkc7QUFDQSxpQ0FBaUMsNENBQTRDLHNEQUFJLENBQUMsMERBQUssSUFBSSxpREFBaUQsc0JBQXNCLHNEQUFJLFVBQVUseUNBQXlDLEtBQUssSUFBSSw4QkFBOEIsdURBQUssVUFBVSx3Q0FBd0Msc0RBQUksWUFBWSx3QkFBd0IsbURBQUksbURBQW1ELG9CQUFvQixzREFBSSxRQUFRLHdHQUF3RyxLQUFLLEtBQUssZ0JBQWdCLHNEQUFJLFFBQVEsaUhBQWlILEtBQUs7QUFDMXJCO0FBQ0EsaUVBQWUsUUFBUSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvbGliL3V0aWxzLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL01vZGFsLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0xvYWRpbmdTcGlubmVyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VBcHBSZWdpc3RyYXRpb24udHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zIGZvciB0aGUgcmVuZGVyZXIgcHJvY2Vzc1xuICovXG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyB0d01lcmdlIH0gZnJvbSAndGFpbHdpbmQtbWVyZ2UnO1xuLyoqXG4gKiBDb21iaW5lcyBjbGFzcyBuYW1lcyB1c2luZyBjbHN4IGFuZCB0YWlsd2luZC1tZXJnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY24oLi4uaW5wdXRzKSB7XG4gICAgcmV0dXJuIHR3TWVyZ2UoY2xzeChpbnB1dHMpKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE1vZGFsIENvbXBvbmVudFxuICpcbiAqIEEgcmV1c2FibGUgbW9kYWwgZGlhbG9nIGNvbXBvbmVudCB3aXRoIHRpdGxlLCBpY29uLCBhbmQgc2l6ZSBvcHRpb25zLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBjbiB9IGZyb20gJy4uLy4uL2xpYi91dGlscyc7XG5jb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICBzbTogJ21heC13LW1kJyxcbiAgICBtZDogJ21heC13LWxnJyxcbiAgICBsZzogJ21heC13LTJ4bCcsXG4gICAgeGw6ICdtYXgtdy00eGwnLFxufTtcbmV4cG9ydCBjb25zdCBNb2RhbCA9ICh7IGlzT3Blbiwgb25DbG9zZSwgdGl0bGUsIGljb24sIHNpemUgPSAnbWQnLCBjbGFzc05hbWUsIGNoaWxkcmVuLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIEhhbmRsZSBFU0Mga2V5XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFpc09wZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZUVzY2FwZSA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUVzY2FwZSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUVzY2FwZSk7XG4gICAgfSwgW2lzT3Blbiwgb25DbG9zZV0pO1xuICAgIC8vIFByZXZlbnQgYm9keSBzY3JvbGwgd2hlbiBtb2RhbCBpcyBvcGVuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGlzT3Blbikge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgIH07XG4gICAgfSwgW2lzT3Blbl0pO1xuICAgIGlmICghaXNPcGVuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay81MCBiYWNrZHJvcC1ibHVyLXNtXCIsIG9uQ2xpY2s6IG9uQ2xvc2UsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbigncmVsYXRpdmUgdy1mdWxsIG14LTQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy14bCcsIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpLCByb2xlOiBcImRpYWxvZ1wiLCBcImFyaWEtbW9kYWxcIjogXCJ0cnVlXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IHRpdGxlID8gJ21vZGFsLXRpdGxlJyA6IHVuZGVmaW5lZCwgY2hpbGRyZW46IFsodGl0bGUgfHwgaWNvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC02IHB5LTQgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtpY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBpY29uIH0pKSwgdGl0bGUgJiYgKF9qc3goXCJoMlwiLCB7IGlkOiBcIm1vZGFsLXRpdGxlXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHRpdGxlIH0pKV0gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicC0xIHJvdW5kZWQtbWQgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCB0cmFuc2l0aW9uLWNvbG9yc1wiLCBcImFyaWEtbGFiZWxcIjogXCJDbG9zZSBtb2RhbFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSkgfSldIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTRcIiwgY2hpbGRyZW46IGNoaWxkcmVuIH0pXSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE1vZGFsO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgQ29tcG9uZW50XG4gKlxuICogU2ltcGxlIGxvYWRpbmcgc3Bpbm5lciBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBMb2FkZXIyIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgY29tcG9uZW50IGZvciBpbmxpbmUgbG9hZGluZyBzdGF0ZXNcbiAqL1xuY29uc3QgTG9hZGluZ1NwaW5uZXIgPSAoeyBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFNpemUgbWFwcGluZ3NcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206IDE2LFxuICAgICAgICBtZDogMjQsXG4gICAgICAgIGxnOiAzMixcbiAgICAgICAgeGw6IDQ4LFxuICAgIH07XG4gICAgcmV0dXJuIChfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhbmltYXRlLXNwaW4gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLCBjbGFzc05hbWUpLCBzaXplOiBzaXplc1tzaXplXSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NwaW5uZXI7XG4iLCIvKipcbiAqIEFwcCBSZWdpc3RyYXRpb24gSG9va1xuICpcbiAqIFByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgZm9yIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gc2V0dXAgaW5jbHVkaW5nOlxuICogLSBMYXVuY2hpbmcgdGhlIFBvd2VyU2hlbGwgYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHRcbiAqIC0gTW9uaXRvcmluZyBmb3IgY3JlZGVudGlhbCBmaWxlIGNyZWF0aW9uXG4gKiAtIEF1dG8taW1wb3J0aW5nIGNyZWRlbnRpYWxzIGludG8gcHJvZmlsZXNcbiAqXG4gKiBQYXR0ZXJuIGZyb20gR1VJL01haW5WaWV3TW9kZWwuY3M6MjA0MS0yMDg3IChSdW5BcHBSZWdpc3RyYXRpb25Bc3luYylcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuLy8gUmVnaXN0cmF0aW9uIHN0ZXBzIGluIG9yZGVyXG5leHBvcnQgY29uc3QgUkVHSVNUUkFUSU9OX1NURVBTID0gW1xuICAgIHsgaWQ6ICdJbml0aWFsaXphdGlvbicsIGxhYmVsOiAnSW5pdGlhbGl6aW5nJywgZGVzY3JpcHRpb246ICdTZXR0aW5nIHVwIHNjcmlwdCBlbnZpcm9ubWVudCcgfSxcbiAgICB7IGlkOiAnUHJlcmVxdWlzaXRlcycsIGxhYmVsOiAnUHJlcmVxdWlzaXRlcycsIGRlc2NyaXB0aW9uOiAnVmFsaWRhdGluZyBzeXN0ZW0gcmVxdWlyZW1lbnRzJyB9LFxuICAgIHsgaWQ6ICdNb2R1bGVNYW5hZ2VtZW50JywgbGFiZWw6ICdNb2R1bGVzJywgZGVzY3JpcHRpb246ICdMb2FkaW5nIFBvd2VyU2hlbGwgbW9kdWxlcycgfSxcbiAgICB7IGlkOiAnR3JhcGhDb25uZWN0aW9uJywgbGFiZWw6ICdHcmFwaCBDb25uZWN0aW9uJywgZGVzY3JpcHRpb246ICdDb25uZWN0aW5nIHRvIE1pY3Jvc29mdCBHcmFwaCcgfSxcbiAgICB7IGlkOiAnQXp1cmVDb25uZWN0aW9uJywgbGFiZWw6ICdBenVyZSBDb25uZWN0aW9uJywgZGVzY3JpcHRpb246ICdDb25uZWN0aW5nIHRvIEF6dXJlJyB9LFxuICAgIHsgaWQ6ICdBcHBSZWdpc3RyYXRpb24nLCBsYWJlbDogJ0FwcCBSZWdpc3RyYXRpb24nLCBkZXNjcmlwdGlvbjogJ0NyZWF0aW5nIEF6dXJlIEFEIGFwcGxpY2F0aW9uJyB9LFxuICAgIHsgaWQ6ICdQZXJtaXNzaW9uR3JhbnQnLCBsYWJlbDogJ1Blcm1pc3Npb25zJywgZGVzY3JpcHRpb246ICdHcmFudGluZyBhZG1pbiBjb25zZW50JyB9LFxuICAgIHsgaWQ6ICdSb2xlQXNzaWdubWVudCcsIGxhYmVsOiAnUm9sZSBBc3NpZ25tZW50JywgZGVzY3JpcHRpb246ICdBc3NpZ25pbmcgZGlyZWN0b3J5IHJvbGVzJyB9LFxuICAgIHsgaWQ6ICdTdWJzY3JpcHRpb25BY2Nlc3MnLCBsYWJlbDogJ1N1YnNjcmlwdGlvbnMnLCBkZXNjcmlwdGlvbjogJ0NvbmZpZ3VyaW5nIHN1YnNjcmlwdGlvbiBhY2Nlc3MnIH0sXG4gICAgeyBpZDogJ1NlY3JldENyZWF0aW9uJywgbGFiZWw6ICdTZWNyZXQnLCBkZXNjcmlwdGlvbjogJ0NyZWF0aW5nIGNsaWVudCBzZWNyZXQnIH0sXG4gICAgeyBpZDogJ0NyZWRlbnRpYWxTdG9yYWdlJywgbGFiZWw6ICdTdG9yYWdlJywgZGVzY3JpcHRpb246ICdTYXZpbmcgZW5jcnlwdGVkIGNyZWRlbnRpYWxzJyB9LFxuICAgIHsgaWQ6ICdDb21wbGV0ZScsIGxhYmVsOiAnQ29tcGxldGUnLCBkZXNjcmlwdGlvbjogJ1JlZ2lzdHJhdGlvbiBjb21wbGV0ZScgfSxcbl07XG4vKipcbiAqIEhvb2sgZm9yIG1hbmFnaW5nIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gd29ya2Zsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFwcFJlZ2lzdHJhdGlvbigpIHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3QgbW9uaXRvckludGVydmFsUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IHsgYWRkVGFyZ2V0UHJvZmlsZSwgdXBkYXRlVGFyZ2V0UHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgLyoqXG4gICAgICogU3RhcnRzIG1vbml0b3JpbmcgZm9yIGNyZWRlbnRpYWwgZmlsZXMgYW5kIHN0YXR1cyB1cGRhdGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnRNb25pdG9yaW5nID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm9ncmVzczogJ1dhaXRpbmcgZm9yIGFwcCByZWdpc3RyYXRpb24gdG8gY29tcGxldGUuLi4nLFxuICAgICAgICAgICAgY3VycmVudFN0ZXA6ICdJbml0aWFsaXphdGlvbicsXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgbWF4RHVyYXRpb24gPSAxMCAqIDYwICogMTAwMDsgLy8gMTAgbWludXRlcyAoaW5jcmVhc2VkIGZvciBtb2R1bGUgbG9hZGluZylcbiAgICAgICAgY29uc3QgcG9sbEludGVydmFsID0gNTAwOyAvLyA1MDBtcyBmb3Igc25hcHB5IFVJIHVwZGF0ZXMgdGhyb3VnaCBlYWNoIHN0ZXBcbiAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIHN0YXR1cyBmaWxlIGFuZCBjcmVkZW50aWFscyBpbiBwYXJhbGxlbCBmb3IgZmFzdGVyIHVwZGF0ZXNcbiAgICAgICAgICAgICAgICBjb25zdCBbc3RhdHVzLCBoYXNDcmVkZW50aWFsc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN0YXR1cyhjb21wYW55TmFtZSksXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24uaGFzQ3JlZGVudGlhbHMoY29tcGFueU5hbWUpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgc3RhdGUgd2l0aCBjdXJyZW50IHN0ZXAgYW5kIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IHN0YXR1cy5zdGVwLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogc3RhdHVzLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgc2NyaXB0IGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBzdGF0dXMuZXJyb3IgfHwgJ0FwcCByZWdpc3RyYXRpb24gZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0Vycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHNjcmlwdCBzdWNjZWVkZWQgLSBhbHNvIGNoZWNrIGNyZWRlbnRpYWxzXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNjcmlwdCBmaW5pc2hlZCBzdWNjZXNzZnVsbHksIG5vdyBpbXBvcnQgY3JlZGVudGlhbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnTG9hZGluZyBjcmVkZW50aWFscy4uLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6ICdDb21wbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgY3JlZGVudGlhbHMgZXhpc3QgKGFscmVhZHkgZmV0Y2hlZCBpbiBwYXJhbGxlbCBhYm92ZSlcbiAgICAgICAgICAgICAgICBpZiAoaGFzQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCBtb25pdG9yaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xvYWRpbmcgY3JlZGVudGlhbHMuLi4nXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZCBjcmVkZW50aWFsIHN1bW1hcnlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN1bW1hcnkoY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVjcnlwdCBjbGllbnQgc2VjcmV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnRTZWNyZXQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmRlY3J5cHRDcmVkZW50aWFsKHN1bW1hcnkuQ3JlZGVudGlhbEZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsaWVudFNlY3JldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF1dG8taW1wb3J0IGludG8gcHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gYCR7Y29tcGFueU5hbWV9IC0gQXp1cmVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHByb2ZpbGUgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGVzID0gdXNlUHJvZmlsZVN0b3JlLmdldFN0YXRlKCkudGFyZ2V0UHJvZmlsZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcm9maWxlID0gZXhpc3RpbmdQcm9maWxlcy5maW5kKHAgPT4gcC5jb21wYW55TmFtZSA9PT0gY29tcGFueU5hbWUgJiYgcC5wcm9maWxlVHlwZSA9PT0gJ0F6dXJlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUYXJnZXRQcm9maWxlKGV4aXN0aW5nUHJvZmlsZS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldDogY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnQ29tcGxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZSB3aXRoIHJlcXVpcmVkIGZpZWxkcyAtIGNhc3QgdG8gVGFyZ2V0UHJvZmlsZSB0byBhdm9pZCB0eXBlIG1pc21hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFRhcmdldFByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVUeXBlOiAnQXp1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldDogY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IHN1bW1hcnkuQ3JlYXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzIHdpdGggZGVmYXVsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiAnQXp1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiAnR2xvYmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudE5hbWU6IHN1bW1hcnkuRG9tYWluIHx8IGNvbXBhbnlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0RW5jcnlwdGVkOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZVBvaW50VXJsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNxbENvbm5lY3Rpb25TdHJpbmc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWVFbmNyeXB0ZWQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmRFbmNyeXB0ZWQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VydGlmaWNhdGVUaHVtYnByaW50OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3RSZXN1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3RNZXNzYWdlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogc3VtbWFyeS5DcmVhdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZGVjcnlwdCBjcmVkZW50aWFsIGZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJlYWQgY3JlZGVudGlhbCBzdW1tYXJ5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciB0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA+IG1heER1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ1RpbWVvdXQ6IEFwcCByZWdpc3RyYXRpb24gZGlkIG5vdCBjb21wbGV0ZSB3aXRoaW4gMTAgbWludXRlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgaXMgbm93IHVwZGF0ZWQgZnJvbSBzdGF0dXMgZmlsZSwgbm8gbmVlZCBmb3IgY291bnRkb3duIGhlcmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBTdG9wIG1vbml0b3Jpbmcgb24gZXJyb3JcbiAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgIG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gaW1wb3J0IGNyZWRlbnRpYWxzJyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHBvbGxJbnRlcnZhbCk7XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBTdG9wcyBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RvcE1vbml0b3JpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTGF1bmNoZXMgdGhlIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gc2NyaXB0XG4gICAgICovXG4gICAgY29uc3QgbGF1bmNoQXBwUmVnaXN0cmF0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENsZWFyIGFueSBwcmV2aW91cyBzdGF0dXMgZmlsZVxuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5jbGVhclN0YXR1cyhvcHRpb25zLmNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xhdW5jaGluZyBhcHAgcmVnaXN0cmF0aW9uIHNjcmlwdC4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBMYXVuY2ggdGhlIFBvd2VyU2hlbGwgc2NyaXB0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmxhdW5jaChvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNyZWRlbnRpYWwgZmlsZXMgYW5kIHN0YXR1cyB1cGRhdGVzXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RhcnRNb25pdG9yaW5nKG9wdGlvbnMuY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBsYXVuY2ggYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogbnVsbCxcbiAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGFydE1vbml0b3JpbmddKTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgY3JlZGVudGlhbHMgYWxyZWFkeSBleGlzdCBmb3IgYSBjb21wYW55XG4gICAgICovXG4gICAgY29uc3QgY2hlY2tFeGlzdGluZ0NyZWRlbnRpYWxzID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5oYXNDcmVkZW50aWFscyhjb21wYW55TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2hlY2sgZXhpc3RpbmcgY3JlZGVudGlhbHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIEltcG9ydHMgZXhpc3RpbmcgY3JlZGVudGlhbHMgZm9yIGEgY29tcGFueVxuICAgICAqL1xuICAgIGNvbnN0IGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMgPSB1c2VDYWxsYmFjayhhc3luYyAoY29tcGFueU5hbWUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0ltcG9ydGluZyBjcmVkZW50aWFscy4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZWFkIGNyZWRlbnRpYWwgc3VtbWFyeVxuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN1bW1hcnkoY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcmVkZW50aWFsIHN1bW1hcnkgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEZWNyeXB0IGNsaWVudCBzZWNyZXRcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFNlY3JldCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24uZGVjcnlwdENyZWRlbnRpYWwoc3VtbWFyeS5DcmVkZW50aWFsRmlsZSk7XG4gICAgICAgICAgICBpZiAoIWNsaWVudFNlY3JldCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlY3J5cHQgY3JlZGVudGlhbCBmaWxlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJbXBvcnQgaW50byBwcm9maWxlXG4gICAgICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGAke2NvbXBhbnlOYW1lfSAtIEF6dXJlYDtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHByb2ZpbGUgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZXMgPSB1c2VQcm9maWxlU3RvcmUuZ2V0U3RhdGUoKS50YXJnZXRQcm9maWxlcztcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZSA9IGV4aXN0aW5nUHJvZmlsZXMuZmluZChwID0+IHAuY29tcGFueU5hbWUgPT09IGNvbXBhbnlOYW1lICYmIHAucHJvZmlsZVR5cGUgPT09ICdBenVyZScpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyBwcm9maWxlXG4gICAgICAgICAgICAgICAgdXBkYXRlVGFyZ2V0UHJvZmlsZShleGlzdGluZ1Byb2ZpbGUuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBzdW1tYXJ5LkNsaWVudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZSAtIGNhc3QgdG8gYW55IHRvIGJ5cGFzcyB0eXBlIGNoZWNraW5nXG4gICAgICAgICAgICAgICAgYWRkVGFyZ2V0UHJvZmlsZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFueU5hbWU6IGNvbXBhbnlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlVHlwZTogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBzdW1tYXJ5LkNsaWVudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgaXNDb25uZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkOiBzdW1tYXJ5LkNyZWF0ZWQsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnQ29tcGxldGUnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBpbXBvcnQgY3JlZGVudGlhbHMnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHN0YXRlXG4gICAgICovXG4gICAgY29uc3QgcmVzZXQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHN0b3BNb25pdG9yaW5nKCk7XG4gICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9LCBbc3RvcE1vbml0b3JpbmddKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZSxcbiAgICAgICAgbGF1bmNoQXBwUmVnaXN0cmF0aW9uLFxuICAgICAgICBjaGVja0V4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIHN0b3BNb25pdG9yaW5nLFxuICAgICAgICByZXNldCxcbiAgICAgICAgUkVHSVNUUkFUSU9OX1NURVBTLCAvLyBFeHBvcnQgZm9yIFVJIGNvbnN1bXB0aW9uXG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=