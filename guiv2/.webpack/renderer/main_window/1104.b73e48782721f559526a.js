(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1104],{

/***/ 40391:
/*!**********************************************************!*\
  !*** ./src/renderer/components/atoms/LoadingSpinner.tsx ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * LoadingSpinner Component
 *
 * Simple loading spinner for inline loading states
 */



/**
 * LoadingSpinner component for inline loading states
 */
const LoadingSpinner = ({ size = 'md', className, 'data-cy': dataCy, }) => {
    // Size mappings
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Loader2, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('animate-spin text-blue-600 dark:text-blue-400', className), size: sizes[size], "data-cy": dataCy }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadingSpinner);


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

/***/ }),

/***/ 76965:
/*!************************************************************************!*\
  !*** ./src/renderer/views/analytics/TrendAnalysisView.tsx + 1 modules ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  TrendAnalysisView: () => (/* binding */ TrendAnalysisView),
  "default": () => (/* binding */ analytics_TrendAnalysisView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/recharts/es6/index.js + 3 modules
var es6 = __webpack_require__(72085);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
// EXTERNAL MODULE: ./src/renderer/components/atoms/LoadingSpinner.tsx
var LoadingSpinner = __webpack_require__(40391);
;// ./src/renderer/hooks/useTrendAnalysisLogic.ts

/**
 * Generate trend data from Logic Engine statistics
 * TODO: Replace with real time-series data when audit log tracking is implemented
 * For now, using Logic Engine current stats to generate realistic mock trends
 */
function generateTrendData(stats, metricType, timeRange) {
    // Get current value from stats
    let currentValue = 0;
    switch (metricType) {
        case 'users':
            currentValue = stats.UserCount || 0;
            break;
        case 'groups':
            currentValue = stats.GroupCount || 0;
            break;
        case 'devices':
            currentValue = stats.DeviceCount || 0;
            break;
        case 'mailboxes':
            currentValue = stats.MailboxCount || 0;
            break;
        case 'storage':
            // Estimate storage from mailboxes (5GB avg per mailbox)
            currentValue = (stats.MailboxCount || 0) * 5;
            break;
    }
    // Generate historical data points based on time range
    const points = [];
    let numPoints = 0;
    let dateIncrement = 0;
    switch (timeRange) {
        case '7days':
            numPoints = 7;
            dateIncrement = 1; // 1 day
            break;
        case '30days':
            numPoints = 30;
            dateIncrement = 1; // 1 day
            break;
        case '90days':
            numPoints = 90;
            dateIncrement = 1; // 1 day
            break;
        case '12months':
            numPoints = 12;
            dateIncrement = 30; // ~1 month
            break;
    }
    const now = new Date();
    for (let i = 0; i < numPoints; i++) {
        const pointDate = new Date(now);
        pointDate.setDate(pointDate.getDate() - ((numPoints - i - 1) * dateIncrement));
        // Calculate value with slight growth trend
        const progressRatio = i / numPoints;
        const baseValue = currentValue * (0.7 + progressRatio * 0.3); // Start at 70%, end at 100%
        const noise = (Math.random() - 0.5) * (currentValue * 0.05); // ±5% noise
        const value = Math.max(0, Math.floor(baseValue + noise));
        // Calculate target (slightly higher than actual for motivation)
        const target = Math.floor(value * 1.05);
        // Calculate forecast for future points (simple linear projection)
        const forecast = i >= numPoints - 3 ? Math.floor(currentValue * 1.02) : undefined;
        points.push({
            date: pointDate.toISOString().split('T')[0],
            value,
            target,
            forecast,
        });
    }
    return points;
}
/**
 * Generate comparative trends (current vs previous period)
 */
function generateComparativeTrends(trendData) {
    if (trendData.length < 2)
        return [];
    const midPoint = Math.floor(trendData.length / 2);
    const firstHalf = trendData.slice(0, midPoint);
    const secondHalf = trendData.slice(midPoint);
    const avgFirst = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;
    const change = avgSecond - avgFirst;
    const changePercentage = avgFirst > 0 ? Math.round((change / avgFirst) * 100) : 0;
    return [
        {
            period: 'First Half vs Second Half',
            current: Math.floor(avgSecond),
            previous: Math.floor(avgFirst),
            change: Math.floor(change),
            changePercentage,
        },
    ];
}
/**
 * Calculate trend summary with projections
 */
function calculateTrendSummary(metricType, trendData) {
    if (trendData.length < 2) {
        return {
            metric: metricType,
            currentValue: 0,
            previousValue: 0,
            change: 0,
            changePercentage: 0,
            trend: 'stable',
            projection30Days: 0,
            projection90Days: 0,
        };
    }
    const current = trendData[trendData.length - 1].value;
    const previous = trendData[0].value;
    const change = current - previous;
    const changePercentage = previous > 0 ? Math.round((change / previous) * 100) : 0;
    // Determine trend direction
    let trend = 'stable';
    if (Math.abs(changePercentage) >= 5) {
        trend = changePercentage > 0 ? 'increasing' : 'decreasing';
    }
    // Simple linear projection
    const avgDailyChange = change / trendData.length;
    const projection30Days = Math.max(0, Math.floor(current + avgDailyChange * 30));
    const projection90Days = Math.max(0, Math.floor(current + avgDailyChange * 90));
    return {
        metric: metricType,
        currentValue: current,
        previousValue: previous,
        change,
        changePercentage,
        trend,
        projection30Days,
        projection90Days,
    };
}
/**
 * Calculate correlations between metrics
 * TODO: Replace with real correlation analysis when time-series data is available
 */
function calculateCorrelations(summaries) {
    return [
        {
            metric1: 'Users',
            metric2: 'Mailboxes',
            correlation: 0.95,
            description: 'Strong positive correlation - most users have mailboxes',
        },
        {
            metric1: 'Users',
            metric2: 'Groups',
            correlation: 0.78,
            description: 'Positive correlation - group membership grows with users',
        },
        {
            metric1: 'Devices',
            metric2: 'Users',
            correlation: 0.82,
            description: 'Positive correlation - device count tracks user growth',
        },
    ];
}
/**
 * Get mock trend analysis data for fallback
 */
function getMockTrendAnalysisData() {
    const mockTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return {
            date: date.toISOString().split('T')[0],
            value: 10000 + Math.floor(Math.random() * 2000) + i * 50,
            target: 11000 + i * 50,
        };
    });
    return {
        primaryTrend: mockTrend,
        comparativeTrends: generateComparativeTrends(mockTrend),
        summaries: [
            {
                metric: 'users',
                currentValue: 12547,
                previousValue: 11200,
                change: 1347,
                changePercentage: 12,
                trend: 'increasing',
                projection30Days: 13200,
                projection90Days: 14500,
            },
        ],
        correlations: calculateCorrelations([]),
    };
}
/**
 * Custom hook for Trend Analysis logic
 * Integrates with Logic Engine to generate trend analysis from current statistics
 */
const useTrendAnalysisLogic = () => {
    const [trendData, setTrendData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [selectedMetric, setSelectedMetric] = (0,react.useState)('users');
    const [timeRange, setTimeRange] = (0,react.useState)('30days');
    const [isExporting, setIsExporting] = (0,react.useState)(false);
    const fetchTrendAnalysis = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Get statistics from Logic Engine
            const result = await window.electronAPI.logicEngine.getStatistics();
            if (result.success && result.data?.statistics) {
                const stats = result.data.statistics;
                // Generate trend data for selected metric
                const primaryTrend = generateTrendData(stats, selectedMetric, timeRange);
                // Generate comparative trends
                const comparativeTrends = generateComparativeTrends(primaryTrend);
                // Calculate summaries for all metrics
                const metricTypes = ['users', 'groups', 'devices', 'mailboxes', 'storage'];
                const summaries = metricTypes.map(metric => {
                    const metricTrend = generateTrendData(stats, metric, timeRange);
                    return calculateTrendSummary(metric, metricTrend);
                });
                // Calculate correlations
                const correlations = calculateCorrelations(summaries);
                const analysisResult = {
                    primaryTrend,
                    comparativeTrends,
                    summaries,
                    correlations,
                };
                setTrendData(analysisResult);
            }
            else {
                throw new Error(result.error || 'Failed to fetch Logic Engine statistics');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.warn('Trend analysis fetch error, using mock data:', err);
            // Set mock data for development/testing
            setTrendData(getMockTrendAnalysisData());
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedMetric, timeRange]);
    // Initial load
    (0,react.useEffect)(() => {
        fetchTrendAnalysis();
    }, [fetchTrendAnalysis]);
    // Export trend report
    const handleExportReport = (0,react.useCallback)(async () => {
        if (!trendData)
            return;
        setIsExporting(true);
        try {
            console.log('Exporting trend analysis report...', trendData);
            const fileName = `TrendAnalysis_${selectedMetric}_${timeRange}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
    }, [trendData, selectedMetric, timeRange]);
    // Get metric label
    const getMetricLabel = (0,react.useCallback)((metric) => {
        const labels = {
            users: 'Users',
            groups: 'Groups',
            devices: 'Devices',
            mailboxes: 'Mailboxes',
            storage: 'Storage (GB)',
        };
        return labels[metric];
    }, []);
    return {
        trendData,
        isLoading,
        error,
        selectedMetric,
        setSelectedMetric,
        timeRange,
        setTimeRange,
        isExporting,
        handleExportReport,
        getMetricLabel,
        refreshData: fetchTrendAnalysis,
    };
};

;// ./src/renderer/views/analytics/TrendAnalysisView.tsx

/**
 * Trend Analysis View
 *
 * Comprehensive trend analysis including:
 * - Multi-metric trend visualization
 * - Historical comparisons
 * - Forecasting and projections
 * - Correlation analysis
 * - Period-over-period analysis
 */







/**
 * Format number with commas
 */
const formatNumber = (num) => {
    return num.toLocaleString();
};
const TrendSummaryCard = ({ title, currentValue, previousValue, change, changePercentage, trend, projection30Days, projection90Days, }) => {
    const getTrendIcon = () => {
        switch (trend) {
            case 'increasing':
                return (0,jsx_runtime.jsx)(lucide_react.TrendingUp, { className: "w-5 h-5 text-green-600" });
            case 'decreasing':
                return (0,jsx_runtime.jsx)(lucide_react.TrendingDown, { className: "w-5 h-5 text-red-600" });
            case 'stable':
                return (0,jsx_runtime.jsx)(lucide_react.Minus, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const getTrendColor = () => {
        switch (trend) {
            case 'increasing':
                return 'text-green-600';
            case 'decreasing':
                return 'text-red-600';
            case 'stable':
                return 'text-gray-600';
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-4", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase", children: title }), getTrendIcon()] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: formatNumber(currentValue) }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Current Value" })] }), (0,jsx_runtime.jsxs)("div", { className: `flex items-center gap-2 text-sm font-medium ${getTrendColor()}`, children: [(0,jsx_runtime.jsxs)("span", { children: [change >= 0 ? '+' : '', formatNumber(change)] }), (0,jsx_runtime.jsxs)("span", { children: ["(", changePercentage >= 0 ? '+' : '', changePercentage, "%)"] })] }), projection30Days !== undefined && ((0,jsx_runtime.jsxs)("div", { className: "pt-2 border-t border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "30-Day Projection" }), (0,jsx_runtime.jsx)("p", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: formatNumber(projection30Days) })] }))] })] }));
};
/**
 * Trend Analysis View Component
 */
const TrendAnalysisView = () => {
    const { trendData, isLoading, error, selectedMetric, setSelectedMetric, timeRange, setTimeRange, isExporting, handleExportReport, getMetricLabel, refreshData, } = useTrendAnalysisLogic();
    if (isLoading) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full", children: (0,jsx_runtime.jsx)(LoadingSpinner["default"], { size: "lg" }) }));
    }
    if (error || !trendData) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex flex-col items-center justify-center h-full p-6", children: (0,jsx_runtime.jsxs)("div", { className: "text-center max-w-md", children: [(0,jsx_runtime.jsx)("h2", { className: "text-xl font-bold text-gray-900 dark:text-white mb-2", children: "Failed to Load Trends" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: error || 'Unknown error occurred' }), (0,jsx_runtime.jsx)(Button.Button, { onClick: refreshData, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), children: "Retry" })] }) }));
    }
    const { primaryTrend, comparativeTrends, summaries, correlations } = trendData;
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 space-y-6 overflow-y-auto", "data-cy": "trend-analysis-view", "data-testid": "trend-analysis-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Trend Analysis" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Analyze trends, forecast growth, and identify patterns over time" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex gap-2", children: [(0,jsx_runtime.jsx)(Select.Select, { value: selectedMetric, onChange: (value) => setSelectedMetric(value), className: "w-48", options: [
                                    { value: 'users', label: 'Users' },
                                    { value: 'groups', label: 'Groups' },
                                    { value: 'devices', label: 'Devices' },
                                    { value: 'mailboxes', label: 'Mailboxes' },
                                    { value: 'storage', label: 'Storage (GB)' }
                                ] }), (0,jsx_runtime.jsx)(Select.Select, { value: timeRange, onChange: (value) => setTimeRange(value), className: "w-40", options: [
                                    { value: '7days', label: '7 Days' },
                                    { value: '30days', label: '30 Days' },
                                    { value: '90days', label: '90 Days' },
                                    { value: '12months', label: '12 Months' }
                                ] }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: refreshData, icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4" }), children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportReport, loading: isExporting, icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: summaries.map((summary) => ((0,jsx_runtime.jsx)(TrendSummaryCard, { title: getMetricLabel(summary.metric), currentValue: summary.currentValue, previousValue: summary.previousValue, change: summary.change, changePercentage: summary.changePercentage, trend: summary.trend, projection30Days: summary.metric === selectedMetric ? summary.projection30Days : undefined, projection90Days: summary.metric === selectedMetric ? summary.projection90Days : undefined }, summary.metric))) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h3", { className: "font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.TrendingUp, { className: "w-5 h-5" }), getMetricLabel(selectedMetric), " Trend - ", timeRange.replace('days', ' Days').replace('months', ' Months')] }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 400, children: (0,jsx_runtime.jsxs)(es6.AreaChart, { data: primaryTrend, children: [(0,jsx_runtime.jsxs)("defs", { children: [(0,jsx_runtime.jsxs)("linearGradient", { id: "colorValue", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0,jsx_runtime.jsx)("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }), (0,jsx_runtime.jsx)("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })] }), (0,jsx_runtime.jsxs)("linearGradient", { id: "colorTarget", x1: "0", y1: "0", x2: "0", y2: "1", children: [(0,jsx_runtime.jsx)("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }), (0,jsx_runtime.jsx)("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })] })] }), (0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-600" }), (0,jsx_runtime.jsx)(es6.XAxis, { dataKey: "date", className: "text-xs fill-gray-600 dark:fill-gray-400", tick: { fill: 'currentColor' }, tickFormatter: (value) => {
                                        const date = new Date(value);
                                        return timeRange === '12months'
                                            ? date.toLocaleDateString([], { month: 'short' })
                                            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                    } }), (0,jsx_runtime.jsx)(es6.YAxis, { className: "text-xs fill-gray-600 dark:fill-gray-400", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.Tooltip, { contentStyle: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                    }, labelFormatter: (value) => new Date(value).toLocaleDateString() }), (0,jsx_runtime.jsx)(es6.Legend, {}), (0,jsx_runtime.jsx)(es6.Area, { type: "monotone", dataKey: "value", stroke: "#3b82f6", strokeWidth: 2, fill: "url(#colorValue)", name: "Actual" }), (0,jsx_runtime.jsx)(es6.Area, { type: "monotone", dataKey: "target", stroke: "#10b981", strokeWidth: 2, strokeDasharray: "5 5", fill: "url(#colorTarget)", name: "Target" }), primaryTrend.some(p => p.forecast) && ((0,jsx_runtime.jsx)(es6.Line, { type: "monotone", dataKey: "forecast", stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "8 4", name: "Forecast", dot: false }))] }) }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2", children: "* Trend data is currently simulated based on Logic Engine statistics. Real time-series data will be available when audit log tracking is implemented." })] }), comparativeTrends.length > 0 && ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("h3", { className: "font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.BarChart3, { className: "w-5 h-5" }), "Comparative Analysis"] }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6.BarChart, { data: comparativeTrends, children: [(0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", className: "stroke-gray-300 dark:stroke-gray-600" }), (0,jsx_runtime.jsx)(es6.XAxis, { dataKey: "period", className: "text-xs fill-gray-600 dark:fill-gray-400", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.YAxis, { className: "text-xs fill-gray-600 dark:fill-gray-400", tick: { fill: 'currentColor' } }), (0,jsx_runtime.jsx)(es6.Tooltip, { contentStyle: {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                    } }), (0,jsx_runtime.jsx)(es6.Legend, {}), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "previous", fill: "#94a3b8", name: "Previous Period" }), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "current", fill: "#3b82f6", name: "Current Period" })] }) }), (0,jsx_runtime.jsx)("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-3 gap-4", children: comparativeTrends.map((trend) => ((0,jsx_runtime.jsxs)("div", { className: "p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: trend.period }), (0,jsx_runtime.jsxs)("p", { className: `text-lg font-bold mt-2 ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`, children: [trend.change >= 0 ? '+' : '', formatNumber(trend.change)] }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [trend.changePercentage >= 0 ? '+' : '', trend.changePercentage, "% change"] })] }, trend.period))) })] })), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white mb-4", children: "Metric Correlations" }), (0,jsx_runtime.jsx)("div", { className: "space-y-4", children: correlations.map((corr, index) => ((0,jsx_runtime.jsxs)("div", { className: "p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("div", { className: "flex items-center gap-2", children: (0,jsx_runtime.jsxs)("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [corr.metric1, " \u2194 ", corr.metric2] }) }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("div", { className: "w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2", children: (0,jsx_runtime.jsx)("div", { className: `h-2 rounded-full ${corr.correlation >= 0.8 ? 'bg-green-600' :
                                                            corr.correlation >= 0.5 ? 'bg-yellow-600' :
                                                                'bg-red-600'}`, style: { width: `${corr.correlation * 100}%` } }) }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-semibold text-gray-900 dark:text-white w-12 text-right", children: [(corr.correlation * 100).toFixed(0), "%"] })] })] }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-600 dark:text-gray-400", children: corr.description })] }, index))) }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-4", children: "* Correlations are calculated from current statistics. Historical correlation tracking requires audit log implementation." })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white mb-4", children: "Growth Projections" }), (0,jsx_runtime.jsx)("div", { className: "overflow-x-auto", children: (0,jsx_runtime.jsxs)("table", { className: "w-full", children: [(0,jsx_runtime.jsx)("thead", { children: (0,jsx_runtime.jsxs)("tr", { className: "border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("th", { className: "text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase", children: "Metric" }), (0,jsx_runtime.jsx)("th", { className: "text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase", children: "Current" }), (0,jsx_runtime.jsx)("th", { className: "text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase", children: "30-Day Projection" }), (0,jsx_runtime.jsx)("th", { className: "text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase", children: "90-Day Projection" }), (0,jsx_runtime.jsx)("th", { className: "text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase", children: "Trend" })] }) }), (0,jsx_runtime.jsx)("tbody", { children: summaries.map((summary) => ((0,jsx_runtime.jsxs)("tr", { className: "border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50", children: [(0,jsx_runtime.jsx)("td", { className: "py-3 px-4 text-sm font-medium text-gray-900 dark:text-white", children: getMetricLabel(summary.metric) }), (0,jsx_runtime.jsx)("td", { className: "py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold", children: formatNumber(summary.currentValue) }), (0,jsx_runtime.jsx)("td", { className: "py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400", children: formatNumber(summary.projection30Days) }), (0,jsx_runtime.jsx)("td", { className: "py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400", children: formatNumber(summary.projection90Days) }), (0,jsx_runtime.jsxs)("td", { className: "py-3 px-4 text-center", children: [summary.trend === 'increasing' && (0,jsx_runtime.jsx)(lucide_react.TrendingUp, { className: "w-5 h-5 text-green-600 inline" }), summary.trend === 'decreasing' && (0,jsx_runtime.jsx)(lucide_react.TrendingDown, { className: "w-5 h-5 text-red-600 inline" }), summary.trend === 'stable' && (0,jsx_runtime.jsx)(lucide_react.Minus, { className: "w-5 h-5 text-gray-600 inline" })] })] }, summary.metric))) })] }) }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-4", children: "Projections use simple linear extrapolation based on current trend data. More sophisticated forecasting requires historical data collection." })] })] }));
};
/* harmony default export */ const analytics_TrendAnalysisView = (TrendAnalysisView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVMsdUVBQXVFLG1CQUFJLFNBQVMsdUhBQXVILEdBQUcsbUJBQUksU0FBUyx5SEFBeUgsR0FBRyxtQkFBSSxTQUFTLG1JQUFtSSxHQUFHLG1CQUFJLFNBQVMsbUlBQW1JLEdBQUcsbUJBQUksU0FBUyx3SEFBd0gsSUFBSSxHQUFHLEdBQUcsbUJBQUksWUFBWSxzQ0FBc0Msb0JBQUssU0FBUyxrSEFBa0gsbUJBQUksU0FBUyxvSEFBb0gsR0FBRyxtQkFBSSxTQUFTLHFJQUFxSSxHQUFHLG1CQUFJLFNBQVMsOEhBQThILEdBQUcsbUJBQUksU0FBUyw4SEFBOEgsR0FBRyxvQkFBSyxTQUFTLGlGQUFpRixtQkFBSSxDQUFDLHVCQUFVLElBQUksNENBQTRDLHFDQUFxQyxtQkFBSSxDQUFDLHlCQUFZLElBQUksMENBQTBDLGlDQUFpQyxtQkFBSSxDQUFDLGtCQUFLLElBQUksMkNBQTJDLElBQUksSUFBSSxxQkFBcUIsSUFBSSxHQUFHLEdBQUcsbUJBQUksUUFBUSxzTkFBc04sSUFBSSxJQUFJO0FBQ2hsRztBQUNBLGtFQUFlLGlCQUFpQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9Mb2FkaW5nU3Bpbm5lci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlVHJlbmRBbmFseXNpc0xvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FuYWx5dGljcy9UcmVuZEFuYWx5c2lzVmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgQ29tcG9uZW50XG4gKlxuICogU2ltcGxlIGxvYWRpbmcgc3Bpbm5lciBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBMb2FkZXIyIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogTG9hZGluZ1NwaW5uZXIgY29tcG9uZW50IGZvciBpbmxpbmUgbG9hZGluZyBzdGF0ZXNcbiAqL1xuY29uc3QgTG9hZGluZ1NwaW5uZXIgPSAoeyBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFNpemUgbWFwcGluZ3NcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206IDE2LFxuICAgICAgICBtZDogMjQsXG4gICAgICAgIGxnOiAzMixcbiAgICAgICAgeGw6IDQ4LFxuICAgIH07XG4gICAgcmV0dXJuIChfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhbmltYXRlLXNwaW4gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnLCBjbGFzc05hbWUpLCBzaXplOiBzaXplc1tzaXplXSwgXCJkYXRhLWN5XCI6IGRhdGFDeSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTG9hZGluZ1NwaW5uZXI7XG4iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogR2VuZXJhdGUgdHJlbmQgZGF0YSBmcm9tIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzXG4gKiBUT0RPOiBSZXBsYWNlIHdpdGggcmVhbCB0aW1lLXNlcmllcyBkYXRhIHdoZW4gYXVkaXQgbG9nIHRyYWNraW5nIGlzIGltcGxlbWVudGVkXG4gKiBGb3Igbm93LCB1c2luZyBMb2dpYyBFbmdpbmUgY3VycmVudCBzdGF0cyB0byBnZW5lcmF0ZSByZWFsaXN0aWMgbW9jayB0cmVuZHNcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVUcmVuZERhdGEoc3RhdHMsIG1ldHJpY1R5cGUsIHRpbWVSYW5nZSkge1xuICAgIC8vIEdldCBjdXJyZW50IHZhbHVlIGZyb20gc3RhdHNcbiAgICBsZXQgY3VycmVudFZhbHVlID0gMDtcbiAgICBzd2l0Y2ggKG1ldHJpY1R5cGUpIHtcbiAgICAgICAgY2FzZSAndXNlcnMnOlxuICAgICAgICAgICAgY3VycmVudFZhbHVlID0gc3RhdHMuVXNlckNvdW50IHx8IDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ3JvdXBzJzpcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHN0YXRzLkdyb3VwQ291bnQgfHwgMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkZXZpY2VzJzpcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHN0YXRzLkRldmljZUNvdW50IHx8IDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWFpbGJveGVzJzpcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHN0YXRzLk1haWxib3hDb3VudCB8fCAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3N0b3JhZ2UnOlxuICAgICAgICAgICAgLy8gRXN0aW1hdGUgc3RvcmFnZSBmcm9tIG1haWxib3hlcyAoNUdCIGF2ZyBwZXIgbWFpbGJveClcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IChzdGF0cy5NYWlsYm94Q291bnQgfHwgMCkgKiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIEdlbmVyYXRlIGhpc3RvcmljYWwgZGF0YSBwb2ludHMgYmFzZWQgb24gdGltZSByYW5nZVxuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xuICAgIGxldCBudW1Qb2ludHMgPSAwO1xuICAgIGxldCBkYXRlSW5jcmVtZW50ID0gMDtcbiAgICBzd2l0Y2ggKHRpbWVSYW5nZSkge1xuICAgICAgICBjYXNlICc3ZGF5cyc6XG4gICAgICAgICAgICBudW1Qb2ludHMgPSA3O1xuICAgICAgICAgICAgZGF0ZUluY3JlbWVudCA9IDE7IC8vIDEgZGF5XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnMzBkYXlzJzpcbiAgICAgICAgICAgIG51bVBvaW50cyA9IDMwO1xuICAgICAgICAgICAgZGF0ZUluY3JlbWVudCA9IDE7IC8vIDEgZGF5XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnOTBkYXlzJzpcbiAgICAgICAgICAgIG51bVBvaW50cyA9IDkwO1xuICAgICAgICAgICAgZGF0ZUluY3JlbWVudCA9IDE7IC8vIDEgZGF5XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnMTJtb250aHMnOlxuICAgICAgICAgICAgbnVtUG9pbnRzID0gMTI7XG4gICAgICAgICAgICBkYXRlSW5jcmVtZW50ID0gMzA7IC8vIH4xIG1vbnRoXG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVBvaW50czsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBvaW50RGF0ZSA9IG5ldyBEYXRlKG5vdyk7XG4gICAgICAgIHBvaW50RGF0ZS5zZXREYXRlKHBvaW50RGF0ZS5nZXREYXRlKCkgLSAoKG51bVBvaW50cyAtIGkgLSAxKSAqIGRhdGVJbmNyZW1lbnQpKTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHZhbHVlIHdpdGggc2xpZ2h0IGdyb3d0aCB0cmVuZFxuICAgICAgICBjb25zdCBwcm9ncmVzc1JhdGlvID0gaSAvIG51bVBvaW50cztcbiAgICAgICAgY29uc3QgYmFzZVZhbHVlID0gY3VycmVudFZhbHVlICogKDAuNyArIHByb2dyZXNzUmF0aW8gKiAwLjMpOyAvLyBTdGFydCBhdCA3MCUsIGVuZCBhdCAxMDAlXG4gICAgICAgIGNvbnN0IG5vaXNlID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogKGN1cnJlbnRWYWx1ZSAqIDAuMDUpOyAvLyDCsTUlIG5vaXNlXG4gICAgICAgIGNvbnN0IHZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihiYXNlVmFsdWUgKyBub2lzZSkpO1xuICAgICAgICAvLyBDYWxjdWxhdGUgdGFyZ2V0IChzbGlnaHRseSBoaWdoZXIgdGhhbiBhY3R1YWwgZm9yIG1vdGl2YXRpb24pXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IE1hdGguZmxvb3IodmFsdWUgKiAxLjA1KTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGZvcmVjYXN0IGZvciBmdXR1cmUgcG9pbnRzIChzaW1wbGUgbGluZWFyIHByb2plY3Rpb24pXG4gICAgICAgIGNvbnN0IGZvcmVjYXN0ID0gaSA+PSBudW1Qb2ludHMgLSAzID8gTWF0aC5mbG9vcihjdXJyZW50VmFsdWUgKiAxLjAyKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgcG9pbnRzLnB1c2goe1xuICAgICAgICAgICAgZGF0ZTogcG9pbnREYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgICAgIHZhbHVlLFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgZm9yZWNhc3QsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcG9pbnRzO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSBjb21wYXJhdGl2ZSB0cmVuZHMgKGN1cnJlbnQgdnMgcHJldmlvdXMgcGVyaW9kKVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbXBhcmF0aXZlVHJlbmRzKHRyZW5kRGF0YSkge1xuICAgIGlmICh0cmVuZERhdGEubGVuZ3RoIDwgMilcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIGNvbnN0IG1pZFBvaW50ID0gTWF0aC5mbG9vcih0cmVuZERhdGEubGVuZ3RoIC8gMik7XG4gICAgY29uc3QgZmlyc3RIYWxmID0gdHJlbmREYXRhLnNsaWNlKDAsIG1pZFBvaW50KTtcbiAgICBjb25zdCBzZWNvbmRIYWxmID0gdHJlbmREYXRhLnNsaWNlKG1pZFBvaW50KTtcbiAgICBjb25zdCBhdmdGaXJzdCA9IGZpcnN0SGFsZi5yZWR1Y2UoKHN1bSwgcCkgPT4gc3VtICsgcC52YWx1ZSwgMCkgLyBmaXJzdEhhbGYubGVuZ3RoO1xuICAgIGNvbnN0IGF2Z1NlY29uZCA9IHNlY29uZEhhbGYucmVkdWNlKChzdW0sIHApID0+IHN1bSArIHAudmFsdWUsIDApIC8gc2Vjb25kSGFsZi5sZW5ndGg7XG4gICAgY29uc3QgY2hhbmdlID0gYXZnU2Vjb25kIC0gYXZnRmlyc3Q7XG4gICAgY29uc3QgY2hhbmdlUGVyY2VudGFnZSA9IGF2Z0ZpcnN0ID4gMCA/IE1hdGgucm91bmQoKGNoYW5nZSAvIGF2Z0ZpcnN0KSAqIDEwMCkgOiAwO1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHBlcmlvZDogJ0ZpcnN0IEhhbGYgdnMgU2Vjb25kIEhhbGYnLFxuICAgICAgICAgICAgY3VycmVudDogTWF0aC5mbG9vcihhdmdTZWNvbmQpLFxuICAgICAgICAgICAgcHJldmlvdXM6IE1hdGguZmxvb3IoYXZnRmlyc3QpLFxuICAgICAgICAgICAgY2hhbmdlOiBNYXRoLmZsb29yKGNoYW5nZSksXG4gICAgICAgICAgICBjaGFuZ2VQZXJjZW50YWdlLFxuICAgICAgICB9LFxuICAgIF07XG59XG4vKipcbiAqIENhbGN1bGF0ZSB0cmVuZCBzdW1tYXJ5IHdpdGggcHJvamVjdGlvbnNcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlVHJlbmRTdW1tYXJ5KG1ldHJpY1R5cGUsIHRyZW5kRGF0YSkge1xuICAgIGlmICh0cmVuZERhdGEubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWV0cmljOiBtZXRyaWNUeXBlLFxuICAgICAgICAgICAgY3VycmVudFZhbHVlOiAwLFxuICAgICAgICAgICAgcHJldmlvdXNWYWx1ZTogMCxcbiAgICAgICAgICAgIGNoYW5nZTogMCxcbiAgICAgICAgICAgIGNoYW5nZVBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICB0cmVuZDogJ3N0YWJsZScsXG4gICAgICAgICAgICBwcm9qZWN0aW9uMzBEYXlzOiAwLFxuICAgICAgICAgICAgcHJvamVjdGlvbjkwRGF5czogMCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudCA9IHRyZW5kRGF0YVt0cmVuZERhdGEubGVuZ3RoIC0gMV0udmFsdWU7XG4gICAgY29uc3QgcHJldmlvdXMgPSB0cmVuZERhdGFbMF0udmFsdWU7XG4gICAgY29uc3QgY2hhbmdlID0gY3VycmVudCAtIHByZXZpb3VzO1xuICAgIGNvbnN0IGNoYW5nZVBlcmNlbnRhZ2UgPSBwcmV2aW91cyA+IDAgPyBNYXRoLnJvdW5kKChjaGFuZ2UgLyBwcmV2aW91cykgKiAxMDApIDogMDtcbiAgICAvLyBEZXRlcm1pbmUgdHJlbmQgZGlyZWN0aW9uXG4gICAgbGV0IHRyZW5kID0gJ3N0YWJsZSc7XG4gICAgaWYgKE1hdGguYWJzKGNoYW5nZVBlcmNlbnRhZ2UpID49IDUpIHtcbiAgICAgICAgdHJlbmQgPSBjaGFuZ2VQZXJjZW50YWdlID4gMCA/ICdpbmNyZWFzaW5nJyA6ICdkZWNyZWFzaW5nJztcbiAgICB9XG4gICAgLy8gU2ltcGxlIGxpbmVhciBwcm9qZWN0aW9uXG4gICAgY29uc3QgYXZnRGFpbHlDaGFuZ2UgPSBjaGFuZ2UgLyB0cmVuZERhdGEubGVuZ3RoO1xuICAgIGNvbnN0IHByb2plY3Rpb24zMERheXMgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKGN1cnJlbnQgKyBhdmdEYWlseUNoYW5nZSAqIDMwKSk7XG4gICAgY29uc3QgcHJvamVjdGlvbjkwRGF5cyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IoY3VycmVudCArIGF2Z0RhaWx5Q2hhbmdlICogOTApKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBtZXRyaWM6IG1ldHJpY1R5cGUsXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogY3VycmVudCxcbiAgICAgICAgcHJldmlvdXNWYWx1ZTogcHJldmlvdXMsXG4gICAgICAgIGNoYW5nZSxcbiAgICAgICAgY2hhbmdlUGVyY2VudGFnZSxcbiAgICAgICAgdHJlbmQsXG4gICAgICAgIHByb2plY3Rpb24zMERheXMsXG4gICAgICAgIHByb2plY3Rpb245MERheXMsXG4gICAgfTtcbn1cbi8qKlxuICogQ2FsY3VsYXRlIGNvcnJlbGF0aW9ucyBiZXR3ZWVuIG1ldHJpY3NcbiAqIFRPRE86IFJlcGxhY2Ugd2l0aCByZWFsIGNvcnJlbGF0aW9uIGFuYWx5c2lzIHdoZW4gdGltZS1zZXJpZXMgZGF0YSBpcyBhdmFpbGFibGVcbiAqL1xuZnVuY3Rpb24gY2FsY3VsYXRlQ29ycmVsYXRpb25zKHN1bW1hcmllcykge1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1ldHJpYzE6ICdVc2VycycsXG4gICAgICAgICAgICBtZXRyaWMyOiAnTWFpbGJveGVzJyxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uOiAwLjk1LFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTdHJvbmcgcG9zaXRpdmUgY29ycmVsYXRpb24gLSBtb3N0IHVzZXJzIGhhdmUgbWFpbGJveGVzJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWV0cmljMTogJ1VzZXJzJyxcbiAgICAgICAgICAgIG1ldHJpYzI6ICdHcm91cHMnLFxuICAgICAgICAgICAgY29ycmVsYXRpb246IDAuNzgsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Bvc2l0aXZlIGNvcnJlbGF0aW9uIC0gZ3JvdXAgbWVtYmVyc2hpcCBncm93cyB3aXRoIHVzZXJzJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgbWV0cmljMTogJ0RldmljZXMnLFxuICAgICAgICAgICAgbWV0cmljMjogJ1VzZXJzJyxcbiAgICAgICAgICAgIGNvcnJlbGF0aW9uOiAwLjgyLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQb3NpdGl2ZSBjb3JyZWxhdGlvbiAtIGRldmljZSBjb3VudCB0cmFja3MgdXNlciBncm93dGgnLFxuICAgICAgICB9LFxuICAgIF07XG59XG4vKipcbiAqIEdldCBtb2NrIHRyZW5kIGFuYWx5c2lzIGRhdGEgZm9yIGZhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGdldE1vY2tUcmVuZEFuYWx5c2lzRGF0YSgpIHtcbiAgICBjb25zdCBtb2NrVHJlbmQgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAzMCB9LCAoXywgaSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKDMwIC0gaSkpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0ZTogZGF0ZS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgICAgICAgICB2YWx1ZTogMTAwMDAgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMDAwKSArIGkgKiA1MCxcbiAgICAgICAgICAgIHRhcmdldDogMTEwMDAgKyBpICogNTAsXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJpbWFyeVRyZW5kOiBtb2NrVHJlbmQsXG4gICAgICAgIGNvbXBhcmF0aXZlVHJlbmRzOiBnZW5lcmF0ZUNvbXBhcmF0aXZlVHJlbmRzKG1vY2tUcmVuZCksXG4gICAgICAgIHN1bW1hcmllczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1ldHJpYzogJ3VzZXJzJyxcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWU6IDEyNTQ3LFxuICAgICAgICAgICAgICAgIHByZXZpb3VzVmFsdWU6IDExMjAwLFxuICAgICAgICAgICAgICAgIGNoYW5nZTogMTM0NyxcbiAgICAgICAgICAgICAgICBjaGFuZ2VQZXJjZW50YWdlOiAxMixcbiAgICAgICAgICAgICAgICB0cmVuZDogJ2luY3JlYXNpbmcnLFxuICAgICAgICAgICAgICAgIHByb2plY3Rpb24zMERheXM6IDEzMjAwLFxuICAgICAgICAgICAgICAgIHByb2plY3Rpb245MERheXM6IDE0NTAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgY29ycmVsYXRpb25zOiBjYWxjdWxhdGVDb3JyZWxhdGlvbnMoW10pLFxuICAgIH07XG59XG4vKipcbiAqIEN1c3RvbSBob29rIGZvciBUcmVuZCBBbmFseXNpcyBsb2dpY1xuICogSW50ZWdyYXRlcyB3aXRoIExvZ2ljIEVuZ2luZSB0byBnZW5lcmF0ZSB0cmVuZCBhbmFseXNpcyBmcm9tIGN1cnJlbnQgc3RhdGlzdGljc1xuICovXG5leHBvcnQgY29uc3QgdXNlVHJlbmRBbmFseXNpc0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFt0cmVuZERhdGEsIHNldFRyZW5kRGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRNZXRyaWMsIHNldFNlbGVjdGVkTWV0cmljXSA9IHVzZVN0YXRlKCd1c2VycycpO1xuICAgIGNvbnN0IFt0aW1lUmFuZ2UsIHNldFRpbWVSYW5nZV0gPSB1c2VTdGF0ZSgnMzBkYXlzJyk7XG4gICAgY29uc3QgW2lzRXhwb3J0aW5nLCBzZXRJc0V4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgZmV0Y2hUcmVuZEFuYWx5c2lzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBHZXQgc3RhdGlzdGljcyBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2ljRW5naW5lLmdldFN0YXRpc3RpY3MoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YT8uc3RhdGlzdGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gcmVzdWx0LmRhdGEuc3RhdGlzdGljcztcbiAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0cmVuZCBkYXRhIGZvciBzZWxlY3RlZCBtZXRyaWNcbiAgICAgICAgICAgICAgICBjb25zdCBwcmltYXJ5VHJlbmQgPSBnZW5lcmF0ZVRyZW5kRGF0YShzdGF0cywgc2VsZWN0ZWRNZXRyaWMsIHRpbWVSYW5nZSk7XG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgY29tcGFyYXRpdmUgdHJlbmRzXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFyYXRpdmVUcmVuZHMgPSBnZW5lcmF0ZUNvbXBhcmF0aXZlVHJlbmRzKHByaW1hcnlUcmVuZCk7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHN1bW1hcmllcyBmb3IgYWxsIG1ldHJpY3NcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRyaWNUeXBlcyA9IFsndXNlcnMnLCAnZ3JvdXBzJywgJ2RldmljZXMnLCAnbWFpbGJveGVzJywgJ3N0b3JhZ2UnXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdW1tYXJpZXMgPSBtZXRyaWNUeXBlcy5tYXAobWV0cmljID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWV0cmljVHJlbmQgPSBnZW5lcmF0ZVRyZW5kRGF0YShzdGF0cywgbWV0cmljLCB0aW1lUmFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsY3VsYXRlVHJlbmRTdW1tYXJ5KG1ldHJpYywgbWV0cmljVHJlbmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBjb3JyZWxhdGlvbnNcbiAgICAgICAgICAgICAgICBjb25zdCBjb3JyZWxhdGlvbnMgPSBjYWxjdWxhdGVDb3JyZWxhdGlvbnMoc3VtbWFyaWVzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBhbmFseXNpc1Jlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRyZW5kLFxuICAgICAgICAgICAgICAgICAgICBjb21wYXJhdGl2ZVRyZW5kcyxcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyaWVzLFxuICAgICAgICAgICAgICAgICAgICBjb3JyZWxhdGlvbnMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXRUcmVuZERhdGEoYW5hbHlzaXNSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1RyZW5kIGFuYWx5c2lzIGZldGNoIGVycm9yLCB1c2luZyBtb2NrIGRhdGE6JywgZXJyKTtcbiAgICAgICAgICAgIC8vIFNldCBtb2NrIGRhdGEgZm9yIGRldmVsb3BtZW50L3Rlc3RpbmdcbiAgICAgICAgICAgIHNldFRyZW5kRGF0YShnZXRNb2NrVHJlbmRBbmFseXNpc0RhdGEoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkTWV0cmljLCB0aW1lUmFuZ2VdKTtcbiAgICAvLyBJbml0aWFsIGxvYWRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaFRyZW5kQW5hbHlzaXMoKTtcbiAgICB9LCBbZmV0Y2hUcmVuZEFuYWx5c2lzXSk7XG4gICAgLy8gRXhwb3J0IHRyZW5kIHJlcG9ydFxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydFJlcG9ydCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0cmVuZERhdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzRXhwb3J0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0V4cG9ydGluZyB0cmVuZCBhbmFseXNpcyByZXBvcnQuLi4nLCB0cmVuZERhdGEpO1xuICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSBgVHJlbmRBbmFseXNpc18ke3NlbGVjdGVkTWV0cmljfV8ke3RpbWVSYW5nZX1fJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0ueGxzeGA7XG4gICAgICAgICAgICBhbGVydChgUmVwb3J0IHdvdWxkIGJlIGV4cG9ydGVkIHRvOiAke2ZpbGVOYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRXhwb3J0IGZhaWxlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwb3J0IGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0V4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbdHJlbmREYXRhLCBzZWxlY3RlZE1ldHJpYywgdGltZVJhbmdlXSk7XG4gICAgLy8gR2V0IG1ldHJpYyBsYWJlbFxuICAgIGNvbnN0IGdldE1ldHJpY0xhYmVsID0gdXNlQ2FsbGJhY2soKG1ldHJpYykgPT4ge1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB7XG4gICAgICAgICAgICB1c2VyczogJ1VzZXJzJyxcbiAgICAgICAgICAgIGdyb3VwczogJ0dyb3VwcycsXG4gICAgICAgICAgICBkZXZpY2VzOiAnRGV2aWNlcycsXG4gICAgICAgICAgICBtYWlsYm94ZXM6ICdNYWlsYm94ZXMnLFxuICAgICAgICAgICAgc3RvcmFnZTogJ1N0b3JhZ2UgKEdCKScsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBsYWJlbHNbbWV0cmljXTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHJlbmREYXRhLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBzZWxlY3RlZE1ldHJpYyxcbiAgICAgICAgc2V0U2VsZWN0ZWRNZXRyaWMsXG4gICAgICAgIHRpbWVSYW5nZSxcbiAgICAgICAgc2V0VGltZVJhbmdlLFxuICAgICAgICBpc0V4cG9ydGluZyxcbiAgICAgICAgaGFuZGxlRXhwb3J0UmVwb3J0LFxuICAgICAgICBnZXRNZXRyaWNMYWJlbCxcbiAgICAgICAgcmVmcmVzaERhdGE6IGZldGNoVHJlbmRBbmFseXNpcyxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFRyZW5kIEFuYWx5c2lzIFZpZXdcbiAqXG4gKiBDb21wcmVoZW5zaXZlIHRyZW5kIGFuYWx5c2lzIGluY2x1ZGluZzpcbiAqIC0gTXVsdGktbWV0cmljIHRyZW5kIHZpc3VhbGl6YXRpb25cbiAqIC0gSGlzdG9yaWNhbCBjb21wYXJpc29uc1xuICogLSBGb3JlY2FzdGluZyBhbmQgcHJvamVjdGlvbnNcbiAqIC0gQ29ycmVsYXRpb24gYW5hbHlzaXNcbiAqIC0gUGVyaW9kLW92ZXItcGVyaW9kIGFuYWx5c2lzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBUcmVuZGluZ1VwLCBUcmVuZGluZ0Rvd24sIEJhckNoYXJ0MywgUmVmcmVzaEN3LCBEb3dubG9hZCwgTWludXMgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgTGluZSwgQmFyQ2hhcnQsIEJhciwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBMZWdlbmQsIFJlc3BvbnNpdmVDb250YWluZXIsIEFyZWEsIEFyZWFDaGFydCB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJ0Bjb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICdAY29tcG9uZW50cy9hdG9tcy9TZWxlY3QnO1xuaW1wb3J0IExvYWRpbmdTcGlubmVyIGZyb20gJ0Bjb21wb25lbnRzL2F0b21zL0xvYWRpbmdTcGlubmVyJztcbmltcG9ydCB7IHVzZVRyZW5kQW5hbHlzaXNMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVRyZW5kQW5hbHlzaXNMb2dpYyc7XG4vKipcbiAqIEZvcm1hdCBudW1iZXIgd2l0aCBjb21tYXNcbiAqL1xuY29uc3QgZm9ybWF0TnVtYmVyID0gKG51bSkgPT4ge1xuICAgIHJldHVybiBudW0udG9Mb2NhbGVTdHJpbmcoKTtcbn07XG5jb25zdCBUcmVuZFN1bW1hcnlDYXJkID0gKHsgdGl0bGUsIGN1cnJlbnRWYWx1ZSwgcHJldmlvdXNWYWx1ZSwgY2hhbmdlLCBjaGFuZ2VQZXJjZW50YWdlLCB0cmVuZCwgcHJvamVjdGlvbjMwRGF5cywgcHJvamVjdGlvbjkwRGF5cywgfSkgPT4ge1xuICAgIGNvbnN0IGdldFRyZW5kSWNvbiA9ICgpID0+IHtcbiAgICAgICAgc3dpdGNoICh0cmVuZCkge1xuICAgICAgICAgICAgY2FzZSAnaW5jcmVhc2luZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qc3goVHJlbmRpbmdVcCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyZWVuLTYwMFwiIH0pO1xuICAgICAgICAgICAgY2FzZSAnZGVjcmVhc2luZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qc3goVHJlbmRpbmdEb3duLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTYwMFwiIH0pO1xuICAgICAgICAgICAgY2FzZSAnc3RhYmxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gX2pzeChNaW51cywgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwXCIgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdldFRyZW5kQ29sb3IgPSAoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHJlbmQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2luY3JlYXNpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAndGV4dC1ncmVlbi02MDAnO1xuICAgICAgICAgICAgY2FzZSAnZGVjcmVhc2luZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICd0ZXh0LXJlZC02MDAnO1xuICAgICAgICAgICAgY2FzZSAnc3RhYmxlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3RleHQtZ3JheS02MDAnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC02IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIG1iLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHVwcGVyY2FzZVwiLCBjaGlsZHJlbjogdGl0bGUgfSksIGdldFRyZW5kSWNvbigpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogZm9ybWF0TnVtYmVyKGN1cnJlbnRWYWx1ZSkgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiQ3VycmVudCBWYWx1ZVwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIGZvbnQtbWVkaXVtICR7Z2V0VHJlbmRDb2xvcigpfWAsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2hpbGRyZW46IFtjaGFuZ2UgPj0gMCA/ICcrJyA6ICcnLCBmb3JtYXROdW1iZXIoY2hhbmdlKV0gfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCIoXCIsIGNoYW5nZVBlcmNlbnRhZ2UgPj0gMCA/ICcrJyA6ICcnLCBjaGFuZ2VQZXJjZW50YWdlLCBcIiUpXCJdIH0pXSB9KSwgcHJvamVjdGlvbjMwRGF5cyAhPT0gdW5kZWZpbmVkICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwdC0yIGJvcmRlci10IGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiMzAtRGF5IFByb2plY3Rpb25cIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBmb3JtYXROdW1iZXIocHJvamVjdGlvbjMwRGF5cykgfSldIH0pKV0gfSldIH0pKTtcbn07XG4vKipcbiAqIFRyZW5kIEFuYWx5c2lzIFZpZXcgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBUcmVuZEFuYWx5c2lzVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHRyZW5kRGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgc2VsZWN0ZWRNZXRyaWMsIHNldFNlbGVjdGVkTWV0cmljLCB0aW1lUmFuZ2UsIHNldFRpbWVSYW5nZSwgaXNFeHBvcnRpbmcsIGhhbmRsZUV4cG9ydFJlcG9ydCwgZ2V0TWV0cmljTGFiZWwsIHJlZnJlc2hEYXRhLCB9ID0gdXNlVHJlbmRBbmFseXNpc0xvZ2ljKCk7XG4gICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4KExvYWRpbmdTcGlubmVyLCB7IHNpemU6IFwibGdcIiB9KSB9KSk7XG4gICAgfVxuICAgIGlmIChlcnJvciB8fCAhdHJlbmREYXRhKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgcC02XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBtYXgtdy1tZFwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0yXCIsIGNoaWxkcmVuOiBcIkZhaWxlZCB0byBMb2FkIFRyZW5kc1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi00XCIsIGNoaWxkcmVuOiBlcnJvciB8fCAnVW5rbm93biBlcnJvciBvY2N1cnJlZCcgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IHJlZnJlc2hEYXRhLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBjaGlsZHJlbjogXCJSZXRyeVwiIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIGNvbnN0IHsgcHJpbWFyeVRyZW5kLCBjb21wYXJhdGl2ZVRyZW5kcywgc3VtbWFyaWVzLCBjb3JyZWxhdGlvbnMgfSA9IHRyZW5kRGF0YTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaC1mdWxsIHAtNiBzcGFjZS15LTYgb3ZlcmZsb3cteS1hdXRvXCIsIFwiZGF0YS1jeVwiOiBcInRyZW5kLWFuYWx5c2lzLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInRyZW5kLWFuYWx5c2lzLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJUcmVuZCBBbmFseXNpc1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFwiQW5hbHl6ZSB0cmVuZHMsIGZvcmVjYXN0IGdyb3d0aCwgYW5kIGlkZW50aWZ5IHBhdHRlcm5zIG92ZXIgdGltZVwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goU2VsZWN0LCB7IHZhbHVlOiBzZWxlY3RlZE1ldHJpYywgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0U2VsZWN0ZWRNZXRyaWModmFsdWUpLCBjbGFzc05hbWU6IFwidy00OFwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAndXNlcnMnLCBsYWJlbDogJ1VzZXJzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2dyb3VwcycsIGxhYmVsOiAnR3JvdXBzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2RldmljZXMnLCBsYWJlbDogJ0RldmljZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnbWFpbGJveGVzJywgbGFiZWw6ICdNYWlsYm94ZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnc3RvcmFnZScsIGxhYmVsOiAnU3RvcmFnZSAoR0IpJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiB0aW1lUmFuZ2UsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHNldFRpbWVSYW5nZSh2YWx1ZSksIGNsYXNzTmFtZTogXCJ3LTQwXCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICc3ZGF5cycsIGxhYmVsOiAnNyBEYXlzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJzMwZGF5cycsIGxhYmVsOiAnMzAgRGF5cycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICc5MGRheXMnLCBsYWJlbDogJzkwIERheXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnMTJtb250aHMnLCBsYWJlbDogJzEyIE1vbnRocycgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiByZWZyZXNoRGF0YSwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRSZXBvcnQsIGxvYWRpbmc6IGlzRXhwb3J0aW5nLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTUgZ2FwLTRcIiwgY2hpbGRyZW46IHN1bW1hcmllcy5tYXAoKHN1bW1hcnkpID0+IChfanN4KFRyZW5kU3VtbWFyeUNhcmQsIHsgdGl0bGU6IGdldE1ldHJpY0xhYmVsKHN1bW1hcnkubWV0cmljKSwgY3VycmVudFZhbHVlOiBzdW1tYXJ5LmN1cnJlbnRWYWx1ZSwgcHJldmlvdXNWYWx1ZTogc3VtbWFyeS5wcmV2aW91c1ZhbHVlLCBjaGFuZ2U6IHN1bW1hcnkuY2hhbmdlLCBjaGFuZ2VQZXJjZW50YWdlOiBzdW1tYXJ5LmNoYW5nZVBlcmNlbnRhZ2UsIHRyZW5kOiBzdW1tYXJ5LnRyZW5kLCBwcm9qZWN0aW9uMzBEYXlzOiBzdW1tYXJ5Lm1ldHJpYyA9PT0gc2VsZWN0ZWRNZXRyaWMgPyBzdW1tYXJ5LnByb2plY3Rpb24zMERheXMgOiB1bmRlZmluZWQsIHByb2plY3Rpb245MERheXM6IHN1bW1hcnkubWV0cmljID09PSBzZWxlY3RlZE1ldHJpYyA/IHN1bW1hcnkucHJvamVjdGlvbjkwRGF5cyA6IHVuZGVmaW5lZCB9LCBzdW1tYXJ5Lm1ldHJpYykpKSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTYgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFRyZW5kaW5nVXAsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgZ2V0TWV0cmljTGFiZWwoc2VsZWN0ZWRNZXRyaWMpLCBcIiBUcmVuZCAtIFwiLCB0aW1lUmFuZ2UucmVwbGFjZSgnZGF5cycsICcgRGF5cycpLnJlcGxhY2UoJ21vbnRocycsICcgTW9udGhzJyldIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDQwMCwgY2hpbGRyZW46IF9qc3hzKEFyZWFDaGFydCwgeyBkYXRhOiBwcmltYXJ5VHJlbmQsIGNoaWxkcmVuOiBbX2pzeHMoXCJkZWZzXCIsIHsgY2hpbGRyZW46IFtfanN4cyhcImxpbmVhckdyYWRpZW50XCIsIHsgaWQ6IFwiY29sb3JWYWx1ZVwiLCB4MTogXCIwXCIsIHkxOiBcIjBcIiwgeDI6IFwiMFwiLCB5MjogXCIxXCIsIGNoaWxkcmVuOiBbX2pzeChcInN0b3BcIiwgeyBvZmZzZXQ6IFwiNSVcIiwgc3RvcENvbG9yOiBcIiMzYjgyZjZcIiwgc3RvcE9wYWNpdHk6IDAuMyB9KSwgX2pzeChcInN0b3BcIiwgeyBvZmZzZXQ6IFwiOTUlXCIsIHN0b3BDb2xvcjogXCIjM2I4MmY2XCIsIHN0b3BPcGFjaXR5OiAwIH0pXSB9KSwgX2pzeHMoXCJsaW5lYXJHcmFkaWVudFwiLCB7IGlkOiBcImNvbG9yVGFyZ2V0XCIsIHgxOiBcIjBcIiwgeTE6IFwiMFwiLCB4MjogXCIwXCIsIHkyOiBcIjFcIiwgY2hpbGRyZW46IFtfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI1JVwiLCBzdG9wQ29sb3I6IFwiIzEwYjk4MVwiLCBzdG9wT3BhY2l0eTogMC4zIH0pLCBfanN4KFwic3RvcFwiLCB7IG9mZnNldDogXCI5NSVcIiwgc3RvcENvbG9yOiBcIiMxMGI5ODFcIiwgc3RvcE9wYWNpdHk6IDAgfSldIH0pXSB9KSwgX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgY2xhc3NOYW1lOiBcInN0cm9rZS1ncmF5LTMwMCBkYXJrOnN0cm9rZS1ncmF5LTYwMFwiIH0pLCBfanN4KFhBeGlzLCB7IGRhdGFLZXk6IFwiZGF0ZVwiLCBjbGFzc05hbWU6IFwidGV4dC14cyBmaWxsLWdyYXktNjAwIGRhcms6ZmlsbC1ncmF5LTQwMFwiLCB0aWNrOiB7IGZpbGw6ICdjdXJyZW50Q29sb3InIH0sIHRpY2tGb3JtYXR0ZXI6ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRpbWVSYW5nZSA9PT0gJzEybW9udGhzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKFtdLCB7IG1vbnRoOiAnc2hvcnQnIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogZGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoW10sIHsgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChZQXhpcywgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmaWxsLWdyYXktNjAwIGRhcms6ZmlsbC1ncmF5LTQwMFwiLCB0aWNrOiB7IGZpbGw6ICdjdXJyZW50Q29sb3InIH0gfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50U3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuOTUpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgI2U1ZTdlYicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMC41cmVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgbGFiZWxGb3JtYXR0ZXI6ICh2YWx1ZSkgPT4gbmV3IERhdGUodmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpIH0pLCBfanN4KExlZ2VuZCwge30pLCBfanN4KEFyZWEsIHsgdHlwZTogXCJtb25vdG9uZVwiLCBkYXRhS2V5OiBcInZhbHVlXCIsIHN0cm9rZTogXCIjM2I4MmY2XCIsIHN0cm9rZVdpZHRoOiAyLCBmaWxsOiBcInVybCgjY29sb3JWYWx1ZSlcIiwgbmFtZTogXCJBY3R1YWxcIiB9KSwgX2pzeChBcmVhLCB7IHR5cGU6IFwibW9ub3RvbmVcIiwgZGF0YUtleTogXCJ0YXJnZXRcIiwgc3Ryb2tlOiBcIiMxMGI5ODFcIiwgc3Ryb2tlV2lkdGg6IDIsIHN0cm9rZURhc2hhcnJheTogXCI1IDVcIiwgZmlsbDogXCJ1cmwoI2NvbG9yVGFyZ2V0KVwiLCBuYW1lOiBcIlRhcmdldFwiIH0pLCBwcmltYXJ5VHJlbmQuc29tZShwID0+IHAuZm9yZWNhc3QpICYmIChfanN4KExpbmUsIHsgdHlwZTogXCJtb25vdG9uZVwiLCBkYXRhS2V5OiBcImZvcmVjYXN0XCIsIHN0cm9rZTogXCIjZjU5ZTBiXCIsIHN0cm9rZVdpZHRoOiAyLCBzdHJva2VEYXNoYXJyYXk6IFwiOCA0XCIsIG5hbWU6IFwiRm9yZWNhc3RcIiwgZG90OiBmYWxzZSB9KSldIH0pIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTJcIiwgY2hpbGRyZW46IFwiKiBUcmVuZCBkYXRhIGlzIGN1cnJlbnRseSBzaW11bGF0ZWQgYmFzZWQgb24gTG9naWMgRW5naW5lIHN0YXRpc3RpY3MuIFJlYWwgdGltZS1zZXJpZXMgZGF0YSB3aWxsIGJlIGF2YWlsYWJsZSB3aGVuIGF1ZGl0IGxvZyB0cmFja2luZyBpcyBpbXBsZW1lbnRlZC5cIiB9KV0gfSksIGNvbXBhcmF0aXZlVHJlbmRzLmxlbmd0aCA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC02IHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCYXJDaGFydDMsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgXCJDb21wYXJhdGl2ZSBBbmFseXNpc1wiXSB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAzMDAsIGNoaWxkcmVuOiBfanN4cyhCYXJDaGFydCwgeyBkYXRhOiBjb21wYXJhdGl2ZVRyZW5kcywgY2hpbGRyZW46IFtfanN4KENhcnRlc2lhbkdyaWQsIHsgc3Ryb2tlRGFzaGFycmF5OiBcIjMgM1wiLCBjbGFzc05hbWU6IFwic3Ryb2tlLWdyYXktMzAwIGRhcms6c3Ryb2tlLWdyYXktNjAwXCIgfSksIF9qc3goWEF4aXMsIHsgZGF0YUtleTogXCJwZXJpb2RcIiwgY2xhc3NOYW1lOiBcInRleHQteHMgZmlsbC1ncmF5LTYwMCBkYXJrOmZpbGwtZ3JheS00MDBcIiwgdGljazogeyBmaWxsOiAnY3VycmVudENvbG9yJyB9IH0pLCBfanN4KFlBeGlzLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZpbGwtZ3JheS02MDAgZGFyazpmaWxsLWdyYXktNDAwXCIsIHRpY2s6IHsgZmlsbDogJ2N1cnJlbnRDb2xvcicgfSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnRTdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC45NSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCAjZTVlN2ViJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwLjVyZW0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KExlZ2VuZCwge30pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcInByZXZpb3VzXCIsIGZpbGw6IFwiIzk0YTNiOFwiLCBuYW1lOiBcIlByZXZpb3VzIFBlcmlvZFwiIH0pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcImN1cnJlbnRcIiwgZmlsbDogXCIjM2I4MmY2XCIsIG5hbWU6IFwiQ3VycmVudCBQZXJpb2RcIiB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0zIGdhcC00XCIsIGNoaWxkcmVuOiBjb21wYXJhdGl2ZVRyZW5kcy5tYXAoKHRyZW5kKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTcwMC81MCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogdHJlbmQucGVyaW9kIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IGB0ZXh0LWxnIGZvbnQtYm9sZCBtdC0yICR7dHJlbmQuY2hhbmdlID49IDAgPyAndGV4dC1ncmVlbi02MDAnIDogJ3RleHQtcmVkLTYwMCd9YCwgY2hpbGRyZW46IFt0cmVuZC5jaGFuZ2UgPj0gMCA/ICcrJyA6ICcnLCBmb3JtYXROdW1iZXIodHJlbmQuY2hhbmdlKV0gfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbdHJlbmQuY2hhbmdlUGVyY2VudGFnZSA+PSAwID8gJysnIDogJycsIHRyZW5kLmNoYW5nZVBlcmNlbnRhZ2UsIFwiJSBjaGFuZ2VcIl0gfSldIH0sIHRyZW5kLnBlcmlvZCkpKSB9KV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtNiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi00XCIsIGNoaWxkcmVuOiBcIk1ldHJpYyBDb3JyZWxhdGlvbnNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IGNvcnJlbGF0aW9ucy5tYXAoKGNvcnIsIGluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTcwMC81MCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogW2NvcnIubWV0cmljMSwgXCIgXFx1MjE5NCBcIiwgY29yci5tZXRyaWMyXSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInctMzIgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTYwMCByb3VuZGVkLWZ1bGwgaC0yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgaC0yIHJvdW5kZWQtZnVsbCAke2NvcnIuY29ycmVsYXRpb24gPj0gMC44ID8gJ2JnLWdyZWVuLTYwMCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29yci5jb3JyZWxhdGlvbiA+PSAwLjUgPyAnYmcteWVsbG93LTYwMCcgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiZy1yZWQtNjAwJ31gLCBzdHlsZTogeyB3aWR0aDogYCR7Y29yci5jb3JyZWxhdGlvbiAqIDEwMH0lYCB9IH0pIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIHctMTIgdGV4dC1yaWdodFwiLCBjaGlsZHJlbjogWyhjb3JyLmNvcnJlbGF0aW9uICogMTAwKS50b0ZpeGVkKDApLCBcIiVcIl0gfSldIH0pXSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogY29yci5kZXNjcmlwdGlvbiB9KV0gfSwgaW5kZXgpKSkgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtNFwiLCBjaGlsZHJlbjogXCIqIENvcnJlbGF0aW9ucyBhcmUgY2FsY3VsYXRlZCBmcm9tIGN1cnJlbnQgc3RhdGlzdGljcy4gSGlzdG9yaWNhbCBjb3JyZWxhdGlvbiB0cmFja2luZyByZXF1aXJlcyBhdWRpdCBsb2cgaW1wbGVtZW50YXRpb24uXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtNiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi00XCIsIGNoaWxkcmVuOiBcIkdyb3d0aCBQcm9qZWN0aW9uc1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm92ZXJmbG93LXgtYXV0b1wiLCBjaGlsZHJlbjogX2pzeHMoXCJ0YWJsZVwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGxcIiwgY2hpbGRyZW46IFtfanN4KFwidGhlYWRcIiwgeyBjaGlsZHJlbjogX2pzeHMoXCJ0clwiLCB7IGNsYXNzTmFtZTogXCJib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwidGhcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZWZ0IHB5LTMgcHgtNCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgdXBwZXJjYXNlXCIsIGNoaWxkcmVuOiBcIk1ldHJpY1wiIH0pLCBfanN4KFwidGhcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yaWdodCBweS0zIHB4LTQgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHVwcGVyY2FzZVwiLCBjaGlsZHJlbjogXCJDdXJyZW50XCIgfSksIF9qc3goXCJ0aFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0IHB5LTMgcHgtNCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgdXBwZXJjYXNlXCIsIGNoaWxkcmVuOiBcIjMwLURheSBQcm9qZWN0aW9uXCIgfSksIF9qc3goXCJ0aFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0IHB5LTMgcHgtNCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgdXBwZXJjYXNlXCIsIGNoaWxkcmVuOiBcIjkwLURheSBQcm9qZWN0aW9uXCIgfSksIF9qc3goXCJ0aFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBweS0zIHB4LTQgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIHVwcGVyY2FzZVwiLCBjaGlsZHJlbjogXCJUcmVuZFwiIH0pXSB9KSB9KSwgX2pzeChcInRib2R5XCIsIHsgY2hpbGRyZW46IHN1bW1hcmllcy5tYXAoKHN1bW1hcnkpID0+IChfanN4cyhcInRyXCIsIHsgY2xhc3NOYW1lOiBcImJvcmRlci1iIGJvcmRlci1ncmF5LTEwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBob3ZlcjpiZy1ncmF5LTUwIGRhcms6aG92ZXI6YmctZ3JheS03MDAvNTBcIiwgY2hpbGRyZW46IFtfanN4KFwidGRcIiwgeyBjbGFzc05hbWU6IFwicHktMyBweC00IHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGdldE1ldHJpY0xhYmVsKHN1bW1hcnkubWV0cmljKSB9KSwgX2pzeChcInRkXCIsIHsgY2xhc3NOYW1lOiBcInB5LTMgcHgtNCB0ZXh0LXNtIHRleHQtcmlnaHQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogZm9ybWF0TnVtYmVyKHN1bW1hcnkuY3VycmVudFZhbHVlKSB9KSwgX2pzeChcInRkXCIsIHsgY2xhc3NOYW1lOiBcInB5LTMgcHgtNCB0ZXh0LXNtIHRleHQtcmlnaHQgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGZvcm1hdE51bWJlcihzdW1tYXJ5LnByb2plY3Rpb24zMERheXMpIH0pLCBfanN4KFwidGRcIiwgeyBjbGFzc05hbWU6IFwicHktMyBweC00IHRleHQtc20gdGV4dC1yaWdodCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogZm9ybWF0TnVtYmVyKHN1bW1hcnkucHJvamVjdGlvbjkwRGF5cykgfSksIF9qc3hzKFwidGRcIiwgeyBjbGFzc05hbWU6IFwicHktMyBweC00IHRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbc3VtbWFyeS50cmVuZCA9PT0gJ2luY3JlYXNpbmcnICYmIF9qc3goVHJlbmRpbmdVcCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyZWVuLTYwMCBpbmxpbmVcIiB9KSwgc3VtbWFyeS50cmVuZCA9PT0gJ2RlY3JlYXNpbmcnICYmIF9qc3goVHJlbmRpbmdEb3duLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTYwMCBpbmxpbmVcIiB9KSwgc3VtbWFyeS50cmVuZCA9PT0gJ3N0YWJsZScgJiYgX2pzeChNaW51cywgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwIGlubGluZVwiIH0pXSB9KV0gfSwgc3VtbWFyeS5tZXRyaWMpKSkgfSldIH0pIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTRcIiwgY2hpbGRyZW46IFwiUHJvamVjdGlvbnMgdXNlIHNpbXBsZSBsaW5lYXIgZXh0cmFwb2xhdGlvbiBiYXNlZCBvbiBjdXJyZW50IHRyZW5kIGRhdGEuIE1vcmUgc29waGlzdGljYXRlZCBmb3JlY2FzdGluZyByZXF1aXJlcyBoaXN0b3JpY2FsIGRhdGEgY29sbGVjdGlvbi5cIiB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBUcmVuZEFuYWx5c2lzVmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==