(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2268],{

/***/ 68827:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 71926:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 99377:
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "user-analytics-view", "data-testid": "user-analytics-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "User Analytics" }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Calendar */.VvS, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsxs)("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), className: "w-32 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", "data-cy": "date-range-select", "data-testid": "date-range-select", children: [(0,jsx_runtime.jsx)("option", { value: "7", children: "Last 7 days" }), (0,jsx_runtime.jsx)("option", { value: "30", children: "Last 30 days" }), (0,jsx_runtime.jsx)("option", { value: "90", children: "Last 90 days" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsxs)("select", { value: selectedDepartment, onChange: (e) => setSelectedDepartment(e.target.value), className: "w-40 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm", "data-cy": "department-filter", "data-testid": "department-filter", children: [(0,jsx_runtime.jsx)("option", { value: "all", children: "All Departments" }), availableDepartments.map(dept => ((0,jsx_runtime.jsx)("option", { value: dept.id, children: dept.name }, dept.id)))] })] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExportReport, variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-excel-btn", "data-testid": "export-excel-btn", children: "Export Excel" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: () => console.log('Export PDF'), variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-pdf-btn", "data-testid": "export-pdf-btn", children: "Export PDF" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0,jsx_runtime.jsx)(StatCard, { title: "Active Users", value: analyticsData.metrics.activeUsers, icon: (0,jsx_runtime.jsx)(lucide_react/* UserCheck */.MWd, { className: "w-6 h-6 text-white" }), color: "bg-green-500", "data-cy": "stat-active-users", "data-testid": "stat-active-users" }), (0,jsx_runtime.jsx)(StatCard, { title: "Inactive Users", value: analyticsData.metrics.inactiveUsers, icon: (0,jsx_runtime.jsx)(lucide_react/* UserX */.sut, { className: "w-6 h-6 text-white" }), color: "bg-red-500", "data-cy": "stat-inactive-users", "data-testid": "stat-inactive-users" }), (0,jsx_runtime.jsx)(StatCard, { title: "Avg. Login Frequency", value: `${analyticsData.metrics.averageLoginFrequency}/week`, icon: (0,jsx_runtime.jsx)(lucide_react/* Users */.zWC, { className: "w-6 h-6 text-white" }), color: "bg-blue-500", "data-cy": "stat-login-frequency", "data-testid": "stat-login-frequency" }), (0,jsx_runtime.jsx)(StatCard, { title: "Peak Activity Time", value: analyticsData.metrics.peakActivityTime, icon: (0,jsx_runtime.jsx)(lucide_react/* Clock */.zD7, { className: "w-6 h-6 text-white" }), color: "bg-purple-500", "data-cy": "stat-peak-time", "data-testid": "stat-peak-time" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "License Usage" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* BarChart */.Es, { data: filteredLicenseUsage, children: [(0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { dataKey: "licenseName", stroke: chartTheme.textColor, angle: -30, textAnchor: "end", height: 100 }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { stroke: chartTheme.textColor }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6/* Legend */.s$, {}), (0,jsx_runtime.jsx)(es6/* Bar */.yP, { dataKey: "assigned", stackId: "a", fill: COLORS.primary, name: "Assigned", radius: [0, 0, 0, 0] }), (0,jsx_runtime.jsx)(es6/* Bar */.yP, { dataKey: "available", stackId: "a", fill: COLORS.success, name: "Available", radius: [8, 8, 0, 0] })] }) }), (0,jsx_runtime.jsx)("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-5 gap-4", children: filteredLicenseUsage.map((license, index) => ((0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: license.licenseName }), (0,jsx_runtime.jsx)("div", { className: "relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", children: (0,jsx_runtime.jsx)("div", { className: `absolute top-0 left-0 h-full ${license.utilization >= 90
                                                            ? 'bg-red-500'
                                                            : license.utilization >= 75
                                                                ? 'bg-yellow-500'
                                                                : 'bg-green-500'}`, style: { width: `${license.utilization}%` } }) }), (0,jsx_runtime.jsxs)("p", { className: "text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1", children: [license.utilization, "%"] })] }, index))) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Department Breakdown" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* PieChart */.rW, { children: [(0,jsx_runtime.jsx)(es6/* Pie */.Fq, { data: filteredDepartmentBreakdown, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name}: ${percentage}%`, outerRadius: 100, fill: "#8884d8", dataKey: "value", children: filteredDepartmentBreakdown.map((entry, index) => ((0,jsx_runtime.jsx)(es6/* Cell */.fh, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Activity Heatmap" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mb-4", children: ["User activity by day and time (last ", dateRange, " days)"] }), (0,jsx_runtime.jsx)(ActivityHeatmap, { data: analyticsData.activityHeatmap })] })] })] })] }));
};
/* harmony default export */ const analytics_UserAnalyticsView = (UserAnalyticsView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RixHQUFHLG1CQUFJLFVBQVUsc0dBQXNHLG1CQUFJLFVBQVUsMkNBQTJDO0FBQ2pySjtBQUNBO0FBQ0E7QUFDQSxpRkFBaUYsWUFBWSxVQUFVLG9CQUFvQixNQUFNLEdBQUcsR0FBRyxvQkFBSyxRQUFRLGdIQUFnSCxJQUFJLFlBQVksSUFBSSxHQUFHLG9CQUFLLFVBQVUsOEdBQThHLG1CQUFJLFNBQVMsNEdBQTRHLEdBQUcsbUJBQUksQ0FBQywrQkFBbUIsSUFBSSxzQ0FBc0Msb0JBQUssQ0FBQyxvQkFBUSxJQUFJLFdBQVcsbUJBQUksQ0FBQyxlQUFHLElBQUkscUZBQXFGLGtCQUFrQixRQUFRLEtBQUssSUFBSSxXQUFXLHNIQUFzSCxtQkFBSSxDQUFDLGdCQUFJLElBQUksNkNBQTZDLFVBQVUsTUFBTSxNQUFNLEdBQUcsbUJBQUksQ0FBQyxtQkFBTyxJQUFJLFNBQVMsbUJBQUksa0JBQWtCLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxvQkFBSyxVQUFVLDhHQUE4RyxtQkFBSSxTQUFTLHdHQUF3RyxHQUFHLG9CQUFLLFFBQVEscUlBQXFJLEdBQUcsbUJBQUksb0JBQW9CLHFDQUFxQyxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ2wrQztBQUNBLGtFQUFlLGlCQUFpQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlVXNlckFuYWx5dGljc0xvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FuYWx5dGljcy9Vc2VyQW5hbHl0aWNzVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIENhbGN1bGF0ZSBsaWNlbnNlIHVzYWdlIGZyb20gTG9naWMgRW5naW5lIHN0YXRpc3RpY3NcbiAqIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjb21lIGZyb20gbGljZW5zaW5nIGRpc2NvdmVyeSBtb2R1bGVcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlTGljZW5zZVVzYWdlKHN0YXRzKSB7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHN0YXRzLlVzZXJDb3VudCB8fCAwO1xuICAgIGNvbnN0IG1haWxib3hDb3VudCA9IHN0YXRzLk1haWxib3hDb3VudCB8fCAwO1xuICAgIGlmICh0b3RhbFVzZXJzID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgLy8gTW9jayBsaWNlbnNlIGRpc3RyaWJ1dGlvbiBiYXNlZCBvbiB1c2VyIGNvdW50c1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxpY2Vuc2VOYW1lOiAnT2ZmaWNlIDM2NSBFMycsXG4gICAgICAgICAgICBhc3NpZ25lZDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC42OCksXG4gICAgICAgICAgICBhdmFpbGFibGU6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTIpLFxuICAgICAgICAgICAgdG90YWw6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuODApLFxuICAgICAgICAgICAgdXRpbGl6YXRpb246IDg1LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlTmFtZTogJ09mZmljZSAzNjUgRTUnLFxuICAgICAgICAgICAgYXNzaWduZWQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTcpLFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjAzKSxcbiAgICAgICAgICAgIHRvdGFsOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjIwKSxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uOiA4NCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZU5hbWU6ICdNaWNyb3NvZnQgVGVhbXMnLFxuICAgICAgICAgICAgYXNzaWduZWQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuODkpLFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjA3KSxcbiAgICAgICAgICAgIHRvdGFsOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjk2KSxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uOiA5MyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZU5hbWU6ICdQb3dlciBCSSBQcm8nLFxuICAgICAgICAgICAgYXNzaWduZWQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTEpLFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjA1KSxcbiAgICAgICAgICAgIHRvdGFsOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjE2KSxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uOiA3MCxcbiAgICAgICAgfSxcbiAgICBdO1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgZGVwYXJ0bWVudCBicmVha2Rvd24gZnJvbSBMb2dpYyBFbmdpbmUgc3RhdGlzdGljc1xuICogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGFnZ3JlZ2F0ZSB1c2VyIGRlcGFydG1lbnQgZGF0YVxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVEZXBhcnRtZW50QnJlYWtkb3duKHN0YXRzKSB7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHN0YXRzLlVzZXJDb3VudCB8fCAwO1xuICAgIGlmICh0b3RhbFVzZXJzID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgLy8gTW9jayBkZXBhcnRtZW50IGRpc3RyaWJ1dGlvbiAtIGluIHJlYWxpdHkgdGhpcyB3b3VsZCBjb21lIGZyb20gQ1NWIGRhdGFcbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBbXG4gICAgICAgIHsgbmFtZTogJ1NhbGVzJywgcGVyY2VudGFnZTogMTkgfSxcbiAgICAgICAgeyBuYW1lOiAnRW5naW5lZXJpbmcnLCBwZXJjZW50YWdlOiAyNSB9LFxuICAgICAgICB7IG5hbWU6ICdNYXJrZXRpbmcnLCBwZXJjZW50YWdlOiAxMiB9LFxuICAgICAgICB7IG5hbWU6ICdIUicsIHBlcmNlbnRhZ2U6IDcgfSxcbiAgICAgICAgeyBuYW1lOiAnRmluYW5jZScsIHBlcmNlbnRhZ2U6IDEwIH0sXG4gICAgICAgIHsgbmFtZTogJ09wZXJhdGlvbnMnLCBwZXJjZW50YWdlOiAxNSB9LFxuICAgICAgICB7IG5hbWU6ICdTdXBwb3J0JywgcGVyY2VudGFnZTogMTIgfSxcbiAgICBdO1xuICAgIHJldHVybiBkaXN0cmlidXRpb24ubWFwKGRlcHQgPT4gKHtcbiAgICAgICAgbmFtZTogZGVwdC5uYW1lLFxuICAgICAgICB2YWx1ZTogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogKGRlcHQucGVyY2VudGFnZSAvIDEwMCkpLFxuICAgICAgICBwZXJjZW50YWdlOiBkZXB0LnBlcmNlbnRhZ2UsXG4gICAgfSkpO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSBhY3Rpdml0eSBoZWF0bWFwIGRhdGFcbiAqIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjb21lIGZyb20gbG9naW4gdHJhY2tpbmdcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVBY3Rpdml0eUhlYXRtYXAoKSB7XG4gICAgY29uc3QgZGF5cyA9IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXTtcbiAgICBjb25zdCBkYXRhID0gW107XG4gICAgZGF5cy5mb3JFYWNoKGRheSA9PiB7XG4gICAgICAgIGZvciAobGV0IGhvdXIgPSAwOyBob3VyIDwgMjQ7IGhvdXIrKykge1xuICAgICAgICAgICAgbGV0IGFjdGl2aXR5ID0gMDtcbiAgICAgICAgICAgIC8vIFNpbXVsYXRlIHdvcmsgaG91cnMgYWN0aXZpdHlcbiAgICAgICAgICAgIGlmIChkYXkgIT09ICdTYXR1cmRheScgJiYgZGF5ICE9PSAnU3VuZGF5Jykge1xuICAgICAgICAgICAgICAgIGlmIChob3VyID49IDggJiYgaG91ciA8PSAxNykge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyA1MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaG91ciA+PSA2ICYmIGhvdXIgPD0gMjApIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA1MCkgKyAxMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YS5wdXNoKHsgZGF5LCBob3VyLCBhY3Rpdml0eSB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xufVxuLyoqXG4gKiBHZXQgbW9jayBhbmFseXRpY3MgZGF0YSBmb3IgZmFsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZ2V0TW9ja0FuYWx5dGljc0RhdGEoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGljZW5zZVVzYWdlOiBbXG4gICAgICAgICAgICB7IGxpY2Vuc2VOYW1lOiAnT2ZmaWNlIDM2NSBFMycsIGFzc2lnbmVkOiA4NTAwLCBhdmFpbGFibGU6IDE1MDAsIHRvdGFsOiAxMDAwMCwgdXRpbGl6YXRpb246IDg1IH0sXG4gICAgICAgICAgICB7IGxpY2Vuc2VOYW1lOiAnT2ZmaWNlIDM2NSBFNScsIGFzc2lnbmVkOiAyMTAwLCBhdmFpbGFibGU6IDQwMCwgdG90YWw6IDI1MDAsIHV0aWxpemF0aW9uOiA4NCB9LFxuICAgICAgICAgICAgeyBsaWNlbnNlTmFtZTogJ01pY3Jvc29mdCBUZWFtcycsIGFzc2lnbmVkOiAxMTIwMCwgYXZhaWxhYmxlOiA4MDAsIHRvdGFsOiAxMjAwMCwgdXRpbGl6YXRpb246IDkzIH0sXG4gICAgICAgICAgICB7IGxpY2Vuc2VOYW1lOiAnUG93ZXIgQkkgUHJvJywgYXNzaWduZWQ6IDE0MDAsIGF2YWlsYWJsZTogNjAwLCB0b3RhbDogMjAwMCwgdXRpbGl6YXRpb246IDcwIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGRlcGFydG1lbnRCcmVha2Rvd246IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ1NhbGVzJywgdmFsdWU6IDIzNDAsIHBlcmNlbnRhZ2U6IDE5IH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdFbmdpbmVlcmluZycsIHZhbHVlOiAzMTIwLCBwZXJjZW50YWdlOiAyNSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnTWFya2V0aW5nJywgdmFsdWU6IDE1NjAsIHBlcmNlbnRhZ2U6IDEyIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdIUicsIHZhbHVlOiA4OTAsIHBlcmNlbnRhZ2U6IDcgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ0ZpbmFuY2UnLCB2YWx1ZTogMTI0MCwgcGVyY2VudGFnZTogMTAgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ09wZXJhdGlvbnMnLCB2YWx1ZTogMTg3MCwgcGVyY2VudGFnZTogMTUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1N1cHBvcnQnLCB2YWx1ZTogMTUyNywgcGVyY2VudGFnZTogMTIgfSxcbiAgICAgICAgXSxcbiAgICAgICAgYWN0aXZpdHlIZWF0bWFwOiBnZW5lcmF0ZUFjdGl2aXR5SGVhdG1hcCgpLFxuICAgICAgICBtZXRyaWNzOiB7XG4gICAgICAgICAgICBhY3RpdmVVc2VyczogMTAyMzQsXG4gICAgICAgICAgICBpbmFjdGl2ZVVzZXJzOiAyMzEzLFxuICAgICAgICAgICAgYXZlcmFnZUxvZ2luRnJlcXVlbmN5OiA0LjcsXG4gICAgICAgICAgICBwZWFrQWN0aXZpdHlUaW1lOiAnMTA6MDAgQU0gLSAxMTowMCBBTScsXG4gICAgICAgIH0sXG4gICAgfTtcbn1cbmV4cG9ydCBjb25zdCB1c2VVc2VyQW5hbHl0aWNzTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2FuYWx5dGljc0RhdGEsIHNldEFuYWx5dGljc0RhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2RhdGVSYW5nZSwgc2V0RGF0ZVJhbmdlXSA9IHVzZVN0YXRlKCczMCcpO1xuICAgIGNvbnN0IFtzZWxlY3RlZERlcGFydG1lbnQsIHNldFNlbGVjdGVkRGVwYXJ0bWVudF0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgW2lzRXhwb3J0aW5nLCBzZXRJc0V4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgZmV0Y2hBbmFseXRpY3NEYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBHZXQgc3RhdGlzdGljcyBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2ljRW5naW5lLmdldFN0YXRpc3RpY3MoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YT8uc3RhdGlzdGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gcmVzdWx0LmRhdGEuc3RhdGlzdGljcztcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgbGljZW5zZSB1c2FnZSBmcm9tIHVzZXIvbWFpbGJveCBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3QgbGljZW5zZVVzYWdlID0gY2FsY3VsYXRlTGljZW5zZVVzYWdlKHN0YXRzKTtcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgZGVwYXJ0bWVudCBicmVha2Rvd24gZnJvbSB1c2VyIGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBkZXBhcnRtZW50QnJlYWtkb3duID0gY2FsY3VsYXRlRGVwYXJ0bWVudEJyZWFrZG93bihzdGF0cyk7XG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgYWN0aXZpdHkgaGVhdG1hcCAocmVxdWlyZXMgbG9naW4gdHJhY2tpbmcgbm90IHlldCBpbXBsZW1lbnRlZClcbiAgICAgICAgICAgICAgICBjb25zdCBhY3Rpdml0eUhlYXRtYXAgPSBnZW5lcmF0ZUFjdGl2aXR5SGVhdG1hcCgpO1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB1c2VyIGFjdGl2aXR5IG1ldHJpY3NcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRyaWNzID0ge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVVc2VyczogTWF0aC5mbG9vcigoc3RhdHMuVXNlckNvdW50IHx8IDApICogMC44NSksIC8vIEVzdGltYXRlIDg1JSBhY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgaW5hY3RpdmVVc2VyczogTWF0aC5mbG9vcigoc3RhdHMuVXNlckNvdW50IHx8IDApICogMC4xNSksIC8vIEVzdGltYXRlIDE1JSBpbmFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICBhdmVyYWdlTG9naW5GcmVxdWVuY3k6IDQuMiwgLy8gTW9jayBkYXRhIC0gcmVxdWlyZXMgbG9naW4gdHJhY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgcGVha0FjdGl2aXR5VGltZTogJzEwOjAwIEFNIC0gMTE6MDAgQU0nLCAvLyBNb2NrIGRhdGEgLSByZXF1aXJlcyBsb2dpbiB0cmFja2luZ1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgYW5hbHl0aWNzUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBsaWNlbnNlVXNhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGRlcGFydG1lbnRCcmVha2Rvd24sXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5SGVhdG1hcCxcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljcyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldEFuYWx5dGljc0RhdGEoYW5hbHl0aWNzUmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBmZXRjaCBMb2dpYyBFbmdpbmUgc3RhdGlzdGljcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVXNlciBhbmFseXRpY3MgZmV0Y2ggZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIC8vIFNldCBtb2NrIGRhdGEgZm9yIGRldmVsb3BtZW50L3Rlc3RpbmdcbiAgICAgICAgICAgIHNldEFuYWx5dGljc0RhdGEoZ2V0TW9ja0FuYWx5dGljc0RhdGEoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2RhdGVSYW5nZSwgc2VsZWN0ZWREZXBhcnRtZW50XSk7XG4gICAgLy8gSW5pdGlhbCBsb2FkXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZmV0Y2hBbmFseXRpY3NEYXRhKCk7XG4gICAgfSwgW2ZldGNoQW5hbHl0aWNzRGF0YV0pO1xuICAgIC8vIEV4cG9ydCBhbmFseXRpY3MgcmVwb3J0XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0UmVwb3J0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWFuYWx5dGljc0RhdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzRXhwb3J0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNhbGwgYW4gZXhwb3J0IG1vZHVsZVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0V4cG9ydGluZyBhbmFseXRpY3MgcmVwb3J0Li4uJywgYW5hbHl0aWNzRGF0YSk7XG4gICAgICAgICAgICAvLyBNb2NrIGV4cG9ydCBzdWNjZXNzXG4gICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGBVc2VyQW5hbHl0aWNzXyR7ZGF0ZVJhbmdlfWRheXNfJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0ueGxzeGA7XG4gICAgICAgICAgICBhbGVydChgUmVwb3J0IHdvdWxkIGJlIGV4cG9ydGVkIHRvOiAke2ZpbGVOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRXhwb3J0IGZhaWxlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwb3J0IGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0V4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbYW5hbHl0aWNzRGF0YSwgZGF0ZVJhbmdlXSk7XG4gICAgLy8gQXZhaWxhYmxlIGRlcGFydG1lbnRzIGZvciBmaWx0ZXJcbiAgICBjb25zdCBhdmFpbGFibGVEZXBhcnRtZW50cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWFuYWx5dGljc0RhdGEpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBhbmFseXRpY3NEYXRhLmRlcGFydG1lbnRCcmVha2Rvd24ubWFwKGQgPT4gKHsgaWQ6IGQubmFtZSwgbmFtZTogZC5uYW1lIH0pKTtcbiAgICB9LCBbYW5hbHl0aWNzRGF0YV0pO1xuICAgIC8vIEZpbHRlciBkYXRhIGJ5IGRlcGFydG1lbnRcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFhbmFseXRpY3NEYXRhIHx8IHNlbGVjdGVkRGVwYXJ0bWVudCA9PT0gJ2FsbCcpXG4gICAgICAgICAgICByZXR1cm4gYW5hbHl0aWNzRGF0YTtcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGZpbHRlciB0aGUgYWN0dWFsIGRhdGFcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCByZXR1cm4gYWxsIGRhdGEgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBkZXBhcnRtZW50LWxldmVsIGRldGFpbHNcbiAgICAgICAgcmV0dXJuIGFuYWx5dGljc0RhdGE7XG4gICAgfSwgW2FuYWx5dGljc0RhdGEsIHNlbGVjdGVkRGVwYXJ0bWVudF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGFuYWx5dGljc0RhdGE6IGZpbHRlcmVkRGF0YSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgZGF0ZVJhbmdlLFxuICAgICAgICBzZXREYXRlUmFuZ2UsXG4gICAgICAgIHNlbGVjdGVkRGVwYXJ0bWVudCxcbiAgICAgICAgc2V0U2VsZWN0ZWREZXBhcnRtZW50LFxuICAgICAgICBhdmFpbGFibGVEZXBhcnRtZW50cyxcbiAgICAgICAgaXNFeHBvcnRpbmcsXG4gICAgICAgIGhhbmRsZUV4cG9ydFJlcG9ydCxcbiAgICAgICAgcmVmcmVzaERhdGE6IGZldGNoQW5hbHl0aWNzRGF0YSxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQmFyQ2hhcnQsIEJhciwgUGllQ2hhcnQsIFBpZSwgQ2VsbCwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBMZWdlbmQsIFJlc3BvbnNpdmVDb250YWluZXIsIH0gZnJvbSAncmVjaGFydHMnO1xuaW1wb3J0IHsgRG93bmxvYWQsIEZpbGVUZXh0LCBDYWxlbmRhciwgRmlsdGVyLCBVc2VycywgVXNlckNoZWNrLCBVc2VyWCwgQ2xvY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlVXNlckFuYWx5dGljc0xvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlVXNlckFuYWx5dGljc0xvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmNvbnN0IFN0YXRDYXJkID0gKHsgdGl0bGUsIHZhbHVlLCBpY29uLCBjb2xvciwgJ2RhdGEtY3knOiBkYXRhQ3kgfSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC02IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHNoYWRvdy1zbVwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgcC0zIHJvdW5kZWQtbGcgJHtjb2xvcn1gLCBjaGlsZHJlbjogaWNvbiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHRpdGxlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZS50b0xvY2FsZVN0cmluZygpIDogdmFsdWUgfSldIH0pXSB9KSB9KSk7XG4vLyBMb2FkaW5nIFNrZWxldG9uXG5jb25zdCBBbmFseXRpY3NTa2VsZXRvbiA9ICgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgcC02IHNwYWNlLXktNiBhbmltYXRlLXB1bHNlXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTEwIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZCB3LTEvM1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFsuLi5BcnJheSg0KV0ubWFwKChfLCBpKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTI0IGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZ1wiIH0sIGkpKSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDMpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtOTYgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KV0gfSkpO1xuLy8gQ3VzdG9tIFRvb2x0aXBcbmNvbnN0IEN1c3RvbVRvb2x0aXAgPSAoeyBhY3RpdmUsIHBheWxvYWQsIGxhYmVsIH0pID0+IHtcbiAgICBpZiAoIWFjdGl2ZSB8fCAhcGF5bG9hZCB8fCAhcGF5bG9hZC5sZW5ndGgpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTMgcm91bmRlZC1sZyBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItMlwiLCBjaGlsZHJlbjogbGFiZWwgfSksIHBheWxvYWQubWFwKChlbnRyeSwgaW5kZXgpID0+IChfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IHN0eWxlOiB7IGNvbG9yOiBlbnRyeS5jb2xvciB9LCBjaGlsZHJlbjogW2VudHJ5Lm5hbWUsIFwiOiBcIl0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGRcIiwgY2hpbGRyZW46IHR5cGVvZiBlbnRyeS52YWx1ZSA9PT0gJ251bWJlcicgPyBlbnRyeS52YWx1ZS50b0xvY2FsZVN0cmluZygpIDogZW50cnkudmFsdWUgfSldIH0sIGluZGV4KSkpXSB9KSk7XG59O1xuLy8gQWN0aXZpdHkgSGVhdG1hcCBDb21wb25lbnRcbmNvbnN0IEFjdGl2aXR5SGVhdG1hcCA9ICh7IGRhdGEgfSkgPT4ge1xuICAgIGNvbnN0IGRheXMgPSBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknLCAnU3VuZGF5J107XG4gICAgY29uc3QgaG91cnMgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAyNCB9LCAoXywgaSkgPT4gaSk7XG4gICAgY29uc3QgZ2V0QWN0aXZpdHlDb2xvciA9IChhY3Rpdml0eSkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZpdHkgPj0gODApXG4gICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTYwMCc7XG4gICAgICAgIGlmIChhY3Rpdml0eSA+PSA2MClcbiAgICAgICAgICAgIHJldHVybiAnYmctZ3JlZW4tNTAwJztcbiAgICAgICAgaWYgKGFjdGl2aXR5ID49IDQwKVxuICAgICAgICAgICAgcmV0dXJuICdiZy15ZWxsb3ctNTAwJztcbiAgICAgICAgaWYgKGFjdGl2aXR5ID49IDIwKVxuICAgICAgICAgICAgcmV0dXJuICdiZy1vcmFuZ2UtNTAwJztcbiAgICAgICAgcmV0dXJuICdiZy1ncmF5LTMwMCBkYXJrOmJnLWdyYXktNjAwJztcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJvdmVyZmxvdy14LWF1dG9cIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1ibG9jayBtaW4tdy1mdWxsXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBnYXAtMSBwdC02XCIsIGNoaWxkcmVuOiBkYXlzLm1hcChkYXkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC00IGZsZXggaXRlbXMtY2VudGVyIHRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgdy0yMFwiLCBjaGlsZHJlbjogZGF5LnNsaWNlKDAsIDMpIH0sIGRheSkpKSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMSBtYi0xXCIsIGNoaWxkcmVuOiBob3Vycy5tYXAoaG91ciA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgdGV4dC14cyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCB0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogaG91ciAlIDYgPT09IDAgPyBob3VyIDogJycgfSwgaG91cikpKSB9KSwgZGF5cy5tYXAoZGF5ID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTFcIiwgY2hpbGRyZW46IGhvdXJzLm1hcChob3VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gKGRhdGEgPz8gW10pLmZpbmQoZCA9PiBkLmRheSA9PT0gZGF5ICYmIGQuaG91ciA9PT0gaG91cik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZpdHkgPSBpdGVtPy5hY3Rpdml0eSB8fCAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYHctNCBoLTQgcm91bmRlZC1zbSAke2dldEFjdGl2aXR5Q29sb3IoYWN0aXZpdHkpfSB0cmFuc2l0aW9uLWFsbCBob3ZlcjpzY2FsZS0xMjUgY3Vyc29yLXBvaW50ZXJgLCB0aXRsZTogYCR7ZGF5fSAke2hvdXJ9OjAwIC0gQWN0aXZpdHk6ICR7YWN0aXZpdHl9JWAgfSwgaG91cikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgfSwgZGF5KSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgdGV4dC14cyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTGVzc1wiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJnLWdyYXktMzAwIGRhcms6YmctZ3JheS02MDAgcm91bmRlZC1zbVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYmctb3JhbmdlLTUwMCByb3VuZGVkLXNtXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBiZy15ZWxsb3ctNTAwIHJvdW5kZWQtc21cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJnLWdyZWVuLTUwMCByb3VuZGVkLXNtXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBiZy1ncmVlbi02MDAgcm91bmRlZC1zbVwiIH0pXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJNb3JlXCIgfSldIH0pXSB9KSB9KSk7XG59O1xuY29uc3QgVXNlckFuYWx5dGljc1ZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBhbmFseXRpY3NEYXRhLCBpc0xvYWRpbmcsIGVycm9yLCBkYXRlUmFuZ2UsIHNldERhdGVSYW5nZSwgc2VsZWN0ZWREZXBhcnRtZW50LCBzZXRTZWxlY3RlZERlcGFydG1lbnQsIGF2YWlsYWJsZURlcGFydG1lbnRzLCBpc0V4cG9ydGluZywgaGFuZGxlRXhwb3J0UmVwb3J0LCByZWZyZXNoRGF0YSwgfSA9IHVzZVVzZXJBbmFseXRpY3NMb2dpYygpO1xuICAgIGNvbnN0IGlzRGFya01vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJyk7XG4gICAgLy8gQ29tcHV0ZSBmaWx0ZXJlZCBkYXRhIGZyb20gYW5hbHl0aWNzRGF0YVxuICAgIGNvbnN0IGZpbHRlcmVkTGljZW5zZVVzYWdlID0gYW5hbHl0aWNzRGF0YT8ubGljZW5zZVVzYWdlIHx8IFtdO1xuICAgIGNvbnN0IGZpbHRlcmVkRGVwYXJ0bWVudEJyZWFrZG93biA9IGFuYWx5dGljc0RhdGE/LmRlcGFydG1lbnRCcmVha2Rvd24gfHwgW107XG4gICAgLy8gQ2hhcnQgdGhlbWVcbiAgICBjb25zdCBjaGFydFRoZW1lID0ge1xuICAgICAgICB0ZXh0Q29sb3I6IGlzRGFya01vZGUgPyAnI2Y5ZmFmYicgOiAnIzFmMjkzNycsXG4gICAgICAgIGdyaWRDb2xvcjogaXNEYXJrTW9kZSA/ICcjMzc0MTUxJyA6ICcjZTVlN2ViJyxcbiAgICB9O1xuICAgIC8vIENvbG9yIHBhbGV0dGVcbiAgICBjb25zdCBDT0xPUlMgPSB7XG4gICAgICAgIHByaW1hcnk6IGlzRGFya01vZGUgPyAnIzYwYTVmYScgOiAnIzNiODJmNicsXG4gICAgICAgIHN1Y2Nlc3M6IGlzRGFya01vZGUgPyAnIzM0ZDM5OScgOiAnIzEwYjk4MScsXG4gICAgICAgIHdhcm5pbmc6IGlzRGFya01vZGUgPyAnI2ZiYmYyNCcgOiAnI2Y1OWUwYicsXG4gICAgICAgIGRhbmdlcjogaXNEYXJrTW9kZSA/ICcjZjg3MTcxJyA6ICcjZWY0NDQ0JyxcbiAgICAgICAgcHVycGxlOiBpc0RhcmtNb2RlID8gJyNhNzhiZmEnIDogJyM4YjVjZjYnLFxuICAgICAgICBwaW5rOiBpc0RhcmtNb2RlID8gJyNmNDcyYjYnIDogJyNlYzQ4OTknLFxuICAgICAgICB0ZWFsOiBpc0RhcmtNb2RlID8gJyMyZGQ0YmYnIDogJyMxNGI4YTYnLFxuICAgIH07XG4gICAgY29uc3QgUElFX0NPTE9SUyA9IFtDT0xPUlMucHJpbWFyeSwgQ09MT1JTLnN1Y2Nlc3MsIENPTE9SUy53YXJuaW5nLCBDT0xPUlMucHVycGxlLCBDT0xPUlMucGluaywgQ09MT1JTLnRlYWwsIENPTE9SUy5kYW5nZXJdO1xuICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIF9qc3goQW5hbHl0aWNzU2tlbGV0b24sIHt9KTtcbiAgICB9XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgXCJkYXRhLWN5XCI6IFwiYW5hbHl0aWNzLWVycm9yXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJhbmFseXRpY3MtZXJyb3JcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCB0ZXh0LWxnXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSB9KSk7XG4gICAgfVxuICAgIGlmICghYW5hbHl0aWNzRGF0YSkge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJObyBhbmFseXRpY3MgZGF0YSBhdmFpbGFibGVcIiB9KSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcInVzZXItYW5hbHl0aWNzLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInVzZXItYW5hbHl0aWNzLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJVc2VyIEFuYWx5dGljc1wiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDYWxlbmRhciwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyYXktNTAwXCIgfSksIF9qc3hzKFwic2VsZWN0XCIsIHsgdmFsdWU6IGRhdGVSYW5nZSwgb25DaGFuZ2U6IChlKSA9PiBzZXREYXRlUmFuZ2UoZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwidy0zMiBweC0zIHB5LTEuNSBib3JkZXIgYm9yZGVyLWdyYXktMzAwIGRhcms6Ym9yZGVyLWdyYXktNjAwIHJvdW5kZWQtbWQgYmctd2hpdGUgZGFyazpiZy1ncmF5LTcwMCB0ZXh0LXNtXCIsIFwiZGF0YS1jeVwiOiBcImRhdGUtcmFuZ2Utc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkYXRlLXJhbmdlLXNlbGVjdFwiLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCI3XCIsIGNoaWxkcmVuOiBcIkxhc3QgNyBkYXlzXCIgfSksIF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCIzMFwiLCBjaGlsZHJlbjogXCJMYXN0IDMwIGRheXNcIiB9KSwgX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcIjkwXCIsIGNoaWxkcmVuOiBcIkxhc3QgOTAgZGF5c1wiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChGaWx0ZXIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmF5LTUwMFwiIH0pLCBfanN4cyhcInNlbGVjdFwiLCB7IHZhbHVlOiBzZWxlY3RlZERlcGFydG1lbnQsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VsZWN0ZWREZXBhcnRtZW50KGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInctNDAgcHgtMyBweS0xLjUgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgdGV4dC1zbVwiLCBcImRhdGEtY3lcIjogXCJkZXBhcnRtZW50LWZpbHRlclwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGVwYXJ0bWVudC1maWx0ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiYWxsXCIsIGNoaWxkcmVuOiBcIkFsbCBEZXBhcnRtZW50c1wiIH0pLCBhdmFpbGFibGVEZXBhcnRtZW50cy5tYXAoZGVwdCA9PiAoX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBkZXB0LmlkLCBjaGlsZHJlbjogZGVwdC5uYW1lIH0sIGRlcHQuaWQpKSldIH0pXSB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0UmVwb3J0LCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWwtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtZXhjZWwtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBFeGNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiAoKSA9PiBjb25zb2xlLmxvZygnRXhwb3J0IFBERicpLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJleHBvcnQtcGRmLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LXBkZi1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IFBERlwiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1hdXRvIHAtNiBzcGFjZS15LTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJBY3RpdmUgVXNlcnNcIiwgdmFsdWU6IGFuYWx5dGljc0RhdGEubWV0cmljcy5hY3RpdmVVc2VycywgaWNvbjogX2pzeChVc2VyQ2hlY2ssIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1ncmVlbi01MDBcIiwgXCJkYXRhLWN5XCI6IFwic3RhdC1hY3RpdmUtdXNlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtYWN0aXZlLXVzZXJzXCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiSW5hY3RpdmUgVXNlcnNcIiwgdmFsdWU6IGFuYWx5dGljc0RhdGEubWV0cmljcy5pbmFjdGl2ZVVzZXJzLCBpY29uOiBfanN4KFVzZXJYLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctcmVkLTUwMFwiLCBcImRhdGEtY3lcIjogXCJzdGF0LWluYWN0aXZlLXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LWluYWN0aXZlLXVzZXJzXCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiQXZnLiBMb2dpbiBGcmVxdWVuY3lcIiwgdmFsdWU6IGAke2FuYWx5dGljc0RhdGEubWV0cmljcy5hdmVyYWdlTG9naW5GcmVxdWVuY3l9L3dlZWtgLCBpY29uOiBfanN4KFVzZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctYmx1ZS01MDBcIiwgXCJkYXRhLWN5XCI6IFwic3RhdC1sb2dpbi1mcmVxdWVuY3lcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtbG9naW4tZnJlcXVlbmN5XCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiUGVhayBBY3Rpdml0eSBUaW1lXCIsIHZhbHVlOiBhbmFseXRpY3NEYXRhLm1ldHJpY3MucGVha0FjdGl2aXR5VGltZSwgaWNvbjogX2pzeChDbG9jaywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLXB1cnBsZS01MDBcIiwgXCJkYXRhLWN5XCI6IFwic3RhdC1wZWFrLXRpbWVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtcGVhay10aW1lXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02IGxnOmNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiTGljZW5zZSBVc2FnZVwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKEJhckNoYXJ0LCB7IGRhdGE6IGZpbHRlcmVkTGljZW5zZVVzYWdlLCBjaGlsZHJlbjogW19qc3goQ2FydGVzaWFuR3JpZCwgeyBzdHJva2VEYXNoYXJyYXk6IFwiMyAzXCIsIHN0cm9rZTogY2hhcnRUaGVtZS5ncmlkQ29sb3IgfSksIF9qc3goWEF4aXMsIHsgZGF0YUtleTogXCJsaWNlbnNlTmFtZVwiLCBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yLCBhbmdsZTogLTMwLCB0ZXh0QW5jaG9yOiBcImVuZFwiLCBoZWlnaHQ6IDEwMCB9KSwgX2pzeChZQXhpcywgeyBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yIH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudDogX2pzeChDdXN0b21Ub29sdGlwLCB7fSkgfSksIF9qc3goTGVnZW5kLCB7fSksIF9qc3goQmFyLCB7IGRhdGFLZXk6IFwiYXNzaWduZWRcIiwgc3RhY2tJZDogXCJhXCIsIGZpbGw6IENPTE9SUy5wcmltYXJ5LCBuYW1lOiBcIkFzc2lnbmVkXCIsIHJhZGl1czogWzAsIDAsIDAsIDBdIH0pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcImF2YWlsYWJsZVwiLCBzdGFja0lkOiBcImFcIiwgZmlsbDogQ09MT1JTLnN1Y2Nlc3MsIG5hbWU6IFwiQXZhaWxhYmxlXCIsIHJhZGl1czogWzgsIDgsIDAsIDBdIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IGdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTUgZ2FwLTRcIiwgY2hpbGRyZW46IGZpbHRlcmVkTGljZW5zZVVzYWdlLm1hcCgobGljZW5zZSwgaW5kZXgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWItMVwiLCBjaGlsZHJlbjogbGljZW5zZS5saWNlbnNlTmFtZSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB3LWZ1bGwgaC0yIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYGFic29sdXRlIHRvcC0wIGxlZnQtMCBoLWZ1bGwgJHtsaWNlbnNlLnV0aWxpemF0aW9uID49IDkwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1yZWQtNTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBsaWNlbnNlLnV0aWxpemF0aW9uID49IDc1XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmcteWVsbG93LTUwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdiZy1ncmVlbi01MDAnfWAsIHN0eWxlOiB7IHdpZHRoOiBgJHtsaWNlbnNlLnV0aWxpemF0aW9ufSVgIH0gfSkgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbXQtMVwiLCBjaGlsZHJlbjogW2xpY2Vuc2UudXRpbGl6YXRpb24sIFwiJVwiXSB9KV0gfSwgaW5kZXgpKSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiRGVwYXJ0bWVudCBCcmVha2Rvd25cIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAzMDAsIGNoaWxkcmVuOiBfanN4cyhQaWVDaGFydCwgeyBjaGlsZHJlbjogW19qc3goUGllLCB7IGRhdGE6IGZpbHRlcmVkRGVwYXJ0bWVudEJyZWFrZG93biwgY3g6IFwiNTAlXCIsIGN5OiBcIjUwJVwiLCBsYWJlbExpbmU6IGZhbHNlLCBsYWJlbDogKHsgbmFtZSwgcGVyY2VudGFnZSB9KSA9PiBgJHtuYW1lfTogJHtwZXJjZW50YWdlfSVgLCBvdXRlclJhZGl1czogMTAwLCBmaWxsOiBcIiM4ODg0ZDhcIiwgZGF0YUtleTogXCJ2YWx1ZVwiLCBjaGlsZHJlbjogZmlsdGVyZWREZXBhcnRtZW50QnJlYWtkb3duLm1hcCgoZW50cnksIGluZGV4KSA9PiAoX2pzeChDZWxsLCB7IGZpbGw6IFBJRV9DT0xPUlNbaW5kZXggJSBQSUVfQ09MT1JTLmxlbmd0aF0gfSwgYGNlbGwtJHtpbmRleH1gKSkpIH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudDogX2pzeChDdXN0b21Ub29sdGlwLCB7fSkgfSldIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIkFjdGl2aXR5IEhlYXRtYXBcIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWItNFwiLCBjaGlsZHJlbjogW1wiVXNlciBhY3Rpdml0eSBieSBkYXkgYW5kIHRpbWUgKGxhc3QgXCIsIGRhdGVSYW5nZSwgXCIgZGF5cylcIl0gfSksIF9qc3goQWN0aXZpdHlIZWF0bWFwLCB7IGRhdGE6IGFuYWx5dGljc0RhdGEuYWN0aXZpdHlIZWF0bWFwIH0pXSB9KV0gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgVXNlckFuYWx5dGljc1ZpZXc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=