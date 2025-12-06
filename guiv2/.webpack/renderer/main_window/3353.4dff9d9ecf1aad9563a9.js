(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3353],{

/***/ 21104:
/*!*********************************!*\
  !*** process/browser (ignored) ***!
  \*********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 34766:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Input.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ 35292:
/*!*****************************************************************!*\
  !*** ./src/renderer/components/dialogs/CreateProfileDialog.tsx ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _headlessui_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @headlessui/react */ 53874);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _store_useModalStore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../store/useModalStore */ 23361);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../store/useProfileStore */ 33813);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../atoms/Input */ 34766);
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../atoms/Select */ 1156);

/**
 * Create Profile Dialog
 * Form dialog for creating new connection profiles
 */








const CreateProfileDialog = () => {
    const { modals, closeModal } = (0,_store_useModalStore__WEBPACK_IMPORTED_MODULE_4__.useModalStore)();
    const { createSourceProfile, testConnection } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_5__.useProfileStore)();
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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog, { open: isOpen, onClose: handleClose, className: "relative z-50", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Panel, { className: "mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Title, { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "Create New Profile" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "data-cy": "close-dialog-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__.Input, { label: "Profile Name", placeholder: "e.g., Contoso Source", value: formData.name, onChange: (e) => updateField('name', e.target.value), required: true, "data-cy": "profile-name-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_8__.Select, { label: "Profile Type", value: formData.type, onChange: (value) => updateField('type', value), options: [
                                                { value: 'source', label: 'Source Environment' },
                                                { value: 'target', label: 'Target Environment' },
                                            ], "data-cy": "profile-type-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_8__.Select, { label: "Connection Type", value: formData.connectionType, onChange: (value) => updateField('connectionType', value), options: [
                                                { value: 'AD', label: 'Active Directory' },
                                                { value: 'Azure', label: 'Azure AD / Microsoft 365' },
                                                { value: 'Exchange', label: 'Exchange Server' },
                                                { value: 'SharePoint', label: 'SharePoint' },
                                            ], "data-cy": "connection-type-select" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__.Input, { label: "Server / Endpoint", placeholder: formData.connectionType === 'Azure' ? 'Tenant ID or domain' : 'server.domain.com', value: formData.server, onChange: (e) => updateField('server', e.target.value), required: true, "data-cy": "server-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__.Input, { label: "Domain", placeholder: "CONTOSO", value: formData.domain, onChange: (e) => updateField('domain', e.target.value), helperText: "Leave empty for Azure AD", "data-cy": "domain-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__.Input, { label: "Username", placeholder: "administrator@contoso.com", value: formData.username, onChange: (e) => updateField('username', e.target.value), required: true, "data-cy": "username-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_7__.Input, { label: "Password", type: "password", value: formData.password, onChange: (e) => updateField('password', e.target.value), required: true, "data-cy": "password-input" }), testResult && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: `flex items-center gap-2 p-3 rounded-md ${testResult.success
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`, children: [testResult.success ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.CheckCircle, { className: "w-5 h-5" })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-5 h-5" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: testResult.message })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { variant: "secondary", onClick: handleTestConnection, disabled: !isFormValid || isTesting, loading: isTesting, "data-cy": "test-connection-btn", children: "Test Connection" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { variant: "secondary", onClick: handleClose, "data-cy": "cancel-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { variant: "primary", onClick: handleSave, disabled: !isFormValid || isSaving, loading: isSaving, "data-cy": "save-profile-btn", children: "Create Profile" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CreateProfileDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXEBoZWFkbGVzc3VpXFxyZWFjdFxcZGlzdFxcaG9va3N8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZGlhbG9ncy9DcmVhdGVQcm9maWxlRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENyZWF0ZSBQcm9maWxlIERpYWxvZ1xuICogRm9ybSBkaWFsb2cgZm9yIGNyZWF0aW5nIG5ldyBjb25uZWN0aW9uIHByb2ZpbGVzXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICdAaGVhZGxlc3N1aS9yZWFjdCc7XG5pbXBvcnQgeyBYLCBDaGVja0NpcmNsZSwgQWxlcnRDaXJjbGUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlTW9kYWxTdG9yZSB9IGZyb20gJy4uLy4uL3N0b3JlL3VzZU1vZGFsU3RvcmUnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uL2F0b21zL0lucHV0JztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL2F0b21zL1NlbGVjdCc7XG5jb25zdCBDcmVhdGVQcm9maWxlRGlhbG9nID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgbW9kYWxzLCBjbG9zZU1vZGFsIH0gPSB1c2VNb2RhbFN0b3JlKCk7XG4gICAgY29uc3QgeyBjcmVhdGVTb3VyY2VQcm9maWxlLCB0ZXN0Q29ubmVjdGlvbiB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgLy8gRmluZCB0aGUgYWN0dWFsIG1vZGFsIGluc3RhbmNlIHRvIGdldCBpdHMgSURcbiAgICBjb25zdCBtb2RhbCA9IG1vZGFscy5maW5kKChtKSA9PiBtLnR5cGUgPT09ICdjcmVhdGVQcm9maWxlJyk7XG4gICAgY29uc3QgaXNPcGVuID0gISFtb2RhbDtcbiAgICBjb25zdCBbZm9ybURhdGEsIHNldEZvcm1EYXRhXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIHR5cGU6ICdzb3VyY2UnLFxuICAgICAgICBjb25uZWN0aW9uVHlwZTogJ0FEJyxcbiAgICAgICAgc2VydmVyOiAnJyxcbiAgICAgICAgZG9tYWluOiAnJyxcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBwYXNzd29yZDogJycsXG4gICAgfSk7XG4gICAgY29uc3QgW2lzU2F2aW5nLCBzZXRJc1NhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2lzVGVzdGluZywgc2V0SXNUZXN0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdGVzdFJlc3VsdCwgc2V0VGVzdFJlc3VsdF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCB1cGRhdGVGaWVsZCA9IHVzZUNhbGxiYWNrKChmaWVsZCwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0Rm9ybURhdGEocHJldiA9PiAoeyAuLi5wcmV2LCBbZmllbGRdOiB2YWx1ZSB9KSk7XG4gICAgICAgIHNldFRlc3RSZXN1bHQobnVsbCk7IC8vIENsZWFyIHRlc3QgcmVzdWx0IHdoZW4gZm9ybSBjaGFuZ2VzXG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGhhbmRsZVRlc3RDb25uZWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRJc1Rlc3RpbmcodHJ1ZSk7XG4gICAgICAgIHNldFRlc3RSZXN1bHQobnVsbCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbQ3JlYXRlUHJvZmlsZURpYWxvZ10gVGVzdGluZyBjb25uZWN0aW9uIGZvciBuZXcgcHJvZmlsZTogJHtmb3JtRGF0YS5uYW1lfWApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJvZmlsZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogJycsXG4gICAgICAgICAgICAgICAgY29tcGFueU5hbWU6IGZvcm1EYXRhLm5hbWUsXG4gICAgICAgICAgICAgICAgZG9tYWluQ29udHJvbGxlcjogZm9ybURhdGEuc2VydmVyLFxuICAgICAgICAgICAgICAgIGlzQWN0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uOiB7fSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0ZXN0Q29ubmVjdGlvbihwcm9maWxlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbQ3JlYXRlUHJvZmlsZURpYWxvZ10gVGVzdCBjb25uZWN0aW9uIHJlc3VsdDonLCByZXN1bHQpO1xuICAgICAgICAgICAgc2V0VGVzdFJlc3VsdCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UgfHwgKHJlc3VsdC5zdWNjZXNzID8gJ0Nvbm5lY3Rpb24gc3VjY2Vzc2Z1bCEgQ3JlZGVudGlhbHMgYXJlIHZhbGlkLicgOiAnQ29ubmVjdGlvbiBmYWlsZWQnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0NyZWF0ZVByb2ZpbGVEaWFsb2ddIFRlc3QgY29ubmVjdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0VGVzdFJlc3VsdCh7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3JNc2csXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzVGVzdGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbZm9ybURhdGEsIHRlc3RDb25uZWN0aW9uXSk7XG4gICAgY29uc3QgaGFuZGxlU2F2ZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNTYXZpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVTb3VyY2VQcm9maWxlKHtcbiAgICAgICAgICAgICAgICBjb21wYW55TmFtZTogZm9ybURhdGEubmFtZSxcbiAgICAgICAgICAgICAgICBkb21haW5Db250cm9sbGVyOiBmb3JtRGF0YS5zZXJ2ZXIsXG4gICAgICAgICAgICAgICAgaXNBY3RpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGxhc3RNb2RpZmllZDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZm9ybURhdGEudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvblR5cGU6IGZvcm1EYXRhLmNvbm5lY3Rpb25UeXBlLFxuICAgICAgICAgICAgICAgICAgICBkb21haW46IGZvcm1EYXRhLmRvbWFpbixcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IGZvcm1EYXRhLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogZm9ybURhdGEucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybSBhbmQgY2xvc2VcbiAgICAgICAgICAgIHNldEZvcm1EYXRhKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnc291cmNlJyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogJ0FEJyxcbiAgICAgICAgICAgICAgICBzZXJ2ZXI6ICcnLFxuICAgICAgICAgICAgICAgIGRvbWFpbjogJycsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0VGVzdFJlc3VsdChudWxsKTtcbiAgICAgICAgICAgIGlmIChtb2RhbClcbiAgICAgICAgICAgICAgICBjbG9zZU1vZGFsKG1vZGFsLmlkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgcHJvZmlsZTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc1NhdmluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbZm9ybURhdGEsIGNyZWF0ZVNvdXJjZVByb2ZpbGUsIGNsb3NlTW9kYWwsIG1vZGFsXSk7XG4gICAgY29uc3QgaGFuZGxlQ2xvc2UgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEZvcm1EYXRhKHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgdHlwZTogJ3NvdXJjZScsXG4gICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogJ0FEJyxcbiAgICAgICAgICAgIHNlcnZlcjogJycsXG4gICAgICAgICAgICBkb21haW46ICcnLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGVzdFJlc3VsdChudWxsKTtcbiAgICAgICAgaWYgKG1vZGFsKVxuICAgICAgICAgICAgY2xvc2VNb2RhbChtb2RhbC5pZCk7XG4gICAgfSwgW2Nsb3NlTW9kYWwsIG1vZGFsXSk7XG4gICAgY29uc3QgaXNGb3JtVmFsaWQgPSBmb3JtRGF0YS5uYW1lICYmIGZvcm1EYXRhLnNlcnZlciAmJiBmb3JtRGF0YS51c2VybmFtZTtcbiAgICByZXR1cm4gKF9qc3hzKERpYWxvZywgeyBvcGVuOiBpc09wZW4sIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLCBjbGFzc05hbWU6IFwicmVsYXRpdmUgei01MFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay8zMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhEaWFsb2cuUGFuZWwsIHsgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWF4LXctMnhsIHctZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LXhsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4KERpYWxvZy5UaXRsZSwgeyBjbGFzc05hbWU6IFwidGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNyZWF0ZSBOZXcgUHJvZmlsZVwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlQ2xvc2UsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIsIFwiZGF0YS1jeVwiOiBcImNsb3NlLWRpYWxvZy1idG5cIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHgtNiBweS00IHNwYWNlLXktNCBtYXgtaC1bY2FsYygxMDB2aC0xNnJlbSldIG92ZXJmbG93LXktYXV0b1wiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiUHJvZmlsZSBOYW1lXCIsIHBsYWNlaG9sZGVyOiBcImUuZy4sIENvbnRvc28gU291cmNlXCIsIHZhbHVlOiBmb3JtRGF0YS5uYW1lLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpZWxkKCduYW1lJywgZS50YXJnZXQudmFsdWUpLCByZXF1aXJlZDogdHJ1ZSwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS1uYW1lLWlucHV0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJQcm9maWxlIFR5cGVcIiwgdmFsdWU6IGZvcm1EYXRhLnR5cGUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpZWxkKCd0eXBlJywgdmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgRW52aXJvbm1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAndGFyZ2V0JywgbGFiZWw6ICdUYXJnZXQgRW52aXJvbm1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIFwiZGF0YS1jeVwiOiBcInByb2ZpbGUtdHlwZS1zZWxlY3RcIiB9KSwgX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiQ29ubmVjdGlvbiBUeXBlXCIsIHZhbHVlOiBmb3JtRGF0YS5jb25uZWN0aW9uVHlwZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmllbGQoJ2Nvbm5lY3Rpb25UeXBlJywgdmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnQUQnLCBsYWJlbDogJ0FjdGl2ZSBEaXJlY3RvcnknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnQXp1cmUnLCBsYWJlbDogJ0F6dXJlIEFEIC8gTWljcm9zb2Z0IDM2NScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdFeGNoYW5nZScsIGxhYmVsOiAnRXhjaGFuZ2UgU2VydmVyJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1NoYXJlUG9pbnQnLCBsYWJlbDogJ1NoYXJlUG9pbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIFwiZGF0YS1jeVwiOiBcImNvbm5lY3Rpb24tdHlwZS1zZWxlY3RcIiB9KV0gfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiU2VydmVyIC8gRW5kcG9pbnRcIiwgcGxhY2Vob2xkZXI6IGZvcm1EYXRhLmNvbm5lY3Rpb25UeXBlID09PSAnQXp1cmUnID8gJ1RlbmFudCBJRCBvciBkb21haW4nIDogJ3NlcnZlci5kb21haW4uY29tJywgdmFsdWU6IGZvcm1EYXRhLnNlcnZlciwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWVsZCgnc2VydmVyJywgZS50YXJnZXQudmFsdWUpLCByZXF1aXJlZDogdHJ1ZSwgXCJkYXRhLWN5XCI6IFwic2VydmVyLWlucHV0XCIgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiRG9tYWluXCIsIHBsYWNlaG9sZGVyOiBcIkNPTlRPU09cIiwgdmFsdWU6IGZvcm1EYXRhLmRvbWFpbiwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWVsZCgnZG9tYWluJywgZS50YXJnZXQudmFsdWUpLCBoZWxwZXJUZXh0OiBcIkxlYXZlIGVtcHR5IGZvciBBenVyZSBBRFwiLCBcImRhdGEtY3lcIjogXCJkb21haW4taW5wdXRcIiB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJVc2VybmFtZVwiLCBwbGFjZWhvbGRlcjogXCJhZG1pbmlzdHJhdG9yQGNvbnRvc28uY29tXCIsIHZhbHVlOiBmb3JtRGF0YS51c2VybmFtZSwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWVsZCgndXNlcm5hbWUnLCBlLnRhcmdldC52YWx1ZSksIHJlcXVpcmVkOiB0cnVlLCBcImRhdGEtY3lcIjogXCJ1c2VybmFtZS1pbnB1dFwiIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiwgdmFsdWU6IGZvcm1EYXRhLnBhc3N3b3JkLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpZWxkKCdwYXNzd29yZCcsIGUudGFyZ2V0LnZhbHVlKSwgcmVxdWlyZWQ6IHRydWUsIFwiZGF0YS1jeVwiOiBcInBhc3N3b3JkLWlucHV0XCIgfSksIHRlc3RSZXN1bHQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcC0zIHJvdW5kZWQtbWQgJHt0ZXN0UmVzdWx0LnN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCB0ZXh0LWdyZWVuLTgwMCBkYXJrOnRleHQtZ3JlZW4tMjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwJ31gLCBjaGlsZHJlbjogW3Rlc3RSZXN1bHQuc3VjY2VzcyA/IChfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkpIDogKF9qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IHRlc3RSZXN1bHQubWVzc2FnZSB9KV0gfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1lbmQgZ2FwLTIgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVRlc3RDb25uZWN0aW9uLCBkaXNhYmxlZDogIWlzRm9ybVZhbGlkIHx8IGlzVGVzdGluZywgbG9hZGluZzogaXNUZXN0aW5nLCBcImRhdGEtY3lcIjogXCJ0ZXN0LWNvbm5lY3Rpb24tYnRuXCIsIGNoaWxkcmVuOiBcIlRlc3QgQ29ubmVjdGlvblwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBoYW5kbGVDbG9zZSwgXCJkYXRhLWN5XCI6IFwiY2FuY2VsLWJ0blwiLCBjaGlsZHJlbjogXCJDYW5jZWxcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVNhdmUsIGRpc2FibGVkOiAhaXNGb3JtVmFsaWQgfHwgaXNTYXZpbmcsIGxvYWRpbmc6IGlzU2F2aW5nLCBcImRhdGEtY3lcIjogXCJzYXZlLXByb2ZpbGUtYnRuXCIsIGNoaWxkcmVuOiBcIkNyZWF0ZSBQcm9maWxlXCIgfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENyZWF0ZVByb2ZpbGVEaWFsb2c7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=