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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNTMyOC4wNzBhMDg4ZTgwOGQxOTdhZDU0ZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFrRTtBQUNsRSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLHlEQUF5RDtBQUNuRSxVQUFVLCtEQUErRDtBQUN6RSxVQUFVLDZEQUE2RDtBQUN2RSxVQUFVLHNEQUFzRDtBQUNoRSxVQUFVLDJEQUEyRDtBQUNyRSxVQUFVLDhEQUE4RDtBQUN4RSxVQUFVLDJEQUEyRDtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixXQUFXO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDTztBQUNQLDhDQUE4QyxrQkFBUTtBQUN0RCxzQ0FBc0Msa0JBQVE7QUFDOUMsOEJBQThCLGtCQUFRO0FBQ3RDLDBDQUEwQyxrQkFBUTtBQUNsRCwwQ0FBMEMsa0JBQVE7QUFDbEQsK0JBQStCLHFCQUFXO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0U7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBLDhFQUE4RTtBQUM5RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsY0FBYyxnQ0FBZ0M7QUFDOUMsY0FBYyxzQ0FBc0M7QUFDcEQsY0FBYyxvQ0FBb0M7QUFDbEQsY0FBYyw0QkFBNEI7QUFDMUMsY0FBYyxrQ0FBa0M7QUFDaEQsY0FBYyxxQ0FBcUM7QUFDbkQsY0FBYyxrQ0FBa0M7QUFDaEQ7QUFDQTtBQUNBLGNBQWMsNkRBQTZEO0FBQzNFLGNBQWMsNkRBQTZEO0FBQzNFLGNBQWMsOERBQThEO0FBQzVFLGNBQWMsOERBQThEO0FBQzVFLGNBQWMsOERBQThEO0FBQzVFLGNBQWMsK0RBQStEO0FBQzdFO0FBQ0E7QUFDQSxjQUFjLGlEQUFpRDtBQUMvRCxjQUFjLGtEQUFrRDtBQUNoRSxjQUFjLDJDQUEyQztBQUN6RCxjQUFjLDRDQUE0QztBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsSUFBSSxtQkFBUztBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxtQkFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMLDBCQUEwQixxQkFBVztBQUNyQztBQUNBLEtBQUs7QUFDTCw4QkFBOEIscUJBQVc7QUFDekM7QUFDQSxLQUFLO0FBQ0w7QUFDQSw2QkFBNkIsaUJBQU87QUFDcEM7QUFDQTtBQUNBLHNCQUFzQixRQUFRO0FBQzlCO0FBQ0Esa0JBQWtCLFFBQVE7QUFDMUIsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbFErRDtBQUNvRjtBQUN2QztBQUN4QjtBQUM3QjtBQUN2RCxtQkFBbUIsc0RBQXNEO0FBQ3pFO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLDZLQUE2SyxvQkFBSyxVQUFVLGdFQUFnRSxtQkFBSSxXQUFXLG9GQUFvRixHQUFHLG1CQUFJLFVBQVUsK0RBQStELElBQUksR0FBRyxvQkFBSyxVQUFVLG1EQUFtRCxtQkFBSSxVQUFVLHdJQUF3SSxhQUFhLG1CQUFJLFdBQVcseUVBQXlFLElBQUksMkJBQTJCLG9CQUFLLFVBQVUsdUNBQXVDLGtIQUFrSCxtRkFBbUYsS0FBSztBQUM3aUM7QUFDQTtBQUNBLGlDQUFpQyxvQkFBSyxVQUFVLDREQUE0RCxtQkFBSSxVQUFVLDBHQUEwRyxtQkFBSSxVQUFVLDJEQUEyRCxRQUFRLEdBQUcsbUJBQUksVUFBVSwyRkFBMkYsbUJBQUksVUFBVSwyREFBMkQsUUFBUSxJQUFJO0FBQ3RmO0FBQ0EseUJBQXlCLHdCQUF3QjtBQUNqRDtBQUNBO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLHdIQUF3SCxtQkFBSSxRQUFRLHlGQUF5RixrQ0FBa0Msb0JBQUssUUFBUSxrRUFBa0Usb0JBQUssV0FBVyxTQUFTLG9CQUFvQixnQ0FBZ0MsR0FBRyxtQkFBSSxXQUFXLDJFQUEyRSxJQUFJLGFBQWE7QUFDcGlCO0FBQ0E7QUFDQSxZQUFZLG9HQUFvRyxFQUFFLDBCQUEwQjtBQUM1STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFJLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0EsZ0JBQWdCLG1CQUFJLFVBQVUsZ0lBQWdJLG9CQUFLLFVBQVUscUNBQXFDLG1CQUFJLFFBQVEsMkVBQTJFLEdBQUcsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLG1IQUFtSCxJQUFJLEdBQUc7QUFDcmI7QUFDQTtBQUNBLGdCQUFnQixtQkFBSSxVQUFVLGdFQUFnRSxtQkFBSSxRQUFRLDhFQUE4RSxHQUFHO0FBQzNMO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLDRKQUE0SixvQkFBSyxVQUFVLHVJQUF1SSxvQkFBSyxVQUFVLFdBQVcsbUJBQUksU0FBUyxtR0FBbUcsR0FBRyxvQkFBSyxRQUFRLDRHQUE0RyxJQUFJLEdBQUcsb0JBQUssVUFBVSxpREFBaUQsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLGdPQUFnTyxHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxnRUFBZ0UsbUJBQUksQ0FBQywrQkFBUyxJQUFJLHNCQUFzQixnRkFBZ0YsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSw0REFBNEQsb0JBQUssVUFBVSw4RUFBOEUsbUJBQUksWUFBWSxrRUFBa0UsbUJBQUksQ0FBQywyQkFBSyxJQUFJLHNCQUFzQiw0RkFBNEYsR0FBRyxtQkFBSSxZQUFZLG9FQUFvRSxtQkFBSSxDQUFDLGdDQUFVLElBQUksc0JBQXNCLCtGQUErRixHQUFHLG1CQUFJLFlBQVkseUpBQXlKLG1CQUFJLENBQUMsK0JBQVMsSUFBSSxzQkFBc0IsOEdBQThHLEdBQUcsbUJBQUksWUFBWSwrRkFBK0YsbUJBQUksQ0FBQyw4QkFBUSxJQUFJLHNCQUFzQiw2REFBNkQsSUFBSSxHQUFHLG9CQUFLLFVBQVUsK0RBQStELG9CQUFLLFVBQVUsOEdBQThHLG1CQUFJLFNBQVMsdUhBQXVILEdBQUcsbUJBQUksQ0FBQywrQkFBbUIsSUFBSSxzQ0FBc0Msb0JBQUssQ0FBQyxvQkFBUSxJQUFJLHVEQUF1RCxtQkFBSSxDQUFDLHlCQUFhLElBQUksc0RBQXNELEdBQUcsbUJBQUksQ0FBQyxpQkFBSyxJQUFJLGtHQUFrRyxnQkFBZ0IsR0FBRyxtQkFBSSxDQUFDLGlCQUFLLElBQUksc0NBQXNDLGdCQUFnQixHQUFHLG1CQUFJLENBQUMsbUJBQU8sSUFBSSxTQUFTLG1CQUFJLGtCQUFrQixHQUFHLEdBQUcsbUJBQUksQ0FBQyxlQUFHLElBQUksaUZBQWlGLElBQUksR0FBRyxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsbUJBQUksU0FBUyxvSEFBb0gsR0FBRyxtQkFBSSxDQUFDLCtCQUFtQixJQUFJLHNDQUFzQyxvQkFBSyxDQUFDLHFCQUFTLElBQUksa0RBQWtELG9CQUFLLFdBQVcsV0FBVyxvQkFBSyxxQkFBcUIsaUVBQWlFLG1CQUFJLFdBQVcsMkRBQTJELEdBQUcsbUJBQUksV0FBVyw0REFBNEQsSUFBSSxHQUFHLG9CQUFLLHFCQUFxQixrRUFBa0UsbUJBQUksV0FBVywyREFBMkQsR0FBRyxtQkFBSSxXQUFXLDREQUE0RCxJQUFJLElBQUksR0FBRyxtQkFBSSxDQUFDLHlCQUFhLElBQUksc0RBQXNELEdBQUcsbUJBQUksQ0FBQyxpQkFBSyxJQUFJLHVEQUF1RCxnQkFBZ0IsR0FBRyxtQkFBSSxDQUFDLGlCQUFLLElBQUksc0NBQXNDLGdCQUFnQixHQUFHLG1CQUFJLENBQUMsbUJBQU8sSUFBSSxTQUFTLG1CQUFJLGtCQUFrQixHQUFHLEdBQUcsbUJBQUksQ0FBQyxrQkFBTSxJQUFJLEdBQUcsbUJBQUksQ0FBQyxnQkFBSSxJQUFJLHNJQUFzSSxHQUFHLG1CQUFJLENBQUMsZ0JBQUksSUFBSSx5SUFBeUksSUFBSSxHQUFHLElBQUksR0FBRyxvQkFBSyxVQUFVLDhHQUE4RyxtQkFBSSxTQUFTLGtIQUFrSCxHQUFHLG1CQUFJLENBQUMsK0JBQW1CLElBQUksc0NBQXNDLG9CQUFLLENBQUMsb0JBQVEsSUFBSSxXQUFXLG1CQUFJLENBQUMsZUFBRyxJQUFJLHVGQUF1RixrQkFBa0IsUUFBUSxLQUFLLElBQUksV0FBVyx1SEFBdUgsbUJBQUksQ0FBQyxnQkFBSSxJQUFJLDZDQUE2QyxVQUFVLE1BQU0sTUFBTSxHQUFHLG1CQUFJLENBQUMsbUJBQU8sSUFBSSxTQUFTLG1CQUFJLGtCQUFrQixHQUFHLEdBQUcsbUJBQUksQ0FBQyxrQkFBTSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsbUJBQUksU0FBUyxxR0FBcUcsR0FBRyxvQkFBSyxVQUFVLG1DQUFtQyxvQkFBSyxVQUFVLFdBQVcsb0JBQUssVUFBVSxnRUFBZ0Usb0JBQUssVUFBVSxpREFBaUQsbUJBQUksQ0FBQyx3QkFBRyxJQUFJLG9DQUFvQyxHQUFHLG1CQUFJLFdBQVcsMEZBQTBGLElBQUksR0FBRyxvQkFBSyxXQUFXLDJIQUEySCxJQUFJLEdBQUcsbUJBQUksVUFBVSw2RUFBNkUsbUJBQUksVUFBVSw4Q0FBOEM7QUFDM3hNO0FBQ0E7QUFDQTtBQUNBLHFGQUFxRixZQUFZLFVBQVUsb0NBQW9DLE1BQU0sR0FBRyxJQUFJLEdBQUcsb0JBQUssVUFBVSxXQUFXLG9CQUFLLFVBQVUsZ0VBQWdFLG9CQUFLLFVBQVUsaURBQWlELG1CQUFJLENBQUMsaUNBQVcsSUFBSSxzQ0FBc0MsR0FBRyxtQkFBSSxXQUFXLDZGQUE2RixJQUFJLEdBQUcsb0JBQUssV0FBVyw4SEFBOEgsSUFBSSxHQUFHLG1CQUFJLFVBQVUsNkVBQTZFLG1CQUFJLFVBQVUsOENBQThDO0FBQ3B5QjtBQUNBO0FBQ0E7QUFDQSxxRkFBcUYsWUFBWSxVQUFVLHVDQUF1QyxNQUFNLEdBQUcsSUFBSSxHQUFHLG1CQUFJLFVBQVUsVUFBVSxvQkFBSyxVQUFVLDJEQUEyRCxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxDQUFDLDZCQUFPLElBQUkscUNBQXFDLEdBQUcsbUJBQUksV0FBVywrRkFBK0YsSUFBSSxHQUFHLG1CQUFJLFdBQVcsb0NBQW9DO0FBQ3BpQjtBQUNBO0FBQ0E7QUFDQSx1R0FBdUc7QUFDdkcsbUhBQW1ILElBQUksR0FBRyxHQUFHLG1CQUFJLFVBQVUsMkVBQTJFLG9CQUFLLFFBQVEsdUpBQXVKLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ2paO0FBQ0EsdUVBQWUsc0JBQXNCLEVBQUM7Ozs7Ozs7O0FDNUR0QyxlOzs7Ozs7O0FDQUEsZSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUV4ZWN1dGl2ZURhc2hib2FyZExvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FuYWx5dGljcy9FeGVjdXRpdmVEYXNoYm9hcmRWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEQ6XFxTY3JpcHRzXFxVc2VyTWFuZEFcXGd1aXYyXFxub2RlX21vZHVsZXNcXGVzLXRvb2xraXRcXGRpc3RcXHByZWRpY2F0ZXxwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5jb25zdCBSRUZSRVNIX0lOVEVSVkFMID0gMzAwMDA7IC8vIDMwIHNlY29uZHNcbi8qKlxuICogQnVpbGQgZGVwYXJ0bWVudCBkaXN0cmlidXRpb24gZnJvbSBzdGF0aXN0aWNzXG4gKiBJbiBhIHJlYWwgaW1wbGVtZW50YXRpb24sIHRoaXMgd291bGQgYWdncmVnYXRlIGFjdHVhbCB1c2VyIGRlcGFydG1lbnQgZGF0YVxuICovXG5mdW5jdGlvbiBidWlsZERlcGFydG1lbnREaXN0cmlidXRpb24oc3RhdHMpIHtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgaWYgKHRvdGFsVXNlcnMgPT09IDApXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAvLyBNb2NrIGRpc3RyaWJ1dGlvbiBwZXJjZW50YWdlcyAtIGluIHJlYWxpdHkgdGhpcyB3b3VsZCBjb21lIGZyb20gQ1NWIGRhdGFcbiAgICByZXR1cm4gW1xuICAgICAgICB7IG5hbWU6ICdTYWxlcycsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xOCkgfSxcbiAgICAgICAgeyBuYW1lOiAnRW5naW5lZXJpbmcnLCB1c2VyQ291bnQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMjUpIH0sXG4gICAgICAgIHsgbmFtZTogJ01hcmtldGluZycsIHVzZXJDb3VudDogTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC4xMikgfSxcbiAgICAgICAgeyBuYW1lOiAnSFInLCB1c2VyQ291bnQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMDcpIH0sXG4gICAgICAgIHsgbmFtZTogJ0ZpbmFuY2UnLCB1c2VyQ291bnQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTApIH0sXG4gICAgICAgIHsgbmFtZTogJ09wZXJhdGlvbnMnLCB1c2VyQ291bnQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTUpIH0sXG4gICAgICAgIHsgbmFtZTogJ1N1cHBvcnQnLCB1c2VyQ291bnQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTMpIH0sXG4gICAgXTtcbn1cbi8qKlxuICogQnVpbGQgbWlncmF0aW9uIHByb2dyZXNzIHRpbWVsaW5lIGZyb20gc3RhdGlzdGljc1xuICogSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNvbWUgZnJvbSBtaWdyYXRpb24gdHJhY2tpbmcgZGF0YVxuICovXG5mdW5jdGlvbiBidWlsZE1pZ3JhdGlvblByb2dyZXNzKHN0YXRzKSB7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHN0YXRzLlVzZXJDb3VudCB8fCAwO1xuICAgIGNvbnN0IHRvdGFsR3JvdXBzID0gc3RhdHMuR3JvdXBDb3VudCB8fCAwO1xuICAgIC8vIE1vY2sgNi13ZWVrIG1pZ3JhdGlvbiB0aW1lbGluZVxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3Qgd2Vla3MgPSA2O1xuICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdlZWtzOyBpKyspIHtcbiAgICAgICAgY29uc3Qgd2Vla0RhdGUgPSBuZXcgRGF0ZShub3cpO1xuICAgICAgICB3ZWVrRGF0ZS5zZXREYXRlKHdlZWtEYXRlLmdldERhdGUoKSAtICh3ZWVrcyAtIGkgLSAxKSAqIDcpO1xuICAgICAgICBjb25zdCBwcm9ncmVzc1BjdCA9IChpICsgMSkgLyB3ZWVrcztcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICAgIGRhdGU6IHdlZWtEYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgICAgIHVzZXJzTWlncmF0ZWQ6IE1hdGguZmxvb3IodG90YWxVc2VycyAqIHByb2dyZXNzUGN0ICogMC44KSwgLy8gODAlIGNvbXBsZXRpb25cbiAgICAgICAgICAgIGdyb3Vwc01pZ3JhdGVkOiBNYXRoLmZsb29yKHRvdGFsR3JvdXBzICogcHJvZ3Jlc3NQY3QgKiAwLjg1KSwgLy8gODUlIGNvbXBsZXRpb25cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufVxuLyoqXG4gKiBCdWlsZCBtaWdyYXRpb24gc3RhdHVzIGJyZWFrZG93biBmcm9tIHN0YXRpc3RpY3NcbiAqIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBjb21lIGZyb20gbWlncmF0aW9uIHN0YXRlIHRyYWNraW5nXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTWlncmF0aW9uU3RhdHVzKHN0YXRzKSB7XG4gICAgY29uc3QgdG90YWxVc2VycyA9IHN0YXRzLlVzZXJDb3VudCB8fCAwO1xuICAgIGlmICh0b3RhbFVzZXJzID09PSAwKVxuICAgICAgICByZXR1cm4gW107XG4gICAgLy8gTW9jayBzdGF0dXMgZGlzdHJpYnV0aW9uXG4gICAgY29uc3QgY29tcGxldGVkID0gTWF0aC5mbG9vcih0b3RhbFVzZXJzICogMC44MSk7XG4gICAgY29uc3QgaW5Qcm9ncmVzcyA9IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMTIpO1xuICAgIGNvbnN0IGZhaWxlZCA9IE1hdGguZmxvb3IodG90YWxVc2VycyAqIDAuMDMpO1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0b3RhbFVzZXJzIC0gY29tcGxldGVkIC0gaW5Qcm9ncmVzcyAtIGZhaWxlZDtcbiAgICBjb25zdCB0b3RhbCA9IHRvdGFsVXNlcnM7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICB2YWx1ZTogY29tcGxldGVkLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoY29tcGxldGVkIC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ0luIFByb2dyZXNzJyxcbiAgICAgICAgICAgIHZhbHVlOiBpblByb2dyZXNzLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoaW5Qcm9ncmVzcyAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdGYWlsZWQnLFxuICAgICAgICAgICAgdmFsdWU6IGZhaWxlZCxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKGZhaWxlZCAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQZW5kaW5nJyxcbiAgICAgICAgICAgIHZhbHVlOiBwZW5kaW5nLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgocGVuZGluZyAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgIH0sXG4gICAgXS5maWx0ZXIoaXRlbSA9PiBpdGVtLnZhbHVlID4gMCk7XG59XG5leHBvcnQgY29uc3QgdXNlRXhlY3V0aXZlRGFzaGJvYXJkTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2Rhc2hib2FyZERhdGEsIHNldERhc2hib2FyZERhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2xhc3RSZWZyZXNoLCBzZXRMYXN0UmVmcmVzaF0gPSB1c2VTdGF0ZShuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBbYXV0b1JlZnJlc2gsIHNldEF1dG9SZWZyZXNoXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IGZldGNoRGFzaGJvYXJkRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgLy8gR2V0IHN0YXRpc3RpY3MgZnJvbSBMb2dpYyBFbmdpbmVcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5sb2dpY0VuZ2luZS5nZXRTdGF0aXN0aWNzKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGE/LnN0YXRpc3RpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IHJlc3VsdC5kYXRhLnN0YXRpc3RpY3M7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRyZW5kcyAobW9jayBjYWxjdWxhdGlvbiAtIGluIHJlYWwgYXBwIHdvdWxkIGNvbWUgZnJvbSBoaXN0b3JpY2FsIGRhdGEpXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlclRyZW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApIC0gNTsgLy8gLTUlIHRvICsxNSVcbiAgICAgICAgICAgICAgICBjb25zdCBncm91cFRyZW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTUpIC0gMztcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhVm9sdW1lVHJlbmQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNSkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyBFc3RpbWF0ZSBkYXRhIHZvbHVtZSBmcm9tIG1haWxib3ggZGF0YSAocm91Z2ggZXN0aW1hdGUpXG4gICAgICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGNvbWUgZnJvbSBmaWxlIHNoYXJlIGRpc2NvdmVyeVxuICAgICAgICAgICAgICAgIGNvbnN0IGVzdGltYXRlZERhdGFWb2x1bWVUQiA9IChzdGF0cy5NYWlsYm94Q291bnQgfHwgMCkgKiAwLjAwNTsgLy8gQXNzdW1lIDVHQiBwZXIgbWFpbGJveCBhdmdcbiAgICAgICAgICAgICAgICAvLyBFc3RpbWF0ZSB0aW1lbGluZSBiYXNlZCBvbiBjb21wbGV4aXR5IChyb3VnaCBoZXVyaXN0aWMpXG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxFbnRpdGllcyA9IChzdGF0cy5Vc2VyQ291bnQgfHwgMCkgKyAoc3RhdHMuR3JvdXBDb3VudCB8fCAwKSArIChzdGF0cy5EZXZpY2VDb3VudCB8fCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBlc3RpbWF0ZWRUaW1lbGluZURheXMgPSBNYXRoLmNlaWwodG90YWxFbnRpdGllcyAvIDMwMCk7IC8vIEFzc3VtZSAzMDAgZW50aXRpZXMgcGVyIGRheVxuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIGRlcGFydG1lbnQgZGlzdHJpYnV0aW9uIGZyb20gdXNlciBkYXRhXG4gICAgICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIGFnZ3JlZ2F0ZSB1c2VyIGRlcGFydG1lbnQgZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IGRlcGFydG1lbnREaXN0cmlidXRpb24gPSBidWlsZERlcGFydG1lbnREaXN0cmlidXRpb24oc3RhdHMpO1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIG1pZ3JhdGlvbiBwcm9ncmVzcyB0aW1lbGluZSAobW9jayBkYXRhIGZvciBub3cpXG4gICAgICAgICAgICAgICAgY29uc3QgbWlncmF0aW9uUHJvZ3Jlc3MgPSBidWlsZE1pZ3JhdGlvblByb2dyZXNzKHN0YXRzKTtcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCBtaWdyYXRpb24gc3RhdHVzIGJyZWFrZG93biAobW9jayBkYXRhIGZvciBub3cpXG4gICAgICAgICAgICAgICAgY29uc3QgbWlncmF0aW9uU3RhdHVzID0gYnVpbGRNaWdyYXRpb25TdGF0dXMoc3RhdHMpO1xuICAgICAgICAgICAgICAgIC8vIFBhcnNlIGFuZCBzdHJ1Y3R1cmUgdGhlIGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBrcGlzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFVzZXJzOiBzdGF0cy5Vc2VyQ291bnQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsR3JvdXBzOiBzdGF0cy5Hcm91cENvdW50IHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVm9sdW1lVEI6IGVzdGltYXRlZERhdGFWb2x1bWVUQixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZFRpbWVsaW5lRGF5cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJUcmVuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwVHJlbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVm9sdW1lVHJlbmQsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGRlcGFydG1lbnREaXN0cmlidXRpb24sXG4gICAgICAgICAgICAgICAgICAgIG1pZ3JhdGlvblByb2dyZXNzLFxuICAgICAgICAgICAgICAgICAgICBtaWdyYXRpb25TdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIHN5c3RlbUhlYWx0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3B1VXNhZ2U6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYwKSArIDIwLCAvLyBNb2NrIENQVSB1c2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVtb3J5VXNhZ2U6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDUwKSArIDMwLCAvLyBNb2NrIG1lbW9yeSB1c2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXR1czogJ2hlYWx0aHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXREYXNoYm9hcmREYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgIHNldExhc3RSZWZyZXNoKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdEYXNoYm9hcmQgZGF0YSBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgLy8gU2V0IG1vY2sgZGF0YSBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgICAgICAgICAgc2V0RGFzaGJvYXJkRGF0YShnZXRNb2NrRGFzaGJvYXJkRGF0YSgpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgLy8gQ2FsY3VsYXRlIG1pZ3JhdGlvbiBzdGF0dXMgYnJlYWtkb3duIHdpdGggcGVyY2VudGFnZXNcbiAgICBjb25zdCBjYWxjdWxhdGVTdGF0dXNCcmVha2Rvd24gPSAoc3RhdHVzRGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbCA9IChzdGF0dXNEYXRhLmNvbXBsZXRlZCB8fCAwKSArIChzdGF0dXNEYXRhLmluUHJvZ3Jlc3MgfHwgMCkgK1xuICAgICAgICAgICAgKHN0YXR1c0RhdGEuZmFpbGVkIHx8IDApICsgKHN0YXR1c0RhdGEucGVuZGluZyB8fCAwKTtcbiAgICAgICAgaWYgKHRvdGFsID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdDb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzdGF0dXNEYXRhLmNvbXBsZXRlZCB8fCAwLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKChzdGF0dXNEYXRhLmNvbXBsZXRlZCB8fCAwKSAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdJbiBQcm9ncmVzcycsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHN0YXR1c0RhdGEuaW5Qcm9ncmVzcyB8fCAwLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKChzdGF0dXNEYXRhLmluUHJvZ3Jlc3MgfHwgMCkgLyB0b3RhbCkgKiAxMDApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnRmFpbGVkJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdHVzRGF0YS5mYWlsZWQgfHwgMCxcbiAgICAgICAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLnJvdW5kKCgoc3RhdHVzRGF0YS5mYWlsZWQgfHwgMCkgLyB0b3RhbCkgKiAxMDApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnUGVuZGluZycsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHN0YXR1c0RhdGEucGVuZGluZyB8fCAwLFxuICAgICAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKChzdGF0dXNEYXRhLnBlbmRpbmcgfHwgMCkgLyB0b3RhbCkgKiAxMDApLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXS5maWx0ZXIoaXRlbSA9PiBpdGVtLnZhbHVlID4gMCk7XG4gICAgfTtcbiAgICAvLyBNb2NrIGRhdGEgZm9yIGRldmVsb3BtZW50L3Rlc3RpbmdcbiAgICBjb25zdCBnZXRNb2NrRGFzaGJvYXJkRGF0YSA9ICgpID0+ICh7XG4gICAgICAgIGtwaXM6IHtcbiAgICAgICAgICAgIHRvdGFsVXNlcnM6IDEyNTQ3LFxuICAgICAgICAgICAgdG90YWxHcm91cHM6IDQzOCxcbiAgICAgICAgICAgIGRhdGFWb2x1bWVUQjogMi43LFxuICAgICAgICAgICAgZXN0aW1hdGVkVGltZWxpbmVEYXlzOiA0NSxcbiAgICAgICAgICAgIHVzZXJUcmVuZDogOC41LFxuICAgICAgICAgICAgZ3JvdXBUcmVuZDogMy4yLFxuICAgICAgICAgICAgZGF0YVZvbHVtZVRyZW5kOiAtMi4xLFxuICAgICAgICB9LFxuICAgICAgICBkZXBhcnRtZW50RGlzdHJpYnV0aW9uOiBbXG4gICAgICAgICAgICB7IG5hbWU6ICdTYWxlcycsIHVzZXJDb3VudDogMjM0MCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnRW5naW5lZXJpbmcnLCB1c2VyQ291bnQ6IDMxMjAgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ01hcmtldGluZycsIHVzZXJDb3VudDogMTU2MCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnSFInLCB1c2VyQ291bnQ6IDg5MCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnRmluYW5jZScsIHVzZXJDb3VudDogMTI0MCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnT3BlcmF0aW9ucycsIHVzZXJDb3VudDogMTg3MCB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnU3VwcG9ydCcsIHVzZXJDb3VudDogMTUyNyB9LFxuICAgICAgICBdLFxuICAgICAgICBtaWdyYXRpb25Qcm9ncmVzczogW1xuICAgICAgICAgICAgeyBkYXRlOiAnMjAyNS0wOS0wMScsIHVzZXJzTWlncmF0ZWQ6IDEyMDAsIGdyb3Vwc01pZ3JhdGVkOiA0NSB9LFxuICAgICAgICAgICAgeyBkYXRlOiAnMjAyNS0wOS0wOCcsIHVzZXJzTWlncmF0ZWQ6IDI4MDAsIGdyb3Vwc01pZ3JhdGVkOiA5OCB9LFxuICAgICAgICAgICAgeyBkYXRlOiAnMjAyNS0wOS0xNScsIHVzZXJzTWlncmF0ZWQ6IDQ1MDAsIGdyb3Vwc01pZ3JhdGVkOiAxNTYgfSxcbiAgICAgICAgICAgIHsgZGF0ZTogJzIwMjUtMDktMjInLCB1c2Vyc01pZ3JhdGVkOiA2NzAwLCBncm91cHNNaWdyYXRlZDogMjM0IH0sXG4gICAgICAgICAgICB7IGRhdGU6ICcyMDI1LTA5LTI5JywgdXNlcnNNaWdyYXRlZDogODkwMCwgZ3JvdXBzTWlncmF0ZWQ6IDMxMiB9LFxuICAgICAgICAgICAgeyBkYXRlOiAnMjAyNS0xMC0wMycsIHVzZXJzTWlncmF0ZWQ6IDEwMjAwLCBncm91cHNNaWdyYXRlZDogMzc4IH0sXG4gICAgICAgIF0sXG4gICAgICAgIG1pZ3JhdGlvblN0YXR1czogW1xuICAgICAgICAgICAgeyBuYW1lOiAnQ29tcGxldGVkJywgdmFsdWU6IDEwMjAwLCBwZXJjZW50YWdlOiA4MSB9LFxuICAgICAgICAgICAgeyBuYW1lOiAnSW4gUHJvZ3Jlc3MnLCB2YWx1ZTogMTUwMCwgcGVyY2VudGFnZTogMTIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ0ZhaWxlZCcsIHZhbHVlOiAzNDcsIHBlcmNlbnRhZ2U6IDMgfSxcbiAgICAgICAgICAgIHsgbmFtZTogJ1BlbmRpbmcnLCB2YWx1ZTogNTAwLCBwZXJjZW50YWdlOiA0IH0sXG4gICAgICAgIF0sXG4gICAgICAgIHN5c3RlbUhlYWx0aDoge1xuICAgICAgICAgICAgY3B1VXNhZ2U6IDQ1LFxuICAgICAgICAgICAgbWVtb3J5VXNhZ2U6IDYyLFxuICAgICAgICAgICAgbmV0d29ya1N0YXR1czogJ2hlYWx0aHknLFxuICAgICAgICAgICAgbGFzdFVwZGF0ZWQ6IG5ldyBEYXRlKCksXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgLy8gSW5pdGlhbCBsb2FkXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XG4gICAgfSwgW2ZldGNoRGFzaGJvYXJkRGF0YV0pO1xuICAgIC8vIEF1dG8tcmVmcmVzaCB0aW1lclxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghYXV0b1JlZnJlc2gpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgZmV0Y2hEYXNoYm9hcmREYXRhKCk7XG4gICAgICAgIH0sIFJFRlJFU0hfSU5URVJWQUwpO1xuICAgICAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgfSwgW2F1dG9SZWZyZXNoLCBmZXRjaERhc2hib2FyZERhdGFdKTtcbiAgICBjb25zdCBoYW5kbGVSZWZyZXNoID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBmZXRjaERhc2hib2FyZERhdGEoKTtcbiAgICB9LCBbZmV0Y2hEYXNoYm9hcmREYXRhXSk7XG4gICAgY29uc3QgdG9nZ2xlQXV0b1JlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEF1dG9SZWZyZXNoKHByZXYgPT4gIXByZXYpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBGb3JtYXQgdGltZSBzaW5jZSBsYXN0IHJlZnJlc2hcbiAgICBjb25zdCB0aW1lU2luY2VSZWZyZXNoID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlY29uZHMgPSBNYXRoLmZsb29yKChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxhc3RSZWZyZXNoLmdldFRpbWUoKSkgLyAxMDAwKTtcbiAgICAgICAgaWYgKHNlY29uZHMgPCA2MClcbiAgICAgICAgICAgIHJldHVybiBgJHtzZWNvbmRzfXMgYWdvYDtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3Ioc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgcmV0dXJuIGAke21pbnV0ZXN9bSBhZ29gO1xuICAgIH0sIFtsYXN0UmVmcmVzaF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRhc2hib2FyZERhdGEsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGxhc3RSZWZyZXNoLFxuICAgICAgICB0aW1lU2luY2VSZWZyZXNoLFxuICAgICAgICBhdXRvUmVmcmVzaCxcbiAgICAgICAgaGFuZGxlUmVmcmVzaCxcbiAgICAgICAgdG9nZ2xlQXV0b1JlZnJlc2gsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IHsgQmFyQ2hhcnQsIEJhciwgQXJlYUNoYXJ0LCBBcmVhLCBQaWVDaGFydCwgUGllLCBDZWxsLCBYQXhpcywgWUF4aXMsIENhcnRlc2lhbkdyaWQsIFRvb2x0aXAsIExlZ2VuZCwgUmVzcG9uc2l2ZUNvbnRhaW5lciwgfSBmcm9tICdyZWNoYXJ0cyc7XG5pbXBvcnQgeyBVc2VycywgRm9sZGVyVHJlZSwgSGFyZERyaXZlLCBDYWxlbmRhciwgUmVmcmVzaEN3LCBDcHUsIE1lbW9yeVN0aWNrLCBOZXR3b3JrIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUV4ZWN1dGl2ZURhc2hib2FyZExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlRXhlY3V0aXZlRGFzaGJvYXJkTG9naWMnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuY29uc3QgS3BpQ2FyZCA9ICh7IHRpdGxlLCB2YWx1ZSwgaWNvbiwgdHJlbmQsIHN1ZmZpeCwgJ2RhdGEtY3knOiBkYXRhQ3kgfSkgPT4ge1xuICAgIGNvbnN0IGlzRGFya01vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1tZCB0cmFuc2l0aW9uLXNoYWRvd1wiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00XCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogdGl0bGUgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ibHVlLTUwMCBkYXJrOnRleHQtYmx1ZS00MDBcIiwgY2hpbGRyZW46IGljb24gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWJhc2VsaW5lIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZS50b0xvY2FsZVN0cmluZygpIDogdmFsdWUgfSksIHN1ZmZpeCAmJiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBzdWZmaXggfSldIH0pLCB0cmVuZCAhPT0gdW5kZWZpbmVkICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogYHRleHQtc20gbXQtMiBmb250LW1lZGl1bSAke3RyZW5kID4gMCA/ICd0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwJyA6IHRyZW5kIDwgMCA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAnfWAsIGNoaWxkcmVuOiBbdHJlbmQgPiAwID8gJ+KGkScgOiB0cmVuZCA8IDAgPyAn4oaTJyA6ICfihpInLCBcIiBcIiwgTWF0aC5hYnModHJlbmQpLCBcIiVcIl0gfSkpXSB9KSk7XG59O1xuLy8gTG9hZGluZyBTa2VsZXRvbiBDb21wb25lbnRcbmNvbnN0IERhc2hib2FyZFNrZWxldG9uID0gKCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBwLTYgc3BhY2UteS02IGFuaW1hdGUtcHVsc2VcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFsuLi5BcnJheSg0KV0ubWFwKChfLCBpKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTMyIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZ1wiIH0sIGkpKSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDQpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtODAgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KV0gfSkpO1xuLy8gQ3VzdG9tIFRvb2x0aXAgQ29tcG9uZW50c1xuY29uc3QgQ3VzdG9tVG9vbHRpcCA9ICh7IGFjdGl2ZSwgcGF5bG9hZCwgbGFiZWwgfSkgPT4ge1xuICAgIGlmICghYWN0aXZlIHx8ICFwYXlsb2FkIHx8ICFwYXlsb2FkLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtMyByb3VuZGVkLWxnIHNoYWRvdy1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi0yXCIsIGNoaWxkcmVuOiBsYWJlbCB9KSwgcGF5bG9hZC5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgc3R5bGU6IHsgY29sb3I6IGVudHJ5LmNvbG9yIH0sIGNoaWxkcmVuOiBbZW50cnkubmFtZSwgXCI6IFwiXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogKGVudHJ5LnZhbHVlID8/IDApLnRvTG9jYWxlU3RyaW5nKCkgfSldIH0sIGluZGV4KSkpXSB9KSk7XG59O1xuY29uc3QgRXhlY3V0aXZlRGFzaGJvYXJkVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhc2hib2FyZERhdGEsIGlzTG9hZGluZywgZXJyb3IsIHRpbWVTaW5jZVJlZnJlc2gsIGF1dG9SZWZyZXNoLCBoYW5kbGVSZWZyZXNoLCB0b2dnbGVBdXRvUmVmcmVzaCwgfSA9IHVzZUV4ZWN1dGl2ZURhc2hib2FyZExvZ2ljKCk7XG4gICAgY29uc3QgaXNEYXJrTW9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcbiAgICAvLyBDaGFydCB0aGVtZSBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgY2hhcnRUaGVtZSA9IHtcbiAgICAgICAgdGV4dENvbG9yOiBpc0RhcmtNb2RlID8gJyNmOWZhZmInIDogJyMxZjI5MzcnLFxuICAgICAgICBncmlkQ29sb3I6IGlzRGFya01vZGUgPyAnIzM3NDE1MScgOiAnI2U1ZTdlYicsXG4gICAgICAgIHRvb2x0aXBCZzogaXNEYXJrTW9kZSA/ICcjMzc0MTUxJyA6ICcjZmZmZmZmJyxcbiAgICB9O1xuICAgIC8vIENvbG9yIHBhbGV0dGUgZm9yIGNoYXJ0c1xuICAgIGNvbnN0IENPTE9SUyA9IHtcbiAgICAgICAgcHJpbWFyeTogaXNEYXJrTW9kZSA/ICcjNjBhNWZhJyA6ICcjM2I4MmY2JyxcbiAgICAgICAgc3VjY2VzczogaXNEYXJrTW9kZSA/ICcjMzRkMzk5JyA6ICcjMTBiOTgxJyxcbiAgICAgICAgd2FybmluZzogaXNEYXJrTW9kZSA/ICcjZmJiZjI0JyA6ICcjZjU5ZTBiJyxcbiAgICAgICAgZGFuZ2VyOiBpc0RhcmtNb2RlID8gJyNmODcxNzEnIDogJyNlZjQ0NDQnLFxuICAgICAgICBuZXV0cmFsOiBpc0RhcmtNb2RlID8gJyM5Y2EzYWYnIDogJyM2YjcyODAnLFxuICAgIH07XG4gICAgLy8gUGllIGNoYXJ0IGNvbG9ycyBmb3IgbWlncmF0aW9uIHN0YXR1c1xuICAgIGNvbnN0IFBJRV9DT0xPUlMgPSBbQ09MT1JTLnN1Y2Nlc3MsIENPTE9SUy53YXJuaW5nLCBDT0xPUlMuZGFuZ2VyLCBDT0xPUlMubmV1dHJhbF07XG4gICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICByZXR1cm4gX2pzeChEYXNoYm9hcmRTa2VsZXRvbiwge30pO1xuICAgIH1cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBcImRhdGEtY3lcIjogXCJkYXNoYm9hcmQtZXJyb3JcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRhc2hib2FyZC1lcnJvclwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgdGV4dC1sZyBtYi00XCIsIGNoaWxkcmVuOiBlcnJvciB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlUmVmcmVzaCwgdmFyaWFudDogXCJwcmltYXJ5XCIsIFwiZGF0YS1jeVwiOiBcInJldHJ5LWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmV0cnktYnRuXCIsIGNoaWxkcmVuOiBcIlJldHJ5XCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgaWYgKCFkYXNoYm9hcmREYXRhKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk5vIGRhdGEgYXZhaWxhYmxlXCIgfSkgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJleGVjdXRpdmUtZGFzaGJvYXJkLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4ZWN1dGl2ZS1kYXNoYm9hcmQtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJFeGVjdXRpdmUgRGFzaGJvYXJkXCIgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFtcIkxhc3QgdXBkYXRlZDogXCIsIHRpbWVTaW5jZVJlZnJlc2hdIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiB0b2dnbGVBdXRvUmVmcmVzaCwgdmFyaWFudDogYXV0b1JlZnJlc2ggPyAncHJpbWFyeScgOiAnc2Vjb25kYXJ5Jywgc2l6ZTogXCJzbVwiLCBcImRhdGEtY3lcIjogXCJhdXRvLXJlZnJlc2gtdG9nZ2xlXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJhdXRvLXJlZnJlc2gtdG9nZ2xlXCIsIGNoaWxkcmVuOiBhdXRvUmVmcmVzaCA/ICdBdXRvLVJlZnJlc2ggT24nIDogJ0F1dG8tUmVmcmVzaCBPZmYnIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVSZWZyZXNoLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLWJ0blwiLCBjaGlsZHJlbjogXCJSZWZyZXNoXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gcC02IHNwYWNlLXktNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KEtwaUNhcmQsIHsgdGl0bGU6IFwiVG90YWwgVXNlcnNcIiwgdmFsdWU6IGRhc2hib2FyZERhdGEua3Bpcy50b3RhbFVzZXJzLCBpY29uOiBfanN4KFVzZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02XCIgfSksIHRyZW5kOiBkYXNoYm9hcmREYXRhLmtwaXMudXNlclRyZW5kLCBcImRhdGEtY3lcIjogXCJrcGktdXNlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImtwaS11c2Vyc1wiIH0pLCBfanN4KEtwaUNhcmQsIHsgdGl0bGU6IFwiVG90YWwgR3JvdXBzXCIsIHZhbHVlOiBkYXNoYm9hcmREYXRhLmtwaXMudG90YWxHcm91cHMsIGljb246IF9qc3goRm9sZGVyVHJlZSwgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCB0cmVuZDogZGFzaGJvYXJkRGF0YS5rcGlzLmdyb3VwVHJlbmQsIFwiZGF0YS1jeVwiOiBcImtwaS1ncm91cHNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImtwaS1ncm91cHNcIiB9KSwgX2pzeChLcGlDYXJkLCB7IHRpdGxlOiBcIkRhdGEgVm9sdW1lXCIsIHZhbHVlOiB0eXBlb2YgZGFzaGJvYXJkRGF0YS5rcGlzLmRhdGFWb2x1bWVUQiA9PT0gJ251bWJlcicgPyBkYXNoYm9hcmREYXRhLmtwaXMuZGF0YVZvbHVtZVRCLnRvRml4ZWQoMSkgOiAnMCcsIHN1ZmZpeDogXCJUQlwiLCBpY29uOiBfanN4KEhhcmREcml2ZSwgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCB0cmVuZDogZGFzaGJvYXJkRGF0YS5rcGlzLmRhdGFWb2x1bWVUcmVuZCwgXCJkYXRhLWN5XCI6IFwia3BpLWRhdGEtdm9sdW1lXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJrcGktZGF0YS12b2x1bWVcIiB9KSwgX2pzeChLcGlDYXJkLCB7IHRpdGxlOiBcIkVzdC4gVGltZWxpbmVcIiwgdmFsdWU6IGRhc2hib2FyZERhdGEua3Bpcy5lc3RpbWF0ZWRUaW1lbGluZURheXMsIHN1ZmZpeDogXCJkYXlzXCIsIGljb246IF9qc3goQ2FsZW5kYXIsIHsgY2xhc3NOYW1lOiBcInctNiBoLTZcIiB9KSwgXCJkYXRhLWN5XCI6IFwia3BpLXRpbWVsaW5lXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJrcGktdGltZWxpbmVcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiVXNlciBEaXN0cmlidXRpb24gYnkgRGVwYXJ0bWVudFwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKEJhckNoYXJ0LCB7IGRhdGE6IGRhc2hib2FyZERhdGEuZGVwYXJ0bWVudERpc3RyaWJ1dGlvbiwgY2hpbGRyZW46IFtfanN4KENhcnRlc2lhbkdyaWQsIHsgc3Ryb2tlRGFzaGFycmF5OiBcIjMgM1wiLCBzdHJva2U6IGNoYXJ0VGhlbWUuZ3JpZENvbG9yIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwibmFtZVwiLCBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yLCBhbmdsZTogLTQ1LCB0ZXh0QW5jaG9yOiBcImVuZFwiLCBoZWlnaHQ6IDgwLCB0aWNrOiB7IGZvbnRTaXplOiAxMiB9IH0pLCBfanN4KFlBeGlzLCB7IHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IsIHRpY2s6IHsgZm9udFNpemU6IDEyIH0gfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KSwgX2pzeChCYXIsIHsgZGF0YUtleTogXCJ1c2VyQ291bnRcIiwgZmlsbDogQ09MT1JTLnByaW1hcnksIHJhZGl1czogWzgsIDgsIDAsIDBdLCBuYW1lOiBcIlVzZXJzXCIgfSldIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIk1pZ3JhdGlvbiBQcm9ncmVzcyBPdmVyIFRpbWVcIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAzMDAsIGNoaWxkcmVuOiBfanN4cyhBcmVhQ2hhcnQsIHsgZGF0YTogZGFzaGJvYXJkRGF0YS5taWdyYXRpb25Qcm9ncmVzcywgY2hpbGRyZW46IFtfanN4cyhcImRlZnNcIiwgeyBjaGlsZHJlbjogW19qc3hzKFwibGluZWFyR3JhZGllbnRcIiwgeyBpZDogXCJjb2xvclVzZXJzXCIsIHgxOiBcIjBcIiwgeTE6IFwiMFwiLCB4MjogXCIwXCIsIHkyOiBcIjFcIiwgY2hpbGRyZW46IFtfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI1JVwiLCBzdG9wQ29sb3I6IENPTE9SUy5wcmltYXJ5LCBzdG9wT3BhY2l0eTogMC44IH0pLCBfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI5NSVcIiwgc3RvcENvbG9yOiBDT0xPUlMucHJpbWFyeSwgc3RvcE9wYWNpdHk6IDAuMSB9KV0gfSksIF9qc3hzKFwibGluZWFyR3JhZGllbnRcIiwgeyBpZDogXCJjb2xvckdyb3Vwc1wiLCB4MTogXCIwXCIsIHkxOiBcIjBcIiwgeDI6IFwiMFwiLCB5MjogXCIxXCIsIGNoaWxkcmVuOiBbX2pzeChcInN0b3BcIiwgeyBvZmZzZXQ6IFwiNSVcIiwgc3RvcENvbG9yOiBDT0xPUlMuc3VjY2Vzcywgc3RvcE9wYWNpdHk6IDAuOCB9KSwgX2pzeChcInN0b3BcIiwgeyBvZmZzZXQ6IFwiOTUlXCIsIHN0b3BDb2xvcjogQ09MT1JTLnN1Y2Nlc3MsIHN0b3BPcGFjaXR5OiAwLjEgfSldIH0pXSB9KSwgX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLmdyaWRDb2xvciB9KSwgX2pzeChYQXhpcywgeyBkYXRhS2V5OiBcImRhdGVcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciwgdGljazogeyBmb250U2l6ZTogMTIgfSB9KSwgX2pzeChZQXhpcywgeyBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yLCB0aWNrOiB7IGZvbnRTaXplOiAxMiB9IH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudDogX2pzeChDdXN0b21Ub29sdGlwLCB7fSkgfSksIF9qc3goTGVnZW5kLCB7fSksIF9qc3goQXJlYSwgeyB0eXBlOiBcIm1vbm90b25lXCIsIGRhdGFLZXk6IFwidXNlcnNNaWdyYXRlZFwiLCBzdHJva2U6IENPTE9SUy5wcmltYXJ5LCBmaWxsT3BhY2l0eTogMSwgZmlsbDogXCJ1cmwoI2NvbG9yVXNlcnMpXCIsIG5hbWU6IFwiVXNlcnMgTWlncmF0ZWRcIiB9KSwgX2pzeChBcmVhLCB7IHR5cGU6IFwibW9ub3RvbmVcIiwgZGF0YUtleTogXCJncm91cHNNaWdyYXRlZFwiLCBzdHJva2U6IENPTE9SUy5zdWNjZXNzLCBmaWxsT3BhY2l0eTogMSwgZmlsbDogXCJ1cmwoI2NvbG9yR3JvdXBzKVwiLCBuYW1lOiBcIkdyb3VwcyBNaWdyYXRlZFwiIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJNaWdyYXRpb24gU3RhdHVzIEJyZWFrZG93blwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKFBpZUNoYXJ0LCB7IGNoaWxkcmVuOiBbX2pzeChQaWUsIHsgZGF0YTogZGFzaGJvYXJkRGF0YS5taWdyYXRpb25TdGF0dXMsIGN4OiBcIjUwJVwiLCBjeTogXCI1MCVcIiwgbGFiZWxMaW5lOiBmYWxzZSwgbGFiZWw6ICh7IG5hbWUsIHBlcmNlbnRhZ2UgfSkgPT4gYCR7bmFtZX06ICR7cGVyY2VudGFnZX0lYCwgb3V0ZXJSYWRpdXM6IDgwLCBmaWxsOiBcIiM4ODg0ZDhcIiwgZGF0YUtleTogXCJ2YWx1ZVwiLCBjaGlsZHJlbjogZGFzaGJvYXJkRGF0YS5taWdyYXRpb25TdGF0dXMubWFwKChlbnRyeSwgaW5kZXgpID0+IChfanN4KENlbGwsIHsgZmlsbDogUElFX0NPTE9SU1tpbmRleCAlIFBJRV9DT0xPUlMubGVuZ3RoXSB9LCBgY2VsbC0ke2luZGV4fWApKSkgfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KSwgX2pzeChMZWdlbmQsIHt9KV0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiU3lzdGVtIEhlYWx0aFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ3B1LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtYmx1ZS01MDBcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMFwiLCBjaGlsZHJlbjogXCJDUFUgVXNhZ2VcIiB9KV0gfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IFtkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5jcHVVc2FnZSwgXCIlXCJdIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGwgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWZ1bGwgaC0yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgaC0yIHJvdW5kZWQtZnVsbCB0cmFuc2l0aW9uLWFsbCAke2Rhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLmNwdVVzYWdlID4gODBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1yZWQtNTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGguY3B1VXNhZ2UgPiA2MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy15ZWxsb3ctNTAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdiZy1ncmVlbi01MDAnfWAsIHN0eWxlOiB7IHdpZHRoOiBgJHtkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5jcHVVc2FnZX0lYCB9IH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KE1lbW9yeVN0aWNrLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtcHVycGxlLTUwMFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIk1lbW9yeSBVc2FnZVwiIH0pXSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogW2Rhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm1lbW9yeVVzYWdlLCBcIiVcIl0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctZnVsbCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBoLTJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBoLTIgcm91bmRlZC1mdWxsIHRyYW5zaXRpb24tYWxsICR7ZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubWVtb3J5VXNhZ2UgPiA4MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXJlZC01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5tZW1vcnlVc2FnZSA+IDYwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXllbGxvdy01MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLWdyZWVuLTUwMCd9YCwgc3R5bGU6IHsgd2lkdGg6IGAke2Rhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm1lbW9yeVVzYWdlfSVgIH0gfSkgfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChOZXR3b3JrLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IFwiTmV0d29yayBTdGF0dXNcIiB9KV0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBgdGV4dC1zbSBmb250LXNlbWlib2xkICR7ZGFzaGJvYXJkRGF0YS5zeXN0ZW1IZWFsdGgubmV0d29ya1N0YXR1cyA9PT0gJ2hlYWx0aHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAndGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGRhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm5ldHdvcmtTdGF0dXMgPT09ICd3YXJuaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICd0ZXh0LXllbGxvdy02MDAgZGFyazp0ZXh0LXllbGxvdy00MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCd9YCwgY2hpbGRyZW46IGRhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm5ldHdvcmtTdGF0dXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhc2hib2FyZERhdGEuc3lzdGVtSGVhbHRoLm5ldHdvcmtTdGF0dXMuc2xpY2UoMSkgfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInB0LTQgYm9yZGVyLXQgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW1wiTGFzdCBoZWFsdGggY2hlY2s6IFwiLCBkYXNoYm9hcmREYXRhLnN5c3RlbUhlYWx0aC5sYXN0VXBkYXRlZC50b0xvY2FsZVRpbWVTdHJpbmcoKV0gfSkgfSldIH0pXSB9KV0gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRXhlY3V0aXZlRGFzaGJvYXJkVmlldztcbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==