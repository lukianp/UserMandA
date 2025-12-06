(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7773],{

/***/ 21104:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 74560:
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

/**
 * Import Dialog Component
 * File upload/drop zone with format selection and data preview
 */





/**
 * Import Dialog Component
 */
const ImportDialog = ({ isOpen, onClose, onImport, formats = [
    { value: 'csv', label: 'CSV', extensions: ['.csv'] },
    { value: 'json', label: 'JSON', extensions: ['.json'] },
    { value: 'excel', label: 'Excel', extensions: ['.xlsx', '.xls'] },
], showPreview = true, 'data-cy': dataCy = 'import-dialog', }) => {
    const [selectedFile, setSelectedFile] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [selectedFormat, setSelectedFormat] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(formats[0]?.value || '');
    const [isDragging, setIsDragging] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [isImporting, setIsImporting] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const [previewData, setPreviewData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const fileInputRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const handleDragOver = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const validateFile = (file) => {
        const format = formats.find((f) => f.value === selectedFormat);
        if (!format)
            return false;
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!format.extensions.includes(extension)) {
            setError(`Invalid file type. Expected: ${format.extensions.join(', ')}`);
            return false;
        }
        // Max file size: 50MB
        if (file.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit');
            return false;
        }
        setError('');
        return true;
    };
    const loadPreview = async (file) => {
        if (!showPreview)
            return;
        try {
            const text = await file.text();
            // Show first 500 characters as preview
            setPreviewData(text.substring(0, 500));
        }
        catch (err) {
            console.error('Failed to load preview:', err);
        }
    };
    const handleFileSelect = (file) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            loadPreview(file);
        }
    };
    const handleDrop = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [selectedFormat]);
    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    const handleImport = async () => {
        if (!selectedFile)
            return;
        setIsImporting(true);
        setError('');
        try {
            await onImport(selectedFile, selectedFormat);
            onClose();
            // Reset state
            setSelectedFile(null);
            setPreviewData('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Import failed');
        }
        finally {
            setIsImporting(false);
        }
    };
    const handleClose = () => {
        setSelectedFile(null);
        setPreviewData('');
        setError('');
        onClose();
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG, { open: isOpen, onClose: handleClose, className: "relative z-50", "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Panel, { className: "mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Upload */ ._OO, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__/* .Dialog */ .lG.Title, { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Import Data" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "data-cy": "close-import-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-6 space-y-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_5__/* .Select */ .l, { label: "File Format", value: selectedFormat, onChange: setSelectedFormat, options: formats, "data-cy": "import-format-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
              `, onClick: () => fileInputRef.current?.click(), "data-cy": "import-drop-zone", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: fileInputRef, type: "file", className: "hidden", onChange: handleFileInputChange, accept: formats.find((f) => f.value === selectedFormat)?.extensions.join(',') }), !selectedFile ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Upload */ ._OO, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-700 dark:text-gray-300 font-medium mb-2", children: "Drop file here or click to browse" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Supported formats: ", formats.find((f) => f.value === selectedFormat)?.extensions.join(', ')] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: "Maximum file size: 50MB" })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .CheckCircle */ .rAV, { className: "w-6 h-6 text-green-600 dark:text-green-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-left", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: selectedFile.name }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [(selectedFile.size / 1024).toFixed(2), " KB"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                        setPreviewData('');
                                                    }, className: "ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors", "data-cy": "remove-file-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error })] })), showPreview && previewData && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: "Preview" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-48 overflow-auto", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("pre", { className: "text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono", children: [previewData, previewData.length >= 500 && '\n...'] }) })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "secondary", onClick: handleClose, "data-cy": "cancel-import-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__/* .Button */ .$, { variant: "primary", onClick: handleImport, disabled: !selectedFile || isImporting, loading: isImporting, "data-cy": "import-btn", children: "Import" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImportDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLFVBQVUsK0dBQStHLHNEQUFJLENBQUMsMERBQU0sSUFBSSxnR0FBZ0csR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUksc0pBQXNKLElBQUksSUFBSSxHQUFHLElBQUk7QUFDMytDO0FBQ0EsaUVBQWUsWUFBWSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxAaGVhZGxlc3N1aVxccmVhY3RcXGRpc3RcXGhvb2tzfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2RpYWxvZ3MvSW1wb3J0RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cywgRnJhZ21lbnQgYXMgX0ZyYWdtZW50IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEltcG9ydCBEaWFsb2cgQ29tcG9uZW50XG4gKiBGaWxlIHVwbG9hZC9kcm9wIHpvbmUgd2l0aCBmb3JtYXQgc2VsZWN0aW9uIGFuZCBkYXRhIHByZXZpZXdcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VSZWYsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnQGhlYWRsZXNzdWkvcmVhY3QnO1xuaW1wb3J0IHsgWCwgVXBsb2FkLCBBbGVydENpcmNsZSwgQ2hlY2tDaXJjbGUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL2F0b21zL1NlbGVjdCc7XG4vKipcbiAqIEltcG9ydCBEaWFsb2cgQ29tcG9uZW50XG4gKi9cbmNvbnN0IEltcG9ydERpYWxvZyA9ICh7IGlzT3Blbiwgb25DbG9zZSwgb25JbXBvcnQsIGZvcm1hdHMgPSBbXG4gICAgeyB2YWx1ZTogJ2NzdicsIGxhYmVsOiAnQ1NWJywgZXh0ZW5zaW9uczogWycuY3N2J10gfSxcbiAgICB7IHZhbHVlOiAnanNvbicsIGxhYmVsOiAnSlNPTicsIGV4dGVuc2lvbnM6IFsnLmpzb24nXSB9LFxuICAgIHsgdmFsdWU6ICdleGNlbCcsIGxhYmVsOiAnRXhjZWwnLCBleHRlbnNpb25zOiBbJy54bHN4JywgJy54bHMnXSB9LFxuXSwgc2hvd1ByZXZpZXcgPSB0cnVlLCAnZGF0YS1jeSc6IGRhdGFDeSA9ICdpbXBvcnQtZGlhbG9nJywgfSkgPT4ge1xuICAgIGNvbnN0IFtzZWxlY3RlZEZpbGUsIHNldFNlbGVjdGVkRmlsZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRGb3JtYXQsIHNldFNlbGVjdGVkRm9ybWF0XSA9IHVzZVN0YXRlKGZvcm1hdHNbMF0/LnZhbHVlIHx8ICcnKTtcbiAgICBjb25zdCBbaXNEcmFnZ2luZywgc2V0SXNEcmFnZ2luZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2lzSW1wb3J0aW5nLCBzZXRJc0ltcG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3ByZXZpZXdEYXRhLCBzZXRQcmV2aWV3RGF0YV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgZmlsZUlucHV0UmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IGhhbmRsZURyYWdPdmVyID0gdXNlQ2FsbGJhY2soKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZXRJc0RyYWdnaW5nKHRydWUpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBoYW5kbGVEcmFnTGVhdmUgPSB1c2VDYWxsYmFjaygoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNldElzRHJhZ2dpbmcoZmFsc2UpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCB2YWxpZGF0ZUZpbGUgPSAoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCBmb3JtYXQgPSBmb3JtYXRzLmZpbmQoKGYpID0+IGYudmFsdWUgPT09IHNlbGVjdGVkRm9ybWF0KTtcbiAgICAgICAgaWYgKCFmb3JtYXQpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9ICcuJyArIGZpbGUubmFtZS5zcGxpdCgnLicpLnBvcCgpPy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAoIWZvcm1hdC5leHRlbnNpb25zLmluY2x1ZGVzKGV4dGVuc2lvbikpIHtcbiAgICAgICAgICAgIHNldEVycm9yKGBJbnZhbGlkIGZpbGUgdHlwZS4gRXhwZWN0ZWQ6ICR7Zm9ybWF0LmV4dGVuc2lvbnMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBNYXggZmlsZSBzaXplOiA1ME1CXG4gICAgICAgIGlmIChmaWxlLnNpemUgPiA1MCAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICAgICAgICBzZXRFcnJvcignRmlsZSBzaXplIGV4Y2VlZHMgNTBNQiBsaW1pdCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHNldEVycm9yKCcnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBjb25zdCBsb2FkUHJldmlldyA9IGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgIGlmICghc2hvd1ByZXZpZXcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgICAgICAvLyBTaG93IGZpcnN0IDUwMCBjaGFyYWN0ZXJzIGFzIHByZXZpZXdcbiAgICAgICAgICAgIHNldFByZXZpZXdEYXRhKHRleHQuc3Vic3RyaW5nKDAsIDUwMCkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHByZXZpZXc6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRmlsZVNlbGVjdCA9IChmaWxlKSA9PiB7XG4gICAgICAgIGlmICh2YWxpZGF0ZUZpbGUoZmlsZSkpIHtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkRmlsZShmaWxlKTtcbiAgICAgICAgICAgIGxvYWRQcmV2aWV3KGZpbGUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVEcm9wID0gdXNlQ2FsbGJhY2soKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZXRJc0RyYWdnaW5nKGZhbHNlKTtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBBcnJheS5mcm9tKGUuZGF0YVRyYW5zZmVyLmZpbGVzKTtcbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhbmRsZUZpbGVTZWxlY3QoZmlsZXNbMF0pO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkRm9ybWF0XSk7XG4gICAgY29uc3QgaGFuZGxlRmlsZUlucHV0Q2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSBlLnRhcmdldC5maWxlcztcbiAgICAgICAgaWYgKGZpbGVzICYmIGZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGhhbmRsZUZpbGVTZWxlY3QoZmlsZXNbMF0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVJbXBvcnQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc2VsZWN0ZWRGaWxlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0ltcG9ydGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IoJycpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgb25JbXBvcnQoc2VsZWN0ZWRGaWxlLCBzZWxlY3RlZEZvcm1hdCk7XG4gICAgICAgICAgICBvbkNsb3NlKCk7XG4gICAgICAgICAgICAvLyBSZXNldCBzdGF0ZVxuICAgICAgICAgICAgc2V0U2VsZWN0ZWRGaWxlKG51bGwpO1xuICAgICAgICAgICAgc2V0UHJldmlld0RhdGEoJycpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEVycm9yKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnSW1wb3J0IGZhaWxlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNJbXBvcnRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVDbG9zZSA9ICgpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRGaWxlKG51bGwpO1xuICAgICAgICBzZXRQcmV2aWV3RGF0YSgnJyk7XG4gICAgICAgIHNldEVycm9yKCcnKTtcbiAgICAgICAgb25DbG9zZSgpO1xuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhEaWFsb2csIHsgb3BlbjogaXNPcGVuLCBvbkNsb3NlOiBoYW5kbGVDbG9zZSwgY2xhc3NOYW1lOiBcInJlbGF0aXZlIHotNTBcIiwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZpeGVkIGluc2V0LTAgYmctYmxhY2svMzBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNFwiLCBjaGlsZHJlbjogX2pzeHMoRGlhbG9nLlBhbmVsLCB7IGNsYXNzTmFtZTogXCJteC1hdXRvIG1heC13LTJ4bCB3LWZ1bGwgcm91bmRlZC1sZyBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHNoYWRvdy0yeGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChVcGxvYWQsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiB9KSwgX2pzeChEaWFsb2cuVGl0bGUsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJJbXBvcnQgRGF0YVwiIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IGhhbmRsZUNsb3NlLCBjbGFzc05hbWU6IFwicC0yIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWNvbG9yc1wiLCBcImRhdGEtY3lcIjogXCJjbG9zZS1pbXBvcnQtYnRuXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBzcGFjZS15LTZcIiwgY2hpbGRyZW46IFtfanN4KFNlbGVjdCwgeyBsYWJlbDogXCJGaWxlIEZvcm1hdFwiLCB2YWx1ZTogc2VsZWN0ZWRGb3JtYXQsIG9uQ2hhbmdlOiBzZXRTZWxlY3RlZEZvcm1hdCwgb3B0aW9uczogZm9ybWF0cywgXCJkYXRhLWN5XCI6IFwiaW1wb3J0LWZvcm1hdC1zZWxlY3RcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBvbkRyYWdPdmVyOiBoYW5kbGVEcmFnT3Zlciwgb25EcmFnTGVhdmU6IGhhbmRsZURyYWdMZWF2ZSwgb25Ecm9wOiBoYW5kbGVEcm9wLCBjbGFzc05hbWU6IGBcclxuICAgICAgICAgICAgICAgIGJvcmRlci0yIGJvcmRlci1kYXNoZWQgcm91bmRlZC1sZyBwLTggdGV4dC1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgY3Vyc29yLXBvaW50ZXJcclxuICAgICAgICAgICAgICAgICR7aXNEcmFnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JvcmRlci1ibHVlLTUwMCBiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGhvdmVyOmJvcmRlci1ibHVlLTQwMCBkYXJrOmhvdmVyOmJvcmRlci1ibHVlLTUwMCd9XHJcbiAgICAgICAgICAgICAgYCwgb25DbGljazogKCkgPT4gZmlsZUlucHV0UmVmLmN1cnJlbnQ/LmNsaWNrKCksIFwiZGF0YS1jeVwiOiBcImltcG9ydC1kcm9wLXpvbmVcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyByZWY6IGZpbGVJbnB1dFJlZiwgdHlwZTogXCJmaWxlXCIsIGNsYXNzTmFtZTogXCJoaWRkZW5cIiwgb25DaGFuZ2U6IGhhbmRsZUZpbGVJbnB1dENoYW5nZSwgYWNjZXB0OiBmb3JtYXRzLmZpbmQoKGYpID0+IGYudmFsdWUgPT09IHNlbGVjdGVkRm9ybWF0KT8uZXh0ZW5zaW9ucy5qb2luKCcsJykgfSksICFzZWxlY3RlZEZpbGUgPyAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChVcGxvYWQsIHsgY2xhc3NOYW1lOiBcInctMTIgaC0xMiBteC1hdXRvIHRleHQtZ3JheS00MDAgbWItNFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMCBmb250LW1lZGl1bSBtYi0yXCIsIGNoaWxkcmVuOiBcIkRyb3AgZmlsZSBoZXJlIG9yIGNsaWNrIHRvIGJyb3dzZVwiIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1wiU3VwcG9ydGVkIGZvcm1hdHM6IFwiLCBmb3JtYXRzLmZpbmQoKGYpID0+IGYudmFsdWUgPT09IHNlbGVjdGVkRm9ybWF0KT8uZXh0ZW5zaW9ucy5qb2luKCcsICcpXSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNDAwIGRhcms6dGV4dC1ncmF5LTUwMCBtdC0xXCIsIGNoaWxkcmVuOiBcIk1heGltdW0gZmlsZSBzaXplOiA1ME1CXCIgfSldIH0pKSA6IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxlZnRcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogc2VsZWN0ZWRGaWxlLm5hbWUgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbKHNlbGVjdGVkRmlsZS5zaXplIC8gMTAyNCkudG9GaXhlZCgyKSwgXCIgS0JcIl0gfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRGaWxlKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQcmV2aWV3RGF0YSgnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2xhc3NOYW1lOiBcIm1sLTQgcC0yIHRleHQtcmVkLTYwMCBob3ZlcjpiZy1yZWQtNTAgZGFyazpob3ZlcjpiZy1yZWQtOTAwLzIwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgXCJkYXRhLWN5XCI6IFwicmVtb3ZlLWZpbGUtYnRuXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KV0gfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnQgZ2FwLTIgcC00IGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIGZsZXgtc2hyaW5rLTAgbXQtMC41XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwXCIsIGNoaWxkcmVuOiBlcnJvciB9KV0gfSkpLCBzaG93UHJldmlldyAmJiBwcmV2aWV3RGF0YSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTJcIiwgY2hpbGRyZW46IFwiUHJldmlld1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHJvdW5kZWQtbGcgcC00IG1heC1oLTQ4IG92ZXJmbG93LWF1dG9cIiwgY2hpbGRyZW46IF9qc3hzKFwicHJlXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0yMDAgd2hpdGVzcGFjZS1wcmUtd3JhcCBmb250LW1vbm9cIiwgY2hpbGRyZW46IFtwcmV2aWV3RGF0YSwgcHJldmlld0RhdGEubGVuZ3RoID49IDUwMCAmJiAnXFxuLi4uJ10gfSkgfSldIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0zIHAtNiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiBoYW5kbGVDbG9zZSwgXCJkYXRhLWN5XCI6IFwiY2FuY2VsLWltcG9ydC1idG5cIiwgY2hpbGRyZW46IFwiQ2FuY2VsXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiBoYW5kbGVJbXBvcnQsIGRpc2FibGVkOiAhc2VsZWN0ZWRGaWxlIHx8IGlzSW1wb3J0aW5nLCBsb2FkaW5nOiBpc0ltcG9ydGluZywgXCJkYXRhLWN5XCI6IFwiaW1wb3J0LWJ0blwiLCBjaGlsZHJlbjogXCJJbXBvcnRcIiB9KV0gfSldIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgSW1wb3J0RGlhbG9nO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9