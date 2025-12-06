(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3353],{

/***/ 21104:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ 35292:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var _headlessui_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(53874);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);
/* harmony import */ var _store_useModalStore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(23361);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(33813);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(34766);
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1156);

/**
 * Create Profile Dialog
 * Form dialog for creating new connection profiles
 */








const CreateProfileDialog = () => {
    const { modals, closeModal } = (0,_store_useModalStore__WEBPACK_IMPORTED_MODULE_4__/* .useModalStore */ .K)();
    const { createSourceProfile, testConnection } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_5__/* .useProfileStore */ .K)();
    // Find the actual modal instance to get its ID
    const modal = modals.find((m) => m.type === 'createProfile');
    const isOpen = !!modal;
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        name: '',
        type: 'source',
        connectionType: 'AD',
        server: '',
        domain: '',
        username: '',
        password: '',
    });
    const [isSaving, setIsSaving] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [isTesting, setIsTesting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [testResult, setTestResult] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const updateField = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTestResult(null); // Clear test result when form changes
    }, []);
    const handleTestConnection = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsTesting(true);
        setTestResult(null);
        console.log(`[CreateProfileDialog] Testing connection for new profile: ${formData.name}`);
        try {
            const profile = {
                id: '',
                companyName: formData.name,
                domainController: formData.server,
                isActive: true,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                configuration: {},
            };
            const result = await testConnection(profile);
            console.log('[CreateProfileDialog] Test connection result:', result);
            setTestResult({
                success: result.success,
                message: result.message || (result.success ? 'Connection successful! Credentials are valid.' : 'Connection failed'),
            });
        }
        catch (error) {
            console.error('[CreateProfileDialog] Test connection error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
            setTestResult({
                success: false,
                message: errorMsg,
            });
        }
        finally {
            setIsTesting(false);
        }
    }, [formData, testConnection]);
    const handleSave = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsSaving(true);
        try {
            await createSourceProfile({
                companyName: formData.name,
                domainController: formData.server,
                isActive: true,
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                configuration: {
                    type: formData.type,
                    connectionType: formData.connectionType,
                    domain: formData.domain,
                    username: formData.username,
                    password: formData.password,
                },
            });
            // Reset form and close
            setFormData({
                name: '',
                type: 'source',
                connectionType: 'AD',
                server: '',
                domain: '',
                username: '',
                password: '',
            });
            setTestResult(null);
            if (modal)
                closeModal(modal.id);
        }
        catch (error) {
            console.error('Failed to create profile:', error);
        }
        finally {
            setIsSaving(false);
        }
    }, [formData, createSourceProfile, closeModal, modal]);
    const handleClose = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setFormData({
            name: '',
            type: 'source',
            connectionType: 'AD',
            server: '',
            domain: '',
            username: '',
            password: '',
        });
        setTestResult(null);
        if (modal)
            closeModal(modal.id);
    }, [closeModal, modal]);
    const isFormValid = formData.name && formData.server && formData.username;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: handleClose, className: "relative z-50", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Create New Profile" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "data-cy": "close-dialog-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__/* .Input */ .p, { label: "Profile Name", placeholder: "e.g., Contoso Source", value: formData.name, onChange: (e) => updateField('name', e.target.value), required: true, "data-cy": "profile-name-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_8__/* .Select */ .l, { label: "Profile Type", value: formData.type, onChange: (value) => updateField('type', value), options: [
                                                { value: 'source', label: 'Source Environment' },
                                                { value: 'target', label: 'Target Environment' },
                                            ], "data-cy": "profile-type-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_8__/* .Select */ .l, { label: "Connection Type", value: formData.connectionType, onChange: (value) => updateField('connectionType', value), options: [
                                                { value: 'AD', label: 'Active Directory' },
                                                { value: 'Azure', label: 'Azure AD / Microsoft 365' },
                                                { value: 'Exchange', label: 'Exchange Server' },
                                                { value: 'SharePoint', label: 'SharePoint' },
                                            ], "data-cy": "connection-type-select" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__/* .Input */ .p, { label: "Server / Endpoint", placeholder: formData.connectionType === 'Azure' ? 'Tenant ID or domain' : 'server.domain.com', value: formData.server, onChange: (e) => updateField('server', e.target.value), required: true, "data-cy": "server-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__/* .Input */ .p, { label: "Domain", placeholder: "CONTOSO", value: formData.domain, onChange: (e) => updateField('domain', e.target.value), helperText: "Leave empty for Azure AD", "data-cy": "domain-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__/* .Input */ .p, { label: "Username", placeholder: "administrator@contoso.com", value: formData.username, onChange: (e) => updateField('username', e.target.value), required: true, "data-cy": "username-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__/* .Input */ .p, { label: "Password", type: "password", value: formData.password, onChange: (e) => updateField('password', e.target.value), required: true, "data-cy": "password-input" }), testResult && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `flex items-center gap-2 p-3 rounded-md ${testResult.success
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`, children: [testResult.success ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .CheckCircle */ .rAV, { className: "w-5 h-5" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-5 h-5" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: testResult.message })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { variant: "secondary", onClick: handleTestConnection, disabled: !isFormValid || isTesting, loading: isTesting, "data-cy": "test-connection-btn", children: "Test Connection" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { variant: "secondary", onClick: handleClose, "data-cy": "cancel-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { variant: "primary", onClick: handleSave, disabled: !isFormValid || isSaving, loading: isSaving, "data-cy": "save-profile-btn", children: "Create Profile" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CreateProfileDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMzM1My5iZjc5MWQ4MWQzNDU5ZjYzNWFkOS5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBLGU7Ozs7Ozs7Ozs7Ozs7OztBQ0ErRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQzBDO0FBQ2Q7QUFDcUI7QUFDakQ7QUFDQTtBQUNBO0FBQ08sY0FBYyxpREFBVSxJQUFJLHdMQUF3TDtBQUMzTjtBQUNBLG1DQUFtQyx3Q0FBd0M7QUFDM0UsdUJBQXVCLFFBQVE7QUFDL0Isd0JBQXdCLFFBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsbURBQUk7QUFDN0IsVUFBVSxtREFBSTtBQUNkLFVBQVUsbURBQUk7QUFDZDtBQUNBLDZCQUE2QixtREFBSTtBQUNqQztBQUNBLHlCQUF5QixtREFBSTtBQUM3QjtBQUNBLDBCQUEwQixtREFBSTtBQUM5QixZQUFZLHVEQUFLLFVBQVUsa0RBQWtELHVEQUFLLFlBQVksMEVBQTBFLHNEQUFJLFdBQVcseUVBQXlFLGtDQUFrQyxzREFBSSxXQUFXLG9GQUFvRixLQUFLLElBQUksdURBQUssVUFBVSxnREFBZ0Qsc0RBQUksVUFBVSw2RkFBNkYsc0RBQUksV0FBVywyRkFBMkYsR0FBRyxJQUFJLHNEQUFJLFlBQVksNkZBQTZGLG1EQUFJLHFJQUFxSSxlQUFlLHNEQUFJLFVBQVUsOEZBQThGLHNEQUFJLFdBQVcseUZBQXlGLEdBQUcsS0FBSyxhQUFhLHNEQUFJLFVBQVUsZ0VBQWdFLHVEQUFLLFdBQVcsMkNBQTJDLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSxrREFBa0QsV0FBVyxHQUFHLDZCQUE2QixzREFBSSxVQUFVLGtEQUFrRCx1REFBSyxXQUFXLDJDQUEyQyxzREFBSSxDQUFDLHlEQUFJLElBQUksa0RBQWtELGdCQUFnQixHQUFHLEtBQUs7QUFDbm1ELENBQUM7QUFDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25DK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDcUQ7QUFDVjtBQUNnQjtBQUNEO0FBQ0k7QUFDckI7QUFDRjtBQUNFO0FBQ3pDO0FBQ0EsWUFBWSxxQkFBcUIsRUFBRSw0RUFBYTtBQUNoRCxZQUFZLHNDQUFzQyxFQUFFLGdGQUFlO0FBQ25FO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQywrQ0FBUTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxvQ0FBb0MsK0NBQVE7QUFDNUMsc0NBQXNDLCtDQUFRO0FBQzlDLHdDQUF3QywrQ0FBUTtBQUNoRCx3QkFBd0Isa0RBQVc7QUFDbkMsK0JBQStCLHlCQUF5QjtBQUN4RCw2QkFBNkI7QUFDN0IsS0FBSztBQUNMLGlDQUFpQyxrREFBVztBQUM1QztBQUNBO0FBQ0EsaUZBQWlGLGNBQWM7QUFDL0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsdUJBQXVCLGtEQUFXO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx3QkFBd0Isa0RBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxZQUFZLHVEQUFLLENBQUMsK0RBQU0sSUFBSSwyRUFBMkUsc0RBQUksVUFBVSwrREFBK0QsR0FBRyxzREFBSSxVQUFVLDJFQUEyRSx1REFBSyxDQUFDLCtEQUFNLFVBQVUsaUdBQWlHLHVEQUFLLFVBQVUsbUhBQW1ILHNEQUFJLENBQUMsK0RBQU0sVUFBVSxrR0FBa0csR0FBRyxzREFBSSxhQUFhLHdJQUF3SSxzREFBSSxDQUFDLDJDQUFDLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLHVEQUFLLFVBQVUsdUZBQXVGLHNEQUFJLENBQUMsd0RBQUssSUFBSSx5TEFBeUwsR0FBRyx1REFBSyxVQUFVLGdEQUFnRCxzREFBSSxDQUFDLDBEQUFNLElBQUk7QUFDcHNDLGtEQUFrRCw4Q0FBOEM7QUFDaEcsa0RBQWtELDhDQUE4QztBQUNoRyxpRkFBaUYsR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUk7QUFDbkcsa0RBQWtELHdDQUF3QztBQUMxRixrREFBa0QsbURBQW1EO0FBQ3JHLGtEQUFrRCw2Q0FBNkM7QUFDL0Ysa0RBQWtELDBDQUEwQztBQUM1RixvRkFBb0YsSUFBSSxHQUFHLHNEQUFJLENBQUMsd0RBQUssSUFBSSx1UEFBdVAsR0FBRyxzREFBSSxDQUFDLHdEQUFLLElBQUksNExBQTRMLEdBQUcsc0RBQUksQ0FBQyx3REFBSyxJQUFJLDhMQUE4TCxHQUFHLHNEQUFJLENBQUMsd0RBQUssSUFBSSxzS0FBc0ssa0JBQWtCLHVEQUFLLFVBQVUscURBQXFEO0FBQ3pnQztBQUNBLHdHQUF3RyxvQ0FBb0Msc0RBQUksQ0FBQyxnRUFBVyxJQUFJLHNCQUFzQixNQUFNLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSxzQkFBc0IsSUFBSSxzREFBSSxXQUFXLG9EQUFvRCxJQUFJLEtBQUssR0FBRyx1REFBSyxVQUFVLHFIQUFxSCxzREFBSSxDQUFDLDBEQUFNLElBQUksNktBQTZLLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLHlGQUF5RixHQUFHLHNEQUFJLENBQUMsMERBQU0sSUFBSSwySkFBMkosSUFBSSxJQUFJLEdBQUcsSUFBSTtBQUNoNkI7QUFDQSxpRUFBZSxtQkFBbUIsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0NyZWF0ZVByb2ZpbGVEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ3JlYXRlIFByb2ZpbGUgRGlhbG9nXG4gKiBGb3JtIGRpYWxvZyBmb3IgY3JlYXRpbmcgbmV3IGNvbm5lY3Rpb24gcHJvZmlsZXNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJ0BoZWFkbGVzc3VpL3JlYWN0JztcbmltcG9ydCB7IFgsIENoZWNrQ2lyY2xlLCBBbGVydENpcmNsZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VNb2RhbFN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlTW9kYWxTdG9yZSc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vYXRvbXMvU2VsZWN0JztcbmNvbnN0IENyZWF0ZVByb2ZpbGVEaWFsb2cgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBtb2RhbHMsIGNsb3NlTW9kYWwgfSA9IHVzZU1vZGFsU3RvcmUoKTtcbiAgICBjb25zdCB7IGNyZWF0ZVNvdXJjZVByb2ZpbGUsIHRlc3RDb25uZWN0aW9uIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICAvLyBGaW5kIHRoZSBhY3R1YWwgbW9kYWwgaW5zdGFuY2UgdG8gZ2V0IGl0cyBJRFxuICAgIGNvbnN0IG1vZGFsID0gbW9kYWxzLmZpbmQoKG0pID0+IG0udHlwZSA9PT0gJ2NyZWF0ZVByb2ZpbGUnKTtcbiAgICBjb25zdCBpc09wZW4gPSAhIW1vZGFsO1xuICAgIGNvbnN0IFtmb3JtRGF0YSwgc2V0Rm9ybURhdGFdID0gdXNlU3RhdGUoe1xuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgdHlwZTogJ3NvdXJjZScsXG4gICAgICAgIGNvbm5lY3Rpb25UeXBlOiAnQUQnLFxuICAgICAgICBzZXJ2ZXI6ICcnLFxuICAgICAgICBkb21haW46ICcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICB9KTtcbiAgICBjb25zdCBbaXNTYXZpbmcsIHNldElzU2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbaXNUZXN0aW5nLCBzZXRJc1Rlc3RpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFt0ZXN0UmVzdWx0LCBzZXRUZXN0UmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IHVwZGF0ZUZpZWxkID0gdXNlQ2FsbGJhY2soKGZpZWxkLCB2YWx1ZSkgPT4ge1xuICAgICAgICBzZXRGb3JtRGF0YShwcmV2ID0+ICh7IC4uLnByZXYsIFtmaWVsZF06IHZhbHVlIH0pKTtcbiAgICAgICAgc2V0VGVzdFJlc3VsdChudWxsKTsgLy8gQ2xlYXIgdGVzdCByZXN1bHQgd2hlbiBmb3JtIGNoYW5nZXNcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgaGFuZGxlVGVzdENvbm5lY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzVGVzdGluZyh0cnVlKTtcbiAgICAgICAgc2V0VGVzdFJlc3VsdChudWxsKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtDcmVhdGVQcm9maWxlRGlhbG9nXSBUZXN0aW5nIGNvbm5lY3Rpb24gZm9yIG5ldyBwcm9maWxlOiAke2Zvcm1EYXRhLm5hbWV9YCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcm9maWxlID0ge1xuICAgICAgICAgICAgICAgIGlkOiAnJyxcbiAgICAgICAgICAgICAgICBjb21wYW55TmFtZTogZm9ybURhdGEubmFtZSxcbiAgICAgICAgICAgICAgICBkb21haW5Db250cm9sbGVyOiBmb3JtRGF0YS5zZXJ2ZXIsXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHt9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRlc3RDb25uZWN0aW9uKHByb2ZpbGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tDcmVhdGVQcm9maWxlRGlhbG9nXSBUZXN0IGNvbm5lY3Rpb24gcmVzdWx0OicsIHJlc3VsdCk7XG4gICAgICAgICAgICBzZXRUZXN0UmVzdWx0KHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXN1bHQubWVzc2FnZSB8fCAocmVzdWx0LnN1Y2Nlc3MgPyAnQ29ubmVjdGlvbiBzdWNjZXNzZnVsISBDcmVkZW50aWFscyBhcmUgdmFsaWQuJyA6ICdDb25uZWN0aW9uIGZhaWxlZCcpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQ3JlYXRlUHJvZmlsZURpYWxvZ10gVGVzdCBjb25uZWN0aW9uIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCc7XG4gICAgICAgICAgICBzZXRUZXN0UmVzdWx0KHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvck1zZyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNUZXN0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtmb3JtRGF0YSwgdGVzdENvbm5lY3Rpb25dKTtcbiAgICBjb25zdCBoYW5kbGVTYXZlID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc1NhdmluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGNyZWF0ZVNvdXJjZVByb2ZpbGUoe1xuICAgICAgICAgICAgICAgIGNvbXBhbnlOYW1lOiBmb3JtRGF0YS5uYW1lLFxuICAgICAgICAgICAgICAgIGRvbWFpbkNvbnRyb2xsZXI6IGZvcm1EYXRhLnNlcnZlcixcbiAgICAgICAgICAgICAgICBpc0FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBmb3JtRGF0YS50eXBlLFxuICAgICAgICAgICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogZm9ybURhdGEuY29ubmVjdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogZm9ybURhdGEuZG9tYWluLFxuICAgICAgICAgICAgICAgICAgICB1c2VybmFtZTogZm9ybURhdGEudXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBmb3JtRGF0YS5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBSZXNldCBmb3JtIGFuZCBjbG9zZVxuICAgICAgICAgICAgc2V0Rm9ybURhdGEoe1xuICAgICAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdzb3VyY2UnLFxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25UeXBlOiAnQUQnLFxuICAgICAgICAgICAgICAgIHNlcnZlcjogJycsXG4gICAgICAgICAgICAgICAgZG9tYWluOiAnJyxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRUZXN0UmVzdWx0KG51bGwpO1xuICAgICAgICAgICAgaWYgKG1vZGFsKVxuICAgICAgICAgICAgICAgIGNsb3NlTW9kYWwobW9kYWwuaWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBwcm9maWxlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzU2F2aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtmb3JtRGF0YSwgY3JlYXRlU291cmNlUHJvZmlsZSwgY2xvc2VNb2RhbCwgbW9kYWxdKTtcbiAgICBjb25zdCBoYW5kbGVDbG9zZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0Rm9ybURhdGEoe1xuICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICB0eXBlOiAnc291cmNlJyxcbiAgICAgICAgICAgIGNvbm5lY3Rpb25UeXBlOiAnQUQnLFxuICAgICAgICAgICAgc2VydmVyOiAnJyxcbiAgICAgICAgICAgIGRvbWFpbjogJycsXG4gICAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUZXN0UmVzdWx0KG51bGwpO1xuICAgICAgICBpZiAobW9kYWwpXG4gICAgICAgICAgICBjbG9zZU1vZGFsKG1vZGFsLmlkKTtcbiAgICB9LCBbY2xvc2VNb2RhbCwgbW9kYWxdKTtcbiAgICBjb25zdCBpc0Zvcm1WYWxpZCA9IGZvcm1EYXRhLm5hbWUgJiYgZm9ybURhdGEuc2VydmVyICYmIGZvcm1EYXRhLnVzZXJuYW1lO1xuICAgIHJldHVybiAoX2pzeHMoRGlhbG9nLCB7IG9wZW46IGlzT3Blbiwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy0yeGwgdy1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiQ3JlYXRlIE5ldyBQcm9maWxlXCIgfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBoYW5kbGVDbG9zZSwgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCBkYXJrOmhvdmVyOnRleHQtZ3JheS0zMDBcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtZGlhbG9nLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTQgc3BhY2UteS00IG1heC1oLVtjYWxjKDEwMHZoLTE2cmVtKV0gb3ZlcmZsb3cteS1hdXRvXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJQcm9maWxlIE5hbWVcIiwgcGxhY2Vob2xkZXI6IFwiZS5nLiwgQ29udG9zbyBTb3VyY2VcIiwgdmFsdWU6IGZvcm1EYXRhLm5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmllbGQoJ25hbWUnLCBlLnRhcmdldC52YWx1ZSksIHJlcXVpcmVkOiB0cnVlLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLW5hbWUtaW5wdXRcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goU2VsZWN0LCB7IGxhYmVsOiBcIlByb2ZpbGUgVHlwZVwiLCB2YWx1ZTogZm9ybURhdGEudHlwZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmllbGQoJ3R5cGUnLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdzb3VyY2UnLCBsYWJlbDogJ1NvdXJjZSBFbnZpcm9ubWVudCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICd0YXJnZXQnLCBsYWJlbDogJ1RhcmdldCBFbnZpcm9ubWVudCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS10eXBlLXNlbGVjdFwiIH0pLCBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJDb25uZWN0aW9uIFR5cGVcIiwgdmFsdWU6IGZvcm1EYXRhLmNvbm5lY3Rpb25UeXBlLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWVsZCgnY29ubmVjdGlvblR5cGUnLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdBRCcsIGxhYmVsOiAnQWN0aXZlIERpcmVjdG9yeScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdBenVyZScsIGxhYmVsOiAnQXp1cmUgQUQgLyBNaWNyb3NvZnQgMzY1JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0V4Y2hhbmdlJywgbGFiZWw6ICdFeGNoYW5nZSBTZXJ2ZXInIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnU2hhcmVQb2ludCcsIGxhYmVsOiAnU2hhcmVQb2ludCcgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwiY29ubmVjdGlvbi10eXBlLXNlbGVjdFwiIH0pXSB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJTZXJ2ZXIgLyBFbmRwb2ludFwiLCBwbGFjZWhvbGRlcjogZm9ybURhdGEuY29ubmVjdGlvblR5cGUgPT09ICdBenVyZScgPyAnVGVuYW50IElEIG9yIGRvbWFpbicgOiAnc2VydmVyLmRvbWFpbi5jb20nLCB2YWx1ZTogZm9ybURhdGEuc2VydmVyLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpZWxkKCdzZXJ2ZXInLCBlLnRhcmdldC52YWx1ZSksIHJlcXVpcmVkOiB0cnVlLCBcImRhdGEtY3lcIjogXCJzZXJ2ZXItaW5wdXRcIiB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJEb21haW5cIiwgcGxhY2Vob2xkZXI6IFwiQ09OVE9TT1wiLCB2YWx1ZTogZm9ybURhdGEuZG9tYWluLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpZWxkKCdkb21haW4nLCBlLnRhcmdldC52YWx1ZSksIGhlbHBlclRleHQ6IFwiTGVhdmUgZW1wdHkgZm9yIEF6dXJlIEFEXCIsIFwiZGF0YS1jeVwiOiBcImRvbWFpbi1pbnB1dFwiIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIlVzZXJuYW1lXCIsIHBsYWNlaG9sZGVyOiBcImFkbWluaXN0cmF0b3JAY29udG9zby5jb21cIiwgdmFsdWU6IGZvcm1EYXRhLnVzZXJuYW1lLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpZWxkKCd1c2VybmFtZScsIGUudGFyZ2V0LnZhbHVlKSwgcmVxdWlyZWQ6IHRydWUsIFwiZGF0YS1jeVwiOiBcInVzZXJuYW1lLWlucHV0XCIgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiLCB2YWx1ZTogZm9ybURhdGEucGFzc3dvcmQsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmllbGQoJ3Bhc3N3b3JkJywgZS50YXJnZXQudmFsdWUpLCByZXF1aXJlZDogdHJ1ZSwgXCJkYXRhLWN5XCI6IFwicGFzc3dvcmQtaW5wdXRcIiB9KSwgdGVzdFJlc3VsdCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBwLTMgcm91bmRlZC1tZCAke3Rlc3RSZXN1bHQuc3VjY2Vzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWdyZWVuLTUwIGRhcms6YmctZ3JlZW4tOTAwLzIwIHRleHQtZ3JlZW4tODAwIGRhcms6dGV4dC1ncmVlbi0yMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCB0ZXh0LXJlZC04MDAgZGFyazp0ZXh0LXJlZC0yMDAnfWAsIGNoaWxkcmVuOiBbdGVzdFJlc3VsdC5zdWNjZXNzID8gKF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSkgOiAoX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogdGVzdFJlc3VsdC5tZXNzYWdlIH0pXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlVGVzdENvbm5lY3Rpb24sIGRpc2FibGVkOiAhaXNGb3JtVmFsaWQgfHwgaXNUZXN0aW5nLCBsb2FkaW5nOiBpc1Rlc3RpbmcsIFwiZGF0YS1jeVwiOiBcInRlc3QtY29ubmVjdGlvbi1idG5cIiwgY2hpbGRyZW46IFwiVGVzdCBDb25uZWN0aW9uXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZUNsb3NlLCBcImRhdGEtY3lcIjogXCJjYW5jZWwtYnRuXCIsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlU2F2ZSwgZGlzYWJsZWQ6ICFpc0Zvcm1WYWxpZCB8fCBpc1NhdmluZywgbG9hZGluZzogaXNTYXZpbmcsIFwiZGF0YS1jeVwiOiBcInNhdmUtcHJvZmlsZS1idG5cIiwgY2hpbGRyZW46IFwiQ3JlYXRlIFByb2ZpbGVcIiB9KV0gfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ3JlYXRlUHJvZmlsZURpYWxvZztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==