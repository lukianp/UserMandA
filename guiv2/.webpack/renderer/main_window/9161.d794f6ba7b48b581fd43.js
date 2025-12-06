(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9161],{

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

/***/ 75580:
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
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(34766);
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1156);

/**
 * Edit Profile Dialog Component
 * Form for creating or editing connection profiles
 */






/**
 * Edit Profile Dialog Component
 */
const EditProfileDialog = ({ isOpen, onClose, onSave, profile = null, onTestConnection, 'data-cy': dataCy = 'edit-profile-dialog', }) => {
    const isEditing = !!profile?.id;
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        name: '',
        type: 'azuread',
        credentials: {
            username: '',
            password: '',
            tenantId: '',
            domain: '',
        },
    });
    const [isSaving, setIsSaving] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [isTesting, setIsTesting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [testResult, setTestResult] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [errors, setErrors] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({});
    // Load profile data when dialog opens
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        if (isOpen && profile) {
            setFormData(profile);
        }
        else if (isOpen) {
            setFormData({
                name: '',
                type: 'azuread',
                credentials: {
                    username: '',
                    password: '',
                    tenantId: '',
                    domain: '',
                },
            });
        }
        setTestResult(null);
        setErrors({});
    }, [isOpen, profile]);
    const connectionTypes = [
        { value: 'azuread', label: 'Azure Active Directory' },
        { value: 'ad', label: 'Active Directory' },
        { value: 'exchange', label: 'Exchange Online' },
        { value: 'sharepoint', label: 'SharePoint Online' },
        { value: 'custom', label: 'Custom Connection' },
    ];
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Profile name is required';
        }
        if (!formData.credentials.username.trim()) {
            newErrors.username = 'Username is required';
        }
        if (!formData.credentials.password.trim()) {
            newErrors.password = 'Password is required';
        }
        if (formData.type === 'azuread' && !formData.credentials.tenantId?.trim()) {
            newErrors.tenantId = 'Tenant ID is required for Azure AD';
        }
        if (formData.type === 'ad' && !formData.credentials.domain?.trim()) {
            newErrors.domain = 'Domain is required for Active Directory';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSave = async () => {
        if (!validate())
            return;
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        }
        catch (error) {
            setErrors({ submit: 'Failed to save profile. Please try again.' });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleTestConnection = async () => {
        if (!validate() || !onTestConnection)
            return;
        setIsTesting(true);
        setTestResult(null);
        try {
            const success = await onTestConnection(formData);
            setTestResult(success ? 'success' : 'error');
        }
        catch (error) {
            setTestResult('error');
        }
        finally {
            setIsTesting(false);
        }
    };
    const updateFormData = (updates) => {
        setFormData({ ...formData, ...updates });
    };
    const updateCredentials = (updates) => {
        setFormData({
            ...formData,
            credentials: { ...formData.credentials, ...updates },
        });
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: onClose, className: "relative z-50", "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .User */ .KJW, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: isEditing ? 'Edit Profile' : 'New Profile' })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "data-cy": "close-profile-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-6 space-y-4 max-h-[60vh] overflow-y-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__/* .Input */ .p, { label: "Profile Name", value: formData.name, onChange: (e) => updateFormData({ name: e.target.value }), error: errors.name, required: true, placeholder: "My Azure AD Connection", "data-cy": "profile-name-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_6__/* .Select */ .l, { label: "Connection Type", value: formData.type, onChange: (value) => updateFormData({ type: value }), options: connectionTypes, required: true, "data-cy": "profile-type-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 mb-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Key */ .Uzy, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Credentials" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-4", children: [formData.type === 'azuread' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__/* .Input */ .p, { label: "Tenant ID", value: formData.credentials.tenantId || '', onChange: (e) => updateCredentials({ tenantId: e.target.value }), error: errors.tenantId, required: true, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "data-cy": "profile-tenant-input" })), formData.type === 'ad' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__/* .Input */ .p, { label: "Domain", value: formData.credentials.domain || '', onChange: (e) => updateCredentials({ domain: e.target.value }), error: errors.domain, required: true, placeholder: "contoso.local", "data-cy": "profile-domain-input" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__/* .Input */ .p, { label: "Username", value: formData.credentials.username, onChange: (e) => updateCredentials({ username: e.target.value }), error: errors.username, required: true, placeholder: "admin@contoso.com", "data-cy": "profile-username-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__/* .Input */ .p, { label: "Password", type: "password", value: formData.credentials.password, onChange: (e) => updateCredentials({ password: e.target.value }), error: errors.password, required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "data-cy": "profile-password-input" })] })] }), testResult && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `flex items-center gap-2 p-3 rounded-lg ${testResult === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`, children: testResult === 'success' ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .CheckCircle */ .rAV, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium", children: "Connection successful!" })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium", children: "Connection failed. Please check your credentials." })] })) })), errors.submit && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: errors.submit })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { children: onTestConnection && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "ghost", onClick: handleTestConnection, loading: isTesting, disabled: isSaving, "data-cy": "test-connection-btn", children: "Test Connection" })) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: onClose, disabled: isSaving || isTesting, "data-cy": "cancel-profile-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "primary", onClick: handleSave, loading: isSaving, disabled: isTesting, "data-cy": "save-profile-btn", children: isEditing ? 'Save Changes' : 'Create Profile' })] })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EditProfileDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VywrQ0FBK0MsSUFBSSxLQUFLLEdBQUcsdURBQUssVUFBVSw2R0FBNkcsc0RBQUksVUFBVSwrQkFBK0Isc0RBQUksQ0FBQywwREFBTSxJQUFJLHdKQUF3SixJQUFJLEdBQUcsdURBQUssVUFBVSxvQ0FBb0Msc0RBQUksQ0FBQywwREFBTSxJQUFJLDhIQUE4SCxHQUFHLHNEQUFJLENBQUMsMERBQU0sSUFBSSx5S0FBeUssSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzMvQztBQUNBLGlFQUFlLGlCQUFpQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxAaGVhZGxlc3N1aVxccmVhY3RcXGRpc3RcXGhvb2tzfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2RpYWxvZ3MvRWRpdFByb2ZpbGVEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBFZGl0IFByb2ZpbGUgRGlhbG9nIENvbXBvbmVudFxuICogRm9ybSBmb3IgY3JlYXRpbmcgb3IgZWRpdGluZyBjb25uZWN0aW9uIHByb2ZpbGVzXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgWCwgVXNlciwgS2V5LCBDaGVja0NpcmNsZSwgQWxlcnRDaXJjbGUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vYXRvbXMvU2VsZWN0Jztcbi8qKlxuICogRWRpdCBQcm9maWxlIERpYWxvZyBDb21wb25lbnRcbiAqL1xuY29uc3QgRWRpdFByb2ZpbGVEaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIG9uU2F2ZSwgcHJvZmlsZSA9IG51bGwsIG9uVGVzdENvbm5lY3Rpb24sICdkYXRhLWN5JzogZGF0YUN5ID0gJ2VkaXQtcHJvZmlsZS1kaWFsb2cnLCB9KSA9PiB7XG4gICAgY29uc3QgaXNFZGl0aW5nID0gISFwcm9maWxlPy5pZDtcbiAgICBjb25zdCBbZm9ybURhdGEsIHNldEZvcm1EYXRhXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIHR5cGU6ICdhenVyZWFkJyxcbiAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICAgICAgICAgIHRlbmFudElkOiAnJyxcbiAgICAgICAgICAgIGRvbWFpbjogJycsXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgW2lzU2F2aW5nLCBzZXRJc1NhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2lzVGVzdGluZywgc2V0SXNUZXN0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbdGVzdFJlc3VsdCwgc2V0VGVzdFJlc3VsdF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZXJyb3JzLCBzZXRFcnJvcnNdID0gdXNlU3RhdGUoe30pO1xuICAgIC8vIExvYWQgcHJvZmlsZSBkYXRhIHdoZW4gZGlhbG9nIG9wZW5zXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGlzT3BlbiAmJiBwcm9maWxlKSB7XG4gICAgICAgICAgICBzZXRGb3JtRGF0YShwcm9maWxlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc09wZW4pIHtcbiAgICAgICAgICAgIHNldEZvcm1EYXRhKHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYXp1cmVhZCcsXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgICAgICAgICAgICAgIHRlbmFudElkOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluOiAnJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGVzdFJlc3VsdChudWxsKTtcbiAgICAgICAgc2V0RXJyb3JzKHt9KTtcbiAgICB9LCBbaXNPcGVuLCBwcm9maWxlXSk7XG4gICAgY29uc3QgY29ubmVjdGlvblR5cGVzID0gW1xuICAgICAgICB7IHZhbHVlOiAnYXp1cmVhZCcsIGxhYmVsOiAnQXp1cmUgQWN0aXZlIERpcmVjdG9yeScgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2FkJywgbGFiZWw6ICdBY3RpdmUgRGlyZWN0b3J5JyB9LFxuICAgICAgICB7IHZhbHVlOiAnZXhjaGFuZ2UnLCBsYWJlbDogJ0V4Y2hhbmdlIE9ubGluZScgfSxcbiAgICAgICAgeyB2YWx1ZTogJ3NoYXJlcG9pbnQnLCBsYWJlbDogJ1NoYXJlUG9pbnQgT25saW5lJyB9LFxuICAgICAgICB7IHZhbHVlOiAnY3VzdG9tJywgbGFiZWw6ICdDdXN0b20gQ29ubmVjdGlvbicgfSxcbiAgICBdO1xuICAgIGNvbnN0IHZhbGlkYXRlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdFcnJvcnMgPSB7fTtcbiAgICAgICAgaWYgKCFmb3JtRGF0YS5uYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgbmV3RXJyb3JzLm5hbWUgPSAnUHJvZmlsZSBuYW1lIGlzIHJlcXVpcmVkJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvcm1EYXRhLmNyZWRlbnRpYWxzLnVzZXJuYW1lLnRyaW0oKSkge1xuICAgICAgICAgICAgbmV3RXJyb3JzLnVzZXJuYW1lID0gJ1VzZXJuYW1lIGlzIHJlcXVpcmVkJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvcm1EYXRhLmNyZWRlbnRpYWxzLnBhc3N3b3JkLnRyaW0oKSkge1xuICAgICAgICAgICAgbmV3RXJyb3JzLnBhc3N3b3JkID0gJ1Bhc3N3b3JkIGlzIHJlcXVpcmVkJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZm9ybURhdGEudHlwZSA9PT0gJ2F6dXJlYWQnICYmICFmb3JtRGF0YS5jcmVkZW50aWFscy50ZW5hbnRJZD8udHJpbSgpKSB7XG4gICAgICAgICAgICBuZXdFcnJvcnMudGVuYW50SWQgPSAnVGVuYW50IElEIGlzIHJlcXVpcmVkIGZvciBBenVyZSBBRCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1EYXRhLnR5cGUgPT09ICdhZCcgJiYgIWZvcm1EYXRhLmNyZWRlbnRpYWxzLmRvbWFpbj8udHJpbSgpKSB7XG4gICAgICAgICAgICBuZXdFcnJvcnMuZG9tYWluID0gJ0RvbWFpbiBpcyByZXF1aXJlZCBmb3IgQWN0aXZlIERpcmVjdG9yeSc7XG4gICAgICAgIH1cbiAgICAgICAgc2V0RXJyb3JzKG5ld0Vycm9ycyk7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhuZXdFcnJvcnMpLmxlbmd0aCA9PT0gMDtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdmFsaWRhdGUoKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNTYXZpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBvblNhdmUoZm9ybURhdGEpO1xuICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgc2V0RXJyb3JzKHsgc3VibWl0OiAnRmFpbGVkIHRvIHNhdmUgcHJvZmlsZS4gUGxlYXNlIHRyeSBhZ2Fpbi4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNTYXZpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVUZXN0Q29ubmVjdGlvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0ZSgpIHx8ICFvblRlc3RDb25uZWN0aW9uKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc1Rlc3RpbmcodHJ1ZSk7XG4gICAgICAgIHNldFRlc3RSZXN1bHQobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgb25UZXN0Q29ubmVjdGlvbihmb3JtRGF0YSk7XG4gICAgICAgICAgICBzZXRUZXN0UmVzdWx0KHN1Y2Nlc3MgPyAnc3VjY2VzcycgOiAnZXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldFRlc3RSZXN1bHQoJ2Vycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc1Rlc3RpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB1cGRhdGVGb3JtRGF0YSA9ICh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldEZvcm1EYXRhKHsgLi4uZm9ybURhdGEsIC4uLnVwZGF0ZXMgfSk7XG4gICAgfTtcbiAgICBjb25zdCB1cGRhdGVDcmVkZW50aWFscyA9ICh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldEZvcm1EYXRhKHtcbiAgICAgICAgICAgIC4uLmZvcm1EYXRhLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6IHsgLi4uZm9ybURhdGEuY3JlZGVudGlhbHMsIC4uLnVwZGF0ZXMgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3hzKERpYWxvZywgeyBvcGVuOiBpc09wZW4sIG9uQ2xvc2U6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy1sZyB3LWZ1bGwgcm91bmRlZC1sZyBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHNoYWRvdy0yeGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChVc2VyLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIgfSksIF9qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IGlzRWRpdGluZyA/ICdFZGl0IFByb2ZpbGUnIDogJ05ldyBQcm9maWxlJyB9KV0gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicC0yIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWNvbG9yc1wiLCBcImRhdGEtY3lcIjogXCJjbG9zZS1wcm9maWxlLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgc3BhY2UteS00IG1heC1oLVs2MHZoXSBvdmVyZmxvdy15LWF1dG9cIiwgY2hpbGRyZW46IFtfanN4KElucHV0LCB7IGxhYmVsOiBcIlByb2ZpbGUgTmFtZVwiLCB2YWx1ZTogZm9ybURhdGEubmFtZSwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGb3JtRGF0YSh7IG5hbWU6IGUudGFyZ2V0LnZhbHVlIH0pLCBlcnJvcjogZXJyb3JzLm5hbWUsIHJlcXVpcmVkOiB0cnVlLCBwbGFjZWhvbGRlcjogXCJNeSBBenVyZSBBRCBDb25uZWN0aW9uXCIsIFwiZGF0YS1jeVwiOiBcInByb2ZpbGUtbmFtZS1pbnB1dFwiIH0pLCBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJDb25uZWN0aW9uIFR5cGVcIiwgdmFsdWU6IGZvcm1EYXRhLnR5cGUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZvcm1EYXRhKHsgdHlwZTogdmFsdWUgfSksIG9wdGlvbnM6IGNvbm5lY3Rpb25UeXBlcywgcmVxdWlyZWQ6IHRydWUsIFwiZGF0YS1jeVwiOiBcInByb2ZpbGUtdHlwZS1zZWxlY3RcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHQtNCBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtYi00XCIsIGNoaWxkcmVuOiBbX2pzeChLZXksIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBcIkNyZWRlbnRpYWxzXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IFtmb3JtRGF0YS50eXBlID09PSAnYXp1cmVhZCcgJiYgKF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiVGVuYW50IElEXCIsIHZhbHVlOiBmb3JtRGF0YS5jcmVkZW50aWFscy50ZW5hbnRJZCB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVDcmVkZW50aWFscyh7IHRlbmFudElkOiBlLnRhcmdldC52YWx1ZSB9KSwgZXJyb3I6IGVycm9ycy50ZW5hbnRJZCwgcmVxdWlyZWQ6IHRydWUsIHBsYWNlaG9sZGVyOiBcInh4eHh4eHh4LXh4eHgteHh4eC14eHh4LXh4eHh4eHh4eHh4eFwiLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLXRlbmFudC1pbnB1dFwiIH0pKSwgZm9ybURhdGEudHlwZSA9PT0gJ2FkJyAmJiAoX2pzeChJbnB1dCwgeyBsYWJlbDogXCJEb21haW5cIiwgdmFsdWU6IGZvcm1EYXRhLmNyZWRlbnRpYWxzLmRvbWFpbiB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVDcmVkZW50aWFscyh7IGRvbWFpbjogZS50YXJnZXQudmFsdWUgfSksIGVycm9yOiBlcnJvcnMuZG9tYWluLCByZXF1aXJlZDogdHJ1ZSwgcGxhY2Vob2xkZXI6IFwiY29udG9zby5sb2NhbFwiLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLWRvbWFpbi1pbnB1dFwiIH0pKSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJVc2VybmFtZVwiLCB2YWx1ZTogZm9ybURhdGEuY3JlZGVudGlhbHMudXNlcm5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlQ3JlZGVudGlhbHMoeyB1c2VybmFtZTogZS50YXJnZXQudmFsdWUgfSksIGVycm9yOiBlcnJvcnMudXNlcm5hbWUsIHJlcXVpcmVkOiB0cnVlLCBwbGFjZWhvbGRlcjogXCJhZG1pbkBjb250b3NvLmNvbVwiLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLXVzZXJuYW1lLWlucHV0XCIgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiUGFzc3dvcmRcIiwgdHlwZTogXCJwYXNzd29yZFwiLCB2YWx1ZTogZm9ybURhdGEuY3JlZGVudGlhbHMucGFzc3dvcmQsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlQ3JlZGVudGlhbHMoeyBwYXNzd29yZDogZS50YXJnZXQudmFsdWUgfSksIGVycm9yOiBlcnJvcnMucGFzc3dvcmQsIHJlcXVpcmVkOiB0cnVlLCBwbGFjZWhvbGRlcjogXCJcXHUyMDIyXFx1MjAyMlxcdTIwMjJcXHUyMDIyXFx1MjAyMlxcdTIwMjJcXHUyMDIyXFx1MjAyMlwiLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLXBhc3N3b3JkLWlucHV0XCIgfSldIH0pXSB9KSwgdGVzdFJlc3VsdCAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHAtMyByb3VuZGVkLWxnICR7dGVzdFJlc3VsdCA9PT0gJ3N1Y2Nlc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgdGV4dC1ncmVlbi04MDAgZGFyazp0ZXh0LWdyZWVuLTIwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMCd9YCwgY2hpbGRyZW46IHRlc3RSZXN1bHQgPT09ICdzdWNjZXNzJyA/IChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiQ29ubmVjdGlvbiBzdWNjZXNzZnVsIVwiIH0pXSB9KSkgOiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNvbm5lY3Rpb24gZmFpbGVkLiBQbGVhc2UgY2hlY2sgeW91ciBjcmVkZW50aWFscy5cIiB9KV0gfSkpIH0pKSwgZXJyb3JzLnN1Ym1pdCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcC0zIGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGVycm9ycy5zdWJtaXQgfSldIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNoaWxkcmVuOiBvblRlc3RDb25uZWN0aW9uICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGhhbmRsZVRlc3RDb25uZWN0aW9uLCBsb2FkaW5nOiBpc1Rlc3RpbmcsIGRpc2FibGVkOiBpc1NhdmluZywgXCJkYXRhLWN5XCI6IFwidGVzdC1jb25uZWN0aW9uLWJ0blwiLCBjaGlsZHJlbjogXCJUZXN0IENvbm5lY3Rpb25cIiB9KSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBvbkNsb3NlLCBkaXNhYmxlZDogaXNTYXZpbmcgfHwgaXNUZXN0aW5nLCBcImRhdGEtY3lcIjogXCJjYW5jZWwtcHJvZmlsZS1idG5cIiwgY2hpbGRyZW46IFwiQ2FuY2VsXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiBoYW5kbGVTYXZlLCBsb2FkaW5nOiBpc1NhdmluZywgZGlzYWJsZWQ6IGlzVGVzdGluZywgXCJkYXRhLWN5XCI6IFwic2F2ZS1wcm9maWxlLWJ0blwiLCBjaGlsZHJlbjogaXNFZGl0aW5nID8gJ1NhdmUgQ2hhbmdlcycgOiAnQ3JlYXRlIFByb2ZpbGUnIH0pXSB9KV0gfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRWRpdFByb2ZpbGVEaWFsb2c7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=