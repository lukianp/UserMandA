"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3016],{

/***/ 31247:
/*!***********************************************************!*\
  !*** ./src/renderer/components/DataTable.tsx + 1 modules ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ components_DataTable)
});

// UNUSED EXPORTS: DataTable

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./node_modules/papaparse/papaparse.min.js
var papaparse_min = __webpack_require__(44809);
var papaparse_min_default = /*#__PURE__*/__webpack_require__.n(papaparse_min);
// EXTERNAL MODULE: ./node_modules/react-contexify/dist/index.mjs + 1 modules
var dist = __webpack_require__(51128);
// EXTERNAL MODULE: ./node_modules/react-contexify/dist/ReactContexify.min.css
var ReactContexify_min = __webpack_require__(44380);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Checkbox.tsx
var Checkbox = __webpack_require__(63683);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/store/useTabStore.ts
var useTabStore = __webpack_require__(63543);
;// ./src/renderer/components/organisms/DataTable.tsx

/**
 * Data Table Component
 * Simpler alternative to AG Grid with built-in sorting, filtering, and pagination
 */










/**
 * Data Table Component
 */
function DataTable({ data, columns, selectable = false, onSelectionChange, pagination = true, pageSize = 25, searchable = true, searchPlaceholder = 'Search...', loading = false, emptyMessage = 'No data available', onRowClick, getRowId = (_, index) => index.toString(), className, 'data-cy': dataCy = 'data-table', columnVisibility = true, exportable = true, exportFilename = 'export', contextMenu = true, onViewDetails, detailViewComponent, getDetailViewTitle, }) {
    const [searchTerm, setSearchTerm] = (0,react.useState)('');
    const [sortColumn, setSortColumn] = (0,react.useState)(null);
    const [sortDirection, setSortDirection] = (0,react.useState)(null);
    const [currentPage, setCurrentPage] = (0,react.useState)(1);
    const [selectedRows, setSelectedRows] = (0,react.useState)(new Set());
    const [columnVisibilityState, setColumnVisibilityState] = (0,react.useState)(() => columns.reduce((acc, col) => ({ ...acc, [col.id]: col.visible !== false }), {}));
    const [showColumnMenu, setShowColumnMenu] = (0,react.useState)(false);
    const columnMenuRef = (0,react.useRef)(null);
    const { openTab } = (0,useTabStore.useTabStore)();
    // Context menu setup
    const MENU_ID = `data-table-${dataCy}`;
    const { show } = (0,dist.useContextMenu)({ id: MENU_ID });
    // Get cell value
    const getCellValue = (row, column) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor];
    };
    // Filter data based on search term
    const filteredData = (0,react.useMemo)(() => {
        if (!searchTerm)
            return data;
        return data.filter((row) => {
            return columns.some((column) => {
                if (!column.filterable)
                    return false;
                const value = getCellValue(row, column);
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }, [data, searchTerm, columns]);
    // Sort data
    const sortedData = (0,react.useMemo)(() => {
        if (!sortColumn || !sortDirection)
            return filteredData;
        const column = columns.find((col) => col.id === sortColumn);
        if (!column)
            return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = getCellValue(a, column);
            const bValue = getCellValue(b, column);
            if (aValue === bValue)
                return 0;
            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection, columns]);
    // Paginate data
    const paginatedData = (0,react.useMemo)(() => {
        if (!pagination)
            return sortedData;
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, currentPage, pageSize, pagination]);
    const totalPages = Math.ceil(sortedData.length / pageSize);
    // Handle sort
    const handleSort = (columnId) => {
        const column = columns.find((col) => col.id === columnId);
        if (!column?.sortable)
            return;
        if (sortColumn === columnId) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            }
            else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        }
        else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };
    // Handle row selection
    const handleRowSelect = (rowId) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowId)) {
            newSelected.delete(rowId);
        }
        else {
            newSelected.add(rowId);
        }
        setSelectedRows(newSelected);
        if (onSelectionChange) {
            const selected = data.filter((row, index) => newSelected.has(getRowId(row, index)));
            onSelectionChange(selected);
        }
    };
    // Handle select all
    const handleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        }
        else {
            const allIds = new Set(paginatedData.map((row, index) => getRowId(row, index)));
            setSelectedRows(allIds);
            onSelectionChange?.(paginatedData);
        }
    };
    const allSelected = selectedRows.size === paginatedData.length && paginatedData.length > 0;
    const someSelected = selectedRows.size > 0 && selectedRows.size < paginatedData.length;
    // Get visible columns
    const visibleColumns = (0,react.useMemo)(() => {
        return columns.filter(col => columnVisibilityState[col.id]);
    }, [columns, columnVisibilityState]);
    // Toggle column visibility
    const toggleColumnVisibility = (columnId) => {
        setColumnVisibilityState(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };
    // Handle context menu
    const handleContextMenu = (event, row) => {
        if (!contextMenu)
            return;
        event.preventDefault();
        show({ event, props: { row } });
    };
    // Handle view details
    const handleViewDetails = ({ props }) => {
        const row = props.row;
        if (onViewDetails) {
            onViewDetails(row);
        }
        else if (detailViewComponent && getDetailViewTitle) {
            openTab({
                title: getDetailViewTitle(row),
                component: detailViewComponent,
                icon: 'Eye',
                closable: true,
                data: row
            });
        }
    };
    // Handle copy row
    const handleCopyRow = ({ props }) => {
        const row = props.row;
        const rowText = visibleColumns
            .map(col => {
            const value = getCellValue(row, col);
            return `${col.header}: ${value}`;
        })
            .join('\n');
        navigator.clipboard.writeText(rowText).then(() => {
            // Could show a toast notification here
            console.log('Row copied to clipboard');
        });
    };
    // Handle export selected
    const handleExportSelected = ({ props }) => {
        const row = props.row;
        const rowsToExport = selectedRows.size > 0
            ? data.filter((_, index) => selectedRows.has(getRowId(_, index)))
            : [row];
        exportToCSV(rowsToExport);
    };
    // Export data to CSV
    const exportToCSV = (dataToExport = sortedData) => {
        const csvData = dataToExport.map(row => {
            const csvRow = {};
            visibleColumns.forEach(col => {
                const value = getCellValue(row, col);
                csvRow[col.header] = value;
            });
            return csvRow;
        });
        const csv = papaparse_min_default().unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Close column menu when clicking outside
    react.useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
                setShowColumnMenu(false);
            }
        };
        if (showColumnMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showColumnMenu]);
    return ((0,jsx_runtime.jsxs)("div", { className: (0,clsx.clsx)('flex flex-col h-full', className), "data-cy": dataCy, children: [(searchable || columnVisibility || exportable) && ((0,jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center gap-3", children: [searchable && ((0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input.Input, { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: searchPlaceholder, startIcon: (0,jsx_runtime.jsx)(lucide_react.Search, { className: "w-4 h-4" }), "data-cy": "table-search" }) })), columnVisibility && ((0,jsx_runtime.jsxs)("div", { className: "relative", ref: columnMenuRef, children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.Columns, { className: "w-4 h-4" }), onClick: () => setShowColumnMenu(!showColumnMenu), "data-cy": "column-visibility-btn", children: "Columns" }), showColumnMenu && ((0,jsx_runtime.jsx)("div", { className: "absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto", children: (0,jsx_runtime.jsxs)("div", { className: "p-2", children: [(0,jsx_runtime.jsx)("div", { className: "px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase", children: "Show/Hide Columns" }), (0,jsx_runtime.jsx)("div", { className: "space-y-1", children: columns.map(column => ((0,jsx_runtime.jsxs)("label", { className: "flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer", "data-cy": `column-toggle-${column.id}`, children: [(0,jsx_runtime.jsx)(Checkbox.Checkbox, { checked: columnVisibilityState[column.id], onChange: () => toggleColumnVisibility(column.id) }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-200", children: column.header })] }, column.id))) })] }) }))] })), exportable && ((0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: () => exportToCSV(), "data-cy": "export-btn", children: "Export" }))] })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg", children: (0,jsx_runtime.jsxs)("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [(0,jsx_runtime.jsx)("thead", { className: "bg-gray-50 dark:bg-gray-800 sticky top-0 z-10", children: (0,jsx_runtime.jsxs)("tr", { children: [selectable && ((0,jsx_runtime.jsx)("th", { className: "w-12 px-4 py-3", children: (0,jsx_runtime.jsx)(Checkbox.Checkbox, { checked: allSelected, indeterminate: someSelected, onChange: handleSelectAll, "data-cy": "select-all-checkbox" }) })), visibleColumns.map((column) => ((0,jsx_runtime.jsx)("th", { className: (0,clsx.clsx)('px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider', column.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right'), style: { width: column.width }, onClick: () => column.sortable && handleSort(column.id), "data-cy": `column-header-${column.id}`, children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { children: column.header }), column.sortable && ((0,jsx_runtime.jsx)("span", { className: "text-gray-400", children: sortColumn === column.id ? (sortDirection === 'asc' ? ((0,jsx_runtime.jsx)(lucide_react.ChevronUp, { className: "w-4 h-4" })) : ((0,jsx_runtime.jsx)(lucide_react.ChevronDown, { className: "w-4 h-4" }))) : ((0,jsx_runtime.jsx)(lucide_react.ChevronsUpDown, { className: "w-4 h-4" })) }))] }) }, column.id)))] }) }), (0,jsx_runtime.jsx)("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: loading ? ((0,jsx_runtime.jsx)("tr", { children: (0,jsx_runtime.jsx)("td", { colSpan: visibleColumns.length + (selectable ? 1 : 0), className: "px-4 py-8 text-center", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-center gap-2 text-gray-500", children: [(0,jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" }), (0,jsx_runtime.jsx)("span", { children: "Loading..." })] }) }) })) : paginatedData.length === 0 ? ((0,jsx_runtime.jsx)("tr", { children: (0,jsx_runtime.jsx)("td", { colSpan: visibleColumns.length + (selectable ? 1 : 0), className: "px-4 py-8 text-center text-gray-500", children: emptyMessage }) })) : (paginatedData.map((row, rowIndex) => {
                                const rowId = getRowId(row, rowIndex);
                                const isSelected = selectedRows.has(rowId);
                                return ((0,jsx_runtime.jsxs)("tr", { className: (0,clsx.clsx)('transition-colors', onRowClick && 'cursor-pointer', isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'), onClick: () => onRowClick?.(row), onContextMenu: (e) => handleContextMenu(e, row), "data-cy": `table-row-${rowIndex}`, children: [selectable && ((0,jsx_runtime.jsx)("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: (0,jsx_runtime.jsx)(Checkbox.Checkbox, { checked: isSelected, onChange: () => handleRowSelect(rowId), "data-cy": `row-checkbox-${rowIndex}` }) })), visibleColumns.map((column) => {
                                            const value = getCellValue(row, column);
                                            const content = column.cell ? column.cell(value, row) : value;
                                            return ((0,jsx_runtime.jsx)("td", { className: (0,clsx.clsx)('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right'), "data-cy": `cell-${column.id}-${rowIndex}`, children: content }, column.id));
                                        })] }, rowId));
                            })) })] }) }), pagination && totalPages > 1 && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mt-4 px-4", children: [(0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Showing ", (currentPage - 1) * pageSize + 1, " to", ' ', Math.min(currentPage * pageSize, sortedData.length), " of ", sortedData.length, " results"] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed", "data-cy": "prev-page-btn", children: (0,jsx_runtime.jsx)(lucide_react.ChevronLeft, { className: "w-5 h-5" }) }), (0,jsx_runtime.jsxs)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Page ", currentPage, " of ", totalPages] }), (0,jsx_runtime.jsx)("button", { onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed", "data-cy": "next-page-btn", children: (0,jsx_runtime.jsx)(lucide_react.ChevronRight, { className: "w-5 h-5" }) })] })] })), contextMenu && ((0,jsx_runtime.jsxs)(dist.Menu, { id: MENU_ID, theme: "dark", children: [(onViewDetails || detailViewComponent) && ((0,jsx_runtime.jsx)(dist.Item, { onClick: handleViewDetails, "data-cy": "context-menu-view-details", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Eye, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "View Details" })] }) })), (0,jsx_runtime.jsx)(dist.Item, { onClick: handleCopyRow, "data-cy": "context-menu-copy", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Copy, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Copy Row" })] }) }), exportable && ((0,jsx_runtime.jsx)(dist.Item, { onClick: handleExportSelected, "data-cy": "context-menu-export", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Export Selection" })] }) }))] }))] }));
}
/* harmony default export */ const organisms_DataTable = (DataTable);

;// ./src/renderer/components/DataTable.tsx

/**
 * Simple DataTable Wrapper
 * Auto-generates columns from data for use in auto-generated discovery views
 */


/**
 * Simple wrapper around DataTable that auto-generates columns from row data
 */
function DataTable_DataTable({ rows, loading = false, emptyMessage = 'No data available' }) {
    // Auto-generate columns from first row
    const columns = (0,react.useMemo)(() => {
        if (!rows || rows.length === 0)
            return [];
        const firstRow = rows[0];
        return Object.keys(firstRow).map((key) => ({
            id: key,
            header: key
                .replace(/([A-Z])/g, ' $1') // Add space before capitals
                .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
                .trim(),
            accessor: key,
            sortable: true,
            filterable: true,
            visible: true,
        }));
    }, [rows]);
    if (!rows || rows.length === 0) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-64 text-gray-500", children: emptyMessage }));
    }
    return ((0,jsx_runtime.jsx)(organisms_DataTable, { data: rows, columns: columns, pagination: true, pageSize: 50, searchable: true, searchPlaceholder: "Search data...", loading: loading, emptyMessage: emptyMessage, exportable: true, exportFilename: "discovery-data", columnVisibility: true }));
}
/* harmony default export */ const components_DataTable = (DataTable_DataTable);


/***/ }),

/***/ 34766:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Input.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Input: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Input Component
 *
 * Accessible input field with label, error states, and help text
 */



/**
 * Input component with full accessibility support
 */
const Input = (0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(({ label, helperText, error, required = false, showOptional = true, inputSize = 'md', fullWidth = false, startIcon, endIcon, className, id, 'data-cy': dataCy, disabled = false, ...props }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };
    // Input classes
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Info, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


/***/ }),

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

/***/ 83318:
/*!********************************************************!*\
  !*** ./src/renderer/hooks/useDiscovery.ts + 4 modules ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  useDiscovery: () => (/* binding */ useDiscovery)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: external "crypto"
var external_crypto_ = __webpack_require__(76982);
;// ./src/renderer/services/loggingService.ts
/**
 * Enhanced Logging Service
 *
 * Features:
 * - Structured logging with context and correlation IDs
 * - Multiple log levels with filtering (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * - Multiple log transports (console, file via IPC, remote)
 * - Log rotation (daily, size-based)
 * - Log search and filtering
 * - Performance logging with method timing
 * - Error stack trace capture
 * - Log correlation IDs for request tracking
 */

/**
 * Log levels with numeric priorities
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
})(LogLevel || (LogLevel = {}));
/**
 * Enhanced Logging Service
 */
class LoggingService {
    logs = [];
    config;
    correlationIdStack = [];
    performanceMarks = new Map();
    sessionId;
    userId;
    constructor() {
        this.config = {
            minLevel: LogLevel.INFO,
            maxLogs: 10000,
            transports: ['console'],
            enablePerformanceLogging: true,
            enableStackTrace: true,
            rotationSize: 10 * 1024 * 1024, // 10MB
            rotationInterval: 86400000, // 24 hours
        };
        this.sessionId = external_crypto_.randomUUID();
        // Load persisted logs from localStorage
        this.loadLogs();
    }
    /**
     * Configure logging service
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        console.log('Logging service configured:', this.config);
    }
    /**
     * Set minimum log level
     */
    setLogLevel(level) {
        this.config.minLevel = level;
    }
    /**
     * Set user ID for logging context
     */
    setUserId(userId) {
        this.userId = userId;
    }
    /**
     * Start a correlation context
     */
    startCorrelation(id) {
        const correlationId = id || external_crypto_.randomUUID();
        this.correlationIdStack.push(correlationId);
        return correlationId;
    }
    /**
     * End the current correlation context
     */
    endCorrelation() {
        this.correlationIdStack.pop();
    }
    /**
     * Get current correlation ID
     */
    getCurrentCorrelationId() {
        return this.correlationIdStack[this.correlationIdStack.length - 1];
    }
    /**
     * TRACE level logging
     */
    trace(message, context, data) {
        this.log(LogLevel.TRACE, message, context, data);
    }
    /**
     * DEBUG level logging
     */
    debug(message, context, data) {
        this.log(LogLevel.DEBUG, message, context, data);
    }
    /**
     * INFO level logging
     */
    info(message, context, data) {
        this.log(LogLevel.INFO, message, context, data);
    }
    /**
     * WARN level logging
     */
    warn(message, context, data) {
        this.log(LogLevel.WARN, message, context, data);
    }
    /**
     * ERROR level logging
     */
    error(message, context, data, error) {
        const errorData = error && this.config.enableStackTrace ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
        } : undefined;
        this.log(LogLevel.ERROR, message, context, data, errorData);
    }
    /**
     * FATAL level logging
     */
    fatal(message, context, data, error) {
        const errorData = error && this.config.enableStackTrace ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
        } : undefined;
        this.log(LogLevel.FATAL, message, context, data, errorData);
    }
    /**
     * Core logging method
     */
    log(level, message, context, data, error) {
        // Check if log level is enabled
        if (level < this.config.minLevel) {
            return;
        }
        const entry = {
            id: external_crypto_.randomUUID(),
            timestamp: new Date(),
            level,
            levelName: LogLevel[level],
            message,
            context,
            correlationId: this.getCurrentCorrelationId(),
            data,
            error,
            tags: [],
            userId: this.userId,
            sessionId: this.sessionId,
        };
        this.logs.push(entry);
        // Manage log rotation
        if (this.logs.length > this.config.maxLogs) {
            this.logs = this.logs.slice(-this.config.maxLogs);
        }
        // Output to transports
        this.outputToTransports(entry);
        // Persist logs periodically
        if (this.logs.length % 10 === 0) {
            this.persistLogs();
        }
    }
    /**
     * Performance logging - start timing
     */
    startPerformanceMeasure(methodName) {
        if (!this.config.enablePerformanceLogging)
            return;
        this.performanceMarks.set(methodName, performance.now());
    }
    /**
     * Performance logging - end timing and log
     */
    endPerformanceMeasure(methodName, context) {
        if (!this.config.enablePerformanceLogging)
            return null;
        const startTime = this.performanceMarks.get(methodName);
        if (!startTime) {
            this.warn(`No performance mark found for ${methodName}`, 'Performance');
            return null;
        }
        const duration = performance.now() - startTime;
        this.performanceMarks.delete(methodName);
        // Log performance entry
        const entry = {
            id: external_crypto_.randomUUID(),
            timestamp: new Date(),
            level: LogLevel.DEBUG,
            levelName: 'DEBUG',
            message: `Performance: ${methodName}`,
            context: context || 'Performance',
            correlationId: this.getCurrentCorrelationId(),
            performance: {
                duration,
                method: methodName,
            },
            sessionId: this.sessionId,
            userId: this.userId,
        };
        this.logs.push(entry);
        this.outputToTransports(entry);
        return duration;
    }
    /**
     * Measure async function performance
     */
    async measureAsync(methodName, fn, context) {
        this.startPerformanceMeasure(methodName);
        try {
            return await fn();
        }
        finally {
            this.endPerformanceMeasure(methodName, context);
        }
    }
    /**
     * Output log entry to configured transports
     */
    outputToTransports(entry) {
        for (const transport of this.config.transports) {
            switch (transport) {
                case 'console':
                    this.outputToConsole(entry);
                    break;
                case 'file':
                    this.outputToFile(entry);
                    break;
                case 'remote':
                    this.outputToRemote(entry);
                    break;
            }
        }
    }
    /**
     * Output to console
     */
    outputToConsole(entry) {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.levelName.padEnd(5);
        const context = entry.context ? `[${entry.context}]` : '';
        const correlationId = entry.correlationId ? `[${entry.correlationId.slice(0, 8)}]` : '';
        let logFn = console.log;
        let color = '';
        switch (entry.level) {
            case LogLevel.TRACE:
                logFn = console.debug;
                color = '\x1b[90m'; // Gray
                break;
            case LogLevel.DEBUG:
                logFn = console.debug;
                color = '\x1b[36m'; // Cyan
                break;
            case LogLevel.INFO:
                logFn = console.info;
                color = '\x1b[32m'; // Green
                break;
            case LogLevel.WARN:
                logFn = console.warn;
                color = '\x1b[33m'; // Yellow
                break;
            case LogLevel.ERROR:
                logFn = console.error;
                color = '\x1b[31m'; // Red
                break;
            case LogLevel.FATAL:
                logFn = console.error;
                color = '\x1b[35m'; // Magenta
                break;
        }
        const reset = '\x1b[0m';
        logFn(`${color}${timestamp} ${level}${reset} ${context}${correlationId} ${entry.message}`);
        if (entry.data) {
            console.log('  Data:', entry.data);
        }
        if (entry.error) {
            console.error('  Error:', entry.error.message);
            if (entry.error.stack) {
                console.error(entry.error.stack);
            }
        }
        if (entry.performance) {
            console.log(`  Duration: ${entry.performance.duration.toFixed(2)}ms`);
        }
    }
    /**
     * Output to file (via IPC to main process)
     */
    outputToFile(entry) {
        // Send to main process for file writing
        if (window.electronAPI?.logToFile) {
            window.electronAPI.logToFile(entry).catch((err) => {
                console.error('Failed to write log to file:', err);
            });
        }
    }
    /**
     * Output to remote logging service
     */
    outputToRemote(entry) {
        // Would send to remote logging service (e.g., Elasticsearch, Splunk)
        // Implementation depends on specific service
    }
    /**
     * Get all logs
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * Filter logs by criteria
     */
    filterLogs(filter) {
        return this.logs.filter((entry) => {
            if (filter.levels && !filter.levels.includes(entry.level)) {
                return false;
            }
            if (filter.contexts && entry.context && !filter.contexts.includes(entry.context)) {
                return false;
            }
            if (filter.correlationId && entry.correlationId !== filter.correlationId) {
                return false;
            }
            if (filter.startTime && entry.timestamp < filter.startTime) {
                return false;
            }
            if (filter.endTime && entry.timestamp > filter.endTime) {
                return false;
            }
            if (filter.searchText) {
                const searchLower = filter.searchText.toLowerCase();
                const matchesMessage = entry.message.toLowerCase().includes(searchLower);
                const matchesContext = entry.context?.toLowerCase().includes(searchLower);
                const matchesData = JSON.stringify(entry.data || {}).toLowerCase().includes(searchLower);
                if (!matchesMessage && !matchesContext && !matchesData) {
                    return false;
                }
            }
            if (filter.tags && entry.tags) {
                const hasTag = filter.tags.some((tag) => entry.tags.includes(tag));
                if (!hasTag) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Search logs by text
     */
    searchLogs(query) {
        return this.filterLogs({ searchText: query });
    }
    /**
     * Get logs by correlation ID
     */
    getLogsByCorrelation(correlationId) {
        return this.filterLogs({ correlationId });
    }
    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('app_logs');
        console.log('All logs cleared');
    }
    /**
     * Persist logs to localStorage
     */
    persistLogs() {
        try {
            // Store last 1000 logs
            const logsToStore = this.logs.slice(-1000);
            localStorage.setItem('app_logs', JSON.stringify(logsToStore));
        }
        catch (error) {
            console.error('Failed to persist logs:', error);
        }
    }
    /**
     * Load logs from localStorage
     */
    loadLogs() {
        try {
            const stored = localStorage.getItem('app_logs');
            if (stored) {
                const logs = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                this.logs = logs.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp),
                }));
                console.log(`Loaded ${this.logs.length} persisted logs`);
            }
        }
        catch (error) {
            console.error('Failed to load persisted logs:', error);
        }
    }
    /**
     * Export logs to JSON
     */
    exportLogs(format = 'json') {
        let content;
        let mimeType;
        let extension;
        if (format === 'json') {
            content = JSON.stringify(this.logs, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        }
        else {
            // CSV format
            const headers = ['timestamp', 'level', 'context', 'correlationId', 'message', 'data'];
            const rows = this.logs.map((entry) => [
                entry.timestamp.toISOString(),
                entry.levelName,
                entry.context || '',
                entry.correlationId || '',
                entry.message,
                JSON.stringify(entry.data || {}),
            ]);
            content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
            mimeType = 'text/csv';
            extension = 'csv';
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        this.info('Logs exported', 'LoggingService', { format, count: this.logs.length });
    }
    /**
     * Get logging statistics
     */
    getStatistics() {
        const total = this.logs.length;
        const byLevel = {};
        for (let level = LogLevel.TRACE; level <= LogLevel.FATAL; level++) {
            byLevel[LogLevel[level]] = this.logs.filter((l) => l.level === level).length;
        }
        const contexts = new Set(this.logs.map((l) => l.context).filter(Boolean));
        const correlations = new Set(this.logs.map((l) => l.correlationId).filter(Boolean));
        return {
            total,
            byLevel,
            uniqueContexts: contexts.size,
            uniqueCorrelations: correlations.size,
            sessionId: this.sessionId,
            userId: this.userId,
            oldestLog: this.logs[0]?.timestamp,
            newestLog: this.logs[this.logs.length - 1]?.timestamp,
        };
    }
}
/* harmony default export */ const loggingService = (new LoggingService());

;// ./src/renderer/services/cacheService.ts
/**
 * Enhanced Cache Service
 *
 * Enterprise-grade caching with:
 * - Multiple cache strategies (LRU, LFU, FIFO, TTL)
 * - Multiple storage backends (memory, localStorage, IndexedDB)
 * - Cache statistics and monitoring
 * - Automatic expiration and cleanup
 * - Cache warming and preloading
 * - Cache versioning and invalidation
 */

/**
 * Enhanced Cache Service
 */
class CacheService {
    cache = new Map();
    strategy;
    backend;
    maxSize;
    maxMemoryBytes;
    defaultTTL;
    enableStats;
    namespace;
    cleanupInterval;
    // Statistics
    stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalAccessTime: 0,
        accessCount: 0,
    };
    constructor(options = {}) {
        this.strategy = options.strategy || 'LRU';
        this.backend = options.backend || 'memory';
        this.maxSize = options.maxSize || 1000;
        this.maxMemoryBytes = (options.maxMemoryMB || 100) * 1048576;
        this.defaultTTL = options.defaultTTL;
        this.enableStats = options.enableStats !== false;
        this.namespace = options.namespace || 'default';
        // Start automatic cleanup
        this.startCleanup();
        // Load from persistent storage if needed
        if (this.backend !== 'memory') {
            this.loadFromStorage();
        }
        loggingService.info('Cache service initialized', 'CacheService', {
            strategy: this.strategy,
            backend: this.backend,
            maxSize: this.maxSize,
            namespace: this.namespace,
        });
    }
    /**
     * Get value from cache
     */
    get(key) {
        const startTime = performance.now();
        const namespacedKey = this.getNamespacedKey(key);
        const entry = this.cache.get(namespacedKey);
        if (!entry) {
            this.stats.misses++;
            this.recordAccessTime(startTime);
            return undefined;
        }
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            this.recordAccessTime(startTime);
            return undefined;
        }
        // Update access metadata
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.stats.hits++;
        this.recordAccessTime(startTime);
        return entry.value;
    }
    /**
     * Set value in cache
     */
    set(key, value, ttl) {
        const namespacedKey = this.getNamespacedKey(key);
        const size = this.estimateSize(value);
        // Check memory limits
        if (this.getCurrentMemoryUsage() + size > this.maxMemoryBytes) {
            this.evict();
        }
        // Check size limits
        if (this.cache.size >= this.maxSize) {
            this.evict();
        }
        const entry = {
            key: namespacedKey,
            value,
            timestamp: Date.now(),
            expiresAt: ttl ? Date.now() + ttl : this.defaultTTL ? Date.now() + this.defaultTTL : undefined,
            accessCount: 0,
            lastAccessed: Date.now(),
            size,
        };
        this.cache.set(namespacedKey, entry);
        // Persist to storage if needed
        if (this.backend !== 'memory') {
            this.persistToStorage(namespacedKey, entry);
        }
    }
    /**
     * Check if key exists in cache
     */
    has(key) {
        const namespacedKey = this.getNamespacedKey(key);
        const entry = this.cache.get(namespacedKey);
        if (!entry) {
            return false;
        }
        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Delete entry from cache
     */
    delete(key) {
        const namespacedKey = this.getNamespacedKey(key);
        const deleted = this.cache.delete(namespacedKey);
        if (deleted && this.backend !== 'memory') {
            this.deleteFromStorage(namespacedKey);
        }
        return deleted;
    }
    /**
     * Clear all entries
     */
    clear() {
        this.cache.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccessTime: 0,
            accessCount: 0,
        };
        if (this.backend !== 'memory') {
            this.clearStorage();
        }
        loggingService.info('Cache cleared', 'CacheService', { namespace: this.namespace });
    }
    /**
     * Get or set (fetch if not exists)
     */
    async getOrSet(key, factory, ttl) {
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const value = await factory();
        this.set(key, value, ttl);
        return value;
    }
    /**
     * Get multiple keys
     */
    getMany(keys) {
        const results = new Map();
        for (const key of keys) {
            const value = this.get(key);
            if (value !== undefined) {
                results.set(key, value);
            }
        }
        return results;
    }
    /**
     * Set multiple entries
     */
    setMany(entries, ttl) {
        for (const [key, value] of entries) {
            this.set(key, value, ttl);
        }
    }
    /**
     * Evict entry based on strategy
     */
    evict() {
        if (this.cache.size === 0) {
            return;
        }
        let keyToEvict;
        switch (this.strategy) {
            case 'LRU': // Least Recently Used
                keyToEvict = this.findLRUKey();
                break;
            case 'LFU': // Least Frequently Used
                keyToEvict = this.findLFUKey();
                break;
            case 'FIFO': // First In First Out
                keyToEvict = this.findFIFOKey();
                break;
            case 'TTL': // Expire oldest by TTL
                keyToEvict = this.findExpiredKey();
                break;
        }
        if (keyToEvict) {
            this.cache.delete(keyToEvict);
            this.stats.evictions++;
            if (this.backend !== 'memory') {
                this.deleteFromStorage(keyToEvict);
            }
        }
    }
    /**
     * Find least recently used key
     */
    findLRUKey() {
        let oldestKey;
        let oldestTime = Infinity;
        for (const [key, entry] of this.cache) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    /**
     * Find least frequently used key
     */
    findLFUKey() {
        let leastUsedKey;
        let leastCount = Infinity;
        for (const [key, entry] of this.cache) {
            if (entry.accessCount < leastCount) {
                leastCount = entry.accessCount;
                leastUsedKey = key;
            }
        }
        return leastUsedKey;
    }
    /**
     * Find first in first out key
     */
    findFIFOKey() {
        let oldestKey;
        let oldestTime = Infinity;
        for (const [key, entry] of this.cache) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        return oldestKey;
    }
    /**
     * Find expired key
     */
    findExpiredKey() {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt && entry.expiresAt < now) {
                return key;
            }
        }
        // If no expired, use oldest
        return this.findFIFOKey();
    }
    /**
     * Get namespaced key
     */
    getNamespacedKey(key) {
        return `${this.namespace}:${key}`;
    }
    /**
     * Estimate size of value
     */
    estimateSize(value) {
        try {
            // Rough estimate: stringify and measure
            const json = JSON.stringify(value);
            return json.length * 2; // UTF-16 chars are 2 bytes
        }
        catch {
            return 1000; // Default estimate
        }
    }
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.size;
        }
        return total;
    }
    /**
     * Record access time for stats
     */
    recordAccessTime(startTime) {
        if (this.enableStats) {
            const duration = performance.now() - startTime;
            this.stats.totalAccessTime += duration;
            this.stats.accessCount++;
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? this.stats.hits / total : 0;
        const avgAccessTime = this.stats.accessCount > 0 ? this.stats.totalAccessTime / this.stats.accessCount : 0;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            evictions: this.stats.evictions,
            entries: this.cache.size,
            memoryUsageMB: this.getCurrentMemoryUsage() / 1048576,
            hitRate,
            averageAccessTime: avgAccessTime,
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalAccessTime: 0,
            accessCount: 0,
        };
    }
    /**
     * Get all keys
     */
    keys() {
        const prefix = `${this.namespace}:`;
        return Array.from(this.cache.keys())
            .filter((k) => k.startsWith(prefix))
            .map((k) => k.substring(prefix.length));
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
    /**
     * Start automatic cleanup of expired entries
     */
    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 60000); // Run every minute
    }
    /**
     * Stop automatic cleanup
     */
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = undefined;
        }
    }
    /**
     * Clean up expired entries
     */
    cleanupExpired() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache) {
            if (entry.expiresAt && entry.expiresAt < now) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
            if (this.backend !== 'memory') {
                this.deleteFromStorage(key);
            }
        }
        if (keysToDelete.length > 0) {
            loggingService.debug(`Cleaned up ${keysToDelete.length} expired cache entries`, 'CacheService');
        }
    }
    /**
     * Load from persistent storage
     */
    loadFromStorage() {
        if (this.backend === 'localStorage') {
            this.loadFromLocalStorage();
        }
        else if (this.backend === 'indexedDB') {
            // IndexedDB loading would be async, handled separately
            loggingService.info('IndexedDB backend not yet implemented', 'CacheService');
        }
    }
    /**
     * Load from localStorage
     */
    loadFromLocalStorage() {
        try {
            const prefix = `cache:${this.namespace}:`;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        const entry = JSON.parse(value);
                        const cacheKey = key.substring(`cache:`.length);
                        this.cache.set(cacheKey, entry);
                    }
                }
            }
        }
        catch (error) {
            loggingService.error('Failed to load cache from localStorage', 'CacheService', error);
        }
    }
    /**
     * Persist to storage
     */
    persistToStorage(key, entry) {
        if (this.backend === 'localStorage') {
            this.persistToLocalStorage(key, entry);
        }
    }
    /**
     * Persist to localStorage
     */
    persistToLocalStorage(key, entry) {
        try {
            localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
        }
        catch (error) {
            loggingService.error('Failed to persist to localStorage', 'CacheService', error);
        }
    }
    /**
     * Delete from storage
     */
    deleteFromStorage(key) {
        if (this.backend === 'localStorage') {
            localStorage.removeItem(`cache:${key}`);
        }
    }
    /**
     * Clear storage
     */
    clearStorage() {
        if (this.backend === 'localStorage') {
            const prefix = `cache:${this.namespace}:`;
            const keysToDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                localStorage.removeItem(key);
            }
        }
    }
    /**
     * Warm cache with data
     */
    async warm(keys, factory, ttl) {
        const promises = keys.map(async (key) => {
            if (!this.has(key)) {
                const value = await factory(key);
                this.set(key, value, ttl);
            }
        });
        await Promise.all(promises);
        loggingService.info(`Cache warmed with ${keys.length} entries`, 'CacheService');
    }
    /**
     * Shutdown cache service
     */
    shutdown() {
        this.stopCleanup();
        this.clear();
        loggingService.info('Cache service shut down', 'CacheService');
    }
}
/**
 * Global cache service instance
 */
const cacheService = new CacheService({
    strategy: 'LRU',
    backend: 'memory',
    maxSize: 1000,
    maxMemoryMB: 100,
    defaultTTL: 300000, // 5 minutes
    enableStats: true,
    namespace: 'app',
});
/**
 * Default export for better CommonJS compatibility
 */
/* harmony default export */ const services_cacheService = ((/* unused pure expression or super */ null && (CacheService)));

// EXTERNAL MODULE: ./src/renderer/store/useNotificationStore.ts
var useNotificationStore = __webpack_require__(79455);
;// ./src/renderer/services/notificationService.ts
/**
 * Notification Service
 * Centralized notification management with toast notifications and system tray integration
 */

/**
 * Notification Service Class
 * Provides a class-based API for notification management
 */
class NotificationService {
    store = useNotificationStore.useNotificationStore;
    // ========================================
    // Toast Notifications
    // ========================================
    /**
     * Show a success toast notification
     */
    showSuccess(message, options) {
        return this.store.getState().showSuccess(message, options);
    }
    /**
     * Show an error toast notification
     */
    showError(message, options) {
        return this.store.getState().showError(message, options);
    }
    /**
     * Show a warning toast notification
     */
    showWarning(message, options) {
        return this.store.getState().showWarning(message, options);
    }
    /**
     * Show an info toast notification
     */
    showInfo(message, options) {
        return this.store.getState().showInfo(message, options);
    }
    /**
     * Show a toast notification with custom type
     */
    showToast(type, message, options) {
        return this.store.getState().showToast(type, message, options);
    }
    /**
     * Dismiss a specific toast
     */
    dismissToast(id) {
        this.store.getState().dismissToast(id);
    }
    /**
     * Dismiss all active toasts
     */
    dismissAllToasts() {
        this.store.getState().dismissAllToasts();
    }
    // ========================================
    // Notification Center
    // ========================================
    /**
     * Add a notification to the notification center
     */
    addNotification(notification) {
        return this.store.getState().addNotification(notification);
    }
    /**
     * Get all notifications
     */
    getNotifications() {
        return this.store.getState().getNotifications();
    }
    /**
     * Get filtered notifications
     */
    getFilteredNotifications() {
        return this.store.getState().getFilteredNotifications();
    }
    /**
     * Mark a notification as read
     */
    markAsRead(id) {
        this.store.getState().markAsRead(id);
    }
    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
        this.store.getState().markAllAsRead();
    }
    /**
     * Delete a notification
     */
    deleteNotification(id) {
        this.store.getState().deleteNotification(id);
    }
    /**
     * Clear all notifications
     */
    clearAll() {
        this.store.getState().clearAll();
    }
    /**
     * Pin/unpin a notification
     */
    pinNotification(id, pinned) {
        this.store.getState().pinNotification(id, pinned);
    }
    /**
     * Get notification statistics
     */
    getStats() {
        return this.store.getState().getStats();
    }
    /**
     * Get unread notification count
     */
    getUnreadCount() {
        return this.store.getState().getUnreadCount();
    }
    // ========================================
    // System Tray Notifications (Electron)
    // ========================================
    /**
     * Show a system tray notification (Electron native)
     */
    async showSystemNotification(options) {
        const { title, body, icon, silent, onClick } = options;
        // Check if Notification API is available
        if (!('Notification' in window)) {
            console.warn('System notifications not supported in this environment');
            return;
        }
        // Request permission if needed
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission denied');
                return;
            }
        }
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: icon || '/icon.png',
                silent: silent ?? false,
                tag: 'manda-discovery', // Prevents duplicate notifications
            });
            if (onClick) {
                notification.onclick = onClick;
            }
            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    }
    /**
     * Show system notification for success
     */
    async showSystemSuccess(title, body) {
        await this.showSystemNotification({
            title,
            body,
            icon: '/icons/success.png',
        });
    }
    /**
     * Show system notification for error
     */
    async showSystemError(title, body) {
        await this.showSystemNotification({
            title,
            body,
            icon: '/icons/error.png',
            silent: false,
        });
    }
    /**
     * Show system notification for warning
     */
    async showSystemWarning(title, body) {
        await this.showSystemNotification({
            title,
            body,
            icon: '/icons/warning.png',
        });
    }
    /**
     * Show system notification for info
     */
    async showSystemInfo(title, body) {
        await this.showSystemNotification({
            title,
            body,
            icon: '/icons/info.png',
        });
    }
    // ========================================
    // Convenience Methods
    // ========================================
    /**
     * Show notification for PowerShell execution completion
     */
    notifyExecutionComplete(scriptName, success, duration) {
        const message = success
            ? `Script "${scriptName}" completed successfully in ${(duration / 1000).toFixed(1)}s`
            : `Script "${scriptName}" failed`;
        const type = success ? 'success' : 'error';
        return this.showToast(type, message, {
            duration: success ? 5000 : 0, // Errors don't auto-dismiss
            actions: success
                ? []
                : [
                    {
                        label: 'View Details',
                        onClick: () => {
                            // Navigate to execution log or show details
                            console.log('View execution details');
                        },
                        variant: 'primary',
                        dismissOnClick: true,
                    },
                ],
        });
    }
    /**
     * Show notification for discovery completion
     */
    notifyDiscoveryComplete(discoveryType, itemsFound) {
        return this.showSuccess(`${discoveryType} discovery complete: ${itemsFound} items found`, {
            duration: 7000,
            actions: [
                {
                    label: 'View Results',
                    onClick: () => {
                        // Navigate to discovery results
                        console.log('Navigate to discovery results');
                    },
                    variant: 'primary',
                    dismissOnClick: true,
                },
            ],
        });
    }
    /**
     * Show notification for migration progress
     */
    notifyMigrationProgress(waveName, progress, status) {
        const message = `Migration wave "${waveName}": ${progress}% complete`;
        return this.showInfo(message, {
            duration: 0, // Don't auto-dismiss during migration
            showProgress: true,
            actions: [
                {
                    label: 'View Details',
                    onClick: () => {
                        // Navigate to migration execution view
                        console.log('Navigate to migration view');
                    },
                    variant: 'primary',
                    dismissOnClick: false, // Keep notification open
                },
            ],
        });
    }
    /**
     * Show notification for validation errors
     */
    notifyValidationErrors(errorCount, context) {
        return this.showError(`${errorCount} validation error${errorCount > 1 ? 's' : ''} found in ${context}`, {
            duration: 0,
            actions: [
                {
                    label: 'Fix Errors',
                    onClick: () => {
                        // Navigate to validation view
                        console.log('Navigate to validation view');
                    },
                    variant: 'danger',
                    dismissOnClick: true,
                },
            ],
        });
    }
    /**
     * Subscribe to store changes
     */
    subscribe(callback) {
        return this.store.subscribe(callback);
    }
}
// Export singleton instance
const notificationService = new NotificationService();
// Export class for testing or custom instances
/* harmony default export */ const services_notificationService = ((/* unused pure expression or super */ null && (NotificationService)));

;// ./src/renderer/services/progressService.ts
/**
 * Progress Service
 * Global progress tracking for long-running operations
 * Supports indeterminate/determinate progress, multi-task tracking, hierarchical progress
 */

/**
 * Progress Service Class
 */
class ProgressService {
    tasks = new Map();
    listeners = new Set();
    historyLimit = 50;
    history = [];
    // ========================================
    // Task Management
    // ========================================
    /**
     * Start a new progress task
     */
    startTask(title, options = {}) {
        const taskId = this.generateTaskId();
        const task = {
            id: taskId,
            title,
            description: options.description,
            status: 'running',
            type: options.type || 'indeterminate',
            percentage: options.type === 'determinate' ? 0 : undefined,
            totalItems: options.totalItems,
            itemsProcessed: 0,
            startTime: new Date(),
            cancellable: options.cancellable ?? false,
            onCancel: options.onCancel,
            subtasks: [],
        };
        this.tasks.set(taskId, task);
        this.notifyListeners();
        // Show notification if requested
        if (options.notification?.showToast) {
            notificationService.showInfo(`Started: ${title}`, {
                duration: 3000,
            });
        }
        return taskId;
    }
    /**
     * Update task progress
     */
    updateProgress(taskId, update) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        // Update task
        if (update.percentage !== undefined) {
            task.percentage = Math.min(100, Math.max(0, update.percentage));
        }
        if (update.currentItem !== undefined) {
            task.currentItem = update.currentItem;
        }
        if (update.itemsProcessed !== undefined) {
            task.itemsProcessed = update.itemsProcessed;
            // Auto-calculate percentage if totalItems is known
            if (task.totalItems && task.type === 'determinate') {
                task.percentage = Math.round((update.itemsProcessed / task.totalItems) * 100);
            }
        }
        // Calculate estimated time remaining
        if (task.percentage && task.percentage > 0) {
            const elapsed = Date.now() - task.startTime.getTime();
            const estimatedTotal = (elapsed / task.percentage) * 100;
            task.estimatedTimeRemaining = estimatedTotal - elapsed;
        }
        this.notifyListeners();
    }
    /**
     * Complete a task
     */
    completeTask(taskId, notification) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        task.status = 'completed';
        task.endTime = new Date();
        task.percentage = 100;
        this.moveToHistory(task);
        this.notifyListeners();
        // Show notification
        if (notification?.showToast) {
            const duration = (task.endTime.getTime() - task.startTime.getTime()) / 1000;
            notificationService.showSuccess(`Completed: ${task.title} (${duration.toFixed(1)}s)`, {
                duration: 5000,
            });
        }
    }
    /**
     * Fail a task
     */
    failTask(taskId, error, notification) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        task.status = 'failed';
        task.endTime = new Date();
        task.error = error;
        this.moveToHistory(task);
        this.notifyListeners();
        // Show notification
        if (notification?.showToast) {
            notificationService.showError(`Failed: ${task.title} - ${error}`, {
                duration: 0, // Don't auto-dismiss errors
            });
        }
    }
    /**
     * Cancel a task
     */
    cancelTask(taskId, notification) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        if (!task.cancellable) {
            console.warn(`Task ${taskId} is not cancellable`);
            return;
        }
        // Call cancel handler
        if (task.onCancel) {
            try {
                task.onCancel();
            }
            catch (error) {
                console.error('Error calling onCancel handler:', error);
            }
        }
        task.status = 'cancelled';
        task.endTime = new Date();
        this.moveToHistory(task);
        this.notifyListeners();
        // Show notification
        if (notification?.showToast) {
            notificationService.showWarning(`Cancelled: ${task.title}`, {
                duration: 3000,
            });
        }
    }
    /**
     * Remove a task (for completed/failed/cancelled tasks)
     */
    removeTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task && task.status === 'running') {
            console.warn('Cannot remove running task. Cancel or complete it first.');
            return;
        }
        this.tasks.delete(taskId);
        this.notifyListeners();
    }
    /**
     * Clear all completed/failed/cancelled tasks
     */
    clearCompletedTasks() {
        const toRemove = [];
        this.tasks.forEach((task, id) => {
            if (task.status !== 'running') {
                toRemove.push(id);
            }
        });
        toRemove.forEach((id) => this.tasks.delete(id));
        this.notifyListeners();
    }
    // ========================================
    // Hierarchical Progress (Subtasks)
    // ========================================
    /**
     * Add a subtask to a parent task
     */
    addSubtask(taskId, subtaskTitle) {
        const task = this.tasks.get(taskId);
        if (!task)
            return '';
        const subtaskId = `${taskId}-sub-${task.subtasks.length}`;
        const subtask = {
            id: subtaskId,
            title: subtaskTitle,
            percentage: 0,
            status: 'pending',
        };
        task.subtasks.push(subtask);
        this.notifyListeners();
        return subtaskId;
    }
    /**
     * Update subtask progress
     */
    updateSubtask(taskId, subtaskId, update) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        const subtask = task.subtasks.find((st) => st.id === subtaskId);
        if (!subtask)
            return;
        if (update.percentage !== undefined) {
            subtask.percentage = update.percentage;
        }
        if (update.status !== undefined) {
            subtask.status = update.status;
        }
        // Recalculate parent task percentage based on subtasks
        if (task.subtasks.length > 0) {
            const totalPercentage = task.subtasks.reduce((sum, st) => sum + st.percentage, 0);
            task.percentage = Math.round(totalPercentage / task.subtasks.length);
        }
        this.notifyListeners();
    }
    // ========================================
    // Queries
    // ========================================
    /**
     * Get all active tasks
     */
    getTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * Get a specific task
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    /**
     * Get running tasks
     */
    getRunningTasks() {
        return this.getTasks().filter((t) => t.status === 'running');
    }
    /**
     * Check if any tasks are running
     */
    hasRunningTasks() {
        return this.getRunningTasks().length > 0;
    }
    /**
     * Get task count by status
     */
    getTaskCount(status) {
        if (!status)
            return this.tasks.size;
        return this.getTasks().filter((t) => t.status === status).length;
    }
    /**
     * Get task history
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
    }
    // ========================================
    // Convenience Methods
    // ========================================
    /**
     * Run a task with automatic progress tracking
     */
    async runTask(title, asyncFn, options = {}) {
        const taskId = this.startTask(title, {
            ...options,
            type: 'determinate',
        });
        try {
            const updateProgress = (percentage, message) => {
                this.updateProgress(taskId, {
                    percentage,
                    currentItem: message,
                });
            };
            const result = await asyncFn(updateProgress);
            this.completeTask(taskId, options.notification);
            return result;
        }
        catch (error) {
            this.failTask(taskId, error instanceof Error ? error.message : 'Unknown error', options.notification);
            throw error;
        }
    }
    /**
     * Track PowerShell script execution
     */
    trackScriptExecution(scriptName, options = {}) {
        return this.startTask(`Executing ${scriptName}`, {
            type: 'indeterminate',
            cancellable: options.cancellable,
            onCancel: options.onCancel,
            notification: { showToast: false }, // Don't show toast for scripts
        });
    }
    /**
     * Track discovery operation
     */
    trackDiscovery(discoveryType, expectedItems) {
        return this.startTask(`${discoveryType} Discovery`, {
            description: 'Scanning environment...',
            type: expectedItems ? 'determinate' : 'indeterminate',
            totalItems: expectedItems,
            cancellable: true,
            notification: { showToast: true },
        });
    }
    /**
     * Track migration operation
     */
    trackMigration(waveName, totalUsers) {
        return this.startTask(`Migrating Wave: ${waveName}`, {
            description: `Processing ${totalUsers} users...`,
            type: 'determinate',
            totalItems: totalUsers,
            cancellable: true,
            notification: { showToast: true },
        });
    }
    // ========================================
    // Helpers
    // ========================================
    /**
     * Generate unique task ID
     */
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Move task to history
     */
    moveToHistory(task) {
        this.tasks.delete(task.id);
        // Add to history
        this.history.unshift(task);
        // Limit history size
        if (this.history.length > this.historyLimit) {
            this.history = this.history.slice(0, this.historyLimit);
        }
    }
    /**
     * Subscribe to progress updates
     */
    subscribe(listener) {
        this.listeners.add(listener);
        // Immediately notify with current state
        listener(this.getTasks());
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Notify all listeners
     */
    notifyListeners() {
        const tasks = this.getTasks();
        this.listeners.forEach((listener) => {
            try {
                listener(tasks);
            }
            catch (error) {
                console.error('Progress listener error:', error);
            }
        });
    }
}
// Export singleton instance
const progressService = new ProgressService();
// Export class for testing
/* harmony default export */ const services_progressService = ((/* unused pure expression or super */ null && (ProgressService)));

;// ./src/renderer/hooks/useDiscovery.ts



/**
 * Enhanced generic discovery hook with advanced features
 */
function useDiscovery(type, profileId, options = {}) {
    const { enableCaching = true, cacheTTL = 5 * 60 * 1000, // 5 minutes
    enableRetry = true, maxRetries = 3, retryDelay = 1000, enableProgressTracking = true, enableCancellation = true, incremental = false, lastModified, validationSchema, } = options;
    const [state, setState] = (0,react.useState)({
        progress: 0,
        rows: [],
        error: null,
        isRunning: false,
        isCancelling: false,
        retryCount: 0,
        itemsProcessed: 0,
    });
    const buffer = (0,react.useRef)([]);
    const progressTaskId = (0,react.useRef)();
    const abortController = (0,react.useRef)();
    const retryTimeout = (0,react.useRef)();
    const getCacheKey = (0,react.useCallback)((args) => {
        const keyData = { type, profileId, args, incremental, lastModified };
        return `discovery:${type}:${profileId}:${JSON.stringify(keyData)}`;
    }, [type, profileId, incremental, lastModified]);
    const validateRow = (0,react.useCallback)((row) => {
        if (!validationSchema)
            return true;
        // Basic validation - could be enhanced with a schema validator
        try {
            // Simple required fields check
            if (validationSchema.required) {
                for (const field of validationSchema.required) {
                    if (!row[field])
                        return false;
                }
            }
            return true;
        }
        catch {
            return false;
        }
    }, [validationSchema]);
    const transformRow = (0,react.useCallback)((row) => {
        // Apply data transformations if needed
        if (validationSchema?.transform) {
            return validationSchema.transform(row);
        }
        return row;
    }, [validationSchema]);
    const start = (0,react.useCallback)(async (args = {}) => {
        if (!window.electronAPI) {
            setState(prev => ({ ...prev, error: "Electron API not available" }));
            return;
        }
        if (!profileId) {
            setState(prev => ({ ...prev, error: "No profile selected" }));
            return;
        }
        const cacheKey = getCacheKey(args);
        // Check cache first
        if (enableCaching) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                setState(prev => ({
                    ...prev,
                    rows: cached,
                    progress: 100,
                    cacheHit: true,
                    lastRun: new Date(),
                }));
                console.log(`[useDiscovery] Cache hit for ${type}`);
                return;
            }
        }
        // Initialize state
        setState(prev => ({
            ...prev,
            error: null,
            progress: 0,
            rows: [],
            isRunning: true,
            isCancelling: false,
            retryCount: 0,
            cacheHit: false,
            currentItem: undefined,
            itemsProcessed: 0,
            totalItems: undefined,
        }));
        buffer.current = [];
        abortController.current = new AbortController();
        // Start progress tracking
        if (enableProgressTracking) {
            progressTaskId.current = progressService.trackDiscovery(type);
        }
        const executeDiscovery = async (retryCount = 0) => {
            try {
                // Use existing Electron API methods - the type errors are due to type mismatches
                // that need to be resolved in the actual Electron API implementation
                const result = await window.electronAPI.startDiscovery({
                    type,
                    profileId,
                    args,
                });
                setState(prev => ({ ...prev, runId: result?.runId }));
                console.log(`[useDiscovery] Started ${type} discovery with runId: ${result.runId}`);
            }
            catch (err) {
                if (err.name === 'AbortError') {
                    console.log(`[useDiscovery] ${type} discovery was cancelled`);
                    return;
                }
                console.error(`[useDiscovery] Failed to start discovery:`, err);
                // Retry logic
                if (enableRetry && retryCount < maxRetries) {
                    console.log(`[useDiscovery] Retrying ${type} discovery (${retryCount + 1}/${maxRetries})...`);
                    setState(prev => ({ ...prev, retryCount: retryCount + 1 }));
                    retryTimeout.current = setTimeout(() => {
                        executeDiscovery(retryCount + 1);
                    }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
                    return;
                }
                setState(prev => ({
                    ...prev,
                    error: err.message || "Failed to start discovery",
                    isRunning: false,
                }));
                if (progressTaskId.current) {
                    progressService.failTask(progressTaskId.current, err.message);
                }
            }
        };
        await executeDiscovery();
    }, [type, profileId, enableCaching, enableRetry, maxRetries, retryDelay, enableProgressTracking, getCacheKey, incremental, lastModified]);
    const cancel = (0,react.useCallback)(async () => {
        if (!state.isRunning || state.isCancelling)
            return;
        setState(prev => ({ ...prev, isCancelling: true }));
        // Cancel abort controller
        abortController.current?.abort();
        // Clear retry timeout
        if (retryTimeout.current) {
            clearTimeout(retryTimeout.current);
            retryTimeout.current = undefined;
        }
        // Cancel progress task
        if (progressTaskId.current) {
            progressService.cancelTask(progressTaskId.current);
            progressTaskId.current = undefined;
        }
        // Cancel via Electron API if possible
        if (state.runId && window.electronAPI?.cancelDiscovery) {
            try {
                await window.electronAPI.cancelDiscovery(state.runId);
            }
            catch (err) {
                console.warn('Failed to cancel discovery via API:', err);
            }
        }
        setState(prev => ({
            ...prev,
            isRunning: false,
            isCancelling: false,
            error: "Discovery cancelled by user",
        }));
    }, [state.isRunning, state.isCancelling, state.runId]);
    const clearResults = (0,react.useCallback)(() => {
        setState(prev => ({
            ...prev,
            rows: [],
            error: null,
            progress: 0,
            cacheHit: false,
        }));
        if (enableCaching) {
            const cacheKey = getCacheKey({});
            cacheService.delete(cacheKey);
        }
    }, [enableCaching, getCacheKey]);
    // Listen for progress events
    (0,react.useEffect)(() => {
        if (!window.electronAPI || !state.runId)
            return;
        const onProgress = (e) => {
            if (e.runId !== state.runId)
                return;
            setState(prev => {
                const updates = {};
                if (e.pct !== undefined) {
                    updates.progress = e.pct;
                }
                if (e.currentItem) {
                    updates.currentItem = e.currentItem;
                }
                if (e.itemsProcessed !== undefined) {
                    updates.itemsProcessed = e.itemsProcessed;
                }
                if (e.totalItems !== undefined) {
                    updates.totalItems = e.totalItems;
                }
                if (e.estimatedTimeRemaining !== undefined) {
                    updates.estimatedTimeRemaining = e.estimatedTimeRemaining;
                }
                return { ...prev, ...updates };
            });
            if (e.msg) {
                console.log(`[useDiscovery] ${type}: ${e.msg}`);
            }
            if (progressTaskId.current) {
                progressService.updateProgress(progressTaskId.current, {
                    percentage: e.pct,
                    currentItem: e.currentItem,
                    itemsProcessed: e.itemsProcessed,
                });
            }
            if (e.row) {
                const transformedRow = transformRow(e.row);
                if (validateRow(transformedRow)) {
                    buffer.current.push(transformedRow);
                    // Batch updates for performance - flush every 200 rows
                    if (buffer.current.length >= 200) {
                        setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
                        buffer.current = [];
                    }
                }
                else {
                    console.warn(`[useDiscovery] Invalid row skipped:`, e.row);
                }
            }
        };
        const onResult = (e) => {
            if (e.runId !== state.runId)
                return;
            // Flush remaining buffered rows
            if (buffer.current.length > 0) {
                setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
                buffer.current = [];
            }
            const finalRows = [...state.rows];
            const cacheKey = e.cacheKey || getCacheKey({});
            // Cache results
            if (enableCaching && finalRows.length > 0) {
                cacheService.set(cacheKey, finalRows, cacheTTL);
            }
            setState(prev => ({
                ...prev,
                progress: 100,
                isRunning: false,
                lastRun: new Date(),
            }));
            if (progressTaskId.current) {
                progressService.completeTask(progressTaskId.current);
                progressTaskId.current = undefined;
            }
            console.log(`[useDiscovery] ${type} completed in ${e.durationMs}ms, cached: ${!!cacheKey}`);
        };
        const onError = (e) => {
            if (e.runId !== state.runId)
                return;
            setState(prev => ({
                ...prev,
                error: e.message,
                isRunning: false,
            }));
            if (progressTaskId.current) {
                progressService.failTask(progressTaskId.current, e.message);
                progressTaskId.current = undefined;
            }
            console.error(`[useDiscovery] ${type} error:`, e);
        };
        window.electronAPI.onDiscoveryProgress(onProgress);
        window.electronAPI.onDiscoveryResult(onResult);
        window.electronAPI.onDiscoveryError(onError);
        // Cleanup listeners on unmount (if API supports it)
        return () => {
            // Note: Electron IPC doesn't have a built-in "off" by default
            // If you add removeListener support to preload, wire it here
        };
    }, [state.runId, state.rows, type, enableCaching, cacheTTL, getCacheKey, transformRow, validateRow]);
    // Periodic flush of buffered rows (every 500ms)
    (0,react.useEffect)(() => {
        const interval = setInterval(() => {
            if (buffer.current.length > 0) {
                setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
                buffer.current = [];
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);
    return {
        // State
        ...state,
        // Actions
        start,
        cancel: enableCancellation ? cancel : undefined,
        clearResults,
        // Computed properties
        canStart: !state.isRunning,
        canCancel: enableCancellation && state.isRunning && !state.isCancelling,
        hasResults: state.rows.length > 0,
    };
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLGNBQWMseUNBQXlDLDJCQUEyQjtBQUMxRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZUFBZSxHQUFHLElBQUk7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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ZUFBZTtBQUMvQjtBQUNBO0FBQ0EsMENBQTBDLE1BQU0sZUFBZSxhQUFhLGNBQWMsV0FBVztBQUNyRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsZ0JBQWdCLGVBQWU7QUFDL0I7QUFDQTtBQUNBLDRDQUE0QyxNQUFNO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksbUJBQVM7QUFDYjtBQUNBO0FBQ0Esb0NBQW9DLGlEQUFpRDtBQUNyRjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvRGF0YVRhYmxlLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL0RhdGFUYWJsZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9DaGVja2JveC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc2VydmljZXMvbG9nZ2luZ1NlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc2VydmljZXMvY2FjaGVTZXJ2aWNlLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3NlcnZpY2VzL25vdGlmaWNhdGlvblNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc2VydmljZXMvcHJvZ3Jlc3NTZXJ2aWNlLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZURpc2NvdmVyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBEYXRhIFRhYmxlIENvbXBvbmVudFxuICogU2ltcGxlciBhbHRlcm5hdGl2ZSB0byBBRyBHcmlkIHdpdGggYnVpbHQtaW4gc29ydGluZywgZmlsdGVyaW5nLCBhbmQgcGFnaW5hdGlvblxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZU1lbW8sIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENoZXZyb25VcCwgQ2hldnJvbkRvd24sIENoZXZyb25zVXBEb3duLCBTZWFyY2gsIENoZXZyb25MZWZ0LCBDaGV2cm9uUmlnaHQsIENvbHVtbnMsIERvd25sb2FkLCBDb3B5LCBFeWUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IFBhcGEgZnJvbSAncGFwYXBhcnNlJztcbmltcG9ydCB7IE1lbnUsIEl0ZW0sIHVzZUNvbnRleHRNZW51IH0gZnJvbSAncmVhY3QtY29udGV4aWZ5JztcbmltcG9ydCAncmVhY3QtY29udGV4aWZ5L2Rpc3QvUmVhY3RDb250ZXhpZnkuY3NzJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgQ2hlY2tib3ggfSBmcm9tICcuLi9hdG9tcy9DaGVja2JveCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgdXNlVGFiU3RvcmUgfSBmcm9tICcuLi8uLi9zdG9yZS91c2VUYWJTdG9yZSc7XG4vKipcbiAqIERhdGEgVGFibGUgQ29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIERhdGFUYWJsZSh7IGRhdGEsIGNvbHVtbnMsIHNlbGVjdGFibGUgPSBmYWxzZSwgb25TZWxlY3Rpb25DaGFuZ2UsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdlU2l6ZSA9IDI1LCBzZWFyY2hhYmxlID0gdHJ1ZSwgc2VhcmNoUGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgbG9hZGluZyA9IGZhbHNlLCBlbXB0eU1lc3NhZ2UgPSAnTm8gZGF0YSBhdmFpbGFibGUnLCBvblJvd0NsaWNrLCBnZXRSb3dJZCA9IChfLCBpbmRleCkgPT4gaW5kZXgudG9TdHJpbmcoKSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSA9ICdkYXRhLXRhYmxlJywgY29sdW1uVmlzaWJpbGl0eSA9IHRydWUsIGV4cG9ydGFibGUgPSB0cnVlLCBleHBvcnRGaWxlbmFtZSA9ICdleHBvcnQnLCBjb250ZXh0TWVudSA9IHRydWUsIG9uVmlld0RldGFpbHMsIGRldGFpbFZpZXdDb21wb25lbnQsIGdldERldGFpbFZpZXdUaXRsZSwgfSkge1xuICAgIGNvbnN0IFtzZWFyY2hUZXJtLCBzZXRTZWFyY2hUZXJtXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc29ydENvbHVtbiwgc2V0U29ydENvbHVtbl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc29ydERpcmVjdGlvbiwgc2V0U29ydERpcmVjdGlvbl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbY3VycmVudFBhZ2UsIHNldEN1cnJlbnRQYWdlXSA9IHVzZVN0YXRlKDEpO1xuICAgIGNvbnN0IFtzZWxlY3RlZFJvd3MsIHNldFNlbGVjdGVkUm93c10gPSB1c2VTdGF0ZShuZXcgU2V0KCkpO1xuICAgIGNvbnN0IFtjb2x1bW5WaXNpYmlsaXR5U3RhdGUsIHNldENvbHVtblZpc2liaWxpdHlTdGF0ZV0gPSB1c2VTdGF0ZSgoKSA9PiBjb2x1bW5zLnJlZHVjZSgoYWNjLCBjb2wpID0+ICh7IC4uLmFjYywgW2NvbC5pZF06IGNvbC52aXNpYmxlICE9PSBmYWxzZSB9KSwge30pKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtbk1lbnUsIHNldFNob3dDb2x1bW5NZW51XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBjb2x1bW5NZW51UmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IHsgb3BlblRhYiB9ID0gdXNlVGFiU3RvcmUoKTtcbiAgICAvLyBDb250ZXh0IG1lbnUgc2V0dXBcbiAgICBjb25zdCBNRU5VX0lEID0gYGRhdGEtdGFibGUtJHtkYXRhQ3l9YDtcbiAgICBjb25zdCB7IHNob3cgfSA9IHVzZUNvbnRleHRNZW51KHsgaWQ6IE1FTlVfSUQgfSk7XG4gICAgLy8gR2V0IGNlbGwgdmFsdWVcbiAgICBjb25zdCBnZXRDZWxsVmFsdWUgPSAocm93LCBjb2x1bW4pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb2x1bW4uYWNjZXNzb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBjb2x1bW4uYWNjZXNzb3Iocm93KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93W2NvbHVtbi5hY2Nlc3Nvcl07XG4gICAgfTtcbiAgICAvLyBGaWx0ZXIgZGF0YSBiYXNlZCBvbiBzZWFyY2ggdGVybVxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXNlYXJjaFRlcm0pXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgcmV0dXJuIGRhdGEuZmlsdGVyKChyb3cpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2x1bW5zLnNvbWUoKGNvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29sdW1uLmZpbHRlcmFibGUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENlbGxWYWx1ZShyb3csIGNvbHVtbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXJtLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sIFtkYXRhLCBzZWFyY2hUZXJtLCBjb2x1bW5zXSk7XG4gICAgLy8gU29ydCBkYXRhXG4gICAgY29uc3Qgc29ydGVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXNvcnRDb2x1bW4gfHwgIXNvcnREaXJlY3Rpb24pXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWREYXRhO1xuICAgICAgICBjb25zdCBjb2x1bW4gPSBjb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSBzb3J0Q29sdW1uKTtcbiAgICAgICAgaWYgKCFjb2x1bW4pXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWREYXRhO1xuICAgICAgICByZXR1cm4gWy4uLmZpbHRlcmVkRGF0YV0uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3QgYVZhbHVlID0gZ2V0Q2VsbFZhbHVlKGEsIGNvbHVtbik7XG4gICAgICAgICAgICBjb25zdCBiVmFsdWUgPSBnZXRDZWxsVmFsdWUoYiwgY29sdW1uKTtcbiAgICAgICAgICAgIGlmIChhVmFsdWUgPT09IGJWYWx1ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBhVmFsdWUgPCBiVmFsdWUgPyAtMSA6IDE7XG4gICAgICAgICAgICByZXR1cm4gc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyBjb21wYXJpc29uIDogLWNvbXBhcmlzb247XG4gICAgICAgIH0pO1xuICAgIH0sIFtmaWx0ZXJlZERhdGEsIHNvcnRDb2x1bW4sIHNvcnREaXJlY3Rpb24sIGNvbHVtbnNdKTtcbiAgICAvLyBQYWdpbmF0ZSBkYXRhXG4gICAgY29uc3QgcGFnaW5hdGVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXBhZ2luYXRpb24pXG4gICAgICAgICAgICByZXR1cm4gc29ydGVkRGF0YTtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSAoY3VycmVudFBhZ2UgLSAxKSAqIHBhZ2VTaXplO1xuICAgICAgICBjb25zdCBlbmQgPSBzdGFydCArIHBhZ2VTaXplO1xuICAgICAgICByZXR1cm4gc29ydGVkRGF0YS5zbGljZShzdGFydCwgZW5kKTtcbiAgICB9LCBbc29ydGVkRGF0YSwgY3VycmVudFBhZ2UsIHBhZ2VTaXplLCBwYWdpbmF0aW9uXSk7XG4gICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbChzb3J0ZWREYXRhLmxlbmd0aCAvIHBhZ2VTaXplKTtcbiAgICAvLyBIYW5kbGUgc29ydFxuICAgIGNvbnN0IGhhbmRsZVNvcnQgPSAoY29sdW1uSWQpID0+IHtcbiAgICAgICAgY29uc3QgY29sdW1uID0gY29sdW1ucy5maW5kKChjb2wpID0+IGNvbC5pZCA9PT0gY29sdW1uSWQpO1xuICAgICAgICBpZiAoIWNvbHVtbj8uc29ydGFibGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChzb3J0Q29sdW1uID09PSBjb2x1bW5JZCkge1xuICAgICAgICAgICAgLy8gQ3ljbGUgdGhyb3VnaDogYXNjIC0+IGRlc2MgLT4gbnVsbFxuICAgICAgICAgICAgaWYgKHNvcnREaXJlY3Rpb24gPT09ICdhc2MnKSB7XG4gICAgICAgICAgICAgICAgc2V0U29ydERpcmVjdGlvbignZGVzYycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc29ydERpcmVjdGlvbiA9PT0gJ2Rlc2MnKSB7XG4gICAgICAgICAgICAgICAgc2V0U29ydENvbHVtbihudWxsKTtcbiAgICAgICAgICAgICAgICBzZXRTb3J0RGlyZWN0aW9uKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2V0U29ydENvbHVtbihjb2x1bW5JZCk7XG4gICAgICAgICAgICBzZXRTb3J0RGlyZWN0aW9uKCdhc2MnKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIHJvdyBzZWxlY3Rpb25cbiAgICBjb25zdCBoYW5kbGVSb3dTZWxlY3QgPSAocm93SWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV3U2VsZWN0ZWQgPSBuZXcgU2V0KHNlbGVjdGVkUm93cyk7XG4gICAgICAgIGlmIChuZXdTZWxlY3RlZC5oYXMocm93SWQpKSB7XG4gICAgICAgICAgICBuZXdTZWxlY3RlZC5kZWxldGUocm93SWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV3U2VsZWN0ZWQuYWRkKHJvd0lkKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRTZWxlY3RlZFJvd3MobmV3U2VsZWN0ZWQpO1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gZGF0YS5maWx0ZXIoKHJvdywgaW5kZXgpID0+IG5ld1NlbGVjdGVkLmhhcyhnZXRSb3dJZChyb3csIGluZGV4KSkpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWQpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0IGFsbFxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdEFsbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkUm93cy5zaXplID09PSBwYWdpbmF0ZWREYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3dzKG5ldyBTZXQoKSk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT8uKFtdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbElkcyA9IG5ldyBTZXQocGFnaW5hdGVkRGF0YS5tYXAoKHJvdywgaW5kZXgpID0+IGdldFJvd0lkKHJvdywgaW5kZXgpKSk7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZFJvd3MoYWxsSWRzKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPy4ocGFnaW5hdGVkRGF0YSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGFsbFNlbGVjdGVkID0gc2VsZWN0ZWRSb3dzLnNpemUgPT09IHBhZ2luYXRlZERhdGEubGVuZ3RoICYmIHBhZ2luYXRlZERhdGEubGVuZ3RoID4gMDtcbiAgICBjb25zdCBzb21lU2VsZWN0ZWQgPSBzZWxlY3RlZFJvd3Muc2l6ZSA+IDAgJiYgc2VsZWN0ZWRSb3dzLnNpemUgPCBwYWdpbmF0ZWREYXRhLmxlbmd0aDtcbiAgICAvLyBHZXQgdmlzaWJsZSBjb2x1bW5zXG4gICAgY29uc3QgdmlzaWJsZUNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2x1bW5WaXNpYmlsaXR5U3RhdGVbY29sLmlkXSk7XG4gICAgfSwgW2NvbHVtbnMsIGNvbHVtblZpc2liaWxpdHlTdGF0ZV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblZpc2liaWxpdHkgPSAoY29sdW1uSWQpID0+IHtcbiAgICAgICAgc2V0Q29sdW1uVmlzaWJpbGl0eVN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBbY29sdW1uSWRdOiAhcHJldltjb2x1bW5JZF1cbiAgICAgICAgfSkpO1xuICAgIH07XG4gICAgLy8gSGFuZGxlIGNvbnRleHQgbWVudVxuICAgIGNvbnN0IGhhbmRsZUNvbnRleHRNZW51ID0gKGV2ZW50LCByb3cpID0+IHtcbiAgICAgICAgaWYgKCFjb250ZXh0TWVudSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2hvdyh7IGV2ZW50LCBwcm9wczogeyByb3cgfSB9KTtcbiAgICB9O1xuICAgIC8vIEhhbmRsZSB2aWV3IGRldGFpbHNcbiAgICBjb25zdCBoYW5kbGVWaWV3RGV0YWlscyA9ICh7IHByb3BzIH0pID0+IHtcbiAgICAgICAgY29uc3Qgcm93ID0gcHJvcHMucm93O1xuICAgICAgICBpZiAob25WaWV3RGV0YWlscykge1xuICAgICAgICAgICAgb25WaWV3RGV0YWlscyhyb3cpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRldGFpbFZpZXdDb21wb25lbnQgJiYgZ2V0RGV0YWlsVmlld1RpdGxlKSB7XG4gICAgICAgICAgICBvcGVuVGFiKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZ2V0RGV0YWlsVmlld1RpdGxlKHJvdyksXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBkZXRhaWxWaWV3Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgIGljb246ICdFeWUnLFxuICAgICAgICAgICAgICAgIGNsb3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHJvd1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBjb3B5IHJvd1xuICAgIGNvbnN0IGhhbmRsZUNvcHlSb3cgPSAoeyBwcm9wcyB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHByb3BzLnJvdztcbiAgICAgICAgY29uc3Qgcm93VGV4dCA9IHZpc2libGVDb2x1bW5zXG4gICAgICAgICAgICAubWFwKGNvbCA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENlbGxWYWx1ZShyb3csIGNvbCk7XG4gICAgICAgICAgICByZXR1cm4gYCR7Y29sLmhlYWRlcn06ICR7dmFsdWV9YDtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKTtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocm93VGV4dCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBDb3VsZCBzaG93IGEgdG9hc3Qgbm90aWZpY2F0aW9uIGhlcmVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSb3cgY29waWVkIHRvIGNsaXBib2FyZCcpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8vIEhhbmRsZSBleHBvcnQgc2VsZWN0ZWRcbiAgICBjb25zdCBoYW5kbGVFeHBvcnRTZWxlY3RlZCA9ICh7IHByb3BzIH0pID0+IHtcbiAgICAgICAgY29uc3Qgcm93ID0gcHJvcHMucm93O1xuICAgICAgICBjb25zdCByb3dzVG9FeHBvcnQgPSBzZWxlY3RlZFJvd3Muc2l6ZSA+IDBcbiAgICAgICAgICAgID8gZGF0YS5maWx0ZXIoKF8sIGluZGV4KSA9PiBzZWxlY3RlZFJvd3MuaGFzKGdldFJvd0lkKF8sIGluZGV4KSkpXG4gICAgICAgICAgICA6IFtyb3ddO1xuICAgICAgICBleHBvcnRUb0NTVihyb3dzVG9FeHBvcnQpO1xuICAgIH07XG4gICAgLy8gRXhwb3J0IGRhdGEgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9DU1YgPSAoZGF0YVRvRXhwb3J0ID0gc29ydGVkRGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBjc3ZEYXRhID0gZGF0YVRvRXhwb3J0Lm1hcChyb3cgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3N2Um93ID0ge307XG4gICAgICAgICAgICB2aXNpYmxlQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRDZWxsVmFsdWUocm93LCBjb2wpO1xuICAgICAgICAgICAgICAgIGNzdlJvd1tjb2wuaGVhZGVyXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gY3N2Um93O1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY3N2ID0gUGFwYS51bnBhcnNlKGNzdkRhdGEpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2Nzdl0sIHsgdHlwZTogJ3RleHQvY3N2O2NoYXJzZXQ9dXRmLTg7JyB9KTtcbiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBgJHtleHBvcnRGaWxlbmFtZX1fJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YCk7XG4gICAgICAgIGxpbmsuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgfTtcbiAgICAvLyBDbG9zZSBjb2x1bW4gbWVudSB3aGVuIGNsaWNraW5nIG91dHNpZGVcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVDbGlja091dHNpZGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChjb2x1bW5NZW51UmVmLmN1cnJlbnQgJiYgIWNvbHVtbk1lbnVSZWYuY3VycmVudC5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgc2V0U2hvd0NvbHVtbk1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoc2hvd0NvbHVtbk1lbnUpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGhhbmRsZUNsaWNrT3V0c2lkZSk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgaGFuZGxlQ2xpY2tPdXRzaWRlKTtcbiAgICAgICAgfVxuICAgIH0sIFtzaG93Q29sdW1uTWVudV0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggZmxleC1jb2wgaC1mdWxsJywgY2xhc3NOYW1lKSwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFsoc2VhcmNoYWJsZSB8fCBjb2x1bW5WaXNpYmlsaXR5IHx8IGV4cG9ydGFibGUpICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbc2VhcmNoYWJsZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goSW5wdXQsIHsgdmFsdWU6IHNlYXJjaFRlcm0sIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VhcmNoVGVybShlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBzZWFyY2hQbGFjZWhvbGRlciwgc3RhcnRJY29uOiBfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBcImRhdGEtY3lcIjogXCJ0YWJsZS1zZWFyY2hcIiB9KSB9KSksIGNvbHVtblZpc2liaWxpdHkgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIHJlZjogY29sdW1uTWVudVJlZiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcIm1kXCIsIGljb246IF9qc3goQ29sdW1ucywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBzZXRTaG93Q29sdW1uTWVudSghc2hvd0NvbHVtbk1lbnUpLCBcImRhdGEtY3lcIjogXCJjb2x1bW4tdmlzaWJpbGl0eS1idG5cIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBzaG93Q29sdW1uTWVudSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSByaWdodC0wIHRvcC1mdWxsIG10LTIgdy02NCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcm91bmRlZC1sZyBzaGFkb3ctbGcgei01MCBtYXgtaC05NiBvdmVyZmxvdy15LWF1dG9cIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHgtMyBweS0yIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCB1cHBlcmNhc2VcIiwgY2hpbGRyZW46IFwiU2hvdy9IaWRlIENvbHVtbnNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTFcIiwgY2hpbGRyZW46IGNvbHVtbnMubWFwKGNvbHVtbiA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC0zIHB5LTIgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCByb3VuZGVkIGN1cnNvci1wb2ludGVyXCIsIFwiZGF0YS1jeVwiOiBgY29sdW1uLXRvZ2dsZS0ke2NvbHVtbi5pZH1gLCBjaGlsZHJlbjogW19qc3goQ2hlY2tib3gsIHsgY2hlY2tlZDogY29sdW1uVmlzaWJpbGl0eVN0YXRlW2NvbHVtbi5pZF0sIG9uQ2hhbmdlOiAoKSA9PiB0b2dnbGVDb2x1bW5WaXNpYmlsaXR5KGNvbHVtbi5pZCkgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDBcIiwgY2hpbGRyZW46IGNvbHVtbi5oZWFkZXIgfSldIH0sIGNvbHVtbi5pZCkpKSB9KV0gfSkgfSkpXSB9KSksIGV4cG9ydGFibGUgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwibWRcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBleHBvcnRUb0NTVigpLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydFwiIH0pKV0gfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1hdXRvIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeHMoXCJ0YWJsZVwiLCB7IGNsYXNzTmFtZTogXCJtaW4tdy1mdWxsIGRpdmlkZS15IGRpdmlkZS1ncmF5LTIwMCBkYXJrOmRpdmlkZS1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJ0aGVhZFwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmF5LTUwIGRhcms6YmctZ3JheS04MDAgc3RpY2t5IHRvcC0wIHotMTBcIiwgY2hpbGRyZW46IF9qc3hzKFwidHJcIiwgeyBjaGlsZHJlbjogW3NlbGVjdGFibGUgJiYgKF9qc3goXCJ0aFwiLCB7IGNsYXNzTmFtZTogXCJ3LTEyIHB4LTQgcHktM1wiLCBjaGlsZHJlbjogX2pzeChDaGVja2JveCwgeyBjaGVja2VkOiBhbGxTZWxlY3RlZCwgaW5kZXRlcm1pbmF0ZTogc29tZVNlbGVjdGVkLCBvbkNoYW5nZTogaGFuZGxlU2VsZWN0QWxsLCBcImRhdGEtY3lcIjogXCJzZWxlY3QtYWxsLWNoZWNrYm94XCIgfSkgfSkpLCB2aXNpYmxlQ29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKF9qc3goXCJ0aFwiLCB7IGNsYXNzTmFtZTogY2xzeCgncHgtNCBweS0zIHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyJywgY29sdW1uLnNvcnRhYmxlICYmICdjdXJzb3ItcG9pbnRlciBzZWxlY3Qtbm9uZSBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwJywgY29sdW1uLmFsaWduID09PSAnY2VudGVyJyAmJiAndGV4dC1jZW50ZXInLCBjb2x1bW4uYWxpZ24gPT09ICdyaWdodCcgJiYgJ3RleHQtcmlnaHQnKSwgc3R5bGU6IHsgd2lkdGg6IGNvbHVtbi53aWR0aCB9LCBvbkNsaWNrOiAoKSA9PiBjb2x1bW4uc29ydGFibGUgJiYgaGFuZGxlU29ydChjb2x1bW4uaWQpLCBcImRhdGEtY3lcIjogYGNvbHVtbi1oZWFkZXItJHtjb2x1bW4uaWR9YCwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY29sdW1uLmhlYWRlciB9KSwgY29sdW1uLnNvcnRhYmxlICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBzb3J0Q29sdW1uID09PSBjb2x1bW4uaWQgPyAoc29ydERpcmVjdGlvbiA9PT0gJ2FzYycgPyAoX2pzeChDaGV2cm9uVXAsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSkgOiAoX2pzeChDaGV2cm9uRG93biwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pKSkgOiAoX2pzeChDaGV2cm9uc1VwRG93biwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pKSB9KSldIH0pIH0sIGNvbHVtbi5pZCkpKV0gfSkgfSksIF9qc3goXCJ0Ym9keVwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIGRpdmlkZS15IGRpdmlkZS1ncmF5LTIwMCBkYXJrOmRpdmlkZS1ncmF5LTcwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFwidHJcIiwgeyBjaGlsZHJlbjogX2pzeChcInRkXCIsIHsgY29sU3BhbjogdmlzaWJsZUNvbHVtbnMubGVuZ3RoICsgKHNlbGVjdGFibGUgPyAxIDogMCksIGNsYXNzTmFtZTogXCJweC00IHB5LTggdGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFuaW1hdGUtc3BpbiByb3VuZGVkLWZ1bGwgaC01IHctNSBib3JkZXItYi0yIGJvcmRlci1ibHVlLTYwMFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkxvYWRpbmcuLi5cIiB9KV0gfSkgfSkgfSkpIDogcGFnaW5hdGVkRGF0YS5sZW5ndGggPT09IDAgPyAoX2pzeChcInRyXCIsIHsgY2hpbGRyZW46IF9qc3goXCJ0ZFwiLCB7IGNvbFNwYW46IHZpc2libGVDb2x1bW5zLmxlbmd0aCArIChzZWxlY3RhYmxlID8gMSA6IDApLCBjbGFzc05hbWU6IFwicHgtNCBweS04IHRleHQtY2VudGVyIHRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IGVtcHR5TWVzc2FnZSB9KSB9KSkgOiAocGFnaW5hdGVkRGF0YS5tYXAoKHJvdywgcm93SW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93SWQgPSBnZXRSb3dJZChyb3csIHJvd0luZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IHNlbGVjdGVkUm93cy5oYXMocm93SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwidHJcIiwgeyBjbGFzc05hbWU6IGNsc3goJ3RyYW5zaXRpb24tY29sb3JzJywgb25Sb3dDbGljayAmJiAnY3Vyc29yLXBvaW50ZXInLCBpc1NlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2hvdmVyOmJnLWdyYXktNTAgZGFyazpob3ZlcjpiZy1ncmF5LTgwMCcpLCBvbkNsaWNrOiAoKSA9PiBvblJvd0NsaWNrPy4ocm93KSwgb25Db250ZXh0TWVudTogKGUpID0+IGhhbmRsZUNvbnRleHRNZW51KGUsIHJvdyksIFwiZGF0YS1jeVwiOiBgdGFibGUtcm93LSR7cm93SW5kZXh9YCwgY2hpbGRyZW46IFtzZWxlY3RhYmxlICYmIChfanN4KFwidGRcIiwgeyBjbGFzc05hbWU6IFwicHgtNCBweS0zXCIsIG9uQ2xpY2s6IChlKSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpLCBjaGlsZHJlbjogX2pzeChDaGVja2JveCwgeyBjaGVja2VkOiBpc1NlbGVjdGVkLCBvbkNoYW5nZTogKCkgPT4gaGFuZGxlUm93U2VsZWN0KHJvd0lkKSwgXCJkYXRhLWN5XCI6IGByb3ctY2hlY2tib3gtJHtyb3dJbmRleH1gIH0pIH0pKSwgdmlzaWJsZUNvbHVtbnMubWFwKChjb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXRDZWxsVmFsdWUocm93LCBjb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gY29sdW1uLmNlbGwgPyBjb2x1bW4uY2VsbCh2YWx1ZSwgcm93KSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJ0ZFwiLCB7IGNsYXNzTmFtZTogY2xzeCgncHgtNCBweS0zIHRleHQtc20gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBjb2x1bW4uYWxpZ24gPT09ICdjZW50ZXInICYmICd0ZXh0LWNlbnRlcicsIGNvbHVtbi5hbGlnbiA9PT0gJ3JpZ2h0JyAmJiAndGV4dC1yaWdodCcpLCBcImRhdGEtY3lcIjogYGNlbGwtJHtjb2x1bW4uaWR9LSR7cm93SW5kZXh9YCwgY2hpbGRyZW46IGNvbnRlbnQgfSwgY29sdW1uLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSldIH0sIHJvd0lkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpIH0pXSB9KSB9KSwgcGFnaW5hdGlvbiAmJiB0b3RhbFBhZ2VzID4gMSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG10LTQgcHgtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlNob3dpbmcgXCIsIChjdXJyZW50UGFnZSAtIDEpICogcGFnZVNpemUgKyAxLCBcIiB0b1wiLCAnICcsIE1hdGgubWluKGN1cnJlbnRQYWdlICogcGFnZVNpemUsIHNvcnRlZERhdGEubGVuZ3RoKSwgXCIgb2YgXCIsIHNvcnRlZERhdGEubGVuZ3RoLCBcIiByZXN1bHRzXCJdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiAoKSA9PiBzZXRDdXJyZW50UGFnZShNYXRoLm1heCgxLCBjdXJyZW50UGFnZSAtIDEpKSwgZGlzYWJsZWQ6IGN1cnJlbnRQYWdlID09PSAxLCBjbGFzc05hbWU6IFwicC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTgwMCBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiLCBcImRhdGEtY3lcIjogXCJwcmV2LXBhZ2UtYnRuXCIsIGNoaWxkcmVuOiBfanN4KENoZXZyb25MZWZ0LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBbXCJQYWdlIFwiLCBjdXJyZW50UGFnZSwgXCIgb2YgXCIsIHRvdGFsUGFnZXNdIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0Q3VycmVudFBhZ2UoTWF0aC5taW4odG90YWxQYWdlcywgY3VycmVudFBhZ2UgKyAxKSksIGRpc2FibGVkOiBjdXJyZW50UGFnZSA9PT0gdG90YWxQYWdlcywgY2xhc3NOYW1lOiBcInAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS04MDAgZGlzYWJsZWQ6b3BhY2l0eS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWRcIiwgXCJkYXRhLWN5XCI6IFwibmV4dC1wYWdlLWJ0blwiLCBjaGlsZHJlbjogX2pzeChDaGV2cm9uUmlnaHQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KV0gfSldIH0pKSwgY29udGV4dE1lbnUgJiYgKF9qc3hzKE1lbnUsIHsgaWQ6IE1FTlVfSUQsIHRoZW1lOiBcImRhcmtcIiwgY2hpbGRyZW46IFsob25WaWV3RGV0YWlscyB8fCBkZXRhaWxWaWV3Q29tcG9uZW50KSAmJiAoX2pzeChJdGVtLCB7IG9uQ2xpY2s6IGhhbmRsZVZpZXdEZXRhaWxzLCBcImRhdGEtY3lcIjogXCJjb250ZXh0LW1lbnUtdmlldy1kZXRhaWxzXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRXllLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiVmlldyBEZXRhaWxzXCIgfSldIH0pIH0pKSwgX2pzeChJdGVtLCB7IG9uQ2xpY2s6IGhhbmRsZUNvcHlSb3csIFwiZGF0YS1jeVwiOiBcImNvbnRleHQtbWVudS1jb3B5XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ29weSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkNvcHkgUm93XCIgfSldIH0pIH0pLCBleHBvcnRhYmxlICYmIChfanN4KEl0ZW0sIHsgb25DbGljazogaGFuZGxlRXhwb3J0U2VsZWN0ZWQsIFwiZGF0YS1jeVwiOiBcImNvbnRleHQtbWVudS1leHBvcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkV4cG9ydCBTZWxlY3Rpb25cIiB9KV0gfSkgfSkpXSB9KSldIH0pKTtcbn1cbmV4cG9ydCBkZWZhdWx0IERhdGFUYWJsZTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNpbXBsZSBEYXRhVGFibGUgV3JhcHBlclxuICogQXV0by1nZW5lcmF0ZXMgY29sdW1ucyBmcm9tIGRhdGEgZm9yIHVzZSBpbiBhdXRvLWdlbmVyYXRlZCBkaXNjb3Zlcnkgdmlld3NcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRGF0YVRhYmxlT3JnYW5pc20gZnJvbSAnLi9vcmdhbmlzbXMvRGF0YVRhYmxlJztcbi8qKlxuICogU2ltcGxlIHdyYXBwZXIgYXJvdW5kIERhdGFUYWJsZSB0aGF0IGF1dG8tZ2VuZXJhdGVzIGNvbHVtbnMgZnJvbSByb3cgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgcm93cywgbG9hZGluZyA9IGZhbHNlLCBlbXB0eU1lc3NhZ2UgPSAnTm8gZGF0YSBhdmFpbGFibGUnIH0pIHtcbiAgICAvLyBBdXRvLWdlbmVyYXRlIGNvbHVtbnMgZnJvbSBmaXJzdCByb3dcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcm93cyB8fCByb3dzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgZmlyc3RSb3cgPSByb3dzWzBdO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZmlyc3RSb3cpLm1hcCgoa2V5KSA9PiAoe1xuICAgICAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgICAgIGhlYWRlcjoga2V5XG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyhbQS1aXSkvZywgJyAkMScpIC8vIEFkZCBzcGFjZSBiZWZvcmUgY2FwaXRhbHNcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXi4vLCAoc3RyKSA9PiBzdHIudG9VcHBlckNhc2UoKSkgLy8gQ2FwaXRhbGl6ZSBmaXJzdCBsZXR0ZXJcbiAgICAgICAgICAgICAgICAudHJpbSgpLFxuICAgICAgICAgICAgYWNjZXNzb3I6IGtleSxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIH0pKTtcbiAgICB9LCBbcm93c10pO1xuICAgIGlmICghcm93cyB8fCByb3dzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC02NCB0ZXh0LWdyYXktNTAwXCIsIGNoaWxkcmVuOiBlbXB0eU1lc3NhZ2UgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3goRGF0YVRhYmxlT3JnYW5pc20sIHsgZGF0YTogcm93cywgY29sdW1uczogY29sdW1ucywgcGFnaW5hdGlvbjogdHJ1ZSwgcGFnZVNpemU6IDUwLCBzZWFyY2hhYmxlOiB0cnVlLCBzZWFyY2hQbGFjZWhvbGRlcjogXCJTZWFyY2ggZGF0YS4uLlwiLCBsb2FkaW5nOiBsb2FkaW5nLCBlbXB0eU1lc3NhZ2U6IGVtcHR5TWVzc2FnZSwgZXhwb3J0YWJsZTogdHJ1ZSwgZXhwb3J0RmlsZW5hbWU6IFwiZGlzY292ZXJ5LWRhdGFcIiwgY29sdW1uVmlzaWJpbGl0eTogdHJ1ZSB9KSk7XG59XG5leHBvcnQgZGVmYXVsdCBEYXRhVGFibGU7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENoZWNrYm94IENvbXBvbmVudFxuICpcbiAqIEZ1bGx5IGFjY2Vzc2libGUgY2hlY2tib3ggY29tcG9uZW50IHdpdGggbGFiZWxzIGFuZCBlcnJvciBzdGF0ZXMuXG4gKiBGb2xsb3dzIFdDQUcgMi4xIEFBIGd1aWRlbGluZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VJZCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZWNrIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBDaGVja2JveCA9ICh7IGxhYmVsLCBkZXNjcmlwdGlvbiwgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgZXJyb3IsIGRpc2FibGVkID0gZmFsc2UsIGluZGV0ZXJtaW5hdGUgPSBmYWxzZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IGlkID0gdXNlSWQoKTtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aWR9LWVycm9yYDtcbiAgICBjb25zdCBkZXNjcmlwdGlvbklkID0gYCR7aWR9LWRlc2NyaXB0aW9uYDtcbiAgICBjb25zdCBoYXNFcnJvciA9IEJvb2xlYW4oZXJyb3IpO1xuICAgIGNvbnN0IGhhbmRsZUNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBpbmRldGVybWluYXRlIHZpYSByZWZcbiAgICBjb25zdCBjaGVja2JveFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcbiAgICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2hlY2tib3hSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY2hlY2tib3hSZWYuY3VycmVudC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH0sIFtpbmRldGVybWluYXRlXSk7XG4gICAgY29uc3QgY2hlY2tib3hDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdoLTUgdy01IHJvdW5kZWQgYm9yZGVyLTInLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkYXJrOnJpbmctb2Zmc2V0LWdyYXktOTAwJywgXG4gICAgLy8gU3RhdGUtYmFzZWQgc3R5bGVzXG4gICAge1xuICAgICAgICAvLyBOb3JtYWwgc3RhdGUgKHVuY2hlY2tlZClcbiAgICAgICAgJ2JvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTUwMCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCAmJiAhY2hlY2tlZCxcbiAgICAgICAgJ2ZvY3VzOnJpbmctYmx1ZS01MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBDaGVja2VkIHN0YXRlXG4gICAgICAgICdiZy1ibHVlLTYwMCBib3JkZXItYmx1ZS02MDAgZGFyazpiZy1ibHVlLTUwMCBkYXJrOmJvcmRlci1ibHVlLTUwMCc6IGNoZWNrZWQgJiYgIWRpc2FibGVkICYmICFoYXNFcnJvcixcbiAgICAgICAgLy8gRXJyb3Igc3RhdGVcbiAgICAgICAgJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTYwMCBkYXJrOmJvcmRlci1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAnZm9jdXM6cmluZy1yZWQtNTAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAvLyBEaXNhYmxlZCBzdGF0ZVxuICAgICAgICAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIGJnLWdyYXktMTAwIGRhcms6YmctZ3JheS04MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgndGV4dC1zbSBmb250LW1lZGl1bScsIHtcbiAgICAgICAgJ3RleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwJzogIWhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMCc6IGhhc0Vycm9yICYmICFkaXNhYmxlZCxcbiAgICAgICAgJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNTAwJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCcsIGNsYXNzTmFtZSksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGgtNVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHJlZjogY2hlY2tib3hSZWYsIGlkOiBpZCwgdHlwZTogXCJjaGVja2JveFwiLCBjaGVja2VkOiBjaGVja2VkLCBvbkNoYW5nZTogaGFuZGxlQ2hhbmdlLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogXCJzci1vbmx5IHBlZXJcIiwgXCJhcmlhLWludmFsaWRcIjogaGFzRXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcnJvcklkXTogaGFzRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGVzY3JpcHRpb25JZF06IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSwgX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3goY2hlY2tib3hDbGFzc2VzLCAnZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBjaGlsZHJlbjogW2NoZWNrZWQgJiYgIWluZGV0ZXJtaW5hdGUgJiYgKF9qc3goQ2hlY2ssIHsgY2xhc3NOYW1lOiBcImgtNCB3LTQgdGV4dC13aGl0ZVwiLCBzdHJva2VXaWR0aDogMyB9KSksIGluZGV0ZXJtaW5hdGUgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0wLjUgdy0zIGJnLXdoaXRlIHJvdW5kZWRcIiB9KSldIH0pXSB9KSwgKGxhYmVsIHx8IGRlc2NyaXB0aW9uKSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWwtM1wiLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBpZCwgY2xhc3NOYW1lOiBjbHN4KGxhYmVsQ2xhc3NlcywgJ2N1cnNvci1wb2ludGVyJyksIGNoaWxkcmVuOiBsYWJlbCB9KSksIGRlc2NyaXB0aW9uICYmIChfanN4KFwicFwiLCB7IGlkOiBkZXNjcmlwdGlvbklkLCBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0wLjVcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pKV0gfSkpXSB9KSwgaGFzRXJyb3IgJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogXCJtdC0xIG1sLTggdGV4dC1zbSB0ZXh0LXJlZC02MDBcIiwgcm9sZTogXCJhbGVydFwiLCBcImFyaWEtbGl2ZVwiOiBcInBvbGl0ZVwiLCBjaGlsZHJlbjogZXJyb3IgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ2hlY2tib3g7XG4iLCIvKipcbiAqIEVuaGFuY2VkIExvZ2dpbmcgU2VydmljZVxuICpcbiAqIEZlYXR1cmVzOlxuICogLSBTdHJ1Y3R1cmVkIGxvZ2dpbmcgd2l0aCBjb250ZXh0IGFuZCBjb3JyZWxhdGlvbiBJRHNcbiAqIC0gTXVsdGlwbGUgbG9nIGxldmVscyB3aXRoIGZpbHRlcmluZyAoVFJBQ0UsIERFQlVHLCBJTkZPLCBXQVJOLCBFUlJPUiwgRkFUQUwpXG4gKiAtIE11bHRpcGxlIGxvZyB0cmFuc3BvcnRzIChjb25zb2xlLCBmaWxlIHZpYSBJUEMsIHJlbW90ZSlcbiAqIC0gTG9nIHJvdGF0aW9uIChkYWlseSwgc2l6ZS1iYXNlZClcbiAqIC0gTG9nIHNlYXJjaCBhbmQgZmlsdGVyaW5nXG4gKiAtIFBlcmZvcm1hbmNlIGxvZ2dpbmcgd2l0aCBtZXRob2QgdGltaW5nXG4gKiAtIEVycm9yIHN0YWNrIHRyYWNlIGNhcHR1cmVcbiAqIC0gTG9nIGNvcnJlbGF0aW9uIElEcyBmb3IgcmVxdWVzdCB0cmFja2luZ1xuICovXG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbi8qKlxuICogTG9nIGxldmVscyB3aXRoIG51bWVyaWMgcHJpb3JpdGllc1xuICovXG5leHBvcnQgdmFyIExvZ0xldmVsO1xuKGZ1bmN0aW9uIChMb2dMZXZlbCkge1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiVFJBQ0VcIl0gPSAwXSA9IFwiVFJBQ0VcIjtcbiAgICBMb2dMZXZlbFtMb2dMZXZlbFtcIkRFQlVHXCJdID0gMV0gPSBcIkRFQlVHXCI7XG4gICAgTG9nTGV2ZWxbTG9nTGV2ZWxbXCJJTkZPXCJdID0gMl0gPSBcIklORk9cIjtcbiAgICBMb2dMZXZlbFtMb2dMZXZlbFtcIldBUk5cIl0gPSAzXSA9IFwiV0FSTlwiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiRVJST1JcIl0gPSA0XSA9IFwiRVJST1JcIjtcbiAgICBMb2dMZXZlbFtMb2dMZXZlbFtcIkZBVEFMXCJdID0gNV0gPSBcIkZBVEFMXCI7XG59KShMb2dMZXZlbCB8fCAoTG9nTGV2ZWwgPSB7fSkpO1xuLyoqXG4gKiBFbmhhbmNlZCBMb2dnaW5nIFNlcnZpY2VcbiAqL1xuY2xhc3MgTG9nZ2luZ1NlcnZpY2Uge1xuICAgIGxvZ3MgPSBbXTtcbiAgICBjb25maWc7XG4gICAgY29ycmVsYXRpb25JZFN0YWNrID0gW107XG4gICAgcGVyZm9ybWFuY2VNYXJrcyA9IG5ldyBNYXAoKTtcbiAgICBzZXNzaW9uSWQ7XG4gICAgdXNlcklkO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIG1pbkxldmVsOiBMb2dMZXZlbC5JTkZPLFxuICAgICAgICAgICAgbWF4TG9nczogMTAwMDAsXG4gICAgICAgICAgICB0cmFuc3BvcnRzOiBbJ2NvbnNvbGUnXSxcbiAgICAgICAgICAgIGVuYWJsZVBlcmZvcm1hbmNlTG9nZ2luZzogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVN0YWNrVHJhY2U6IHRydWUsXG4gICAgICAgICAgICByb3RhdGlvblNpemU6IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUJcbiAgICAgICAgICAgIHJvdGF0aW9uSW50ZXJ2YWw6IDg2NDAwMDAwLCAvLyAyNCBob3Vyc1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlc3Npb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIC8vIExvYWQgcGVyc2lzdGVkIGxvZ3MgZnJvbSBsb2NhbFN0b3JhZ2VcbiAgICAgICAgdGhpcy5sb2FkTG9ncygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgbG9nZ2luZyBzZXJ2aWNlXG4gICAgICovXG4gICAgY29uZmlndXJlKGNvbmZpZykge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHsgLi4udGhpcy5jb25maWcsIC4uLmNvbmZpZyB9O1xuICAgICAgICBjb25zb2xlLmxvZygnTG9nZ2luZyBzZXJ2aWNlIGNvbmZpZ3VyZWQ6JywgdGhpcy5jb25maWcpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgbWluaW11bSBsb2cgbGV2ZWxcbiAgICAgKi9cbiAgICBzZXRMb2dMZXZlbChsZXZlbCkge1xuICAgICAgICB0aGlzLmNvbmZpZy5taW5MZXZlbCA9IGxldmVsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdXNlciBJRCBmb3IgbG9nZ2luZyBjb250ZXh0XG4gICAgICovXG4gICAgc2V0VXNlcklkKHVzZXJJZCkge1xuICAgICAgICB0aGlzLnVzZXJJZCA9IHVzZXJJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBjb3JyZWxhdGlvbiBjb250ZXh0XG4gICAgICovXG4gICAgc3RhcnRDb3JyZWxhdGlvbihpZCkge1xuICAgICAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gaWQgfHwgY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgdGhpcy5jb3JyZWxhdGlvbklkU3RhY2sucHVzaChjb3JyZWxhdGlvbklkKTtcbiAgICAgICAgcmV0dXJuIGNvcnJlbGF0aW9uSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVuZCB0aGUgY3VycmVudCBjb3JyZWxhdGlvbiBjb250ZXh0XG4gICAgICovXG4gICAgZW5kQ29ycmVsYXRpb24oKSB7XG4gICAgICAgIHRoaXMuY29ycmVsYXRpb25JZFN0YWNrLnBvcCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBjb3JyZWxhdGlvbiBJRFxuICAgICAqL1xuICAgIGdldEN1cnJlbnRDb3JyZWxhdGlvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb3JyZWxhdGlvbklkU3RhY2tbdGhpcy5jb3JyZWxhdGlvbklkU3RhY2subGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRSQUNFIGxldmVsIGxvZ2dpbmdcbiAgICAgKi9cbiAgICB0cmFjZShtZXNzYWdlLCBjb250ZXh0LCBkYXRhKSB7XG4gICAgICAgIHRoaXMubG9nKExvZ0xldmVsLlRSQUNFLCBtZXNzYWdlLCBjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogREVCVUcgbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIGRlYnVnKG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuREVCVUcsIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJTkZPIGxldmVsIGxvZ2dpbmdcbiAgICAgKi9cbiAgICBpbmZvKG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuSU5GTywgbWVzc2FnZSwgY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdBUk4gbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIHdhcm4obWVzc2FnZSwgY29udGV4dCwgZGF0YSkge1xuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5XQVJOLCBtZXNzYWdlLCBjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRVJST1IgbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIGVycm9yKG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGVycm9yICYmIHRoaXMuY29uZmlnLmVuYWJsZVN0YWNrVHJhY2UgPyB7XG4gICAgICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgfSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuRVJST1IsIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEsIGVycm9yRGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZBVEFMIGxldmVsIGxvZ2dpbmdcbiAgICAgKi9cbiAgICBmYXRhbChtZXNzYWdlLCBjb250ZXh0LCBkYXRhLCBlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvckRhdGEgPSBlcnJvciAmJiB0aGlzLmNvbmZpZy5lbmFibGVTdGFja1RyYWNlID8ge1xuICAgICAgICAgICAgbmFtZTogZXJyb3IubmFtZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICAgIH0gOiB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubG9nKExvZ0xldmVsLkZBVEFMLCBtZXNzYWdlLCBjb250ZXh0LCBkYXRhLCBlcnJvckRhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3JlIGxvZ2dpbmcgbWV0aG9kXG4gICAgICovXG4gICAgbG9nKGxldmVsLCBtZXNzYWdlLCBjb250ZXh0LCBkYXRhLCBlcnJvcikge1xuICAgICAgICAvLyBDaGVjayBpZiBsb2cgbGV2ZWwgaXMgZW5hYmxlZFxuICAgICAgICBpZiAobGV2ZWwgPCB0aGlzLmNvbmZpZy5taW5MZXZlbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVudHJ5ID0ge1xuICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICBsZXZlbCxcbiAgICAgICAgICAgIGxldmVsTmFtZTogTG9nTGV2ZWxbbGV2ZWxdLFxuICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkOiB0aGlzLmdldEN1cnJlbnRDb3JyZWxhdGlvbklkKCksXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy51c2VySWQsXG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuc2Vzc2lvbklkLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvZ3MucHVzaChlbnRyeSk7XG4gICAgICAgIC8vIE1hbmFnZSBsb2cgcm90YXRpb25cbiAgICAgICAgaWYgKHRoaXMubG9ncy5sZW5ndGggPiB0aGlzLmNvbmZpZy5tYXhMb2dzKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MgPSB0aGlzLmxvZ3Muc2xpY2UoLXRoaXMuY29uZmlnLm1heExvZ3MpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE91dHB1dCB0byB0cmFuc3BvcnRzXG4gICAgICAgIHRoaXMub3V0cHV0VG9UcmFuc3BvcnRzKGVudHJ5KTtcbiAgICAgICAgLy8gUGVyc2lzdCBsb2dzIHBlcmlvZGljYWxseVxuICAgICAgICBpZiAodGhpcy5sb2dzLmxlbmd0aCAlIDEwID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNpc3RMb2dzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyZm9ybWFuY2UgbG9nZ2luZyAtIHN0YXJ0IHRpbWluZ1xuICAgICAqL1xuICAgIHN0YXJ0UGVyZm9ybWFuY2VNZWFzdXJlKG1ldGhvZE5hbWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5lbmFibGVQZXJmb3JtYW5jZUxvZ2dpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMucGVyZm9ybWFuY2VNYXJrcy5zZXQobWV0aG9kTmFtZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtYW5jZSBsb2dnaW5nIC0gZW5kIHRpbWluZyBhbmQgbG9nXG4gICAgICovXG4gICAgZW5kUGVyZm9ybWFuY2VNZWFzdXJlKG1ldGhvZE5hbWUsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5lbmFibGVQZXJmb3JtYW5jZUxvZ2dpbmcpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gdGhpcy5wZXJmb3JtYW5jZU1hcmtzLmdldChtZXRob2ROYW1lKTtcbiAgICAgICAgaWYgKCFzdGFydFRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMud2FybihgTm8gcGVyZm9ybWFuY2UgbWFyayBmb3VuZCBmb3IgJHttZXRob2ROYW1lfWAsICdQZXJmb3JtYW5jZScpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHVyYXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5wZXJmb3JtYW5jZU1hcmtzLmRlbGV0ZShtZXRob2ROYW1lKTtcbiAgICAgICAgLy8gTG9nIHBlcmZvcm1hbmNlIGVudHJ5XG4gICAgICAgIGNvbnN0IGVudHJ5ID0ge1xuICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICBsZXZlbDogTG9nTGV2ZWwuREVCVUcsXG4gICAgICAgICAgICBsZXZlbE5hbWU6ICdERUJVRycsXG4gICAgICAgICAgICBtZXNzYWdlOiBgUGVyZm9ybWFuY2U6ICR7bWV0aG9kTmFtZX1gLFxuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCAnUGVyZm9ybWFuY2UnLFxuICAgICAgICAgICAgY29ycmVsYXRpb25JZDogdGhpcy5nZXRDdXJyZW50Q29ycmVsYXRpb25JZCgpLFxuICAgICAgICAgICAgcGVyZm9ybWFuY2U6IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICBtZXRob2Q6IG1ldGhvZE5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLnNlc3Npb25JZCxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy51c2VySWQsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9ncy5wdXNoKGVudHJ5KTtcbiAgICAgICAgdGhpcy5vdXRwdXRUb1RyYW5zcG9ydHMoZW50cnkpO1xuICAgICAgICByZXR1cm4gZHVyYXRpb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1lYXN1cmUgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybWFuY2VcbiAgICAgKi9cbiAgICBhc3luYyBtZWFzdXJlQXN5bmMobWV0aG9kTmFtZSwgZm4sIGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5zdGFydFBlcmZvcm1hbmNlTWVhc3VyZShtZXRob2ROYW1lKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBmbigpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgdGhpcy5lbmRQZXJmb3JtYW5jZU1lYXN1cmUobWV0aG9kTmFtZSwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT3V0cHV0IGxvZyBlbnRyeSB0byBjb25maWd1cmVkIHRyYW5zcG9ydHNcbiAgICAgKi9cbiAgICBvdXRwdXRUb1RyYW5zcG9ydHMoZW50cnkpIHtcbiAgICAgICAgZm9yIChjb25zdCB0cmFuc3BvcnQgb2YgdGhpcy5jb25maWcudHJhbnNwb3J0cykge1xuICAgICAgICAgICAgc3dpdGNoICh0cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjb25zb2xlJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRUb0NvbnNvbGUoZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRUb0ZpbGUoZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdyZW1vdGUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHB1dFRvUmVtb3RlKGVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT3V0cHV0IHRvIGNvbnNvbGVcbiAgICAgKi9cbiAgICBvdXRwdXRUb0NvbnNvbGUoZW50cnkpIHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gZW50cnkudGltZXN0YW1wLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGxldmVsID0gZW50cnkubGV2ZWxOYW1lLnBhZEVuZCg1KTtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGVudHJ5LmNvbnRleHQgPyBgWyR7ZW50cnkuY29udGV4dH1dYCA6ICcnO1xuICAgICAgICBjb25zdCBjb3JyZWxhdGlvbklkID0gZW50cnkuY29ycmVsYXRpb25JZCA/IGBbJHtlbnRyeS5jb3JyZWxhdGlvbklkLnNsaWNlKDAsIDgpfV1gIDogJyc7XG4gICAgICAgIGxldCBsb2dGbiA9IGNvbnNvbGUubG9nO1xuICAgICAgICBsZXQgY29sb3IgPSAnJztcbiAgICAgICAgc3dpdGNoIChlbnRyeS5sZXZlbCkge1xuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5UUkFDRTpcbiAgICAgICAgICAgICAgICBsb2dGbiA9IGNvbnNvbGUuZGVidWc7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnXFx4MWJbOTBtJzsgLy8gR3JheVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5ERUJVRzpcbiAgICAgICAgICAgICAgICBsb2dGbiA9IGNvbnNvbGUuZGVidWc7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnXFx4MWJbMzZtJzsgLy8gQ3lhblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5JTkZPOlxuICAgICAgICAgICAgICAgIGxvZ0ZuID0gY29uc29sZS5pbmZvO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gJ1xceDFiWzMybSc7IC8vIEdyZWVuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLldBUk46XG4gICAgICAgICAgICAgICAgbG9nRm4gPSBjb25zb2xlLndhcm47XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnXFx4MWJbMzNtJzsgLy8gWWVsbG93XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLkVSUk9SOlxuICAgICAgICAgICAgICAgIGxvZ0ZuID0gY29uc29sZS5lcnJvcjtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdcXHgxYlszMW0nOyAvLyBSZWRcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTG9nTGV2ZWwuRkFUQUw6XG4gICAgICAgICAgICAgICAgbG9nRm4gPSBjb25zb2xlLmVycm9yO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gJ1xceDFiWzM1bSc7IC8vIE1hZ2VudGFcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZXNldCA9ICdcXHgxYlswbSc7XG4gICAgICAgIGxvZ0ZuKGAke2NvbG9yfSR7dGltZXN0YW1wfSAke2xldmVsfSR7cmVzZXR9ICR7Y29udGV4dH0ke2NvcnJlbGF0aW9uSWR9ICR7ZW50cnkubWVzc2FnZX1gKTtcbiAgICAgICAgaWYgKGVudHJ5LmRhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCcgIERhdGE6JywgZW50cnkuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudHJ5LmVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCcgIEVycm9yOicsIGVudHJ5LmVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKGVudHJ5LmVycm9yLnN0YWNrKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlbnRyeS5lcnJvci5zdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudHJ5LnBlcmZvcm1hbmNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgICBEdXJhdGlvbjogJHtlbnRyeS5wZXJmb3JtYW5jZS5kdXJhdGlvbi50b0ZpeGVkKDIpfW1zYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT3V0cHV0IHRvIGZpbGUgKHZpYSBJUEMgdG8gbWFpbiBwcm9jZXNzKVxuICAgICAqL1xuICAgIG91dHB1dFRvRmlsZShlbnRyeSkge1xuICAgICAgICAvLyBTZW5kIHRvIG1haW4gcHJvY2VzcyBmb3IgZmlsZSB3cml0aW5nXG4gICAgICAgIGlmICh3aW5kb3cuZWxlY3Ryb25BUEk/LmxvZ1RvRmlsZSkge1xuICAgICAgICAgICAgd2luZG93LmVsZWN0cm9uQVBJLmxvZ1RvRmlsZShlbnRyeSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB3cml0ZSBsb2cgdG8gZmlsZTonLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT3V0cHV0IHRvIHJlbW90ZSBsb2dnaW5nIHNlcnZpY2VcbiAgICAgKi9cbiAgICBvdXRwdXRUb1JlbW90ZShlbnRyeSkge1xuICAgICAgICAvLyBXb3VsZCBzZW5kIHRvIHJlbW90ZSBsb2dnaW5nIHNlcnZpY2UgKGUuZy4sIEVsYXN0aWNzZWFyY2gsIFNwbHVuaylcbiAgICAgICAgLy8gSW1wbGVtZW50YXRpb24gZGVwZW5kcyBvbiBzcGVjaWZpYyBzZXJ2aWNlXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgbG9nc1xuICAgICAqL1xuICAgIGdldExvZ3MoKSB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5sb2dzXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlsdGVyIGxvZ3MgYnkgY3JpdGVyaWFcbiAgICAgKi9cbiAgICBmaWx0ZXJMb2dzKGZpbHRlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dzLmZpbHRlcigoZW50cnkpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIubGV2ZWxzICYmICFmaWx0ZXIubGV2ZWxzLmluY2x1ZGVzKGVudHJ5LmxldmVsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWx0ZXIuY29udGV4dHMgJiYgZW50cnkuY29udGV4dCAmJiAhZmlsdGVyLmNvbnRleHRzLmluY2x1ZGVzKGVudHJ5LmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci5jb3JyZWxhdGlvbklkICYmIGVudHJ5LmNvcnJlbGF0aW9uSWQgIT09IGZpbHRlci5jb3JyZWxhdGlvbklkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci5zdGFydFRpbWUgJiYgZW50cnkudGltZXN0YW1wIDwgZmlsdGVyLnN0YXJ0VGltZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWx0ZXIuZW5kVGltZSAmJiBlbnRyeS50aW1lc3RhbXAgPiBmaWx0ZXIuZW5kVGltZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzTWVzc2FnZSA9IGVudHJ5Lm1lc3NhZ2UudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcik7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlc0NvbnRleHQgPSBlbnRyeS5jb250ZXh0Py50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzRGF0YSA9IEpTT04uc3RyaW5naWZ5KGVudHJ5LmRhdGEgfHwge30pLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpO1xuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlc01lc3NhZ2UgJiYgIW1hdGNoZXNDb250ZXh0ICYmICFtYXRjaGVzRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci50YWdzICYmIGVudHJ5LnRhZ3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNUYWcgPSBmaWx0ZXIudGFncy5zb21lKCh0YWcpID0+IGVudHJ5LnRhZ3MuaW5jbHVkZXModGFnKSk7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2VhcmNoIGxvZ3MgYnkgdGV4dFxuICAgICAqL1xuICAgIHNlYXJjaExvZ3MocXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyTG9ncyh7IHNlYXJjaFRleHQ6IHF1ZXJ5IH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbG9ncyBieSBjb3JyZWxhdGlvbiBJRFxuICAgICAqL1xuICAgIGdldExvZ3NCeUNvcnJlbGF0aW9uKGNvcnJlbGF0aW9uSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyTG9ncyh7IGNvcnJlbGF0aW9uSWQgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBsb2dzXG4gICAgICovXG4gICAgY2xlYXJMb2dzKCkge1xuICAgICAgICB0aGlzLmxvZ3MgPSBbXTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FwcF9sb2dzJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbGwgbG9ncyBjbGVhcmVkJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcnNpc3QgbG9ncyB0byBsb2NhbFN0b3JhZ2VcbiAgICAgKi9cbiAgICBwZXJzaXN0TG9ncygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFN0b3JlIGxhc3QgMTAwMCBsb2dzXG4gICAgICAgICAgICBjb25zdCBsb2dzVG9TdG9yZSA9IHRoaXMubG9ncy5zbGljZSgtMTAwMCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXBwX2xvZ3MnLCBKU09OLnN0cmluZ2lmeShsb2dzVG9TdG9yZSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHBlcnNpc3QgbG9nczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCBsb2dzIGZyb20gbG9jYWxTdG9yYWdlXG4gICAgICovXG4gICAgbG9hZExvZ3MoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdG9yZWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXBwX2xvZ3MnKTtcbiAgICAgICAgICAgIGlmIChzdG9yZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2dzID0gSlNPTi5wYXJzZShzdG9yZWQpO1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdGltZXN0YW1wIHN0cmluZ3MgYmFjayB0byBEYXRlIG9iamVjdHNcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ3MgPSBsb2dzLm1hcCgoZW50cnkpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLmVudHJ5LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKGVudHJ5LnRpbWVzdGFtcCksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBMb2FkZWQgJHt0aGlzLmxvZ3MubGVuZ3RofSBwZXJzaXN0ZWQgbG9nc2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgcGVyc2lzdGVkIGxvZ3M6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV4cG9ydCBsb2dzIHRvIEpTT05cbiAgICAgKi9cbiAgICBleHBvcnRMb2dzKGZvcm1hdCA9ICdqc29uJykge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgbGV0IG1pbWVUeXBlO1xuICAgICAgICBsZXQgZXh0ZW5zaW9uO1xuICAgICAgICBpZiAoZm9ybWF0ID09PSAnanNvbicpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmxvZ3MsIG51bGwsIDIpO1xuICAgICAgICAgICAgbWltZVR5cGUgPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBleHRlbnNpb24gPSAnanNvbic7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBDU1YgZm9ybWF0XG4gICAgICAgICAgICBjb25zdCBoZWFkZXJzID0gWyd0aW1lc3RhbXAnLCAnbGV2ZWwnLCAnY29udGV4dCcsICdjb3JyZWxhdGlvbklkJywgJ21lc3NhZ2UnLCAnZGF0YSddO1xuICAgICAgICAgICAgY29uc3Qgcm93cyA9IHRoaXMubG9ncy5tYXAoKGVudHJ5KSA9PiBbXG4gICAgICAgICAgICAgICAgZW50cnkudGltZXN0YW1wLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgZW50cnkubGV2ZWxOYW1lLFxuICAgICAgICAgICAgICAgIGVudHJ5LmNvbnRleHQgfHwgJycsXG4gICAgICAgICAgICAgICAgZW50cnkuY29ycmVsYXRpb25JZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBlbnRyeS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGVudHJ5LmRhdGEgfHwge30pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjb250ZW50ID0gW2hlYWRlcnMsIC4uLnJvd3NdLm1hcCgocm93KSA9PiByb3cubWFwKChjZWxsKSA9PiBgXCIke2NlbGx9XCJgKS5qb2luKCcsJykpLmpvaW4oJ1xcbicpO1xuICAgICAgICAgICAgbWltZVR5cGUgPSAndGV4dC9jc3YnO1xuICAgICAgICAgICAgZXh0ZW5zaW9uID0gJ2Nzdic7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjb250ZW50XSwgeyB0eXBlOiBtaW1lVHlwZSB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBhLmRvd25sb2FkID0gYGxvZ3NfJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvWzouXS9nLCAnLScpfS4ke2V4dGVuc2lvbn1gO1xuICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgdGhpcy5pbmZvKCdMb2dzIGV4cG9ydGVkJywgJ0xvZ2dpbmdTZXJ2aWNlJywgeyBmb3JtYXQsIGNvdW50OiB0aGlzLmxvZ3MubGVuZ3RoIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbG9nZ2luZyBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgZ2V0U3RhdGlzdGljcygpIHtcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLmxvZ3MubGVuZ3RoO1xuICAgICAgICBjb25zdCBieUxldmVsID0ge307XG4gICAgICAgIGZvciAobGV0IGxldmVsID0gTG9nTGV2ZWwuVFJBQ0U7IGxldmVsIDw9IExvZ0xldmVsLkZBVEFMOyBsZXZlbCsrKSB7XG4gICAgICAgICAgICBieUxldmVsW0xvZ0xldmVsW2xldmVsXV0gPSB0aGlzLmxvZ3MuZmlsdGVyKChsKSA9PiBsLmxldmVsID09PSBsZXZlbCkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbnRleHRzID0gbmV3IFNldCh0aGlzLmxvZ3MubWFwKChsKSA9PiBsLmNvbnRleHQpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgIGNvbnN0IGNvcnJlbGF0aW9ucyA9IG5ldyBTZXQodGhpcy5sb2dzLm1hcCgobCkgPT4gbC5jb3JyZWxhdGlvbklkKS5maWx0ZXIoQm9vbGVhbikpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWwsXG4gICAgICAgICAgICBieUxldmVsLFxuICAgICAgICAgICAgdW5pcXVlQ29udGV4dHM6IGNvbnRleHRzLnNpemUsXG4gICAgICAgICAgICB1bmlxdWVDb3JyZWxhdGlvbnM6IGNvcnJlbGF0aW9ucy5zaXplLFxuICAgICAgICAgICAgc2Vzc2lvbklkOiB0aGlzLnNlc3Npb25JZCxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy51c2VySWQsXG4gICAgICAgICAgICBvbGRlc3RMb2c6IHRoaXMubG9nc1swXT8udGltZXN0YW1wLFxuICAgICAgICAgICAgbmV3ZXN0TG9nOiB0aGlzLmxvZ3NbdGhpcy5sb2dzLmxlbmd0aCAtIDFdPy50aW1lc3RhbXAsXG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgbmV3IExvZ2dpbmdTZXJ2aWNlKCk7XG4iLCIvKipcbiAqIEVuaGFuY2VkIENhY2hlIFNlcnZpY2VcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGNhY2hpbmcgd2l0aDpcbiAqIC0gTXVsdGlwbGUgY2FjaGUgc3RyYXRlZ2llcyAoTFJVLCBMRlUsIEZJRk8sIFRUTClcbiAqIC0gTXVsdGlwbGUgc3RvcmFnZSBiYWNrZW5kcyAobWVtb3J5LCBsb2NhbFN0b3JhZ2UsIEluZGV4ZWREQilcbiAqIC0gQ2FjaGUgc3RhdGlzdGljcyBhbmQgbW9uaXRvcmluZ1xuICogLSBBdXRvbWF0aWMgZXhwaXJhdGlvbiBhbmQgY2xlYW51cFxuICogLSBDYWNoZSB3YXJtaW5nIGFuZCBwcmVsb2FkaW5nXG4gKiAtIENhY2hlIHZlcnNpb25pbmcgYW5kIGludmFsaWRhdGlvblxuICovXG5pbXBvcnQgbG9nZ2luZ1NlcnZpY2UgZnJvbSAnLi9sb2dnaW5nU2VydmljZSc7XG4vKipcbiAqIEVuaGFuY2VkIENhY2hlIFNlcnZpY2VcbiAqL1xuZXhwb3J0IGNsYXNzIENhY2hlU2VydmljZSB7XG4gICAgY2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgc3RyYXRlZ3k7XG4gICAgYmFja2VuZDtcbiAgICBtYXhTaXplO1xuICAgIG1heE1lbW9yeUJ5dGVzO1xuICAgIGRlZmF1bHRUVEw7XG4gICAgZW5hYmxlU3RhdHM7XG4gICAgbmFtZXNwYWNlO1xuICAgIGNsZWFudXBJbnRlcnZhbDtcbiAgICAvLyBTdGF0aXN0aWNzXG4gICAgc3RhdHMgPSB7XG4gICAgICAgIGhpdHM6IDAsXG4gICAgICAgIG1pc3NlczogMCxcbiAgICAgICAgZXZpY3Rpb25zOiAwLFxuICAgICAgICB0b3RhbEFjY2Vzc1RpbWU6IDAsXG4gICAgICAgIGFjY2Vzc0NvdW50OiAwLFxuICAgIH07XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ3kgPSBvcHRpb25zLnN0cmF0ZWd5IHx8ICdMUlUnO1xuICAgICAgICB0aGlzLmJhY2tlbmQgPSBvcHRpb25zLmJhY2tlbmQgfHwgJ21lbW9yeSc7XG4gICAgICAgIHRoaXMubWF4U2l6ZSA9IG9wdGlvbnMubWF4U2l6ZSB8fCAxMDAwO1xuICAgICAgICB0aGlzLm1heE1lbW9yeUJ5dGVzID0gKG9wdGlvbnMubWF4TWVtb3J5TUIgfHwgMTAwKSAqIDEwNDg1NzY7XG4gICAgICAgIHRoaXMuZGVmYXVsdFRUTCA9IG9wdGlvbnMuZGVmYXVsdFRUTDtcbiAgICAgICAgdGhpcy5lbmFibGVTdGF0cyA9IG9wdGlvbnMuZW5hYmxlU3RhdHMgIT09IGZhbHNlO1xuICAgICAgICB0aGlzLm5hbWVzcGFjZSA9IG9wdGlvbnMubmFtZXNwYWNlIHx8ICdkZWZhdWx0JztcbiAgICAgICAgLy8gU3RhcnQgYXV0b21hdGljIGNsZWFudXBcbiAgICAgICAgdGhpcy5zdGFydENsZWFudXAoKTtcbiAgICAgICAgLy8gTG9hZCBmcm9tIHBlcnNpc3RlbnQgc3RvcmFnZSBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuYmFja2VuZCAhPT0gJ21lbW9yeScpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZyb21TdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2luZ1NlcnZpY2UuaW5mbygnQ2FjaGUgc2VydmljZSBpbml0aWFsaXplZCcsICdDYWNoZVNlcnZpY2UnLCB7XG4gICAgICAgICAgICBzdHJhdGVneTogdGhpcy5zdHJhdGVneSxcbiAgICAgICAgICAgIGJhY2tlbmQ6IHRoaXMuYmFja2VuZCxcbiAgICAgICAgICAgIG1heFNpemU6IHRoaXMubWF4U2l6ZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdmFsdWUgZnJvbSBjYWNoZVxuICAgICAqL1xuICAgIGdldChrZXkpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZWRLZXkgPSB0aGlzLmdldE5hbWVzcGFjZWRLZXkoa2V5KTtcbiAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmNhY2hlLmdldChuYW1lc3BhY2VkS2V5KTtcbiAgICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5taXNzZXMrKztcbiAgICAgICAgICAgIHRoaXMucmVjb3JkQWNjZXNzVGltZShzdGFydFRpbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBleHBpcmF0aW9uXG4gICAgICAgIGlmIChlbnRyeS5leHBpcmVzQXQgJiYgRGF0ZS5ub3coKSA+IGVudHJ5LmV4cGlyZXNBdCkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMubWlzc2VzKys7XG4gICAgICAgICAgICB0aGlzLnJlY29yZEFjY2Vzc1RpbWUoc3RhcnRUaW1lKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXBkYXRlIGFjY2VzcyBtZXRhZGF0YVxuICAgICAgICBlbnRyeS5hY2Nlc3NDb3VudCsrO1xuICAgICAgICBlbnRyeS5sYXN0QWNjZXNzZWQgPSBEYXRlLm5vdygpO1xuICAgICAgICB0aGlzLnN0YXRzLmhpdHMrKztcbiAgICAgICAgdGhpcy5yZWNvcmRBY2Nlc3NUaW1lKHN0YXJ0VGltZSk7XG4gICAgICAgIHJldHVybiBlbnRyeS52YWx1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IHZhbHVlIGluIGNhY2hlXG4gICAgICovXG4gICAgc2V0KGtleSwgdmFsdWUsIHR0bCkge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2VkS2V5ID0gdGhpcy5nZXROYW1lc3BhY2VkS2V5KGtleSk7XG4gICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLmVzdGltYXRlU2l6ZSh2YWx1ZSk7XG4gICAgICAgIC8vIENoZWNrIG1lbW9yeSBsaW1pdHNcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q3VycmVudE1lbW9yeVVzYWdlKCkgKyBzaXplID4gdGhpcy5tYXhNZW1vcnlCeXRlcykge1xuICAgICAgICAgICAgdGhpcy5ldmljdCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIHNpemUgbGltaXRzXG4gICAgICAgIGlmICh0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhTaXplKSB7XG4gICAgICAgICAgICB0aGlzLmV2aWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICBrZXk6IG5hbWVzcGFjZWRLZXksXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGV4cGlyZXNBdDogdHRsID8gRGF0ZS5ub3coKSArIHR0bCA6IHRoaXMuZGVmYXVsdFRUTCA/IERhdGUubm93KCkgKyB0aGlzLmRlZmF1bHRUVEwgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhY2Nlc3NDb3VudDogMCxcbiAgICAgICAgICAgIGxhc3RBY2Nlc3NlZDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIHNpemUsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY2FjaGUuc2V0KG5hbWVzcGFjZWRLZXksIGVudHJ5KTtcbiAgICAgICAgLy8gUGVyc2lzdCB0byBzdG9yYWdlIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5iYWNrZW5kICE9PSAnbWVtb3J5Jykge1xuICAgICAgICAgICAgdGhpcy5wZXJzaXN0VG9TdG9yYWdlKG5hbWVzcGFjZWRLZXksIGVudHJ5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBrZXkgZXhpc3RzIGluIGNhY2hlXG4gICAgICovXG4gICAgaGFzKGtleSkge1xuICAgICAgICBjb25zdCBuYW1lc3BhY2VkS2V5ID0gdGhpcy5nZXROYW1lc3BhY2VkS2V5KGtleSk7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5jYWNoZS5nZXQobmFtZXNwYWNlZEtleSk7XG4gICAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayBleHBpcmF0aW9uXG4gICAgICAgIGlmIChlbnRyeS5leHBpcmVzQXQgJiYgRGF0ZS5ub3coKSA+IGVudHJ5LmV4cGlyZXNBdCkge1xuICAgICAgICAgICAgdGhpcy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIGVudHJ5IGZyb20gY2FjaGVcbiAgICAgKi9cbiAgICBkZWxldGUoa2V5KSB7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZWRLZXkgPSB0aGlzLmdldE5hbWVzcGFjZWRLZXkoa2V5KTtcbiAgICAgICAgY29uc3QgZGVsZXRlZCA9IHRoaXMuY2FjaGUuZGVsZXRlKG5hbWVzcGFjZWRLZXkpO1xuICAgICAgICBpZiAoZGVsZXRlZCAmJiB0aGlzLmJhY2tlbmQgIT09ICdtZW1vcnknKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZUZyb21TdG9yYWdlKG5hbWVzcGFjZWRLZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWxldGVkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciBhbGwgZW50cmllc1xuICAgICAqL1xuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmNhY2hlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RhdHMgPSB7XG4gICAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgICAgbWlzc2VzOiAwLFxuICAgICAgICAgICAgZXZpY3Rpb25zOiAwLFxuICAgICAgICAgICAgdG90YWxBY2Nlc3NUaW1lOiAwLFxuICAgICAgICAgICAgYWNjZXNzQ291bnQ6IDAsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmJhY2tlbmQgIT09ICdtZW1vcnknKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyU3RvcmFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmluZm8oJ0NhY2hlIGNsZWFyZWQnLCAnQ2FjaGVTZXJ2aWNlJywgeyBuYW1lc3BhY2U6IHRoaXMubmFtZXNwYWNlIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgb3Igc2V0IChmZXRjaCBpZiBub3QgZXhpc3RzKVxuICAgICAqL1xuICAgIGFzeW5jIGdldE9yU2V0KGtleSwgZmFjdG9yeSwgdHRsKSB7XG4gICAgICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMuZ2V0KGtleSk7XG4gICAgICAgIGlmIChjYWNoZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IGZhY3RvcnkoKTtcbiAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSwgdHRsKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbXVsdGlwbGUga2V5c1xuICAgICAqL1xuICAgIGdldE1hbnkoa2V5cykge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KGtleSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgbXVsdGlwbGUgZW50cmllc1xuICAgICAqL1xuICAgIHNldE1hbnkoZW50cmllcywgdHRsKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUsIHR0bCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXZpY3QgZW50cnkgYmFzZWQgb24gc3RyYXRlZ3lcbiAgICAgKi9cbiAgICBldmljdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2FjaGUuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrZXlUb0V2aWN0O1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RyYXRlZ3kpIHtcbiAgICAgICAgICAgIGNhc2UgJ0xSVSc6IC8vIExlYXN0IFJlY2VudGx5IFVzZWRcbiAgICAgICAgICAgICAgICBrZXlUb0V2aWN0ID0gdGhpcy5maW5kTFJVS2V5KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdMRlUnOiAvLyBMZWFzdCBGcmVxdWVudGx5IFVzZWRcbiAgICAgICAgICAgICAgICBrZXlUb0V2aWN0ID0gdGhpcy5maW5kTEZVS2V5KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdGSUZPJzogLy8gRmlyc3QgSW4gRmlyc3QgT3V0XG4gICAgICAgICAgICAgICAga2V5VG9FdmljdCA9IHRoaXMuZmluZEZJRk9LZXkoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RUTCc6IC8vIEV4cGlyZSBvbGRlc3QgYnkgVFRMXG4gICAgICAgICAgICAgICAga2V5VG9FdmljdCA9IHRoaXMuZmluZEV4cGlyZWRLZXkoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5VG9FdmljdCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5VG9FdmljdCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRzLmV2aWN0aW9ucysrO1xuICAgICAgICAgICAgaWYgKHRoaXMuYmFja2VuZCAhPT0gJ21lbW9yeScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUZyb21TdG9yYWdlKGtleVRvRXZpY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgbGVhc3QgcmVjZW50bHkgdXNlZCBrZXlcbiAgICAgKi9cbiAgICBmaW5kTFJVS2V5KCkge1xuICAgICAgICBsZXQgb2xkZXN0S2V5O1xuICAgICAgICBsZXQgb2xkZXN0VGltZSA9IEluZmluaXR5O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB0aGlzLmNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkubGFzdEFjY2Vzc2VkIDwgb2xkZXN0VGltZSkge1xuICAgICAgICAgICAgICAgIG9sZGVzdFRpbWUgPSBlbnRyeS5sYXN0QWNjZXNzZWQ7XG4gICAgICAgICAgICAgICAgb2xkZXN0S2V5ID0ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvbGRlc3RLZXk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgbGVhc3QgZnJlcXVlbnRseSB1c2VkIGtleVxuICAgICAqL1xuICAgIGZpbmRMRlVLZXkoKSB7XG4gICAgICAgIGxldCBsZWFzdFVzZWRLZXk7XG4gICAgICAgIGxldCBsZWFzdENvdW50ID0gSW5maW5pdHk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHRoaXMuY2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChlbnRyeS5hY2Nlc3NDb3VudCA8IGxlYXN0Q291bnQpIHtcbiAgICAgICAgICAgICAgICBsZWFzdENvdW50ID0gZW50cnkuYWNjZXNzQ291bnQ7XG4gICAgICAgICAgICAgICAgbGVhc3RVc2VkS2V5ID0ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsZWFzdFVzZWRLZXk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgZmlyc3QgaW4gZmlyc3Qgb3V0IGtleVxuICAgICAqL1xuICAgIGZpbmRGSUZPS2V5KCkge1xuICAgICAgICBsZXQgb2xkZXN0S2V5O1xuICAgICAgICBsZXQgb2xkZXN0VGltZSA9IEluZmluaXR5O1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB0aGlzLmNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkudGltZXN0YW1wIDwgb2xkZXN0VGltZSkge1xuICAgICAgICAgICAgICAgIG9sZGVzdFRpbWUgPSBlbnRyeS50aW1lc3RhbXA7XG4gICAgICAgICAgICAgICAgb2xkZXN0S2V5ID0ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvbGRlc3RLZXk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpbmQgZXhwaXJlZCBrZXlcbiAgICAgKi9cbiAgICBmaW5kRXhwaXJlZEtleSgpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdGhpcy5jYWNoZSkge1xuICAgICAgICAgICAgaWYgKGVudHJ5LmV4cGlyZXNBdCAmJiBlbnRyeS5leHBpcmVzQXQgPCBub3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIGV4cGlyZWQsIHVzZSBvbGRlc3RcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZEZJRk9LZXkoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IG5hbWVzcGFjZWQga2V5XG4gICAgICovXG4gICAgZ2V0TmFtZXNwYWNlZEtleShrZXkpIHtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMubmFtZXNwYWNlfToke2tleX1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFc3RpbWF0ZSBzaXplIG9mIHZhbHVlXG4gICAgICovXG4gICAgZXN0aW1hdGVTaXplKHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBSb3VnaCBlc3RpbWF0ZTogc3RyaW5naWZ5IGFuZCBtZWFzdXJlXG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIGpzb24ubGVuZ3RoICogMjsgLy8gVVRGLTE2IGNoYXJzIGFyZSAyIGJ5dGVzXG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIDEwMDA7IC8vIERlZmF1bHQgZXN0aW1hdGVcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgY3VycmVudCBtZW1vcnkgdXNhZ2VcbiAgICAgKi9cbiAgICBnZXRDdXJyZW50TWVtb3J5VXNhZ2UoKSB7XG4gICAgICAgIGxldCB0b3RhbCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5jYWNoZS52YWx1ZXMoKSkge1xuICAgICAgICAgICAgdG90YWwgKz0gZW50cnkuc2l6ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG90YWw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlY29yZCBhY2Nlc3MgdGltZSBmb3Igc3RhdHNcbiAgICAgKi9cbiAgICByZWNvcmRBY2Nlc3NUaW1lKHN0YXJ0VGltZSkge1xuICAgICAgICBpZiAodGhpcy5lbmFibGVTdGF0cykge1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMudG90YWxBY2Nlc3NUaW1lICs9IGR1cmF0aW9uO1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5hY2Nlc3NDb3VudCsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjYWNoZSBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgZ2V0U3RhdHMoKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gdGhpcy5zdGF0cy5oaXRzICsgdGhpcy5zdGF0cy5taXNzZXM7XG4gICAgICAgIGNvbnN0IGhpdFJhdGUgPSB0b3RhbCA+IDAgPyB0aGlzLnN0YXRzLmhpdHMgLyB0b3RhbCA6IDA7XG4gICAgICAgIGNvbnN0IGF2Z0FjY2Vzc1RpbWUgPSB0aGlzLnN0YXRzLmFjY2Vzc0NvdW50ID4gMCA/IHRoaXMuc3RhdHMudG90YWxBY2Nlc3NUaW1lIC8gdGhpcy5zdGF0cy5hY2Nlc3NDb3VudCA6IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBoaXRzOiB0aGlzLnN0YXRzLmhpdHMsXG4gICAgICAgICAgICBtaXNzZXM6IHRoaXMuc3RhdHMubWlzc2VzLFxuICAgICAgICAgICAgZXZpY3Rpb25zOiB0aGlzLnN0YXRzLmV2aWN0aW9ucyxcbiAgICAgICAgICAgIGVudHJpZXM6IHRoaXMuY2FjaGUuc2l6ZSxcbiAgICAgICAgICAgIG1lbW9yeVVzYWdlTUI6IHRoaXMuZ2V0Q3VycmVudE1lbW9yeVVzYWdlKCkgLyAxMDQ4NTc2LFxuICAgICAgICAgICAgaGl0UmF0ZSxcbiAgICAgICAgICAgIGF2ZXJhZ2VBY2Nlc3NUaW1lOiBhdmdBY2Nlc3NUaW1lLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNldCBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgcmVzZXRTdGF0cygpIHtcbiAgICAgICAgdGhpcy5zdGF0cyA9IHtcbiAgICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgICBtaXNzZXM6IDAsXG4gICAgICAgICAgICBldmljdGlvbnM6IDAsXG4gICAgICAgICAgICB0b3RhbEFjY2Vzc1RpbWU6IDAsXG4gICAgICAgICAgICBhY2Nlc3NDb3VudDogMCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBrZXlzXG4gICAgICovXG4gICAga2V5cygpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gYCR7dGhpcy5uYW1lc3BhY2V9OmA7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY2FjaGUua2V5cygpKVxuICAgICAgICAgICAgLmZpbHRlcigoaykgPT4gay5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgICAgICAubWFwKChrKSA9PiBrLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjYWNoZSBzaXplXG4gICAgICovXG4gICAgc2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuc2l6ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RhcnQgYXV0b21hdGljIGNsZWFudXAgb2YgZXhwaXJlZCBlbnRyaWVzXG4gICAgICovXG4gICAgc3RhcnRDbGVhbnVwKCkge1xuICAgICAgICB0aGlzLmNsZWFudXBJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cEV4cGlyZWQoKTtcbiAgICAgICAgfSwgNjAwMDApOyAvLyBSdW4gZXZlcnkgbWludXRlXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0b3AgYXV0b21hdGljIGNsZWFudXBcbiAgICAgKi9cbiAgICBzdG9wQ2xlYW51cCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2xlYW51cEludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuY2xlYW51cEludGVydmFsKTtcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cEludGVydmFsID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFuIHVwIGV4cGlyZWQgZW50cmllc1xuICAgICAqL1xuICAgIGNsZWFudXBFeHBpcmVkKCkge1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBrZXlzVG9EZWxldGUgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdGhpcy5jYWNoZSkge1xuICAgICAgICAgICAgaWYgKGVudHJ5LmV4cGlyZXNBdCAmJiBlbnRyeS5leHBpcmVzQXQgPCBub3cpIHtcbiAgICAgICAgICAgICAgICBrZXlzVG9EZWxldGUucHVzaChrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXNUb0RlbGV0ZSkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmJhY2tlbmQgIT09ICdtZW1vcnknKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVGcm9tU3RvcmFnZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXlzVG9EZWxldGUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbG9nZ2luZ1NlcnZpY2UuZGVidWcoYENsZWFuZWQgdXAgJHtrZXlzVG9EZWxldGUubGVuZ3RofSBleHBpcmVkIGNhY2hlIGVudHJpZXNgLCAnQ2FjaGVTZXJ2aWNlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCBmcm9tIHBlcnNpc3RlbnQgc3RvcmFnZVxuICAgICAqL1xuICAgIGxvYWRGcm9tU3RvcmFnZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuYmFja2VuZCA9PT0gJ2xvY2FsU3RvcmFnZScpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEZyb21Mb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmJhY2tlbmQgPT09ICdpbmRleGVkREInKSB7XG4gICAgICAgICAgICAvLyBJbmRleGVkREIgbG9hZGluZyB3b3VsZCBiZSBhc3luYywgaGFuZGxlZCBzZXBhcmF0ZWx5XG4gICAgICAgICAgICBsb2dnaW5nU2VydmljZS5pbmZvKCdJbmRleGVkREIgYmFja2VuZCBub3QgeWV0IGltcGxlbWVudGVkJywgJ0NhY2hlU2VydmljZScpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvYWQgZnJvbSBsb2NhbFN0b3JhZ2VcbiAgICAgKi9cbiAgICBsb2FkRnJvbUxvY2FsU3RvcmFnZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IGBjYWNoZToke3RoaXMubmFtZXNwYWNlfTpgO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkgJiYga2V5LnN0YXJ0c1dpdGgocHJlZml4KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW50cnkgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhY2hlS2V5ID0ga2V5LnN1YnN0cmluZyhgY2FjaGU6YC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZS5zZXQoY2FjaGVLZXksIGVudHJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBjYWNoZSBmcm9tIGxvY2FsU3RvcmFnZScsICdDYWNoZVNlcnZpY2UnLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyc2lzdCB0byBzdG9yYWdlXG4gICAgICovXG4gICAgcGVyc2lzdFRvU3RvcmFnZShrZXksIGVudHJ5KSB7XG4gICAgICAgIGlmICh0aGlzLmJhY2tlbmQgPT09ICdsb2NhbFN0b3JhZ2UnKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNpc3RUb0xvY2FsU3RvcmFnZShrZXksIGVudHJ5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJzaXN0IHRvIGxvY2FsU3RvcmFnZVxuICAgICAqL1xuICAgIHBlcnNpc3RUb0xvY2FsU3RvcmFnZShrZXksIGVudHJ5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgY2FjaGU6JHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkoZW50cnkpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmVycm9yKCdGYWlsZWQgdG8gcGVyc2lzdCB0byBsb2NhbFN0b3JhZ2UnLCAnQ2FjaGVTZXJ2aWNlJywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBmcm9tIHN0b3JhZ2VcbiAgICAgKi9cbiAgICBkZWxldGVGcm9tU3RvcmFnZShrZXkpIHtcbiAgICAgICAgaWYgKHRoaXMuYmFja2VuZCA9PT0gJ2xvY2FsU3RvcmFnZScpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGBjYWNoZToke2tleX1gKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciBzdG9yYWdlXG4gICAgICovXG4gICAgY2xlYXJTdG9yYWdlKCkge1xuICAgICAgICBpZiAodGhpcy5iYWNrZW5kID09PSAnbG9jYWxTdG9yYWdlJykge1xuICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gYGNhY2hlOiR7dGhpcy5uYW1lc3BhY2V9OmA7XG4gICAgICAgICAgICBjb25zdCBrZXlzVG9EZWxldGUgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbG9jYWxTdG9yYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gbG9jYWxTdG9yYWdlLmtleShpKTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICYmIGtleS5zdGFydHNXaXRoKHByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAga2V5c1RvRGVsZXRlLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzVG9EZWxldGUpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdhcm0gY2FjaGUgd2l0aCBkYXRhXG4gICAgICovXG4gICAgYXN5bmMgd2FybShrZXlzLCBmYWN0b3J5LCB0dGwpIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBrZXlzLm1hcChhc3luYyAoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IGZhY3Rvcnkoa2V5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlLCB0dGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgICAgICBsb2dnaW5nU2VydmljZS5pbmZvKGBDYWNoZSB3YXJtZWQgd2l0aCAke2tleXMubGVuZ3RofSBlbnRyaWVzYCwgJ0NhY2hlU2VydmljZScpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaHV0ZG93biBjYWNoZSBzZXJ2aWNlXG4gICAgICovXG4gICAgc2h1dGRvd24oKSB7XG4gICAgICAgIHRoaXMuc3RvcENsZWFudXAoKTtcbiAgICAgICAgdGhpcy5jbGVhcigpO1xuICAgICAgICBsb2dnaW5nU2VydmljZS5pbmZvKCdDYWNoZSBzZXJ2aWNlIHNodXQgZG93bicsICdDYWNoZVNlcnZpY2UnKTtcbiAgICB9XG59XG4vKipcbiAqIEdsb2JhbCBjYWNoZSBzZXJ2aWNlIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBjb25zdCBjYWNoZVNlcnZpY2UgPSBuZXcgQ2FjaGVTZXJ2aWNlKHtcbiAgICBzdHJhdGVneTogJ0xSVScsXG4gICAgYmFja2VuZDogJ21lbW9yeScsXG4gICAgbWF4U2l6ZTogMTAwMCxcbiAgICBtYXhNZW1vcnlNQjogMTAwLFxuICAgIGRlZmF1bHRUVEw6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgZW5hYmxlU3RhdHM6IHRydWUsXG4gICAgbmFtZXNwYWNlOiAnYXBwJyxcbn0pO1xuLyoqXG4gKiBEZWZhdWx0IGV4cG9ydCBmb3IgYmV0dGVyIENvbW1vbkpTIGNvbXBhdGliaWxpdHlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgQ2FjaGVTZXJ2aWNlO1xuIiwiLyoqXG4gKiBOb3RpZmljYXRpb24gU2VydmljZVxuICogQ2VudHJhbGl6ZWQgbm90aWZpY2F0aW9uIG1hbmFnZW1lbnQgd2l0aCB0b2FzdCBub3RpZmljYXRpb25zIGFuZCBzeXN0ZW0gdHJheSBpbnRlZ3JhdGlvblxuICovXG5pbXBvcnQgeyB1c2VOb3RpZmljYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU5vdGlmaWNhdGlvblN0b3JlJztcbi8qKlxuICogTm90aWZpY2F0aW9uIFNlcnZpY2UgQ2xhc3NcbiAqIFByb3ZpZGVzIGEgY2xhc3MtYmFzZWQgQVBJIGZvciBub3RpZmljYXRpb24gbWFuYWdlbWVudFxuICovXG5jbGFzcyBOb3RpZmljYXRpb25TZXJ2aWNlIHtcbiAgICBzdG9yZSA9IHVzZU5vdGlmaWNhdGlvblN0b3JlO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUb2FzdCBOb3RpZmljYXRpb25zXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIFNob3cgYSBzdWNjZXNzIHRvYXN0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIHNob3dTdWNjZXNzKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5zaG93U3VjY2VzcyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBhbiBlcnJvciB0b2FzdCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBzaG93RXJyb3IobWVzc2FnZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNob3dFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBhIHdhcm5pbmcgdG9hc3Qgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgc2hvd1dhcm5pbmcobWVzc2FnZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNob3dXYXJuaW5nKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGFuIGluZm8gdG9hc3Qgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgc2hvd0luZm8obWVzc2FnZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNob3dJbmZvKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGEgdG9hc3Qgbm90aWZpY2F0aW9uIHdpdGggY3VzdG9tIHR5cGVcbiAgICAgKi9cbiAgICBzaG93VG9hc3QodHlwZSwgbWVzc2FnZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNob3dUb2FzdCh0eXBlLCBtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzbWlzcyBhIHNwZWNpZmljIHRvYXN0XG4gICAgICovXG4gICAgZGlzbWlzc1RvYXN0KGlkKSB7XG4gICAgICAgIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5kaXNtaXNzVG9hc3QoaWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNtaXNzIGFsbCBhY3RpdmUgdG9hc3RzXG4gICAgICovXG4gICAgZGlzbWlzc0FsbFRvYXN0cygpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRpc21pc3NBbGxUb2FzdHMoKTtcbiAgICB9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE5vdGlmaWNhdGlvbiBDZW50ZXJcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQWRkIGEgbm90aWZpY2F0aW9uIHRvIHRoZSBub3RpZmljYXRpb24gY2VudGVyXG4gICAgICovXG4gICAgYWRkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmFkZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb24pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBnZXROb3RpZmljYXRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmdldE5vdGlmaWNhdGlvbnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGZpbHRlcmVkIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBnZXRGaWx0ZXJlZE5vdGlmaWNhdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZ2V0RmlsdGVyZWROb3RpZmljYXRpb25zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1hcmsgYSBub3RpZmljYXRpb24gYXMgcmVhZFxuICAgICAqL1xuICAgIG1hcmtBc1JlYWQoaWQpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLm1hcmtBc1JlYWQoaWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNYXJrIGFsbCBub3RpZmljYXRpb25zIGFzIHJlYWRcbiAgICAgKi9cbiAgICBtYXJrQWxsQXNSZWFkKCkge1xuICAgICAgICB0aGlzLnN0b3JlLmdldFN0YXRlKCkubWFya0FsbEFzUmVhZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBkZWxldGVOb3RpZmljYXRpb24oaWQpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRlbGV0ZU5vdGlmaWNhdGlvbihpZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBub3RpZmljYXRpb25zXG4gICAgICovXG4gICAgY2xlYXJBbGwoKSB7XG4gICAgICAgIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5jbGVhckFsbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaW4vdW5waW4gYSBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBwaW5Ob3RpZmljYXRpb24oaWQsIHBpbm5lZCkge1xuICAgICAgICB0aGlzLnN0b3JlLmdldFN0YXRlKCkucGluTm90aWZpY2F0aW9uKGlkLCBwaW5uZWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbm90aWZpY2F0aW9uIHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5nZXRTdGF0cygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdW5yZWFkIG5vdGlmaWNhdGlvbiBjb3VudFxuICAgICAqL1xuICAgIGdldFVucmVhZENvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmdldFVucmVhZENvdW50KCk7XG4gICAgfVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTeXN0ZW0gVHJheSBOb3RpZmljYXRpb25zIChFbGVjdHJvbilcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogU2hvdyBhIHN5c3RlbSB0cmF5IG5vdGlmaWNhdGlvbiAoRWxlY3Ryb24gbmF0aXZlKVxuICAgICAqL1xuICAgIGFzeW5jIHNob3dTeXN0ZW1Ob3RpZmljYXRpb24ob3B0aW9ucykge1xuICAgICAgICBjb25zdCB7IHRpdGxlLCBib2R5LCBpY29uLCBzaWxlbnQsIG9uQ2xpY2sgfSA9IG9wdGlvbnM7XG4gICAgICAgIC8vIENoZWNrIGlmIE5vdGlmaWNhdGlvbiBBUEkgaXMgYXZhaWxhYmxlXG4gICAgICAgIGlmICghKCdOb3RpZmljYXRpb24nIGluIHdpbmRvdykpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignU3lzdGVtIG5vdGlmaWNhdGlvbnMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVxdWVzdCBwZXJtaXNzaW9uIGlmIG5lZWRlZFxuICAgICAgICBpZiAoTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgY29uc3QgcGVybWlzc2lvbiA9IGF3YWl0IE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpO1xuICAgICAgICAgICAgaWYgKHBlcm1pc3Npb24gIT09ICdncmFudGVkJykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm90aWZpY2F0aW9uIHBlcm1pc3Npb24gZGVuaWVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2dyYW50ZWQnKSB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKHRpdGxlLCB7XG4gICAgICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgICAgICBpY29uOiBpY29uIHx8ICcvaWNvbi5wbmcnLFxuICAgICAgICAgICAgICAgIHNpbGVudDogc2lsZW50ID8/IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRhZzogJ21hbmRhLWRpc2NvdmVyeScsIC8vIFByZXZlbnRzIGR1cGxpY2F0ZSBub3RpZmljYXRpb25zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLm9uY2xpY2sgPSBvbkNsaWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXV0by1jbG9zZSBhZnRlciA1IHNlY29uZHNcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gbm90aWZpY2F0aW9uLmNsb3NlKCksIDUwMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgc3lzdGVtIG5vdGlmaWNhdGlvbiBmb3Igc3VjY2Vzc1xuICAgICAqL1xuICAgIGFzeW5jIHNob3dTeXN0ZW1TdWNjZXNzKHRpdGxlLCBib2R5KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2hvd1N5c3RlbU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBpY29uOiAnL2ljb25zL3N1Y2Nlc3MucG5nJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgc3lzdGVtIG5vdGlmaWNhdGlvbiBmb3IgZXJyb3JcbiAgICAgKi9cbiAgICBhc3luYyBzaG93U3lzdGVtRXJyb3IodGl0bGUsIGJvZHkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zaG93U3lzdGVtTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGljb246ICcvaWNvbnMvZXJyb3IucG5nJyxcbiAgICAgICAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IHN5c3RlbSBub3RpZmljYXRpb24gZm9yIHdhcm5pbmdcbiAgICAgKi9cbiAgICBhc3luYyBzaG93U3lzdGVtV2FybmluZyh0aXRsZSwgYm9keSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNob3dTeXN0ZW1Ob3RpZmljYXRpb24oe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgaWNvbjogJy9pY29ucy93YXJuaW5nLnBuZycsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IHN5c3RlbSBub3RpZmljYXRpb24gZm9yIGluZm9cbiAgICAgKi9cbiAgICBhc3luYyBzaG93U3lzdGVtSW5mbyh0aXRsZSwgYm9keSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNob3dTeXN0ZW1Ob3RpZmljYXRpb24oe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgaWNvbjogJy9pY29ucy9pbmZvLnBuZycsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQ29udmVuaWVuY2UgTWV0aG9kc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBTaG93IG5vdGlmaWNhdGlvbiBmb3IgUG93ZXJTaGVsbCBleGVjdXRpb24gY29tcGxldGlvblxuICAgICAqL1xuICAgIG5vdGlmeUV4ZWN1dGlvbkNvbXBsZXRlKHNjcmlwdE5hbWUsIHN1Y2Nlc3MsIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzdWNjZXNzXG4gICAgICAgICAgICA/IGBTY3JpcHQgXCIke3NjcmlwdE5hbWV9XCIgY29tcGxldGVkIHN1Y2Nlc3NmdWxseSBpbiAkeyhkdXJhdGlvbiAvIDEwMDApLnRvRml4ZWQoMSl9c2BcbiAgICAgICAgICAgIDogYFNjcmlwdCBcIiR7c2NyaXB0TmFtZX1cIiBmYWlsZWRgO1xuICAgICAgICBjb25zdCB0eXBlID0gc3VjY2VzcyA/ICdzdWNjZXNzJyA6ICdlcnJvcic7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dUb2FzdCh0eXBlLCBtZXNzYWdlLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogc3VjY2VzcyA/IDUwMDAgOiAwLCAvLyBFcnJvcnMgZG9uJ3QgYXV0by1kaXNtaXNzXG4gICAgICAgICAgICBhY3Rpb25zOiBzdWNjZXNzXG4gICAgICAgICAgICAgICAgPyBbXVxuICAgICAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgRGV0YWlscycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmF2aWdhdGUgdG8gZXhlY3V0aW9uIGxvZyBvciBzaG93IGRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVmlldyBleGVjdXRpb24gZGV0YWlscycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdwcmltYXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc21pc3NPbkNsaWNrOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG5vdGlmaWNhdGlvbiBmb3IgZGlzY292ZXJ5IGNvbXBsZXRpb25cbiAgICAgKi9cbiAgICBub3RpZnlEaXNjb3ZlcnlDb21wbGV0ZShkaXNjb3ZlcnlUeXBlLCBpdGVtc0ZvdW5kKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dTdWNjZXNzKGAke2Rpc2NvdmVyeVR5cGV9IGRpc2NvdmVyeSBjb21wbGV0ZTogJHtpdGVtc0ZvdW5kfSBpdGVtcyBmb3VuZGAsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiA3MDAwLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IFJlc3VsdHMnLFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOYXZpZ2F0ZSB0byBkaXNjb3ZlcnkgcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05hdmlnYXRlIHRvIGRpc2NvdmVyeSByZXN1bHRzJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdwcmltYXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc09uQ2xpY2s6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG5vdGlmaWNhdGlvbiBmb3IgbWlncmF0aW9uIHByb2dyZXNzXG4gICAgICovXG4gICAgbm90aWZ5TWlncmF0aW9uUHJvZ3Jlc3Mod2F2ZU5hbWUsIHByb2dyZXNzLCBzdGF0dXMpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBNaWdyYXRpb24gd2F2ZSBcIiR7d2F2ZU5hbWV9XCI6ICR7cHJvZ3Jlc3N9JSBjb21wbGV0ZWA7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dJbmZvKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiAwLCAvLyBEb24ndCBhdXRvLWRpc21pc3MgZHVyaW5nIG1pZ3JhdGlvblxuICAgICAgICAgICAgc2hvd1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdWaWV3IERldGFpbHMnLFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOYXZpZ2F0ZSB0byBtaWdyYXRpb24gZXhlY3V0aW9uIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOYXZpZ2F0ZSB0byBtaWdyYXRpb24gdmlldycpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAncHJpbWFyeScsXG4gICAgICAgICAgICAgICAgICAgIGRpc21pc3NPbkNsaWNrOiBmYWxzZSwgLy8gS2VlcCBub3RpZmljYXRpb24gb3BlblxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBub3RpZmljYXRpb24gZm9yIHZhbGlkYXRpb24gZXJyb3JzXG4gICAgICovXG4gICAgbm90aWZ5VmFsaWRhdGlvbkVycm9ycyhlcnJvckNvdW50LCBjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3dFcnJvcihgJHtlcnJvckNvdW50fSB2YWxpZGF0aW9uIGVycm9yJHtlcnJvckNvdW50ID4gMSA/ICdzJyA6ICcnfSBmb3VuZCBpbiAke2NvbnRleHR9YCwge1xuICAgICAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0ZpeCBFcnJvcnMnLFxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOYXZpZ2F0ZSB0byB2YWxpZGF0aW9uIHZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdOYXZpZ2F0ZSB0byB2YWxpZGF0aW9uIHZpZXcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ2RhbmdlcicsXG4gICAgICAgICAgICAgICAgICAgIGRpc21pc3NPbkNsaWNrOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIHN0b3JlIGNoYW5nZXNcbiAgICAgKi9cbiAgICBzdWJzY3JpYmUoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuc3Vic2NyaWJlKGNhbGxiYWNrKTtcbiAgICB9XG59XG4vLyBFeHBvcnQgc2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3Qgbm90aWZpY2F0aW9uU2VydmljZSA9IG5ldyBOb3RpZmljYXRpb25TZXJ2aWNlKCk7XG4vLyBFeHBvcnQgY2xhc3MgZm9yIHRlc3Rpbmcgb3IgY3VzdG9tIGluc3RhbmNlc1xuZXhwb3J0IGRlZmF1bHQgTm90aWZpY2F0aW9uU2VydmljZTtcbiIsIi8qKlxuICogUHJvZ3Jlc3MgU2VydmljZVxuICogR2xvYmFsIHByb2dyZXNzIHRyYWNraW5nIGZvciBsb25nLXJ1bm5pbmcgb3BlcmF0aW9uc1xuICogU3VwcG9ydHMgaW5kZXRlcm1pbmF0ZS9kZXRlcm1pbmF0ZSBwcm9ncmVzcywgbXVsdGktdGFzayB0cmFja2luZywgaGllcmFyY2hpY2FsIHByb2dyZXNzXG4gKi9cbmltcG9ydCB7IG5vdGlmaWNhdGlvblNlcnZpY2UgfSBmcm9tICcuL25vdGlmaWNhdGlvblNlcnZpY2UnO1xuLyoqXG4gKiBQcm9ncmVzcyBTZXJ2aWNlIENsYXNzXG4gKi9cbmNsYXNzIFByb2dyZXNzU2VydmljZSB7XG4gICAgdGFza3MgPSBuZXcgTWFwKCk7XG4gICAgbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIGhpc3RvcnlMaW1pdCA9IDUwO1xuICAgIGhpc3RvcnkgPSBbXTtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gVGFzayBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIFN0YXJ0IGEgbmV3IHByb2dyZXNzIHRhc2tcbiAgICAgKi9cbiAgICBzdGFydFRhc2sodGl0bGUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCB0YXNrSWQgPSB0aGlzLmdlbmVyYXRlVGFza0lkKCk7XG4gICAgICAgIGNvbnN0IHRhc2sgPSB7XG4gICAgICAgICAgICBpZDogdGFza0lkLFxuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogb3B0aW9ucy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHN0YXR1czogJ3J1bm5pbmcnLFxuICAgICAgICAgICAgdHlwZTogb3B0aW9ucy50eXBlIHx8ICdpbmRldGVybWluYXRlJyxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IG9wdGlvbnMudHlwZSA9PT0gJ2RldGVybWluYXRlJyA/IDAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0b3RhbEl0ZW1zOiBvcHRpb25zLnRvdGFsSXRlbXMsXG4gICAgICAgICAgICBpdGVtc1Byb2Nlc3NlZDogMCxcbiAgICAgICAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGNhbmNlbGxhYmxlOiBvcHRpb25zLmNhbmNlbGxhYmxlID8/IGZhbHNlLFxuICAgICAgICAgICAgb25DYW5jZWw6IG9wdGlvbnMub25DYW5jZWwsXG4gICAgICAgICAgICBzdWJ0YXNrczogW10sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudGFza3Muc2V0KHRhc2tJZCwgdGFzayk7XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgICAgIC8vIFNob3cgbm90aWZpY2F0aW9uIGlmIHJlcXVlc3RlZFxuICAgICAgICBpZiAob3B0aW9ucy5ub3RpZmljYXRpb24/LnNob3dUb2FzdCkge1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uU2VydmljZS5zaG93SW5mbyhgU3RhcnRlZDogJHt0aXRsZX1gLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDMwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFza0lkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGFzayBwcm9ncmVzc1xuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzKHRhc2tJZCwgdXBkYXRlKSB7XG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tzLmdldCh0YXNrSWQpO1xuICAgICAgICBpZiAoIXRhc2spXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFVwZGF0ZSB0YXNrXG4gICAgICAgIGlmICh1cGRhdGUucGVyY2VudGFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXNrLnBlcmNlbnRhZ2UgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsIHVwZGF0ZS5wZXJjZW50YWdlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZS5jdXJyZW50SXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXNrLmN1cnJlbnRJdGVtID0gdXBkYXRlLmN1cnJlbnRJdGVtO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGUuaXRlbXNQcm9jZXNzZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGFzay5pdGVtc1Byb2Nlc3NlZCA9IHVwZGF0ZS5pdGVtc1Byb2Nlc3NlZDtcbiAgICAgICAgICAgIC8vIEF1dG8tY2FsY3VsYXRlIHBlcmNlbnRhZ2UgaWYgdG90YWxJdGVtcyBpcyBrbm93blxuICAgICAgICAgICAgaWYgKHRhc2sudG90YWxJdGVtcyAmJiB0YXNrLnR5cGUgPT09ICdkZXRlcm1pbmF0ZScpIHtcbiAgICAgICAgICAgICAgICB0YXNrLnBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKCh1cGRhdGUuaXRlbXNQcm9jZXNzZWQgLyB0YXNrLnRvdGFsSXRlbXMpICogMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxjdWxhdGUgZXN0aW1hdGVkIHRpbWUgcmVtYWluaW5nXG4gICAgICAgIGlmICh0YXNrLnBlcmNlbnRhZ2UgJiYgdGFzay5wZXJjZW50YWdlID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZWxhcHNlZCA9IERhdGUubm93KCkgLSB0YXNrLnN0YXJ0VGltZS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBjb25zdCBlc3RpbWF0ZWRUb3RhbCA9IChlbGFwc2VkIC8gdGFzay5wZXJjZW50YWdlKSAqIDEwMDtcbiAgICAgICAgICAgIHRhc2suZXN0aW1hdGVkVGltZVJlbWFpbmluZyA9IGVzdGltYXRlZFRvdGFsIC0gZWxhcHNlZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb21wbGV0ZSBhIHRhc2tcbiAgICAgKi9cbiAgICBjb21wbGV0ZVRhc2sodGFza0lkLCBub3RpZmljYXRpb24pIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmICghdGFzaylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGFzay5zdGF0dXMgPSAnY29tcGxldGVkJztcbiAgICAgICAgdGFzay5lbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGFzay5wZXJjZW50YWdlID0gMTAwO1xuICAgICAgICB0aGlzLm1vdmVUb0hpc3RvcnkodGFzayk7XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgICAgIC8vIFNob3cgbm90aWZpY2F0aW9uXG4gICAgICAgIGlmIChub3RpZmljYXRpb24/LnNob3dUb2FzdCkge1xuICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSAodGFzay5lbmRUaW1lLmdldFRpbWUoKSAtIHRhc2suc3RhcnRUaW1lLmdldFRpbWUoKSkgLyAxMDAwO1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uU2VydmljZS5zaG93U3VjY2VzcyhgQ29tcGxldGVkOiAke3Rhc2sudGl0bGV9ICgke2R1cmF0aW9uLnRvRml4ZWQoMSl9cylgLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDUwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBGYWlsIGEgdGFza1xuICAgICAqL1xuICAgIGZhaWxUYXNrKHRhc2tJZCwgZXJyb3IsIG5vdGlmaWNhdGlvbikge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5nZXQodGFza0lkKTtcbiAgICAgICAgaWYgKCF0YXNrKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0YXNrLnN0YXR1cyA9ICdmYWlsZWQnO1xuICAgICAgICB0YXNrLmVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0YXNrLmVycm9yID0gZXJyb3I7XG4gICAgICAgIHRoaXMubW92ZVRvSGlzdG9yeSh0YXNrKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICAgICAgLy8gU2hvdyBub3RpZmljYXRpb25cbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbj8uc2hvd1RvYXN0KSB7XG4gICAgICAgICAgICBub3RpZmljYXRpb25TZXJ2aWNlLnNob3dFcnJvcihgRmFpbGVkOiAke3Rhc2sudGl0bGV9IC0gJHtlcnJvcn1gLCB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDAsIC8vIERvbid0IGF1dG8tZGlzbWlzcyBlcnJvcnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHRhc2tcbiAgICAgKi9cbiAgICBjYW5jZWxUYXNrKHRhc2tJZCwgbm90aWZpY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tzLmdldCh0YXNrSWQpO1xuICAgICAgICBpZiAoIXRhc2spXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICghdGFzay5jYW5jZWxsYWJsZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBUYXNrICR7dGFza0lkfSBpcyBub3QgY2FuY2VsbGFibGVgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYWxsIGNhbmNlbCBoYW5kbGVyXG4gICAgICAgIGlmICh0YXNrLm9uQ2FuY2VsKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRhc2sub25DYW5jZWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNhbGxpbmcgb25DYW5jZWwgaGFuZGxlcjonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGFzay5zdGF0dXMgPSAnY2FuY2VsbGVkJztcbiAgICAgICAgdGFzay5lbmRUaW1lID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcy5tb3ZlVG9IaXN0b3J5KHRhc2spO1xuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgICAgICAvLyBTaG93IG5vdGlmaWNhdGlvblxuICAgICAgICBpZiAobm90aWZpY2F0aW9uPy5zaG93VG9hc3QpIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvblNlcnZpY2Uuc2hvd1dhcm5pbmcoYENhbmNlbGxlZDogJHt0YXNrLnRpdGxlfWAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHRhc2sgKGZvciBjb21wbGV0ZWQvZmFpbGVkL2NhbmNlbGxlZCB0YXNrcylcbiAgICAgKi9cbiAgICByZW1vdmVUYXNrKHRhc2tJZCkge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5nZXQodGFza0lkKTtcbiAgICAgICAgaWYgKHRhc2sgJiYgdGFzay5zdGF0dXMgPT09ICdydW5uaW5nJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDYW5ub3QgcmVtb3ZlIHJ1bm5pbmcgdGFzay4gQ2FuY2VsIG9yIGNvbXBsZXRlIGl0IGZpcnN0LicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFza3MuZGVsZXRlKHRhc2tJZCk7XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBjb21wbGV0ZWQvZmFpbGVkL2NhbmNlbGxlZCB0YXNrc1xuICAgICAqL1xuICAgIGNsZWFyQ29tcGxldGVkVGFza3MoKSB7XG4gICAgICAgIGNvbnN0IHRvUmVtb3ZlID0gW107XG4gICAgICAgIHRoaXMudGFza3MuZm9yRWFjaCgodGFzaywgaWQpID0+IHtcbiAgICAgICAgICAgIGlmICh0YXNrLnN0YXR1cyAhPT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICAgICAgdG9SZW1vdmUucHVzaChpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0b1JlbW92ZS5mb3JFYWNoKChpZCkgPT4gdGhpcy50YXNrcy5kZWxldGUoaWQpKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIEhpZXJhcmNoaWNhbCBQcm9ncmVzcyAoU3VidGFza3MpXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIEFkZCBhIHN1YnRhc2sgdG8gYSBwYXJlbnQgdGFza1xuICAgICAqL1xuICAgIGFkZFN1YnRhc2sodGFza0lkLCBzdWJ0YXNrVGl0bGUpIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmICghdGFzaylcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgY29uc3Qgc3VidGFza0lkID0gYCR7dGFza0lkfS1zdWItJHt0YXNrLnN1YnRhc2tzLmxlbmd0aH1gO1xuICAgICAgICBjb25zdCBzdWJ0YXNrID0ge1xuICAgICAgICAgICAgaWQ6IHN1YnRhc2tJZCxcbiAgICAgICAgICAgIHRpdGxlOiBzdWJ0YXNrVGl0bGUsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgIH07XG4gICAgICAgIHRhc2suc3VidGFza3MucHVzaChzdWJ0YXNrKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICAgICAgcmV0dXJuIHN1YnRhc2tJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVXBkYXRlIHN1YnRhc2sgcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICB1cGRhdGVTdWJ0YXNrKHRhc2tJZCwgc3VidGFza0lkLCB1cGRhdGUpIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmICghdGFzaylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3Qgc3VidGFzayA9IHRhc2suc3VidGFza3MuZmluZCgoc3QpID0+IHN0LmlkID09PSBzdWJ0YXNrSWQpO1xuICAgICAgICBpZiAoIXN1YnRhc2spXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh1cGRhdGUucGVyY2VudGFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdWJ0YXNrLnBlcmNlbnRhZ2UgPSB1cGRhdGUucGVyY2VudGFnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdWJ0YXNrLnN0YXR1cyA9IHVwZGF0ZS5zdGF0dXM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUmVjYWxjdWxhdGUgcGFyZW50IHRhc2sgcGVyY2VudGFnZSBiYXNlZCBvbiBzdWJ0YXNrc1xuICAgICAgICBpZiAodGFzay5zdWJ0YXNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB0b3RhbFBlcmNlbnRhZ2UgPSB0YXNrLnN1YnRhc2tzLnJlZHVjZSgoc3VtLCBzdCkgPT4gc3VtICsgc3QucGVyY2VudGFnZSwgMCk7XG4gICAgICAgICAgICB0YXNrLnBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKHRvdGFsUGVyY2VudGFnZSAvIHRhc2suc3VidGFza3MubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gUXVlcmllc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGFjdGl2ZSB0YXNrc1xuICAgICAqL1xuICAgIGdldFRhc2tzKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnRhc2tzLnZhbHVlcygpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgc3BlY2lmaWMgdGFza1xuICAgICAqL1xuICAgIGdldFRhc2sodGFza0lkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhc2tzLmdldCh0YXNrSWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgcnVubmluZyB0YXNrc1xuICAgICAqL1xuICAgIGdldFJ1bm5pbmdUYXNrcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VGFza3MoKS5maWx0ZXIoKHQpID0+IHQuc3RhdHVzID09PSAncnVubmluZycpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhbnkgdGFza3MgYXJlIHJ1bm5pbmdcbiAgICAgKi9cbiAgICBoYXNSdW5uaW5nVGFza3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJ1bm5pbmdUYXNrcygpLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0YXNrIGNvdW50IGJ5IHN0YXR1c1xuICAgICAqL1xuICAgIGdldFRhc2tDb3VudChzdGF0dXMpIHtcbiAgICAgICAgaWYgKCFzdGF0dXMpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YXNrcy5zaXplO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYXNrcygpLmZpbHRlcigodCkgPT4gdC5zdGF0dXMgPT09IHN0YXR1cykubGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdGFzayBoaXN0b3J5XG4gICAgICovXG4gICAgZ2V0SGlzdG9yeSgpIHtcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLmhpc3RvcnldO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbGVhciBoaXN0b3J5XG4gICAgICovXG4gICAgY2xlYXJIaXN0b3J5KCkge1xuICAgICAgICB0aGlzLmhpc3RvcnkgPSBbXTtcbiAgICB9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbnZlbmllbmNlIE1ldGhvZHNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogUnVuIGEgdGFzayB3aXRoIGF1dG9tYXRpYyBwcm9ncmVzcyB0cmFja2luZ1xuICAgICAqL1xuICAgIGFzeW5jIHJ1blRhc2sodGl0bGUsIGFzeW5jRm4sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBjb25zdCB0YXNrSWQgPSB0aGlzLnN0YXJ0VGFzayh0aXRsZSwge1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHR5cGU6ICdkZXRlcm1pbmF0ZScsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlUHJvZ3Jlc3MgPSAocGVyY2VudGFnZSwgbWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvZ3Jlc3ModGFza0lkLCB7XG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFzeW5jRm4odXBkYXRlUHJvZ3Jlc3MpO1xuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZVRhc2sodGFza0lkLCBvcHRpb25zLm5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5mYWlsVGFzayh0YXNrSWQsIGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InLCBvcHRpb25zLm5vdGlmaWNhdGlvbik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFjayBQb3dlclNoZWxsIHNjcmlwdCBleGVjdXRpb25cbiAgICAgKi9cbiAgICB0cmFja1NjcmlwdEV4ZWN1dGlvbihzY3JpcHROYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRUYXNrKGBFeGVjdXRpbmcgJHtzY3JpcHROYW1lfWAsIHtcbiAgICAgICAgICAgIHR5cGU6ICdpbmRldGVybWluYXRlJyxcbiAgICAgICAgICAgIGNhbmNlbGxhYmxlOiBvcHRpb25zLmNhbmNlbGxhYmxlLFxuICAgICAgICAgICAgb25DYW5jZWw6IG9wdGlvbnMub25DYW5jZWwsXG4gICAgICAgICAgICBub3RpZmljYXRpb246IHsgc2hvd1RvYXN0OiBmYWxzZSB9LCAvLyBEb24ndCBzaG93IHRvYXN0IGZvciBzY3JpcHRzXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmFjayBkaXNjb3Zlcnkgb3BlcmF0aW9uXG4gICAgICovXG4gICAgdHJhY2tEaXNjb3ZlcnkoZGlzY292ZXJ5VHlwZSwgZXhwZWN0ZWRJdGVtcykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydFRhc2soYCR7ZGlzY292ZXJ5VHlwZX0gRGlzY292ZXJ5YCwge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTY2FubmluZyBlbnZpcm9ubWVudC4uLicsXG4gICAgICAgICAgICB0eXBlOiBleHBlY3RlZEl0ZW1zID8gJ2RldGVybWluYXRlJyA6ICdpbmRldGVybWluYXRlJyxcbiAgICAgICAgICAgIHRvdGFsSXRlbXM6IGV4cGVjdGVkSXRlbXMsXG4gICAgICAgICAgICBjYW5jZWxsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbjogeyBzaG93VG9hc3Q6IHRydWUgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYWNrIG1pZ3JhdGlvbiBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB0cmFja01pZ3JhdGlvbih3YXZlTmFtZSwgdG90YWxVc2Vycykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydFRhc2soYE1pZ3JhdGluZyBXYXZlOiAke3dhdmVOYW1lfWAsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgUHJvY2Vzc2luZyAke3RvdGFsVXNlcnN9IHVzZXJzLi4uYCxcbiAgICAgICAgICAgIHR5cGU6ICdkZXRlcm1pbmF0ZScsXG4gICAgICAgICAgICB0b3RhbEl0ZW1zOiB0b3RhbFVzZXJzLFxuICAgICAgICAgICAgY2FuY2VsbGFibGU6IHRydWUsXG4gICAgICAgICAgICBub3RpZmljYXRpb246IHsgc2hvd1RvYXN0OiB0cnVlIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSGVscGVyc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB1bmlxdWUgdGFzayBJRFxuICAgICAqL1xuICAgIGdlbmVyYXRlVGFza0lkKCkge1xuICAgICAgICByZXR1cm4gYHRhc2stJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRhc2sgdG8gaGlzdG9yeVxuICAgICAqL1xuICAgIG1vdmVUb0hpc3RvcnkodGFzaykge1xuICAgICAgICB0aGlzLnRhc2tzLmRlbGV0ZSh0YXNrLmlkKTtcbiAgICAgICAgLy8gQWRkIHRvIGhpc3RvcnlcbiAgICAgICAgdGhpcy5oaXN0b3J5LnVuc2hpZnQodGFzayk7XG4gICAgICAgIC8vIExpbWl0IGhpc3Rvcnkgc2l6ZVxuICAgICAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IHRoaXMuaGlzdG9yeUxpbWl0KSB7XG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLmhpc3Rvcnkuc2xpY2UoMCwgdGhpcy5oaXN0b3J5TGltaXQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZSB0byBwcm9ncmVzcyB1cGRhdGVzXG4gICAgICovXG4gICAgc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgICAgIC8vIEltbWVkaWF0ZWx5IG5vdGlmeSB3aXRoIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgbGlzdGVuZXIodGhpcy5nZXRUYXNrcygpKTtcbiAgICAgICAgLy8gUmV0dXJuIHVuc3Vic2NyaWJlIGZ1bmN0aW9uXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVycy5kZWxldGUobGlzdGVuZXIpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBOb3RpZnkgYWxsIGxpc3RlbmVyc1xuICAgICAqL1xuICAgIG5vdGlmeUxpc3RlbmVycygpIHtcbiAgICAgICAgY29uc3QgdGFza3MgPSB0aGlzLmdldFRhc2tzKCk7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyKHRhc2tzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2dyZXNzIGxpc3RlbmVyIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuLy8gRXhwb3J0IHNpbmdsZXRvbiBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IHByb2dyZXNzU2VydmljZSA9IG5ldyBQcm9ncmVzc1NlcnZpY2UoKTtcbi8vIEV4cG9ydCBjbGFzcyBmb3IgdGVzdGluZ1xuZXhwb3J0IGRlZmF1bHQgUHJvZ3Jlc3NTZXJ2aWNlO1xuIiwiaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgY2FjaGVTZXJ2aWNlIH0gZnJvbSBcIi4uL3NlcnZpY2VzL2NhY2hlU2VydmljZVwiO1xuaW1wb3J0IHsgcHJvZ3Jlc3NTZXJ2aWNlIH0gZnJvbSBcIi4uL3NlcnZpY2VzL3Byb2dyZXNzU2VydmljZVwiO1xuLyoqXG4gKiBFbmhhbmNlZCBnZW5lcmljIGRpc2NvdmVyeSBob29rIHdpdGggYWR2YW5jZWQgZmVhdHVyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURpc2NvdmVyeSh0eXBlLCBwcm9maWxlSWQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHsgZW5hYmxlQ2FjaGluZyA9IHRydWUsIGNhY2hlVFRMID0gNSAqIDYwICogMTAwMCwgLy8gNSBtaW51dGVzXG4gICAgZW5hYmxlUmV0cnkgPSB0cnVlLCBtYXhSZXRyaWVzID0gMywgcmV0cnlEZWxheSA9IDEwMDAsIGVuYWJsZVByb2dyZXNzVHJhY2tpbmcgPSB0cnVlLCBlbmFibGVDYW5jZWxsYXRpb24gPSB0cnVlLCBpbmNyZW1lbnRhbCA9IGZhbHNlLCBsYXN0TW9kaWZpZWQsIHZhbGlkYXRpb25TY2hlbWEsIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgcm93czogW10sXG4gICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICBpc0NhbmNlbGxpbmc6IGZhbHNlLFxuICAgICAgICByZXRyeUNvdW50OiAwLFxuICAgICAgICBpdGVtc1Byb2Nlc3NlZDogMCxcbiAgICB9KTtcbiAgICBjb25zdCBidWZmZXIgPSB1c2VSZWYoW10pO1xuICAgIGNvbnN0IHByb2dyZXNzVGFza0lkID0gdXNlUmVmKCk7XG4gICAgY29uc3QgYWJvcnRDb250cm9sbGVyID0gdXNlUmVmKCk7XG4gICAgY29uc3QgcmV0cnlUaW1lb3V0ID0gdXNlUmVmKCk7XG4gICAgY29uc3QgZ2V0Q2FjaGVLZXkgPSB1c2VDYWxsYmFjaygoYXJncykgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhID0geyB0eXBlLCBwcm9maWxlSWQsIGFyZ3MsIGluY3JlbWVudGFsLCBsYXN0TW9kaWZpZWQgfTtcbiAgICAgICAgcmV0dXJuIGBkaXNjb3Zlcnk6JHt0eXBlfToke3Byb2ZpbGVJZH06JHtKU09OLnN0cmluZ2lmeShrZXlEYXRhKX1gO1xuICAgIH0sIFt0eXBlLCBwcm9maWxlSWQsIGluY3JlbWVudGFsLCBsYXN0TW9kaWZpZWRdKTtcbiAgICBjb25zdCB2YWxpZGF0ZVJvdyA9IHVzZUNhbGxiYWNrKChyb3cpID0+IHtcbiAgICAgICAgaWYgKCF2YWxpZGF0aW9uU2NoZW1hKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vIEJhc2ljIHZhbGlkYXRpb24gLSBjb3VsZCBiZSBlbmhhbmNlZCB3aXRoIGEgc2NoZW1hIHZhbGlkYXRvclxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU2ltcGxlIHJlcXVpcmVkIGZpZWxkcyBjaGVja1xuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25TY2hlbWEucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpZWxkIG9mIHZhbGlkYXRpb25TY2hlbWEucmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyb3dbZmllbGRdKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sIFt2YWxpZGF0aW9uU2NoZW1hXSk7XG4gICAgY29uc3QgdHJhbnNmb3JtUm93ID0gdXNlQ2FsbGJhY2soKHJvdykgPT4ge1xuICAgICAgICAvLyBBcHBseSBkYXRhIHRyYW5zZm9ybWF0aW9ucyBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHZhbGlkYXRpb25TY2hlbWE/LnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRpb25TY2hlbWEudHJhbnNmb3JtKHJvdyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9LCBbdmFsaWRhdGlvblNjaGVtYV0pO1xuICAgIGNvbnN0IHN0YXJ0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKGFyZ3MgPSB7fSkgPT4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5lbGVjdHJvbkFQSSkge1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBlcnJvcjogXCJFbGVjdHJvbiBBUEkgbm90IGF2YWlsYWJsZVwiIH0pKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXByb2ZpbGVJZCkge1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBlcnJvcjogXCJObyBwcm9maWxlIHNlbGVjdGVkXCIgfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhY2hlS2V5ID0gZ2V0Q2FjaGVLZXkoYXJncyk7XG4gICAgICAgIC8vIENoZWNrIGNhY2hlIGZpcnN0XG4gICAgICAgIGlmIChlbmFibGVDYWNoaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjYWNoZWQgPSBjYWNoZVNlcnZpY2UuZ2V0KGNhY2hlS2V5KTtcbiAgICAgICAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgICAgIHJvd3M6IGNhY2hlZCxcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVIaXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxhc3RSdW46IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSBDYWNoZSBoaXQgZm9yICR7dHlwZX1gKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBzdGF0ZVxuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgIHJvd3M6IFtdLFxuICAgICAgICAgICAgaXNSdW5uaW5nOiB0cnVlLFxuICAgICAgICAgICAgaXNDYW5jZWxsaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHJldHJ5Q291bnQ6IDAsXG4gICAgICAgICAgICBjYWNoZUhpdDogZmFsc2UsXG4gICAgICAgICAgICBjdXJyZW50SXRlbTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaXRlbXNQcm9jZXNzZWQ6IDAsXG4gICAgICAgICAgICB0b3RhbEl0ZW1zOiB1bmRlZmluZWQsXG4gICAgICAgIH0pKTtcbiAgICAgICAgYnVmZmVyLmN1cnJlbnQgPSBbXTtcbiAgICAgICAgYWJvcnRDb250cm9sbGVyLmN1cnJlbnQgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIC8vIFN0YXJ0IHByb2dyZXNzIHRyYWNraW5nXG4gICAgICAgIGlmIChlbmFibGVQcm9ncmVzc1RyYWNraW5nKSB7XG4gICAgICAgICAgICBwcm9ncmVzc1Rhc2tJZC5jdXJyZW50ID0gcHJvZ3Jlc3NTZXJ2aWNlLnRyYWNrRGlzY292ZXJ5KHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV4ZWN1dGVEaXNjb3ZlcnkgPSBhc3luYyAocmV0cnlDb3VudCA9IDApID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIGV4aXN0aW5nIEVsZWN0cm9uIEFQSSBtZXRob2RzIC0gdGhlIHR5cGUgZXJyb3JzIGFyZSBkdWUgdG8gdHlwZSBtaXNtYXRjaGVzXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBuZWVkIHRvIGJlIHJlc29sdmVkIGluIHRoZSBhY3R1YWwgRWxlY3Ryb24gQVBJIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLnN0YXJ0RGlzY292ZXJ5KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZmlsZUlkLFxuICAgICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcnVuSWQ6IHJlc3VsdD8ucnVuSWQgfSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSBTdGFydGVkICR7dHlwZX0gZGlzY292ZXJ5IHdpdGggcnVuSWQ6ICR7cmVzdWx0LnJ1bklkfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSAke3R5cGV9IGRpc2NvdmVyeSB3YXMgY2FuY2VsbGVkYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3VzZURpc2NvdmVyeV0gRmFpbGVkIHRvIHN0YXJ0IGRpc2NvdmVyeTpgLCBlcnIpO1xuICAgICAgICAgICAgICAgIC8vIFJldHJ5IGxvZ2ljXG4gICAgICAgICAgICAgICAgaWYgKGVuYWJsZVJldHJ5ICYmIHJldHJ5Q291bnQgPCBtYXhSZXRyaWVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSBSZXRyeWluZyAke3R5cGV9IGRpc2NvdmVyeSAoJHtyZXRyeUNvdW50ICsgMX0vJHttYXhSZXRyaWVzfSkuLi5gKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCByZXRyeUNvdW50OiByZXRyeUNvdW50ICsgMSB9KSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHJ5VGltZW91dC5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlRGlzY292ZXJ5KHJldHJ5Q291bnQgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgcmV0cnlEZWxheSAqIE1hdGgucG93KDIsIHJldHJ5Q291bnQpKTsgLy8gRXhwb25lbnRpYWwgYmFja29mZlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVyci5tZXNzYWdlIHx8IFwiRmFpbGVkIHRvIHN0YXJ0IGRpc2NvdmVyeVwiLFxuICAgICAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NUYXNrSWQuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc1NlcnZpY2UuZmFpbFRhc2socHJvZ3Jlc3NUYXNrSWQuY3VycmVudCwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgYXdhaXQgZXhlY3V0ZURpc2NvdmVyeSgpO1xuICAgIH0sIFt0eXBlLCBwcm9maWxlSWQsIGVuYWJsZUNhY2hpbmcsIGVuYWJsZVJldHJ5LCBtYXhSZXRyaWVzLCByZXRyeURlbGF5LCBlbmFibGVQcm9ncmVzc1RyYWNraW5nLCBnZXRDYWNoZUtleSwgaW5jcmVtZW50YWwsIGxhc3RNb2RpZmllZF0pO1xuICAgIGNvbnN0IGNhbmNlbCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5pc1J1bm5pbmcgfHwgc3RhdGUuaXNDYW5jZWxsaW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGlzQ2FuY2VsbGluZzogdHJ1ZSB9KSk7XG4gICAgICAgIC8vIENhbmNlbCBhYm9ydCBjb250cm9sbGVyXG4gICAgICAgIGFib3J0Q29udHJvbGxlci5jdXJyZW50Py5hYm9ydCgpO1xuICAgICAgICAvLyBDbGVhciByZXRyeSB0aW1lb3V0XG4gICAgICAgIGlmIChyZXRyeVRpbWVvdXQuY3VycmVudCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHJldHJ5VGltZW91dC5jdXJyZW50KTtcbiAgICAgICAgICAgIHJldHJ5VGltZW91dC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbmNlbCBwcm9ncmVzcyB0YXNrXG4gICAgICAgIGlmIChwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICBwcm9ncmVzc1NlcnZpY2UuY2FuY2VsVGFzayhwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KTtcbiAgICAgICAgICAgIHByb2dyZXNzVGFza0lkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FuY2VsIHZpYSBFbGVjdHJvbiBBUEkgaWYgcG9zc2libGVcbiAgICAgICAgaWYgKHN0YXRlLnJ1bklkICYmIHdpbmRvdy5lbGVjdHJvbkFQST8uY2FuY2VsRGlzY292ZXJ5KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxEaXNjb3Zlcnkoc3RhdGUucnVuSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3ZlcnkgdmlhIEFQSTonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgaXNDYW5jZWxsaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGVycm9yOiBcIkRpc2NvdmVyeSBjYW5jZWxsZWQgYnkgdXNlclwiLFxuICAgICAgICB9KSk7XG4gICAgfSwgW3N0YXRlLmlzUnVubmluZywgc3RhdGUuaXNDYW5jZWxsaW5nLCBzdGF0ZS5ydW5JZF0pO1xuICAgIGNvbnN0IGNsZWFyUmVzdWx0cyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIHJvd3M6IFtdLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgIGNhY2hlSGl0OiBmYWxzZSxcbiAgICAgICAgfSkpO1xuICAgICAgICBpZiAoZW5hYmxlQ2FjaGluZykge1xuICAgICAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBnZXRDYWNoZUtleSh7fSk7XG4gICAgICAgICAgICBjYWNoZVNlcnZpY2UuZGVsZXRlKGNhY2hlS2V5KTtcbiAgICAgICAgfVxuICAgIH0sIFtlbmFibGVDYWNoaW5nLCBnZXRDYWNoZUtleV0pO1xuICAgIC8vIExpc3RlbiBmb3IgcHJvZ3Jlc3MgZXZlbnRzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCF3aW5kb3cuZWxlY3Ryb25BUEkgfHwgIXN0YXRlLnJ1bklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBvblByb2dyZXNzID0gKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLnJ1bklkICE9PSBzdGF0ZS5ydW5JZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVzID0ge307XG4gICAgICAgICAgICAgICAgaWYgKGUucGN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlcy5wcm9ncmVzcyA9IGUucGN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVzLmN1cnJlbnRJdGVtID0gZS5jdXJyZW50SXRlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUuaXRlbXNQcm9jZXNzZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVzLml0ZW1zUHJvY2Vzc2VkID0gZS5pdGVtc1Byb2Nlc3NlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUudG90YWxJdGVtcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZXMudG90YWxJdGVtcyA9IGUudG90YWxJdGVtcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGUuZXN0aW1hdGVkVGltZVJlbWFpbmluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZXMuZXN0aW1hdGVkVGltZVJlbWFpbmluZyA9IGUuZXN0aW1hdGVkVGltZVJlbWFpbmluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgLi4ucHJldiwgLi4udXBkYXRlcyB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZS5tc2cpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZURpc2NvdmVyeV0gJHt0eXBlfTogJHtlLm1zZ31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NTZXJ2aWNlLnVwZGF0ZVByb2dyZXNzKHByb2dyZXNzVGFza0lkLmN1cnJlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZS5wY3QsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJdGVtOiBlLmN1cnJlbnRJdGVtLFxuICAgICAgICAgICAgICAgICAgICBpdGVtc1Byb2Nlc3NlZDogZS5pdGVtc1Byb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlLnJvdykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkUm93ID0gdHJhbnNmb3JtUm93KGUucm93KTtcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRhdGVSb3codHJhbnNmb3JtZWRSb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5jdXJyZW50LnB1c2godHJhbnNmb3JtZWRSb3cpO1xuICAgICAgICAgICAgICAgICAgICAvLyBCYXRjaCB1cGRhdGVzIGZvciBwZXJmb3JtYW5jZSAtIGZsdXNoIGV2ZXJ5IDIwMCByb3dzXG4gICAgICAgICAgICAgICAgICAgIGlmIChidWZmZXIuY3VycmVudC5sZW5ndGggPj0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHJvd3M6IHByZXYucm93cy5jb25jYXQoYnVmZmVyLmN1cnJlbnQpIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5jdXJyZW50ID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3VzZURpc2NvdmVyeV0gSW52YWxpZCByb3cgc2tpcHBlZDpgLCBlLnJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvblJlc3VsdCA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5ydW5JZCAhPT0gc3RhdGUucnVuSWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgLy8gRmx1c2ggcmVtYWluaW5nIGJ1ZmZlcmVkIHJvd3NcbiAgICAgICAgICAgIGlmIChidWZmZXIuY3VycmVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCByb3dzOiBwcmV2LnJvd3MuY29uY2F0KGJ1ZmZlci5jdXJyZW50KSB9KSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLmN1cnJlbnQgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZpbmFsUm93cyA9IFsuLi5zdGF0ZS5yb3dzXTtcbiAgICAgICAgICAgIGNvbnN0IGNhY2hlS2V5ID0gZS5jYWNoZUtleSB8fCBnZXRDYWNoZUtleSh7fSk7XG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzXG4gICAgICAgICAgICBpZiAoZW5hYmxlQ2FjaGluZyAmJiBmaW5hbFJvd3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNhY2hlU2VydmljZS5zZXQoY2FjaGVLZXksIGZpbmFsUm93cywgY2FjaGVUVEwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxhc3RSdW46IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBpZiAocHJvZ3Jlc3NUYXNrSWQuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzU2VydmljZS5jb21wbGV0ZVRhc2socHJvZ3Jlc3NUYXNrSWQuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NUYXNrSWQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSAke3R5cGV9IGNvbXBsZXRlZCBpbiAke2UuZHVyYXRpb25Nc31tcywgY2FjaGVkOiAkeyEhY2FjaGVLZXl9YCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUucnVuSWQgIT09IHN0YXRlLnJ1bklkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgaXNSdW5uaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGlmIChwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NTZXJ2aWNlLmZhaWxUYXNrKHByb2dyZXNzVGFza0lkLmN1cnJlbnQsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NUYXNrSWQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFt1c2VEaXNjb3ZlcnldICR7dHlwZX0gZXJyb3I6YCwgZSk7XG4gICAgICAgIH07XG4gICAgICAgIHdpbmRvdy5lbGVjdHJvbkFQSS5vbkRpc2NvdmVyeVByb2dyZXNzKG9uUHJvZ3Jlc3MpO1xuICAgICAgICB3aW5kb3cuZWxlY3Ryb25BUEkub25EaXNjb3ZlcnlSZXN1bHQob25SZXN1bHQpO1xuICAgICAgICB3aW5kb3cuZWxlY3Ryb25BUEkub25EaXNjb3ZlcnlFcnJvcihvbkVycm9yKTtcbiAgICAgICAgLy8gQ2xlYW51cCBsaXN0ZW5lcnMgb24gdW5tb3VudCAoaWYgQVBJIHN1cHBvcnRzIGl0KVxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgLy8gTm90ZTogRWxlY3Ryb24gSVBDIGRvZXNuJ3QgaGF2ZSBhIGJ1aWx0LWluIFwib2ZmXCIgYnkgZGVmYXVsdFxuICAgICAgICAgICAgLy8gSWYgeW91IGFkZCByZW1vdmVMaXN0ZW5lciBzdXBwb3J0IHRvIHByZWxvYWQsIHdpcmUgaXQgaGVyZVxuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5ydW5JZCwgc3RhdGUucm93cywgdHlwZSwgZW5hYmxlQ2FjaGluZywgY2FjaGVUVEwsIGdldENhY2hlS2V5LCB0cmFuc2Zvcm1Sb3csIHZhbGlkYXRlUm93XSk7XG4gICAgLy8gUGVyaW9kaWMgZmx1c2ggb2YgYnVmZmVyZWQgcm93cyAoZXZlcnkgNTAwbXMpXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmN1cnJlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcm93czogcHJldi5yb3dzLmNvbmNhdChidWZmZXIuY3VycmVudCkgfSkpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5jdXJyZW50ID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDUwMCk7XG4gICAgICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGNhbmNlbDogZW5hYmxlQ2FuY2VsbGF0aW9uID8gY2FuY2VsIDogdW5kZWZpbmVkLFxuICAgICAgICBjbGVhclJlc3VsdHMsXG4gICAgICAgIC8vIENvbXB1dGVkIHByb3BlcnRpZXNcbiAgICAgICAgY2FuU3RhcnQ6ICFzdGF0ZS5pc1J1bm5pbmcsXG4gICAgICAgIGNhbkNhbmNlbDogZW5hYmxlQ2FuY2VsbGF0aW9uICYmIHN0YXRlLmlzUnVubmluZyAmJiAhc3RhdGUuaXNDYW5jZWxsaW5nLFxuICAgICAgICBoYXNSZXN1bHRzOiBzdGF0ZS5yb3dzLmxlbmd0aCA+IDAsXG4gICAgfTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==