(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7109],{

/***/ 12952:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ assets_ServerInventoryView)
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
;// ./src/renderer/hooks/useServerInventoryLogic.ts
/**
 * Server Inventory Logic Hook
 * Handles server discovery and inventory management
 */


const useServerInventoryLogic = () => {
    const { selectedSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    // Data state
    const [data, setData] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    // Filter state
    const [filters, setFilters] = (0,react.useState)({
        role: '',
        osType: '',
        criticality: '',
        clusterMembership: '',
        searchText: '',
    });
    // Selection state
    const [selectedServers, setSelectedServers] = (0,react.useState)([]);
    // Column definitions
    const columns = (0,react.useMemo)(() => [
        {
            headerName: 'Server Name',
            field: 'name',
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
                const colorMap = {
                    Online: 'text-green-600',
                    Warning: 'text-yellow-600',
                    Critical: 'text-red-600',
                    Offline: 'text-gray-600',
                };
                const color = colorMap[params.value] || 'text-gray-600';
                return `<span class="${color} font-semibold">${params.value}</span>`;
            },
        },
        {
            headerName: 'Type',
            field: 'type',
            width: 100,
        },
        {
            headerName: 'Criticality',
            field: 'criticality',
            width: 110,
            cellRenderer: (params) => {
                const colorMap = {
                    Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
                    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    Low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                };
                const color = colorMap[params.value] || '';
                return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
            },
        },
        {
            headerName: 'Role',
            field: 'role',
            width: 160,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Operating System',
            field: 'operatingSystem',
            width: 200,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Services',
            field: 'serviceCount',
            width: 100,
            type: 'numericColumn',
        },
        {
            headerName: 'Uptime (Days)',
            field: 'uptimeDays',
            width: 130,
            type: 'numericColumn',
        },
        {
            headerName: 'CPU Usage',
            field: 'cpuUsagePercent',
            width: 120,
            cellRenderer: (params) => {
                const value = params.value;
                const color = value > 90 ? 'text-red-600' : value > 75 ? 'text-yellow-600' : 'text-green-600';
                return `<span class="${color} font-semibold">${value}%</span>`;
            },
        },
        {
            headerName: 'RAM Usage',
            field: 'ramUsagePercent',
            width: 120,
            cellRenderer: (params) => {
                const value = params.value;
                const color = value > 90 ? 'text-red-600' : value > 75 ? 'text-yellow-600' : 'text-green-600';
                return `<span class="${color} font-semibold">${value}%</span>`;
            },
        },
        {
            headerName: 'RAM Total (GB)',
            field: 'ramTotalGB',
            width: 140,
            type: 'numericColumn',
        },
        {
            headerName: 'Disk Total (GB)',
            field: 'diskTotalGB',
            width: 140,
            type: 'numericColumn',
        },
        {
            headerName: 'Disk Used %',
            field: 'diskUsedGB',
            width: 130,
            valueGetter: (params) => {
                if (!params.data)
                    return 0;
                return ((params.data.diskUsedGB / params.data.diskTotalGB) * 100).toFixed(1);
            },
            cellRenderer: (params) => {
                const pct = parseFloat(params.value);
                const color = pct > 90 ? 'text-red-600' : pct > 75 ? 'text-yellow-600' : 'text-green-600';
                return `<span class="${color} font-semibold">${pct}%</span>`;
            },
        },
        {
            headerName: 'IP Address',
            field: 'ipAddress',
            width: 140,
        },
        {
            headerName: 'Domain',
            field: 'domain',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Cluster',
            field: 'clusterMembership',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Manufacturer',
            field: 'manufacturer',
            width: 150,
        },
        {
            headerName: 'Model',
            field: 'model',
            width: 180,
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
            headerName: 'Last Backup',
            field: 'lastBackup',
            width: 180,
            valueFormatter: (params) => {
                if (!params.value)
                    return 'Never';
                return new Date(params.value).toLocaleString();
            },
        },
    ], []);
    // Filtered data
    const filteredData = (0,react.useMemo)(() => {
        let result = [...data];
        if (filters.role) {
            result = result.filter((item) => (item.role ?? '').toLowerCase().includes(filters.role.toLowerCase()));
        }
        if (filters.osType) {
            result = result.filter((item) => (item.operatingSystem ?? '').toLowerCase().includes(filters.osType.toLowerCase()));
        }
        if (filters.criticality) {
            result = result.filter((item) => item.criticality === filters.criticality);
        }
        if (filters.clusterMembership) {
            result = result.filter((item) => (item.clusterMembership ?? '').toLowerCase().includes(filters.clusterMembership.toLowerCase()));
        }
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((item) => (item.name ?? '').toLowerCase().includes(search) ||
                (item.ipAddress ?? '').toLowerCase().includes(search) ||
                (item.role ?? '').toLowerCase().includes(search));
        }
        return result;
    }, [data, filters]);
    // Filter options
    const filterOptions = (0,react.useMemo)(() => {
        const roles = [...new Set((data ?? []).map((d) => d.role))].sort();
        const osTypes = [...new Set((data ?? []).map((d) => d.operatingSystem))].sort();
        const criticalities = ['Critical', 'High', 'Medium', 'Low'];
        const clusters = [...new Set((data ?? []).map((d) => d.clusterMembership).filter((c) => c))].sort();
        return { roles, osTypes, criticalities, clusters };
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
                modulePath: 'Modules/Discovery/ServerInventory.psm1',
                functionName: 'Get-ServerInventory',
                parameters: {
                    Domain: selectedSourceProfile.domain,
                    Credential: selectedSourceProfile.credential,
                },
                options: {
                    timeout: 300000, // 5 minutes
                },
            });
            if (result.success && result.data) {
                setData(result.data.servers || []);
            }
            else {
                throw new Error(result.error || 'Failed to load server inventory');
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
            role: '',
            osType: '',
            criticality: '',
            clusterMembership: '',
            searchText: '',
        });
    }, []);
    // Export data
    const exportData = (0,react.useCallback)(async () => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `server-inventory-${timestamp}.csv`;
        return { filename, data: filteredData };
    }, [filteredData]);
    // View services
    const viewServices = (0,react.useCallback)((server) => {
        console.log('View services for:', server);
    }, []);
    // Health check
    const healthCheck = (0,react.useCallback)(async (server) => {
        console.log('Health check for:', server);
    }, []);
    // Statistics
    const stats = (0,react.useMemo)(() => {
        const total = filteredData.length;
        const critical = filteredData.filter((d) => d.criticality === 'Critical').length;
        const highResource = filteredData.filter((d) => d.cpuUsagePercent > 80 || d.ramUsagePercent > 80).length;
        const clustered = filteredData.filter((d) => d.isCluster).length;
        const physical = filteredData.filter((d) => d.type === 'Physical').length;
        const virtual = filteredData.filter((d) => d.type === 'Virtual').length;
        return {
            total,
            critical,
            highResource,
            clustered,
            physical,
            virtual,
        };
    }, [filteredData]);
    // Chart data for server distribution
    const roleDistribution = (0,react.useMemo)(() => {
        const roleCounts = filteredData.reduce((acc, server) => {
            acc[server.role] = (acc[server.role] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(roleCounts)
            .map(([role, count]) => ({ role, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
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
        selectedServers,
        setSelectedServers,
        // Actions
        loadData,
        exportData,
        viewServices,
        healthCheck,
        // Statistics
        stats,
        roleDistribution,
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
;// ./src/renderer/views/assets/ServerInventoryView.tsx

/**
 * Server Inventory View
 * Displays server inventory with role, resource usage, and health information
 */








const ServerInventoryView = () => {
    const { data, columns, isLoading, error, filters, filterOptions, updateFilter, clearFilters, selectedServers, setSelectedServers, loadData, exportData, viewServices, healthCheck, stats, roleDistribution, selectedProfile, } = useServerInventoryLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "server-inventory-view", "data-testid": "server-inventory-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Server */.gq4, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Server Inventory" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Monitor server resources, roles, and health status" })] })] }), selectedProfile && ((0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] }))] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Total Servers" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.critical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "High Resource" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.highResource ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Clustered" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.clustered ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Physical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: stats?.physical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-cyan-600 dark:text-cyan-400 font-medium", children: "Virtual" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-cyan-900 dark:text-cyan-100", children: stats?.virtual ?? 0 })] })] }) }), roleDistribution.length > 0 && ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3", children: "Server Distribution by Role" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 150, children: (0,jsx_runtime.jsxs)(es6/* BarChart */.Es, { data: roleDistribution, children: [(0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-700" }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { dataKey: "role", className: "text-xs", tick: { fill: 'currentColor' }, angle: -45, textAnchor: "end", height: 80 }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { contentStyle: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                    } }), (0,jsx_runtime.jsx)(es6/* Bar */.yP, { dataKey: "count", fill: "#8b5cf6" })] }) })] })), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.role || filters.osType || filters.criticality || filters.clusterMembership || filters.searchText) && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search name, IP, role...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.role, onChange: (value) => updateFilter('role', value), "data-cy": "role-select", options: [
                                    { value: '', label: 'All Roles' },
                                    ...(filterOptions?.roles ?? []).map((role) => ({ value: role, label: role }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.osType, onChange: (value) => updateFilter('osType', value), "data-cy": "os-type-select", "data-testid": "os-type-select", options: [
                                    { value: '', label: 'All OS Types' },
                                    ...(filterOptions?.osTypes ?? []).map((os) => ({ value: os, label: os }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.criticality, onChange: (value) => updateFilter('criticality', value), "data-cy": "criticality-select", "data-testid": "criticality-select", options: [
                                    { value: '', label: 'All Criticality Levels' },
                                    ...(filterOptions?.criticalities ?? []).map((crit) => ({ value: crit, label: crit }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.clusterMembership, onChange: (value) => updateFilter('clusterMembership', value), "data-cy": "cluster-select", "data-testid": "cluster-select", options: [
                                    { value: '', label: 'All Clusters' },
                                    ...(filterOptions?.clusters ?? []).map((cluster) => ({ value: cluster, label: cluster }))
                                ] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), selectedServers.length > 0 && ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Eye */.kU3, { className: "w-4 h-4" }), onClick: () => selectedServers[0] && viewServices(selectedServers[0]), "data-cy": "view-services-btn", "data-testid": "view-services-btn", children: ["View Services (", selectedServers.length, ")"] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-4 h-4" }), onClick: () => selectedServers[0] && healthCheck(selectedServers[0]), "data-cy": "health-check-btn", "data-testid": "health-check-btn", children: "Health Check" })] }))] }), (0,jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: exportData, disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", "data-testid": "export-btn", children: "Export CSV" }) })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedServers, height: "calc(100vh - 600px)" }) })] }));
};
/* harmony default export */ const assets_ServerInventoryView = (ServerInventoryView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyw2REFBUSxJQUFJLFVBQVUsbUdBQW1HLElBQUksb0JBQW9CLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw0REFBTyxJQUFJLFVBQVUsOEVBQThFLEtBQUssSUFBSSxHQUFHLHVEQUFLLFVBQVUscURBQXFELHNEQUFJLFVBQVUsdU5BQXVOLHNEQUFJLENBQUMsNERBQU8sSUFBSSxzQ0FBc0MsR0FBRyxJQUFJLHNEQUFJLFVBQVUsV0FBVyxtREFBSSxxRUFBcUUsUUFBUSxZQUFZLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSx5YUFBeWEsR0FBRyx1QkFBdUIsdURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQTs7Ozs7Ozs7QUNsS0EsZTs7Ozs7OztBQ0FBLGUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VTZXJ2ZXJJbnZlbnRvcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hc3NldHMvU2VydmVySW52ZW50b3J5Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTZXJ2ZXIgSW52ZW50b3J5IExvZ2ljIEhvb2tcbiAqIEhhbmRsZXMgc2VydmVyIGRpc2NvdmVyeSBhbmQgaW52ZW50b3J5IG1hbmFnZW1lbnRcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuZXhwb3J0IGNvbnN0IHVzZVNlcnZlckludmVudG9yeUxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgc2VsZWN0ZWRTb3VyY2VQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICAvLyBEYXRhIHN0YXRlXG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBGaWx0ZXIgc3RhdGVcbiAgICBjb25zdCBbZmlsdGVycywgc2V0RmlsdGVyc10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHJvbGU6ICcnLFxuICAgICAgICBvc1R5cGU6ICcnLFxuICAgICAgICBjcml0aWNhbGl0eTogJycsXG4gICAgICAgIGNsdXN0ZXJNZW1iZXJzaGlwOiAnJyxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgfSk7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlXG4gICAgY29uc3QgW3NlbGVjdGVkU2VydmVycywgc2V0U2VsZWN0ZWRTZXJ2ZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvLyBDb2x1bW4gZGVmaW5pdGlvbnNcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTZXJ2ZXIgTmFtZScsXG4gICAgICAgICAgICBmaWVsZDogJ25hbWUnLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgaGVhZGVyQ2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgZmllbGQ6ICdzdGF0dXMnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBPbmxpbmU6ICd0ZXh0LWdyZWVuLTYwMCcsXG4gICAgICAgICAgICAgICAgICAgIFdhcm5pbmc6ICd0ZXh0LXllbGxvdy02MDAnLFxuICAgICAgICAgICAgICAgICAgICBDcml0aWNhbDogJ3RleHQtcmVkLTYwMCcsXG4gICAgICAgICAgICAgICAgICAgIE9mZmxpbmU6ICd0ZXh0LWdyYXktNjAwJyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gY29sb3JNYXBbcGFyYW1zLnZhbHVlXSB8fCAndGV4dC1ncmF5LTYwMCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cIiR7Y29sb3J9IGZvbnQtc2VtaWJvbGRcIj4ke3BhcmFtcy52YWx1ZX08L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIGZpZWxkOiAndHlwZScsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ3JpdGljYWxpdHknLFxuICAgICAgICAgICAgZmllbGQ6ICdjcml0aWNhbGl0eScsXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3JNYXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIENyaXRpY2FsOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgZGFyazpiZy1yZWQtOTAwLzIwIGRhcms6dGV4dC1yZWQtNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgSGlnaDogJ2JnLW9yYW5nZS0xMDAgdGV4dC1vcmFuZ2UtODAwIGRhcms6Ymctb3JhbmdlLTkwMC8yMCBkYXJrOnRleHQtb3JhbmdlLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIE1lZGl1bTogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGRhcms6YmcteWVsbG93LTkwMC8yMCBkYXJrOnRleHQteWVsbG93LTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIExvdzogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBkYXJrOmJnLWdyZWVuLTkwMC8yMCBkYXJrOnRleHQtZ3JlZW4tNDAwJyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gY29sb3JNYXBbcGFyYW1zLnZhbHVlXSB8fCAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwicHgtMiBweS0xIHJvdW5kZWQgdGV4dC14cyBmb250LXNlbWlib2xkICR7Y29sb3J9XCI+JHtwYXJhbXMudmFsdWV9PC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUm9sZScsXG4gICAgICAgICAgICBmaWVsZDogJ3JvbGUnLFxuICAgICAgICAgICAgd2lkdGg6IDE2MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdPcGVyYXRpbmcgU3lzdGVtJyxcbiAgICAgICAgICAgIGZpZWxkOiAnb3BlcmF0aW5nU3lzdGVtJyxcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU2VydmljZXMnLFxuICAgICAgICAgICAgZmllbGQ6ICdzZXJ2aWNlQ291bnQnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHR5cGU6ICdudW1lcmljQ29sdW1uJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VwdGltZSAoRGF5cyknLFxuICAgICAgICAgICAgZmllbGQ6ICd1cHRpbWVEYXlzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgICAgICB0eXBlOiAnbnVtZXJpY0NvbHVtbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDUFUgVXNhZ2UnLFxuICAgICAgICAgICAgZmllbGQ6ICdjcHVVc2FnZVBlcmNlbnQnLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gdmFsdWUgPiA5MCA/ICd0ZXh0LXJlZC02MDAnIDogdmFsdWUgPiA3NSA/ICd0ZXh0LXllbGxvdy02MDAnIDogJ3RleHQtZ3JlZW4tNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7dmFsdWV9JTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JBTSBVc2FnZScsXG4gICAgICAgICAgICBmaWVsZDogJ3JhbVVzYWdlUGVyY2VudCcsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSB2YWx1ZSA+IDkwID8gJ3RleHQtcmVkLTYwMCcgOiB2YWx1ZSA+IDc1ID8gJ3RleHQteWVsbG93LTYwMCcgOiAndGV4dC1ncmVlbi02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHt2YWx1ZX0lPC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUkFNIFRvdGFsIChHQiknLFxuICAgICAgICAgICAgZmllbGQ6ICdyYW1Ub3RhbEdCJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICB0eXBlOiAnbnVtZXJpY0NvbHVtbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEaXNrIFRvdGFsIChHQiknLFxuICAgICAgICAgICAgZmllbGQ6ICdkaXNrVG90YWxHQicsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdHlwZTogJ251bWVyaWNDb2x1bW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzayBVc2VkICUnLFxuICAgICAgICAgICAgZmllbGQ6ICdkaXNrVXNlZEdCJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIHJldHVybiAoKHBhcmFtcy5kYXRhLmRpc2tVc2VkR0IgLyBwYXJhbXMuZGF0YS5kaXNrVG90YWxHQikgKiAxMDApLnRvRml4ZWQoMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGN0ID0gcGFyc2VGbG9hdChwYXJhbXMudmFsdWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gcGN0ID4gOTAgPyAndGV4dC1yZWQtNjAwJyA6IHBjdCA+IDc1ID8gJ3RleHQteWVsbG93LTYwMCcgOiAndGV4dC1ncmVlbi02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHtwY3R9JTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0lQIEFkZHJlc3MnLFxuICAgICAgICAgICAgZmllbGQ6ICdpcEFkZHJlc3MnLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0RvbWFpbicsXG4gICAgICAgICAgICBmaWVsZDogJ2RvbWFpbicsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NsdXN0ZXInLFxuICAgICAgICAgICAgZmllbGQ6ICdjbHVzdGVyTWVtYmVyc2hpcCcsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01hbnVmYWN0dXJlcicsXG4gICAgICAgICAgICBmaWVsZDogJ21hbnVmYWN0dXJlcicsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTW9kZWwnLFxuICAgICAgICAgICAgZmllbGQ6ICdtb2RlbCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTGFzdCBTZWVuJyxcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdFNlZW4nLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgQmFja3VwJyxcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdEJhY2t1cCcsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOZXZlcic7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8vIEZpbHRlcmVkIGRhdGFcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFsuLi5kYXRhXTtcbiAgICAgICAgaWYgKGZpbHRlcnMucm9sZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0ucm9sZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLnJvbGUudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLm9zVHlwZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0ub3BlcmF0aW5nU3lzdGVtID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMub3NUeXBlLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5jcml0aWNhbGl0eSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5jcml0aWNhbGl0eSA9PT0gZmlsdGVycy5jcml0aWNhbGl0eSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuY2x1c3Rlck1lbWJlcnNoaXApIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLmNsdXN0ZXJNZW1iZXJzaGlwID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMuY2x1c3Rlck1lbWJlcnNoaXAudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IGZpbHRlcnMuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0ubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKGl0ZW0uaXBBZGRyZXNzID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAoaXRlbS5yb2xlID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGEsIGZpbHRlcnNdKTtcbiAgICAvLyBGaWx0ZXIgb3B0aW9uc1xuICAgIGNvbnN0IGZpbHRlck9wdGlvbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9sZXMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLnJvbGUpKV0uc29ydCgpO1xuICAgICAgICBjb25zdCBvc1R5cGVzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5vcGVyYXRpbmdTeXN0ZW0pKV0uc29ydCgpO1xuICAgICAgICBjb25zdCBjcml0aWNhbGl0aWVzID0gWydDcml0aWNhbCcsICdIaWdoJywgJ01lZGl1bScsICdMb3cnXTtcbiAgICAgICAgY29uc3QgY2x1c3RlcnMgPSBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLmNsdXN0ZXJNZW1iZXJzaGlwKS5maWx0ZXIoKGMpID0+IGMpKV0uc29ydCgpO1xuICAgICAgICByZXR1cm4geyByb2xlcywgb3NUeXBlcywgY3JpdGljYWxpdGllcywgY2x1c3RlcnMgfTtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgZGF0YVxuICAgIGNvbnN0IGxvYWREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIHNvdXJjZSBwcm9maWxlIHNlbGVjdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvU2VydmVySW52ZW50b3J5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0dldC1TZXJ2ZXJJbnZlbnRvcnknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgRG9tYWluOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuZG9tYWluLFxuICAgICAgICAgICAgICAgICAgICBDcmVkZW50aWFsOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY3JlZGVudGlhbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZXREYXRhKHJlc3VsdC5kYXRhLnNlcnZlcnMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgc2VydmVyIGludmVudG9yeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEVycm9yKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGVdKTtcbiAgICAvLyBVcGRhdGUgZmlsdGVyXG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycygocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHZhbHVlIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gQ2xlYXIgZmlsdGVyc1xuICAgIGNvbnN0IGNsZWFyRmlsdGVycyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycyh7XG4gICAgICAgICAgICByb2xlOiAnJyxcbiAgICAgICAgICAgIG9zVHlwZTogJycsXG4gICAgICAgICAgICBjcml0aWNhbGl0eTogJycsXG4gICAgICAgICAgICBjbHVzdGVyTWVtYmVyc2hpcDogJycsXG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICAgICAgfSk7XG4gICAgfSwgW10pO1xuICAgIC8vIEV4cG9ydCBkYXRhXG4gICAgY29uc3QgZXhwb3J0RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBgc2VydmVyLWludmVudG9yeS0ke3RpbWVzdGFtcH0uY3N2YDtcbiAgICAgICAgcmV0dXJuIHsgZmlsZW5hbWUsIGRhdGE6IGZpbHRlcmVkRGF0YSB9O1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICAvLyBWaWV3IHNlcnZpY2VzXG4gICAgY29uc3Qgdmlld1NlcnZpY2VzID0gdXNlQ2FsbGJhY2soKHNlcnZlcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnVmlldyBzZXJ2aWNlcyBmb3I6Jywgc2VydmVyKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGVhbHRoIGNoZWNrXG4gICAgY29uc3QgaGVhbHRoQ2hlY2sgPSB1c2VDYWxsYmFjayhhc3luYyAoc2VydmVyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdIZWFsdGggY2hlY2sgZm9yOicsIHNlcnZlcik7XG4gICAgfSwgW10pO1xuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbCA9IGZpbHRlcmVkRGF0YS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNyaXRpY2FsID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5jcml0aWNhbGl0eSA9PT0gJ0NyaXRpY2FsJykubGVuZ3RoO1xuICAgICAgICBjb25zdCBoaWdoUmVzb3VyY2UgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLmNwdVVzYWdlUGVyY2VudCA+IDgwIHx8IGQucmFtVXNhZ2VQZXJjZW50ID4gODApLmxlbmd0aDtcbiAgICAgICAgY29uc3QgY2x1c3RlcmVkID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5pc0NsdXN0ZXIpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGh5c2ljYWwgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLnR5cGUgPT09ICdQaHlzaWNhbCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgdmlydHVhbCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQudHlwZSA9PT0gJ1ZpcnR1YWwnKS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIGNyaXRpY2FsLFxuICAgICAgICAgICAgaGlnaFJlc291cmNlLFxuICAgICAgICAgICAgY2x1c3RlcmVkLFxuICAgICAgICAgICAgcGh5c2ljYWwsXG4gICAgICAgICAgICB2aXJ0dWFsLFxuICAgICAgICB9O1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICAvLyBDaGFydCBkYXRhIGZvciBzZXJ2ZXIgZGlzdHJpYnV0aW9uXG4gICAgY29uc3Qgcm9sZURpc3RyaWJ1dGlvbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByb2xlQ291bnRzID0gZmlsdGVyZWREYXRhLnJlZHVjZSgoYWNjLCBzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIGFjY1tzZXJ2ZXIucm9sZV0gPSAoYWNjW3NlcnZlci5yb2xlXSB8fCAwKSArIDE7XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyhyb2xlQ291bnRzKVxuICAgICAgICAgICAgLm1hcCgoW3JvbGUsIGNvdW50XSkgPT4gKHsgcm9sZSwgY291bnQgfSkpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5jb3VudCAtIGEuY291bnQpXG4gICAgICAgICAgICAuc2xpY2UoMCwgMTApO1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICAvLyBMb2FkIGRhdGEgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRTb3VyY2VQcm9maWxlKSB7XG4gICAgICAgICAgICBsb2FkRGF0YSgpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZSwgbG9hZERhdGFdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBEYXRhXG4gICAgICAgIGRhdGE6IGZpbHRlcmVkRGF0YSxcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgLy8gRmlsdGVyc1xuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBmaWx0ZXJPcHRpb25zLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIGNsZWFyRmlsdGVycyxcbiAgICAgICAgLy8gU2VsZWN0aW9uXG4gICAgICAgIHNlbGVjdGVkU2VydmVycyxcbiAgICAgICAgc2V0U2VsZWN0ZWRTZXJ2ZXJzLFxuICAgICAgICAvLyBBY3Rpb25zXG4gICAgICAgIGxvYWREYXRhLFxuICAgICAgICBleHBvcnREYXRhLFxuICAgICAgICB2aWV3U2VydmljZXMsXG4gICAgICAgIGhlYWx0aENoZWNrLFxuICAgICAgICAvLyBTdGF0aXN0aWNzXG4gICAgICAgIHN0YXRzLFxuICAgICAgICByb2xlRGlzdHJpYnV0aW9uLFxuICAgICAgICAvLyBQcm9maWxlXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMsIEZyYWdtZW50IGFzIF9GcmFnbWVudCB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTZXJ2ZXIgSW52ZW50b3J5IFZpZXdcbiAqIERpc3BsYXlzIHNlcnZlciBpbnZlbnRvcnkgd2l0aCByb2xlLCByZXNvdXJjZSB1c2FnZSwgYW5kIGhlYWx0aCBpbmZvcm1hdGlvblxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2VydmVyLCBSZWZyZXNoQ3csIERvd25sb2FkLCBFeWUsIEZpbHRlciwgWCwgQWN0aXZpdHkgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQmFyQ2hhcnQsIEJhciwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBSZXNwb25zaXZlQ29udGFpbmVyIH0gZnJvbSAncmVjaGFydHMnO1xuaW1wb3J0IHsgdXNlU2VydmVySW52ZW50b3J5TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VTZXJ2ZXJJbnZlbnRvcnlMb2dpYyc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9TZWxlY3QnO1xuY29uc3QgU2VydmVySW52ZW50b3J5VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIGNvbHVtbnMsIGlzTG9hZGluZywgZXJyb3IsIGZpbHRlcnMsIGZpbHRlck9wdGlvbnMsIHVwZGF0ZUZpbHRlciwgY2xlYXJGaWx0ZXJzLCBzZWxlY3RlZFNlcnZlcnMsIHNldFNlbGVjdGVkU2VydmVycywgbG9hZERhdGEsIGV4cG9ydERhdGEsIHZpZXdTZXJ2aWNlcywgaGVhbHRoQ2hlY2ssIHN0YXRzLCByb2xlRGlzdHJpYnV0aW9uLCBzZWxlY3RlZFByb2ZpbGUsIH0gPSB1c2VTZXJ2ZXJJbnZlbnRvcnlMb2dpYygpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcInNlcnZlci1pbnZlbnRvcnktdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VydmVyLWludmVudG9yeS12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChTZXJ2ZXIsIHsgY2xhc3NOYW1lOiBcInctOCBoLTggdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIlNlcnZlciBJbnZlbnRvcnlcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJNb25pdG9yIHNlcnZlciByZXNvdXJjZXMsIHJvbGVzLCBhbmQgaGVhbHRoIHN0YXR1c1wiIH0pXSB9KV0gfSksIHNlbGVjdGVkUHJvZmlsZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1wiUHJvZmlsZTogXCIsIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGRcIiwgY2hpbGRyZW46IHNlbGVjdGVkUHJvZmlsZS5uYW1lIH0pXSB9KSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtNiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXB1cnBsZS01MCBkYXJrOmJnLXB1cnBsZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIlRvdGFsIFNlcnZlcnNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1wdXJwbGUtOTAwIGRhcms6dGV4dC1wdXJwbGUtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8udG90YWwgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNyaXRpY2FsXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcmVkLTkwMCBkYXJrOnRleHQtcmVkLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmNyaXRpY2FsID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1vcmFuZ2UtNTAgZGFyazpiZy1vcmFuZ2UtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtb3JhbmdlLTYwMCBkYXJrOnRleHQtb3JhbmdlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJIaWdoIFJlc291cmNlXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtb3JhbmdlLTkwMCBkYXJrOnRleHQtb3JhbmdlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmhpZ2hSZXNvdXJjZSA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctYmx1ZS01MCBkYXJrOmJnLWJsdWUtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNsdXN0ZXJlZFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWJsdWUtOTAwIGRhcms6dGV4dC1ibHVlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmNsdXN0ZXJlZCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJQaHlzaWNhbFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyZWVuLTkwMCBkYXJrOnRleHQtZ3JlZW4tMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ucGh5c2ljYWwgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWN5YW4tNTAgZGFyazpiZy1jeWFuLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWN5YW4tNjAwIGRhcms6dGV4dC1jeWFuLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJWaXJ0dWFsXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtY3lhbi05MDAgZGFyazp0ZXh0LWN5YW4tMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8udmlydHVhbCA/PyAwIH0pXSB9KV0gfSkgfSksIHJvbGVEaXN0cmlidXRpb24ubGVuZ3RoID4gMCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0zXCIsIGNoaWxkcmVuOiBcIlNlcnZlciBEaXN0cmlidXRpb24gYnkgUm9sZVwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDE1MCwgY2hpbGRyZW46IF9qc3hzKEJhckNoYXJ0LCB7IGRhdGE6IHJvbGVEaXN0cmlidXRpb24sIGNoaWxkcmVuOiBbX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgY2xhc3NOYW1lOiBcInN0cm9rZS1ncmF5LTMwMCBkYXJrOnN0cm9rZS1ncmF5LTcwMFwiIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwicm9sZVwiLCBjbGFzc05hbWU6IFwidGV4dC14c1wiLCB0aWNrOiB7IGZpbGw6ICdjdXJyZW50Q29sb3InIH0sIGFuZ2xlOiAtNDUsIHRleHRBbmNob3I6IFwiZW5kXCIsIGhlaWdodDogODAgfSksIF9qc3goWUF4aXMsIHsgY2xhc3NOYW1lOiBcInRleHQteHNcIiwgdGljazogeyBmaWxsOiAnY3VycmVudENvbG9yJyB9IH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudFN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzRweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcImNvdW50XCIsIGZpbGw6IFwiIzhiNWNmNlwiIH0pXSB9KSB9KV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBtYi0zXCIsIGNoaWxkcmVuOiBbX2pzeChGaWx0ZXIsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pLCAoZmlsdGVycy5yb2xlIHx8IGZpbHRlcnMub3NUeXBlIHx8IGZpbHRlcnMuY3JpdGljYWxpdHkgfHwgZmlsdGVycy5jbHVzdGVyTWVtYmVyc2hpcCB8fCBmaWx0ZXJzLnNlYXJjaFRleHQpICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChYLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGNsZWFyRmlsdGVycywgXCJkYXRhLWN5XCI6IFwiY2xlYXItZmlsdGVycy1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImNsZWFyLWZpbHRlcnMtYnRuXCIsIGNoaWxkcmVuOiBcIkNsZWFyIEFsbFwiIH0pKV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTUgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KElucHV0LCB7IHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBuYW1lLCBJUCwgcm9sZS4uLlwiLCB2YWx1ZTogZmlsdGVycy5zZWFyY2hUZXh0LCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpbHRlcignc2VhcmNoVGV4dCcsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwic2VhcmNoLWlucHV0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzZWFyY2gtaW5wdXRcIiB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMucm9sZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmlsdGVyKCdyb2xlJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJyb2xlLXNlbGVjdFwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgUm9sZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmlsdGVyT3B0aW9ucz8ucm9sZXMgPz8gW10pLm1hcCgocm9sZSkgPT4gKHsgdmFsdWU6IHJvbGUsIGxhYmVsOiByb2xlIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy5vc1R5cGUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignb3NUeXBlJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJvcy10eXBlLXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwib3MtdHlwZS1zZWxlY3RcIiwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnQWxsIE9TIFR5cGVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/Lm9zVHlwZXMgPz8gW10pLm1hcCgob3MpID0+ICh7IHZhbHVlOiBvcywgbGFiZWw6IG9zIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy5jcml0aWNhbGl0eSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmlsdGVyKCdjcml0aWNhbGl0eScsIHZhbHVlKSwgXCJkYXRhLWN5XCI6IFwiY3JpdGljYWxpdHktc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjcml0aWNhbGl0eS1zZWxlY3RcIiwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnQWxsIENyaXRpY2FsaXR5IExldmVscycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5jcml0aWNhbGl0aWVzID8/IFtdKS5tYXAoKGNyaXQpID0+ICh7IHZhbHVlOiBjcml0LCBsYWJlbDogY3JpdCB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMuY2x1c3Rlck1lbWJlcnNoaXAsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignY2x1c3Rlck1lbWJlcnNoaXAnLCB2YWx1ZSksIFwiZGF0YS1jeVwiOiBcImNsdXN0ZXItc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjbHVzdGVyLXNlbGVjdFwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgQ2x1c3RlcnMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmlsdGVyT3B0aW9ucz8uY2x1c3RlcnMgPz8gW10pLm1hcCgoY2x1c3RlcikgPT4gKHsgdmFsdWU6IGNsdXN0ZXIsIGxhYmVsOiBjbHVzdGVyIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS0zXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBsb2FkRGF0YSwgbG9hZGluZzogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVmcmVzaC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBzZWxlY3RlZFNlcnZlcnMubGVuZ3RoID4gMCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRXllLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IHNlbGVjdGVkU2VydmVyc1swXSAmJiB2aWV3U2VydmljZXMoc2VsZWN0ZWRTZXJ2ZXJzWzBdKSwgXCJkYXRhLWN5XCI6IFwidmlldy1zZXJ2aWNlcy1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInZpZXctc2VydmljZXMtYnRuXCIsIGNoaWxkcmVuOiBbXCJWaWV3IFNlcnZpY2VzIChcIiwgc2VsZWN0ZWRTZXJ2ZXJzLmxlbmd0aCwgXCIpXCJdIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KEFjdGl2aXR5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IHNlbGVjdGVkU2VydmVyc1swXSAmJiBoZWFsdGhDaGVjayhzZWxlY3RlZFNlcnZlcnNbMF0pLCBcImRhdGEtY3lcIjogXCJoZWFsdGgtY2hlY2stYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJoZWFsdGgtY2hlY2stYnRuXCIsIGNoaWxkcmVuOiBcIkhlYWx0aCBDaGVja1wiIH0pXSB9KSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGV4cG9ydERhdGEsIGRpc2FibGVkOiAoZGF0YT8ubGVuZ3RoID8/IDApID09PSAwLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBDU1ZcIiB9KSB9KV0gfSkgfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm14LTYgbXQtNCBwLTQgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLW1kXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMFwiLCBjaGlsZHJlbjogZXJyb3IgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1oaWRkZW4gcC02XCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogZGF0YSwgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nLCBlbmFibGVTZWxlY3Rpb246IHRydWUsIHNlbGVjdGlvbk1vZGU6IFwibXVsdGlwbGVcIiwgb25TZWxlY3Rpb25DaGFuZ2U6IHNldFNlbGVjdGVkU2VydmVycywgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSA2MDBweClcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNlcnZlckludmVudG9yeVZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9