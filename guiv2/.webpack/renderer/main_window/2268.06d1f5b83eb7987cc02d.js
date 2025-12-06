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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RixHQUFHLG1CQUFJLFVBQVUsc0dBQXNHLG1CQUFJLFVBQVUsMkNBQTJDO0FBQ2pySjtBQUNBO0FBQ0E7QUFDQSxpRkFBaUYsWUFBWSxVQUFVLG9CQUFvQixNQUFNLEdBQUcsR0FBRyxvQkFBSyxRQUFRLGdIQUFnSCxJQUFJLFlBQVksSUFBSSxHQUFHLG9CQUFLLFVBQVUsOEdBQThHLG1CQUFJLFNBQVMsNEdBQTRHLEdBQUcsbUJBQUksQ0FBQywrQkFBbUIsSUFBSSxzQ0FBc0Msb0JBQUssQ0FBQyxvQkFBUSxJQUFJLFdBQVcsbUJBQUksQ0FBQyxlQUFHLElBQUkscUZBQXFGLGtCQUFrQixRQUFRLEtBQUssSUFBSSxXQUFXLHNIQUFzSCxtQkFBSSxDQUFDLGdCQUFJLElBQUksNkNBQTZDLFVBQVUsTUFBTSxNQUFNLEdBQUcsbUJBQUksQ0FBQyxtQkFBTyxJQUFJLFNBQVMsbUJBQUksa0JBQWtCLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxvQkFBSyxVQUFVLDhHQUE4RyxtQkFBSSxTQUFTLHdHQUF3RyxHQUFHLG9CQUFLLFFBQVEscUlBQXFJLEdBQUcsbUJBQUksb0JBQW9CLHFDQUFxQyxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ2wrQztBQUNBLGtFQUFlLGlCQUFpQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xccmVjaGFydHNcXG5vZGVfbW9kdWxlc1xcQHJlZHV4anNcXHRvb2xraXRcXGRpc3R8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVVzZXJBbmFseXRpY3NMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hbmFseXRpY3MvVXNlckFuYWx5dGljc1ZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBDYWxjdWxhdGUgbGljZW5zZSB1c2FnZSBmcm9tIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzXG4gKiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY29tZSBmcm9tIGxpY2Vuc2luZyBkaXNjb3ZlcnkgbW9kdWxlXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUxpY2Vuc2VVc2FnZShzdGF0cykge1xuICAgIGNvbnN0IHRvdGFsVXNlcnMgPSBzdGF0cy5Vc2VyQ291bnQgfHwgMDtcbiAgICBjb25zdCBtYWlsYm94Q291bnQgPSBzdGF0cy5NYWlsYm94Q291bnQgfHwgMDtcbiAgICBpZiAodG90YWxVc2VycyA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIC8vIE1vY2sgbGljZW5zZSBkaXN0cmlidXRpb24gYmFzZWQgb24gdXNlciBjb3VudHNcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBsaWNlbnNlTmFtZTogJ09mZmljZSAzNjUgRTMnLFxuICAgICAgICAgICAgYXNzaWduZWQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuNjgpLFxuICAgICAgICAgICAgYXZhaWxhYmxlOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjEyKSxcbiAgICAgICAgICAgIHRvdGFsOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjgwKSxcbiAgICAgICAgICAgIHV0aWxpemF0aW9uOiA4NSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbGljZW5zZU5hbWU6ICdPZmZpY2UgMzY1IEU1JyxcbiAgICAgICAgICAgIGFzc2lnbmVkOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjE3KSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4wMyksXG4gICAgICAgICAgICB0b3RhbDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4yMCksXG4gICAgICAgICAgICB1dGlsaXphdGlvbjogODQsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxpY2Vuc2VOYW1lOiAnTWljcm9zb2Z0IFRlYW1zJyxcbiAgICAgICAgICAgIGFzc2lnbmVkOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjg5KSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4wNyksXG4gICAgICAgICAgICB0b3RhbDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC45NiksXG4gICAgICAgICAgICB1dGlsaXphdGlvbjogOTMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGxpY2Vuc2VOYW1lOiAnUG93ZXIgQkkgUHJvJyxcbiAgICAgICAgICAgIGFzc2lnbmVkOiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjExKSxcbiAgICAgICAgICAgIGF2YWlsYWJsZTogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4wNSksXG4gICAgICAgICAgICB0b3RhbDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xNiksXG4gICAgICAgICAgICB1dGlsaXphdGlvbjogNzAsXG4gICAgICAgIH0sXG4gICAgXTtcbn1cbi8qKlxuICogQ2FsY3VsYXRlIGRlcGFydG1lbnQgYnJlYWtkb3duIGZyb20gTG9naWMgRW5naW5lIHN0YXRpc3RpY3NcbiAqIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBhZ2dyZWdhdGUgdXNlciBkZXBhcnRtZW50IGRhdGFcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlRGVwYXJ0bWVudEJyZWFrZG93bihzdGF0cykge1xuICAgIGNvbnN0IHRvdGFsVXNlcnMgPSBzdGF0cy5Vc2VyQ291bnQgfHwgMDtcbiAgICBpZiAodG90YWxVc2VycyA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIC8vIE1vY2sgZGVwYXJ0bWVudCBkaXN0cmlidXRpb24gLSBpbiByZWFsaXR5IHRoaXMgd291bGQgY29tZSBmcm9tIENTViBkYXRhXG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gW1xuICAgICAgICB7IG5hbWU6ICdTYWxlcycsIHBlcmNlbnRhZ2U6IDE5IH0sXG4gICAgICAgIHsgbmFtZTogJ0VuZ2luZWVyaW5nJywgcGVyY2VudGFnZTogMjUgfSxcbiAgICAgICAgeyBuYW1lOiAnTWFya2V0aW5nJywgcGVyY2VudGFnZTogMTIgfSxcbiAgICAgICAgeyBuYW1lOiAnSFInLCBwZXJjZW50YWdlOiA3IH0sXG4gICAgICAgIHsgbmFtZTogJ0ZpbmFuY2UnLCBwZXJjZW50YWdlOiAxMCB9LFxuICAgICAgICB7IG5hbWU6ICdPcGVyYXRpb25zJywgcGVyY2VudGFnZTogMTUgfSxcbiAgICAgICAgeyBuYW1lOiAnU3VwcG9ydCcsIHBlcmNlbnRhZ2U6IDEyIH0sXG4gICAgXTtcbiAgICByZXR1cm4gZGlzdHJpYnV0aW9uLm1hcChkZXB0ID0+ICh7XG4gICAgICAgIG5hbWU6IGRlcHQubmFtZSxcbiAgICAgICAgdmFsdWU6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIChkZXB0LnBlcmNlbnRhZ2UgLyAxMDApKSxcbiAgICAgICAgcGVyY2VudGFnZTogZGVwdC5wZXJjZW50YWdlLFxuICAgIH0pKTtcbn1cbi8qKlxuICogR2VuZXJhdGUgYWN0aXZpdHkgaGVhdG1hcCBkYXRhXG4gKiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY29tZSBmcm9tIGxvZ2luIHRyYWNraW5nXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQWN0aXZpdHlIZWF0bWFwKCkge1xuICAgIGNvbnN0IGRheXMgPSBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknLCAnU3VuZGF5J107XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIGRheXMuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICBmb3IgKGxldCBob3VyID0gMDsgaG91ciA8IDI0OyBob3VyKyspIHtcbiAgICAgICAgICAgIGxldCBhY3Rpdml0eSA9IDA7XG4gICAgICAgICAgICAvLyBTaW11bGF0ZSB3b3JrIGhvdXJzIGFjdGl2aXR5XG4gICAgICAgICAgICBpZiAoZGF5ICE9PSAnU2F0dXJkYXknICYmIGRheSAhPT0gJ1N1bmRheScpIHtcbiAgICAgICAgICAgICAgICBpZiAoaG91ciA+PSA4ICYmIGhvdXIgPD0gMTcpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgNTA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhvdXIgPj0gNiAmJiBob3VyIDw9IDIwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApICsgMTA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEucHVzaCh7IGRheSwgaG91ciwgYWN0aXZpdHkgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbi8qKlxuICogR2V0IG1vY2sgYW5hbHl0aWNzIGRhdGEgZm9yIGZhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGdldE1vY2tBbmFseXRpY3NEYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxpY2Vuc2VVc2FnZTogW1xuICAgICAgICAgICAgeyBsaWNlbnNlTmFtZTogJ09mZmljZSAzNjUgRTMnLCBhc3NpZ25lZDogODUwMCwgYXZhaWxhYmxlOiAxNTAwLCB0b3RhbDogMTAwMDAsIHV0aWxpemF0aW9uOiA4NSB9LFxuICAgICAgICAgICAgeyBsaWNlbnNlTmFtZTogJ09mZmljZSAzNjUgRTUnLCBhc3NpZ25lZDogMjEwMCwgYXZhaWxhYmxlOiA0MDAsIHRvdGFsOiAyNTAwLCB1dGlsaXphdGlvbjogODQgfSxcbiAgICAgICAgICAgIHsgbGljZW5zZU5hbWU6ICdNaWNyb3NvZnQgVGVhbXMnLCBhc3NpZ25lZDogMTEyMDAsIGF2YWlsYWJsZTogODAwLCB0b3RhbDogMTIwMDAsIHV0aWxpemF0aW9uOiA5MyB9LFxuICAgICAgICAgICAgeyBsaWNlbnNlTmFtZTogJ1Bvd2VyIEJJIFBybycsIGFzc2lnbmVkOiAxNDAwLCBhdmFpbGFibGU6IDYwMCwgdG90YWw6IDIwMDAsIHV0aWxpemF0aW9uOiA3MCB9LFxuICAgICAgICBdLFxuICAgICAgICBkZXBhcnRtZW50QnJlYWtkb3duOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdTYWxlcycsIHZhbHVlOiAyMzQwLCBwZXJjZW50YWdlOiAxOSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnRW5naW5lZXJpbmcnLCB2YWx1ZTogMzEyMCwgcGVyY2VudGFnZTogMjUgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ01hcmtldGluZycsIHZhbHVlOiAxNTYwLCBwZXJjZW50YWdlOiAxMiB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnSFInLCB2YWx1ZTogODkwLCBwZXJjZW50YWdlOiA3IH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdGaW5hbmNlJywgdmFsdWU6IDEyNDAsIHBlcmNlbnRhZ2U6IDEwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdPcGVyYXRpb25zJywgdmFsdWU6IDE4NzAsIHBlcmNlbnRhZ2U6IDE1IH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdTdXBwb3J0JywgdmFsdWU6IDE1MjcsIHBlcmNlbnRhZ2U6IDEyIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGFjdGl2aXR5SGVhdG1hcDogZ2VuZXJhdGVBY3Rpdml0eUhlYXRtYXAoKSxcbiAgICAgICAgbWV0cmljczoge1xuICAgICAgICAgICAgYWN0aXZlVXNlcnM6IDEwMjM0LFxuICAgICAgICAgICAgaW5hY3RpdmVVc2VyczogMjMxMyxcbiAgICAgICAgICAgIGF2ZXJhZ2VMb2dpbkZyZXF1ZW5jeTogNC43LFxuICAgICAgICAgICAgcGVha0FjdGl2aXR5VGltZTogJzEwOjAwIEFNIC0gMTE6MDAgQU0nLFxuICAgICAgICB9LFxuICAgIH07XG59XG5leHBvcnQgY29uc3QgdXNlVXNlckFuYWx5dGljc0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFthbmFseXRpY3NEYXRhLCBzZXRBbmFseXRpY3NEYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtkYXRlUmFuZ2UsIHNldERhdGVSYW5nZV0gPSB1c2VTdGF0ZSgnMzAnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWREZXBhcnRtZW50LCBzZXRTZWxlY3RlZERlcGFydG1lbnRdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IFtpc0V4cG9ydGluZywgc2V0SXNFeHBvcnRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IGZldGNoQW5hbHl0aWNzRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgLy8gR2V0IHN0YXRpc3RpY3MgZnJvbSBMb2dpYyBFbmdpbmVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5sb2dpY0VuZ2luZS5nZXRTdGF0aXN0aWNzKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGE/LnN0YXRpc3RpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IHJlc3VsdC5kYXRhLnN0YXRpc3RpY3M7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGxpY2Vuc2UgdXNhZ2UgZnJvbSB1c2VyL21haWxib3ggZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpY2Vuc2VVc2FnZSA9IGNhbGN1bGF0ZUxpY2Vuc2VVc2FnZShzdGF0cyk7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGRlcGFydG1lbnQgYnJlYWtkb3duIGZyb20gdXNlciBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3QgZGVwYXJ0bWVudEJyZWFrZG93biA9IGNhbGN1bGF0ZURlcGFydG1lbnRCcmVha2Rvd24oc3RhdHMpO1xuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIGFjdGl2aXR5IGhlYXRtYXAgKHJlcXVpcmVzIGxvZ2luIHRyYWNraW5nIG5vdCB5ZXQgaW1wbGVtZW50ZWQpXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZpdHlIZWF0bWFwID0gZ2VuZXJhdGVBY3Rpdml0eUhlYXRtYXAoKTtcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdXNlciBhY3Rpdml0eSBtZXRyaWNzXG4gICAgICAgICAgICAgICAgY29uc3QgbWV0cmljcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlVXNlcnM6IE1hdGguZmxvb3IoKHN0YXRzLlVzZXJDb3VudCB8fCAwKSAqIDAuODUpLCAvLyBFc3RpbWF0ZSA4NSUgYWN0aXZlXG4gICAgICAgICAgICAgICAgICAgIGluYWN0aXZlVXNlcnM6IE1hdGguZmxvb3IoKHN0YXRzLlVzZXJDb3VudCB8fCAwKSAqIDAuMTUpLCAvLyBFc3RpbWF0ZSAxNSUgaW5hY3RpdmVcbiAgICAgICAgICAgICAgICAgICAgYXZlcmFnZUxvZ2luRnJlcXVlbmN5OiA0LjIsIC8vIE1vY2sgZGF0YSAtIHJlcXVpcmVzIGxvZ2luIHRyYWNraW5nXG4gICAgICAgICAgICAgICAgICAgIHBlYWtBY3Rpdml0eVRpbWU6ICcxMDowMCBBTSAtIDExOjAwIEFNJywgLy8gTW9jayBkYXRhIC0gcmVxdWlyZXMgbG9naW4gdHJhY2tpbmdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuYWx5dGljc1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGljZW5zZVVzYWdlLFxuICAgICAgICAgICAgICAgICAgICBkZXBhcnRtZW50QnJlYWtkb3duLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUhlYXRtYXAsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3MsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXRBbmFseXRpY3NEYXRhKGFuYWx5dGljc1Jlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggTG9naWMgRW5naW5lIHN0YXRpc3RpY3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VzZXIgYW5hbHl0aWNzIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICAgICAgICAvLyBTZXQgbW9jayBkYXRhIGZvciBkZXZlbG9wbWVudC90ZXN0aW5nXG4gICAgICAgICAgICBzZXRBbmFseXRpY3NEYXRhKGdldE1vY2tBbmFseXRpY3NEYXRhKCkpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtkYXRlUmFuZ2UsIHNlbGVjdGVkRGVwYXJ0bWVudF0pO1xuICAgIC8vIEluaXRpYWwgbG9hZFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZldGNoQW5hbHl0aWNzRGF0YSgpO1xuICAgIH0sIFtmZXRjaEFuYWx5dGljc0RhdGFdKTtcbiAgICAvLyBFeHBvcnQgYW5hbHl0aWNzIHJlcG9ydFxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydFJlcG9ydCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFhbmFseXRpY3NEYXRhKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0V4cG9ydGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjYWxsIGFuIGV4cG9ydCBtb2R1bGVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFeHBvcnRpbmcgYW5hbHl0aWNzIHJlcG9ydC4uLicsIGFuYWx5dGljc0RhdGEpO1xuICAgICAgICAgICAgLy8gTW9jayBleHBvcnQgc3VjY2Vzc1xuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBgVXNlckFuYWx5dGljc18ke2RhdGVSYW5nZX1kYXlzXyR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19Lnhsc3hgO1xuICAgICAgICAgICAgYWxlcnQoYFJlcG9ydCB3b3VsZCBiZSBleHBvcnRlZCB0bzogJHtmaWxlTmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0V4cG9ydCBmYWlsZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNFeHBvcnRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2FuYWx5dGljc0RhdGEsIGRhdGVSYW5nZV0pO1xuICAgIC8vIEF2YWlsYWJsZSBkZXBhcnRtZW50cyBmb3IgZmlsdGVyXG4gICAgY29uc3QgYXZhaWxhYmxlRGVwYXJ0bWVudHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFhbmFseXRpY3NEYXRhKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gYW5hbHl0aWNzRGF0YS5kZXBhcnRtZW50QnJlYWtkb3duLm1hcChkID0+ICh7IGlkOiBkLm5hbWUsIG5hbWU6IGQubmFtZSB9KSk7XG4gICAgfSwgW2FuYWx5dGljc0RhdGFdKTtcbiAgICAvLyBGaWx0ZXIgZGF0YSBieSBkZXBhcnRtZW50XG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghYW5hbHl0aWNzRGF0YSB8fCBzZWxlY3RlZERlcGFydG1lbnQgPT09ICdhbGwnKVxuICAgICAgICAgICAgcmV0dXJuIGFuYWx5dGljc0RhdGE7XG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBmaWx0ZXIgdGhlIGFjdHVhbCBkYXRhXG4gICAgICAgIC8vIEZvciBub3csIGp1c3QgcmV0dXJuIGFsbCBkYXRhIHNpbmNlIHdlIGRvbid0IGhhdmUgZGVwYXJ0bWVudC1sZXZlbCBkZXRhaWxzXG4gICAgICAgIHJldHVybiBhbmFseXRpY3NEYXRhO1xuICAgIH0sIFthbmFseXRpY3NEYXRhLCBzZWxlY3RlZERlcGFydG1lbnRdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbmFseXRpY3NEYXRhOiBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGRhdGVSYW5nZSxcbiAgICAgICAgc2V0RGF0ZVJhbmdlLFxuICAgICAgICBzZWxlY3RlZERlcGFydG1lbnQsXG4gICAgICAgIHNldFNlbGVjdGVkRGVwYXJ0bWVudCxcbiAgICAgICAgYXZhaWxhYmxlRGVwYXJ0bWVudHMsXG4gICAgICAgIGlzRXhwb3J0aW5nLFxuICAgICAgICBoYW5kbGVFeHBvcnRSZXBvcnQsXG4gICAgICAgIHJlZnJlc2hEYXRhOiBmZXRjaEFuYWx5dGljc0RhdGEsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJhckNoYXJ0LCBCYXIsIFBpZUNoYXJ0LCBQaWUsIENlbGwsIFhBeGlzLCBZQXhpcywgQ2FydGVzaWFuR3JpZCwgVG9vbHRpcCwgTGVnZW5kLCBSZXNwb25zaXZlQ29udGFpbmVyLCB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IERvd25sb2FkLCBGaWxlVGV4dCwgQ2FsZW5kYXIsIEZpbHRlciwgVXNlcnMsIFVzZXJDaGVjaywgVXNlclgsIENsb2NrIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZVVzZXJBbmFseXRpY3NMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVVzZXJBbmFseXRpY3NMb2dpYyc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5jb25zdCBTdGF0Q2FyZCA9ICh7IHRpdGxlLCB2YWx1ZSwgaWNvbiwgY29sb3IsICdkYXRhLWN5JzogZGF0YUN5IH0pID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBzaGFkb3ctc21cIiwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYHAtMyByb3VuZGVkLWxnICR7Y29sb3J9YCwgY2hpbGRyZW46IGljb24gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiB0aXRsZSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUudG9Mb2NhbGVTdHJpbmcoKSA6IHZhbHVlIH0pXSB9KV0gfSkgfSkpO1xuLy8gTG9hZGluZyBTa2VsZXRvblxuY29uc3QgQW5hbHl0aWNzU2tlbGV0b24gPSAoKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIHAtNiBzcGFjZS15LTYgYW5pbWF0ZS1wdWxzZVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0xMCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQgdy0xLzNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbLi4uQXJyYXkoNCldLm1hcCgoXywgaSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0yNCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGdcIiB9LCBpKSkpIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFsuLi5BcnJheSgzKV0ubWFwKChfLCBpKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTk2IGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZ1wiIH0sIGkpKSkgfSldIH0pKTtcbi8vIEN1c3RvbSBUb29sdGlwXG5jb25zdCBDdXN0b21Ub29sdGlwID0gKHsgYWN0aXZlLCBwYXlsb2FkLCBsYWJlbCB9KSA9PiB7XG4gICAgaWYgKCFhY3RpdmUgfHwgIXBheWxvYWQgfHwgIXBheWxvYWQubGVuZ3RoKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC0zIHJvdW5kZWQtbGcgc2hhZG93LWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTJcIiwgY2hpbGRyZW46IGxhYmVsIH0pLCBwYXlsb2FkLm1hcCgoZW50cnksIGluZGV4KSA9PiAoX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBzdHlsZTogeyBjb2xvcjogZW50cnkuY29sb3IgfSwgY2hpbGRyZW46IFtlbnRyeS5uYW1lLCBcIjogXCJdIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiB0eXBlb2YgZW50cnkudmFsdWUgPT09ICdudW1iZXInID8gZW50cnkudmFsdWUudG9Mb2NhbGVTdHJpbmcoKSA6IGVudHJ5LnZhbHVlIH0pXSB9LCBpbmRleCkpKV0gfSkpO1xufTtcbi8vIEFjdGl2aXR5IEhlYXRtYXAgQ29tcG9uZW50XG5jb25zdCBBY3Rpdml0eUhlYXRtYXAgPSAoeyBkYXRhIH0pID0+IHtcbiAgICBjb25zdCBkYXlzID0gWydNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5JywgJ1N1bmRheSddO1xuICAgIGNvbnN0IGhvdXJzID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMjQgfSwgKF8sIGkpID0+IGkpO1xuICAgIGNvbnN0IGdldEFjdGl2aXR5Q29sb3IgPSAoYWN0aXZpdHkpID0+IHtcbiAgICAgICAgaWYgKGFjdGl2aXR5ID49IDgwKVxuICAgICAgICAgICAgcmV0dXJuICdiZy1ncmVlbi02MDAnO1xuICAgICAgICBpZiAoYWN0aXZpdHkgPj0gNjApXG4gICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTUwMCc7XG4gICAgICAgIGlmIChhY3Rpdml0eSA+PSA0MClcbiAgICAgICAgICAgIHJldHVybiAnYmcteWVsbG93LTUwMCc7XG4gICAgICAgIGlmIChhY3Rpdml0eSA+PSAyMClcbiAgICAgICAgICAgIHJldHVybiAnYmctb3JhbmdlLTUwMCc7XG4gICAgICAgIHJldHVybiAnYmctZ3JheS0zMDAgZGFyazpiZy1ncmF5LTYwMCc7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwib3ZlcmZsb3cteC1hdXRvXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtYmxvY2sgbWluLXctZnVsbFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgZ2FwLTEgcHQtNlwiLCBjaGlsZHJlbjogZGF5cy5tYXAoZGF5ID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtNCBmbGV4IGl0ZW1zLWNlbnRlciB0ZXh0LXhzIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHctMjBcIiwgY2hpbGRyZW46IGRheS5zbGljZSgwLCAzKSB9LCBkYXkpKSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTEgbWItMVwiLCBjaGlsZHJlbjogaG91cnMubWFwKGhvdXIgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IHRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgdGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IGhvdXIgJSA2ID09PSAwID8gaG91ciA6ICcnIH0sIGhvdXIpKSkgfSksIGRheXMubWFwKGRheSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0xXCIsIGNoaWxkcmVuOiBob3Vycy5tYXAoaG91ciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXRlbSA9IChkYXRhID8/IFtdKS5maW5kKGQgPT4gZC5kYXkgPT09IGRheSAmJiBkLmhvdXIgPT09IGhvdXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2aXR5ID0gaXRlbT8uYWN0aXZpdHkgfHwgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGB3LTQgaC00IHJvdW5kZWQtc20gJHtnZXRBY3Rpdml0eUNvbG9yKGFjdGl2aXR5KX0gdHJhbnNpdGlvbi1hbGwgaG92ZXI6c2NhbGUtMTI1IGN1cnNvci1wb2ludGVyYCwgdGl0bGU6IGAke2RheX0gJHtob3VyfTowMCAtIEFjdGl2aXR5OiAke2FjdGl2aXR5fSVgIH0sIGhvdXIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIH0sIGRheSkpKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IGZsZXggaXRlbXMtY2VudGVyIGdhcC00IHRleHQteHMgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIkxlc3NcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBiZy1ncmF5LTMwMCBkYXJrOmJnLWdyYXktNjAwIHJvdW5kZWQtc21cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IGJnLW9yYW5nZS01MDAgcm91bmRlZC1zbVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYmcteWVsbG93LTUwMCByb3VuZGVkLXNtXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBiZy1ncmVlbi01MDAgcm91bmRlZC1zbVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYmctZ3JlZW4tNjAwIHJvdW5kZWQtc21cIiB9KV0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiTW9yZVwiIH0pXSB9KV0gfSkgfSkpO1xufTtcbmNvbnN0IFVzZXJBbmFseXRpY3NWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgYW5hbHl0aWNzRGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgZGF0ZVJhbmdlLCBzZXREYXRlUmFuZ2UsIHNlbGVjdGVkRGVwYXJ0bWVudCwgc2V0U2VsZWN0ZWREZXBhcnRtZW50LCBhdmFpbGFibGVEZXBhcnRtZW50cywgaXNFeHBvcnRpbmcsIGhhbmRsZUV4cG9ydFJlcG9ydCwgcmVmcmVzaERhdGEsIH0gPSB1c2VVc2VyQW5hbHl0aWNzTG9naWMoKTtcbiAgICBjb25zdCBpc0RhcmtNb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZGFyaycpO1xuICAgIC8vIENvbXB1dGUgZmlsdGVyZWQgZGF0YSBmcm9tIGFuYWx5dGljc0RhdGFcbiAgICBjb25zdCBmaWx0ZXJlZExpY2Vuc2VVc2FnZSA9IGFuYWx5dGljc0RhdGE/LmxpY2Vuc2VVc2FnZSB8fCBbXTtcbiAgICBjb25zdCBmaWx0ZXJlZERlcGFydG1lbnRCcmVha2Rvd24gPSBhbmFseXRpY3NEYXRhPy5kZXBhcnRtZW50QnJlYWtkb3duIHx8IFtdO1xuICAgIC8vIENoYXJ0IHRoZW1lXG4gICAgY29uc3QgY2hhcnRUaGVtZSA9IHtcbiAgICAgICAgdGV4dENvbG9yOiBpc0RhcmtNb2RlID8gJyNmOWZhZmInIDogJyMxZjI5MzcnLFxuICAgICAgICBncmlkQ29sb3I6IGlzRGFya01vZGUgPyAnIzM3NDE1MScgOiAnI2U1ZTdlYicsXG4gICAgfTtcbiAgICAvLyBDb2xvciBwYWxldHRlXG4gICAgY29uc3QgQ09MT1JTID0ge1xuICAgICAgICBwcmltYXJ5OiBpc0RhcmtNb2RlID8gJyM2MGE1ZmEnIDogJyMzYjgyZjYnLFxuICAgICAgICBzdWNjZXNzOiBpc0RhcmtNb2RlID8gJyMzNGQzOTknIDogJyMxMGI5ODEnLFxuICAgICAgICB3YXJuaW5nOiBpc0RhcmtNb2RlID8gJyNmYmJmMjQnIDogJyNmNTllMGInLFxuICAgICAgICBkYW5nZXI6IGlzRGFya01vZGUgPyAnI2Y4NzE3MScgOiAnI2VmNDQ0NCcsXG4gICAgICAgIHB1cnBsZTogaXNEYXJrTW9kZSA/ICcjYTc4YmZhJyA6ICcjOGI1Y2Y2JyxcbiAgICAgICAgcGluazogaXNEYXJrTW9kZSA/ICcjZjQ3MmI2JyA6ICcjZWM0ODk5JyxcbiAgICAgICAgdGVhbDogaXNEYXJrTW9kZSA/ICcjMmRkNGJmJyA6ICcjMTRiOGE2JyxcbiAgICB9O1xuICAgIGNvbnN0IFBJRV9DT0xPUlMgPSBbQ09MT1JTLnByaW1hcnksIENPTE9SUy5zdWNjZXNzLCBDT0xPUlMud2FybmluZywgQ09MT1JTLnB1cnBsZSwgQ09MT1JTLnBpbmssIENPTE9SUy50ZWFsLCBDT0xPUlMuZGFuZ2VyXTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiBfanN4KEFuYWx5dGljc1NrZWxldG9uLCB7fSk7XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIFwiZGF0YS1jeVwiOiBcImFuYWx5dGljcy1lcnJvclwiLCBcImRhdGEtdGVzdGlkXCI6IFwiYW5hbHl0aWNzLWVycm9yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgdGV4dC1sZ1wiLCBjaGlsZHJlbjogZXJyb3IgfSkgfSkgfSkpO1xuICAgIH1cbiAgICBpZiAoIWFuYWx5dGljc0RhdGEpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTm8gYW5hbHl0aWNzIGRhdGEgYXZhaWxhYmxlXCIgfSkgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJ1c2VyLWFuYWx5dGljcy12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ1c2VyLWFuYWx5dGljcy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IFwiVXNlciBBbmFseXRpY3NcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2FsZW5kYXIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmF5LTUwMFwiIH0pLCBfanN4cyhcInNlbGVjdFwiLCB7IHZhbHVlOiBkYXRlUmFuZ2UsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0RGF0ZVJhbmdlKGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInctMzIgcHgtMyBweS0xLjUgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBkYXJrOmJvcmRlci1ncmF5LTYwMCByb3VuZGVkLW1kIGJnLXdoaXRlIGRhcms6YmctZ3JheS03MDAgdGV4dC1zbVwiLCBcImRhdGEtY3lcIjogXCJkYXRlLXJhbmdlLXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGF0ZS1yYW5nZS1zZWxlY3RcIiwgY2hpbGRyZW46IFtfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiN1wiLCBjaGlsZHJlbjogXCJMYXN0IDcgZGF5c1wiIH0pLCBfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiMzBcIiwgY2hpbGRyZW46IFwiTGFzdCAzMCBkYXlzXCIgfSksIF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCI5MFwiLCBjaGlsZHJlbjogXCJMYXN0IDkwIGRheXNcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JheS01MDBcIiB9KSwgX2pzeHMoXCJzZWxlY3RcIiwgeyB2YWx1ZTogc2VsZWN0ZWREZXBhcnRtZW50LCBvbkNoYW5nZTogKGUpID0+IHNldFNlbGVjdGVkRGVwYXJ0bWVudChlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJ3LTQwIHB4LTMgcHktMS41IGJvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAgcm91bmRlZC1tZCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktNzAwIHRleHQtc21cIiwgXCJkYXRhLWN5XCI6IFwiZGVwYXJ0bWVudC1maWx0ZXJcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRlcGFydG1lbnQtZmlsdGVyXCIsIGNoaWxkcmVuOiBbX2pzeChcIm9wdGlvblwiLCB7IHZhbHVlOiBcImFsbFwiLCBjaGlsZHJlbjogXCJBbGwgRGVwYXJ0bWVudHNcIiB9KSwgYXZhaWxhYmxlRGVwYXJ0bWVudHMubWFwKGRlcHQgPT4gKF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogZGVwdC5pZCwgY2hpbGRyZW46IGRlcHQubmFtZSB9LCBkZXB0LmlkKSkpXSB9KV0gfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydFJlcG9ydCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LWV4Y2VsLWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgRXhjZWxcIiB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogKCkgPT4gY29uc29sZS5sb2coJ0V4cG9ydCBQREYnKSwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LXBkZi1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1wZGYtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBQREZcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTYgc3BhY2UteS02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiQWN0aXZlIFVzZXJzXCIsIHZhbHVlOiBhbmFseXRpY3NEYXRhLm1ldHJpY3MuYWN0aXZlVXNlcnMsIGljb246IF9qc3goVXNlckNoZWNrLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctZ3JlZW4tNTAwXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtYWN0aXZlLXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LWFjdGl2ZS11c2Vyc1wiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIkluYWN0aXZlIFVzZXJzXCIsIHZhbHVlOiBhbmFseXRpY3NEYXRhLm1ldHJpY3MuaW5hY3RpdmVVc2VycywgaWNvbjogX2pzeChVc2VyWCwgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLXJlZC01MDBcIiwgXCJkYXRhLWN5XCI6IFwic3RhdC1pbmFjdGl2ZS11c2Vyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1pbmFjdGl2ZS11c2Vyc1wiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIkF2Zy4gTG9naW4gRnJlcXVlbmN5XCIsIHZhbHVlOiBgJHthbmFseXRpY3NEYXRhLm1ldHJpY3MuYXZlcmFnZUxvZ2luRnJlcXVlbmN5fS93ZWVrYCwgaWNvbjogX2pzeChVc2VycywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLWJsdWUtNTAwXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtbG9naW4tZnJlcXVlbmN5XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LWxvZ2luLWZyZXF1ZW5jeVwiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIlBlYWsgQWN0aXZpdHkgVGltZVwiLCB2YWx1ZTogYW5hbHl0aWNzRGF0YS5tZXRyaWNzLnBlYWtBY3Rpdml0eVRpbWUsIGljb246IF9qc3goQ2xvY2ssIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1wdXJwbGUtNTAwXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtcGVhay10aW1lXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LXBlYWstdGltZVwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNiBsZzpjb2wtc3Bhbi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIkxpY2Vuc2UgVXNhZ2VcIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAzMDAsIGNoaWxkcmVuOiBfanN4cyhCYXJDaGFydCwgeyBkYXRhOiBmaWx0ZXJlZExpY2Vuc2VVc2FnZSwgY2hpbGRyZW46IFtfanN4KENhcnRlc2lhbkdyaWQsIHsgc3Ryb2tlRGFzaGFycmF5OiBcIjMgM1wiLCBzdHJva2U6IGNoYXJ0VGhlbWUuZ3JpZENvbG9yIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwibGljZW5zZU5hbWVcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciwgYW5nbGU6IC0zMCwgdGV4dEFuY2hvcjogXCJlbmRcIiwgaGVpZ2h0OiAxMDAgfSksIF9qc3goWUF4aXMsIHsgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pLCBfanN4KExlZ2VuZCwge30pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcImFzc2lnbmVkXCIsIHN0YWNrSWQ6IFwiYVwiLCBmaWxsOiBDT0xPUlMucHJpbWFyeSwgbmFtZTogXCJBc3NpZ25lZFwiLCByYWRpdXM6IFswLCAwLCAwLCAwXSB9KSwgX2pzeChCYXIsIHsgZGF0YUtleTogXCJhdmFpbGFibGVcIiwgc3RhY2tJZDogXCJhXCIsIGZpbGw6IENPTE9SUy5zdWNjZXNzLCBuYW1lOiBcIkF2YWlsYWJsZVwiLCByYWRpdXM6IFs4LCA4LCAwLCAwXSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy01IGdhcC00XCIsIGNoaWxkcmVuOiBmaWx0ZXJlZExpY2Vuc2VVc2FnZS5tYXAoKGxpY2Vuc2UsIGluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTFcIiwgY2hpbGRyZW46IGxpY2Vuc2UubGljZW5zZU5hbWUgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmUgdy1mdWxsIGgtMiBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW5cIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBhYnNvbHV0ZSB0b3AtMCBsZWZ0LTAgaC1mdWxsICR7bGljZW5zZS51dGlsaXphdGlvbiA+PSA5MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctcmVkLTUwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbGljZW5zZS51dGlsaXphdGlvbiA+PSA3NVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXllbGxvdy01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctZ3JlZW4tNTAwJ31gLCBzdHlsZTogeyB3aWR0aDogYCR7bGljZW5zZS51dGlsaXphdGlvbn0lYCB9IH0pIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG10LTFcIiwgY2hpbGRyZW46IFtsaWNlbnNlLnV0aWxpemF0aW9uLCBcIiVcIl0gfSldIH0sIGluZGV4KSkpIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIkRlcGFydG1lbnQgQnJlYWtkb3duXCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMzAwLCBjaGlsZHJlbjogX2pzeHMoUGllQ2hhcnQsIHsgY2hpbGRyZW46IFtfanN4KFBpZSwgeyBkYXRhOiBmaWx0ZXJlZERlcGFydG1lbnRCcmVha2Rvd24sIGN4OiBcIjUwJVwiLCBjeTogXCI1MCVcIiwgbGFiZWxMaW5lOiBmYWxzZSwgbGFiZWw6ICh7IG5hbWUsIHBlcmNlbnRhZ2UgfSkgPT4gYCR7bmFtZX06ICR7cGVyY2VudGFnZX0lYCwgb3V0ZXJSYWRpdXM6IDEwMCwgZmlsbDogXCIjODg4NGQ4XCIsIGRhdGFLZXk6IFwidmFsdWVcIiwgY2hpbGRyZW46IGZpbHRlcmVkRGVwYXJ0bWVudEJyZWFrZG93bi5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3goQ2VsbCwgeyBmaWxsOiBQSUVfQ09MT1JTW2luZGV4ICUgUElFX0NPTE9SUy5sZW5ndGhdIH0sIGBjZWxsLSR7aW5kZXh9YCkpKSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJBY3Rpdml0eSBIZWF0bWFwXCIgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTRcIiwgY2hpbGRyZW46IFtcIlVzZXIgYWN0aXZpdHkgYnkgZGF5IGFuZCB0aW1lIChsYXN0IFwiLCBkYXRlUmFuZ2UsIFwiIGRheXMpXCJdIH0pLCBfanN4KEFjdGl2aXR5SGVhdG1hcCwgeyBkYXRhOiBhbmFseXRpY3NEYXRhLmFjdGl2aXR5SGVhdG1hcCB9KV0gfSldIH0pXSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFVzZXJBbmFseXRpY3NWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9