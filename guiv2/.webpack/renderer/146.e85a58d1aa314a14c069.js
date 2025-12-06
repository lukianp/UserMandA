(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[146],{

/***/ 30763:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ assets_NetworkDeviceInventoryView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/recharts/es6/index.js + 3 modules
var es6 = __webpack_require__(72085);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useNetworkDeviceInventoryLogic.ts
/**
 * Network Device Inventory Logic Hook
 * Handles network device discovery and inventory management
 */


const useNetworkDeviceInventoryLogic = () => {
    const { selectedSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    // Data state
    const [data, setData] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    // Filter state
    const [filters, setFilters] = (0,react.useState)({
        deviceType: '',
        vendor: '',
        status: '',
        location: '',
        searchText: '',
    });
    // Selection state
    const [selectedDevices, setSelectedDevices] = (0,react.useState)([]);
    // Column definitions
    const columns = (0,react.useMemo)(() => [
        {
            headerName: 'Device Name',
            field: 'deviceName',
            pinned: 'left',
            width: 180,
            filter: 'agTextColumnFilter',
            checkboxSelection: true,
            headerCheckboxSelection: true,
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 100,
            cellRenderer: (params) => {
                const color = params.value === 'Online'
                    ? 'text-green-600'
                    : params.value === 'Offline'
                        ? 'text-red-600'
                        : 'text-yellow-600';
                return `<span class="${color} font-semibold">${params.value}</span>`;
            },
        },
        {
            headerName: 'Type',
            field: 'deviceType',
            width: 120,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Vendor',
            field: 'manufacturer',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Model',
            field: 'model',
            width: 180,
        },
        {
            headerName: 'IP Address',
            field: 'ipAddress',
            width: 140,
        },
        {
            headerName: 'MAC Address',
            field: 'macAddress',
            width: 150,
        },
        {
            headerName: 'Firmware',
            field: 'firmware',
            width: 140,
        },
        {
            headerName: 'Location',
            field: 'location',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Building',
            field: 'building',
            width: 120,
        },
        {
            headerName: 'Floor',
            field: 'floor',
            width: 100,
        },
        {
            headerName: 'Rack',
            field: 'rack',
            width: 100,
        },
        {
            headerName: 'Serial Number',
            field: 'serialNumber',
            width: 180,
        },
        {
            headerName: 'VLAN',
            field: 'vlan',
            width: 100,
        },
        {
            headerName: 'Subnet',
            field: 'subnet',
            width: 150,
        },
        {
            headerName: 'Port Count',
            field: 'portCount',
            width: 110,
            type: 'numericColumn',
        },
        {
            headerName: 'Ports Used',
            field: 'portsUsed',
            width: 120,
            type: 'numericColumn',
        },
        {
            headerName: 'Port Utilization',
            field: 'portUtilization',
            width: 150,
            cellRenderer: (params) => {
                if (!params.data)
                    return '';
                const pct = (params.data.portsUsed / params.data.portCount) * 100;
                const color = pct > 90 ? 'text-red-600' : pct > 75 ? 'text-yellow-600' : 'text-green-600';
                return `<span class="${color} font-semibold">${pct.toFixed(1)}%</span>`;
            },
        },
        {
            headerName: 'Uptime',
            field: 'uptime',
            width: 140,
        },
        {
            headerName: 'Last Seen',
            field: 'lastSeen',
            width: 180,
            valueFormatter: (params) => {
                if (!params.value)
                    return '';
                return new Date(params.value).toLocaleString();
            },
        },
        {
            headerName: 'Warranty Status',
            field: 'warrantyStatus',
            width: 150,
            cellRenderer: (params) => {
                const colorMap = {
                    Active: 'text-green-600',
                    Expiring: 'text-yellow-600',
                    Expired: 'text-red-600',
                };
                const color = colorMap[params.value] || 'text-gray-600';
                return `<span class="${color} font-semibold">${params.value}</span>`;
            },
        },
        {
            headerName: 'Warranty Expiry',
            field: 'warrantyExpiry',
            width: 180,
            valueFormatter: (params) => {
                if (!params.value)
                    return 'Unknown';
                return new Date(params.value).toLocaleDateString();
            },
        },
    ], []);
    // Filtered data
    const filteredData = (0,react.useMemo)(() => {
        let result = [...data];
        if (filters.deviceType) {
            result = result.filter((item) => (item.deviceType ?? '').toLowerCase().includes(filters.deviceType.toLowerCase()));
        }
        if (filters.vendor) {
            result = result.filter((item) => (item.manufacturer ?? '').toLowerCase().includes(filters.vendor.toLowerCase()));
        }
        if (filters.status) {
            result = result.filter((item) => item.status === filters.status);
        }
        if (filters.location) {
            result = result.filter((item) => (item.location ?? '').toLowerCase().includes(filters.location.toLowerCase()));
        }
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((item) => (item.deviceName ?? '').toLowerCase().includes(search) ||
                (item.ipAddress ?? '').toLowerCase().includes(search) ||
                (item.macAddress ?? '').toLowerCase().includes(search));
        }
        return result;
    }, [data, filters]);
    // Filter options
    const filterOptions = (0,react.useMemo)(() => {
        const deviceTypes = [...new Set((data ?? []).map((d) => d.deviceType))].sort();
        const vendors = [...new Set((data ?? []).map((d) => d.manufacturer))].sort();
        const statuses = [...new Set((data ?? []).map((d) => d.status))].sort();
        const locations = [...new Set((data ?? []).map((d) => d.location))].sort();
        return { deviceTypes, vendors, statuses, locations };
    }, [data]);
    // Load data
    const loadData = (0,react.useCallback)(async () => {
        if (!selectedSourceProfile) {
            setError('No source profile selected');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/NetworkDeviceInventory.psm1',
                functionName: 'Get-NetworkDeviceInventory',
                parameters: {
                    Domain: selectedSourceProfile.domain,
                    Credential: selectedSourceProfile.credential,
                },
                options: {
                    timeout: 300000, // 5 minutes
                },
            });
            if (result.success && result.data) {
                setData(result.data.devices || []);
            }
            else {
                throw new Error(result.error || 'Failed to load network device inventory');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedSourceProfile]);
    // Update filter
    const updateFilter = (0,react.useCallback)((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);
    // Clear filters
    const clearFilters = (0,react.useCallback)(() => {
        setFilters({
            deviceType: '',
            vendor: '',
            status: '',
            location: '',
            searchText: '',
        });
    }, []);
    // Export data
    const exportData = (0,react.useCallback)(async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `network-devices-${timestamp}.csv`;
        return { filename, data: filteredData };
    }, [filteredData]);
    // Ping test
    const pingTest = (0,react.useCallback)(async (device) => {
        console.log('Ping test for:', device);
        // Implementation would call PowerShell Test-Connection
    }, []);
    // View configuration
    const viewConfiguration = (0,react.useCallback)((device) => {
        console.log('View configuration for:', device);
    }, []);
    // Statistics
    const stats = (0,react.useMemo)(() => {
        const total = filteredData.length;
        const online = filteredData.filter((d) => d.status === 'Online').length;
        const offline = filteredData.filter((d) => d.status === 'Offline').length;
        const warrantyExpiring = filteredData.filter((d) => d.isWarrantyExpiring).length;
        const warrantyExpired = filteredData.filter((d) => d.isWarrantyExpired).length;
        const highUtilization = filteredData.filter((d) => d.portsUsed / d.portCount > 0.9).length;
        return {
            total,
            online,
            offline,
            onlinePercentage: total > 0 ? ((online / total) * 100).toFixed(1) : '0',
            warrantyExpiring,
            warrantyExpired,
            highUtilization,
        };
    }, [filteredData]);
    // Device type distribution
    const typeDistribution = (0,react.useMemo)(() => {
        const typeCounts = filteredData.reduce((acc, device) => {
            acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(typeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
    }, [filteredData]);
    // Load data on mount
    (0,react.useEffect)(() => {
        if (selectedSourceProfile) {
            loadData();
        }
    }, [selectedSourceProfile, loadData]);
    return {
        // Data
        data: filteredData,
        columns,
        isLoading,
        error,
        // Filters
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        // Selection
        selectedDevices,
        setSelectedDevices,
        // Actions
        loadData,
        exportData,
        pingTest,
        viewConfiguration,
        // Statistics
        stats,
        typeDistribution,
        // Profile
        selectedProfile: selectedSourceProfile,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
;// ./src/renderer/views/assets/NetworkDeviceInventoryView.tsx

/**
 * Network Device Inventory View
 * Displays network device inventory with type, vendor, and connectivity information
 */








const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const NetworkDeviceInventoryView = () => {
    const { data, columns, isLoading, error, filters, filterOptions, updateFilter, clearFilters, selectedDevices, setSelectedDevices, loadData, exportData, pingTest, viewConfiguration, stats, typeDistribution, selectedProfile, } = useNetworkDeviceInventoryLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "network-device-inventory-view", "data-testid": "network-device-inventory-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Network */.lgv, { className: "w-8 h-8 text-cyan-600 dark:text-cyan-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Network Device Inventory" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Manage network infrastructure devices and connectivity" })] })] }), selectedProfile && ((0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] }))] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-cyan-600 dark:text-cyan-400 font-medium", children: "Total Devices" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-cyan-900 dark:text-cyan-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Online" }), (0,jsx_runtime.jsxs)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: [stats?.online ?? 0, (0,jsx_runtime.jsxs)("span", { className: "text-sm ml-2 text-green-600 dark:text-green-400", children: ["(", stats?.onlinePercentage ?? 0, "%)"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Offline" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.offline ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400 font-medium", children: "Warranty Expiring" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: stats?.warrantyExpiring ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "Warranty Expired" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.warrantyExpired ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "High Utilization" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: stats?.highUtilization ?? 0 })] })] }), typeDistribution?.length > 0 && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-2", children: "Device Type Distribution" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 200, children: (0,jsx_runtime.jsxs)(es6/* PieChart */.rW, { children: [(0,jsx_runtime.jsx)(es6/* Pie */.Fq, { data: typeDistribution, dataKey: "count", nameKey: "type", cx: "50%", cy: "50%", outerRadius: 80, label: (entry) => `${entry.type}: ${entry.count}`, children: typeDistribution.map((entry, index) => ((0,jsx_runtime.jsx)(es6/* Cell */.fh, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, {}), (0,jsx_runtime.jsx)(es6/* Legend */.s$, {})] }) })] }))] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.deviceType || filters.vendor || filters.status || filters.location || filters.searchText) && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search name, IP, MAC...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.deviceType, onChange: (value) => updateFilter('deviceType', value), "data-cy": "device-type-select", options: [
                                    { value: '', label: 'All Device Types' },
                                    ...(filterOptions?.deviceTypes ?? []).map((type) => ({ value: type, label: type }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.vendor, onChange: (value) => updateFilter('vendor', value), "data-cy": "vendor-select", "data-testid": "vendor-select", options: [
                                    { value: '', label: 'All Vendors' },
                                    ...(filterOptions?.vendors ?? []).map((vendor) => ({ value: vendor, label: vendor }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.status, onChange: (value) => updateFilter('status', value), "data-cy": "status-select", "data-testid": "status-select", options: [
                                    { value: '', label: 'All Statuses' },
                                    ...(filterOptions?.statuses ?? []).map((status) => ({ value: status, label: status }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.location, onChange: (value) => updateFilter('location', value), "data-cy": "location-select", "data-testid": "location-select", options: [
                                    { value: '', label: 'All Locations' },
                                    ...(filterOptions?.locations ?? []).map((location) => ({ value: location, label: location }))
                                ] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), selectedDevices.length > 0 && ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-4 h-4" }), onClick: () => selectedDevices[0] && pingTest(selectedDevices[0]), "data-cy": "ping-test-btn", "data-testid": "ping-test-btn", children: ["Ping Test (", selectedDevices.length, ")"] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Eye */.kU3, { className: "w-4 h-4" }), onClick: () => selectedDevices[0] && viewConfiguration(selectedDevices[0]), "data-cy": "view-config-btn", "data-testid": "view-config-btn", children: "View Configuration" })] }))] }), (0,jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: exportData, disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", "data-testid": "export-btn", children: "Export CSV" }) })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedDevices, height: "calc(100vh - 650px)" }) })] }));
};
/* harmony default export */ const assets_NetworkDeviceInventoryView = (NetworkDeviceInventoryView);


/***/ }),

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ 59944:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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


/***/ }),

/***/ 68827:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 71926:
/***/ (() => {

/* (ignored) */

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksR0FBRyx1REFBSyxVQUFVLHFEQUFxRCxzREFBSSxVQUFVLHVOQUF1TixzREFBSSxDQUFDLDREQUFPLElBQUksc0NBQXNDLEdBQUcsSUFBSSxzREFBSSxVQUFVLFdBQVcsbURBQUkscUVBQXFFLFFBQVEsWUFBWSxzREFBSSxDQUFDLGdFQUFXLElBQUkseWFBQXlhLEdBQUcsdUJBQXVCLHVEQUFLLFVBQVUsNkpBQTZKLHNEQUFJLFNBQVMsd0VBQXdFLHlCQUF5Qix1REFBSyxZQUFZLHNEQUFzRCxzREFBSSxZQUFZO0FBQ3IyRTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsR0FBRyxzREFBSSxXQUFXLDZEQUE2RCxJQUFJLGlCQUFpQixLQUFLLElBQUk7QUFDeEo7QUFDTyw0QkFBNEIsNkNBQWdCO0FBQ25EO0FBQ0E7Ozs7Ozs7O0FDbEtBLGU7Ozs7Ozs7QUNBQSxlIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlTmV0d29ya0RldmljZUludmVudG9yeUxvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2Fzc2V0cy9OZXR3b3JrRGV2aWNlSW52ZW50b3J5Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBOZXR3b3JrIERldmljZSBJbnZlbnRvcnkgTG9naWMgSG9va1xuICogSGFuZGxlcyBuZXR3b3JrIGRldmljZSBkaXNjb3ZlcnkgYW5kIGludmVudG9yeSBtYW5hZ2VtZW50XG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VOZXR3b3JrRGV2aWNlSW52ZW50b3J5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIC8vIERhdGEgc3RhdGVcbiAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIC8vIEZpbHRlciBzdGF0ZVxuICAgIGNvbnN0IFtmaWx0ZXJzLCBzZXRGaWx0ZXJzXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgZGV2aWNlVHlwZTogJycsXG4gICAgICAgIHZlbmRvcjogJycsXG4gICAgICAgIHN0YXR1czogJycsXG4gICAgICAgIGxvY2F0aW9uOiAnJyxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgfSk7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlXG4gICAgY29uc3QgW3NlbGVjdGVkRGV2aWNlcywgc2V0U2VsZWN0ZWREZXZpY2VzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvLyBDb2x1bW4gZGVmaW5pdGlvbnNcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXZpY2UgTmFtZScsXG4gICAgICAgICAgICBmaWVsZDogJ2RldmljZU5hbWUnLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcGFyYW1zLnZhbHVlID09PSAnT25saW5lJ1xuICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LWdyZWVuLTYwMCdcbiAgICAgICAgICAgICAgICAgICAgOiBwYXJhbXMudmFsdWUgPT09ICdPZmZsaW5lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1yZWQtNjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC15ZWxsb3ctNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgZmllbGQ6ICdkZXZpY2VUeXBlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVmVuZG9yJyxcbiAgICAgICAgICAgIGZpZWxkOiAnbWFudWZhY3R1cmVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTW9kZWwnLFxuICAgICAgICAgICAgZmllbGQ6ICdtb2RlbCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSVAgQWRkcmVzcycsXG4gICAgICAgICAgICBmaWVsZDogJ2lwQWRkcmVzcycsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTUFDIEFkZHJlc3MnLFxuICAgICAgICAgICAgZmllbGQ6ICdtYWNBZGRyZXNzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdGaXJtd2FyZScsXG4gICAgICAgICAgICBmaWVsZDogJ2Zpcm13YXJlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMb2NhdGlvbicsXG4gICAgICAgICAgICBmaWVsZDogJ2xvY2F0aW9uJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQnVpbGRpbmcnLFxuICAgICAgICAgICAgZmllbGQ6ICdidWlsZGluZycsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRmxvb3InLFxuICAgICAgICAgICAgZmllbGQ6ICdmbG9vcicsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUmFjaycsXG4gICAgICAgICAgICBmaWVsZDogJ3JhY2snLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NlcmlhbCBOdW1iZXInLFxuICAgICAgICAgICAgZmllbGQ6ICdzZXJpYWxOdW1iZXInLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1ZMQU4nLFxuICAgICAgICAgICAgZmllbGQ6ICd2bGFuJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdWJuZXQnLFxuICAgICAgICAgICAgZmllbGQ6ICdzdWJuZXQnLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1BvcnQgQ291bnQnLFxuICAgICAgICAgICAgZmllbGQ6ICdwb3J0Q291bnQnLFxuICAgICAgICAgICAgd2lkdGg6IDExMCxcbiAgICAgICAgICAgIHR5cGU6ICdudW1lcmljQ29sdW1uJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1BvcnRzIFVzZWQnLFxuICAgICAgICAgICAgZmllbGQ6ICdwb3J0c1VzZWQnLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHR5cGU6ICdudW1lcmljQ29sdW1uJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1BvcnQgVXRpbGl6YXRpb24nLFxuICAgICAgICAgICAgZmllbGQ6ICdwb3J0VXRpbGl6YXRpb24nLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBwY3QgPSAocGFyYW1zLmRhdGEucG9ydHNVc2VkIC8gcGFyYW1zLmRhdGEucG9ydENvdW50KSAqIDEwMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IHBjdCA+IDkwID8gJ3RleHQtcmVkLTYwMCcgOiBwY3QgPiA3NSA/ICd0ZXh0LXllbGxvdy02MDAnIDogJ3RleHQtZ3JlZW4tNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGN0LnRvRml4ZWQoMSl9JTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VwdGltZScsXG4gICAgICAgICAgICBmaWVsZDogJ3VwdGltZScsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTGFzdCBTZWVuJyxcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdFNlZW4nLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1dhcnJhbnR5IFN0YXR1cycsXG4gICAgICAgICAgICBmaWVsZDogJ3dhcnJhbnR5U3RhdHVzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgQWN0aXZlOiAndGV4dC1ncmVlbi02MDAnLFxuICAgICAgICAgICAgICAgICAgICBFeHBpcmluZzogJ3RleHQteWVsbG93LTYwMCcsXG4gICAgICAgICAgICAgICAgICAgIEV4cGlyZWQ6ICd0ZXh0LXJlZC02MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICd0ZXh0LWdyYXktNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1dhcnJhbnR5IEV4cGlyeScsXG4gICAgICAgICAgICBmaWVsZDogJ3dhcnJhbnR5RXhwaXJ5JyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1Vua25vd24nO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgLy8gRmlsdGVyZWQgZGF0YVxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gWy4uLmRhdGFdO1xuICAgICAgICBpZiAoZmlsdGVycy5kZXZpY2VUeXBlKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5kZXZpY2VUeXBlID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMuZGV2aWNlVHlwZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMudmVuZG9yKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5tYW51ZmFjdHVyZXIgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVycy52ZW5kb3IudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnN0YXR1cykge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5zdGF0dXMgPT09IGZpbHRlcnMuc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5sb2NhdGlvbikge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0ubG9jYXRpb24gPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVycy5sb2NhdGlvbi50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gZmlsdGVycy5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5kZXZpY2VOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAoaXRlbS5pcEFkZHJlc3MgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLm1hY0FkZHJlc3MgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YSwgZmlsdGVyc10pO1xuICAgIC8vIEZpbHRlciBvcHRpb25zXG4gICAgY29uc3QgZmlsdGVyT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBkZXZpY2VUeXBlcyA9IFsuLi5uZXcgU2V0KChkYXRhID8/IFtdKS5tYXAoKGQpID0+IGQuZGV2aWNlVHlwZSkpXS5zb3J0KCk7XG4gICAgICAgIGNvbnN0IHZlbmRvcnMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLm1hbnVmYWN0dXJlcikpXS5zb3J0KCk7XG4gICAgICAgIGNvbnN0IHN0YXR1c2VzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5zdGF0dXMpKV0uc29ydCgpO1xuICAgICAgICBjb25zdCBsb2NhdGlvbnMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLmxvY2F0aW9uKSldLnNvcnQoKTtcbiAgICAgICAgcmV0dXJuIHsgZGV2aWNlVHlwZXMsIHZlbmRvcnMsIHN0YXR1c2VzLCBsb2NhdGlvbnMgfTtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgZGF0YVxuICAgIGNvbnN0IGxvYWREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIHNvdXJjZSBwcm9maWxlIHNlbGVjdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvTmV0d29ya0RldmljZUludmVudG9yeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtTmV0d29ya0RldmljZUludmVudG9yeScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBEb21haW46IHNlbGVjdGVkU291cmNlUHJvZmlsZS5kb21haW4sXG4gICAgICAgICAgICAgICAgICAgIENyZWRlbnRpYWw6IHNlbGVjdGVkU291cmNlUHJvZmlsZS5jcmVkZW50aWFsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAzMDAwMDAsIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzdWx0LmRhdGEuZGV2aWNlcyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCBuZXR3b3JrIGRldmljZSBpbnZlbnRvcnknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlXSk7XG4gICAgLy8gVXBkYXRlIGZpbHRlclxuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIENsZWFyIGZpbHRlcnNcbiAgICBjb25zdCBjbGVhckZpbHRlcnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoe1xuICAgICAgICAgICAgZGV2aWNlVHlwZTogJycsXG4gICAgICAgICAgICB2ZW5kb3I6ICcnLFxuICAgICAgICAgICAgc3RhdHVzOiAnJyxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnJyxcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICB9KTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRXhwb3J0IGRhdGFcbiAgICBjb25zdCBleHBvcnREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvWzouXS9nLCAnLScpO1xuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGBuZXR3b3JrLWRldmljZXMtJHt0aW1lc3RhbXB9LmNzdmA7XG4gICAgICAgIHJldHVybiB7IGZpbGVuYW1lLCBkYXRhOiBmaWx0ZXJlZERhdGEgfTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gUGluZyB0ZXN0XG4gICAgY29uc3QgcGluZ1Rlc3QgPSB1c2VDYWxsYmFjayhhc3luYyAoZGV2aWNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQaW5nIHRlc3QgZm9yOicsIGRldmljZSk7XG4gICAgICAgIC8vIEltcGxlbWVudGF0aW9uIHdvdWxkIGNhbGwgUG93ZXJTaGVsbCBUZXN0LUNvbm5lY3Rpb25cbiAgICB9LCBbXSk7XG4gICAgLy8gVmlldyBjb25maWd1cmF0aW9uXG4gICAgY29uc3Qgdmlld0NvbmZpZ3VyYXRpb24gPSB1c2VDYWxsYmFjaygoZGV2aWNlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdWaWV3IGNvbmZpZ3VyYXRpb24gZm9yOicsIGRldmljZSk7XG4gICAgfSwgW10pO1xuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbCA9IGZpbHRlcmVkRGF0YS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG9ubGluZSA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQuc3RhdHVzID09PSAnT25saW5lJykubGVuZ3RoO1xuICAgICAgICBjb25zdCBvZmZsaW5lID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5zdGF0dXMgPT09ICdPZmZsaW5lJykubGVuZ3RoO1xuICAgICAgICBjb25zdCB3YXJyYW50eUV4cGlyaW5nID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5pc1dhcnJhbnR5RXhwaXJpbmcpLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgd2FycmFudHlFeHBpcmVkID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5pc1dhcnJhbnR5RXhwaXJlZCkubGVuZ3RoO1xuICAgICAgICBjb25zdCBoaWdoVXRpbGl6YXRpb24gPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLnBvcnRzVXNlZCAvIGQucG9ydENvdW50ID4gMC45KS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIG9ubGluZSxcbiAgICAgICAgICAgIG9mZmxpbmUsXG4gICAgICAgICAgICBvbmxpbmVQZXJjZW50YWdlOiB0b3RhbCA+IDAgPyAoKG9ubGluZSAvIHRvdGFsKSAqIDEwMCkudG9GaXhlZCgxKSA6ICcwJyxcbiAgICAgICAgICAgIHdhcnJhbnR5RXhwaXJpbmcsXG4gICAgICAgICAgICB3YXJyYW50eUV4cGlyZWQsXG4gICAgICAgICAgICBoaWdoVXRpbGl6YXRpb24sXG4gICAgICAgIH07XG4gICAgfSwgW2ZpbHRlcmVkRGF0YV0pO1xuICAgIC8vIERldmljZSB0eXBlIGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IHR5cGVEaXN0cmlidXRpb24gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgdHlwZUNvdW50cyA9IGZpbHRlcmVkRGF0YS5yZWR1Y2UoKGFjYywgZGV2aWNlKSA9PiB7XG4gICAgICAgICAgICBhY2NbZGV2aWNlLmRldmljZVR5cGVdID0gKGFjY1tkZXZpY2UuZGV2aWNlVHlwZV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXModHlwZUNvdW50cylcbiAgICAgICAgICAgIC5tYXAoKFt0eXBlLCBjb3VudF0pID0+ICh7IHR5cGUsIGNvdW50IH0pKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY291bnQgLSBhLmNvdW50KTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gTG9hZCBkYXRhIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgbG9hZERhdGEoKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGxvYWREYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBkYXRhOiBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIC8vIEZpbHRlcnNcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgdXBkYXRlRmlsdGVyLFxuICAgICAgICBjbGVhckZpbHRlcnMsXG4gICAgICAgIC8vIFNlbGVjdGlvblxuICAgICAgICBzZWxlY3RlZERldmljZXMsXG4gICAgICAgIHNldFNlbGVjdGVkRGV2aWNlcyxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBsb2FkRGF0YSxcbiAgICAgICAgZXhwb3J0RGF0YSxcbiAgICAgICAgcGluZ1Rlc3QsXG4gICAgICAgIHZpZXdDb25maWd1cmF0aW9uLFxuICAgICAgICAvLyBTdGF0aXN0aWNzXG4gICAgICAgIHN0YXRzLFxuICAgICAgICB0eXBlRGlzdHJpYnV0aW9uLFxuICAgICAgICAvLyBQcm9maWxlXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBOZXR3b3JrIERldmljZSBJbnZlbnRvcnkgVmlld1xuICogRGlzcGxheXMgbmV0d29yayBkZXZpY2UgaW52ZW50b3J5IHdpdGggdHlwZSwgdmVuZG9yLCBhbmQgY29ubmVjdGl2aXR5IGluZm9ybWF0aW9uXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBOZXR3b3JrLCBSZWZyZXNoQ3csIERvd25sb2FkLCBFeWUsIEZpbHRlciwgWCwgQWN0aXZpdHkgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgUGllQ2hhcnQsIFBpZSwgQ2VsbCwgUmVzcG9uc2l2ZUNvbnRhaW5lciwgTGVnZW5kLCBUb29sdGlwIH0gZnJvbSAncmVjaGFydHMnO1xuaW1wb3J0IHsgdXNlTmV0d29ya0RldmljZUludmVudG9yeUxvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlTmV0d29ya0RldmljZUludmVudG9yeUxvZ2ljJztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5jb25zdCBDT0xPUlMgPSBbJyMzYjgyZjYnLCAnIzhiNWNmNicsICcjMTBiOTgxJywgJyNmNTllMGInLCAnI2VmNDQ0NCcsICcjMDZiNmQ0J107XG5jb25zdCBOZXR3b3JrRGV2aWNlSW52ZW50b3J5VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIGNvbHVtbnMsIGlzTG9hZGluZywgZXJyb3IsIGZpbHRlcnMsIGZpbHRlck9wdGlvbnMsIHVwZGF0ZUZpbHRlciwgY2xlYXJGaWx0ZXJzLCBzZWxlY3RlZERldmljZXMsIHNldFNlbGVjdGVkRGV2aWNlcywgbG9hZERhdGEsIGV4cG9ydERhdGEsIHBpbmdUZXN0LCB2aWV3Q29uZmlndXJhdGlvbiwgc3RhdHMsIHR5cGVEaXN0cmlidXRpb24sIHNlbGVjdGVkUHJvZmlsZSwgfSA9IHVzZU5ldHdvcmtEZXZpY2VJbnZlbnRvcnlMb2dpYygpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcIm5ldHdvcmstZGV2aWNlLWludmVudG9yeS12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJuZXR3b3JrLWRldmljZS1pbnZlbnRvcnktdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goTmV0d29yaywgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LWN5YW4tNjAwIGRhcms6dGV4dC1jeWFuLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJOZXR3b3JrIERldmljZSBJbnZlbnRvcnlcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJNYW5hZ2UgbmV0d29yayBpbmZyYXN0cnVjdHVyZSBkZXZpY2VzIGFuZCBjb25uZWN0aXZpdHlcIiB9KV0gfSldIH0pLCBzZWxlY3RlZFByb2ZpbGUgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlByb2ZpbGU6IFwiLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiBzZWxlY3RlZFByb2ZpbGUubmFtZSB9KV0gfSkpXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIG1kOmdyaWQtY29scy0zIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctY3lhbi01MCBkYXJrOmJnLWN5YW4tOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtY3lhbi02MDAgZGFyazp0ZXh0LWN5YW4tNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIlRvdGFsIERldmljZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1jeWFuLTkwMCBkYXJrOnRleHQtY3lhbi0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy50b3RhbCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJPbmxpbmVcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0xMDBcIiwgY2hpbGRyZW46IFtzdGF0cz8ub25saW5lID8/IDAsIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIG1sLTIgdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogW1wiKFwiLCBzdGF0cz8ub25saW5lUGVyY2VudGFnZSA/PyAwLCBcIiUpXCJdIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIk9mZmxpbmVcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ub2ZmbGluZSA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmcteWVsbG93LTUwIGRhcms6YmcteWVsbG93LTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiV2FycmFudHkgRXhwaXJpbmdcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC15ZWxsb3ctOTAwIGRhcms6dGV4dC15ZWxsb3ctMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ud2FycmFudHlFeHBpcmluZyA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctb3JhbmdlLTUwIGRhcms6Ymctb3JhbmdlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LW9yYW5nZS02MDAgZGFyazp0ZXh0LW9yYW5nZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiV2FycmFudHkgRXhwaXJlZFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LW9yYW5nZS05MDAgZGFyazp0ZXh0LW9yYW5nZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy53YXJyYW50eUV4cGlyZWQgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXB1cnBsZS01MCBkYXJrOmJnLXB1cnBsZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkhpZ2ggVXRpbGl6YXRpb25cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1wdXJwbGUtOTAwIGRhcms6dGV4dC1wdXJwbGUtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uaGlnaFV0aWxpemF0aW9uID8/IDAgfSldIH0pXSB9KSwgdHlwZURpc3RyaWJ1dGlvbj8ubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogXCJEZXZpY2UgVHlwZSBEaXN0cmlidXRpb25cIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAyMDAsIGNoaWxkcmVuOiBfanN4cyhQaWVDaGFydCwgeyBjaGlsZHJlbjogW19qc3goUGllLCB7IGRhdGE6IHR5cGVEaXN0cmlidXRpb24sIGRhdGFLZXk6IFwiY291bnRcIiwgbmFtZUtleTogXCJ0eXBlXCIsIGN4OiBcIjUwJVwiLCBjeTogXCI1MCVcIiwgb3V0ZXJSYWRpdXM6IDgwLCBsYWJlbDogKGVudHJ5KSA9PiBgJHtlbnRyeS50eXBlfTogJHtlbnRyeS5jb3VudH1gLCBjaGlsZHJlbjogdHlwZURpc3RyaWJ1dGlvbi5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3goQ2VsbCwgeyBmaWxsOiBDT0xPUlNbaW5kZXggJSBDT0xPUlMubGVuZ3RoXSB9LCBgY2VsbC0ke2luZGV4fWApKSkgfSksIF9qc3goVG9vbHRpcCwge30pLCBfanN4KExlZ2VuZCwge30pXSB9KSB9KV0gfSkpXSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItM1wiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSwgKGZpbHRlcnMuZGV2aWNlVHlwZSB8fCBmaWx0ZXJzLnZlbmRvciB8fCBmaWx0ZXJzLnN0YXR1cyB8fCBmaWx0ZXJzLmxvY2F0aW9uIHx8IGZpbHRlcnMuc2VhcmNoVGV4dCkgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZ2hvc3RcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogY2xlYXJGaWx0ZXJzLCBcImRhdGEtY3lcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2xlYXItZmlsdGVycy1idG5cIiwgY2hpbGRyZW46IFwiQ2xlYXIgQWxsXCIgfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNSBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIG5hbWUsIElQLCBNQUMuLi5cIiwgdmFsdWU6IGZpbHRlcnMuc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3NlYXJjaFRleHQnLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInNlYXJjaC1pbnB1dFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VhcmNoLWlucHV0XCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLmRldmljZVR5cGUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignZGV2aWNlVHlwZScsIHZhbHVlKSwgXCJkYXRhLWN5XCI6IFwiZGV2aWNlLXR5cGUtc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBEZXZpY2UgVHlwZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmlsdGVyT3B0aW9ucz8uZGV2aWNlVHlwZXMgPz8gW10pLm1hcCgodHlwZSkgPT4gKHsgdmFsdWU6IHR5cGUsIGxhYmVsOiB0eXBlIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy52ZW5kb3IsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcigndmVuZG9yJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJ2ZW5kb3Itc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ2ZW5kb3Itc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBWZW5kb3JzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LnZlbmRvcnMgPz8gW10pLm1hcCgodmVuZG9yKSA9PiAoeyB2YWx1ZTogdmVuZG9yLCBsYWJlbDogdmVuZG9yIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy5zdGF0dXMsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignc3RhdHVzJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJzdGF0dXMtc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0dXMtc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBTdGF0dXNlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5zdGF0dXNlcyA/PyBbXSkubWFwKChzdGF0dXMpID0+ICh7IHZhbHVlOiBzdGF0dXMsIGxhYmVsOiBzdGF0dXMgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLmxvY2F0aW9uLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ2xvY2F0aW9uJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJsb2NhdGlvbi1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImxvY2F0aW9uLXNlbGVjdFwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgTG9jYXRpb25zJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LmxvY2F0aW9ucyA/PyBbXSkubWFwKChsb2NhdGlvbikgPT4gKHsgdmFsdWU6IGxvY2F0aW9uLCBsYWJlbDogbG9jYXRpb24gfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGxvYWREYXRhLCBsb2FkaW5nOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLWJ0blwiLCBjaGlsZHJlbjogXCJSZWZyZXNoXCIgfSksIHNlbGVjdGVkRGV2aWNlcy5sZW5ndGggPiAwICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBzZWxlY3RlZERldmljZXNbMF0gJiYgcGluZ1Rlc3Qoc2VsZWN0ZWREZXZpY2VzWzBdKSwgXCJkYXRhLWN5XCI6IFwicGluZy10ZXN0LWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicGluZy10ZXN0LWJ0blwiLCBjaGlsZHJlbjogW1wiUGluZyBUZXN0IChcIiwgc2VsZWN0ZWREZXZpY2VzLmxlbmd0aCwgXCIpXCJdIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KEV5ZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBzZWxlY3RlZERldmljZXNbMF0gJiYgdmlld0NvbmZpZ3VyYXRpb24oc2VsZWN0ZWREZXZpY2VzWzBdKSwgXCJkYXRhLWN5XCI6IFwidmlldy1jb25maWctYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ2aWV3LWNvbmZpZy1idG5cIiwgY2hpbGRyZW46IFwiVmlldyBDb25maWd1cmF0aW9uXCIgfSldIH0pKV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogZXhwb3J0RGF0YSwgZGlzYWJsZWQ6IChkYXRhPy5sZW5ndGggPz8gMCkgPT09IDAsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IENTVlwiIH0pIH0pXSB9KSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXgtNiBtdC00IHAtNCBiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIGJvcmRlciBib3JkZXItcmVkLTIwMCBkYXJrOmJvcmRlci1yZWQtODAwIHJvdW5kZWQtbWRcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWhpZGRlbiBwLTZcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBkYXRhLCBjb2x1bW5zOiBjb2x1bW5zLCBsb2FkaW5nOiBpc0xvYWRpbmcsIGVuYWJsZVNlbGVjdGlvbjogdHJ1ZSwgc2VsZWN0aW9uTW9kZTogXCJtdWx0aXBsZVwiLCBvblNlbGVjdGlvbkNoYW5nZTogc2V0U2VsZWN0ZWREZXZpY2VzLCBoZWlnaHQ6IFwiY2FsYygxMDB2aCAtIDY1MHB4KVwiIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTmV0d29ya0RldmljZUludmVudG9yeVZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9