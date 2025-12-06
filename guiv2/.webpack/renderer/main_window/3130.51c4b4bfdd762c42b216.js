(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3130],{

/***/ 21104:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 27195:
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

/**
 * Confirm Dialog Component
 * Generic confirmation modal with customizable actions
 */




/**
 * Confirm Dialog Component
 */
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, variant = 'info', confirmText = 'Confirm', cancelText = 'Cancel', loading = false, 'data-cy': dataCy = 'confirm-dialog', }) => {
    const handleConfirm = async () => {
        await onConfirm();
    };
    // Variant configurations
    const variantConfig = {
        danger: {
            icon: lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ,
            iconColor: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            buttonVariant: 'danger',
        },
        warning: {
            icon: lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertTriangle */ .hcu,
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            buttonVariant: 'primary',
        },
        info: {
            icon: lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Info */ .R2D,
            iconColor: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            buttonVariant: 'primary',
        },
        success: {
            icon: lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .CheckCircle */ .rAV,
            iconColor: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            buttonVariant: 'primary',
        },
    };
    const config = variantConfig[variant];
    const IconComponent = config.icon;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: onClose, className: "relative z-50", "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-md w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-4 p-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: `flex-shrink-0 p-3 rounded-full ${config.bgColor}`, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(IconComponent, { className: `w-6 h-6 ${config.iconColor}` }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 min-w-0", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: title }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Description, { className: "text-sm text-gray-600 dark:text-gray-400", children: message })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "data-cy": "close-confirm-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-3 px-6 pb-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "ghost", onClick: onClose, disabled: loading, "data-cy": "cancel-confirm-btn", children: cancelText }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: config.buttonVariant, onClick: handleConfirm, loading: loading, "data-cy": "confirm-btn", children: confirmText })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ConfirmDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMzEzMC43YTkyMWRhYjRmOWQ2M2NhMmZhZi5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBLGU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQStEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQzBCO0FBQ2lCO0FBQ3FDO0FBQ3ZDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixzS0FBc0s7QUFDL0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGdFQUFXO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLGtCQUFrQixrRUFBYTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxrQkFBa0IseURBQUk7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esa0JBQWtCLGdFQUFXO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLENBQUMsK0RBQU0sSUFBSSwwRkFBMEYsc0RBQUksVUFBVSwrREFBK0QsR0FBRyxzREFBSSxVQUFVLDJFQUEyRSx1REFBSyxDQUFDLCtEQUFNLFVBQVUsaUdBQWlHLHVEQUFLLFVBQVUsb0RBQW9ELHNEQUFJLFVBQVUsNkNBQTZDLGVBQWUsYUFBYSxzREFBSSxrQkFBa0Isc0JBQXNCLGlCQUFpQixHQUFHLEdBQUcsR0FBRyx1REFBSyxVQUFVLHdDQUF3QyxzREFBSSxDQUFDLCtEQUFNLFVBQVUsMkZBQTJGLEdBQUcsc0RBQUksQ0FBQywrREFBTSxnQkFBZ0IsMEVBQTBFLElBQUksR0FBRyxzREFBSSxhQUFhLGtLQUFrSyxzREFBSSxDQUFDLDJDQUFDLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLHVEQUFLLFVBQVUsdUVBQXVFLHNEQUFJLENBQUMsMERBQU0sSUFBSSw4R0FBOEcsR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUksMEhBQTBILElBQUksSUFBSSxHQUFHLElBQUk7QUFDdjlDO0FBQ0EsaUVBQWUsYUFBYSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxAaGVhZGxlc3N1aVxccmVhY3RcXGRpc3RcXGhvb2tzfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2RpYWxvZ3MvQ29uZmlybURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ29uZmlybSBEaWFsb2cgQ29tcG9uZW50XG4gKiBHZW5lcmljIGNvbmZpcm1hdGlvbiBtb2RhbCB3aXRoIGN1c3RvbWl6YWJsZSBhY3Rpb25zXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICdAaGVhZGxlc3N1aS9yZWFjdCc7XG5pbXBvcnQgeyBBbGVydFRyaWFuZ2xlLCBJbmZvLCBBbGVydENpcmNsZSwgQ2hlY2tDaXJjbGUsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbi8qKlxuICogQ29uZmlybSBEaWFsb2cgQ29tcG9uZW50XG4gKi9cbmNvbnN0IENvbmZpcm1EaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIG9uQ29uZmlybSwgdGl0bGUsIG1lc3NhZ2UsIHZhcmlhbnQgPSAnaW5mbycsIGNvbmZpcm1UZXh0ID0gJ0NvbmZpcm0nLCBjYW5jZWxUZXh0ID0gJ0NhbmNlbCcsIGxvYWRpbmcgPSBmYWxzZSwgJ2RhdGEtY3knOiBkYXRhQ3kgPSAnY29uZmlybS1kaWFsb2cnLCB9KSA9PiB7XG4gICAgY29uc3QgaGFuZGxlQ29uZmlybSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgb25Db25maXJtKCk7XG4gICAgfTtcbiAgICAvLyBWYXJpYW50IGNvbmZpZ3VyYXRpb25zXG4gICAgY29uc3QgdmFyaWFudENvbmZpZyA9IHtcbiAgICAgICAgZGFuZ2VyOiB7XG4gICAgICAgICAgICBpY29uOiBBbGVydENpcmNsZSxcbiAgICAgICAgICAgIGljb25Db2xvcjogJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcsXG4gICAgICAgICAgICBiZ0NvbG9yOiAnYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCcsXG4gICAgICAgICAgICBidXR0b25WYXJpYW50OiAnZGFuZ2VyJyxcbiAgICAgICAgfSxcbiAgICAgICAgd2FybmluZzoge1xuICAgICAgICAgICAgaWNvbjogQWxlcnRUcmlhbmdsZSxcbiAgICAgICAgICAgIGljb25Db2xvcjogJ3RleHQteWVsbG93LTYwMCBkYXJrOnRleHQteWVsbG93LTQwMCcsXG4gICAgICAgICAgICBiZ0NvbG9yOiAnYmcteWVsbG93LTUwIGRhcms6YmcteWVsbG93LTkwMC8yMCcsXG4gICAgICAgICAgICBidXR0b25WYXJpYW50OiAncHJpbWFyeScsXG4gICAgICAgIH0sXG4gICAgICAgIGluZm86IHtcbiAgICAgICAgICAgIGljb246IEluZm8sXG4gICAgICAgICAgICBpY29uQ29sb3I6ICd0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCcsXG4gICAgICAgICAgICBiZ0NvbG9yOiAnYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwJyxcbiAgICAgICAgICAgIGJ1dHRvblZhcmlhbnQ6ICdwcmltYXJ5JyxcbiAgICAgICAgfSxcbiAgICAgICAgc3VjY2Vzczoge1xuICAgICAgICAgICAgaWNvbjogQ2hlY2tDaXJjbGUsXG4gICAgICAgICAgICBpY29uQ29sb3I6ICd0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJyxcbiAgICAgICAgICAgIGJnQ29sb3I6ICdiZy1ncmVlbi01MCBkYXJrOmJnLWdyZWVuLTkwMC8yMCcsXG4gICAgICAgICAgICBidXR0b25WYXJpYW50OiAncHJpbWFyeScsXG4gICAgICAgIH0sXG4gICAgfTtcbiAgICBjb25zdCBjb25maWcgPSB2YXJpYW50Q29uZmlnW3ZhcmlhbnRdO1xuICAgIGNvbnN0IEljb25Db21wb25lbnQgPSBjb25maWcuaWNvbjtcbiAgICByZXR1cm4gKF9qc3hzKERpYWxvZywgeyBvcGVuOiBpc09wZW4sIG9uQ2xvc2U6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy1tZCB3LWZ1bGwgcm91bmRlZC1sZyBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHNoYWRvdy0yeGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC00IHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBmbGV4LXNocmluay0wIHAtMyByb3VuZGVkLWZ1bGwgJHtjb25maWcuYmdDb2xvcn1gLCBjaGlsZHJlbjogX2pzeChJY29uQ29tcG9uZW50LCB7IGNsYXNzTmFtZTogYHctNiBoLTYgJHtjb25maWcuaWNvbkNvbG9yfWAgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBtaW4tdy0wXCIsIGNoaWxkcmVuOiBbX2pzeChEaWFsb2cuVGl0bGUsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi0yXCIsIGNoaWxkcmVuOiB0aXRsZSB9KSwgX2pzeChEaWFsb2cuRGVzY3JpcHRpb24sIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IG1lc3NhZ2UgfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbG9zZSwgY2xhc3NOYW1lOiBcImZsZXgtc2hyaW5rLTAgcC0xIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWNvbG9yc1wiLCBcImRhdGEtY3lcIjogXCJjbG9zZS1jb25maXJtLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMyBweC02IHBiLTZcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IG9uQ2xvc2UsIGRpc2FibGVkOiBsb2FkaW5nLCBcImRhdGEtY3lcIjogXCJjYW5jZWwtY29uZmlybS1idG5cIiwgY2hpbGRyZW46IGNhbmNlbFRleHQgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IGNvbmZpZy5idXR0b25WYXJpYW50LCBvbkNsaWNrOiBoYW5kbGVDb25maXJtLCBsb2FkaW5nOiBsb2FkaW5nLCBcImRhdGEtY3lcIjogXCJjb25maXJtLWJ0blwiLCBjaGlsZHJlbjogY29uZmlybVRleHQgfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENvbmZpcm1EaWFsb2c7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=