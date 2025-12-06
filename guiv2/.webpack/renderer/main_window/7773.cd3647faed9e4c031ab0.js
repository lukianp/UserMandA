(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7773],{

/***/ 21104:
/*!*********************************!*\
  !*** process/browser (ignored) ***!
  \*********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 74560:
/*!**********************************************************!*\
  !*** ./src/renderer/components/dialogs/ImportDialog.tsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _headlessui_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @headlessui/react */ 53874);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Select__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../atoms/Select */ 1156);

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
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog, { open: isOpen, onClose: handleClose, className: "relative z-50", "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 bg-black/30", "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Panel, { className: "mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Upload, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_headlessui_react__WEBPACK_IMPORTED_MODULE_2__.Dialog.Title, { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Import Data" })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: handleClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "data-cy": "close-import-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-6 space-y-6", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Select__WEBPACK_IMPORTED_MODULE_5__.Select, { label: "File Format", value: selectedFormat, onChange: setSelectedFormat, options: formats, "data-cy": "import-format-select" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragging
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}
              `, onClick: () => fileInputRef.current?.click(), "data-cy": "import-drop-zone", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: fileInputRef, type: "file", className: "hidden", onChange: handleFileInputChange, accept: formats.find((f) => f.value === selectedFormat)?.extensions.join(',') }), !selectedFile ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Upload, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-gray-700 dark:text-gray-300 font-medium mb-2", children: "Drop file here or click to browse" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Supported formats: ", formats.find((f) => f.value === selectedFormat)?.extensions.join(', ')] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-1", children: "Maximum file size: 50MB" })] })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-center gap-3", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.CheckCircle, { className: "w-6 h-6 text-green-600 dark:text-green-400" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "text-left", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: selectedFile.name }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [(selectedFile.size / 1024).toFixed(2), " KB"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                        setPreviewData('');
                                                    }, className: "ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors", "data-cy": "remove-file-btn", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: "w-5 h-5" }) })] }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error })] })), showPreview && previewData && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: "Preview" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-48 overflow-auto", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("pre", { className: "text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono", children: [previewData, previewData.length >= 500 && '\n...'] }) })] }))] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__.Button, { variant: "secondary", onClick: handleClose, "data-cy": "cancel-import-btn", children: "Cancel" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_4__.Button, { variant: "primary", onClick: handleImport, disabled: !selectedFile || isImporting, loading: isImporting, "data-cy": "import-btn", children: "Import" })] })] }) })] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImportDialog);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLHVEQUFLLFVBQVUsK0dBQStHLHNEQUFJLENBQUMsaURBQU0sSUFBSSxnR0FBZ0csR0FBRyxzREFBSSxDQUFDLGlEQUFNLElBQUksc0pBQXNKLElBQUksSUFBSSxHQUFHLElBQUk7QUFDMytDO0FBQ0EsaUVBQWUsWUFBWSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcQGhlYWRsZXNzdWlcXHJlYWN0XFxkaXN0XFxob29rc3xwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0ltcG9ydERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbXBvcnQgRGlhbG9nIENvbXBvbmVudFxuICogRmlsZSB1cGxvYWQvZHJvcCB6b25lIHdpdGggZm9ybWF0IHNlbGVjdGlvbiBhbmQgZGF0YSBwcmV2aWV3XG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlUmVmLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJ0BoZWFkbGVzc3VpL3JlYWN0JztcbmltcG9ydCB7IFgsIFVwbG9hZCwgQWxlcnRDaXJjbGUsIENoZWNrQ2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi9hdG9tcy9TZWxlY3QnO1xuLyoqXG4gKiBJbXBvcnQgRGlhbG9nIENvbXBvbmVudFxuICovXG5jb25zdCBJbXBvcnREaWFsb2cgPSAoeyBpc09wZW4sIG9uQ2xvc2UsIG9uSW1wb3J0LCBmb3JtYXRzID0gW1xuICAgIHsgdmFsdWU6ICdjc3YnLCBsYWJlbDogJ0NTVicsIGV4dGVuc2lvbnM6IFsnLmNzdiddIH0sXG4gICAgeyB2YWx1ZTogJ2pzb24nLCBsYWJlbDogJ0pTT04nLCBleHRlbnNpb25zOiBbJy5qc29uJ10gfSxcbiAgICB7IHZhbHVlOiAnZXhjZWwnLCBsYWJlbDogJ0V4Y2VsJywgZXh0ZW5zaW9uczogWycueGxzeCcsICcueGxzJ10gfSxcbl0sIHNob3dQcmV2aWV3ID0gdHJ1ZSwgJ2RhdGEtY3knOiBkYXRhQ3kgPSAnaW1wb3J0LWRpYWxvZycsIH0pID0+IHtcbiAgICBjb25zdCBbc2VsZWN0ZWRGaWxlLCBzZXRTZWxlY3RlZEZpbGVdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlbGVjdGVkRm9ybWF0LCBzZXRTZWxlY3RlZEZvcm1hdF0gPSB1c2VTdGF0ZShmb3JtYXRzWzBdPy52YWx1ZSB8fCAnJyk7XG4gICAgY29uc3QgW2lzRHJhZ2dpbmcsIHNldElzRHJhZ2dpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtpc0ltcG9ydGluZywgc2V0SXNJbXBvcnRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtwcmV2aWV3RGF0YSwgc2V0UHJldmlld0RhdGFdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IGZpbGVJbnB1dFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBoYW5kbGVEcmFnT3ZlciA9IHVzZUNhbGxiYWNrKChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2V0SXNEcmFnZ2luZyh0cnVlKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgaGFuZGxlRHJhZ0xlYXZlID0gdXNlQ2FsbGJhY2soKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzZXRJc0RyYWdnaW5nKGZhbHNlKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgdmFsaWRhdGVGaWxlID0gKGZpbGUpID0+IHtcbiAgICAgICAgY29uc3QgZm9ybWF0ID0gZm9ybWF0cy5maW5kKChmKSA9PiBmLnZhbHVlID09PSBzZWxlY3RlZEZvcm1hdCk7XG4gICAgICAgIGlmICghZm9ybWF0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb25zdCBleHRlbnNpb24gPSAnLicgKyBmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKT8udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKCFmb3JtYXQuZXh0ZW5zaW9ucy5pbmNsdWRlcyhleHRlbnNpb24pKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihgSW52YWxpZCBmaWxlIHR5cGUuIEV4cGVjdGVkOiAke2Zvcm1hdC5leHRlbnNpb25zLmpvaW4oJywgJyl9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWF4IGZpbGUgc2l6ZTogNTBNQlxuICAgICAgICBpZiAoZmlsZS5zaXplID4gNTAgKiAxMDI0ICogMTAyNCkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ0ZpbGUgc2l6ZSBleGNlZWRzIDUwTUIgbGltaXQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzZXRFcnJvcignJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgY29uc3QgbG9hZFByZXZpZXcgPSBhc3luYyAoZmlsZSkgPT4ge1xuICAgICAgICBpZiAoIXNob3dQcmV2aWV3KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICAgICAgLy8gU2hvdyBmaXJzdCA1MDAgY2hhcmFjdGVycyBhcyBwcmV2aWV3XG4gICAgICAgICAgICBzZXRQcmV2aWV3RGF0YSh0ZXh0LnN1YnN0cmluZygwLCA1MDApKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBwcmV2aWV3OicsIGVycik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUZpbGVTZWxlY3QgPSAoZmlsZSkgPT4ge1xuICAgICAgICBpZiAodmFsaWRhdGVGaWxlKGZpbGUpKSB7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZEZpbGUoZmlsZSk7XG4gICAgICAgICAgICBsb2FkUHJldmlldyhmaWxlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRHJvcCA9IHVzZUNhbGxiYWNrKChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2V0SXNEcmFnZ2luZyhmYWxzZSk7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gQXJyYXkuZnJvbShlLmRhdGFUcmFuc2Zlci5maWxlcyk7XG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYW5kbGVGaWxlU2VsZWN0KGZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZEZvcm1hdF0pO1xuICAgIGNvbnN0IGhhbmRsZUZpbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gZS50YXJnZXQuZmlsZXM7XG4gICAgICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBoYW5kbGVGaWxlU2VsZWN0KGZpbGVzWzBdKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlSW1wb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkRmlsZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNJbXBvcnRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKCcnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG9uSW1wb3J0KHNlbGVjdGVkRmlsZSwgc2VsZWN0ZWRGb3JtYXQpO1xuICAgICAgICAgICAgb25DbG9zZSgpO1xuICAgICAgICAgICAgLy8gUmVzZXQgc3RhdGVcbiAgICAgICAgICAgIHNldFNlbGVjdGVkRmlsZShudWxsKTtcbiAgICAgICAgICAgIHNldFByZXZpZXdEYXRhKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ltcG9ydCBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzSW1wb3J0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xvc2UgPSAoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkRmlsZShudWxsKTtcbiAgICAgICAgc2V0UHJldmlld0RhdGEoJycpO1xuICAgICAgICBzZXRFcnJvcignJyk7XG4gICAgICAgIG9uQ2xvc2UoKTtcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoRGlhbG9nLCB7IG9wZW46IGlzT3Blbiwgb25DbG9zZTogaGFuZGxlQ2xvc2UsIGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB6LTUwXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzMwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZml4ZWQgaW5zZXQtMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIiwgY2hpbGRyZW46IF9qc3hzKERpYWxvZy5QYW5lbCwgeyBjbGFzc05hbWU6IFwibXgtYXV0byBtYXgtdy0yeGwgdy1mdWxsIHJvdW5kZWQtbGcgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBzaGFkb3ctMnhsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtNiBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goVXBsb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIgfSksIF9qc3goRGlhbG9nLlRpdGxlLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IFwiSW1wb3J0IERhdGFcIiB9KV0gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiBoYW5kbGVDbG9zZSwgY2xhc3NOYW1lOiBcInAtMiBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwIHJvdW5kZWQtbGcgdHJhbnNpdGlvbi1jb2xvcnNcIiwgXCJkYXRhLWN5XCI6IFwiY2xvc2UtaW1wb3J0LWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgc3BhY2UteS02XCIsIGNoaWxkcmVuOiBbX2pzeChTZWxlY3QsIHsgbGFiZWw6IFwiRmlsZSBGb3JtYXRcIiwgdmFsdWU6IHNlbGVjdGVkRm9ybWF0LCBvbkNoYW5nZTogc2V0U2VsZWN0ZWRGb3JtYXQsIG9wdGlvbnM6IGZvcm1hdHMsIFwiZGF0YS1jeVwiOiBcImltcG9ydC1mb3JtYXQtc2VsZWN0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgb25EcmFnT3ZlcjogaGFuZGxlRHJhZ092ZXIsIG9uRHJhZ0xlYXZlOiBoYW5kbGVEcmFnTGVhdmUsIG9uRHJvcDogaGFuZGxlRHJvcCwgY2xhc3NOYW1lOiBgXHJcbiAgICAgICAgICAgICAgICBib3JkZXItMiBib3JkZXItZGFzaGVkIHJvdW5kZWQtbGcgcC04IHRleHQtY2VudGVyIHRyYW5zaXRpb24tY29sb3JzIGN1cnNvci1wb2ludGVyXHJcbiAgICAgICAgICAgICAgICAke2lzRHJhZ2dpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdib3JkZXItYmx1ZS01MDAgYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCBob3Zlcjpib3JkZXItYmx1ZS00MDAgZGFyazpob3Zlcjpib3JkZXItYmx1ZS01MDAnfVxyXG4gICAgICAgICAgICAgIGAsIG9uQ2xpY2s6ICgpID0+IGZpbGVJbnB1dFJlZi5jdXJyZW50Py5jbGljaygpLCBcImRhdGEtY3lcIjogXCJpbXBvcnQtZHJvcC16b25lXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgcmVmOiBmaWxlSW5wdXRSZWYsIHR5cGU6IFwiZmlsZVwiLCBjbGFzc05hbWU6IFwiaGlkZGVuXCIsIG9uQ2hhbmdlOiBoYW5kbGVGaWxlSW5wdXRDaGFuZ2UsIGFjY2VwdDogZm9ybWF0cy5maW5kKChmKSA9PiBmLnZhbHVlID09PSBzZWxlY3RlZEZvcm1hdCk/LmV4dGVuc2lvbnMuam9pbignLCcpIH0pLCAhc2VsZWN0ZWRGaWxlID8gKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goVXBsb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTEyIGgtMTIgbXgtYXV0byB0ZXh0LWdyYXktNDAwIG1iLTRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDAgZm9udC1tZWRpdW0gbWItMlwiLCBjaGlsZHJlbjogXCJEcm9wIGZpbGUgaGVyZSBvciBjbGljayB0byBicm93c2VcIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlN1cHBvcnRlZCBmb3JtYXRzOiBcIiwgZm9ybWF0cy5maW5kKChmKSA9PiBmLnZhbHVlID09PSBzZWxlY3RlZEZvcm1hdCk/LmV4dGVuc2lvbnMuam9pbignLCAnKV0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTQwMCBkYXJrOnRleHQtZ3JheS01MDAgbXQtMVwiLCBjaGlsZHJlbjogXCJNYXhpbXVtIGZpbGUgc2l6ZTogNTBNQlwiIH0pXSB9KSkgOiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDBcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZWZ0XCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHNlbGVjdGVkRmlsZS5uYW1lIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogWyhzZWxlY3RlZEZpbGUuc2l6ZSAvIDEwMjQpLnRvRml4ZWQoMiksIFwiIEtCXCJdIH0pXSB9KSwgX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkRmlsZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UHJldmlld0RhdGEoJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNsYXNzTmFtZTogXCJtbC00IHAtMiB0ZXh0LXJlZC02MDAgaG92ZXI6YmctcmVkLTUwIGRhcms6aG92ZXI6YmctcmVkLTkwMC8yMCByb3VuZGVkLWxnIHRyYW5zaXRpb24tY29sb3JzXCIsIFwiZGF0YS1jeVwiOiBcInJlbW92ZS1maWxlLWJ0blwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSldIH0pKV0gfSksIGVycm9yICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0yIHAtNCBiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIGJvcmRlciBib3JkZXItcmVkLTIwMCBkYXJrOmJvcmRlci1yZWQtODAwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCBmbGV4LXNocmluay0wIG10LTAuNVwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMFwiLCBjaGlsZHJlbjogZXJyb3IgfSldIH0pKSwgc2hvd1ByZXZpZXcgJiYgcHJldmlld0RhdGEgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0yXCIsIGNoaWxkcmVuOiBcIlByZXZpZXdcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDAgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCByb3VuZGVkLWxnIHAtNCBtYXgtaC00OCBvdmVyZmxvdy1hdXRvXCIsIGNoaWxkcmVuOiBfanN4cyhcInByZVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMjAwIHdoaXRlc3BhY2UtcHJlLXdyYXAgZm9udC1tb25vXCIsIGNoaWxkcmVuOiBbcHJldmlld0RhdGEsIHByZXZpZXdEYXRhLmxlbmd0aCA+PSA1MDAgJiYgJ1xcbi4uLiddIH0pIH0pXSB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWVuZCBnYXAtMyBwLTYgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlQ2xvc2UsIFwiZGF0YS1jeVwiOiBcImNhbmNlbC1pbXBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkNhbmNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlSW1wb3J0LCBkaXNhYmxlZDogIXNlbGVjdGVkRmlsZSB8fCBpc0ltcG9ydGluZywgbG9hZGluZzogaXNJbXBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImltcG9ydC1idG5cIiwgY2hpbGRyZW46IFwiSW1wb3J0XCIgfSldIH0pXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEltcG9ydERpYWxvZztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==