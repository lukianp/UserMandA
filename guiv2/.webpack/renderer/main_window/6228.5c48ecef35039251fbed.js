"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6228],{

/***/ 26228:
/*!****************************************************************************!*\
  !*** ./src/renderer/views/licensing/LicenseManagementView.tsx + 1 modules ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  LicenseManagementView: () => (/* binding */ LicenseManagementView),
  "default": () => (/* binding */ licensing_LicenseManagementView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useLicenseManagementLogic.ts

/**
 * Generate mock license management data
 */
function getMockLicenseManagementData() {
    const licenses = [
        {
            id: '1',
            productName: 'Microsoft 365 E3',
            vendor: 'Microsoft',
            totalLicenses: 12500,
            usedLicenses: 11875,
            availableLicenses: 625,
            utilizationRate: 95,
            costPerLicense: 32,
            totalCost: 400000,
            expirationDate: new Date('2025-06-15'),
            category: 'Productivity',
            autoRenew: true,
        },
        {
            id: '2',
            productName: 'Adobe Creative Cloud',
            vendor: 'Adobe',
            totalLicenses: 500,
            usedLicenses: 387,
            availableLicenses: 113,
            utilizationRate: 77,
            costPerLicense: 72,
            totalCost: 36000,
            expirationDate: new Date('2025-03-20'),
            category: 'Creative',
            autoRenew: false,
        },
        {
            id: '3',
            productName: 'Slack Enterprise',
            vendor: 'Salesforce',
            totalLicenses: 8000,
            usedLicenses: 7420,
            availableLicenses: 580,
            utilizationRate: 93,
            costPerLicense: 12,
            totalCost: 96000,
            expirationDate: new Date('2024-11-30'),
            category: 'Communication',
            autoRenew: true,
        },
        {
            id: '4',
            productName: 'Zoom Pro',
            vendor: 'Zoom',
            totalLicenses: 6000,
            usedLicenses: 4230,
            availableLicenses: 1770,
            utilizationRate: 71,
            costPerLicense: 15,
            totalCost: 90000,
            expirationDate: new Date('2024-12-15'),
            category: 'Communication',
            autoRenew: true,
        },
        {
            id: '5',
            productName: 'Atlassian Suite',
            vendor: 'Atlassian',
            totalLicenses: 1200,
            usedLicenses: 1080,
            availableLicenses: 120,
            utilizationRate: 90,
            costPerLicense: 8,
            totalCost: 9600,
            expirationDate: new Date('2025-08-10'),
            category: 'Development',
            autoRenew: true,
        },
    ];
    const usage = [
        {
            licenseId: '1',
            userId: 'user1',
            userName: 'John Doe',
            assignedDate: new Date('2023-01-15'),
            lastUsed: new Date('2024-10-01'),
            department: 'IT',
        },
        {
            licenseId: '1',
            userId: 'user2',
            userName: 'Jane Smith',
            assignedDate: new Date('2023-02-01'),
            lastUsed: new Date('2024-09-28'),
            department: 'Marketing',
        },
    ];
    const alerts = [
        {
            id: '1',
            type: 'expiration',
            severity: 'high',
            message: 'Adobe Creative Cloud licenses expire in 45 days',
            licenseId: '2',
            recommendedAction: 'Renew licenses or redistribute unused ones',
        },
        {
            id: '2',
            type: 'underutilization',
            severity: 'medium',
            message: 'Zoom Pro utilization below 80%',
            licenseId: '4',
            recommendedAction: 'Reclaim unused licenses',
        },
        {
            id: '3',
            type: 'compliance',
            severity: 'critical',
            message: 'Microsoft 365 over-allocation detected',
            licenseId: '1',
            recommendedAction: 'Audit license assignments and remove unused licenses',
        },
    ];
    const metrics = {
        totalLicenses: licenses.reduce((sum, lic) => sum + lic.totalLicenses, 0),
        totalCost: licenses.reduce((sum, lic) => sum + lic.totalCost, 0),
        averageUtilization: Math.round(licenses.reduce((sum, lic) => sum + lic.utilizationRate, 0) / licenses.length),
        expiringSoon: licenses.filter(lic => (lic.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 90).length,
        overUtilized: licenses.filter(lic => lic.utilizationRate > 100).length,
        underUtilized: licenses.filter(lic => lic.utilizationRate < 50).length,
    };
    return {
        licenses,
        usage,
        alerts,
        metrics,
        lastUpdated: new Date(),
    };
}
/**
 * Custom hook for License Management logic
 * Provides comprehensive license tracking and optimization
 */
const useLicenseManagementLogic = () => {
    const [licenseData, setLicenseData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [selectedCategory, setSelectedCategory] = (0,react.useState)('all');
    const [sortBy, setSortBy] = (0,react.useState)('utilization');
    const [filterAlerts, setFilterAlerts] = (0,react.useState)(false);
    const fetchLicenseData = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In real implementation, this would integrate with:
            // - Microsoft License Management
            // - Adobe Admin Console
            // - Local license servers
            // - Procurement systems
            const data = getMockLicenseManagementData();
            setLicenseData(data);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch license data';
            setError(errorMessage);
            console.error('License management fetch error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Initial load
    (0,react.useEffect)(() => {
        fetchLicenseData();
    }, [fetchLicenseData]);
    // Filtered and sorted licenses
    const processedLicenses = (0,react.useMemo)(() => {
        if (!licenseData)
            return [];
        let filtered = licenseData.licenses;
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(lic => lic.category === selectedCategory);
        }
        // Sort by selected field
        filtered = filtered.slice().sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.productName.localeCompare(b.productName);
                case 'utilization':
                    return b.utilizationRate - a.utilizationRate;
                case 'cost':
                    return b.totalCost - a.totalCost;
                case 'expiration':
                    return a.expirationDate.getTime() - b.expirationDate.getTime();
                default:
                    return 0;
            }
        });
        return filtered;
    }, [licenseData, selectedCategory, sortBy]);
    // Filtered alerts
    const processedAlerts = (0,react.useMemo)(() => {
        if (!licenseData || !filterAlerts)
            return licenseData?.alerts || [];
        return licenseData.alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
    }, [licenseData, filterAlerts]);
    // Available categories
    const availableCategories = (0,react.useMemo)(() => {
        if (!licenseData)
            return [];
        const categories = [...new Set(licenseData.licenses.map(lic => lic.category))];
        return categories.map(cat => ({ id: cat, name: cat }));
    }, [licenseData]);
    return {
        licenseData,
        processedLicenses,
        processedAlerts,
        isLoading,
        error,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        filterAlerts,
        setFilterAlerts,
        availableCategories,
        refreshData: fetchLicenseData,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
;// ./src/renderer/views/licensing/LicenseManagementView.tsx

/**
 * License Management View
 * License tracking, compliance, and cost optimization
 */





const LicenseManagementView = () => {
    const { processedLicenses, isLoading, selectedCategory, setSelectedCategory, refreshData, } = useLicenseManagementLogic();
    // Calculate stats from processedLicenses
    const stats = react.useMemo(() => {
        const totalLicenses = processedLicenses.reduce((sum, l) => sum + l.totalLicenses, 0);
        const activeLicenses = processedLicenses.reduce((sum, l) => sum + l.usedLicenses, 0);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringSoon = processedLicenses.filter(l => l.expirationDate <= thirtyDaysFromNow && l.expirationDate >= now).length;
        const nonCompliant = processedLicenses.filter(l => !l.autoRenew && l.expirationDate < now).length;
        const totalCost = processedLicenses.reduce((sum, l) => sum + l.totalCost, 0);
        const potentialSavings = processedLicenses.reduce((sum, l) => sum + (l.availableLicenses * l.costPerLicense), 0);
        return { totalLicenses, activeLicenses, expiringSoon, nonCompliant, totalCost, potentialSavings };
    }, [processedLicenses]);
    const licenseMetrics = [
        { label: 'Total Licenses', value: (stats?.totalLicenses ?? 0), icon: lucide_react.Key, color: 'blue' },
        { label: 'Active', value: (stats?.activeLicenses ?? 0), icon: lucide_react.CheckCircle, color: 'green' },
        { label: 'Expiring Soon', value: (stats?.expiringSoon ?? 0), icon: lucide_react.Clock, color: 'yellow' },
        { label: 'Non-Compliant', value: (stats?.nonCompliant ?? 0), icon: lucide_react.AlertCircle, color: 'red' },
        { label: 'Total Cost', value: `$${((stats?.totalCost ?? 0) ?? 0).toLocaleString()}`, icon: lucide_react.DollarSign, color: 'purple' },
        { label: 'Potential Savings', value: `$${((stats?.potentialSavings ?? 0) ?? 0).toLocaleString()}`, icon: lucide_react.TrendingUp, color: 'green' },
    ];
    // Column definitions
    const columnDefs = react.useMemo(() => [
        { field: 'name', headerName: 'License Name', sortable: true, filter: true },
        { field: 'type', headerName: 'Type', sortable: true, filter: true },
        { field: 'status', headerName: 'Status', sortable: true, filter: true },
        { field: 'assigned', headerName: 'Assigned', sortable: true },
        { field: 'available', headerName: 'Available', sortable: true },
        { field: 'cost', headerName: 'Cost', sortable: true, valueFormatter: (params) => `$${params.value}` },
    ], []);
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "license-management-view", "data-testid": "license-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-purple-100 dark:bg-purple-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react.Key, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "License Management" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Track, optimize, and ensure license compliance" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-3", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: () => console.log('Optimize licenses'), "data-cy": "optimize-btn", "data-testid": "optimize-btn", children: "Optimize Licenses" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: () => console.log('Export report'), "data-cy": "export-btn", children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", children: licenseMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)(Icon, { className: `w-6 h-6 text-${metric.color}-500 mb-2` }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: metric.value }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: metric.label })] }, metric.label));
                }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: processedLicenses, columns: columnDefs, loading: isLoading }) })] }));
};
/* harmony default export */ const licensing_LicenseManagementView = (LicenseManagementView);


/***/ }),

/***/ 59944:
/*!*******************************************************************!*\
  !*** ./src/renderer/components/organisms/VirtualizedDataGrid.tsx ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VirtualizedDataGrid: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ag-grid-react */ 66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ag-grid-enterprise */ 71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../atoms/Spinner */ 28709);

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
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-grid.css */ 46479));
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-theme-alpine.css */ 64010));
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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Filter, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.EyeOff, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Eye, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Printer, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__.AgGridReact, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VywwQ0FBSSxxRUFBcUUsUUFBUSxZQUFZLHNEQUFJLENBQUMsc0RBQVcsSUFBSSx5YUFBeWEsR0FBRyx1QkFBdUIsdURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUxpY2Vuc2VNYW5hZ2VtZW50TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvbGljZW5zaW5nL0xpY2Vuc2VNYW5hZ2VtZW50Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIEdlbmVyYXRlIG1vY2sgbGljZW5zZSBtYW5hZ2VtZW50IGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2V0TW9ja0xpY2Vuc2VNYW5hZ2VtZW50RGF0YSgpIHtcbiAgICBjb25zdCBsaWNlbnNlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnTWljcm9zb2Z0IDM2NSBFMycsXG4gICAgICAgICAgICB2ZW5kb3I6ICdNaWNyb3NvZnQnLFxuICAgICAgICAgICAgdG90YWxMaWNlbnNlczogMTI1MDAsXG4gICAgICAgICAgICB1c2VkTGljZW5zZXM6IDExODc1LFxuICAgICAgICAgICAgYXZhaWxhYmxlTGljZW5zZXM6IDYyNSxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uUmF0ZTogOTUsXG4gICAgICAgICAgICBjb3N0UGVyTGljZW5zZTogMzIsXG4gICAgICAgICAgICB0b3RhbENvc3Q6IDQwMDAwMCxcbiAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlOiBuZXcgRGF0ZSgnMjAyNS0wNi0xNScpLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdQcm9kdWN0aXZpdHknLFxuICAgICAgICAgICAgYXV0b1JlbmV3OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdBZG9iZSBDcmVhdGl2ZSBDbG91ZCcsXG4gICAgICAgICAgICB2ZW5kb3I6ICdBZG9iZScsXG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzOiA1MDAsXG4gICAgICAgICAgICB1c2VkTGljZW5zZXM6IDM4NyxcbiAgICAgICAgICAgIGF2YWlsYWJsZUxpY2Vuc2VzOiAxMTMsXG4gICAgICAgICAgICB1dGlsaXphdGlvblJhdGU6IDc3LFxuICAgICAgICAgICAgY29zdFBlckxpY2Vuc2U6IDcyLFxuICAgICAgICAgICAgdG90YWxDb3N0OiAzNjAwMCxcbiAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlOiBuZXcgRGF0ZSgnMjAyNS0wMy0yMCcpLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdDcmVhdGl2ZScsXG4gICAgICAgICAgICBhdXRvUmVuZXc6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzMnLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdTbGFjayBFbnRlcnByaXNlJyxcbiAgICAgICAgICAgIHZlbmRvcjogJ1NhbGVzZm9yY2UnLFxuICAgICAgICAgICAgdG90YWxMaWNlbnNlczogODAwMCxcbiAgICAgICAgICAgIHVzZWRMaWNlbnNlczogNzQyMCxcbiAgICAgICAgICAgIGF2YWlsYWJsZUxpY2Vuc2VzOiA1ODAsXG4gICAgICAgICAgICB1dGlsaXphdGlvblJhdGU6IDkzLFxuICAgICAgICAgICAgY29zdFBlckxpY2Vuc2U6IDEyLFxuICAgICAgICAgICAgdG90YWxDb3N0OiA5NjAwMCxcbiAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlOiBuZXcgRGF0ZSgnMjAyNC0xMS0zMCcpLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdDb21tdW5pY2F0aW9uJyxcbiAgICAgICAgICAgIGF1dG9SZW5ldzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICc0JyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnWm9vbSBQcm8nLFxuICAgICAgICAgICAgdmVuZG9yOiAnWm9vbScsXG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzOiA2MDAwLFxuICAgICAgICAgICAgdXNlZExpY2Vuc2VzOiA0MjMwLFxuICAgICAgICAgICAgYXZhaWxhYmxlTGljZW5zZXM6IDE3NzAsXG4gICAgICAgICAgICB1dGlsaXphdGlvblJhdGU6IDcxLFxuICAgICAgICAgICAgY29zdFBlckxpY2Vuc2U6IDE1LFxuICAgICAgICAgICAgdG90YWxDb3N0OiA5MDAwMCxcbiAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlOiBuZXcgRGF0ZSgnMjAyNC0xMi0xNScpLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdDb21tdW5pY2F0aW9uJyxcbiAgICAgICAgICAgIGF1dG9SZW5ldzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICc1JyxcbiAgICAgICAgICAgIHByb2R1Y3ROYW1lOiAnQXRsYXNzaWFuIFN1aXRlJyxcbiAgICAgICAgICAgIHZlbmRvcjogJ0F0bGFzc2lhbicsXG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzOiAxMjAwLFxuICAgICAgICAgICAgdXNlZExpY2Vuc2VzOiAxMDgwLFxuICAgICAgICAgICAgYXZhaWxhYmxlTGljZW5zZXM6IDEyMCxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uUmF0ZTogOTAsXG4gICAgICAgICAgICBjb3N0UGVyTGljZW5zZTogOCxcbiAgICAgICAgICAgIHRvdGFsQ29zdDogOTYwMCxcbiAgICAgICAgICAgIGV4cGlyYXRpb25EYXRlOiBuZXcgRGF0ZSgnMjAyNS0wOC0xMCcpLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdEZXZlbG9wbWVudCcsXG4gICAgICAgICAgICBhdXRvUmVuZXc6IHRydWUsXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCB1c2FnZSA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZUlkOiAnMScsXG4gICAgICAgICAgICB1c2VySWQ6ICd1c2VyMScsXG4gICAgICAgICAgICB1c2VyTmFtZTogJ0pvaG4gRG9lJyxcbiAgICAgICAgICAgIGFzc2lnbmVkRGF0ZTogbmV3IERhdGUoJzIwMjMtMDEtMTUnKSxcbiAgICAgICAgICAgIGxhc3RVc2VkOiBuZXcgRGF0ZSgnMjAyNC0xMC0wMScpLFxuICAgICAgICAgICAgZGVwYXJ0bWVudDogJ0lUJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZUlkOiAnMScsXG4gICAgICAgICAgICB1c2VySWQ6ICd1c2VyMicsXG4gICAgICAgICAgICB1c2VyTmFtZTogJ0phbmUgU21pdGgnLFxuICAgICAgICAgICAgYXNzaWduZWREYXRlOiBuZXcgRGF0ZSgnMjAyMy0wMi0wMScpLFxuICAgICAgICAgICAgbGFzdFVzZWQ6IG5ldyBEYXRlKCcyMDI0LTA5LTI4JyksXG4gICAgICAgICAgICBkZXBhcnRtZW50OiAnTWFya2V0aW5nJyxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IGFsZXJ0cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgIHR5cGU6ICdleHBpcmF0aW9uJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnaGlnaCcsXG4gICAgICAgICAgICBtZXNzYWdlOiAnQWRvYmUgQ3JlYXRpdmUgQ2xvdWQgbGljZW5zZXMgZXhwaXJlIGluIDQ1IGRheXMnLFxuICAgICAgICAgICAgbGljZW5zZUlkOiAnMicsXG4gICAgICAgICAgICByZWNvbW1lbmRlZEFjdGlvbjogJ1JlbmV3IGxpY2Vuc2VzIG9yIHJlZGlzdHJpYnV0ZSB1bnVzZWQgb25lcycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMicsXG4gICAgICAgICAgICB0eXBlOiAndW5kZXJ1dGlsaXphdGlvbicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ21lZGl1bScsXG4gICAgICAgICAgICBtZXNzYWdlOiAnWm9vbSBQcm8gdXRpbGl6YXRpb24gYmVsb3cgODAlJyxcbiAgICAgICAgICAgIGxpY2Vuc2VJZDogJzQnLFxuICAgICAgICAgICAgcmVjb21tZW5kZWRBY3Rpb246ICdSZWNsYWltIHVudXNlZCBsaWNlbnNlcycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMycsXG4gICAgICAgICAgICB0eXBlOiAnY29tcGxpYW5jZScsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2NyaXRpY2FsJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdNaWNyb3NvZnQgMzY1IG92ZXItYWxsb2NhdGlvbiBkZXRlY3RlZCcsXG4gICAgICAgICAgICBsaWNlbnNlSWQ6ICcxJyxcbiAgICAgICAgICAgIHJlY29tbWVuZGVkQWN0aW9uOiAnQXVkaXQgbGljZW5zZSBhc3NpZ25tZW50cyBhbmQgcmVtb3ZlIHVudXNlZCBsaWNlbnNlcycsXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCBtZXRyaWNzID0ge1xuICAgICAgICB0b3RhbExpY2Vuc2VzOiBsaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbGljKSA9PiBzdW0gKyBsaWMudG90YWxMaWNlbnNlcywgMCksXG4gICAgICAgIHRvdGFsQ29zdDogbGljZW5zZXMucmVkdWNlKChzdW0sIGxpYykgPT4gc3VtICsgbGljLnRvdGFsQ29zdCwgMCksXG4gICAgICAgIGF2ZXJhZ2VVdGlsaXphdGlvbjogTWF0aC5yb3VuZChsaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbGljKSA9PiBzdW0gKyBsaWMudXRpbGl6YXRpb25SYXRlLCAwKSAvIGxpY2Vuc2VzLmxlbmd0aCksXG4gICAgICAgIGV4cGlyaW5nU29vbjogbGljZW5zZXMuZmlsdGVyKGxpYyA9PiAobGljLmV4cGlyYXRpb25EYXRlLmdldFRpbWUoKSAtIERhdGUubm93KCkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpIDwgOTApLmxlbmd0aCxcbiAgICAgICAgb3ZlclV0aWxpemVkOiBsaWNlbnNlcy5maWx0ZXIobGljID0+IGxpYy51dGlsaXphdGlvblJhdGUgPiAxMDApLmxlbmd0aCxcbiAgICAgICAgdW5kZXJVdGlsaXplZDogbGljZW5zZXMuZmlsdGVyKGxpYyA9PiBsaWMudXRpbGl6YXRpb25SYXRlIDwgNTApLmxlbmd0aCxcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpY2Vuc2VzLFxuICAgICAgICB1c2FnZSxcbiAgICAgICAgYWxlcnRzLFxuICAgICAgICBtZXRyaWNzLFxuICAgICAgICBsYXN0VXBkYXRlZDogbmV3IERhdGUoKSxcbiAgICB9O1xufVxuLyoqXG4gKiBDdXN0b20gaG9vayBmb3IgTGljZW5zZSBNYW5hZ2VtZW50IGxvZ2ljXG4gKiBQcm92aWRlcyBjb21wcmVoZW5zaXZlIGxpY2Vuc2UgdHJhY2tpbmcgYW5kIG9wdGltaXphdGlvblxuICovXG5leHBvcnQgY29uc3QgdXNlTGljZW5zZU1hbmFnZW1lbnRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbbGljZW5zZURhdGEsIHNldExpY2Vuc2VEYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzZWxlY3RlZENhdGVnb3J5LCBzZXRTZWxlY3RlZENhdGVnb3J5XSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbc29ydEJ5LCBzZXRTb3J0QnldID0gdXNlU3RhdGUoJ3V0aWxpemF0aW9uJyk7XG4gICAgY29uc3QgW2ZpbHRlckFsZXJ0cywgc2V0RmlsdGVyQWxlcnRzXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBmZXRjaExpY2Vuc2VEYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBTaW11bGF0ZSBBUEkgY2FsbCBkZWxheVxuICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIDEwMDApKTtcbiAgICAgICAgICAgIC8vIEluIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgaW50ZWdyYXRlIHdpdGg6XG4gICAgICAgICAgICAvLyAtIE1pY3Jvc29mdCBMaWNlbnNlIE1hbmFnZW1lbnRcbiAgICAgICAgICAgIC8vIC0gQWRvYmUgQWRtaW4gQ29uc29sZVxuICAgICAgICAgICAgLy8gLSBMb2NhbCBsaWNlbnNlIHNlcnZlcnNcbiAgICAgICAgICAgIC8vIC0gUHJvY3VyZW1lbnQgc3lzdGVtc1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGdldE1vY2tMaWNlbnNlTWFuYWdlbWVudERhdGEoKTtcbiAgICAgICAgICAgIHNldExpY2Vuc2VEYXRhKGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIGZldGNoIGxpY2Vuc2UgZGF0YSc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTGljZW5zZSBtYW5hZ2VtZW50IGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8vIEluaXRpYWwgbG9hZFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZldGNoTGljZW5zZURhdGEoKTtcbiAgICB9LCBbZmV0Y2hMaWNlbnNlRGF0YV0pO1xuICAgIC8vIEZpbHRlcmVkIGFuZCBzb3J0ZWQgbGljZW5zZXNcbiAgICBjb25zdCBwcm9jZXNzZWRMaWNlbnNlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWxpY2Vuc2VEYXRhKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgZmlsdGVyZWQgPSBsaWNlbnNlRGF0YS5saWNlbnNlcztcbiAgICAgICAgLy8gRmlsdGVyIGJ5IGNhdGVnb3J5XG4gICAgICAgIGlmIChzZWxlY3RlZENhdGVnb3J5ICE9PSAnYWxsJykge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobGljID0+IGxpYy5jYXRlZ29yeSA9PT0gc2VsZWN0ZWRDYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU29ydCBieSBzZWxlY3RlZCBmaWVsZFxuICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLnNsaWNlKCkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChzb3J0QnkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEucHJvZHVjdE5hbWUubG9jYWxlQ29tcGFyZShiLnByb2R1Y3ROYW1lKTtcbiAgICAgICAgICAgICAgICBjYXNlICd1dGlsaXphdGlvbic6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiLnV0aWxpemF0aW9uUmF0ZSAtIGEudXRpbGl6YXRpb25SYXRlO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Nvc3QnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYi50b3RhbENvc3QgLSBhLnRvdGFsQ29zdDtcbiAgICAgICAgICAgICAgICBjYXNlICdleHBpcmF0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuZXhwaXJhdGlvbkRhdGUuZ2V0VGltZSgpIC0gYi5leHBpcmF0aW9uRGF0ZS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfSwgW2xpY2Vuc2VEYXRhLCBzZWxlY3RlZENhdGVnb3J5LCBzb3J0QnldKTtcbiAgICAvLyBGaWx0ZXJlZCBhbGVydHNcbiAgICBjb25zdCBwcm9jZXNzZWRBbGVydHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFsaWNlbnNlRGF0YSB8fCAhZmlsdGVyQWxlcnRzKVxuICAgICAgICAgICAgcmV0dXJuIGxpY2Vuc2VEYXRhPy5hbGVydHMgfHwgW107XG4gICAgICAgIHJldHVybiBsaWNlbnNlRGF0YS5hbGVydHMuZmlsdGVyKGFsZXJ0ID0+IGFsZXJ0LnNldmVyaXR5ID09PSAnaGlnaCcgfHwgYWxlcnQuc2V2ZXJpdHkgPT09ICdjcml0aWNhbCcpO1xuICAgIH0sIFtsaWNlbnNlRGF0YSwgZmlsdGVyQWxlcnRzXSk7XG4gICAgLy8gQXZhaWxhYmxlIGNhdGVnb3JpZXNcbiAgICBjb25zdCBhdmFpbGFibGVDYXRlZ29yaWVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbGljZW5zZURhdGEpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBbLi4ubmV3IFNldChsaWNlbnNlRGF0YS5saWNlbnNlcy5tYXAobGljID0+IGxpYy5jYXRlZ29yeSkpXTtcbiAgICAgICAgcmV0dXJuIGNhdGVnb3JpZXMubWFwKGNhdCA9PiAoeyBpZDogY2F0LCBuYW1lOiBjYXQgfSkpO1xuICAgIH0sIFtsaWNlbnNlRGF0YV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpY2Vuc2VEYXRhLFxuICAgICAgICBwcm9jZXNzZWRMaWNlbnNlcyxcbiAgICAgICAgcHJvY2Vzc2VkQWxlcnRzLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBzZWxlY3RlZENhdGVnb3J5LFxuICAgICAgICBzZXRTZWxlY3RlZENhdGVnb3J5LFxuICAgICAgICBzb3J0QnksXG4gICAgICAgIHNldFNvcnRCeSxcbiAgICAgICAgZmlsdGVyQWxlcnRzLFxuICAgICAgICBzZXRGaWx0ZXJBbGVydHMsXG4gICAgICAgIGF2YWlsYWJsZUNhdGVnb3JpZXMsXG4gICAgICAgIHJlZnJlc2hEYXRhOiBmZXRjaExpY2Vuc2VEYXRhLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTGljZW5zZSBNYW5hZ2VtZW50IFZpZXdcbiAqIExpY2Vuc2UgdHJhY2tpbmcsIGNvbXBsaWFuY2UsIGFuZCBjb3N0IG9wdGltaXphdGlvblxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgS2V5LCBUcmVuZGluZ1VwLCBEb2xsYXJTaWduLCBBbGVydENpcmNsZSwgQ2hlY2tDaXJjbGUsIENsb2NrIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUxpY2Vuc2VNYW5hZ2VtZW50TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VMaWNlbnNlTWFuYWdlbWVudExvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmV4cG9ydCBjb25zdCBMaWNlbnNlTWFuYWdlbWVudFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBwcm9jZXNzZWRMaWNlbnNlcywgaXNMb2FkaW5nLCBzZWxlY3RlZENhdGVnb3J5LCBzZXRTZWxlY3RlZENhdGVnb3J5LCByZWZyZXNoRGF0YSwgfSA9IHVzZUxpY2Vuc2VNYW5hZ2VtZW50TG9naWMoKTtcbiAgICAvLyBDYWxjdWxhdGUgc3RhdHMgZnJvbSBwcm9jZXNzZWRMaWNlbnNlc1xuICAgIGNvbnN0IHN0YXRzID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdGFsTGljZW5zZXMgPSBwcm9jZXNzZWRMaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbC50b3RhbExpY2Vuc2VzLCAwKTtcbiAgICAgICAgY29uc3QgYWN0aXZlTGljZW5zZXMgPSBwcm9jZXNzZWRMaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbC51c2VkTGljZW5zZXMsIDApO1xuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCB0aGlydHlEYXlzRnJvbU5vdyA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyAzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgICBjb25zdCBleHBpcmluZ1Nvb24gPSBwcm9jZXNzZWRMaWNlbnNlcy5maWx0ZXIobCA9PiBsLmV4cGlyYXRpb25EYXRlIDw9IHRoaXJ0eURheXNGcm9tTm93ICYmIGwuZXhwaXJhdGlvbkRhdGUgPj0gbm93KS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG5vbkNvbXBsaWFudCA9IHByb2Nlc3NlZExpY2Vuc2VzLmZpbHRlcihsID0+ICFsLmF1dG9SZW5ldyAmJiBsLmV4cGlyYXRpb25EYXRlIDwgbm93KS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHRvdGFsQ29zdCA9IHByb2Nlc3NlZExpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyBsLnRvdGFsQ29zdCwgMCk7XG4gICAgICAgIGNvbnN0IHBvdGVudGlhbFNhdmluZ3MgPSBwcm9jZXNzZWRMaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgKGwuYXZhaWxhYmxlTGljZW5zZXMgKiBsLmNvc3RQZXJMaWNlbnNlKSwgMCk7XG4gICAgICAgIHJldHVybiB7IHRvdGFsTGljZW5zZXMsIGFjdGl2ZUxpY2Vuc2VzLCBleHBpcmluZ1Nvb24sIG5vbkNvbXBsaWFudCwgdG90YWxDb3N0LCBwb3RlbnRpYWxTYXZpbmdzIH07XG4gICAgfSwgW3Byb2Nlc3NlZExpY2Vuc2VzXSk7XG4gICAgY29uc3QgbGljZW5zZU1ldHJpY3MgPSBbXG4gICAgICAgIHsgbGFiZWw6ICdUb3RhbCBMaWNlbnNlcycsIHZhbHVlOiAoc3RhdHM/LnRvdGFsTGljZW5zZXMgPz8gMCksIGljb246IEtleSwgY29sb3I6ICdibHVlJyB9LFxuICAgICAgICB7IGxhYmVsOiAnQWN0aXZlJywgdmFsdWU6IChzdGF0cz8uYWN0aXZlTGljZW5zZXMgPz8gMCksIGljb246IENoZWNrQ2lyY2xlLCBjb2xvcjogJ2dyZWVuJyB9LFxuICAgICAgICB7IGxhYmVsOiAnRXhwaXJpbmcgU29vbicsIHZhbHVlOiAoc3RhdHM/LmV4cGlyaW5nU29vbiA/PyAwKSwgaWNvbjogQ2xvY2ssIGNvbG9yOiAneWVsbG93JyB9LFxuICAgICAgICB7IGxhYmVsOiAnTm9uLUNvbXBsaWFudCcsIHZhbHVlOiAoc3RhdHM/Lm5vbkNvbXBsaWFudCA/PyAwKSwgaWNvbjogQWxlcnRDaXJjbGUsIGNvbG9yOiAncmVkJyB9LFxuICAgICAgICB7IGxhYmVsOiAnVG90YWwgQ29zdCcsIHZhbHVlOiBgJCR7KChzdGF0cz8udG90YWxDb3N0ID8/IDApID8/IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgaWNvbjogRG9sbGFyU2lnbiwgY29sb3I6ICdwdXJwbGUnIH0sXG4gICAgICAgIHsgbGFiZWw6ICdQb3RlbnRpYWwgU2F2aW5ncycsIHZhbHVlOiBgJCR7KChzdGF0cz8ucG90ZW50aWFsU2F2aW5ncyA/PyAwKSA/PyAwKS50b0xvY2FsZVN0cmluZygpfWAsIGljb246IFRyZW5kaW5nVXAsIGNvbG9yOiAnZ3JlZW4nIH0sXG4gICAgXTtcbiAgICAvLyBDb2x1bW4gZGVmaW5pdGlvbnNcbiAgICBjb25zdCBjb2x1bW5EZWZzID0gUmVhY3QudXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0xpY2Vuc2UgTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3R5cGUnLCBoZWFkZXJOYW1lOiAnVHlwZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3N0YXR1cycsIGhlYWRlck5hbWU6ICdTdGF0dXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhc3NpZ25lZCcsIGhlYWRlck5hbWU6ICdBc3NpZ25lZCcsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhdmFpbGFibGUnLCBoZWFkZXJOYW1lOiAnQXZhaWxhYmxlJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2Nvc3QnLCBoZWFkZXJOYW1lOiAnQ29zdCcsIHNvcnRhYmxlOiB0cnVlLCB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCQke3BhcmFtcy52YWx1ZX1gIH0sXG4gICAgXSwgW10pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBoLWZ1bGwgcC02IGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJsaWNlbnNlLW1hbmFnZW1lbnQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwibGljZW5zZS1tYW5hZ2VtZW50LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTMgYmctcHVycGxlLTEwMCBkYXJrOmJnLXB1cnBsZS05MDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeChLZXksIHsgY2xhc3NOYW1lOiBcInctOCBoLTggdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwXCIgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkxpY2Vuc2UgTWFuYWdlbWVudFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJUcmFjaywgb3B0aW1pemUsIGFuZCBlbnN1cmUgbGljZW5zZSBjb21wbGlhbmNlXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBvbkNsaWNrOiAoKSA9PiBjb25zb2xlLmxvZygnT3B0aW1pemUgbGljZW5zZXMnKSwgXCJkYXRhLWN5XCI6IFwib3B0aW1pemUtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJvcHRpbWl6ZS1idG5cIiwgY2hpbGRyZW46IFwiT3B0aW1pemUgTGljZW5zZXNcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogKCkgPT4gY29uc29sZS5sb2coJ0V4cG9ydCByZXBvcnQnKSwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgUmVwb3J0XCIgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIG1kOmdyaWQtY29scy0zIGxnOmdyaWQtY29scy02IGdhcC00IG1iLTZcIiwgY2hpbGRyZW46IGxpY2Vuc2VNZXRyaWNzLm1hcCgobWV0cmljKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEljb24gPSBtZXRyaWMuaWNvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KEljb24sIHsgY2xhc3NOYW1lOiBgdy02IGgtNiB0ZXh0LSR7bWV0cmljLmNvbG9yfS01MDAgbWItMmAgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogbWV0cmljLnZhbHVlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBtZXRyaWMubGFiZWwgfSldIH0sIG1ldHJpYy5sYWJlbCkpO1xuICAgICAgICAgICAgICAgIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IHByb2Nlc3NlZExpY2Vuc2VzLCBjb2x1bW5zOiBjb2x1bW5EZWZzLCBsb2FkaW5nOiBpc0xvYWRpbmcgfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBMaWNlbnNlTWFuYWdlbWVudFZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==