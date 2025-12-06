(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5035],{

/***/ 68827:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 71926:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 93746:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ analytics_MigrationReportView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/recharts/es6/index.js + 3 modules
var es6 = __webpack_require__(72085);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useMigrationReportLogic.ts

const useMigrationReportLogic = () => {
    const [reportData, setReportData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [isExporting, setIsExporting] = (0,react.useState)(false);
    const [selectedWave, setSelectedWave] = (0,react.useState)('all');
    const fetchReportData = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Execute PowerShell script to get migration report data
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Analytics/MigrationReport.psm1',
                functionName: 'Get-MigrationReportData',
                parameters: {
                    waveId: selectedWave === 'all' ? null : selectedWave,
                },
            });
            if (result.success && result.data) {
                const data = {
                    statistics: calculateStatistics(result.data),
                    waveTimeline: result.data.waveTimeline || [],
                    errorBreakdown: calculateErrorBreakdown(result.data.errors || []),
                    topErrors: result.data.topErrors || [],
                    successRateByType: result.data.successRateByType || [],
                };
                setReportData(data);
            }
            else {
                throw new Error(result.error || 'Failed to fetch report data');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            console.error('Migration report fetch error:', err);
            // Set mock data for development/testing
            setReportData(getMockReportData());
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedWave]);
    // Calculate migration statistics
    const calculateStatistics = (data) => {
        const totalAttempted = data.totalAttempted || 0;
        const totalSucceeded = data.totalSucceeded || 0;
        const totalFailed = data.totalFailed || 0;
        const successRate = totalAttempted > 0 ? Math.round((totalSucceeded / totalAttempted) * 100) : 0;
        return {
            totalAttempted,
            totalSucceeded,
            totalFailed,
            successRate,
            averageDurationMinutes: data.averageDurationMinutes || 0,
            totalErrors: data.totalErrors || 0,
        };
    };
    // Calculate error breakdown with percentages
    const calculateErrorBreakdown = (errors) => {
        const errorCounts = errors.reduce((acc, error) => {
            const type = error.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        const total = Object.values(errorCounts).reduce((sum, count) => sum + count, 0);
        if (total === 0)
            return [];
        return Object.entries(errorCounts)
            .map(([errorType, count]) => ({
            errorType,
            count,
            percentage: Math.round((count / total) * 100),
        }))
            .sort((a, b) => b.count - a.count);
    };
    // Mock data for development/testing
    const getMockReportData = () => ({
        statistics: {
            totalAttempted: 12547,
            totalSucceeded: 11834,
            totalFailed: 713,
            successRate: 94,
            averageDurationMinutes: 23,
            totalErrors: 1247,
        },
        waveTimeline: [
            {
                waveName: 'Wave 1 - Executive Team',
                startDate: '2025-09-01',
                endDate: '2025-09-05',
                status: 'completed',
                progress: 100,
                duration: 4,
            },
            {
                waveName: 'Wave 2 - Sales Department',
                startDate: '2025-09-08',
                endDate: '2025-09-15',
                status: 'completed',
                progress: 100,
                duration: 7,
            },
            {
                waveName: 'Wave 3 - Engineering',
                startDate: '2025-09-16',
                endDate: '2025-09-25',
                status: 'completed',
                progress: 100,
                duration: 9,
            },
            {
                waveName: 'Wave 4 - Operations',
                startDate: '2025-09-26',
                endDate: '2025-10-02',
                status: 'in_progress',
                progress: 75,
                duration: 6,
            },
            {
                waveName: 'Wave 5 - Support & Admin',
                startDate: '2025-10-05',
                endDate: '2025-10-12',
                status: 'pending',
                progress: 0,
                duration: 0,
            },
        ],
        errorBreakdown: [
            { errorType: 'Authentication Failed', count: 423, percentage: 34 },
            { errorType: 'Mailbox Size Limit', count: 312, percentage: 25 },
            { errorType: 'License Assignment', count: 234, percentage: 19 },
            { errorType: 'Network Timeout', count: 156, percentage: 12 },
            { errorType: 'Permission Denied', count: 122, percentage: 10 },
        ],
        topErrors: [
            {
                errorMessage: 'Failed to authenticate with source tenant',
                count: 423,
                affectedUsers: 389,
                lastOccurrence: '2025-10-02 14:32:15',
            },
            {
                errorMessage: 'Mailbox exceeds maximum size for migration',
                count: 312,
                affectedUsers: 312,
                lastOccurrence: '2025-10-02 16:45:23',
            },
            {
                errorMessage: 'Unable to assign required license',
                count: 234,
                affectedUsers: 198,
                lastOccurrence: '2025-10-01 11:20:45',
            },
            {
                errorMessage: 'Connection timeout during data transfer',
                count: 156,
                affectedUsers: 142,
                lastOccurrence: '2025-09-30 09:15:30',
            },
            {
                errorMessage: 'Insufficient permissions on target',
                count: 122,
                affectedUsers: 115,
                lastOccurrence: '2025-09-29 15:40:12',
            },
        ],
        successRateByType: [
            { type: 'User Accounts', successRate: 96, total: 8500, succeeded: 8160, failed: 340 },
            { type: 'Mailboxes', successRate: 92, total: 8200, succeeded: 7544, failed: 656 },
            { type: 'OneDrive', successRate: 94, total: 7800, succeeded: 7332, failed: 468 },
            { type: 'SharePoint Sites', successRate: 89, total: 450, succeeded: 401, failed: 49 },
            { type: 'Teams', successRate: 91, total: 350, succeeded: 319, failed: 31 },
        ],
    });
    // Initial load
    (0,react.useEffect)(() => {
        fetchReportData();
    }, [fetchReportData]);
    // Export PDF Report
    const handleExportPDF = (0,react.useCallback)(async () => {
        if (!reportData)
            return;
        setIsExporting(true);
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Analytics/ExportReport.psm1',
                functionName: 'Export-MigrationReport',
                parameters: {
                    data: reportData,
                    waveId: selectedWave,
                    format: 'pdf',
                },
            });
            if (result.success) {
                console.log('PDF report exported successfully:', result.data.filePath);
                // Could trigger a success notification here
            }
            else {
                throw new Error(result.error || 'PDF export failed');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'PDF export failed';
            setError(errorMessage);
            console.error('PDF export error:', err);
        }
        finally {
            setIsExporting(false);
        }
    }, [reportData, selectedWave]);
    // Export Excel Report
    const handleExportExcel = (0,react.useCallback)(async () => {
        if (!reportData)
            return;
        setIsExporting(true);
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Analytics/ExportReport.psm1',
                functionName: 'Export-MigrationReport',
                parameters: {
                    data: reportData,
                    waveId: selectedWave,
                    format: 'excel',
                },
            });
            if (result.success) {
                console.log('Excel report exported successfully:', result.data.filePath);
            }
            else {
                throw new Error(result.error || 'Excel export failed');
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Excel export failed';
            setError(errorMessage);
            console.error('Excel export error:', err);
        }
        finally {
            setIsExporting(false);
        }
    }, [reportData, selectedWave]);
    // Get available waves for filter
    const availableWaves = (0,react.useMemo)(() => {
        if (!reportData)
            return [];
        return reportData.waveTimeline.map(w => ({ id: w.waveName, name: w.waveName }));
    }, [reportData]);
    // Calculate overall progress
    const overallProgress = (0,react.useMemo)(() => {
        if (!reportData || reportData.waveTimeline.length === 0)
            return 0;
        const totalProgress = reportData.waveTimeline.reduce((sum, wave) => sum + wave.progress, 0);
        return Math.round(totalProgress / reportData.waveTimeline.length);
    }, [reportData]);
    return {
        reportData,
        isLoading,
        error,
        isExporting,
        selectedWave,
        setSelectedWave,
        availableWaves,
        overallProgress,
        handleExportPDF,
        handleExportExcel,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
;// ./src/renderer/views/analytics/MigrationReportView.tsx







const StatCard = ({ title, value, icon, color, subtitle, 'data-cy': dataCy }) => ((0,jsx_runtime.jsx)("div", { className: "p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm", "data-cy": dataCy, children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0,jsx_runtime.jsx)("div", { className: `p-3 rounded-lg ${color}`, children: icon }), (0,jsx_runtime.jsxs)("div", { className: "text-right", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: title }), (0,jsx_runtime.jsx)("p", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100", children: typeof value === 'number' ? value.toLocaleString() : value }), subtitle && (0,jsx_runtime.jsx)("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: subtitle })] })] }) }));
// Loading Skeleton
const ReportSkeleton = () => ((0,jsx_runtime.jsxs)("div", { className: "h-full p-6 space-y-6 animate-pulse", children: [(0,jsx_runtime.jsx)("div", { className: "h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [...Array(4)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [...Array(4)].map((_, i) => ((0,jsx_runtime.jsx)("div", { className: "h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" }, i))) })] }));
// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: label }), payload.map((entry, index) => ((0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { style: { color: entry.color }, children: [entry.name, ": "] }), (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value })] }, index)))] }));
};
// Gantt-style Timeline Component
const WaveTimeline = ({ data }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'in_progress':
                return 'bg-blue-500';
            case 'failed':
                return 'bg-red-500';
            case 'pending':
                return 'bg-gray-400';
            default:
                return 'bg-gray-300';
        }
    };
    const getStatusLabel = (status) => {
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    return ((0,jsx_runtime.jsx)("div", { className: "space-y-4", children: (data ?? []).map((wave, index) => ((0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: wave.waveName }), (0,jsx_runtime.jsx)("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${wave.status === 'completed'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : wave.status === 'in_progress'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : wave.status === 'failed'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'}`, children: getStatusLabel(wave.status) })] }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: [wave.startDate, " \u2192 ", wave.endDate, wave.duration > 0 && ` (${wave.duration} days)`] })] }), (0,jsx_runtime.jsx)("div", { className: "relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden", children: (0,jsx_runtime.jsx)("div", { className: `absolute top-0 left-0 h-full ${getStatusColor(wave.status)} transition-all duration-500`, style: { width: `${wave.progress}%` }, children: (0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full", children: (0,jsx_runtime.jsxs)("span", { className: "text-xs font-medium text-white", children: [wave.progress, "%"] }) }) }) })] }, index))) }));
};
// Success Rate Gauge Component
const SuccessGauge = ({ successRate }) => {
    const data = [{ name: 'Success Rate', value: successRate, fill: successRate >= 90 ? '#10b981' : successRate >= 75 ? '#f59e0b' : '#ef4444' }];
    return ((0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 250, children: (0,jsx_runtime.jsxs)(es6/* RadialBarChart */.DP, { cx: "50%", cy: "50%", innerRadius: "60%", outerRadius: "90%", barSize: 30, data: data, startAngle: 180, endAngle: 0, children: [(0,jsx_runtime.jsx)(es6/* RadialBar */.ZB, { background: true, dataKey: "value", cornerRadius: 10 }), (0,jsx_runtime.jsxs)("text", { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "middle", className: "text-4xl font-bold fill-gray-900 dark:fill-gray-100", children: [successRate, "%"] }), (0,jsx_runtime.jsx)("text", { x: "50%", y: "60%", textAnchor: "middle", dominantBaseline: "middle", className: "text-sm fill-gray-500", children: "Success Rate" })] }) }));
};
const MigrationReportView = () => {
    const { reportData, isLoading, error, isExporting, selectedWave, setSelectedWave, availableWaves, overallProgress, handleExportPDF, handleExportExcel, } = useMigrationReportLogic();
    const isDarkMode = document.documentElement.classList.contains('dark');
    // Chart theme
    const chartTheme = {
        textColor: isDarkMode ? '#f9fafb' : '#1f2937',
        gridColor: isDarkMode ? '#374151' : '#e5e7eb',
    };
    // Color palette
    const COLORS = {
        success: isDarkMode ? '#34d399' : '#10b981',
        danger: isDarkMode ? '#f87171' : '#ef4444',
        warning: isDarkMode ? '#fbbf24' : '#f59e0b',
        primary: isDarkMode ? '#60a5fa' : '#3b82f6',
        purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
    };
    const PIE_COLORS = [COLORS.danger, COLORS.warning, COLORS.primary, COLORS.purple, '#f472b6'];
    if (isLoading) {
        return (0,jsx_runtime.jsx)(ReportSkeleton, {});
    }
    if (error) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", "data-cy": "report-error", "data-testid": "report-error", children: (0,jsx_runtime.jsx)("div", { className: "text-center", children: (0,jsx_runtime.jsx)("p", { className: "text-red-600 dark:text-red-400 text-lg", children: error }) }) }));
    }
    if (!reportData) {
        return ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-500 dark:text-gray-400", children: "No report data available" }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "migration-report-view", "data-testid": "migration-report-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Migration Report" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Overall Progress: ", overallProgress, "%"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: selectedWave, onChange: (value) => setSelectedWave(value), className: "w-48", "data-cy": "wave-filter", "data-testid": "wave-filter", options: [
                                            { value: 'all', label: 'All Waves' },
                                            ...availableWaves.map(wave => ({ value: wave.id, label: wave.name }))
                                        ] })] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExportExcel, variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-excel-btn", "data-testid": "export-excel-btn", children: "Export Excel" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExportPDF, variant: "primary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-pdf-btn", "data-testid": "export-pdf-btn", children: "Download PDF" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0,jsx_runtime.jsx)(StatCard, { title: "Total Migrations", value: reportData.statistics.totalAttempted, icon: (0,jsx_runtime.jsx)(lucide_react/* Clock */.zD7, { className: "w-6 h-6 text-white" }), color: "bg-blue-500", subtitle: "Attempted", "data-cy": "stat-total", "data-testid": "stat-total" }), (0,jsx_runtime.jsx)(StatCard, { title: "Successful", value: reportData.statistics.totalSucceeded, icon: (0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-6 h-6 text-white" }), color: "bg-green-500", subtitle: `${reportData.statistics.successRate}% success rate`, "data-cy": "stat-success", "data-testid": "stat-success" }), (0,jsx_runtime.jsx)(StatCard, { title: "Failed", value: reportData.statistics.totalFailed, icon: (0,jsx_runtime.jsx)(lucide_react/* XCircle */.Jpz, { className: "w-6 h-6 text-white" }), color: "bg-red-500", subtitle: `${reportData.statistics.totalErrors} errors`, "data-cy": "stat-failed", "data-testid": "stat-failed" }), (0,jsx_runtime.jsx)(StatCard, { title: "Avg. Duration", value: `${reportData.statistics.averageDurationMinutes} min`, icon: (0,jsx_runtime.jsx)(lucide_react/* Clock */.zD7, { className: "w-6 h-6 text-white" }), color: "bg-purple-500", subtitle: "Per migration", "data-cy": "stat-duration", "data-testid": "stat-duration" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Overall Success Rate" }), (0,jsx_runtime.jsx)(SuccessGauge, { successRate: reportData.statistics.successRate }), (0,jsx_runtime.jsxs)("div", { className: "mt-4 grid grid-cols-2 gap-4 text-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: reportData.statistics.totalSucceeded.toLocaleString() }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Succeeded" })] }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: reportData.statistics.totalFailed.toLocaleString() }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Failed" })] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Success Rate by Type" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 250, children: (0,jsx_runtime.jsxs)(es6/* BarChart */.Es, { data: reportData.successRateByType, layout: "horizontal", children: [(0,jsx_runtime.jsx)(es6/* CartesianGrid */.dC, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6/* XAxis */.WX, { type: "number", domain: [0, 100], stroke: chartTheme.textColor }), (0,jsx_runtime.jsx)(es6/* YAxis */.h8, { type: "category", dataKey: "type", stroke: chartTheme.textColor, width: 120 }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6/* Bar */.yP, { dataKey: "successRate", fill: COLORS.success, radius: [0, 8, 8, 0], name: "Success Rate %" })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Migration Timeline" }), (0,jsx_runtime.jsx)(WaveTimeline, { data: reportData.waveTimeline })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Error Breakdown" }), (0,jsx_runtime.jsx)(es6/* ResponsiveContainer */.uf, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6/* PieChart */.rW, { children: [(0,jsx_runtime.jsx)(es6/* Pie */.Fq, { data: reportData.errorBreakdown, cx: "50%", cy: "50%", labelLine: false, label: ({ errorType, percentage }) => `${errorType}: ${percentage}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: reportData.errorBreakdown.map((entry, index) => ((0,jsx_runtime.jsx)(es6/* Cell */.fh, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6/* Tooltip */.m_, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* AlertCircle */.RIJ, { className: "w-5 h-5 text-red-500" }), "Top Errors"] }), (0,jsx_runtime.jsx)("div", { className: "space-y-3", children: reportData.topErrors.map((error, index) => ((0,jsx_runtime.jsxs)("div", { className: "p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 flex-1", children: error.errorMessage }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-bold text-red-600 dark:text-red-400 ml-2", children: [error.count, "\u00D7"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { children: [error.affectedUsers, " users affected"] }), (0,jsx_runtime.jsx)("span", { children: "\u2022" }), (0,jsx_runtime.jsxs)("span", { children: ["Last: ", error.lastOccurrence] })] })] }, index))) })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Export Report" }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "space-y-3", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Report Includes:" }), (0,jsx_runtime.jsxs)("ul", { className: "space-y-2 text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-green-500" }), "Executive summary with key metrics"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-green-500" }), "Detailed wave-by-wave analysis"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-green-500" }), "Complete error log with recommendations"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-green-500" }), "Success rate breakdown by resource type"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-green-500" }), "Visual charts and timeline graphs"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex flex-col justify-center gap-3", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExportPDF, variant: "primary", size: "lg", icon: (0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-5 h-5" }), disabled: isExporting, "data-cy": "download-pdf-report", "data-testid": "download-pdf-report", children: isExporting ? 'Generating...' : 'Download PDF Report' }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExportExcel, variant: "secondary", size: "lg", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-5 h-5" }), disabled: isExporting, "data-cy": "download-excel-report", "data-testid": "download-excel-report", children: isExporting ? 'Exporting...' : 'Export to Excel' })] })] })] })] })] }));
};
/* harmony default export */ const analytics_MigrationReportView = (MigrationReportView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFVLCtEQUErRCxvQkFBSyxVQUFVLG1DQUFtQyxtQkFBSSxTQUFTLGlHQUFpRyxHQUFHLG9CQUFLLFNBQVMsNEVBQTRFLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsaUNBQVcsSUFBSSxxQ0FBcUMsMENBQTBDLEdBQUcsb0JBQUssU0FBUyxpREFBaUQsbUJBQUksQ0FBQyxpQ0FBVyxJQUFJLHFDQUFxQyxzQ0FBc0MsR0FBRyxvQkFBSyxTQUFTLGlEQUFpRCxtQkFBSSxDQUFDLGlDQUFXLElBQUkscUNBQXFDLCtDQUErQyxHQUFHLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsaUNBQVcsSUFBSSxxQ0FBcUMsK0NBQStDLEdBQUcsb0JBQUssU0FBUyxpREFBaUQsbUJBQUksQ0FBQyxpQ0FBVyxJQUFJLHFDQUFxQyx5Q0FBeUMsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSw0REFBNEQsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLGdFQUFnRSxtQkFBSSxDQUFDLDhCQUFRLElBQUksc0JBQXNCLG1LQUFtSyxHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxvRUFBb0UsbUJBQUksQ0FBQyw4QkFBUSxJQUFJLHNCQUFzQixrS0FBa0ssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ3B4UDtBQUNBLG9FQUFlLG1CQUFtQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxDOlxcRW50ZXJwcmlzZURpc2NvdmVyeVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xcZXMtdG9vbGtpdFxcZGlzdFxccHJlZGljYXRlfHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxyZWNoYXJ0c1xcbm9kZV9tb2R1bGVzXFxAcmVkdXhqc1xcdG9vbGtpdFxcZGlzdHxwcm9jZXNzL2Jyb3dzZXIiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlTWlncmF0aW9uUmVwb3J0TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYW5hbHl0aWNzL01pZ3JhdGlvblJlcG9ydFZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuZXhwb3J0IGNvbnN0IHVzZU1pZ3JhdGlvblJlcG9ydExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtyZXBvcnREYXRhLCBzZXRSZXBvcnREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0V4cG9ydGluZywgc2V0SXNFeHBvcnRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtzZWxlY3RlZFdhdmUsIHNldFNlbGVjdGVkV2F2ZV0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgZmV0Y2hSZXBvcnREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIFBvd2VyU2hlbGwgc2NyaXB0IHRvIGdldCBtaWdyYXRpb24gcmVwb3J0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9BbmFseXRpY3MvTWlncmF0aW9uUmVwb3J0LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0dldC1NaWdyYXRpb25SZXBvcnREYXRhJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVJZDogc2VsZWN0ZWRXYXZlID09PSAnYWxsJyA/IG51bGwgOiBzZWxlY3RlZFdhdmUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGlzdGljczogY2FsY3VsYXRlU3RhdGlzdGljcyhyZXN1bHQuZGF0YSksXG4gICAgICAgICAgICAgICAgICAgIHdhdmVUaW1lbGluZTogcmVzdWx0LmRhdGEud2F2ZVRpbWVsaW5lIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckJyZWFrZG93bjogY2FsY3VsYXRlRXJyb3JCcmVha2Rvd24ocmVzdWx0LmRhdGEuZXJyb3JzIHx8IFtdKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wRXJyb3JzOiByZXN1bHQuZGF0YS50b3BFcnJvcnMgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NSYXRlQnlUeXBlOiByZXN1bHQuZGF0YS5zdWNjZXNzUmF0ZUJ5VHlwZSB8fCBbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldFJlcG9ydERhdGEoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggcmVwb3J0IGRhdGEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ01pZ3JhdGlvbiByZXBvcnQgZmV0Y2ggZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIC8vIFNldCBtb2NrIGRhdGEgZm9yIGRldmVsb3BtZW50L3Rlc3RpbmdcbiAgICAgICAgICAgIHNldFJlcG9ydERhdGEoZ2V0TW9ja1JlcG9ydERhdGEoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkV2F2ZV0pO1xuICAgIC8vIENhbGN1bGF0ZSBtaWdyYXRpb24gc3RhdGlzdGljc1xuICAgIGNvbnN0IGNhbGN1bGF0ZVN0YXRpc3RpY3MgPSAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB0b3RhbEF0dGVtcHRlZCA9IGRhdGEudG90YWxBdHRlbXB0ZWQgfHwgMDtcbiAgICAgICAgY29uc3QgdG90YWxTdWNjZWVkZWQgPSBkYXRhLnRvdGFsU3VjY2VlZGVkIHx8IDA7XG4gICAgICAgIGNvbnN0IHRvdGFsRmFpbGVkID0gZGF0YS50b3RhbEZhaWxlZCB8fCAwO1xuICAgICAgICBjb25zdCBzdWNjZXNzUmF0ZSA9IHRvdGFsQXR0ZW1wdGVkID4gMCA/IE1hdGgucm91bmQoKHRvdGFsU3VjY2VlZGVkIC8gdG90YWxBdHRlbXB0ZWQpICogMTAwKSA6IDA7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbEF0dGVtcHRlZCxcbiAgICAgICAgICAgIHRvdGFsU3VjY2VlZGVkLFxuICAgICAgICAgICAgdG90YWxGYWlsZWQsXG4gICAgICAgICAgICBzdWNjZXNzUmF0ZSxcbiAgICAgICAgICAgIGF2ZXJhZ2VEdXJhdGlvbk1pbnV0ZXM6IGRhdGEuYXZlcmFnZUR1cmF0aW9uTWludXRlcyB8fCAwLFxuICAgICAgICAgICAgdG90YWxFcnJvcnM6IGRhdGEudG90YWxFcnJvcnMgfHwgMCxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8vIENhbGN1bGF0ZSBlcnJvciBicmVha2Rvd24gd2l0aCBwZXJjZW50YWdlc1xuICAgIGNvbnN0IGNhbGN1bGF0ZUVycm9yQnJlYWtkb3duID0gKGVycm9ycykgPT4ge1xuICAgICAgICBjb25zdCBlcnJvckNvdW50cyA9IGVycm9ycy5yZWR1Y2UoKGFjYywgZXJyb3IpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBlcnJvci50eXBlIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgIGFjY1t0eXBlXSA9IChhY2NbdHlwZV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwge30pO1xuICAgICAgICBjb25zdCB0b3RhbCA9IE9iamVjdC52YWx1ZXMoZXJyb3JDb3VudHMpLnJlZHVjZSgoc3VtLCBjb3VudCkgPT4gc3VtICsgY291bnQsIDApO1xuICAgICAgICBpZiAodG90YWwgPT09IDApXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBPYmplY3QuZW50cmllcyhlcnJvckNvdW50cylcbiAgICAgICAgICAgIC5tYXAoKFtlcnJvclR5cGUsIGNvdW50XSkgPT4gKHtcbiAgICAgICAgICAgIGVycm9yVHlwZSxcbiAgICAgICAgICAgIGNvdW50LFxuICAgICAgICAgICAgcGVyY2VudGFnZTogTWF0aC5yb3VuZCgoY291bnQgLyB0b3RhbCkgKiAxMDApLFxuICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLmNvdW50IC0gYS5jb3VudCk7XG4gICAgfTtcbiAgICAvLyBNb2NrIGRhdGEgZm9yIGRldmVsb3BtZW50L3Rlc3RpbmdcbiAgICBjb25zdCBnZXRNb2NrUmVwb3J0RGF0YSA9ICgpID0+ICh7XG4gICAgICAgIHN0YXRpc3RpY3M6IHtcbiAgICAgICAgICAgIHRvdGFsQXR0ZW1wdGVkOiAxMjU0NyxcbiAgICAgICAgICAgIHRvdGFsU3VjY2VlZGVkOiAxMTgzNCxcbiAgICAgICAgICAgIHRvdGFsRmFpbGVkOiA3MTMsXG4gICAgICAgICAgICBzdWNjZXNzUmF0ZTogOTQsXG4gICAgICAgICAgICBhdmVyYWdlRHVyYXRpb25NaW51dGVzOiAyMyxcbiAgICAgICAgICAgIHRvdGFsRXJyb3JzOiAxMjQ3LFxuICAgICAgICB9LFxuICAgICAgICB3YXZlVGltZWxpbmU6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3YXZlTmFtZTogJ1dhdmUgMSAtIEV4ZWN1dGl2ZSBUZWFtJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICcyMDI1LTA5LTAxJyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnMjAyNS0wOS0wNScsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3YXZlTmFtZTogJ1dhdmUgMiAtIFNhbGVzIERlcGFydG1lbnQnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJzIwMjUtMDktMDgnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICcyMDI1LTA5LTE1JyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAxMDAsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdhdmVOYW1lOiAnV2F2ZSAzIC0gRW5naW5lZXJpbmcnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJzIwMjUtMDktMTYnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICcyMDI1LTA5LTI1JyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAxMDAsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdhdmVOYW1lOiAnV2F2ZSA0IC0gT3BlcmF0aW9ucycsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnMjAyNS0wOS0yNicsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJzIwMjUtMTAtMDInLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2luX3Byb2dyZXNzJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogNzUsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDYsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdhdmVOYW1lOiAnV2F2ZSA1IC0gU3VwcG9ydCAmIEFkbWluJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICcyMDI1LTEwLTA1JyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnMjAyNS0xMC0xMicsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBlcnJvckJyZWFrZG93bjogW1xuICAgICAgICAgICAgeyBlcnJvclR5cGU6ICdBdXRoZW50aWNhdGlvbiBGYWlsZWQnLCBjb3VudDogNDIzLCBwZXJjZW50YWdlOiAzNCB9LFxuICAgICAgICAgICAgeyBlcnJvclR5cGU6ICdNYWlsYm94IFNpemUgTGltaXQnLCBjb3VudDogMzEyLCBwZXJjZW50YWdlOiAyNSB9LFxuICAgICAgICAgICAgeyBlcnJvclR5cGU6ICdMaWNlbnNlIEFzc2lnbm1lbnQnLCBjb3VudDogMjM0LCBwZXJjZW50YWdlOiAxOSB9LFxuICAgICAgICAgICAgeyBlcnJvclR5cGU6ICdOZXR3b3JrIFRpbWVvdXQnLCBjb3VudDogMTU2LCBwZXJjZW50YWdlOiAxMiB9LFxuICAgICAgICAgICAgeyBlcnJvclR5cGU6ICdQZXJtaXNzaW9uIERlbmllZCcsIGNvdW50OiAxMjIsIHBlcmNlbnRhZ2U6IDEwIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHRvcEVycm9yczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0ZhaWxlZCB0byBhdXRoZW50aWNhdGUgd2l0aCBzb3VyY2UgdGVuYW50JyxcbiAgICAgICAgICAgICAgICBjb3VudDogNDIzLFxuICAgICAgICAgICAgICAgIGFmZmVjdGVkVXNlcnM6IDM4OSxcbiAgICAgICAgICAgICAgICBsYXN0T2NjdXJyZW5jZTogJzIwMjUtMTAtMDIgMTQ6MzI6MTUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdNYWlsYm94IGV4Y2VlZHMgbWF4aW11bSBzaXplIGZvciBtaWdyYXRpb24nLFxuICAgICAgICAgICAgICAgIGNvdW50OiAzMTIsXG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRVc2VyczogMzEyLFxuICAgICAgICAgICAgICAgIGxhc3RPY2N1cnJlbmNlOiAnMjAyNS0xMC0wMiAxNjo0NToyMycsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ1VuYWJsZSB0byBhc3NpZ24gcmVxdWlyZWQgbGljZW5zZScsXG4gICAgICAgICAgICAgICAgY291bnQ6IDIzNCxcbiAgICAgICAgICAgICAgICBhZmZlY3RlZFVzZXJzOiAxOTgsXG4gICAgICAgICAgICAgICAgbGFzdE9jY3VycmVuY2U6ICcyMDI1LTEwLTAxIDExOjIwOjQ1JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnQ29ubmVjdGlvbiB0aW1lb3V0IGR1cmluZyBkYXRhIHRyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICBjb3VudDogMTU2LFxuICAgICAgICAgICAgICAgIGFmZmVjdGVkVXNlcnM6IDE0MixcbiAgICAgICAgICAgICAgICBsYXN0T2NjdXJyZW5jZTogJzIwMjUtMDktMzAgMDk6MTU6MzAnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdJbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMgb24gdGFyZ2V0JyxcbiAgICAgICAgICAgICAgICBjb3VudDogMTIyLFxuICAgICAgICAgICAgICAgIGFmZmVjdGVkVXNlcnM6IDExNSxcbiAgICAgICAgICAgICAgICBsYXN0T2NjdXJyZW5jZTogJzIwMjUtMDktMjkgMTU6NDA6MTInLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgc3VjY2Vzc1JhdGVCeVR5cGU6IFtcbiAgICAgICAgICAgIHsgdHlwZTogJ1VzZXIgQWNjb3VudHMnLCBzdWNjZXNzUmF0ZTogOTYsIHRvdGFsOiA4NTAwLCBzdWNjZWVkZWQ6IDgxNjAsIGZhaWxlZDogMzQwIH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdNYWlsYm94ZXMnLCBzdWNjZXNzUmF0ZTogOTIsIHRvdGFsOiA4MjAwLCBzdWNjZWVkZWQ6IDc1NDQsIGZhaWxlZDogNjU2IH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdPbmVEcml2ZScsIHN1Y2Nlc3NSYXRlOiA5NCwgdG90YWw6IDc4MDAsIHN1Y2NlZWRlZDogNzMzMiwgZmFpbGVkOiA0NjggfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ1NoYXJlUG9pbnQgU2l0ZXMnLCBzdWNjZXNzUmF0ZTogODksIHRvdGFsOiA0NTAsIHN1Y2NlZWRlZDogNDAxLCBmYWlsZWQ6IDQ5IH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdUZWFtcycsIHN1Y2Nlc3NSYXRlOiA5MSwgdG90YWw6IDM1MCwgc3VjY2VlZGVkOiAzMTksIGZhaWxlZDogMzEgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcbiAgICAvLyBJbml0aWFsIGxvYWRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBmZXRjaFJlcG9ydERhdGEoKTtcbiAgICB9LCBbZmV0Y2hSZXBvcnREYXRhXSk7XG4gICAgLy8gRXhwb3J0IFBERiBSZXBvcnRcbiAgICBjb25zdCBoYW5kbGVFeHBvcnRQREYgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghcmVwb3J0RGF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNFeHBvcnRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvQW5hbHl0aWNzL0V4cG9ydFJlcG9ydC5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtTWlncmF0aW9uUmVwb3J0JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlcG9ydERhdGEsXG4gICAgICAgICAgICAgICAgICAgIHdhdmVJZDogc2VsZWN0ZWRXYXZlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6ICdwZGYnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQREYgcmVwb3J0IGV4cG9ydGVkIHN1Y2Nlc3NmdWxseTonLCByZXN1bHQuZGF0YS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgLy8gQ291bGQgdHJpZ2dlciBhIHN1Y2Nlc3Mgbm90aWZpY2F0aW9uIGhlcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ1BERiBleHBvcnQgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdQREYgZXhwb3J0IGZhaWxlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignUERGIGV4cG9ydCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNFeHBvcnRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3JlcG9ydERhdGEsIHNlbGVjdGVkV2F2ZV0pO1xuICAgIC8vIEV4cG9ydCBFeGNlbCBSZXBvcnRcbiAgICBjb25zdCBoYW5kbGVFeHBvcnRFeGNlbCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXBvcnREYXRhKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0V4cG9ydGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9BbmFseXRpY3MvRXhwb3J0UmVwb3J0LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1NaWdyYXRpb25SZXBvcnQnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVwb3J0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUlkOiBzZWxlY3RlZFdhdmUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ2V4Y2VsJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXhjZWwgcmVwb3J0IGV4cG9ydGVkIHN1Y2Nlc3NmdWxseTonLCByZXN1bHQuZGF0YS5maWxlUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdFeGNlbCBleHBvcnQgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdFeGNlbCBleHBvcnQgZmFpbGVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlbCBleHBvcnQgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzRXhwb3J0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZXBvcnREYXRhLCBzZWxlY3RlZFdhdmVdKTtcbiAgICAvLyBHZXQgYXZhaWxhYmxlIHdhdmVzIGZvciBmaWx0ZXJcbiAgICBjb25zdCBhdmFpbGFibGVXYXZlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcG9ydERhdGEpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiByZXBvcnREYXRhLndhdmVUaW1lbGluZS5tYXAodyA9PiAoeyBpZDogdy53YXZlTmFtZSwgbmFtZTogdy53YXZlTmFtZSB9KSk7XG4gICAgfSwgW3JlcG9ydERhdGFdKTtcbiAgICAvLyBDYWxjdWxhdGUgb3ZlcmFsbCBwcm9ncmVzc1xuICAgIGNvbnN0IG92ZXJhbGxQcm9ncmVzcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcG9ydERhdGEgfHwgcmVwb3J0RGF0YS53YXZlVGltZWxpbmUubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIGNvbnN0IHRvdGFsUHJvZ3Jlc3MgPSByZXBvcnREYXRhLndhdmVUaW1lbGluZS5yZWR1Y2UoKHN1bSwgd2F2ZSkgPT4gc3VtICsgd2F2ZS5wcm9ncmVzcywgMCk7XG4gICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRvdGFsUHJvZ3Jlc3MgLyByZXBvcnREYXRhLndhdmVUaW1lbGluZS5sZW5ndGgpO1xuICAgIH0sIFtyZXBvcnREYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVwb3J0RGF0YSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgaXNFeHBvcnRpbmcsXG4gICAgICAgIHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgc2V0U2VsZWN0ZWRXYXZlLFxuICAgICAgICBhdmFpbGFibGVXYXZlcyxcbiAgICAgICAgb3ZlcmFsbFByb2dyZXNzLFxuICAgICAgICBoYW5kbGVFeHBvcnRQREYsXG4gICAgICAgIGhhbmRsZUV4cG9ydEV4Y2VsLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCYXJDaGFydCwgQmFyLCBQaWVDaGFydCwgUGllLCBDZWxsLCBSYWRpYWxCYXJDaGFydCwgUmFkaWFsQmFyLCBYQXhpcywgWUF4aXMsIENhcnRlc2lhbkdyaWQsIFRvb2x0aXAsIFJlc3BvbnNpdmVDb250YWluZXIsIH0gZnJvbSAncmVjaGFydHMnO1xuaW1wb3J0IHsgRG93bmxvYWQsIEZpbGVUZXh0LCBDaGVja0NpcmNsZSwgWENpcmNsZSwgQ2xvY2ssIEFsZXJ0Q2lyY2xlLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlTWlncmF0aW9uUmVwb3J0TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VNaWdyYXRpb25SZXBvcnRMb2dpYyc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NlbGVjdCc7XG5jb25zdCBTdGF0Q2FyZCA9ICh7IHRpdGxlLCB2YWx1ZSwgaWNvbiwgY29sb3IsIHN1YnRpdGxlLCAnZGF0YS1jeSc6IGRhdGFDeSB9KSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgc2hhZG93LXNtXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItM1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBwLTMgcm91bmRlZC1sZyAke2NvbG9yfWAsIGNoaWxkcmVuOiBpY29uIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJpZ2h0XCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogdGl0bGUgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyA/IHZhbHVlLnRvTG9jYWxlU3RyaW5nKCkgOiB2YWx1ZSB9KSwgc3VidGl0bGUgJiYgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBzdWJ0aXRsZSB9KV0gfSldIH0pIH0pKTtcbi8vIExvYWRpbmcgU2tlbGV0b25cbmNvbnN0IFJlcG9ydFNrZWxldG9uID0gKCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBwLTYgc3BhY2UteS02IGFuaW1hdGUtcHVsc2VcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMTAgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkIHctMS8zXCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDQpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtMzIgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbLi4uQXJyYXkoNCldLm1hcCgoXywgaSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC05NiBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGdcIiB9LCBpKSkpIH0pXSB9KSk7XG4vLyBDdXN0b20gVG9vbHRpcFxuY29uc3QgQ3VzdG9tVG9vbHRpcCA9ICh7IGFjdGl2ZSwgcGF5bG9hZCwgbGFiZWwgfSkgPT4ge1xuICAgIGlmICghYWN0aXZlIHx8ICFwYXlsb2FkIHx8ICFwYXlsb2FkLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHAtMyByb3VuZGVkLWxnIHNoYWRvdy1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi0yXCIsIGNoaWxkcmVuOiBsYWJlbCB9KSwgcGF5bG9hZC5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgc3R5bGU6IHsgY29sb3I6IGVudHJ5LmNvbG9yIH0sIGNoaWxkcmVuOiBbZW50cnkubmFtZSwgXCI6IFwiXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogdHlwZW9mIGVudHJ5LnZhbHVlID09PSAnbnVtYmVyJyA/IGVudHJ5LnZhbHVlLnRvTG9jYWxlU3RyaW5nKCkgOiBlbnRyeS52YWx1ZSB9KV0gfSwgaW5kZXgpKSldIH0pKTtcbn07XG4vLyBHYW50dC1zdHlsZSBUaW1lbGluZSBDb21wb25lbnRcbmNvbnN0IFdhdmVUaW1lbGluZSA9ICh7IGRhdGEgfSkgPT4ge1xuICAgIGNvbnN0IGdldFN0YXR1c0NvbG9yID0gKHN0YXR1cykgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICAgICAgY2FzZSAnY29tcGxldGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyZWVuLTUwMCc7XG4gICAgICAgICAgICBjYXNlICdpbl9wcm9ncmVzcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ibHVlLTUwMCc7XG4gICAgICAgICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctcmVkLTUwMCc7XG4gICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyYXktNDAwJztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ncmF5LTMwMCc7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGdldFN0YXR1c0xhYmVsID0gKHN0YXR1cykgPT4ge1xuICAgICAgICByZXR1cm4gc3RhdHVzLnJlcGxhY2UoJ18nLCAnICcpLnJlcGxhY2UoL1xcYlxcdy9nLCBsID0+IGwudG9VcHBlckNhc2UoKSk7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS00XCIsIGNoaWxkcmVuOiAoZGF0YSA/PyBbXSkubWFwKCh3YXZlLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogd2F2ZS53YXZlTmFtZSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGBweC0yIHB5LTEgdGV4dC14cyBmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgJHt3YXZlLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi03MDAgZGFyazpiZy1ncmVlbi05MDAgZGFyazp0ZXh0LWdyZWVuLTMwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHdhdmUuc3RhdHVzID09PSAnaW5fcHJvZ3Jlc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS03MDAgZGFyazpiZy1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0zMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogd2F2ZS5zdGF0dXMgPT09ICdmYWlsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1yZWQtMTAwIHRleHQtcmVkLTcwMCBkYXJrOmJnLXJlZC05MDAgZGFyazp0ZXh0LXJlZC0zMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktNzAwIGRhcms6YmctZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMzAwJ31gLCBjaGlsZHJlbjogZ2V0U3RhdHVzTGFiZWwod2F2ZS5zdGF0dXMpIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW3dhdmUuc3RhcnREYXRlLCBcIiBcXHUyMTkyIFwiLCB3YXZlLmVuZERhdGUsIHdhdmUuZHVyYXRpb24gPiAwICYmIGAgKCR7d2F2ZS5kdXJhdGlvbn0gZGF5cylgXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmUgdy1mdWxsIGgtOCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGcgb3ZlcmZsb3ctaGlkZGVuXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgYWJzb2x1dGUgdG9wLTAgbGVmdC0wIGgtZnVsbCAke2dldFN0YXR1c0NvbG9yKHdhdmUuc3RhdHVzKX0gdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tNTAwYCwgc3R5bGU6IHsgd2lkdGg6IGAke3dhdmUucHJvZ3Jlc3N9JWAgfSwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsXCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBbd2F2ZS5wcm9ncmVzcywgXCIlXCJdIH0pIH0pIH0pIH0pXSB9LCBpbmRleCkpKSB9KSk7XG59O1xuLy8gU3VjY2VzcyBSYXRlIEdhdWdlIENvbXBvbmVudFxuY29uc3QgU3VjY2Vzc0dhdWdlID0gKHsgc3VjY2Vzc1JhdGUgfSkgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSBbeyBuYW1lOiAnU3VjY2VzcyBSYXRlJywgdmFsdWU6IHN1Y2Nlc3NSYXRlLCBmaWxsOiBzdWNjZXNzUmF0ZSA+PSA5MCA/ICcjMTBiOTgxJyA6IHN1Y2Nlc3NSYXRlID49IDc1ID8gJyNmNTllMGInIDogJyNlZjQ0NDQnIH1dO1xuICAgIHJldHVybiAoX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAyNTAsIGNoaWxkcmVuOiBfanN4cyhSYWRpYWxCYXJDaGFydCwgeyBjeDogXCI1MCVcIiwgY3k6IFwiNTAlXCIsIGlubmVyUmFkaXVzOiBcIjYwJVwiLCBvdXRlclJhZGl1czogXCI5MCVcIiwgYmFyU2l6ZTogMzAsIGRhdGE6IGRhdGEsIHN0YXJ0QW5nbGU6IDE4MCwgZW5kQW5nbGU6IDAsIGNoaWxkcmVuOiBbX2pzeChSYWRpYWxCYXIsIHsgYmFja2dyb3VuZDogdHJ1ZSwgZGF0YUtleTogXCJ2YWx1ZVwiLCBjb3JuZXJSYWRpdXM6IDEwIH0pLCBfanN4cyhcInRleHRcIiwgeyB4OiBcIjUwJVwiLCB5OiBcIjUwJVwiLCB0ZXh0QW5jaG9yOiBcIm1pZGRsZVwiLCBkb21pbmFudEJhc2VsaW5lOiBcIm1pZGRsZVwiLCBjbGFzc05hbWU6IFwidGV4dC00eGwgZm9udC1ib2xkIGZpbGwtZ3JheS05MDAgZGFyazpmaWxsLWdyYXktMTAwXCIsIGNoaWxkcmVuOiBbc3VjY2Vzc1JhdGUsIFwiJVwiXSB9KSwgX2pzeChcInRleHRcIiwgeyB4OiBcIjUwJVwiLCB5OiBcIjYwJVwiLCB0ZXh0QW5jaG9yOiBcIm1pZGRsZVwiLCBkb21pbmFudEJhc2VsaW5lOiBcIm1pZGRsZVwiLCBjbGFzc05hbWU6IFwidGV4dC1zbSBmaWxsLWdyYXktNTAwXCIsIGNoaWxkcmVuOiBcIlN1Y2Nlc3MgUmF0ZVwiIH0pXSB9KSB9KSk7XG59O1xuY29uc3QgTWlncmF0aW9uUmVwb3J0VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHJlcG9ydERhdGEsIGlzTG9hZGluZywgZXJyb3IsIGlzRXhwb3J0aW5nLCBzZWxlY3RlZFdhdmUsIHNldFNlbGVjdGVkV2F2ZSwgYXZhaWxhYmxlV2F2ZXMsIG92ZXJhbGxQcm9ncmVzcywgaGFuZGxlRXhwb3J0UERGLCBoYW5kbGVFeHBvcnRFeGNlbCwgfSA9IHVzZU1pZ3JhdGlvblJlcG9ydExvZ2ljKCk7XG4gICAgY29uc3QgaXNEYXJrTW9kZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2RhcmsnKTtcbiAgICAvLyBDaGFydCB0aGVtZVxuICAgIGNvbnN0IGNoYXJ0VGhlbWUgPSB7XG4gICAgICAgIHRleHRDb2xvcjogaXNEYXJrTW9kZSA/ICcjZjlmYWZiJyA6ICcjMWYyOTM3JyxcbiAgICAgICAgZ3JpZENvbG9yOiBpc0RhcmtNb2RlID8gJyMzNzQxNTEnIDogJyNlNWU3ZWInLFxuICAgIH07XG4gICAgLy8gQ29sb3IgcGFsZXR0ZVxuICAgIGNvbnN0IENPTE9SUyA9IHtcbiAgICAgICAgc3VjY2VzczogaXNEYXJrTW9kZSA/ICcjMzRkMzk5JyA6ICcjMTBiOTgxJyxcbiAgICAgICAgZGFuZ2VyOiBpc0RhcmtNb2RlID8gJyNmODcxNzEnIDogJyNlZjQ0NDQnLFxuICAgICAgICB3YXJuaW5nOiBpc0RhcmtNb2RlID8gJyNmYmJmMjQnIDogJyNmNTllMGInLFxuICAgICAgICBwcmltYXJ5OiBpc0RhcmtNb2RlID8gJyM2MGE1ZmEnIDogJyMzYjgyZjYnLFxuICAgICAgICBwdXJwbGU6IGlzRGFya01vZGUgPyAnI2E3OGJmYScgOiAnIzhiNWNmNicsXG4gICAgfTtcbiAgICBjb25zdCBQSUVfQ09MT1JTID0gW0NPTE9SUy5kYW5nZXIsIENPTE9SUy53YXJuaW5nLCBDT0xPUlMucHJpbWFyeSwgQ09MT1JTLnB1cnBsZSwgJyNmNDcyYjYnXTtcbiAgICBpZiAoaXNMb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiBfanN4KFJlcG9ydFNrZWxldG9uLCB7fSk7XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIFwiZGF0YS1jeVwiOiBcInJlcG9ydC1lcnJvclwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVwb3J0LWVycm9yXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgdGV4dC1sZ1wiLCBjaGlsZHJlbjogZXJyb3IgfSkgfSkgfSkpO1xuICAgIH1cbiAgICBpZiAoIXJlcG9ydERhdGEpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTm8gcmVwb3J0IGRhdGEgYXZhaWxhYmxlXCIgfSkgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJtaWdyYXRpb24tcmVwb3J0LXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm1pZ3JhdGlvbi1yZXBvcnQtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTYgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJNaWdyYXRpb24gUmVwb3J0XCIgfSksIF9qc3hzKFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IFtcIk92ZXJhbGwgUHJvZ3Jlc3M6IFwiLCBvdmVyYWxsUHJvZ3Jlc3MsIFwiJVwiXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEZpbHRlciwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyYXktNTAwXCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBzZWxlY3RlZFdhdmUsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHNldFNlbGVjdGVkV2F2ZSh2YWx1ZSksIGNsYXNzTmFtZTogXCJ3LTQ4XCIsIFwiZGF0YS1jeVwiOiBcIndhdmUtZmlsdGVyXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ3YXZlLWZpbHRlclwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBXYXZlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uYXZhaWxhYmxlV2F2ZXMubWFwKHdhdmUgPT4gKHsgdmFsdWU6IHdhdmUuaWQsIGxhYmVsOiB3YXZlLm5hbWUgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KV0gfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydEV4Y2VsLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWwtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtZXhjZWwtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBFeGNlbFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRQREYsIHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJleHBvcnQtcGRmLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LXBkZi1idG5cIiwgY2hpbGRyZW46IFwiRG93bmxvYWQgUERGXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gcC02IHNwYWNlLXktNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIlRvdGFsIE1pZ3JhdGlvbnNcIiwgdmFsdWU6IHJlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbEF0dGVtcHRlZCwgaWNvbjogX2pzeChDbG9jaywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLWJsdWUtNTAwXCIsIHN1YnRpdGxlOiBcIkF0dGVtcHRlZFwiLCBcImRhdGEtY3lcIjogXCJzdGF0LXRvdGFsXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LXRvdGFsXCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiU3VjY2Vzc2Z1bFwiLCB2YWx1ZTogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsU3VjY2VlZGVkLCBpY29uOiBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctZ3JlZW4tNTAwXCIsIHN1YnRpdGxlOiBgJHtyZXBvcnREYXRhLnN0YXRpc3RpY3Muc3VjY2Vzc1JhdGV9JSBzdWNjZXNzIHJhdGVgLCBcImRhdGEtY3lcIjogXCJzdGF0LXN1Y2Nlc3NcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtc3VjY2Vzc1wiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIkZhaWxlZFwiLCB2YWx1ZTogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsRmFpbGVkLCBpY29uOiBfanN4KFhDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1yZWQtNTAwXCIsIHN1YnRpdGxlOiBgJHtyZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxFcnJvcnN9IGVycm9yc2AsIFwiZGF0YS1jeVwiOiBcInN0YXQtZmFpbGVkXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LWZhaWxlZFwiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIkF2Zy4gRHVyYXRpb25cIiwgdmFsdWU6IGAke3JlcG9ydERhdGEuc3RhdGlzdGljcy5hdmVyYWdlRHVyYXRpb25NaW51dGVzfSBtaW5gLCBpY29uOiBfanN4KENsb2NrLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctcHVycGxlLTUwMFwiLCBzdWJ0aXRsZTogXCJQZXIgbWlncmF0aW9uXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtZHVyYXRpb25cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtZHVyYXRpb25cIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiT3ZlcmFsbCBTdWNjZXNzIFJhdGVcIiB9KSwgX2pzeChTdWNjZXNzR2F1Z2UsIHsgc3VjY2Vzc1JhdGU6IHJlcG9ydERhdGEuc3RhdGlzdGljcy5zdWNjZXNzUmF0ZSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBncmlkIGdyaWQtY29scy0yIGdhcC00IHRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyZWVuLTYwMCBkYXJrOnRleHQtZ3JlZW4tNDAwXCIsIGNoaWxkcmVuOiByZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxTdWNjZWVkZWQudG9Mb2NhbGVTdHJpbmcoKSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJTdWNjZWVkZWRcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwXCIsIGNoaWxkcmVuOiByZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxGYWlsZWQudG9Mb2NhbGVTdHJpbmcoKSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJGYWlsZWRcIiB9KV0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIlN1Y2Nlc3MgUmF0ZSBieSBUeXBlXCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMjUwLCBjaGlsZHJlbjogX2pzeHMoQmFyQ2hhcnQsIHsgZGF0YTogcmVwb3J0RGF0YS5zdWNjZXNzUmF0ZUJ5VHlwZSwgbGF5b3V0OiBcImhvcml6b250YWxcIiwgY2hpbGRyZW46IFtfanN4KENhcnRlc2lhbkdyaWQsIHsgc3Ryb2tlRGFzaGFycmF5OiBcIjMgM1wiLCBzdHJva2U6IGNoYXJ0VGhlbWUuZ3JpZENvbG9yIH0pLCBfanN4KFhBeGlzLCB7IHR5cGU6IFwibnVtYmVyXCIsIGRvbWFpbjogWzAsIDEwMF0sIHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IgfSksIF9qc3goWUF4aXMsIHsgdHlwZTogXCJjYXRlZ29yeVwiLCBkYXRhS2V5OiBcInR5cGVcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciwgd2lkdGg6IDEyMCB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pLCBfanN4KEJhciwgeyBkYXRhS2V5OiBcInN1Y2Nlc3NSYXRlXCIsIGZpbGw6IENPTE9SUy5zdWNjZXNzLCByYWRpdXM6IFswLCA4LCA4LCAwXSwgbmFtZTogXCJTdWNjZXNzIFJhdGUgJVwiIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNiBsZzpjb2wtc3Bhbi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIk1pZ3JhdGlvbiBUaW1lbGluZVwiIH0pLCBfanN4KFdhdmVUaW1lbGluZSwgeyBkYXRhOiByZXBvcnREYXRhLndhdmVUaW1lbGluZSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJFcnJvciBCcmVha2Rvd25cIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAzMDAsIGNoaWxkcmVuOiBfanN4cyhQaWVDaGFydCwgeyBjaGlsZHJlbjogW19qc3goUGllLCB7IGRhdGE6IHJlcG9ydERhdGEuZXJyb3JCcmVha2Rvd24sIGN4OiBcIjUwJVwiLCBjeTogXCI1MCVcIiwgbGFiZWxMaW5lOiBmYWxzZSwgbGFiZWw6ICh7IGVycm9yVHlwZSwgcGVyY2VudGFnZSB9KSA9PiBgJHtlcnJvclR5cGV9OiAke3BlcmNlbnRhZ2V9JWAsIG91dGVyUmFkaXVzOiAxMDAsIGZpbGw6IFwiIzg4ODRkOFwiLCBkYXRhS2V5OiBcImNvdW50XCIsIGNoaWxkcmVuOiByZXBvcnREYXRhLmVycm9yQnJlYWtkb3duLm1hcCgoZW50cnksIGluZGV4KSA9PiAoX2pzeChDZWxsLCB7IGZpbGw6IFBJRV9DT0xPUlNbaW5kZXggJSBQSUVfQ09MT1JTLmxlbmd0aF0gfSwgYGNlbGwtJHtpbmRleH1gKSkpIH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudDogX2pzeChDdXN0b21Ub29sdGlwLCB7fSkgfSldIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1yZWQtNTAwXCIgfSksIFwiVG9wIEVycm9yc1wiXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTNcIiwgY2hpbGRyZW46IHJlcG9ydERhdGEudG9wRXJyb3JzLm1hcCgoZXJyb3IsIGluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGp1c3RpZnktYmV0d2VlbiBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBmbGV4LTFcIiwgY2hpbGRyZW46IGVycm9yLmVycm9yTWVzc2FnZSB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1ib2xkIHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCBtbC0yXCIsIGNoaWxkcmVuOiBbZXJyb3IuY291bnQsIFwiXFx1MDBEN1wiXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC00IHRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBjaGlsZHJlbjogW2Vycm9yLmFmZmVjdGVkVXNlcnMsIFwiIHVzZXJzIGFmZmVjdGVkXCJdIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIlxcdTIwMjJcIiB9KSwgX2pzeHMoXCJzcGFuXCIsIHsgY2hpbGRyZW46IFtcIkxhc3Q6IFwiLCBlcnJvci5sYXN0T2NjdXJyZW5jZV0gfSldIH0pXSB9LCBpbmRleCkpKSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiRXhwb3J0IFJlcG9ydFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0zMDBcIiwgY2hpbGRyZW46IFwiUmVwb3J0IEluY2x1ZGVzOlwiIH0pLCBfanN4cyhcInVsXCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMiB0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJsaVwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJFeGVjdXRpdmUgc3VtbWFyeSB3aXRoIGtleSBtZXRyaWNzXCJdIH0pLCBfanN4cyhcImxpXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTUwMFwiIH0pLCBcIkRldGFpbGVkIHdhdmUtYnktd2F2ZSBhbmFseXNpc1wiXSB9KSwgX2pzeHMoXCJsaVwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJDb21wbGV0ZSBlcnJvciBsb2cgd2l0aCByZWNvbW1lbmRhdGlvbnNcIl0gfSksIF9qc3hzKFwibGlcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiU3VjY2VzcyByYXRlIGJyZWFrZG93biBieSByZXNvdXJjZSB0eXBlXCJdIH0pLCBfanN4cyhcImxpXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTUwMFwiIH0pLCBcIlZpc3VhbCBjaGFydHMgYW5kIHRpbWVsaW5lIGdyYXBoc1wiXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGp1c3RpZnktY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0UERGLCB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJsZ1wiLCBpY29uOiBfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZG93bmxvYWQtcGRmLXJlcG9ydFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZG93bmxvYWQtcGRmLXJlcG9ydFwiLCBjaGlsZHJlbjogaXNFeHBvcnRpbmcgPyAnR2VuZXJhdGluZy4uLicgOiAnRG93bmxvYWQgUERGIFJlcG9ydCcgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydEV4Y2VsLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcImxnXCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJkb3dubG9hZC1leGNlbC1yZXBvcnRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRvd25sb2FkLWV4Y2VsLXJlcG9ydFwiLCBjaGlsZHJlbjogaXNFeHBvcnRpbmcgPyAnRXhwb3J0aW5nLi4uJyA6ICdFeHBvcnQgdG8gRXhjZWwnIH0pXSB9KV0gfSldIH0pXSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE1pZ3JhdGlvblJlcG9ydFZpZXc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=