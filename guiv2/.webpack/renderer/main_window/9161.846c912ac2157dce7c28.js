(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9161],{

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

/***/ 75580:
/*!***************************************************************!*\
  !*** ./src/renderer/components/dialogs/EditProfileDialog.tsx ***!
  \***************************************************************/
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
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../atoms/Input */ 34766);
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atoms/Select */ 1156);

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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog, { open: isOpen, onClose: onClose, className: "relative z-50", "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Panel, { className: "mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.User, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Title, { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: isEditing ? 'Edit Profile' : 'New Profile' })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "data-cy": "close-profile-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-6 space-y-4 max-h-[60vh] overflow-y-auto", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__.Input, { label: "Profile Name", value: formData.name, onChange: (e) => updateFormData({ name: e.target.value }), error: errors.name, required: true, placeholder: "My Azure AD Connection", "data-cy": "profile-name-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_6__.Select, { label: "Connection Type", value: formData.type, onChange: (value) => updateFormData({ type: value }), options: connectionTypes, required: true, "data-cy": "profile-type-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 mb-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Key, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Credentials" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "space-y-4", children: [formData.type === 'azuread' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__.Input, { label: "Tenant ID", value: formData.credentials.tenantId || '', onChange: (e) => updateCredentials({ tenantId: e.target.value }), error: errors.tenantId, required: true, placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", "data-cy": "profile-tenant-input" })), formData.type === 'ad' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__.Input, { label: "Domain", value: formData.credentials.domain || '', onChange: (e) => updateCredentials({ domain: e.target.value }), error: errors.domain, required: true, placeholder: "contoso.local", "data-cy": "profile-domain-input" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__.Input, { label: "Username", value: formData.credentials.username, onChange: (e) => updateCredentials({ username: e.target.value }), error: errors.username, required: true, placeholder: "admin@contoso.com", "data-cy": "profile-username-input" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_5__.Input, { label: "Password", type: "password", value: formData.credentials.password, onChange: (e) => updateCredentials({ password: e.target.value }), error: errors.password, required: true, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", "data-cy": "profile-password-input" })] })] }), testResult && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `flex items-center gap-2 p-3 rounded-lg ${testResult === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`, children: testResult === 'success' ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.CheckCircle, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium", children: "Connection successful!" })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium", children: "Connection failed. Please check your credentials." })] })) })), errors.submit && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-5 h-5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: errors.submit })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { children: onTestConnection && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__.Button, { variant: "ghost", onClick: handleTestConnection, loading: isTesting, disabled: isSaving, "data-cy": "test-connection-btn", children: "Test Connection" })) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__.Button, { variant: "secondary", onClick: onClose, disabled: isSaving || isTesting, "data-cy": "cancel-profile-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__.Button, { variant: "primary", onClick: handleSave, loading: isSaving, disabled: isTesting, "data-cy": "save-profile-btn", children: isEditing ? 'Save Changes' : 'Create Profile' })] })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EditProfileDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c0RBQUksV0FBVywrQ0FBK0MsSUFBSSxLQUFLLEdBQUcsdURBQUssVUFBVSw2R0FBNkcsc0RBQUksVUFBVSwrQkFBK0Isc0RBQUksQ0FBQyxpREFBTSxJQUFJLHdKQUF3SixJQUFJLEdBQUcsdURBQUssVUFBVSxvQ0FBb0Msc0RBQUksQ0FBQyxpREFBTSxJQUFJLDhIQUE4SCxHQUFHLHNEQUFJLENBQUMsaURBQU0sSUFBSSx5S0FBeUssSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzMvQztBQUNBLGlFQUFlLGlCQUFpQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0VkaXRQcm9maWxlRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzLCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogRWRpdCBQcm9maWxlIERpYWxvZyBDb21wb25lbnRcbiAqIEZvcm0gZm9yIGNyZWF0aW5nIG9yIGVkaXRpbmcgY29ubmVjdGlvbiBwcm9maWxlc1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJ0BoZWFkbGVzc3VpL3JlYWN0JztcbmltcG9ydCB7IFgsIFVzZXIsIEtleSwgQ2hlY2tDaXJjbGUsIEFsZXJ0Q2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uL2F0b21zL0lucHV0JztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL2F0b21zL1NlbGVjdCc7XG4vKipcbiAqIEVkaXQgUHJvZmlsZSBEaWFsb2cgQ29tcG9uZW50XG4gKi9cbmNvbnN0IEVkaXRQcm9maWxlRGlhbG9nID0gKHsgaXNPcGVuLCBvbkNsb3NlLCBvblNhdmUsIHByb2ZpbGUgPSBudWxsLCBvblRlc3RDb25uZWN0aW9uLCAnZGF0YS1jeSc6IGRhdGFDeSA9ICdlZGl0LXByb2ZpbGUtZGlhbG9nJywgfSkgPT4ge1xuICAgIGNvbnN0IGlzRWRpdGluZyA9ICEhcHJvZmlsZT8uaWQ7XG4gICAgY29uc3QgW2Zvcm1EYXRhLCBzZXRGb3JtRGF0YV0gPSB1c2VTdGF0ZSh7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICB0eXBlOiAnYXp1cmVhZCcsXG4gICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgICAgICB0ZW5hbnRJZDogJycsXG4gICAgICAgICAgICBkb21haW46ICcnLFxuICAgICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IFtpc1NhdmluZywgc2V0SXNTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpc1Rlc3RpbmcsIHNldElzVGVzdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3Rlc3RSZXN1bHQsIHNldFRlc3RSZXN1bHRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2Vycm9ycywgc2V0RXJyb3JzXSA9IHVzZVN0YXRlKHt9KTtcbiAgICAvLyBMb2FkIHByb2ZpbGUgZGF0YSB3aGVuIGRpYWxvZyBvcGVuc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChpc09wZW4gJiYgcHJvZmlsZSkge1xuICAgICAgICAgICAgc2V0Rm9ybURhdGEocHJvZmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNPcGVuKSB7XG4gICAgICAgICAgICBzZXRGb3JtRGF0YSh7XG4gICAgICAgICAgICAgICAgbmFtZTogJycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2F6dXJlYWQnLFxuICAgICAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICB0ZW5hbnRJZDogJycsXG4gICAgICAgICAgICAgICAgICAgIGRvbWFpbjogJycsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHNldFRlc3RSZXN1bHQobnVsbCk7XG4gICAgICAgIHNldEVycm9ycyh7fSk7XG4gICAgfSwgW2lzT3BlbiwgcHJvZmlsZV0pO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25UeXBlcyA9IFtcbiAgICAgICAgeyB2YWx1ZTogJ2F6dXJlYWQnLCBsYWJlbDogJ0F6dXJlIEFjdGl2ZSBEaXJlY3RvcnknIH0sXG4gICAgICAgIHsgdmFsdWU6ICdhZCcsIGxhYmVsOiAnQWN0aXZlIERpcmVjdG9yeScgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2V4Y2hhbmdlJywgbGFiZWw6ICdFeGNoYW5nZSBPbmxpbmUnIH0sXG4gICAgICAgIHsgdmFsdWU6ICdzaGFyZXBvaW50JywgbGFiZWw6ICdTaGFyZVBvaW50IE9ubGluZScgfSxcbiAgICAgICAgeyB2YWx1ZTogJ2N1c3RvbScsIGxhYmVsOiAnQ3VzdG9tIENvbm5lY3Rpb24nIH0sXG4gICAgXTtcbiAgICBjb25zdCB2YWxpZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RXJyb3JzID0ge307XG4gICAgICAgIGlmICghZm9ybURhdGEubmFtZS50cmltKCkpIHtcbiAgICAgICAgICAgIG5ld0Vycm9ycy5uYW1lID0gJ1Byb2ZpbGUgbmFtZSBpcyByZXF1aXJlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3JtRGF0YS5jcmVkZW50aWFscy51c2VybmFtZS50cmltKCkpIHtcbiAgICAgICAgICAgIG5ld0Vycm9ycy51c2VybmFtZSA9ICdVc2VybmFtZSBpcyByZXF1aXJlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3JtRGF0YS5jcmVkZW50aWFscy5wYXNzd29yZC50cmltKCkpIHtcbiAgICAgICAgICAgIG5ld0Vycm9ycy5wYXNzd29yZCA9ICdQYXNzd29yZCBpcyByZXF1aXJlZCc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1EYXRhLnR5cGUgPT09ICdhenVyZWFkJyAmJiAhZm9ybURhdGEuY3JlZGVudGlhbHMudGVuYW50SWQ/LnRyaW0oKSkge1xuICAgICAgICAgICAgbmV3RXJyb3JzLnRlbmFudElkID0gJ1RlbmFudCBJRCBpcyByZXF1aXJlZCBmb3IgQXp1cmUgQUQnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmb3JtRGF0YS50eXBlID09PSAnYWQnICYmICFmb3JtRGF0YS5jcmVkZW50aWFscy5kb21haW4/LnRyaW0oKSkge1xuICAgICAgICAgICAgbmV3RXJyb3JzLmRvbWFpbiA9ICdEb21haW4gaXMgcmVxdWlyZWQgZm9yIEFjdGl2ZSBEaXJlY3RvcnknO1xuICAgICAgICB9XG4gICAgICAgIHNldEVycm9ycyhuZXdFcnJvcnMpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobmV3RXJyb3JzKS5sZW5ndGggPT09IDA7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVTYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXZhbGlkYXRlKCkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzU2F2aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgb25TYXZlKGZvcm1EYXRhKTtcbiAgICAgICAgICAgIG9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHNldEVycm9ycyh7IHN1Ym1pdDogJ0ZhaWxlZCB0byBzYXZlIHByb2ZpbGUuIFBsZWFzZSB0cnkgYWdhaW4uJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzU2F2aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlVGVzdENvbm5lY3Rpb24gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdmFsaWRhdGUoKSB8fCAhb25UZXN0Q29ubmVjdGlvbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNUZXN0aW5nKHRydWUpO1xuICAgICAgICBzZXRUZXN0UmVzdWx0KG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IG9uVGVzdENvbm5lY3Rpb24oZm9ybURhdGEpO1xuICAgICAgICAgICAgc2V0VGVzdFJlc3VsdChzdWNjZXNzID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBzZXRUZXN0UmVzdWx0KCdlcnJvcicpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNUZXN0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgdXBkYXRlRm9ybURhdGEgPSAodXBkYXRlcykgPT4ge1xuICAgICAgICBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCAuLi51cGRhdGVzIH0pO1xuICAgIH07XG4gICAgY29uc3QgdXBkYXRlQ3JlZGVudGlhbHMgPSAodXBkYXRlcykgPT4ge1xuICAgICAgICBzZXRGb3JtRGF0YSh7XG4gICAgICAgICAgICAuLi5mb3JtRGF0YSxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiB7IC4uLmZvcm1EYXRhLmNyZWRlbnRpYWxzLCAuLi51cGRhdGVzIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhEaWFsb2csIHsgb3BlbjogaXNPcGVuLCBvbkNsb3NlOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicmVsYXRpdmUgei01MFwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay8zMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhEaWFsb2cuUGFuZWwsIHsgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWF4LXctbGcgdy1mdWxsIHJvdW5kZWQtbGcgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBzaGFkb3ctMnhsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtNiBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goVXNlciwgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMFwiIH0pLCBfanN4KERpYWxvZy5UaXRsZSwgeyBjbGFzc05hbWU6IFwidGV4dC14bCBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBpc0VkaXRpbmcgPyAnRWRpdCBQcm9maWxlJyA6ICdOZXcgUHJvZmlsZScgfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbG9zZSwgY2xhc3NOYW1lOiBcInAtMiBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtcHJvZmlsZS1idG5cIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC02IHNwYWNlLXktNCBtYXgtaC1bNjB2aF0gb3ZlcmZsb3cteS1hdXRvXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJQcm9maWxlIE5hbWVcIiwgdmFsdWU6IGZvcm1EYXRhLm5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRm9ybURhdGEoeyBuYW1lOiBlLnRhcmdldC52YWx1ZSB9KSwgZXJyb3I6IGVycm9ycy5uYW1lLCByZXF1aXJlZDogdHJ1ZSwgcGxhY2Vob2xkZXI6IFwiTXkgQXp1cmUgQUQgQ29ubmVjdGlvblwiLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLW5hbWUtaW5wdXRcIiB9KSwgX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiQ29ubmVjdGlvbiBUeXBlXCIsIHZhbHVlOiBmb3JtRGF0YS50eXBlLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGb3JtRGF0YSh7IHR5cGU6IHZhbHVlIH0pLCBvcHRpb25zOiBjb25uZWN0aW9uVHlwZXMsIHJlcXVpcmVkOiB0cnVlLCBcImRhdGEtY3lcIjogXCJwcm9maWxlLXR5cGUtc2VsZWN0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB0LTQgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgbWItNFwiLCBjaGlsZHJlbjogW19qc3goS2V5LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJDcmVkZW50aWFsc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiBbZm9ybURhdGEudHlwZSA9PT0gJ2F6dXJlYWQnICYmIChfanN4KElucHV0LCB7IGxhYmVsOiBcIlRlbmFudCBJRFwiLCB2YWx1ZTogZm9ybURhdGEuY3JlZGVudGlhbHMudGVuYW50SWQgfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlQ3JlZGVudGlhbHMoeyB0ZW5hbnRJZDogZS50YXJnZXQudmFsdWUgfSksIGVycm9yOiBlcnJvcnMudGVuYW50SWQsIHJlcXVpcmVkOiB0cnVlLCBwbGFjZWhvbGRlcjogXCJ4eHh4eHh4eC14eHh4LXh4eHgteHh4eC14eHh4eHh4eHh4eHhcIiwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS10ZW5hbnQtaW5wdXRcIiB9KSksIGZvcm1EYXRhLnR5cGUgPT09ICdhZCcgJiYgKF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiRG9tYWluXCIsIHZhbHVlOiBmb3JtRGF0YS5jcmVkZW50aWFscy5kb21haW4gfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlQ3JlZGVudGlhbHMoeyBkb21haW46IGUudGFyZ2V0LnZhbHVlIH0pLCBlcnJvcjogZXJyb3JzLmRvbWFpbiwgcmVxdWlyZWQ6IHRydWUsIHBsYWNlaG9sZGVyOiBcImNvbnRvc28ubG9jYWxcIiwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS1kb21haW4taW5wdXRcIiB9KSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiVXNlcm5hbWVcIiwgdmFsdWU6IGZvcm1EYXRhLmNyZWRlbnRpYWxzLnVzZXJuYW1lLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUNyZWRlbnRpYWxzKHsgdXNlcm5hbWU6IGUudGFyZ2V0LnZhbHVlIH0pLCBlcnJvcjogZXJyb3JzLnVzZXJuYW1lLCByZXF1aXJlZDogdHJ1ZSwgcGxhY2Vob2xkZXI6IFwiYWRtaW5AY29udG9zby5jb21cIiwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS11c2VybmFtZS1pbnB1dFwiIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIlBhc3N3b3JkXCIsIHR5cGU6IFwicGFzc3dvcmRcIiwgdmFsdWU6IGZvcm1EYXRhLmNyZWRlbnRpYWxzLnBhc3N3b3JkLCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUNyZWRlbnRpYWxzKHsgcGFzc3dvcmQ6IGUudGFyZ2V0LnZhbHVlIH0pLCBlcnJvcjogZXJyb3JzLnBhc3N3b3JkLCByZXF1aXJlZDogdHJ1ZSwgcGxhY2Vob2xkZXI6IFwiXFx1MjAyMlxcdTIwMjJcXHUyMDIyXFx1MjAyMlxcdTIwMjJcXHUyMDIyXFx1MjAyMlxcdTIwMjJcIiwgXCJkYXRhLWN5XCI6IFwicHJvZmlsZS1wYXNzd29yZC1pbnB1dFwiIH0pXSB9KV0gfSksIHRlc3RSZXN1bHQgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBwLTMgcm91bmRlZC1sZyAke3Rlc3RSZXN1bHQgPT09ICdzdWNjZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWdyZWVuLTUwIGRhcms6YmctZ3JlZW4tOTAwLzIwIHRleHQtZ3JlZW4tODAwIGRhcms6dGV4dC1ncmVlbi0yMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCB0ZXh0LXJlZC04MDAgZGFyazp0ZXh0LXJlZC0yMDAnfWAsIGNoaWxkcmVuOiB0ZXN0UmVzdWx0ID09PSAnc3VjY2VzcycgPyAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNvbm5lY3Rpb24gc3VjY2Vzc2Z1bCFcIiB9KV0gfSkpIDogKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJDb25uZWN0aW9uIGZhaWxlZC4gUGxlYXNlIGNoZWNrIHlvdXIgY3JlZGVudGlhbHMuXCIgfSldIH0pKSB9KSksIGVycm9ycy5zdWJtaXQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHAtMyBiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBlcnJvcnMuc3VibWl0IH0pXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjaGlsZHJlbjogb25UZXN0Q29ubmVjdGlvbiAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBoYW5kbGVUZXN0Q29ubmVjdGlvbiwgbG9hZGluZzogaXNUZXN0aW5nLCBkaXNhYmxlZDogaXNTYXZpbmcsIFwiZGF0YS1jeVwiOiBcInRlc3QtY29ubmVjdGlvbi1idG5cIiwgY2hpbGRyZW46IFwiVGVzdCBDb25uZWN0aW9uXCIgfSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogb25DbG9zZSwgZGlzYWJsZWQ6IGlzU2F2aW5nIHx8IGlzVGVzdGluZywgXCJkYXRhLWN5XCI6IFwiY2FuY2VsLXByb2ZpbGUtYnRuXCIsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlU2F2ZSwgbG9hZGluZzogaXNTYXZpbmcsIGRpc2FibGVkOiBpc1Rlc3RpbmcsIFwiZGF0YS1jeVwiOiBcInNhdmUtcHJvZmlsZS1idG5cIiwgY2hpbGRyZW46IGlzRWRpdGluZyA/ICdTYXZlIENoYW5nZXMnIDogJ0NyZWF0ZSBQcm9maWxlJyB9KV0gfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEVkaXRQcm9maWxlRGlhbG9nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9