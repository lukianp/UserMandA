"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3016],{

/***/ 31247:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ components_DataTable)
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
    const { openTab } = (0,useTabStore/* useTabStore */.W)();
    // Context menu setup
    const MENU_ID = `data-table-${dataCy}`;
    const { show } = (0,dist/* useContextMenu */.EF)({ id: MENU_ID });
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
    return ((0,jsx_runtime.jsxs)("div", { className: (0,clsx/* clsx */.$)('flex flex-col h-full', className), "data-cy": dataCy, children: [(searchable || columnVisibility || exportable) && ((0,jsx_runtime.jsxs)("div", { className: "mb-4 flex items-center gap-3", children: [searchable && ((0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(Input/* Input */.p, { value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: searchPlaceholder, startIcon: (0,jsx_runtime.jsx)(lucide_react/* Search */.vji, { className: "w-4 h-4" }), "data-cy": "table-search" }) })), columnVisibility && ((0,jsx_runtime.jsxs)("div", { className: "relative", ref: columnMenuRef, children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* Columns */.eaZ, { className: "w-4 h-4" }), onClick: () => setShowColumnMenu(!showColumnMenu), "data-cy": "column-visibility-btn", children: "Columns" }), showColumnMenu && ((0,jsx_runtime.jsx)("div", { className: "absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto", children: (0,jsx_runtime.jsxs)("div", { className: "p-2", children: [(0,jsx_runtime.jsx)("div", { className: "px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase", children: "Show/Hide Columns" }), (0,jsx_runtime.jsx)("div", { className: "space-y-1", children: columns.map(column => ((0,jsx_runtime.jsxs)("label", { className: "flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer", "data-cy": `column-toggle-${column.id}`, children: [(0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { checked: columnVisibilityState[column.id], onChange: () => toggleColumnVisibility(column.id) }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-gray-700 dark:text-gray-200", children: column.header })] }, column.id))) })] }) }))] })), exportable && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: () => exportToCSV(), "data-cy": "export-btn", children: "Export" }))] })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg", children: (0,jsx_runtime.jsxs)("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-700", children: [(0,jsx_runtime.jsx)("thead", { className: "bg-gray-50 dark:bg-gray-800 sticky top-0 z-10", children: (0,jsx_runtime.jsxs)("tr", { children: [selectable && ((0,jsx_runtime.jsx)("th", { className: "w-12 px-4 py-3", children: (0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { checked: allSelected, indeterminate: someSelected, onChange: handleSelectAll, "data-cy": "select-all-checkbox" }) })), visibleColumns.map((column) => ((0,jsx_runtime.jsx)("th", { className: (0,clsx/* clsx */.$)('px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider', column.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right'), style: { width: column.width }, onClick: () => column.sortable && handleSort(column.id), "data-cy": `column-header-${column.id}`, children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("span", { children: column.header }), column.sortable && ((0,jsx_runtime.jsx)("span", { className: "text-gray-400", children: sortColumn === column.id ? (sortDirection === 'asc' ? ((0,jsx_runtime.jsx)(lucide_react/* ChevronUp */.rXn, { className: "w-4 h-4" })) : ((0,jsx_runtime.jsx)(lucide_react/* ChevronDown */.yQN, { className: "w-4 h-4" }))) : ((0,jsx_runtime.jsx)(lucide_react/* ChevronsUpDown */.Mls, { className: "w-4 h-4" })) }))] }) }, column.id)))] }) }), (0,jsx_runtime.jsx)("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700", children: loading ? ((0,jsx_runtime.jsx)("tr", { children: (0,jsx_runtime.jsx)("td", { colSpan: visibleColumns.length + (selectable ? 1 : 0), className: "px-4 py-8 text-center", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-center gap-2 text-gray-500", children: [(0,jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" }), (0,jsx_runtime.jsx)("span", { children: "Loading..." })] }) }) })) : paginatedData.length === 0 ? ((0,jsx_runtime.jsx)("tr", { children: (0,jsx_runtime.jsx)("td", { colSpan: visibleColumns.length + (selectable ? 1 : 0), className: "px-4 py-8 text-center text-gray-500", children: emptyMessage }) })) : (paginatedData.map((row, rowIndex) => {
                                const rowId = getRowId(row, rowIndex);
                                const isSelected = selectedRows.has(rowId);
                                return ((0,jsx_runtime.jsxs)("tr", { className: (0,clsx/* clsx */.$)('transition-colors', onRowClick && 'cursor-pointer', isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'), onClick: () => onRowClick?.(row), onContextMenu: (e) => handleContextMenu(e, row), "data-cy": `table-row-${rowIndex}`, children: [selectable && ((0,jsx_runtime.jsx)("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: (0,jsx_runtime.jsx)(Checkbox/* Checkbox */.S, { checked: isSelected, onChange: () => handleRowSelect(rowId), "data-cy": `row-checkbox-${rowIndex}` }) })), visibleColumns.map((column) => {
                                            const value = getCellValue(row, column);
                                            const content = column.cell ? column.cell(value, row) : value;
                                            return ((0,jsx_runtime.jsx)("td", { className: (0,clsx/* clsx */.$)('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', column.align === 'center' && 'text-center', column.align === 'right' && 'text-right'), "data-cy": `cell-${column.id}-${rowIndex}`, children: content }, column.id));
                                        })] }, rowId));
                            })) })] }) }), pagination && totalPages > 1 && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mt-4 px-4", children: [(0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Showing ", (currentPage - 1) * pageSize + 1, " to", ' ', Math.min(currentPage * pageSize, sortedData.length), " of ", sortedData.length, " results"] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed", "data-cy": "prev-page-btn", children: (0,jsx_runtime.jsx)(lucide_react/* ChevronLeft */.JGc, { className: "w-5 h-5" }) }), (0,jsx_runtime.jsxs)("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: ["Page ", currentPage, " of ", totalPages] }), (0,jsx_runtime.jsx)("button", { onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed", "data-cy": "next-page-btn", children: (0,jsx_runtime.jsx)(lucide_react/* ChevronRight */.c_$, { className: "w-5 h-5" }) })] })] })), contextMenu && ((0,jsx_runtime.jsxs)(dist/* Menu */.W1, { id: MENU_ID, theme: "dark", children: [(onViewDetails || detailViewComponent) && ((0,jsx_runtime.jsx)(dist/* Item */.q7, { onClick: handleViewDetails, "data-cy": "context-menu-view-details", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Eye */.kU3, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "View Details" })] }) })), (0,jsx_runtime.jsx)(dist/* Item */.q7, { onClick: handleCopyRow, "data-cy": "context-menu-copy", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Copy */.QRo, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Copy Row" })] }) }), exportable && ((0,jsx_runtime.jsx)(dist/* Item */.q7, { onClick: handleExportSelected, "data-cy": "context-menu-export", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Export Selection" })] }) }))] }))] }));
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Info */ .R2D, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


/***/ }),

/***/ 63683:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

/***/ 83318:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  c: () => (/* binding */ useDiscovery)
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
    store = useNotificationStore/* useNotificationStore */.i;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsY0FBYyx5Q0FBeUMsMkJBQTJCO0FBQzFGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixlQUFlLEdBQUcsSUFBSTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFlO0FBQy9CO0FBQ0E7QUFDQSwwQ0FBMEMsTUFBTSxlQUFlLGFBQWEsY0FBYyxXQUFXO0FBQ3JHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxnQkFBZ0IsZUFBZTtBQUMvQjtBQUNBO0FBQ0EsNENBQTRDLE1BQU07QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxtQkFBUztBQUNiO0FBQ0E7QUFDQSxvQ0FBb0MsaURBQWlEO0FBQ3JGO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9EYXRhVGFibGUudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvRGF0YVRhYmxlLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0NoZWNrYm94LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zZXJ2aWNlcy9sb2dnaW5nU2VydmljZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zZXJ2aWNlcy9jYWNoZVNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc2VydmljZXMvbm90aWZpY2F0aW9uU2VydmljZS50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9zZXJ2aWNlcy9wcm9ncmVzc1NlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlRGlzY292ZXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIERhdGEgVGFibGUgQ29tcG9uZW50XG4gKiBTaW1wbGVyIGFsdGVybmF0aXZlIHRvIEFHIEdyaWQgd2l0aCBidWlsdC1pbiBzb3J0aW5nLCBmaWx0ZXJpbmcsIGFuZCBwYWdpbmF0aW9uXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlTWVtbywgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2hldnJvblVwLCBDaGV2cm9uRG93biwgQ2hldnJvbnNVcERvd24sIFNlYXJjaCwgQ2hldnJvbkxlZnQsIENoZXZyb25SaWdodCwgQ29sdW1ucywgRG93bmxvYWQsIENvcHksIEV5ZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgUGFwYSBmcm9tICdwYXBhcGFyc2UnO1xuaW1wb3J0IHsgTWVudSwgSXRlbSwgdXNlQ29udGV4dE1lbnUgfSBmcm9tICdyZWFjdC1jb250ZXhpZnknO1xuaW1wb3J0ICdyZWFjdC1jb250ZXhpZnkvZGlzdC9SZWFjdENvbnRleGlmeS5jc3MnO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBDaGVja2JveCB9IGZyb20gJy4uL2F0b21zL0NoZWNrYm94JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyB1c2VUYWJTdG9yZSB9IGZyb20gJy4uLy4uL3N0b3JlL3VzZVRhYlN0b3JlJztcbi8qKlxuICogRGF0YSBUYWJsZSBDb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gRGF0YVRhYmxlKHsgZGF0YSwgY29sdW1ucywgc2VsZWN0YWJsZSA9IGZhbHNlLCBvblNlbGVjdGlvbkNoYW5nZSwgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2VTaXplID0gMjUsIHNlYXJjaGFibGUgPSB0cnVlLCBzZWFyY2hQbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBsb2FkaW5nID0gZmFsc2UsIGVtcHR5TWVzc2FnZSA9ICdObyBkYXRhIGF2YWlsYWJsZScsIG9uUm93Q2xpY2ssIGdldFJvd0lkID0gKF8sIGluZGV4KSA9PiBpbmRleC50b1N0cmluZygpLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5ID0gJ2RhdGEtdGFibGUnLCBjb2x1bW5WaXNpYmlsaXR5ID0gdHJ1ZSwgZXhwb3J0YWJsZSA9IHRydWUsIGV4cG9ydEZpbGVuYW1lID0gJ2V4cG9ydCcsIGNvbnRleHRNZW51ID0gdHJ1ZSwgb25WaWV3RGV0YWlscywgZGV0YWlsVmlld0NvbXBvbmVudCwgZ2V0RGV0YWlsVmlld1RpdGxlLCB9KSB7XG4gICAgY29uc3QgW3NlYXJjaFRlcm0sIHNldFNlYXJjaFRlcm1dID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtzb3J0Q29sdW1uLCBzZXRTb3J0Q29sdW1uXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzb3J0RGlyZWN0aW9uLCBzZXRTb3J0RGlyZWN0aW9uXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtjdXJyZW50UGFnZSwgc2V0Q3VycmVudFBhZ2VdID0gdXNlU3RhdGUoMSk7XG4gICAgY29uc3QgW3NlbGVjdGVkUm93cywgc2V0U2VsZWN0ZWRSb3dzXSA9IHVzZVN0YXRlKG5ldyBTZXQoKSk7XG4gICAgY29uc3QgW2NvbHVtblZpc2liaWxpdHlTdGF0ZSwgc2V0Q29sdW1uVmlzaWJpbGl0eVN0YXRlXSA9IHVzZVN0YXRlKCgpID0+IGNvbHVtbnMucmVkdWNlKChhY2MsIGNvbCkgPT4gKHsgLi4uYWNjLCBbY29sLmlkXTogY29sLnZpc2libGUgIT09IGZhbHNlIH0pLCB7fSkpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uTWVudSwgc2V0U2hvd0NvbHVtbk1lbnVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGNvbHVtbk1lbnVSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgeyBvcGVuVGFiIH0gPSB1c2VUYWJTdG9yZSgpO1xuICAgIC8vIENvbnRleHQgbWVudSBzZXR1cFxuICAgIGNvbnN0IE1FTlVfSUQgPSBgZGF0YS10YWJsZS0ke2RhdGFDeX1gO1xuICAgIGNvbnN0IHsgc2hvdyB9ID0gdXNlQ29udGV4dE1lbnUoeyBpZDogTUVOVV9JRCB9KTtcbiAgICAvLyBHZXQgY2VsbCB2YWx1ZVxuICAgIGNvbnN0IGdldENlbGxWYWx1ZSA9IChyb3csIGNvbHVtbikgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGNvbHVtbi5hY2Nlc3NvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbi5hY2Nlc3Nvcihyb3cpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb3dbY29sdW1uLmFjY2Vzc29yXTtcbiAgICB9O1xuICAgIC8vIEZpbHRlciBkYXRhIGJhc2VkIG9uIHNlYXJjaCB0ZXJtXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc2VhcmNoVGVybSlcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoKHJvdykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbnMuc29tZSgoY29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb2x1bW4uZmlsdGVyYWJsZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0Q2VsbFZhbHVlKHJvdywgY29sdW1uKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRlcm0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2RhdGEsIHNlYXJjaFRlcm0sIGNvbHVtbnNdKTtcbiAgICAvLyBTb3J0IGRhdGFcbiAgICBjb25zdCBzb3J0ZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc29ydENvbHVtbiB8fCAhc29ydERpcmVjdGlvbilcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZERhdGE7XG4gICAgICAgIGNvbnN0IGNvbHVtbiA9IGNvbHVtbnMuZmluZCgoY29sKSA9PiBjb2wuaWQgPT09IHNvcnRDb2x1bW4pO1xuICAgICAgICBpZiAoIWNvbHVtbilcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZERhdGE7XG4gICAgICAgIHJldHVybiBbLi4uZmlsdGVyZWREYXRhXS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhVmFsdWUgPSBnZXRDZWxsVmFsdWUoYSwgY29sdW1uKTtcbiAgICAgICAgICAgIGNvbnN0IGJWYWx1ZSA9IGdldENlbGxWYWx1ZShiLCBjb2x1bW4pO1xuICAgICAgICAgICAgaWYgKGFWYWx1ZSA9PT0gYlZhbHVlKVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgY29uc3QgY29tcGFyaXNvbiA9IGFWYWx1ZSA8IGJWYWx1ZSA/IC0xIDogMTtcbiAgICAgICAgICAgIHJldHVybiBzb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/IGNvbXBhcmlzb24gOiAtY29tcGFyaXNvbjtcbiAgICAgICAgfSk7XG4gICAgfSwgW2ZpbHRlcmVkRGF0YSwgc29ydENvbHVtbiwgc29ydERpcmVjdGlvbiwgY29sdW1uc10pO1xuICAgIC8vIFBhZ2luYXRlIGRhdGFcbiAgICBjb25zdCBwYWdpbmF0ZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcGFnaW5hdGlvbilcbiAgICAgICAgICAgIHJldHVybiBzb3J0ZWREYXRhO1xuICAgICAgICBjb25zdCBzdGFydCA9IChjdXJyZW50UGFnZSAtIDEpICogcGFnZVNpemU7XG4gICAgICAgIGNvbnN0IGVuZCA9IHN0YXJ0ICsgcGFnZVNpemU7XG4gICAgICAgIHJldHVybiBzb3J0ZWREYXRhLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgIH0sIFtzb3J0ZWREYXRhLCBjdXJyZW50UGFnZSwgcGFnZVNpemUsIHBhZ2luYXRpb25dKTtcbiAgICBjb25zdCB0b3RhbFBhZ2VzID0gTWF0aC5jZWlsKHNvcnRlZERhdGEubGVuZ3RoIC8gcGFnZVNpemUpO1xuICAgIC8vIEhhbmRsZSBzb3J0XG4gICAgY29uc3QgaGFuZGxlU29ydCA9IChjb2x1bW5JZCkgPT4ge1xuICAgICAgICBjb25zdCBjb2x1bW4gPSBjb2x1bW5zLmZpbmQoKGNvbCkgPT4gY29sLmlkID09PSBjb2x1bW5JZCk7XG4gICAgICAgIGlmICghY29sdW1uPy5zb3J0YWJsZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHNvcnRDb2x1bW4gPT09IGNvbHVtbklkKSB7XG4gICAgICAgICAgICAvLyBDeWNsZSB0aHJvdWdoOiBhc2MgLT4gZGVzYyAtPiBudWxsXG4gICAgICAgICAgICBpZiAoc29ydERpcmVjdGlvbiA9PT0gJ2FzYycpIHtcbiAgICAgICAgICAgICAgICBzZXRTb3J0RGlyZWN0aW9uKCdkZXNjJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzb3J0RGlyZWN0aW9uID09PSAnZGVzYycpIHtcbiAgICAgICAgICAgICAgICBzZXRTb3J0Q29sdW1uKG51bGwpO1xuICAgICAgICAgICAgICAgIHNldFNvcnREaXJlY3Rpb24obnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXRTb3J0Q29sdW1uKGNvbHVtbklkKTtcbiAgICAgICAgICAgIHNldFNvcnREaXJlY3Rpb24oJ2FzYycpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgcm93IHNlbGVjdGlvblxuICAgIGNvbnN0IGhhbmRsZVJvd1NlbGVjdCA9IChyb3dJZCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTZWxlY3RlZCA9IG5ldyBTZXQoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgaWYgKG5ld1NlbGVjdGVkLmhhcyhyb3dJZCkpIHtcbiAgICAgICAgICAgIG5ld1NlbGVjdGVkLmRlbGV0ZShyb3dJZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXdTZWxlY3RlZC5hZGQocm93SWQpO1xuICAgICAgICB9XG4gICAgICAgIHNldFNlbGVjdGVkUm93cyhuZXdTZWxlY3RlZCk7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBkYXRhLmZpbHRlcigocm93LCBpbmRleCkgPT4gbmV3U2VsZWN0ZWQuaGFzKGdldFJvd0lkKHJvdywgaW5kZXgpKSk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEhhbmRsZSBzZWxlY3QgYWxsXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0QWxsID0gKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRSb3dzLnNpemUgPT09IHBhZ2luYXRlZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZFJvd3MobmV3IFNldCgpKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPy4oW10pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYWxsSWRzID0gbmV3IFNldChwYWdpbmF0ZWREYXRhLm1hcCgocm93LCBpbmRleCkgPT4gZ2V0Um93SWQocm93LCBpbmRleCkpKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkUm93cyhhbGxJZHMpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U/LihwYWdpbmF0ZWREYXRhKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgYWxsU2VsZWN0ZWQgPSBzZWxlY3RlZFJvd3Muc2l6ZSA9PT0gcGFnaW5hdGVkRGF0YS5sZW5ndGggJiYgcGFnaW5hdGVkRGF0YS5sZW5ndGggPiAwO1xuICAgIGNvbnN0IHNvbWVTZWxlY3RlZCA9IHNlbGVjdGVkUm93cy5zaXplID4gMCAmJiBzZWxlY3RlZFJvd3Muc2l6ZSA8IHBhZ2luYXRlZERhdGEubGVuZ3RoO1xuICAgIC8vIEdldCB2aXNpYmxlIGNvbHVtbnNcbiAgICBjb25zdCB2aXNpYmxlQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICByZXR1cm4gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbHVtblZpc2liaWxpdHlTdGF0ZVtjb2wuaWRdKTtcbiAgICB9LCBbY29sdW1ucywgY29sdW1uVmlzaWJpbGl0eVN0YXRlXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uVmlzaWJpbGl0eSA9IChjb2x1bW5JZCkgPT4ge1xuICAgICAgICBzZXRDb2x1bW5WaXNpYmlsaXR5U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIFtjb2x1bW5JZF06ICFwcmV2W2NvbHVtbklkXVxuICAgICAgICB9KSk7XG4gICAgfTtcbiAgICAvLyBIYW5kbGUgY29udGV4dCBtZW51XG4gICAgY29uc3QgaGFuZGxlQ29udGV4dE1lbnUgPSAoZXZlbnQsIHJvdykgPT4ge1xuICAgICAgICBpZiAoIWNvbnRleHRNZW51KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzaG93KHsgZXZlbnQsIHByb3BzOiB7IHJvdyB9IH0pO1xuICAgIH07XG4gICAgLy8gSGFuZGxlIHZpZXcgZGV0YWlsc1xuICAgIGNvbnN0IGhhbmRsZVZpZXdEZXRhaWxzID0gKHsgcHJvcHMgfSkgPT4ge1xuICAgICAgICBjb25zdCByb3cgPSBwcm9wcy5yb3c7XG4gICAgICAgIGlmIChvblZpZXdEZXRhaWxzKSB7XG4gICAgICAgICAgICBvblZpZXdEZXRhaWxzKHJvdyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGV0YWlsVmlld0NvbXBvbmVudCAmJiBnZXREZXRhaWxWaWV3VGl0bGUpIHtcbiAgICAgICAgICAgIG9wZW5UYWIoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBnZXREZXRhaWxWaWV3VGl0bGUocm93KSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGRldGFpbFZpZXdDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgaWNvbjogJ0V5ZScsXG4gICAgICAgICAgICAgICAgY2xvc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZGF0YTogcm93XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIGNvcHkgcm93XG4gICAgY29uc3QgaGFuZGxlQ29weVJvdyA9ICh7IHByb3BzIH0pID0+IHtcbiAgICAgICAgY29uc3Qgcm93ID0gcHJvcHMucm93O1xuICAgICAgICBjb25zdCByb3dUZXh0ID0gdmlzaWJsZUNvbHVtbnNcbiAgICAgICAgICAgIC5tYXAoY29sID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0Q2VsbFZhbHVlKHJvdywgY29sKTtcbiAgICAgICAgICAgIHJldHVybiBgJHtjb2wuaGVhZGVyfTogJHt2YWx1ZX1gO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChyb3dUZXh0KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIENvdWxkIHNob3cgYSB0b2FzdCBub3RpZmljYXRpb24gaGVyZVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JvdyBjb3BpZWQgdG8gY2xpcGJvYXJkJyk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLy8gSGFuZGxlIGV4cG9ydCBzZWxlY3RlZFxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydFNlbGVjdGVkID0gKHsgcHJvcHMgfSkgPT4ge1xuICAgICAgICBjb25zdCByb3cgPSBwcm9wcy5yb3c7XG4gICAgICAgIGNvbnN0IHJvd3NUb0V4cG9ydCA9IHNlbGVjdGVkUm93cy5zaXplID4gMFxuICAgICAgICAgICAgPyBkYXRhLmZpbHRlcigoXywgaW5kZXgpID0+IHNlbGVjdGVkUm93cy5oYXMoZ2V0Um93SWQoXywgaW5kZXgpKSlcbiAgICAgICAgICAgIDogW3Jvd107XG4gICAgICAgIGV4cG9ydFRvQ1NWKHJvd3NUb0V4cG9ydCk7XG4gICAgfTtcbiAgICAvLyBFeHBvcnQgZGF0YSB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NTViA9IChkYXRhVG9FeHBvcnQgPSBzb3J0ZWREYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IGNzdkRhdGEgPSBkYXRhVG9FeHBvcnQubWFwKHJvdyA9PiB7XG4gICAgICAgICAgICBjb25zdCBjc3ZSb3cgPSB7fTtcbiAgICAgICAgICAgIHZpc2libGVDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENlbGxWYWx1ZShyb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgY3N2Um93W2NvbC5oZWFkZXJdID0gdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBjc3ZSb3c7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjc3YgPSBQYXBhLnVucGFyc2UoY3N2RGF0YSk7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xuICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGAke2V4cG9ydEZpbGVuYW1lfV8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5jc3ZgKTtcbiAgICAgICAgbGluay5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKTtcbiAgICB9O1xuICAgIC8vIENsb3NlIGNvbHVtbiBtZW51IHdoZW4gY2xpY2tpbmcgb3V0c2lkZVxuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZUNsaWNrT3V0c2lkZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbHVtbk1lbnVSZWYuY3VycmVudCAmJiAhY29sdW1uTWVudVJlZi5jdXJyZW50LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBzZXRTaG93Q29sdW1uTWVudShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzaG93Q29sdW1uTWVudSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgaGFuZGxlQ2xpY2tPdXRzaWRlKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBoYW5kbGVDbGlja091dHNpZGUpO1xuICAgICAgICB9XG4gICAgfSwgW3Nob3dDb2x1bW5NZW51XSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnZmxleCBmbGV4LWNvbCBoLWZ1bGwnLCBjbGFzc05hbWUpLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogWyhzZWFyY2hhYmxlIHx8IGNvbHVtblZpc2liaWxpdHkgfHwgZXhwb3J0YWJsZSkgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtzZWFyY2hhYmxlICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChJbnB1dCwgeyB2YWx1ZTogc2VhcmNoVGVybSwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hUZXJtKGUudGFyZ2V0LnZhbHVlKSwgcGxhY2Vob2xkZXI6IHNlYXJjaFBsYWNlaG9sZGVyLCBzdGFydEljb246IF9qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIFwiZGF0YS1jeVwiOiBcInRhYmxlLXNlYXJjaFwiIH0pIH0pKSwgY29sdW1uVmlzaWJpbGl0eSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgcmVmOiBjb2x1bW5NZW51UmVmLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwibWRcIiwgaWNvbjogX2pzeChDb2x1bW5zLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IHNldFNob3dDb2x1bW5NZW51KCFzaG93Q29sdW1uTWVudSksIFwiZGF0YS1jeVwiOiBcImNvbHVtbi12aXNpYmlsaXR5LWJ0blwiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIHNob3dDb2x1bW5NZW51ICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHJpZ2h0LTAgdG9wLWZ1bGwgbXQtMiB3LTY0IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCByb3VuZGVkLWxnIHNoYWRvdy1sZyB6LTUwIG1heC1oLTk2IG92ZXJmbG93LXktYXV0b1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJweC0zIHB5LTIgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIHVwcGVyY2FzZVwiLCBjaGlsZHJlbjogXCJTaG93L0hpZGUgQ29sdW1uc1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMVwiLCBjaGlsZHJlbjogY29sdW1ucy5tYXAoY29sdW1uID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTMgcHktMiBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwIHJvdW5kZWQgY3Vyc29yLXBvaW50ZXJcIiwgXCJkYXRhLWN5XCI6IGBjb2x1bW4tdG9nZ2xlLSR7Y29sdW1uLmlkfWAsIGNoaWxkcmVuOiBbX2pzeChDaGVja2JveCwgeyBjaGVja2VkOiBjb2x1bW5WaXNpYmlsaXR5U3RhdGVbY29sdW1uLmlkXSwgb25DaGFuZ2U6ICgpID0+IHRvZ2dsZUNvbHVtblZpc2liaWxpdHkoY29sdW1uLmlkKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMFwiLCBjaGlsZHJlbjogY29sdW1uLmhlYWRlciB9KV0gfSwgY29sdW1uLmlkKSkpIH0pXSB9KSB9KSldIH0pKSwgZXhwb3J0YWJsZSAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJtZFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IGV4cG9ydFRvQ1NWKCksIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSkpXSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBfanN4cyhcInRhYmxlXCIsIHsgY2xhc3NOYW1lOiBcIm1pbi13LWZ1bGwgZGl2aWRlLXkgZGl2aWRlLWdyYXktMjAwIGRhcms6ZGl2aWRlLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInRoZWFkXCIsIHsgY2xhc3NOYW1lOiBcImJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTgwMCBzdGlja3kgdG9wLTAgei0xMFwiLCBjaGlsZHJlbjogX2pzeHMoXCJ0clwiLCB7IGNoaWxkcmVuOiBbc2VsZWN0YWJsZSAmJiAoX2pzeChcInRoXCIsIHsgY2xhc3NOYW1lOiBcInctMTIgcHgtNCBweS0zXCIsIGNoaWxkcmVuOiBfanN4KENoZWNrYm94LCB7IGNoZWNrZWQ6IGFsbFNlbGVjdGVkLCBpbmRldGVybWluYXRlOiBzb21lU2VsZWN0ZWQsIG9uQ2hhbmdlOiBoYW5kbGVTZWxlY3RBbGwsIFwiZGF0YS1jeVwiOiBcInNlbGVjdC1hbGwtY2hlY2tib3hcIiB9KSB9KSksIHZpc2libGVDb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoX2pzeChcInRoXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdweC00IHB5LTMgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXInLCBjb2x1bW4uc29ydGFibGUgJiYgJ2N1cnNvci1wb2ludGVyIHNlbGVjdC1ub25lIGhvdmVyOmJnLWdyYXktMTAwIGRhcms6aG92ZXI6YmctZ3JheS03MDAnLCBjb2x1bW4uYWxpZ24gPT09ICdjZW50ZXInICYmICd0ZXh0LWNlbnRlcicsIGNvbHVtbi5hbGlnbiA9PT0gJ3JpZ2h0JyAmJiAndGV4dC1yaWdodCcpLCBzdHlsZTogeyB3aWR0aDogY29sdW1uLndpZHRoIH0sIG9uQ2xpY2s6ICgpID0+IGNvbHVtbi5zb3J0YWJsZSAmJiBoYW5kbGVTb3J0KGNvbHVtbi5pZCksIFwiZGF0YS1jeVwiOiBgY29sdW1uLWhlYWRlci0ke2NvbHVtbi5pZH1gLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjb2x1bW4uaGVhZGVyIH0pLCBjb2x1bW4uc29ydGFibGUgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHNvcnRDb2x1bW4gPT09IGNvbHVtbi5pZCA/IChzb3J0RGlyZWN0aW9uID09PSAnYXNjJyA/IChfanN4KENoZXZyb25VcCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pKSA6IChfanN4KENoZXZyb25Eb3duLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkpKSA6IChfanN4KENoZXZyb25zVXBEb3duLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSkpIH0pKV0gfSkgfSwgY29sdW1uLmlkKSkpXSB9KSB9KSwgX2pzeChcInRib2R5XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgZGl2aWRlLXkgZGl2aWRlLWdyYXktMjAwIGRhcms6ZGl2aWRlLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goXCJ0clwiLCB7IGNoaWxkcmVuOiBfanN4KFwidGRcIiwgeyBjb2xTcGFuOiB2aXNpYmxlQ29sdW1ucy5sZW5ndGggKyAoc2VsZWN0YWJsZSA/IDEgOiAwKSwgY2xhc3NOYW1lOiBcInB4LTQgcHktOCB0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgdGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYW5pbWF0ZS1zcGluIHJvdW5kZWQtZnVsbCBoLTUgdy01IGJvcmRlci1iLTIgYm9yZGVyLWJsdWUtNjAwXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTG9hZGluZy4uLlwiIH0pXSB9KSB9KSB9KSkgOiBwYWdpbmF0ZWREYXRhLmxlbmd0aCA9PT0gMCA/IChfanN4KFwidHJcIiwgeyBjaGlsZHJlbjogX2pzeChcInRkXCIsIHsgY29sU3BhbjogdmlzaWJsZUNvbHVtbnMubGVuZ3RoICsgKHNlbGVjdGFibGUgPyAxIDogMCksIGNsYXNzTmFtZTogXCJweC00IHB5LTggdGV4dC1jZW50ZXIgdGV4dC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogZW1wdHlNZXNzYWdlIH0pIH0pKSA6IChwYWdpbmF0ZWREYXRhLm1hcCgocm93LCByb3dJbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dJZCA9IGdldFJvd0lkKHJvdywgcm93SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gc2VsZWN0ZWRSb3dzLmhhcyhyb3dJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJ0clwiLCB7IGNsYXNzTmFtZTogY2xzeCgndHJhbnNpdGlvbi1jb2xvcnMnLCBvblJvd0NsaWNrICYmICdjdXJzb3ItcG9pbnRlcicsIGlzU2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnaG92ZXI6YmctZ3JheS01MCBkYXJrOmhvdmVyOmJnLWdyYXktODAwJyksIG9uQ2xpY2s6ICgpID0+IG9uUm93Q2xpY2s/Lihyb3cpLCBvbkNvbnRleHRNZW51OiAoZSkgPT4gaGFuZGxlQ29udGV4dE1lbnUoZSwgcm93KSwgXCJkYXRhLWN5XCI6IGB0YWJsZS1yb3ctJHtyb3dJbmRleH1gLCBjaGlsZHJlbjogW3NlbGVjdGFibGUgJiYgKF9qc3goXCJ0ZFwiLCB7IGNsYXNzTmFtZTogXCJweC00IHB5LTNcIiwgb25DbGljazogKGUpID0+IGUuc3RvcFByb3BhZ2F0aW9uKCksIGNoaWxkcmVuOiBfanN4KENoZWNrYm94LCB7IGNoZWNrZWQ6IGlzU2VsZWN0ZWQsIG9uQ2hhbmdlOiAoKSA9PiBoYW5kbGVSb3dTZWxlY3Qocm93SWQpLCBcImRhdGEtY3lcIjogYHJvdy1jaGVja2JveC0ke3Jvd0luZGV4fWAgfSkgfSkpLCB2aXNpYmxlQ29sdW1ucy5tYXAoKGNvbHVtbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENlbGxWYWx1ZShyb3csIGNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBjb2x1bW4uY2VsbCA/IGNvbHVtbi5jZWxsKHZhbHVlLCByb3cpIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChcInRkXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdweC00IHB5LTMgdGV4dC1zbSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIGNvbHVtbi5hbGlnbiA9PT0gJ2NlbnRlcicgJiYgJ3RleHQtY2VudGVyJywgY29sdW1uLmFsaWduID09PSAncmlnaHQnICYmICd0ZXh0LXJpZ2h0JyksIFwiZGF0YS1jeVwiOiBgY2VsbC0ke2NvbHVtbi5pZH0tJHtyb3dJbmRleH1gLCBjaGlsZHJlbjogY29udGVudCB9LCBjb2x1bW4uaWQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KV0gfSwgcm93SWQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSkgfSldIH0pIH0pLCBwYWdpbmF0aW9uICYmIHRvdGFsUGFnZXMgPiAxICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbXQtNCBweC00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1wiU2hvd2luZyBcIiwgKGN1cnJlbnRQYWdlIC0gMSkgKiBwYWdlU2l6ZSArIDEsIFwiIHRvXCIsICcgJywgTWF0aC5taW4oY3VycmVudFBhZ2UgKiBwYWdlU2l6ZSwgc29ydGVkRGF0YS5sZW5ndGgpLCBcIiBvZiBcIiwgc29ydGVkRGF0YS5sZW5ndGgsIFwiIHJlc3VsdHNcIl0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IHNldEN1cnJlbnRQYWdlKE1hdGgubWF4KDEsIGN1cnJlbnRQYWdlIC0gMSkpLCBkaXNhYmxlZDogY3VycmVudFBhZ2UgPT09IDEsIGNsYXNzTmFtZTogXCJwLTIgcm91bmRlZC1sZyBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktODAwIGRpc2FibGVkOm9wYWNpdHktNTAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkXCIsIFwiZGF0YS1jeVwiOiBcInByZXYtcGFnZS1idG5cIiwgY2hpbGRyZW46IF9qc3goQ2hldnJvbkxlZnQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IFtcIlBhZ2UgXCIsIGN1cnJlbnRQYWdlLCBcIiBvZiBcIiwgdG90YWxQYWdlc10gfSksIF9qc3goXCJidXR0b25cIiwgeyBvbkNsaWNrOiAoKSA9PiBzZXRDdXJyZW50UGFnZShNYXRoLm1pbih0b3RhbFBhZ2VzLCBjdXJyZW50UGFnZSArIDEpKSwgZGlzYWJsZWQ6IGN1cnJlbnRQYWdlID09PSB0b3RhbFBhZ2VzLCBjbGFzc05hbWU6IFwicC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTgwMCBkaXNhYmxlZDpvcGFjaXR5LTUwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZFwiLCBcImRhdGEtY3lcIjogXCJuZXh0LXBhZ2UtYnRuXCIsIGNoaWxkcmVuOiBfanN4KENoZXZyb25SaWdodCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pIH0pXSB9KV0gfSkpLCBjb250ZXh0TWVudSAmJiAoX2pzeHMoTWVudSwgeyBpZDogTUVOVV9JRCwgdGhlbWU6IFwiZGFya1wiLCBjaGlsZHJlbjogWyhvblZpZXdEZXRhaWxzIHx8IGRldGFpbFZpZXdDb21wb25lbnQpICYmIChfanN4KEl0ZW0sIHsgb25DbGljazogaGFuZGxlVmlld0RldGFpbHMsIFwiZGF0YS1jeVwiOiBcImNvbnRleHQtbWVudS12aWV3LWRldGFpbHNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChFeWUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJWaWV3IERldGFpbHNcIiB9KV0gfSkgfSkpLCBfanN4KEl0ZW0sIHsgb25DbGljazogaGFuZGxlQ29weVJvdywgXCJkYXRhLWN5XCI6IFwiY29udGV4dC1tZW51LWNvcHlcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDb3B5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiQ29weSBSb3dcIiB9KV0gfSkgfSksIGV4cG9ydGFibGUgJiYgKF9qc3goSXRlbSwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRTZWxlY3RlZCwgXCJkYXRhLWN5XCI6IFwiY29udGV4dC1tZW51LWV4cG9ydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiRXhwb3J0IFNlbGVjdGlvblwiIH0pXSB9KSB9KSldIH0pKV0gfSkpO1xufVxuZXhwb3J0IGRlZmF1bHQgRGF0YVRhYmxlO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2ltcGxlIERhdGFUYWJsZSBXcmFwcGVyXG4gKiBBdXRvLWdlbmVyYXRlcyBjb2x1bW5zIGZyb20gZGF0YSBmb3IgdXNlIGluIGF1dG8tZ2VuZXJhdGVkIGRpc2NvdmVyeSB2aWV3c1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBEYXRhVGFibGVPcmdhbmlzbSBmcm9tICcuL29yZ2FuaXNtcy9EYXRhVGFibGUnO1xuLyoqXG4gKiBTaW1wbGUgd3JhcHBlciBhcm91bmQgRGF0YVRhYmxlIHRoYXQgYXV0by1nZW5lcmF0ZXMgY29sdW1ucyBmcm9tIHJvdyBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEYXRhVGFibGUoeyByb3dzLCBsb2FkaW5nID0gZmFsc2UsIGVtcHR5TWVzc2FnZSA9ICdObyBkYXRhIGF2YWlsYWJsZScgfSkge1xuICAgIC8vIEF1dG8tZ2VuZXJhdGUgY29sdW1ucyBmcm9tIGZpcnN0IHJvd1xuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyb3dzIHx8IHJvd3MubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBjb25zdCBmaXJzdFJvdyA9IHJvd3NbMF07XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhmaXJzdFJvdykubWFwKChrZXkpID0+ICh7XG4gICAgICAgICAgICBpZDoga2V5LFxuICAgICAgICAgICAgaGVhZGVyOiBrZXlcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvKFtBLVpdKS9nLCAnICQxJykgLy8gQWRkIHNwYWNlIGJlZm9yZSBjYXBpdGFsc1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLi8sIChzdHIpID0+IHN0ci50b1VwcGVyQ2FzZSgpKSAvLyBDYXBpdGFsaXplIGZpcnN0IGxldHRlclxuICAgICAgICAgICAgICAgIC50cmltKCksXG4gICAgICAgICAgICBhY2Nlc3Nvcjoga2V5LFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgfSkpO1xuICAgIH0sIFtyb3dzXSk7XG4gICAgaWYgKCFyb3dzIHx8IHJvd3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLTY0IHRleHQtZ3JheS01MDBcIiwgY2hpbGRyZW46IGVtcHR5TWVzc2FnZSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeChEYXRhVGFibGVPcmdhbmlzbSwgeyBkYXRhOiByb3dzLCBjb2x1bW5zOiBjb2x1bW5zLCBwYWdpbmF0aW9uOiB0cnVlLCBwYWdlU2l6ZTogNTAsIHNlYXJjaGFibGU6IHRydWUsIHNlYXJjaFBsYWNlaG9sZGVyOiBcIlNlYXJjaCBkYXRhLi4uXCIsIGxvYWRpbmc6IGxvYWRpbmcsIGVtcHR5TWVzc2FnZTogZW1wdHlNZXNzYWdlLCBleHBvcnRhYmxlOiB0cnVlLCBleHBvcnRGaWxlbmFtZTogXCJkaXNjb3ZlcnktZGF0YVwiLCBjb2x1bW5WaXNpYmlsaXR5OiB0cnVlIH0pKTtcbn1cbmV4cG9ydCBkZWZhdWx0IERhdGFUYWJsZTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ2hlY2tib3ggQ29tcG9uZW50XG4gKlxuICogRnVsbHkgYWNjZXNzaWJsZSBjaGVja2JveCBjb21wb25lbnQgd2l0aCBsYWJlbHMgYW5kIGVycm9yIHN0YXRlcy5cbiAqIEZvbGxvd3MgV0NBRyAyLjEgQUEgZ3VpZGVsaW5lcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZUlkIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQ2hlY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBDaGVja2JveCBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IENoZWNrYm94ID0gKHsgbGFiZWwsIGRlc2NyaXB0aW9uLCBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBlcnJvciwgZGlzYWJsZWQgPSBmYWxzZSwgaW5kZXRlcm1pbmF0ZSA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgaWQgPSB1c2VJZCgpO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpZH0tZXJyb3JgO1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uSWQgPSBgJHtpZH0tZGVzY3JpcHRpb25gO1xuICAgIGNvbnN0IGhhc0Vycm9yID0gQm9vbGVhbihlcnJvcik7XG4gICAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gSGFuZGxlIGluZGV0ZXJtaW5hdGUgdmlhIHJlZlxuICAgIGNvbnN0IGNoZWNrYm94UmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xuICAgIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjaGVja2JveFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjaGVja2JveFJlZi5jdXJyZW50LmluZGV0ZXJtaW5hdGUgPSBpbmRldGVybWluYXRlO1xuICAgICAgICB9XG4gICAgfSwgW2luZGV0ZXJtaW5hdGVdKTtcbiAgICBjb25zdCBjaGVja2JveENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2gtNSB3LTUgcm91bmRlZCBib3JkZXItMicsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rhcms6cmluZy1vZmZzZXQtZ3JheS05MDAnLCBcbiAgICAvLyBTdGF0ZS1iYXNlZCBzdHlsZXNcbiAgICB7XG4gICAgICAgIC8vIE5vcm1hbCBzdGF0ZSAodW5jaGVja2VkKVxuICAgICAgICAnYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNTAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkICYmICFjaGVja2VkLFxuICAgICAgICAnZm9jdXM6cmluZy1ibHVlLTUwMCc6ICFoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIENoZWNrZWQgc3RhdGVcbiAgICAgICAgJ2JnLWJsdWUtNjAwIGJvcmRlci1ibHVlLTYwMCBkYXJrOmJnLWJsdWUtNTAwIGRhcms6Ym9yZGVyLWJsdWUtNTAwJzogY2hlY2tlZCAmJiAhZGlzYWJsZWQgJiYgIWhhc0Vycm9yLFxuICAgICAgICAvLyBFcnJvciBzdGF0ZVxuICAgICAgICAnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtNjAwIGRhcms6Ym9yZGVyLXJlZC00MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgICdmb2N1czpyaW5nLXJlZC01MDAnOiBoYXNFcnJvciAmJiAhZGlzYWJsZWQsXG4gICAgICAgIC8vIERpc2FibGVkIHN0YXRlXG4gICAgICAgICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS02MDAgYmctZ3JheS0xMDAgZGFyazpiZy1ncmF5LTgwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCd0ZXh0LXNtIGZvbnQtbWVkaXVtJywge1xuICAgICAgICAndGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAnOiAhaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1yZWQtNzAwIGRhcms6dGV4dC1yZWQtNDAwJzogaGFzRXJyb3IgJiYgIWRpc2FibGVkLFxuICAgICAgICAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS01MDAnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGZsZXgtY29sJywgY2xhc3NOYW1lKSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgaC01XCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgcmVmOiBjaGVja2JveFJlZiwgaWQ6IGlkLCB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGNoZWNrZWQsIG9uQ2hhbmdlOiBoYW5kbGVDaGFuZ2UsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBcInNyLW9ubHkgcGVlclwiLCBcImFyaWEtaW52YWxpZFwiOiBoYXNFcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Vycm9ySWRdOiBoYXNFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbklkXTogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBcImRhdGEtY3lcIjogZGF0YUN5IH0pLCBfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaWQsIGNsYXNzTmFtZTogY2xzeChjaGVja2JveENsYXNzZXMsICdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItcG9pbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIGNoaWxkcmVuOiBbY2hlY2tlZCAmJiAhaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChDaGVjaywgeyBjbGFzc05hbWU6IFwiaC00IHctNCB0ZXh0LXdoaXRlXCIsIHN0cm9rZVdpZHRoOiAzIH0pKSwgaW5kZXRlcm1pbmF0ZSAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTAuNSB3LTMgYmctd2hpdGUgcm91bmRlZFwiIH0pKV0gfSldIH0pLCAobGFiZWwgfHwgZGVzY3JpcHRpb24pICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtbC0zXCIsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3goXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlkLCBjbGFzc05hbWU6IGNsc3gobGFiZWxDbGFzc2VzLCAnY3Vyc29yLXBvaW50ZXInKSwgY2hpbGRyZW46IGxhYmVsIH0pKSwgZGVzY3JpcHRpb24gJiYgKF9qc3goXCJwXCIsIHsgaWQ6IGRlc2NyaXB0aW9uSWQsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTAuNVwiLCBjaGlsZHJlbjogZGVzY3JpcHRpb24gfSkpXSB9KSldIH0pLCBoYXNFcnJvciAmJiAoX2pzeChcInBcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBcIm10LTEgbWwtOCB0ZXh0LXNtIHRleHQtcmVkLTYwMFwiLCByb2xlOiBcImFsZXJ0XCIsIFwiYXJpYS1saXZlXCI6IFwicG9saXRlXCIsIGNoaWxkcmVuOiBlcnJvciB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDaGVja2JveDtcbiIsIi8qKlxuICogRW5oYW5jZWQgTG9nZ2luZyBTZXJ2aWNlXG4gKlxuICogRmVhdHVyZXM6XG4gKiAtIFN0cnVjdHVyZWQgbG9nZ2luZyB3aXRoIGNvbnRleHQgYW5kIGNvcnJlbGF0aW9uIElEc1xuICogLSBNdWx0aXBsZSBsb2cgbGV2ZWxzIHdpdGggZmlsdGVyaW5nIChUUkFDRSwgREVCVUcsIElORk8sIFdBUk4sIEVSUk9SLCBGQVRBTClcbiAqIC0gTXVsdGlwbGUgbG9nIHRyYW5zcG9ydHMgKGNvbnNvbGUsIGZpbGUgdmlhIElQQywgcmVtb3RlKVxuICogLSBMb2cgcm90YXRpb24gKGRhaWx5LCBzaXplLWJhc2VkKVxuICogLSBMb2cgc2VhcmNoIGFuZCBmaWx0ZXJpbmdcbiAqIC0gUGVyZm9ybWFuY2UgbG9nZ2luZyB3aXRoIG1ldGhvZCB0aW1pbmdcbiAqIC0gRXJyb3Igc3RhY2sgdHJhY2UgY2FwdHVyZVxuICogLSBMb2cgY29ycmVsYXRpb24gSURzIGZvciByZXF1ZXN0IHRyYWNraW5nXG4gKi9cbmltcG9ydCAqIGFzIGNyeXB0byBmcm9tICdjcnlwdG8nO1xuLyoqXG4gKiBMb2cgbGV2ZWxzIHdpdGggbnVtZXJpYyBwcmlvcml0aWVzXG4gKi9cbmV4cG9ydCB2YXIgTG9nTGV2ZWw7XG4oZnVuY3Rpb24gKExvZ0xldmVsKSB7XG4gICAgTG9nTGV2ZWxbTG9nTGV2ZWxbXCJUUkFDRVwiXSA9IDBdID0gXCJUUkFDRVwiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiREVCVUdcIl0gPSAxXSA9IFwiREVCVUdcIjtcbiAgICBMb2dMZXZlbFtMb2dMZXZlbFtcIklORk9cIl0gPSAyXSA9IFwiSU5GT1wiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiV0FSTlwiXSA9IDNdID0gXCJXQVJOXCI7XG4gICAgTG9nTGV2ZWxbTG9nTGV2ZWxbXCJFUlJPUlwiXSA9IDRdID0gXCJFUlJPUlwiO1xuICAgIExvZ0xldmVsW0xvZ0xldmVsW1wiRkFUQUxcIl0gPSA1XSA9IFwiRkFUQUxcIjtcbn0pKExvZ0xldmVsIHx8IChMb2dMZXZlbCA9IHt9KSk7XG4vKipcbiAqIEVuaGFuY2VkIExvZ2dpbmcgU2VydmljZVxuICovXG5jbGFzcyBMb2dnaW5nU2VydmljZSB7XG4gICAgbG9ncyA9IFtdO1xuICAgIGNvbmZpZztcbiAgICBjb3JyZWxhdGlvbklkU3RhY2sgPSBbXTtcbiAgICBwZXJmb3JtYW5jZU1hcmtzID0gbmV3IE1hcCgpO1xuICAgIHNlc3Npb25JZDtcbiAgICB1c2VySWQ7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgbWluTGV2ZWw6IExvZ0xldmVsLklORk8sXG4gICAgICAgICAgICBtYXhMb2dzOiAxMDAwMCxcbiAgICAgICAgICAgIHRyYW5zcG9ydHM6IFsnY29uc29sZSddLFxuICAgICAgICAgICAgZW5hYmxlUGVyZm9ybWFuY2VMb2dnaW5nOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU3RhY2tUcmFjZTogdHJ1ZSxcbiAgICAgICAgICAgIHJvdGF0aW9uU2l6ZTogMTAgKiAxMDI0ICogMTAyNCwgLy8gMTBNQlxuICAgICAgICAgICAgcm90YXRpb25JbnRlcnZhbDogODY0MDAwMDAsIC8vIDI0IGhvdXJzXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2Vzc2lvbklkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgLy8gTG9hZCBwZXJzaXN0ZWQgbG9ncyBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICAgICB0aGlzLmxvYWRMb2dzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSBsb2dnaW5nIHNlcnZpY2VcbiAgICAgKi9cbiAgICBjb25maWd1cmUoY29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnID0geyAuLi50aGlzLmNvbmZpZywgLi4uY29uZmlnIH07XG4gICAgICAgIGNvbnNvbGUubG9nKCdMb2dnaW5nIHNlcnZpY2UgY29uZmlndXJlZDonLCB0aGlzLmNvbmZpZyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBtaW5pbXVtIGxvZyBsZXZlbFxuICAgICAqL1xuICAgIHNldExvZ0xldmVsKGxldmVsKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLm1pbkxldmVsID0gbGV2ZWw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB1c2VyIElEIGZvciBsb2dnaW5nIGNvbnRleHRcbiAgICAgKi9cbiAgICBzZXRVc2VySWQodXNlcklkKSB7XG4gICAgICAgIHRoaXMudXNlcklkID0gdXNlcklkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBhIGNvcnJlbGF0aW9uIGNvbnRleHRcbiAgICAgKi9cbiAgICBzdGFydENvcnJlbGF0aW9uKGlkKSB7XG4gICAgICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBpZCB8fCBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICB0aGlzLmNvcnJlbGF0aW9uSWRTdGFjay5wdXNoKGNvcnJlbGF0aW9uSWQpO1xuICAgICAgICByZXR1cm4gY29ycmVsYXRpb25JZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRW5kIHRoZSBjdXJyZW50IGNvcnJlbGF0aW9uIGNvbnRleHRcbiAgICAgKi9cbiAgICBlbmRDb3JyZWxhdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb3JyZWxhdGlvbklkU3RhY2sucG9wKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IGNvcnJlbGF0aW9uIElEXG4gICAgICovXG4gICAgZ2V0Q3VycmVudENvcnJlbGF0aW9uSWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcnJlbGF0aW9uSWRTdGFja1t0aGlzLmNvcnJlbGF0aW9uSWRTdGFjay5sZW5ndGggLSAxXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVFJBQ0UgbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIHRyYWNlKG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuVFJBQ0UsIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBERUJVRyBsZXZlbCBsb2dnaW5nXG4gICAgICovXG4gICAgZGVidWcobWVzc2FnZSwgY29udGV4dCwgZGF0YSkge1xuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5ERUJVRywgbWVzc2FnZSwgY29udGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElORk8gbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIGluZm8obWVzc2FnZSwgY29udGV4dCwgZGF0YSkge1xuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5JTkZPLCBtZXNzYWdlLCBjb250ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogV0FSTiBsZXZlbCBsb2dnaW5nXG4gICAgICovXG4gICAgd2FybihtZXNzYWdlLCBjb250ZXh0LCBkYXRhKSB7XG4gICAgICAgIHRoaXMubG9nKExvZ0xldmVsLldBUk4sIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFUlJPUiBsZXZlbCBsb2dnaW5nXG4gICAgICovXG4gICAgZXJyb3IobWVzc2FnZSwgY29udGV4dCwgZGF0YSwgZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JEYXRhID0gZXJyb3IgJiYgdGhpcy5jb25maWcuZW5hYmxlU3RhY2tUcmFjZSA/IHtcbiAgICAgICAgICAgIG5hbWU6IGVycm9yLm5hbWUsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgc3RhY2s6IGVycm9yLnN0YWNrLFxuICAgICAgICB9IDogdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxvZyhMb2dMZXZlbC5FUlJPUiwgbWVzc2FnZSwgY29udGV4dCwgZGF0YSwgZXJyb3JEYXRhKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRkFUQUwgbGV2ZWwgbG9nZ2luZ1xuICAgICAqL1xuICAgIGZhdGFsKG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yRGF0YSA9IGVycm9yICYmIHRoaXMuY29uZmlnLmVuYWJsZVN0YWNrVHJhY2UgPyB7XG4gICAgICAgICAgICBuYW1lOiBlcnJvci5uYW1lLFxuICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgIHN0YWNrOiBlcnJvci5zdGFjayxcbiAgICAgICAgfSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sb2coTG9nTGV2ZWwuRkFUQUwsIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEsIGVycm9yRGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvcmUgbG9nZ2luZyBtZXRob2RcbiAgICAgKi9cbiAgICBsb2cobGV2ZWwsIG1lc3NhZ2UsIGNvbnRleHQsIGRhdGEsIGVycm9yKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGxvZyBsZXZlbCBpcyBlbmFibGVkXG4gICAgICAgIGlmIChsZXZlbCA8IHRoaXMuY29uZmlnLm1pbkxldmVsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGxldmVsLFxuICAgICAgICAgICAgbGV2ZWxOYW1lOiBMb2dMZXZlbFtsZXZlbF0sXG4gICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uSWQ6IHRoaXMuZ2V0Q3VycmVudENvcnJlbGF0aW9uSWQoKSxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgIHRhZ3M6IFtdLFxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLnVzZXJJZCxcbiAgICAgICAgICAgIHNlc3Npb25JZDogdGhpcy5zZXNzaW9uSWQsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9ncy5wdXNoKGVudHJ5KTtcbiAgICAgICAgLy8gTWFuYWdlIGxvZyByb3RhdGlvblxuICAgICAgICBpZiAodGhpcy5sb2dzLmxlbmd0aCA+IHRoaXMuY29uZmlnLm1heExvZ3MpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncyA9IHRoaXMubG9ncy5zbGljZSgtdGhpcy5jb25maWcubWF4TG9ncyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3V0cHV0IHRvIHRyYW5zcG9ydHNcbiAgICAgICAgdGhpcy5vdXRwdXRUb1RyYW5zcG9ydHMoZW50cnkpO1xuICAgICAgICAvLyBQZXJzaXN0IGxvZ3MgcGVyaW9kaWNhbGx5XG4gICAgICAgIGlmICh0aGlzLmxvZ3MubGVuZ3RoICUgMTAgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucGVyc2lzdExvZ3MoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtYW5jZSBsb2dnaW5nIC0gc3RhcnQgdGltaW5nXG4gICAgICovXG4gICAgc3RhcnRQZXJmb3JtYW5jZU1lYXN1cmUobWV0aG9kTmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmVuYWJsZVBlcmZvcm1hbmNlTG9nZ2luZylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wZXJmb3JtYW5jZU1hcmtzLnNldChtZXRob2ROYW1lLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1hbmNlIGxvZ2dpbmcgLSBlbmQgdGltaW5nIGFuZCBsb2dcbiAgICAgKi9cbiAgICBlbmRQZXJmb3JtYW5jZU1lYXN1cmUobWV0aG9kTmFtZSwgY29udGV4dCkge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmVuYWJsZVBlcmZvcm1hbmNlTG9nZ2luZylcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSB0aGlzLnBlcmZvcm1hbmNlTWFya3MuZ2V0KG1ldGhvZE5hbWUpO1xuICAgICAgICBpZiAoIXN0YXJ0VGltZSkge1xuICAgICAgICAgICAgdGhpcy53YXJuKGBObyBwZXJmb3JtYW5jZSBtYXJrIGZvdW5kIGZvciAke21ldGhvZE5hbWV9YCwgJ1BlcmZvcm1hbmNlJyk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLnBlcmZvcm1hbmNlTWFya3MuZGVsZXRlKG1ldGhvZE5hbWUpO1xuICAgICAgICAvLyBMb2cgcGVyZm9ybWFuY2UgZW50cnlcbiAgICAgICAgY29uc3QgZW50cnkgPSB7XG4gICAgICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIGxldmVsOiBMb2dMZXZlbC5ERUJVRyxcbiAgICAgICAgICAgIGxldmVsTmFtZTogJ0RFQlVHJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBQZXJmb3JtYW5jZTogJHttZXRob2ROYW1lfWAsXG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8ICdQZXJmb3JtYW5jZScsXG4gICAgICAgICAgICBjb3JyZWxhdGlvbklkOiB0aGlzLmdldEN1cnJlbnRDb3JyZWxhdGlvbklkKCksXG4gICAgICAgICAgICBwZXJmb3JtYW5jZToge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kTmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuc2Vzc2lvbklkLFxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLnVzZXJJZCxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sb2dzLnB1c2goZW50cnkpO1xuICAgICAgICB0aGlzLm91dHB1dFRvVHJhbnNwb3J0cyhlbnRyeSk7XG4gICAgICAgIHJldHVybiBkdXJhdGlvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWVhc3VyZSBhc3luYyBmdW5jdGlvbiBwZXJmb3JtYW5jZVxuICAgICAqL1xuICAgIGFzeW5jIG1lYXN1cmVBc3luYyhtZXRob2ROYW1lLCBmbiwgY29udGV4dCkge1xuICAgICAgICB0aGlzLnN0YXJ0UGVyZm9ybWFuY2VNZWFzdXJlKG1ldGhvZE5hbWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLmVuZFBlcmZvcm1hbmNlTWVhc3VyZShtZXRob2ROYW1lLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdXRwdXQgbG9nIGVudHJ5IHRvIGNvbmZpZ3VyZWQgdHJhbnNwb3J0c1xuICAgICAqL1xuICAgIG91dHB1dFRvVHJhbnNwb3J0cyhlbnRyeSkge1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zcG9ydCBvZiB0aGlzLmNvbmZpZy50cmFuc3BvcnRzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnNvbGUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHB1dFRvQ29uc29sZShlbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2ZpbGUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHB1dFRvRmlsZShlbnRyeSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW90ZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cHV0VG9SZW1vdGUoZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdXRwdXQgdG8gY29uc29sZVxuICAgICAqL1xuICAgIG91dHB1dFRvQ29uc29sZShlbnRyeSkge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBlbnRyeS50aW1lc3RhbXAudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY29uc3QgbGV2ZWwgPSBlbnRyeS5sZXZlbE5hbWUucGFkRW5kKDUpO1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gZW50cnkuY29udGV4dCA/IGBbJHtlbnRyeS5jb250ZXh0fV1gIDogJyc7XG4gICAgICAgIGNvbnN0IGNvcnJlbGF0aW9uSWQgPSBlbnRyeS5jb3JyZWxhdGlvbklkID8gYFske2VudHJ5LmNvcnJlbGF0aW9uSWQuc2xpY2UoMCwgOCl9XWAgOiAnJztcbiAgICAgICAgbGV0IGxvZ0ZuID0gY29uc29sZS5sb2c7XG4gICAgICAgIGxldCBjb2xvciA9ICcnO1xuICAgICAgICBzd2l0Y2ggKGVudHJ5LmxldmVsKSB7XG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLlRSQUNFOlxuICAgICAgICAgICAgICAgIGxvZ0ZuID0gY29uc29sZS5kZWJ1ZztcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdcXHgxYls5MG0nOyAvLyBHcmF5XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLkRFQlVHOlxuICAgICAgICAgICAgICAgIGxvZ0ZuID0gY29uc29sZS5kZWJ1ZztcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdcXHgxYlszNm0nOyAvLyBDeWFuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ0xldmVsLklORk86XG4gICAgICAgICAgICAgICAgbG9nRm4gPSBjb25zb2xlLmluZm87XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnXFx4MWJbMzJtJzsgLy8gR3JlZW5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTG9nTGV2ZWwuV0FSTjpcbiAgICAgICAgICAgICAgICBsb2dGbiA9IGNvbnNvbGUud2FybjtcbiAgICAgICAgICAgICAgICBjb2xvciA9ICdcXHgxYlszM20nOyAvLyBZZWxsb3dcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTG9nTGV2ZWwuRVJST1I6XG4gICAgICAgICAgICAgICAgbG9nRm4gPSBjb25zb2xlLmVycm9yO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gJ1xceDFiWzMxbSc7IC8vIFJlZFxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMb2dMZXZlbC5GQVRBTDpcbiAgICAgICAgICAgICAgICBsb2dGbiA9IGNvbnNvbGUuZXJyb3I7XG4gICAgICAgICAgICAgICAgY29sb3IgPSAnXFx4MWJbMzVtJzsgLy8gTWFnZW50YVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc2V0ID0gJ1xceDFiWzBtJztcbiAgICAgICAgbG9nRm4oYCR7Y29sb3J9JHt0aW1lc3RhbXB9ICR7bGV2ZWx9JHtyZXNldH0gJHtjb250ZXh0fSR7Y29ycmVsYXRpb25JZH0gJHtlbnRyeS5tZXNzYWdlfWApO1xuICAgICAgICBpZiAoZW50cnkuZGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJyAgRGF0YTonLCBlbnRyeS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnkuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyAgRXJyb3I6JywgZW50cnkuZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoZW50cnkuZXJyb3Iuc3RhY2spIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVudHJ5LmVycm9yLnN0YWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50cnkucGVyZm9ybWFuY2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIER1cmF0aW9uOiAke2VudHJ5LnBlcmZvcm1hbmNlLmR1cmF0aW9uLnRvRml4ZWQoMil9bXNgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdXRwdXQgdG8gZmlsZSAodmlhIElQQyB0byBtYWluIHByb2Nlc3MpXG4gICAgICovXG4gICAgb3V0cHV0VG9GaWxlKGVudHJ5KSB7XG4gICAgICAgIC8vIFNlbmQgdG8gbWFpbiBwcm9jZXNzIGZvciBmaWxlIHdyaXRpbmdcbiAgICAgICAgaWYgKHdpbmRvdy5lbGVjdHJvbkFQST8ubG9nVG9GaWxlKSB7XG4gICAgICAgICAgICB3aW5kb3cuZWxlY3Ryb25BUEkubG9nVG9GaWxlKGVudHJ5KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHdyaXRlIGxvZyB0byBmaWxlOicsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPdXRwdXQgdG8gcmVtb3RlIGxvZ2dpbmcgc2VydmljZVxuICAgICAqL1xuICAgIG91dHB1dFRvUmVtb3RlKGVudHJ5KSB7XG4gICAgICAgIC8vIFdvdWxkIHNlbmQgdG8gcmVtb3RlIGxvZ2dpbmcgc2VydmljZSAoZS5nLiwgRWxhc3RpY3NlYXJjaCwgU3BsdW5rKVxuICAgICAgICAvLyBJbXBsZW1lbnRhdGlvbiBkZXBlbmRzIG9uIHNwZWNpZmljIHNlcnZpY2VcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBsb2dzXG4gICAgICovXG4gICAgZ2V0TG9ncygpIHtcbiAgICAgICAgcmV0dXJuIFsuLi50aGlzLmxvZ3NdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBGaWx0ZXIgbG9ncyBieSBjcml0ZXJpYVxuICAgICAqL1xuICAgIGZpbHRlckxvZ3MoZmlsdGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ3MuZmlsdGVyKChlbnRyeSkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbHRlci5sZXZlbHMgJiYgIWZpbHRlci5sZXZlbHMuaW5jbHVkZXMoZW50cnkubGV2ZWwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci5jb250ZXh0cyAmJiBlbnRyeS5jb250ZXh0ICYmICFmaWx0ZXIuY29udGV4dHMuaW5jbHVkZXMoZW50cnkuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsdGVyLmNvcnJlbGF0aW9uSWQgJiYgZW50cnkuY29ycmVsYXRpb25JZCAhPT0gZmlsdGVyLmNvcnJlbGF0aW9uSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsdGVyLnN0YXJ0VGltZSAmJiBlbnRyeS50aW1lc3RhbXAgPCBmaWx0ZXIuc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci5lbmRUaW1lICYmIGVudHJ5LnRpbWVzdGFtcCA+IGZpbHRlci5lbmRUaW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBmaWx0ZXIuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNNZXNzYWdlID0gZW50cnkubWVzc2FnZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzQ29udGV4dCA9IGVudHJ5LmNvbnRleHQ/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNEYXRhID0gSlNPTi5zdHJpbmdpZnkoZW50cnkuZGF0YSB8fCB7fSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcik7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVzTWVzc2FnZSAmJiAhbWF0Y2hlc0NvbnRleHQgJiYgIW1hdGNoZXNEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsdGVyLnRhZ3MgJiYgZW50cnkudGFncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhc1RhZyA9IGZpbHRlci50YWdzLnNvbWUoKHRhZykgPT4gZW50cnkudGFncy5pbmNsdWRlcyh0YWcpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1RhZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggbG9ncyBieSB0ZXh0XG4gICAgICovXG4gICAgc2VhcmNoTG9ncyhxdWVyeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJMb2dzKHsgc2VhcmNoVGV4dDogcXVlcnkgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBsb2dzIGJ5IGNvcnJlbGF0aW9uIElEXG4gICAgICovXG4gICAgZ2V0TG9nc0J5Q29ycmVsYXRpb24oY29ycmVsYXRpb25JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJMb2dzKHsgY29ycmVsYXRpb25JZCB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIGxvZ3NcbiAgICAgKi9cbiAgICBjbGVhckxvZ3MoKSB7XG4gICAgICAgIHRoaXMubG9ncyA9IFtdO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYXBwX2xvZ3MnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0FsbCBsb2dzIGNsZWFyZWQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyc2lzdCBsb2dzIHRvIGxvY2FsU3RvcmFnZVxuICAgICAqL1xuICAgIHBlcnNpc3RMb2dzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gU3RvcmUgbGFzdCAxMDAwIGxvZ3NcbiAgICAgICAgICAgIGNvbnN0IGxvZ3NUb1N0b3JlID0gdGhpcy5sb2dzLnNsaWNlKC0xMDAwKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhcHBfbG9ncycsIEpTT04uc3RyaW5naWZ5KGxvZ3NUb1N0b3JlKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGVyc2lzdCBsb2dzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkIGxvZ3MgZnJvbSBsb2NhbFN0b3JhZ2VcbiAgICAgKi9cbiAgICBsb2FkTG9ncygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhcHBfbG9ncycpO1xuICAgICAgICAgICAgaWYgKHN0b3JlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvZ3MgPSBKU09OLnBhcnNlKHN0b3JlZCk7XG4gICAgICAgICAgICAgICAgLy8gQ29udmVydCB0aW1lc3RhbXAgc3RyaW5ncyBiYWNrIHRvIERhdGUgb2JqZWN0c1xuICAgICAgICAgICAgICAgIHRoaXMubG9ncyA9IGxvZ3MubWFwKChlbnRyeSkgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZW50cnksXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoZW50cnkudGltZXN0YW1wKSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYExvYWRlZCAke3RoaXMubG9ncy5sZW5ndGh9IHBlcnNpc3RlZCBsb2dzYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCBwZXJzaXN0ZWQgbG9nczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGxvZ3MgdG8gSlNPTlxuICAgICAqL1xuICAgIGV4cG9ydExvZ3MoZm9ybWF0ID0gJ2pzb24nKSB7XG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBsZXQgbWltZVR5cGU7XG4gICAgICAgIGxldCBleHRlbnNpb247XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdqc29uJykge1xuICAgICAgICAgICAgY29udGVudCA9IEpTT04uc3RyaW5naWZ5KHRoaXMubG9ncywgbnVsbCwgMik7XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGV4dGVuc2lvbiA9ICdqc29uJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIENTViBmb3JtYXRcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlcnMgPSBbJ3RpbWVzdGFtcCcsICdsZXZlbCcsICdjb250ZXh0JywgJ2NvcnJlbGF0aW9uSWQnLCAnbWVzc2FnZScsICdkYXRhJ107XG4gICAgICAgICAgICBjb25zdCByb3dzID0gdGhpcy5sb2dzLm1hcCgoZW50cnkpID0+IFtcbiAgICAgICAgICAgICAgICBlbnRyeS50aW1lc3RhbXAudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBlbnRyeS5sZXZlbE5hbWUsXG4gICAgICAgICAgICAgICAgZW50cnkuY29udGV4dCB8fCAnJyxcbiAgICAgICAgICAgICAgICBlbnRyeS5jb3JyZWxhdGlvbklkIHx8ICcnLFxuICAgICAgICAgICAgICAgIGVudHJ5Lm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZW50cnkuZGF0YSB8fCB7fSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBbaGVhZGVycywgLi4ucm93c10ubWFwKChyb3cpID0+IHJvdy5tYXAoKGNlbGwpID0+IGBcIiR7Y2VsbH1cImApLmpvaW4oJywnKSkuam9pbignXFxuJyk7XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICd0ZXh0L2Nzdic7XG4gICAgICAgICAgICBleHRlbnNpb24gPSAnY3N2JztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NvbnRlbnRdLCB7IHR5cGU6IG1pbWVUeXBlIH0pO1xuICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICAgIGEuZG93bmxvYWQgPSBgbG9nc18ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyl9LiR7ZXh0ZW5zaW9ufWA7XG4gICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgICAgICB0aGlzLmluZm8oJ0xvZ3MgZXhwb3J0ZWQnLCAnTG9nZ2luZ1NlcnZpY2UnLCB7IGZvcm1hdCwgY291bnQ6IHRoaXMubG9ncy5sZW5ndGggfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBsb2dnaW5nIHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRTdGF0aXN0aWNzKCkge1xuICAgICAgICBjb25zdCB0b3RhbCA9IHRoaXMubG9ncy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGJ5TGV2ZWwgPSB7fTtcbiAgICAgICAgZm9yIChsZXQgbGV2ZWwgPSBMb2dMZXZlbC5UUkFDRTsgbGV2ZWwgPD0gTG9nTGV2ZWwuRkFUQUw7IGxldmVsKyspIHtcbiAgICAgICAgICAgIGJ5TGV2ZWxbTG9nTGV2ZWxbbGV2ZWxdXSA9IHRoaXMubG9ncy5maWx0ZXIoKGwpID0+IGwubGV2ZWwgPT09IGxldmVsKS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29udGV4dHMgPSBuZXcgU2V0KHRoaXMubG9ncy5tYXAoKGwpID0+IGwuY29udGV4dCkuZmlsdGVyKEJvb2xlYW4pKTtcbiAgICAgICAgY29uc3QgY29ycmVsYXRpb25zID0gbmV3IFNldCh0aGlzLmxvZ3MubWFwKChsKSA9PiBsLmNvcnJlbGF0aW9uSWQpLmZpbHRlcihCb29sZWFuKSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIGJ5TGV2ZWwsXG4gICAgICAgICAgICB1bmlxdWVDb250ZXh0czogY29udGV4dHMuc2l6ZSxcbiAgICAgICAgICAgIHVuaXF1ZUNvcnJlbGF0aW9uczogY29ycmVsYXRpb25zLnNpemUsXG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHRoaXMuc2Vzc2lvbklkLFxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLnVzZXJJZCxcbiAgICAgICAgICAgIG9sZGVzdExvZzogdGhpcy5sb2dzWzBdPy50aW1lc3RhbXAsXG4gICAgICAgICAgICBuZXdlc3RMb2c6IHRoaXMubG9nc1t0aGlzLmxvZ3MubGVuZ3RoIC0gMV0/LnRpbWVzdGFtcCxcbiAgICAgICAgfTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBuZXcgTG9nZ2luZ1NlcnZpY2UoKTtcbiIsIi8qKlxuICogRW5oYW5jZWQgQ2FjaGUgU2VydmljZVxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgY2FjaGluZyB3aXRoOlxuICogLSBNdWx0aXBsZSBjYWNoZSBzdHJhdGVnaWVzIChMUlUsIExGVSwgRklGTywgVFRMKVxuICogLSBNdWx0aXBsZSBzdG9yYWdlIGJhY2tlbmRzIChtZW1vcnksIGxvY2FsU3RvcmFnZSwgSW5kZXhlZERCKVxuICogLSBDYWNoZSBzdGF0aXN0aWNzIGFuZCBtb25pdG9yaW5nXG4gKiAtIEF1dG9tYXRpYyBleHBpcmF0aW9uIGFuZCBjbGVhbnVwXG4gKiAtIENhY2hlIHdhcm1pbmcgYW5kIHByZWxvYWRpbmdcbiAqIC0gQ2FjaGUgdmVyc2lvbmluZyBhbmQgaW52YWxpZGF0aW9uXG4gKi9cbmltcG9ydCBsb2dnaW5nU2VydmljZSBmcm9tICcuL2xvZ2dpbmdTZXJ2aWNlJztcbi8qKlxuICogRW5oYW5jZWQgQ2FjaGUgU2VydmljZVxuICovXG5leHBvcnQgY2xhc3MgQ2FjaGVTZXJ2aWNlIHtcbiAgICBjYWNoZSA9IG5ldyBNYXAoKTtcbiAgICBzdHJhdGVneTtcbiAgICBiYWNrZW5kO1xuICAgIG1heFNpemU7XG4gICAgbWF4TWVtb3J5Qnl0ZXM7XG4gICAgZGVmYXVsdFRUTDtcbiAgICBlbmFibGVTdGF0cztcbiAgICBuYW1lc3BhY2U7XG4gICAgY2xlYW51cEludGVydmFsO1xuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBzdGF0cyA9IHtcbiAgICAgICAgaGl0czogMCxcbiAgICAgICAgbWlzc2VzOiAwLFxuICAgICAgICBldmljdGlvbnM6IDAsXG4gICAgICAgIHRvdGFsQWNjZXNzVGltZTogMCxcbiAgICAgICAgYWNjZXNzQ291bnQ6IDAsXG4gICAgfTtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICAgICAgdGhpcy5zdHJhdGVneSA9IG9wdGlvbnMuc3RyYXRlZ3kgfHwgJ0xSVSc7XG4gICAgICAgIHRoaXMuYmFja2VuZCA9IG9wdGlvbnMuYmFja2VuZCB8fCAnbWVtb3J5JztcbiAgICAgICAgdGhpcy5tYXhTaXplID0gb3B0aW9ucy5tYXhTaXplIHx8IDEwMDA7XG4gICAgICAgIHRoaXMubWF4TWVtb3J5Qnl0ZXMgPSAob3B0aW9ucy5tYXhNZW1vcnlNQiB8fCAxMDApICogMTA0ODU3NjtcbiAgICAgICAgdGhpcy5kZWZhdWx0VFRMID0gb3B0aW9ucy5kZWZhdWx0VFRMO1xuICAgICAgICB0aGlzLmVuYWJsZVN0YXRzID0gb3B0aW9ucy5lbmFibGVTdGF0cyAhPT0gZmFsc2U7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gb3B0aW9ucy5uYW1lc3BhY2UgfHwgJ2RlZmF1bHQnO1xuICAgICAgICAvLyBTdGFydCBhdXRvbWF0aWMgY2xlYW51cFxuICAgICAgICB0aGlzLnN0YXJ0Q2xlYW51cCgpO1xuICAgICAgICAvLyBMb2FkIGZyb20gcGVyc2lzdGVudCBzdG9yYWdlIGlmIG5lZWRlZFxuICAgICAgICBpZiAodGhpcy5iYWNrZW5kICE9PSAnbWVtb3J5Jykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRnJvbVN0b3JhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICBsb2dnaW5nU2VydmljZS5pbmZvKCdDYWNoZSBzZXJ2aWNlIGluaXRpYWxpemVkJywgJ0NhY2hlU2VydmljZScsIHtcbiAgICAgICAgICAgIHN0cmF0ZWd5OiB0aGlzLnN0cmF0ZWd5LFxuICAgICAgICAgICAgYmFja2VuZDogdGhpcy5iYWNrZW5kLFxuICAgICAgICAgICAgbWF4U2l6ZTogdGhpcy5tYXhTaXplLFxuICAgICAgICAgICAgbmFtZXNwYWNlOiB0aGlzLm5hbWVzcGFjZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB2YWx1ZSBmcm9tIGNhY2hlXG4gICAgICovXG4gICAgZ2V0KGtleSkge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlZEtleSA9IHRoaXMuZ2V0TmFtZXNwYWNlZEtleShrZXkpO1xuICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuY2FjaGUuZ2V0KG5hbWVzcGFjZWRLZXkpO1xuICAgICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRzLm1pc3NlcysrO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRBY2Nlc3NUaW1lKHN0YXJ0VGltZSk7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGV4cGlyYXRpb25cbiAgICAgICAgaWYgKGVudHJ5LmV4cGlyZXNBdCAmJiBEYXRlLm5vdygpID4gZW50cnkuZXhwaXJlc0F0KSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5taXNzZXMrKztcbiAgICAgICAgICAgIHRoaXMucmVjb3JkQWNjZXNzVGltZShzdGFydFRpbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBVcGRhdGUgYWNjZXNzIG1ldGFkYXRhXG4gICAgICAgIGVudHJ5LmFjY2Vzc0NvdW50Kys7XG4gICAgICAgIGVudHJ5Lmxhc3RBY2Nlc3NlZCA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMuc3RhdHMuaGl0cysrO1xuICAgICAgICB0aGlzLnJlY29yZEFjY2Vzc1RpbWUoc3RhcnRUaW1lKTtcbiAgICAgICAgcmV0dXJuIGVudHJ5LnZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdmFsdWUgaW4gY2FjaGVcbiAgICAgKi9cbiAgICBzZXQoa2V5LCB2YWx1ZSwgdHRsKSB7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZWRLZXkgPSB0aGlzLmdldE5hbWVzcGFjZWRLZXkoa2V5KTtcbiAgICAgICAgY29uc3Qgc2l6ZSA9IHRoaXMuZXN0aW1hdGVTaXplKHZhbHVlKTtcbiAgICAgICAgLy8gQ2hlY2sgbWVtb3J5IGxpbWl0c1xuICAgICAgICBpZiAodGhpcy5nZXRDdXJyZW50TWVtb3J5VXNhZ2UoKSArIHNpemUgPiB0aGlzLm1heE1lbW9yeUJ5dGVzKSB7XG4gICAgICAgICAgICB0aGlzLmV2aWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgc2l6ZSBsaW1pdHNcbiAgICAgICAgaWYgKHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heFNpemUpIHtcbiAgICAgICAgICAgIHRoaXMuZXZpY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgICAgICAgIGtleTogbmFtZXNwYWNlZEtleSxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgZXhwaXJlc0F0OiB0dGwgPyBEYXRlLm5vdygpICsgdHRsIDogdGhpcy5kZWZhdWx0VFRMID8gRGF0ZS5ub3coKSArIHRoaXMuZGVmYXVsdFRUTCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGFjY2Vzc0NvdW50OiAwLFxuICAgICAgICAgICAgbGFzdEFjY2Vzc2VkOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jYWNoZS5zZXQobmFtZXNwYWNlZEtleSwgZW50cnkpO1xuICAgICAgICAvLyBQZXJzaXN0IHRvIHN0b3JhZ2UgaWYgbmVlZGVkXG4gICAgICAgIGlmICh0aGlzLmJhY2tlbmQgIT09ICdtZW1vcnknKSB7XG4gICAgICAgICAgICB0aGlzLnBlcnNpc3RUb1N0b3JhZ2UobmFtZXNwYWNlZEtleSwgZW50cnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGtleSBleGlzdHMgaW4gY2FjaGVcbiAgICAgKi9cbiAgICBoYXMoa2V5KSB7XG4gICAgICAgIGNvbnN0IG5hbWVzcGFjZWRLZXkgPSB0aGlzLmdldE5hbWVzcGFjZWRLZXkoa2V5KTtcbiAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmNhY2hlLmdldChuYW1lc3BhY2VkS2V5KTtcbiAgICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIGV4cGlyYXRpb25cbiAgICAgICAgaWYgKGVudHJ5LmV4cGlyZXNBdCAmJiBEYXRlLm5vdygpID4gZW50cnkuZXhwaXJlc0F0KSB7XG4gICAgICAgICAgICB0aGlzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgZW50cnkgZnJvbSBjYWNoZVxuICAgICAqL1xuICAgIGRlbGV0ZShrZXkpIHtcbiAgICAgICAgY29uc3QgbmFtZXNwYWNlZEtleSA9IHRoaXMuZ2V0TmFtZXNwYWNlZEtleShrZXkpO1xuICAgICAgICBjb25zdCBkZWxldGVkID0gdGhpcy5jYWNoZS5kZWxldGUobmFtZXNwYWNlZEtleSk7XG4gICAgICAgIGlmIChkZWxldGVkICYmIHRoaXMuYmFja2VuZCAhPT0gJ21lbW9yeScpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlRnJvbVN0b3JhZ2UobmFtZXNwYWNlZEtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlbGV0ZWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBlbnRyaWVzXG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5zdGF0cyA9IHtcbiAgICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgICBtaXNzZXM6IDAsXG4gICAgICAgICAgICBldmljdGlvbnM6IDAsXG4gICAgICAgICAgICB0b3RhbEFjY2Vzc1RpbWU6IDAsXG4gICAgICAgICAgICBhY2Nlc3NDb3VudDogMCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuYmFja2VuZCAhPT0gJ21lbW9yeScpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2luZ1NlcnZpY2UuaW5mbygnQ2FjaGUgY2xlYXJlZCcsICdDYWNoZVNlcnZpY2UnLCB7IG5hbWVzcGFjZTogdGhpcy5uYW1lc3BhY2UgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBvciBzZXQgKGZldGNoIGlmIG5vdCBleGlzdHMpXG4gICAgICovXG4gICAgYXN5bmMgZ2V0T3JTZXQoa2V5LCBmYWN0b3J5LCB0dGwpIHtcbiAgICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGNhY2hlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgZmFjdG9yeSgpO1xuICAgICAgICB0aGlzLnNldChrZXksIHZhbHVlLCB0dGwpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBtdWx0aXBsZSBrZXlzXG4gICAgICovXG4gICAgZ2V0TWFueShrZXlzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoa2V5KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCBtdWx0aXBsZSBlbnRyaWVzXG4gICAgICovXG4gICAgc2V0TWFueShlbnRyaWVzLCB0dGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykge1xuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB2YWx1ZSwgdHRsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmljdCBlbnRyeSBiYXNlZCBvbiBzdHJhdGVneVxuICAgICAqL1xuICAgIGV2aWN0KCkge1xuICAgICAgICBpZiAodGhpcy5jYWNoZS5zaXplID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGtleVRvRXZpY3Q7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdHJhdGVneSkge1xuICAgICAgICAgICAgY2FzZSAnTFJVJzogLy8gTGVhc3QgUmVjZW50bHkgVXNlZFxuICAgICAgICAgICAgICAgIGtleVRvRXZpY3QgPSB0aGlzLmZpbmRMUlVLZXkoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xGVSc6IC8vIExlYXN0IEZyZXF1ZW50bHkgVXNlZFxuICAgICAgICAgICAgICAgIGtleVRvRXZpY3QgPSB0aGlzLmZpbmRMRlVLZXkoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0ZJRk8nOiAvLyBGaXJzdCBJbiBGaXJzdCBPdXRcbiAgICAgICAgICAgICAgICBrZXlUb0V2aWN0ID0gdGhpcy5maW5kRklGT0tleSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVFRMJzogLy8gRXhwaXJlIG9sZGVzdCBieSBUVExcbiAgICAgICAgICAgICAgICBrZXlUb0V2aWN0ID0gdGhpcy5maW5kRXhwaXJlZEtleSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXlUb0V2aWN0KSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShrZXlUb0V2aWN0KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMuZXZpY3Rpb25zKys7XG4gICAgICAgICAgICBpZiAodGhpcy5iYWNrZW5kICE9PSAnbWVtb3J5Jykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlRnJvbVN0b3JhZ2Uoa2V5VG9FdmljdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBsZWFzdCByZWNlbnRseSB1c2VkIGtleVxuICAgICAqL1xuICAgIGZpbmRMUlVLZXkoKSB7XG4gICAgICAgIGxldCBvbGRlc3RLZXk7XG4gICAgICAgIGxldCBvbGRlc3RUaW1lID0gSW5maW5pdHk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHRoaXMuY2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChlbnRyeS5sYXN0QWNjZXNzZWQgPCBvbGRlc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgb2xkZXN0VGltZSA9IGVudHJ5Lmxhc3RBY2Nlc3NlZDtcbiAgICAgICAgICAgICAgICBvbGRlc3RLZXkgPSBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9sZGVzdEtleTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBsZWFzdCBmcmVxdWVudGx5IHVzZWQga2V5XG4gICAgICovXG4gICAgZmluZExGVUtleSgpIHtcbiAgICAgICAgbGV0IGxlYXN0VXNlZEtleTtcbiAgICAgICAgbGV0IGxlYXN0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBlbnRyeV0gb2YgdGhpcy5jYWNoZSkge1xuICAgICAgICAgICAgaWYgKGVudHJ5LmFjY2Vzc0NvdW50IDwgbGVhc3RDb3VudCkge1xuICAgICAgICAgICAgICAgIGxlYXN0Q291bnQgPSBlbnRyeS5hY2Nlc3NDb3VudDtcbiAgICAgICAgICAgICAgICBsZWFzdFVzZWRLZXkgPSBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxlYXN0VXNlZEtleTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBmaXJzdCBpbiBmaXJzdCBvdXQga2V5XG4gICAgICovXG4gICAgZmluZEZJRk9LZXkoKSB7XG4gICAgICAgIGxldCBvbGRlc3RLZXk7XG4gICAgICAgIGxldCBvbGRlc3RUaW1lID0gSW5maW5pdHk7XG4gICAgICAgIGZvciAoY29uc3QgW2tleSwgZW50cnldIG9mIHRoaXMuY2FjaGUpIHtcbiAgICAgICAgICAgIGlmIChlbnRyeS50aW1lc3RhbXAgPCBvbGRlc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgb2xkZXN0VGltZSA9IGVudHJ5LnRpbWVzdGFtcDtcbiAgICAgICAgICAgICAgICBvbGRlc3RLZXkgPSBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9sZGVzdEtleTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmluZCBleHBpcmVkIGtleVxuICAgICAqL1xuICAgIGZpbmRFeHBpcmVkS2V5KCkge1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB0aGlzLmNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuZXhwaXJlc0F0ICYmIGVudHJ5LmV4cGlyZXNBdCA8IG5vdykge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgbm8gZXhwaXJlZCwgdXNlIG9sZGVzdFxuICAgICAgICByZXR1cm4gdGhpcy5maW5kRklGT0tleSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbmFtZXNwYWNlZCBrZXlcbiAgICAgKi9cbiAgICBnZXROYW1lc3BhY2VkS2V5KGtleSkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5uYW1lc3BhY2V9OiR7a2V5fWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEVzdGltYXRlIHNpemUgb2YgdmFsdWVcbiAgICAgKi9cbiAgICBlc3RpbWF0ZVNpemUodmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJvdWdoIGVzdGltYXRlOiBzdHJpbmdpZnkgYW5kIG1lYXN1cmVcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4ganNvbi5sZW5ndGggKiAyOyAvLyBVVEYtMTYgY2hhcnMgYXJlIDIgYnl0ZXNcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCB7XG4gICAgICAgICAgICByZXR1cm4gMTAwMDsgLy8gRGVmYXVsdCBlc3RpbWF0ZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IG1lbW9yeSB1c2FnZVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRNZW1vcnlVc2FnZSgpIHtcbiAgICAgICAgbGV0IHRvdGFsID0gMDtcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmNhY2hlLnZhbHVlcygpKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBlbnRyeS5zaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b3RhbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVjb3JkIGFjY2VzcyB0aW1lIGZvciBzdGF0c1xuICAgICAqL1xuICAgIHJlY29yZEFjY2Vzc1RpbWUoc3RhcnRUaW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmVuYWJsZVN0YXRzKSB7XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5zdGF0cy50b3RhbEFjY2Vzc1RpbWUgKz0gZHVyYXRpb247XG4gICAgICAgICAgICB0aGlzLnN0YXRzLmFjY2Vzc0NvdW50Kys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGNhY2hlIHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBnZXRTdGF0cygpIHtcbiAgICAgICAgY29uc3QgdG90YWwgPSB0aGlzLnN0YXRzLmhpdHMgKyB0aGlzLnN0YXRzLm1pc3NlcztcbiAgICAgICAgY29uc3QgaGl0UmF0ZSA9IHRvdGFsID4gMCA/IHRoaXMuc3RhdHMuaGl0cyAvIHRvdGFsIDogMDtcbiAgICAgICAgY29uc3QgYXZnQWNjZXNzVGltZSA9IHRoaXMuc3RhdHMuYWNjZXNzQ291bnQgPiAwID8gdGhpcy5zdGF0cy50b3RhbEFjY2Vzc1RpbWUgLyB0aGlzLnN0YXRzLmFjY2Vzc0NvdW50IDogMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhpdHM6IHRoaXMuc3RhdHMuaGl0cyxcbiAgICAgICAgICAgIG1pc3NlczogdGhpcy5zdGF0cy5taXNzZXMsXG4gICAgICAgICAgICBldmljdGlvbnM6IHRoaXMuc3RhdHMuZXZpY3Rpb25zLFxuICAgICAgICAgICAgZW50cmllczogdGhpcy5jYWNoZS5zaXplLFxuICAgICAgICAgICAgbWVtb3J5VXNhZ2VNQjogdGhpcy5nZXRDdXJyZW50TWVtb3J5VXNhZ2UoKSAvIDEwNDg1NzYsXG4gICAgICAgICAgICBoaXRSYXRlLFxuICAgICAgICAgICAgYXZlcmFnZUFjY2Vzc1RpbWU6IGF2Z0FjY2Vzc1RpbWUsXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlc2V0IHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICByZXNldFN0YXRzKCkge1xuICAgICAgICB0aGlzLnN0YXRzID0ge1xuICAgICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICAgIG1pc3NlczogMCxcbiAgICAgICAgICAgIGV2aWN0aW9uczogMCxcbiAgICAgICAgICAgIHRvdGFsQWNjZXNzVGltZTogMCxcbiAgICAgICAgICAgIGFjY2Vzc0NvdW50OiAwLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGtleXNcbiAgICAgKi9cbiAgICBrZXlzKCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBgJHt0aGlzLm5hbWVzcGFjZX06YDtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jYWNoZS5rZXlzKCkpXG4gICAgICAgICAgICAuZmlsdGVyKChrKSA9PiBrLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgICAgIC5tYXAoKGspID0+IGsuc3Vic3RyaW5nKHByZWZpeC5sZW5ndGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGNhY2hlIHNpemVcbiAgICAgKi9cbiAgICBzaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5zaXplO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCBhdXRvbWF0aWMgY2xlYW51cCBvZiBleHBpcmVkIGVudHJpZXNcbiAgICAgKi9cbiAgICBzdGFydENsZWFudXAoKSB7XG4gICAgICAgIHRoaXMuY2xlYW51cEludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jbGVhbnVwRXhwaXJlZCgpO1xuICAgICAgICB9LCA2MDAwMCk7IC8vIFJ1biBldmVyeSBtaW51dGVcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RvcCBhdXRvbWF0aWMgY2xlYW51cFxuICAgICAqL1xuICAgIHN0b3BDbGVhbnVwKCkge1xuICAgICAgICBpZiAodGhpcy5jbGVhbnVwSW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5jbGVhbnVwSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5jbGVhbnVwSW50ZXJ2YWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYW4gdXAgZXhwaXJlZCBlbnRyaWVzXG4gICAgICovXG4gICAgY2xlYW51cEV4cGlyZWQoKSB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGNvbnN0IGtleXNUb0RlbGV0ZSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIGVudHJ5XSBvZiB0aGlzLmNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoZW50cnkuZXhwaXJlc0F0ICYmIGVudHJ5LmV4cGlyZXNBdCA8IG5vdykge1xuICAgICAgICAgICAgICAgIGtleXNUb0RlbGV0ZS5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5c1RvRGVsZXRlKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgaWYgKHRoaXMuYmFja2VuZCAhPT0gJ21lbW9yeScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUZyb21TdG9yYWdlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleXNUb0RlbGV0ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsb2dnaW5nU2VydmljZS5kZWJ1ZyhgQ2xlYW5lZCB1cCAke2tleXNUb0RlbGV0ZS5sZW5ndGh9IGV4cGlyZWQgY2FjaGUgZW50cmllc2AsICdDYWNoZVNlcnZpY2UnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkIGZyb20gcGVyc2lzdGVudCBzdG9yYWdlXG4gICAgICovXG4gICAgbG9hZEZyb21TdG9yYWdlKCkge1xuICAgICAgICBpZiAodGhpcy5iYWNrZW5kID09PSAnbG9jYWxTdG9yYWdlJykge1xuICAgICAgICAgICAgdGhpcy5sb2FkRnJvbUxvY2FsU3RvcmFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuYmFja2VuZCA9PT0gJ2luZGV4ZWREQicpIHtcbiAgICAgICAgICAgIC8vIEluZGV4ZWREQiBsb2FkaW5nIHdvdWxkIGJlIGFzeW5jLCBoYW5kbGVkIHNlcGFyYXRlbHlcbiAgICAgICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmluZm8oJ0luZGV4ZWREQiBiYWNrZW5kIG5vdCB5ZXQgaW1wbGVtZW50ZWQnLCAnQ2FjaGVTZXJ2aWNlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICAqL1xuICAgIGxvYWRGcm9tTG9jYWxTdG9yYWdlKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gYGNhY2hlOiR7dGhpcy5uYW1lc3BhY2V9OmA7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsU3RvcmFnZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGxvY2FsU3RvcmFnZS5rZXkoaSk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSAmJiBrZXkuc3RhcnRzV2l0aChwcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbnRyeSA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBrZXkuc3Vic3RyaW5nKGBjYWNoZTpgLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlLnNldChjYWNoZUtleSwgZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nZ2luZ1NlcnZpY2UuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGNhY2hlIGZyb20gbG9jYWxTdG9yYWdlJywgJ0NhY2hlU2VydmljZScsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJzaXN0IHRvIHN0b3JhZ2VcbiAgICAgKi9cbiAgICBwZXJzaXN0VG9TdG9yYWdlKGtleSwgZW50cnkpIHtcbiAgICAgICAgaWYgKHRoaXMuYmFja2VuZCA9PT0gJ2xvY2FsU3RvcmFnZScpIHtcbiAgICAgICAgICAgIHRoaXMucGVyc2lzdFRvTG9jYWxTdG9yYWdlKGtleSwgZW50cnkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcnNpc3QgdG8gbG9jYWxTdG9yYWdlXG4gICAgICovXG4gICAgcGVyc2lzdFRvTG9jYWxTdG9yYWdlKGtleSwgZW50cnkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGBjYWNoZToke2tleX1gLCBKU09OLnN0cmluZ2lmeShlbnRyeSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nZ2luZ1NlcnZpY2UuZXJyb3IoJ0ZhaWxlZCB0byBwZXJzaXN0IHRvIGxvY2FsU3RvcmFnZScsICdDYWNoZVNlcnZpY2UnLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIGZyb20gc3RvcmFnZVxuICAgICAqL1xuICAgIGRlbGV0ZUZyb21TdG9yYWdlKGtleSkge1xuICAgICAgICBpZiAodGhpcy5iYWNrZW5kID09PSAnbG9jYWxTdG9yYWdlJykge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYGNhY2hlOiR7a2V5fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIHN0b3JhZ2VcbiAgICAgKi9cbiAgICBjbGVhclN0b3JhZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmJhY2tlbmQgPT09ICdsb2NhbFN0b3JhZ2UnKSB7XG4gICAgICAgICAgICBjb25zdCBwcmVmaXggPSBgY2FjaGU6JHt0aGlzLm5hbWVzcGFjZX06YDtcbiAgICAgICAgICAgIGNvbnN0IGtleXNUb0RlbGV0ZSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkgJiYga2V5LnN0YXJ0c1dpdGgocHJlZml4KSkge1xuICAgICAgICAgICAgICAgICAgICBrZXlzVG9EZWxldGUucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXNUb0RlbGV0ZSkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogV2FybSBjYWNoZSB3aXRoIGRhdGFcbiAgICAgKi9cbiAgICBhc3luYyB3YXJtKGtleXMsIGZhY3RvcnksIHR0bCkge1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IGtleXMubWFwKGFzeW5jIChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgZmFjdG9yeShrZXkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUsIHR0bCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmluZm8oYENhY2hlIHdhcm1lZCB3aXRoICR7a2V5cy5sZW5ndGh9IGVudHJpZXNgLCAnQ2FjaGVTZXJ2aWNlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNodXRkb3duIGNhY2hlIHNlcnZpY2VcbiAgICAgKi9cbiAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgdGhpcy5zdG9wQ2xlYW51cCgpO1xuICAgICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICAgIGxvZ2dpbmdTZXJ2aWNlLmluZm8oJ0NhY2hlIHNlcnZpY2Ugc2h1dCBkb3duJywgJ0NhY2hlU2VydmljZScpO1xuICAgIH1cbn1cbi8qKlxuICogR2xvYmFsIGNhY2hlIHNlcnZpY2UgaW5zdGFuY2VcbiAqL1xuZXhwb3J0IGNvbnN0IGNhY2hlU2VydmljZSA9IG5ldyBDYWNoZVNlcnZpY2Uoe1xuICAgIHN0cmF0ZWd5OiAnTFJVJyxcbiAgICBiYWNrZW5kOiAnbWVtb3J5JyxcbiAgICBtYXhTaXplOiAxMDAwLFxuICAgIG1heE1lbW9yeU1COiAxMDAsXG4gICAgZGVmYXVsdFRUTDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICBlbmFibGVTdGF0czogdHJ1ZSxcbiAgICBuYW1lc3BhY2U6ICdhcHAnLFxufSk7XG4vKipcbiAqIERlZmF1bHQgZXhwb3J0IGZvciBiZXR0ZXIgQ29tbW9uSlMgY29tcGF0aWJpbGl0eVxuICovXG5leHBvcnQgZGVmYXVsdCBDYWNoZVNlcnZpY2U7XG4iLCIvKipcbiAqIE5vdGlmaWNhdGlvbiBTZXJ2aWNlXG4gKiBDZW50cmFsaXplZCBub3RpZmljYXRpb24gbWFuYWdlbWVudCB3aXRoIHRvYXN0IG5vdGlmaWNhdGlvbnMgYW5kIHN5c3RlbSB0cmF5IGludGVncmF0aW9uXG4gKi9cbmltcG9ydCB7IHVzZU5vdGlmaWNhdGlvblN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlTm90aWZpY2F0aW9uU3RvcmUnO1xuLyoqXG4gKiBOb3RpZmljYXRpb24gU2VydmljZSBDbGFzc1xuICogUHJvdmlkZXMgYSBjbGFzcy1iYXNlZCBBUEkgZm9yIG5vdGlmaWNhdGlvbiBtYW5hZ2VtZW50XG4gKi9cbmNsYXNzIE5vdGlmaWNhdGlvblNlcnZpY2Uge1xuICAgIHN0b3JlID0gdXNlTm90aWZpY2F0aW9uU3RvcmU7XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFRvYXN0IE5vdGlmaWNhdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogU2hvdyBhIHN1Y2Nlc3MgdG9hc3Qgbm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgc2hvd1N1Y2Nlc3MobWVzc2FnZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLnNob3dTdWNjZXNzKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGFuIGVycm9yIHRvYXN0IG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIHNob3dFcnJvcihtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuc2hvd0Vycm9yKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGEgd2FybmluZyB0b2FzdCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBzaG93V2FybmluZyhtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuc2hvd1dhcm5pbmcobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgYW4gaW5mbyB0b2FzdCBub3RpZmljYXRpb25cbiAgICAgKi9cbiAgICBzaG93SW5mbyhtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuc2hvd0luZm8obWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgYSB0b2FzdCBub3RpZmljYXRpb24gd2l0aCBjdXN0b20gdHlwZVxuICAgICAqL1xuICAgIHNob3dUb2FzdCh0eXBlLCBtZXNzYWdlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuc2hvd1RvYXN0KHR5cGUsIG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNtaXNzIGEgc3BlY2lmaWMgdG9hc3RcbiAgICAgKi9cbiAgICBkaXNtaXNzVG9hc3QoaWQpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmRpc21pc3NUb2FzdChpZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc21pc3MgYWxsIGFjdGl2ZSB0b2FzdHNcbiAgICAgKi9cbiAgICBkaXNtaXNzQWxsVG9hc3RzKCkge1xuICAgICAgICB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZGlzbWlzc0FsbFRvYXN0cygpO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gTm90aWZpY2F0aW9uIENlbnRlclxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBBZGQgYSBub3RpZmljYXRpb24gdG8gdGhlIG5vdGlmaWNhdGlvbiBjZW50ZXJcbiAgICAgKi9cbiAgICBhZGROb3RpZmljYXRpb24obm90aWZpY2F0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuYWRkTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgbm90aWZpY2F0aW9uc1xuICAgICAqL1xuICAgIGdldE5vdGlmaWNhdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZ2V0Tm90aWZpY2F0aW9ucygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgZmlsdGVyZWQgbm90aWZpY2F0aW9uc1xuICAgICAqL1xuICAgIGdldEZpbHRlcmVkTm90aWZpY2F0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5nZXRGaWx0ZXJlZE5vdGlmaWNhdGlvbnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWFyayBhIG5vdGlmaWNhdGlvbiBhcyByZWFkXG4gICAgICovXG4gICAgbWFya0FzUmVhZChpZCkge1xuICAgICAgICB0aGlzLnN0b3JlLmdldFN0YXRlKCkubWFya0FzUmVhZChpZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1hcmsgYWxsIG5vdGlmaWNhdGlvbnMgYXMgcmVhZFxuICAgICAqL1xuICAgIG1hcmtBbGxBc1JlYWQoKSB7XG4gICAgICAgIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5tYXJrQWxsQXNSZWFkKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBhIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIGRlbGV0ZU5vdGlmaWNhdGlvbihpZCkge1xuICAgICAgICB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZGVsZXRlTm90aWZpY2F0aW9uKGlkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBjbGVhckFsbCgpIHtcbiAgICAgICAgdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmNsZWFyQWxsKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBpbi91bnBpbiBhIG5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIHBpbk5vdGlmaWNhdGlvbihpZCwgcGlubmVkKSB7XG4gICAgICAgIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKS5waW5Ob3RpZmljYXRpb24oaWQsIHBpbm5lZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBub3RpZmljYXRpb24gc3RhdGlzdGljc1xuICAgICAqL1xuICAgIGdldFN0YXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5nZXRTdGF0ZSgpLmdldFN0YXRzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB1bnJlYWQgbm90aWZpY2F0aW9uIGNvdW50XG4gICAgICovXG4gICAgZ2V0VW5yZWFkQ291bnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKCkuZ2V0VW5yZWFkQ291bnQoKTtcbiAgICB9XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFN5c3RlbSBUcmF5IE5vdGlmaWNhdGlvbnMgKEVsZWN0cm9uKVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBTaG93IGEgc3lzdGVtIHRyYXkgbm90aWZpY2F0aW9uIChFbGVjdHJvbiBuYXRpdmUpXG4gICAgICovXG4gICAgYXN5bmMgc2hvd1N5c3RlbU5vdGlmaWNhdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHsgdGl0bGUsIGJvZHksIGljb24sIHNpbGVudCwgb25DbGljayB9ID0gb3B0aW9ucztcbiAgICAgICAgLy8gQ2hlY2sgaWYgTm90aWZpY2F0aW9uIEFQSSBpcyBhdmFpbGFibGVcbiAgICAgICAgaWYgKCEoJ05vdGlmaWNhdGlvbicgaW4gd2luZG93KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdTeXN0ZW0gbm90aWZpY2F0aW9ucyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZXF1ZXN0IHBlcm1pc3Npb24gaWYgbmVlZGVkXG4gICAgICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICBjb25zdCBwZXJtaXNzaW9uID0gYXdhaXQgTm90aWZpY2F0aW9uLnJlcXVlc3RQZXJtaXNzaW9uKCk7XG4gICAgICAgICAgICBpZiAocGVybWlzc2lvbiAhPT0gJ2dyYW50ZWQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdOb3RpZmljYXRpb24gcGVybWlzc2lvbiBkZW5pZWQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE5vdGlmaWNhdGlvbi5wZXJtaXNzaW9uID09PSAnZ3JhbnRlZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24odGl0bGUsIHtcbiAgICAgICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgICAgIGljb246IGljb24gfHwgJy9pY29uLnBuZycsXG4gICAgICAgICAgICAgICAgc2lsZW50OiBzaWxlbnQgPz8gZmFsc2UsXG4gICAgICAgICAgICAgICAgdGFnOiAnbWFuZGEtZGlzY292ZXJ5JywgLy8gUHJldmVudHMgZHVwbGljYXRlIG5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ub25jbGljayA9IG9uQ2xpY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBdXRvLWNsb3NlIGFmdGVyIDUgc2Vjb25kc1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBub3RpZmljYXRpb24uY2xvc2UoKSwgNTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBzeXN0ZW0gbm90aWZpY2F0aW9uIGZvciBzdWNjZXNzXG4gICAgICovXG4gICAgYXN5bmMgc2hvd1N5c3RlbVN1Y2Nlc3ModGl0bGUsIGJvZHkpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zaG93U3lzdGVtTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIGljb246ICcvaWNvbnMvc3VjY2Vzcy5wbmcnLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBzeXN0ZW0gbm90aWZpY2F0aW9uIGZvciBlcnJvclxuICAgICAqL1xuICAgIGFzeW5jIHNob3dTeXN0ZW1FcnJvcih0aXRsZSwgYm9keSkge1xuICAgICAgICBhd2FpdCB0aGlzLnNob3dTeXN0ZW1Ob3RpZmljYXRpb24oe1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgaWNvbjogJy9pY29ucy9lcnJvci5wbmcnLFxuICAgICAgICAgICAgc2lsZW50OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgc3lzdGVtIG5vdGlmaWNhdGlvbiBmb3Igd2FybmluZ1xuICAgICAqL1xuICAgIGFzeW5jIHNob3dTeXN0ZW1XYXJuaW5nKHRpdGxlLCBib2R5KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2hvd1N5c3RlbU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBpY29uOiAnL2ljb25zL3dhcm5pbmcucG5nJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgc3lzdGVtIG5vdGlmaWNhdGlvbiBmb3IgaW5mb1xuICAgICAqL1xuICAgIGFzeW5jIHNob3dTeXN0ZW1JbmZvKHRpdGxlLCBib2R5KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2hvd1N5c3RlbU5vdGlmaWNhdGlvbih7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBpY29uOiAnL2ljb25zL2luZm8ucG5nJyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBDb252ZW5pZW5jZSBNZXRob2RzXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIFNob3cgbm90aWZpY2F0aW9uIGZvciBQb3dlclNoZWxsIGV4ZWN1dGlvbiBjb21wbGV0aW9uXG4gICAgICovXG4gICAgbm90aWZ5RXhlY3V0aW9uQ29tcGxldGUoc2NyaXB0TmFtZSwgc3VjY2VzcywgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHN1Y2Nlc3NcbiAgICAgICAgICAgID8gYFNjcmlwdCBcIiR7c2NyaXB0TmFtZX1cIiBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5IGluICR7KGR1cmF0aW9uIC8gMTAwMCkudG9GaXhlZCgxKX1zYFxuICAgICAgICAgICAgOiBgU2NyaXB0IFwiJHtzY3JpcHROYW1lfVwiIGZhaWxlZGA7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBzdWNjZXNzID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJztcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvd1RvYXN0KHR5cGUsIG1lc3NhZ2UsIHtcbiAgICAgICAgICAgIGR1cmF0aW9uOiBzdWNjZXNzID8gNTAwMCA6IDAsIC8vIEVycm9ycyBkb24ndCBhdXRvLWRpc21pc3NcbiAgICAgICAgICAgIGFjdGlvbnM6IHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICA/IFtdXG4gICAgICAgICAgICAgICAgOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmlldyBEZXRhaWxzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOYXZpZ2F0ZSB0byBleGVjdXRpb24gbG9nIG9yIHNob3cgZGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdWaWV3IGV4ZWN1dGlvbiBkZXRhaWxzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ3ByaW1hcnknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzbWlzc09uQ2xpY2s6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgbm90aWZpY2F0aW9uIGZvciBkaXNjb3ZlcnkgY29tcGxldGlvblxuICAgICAqL1xuICAgIG5vdGlmeURpc2NvdmVyeUNvbXBsZXRlKGRpc2NvdmVyeVR5cGUsIGl0ZW1zRm91bmQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvd1N1Y2Nlc3MoYCR7ZGlzY292ZXJ5VHlwZX0gZGlzY292ZXJ5IGNvbXBsZXRlOiAke2l0ZW1zRm91bmR9IGl0ZW1zIGZvdW5kYCwge1xuICAgICAgICAgICAgZHVyYXRpb246IDcwMDAsXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgUmVzdWx0cycsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5hdmlnYXRlIHRvIGRpc2NvdmVyeSByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTmF2aWdhdGUgdG8gZGlzY292ZXJ5IHJlc3VsdHMnKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudDogJ3ByaW1hcnknLFxuICAgICAgICAgICAgICAgICAgICBkaXNtaXNzT25DbGljazogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgbm90aWZpY2F0aW9uIGZvciBtaWdyYXRpb24gcHJvZ3Jlc3NcbiAgICAgKi9cbiAgICBub3RpZnlNaWdyYXRpb25Qcm9ncmVzcyh3YXZlTmFtZSwgcHJvZ3Jlc3MsIHN0YXR1cykge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gYE1pZ3JhdGlvbiB3YXZlIFwiJHt3YXZlTmFtZX1cIjogJHtwcm9ncmVzc30lIGNvbXBsZXRlYDtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0luZm8obWVzc2FnZSwge1xuICAgICAgICAgICAgZHVyYXRpb246IDAsIC8vIERvbid0IGF1dG8tZGlzbWlzcyBkdXJpbmcgbWlncmF0aW9uXG4gICAgICAgICAgICBzaG93UHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZpZXcgRGV0YWlscycsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5hdmlnYXRlIHRvIG1pZ3JhdGlvbiBleGVjdXRpb24gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05hdmlnYXRlIHRvIG1pZ3JhdGlvbiB2aWV3Jyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdwcmltYXJ5JyxcbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc09uQ2xpY2s6IGZhbHNlLCAvLyBLZWVwIG5vdGlmaWNhdGlvbiBvcGVuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG5vdGlmaWNhdGlvbiBmb3IgdmFsaWRhdGlvbiBlcnJvcnNcbiAgICAgKi9cbiAgICBub3RpZnlWYWxpZGF0aW9uRXJyb3JzKGVycm9yQ291bnQsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvd0Vycm9yKGAke2Vycm9yQ291bnR9IHZhbGlkYXRpb24gZXJyb3Ike2Vycm9yQ291bnQgPiAxID8gJ3MnIDogJyd9IGZvdW5kIGluICR7Y29udGV4dH1gLCB7XG4gICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRml4IEVycm9ycycsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5hdmlnYXRlIHRvIHZhbGlkYXRpb24gdmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05hdmlnYXRlIHRvIHZhbGlkYXRpb24gdmlldycpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnZGFuZ2VyJyxcbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc09uQ2xpY2s6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gc3RvcmUgY2hhbmdlc1xuICAgICAqL1xuICAgIHN1YnNjcmliZShjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5zdWJzY3JpYmUoY2FsbGJhY2spO1xuICAgIH1cbn1cbi8vIEV4cG9ydCBzaW5nbGV0b24gaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBub3RpZmljYXRpb25TZXJ2aWNlID0gbmV3IE5vdGlmaWNhdGlvblNlcnZpY2UoKTtcbi8vIEV4cG9ydCBjbGFzcyBmb3IgdGVzdGluZyBvciBjdXN0b20gaW5zdGFuY2VzXG5leHBvcnQgZGVmYXVsdCBOb3RpZmljYXRpb25TZXJ2aWNlO1xuIiwiLyoqXG4gKiBQcm9ncmVzcyBTZXJ2aWNlXG4gKiBHbG9iYWwgcHJvZ3Jlc3MgdHJhY2tpbmcgZm9yIGxvbmctcnVubmluZyBvcGVyYXRpb25zXG4gKiBTdXBwb3J0cyBpbmRldGVybWluYXRlL2RldGVybWluYXRlIHByb2dyZXNzLCBtdWx0aS10YXNrIHRyYWNraW5nLCBoaWVyYXJjaGljYWwgcHJvZ3Jlc3NcbiAqL1xuaW1wb3J0IHsgbm90aWZpY2F0aW9uU2VydmljZSB9IGZyb20gJy4vbm90aWZpY2F0aW9uU2VydmljZSc7XG4vKipcbiAqIFByb2dyZXNzIFNlcnZpY2UgQ2xhc3NcbiAqL1xuY2xhc3MgUHJvZ3Jlc3NTZXJ2aWNlIHtcbiAgICB0YXNrcyA9IG5ldyBNYXAoKTtcbiAgICBsaXN0ZW5lcnMgPSBuZXcgU2V0KCk7XG4gICAgaGlzdG9yeUxpbWl0ID0gNTA7XG4gICAgaGlzdG9yeSA9IFtdO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUYXNrIE1hbmFnZW1lbnRcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogU3RhcnQgYSBuZXcgcHJvZ3Jlc3MgdGFza1xuICAgICAqL1xuICAgIHN0YXJ0VGFzayh0aXRsZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMuZ2VuZXJhdGVUYXNrSWQoKTtcbiAgICAgICAgY29uc3QgdGFzayA9IHtcbiAgICAgICAgICAgIGlkOiB0YXNrSWQsXG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBvcHRpb25zLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgc3RhdHVzOiAncnVubmluZycsXG4gICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUgfHwgJ2luZGV0ZXJtaW5hdGUnLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogb3B0aW9ucy50eXBlID09PSAnZGV0ZXJtaW5hdGUnID8gMCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRvdGFsSXRlbXM6IG9wdGlvbnMudG90YWxJdGVtcyxcbiAgICAgICAgICAgIGl0ZW1zUHJvY2Vzc2VkOiAwLFxuICAgICAgICAgICAgc3RhcnRUaW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgY2FuY2VsbGFibGU6IG9wdGlvbnMuY2FuY2VsbGFibGUgPz8gZmFsc2UsXG4gICAgICAgICAgICBvbkNhbmNlbDogb3B0aW9ucy5vbkNhbmNlbCxcbiAgICAgICAgICAgIHN1YnRhc2tzOiBbXSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50YXNrcy5zZXQodGFza0lkLCB0YXNrKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICAgICAgLy8gU2hvdyBub3RpZmljYXRpb24gaWYgcmVxdWVzdGVkXG4gICAgICAgIGlmIChvcHRpb25zLm5vdGlmaWNhdGlvbj8uc2hvd1RvYXN0KSB7XG4gICAgICAgICAgICBub3RpZmljYXRpb25TZXJ2aWNlLnNob3dJbmZvKGBTdGFydGVkOiAke3RpdGxlfWAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMzAwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXNrSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB0YXNrIHByb2dyZXNzXG4gICAgICovXG4gICAgdXBkYXRlUHJvZ3Jlc3ModGFza0lkLCB1cGRhdGUpIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmICghdGFzaylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gVXBkYXRlIHRhc2tcbiAgICAgICAgaWYgKHVwZGF0ZS5wZXJjZW50YWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhc2sucGVyY2VudGFnZSA9IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgdXBkYXRlLnBlcmNlbnRhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlLmN1cnJlbnRJdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhc2suY3VycmVudEl0ZW0gPSB1cGRhdGUuY3VycmVudEl0ZW07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZS5pdGVtc1Byb2Nlc3NlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0YXNrLml0ZW1zUHJvY2Vzc2VkID0gdXBkYXRlLml0ZW1zUHJvY2Vzc2VkO1xuICAgICAgICAgICAgLy8gQXV0by1jYWxjdWxhdGUgcGVyY2VudGFnZSBpZiB0b3RhbEl0ZW1zIGlzIGtub3duXG4gICAgICAgICAgICBpZiAodGFzay50b3RhbEl0ZW1zICYmIHRhc2sudHlwZSA9PT0gJ2RldGVybWluYXRlJykge1xuICAgICAgICAgICAgICAgIHRhc2sucGVyY2VudGFnZSA9IE1hdGgucm91bmQoKHVwZGF0ZS5pdGVtc1Byb2Nlc3NlZCAvIHRhc2sudG90YWxJdGVtcykgKiAxMDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIENhbGN1bGF0ZSBlc3RpbWF0ZWQgdGltZSByZW1haW5pbmdcbiAgICAgICAgaWYgKHRhc2sucGVyY2VudGFnZSAmJiB0YXNrLnBlcmNlbnRhZ2UgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gRGF0ZS5ub3coKSAtIHRhc2suc3RhcnRUaW1lLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGNvbnN0IGVzdGltYXRlZFRvdGFsID0gKGVsYXBzZWQgLyB0YXNrLnBlcmNlbnRhZ2UpICogMTAwO1xuICAgICAgICAgICAgdGFzay5lc3RpbWF0ZWRUaW1lUmVtYWluaW5nID0gZXN0aW1hdGVkVG90YWwgLSBlbGFwc2VkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbXBsZXRlIGEgdGFza1xuICAgICAqL1xuICAgIGNvbXBsZXRlVGFzayh0YXNrSWQsIG5vdGlmaWNhdGlvbikge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5nZXQodGFza0lkKTtcbiAgICAgICAgaWYgKCF0YXNrKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0YXNrLnN0YXR1cyA9ICdjb21wbGV0ZWQnO1xuICAgICAgICB0YXNrLmVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0YXNrLnBlcmNlbnRhZ2UgPSAxMDA7XG4gICAgICAgIHRoaXMubW92ZVRvSGlzdG9yeSh0YXNrKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICAgICAgLy8gU2hvdyBub3RpZmljYXRpb25cbiAgICAgICAgaWYgKG5vdGlmaWNhdGlvbj8uc2hvd1RvYXN0KSB7XG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9ICh0YXNrLmVuZFRpbWUuZ2V0VGltZSgpIC0gdGFzay5zdGFydFRpbWUuZ2V0VGltZSgpKSAvIDEwMDA7XG4gICAgICAgICAgICBub3RpZmljYXRpb25TZXJ2aWNlLnNob3dTdWNjZXNzKGBDb21wbGV0ZWQ6ICR7dGFzay50aXRsZX0gKCR7ZHVyYXRpb24udG9GaXhlZCgxKX1zKWAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNTAwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZhaWwgYSB0YXNrXG4gICAgICovXG4gICAgZmFpbFRhc2sodGFza0lkLCBlcnJvciwgbm90aWZpY2F0aW9uKSB7XG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tzLmdldCh0YXNrSWQpO1xuICAgICAgICBpZiAoIXRhc2spXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRhc2suc3RhdHVzID0gJ2ZhaWxlZCc7XG4gICAgICAgIHRhc2suZW5kVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHRhc2suZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgdGhpcy5tb3ZlVG9IaXN0b3J5KHRhc2spO1xuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgICAgICAvLyBTaG93IG5vdGlmaWNhdGlvblxuICAgICAgICBpZiAobm90aWZpY2F0aW9uPy5zaG93VG9hc3QpIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvblNlcnZpY2Uuc2hvd0Vycm9yKGBGYWlsZWQ6ICR7dGFzay50aXRsZX0gLSAke2Vycm9yfWAsIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCwgLy8gRG9uJ3QgYXV0by1kaXNtaXNzIGVycm9yc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2FuY2VsIGEgdGFza1xuICAgICAqL1xuICAgIGNhbmNlbFRhc2sodGFza0lkLCBub3RpZmljYXRpb24pIHtcbiAgICAgICAgY29uc3QgdGFzayA9IHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgICAgIGlmICghdGFzaylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKCF0YXNrLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFRhc2sgJHt0YXNrSWR9IGlzIG5vdCBjYW5jZWxsYWJsZWApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIENhbGwgY2FuY2VsIGhhbmRsZXJcbiAgICAgICAgaWYgKHRhc2sub25DYW5jZWwpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFzay5vbkNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY2FsbGluZyBvbkNhbmNlbCBoYW5kbGVyOicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0YXNrLnN0YXR1cyA9ICdjYW5jZWxsZWQnO1xuICAgICAgICB0YXNrLmVuZFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB0aGlzLm1vdmVUb0hpc3RvcnkodGFzayk7XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgICAgIC8vIFNob3cgbm90aWZpY2F0aW9uXG4gICAgICAgIGlmIChub3RpZmljYXRpb24/LnNob3dUb2FzdCkge1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uU2VydmljZS5zaG93V2FybmluZyhgQ2FuY2VsbGVkOiAke3Rhc2sudGl0bGV9YCwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAzMDAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgdGFzayAoZm9yIGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkIHRhc2tzKVxuICAgICAqL1xuICAgIHJlbW92ZVRhc2sodGFza0lkKSB7XG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tzLmdldCh0YXNrSWQpO1xuICAgICAgICBpZiAodGFzayAmJiB0YXNrLnN0YXR1cyA9PT0gJ3J1bm5pbmcnKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Nhbm5vdCByZW1vdmUgcnVubmluZyB0YXNrLiBDYW5jZWwgb3IgY29tcGxldGUgaXQgZmlyc3QuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50YXNrcy5kZWxldGUodGFza0lkKTtcbiAgICAgICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xlYXIgYWxsIGNvbXBsZXRlZC9mYWlsZWQvY2FuY2VsbGVkIHRhc2tzXG4gICAgICovXG4gICAgY2xlYXJDb21wbGV0ZWRUYXNrcygpIHtcbiAgICAgICAgY29uc3QgdG9SZW1vdmUgPSBbXTtcbiAgICAgICAgdGhpcy50YXNrcy5mb3JFYWNoKCh0YXNrLCBpZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRhc2suc3RhdHVzICE9PSAncnVubmluZycpIHtcbiAgICAgICAgICAgICAgICB0b1JlbW92ZS5wdXNoKGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRvUmVtb3ZlLmZvckVhY2goKGlkKSA9PiB0aGlzLnRhc2tzLmRlbGV0ZShpZCkpO1xuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSGllcmFyY2hpY2FsIFByb2dyZXNzIChTdWJ0YXNrcylcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQWRkIGEgc3VidGFzayB0byBhIHBhcmVudCB0YXNrXG4gICAgICovXG4gICAgYWRkU3VidGFzayh0YXNrSWQsIHN1YnRhc2tUaXRsZSkge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5nZXQodGFza0lkKTtcbiAgICAgICAgaWYgKCF0YXNrKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICBjb25zdCBzdWJ0YXNrSWQgPSBgJHt0YXNrSWR9LXN1Yi0ke3Rhc2suc3VidGFza3MubGVuZ3RofWA7XG4gICAgICAgIGNvbnN0IHN1YnRhc2sgPSB7XG4gICAgICAgICAgICBpZDogc3VidGFza0lkLFxuICAgICAgICAgICAgdGl0bGU6IHN1YnRhc2tUaXRsZSxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgfTtcbiAgICAgICAgdGFzay5zdWJ0YXNrcy5wdXNoKHN1YnRhc2spO1xuICAgICAgICB0aGlzLm5vdGlmeUxpc3RlbmVycygpO1xuICAgICAgICByZXR1cm4gc3VidGFza0lkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc3VidGFzayBwcm9ncmVzc1xuICAgICAqL1xuICAgIHVwZGF0ZVN1YnRhc2sodGFza0lkLCBzdWJ0YXNrSWQsIHVwZGF0ZSkge1xuICAgICAgICBjb25zdCB0YXNrID0gdGhpcy50YXNrcy5nZXQodGFza0lkKTtcbiAgICAgICAgaWYgKCF0YXNrKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBzdWJ0YXNrID0gdGFzay5zdWJ0YXNrcy5maW5kKChzdCkgPT4gc3QuaWQgPT09IHN1YnRhc2tJZCk7XG4gICAgICAgIGlmICghc3VidGFzaylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHVwZGF0ZS5wZXJjZW50YWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1YnRhc2sucGVyY2VudGFnZSA9IHVwZGF0ZS5wZXJjZW50YWdlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGUuc3RhdHVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN1YnRhc2suc3RhdHVzID0gdXBkYXRlLnN0YXR1cztcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWNhbGN1bGF0ZSBwYXJlbnQgdGFzayBwZXJjZW50YWdlIGJhc2VkIG9uIHN1YnRhc2tzXG4gICAgICAgIGlmICh0YXNrLnN1YnRhc2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsUGVyY2VudGFnZSA9IHRhc2suc3VidGFza3MucmVkdWNlKChzdW0sIHN0KSA9PiBzdW0gKyBzdC5wZXJjZW50YWdlLCAwKTtcbiAgICAgICAgICAgIHRhc2sucGVyY2VudGFnZSA9IE1hdGgucm91bmQodG90YWxQZXJjZW50YWdlIC8gdGFzay5zdWJ0YXNrcy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKCk7XG4gICAgfVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBRdWVyaWVzXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgYWN0aXZlIHRhc2tzXG4gICAgICovXG4gICAgZ2V0VGFza3MoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMudGFza3MudmFsdWVzKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBzcGVjaWZpYyB0YXNrXG4gICAgICovXG4gICAgZ2V0VGFzayh0YXNrSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFza3MuZ2V0KHRhc2tJZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBydW5uaW5nIHRhc2tzXG4gICAgICovXG4gICAgZ2V0UnVubmluZ1Rhc2tzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUYXNrcygpLmZpbHRlcigodCkgPT4gdC5zdGF0dXMgPT09ICdydW5uaW5nJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGFueSB0YXNrcyBhcmUgcnVubmluZ1xuICAgICAqL1xuICAgIGhhc1J1bm5pbmdUYXNrcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UnVubmluZ1Rhc2tzKCkubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRhc2sgY291bnQgYnkgc3RhdHVzXG4gICAgICovXG4gICAgZ2V0VGFza0NvdW50KHN0YXR1cykge1xuICAgICAgICBpZiAoIXN0YXR1cylcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhc2tzLnNpemU7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRhc2tzKCkuZmlsdGVyKCh0KSA9PiB0LnN0YXR1cyA9PT0gc3RhdHVzKS5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0YXNrIGhpc3RvcnlcbiAgICAgKi9cbiAgICBnZXRIaXN0b3J5KCkge1xuICAgICAgICByZXR1cm4gWy4uLnRoaXMuaGlzdG9yeV07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsZWFyIGhpc3RvcnlcbiAgICAgKi9cbiAgICBjbGVhckhpc3RvcnkoKSB7XG4gICAgICAgIHRoaXMuaGlzdG9yeSA9IFtdO1xuICAgIH1cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gQ29udmVuaWVuY2UgTWV0aG9kc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBSdW4gYSB0YXNrIHdpdGggYXV0b21hdGljIHByb2dyZXNzIHRyYWNraW5nXG4gICAgICovXG4gICAgYXN5bmMgcnVuVGFzayh0aXRsZSwgYXN5bmNGbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMuc3RhcnRUYXNrKHRpdGxlLCB7XG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgdHlwZTogJ2RldGVybWluYXRlJyxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVQcm9ncmVzcyA9IChwZXJjZW50YWdlLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcm9ncmVzcyh0YXNrSWQsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW06IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXN5bmNGbih1cGRhdGVQcm9ncmVzcyk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlVGFzayh0YXNrSWQsIG9wdGlvbnMubm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmZhaWxUYXNrKHRhc2tJZCwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcicsIG9wdGlvbnMubm90aWZpY2F0aW9uKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYWNrIFBvd2VyU2hlbGwgc2NyaXB0IGV4ZWN1dGlvblxuICAgICAqL1xuICAgIHRyYWNrU2NyaXB0RXhlY3V0aW9uKHNjcmlwdE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydFRhc2soYEV4ZWN1dGluZyAke3NjcmlwdE5hbWV9YCwge1xuICAgICAgICAgICAgdHlwZTogJ2luZGV0ZXJtaW5hdGUnLFxuICAgICAgICAgICAgY2FuY2VsbGFibGU6IG9wdGlvbnMuY2FuY2VsbGFibGUsXG4gICAgICAgICAgICBvbkNhbmNlbDogb3B0aW9ucy5vbkNhbmNlbCxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbjogeyBzaG93VG9hc3Q6IGZhbHNlIH0sIC8vIERvbid0IHNob3cgdG9hc3QgZm9yIHNjcmlwdHNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYWNrIGRpc2NvdmVyeSBvcGVyYXRpb25cbiAgICAgKi9cbiAgICB0cmFja0Rpc2NvdmVyeShkaXNjb3ZlcnlUeXBlLCBleHBlY3RlZEl0ZW1zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0VGFzayhgJHtkaXNjb3ZlcnlUeXBlfSBEaXNjb3ZlcnlgLCB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NjYW5uaW5nIGVudmlyb25tZW50Li4uJyxcbiAgICAgICAgICAgIHR5cGU6IGV4cGVjdGVkSXRlbXMgPyAnZGV0ZXJtaW5hdGUnIDogJ2luZGV0ZXJtaW5hdGUnLFxuICAgICAgICAgICAgdG90YWxJdGVtczogZXhwZWN0ZWRJdGVtcyxcbiAgICAgICAgICAgIGNhbmNlbGxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uOiB7IHNob3dUb2FzdDogdHJ1ZSB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJhY2sgbWlncmF0aW9uIG9wZXJhdGlvblxuICAgICAqL1xuICAgIHRyYWNrTWlncmF0aW9uKHdhdmVOYW1lLCB0b3RhbFVzZXJzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0VGFzayhgTWlncmF0aW5nIFdhdmU6ICR7d2F2ZU5hbWV9YCwge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBQcm9jZXNzaW5nICR7dG90YWxVc2Vyc30gdXNlcnMuLi5gLFxuICAgICAgICAgICAgdHlwZTogJ2RldGVybWluYXRlJyxcbiAgICAgICAgICAgIHRvdGFsSXRlbXM6IHRvdGFsVXNlcnMsXG4gICAgICAgICAgICBjYW5jZWxsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbjogeyBzaG93VG9hc3Q6IHRydWUgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBIZWxwZXJzXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHVuaXF1ZSB0YXNrIElEXG4gICAgICovXG4gICAgZ2VuZXJhdGVUYXNrSWQoKSB7XG4gICAgICAgIHJldHVybiBgdGFzay0ke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmUgdGFzayB0byBoaXN0b3J5XG4gICAgICovXG4gICAgbW92ZVRvSGlzdG9yeSh0YXNrKSB7XG4gICAgICAgIHRoaXMudGFza3MuZGVsZXRlKHRhc2suaWQpO1xuICAgICAgICAvLyBBZGQgdG8gaGlzdG9yeVxuICAgICAgICB0aGlzLmhpc3RvcnkudW5zaGlmdCh0YXNrKTtcbiAgICAgICAgLy8gTGltaXQgaGlzdG9yeSBzaXplXG4gICAgICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gdGhpcy5oaXN0b3J5TGltaXQpIHtcbiAgICAgICAgICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuaGlzdG9yeS5zbGljZSgwLCB0aGlzLmhpc3RvcnlMaW1pdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIHRvIHByb2dyZXNzIHVwZGF0ZXNcbiAgICAgKi9cbiAgICBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuYWRkKGxpc3RlbmVyKTtcbiAgICAgICAgLy8gSW1tZWRpYXRlbHkgbm90aWZ5IHdpdGggY3VycmVudCBzdGF0ZVxuICAgICAgICBsaXN0ZW5lcih0aGlzLmdldFRhc2tzKCkpO1xuICAgICAgICAvLyBSZXR1cm4gdW5zdWJzY3JpYmUgZnVuY3Rpb25cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE5vdGlmeSBhbGwgbGlzdGVuZXJzXG4gICAgICovXG4gICAgbm90aWZ5TGlzdGVuZXJzKCkge1xuICAgICAgICBjb25zdCB0YXNrcyA9IHRoaXMuZ2V0VGFza3MoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIodGFza3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUHJvZ3Jlc3MgbGlzdGVuZXIgZXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4vLyBFeHBvcnQgc2luZ2xldG9uIGluc3RhbmNlXG5leHBvcnQgY29uc3QgcHJvZ3Jlc3NTZXJ2aWNlID0gbmV3IFByb2dyZXNzU2VydmljZSgpO1xuLy8gRXhwb3J0IGNsYXNzIGZvciB0ZXN0aW5nXG5leHBvcnQgZGVmYXVsdCBQcm9ncmVzc1NlcnZpY2U7XG4iLCJpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjYWNoZVNlcnZpY2UgfSBmcm9tIFwiLi4vc2VydmljZXMvY2FjaGVTZXJ2aWNlXCI7XG5pbXBvcnQgeyBwcm9ncmVzc1NlcnZpY2UgfSBmcm9tIFwiLi4vc2VydmljZXMvcHJvZ3Jlc3NTZXJ2aWNlXCI7XG4vKipcbiAqIEVuaGFuY2VkIGdlbmVyaWMgZGlzY292ZXJ5IGhvb2sgd2l0aCBhZHZhbmNlZCBmZWF0dXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlRGlzY292ZXJ5KHR5cGUsIHByb2ZpbGVJZCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgeyBlbmFibGVDYWNoaW5nID0gdHJ1ZSwgY2FjaGVUVEwgPSA1ICogNjAgKiAxMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICBlbmFibGVSZXRyeSA9IHRydWUsIG1heFJldHJpZXMgPSAzLCByZXRyeURlbGF5ID0gMTAwMCwgZW5hYmxlUHJvZ3Jlc3NUcmFja2luZyA9IHRydWUsIGVuYWJsZUNhbmNlbGxhdGlvbiA9IHRydWUsIGluY3JlbWVudGFsID0gZmFsc2UsIGxhc3RNb2RpZmllZCwgdmFsaWRhdGlvblNjaGVtYSwgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICByb3dzOiBbXSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgIGlzQ2FuY2VsbGluZzogZmFsc2UsXG4gICAgICAgIHJldHJ5Q291bnQ6IDAsXG4gICAgICAgIGl0ZW1zUHJvY2Vzc2VkOiAwLFxuICAgIH0pO1xuICAgIGNvbnN0IGJ1ZmZlciA9IHVzZVJlZihbXSk7XG4gICAgY29uc3QgcHJvZ3Jlc3NUYXNrSWQgPSB1c2VSZWYoKTtcbiAgICBjb25zdCBhYm9ydENvbnRyb2xsZXIgPSB1c2VSZWYoKTtcbiAgICBjb25zdCByZXRyeVRpbWVvdXQgPSB1c2VSZWYoKTtcbiAgICBjb25zdCBnZXRDYWNoZUtleSA9IHVzZUNhbGxiYWNrKChhcmdzKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGEgPSB7IHR5cGUsIHByb2ZpbGVJZCwgYXJncywgaW5jcmVtZW50YWwsIGxhc3RNb2RpZmllZCB9O1xuICAgICAgICByZXR1cm4gYGRpc2NvdmVyeToke3R5cGV9OiR7cHJvZmlsZUlkfToke0pTT04uc3RyaW5naWZ5KGtleURhdGEpfWA7XG4gICAgfSwgW3R5cGUsIHByb2ZpbGVJZCwgaW5jcmVtZW50YWwsIGxhc3RNb2RpZmllZF0pO1xuICAgIGNvbnN0IHZhbGlkYXRlUm93ID0gdXNlQ2FsbGJhY2soKHJvdykgPT4ge1xuICAgICAgICBpZiAoIXZhbGlkYXRpb25TY2hlbWEpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gQmFzaWMgdmFsaWRhdGlvbiAtIGNvdWxkIGJlIGVuaGFuY2VkIHdpdGggYSBzY2hlbWEgdmFsaWRhdG9yXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBTaW1wbGUgcmVxdWlyZWQgZmllbGRzIGNoZWNrXG4gICAgICAgICAgICBpZiAodmFsaWRhdGlvblNjaGVtYS5yZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgdmFsaWRhdGlvblNjaGVtYS5yZXF1aXJlZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvd1tmaWVsZF0pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSwgW3ZhbGlkYXRpb25TY2hlbWFdKTtcbiAgICBjb25zdCB0cmFuc2Zvcm1Sb3cgPSB1c2VDYWxsYmFjaygocm93KSA9PiB7XG4gICAgICAgIC8vIEFwcGx5IGRhdGEgdHJhbnNmb3JtYXRpb25zIGlmIG5lZWRlZFxuICAgICAgICBpZiAodmFsaWRhdGlvblNjaGVtYT8udHJhbnNmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdGlvblNjaGVtYS50cmFuc2Zvcm0ocm93KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH0sIFt2YWxpZGF0aW9uU2NoZW1hXSk7XG4gICAgY29uc3Qgc3RhcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgIGlmICghd2luZG93LmVsZWN0cm9uQVBJKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGVycm9yOiBcIkVsZWN0cm9uIEFQSSBub3QgYXZhaWxhYmxlXCIgfSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcHJvZmlsZUlkKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGVycm9yOiBcIk5vIHByb2ZpbGUgc2VsZWN0ZWRcIiB9KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBnZXRDYWNoZUtleShhcmdzKTtcbiAgICAgICAgLy8gQ2hlY2sgY2FjaGUgZmlyc3RcbiAgICAgICAgaWYgKGVuYWJsZUNhY2hpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhY2hlZCA9IGNhY2hlU2VydmljZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcm93czogY2FjaGVkLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgICAgICAgICAgICBjYWNoZUhpdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJ1bjogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VEaXNjb3ZlcnldIENhY2hlIGhpdCBmb3IgJHt0eXBlfWApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJbml0aWFsaXplIHN0YXRlXG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgcm93czogW10sXG4gICAgICAgICAgICBpc1J1bm5pbmc6IHRydWUsXG4gICAgICAgICAgICBpc0NhbmNlbGxpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcmV0cnlDb3VudDogMCxcbiAgICAgICAgICAgIGNhY2hlSGl0OiBmYWxzZSxcbiAgICAgICAgICAgIGN1cnJlbnRJdGVtOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpdGVtc1Byb2Nlc3NlZDogMCxcbiAgICAgICAgICAgIHRvdGFsSXRlbXM6IHVuZGVmaW5lZCxcbiAgICAgICAgfSkpO1xuICAgICAgICBidWZmZXIuY3VycmVudCA9IFtdO1xuICAgICAgICBhYm9ydENvbnRyb2xsZXIuY3VycmVudCA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgLy8gU3RhcnQgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICAgICAgaWYgKGVuYWJsZVByb2dyZXNzVHJhY2tpbmcpIHtcbiAgICAgICAgICAgIHByb2dyZXNzVGFza0lkLmN1cnJlbnQgPSBwcm9ncmVzc1NlcnZpY2UudHJhY2tEaXNjb3ZlcnkodHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhlY3V0ZURpc2NvdmVyeSA9IGFzeW5jIChyZXRyeUNvdW50ID0gMCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBVc2UgZXhpc3RpbmcgRWxlY3Ryb24gQVBJIG1ldGhvZHMgLSB0aGUgdHlwZSBlcnJvcnMgYXJlIGR1ZSB0byB0eXBlIG1pc21hdGNoZXNcbiAgICAgICAgICAgICAgICAvLyB0aGF0IG5lZWQgdG8gYmUgcmVzb2x2ZWQgaW4gdGhlIGFjdHVhbCBFbGVjdHJvbiBBUEkgaW1wbGVtZW50YXRpb25cbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuc3RhcnREaXNjb3Zlcnkoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlSWQsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBydW5JZDogcmVzdWx0Py5ydW5JZCB9KSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VEaXNjb3ZlcnldIFN0YXJ0ZWQgJHt0eXBlfSBkaXNjb3Zlcnkgd2l0aCBydW5JZDogJHtyZXN1bHQucnVuSWR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VEaXNjb3ZlcnldICR7dHlwZX0gZGlzY292ZXJ5IHdhcyBjYW5jZWxsZWRgKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbdXNlRGlzY292ZXJ5XSBGYWlsZWQgdG8gc3RhcnQgZGlzY292ZXJ5OmAsIGVycik7XG4gICAgICAgICAgICAgICAgLy8gUmV0cnkgbG9naWNcbiAgICAgICAgICAgICAgICBpZiAoZW5hYmxlUmV0cnkgJiYgcmV0cnlDb3VudCA8IG1heFJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VEaXNjb3ZlcnldIFJldHJ5aW5nICR7dHlwZX0gZGlzY292ZXJ5ICgke3JldHJ5Q291bnQgKyAxfS8ke21heFJldHJpZXN9KS4uLmApO1xuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHJldHJ5Q291bnQ6IHJldHJ5Q291bnQgKyAxIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlUaW1lb3V0LmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVEaXNjb3ZlcnkocmV0cnlDb3VudCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9LCByZXRyeURlbGF5ICogTWF0aC5wb3coMiwgcmV0cnlDb3VudCkpOyAvLyBFeHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyLm1lc3NhZ2UgfHwgXCJGYWlsZWQgdG8gc3RhcnQgZGlzY292ZXJ5XCIsXG4gICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzU2VydmljZS5mYWlsVGFzayhwcm9ncmVzc1Rhc2tJZC5jdXJyZW50LCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBhd2FpdCBleGVjdXRlRGlzY292ZXJ5KCk7XG4gICAgfSwgW3R5cGUsIHByb2ZpbGVJZCwgZW5hYmxlQ2FjaGluZywgZW5hYmxlUmV0cnksIG1heFJldHJpZXMsIHJldHJ5RGVsYXksIGVuYWJsZVByb2dyZXNzVHJhY2tpbmcsIGdldENhY2hlS2V5LCBpbmNyZW1lbnRhbCwgbGFzdE1vZGlmaWVkXSk7XG4gICAgY29uc3QgY2FuY2VsID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLmlzUnVubmluZyB8fCBzdGF0ZS5pc0NhbmNlbGxpbmcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgaXNDYW5jZWxsaW5nOiB0cnVlIH0pKTtcbiAgICAgICAgLy8gQ2FuY2VsIGFib3J0IGNvbnRyb2xsZXJcbiAgICAgICAgYWJvcnRDb250cm9sbGVyLmN1cnJlbnQ/LmFib3J0KCk7XG4gICAgICAgIC8vIENsZWFyIHJldHJ5IHRpbWVvdXRcbiAgICAgICAgaWYgKHJldHJ5VGltZW91dC5jdXJyZW50KSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQocmV0cnlUaW1lb3V0LmN1cnJlbnQpO1xuICAgICAgICAgICAgcmV0cnlUaW1lb3V0LmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2FuY2VsIHByb2dyZXNzIHRhc2tcbiAgICAgICAgaWYgKHByb2dyZXNzVGFza0lkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHByb2dyZXNzU2VydmljZS5jYW5jZWxUYXNrKHByb2dyZXNzVGFza0lkLmN1cnJlbnQpO1xuICAgICAgICAgICAgcHJvZ3Jlc3NUYXNrSWQuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDYW5jZWwgdmlhIEVsZWN0cm9uIEFQSSBpZiBwb3NzaWJsZVxuICAgICAgICBpZiAoc3RhdGUucnVuSWQgJiYgd2luZG93LmVsZWN0cm9uQVBJPy5jYW5jZWxEaXNjb3ZlcnkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbERpc2NvdmVyeShzdGF0ZS5ydW5JZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeSB2aWEgQVBJOicsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICBpc0NhbmNlbGxpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IFwiRGlzY292ZXJ5IGNhbmNlbGxlZCBieSB1c2VyXCIsXG4gICAgICAgIH0pKTtcbiAgICB9LCBbc3RhdGUuaXNSdW5uaW5nLCBzdGF0ZS5pc0NhbmNlbGxpbmcsIHN0YXRlLnJ1bklkXSk7XG4gICAgY29uc3QgY2xlYXJSZXN1bHRzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgcm93czogW10sXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgY2FjaGVIaXQ6IGZhbHNlLFxuICAgICAgICB9KSk7XG4gICAgICAgIGlmIChlbmFibGVDYWNoaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBjYWNoZUtleSA9IGdldENhY2hlS2V5KHt9KTtcbiAgICAgICAgICAgIGNhY2hlU2VydmljZS5kZWxldGUoY2FjaGVLZXkpO1xuICAgICAgICB9XG4gICAgfSwgW2VuYWJsZUNhY2hpbmcsIGdldENhY2hlS2V5XSk7XG4gICAgLy8gTGlzdGVuIGZvciBwcm9ncmVzcyBldmVudHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5lbGVjdHJvbkFQSSB8fCAhc3RhdGUucnVuSWQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IG9uUHJvZ3Jlc3MgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUucnVuSWQgIT09IHN0YXRlLnJ1bklkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoZS5wY3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVzLnByb2dyZXNzID0gZS5wY3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlLmN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZXMuY3VycmVudEl0ZW0gPSBlLmN1cnJlbnRJdGVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZS5pdGVtc1Byb2Nlc3NlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZXMuaXRlbXNQcm9jZXNzZWQgPSBlLml0ZW1zUHJvY2Vzc2VkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZS50b3RhbEl0ZW1zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlcy50b3RhbEl0ZW1zID0gZS50b3RhbEl0ZW1zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZS5lc3RpbWF0ZWRUaW1lUmVtYWluaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlcy5lc3RpbWF0ZWRUaW1lUmVtYWluaW5nID0gZS5lc3RpbWF0ZWRUaW1lUmVtYWluaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4geyAuLi5wcmV2LCAuLi51cGRhdGVzIH07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChlLm1zZykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlRGlzY292ZXJ5XSAke3R5cGV9OiAke2UubXNnfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb2dyZXNzVGFza0lkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1NlcnZpY2UudXBkYXRlUHJvZ3Jlc3MocHJvZ3Jlc3NUYXNrSWQuY3VycmVudCwge1xuICAgICAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiBlLnBjdCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEl0ZW06IGUuY3VycmVudEl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zUHJvY2Vzc2VkOiBlLml0ZW1zUHJvY2Vzc2VkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGUucm93KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRSb3cgPSB0cmFuc2Zvcm1Sb3coZS5yb3cpO1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0ZVJvdyh0cmFuc2Zvcm1lZFJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyLmN1cnJlbnQucHVzaCh0cmFuc2Zvcm1lZFJvdyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEJhdGNoIHVwZGF0ZXMgZm9yIHBlcmZvcm1hbmNlIC0gZmx1c2ggZXZlcnkgMjAwIHJvd3NcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ1ZmZlci5jdXJyZW50Lmxlbmd0aCA+PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcm93czogcHJldi5yb3dzLmNvbmNhdChidWZmZXIuY3VycmVudCkgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyLmN1cnJlbnQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbdXNlRGlzY292ZXJ5XSBJbnZhbGlkIHJvdyBza2lwcGVkOmAsIGUucm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uUmVzdWx0ID0gKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLnJ1bklkICE9PSBzdGF0ZS5ydW5JZClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAvLyBGbHVzaCByZW1haW5pbmcgYnVmZmVyZWQgcm93c1xuICAgICAgICAgICAgaWYgKGJ1ZmZlci5jdXJyZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHJvd3M6IHByZXYucm93cy5jb25jYXQoYnVmZmVyLmN1cnJlbnQpIH0pKTtcbiAgICAgICAgICAgICAgICBidWZmZXIuY3VycmVudCA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZmluYWxSb3dzID0gWy4uLnN0YXRlLnJvd3NdO1xuICAgICAgICAgICAgY29uc3QgY2FjaGVLZXkgPSBlLmNhY2hlS2V5IHx8IGdldENhY2hlS2V5KHt9KTtcbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHNcbiAgICAgICAgICAgIGlmIChlbmFibGVDYWNoaW5nICYmIGZpbmFsUm93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY2FjaGVTZXJ2aWNlLnNldChjYWNoZUtleSwgZmluYWxSb3dzLCBjYWNoZVRUTCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgbGFzdFJ1bjogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGlmIChwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NTZXJ2aWNlLmNvbXBsZXRlVGFzayhwcm9ncmVzc1Rhc2tJZC5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1Rhc2tJZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VEaXNjb3ZlcnldICR7dHlwZX0gY29tcGxldGVkIGluICR7ZS5kdXJhdGlvbk1zfW1zLCBjYWNoZWQ6ICR7ISFjYWNoZUtleX1gKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb25FcnJvciA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5ydW5JZCAhPT0gc3RhdGUucnVuSWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBpc1J1bm5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgaWYgKHByb2dyZXNzVGFza0lkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1NlcnZpY2UuZmFpbFRhc2socHJvZ3Jlc3NUYXNrSWQuY3VycmVudCwgZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1Rhc2tJZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3VzZURpc2NvdmVyeV0gJHt0eXBlfSBlcnJvcjpgLCBlKTtcbiAgICAgICAgfTtcbiAgICAgICAgd2luZG93LmVsZWN0cm9uQVBJLm9uRGlzY292ZXJ5UHJvZ3Jlc3Mob25Qcm9ncmVzcyk7XG4gICAgICAgIHdpbmRvdy5lbGVjdHJvbkFQSS5vbkRpc2NvdmVyeVJlc3VsdChvblJlc3VsdCk7XG4gICAgICAgIHdpbmRvdy5lbGVjdHJvbkFQSS5vbkRpc2NvdmVyeUVycm9yKG9uRXJyb3IpO1xuICAgICAgICAvLyBDbGVhbnVwIGxpc3RlbmVycyBvbiB1bm1vdW50IChpZiBBUEkgc3VwcG9ydHMgaXQpXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBOb3RlOiBFbGVjdHJvbiBJUEMgZG9lc24ndCBoYXZlIGEgYnVpbHQtaW4gXCJvZmZcIiBieSBkZWZhdWx0XG4gICAgICAgICAgICAvLyBJZiB5b3UgYWRkIHJlbW92ZUxpc3RlbmVyIHN1cHBvcnQgdG8gcHJlbG9hZCwgd2lyZSBpdCBoZXJlXG4gICAgICAgIH07XG4gICAgfSwgW3N0YXRlLnJ1bklkLCBzdGF0ZS5yb3dzLCB0eXBlLCBlbmFibGVDYWNoaW5nLCBjYWNoZVRUTCwgZ2V0Q2FjaGVLZXksIHRyYW5zZm9ybVJvdywgdmFsaWRhdGVSb3ddKTtcbiAgICAvLyBQZXJpb2RpYyBmbHVzaCBvZiBidWZmZXJlZCByb3dzIChldmVyeSA1MDBtcylcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChidWZmZXIuY3VycmVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCByb3dzOiBwcmV2LnJvd3MuY29uY2F0KGJ1ZmZlci5jdXJyZW50KSB9KSk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLmN1cnJlbnQgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBzdGFydCxcbiAgICAgICAgY2FuY2VsOiBlbmFibGVDYW5jZWxsYXRpb24gPyBjYW5jZWwgOiB1bmRlZmluZWQsXG4gICAgICAgIGNsZWFyUmVzdWx0cyxcbiAgICAgICAgLy8gQ29tcHV0ZWQgcHJvcGVydGllc1xuICAgICAgICBjYW5TdGFydDogIXN0YXRlLmlzUnVubmluZyxcbiAgICAgICAgY2FuQ2FuY2VsOiBlbmFibGVDYW5jZWxsYXRpb24gJiYgc3RhdGUuaXNSdW5uaW5nICYmICFzdGF0ZS5pc0NhbmNlbGxpbmcsXG4gICAgICAgIGhhc1Jlc3VsdHM6IHN0YXRlLnJvd3MubGVuZ3RoID4gMCxcbiAgICB9O1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9