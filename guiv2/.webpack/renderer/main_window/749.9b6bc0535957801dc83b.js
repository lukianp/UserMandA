"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[749],{

/***/ 33352:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c: () => (/* binding */ useMigrationExecutionLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2782);


const useMigrationExecutionLogic = () => {
    const store = (0,_store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__/* .useMigrationStore */ .V)();
    const { selectedWave, executionProgress, isExecuting, error, executeMigration, pauseMigration, resumeMigration, cancelMigration, retryFailedItems, subscribeToProgress, createRollbackPoint, } = store;
    const [logs, setLogs] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!selectedWave?.id)
            return;
        const cleanup = subscribeToProgress(selectedWave.id, (progress) => {
            if (progress.message) {
                setLogs(prev => [...prev.slice(-99), progress.message]);
            }
        });
        return cleanup;
    }, [selectedWave, subscribeToProgress]);
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!executionProgress)
            return { total: 0, completed: 0, failed: 0, inProgress: 0, pending: 0 };
        const items = executionProgress.items || [];
        return {
            total: (items ?? []).length,
            completed: items.filter((i) => i.status === 'completed').length,
            failed: items.filter((i) => i.status === 'failed').length,
            inProgress: items.filter((i) => i.status === 'in-progress').length,
            pending: items.filter((i) => i.status === 'pending').length,
        };
    }, [executionProgress]);
    const progressPercent = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (stats.total === 0)
            return 0;
        return Math.round((stats.completed / stats.total) * 100);
    }, [stats]);
    const handleStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await executeMigration(selectedWave.id);
    }, [selectedWave, executeMigration]);
    const handlePause = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await pauseMigration(selectedWave.id);
    }, [selectedWave, pauseMigration]);
    const handleResume = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await resumeMigration(selectedWave.id);
    }, [selectedWave, resumeMigration]);
    const handleCancel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await cancelMigration(selectedWave.id);
    }, [selectedWave, cancelMigration]);
    const handleRetry = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await retryFailedItems(selectedWave.id);
    }, [selectedWave, retryFailedItems]);
    const handleCreateRollbackPoint = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        await createRollbackPoint(selectedWave.id);
    }, [selectedWave, createRollbackPoint]);
    return {
        selectedWave,
        executionProgress,
        isExecuting,
        error,
        logs,
        stats,
        progressPercent,
        handleStart,
        handlePause,
        handleResume,
        handleCancel,
        handleRetry,
        handleCreateRollbackPoint,
        hasWaveSelected: !!selectedWave,
    };
};


/***/ }),

/***/ 59944:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(28709);

/**
 * VirtualizedDataGrid Component
 *
 * Enterprise-grade data grid using AG Grid Enterprise
 * Handles 100,000+ rows with virtual scrolling at 60 FPS
 */







// Lazy load AG Grid CSS - only load once when first grid mounts
let agGridStylesLoaded = false;
const loadAgGridStyles = () => {
    if (agGridStylesLoaded)
        return;
    // Dynamically import AG Grid styles
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, 46479));
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, 64010));
    agGridStylesLoaded = true;
};
/**
 * High-performance data grid component
 */
function VirtualizedDataGridInner({ data, columns, loading = false, virtualRowHeight = 32, enableColumnReorder = true, enableColumnResize = true, enableExport = true, enablePrint = true, enableGrouping = false, enableFiltering = true, enableSelection = true, selectionMode = 'multiple', pagination = true, paginationPageSize = 100, onRowClick, onSelectionChange, className, height = '600px', 'data-cy': dataCy, }, ref) {
    const gridRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const [gridApi, setGridApi] = react__WEBPACK_IMPORTED_MODULE_1__.useState(null);
    const [showColumnPanel, setShowColumnPanel] = react__WEBPACK_IMPORTED_MODULE_1__.useState(false);
    const rowData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const result = data ?? [];
        console.log('[VirtualizedDataGrid] rowData computed:', result.length, 'rows');
        return result;
    }, [data]);
    // Load AG Grid styles on component mount
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        loadAgGridStyles();
    }, []);
    // Default column definition
    const defaultColDef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        sortable: true,
        filter: enableFiltering,
        resizable: enableColumnResize,
        floatingFilter: enableFiltering,
        minWidth: 100,
    }), [enableFiltering, enableColumnResize]);
    // Grid options
    const gridOptions = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        rowHeight: virtualRowHeight,
        headerHeight: 40,
        floatingFiltersHeight: 40,
        suppressRowClickSelection: !enableSelection,
        rowSelection: enableSelection ? selectionMode : undefined,
        animateRows: true,
        // FIX: Disable charts to avoid error #200 (requires IntegratedChartsModule)
        enableCharts: false,
        // FIX: Use cellSelection instead of deprecated enableRangeSelection
        cellSelection: true,
        // FIX: Use legacy theme to prevent theming API conflict (error #239)
        // Must be set to 'legacy' to use v32 style themes with CSS files
        theme: 'legacy',
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
                { statusPanel: 'agAggregationComponent', align: 'right' },
            ],
        },
        sideBar: enableGrouping
            ? {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        labelKey: 'filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                    },
                ],
                defaultToolPanel: '',
            }
            : false,
    }), [virtualRowHeight, enableSelection, selectionMode, enableGrouping]);
    // Handle grid ready event
    const onGridReady = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
    }, []);
    // Handle row click
    const handleRowClick = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onRowClick && event.data) {
            onRowClick(event.data);
        }
    }, [onRowClick]);
    // Handle selection change
    const handleSelectionChange = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onSelectionChange) {
            const selectedRows = event.api.getSelectedRows();
            onSelectionChange(selectedRows);
        }
    }, [onSelectionChange]);
    // Export to CSV
    const exportToCsv = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsCsv({
                fileName: `export-${new Date().toISOString()}.csv`,
            });
        }
    }, [gridApi]);
    // Export to Excel
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsExcel({
                fileName: `export-${new Date().toISOString()}.xlsx`,
                sheetName: 'Data',
            });
        }
    }, [gridApi]);
    // Print grid
    const printGrid = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.setGridOption('domLayout', 'print');
            setTimeout(() => {
                window.print();
                gridApi.setGridOption('domLayout', undefined);
            }, 100);
        }
    }, [gridApi]);
    // Toggle column visibility panel
    const toggleColumnPanel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setShowColumnPanel(!showColumnPanel);
    }, [showColumnPanel]);
    // Auto-size all columns
    const autoSizeColumns = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            const allColumnIds = columns.map(c => c.field).filter(Boolean);
            gridApi.autoSizeColumns(allColumnIds);
        }
    }, [gridApi, columns]);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Filter */ .dJT, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .EyeOff */ .X_F, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Eye */ .kU3, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Printer */ .xjr, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__/* .AgGridReact */ .W6, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
                                            if (gridApi && col.field) {
                                                gridApi.setColumnsVisible([col.field], e.target.checked);
                                            }
                                        } }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: col.headerName || col.field })] }, col.field)))] }))] })] }));
}
const VirtualizedDataGrid = react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(VirtualizedDataGridInner);
// Set displayName for React DevTools
VirtualizedDataGrid.displayName = 'VirtualizedDataGrid';


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZU1pZ3JhdGlvbkV4ZWN1dGlvbkxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlTWlncmF0aW9uU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VNaWdyYXRpb25TdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlTWlncmF0aW9uRXhlY3V0aW9uTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RvcmUgPSB1c2VNaWdyYXRpb25TdG9yZSgpO1xuICAgIGNvbnN0IHsgc2VsZWN0ZWRXYXZlLCBleGVjdXRpb25Qcm9ncmVzcywgaXNFeGVjdXRpbmcsIGVycm9yLCBleGVjdXRlTWlncmF0aW9uLCBwYXVzZU1pZ3JhdGlvbiwgcmVzdW1lTWlncmF0aW9uLCBjYW5jZWxNaWdyYXRpb24sIHJldHJ5RmFpbGVkSXRlbXMsIHN1YnNjcmliZVRvUHJvZ3Jlc3MsIGNyZWF0ZVJvbGxiYWNrUG9pbnQsIH0gPSBzdG9yZTtcbiAgICBjb25zdCBbbG9ncywgc2V0TG9nc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFdhdmU/LmlkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCBjbGVhbnVwID0gc3Vic2NyaWJlVG9Qcm9ncmVzcyhzZWxlY3RlZFdhdmUuaWQsIChwcm9ncmVzcykgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2dyZXNzLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBzZXRMb2dzKHByZXYgPT4gWy4uLnByZXYuc2xpY2UoLTk5KSwgcHJvZ3Jlc3MubWVzc2FnZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsZWFudXA7XG4gICAgfSwgW3NlbGVjdGVkV2F2ZSwgc3Vic2NyaWJlVG9Qcm9ncmVzc10pO1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghZXhlY3V0aW9uUHJvZ3Jlc3MpXG4gICAgICAgICAgICByZXR1cm4geyB0b3RhbDogMCwgY29tcGxldGVkOiAwLCBmYWlsZWQ6IDAsIGluUHJvZ3Jlc3M6IDAsIHBlbmRpbmc6IDAgfTtcbiAgICAgICAgY29uc3QgaXRlbXMgPSBleGVjdXRpb25Qcm9ncmVzcy5pdGVtcyB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsOiAoaXRlbXMgPz8gW10pLmxlbmd0aCxcbiAgICAgICAgICAgIGNvbXBsZXRlZDogaXRlbXMuZmlsdGVyKChpKSA9PiBpLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpLmxlbmd0aCxcbiAgICAgICAgICAgIGZhaWxlZDogaXRlbXMuZmlsdGVyKChpKSA9PiBpLnN0YXR1cyA9PT0gJ2ZhaWxlZCcpLmxlbmd0aCxcbiAgICAgICAgICAgIGluUHJvZ3Jlc3M6IGl0ZW1zLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgPT09ICdpbi1wcm9ncmVzcycpLmxlbmd0aCxcbiAgICAgICAgICAgIHBlbmRpbmc6IGl0ZW1zLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgPT09ICdwZW5kaW5nJykubGVuZ3RoLFxuICAgICAgICB9O1xuICAgIH0sIFtleGVjdXRpb25Qcm9ncmVzc10pO1xuICAgIGNvbnN0IHByb2dyZXNzUGVyY2VudCA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoc3RhdHMudG90YWwgPT09IDApXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHN0YXRzLmNvbXBsZXRlZCAvIHN0YXRzLnRvdGFsKSAqIDEwMCk7XG4gICAgfSwgW3N0YXRzXSk7XG4gICAgY29uc3QgaGFuZGxlU3RhcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc2VsZWN0ZWRXYXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhd2FpdCBleGVjdXRlTWlncmF0aW9uKHNlbGVjdGVkV2F2ZS5pZCk7XG4gICAgfSwgW3NlbGVjdGVkV2F2ZSwgZXhlY3V0ZU1pZ3JhdGlvbl0pO1xuICAgIGNvbnN0IGhhbmRsZVBhdXNlID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkV2F2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXdhaXQgcGF1c2VNaWdyYXRpb24oc2VsZWN0ZWRXYXZlLmlkKTtcbiAgICB9LCBbc2VsZWN0ZWRXYXZlLCBwYXVzZU1pZ3JhdGlvbl0pO1xuICAgIGNvbnN0IGhhbmRsZVJlc3VtZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFdhdmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGF3YWl0IHJlc3VtZU1pZ3JhdGlvbihzZWxlY3RlZFdhdmUuaWQpO1xuICAgIH0sIFtzZWxlY3RlZFdhdmUsIHJlc3VtZU1pZ3JhdGlvbl0pO1xuICAgIGNvbnN0IGhhbmRsZUNhbmNlbCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFdhdmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGF3YWl0IGNhbmNlbE1pZ3JhdGlvbihzZWxlY3RlZFdhdmUuaWQpO1xuICAgIH0sIFtzZWxlY3RlZFdhdmUsIGNhbmNlbE1pZ3JhdGlvbl0pO1xuICAgIGNvbnN0IGhhbmRsZVJldHJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkV2F2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXdhaXQgcmV0cnlGYWlsZWRJdGVtcyhzZWxlY3RlZFdhdmUuaWQpO1xuICAgIH0sIFtzZWxlY3RlZFdhdmUsIHJldHJ5RmFpbGVkSXRlbXNdKTtcbiAgICBjb25zdCBoYW5kbGVDcmVhdGVSb2xsYmFja1BvaW50ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkV2F2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXdhaXQgY3JlYXRlUm9sbGJhY2tQb2ludChzZWxlY3RlZFdhdmUuaWQpO1xuICAgIH0sIFtzZWxlY3RlZFdhdmUsIGNyZWF0ZVJvbGxiYWNrUG9pbnRdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3RlZFdhdmUsXG4gICAgICAgIGV4ZWN1dGlvblByb2dyZXNzLFxuICAgICAgICBpc0V4ZWN1dGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGxvZ3MsXG4gICAgICAgIHN0YXRzLFxuICAgICAgICBwcm9ncmVzc1BlcmNlbnQsXG4gICAgICAgIGhhbmRsZVN0YXJ0LFxuICAgICAgICBoYW5kbGVQYXVzZSxcbiAgICAgICAgaGFuZGxlUmVzdW1lLFxuICAgICAgICBoYW5kbGVDYW5jZWwsXG4gICAgICAgIGhhbmRsZVJldHJ5LFxuICAgICAgICBoYW5kbGVDcmVhdGVSb2xsYmFja1BvaW50LFxuICAgICAgICBoYXNXYXZlU2VsZWN0ZWQ6ICEhc2VsZWN0ZWRXYXZlLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=