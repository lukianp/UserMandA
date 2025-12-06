(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2268],{

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

/***/ }),

/***/ 99377:
/*!************************************************************************!*\
  !*** ./src/renderer/views/analytics/UserAnalyticsView.tsx + 1 modules ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ analytics_UserAnalyticsView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/recharts/es6/index.js + 3 modules
var es6 = __webpack_require__(72085);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useUserAnalyticsLogic.ts

/**
 * Calculate license usage from Logic Engine statistics
 * In a real implementation, this would come from licensing discovery module
 */
function calculateLicenseUsage(stats) {
    const totalUsers = stats.UserCount || 0;
    const mailboxCount = stats.MailboxCount || 0;
    if (totalUsers === 0)
        return [];
    // Mock license distribution based on user counts
    return [
        {
            licenseName: 'Office 365 E3',
            assigned: Math.floor(totalUsers * 0.68),
            available: Math.floor(totalUsers * 0.12),
            total: Math.floor(totalUsers * 0.80),
            utilization: 85,
        },
        {
            licenseName: 'Office 365 E5',
            assigned: Math.floor(totalUsers * 0.17),
            available: Math.floor(totalUsers * 0.03),
            total: Math.floor(totalUsers * 0.20),
            utilization: 84,
        },
        {
            licenseName: 'Microsoft Teams',
            assigned: Math.floor(totalUsers * 0.89),
            available: Math.floor(totalUsers * 0.07),
            total: Math.floor(totalUsers * 0.96),
            utilization: 93,
        },
        {
            licenseName: 'Power BI Pro',
            assigned: Math.floor(totalUsers * 0.11),
            available: Math.floor(totalUsers * 0.05),
            total: Math.floor(totalUsers * 0.16),
            utilization: 70,
        },
    ];
}
/**
 * Calculate department breakdown from Logic Engine statistics
 * In a real implementation, this would aggregate user department data
 */
function calculateDepartmentBreakdown(stats) {
    const totalUsers = stats.UserCount || 0;
    if (totalUsers === 0)
        return [];
    // Mock department distribution - in reality this would come from CSV data
    const distribution = [
        { name: 'Sales', percentage: 19 },
        { name: 'Engineering', percentage: 25 },
        { name: 'Marketing', percentage: 12 },
        { name: 'HR', percentage: 7 },
        { name: 'Finance', percentage: 10 },
        { name: 'Operations', percentage: 15 },
        { name: 'Support', percentage: 12 },
    ];
    return distribution.map(dept => ({
        name: dept.name,
        value: Math.floor(totalUsers * (dept.percentage / 100)),
        percentage: dept.percentage,
    }));
}
/**
 * Generate activity heatmap data
 * In a real implementation, this would come from login tracking
 */
function generateActivityHeatmap() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const data = [];
    days.forEach(day => {
        for (let hour = 0; hour < 24; hour++) {
            let activity = 0;
            // Simulate work hours activity
            if (day !== 'Saturday' && day !== 'Sunday') {
                if (hour >= 8 && hour <= 17) {
                    activity = Math.floor(Math.random() * 100) + 50;
                }
                else if (hour >= 6 && hour <= 20) {
                    activity = Math.floor(Math.random() * 50) + 10;
                }
                else {
                    activity = Math.floor(Math.random() * 20);
                }
            }
            else {
                activity = Math.floor(Math.random() * 30);
            }
            data.push({ day, hour, activity });
        }
    });
    return data;
}
/**
 * Get mock analytics data for fallback
 */
function getMockAnalyticsData() {
    return {
        licenseUsage: [
            { licenseName: 'Office 365 E3', assigned: 8500, available: 1500, total: 10000, utilization: 85 },
            { licenseName: 'Office 365 E5', assigned: 2100, available: 400, total: 2500, utilization: 84 },
            { licenseName: 'Microsoft Teams', assigned: 11200, available: 800, total: 12000, utilization: 93 },
            { licenseName: 'Power BI Pro', assigned: 1400, available: 600, total: 2000, utilization: 70 },
        ],
        departmentBreakdown: [
            { name: 'Sales', value: 2340, percentage: 19 },
            { name: 'Engineering', value: 3120, percentage: 25 },
            { name: 'Marketing', value: 1560, percentage: 12 },
            { name: 'HR', value: 890, percentage: 7 },
            { name: 'Finance', value: 1240, percentage: 10 },
            { name: 'Operations', value: 1870, percentage: 15 },
            { name: 'Support', value: 1527, percentage: 12 },
        ],
        activityHeatmap: generateActivityHeatmap(),
        metrics: {
            activeUsers: 10234,
            inactiveUsers: 2313,
            averageLoginFrequency: 4.7,
            peakActivityTime: '10:00 AM - 11:00 AM',
        },
    };
}
const useUserAnalyticsLogic = () => {
    const [analyticsData, setAnalyticsData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [dateRange, setDateRange] = (0,react.useState)('30');
    const [selectedDepartment, setSelectedDepartment] = (0,react.useState)('all');
    const [isExporting, setIsExporting] = (0,react.useState)(false);
    const fetchAnalyticsData = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Get statistics from Logic Engine
            const result = await window.electronAPI.logicEngine.getStatistics();
            if (result.success && result.data?.statistics) {
                const stats = result.data.statistics;
                // Calculate license usage from user/mailbox data
                const licenseUsage = calculateLicenseUsage(stats);
                // Calculate department breakdown from user data
                const departmentBreakdown = calculateDepartmentBreakdown(stats);
                // Generate activity heatmap (requires login tracking not yet implemented)
                const activityHeatmap = generateActivityHeatmap();
                // Calculate user activity metrics
                const metrics = {
                    activeUsers: Math.floor((stats.UserCount || 0) * 0.85), // Estimate 85% active
                    inactiveUsers: Math.floor((stats.UserCount || 0) * 0.15), // Estimate 15% inactive
                    averageLoginFrequency: 4.2, // Mock data - requires login tracking
                    peakActivityTime: '10:00 AM - 11:00 AM', // Mock data - requires login tracking
                };
                const analyticsResult = {
                    licenseUsage,
                    departmentBreakdown,
                    activityHeatmap,
                    metrics,
                };
                setAnalyticsData(analyticsResult);
            }
            else {
                throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('User analytics fetch error:', err);
            // Set mock data for development/testing
            setAnalyticsData(getMockAnalyticsData());
        }
        finally {
            setIsLoading(false);
        }
    }, [dateRange, selectedDepartment]);
    // Initial load
    (0,react.useEffect)(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);
    // Export analytics report
    const handleExportReport = (0,react.useCallback)(async () => {
        if (!analyticsData)
            return;
        setIsExporting(true);
        try {
            // In a real implementation, this would call an export module
            console.log('Exporting analytics report...', analyticsData);
            // Mock export success
            const fileName = `UserAnalytics_${dateRange}days_${new Date().toISOString().split('T')[0]}.xlsx`;
            alert(`Report would be exported to: ${fileName}`);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Export failed';
            setError(errorMessage);
            console.error('Export error:', err);
        }
        finally {
            setIsExporting(false);
        }
    }, [analyticsData, dateRange]);
    // Available departments for filter
    const availableDepartments = (0,react.useMemo)(() => {
        if (!analyticsData)
            return [];
        return analyticsData.departmentBreakdown.map(d => ({ id: d.name, name: d.name }));
    }, [analyticsData]);
    // Filter data by department
    const filteredData = (0,react.useMemo)(() => {
        if (!analyticsData || selectedDepartment === 'all')
            return analyticsData;
        // In a real implementation, this would filter the actual data
        // For now, just return all data since we don't have department-level details
        return analyticsData;
    }, [analyticsData, selectedDepartment]);
    return {
        analyticsData: filteredData,
        isLoading,
        error,
        dateRange,
        setDateRange,
        selectedDepartment,
        setSelectedDepartment,
        availableDepartments,
        isExporting,
        handleExportReport,
        refreshData: fetchAnalyticsData,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
;// ./src/renderer/views/analytics/UserAnalyticsView.tsx






const StatCard = ({ title, value, icon, color, 'data-cy': dataCy }) => ((0,jsx_runtime.jsx)("div", { className: "p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm", "data-cy": dataCy, children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)("div", { className: `p-3 rounded-lg ${color}`, children: icon }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: title }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: typeof value === 'number' ? value.toLocaleString() : value })] })] }) }));
// Loading Skeleton
const AnalyticsSkeleton = () => ((0,jsx_runtime.jsxs)("div", { className: "h-full p-6 space-y-6 animate-pulse", children: [(0,jsx_runtime.jsx)("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [...Array(3)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) })] }));
// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: label }), payload.map((entry, index) => ((0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { style: { color: entry.color }, children: [entry.name, ": "] }), (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value })] }, index)))] }));
};
// Activity Heatmap Component
const ActivityHeatmap = ({ data }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const getActivityColor = (activity) => {
        if (activity >= 80)
            return 'bg-green-600';
        if (activity >= 60)
            return 'bg-green-500';
        if (activity >= 40)
            return 'bg-yellow-500';
        if (activity >= 20)
            return 'bg-orange-500';
        return 'bg-gray-300 dark:bg-gray-600';
    };
    return ((0,jsx_runtime.jsx)("div", { className: "overflow-x-auto", children: (0,jsx_runtime.jsxs)("div", { className: "inline-block min-w-full", children: [(0,jsx_runtime.jsxs)("div", { className: "flex gap-1", children: [(0,jsx_runtime.jsx)("div", { className: "flex flex-col gap-1 pt-6", children: days.map(day => ((0,jsx_runtime.jsx)("div", { className: "h-4 flex items-center text-xs text-gray-600 dark:text-gray-400 w-20", children: day.slice(0, 3) }, day))) }), (0,jsx_runtime.jsxs)("div", { className: "flex flex-col gap-1", children: [(0,jsx_runtime.jsx)("div", { className: "flex gap-1 mb-1", children: hours.map(hour => ((0,jsx_runtime.jsx)("div", { className: "w-4 text-xs text-gray-600 dark:text-gray-400 text-center", children: hour % 6 === 0 ? hour : '' }, hour))) }), days.map(day => ((0,jsx_runtime.jsx)("div", { className: "flex gap-1", children: hours.map(hour => {
                                        const item = (data ?? []).find(d => d.day === day && d.hour === hour);
                                        const activity = item?.activity || 0;
                                        return ((0,jsx_runtime.jsx)("div", { className: `w-4 h-4 rounded-sm ${getActivityColor(activity)} transition-all hover:scale-125 cursor-pointer`, title: `${day} ${hour}:00 - Activity: ${activity}%` }, hour));
                                    }) }, day)))] })] }), (0,jsx_runtime.jsxs)("div", { className: "mt-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsx)("span", { children: "Less" }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-1", children: [(0,jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm" }), (0,jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-orange-500 rounded-sm" }), (0,jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-yellow-500 rounded-sm" }), (0,jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-green-500 rounded-sm" }), (0,jsx_runtime.jsx)("div", { className: "w-4 h-4 bg-green-600 rounded-sm" })] }), (0,jsx_runtime.jsx)("span", { children: "More" })] })] }) }));
};
const UserAnalyticsView = () => {
    const { analyticsData, isLoading, error, dateRange, setDateRange, selectedDepartment, setSelectedDepartment, availableDepartments, isExporting, handleExportReport, refreshData, } = useUserAnalyticsLogic();
    const isDarkMode = document.documentElement.classList.contains('dark');
    // Compute filtered data from analyticsData
    const filteredLicenseUsage = analyticsData?.licenseUsage || [];
    const filteredDepartmentBreakdown = analyticsData?.departmentBreakdown || [];
    // Chart theme
    const chartTheme = {
        textColor: isDarkMode ? '#f9fafb' : '#1f2937',
        gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    };
    // Color palette
    const COLORS = {
        primary: isDarkMode ? '#60a5fa' : '#3b82f6',
        success: isDarkMode ? '#34d399' : '#10b981',
        warning: isDarkMode ? '#fbbf24' : '#f59e0b',
        danger: isDarkMode ? '#f87171' : '#ef4444',
        purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
        pink: isDarkMode ? '#f472b6' : '#ec4899',
        teal: isDarkMode ? '#2dd4bf' : '#14b8a6',
    };
    const PIE_COLORS = [COLORS.primary, COLORS.success, COLORS.warning, COLORS.purple, COLORS.pink, COLORS.teal, COLORS.danger];
    if (isLoading) {
        return (0,jsx_runtime.jsx)(AnalyticsSkeleton, {});
    }
    if (error) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", "data-cy": "analytics-error", "data-testid": "analytics-error", children: (0,jsx_runtime.jsx)("div", { className: "text-center", children: (0,jsx_runtime.jsx)("p", { className: "text-red-600 dark:text-red-400 text-lg", children: error }) }) }));
    }
    if (!analyticsData) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "No analytics data available" }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "user-analytics-view", "data-testid": "user-analytics-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "User Analytics" }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Calendar, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsxs)("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), className: "w-32 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", "data-cy": "date-range-select", "data-testid": "date-range-select", children: [(0,jsx_runtime.jsx)("option", { value: "7", children: "Last 7 days" }), (0,jsx_runtime.jsx)("option", { value: "30", children: "Last 30 days" }), (0,jsx_runtime.jsx)("option", { value: "90", children: "Last 90 days" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Filter, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsxs)("select", { value: selectedDepartment, onChange: (e) => setSelectedDepartment(e.target.value), className: "w-40 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", "data-cy": "department-filter", "data-testid": "department-filter", children: [(0,jsx_runtime.jsx)("option", { value: "all", children: "All Departments" }), availableDepartments.map(dept => ((0,jsx_runtime.jsx)("option", { value: dept.id, children: dept.name }, dept.id)))] })] }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportReport, variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-excel-btn", "data-testid": "export-excel-btn", children: "Export Excel" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: () => console.log('Export PDF'), variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-pdf-btn", "data-testid": "export-pdf-btn", children: "Export PDF" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0,jsx_runtime.jsx)(StatCard, { title: "Active Users", value: analyticsData.metrics.activeUsers, icon: (0,jsx_runtime.jsx)(lucide_react.UserCheck, { className: "w-6 h-6 text-white" }), color: "bg-green-500", "data-cy": "stat-active-users", "data-testid": "stat-active-users" }), (0,jsx_runtime.jsx)(StatCard, { title: "Inactive Users", value: analyticsData.metrics.inactiveUsers, icon: (0,jsx_runtime.jsx)(lucide_react.UserX, { className: "w-6 h-6 text-white" }), color: "bg-red-500", "data-cy": "stat-inactive-users", "data-testid": "stat-inactive-users" }), (0,jsx_runtime.jsx)(StatCard, { title: "Avg. Login Frequency", value: `${analyticsData.metrics.averageLoginFrequency}/week`, icon: (0,jsx_runtime.jsx)(lucide_react.Users, { className: "w-6 h-6 text-white" }), color: "bg-blue-500", "data-cy": "stat-login-frequency", "data-testid": "stat-login-frequency" }), (0,jsx_runtime.jsx)(StatCard, { title: "Peak Activity Time", value: analyticsData.metrics.peakActivityTime, icon: (0,jsx_runtime.jsx)(lucide_react.Clock, { className: "w-6 h-6 text-white" }), color: "bg-purple-500", "data-cy": "stat-peak-time", "data-testid": "stat-peak-time" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "License Usage" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6.BarChart, { data: filteredLicenseUsage, children: [(0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6.XAxis, { dataKey: "licenseName", stroke: chartTheme.textColor, angle: -30, textAnchor: "end", height: 100 }), (0,jsx_runtime.jsx)(es6.YAxis, { stroke: chartTheme.textColor }), (0,jsx_runtime.jsx)(es6.Tooltip, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6.Legend, {}), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "assigned", stackId: "a", fill: COLORS.primary, name: "Assigned", radius: [0, 0, 0, 0] }), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "available", stackId: "a", fill: COLORS.success, name: "Available", radius: [8, 8, 0, 0] })] }) }), (0,jsx_runtime.jsx)("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-5 gap-4", children: filteredLicenseUsage.map((license, index) => ((0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: license.licenseName }), (0,jsx_runtime.jsx)("div", { className: "relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", children: (0,jsx_runtime.jsx)("div", { className: `absolute top-0 left-0 h-full ${license.utilization >= 90
                                                            ? 'bg-red-500'
                                                            : license.utilization >= 75
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'}`, style: { width: `${license.utilization}%` } }) }), (0,jsx_runtime.jsxs)("p", { className: "text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1", children: [license.utilization, "%"] })] }, index))) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Department Breakdown" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6.PieChart, { children: [(0,jsx_runtime.jsx)(es6.Pie, { data: filteredDepartmentBreakdown, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name}: ${percentage}%`, outerRadius: 100, fill: "#8884d8", dataKey: "value", children: filteredDepartmentBreakdown.map((entry, index) => ((0,jsx_runtime.jsx)(es6.Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6.Tooltip, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Activity Heatmap" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: ["User activity by day and time (last ", dateRange, " days)"] }), (0,jsx_runtime.jsx)(ActivityHeatmap, { data: analyticsData.activityHeatmap })] })] })] })] }));
};
/* harmony default export */ const analytics_UserAnalyticsView = (UserAnalyticsView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTJGLEdBQUcsbUJBQUksVUFBVSxzR0FBc0csbUJBQUksVUFBVSwyQ0FBMkM7QUFDanJKO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRixZQUFZLFVBQVUsb0JBQW9CLE1BQU0sR0FBRyxHQUFHLG9CQUFLLFFBQVEsZ0hBQWdILElBQUksWUFBWSxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsbUJBQUksU0FBUyw0R0FBNEcsR0FBRyxtQkFBSSxDQUFDLHVCQUFtQixJQUFJLHNDQUFzQyxvQkFBSyxDQUFDLFlBQVEsSUFBSSxXQUFXLG1CQUFJLENBQUMsT0FBRyxJQUFJLHFGQUFxRixrQkFBa0IsUUFBUSxLQUFLLElBQUksV0FBVyxzSEFBc0gsbUJBQUksQ0FBQyxRQUFJLElBQUksNkNBQTZDLFVBQVUsTUFBTSxNQUFNLEdBQUcsbUJBQUksQ0FBQyxXQUFPLElBQUksU0FBUyxtQkFBSSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLG9CQUFLLFVBQVUsOEdBQThHLG1CQUFJLFNBQVMsd0dBQXdHLEdBQUcsb0JBQUssUUFBUSxxSUFBcUksR0FBRyxtQkFBSSxvQkFBb0IscUNBQXFDLElBQUksSUFBSSxJQUFJLElBQUk7QUFDbCtDO0FBQ0Esa0VBQWUsaUJBQWlCLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXHJlY2hhcnRzXFxub2RlX21vZHVsZXNcXEByZWR1eGpzXFx0b29sa2l0XFxkaXN0fHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VVc2VyQW5hbHl0aWNzTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYW5hbHl0aWNzL1VzZXJBbmFseXRpY3NWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogQ2FsY3VsYXRlIGxpY2Vuc2UgdXNhZ2UgZnJvbSBMb2dpYyBFbmdpbmUgc3RhdGlzdGljc1xuICogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNvbWUgZnJvbSBsaWNlbnNpbmcgZGlzY292ZXJ5IG1vZHVsZVxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVMaWNlbnNlVXNhZ2Uoc3RhdHMpIHtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgY29uc3QgbWFpbGJveENvdW50ID0gc3RhdHMuTWFpbGJveENvdW50IHx8IDA7XG4gICAgaWYgKHRvdGFsVXNlcnMgPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAvLyBNb2NrIGxpY2Vuc2UgZGlzdHJpYnV0aW9uIGJhc2VkIG9uIHVzZXIgY291bnRzXG4gICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZU5hbWU6ICdPZmZpY2UgMzY1IEUzJyxcbiAgICAgICAgICAgIGFzc2lnbmVkOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjY4KSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMiksXG4gICAgICAgICAgICB0b3RhbDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC44MCksXG4gICAgICAgICAgICB1dGlsaXphdGlvbjogODUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxpY2Vuc2VOYW1lOiAnT2ZmaWNlIDM2NSBFNScsXG4gICAgICAgICAgICBhc3NpZ25lZDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xNyksXG4gICAgICAgICAgICBhdmFpbGFibGU6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMDMpLFxuICAgICAgICAgICAgdG90YWw6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMjApLFxuICAgICAgICAgICAgdXRpbGl6YXRpb246IDg0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlTmFtZTogJ01pY3Jvc29mdCBUZWFtcycsXG4gICAgICAgICAgICBhc3NpZ25lZDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC44OSksXG4gICAgICAgICAgICBhdmFpbGFibGU6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMDcpLFxuICAgICAgICAgICAgdG90YWw6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuOTYpLFxuICAgICAgICAgICAgdXRpbGl6YXRpb246IDkzLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlTmFtZTogJ1Bvd2VyIEJJIFBybycsXG4gICAgICAgICAgICBhc3NpZ25lZDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMSksXG4gICAgICAgICAgICBhdmFpbGFibGU6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMDUpLFxuICAgICAgICAgICAgdG90YWw6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTYpLFxuICAgICAgICAgICAgdXRpbGl6YXRpb246IDcwLFxuICAgICAgICB9LFxuICAgIF07XG59XG4vKipcbiAqIENhbGN1bGF0ZSBkZXBhcnRtZW50IGJyZWFrZG93biBmcm9tIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzXG4gKiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgYWdncmVnYXRlIHVzZXIgZGVwYXJ0bWVudCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZURlcGFydG1lbnRCcmVha2Rvd24oc3RhdHMpIHtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgaWYgKHRvdGFsVXNlcnMgPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAvLyBNb2NrIGRlcGFydG1lbnQgZGlzdHJpYnV0aW9uIC0gaW4gcmVhbGl0eSB0aGlzIHdvdWxkIGNvbWUgZnJvbSBDU1YgZGF0YVxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IFtcbiAgICAgICAgeyBuYW1lOiAnU2FsZXMnLCBwZXJjZW50YWdlOiAxOSB9LFxuICAgICAgICB7IG5hbWU6ICdFbmdpbmVlcmluZycsIHBlcmNlbnRhZ2U6IDI1IH0sXG4gICAgICAgIHsgbmFtZTogJ01hcmtldGluZycsIHBlcmNlbnRhZ2U6IDEyIH0sXG4gICAgICAgIHsgbmFtZTogJ0hSJywgcGVyY2VudGFnZTogNyB9LFxuICAgICAgICB7IG5hbWU6ICdGaW5hbmNlJywgcGVyY2VudGFnZTogMTAgfSxcbiAgICAgICAgeyBuYW1lOiAnT3BlcmF0aW9ucycsIHBlcmNlbnRhZ2U6IDE1IH0sXG4gICAgICAgIHsgbmFtZTogJ1N1cHBvcnQnLCBwZXJjZW50YWdlOiAxMiB9LFxuICAgIF07XG4gICAgcmV0dXJuIGRpc3RyaWJ1dGlvbi5tYXAoZGVwdCA9PiAoe1xuICAgICAgICBuYW1lOiBkZXB0Lm5hbWUsXG4gICAgICAgIHZhbHVlOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAoZGVwdC5wZXJjZW50YWdlIC8gMTAwKSksXG4gICAgICAgIHBlcmNlbnRhZ2U6IGRlcHQucGVyY2VudGFnZSxcbiAgICB9KSk7XG59XG4vKipcbiAqIEdlbmVyYXRlIGFjdGl2aXR5IGhlYXRtYXAgZGF0YVxuICogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNvbWUgZnJvbSBsb2dpbiB0cmFja2luZ1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUFjdGl2aXR5SGVhdG1hcCgpIHtcbiAgICBjb25zdCBkYXlzID0gWydNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5JywgJ1N1bmRheSddO1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICBkYXlzLmZvckVhY2goZGF5ID0+IHtcbiAgICAgICAgZm9yIChsZXQgaG91ciA9IDA7IGhvdXIgPCAyNDsgaG91cisrKSB7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHkgPSAwO1xuICAgICAgICAgICAgLy8gU2ltdWxhdGUgd29yayBob3VycyBhY3Rpdml0eVxuICAgICAgICAgICAgaWYgKGRheSAhPT0gJ1NhdHVyZGF5JyAmJiBkYXkgIT09ICdTdW5kYXknKSB7XG4gICAgICAgICAgICAgICAgaWYgKGhvdXIgPj0gOCAmJiBob3VyIDw9IDE3KSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSArIDUwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChob3VyID49IDYgJiYgaG91ciA8PSAyMCkge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKSArIDEwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLnB1c2goeyBkYXksIGhvdXIsIGFjdGl2aXR5IH0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG59XG4vKipcbiAqIEdldCBtb2NrIGFuYWx5dGljcyBkYXRhIGZvciBmYWxsYmFja1xuICovXG5mdW5jdGlvbiBnZXRNb2NrQW5hbHl0aWNzRGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsaWNlbnNlVXNhZ2U6IFtcbiAgICAgICAgICAgIHsgbGljZW5zZU5hbWU6ICdPZmZpY2UgMzY1IEUzJywgYXNzaWduZWQ6IDg1MDAsIGF2YWlsYWJsZTogMTUwMCwgdG90YWw6IDEwMDAwLCB1dGlsaXphdGlvbjogODUgfSxcbiAgICAgICAgICAgIHsgbGljZW5zZU5hbWU6ICdPZmZpY2UgMzY1IEU1JywgYXNzaWduZWQ6IDIxMDAsIGF2YWlsYWJsZTogNDAwLCB0b3RhbDogMjUwMCwgdXRpbGl6YXRpb246IDg0IH0sXG4gICAgICAgICAgICB7IGxpY2Vuc2VOYW1lOiAnTWljcm9zb2Z0IFRlYW1zJywgYXNzaWduZWQ6IDExMjAwLCBhdmFpbGFibGU6IDgwMCwgdG90YWw6IDEyMDAwLCB1dGlsaXphdGlvbjogOTMgfSxcbiAgICAgICAgICAgIHsgbGljZW5zZU5hbWU6ICdQb3dlciBCSSBQcm8nLCBhc3NpZ25lZDogMTQwMCwgYXZhaWxhYmxlOiA2MDAsIHRvdGFsOiAyMDAwLCB1dGlsaXphdGlvbjogNzAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgZGVwYXJ0bWVudEJyZWFrZG93bjogW1xuICAgICAgICAgICAgeyBuYW1lOiAnU2FsZXMnLCB2YWx1ZTogMjM0MCwgcGVyY2VudGFnZTogMTkgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ0VuZ2luZWVyaW5nJywgdmFsdWU6IDMxMjAsIHBlcmNlbnRhZ2U6IDI1IH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdNYXJrZXRpbmcnLCB2YWx1ZTogMTU2MCwgcGVyY2VudGFnZTogMTIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ0hSJywgdmFsdWU6IDg5MCwgcGVyY2VudGFnZTogNyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnRmluYW5jZScsIHZhbHVlOiAxMjQwLCBwZXJjZW50YWdlOiAxMCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnT3BlcmF0aW9ucycsIHZhbHVlOiAxODcwLCBwZXJjZW50YWdlOiAxNSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnU3VwcG9ydCcsIHZhbHVlOiAxNTI3LCBwZXJjZW50YWdlOiAxMiB9LFxuICAgICAgICBdLFxuICAgICAgICBhY3Rpdml0eUhlYXRtYXA6IGdlbmVyYXRlQWN0aXZpdHlIZWF0bWFwKCksXG4gICAgICAgIG1ldHJpY3M6IHtcbiAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiAxMDIzNCxcbiAgICAgICAgICAgIGluYWN0aXZlVXNlcnM6IDIzMTMsXG4gICAgICAgICAgICBhdmVyYWdlTG9naW5GcmVxdWVuY3k6IDQuNyxcbiAgICAgICAgICAgIHBlYWtBY3Rpdml0eVRpbWU6ICcxMDowMCBBTSAtIDExOjAwIEFNJyxcbiAgICAgICAgfSxcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IHVzZVVzZXJBbmFseXRpY3NMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbYW5hbHl0aWNzRGF0YSwgc2V0QW5hbHl0aWNzRGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZGF0ZVJhbmdlLCBzZXREYXRlUmFuZ2VdID0gdXNlU3RhdGUoJzMwJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkRGVwYXJ0bWVudCwgc2V0U2VsZWN0ZWREZXBhcnRtZW50XSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbaXNFeHBvcnRpbmcsIHNldElzRXhwb3J0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBmZXRjaEFuYWx5dGljc0RhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIC8vIEdldCBzdGF0aXN0aWNzIGZyb20gTG9naWMgRW5naW5lXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkubG9naWNFbmdpbmUuZ2V0U3RhdGlzdGljcygpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhPy5zdGF0aXN0aWNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSByZXN1bHQuZGF0YS5zdGF0aXN0aWNzO1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBsaWNlbnNlIHVzYWdlIGZyb20gdXNlci9tYWlsYm94IGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBsaWNlbnNlVXNhZ2UgPSBjYWxjdWxhdGVMaWNlbnNlVXNhZ2Uoc3RhdHMpO1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBkZXBhcnRtZW50IGJyZWFrZG93biBmcm9tIHVzZXIgZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGFydG1lbnRCcmVha2Rvd24gPSBjYWxjdWxhdGVEZXBhcnRtZW50QnJlYWtkb3duKHN0YXRzKTtcbiAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSBhY3Rpdml0eSBoZWF0bWFwIChyZXF1aXJlcyBsb2dpbiB0cmFja2luZyBub3QgeWV0IGltcGxlbWVudGVkKVxuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2aXR5SGVhdG1hcCA9IGdlbmVyYXRlQWN0aXZpdHlIZWF0bWFwKCk7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHVzZXIgYWN0aXZpdHkgbWV0cmljc1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldHJpY3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVVzZXJzOiBNYXRoLmZsb29yKChzdGF0cy5Vc2VyQ291bnQgfHwgMCkgKiAwLjg1KSwgLy8gRXN0aW1hdGUgODUlIGFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICBpbmFjdGl2ZVVzZXJzOiBNYXRoLmZsb29yKChzdGF0cy5Vc2VyQ291bnQgfHwgMCkgKiAwLjE1KSwgLy8gRXN0aW1hdGUgMTUlIGluYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIGF2ZXJhZ2VMb2dpbkZyZXF1ZW5jeTogNC4yLCAvLyBNb2NrIGRhdGEgLSByZXF1aXJlcyBsb2dpbiB0cmFja2luZ1xuICAgICAgICAgICAgICAgICAgICBwZWFrQWN0aXZpdHlUaW1lOiAnMTA6MDAgQU0gLSAxMTowMCBBTScsIC8vIE1vY2sgZGF0YSAtIHJlcXVpcmVzIGxvZ2luIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmFseXRpY3NSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxpY2Vuc2VVc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgZGVwYXJ0bWVudEJyZWFrZG93bixcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlIZWF0bWFwLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0QW5hbHl0aWNzRGF0YShhbmFseXRpY3NSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVc2VyIGFuYWx5dGljcyBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgLy8gU2V0IG1vY2sgZGF0YSBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgICAgICAgICAgc2V0QW5hbHl0aWNzRGF0YShnZXRNb2NrQW5hbHl0aWNzRGF0YSgpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbZGF0ZVJhbmdlLCBzZWxlY3RlZERlcGFydG1lbnRdKTtcbiAgICAvLyBJbml0aWFsIGxvYWRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaEFuYWx5dGljc0RhdGEoKTtcbiAgICB9LCBbZmV0Y2hBbmFseXRpY3NEYXRhXSk7XG4gICAgLy8gRXhwb3J0IGFuYWx5dGljcyByZXBvcnRcbiAgICBjb25zdCBoYW5kbGVFeHBvcnRSZXBvcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghYW5hbHl0aWNzRGF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNFeHBvcnRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY2FsbCBhbiBleHBvcnQgbW9kdWxlXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXhwb3J0aW5nIGFuYWx5dGljcyByZXBvcnQuLi4nLCBhbmFseXRpY3NEYXRhKTtcbiAgICAgICAgICAgIC8vIE1vY2sgZXhwb3J0IHN1Y2Nlc3NcbiAgICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gYFVzZXJBbmFseXRpY3NfJHtkYXRlUmFuZ2V9ZGF5c18ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS54bHN4YDtcbiAgICAgICAgICAgIGFsZXJ0KGBSZXBvcnQgd291bGQgYmUgZXhwb3J0ZWQgdG86ICR7ZmlsZU5hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdFeHBvcnQgZmFpbGVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBvcnQgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzRXhwb3J0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFthbmFseXRpY3NEYXRhLCBkYXRlUmFuZ2VdKTtcbiAgICAvLyBBdmFpbGFibGUgZGVwYXJ0bWVudHMgZm9yIGZpbHRlclxuICAgIGNvbnN0IGF2YWlsYWJsZURlcGFydG1lbnRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghYW5hbHl0aWNzRGF0YSlcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIGFuYWx5dGljc0RhdGEuZGVwYXJ0bWVudEJyZWFrZG93bi5tYXAoZCA9PiAoeyBpZDogZC5uYW1lLCBuYW1lOiBkLm5hbWUgfSkpO1xuICAgIH0sIFthbmFseXRpY3NEYXRhXSk7XG4gICAgLy8gRmlsdGVyIGRhdGEgYnkgZGVwYXJ0bWVudFxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWFuYWx5dGljc0RhdGEgfHwgc2VsZWN0ZWREZXBhcnRtZW50ID09PSAnYWxsJylcbiAgICAgICAgICAgIHJldHVybiBhbmFseXRpY3NEYXRhO1xuICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgZmlsdGVyIHRoZSBhY3R1YWwgZGF0YVxuICAgICAgICAvLyBGb3Igbm93LCBqdXN0IHJldHVybiBhbGwgZGF0YSBzaW5jZSB3ZSBkb24ndCBoYXZlIGRlcGFydG1lbnQtbGV2ZWwgZGV0YWlsc1xuICAgICAgICByZXR1cm4gYW5hbHl0aWNzRGF0YTtcbiAgICB9LCBbYW5hbHl0aWNzRGF0YSwgc2VsZWN0ZWREZXBhcnRtZW50XSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5hbHl0aWNzRGF0YTogZmlsdGVyZWREYXRhLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBkYXRlUmFuZ2UsXG4gICAgICAgIHNldERhdGVSYW5nZSxcbiAgICAgICAgc2VsZWN0ZWREZXBhcnRtZW50LFxuICAgICAgICBzZXRTZWxlY3RlZERlcGFydG1lbnQsXG4gICAgICAgIGF2YWlsYWJsZURlcGFydG1lbnRzLFxuICAgICAgICBpc0V4cG9ydGluZyxcbiAgICAgICAgaGFuZGxlRXhwb3J0UmVwb3J0LFxuICAgICAgICByZWZyZXNoRGF0YTogZmV0Y2hBbmFseXRpY3NEYXRhLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCYXJDaGFydCwgQmFyLCBQaWVDaGFydCwgUGllLCBDZWxsLCBYQXhpcywgWUF4aXMsIENhcnRlc2lhbkdyaWQsIFRvb2x0aXAsIExlZ2VuZCwgUmVzcG9uc2l2ZUNvbnRhaW5lciwgfSBmcm9tICdyZWNoYXJ0cyc7XG5pbXBvcnQgeyBEb3dubG9hZCwgRmlsZVRleHQsIENhbGVuZGFyLCBGaWx0ZXIsIFVzZXJzLCBVc2VyQ2hlY2ssIFVzZXJYLCBDbG9jayB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VVc2VyQW5hbHl0aWNzTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VVc2VyQW5hbHl0aWNzTG9naWMnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuY29uc3QgU3RhdENhcmQgPSAoeyB0aXRsZSwgdmFsdWUsIGljb24sIGNvbG9yLCAnZGF0YS1jeSc6IGRhdGFDeSB9KSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgc2hhZG93LXNtXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBwLTMgcm91bmRlZC1sZyAke2NvbG9yfWAsIGNoaWxkcmVuOiBpY29uIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogdGl0bGUgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlLnRvTG9jYWxlU3RyaW5nKCkgOiB2YWx1ZSB9KV0gfSldIH0pIH0pKTtcbi8vIExvYWRpbmcgU2tlbGV0b25cbmNvbnN0IEFuYWx5dGljc1NrZWxldG9uID0gKCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBwLTYgc3BhY2UteS02IGFuaW1hdGUtcHVsc2VcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMTAgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkIHctMS8zXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDQpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMjQgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbLi4uQXJyYXkoMyldLm1hcCgoXywgaSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC05NiBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGdcIiB9LCBpKSkpIH0pXSB9KSk7XG4vLyBDdXN0b20gVG9vbHRpcFxuY29uc3QgQ3VzdG9tVG9vbHRpcCA9ICh7IGFjdGl2ZSwgcGF5bG9hZCwgbGFiZWwgfSkgPT4ge1xuICAgIGlmICghYWN0aXZlIHx8ICFwYXlsb2FkIHx8ICFwYXlsb2FkLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtMyByb3VuZGVkLWxnIHNoYWRvdy1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi0yXCIsIGNoaWxkcmVuOiBsYWJlbCB9KSwgcGF5bG9hZC5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgc3R5bGU6IHsgY29sb3I6IGVudHJ5LmNvbG9yIH0sIGNoaWxkcmVuOiBbZW50cnkubmFtZSwgXCI6IFwiXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogdHlwZW9mIGVudHJ5LnZhbHVlID09PSAnbnVtYmVyJyA/IGVudHJ5LnZhbHVlLnRvTG9jYWxlU3RyaW5nKCkgOiBlbnRyeS52YWx1ZSB9KV0gfSwgaW5kZXgpKSldIH0pKTtcbn07XG4vLyBBY3Rpdml0eSBIZWF0bWFwIENvbXBvbmVudFxuY29uc3QgQWN0aXZpdHlIZWF0bWFwID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgY29uc3QgZGF5cyA9IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXTtcbiAgICBjb25zdCBob3VycyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDI0IH0sIChfLCBpKSA9PiBpKTtcbiAgICBjb25zdCBnZXRBY3Rpdml0eUNvbG9yID0gKGFjdGl2aXR5KSA9PiB7XG4gICAgICAgIGlmIChhY3Rpdml0eSA+PSA4MClcbiAgICAgICAgICAgIHJldHVybiAnYmctZ3JlZW4tNjAwJztcbiAgICAgICAgaWYgKGFjdGl2aXR5ID49IDYwKVxuICAgICAgICAgICAgcmV0dXJuICdiZy1ncmVlbi01MDAnO1xuICAgICAgICBpZiAoYWN0aXZpdHkgPj0gNDApXG4gICAgICAgICAgICByZXR1cm4gJ2JnLXllbGxvdy01MDAnO1xuICAgICAgICBpZiAoYWN0aXZpdHkgPj0gMjApXG4gICAgICAgICAgICByZXR1cm4gJ2JnLW9yYW5nZS01MDAnO1xuICAgICAgICByZXR1cm4gJ2JnLWdyYXktMzAwIGRhcms6YmctZ3JheS02MDAnO1xuICAgIH07XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm92ZXJmbG93LXgtYXV0b1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaW5saW5lLWJsb2NrIG1pbi13LWZ1bGxcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGdhcC0xIHB0LTZcIiwgY2hpbGRyZW46IGRheXMubWFwKGRheSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTQgZmxleCBpdGVtcy1jZW50ZXIgdGV4dC14cyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCB3LTIwXCIsIGNoaWxkcmVuOiBkYXkuc2xpY2UoMCwgMykgfSwgZGF5KSkpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0xIG1iLTFcIiwgY2hpbGRyZW46IGhvdXJzLm1hcChob3VyID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCB0ZXh0LXhzIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBob3VyICUgNiA9PT0gMCA/IGhvdXIgOiAnJyB9LCBob3VyKSkpIH0pLCBkYXlzLm1hcChkYXkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMVwiLCBjaGlsZHJlbjogaG91cnMubWFwKGhvdXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSAoZGF0YSA/PyBbXSkuZmluZChkID0+IGQuZGF5ID09PSBkYXkgJiYgZC5ob3VyID09PSBob3VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3Rpdml0eSA9IGl0ZW0/LmFjdGl2aXR5IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgdy00IGgtNCByb3VuZGVkLXNtICR7Z2V0QWN0aXZpdHlDb2xvcihhY3Rpdml0eSl9IHRyYW5zaXRpb24tYWxsIGhvdmVyOnNjYWxlLTEyNSBjdXJzb3ItcG9pbnRlcmAsIHRpdGxlOiBgJHtkYXl9ICR7aG91cn06MDAgLSBBY3Rpdml0eTogJHthY3Rpdml0eX0lYCB9LCBob3VyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSB9LCBkYXkpKSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCB0ZXh0LXhzIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJMZXNzXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYmctZ3JheS0zMDAgZGFyazpiZy1ncmF5LTYwMCByb3VuZGVkLXNtXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBiZy1vcmFuZ2UtNTAwIHJvdW5kZWQtc21cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJnLXllbGxvdy01MDAgcm91bmRlZC1zbVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYmctZ3JlZW4tNTAwIHJvdW5kZWQtc21cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJnLWdyZWVuLTYwMCByb3VuZGVkLXNtXCIgfSldIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIk1vcmVcIiB9KV0gfSldIH0pIH0pKTtcbn07XG5jb25zdCBVc2VyQW5hbHl0aWNzVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGFuYWx5dGljc0RhdGEsIGlzTG9hZGluZywgZXJyb3IsIGRhdGVSYW5nZSwgc2V0RGF0ZVJhbmdlLCBzZWxlY3RlZERlcGFydG1lbnQsIHNldFNlbGVjdGVkRGVwYXJ0bWVudCwgYXZhaWxhYmxlRGVwYXJ0bWVudHMsIGlzRXhwb3J0aW5nLCBoYW5kbGVFeHBvcnRSZXBvcnQsIHJlZnJlc2hEYXRhLCB9ID0gdXNlVXNlckFuYWx5dGljc0xvZ2ljKCk7XG4gICAgY29uc3QgaXNEYXJrTW9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcbiAgICAvLyBDb21wdXRlIGZpbHRlcmVkIGRhdGEgZnJvbSBhbmFseXRpY3NEYXRhXG4gICAgY29uc3QgZmlsdGVyZWRMaWNlbnNlVXNhZ2UgPSBhbmFseXRpY3NEYXRhPy5saWNlbnNlVXNhZ2UgfHwgW107XG4gICAgY29uc3QgZmlsdGVyZWREZXBhcnRtZW50QnJlYWtkb3duID0gYW5hbHl0aWNzRGF0YT8uZGVwYXJ0bWVudEJyZWFrZG93biB8fCBbXTtcbiAgICAvLyBDaGFydCB0aGVtZVxuICAgIGNvbnN0IGNoYXJ0VGhlbWUgPSB7XG4gICAgICAgIHRleHRDb2xvcjogaXNEYXJrTW9kZSA/ICcjZjlmYWZiJyA6ICcjMWYyOTM3JyxcbiAgICAgICAgZ3JpZENvbG9yOiBpc0RhcmtNb2RlID8gJyMzNzQxNTEnIDogJyNlNWU3ZWInLFxuICAgIH07XG4gICAgLy8gQ29sb3IgcGFsZXR0ZVxuICAgIGNvbnN0IENPTE9SUyA9IHtcbiAgICAgICAgcHJpbWFyeTogaXNEYXJrTW9kZSA/ICcjNjBhNWZhJyA6ICcjM2I4MmY2JyxcbiAgICAgICAgc3VjY2VzczogaXNEYXJrTW9kZSA/ICcjMzRkMzk5JyA6ICcjMTBiOTgxJyxcbiAgICAgICAgd2FybmluZzogaXNEYXJrTW9kZSA/ICcjZmJiZjI0JyA6ICcjZjU5ZTBiJyxcbiAgICAgICAgZGFuZ2VyOiBpc0RhcmtNb2RlID8gJyNmODcxNzEnIDogJyNlZjQ0NDQnLFxuICAgICAgICBwdXJwbGU6IGlzRGFya01vZGUgPyAnI2E3OGJmYScgOiAnIzhiNWNmNicsXG4gICAgICAgIHBpbms6IGlzRGFya01vZGUgPyAnI2Y0NzJiNicgOiAnI2VjNDg5OScsXG4gICAgICAgIHRlYWw6IGlzRGFya01vZGUgPyAnIzJkZDRiZicgOiAnIzE0YjhhNicsXG4gICAgfTtcbiAgICBjb25zdCBQSUVfQ09MT1JTID0gW0NPTE9SUy5wcmltYXJ5LCBDT0xPUlMuc3VjY2VzcywgQ09MT1JTLndhcm5pbmcsIENPTE9SUy5wdXJwbGUsIENPTE9SUy5waW5rLCBDT0xPUlMudGVhbCwgQ09MT1JTLmRhbmdlcl07XG4gICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICByZXR1cm4gX2pzeChBbmFseXRpY3NTa2VsZXRvbiwge30pO1xuICAgIH1cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBcImRhdGEtY3lcIjogXCJhbmFseXRpY3MtZXJyb3JcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImFuYWx5dGljcy1lcnJvclwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIHRleHQtbGdcIiwgY2hpbGRyZW46IGVycm9yIH0pIH0pIH0pKTtcbiAgICB9XG4gICAgaWYgKCFhbmFseXRpY3NEYXRhKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk5vIGFuYWx5dGljcyBkYXRhIGF2YWlsYWJsZVwiIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwidXNlci1hbmFseXRpY3Mtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwidXNlci1hbmFseXRpY3Mtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBcIlVzZXIgQW5hbHl0aWNzXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENhbGVuZGFyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JheS01MDBcIiB9KSwgX2pzeHMoXCJzZWxlY3RcIiwgeyB2YWx1ZTogZGF0ZVJhbmdlLCBvbkNoYW5nZTogKGUpID0+IHNldERhdGVSYW5nZShlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJ3LTMyIHB4LTMgcHktMS41IGJvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgcm91bmRlZC1tZCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwIHRleHQtc21cIiwgXCJkYXRhLWN5XCI6IFwiZGF0ZS1yYW5nZS1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRhdGUtcmFuZ2Utc2VsZWN0XCIsIGNoaWxkcmVuOiBbX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIjdcIiwgY2hpbGRyZW46IFwiTGFzdCA3IGRheXNcIiB9KSwgX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIjMwXCIsIGNoaWxkcmVuOiBcIkxhc3QgMzAgZGF5c1wiIH0pLCBfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiOTBcIiwgY2hpbGRyZW46IFwiTGFzdCA5MCBkYXlzXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEZpbHRlciwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyYXktNTAwXCIgfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IHNlbGVjdGVkRGVwYXJ0bWVudCwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWxlY3RlZERlcGFydG1lbnQoZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwidy00MCBweC0zIHB5LTEuNSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LXNtXCIsIFwiZGF0YS1jeVwiOiBcImRlcGFydG1lbnQtZmlsdGVyXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkZXBhcnRtZW50LWZpbHRlclwiLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJhbGxcIiwgY2hpbGRyZW46IFwiQWxsIERlcGFydG1lbnRzXCIgfSksIGF2YWlsYWJsZURlcGFydG1lbnRzLm1hcChkZXB0ID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IGRlcHQuaWQsIGNoaWxkcmVuOiBkZXB0Lm5hbWUgfSwgZGVwdC5pZCkpKV0gfSldIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRSZXBvcnQsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1leGNlbC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IEV4Y2VsXCIgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6ICgpID0+IGNvbnNvbGUubG9nKCdFeHBvcnQgUERGJyksIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1wZGYtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtcGRmLWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgUERGXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gcC02IHNwYWNlLXktNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIkFjdGl2ZSBVc2Vyc1wiLCB2YWx1ZTogYW5hbHl0aWNzRGF0YS5tZXRyaWNzLmFjdGl2ZVVzZXJzLCBpY29uOiBfanN4KFVzZXJDaGVjaywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLWdyZWVuLTUwMFwiLCBcImRhdGEtY3lcIjogXCJzdGF0LWFjdGl2ZS11c2Vyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1hY3RpdmUtdXNlcnNcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJJbmFjdGl2ZSBVc2Vyc1wiLCB2YWx1ZTogYW5hbHl0aWNzRGF0YS5tZXRyaWNzLmluYWN0aXZlVXNlcnMsIGljb246IF9qc3goVXNlclgsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1yZWQtNTAwXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtaW5hY3RpdmUtdXNlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtaW5hY3RpdmUtdXNlcnNcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJBdmcuIExvZ2luIEZyZXF1ZW5jeVwiLCB2YWx1ZTogYCR7YW5hbHl0aWNzRGF0YS5tZXRyaWNzLmF2ZXJhZ2VMb2dpbkZyZXF1ZW5jeX0vd2Vla2AsIGljb246IF9qc3goVXNlcnMsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1ibHVlLTUwMFwiLCBcImRhdGEtY3lcIjogXCJzdGF0LWxvZ2luLWZyZXF1ZW5jeVwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1sb2dpbi1mcmVxdWVuY3lcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJQZWFrIEFjdGl2aXR5IFRpbWVcIiwgdmFsdWU6IGFuYWx5dGljc0RhdGEubWV0cmljcy5wZWFrQWN0aXZpdHlUaW1lLCBpY29uOiBfanN4KENsb2NrLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctcHVycGxlLTUwMFwiLCBcImRhdGEtY3lcIjogXCJzdGF0LXBlYWstdGltZVwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1wZWFrLXRpbWVcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTYgbGc6Y29sLXNwYW4tMlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJMaWNlbnNlIFVzYWdlXCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMzAwLCBjaGlsZHJlbjogX2pzeHMoQmFyQ2hhcnQsIHsgZGF0YTogZmlsdGVyZWRMaWNlbnNlVXNhZ2UsIGNoaWxkcmVuOiBbX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLmdyaWRDb2xvciB9KSwgX2pzeChYQXhpcywgeyBkYXRhS2V5OiBcImxpY2Vuc2VOYW1lXCIsIHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IsIGFuZ2xlOiAtMzAsIHRleHRBbmNob3I6IFwiZW5kXCIsIGhlaWdodDogMTAwIH0pLCBfanN4KFlBeGlzLCB7IHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IgfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KSwgX2pzeChMZWdlbmQsIHt9KSwgX2pzeChCYXIsIHsgZGF0YUtleTogXCJhc3NpZ25lZFwiLCBzdGFja0lkOiBcImFcIiwgZmlsbDogQ09MT1JTLnByaW1hcnksIG5hbWU6IFwiQXNzaWduZWRcIiwgcmFkaXVzOiBbMCwgMCwgMCwgMF0gfSksIF9qc3goQmFyLCB7IGRhdGFLZXk6IFwiYXZhaWxhYmxlXCIsIHN0YWNrSWQ6IFwiYVwiLCBmaWxsOiBDT0xPUlMuc3VjY2VzcywgbmFtZTogXCJBdmFpbGFibGVcIiwgcmFkaXVzOiBbOCwgOCwgMCwgMF0gfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNSBnYXAtNFwiLCBjaGlsZHJlbjogZmlsdGVyZWRMaWNlbnNlVXNhZ2UubWFwKChsaWNlbnNlLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi0xXCIsIGNoaWxkcmVuOiBsaWNlbnNlLmxpY2Vuc2VOYW1lIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlIHctZnVsbCBoLTIgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgYWJzb2x1dGUgdG9wLTAgbGVmdC0wIGgtZnVsbCAke2xpY2Vuc2UudXRpbGl6YXRpb24gPj0gOTBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXJlZC01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGxpY2Vuc2UudXRpbGl6YXRpb24gPj0gNzVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy15ZWxsb3ctNTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLWdyZWVuLTUwMCd9YCwgc3R5bGU6IHsgd2lkdGg6IGAke2xpY2Vuc2UudXRpbGl6YXRpb259JWAgfSB9KSB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtdC0xXCIsIGNoaWxkcmVuOiBbbGljZW5zZS51dGlsaXphdGlvbiwgXCIlXCJdIH0pXSB9LCBpbmRleCkpKSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJEZXBhcnRtZW50IEJyZWFrZG93blwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKFBpZUNoYXJ0LCB7IGNoaWxkcmVuOiBbX2pzeChQaWUsIHsgZGF0YTogZmlsdGVyZWREZXBhcnRtZW50QnJlYWtkb3duLCBjeDogXCI1MCVcIiwgY3k6IFwiNTAlXCIsIGxhYmVsTGluZTogZmFsc2UsIGxhYmVsOiAoeyBuYW1lLCBwZXJjZW50YWdlIH0pID0+IGAke25hbWV9OiAke3BlcmNlbnRhZ2V9JWAsIG91dGVyUmFkaXVzOiAxMDAsIGZpbGw6IFwiIzg4ODRkOFwiLCBkYXRhS2V5OiBcInZhbHVlXCIsIGNoaWxkcmVuOiBmaWx0ZXJlZERlcGFydG1lbnRCcmVha2Rvd24ubWFwKChlbnRyeSwgaW5kZXgpID0+IChfanN4KENlbGwsIHsgZmlsbDogUElFX0NPTE9SU1tpbmRleCAlIFBJRV9DT0xPUlMubGVuZ3RoXSB9LCBgY2VsbC0ke2luZGV4fWApKSkgfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KV0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiQWN0aXZpdHkgSGVhdG1hcFwiIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi00XCIsIGNoaWxkcmVuOiBbXCJVc2VyIGFjdGl2aXR5IGJ5IGRheSBhbmQgdGltZSAobGFzdCBcIiwgZGF0ZVJhbmdlLCBcIiBkYXlzKVwiXSB9KSwgX2pzeChBY3Rpdml0eUhlYXRtYXAsIHsgZGF0YTogYW5hbHl0aWNzRGF0YS5hY3Rpdml0eUhlYXRtYXAgfSldIH0pXSB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBVc2VyQW5hbHl0aWNzVmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==