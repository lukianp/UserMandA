(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[8964],{

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

/***/ 91845:
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
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1156);
/* harmony import */ var _atoms_Checkbox__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(63683);

/**
 * Export Dialog
 * Format selection and export options for data grids
 */






const ExportDialog = ({ isOpen, onClose, onExport, availableColumns = [], defaultFormat = 'CSV', }) => {
    const [format, setFormat] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(defaultFormat);
    const [selectedColumns, setSelectedColumns] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(availableColumns);
    const [includeHeaders, setIncludeHeaders] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
    const [filename, setFilename] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(`export-${Date.now()}`);
    const [isExporting, setIsExporting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const handleSelectAll = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setSelectedColumns(availableColumns);
    }, [availableColumns]);
    const handleDeselectAll = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setSelectedColumns([]);
    }, []);
    const toggleColumn = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((column) => {
        setSelectedColumns(prev => prev.includes(column)
            ? prev.filter(c => c !== column)
            : [...prev, column]);
    }, []);
    const handleExport = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
        setIsExporting(true);
        try {
            await onExport({
                format,
                selectedColumns,
                includeHeaders,
                filename,
            });
            onClose();
        }
        catch (error) {
            console.error('Export failed:', error);
        }
        finally {
            setIsExporting(false);
        }
    }, [format, selectedColumns, includeHeaders, filename, onExport, onClose]);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: onClose, className: "relative z-50", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Export Data" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", "data-cy": "close-dialog-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "px-6 py-4 space-y-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_5__/* .Select */ .l, { label: "Export Format", value: format, onChange: (value) => setFormat(value), options: [
                                        { value: 'CSV', label: 'CSV (Comma-Separated Values)' },
                                        { value: 'Excel', label: 'Excel Workbook (.xlsx)' },
                                        { value: 'JSON', label: 'JSON (JavaScript Object Notation)' },
                                        { value: 'PDF', label: 'PDF Document' },
                                    ], "data-cy": "format-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Filename" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: filename, onChange: (e) => setFilename(e.target.value), className: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white", "data-cy": "filename-input" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { label: "Include Headers", checked: includeHeaders, onChange: setIncludeHeaders, "data-cy": "include-headers-checkbox" }), availableColumns.length > 0 && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Columns to Export" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleSelectAll, className: "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400", "data-cy": "select-all-btn", children: "Select All" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleDeselectAll, className: "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400", "data-cy": "deselect-all-btn", children: "Deselect All" })] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-2", children: availableColumns.map((column) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Checkbox__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, { label: column, checked: selectedColumns.includes(column), onChange: () => toggleColumn(column), "data-cy": `column-checkbox-${column}` }, column))) })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: onClose, disabled: isExporting, "data-cy": "cancel-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "primary", onClick: handleExport, disabled: selectedColumns.length === 0 || !filename, loading: isExporting, icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Download */ .f5X, { className: "w-4 h-4" }), "data-cy": "export-btn", children: "Export" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ExportDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxZQUFZLHdHQUF3RyxHQUFHLHVEQUFLLFVBQVUsb0NBQW9DLHNEQUFJLGFBQWEsMEpBQTBKLEdBQUcsc0RBQUksYUFBYSxnS0FBZ0ssSUFBSSxJQUFJLEdBQUcsc0RBQUksVUFBVSx3SkFBd0osc0RBQUksQ0FBQyxnRUFBUSxJQUFJLDhIQUE4SCxPQUFPLEdBQUcsYUFBYSxJQUFJLEtBQUssR0FBRyx1REFBSyxVQUFVLHFIQUFxSCxzREFBSSxDQUFDLDBEQUFNLElBQUksNEdBQTRHLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLDRIQUE0SCxzREFBSSxDQUFDLDZEQUFRLElBQUksc0JBQXNCLGdEQUFnRCxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzdsRTtBQUNBLGlFQUFlLFlBQVksRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXEBoZWFkbGVzc3VpXFxyZWFjdFxcZGlzdFxcaG9va3N8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQ2hlY2tib3gudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvZGlhbG9ncy9FeHBvcnREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBFeHBvcnQgRGlhbG9nXG4gKiBGb3JtYXQgc2VsZWN0aW9uIGFuZCBleHBvcnQgb3B0aW9ucyBmb3IgZGF0YSBncmlkc1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgWCwgRG93bmxvYWQgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL2F0b21zL1NlbGVjdCc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vYXRvbXMvQ2hlY2tib3gnO1xuY29uc3QgRXhwb3J0RGlhbG9nID0gKHsgaXNPcGVuLCBvbkNsb3NlLCBvbkV4cG9ydCwgYXZhaWxhYmxlQ29sdW1ucyA9IFtdLCBkZWZhdWx0Rm9ybWF0ID0gJ0NTVicsIH0pID0+IHtcbiAgICBjb25zdCBbZm9ybWF0LCBzZXRGb3JtYXRdID0gdXNlU3RhdGUoZGVmYXVsdEZvcm1hdCk7XG4gICAgY29uc3QgW3NlbGVjdGVkQ29sdW1ucywgc2V0U2VsZWN0ZWRDb2x1bW5zXSA9IHVzZVN0YXRlKGF2YWlsYWJsZUNvbHVtbnMpO1xuICAgIGNvbnN0IFtpbmNsdWRlSGVhZGVycywgc2V0SW5jbHVkZUhlYWRlcnNdID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2ZpbGVuYW1lLCBzZXRGaWxlbmFtZV0gPSB1c2VTdGF0ZShgZXhwb3J0LSR7RGF0ZS5ub3coKX1gKTtcbiAgICBjb25zdCBbaXNFeHBvcnRpbmcsIHNldElzRXhwb3J0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBoYW5kbGVTZWxlY3RBbGwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkQ29sdW1ucyhhdmFpbGFibGVDb2x1bW5zKTtcbiAgICB9LCBbYXZhaWxhYmxlQ29sdW1uc10pO1xuICAgIGNvbnN0IGhhbmRsZURlc2VsZWN0QWxsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZENvbHVtbnMoW10pO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCB0b2dnbGVDb2x1bW4gPSB1c2VDYWxsYmFjaygoY29sdW1uKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkQ29sdW1ucyhwcmV2ID0+IHByZXYuaW5jbHVkZXMoY29sdW1uKVxuICAgICAgICAgICAgPyBwcmV2LmZpbHRlcihjID0+IGMgIT09IGNvbHVtbilcbiAgICAgICAgICAgIDogWy4uLnByZXYsIGNvbHVtbl0pO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzRXhwb3J0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgb25FeHBvcnQoe1xuICAgICAgICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENvbHVtbnMsXG4gICAgICAgICAgICAgICAgaW5jbHVkZUhlYWRlcnMsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9uQ2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNFeHBvcnRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2Zvcm1hdCwgc2VsZWN0ZWRDb2x1bW5zLCBpbmNsdWRlSGVhZGVycywgZmlsZW5hbWUsIG9uRXhwb3J0LCBvbkNsb3NlXSk7XG4gICAgcmV0dXJuIChfanN4cyhEaWFsb2csIHsgb3BlbjogaXNPcGVuLCBvbkNsb3NlOiBvbkNsb3NlLCBjbGFzc05hbWU6IFwicmVsYXRpdmUgei01MFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay8zMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00XCIsIGNoaWxkcmVuOiBfanN4cyhEaWFsb2cuUGFuZWwsIHsgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWF4LXctbWQgdy1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiRXhwb3J0IERhdGFcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIsIFwiZGF0YS1jeVwiOiBcImNsb3NlLWRpYWxvZy1idG5cIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHgtNiBweS00IHNwYWNlLXktNFwiLCBjaGlsZHJlbjogW19qc3goU2VsZWN0LCB7IGxhYmVsOiBcIkV4cG9ydCBGb3JtYXRcIiwgdmFsdWU6IGZvcm1hdCwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0Rm9ybWF0KHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdDU1YnLCBsYWJlbDogJ0NTViAoQ29tbWEtU2VwYXJhdGVkIFZhbHVlcyknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0V4Y2VsJywgbGFiZWw6ICdFeGNlbCBXb3JrYm9vayAoLnhsc3gpJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdKU09OJywgbGFiZWw6ICdKU09OIChKYXZhU2NyaXB0IE9iamVjdCBOb3RhdGlvbiknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1BERicsIGxhYmVsOiAnUERGIERvY3VtZW50JyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwiZm9ybWF0LXNlbGVjdFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgbWItMlwiLCBjaGlsZHJlbjogXCJGaWxlbmFtZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGZpbGVuYW1lLCBvbkNoYW5nZTogKGUpID0+IHNldEZpbGVuYW1lKGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInctZnVsbCBweC0zIHB5LTIgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgXCJkYXRhLWN5XCI6IFwiZmlsZW5hbWUtaW5wdXRcIiB9KV0gfSksIF9qc3goQ2hlY2tib3gsIHsgbGFiZWw6IFwiSW5jbHVkZSBIZWFkZXJzXCIsIGNoZWNrZWQ6IGluY2x1ZGVIZWFkZXJzLCBvbkNoYW5nZTogc2V0SW5jbHVkZUhlYWRlcnMsIFwiZGF0YS1jeVwiOiBcImluY2x1ZGUtaGVhZGVycy1jaGVja2JveFwiIH0pLCBhdmFpbGFibGVDb2x1bW5zLmxlbmd0aCA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnMgdG8gRXhwb3J0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlU2VsZWN0QWxsLCBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWJsdWUtNjAwIGhvdmVyOnRleHQtYmx1ZS03MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIsIFwiZGF0YS1jeVwiOiBcInNlbGVjdC1hbGwtYnRuXCIsIGNoaWxkcmVuOiBcIlNlbGVjdCBBbGxcIiB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGhhbmRsZURlc2VsZWN0QWxsLCBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWJsdWUtNjAwIGhvdmVyOnRleHQtYmx1ZS03MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIsIFwiZGF0YS1jeVwiOiBcImRlc2VsZWN0LWFsbC1idG5cIiwgY2hpbGRyZW46IFwiRGVzZWxlY3QgQWxsXCIgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYXgtaC00OCBvdmVyZmxvdy15LWF1dG8gYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCByb3VuZGVkLW1kIHAtMyBzcGFjZS15LTJcIiwgY2hpbGRyZW46IGF2YWlsYWJsZUNvbHVtbnMubWFwKChjb2x1bW4pID0+IChfanN4KENoZWNrYm94LCB7IGxhYmVsOiBjb2x1bW4sIGNoZWNrZWQ6IHNlbGVjdGVkQ29sdW1ucy5pbmNsdWRlcyhjb2x1bW4pLCBvbkNoYW5nZTogKCkgPT4gdG9nZ2xlQ29sdW1uKGNvbHVtbiksIFwiZGF0YS1jeVwiOiBgY29sdW1uLWNoZWNrYm94LSR7Y29sdW1ufWAgfSwgY29sdW1uKSkpIH0pXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogb25DbG9zZSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJjYW5jZWwtYnRuXCIsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlRXhwb3J0LCBkaXNhYmxlZDogc2VsZWN0ZWRDb2x1bW5zLmxlbmd0aCA9PT0gMCB8fCAhZmlsZW5hbWUsIGxvYWRpbmc6IGlzRXhwb3J0aW5nLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEV4cG9ydERpYWxvZztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==