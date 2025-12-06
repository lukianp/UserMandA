"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6228],{

/***/ 26228:
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
        { label: 'Total Licenses', value: (stats?.totalLicenses ?? 0), icon: lucide_react/* Key */.Uzy, color: 'blue' },
        { label: 'Active', value: (stats?.activeLicenses ?? 0), icon: lucide_react/* CheckCircle */.rAV, color: 'green' },
        { label: 'Expiring Soon', value: (stats?.expiringSoon ?? 0), icon: lucide_react/* Clock */.zD7, color: 'yellow' },
        { label: 'Non-Compliant', value: (stats?.nonCompliant ?? 0), icon: lucide_react/* AlertCircle */.RIJ, color: 'red' },
        { label: 'Total Cost', value: `$${((stats?.totalCost ?? 0) ?? 0).toLocaleString()}`, icon: lucide_react/* DollarSign */.G9t, color: 'purple' },
        { label: 'Potential Savings', value: `$${((stats?.potentialSavings ?? 0) ?? 0).toLocaleString()}`, icon: lucide_react/* TrendingUp */.ntg, color: 'green' },
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
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "license-management-view", "data-testid": "license-management-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-purple-100 dark:bg-purple-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react/* Key */.Uzy, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "License Management" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Track, optimize, and ensure license compliance" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-3", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", onClick: () => console.log('Optimize licenses'), "data-cy": "optimize-btn", "data-testid": "optimize-btn", children: "Optimize Licenses" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: () => console.log('Export report'), "data-cy": "export-btn", children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", children: licenseMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)(Icon, { className: `w-6 h-6 text-${metric.color}-500 mb-2` }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: metric.value }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: metric.label })] }, metric.label));
                }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: processedLicenses, columns: columnDefs, loading: isLoading }) })] }));
};
/* harmony default export */ const licensing_LicenseManagementView = (LicenseManagementView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxnRUFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlTGljZW5zZU1hbmFnZW1lbnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9saWNlbnNpbmcvTGljZW5zZU1hbmFnZW1lbnRWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogR2VuZXJhdGUgbW9jayBsaWNlbnNlIG1hbmFnZW1lbnQgZGF0YVxuICovXG5mdW5jdGlvbiBnZXRNb2NrTGljZW5zZU1hbmFnZW1lbnREYXRhKCkge1xuICAgIGNvbnN0IGxpY2Vuc2VzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzEnLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdNaWNyb3NvZnQgMzY1IEUzJyxcbiAgICAgICAgICAgIHZlbmRvcjogJ01pY3Jvc29mdCcsXG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzOiAxMjUwMCxcbiAgICAgICAgICAgIHVzZWRMaWNlbnNlczogMTE4NzUsXG4gICAgICAgICAgICBhdmFpbGFibGVMaWNlbnNlczogNjI1LFxuICAgICAgICAgICAgdXRpbGl6YXRpb25SYXRlOiA5NSxcbiAgICAgICAgICAgIGNvc3RQZXJMaWNlbnNlOiAzMixcbiAgICAgICAgICAgIHRvdGFsQ29zdDogNDAwMDAwLFxuICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IG5ldyBEYXRlKCcyMDI1LTA2LTE1JyksXG4gICAgICAgICAgICBjYXRlZ29yeTogJ1Byb2R1Y3Rpdml0eScsXG4gICAgICAgICAgICBhdXRvUmVuZXc6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMicsXG4gICAgICAgICAgICBwcm9kdWN0TmFtZTogJ0Fkb2JlIENyZWF0aXZlIENsb3VkJyxcbiAgICAgICAgICAgIHZlbmRvcjogJ0Fkb2JlJyxcbiAgICAgICAgICAgIHRvdGFsTGljZW5zZXM6IDUwMCxcbiAgICAgICAgICAgIHVzZWRMaWNlbnNlczogMzg3LFxuICAgICAgICAgICAgYXZhaWxhYmxlTGljZW5zZXM6IDExMyxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uUmF0ZTogNzcsXG4gICAgICAgICAgICBjb3N0UGVyTGljZW5zZTogNzIsXG4gICAgICAgICAgICB0b3RhbENvc3Q6IDM2MDAwLFxuICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IG5ldyBEYXRlKCcyMDI1LTAzLTIwJyksXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0NyZWF0aXZlJyxcbiAgICAgICAgICAgIGF1dG9SZW5ldzogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnMycsXG4gICAgICAgICAgICBwcm9kdWN0TmFtZTogJ1NsYWNrIEVudGVycHJpc2UnLFxuICAgICAgICAgICAgdmVuZG9yOiAnU2FsZXNmb3JjZScsXG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzOiA4MDAwLFxuICAgICAgICAgICAgdXNlZExpY2Vuc2VzOiA3NDIwLFxuICAgICAgICAgICAgYXZhaWxhYmxlTGljZW5zZXM6IDU4MCxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uUmF0ZTogOTMsXG4gICAgICAgICAgICBjb3N0UGVyTGljZW5zZTogMTIsXG4gICAgICAgICAgICB0b3RhbENvc3Q6IDk2MDAwLFxuICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IG5ldyBEYXRlKCcyMDI0LTExLTMwJyksXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0NvbW11bmljYXRpb24nLFxuICAgICAgICAgICAgYXV0b1JlbmV3OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzQnLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdab29tIFBybycsXG4gICAgICAgICAgICB2ZW5kb3I6ICdab29tJyxcbiAgICAgICAgICAgIHRvdGFsTGljZW5zZXM6IDYwMDAsXG4gICAgICAgICAgICB1c2VkTGljZW5zZXM6IDQyMzAsXG4gICAgICAgICAgICBhdmFpbGFibGVMaWNlbnNlczogMTc3MCxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uUmF0ZTogNzEsXG4gICAgICAgICAgICBjb3N0UGVyTGljZW5zZTogMTUsXG4gICAgICAgICAgICB0b3RhbENvc3Q6IDkwMDAwLFxuICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IG5ldyBEYXRlKCcyMDI0LTEyLTE1JyksXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0NvbW11bmljYXRpb24nLFxuICAgICAgICAgICAgYXV0b1JlbmV3OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzUnLFxuICAgICAgICAgICAgcHJvZHVjdE5hbWU6ICdBdGxhc3NpYW4gU3VpdGUnLFxuICAgICAgICAgICAgdmVuZG9yOiAnQXRsYXNzaWFuJyxcbiAgICAgICAgICAgIHRvdGFsTGljZW5zZXM6IDEyMDAsXG4gICAgICAgICAgICB1c2VkTGljZW5zZXM6IDEwODAsXG4gICAgICAgICAgICBhdmFpbGFibGVMaWNlbnNlczogMTIwLFxuICAgICAgICAgICAgdXRpbGl6YXRpb25SYXRlOiA5MCxcbiAgICAgICAgICAgIGNvc3RQZXJMaWNlbnNlOiA4LFxuICAgICAgICAgICAgdG90YWxDb3N0OiA5NjAwLFxuICAgICAgICAgICAgZXhwaXJhdGlvbkRhdGU6IG5ldyBEYXRlKCcyMDI1LTA4LTEwJyksXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0RldmVsb3BtZW50JyxcbiAgICAgICAgICAgIGF1dG9SZW5ldzogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IHVzYWdlID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlSWQ6ICcxJyxcbiAgICAgICAgICAgIHVzZXJJZDogJ3VzZXIxJyxcbiAgICAgICAgICAgIHVzZXJOYW1lOiAnSm9obiBEb2UnLFxuICAgICAgICAgICAgYXNzaWduZWREYXRlOiBuZXcgRGF0ZSgnMjAyMy0wMS0xNScpLFxuICAgICAgICAgICAgbGFzdFVzZWQ6IG5ldyBEYXRlKCcyMDI0LTEwLTAxJyksXG4gICAgICAgICAgICBkZXBhcnRtZW50OiAnSVQnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlSWQ6ICcxJyxcbiAgICAgICAgICAgIHVzZXJJZDogJ3VzZXIyJyxcbiAgICAgICAgICAgIHVzZXJOYW1lOiAnSmFuZSBTbWl0aCcsXG4gICAgICAgICAgICBhc3NpZ25lZERhdGU6IG5ldyBEYXRlKCcyMDIzLTAyLTAxJyksXG4gICAgICAgICAgICBsYXN0VXNlZDogbmV3IERhdGUoJzIwMjQtMDktMjgnKSxcbiAgICAgICAgICAgIGRlcGFydG1lbnQ6ICdNYXJrZXRpbmcnLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgY29uc3QgYWxlcnRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJzEnLFxuICAgICAgICAgICAgdHlwZTogJ2V4cGlyYXRpb24nLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdoaWdoJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdBZG9iZSBDcmVhdGl2ZSBDbG91ZCBsaWNlbnNlcyBleHBpcmUgaW4gNDUgZGF5cycsXG4gICAgICAgICAgICBsaWNlbnNlSWQ6ICcyJyxcbiAgICAgICAgICAgIHJlY29tbWVuZGVkQWN0aW9uOiAnUmVuZXcgbGljZW5zZXMgb3IgcmVkaXN0cmlidXRlIHVudXNlZCBvbmVzJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHR5cGU6ICd1bmRlcnV0aWxpemF0aW9uJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnbWVkaXVtJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdab29tIFBybyB1dGlsaXphdGlvbiBiZWxvdyA4MCUnLFxuICAgICAgICAgICAgbGljZW5zZUlkOiAnNCcsXG4gICAgICAgICAgICByZWNvbW1lbmRlZEFjdGlvbjogJ1JlY2xhaW0gdW51c2VkIGxpY2Vuc2VzJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICczJyxcbiAgICAgICAgICAgIHR5cGU6ICdjb21wbGlhbmNlJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnY3JpdGljYWwnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ01pY3Jvc29mdCAzNjUgb3Zlci1hbGxvY2F0aW9uIGRldGVjdGVkJyxcbiAgICAgICAgICAgIGxpY2Vuc2VJZDogJzEnLFxuICAgICAgICAgICAgcmVjb21tZW5kZWRBY3Rpb246ICdBdWRpdCBsaWNlbnNlIGFzc2lnbm1lbnRzIGFuZCByZW1vdmUgdW51c2VkIGxpY2Vuc2VzJyxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IG1ldHJpY3MgPSB7XG4gICAgICAgIHRvdGFsTGljZW5zZXM6IGxpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsaWMpID0+IHN1bSArIGxpYy50b3RhbExpY2Vuc2VzLCAwKSxcbiAgICAgICAgdG90YWxDb3N0OiBsaWNlbnNlcy5yZWR1Y2UoKHN1bSwgbGljKSA9PiBzdW0gKyBsaWMudG90YWxDb3N0LCAwKSxcbiAgICAgICAgYXZlcmFnZVV0aWxpemF0aW9uOiBNYXRoLnJvdW5kKGxpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsaWMpID0+IHN1bSArIGxpYy51dGlsaXphdGlvblJhdGUsIDApIC8gbGljZW5zZXMubGVuZ3RoKSxcbiAgICAgICAgZXhwaXJpbmdTb29uOiBsaWNlbnNlcy5maWx0ZXIobGljID0+IChsaWMuZXhwaXJhdGlvbkRhdGUuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKSkgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkgPCA5MCkubGVuZ3RoLFxuICAgICAgICBvdmVyVXRpbGl6ZWQ6IGxpY2Vuc2VzLmZpbHRlcihsaWMgPT4gbGljLnV0aWxpemF0aW9uUmF0ZSA+IDEwMCkubGVuZ3RoLFxuICAgICAgICB1bmRlclV0aWxpemVkOiBsaWNlbnNlcy5maWx0ZXIobGljID0+IGxpYy51dGlsaXphdGlvblJhdGUgPCA1MCkubGVuZ3RoLFxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGljZW5zZXMsXG4gICAgICAgIHVzYWdlLFxuICAgICAgICBhbGVydHMsXG4gICAgICAgIG1ldHJpY3MsXG4gICAgICAgIGxhc3RVcGRhdGVkOiBuZXcgRGF0ZSgpLFxuICAgIH07XG59XG4vKipcbiAqIEN1c3RvbSBob29rIGZvciBMaWNlbnNlIE1hbmFnZW1lbnQgbG9naWNcbiAqIFByb3ZpZGVzIGNvbXByZWhlbnNpdmUgbGljZW5zZSB0cmFja2luZyBhbmQgb3B0aW1pemF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VMaWNlbnNlTWFuYWdlbWVudExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtsaWNlbnNlRGF0YSwgc2V0TGljZW5zZURhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlbGVjdGVkQ2F0ZWdvcnksIHNldFNlbGVjdGVkQ2F0ZWdvcnldID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IFtzb3J0QnksIHNldFNvcnRCeV0gPSB1c2VTdGF0ZSgndXRpbGl6YXRpb24nKTtcbiAgICBjb25zdCBbZmlsdGVyQWxlcnRzLCBzZXRGaWx0ZXJBbGVydHNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGZldGNoTGljZW5zZURhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIC8vIFNpbXVsYXRlIEFQSSBjYWxsIGRlbGF5XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwMCkpO1xuICAgICAgICAgICAgLy8gSW4gcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBpbnRlZ3JhdGUgd2l0aDpcbiAgICAgICAgICAgIC8vIC0gTWljcm9zb2Z0IExpY2Vuc2UgTWFuYWdlbWVudFxuICAgICAgICAgICAgLy8gLSBBZG9iZSBBZG1pbiBDb25zb2xlXG4gICAgICAgICAgICAvLyAtIExvY2FsIGxpY2Vuc2Ugc2VydmVyc1xuICAgICAgICAgICAgLy8gLSBQcm9jdXJlbWVudCBzeXN0ZW1zXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gZ2V0TW9ja0xpY2Vuc2VNYW5hZ2VtZW50RGF0YSgpO1xuICAgICAgICAgICAgc2V0TGljZW5zZURhdGEoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdGYWlsZWQgdG8gZmV0Y2ggbGljZW5zZSBkYXRhJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMaWNlbnNlIG1hbmFnZW1lbnQgZmV0Y2ggZXJyb3I6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgLy8gSW5pdGlhbCBsb2FkXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZmV0Y2hMaWNlbnNlRGF0YSgpO1xuICAgIH0sIFtmZXRjaExpY2Vuc2VEYXRhXSk7XG4gICAgLy8gRmlsdGVyZWQgYW5kIHNvcnRlZCBsaWNlbnNlc1xuICAgIGNvbnN0IHByb2Nlc3NlZExpY2Vuc2VzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghbGljZW5zZURhdGEpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGxldCBmaWx0ZXJlZCA9IGxpY2Vuc2VEYXRhLmxpY2Vuc2VzO1xuICAgICAgICAvLyBGaWx0ZXIgYnkgY2F0ZWdvcnlcbiAgICAgICAgaWYgKHNlbGVjdGVkQ2F0ZWdvcnkgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihsaWMgPT4gbGljLmNhdGVnb3J5ID09PSBzZWxlY3RlZENhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTb3J0IGJ5IHNlbGVjdGVkIGZpZWxkXG4gICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuc2xpY2UoKS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHNvcnRCeSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5wcm9kdWN0TmFtZS5sb2NhbGVDb21wYXJlKGIucHJvZHVjdE5hbWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3V0aWxpemF0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGIudXRpbGl6YXRpb25SYXRlIC0gYS51dGlsaXphdGlvblJhdGU7XG4gICAgICAgICAgICAgICAgY2FzZSAnY29zdCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiLnRvdGFsQ29zdCAtIGEudG90YWxDb3N0O1xuICAgICAgICAgICAgICAgIGNhc2UgJ2V4cGlyYXRpb24nOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5leHBpcmF0aW9uRGF0ZS5nZXRUaW1lKCkgLSBiLmV4cGlyYXRpb25EYXRlLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICB9LCBbbGljZW5zZURhdGEsIHNlbGVjdGVkQ2F0ZWdvcnksIHNvcnRCeV0pO1xuICAgIC8vIEZpbHRlcmVkIGFsZXJ0c1xuICAgIGNvbnN0IHByb2Nlc3NlZEFsZXJ0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWxpY2Vuc2VEYXRhIHx8ICFmaWx0ZXJBbGVydHMpXG4gICAgICAgICAgICByZXR1cm4gbGljZW5zZURhdGE/LmFsZXJ0cyB8fCBbXTtcbiAgICAgICAgcmV0dXJuIGxpY2Vuc2VEYXRhLmFsZXJ0cy5maWx0ZXIoYWxlcnQgPT4gYWxlcnQuc2V2ZXJpdHkgPT09ICdoaWdoJyB8fCBhbGVydC5zZXZlcml0eSA9PT0gJ2NyaXRpY2FsJyk7XG4gICAgfSwgW2xpY2Vuc2VEYXRhLCBmaWx0ZXJBbGVydHNdKTtcbiAgICAvLyBBdmFpbGFibGUgY2F0ZWdvcmllc1xuICAgIGNvbnN0IGF2YWlsYWJsZUNhdGVnb3JpZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFsaWNlbnNlRGF0YSlcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IFsuLi5uZXcgU2V0KGxpY2Vuc2VEYXRhLmxpY2Vuc2VzLm1hcChsaWMgPT4gbGljLmNhdGVnb3J5KSldO1xuICAgICAgICByZXR1cm4gY2F0ZWdvcmllcy5tYXAoY2F0ID0+ICh7IGlkOiBjYXQsIG5hbWU6IGNhdCB9KSk7XG4gICAgfSwgW2xpY2Vuc2VEYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGljZW5zZURhdGEsXG4gICAgICAgIHByb2Nlc3NlZExpY2Vuc2VzLFxuICAgICAgICBwcm9jZXNzZWRBbGVydHMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnksXG4gICAgICAgIHNldFNlbGVjdGVkQ2F0ZWdvcnksXG4gICAgICAgIHNvcnRCeSxcbiAgICAgICAgc2V0U29ydEJ5LFxuICAgICAgICBmaWx0ZXJBbGVydHMsXG4gICAgICAgIHNldEZpbHRlckFsZXJ0cyxcbiAgICAgICAgYXZhaWxhYmxlQ2F0ZWdvcmllcyxcbiAgICAgICAgcmVmcmVzaERhdGE6IGZldGNoTGljZW5zZURhdGEsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBMaWNlbnNlIE1hbmFnZW1lbnQgVmlld1xuICogTGljZW5zZSB0cmFja2luZywgY29tcGxpYW5jZSwgYW5kIGNvc3Qgb3B0aW1pemF0aW9uXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBLZXksIFRyZW5kaW5nVXAsIERvbGxhclNpZ24sIEFsZXJ0Q2lyY2xlLCBDaGVja0NpcmNsZSwgQ2xvY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlTGljZW5zZU1hbmFnZW1lbnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUxpY2Vuc2VNYW5hZ2VtZW50TG9naWMnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuZXhwb3J0IGNvbnN0IExpY2Vuc2VNYW5hZ2VtZW50VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHByb2Nlc3NlZExpY2Vuc2VzLCBpc0xvYWRpbmcsIHNlbGVjdGVkQ2F0ZWdvcnksIHNldFNlbGVjdGVkQ2F0ZWdvcnksIHJlZnJlc2hEYXRhLCB9ID0gdXNlTGljZW5zZU1hbmFnZW1lbnRMb2dpYygpO1xuICAgIC8vIENhbGN1bGF0ZSBzdGF0cyBmcm9tIHByb2Nlc3NlZExpY2Vuc2VzXG4gICAgY29uc3Qgc3RhdHMgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgdG90YWxMaWNlbnNlcyA9IHByb2Nlc3NlZExpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyBsLnRvdGFsTGljZW5zZXMsIDApO1xuICAgICAgICBjb25zdCBhY3RpdmVMaWNlbnNlcyA9IHByb2Nlc3NlZExpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyBsLnVzZWRMaWNlbnNlcywgMCk7XG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHRoaXJ0eURheXNGcm9tTm93ID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIDMwICogMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgIGNvbnN0IGV4cGlyaW5nU29vbiA9IHByb2Nlc3NlZExpY2Vuc2VzLmZpbHRlcihsID0+IGwuZXhwaXJhdGlvbkRhdGUgPD0gdGhpcnR5RGF5c0Zyb21Ob3cgJiYgbC5leHBpcmF0aW9uRGF0ZSA+PSBub3cpLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgbm9uQ29tcGxpYW50ID0gcHJvY2Vzc2VkTGljZW5zZXMuZmlsdGVyKGwgPT4gIWwuYXV0b1JlbmV3ICYmIGwuZXhwaXJhdGlvbkRhdGUgPCBub3cpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgdG90YWxDb3N0ID0gcHJvY2Vzc2VkTGljZW5zZXMucmVkdWNlKChzdW0sIGwpID0+IHN1bSArIGwudG90YWxDb3N0LCAwKTtcbiAgICAgICAgY29uc3QgcG90ZW50aWFsU2F2aW5ncyA9IHByb2Nlc3NlZExpY2Vuc2VzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyAobC5hdmFpbGFibGVMaWNlbnNlcyAqIGwuY29zdFBlckxpY2Vuc2UpLCAwKTtcbiAgICAgICAgcmV0dXJuIHsgdG90YWxMaWNlbnNlcywgYWN0aXZlTGljZW5zZXMsIGV4cGlyaW5nU29vbiwgbm9uQ29tcGxpYW50LCB0b3RhbENvc3QsIHBvdGVudGlhbFNhdmluZ3MgfTtcbiAgICB9LCBbcHJvY2Vzc2VkTGljZW5zZXNdKTtcbiAgICBjb25zdCBsaWNlbnNlTWV0cmljcyA9IFtcbiAgICAgICAgeyBsYWJlbDogJ1RvdGFsIExpY2Vuc2VzJywgdmFsdWU6IChzdGF0cz8udG90YWxMaWNlbnNlcyA/PyAwKSwgaWNvbjogS2V5LCBjb2xvcjogJ2JsdWUnIH0sXG4gICAgICAgIHsgbGFiZWw6ICdBY3RpdmUnLCB2YWx1ZTogKHN0YXRzPy5hY3RpdmVMaWNlbnNlcyA/PyAwKSwgaWNvbjogQ2hlY2tDaXJjbGUsIGNvbG9yOiAnZ3JlZW4nIH0sXG4gICAgICAgIHsgbGFiZWw6ICdFeHBpcmluZyBTb29uJywgdmFsdWU6IChzdGF0cz8uZXhwaXJpbmdTb29uID8/IDApLCBpY29uOiBDbG9jaywgY29sb3I6ICd5ZWxsb3cnIH0sXG4gICAgICAgIHsgbGFiZWw6ICdOb24tQ29tcGxpYW50JywgdmFsdWU6IChzdGF0cz8ubm9uQ29tcGxpYW50ID8/IDApLCBpY29uOiBBbGVydENpcmNsZSwgY29sb3I6ICdyZWQnIH0sXG4gICAgICAgIHsgbGFiZWw6ICdUb3RhbCBDb3N0JywgdmFsdWU6IGAkJHsoKHN0YXRzPy50b3RhbENvc3QgPz8gMCkgPz8gMCkudG9Mb2NhbGVTdHJpbmcoKX1gLCBpY29uOiBEb2xsYXJTaWduLCBjb2xvcjogJ3B1cnBsZScgfSxcbiAgICAgICAgeyBsYWJlbDogJ1BvdGVudGlhbCBTYXZpbmdzJywgdmFsdWU6IGAkJHsoKHN0YXRzPy5wb3RlbnRpYWxTYXZpbmdzID8/IDApID8/IDApLnRvTG9jYWxlU3RyaW5nKCl9YCwgaWNvbjogVHJlbmRpbmdVcCwgY29sb3I6ICdncmVlbicgfSxcbiAgICBdO1xuICAgIC8vIENvbHVtbiBkZWZpbml0aW9uc1xuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSBSZWFjdC51c2VNZW1vKCgpID0+IFtcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTGljZW5zZSBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAndHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2Fzc2lnbmVkJywgaGVhZGVyTmFtZTogJ0Fzc2lnbmVkJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2F2YWlsYWJsZScsIGhlYWRlck5hbWU6ICdBdmFpbGFibGUnLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnY29zdCcsIGhlYWRlck5hbWU6ICdDb3N0Jywgc29ydGFibGU6IHRydWUsIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBgJCR7cGFyYW1zLnZhbHVlfWAgfSxcbiAgICBdLCBbXSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImxpY2Vuc2UtbWFuYWdlbWVudC12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJsaWNlbnNlLW1hbmFnZW1lbnQtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtMyBiZy1wdXJwbGUtMTAwIGRhcms6YmctcHVycGxlLTkwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBfanN4KEtleSwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LXB1cnBsZS02MDAgZGFyazp0ZXh0LXB1cnBsZS00MDBcIiB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiTGljZW5zZSBNYW5hZ2VtZW50XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlRyYWNrLCBvcHRpbWl6ZSwgYW5kIGVuc3VyZSBsaWNlbnNlIGNvbXBsaWFuY2VcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6ICgpID0+IGNvbnNvbGUubG9nKCdPcHRpbWl6ZSBsaWNlbnNlcycpLCBcImRhdGEtY3lcIjogXCJvcHRpbWl6ZS1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm9wdGltaXplLWJ0blwiLCBjaGlsZHJlbjogXCJPcHRpbWl6ZSBMaWNlbnNlc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiAoKSA9PiBjb25zb2xlLmxvZygnRXhwb3J0IHJlcG9ydCcpLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTMgbGc6Z3JpZC1jb2xzLTYgZ2FwLTQgbWItNlwiLCBjaGlsZHJlbjogbGljZW5zZU1ldHJpY3MubWFwKChtZXRyaWMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgSWNvbiA9IG1ldHJpYy5pY29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBwLTQgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goSWNvbiwgeyBjbGFzc05hbWU6IGB3LTYgaC02IHRleHQtJHttZXRyaWMuY29sb3J9LTUwMCBtYi0yYCB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBtZXRyaWMudmFsdWUgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IG1ldHJpYy5sYWJlbCB9KV0gfSwgbWV0cmljLmxhYmVsKSk7XG4gICAgICAgICAgICAgICAgfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogcHJvY2Vzc2VkTGljZW5zZXMsIGNvbHVtbnM6IGNvbHVtbkRlZnMsIGxvYWRpbmc6IGlzTG9hZGluZyB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IExpY2Vuc2VNYW5hZ2VtZW50VmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9