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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMzEzMC43YTkyMWRhYjRmOWQ2M2NhMmZhZi5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBLGU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQStEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQzBCO0FBQ2lCO0FBQ3FDO0FBQ3ZDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixzS0FBc0s7QUFDL0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGdFQUFXO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLGtCQUFrQixrRUFBYTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxrQkFBa0IseURBQUk7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0Esa0JBQWtCLGdFQUFXO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLENBQUMsK0RBQU0sSUFBSSwwRkFBMEYsc0RBQUksVUFBVSwrREFBK0QsR0FBRyxzREFBSSxVQUFVLDJFQUEyRSx1REFBSyxDQUFDLCtEQUFNLFVBQVUsaUdBQWlHLHVEQUFLLFVBQVUsb0RBQW9ELHNEQUFJLFVBQVUsNkNBQTZDLGVBQWUsYUFBYSxzREFBSSxrQkFBa0Isc0JBQXNCLGlCQUFpQixHQUFHLEdBQUcsR0FBRyx1REFBSyxVQUFVLHdDQUF3QyxzREFBSSxDQUFDLCtEQUFNLFVBQVUsMkZBQTJGLEdBQUcsc0RBQUksQ0FBQywrREFBTSxnQkFBZ0IsMEVBQTBFLElBQUksR0FBRyxzREFBSSxhQUFhLGtLQUFrSyxzREFBSSxDQUFDLDJDQUFDLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLHVEQUFLLFVBQVUsdUVBQXVFLHNEQUFJLENBQUMsMERBQU0sSUFBSSw4R0FBOEcsR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUksMEhBQTBILElBQUksSUFBSSxHQUFHLElBQUk7QUFDdjlDO0FBQ0EsaUVBQWUsYUFBYSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0NvbmZpcm1EaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENvbmZpcm0gRGlhbG9nIENvbXBvbmVudFxuICogR2VuZXJpYyBjb25maXJtYXRpb24gbW9kYWwgd2l0aCBjdXN0b21pemFibGUgYWN0aW9uc1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgQWxlcnRUcmlhbmdsZSwgSW5mbywgQWxlcnRDaXJjbGUsIENoZWNrQ2lyY2xlLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG4vKipcbiAqIENvbmZpcm0gRGlhbG9nIENvbXBvbmVudFxuICovXG5jb25zdCBDb25maXJtRGlhbG9nID0gKHsgaXNPcGVuLCBvbkNsb3NlLCBvbkNvbmZpcm0sIHRpdGxlLCBtZXNzYWdlLCB2YXJpYW50ID0gJ2luZm8nLCBjb25maXJtVGV4dCA9ICdDb25maXJtJywgY2FuY2VsVGV4dCA9ICdDYW5jZWwnLCBsb2FkaW5nID0gZmFsc2UsICdkYXRhLWN5JzogZGF0YUN5ID0gJ2NvbmZpcm0tZGlhbG9nJywgfSkgPT4ge1xuICAgIGNvbnN0IGhhbmRsZUNvbmZpcm0gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IG9uQ29uZmlybSgpO1xuICAgIH07XG4gICAgLy8gVmFyaWFudCBjb25maWd1cmF0aW9uc1xuICAgIGNvbnN0IHZhcmlhbnRDb25maWcgPSB7XG4gICAgICAgIGRhbmdlcjoge1xuICAgICAgICAgICAgaWNvbjogQWxlcnRDaXJjbGUsXG4gICAgICAgICAgICBpY29uQ29sb3I6ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnLFxuICAgICAgICAgICAgYmdDb2xvcjogJ2JnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAnLFxuICAgICAgICAgICAgYnV0dG9uVmFyaWFudDogJ2RhbmdlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHdhcm5pbmc6IHtcbiAgICAgICAgICAgIGljb246IEFsZXJ0VHJpYW5nbGUsXG4gICAgICAgICAgICBpY29uQ29sb3I6ICd0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDAnLFxuICAgICAgICAgICAgYmdDb2xvcjogJ2JnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAnLFxuICAgICAgICAgICAgYnV0dG9uVmFyaWFudDogJ3ByaW1hcnknLFxuICAgICAgICB9LFxuICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICBpY29uOiBJbmZvLFxuICAgICAgICAgICAgaWNvbkNvbG9yOiAndGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLFxuICAgICAgICAgICAgYmdDb2xvcjogJ2JnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCcsXG4gICAgICAgICAgICBidXR0b25WYXJpYW50OiAncHJpbWFyeScsXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IHtcbiAgICAgICAgICAgIGljb246IENoZWNrQ2lyY2xlLFxuICAgICAgICAgICAgaWNvbkNvbG9yOiAndGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCcsXG4gICAgICAgICAgICBiZ0NvbG9yOiAnYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAnLFxuICAgICAgICAgICAgYnV0dG9uVmFyaWFudDogJ3ByaW1hcnknLFxuICAgICAgICB9LFxuICAgIH07XG4gICAgY29uc3QgY29uZmlnID0gdmFyaWFudENvbmZpZ1t2YXJpYW50XTtcbiAgICBjb25zdCBJY29uQ29tcG9uZW50ID0gY29uZmlnLmljb247XG4gICAgcmV0dXJuIChfanN4cyhEaWFsb2csIHsgb3BlbjogaXNPcGVuLCBvbkNsb3NlOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicmVsYXRpdmUgei01MFwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay8zMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhEaWFsb2cuUGFuZWwsIHsgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWF4LXctbWQgdy1mdWxsIHJvdW5kZWQtbGcgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBzaGFkb3ctMnhsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBnYXAtNCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgZmxleC1zaHJpbmstMCBwLTMgcm91bmRlZC1mdWxsICR7Y29uZmlnLmJnQ29sb3J9YCwgY2hpbGRyZW46IF9qc3goSWNvbkNvbXBvbmVudCwgeyBjbGFzc05hbWU6IGB3LTYgaC02ICR7Y29uZmlnLmljb25Db2xvcn1gIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgbWluLXctMFwiLCBjaGlsZHJlbjogW19qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItMlwiLCBjaGlsZHJlbjogdGl0bGUgfSksIF9qc3goRGlhbG9nLkRlc2NyaXB0aW9uLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBtZXNzYWdlIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJmbGV4LXNocmluay0wIHAtMSBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtY29uZmlybS1idG5cIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1lbmQgZ2FwLTMgcHgtNiBwYi02XCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBvbkNsb3NlLCBkaXNhYmxlZDogbG9hZGluZywgXCJkYXRhLWN5XCI6IFwiY2FuY2VsLWNvbmZpcm0tYnRuXCIsIGNoaWxkcmVuOiBjYW5jZWxUZXh0IH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBjb25maWcuYnV0dG9uVmFyaWFudCwgb25DbGljazogaGFuZGxlQ29uZmlybSwgbG9hZGluZzogbG9hZGluZywgXCJkYXRhLWN5XCI6IFwiY29uZmlybS1idG5cIiwgY2hpbGRyZW46IGNvbmZpcm1UZXh0IH0pXSB9KV0gfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDb25maXJtRGlhbG9nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9