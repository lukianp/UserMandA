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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SSxZQUFZLHdHQUF3RyxHQUFHLHVEQUFLLFVBQVUsb0NBQW9DLHNEQUFJLGFBQWEsMEpBQTBKLEdBQUcsc0RBQUksYUFBYSxnS0FBZ0ssSUFBSSxJQUFJLEdBQUcsc0RBQUksVUFBVSx3SkFBd0osc0RBQUksQ0FBQyxnRUFBUSxJQUFJLDhIQUE4SCxPQUFPLEdBQUcsYUFBYSxJQUFJLEtBQUssR0FBRyx1REFBSyxVQUFVLHFIQUFxSCxzREFBSSxDQUFDLDBEQUFNLElBQUksNEdBQTRHLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLDRIQUE0SCxzREFBSSxDQUFDLDZEQUFRLElBQUksc0JBQXNCLGdEQUFnRCxJQUFJLElBQUksR0FBRyxJQUFJO0FBQzdsRTtBQUNBLGlFQUFlLFlBQVksRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0V4cG9ydERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKlxuICogRnVsbHkgYWNjZXNzaWJsZSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBsYWJlbHMgYW5kIGVycm9yIHN0YXRlcy5cbiAqIEZvbGxvd3MgV0NBRyAyLjEgQUEgZ3VpZGVsaW5lcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUlkIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQ2hlY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IENoZWNrYm94ID0gKHsgbGFiZWwsIGRlc2NyaXB0aW9uLCBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBlcnJvciwgZGlzYWJsZWQgPSBmYWxzZSwgaW5kZXRlcm1pbmF0ZSA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgaWQgPSB1c2VJZCgpO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpZH0tZXJyb3JgO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uSWQgPSBgJHtpZH0tZGVzY3JpcHRpb25gO1xuICAgIGNvbnN0IGhhc0Vycm9yID0gQm9vbGVhbihlcnJvcik7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIGluZGV0ZXJtaW5hdGUgdmlhIHJlZlxuICAgIGNvbnN0IGNoZWNrYm94UmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjaGVja2JveFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjaGVja2JveFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBpbmRldGVybWluYXRlO1xuICAgICAgICB9XG4gICAgfSwgW2luZGV0ZXJtaW5hdGVdKTtcbiAgICBjb25zdCBjaGVja2JveENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2gtNSB3LTUgcm91bmRlZCBib3JkZXItMicsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rhcms6cmluZy1vZmZzZXQtZ3JheS05MDAnLCBcbiAgICAvLyBTdGF0ZS1iYXNlZCBzdHlsZXNcbiAgICB7XG4gICAgICAgIC8vIE5vcm1hbCBzdGF0ZSAodW5jaGVja2VkKVxuICAgICAgICAnYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNTAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkICYmICFjaGVja2VkLFxuICAgICAgICAnZm9jdXM6cmluZy1ibHVlLTUwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIENoZWNrZWQgc3RhdGVcbiAgICAgICAgJ2JnLWJsdWUtNjAwIGJvcmRlci1ibHVlLTYwMCBkYXJrOmJnLWJsdWUtNTAwIGRhcms6Ym9yZGVyLWJsdWUtNTAwJzogY2hlY2tlZCAmJiAhZGlzYWJsZWQgJiYgIWhhc0Vycm9yLFxuICAgICAgICAvLyBFcnJvciBzdGF0ZVxuICAgICAgICAnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtNjAwIGRhcms6Ym9yZGVyLXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICdmb2N1czpyaW5nLXJlZC01MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIERpc2FibGVkIHN0YXRlXG4gICAgICAgICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS02MDAgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCd0ZXh0LXNtIGZvbnQtbWVkaXVtJywge1xuICAgICAgICAndGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS01MDAnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGZsZXgtY29sJywgY2xhc3NOYW1lKSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgaC01XCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgcmVmOiBjaGVja2JveFJlZiwgaWQ6IGlkLCB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGNoZWNrZWQsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBcInNyLW9ubHkgcGVlclwiLCBcImFyaWEtaW52YWxpZFwiOiBoYXNFcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Vycm9ySWRdOiBoYXNFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbklkXTogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pLCBfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChjaGVja2JveENsYXNzZXMsICdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItcG9pbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIGNoaWxkcmVuOiBbY2hlY2tlZCAmJiAhaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChDaGVjaywgeyBjbGFzc05hbWU6IFwiaC00IHctNCB0ZXh0LXdoaXRlXCIsIHN0cm9rZVdpZHRoOiAzIH0pKSwgaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTAuNSB3LTMgYmctd2hpdGUgcm91bmRlZFwiIH0pKV0gfSldIH0pLCAobGFiZWwgfHwgZGVzY3JpcHRpb24pICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtbC0zXCIsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3goXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3gobGFiZWxDbGFzc2VzLCAnY3Vyc29yLXBvaW50ZXInKSwgY2hpbGRyZW46IGxhYmVsIH0pKSwgZGVzY3JpcHRpb24gJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGRlc2NyaXB0aW9uSWQsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTAuNVwiLCBjaGlsZHJlbjogZGVzY3JpcHRpb24gfSkpXSB9KSldIH0pLCBoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBcIm10LTEgbWwtOCB0ZXh0LXNtIHRleHQtcmVkLTYwMFwiLCByb2xlOiBcImFsZXJ0XCIsIFwiYXJpYS1saXZlXCI6IFwicG9saXRlXCIsIGNoaWxkcmVuOiBlcnJvciB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDaGVja2JveDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEV4cG9ydCBEaWFsb2dcbiAqIEZvcm1hdCBzZWxlY3Rpb24gYW5kIGV4cG9ydCBvcHRpb25zIGZvciBkYXRhIGdyaWRzXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICdAaGVhZGxlc3N1aS9yZWFjdCc7XG5pbXBvcnQgeyBYLCBEb3dubG9hZCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vYXRvbXMvU2VsZWN0JztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi9hdG9tcy9DaGVja2JveCc7XG5jb25zdCBFeHBvcnREaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIG9uRXhwb3J0LCBhdmFpbGFibGVDb2x1bW5zID0gW10sIGRlZmF1bHRGb3JtYXQgPSAnQ1NWJywgfSkgPT4ge1xuICAgIGNvbnN0IFtmb3JtYXQsIHNldEZvcm1hdF0gPSB1c2VTdGF0ZShkZWZhdWx0Rm9ybWF0KTtcbiAgICBjb25zdCBbc2VsZWN0ZWRDb2x1bW5zLCBzZXRTZWxlY3RlZENvbHVtbnNdID0gdXNlU3RhdGUoYXZhaWxhYmxlQ29sdW1ucyk7XG4gICAgY29uc3QgW2luY2x1ZGVIZWFkZXJzLCBzZXRJbmNsdWRlSGVhZGVyc10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbZmlsZW5hbWUsIHNldEZpbGVuYW1lXSA9IHVzZVN0YXRlKGBleHBvcnQtJHtEYXRlLm5vdygpfWApO1xuICAgIGNvbnN0IFtpc0V4cG9ydGluZywgc2V0SXNFeHBvcnRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGhhbmRsZVNlbGVjdEFsbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRDb2x1bW5zKGF2YWlsYWJsZUNvbHVtbnMpO1xuICAgIH0sIFthdmFpbGFibGVDb2x1bW5zXSk7XG4gICAgY29uc3QgaGFuZGxlRGVzZWxlY3RBbGwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkQ29sdW1ucyhbXSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHRvZ2dsZUNvbHVtbiA9IHVzZUNhbGxiYWNrKChjb2x1bW4pID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRDb2x1bW5zKHByZXYgPT4gcHJldi5pbmNsdWRlcyhjb2x1bW4pXG4gICAgICAgICAgICA/IHByZXYuZmlsdGVyKGMgPT4gYyAhPT0gY29sdW1uKVxuICAgICAgICAgICAgOiBbLi4ucHJldiwgY29sdW1uXSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNFeHBvcnRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBvbkV4cG9ydCh7XG4gICAgICAgICAgICAgICAgZm9ybWF0LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29sdW1ucyxcbiAgICAgICAgICAgICAgICBpbmNsdWRlSGVhZGVycyxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwb3J0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0V4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbZm9ybWF0LCBzZWxlY3RlZENvbHVtbnMsIGluY2x1ZGVIZWFkZXJzLCBmaWxlbmFtZSwgb25FeHBvcnQsIG9uQ2xvc2VdKTtcbiAgICByZXR1cm4gKF9qc3hzKERpYWxvZywgeyBvcGVuOiBpc09wZW4sIG9uQ2xvc2U6IG9uQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy1tZCB3LWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy14bFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChEaWFsb2cuVGl0bGUsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJFeHBvcnQgRGF0YVwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogb25DbG9zZSwgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCBkYXJrOmhvdmVyOnRleHQtZ3JheS0zMDBcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtZGlhbG9nLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC02IHB5LTQgc3BhY2UteS00XCIsIGNoaWxkcmVuOiBbX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiRXhwb3J0IEZvcm1hdFwiLCB2YWx1ZTogZm9ybWF0LCBvbkNoYW5nZTogKHZhbHVlKSA9PiBzZXRGb3JtYXQodmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0NTVicsIGxhYmVsOiAnQ1NWIChDb21tYS1TZXBhcmF0ZWQgVmFsdWVzKScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnRXhjZWwnLCBsYWJlbDogJ0V4Y2VsIFdvcmtib29rICgueGxzeCknIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0pTT04nLCBsYWJlbDogJ0pTT04gKEphdmFTY3JpcHQgT2JqZWN0IE5vdGF0aW9uKScgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnUERGJywgbGFiZWw6ICdQREYgRG9jdW1lbnQnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCBcImRhdGEtY3lcIjogXCJmb3JtYXQtc2VsZWN0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBtYi0yXCIsIGNoaWxkcmVuOiBcIkZpbGVuYW1lXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogZmlsZW5hbWUsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0RmlsZW5hbWUoZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwidy1mdWxsIHB4LTMgcHktMiBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBcImRhdGEtY3lcIjogXCJmaWxlbmFtZS1pbnB1dFwiIH0pXSB9KSwgX2pzeChDaGVja2JveCwgeyBsYWJlbDogXCJJbmNsdWRlIEhlYWRlcnNcIiwgY2hlY2tlZDogaW5jbHVkZUhlYWRlcnMsIG9uQ2hhbmdlOiBzZXRJbmNsdWRlSGVhZGVycywgXCJkYXRhLWN5XCI6IFwiaW5jbHVkZS1oZWFkZXJzLWNoZWNrYm94XCIgfSksIGF2YWlsYWJsZUNvbHVtbnMubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IFwiQ29sdW1ucyB0byBFeHBvcnRcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBoYW5kbGVTZWxlY3RBbGwsIGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtYmx1ZS02MDAgaG92ZXI6dGV4dC1ibHVlLTcwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgXCJkYXRhLWN5XCI6IFwic2VsZWN0LWFsbC1idG5cIiwgY2hpbGRyZW46IFwiU2VsZWN0IEFsbFwiIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogaGFuZGxlRGVzZWxlY3RBbGwsIGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtYmx1ZS02MDAgaG92ZXI6dGV4dC1ibHVlLTcwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgXCJkYXRhLWN5XCI6IFwiZGVzZWxlY3QtYWxsLWJ0blwiLCBjaGlsZHJlbjogXCJEZXNlbGVjdCBBbGxcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1heC1oLTQ4IG92ZXJmbG93LXktYXV0byBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHJvdW5kZWQtbWQgcC0zIHNwYWNlLXktMlwiLCBjaGlsZHJlbjogYXZhaWxhYmxlQ29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKF9qc3goQ2hlY2tib3gsIHsgbGFiZWw6IGNvbHVtbiwgY2hlY2tlZDogc2VsZWN0ZWRDb2x1bW5zLmluY2x1ZGVzKGNvbHVtbiksIG9uQ2hhbmdlOiAoKSA9PiB0b2dnbGVDb2x1bW4oY29sdW1uKSwgXCJkYXRhLWN5XCI6IGBjb2x1bW4tY2hlY2tib3gtJHtjb2x1bW59YCB9LCBjb2x1bW4pKSkgfSldIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0yIGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBvbkNsb3NlLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImNhbmNlbC1idG5cIiwgY2hpbGRyZW46IFwiQ2FuY2VsXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiBoYW5kbGVFeHBvcnQsIGRpc2FibGVkOiBzZWxlY3RlZENvbHVtbnMubGVuZ3RoID09PSAwIHx8ICFmaWxlbmFtZSwgbG9hZGluZzogaXNFeHBvcnRpbmcsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KV0gfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRXhwb3J0RGlhbG9nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9