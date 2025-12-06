(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3844],{

/***/ 5877:
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
 * Delete Confirmation Dialog
 * Reusable confirmation modal for destructive actions
 */




const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Deletion', message = 'Are you sure you want to delete this item? This action cannot be undone.', confirmText = 'Delete', cancelText = 'Cancel', itemName, }) => {
    const [isDeleting, setIsDeleting] = react__WEBPACK_IMPORTED_MODULE_1__.useState(false);
    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            onClose();
        }
        catch (error) {
            console.error('Delete failed:', error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: onClose, className: "relative z-50", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "p-2 bg-red-100 dark:bg-red-900/20 rounded-full", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertTriangle */ .hcu, { className: "w-5 h-5 text-red-600 dark:text-red-400" }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: title })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "data-cy": "close-dialog-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: message }), itemName && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: itemName }) }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: onClose, disabled: isDeleting, "data-cy": "cancel-btn", children: cancelText }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "danger", onClick: handleConfirm, loading: isDeleting, "data-cy": "confirm-delete-btn", children: confirmText })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DeleteConfirmationDialog);


/***/ }),

/***/ 21104:
/***/ (() => {

/* (ignored) */

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMzg0NC5hMmZkYjQ5MWNkZWM2ZmNlOTE4MC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDMEI7QUFDaUI7QUFDSztBQUNQO0FBQ3pDLG9DQUFvQyx3TUFBd007QUFDNU8sd0NBQXdDLDJDQUFjO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1REFBSyxDQUFDLCtEQUFNLElBQUksdUVBQXVFLHNEQUFJLFVBQVUsK0RBQStELEdBQUcsc0RBQUksVUFBVSwyRUFBMkUsdURBQUssQ0FBQywrREFBTSxVQUFVLGdHQUFnRyx1REFBSyxVQUFVLG1IQUFtSCx1REFBSyxVQUFVLGlEQUFpRCxzREFBSSxVQUFVLHVFQUF1RSxzREFBSSxDQUFDLGtFQUFhLElBQUkscURBQXFELEdBQUcsR0FBRyxzREFBSSxDQUFDLCtEQUFNLFVBQVUsbUZBQW1GLElBQUksR0FBRyxzREFBSSxhQUFhLG9JQUFvSSxzREFBSSxDQUFDLDJDQUFDLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLHVEQUFLLFVBQVUsbUNBQW1DLHNEQUFJLFFBQVEsMEVBQTBFLGdCQUFnQixzREFBSSxVQUFVLDJFQUEyRSxzREFBSSxRQUFRLG9GQUFvRixHQUFHLEtBQUssR0FBRyx1REFBSyxVQUFVLHFIQUFxSCxzREFBSSxDQUFDLDBEQUFNLElBQUksNkdBQTZHLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLHdIQUF3SCxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzd3RDtBQUNBLGlFQUFlLHdCQUF3QixFQUFDOzs7Ozs7OztBQzFCeEMsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZGlhbG9ncy9EZWxldGVDb25maXJtYXRpb25EaWFsb2cudHN4Iiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXEBoZWFkbGVzc3VpXFxyZWFjdFxcZGlzdFxcaG9va3N8cHJvY2Vzcy9icm93c2VyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIERlbGV0ZSBDb25maXJtYXRpb24gRGlhbG9nXG4gKiBSZXVzYWJsZSBjb25maXJtYXRpb24gbW9kYWwgZm9yIGRlc3RydWN0aXZlIGFjdGlvbnNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJ0BoZWFkbGVzc3VpL3JlYWN0JztcbmltcG9ydCB7IEFsZXJ0VHJpYW5nbGUsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmNvbnN0IERlbGV0ZUNvbmZpcm1hdGlvbkRpYWxvZyA9ICh7IGlzT3Blbiwgb25DbG9zZSwgb25Db25maXJtLCB0aXRsZSA9ICdDb25maXJtIERlbGV0aW9uJywgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgaXRlbT8gVGhpcyBhY3Rpb24gY2Fubm90IGJlIHVuZG9uZS4nLCBjb25maXJtVGV4dCA9ICdEZWxldGUnLCBjYW5jZWxUZXh0ID0gJ0NhbmNlbCcsIGl0ZW1OYW1lLCB9KSA9PiB7XG4gICAgY29uc3QgW2lzRGVsZXRpbmcsIHNldElzRGVsZXRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGhhbmRsZUNvbmZpcm0gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzRGVsZXRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBvbkNvbmZpcm0oKTtcbiAgICAgICAgICAgIG9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0RlbGV0ZSBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNEZWxldGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoRGlhbG9nLCB7IG9wZW46IGlzT3Blbiwgb25DbG9zZTogb25DbG9zZSwgY2xhc3NOYW1lOiBcInJlbGF0aXZlIHotNTBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgYmctYmxhY2svMzBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNFwiLCBjaGlsZHJlbjogX2pzeHMoRGlhbG9nLlBhbmVsLCB7IGNsYXNzTmFtZTogXCJteC1hdXRvIG1heC13LW1kIHctZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LXhsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC0yIGJnLXJlZC0xMDAgZGFyazpiZy1yZWQtOTAwLzIwIHJvdW5kZWQtZnVsbFwiLCBjaGlsZHJlbjogX2pzeChBbGVydFRyaWFuZ2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMFwiIH0pIH0pLCBfanN4KERpYWxvZy5UaXRsZSwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiB0aXRsZSB9KV0gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwIGRhcms6aG92ZXI6dGV4dC1ncmF5LTMwMFwiLCBcImRhdGEtY3lcIjogXCJjbG9zZS1kaWFsb2ctYnRuXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IG1lc3NhZ2UgfSksIGl0ZW1OYW1lICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTMgcC0zIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMC81MCByb3VuZGVkLW1kXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBpdGVtTmFtZSB9KSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogb25DbG9zZSwgZGlzYWJsZWQ6IGlzRGVsZXRpbmcsIFwiZGF0YS1jeVwiOiBcImNhbmNlbC1idG5cIiwgY2hpbGRyZW46IGNhbmNlbFRleHQgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIG9uQ2xpY2s6IGhhbmRsZUNvbmZpcm0sIGxvYWRpbmc6IGlzRGVsZXRpbmcsIFwiZGF0YS1jeVwiOiBcImNvbmZpcm0tZGVsZXRlLWJ0blwiLCBjaGlsZHJlbjogY29uZmlybVRleHQgfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IERlbGV0ZUNvbmZpcm1hdGlvbkRpYWxvZztcbiIsIi8qIChpZ25vcmVkKSAqLyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==