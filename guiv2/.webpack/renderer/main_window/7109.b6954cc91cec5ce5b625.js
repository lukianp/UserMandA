(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7109],{

/***/ 12952:
/*!***********************************************************************!*\
  !*** ./src/renderer/views/assets/ServerInventoryView.tsx + 1 modules ***!
  \***********************************************************************/
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
    const { selectedSourceProfile } = (0,useProfileStore.useProfileStore)();
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "server-inventory-view", "data-testid": "server-inventory-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.Server, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Server Inventory" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Monitor server resources, roles, and health status" })] })] }), selectedProfile && ((0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] }))] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Total Servers" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.critical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "High Resource" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.highResource ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Clustered" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.clustered ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Physical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: stats?.physical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-cyan-600 dark:text-cyan-400 font-medium", children: "Virtual" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-cyan-900 dark:text-cyan-100", children: stats?.virtual ?? 0 })] })] }) }), roleDistribution.length > 0 && ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3", children: "Server Distribution by Role" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 150, children: (0,jsx_runtime.jsxs)(es6.BarChart, { data: roleDistribution, children: [(0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-700" }), (0,jsx_runtime.jsx)(es6.XAxis, { dataKey: "role", className: "text-xs", tick: { fill: 'currentColor' }, angle: -45, textAnchor: "end", height: 80 }), (0,jsx_runtime.jsx)(es6.YAxis, { className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.Tooltip, { contentStyle: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                    } }), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "count", fill: "#8b5cf6" })] }) })] })), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react.Filter, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.role || filters.osType || filters.criticality || filters.clusterMembership || filters.searchText) && ((0,jsx_runtime.jsx)(Button.Button, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input.Input, { placeholder: "Search name, IP, role...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.role, onChange: (value) => updateFilter('role', value), "data-cy": "role-select", options: [
                                    { value: '', label: 'All Roles' },
                                    ...(filterOptions?.roles ?? []).map((role) => ({ value: role, label: role }))
                                ] }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.osType, onChange: (value) => updateFilter('osType', value), "data-cy": "os-type-select", "data-testid": "os-type-select", options: [
                                    { value: '', label: 'All OS Types' },
                                    ...(filterOptions?.osTypes ?? []).map((os) => ({ value: os, label: os }))
                                ] }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.criticality, onChange: (value) => updateFilter('criticality', value), "data-cy": "criticality-select", "data-testid": "criticality-select", options: [
                                    { value: '', label: 'All Criticality Levels' },
                                    ...(filterOptions?.criticalities ?? []).map((crit) => ({ value: crit, label: crit }))
                                ] }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.clusterMembership, onChange: (value) => updateFilter('clusterMembership', value), "data-cy": "cluster-select", "data-testid": "cluster-select", options: [
                                    { value: '', label: 'All Clusters' },
                                    ...(filterOptions?.clusters ?? []).map((cluster) => ({ value: cluster, label: cluster }))
                                ] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), selectedServers.length > 0 && ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Eye, { className: "w-4 h-4" }), onClick: () => selectedServers[0] && viewServices(selectedServers[0]), "data-cy": "view-services-btn", "data-testid": "view-services-btn", children: ["View Services (", selectedServers.length, ")"] }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-4 h-4" }), onClick: () => selectedServers[0] && healthCheck(selectedServers[0]), "data-cy": "health-check-btn", "data-testid": "health-check-btn", children: "Health Check" })] }))] }), (0,jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: exportData, disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", "data-testid": "export-btn", children: "Export CSV" }) })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedServers, height: "calc(100vh - 600px)" }) })] }));
};
/* harmony default export */ const assets_ServerInventoryView = (ServerInventoryView);


/***/ }),

/***/ 34766:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Input.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

"use strict";
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


/***/ }),

/***/ 68827:
/*!*********************************!*\
  !*** process/browser (ignored) ***!
  \*********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 71926:
/*!*********************************!*\
  !*** process/browser (ignored) ***!
  \*********************************/
/***/ (() => {

/* (ignored) */

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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a0RBQVEsSUFBSSxVQUFVLG1HQUFtRyxJQUFJLG9CQUFvQixzREFBSSxDQUFDLGlEQUFNLElBQUksb0NBQW9DLHNEQUFJLENBQUMsaURBQU8sSUFBSSxVQUFVLDhFQUE4RSxLQUFLLElBQUksR0FBRyx1REFBSyxVQUFVLHFEQUFxRCxzREFBSSxVQUFVLHVOQUF1TixzREFBSSxDQUFDLG1EQUFPLElBQUksc0NBQXNDLEdBQUcsSUFBSSxzREFBSSxVQUFVLFdBQVcsMENBQUkscUVBQXFFLFFBQVEsWUFBWSxzREFBSSxDQUFDLHNEQUFXLElBQUkseWFBQXlhLEdBQUcsdUJBQXVCLHVEQUFLLFVBQVUsNkpBQTZKLHNEQUFJLFNBQVMsd0VBQXdFLHlCQUF5Qix1REFBSyxZQUFZLHNEQUFzRCxzREFBSSxZQUFZO0FBQ3IyRTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsR0FBRyxzREFBSSxXQUFXLDZEQUE2RCxJQUFJLGlCQUFpQixLQUFLLElBQUk7QUFDeEo7QUFDTyw0QkFBNEIsNkNBQWdCO0FBQ25EO0FBQ0E7Ozs7Ozs7Ozs7O0FDbEtBLGU7Ozs7Ozs7Ozs7QUNBQSxlIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlU2VydmVySW52ZW50b3J5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYXNzZXRzL1NlcnZlckludmVudG9yeVZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXGVzLXRvb2xraXRcXGRpc3RcXHByZWRpY2F0ZXxwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xccmVjaGFydHNcXG5vZGVfbW9kdWxlc1xcQHJlZHV4anNcXHRvb2xraXRcXGRpc3R8cHJvY2Vzcy9icm93c2VyIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2VydmVyIEludmVudG9yeSBMb2dpYyBIb29rXG4gKiBIYW5kbGVzIHNlcnZlciBkaXNjb3ZlcnkgYW5kIGludmVudG9yeSBtYW5hZ2VtZW50XG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VTZXJ2ZXJJbnZlbnRvcnlMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkU291cmNlUHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgLy8gRGF0YSBzdGF0ZVxuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gRmlsdGVyIHN0YXRlXG4gICAgY29uc3QgW2ZpbHRlcnMsIHNldEZpbHRlcnNdID0gdXNlU3RhdGUoe1xuICAgICAgICByb2xlOiAnJyxcbiAgICAgICAgb3NUeXBlOiAnJyxcbiAgICAgICAgY3JpdGljYWxpdHk6ICcnLFxuICAgICAgICBjbHVzdGVyTWVtYmVyc2hpcDogJycsXG4gICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgIH0pO1xuICAgIC8vIFNlbGVjdGlvbiBzdGF0ZVxuICAgIGNvbnN0IFtzZWxlY3RlZFNlcnZlcnMsIHNldFNlbGVjdGVkU2VydmVyc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgLy8gQ29sdW1uIGRlZmluaXRpb25zXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU2VydmVyIE5hbWUnLFxuICAgICAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgICAgIHBpbm5lZDogJ2xlZnQnLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgT25saW5lOiAndGV4dC1ncmVlbi02MDAnLFxuICAgICAgICAgICAgICAgICAgICBXYXJuaW5nOiAndGV4dC15ZWxsb3ctNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgQ3JpdGljYWw6ICd0ZXh0LXJlZC02MDAnLFxuICAgICAgICAgICAgICAgICAgICBPZmZsaW5lOiAndGV4dC1ncmF5LTYwMCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yTWFwW3BhcmFtcy52YWx1ZV0gfHwgJ3RleHQtZ3JheS02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHtwYXJhbXMudmFsdWV9PC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVHlwZScsXG4gICAgICAgICAgICBmaWVsZDogJ3R5cGUnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyaXRpY2FsaXR5JyxcbiAgICAgICAgICAgIGZpZWxkOiAnY3JpdGljYWxpdHknLFxuICAgICAgICAgICAgd2lkdGg6IDExMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBDcml0aWNhbDogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGRhcms6YmctcmVkLTkwMC8yMCBkYXJrOnRleHQtcmVkLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIEhpZ2g6ICdiZy1vcmFuZ2UtMTAwIHRleHQtb3JhbmdlLTgwMCBkYXJrOmJnLW9yYW5nZS05MDAvMjAgZGFyazp0ZXh0LW9yYW5nZS00MDAnLFxuICAgICAgICAgICAgICAgICAgICBNZWRpdW06ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBkYXJrOmJnLXllbGxvdy05MDAvMjAgZGFyazp0ZXh0LXllbGxvdy00MDAnLFxuICAgICAgICAgICAgICAgICAgICBMb3c6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgZGFyazpiZy1ncmVlbi05MDAvMjAgZGFyazp0ZXh0LWdyZWVuLTQwMCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yTWFwW3BhcmFtcy52YWx1ZV0gfHwgJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cInB4LTIgcHktMSByb3VuZGVkIHRleHQteHMgZm9udC1zZW1pYm9sZCAke2NvbG9yfVwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JvbGUnLFxuICAgICAgICAgICAgZmllbGQ6ICdyb2xlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNjAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnT3BlcmF0aW5nIFN5c3RlbScsXG4gICAgICAgICAgICBmaWVsZDogJ29wZXJhdGluZ1N5c3RlbScsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NlcnZpY2VzJyxcbiAgICAgICAgICAgIGZpZWxkOiAnc2VydmljZUNvdW50JyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB0eXBlOiAnbnVtZXJpY0NvbHVtbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVcHRpbWUgKERheXMpJyxcbiAgICAgICAgICAgIGZpZWxkOiAndXB0aW1lRGF5cycsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdHlwZTogJ251bWVyaWNDb2x1bW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ1BVIFVzYWdlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnY3B1VXNhZ2VQZXJjZW50JyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcmFtcy52YWx1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IHZhbHVlID4gOTAgPyAndGV4dC1yZWQtNjAwJyA6IHZhbHVlID4gNzUgPyAndGV4dC15ZWxsb3ctNjAwJyA6ICd0ZXh0LWdyZWVuLTYwMCc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8c3BhbiBjbGFzcz1cIiR7Y29sb3J9IGZvbnQtc2VtaWJvbGRcIj4ke3ZhbHVlfSU8L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSQU0gVXNhZ2UnLFxuICAgICAgICAgICAgZmllbGQ6ICdyYW1Vc2FnZVBlcmNlbnQnLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gdmFsdWUgPiA5MCA/ICd0ZXh0LXJlZC02MDAnIDogdmFsdWUgPiA3NSA/ICd0ZXh0LXllbGxvdy02MDAnIDogJ3RleHQtZ3JlZW4tNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7dmFsdWV9JTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JBTSBUb3RhbCAoR0IpJyxcbiAgICAgICAgICAgIGZpZWxkOiAncmFtVG90YWxHQicsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdHlwZTogJ251bWVyaWNDb2x1bW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzayBUb3RhbCAoR0IpJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZGlza1RvdGFsR0InLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgIHR5cGU6ICdudW1lcmljQ29sdW1uJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rpc2sgVXNlZCAlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZGlza1VzZWRHQicsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy5kYXRhKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gKChwYXJhbXMuZGF0YS5kaXNrVXNlZEdCIC8gcGFyYW1zLmRhdGEuZGlza1RvdGFsR0IpICogMTAwKS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBjdCA9IHBhcnNlRmxvYXQocGFyYW1zLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IHBjdCA+IDkwID8gJ3RleHQtcmVkLTYwMCcgOiBwY3QgPiA3NSA/ICd0ZXh0LXllbGxvdy02MDAnIDogJ3RleHQtZ3JlZW4tNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGN0fSU8L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdJUCBBZGRyZXNzJyxcbiAgICAgICAgICAgIGZpZWxkOiAnaXBBZGRyZXNzJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEb21haW4nLFxuICAgICAgICAgICAgZmllbGQ6ICdkb21haW4nLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDbHVzdGVyJyxcbiAgICAgICAgICAgIGZpZWxkOiAnY2x1c3Rlck1lbWJlcnNoaXAnLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdNYW51ZmFjdHVyZXInLFxuICAgICAgICAgICAgZmllbGQ6ICdtYW51ZmFjdHVyZXInLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01vZGVsJyxcbiAgICAgICAgICAgIGZpZWxkOiAnbW9kZWwnLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgU2VlbicsXG4gICAgICAgICAgICBmaWVsZDogJ2xhc3RTZWVuJyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IEJhY2t1cCcsXG4gICAgICAgICAgICBmaWVsZDogJ2xhc3RCYWNrdXAnLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnTmV2ZXInO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICAvLyBGaWx0ZXJlZCBkYXRhXG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBbLi4uZGF0YV07XG4gICAgICAgIGlmIChmaWx0ZXJzLnJvbGUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLnJvbGUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVycy5yb2xlLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5vc1R5cGUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLm9wZXJhdGluZ1N5c3RlbSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLm9zVHlwZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuY3JpdGljYWxpdHkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uY3JpdGljYWxpdHkgPT09IGZpbHRlcnMuY3JpdGljYWxpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLmNsdXN0ZXJNZW1iZXJzaGlwKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5jbHVzdGVyTWVtYmVyc2hpcCA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLmNsdXN0ZXJNZW1iZXJzaGlwLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBmaWx0ZXJzLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLmlwQWRkcmVzcyA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKGl0ZW0ucm9sZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhLCBmaWx0ZXJzXSk7XG4gICAgLy8gRmlsdGVyIG9wdGlvbnNcbiAgICBjb25zdCBmaWx0ZXJPcHRpb25zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvbGVzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5yb2xlKSldLnNvcnQoKTtcbiAgICAgICAgY29uc3Qgb3NUeXBlcyA9IFsuLi5uZXcgU2V0KChkYXRhID8/IFtdKS5tYXAoKGQpID0+IGQub3BlcmF0aW5nU3lzdGVtKSldLnNvcnQoKTtcbiAgICAgICAgY29uc3QgY3JpdGljYWxpdGllcyA9IFsnQ3JpdGljYWwnLCAnSGlnaCcsICdNZWRpdW0nLCAnTG93J107XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJzID0gWy4uLm5ldyBTZXQoKGRhdGEgPz8gW10pLm1hcCgoZCkgPT4gZC5jbHVzdGVyTWVtYmVyc2hpcCkuZmlsdGVyKChjKSA9PiBjKSldLnNvcnQoKTtcbiAgICAgICAgcmV0dXJuIHsgcm9sZXMsIG9zVHlwZXMsIGNyaXRpY2FsaXRpZXMsIGNsdXN0ZXJzIH07XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIGRhdGFcbiAgICBjb25zdCBsb2FkRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdObyBzb3VyY2UgcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L1NlcnZlckludmVudG9yeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtU2VydmVySW52ZW50b3J5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIERvbWFpbjogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmRvbWFpbixcbiAgICAgICAgICAgICAgICAgICAgQ3JlZGVudGlhbDogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNyZWRlbnRpYWwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXN1bHQuZGF0YS5zZXJ2ZXJzIHx8IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBsb2FkIHNlcnZlciBpbnZlbnRvcnknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlXSk7XG4gICAgLy8gVXBkYXRlIGZpbHRlclxuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIENsZWFyIGZpbHRlcnNcbiAgICBjb25zdCBjbGVhckZpbHRlcnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoe1xuICAgICAgICAgICAgcm9sZTogJycsXG4gICAgICAgICAgICBvc1R5cGU6ICcnLFxuICAgICAgICAgICAgY3JpdGljYWxpdHk6ICcnLFxuICAgICAgICAgICAgY2x1c3Rlck1lbWJlcnNoaXA6ICcnLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcbiAgICAvLyBFeHBvcnQgZGF0YVxuICAgIGNvbnN0IGV4cG9ydERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyk7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gYHNlcnZlci1pbnZlbnRvcnktJHt0aW1lc3RhbXB9LmNzdmA7XG4gICAgICAgIHJldHVybiB7IGZpbGVuYW1lLCBkYXRhOiBmaWx0ZXJlZERhdGEgfTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gVmlldyBzZXJ2aWNlc1xuICAgIGNvbnN0IHZpZXdTZXJ2aWNlcyA9IHVzZUNhbGxiYWNrKChzZXJ2ZXIpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1ZpZXcgc2VydmljZXMgZm9yOicsIHNlcnZlcik7XG4gICAgfSwgW10pO1xuICAgIC8vIEhlYWx0aCBjaGVja1xuICAgIGNvbnN0IGhlYWx0aENoZWNrID0gdXNlQ2FsbGJhY2soYXN5bmMgKHNlcnZlcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnSGVhbHRoIGNoZWNrIGZvcjonLCBzZXJ2ZXIpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBTdGF0aXN0aWNzXG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgdG90YWwgPSBmaWx0ZXJlZERhdGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBjcml0aWNhbCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQuY3JpdGljYWxpdHkgPT09ICdDcml0aWNhbCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaGlnaFJlc291cmNlID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5jcHVVc2FnZVBlcmNlbnQgPiA4MCB8fCBkLnJhbVVzYWdlUGVyY2VudCA+IDgwKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNsdXN0ZXJlZCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQuaXNDbHVzdGVyKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHBoeXNpY2FsID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC50eXBlID09PSAnUGh5c2ljYWwnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHZpcnR1YWwgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLnR5cGUgPT09ICdWaXJ0dWFsJykubGVuZ3RoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWwsXG4gICAgICAgICAgICBjcml0aWNhbCxcbiAgICAgICAgICAgIGhpZ2hSZXNvdXJjZSxcbiAgICAgICAgICAgIGNsdXN0ZXJlZCxcbiAgICAgICAgICAgIHBoeXNpY2FsLFxuICAgICAgICAgICAgdmlydHVhbCxcbiAgICAgICAgfTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gQ2hhcnQgZGF0YSBmb3Igc2VydmVyIGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IHJvbGVEaXN0cmlidXRpb24gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3Qgcm9sZUNvdW50cyA9IGZpbHRlcmVkRGF0YS5yZWR1Y2UoKGFjYywgc2VydmVyKSA9PiB7XG4gICAgICAgICAgICBhY2Nbc2VydmVyLnJvbGVdID0gKGFjY1tzZXJ2ZXIucm9sZV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMocm9sZUNvdW50cylcbiAgICAgICAgICAgIC5tYXAoKFtyb2xlLCBjb3VudF0pID0+ICh7IHJvbGUsIGNvdW50IH0pKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY291bnQgLSBhLmNvdW50KVxuICAgICAgICAgICAgLnNsaWNlKDAsIDEwKTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gTG9hZCBkYXRhIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgbG9hZERhdGEoKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGxvYWREYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBkYXRhOiBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIC8vIEZpbHRlcnNcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgdXBkYXRlRmlsdGVyLFxuICAgICAgICBjbGVhckZpbHRlcnMsXG4gICAgICAgIC8vIFNlbGVjdGlvblxuICAgICAgICBzZWxlY3RlZFNlcnZlcnMsXG4gICAgICAgIHNldFNlbGVjdGVkU2VydmVycyxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBsb2FkRGF0YSxcbiAgICAgICAgZXhwb3J0RGF0YSxcbiAgICAgICAgdmlld1NlcnZpY2VzLFxuICAgICAgICBoZWFsdGhDaGVjayxcbiAgICAgICAgLy8gU3RhdGlzdGljc1xuICAgICAgICBzdGF0cyxcbiAgICAgICAgcm9sZURpc3RyaWJ1dGlvbixcbiAgICAgICAgLy8gUHJvZmlsZVxuICAgICAgICBzZWxlY3RlZFByb2ZpbGU6IHNlbGVjdGVkU291cmNlUHJvZmlsZSxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzLCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VydmVyIEludmVudG9yeSBWaWV3XG4gKiBEaXNwbGF5cyBzZXJ2ZXIgaW52ZW50b3J5IHdpdGggcm9sZSwgcmVzb3VyY2UgdXNhZ2UsIGFuZCBoZWFsdGggaW5mb3JtYXRpb25cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFNlcnZlciwgUmVmcmVzaEN3LCBEb3dubG9hZCwgRXllLCBGaWx0ZXIsIFgsIEFjdGl2aXR5IH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJhckNoYXJ0LCBCYXIsIFhBeGlzLCBZQXhpcywgQ2FydGVzaWFuR3JpZCwgVG9vbHRpcCwgUmVzcG9uc2l2ZUNvbnRhaW5lciB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IHVzZVNlcnZlckludmVudG9yeUxvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlU2VydmVySW52ZW50b3J5TG9naWMnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmNvbnN0IFNlcnZlckludmVudG9yeVZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBkYXRhLCBjb2x1bW5zLCBpc0xvYWRpbmcsIGVycm9yLCBmaWx0ZXJzLCBmaWx0ZXJPcHRpb25zLCB1cGRhdGVGaWx0ZXIsIGNsZWFyRmlsdGVycywgc2VsZWN0ZWRTZXJ2ZXJzLCBzZXRTZWxlY3RlZFNlcnZlcnMsIGxvYWREYXRhLCBleHBvcnREYXRhLCB2aWV3U2VydmljZXMsIGhlYWx0aENoZWNrLCBzdGF0cywgcm9sZURpc3RyaWJ1dGlvbiwgc2VsZWN0ZWRQcm9maWxlLCB9ID0gdXNlU2VydmVySW52ZW50b3J5TG9naWMoKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJzZXJ2ZXItaW52ZW50b3J5LXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNlcnZlci1pbnZlbnRvcnktdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goU2VydmVyLCB7IGNsYXNzTmFtZTogXCJ3LTggaC04IHRleHQtcHVycGxlLTYwMCBkYXJrOnRleHQtcHVycGxlLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJTZXJ2ZXIgSW52ZW50b3J5XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTW9uaXRvciBzZXJ2ZXIgcmVzb3VyY2VzLCByb2xlcywgYW5kIGhlYWx0aCBzdGF0dXNcIiB9KV0gfSldIH0pLCBzZWxlY3RlZFByb2ZpbGUgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtcIlByb2ZpbGU6IFwiLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiBzZWxlY3RlZFByb2ZpbGUubmFtZSB9KV0gfSkpXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTYgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1wdXJwbGUtNTAgZGFyazpiZy1wdXJwbGUtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcHVycGxlLTYwMCBkYXJrOnRleHQtcHVycGxlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJUb3RhbCBTZXJ2ZXJzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcHVycGxlLTkwMCBkYXJrOnRleHQtcHVycGxlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LnRvdGFsID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJDcml0aWNhbFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXJlZC05MDAgZGFyazp0ZXh0LXJlZC0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy5jcml0aWNhbCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctb3JhbmdlLTUwIGRhcms6Ymctb3JhbmdlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LW9yYW5nZS02MDAgZGFyazp0ZXh0LW9yYW5nZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiSGlnaCBSZXNvdXJjZVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LW9yYW5nZS05MDAgZGFyazp0ZXh0LW9yYW5nZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy5oaWdoUmVzb3VyY2UgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJDbHVzdGVyZWRcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy5jbHVzdGVyZWQgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWdyZWVuLTUwIGRhcms6YmctZ3JlZW4tOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiUGh5c2ljYWxcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LnBoeXNpY2FsID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1jeWFuLTUwIGRhcms6YmctY3lhbi05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1jeWFuLTYwMCBkYXJrOnRleHQtY3lhbi00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiVmlydHVhbFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWN5YW4tOTAwIGRhcms6dGV4dC1jeWFuLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LnZpcnR1YWwgPz8gMCB9KV0gfSldIH0pIH0pLCByb2xlRGlzdHJpYnV0aW9uLmxlbmd0aCA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItM1wiLCBjaGlsZHJlbjogXCJTZXJ2ZXIgRGlzdHJpYnV0aW9uIGJ5IFJvbGVcIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAxNTAsIGNoaWxkcmVuOiBfanN4cyhCYXJDaGFydCwgeyBkYXRhOiByb2xlRGlzdHJpYnV0aW9uLCBjaGlsZHJlbjogW19qc3goQ2FydGVzaWFuR3JpZCwgeyBzdHJva2VEYXNoYXJyYXk6IFwiMyAzXCIsIGNsYXNzTmFtZTogXCJzdHJva2UtZ3JheS0zMDAgZGFyazpzdHJva2UtZ3JheS03MDBcIiB9KSwgX2pzeChYQXhpcywgeyBkYXRhS2V5OiBcInJvbGVcIiwgY2xhc3NOYW1lOiBcInRleHQteHNcIiwgdGljazogeyBmaWxsOiAnY3VycmVudENvbG9yJyB9LCBhbmdsZTogLTQ1LCB0ZXh0QW5jaG9yOiBcImVuZFwiLCBoZWlnaHQ6IDgwIH0pLCBfanN4KFlBeGlzLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzXCIsIHRpY2s6IHsgZmlsbDogJ2N1cnJlbnRDb2xvcicgfSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnRTdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc0cHgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChCYXIsIHsgZGF0YUtleTogXCJjb3VudFwiLCBmaWxsOiBcIiM4YjVjZjZcIiB9KV0gfSkgfSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItM1wiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSwgKGZpbHRlcnMucm9sZSB8fCBmaWx0ZXJzLm9zVHlwZSB8fCBmaWx0ZXJzLmNyaXRpY2FsaXR5IHx8IGZpbHRlcnMuY2x1c3Rlck1lbWJlcnNoaXAgfHwgZmlsdGVycy5zZWFyY2hUZXh0KSAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBjbGVhckZpbHRlcnMsIFwiZGF0YS1jeVwiOiBcImNsZWFyLWZpbHRlcnMtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBjaGlsZHJlbjogXCJDbGVhciBBbGxcIiB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy01IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJTZWFyY2ggbmFtZSwgSVAsIHJvbGUuLi5cIiwgdmFsdWU6IGZpbHRlcnMuc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3NlYXJjaFRleHQnLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInNlYXJjaC1pbnB1dFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VhcmNoLWlucHV0XCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLnJvbGUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcigncm9sZScsIHZhbHVlKSwgXCJkYXRhLWN5XCI6IFwicm9sZS1zZWxlY3RcIiwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnQWxsIFJvbGVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LnJvbGVzID8/IFtdKS5tYXAoKHJvbGUpID0+ICh7IHZhbHVlOiByb2xlLCBsYWJlbDogcm9sZSB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMub3NUeXBlLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ29zVHlwZScsIHZhbHVlKSwgXCJkYXRhLWN5XCI6IFwib3MtdHlwZS1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm9zLXR5cGUtc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBPUyBUeXBlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5vc1R5cGVzID8/IFtdKS5tYXAoKG9zKSA9PiAoeyB2YWx1ZTogb3MsIGxhYmVsOiBvcyB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMuY3JpdGljYWxpdHksIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignY3JpdGljYWxpdHknLCB2YWx1ZSksIFwiZGF0YS1jeVwiOiBcImNyaXRpY2FsaXR5LXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY3JpdGljYWxpdHktc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBDcml0aWNhbGl0eSBMZXZlbHMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmlsdGVyT3B0aW9ucz8uY3JpdGljYWxpdGllcyA/PyBbXSkubWFwKChjcml0KSA9PiAoeyB2YWx1ZTogY3JpdCwgbGFiZWw6IGNyaXQgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLmNsdXN0ZXJNZW1iZXJzaGlwLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ2NsdXN0ZXJNZW1iZXJzaGlwJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJjbHVzdGVyLXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2x1c3Rlci1zZWxlY3RcIiwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnQWxsIENsdXN0ZXJzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LmNsdXN0ZXJzID8/IFtdKS5tYXAoKGNsdXN0ZXIpID0+ICh7IHZhbHVlOiBjbHVzdGVyLCBsYWJlbDogY2x1c3RlciB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktM1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogbG9hZERhdGEsIGxvYWRpbmc6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgc2VsZWN0ZWRTZXJ2ZXJzLmxlbmd0aCA+IDAgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KEV5ZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBzZWxlY3RlZFNlcnZlcnNbMF0gJiYgdmlld1NlcnZpY2VzKHNlbGVjdGVkU2VydmVyc1swXSksIFwiZGF0YS1jeVwiOiBcInZpZXctc2VydmljZXMtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ2aWV3LXNlcnZpY2VzLWJ0blwiLCBjaGlsZHJlbjogW1wiVmlldyBTZXJ2aWNlcyAoXCIsIHNlbGVjdGVkU2VydmVycy5sZW5ndGgsIFwiKVwiXSB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBzZWxlY3RlZFNlcnZlcnNbMF0gJiYgaGVhbHRoQ2hlY2soc2VsZWN0ZWRTZXJ2ZXJzWzBdKSwgXCJkYXRhLWN5XCI6IFwiaGVhbHRoLWNoZWNrLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiaGVhbHRoLWNoZWNrLWJ0blwiLCBjaGlsZHJlbjogXCJIZWFsdGggQ2hlY2tcIiB9KV0gfSkpXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBleHBvcnREYXRhLCBkaXNhYmxlZDogKGRhdGE/Lmxlbmd0aCA/PyAwKSA9PT0gMCwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgQ1NWXCIgfSkgfSldIH0pIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJteC02IG10LTQgcC00IGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDAgcm91bmRlZC1tZFwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC04MDAgZGFyazp0ZXh0LXJlZC0yMDBcIiwgY2hpbGRyZW46IGVycm9yIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuIHAtNlwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGRhdGEsIGNvbHVtbnM6IGNvbHVtbnMsIGxvYWRpbmc6IGlzTG9hZGluZywgZW5hYmxlU2VsZWN0aW9uOiB0cnVlLCBzZWxlY3Rpb25Nb2RlOiBcIm11bHRpcGxlXCIsIG9uU2VsZWN0aW9uQ2hhbmdlOiBzZXRTZWxlY3RlZFNlcnZlcnMsIGhlaWdodDogXCJjYWxjKDEwMHZoIC0gNjAwcHgpXCIgfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZXJ2ZXJJbnZlbnRvcnlWaWV3O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==