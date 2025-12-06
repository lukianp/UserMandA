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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMzg0NC5hMmZkYjQ5MWNkZWM2ZmNlOTE4MC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBK0Q7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDMEI7QUFDaUI7QUFDSztBQUNQO0FBQ3pDLG9DQUFvQyx3TUFBd007QUFDNU8sd0NBQXdDLDJDQUFjO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1REFBSyxDQUFDLCtEQUFNLElBQUksdUVBQXVFLHNEQUFJLFVBQVUsK0RBQStELEdBQUcsc0RBQUksVUFBVSwyRUFBMkUsdURBQUssQ0FBQywrREFBTSxVQUFVLGdHQUFnRyx1REFBSyxVQUFVLG1IQUFtSCx1REFBSyxVQUFVLGlEQUFpRCxzREFBSSxVQUFVLHVFQUF1RSxzREFBSSxDQUFDLGtFQUFhLElBQUkscURBQXFELEdBQUcsR0FBRyxzREFBSSxDQUFDLCtEQUFNLFVBQVUsbUZBQW1GLElBQUksR0FBRyxzREFBSSxhQUFhLG9JQUFvSSxzREFBSSxDQUFDLDJDQUFDLElBQUksc0JBQXNCLEdBQUcsSUFBSSxHQUFHLHVEQUFLLFVBQVUsbUNBQW1DLHNEQUFJLFFBQVEsMEVBQTBFLGdCQUFnQixzREFBSSxVQUFVLDJFQUEyRSxzREFBSSxRQUFRLG9GQUFvRixHQUFHLEtBQUssR0FBRyx1REFBSyxVQUFVLHFIQUFxSCxzREFBSSxDQUFDLDBEQUFNLElBQUksNkdBQTZHLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLHdIQUF3SCxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzd3RDtBQUNBLGlFQUFlLHdCQUF3QixFQUFDOzs7Ozs7OztBQzFCeEMsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZGlhbG9ncy9EZWxldGVDb25maXJtYXRpb25EaWFsb2cudHN4Iiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogRGVsZXRlIENvbmZpcm1hdGlvbiBEaWFsb2dcbiAqIFJldXNhYmxlIGNvbmZpcm1hdGlvbiBtb2RhbCBmb3IgZGVzdHJ1Y3RpdmUgYWN0aW9uc1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgQWxlcnRUcmlhbmdsZSwgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuY29uc3QgRGVsZXRlQ29uZmlybWF0aW9uRGlhbG9nID0gKHsgaXNPcGVuLCBvbkNsb3NlLCBvbkNvbmZpcm0sIHRpdGxlID0gJ0NvbmZpcm0gRGVsZXRpb24nLCBtZXNzYWdlID0gJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyBpdGVtPyBUaGlzIGFjdGlvbiBjYW5ub3QgYmUgdW5kb25lLicsIGNvbmZpcm1UZXh0ID0gJ0RlbGV0ZScsIGNhbmNlbFRleHQgPSAnQ2FuY2VsJywgaXRlbU5hbWUsIH0pID0+IHtcbiAgICBjb25zdCBbaXNEZWxldGluZywgc2V0SXNEZWxldGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgaGFuZGxlQ29uZmlybSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNEZWxldGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG9uQ29uZmlybSgpO1xuICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRGVsZXRlIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0RlbGV0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhEaWFsb2csIHsgb3BlbjogaXNPcGVuLCBvbkNsb3NlOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicmVsYXRpdmUgei01MFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay8zMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhEaWFsb2cuUGFuZWwsIHsgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWF4LXctbWQgdy1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTIgYmctcmVkLTEwMCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4KEFsZXJ0VHJpYW5nbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwXCIgfSkgfSksIF9qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHRpdGxlIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIsIFwiZGF0YS1jeVwiOiBcImNsb3NlLWRpYWxvZy1idG5cIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbWVzc2FnZSB9KSwgaXRlbU5hbWUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtMyBwLTMgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwLzUwIHJvdW5kZWQtbWRcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGl0ZW1OYW1lIH0pIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0yIGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBvbkNsb3NlLCBkaXNhYmxlZDogaXNEZWxldGluZywgXCJkYXRhLWN5XCI6IFwiY2FuY2VsLWJ0blwiLCBjaGlsZHJlbjogY2FuY2VsVGV4dCB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJkYW5nZXJcIiwgb25DbGljazogaGFuZGxlQ29uZmlybSwgbG9hZGluZzogaXNEZWxldGluZywgXCJkYXRhLWN5XCI6IFwiY29uZmlybS1kZWxldGUtYnRuXCIsIGNoaWxkcmVuOiBjb25maXJtVGV4dCB9KV0gfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRGVsZXRlQ29uZmlybWF0aW9uRGlhbG9nO1xuIiwiLyogKGlnbm9yZWQpICovIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9