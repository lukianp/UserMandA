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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFVLCtEQUErRCxvQkFBSyxVQUFVLG1DQUFtQyxtQkFBSSxTQUFTLGlHQUFpRyxHQUFHLG9CQUFLLFNBQVMsNEVBQTRFLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsaUNBQVcsSUFBSSxxQ0FBcUMsMENBQTBDLEdBQUcsb0JBQUssU0FBUyxpREFBaUQsbUJBQUksQ0FBQyxpQ0FBVyxJQUFJLHFDQUFxQyxzQ0FBc0MsR0FBRyxvQkFBSyxTQUFTLGlEQUFpRCxtQkFBSSxDQUFDLGlDQUFXLElBQUkscUNBQXFDLCtDQUErQyxHQUFHLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsaUNBQVcsSUFBSSxxQ0FBcUMsK0NBQStDLEdBQUcsb0JBQUssU0FBUyxpREFBaUQsbUJBQUksQ0FBQyxpQ0FBVyxJQUFJLHFDQUFxQyx5Q0FBeUMsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSw0REFBNEQsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLGdFQUFnRSxtQkFBSSxDQUFDLDhCQUFRLElBQUksc0JBQXNCLG1LQUFtSyxHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxvRUFBb0UsbUJBQUksQ0FBQyw4QkFBUSxJQUFJLHNCQUFzQixrS0FBa0ssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQ3B4UDtBQUNBLG9FQUFlLG1CQUFtQixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvaWdub3JlZHxEOlxcU2NyaXB0c1xcVXNlck1hbmRBXFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8RDpcXFNjcmlwdHNcXFVzZXJNYW5kQVxcZ3VpdjJcXG5vZGVfbW9kdWxlc1xccmVjaGFydHNcXG5vZGVfbW9kdWxlc1xcQHJlZHV4anNcXHRvb2xraXRcXGRpc3R8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZU1pZ3JhdGlvblJlcG9ydExvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2FuYWx5dGljcy9NaWdyYXRpb25SZXBvcnRWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25SZXBvcnRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbcmVwb3J0RGF0YSwgc2V0UmVwb3J0RGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNFeHBvcnRpbmcsIHNldElzRXhwb3J0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRXYXZlLCBzZXRTZWxlY3RlZFdhdmVdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IGZldGNoUmVwb3J0RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgLy8gRXhlY3V0ZSBQb3dlclNoZWxsIHNjcmlwdCB0byBnZXQgbWlncmF0aW9uIHJlcG9ydCBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvQW5hbHl0aWNzL01pZ3JhdGlvblJlcG9ydC5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtTWlncmF0aW9uUmVwb3J0RGF0YScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICB3YXZlSWQ6IHNlbGVjdGVkV2F2ZSA9PT0gJ2FsbCcgPyBudWxsIDogc2VsZWN0ZWRXYXZlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRpc3RpY3M6IGNhbGN1bGF0ZVN0YXRpc3RpY3MocmVzdWx0LmRhdGEpLFxuICAgICAgICAgICAgICAgICAgICB3YXZlVGltZWxpbmU6IHJlc3VsdC5kYXRhLndhdmVUaW1lbGluZSB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JCcmVha2Rvd246IGNhbGN1bGF0ZUVycm9yQnJlYWtkb3duKHJlc3VsdC5kYXRhLmVycm9ycyB8fCBbXSksXG4gICAgICAgICAgICAgICAgICAgIHRvcEVycm9yczogcmVzdWx0LmRhdGEudG9wRXJyb3JzIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzUmF0ZUJ5VHlwZTogcmVzdWx0LmRhdGEuc3VjY2Vzc1JhdGVCeVR5cGUgfHwgW10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXRSZXBvcnREYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIHJlcG9ydCBkYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNaWdyYXRpb24gcmVwb3J0IGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICAgICAgICAvLyBTZXQgbW9jayBkYXRhIGZvciBkZXZlbG9wbWVudC90ZXN0aW5nXG4gICAgICAgICAgICBzZXRSZXBvcnREYXRhKGdldE1vY2tSZXBvcnREYXRhKCkpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFdhdmVdKTtcbiAgICAvLyBDYWxjdWxhdGUgbWlncmF0aW9uIHN0YXRpc3RpY3NcbiAgICBjb25zdCBjYWxjdWxhdGVTdGF0aXN0aWNzID0gKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgdG90YWxBdHRlbXB0ZWQgPSBkYXRhLnRvdGFsQXR0ZW1wdGVkIHx8IDA7XG4gICAgICAgIGNvbnN0IHRvdGFsU3VjY2VlZGVkID0gZGF0YS50b3RhbFN1Y2NlZWRlZCB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbEZhaWxlZCA9IGRhdGEudG90YWxGYWlsZWQgfHwgMDtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc1JhdGUgPSB0b3RhbEF0dGVtcHRlZCA+IDAgPyBNYXRoLnJvdW5kKCh0b3RhbFN1Y2NlZWRlZCAvIHRvdGFsQXR0ZW1wdGVkKSAqIDEwMCkgOiAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxBdHRlbXB0ZWQsXG4gICAgICAgICAgICB0b3RhbFN1Y2NlZWRlZCxcbiAgICAgICAgICAgIHRvdGFsRmFpbGVkLFxuICAgICAgICAgICAgc3VjY2Vzc1JhdGUsXG4gICAgICAgICAgICBhdmVyYWdlRHVyYXRpb25NaW51dGVzOiBkYXRhLmF2ZXJhZ2VEdXJhdGlvbk1pbnV0ZXMgfHwgMCxcbiAgICAgICAgICAgIHRvdGFsRXJyb3JzOiBkYXRhLnRvdGFsRXJyb3JzIHx8IDAsXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvLyBDYWxjdWxhdGUgZXJyb3IgYnJlYWtkb3duIHdpdGggcGVyY2VudGFnZXNcbiAgICBjb25zdCBjYWxjdWxhdGVFcnJvckJyZWFrZG93biA9IChlcnJvcnMpID0+IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb3VudHMgPSBlcnJvcnMucmVkdWNlKChhY2MsIGVycm9yKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gZXJyb3IudHlwZSB8fCAnVW5rbm93bic7XG4gICAgICAgICAgICBhY2NbdHlwZV0gPSAoYWNjW3R5cGVdIHx8IDApICsgMTtcbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9KTtcbiAgICAgICAgY29uc3QgdG90YWwgPSBPYmplY3QudmFsdWVzKGVycm9yQ291bnRzKS5yZWR1Y2UoKHN1bSwgY291bnQpID0+IHN1bSArIGNvdW50LCAwKTtcbiAgICAgICAgaWYgKHRvdGFsID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoZXJyb3JDb3VudHMpXG4gICAgICAgICAgICAubWFwKChbZXJyb3JUeXBlLCBjb3VudF0pID0+ICh7XG4gICAgICAgICAgICBlcnJvclR5cGUsXG4gICAgICAgICAgICBjb3VudCxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IE1hdGgucm91bmQoKGNvdW50IC8gdG90YWwpICogMTAwKSxcbiAgICAgICAgfSkpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5jb3VudCAtIGEuY291bnQpO1xuICAgIH07XG4gICAgLy8gTW9jayBkYXRhIGZvciBkZXZlbG9wbWVudC90ZXN0aW5nXG4gICAgY29uc3QgZ2V0TW9ja1JlcG9ydERhdGEgPSAoKSA9PiAoe1xuICAgICAgICBzdGF0aXN0aWNzOiB7XG4gICAgICAgICAgICB0b3RhbEF0dGVtcHRlZDogMTI1NDcsXG4gICAgICAgICAgICB0b3RhbFN1Y2NlZWRlZDogMTE4MzQsXG4gICAgICAgICAgICB0b3RhbEZhaWxlZDogNzEzLFxuICAgICAgICAgICAgc3VjY2Vzc1JhdGU6IDk0LFxuICAgICAgICAgICAgYXZlcmFnZUR1cmF0aW9uTWludXRlczogMjMsXG4gICAgICAgICAgICB0b3RhbEVycm9yczogMTI0NyxcbiAgICAgICAgfSxcbiAgICAgICAgd2F2ZVRpbWVsaW5lOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2F2ZU5hbWU6ICdXYXZlIDEgLSBFeGVjdXRpdmUgVGVhbScsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnMjAyNS0wOS0wMScsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJzIwMjUtMDktMDUnLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2F2ZU5hbWU6ICdXYXZlIDIgLSBTYWxlcyBEZXBhcnRtZW50JyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICcyMDI1LTA5LTA4JyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnMjAyNS0wOS0xNScsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA3LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3YXZlTmFtZTogJ1dhdmUgMyAtIEVuZ2luZWVyaW5nJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICcyMDI1LTA5LTE2JyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnMjAyNS0wOS0yNScsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMTAwLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA5LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3YXZlTmFtZTogJ1dhdmUgNCAtIE9wZXJhdGlvbnMnLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJzIwMjUtMDktMjYnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICcyMDI1LTEwLTAyJyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdpbl9wcm9ncmVzcycsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDc1LFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA2LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB3YXZlTmFtZTogJ1dhdmUgNSAtIFN1cHBvcnQgJiBBZG1pbicsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnMjAyNS0xMC0wNScsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJzIwMjUtMTAtMTInLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgZXJyb3JCcmVha2Rvd246IFtcbiAgICAgICAgICAgIHsgZXJyb3JUeXBlOiAnQXV0aGVudGljYXRpb24gRmFpbGVkJywgY291bnQ6IDQyMywgcGVyY2VudGFnZTogMzQgfSxcbiAgICAgICAgICAgIHsgZXJyb3JUeXBlOiAnTWFpbGJveCBTaXplIExpbWl0JywgY291bnQ6IDMxMiwgcGVyY2VudGFnZTogMjUgfSxcbiAgICAgICAgICAgIHsgZXJyb3JUeXBlOiAnTGljZW5zZSBBc3NpZ25tZW50JywgY291bnQ6IDIzNCwgcGVyY2VudGFnZTogMTkgfSxcbiAgICAgICAgICAgIHsgZXJyb3JUeXBlOiAnTmV0d29yayBUaW1lb3V0JywgY291bnQ6IDE1NiwgcGVyY2VudGFnZTogMTIgfSxcbiAgICAgICAgICAgIHsgZXJyb3JUeXBlOiAnUGVybWlzc2lvbiBEZW5pZWQnLCBjb3VudDogMTIyLCBwZXJjZW50YWdlOiAxMCB9LFxuICAgICAgICBdLFxuICAgICAgICB0b3BFcnJvcnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdGYWlsZWQgdG8gYXV0aGVudGljYXRlIHdpdGggc291cmNlIHRlbmFudCcsXG4gICAgICAgICAgICAgICAgY291bnQ6IDQyMyxcbiAgICAgICAgICAgICAgICBhZmZlY3RlZFVzZXJzOiAzODksXG4gICAgICAgICAgICAgICAgbGFzdE9jY3VycmVuY2U6ICcyMDI1LTEwLTAyIDE0OjMyOjE1JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTWFpbGJveCBleGNlZWRzIG1heGltdW0gc2l6ZSBmb3IgbWlncmF0aW9uJyxcbiAgICAgICAgICAgICAgICBjb3VudDogMzEyLFxuICAgICAgICAgICAgICAgIGFmZmVjdGVkVXNlcnM6IDMxMixcbiAgICAgICAgICAgICAgICBsYXN0T2NjdXJyZW5jZTogJzIwMjUtMTAtMDIgMTY6NDU6MjMnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdVbmFibGUgdG8gYXNzaWduIHJlcXVpcmVkIGxpY2Vuc2UnLFxuICAgICAgICAgICAgICAgIGNvdW50OiAyMzQsXG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRVc2VyczogMTk4LFxuICAgICAgICAgICAgICAgIGxhc3RPY2N1cnJlbmNlOiAnMjAyNS0xMC0wMSAxMToyMDo0NScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0Nvbm5lY3Rpb24gdGltZW91dCBkdXJpbmcgZGF0YSB0cmFuc2ZlcicsXG4gICAgICAgICAgICAgICAgY291bnQ6IDE1NixcbiAgICAgICAgICAgICAgICBhZmZlY3RlZFVzZXJzOiAxNDIsXG4gICAgICAgICAgICAgICAgbGFzdE9jY3VycmVuY2U6ICcyMDI1LTA5LTMwIDA5OjE1OjMwJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnSW5zdWZmaWNpZW50IHBlcm1pc3Npb25zIG9uIHRhcmdldCcsXG4gICAgICAgICAgICAgICAgY291bnQ6IDEyMixcbiAgICAgICAgICAgICAgICBhZmZlY3RlZFVzZXJzOiAxMTUsXG4gICAgICAgICAgICAgICAgbGFzdE9jY3VycmVuY2U6ICcyMDI1LTA5LTI5IDE1OjQwOjEyJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIHN1Y2Nlc3NSYXRlQnlUeXBlOiBbXG4gICAgICAgICAgICB7IHR5cGU6ICdVc2VyIEFjY291bnRzJywgc3VjY2Vzc1JhdGU6IDk2LCB0b3RhbDogODUwMCwgc3VjY2VlZGVkOiA4MTYwLCBmYWlsZWQ6IDM0MCB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnTWFpbGJveGVzJywgc3VjY2Vzc1JhdGU6IDkyLCB0b3RhbDogODIwMCwgc3VjY2VlZGVkOiA3NTQ0LCBmYWlsZWQ6IDY1NiB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnT25lRHJpdmUnLCBzdWNjZXNzUmF0ZTogOTQsIHRvdGFsOiA3ODAwLCBzdWNjZWVkZWQ6IDczMzIsIGZhaWxlZDogNDY4IH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdTaGFyZVBvaW50IFNpdGVzJywgc3VjY2Vzc1JhdGU6IDg5LCB0b3RhbDogNDUwLCBzdWNjZWVkZWQ6IDQwMSwgZmFpbGVkOiA0OSB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnVGVhbXMnLCBzdWNjZXNzUmF0ZTogOTEsIHRvdGFsOiAzNTAsIHN1Y2NlZWRlZDogMzE5LCBmYWlsZWQ6IDMxIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG4gICAgLy8gSW5pdGlhbCBsb2FkXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgZmV0Y2hSZXBvcnREYXRhKCk7XG4gICAgfSwgW2ZldGNoUmVwb3J0RGF0YV0pO1xuICAgIC8vIEV4cG9ydCBQREYgUmVwb3J0XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0UERGID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcG9ydERhdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzRXhwb3J0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0FuYWx5dGljcy9FeHBvcnRSZXBvcnQucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LU1pZ3JhdGlvblJlcG9ydCcsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXBvcnREYXRhLFxuICAgICAgICAgICAgICAgICAgICB3YXZlSWQ6IHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAncGRmJyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUERGIHJlcG9ydCBleHBvcnRlZCBzdWNjZXNzZnVsbHk6JywgcmVzdWx0LmRhdGEuZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIC8vIENvdWxkIHRyaWdnZXIgYSBzdWNjZXNzIG5vdGlmaWNhdGlvbiBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdQREYgZXhwb3J0IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnUERGIGV4cG9ydCBmYWlsZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BERiBleHBvcnQgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzRXhwb3J0aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtyZXBvcnREYXRhLCBzZWxlY3RlZFdhdmVdKTtcbiAgICAvLyBFeHBvcnQgRXhjZWwgUmVwb3J0XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0RXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghcmVwb3J0RGF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNFeHBvcnRpbmcodHJ1ZSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvQW5hbHl0aWNzL0V4cG9ydFJlcG9ydC5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtTWlncmF0aW9uUmVwb3J0JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHJlcG9ydERhdGEsXG4gICAgICAgICAgICAgICAgICAgIHdhdmVJZDogc2VsZWN0ZWRXYXZlLFxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6ICdleGNlbCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0V4Y2VsIHJlcG9ydCBleHBvcnRlZCBzdWNjZXNzZnVsbHk6JywgcmVzdWx0LmRhdGEuZmlsZVBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRXhjZWwgZXhwb3J0IGZhaWxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRXhjZWwgZXhwb3J0IGZhaWxlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhjZWwgZXhwb3J0IGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0V4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbcmVwb3J0RGF0YSwgc2VsZWN0ZWRXYXZlXSk7XG4gICAgLy8gR2V0IGF2YWlsYWJsZSB3YXZlcyBmb3IgZmlsdGVyXG4gICAgY29uc3QgYXZhaWxhYmxlV2F2ZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXBvcnREYXRhKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gcmVwb3J0RGF0YS53YXZlVGltZWxpbmUubWFwKHcgPT4gKHsgaWQ6IHcud2F2ZU5hbWUsIG5hbWU6IHcud2F2ZU5hbWUgfSkpO1xuICAgIH0sIFtyZXBvcnREYXRhXSk7XG4gICAgLy8gQ2FsY3VsYXRlIG92ZXJhbGwgcHJvZ3Jlc3NcbiAgICBjb25zdCBvdmVyYWxsUHJvZ3Jlc3MgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXBvcnREYXRhIHx8IHJlcG9ydERhdGEud2F2ZVRpbWVsaW5lLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gcmVwb3J0RGF0YS53YXZlVGltZWxpbmUucmVkdWNlKChzdW0sIHdhdmUpID0+IHN1bSArIHdhdmUucHJvZ3Jlc3MsIDApO1xuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0b3RhbFByb2dyZXNzIC8gcmVwb3J0RGF0YS53YXZlVGltZWxpbmUubGVuZ3RoKTtcbiAgICB9LCBbcmVwb3J0RGF0YV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcG9ydERhdGEsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGlzRXhwb3J0aW5nLFxuICAgICAgICBzZWxlY3RlZFdhdmUsXG4gICAgICAgIHNldFNlbGVjdGVkV2F2ZSxcbiAgICAgICAgYXZhaWxhYmxlV2F2ZXMsXG4gICAgICAgIG92ZXJhbGxQcm9ncmVzcyxcbiAgICAgICAgaGFuZGxlRXhwb3J0UERGLFxuICAgICAgICBoYW5kbGVFeHBvcnRFeGNlbCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQmFyQ2hhcnQsIEJhciwgUGllQ2hhcnQsIFBpZSwgQ2VsbCwgUmFkaWFsQmFyQ2hhcnQsIFJhZGlhbEJhciwgWEF4aXMsIFlBeGlzLCBDYXJ0ZXNpYW5HcmlkLCBUb29sdGlwLCBSZXNwb25zaXZlQ29udGFpbmVyLCB9IGZyb20gJ3JlY2hhcnRzJztcbmltcG9ydCB7IERvd25sb2FkLCBGaWxlVGV4dCwgQ2hlY2tDaXJjbGUsIFhDaXJjbGUsIENsb2NrLCBBbGVydENpcmNsZSwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZU1pZ3JhdGlvblJlcG9ydExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlTWlncmF0aW9uUmVwb3J0TG9naWMnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9TZWxlY3QnO1xuY29uc3QgU3RhdENhcmQgPSAoeyB0aXRsZSwgdmFsdWUsIGljb24sIGNvbG9yLCBzdWJ0aXRsZSwgJ2RhdGEtY3knOiBkYXRhQ3kgfSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC02IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHNoYWRvdy1zbVwiLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBgcC0zIHJvdW5kZWQtbGcgJHtjb2xvcn1gLCBjaGlsZHJlbjogaWNvbiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yaWdodFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IHRpdGxlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgPyB2YWx1ZS50b0xvY2FsZVN0cmluZygpIDogdmFsdWUgfSksIHN1YnRpdGxlICYmIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogc3VidGl0bGUgfSldIH0pXSB9KSB9KSk7XG4vLyBMb2FkaW5nIFNrZWxldG9uXG5jb25zdCBSZXBvcnRTa2VsZXRvbiA9ICgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgcC02IHNwYWNlLXktNiBhbmltYXRlLXB1bHNlXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTEwIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZCB3LTEvM1wiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgbGc6Z3JpZC1jb2xzLTQgZ2FwLTRcIiwgY2hpbGRyZW46IFsuLi5BcnJheSg0KV0ubWFwKChfLCBpKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTMyIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZ1wiIH0sIGkpKSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogWy4uLkFycmF5KDQpXS5tYXAoKF8sIGkpID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtOTYgYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnXCIgfSwgaSkpKSB9KV0gfSkpO1xuLy8gQ3VzdG9tIFRvb2x0aXBcbmNvbnN0IEN1c3RvbVRvb2x0aXAgPSAoeyBhY3RpdmUsIHBheWxvYWQsIGxhYmVsIH0pID0+IHtcbiAgICBpZiAoIWFjdGl2ZSB8fCAhcGF5bG9hZCB8fCAhcGF5bG9hZC5sZW5ndGgpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBwLTMgcm91bmRlZC1sZyBzaGFkb3ctbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItMlwiLCBjaGlsZHJlbjogbGFiZWwgfSksIHBheWxvYWQubWFwKChlbnRyeSwgaW5kZXgpID0+IChfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IHN0eWxlOiB7IGNvbG9yOiBlbnRyeS5jb2xvciB9LCBjaGlsZHJlbjogW2VudHJ5Lm5hbWUsIFwiOiBcIl0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGRcIiwgY2hpbGRyZW46IHR5cGVvZiBlbnRyeS52YWx1ZSA9PT0gJ251bWJlcicgPyBlbnRyeS52YWx1ZS50b0xvY2FsZVN0cmluZygpIDogZW50cnkudmFsdWUgfSldIH0sIGluZGV4KSkpXSB9KSk7XG59O1xuLy8gR2FudHQtc3R5bGUgVGltZWxpbmUgQ29tcG9uZW50XG5jb25zdCBXYXZlVGltZWxpbmUgPSAoeyBkYXRhIH0pID0+IHtcbiAgICBjb25zdCBnZXRTdGF0dXNDb2xvciA9IChzdGF0dXMpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ncmVlbi01MDAnO1xuICAgICAgICAgICAgY2FzZSAnaW5fcHJvZ3Jlc3MnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctYmx1ZS01MDAnO1xuICAgICAgICAgICAgY2FzZSAnZmFpbGVkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLXJlZC01MDAnO1xuICAgICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1ncmF5LTQwMCc7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctZ3JheS0zMDAnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBnZXRTdGF0dXNMYWJlbCA9IChzdGF0dXMpID0+IHtcbiAgICAgICAgcmV0dXJuIHN0YXR1cy5yZXBsYWNlKCdfJywgJyAnKS5yZXBsYWNlKC9cXGJcXHcvZywgbCA9PiBsLnRvVXBwZXJDYXNlKCkpO1xuICAgIH07XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktNFwiLCBjaGlsZHJlbjogKGRhdGEgPz8gW10pLm1hcCgod2F2ZSwgaW5kZXgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IHdhdmUud2F2ZU5hbWUgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBgcHgtMiBweS0xIHRleHQteHMgZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsICR7d2F2ZS5zdGF0dXMgPT09ICdjb21wbGV0ZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tNzAwIGRhcms6YmctZ3JlZW4tOTAwIGRhcms6dGV4dC1ncmVlbi0zMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB3YXZlLnN0YXR1cyA9PT0gJ2luX3Byb2dyZXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtNzAwIGRhcms6YmctYmx1ZS05MDAgZGFyazp0ZXh0LWJsdWUtMzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHdhdmUuc3RhdHVzID09PSAnZmFpbGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctcmVkLTEwMCB0ZXh0LXJlZC03MDAgZGFyazpiZy1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTcwMCBkYXJrOmJnLWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTMwMCd9YCwgY2hpbGRyZW46IGdldFN0YXR1c0xhYmVsKHdhdmUuc3RhdHVzKSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFt3YXZlLnN0YXJ0RGF0ZSwgXCIgXFx1MjE5MiBcIiwgd2F2ZS5lbmREYXRlLCB3YXZlLmR1cmF0aW9uID4gMCAmJiBgICgke3dhdmUuZHVyYXRpb259IGRheXMpYF0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlIHctZnVsbCBoLTggYmctZ3JheS0yMDAgZGFyazpiZy1ncmF5LTcwMCByb3VuZGVkLWxnIG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYGFic29sdXRlIHRvcC0wIGxlZnQtMCBoLWZ1bGwgJHtnZXRTdGF0dXNDb2xvcih3YXZlLnN0YXR1cyl9IHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTUwMGAsIHN0eWxlOiB7IHdpZHRoOiBgJHt3YXZlLnByb2dyZXNzfSVgIH0sIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1tZWRpdW0gdGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogW3dhdmUucHJvZ3Jlc3MsIFwiJVwiXSB9KSB9KSB9KSB9KV0gfSwgaW5kZXgpKSkgfSkpO1xufTtcbi8vIFN1Y2Nlc3MgUmF0ZSBHYXVnZSBDb21wb25lbnRcbmNvbnN0IFN1Y2Nlc3NHYXVnZSA9ICh7IHN1Y2Nlc3NSYXRlIH0pID0+IHtcbiAgICBjb25zdCBkYXRhID0gW3sgbmFtZTogJ1N1Y2Nlc3MgUmF0ZScsIHZhbHVlOiBzdWNjZXNzUmF0ZSwgZmlsbDogc3VjY2Vzc1JhdGUgPj0gOTAgPyAnIzEwYjk4MScgOiBzdWNjZXNzUmF0ZSA+PSA3NSA/ICcjZjU5ZTBiJyA6ICcjZWY0NDQ0JyB9XTtcbiAgICByZXR1cm4gKF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMjUwLCBjaGlsZHJlbjogX2pzeHMoUmFkaWFsQmFyQ2hhcnQsIHsgY3g6IFwiNTAlXCIsIGN5OiBcIjUwJVwiLCBpbm5lclJhZGl1czogXCI2MCVcIiwgb3V0ZXJSYWRpdXM6IFwiOTAlXCIsIGJhclNpemU6IDMwLCBkYXRhOiBkYXRhLCBzdGFydEFuZ2xlOiAxODAsIGVuZEFuZ2xlOiAwLCBjaGlsZHJlbjogW19qc3goUmFkaWFsQmFyLCB7IGJhY2tncm91bmQ6IHRydWUsIGRhdGFLZXk6IFwidmFsdWVcIiwgY29ybmVyUmFkaXVzOiAxMCB9KSwgX2pzeHMoXCJ0ZXh0XCIsIHsgeDogXCI1MCVcIiwgeTogXCI1MCVcIiwgdGV4dEFuY2hvcjogXCJtaWRkbGVcIiwgZG9taW5hbnRCYXNlbGluZTogXCJtaWRkbGVcIiwgY2xhc3NOYW1lOiBcInRleHQtNHhsIGZvbnQtYm9sZCBmaWxsLWdyYXktOTAwIGRhcms6ZmlsbC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogW3N1Y2Nlc3NSYXRlLCBcIiVcIl0gfSksIF9qc3goXCJ0ZXh0XCIsIHsgeDogXCI1MCVcIiwgeTogXCI2MCVcIiwgdGV4dEFuY2hvcjogXCJtaWRkbGVcIiwgZG9taW5hbnRCYXNlbGluZTogXCJtaWRkbGVcIiwgY2xhc3NOYW1lOiBcInRleHQtc20gZmlsbC1ncmF5LTUwMFwiLCBjaGlsZHJlbjogXCJTdWNjZXNzIFJhdGVcIiB9KV0gfSkgfSkpO1xufTtcbmNvbnN0IE1pZ3JhdGlvblJlcG9ydFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyByZXBvcnREYXRhLCBpc0xvYWRpbmcsIGVycm9yLCBpc0V4cG9ydGluZywgc2VsZWN0ZWRXYXZlLCBzZXRTZWxlY3RlZFdhdmUsIGF2YWlsYWJsZVdhdmVzLCBvdmVyYWxsUHJvZ3Jlc3MsIGhhbmRsZUV4cG9ydFBERiwgaGFuZGxlRXhwb3J0RXhjZWwsIH0gPSB1c2VNaWdyYXRpb25SZXBvcnRMb2dpYygpO1xuICAgIGNvbnN0IGlzRGFya01vZGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkYXJrJyk7XG4gICAgLy8gQ2hhcnQgdGhlbWVcbiAgICBjb25zdCBjaGFydFRoZW1lID0ge1xuICAgICAgICB0ZXh0Q29sb3I6IGlzRGFya01vZGUgPyAnI2Y5ZmFmYicgOiAnIzFmMjkzNycsXG4gICAgICAgIGdyaWRDb2xvcjogaXNEYXJrTW9kZSA/ICcjMzc0MTUxJyA6ICcjZTVlN2ViJyxcbiAgICB9O1xuICAgIC8vIENvbG9yIHBhbGV0dGVcbiAgICBjb25zdCBDT0xPUlMgPSB7XG4gICAgICAgIHN1Y2Nlc3M6IGlzRGFya01vZGUgPyAnIzM0ZDM5OScgOiAnIzEwYjk4MScsXG4gICAgICAgIGRhbmdlcjogaXNEYXJrTW9kZSA/ICcjZjg3MTcxJyA6ICcjZWY0NDQ0JyxcbiAgICAgICAgd2FybmluZzogaXNEYXJrTW9kZSA/ICcjZmJiZjI0JyA6ICcjZjU5ZTBiJyxcbiAgICAgICAgcHJpbWFyeTogaXNEYXJrTW9kZSA/ICcjNjBhNWZhJyA6ICcjM2I4MmY2JyxcbiAgICAgICAgcHVycGxlOiBpc0RhcmtNb2RlID8gJyNhNzhiZmEnIDogJyM4YjVjZjYnLFxuICAgIH07XG4gICAgY29uc3QgUElFX0NPTE9SUyA9IFtDT0xPUlMuZGFuZ2VyLCBDT0xPUlMud2FybmluZywgQ09MT1JTLnByaW1hcnksIENPTE9SUy5wdXJwbGUsICcjZjQ3MmI2J107XG4gICAgaWYgKGlzTG9hZGluZykge1xuICAgICAgICByZXR1cm4gX2pzeChSZXBvcnRTa2VsZXRvbiwge30pO1xuICAgIH1cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBcImRhdGEtY3lcIjogXCJyZXBvcnQtZXJyb3JcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlcG9ydC1lcnJvclwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIHRleHQtbGdcIiwgY2hpbGRyZW46IGVycm9yIH0pIH0pIH0pKTtcbiAgICB9XG4gICAgaWYgKCFyZXBvcnREYXRhKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk5vIHJlcG9ydCBkYXRhIGF2YWlsYWJsZVwiIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwibWlncmF0aW9uLXJlcG9ydC12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJtaWdyYXRpb24tcmVwb3J0LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDBcIiwgY2hpbGRyZW46IFwiTWlncmF0aW9uIFJlcG9ydFwiIH0pLCBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBbXCJPdmVyYWxsIFByb2dyZXNzOiBcIiwgb3ZlcmFsbFByb2dyZXNzLCBcIiVcIl0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChGaWx0ZXIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmF5LTUwMFwiIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogc2VsZWN0ZWRXYXZlLCBvbkNoYW5nZTogKHZhbHVlKSA9PiBzZXRTZWxlY3RlZFdhdmUodmFsdWUpLCBjbGFzc05hbWU6IFwidy00OFwiLCBcImRhdGEtY3lcIjogXCJ3YXZlLWZpbHRlclwiLCBcImRhdGEtdGVzdGlkXCI6IFwid2F2ZS1maWx0ZXJcIiwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwgV2F2ZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmF2YWlsYWJsZVdhdmVzLm1hcCh3YXZlID0+ICh7IHZhbHVlOiB3YXZlLmlkLCBsYWJlbDogd2F2ZS5uYW1lIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSldIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRFeGNlbCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LWV4Y2VsLWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnQgRXhjZWxcIiB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0UERGLCB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LXBkZi1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1wZGYtYnRuXCIsIGNoaWxkcmVuOiBcIkRvd25sb2FkIFBERlwiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBvdmVyZmxvdy1hdXRvIHAtNiBzcGFjZS15LTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJUb3RhbCBNaWdyYXRpb25zXCIsIHZhbHVlOiByZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxBdHRlbXB0ZWQsIGljb246IF9qc3goQ2xvY2ssIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1ibHVlLTUwMFwiLCBzdWJ0aXRsZTogXCJBdHRlbXB0ZWRcIiwgXCJkYXRhLWN5XCI6IFwic3RhdC10b3RhbFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC10b3RhbFwiIH0pLCBfanN4KFN0YXRDYXJkLCB7IHRpdGxlOiBcIlN1Y2Nlc3NmdWxcIiwgdmFsdWU6IHJlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbFN1Y2NlZWRlZCwgaWNvbjogX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLWdyZWVuLTUwMFwiLCBzdWJ0aXRsZTogYCR7cmVwb3J0RGF0YS5zdGF0aXN0aWNzLnN1Y2Nlc3NSYXRlfSUgc3VjY2VzcyByYXRlYCwgXCJkYXRhLWN5XCI6IFwic3RhdC1zdWNjZXNzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LXN1Y2Nlc3NcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJGYWlsZWRcIiwgdmFsdWU6IHJlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbEZhaWxlZCwgaWNvbjogX2pzeChYQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctcmVkLTUwMFwiLCBzdWJ0aXRsZTogYCR7cmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsRXJyb3JzfSBlcnJvcnNgLCBcImRhdGEtY3lcIjogXCJzdGF0LWZhaWxlZFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1mYWlsZWRcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJBdmcuIER1cmF0aW9uXCIsIHZhbHVlOiBgJHtyZXBvcnREYXRhLnN0YXRpc3RpY3MuYXZlcmFnZUR1cmF0aW9uTWludXRlc30gbWluYCwgaWNvbjogX2pzeChDbG9jaywgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLXB1cnBsZS01MDBcIiwgc3VidGl0bGU6IFwiUGVyIG1pZ3JhdGlvblwiLCBcImRhdGEtY3lcIjogXCJzdGF0LWR1cmF0aW9uXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0LWR1cmF0aW9uXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIk92ZXJhbGwgU3VjY2VzcyBSYXRlXCIgfSksIF9qc3goU3VjY2Vzc0dhdWdlLCB7IHN1Y2Nlc3NSYXRlOiByZXBvcnREYXRhLnN0YXRpc3RpY3Muc3VjY2Vzc1JhdGUgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgZ3JpZCBncmlkLWNvbHMtMiBnYXAtNCB0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMFwiLCBjaGlsZHJlbjogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsU3VjY2VlZGVkLnRvTG9jYWxlU3RyaW5nKCkgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiU3VjY2VlZGVkXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMFwiLCBjaGlsZHJlbjogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsRmFpbGVkLnRvTG9jYWxlU3RyaW5nKCkgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiRmFpbGVkXCIgfSldIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJTdWNjZXNzIFJhdGUgYnkgVHlwZVwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDI1MCwgY2hpbGRyZW46IF9qc3hzKEJhckNoYXJ0LCB7IGRhdGE6IHJlcG9ydERhdGEuc3VjY2Vzc1JhdGVCeVR5cGUsIGxheW91dDogXCJob3Jpem9udGFsXCIsIGNoaWxkcmVuOiBbX2pzeChDYXJ0ZXNpYW5HcmlkLCB7IHN0cm9rZURhc2hhcnJheTogXCIzIDNcIiwgc3Ryb2tlOiBjaGFydFRoZW1lLmdyaWRDb2xvciB9KSwgX2pzeChYQXhpcywgeyB0eXBlOiBcIm51bWJlclwiLCBkb21haW46IFswLCAxMDBdLCBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yIH0pLCBfanN4KFlBeGlzLCB7IHR5cGU6IFwiY2F0ZWdvcnlcIiwgZGF0YUtleTogXCJ0eXBlXCIsIHN0cm9rZTogY2hhcnRUaGVtZS50ZXh0Q29sb3IsIHdpZHRoOiAxMjAgfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KSwgX2pzeChCYXIsIHsgZGF0YUtleTogXCJzdWNjZXNzUmF0ZVwiLCBmaWxsOiBDT0xPUlMuc3VjY2VzcywgcmFkaXVzOiBbMCwgOCwgOCwgMF0sIG5hbWU6IFwiU3VjY2VzcyBSYXRlICVcIiB9KV0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTYgbGc6Y29sLXNwYW4tMlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJNaWdyYXRpb24gVGltZWxpbmVcIiB9KSwgX2pzeChXYXZlVGltZWxpbmUsIHsgZGF0YTogcmVwb3J0RGF0YS53YXZlVGltZWxpbmUgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiRXJyb3IgQnJlYWtkb3duXCIgfSksIF9qc3goUmVzcG9uc2l2ZUNvbnRhaW5lciwgeyB3aWR0aDogXCIxMDAlXCIsIGhlaWdodDogMzAwLCBjaGlsZHJlbjogX2pzeHMoUGllQ2hhcnQsIHsgY2hpbGRyZW46IFtfanN4KFBpZSwgeyBkYXRhOiByZXBvcnREYXRhLmVycm9yQnJlYWtkb3duLCBjeDogXCI1MCVcIiwgY3k6IFwiNTAlXCIsIGxhYmVsTGluZTogZmFsc2UsIGxhYmVsOiAoeyBlcnJvclR5cGUsIHBlcmNlbnRhZ2UgfSkgPT4gYCR7ZXJyb3JUeXBlfTogJHtwZXJjZW50YWdlfSVgLCBvdXRlclJhZGl1czogMTAwLCBmaWxsOiBcIiM4ODg0ZDhcIiwgZGF0YUtleTogXCJjb3VudFwiLCBjaGlsZHJlbjogcmVwb3J0RGF0YS5lcnJvckJyZWFrZG93bi5tYXAoKGVudHJ5LCBpbmRleCkgPT4gKF9qc3goQ2VsbCwgeyBmaWxsOiBQSUVfQ09MT1JTW2luZGV4ICUgUElFX0NPTE9SUy5sZW5ndGhdIH0sIGBjZWxsLSR7aW5kZXh9YCkpKSB9KSwgX2pzeChUb29sdGlwLCB7IGNvbnRlbnQ6IF9qc3goQ3VzdG9tVG9vbHRpcCwge30pIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTUwMFwiIH0pLCBcIlRvcCBFcnJvcnNcIl0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0zXCIsIGNoaWxkcmVuOiByZXBvcnREYXRhLnRvcEVycm9ycy5tYXAoKGVycm9yLCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgZmxleC0xXCIsIGNoaWxkcmVuOiBlcnJvci5lcnJvck1lc3NhZ2UgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgbWwtMlwiLCBjaGlsZHJlbjogW2Vycm9yLmNvdW50LCBcIlxcdTAwRDdcIl0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCB0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJzcGFuXCIsIHsgY2hpbGRyZW46IFtlcnJvci5hZmZlY3RlZFVzZXJzLCBcIiB1c2VycyBhZmZlY3RlZFwiXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJcXHUyMDIyXCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJMYXN0OiBcIiwgZXJyb3IubGFzdE9jY3VycmVuY2VdIH0pXSB9KV0gfSwgaW5kZXgpKSkgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktM1wiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCIsIGNoaWxkcmVuOiBcIlJlcG9ydCBJbmNsdWRlczpcIiB9KSwgX2pzeHMoXCJ1bFwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTIgdGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwibGlcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiRXhlY3V0aXZlIHN1bW1hcnkgd2l0aCBrZXkgbWV0cmljc1wiXSB9KSwgX2pzeHMoXCJsaVwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJEZXRhaWxlZCB3YXZlLWJ5LXdhdmUgYW5hbHlzaXNcIl0gfSksIF9qc3hzKFwibGlcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiQ29tcGxldGUgZXJyb3IgbG9nIHdpdGggcmVjb21tZW5kYXRpb25zXCJdIH0pLCBfanN4cyhcImxpXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTUwMFwiIH0pLCBcIlN1Y2Nlc3MgcmF0ZSBicmVha2Rvd24gYnkgcmVzb3VyY2UgdHlwZVwiXSB9KSwgX2pzeHMoXCJsaVwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJWaXN1YWwgY2hhcnRzIGFuZCB0aW1lbGluZSBncmFwaHNcIl0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydFBERiwgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwibGdcIiwgaWNvbjogX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImRvd25sb2FkLXBkZi1yZXBvcnRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRvd25sb2FkLXBkZi1yZXBvcnRcIiwgY2hpbGRyZW46IGlzRXhwb3J0aW5nID8gJ0dlbmVyYXRpbmcuLi4nIDogJ0Rvd25sb2FkIFBERiBSZXBvcnQnIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRFeGNlbCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJsZ1wiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01XCIgfSksIGRpc2FibGVkOiBpc0V4cG9ydGluZywgXCJkYXRhLWN5XCI6IFwiZG93bmxvYWQtZXhjZWwtcmVwb3J0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkb3dubG9hZC1leGNlbC1yZXBvcnRcIiwgY2hpbGRyZW46IGlzRXhwb3J0aW5nID8gJ0V4cG9ydGluZy4uLicgOiAnRXhwb3J0IHRvIEV4Y2VsJyB9KV0gfSldIH0pXSB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBNaWdyYXRpb25SZXBvcnRWaWV3O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9