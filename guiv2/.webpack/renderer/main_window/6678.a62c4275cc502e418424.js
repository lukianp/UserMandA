(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6678],{

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

/***/ 42815:
/*!***********************************************************************!*\
  !*** ./src/renderer/views/security/SecurityAuditView.tsx + 1 modules ***!
  \***********************************************************************/
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
    const { selectedSourceProfile } = (0,useProfileStore.useProfileStore)();
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "security-audit-view", "data-testid": "security-audit-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.Shield, { className: "w-8 h-8 text-red-600 dark:text-red-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Security Audit" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Audit security events and monitor audit trail" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [isLiveMode && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full", children: [(0,jsx_runtime.jsx)(lucide_react.Radio, { className: "w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-semibold text-green-600 dark:text-green-400", children: "Live" })] })), selectedProfile && ((0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] }))] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-6 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Total Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.critical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "High Severity" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.high ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400 font-medium", children: "Failures" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: stats?.failures ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-purple-600 dark:text-purple-400 font-medium", children: "Auth Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-purple-900 dark:text-purple-100", children: stats?.authEvents ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-indigo-600 dark:text-indigo-400 font-medium", children: "Security Events" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-indigo-900 dark:text-indigo-100", children: stats?.securityEvents ?? 0 })] })] }) }), (timelineData?.length ?? 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3", children: "Event Timeline (Hourly)" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 120, children: (0,jsx_runtime.jsxs)(es6.LineChart, { data: timelineData, children: [(0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-700" }), (0,jsx_runtime.jsx)(es6.XAxis, { dataKey: "hour", className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.YAxis, { className: "text-xs", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.Tooltip, {}), (0,jsx_runtime.jsx)(es6.Line, { type: "monotone", dataKey: "count", stroke: "#ef4444", strokeWidth: 2 })] }) })] })), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react.Filter, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.eventCategory || filters.severity || filters.user || filters.resource || filters.result || filters.dateFrom || filters.dateTo || filters.searchText) && ((0,jsx_runtime.jsx)(Button.Button, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3", children: [(0,jsx_runtime.jsx)(Input.Input, { placeholder: "Search events...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), className: "md:col-span-2", "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.eventCategory, onChange: (value) => updateFilter('eventCategory', value), options: [
                                    { value: '', label: 'All Categories' },
                                    ...(filterOptions?.categories ?? []).map(cat => ({ value: cat, label: cat }))
                                ], "data-cy": "category-select", "data-testid": "category-select" }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.severity, onChange: (value) => updateFilter('severity', value), options: [
                                    { value: '', label: 'All Severities' },
                                    ...(filterOptions?.severities ?? []).map(sev => ({ value: sev, label: sev }))
                                ], "data-cy": "severity-select", "data-testid": "severity-select" }), (0,jsx_runtime.jsx)(Select.Select, { value: filters.result, onChange: (value) => updateFilter('result', value), options: [
                                    { value: '', label: 'All Results' },
                                    ...(filterOptions?.results ?? []).map(res => ({ value: res, label: res }))
                                ], "data-cy": "result-select", "data-testid": "result-select" }), (0,jsx_runtime.jsx)(Input.Input, { type: "date", placeholder: "From Date", value: filters.dateFrom, onChange: (e) => updateFilter('dateFrom', e.target.value), "data-cy": "date-from-input", "data-testid": "date-from-input" }), (0,jsx_runtime.jsx)(Input.Input, { type: "date", placeholder: "To Date", value: filters.dateTo, onChange: (e) => updateFilter('dateTo', e.target.value), "data-cy": "date-to-input", "data-testid": "date-to-input" }), (0,jsx_runtime.jsx)(Input.Input, { placeholder: "User...", value: filters.user, onChange: (e) => updateFilter('user', e.target.value), "data-cy": "user-input", "data-testid": "user-input" })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { variant: isLiveMode ? 'secondary' : 'ghost', icon: (0,jsx_runtime.jsx)(lucide_react.Radio, { className: "w-4 h-4" }), onClick: toggleLiveMode, "data-cy": "live-mode-btn", "data-testid": "live-mode-btn", children: isLiveMode ? 'Stop Live' : 'Start Live' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: () => exportData('csv'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-csv-btn", "data-testid": "export-csv-btn", children: "Export CSV" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: () => exportData('json'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-json-btn", "data-testid": "export-json-btn", children: "Export JSON" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), onClick: () => exportData('siem'), disabled: (data?.length ?? 0) === 0, "data-cy": "export-siem-btn", "data-testid": "export-siem-btn", children: "Export SIEM/CEF" })] })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedEvents, height: "calc(100vh - 700px)" }) })] }));
};
/* harmony default export */ const security_SecurityAuditView = (SecurityAuditView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VSxtR0FBbUcsSUFBSSxvQkFBb0Isc0RBQUksQ0FBQyxpREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLGlEQUFPLElBQUksVUFBVSw4RUFBOEUsS0FBSyxJQUFJLEdBQUcsdURBQUssVUFBVSxxREFBcUQsc0RBQUksVUFBVSx1TkFBdU4sc0RBQUksQ0FBQyxtREFBTyxJQUFJLHNDQUFzQyxHQUFHLElBQUksc0RBQUksVUFBVSxXQUFXLDBDQUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxzREFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBOzs7Ozs7Ozs7OztBQ2xLQSxlOzs7Ozs7Ozs7O0FDQUEsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvSW5wdXQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVNlY3VyaXR5QXVkaXRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9zZWN1cml0eS9TZWN1cml0eUF1ZGl0Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCIvKipcbiAqIFNlY3VyaXR5IEF1ZGl0IExvZ2ljIEhvb2tcbiAqIEhhbmRsZXMgc2VjdXJpdHkgYXVkaXQgbG9nIHZpZXdpbmcgYW5kIGFuYWx5c2lzXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VTZWN1cml0eUF1ZGl0TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIC8vIERhdGEgc3RhdGVcbiAgICBjb25zdCBbZGF0YSwgc2V0RGF0YV0gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbaXNMaXZlTW9kZSwgc2V0SXNMaXZlTW9kZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBGaWx0ZXIgc3RhdGVcbiAgICBjb25zdCBbZmlsdGVycywgc2V0RmlsdGVyc10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIGV2ZW50Q2F0ZWdvcnk6ICcnLFxuICAgICAgICBzZXZlcml0eTogJycsXG4gICAgICAgIHVzZXI6ICcnLFxuICAgICAgICByZXNvdXJjZTogJycsXG4gICAgICAgIHJlc3VsdDogJycsXG4gICAgICAgIGRhdGVGcm9tOiAnJyxcbiAgICAgICAgZGF0ZVRvOiAnJyxcbiAgICAgICAgc2VhcmNoVGV4dDogJycsXG4gICAgfSk7XG4gICAgLy8gU2VsZWN0aW9uIHN0YXRlXG4gICAgY29uc3QgW3NlbGVjdGVkRXZlbnRzLCBzZXRTZWxlY3RlZEV2ZW50c10gPSB1c2VTdGF0ZShbXSk7XG4gICAgLy8gQ29sdW1uIGRlZmluaXRpb25zXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVGltZXN0YW1wJyxcbiAgICAgICAgICAgIGZpZWxkOiAndGltZXN0YW1wJyxcbiAgICAgICAgICAgIHBpbm5lZDogJ2xlZnQnLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNvcnQ6ICdkZXNjJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NldmVyaXR5JyxcbiAgICAgICAgICAgIGZpZWxkOiAnc2V2ZXJpdHknLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBDcml0aWNhbDogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGRhcms6YmctcmVkLTkwMC8yMCBkYXJrOnRleHQtcmVkLTQwMCcsXG4gICAgICAgICAgICAgICAgICAgIEhpZ2g6ICdiZy1vcmFuZ2UtMTAwIHRleHQtb3JhbmdlLTgwMCBkYXJrOmJnLW9yYW5nZS05MDAvMjAgZGFyazp0ZXh0LW9yYW5nZS00MDAnLFxuICAgICAgICAgICAgICAgICAgICBNZWRpdW06ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBkYXJrOmJnLXllbGxvdy05MDAvMjAgZGFyazp0ZXh0LXllbGxvdy00MDAnLFxuICAgICAgICAgICAgICAgICAgICBMb3c6ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtODAwIGRhcms6YmctYmx1ZS05MDAvMjAgZGFyazp0ZXh0LWJsdWUtNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgSW5mbzogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgZGFyazpiZy1ncmF5LTkwMC8yMCBkYXJrOnRleHQtZ3JheS00MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJweC0yIHB5LTEgcm91bmRlZCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgJHtjb2xvcn1cIj4ke3BhcmFtcy52YWx1ZX08L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDYXRlZ29yeScsXG4gICAgICAgICAgICBmaWVsZDogJ2V2ZW50Q2F0ZWdvcnknLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdFdmVudCBUeXBlJyxcbiAgICAgICAgICAgIGZpZWxkOiAnZXZlbnRUeXBlJyxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVXNlcicsXG4gICAgICAgICAgICBmaWVsZDogJ3VzZXInLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBY3Rpb24nLFxuICAgICAgICAgICAgZmllbGQ6ICdhY3Rpb24nLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Jlc291cmNlJyxcbiAgICAgICAgICAgIGZpZWxkOiAncmVzb3VyY2UnLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSZXN1bHQnLFxuICAgICAgICAgICAgZmllbGQ6ICdyZXN1bHQnLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yTWFwID0ge1xuICAgICAgICAgICAgICAgICAgICBTdWNjZXNzOiAndGV4dC1ncmVlbi02MDAnLFxuICAgICAgICAgICAgICAgICAgICBGYWlsdXJlOiAndGV4dC1yZWQtNjAwJyxcbiAgICAgICAgICAgICAgICAgICAgV2FybmluZzogJ3RleHQteWVsbG93LTYwMCcsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGNvbG9yTWFwW3BhcmFtcy52YWx1ZV0gfHwgJ3RleHQtZ3JheS02MDAnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCIke2NvbG9yfSBmb250LXNlbWlib2xkXCI+JHtwYXJhbXMudmFsdWV9PC9zcGFuPmA7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU291cmNlIElQJyxcbiAgICAgICAgICAgIGZpZWxkOiAnc291cmNlSVAnLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1NvdXJjZSBMb2NhdGlvbicsXG4gICAgICAgICAgICBmaWVsZDogJ3NvdXJjZUxvY2F0aW9uJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUYXJnZXQgUmVzb3VyY2UnLFxuICAgICAgICAgICAgZmllbGQ6ICd0YXJnZXRSZXNvdXJjZScsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGV0YWlscycsXG4gICAgICAgICAgICBmaWVsZDogJ2RldGFpbHMnLFxuICAgICAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgICAgIHdyYXBUZXh0OiB0cnVlLFxuICAgICAgICAgICAgYXV0b0hlaWdodDogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb3JyZWxhdGlvbiBJRCcsXG4gICAgICAgICAgICBmaWVsZDogJ2NvcnJlbGF0aW9uSWQnLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgLy8gRmlsdGVyZWQgZGF0YVxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gWy4uLmRhdGFdO1xuICAgICAgICBpZiAoZmlsdGVycy5ldmVudENhdGVnb3J5KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmV2ZW50Q2F0ZWdvcnkgPT09IGZpbHRlcnMuZXZlbnRDYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuc2V2ZXJpdHkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uc2V2ZXJpdHkgPT09IGZpbHRlcnMuc2V2ZXJpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLnVzZXIpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGl0ZW0pID0+IChpdGVtLnVzZXIgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVycy51c2VyLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5yZXNvdXJjZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gKGl0ZW0ucmVzb3VyY2UgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVycy5yZXNvdXJjZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMucmVzdWx0KSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLnJlc3VsdCA9PT0gZmlsdGVycy5yZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWx0ZXJzLmRhdGVGcm9tKSB7XG4gICAgICAgICAgICBjb25zdCBmcm9tRGF0ZSA9IG5ldyBEYXRlKGZpbHRlcnMuZGF0ZUZyb20pO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gbmV3IERhdGUoaXRlbS50aW1lc3RhbXApID49IGZyb21EYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsdGVycy5kYXRlVG8pIHtcbiAgICAgICAgICAgIGNvbnN0IHRvRGF0ZSA9IG5ldyBEYXRlKGZpbHRlcnMuZGF0ZVRvKTtcbiAgICAgICAgICAgIHRvRGF0ZS5zZXRIb3VycygyMywgNTksIDU5LCA5OTkpO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gbmV3IERhdGUoaXRlbS50aW1lc3RhbXApIDw9IHRvRGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gZmlsdGVycy5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5ldmVudFR5cGUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLnVzZXIgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLmFjdGlvbiA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgKGl0ZW0uZGV0YWlscyA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhLCBmaWx0ZXJzXSk7XG4gICAgLy8gRmlsdGVyIG9wdGlvbnNcbiAgICBjb25zdCBmaWx0ZXJPcHRpb25zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBbJ0F1dGhlbnRpY2F0aW9uJywgJ0F1dGhvcml6YXRpb24nLCAnRGF0YUFjY2VzcycsICdDb25maWd1cmF0aW9uJywgJ1NlY3VyaXR5JywgJ1N5c3RlbSddO1xuICAgICAgICBjb25zdCBzZXZlcml0aWVzID0gWydDcml0aWNhbCcsICdIaWdoJywgJ01lZGl1bScsICdMb3cnLCAnSW5mbyddO1xuICAgICAgICBjb25zdCByZXN1bHRzID0gWydTdWNjZXNzJywgJ0ZhaWx1cmUnLCAnV2FybmluZyddO1xuICAgICAgICByZXR1cm4geyBjYXRlZ29yaWVzLCBzZXZlcml0aWVzLCByZXN1bHRzIH07XG4gICAgfSwgW10pO1xuICAgIC8vIExvYWQgZGF0YVxuICAgIGNvbnN0IGxvYWREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIHNvdXJjZSBwcm9maWxlIHNlbGVjdGVkJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9TZWN1cml0eS9BdWRpdExvZy5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtU2VjdXJpdHlBdWRpdEV2ZW50cycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBEb21haW46IHNlbGVjdGVkU291cmNlUHJvZmlsZS5kb21haW4sXG4gICAgICAgICAgICAgICAgICAgIENyZWRlbnRpYWw6IHNlbGVjdGVkU291cmNlUHJvZmlsZS5jcmVkZW50aWFsLFxuICAgICAgICAgICAgICAgICAgICBTdGFydERhdGU6IGZpbHRlcnMuZGF0ZUZyb20gfHwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgRW5kRGF0ZTogZmlsdGVycy5kYXRlVG8gfHwgbnVsbCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZXREYXRhKHJlc3VsdC5kYXRhLmV2ZW50cyB8fCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCBzZWN1cml0eSBhdWRpdCBldmVudHMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBmaWx0ZXJzLmRhdGVGcm9tLCBmaWx0ZXJzLmRhdGVUb10pO1xuICAgIC8vIFRvZ2dsZSBsaXZlIG1vZGVcbiAgICBjb25zdCB0b2dnbGVMaXZlTW9kZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0SXNMaXZlTW9kZSgocHJldikgPT4gIXByZXYpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBVcGRhdGUgZmlsdGVyXG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycygocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHZhbHVlIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gQ2xlYXIgZmlsdGVyc1xuICAgIGNvbnN0IGNsZWFyRmlsdGVycyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycyh7XG4gICAgICAgICAgICBldmVudENhdGVnb3J5OiAnJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnJyxcbiAgICAgICAgICAgIHVzZXI6ICcnLFxuICAgICAgICAgICAgcmVzb3VyY2U6ICcnLFxuICAgICAgICAgICAgcmVzdWx0OiAnJyxcbiAgICAgICAgICAgIGRhdGVGcm9tOiAnJyxcbiAgICAgICAgICAgIGRhdGVUbzogJycsXG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICAgICAgfSk7XG4gICAgfSwgW10pO1xuICAgIC8vIEV4cG9ydCBkYXRhXG4gICAgY29uc3QgZXhwb3J0RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jIChmb3JtYXQpID0+IHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6Ll0vZywgJy0nKTtcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBgc2VjdXJpdHktYXVkaXQtJHt0aW1lc3RhbXB9LiR7Zm9ybWF0fWA7XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdzaWVtJykge1xuICAgICAgICAgICAgLy8gRXhwb3J0IGluIENFRiAoQ29tbW9uIEV2ZW50IEZvcm1hdCkgZm9yIFNJRU0gc3lzdGVtc1xuICAgICAgICAgICAgY29uc3QgY2VmRGF0YSA9IGZpbHRlcmVkRGF0YS5tYXAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBDRUY6MHxNYW5kQXxEaXNjb3Zlcnl8MS4wfCR7ZXZlbnQuZXZlbnRUeXBlfXwke2V2ZW50LmFjdGlvbn18JHtldmVudC5zZXZlcml0eSA9PT0gJ0NyaXRpY2FsJyA/IDEwIDogZXZlbnQuc2V2ZXJpdHkgPT09ICdIaWdoJyA/IDggOiBldmVudC5zZXZlcml0eSA9PT0gJ01lZGl1bScgPyA1IDogM318c3JjPSR7ZXZlbnQuc291cmNlSVB9IHN1c2VyPSR7ZXZlbnQudXNlcn0gY3MxPSR7ZXZlbnQucmVzb3VyY2V9IGNzMj0ke2V2ZW50LmRldGFpbHN9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHsgZmlsZW5hbWU6IGBzZWN1cml0eS1hdWRpdC0ke3RpbWVzdGFtcH0uY2VmYCwgZGF0YTogY2VmRGF0YS5qb2luKCdcXG4nKSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGZpbGVuYW1lLCBkYXRhOiBmaWx0ZXJlZERhdGEgfTtcbiAgICB9LCBbZmlsdGVyZWREYXRhXSk7XG4gICAgLy8gU3RhdGlzdGljc1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gZmlsdGVyZWREYXRhLmxlbmd0aDtcbiAgICAgICAgY29uc3QgY3JpdGljYWwgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChlKSA9PiBlLnNldmVyaXR5ID09PSAnQ3JpdGljYWwnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhpZ2ggPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChlKSA9PiBlLnNldmVyaXR5ID09PSAnSGlnaCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgZmFpbHVyZXMgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChlKSA9PiBlLnJlc3VsdCA9PT0gJ0ZhaWx1cmUnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGF1dGhFdmVudHMgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChlKSA9PiBlLmV2ZW50Q2F0ZWdvcnkgPT09ICdBdXRoZW50aWNhdGlvbicpLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2VjdXJpdHlFdmVudHMgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChlKSA9PiBlLmV2ZW50Q2F0ZWdvcnkgPT09ICdTZWN1cml0eScpLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsLFxuICAgICAgICAgICAgY3JpdGljYWwsXG4gICAgICAgICAgICBoaWdoLFxuICAgICAgICAgICAgZmFpbHVyZXMsXG4gICAgICAgICAgICBhdXRoRXZlbnRzLFxuICAgICAgICAgICAgc2VjdXJpdHlFdmVudHMsXG4gICAgICAgIH07XG4gICAgfSwgW2ZpbHRlcmVkRGF0YV0pO1xuICAgIC8vIEV2ZW50IHRpbWVsaW5lIGRhdGFcbiAgICBjb25zdCB0aW1lbGluZURhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgaG91ckNvdW50cyA9IHt9O1xuICAgICAgICBmaWx0ZXJlZERhdGEuZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShldmVudC50aW1lc3RhbXApO1xuICAgICAgICAgICAgY29uc3QgaG91cktleSA9IGAke2RhdGUuZ2V0SG91cnMoKX06MDBgO1xuICAgICAgICAgICAgaG91ckNvdW50c1tob3VyS2V5XSA9IChob3VyQ291bnRzW2hvdXJLZXldIHx8IDApICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyhob3VyQ291bnRzKVxuICAgICAgICAgICAgLm1hcCgoW2hvdXIsIGNvdW50XSkgPT4gKHsgaG91ciwgY291bnQgfSkpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gcGFyc2VJbnQoYS5ob3VyKSAtIHBhcnNlSW50KGIuaG91cikpO1xuICAgIH0sIFtmaWx0ZXJlZERhdGFdKTtcbiAgICAvLyBMaXZlIG1vZGUgcG9sbGluZ1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghaXNMaXZlTW9kZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBsb2FkRGF0YSgpO1xuICAgICAgICB9LCAzMDAwMCk7IC8vIFBvbGwgZXZlcnkgMzAgc2Vjb25kc1xuICAgICAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSwgW2lzTGl2ZU1vZGUsIGxvYWREYXRhXSk7XG4gICAgLy8gTG9hZCBkYXRhIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgbG9hZERhdGEoKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGxvYWREYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBkYXRhOiBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgaXNMaXZlTW9kZSxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIC8vIEZpbHRlcnNcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgdXBkYXRlRmlsdGVyLFxuICAgICAgICBjbGVhckZpbHRlcnMsXG4gICAgICAgIC8vIFNlbGVjdGlvblxuICAgICAgICBzZWxlY3RlZEV2ZW50cyxcbiAgICAgICAgc2V0U2VsZWN0ZWRFdmVudHMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgbG9hZERhdGEsXG4gICAgICAgIHRvZ2dsZUxpdmVNb2RlLFxuICAgICAgICBleHBvcnREYXRhLFxuICAgICAgICAvLyBTdGF0aXN0aWNzXG4gICAgICAgIHN0YXRzLFxuICAgICAgICB0aW1lbGluZURhdGEsXG4gICAgICAgIC8vIFByb2ZpbGVcbiAgICAgICAgc2VsZWN0ZWRQcm9maWxlOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTZWN1cml0eSBBdWRpdCBWaWV3XG4gKiBEaXNwbGF5cyBzZWN1cml0eSBhdWRpdCBsb2dzIHdpdGggZmlsdGVyaW5nIGFuZCByZWFsLXRpbWUgdXBkYXRlc1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2hpZWxkLCBSZWZyZXNoQ3csIERvd25sb2FkLCBGaWx0ZXIsIFgsIFJhZGlvIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IExpbmVDaGFydCwgTGluZSwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBSZXNwb25zaXZlQ29udGFpbmVyIH0gZnJvbSAncmVjaGFydHMnO1xuaW1wb3J0IHsgdXNlU2VjdXJpdHlBdWRpdExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlU2VjdXJpdHlBdWRpdExvZ2ljJztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5jb25zdCBTZWN1cml0eUF1ZGl0VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIGNvbHVtbnMsIGlzTG9hZGluZywgaXNMaXZlTW9kZSwgZXJyb3IsIGZpbHRlcnMsIGZpbHRlck9wdGlvbnMsIHVwZGF0ZUZpbHRlciwgY2xlYXJGaWx0ZXJzLCBzZWxlY3RlZEV2ZW50cywgc2V0U2VsZWN0ZWRFdmVudHMsIGxvYWREYXRhLCB0b2dnbGVMaXZlTW9kZSwgZXhwb3J0RGF0YSwgc3RhdHMsIHRpbWVsaW5lRGF0YSwgc2VsZWN0ZWRQcm9maWxlLCB9ID0gdXNlU2VjdXJpdHlBdWRpdExvZ2ljKCk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwic2VjdXJpdHktYXVkaXQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VjdXJpdHktYXVkaXQtdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTggaC04IHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJTZWN1cml0eSBBdWRpdFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkF1ZGl0IHNlY3VyaXR5IGV2ZW50cyBhbmQgbW9uaXRvciBhdWRpdCB0cmFpbFwiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbaXNMaXZlTW9kZSAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtMyBweS0xIGJnLWdyZWVuLTEwMCBkYXJrOmJnLWdyZWVuLTkwMC8yMCByb3VuZGVkLWZ1bGxcIiwgY2hpbGRyZW46IFtfanN4KFJhZGlvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDAgYW5pbWF0ZS1wdWxzZVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogXCJMaXZlXCIgfSldIH0pKSwgc2VsZWN0ZWRQcm9maWxlICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbXCJQcm9maWxlOiBcIiwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogc2VsZWN0ZWRQcm9maWxlLm5hbWUgfSldIH0pKV0gfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtNiBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWJsdWUtNTAgZGFyazpiZy1ibHVlLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJUb3RhbCBFdmVudHNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy50b3RhbCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiQ3JpdGljYWxcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uY3JpdGljYWwgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLW9yYW5nZS01MCBkYXJrOmJnLW9yYW5nZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1vcmFuZ2UtNjAwIGRhcms6dGV4dC1vcmFuZ2UtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkhpZ2ggU2V2ZXJpdHlcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1vcmFuZ2UtOTAwIGRhcms6dGV4dC1vcmFuZ2UtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uaGlnaCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmcteWVsbG93LTUwIGRhcms6YmcteWVsbG93LTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiRmFpbHVyZXNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC15ZWxsb3ctOTAwIGRhcms6dGV4dC15ZWxsb3ctMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uZmFpbHVyZXMgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXB1cnBsZS01MCBkYXJrOmJnLXB1cnBsZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1wdXJwbGUtNjAwIGRhcms6dGV4dC1wdXJwbGUtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkF1dGggRXZlbnRzXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcHVycGxlLTkwMCBkYXJrOnRleHQtcHVycGxlLTEwMFwiLCBjaGlsZHJlbjogc3RhdHM/LmF1dGhFdmVudHMgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLWluZGlnby01MCBkYXJrOmJnLWluZGlnby05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1pbmRpZ28tNjAwIGRhcms6dGV4dC1pbmRpZ28tNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIlNlY3VyaXR5IEV2ZW50c1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWluZGlnby05MDAgZGFyazp0ZXh0LWluZGlnby0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy5zZWN1cml0eUV2ZW50cyA/PyAwIH0pXSB9KV0gfSkgfSksICh0aW1lbGluZURhdGE/Lmxlbmd0aCA/PyAwKSA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItM1wiLCBjaGlsZHJlbjogXCJFdmVudCBUaW1lbGluZSAoSG91cmx5KVwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDEyMCwgY2hpbGRyZW46IF9qc3hzKExpbmVDaGFydCwgeyBkYXRhOiB0aW1lbGluZURhdGEsIGNoaWxkcmVuOiBbX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgY2xhc3NOYW1lOiBcInN0cm9rZS1ncmF5LTMwMCBkYXJrOnN0cm9rZS1ncmF5LTcwMFwiIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwiaG91clwiLCBjbGFzc05hbWU6IFwidGV4dC14c1wiLCB0aWNrOiB7IGZpbGw6ICdjdXJyZW50Q29sb3InIH0gfSksIF9qc3goWUF4aXMsIHsgY2xhc3NOYW1lOiBcInRleHQteHNcIiwgdGljazogeyBmaWxsOiAnY3VycmVudENvbG9yJyB9IH0pLCBfanN4KFRvb2x0aXAsIHt9KSwgX2pzeChMaW5lLCB7IHR5cGU6IFwibW9ub3RvbmVcIiwgZGF0YUtleTogXCJjb3VudFwiLCBzdHJva2U6IFwiI2VmNDQ0NFwiLCBzdHJva2VXaWR0aDogMiB9KV0gfSkgfSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgbWItM1wiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSwgKGZpbHRlcnMuZXZlbnRDYXRlZ29yeSB8fCBmaWx0ZXJzLnNldmVyaXR5IHx8IGZpbHRlcnMudXNlciB8fCBmaWx0ZXJzLnJlc291cmNlIHx8IGZpbHRlcnMucmVzdWx0IHx8IGZpbHRlcnMuZGF0ZUZyb20gfHwgZmlsdGVycy5kYXRlVG8gfHwgZmlsdGVycy5zZWFyY2hUZXh0KSAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBjbGVhckZpbHRlcnMsIFwiZGF0YS1jeVwiOiBcImNsZWFyLWZpbHRlcnMtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBjaGlsZHJlbjogXCJDbGVhciBBbGxcIiB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy00IGxnOmdyaWQtY29scy04IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJTZWFyY2ggZXZlbnRzLi4uXCIsIHZhbHVlOiBmaWx0ZXJzLnNlYXJjaFRleHQsIG9uQ2hhbmdlOiAoZSkgPT4gdXBkYXRlRmlsdGVyKCdzZWFyY2hUZXh0JywgZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwibWQ6Y29sLXNwYW4tMlwiLCBcImRhdGEtY3lcIjogXCJzZWFyY2gtaW5wdXRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInNlYXJjaC1pbnB1dFwiIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy5ldmVudENhdGVnb3J5LCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ2V2ZW50Q2F0ZWdvcnknLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBDYXRlZ29yaWVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LmNhdGVnb3JpZXMgPz8gW10pLm1hcChjYXQgPT4gKHsgdmFsdWU6IGNhdCwgbGFiZWw6IGNhdCB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwiY2F0ZWdvcnktc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjYXRlZ29yeS1zZWxlY3RcIiB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMuc2V2ZXJpdHksIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignc2V2ZXJpdHknLCB2YWx1ZSksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBTZXZlcml0aWVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LnNldmVyaXRpZXMgPz8gW10pLm1hcChzZXYgPT4gKHsgdmFsdWU6IHNldiwgbGFiZWw6IHNldiB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwic2V2ZXJpdHktc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzZXZlcml0eS1zZWxlY3RcIiB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMucmVzdWx0LCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ3Jlc3VsdCcsIHZhbHVlKSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJycsIGxhYmVsOiAnQWxsIFJlc3VsdHMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmlsdGVyT3B0aW9ucz8ucmVzdWx0cyA/PyBbXSkubWFwKHJlcyA9PiAoeyB2YWx1ZTogcmVzLCBsYWJlbDogcmVzIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCBcImRhdGEtY3lcIjogXCJyZXN1bHQtc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZXN1bHQtc2VsZWN0XCIgfSksIF9qc3goSW5wdXQsIHsgdHlwZTogXCJkYXRlXCIsIHBsYWNlaG9sZGVyOiBcIkZyb20gRGF0ZVwiLCB2YWx1ZTogZmlsdGVycy5kYXRlRnJvbSwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ2RhdGVGcm9tJywgZS50YXJnZXQudmFsdWUpLCBcImRhdGEtY3lcIjogXCJkYXRlLWZyb20taW5wdXRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRhdGUtZnJvbS1pbnB1dFwiIH0pLCBfanN4KElucHV0LCB7IHR5cGU6IFwiZGF0ZVwiLCBwbGFjZWhvbGRlcjogXCJUbyBEYXRlXCIsIHZhbHVlOiBmaWx0ZXJzLmRhdGVUbywgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ2RhdGVUbycsIGUudGFyZ2V0LnZhbHVlKSwgXCJkYXRhLWN5XCI6IFwiZGF0ZS10by1pbnB1dFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGF0ZS10by1pbnB1dFwiIH0pLCBfanN4KElucHV0LCB7IHBsYWNlaG9sZGVyOiBcIlVzZXIuLi5cIiwgdmFsdWU6IGZpbHRlcnMudXNlciwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3VzZXInLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInVzZXItaW5wdXRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInVzZXItaW5wdXRcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktM1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgb25DbGljazogbG9hZERhdGEsIGxvYWRpbmc6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogaXNMaXZlTW9kZSA/ICdzZWNvbmRhcnknIDogJ2dob3N0JywgaWNvbjogX2pzeChSYWRpbywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiB0b2dnbGVMaXZlTW9kZSwgXCJkYXRhLWN5XCI6IFwibGl2ZS1tb2RlLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwibGl2ZS1tb2RlLWJ0blwiLCBjaGlsZHJlbjogaXNMaXZlTW9kZSA/ICdTdG9wIExpdmUnIDogJ1N0YXJ0IExpdmUnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IGV4cG9ydERhdGEoJ2NzdicpLCBkaXNhYmxlZDogKGRhdGE/Lmxlbmd0aCA/PyAwKSA9PT0gMCwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdi1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1jc3YtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiAoKSA9PiBleHBvcnREYXRhKCdqc29uJyksIGRpc2FibGVkOiAoZGF0YT8ubGVuZ3RoID8/IDApID09PSAwLCBcImRhdGEtY3lcIjogXCJleHBvcnQtanNvbi1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1qc29uLWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgSlNPTlwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIG9uQ2xpY2s6ICgpID0+IGV4cG9ydERhdGEoJ3NpZW0nKSwgZGlzYWJsZWQ6IChkYXRhPy5sZW5ndGggPz8gMCkgPT09IDAsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1zaWVtLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LXNpZW0tYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBTSUVNL0NFRlwiIH0pXSB9KV0gfSkgfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm14LTYgbXQtNCBwLTQgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLW1kXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtcmVkLTgwMCBkYXJrOnRleHQtcmVkLTIwMFwiLCBjaGlsZHJlbjogZXJyb3IgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1oaWRkZW4gcC02XCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogZGF0YSwgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogaXNMb2FkaW5nLCBlbmFibGVTZWxlY3Rpb246IHRydWUsIHNlbGVjdGlvbk1vZGU6IFwibXVsdGlwbGVcIiwgb25TZWxlY3Rpb25DaGFuZ2U6IHNldFNlbGVjdGVkRXZlbnRzLCBoZWlnaHQ6IFwiY2FsYygxMDB2aCAtIDcwMHB4KVwiIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VjdXJpdHlBdWRpdFZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==