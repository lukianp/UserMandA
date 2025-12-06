"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1826],{

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


/***/ }),

/***/ 71826:
/*!******************************************************!*\
  !*** ./src/renderer/views/admin/PermissionsView.tsx ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PermissionsView: () => (/* binding */ PermissionsView),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../components/atoms/Button */ 74160);
/* harmony import */ var _components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/atoms/Checkbox */ 63683);
/* harmony import */ var _components_atoms_Select__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/atoms/Select */ 1156);






const PermissionsView = () => {
    const [selectedRole, setSelectedRole] = react__WEBPACK_IMPORTED_MODULE_1__.useState('PowerUser');
    const permissionCategories = [
        {
            name: 'Discovery',
            permissions: ['Read', 'Execute', 'Export', 'Schedule'],
        },
        {
            name: 'Migration',
            permissions: ['Read', 'Plan', 'Execute', 'Rollback'],
        },
        {
            name: 'Users',
            permissions: ['Read', 'Create', 'Update', 'Delete'],
        },
        {
            name: 'Reports',
            permissions: ['Read', 'Create', 'Schedule', 'Export'],
        },
    ];
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6", "data-testid": "permissions-view", "data-cy": "permissions-view", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h1", { className: "text-2xl font-bold", children: "Permissions Management" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Configure role-based access control permissions" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "w-64", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Select__WEBPACK_IMPORTED_MODULE_5__.Select, { label: "Select Role", value: selectedRole, onChange: (value) => setSelectedRole(value), options: [
                        { value: "Administrator", label: "Administrator" },
                        { value: "PowerUser", label: "Power User" },
                        { value: "User", label: "User" },
                        { value: "ReadOnly", label: "Read Only" },
                    ] }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "grid grid-cols-2 gap-6", children: permissionCategories.map((category) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.Shield, { className: "w-5 h-5" }), category.name] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "space-y-2", children: category.permissions.map((permission) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_4__.Checkbox, { label: permission, checked: selectedRole === 'Administrator' || Math.random() > 0.5, 
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                onChange: () => { } }, permission))) })] }, category.name))) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "primary", children: "Save Permissions" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_atoms_Button__WEBPACK_IMPORTED_MODULE_3__.Button, { variant: "secondary", children: "Reset to Defaults" })] })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PermissionsView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMTgyNi5kNzk3NWIxOWZlOWQwMTVhZDY4Ni5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUErRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDcUM7QUFDVDtBQUNTO0FBQ3JDO0FBQ0E7QUFDQTtBQUNPLG9CQUFvQiw4SEFBOEg7QUFDekosZUFBZSw0Q0FBSztBQUNwQix1QkFBdUIsR0FBRztBQUMxQiw2QkFBNkIsR0FBRztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5Q0FBWTtBQUNwQyxJQUFJLDRDQUFlO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCw0QkFBNEIsMENBQUk7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx5QkFBeUIsMENBQUk7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLFlBQVksdURBQUssVUFBVSxXQUFXLDBDQUFJLHlDQUF5Qyx1REFBSyxVQUFVLDBDQUEwQyx1REFBSyxVQUFVLCtDQUErQyxzREFBSSxZQUFZLG1MQUFtTCwwQ0FBSTtBQUNqWjtBQUNBO0FBQ0EsaUNBQWlDLHNCQUFzQixHQUFHLHVEQUFLLFlBQVksd0JBQXdCLDBDQUFJO0FBQ3ZHO0FBQ0EsaUNBQWlDLDRDQUE0QyxzREFBSSxDQUFDLCtDQUFLLElBQUksaURBQWlELHNCQUFzQixzREFBSSxVQUFVLHlDQUF5QyxLQUFLLElBQUksOEJBQThCLHVEQUFLLFVBQVUsd0NBQXdDLHNEQUFJLFlBQVksd0JBQXdCLDBDQUFJLG1EQUFtRCxvQkFBb0Isc0RBQUksUUFBUSx3R0FBd0csS0FBSyxLQUFLLGdCQUFnQixzREFBSSxRQUFRLGlIQUFpSCxLQUFLO0FBQzFyQjtBQUNBLGlFQUFlLFFBQVEsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzFEdUM7QUFDckM7QUFDWTtBQUNpQjtBQUNJO0FBQ0o7QUFDaEQ7QUFDUCw0Q0FBNEMsMkNBQWM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxZQUFZLHVEQUFLLFVBQVUsOEhBQThILHVEQUFLLFVBQVUsV0FBVyxzREFBSSxTQUFTLHFFQUFxRSxHQUFHLHNEQUFJLFFBQVEseUhBQXlILElBQUksR0FBRyxzREFBSSxVQUFVLDZCQUE2QixzREFBSSxDQUFDLDREQUFNLElBQUk7QUFDOWMsMEJBQTBCLGdEQUFnRDtBQUMxRSwwQkFBMEIseUNBQXlDO0FBQ25FLDBCQUEwQiw4QkFBOEI7QUFDeEQsMEJBQTBCLHVDQUF1QztBQUNqRSx1QkFBdUIsR0FBRyxHQUFHLHNEQUFJLFVBQVUsdUZBQXVGLHVEQUFLLFVBQVUseUVBQXlFLHVEQUFLLFNBQVMsb0VBQW9FLHNEQUFJLENBQUMsZ0RBQU0sSUFBSSxzQkFBc0IsbUJBQW1CLEdBQUcsc0RBQUksVUFBVSw0RUFBNEUsc0RBQUksQ0FBQyxnRUFBUSxJQUFJO0FBQ2xkO0FBQ0EscURBQXFELGlCQUFpQixJQUFJLG9CQUFvQixHQUFHLHVEQUFLLFVBQVUsb0NBQW9DLHNEQUFJLENBQUMsNERBQU0sSUFBSSxrREFBa0QsR0FBRyxzREFBSSxDQUFDLDREQUFNLElBQUkscURBQXFELElBQUksSUFBSTtBQUNwUztBQUNBLGlFQUFlLGVBQWUsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FkbWluL1Blcm1pc3Npb25zVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKlxuICogRnVsbHkgYWNjZXNzaWJsZSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBsYWJlbHMgYW5kIGVycm9yIHN0YXRlcy5cbiAqIEZvbGxvd3MgV0NBRyAyLjEgQUEgZ3VpZGVsaW5lcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUlkIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQ2hlY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IENoZWNrYm94ID0gKHsgbGFiZWwsIGRlc2NyaXB0aW9uLCBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBlcnJvciwgZGlzYWJsZWQgPSBmYWxzZSwgaW5kZXRlcm1pbmF0ZSA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgaWQgPSB1c2VJZCgpO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpZH0tZXJyb3JgO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uSWQgPSBgJHtpZH0tZGVzY3JpcHRpb25gO1xuICAgIGNvbnN0IGhhc0Vycm9yID0gQm9vbGVhbihlcnJvcik7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIGluZGV0ZXJtaW5hdGUgdmlhIHJlZlxuICAgIGNvbnN0IGNoZWNrYm94UmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjaGVja2JveFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjaGVja2JveFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBpbmRldGVybWluYXRlO1xuICAgICAgICB9XG4gICAgfSwgW2luZGV0ZXJtaW5hdGVdKTtcbiAgICBjb25zdCBjaGVja2JveENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2gtNSB3LTUgcm91bmRlZCBib3JkZXItMicsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rhcms6cmluZy1vZmZzZXQtZ3JheS05MDAnLCBcbiAgICAvLyBTdGF0ZS1iYXNlZCBzdHlsZXNcbiAgICB7XG4gICAgICAgIC8vIE5vcm1hbCBzdGF0ZSAodW5jaGVja2VkKVxuICAgICAgICAnYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNTAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkICYmICFjaGVja2VkLFxuICAgICAgICAnZm9jdXM6cmluZy1ibHVlLTUwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIENoZWNrZWQgc3RhdGVcbiAgICAgICAgJ2JnLWJsdWUtNjAwIGJvcmRlci1ibHVlLTYwMCBkYXJrOmJnLWJsdWUtNTAwIGRhcms6Ym9yZGVyLWJsdWUtNTAwJzogY2hlY2tlZCAmJiAhZGlzYWJsZWQgJiYgIWhhc0Vycm9yLFxuICAgICAgICAvLyBFcnJvciBzdGF0ZVxuICAgICAgICAnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtNjAwIGRhcms6Ym9yZGVyLXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICdmb2N1czpyaW5nLXJlZC01MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIERpc2FibGVkIHN0YXRlXG4gICAgICAgICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS02MDAgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCd0ZXh0LXNtIGZvbnQtbWVkaXVtJywge1xuICAgICAgICAndGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS01MDAnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGZsZXgtY29sJywgY2xhc3NOYW1lKSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgaC01XCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgcmVmOiBjaGVja2JveFJlZiwgaWQ6IGlkLCB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGNoZWNrZWQsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBcInNyLW9ubHkgcGVlclwiLCBcImFyaWEtaW52YWxpZFwiOiBoYXNFcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Vycm9ySWRdOiBoYXNFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbklkXTogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pLCBfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChjaGVja2JveENsYXNzZXMsICdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItcG9pbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIGNoaWxkcmVuOiBbY2hlY2tlZCAmJiAhaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChDaGVjaywgeyBjbGFzc05hbWU6IFwiaC00IHctNCB0ZXh0LXdoaXRlXCIsIHN0cm9rZVdpZHRoOiAzIH0pKSwgaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTAuNSB3LTMgYmctd2hpdGUgcm91bmRlZFwiIH0pKV0gfSldIH0pLCAobGFiZWwgfHwgZGVzY3JpcHRpb24pICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtbC0zXCIsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3goXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3gobGFiZWxDbGFzc2VzLCAnY3Vyc29yLXBvaW50ZXInKSwgY2hpbGRyZW46IGxhYmVsIH0pKSwgZGVzY3JpcHRpb24gJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGRlc2NyaXB0aW9uSWQsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTAuNVwiLCBjaGlsZHJlbjogZGVzY3JpcHRpb24gfSkpXSB9KSldIH0pLCBoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBcIm10LTEgbWwtOCB0ZXh0LXNtIHRleHQtcmVkLTYwMFwiLCByb2xlOiBcImFsZXJ0XCIsIFwiYXJpYS1saXZlXCI6IFwicG9saXRlXCIsIGNoaWxkcmVuOiBlcnJvciB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDaGVja2JveDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2hpZWxkIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IENoZWNrYm94IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9DaGVja2JveCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5leHBvcnQgY29uc3QgUGVybWlzc2lvbnNWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IFtzZWxlY3RlZFJvbGUsIHNldFNlbGVjdGVkUm9sZV0gPSBSZWFjdC51c2VTdGF0ZSgnUG93ZXJVc2VyJyk7XG4gICAgY29uc3QgcGVybWlzc2lvbkNhdGVnb3JpZXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdEaXNjb3ZlcnknLFxuICAgICAgICAgICAgcGVybWlzc2lvbnM6IFsnUmVhZCcsICdFeGVjdXRlJywgJ0V4cG9ydCcsICdTY2hlZHVsZSddLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTWlncmF0aW9uJyxcbiAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbJ1JlYWQnLCAnUGxhbicsICdFeGVjdXRlJywgJ1JvbGxiYWNrJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdVc2VycycsXG4gICAgICAgICAgICBwZXJtaXNzaW9uczogWydSZWFkJywgJ0NyZWF0ZScsICdVcGRhdGUnLCAnRGVsZXRlJ10sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdSZXBvcnRzJyxcbiAgICAgICAgICAgIHBlcm1pc3Npb25zOiBbJ1JlYWQnLCAnQ3JlYXRlJywgJ1NjaGVkdWxlJywgJ0V4cG9ydCddLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgc3BhY2UteS02XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJwZXJtaXNzaW9ucy12aWV3XCIsIFwiZGF0YS1jeVwiOiBcInBlcm1pc3Npb25zLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZFwiLCBjaGlsZHJlbjogXCJQZXJtaXNzaW9ucyBNYW5hZ2VtZW50XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogXCJDb25maWd1cmUgcm9sZS1iYXNlZCBhY2Nlc3MgY29udHJvbCBwZXJtaXNzaW9uc1wiIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTY0XCIsIGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJTZWxlY3QgUm9sZVwiLCB2YWx1ZTogc2VsZWN0ZWRSb2xlLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBzZXRTZWxlY3RlZFJvbGUodmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIkFkbWluaXN0cmF0b3JcIiwgbGFiZWw6IFwiQWRtaW5pc3RyYXRvclwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiBcIlBvd2VyVXNlclwiLCBsYWJlbDogXCJQb3dlciBVc2VyXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiVXNlclwiLCBsYWJlbDogXCJVc2VyXCIgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6IFwiUmVhZE9ubHlcIiwgbGFiZWw6IFwiUmVhZCBPbmx5XCIgfSxcbiAgICAgICAgICAgICAgICAgICAgXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBwZXJtaXNzaW9uQ2F0ZWdvcmllcy5tYXAoKGNhdGVnb3J5KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTYgcm91bmRlZC1sZyBib3JkZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGNhdGVnb3J5Lm5hbWVdIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogY2F0ZWdvcnkucGVybWlzc2lvbnMubWFwKChwZXJtaXNzaW9uKSA9PiAoX2pzeChDaGVja2JveCwgeyBsYWJlbDogcGVybWlzc2lvbiwgY2hlY2tlZDogc2VsZWN0ZWRSb2xlID09PSAnQWRtaW5pc3RyYXRvcicgfHwgTWF0aC5yYW5kb20oKSA+IDAuNSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6ICgpID0+IHsgfSB9LCBwZXJtaXNzaW9uKSkpIH0pXSB9LCBjYXRlZ29yeS5uYW1lKSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGNoaWxkcmVuOiBcIlNhdmUgUGVybWlzc2lvbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgY2hpbGRyZW46IFwiUmVzZXQgdG8gRGVmYXVsdHNcIiB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBQZXJtaXNzaW9uc1ZpZXc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=