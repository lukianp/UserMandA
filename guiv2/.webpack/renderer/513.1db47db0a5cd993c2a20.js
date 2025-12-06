"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[513],{

/***/ 50513:
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
            icon: lucide_react/* CheckCircle */.rAV,
            color: 'green',
        },
        {
            status: 'Critical',
            count: (stats?.criticalViolations ?? 0),
            percentage: (stats?.totalViolations ?? 0) > 0 ? Math.round(((stats?.criticalViolations ?? 0) / (stats?.totalViolations ?? 0)) * 100) : 0,
            icon: lucide_react/* XCircle */.Jpz,
            color: 'red',
        },
        {
            status: 'Open',
            count: (stats?.openViolations ?? 0),
            percentage: (stats?.totalViolations ?? 0) > 0 ? Math.round(((stats?.openViolations ?? 0) / (stats?.totalViolations ?? 0)) * 100) : 0,
            icon: lucide_react/* AlertTriangle */.hcu,
            color: 'yellow',
        },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "compliance-dashboard-view", "data-testid": "compliance-dashboard-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-blue-100 dark:bg-blue-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, { className: "w-8 h-8 text-blue-600 dark:text-blue-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Compliance Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Monitor regulatory compliance across all frameworks" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: handleRefresh, icon: (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-4 h-4" }), disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", onClick: handleRefresh, disabled: isLoading, "data-cy": "run-audit-btn", "data-testid": "run-audit-btn", children: "Run Compliance Audit" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: () => handleExport('csv'), icon: (0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-4 h-4" }), "data-cy": "export-btn", "data-testid": "export-btn", children: "Export Report" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: complianceStatus.map((item) => {
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
                }) }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Total Violations" }), (0,jsx_runtime.jsx)(lucide_react/* Shield */.ekZ, { className: "w-5 h-5 text-blue-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.totalViolations ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Open Violations" }), (0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-5 h-5 text-orange-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.openViolations ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Risk Score" }), (0,jsx_runtime.jsx)(lucide_react/* TrendingUp */.ntg, { className: "w-5 h-5 text-red-500" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-end gap-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: stats?.criticalViolations ?? 0 }), (0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: (stats?.criticalViolations ?? 0) > 10 ? 'danger' : (stats?.criticalViolations ?? 0) > 5 ? 'warning' : 'success', children: (stats?.criticalViolations ?? 0) > 10 ? 'High' : (stats?.criticalViolations ?? 0) > 5 ? 'Medium' : 'Low' })] })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: "Last Refresh" }), (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-5 h-5 text-purple-500" })] }), (0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: lastRefresh ? new Date(lastRefresh).toLocaleString() : 'N/A' })] })] }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: dashboardData?.violations || [], columns: [
                        { field: 'id', headerName: 'ID', width: 100 },
                        { field: 'severity', headerName: 'Severity', width: 120 },
                        { field: 'status', headerName: 'Status', width: 120 },
                        { field: 'description', headerName: 'Description', width: 300 },
                    ], loading: isLoading, enableExport: true, enableGrouping: true, enableFiltering: true, "data-cy": "compliance-grid", "data-testid": "compliance-grid" }) })] }));
};
/* harmony default export */ const compliance_ComplianceDashboardView = (ComplianceDashboardView);


/***/ }),

/***/ 59944:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(28709);

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
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, 46479));
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, 64010));
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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Filter */ .dJT, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .EyeOff */ .X_F, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Eye */ .kU3, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Printer */ .xjr, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__/* .AgGridReact */ .W6, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   E: () => (/* binding */ Badge)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);

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
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNTEzLjY3YTRjNzNiNGQ1ODQ5MGZkNzU4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2tFO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQsb0JBQW9CLFdBQVc7QUFDL0I7QUFDQSx3QkFBd0IsRUFBRTtBQUMxQix5QkFBeUIsRUFBRTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixRQUFRO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLDhDQUE4QyxrQkFBUTtBQUN0RCxzQ0FBc0Msa0JBQVE7QUFDOUMsOEJBQThCLGtCQUFRO0FBQ3RDLDBDQUEwQyxrQkFBUTtBQUNsRCxrQ0FBa0MscUJBQVc7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksbUJBQVM7QUFDYjtBQUNBLEtBQUs7QUFDTCwwQkFBMEIscUJBQVc7QUFDckM7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLHFCQUFXO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsNEJBQTRCO0FBQ3hFO0FBQ0E7QUFDQSwwREFBMEQsbUNBQW1DO0FBQzdGLG1EQUFtRCx1Q0FBdUM7QUFDMUYsbURBQW1ELHVDQUF1QztBQUMxRixnREFBZ0Qsb0NBQW9DO0FBQ3BGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLFFBQVEsR0FBRyxtQkFBbUIsSUFBSSxrQkFBa0IsR0FBRyxrQkFBa0IsR0FBRyxVQUFVO0FBQzNILGlCQUFpQjtBQUNqQiwrREFBK0Qsa0JBQWtCO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCxXQUFXO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxrQkFBa0IsaUJBQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDcFMrRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUN3QztBQUNtRTtBQUNyQjtBQUMvQjtBQUNGO0FBQ2dDO0FBQzlFO0FBQ1AsWUFBWSxvRkFBb0YsRUFBRSwyQkFBMkI7QUFDN0gsc0RBQXNELGtCQUFRO0FBQzlEO0FBQ0EsVUFBVSxtREFBbUQ7QUFDN0QsVUFBVSw0Q0FBNEM7QUFDdEQsVUFBVSw2Q0FBNkM7QUFDdkQsVUFBVSx1Q0FBdUM7QUFDakQsVUFBVSxxREFBcUQ7QUFDL0QsVUFBVSw0Q0FBNEM7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGlDQUFXO0FBQzdCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLDZCQUFPO0FBQ3pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLG1DQUFhO0FBQy9CO0FBQ0EsU0FBUztBQUNUO0FBQ0EsWUFBWSxvQkFBSyxVQUFVLGtLQUFrSyxvQkFBSyxVQUFVLGdFQUFnRSxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxVQUFVLG9FQUFvRSxtQkFBSSxDQUFDLDRCQUFNLElBQUksdURBQXVELEdBQUcsR0FBRyxvQkFBSyxVQUFVLFdBQVcsbUJBQUksU0FBUyxpR0FBaUcsR0FBRyxtQkFBSSxRQUFRLGdIQUFnSCxJQUFJLElBQUksR0FBRyxvQkFBSyxVQUFVLGlEQUFpRCxtQkFBSSxDQUFDLG9CQUFNLElBQUksb0RBQW9ELG1CQUFJLENBQUMsOEJBQVEsSUFBSSxzQkFBc0IscUdBQXFHLEdBQUcsbUJBQUksQ0FBQyxvQkFBTSxJQUFJLCtKQUErSixHQUFHLG1CQUFJLENBQUMsb0JBQU0sSUFBSSxnRUFBZ0UsbUJBQUksQ0FBQyw4QkFBUSxJQUFJLHNCQUFzQixvRkFBb0YsSUFBSSxJQUFJLEdBQUcsbUJBQUksVUFBVTtBQUNsNkM7QUFDQSw0QkFBNEIsbUJBQUksVUFBVSw2R0FBNkcsb0JBQUssVUFBVSwwREFBMEQsb0JBQUssVUFBVSxnQ0FBZ0MsbUJBQUksUUFBUSwrRkFBK0YsR0FBRyxtQkFBSSxRQUFRLDBGQUEwRixHQUFHLG9CQUFLLFVBQVUsaURBQWlELG1CQUFJLFVBQVUsNkVBQTZFLG1CQUFJLFVBQVUsa0NBQWtDLFdBQVcsZ0JBQWdCLFVBQVUsZ0JBQWdCLE1BQU0sR0FBRyxHQUFHLG9CQUFLLFdBQVcscUdBQXFHLElBQUksSUFBSSxHQUFHLG1CQUFJLFVBQVUscUJBQXFCLFdBQVcsZUFBZSxXQUFXLDRCQUE0QixtQkFBSSxTQUFTLDJCQUEyQixXQUFXLGlCQUFpQixXQUFXLE9BQU8sR0FBRyxJQUFJLEdBQUc7QUFDdGpDLGlCQUFpQixHQUFHLEdBQUcsbUJBQUksVUFBVTtBQUNyQztBQUNBLDRCQUE0QixtQkFBSSxhQUFhO0FBQzdDO0FBQ0Esa0JBQWtCO0FBQ2xCLG9DQUFvQyxnQkFBZ0IsZUFBZSxnQkFBZ0IsWUFBWSxnQkFBZ0IsaUJBQWlCLGdCQUFnQixtQkFBbUIsZ0JBQWdCO0FBQ25MO0FBQ0EseUNBQXlDLGFBQWEsOEJBQThCO0FBQ3BGLGlCQUFpQixHQUFHLEdBQUcsb0JBQUssVUFBVSxvRUFBb0Usb0JBQUssVUFBVSw4R0FBOEcsb0JBQUssVUFBVSxnRUFBZ0UsbUJBQUksUUFBUSxpR0FBaUcsR0FBRyxtQkFBSSxDQUFDLDRCQUFNLElBQUksb0NBQW9DLElBQUksR0FBRyxtQkFBSSxRQUFRLHNHQUFzRyxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsb0JBQUssVUFBVSxnRUFBZ0UsbUJBQUksUUFBUSxnR0FBZ0csR0FBRyxtQkFBSSxDQUFDLDhCQUFRLElBQUksc0NBQXNDLElBQUksR0FBRyxtQkFBSSxRQUFRLHFHQUFxRyxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsb0JBQUssVUFBVSxnRUFBZ0UsbUJBQUksUUFBUSwyRkFBMkYsR0FBRyxtQkFBSSxDQUFDLGdDQUFVLElBQUksbUNBQW1DLElBQUksR0FBRyxvQkFBSyxVQUFVLDhDQUE4QyxtQkFBSSxRQUFRLHlHQUF5RyxHQUFHLG1CQUFJLENBQUMsa0JBQUssSUFBSSw4T0FBOE8sSUFBSSxJQUFJLEdBQUcsb0JBQUssVUFBVSw4R0FBOEcsb0JBQUssVUFBVSxnRUFBZ0UsbUJBQUksUUFBUSw2RkFBNkYsR0FBRyxtQkFBSSxDQUFDLDhCQUFRLElBQUksc0NBQXNDLElBQUksR0FBRyxtQkFBSSxRQUFRLHdJQUF3SSxJQUFJLElBQUksR0FBRyxtQkFBSSxVQUFVLGdIQUFnSCxtQkFBSSxDQUFDLDhDQUFtQixJQUFJO0FBQ3hpRiwwQkFBMEIsMkNBQTJDO0FBQ3JFLDBCQUEwQix1REFBdUQ7QUFDakYsMEJBQTBCLG1EQUFtRDtBQUM3RSwwQkFBMEIsNkRBQTZEO0FBQ3ZGLDRLQUE0SyxHQUFHLElBQUk7QUFDbkw7QUFDQSx5RUFBZSx1QkFBdUIsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9EK0M7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3VFO0FBQzNCO0FBQ2hCO0FBQ0E7QUFDMEM7QUFDN0I7QUFDRTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGdzREFBOEM7QUFDbEQsSUFBSSwrckRBQXNEO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0Msd1hBQXdYO0FBQzVaLG9CQUFvQiw2Q0FBTTtBQUMxQixrQ0FBa0MsMkNBQWM7QUFDaEQsa0RBQWtELDJDQUFjO0FBQ2hFLG9CQUFvQiw4Q0FBTztBQUMzQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLGdEQUFTO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQSwwQkFBMEIsOENBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLHdCQUF3Qiw4Q0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsbUVBQW1FO0FBQ3JGLGtCQUFrQiw2REFBNkQ7QUFDL0Usa0JBQWtCLHVEQUF1RDtBQUN6RTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLGtEQUFXO0FBQ25DO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSwyQkFBMkIsa0RBQVc7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esa0NBQWtDLGtEQUFXO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0Esd0JBQXdCLGtEQUFXO0FBQ25DO0FBQ0E7QUFDQSxvQ0FBb0MseUJBQXlCO0FBQzdELGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLDBCQUEwQixrREFBVztBQUNyQztBQUNBO0FBQ0Esb0NBQW9DLHlCQUF5QjtBQUM3RDtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBLHNCQUFzQixrREFBVztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOEJBQThCLGtEQUFXO0FBQ3pDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNEJBQTRCLGtEQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsNkJBQTZCLG1EQUFJO0FBQ2pDLFlBQVksdURBQUssVUFBVSxxRUFBcUUsdURBQUssVUFBVSw2R0FBNkcsc0RBQUksVUFBVSxnREFBZ0Qsc0RBQUksV0FBVyw0RUFBNEUsc0RBQUksQ0FBQyw0REFBTyxJQUFJLFlBQVksU0FBUyxpQ0FBaUMsUUFBUSxHQUFHLEdBQUcsdURBQUssVUFBVSxxRUFBcUUsc0RBQUksQ0FBQywwREFBTSxJQUFJLG9DQUFvQyxzREFBSSxDQUFDLDJEQUFNLElBQUksVUFBVTtBQUN6bUI7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLDZFQUE2RSxJQUFJLHNEQUFJLENBQUMsMERBQU0sSUFBSSxzREFBc0Qsc0RBQUksQ0FBQywyREFBTSxJQUFJLFVBQVUsSUFBSSxzREFBSSxDQUFDLHdEQUFHLElBQUksVUFBVSxvSEFBb0gsR0FBRyxzREFBSSxDQUFDLDBEQUFNLElBQUksbUlBQW1JLG9CQUFvQix1REFBSyxDQUFDLHVEQUFTLElBQUksV0FBVyxzREFBSSxDQUFDLDBEQUFNLElBQUksb0NBQW9DLHNEQUFJLENBQUMsNkRBQVEsSUFBSSxVQUFVLDJGQUEyRixHQUFHLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw2REFBUSxJQUFJLFVBQVUsbUdBQW1HLElBQUksb0JBQW9CLHNEQUFJLENBQUMsMERBQU0sSUFBSSxvQ0FBb0Msc0RBQUksQ0FBQyw0REFBTyxJQUFJLFVBQVUsOEVBQThFLEtBQUssSUFBSSxHQUFHLHVEQUFLLFVBQVUscURBQXFELHNEQUFJLFVBQVUsdU5BQXVOLHNEQUFJLENBQUMsNERBQU8sSUFBSSxzQ0FBc0MsR0FBRyxJQUFJLHNEQUFJLFVBQVUsV0FBVyxtREFBSSxxRUFBcUUsUUFBUSxZQUFZLHNEQUFJLENBQUMsZ0VBQVcsSUFBSSx5YUFBeWEsR0FBRyx1QkFBdUIsdURBQUssVUFBVSw2SkFBNkosc0RBQUksU0FBUyx3RUFBd0UseUJBQXlCLHVEQUFLLFlBQVksc0RBQXNELHNEQUFJLFlBQVk7QUFDcjJFO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxHQUFHLHNEQUFJLFdBQVcsNkRBQTZELElBQUksaUJBQWlCLEtBQUssSUFBSTtBQUN4SjtBQUNPLDRCQUE0Qiw2Q0FBZ0I7QUFDbkQ7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDbEsrRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDMEI7QUFDRTtBQUM1QjtBQUNBO0FBQ0E7QUFDTyxpQkFBaUIsOElBQThJO0FBQ3RLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLG1EQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksdURBQUssV0FBVyw0RkFBNEYsc0RBQUksV0FBVyxXQUFXLG1EQUFJLG9GQUFvRixJQUFJLHNEQUFJLFdBQVcsb0JBQW9CLHlDQUF5QyxzREFBSSxXQUFXLFdBQVcsbURBQUksb0ZBQW9GLDhCQUE4QixzREFBSSxhQUFhLDhDQUE4QyxtREFBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLG1EQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQ29tcGxpYW5jZURhc2hib2FyZExvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL2NvbXBsaWFuY2UvQ29tcGxpYW5jZURhc2hib2FyZFZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29tcGxpYW5jZSBEYXNoYm9hcmQgTG9naWMgSG9va1xuICogVHJhY2tzIG9yZ2FuaXphdGlvbmFsIGNvbXBsaWFuY2UgcG9zdHVyZSB3aXRoIGdvdmVybmFuY2UgcmlzayBzY29yaW5nXG4gKiBJbnRlZ3JhdGVzIHdpdGggTG9naWMgRW5naW5lIEFwcGx5R292ZXJuYW5jZVJpc2sgaW5mZXJlbmNlXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrLCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBDYWxjdWxhdGUgb3ZlcmFsbCBjb21wbGlhbmNlIHNjb3JlIGZyb20gTG9naWMgRW5naW5lIHN0YXRpc3RpY3NcbiAqIFVzZXMgZ292ZXJuYW5jZSByaXNrIGRhdGEgdG8gZGV0ZXJtaW5lIGNvbXBsaWFuY2UgcG9zdHVyZVxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVDb21wbGlhbmNlU2NvcmUoc3RhdHMpIHtcbiAgICBpZiAoIXN0YXRzIHx8ICFzdGF0cy5Vc2VyQ291bnQgfHwgc3RhdHMuVXNlckNvdW50ID09PSAwKVxuICAgICAgICByZXR1cm4gMDtcbiAgICAvLyBHb3Zlcm5hbmNlIHJpc2sgaW52ZXJzZSBzY29yaW5nIC0gZmV3ZXIgcmlza3MgPSBoaWdoZXIgY29tcGxpYW5jZVxuICAgIGNvbnN0IGdvdmVybmFuY2VSaXNrcyA9IHN0YXRzLkdvdmVybmFuY2VSaXNrQ291bnQgfHwgMDtcbiAgICBjb25zdCB0b3RhbFVzZXJzID0gc3RhdHMuVXNlckNvdW50IHx8IDE7XG4gICAgY29uc3Qgcmlza1JhdGlvID0gZ292ZXJuYW5jZVJpc2tzIC8gdG90YWxVc2VycztcbiAgICAvLyBDYWxjdWxhdGUgYmFzZSBzY29yZSAobWF4IDEwMCwgcmVkdWNlIGJ5IHJpc2sgcmF0aW8pXG4gICAgY29uc3QgYmFzZVNjb3JlID0gTWF0aC5tYXgoMCwgMTAwIC0gKHJpc2tSYXRpbyAqIDIwMCkpO1xuICAgIC8vIEZhY3RvciBpbiBpbmFjdGl2ZSBhY2NvdW50c1xuICAgIGNvbnN0IGluYWN0aXZlQWNjb3VudHMgPSBzdGF0cy5JbmFjdGl2ZUFjY291bnRDb3VudCB8fCAwO1xuICAgIGNvbnN0IGluYWN0aXZlUmF0aW8gPSBpbmFjdGl2ZUFjY291bnRzIC8gdG90YWxVc2VycztcbiAgICBjb25zdCBpbmFjdGl2ZVBlbmFsdHkgPSBpbmFjdGl2ZVJhdGlvICogMTA7XG4gICAgLy8gRmFjdG9yIGluIGd1ZXN0IGFjY291bnRzXG4gICAgY29uc3QgZ3Vlc3RBY2NvdW50cyA9IHN0YXRzLkd1ZXN0QWNjb3VudENvdW50IHx8IDA7XG4gICAgY29uc3QgZ3Vlc3RSYXRpbyA9IGd1ZXN0QWNjb3VudHMgLyB0b3RhbFVzZXJzO1xuICAgIGNvbnN0IGd1ZXN0UGVuYWx0eSA9IGd1ZXN0UmF0aW8gKiA1O1xuICAgIGNvbnN0IGZpbmFsU2NvcmUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIGJhc2VTY29yZSAtIGluYWN0aXZlUGVuYWx0eSAtIGd1ZXN0UGVuYWx0eSkpO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKGZpbmFsU2NvcmUpO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSBjb21wbGlhbmNlIGZyYW1ld29ya3MgYmFzZWQgb24gb3JnYW5pemF0aW9uYWwgZGF0YVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUZyYW1ld29ya3Moc3RhdHMpIHtcbiAgICBjb25zdCBiYXNlU2NvcmUgPSBjYWxjdWxhdGVDb21wbGlhbmNlU2NvcmUoc3RhdHMpO1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnZ2RwcicsXG4gICAgICAgICAgICBuYW1lOiAnR0RQUicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYWwgRGF0YSBQcm90ZWN0aW9uIFJlZ3VsYXRpb24nLFxuICAgICAgICAgICAgY29tcGxpYW5jZVNjb3JlOiBNYXRoLm1pbigxMDAsIGJhc2VTY29yZSArIDUpLFxuICAgICAgICAgICAgY29udHJvbHNUb3RhbDogNDUsXG4gICAgICAgICAgICBjb250cm9sc1Bhc3NlZDogTWF0aC5mbG9vcig0NSAqIChiYXNlU2NvcmUgLyAxMDApKSxcbiAgICAgICAgICAgIGNvbnRyb2xzRmFpbGVkOiBNYXRoLmNlaWwoNDUgKiAoMSAtIGJhc2VTY29yZSAvIDEwMCkpLFxuICAgICAgICAgICAgbGFzdEF1ZGl0OiBuZXcgRGF0ZShEYXRlLm5vdygpIC0gNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApLFxuICAgICAgICAgICAgc3RhdHVzOiBiYXNlU2NvcmUgPj0gOTAgPyAnQ29tcGxpYW50JyA6IGJhc2VTY29yZSA+PSA3MCA/ICdQYXJ0aWFsJyA6ICdOb24tQ29tcGxpYW50JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdoaXBhYScsXG4gICAgICAgICAgICBuYW1lOiAnSElQQUEnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdIZWFsdGggSW5zdXJhbmNlIFBvcnRhYmlsaXR5IGFuZCBBY2NvdW50YWJpbGl0eSBBY3QnLFxuICAgICAgICAgICAgY29tcGxpYW5jZVNjb3JlOiBNYXRoLm1pbigxMDAsIGJhc2VTY29yZSArIDMpLFxuICAgICAgICAgICAgY29udHJvbHNUb3RhbDogMzIsXG4gICAgICAgICAgICBjb250cm9sc1Bhc3NlZDogTWF0aC5mbG9vcigzMiAqIChiYXNlU2NvcmUgLyAxMDApKSxcbiAgICAgICAgICAgIGNvbnRyb2xzRmFpbGVkOiBNYXRoLmNlaWwoMzIgKiAoMSAtIGJhc2VTY29yZSAvIDEwMCkpLFxuICAgICAgICAgICAgbGFzdEF1ZGl0OiBuZXcgRGF0ZShEYXRlLm5vdygpIC0gMTQgKiAyNCAqIDYwICogNjAgKiAxMDAwKSxcbiAgICAgICAgICAgIHN0YXR1czogYmFzZVNjb3JlID49IDk1ID8gJ0NvbXBsaWFudCcgOiBiYXNlU2NvcmUgPj0gODAgPyAnUGFydGlhbCcgOiAnTm9uLUNvbXBsaWFudCcsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnc29jMicsXG4gICAgICAgICAgICBuYW1lOiAnU09DIDInLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZXJ2aWNlIE9yZ2FuaXphdGlvbiBDb250cm9sIDInLFxuICAgICAgICAgICAgY29tcGxpYW5jZVNjb3JlOiBiYXNlU2NvcmUsXG4gICAgICAgICAgICBjb250cm9sc1RvdGFsOiA2NCxcbiAgICAgICAgICAgIGNvbnRyb2xzUGFzc2VkOiBNYXRoLmZsb29yKDY0ICogKGJhc2VTY29yZSAvIDEwMCkpLFxuICAgICAgICAgICAgY29udHJvbHNGYWlsZWQ6IE1hdGguY2VpbCg2NCAqICgxIC0gYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBsYXN0QXVkaXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSAzMCAqIDI0ICogNjAgKiA2MCAqIDEwMDApLFxuICAgICAgICAgICAgc3RhdHVzOiBiYXNlU2NvcmUgPj0gOTIgPyAnQ29tcGxpYW50JyA6IGJhc2VTY29yZSA+PSA3NSA/ICdQYXJ0aWFsJyA6ICdOb24tQ29tcGxpYW50JyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdpc28yNzAwMScsXG4gICAgICAgICAgICBuYW1lOiAnSVNPIDI3MDAxJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5mb3JtYXRpb24gU2VjdXJpdHkgTWFuYWdlbWVudCcsXG4gICAgICAgICAgICBjb21wbGlhbmNlU2NvcmU6IE1hdGgubWluKDEwMCwgYmFzZVNjb3JlIC0gMiksXG4gICAgICAgICAgICBjb250cm9sc1RvdGFsOiAxMTQsXG4gICAgICAgICAgICBjb250cm9sc1Bhc3NlZDogTWF0aC5mbG9vcigxMTQgKiAoYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBjb250cm9sc0ZhaWxlZDogTWF0aC5jZWlsKDExNCAqICgxIC0gYmFzZVNjb3JlIC8gMTAwKSksXG4gICAgICAgICAgICBsYXN0QXVkaXQ6IG5ldyBEYXRlKERhdGUubm93KCkgLSA2MCAqIDI0ICogNjAgKiA2MCAqIDEwMDApLFxuICAgICAgICAgICAgc3RhdHVzOiBiYXNlU2NvcmUgPj0gOTMgPyAnQ29tcGxpYW50JyA6IGJhc2VTY29yZSA+PSA3OCA/ICdQYXJ0aWFsJyA6ICdOb24tQ29tcGxpYW50JyxcbiAgICAgICAgfSxcbiAgICBdO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSBtb2NrIHBvbGljeSB2aW9sYXRpb25zXG4gKiBUT0RPOiBSZXBsYWNlIHdpdGggcmVhbCBMb2dpYyBFbmdpbmUgZ292ZXJuYW5jZSByaXNrIGRhdGFcbiAqL1xuZnVuY3Rpb24gZ2VuZXJhdGVWaW9sYXRpb25zKGdvdmVybmFuY2VSaXNrQ291bnQpIHtcbiAgICBjb25zdCB2aW9sYXRpb25zID0gW107XG4gICAgY29uc3QgY291bnQgPSBNYXRoLm1pbihnb3Zlcm5hbmNlUmlza0NvdW50LCAxMCk7IC8vIFNob3cgdG9wIDEwXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHZpb2xhdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBpZDogYHZpb2wtJHtpfWAsXG4gICAgICAgICAgICB1c2VyOiBgdXNlciR7aX1AY29udG9zby5jb21gLFxuICAgICAgICAgICAgdmlvbGF0aW9uOiBbXG4gICAgICAgICAgICAgICAgJ0luYWN0aXZlIGFjY291bnQgZXhjZWVkcyByZXRlbnRpb24gcG9saWN5JyxcbiAgICAgICAgICAgICAgICAnR3Vlc3QgYWNjb3VudCB3aXRoIGV4Y2Vzc2l2ZSBwZXJtaXNzaW9ucycsXG4gICAgICAgICAgICAgICAgJ0RhdGEgc3RvcmVkIGluIG5vbi1jb21wbGlhbnQgcmVnaW9uJyxcbiAgICAgICAgICAgICAgICAnTWlzc2luZyBtdWx0aS1mYWN0b3IgYXV0aGVudGljYXRpb24nLFxuICAgICAgICAgICAgICAgICdTdGFsZSBjcmVkZW50aWFscyBub3Qgcm90YXRlZCcsXG4gICAgICAgICAgICAgICAgJ09ycGhhbmVkIGFjY291bnQgZGV0ZWN0ZWQnLFxuICAgICAgICAgICAgICAgICdQcml2aWxlZ2VkIGFjY2VzcyB3aXRob3V0IGp1c3RpZmljYXRpb24nLFxuICAgICAgICAgICAgICAgICdTZW5zaXRpdmUgZGF0YSBhY2Nlc3NlZCBmcm9tIHVuYXBwcm92ZWQgbG9jYXRpb24nLFxuICAgICAgICAgICAgXVtpICUgOF0sXG4gICAgICAgICAgICBzZXZlcml0eTogWydDcml0aWNhbCcsICdIaWdoJywgJ01lZGl1bScsICdMb3cnXVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KV0sXG4gICAgICAgICAgICBmcmFtZXdvcms6IFsnR0RQUicsICdISVBBQScsICdTT0MgMicsICdJU08gMjcwMDEnXVtpICUgNF0sXG4gICAgICAgICAgICBkZXRlY3RlZERhdGU6IG5ldyBEYXRlKERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogMzAgKiAyNCAqIDYwICogNjAgKiAxMDAwKSxcbiAgICAgICAgICAgIHN0YXR1czogWydPcGVuJywgJ0Fja25vd2xlZGdlZCcsICdSZXNvbHZlZCddW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpXSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB2aW9sYXRpb25zO1xufVxuLyoqXG4gKiBCdWlsZCBjb21wbGlhbmNlIHRyZW5kIGRhdGEgKGxhc3QgMzAgZGF5cylcbiAqL1xuZnVuY3Rpb24gYnVpbGRDb21wbGlhbmNlVHJlbmRzKGN1cnJlbnRTY29yZSkge1xuICAgIGNvbnN0IHRyZW5kcyA9IFtdO1xuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgZm9yIChsZXQgaSA9IDI5OyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUobm93KTtcbiAgICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gaSk7XG4gICAgICAgIC8vIFNpbXVsYXRlIGdyYWR1YWwgaW1wcm92ZW1lbnRcbiAgICAgICAgY29uc3QgZGF5UHJvZ3Jlc3MgPSAoMjkgLSBpKSAvIDI5O1xuICAgICAgICBjb25zdCBzY29yZSA9IE1hdGgucm91bmQoY3VycmVudFNjb3JlIC0gKDEwICogKDEgLSBkYXlQcm9ncmVzcykpKTtcbiAgICAgICAgY29uc3QgdmlvbGF0aW9ucyA9IE1hdGguZmxvb3IoNTAgLSAoMzAgKiBkYXlQcm9ncmVzcykpO1xuICAgICAgICB0cmVuZHMucHVzaCh7XG4gICAgICAgICAgICBkYXRlOiBkYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgICAgIHNjb3JlOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxMDAsIHNjb3JlKSksXG4gICAgICAgICAgICB2aW9sYXRpb25zOiBNYXRoLm1heCgwLCB2aW9sYXRpb25zKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cmVuZHM7XG59XG4vKipcbiAqIEdlbmVyYXRlIG1vY2sgY29tcGxpYW5jZSBkYXNoYm9hcmQgZGF0YVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZU1vY2tEYXNoYm9hcmREYXRhKCkge1xuICAgIGNvbnN0IG1vY2tTdGF0cyA9IHtcbiAgICAgICAgVXNlckNvdW50OiAxMDAwLFxuICAgICAgICBHb3Zlcm5hbmNlUmlza0NvdW50OiA0NSxcbiAgICAgICAgSW5hY3RpdmVBY2NvdW50Q291bnQ6IDIzLFxuICAgICAgICBHdWVzdEFjY291bnRDb3VudDogMTIsXG4gICAgfTtcbiAgICBjb25zdCBzY29yZSA9IGNhbGN1bGF0ZUNvbXBsaWFuY2VTY29yZShtb2NrU3RhdHMpO1xuICAgIHJldHVybiB7XG4gICAgICAgIG1ldHJpY3M6IHtcbiAgICAgICAgICAgIG92ZXJhbGxTY29yZTogc2NvcmUsXG4gICAgICAgICAgICBmcmFtZXdvcmtDb3VudDogNCxcbiAgICAgICAgICAgIHBvbGljeVZpb2xhdGlvbnM6IDQ1LFxuICAgICAgICAgICAgaW5hY3RpdmVBY2NvdW50czogMjMsXG4gICAgICAgICAgICBndWVzdEFjY291bnRzOiAxMixcbiAgICAgICAgICAgIGRhdGFSZXNpZGVuY3lJc3N1ZXM6IDMsXG4gICAgICAgICAgICBhdWRpdFJlYWRpbmVzc1Njb3JlOiA4NSxcbiAgICAgICAgICAgIGdvdmVybmFuY2VSaXNrczogNDUsXG4gICAgICAgIH0sXG4gICAgICAgIGZyYW1ld29ya3M6IGdlbmVyYXRlRnJhbWV3b3Jrcyhtb2NrU3RhdHMpLFxuICAgICAgICB2aW9sYXRpb25zOiBnZW5lcmF0ZVZpb2xhdGlvbnMoNDUpLFxuICAgICAgICB0cmVuZHM6IGJ1aWxkQ29tcGxpYW5jZVRyZW5kcyhzY29yZSksXG4gICAgfTtcbn1cbi8qKlxuICogQ29tcGxpYW5jZSBEYXNoYm9hcmQgTG9naWMgSG9va1xuICogSW50ZWdyYXRlcyB3aXRoIExvZ2ljIEVuZ2luZSBmb3IgcmVhbC10aW1lIGNvbXBsaWFuY2UgbWV0cmljc1xuICovXG5leHBvcnQgY29uc3QgdXNlQ29tcGxpYW5jZURhc2hib2FyZExvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtkYXNoYm9hcmREYXRhLCBzZXREYXNoYm9hcmREYXRhXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtsYXN0UmVmcmVzaCwgc2V0TGFzdFJlZnJlc2hdID0gdXNlU3RhdGUobmV3IERhdGUoKSk7XG4gICAgY29uc3QgbG9hZENvbXBsaWFuY2VNZXRyaWNzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBRdWVyeSBMb2dpYyBFbmdpbmUgZm9yIHN0YXRpc3RpY3NcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5sb2dpY0VuZ2luZS5nZXRTdGF0aXN0aWNzKCk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiYgcmVzdWx0LmRhdGE/LnN0YXRpc3RpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IHJlc3VsdC5kYXRhLnN0YXRpc3RpY3M7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGNvbXBsaWFuY2UgbWV0cmljcyBmcm9tIExvZ2ljIEVuZ2luZSBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3Qgb3ZlcmFsbFNjb3JlID0gY2FsY3VsYXRlQ29tcGxpYW5jZVNjb3JlKHN0YXRzKTtcbiAgICAgICAgICAgICAgICBjb25zdCBnb3Zlcm5hbmNlUmlza3MgPSBzdGF0cy5Hb3Zlcm5hbmNlUmlza0NvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5hY3RpdmVBY2NvdW50cyA9IHN0YXRzLkluYWN0aXZlQWNjb3VudENvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3Vlc3RBY2NvdW50cyA9IHN0YXRzLkd1ZXN0QWNjb3VudENvdW50IHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgbWV0cmljcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmFsbFNjb3JlLFxuICAgICAgICAgICAgICAgICAgICBmcmFtZXdvcmtDb3VudDogNCxcbiAgICAgICAgICAgICAgICAgICAgcG9saWN5VmlvbGF0aW9uczogZ292ZXJuYW5jZVJpc2tzLFxuICAgICAgICAgICAgICAgICAgICBpbmFjdGl2ZUFjY291bnRzLFxuICAgICAgICAgICAgICAgICAgICBndWVzdEFjY291bnRzLFxuICAgICAgICAgICAgICAgICAgICBkYXRhUmVzaWRlbmN5SXNzdWVzOiBNYXRoLmZsb29yKGdvdmVybmFuY2VSaXNrcyAqIDAuMSksIC8vIEVzdGltYXRlXG4gICAgICAgICAgICAgICAgICAgIGF1ZGl0UmVhZGluZXNzU2NvcmU6IE1hdGgubWluKDEwMCwgb3ZlcmFsbFNjb3JlICsgNSksXG4gICAgICAgICAgICAgICAgICAgIGdvdmVybmFuY2VSaXNrcyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIEJ1aWxkIGRhc2hib2FyZCBkYXRhXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0cmljcyxcbiAgICAgICAgICAgICAgICAgICAgZnJhbWV3b3JrczogZ2VuZXJhdGVGcmFtZXdvcmtzKHN0YXRzKSxcbiAgICAgICAgICAgICAgICAgICAgdmlvbGF0aW9uczogZ2VuZXJhdGVWaW9sYXRpb25zKGdvdmVybmFuY2VSaXNrcyksXG4gICAgICAgICAgICAgICAgICAgIHRyZW5kczogYnVpbGRDb21wbGlhbmNlVHJlbmRzKG92ZXJhbGxTY29yZSksXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXREYXNoYm9hcmREYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgIHNldExhc3RSZWZyZXNoKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGZldGNoIExvZ2ljIEVuZ2luZSBzdGF0aXN0aWNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yIG9jY3VycmVkJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb21wbGlhbmNlIGRhc2hib2FyZCBkYXRhIGZldGNoIGVycm9yOicsIGVycik7XG4gICAgICAgICAgICAvLyBGYWxsYmFjayB0byBtb2NrIGRhdGFcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignVXNpbmcgbW9jayBjb21wbGlhbmNlIGRhc2hib2FyZCBkYXRhJyk7XG4gICAgICAgICAgICBzZXREYXNoYm9hcmREYXRhKGdlbmVyYXRlTW9ja0Rhc2hib2FyZERhdGEoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8vIEluaXRpYWwgbG9hZFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRDb21wbGlhbmNlTWV0cmljcygpO1xuICAgIH0sIFtsb2FkQ29tcGxpYW5jZU1ldHJpY3NdKTtcbiAgICBjb25zdCBoYW5kbGVSZWZyZXNoID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBsb2FkQ29tcGxpYW5jZU1ldHJpY3MoKTtcbiAgICB9LCBbbG9hZENvbXBsaWFuY2VNZXRyaWNzXSk7XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKGZvcm1hdCkgPT4ge1xuICAgICAgICBpZiAoIWRhc2hib2FyZERhdGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBQcmVwYXJlIGV4cG9ydCBkYXRhXG4gICAgICAgICAgICBjb25zdCBleHBvcnREYXRhID0ge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIG1ldHJpY3M6IGRhc2hib2FyZERhdGEubWV0cmljcyxcbiAgICAgICAgICAgICAgICBmcmFtZXdvcmtzOiBkYXNoYm9hcmREYXRhLmZyYW1ld29ya3MsXG4gICAgICAgICAgICAgICAgdmlvbGF0aW9uczogZGFzaGJvYXJkRGF0YS52aW9sYXRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChmb3JtYXQgPT09ICdjc3YnKSB7XG4gICAgICAgICAgICAgICAgLy8gQ1NWIGV4cG9ydFxuICAgICAgICAgICAgICAgIGNvbnN0IGNzdkxpbmVzID0gW107XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaCgnQ29tcGxpYW5jZSBEYXNoYm9hcmQgUmVwb3J0Jyk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaChgR2VuZXJhdGVkOiAke25ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKX1gKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKCcnKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKCdNRVRSSUNTJyk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaChgT3ZlcmFsbCBDb21wbGlhbmNlIFNjb3JlLCR7ZGFzaGJvYXJkRGF0YS5tZXRyaWNzLm92ZXJhbGxTY29yZX0lYCk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaChgUG9saWN5IFZpb2xhdGlvbnMsJHtkYXNoYm9hcmREYXRhLm1ldHJpY3MucG9saWN5VmlvbGF0aW9uc31gKTtcbiAgICAgICAgICAgICAgICBjc3ZMaW5lcy5wdXNoKGBJbmFjdGl2ZSBBY2NvdW50cywke2Rhc2hib2FyZERhdGEubWV0cmljcy5pbmFjdGl2ZUFjY291bnRzfWApO1xuICAgICAgICAgICAgICAgIGNzdkxpbmVzLnB1c2goYEd1ZXN0IEFjY291bnRzLCR7ZGFzaGJvYXJkRGF0YS5tZXRyaWNzLmd1ZXN0QWNjb3VudHN9YCk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaCgnRlJBTUVXT1JLUycpO1xuICAgICAgICAgICAgICAgIGNzdkxpbmVzLnB1c2goJ05hbWUsQ29tcGxpYW5jZSBTY29yZSxDb250cm9scyBQYXNzZWQsQ29udHJvbHMgRmFpbGVkLFN0YXR1cycpO1xuICAgICAgICAgICAgICAgIGRhc2hib2FyZERhdGEuZnJhbWV3b3Jrcy5mb3JFYWNoKGZ3ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY3N2TGluZXMucHVzaChgJHtmdy5uYW1lfSwke2Z3LmNvbXBsaWFuY2VTY29yZX0lLCR7ZncuY29udHJvbHNQYXNzZWR9LCR7ZncuY29udHJvbHNGYWlsZWR9LCR7Zncuc3RhdHVzfWApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY3N2TGluZXMuam9pbignXFxuJyldLCB7IHR5cGU6ICd0ZXh0L2NzdicgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICAgICAgbGluay5kb3dubG9hZCA9IGBjb21wbGlhbmNlLWRhc2hib2FyZC0ke0RhdGUubm93KCl9LmNzdmA7XG4gICAgICAgICAgICAgICAgbGluay5jbGljaygpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXhwb3J0IGNvbXBsZXRlZDonLCBmb3JtYXQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfSwgW2Rhc2hib2FyZERhdGFdKTtcbiAgICAvLyBDb21wdXRlIHN0YXRpc3RpY3NcbiAgICBjb25zdCBzdGF0cyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIWRhc2hib2FyZERhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG90YWxWaW9sYXRpb25zOiAwLFxuICAgICAgICAgICAgICAgIGNyaXRpY2FsVmlvbGF0aW9uczogMCxcbiAgICAgICAgICAgICAgICBvcGVuVmlvbGF0aW9uczogMCxcbiAgICAgICAgICAgICAgICByZXNvbHZlZFZpb2xhdGlvbnM6IDAsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbFZpb2xhdGlvbnM6IGRhc2hib2FyZERhdGEudmlvbGF0aW9ucy5sZW5ndGgsXG4gICAgICAgICAgICBjcml0aWNhbFZpb2xhdGlvbnM6IGRhc2hib2FyZERhdGEudmlvbGF0aW9ucy5maWx0ZXIodiA9PiB2LnNldmVyaXR5ID09PSAnQ3JpdGljYWwnKS5sZW5ndGgsXG4gICAgICAgICAgICBvcGVuVmlvbGF0aW9uczogZGFzaGJvYXJkRGF0YS52aW9sYXRpb25zLmZpbHRlcih2ID0+IHYuc3RhdHVzID09PSAnT3BlbicpLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc29sdmVkVmlvbGF0aW9uczogZGFzaGJvYXJkRGF0YS52aW9sYXRpb25zLmZpbHRlcih2ID0+IHYuc3RhdHVzID09PSAnUmVzb2x2ZWQnKS5sZW5ndGgsXG4gICAgICAgIH07XG4gICAgfSwgW2Rhc2hib2FyZERhdGFdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkYXNoYm9hcmREYXRhLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBsYXN0UmVmcmVzaCxcbiAgICAgICAgc3RhdHMsXG4gICAgICAgIGhhbmRsZVJlZnJlc2gsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIENvbXBsaWFuY2UgRGFzaGJvYXJkIFZpZXdcbiAqIENvbXByZWhlbnNpdmUgY29tcGxpYW5jZSBtb25pdG9yaW5nIGFuZCByZXBvcnRpbmcgZm9yIE0mQSBkaXNjb3ZlcnlcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2hpZWxkLCBDaGVja0NpcmNsZSwgWENpcmNsZSwgQWxlcnRUcmlhbmdsZSwgRmlsZVRleHQsIFRyZW5kaW5nVXAsIEFjdGl2aXR5IH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUNvbXBsaWFuY2VEYXNoYm9hcmRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUNvbXBsaWFuY2VEYXNoYm9hcmRMb2dpYyc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuZXhwb3J0IGNvbnN0IENvbXBsaWFuY2VEYXNoYm9hcmRWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZGFzaGJvYXJkRGF0YSwgaXNMb2FkaW5nLCBlcnJvciwgbGFzdFJlZnJlc2gsIHN0YXRzLCBoYW5kbGVFeHBvcnQsIGhhbmRsZVJlZnJlc2gsIH0gPSB1c2VDb21wbGlhbmNlRGFzaGJvYXJkTG9naWMoKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRGcmFtZXdvcmssIHNldFNlbGVjdGVkRnJhbWV3b3JrXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBmcmFtZXdvcmtzID0gW1xuICAgICAgICB7IGlkOiAnYWxsJywgbGFiZWw6ICdBbGwgRnJhbWV3b3JrcycsIGNvbG9yOiAnYmx1ZScgfSxcbiAgICAgICAgeyBpZDogJ2dkcHInLCBsYWJlbDogJ0dEUFInLCBjb2xvcjogJ3B1cnBsZScgfSxcbiAgICAgICAgeyBpZDogJ2hpcGFhJywgbGFiZWw6ICdISVBBQScsIGNvbG9yOiAnZ3JlZW4nIH0sXG4gICAgICAgIHsgaWQ6ICdzb3gnLCBsYWJlbDogJ1NPWCcsIGNvbG9yOiAncmVkJyB9LFxuICAgICAgICB7IGlkOiAnaXNvMjcwMDEnLCBsYWJlbDogJ0lTTyAyNzAwMScsIGNvbG9yOiAnb3JhbmdlJyB9LFxuICAgICAgICB7IGlkOiAncGNpJywgbGFiZWw6ICdQQ0ktRFNTJywgY29sb3I6ICdjeWFuJyB9LFxuICAgIF07XG4gICAgY29uc3QgY29tcGxpYW5jZVN0YXR1cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzOiAnUmVzb2x2ZWQnLFxuICAgICAgICAgICAgY291bnQ6IHN0YXRzPy5yZXNvbHZlZFZpb2xhdGlvbnMgPz8gMCxcbiAgICAgICAgICAgIHBlcmNlbnRhZ2U6IChzdGF0cz8udG90YWxWaW9sYXRpb25zID8/IDApID4gMCA/IE1hdGgucm91bmQoKHN0YXRzPy5yZXNvbHZlZFZpb2xhdGlvbnMgPz8gMCAvIChzdGF0cz8udG90YWxWaW9sYXRpb25zID8/IDApKSAqIDEwMCkgOiAwLFxuICAgICAgICAgICAgaWNvbjogQ2hlY2tDaXJjbGUsXG4gICAgICAgICAgICBjb2xvcjogJ2dyZWVuJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzOiAnQ3JpdGljYWwnLFxuICAgICAgICAgICAgY291bnQ6IChzdGF0cz8uY3JpdGljYWxWaW9sYXRpb25zID8/IDApLFxuICAgICAgICAgICAgcGVyY2VudGFnZTogKHN0YXRzPy50b3RhbFZpb2xhdGlvbnMgPz8gMCkgPiAwID8gTWF0aC5yb3VuZCgoKHN0YXRzPy5jcml0aWNhbFZpb2xhdGlvbnMgPz8gMCkgLyAoc3RhdHM/LnRvdGFsVmlvbGF0aW9ucyA/PyAwKSkgKiAxMDApIDogMCxcbiAgICAgICAgICAgIGljb246IFhDaXJjbGUsXG4gICAgICAgICAgICBjb2xvcjogJ3JlZCcsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1czogJ09wZW4nLFxuICAgICAgICAgICAgY291bnQ6IChzdGF0cz8ub3BlblZpb2xhdGlvbnMgPz8gMCksXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAoc3RhdHM/LnRvdGFsVmlvbGF0aW9ucyA/PyAwKSA+IDAgPyBNYXRoLnJvdW5kKCgoc3RhdHM/Lm9wZW5WaW9sYXRpb25zID8/IDApIC8gKHN0YXRzPy50b3RhbFZpb2xhdGlvbnMgPz8gMCkpICogMTAwKSA6IDAsXG4gICAgICAgICAgICBpY29uOiBBbGVydFRyaWFuZ2xlLFxuICAgICAgICAgICAgY29sb3I6ICd5ZWxsb3cnLFxuICAgICAgICB9LFxuICAgIF07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImNvbXBsaWFuY2UtZGFzaGJvYXJkLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImNvbXBsaWFuY2UtZGFzaGJvYXJkLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTMgYmctYmx1ZS0xMDAgZGFyazpiZy1ibHVlLTkwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBfanN4KFNoaWVsZCwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMFwiIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJDb21wbGlhbmNlIERhc2hib2FyZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJNb25pdG9yIHJlZ3VsYXRvcnkgY29tcGxpYW5jZSBhY3Jvc3MgYWxsIGZyYW1ld29ya3NcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVJlZnJlc2gsIGljb246IF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6IGhhbmRsZVJlZnJlc2gsIGRpc2FibGVkOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJ1bi1hdWRpdC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJ1bi1hdWRpdC1idG5cIiwgY2hpbGRyZW46IFwiUnVuIENvbXBsaWFuY2UgQXVkaXRcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgb25DbGljazogKCkgPT4gaGFuZGxlRXhwb3J0KCdjc3YnKSwgaWNvbjogX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSZXBvcnRcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTQgbWItNlwiLCBjaGlsZHJlbjogY29tcGxpYW5jZVN0YXR1cy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgSWNvbiA9IGl0ZW0uaWNvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBwLTYgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTJcIiwgY2hpbGRyZW46IGl0ZW0uc3RhdHVzIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMVwiLCBjaGlsZHJlbjogaXRlbS5jb3VudCB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBiZy1ncmF5LTIwMCBkYXJrOmJnLWdyYXktNzAwIHJvdW5kZWQtZnVsbCBoLTJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBoLTIgcm91bmRlZC1mdWxsIGJnLSR7aXRlbS5jb2xvcn0tNTAwYCwgc3R5bGU6IHsgd2lkdGg6IGAke2l0ZW0ucGVyY2VudGFnZX0lYCB9IH0pIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW2l0ZW0ucGVyY2VudGFnZSwgXCIlXCJdIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGBwLTMgYmctJHtpdGVtLmNvbG9yfS0xMDAgZGFyazpiZy0ke2l0ZW0uY29sb3J9LTkwMCByb3VuZGVkLWxnYCwgY2hpbGRyZW46IF9qc3goSWNvbiwgeyBjbGFzc05hbWU6IGB3LTYgaC02IHRleHQtJHtpdGVtLmNvbG9yfS02MDAgZGFyazp0ZXh0LSR7aXRlbS5jb2xvcn0tNDAwYCB9KSB9KV0gfSkgfSwgaXRlbS5zdGF0dXMpKTtcbiAgICAgICAgICAgICAgICB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGdhcC0yIG1iLTYgb3ZlcmZsb3cteC1hdXRvIHBiLTJcIiwgY2hpbGRyZW46IGZyYW1ld29ya3MubWFwKChmcmFtZXdvcmspID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IHNlbGVjdGVkRnJhbWV3b3JrID09PSBmcmFtZXdvcmsuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IHNldFNlbGVjdGVkRnJhbWV3b3JrKGZyYW1ld29yay5pZCksIGNsYXNzTmFtZTogYFxyXG4gICAgICAgICAgICAgICAgcHgtNCBweS0yIHJvdW5kZWQtbGcgZm9udC1tZWRpdW0gdHJhbnNpdGlvbi1hbGwgd2hpdGVzcGFjZS1ub3dyYXBcclxuICAgICAgICAgICAgICAgICR7aXNTZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYGJnLSR7ZnJhbWV3b3JrLmNvbG9yfS0xMDAgZGFyazpiZy0ke2ZyYW1ld29yay5jb2xvcn0tOTAwIHRleHQtJHtmcmFtZXdvcmsuY29sb3J9LTcwMCBkYXJrOnRleHQtJHtmcmFtZXdvcmsuY29sb3J9LTMwMCByaW5nLTIgcmluZy0ke2ZyYW1ld29yay5jb2xvcn0tNTAwYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ2JnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgaG92ZXI6YmctZ3JheS0xMDAgZGFyazpob3ZlcjpiZy1ncmF5LTcwMCd9XHJcbiAgICAgICAgICAgICAgYCwgXCJkYXRhLWN5XCI6IGBmcmFtZXdvcmstJHtmcmFtZXdvcmsuaWR9YCwgY2hpbGRyZW46IGZyYW1ld29yay5sYWJlbCB9LCBmcmFtZXdvcmsuaWQpKTtcbiAgICAgICAgICAgICAgICB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNCBnYXAtNCBtYi02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHAtNCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlRvdGFsIFZpb2xhdGlvbnNcIiB9KSwgX2pzeChTaGllbGQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1ibHVlLTUwMFwiIH0pXSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBzdGF0cz8udG90YWxWaW9sYXRpb25zID8/IDAgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiT3BlbiBWaW9sYXRpb25zXCIgfSksIF9qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1vcmFuZ2UtNTAwXCIgfSldIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHN0YXRzPy5vcGVuVmlvbGF0aW9ucyA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHAtNCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlJpc2sgU2NvcmVcIiB9KSwgX2pzeChUcmVuZGluZ1VwLCB7IGNsYXNzTmFtZTogXCJ3LTUgaC01IHRleHQtcmVkLTUwMFwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1lbmQgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHN0YXRzPy5jcml0aWNhbFZpb2xhdGlvbnMgPz8gMCB9KSwgX2pzeChCYWRnZSwgeyB2YXJpYW50OiAoc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwKSA+IDEwID8gJ2RhbmdlcicgOiAoc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwKSA+IDUgPyAnd2FybmluZycgOiAnc3VjY2VzcycsIGNoaWxkcmVuOiAoc3RhdHM/LmNyaXRpY2FsVmlvbGF0aW9ucyA/PyAwKSA+IDEwID8gJ0hpZ2gnIDogKHN0YXRzPy5jcml0aWNhbFZpb2xhdGlvbnMgPz8gMCkgPiA1ID8gJ01lZGl1bScgOiAnTG93JyB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgcC00IGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItMlwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTGFzdCBSZWZyZXNoXCIgfSksIF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1wdXJwbGUtNTAwXCIgfSldIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBsYXN0UmVmcmVzaCA/IG5ldyBEYXRlKGxhc3RSZWZyZXNoKS50b0xvY2FsZVN0cmluZygpIDogJ04vQScgfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBkYXNoYm9hcmREYXRhPy52aW9sYXRpb25zIHx8IFtdLCBjb2x1bW5zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnaWQnLCBoZWFkZXJOYW1lOiAnSUQnLCB3aWR0aDogMTAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc2V2ZXJpdHknLCBoZWFkZXJOYW1lOiAnU2V2ZXJpdHknLCB3aWR0aDogMTIwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdkZXNjcmlwdGlvbicsIGhlYWRlck5hbWU6ICdEZXNjcmlwdGlvbicsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgICAgICAgICAgICAgXSwgbG9hZGluZzogaXNMb2FkaW5nLCBlbmFibGVFeHBvcnQ6IHRydWUsIGVuYWJsZUdyb3VwaW5nOiB0cnVlLCBlbmFibGVGaWx0ZXJpbmc6IHRydWUsIFwiZGF0YS1jeVwiOiBcImNvbXBsaWFuY2UtZ3JpZFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY29tcGxpYW5jZS1ncmlkXCIgfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBDb21wbGlhbmNlRGFzaGJvYXJkVmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==