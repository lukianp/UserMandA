"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2874],{

/***/ 15086:
/*!********************************************************!*\
  !*** ./src/renderer/hooks/useNetworkDiscoveryLogic.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useNetworkDiscoveryLogic: () => (/* binding */ useNetworkDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);

const useNetworkDiscoveryLogic = () => {
    const [config, setConfig] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        subnets: ['192.168.1.0/24'],
        scanType: 'Standard',
        includePingSweep: true,
        includePortScan: true,
        portScanRange: '1-1024',
        commonPortsOnly: false,
        includeServiceDetection: true,
        includeOsDetection: false,
        includeTopologyMapping: false,
        includeVulnerabilityDetection: false,
        timeout: 300,
        maxThreads: 50,
        retryAttempts: 2,
    });
    const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [progress, setProgress] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [activeTab, setActiveTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('overview');
    const templates = [
        {
            id: 'quick-scan',
            name: 'Quick Network Scan',
            description: 'Fast scan of active devices on primary subnet',
            config: {
                subnets: ['192.168.1.0/24'],
                scanType: 'Quick',
                includePingSweep: true,
                includePortScan: false,
                commonPortsOnly: true,
                includeServiceDetection: false,
                includeOsDetection: false,
                includeTopologyMapping: false,
                includeVulnerabilityDetection: false,
                timeout: 60,
                maxThreads: 50,
                retryAttempts: 2,
            },
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            createdBy: 'system',
            isDefault: false,
            category: 'Quick',
        },
        {
            id: 'comprehensive',
            name: 'Comprehensive Network Discovery',
            description: 'Full network discovery with topology and vulnerability scanning',
            config: {
                subnets: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
                scanType: 'Comprehensive',
                includePingSweep: true,
                includePortScan: true,
                commonPortsOnly: false,
                includeServiceDetection: true,
                includeOsDetection: true,
                includeTopologyMapping: true,
                includeVulnerabilityDetection: true,
                timeout: 3600,
                maxThreads: 100,
                retryAttempts: 3,
            },
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            createdBy: 'system',
            isDefault: true,
            category: 'Full',
        },
        {
            id: 'security-audit',
            name: 'Security Audit Scan',
            description: 'Security-focused scan with port and vulnerability analysis',
            config: {
                subnets: ['192.168.1.0/24'],
                scanType: 'Comprehensive',
                includePingSweep: true,
                includePortScan: true,
                commonPortsOnly: false,
                includeServiceDetection: true,
                includeOsDetection: false,
                includeTopologyMapping: false,
                includeVulnerabilityDetection: true,
                timeout: 1800,
                maxThreads: 75,
                retryAttempts: 2,
            },
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            createdBy: 'system',
            isDefault: false,
            category: 'Security',
        },
    ];
    const handleStartDiscovery = async () => {
        setIsLoading(true);
        setProgress(0);
        setError(null);
        setResult(null);
        try {
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
            }, 500);
            const scriptResult = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/NetworkDiscovery.psm1',
                functionName: 'Invoke-NetworkDiscovery',
                parameters: {
                    IPRanges: config.subnets,
                    IncludeDevices: config.includePingSweep,
                    IncludeSubnets: true,
                    IncludePortScan: config.includePortScan,
                    IncludeTopology: config.includeTopologyMapping,
                    IncludeVulnerabilityScan: config.includeVulnerabilityDetection,
                    PortRange: config.portScanRange || '1-1024',
                    Timeout: config.timeout,
                },
            });
            clearInterval(progressInterval);
            setProgress(100);
            if (scriptResult.success) {
                setResult(scriptResult.data);
            }
            else {
                setError(scriptResult.error || 'Network discovery failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleApplyTemplate = (template) => {
        setConfig((prev) => ({
            ...prev,
            name: template.name,
            parameters: { ...template.config },
        }));
    };
    const handleExport = async () => {
        if (!result)
            return;
        try {
            const csvContent = generateCSV(result);
            await window.electronAPI.writeFile(`NetworkDiscovery_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
    };
    const generateCSV = (data) => {
        const headers = ['Type', 'Name', 'IP Address', 'Status', 'Details'];
        const rows = [];
        data?.devices?.forEach((device) => {
            rows.push([
                'Device',
                device.hostname,
                device.ipAddress,
                device.status,
                `${device.type} - ${device.manufacturer || 'Unknown'} ${device.model || ''}`,
            ]);
        });
        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    };
    // Filter data based on search text
    const filteredDevices = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return [];
        const devices = result?.devices ?? [];
        if (!searchText)
            return devices;
        const search = searchText.toLowerCase();
        return devices.filter((device) => (device.hostname ?? '').toLowerCase().includes(search) ||
            (device.ipAddress ?? '').toLowerCase().includes(search) ||
            (device.type ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    const filteredSubnets = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return [];
        const subnets = result?.subnets ?? [];
        if (!searchText)
            return subnets;
        const search = searchText.toLowerCase();
        return subnets.filter((subnet) => (subnet.network ?? '').toLowerCase().includes(search) ||
            subnet.gateway?.toLowerCase().includes(search));
    }, [result, searchText]);
    const filteredPorts = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return [];
        const ports = result?.ports ?? [];
        if (!searchText)
            return ports;
        const search = searchText.toLowerCase();
        return ports.filter((port) => port.portNumber.toString().includes(search) ||
            port.service?.toLowerCase().includes(search) ||
            (port.protocol ?? '').toLowerCase().includes(search));
    }, [result, searchText]);
    // AG Grid column definitions
    const deviceColumns = [
        { field: 'hostname', headerName: 'Hostname', sortable: true, filter: true, flex: 1.5 },
        { field: 'ipAddress', headerName: 'IP Address', sortable: true, filter: true, flex: 1 },
        { field: 'type', headerName: 'Type', sortable: true, filter: true, flex: 1 },
        { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
        { field: 'operatingSystem', headerName: 'Operating System', sortable: true, filter: true, flex: 1.2 },
        { field: 'manufacturer', headerName: 'Vendor', sortable: true, filter: true, flex: 1 },
        { field: 'model', headerName: 'Model', sortable: true, filter: true, flex: 1 },
        { field: 'macAddress', headerName: 'MAC Address', sortable: true, filter: true, flex: 1.2 },
    ];
    const subnetColumns = [
        { field: 'network', headerName: 'Network', sortable: true, filter: true, flex: 1.5 },
        { field: 'mask', headerName: 'Subnet Mask', sortable: true, filter: true, flex: 1 },
        { field: 'gateway', headerName: 'Gateway', sortable: true, filter: true, flex: 1 },
        { field: 'dhcpServer', headerName: 'DHCP Server', sortable: true, filter: true, flex: 1 },
        { field: 'totalHosts', headerName: 'Devices', sortable: true, filter: true, flex: 0.8 },
        { field: 'vlan', headerName: 'VLAN', sortable: true, filter: true, flex: 0.8 },
    ];
    const portColumns = [
        { field: 'deviceId', headerName: 'IP Address', sortable: true, filter: true, flex: 1.2 },
        { field: 'portNumber', headerName: 'Port', sortable: true, filter: true, flex: 0.8 },
        { field: 'protocol', headerName: 'Protocol', sortable: true, filter: true, flex: 0.8 },
        { field: 'service', headerName: 'Service', sortable: true, filter: true, flex: 1 },
        { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
        { field: 'status', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
        { field: 'riskLevel', headerName: 'Risk', sortable: true, filter: true, flex: 0.8 },
    ];
    // Statistics
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!result)
            return null;
        const devices = result?.devices ?? [];
        const onlineDevices = devices.filter((d) => d.status === 'Online').length;
        const totalDevices = devices.length;
        const subnets = result?.subnets?.length ?? 0;
        const openPorts = result?.ports?.length ?? 0;
        const vulnerabilities = result?.vulnerabilities?.length ?? 0;
        const criticalVulns = (result?.vulnerabilities ?? []).filter((v) => v.severity === 'Critical').length;
        const highVulns = (result?.vulnerabilities ?? []).filter((v) => v.severity === 'High').length;
        return {
            totalDevices,
            onlineDevices,
            subnets,
            openPorts,
            vulnerabilities,
            criticalVulns,
            highVulns,
        };
    }, [result]);
    return {
        config,
        setConfig,
        result,
        isLoading,
        progress,
        error,
        searchText,
        setSearchText,
        activeTab,
        setActiveTab,
        templates,
        handleStartDiscovery,
        handleApplyTemplate,
        handleExport,
        filteredDevices,
        filteredSubnets,
        filteredPorts,
        deviceColumns,
        subnetColumns,
        portColumns,
        stats,
    };
};


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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aURBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyxrREFBUSxJQUFJLFVBQVUsbUdBQW1HLElBQUksb0JBQW9CLHNEQUFJLENBQUMsaURBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyxpREFBTyxJQUFJLFVBQVUsOEVBQThFLEtBQUssSUFBSSxHQUFHLHVEQUFLLFVBQVUscURBQXFELHNEQUFJLFVBQVUsdU5BQXVOLHNEQUFJLENBQUMsbURBQU8sSUFBSSxzQ0FBc0MsR0FBRyxJQUFJLHNEQUFJLFVBQVUsV0FBVywwQ0FBSSxxRUFBcUUsUUFBUSxZQUFZLHNEQUFJLENBQUMsc0RBQVcsSUFBSSx5YUFBeWEsR0FBRyx1QkFBdUIsdURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZU5ldHdvcmtEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBjb25zdCB1c2VOZXR3b3JrRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2NvbmZpZywgc2V0Q29uZmlnXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgc3VibmV0czogWycxOTIuMTY4LjEuMC8yNCddLFxuICAgICAgICBzY2FuVHlwZTogJ1N0YW5kYXJkJyxcbiAgICAgICAgaW5jbHVkZVBpbmdTd2VlcDogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZVBvcnRTY2FuOiB0cnVlLFxuICAgICAgICBwb3J0U2NhblJhbmdlOiAnMS0xMDI0JyxcbiAgICAgICAgY29tbW9uUG9ydHNPbmx5OiBmYWxzZSxcbiAgICAgICAgaW5jbHVkZVNlcnZpY2VEZXRlY3Rpb246IHRydWUsXG4gICAgICAgIGluY2x1ZGVPc0RldGVjdGlvbjogZmFsc2UsXG4gICAgICAgIGluY2x1ZGVUb3BvbG9neU1hcHBpbmc6IGZhbHNlLFxuICAgICAgICBpbmNsdWRlVnVsbmVyYWJpbGl0eURldGVjdGlvbjogZmFsc2UsXG4gICAgICAgIHRpbWVvdXQ6IDMwMCxcbiAgICAgICAgbWF4VGhyZWFkczogNTAsXG4gICAgICAgIHJldHJ5QXR0ZW1wdHM6IDIsXG4gICAgfSk7XG4gICAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoJ292ZXJ2aWV3Jyk7XG4gICAgY29uc3QgdGVtcGxhdGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3F1aWNrLXNjYW4nLFxuICAgICAgICAgICAgbmFtZTogJ1F1aWNrIE5ldHdvcmsgU2NhbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Zhc3Qgc2NhbiBvZiBhY3RpdmUgZGV2aWNlcyBvbiBwcmltYXJ5IHN1Ym5ldCcsXG4gICAgICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgICAgICBzdWJuZXRzOiBbJzE5Mi4xNjguMS4wLzI0J10sXG4gICAgICAgICAgICAgICAgc2NhblR5cGU6ICdRdWljaycsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVBpbmdTd2VlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlUG9ydFNjYW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbW1vblBvcnRzT25seTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU2VydmljZURldGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5jbHVkZU9zRGV0ZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlVG9wb2xvZ3lNYXBwaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlVnVsbmVyYWJpbGl0eURldGVjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGltZW91dDogNjAsXG4gICAgICAgICAgICAgICAgbWF4VGhyZWFkczogNTAsXG4gICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBjcmVhdGVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnUXVpY2snLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2NvbXByZWhlbnNpdmUnLFxuICAgICAgICAgICAgbmFtZTogJ0NvbXByZWhlbnNpdmUgTmV0d29yayBEaXNjb3ZlcnknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdGdWxsIG5ldHdvcmsgZGlzY292ZXJ5IHdpdGggdG9wb2xvZ3kgYW5kIHZ1bG5lcmFiaWxpdHkgc2Nhbm5pbmcnLFxuICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgc3VibmV0czogWycxMC4wLjAuMC84JywgJzE3Mi4xNi4wLjAvMTInLCAnMTkyLjE2OC4wLjAvMTYnXSxcbiAgICAgICAgICAgICAgICBzY2FuVHlwZTogJ0NvbXByZWhlbnNpdmUnLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVQaW5nU3dlZXA6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVBvcnRTY2FuOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbW1vblBvcnRzT25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVNlcnZpY2VEZXRlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgaW5jbHVkZU9zRGV0ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVUb3BvbG9neU1hcHBpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVZ1bG5lcmFiaWxpdHlEZXRlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgdGltZW91dDogMzYwMCxcbiAgICAgICAgICAgICAgICBtYXhUaHJlYWRzOiAxMDAsXG4gICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogMyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBjcmVhdGVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgaXNEZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdGdWxsJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdzZWN1cml0eS1hdWRpdCcsXG4gICAgICAgICAgICBuYW1lOiAnU2VjdXJpdHkgQXVkaXQgU2NhbicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY3VyaXR5LWZvY3VzZWQgc2NhbiB3aXRoIHBvcnQgYW5kIHZ1bG5lcmFiaWxpdHkgYW5hbHlzaXMnLFxuICAgICAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICAgICAgc3VibmV0czogWycxOTIuMTY4LjEuMC8yNCddLFxuICAgICAgICAgICAgICAgIHNjYW5UeXBlOiAnQ29tcHJlaGVuc2l2ZScsXG4gICAgICAgICAgICAgICAgaW5jbHVkZVBpbmdTd2VlcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlUG9ydFNjYW46IHRydWUsXG4gICAgICAgICAgICAgICAgY29tbW9uUG9ydHNPbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlU2VydmljZURldGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlT3NEZXRlY3Rpb246IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVUb3BvbG9neU1hcHBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGluY2x1ZGVWdWxuZXJhYmlsaXR5RGV0ZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDE4MDAsXG4gICAgICAgICAgICAgICAgbWF4VGhyZWFkczogNzUsXG4gICAgICAgICAgICAgICAgcmV0cnlBdHRlbXB0czogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcmVhdGVkRGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgbW9kaWZpZWREYXRlOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBjcmVhdGVkQnk6ICdzeXN0ZW0nLFxuICAgICAgICAgICAgaXNEZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnU2VjdXJpdHknLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgY29uc3QgaGFuZGxlU3RhcnREaXNjb3ZlcnkgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0UHJvZ3Jlc3MoMCk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBzZXRSZXN1bHQobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFByb2dyZXNzKChwcmV2KSA9PiBNYXRoLm1pbihwcmV2ICsgTWF0aC5yYW5kb20oKSAqIDE1LCA5NSkpO1xuICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdFJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvTmV0d29ya0Rpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdJbnZva2UtTmV0d29ya0Rpc2NvdmVyeScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBJUFJhbmdlczogY29uZmlnLnN1Ym5ldHMsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVEZXZpY2VzOiBjb25maWcuaW5jbHVkZVBpbmdTd2VlcCxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVN1Ym5ldHM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIEluY2x1ZGVQb3J0U2NhbjogY29uZmlnLmluY2x1ZGVQb3J0U2NhbixcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVRvcG9sb2d5OiBjb25maWcuaW5jbHVkZVRvcG9sb2d5TWFwcGluZyxcbiAgICAgICAgICAgICAgICAgICAgSW5jbHVkZVZ1bG5lcmFiaWxpdHlTY2FuOiBjb25maWcuaW5jbHVkZVZ1bG5lcmFiaWxpdHlEZXRlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIFBvcnRSYW5nZTogY29uZmlnLnBvcnRTY2FuUmFuZ2UgfHwgJzEtMTAyNCcsXG4gICAgICAgICAgICAgICAgICAgIFRpbWVvdXQ6IGNvbmZpZy50aW1lb3V0LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwocHJvZ3Jlc3NJbnRlcnZhbCk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcygxMDApO1xuICAgICAgICAgICAgaWYgKHNjcmlwdFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2V0UmVzdWx0KHNjcmlwdFJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKHNjcmlwdFJlc3VsdC5lcnJvciB8fCAnTmV0d29yayBkaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdBbiB1bmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVBcHBseVRlbXBsYXRlID0gKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgIHNldENvbmZpZygocHJldikgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBuYW1lOiB0ZW1wbGF0ZS5uYW1lLFxuICAgICAgICAgICAgcGFyYW1ldGVyczogeyAuLi50ZW1wbGF0ZS5jb25maWcgfSxcbiAgICAgICAgfSkpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNzdkNvbnRlbnQgPSBnZW5lcmF0ZUNTVihyZXN1bHQpO1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLndyaXRlRmlsZShgTmV0d29ya0Rpc2NvdmVyeV8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5jc3ZgLCBjc3ZDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0V4cG9ydCBmYWlsZWQnKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2VuZXJhdGVDU1YgPSAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gWydUeXBlJywgJ05hbWUnLCAnSVAgQWRkcmVzcycsICdTdGF0dXMnLCAnRGV0YWlscyddO1xuICAgICAgICBjb25zdCByb3dzID0gW107XG4gICAgICAgIGRhdGE/LmRldmljZXM/LmZvckVhY2goKGRldmljZSkgPT4ge1xuICAgICAgICAgICAgcm93cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAnRGV2aWNlJyxcbiAgICAgICAgICAgICAgICBkZXZpY2UuaG9zdG5hbWUsXG4gICAgICAgICAgICAgICAgZGV2aWNlLmlwQWRkcmVzcyxcbiAgICAgICAgICAgICAgICBkZXZpY2Uuc3RhdHVzLFxuICAgICAgICAgICAgICAgIGAke2RldmljZS50eXBlfSAtICR7ZGV2aWNlLm1hbnVmYWN0dXJlciB8fCAnVW5rbm93bid9ICR7ZGV2aWNlLm1vZGVsIHx8ICcnfWAsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbaGVhZGVycy5qb2luKCcsJyksIC4uLnJvd3MubWFwKChyb3cpID0+IHJvdy5qb2luKCcsJykpXS5qb2luKCdcXG4nKTtcbiAgICB9O1xuICAgIC8vIEZpbHRlciBkYXRhIGJhc2VkIG9uIHNlYXJjaCB0ZXh0XG4gICAgY29uc3QgZmlsdGVyZWREZXZpY2VzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBjb25zdCBkZXZpY2VzID0gcmVzdWx0Py5kZXZpY2VzID8/IFtdO1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gZGV2aWNlcztcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gZGV2aWNlcy5maWx0ZXIoKGRldmljZSkgPT4gKGRldmljZS5ob3N0bmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAoZGV2aWNlLmlwQWRkcmVzcyA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAoZGV2aWNlLnR5cGUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgfSwgW3Jlc3VsdCwgc2VhcmNoVGV4dF0pO1xuICAgIGNvbnN0IGZpbHRlcmVkU3VibmV0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3Qgc3VibmV0cyA9IHJlc3VsdD8uc3VibmV0cyA/PyBbXTtcbiAgICAgICAgaWYgKCFzZWFyY2hUZXh0KVxuICAgICAgICAgICAgcmV0dXJuIHN1Ym5ldHM7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHN1Ym5ldHMuZmlsdGVyKChzdWJuZXQpID0+IChzdWJuZXQubmV0d29yayA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICBzdWJuZXQuZ2F0ZXdheT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICB9LCBbcmVzdWx0LCBzZWFyY2hUZXh0XSk7XG4gICAgY29uc3QgZmlsdGVyZWRQb3J0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgY29uc3QgcG9ydHMgPSByZXN1bHQ/LnBvcnRzID8/IFtdO1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gcG9ydHM7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHBvcnRzLmZpbHRlcigocG9ydCkgPT4gcG9ydC5wb3J0TnVtYmVyLnRvU3RyaW5nKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgcG9ydC5zZXJ2aWNlPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIChwb3J0LnByb3RvY29sID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgIH0sIFtyZXN1bHQsIHNlYXJjaFRleHRdKTtcbiAgICAvLyBBRyBHcmlkIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgIGNvbnN0IGRldmljZUNvbHVtbnMgPSBbXG4gICAgICAgIHsgZmllbGQ6ICdob3N0bmFtZScsIGhlYWRlck5hbWU6ICdIb3N0bmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEuNSB9LFxuICAgICAgICB7IGZpZWxkOiAnaXBBZGRyZXNzJywgaGVhZGVyTmFtZTogJ0lQIEFkZHJlc3MnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICd0eXBlJywgaGVhZGVyTmFtZTogJ1R5cGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC44IH0sXG4gICAgICAgIHsgZmllbGQ6ICdvcGVyYXRpbmdTeXN0ZW0nLCBoZWFkZXJOYW1lOiAnT3BlcmF0aW5nIFN5c3RlbScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEuMiB9LFxuICAgICAgICB7IGZpZWxkOiAnbWFudWZhY3R1cmVyJywgaGVhZGVyTmFtZTogJ1ZlbmRvcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ21vZGVsJywgaGVhZGVyTmFtZTogJ01vZGVsJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnbWFjQWRkcmVzcycsIGhlYWRlck5hbWU6ICdNQUMgQWRkcmVzcycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEuMiB9LFxuICAgIF07XG4gICAgY29uc3Qgc3VibmV0Q29sdW1ucyA9IFtcbiAgICAgICAgeyBmaWVsZDogJ25ldHdvcmsnLCBoZWFkZXJOYW1lOiAnTmV0d29yaycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEuNSB9LFxuICAgICAgICB7IGZpZWxkOiAnbWFzaycsIGhlYWRlck5hbWU6ICdTdWJuZXQgTWFzaycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2dhdGV3YXknLCBoZWFkZXJOYW1lOiAnR2F0ZXdheScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2RoY3BTZXJ2ZXInLCBoZWFkZXJOYW1lOiAnREhDUCBTZXJ2ZXInLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICd0b3RhbEhvc3RzJywgaGVhZGVyTmFtZTogJ0RldmljZXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjggfSxcbiAgICAgICAgeyBmaWVsZDogJ3ZsYW4nLCBoZWFkZXJOYW1lOiAnVkxBTicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDAuOCB9LFxuICAgIF07XG4gICAgY29uc3QgcG9ydENvbHVtbnMgPSBbXG4gICAgICAgIHsgZmllbGQ6ICdkZXZpY2VJZCcsIGhlYWRlck5hbWU6ICdJUCBBZGRyZXNzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMS4yIH0sXG4gICAgICAgIHsgZmllbGQ6ICdwb3J0TnVtYmVyJywgaGVhZGVyTmFtZTogJ1BvcnQnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjggfSxcbiAgICAgICAgeyBmaWVsZDogJ3Byb3RvY29sJywgaGVhZGVyTmFtZTogJ1Byb3RvY29sJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC44IH0sXG4gICAgICAgIHsgZmllbGQ6ICdzZXJ2aWNlJywgaGVhZGVyTmFtZTogJ1NlcnZpY2UnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICd2ZXJzaW9uJywgaGVhZGVyTmFtZTogJ1ZlcnNpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAwLjggfSxcbiAgICAgICAgeyBmaWVsZDogJ3Jpc2tMZXZlbCcsIGhlYWRlck5hbWU6ICdSaXNrJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMC44IH0sXG4gICAgXTtcbiAgICAvLyBTdGF0aXN0aWNzXG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgZGV2aWNlcyA9IHJlc3VsdD8uZGV2aWNlcyA/PyBbXTtcbiAgICAgICAgY29uc3Qgb25saW5lRGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKChkKSA9PiBkLnN0YXR1cyA9PT0gJ09ubGluZScpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgdG90YWxEZXZpY2VzID0gZGV2aWNlcy5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHN1Ym5ldHMgPSByZXN1bHQ/LnN1Ym5ldHM/Lmxlbmd0aCA/PyAwO1xuICAgICAgICBjb25zdCBvcGVuUG9ydHMgPSByZXN1bHQ/LnBvcnRzPy5sZW5ndGggPz8gMDtcbiAgICAgICAgY29uc3QgdnVsbmVyYWJpbGl0aWVzID0gcmVzdWx0Py52dWxuZXJhYmlsaXRpZXM/Lmxlbmd0aCA/PyAwO1xuICAgICAgICBjb25zdCBjcml0aWNhbFZ1bG5zID0gKHJlc3VsdD8udnVsbmVyYWJpbGl0aWVzID8/IFtdKS5maWx0ZXIoKHYpID0+IHYuc2V2ZXJpdHkgPT09ICdDcml0aWNhbCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGlnaFZ1bG5zID0gKHJlc3VsdD8udnVsbmVyYWJpbGl0aWVzID8/IFtdKS5maWx0ZXIoKHYpID0+IHYuc2V2ZXJpdHkgPT09ICdIaWdoJykubGVuZ3RoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxEZXZpY2VzLFxuICAgICAgICAgICAgb25saW5lRGV2aWNlcyxcbiAgICAgICAgICAgIHN1Ym5ldHMsXG4gICAgICAgICAgICBvcGVuUG9ydHMsXG4gICAgICAgICAgICB2dWxuZXJhYmlsaXRpZXMsXG4gICAgICAgICAgICBjcml0aWNhbFZ1bG5zLFxuICAgICAgICAgICAgaGlnaFZ1bG5zLFxuICAgICAgICB9O1xuICAgIH0sIFtyZXN1bHRdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25maWcsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VhcmNoVGV4dCxcbiAgICAgICAgc2V0U2VhcmNoVGV4dCxcbiAgICAgICAgYWN0aXZlVGFiLFxuICAgICAgICBzZXRBY3RpdmVUYWIsXG4gICAgICAgIHRlbXBsYXRlcyxcbiAgICAgICAgaGFuZGxlU3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGhhbmRsZUFwcGx5VGVtcGxhdGUsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgZmlsdGVyZWREZXZpY2VzLFxuICAgICAgICBmaWx0ZXJlZFN1Ym5ldHMsXG4gICAgICAgIGZpbHRlcmVkUG9ydHMsXG4gICAgICAgIGRldmljZUNvbHVtbnMsXG4gICAgICAgIHN1Ym5ldENvbHVtbnMsXG4gICAgICAgIHBvcnRDb2x1bW5zLFxuICAgICAgICBzdGF0cyxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=