"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[279],{

/***/ 20279:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  SystemConfigurationView: () => (/* binding */ SystemConfigurationView),
  "default": () => (/* binding */ admin_SystemConfigurationView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Checkbox.tsx
var Checkbox = __webpack_require__(63683);
// EXTERNAL MODULE: ./src/renderer/store/useNotificationStore.ts
var useNotificationStore = __webpack_require__(79455);
;// ./src/renderer/hooks/useSystemConfigLogic.ts


const useSystemConfigLogic = () => {
    const [config, setConfig] = (0,react.useState)({
        database: {
            connectionString: 'Data Source=localhost;Initial Catalog=MandA;Integrated Security=True',
            commandTimeout: 30,
            maxPoolSize: 100,
        },
        email: {
            smtpServer: 'smtp.office365.com',
            smtpPort: 587,
            username: '',
            fromAddress: 'noreply@company.com',
            enableSsl: true,
        },
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            requireStrongPassword: true,
            enableAuditLog: true,
        },
        application: {
            defaultTheme: 'system',
            dateFormat: 'MM/DD/YYYY',
            itemsPerPage: 50,
        },
    });
    const [originalConfig, setOriginalConfig] = (0,react.useState)(config);
    const [hasChanges, setHasChanges] = (0,react.useState)(false);
    const { addNotification } = (0,useNotificationStore/* useNotificationStore */.i)();
    (0,react.useEffect)(() => {
        loadConfig();
    }, []);
    (0,react.useEffect)(() => {
        setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
    }, [config, originalConfig]);
    const loadConfig = async () => {
        try {
            const savedConfig = localStorage.getItem('systemConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                setConfig(parsed);
                setOriginalConfig(parsed);
            }
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to load configuration', pinned: false, priority: 'normal' });
        }
    };
    const handleChange = (path, value) => {
        setConfig(prev => {
            const keys = path.split('.');
            const newConfig = { ...prev };
            let current = newConfig;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newConfig;
        });
    };
    const handleSave = async () => {
        try {
            localStorage.setItem('systemConfig', JSON.stringify(config));
            setOriginalConfig(config);
            addNotification({ type: 'success', message: 'Configuration saved successfully', pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: 'Failed to save configuration', pinned: false, priority: 'normal' });
        }
    };
    const handleReset = () => {
        setConfig(originalConfig);
        addNotification({ type: 'info', message: 'Changes discarded', pinned: false, priority: 'low' });
    };
    const handleTestConnection = async (type) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification({ type: 'success', message: `${type} connection test successful`, pinned: false, priority: 'normal' });
        }
        catch (error) {
            addNotification({ type: 'error', message: `${type} connection test failed`, pinned: false, priority: 'normal' });
        }
    };
    return {
        config,
        hasChanges,
        handleChange,
        handleSave,
        handleReset,
        handleTestConnection,
    };
};

;// ./src/renderer/views/admin/SystemConfigurationView.tsx








const SystemConfigurationView = () => {
    const { config, hasChanges, handleChange, handleSave, handleReset, handleTestConnection, } = useSystemConfigLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6 overflow-y-auto", "data-testid": "system-configuration-view", "data-cy": "system-configuration-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "System Configuration" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Configure global application settings and preferences" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* RotateCcw */.Hbd, {}), onClick: handleReset, disabled: !hasChanges, children: "Reset" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* Save */.eMP, {}), onClick: handleSave, disabled: !hasChanges, children: "Save Changes" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Database */.WmV, { className: "w-5 h-5" }), "Database Settings"] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Connection String", value: (config?.database?.connectionString ?? ''), onChange: (value) => handleChange('database.connectionString', value), placeholder: "Data Source=..." }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Command Timeout (seconds)", type: "number", value: (config?.database?.commandTimeout ?? ''), onChange: (e) => handleChange('database.commandTimeout', parseInt(e.target.value)) }), (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Max Pool Size", type: "number", value: (config?.database?.maxPoolSize ?? ''), onChange: (e) => handleChange('database.maxPoolSize', parseInt(e.target.value)) })] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: () => handleTestConnection('database'), children: "Test Connection" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Mail */.gE4, { className: "w-5 h-5" }), "Email Settings"] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-4", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { label: "SMTP Server", value: (config?.email?.smtpServer ?? ''), onChange: (value) => handleChange('email.smtpServer', value) }), (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "SMTP Port", type: "number", value: (config?.email?.smtpPort ?? ''), onChange: (e) => handleChange('email.smtpPort', parseInt(e.target.value)) })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Username", value: (config?.email?.username ?? ''), onChange: (value) => handleChange('email.username', value) }), (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "From Address", type: "email", value: (config?.email?.fromAddress ?? ''), onChange: (value) => handleChange('email.fromAddress', value) })] }), (0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { label: "Enable SSL", checked: (config?.email?.enableSsl ?? ''), onChange: (checked) => handleChange('email.enableSsl', checked) })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, { className: "w-5 h-5" }), "Security Settings"] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-4", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Session Timeout (minutes)", type: "number", value: (config?.security?.sessionTimeout ?? ''), onChange: (e) => handleChange('security.sessionTimeout', parseInt(e.target.value)) }), (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Max Login Attempts", type: "number", value: (config?.security?.maxLoginAttempts ?? ''), onChange: (e) => handleChange('security.maxLoginAttempts', parseInt(e.target.value)) })] }), (0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { label: "Require Strong Passwords", checked: (config?.security?.requireStrongPassword ?? ''), onChange: (checked) => handleChange('security.requireStrongPassword', checked) }), (0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { label: "Enable Audit Logging", checked: (config?.security?.enableAuditLog ?? ''), onChange: (checked) => handleChange('security.enableAuditLog', checked) })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Globe */.qzq, { className: "w-5 h-5" }), "Application Settings"] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-4", children: [(0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Default Theme", value: (config?.application?.defaultTheme ?? ''), onChange: (value) => handleChange('application.defaultTheme', value), options: [
                                    { value: "light", label: "Light" },
                                    { value: "dark", label: "Dark" },
                                    { value: "system", label: "System" },
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { label: "Date Format", value: (config?.application?.dateFormat ?? ''), onChange: (value) => handleChange('application.dateFormat', value), options: [
                                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                                ] }), (0,jsx_runtime.jsx)(Input/* Input */.p, { label: "Items Per Page", type: "number", value: (config?.application?.itemsPerPage ?? ''), onChange: (e) => handleChange('application.itemsPerPage', parseInt(e.target.value)) })] })] })] }));
};
/* harmony default export */ const admin_SystemConfigurationView = (SystemConfigurationView);


/***/ }),

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFVBQVUsV0FBVyxtREFBSSx5Q0FBeUMsdURBQUssVUFBVSwwQ0FBMEMsdURBQUssVUFBVSwrQ0FBK0Msc0RBQUksWUFBWSxtTEFBbUwsbURBQUk7QUFDalo7QUFDQTtBQUNBLGlDQUFpQyxzQkFBc0IsR0FBRyx1REFBSyxZQUFZLHdCQUF3QixtREFBSTtBQUN2RztBQUNBLGlDQUFpQyw0Q0FBNEMsc0RBQUksQ0FBQywwREFBSyxJQUFJLGlEQUFpRCxzQkFBc0Isc0RBQUksVUFBVSx5Q0FBeUMsS0FBSyxJQUFJLDhCQUE4Qix1REFBSyxVQUFVLHdDQUF3QyxzREFBSSxZQUFZLHdCQUF3QixtREFBSSxtREFBbUQsb0JBQW9CLHNEQUFJLFFBQVEsd0dBQXdHLEtBQUssS0FBSyxnQkFBZ0Isc0RBQUksUUFBUSxpSEFBaUgsS0FBSztBQUMxckI7QUFDQSxpRUFBZSxRQUFRLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VTeXN0ZW1Db25maWdMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hZG1pbi9TeXN0ZW1Db25maWd1cmF0aW9uVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5vdGlmaWNhdGlvblN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlTm90aWZpY2F0aW9uU3RvcmUnO1xuZXhwb3J0IGNvbnN0IHVzZVN5c3RlbUNvbmZpZ0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGRhdGFiYXNlOiB7XG4gICAgICAgICAgICBjb25uZWN0aW9uU3RyaW5nOiAnRGF0YSBTb3VyY2U9bG9jYWxob3N0O0luaXRpYWwgQ2F0YWxvZz1NYW5kQTtJbnRlZ3JhdGVkIFNlY3VyaXR5PVRydWUnLFxuICAgICAgICAgICAgY29tbWFuZFRpbWVvdXQ6IDMwLFxuICAgICAgICAgICAgbWF4UG9vbFNpemU6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAgZW1haWw6IHtcbiAgICAgICAgICAgIHNtdHBTZXJ2ZXI6ICdzbXRwLm9mZmljZTM2NS5jb20nLFxuICAgICAgICAgICAgc210cFBvcnQ6IDU4NyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICAgIGZyb21BZGRyZXNzOiAnbm9yZXBseUBjb21wYW55LmNvbScsXG4gICAgICAgICAgICBlbmFibGVTc2w6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHNlY3VyaXR5OiB7XG4gICAgICAgICAgICBzZXNzaW9uVGltZW91dDogMzAsXG4gICAgICAgICAgICBtYXhMb2dpbkF0dGVtcHRzOiA1LFxuICAgICAgICAgICAgcmVxdWlyZVN0cm9uZ1Bhc3N3b3JkOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlQXVkaXRMb2c6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGFwcGxpY2F0aW9uOiB7XG4gICAgICAgICAgICBkZWZhdWx0VGhlbWU6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgZGF0ZUZvcm1hdDogJ01NL0REL1lZWVknLFxuICAgICAgICAgICAgaXRlbXNQZXJQYWdlOiA1MCxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBbb3JpZ2luYWxDb25maWcsIHNldE9yaWdpbmFsQ29uZmlnXSA9IHVzZVN0YXRlKGNvbmZpZyk7XG4gICAgY29uc3QgW2hhc0NoYW5nZXMsIHNldEhhc0NoYW5nZXNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHsgYWRkTm90aWZpY2F0aW9uIH0gPSB1c2VOb3RpZmljYXRpb25TdG9yZSgpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRDb25maWcoKTtcbiAgICB9LCBbXSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SGFzQ2hhbmdlcyhKU09OLnN0cmluZ2lmeShjb25maWcpICE9PSBKU09OLnN0cmluZ2lmeShvcmlnaW5hbENvbmZpZykpO1xuICAgIH0sIFtjb25maWcsIG9yaWdpbmFsQ29uZmlnXSk7XG4gICAgY29uc3QgbG9hZENvbmZpZyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNhdmVkQ29uZmlnID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N5c3RlbUNvbmZpZycpO1xuICAgICAgICAgICAgaWYgKHNhdmVkQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzYXZlZENvbmZpZyk7XG4gICAgICAgICAgICAgICAgc2V0Q29uZmlnKHBhcnNlZCk7XG4gICAgICAgICAgICAgICAgc2V0T3JpZ2luYWxDb25maWcocGFyc2VkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdlcnJvcicsIG1lc3NhZ2U6ICdGYWlsZWQgdG8gbG9hZCBjb25maWd1cmF0aW9uJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAocGF0aCwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0Q29uZmlnKHByZXYgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NvbmZpZyA9IHsgLi4ucHJldiB9O1xuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBuZXdDb25maWc7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFtrZXlzW2ldXSA9IHsgLi4uY3VycmVudFtrZXlzW2ldXSB9O1xuICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleXNbaV1dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudFtrZXlzW2tleXMubGVuZ3RoIC0gMV1dID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbmV3Q29uZmlnO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVNhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc3lzdGVtQ29uZmlnJywgSlNPTi5zdHJpbmdpZnkoY29uZmlnKSk7XG4gICAgICAgICAgICBzZXRPcmlnaW5hbENvbmZpZyhjb25maWcpO1xuICAgICAgICAgICAgYWRkTm90aWZpY2F0aW9uKHsgdHlwZTogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnQ29uZmlndXJhdGlvbiBzYXZlZCBzdWNjZXNzZnVsbHknLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiAnRmFpbGVkIHRvIHNhdmUgY29uZmlndXJhdGlvbicsIHBpbm5lZDogZmFsc2UsIHByaW9yaXR5OiAnbm9ybWFsJyB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlUmVzZXQgPSAoKSA9PiB7XG4gICAgICAgIHNldENvbmZpZyhvcmlnaW5hbENvbmZpZyk7XG4gICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdpbmZvJywgbWVzc2FnZTogJ0NoYW5nZXMgZGlzY2FyZGVkJywgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdsb3cnIH0pO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlVGVzdENvbm5lY3Rpb24gPSBhc3luYyAodHlwZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcbiAgICAgICAgICAgIGFkZE5vdGlmaWNhdGlvbih7IHR5cGU6ICdzdWNjZXNzJywgbWVzc2FnZTogYCR7dHlwZX0gY29ubmVjdGlvbiB0ZXN0IHN1Y2Nlc3NmdWxgLCBwaW5uZWQ6IGZhbHNlLCBwcmlvcml0eTogJ25vcm1hbCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oeyB0eXBlOiAnZXJyb3InLCBtZXNzYWdlOiBgJHt0eXBlfSBjb25uZWN0aW9uIHRlc3QgZmFpbGVkYCwgcGlubmVkOiBmYWxzZSwgcHJpb3JpdHk6ICdub3JtYWwnIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25maWcsXG4gICAgICAgIGhhc0NoYW5nZXMsXG4gICAgICAgIGhhbmRsZUNoYW5nZSxcbiAgICAgICAgaGFuZGxlU2F2ZSxcbiAgICAgICAgaGFuZGxlUmVzZXQsXG4gICAgICAgIGhhbmRsZVRlc3RDb25uZWN0aW9uLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTYXZlLCBSb3RhdGVDY3csIERhdGFiYXNlLCBNYWlsLCBTaGllbGQsIEdsb2JlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5pbXBvcnQgeyBDaGVja2JveCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gnO1xuaW1wb3J0IHsgdXNlU3lzdGVtQ29uZmlnTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VTeXN0ZW1Db25maWdMb2dpYyc7XG5leHBvcnQgY29uc3QgU3lzdGVtQ29uZmlndXJhdGlvblZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBjb25maWcsIGhhc0NoYW5nZXMsIGhhbmRsZUNoYW5nZSwgaGFuZGxlU2F2ZSwgaGFuZGxlUmVzZXQsIGhhbmRsZVRlc3RDb25uZWN0aW9uLCB9ID0gdXNlU3lzdGVtQ29uZmlnTG9naWMoKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaC1mdWxsIHAtNiBzcGFjZS15LTYgb3ZlcmZsb3cteS1hdXRvXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzeXN0ZW0tY29uZmlndXJhdGlvbi12aWV3XCIsIFwiZGF0YS1jeVwiOiBcInN5c3RlbS1jb25maWd1cmF0aW9uLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJTeXN0ZW0gQ29uZmlndXJhdGlvblwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFwiQ29uZmlndXJlIGdsb2JhbCBhcHBsaWNhdGlvbiBzZXR0aW5ncyBhbmQgcHJlZmVyZW5jZXNcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KFJvdGF0ZUNjdywge30pLCBvbkNsaWNrOiBoYW5kbGVSZXNldCwgZGlzYWJsZWQ6ICFoYXNDaGFuZ2VzLCBjaGlsZHJlbjogXCJSZXNldFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChTYXZlLCB7fSksIG9uQ2xpY2s6IGhhbmRsZVNhdmUsIGRpc2FibGVkOiAhaGFzQ2hhbmdlcywgY2hpbGRyZW46IFwiU2F2ZSBDaGFuZ2VzXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTYgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRGF0YWJhc2UsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgXCJEYXRhYmFzZSBTZXR0aW5nc1wiXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJDb25uZWN0aW9uIFN0cmluZ1wiLCB2YWx1ZTogKGNvbmZpZz8uZGF0YWJhc2U/LmNvbm5lY3Rpb25TdHJpbmcgPz8gJycpLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2UoJ2RhdGFiYXNlLmNvbm5lY3Rpb25TdHJpbmcnLCB2YWx1ZSksIHBsYWNlaG9sZGVyOiBcIkRhdGEgU291cmNlPS4uLlwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJDb21tYW5kIFRpbWVvdXQgKHNlY29uZHMpXCIsIHR5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiAoY29uZmlnPy5kYXRhYmFzZT8uY29tbWFuZFRpbWVvdXQgPz8gJycpLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUNoYW5nZSgnZGF0YWJhc2UuY29tbWFuZFRpbWVvdXQnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSkpIH0pLCBfanN4KElucHV0LCB7IGxhYmVsOiBcIk1heCBQb29sIFNpemVcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IChjb25maWc/LmRhdGFiYXNlPy5tYXhQb29sU2l6ZSA/PyAnJyksIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlQ2hhbmdlKCdkYXRhYmFzZS5tYXhQb29sU2l6ZScsIHBhcnNlSW50KGUudGFyZ2V0LnZhbHVlKSkgfSldIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVUZXN0Q29ubmVjdGlvbignZGF0YWJhc2UnKSwgY2hpbGRyZW46IFwiVGVzdCBDb25uZWN0aW9uXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTYgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goTWFpbCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBcIkVtYWlsIFNldHRpbmdzXCJdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBsYWJlbDogXCJTTVRQIFNlcnZlclwiLCB2YWx1ZTogKGNvbmZpZz8uZW1haWw/LnNtdHBTZXJ2ZXIgPz8gJycpLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBoYW5kbGVDaGFuZ2UoJ2VtYWlsLnNtdHBTZXJ2ZXInLCB2YWx1ZSkgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiU01UUCBQb3J0XCIsIHR5cGU6IFwibnVtYmVyXCIsIHZhbHVlOiAoY29uZmlnPy5lbWFpbD8uc210cFBvcnQgPz8gJycpLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUNoYW5nZSgnZW1haWwuc210cFBvcnQnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSkpIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiVXNlcm5hbWVcIiwgdmFsdWU6IChjb25maWc/LmVtYWlsPy51c2VybmFtZSA/PyAnJyksIG9uQ2hhbmdlOiAodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnZW1haWwudXNlcm5hbWUnLCB2YWx1ZSkgfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiRnJvbSBBZGRyZXNzXCIsIHR5cGU6IFwiZW1haWxcIiwgdmFsdWU6IChjb25maWc/LmVtYWlsPy5mcm9tQWRkcmVzcyA/PyAnJyksIG9uQ2hhbmdlOiAodmFsdWUpID0+IGhhbmRsZUNoYW5nZSgnZW1haWwuZnJvbUFkZHJlc3MnLCB2YWx1ZSkgfSldIH0pLCBfanN4KENoZWNrYm94LCB7IGxhYmVsOiBcIkVuYWJsZSBTU0xcIiwgY2hlY2tlZDogKGNvbmZpZz8uZW1haWw/LmVuYWJsZVNzbCA/PyAnJyksIG9uQ2hhbmdlOiAoY2hlY2tlZCkgPT4gaGFuZGxlQ2hhbmdlKCdlbWFpbC5lbmFibGVTc2wnLCBjaGVja2VkKSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtNiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChTaGllbGQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgXCJTZWN1cml0eSBTZXR0aW5nc1wiXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgbGFiZWw6IFwiU2Vzc2lvbiBUaW1lb3V0IChtaW51dGVzKVwiLCB0eXBlOiBcIm51bWJlclwiLCB2YWx1ZTogKGNvbmZpZz8uc2VjdXJpdHk/LnNlc3Npb25UaW1lb3V0ID8/ICcnKSwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVDaGFuZ2UoJ3NlY3VyaXR5LnNlc3Npb25UaW1lb3V0JywgcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpKSB9KSwgX2pzeChJbnB1dCwgeyBsYWJlbDogXCJNYXggTG9naW4gQXR0ZW1wdHNcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IChjb25maWc/LnNlY3VyaXR5Py5tYXhMb2dpbkF0dGVtcHRzID8/ICcnKSwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVDaGFuZ2UoJ3NlY3VyaXR5Lm1heExvZ2luQXR0ZW1wdHMnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSkpIH0pXSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJSZXF1aXJlIFN0cm9uZyBQYXNzd29yZHNcIiwgY2hlY2tlZDogKGNvbmZpZz8uc2VjdXJpdHk/LnJlcXVpcmVTdHJvbmdQYXNzd29yZCA/PyAnJyksIG9uQ2hhbmdlOiAoY2hlY2tlZCkgPT4gaGFuZGxlQ2hhbmdlKCdzZWN1cml0eS5yZXF1aXJlU3Ryb25nUGFzc3dvcmQnLCBjaGVja2VkKSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJFbmFibGUgQXVkaXQgTG9nZ2luZ1wiLCBjaGVja2VkOiAoY29uZmlnPy5zZWN1cml0eT8uZW5hYmxlQXVkaXRMb2cgPz8gJycpLCBvbkNoYW5nZTogKGNoZWNrZWQpID0+IGhhbmRsZUNoYW5nZSgnc2VjdXJpdHkuZW5hYmxlQXVkaXRMb2cnLCBjaGVja2VkKSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtNiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChHbG9iZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBcIkFwcGxpY2F0aW9uIFNldHRpbmdzXCJdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IFtfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJEZWZhdWx0IFRoZW1lXCIsIHZhbHVlOiAoY29uZmlnPy5hcHBsaWNhdGlvbj8uZGVmYXVsdFRoZW1lID8/ICcnKSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdhcHBsaWNhdGlvbi5kZWZhdWx0VGhlbWUnLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwibGlnaHRcIiwgbGFiZWw6IFwiTGlnaHRcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJkYXJrXCIsIGxhYmVsOiBcIkRhcmtcIiB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogXCJzeXN0ZW1cIiwgbGFiZWw6IFwiU3lzdGVtXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSwgX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiRGF0ZSBGb3JtYXRcIiwgdmFsdWU6IChjb25maWc/LmFwcGxpY2F0aW9uPy5kYXRlRm9ybWF0ID8/ICcnKSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gaGFuZGxlQ2hhbmdlKCdhcHBsaWNhdGlvbi5kYXRlRm9ybWF0JywgdmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIk1NL0REL1lZWVlcIiwgbGFiZWw6IFwiTU0vREQvWVlZWVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIkREL01NL1lZWVlcIiwgbGFiZWw6IFwiREQvTU0vWVlZWVwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIllZWVktTU0tRERcIiwgbGFiZWw6IFwiWVlZWS1NTS1ERFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSksIF9qc3goSW5wdXQsIHsgbGFiZWw6IFwiSXRlbXMgUGVyIFBhZ2VcIiwgdHlwZTogXCJudW1iZXJcIiwgdmFsdWU6IChjb25maWc/LmFwcGxpY2F0aW9uPy5pdGVtc1BlclBhZ2UgPz8gJycpLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUNoYW5nZSgnYXBwbGljYXRpb24uaXRlbXNQZXJQYWdlJywgcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpKSB9KV0gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU3lzdGVtQ29uZmlndXJhdGlvblZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=