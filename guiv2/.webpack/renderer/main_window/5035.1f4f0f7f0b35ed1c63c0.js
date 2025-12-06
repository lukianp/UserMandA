(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5035],{

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

/***/ 93746:
/*!**************************************************************************!*\
  !*** ./src/renderer/views/analytics/MigrationReportView.tsx + 1 modules ***!
  \**************************************************************************/
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
    return ((0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 250, children: (0,jsx_runtime.jsxs)(es6.RadialBarChart, { cx: "50%", cy: "50%", innerRadius: "60%", outerRadius: "90%", barSize: 30, data: data, startAngle: 180, endAngle: 0, children: [(0,jsx_runtime.jsx)(es6.RadialBar, { background: true, dataKey: "value", cornerRadius: 10 }), (0,jsx_runtime.jsxs)("text", { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "middle", className: "text-4xl font-bold fill-gray-900 dark:fill-gray-100", children: [successRate, "%"] }), (0,jsx_runtime.jsx)("text", { x: "50%", y: "60%", textAnchor: "middle", dominantBaseline: "middle", className: "text-sm fill-gray-500", children: "Success Rate" })] }) }));
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "migration-report-view", "data-testid": "migration-report-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Migration Report" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: ["Overall Progress: ", overallProgress, "%"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Filter, { className: "w-4 h-4 text-gray-500" }), (0,jsx_runtime.jsx)(Select.Select, { value: selectedWave, onChange: (value) => setSelectedWave(value), className: "w-48", "data-cy": "wave-filter", "data-testid": "wave-filter", options: [
                                            { value: 'all', label: 'All Waves' },
                                            ...availableWaves.map(wave => ({ value: wave.id, label: wave.name }))
                                        ] })] }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportExcel, variant: "secondary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-excel-btn", "data-testid": "export-excel-btn", children: "Export Excel" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportPDF, variant: "primary", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-4 h-4" }), disabled: isExporting, "data-cy": "export-pdf-btn", "data-testid": "export-pdf-btn", children: "Download PDF" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [(0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [(0,jsx_runtime.jsx)(StatCard, { title: "Total Migrations", value: reportData.statistics.totalAttempted, icon: (0,jsx_runtime.jsx)(lucide_react.Clock, { className: "w-6 h-6 text-white" }), color: "bg-blue-500", subtitle: "Attempted", "data-cy": "stat-total", "data-testid": "stat-total" }), (0,jsx_runtime.jsx)(StatCard, { title: "Successful", value: reportData.statistics.totalSucceeded, icon: (0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-6 h-6 text-white" }), color: "bg-green-500", subtitle: `${reportData.statistics.successRate}% success rate`, "data-cy": "stat-success", "data-testid": "stat-success" }), (0,jsx_runtime.jsx)(StatCard, { title: "Failed", value: reportData.statistics.totalFailed, icon: (0,jsx_runtime.jsx)(lucide_react.XCircle, { className: "w-6 h-6 text-white" }), color: "bg-red-500", subtitle: `${reportData.statistics.totalErrors} errors`, "data-cy": "stat-failed", "data-testid": "stat-failed" }), (0,jsx_runtime.jsx)(StatCard, { title: "Avg. Duration", value: `${reportData.statistics.averageDurationMinutes} min`, icon: (0,jsx_runtime.jsx)(lucide_react.Clock, { className: "w-6 h-6 text-white" }), color: "bg-purple-500", subtitle: "Per migration", "data-cy": "stat-duration", "data-testid": "stat-duration" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Overall Success Rate" }), (0,jsx_runtime.jsx)(SuccessGauge, { successRate: reportData.statistics.successRate }), (0,jsx_runtime.jsxs)("div", { className: "mt-4 grid grid-cols-2 gap-4 text-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400", children: reportData.statistics.totalSucceeded.toLocaleString() }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Succeeded" })] }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: reportData.statistics.totalFailed.toLocaleString() }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Failed" })] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Success Rate by Type" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 250, children: (0,jsx_runtime.jsxs)(es6.BarChart, { data: reportData.successRateByType, layout: "horizontal", children: [(0,jsx_runtime.jsx)(es6.CartesianGrid, { strokeDasharray: "3 3", stroke: chartTheme.gridColor }), (0,jsx_runtime.jsx)(es6.XAxis, { type: "number", domain: [0, 100], stroke: chartTheme.textColor }), (0,jsx_runtime.jsx)(es6.YAxis, { type: "category", dataKey: "type", stroke: chartTheme.textColor, width: 120 }), (0,jsx_runtime.jsx)(es6.Tooltip, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) }), (0,jsx_runtime.jsx)(es6.Bar, { dataKey: "successRate", fill: COLORS.success, radius: [0, 8, 8, 0], name: "Success Rate %" })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Migration Timeline" }), (0,jsx_runtime.jsx)(WaveTimeline, { data: reportData.waveTimeline })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Error Breakdown" }), (0,jsx_runtime.jsx)(es6.ResponsiveContainer, { width: "100%", height: 300, children: (0,jsx_runtime.jsxs)(es6.PieChart, { children: [(0,jsx_runtime.jsx)(es6.Pie, { data: reportData.errorBreakdown, cx: "50%", cy: "50%", labelLine: false, label: ({ errorType, percentage }) => `${errorType}: ${percentage}%`, outerRadius: 100, fill: "#8884d8", dataKey: "count", children: reportData.errorBreakdown.map((entry, index) => ((0,jsx_runtime.jsx)(es6.Cell, { fill: PIE_COLORS[index % PIE_COLORS.length] }, `cell-${index}`))) }), (0,jsx_runtime.jsx)(es6.Tooltip, { content: (0,jsx_runtime.jsx)(CustomTooltip, {}) })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsxs)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.AlertCircle, { className: "w-5 h-5 text-red-500" }), "Top Errors"] }), (0,jsx_runtime.jsx)("div", { className: "space-y-3", children: reportData.topErrors.map((error, index) => ((0,jsx_runtime.jsxs)("div", { className: "p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 flex-1", children: error.errorMessage }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-bold text-red-600 dark:text-red-400 ml-2", children: [error.count, "\u00D7"] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { children: [error.affectedUsers, " users affected"] }), (0,jsx_runtime.jsx)("span", { children: "\u2022" }), (0,jsx_runtime.jsxs)("span", { children: ["Last: ", error.lastOccurrence] })] })] }, index))) })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6", children: [(0,jsx_runtime.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Export Report" }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0,jsx_runtime.jsxs)("div", { className: "space-y-3", children: [(0,jsx_runtime.jsx)("h3", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Report Includes:" }), (0,jsx_runtime.jsxs)("ul", { className: "space-y-2 text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-green-500" }), "Executive summary with key metrics"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-green-500" }), "Detailed wave-by-wave analysis"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-green-500" }), "Complete error log with recommendations"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-green-500" }), "Success rate breakdown by resource type"] }), (0,jsx_runtime.jsxs)("li", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-green-500" }), "Visual charts and timeline graphs"] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex flex-col justify-center gap-3", children: [(0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportPDF, variant: "primary", size: "lg", icon: (0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-5 h-5" }), disabled: isExporting, "data-cy": "download-pdf-report", "data-testid": "download-pdf-report", children: isExporting ? 'Generating...' : 'Download PDF Report' }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExportExcel, variant: "secondary", size: "lg", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-5 h-5" }), disabled: isExporting, "data-cy": "download-excel-report", "data-testid": "download-excel-report", children: isExporting ? 'Exporting...' : 'Export to Excel' })] })] })] })] })] }));
};
/* harmony default export */ const analytics_MigrationReportView = (MigrationReportView);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNTAzNS4xZjRmMGY3ZjBiMzVlZDFjNjNjMC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLGU7Ozs7Ozs7Ozs7QUNBQSxlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQWtFO0FBQzNEO0FBQ1Asd0NBQXdDLGtCQUFRO0FBQ2hELHNDQUFzQyxrQkFBUTtBQUM5Qyw4QkFBOEIsa0JBQVE7QUFDdEMsMENBQTBDLGtCQUFRO0FBQ2xELDRDQUE0QyxrQkFBUTtBQUNwRCw0QkFBNEIscUJBQVc7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxJQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGNBQWMsZ0VBQWdFO0FBQzlFLGNBQWMsNkRBQTZEO0FBQzNFLGNBQWMsNkRBQTZEO0FBQzNFLGNBQWMsMERBQTBEO0FBQ3hFLGNBQWMsNERBQTREO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGNBQWMsbUZBQW1GO0FBQ2pHLGNBQWMsK0VBQStFO0FBQzdGLGNBQWMsOEVBQThFO0FBQzVGLGNBQWMsbUZBQW1GO0FBQ2pHLGNBQWMsd0VBQXdFO0FBQ3RGO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxtQkFBUztBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNEJBQTRCLHFCQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOEJBQThCLHFCQUFXO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDJCQUEyQixpQkFBTztBQUNsQztBQUNBO0FBQ0EsbURBQW1ELGtDQUFrQztBQUNyRixLQUFLO0FBQ0w7QUFDQSw0QkFBNEIsaUJBQU87QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUM1UStEO0FBQ3JDO0FBQzJIO0FBQ2pEO0FBQ3RCO0FBQ3ZCO0FBQ0E7QUFDdkQsb0JBQW9CLHdEQUF3RCxNQUFNLG1CQUFJLFVBQVUsMElBQTBJLG9CQUFLLFVBQVUsZ0VBQWdFLG1CQUFJLFVBQVUsNkJBQTZCLE1BQU0sbUJBQW1CLEdBQUcsb0JBQUssVUFBVSxvQ0FBb0MsbUJBQUksUUFBUSx3RUFBd0UsR0FBRyxtQkFBSSxRQUFRLHdJQUF3SSxlQUFlLG1CQUFJLFFBQVEsZ0ZBQWdGLElBQUksSUFBSSxHQUFHO0FBQ3B4QjtBQUNBLDhCQUE4QixvQkFBSyxVQUFVLDREQUE0RCxtQkFBSSxVQUFVLDhEQUE4RCxHQUFHLG1CQUFJLFVBQVUsMEdBQTBHLG1CQUFJLFVBQVUsMkRBQTJELFFBQVEsR0FBRyxtQkFBSSxVQUFVLDJGQUEyRixtQkFBSSxVQUFVLDJEQUEyRCxRQUFRLElBQUk7QUFDbGtCO0FBQ0EseUJBQXlCLHdCQUF3QjtBQUNqRDtBQUNBO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLHdIQUF3SCxtQkFBSSxRQUFRLHlGQUF5RixrQ0FBa0Msb0JBQUssUUFBUSxrRUFBa0Usb0JBQUssV0FBVyxTQUFTLG9CQUFvQixnQ0FBZ0MsR0FBRyxtQkFBSSxXQUFXLG9IQUFvSCxJQUFJLGFBQWE7QUFDN2tCO0FBQ0E7QUFDQSx3QkFBd0IsTUFBTTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxtQkFBSSxVQUFVLHFFQUFxRSxvQkFBSyxVQUFVLG1DQUFtQyxvQkFBSyxVQUFVLDJEQUEyRCxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxXQUFXLDRGQUE0RixHQUFHLG1CQUFJLFdBQVcseURBQXlEO0FBQ2pkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrSEFBa0gsMENBQTBDLElBQUksR0FBRyxvQkFBSyxVQUFVLHNJQUFzSSxlQUFlLFNBQVMsSUFBSSxHQUFHLG1CQUFJLFVBQVUsb0dBQW9HLG1CQUFJLFVBQVUsMkNBQTJDLDZCQUE2Qix1Q0FBdUMsVUFBVSxjQUFjLElBQUksWUFBWSxtQkFBSSxVQUFVLGdFQUFnRSxvQkFBSyxXQUFXLDZFQUE2RSxHQUFHLEdBQUcsR0FBRyxJQUFJLFlBQVk7QUFDbHpCO0FBQ0E7QUFDQSx3QkFBd0IsYUFBYTtBQUNyQyxvQkFBb0IsMkhBQTJIO0FBQy9JLFlBQVksbUJBQUksQ0FBQyx1QkFBbUIsSUFBSSxzQ0FBc0Msb0JBQUssQ0FBQyxrQkFBYyxJQUFJLGdJQUFnSSxtQkFBSSxDQUFDLGFBQVMsSUFBSSxzREFBc0QsR0FBRyxvQkFBSyxXQUFXLHNLQUFzSyxHQUFHLG1CQUFJLFdBQVcsb0lBQW9JLElBQUksR0FBRztBQUNwb0I7QUFDQTtBQUNBLFlBQVksaUpBQWlKLEVBQUUsdUJBQXVCO0FBQ3RMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBSSxtQkFBbUI7QUFDdEM7QUFDQTtBQUNBLGdCQUFnQixtQkFBSSxVQUFVLDBIQUEwSCxtQkFBSSxVQUFVLG9DQUFvQyxtQkFBSSxRQUFRLHNFQUFzRSxHQUFHLEdBQUc7QUFDbFM7QUFDQTtBQUNBLGdCQUFnQixtQkFBSSxVQUFVLGdFQUFnRSxtQkFBSSxRQUFRLHFGQUFxRixHQUFHO0FBQ2xNO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLHNKQUFzSixvQkFBSyxVQUFVLHVJQUF1SSxvQkFBSyxVQUFVLFdBQVcsbUJBQUksU0FBUyxnR0FBZ0csR0FBRyxvQkFBSyxRQUFRLG9IQUFvSCxJQUFJLEdBQUcsb0JBQUssVUFBVSxpREFBaUQsb0JBQUssVUFBVSxpREFBaUQsbUJBQUksQ0FBQyxtQkFBTSxJQUFJLG9DQUFvQyxHQUFHLG1CQUFJLENBQUMsYUFBTSxJQUFJO0FBQzl4Qiw4Q0FBOEMsa0NBQWtDO0FBQ2hGLDZFQUE2RSxrQ0FBa0M7QUFDL0csMkNBQTJDLElBQUksR0FBRyxtQkFBSSxDQUFDLGFBQU0sSUFBSSxvRUFBb0UsbUJBQUksQ0FBQyxxQkFBUSxJQUFJLHNCQUFzQixzSEFBc0gsR0FBRyxtQkFBSSxDQUFDLGFBQU0sSUFBSSxnRUFBZ0UsbUJBQUksQ0FBQyxxQkFBUSxJQUFJLHNCQUFzQixrSEFBa0gsSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSw0REFBNEQsb0JBQUssVUFBVSw4RUFBOEUsbUJBQUksYUFBYSw4RUFBOEUsbUJBQUksQ0FBQyxrQkFBSyxJQUFJLGlDQUFpQyxzR0FBc0csR0FBRyxtQkFBSSxhQUFhLHdFQUF3RSxtQkFBSSxDQUFDLHdCQUFXLElBQUksaUNBQWlDLHVDQUF1QyxrQ0FBa0MsMkVBQTJFLEdBQUcsbUJBQUksYUFBYSxpRUFBaUUsbUJBQUksQ0FBQyxvQkFBTyxJQUFJLGlDQUFpQyxxQ0FBcUMsbUNBQW1DLGlFQUFpRSxHQUFHLG1CQUFJLGFBQWEsa0NBQWtDLDhDQUE4QyxZQUFZLG1CQUFJLENBQUMsa0JBQUssSUFBSSxpQ0FBaUMsa0hBQWtILElBQUksR0FBRyxvQkFBSyxVQUFVLCtEQUErRCxvQkFBSyxVQUFVLDhHQUE4RyxtQkFBSSxTQUFTLDRHQUE0RyxHQUFHLG1CQUFJLGlCQUFpQixnREFBZ0QsR0FBRyxvQkFBSyxVQUFVLGlFQUFpRSxvQkFBSyxVQUFVLFdBQVcsbUJBQUksUUFBUSxxSUFBcUksR0FBRyxtQkFBSSxRQUFRLDhFQUE4RSxJQUFJLEdBQUcsb0JBQUssVUFBVSxXQUFXLG1CQUFJLFFBQVEsOEhBQThILEdBQUcsbUJBQUksUUFBUSwyRUFBMkUsSUFBSSxJQUFJLElBQUksR0FBRyxvQkFBSyxVQUFVLDhHQUE4RyxtQkFBSSxTQUFTLDRHQUE0RyxHQUFHLG1CQUFJLENBQUMsdUJBQW1CLElBQUksc0NBQXNDLG9CQUFLLENBQUMsWUFBUSxJQUFJLHFFQUFxRSxtQkFBSSxDQUFDLGlCQUFhLElBQUksc0RBQXNELEdBQUcsbUJBQUksQ0FBQyxTQUFLLElBQUksZ0VBQWdFLEdBQUcsbUJBQUksQ0FBQyxTQUFLLElBQUksNkVBQTZFLEdBQUcsbUJBQUksQ0FBQyxXQUFPLElBQUksU0FBUyxtQkFBSSxrQkFBa0IsR0FBRyxHQUFHLG1CQUFJLENBQUMsT0FBRyxJQUFJLDRGQUE0RixJQUFJLEdBQUcsSUFBSSxHQUFHLG9CQUFLLFVBQVUsNEhBQTRILG1CQUFJLFNBQVMsMEdBQTBHLEdBQUcsbUJBQUksaUJBQWlCLCtCQUErQixJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsbUJBQUksU0FBUyx1R0FBdUcsR0FBRyxtQkFBSSxDQUFDLHVCQUFtQixJQUFJLHNDQUFzQyxvQkFBSyxDQUFDLFlBQVEsSUFBSSxXQUFXLG1CQUFJLENBQUMsT0FBRyxJQUFJLG1GQUFtRix1QkFBdUIsUUFBUSxVQUFVLElBQUksV0FBVyxvSEFBb0gsbUJBQUksQ0FBQyxRQUFJLElBQUksNkNBQTZDLFVBQVUsTUFBTSxNQUFNLEdBQUcsbUJBQUksQ0FBQyxXQUFPLElBQUksU0FBUyxtQkFBSSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLG9CQUFLLFVBQVUsOEdBQThHLG9CQUFLLFNBQVMsNkdBQTZHLG1CQUFJLENBQUMsd0JBQVcsSUFBSSxtQ0FBbUMsa0JBQWtCLEdBQUcsbUJBQUksVUFBVSw4RUFBOEUsb0JBQUssVUFBVSxnSEFBZ0gsb0JBQUssVUFBVSwrREFBK0QsbUJBQUksUUFBUSx3R0FBd0csR0FBRyxvQkFBSyxXQUFXLHVHQUF1RyxJQUFJLEdBQUcsb0JBQUssVUFBVSwwRkFBMEYsb0JBQUssV0FBVyxvREFBb0QsR0FBRyxtQkFBSSxXQUFXLG9CQUFvQixHQUFHLG9CQUFLLFdBQVcsNENBQTRDLElBQUksSUFBSSxZQUFZLElBQUksSUFBSSxHQUFHLG9CQUFLLFVBQVUsOEdBQThHLG1CQUFJLFNBQVMscUdBQXFHLEdBQUcsb0JBQUssVUFBVSwrREFBK0Qsb0JBQUssVUFBVSxtQ0FBbUMsbUJBQUksU0FBUyxpR0FBaUcsR0FBRyxvQkFBSyxTQUFTLDRFQUE0RSxvQkFBSyxTQUFTLGlEQUFpRCxtQkFBSSxDQUFDLHdCQUFXLElBQUkscUNBQXFDLDBDQUEwQyxHQUFHLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsd0JBQVcsSUFBSSxxQ0FBcUMsc0NBQXNDLEdBQUcsb0JBQUssU0FBUyxpREFBaUQsbUJBQUksQ0FBQyx3QkFBVyxJQUFJLHFDQUFxQywrQ0FBK0MsR0FBRyxvQkFBSyxTQUFTLGlEQUFpRCxtQkFBSSxDQUFDLHdCQUFXLElBQUkscUNBQXFDLCtDQUErQyxHQUFHLG9CQUFLLFNBQVMsaURBQWlELG1CQUFJLENBQUMsd0JBQVcsSUFBSSxxQ0FBcUMseUNBQXlDLElBQUksSUFBSSxHQUFHLG9CQUFLLFVBQVUsNERBQTRELG1CQUFJLENBQUMsYUFBTSxJQUFJLGdFQUFnRSxtQkFBSSxDQUFDLHFCQUFRLElBQUksc0JBQXNCLG1LQUFtSyxHQUFHLG1CQUFJLENBQUMsYUFBTSxJQUFJLG9FQUFvRSxtQkFBSSxDQUFDLHFCQUFRLElBQUksc0JBQXNCLGtLQUFrSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUk7QUFDcHhQO0FBQ0Esb0VBQWUsbUJBQW1CLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi9pZ25vcmVkfEM6XFxFbnRlcnByaXNlRGlzY292ZXJ5XFxndWl2Mlxcbm9kZV9tb2R1bGVzXFxlcy10b29sa2l0XFxkaXN0XFxwcmVkaWNhdGV8cHJvY2Vzcy9icm93c2VyIiwid2VicGFjazovL2d1aXYyL2lnbm9yZWR8QzpcXEVudGVycHJpc2VEaXNjb3ZlcnlcXGd1aXYyXFxub2RlX21vZHVsZXNcXHJlY2hhcnRzXFxub2RlX21vZHVsZXNcXEByZWR1eGpzXFx0b29sa2l0XFxkaXN0fHByb2Nlc3MvYnJvd3NlciIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VNaWdyYXRpb25SZXBvcnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hbmFseXRpY3MvTWlncmF0aW9uUmVwb3J0Vmlldy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5leHBvcnQgY29uc3QgdXNlTWlncmF0aW9uUmVwb3J0TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3JlcG9ydERhdGEsIHNldFJlcG9ydERhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzRXhwb3J0aW5nLCBzZXRJc0V4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlbGVjdGVkV2F2ZSwgc2V0U2VsZWN0ZWRXYXZlXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBmZXRjaFJlcG9ydERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgUG93ZXJTaGVsbCBzY3JpcHQgdG8gZ2V0IG1pZ3JhdGlvbiByZXBvcnQgZGF0YVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0FuYWx5dGljcy9NaWdyYXRpb25SZXBvcnQucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LU1pZ3JhdGlvblJlcG9ydERhdGEnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUlkOiBzZWxlY3RlZFdhdmUgPT09ICdhbGwnID8gbnVsbCA6IHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0aXN0aWNzOiBjYWxjdWxhdGVTdGF0aXN0aWNzKHJlc3VsdC5kYXRhKSxcbiAgICAgICAgICAgICAgICAgICAgd2F2ZVRpbWVsaW5lOiByZXN1bHQuZGF0YS53YXZlVGltZWxpbmUgfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQnJlYWtkb3duOiBjYWxjdWxhdGVFcnJvckJyZWFrZG93bihyZXN1bHQuZGF0YS5lcnJvcnMgfHwgW10pLFxuICAgICAgICAgICAgICAgICAgICB0b3BFcnJvcnM6IHJlc3VsdC5kYXRhLnRvcEVycm9ycyB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc1JhdGVCeVR5cGU6IHJlc3VsdC5kYXRhLnN1Y2Nlc3NSYXRlQnlUeXBlIHx8IFtdLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0UmVwb3J0RGF0YShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBmZXRjaCByZXBvcnQgZGF0YScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTWlncmF0aW9uIHJlcG9ydCBmZXRjaCBlcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgLy8gU2V0IG1vY2sgZGF0YSBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgICAgICAgICAgc2V0UmVwb3J0RGF0YShnZXRNb2NrUmVwb3J0RGF0YSgpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRXYXZlXSk7XG4gICAgLy8gQ2FsY3VsYXRlIG1pZ3JhdGlvbiBzdGF0aXN0aWNzXG4gICAgY29uc3QgY2FsY3VsYXRlU3RhdGlzdGljcyA9IChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdGFsQXR0ZW1wdGVkID0gZGF0YS50b3RhbEF0dGVtcHRlZCB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbFN1Y2NlZWRlZCA9IGRhdGEudG90YWxTdWNjZWVkZWQgfHwgMDtcbiAgICAgICAgY29uc3QgdG90YWxGYWlsZWQgPSBkYXRhLnRvdGFsRmFpbGVkIHx8IDA7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NSYXRlID0gdG90YWxBdHRlbXB0ZWQgPiAwID8gTWF0aC5yb3VuZCgodG90YWxTdWNjZWVkZWQgLyB0b3RhbEF0dGVtcHRlZCkgKiAxMDApIDogMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsQXR0ZW1wdGVkLFxuICAgICAgICAgICAgdG90YWxTdWNjZWVkZWQsXG4gICAgICAgICAgICB0b3RhbEZhaWxlZCxcbiAgICAgICAgICAgIHN1Y2Nlc3NSYXRlLFxuICAgICAgICAgICAgYXZlcmFnZUR1cmF0aW9uTWludXRlczogZGF0YS5hdmVyYWdlRHVyYXRpb25NaW51dGVzIHx8IDAsXG4gICAgICAgICAgICB0b3RhbEVycm9yczogZGF0YS50b3RhbEVycm9ycyB8fCAwLFxuICAgICAgICB9O1xuICAgIH07XG4gICAgLy8gQ2FsY3VsYXRlIGVycm9yIGJyZWFrZG93biB3aXRoIHBlcmNlbnRhZ2VzXG4gICAgY29uc3QgY2FsY3VsYXRlRXJyb3JCcmVha2Rvd24gPSAoZXJyb3JzKSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yQ291bnRzID0gZXJyb3JzLnJlZHVjZSgoYWNjLCBlcnJvcikgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IGVycm9yLnR5cGUgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgYWNjW3R5cGVdID0gKGFjY1t0eXBlXSB8fCAwKSArIDE7XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gT2JqZWN0LnZhbHVlcyhlcnJvckNvdW50cykucmVkdWNlKChzdW0sIGNvdW50KSA9PiBzdW0gKyBjb3VudCwgMCk7XG4gICAgICAgIGlmICh0b3RhbCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKGVycm9yQ291bnRzKVxuICAgICAgICAgICAgLm1hcCgoW2Vycm9yVHlwZSwgY291bnRdKSA9PiAoe1xuICAgICAgICAgICAgZXJyb3JUeXBlLFxuICAgICAgICAgICAgY291bnQsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiBNYXRoLnJvdW5kKChjb3VudCAvIHRvdGFsKSAqIDEwMCksXG4gICAgICAgIH0pKVxuICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY291bnQgLSBhLmNvdW50KTtcbiAgICB9O1xuICAgIC8vIE1vY2sgZGF0YSBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgIGNvbnN0IGdldE1vY2tSZXBvcnREYXRhID0gKCkgPT4gKHtcbiAgICAgICAgc3RhdGlzdGljczoge1xuICAgICAgICAgICAgdG90YWxBdHRlbXB0ZWQ6IDEyNTQ3LFxuICAgICAgICAgICAgdG90YWxTdWNjZWVkZWQ6IDExODM0LFxuICAgICAgICAgICAgdG90YWxGYWlsZWQ6IDcxMyxcbiAgICAgICAgICAgIHN1Y2Nlc3NSYXRlOiA5NCxcbiAgICAgICAgICAgIGF2ZXJhZ2VEdXJhdGlvbk1pbnV0ZXM6IDIzLFxuICAgICAgICAgICAgdG90YWxFcnJvcnM6IDEyNDcsXG4gICAgICAgIH0sXG4gICAgICAgIHdhdmVUaW1lbGluZTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdhdmVOYW1lOiAnV2F2ZSAxIC0gRXhlY3V0aXZlIFRlYW0nLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJzIwMjUtMDktMDEnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICcyMDI1LTA5LTA1JyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdjb21wbGV0ZWQnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiAxMDAsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdhdmVOYW1lOiAnV2F2ZSAyIC0gU2FsZXMgRGVwYXJ0bWVudCcsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnMjAyNS0wOS0wOCcsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJzIwMjUtMDktMTUnLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2F2ZU5hbWU6ICdXYXZlIDMgLSBFbmdpbmVlcmluZycsXG4gICAgICAgICAgICAgICAgc3RhcnREYXRlOiAnMjAyNS0wOS0xNicsXG4gICAgICAgICAgICAgICAgZW5kRGF0ZTogJzIwMjUtMDktMjUnLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IDEwMCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogOSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2F2ZU5hbWU6ICdXYXZlIDQgLSBPcGVyYXRpb25zJyxcbiAgICAgICAgICAgICAgICBzdGFydERhdGU6ICcyMDI1LTA5LTI2JyxcbiAgICAgICAgICAgICAgICBlbmREYXRlOiAnMjAyNS0xMC0wMicsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnaW5fcHJvZ3Jlc3MnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiA3NSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2F2ZU5hbWU6ICdXYXZlIDUgLSBTdXBwb3J0ICYgQWRtaW4nLFxuICAgICAgICAgICAgICAgIHN0YXJ0RGF0ZTogJzIwMjUtMTAtMDUnLFxuICAgICAgICAgICAgICAgIGVuZERhdGU6ICcyMDI1LTEwLTEyJyxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdwZW5kaW5nJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICAgIGVycm9yQnJlYWtkb3duOiBbXG4gICAgICAgICAgICB7IGVycm9yVHlwZTogJ0F1dGhlbnRpY2F0aW9uIEZhaWxlZCcsIGNvdW50OiA0MjMsIHBlcmNlbnRhZ2U6IDM0IH0sXG4gICAgICAgICAgICB7IGVycm9yVHlwZTogJ01haWxib3ggU2l6ZSBMaW1pdCcsIGNvdW50OiAzMTIsIHBlcmNlbnRhZ2U6IDI1IH0sXG4gICAgICAgICAgICB7IGVycm9yVHlwZTogJ0xpY2Vuc2UgQXNzaWdubWVudCcsIGNvdW50OiAyMzQsIHBlcmNlbnRhZ2U6IDE5IH0sXG4gICAgICAgICAgICB7IGVycm9yVHlwZTogJ05ldHdvcmsgVGltZW91dCcsIGNvdW50OiAxNTYsIHBlcmNlbnRhZ2U6IDEyIH0sXG4gICAgICAgICAgICB7IGVycm9yVHlwZTogJ1Blcm1pc3Npb24gRGVuaWVkJywgY291bnQ6IDEyMiwgcGVyY2VudGFnZTogMTAgfSxcbiAgICAgICAgXSxcbiAgICAgICAgdG9wRXJyb3JzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnRmFpbGVkIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHNvdXJjZSB0ZW5hbnQnLFxuICAgICAgICAgICAgICAgIGNvdW50OiA0MjMsXG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRVc2VyczogMzg5LFxuICAgICAgICAgICAgICAgIGxhc3RPY2N1cnJlbmNlOiAnMjAyNS0xMC0wMiAxNDozMjoxNScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ01haWxib3ggZXhjZWVkcyBtYXhpbXVtIHNpemUgZm9yIG1pZ3JhdGlvbicsXG4gICAgICAgICAgICAgICAgY291bnQ6IDMxMixcbiAgICAgICAgICAgICAgICBhZmZlY3RlZFVzZXJzOiAzMTIsXG4gICAgICAgICAgICAgICAgbGFzdE9jY3VycmVuY2U6ICcyMDI1LTEwLTAyIDE2OjQ1OjIzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnVW5hYmxlIHRvIGFzc2lnbiByZXF1aXJlZCBsaWNlbnNlJyxcbiAgICAgICAgICAgICAgICBjb3VudDogMjM0LFxuICAgICAgICAgICAgICAgIGFmZmVjdGVkVXNlcnM6IDE5OCxcbiAgICAgICAgICAgICAgICBsYXN0T2NjdXJyZW5jZTogJzIwMjUtMTAtMDEgMTE6MjA6NDUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdDb25uZWN0aW9uIHRpbWVvdXQgZHVyaW5nIGRhdGEgdHJhbnNmZXInLFxuICAgICAgICAgICAgICAgIGNvdW50OiAxNTYsXG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRVc2VyczogMTQyLFxuICAgICAgICAgICAgICAgIGxhc3RPY2N1cnJlbmNlOiAnMjAyNS0wOS0zMCAwOToxNTozMCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ0luc3VmZmljaWVudCBwZXJtaXNzaW9ucyBvbiB0YXJnZXQnLFxuICAgICAgICAgICAgICAgIGNvdW50OiAxMjIsXG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRVc2VyczogMTE1LFxuICAgICAgICAgICAgICAgIGxhc3RPY2N1cnJlbmNlOiAnMjAyNS0wOS0yOSAxNTo0MDoxMicsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzdWNjZXNzUmF0ZUJ5VHlwZTogW1xuICAgICAgICAgICAgeyB0eXBlOiAnVXNlciBBY2NvdW50cycsIHN1Y2Nlc3NSYXRlOiA5NiwgdG90YWw6IDg1MDAsIHN1Y2NlZWRlZDogODE2MCwgZmFpbGVkOiAzNDAgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ01haWxib3hlcycsIHN1Y2Nlc3NSYXRlOiA5MiwgdG90YWw6IDgyMDAsIHN1Y2NlZWRlZDogNzU0NCwgZmFpbGVkOiA2NTYgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ09uZURyaXZlJywgc3VjY2Vzc1JhdGU6IDk0LCB0b3RhbDogNzgwMCwgc3VjY2VlZGVkOiA3MzMyLCBmYWlsZWQ6IDQ2OCB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnU2hhcmVQb2ludCBTaXRlcycsIHN1Y2Nlc3NSYXRlOiA4OSwgdG90YWw6IDQ1MCwgc3VjY2VlZGVkOiA0MDEsIGZhaWxlZDogNDkgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ1RlYW1zJywgc3VjY2Vzc1JhdGU6IDkxLCB0b3RhbDogMzUwLCBzdWNjZWVkZWQ6IDMxOSwgZmFpbGVkOiAzMSB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuICAgIC8vIEluaXRpYWwgbG9hZFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGZldGNoUmVwb3J0RGF0YSgpO1xuICAgIH0sIFtmZXRjaFJlcG9ydERhdGFdKTtcbiAgICAvLyBFeHBvcnQgUERGIFJlcG9ydFxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydFBERiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFyZXBvcnREYXRhKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0V4cG9ydGluZyh0cnVlKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9BbmFseXRpY3MvRXhwb3J0UmVwb3J0LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1NaWdyYXRpb25SZXBvcnQnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVwb3J0RGF0YSxcbiAgICAgICAgICAgICAgICAgICAgd2F2ZUlkOiBzZWxlY3RlZFdhdmUsXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdDogJ3BkZicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BERiByZXBvcnQgZXhwb3J0ZWQgc3VjY2Vzc2Z1bGx5OicsIHJlc3VsdC5kYXRhLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAvLyBDb3VsZCB0cmlnZ2VyIGEgc3VjY2VzcyBub3RpZmljYXRpb24gaGVyZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnUERGIGV4cG9ydCBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1BERiBleHBvcnQgZmFpbGVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQREYgZXhwb3J0IGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0V4cG9ydGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbcmVwb3J0RGF0YSwgc2VsZWN0ZWRXYXZlXSk7XG4gICAgLy8gRXhwb3J0IEV4Y2VsIFJlcG9ydFxuICAgIGNvbnN0IGhhbmRsZUV4cG9ydEV4Y2VsID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXJlcG9ydERhdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHNldElzRXhwb3J0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0FuYWx5dGljcy9FeHBvcnRSZXBvcnQucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LU1pZ3JhdGlvblJlcG9ydCcsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXBvcnREYXRhLFxuICAgICAgICAgICAgICAgICAgICB3YXZlSWQ6IHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiAnZXhjZWwnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFeGNlbCByZXBvcnQgZXhwb3J0ZWQgc3VjY2Vzc2Z1bGx5OicsIHJlc3VsdC5kYXRhLmZpbGVQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0V4Y2VsIGV4cG9ydCBmYWlsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0V4Y2VsIGV4cG9ydCBmYWlsZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4Y2VsIGV4cG9ydCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNFeHBvcnRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3JlcG9ydERhdGEsIHNlbGVjdGVkV2F2ZV0pO1xuICAgIC8vIEdldCBhdmFpbGFibGUgd2F2ZXMgZm9yIGZpbHRlclxuICAgIGNvbnN0IGF2YWlsYWJsZVdhdmVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcmVwb3J0RGF0YSlcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIHJlcG9ydERhdGEud2F2ZVRpbWVsaW5lLm1hcCh3ID0+ICh7IGlkOiB3LndhdmVOYW1lLCBuYW1lOiB3LndhdmVOYW1lIH0pKTtcbiAgICB9LCBbcmVwb3J0RGF0YV0pO1xuICAgIC8vIENhbGN1bGF0ZSBvdmVyYWxsIHByb2dyZXNzXG4gICAgY29uc3Qgb3ZlcmFsbFByb2dyZXNzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcmVwb3J0RGF0YSB8fCByZXBvcnREYXRhLndhdmVUaW1lbGluZS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgY29uc3QgdG90YWxQcm9ncmVzcyA9IHJlcG9ydERhdGEud2F2ZVRpbWVsaW5lLnJlZHVjZSgoc3VtLCB3YXZlKSA9PiBzdW0gKyB3YXZlLnByb2dyZXNzLCAwKTtcbiAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodG90YWxQcm9ncmVzcyAvIHJlcG9ydERhdGEud2F2ZVRpbWVsaW5lLmxlbmd0aCk7XG4gICAgfSwgW3JlcG9ydERhdGFdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXBvcnREYXRhLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBpc0V4cG9ydGluZyxcbiAgICAgICAgc2VsZWN0ZWRXYXZlLFxuICAgICAgICBzZXRTZWxlY3RlZFdhdmUsXG4gICAgICAgIGF2YWlsYWJsZVdhdmVzLFxuICAgICAgICBvdmVyYWxsUHJvZ3Jlc3MsXG4gICAgICAgIGhhbmRsZUV4cG9ydFBERixcbiAgICAgICAgaGFuZGxlRXhwb3J0RXhjZWwsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEJhckNoYXJ0LCBCYXIsIFBpZUNoYXJ0LCBQaWUsIENlbGwsIFJhZGlhbEJhckNoYXJ0LCBSYWRpYWxCYXIsIFhBeGlzLCBZQXhpcywgQ2FydGVzaWFuR3JpZCwgVG9vbHRpcCwgUmVzcG9uc2l2ZUNvbnRhaW5lciwgfSBmcm9tICdyZWNoYXJ0cyc7XG5pbXBvcnQgeyBEb3dubG9hZCwgRmlsZVRleHQsIENoZWNrQ2lyY2xlLCBYQ2lyY2xlLCBDbG9jaywgQWxlcnRDaXJjbGUsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VNaWdyYXRpb25SZXBvcnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZU1pZ3JhdGlvblJlcG9ydExvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmNvbnN0IFN0YXRDYXJkID0gKHsgdGl0bGUsIHZhbHVlLCBpY29uLCBjb2xvciwgc3VidGl0bGUsICdkYXRhLWN5JzogZGF0YUN5IH0pID0+IChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBzaGFkb3ctc21cIiwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYHAtMyByb3VuZGVkLWxnICR7Y29sb3J9YCwgY2hpbGRyZW46IGljb24gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiB0aXRsZSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUudG9Mb2NhbGVTdHJpbmcoKSA6IHZhbHVlIH0pLCBzdWJ0aXRsZSAmJiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IHN1YnRpdGxlIH0pXSB9KV0gfSkgfSkpO1xuLy8gTG9hZGluZyBTa2VsZXRvblxuY29uc3QgUmVwb3J0U2tlbGV0b24gPSAoKSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIHAtNiBzcGFjZS15LTYgYW5pbWF0ZS1wdWxzZVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0xMCBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQgdy0xLzNcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC00XCIsIGNoaWxkcmVuOiBbLi4uQXJyYXkoNCldLm1hcCgoXywgaSkgPT4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC0zMiBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtbGdcIiB9LCBpKSkpIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFsuLi5BcnJheSg0KV0ubWFwKChfLCBpKSA9PiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLTk2IGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZ1wiIH0sIGkpKSkgfSldIH0pKTtcbi8vIEN1c3RvbSBUb29sdGlwXG5jb25zdCBDdXN0b21Ub29sdGlwID0gKHsgYWN0aXZlLCBwYXlsb2FkLCBsYWJlbCB9KSA9PiB7XG4gICAgaWYgKCFhY3RpdmUgfHwgIXBheWxvYWQgfHwgIXBheWxvYWQubGVuZ3RoKVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcC0zIHJvdW5kZWQtbGcgc2hhZG93LWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTJcIiwgY2hpbGRyZW46IGxhYmVsIH0pLCBwYXlsb2FkLm1hcCgoZW50cnksIGluZGV4KSA9PiAoX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcInNwYW5cIiwgeyBzdHlsZTogeyBjb2xvcjogZW50cnkuY29sb3IgfSwgY2hpbGRyZW46IFtlbnRyeS5uYW1lLCBcIjogXCJdIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkXCIsIGNoaWxkcmVuOiB0eXBlb2YgZW50cnkudmFsdWUgPT09ICdudW1iZXInID8gZW50cnkudmFsdWUudG9Mb2NhbGVTdHJpbmcoKSA6IGVudHJ5LnZhbHVlIH0pXSB9LCBpbmRleCkpKV0gfSkpO1xufTtcbi8vIEdhbnR0LXN0eWxlIFRpbWVsaW5lIENvbXBvbmVudFxuY29uc3QgV2F2ZVRpbWVsaW5lID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgY29uc3QgZ2V0U3RhdHVzQ29sb3IgPSAoc3RhdHVzKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgICAgICBjYXNlICdjb21wbGV0ZWQnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctZ3JlZW4tNTAwJztcbiAgICAgICAgICAgIGNhc2UgJ2luX3Byb2dyZXNzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWJsdWUtNTAwJztcbiAgICAgICAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuICdiZy1yZWQtNTAwJztcbiAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiAnYmctZ3JheS00MDAnO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2JnLWdyYXktMzAwJztcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgZ2V0U3RhdHVzTGFiZWwgPSAoc3RhdHVzKSA9PiB7XG4gICAgICAgIHJldHVybiBzdGF0dXMucmVwbGFjZSgnXycsICcgJykucmVwbGFjZSgvXFxiXFx3L2csIGwgPT4gbC50b1VwcGVyQ2FzZSgpKTtcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTRcIiwgY2hpbGRyZW46IChkYXRhID8/IFtdKS5tYXAoKHdhdmUsIGluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiB3YXZlLndhdmVOYW1lIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogYHB4LTIgcHktMSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHJvdW5kZWQtZnVsbCAke3dhdmUuc3RhdHVzID09PSAnY29tcGxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTcwMCBkYXJrOmJnLWdyZWVuLTkwMCBkYXJrOnRleHQtZ3JlZW4tMzAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogd2F2ZS5zdGF0dXMgPT09ICdpbl9wcm9ncmVzcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTcwMCBkYXJrOmJnLWJsdWUtOTAwIGRhcms6dGV4dC1ibHVlLTMwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB3YXZlLnN0YXR1cyA9PT0gJ2ZhaWxlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLXJlZC0xMDAgdGV4dC1yZWQtNzAwIGRhcms6YmctcmVkLTkwMCBkYXJrOnRleHQtcmVkLTMwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS03MDAgZGFyazpiZy1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0zMDAnfWAsIGNoaWxkcmVuOiBnZXRTdGF0dXNMYWJlbCh3YXZlLnN0YXR1cykgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbd2F2ZS5zdGFydERhdGUsIFwiIFxcdTIxOTIgXCIsIHdhdmUuZW5kRGF0ZSwgd2F2ZS5kdXJhdGlvbiA+IDAgJiYgYCAoJHt3YXZlLmR1cmF0aW9ufSBkYXlzKWBdIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZSB3LWZ1bGwgaC04IGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1sZyBvdmVyZmxvdy1oaWRkZW5cIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBhYnNvbHV0ZSB0b3AtMCBsZWZ0LTAgaC1mdWxsICR7Z2V0U3RhdHVzQ29sb3Iod2F2ZS5zdGF0dXMpfSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi01MDBgLCBzdHlsZTogeyB3aWR0aDogYCR7d2F2ZS5wcm9ncmVzc30lYCB9LCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGxcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFt3YXZlLnByb2dyZXNzLCBcIiVcIl0gfSkgfSkgfSkgfSldIH0sIGluZGV4KSkpIH0pKTtcbn07XG4vLyBTdWNjZXNzIFJhdGUgR2F1Z2UgQ29tcG9uZW50XG5jb25zdCBTdWNjZXNzR2F1Z2UgPSAoeyBzdWNjZXNzUmF0ZSB9KSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IFt7IG5hbWU6ICdTdWNjZXNzIFJhdGUnLCB2YWx1ZTogc3VjY2Vzc1JhdGUsIGZpbGw6IHN1Y2Nlc3NSYXRlID49IDkwID8gJyMxMGI5ODEnIDogc3VjY2Vzc1JhdGUgPj0gNzUgPyAnI2Y1OWUwYicgOiAnI2VmNDQ0NCcgfV07XG4gICAgcmV0dXJuIChfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDI1MCwgY2hpbGRyZW46IF9qc3hzKFJhZGlhbEJhckNoYXJ0LCB7IGN4OiBcIjUwJVwiLCBjeTogXCI1MCVcIiwgaW5uZXJSYWRpdXM6IFwiNjAlXCIsIG91dGVyUmFkaXVzOiBcIjkwJVwiLCBiYXJTaXplOiAzMCwgZGF0YTogZGF0YSwgc3RhcnRBbmdsZTogMTgwLCBlbmRBbmdsZTogMCwgY2hpbGRyZW46IFtfanN4KFJhZGlhbEJhciwgeyBiYWNrZ3JvdW5kOiB0cnVlLCBkYXRhS2V5OiBcInZhbHVlXCIsIGNvcm5lclJhZGl1czogMTAgfSksIF9qc3hzKFwidGV4dFwiLCB7IHg6IFwiNTAlXCIsIHk6IFwiNTAlXCIsIHRleHRBbmNob3I6IFwibWlkZGxlXCIsIGRvbWluYW50QmFzZWxpbmU6IFwibWlkZGxlXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LTR4bCBmb250LWJvbGQgZmlsbC1ncmF5LTkwMCBkYXJrOmZpbGwtZ3JheS0xMDBcIiwgY2hpbGRyZW46IFtzdWNjZXNzUmF0ZSwgXCIlXCJdIH0pLCBfanN4KFwidGV4dFwiLCB7IHg6IFwiNTAlXCIsIHk6IFwiNjAlXCIsIHRleHRBbmNob3I6IFwibWlkZGxlXCIsIGRvbWluYW50QmFzZWxpbmU6IFwibWlkZGxlXCIsIGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZpbGwtZ3JheS01MDBcIiwgY2hpbGRyZW46IFwiU3VjY2VzcyBSYXRlXCIgfSldIH0pIH0pKTtcbn07XG5jb25zdCBNaWdyYXRpb25SZXBvcnRWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgcmVwb3J0RGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgaXNFeHBvcnRpbmcsIHNlbGVjdGVkV2F2ZSwgc2V0U2VsZWN0ZWRXYXZlLCBhdmFpbGFibGVXYXZlcywgb3ZlcmFsbFByb2dyZXNzLCBoYW5kbGVFeHBvcnRQREYsIGhhbmRsZUV4cG9ydEV4Y2VsLCB9ID0gdXNlTWlncmF0aW9uUmVwb3J0TG9naWMoKTtcbiAgICBjb25zdCBpc0RhcmtNb2RlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnZGFyaycpO1xuICAgIC8vIENoYXJ0IHRoZW1lXG4gICAgY29uc3QgY2hhcnRUaGVtZSA9IHtcbiAgICAgICAgdGV4dENvbG9yOiBpc0RhcmtNb2RlID8gJyNmOWZhZmInIDogJyMxZjI5MzcnLFxuICAgICAgICBncmlkQ29sb3I6IGlzRGFya01vZGUgPyAnIzM3NDE1MScgOiAnI2U1ZTdlYicsXG4gICAgfTtcbiAgICAvLyBDb2xvciBwYWxldHRlXG4gICAgY29uc3QgQ09MT1JTID0ge1xuICAgICAgICBzdWNjZXNzOiBpc0RhcmtNb2RlID8gJyMzNGQzOTknIDogJyMxMGI5ODEnLFxuICAgICAgICBkYW5nZXI6IGlzRGFya01vZGUgPyAnI2Y4NzE3MScgOiAnI2VmNDQ0NCcsXG4gICAgICAgIHdhcm5pbmc6IGlzRGFya01vZGUgPyAnI2ZiYmYyNCcgOiAnI2Y1OWUwYicsXG4gICAgICAgIHByaW1hcnk6IGlzRGFya01vZGUgPyAnIzYwYTVmYScgOiAnIzNiODJmNicsXG4gICAgICAgIHB1cnBsZTogaXNEYXJrTW9kZSA/ICcjYTc4YmZhJyA6ICcjOGI1Y2Y2JyxcbiAgICB9O1xuICAgIGNvbnN0IFBJRV9DT0xPUlMgPSBbQ09MT1JTLmRhbmdlciwgQ09MT1JTLndhcm5pbmcsIENPTE9SUy5wcmltYXJ5LCBDT0xPUlMucHVycGxlLCAnI2Y0NzJiNiddO1xuICAgIGlmIChpc0xvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIF9qc3goUmVwb3J0U2tlbGV0b24sIHt9KTtcbiAgICB9XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgXCJkYXRhLWN5XCI6IFwicmVwb3J0LWVycm9yXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZXBvcnQtZXJyb3JcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCB0ZXh0LWxnXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSB9KSk7XG4gICAgfVxuICAgIGlmICghcmVwb3J0RGF0YSkge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJObyByZXBvcnQgZGF0YSBhdmFpbGFibGVcIiB9KSB9KSk7XG4gICAgfVxuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcIm1pZ3JhdGlvbi1yZXBvcnQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwibWlncmF0aW9uLXJlcG9ydC12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtNiBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBcIk1pZ3JhdGlvbiBSZXBvcnRcIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbXQtMVwiLCBjaGlsZHJlbjogW1wiT3ZlcmFsbCBQcm9ncmVzczogXCIsIG92ZXJhbGxQcm9ncmVzcywgXCIlXCJdIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRmlsdGVyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JheS01MDBcIiB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IHNlbGVjdGVkV2F2ZSwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gc2V0U2VsZWN0ZWRXYXZlKHZhbHVlKSwgY2xhc3NOYW1lOiBcInctNDhcIiwgXCJkYXRhLWN5XCI6IFwid2F2ZS1maWx0ZXJcIiwgXCJkYXRhLXRlc3RpZFwiOiBcIndhdmUtZmlsdGVyXCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIFdhdmVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5hdmFpbGFibGVXYXZlcy5tYXAod2F2ZSA9PiAoeyB2YWx1ZTogd2F2ZS5pZCwgbGFiZWw6IHdhdmUubmFtZSB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pXSB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0RXhjZWwsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1leGNlbC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IEV4Y2VsXCIgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydFBERiwgdmFyaWFudDogXCJwcmltYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1wZGYtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtcGRmLWJ0blwiLCBjaGlsZHJlbjogXCJEb3dubG9hZCBQREZcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTYgc3BhY2UteS02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNFwiLCBjaGlsZHJlbjogW19qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiVG90YWwgTWlncmF0aW9uc1wiLCB2YWx1ZTogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnRvdGFsQXR0ZW1wdGVkLCBpY29uOiBfanN4KENsb2NrLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02IHRleHQtd2hpdGVcIiB9KSwgY29sb3I6IFwiYmctYmx1ZS01MDBcIiwgc3VidGl0bGU6IFwiQXR0ZW1wdGVkXCIsIFwiZGF0YS1jeVwiOiBcInN0YXQtdG90YWxcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtdG90YWxcIiB9KSwgX2pzeChTdGF0Q2FyZCwgeyB0aXRsZTogXCJTdWNjZXNzZnVsXCIsIHZhbHVlOiByZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxTdWNjZWVkZWQsIGljb246IF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1ncmVlbi01MDBcIiwgc3VidGl0bGU6IGAke3JlcG9ydERhdGEuc3RhdGlzdGljcy5zdWNjZXNzUmF0ZX0lIHN1Y2Nlc3MgcmF0ZWAsIFwiZGF0YS1jeVwiOiBcInN0YXQtc3VjY2Vzc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1zdWNjZXNzXCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiRmFpbGVkXCIsIHZhbHVlOiByZXBvcnREYXRhLnN0YXRpc3RpY3MudG90YWxGYWlsZWQsIGljb246IF9qc3goWENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy02IGgtNiB0ZXh0LXdoaXRlXCIgfSksIGNvbG9yOiBcImJnLXJlZC01MDBcIiwgc3VidGl0bGU6IGAke3JlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbEVycm9yc30gZXJyb3JzYCwgXCJkYXRhLWN5XCI6IFwic3RhdC1mYWlsZWRcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXQtZmFpbGVkXCIgfSksIF9qc3goU3RhdENhcmQsIHsgdGl0bGU6IFwiQXZnLiBEdXJhdGlvblwiLCB2YWx1ZTogYCR7cmVwb3J0RGF0YS5zdGF0aXN0aWNzLmF2ZXJhZ2VEdXJhdGlvbk1pbnV0ZXN9IG1pbmAsIGljb246IF9qc3goQ2xvY2ssIHsgY2xhc3NOYW1lOiBcInctNiBoLTYgdGV4dC13aGl0ZVwiIH0pLCBjb2xvcjogXCJiZy1wdXJwbGUtNTAwXCIsIHN1YnRpdGxlOiBcIlBlciBtaWdyYXRpb25cIiwgXCJkYXRhLWN5XCI6IFwic3RhdC1kdXJhdGlvblwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdC1kdXJhdGlvblwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJPdmVyYWxsIFN1Y2Nlc3MgUmF0ZVwiIH0pLCBfanN4KFN1Y2Nlc3NHYXVnZSwgeyBzdWNjZXNzUmF0ZTogcmVwb3J0RGF0YS5zdGF0aXN0aWNzLnN1Y2Nlc3NSYXRlIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IGdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTQgdGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JlZW4tNjAwIGRhcms6dGV4dC1ncmVlbi00MDBcIiwgY2hpbGRyZW46IHJlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbFN1Y2NlZWRlZC50b0xvY2FsZVN0cmluZygpIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlN1Y2NlZWRlZFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDBcIiwgY2hpbGRyZW46IHJlcG9ydERhdGEuc3RhdGlzdGljcy50b3RhbEZhaWxlZC50b0xvY2FsZVN0cmluZygpIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkZhaWxlZFwiIH0pXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiU3VjY2VzcyBSYXRlIGJ5IFR5cGVcIiB9KSwgX2pzeChSZXNwb25zaXZlQ29udGFpbmVyLCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiAyNTAsIGNoaWxkcmVuOiBfanN4cyhCYXJDaGFydCwgeyBkYXRhOiByZXBvcnREYXRhLnN1Y2Nlc3NSYXRlQnlUeXBlLCBsYXlvdXQ6IFwiaG9yaXpvbnRhbFwiLCBjaGlsZHJlbjogW19qc3goQ2FydGVzaWFuR3JpZCwgeyBzdHJva2VEYXNoYXJyYXk6IFwiMyAzXCIsIHN0cm9rZTogY2hhcnRUaGVtZS5ncmlkQ29sb3IgfSksIF9qc3goWEF4aXMsIHsgdHlwZTogXCJudW1iZXJcIiwgZG9tYWluOiBbMCwgMTAwXSwgc3Ryb2tlOiBjaGFydFRoZW1lLnRleHRDb2xvciB9KSwgX2pzeChZQXhpcywgeyB0eXBlOiBcImNhdGVnb3J5XCIsIGRhdGFLZXk6IFwidHlwZVwiLCBzdHJva2U6IGNoYXJ0VGhlbWUudGV4dENvbG9yLCB3aWR0aDogMTIwIH0pLCBfanN4KFRvb2x0aXAsIHsgY29udGVudDogX2pzeChDdXN0b21Ub29sdGlwLCB7fSkgfSksIF9qc3goQmFyLCB7IGRhdGFLZXk6IFwic3VjY2Vzc1JhdGVcIiwgZmlsbDogQ09MT1JTLnN1Y2Nlc3MsIHJhZGl1czogWzAsIDgsIDgsIDBdLCBuYW1lOiBcIlN1Y2Nlc3MgUmF0ZSAlXCIgfSldIH0pIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02IGxnOmNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIG1iLTRcIiwgY2hpbGRyZW46IFwiTWlncmF0aW9uIFRpbWVsaW5lXCIgfSksIF9qc3goV2F2ZVRpbWVsaW5lLCB7IGRhdGE6IHJlcG9ydERhdGEud2F2ZVRpbWVsaW5lIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC02XCIsIGNoaWxkcmVuOiBbX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00XCIsIGNoaWxkcmVuOiBcIkVycm9yIEJyZWFrZG93blwiIH0pLCBfanN4KFJlc3BvbnNpdmVDb250YWluZXIsIHsgd2lkdGg6IFwiMTAwJVwiLCBoZWlnaHQ6IDMwMCwgY2hpbGRyZW46IF9qc3hzKFBpZUNoYXJ0LCB7IGNoaWxkcmVuOiBbX2pzeChQaWUsIHsgZGF0YTogcmVwb3J0RGF0YS5lcnJvckJyZWFrZG93biwgY3g6IFwiNTAlXCIsIGN5OiBcIjUwJVwiLCBsYWJlbExpbmU6IGZhbHNlLCBsYWJlbDogKHsgZXJyb3JUeXBlLCBwZXJjZW50YWdlIH0pID0+IGAke2Vycm9yVHlwZX06ICR7cGVyY2VudGFnZX0lYCwgb3V0ZXJSYWRpdXM6IDEwMCwgZmlsbDogXCIjODg4NGQ4XCIsIGRhdGFLZXk6IFwiY291bnRcIiwgY2hpbGRyZW46IHJlcG9ydERhdGEuZXJyb3JCcmVha2Rvd24ubWFwKChlbnRyeSwgaW5kZXgpID0+IChfanN4KENlbGwsIHsgZmlsbDogUElFX0NPTE9SU1tpbmRleCAlIFBJRV9DT0xPUlMubGVuZ3RoXSB9LCBgY2VsbC0ke2luZGV4fWApKSkgfSksIF9qc3goVG9vbHRpcCwgeyBjb250ZW50OiBfanN4KEN1c3RvbVRvb2x0aXAsIHt9KSB9KV0gfSkgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMCBtYi00IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LXJlZC01MDBcIiB9KSwgXCJUb3AgRXJyb3JzXCJdIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktM1wiLCBjaGlsZHJlbjogcmVwb3J0RGF0YS50b3BFcnJvcnMubWFwKChlcnJvciwgaW5kZXgpID0+IChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTQgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwIGZsZXgtMVwiLCBjaGlsZHJlbjogZXJyb3IuZXJyb3JNZXNzYWdlIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwIG1sLTJcIiwgY2hpbGRyZW46IFtlcnJvci5jb3VudCwgXCJcXHUwMEQ3XCJdIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgdGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbZXJyb3IuYWZmZWN0ZWRVc2VycywgXCIgdXNlcnMgYWZmZWN0ZWRcIl0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiXFx1MjAyMlwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjaGlsZHJlbjogW1wiTGFzdDogXCIsIGVycm9yLmxhc3RPY2N1cnJlbmNlXSB9KV0gfSldIH0sIGluZGV4KSkpIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS0xMDAgbWItNFwiLCBjaGlsZHJlbjogXCJFeHBvcnQgUmVwb3J0XCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTIgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTNcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMFwiLCBjaGlsZHJlbjogXCJSZXBvcnQgSW5jbHVkZXM6XCIgfSksIF9qc3hzKFwidWxcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yIHRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImxpXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTUwMFwiIH0pLCBcIkV4ZWN1dGl2ZSBzdW1tYXJ5IHdpdGgga2V5IG1ldHJpY3NcIl0gfSksIF9qc3hzKFwibGlcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiRGV0YWlsZWQgd2F2ZS1ieS13YXZlIGFuYWx5c2lzXCJdIH0pLCBfanN4cyhcImxpXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LWdyZWVuLTUwMFwiIH0pLCBcIkNvbXBsZXRlIGVycm9yIGxvZyB3aXRoIHJlY29tbWVuZGF0aW9uc1wiXSB9KSwgX2pzeHMoXCJsaVwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1ncmVlbi01MDBcIiB9KSwgXCJTdWNjZXNzIHJhdGUgYnJlYWtkb3duIGJ5IHJlc291cmNlIHR5cGVcIl0gfSksIF9qc3hzKFwibGlcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtZ3JlZW4tNTAwXCIgfSksIFwiVmlzdWFsIGNoYXJ0cyBhbmQgdGltZWxpbmUgZ3JhcGhzXCJdIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wganVzdGlmeS1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVFeHBvcnRQREYsIHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBzaXplOiBcImxnXCIsIGljb246IF9qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTVcIiB9KSwgZGlzYWJsZWQ6IGlzRXhwb3J0aW5nLCBcImRhdGEtY3lcIjogXCJkb3dubG9hZC1wZGYtcmVwb3J0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJkb3dubG9hZC1wZGYtcmVwb3J0XCIsIGNoaWxkcmVuOiBpc0V4cG9ydGluZyA/ICdHZW5lcmF0aW5nLi4uJyA6ICdEb3dubG9hZCBQREYgUmVwb3J0JyB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0RXhjZWwsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwibGdcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy01IGgtNVwiIH0pLCBkaXNhYmxlZDogaXNFeHBvcnRpbmcsIFwiZGF0YS1jeVwiOiBcImRvd25sb2FkLWV4Y2VsLXJlcG9ydFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZG93bmxvYWQtZXhjZWwtcmVwb3J0XCIsIGNoaWxkcmVuOiBpc0V4cG9ydGluZyA/ICdFeHBvcnRpbmcuLi4nIDogJ0V4cG9ydCB0byBFeGNlbCcgfSldIH0pXSB9KV0gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgTWlncmF0aW9uUmVwb3J0VmlldztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==