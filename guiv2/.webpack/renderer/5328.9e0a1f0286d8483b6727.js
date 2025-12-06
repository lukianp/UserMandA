(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5328],{

/***/ 29573:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ analytics_ExecutiveDashboardView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/recharts/es6/index.js + 3 modules
var es6 = __webpack_require__(72085);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/hooks/useExecutiveDashboardLogic.ts

const REFRESH_INTERVAL = 30000; // 30 seconds
/**
 * Build department distribution from statistics
 * In a real implementation, this would aggregate actual user department data
 */
function buildDepartmentDistribution(stats) {
    const totalUsers = stats.UserCount || 0;
    if (totalUsers === 0)
        return [];
    // Mock distribution percentages - in reality this would come from CSV data
    return [
        { name: 'Sales', userCount: Math.floor(totalUsers * 0.18) },
        { name: 'Engineering', userCount: Math.floor(totalUsers * 0.25) },
        { name: 'Marketing', userCount: Math.floor(totalUsers * 0.12) },
        { name: 'HR', userCount: Math.floor(totalUsers * 0.07) },
        { name: 'Finance', userCount: Math.floor(totalUsers * 0.10) },
        { name: 'Operations', userCount: Math.floor(totalUsers * 0.15) },
        { name: 'Support', userCount: Math.floor(totalUsers * 0.13) },
    ];
}
/**
 * Build migration progress timeline from statistics
 * In a real implementation, this would come from migration tracking data
 */
function buildMigrationProgress(stats) {
    const totalUsers = stats.UserCount || 0;
    const totalGroups = stats.GroupCount || 0;
    // Mock 6-week migration timeline
    const now = new Date();
    const weeks = 6;
    const data = [];
    for (let i = 0; i < weeks; i++) {
        const weekDate = new Date(now);
        weekDate.setDate(weekDate.getDate() - (weeks - i - 1) * 7);
        const progressPct = (i + 1) / weeks;
        data.push({
            date: weekDate.toISOString().split('T')[0],
            usersMigrated: Math.floor(totalUsers * progressPct * 0.8), // 80% completion
            groupsMigrated: Math.floor(totalGroups * progressPct * 0.85), // 85% completion
        });
    }
    return data;
}
/**
 * Build migration status breakdown from statistics
 * In a real implementation, this would come from migration state tracking
 */
function buildMigrationStatus(stats) {
    const totalUsers = stats.UserCount || 0;
    if (totalUsers === 0)
        return [];
    // Mock status distribution
    const completed = Math.floor(totalUsers * 0.81);
    const inProgress = Math.floor(totalUsers * 0.12);
    const failed = Math.floor(totalUsers * 0.03);
    const pending = totalUsers - completed - inProgress - failed;
    const total = totalUsers;
    return [
        {
            name: 'Completed',
            value: completed,
            percentage: Math.round((completed / total) * 100),
        },
        {
            name: 'In Progress',
            value: inProgress,
            percentage: Math.round((inProgress / total) * 100),
        },
        {
            name: 'Failed',
            value: failed,
            percentage: Math.round((failed / total) * 100),
        },
        {
            name: 'Pending',
            value: pending,
            percentage: Math.round((pending / total) * 100),
        },
    ].filter(item => item.value > 0);
}
const useExecutiveDashboardLogic = () => {
    const [dashboardData, setDashboardData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [lastRefresh, setLastRefresh] = (0,react.useState)(new Date());
    const [autoRefresh, setAutoRefresh] = (0,react.useState)(true);
    const fetchDashboardData = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Get statistics from Logic Engine
            const result = await window.electronAPI.logicEngine.getStatistics();
            if (result.success && result.data?.statistics) {
                const stats = result.data.statistics;
                // Calculate trends (mock calculation - in real app would come from historical data)
                const userTrend = Math.floor(Math.random() * 20) - 5; // -5% to +15%
                const groupTrend = Math.floor(Math.random() * 15) - 3;
                const dataVolumeTrend = Math.floor(Math.random() * 25) - 10;
                // Estimate data volume from mailbox data (rough estimate)
                // In a real implementation, this would come from file share discovery
                const estimatedDataVolumeTB = (stats.MailboxCount || 0) * 0.005; // Assume 5GB per mailbox avg
                // Estimate timeline based on complexity (rough heuristic)
                const totalEntities = (stats.UserCount || 0) + (stats.GroupCount || 0) + (stats.DeviceCount || 0);
                const estimatedTimelineDays = Math.ceil(totalEntities / 300); // Assume 300 entities per day
                // Build department distribution from user data
                // In a real implementation, this would aggregate user department data
                const departmentDistribution = buildDepartmentDistribution(stats);
                // Build migration progress timeline (mock data for now)
                const migrationProgress = buildMigrationProgress(stats);
                // Build migration status breakdown (mock data for now)
                const migrationStatus = buildMigrationStatus(stats);
                // Parse and structure the data
                const data = {
                    kpis: {
                        totalUsers: stats.UserCount || 0,
                        totalGroups: stats.GroupCount || 0,
                        dataVolumeTB: estimatedDataVolumeTB,
                        estimatedTimelineDays,
                        userTrend,
                        groupTrend,
                        dataVolumeTrend,
                    },
                    departmentDistribution,
                    migrationProgress,
                    migrationStatus,
                    systemHealth: {
                        cpuUsage: Math.floor(Math.random() * 60) + 20, // Mock CPU usage
                        memoryUsage: Math.floor(Math.random() * 50) + 30, // Mock memory usage
                        networkStatus: 'healthy',
                        lastUpdated: new Date(),
                    },
                };
                setDashboardData(data);
                setLastRefresh(new Date());
            }
            else {
                throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Dashboard data fetch error:', err);
            // Set mock data for development/testing
            setDashboardData(getMockDashboardData());
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Calculate migration status breakdown with percentages
    const calculateStatusBreakdown = (statusData) => {
        const total = (statusData.completed || 0) + (statusData.inProgress || 0) +
            (statusData.failed || 0) + (statusData.pending || 0);
        if (total === 0)
            return [];
        return [
            {
                name: 'Completed',
                value: statusData.completed || 0,
                percentage: Math.round(((statusData.completed || 0) / total) * 100),
            },
            {
                name: 'In Progress',
                value: statusData.inProgress || 0,
                percentage: Math.round(((statusData.inProgress || 0) / total) * 100),
            },
            {
                name: 'Failed',
                value: statusData.failed || 0,
                percentage: Math.round(((statusData.failed || 0) / total) * 100),
            },
            {
                name: 'Pending',
                value: statusData.pending || 0,
                percentage: Math.round(((statusData.pending || 0) / total) * 100),
            },
        ].filter(item => item.value > 0);
    };
    // Mock data for development/testing
    const getMockDashboardData = () => ({
        kpis: {
            totalUsers: 12547,
            totalGroups: 438,
            dataVolumeTB: 2.7,
            estimatedTimelineDays: 45,
            userTrend: 8.5,
            groupTrend: 3.2,
            dataVolumeTrend: -2.1,
        },
        departmentDistribution: [
            { name: 'Sales', userCount: 2340 },
            { name: 'Engineering', userCount: 3120 },
            { name: 'Marketing', userCount: 1560 },
            { name: 'HR', userCount: 890 },
            { name: 'Finance', userCount: 1240 },
            { name: 'Operations', userCount: 1870 },
            { name: 'Support', userCount: 1527 },
        ],
        migrationProgress: [
            { date: '2025-09-01', usersMigrated: 1200, groupsMigrated: 45 },
            { date: '2025-09-08', usersMigrated: 2800, groupsMigrated: 98 },
            { date: '2025-09-15', usersMigrated: 4500, groupsMigrated: 156 },
            { date: '2025-09-22', usersMigrated: 6700, groupsMigrated: 234 },
            { date: '2025-09-29', usersMigrated: 8900, groupsMigrated: 312 },
            { date: '2025-10-03', usersMigrated: 10200, groupsMigrated: 378 },
        ],
        migrationStatus: [
            { name: 'Completed', value: 10200, percentage: 81 },
            { name: 'In Progress', value: 1500, percentage: 12 },
            { name: 'Failed', value: 347, percentage: 3 },
            { name: 'Pending', value: 500, percentage: 4 },
        ],
        systemHealth: {
            cpuUsage: 45,
            memoryUsage: 62,
            networkStatus: 'healthy',
            lastUpdated: new Date(),
        },
    });
    // Initial load
    (0,react.useEffect)(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    // Auto-refresh timer
    (0,react.useEffect)(() => {
        if (!autoRefresh)
            return;
        const interval = setInterval(() => {
            fetchDashboardData();
        }, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchDashboardData]);
    const handleRefresh = (0,react.useCallback)(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    const toggleAutoRefresh = (0,react.useCallback)(() => {
        setAutoRefresh(prev => !prev);
    }, []);
    // Format time since last refresh
    const timeSinceRefresh = (0,react.useMemo)(() => {
        const seconds = Math.floor((new Date().getTime() - lastRefresh.getTime()) / 1000);
        if (seconds < 60)
            return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    }, [lastRefresh]);
    return {
        dashboardData,
        isLoading,
        error,
        lastRefresh,
        timeSinceRefresh,
        autoRefresh,
        handleRefresh,
        toggleAutoRefresh,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
;// ./src/renderer/views/analytics/ExecutiveDashboardView.tsx





const KpiCard = ({ title, value, icon, trend, suffix, 'data-cy': dataCy }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return ((0,jsx_runtime.jsxs)("div", { className: "p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow", "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: title }), (0,jsx_runtime.jsx)("div", { className: "text-blue-500 dark:text-blue-400", children: icon })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-baseline gap-2", children: [(0,jsx_runtime.jsx)("div", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: typeof value === 'number' ? value.toLocaleString() : value }), suffix && (0,jsx_runtime.jsx)("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: suffix })] }), trend !== undefined && ((0,jsx_runtime.jsxs)("div", { className: `text-sm mt-2 font-medium ${trend > 0 ? 'text-green-600 dark:text-green-400' : trend < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`, children: [trend > 0 ? '↑' : trend < 0 ? '↓' : '→', " ", Math.abs(trend), "%"] }))] }));
};
// Loading Skeleton Component
const DashboardSkeleton = () => ((0,jsx_runtime.jsxs)("div", { className: "h-full p-6 space-y-6 animate-pulse", children: [(0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [...Array(4)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) })] }));
// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: label }), payload.map((entry, index) => ((0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { style: { color: entry.color }, children: [entry.name, ": "] }), (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: (entry.value ?? 0).toLocaleString() })] }, index)))] }));
};
const ExecutiveDashboardView = () => {
    const { dashboardData, isLoading, error, timeSinceRefresh, autoRefresh, handleRefresh, toggleAutoRefresh, } = useExecutiveDashboardLogic();
    const isDarkMode = document.documentElement.classList.contains('dark');
    // Chart theme configuration
    const chartTheme = {
        textColor: isDarkMode ? '#f9fafb' : '#1f2937',
        gridColor: isDarkMode ? '#374151' : '#e5e7eb',
        tooltipBg: isDarkMode ? '#374151' : '#ffffff',
    };
    // Color palette for charts
    const COLORS = {
        primary: isDarkMode ? '#60a5fa' : '#3b82f6',
        success: isDarkMode ? '#34d399' : '#10b981',
        warning: isDarkMode ? '#fbbf24' : '#f59e0b',
        danger: isDarkMode ? '#f87171' : '#ef4444',
        neutral: isDarkMode ? '#9ca3af' : '#6b7280',
    };
    // Pie chart colors for migration status
    const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.danger, COLORS.neutral];
    if (isLoading) {
        return (0,jsx_runtime.jsx)(DashboardSkeleton, {});
    }
    if (error) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", "data-cy": "dashboard-error", "data-testid": "dashboard-error", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)("p", { className: "text-red-600 dark:text-red-400 text-lg mb-4", children: error }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleRefresh, variant: "primary", "data-cy": "retry-btn", "data-testid": "retry-btn", children: "Retry" })] }) }));
    }
    if (!dashboardData) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "No data available" }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "executive-dashboard-view", "data-testid": "executive-dashboard-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Executive Dashboard" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Last updated: ", timeSinceRefresh] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: toggleAutoRefresh, variant: autoRefresh ? 'primary' : 'secondary', size: "sm", "data-cy": "auto-refresh-toggle", "data-testid": "auto-refresh-toggle", children: autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off' }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleRefresh, variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0,jsx_runtime.jsx)(KpiCard, { title: "Total Users", value: dashboardData.kpis.totalUsers, icon: (0,jsx_runtime.jsx)(lucide_react/* Users */.zWC, { className: "w-6 h-6" }), trend: dashboardData.kpis.userTrend, "data-cy": "kpi-users", "data-testid": "kpi-users" }), (0,jsx_runtime.jsx)(KpiCard, { title: "Total Groups", value: dashboardData.kpis.totalGroups, icon: (0,jsx_runtime.jsx)(lucide_react/* FolderTree */.zvo, { className: "w-6 h-6" }), trend: dashboardData.kpis.groupTrend, "data-cy": "kpi-groups", "data-testid": "kpi-groups" }), (0,jsx_runtime.jsx)(KpiCard, { title: "Data Volume", value: typeof dashboardData.kpis.dataVolumeTB === 'number' ? dashboardData.kpis.dataVolumeTB.toFixed(1) : '0', suffix: "TB", icon: (0,jsx_runtime.jsx)(lucide_react/* HardDrive */.akk, { className: "w-6 h-6" }), trend: dashboardData.kpis.dataVolumeTrend, "data-cy": "kpi-data-volume", "data-testid": "kpi-data-volume" }), (0,jsx_runtime.jsx)(KpiCard, { title: "Est. Timeline", value: dashboardData.kpis.estimatedTimelineDays, suffix: "days", icon: (0,jsx_runtime.jsx)(lucide_react/* Calendar */.VvS, { className: "w-6 h-6" }), "data-cy": "kpi-timeline", "data-testid": "kpi-timeline" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "User Distribution by Department" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* BarChart */.Es, { data: dashboardData.departmentDistribution, children: [(0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { dataKey: "name", stroke: chartTheme.textColor, angle: -45, textAnchor: "end", height: 80, tick: { fontSize: 12 } }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { stroke: chartTheme.textColor, tick: { fontSize: 12 } }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6/* Bar */.yP, { dataKey: "userCount", fill: COLORS.primary, radius: [8, 8, 0, 0], name: "Users" })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Migration Progress Over Time" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* AreaChart */.QF, { data: dashboardData.migrationProgress, children: [(0,jsx_runtime.jsxs)("defs", { children: [(0,jsx_runtime.jsxs)("linearGradient", { id: "colorUsers", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0,jsx_runtime.jsx)("stop", { offset: "5%", stopColor: COLORS.primary, stopOpacity: 0.8 }), (0,jsx_runtime.jsx)("stop", { offset: "95%", stopColor: COLORS.primary, stopOpacity: 0.1 })] }), (0,jsx_runtime.jsxs)("linearGradient", { id: "colorGroups", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0,jsx_runtime.jsx)("stop", { offset: "5%", stopColor: COLORS.success, stopOpacity: 0.8 }), (0,jsx_runtime.jsx)("stop", { offset: "95%", stopColor: COLORS.success, stopOpacity: 0.1 })] })] }), (0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { dataKey: "date", stroke: chartTheme.textColor, tick: { fontSize: 12 } }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { stroke: chartTheme.textColor, tick: { fontSize: 12 } }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6/* Legend */.s$, {}), (0,jsx_runtime.jsx)(es6/* Area */.Gk, { type: "monotone", dataKey: "usersMigrated", stroke: COLORS.primary, fillOpacity: 1, fill: "url(#colorUsers)", name: "Users Migrated" }), (0,jsx_runtime.jsx)(es6/* Area */.Gk, { type: "monotone", dataKey: "groupsMigrated", stroke: COLORS.success, fillOpacity: 1, fill: "url(#colorGroups)", name: "Groups Migrated" })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Migration Status Breakdown" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* PieChart */.rW, { children: [(0,jsx_runtime.jsx)(es6/* Pie */.Fq, { data: dashboardData.migrationStatus, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percentage }) => `${name}: ${percentage}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: dashboardData.migrationStatus.map((entry, index) => ((0,jsx_runtime.jsx)(es6/* Cell */.fh, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6/* Legend */.s$, {})] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "System Health" }), (0,jsx_runtime.jsxs)("div", { className: "space-y-6", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Cpu */.fX, { className: "w-4 h-4 text-blue-500" }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "CPU Usage" })] }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [dashboardData.systemHealth.cpuUsage, "%"] })] }), (0,jsx_runtime.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: (0,jsx_runtime.jsx)("div", { className: `h-2 rounded-full transition-all ${dashboardData.systemHealth.cpuUsage > 80
                                                                ? 'bg-red-500'
                                                                : dashboardData.systemHealth.cpuUsage > 60
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'}`, style: { width: `${dashboardData.systemHealth.cpuUsage}%` } }) })] }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* MemoryStick */.UMG, { className: "w-4 h-4 text-purple-500" }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Memory Usage" })] }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: [dashboardData.systemHealth.memoryUsage, "%"] })] }), (0,jsx_runtime.jsx)("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: (0,jsx_runtime.jsx)("div", { className: `h-2 rounded-full transition-all ${dashboardData.systemHealth.memoryUsage > 80
                                                                ? 'bg-red-500'
                                                                : dashboardData.systemHealth.memoryUsage > 60
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'}`, style: { width: `${dashboardData.systemHealth.memoryUsage}%` } }) })] }), (0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Network */.lgv, { className: "w-4 h-4 text-green-500" }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Network Status" })] }), (0,jsx_runtime.jsx)("span", { className: `text-sm font-semibold ${dashboardData.systemHealth.networkStatus === 'healthy'
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : dashboardData.systemHealth.networkStatus === 'warning'
                                                                    ? 'text-yellow-600 dark:text-yellow-400'
                                                                    : 'text-red-600 dark:text-red-400'}`, children: dashboardData.systemHealth.networkStatus.charAt(0).toUpperCase() +
                                                                dashboardData.systemHealth.networkStatus.slice(1) })] }) }), (0,jsx_runtime.jsx)("div", { className: "pt-4 border-t border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Last health check: ", dashboardData.systemHealth.lastUpdated.toLocaleTimeString()] }) })] })] })] })] })] }));
};
/* harmony default export */ const analytics_ExecutiveDashboardView = (ExecutiveDashboardView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dUpBQXVKLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ2paO0FBQ0EsdUVBQWUsc0JBQXNCLEVBQUM7Ozs7Ozs7O0FDNUR0QyxlOzs7Ozs7O0FDQUEsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUV4ZWN1dGl2ZURhc2hib2FyZExvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FuYWx5dGljcy9FeGVjdXRpdmVEYXNoYm9hcmRWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXHJlY2hhcnRzXFxub2RlX21vZHVsZXNcXEByZWR1eGpzXFx0b29sa2l0XFxkaXN0fHByb2Nlc3MvYnJvd3NlciJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmNvbnN0IFJFRlJFU0hfSU5URVJWQUwgPSAzMDAwMDsgLy8gMzAgc2Vjb25kc1xuLyoqXG4gKiBCdWlsZCBkZXBhcnRtZW50IGRpc3RyaWJ1dGlvbiBmcm9tIHN0YXRpc3RpY3NcbiAqIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBhZ2dyZWdhdGUgYWN0dWFsIHVzZXIgZGVwYXJ0bWVudCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkRGVwYXJ0bWVudERpc3RyaWJ1dGlvbihzdGF0cykge1xuICAgIGNvbnN0IHRvdGFsVXNlcnMgPSBzdGF0cy5Vc2VyQ291bnQgfHwgMDtcbiAgICBpZiAodG90YWxVc2VycyA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIC8vIE1vY2sgZGlzdHJpYnV0aW9uIHBlcmNlbnRhZ2VzIC0gaW4gcmVhbGl0eSB0aGlzIHdvdWxkIGNvbWUgZnJvbSBDU1YgZGF0YVxuICAgIHJldHVybiBbXG4gICAgICAgIHsgbmFtZTogJ1NhbGVzJywgdXNlckNvdW50OiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjE4KSB9LFxuICAgICAgICB7IG5hbWU6ICdFbmdpbmVlcmluZycsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4yNSkgfSxcbiAgICAgICAgeyBuYW1lOiAnTWFya2V0aW5nJywgdXNlckNvdW50OiBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjEyKSB9LFxuICAgICAgICB7IG5hbWU6ICdIUicsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4wNykgfSxcbiAgICAgICAgeyBuYW1lOiAnRmluYW5jZScsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMCkgfSxcbiAgICAgICAgeyBuYW1lOiAnT3BlcmF0aW9ucycsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xNSkgfSxcbiAgICAgICAgeyBuYW1lOiAnU3VwcG9ydCcsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMykgfSxcbiAgICBdO1xufVxuLyoqXG4gKiBCdWlsZCBtaWdyYXRpb24gcHJvZ3Jlc3MgdGltZWxpbmUgZnJvbSBzdGF0aXN0aWNzXG4gKiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY29tZSBmcm9tIG1pZ3JhdGlvbiB0cmFja2luZyBkYXRhXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTWlncmF0aW9uUHJvZ3Jlc3Moc3RhdHMpIHtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgY29uc3QgdG90YWxHcm91cHMgPSBzdGF0cy5Hcm91cENvdW50IHx8IDA7XG4gICAgLy8gTW9jayA2LXdlZWsgbWlncmF0aW9uIHRpbWVsaW5lXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCB3ZWVrcyA9IDY7XG4gICAgY29uc3QgZGF0YSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2Vla3M7IGkrKykge1xuICAgICAgICBjb25zdCB3ZWVrRGF0ZSA9IG5ldyBEYXRlKG5vdyk7XG4gICAgICAgIHdlZWtEYXRlLnNldERhdGUod2Vla0RhdGUuZ2V0RGF0ZSgpIC0gKHdlZWtzIC0gaSAtIDEpICogNyk7XG4gICAgICAgIGNvbnN0IHByb2dyZXNzUGN0ID0gKGkgKyAxKSAvIHdlZWtzO1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgICAgZGF0ZTogd2Vla0RhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgICAgICAgdXNlcnNNaWdyYXRlZDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogcHJvZ3Jlc3NQY3QgKiAwLjgpLCAvLyA4MCUgY29tcGxldGlvblxuICAgICAgICAgICAgZ3JvdXBzTWlncmF0ZWQ6IE1hdGguZmxvb3IodG90YWxHcm91cHMgKiBwcm9ncmVzc1BjdCAqIDAuODUpLCAvLyA4NSUgY29tcGxldGlvblxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG59XG4vKipcbiAqIEJ1aWxkIG1pZ3JhdGlvbiBzdGF0dXMgYnJlYWtkb3duIGZyb20gc3RhdGlzdGljc1xuICogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNvbWUgZnJvbSBtaWdyYXRpb24gc3RhdGUgdHJhY2tpbmdcbiAqL1xuZnVuY3Rpb24gYnVpbGRNaWdyYXRpb25TdGF0dXMoc3RhdHMpIHtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgaWYgKHRvdGFsVXNlcnMgPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAvLyBNb2NrIHN0YXR1cyBkaXN0cmlidXRpb25cbiAgICBjb25zdCBjb21wbGV0ZWQgPSBNYXRoLmZsb29yKHRvdGFsVXNlcnMgKiAwLjgxKTtcbiAgICBjb25zdCBpblByb2dyZXNzID0gTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMik7XG4gICAgY29uc3QgZmFpbGVkID0gTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4wMyk7XG4gICAgY29uc3QgcGVuZGluZyA9IHRvdGFsVXNlcnMgLSBjb21wbGV0ZWQgLSBpblByb2dyZXNzIC0gZmFpbGVkO1xuICAgIGNvbnN0IHRvdGFsID0gdG90YWxVc2VycztcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29tcGxldGVkJyxcbiAgICAgICAgICAgIHZhbHVlOiBjb21wbGV0ZWQsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLnJvdW5kKChjb21wbGV0ZWQgLyB0b3RhbCkgKiAxMDApLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnSW4gUHJvZ3Jlc3MnLFxuICAgICAgICAgICAgdmFsdWU6IGluUHJvZ3Jlc3MsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLnJvdW5kKChpblByb2dyZXNzIC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0ZhaWxlZCcsXG4gICAgICAgICAgICB2YWx1ZTogZmFpbGVkLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoZmFpbGVkIC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BlbmRpbmcnLFxuICAgICAgICAgICAgdmFsdWU6IHBlbmRpbmcsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLnJvdW5kKChwZW5kaW5nIC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgfSxcbiAgICBdLmZpbHRlcihpdGVtID0+IGl0ZW0udmFsdWUgPiAwKTtcbn1cbmV4cG9ydCBjb25zdCB1c2VFeGVjdXRpdmVEYXNoYm9hcmRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbZGFzaGJvYXJkRGF0YSwgc2V0RGFzaGJvYXJkRGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbbGFzdFJlZnJlc2gsIHNldExhc3RSZWZyZXNoXSA9IHVzZVN0YXRlKG5ldyBEYXRlKCkpO1xuICAgIGNvbnN0IFthdXRvUmVmcmVzaCwgc2V0QXV0b1JlZnJlc2hdID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgZmV0Y2hEYXNoYm9hcmREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBHZXQgc3RhdGlzdGljcyBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2ljRW5naW5lLmdldFN0YXRpc3RpY3MoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YT8uc3RhdGlzdGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gcmVzdWx0LmRhdGEuc3RhdGlzdGljcztcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdHJlbmRzIChtb2NrIGNhbGN1bGF0aW9uIC0gaW4gcmVhbCBhcHAgd291bGQgY29tZSBmcm9tIGhpc3RvcmljYWwgZGF0YSlcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VyVHJlbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgLSA1OyAvLyAtNSUgdG8gKzE1JVxuICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwVHJlbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNSkgLSAzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFWb2x1bWVUcmVuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDI1KSAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIEVzdGltYXRlIGRhdGEgdm9sdW1lIGZyb20gbWFpbGJveCBkYXRhIChyb3VnaCBlc3RpbWF0ZSlcbiAgICAgICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgY29tZSBmcm9tIGZpbGUgc2hhcmUgZGlzY292ZXJ5XG4gICAgICAgICAgICAgICAgY29uc3QgZXN0aW1hdGVkRGF0YVZvbHVtZVRCID0gKHN0YXRzLk1haWxib3hDb3VudCB8fCAwKSAqIDAuMDA1OyAvLyBBc3N1bWUgNUdCIHBlciBtYWlsYm94IGF2Z1xuICAgICAgICAgICAgICAgIC8vIEVzdGltYXRlIHRpbWVsaW5lIGJhc2VkIG9uIGNvbXBsZXhpdHkgKHJvdWdoIGhldXJpc3RpYylcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbEVudGl0aWVzID0gKHN0YXRzLlVzZXJDb3VudCB8fCAwKSArIChzdGF0cy5Hcm91cENvdW50IHx8IDApICsgKHN0YXRzLkRldmljZUNvdW50IHx8IDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVzdGltYXRlZFRpbWVsaW5lRGF5cyA9IE1hdGguY2VpbCh0b3RhbEVudGl0aWVzIC8gMzAwKTsgLy8gQXNzdW1lIDMwMCBlbnRpdGllcyBwZXIgZGF5XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgZGVwYXJ0bWVudCBkaXN0cmlidXRpb24gZnJvbSB1c2VyIGRhdGFcbiAgICAgICAgICAgICAgICAvLyBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgYWdncmVnYXRlIHVzZXIgZGVwYXJ0bWVudCBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3QgZGVwYXJ0bWVudERpc3RyaWJ1dGlvbiA9IGJ1aWxkRGVwYXJ0bWVudERpc3RyaWJ1dGlvbihzdGF0cyk7XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgbWlncmF0aW9uIHByb2dyZXNzIHRpbWVsaW5lIChtb2NrIGRhdGEgZm9yIG5vdylcbiAgICAgICAgICAgICAgICBjb25zdCBtaWdyYXRpb25Qcm9ncmVzcyA9IGJ1aWxkTWlncmF0aW9uUHJvZ3Jlc3Moc3RhdHMpO1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIG1pZ3JhdGlvbiBzdGF0dXMgYnJlYWtkb3duIChtb2NrIGRhdGEgZm9yIG5vdylcbiAgICAgICAgICAgICAgICBjb25zdCBtaWdyYXRpb25TdGF0dXMgPSBidWlsZE1pZ3JhdGlvblN0YXR1cyhzdGF0cyk7XG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgYW5kIHN0cnVjdHVyZSB0aGUgZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGtwaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsVXNlcnM6IHN0YXRzLlVzZXJDb3VudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWxHcm91cHM6IHN0YXRzLkdyb3VwQ291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWb2x1bWVUQjogZXN0aW1hdGVkRGF0YVZvbHVtZVRCLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkVGltZWxpbmVEYXlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlclRyZW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXBUcmVuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWb2x1bWVUcmVuZCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZGVwYXJ0bWVudERpc3RyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWlncmF0aW9uUHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgIG1pZ3JhdGlvblN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgc3lzdGVtSGVhbHRoOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcHVVc2FnZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjApICsgMjAsIC8vIE1vY2sgQ1BVIHVzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1vcnlVc2FnZTogTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApICsgMzAsIC8vIE1vY2sgbWVtb3J5IHVzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrU3RhdHVzOiAnaGVhbHRoeScsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0VXBkYXRlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldERhc2hib2FyZERhdGEoZGF0YSk7XG4gICAgICAgICAgICAgICAgc2V0TGFzdFJlZnJlc2gobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggTG9naWMgRW5naW5lIHN0YXRpc3RpY3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Rhc2hib2FyZCBkYXRhIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICAgICAgICAvLyBTZXQgbW9jayBkYXRhIGZvciBkZXZlbG9wbWVudC90ZXN0aW5nXG4gICAgICAgICAgICBzZXREYXNoYm9hcmREYXRhKGdldE1vY2tEYXNoYm9hcmREYXRhKCkpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvLyBDYWxjdWxhdGUgbWlncmF0aW9uIHN0YXR1cyBicmVha2Rvd24gd2l0aCBwZXJjZW50YWdlc1xuICAgIGNvbnN0IGNhbGN1bGF0ZVN0YXR1c0JyZWFrZG93biA9IChzdGF0dXNEYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gKHN0YXR1c0RhdGEuY29tcGxldGVkIHx8IDApICsgKHN0YXR1c0RhdGEuaW5Qcm9ncmVzcyB8fCAwKSArXG4gICAgICAgICAgICAoc3RhdHVzRGF0YS5mYWlsZWQgfHwgMCkgKyAoc3RhdHVzRGF0YS5wZW5kaW5nIHx8IDApO1xuICAgICAgICBpZiAodG90YWwgPT09IDApXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHN0YXR1c0RhdGEuY29tcGxldGVkIHx8IDAsXG4gICAgICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoKHN0YXR1c0RhdGEuY29tcGxldGVkIHx8IDApIC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0luIFByb2dyZXNzJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdHVzRGF0YS5pblByb2dyZXNzIHx8IDAsXG4gICAgICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoKHN0YXR1c0RhdGEuaW5Qcm9ncmVzcyB8fCAwKSAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdGYWlsZWQnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzdGF0dXNEYXRhLmZhaWxlZCB8fCAwLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKChzdGF0dXNEYXRhLmZhaWxlZCB8fCAwKSAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdQZW5kaW5nJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdHVzRGF0YS5wZW5kaW5nIHx8IDAsXG4gICAgICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoKHN0YXR1c0RhdGEucGVuZGluZyB8fCAwKSAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLmZpbHRlcihpdGVtID0+IGl0ZW0udmFsdWUgPiAwKTtcbiAgICB9O1xuICAgIC8vIE1vY2sgZGF0YSBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgIGNvbnN0IGdldE1vY2tEYXNoYm9hcmREYXRhID0gKCkgPT4gKHtcbiAgICAgICAga3Bpczoge1xuICAgICAgICAgICAgdG90YWxVc2VyczogMTI1NDcsXG4gICAgICAgICAgICB0b3RhbEdyb3VwczogNDM4LFxuICAgICAgICAgICAgZGF0YVZvbHVtZVRCOiAyLjcsXG4gICAgICAgICAgICBlc3RpbWF0ZWRUaW1lbGluZURheXM6IDQ1LFxuICAgICAgICAgICAgdXNlclRyZW5kOiA4LjUsXG4gICAgICAgICAgICBncm91cFRyZW5kOiAzLjIsXG4gICAgICAgICAgICBkYXRhVm9sdW1lVHJlbmQ6IC0yLjEsXG4gICAgICAgIH0sXG4gICAgICAgIGRlcGFydG1lbnREaXN0cmlidXRpb246IFtcbiAgICAgICAgICAgIHsgbmFtZTogJ1NhbGVzJywgdXNlckNvdW50OiAyMzQwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdFbmdpbmVlcmluZycsIHVzZXJDb3VudDogMzEyMCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnTWFya2V0aW5nJywgdXNlckNvdW50OiAxNTYwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdIUicsIHVzZXJDb3VudDogODkwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdGaW5hbmNlJywgdXNlckNvdW50OiAxMjQwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdPcGVyYXRpb25zJywgdXNlckNvdW50OiAxODcwIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdTdXBwb3J0JywgdXNlckNvdW50OiAxNTI3IH0sXG4gICAgICAgIF0sXG4gICAgICAgIG1pZ3JhdGlvblByb2dyZXNzOiBbXG4gICAgICAgICAgICB7IGRhdGU6ICcyMDI1LTA5LTAxJywgdXNlcnNNaWdyYXRlZDogMTIwMCwgZ3JvdXBzTWlncmF0ZWQ6IDQ1IH0sXG4gICAgICAgICAgICB7IGRhdGU6ICcyMDI1LTA5LTA4JywgdXNlcnNNaWdyYXRlZDogMjgwMCwgZ3JvdXBzTWlncmF0ZWQ6IDk4IH0sXG4gICAgICAgICAgICB7IGRhdGU6ICcyMDI1LTA5LTE1JywgdXNlcnNNaWdyYXRlZDogNDUwMCwgZ3JvdXBzTWlncmF0ZWQ6IDE1NiB9LFxuICAgICAgICAgICAgeyBkYXRlOiAnMjAyNS0wOS0yMicsIHVzZXJzTWlncmF0ZWQ6IDY3MDAsIGdyb3Vwc01pZ3JhdGVkOiAyMzQgfSxcbiAgICAgICAgICAgIHsgZGF0ZTogJzIwMjUtMDktMjknLCB1c2Vyc01pZ3JhdGVkOiA4OTAwLCBncm91cHNNaWdyYXRlZDogMzEyIH0sXG4gICAgICAgICAgICB7IGRhdGU6ICcyMDI1LTEwLTAzJywgdXNlcnNNaWdyYXRlZDogMTAyMDAsIGdyb3Vwc01pZ3JhdGVkOiAzNzggfSxcbiAgICAgICAgXSxcbiAgICAgICAgbWlncmF0aW9uU3RhdHVzOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdDb21wbGV0ZWQnLCB2YWx1ZTogMTAyMDAsIHBlcmNlbnRhZ2U6IDgxIH0sXG4gICAgICAgICAgICB7IG5hbWU6ICdJbiBQcm9ncmVzcycsIHZhbHVlOiAxNTAwLCBwZXJjZW50YWdlOiAxMiB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnRmFpbGVkJywgdmFsdWU6IDM0NywgcGVyY2VudGFnZTogMyB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnUGVuZGluZycsIHZhbHVlOiA1MDAsIHBlcmNlbnRhZ2U6IDQgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc3lzdGVtSGVhbHRoOiB7XG4gICAgICAgICAgICBjcHVVc2FnZTogNDUsXG4gICAgICAgICAgICBtZW1vcnlVc2FnZTogNjIsXG4gICAgICAgICAgICBuZXR3b3JrU3RhdHVzOiAnaGVhbHRoeScsXG4gICAgICAgICAgICBsYXN0VXBkYXRlZDogbmV3IERhdGUoKSxcbiAgICAgICAgfSxcbiAgICB9KTtcbiAgICAvLyBJbml0aWFsIGxvYWRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcbiAgICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhXSk7XG4gICAgLy8gQXV0by1yZWZyZXNoIHRpbWVyXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFhdXRvUmVmcmVzaClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcbiAgICAgICAgfSwgUkVGUkVTSF9JTlRFUlZBTCk7XG4gICAgICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9LCBbYXV0b1JlZnJlc2gsIGZldGNoRGFzaGJvYXJkRGF0YV0pO1xuICAgIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGZldGNoRGFzaGJvYXJkRGF0YSgpO1xuICAgIH0sIFtmZXRjaERhc2hib2FyZERhdGFdKTtcbiAgICBjb25zdCB0b2dnbGVBdXRvUmVmcmVzaCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0QXV0b1JlZnJlc2gocHJldiA9PiAhcHJldik7XG4gICAgfSwgW10pO1xuICAgIC8vIEZvcm1hdCB0aW1lIHNpbmNlIGxhc3QgcmVmcmVzaFxuICAgIGNvbnN0IHRpbWVTaW5jZVJlZnJlc2ggPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IoKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbGFzdFJlZnJlc2guZ2V0VGltZSgpKSAvIDEwMDApO1xuICAgICAgICBpZiAoc2Vjb25kcyA8IDYwKVxuICAgICAgICAgICAgcmV0dXJuIGAke3NlY29uZHN9cyBhZ29gO1xuICAgICAgICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihzZWNvbmRzIC8gNjApO1xuICAgICAgICByZXR1cm4gYCR7bWludXRlc31tIGFnb2A7XG4gICAgfSwgW2xhc3RSZWZyZXNoXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGFzaGJvYXJkRGF0YSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgbGFzdFJlZnJlc2gsXG4gICAgICAgIHRpbWVTaW5jZVJlZnJlc2gsXG4gICAgICAgIGF1dG9SZWZyZXNoLFxuICAgICAgICBoYW5kbGVSZWZyZXNoLFxuICAgICAgICB0b2dnbGVBdXRvUmVmcmVzaCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgeyBCYXJDaGFydCwgQmFyLCBBcmVhQ2hhcnQsIEFyZWEsIFBpZUNoYXJ0LCBQaWUsIENlbGwsIFhBeGlzLCBZQXhpcywgQ2FydGVzaWFuR3JpZCwgVG9vbHRpcCwgTGVnZW5kLCBSZXNwb25zaXZlQ29udGFpbmVyLCB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IFVzZXJzLCBGb2xkZXJUcmVlLCBIYXJkRHJpdmUsIENhbGVuZGFyLCBSZWZyZXNoQ3csIENwdSwgTWVtb3J5U3RpY2ssIE5ldHdvcmsgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlRXhlY3V0aXZlRGFzaGJvYXJkTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VFeGVjdXRpdmVEYXNoYm9hcmRMb2dpYyc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5jb25zdCBLcGlDYXJkID0gKHsgdGl0bGUsIHZhbHVlLCBpY29uLCB0cmVuZCwgc3VmZml4LCAnZGF0YS1jeSc6IGRhdGFDeSB9KSA9PiB7XG4gICAgY29uc3QgaXNEYXJrTW9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBzaGFkb3ctc20gaG92ZXI6c2hhZG93LW1kIHRyYW5zaXRpb24tc2hhZG93XCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTRcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiB0aXRsZSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWJsdWUtNTAwIGRhcms6dGV4dC1ibHVlLTQwMFwiLCBjaGlsZHJlbjogaWNvbiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtYmFzZWxpbmUgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlLnRvTG9jYWxlU3RyaW5nKCkgOiB2YWx1ZSB9KSwgc3VmZml4ICYmIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHN1ZmZpeCB9KV0gfSksIHRyZW5kICE9PSB1bmRlZmluZWQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgdGV4dC1zbSBtdC0yIGZvbnQtbWVkaXVtICR7dHJlbmQgPiAwID8gJ3RleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDAnIDogdHJlbmQgPCAwID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCd9YCwgY2hpbGRyZW46IFt0cmVuZCA+IDAgPyAn4oaRJyA6IHRyZW5kIDwgMCA/ICfihpMnIDogJ+KGkicsIFwiIFwiLCBNYXRoLmFicyh0cmVuZCksIFwiJVwiXSB9KSldIH0pKTtcbn07XG4vLyBMb2FkaW5nIFNrZWxldG9uIENvbXBvbmVudFxuY29uc3QgRGFzaGJvYXJkU2tlbGV0b24gPSAoKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIHAtNiBzcGFjZS15LTYgYW5pbWF0ZS1wdWxzZVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDQpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMzIgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbLi4uQXJyYXkoNCldLm1hcCgoXywgaSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC04MCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGdcIiB9LCBpKSkpIH0pXSB9KSk7XG4vLyBDdXN0b20gVG9vbHRpcCBDb21wb25lbnRzXG5jb25zdCBDdXN0b21Ub29sdGlwID0gKHsgYWN0aXZlLCBwYXlsb2FkLCBsYWJlbCB9KSA9PiB7XG4gICAgaWYgKCFhY3RpdmUgfHwgIXBheWxvYWQgfHwgIXBheWxvYWQubGVuZ3RoKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC0zIHJvdW5kZWQtbGcgc2hhZG93LWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTJcIiwgY2hpbGRyZW46IGxhYmVsIH0pLCBwYXlsb2FkLm1hcCgoZW50cnksIGluZGV4KSA9PiAoX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBzdHlsZTogeyBjb2xvcjogZW50cnkuY29sb3IgfSwgY2hpbGRyZW46IFtlbnRyeS5uYW1lLCBcIjogXCJdIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiAoZW50cnkudmFsdWUgPz8gMCkudG9Mb2NhbGVTdHJpbmcoKSB9KV0gfSwgaW5kZXgpKSldIH0pKTtcbn07XG5jb25zdCBFeGVjdXRpdmVEYXNoYm9hcmRWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZGFzaGJvYXJkRGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgdGltZVNpbmNlUmVmcmVzaCwgYXV0b1JlZnJlc2gsIGhhbmRsZVJlZnJlc2gsIHRvZ2dsZUF1dG9SZWZyZXNoLCB9ID0gdXNlRXhlY3V0aXZlRGFzaGJvYXJkTG9naWMoKTtcbiAgICBjb25zdCBpc0RhcmtNb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZGFyaycpO1xuICAgIC8vIENoYXJ0IHRoZW1lIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBjaGFydFRoZW1lID0ge1xuICAgICAgICB0ZXh0Q29sb3I6IGlzRGFya01vZGUgPyAnI2Y5ZmFmYicgOiAnIzFmMjkzNycsXG4gICAgICAgIGdyaWRDb2xvcjogaXNEYXJrTW9kZSA/ICcjMzc0MTUxJyA6ICcjZTVlN2ViJyxcbiAgICAgICAgdG9vbHRpcEJnOiBpc0RhcmtNb2RlID8gJyMzNzQxNTEnIDogJyNmZmZmZmYnLFxuICAgIH07XG4gICAgLy8gQ29sb3IgcGFsZXR0ZSBmb3IgY2hhcnRzXG4gICAgY29uc3QgQ09MT1JTID0ge1xuICAgICAgICBwcmltYXJ5OiBpc0RhcmtNb2RlID8gJyM2MGE1ZmEnIDogJyMzYjgyZjYnLFxuICAgICAgICBzdWNjZXNzOiBpc0RhcmtNb2RlID8gJyMzNGQzOTknIDogJyMxMGI5ODEnLFxuICAgICAgICB3YXJuaW5nOiBpc0RhcmtNb2RlID8gJyNmYmJmMjQnIDogJyNmNTllMGInLFxuICAgICAgICBkYW5nZXI6IGlzRGFya01vZGUgPyAnI2Y4NzE3MScgOiAnI2VmNDQ0NCcsXG4gICAgICAgIG5ldXRyYWw6IGlzRGFya01vZGUgPyAnIzljYTNhZicgOiAnIzZiNzI4MCcsXG4gICAgfTtcbiAgICAvLyBQaWUgY2hhcnQgY29sb3JzIGZvciBtaWdyYXRpb24gc3RhdHVzXG4gICAgY29uc3QgUElFX0NPTE9SUyA9IFtDT0xPUlMuc3VjY2VzcywgQ09MT1JTLndhcm5pbmcsIENPTE9SUy5kYW5nZXIsIENPTE9SUy5uZXV0cmFsXTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiBfanN4KERhc2hib2FyZFNrZWxldG9uLCB7fSk7XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIFwiZGF0YS1jeVwiOiBcImRhc2hib2FyZC1lcnJvclwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGFzaGJvYXJkLWVycm9yXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCB0ZXh0LWxnIG1iLTRcIiwgY2hpbGRyZW46IGVycm9yIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVSZWZyZXNoLCB2YXJpYW50OiBcInByaW1hcnlcIiwgXCJkYXRhLWN5XCI6IFwicmV0cnktYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZXRyeS1idG5cIiwgY2hpbGRyZW46IFwiUmV0cnlcIiB9KV0gfSkgfSkpO1xuICAgIH1cbiAgICBpZiAoIWRhc2hib2FyZERhdGEpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTm8gZGF0YSBhdmFpbGFibGVcIiB9KSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImV4ZWN1dGl2ZS1kYXNoYm9hcmQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhlY3V0aXZlLWRhc2hib2FyZC12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBcIkV4ZWN1dGl2ZSBEYXNoYm9hcmRcIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogW1wiTGFzdCB1cGRhdGVkOiBcIiwgdGltZVNpbmNlUmVmcmVzaF0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IHRvZ2dsZUF1dG9SZWZyZXNoLCB2YXJpYW50OiBhdXRvUmVmcmVzaCA/ICdwcmltYXJ5JyA6ICdzZWNvbmRhcnknLCBzaXplOiBcInNtXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tcmVmcmVzaC10b2dnbGVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImF1dG8tcmVmcmVzaC10b2dnbGVcIiwgY2hpbGRyZW46IGF1dG9SZWZyZXNoID8gJ0F1dG8tUmVmcmVzaCBPbicgOiAnQXV0by1SZWZyZXNoIE9mZicgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZVJlZnJlc2gsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTYgc3BhY2UteS02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goS3BpQ2FyZCwgeyB0aXRsZTogXCJUb3RhbCBVc2Vyc1wiLCB2YWx1ZTogZGFzaGJvYXJkRGF0YS5rcGlzLnRvdGFsVXNlcnMsIGljb246IF9qc3goVXNlcnMsIHsgY2xhc3NOYW1lOiBcInctNiBoLTZcIiB9KSwgdHJlbmQ6IGRhc2hib2FyZERhdGEua3Bpcy51c2VyVHJlbmQsIFwiZGF0YS1jeVwiOiBcImtwaS11c2Vyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwia3BpLXVzZXJzXCIgfSksIF9qc3goS3BpQ2FyZCwgeyB0aXRsZTogXCJUb3RhbCBHcm91cHNcIiwgdmFsdWU6IGRhc2hib2FyZERhdGEua3Bpcy50b3RhbEdyb3VwcywgaWNvbjogX2pzeChGb2xkZXJUcmVlLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02XCIgfSksIHRyZW5kOiBkYXNoYm9hcmREYXRhLmtwaXMuZ3JvdXBUcmVuZCwgXCJkYXRhLWN5XCI6IFwia3BpLWdyb3Vwc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwia3BpLWdyb3Vwc1wiIH0pLCBfanN4KEtwaUNhcmQsIHsgdGl0bGU6IFwiRGF0YSBWb2x1bWVcIiwgdmFsdWU6IHR5cGVvZiBkYXNoYm9hcmREYXRhLmtwaXMuZGF0YVZvbHVtZVRCID09PSAnbnVtYmVyJyA/IGRhc2hib2FyZERhdGEua3Bpcy5kYXRhVm9sdW1lVEIudG9GaXhlZCgxKSA6ICcwJywgc3VmZml4OiBcIlRCXCIsIGljb246IF9qc3goSGFyZERyaXZlLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02XCIgfSksIHRyZW5kOiBkYXNoYm9hcmREYXRhLmtwaXMuZGF0YVZvbHVtZVRyZW5kLCBcImRhdGEtY3lcIjogXCJrcGktZGF0YS12b2x1bWVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImtwaS1kYXRhLXZvbHVtZVwiIH0pLCBfanN4KEtwaUNhcmQsIHsgdGl0bGU6IFwiRXN0LiBUaW1lbGluZVwiLCB2YWx1ZTogZGFzaGJvYXJkRGF0YS5rcGlzLmVzdGltYXRlZFRpbWVsaW5lRGF5cywgc3VmZml4OiBcImRheXNcIiwgaWNvbjogX2pzeChDYWxlbmRhciwgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCBcImRhdGEtY3lcIjogXCJrcGktdGltZWxpbmVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImtwaS10aW1lbGluZVwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJVc2VyIERpc3RyaWJ1dGlvbiBieSBEZXBhcnRtZW50XCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMzAwLCBjaGlsZHJlbjogX2pzeHMoQmFyQ2hhcnQsIHsgZGF0YTogZGFzaGJvYXJkRGF0YS5kZXBhcnRtZW50RGlzdHJpYnV0aW9uLCBjaGlsZHJlbjogW19qc3goQ2FydGVzaWFuR3JpZCwgeyBzdHJva2VEYXNoYXJyYXk6IFwiMyAzXCIsIHN0cm9rZTogY2hhcnRUaGVtZS5ncmlkQ29sb3IgfSksIF9qc3goWEF4aXMsIHsgZGF0YUtleTogXCJuYW1lXCIsIHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IsIGFuZ2xlOiAtNDUsIHRleHRBbmNob3I6IFwiZW5kXCIsIGhlaWdodDogODAsIHRpY2s6IHsgZm9udFNpemU6IDEyIH0gfSksIF9qc3goWUF4aXMsIHsgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciwgdGljazogeyBmb250U2l6ZTogMTIgfSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcInVzZXJDb3VudFwiLCBmaWxsOiBDT0xPUlMucHJpbWFyeSwgcmFkaXVzOiBbOCwgOCwgMCwgMF0sIG5hbWU6IFwiVXNlcnNcIiB9KV0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiTWlncmF0aW9uIFByb2dyZXNzIE92ZXIgVGltZVwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKEFyZWFDaGFydCwgeyBkYXRhOiBkYXNoYm9hcmREYXRhLm1pZ3JhdGlvblByb2dyZXNzLCBjaGlsZHJlbjogW19qc3hzKFwiZGVmc1wiLCB7IGNoaWxkcmVuOiBbX2pzeHMoXCJsaW5lYXJHcmFkaWVudFwiLCB7IGlkOiBcImNvbG9yVXNlcnNcIiwgeDE6IFwiMFwiLCB5MTogXCIwXCIsIHgyOiBcIjBcIiwgeTI6IFwiMVwiLCBjaGlsZHJlbjogW19qc3goXCJzdG9wXCIsIHsgb2Zmc2V0OiBcIjUlXCIsIHN0b3BDb2xvcjogQ09MT1JTLnByaW1hcnksIHN0b3BPcGFjaXR5OiAwLjggfSksIF9qc3goXCJzdG9wXCIsIHsgb2Zmc2V0OiBcIjk1JVwiLCBzdG9wQ29sb3I6IENPTE9SUy5wcmltYXJ5LCBzdG9wT3BhY2l0eTogMC4xIH0pXSB9KSwgX2pzeHMoXCJsaW5lYXJHcmFkaWVudFwiLCB7IGlkOiBcImNvbG9yR3JvdXBzXCIsIHgxOiBcIjBcIiwgeTE6IFwiMFwiLCB4MjogXCIwXCIsIHkyOiBcIjFcIiwgY2hpbGRyZW46IFtfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI1JVwiLCBzdG9wQ29sb3I6IENPTE9SUy5zdWNjZXNzLCBzdG9wT3BhY2l0eTogMC44IH0pLCBfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI5NSVcIiwgc3RvcENvbG9yOiBDT0xPUlMuc3VjY2Vzcywgc3RvcE9wYWNpdHk6IDAuMSB9KV0gfSldIH0pLCBfanN4KENhcnRlc2lhbkdyaWQsIHsgc3Ryb2tlRGFzaGFycmF5OiBcIjMgM1wiLCBzdHJva2U6IGNoYXJ0VGhlbWUuZ3JpZENvbG9yIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwiZGF0ZVwiLCBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yLCB0aWNrOiB7IGZvbnRTaXplOiAxMiB9IH0pLCBfanN4KFlBeGlzLCB7IHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IsIHRpY2s6IHsgZm9udFNpemU6IDEyIH0gfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KSwgX2pzeChMZWdlbmQsIHt9KSwgX2pzeChBcmVhLCB7IHR5cGU6IFwibW9ub3RvbmVcIiwgZGF0YUtleTogXCJ1c2Vyc01pZ3JhdGVkXCIsIHN0cm9rZTogQ09MT1JTLnByaW1hcnksIGZpbGxPcGFjaXR5OiAxLCBmaWxsOiBcInVybCgjY29sb3JVc2VycylcIiwgbmFtZTogXCJVc2VycyBNaWdyYXRlZFwiIH0pLCBfanN4KEFyZWEsIHsgdHlwZTogXCJtb25vdG9uZVwiLCBkYXRhS2V5OiBcImdyb3Vwc01pZ3JhdGVkXCIsIHN0cm9rZTogQ09MT1JTLnN1Y2Nlc3MsIGZpbGxPcGFjaXR5OiAxLCBmaWxsOiBcInVybCgjY29sb3JHcm91cHMpXCIsIG5hbWU6IFwiR3JvdXBzIE1pZ3JhdGVkXCIgfSldIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIk1pZ3JhdGlvbiBTdGF0dXMgQnJlYWtkb3duXCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMzAwLCBjaGlsZHJlbjogX2pzeHMoUGllQ2hhcnQsIHsgY2hpbGRyZW46IFtfanN4KFBpZSwgeyBkYXRhOiBkYXNoYm9hcmREYXRhLm1pZ3JhdGlvblN0YXR1cywgY3g6IFwiNTAlXCIsIGN5OiBcIjUwJVwiLCBsYWJlbExpbmU6IGZhbHNlLCBsYWJlbDogKHsgbmFtZSwgcGVyY2VudGFnZSB9KSA9PiBgJHtuYW1lfTogJHtwZXJjZW50YWdlfSVgLCBvdXRlclJhZGl1czogODAsIGZpbGw6IFwiIzg4ODRkOFwiLCBkYXRhS2V5OiBcInZhbHVlXCIsIGNoaWxkcmVuOiBkYXNoYm9hcmREYXRhLm1pZ3JhdGlvblN0YXR1cy5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3goQ2VsbCwgeyBmaWxsOiBQSUVfQ09MT1JTW2luZGV4ICUgUElFX0NPTE9SUy5sZW5ndGhdIH0sIGBjZWxsLSR7aW5kZXh9YCkpKSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pLCBfanN4KExlZ2VuZCwge30pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJTeXN0ZW0gSGVhbHRoXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDcHUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ibHVlLTUwMFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIkNQVSBVc2FnZVwiIH0pXSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogW2Rhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLmNwdVVzYWdlLCBcIiVcIl0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctZnVsbCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBoLTJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBoLTIgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tYWxsICR7ZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGguY3B1VXNhZ2UgPiA4MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXJlZC01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5jcHVVc2FnZSA+IDYwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXllbGxvdy01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLWdyZWVuLTUwMCd9YCwgc3R5bGU6IHsgd2lkdGg6IGAke2Rhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLmNwdVVzYWdlfSVgIH0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goTWVtb3J5U3RpY2ssIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1wdXJwbGUtNTAwXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IFwiTWVtb3J5IFVzYWdlXCIgfSldIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBbZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubWVtb3J5VXNhZ2UsIFwiJVwiXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy1mdWxsIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1mdWxsIGgtMlwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYGgtMiByb3VuZGVkLWZ1bGwgdHJhbnNpdGlvbi1hbGwgJHtkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5tZW1vcnlVc2FnZSA+IDgwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctcmVkLTUwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGRhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm1lbW9yeVVzYWdlID4gNjBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmcteWVsbG93LTUwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctZ3JlZW4tNTAwJ31gLCBzdHlsZTogeyB3aWR0aDogYCR7ZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubWVtb3J5VXNhZ2V9JWAgfSB9KSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KE5ldHdvcmssIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMFwiLCBjaGlsZHJlbjogXCJOZXR3b3JrIFN0YXR1c1wiIH0pXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgJHtkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5uZXR3b3JrU3RhdHVzID09PSAnaGVhbHRoeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubmV0d29ya1N0YXR1cyA9PT0gJ3dhcm5pbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ3RleHQteWVsbG93LTYwMCBkYXJrOnRleHQteWVsbG93LTQwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJ31gLCBjaGlsZHJlbjogZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubmV0d29ya1N0YXR1cy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubmV0d29ya1N0YXR1cy5zbGljZSgxKSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicHQtNCBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbXCJMYXN0IGhlYWx0aCBjaGVjazogXCIsIGRhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLmxhc3RVcGRhdGVkLnRvTG9jYWxlVGltZVN0cmluZygpXSB9KSB9KV0gfSldIH0pXSB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBFeGVjdXRpdmVEYXNoYm9hcmRWaWV3O1xuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9