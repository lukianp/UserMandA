"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5868],{

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

/***/ 39864:
/*!*****************************************************************!*\
  !*** ./src/renderer/components/organisms/Modal.tsx + 1 modules ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Modal: () => (/* binding */ Modal)
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
    return (0,bundle_mjs.twMerge)((0,clsx.clsx)(inputs));
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
/*!**********************************************************!*\
  !*** ./src/renderer/components/atoms/LoadingSpinner.tsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Loader2, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('animate-spin text-blue-600 dark:text-blue-400', className), size: sizes[size], "data-cy": dataCy }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadingSpinner);


/***/ }),

/***/ 51782:
/*!**************************************************!*\
  !*** ./src/renderer/hooks/useAppRegistration.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAppRegistration: () => (/* binding */ useAppRegistration)
/* harmony export */ });
/* unused harmony export REGISTRATION_STEPS */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useProfileStore */ 33813);
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
    const { addTargetProfile, updateTargetProfile } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__.useProfileStore)();
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
                            const existingProfiles = _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__.useProfileStore.getState().targetProfiles;
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
            const existingProfiles = _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__.useProfileStore.getState().targetProfiles;
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


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBZTtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsNEJBQTRCLDBDQUFJO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLDBDQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxZQUFZLHVEQUFLLFVBQVUsV0FBVywwQ0FBSSx5Q0FBeUMsdURBQUssVUFBVSwwQ0FBMEMsdURBQUssVUFBVSwrQ0FBK0Msc0RBQUksWUFBWSxtTEFBbUwsMENBQUk7QUFDalo7QUFDQTtBQUNBLGlDQUFpQyxzQkFBc0IsR0FBRyx1REFBSyxZQUFZLHdCQUF3QiwwQ0FBSTtBQUN2RztBQUNBLGlDQUFpQyw0Q0FBNEMsc0RBQUksQ0FBQywrQ0FBSyxJQUFJLGlEQUFpRCxzQkFBc0Isc0RBQUksVUFBVSx5Q0FBeUMsS0FBSyxJQUFJLDhCQUE4Qix1REFBSyxVQUFVLHdDQUF3QyxzREFBSSxZQUFZLHdCQUF3QiwwQ0FBSSxtREFBbUQsb0JBQW9CLHNEQUFJLFFBQVEsd0dBQXdHLEtBQUssS0FBSyxnQkFBZ0Isc0RBQUksUUFBUSxpSEFBaUgsS0FBSztBQUMxckI7QUFDQSxpRUFBZSxRQUFRLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9saWIvdXRpbHMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvTW9kYWwudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvTG9hZGluZ1NwaW5uZXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUFwcFJlZ2lzdHJhdGlvbi50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0NoZWNrYm94LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsIi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMgZm9yIHRoZSByZW5kZXJlciBwcm9jZXNzXG4gKi9cbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IHR3TWVyZ2UgfSBmcm9tICd0YWlsd2luZC1tZXJnZSc7XG4vKipcbiAqIENvbWJpbmVzIGNsYXNzIG5hbWVzIHVzaW5nIGNsc3ggYW5kIHRhaWx3aW5kLW1lcmdlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbiguLi5pbnB1dHMpIHtcbiAgICByZXR1cm4gdHdNZXJnZShjbHN4KGlucHV0cykpO1xufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTW9kYWwgQ29tcG9uZW50XG4gKlxuICogQSByZXVzYWJsZSBtb2RhbCBkaWFsb2cgY29tcG9uZW50IHdpdGggdGl0bGUsIGljb24sIGFuZCBzaXplIG9wdGlvbnMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IGNuIH0gZnJvbSAnLi4vLi4vbGliL3V0aWxzJztcbmNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgIHNtOiAnbWF4LXctbWQnLFxuICAgIG1kOiAnbWF4LXctbGcnLFxuICAgIGxnOiAnbWF4LXctMnhsJyxcbiAgICB4bDogJ21heC13LTR4bCcsXG59O1xuZXhwb3J0IGNvbnN0IE1vZGFsID0gKHsgaXNPcGVuLCBvbkNsb3NlLCB0aXRsZSwgaWNvbiwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgY2hpbGRyZW4sICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gSGFuZGxlIEVTQyBrZXlcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIWlzT3BlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgaGFuZGxlRXNjYXBlID0gKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBvbkNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlRXNjYXBlKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlRXNjYXBlKTtcbiAgICB9LCBbaXNPcGVuLCBvbkNsb3NlXSk7XG4gICAgLy8gUHJldmVudCBib2R5IHNjcm9sbCB3aGVuIG1vZGFsIGlzIG9wZW5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoaXNPcGVuKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgfTtcbiAgICB9LCBbaXNPcGVuXSk7XG4gICAgaWYgKCFpc09wZW4pXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCB6LTUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzUwIGJhY2tkcm9wLWJsdXItc21cIiwgb25DbGljazogb25DbG9zZSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNuKCdyZWxhdGl2ZSB3LWZ1bGwgbXgtNCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LXhsJywgc2l6ZUNsYXNzZXNbc2l6ZV0sIGNsYXNzTmFtZSksIHJvbGU6IFwiZGlhbG9nXCIsIFwiYXJpYS1tb2RhbFwiOiBcInRydWVcIiwgXCJhcmlhLWxhYmVsbGVkYnlcIjogdGl0bGUgPyAnbW9kYWwtdGl0bGUnIDogdW5kZWZpbmVkLCBjaGlsZHJlbjogWyh0aXRsZSB8fCBpY29uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTYgcHktNCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW2ljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGljb24gfSkpLCB0aXRsZSAmJiAoX2pzeChcImgyXCIsIHsgaWQ6IFwibW9kYWwtdGl0bGVcIiwgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogdGl0bGUgfSkpXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJwLTEgcm91bmRlZC1tZCBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwIHRyYW5zaXRpb24tY29sb3JzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkNsb3NlIG1vZGFsXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiB9KSB9KV0gfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTYgcHktNFwiLCBjaGlsZHJlbjogY2hpbGRyZW4gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTW9kYWw7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBMb2FkaW5nU3Bpbm5lciBDb21wb25lbnRcbiAqXG4gKiBTaW1wbGUgbG9hZGluZyBzcGlubmVyIGZvciBpbmxpbmUgbG9hZGluZyBzdGF0ZXNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExvYWRlcjIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBMb2FkaW5nU3Bpbm5lciBjb21wb25lbnQgZm9yIGlubGluZSBsb2FkaW5nIHN0YXRlc1xuICovXG5jb25zdCBMb2FkaW5nU3Bpbm5lciA9ICh7IHNpemUgPSAnbWQnLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gU2l6ZSBtYXBwaW5nc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogMTYsXG4gICAgICAgIG1kOiAyNCxcbiAgICAgICAgbGc6IDMyLFxuICAgICAgICB4bDogNDgsXG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3goTG9hZGVyMiwgeyBjbGFzc05hbWU6IGNsc3goJ2FuaW1hdGUtc3BpbiB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCcsIGNsYXNzTmFtZSksIHNpemU6IHNpemVzW3NpemVdLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBMb2FkaW5nU3Bpbm5lcjtcbiIsIi8qKlxuICogQXBwIFJlZ2lzdHJhdGlvbiBIb29rXG4gKlxuICogUHJvdmlkZXMgZnVuY3Rpb25hbGl0eSBmb3IgQXp1cmUgQXBwIFJlZ2lzdHJhdGlvbiBzZXR1cCBpbmNsdWRpbmc6XG4gKiAtIExhdW5jaGluZyB0aGUgUG93ZXJTaGVsbCBhcHAgcmVnaXN0cmF0aW9uIHNjcmlwdFxuICogLSBNb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGUgY3JlYXRpb25cbiAqIC0gQXV0by1pbXBvcnRpbmcgY3JlZGVudGlhbHMgaW50byBwcm9maWxlc1xuICpcbiAqIFBhdHRlcm4gZnJvbSBHVUkvTWFpblZpZXdNb2RlbC5jczoyMDQxLTIwODcgKFJ1bkFwcFJlZ2lzdHJhdGlvbkFzeW5jKVxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG4vLyBSZWdpc3RyYXRpb24gc3RlcHMgaW4gb3JkZXJcbmV4cG9ydCBjb25zdCBSRUdJU1RSQVRJT05fU1RFUFMgPSBbXG4gICAgeyBpZDogJ0luaXRpYWxpemF0aW9uJywgbGFiZWw6ICdJbml0aWFsaXppbmcnLCBkZXNjcmlwdGlvbjogJ1NldHRpbmcgdXAgc2NyaXB0IGVudmlyb25tZW50JyB9LFxuICAgIHsgaWQ6ICdQcmVyZXF1aXNpdGVzJywgbGFiZWw6ICdQcmVyZXF1aXNpdGVzJywgZGVzY3JpcHRpb246ICdWYWxpZGF0aW5nIHN5c3RlbSByZXF1aXJlbWVudHMnIH0sXG4gICAgeyBpZDogJ01vZHVsZU1hbmFnZW1lbnQnLCBsYWJlbDogJ01vZHVsZXMnLCBkZXNjcmlwdGlvbjogJ0xvYWRpbmcgUG93ZXJTaGVsbCBtb2R1bGVzJyB9LFxuICAgIHsgaWQ6ICdHcmFwaENvbm5lY3Rpb24nLCBsYWJlbDogJ0dyYXBoIENvbm5lY3Rpb24nLCBkZXNjcmlwdGlvbjogJ0Nvbm5lY3RpbmcgdG8gTWljcm9zb2Z0IEdyYXBoJyB9LFxuICAgIHsgaWQ6ICdBenVyZUNvbm5lY3Rpb24nLCBsYWJlbDogJ0F6dXJlIENvbm5lY3Rpb24nLCBkZXNjcmlwdGlvbjogJ0Nvbm5lY3RpbmcgdG8gQXp1cmUnIH0sXG4gICAgeyBpZDogJ0FwcFJlZ2lzdHJhdGlvbicsIGxhYmVsOiAnQXBwIFJlZ2lzdHJhdGlvbicsIGRlc2NyaXB0aW9uOiAnQ3JlYXRpbmcgQXp1cmUgQUQgYXBwbGljYXRpb24nIH0sXG4gICAgeyBpZDogJ1Blcm1pc3Npb25HcmFudCcsIGxhYmVsOiAnUGVybWlzc2lvbnMnLCBkZXNjcmlwdGlvbjogJ0dyYW50aW5nIGFkbWluIGNvbnNlbnQnIH0sXG4gICAgeyBpZDogJ1JvbGVBc3NpZ25tZW50JywgbGFiZWw6ICdSb2xlIEFzc2lnbm1lbnQnLCBkZXNjcmlwdGlvbjogJ0Fzc2lnbmluZyBkaXJlY3Rvcnkgcm9sZXMnIH0sXG4gICAgeyBpZDogJ1N1YnNjcmlwdGlvbkFjY2VzcycsIGxhYmVsOiAnU3Vic2NyaXB0aW9ucycsIGRlc2NyaXB0aW9uOiAnQ29uZmlndXJpbmcgc3Vic2NyaXB0aW9uIGFjY2VzcycgfSxcbiAgICB7IGlkOiAnU2VjcmV0Q3JlYXRpb24nLCBsYWJlbDogJ1NlY3JldCcsIGRlc2NyaXB0aW9uOiAnQ3JlYXRpbmcgY2xpZW50IHNlY3JldCcgfSxcbiAgICB7IGlkOiAnQ3JlZGVudGlhbFN0b3JhZ2UnLCBsYWJlbDogJ1N0b3JhZ2UnLCBkZXNjcmlwdGlvbjogJ1NhdmluZyBlbmNyeXB0ZWQgY3JlZGVudGlhbHMnIH0sXG4gICAgeyBpZDogJ0NvbXBsZXRlJywgbGFiZWw6ICdDb21wbGV0ZScsIGRlc2NyaXB0aW9uOiAnUmVnaXN0cmF0aW9uIGNvbXBsZXRlJyB9LFxuXTtcbi8qKlxuICogSG9vayBmb3IgbWFuYWdpbmcgQXp1cmUgQXBwIFJlZ2lzdHJhdGlvbiB3b3JrZmxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQXBwUmVnaXN0cmF0aW9uKCkge1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICB9KTtcbiAgICBjb25zdCBtb25pdG9ySW50ZXJ2YWxSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgeyBhZGRUYXJnZXRQcm9maWxlLCB1cGRhdGVUYXJnZXRQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICAvKipcbiAgICAgKiBTdGFydHMgbW9uaXRvcmluZyBmb3IgY3JlZGVudGlhbCBmaWxlcyBhbmQgc3RhdHVzIHVwZGF0ZXNcbiAgICAgKi9cbiAgICBjb25zdCBzdGFydE1vbml0b3JpbmcgPSB1c2VDYWxsYmFjayhhc3luYyAoY29tcGFueU5hbWUpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzTW9uaXRvcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIHByb2dyZXNzOiAnV2FpdGluZyBmb3IgYXBwIHJlZ2lzdHJhdGlvbiB0byBjb21wbGV0ZS4uLicsXG4gICAgICAgICAgICBjdXJyZW50U3RlcDogJ0luaXRpYWxpemF0aW9uJyxcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBtYXhEdXJhdGlvbiA9IDEwICogNjAgKiAxMDAwOyAvLyAxMCBtaW51dGVzIChpbmNyZWFzZWQgZm9yIG1vZHVsZSBsb2FkaW5nKVxuICAgICAgICBjb25zdCBwb2xsSW50ZXJ2YWwgPSAyMDAwOyAvLyAyIHNlY29uZHMgKGZhc3RlciBwb2xsaW5nIGZvciBiZXR0ZXIgVVgpXG4gICAgICAgIG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50ID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCwgY2hlY2sgdGhlIHN0YXR1cyBmaWxlIGZvciBwcm9ncmVzcyB1cGRhdGVzXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VBcHBSZWdpc3RyYXRpb25dIFBvbGxpbmcgc3RhdHVzIGZvcjonLCBjb21wYW55TmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5yZWFkU3RhdHVzKGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZUFwcFJlZ2lzdHJhdGlvbl0gU3RhdHVzIHJlc3VsdDonLCBzdGF0dXMpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXBkYXRlIHN0YXRlIHdpdGggY3VycmVudCBzdGVwIGFuZCBzdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBzdGF0dXMuc3RlcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHN0YXR1cy5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHNjcmlwdCBmYWlsZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cy5zdGF0dXMgPT09ICdmYWlsZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogc3RhdHVzLmVycm9yIHx8ICdBcHAgcmVnaXN0cmF0aW9uIGZhaWxlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6ICdFcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiBzY3JpcHQgc3VjY2VlZGVkIC0gYWxzbyBjaGVjayBjcmVkZW50aWFsc1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzLnN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTY3JpcHQgZmluaXNoZWQgc3VjY2Vzc2Z1bGx5LCBub3cgaW1wb3J0IGNyZWRlbnRpYWxzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xvYWRpbmcgY3JlZGVudGlhbHMuLi4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnQ29tcGxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGNyZWRlbnRpYWxzIGV4aXN0XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzQ3JlZGVudGlhbHMgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmhhc0NyZWRlbnRpYWxzKGNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoaGFzQ3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3RvcCBtb25pdG9yaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xvYWRpbmcgY3JlZGVudGlhbHMuLi4nXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVhZCBjcmVkZW50aWFsIHN1bW1hcnlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN1bW1hcnkoY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVjcnlwdCBjbGllbnQgc2VjcmV0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnRTZWNyZXQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmRlY3J5cHRDcmVkZW50aWFsKHN1bW1hcnkuQ3JlZGVudGlhbEZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNsaWVudFNlY3JldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEF1dG8taW1wb3J0IGludG8gcHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gYCR7Y29tcGFueU5hbWV9IC0gQXp1cmVgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHByb2ZpbGUgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ1Byb2ZpbGVzID0gdXNlUHJvZmlsZVN0b3JlLmdldFN0YXRlKCkudGFyZ2V0UHJvZmlsZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdQcm9maWxlID0gZXhpc3RpbmdQcm9maWxlcy5maW5kKHAgPT4gcC5jb21wYW55TmFtZSA9PT0gY29tcGFueU5hbWUgJiYgcC5wcm9maWxlVHlwZSA9PT0gJ0F6dXJlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZXhpc3RpbmcgcHJvZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVUYXJnZXRQcm9maWxlKGV4aXN0aW5nUHJvZmlsZS5pZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldDogY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnQ29tcGxldGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZSB3aXRoIHJlcXVpcmVkIGZpZWxkcyAtIGNhc3QgdG8gVGFyZ2V0UHJvZmlsZSB0byBhdm9pZCB0eXBlIG1pc21hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFRhcmdldFByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBjb21wYW55TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVUeXBlOiAnQXp1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogc3VtbWFyeS5DbGllbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudFNlY3JldDogY2xpZW50U2VjcmV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IHN1bW1hcnkuQ3JlYXRlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIG1pc3NpbmcgcmVxdWlyZWQgZmllbGRzIHdpdGggZGVmYXVsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50OiAnQXp1cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaW9uOiAnR2xvYmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudE5hbWU6IHN1bW1hcnkuRG9tYWluIHx8IGNvbXBhbnlOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0RW5jcnlwdGVkOiAndHJ1ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGFyZVBvaW50VXJsOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNxbENvbm5lY3Rpb25TdHJpbmc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWVFbmNyeXB0ZWQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmRFbmNyeXB0ZWQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VydGlmaWNhdGVUaHVtYnByaW50OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3RSZXN1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q29ubmVjdGlvblRlc3RNZXNzYWdlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogc3VtbWFyeS5DcmVhdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogJ0NvbXBsZXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZGVjcnlwdCBjcmVkZW50aWFsIGZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIHJlYWQgY3JlZGVudGlhbCBzdW1tYXJ5Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciB0aW1lb3V0XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsYXBzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxhcHNlZCA+IG1heER1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ1RpbWVvdXQ6IEFwcCByZWdpc3RyYXRpb24gZGlkIG5vdCBjb21wbGV0ZSB3aXRoaW4gMTAgbWludXRlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgaXMgbm93IHVwZGF0ZWQgZnJvbSBzdGF0dXMgZmlsZSwgbm8gbmVlZCBmb3IgY291bnRkb3duIGhlcmVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAvLyBTdG9wIG1vbml0b3Jpbmcgb24gZXJyb3JcbiAgICAgICAgICAgICAgICBpZiAobW9uaXRvckludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgIG1vbml0b3JJbnRlcnZhbFJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gaW1wb3J0IGNyZWRlbnRpYWxzJyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHBvbGxJbnRlcnZhbCk7XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBTdG9wcyBtb25pdG9yaW5nIGZvciBjcmVkZW50aWFsIGZpbGVzXG4gICAgICovXG4gICAgY29uc3Qgc3RvcE1vbml0b3JpbmcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBtb25pdG9ySW50ZXJ2YWxSZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTGF1bmNoZXMgdGhlIEF6dXJlIEFwcCBSZWdpc3RyYXRpb24gc2NyaXB0XG4gICAgICovXG4gICAgY29uc3QgbGF1bmNoQXBwUmVnaXN0cmF0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENsZWFyIGFueSBwcmV2aW91cyBzdGF0dXMgZmlsZVxuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5jbGVhclN0YXR1cyhvcHRpb25zLmNvbXBhbnlOYW1lKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0xhdW5jaGluZyBhcHAgcmVnaXN0cmF0aW9uIHNjcmlwdC4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBMYXVuY2ggdGhlIFBvd2VyU2hlbGwgc2NyaXB0XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuYXBwUmVnaXN0cmF0aW9uLmxhdW5jaChvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IG1vbml0b3JpbmcgZm9yIGNyZWRlbnRpYWwgZmlsZXMgYW5kIHN0YXR1cyB1cGRhdGVzXG4gICAgICAgICAgICAgICAgYXdhaXQgc3RhcnRNb25pdG9yaW5nKG9wdGlvbnMuY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBsYXVuY2ggYXBwIHJlZ2lzdHJhdGlvbiBzY3JpcHQnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGlzTW9uaXRvcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdBbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkJyxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RlcDogbnVsbCxcbiAgICAgICAgICAgICAgICByZWdpc3RyYXRpb25TdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGFydE1vbml0b3JpbmddKTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgY3JlZGVudGlhbHMgYWxyZWFkeSBleGlzdCBmb3IgYSBjb21wYW55XG4gICAgICovXG4gICAgY29uc3QgY2hlY2tFeGlzdGluZ0NyZWRlbnRpYWxzID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNvbXBhbnlOYW1lKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmFwcFJlZ2lzdHJhdGlvbi5oYXNDcmVkZW50aWFscyhjb21wYW55TmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2hlY2sgZXhpc3RpbmcgY3JlZGVudGlhbHM6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIEltcG9ydHMgZXhpc3RpbmcgY3JlZGVudGlhbHMgZm9yIGEgY29tcGFueVxuICAgICAqL1xuICAgIGNvbnN0IGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMgPSB1c2VDYWxsYmFjayhhc3luYyAoY29tcGFueU5hbWUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJ0ltcG9ydGluZyBjcmVkZW50aWFscy4uLicsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0ZXA6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZWFkIGNyZWRlbnRpYWwgc3VtbWFyeVxuICAgICAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24ucmVhZFN1bW1hcnkoY29tcGFueU5hbWUpO1xuICAgICAgICAgICAgaWYgKCFzdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDcmVkZW50aWFsIHN1bW1hcnkgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBEZWNyeXB0IGNsaWVudCBzZWNyZXRcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudFNlY3JldCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5hcHBSZWdpc3RyYXRpb24uZGVjcnlwdENyZWRlbnRpYWwoc3VtbWFyeS5DcmVkZW50aWFsRmlsZSk7XG4gICAgICAgICAgICBpZiAoIWNsaWVudFNlY3JldCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGRlY3J5cHQgY3JlZGVudGlhbCBmaWxlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJbXBvcnQgaW50byBwcm9maWxlXG4gICAgICAgICAgICBjb25zdCBwcm9maWxlTmFtZSA9IGAke2NvbXBhbnlOYW1lfSAtIEF6dXJlYDtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHByb2ZpbGUgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZXMgPSB1c2VQcm9maWxlU3RvcmUuZ2V0U3RhdGUoKS50YXJnZXRQcm9maWxlcztcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUHJvZmlsZSA9IGV4aXN0aW5nUHJvZmlsZXMuZmluZChwID0+IHAuY29tcGFueU5hbWUgPT09IGNvbXBhbnlOYW1lICYmIHAucHJvZmlsZVR5cGUgPT09ICdBenVyZScpO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBleGlzdGluZyBwcm9maWxlXG4gICAgICAgICAgICAgICAgdXBkYXRlVGFyZ2V0UHJvZmlsZShleGlzdGluZ1Byb2ZpbGUuaWQsIHtcbiAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBzdW1tYXJ5LkNsaWVudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZSAtIGNhc3QgdG8gYW55IHRvIGJ5cGFzcyB0eXBlIGNoZWNraW5nXG4gICAgICAgICAgICAgICAgYWRkVGFyZ2V0UHJvZmlsZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9maWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFueU5hbWU6IGNvbXBhbnlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlVHlwZTogJ0F6dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgdGVuYW50SWQ6IHN1bW1hcnkuVGVuYW50SWQsXG4gICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBzdW1tYXJ5LkNsaWVudElkLFxuICAgICAgICAgICAgICAgICAgICBjbGllbnRTZWNyZXQ6IGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBzdW1tYXJ5LkRvbWFpbiB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgaXNDb25uZWN0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkOiBzdW1tYXJ5LkNyZWF0ZWQsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAnJyxcbiAgICAgICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiAnQ29tcGxldGUnLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNNb25pdG9yaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogJycsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBpbXBvcnQgY3JlZGVudGlhbHMnLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgICAgIHJlZ2lzdHJhdGlvblN0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2FkZFRhcmdldFByb2ZpbGUsIHVwZGF0ZVRhcmdldFByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIHN0YXRlXG4gICAgICovXG4gICAgY29uc3QgcmVzZXQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHN0b3BNb25pdG9yaW5nKCk7XG4gICAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc01vbml0b3Jpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6ICcnLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwOiBudWxsLFxuICAgICAgICAgICAgcmVnaXN0cmF0aW9uU3RhdHVzOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9LCBbc3RvcE1vbml0b3JpbmddKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZSxcbiAgICAgICAgbGF1bmNoQXBwUmVnaXN0cmF0aW9uLFxuICAgICAgICBjaGVja0V4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIGltcG9ydEV4aXN0aW5nQ3JlZGVudGlhbHMsXG4gICAgICAgIHN0b3BNb25pdG9yaW5nLFxuICAgICAgICByZXNldCxcbiAgICAgICAgUkVHSVNUUkFUSU9OX1NURVBTLCAvLyBFeHBvcnQgZm9yIFVJIGNvbnN1bXB0aW9uXG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=