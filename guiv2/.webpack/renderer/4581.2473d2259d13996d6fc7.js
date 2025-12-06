"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4581],{

/***/ 34581:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CostAnalysisView: () => (/* binding */ CostAnalysisView),
  "default": () => (/* binding */ analytics_CostAnalysisView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useCostAnalysisLogic.ts

/**
 * Generate mock cost analysis data
 * In real implementation, this would aggregate from various data sources
 */
function getMockCostAnalysisData() {
    const costBreakdown = [
        { category: 'Licensing', amount: 45000, percentage: 35, trend: 5.2 },
        { category: 'Infrastructure', amount: 32000, percentage: 25, trend: -2.1 },
        { category: 'Cloud Services', amount: 28000, percentage: 22, trend: 12.8 },
        { category: 'Security', amount: 12000, percentage: 9, trend: 3.7 },
        { category: 'Other', amount: 9000, percentage: 7, trend: -1.5 },
        { category: 'Professional Services', amount: 2000, percentage: 2, trend: 8.3 },
    ];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const costProjections = months.map((month, index) => {
        const baseCost = 120000;
        const growthFactor = 0.02 + (index * 0.005); // Gradual cost increase
        const savingsFactor = index * 2000; // Increasing savings from optimizations
        return {
            month,
            currentSpend: Math.floor(baseCost * (1 + growthFactor)),
            projectedSpend: Math.floor(baseCost * (1 + growthFactor) * 0.95), // 5% reduction
            savings: savingsFactor,
        };
    });
    const optimizations = [
        {
            id: '1',
            title: 'License Optimization',
            description: 'Reclaim unused Microsoft 365 licenses',
            potentialSavings: 8500,
            effort: 'low',
            impact: 'high',
        },
        {
            id: '2',
            title: 'Cloud Resource Rightsizing',
            description: 'Downsize over-provisioned cloud instances',
            potentialSavings: 6200,
            effort: 'medium',
            impact: 'high',
        },
        {
            id: '3',
            title: 'Software Rationalization',
            description: 'Consolidate overlapping application licenses',
            potentialSavings: 4200,
            effort: 'high',
            impact: 'medium',
        },
        {
            id: '4',
            title: 'Network Optimization',
            description: 'Implement WAN acceleration and bandwidth optimization',
            potentialSavings: 3100,
            effort: 'medium',
            impact: 'medium',
        },
    ];
    return {
        totalMonthlyCost: 127000,
        totalAnnualCost: 1524000,
        costBreakdown,
        costProjections,
        optimizations,
        lastUpdated: new Date(),
    };
}
/**
 * Custom hook for Cost Analysis logic
 * Provides comprehensive cost analysis and optimization recommendations
 */
const useCostAnalysisLogic = () => {
    const [costData, setCostData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [selectedTimeRange, setSelectedTimeRange] = (0,react.useState)('6months');
    const fetchCostAnalysis = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real implementation, this would fetch from multiple data sources:
            // - Licensing systems
            // - Cloud provider APIs
            // - Infrastructure monitoring
            // - Procurement systems
            const data = getMockCostAnalysisData();
            setCostData(data);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cost data';
            setError(errorMessage);
            console.error('Cost analysis fetch error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Initial load
    (0,react.useEffect)(() => {
        fetchCostAnalysis();
    }, [fetchCostAnalysis]);
    // Filtered projections based on time range
    const filteredProjections = (0,react.useMemo)(() => {
        if (!costData)
            return [];
        const rangeMap = {
            '3months': 3,
            '6months': 6,
            '1year': 12,
        };
        return costData.costProjections.slice(0, rangeMap[selectedTimeRange]);
    }, [costData, selectedTimeRange]);
    // Calculate potential total savings
    const potentialSavings = (0,react.useMemo)(() => {
        if (!costData)
            return 0;
        return costData.optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);
    }, [costData]);
    return {
        costData,
        isLoading,
        error,
        selectedTimeRange,
        setSelectedTimeRange,
        filteredProjections,
        potentialSavings,
        refreshData: fetchCostAnalysis,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
;// ./src/renderer/views/analytics/CostAnalysisView.tsx

/**
 * Cost Analysis View
 * Financial tracking and cost optimization for M&A migrations
 */





const CostAnalysisView = () => {
    const { costData, isLoading, error, selectedTimeRange, setSelectedTimeRange, filteredProjections, potentialSavings, refreshData, } = useCostAnalysisLogic();
    const costMetrics = [
        { label: 'Monthly Cost', value: `$${(costData?.totalMonthlyCost || 0).toLocaleString()}`, icon: lucide_react/* DollarSign */.G9t, color: 'blue' },
        { label: 'Annual Cost', value: `$${(costData?.totalAnnualCost || 0).toLocaleString()}`, icon: lucide_react/* BarChart3 */.VH9, color: 'purple' },
        { label: 'Optimizations', value: (costData?.optimizations?.length || 0).toString(), icon: lucide_react/* PieChart */.rW1, color: 'green' },
        { label: 'Potential Savings', value: `$${(potentialSavings ?? 0).toLocaleString()}`, icon: lucide_react/* Calculator */.tEU, color: 'orange' },
    ];
    const timeRanges = [
        { id: 'month', label: 'This Month' },
        { id: 'quarter', label: 'This Quarter' },
        { id: 'year', label: 'This Year' },
        { id: 'all', label: 'All Time' },
    ];
    const columnDefs = [
        { field: 'category', headerName: 'Category', sortable: true, filter: true },
        { field: 'cost', headerName: 'Cost', sortable: true },
        { field: 'trend', headerName: 'Trend', sortable: true },
        { field: 'projection', headerName: 'Projection', sortable: true },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "cost-analysis-view", "data-testid": "cost-analysis-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-green-100 dark:bg-green-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react/* DollarSign */.G9t, { className: "w-8 h-8 text-green-600 dark:text-green-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Cost Analysis" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Financial tracking and cost optimization" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "flex gap-2", children: timeRanges.map((range) => ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: selectedTimeRange === range.id ? 'primary' : 'secondary', size: "sm", onClick: () => setSelectedTimeRange(range.id), "data-cy": `timerange-${range.id}`, children: range.label }, range.id))) }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", onClick: refreshData, "data-cy": "forecast-btn", "data-testid": "forecast-btn", children: "Refresh Data" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: refreshData, "data-cy": "export-btn", children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: costMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return ((0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-1", children: metric.label }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: metric.value })] }), (0,jsx_runtime.jsx)(Icon, { className: `w-6 h-6 text-${metric.color}-500` })] }) }, metric.label));
                }) }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Cost Breakdown & Trends" }) }), (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: filteredProjections, columns: columnDefs, loading: isLoading })] })] }));
};
/* harmony default export */ const analytics_CostAnalysisView = (CostAnalysisView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLHNEQUFzRCxzREFBSSxDQUFDLDJEQUFNLElBQUksVUFBVSxJQUFJLHNEQUFJLENBQUMsd0RBQUcsSUFBSSxVQUFVLG9IQUFvSCxHQUFHLHNEQUFJLENBQUMsMERBQU0sSUFBSSxtSUFBbUksb0JBQW9CLHVEQUFLLENBQUMsdURBQVMsSUFBSSxXQUFXLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw2REFBUSxJQUFJLFVBQVUsMkZBQTJGLEdBQUcsc0RBQUksQ0FBQywwREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLDZEQUFRLElBQUksVUFBVSxtR0FBbUcsSUFBSSxvQkFBb0Isc0RBQUksQ0FBQywwREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLDREQUFPLElBQUksVUFBVSw4RUFBOEUsS0FBSyxJQUFJLEdBQUcsdURBQUssVUFBVSxxREFBcUQsc0RBQUksVUFBVSx1TkFBdU4sc0RBQUksQ0FBQyw0REFBTyxJQUFJLHNDQUFzQyxHQUFHLElBQUksc0RBQUksVUFBVSxXQUFXLG1EQUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxnRUFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQ29zdEFuYWx5c2lzTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYW5hbHl0aWNzL0Nvc3RBbmFseXNpc1ZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBHZW5lcmF0ZSBtb2NrIGNvc3QgYW5hbHlzaXMgZGF0YVxuICogSW4gcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBhZ2dyZWdhdGUgZnJvbSB2YXJpb3VzIGRhdGEgc291cmNlc1xuICovXG5mdW5jdGlvbiBnZXRNb2NrQ29zdEFuYWx5c2lzRGF0YSgpIHtcbiAgICBjb25zdCBjb3N0QnJlYWtkb3duID0gW1xuICAgICAgICB7IGNhdGVnb3J5OiAnTGljZW5zaW5nJywgYW1vdW50OiA0NTAwMCwgcGVyY2VudGFnZTogMzUsIHRyZW5kOiA1LjIgfSxcbiAgICAgICAgeyBjYXRlZ29yeTogJ0luZnJhc3RydWN0dXJlJywgYW1vdW50OiAzMjAwMCwgcGVyY2VudGFnZTogMjUsIHRyZW5kOiAtMi4xIH0sXG4gICAgICAgIHsgY2F0ZWdvcnk6ICdDbG91ZCBTZXJ2aWNlcycsIGFtb3VudDogMjgwMDAsIHBlcmNlbnRhZ2U6IDIyLCB0cmVuZDogMTIuOCB9LFxuICAgICAgICB7IGNhdGVnb3J5OiAnU2VjdXJpdHknLCBhbW91bnQ6IDEyMDAwLCBwZXJjZW50YWdlOiA5LCB0cmVuZDogMy43IH0sXG4gICAgICAgIHsgY2F0ZWdvcnk6ICdPdGhlcicsIGFtb3VudDogOTAwMCwgcGVyY2VudGFnZTogNywgdHJlbmQ6IC0xLjUgfSxcbiAgICAgICAgeyBjYXRlZ29yeTogJ1Byb2Zlc3Npb25hbCBTZXJ2aWNlcycsIGFtb3VudDogMjAwMCwgcGVyY2VudGFnZTogMiwgdHJlbmQ6IDguMyB9LFxuICAgIF07XG4gICAgY29uc3QgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1biddO1xuICAgIGNvbnN0IGNvc3RQcm9qZWN0aW9ucyA9IG1vbnRocy5tYXAoKG1vbnRoLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBiYXNlQ29zdCA9IDEyMDAwMDtcbiAgICAgICAgY29uc3QgZ3Jvd3RoRmFjdG9yID0gMC4wMiArIChpbmRleCAqIDAuMDA1KTsgLy8gR3JhZHVhbCBjb3N0IGluY3JlYXNlXG4gICAgICAgIGNvbnN0IHNhdmluZ3NGYWN0b3IgPSBpbmRleCAqIDIwMDA7IC8vIEluY3JlYXNpbmcgc2F2aW5ncyBmcm9tIG9wdGltaXphdGlvbnNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vbnRoLFxuICAgICAgICAgICAgY3VycmVudFNwZW5kOiBNYXRoLmZsb29yKGJhc2VDb3N0ICogKDEgKyBncm93dGhGYWN0b3IpKSxcbiAgICAgICAgICAgIHByb2plY3RlZFNwZW5kOiBNYXRoLmZsb29yKGJhc2VDb3N0ICogKDEgKyBncm93dGhGYWN0b3IpICogMC45NSksIC8vIDUlIHJlZHVjdGlvblxuICAgICAgICAgICAgc2F2aW5nczogc2F2aW5nc0ZhY3RvcixcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCBvcHRpbWl6YXRpb25zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzEnLFxuICAgICAgICAgICAgdGl0bGU6ICdMaWNlbnNlIE9wdGltaXphdGlvbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JlY2xhaW0gdW51c2VkIE1pY3Jvc29mdCAzNjUgbGljZW5zZXMnLFxuICAgICAgICAgICAgcG90ZW50aWFsU2F2aW5nczogODUwMCxcbiAgICAgICAgICAgIGVmZm9ydDogJ2xvdycsXG4gICAgICAgICAgICBpbXBhY3Q6ICdoaWdoJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHRpdGxlOiAnQ2xvdWQgUmVzb3VyY2UgUmlnaHRzaXppbmcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEb3duc2l6ZSBvdmVyLXByb3Zpc2lvbmVkIGNsb3VkIGluc3RhbmNlcycsXG4gICAgICAgICAgICBwb3RlbnRpYWxTYXZpbmdzOiA2MjAwLFxuICAgICAgICAgICAgZWZmb3J0OiAnbWVkaXVtJyxcbiAgICAgICAgICAgIGltcGFjdDogJ2hpZ2gnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzMnLFxuICAgICAgICAgICAgdGl0bGU6ICdTb2Z0d2FyZSBSYXRpb25hbGl6YXRpb24nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb25zb2xpZGF0ZSBvdmVybGFwcGluZyBhcHBsaWNhdGlvbiBsaWNlbnNlcycsXG4gICAgICAgICAgICBwb3RlbnRpYWxTYXZpbmdzOiA0MjAwLFxuICAgICAgICAgICAgZWZmb3J0OiAnaGlnaCcsXG4gICAgICAgICAgICBpbXBhY3Q6ICdtZWRpdW0nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzQnLFxuICAgICAgICAgICAgdGl0bGU6ICdOZXR3b3JrIE9wdGltaXphdGlvbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0ltcGxlbWVudCBXQU4gYWNjZWxlcmF0aW9uIGFuZCBiYW5kd2lkdGggb3B0aW1pemF0aW9uJyxcbiAgICAgICAgICAgIHBvdGVudGlhbFNhdmluZ3M6IDMxMDAsXG4gICAgICAgICAgICBlZmZvcnQ6ICdtZWRpdW0nLFxuICAgICAgICAgICAgaW1wYWN0OiAnbWVkaXVtJyxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvdGFsTW9udGhseUNvc3Q6IDEyNzAwMCxcbiAgICAgICAgdG90YWxBbm51YWxDb3N0OiAxNTI0MDAwLFxuICAgICAgICBjb3N0QnJlYWtkb3duLFxuICAgICAgICBjb3N0UHJvamVjdGlvbnMsXG4gICAgICAgIG9wdGltaXphdGlvbnMsXG4gICAgICAgIGxhc3RVcGRhdGVkOiBuZXcgRGF0ZSgpLFxuICAgIH07XG59XG4vKipcbiAqIEN1c3RvbSBob29rIGZvciBDb3N0IEFuYWx5c2lzIGxvZ2ljXG4gKiBQcm92aWRlcyBjb21wcmVoZW5zaXZlIGNvc3QgYW5hbHlzaXMgYW5kIG9wdGltaXphdGlvbiByZWNvbW1lbmRhdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IHVzZUNvc3RBbmFseXNpc0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtjb3N0RGF0YSwgc2V0Q29zdERhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlbGVjdGVkVGltZVJhbmdlLCBzZXRTZWxlY3RlZFRpbWVSYW5nZV0gPSB1c2VTdGF0ZSgnNm1vbnRocycpO1xuICAgIGNvbnN0IGZldGNoQ29zdEFuYWx5c2lzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBTaW11bGF0ZSBBUEkgY2FsbCBkZWxheVxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcbiAgICAgICAgICAgIC8vIEluIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgZmV0Y2ggZnJvbSBtdWx0aXBsZSBkYXRhIHNvdXJjZXM6XG4gICAgICAgICAgICAvLyAtIExpY2Vuc2luZyBzeXN0ZW1zXG4gICAgICAgICAgICAvLyAtIENsb3VkIHByb3ZpZGVyIEFQSXNcbiAgICAgICAgICAgIC8vIC0gSW5mcmFzdHJ1Y3R1cmUgbW9uaXRvcmluZ1xuICAgICAgICAgICAgLy8gLSBQcm9jdXJlbWVudCBzeXN0ZW1zXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZ2V0TW9ja0Nvc3RBbmFseXNpc0RhdGEoKTtcbiAgICAgICAgICAgIHNldENvc3REYXRhKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIGZldGNoIGNvc3QgZGF0YSc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ29zdCBhbmFseXNpcyBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvLyBJbml0aWFsIGxvYWRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaENvc3RBbmFseXNpcygpO1xuICAgIH0sIFtmZXRjaENvc3RBbmFseXNpc10pO1xuICAgIC8vIEZpbHRlcmVkIHByb2plY3Rpb25zIGJhc2VkIG9uIHRpbWUgcmFuZ2VcbiAgICBjb25zdCBmaWx0ZXJlZFByb2plY3Rpb25zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghY29zdERhdGEpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IHJhbmdlTWFwID0ge1xuICAgICAgICAgICAgJzNtb250aHMnOiAzLFxuICAgICAgICAgICAgJzZtb250aHMnOiA2LFxuICAgICAgICAgICAgJzF5ZWFyJzogMTIsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBjb3N0RGF0YS5jb3N0UHJvamVjdGlvbnMuc2xpY2UoMCwgcmFuZ2VNYXBbc2VsZWN0ZWRUaW1lUmFuZ2VdKTtcbiAgICB9LCBbY29zdERhdGEsIHNlbGVjdGVkVGltZVJhbmdlXSk7XG4gICAgLy8gQ2FsY3VsYXRlIHBvdGVudGlhbCB0b3RhbCBzYXZpbmdzXG4gICAgY29uc3QgcG90ZW50aWFsU2F2aW5ncyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWNvc3REYXRhKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIHJldHVybiBjb3N0RGF0YS5vcHRpbWl6YXRpb25zLnJlZHVjZSgoc3VtLCBvcHQpID0+IHN1bSArIG9wdC5wb3RlbnRpYWxTYXZpbmdzLCAwKTtcbiAgICB9LCBbY29zdERhdGFdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb3N0RGF0YSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VsZWN0ZWRUaW1lUmFuZ2UsXG4gICAgICAgIHNldFNlbGVjdGVkVGltZVJhbmdlLFxuICAgICAgICBmaWx0ZXJlZFByb2plY3Rpb25zLFxuICAgICAgICBwb3RlbnRpYWxTYXZpbmdzLFxuICAgICAgICByZWZyZXNoRGF0YTogZmV0Y2hDb3N0QW5hbHlzaXMsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBDb3N0IEFuYWx5c2lzIFZpZXdcbiAqIEZpbmFuY2lhbCB0cmFja2luZyBhbmQgY29zdCBvcHRpbWl6YXRpb24gZm9yIE0mQSBtaWdyYXRpb25zXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEb2xsYXJTaWduLCBQaWVDaGFydCwgQmFyQ2hhcnQzLCBDYWxjdWxhdG9yIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUNvc3RBbmFseXNpc0xvZ2ljIH0gZnJvbSAnQGhvb2tzL3VzZUNvc3RBbmFseXNpc0xvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJ0Bjb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnQGNvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuZXhwb3J0IGNvbnN0IENvc3RBbmFseXNpc1ZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBjb3N0RGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgc2VsZWN0ZWRUaW1lUmFuZ2UsIHNldFNlbGVjdGVkVGltZVJhbmdlLCBmaWx0ZXJlZFByb2plY3Rpb25zLCBwb3RlbnRpYWxTYXZpbmdzLCByZWZyZXNoRGF0YSwgfSA9IHVzZUNvc3RBbmFseXNpc0xvZ2ljKCk7XG4gICAgY29uc3QgY29zdE1ldHJpY3MgPSBbXG4gICAgICAgIHsgbGFiZWw6ICdNb250aGx5IENvc3QnLCB2YWx1ZTogYCQkeyhjb3N0RGF0YT8udG90YWxNb250aGx5Q29zdCB8fCAwKS50b0xvY2FsZVN0cmluZygpfWAsIGljb246IERvbGxhclNpZ24sIGNvbG9yOiAnYmx1ZScgfSxcbiAgICAgICAgeyBsYWJlbDogJ0FubnVhbCBDb3N0JywgdmFsdWU6IGAkJHsoY29zdERhdGE/LnRvdGFsQW5udWFsQ29zdCB8fCAwKS50b0xvY2FsZVN0cmluZygpfWAsIGljb246IEJhckNoYXJ0MywgY29sb3I6ICdwdXJwbGUnIH0sXG4gICAgICAgIHsgbGFiZWw6ICdPcHRpbWl6YXRpb25zJywgdmFsdWU6IChjb3N0RGF0YT8ub3B0aW1pemF0aW9ucz8ubGVuZ3RoIHx8IDApLnRvU3RyaW5nKCksIGljb246IFBpZUNoYXJ0LCBjb2xvcjogJ2dyZWVuJyB9LFxuICAgICAgICB7IGxhYmVsOiAnUG90ZW50aWFsIFNhdmluZ3MnLCB2YWx1ZTogYCQkeyhwb3RlbnRpYWxTYXZpbmdzID8/IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgaWNvbjogQ2FsY3VsYXRvciwgY29sb3I6ICdvcmFuZ2UnIH0sXG4gICAgXTtcbiAgICBjb25zdCB0aW1lUmFuZ2VzID0gW1xuICAgICAgICB7IGlkOiAnbW9udGgnLCBsYWJlbDogJ1RoaXMgTW9udGgnIH0sXG4gICAgICAgIHsgaWQ6ICdxdWFydGVyJywgbGFiZWw6ICdUaGlzIFF1YXJ0ZXInIH0sXG4gICAgICAgIHsgaWQ6ICd5ZWFyJywgbGFiZWw6ICdUaGlzIFllYXInIH0sXG4gICAgICAgIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ0FsbCBUaW1lJyB9LFxuICAgIF07XG4gICAgY29uc3QgY29sdW1uRGVmcyA9IFtcbiAgICAgICAgeyBmaWVsZDogJ2NhdGVnb3J5JywgaGVhZGVyTmFtZTogJ0NhdGVnb3J5Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnY29zdCcsIGhlYWRlck5hbWU6ICdDb3N0Jywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3RyZW5kJywgaGVhZGVyTmFtZTogJ1RyZW5kJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3Byb2plY3Rpb24nLCBoZWFkZXJOYW1lOiAnUHJvamVjdGlvbicsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgXTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaC1mdWxsIHAtNiBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwiY29zdC1hbmFseXNpcy12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjb3N0LWFuYWx5c2lzLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTMgYmctZ3JlZW4tMTAwIGRhcms6YmctZ3JlZW4tOTAwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IF9qc3goRG9sbGFyU2lnbiwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwXCIgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNvc3QgQW5hbHlzaXNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiRmluYW5jaWFsIHRyYWNraW5nIGFuZCBjb3N0IG9wdGltaXphdGlvblwiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTJcIiwgY2hpbGRyZW46IHRpbWVSYW5nZXMubWFwKChyYW5nZSkgPT4gKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IHNlbGVjdGVkVGltZVJhbmdlID09PSByYW5nZS5pZCA/ICdwcmltYXJ5JyA6ICdzZWNvbmRhcnknLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6ICgpID0+IHNldFNlbGVjdGVkVGltZVJhbmdlKHJhbmdlLmlkKSwgXCJkYXRhLWN5XCI6IGB0aW1lcmFuZ2UtJHtyYW5nZS5pZH1gLCBjaGlsZHJlbjogcmFuZ2UubGFiZWwgfSwgcmFuZ2UuaWQpKSkgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiByZWZyZXNoRGF0YSwgXCJkYXRhLWN5XCI6IFwiZm9yZWNhc3QtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJmb3JlY2FzdC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaCBEYXRhXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IHJlZnJlc2hEYXRhLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTQgZ2FwLTQgbWItNlwiLCBjaGlsZHJlbjogY29zdE1ldHJpY3MubWFwKChtZXRyaWMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgSWNvbiA9IG1ldHJpYy5pY29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHAtNiBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTFcIiwgY2hpbGRyZW46IG1ldHJpYy5sYWJlbCB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBtZXRyaWMudmFsdWUgfSldIH0pLCBfanN4KEljb24sIHsgY2xhc3NOYW1lOiBgdy02IGgtNiB0ZXh0LSR7bWV0cmljLmNvbG9yfS01MDBgIH0pXSB9KSB9LCBtZXRyaWMubGFiZWwpKTtcbiAgICAgICAgICAgICAgICB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTQgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNvc3QgQnJlYWtkb3duICYgVHJlbmRzXCIgfSkgfSksIF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBmaWx0ZXJlZFByb2plY3Rpb25zLCBjb2x1bW5zOiBjb2x1bW5EZWZzLCBsb2FkaW5nOiBpc0xvYWRpbmcgfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQ29zdEFuYWx5c2lzVmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9