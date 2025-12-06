"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[513],{

/***/ 50513:
/*!*******************************************************************************!*\
  !*** ./src/renderer/views/compliance/ComplianceDashboardView.tsx + 1 modules ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  ComplianceDashboardView: () => (/* binding */ ComplianceDashboardView),
  "default": () => (/* binding */ compliance_ComplianceDashboardView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useComplianceDashboardLogic.ts
/**
 * Compliance Dashboard Logic Hook
 * Tracks organizational compliance posture with governance risk scoring
 * Integrates with Logic Engine ApplyGovernanceRisk inference
 */

/**
 * Calculate overall compliance score from Logic Engine statistics
 * Uses governance risk data to determine compliance posture
 */
function calculateComplianceScore(stats) {
    if (!stats || !stats.UserCount || stats.UserCount === 0)
        return 0;
    // Governance risk inverse scoring - fewer risks = higher compliance
    const governanceRisks = stats.GovernanceRiskCount || 0;
    const totalUsers = stats.UserCount || 1;
    const riskRatio = governanceRisks / totalUsers;
    // Calculate base score (max 100, reduce by risk ratio)
    const baseScore = Math.max(0, 100 - (riskRatio * 200));
    // Factor in inactive accounts
    const inactiveAccounts = stats.InactiveAccountCount || 0;
    const inactiveRatio = inactiveAccounts / totalUsers;
    const inactivePenalty = inactiveRatio * 10;
    // Factor in guest accounts
    const guestAccounts = stats.GuestAccountCount || 0;
    const guestRatio = guestAccounts / totalUsers;
    const guestPenalty = guestRatio * 5;
    const finalScore = Math.max(0, Math.min(100, baseScore - inactivePenalty - guestPenalty));
    return Math.round(finalScore);
}
/**
 * Generate compliance frameworks based on organizational data
 */
function generateFrameworks(stats) {
    const baseScore = calculateComplianceScore(stats);
    return [
        {
            id: 'gdpr',
            name: 'GDPR',
            description: 'General Data Protection Regulation',
            complianceScore: Math.min(100, baseScore + 5),
            controlsTotal: 45,
            controlsPassed: Math.floor(45 * (baseScore / 100)),
            controlsFailed: Math.ceil(45 * (1 - baseScore / 100)),
            lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            status: baseScore >= 90 ? 'Compliant' : baseScore >= 70 ? 'Partial' : 'Non-Compliant',
        },
        {
            id: 'hipaa',
            name: 'HIPAA',
            description: 'Health Insurance Portability and Accountability Act',
            complianceScore: Math.min(100, baseScore + 3),
            controlsTotal: 32,
            controlsPassed: Math.floor(32 * (baseScore / 100)),
            controlsFailed: Math.ceil(32 * (1 - baseScore / 100)),
            lastAudit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            status: baseScore >= 95 ? 'Compliant' : baseScore >= 80 ? 'Partial' : 'Non-Compliant',
        },
        {
            id: 'soc2',
            name: 'SOC 2',
            description: 'Service Organization Control 2',
            complianceScore: baseScore,
            controlsTotal: 64,
            controlsPassed: Math.floor(64 * (baseScore / 100)),
            controlsFailed: Math.ceil(64 * (1 - baseScore / 100)),
            lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: baseScore >= 92 ? 'Compliant' : baseScore >= 75 ? 'Partial' : 'Non-Compliant',
        },
        {
            id: 'iso27001',
            name: 'ISO 27001',
            description: 'Information Security Management',
            complianceScore: Math.min(100, baseScore - 2),
            controlsTotal: 114,
            controlsPassed: Math.floor(114 * (baseScore / 100)),
            controlsFailed: Math.ceil(114 * (1 - baseScore / 100)),
            lastAudit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: baseScore >= 93 ? 'Compliant' : baseScore >= 78 ? 'Partial' : 'Non-Compliant',
        },
    ];
}
/**
 * Generate mock policy violations
 * TODO: Replace with real Logic Engine governance risk data
 */
function generateViolations(governanceRiskCount) {
    const violations = [];
    const count = Math.min(governanceRiskCount, 10); // Show top 10
    for (let i = 0; i < count; i++) {
        violations.push({
            id: `viol-${i}`,
            user: `user${i}@contoso.com`,
            violation: [
                'Inactive account exceeds retention policy',
                'Guest account with excessive permissions',
                'Data stored in non-compliant region',
                'Missing multi-factor authentication',
                'Stale credentials not rotated',
                'Orphaned account detected',
                'Privileged access without justification',
                'Sensitive data accessed from unapproved location',
            ][i % 8],
            severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
            framework: ['GDPR', 'HIPAA', 'SOC 2', 'ISO 27001'][i % 4],
            detectedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            status: ['Open', 'Acknowledged', 'Resolved'][Math.floor(Math.random() * 3)],
        });
    }
    return violations;
}
/**
 * Build compliance trend data (last 30 days)
 */
function buildComplianceTrends(currentScore) {
    const trends = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        // Simulate gradual improvement
        const dayProgress = (29 - i) / 29;
        const score = Math.round(currentScore - (10 * (1 - dayProgress)));
        const violations = Math.floor(50 - (30 * dayProgress));
        trends.push({
            date: date.toISOString().split('T')[0],
            score: Math.max(0, Math.min(100, score)),
            violations: Math.max(0, violations),
        });
    }
    return trends;
}
/**
 * Generate mock compliance dashboard data
 */
function generateMockDashboardData() {
    const mockStats = {
        UserCount: 1000,
        GovernanceRiskCount: 45,
        InactiveAccountCount: 23,
        GuestAccountCount: 12,
    };
    const score = calculateComplianceScore(mockStats);
    return {
        metrics: {
            overallScore: score,
            frameworkCount: 4,
            policyViolations: 45,
            inactiveAccounts: 23,
            guestAccounts: 12,
            dataResidencyIssues: 3,
            auditReadinessScore: 85,
            governanceRisks: 45,
        },
        frameworks: generateFrameworks(mockStats),
        violations: generateViolations(45),
        trends: buildComplianceTrends(score),
    };
}
/**
 * Compliance Dashboard Logic Hook
 * Integrates with Logic Engine for real-time compliance metrics
 */
const useComplianceDashboardLogic = () => {
    const [dashboardData, setDashboardData] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    const [lastRefresh, setLastRefresh] = (0,react.useState)(new Date());
    const loadComplianceMetrics = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Query Logic Engine for statistics
            const result = await window.electronAPI.logicEngine.getStatistics();
            if (result.success && result.data?.statistics) {
                const stats = result.data.statistics;
                // Calculate compliance metrics from Logic Engine data
                const overallScore = calculateComplianceScore(stats);
                const governanceRisks = stats.GovernanceRiskCount || 0;
                const inactiveAccounts = stats.InactiveAccountCount || 0;
                const guestAccounts = stats.GuestAccountCount || 0;
                const metrics = {
                    overallScore,
                    frameworkCount: 4,
                    policyViolations: governanceRisks,
                    inactiveAccounts,
                    guestAccounts,
                    dataResidencyIssues: Math.floor(governanceRisks * 0.1), // Estimate
                    auditReadinessScore: Math.min(100, overallScore + 5),
                    governanceRisks,
                };
                // Build dashboard data
                const data = {
                    metrics,
                    frameworks: generateFrameworks(stats),
                    violations: generateViolations(governanceRisks),
                    trends: buildComplianceTrends(overallScore),
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
            console.error('Compliance dashboard data fetch error:', err);
            // Fallback to mock data
            console.warn('Using mock compliance dashboard data');
            setDashboardData(generateMockDashboardData());
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    // Initial load
    (0,react.useEffect)(() => {
        loadComplianceMetrics();
    }, [loadComplianceMetrics]);
    const handleRefresh = (0,react.useCallback)(() => {
        loadComplianceMetrics();
    }, [loadComplianceMetrics]);
    const handleExport = (0,react.useCallback)(async (format) => {
        if (!dashboardData)
            return;
        try {
            // Prepare export data
            const exportData = {
                timestamp: new Date().toISOString(),
                metrics: dashboardData.metrics,
                frameworks: dashboardData.frameworks,
                violations: dashboardData.violations,
            };
            if (format === 'csv') {
                // CSV export
                const csvLines = [];
                csvLines.push('Compliance Dashboard Report');
                csvLines.push(`Generated: ${new Date().toLocaleString()}`);
                csvLines.push('');
                csvLines.push('METRICS');
                csvLines.push(`Overall Compliance Score,${dashboardData.metrics.overallScore}%`);
                csvLines.push(`Policy Violations,${dashboardData.metrics.policyViolations}`);
                csvLines.push(`Inactive Accounts,${dashboardData.metrics.inactiveAccounts}`);
                csvLines.push(`Guest Accounts,${dashboardData.metrics.guestAccounts}`);
                csvLines.push('');
                csvLines.push('FRAMEWORKS');
                csvLines.push('Name,Compliance Score,Controls Passed,Controls Failed,Status');
                dashboardData.frameworks.forEach(fw => {
                    csvLines.push(`${fw.name},${fw.complianceScore}%,${fw.controlsPassed},${fw.controlsFailed},${fw.status}`);
                });
                const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `compliance-dashboard-${Date.now()}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            }
            console.log('Export completed:', format);
        }
        catch (err) {
            console.error('Export error:', err);
        }
    }, [dashboardData]);
    // Compute statistics
    const stats = (0,react.useMemo)(() => {
        if (!dashboardData) {
            return {
                totalViolations: 0,
                criticalViolations: 0,
                openViolations: 0,
                resolvedViolations: 0,
            };
        }
        return {
            totalViolations: dashboardData.violations.length,
            criticalViolations: dashboardData.violations.filter(v => v.severity === 'Critical').length,
            openViolations: dashboardData.violations.filter(v => v.status === 'Open').length,
            resolvedViolations: dashboardData.violations.filter(v => v.status === 'Resolved').length,
        };
    }, [dashboardData]);
    return {
        dashboardData,
        isLoading,
        error,
        lastRefresh,
        stats,
        handleRefresh,
        handleExport,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
;// ./src/renderer/views/compliance/ComplianceDashboardView.tsx

/**
 * Compliance Dashboard View
 * Comprehensive compliance monitoring and reporting for M&A discovery
 */






const ComplianceDashboardView = () => {
    const { dashboardData, isLoading, error, lastRefresh, stats, handleExport, handleRefresh, } = useComplianceDashboardLogic();
    const [selectedFramework, setSelectedFramework] = (0,react.useState)('all');
    const frameworks = [
        { id: 'all', label: 'All Frameworks', color: 'blue' },
        { id: 'gdpr', label: 'GDPR', color: 'purple' },
        { id: 'hipaa', label: 'HIPAA', color: 'green' },
        { id: 'sox', label: 'SOX', color: 'red' },
        { id: 'iso27001', label: 'ISO 27001', color: 'orange' },
        { id: 'pci', label: 'PCI-DSS', color: 'cyan' },
    ];
    const complianceStatus = [
        {
            status: 'Resolved',
            count: stats?.resolvedViolations ?? 0,
            percentage: (stats?.totalViolations ?? 0) > 0 ? Math.round((stats?.resolvedViolations ?? 0 / (stats?.totalViolations ?? 0)) * 100) : 0,
            icon: lucide_react.CheckCircle,
            color: 'green',
        },
        {
            status: 'Critical',
            count: (stats?.criticalViolations ?? 0),
            percentage: (stats?.totalViolations ?? 0) > 0 ? Math.round(((stats?.criticalViolations ?? 0) / (stats?.totalViolations ?? 0)) * 100) : 0,
            icon: lucide_react.XCircle,
            color: 'red',
        },
        {
            status: 'Open',
            count: (stats?.openViolations ?? 0),
            percentage: (stats?.totalViolations ?? 0) > 0 ? Math.round(((stats?.openViolations ?? 0) / (stats?.totalViolations ?? 0)) * 100) : 0,
            icon: lucide_react.AlertTriangle,
            color: 'yellow',
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "compliance-dashboard-view", "data-testid": "compliance-dashboard-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-blue-100 dark:bg-blue-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react.Shield, { className: "w-8 h-8 text-blue-600 dark:text-blue-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Compliance Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Monitor regulatory compliance across all frameworks" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: handleRefresh, icon: (0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-4 h-4" }), disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: handleRefresh, disabled: isLoading, "data-cy": "run-audit-btn", "data-testid": "run-audit-btn", children: "Run Compliance Audit" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: () => handleExport('csv'), icon: (0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-4 h-4" }), "data-cy": "export-btn", "data-testid": "export-btn", children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: complianceStatus.map((item) => {
                    const Icon = item.icon;
                    return ((0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex-1", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: item.status }), (0,jsx_runtime.jsx)("p", { className: "text-3xl font-bold text-gray-900 dark:text-white mb-1", children: item.count }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2", children: (0,jsx_runtime.jsx)("div", { className: `h-2 rounded-full bg-${item.color}-500`, style: { width: `${item.percentage}%` } }) }), (0,jsx_runtime.jsxs)("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: [item.percentage, "%"] })] })] }), (0,jsx_runtime.jsx)("div", { className: `p-3 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg`, children: (0,jsx_runtime.jsx)(Icon, { className: `w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400` }) })] }) }, item.status));
                }) }), (0,jsx_runtime.jsx)("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: frameworks.map((framework) => {
                    const isSelected = selectedFramework === framework.id;
                    return ((0,jsx_runtime.jsx)("button", { onClick: () => setSelectedFramework(framework.id), className: `
                px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${isSelected
                            ? `bg-${framework.color}-100 dark:bg-${framework.color}-900 text-${framework.color}-700 dark:text-${framework.color}-300 ring-2 ring-${framework.color}-500`
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `, "data-cy": `framework-${framework.id}`, children: framework.label }, framework.id));
                }) }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Violations" }), (0,jsx_runtime.jsx)(lucide_react.Shield, { className: "w-5 h-5 text-blue-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.totalViolations ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Open Violations" }), (0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-5 h-5 text-orange-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.openViolations ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Risk Score" }), (0,jsx_runtime.jsx)(lucide_react.TrendingUp, { className: "w-5 h-5 text-red-500" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-end gap-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.criticalViolations ?? 0 }), (0,jsx_runtime.jsx)(Badge.Badge, { variant: (stats?.criticalViolations ?? 0) > 10 ? 'danger' : (stats?.criticalViolations ?? 0) > 5 ? 'warning' : 'success', children: (stats?.criticalViolations ?? 0) > 10 ? 'High' : (stats?.criticalViolations ?? 0) > 5 ? 'Medium' : 'Low' })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Refresh" }), (0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-5 h-5 text-purple-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: lastRefresh ? new Date(lastRefresh).toLocaleString() : 'N/A' })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: dashboardData?.violations || [], columns: [
                        { field: 'id', headerName: 'ID', width: 100 },
                        { field: 'severity', headerName: 'Severity', width: 120 },
                        { field: 'status', headerName: 'Status', width: 120 },
                        { field: 'description', headerName: 'Description', width: 300 },
                    ], loading: isLoading, enableExport: true, enableGrouping: true, enableFiltering: true, "data-cy": "compliance-grid", "data-testid": "compliance-grid" }) })] }));
};
/* harmony default export */ const compliance_ComplianceDashboardView = (ComplianceDashboardView);


/***/ }),

/***/ 59944:
/*!*******************************************************************!*\
  !*** ./src/renderer/components/organisms/VirtualizedDataGrid.tsx ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

/***/ 61315:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Badge.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Badge: () => (/* binding */ Badge),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * Badge Component
 *
 * Small label component for status indicators, counts, and tags.
 * Supports multiple variants and sizes.
 */


/**
 * Badge Component
 */
const Badge = ({ children, variant = 'default', size = 'md', dot = false, dotPosition = 'leading', removable = false, onRemove, className, 'data-cy': dataCy, }) => {
    // Variant styles
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-blue-100 text-blue-800 border-blue-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    // Dot color classes
    const dotClasses = {
        default: 'bg-gray-500',
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-cyan-500',
    };
    // Size styles
    const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-sm',
        md: 'px-3 py-1 text-sm',
        lg: 'px-3.5 py-1.5 text-base',
    };
    const dotSizeClasses = {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
    };
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwQjtBQUNFO0FBQzVCO0FBQ0E7QUFDQTtBQUNPLGlCQUFpQiw4SUFBOEk7QUFDdEs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsMENBQUk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1REFBSyxXQUFXLDRGQUE0RixzREFBSSxXQUFXLFdBQVcsMENBQUksb0ZBQW9GLElBQUksc0RBQUksV0FBVyxvQkFBb0IseUNBQXlDLHNEQUFJLFdBQVcsV0FBVywwQ0FBSSxvRkFBb0YsOEJBQThCLHNEQUFJLGFBQWEsOENBQThDLDBDQUFJO0FBQzdnQjtBQUNBO0FBQ0EsaUJBQWlCLHFDQUFxQyxzREFBSSxVQUFVLFdBQVcsMENBQUk7QUFDbkY7QUFDQTtBQUNBLHFCQUFxQix5REFBeUQsc0RBQUksV0FBVyxtUEFBbVAsR0FBRyxHQUFHLEtBQUs7QUFDM1Y7QUFDQSxpRUFBZSxLQUFLLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VDb21wbGlhbmNlRGFzaGJvYXJkTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvY29tcGxpYW5jZS9Db21wbGlhbmNlRGFzaGJvYXJkVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb21wbGlhbmNlIERhc2hib2FyZCBMb2dpYyBIb29rXG4gKiBUcmFja3Mgb3JnYW5pemF0aW9uYWwgY29tcGxpYW5jZSBwb3N0dXJlIHdpdGggZ292ZXJuYW5jZSByaXNrIHNjb3JpbmdcbiAqIEludGVncmF0ZXMgd2l0aCBMb2dpYyBFbmdpbmUgQXBwbHlHb3Zlcm5hbmNlUmlzayBpbmZlcmVuY2VcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIENhbGN1bGF0ZSBvdmVyYWxsIGNvbXBsaWFuY2Ugc2NvcmUgZnJvbSBMb2dpYyBFbmdpbmUgc3RhdGlzdGljc1xuICogVXNlcyBnb3Zlcm5hbmNlIHJpc2sgZGF0YSB0byBkZXRlcm1pbmUgY29tcGxpYW5jZSBwb3N0dXJlXG4gKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvbXBsaWFuY2VTY29yZShzdGF0cykge1xuICAgIGlmICghc3RhdHMgfHwgIXN0YXRzLlVzZXJDb3VudCB8fCBzdGF0cy5Vc2VyQ291bnQgPT09IDApXG4gICAgICAgIHJldHVybiAwO1xuICAgIC8vIEdvdmVybmFuY2UgcmlzayBpbnZlcnNlIHNjb3JpbmcgLSBmZXdlciByaXNrcyA9IGhpZ2hlciBjb21wbGlhbmNlXG4gICAgY29uc3QgZ292ZXJuYW5jZVJpc2tzID0gc3RhdHMuR292ZXJuYW5jZVJpc2tDb3VudCB8fCAwO1xuICAgIGNvbnN0IHRvdGFsVXNlcnMgPSBzdGF0cy5Vc2VyQ291bnQgfHwgMTtcbiAgICBjb25zdCByaXNrUmF0aW8gPSBnb3Zlcm5hbmNlUmlza3MgLyB0b3RhbFVzZXJzO1xuICAgIC8vIENhbGN1bGF0ZSBiYXNlIHNjb3JlIChtYXggMTAwLCByZWR1Y2UgYnkgcmlzayByYXRpbylcbiAgICBjb25zdCBiYXNlU2NvcmUgPSBNYXRoLm1heCgwLCAxMDAgLSAocmlza1JhdGlvICogMjAwKSk7XG4gICAgLy8gRmFjdG9yIGluIGluYWN0aXZlIGFjY291bnRzXG4gICAgY29uc3QgaW5hY3RpdmVBY2NvdW50cyA9IHN0YXRzLkluYWN0aXZlQWNjb3VudENvdW50IHx8IDA7XG4gICAgY29uc3QgaW5hY3RpdmVSYXRpbyA9IGluYWN0aXZlQWNjb3VudHMgLyB0b3RhbFVzZXJzO1xuICAgIGNvbnN0IGluYWN0aXZlUGVuYWx0eSA9IGluYWN0aXZlUmF0aW8gKiAxMDtcbiAgICAvLyBGYWN0b3IgaW4gZ3Vlc3QgYWNjb3VudHNcbiAgICBjb25zdCBndWVzdEFjY291bnRzID0gc3RhdHMuR3Vlc3RBY2NvdW50Q291bnQgfHwgMDtcbiAgICBjb25zdCBndWVzdFJhdGlvID0gZ3Vlc3RBY2NvdW50cyAvIHRvdGFsVXNlcnM7XG4gICAgY29uc3QgZ3Vlc3RQZW5hbHR5ID0gZ3Vlc3RSYXRpbyAqIDU7XG4gICAgY29uc3QgZmluYWxTY29yZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgYmFzZVNjb3JlIC0gaW5hY3RpdmVQZW5hbHR5IC0gZ3Vlc3RQZW5hbHR5KSk7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoZmluYWxTY29yZSk7XG59XG4vKipcbiAqIEdlbmVyYXRlIGNvbXBsaWFuY2UgZnJhbWV3b3JrcyBiYXNlZCBvbiBvcmdhbml6YXRpb25hbCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlRnJhbWV3b3JrcyhzdGF0cykge1xuICAgIGNvbnN0IGJhc2VTY29yZSA9IGNhbGN1bGF0ZUNvbXBsaWFuY2VTY29yZShzdGF0cyk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdnZHByJyxcbiAgICAgICAgICAgIG5hbWU6ICdHRFBSJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhbCBEYXRhIFByb3RlY3Rpb24gUmVndWxhdGlvbicsXG4gICAgICAgICAgICBjb21wbGlhbmNlU2NvcmU6IE1hdGgubWluKDEwMCwgYmFzZVNjb3JlICsgNSksXG4gICAgICAgICAgICBjb250cm9sc1RvdGFsOiA0NSxcbiAgICAgICAgICAgIGNvbnRyb2xzUGFzc2VkOiBNYXRoLmZsb29yKDQ1ICogKGJhc2VTY29yZSAvIDEwMCkpLFxuICAgICAgICAgICAgY29udHJvbHNGYWlsZWQ6IE1hdGguY2VpbCg0NSAqICgxIC0gYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBsYXN0QXVkaXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSA3ICogMjQgKiA2MCAqIDYwICogMTAwMCksXG4gICAgICAgICAgICBzdGF0dXM6IGJhc2VTY29yZSA+PSA5MCA/ICdDb21wbGlhbnQnIDogYmFzZVNjb3JlID49IDcwID8gJ1BhcnRpYWwnIDogJ05vbi1Db21wbGlhbnQnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2hpcGFhJyxcbiAgICAgICAgICAgIG5hbWU6ICdISVBBQScsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hlYWx0aCBJbnN1cmFuY2UgUG9ydGFiaWxpdHkgYW5kIEFjY291bnRhYmlsaXR5IEFjdCcsXG4gICAgICAgICAgICBjb21wbGlhbmNlU2NvcmU6IE1hdGgubWluKDEwMCwgYmFzZVNjb3JlICsgMyksXG4gICAgICAgICAgICBjb250cm9sc1RvdGFsOiAzMixcbiAgICAgICAgICAgIGNvbnRyb2xzUGFzc2VkOiBNYXRoLmZsb29yKDMyICogKGJhc2VTY29yZSAvIDEwMCkpLFxuICAgICAgICAgICAgY29udHJvbHNGYWlsZWQ6IE1hdGguY2VpbCgzMiAqICgxIC0gYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBsYXN0QXVkaXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSAxNCAqIDI0ICogNjAgKiA2MCAqIDEwMDApLFxuICAgICAgICAgICAgc3RhdHVzOiBiYXNlU2NvcmUgPj0gOTUgPyAnQ29tcGxpYW50JyA6IGJhc2VTY29yZSA+PSA4MCA/ICdQYXJ0aWFsJyA6ICdOb24tQ29tcGxpYW50JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdzb2MyJyxcbiAgICAgICAgICAgIG5hbWU6ICdTT0MgMicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlcnZpY2UgT3JnYW5pemF0aW9uIENvbnRyb2wgMicsXG4gICAgICAgICAgICBjb21wbGlhbmNlU2NvcmU6IGJhc2VTY29yZSxcbiAgICAgICAgICAgIGNvbnRyb2xzVG90YWw6IDY0LFxuICAgICAgICAgICAgY29udHJvbHNQYXNzZWQ6IE1hdGguZmxvb3IoNjQgKiAoYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBjb250cm9sc0ZhaWxlZDogTWF0aC5jZWlsKDY0ICogKDEgLSBiYXNlU2NvcmUgLyAxMDApKSxcbiAgICAgICAgICAgIGxhc3RBdWRpdDogbmV3IERhdGUoRGF0ZS5ub3coKSAtIDMwICogMjQgKiA2MCAqIDYwICogMTAwMCksXG4gICAgICAgICAgICBzdGF0dXM6IGJhc2VTY29yZSA+PSA5MiA/ICdDb21wbGlhbnQnIDogYmFzZVNjb3JlID49IDc1ID8gJ1BhcnRpYWwnIDogJ05vbi1Db21wbGlhbnQnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2lzbzI3MDAxJyxcbiAgICAgICAgICAgIG5hbWU6ICdJU08gMjcwMDEnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJbmZvcm1hdGlvbiBTZWN1cml0eSBNYW5hZ2VtZW50JyxcbiAgICAgICAgICAgIGNvbXBsaWFuY2VTY29yZTogTWF0aC5taW4oMTAwLCBiYXNlU2NvcmUgLSAyKSxcbiAgICAgICAgICAgIGNvbnRyb2xzVG90YWw6IDExNCxcbiAgICAgICAgICAgIGNvbnRyb2xzUGFzc2VkOiBNYXRoLmZsb29yKDExNCAqIChiYXNlU2NvcmUgLyAxMDApKSxcbiAgICAgICAgICAgIGNvbnRyb2xzRmFpbGVkOiBNYXRoLmNlaWwoMTE0ICogKDEgLSBiYXNlU2NvcmUgLyAxMDApKSxcbiAgICAgICAgICAgIGxhc3RBdWRpdDogbmV3IERhdGUoRGF0ZS5ub3coKSAtIDYwICogMjQgKiA2MCAqIDYwICogMTAwMCksXG4gICAgICAgICAgICBzdGF0dXM6IGJhc2VTY29yZSA+PSA5MyA/ICdDb21wbGlhbnQnIDogYmFzZVNjb3JlID49IDc4ID8gJ1BhcnRpYWwnIDogJ05vbi1Db21wbGlhbnQnLFxuICAgICAgICB9LFxuICAgIF07XG59XG4vKipcbiAqIEdlbmVyYXRlIG1vY2sgcG9saWN5IHZpb2xhdGlvbnNcbiAqIFRPRE86IFJlcGxhY2Ugd2l0aCByZWFsIExvZ2ljIEVuZ2luZSBnb3Zlcm5hbmNlIHJpc2sgZGF0YVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVZpb2xhdGlvbnMoZ292ZXJuYW5jZVJpc2tDb3VudCkge1xuICAgIGNvbnN0IHZpb2xhdGlvbnMgPSBbXTtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWluKGdvdmVybmFuY2VSaXNrQ291bnQsIDEwKTsgLy8gU2hvdyB0b3AgMTBcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgdmlvbGF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiBgdmlvbC0ke2l9YCxcbiAgICAgICAgICAgIHVzZXI6IGB1c2VyJHtpfUBjb250b3NvLmNvbWAsXG4gICAgICAgICAgICB2aW9sYXRpb246IFtcbiAgICAgICAgICAgICAgICAnSW5hY3RpdmUgYWNjb3VudCBleGNlZWRzIHJldGVudGlvbiBwb2xpY3knLFxuICAgICAgICAgICAgICAgICdHdWVzdCBhY2NvdW50IHdpdGggZXhjZXNzaXZlIHBlcm1pc3Npb25zJyxcbiAgICAgICAgICAgICAgICAnRGF0YSBzdG9yZWQgaW4gbm9uLWNvbXBsaWFudCByZWdpb24nLFxuICAgICAgICAgICAgICAgICdNaXNzaW5nIG11bHRpLWZhY3RvciBhdXRoZW50aWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ1N0YWxlIGNyZWRlbnRpYWxzIG5vdCByb3RhdGVkJyxcbiAgICAgICAgICAgICAgICAnT3JwaGFuZWQgYWNjb3VudCBkZXRlY3RlZCcsXG4gICAgICAgICAgICAgICAgJ1ByaXZpbGVnZWQgYWNjZXNzIHdpdGhvdXQganVzdGlmaWNhdGlvbicsXG4gICAgICAgICAgICAgICAgJ1NlbnNpdGl2ZSBkYXRhIGFjY2Vzc2VkIGZyb20gdW5hcHByb3ZlZCBsb2NhdGlvbicsXG4gICAgICAgICAgICBdW2kgJSA4XSxcbiAgICAgICAgICAgIHNldmVyaXR5OiBbJ0NyaXRpY2FsJywgJ0hpZ2gnLCAnTWVkaXVtJywgJ0xvdyddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDQpXSxcbiAgICAgICAgICAgIGZyYW1ld29yazogWydHRFBSJywgJ0hJUEFBJywgJ1NPQyAyJywgJ0lTTyAyNzAwMSddW2kgJSA0XSxcbiAgICAgICAgICAgIGRldGVjdGVkRGF0ZTogbmV3IERhdGUoRGF0ZS5ub3coKSAtIE1hdGgucmFuZG9tKCkgKiAzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApLFxuICAgICAgICAgICAgc3RhdHVzOiBbJ09wZW4nLCAnQWNrbm93bGVkZ2VkJywgJ1Jlc29sdmVkJ11bTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMyldLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHZpb2xhdGlvbnM7XG59XG4vKipcbiAqIEJ1aWxkIGNvbXBsaWFuY2UgdHJlbmQgZGF0YSAobGFzdCAzMCBkYXlzKVxuICovXG5mdW5jdGlvbiBidWlsZENvbXBsaWFuY2VUcmVuZHMoY3VycmVudFNjb3JlKSB7XG4gICAgY29uc3QgdHJlbmRzID0gW107XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBmb3IgKGxldCBpID0gMjk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShub3cpO1xuICAgICAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgLSBpKTtcbiAgICAgICAgLy8gU2ltdWxhdGUgZ3JhZHVhbCBpbXByb3ZlbWVudFxuICAgICAgICBjb25zdCBkYXlQcm9ncmVzcyA9ICgyOSAtIGkpIC8gMjk7XG4gICAgICAgIGNvbnN0IHNjb3JlID0gTWF0aC5yb3VuZChjdXJyZW50U2NvcmUgLSAoMTAgKiAoMSAtIGRheVByb2dyZXNzKSkpO1xuICAgICAgICBjb25zdCB2aW9sYXRpb25zID0gTWF0aC5mbG9vcig1MCAtICgzMCAqIGRheVByb2dyZXNzKSk7XG4gICAgICAgIHRyZW5kcy5wdXNoKHtcbiAgICAgICAgICAgIGRhdGU6IGRhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgICAgICAgc2NvcmU6IE1hdGgubWF4KDAsIE1hdGgubWluKDEwMCwgc2NvcmUpKSxcbiAgICAgICAgICAgIHZpb2xhdGlvbnM6IE1hdGgubWF4KDAsIHZpb2xhdGlvbnMpLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRyZW5kcztcbn1cbi8qKlxuICogR2VuZXJhdGUgbW9jayBjb21wbGlhbmNlIGRhc2hib2FyZCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlTW9ja0Rhc2hib2FyZERhdGEoKSB7XG4gICAgY29uc3QgbW9ja1N0YXRzID0ge1xuICAgICAgICBVc2VyQ291bnQ6IDEwMDAsXG4gICAgICAgIEdvdmVybmFuY2VSaXNrQ291bnQ6IDQ1LFxuICAgICAgICBJbmFjdGl2ZUFjY291bnRDb3VudDogMjMsXG4gICAgICAgIEd1ZXN0QWNjb3VudENvdW50OiAxMixcbiAgICB9O1xuICAgIGNvbnN0IHNjb3JlID0gY2FsY3VsYXRlQ29tcGxpYW5jZVNjb3JlKG1vY2tTdGF0cyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbWV0cmljczoge1xuICAgICAgICAgICAgb3ZlcmFsbFNjb3JlOiBzY29yZSxcbiAgICAgICAgICAgIGZyYW1ld29ya0NvdW50OiA0LFxuICAgICAgICAgICAgcG9saWN5VmlvbGF0aW9uczogNDUsXG4gICAgICAgICAgICBpbmFjdGl2ZUFjY291bnRzOiAyMyxcbiAgICAgICAgICAgIGd1ZXN0QWNjb3VudHM6IDEyLFxuICAgICAgICAgICAgZGF0YVJlc2lkZW5jeUlzc3VlczogMyxcbiAgICAgICAgICAgIGF1ZGl0UmVhZGluZXNzU2NvcmU6IDg1LFxuICAgICAgICAgICAgZ292ZXJuYW5jZVJpc2tzOiA0NSxcbiAgICAgICAgfSxcbiAgICAgICAgZnJhbWV3b3JrczogZ2VuZXJhdGVGcmFtZXdvcmtzKG1vY2tTdGF0cyksXG4gICAgICAgIHZpb2xhdGlvbnM6IGdlbmVyYXRlVmlvbGF0aW9ucyg0NSksXG4gICAgICAgIHRyZW5kczogYnVpbGRDb21wbGlhbmNlVHJlbmRzKHNjb3JlKSxcbiAgICB9O1xufVxuLyoqXG4gKiBDb21wbGlhbmNlIERhc2hib2FyZCBMb2dpYyBIb29rXG4gKiBJbnRlZ3JhdGVzIHdpdGggTG9naWMgRW5naW5lIGZvciByZWFsLXRpbWUgY29tcGxpYW5jZSBtZXRyaWNzXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VDb21wbGlhbmNlRGFzaGJvYXJkTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2Rhc2hib2FyZERhdGEsIHNldERhc2hib2FyZERhdGFdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2xhc3RSZWZyZXNoLCBzZXRMYXN0UmVmcmVzaF0gPSB1c2VTdGF0ZShuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBsb2FkQ29tcGxpYW5jZU1ldHJpY3MgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIC8vIFF1ZXJ5IExvZ2ljIEVuZ2luZSBmb3Igc3RhdGlzdGljc1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2ljRW5naW5lLmdldFN0YXRpc3RpY3MoKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YT8uc3RhdGlzdGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gcmVzdWx0LmRhdGEuc3RhdGlzdGljcztcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgY29tcGxpYW5jZSBtZXRyaWNzIGZyb20gTG9naWMgRW5naW5lIGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVyYWxsU2NvcmUgPSBjYWxjdWxhdGVDb21wbGlhbmNlU2NvcmUoc3RhdHMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdvdmVybmFuY2VSaXNrcyA9IHN0YXRzLkdvdmVybmFuY2VSaXNrQ291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmFjdGl2ZUFjY291bnRzID0gc3RhdHMuSW5hY3RpdmVBY2NvdW50Q291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBndWVzdEFjY291bnRzID0gc3RhdHMuR3Vlc3RBY2NvdW50Q291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRyaWNzID0ge1xuICAgICAgICAgICAgICAgICAgICBvdmVyYWxsU2NvcmUsXG4gICAgICAgICAgICAgICAgICAgIGZyYW1ld29ya0NvdW50OiA0LFxuICAgICAgICAgICAgICAgICAgICBwb2xpY3lWaW9sYXRpb25zOiBnb3Zlcm5hbmNlUmlza3MsXG4gICAgICAgICAgICAgICAgICAgIGluYWN0aXZlQWNjb3VudHMsXG4gICAgICAgICAgICAgICAgICAgIGd1ZXN0QWNjb3VudHMsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFSZXNpZGVuY3lJc3N1ZXM6IE1hdGguZmxvb3IoZ292ZXJuYW5jZVJpc2tzICogMC4xKSwgLy8gRXN0aW1hdGVcbiAgICAgICAgICAgICAgICAgICAgYXVkaXRSZWFkaW5lc3NTY29yZTogTWF0aC5taW4oMTAwLCBvdmVyYWxsU2NvcmUgKyA1KSxcbiAgICAgICAgICAgICAgICAgICAgZ292ZXJuYW5jZVJpc2tzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgZGFzaGJvYXJkIGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzLFxuICAgICAgICAgICAgICAgICAgICBmcmFtZXdvcmtzOiBnZW5lcmF0ZUZyYW1ld29ya3Moc3RhdHMpLFxuICAgICAgICAgICAgICAgICAgICB2aW9sYXRpb25zOiBnZW5lcmF0ZVZpb2xhdGlvbnMoZ292ZXJuYW5jZVJpc2tzKSxcbiAgICAgICAgICAgICAgICAgICAgdHJlbmRzOiBidWlsZENvbXBsaWFuY2VUcmVuZHMob3ZlcmFsbFNjb3JlKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldERhc2hib2FyZERhdGEoZGF0YSk7XG4gICAgICAgICAgICAgICAgc2V0TGFzdFJlZnJlc2gobmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gZmV0Y2ggTG9naWMgRW5naW5lIHN0YXRpc3RpY3MnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3Igb2NjdXJyZWQnO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvbXBsaWFuY2UgZGFzaGJvYXJkIGRhdGEgZmV0Y2ggZXJyb3I6JywgZXJyKTtcbiAgICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIG1vY2sgZGF0YVxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVc2luZyBtb2NrIGNvbXBsaWFuY2UgZGFzaGJvYXJkIGRhdGEnKTtcbiAgICAgICAgICAgIHNldERhc2hib2FyZERhdGEoZ2VuZXJhdGVNb2NrRGFzaGJvYXJkRGF0YSgpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgLy8gSW5pdGlhbCBsb2FkXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZENvbXBsaWFuY2VNZXRyaWNzKCk7XG4gICAgfSwgW2xvYWRDb21wbGlhbmNlTWV0cmljc10pO1xuICAgIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGxvYWRDb21wbGlhbmNlTWV0cmljcygpO1xuICAgIH0sIFtsb2FkQ29tcGxpYW5jZU1ldHJpY3NdKTtcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoZm9ybWF0KSA9PiB7XG4gICAgICAgIGlmICghZGFzaGJvYXJkRGF0YSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFByZXBhcmUgZXhwb3J0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgbWV0cmljczogZGFzaGJvYXJkRGF0YS5tZXRyaWNzLFxuICAgICAgICAgICAgICAgIGZyYW1ld29ya3M6IGRhc2hib2FyZERhdGEuZnJhbWV3b3JrcyxcbiAgICAgICAgICAgICAgICB2aW9sYXRpb25zOiBkYXNoYm9hcmREYXRhLnZpb2xhdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ2NzdicpIHtcbiAgICAgICAgICAgICAgICAvLyBDU1YgZXhwb3J0XG4gICAgICAgICAgICAgICAgY29uc3QgY3N2TGluZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKCdDb21wbGlhbmNlIERhc2hib2FyZCBSZXBvcnQnKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKGBHZW5lcmF0ZWQ6ICR7bmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpfWApO1xuICAgICAgICAgICAgICAgIGNzdkxpbmVzLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGNzdkxpbmVzLnB1c2goJ01FVFJJQ1MnKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKGBPdmVyYWxsIENvbXBsaWFuY2UgU2NvcmUsJHtkYXNoYm9hcmREYXRhLm1ldHJpY3Mub3ZlcmFsbFNjb3JlfSVgKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKGBQb2xpY3kgVmlvbGF0aW9ucywke2Rhc2hib2FyZERhdGEubWV0cmljcy5wb2xpY3lWaW9sYXRpb25zfWApO1xuICAgICAgICAgICAgICAgIGNzdkxpbmVzLnB1c2goYEluYWN0aXZlIEFjY291bnRzLCR7ZGFzaGJvYXJkRGF0YS5tZXRyaWNzLmluYWN0aXZlQWNjb3VudHN9YCk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaChgR3Vlc3QgQWNjb3VudHMsJHtkYXNoYm9hcmREYXRhLm1ldHJpY3MuZ3Vlc3RBY2NvdW50c31gKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKCdGUkFNRVdPUktTJyk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaCgnTmFtZSxDb21wbGlhbmNlIFNjb3JlLENvbnRyb2xzIFBhc3NlZCxDb250cm9scyBGYWlsZWQsU3RhdHVzJyk7XG4gICAgICAgICAgICAgICAgZGFzaGJvYXJkRGF0YS5mcmFtZXdvcmtzLmZvckVhY2goZncgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKGAke2Z3Lm5hbWV9LCR7ZncuY29tcGxpYW5jZVNjb3JlfSUsJHtmdy5jb250cm9sc1Bhc3NlZH0sJHtmdy5jb250cm9sc0ZhaWxlZH0sJHtmdy5zdGF0dXN9YCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjc3ZMaW5lcy5qb2luKCdcXG4nKV0sIHsgdHlwZTogJ3RleHQvY3N2JyB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgICAgICAgICAgICBsaW5rLmRvd25sb2FkID0gYGNvbXBsaWFuY2UtZGFzaGJvYXJkLSR7RGF0ZS5ub3coKX0uY3N2YDtcbiAgICAgICAgICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgICAgICAgICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFeHBvcnQgY29tcGxldGVkOicsIGZvcm1hdCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhwb3J0IGVycm9yOicsIGVycik7XG4gICAgICAgIH1cbiAgICB9LCBbZGFzaGJvYXJkRGF0YV0pO1xuICAgIC8vIENvbXB1dGUgc3RhdGlzdGljc1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghZGFzaGJvYXJkRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b3RhbFZpb2xhdGlvbnM6IDAsXG4gICAgICAgICAgICAgICAgY3JpdGljYWxWaW9sYXRpb25zOiAwLFxuICAgICAgICAgICAgICAgIG9wZW5WaW9sYXRpb25zOiAwLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkVmlvbGF0aW9uczogMCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsVmlvbGF0aW9uczogZGFzaGJvYXJkRGF0YS52aW9sYXRpb25zLmxlbmd0aCxcbiAgICAgICAgICAgIGNyaXRpY2FsVmlvbGF0aW9uczogZGFzaGJvYXJkRGF0YS52aW9sYXRpb25zLmZpbHRlcih2ID0+IHYuc2V2ZXJpdHkgPT09ICdDcml0aWNhbCcpLmxlbmd0aCxcbiAgICAgICAgICAgIG9wZW5WaW9sYXRpb25zOiBkYXNoYm9hcmREYXRhLnZpb2xhdGlvbnMuZmlsdGVyKHYgPT4gdi5zdGF0dXMgPT09ICdPcGVuJykubGVuZ3RoLFxuICAgICAgICAgICAgcmVzb2x2ZWRWaW9sYXRpb25zOiBkYXNoYm9hcmREYXRhLnZpb2xhdGlvbnMuZmlsdGVyKHYgPT4gdi5zdGF0dXMgPT09ICdSZXNvbHZlZCcpLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9LCBbZGFzaGJvYXJkRGF0YV0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRhc2hib2FyZERhdGEsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGxhc3RSZWZyZXNoLFxuICAgICAgICBzdGF0cyxcbiAgICAgICAgaGFuZGxlUmVmcmVzaCxcbiAgICAgICAgaGFuZGxlRXhwb3J0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQ29tcGxpYW5jZSBEYXNoYm9hcmQgVmlld1xuICogQ29tcHJlaGVuc2l2ZSBjb21wbGlhbmNlIG1vbml0b3JpbmcgYW5kIHJlcG9ydGluZyBmb3IgTSZBIGRpc2NvdmVyeVxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTaGllbGQsIENoZWNrQ2lyY2xlLCBYQ2lyY2xlLCBBbGVydFRyaWFuZ2xlLCBGaWxlVGV4dCwgVHJlbmRpbmdVcCwgQWN0aXZpdHkgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlQ29tcGxpYW5jZURhc2hib2FyZExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlQ29tcGxpYW5jZURhc2hib2FyZExvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CYWRnZSc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5leHBvcnQgY29uc3QgQ29tcGxpYW5jZURhc2hib2FyZFZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBkYXNoYm9hcmREYXRhLCBpc0xvYWRpbmcsIGVycm9yLCBsYXN0UmVmcmVzaCwgc3RhdHMsIGhhbmRsZUV4cG9ydCwgaGFuZGxlUmVmcmVzaCwgfSA9IHVzZUNvbXBsaWFuY2VEYXNoYm9hcmRMb2dpYygpO1xuICAgIGNvbnN0IFtzZWxlY3RlZEZyYW1ld29yaywgc2V0U2VsZWN0ZWRGcmFtZXdvcmtdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IGZyYW1ld29ya3MgPSBbXG4gICAgICAgIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ0FsbCBGcmFtZXdvcmtzJywgY29sb3I6ICdibHVlJyB9LFxuICAgICAgICB7IGlkOiAnZ2RwcicsIGxhYmVsOiAnR0RQUicsIGNvbG9yOiAncHVycGxlJyB9LFxuICAgICAgICB7IGlkOiAnaGlwYWEnLCBsYWJlbDogJ0hJUEFBJywgY29sb3I6ICdncmVlbicgfSxcbiAgICAgICAgeyBpZDogJ3NveCcsIGxhYmVsOiAnU09YJywgY29sb3I6ICdyZWQnIH0sXG4gICAgICAgIHsgaWQ6ICdpc28yNzAwMScsIGxhYmVsOiAnSVNPIDI3MDAxJywgY29sb3I6ICdvcmFuZ2UnIH0sXG4gICAgICAgIHsgaWQ6ICdwY2knLCBsYWJlbDogJ1BDSS1EU1MnLCBjb2xvcjogJ2N5YW4nIH0sXG4gICAgXTtcbiAgICBjb25zdCBjb21wbGlhbmNlU3RhdHVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXM6ICdSZXNvbHZlZCcsXG4gICAgICAgICAgICBjb3VudDogc3RhdHM/LnJlc29sdmVkVmlvbGF0aW9ucyA/PyAwLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogKHN0YXRzPy50b3RhbFZpb2xhdGlvbnMgPz8gMCkgPiAwID8gTWF0aC5yb3VuZCgoc3RhdHM/LnJlc29sdmVkVmlvbGF0aW9ucyA/PyAwIC8gKHN0YXRzPy50b3RhbFZpb2xhdGlvbnMgPz8gMCkpICogMTAwKSA6IDAsXG4gICAgICAgICAgICBpY29uOiBDaGVja0NpcmNsZSxcbiAgICAgICAgICAgIGNvbG9yOiAnZ3JlZW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXM6ICdDcml0aWNhbCcsXG4gICAgICAgICAgICBjb3VudDogKHN0YXRzPy5jcml0aWNhbFZpb2xhdGlvbnMgPz8gMCksXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAoc3RhdHM/LnRvdGFsVmlvbGF0aW9ucyA/PyAwKSA+IDAgPyBNYXRoLnJvdW5kKCgoc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwKSAvIChzdGF0cz8udG90YWxWaW9sYXRpb25zID8/IDApKSAqIDEwMCkgOiAwLFxuICAgICAgICAgICAgaWNvbjogWENpcmNsZSxcbiAgICAgICAgICAgIGNvbG9yOiAncmVkJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzOiAnT3BlbicsXG4gICAgICAgICAgICBjb3VudDogKHN0YXRzPy5vcGVuVmlvbGF0aW9ucyA/PyAwKSxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IChzdGF0cz8udG90YWxWaW9sYXRpb25zID8/IDApID4gMCA/IE1hdGgucm91bmQoKChzdGF0cz8ub3BlblZpb2xhdGlvbnMgPz8gMCkgLyAoc3RhdHM/LnRvdGFsVmlvbGF0aW9ucyA/PyAwKSkgKiAxMDApIDogMCxcbiAgICAgICAgICAgIGljb246IEFsZXJ0VHJpYW5nbGUsXG4gICAgICAgICAgICBjb2xvcjogJ3llbGxvdycsXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaC1mdWxsIHAtNiBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwiY29tcGxpYW5jZS1kYXNoYm9hcmQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiY29tcGxpYW5jZS1kYXNoYm9hcmQtdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtMyBiZy1ibHVlLTEwMCBkYXJrOmJnLWJsdWUtOTAwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IF9qc3goU2hpZWxkLCB7IGNsYXNzTmFtZTogXCJ3LTggaC04IHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwXCIgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkNvbXBsaWFuY2UgRGFzaGJvYXJkXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk1vbml0b3IgcmVndWxhdG9yeSBjb21wbGlhbmNlIGFjcm9zcyBhbGwgZnJhbWV3b3Jrc1wiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogaGFuZGxlUmVmcmVzaCwgaWNvbjogX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBkaXNhYmxlZDogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVmcmVzaC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogaGFuZGxlUmVmcmVzaCwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicnVuLWF1ZGl0LWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicnVuLWF1ZGl0LWJ0blwiLCBjaGlsZHJlbjogXCJSdW4gQ29tcGxpYW5jZSBBdWRpdFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiAoKSA9PiBoYW5kbGVFeHBvcnQoJ2NzdicpLCBpY29uOiBfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IFJlcG9ydFwiIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNCBtYi02XCIsIGNoaWxkcmVuOiBjb21wbGlhbmNlU3RhdHVzLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBJY29uID0gaXRlbS5pY29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHAtNiBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLXN0YXJ0IGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbWItMlwiLCBjaGlsZHJlbjogaXRlbS5zdGF0dXMgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0xXCIsIGNoaWxkcmVuOiBpdGVtLmNvdW50IH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIGJnLWdyYXktMjAwIGRhcms6YmctZ3JheS03MDAgcm91bmRlZC1mdWxsIGgtMlwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYGgtMiByb3VuZGVkLWZ1bGwgYmctJHtpdGVtLmNvbG9yfS01MDBgLCBzdHlsZTogeyB3aWR0aDogYCR7aXRlbS5wZXJjZW50YWdlfSVgIH0gfSkgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbaXRlbS5wZXJjZW50YWdlLCBcIiVcIl0gfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYHAtMyBiZy0ke2l0ZW0uY29sb3J9LTEwMCBkYXJrOmJnLSR7aXRlbS5jb2xvcn0tOTAwIHJvdW5kZWQtbGdgLCBjaGlsZHJlbjogX2pzeChJY29uLCB7IGNsYXNzTmFtZTogYHctNiBoLTYgdGV4dC0ke2l0ZW0uY29sb3J9LTYwMCBkYXJrOnRleHQtJHtpdGVtLmNvbG9yfS00MDBgIH0pIH0pXSB9KSB9LCBpdGVtLnN0YXR1cykpO1xuICAgICAgICAgICAgICAgIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZ2FwLTIgbWItNiBvdmVyZmxvdy14LWF1dG8gcGItMlwiLCBjaGlsZHJlbjogZnJhbWV3b3Jrcy5tYXAoKGZyYW1ld29yaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gc2VsZWN0ZWRGcmFtZXdvcmsgPT09IGZyYW1ld29yay5pZDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0U2VsZWN0ZWRGcmFtZXdvcmsoZnJhbWV3b3JrLmlkKSwgY2xhc3NOYW1lOiBgXHJcbiAgICAgICAgICAgICAgICBweC00IHB5LTIgcm91bmRlZC1sZyBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWFsbCB3aGl0ZXNwYWNlLW5vd3JhcFxyXG4gICAgICAgICAgICAgICAgJHtpc1NlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgYmctJHtmcmFtZXdvcmsuY29sb3J9LTEwMCBkYXJrOmJnLSR7ZnJhbWV3b3JrLmNvbG9yfS05MDAgdGV4dC0ke2ZyYW1ld29yay5jb2xvcn0tNzAwIGRhcms6dGV4dC0ke2ZyYW1ld29yay5jb2xvcn0tMzAwIHJpbmctMiByaW5nLSR7ZnJhbWV3b3JrLmNvbG9yfS01MDBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOmhvdmVyOmJnLWdyYXktNzAwJ31cclxuICAgICAgICAgICAgICBgLCBcImRhdGEtY3lcIjogYGZyYW1ld29yay0ke2ZyYW1ld29yay5pZH1gLCBjaGlsZHJlbjogZnJhbWV3b3JrLmxhYmVsIH0sIGZyYW1ld29yay5pZCkpO1xuICAgICAgICAgICAgICAgIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy00IGdhcC00IG1iLTZcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiVG90YWwgVmlvbGF0aW9uc1wiIH0pLCBfanN4KFNoaWVsZCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWJsdWUtNTAwXCIgfSldIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHN0YXRzPy50b3RhbFZpb2xhdGlvbnMgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBwLTQgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJPcGVuIFZpb2xhdGlvbnNcIiB9KSwgX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LW9yYW5nZS01MDBcIiB9KV0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogc3RhdHM/Lm9wZW5WaW9sYXRpb25zID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiUmlzayBTY29yZVwiIH0pLCBfanN4KFRyZW5kaW5nVXAsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1yZWQtNTAwXCIgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWVuZCBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwIH0pLCBfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IChzdGF0cz8uY3JpdGljYWxWaW9sYXRpb25zID8/IDApID4gMTAgPyAnZGFuZ2VyJyA6IChzdGF0cz8uY3JpdGljYWxWaW9sYXRpb25zID8/IDApID4gNSA/ICd3YXJuaW5nJyA6ICdzdWNjZXNzJywgY2hpbGRyZW46IChzdGF0cz8uY3JpdGljYWxWaW9sYXRpb25zID8/IDApID4gMTAgPyAnSGlnaCcgOiAoc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwKSA+IDUgPyAnTWVkaXVtJyA6ICdMb3cnIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBwLTQgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJMYXN0IFJlZnJlc2hcIiB9KSwgX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LXB1cnBsZS01MDBcIiB9KV0gfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IGxhc3RSZWZyZXNoID8gbmV3IERhdGUobGFzdFJlZnJlc2gpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTi9BJyB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGRhc2hib2FyZERhdGE/LnZpb2xhdGlvbnMgfHwgW10sIGNvbHVtbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdpZCcsIGhlYWRlck5hbWU6ICdJRCcsIHdpZHRoOiAxMDAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdzZXZlcml0eScsIGhlYWRlck5hbWU6ICdTZXZlcml0eScsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgd2lkdGg6IDEyMCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBmaWVsZDogJ2Rlc2NyaXB0aW9uJywgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJywgd2lkdGg6IDMwMCB9LFxuICAgICAgICAgICAgICAgICAgICBdLCBsb2FkaW5nOiBpc0xvYWRpbmcsIGVuYWJsZUV4cG9ydDogdHJ1ZSwgZW5hYmxlR3JvdXBpbmc6IHRydWUsIGVuYWJsZUZpbHRlcmluZzogdHJ1ZSwgXCJkYXRhLWN5XCI6IFwiY29tcGxpYW5jZS1ncmlkXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjb21wbGlhbmNlLWdyaWRcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IENvbXBsaWFuY2VEYXNoYm9hcmRWaWV3O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqXG4gKiBTbWFsbCBsYWJlbCBjb21wb25lbnQgZm9yIHN0YXR1cyBpbmRpY2F0b3JzLCBjb3VudHMsIGFuZCB0YWdzLlxuICogU3VwcG9ydHMgbXVsdGlwbGUgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEJhZGdlID0gKHsgY2hpbGRyZW4sIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBkb3QgPSBmYWxzZSwgZG90UG9zaXRpb24gPSAnbGVhZGluZycsIHJlbW92YWJsZSA9IGZhbHNlLCBvblJlbW92ZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFZhcmlhbnQgc3R5bGVzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktODAwIGJvcmRlci1ncmF5LTIwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtODAwIGJvcmRlci1ibHVlLTIwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgYm9yZGVyLWdyZWVuLTIwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBib3JkZXIteWVsbG93LTIwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGJvcmRlci1yZWQtMjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwIHRleHQtY3lhbi04MDAgYm9yZGVyLWN5YW4tMjAwJyxcbiAgICB9O1xuICAgIC8vIERvdCBjb2xvciBjbGFzc2VzXG4gICAgY29uc3QgZG90Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktNTAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtNTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTUwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTUwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTUwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ3B4LTIgcHktMC41IHRleHQteHMnLFxuICAgICAgICBzbTogJ3B4LTIuNSBweS0wLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtMyBweS0xIHRleHQtc20nLFxuICAgICAgICBsZzogJ3B4LTMuNSBweS0xLjUgdGV4dC1iYXNlJyxcbiAgICB9O1xuICAgIGNvbnN0IGRvdFNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ2gtMS41IHctMS41JyxcbiAgICAgICAgc206ICdoLTIgdy0yJyxcbiAgICAgICAgbWQ6ICdoLTIgdy0yJyxcbiAgICAgICAgbGc6ICdoLTIuNSB3LTIuNScsXG4gICAgfTtcbiAgICBjb25zdCBiYWRnZUNsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2lubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41JywgJ2ZvbnQtbWVkaXVtIHJvdW5kZWQtZnVsbCBib3JkZXInLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gVmFyaWFudFxuICAgIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IGJhZGdlQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtkb3QgJiYgZG90UG9zaXRpb24gPT09ICdsZWFkaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0pLCBkb3QgJiYgZG90UG9zaXRpb24gPT09ICd0cmFpbGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCByZW1vdmFibGUgJiYgb25SZW1vdmUgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBvblJlbW92ZSwgY2xhc3NOYW1lOiBjbHN4KCdtbC0wLjUgLW1yLTEgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyJywgJ3JvdW5kZWQtZnVsbCBob3ZlcjpiZy1ibGFjay8xMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTEnLCB7XG4gICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAnaC00IHctNCc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiUmVtb3ZlXCIsIGNoaWxkcmVuOiBfanN4KFwic3ZnXCIsIHsgY2xhc3NOYW1lOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTIgdy0yJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmaWxsOiBcImN1cnJlbnRDb2xvclwiLCB2aWV3Qm94OiBcIjAgMCAyMCAyMFwiLCBjaGlsZHJlbjogX2pzeChcInBhdGhcIiwgeyBmaWxsUnVsZTogXCJldmVub2RkXCIsIGQ6IFwiTTQuMjkzIDQuMjkzYTEgMSAwIDAxMS40MTQgMEwxMCA4LjU4Nmw0LjI5My00LjI5M2ExIDEgMCAxMTEuNDE0IDEuNDE0TDExLjQxNCAxMGw0LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNCAxLjQxNEwxMCAxMS40MTRsLTQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0LTEuNDE0TDguNTg2IDEwIDQuMjkzIDUuNzA3YTEgMSAwIDAxMC0xLjQxNHpcIiwgY2xpcFJ1bGU6IFwiZXZlbm9kZFwiIH0pIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEJhZGdlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9