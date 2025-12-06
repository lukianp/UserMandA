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
        const pollInterval = 2000; // 2 seconds (faster polling for better UX)
        monitorIntervalRef.current = setInterval(async () => {
            try {
                // First, check the status file for progress updates
                console.log('[useAppRegistration] Polling status for:', companyName);
                const status = await window.electronAPI.appRegistration.readStatus(companyName);
                console.log('[useAppRegistration] Status result:', status);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixtREFBSTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLHlCQUF5QixtREFBSTtBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWSx1REFBSyxVQUFVLFdBQVcsbURBQUkseUNBQXlDLHVEQUFLLFVBQVUsMENBQTBDLHVEQUFLLFVBQVUsK0NBQStDLHNEQUFJLFlBQVksbUxBQW1MLG1EQUFJO0FBQ2paO0FBQ0E7QUFDQSxpQ0FBaUMsc0JBQXNCLEdBQUcsdURBQUssWUFBWSx3QkFBd0IsbURBQUk7QUFDdkc7QUFDQSxpQ0FBaUMsNENBQTRDLHNEQUFJLENBQUMsMERBQUssSUFBSSxpREFBaUQsc0JBQXNCLHNEQUFJLFVBQVUseUNBQXlDLEtBQUssSUFBSSw4QkFBOEIsdURBQUssVUFBVSx3Q0FBd0Msc0RBQUksWUFBWSx3QkFBd0IsbURBQUksbURBQW1ELG9CQUFvQixzREFBSSxRQUFRLHdHQUF3RyxLQUFLLEtBQUssZ0JBQWdCLHNEQUFJLFFBQVEsaUhBQWlILEtBQUs7QUFDMXJCO0FBQ0EsaUVBQWUsUUFBUSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvbGliL3V0aWxzLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL01vZGFsLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0xvYWRpbmdTcGlubmVyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VBcHBSZWdpc3RyYXRpb24udHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb25zIGZvciB0aGUgcmVuZGVyZXIgcHJvY2Vzc1xuICovXG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyB0d01lcmdlIH0gZnJvbSAndGFpbHdpbmQtbWVyZ2UnO1xuLyoqXG4gKiBDb21iaW5lcyBjbGFzcyBuYW1lcyB1c2luZyBjbHN4IGFuZCB0YWlsd2luZC1tZXJnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY24oLi4uaW5wdXRzKSB7XG4gICAgcmV0dXJuIHR3TWVyZ2UoY2xzeChpbnB1dHMpKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE1vZGFsIENvbXBvbmVudFxuICpcbiAqIEEgcmV1c2FibGUgbW9kYWwgZGlhbG9nIGNvbXBvbmVudCB3aXRoIHRpdGxlLCBpY29uLCBhbmQgc2l6ZSBvcHRpb25zLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBjbiB9IGZyb20gJy4uLy4uL2xpYi91dGlscyc7XG5jb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICBzbTogJ21heC13LW1kJyxcbiAgICBtZDogJ21heC13LWxnJyxcbiAgICBsZzogJ21heC13LTJ4bCcsXG4gICAgeGw6ICdtYXgtdy00eGwnLFxufTtcbmV4cG9ydCBjb25zdCBNb2RhbCA9ICh7IGlzT3Blbiwgb25DbG9zZSwgdGl0bGUsIGljb24sIHNpemUgPSAnbWQnLCBjbGFzc05hbWUsIGNoaWxkcmVuLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIEhhbmRsZSBFU0Mga2V5XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFpc09wZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGhhbmRsZUVzY2FwZSA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUVzY2FwZSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUVzY2FwZSk7XG4gICAgfSwgW2lzT3Blbiwgb25DbG9zZV0pO1xuICAgIC8vIFByZXZlbnQgYm9keSBzY3JvbGwgd2hlbiBtb2RhbCBpcyBvcGVuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGlzT3Blbikge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgIH07XG4gICAgfSwgW2lzT3Blbl0pO1xuICAgIGlmICghaXNPcGVuKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay81MCBiYWNrZHJvcC1ibHVyLXNtXCIsIG9uQ2xpY2s6IG9uQ2xvc2UsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbigncmVsYXRpdmUgdy1mdWxsIG14LTQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy14bCcsIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpLCByb2xlOiBcImRpYWxvZ1wiLCBcImFyaWEtbW9kYWxcIjogXCJ0cnVlXCIsIFwiYXJpYS1sYWJlbGxlZGJ5XCI6IHRpdGxlID8gJ21vZGFsLXRpdGxlJyA6IHVuZGVmaW5lZCwgY2hpbGRyZW46IFsodGl0bGUgfHwgaWNvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC02IHB5LTQgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtpY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBpY29uIH0pKSwgdGl0bGUgJiYgKF9qc3goXCJoMlwiLCB7IGlkOiBcIm1vZGFsLXRpdGxlXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHRpdGxlIH0pKV0gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicC0xIHJvdW5kZWQtbWQgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCB0cmFuc2l0aW9uLWNvbG9yc1wiLCBcImFyaWEtbGFiZWxcIjogXCJDbG9zZSBtb2RhbFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSkgfSldIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTRcIiwgY2hpbGRyZW46IGNoaWxkcmVuIH0pXSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE1vZGFsO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgQ29tcG9uZW50XG4gKlxuICogU2ltcGxlIGxvYWRpbmcgc3Bpbm5lciBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBMb2FkZXIyIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgY29tcG9uZW50IGZvciBpbmxpbmUgbG9hZGluZyBzdGF0ZXNcbiAqL1xuY29uc3QgTG9hZGluZ1NwaW5uZXIgPSAoeyBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFNpemUgbWFwcGluZ3NcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206IDE2LFxuICAgICAgICBtZDogMjQsXG4gICAgICAgIGxnOiAzMixcbiAgICAgICAgeGw6IDQ4LFxuICAgIH07XG4gICAgcmV0dXJuIChfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhbmltYXRlLXNwaW4gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLCBjbGFzc05hbWUpLCBzaXplOiBzaXplc1tzaXplXSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NwaW5uZXI7XG4iLCIvKipcbiAqIEFwcCBSZWdpc3RyYXRpb24gSG9va1xuICpcbiAqIFByb3ZpZGVzIGZ1bmN0aW9uYWxpdHkgZm9yIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gc2V0dXAgaW5jbHVkaW5nOlxuICogLSBMYXVuY2hpbmcgdGhlIFBvd2VyU2hlbGwgYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHRcbiAqIC0gTW9uaXRvcmluZyBmb3IgY3JlZGVudGlhbCBmaWxlIGNyZWF0aW9uXG4gKiAtIEF1dG8taW1wb3J0aW5nIGNyZWRlbnRpYWxzIGludG8gcHJvZmlsZXNcbiAqXG4gKiBQYXR0ZXJuIGZyb20gR1VJL01haW5WaWV3TW9kZWwuY3M6MjA0MS0yMDg3IChSdW5BcHBSZWdpc3RyYXRpb25Bc3luYylcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuLy8gUmVnaXN0cmF0aW9uIHN0ZXBzIGluIG9yZGVyXG5leHBvcnQgY29uc3QgUkVHSVNUUkFUSU9OX1NURVBTID0gW1xuICAgIHsgaWQ6ICdJbml0aWFsaXphdGlvbicsIGxhYmVsOiAnSW5pdGlhbGl6aW5nJywgZGVzY3JpcHRpb246ICdTZXR0aW5nIHVwIHNjcmlwdCBlbnZpcm9ubWVudCcgfSxcbiAgICB7IGlkOiAnUHJlcmVxdWlzaXRlcycsIGxhYmVsOiAnUHJlcmVxdWlzaXRlcycsIGRlc2NyaXB0aW9uOiAnVmFsaWRhdGluZyBzeXN0ZW0gcmVxdWlyZW1lbnRzJyB9LFxuICAgIHsgaWQ6ICdNb2R1bGVNYW5hZ2VtZW50JywgbGFiZWw6ICdNb2R1bGVzJywgZGVzY3JpcHRpb246ICdMb2FkaW5nIFBvd2VyU2hlbGwgbW9kdWxlcycgfSxcbiAgICB7IGlkOiAnR3JhcGhDb25uZWN0aW9uJywgbGFiZWw6ICdHcmFwaCBDb25uZWN0aW9uJywgZGVzY3JpcHRpb246ICdDb25uZWN0aW5nIHRvIE1pY3Jvc29mdCBHcmFwaCcgfSxcbiAgICB7IGlkOiAnQXp1cmVDb25uZWN0aW9uJywgbGFiZWw6ICdBenVyZSBDb25uZWN0aW9uJywgZGVzY3JpcHRpb246ICdDb25uZWN0aW5nIHRvIEF6dXJlJyB9LFxuICAgIHsgaWQ6ICdBcHBSZWdpc3RyYXRpb24nLCBsYWJlbDogJ0FwcCBSZWdpc3RyYXRpb24nLCBkZXNjcmlwdGlvbjogJ0NyZWF0aW5nIEF6dXJlIEFEIGFwcGxpY2F0aW9uJyB9LFxuICAgIHsgaWQ6ICdQZXJtaXNzaW9uR3JhbnQnLCBsYWJlbDogJ1Blcm1pc3Npb25zJywgZGVzY3JpcHRpb246ICdHcmFudGluZyBhZG1pbiBjb25zZW50JyB9LFxuICAgIHsgaWQ6ICdSb2xlQXNzaWdubWVudCcsIGxhYmVsOiAnUm9sZSBBc3NpZ25tZW50JywgZGVzY3JpcHRpb246ICdBc3NpZ25pbmcgZGlyZWN0b3J5IHJvbGVzJyB9LFxuICAgIHsgaWQ6ICdTdWJzY3JpcHRpb25BY2Nlc3MnLCBsYWJlbDogJ1N1YnNjcmlwdGlvbnMnLCBkZXNjcmlwdGlvbjogJ0NvbmZpZ3VyaW5nIHN1YnNjcmlwdGlvbiBhY2Nlc3MnIH0sXG4gICAgeyBpZDogJ1NlY3JldENyZWF0aW9uJywgbGFiZWw6ICdTZWNyZXQnLCBkZXNjcmlwdGlvbjogJ0NyZWF0aW5nIGNsaWVudCBzZWNyZXQnIH0sXG4gICAgeyBpZDogJ0NyZWRlbnRpYWxTdG9yYWdlJywgbGFiZWw6ICdTdG9yYWdlJywgZGVzY3JpcHRpb246ICdTYXZpbmcgZW5jcnlwdGVkIGNyZWRlbnRpYWxzJyB9LFxuICAgIHsgaWQ6ICdDb21wbGV0ZScsIGxhYmVsOiAnQ29tcGxldGUnLCBkZXNjcmlwdGlvbjogJ1JlZ2lzdHJhdGlvbiBjb21wbGV0ZScgfSxcbl07XG4vKipcbiAqIEhvb2sgZm9yIG1hbmFnaW5nIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gd29ya2Zsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFwcFJlZ2lzdHJhdGlvbigpIHtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgfSk7XG4gICAgY29uc3QgbW9uaXRvckludGVydmFsUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IHsgYWRkVGFyZ2V0UHJvZmlsZSwgdXBkYXRlVGFyZ2V0UHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgLyoqXG4gICAgICogU3RhcnRzIG1vbml0b3JpbmcgZm9yIGNyZWRlbnRpYWwgZmlsZXMgYW5kIHN0YXR1cyB1cGRhdGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RhcnRNb25pdG9yaW5nID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IHRydWUsXG4gICAgICAgICAgICBwcm9ncmVzczogJ1dhaXRpbmcgZm9yIGFwcCByZWdpc3RyYXRpb24gdG8gY29tcGxldGUuLi4nLFxuICAgICAgICAgICAgY3VycmVudFN0ZXA6ICdJbml0aWFsaXphdGlvbicsXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgbWF4RHVyYXRpb24gPSAxMCAqIDYwICogMTAwMDsgLy8gMTAgbWludXRlcyAoaW5jcmVhc2VkIGZvciBtb2R1bGUgbG9hZGluZylcbiAgICAgICAgY29uc3QgcG9sbEludGVydmFsID0gMjAwMDsgLy8gMiBzZWNvbmRzIChmYXN0ZXIgcG9sbGluZyBmb3IgYmV0dGVyIFVYKVxuICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gRmlyc3QsIGNoZWNrIHRoZSBzdGF0dXMgZmlsZSBmb3IgcHJvZ3Jlc3MgdXBkYXRlc1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlQXBwUmVnaXN0cmF0aW9uXSBQb2xsaW5nIHN0YXR1cyBmb3I6JywgY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN0YXR1cyhjb21wYW55TmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VBcHBSZWdpc3RyYXRpb25dIFN0YXR1cyByZXN1bHQ6Jywgc3RhdHVzKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBzdGF0ZSB3aXRoIGN1cnJlbnQgc3RlcCBhbmQgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogc3RhdHVzLnN0ZXAsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBzdGF0dXMubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBzY3JpcHQgZmFpbGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMuc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHN0YXR1cy5lcnJvciB8fCAnQXBwIHJlZ2lzdHJhdGlvbiBmYWlsZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnRXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgc2NyaXB0IHN1Y2NlZWRlZCAtIGFsc28gY2hlY2sgY3JlZGVudGlhbHNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2NyaXB0IGZpbmlzaGVkIHN1Y2Nlc3NmdWxseSwgbm93IGltcG9ydCBjcmVkZW50aWFsc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICdMb2FkaW5nIGNyZWRlbnRpYWxzLi4uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBjcmVkZW50aWFscyBleGlzdFxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc0NyZWRlbnRpYWxzID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5oYXNDcmVkZW50aWFscyhjb21wYW55TmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN0b3AgbW9uaXRvcmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICdMb2FkaW5nIGNyZWRlbnRpYWxzLi4uJ1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlYWQgY3JlZGVudGlhbCBzdW1tYXJ5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLnJlYWRTdW1tYXJ5KGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlY3J5cHQgY2xpZW50IHNlY3JldFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50U2VjcmV0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5kZWNyeXB0Q3JlZGVudGlhbChzdW1tYXJ5LkNyZWRlbnRpYWxGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGllbnRTZWNyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBdXRvLWltcG9ydCBpbnRvIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGAke2NvbXBhbnlOYW1lfSAtIEF6dXJlYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBwcm9maWxlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcm9maWxlcyA9IHVzZVByb2ZpbGVTdG9yZS5nZXRTdGF0ZSgpLnRhcmdldFByb2ZpbGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZSA9IGV4aXN0aW5nUHJvZmlsZXMuZmluZChwID0+IHAuY29tcGFueU5hbWUgPT09IGNvbXBhbnlOYW1lICYmIHAucHJvZmlsZVR5cGUgPT09ICdBenVyZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1Byb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHByb2ZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlVGFyZ2V0UHJvZmlsZShleGlzdGluZ1Byb2ZpbGUuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHN1bW1hcnkuQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHByb2ZpbGUgd2l0aCByZXF1aXJlZCBmaWVsZHMgLSBjYXN0IHRvIFRhcmdldFByb2ZpbGUgdG8gYXZvaWQgdHlwZSBtaXNtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRUYXJnZXRQcm9maWxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wYW55TmFtZTogY29tcGFueU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlVHlwZTogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IHN1bW1hcnkuQ2xpZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Nvbm5lY3RlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkOiBzdW1tYXJ5LkNyZWF0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBtaXNzaW5nIHJlcXVpcmVkIGZpZWxkcyB3aXRoIGRlZmF1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudDogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lvbjogJ0dsb2JhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnROYW1lOiBzdW1tYXJ5LkRvbWFpbiB8fCBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldEVuY3J5cHRlZDogJ3RydWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hhcmVQb2ludFVybDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcWxDb25uZWN0aW9uU3RyaW5nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lRW5jcnlwdGVkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkRW5jcnlwdGVkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlcnRpZmljYXRlVGh1bWJwcmludDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0UmVzdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbm5lY3Rpb25UZXN0TWVzc2FnZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHN1bW1hcnkuQ3JlYXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6ICdDb21wbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlY3J5cHQgY3JlZGVudGlhbCBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZWFkIGNyZWRlbnRpYWwgc3VtbWFyeScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgdGltZW91dFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsYXBzZWQgPiBtYXhEdXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdUaW1lb3V0OiBBcHAgcmVnaXN0cmF0aW9uIGRpZCBub3QgY29tcGxldGUgd2l0aGluIDEwIG1pbnV0ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2dyZXNzIGlzIG5vdyB1cGRhdGVkIGZyb20gc3RhdHVzIGZpbGUsIG5vIG5lZWQgZm9yIGNvdW50ZG93biBoZXJlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gU3RvcCBtb25pdG9yaW5nIG9uIGVycm9yXG4gICAgICAgICAgICAgICAgaWYgKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGltcG9ydCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBwb2xsSW50ZXJ2YWwpO1xuICAgIH0sIFthZGRUYXJnZXRQcm9maWxlLCB1cGRhdGVUYXJnZXRQcm9maWxlXSk7XG4gICAgLyoqXG4gICAgICogU3RvcHMgbW9uaXRvcmluZyBmb3IgY3JlZGVudGlhbCBmaWxlc1xuICAgICAqL1xuICAgIGNvbnN0IHN0b3BNb25pdG9yaW5nID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpO1xuICAgICAgICAgICAgbW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHByb2dyZXNzOiAnJ1xuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIExhdW5jaGVzIHRoZSBBenVyZSBBcHAgUmVnaXN0cmF0aW9uIHNjcmlwdFxuICAgICAqL1xuICAgIGNvbnN0IGxhdW5jaEFwcFJlZ2lzdHJhdGlvbiA9IHVzZUNhbGxiYWNrKGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBDbGVhciBhbnkgcHJldmlvdXMgc3RhdHVzIGZpbGVcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24uY2xlYXJTdGF0dXMob3B0aW9ucy5jb21wYW55TmFtZSk7XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICdMYXVuY2hpbmcgYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHQuLi4nLFxuICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gTGF1bmNoIHRoZSBQb3dlclNoZWxsIHNjcmlwdFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5sYXVuY2gob3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFydCBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzIGFuZCBzdGF0dXMgdXBkYXRlc1xuICAgICAgICAgICAgICAgIGF3YWl0IHN0YXJ0TW9uaXRvcmluZyhvcHRpb25zLmNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbGF1bmNoIGFwcCByZWdpc3RyYXRpb24gc2NyaXB0JyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhcnRNb25pdG9yaW5nXSk7XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGNyZWRlbnRpYWxzIGFscmVhZHkgZXhpc3QgZm9yIGEgY29tcGFueVxuICAgICAqL1xuICAgIGNvbnN0IGNoZWNrRXhpc3RpbmdDcmVkZW50aWFscyA9IHVzZUNhbGxiYWNrKGFzeW5jIChjb21wYW55TmFtZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24uaGFzQ3JlZGVudGlhbHMoY29tcGFueU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNoZWNrIGV4aXN0aW5nIGNyZWRlbnRpYWxzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBJbXBvcnRzIGV4aXN0aW5nIGNyZWRlbnRpYWxzIGZvciBhIGNvbXBhbnlcbiAgICAgKi9cbiAgICBjb25zdCBpbXBvcnRFeGlzdGluZ0NyZWRlbnRpYWxzID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICdJbXBvcnRpbmcgY3JlZGVudGlhbHMuLi4nLFxuICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVhZCBjcmVkZW50aWFsIHN1bW1hcnlcbiAgICAgICAgICAgIGNvbnN0IHN1bW1hcnkgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLnJlYWRTdW1tYXJ5KGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgIGlmICghc3VtbWFyeSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ3JlZGVudGlhbCBzdW1tYXJ5IG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRGVjcnlwdCBjbGllbnQgc2VjcmV0XG4gICAgICAgICAgICBjb25zdCBjbGllbnRTZWNyZXQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmRlY3J5cHRDcmVkZW50aWFsKHN1bW1hcnkuQ3JlZGVudGlhbEZpbGUpO1xuICAgICAgICAgICAgaWYgKCFjbGllbnRTZWNyZXQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBkZWNyeXB0IGNyZWRlbnRpYWwgZmlsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSW1wb3J0IGludG8gcHJvZmlsZVxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSBgJHtjb21wYW55TmFtZX0gLSBBenVyZWA7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwcm9maWxlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGVzID0gdXNlUHJvZmlsZVN0b3JlLmdldFN0YXRlKCkudGFyZ2V0UHJvZmlsZXM7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGUgPSBleGlzdGluZ1Byb2ZpbGVzLmZpbmQocCA9PiBwLmNvbXBhbnlOYW1lID09PSBjb21wYW55TmFtZSAmJiBwLnByb2ZpbGVUeXBlID09PSAnQXp1cmUnKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ1Byb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcHJvZmlsZVxuICAgICAgICAgICAgICAgIHVwZGF0ZVRhcmdldFByb2ZpbGUoZXhpc3RpbmdQcm9maWxlLmlkLCB7XG4gICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHByb2ZpbGUgLSBjYXN0IHRvIGFueSB0byBieXBhc3MgdHlwZSBjaGVja2luZ1xuICAgICAgICAgICAgICAgIGFkZFRhcmdldFByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZVR5cGU6ICdBenVyZScsXG4gICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiBzdW1tYXJ5LlRlbmFudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0OiBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogc3VtbWFyeS5Eb21haW4gfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZDogc3VtbWFyeS5DcmVhdGVkLFxuICAgICAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gaW1wb3J0IGNyZWRlbnRpYWxzJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogbnVsbCxcbiAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFthZGRUYXJnZXRQcm9maWxlLCB1cGRhdGVUYXJnZXRQcm9maWxlXSk7XG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBzdGF0ZVxuICAgICAqL1xuICAgIGNvbnN0IHJlc2V0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzdG9wTW9uaXRvcmluZygpO1xuICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICBjdXJyZW50U3RlcDogbnVsbCxcbiAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfSwgW3N0b3BNb25pdG9yaW5nXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGxhdW5jaEFwcFJlZ2lzdHJhdGlvbixcbiAgICAgICAgY2hlY2tFeGlzdGluZ0NyZWRlbnRpYWxzLFxuICAgICAgICBpbXBvcnRFeGlzdGluZ0NyZWRlbnRpYWxzLFxuICAgICAgICBzdG9wTW9uaXRvcmluZyxcbiAgICAgICAgcmVzZXQsXG4gICAgICAgIFJFR0lTVFJBVElPTl9TVEVQUywgLy8gRXhwb3J0IGZvciBVSSBjb25zdW1wdGlvblxuICAgIH07XG59XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqXG4gKiBGdWxseSBhY2Nlc3NpYmxlIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGxhYmVscyBhbmQgZXJyb3Igc3RhdGVzLlxuICogRm9sbG93cyBXQ0FHIDIuMSBBQSBndWlkZWxpbmVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGVjayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQ2hlY2tib3ggPSAoeyBsYWJlbCwgZGVzY3JpcHRpb24sIGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGVycm9yLCBkaXNhYmxlZCA9IGZhbHNlLCBpbmRldGVybWluYXRlID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgZGVzY3JpcHRpb25JZCA9IGAke2lkfS1kZXNjcmlwdGlvbmA7XG4gICAgY29uc3QgaGFzRXJyb3IgPSBCb29sZWFuKGVycm9yKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgaW5kZXRlcm1pbmF0ZSB2aWEgcmVmXG4gICAgY29uc3QgY2hlY2tib3hSZWYgPSBSZWFjdC51c2VSZWYobnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNoZWNrYm94UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNoZWNrYm94UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9LCBbaW5kZXRlcm1pbmF0ZV0pO1xuICAgIGNvbnN0IGNoZWNrYm94Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaC01IHctNSByb3VuZGVkIGJvcmRlci0yJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGFyazpyaW5nLW9mZnNldC1ncmF5LTkwMCcsIFxuICAgIC8vIFN0YXRlLWJhc2VkIHN0eWxlc1xuICAgIHtcbiAgICAgICAgLy8gTm9ybWFsIHN0YXRlICh1bmNoZWNrZWQpXG4gICAgICAgICdib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS01MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQgJiYgIWNoZWNrZWQsXG4gICAgICAgICdmb2N1czpyaW5nLWJsdWUtNTAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gQ2hlY2tlZCBzdGF0ZVxuICAgICAgICAnYmctYmx1ZS02MDAgYm9yZGVyLWJsdWUtNjAwIGRhcms6YmctYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS01MDAnOiBjaGVja2VkICYmICFkaXNhYmxlZCAmJiAhaGFzRXJyb3IsXG4gICAgICAgIC8vIEVycm9yIHN0YXRlXG4gICAgICAgICdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC02MDAgZGFyazpib3JkZXItcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktODAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ3RleHQtc20gZm9udC1tZWRpdW0nLCB7XG4gICAgICAgICd0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wnLCBjbGFzc05hbWUpLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBoLTVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGNoZWNrYm94UmVmLCBpZDogaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogY2hlY2tlZCwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IFwic3Itb25seSBwZWVyXCIsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXJyb3JJZF06IGhhc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uSWRdOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSksIF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGNoZWNrYm94Q2xhc3NlcywgJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1wb2ludGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgY2hpbGRyZW46IFtjaGVja2VkICYmICFpbmRldGVybWluYXRlICYmIChfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00IHRleHQtd2hpdGVcIiwgc3Ryb2tlV2lkdGg6IDMgfSkpLCBpbmRldGVybWluYXRlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMC41IHctMyBiZy13aGl0ZSByb3VuZGVkXCIgfSkpXSB9KV0gfSksIChsYWJlbCB8fCBkZXNjcmlwdGlvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1sLTNcIiwgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChsYWJlbENsYXNzZXMsICdjdXJzb3ItcG9pbnRlcicpLCBjaGlsZHJlbjogbGFiZWwgfSkpLCBkZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBpZDogZGVzY3JpcHRpb25JZCwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMC41XCIsIGNoaWxkcmVuOiBkZXNjcmlwdGlvbiB9KSldIH0pKV0gfSksIGhhc0Vycm9yICYmIChfanN4KFwicFwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IFwibXQtMSBtbC04IHRleHQtc20gdGV4dC1yZWQtNjAwXCIsIHJvbGU6IFwiYWxlcnRcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGVycm9yIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9