(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6678],{

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

/***/ 42815:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ security_SecurityAuditView)
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
;// ./src/renderer/hooks/useSecurityAuditLogic.ts
/**
 * Security Audit Logic Hook
 * Handles security audit log viewing and analysis
 */


const useSecurityAuditLogic = () => {
    const { selectedSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    // Data state
    const [data, setData] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [isLiveMode, setIsLiveMode] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    // Filter state
    const [filters, setFilters] = (0,react.useState)({
        eventCategory: '',
        severity: '',
        user: '',
        resource: '',
        result: '',
        dateFrom: '',
        dateTo: '',
        searchText: '',
    });
    // Selection state
    const [selectedEvents, setSelectedEvents] = (0,react.useState)([]);
    // Column definitions
    const columns = (0,react.useMemo)(() => [
        {
            headerName: 'Timestamp',
            field: 'timestamp',
            pinned: 'left',
            width: 180,
            valueFormatter: (params) => {
                if (!params.value)
                    return '';
                return new Date(params.value).toLocaleString();
            },
            sort: 'desc',
        },
        {
            headerName: 'Severity',
            field: 'severity',
            width: 100,
            cellRenderer: (params) => {
                const colorMap = {
                    Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
                    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                    Info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                };
                const color = colorMap[params.value] || '';
                return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
            },
        },
        {
            headerName: 'Category',
            field: 'eventCategory',
            width: 150,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Event Type',
            field: 'eventType',
            width: 180,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'User',
            field: 'user',
            width: 180,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Action',
            field: 'action',
            width: 150,
        },
        {
            headerName: 'Resource',
            field: 'resource',
            width: 200,
            filter: 'agTextColumnFilter',
        },
        {
            headerName: 'Result',
            field: 'result',
            width: 100,
            cellRenderer: (params) => {
                const colorMap = {
                    Success: 'text-green-600',
                    Failure: 'text-red-600',
                    Warning: 'text-yellow-600',
                };
                const color = colorMap[params.value] || 'text-gray-600';
                return `<span class="${color} font-semibold">${params.value}</span>`;
            },
        },
        {
            headerName: 'Source IP',
            field: 'sourceIP',
            width: 140,
        },
        {
            headerName: 'Source Location',
            field: 'sourceLocation',
            width: 150,
        },
        {
            headerName: 'Target Resource',
            field: 'targetResource',
            width: 200,
        },
        {
            headerName: 'Details',
            field: 'details',
            width: 300,
            wrapText: true,
            autoHeight: false,
        },
        {
            headerName: 'Correlation ID',
            field: 'correlationId',
            width: 180,
        },
    ], []);
    // Filtered data
    const filteredData = (0,react.useMemo)(() => {
        let result = [...data];
        if (filters.eventCategory) {
            result = result.filter((item) => item.eventCategory === filters.eventCategory);
        }
        if (filters.severity) {
            result = result.filter((item) => item.severity === filters.severity);
        }
        if (filters.user) {
            result = result.filter((item) => (item.user ?? '').toLowerCase().includes(filters.user.toLowerCase()));
        }
        if (filters.resource) {
            result = result.filter((item) => (item.resource ?? '').toLowerCase().includes(filters.resource.toLowerCase()));
        }
        if (filters.result) {
            result = result.filter((item) => item.result === filters.result);
        }
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            result = result.filter((item) => new Date(item.timestamp) >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter((item) => new Date(item.timestamp) <= toDate);
        }
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((item) => (item.eventType ?? '').toLowerCase().includes(search) ||
                (item.user ?? '').toLowerCase().includes(search) ||
                (item.action ?? '').toLowerCase().includes(search) ||
                (item.details ?? '').toLowerCase().includes(search));
        }
        return result;
    }, [data, filters]);
    // Filter options
    const filterOptions = (0,react.useMemo)(() => {
        const categories = ['Authentication', 'Authorization', 'DataAccess', 'Configuration', 'Security', 'System'];
        const severities = ['Critical', 'High', 'Medium', 'Low', 'Info'];
        const results = ['Success', 'Failure', 'Warning'];
        return { categories, severities, results };
    }, []);
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
                modulePath: 'Modules/Security/AuditLog.psm1',
                functionName: 'Get-SecurityAuditEvents',
                parameters: {
                    Domain: selectedSourceProfile.domain,
                    Credential: selectedSourceProfile.credential,
                    StartDate: filters.dateFrom || null,
                    EndDate: filters.dateTo || null,
                },
                options: {
                    timeout: 300000, // 5 minutes
                },
            });
            if (result.success && result.data) {
                setData(result.data.events || []);
            }
            else {
                throw new Error(result.error || 'Failed to load security audit events');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedSourceProfile, filters.dateFrom, filters.dateTo]);
    // Toggle live mode
    const toggleLiveMode = (0,react.useCallback)(() => {
        setIsLiveMode((prev) => !prev);
    }, []);
    // Update filter
    const updateFilter = (0,react.useCallback)((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);
    // Clear filters
    const clearFilters = (0,react.useCallback)(() => {
        setFilters({
            eventCategory: '',
            severity: '',
            user: '',
            resource: '',
            result: '',
            dateFrom: '',
            dateTo: '',
            searchText: '',
        });
    }, []);
    // Export data
    const exportData = (0,react.useCallback)(async (format) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `security-audit-${timestamp}.${format}`;
        if (format === 'siem') {
            // Export in CEF (Common Event Format) for SIEM systems
            const cefData = filteredData.map((event) => {
                return `CEF:0|MandA|Discovery|1.0|${event.eventType}|${event.action}|${event.severity === 'Critical' ? 10 : event.severity === 'High' ? 8 : event.severity === 'Medium' ? 5 : 3}|src=${event.sourceIP} suser=${event.user} cs1=${event.resource} cs2=${event.details}`;
            });
            return { filename: `security-audit-${timestamp}.cef`, data: cefData.join('\n') };
        }
        return { filename, data: filteredData };
    }, [filteredData]);
    // Statistics
    const stats = (0,react.useMemo)(() => {
        const total = filteredData.length;
        const critical = filteredData.filter((e) => e.severity === 'Critical').length;
        const high = filteredData.filter((e) => e.severity === 'High').length;
        const failures = filteredData.filter((e) => e.result === 'Failure').length;
        const authEvents = filteredData.filter((e) => e.eventCategory === 'Authentication').length;
        const securityEvents = filteredData.filter((e) => e.eventCategory === 'Security').length;
        return {
            total,
            critical,
            high,
            failures,
            authEvents,
            securityEvents,
        };
    }, [filteredData]);
    // Event timeline data
    const timelineData = (0,react.useMemo)(() => {
        const hourCounts = {};
        filteredData.forEach((event) => {
            const date = new Date(event.timestamp);
            const hourKey = `${date.getHours()}:00`;
            hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
        });
        return Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
    }, [filteredData]);
    // Live mode polling
    (0,react.useEffect)(() => {
        if (!isLiveMode)
            return;
        const interval = setInterval(() => {
            loadData();
        }, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [isLiveMode, loadData]);
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
        isLiveMode,
        error,
        // Filters
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        // Selection
        selectedEvents,
        setSelectedEvents,
        // Actions
        loadData,
        toggleLiveMode,
        exportData,
        // Statistics
        stats,
        timelineData,
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
;// ./src/renderer/views/security/SecurityAuditView.tsx

/**
 * Security Audit View
 * Displays security audit logs with filtering and real-time updates
 */








const SecurityAuditView = () => {
    const { data, columns, isLoading, isLiveMode, error, filters, filterOptions, updateFilter, clearFilters, selectedEvents, setSelectedEvents, loadData, toggleLiveMode, exportData, stats, timelineData, selectedProfile, } = useSecurityAuditLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "security-audit-view", "data-testid": "security-audit-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, { className: "w-8 h-8 text-red-600 dark:text-red-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Security Audit" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Audit security events and monitor audit trail" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [isLiveMode && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full", children: [(0,jsx_runtime.jsx)(lucide_react/* Radio */.sxL, { className: "w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-semibold text-green-600 dark:text-green-400", children: "Live" })] })), selectedProfile && ((0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] }))] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Total Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.critical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "High Severity" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.high ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400 font-medium", children: "Failures" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: stats?.failures ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Auth Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: stats?.authEvents ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-indigo-600 dark:text-indigo-400 font-medium", children: "Security Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-indigo-900 dark:text-indigo-100", children: stats?.securityEvents ?? 0 })] })] }) }), (timelineData?.length ?? 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3", children: "Event Timeline (Hourly)" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 120, children: (0,jsx_runtime.jsxs)(es6/* LineChart */.bl, { data: timelineData, children: [(0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-700" }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { dataKey: "hour", className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, {}), (0,jsx_runtime.jsx)(es6/* Line */.N1, { type: "monotone", dataKey: "count", stroke: "#ef4444", strokeWidth: 2 })] }) })] })), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.eventCategory || filters.severity || filters.user || filters.resource || filters.result || filters.dateFrom || filters.dateTo || filters.searchText) && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search events...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), className: "md:col-span-2", "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.eventCategory, onChange: (value) => updateFilter('eventCategory', value), options: [
                                    { value: '', label: 'All Categories' },
                                    ...(filterOptions?.categories ?? []).map(cat => ({ value: cat, label: cat }))
                                ], "data-cy": "category-select", "data-testid": "category-select" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.severity, onChange: (value) => updateFilter('severity', value), options: [
                                    { value: '', label: 'All Severities' },
                                    ...(filterOptions?.severities ?? []).map(sev => ({ value: sev, label: sev }))
                                ], "data-cy": "severity-select", "data-testid": "severity-select" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.result, onChange: (value) => updateFilter('result', value), options: [
                                    { value: '', label: 'All Results' },
                                    ...(filterOptions?.results ?? []).map(res => ({ value: res, label: res }))
                                ], "data-cy": "result-select", "data-testid": "result-select" }), (0,jsx_runtime.jsx)(Input/* Input */.p, { type: "date", placeholder: "From Date", value: filters.dateFrom, onChange: (e) => updateFilter('dateFrom', e.target.value), "data-cy": "date-from-input", "data-testid": "date-from-input" }), (0,jsx_runtime.jsx)(Input/* Input */.p, { type: "date", placeholder: "To Date", value: filters.dateTo, onChange: (e) => updateFilter('dateTo', e.target.value), "data-cy": "date-to-input", "data-testid": "date-to-input" }), (0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "User...", value: filters.user, onChange: (e) => updateFilter('user', e.target.value), "data-cy": "user-input", "data-testid": "user-input" })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: isLiveMode ? 'secondary' : 'ghost', icon: (0,jsx_runtime.jsx)(lucide_react/* Radio */.sxL, { className: "w-4 h-4" }), onClick: toggleLiveMode, "data-cy": "live-mode-btn", "data-testid": "live-mode-btn", children: isLiveMode ? 'Stop Live' : 'Start Live' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: () => exportData('csv'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-csv-btn", "data-testid": "export-csv-btn", children: "Export CSV" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: () => exportData('json'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-json-btn", "data-testid": "export-json-btn", children: "Export JSON" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), onClick: () => exportData('siem'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-siem-btn", "data-testid": "export-siem-btn", children: "Export SIEM/CEF" })] })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedEvents, height: "calc(100vh - 700px)" }) })] }));
};
/* harmony default export */ const security_SecurityAuditView = (SecurityAuditView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBQUksVUFBVSxtR0FBbUcsSUFBSSxvQkFBb0Isc0RBQUksQ0FBQywwREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLDREQUFPLElBQUksVUFBVSw4RUFBOEUsS0FBSyxJQUFJLEdBQUcsdURBQUssVUFBVSxxREFBcUQsc0RBQUksVUFBVSx1TkFBdU4sc0RBQUksQ0FBQyw0REFBTyxJQUFJLHNDQUFzQyxHQUFHLElBQUksc0RBQUksVUFBVSxXQUFXLG1EQUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxnRUFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBOzs7Ozs7OztBQ2xLQSxlOzs7Ozs7O0FDQUEsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVNlY3VyaXR5QXVkaXRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9zZWN1cml0eS9TZWN1cml0eUF1ZGl0Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xccmVjaGFydHNcXG5vZGVfbW9kdWxlc1xcQHJlZHV4anNcXHRvb2xraXRcXGRpc3R8cHJvY2Vzcy9icm93c2VyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiLyoqXG4gKiBTZWN1cml0eSBBdWRpdCBMb2dpYyBIb29rXG4gKiBIYW5kbGVzIHNlY3VyaXR5IGF1ZGl0IGxvZyB2aWV3aW5nIGFuZCBhbmFseXNpc1xuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlU2VjdXJpdHlBdWRpdExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgc2VsZWN0ZWRTb3VyY2VQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICAvLyBEYXRhIHN0YXRlXG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2lzTGl2ZU1vZGUsIHNldElzTGl2ZU1vZGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gRmlsdGVyIHN0YXRlXG4gICAgY29uc3QgW2ZpbHRlcnMsIHNldEZpbHRlcnNdID0gdXNlU3RhdGUoe1xuICAgICAgICBldmVudENhdGVnb3J5OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6ICcnLFxuICAgICAgICB1c2VyOiAnJyxcbiAgICAgICAgcmVzb3VyY2U6ICcnLFxuICAgICAgICByZXN1bHQ6ICcnLFxuICAgICAgICBkYXRlRnJvbTogJycsXG4gICAgICAgIGRhdGVUbzogJycsXG4gICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgIH0pO1xuICAgIC8vIFNlbGVjdGlvbiBzdGF0ZVxuICAgIGNvbnN0IFtzZWxlY3RlZEV2ZW50cywgc2V0U2VsZWN0ZWRFdmVudHNdID0gdXNlU3RhdGUoW10pO1xuICAgIC8vIENvbHVtbiBkZWZpbml0aW9uc1xuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWVzdGFtcCcsXG4gICAgICAgICAgICBmaWVsZDogJ3RpbWVzdGFtcCcsXG4gICAgICAgICAgICBwaW5uZWQ6ICdsZWZ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzb3J0OiAnZGVzYycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTZXZlcml0eScsXG4gICAgICAgICAgICBmaWVsZDogJ3NldmVyaXR5JyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgQ3JpdGljYWw6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAvMjAgZGFyazp0ZXh0LXJlZC00MDAnLFxuICAgICAgICAgICAgICAgICAgICBIaWdoOiAnYmctb3JhbmdlLTEwMCB0ZXh0LW9yYW5nZS04MDAgZGFyazpiZy1vcmFuZ2UtOTAwLzIwIGRhcms6dGV4dC1vcmFuZ2UtNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgTWVkaXVtOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgZGFyazpiZy15ZWxsb3ctOTAwLzIwIGRhcms6dGV4dC15ZWxsb3ctNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgTG93OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBkYXJrOmJnLWJsdWUtOTAwLzIwIGRhcms6dGV4dC1ibHVlLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIEluZm86ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktODAwIGRhcms6YmctZ3JheS05MDAvMjAgZGFyazp0ZXh0LWdyYXktNDAwJyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gY29sb3JNYXBbcGFyYW1zLnZhbHVlXSB8fCAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwicHgtMiBweS0xIHJvdW5kZWQgdGV4dC14cyBmb250LXNlbWlib2xkICR7Y29sb3J9XCI+JHtwYXJhbXMudmFsdWV9PC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ2F0ZWdvcnknLFxuICAgICAgICAgICAgZmllbGQ6ICdldmVudENhdGVnb3J5JyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRXZlbnQgVHlwZScsXG4gICAgICAgICAgICBmaWVsZDogJ2V2ZW50VHlwZScsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdUZXh0Q29sdW1uRmlsdGVyJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1VzZXInLFxuICAgICAgICAgICAgZmllbGQ6ICd1c2VyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9uJyxcbiAgICAgICAgICAgIGZpZWxkOiAnYWN0aW9uJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSZXNvdXJjZScsXG4gICAgICAgICAgICBmaWVsZDogJ3Jlc291cmNlJyxcbiAgICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUmVzdWx0JyxcbiAgICAgICAgICAgIGZpZWxkOiAncmVzdWx0JyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgU3VjY2VzczogJ3RleHQtZ3JlZW4tNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgRmFpbHVyZTogJ3RleHQtcmVkLTYwMCcsXG4gICAgICAgICAgICAgICAgICAgIFdhcm5pbmc6ICd0ZXh0LXllbGxvdy02MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICd0ZXh0LWdyYXktNjAwJztcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjb2xvcn0gZm9udC1zZW1pYm9sZFwiPiR7cGFyYW1zLnZhbHVlfTwvc3Bhbj5gO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NvdXJjZSBJUCcsXG4gICAgICAgICAgICBmaWVsZDogJ3NvdXJjZUlQJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTb3VyY2UgTG9jYXRpb24nLFxuICAgICAgICAgICAgZmllbGQ6ICdzb3VyY2VMb2NhdGlvbicsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVGFyZ2V0IFJlc291cmNlJyxcbiAgICAgICAgICAgIGZpZWxkOiAndGFyZ2V0UmVzb3VyY2UnLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0RldGFpbHMnLFxuICAgICAgICAgICAgZmllbGQ6ICdkZXRhaWxzJyxcbiAgICAgICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgICAgICB3cmFwVGV4dDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9IZWlnaHQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ29ycmVsYXRpb24gSUQnLFxuICAgICAgICAgICAgZmllbGQ6ICdjb3JyZWxhdGlvbklkJyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8vIEZpbHRlcmVkIGRhdGFcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFsuLi5kYXRhXTtcbiAgICAgICAgaWYgKGZpbHRlcnMuZXZlbnRDYXRlZ29yeSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5ldmVudENhdGVnb3J5ID09PSBmaWx0ZXJzLmV2ZW50Q2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnNldmVyaXR5KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLnNldmVyaXR5ID09PSBmaWx0ZXJzLnNldmVyaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy51c2VyKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS51c2VyID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMudXNlci50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMucmVzb3VyY2UpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLnJlc291cmNlID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlcnMucmVzb3VyY2UudG9Mb3dlckNhc2UoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnJlc3VsdCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5yZXN1bHQgPT09IGZpbHRlcnMucmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5kYXRlRnJvbSkge1xuICAgICAgICAgICAgY29uc3QgZnJvbURhdGUgPSBuZXcgRGF0ZShmaWx0ZXJzLmRhdGVGcm9tKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IG5ldyBEYXRlKGl0ZW0udGltZXN0YW1wKSA+PSBmcm9tRGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuZGF0ZVRvKSB7XG4gICAgICAgICAgICBjb25zdCB0b0RhdGUgPSBuZXcgRGF0ZShmaWx0ZXJzLmRhdGVUbyk7XG4gICAgICAgICAgICB0b0RhdGUuc2V0SG91cnMoMjMsIDU5LCA1OSwgOTk5KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IG5ldyBEYXRlKGl0ZW0udGltZXN0YW1wKSA8PSB0b0RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IGZpbHRlcnMuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0uZXZlbnRUeXBlID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAoaXRlbS51c2VyID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAoaXRlbS5hY3Rpb24gPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLmRldGFpbHMgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YSwgZmlsdGVyc10pO1xuICAgIC8vIEZpbHRlciBvcHRpb25zXG4gICAgY29uc3QgZmlsdGVyT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0gWydBdXRoZW50aWNhdGlvbicsICdBdXRob3JpemF0aW9uJywgJ0RhdGFBY2Nlc3MnLCAnQ29uZmlndXJhdGlvbicsICdTZWN1cml0eScsICdTeXN0ZW0nXTtcbiAgICAgICAgY29uc3Qgc2V2ZXJpdGllcyA9IFsnQ3JpdGljYWwnLCAnSGlnaCcsICdNZWRpdW0nLCAnTG93JywgJ0luZm8nXTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFsnU3VjY2VzcycsICdGYWlsdXJlJywgJ1dhcm5pbmcnXTtcbiAgICAgICAgcmV0dXJuIHsgY2F0ZWdvcmllcywgc2V2ZXJpdGllcywgcmVzdWx0cyB9O1xuICAgIH0sIFtdKTtcbiAgICAvLyBMb2FkIGRhdGFcbiAgICBjb25zdCBsb2FkRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdObyBzb3VyY2UgcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvU2VjdXJpdHkvQXVkaXRMb2cucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LVNlY3VyaXR5QXVkaXRFdmVudHMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgRG9tYWluOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuZG9tYWluLFxuICAgICAgICAgICAgICAgICAgICBDcmVkZW50aWFsOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY3JlZGVudGlhbCxcbiAgICAgICAgICAgICAgICAgICAgU3RhcnREYXRlOiBmaWx0ZXJzLmRhdGVGcm9tIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIEVuZERhdGU6IGZpbHRlcnMuZGF0ZVRvIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCwgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgc2V0RGF0YShyZXN1bHQuZGF0YS5ldmVudHMgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgc2VjdXJpdHkgYXVkaXQgZXZlbnRzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZSwgZmlsdGVycy5kYXRlRnJvbSwgZmlsdGVycy5kYXRlVG9dKTtcbiAgICAvLyBUb2dnbGUgbGl2ZSBtb2RlXG4gICAgY29uc3QgdG9nZ2xlTGl2ZU1vZGUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElzTGl2ZU1vZGUoKHByZXYpID0+ICFwcmV2KTtcbiAgICB9LCBbXSk7XG4gICAgLy8gVXBkYXRlIGZpbHRlclxuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIENsZWFyIGZpbHRlcnNcbiAgICBjb25zdCBjbGVhckZpbHRlcnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoe1xuICAgICAgICAgICAgZXZlbnRDYXRlZ29yeTogJycsXG4gICAgICAgICAgICBzZXZlcml0eTogJycsXG4gICAgICAgICAgICB1c2VyOiAnJyxcbiAgICAgICAgICAgIHJlc291cmNlOiAnJyxcbiAgICAgICAgICAgIHJlc3VsdDogJycsXG4gICAgICAgICAgICBkYXRlRnJvbTogJycsXG4gICAgICAgICAgICBkYXRlVG86ICcnLFxuICAgICAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcbiAgICAvLyBFeHBvcnQgZGF0YVxuICAgIGNvbnN0IGV4cG9ydERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoZm9ybWF0KSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9bOi5dL2csICctJyk7XG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gYHNlY3VyaXR5LWF1ZGl0LSR7dGltZXN0YW1wfS4ke2Zvcm1hdH1gO1xuICAgICAgICBpZiAoZm9ybWF0ID09PSAnc2llbScpIHtcbiAgICAgICAgICAgIC8vIEV4cG9ydCBpbiBDRUYgKENvbW1vbiBFdmVudCBGb3JtYXQpIGZvciBTSUVNIHN5c3RlbXNcbiAgICAgICAgICAgIGNvbnN0IGNlZkRhdGEgPSBmaWx0ZXJlZERhdGEubWFwKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgQ0VGOjB8TWFuZEF8RGlzY292ZXJ5fDEuMHwke2V2ZW50LmV2ZW50VHlwZX18JHtldmVudC5hY3Rpb259fCR7ZXZlbnQuc2V2ZXJpdHkgPT09ICdDcml0aWNhbCcgPyAxMCA6IGV2ZW50LnNldmVyaXR5ID09PSAnSGlnaCcgPyA4IDogZXZlbnQuc2V2ZXJpdHkgPT09ICdNZWRpdW0nID8gNSA6IDN9fHNyYz0ke2V2ZW50LnNvdXJjZUlQfSBzdXNlcj0ke2V2ZW50LnVzZXJ9IGNzMT0ke2V2ZW50LnJlc291cmNlfSBjczI9JHtldmVudC5kZXRhaWxzfWA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB7IGZpbGVuYW1lOiBgc2VjdXJpdHktYXVkaXQtJHt0aW1lc3RhbXB9LmNlZmAsIGRhdGE6IGNlZkRhdGEuam9pbignXFxuJykgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBmaWxlbmFtZSwgZGF0YTogZmlsdGVyZWREYXRhIH07XG4gICAgfSwgW2ZpbHRlcmVkRGF0YV0pO1xuICAgIC8vIFN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbCA9IGZpbHRlcmVkRGF0YS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGNyaXRpY2FsID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZSkgPT4gZS5zZXZlcml0eSA9PT0gJ0NyaXRpY2FsJykubGVuZ3RoO1xuICAgICAgICBjb25zdCBoaWdoID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZSkgPT4gZS5zZXZlcml0eSA9PT0gJ0hpZ2gnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGZhaWx1cmVzID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZSkgPT4gZS5yZXN1bHQgPT09ICdGYWlsdXJlJykubGVuZ3RoO1xuICAgICAgICBjb25zdCBhdXRoRXZlbnRzID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZSkgPT4gZS5ldmVudENhdGVnb3J5ID09PSAnQXV0aGVudGljYXRpb24nKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHNlY3VyaXR5RXZlbnRzID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZSkgPT4gZS5ldmVudENhdGVnb3J5ID09PSAnU2VjdXJpdHknKS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbCxcbiAgICAgICAgICAgIGNyaXRpY2FsLFxuICAgICAgICAgICAgaGlnaCxcbiAgICAgICAgICAgIGZhaWx1cmVzLFxuICAgICAgICAgICAgYXV0aEV2ZW50cyxcbiAgICAgICAgICAgIHNlY3VyaXR5RXZlbnRzLFxuICAgICAgICB9O1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICAvLyBFdmVudCB0aW1lbGluZSBkYXRhXG4gICAgY29uc3QgdGltZWxpbmVEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhvdXJDb3VudHMgPSB7fTtcbiAgICAgICAgZmlsdGVyZWREYXRhLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZXZlbnQudGltZXN0YW1wKTtcbiAgICAgICAgICAgIGNvbnN0IGhvdXJLZXkgPSBgJHtkYXRlLmdldEhvdXJzKCl9OjAwYDtcbiAgICAgICAgICAgIGhvdXJDb3VudHNbaG91cktleV0gPSAoaG91ckNvdW50c1tob3VyS2V5XSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoaG91ckNvdW50cylcbiAgICAgICAgICAgIC5tYXAoKFtob3VyLCBjb3VudF0pID0+ICh7IGhvdXIsIGNvdW50IH0pKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IHBhcnNlSW50KGEuaG91cikgLSBwYXJzZUludChiLmhvdXIpKTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gTGl2ZSBtb2RlIHBvbGxpbmdcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIWlzTGl2ZU1vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgbG9hZERhdGEoKTtcbiAgICAgICAgfSwgMzAwMDApOyAvLyBQb2xsIGV2ZXJ5IDMwIHNlY29uZHNcbiAgICAgICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0sIFtpc0xpdmVNb2RlLCBsb2FkRGF0YV0pO1xuICAgIC8vIExvYWQgZGF0YSBvbiBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGxvYWREYXRhKCk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBsb2FkRGF0YV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIERhdGFcbiAgICAgICAgZGF0YTogZmlsdGVyZWREYXRhLFxuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGlzTGl2ZU1vZGUsXG4gICAgICAgIGVycm9yLFxuICAgICAgICAvLyBGaWx0ZXJzXG4gICAgICAgIGZpbHRlcnMsXG4gICAgICAgIGZpbHRlck9wdGlvbnMsXG4gICAgICAgIHVwZGF0ZUZpbHRlcixcbiAgICAgICAgY2xlYXJGaWx0ZXJzLFxuICAgICAgICAvLyBTZWxlY3Rpb25cbiAgICAgICAgc2VsZWN0ZWRFdmVudHMsXG4gICAgICAgIHNldFNlbGVjdGVkRXZlbnRzLFxuICAgICAgICAvLyBBY3Rpb25zXG4gICAgICAgIGxvYWREYXRhLFxuICAgICAgICB0b2dnbGVMaXZlTW9kZSxcbiAgICAgICAgZXhwb3J0RGF0YSxcbiAgICAgICAgLy8gU3RhdGlzdGljc1xuICAgICAgICBzdGF0cyxcbiAgICAgICAgdGltZWxpbmVEYXRhLFxuICAgICAgICAvLyBQcm9maWxlXG4gICAgICAgIHNlbGVjdGVkUHJvZmlsZTogc2VsZWN0ZWRTb3VyY2VQcm9maWxlLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VjdXJpdHkgQXVkaXQgVmlld1xuICogRGlzcGxheXMgc2VjdXJpdHkgYXVkaXQgbG9ncyB3aXRoIGZpbHRlcmluZyBhbmQgcmVhbC10aW1lIHVwZGF0ZXNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFNoaWVsZCwgUmVmcmVzaEN3LCBEb3dubG9hZCwgRmlsdGVyLCBYLCBSYWRpbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBMaW5lQ2hhcnQsIExpbmUsIFhBeGlzLCBZQXhpcywgQ2FydGVzaWFuR3JpZCwgVG9vbHRpcCwgUmVzcG9uc2l2ZUNvbnRhaW5lciB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IHVzZVNlY3VyaXR5QXVkaXRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVNlY3VyaXR5QXVkaXRMb2dpYyc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBJbnB1dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQnO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9TZWxlY3QnO1xuY29uc3QgU2VjdXJpdHlBdWRpdFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBkYXRhLCBjb2x1bW5zLCBpc0xvYWRpbmcsIGlzTGl2ZU1vZGUsIGVycm9yLCBmaWx0ZXJzLCBmaWx0ZXJPcHRpb25zLCB1cGRhdGVGaWx0ZXIsIGNsZWFyRmlsdGVycywgc2VsZWN0ZWRFdmVudHMsIHNldFNlbGVjdGVkRXZlbnRzLCBsb2FkRGF0YSwgdG9nZ2xlTGl2ZU1vZGUsIGV4cG9ydERhdGEsIHN0YXRzLCB0aW1lbGluZURhdGEsIHNlbGVjdGVkUHJvZmlsZSwgfSA9IHVzZVNlY3VyaXR5QXVkaXRMb2dpYygpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcInNlY3VyaXR5LWF1ZGl0LXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNlY3VyaXR5LWF1ZGl0LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFNoaWVsZCwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDBcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiU2VjdXJpdHkgQXVkaXRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJBdWRpdCBzZWN1cml0eSBldmVudHMgYW5kIG1vbml0b3IgYXVkaXQgdHJhaWxcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW2lzTGl2ZU1vZGUgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTMgcHktMSBiZy1ncmVlbi0xMDAgZGFyazpiZy1ncmVlbi05MDAvMjAgcm91bmRlZC1mdWxsXCIsIGNoaWxkcmVuOiBbX2pzeChSYWRpbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwIGFuaW1hdGUtcHVsc2VcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDBcIiwgY2hpbGRyZW46IFwiTGl2ZVwiIH0pXSB9KSksIHNlbGVjdGVkUHJvZmlsZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1wiUHJvZmlsZTogXCIsIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGRcIiwgY2hpbGRyZW46IHNlbGVjdGVkUHJvZmlsZS5uYW1lIH0pXSB9KSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTYgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiVG90YWwgRXZlbnRzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtYmx1ZS05MDAgZGFyazp0ZXh0LWJsdWUtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8udG90YWwgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkNyaXRpY2FsXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcmVkLTkwMCBkYXJrOnRleHQtcmVkLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmNyaXRpY2FsID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1vcmFuZ2UtNTAgZGFyazpiZy1vcmFuZ2UtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtb3JhbmdlLTYwMCBkYXJrOnRleHQtb3JhbmdlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJIaWdoIFNldmVyaXR5XCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtb3JhbmdlLTkwMCBkYXJrOnRleHQtb3JhbmdlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmhpZ2ggPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC15ZWxsb3ctNjAwIGRhcms6dGV4dC15ZWxsb3ctNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkZhaWx1cmVzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQteWVsbG93LTkwMCBkYXJrOnRleHQteWVsbG93LTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmZhaWx1cmVzID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1wdXJwbGUtNTAgZGFyazpiZy1wdXJwbGUtOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcHVycGxlLTYwMCBkYXJrOnRleHQtcHVycGxlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJBdXRoIEV2ZW50c1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXB1cnBsZS05MDAgZGFyazp0ZXh0LXB1cnBsZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy5hdXRoRXZlbnRzID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1pbmRpZ28tNTAgZGFyazpiZy1pbmRpZ28tOTAwLzIwIHJvdW5kZWQtbGcgcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtaW5kaWdvLTYwMCBkYXJrOnRleHQtaW5kaWdvLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJTZWN1cml0eSBFdmVudHNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1pbmRpZ28tOTAwIGRhcms6dGV4dC1pbmRpZ28tMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uc2VjdXJpdHlFdmVudHMgPz8gMCB9KV0gfSldIH0pIH0pLCAodGltZWxpbmVEYXRhPy5sZW5ndGggPz8gMCkgPiAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTNcIiwgY2hpbGRyZW46IFwiRXZlbnQgVGltZWxpbmUgKEhvdXJseSlcIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAxMjAsIGNoaWxkcmVuOiBfanN4cyhMaW5lQ2hhcnQsIHsgZGF0YTogdGltZWxpbmVEYXRhLCBjaGlsZHJlbjogW19qc3goQ2FydGVzaWFuR3JpZCwgeyBzdHJva2VEYXNoYXJyYXk6IFwiMyAzXCIsIGNsYXNzTmFtZTogXCJzdHJva2UtZ3JheS0zMDAgZGFyazpzdHJva2UtZ3JheS03MDBcIiB9KSwgX2pzeChYQXhpcywgeyBkYXRhS2V5OiBcImhvdXJcIiwgY2xhc3NOYW1lOiBcInRleHQteHNcIiwgdGljazogeyBmaWxsOiAnY3VycmVudENvbG9yJyB9IH0pLCBfanN4KFlBeGlzLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzXCIsIHRpY2s6IHsgZmlsbDogJ2N1cnJlbnRDb2xvcicgfSB9KSwgX2pzeChUb29sdGlwLCB7fSksIF9qc3goTGluZSwgeyB0eXBlOiBcIm1vbm90b25lXCIsIGRhdGFLZXk6IFwiY291bnRcIiwgc3Ryb2tlOiBcIiNlZjQ0NDRcIiwgc3Ryb2tlV2lkdGg6IDIgfSldIH0pIH0pXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4KEZpbHRlciwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSksIChmaWx0ZXJzLmV2ZW50Q2F0ZWdvcnkgfHwgZmlsdGVycy5zZXZlcml0eSB8fCBmaWx0ZXJzLnVzZXIgfHwgZmlsdGVycy5yZXNvdXJjZSB8fCBmaWx0ZXJzLnJlc3VsdCB8fCBmaWx0ZXJzLmRhdGVGcm9tIHx8IGZpbHRlcnMuZGF0ZVRvIHx8IGZpbHRlcnMuc2VhcmNoVGV4dCkgJiYgKF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZ2hvc3RcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogY2xlYXJGaWx0ZXJzLCBcImRhdGEtY3lcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2xlYXItZmlsdGVycy1idG5cIiwgY2hpbGRyZW46IFwiQ2xlYXIgQWxsXCIgfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNCBsZzpncmlkLWNvbHMtOCBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goSW5wdXQsIHsgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGV2ZW50cy4uLlwiLCB2YWx1ZTogZmlsdGVycy5zZWFyY2hUZXh0LCBvbkNoYW5nZTogKGUpID0+IHVwZGF0ZUZpbHRlcignc2VhcmNoVGV4dCcsIGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcIm1kOmNvbC1zcGFuLTJcIiwgXCJkYXRhLWN5XCI6IFwic2VhcmNoLWlucHV0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzZWFyY2gtaW5wdXRcIiB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMuZXZlbnRDYXRlZ29yeSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmlsdGVyKCdldmVudENhdGVnb3J5JywgdmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgQ2F0ZWdvcmllcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5jYXRlZ29yaWVzID8/IFtdKS5tYXAoY2F0ID0+ICh7IHZhbHVlOiBjYXQsIGxhYmVsOiBjYXQgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIFwiZGF0YS1jeVwiOiBcImNhdGVnb3J5LXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2F0ZWdvcnktc2VsZWN0XCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLnNldmVyaXR5LCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ3NldmVyaXR5JywgdmFsdWUpLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgU2V2ZXJpdGllcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5zZXZlcml0aWVzID8/IFtdKS5tYXAoc2V2ID0+ICh7IHZhbHVlOiBzZXYsIGxhYmVsOiBzZXYgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIFwiZGF0YS1jeVwiOiBcInNldmVyaXR5LXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic2V2ZXJpdHktc2VsZWN0XCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLnJlc3VsdCwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmlsdGVyKCdyZXN1bHQnLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBSZXN1bHRzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LnJlc3VsdHMgPz8gW10pLm1hcChyZXMgPT4gKHsgdmFsdWU6IHJlcywgbGFiZWw6IHJlcyB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwicmVzdWx0LXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVzdWx0LXNlbGVjdFwiIH0pLCBfanN4KElucHV0LCB7IHR5cGU6IFwiZGF0ZVwiLCBwbGFjZWhvbGRlcjogXCJGcm9tIERhdGVcIiwgdmFsdWU6IGZpbHRlcnMuZGF0ZUZyb20sIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdkYXRlRnJvbScsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwiZGF0ZS1mcm9tLWlucHV0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkYXRlLWZyb20taW5wdXRcIiB9KSwgX2pzeChJbnB1dCwgeyB0eXBlOiBcImRhdGVcIiwgcGxhY2Vob2xkZXI6IFwiVG8gRGF0ZVwiLCB2YWx1ZTogZmlsdGVycy5kYXRlVG8sIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdkYXRlVG8nLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcImRhdGUtdG8taW5wdXRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRhdGUtdG8taW5wdXRcIiB9KSwgX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJVc2VyLi4uXCIsIHZhbHVlOiBmaWx0ZXJzLnVzZXIsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCd1c2VyJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJ1c2VyLWlucHV0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ1c2VyLWlucHV0XCIgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6IGxvYWREYXRhLCBsb2FkaW5nOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLWJ0blwiLCBjaGlsZHJlbjogXCJSZWZyZXNoXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IGlzTGl2ZU1vZGUgPyAnc2Vjb25kYXJ5JyA6ICdnaG9zdCcsIGljb246IF9qc3goUmFkaW8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogdG9nZ2xlTGl2ZU1vZGUsIFwiZGF0YS1jeVwiOiBcImxpdmUtbW9kZS1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImxpdmUtbW9kZS1idG5cIiwgY2hpbGRyZW46IGlzTGl2ZU1vZGUgPyAnU3RvcCBMaXZlJyA6ICdTdGFydCBMaXZlJyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBleHBvcnREYXRhKCdjc3YnKSwgZGlzYWJsZWQ6IChkYXRhPy5sZW5ndGggPz8gMCkgPT09IDAsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3YtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtY3N2LWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogKCkgPT4gZXhwb3J0RGF0YSgnanNvbicpLCBkaXNhYmxlZDogKGRhdGE/Lmxlbmd0aCA/PyAwKSA9PT0gMCwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWpzb24tYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtanNvbi1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IEpTT05cIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBleHBvcnREYXRhKCdzaWVtJyksIGRpc2FibGVkOiAoZGF0YT8ubGVuZ3RoID8/IDApID09PSAwLCBcImRhdGEtY3lcIjogXCJleHBvcnQtc2llbS1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1zaWVtLWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgU0lFTS9DRUZcIiB9KV0gfSldIH0pIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJteC02IG10LTQgcC00IGJnLXJlZC01MCBkYXJrOmJnLXJlZC05MDAvMjAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIGRhcms6Ym9yZGVyLXJlZC04MDAgcm91bmRlZC1tZFwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC04MDAgZGFyazp0ZXh0LXJlZC0yMDBcIiwgY2hpbGRyZW46IGVycm9yIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctaGlkZGVuIHAtNlwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGRhdGEsIGNvbHVtbnM6IGNvbHVtbnMsIGxvYWRpbmc6IGlzTG9hZGluZywgZW5hYmxlU2VsZWN0aW9uOiB0cnVlLCBzZWxlY3Rpb25Nb2RlOiBcIm11bHRpcGxlXCIsIG9uU2VsZWN0aW9uQ2hhbmdlOiBzZXRTZWxlY3RlZEV2ZW50cywgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSA3MDBweClcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNlY3VyaXR5QXVkaXRWaWV3O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=