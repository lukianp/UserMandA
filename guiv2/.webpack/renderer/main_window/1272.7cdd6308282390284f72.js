(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1272],{

/***/ 21104:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 63683:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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


/***/ }),

/***/ 76553:
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
/* harmony import */ var _atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(63683);

/**
 * Column Visibility Dialog
 * Toggle visibility of data grid columns
 */





const ColumnVisibilityDialog = ({ isOpen, onClose, columns, onApply, }) => {
    const [visibleColumns, setVisibleColumns] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(new Set(columns.filter(c => c.visible).map(c => c.id)));
    const toggleColumn = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((columnId) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(columnId)) {
                next.delete(columnId);
            }
            else {
                next.add(columnId);
            }
            return next;
        });
    }, []);
    const handleShowAll = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setVisibleColumns(new Set(columns.map(c => c.id)));
    }, [columns]);
    const handleHideAll = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setVisibleColumns(new Set());
    }, []);
    const handleApply = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        onApply(Array.from(visibleColumns));
        onClose();
    }, [visibleColumns, onApply, onClose]);
    const handleReset = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setVisibleColumns(new Set(columns.filter(c => c.visible).map(c => c.id)));
    }, [columns]);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: onClose, className: "relative z-50", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Eye */ .kU3, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Column Visibility" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "data-cy": "close-dialog-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [visibleColumns.size, " of ", columns.length, " columns visible"] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleShowAll, className: "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400", "data-cy": "show-all-btn", children: "Show All" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleHideAll, className: "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400", "data-cy": "hide-all-btn", children: "Hide All" })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "max-h-96 overflow-y-auto space-y-2", children: columns.map((column) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { label: column.label, checked: visibleColumns.has(column.id), onChange: () => toggleColumn(column.id), "data-cy": `column-toggle-${column.id}` }, column.id))) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: handleReset, "data-cy": "reset-btn", children: "Reset" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: onClose, "data-cy": "cancel-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "primary", onClick: handleApply, "data-cy": "apply-btn", children: "Apply" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ColumnVisibilityDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RkFBcUYsSUFBSSxJQUFJLEdBQUcsSUFBSTtBQUN0MEU7QUFDQSxpRUFBZSxzQkFBc0IsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXEBoZWFkbGVzc3VpXFxyZWFjdFxcZGlzdFxcaG9va3N8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZGlhbG9ncy9Db2x1bW5WaXNpYmlsaXR5RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqXG4gKiBGdWxseSBhY2Nlc3NpYmxlIGNoZWNrYm94IGNvbXBvbmVudCB3aXRoIGxhYmVscyBhbmQgZXJyb3Igc3RhdGVzLlxuICogRm9sbG93cyBXQ0FHIDIuMSBBQSBndWlkZWxpbmVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlSWQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGVjayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQ2hlY2tib3ggPSAoeyBsYWJlbCwgZGVzY3JpcHRpb24sIGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGVycm9yLCBkaXNhYmxlZCA9IGZhbHNlLCBpbmRldGVybWluYXRlID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBpZCA9IHVzZUlkKCk7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lkfS1lcnJvcmA7XG4gICAgY29uc3QgZGVzY3JpcHRpb25JZCA9IGAke2lkfS1kZXNjcmlwdGlvbmA7XG4gICAgY29uc3QgaGFzRXJyb3IgPSBCb29sZWFuKGVycm9yKTtcbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgaW5kZXRlcm1pbmF0ZSB2aWEgcmVmXG4gICAgY29uc3QgY2hlY2tib3hSZWYgPSBSZWFjdC51c2VSZWYobnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKGNoZWNrYm94UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGNoZWNrYm94UmVmLmN1cnJlbnQuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9LCBbaW5kZXRlcm1pbmF0ZV0pO1xuICAgIGNvbnN0IGNoZWNrYm94Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaC01IHctNSByb3VuZGVkIGJvcmRlci0yJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGFyazpyaW5nLW9mZnNldC1ncmF5LTkwMCcsIFxuICAgIC8vIFN0YXRlLWJhc2VkIHN0eWxlc1xuICAgIHtcbiAgICAgICAgLy8gTm9ybWFsIHN0YXRlICh1bmNoZWNrZWQpXG4gICAgICAgICdib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS01MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQgJiYgIWNoZWNrZWQsXG4gICAgICAgICdmb2N1czpyaW5nLWJsdWUtNTAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gQ2hlY2tlZCBzdGF0ZVxuICAgICAgICAnYmctYmx1ZS02MDAgYm9yZGVyLWJsdWUtNjAwIGRhcms6YmctYmx1ZS01MDAgZGFyazpib3JkZXItYmx1ZS01MDAnOiBjaGVja2VkICYmICFkaXNhYmxlZCAmJiAhaGFzRXJyb3IsXG4gICAgICAgIC8vIEVycm9yIHN0YXRlXG4gICAgICAgICdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC02MDAgZGFyazpib3JkZXItcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctcmVkLTUwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgLy8gRGlzYWJsZWQgc3RhdGVcbiAgICAgICAgJ2JvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBiZy1ncmF5LTEwMCBkYXJrOmJnLWdyYXktODAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ3RleHQtc20gZm9udC1tZWRpdW0nLCB7XG4gICAgICAgICd0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LXJlZC03MDAgZGFyazp0ZXh0LXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTUwMCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wnLCBjbGFzc05hbWUpLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBoLTVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGNoZWNrYm94UmVmLCBpZDogaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogY2hlY2tlZCwgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IFwic3Itb25seSBwZWVyXCIsIFwiYXJpYS1pbnZhbGlkXCI6IGhhc0Vycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXJyb3JJZF06IGhhc0Vycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rlc2NyaXB0aW9uSWRdOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSksIF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGNoZWNrYm94Q2xhc3NlcywgJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1wb2ludGVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgY2hpbGRyZW46IFtjaGVja2VkICYmICFpbmRldGVybWluYXRlICYmIChfanN4KENoZWNrLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00IHRleHQtd2hpdGVcIiwgc3Ryb2tlV2lkdGg6IDMgfSkpLCBpbmRldGVybWluYXRlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMC41IHctMyBiZy13aGl0ZSByb3VuZGVkXCIgfSkpXSB9KV0gfSksIChsYWJlbCB8fCBkZXNjcmlwdGlvbikgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1sLTNcIiwgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChsYWJlbENsYXNzZXMsICdjdXJzb3ItcG9pbnRlcicpLCBjaGlsZHJlbjogbGFiZWwgfSkpLCBkZXNjcmlwdGlvbiAmJiAoX2pzeChcInBcIiwgeyBpZDogZGVzY3JpcHRpb25JZCwgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMC41XCIsIGNoaWxkcmVuOiBkZXNjcmlwdGlvbiB9KSldIH0pKV0gfSksIGhhc0Vycm9yICYmIChfanN4KFwicFwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IFwibXQtMSBtbC04IHRleHQtc20gdGV4dC1yZWQtNjAwXCIsIHJvbGU6IFwiYWxlcnRcIiwgXCJhcmlhLWxpdmVcIjogXCJwb2xpdGVcIiwgY2hpbGRyZW46IGVycm9yIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENoZWNrYm94O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ29sdW1uIFZpc2liaWxpdHkgRGlhbG9nXG4gKiBUb2dnbGUgdmlzaWJpbGl0eSBvZiBkYXRhIGdyaWQgY29sdW1uc1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgWCwgRXllIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vYXRvbXMvQ2hlY2tib3gnO1xuY29uc3QgQ29sdW1uVmlzaWJpbGl0eURpYWxvZyA9ICh7IGlzT3Blbiwgb25DbG9zZSwgY29sdW1ucywgb25BcHBseSwgfSkgPT4ge1xuICAgIGNvbnN0IFt2aXNpYmxlQ29sdW1ucywgc2V0VmlzaWJsZUNvbHVtbnNdID0gdXNlU3RhdGUobmV3IFNldChjb2x1bW5zLmZpbHRlcihjID0+IGMudmlzaWJsZSkubWFwKGMgPT4gYy5pZCkpKTtcbiAgICBjb25zdCB0b2dnbGVDb2x1bW4gPSB1c2VDYWxsYmFjaygoY29sdW1uSWQpID0+IHtcbiAgICAgICAgc2V0VmlzaWJsZUNvbHVtbnMocHJldiA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KTtcbiAgICAgICAgICAgIGlmIChuZXh0Lmhhcyhjb2x1bW5JZCkpIHtcbiAgICAgICAgICAgICAgICBuZXh0LmRlbGV0ZShjb2x1bW5JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0LmFkZChjb2x1bW5JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGhhbmRsZVNob3dBbGwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoY29sdW1ucy5tYXAoYyA9PiBjLmlkKSkpO1xuICAgIH0sIFtjb2x1bW5zXSk7XG4gICAgY29uc3QgaGFuZGxlSGlkZUFsbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0VmlzaWJsZUNvbHVtbnMobmV3IFNldCgpKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgaGFuZGxlQXBwbHkgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIG9uQXBwbHkoQXJyYXkuZnJvbSh2aXNpYmxlQ29sdW1ucykpO1xuICAgICAgICBvbkNsb3NlKCk7XG4gICAgfSwgW3Zpc2libGVDb2x1bW5zLCBvbkFwcGx5LCBvbkNsb3NlXSk7XG4gICAgY29uc3QgaGFuZGxlUmVzZXQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFZpc2libGVDb2x1bW5zKG5ldyBTZXQoY29sdW1ucy5maWx0ZXIoYyA9PiBjLnZpc2libGUpLm1hcChjID0+IGMuaWQpKSk7XG4gICAgfSwgW2NvbHVtbnNdKTtcbiAgICByZXR1cm4gKF9qc3hzKERpYWxvZywgeyBvcGVuOiBpc09wZW4sIG9uQ2xvc2U6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy1tZCB3LWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy14bFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEV5ZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KERpYWxvZy5UaXRsZSwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbG9zZSwgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCBkYXJrOmhvdmVyOnRleHQtZ3JheS0zMDBcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtZGlhbG9nLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItM1wiLCBjaGlsZHJlbjogW19qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbdmlzaWJsZUNvbHVtbnMuc2l6ZSwgXCIgb2YgXCIsIGNvbHVtbnMubGVuZ3RoLCBcIiBjb2x1bW5zIHZpc2libGVcIl0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlU2hvd0FsbCwgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ibHVlLTYwMCBob3Zlcjp0ZXh0LWJsdWUtNzAwIGRhcms6dGV4dC1ibHVlLTQwMFwiLCBcImRhdGEtY3lcIjogXCJzaG93LWFsbC1idG5cIiwgY2hpbGRyZW46IFwiU2hvdyBBbGxcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGhhbmRsZUhpZGVBbGwsIGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtYmx1ZS02MDAgaG92ZXI6dGV4dC1ibHVlLTcwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgXCJkYXRhLWN5XCI6IFwiaGlkZS1hbGwtYnRuXCIsIGNoaWxkcmVuOiBcIkhpZGUgQWxsXCIgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYXgtaC05NiBvdmVyZmxvdy15LWF1dG8gc3BhY2UteS0yXCIsIGNoaWxkcmVuOiBjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoX2pzeChDaGVja2JveCwgeyBsYWJlbDogY29sdW1uLmxhYmVsLCBjaGVja2VkOiB2aXNpYmxlQ29sdW1ucy5oYXMoY29sdW1uLmlkKSwgb25DaGFuZ2U6ICgpID0+IHRvZ2dsZUNvbHVtbihjb2x1bW4uaWQpLCBcImRhdGEtY3lcIjogYGNvbHVtbi10b2dnbGUtJHtjb2x1bW4uaWR9YCB9LCBjb2x1bW4uaWQpKSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlUmVzZXQsIFwiZGF0YS1jeVwiOiBcInJlc2V0LWJ0blwiLCBjaGlsZHJlbjogXCJSZXNldFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBvbkNsb3NlLCBcImRhdGEtY3lcIjogXCJjYW5jZWwtYnRuXCIsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlQXBwbHksIFwiZGF0YS1jeVwiOiBcImFwcGx5LWJ0blwiLCBjaGlsZHJlbjogXCJBcHBseVwiIH0pXSB9KV0gfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDb2x1bW5WaXNpYmlsaXR5RGlhbG9nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9