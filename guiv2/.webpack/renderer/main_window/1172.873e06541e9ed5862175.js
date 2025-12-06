"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1172],{

/***/ 11172:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ overview_OverviewView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/index.js
var dist = __webpack_require__(84976);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/lib/electron-api-fallback.ts
var electron_api_fallback = __webpack_require__(58350);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useDashboardLogic.ts
/**
 * useDashboardLogic Hook
 *
 * Manages dashboard data loading, auto-refresh, and real-time updates.
 * Integrates with Logic Engine via dashboard service APIs.
 *
 * Phase 5: Dashboard Frontend Implementation
 * Fixed: Added profileName parameter to dashboard method calls
 */



/**
 * Dashboard logic hook with auto-refresh
 *
 * Features:
 * - Loads all dashboard data on mount
 * - Auto-refreshes every 30 seconds
 * - Handles errors gracefully
 * - Provides manual reload function
 * - Alert acknowledgment
 *
 * @returns Dashboard state and actions
 */
const useDashboardLogic = () => {
    const [stats, setStats] = (0,react.useState)(null);
    const [project, setProject] = (0,react.useState)(null);
    const [health, setHealth] = (0,react.useState)(null);
    const [activity, setActivity] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(true);
    const [error, setError] = (0,react.useState)(null);
    // Subscribe to profile changes
    const selectedSourceProfile = (0,useProfileStore/* useProfileStore */.K)(state => state.selectedSourceProfile);
    /**
     * Load all dashboard data from backend services
     */
    const loadDashboardData = (0,react.useCallback)(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Get current profile name from the hook subscription
            console.log('[useDashboardLogic] selectedSourceProfile:', selectedSourceProfile);
            if (!selectedSourceProfile) {
                setError('No active profile selected');
                setIsLoading(false);
                return;
            }
            const profileName = selectedSourceProfile.companyName;
            console.log('[useDashboardLogic] profileName extracted:', profileName);
            // Get electronAPI with fallback
            const electronAPI = (0,electron_api_fallback/* getElectronAPI */.d)();
            // Parallel fetch all dashboard components (pass profileName to methods that require it)
            const [statsResult, projectResult, healthResult, activityResult] = await Promise.all([
                electronAPI.dashboard.getStats(profileName),
                electronAPI.dashboard.getProjectTimeline(profileName),
                electronAPI.dashboard.getSystemHealth(),
                electronAPI.dashboard.getRecentActivity(profileName, 10)
            ]);
            // Update state with fetched data
            setStats(statsResult?.success ? statsResult.data : statsResult);
            setProject(projectResult?.success ? projectResult.data : projectResult);
            setHealth(healthResult?.success ? healthResult.data : healthResult);
            // Handle activityResult which can be array or response object
            if (Array.isArray(activityResult)) {
                setActivity(activityResult);
            }
            else if (activityResult && typeof activityResult === 'object' && 'success' in activityResult) {
                setActivity(activityResult.success ? activityResult.data : []);
            }
            else {
                setActivity([]);
            }
        }
        catch (err) {
            const errorMessage = err?.message || 'Failed to load dashboard data';
            setError(errorMessage);
            console.error('Dashboard load error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedSourceProfile]);
    /**
     * Acknowledge a system alert
     */
    const acknowledgeAlert = (0,react.useCallback)(async (alertId) => {
        try {
            const electronAPI = (0,electron_api_fallback/* getElectronAPI */.d)();
            await electronAPI.dashboard.acknowledgeAlert(alertId);
            // Refresh health data to update alert list
            await loadDashboardData();
        }
        catch (err) {
            console.error('Failed to acknowledge alert:', err);
        }
    }, [loadDashboardData]);
    /**
     * Initial load and auto-refresh setup
     * Wait for profile to be available before loading dashboard data
     */
    (0,react.useEffect)(() => {
        // Only load if we have a profile
        if (!selectedSourceProfile) {
            console.log('[useDashboardLogic] Waiting for profile to be selected...');
            return;
        }
        console.log('[useDashboardLogic] Profile available, loading dashboard data...');
        // Initial load
        loadDashboardData();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData();
        }, 30000);
        return () => clearInterval(interval);
    }, [selectedSourceProfile, loadDashboardData]); // Reload when profile changes
    return {
        stats,
        project,
        health,
        activity,
        isLoading,
        error,
        reload: loadDashboardData,
        acknowledgeAlert
    };
};
/* harmony default export */ const hooks_useDashboardLogic = ((/* unused pure expression or super */ null && (useDashboardLogic)));

// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
;// ./src/renderer/components/atoms/ModernCard.tsx

/**
 * ModernCard Component
 *
 * Modern card container with gradient backgrounds, neon shadows, and hover effects.
 *
 * Epic 0: UI/UX Parity - Replaces WPF ModernCardStyle
 * Features gradient backgrounds, border animations, and scale transforms.
 *
 * @component
 * @example
 * ```tsx
 * <ModernCard>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </ModernCard>
 *
 * <ModernCard hoverable={false} variant="metric">
 *   <MetricDisplay value={1234} label="Total Users" />
 * </ModernCard>
 * ```
 */


/**
 * ModernCard Component
 *
 * Replicates WPF ModernCardStyle with gradient backgrounds and neon effects.
 * Uses design system from Epic 0 architecture.
 */
const ModernCard = react.memo(({ children, variant = 'default', hoverable = true, header, footer, onClick, className, 'data-cy': dataCy, }) => {
    // Variant-specific classes
    const variantClasses = {
        default: (0,clsx/* clsx */.$)('modern-card', hoverable && 'hover:scale-[1.01]'),
        metric: (0,clsx/* clsx */.$)('metric-card'),
        section: (0,clsx/* clsx */.$)('section-border'),
        glass: (0,clsx/* clsx */.$)('glass-card', 'p-5 m-2', hoverable && 'hover:scale-[1.01] hover:shadow-card-hover'),
    };
    const cardClasses = (0,clsx/* clsx */.$)(variantClasses[variant], onClick && 'cursor-pointer', className);
    return ((0,jsx_runtime.jsxs)("div", { className: cardClasses, onClick: onClick, "data-cy": dataCy, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onKeyDown: onClick ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
            }
        } : undefined, children: [header && ((0,jsx_runtime.jsx)("div", { className: "mb-4 pb-4 border-b border-[var(--border)]", children: header })), (0,jsx_runtime.jsx)("div", { className: "card-content", children: children }), footer && ((0,jsx_runtime.jsx)("div", { className: "mt-4 pt-4 border-t border-[var(--border)]", children: footer }))] }));
});
ModernCard.displayName = 'ModernCard';
/* harmony default export */ const atoms_ModernCard = ((/* unused pure expression or super */ null && (ModernCard)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
;// ./src/renderer/components/molecules/ProjectTimelineCard.tsx

/**
 * ProjectTimelineCard Component
 *
 * Displays project timeline, wave progress, and cutover countdown.
 * Shows current phase, days to milestones, and overall progress.
 *
 * Phase 6: Dashboard UI Components
 */




/**
 * Get badge variant based on project phase
 */
const getPhaseVariant = (phase) => {
    switch (phase) {
        case 'Complete':
            return 'success';
        case 'Migration':
        case 'Cutover':
            return 'warning';
        case 'Planning':
        case 'Discovery':
            return 'info';
        case 'Validation':
            return 'primary';
        default:
            return 'default';
    }
};
/**
 * ProjectTimelineCard Component
 *
 * Comprehensive project timeline display with:
 * - Project name and current phase
 * - Countdown to cutover and next wave
 * - Wave completion progress
 * - Overall progress bar
 */
const ProjectTimelineCard = ({ project, className }) => {
    const progressPercentage = project.totalWaves > 0
        ? Math.round((project.completedWaves / project.totalWaves) * 100)
        : 0;
    // Safely display numeric values, defaulting to '--' for NaN/undefined
    const displayDays = (value) => {
        if (value === undefined || value === null || isNaN(value))
            return '--';
        return String(value);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-start mb-6", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h2", { className: "text-2xl font-bold text-[var(--text-primary)] mb-2", children: project.projectName }), (0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: getPhaseVariant(project.currentPhase), size: "md", children: project.currentPhase })] }), (0,jsx_runtime.jsx)("div", { className: "text-right", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm text-[var(--text-secondary)]", children: [(0,jsx_runtime.jsx)(lucide_react/* Target */.DTr, { className: "w-4 h-4" }), (0,jsx_runtime.jsxs)("span", { children: ["Target: ", formatDate(project.targetCutover)] })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 gap-6 mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsx)("div", { className: "text-4xl font-bold text-[var(--accent-primary)] mb-1", children: displayDays(project.daysToCutover) }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react/* Calendar */.VvS, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Days to Cutover" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsx)("div", { className: "text-4xl font-bold text-[var(--warning)] mb-1", children: displayDays(project.daysToNextWave) }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react/* Clock */.zD7, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Days to Next Wave" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsxs)("div", { className: "text-4xl font-bold text-[var(--success)] mb-1", children: [project.completedWaves, "/", project.totalWaves] }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react/* TrendingUp */.ntg, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Waves Completed" })] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-sm", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "Overall Progress" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [progressPercentage, "%"] })] }), (0,jsx_runtime.jsx)("div", { className: "w-full bg-[var(--card-bg-secondary)] rounded-full h-3", children: (0,jsx_runtime.jsx)("div", { className: "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full h-3 transition-all duration-500 ease-out", style: { width: `${progressPercentage}%` }, role: "progressbar", "aria-valuenow": progressPercentage, "aria-valuemin": 0, "aria-valuemax": 100 }) })] }), project.projectDescription && ((0,jsx_runtime.jsx)("div", { className: "mt-4 pt-4 border-t border-[var(--border)]", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)]", children: project.projectDescription }) }))] }));
};
/* harmony default export */ const molecules_ProjectTimelineCard = ((/* unused pure expression or super */ null && (ProjectTimelineCard)));

;// ./src/renderer/components/molecules/StatisticsCard.tsx

/**
 * StatisticsCard Component
 *
 * Clickable card displaying entity statistics with discovered/migrated breakdown.
 * Used for dashboard overview metrics (Users, Groups, Computers, etc.)
 *
 * Phase 6: Dashboard UI Components
 */



/**
 * StatisticsCard Component
 *
 * Interactive statistics display with:
 * - Large value display
 * - Optional icon
 * - Discovered/migrated breakdown
 * - Hover effects for navigation
 */
const StatisticsCard = ({ title, value, discovered, migrated, icon, onClick, className, 'data-cy': dataCy, }) => {
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: (0,clsx/* clsx */.$)('transition-all duration-200', onClick && 'cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg', className), onClick: onClick, "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex-1", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)] mb-1 uppercase tracking-wide", children: title }), (0,jsx_runtime.jsx)("p", { className: "text-4xl font-bold text-[var(--text-primary)] mt-2", children: (value ?? 0).toLocaleString() })] }), icon && ((0,jsx_runtime.jsx)("div", { className: "text-[var(--accent-primary)] opacity-80", children: icon }))] }), (discovered !== undefined || migrated !== undefined) && ((0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]", children: [discovered !== undefined && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1", children: "Discovered" }), (0,jsx_runtime.jsx)("p", { className: "text-lg font-semibold text-[var(--info)]", children: (discovered ?? 0).toLocaleString() })] })), migrated !== undefined && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1", children: "Migrated" }), (0,jsx_runtime.jsx)("p", { className: "text-lg font-semibold text-[var(--success)]", children: (migrated ?? 0).toLocaleString() })] }))] })), onClick && ((0,jsx_runtime.jsx)("div", { className: "mt-3 text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity", children: "Click to view details \u2192" }))] }));
};
/* harmony default export */ const molecules_StatisticsCard = ((/* unused pure expression or super */ null && (StatisticsCard)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/StatusIndicator.tsx
var StatusIndicator = __webpack_require__(25119);
;// ./src/renderer/components/molecules/SystemHealthPanel.tsx

/**
 * SystemHealthPanel Component
 *
 * Displays system health status for Logic Engine, PowerShell, and other services.
 * Shows service status indicators, data freshness, and recent errors.
 *
 * Phase 6: Dashboard UI Components
 */




/**
 * Get status type for StatusIndicator based on service status
 */
const getStatusType = (status) => {
    switch (status) {
        case 'online':
            return 'success';
        case 'degraded':
            return 'warning';
        case 'offline':
        case 'unknown':
            return 'error';
    }
};
/**
 * Get icon for service status
 */
const getStatusIcon = (status) => {
    switch (status) {
        case 'online':
            return _jsx(CheckCircle, { className: "w-4 h-4" });
        case 'degraded':
            return _jsx(AlertCircle, { className: "w-4 h-4" });
        case 'offline':
        case 'unknown':
            return _jsx(XCircle, { className: "w-4 h-4" });
    }
};
/**
 * Format data freshness time
 */
const formatFreshness = (minutes) => {
    if (minutes < 1)
        return 'Just now';
    if (minutes < 60)
        return `${Math.round(minutes)}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
};
/**
 * SystemHealthPanel Component
 *
 * Comprehensive system health monitoring with:
 * - Service status indicators
 * - Data freshness tracking
 * - Error count display
 * - Performance metrics (optional)
 */
const SystemHealthPanel = ({ health, className }) => {
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-[var(--text-primary)] mb-4", children: "System Health" }), (0,jsx_runtime.jsxs)("div", { className: "space-y-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Logic Engine" }), (0,jsx_runtime.jsx)(StatusIndicator/* StatusIndicator */.k, { status: getStatusType(health?.logicEngineStatus?.status || 'unknown'), text: health?.logicEngineStatus?.status || 'unknown', size: "sm", animate: health?.logicEngineStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "PowerShell" }), (0,jsx_runtime.jsx)(StatusIndicator/* StatusIndicator */.k, { status: getStatusType(health?.powerShellStatus?.status || 'unknown'), text: health?.powerShellStatus?.status || 'unknown', size: "sm", animate: health?.powerShellStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "File System" }), (0,jsx_runtime.jsx)(StatusIndicator/* StatusIndicator */.k, { status: getStatusType(health?.fileSystemStatus?.status || 'unknown'), text: health?.fileSystemStatus?.status || 'unknown', size: "sm", animate: health?.fileSystemStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Network" }), (0,jsx_runtime.jsx)(StatusIndicator/* StatusIndicator */.k, { status: getStatusType(health?.networkStatus?.status || 'unknown'), text: health?.networkStatus?.status || 'unknown', size: "sm", animate: health?.networkStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors mt-4 pt-4 border-t border-[var(--border)]", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* Clock */.zD7, { className: "w-4 h-4 text-[var(--text-secondary)]" }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Data Freshness" })] }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-[var(--text-primary)]", children: formatFreshness(health?.dataFreshnessMinutes || 0) })] }), (health?.lastErrorCount || 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* AlertCircle */.RIJ, { className: "w-4 h-4 text-[var(--danger)]" }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--danger)] font-medium", children: "Recent Errors" })] }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-bold text-[var(--danger)]", children: health?.lastErrorCount || 0 })] })), health?.memoryUsageMB && ((0,jsx_runtime.jsxs)("div", { className: "mt-3 pt-3 border-t border-[var(--border)] space-y-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-xs", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "Memory Usage" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [health.memoryUsageMB.toFixed(0), " MB"] })] }), health?.cpuUsagePercent !== undefined && ((0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-xs", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "CPU Usage" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [health.cpuUsagePercent.toFixed(1), "%"] })] }))] }))] })] }));
};
/* harmony default export */ const molecules_SystemHealthPanel = ((/* unused pure expression or super */ null && (SystemHealthPanel)));

;// ./src/renderer/components/molecules/RecentActivityFeed.tsx

/**
 * RecentActivityFeed Component
 *
 * Displays recent system activity with icons, timestamps, and descriptions.
 * Shows discovery runs, migration events, errors, and configuration changes.
 *
 * Phase 6: Dashboard UI Components
 */




/**
 * Get icon component based on activity type
 */
const getActivityIcon = (type, status) => {
    // Status-based icons
    if (status === 'error') {
        return (0,jsx_runtime.jsx)(lucide_react/* AlertCircle */.RIJ, { className: "w-4 h-4 text-[var(--danger)]" });
    }
    if (status === 'warning') {
        return (0,jsx_runtime.jsx)(lucide_react/* AlertTriangle */.hcu, { className: "w-4 h-4 text-[var(--warning)]" });
    }
    if (status === 'success') {
        return (0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-[var(--success)]" });
    }
    // Type-based icons
    switch (type) {
        case 'discovery':
            return (0,jsx_runtime.jsx)(lucide_react/* Search */.vji, { className: "w-4 h-4 text-[var(--info)]" });
        case 'migration':
            return (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4 text-[var(--accent-primary)]" });
        case 'configuration':
            return (0,jsx_runtime.jsx)(lucide_react/* Settings */.wB_, { className: "w-4 h-4 text-[var(--text-secondary)]" });
        case 'validation':
            return (0,jsx_runtime.jsx)(lucide_react/* CheckCircle */.rAV, { className: "w-4 h-4 text-[var(--success)]" });
        default:
            return (0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-4 h-4 text-[var(--text-secondary)]" });
    }
};
/**
 * Get background color based on status
 */
const getStatusBgColor = (status) => {
    switch (status) {
        case 'error':
            return 'bg-[var(--danger)]/10';
        case 'warning':
            return 'bg-[var(--warning)]/10';
        case 'success':
            return 'bg-[var(--success)]/10';
        case 'info':
            return 'bg-[var(--info)]/10';
        default:
            return 'bg-[var(--card-bg-secondary)]';
    }
};
/**
 * Format timestamp to relative time
 */
const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};
/**
 * RecentActivityFeed Component
 *
 * Activity feed with:
 * - Type-based icons
 * - Status indicators
 * - Relative timestamps
 * - Entity counts
 * - Empty state handling
 */
const RecentActivityFeed = ({ activities, className, maxItems = 10 }) => {
    const displayActivities = activities.slice(0, maxItems);
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-[var(--text-primary)] mb-4", children: "Recent Activity" }), (0,jsx_runtime.jsx)("div", { className: "space-y-2", children: displayActivities.length === 0 ? (
                /* Empty State */
                (0,jsx_runtime.jsxs)("div", { className: "text-center py-8", children: [(0,jsx_runtime.jsx)(lucide_react/* Activity */.Ilq, { className: "w-12 h-12 text-[var(--text-secondary)] opacity-30 mx-auto mb-3" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)]", children: "No recent activity" })] })) : (
                /* Activity List */
                displayActivities.map((activity, index) => ((0,jsx_runtime.jsxs)("div", { className: (0,clsx/* clsx */.$)('flex items-start gap-3 p-3 rounded-lg', 'transition-colors duration-150', 'hover:bg-[var(--card-bg-secondary)]', getStatusBgColor(activity.status), index !== displayActivities.length - 1 && 'border-b border-[var(--border)]'), children: [(0,jsx_runtime.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: getActivityIcon(activity.type, activity.status) }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-[var(--text-primary)] truncate", children: activity.title }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] mt-1", children: activity.description }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mt-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-xs text-[var(--text-secondary)]", children: formatTimestamp(activity.timestamp) }), activity.entityCount !== undefined && ((0,jsx_runtime.jsxs)("span", { className: "text-xs text-[var(--accent-primary)] font-medium", children: [activity.entityCount.toLocaleString(), " items"] })), activity.user && ((0,jsx_runtime.jsxs)("span", { className: "text-xs text-[var(--text-secondary)]", children: ["by ", activity.user] }))] })] })] }, activity.id)))) }), activities.length > maxItems && ((0,jsx_runtime.jsx)("div", { className: "mt-4 pt-3 border-t border-[var(--border)] text-center", children: (0,jsx_runtime.jsxs)("button", { className: "text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors", onClick: () => { }, children: ["View all ", activities.length, " activities \u2192"] }) }))] }));
};
/* harmony default export */ const molecules_RecentActivityFeed = ((/* unused pure expression or super */ null && (RecentActivityFeed)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
;// ./src/renderer/components/molecules/QuickActionsPanel.tsx

/**
 * QuickActionsPanel Component
 *
 * Provides quick navigation buttons for common tasks.
 * Includes Start Discovery, Run Migration, View Reports, and Settings.
 *
 * Phase 6: Dashboard UI Components
 */





/**
 * QuickActionsPanel Component
 *
 * Quick action buttons for:
 * - Starting discovery
 * - Running migrations
 * - Viewing reports
 * - Accessing settings
 * - Navigating to key views
 */
const QuickActionsPanel = ({ className }) => {
    const navigate = (0,dist.useNavigate)();
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-[var(--text-primary)] mb-4", children: "Quick Actions" }), (0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "primary", className: "w-full justify-start", onClick: () => navigate('/discovery'), children: [(0,jsx_runtime.jsx)(lucide_react/* Play */.jGG, { className: "w-4 h-4 mr-2" }), "Start Discovery"] }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/migration'), children: [(0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4 mr-2" }), "Run Migration"] }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/users'), children: [(0,jsx_runtime.jsx)(lucide_react/* Users */.zWC, { className: "w-4 h-4 mr-2" }), "View Users"] }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/reports'), children: [(0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-4 h-4 mr-2" }), "View Reports"] }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/settings'), children: [(0,jsx_runtime.jsx)(lucide_react/* Settings */.wB_, { className: "w-4 h-4 mr-2" }), "Settings"] })] })] }));
};
/* harmony default export */ const molecules_QuickActionsPanel = ((/* unused pure expression or super */ null && (QuickActionsPanel)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/Spinner.tsx
var Spinner = __webpack_require__(28709);
;// ./src/renderer/views/overview/OverviewView.tsx

/**
 * OverviewView Component
 *
 * Dashboard overview with real Logic Engine data integration.
 * Displays project timeline, statistics, system health, and recent activity.
 *
 * Phase 7: Complete Dashboard Implementation
 */











/**
 * OverviewView Component
 *
 * Complete dashboard implementation with:
 * - Real-time data from Logic Engine
 * - Auto-refresh every 30 seconds
 * - Clickable navigation cards
 * - System health monitoring
 * - Recent activity feed
 * - Quick action shortcuts
 */
const OverviewView = () => {
    const { stats, project, health, activity, isLoading, error, reload } = useDashboardLogic();
    const navigate = (0,dist.useNavigate)();
    // Loading state
    if (isLoading && !stats) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)(Spinner/* Spinner */.y, { size: "lg", className: "mx-auto mb-4" }), (0,jsx_runtime.jsx)("p", { className: "text-[var(--text-secondary)]", children: "Loading dashboard..." })] }) }));
    }
    // Error state
    if (error && !stats) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center max-w-md", children: [(0,jsx_runtime.jsx)(lucide_react/* AlertCircle */.RIJ, { className: "w-16 h-16 text-[var(--danger)] mx-auto mb-4" }), (0,jsx_runtime.jsx)("h2", { className: "text-xl font-semibold text-[var(--text-primary)] mb-2", children: "Failed to Load Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-[var(--danger)] mb-6", children: error }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: reload, variant: "primary", children: [(0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4 mr-2" }), "Retry"] })] }) }));
    }
    // No data state
    if (!stats || !project) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)("p", { className: "text-[var(--text-secondary)] mb-4", children: "No data available" }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: reload, variant: "secondary", children: [(0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4 mr-2" }), "Refresh"] })] }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "p-6 space-y-6 overflow-auto", "data-testid": "overview-view", "data-cy": "overview-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-[var(--text-primary)]", children: "Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)] mt-1", children: "M&A Discovery Suite Overview" })] }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: reload, variant: "secondary", size: "sm", disabled: isLoading, children: [(0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] })] }), (0,jsx_runtime.jsx)(ProjectTimelineCard, { project: project }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [(0,jsx_runtime.jsx)(StatisticsCard, { title: "Users", value: stats?.totalUsers || 0, discovered: stats?.discoveredUsers, migrated: stats?.migratedUsers, icon: (0,jsx_runtime.jsx)(lucide_react/* Users */.zWC, { className: "w-6 h-6" }), onClick: () => navigate('/users'), "data-cy": "stats-users", "data-testid": "stats-users" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Groups", value: stats?.totalGroups || 0, discovered: stats?.discoveredGroups, migrated: stats?.migratedGroups, icon: (0,jsx_runtime.jsx)(lucide_react/* Layers */.zgK, { className: "w-6 h-6" }), onClick: () => navigate('/groups'), "data-cy": "stats-groups", "data-testid": "stats-groups" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Computers", value: stats?.totalComputers || 0, discovered: stats?.discoveredComputers, icon: (0,jsx_runtime.jsx)(lucide_react/* Monitor */.VAG, { className: "w-6 h-6" }), onClick: () => navigate('/computers'), "data-cy": "stats-computers", "data-testid": "stats-computers" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Infrastructure", value: stats?.totalInfrastructure || 0, icon: (0,jsx_runtime.jsx)(lucide_react/* Server */.gq4, { className: "w-6 h-6" }), onClick: () => navigate('/infrastructure'), "data-cy": "stats-infrastructure", "data-testid": "stats-infrastructure" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0,jsx_runtime.jsx)("div", { className: "lg:col-span-2", children: (0,jsx_runtime.jsx)(RecentActivityFeed, { activities: activity }) }), (0,jsx_runtime.jsxs)("div", { className: "space-y-6", children: [health && (0,jsx_runtime.jsx)(SystemHealthPanel, { health: health }), (0,jsx_runtime.jsx)(QuickActionsPanel, {})] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]", children: ["Last updated: ", new Date((stats?.lastDataRefresh ?? 0)).toLocaleString(), " | Data source: ", stats?.dataSource ?? 0] })] }));
};
/* harmony default export */ const overview_OverviewView = (OverviewView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLG1EQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksdURBQUssV0FBVyw0RkFBNEYsc0RBQUksV0FBVyxXQUFXLG1EQUFJLG9GQUFvRixJQUFJLHNEQUFJLFdBQVcsb0JBQW9CLHlDQUF5QyxzREFBSSxXQUFXLFdBQVcsbURBQUksb0ZBQW9GLDhCQUE4QixzREFBSSxhQUFhLDhDQUE4QyxtREFBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLG1EQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlRGFzaGJvYXJkTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9Nb2Rlcm5DYXJkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9Qcm9qZWN0VGltZWxpbmVDYXJkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9TdGF0aXN0aWNzQ2FyZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU3lzdGVtSGVhbHRoUGFuZWwudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1JlY2VudEFjdGl2aXR5RmVlZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUXVpY2tBY3Rpb25zUGFuZWwudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL3ZpZXdzL292ZXJ2aWV3L092ZXJ2aWV3Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB1c2VEYXNoYm9hcmRMb2dpYyBIb29rXG4gKlxuICogTWFuYWdlcyBkYXNoYm9hcmQgZGF0YSBsb2FkaW5nLCBhdXRvLXJlZnJlc2gsIGFuZCByZWFsLXRpbWUgdXBkYXRlcy5cbiAqIEludGVncmF0ZXMgd2l0aCBMb2dpYyBFbmdpbmUgdmlhIGRhc2hib2FyZCBzZXJ2aWNlIEFQSXMuXG4gKlxuICogUGhhc2UgNTogRGFzaGJvYXJkIEZyb250ZW5kIEltcGxlbWVudGF0aW9uXG4gKiBGaXhlZDogQWRkZWQgcHJvZmlsZU5hbWUgcGFyYW1ldGVyIHRvIGRhc2hib2FyZCBtZXRob2QgY2FsbHNcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBnZXRFbGVjdHJvbkFQSSB9IGZyb20gJy4uL2xpYi9lbGVjdHJvbi1hcGktZmFsbGJhY2snO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbi8qKlxuICogRGFzaGJvYXJkIGxvZ2ljIGhvb2sgd2l0aCBhdXRvLXJlZnJlc2hcbiAqXG4gKiBGZWF0dXJlczpcbiAqIC0gTG9hZHMgYWxsIGRhc2hib2FyZCBkYXRhIG9uIG1vdW50XG4gKiAtIEF1dG8tcmVmcmVzaGVzIGV2ZXJ5IDMwIHNlY29uZHNcbiAqIC0gSGFuZGxlcyBlcnJvcnMgZ3JhY2VmdWxseVxuICogLSBQcm92aWRlcyBtYW51YWwgcmVsb2FkIGZ1bmN0aW9uXG4gKiAtIEFsZXJ0IGFja25vd2xlZGdtZW50XG4gKlxuICogQHJldHVybnMgRGFzaGJvYXJkIHN0YXRlIGFuZCBhY3Rpb25zXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VEYXNoYm9hcmRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbc3RhdHMsIHNldFN0YXRzXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtwcm9qZWN0LCBzZXRQcm9qZWN0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtoZWFsdGgsIHNldEhlYWx0aF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbYWN0aXZpdHksIHNldEFjdGl2aXR5XSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBTdWJzY3JpYmUgdG8gcHJvZmlsZSBjaGFuZ2VzXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKHN0YXRlID0+IHN0YXRlLnNlbGVjdGVkU291cmNlUHJvZmlsZSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhbGwgZGFzaGJvYXJkIGRhdGEgZnJvbSBiYWNrZW5kIHNlcnZpY2VzXG4gICAgICovXG4gICAgY29uc3QgbG9hZERhc2hib2FyZERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIC8vIEdldCBjdXJyZW50IHByb2ZpbGUgbmFtZSBmcm9tIHRoZSBob29rIHN1YnNjcmlwdGlvblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VEYXNoYm9hcmRMb2dpY10gc2VsZWN0ZWRTb3VyY2VQcm9maWxlOicsIHNlbGVjdGVkU291cmNlUHJvZmlsZSk7XG4gICAgICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKCdObyBhY3RpdmUgcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZU5hbWUgPSBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZURhc2hib2FyZExvZ2ljXSBwcm9maWxlTmFtZSBleHRyYWN0ZWQ6JywgcHJvZmlsZU5hbWUpO1xuICAgICAgICAgICAgLy8gR2V0IGVsZWN0cm9uQVBJIHdpdGggZmFsbGJhY2tcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIC8vIFBhcmFsbGVsIGZldGNoIGFsbCBkYXNoYm9hcmQgY29tcG9uZW50cyAocGFzcyBwcm9maWxlTmFtZSB0byBtZXRob2RzIHRoYXQgcmVxdWlyZSBpdClcbiAgICAgICAgICAgIGNvbnN0IFtzdGF0c1Jlc3VsdCwgcHJvamVjdFJlc3VsdCwgaGVhbHRoUmVzdWx0LCBhY3Rpdml0eVJlc3VsdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgZWxlY3Ryb25BUEkuZGFzaGJvYXJkLmdldFN0YXRzKHByb2ZpbGVOYW1lKSxcbiAgICAgICAgICAgICAgICBlbGVjdHJvbkFQSS5kYXNoYm9hcmQuZ2V0UHJvamVjdFRpbWVsaW5lKHByb2ZpbGVOYW1lKSxcbiAgICAgICAgICAgICAgICBlbGVjdHJvbkFQSS5kYXNoYm9hcmQuZ2V0U3lzdGVtSGVhbHRoKCksXG4gICAgICAgICAgICAgICAgZWxlY3Ryb25BUEkuZGFzaGJvYXJkLmdldFJlY2VudEFjdGl2aXR5KHByb2ZpbGVOYW1lLCAxMClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIHN0YXRlIHdpdGggZmV0Y2hlZCBkYXRhXG4gICAgICAgICAgICBzZXRTdGF0cyhzdGF0c1Jlc3VsdD8uc3VjY2VzcyA/IHN0YXRzUmVzdWx0LmRhdGEgOiBzdGF0c1Jlc3VsdCk7XG4gICAgICAgICAgICBzZXRQcm9qZWN0KHByb2plY3RSZXN1bHQ/LnN1Y2Nlc3MgPyBwcm9qZWN0UmVzdWx0LmRhdGEgOiBwcm9qZWN0UmVzdWx0KTtcbiAgICAgICAgICAgIHNldEhlYWx0aChoZWFsdGhSZXN1bHQ/LnN1Y2Nlc3MgPyBoZWFsdGhSZXN1bHQuZGF0YSA6IGhlYWx0aFJlc3VsdCk7XG4gICAgICAgICAgICAvLyBIYW5kbGUgYWN0aXZpdHlSZXN1bHQgd2hpY2ggY2FuIGJlIGFycmF5IG9yIHJlc3BvbnNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYWN0aXZpdHlSZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgc2V0QWN0aXZpdHkoYWN0aXZpdHlSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYWN0aXZpdHlSZXN1bHQgJiYgdHlwZW9mIGFjdGl2aXR5UmVzdWx0ID09PSAnb2JqZWN0JyAmJiAnc3VjY2VzcycgaW4gYWN0aXZpdHlSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBzZXRBY3Rpdml0eShhY3Rpdml0eVJlc3VsdC5zdWNjZXNzID8gYWN0aXZpdHlSZXN1bHQuZGF0YSA6IFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEFjdGl2aXR5KFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnI/Lm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIGRhc2hib2FyZCBkYXRhJztcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdEYXNoYm9hcmQgbG9hZCBlcnJvcjonLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGVdKTtcbiAgICAvKipcbiAgICAgKiBBY2tub3dsZWRnZSBhIHN5c3RlbSBhbGVydFxuICAgICAqL1xuICAgIGNvbnN0IGFja25vd2xlZGdlQWxlcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoYWxlcnRJZCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZWxlY3Ryb25BUEkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICAgICAgYXdhaXQgZWxlY3Ryb25BUEkuZGFzaGJvYXJkLmFja25vd2xlZGdlQWxlcnQoYWxlcnRJZCk7XG4gICAgICAgICAgICAvLyBSZWZyZXNoIGhlYWx0aCBkYXRhIHRvIHVwZGF0ZSBhbGVydCBsaXN0XG4gICAgICAgICAgICBhd2FpdCBsb2FkRGFzaGJvYXJkRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBhY2tub3dsZWRnZSBhbGVydDonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfSwgW2xvYWREYXNoYm9hcmREYXRhXSk7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbCBsb2FkIGFuZCBhdXRvLXJlZnJlc2ggc2V0dXBcbiAgICAgKiBXYWl0IGZvciBwcm9maWxlIHRvIGJlIGF2YWlsYWJsZSBiZWZvcmUgbG9hZGluZyBkYXNoYm9hcmQgZGF0YVxuICAgICAqL1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIC8vIE9ubHkgbG9hZCBpZiB3ZSBoYXZlIGEgcHJvZmlsZVxuICAgICAgICBpZiAoIXNlbGVjdGVkU291cmNlUHJvZmlsZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VEYXNoYm9hcmRMb2dpY10gV2FpdGluZyBmb3IgcHJvZmlsZSB0byBiZSBzZWxlY3RlZC4uLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdbdXNlRGFzaGJvYXJkTG9naWNdIFByb2ZpbGUgYXZhaWxhYmxlLCBsb2FkaW5nIGRhc2hib2FyZCBkYXRhLi4uJyk7XG4gICAgICAgIC8vIEluaXRpYWwgbG9hZFxuICAgICAgICBsb2FkRGFzaGJvYXJkRGF0YSgpO1xuICAgICAgICAvLyBBdXRvLXJlZnJlc2ggZXZlcnkgMzAgc2Vjb25kc1xuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGxvYWREYXNoYm9hcmREYXRhKCk7XG4gICAgICAgIH0sIDMwMDAwKTtcbiAgICAgICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGxvYWREYXNoYm9hcmREYXRhXSk7IC8vIFJlbG9hZCB3aGVuIHByb2ZpbGUgY2hhbmdlc1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRzLFxuICAgICAgICBwcm9qZWN0LFxuICAgICAgICBoZWFsdGgsXG4gICAgICAgIGFjdGl2aXR5LFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICByZWxvYWQ6IGxvYWREYXNoYm9hcmREYXRhLFxuICAgICAgICBhY2tub3dsZWRnZUFsZXJ0XG4gICAgfTtcbn07XG5leHBvcnQgZGVmYXVsdCB1c2VEYXNoYm9hcmRMb2dpYztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE1vZGVybkNhcmQgQ29tcG9uZW50XG4gKlxuICogTW9kZXJuIGNhcmQgY29udGFpbmVyIHdpdGggZ3JhZGllbnQgYmFja2dyb3VuZHMsIG5lb24gc2hhZG93cywgYW5kIGhvdmVyIGVmZmVjdHMuXG4gKlxuICogRXBpYyAwOiBVSS9VWCBQYXJpdHkgLSBSZXBsYWNlcyBXUEYgTW9kZXJuQ2FyZFN0eWxlXG4gKiBGZWF0dXJlcyBncmFkaWVudCBiYWNrZ3JvdW5kcywgYm9yZGVyIGFuaW1hdGlvbnMsIGFuZCBzY2FsZSB0cmFuc2Zvcm1zLlxuICpcbiAqIEBjb21wb25lbnRcbiAqIEBleGFtcGxlXG4gKiBgYGB0c3hcbiAqIDxNb2Rlcm5DYXJkPlxuICogICA8aDI+Q2FyZCBUaXRsZTwvaDI+XG4gKiAgIDxwPkNhcmQgY29udGVudDwvcD5cbiAqIDwvTW9kZXJuQ2FyZD5cbiAqXG4gKiA8TW9kZXJuQ2FyZCBob3ZlcmFibGU9e2ZhbHNlfSB2YXJpYW50PVwibWV0cmljXCI+XG4gKiAgIDxNZXRyaWNEaXNwbGF5IHZhbHVlPXsxMjM0fSBsYWJlbD1cIlRvdGFsIFVzZXJzXCIgLz5cbiAqIDwvTW9kZXJuQ2FyZD5cbiAqIGBgYFxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBNb2Rlcm5DYXJkIENvbXBvbmVudFxuICpcbiAqIFJlcGxpY2F0ZXMgV1BGIE1vZGVybkNhcmRTdHlsZSB3aXRoIGdyYWRpZW50IGJhY2tncm91bmRzIGFuZCBuZW9uIGVmZmVjdHMuXG4gKiBVc2VzIGRlc2lnbiBzeXN0ZW0gZnJvbSBFcGljIDAgYXJjaGl0ZWN0dXJlLlxuICovXG5leHBvcnQgY29uc3QgTW9kZXJuQ2FyZCA9IFJlYWN0Lm1lbW8oKHsgY2hpbGRyZW4sIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGhvdmVyYWJsZSA9IHRydWUsIGhlYWRlciwgZm9vdGVyLCBvbkNsaWNrLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudC1zcGVjaWZpYyBjbGFzc2VzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6IGNsc3goJ21vZGVybi1jYXJkJywgaG92ZXJhYmxlICYmICdob3ZlcjpzY2FsZS1bMS4wMV0nKSxcbiAgICAgICAgbWV0cmljOiBjbHN4KCdtZXRyaWMtY2FyZCcpLFxuICAgICAgICBzZWN0aW9uOiBjbHN4KCdzZWN0aW9uLWJvcmRlcicpLFxuICAgICAgICBnbGFzczogY2xzeCgnZ2xhc3MtY2FyZCcsICdwLTUgbS0yJywgaG92ZXJhYmxlICYmICdob3ZlcjpzY2FsZS1bMS4wMV0gaG92ZXI6c2hhZG93LWNhcmQtaG92ZXInKSxcbiAgICB9O1xuICAgIGNvbnN0IGNhcmRDbGFzc2VzID0gY2xzeCh2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgb25DbGljayAmJiAnY3Vyc29yLXBvaW50ZXInLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNhcmRDbGFzc2VzLCBvbkNsaWNrOiBvbkNsaWNrLCBcImRhdGEtY3lcIjogZGF0YUN5LCByb2xlOiBvbkNsaWNrID8gJ2J1dHRvbicgOiB1bmRlZmluZWQsIHRhYkluZGV4OiBvbkNsaWNrID8gMCA6IHVuZGVmaW5lZCwgb25LZXlEb3duOiBvbkNsaWNrID8gKGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyB8fCBlLmtleSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIG9uQ2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSA6IHVuZGVmaW5lZCwgY2hpbGRyZW46IFtoZWFkZXIgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNCBwYi00IGJvcmRlci1iIGJvcmRlci1bdmFyKC0tYm9yZGVyKV1cIiwgY2hpbGRyZW46IGhlYWRlciB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiY2FyZC1jb250ZW50XCIsIGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZm9vdGVyICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgcHQtNCBib3JkZXItdCBib3JkZXItW3ZhcigtLWJvcmRlcildXCIsIGNoaWxkcmVuOiBmb290ZXIgfSkpXSB9KSk7XG59KTtcbk1vZGVybkNhcmQuZGlzcGxheU5hbWUgPSAnTW9kZXJuQ2FyZCc7XG5leHBvcnQgZGVmYXVsdCBNb2Rlcm5DYXJkO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUHJvamVjdFRpbWVsaW5lQ2FyZCBDb21wb25lbnRcbiAqXG4gKiBEaXNwbGF5cyBwcm9qZWN0IHRpbWVsaW5lLCB3YXZlIHByb2dyZXNzLCBhbmQgY3V0b3ZlciBjb3VudGRvd24uXG4gKiBTaG93cyBjdXJyZW50IHBoYXNlLCBkYXlzIHRvIG1pbGVzdG9uZXMsIGFuZCBvdmVyYWxsIHByb2dyZXNzLlxuICpcbiAqIFBoYXNlIDY6IERhc2hib2FyZCBVSSBDb21wb25lbnRzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDYWxlbmRhciwgQ2xvY2ssIFRyZW5kaW5nVXAsIFRhcmdldCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBNb2Rlcm5DYXJkIH0gZnJvbSAnLi4vYXRvbXMvTW9kZXJuQ2FyZCc7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uL2F0b21zL0JhZGdlJztcbi8qKlxuICogR2V0IGJhZGdlIHZhcmlhbnQgYmFzZWQgb24gcHJvamVjdCBwaGFzZVxuICovXG5jb25zdCBnZXRQaGFzZVZhcmlhbnQgPSAocGhhc2UpID0+IHtcbiAgICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgICAgIGNhc2UgJ0NvbXBsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiAnc3VjY2Vzcyc7XG4gICAgICAgIGNhc2UgJ01pZ3JhdGlvbic6XG4gICAgICAgIGNhc2UgJ0N1dG92ZXInOlxuICAgICAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgICAgY2FzZSAnUGxhbm5pbmcnOlxuICAgICAgICBjYXNlICdEaXNjb3ZlcnknOlxuICAgICAgICAgICAgcmV0dXJuICdpbmZvJztcbiAgICAgICAgY2FzZSAnVmFsaWRhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gJ3ByaW1hcnknO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdkZWZhdWx0JztcbiAgICB9XG59O1xuLyoqXG4gKiBQcm9qZWN0VGltZWxpbmVDYXJkIENvbXBvbmVudFxuICpcbiAqIENvbXByZWhlbnNpdmUgcHJvamVjdCB0aW1lbGluZSBkaXNwbGF5IHdpdGg6XG4gKiAtIFByb2plY3QgbmFtZSBhbmQgY3VycmVudCBwaGFzZVxuICogLSBDb3VudGRvd24gdG8gY3V0b3ZlciBhbmQgbmV4dCB3YXZlXG4gKiAtIFdhdmUgY29tcGxldGlvbiBwcm9ncmVzc1xuICogLSBPdmVyYWxsIHByb2dyZXNzIGJhclxuICovXG5leHBvcnQgY29uc3QgUHJvamVjdFRpbWVsaW5lQ2FyZCA9ICh7IHByb2plY3QsIGNsYXNzTmFtZSB9KSA9PiB7XG4gICAgY29uc3QgcHJvZ3Jlc3NQZXJjZW50YWdlID0gcHJvamVjdC50b3RhbFdhdmVzID4gMFxuICAgICAgICA/IE1hdGgucm91bmQoKHByb2plY3QuY29tcGxldGVkV2F2ZXMgLyBwcm9qZWN0LnRvdGFsV2F2ZXMpICogMTAwKVxuICAgICAgICA6IDA7XG4gICAgLy8gU2FmZWx5IGRpc3BsYXkgbnVtZXJpYyB2YWx1ZXMsIGRlZmF1bHRpbmcgdG8gJy0tJyBmb3IgTmFOL3VuZGVmaW5lZFxuICAgIGNvbnN0IGRpc3BsYXlEYXlzID0gKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsIHx8IGlzTmFOKHZhbHVlKSlcbiAgICAgICAgICAgIHJldHVybiAnLS0nO1xuICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZVN0cmluZykudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHtcbiAgICAgICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICAgICAgZGF5OiAnbnVtZXJpYycsXG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYydcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGhvdmVyYWJsZTogZmFsc2UsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldIG1iLTJcIiwgY2hpbGRyZW46IHByb2plY3QucHJvamVjdE5hbWUgfSksIF9qc3goQmFkZ2UsIHsgdmFyaWFudDogZ2V0UGhhc2VWYXJpYW50KHByb2plY3QuY3VycmVudFBoYXNlKSwgc2l6ZTogXCJtZFwiLCBjaGlsZHJlbjogcHJvamVjdC5jdXJyZW50UGhhc2UgfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogW19qc3goVGFyZ2V0LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJUYXJnZXQ6IFwiLCBmb3JtYXREYXRlKHByb2plY3QudGFyZ2V0Q3V0b3ZlcildIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTYgbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHAtNCByb3VuZGVkLWxnIGJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTR4bCBmb250LWJvbGQgdGV4dC1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBtYi0xXCIsIGNoaWxkcmVuOiBkaXNwbGF5RGF5cyhwcm9qZWN0LmRheXNUb0N1dG92ZXIpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KENhbGVuZGFyLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiRGF5cyB0byBDdXRvdmVyXCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgcC00IHJvdW5kZWQtbGcgYmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtNHhsIGZvbnQtYm9sZCB0ZXh0LVt2YXIoLS13YXJuaW5nKV0gbWItMVwiLCBjaGlsZHJlbjogZGlzcGxheURheXMocHJvamVjdC5kYXlzVG9OZXh0V2F2ZSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goQ2xvY2ssIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJEYXlzIHRvIE5leHQgV2F2ZVwiIH0pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHAtNCByb3VuZGVkLWxnIGJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC00eGwgZm9udC1ib2xkIHRleHQtW3ZhcigtLXN1Y2Nlc3MpXSBtYi0xXCIsIGNoaWxkcmVuOiBbcHJvamVjdC5jb21wbGV0ZWRXYXZlcywgXCIvXCIsIHByb2plY3QudG90YWxXYXZlc10gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goVHJlbmRpbmdVcCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBcIldhdmVzIENvbXBsZXRlZFwiIH0pXSB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTJcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiB0ZXh0LXNtXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogXCJPdmVyYWxsIFByb2dyZXNzXCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXVwiLCBjaGlsZHJlbjogW3Byb2dyZXNzUGVyY2VudGFnZSwgXCIlXCJdIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LWZ1bGwgYmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0gcm91bmRlZC1mdWxsIGgtM1wiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ncmFkaWVudC10by1yIGZyb20tW3ZhcigtLWFjY2VudC1wcmltYXJ5KV0gdG8tW3ZhcigtLWFjY2VudC1zZWNvbmRhcnkpXSByb3VuZGVkLWZ1bGwgaC0zIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTUwMCBlYXNlLW91dFwiLCBzdHlsZTogeyB3aWR0aDogYCR7cHJvZ3Jlc3NQZXJjZW50YWdlfSVgIH0sIHJvbGU6IFwicHJvZ3Jlc3NiYXJcIiwgXCJhcmlhLXZhbHVlbm93XCI6IHByb2dyZXNzUGVyY2VudGFnZSwgXCJhcmlhLXZhbHVlbWluXCI6IDAsIFwiYXJpYS12YWx1ZW1heFwiOiAxMDAgfSkgfSldIH0pLCBwcm9qZWN0LnByb2plY3REZXNjcmlwdGlvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IHB0LTQgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXVwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBwcm9qZWN0LnByb2plY3REZXNjcmlwdGlvbiB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBQcm9qZWN0VGltZWxpbmVDYXJkO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU3RhdGlzdGljc0NhcmQgQ29tcG9uZW50XG4gKlxuICogQ2xpY2thYmxlIGNhcmQgZGlzcGxheWluZyBlbnRpdHkgc3RhdGlzdGljcyB3aXRoIGRpc2NvdmVyZWQvbWlncmF0ZWQgYnJlYWtkb3duLlxuICogVXNlZCBmb3IgZGFzaGJvYXJkIG92ZXJ2aWV3IG1ldHJpY3MgKFVzZXJzLCBHcm91cHMsIENvbXB1dGVycywgZXRjLilcbiAqXG4gKiBQaGFzZSA2OiBEYXNoYm9hcmQgVUkgQ29tcG9uZW50c1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTW9kZXJuQ2FyZCB9IGZyb20gJy4uL2F0b21zL01vZGVybkNhcmQnO1xuLyoqXG4gKiBTdGF0aXN0aWNzQ2FyZCBDb21wb25lbnRcbiAqXG4gKiBJbnRlcmFjdGl2ZSBzdGF0aXN0aWNzIGRpc3BsYXkgd2l0aDpcbiAqIC0gTGFyZ2UgdmFsdWUgZGlzcGxheVxuICogLSBPcHRpb25hbCBpY29uXG4gKiAtIERpc2NvdmVyZWQvbWlncmF0ZWQgYnJlYWtkb3duXG4gKiAtIEhvdmVyIGVmZmVjdHMgZm9yIG5hdmlnYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IFN0YXRpc3RpY3NDYXJkID0gKHsgdGl0bGUsIHZhbHVlLCBkaXNjb3ZlcmVkLCBtaWdyYXRlZCwgaWNvbiwgb25DbGljaywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIHJldHVybiAoX2pzeHMoTW9kZXJuQ2FyZCwgeyBjbGFzc05hbWU6IGNsc3goJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsIG9uQ2xpY2sgJiYgJ2N1cnNvci1wb2ludGVyIGhvdmVyOmJvcmRlci1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBob3ZlcjpzaGFkb3ctbGcnLCBjbGFzc05hbWUpLCBvbkNsaWNrOiBvbkNsaWNrLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLXN0YXJ0IG1iLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gbWItMSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZVwiLCBjaGlsZHJlbjogdGl0bGUgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtNHhsIGZvbnQtYm9sZCB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXSBtdC0yXCIsIGNoaWxkcmVuOiAodmFsdWUgPz8gMCkudG9Mb2NhbGVTdHJpbmcoKSB9KV0gfSksIGljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBvcGFjaXR5LTgwXCIsIGNoaWxkcmVuOiBpY29uIH0pKV0gfSksIChkaXNjb3ZlcmVkICE9PSB1bmRlZmluZWQgfHwgbWlncmF0ZWQgIT09IHVuZGVmaW5lZCkgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTMgcHQtNCBib3JkZXItdCBib3JkZXItW3ZhcigtLWJvcmRlcildXCIsIGNoaWxkcmVuOiBbZGlzY292ZXJlZCAhPT0gdW5kZWZpbmVkICYmIChfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xXCIsIGNoaWxkcmVuOiBcIkRpc2NvdmVyZWRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtW3ZhcigtLWluZm8pXVwiLCBjaGlsZHJlbjogKGRpc2NvdmVyZWQgPz8gMCkudG9Mb2NhbGVTdHJpbmcoKSB9KV0gfSkpLCBtaWdyYXRlZCAhPT0gdW5kZWZpbmVkICYmIChfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xXCIsIGNoaWxkcmVuOiBcIk1pZ3JhdGVkXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS1zdWNjZXNzKV1cIiwgY2hpbGRyZW46IChtaWdyYXRlZCA/PyAwKS50b0xvY2FsZVN0cmluZygpIH0pXSB9KSldIH0pKSwgb25DbGljayAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC0zIHRleHQteHMgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBvcGFjaXR5LTAgZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5XCIsIGNoaWxkcmVuOiBcIkNsaWNrIHRvIHZpZXcgZGV0YWlscyBcXHUyMTkyXCIgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU3RhdGlzdGljc0NhcmQ7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTeXN0ZW1IZWFsdGhQYW5lbCBDb21wb25lbnRcbiAqXG4gKiBEaXNwbGF5cyBzeXN0ZW0gaGVhbHRoIHN0YXR1cyBmb3IgTG9naWMgRW5naW5lLCBQb3dlclNoZWxsLCBhbmQgb3RoZXIgc2VydmljZXMuXG4gKiBTaG93cyBzZXJ2aWNlIHN0YXR1cyBpbmRpY2F0b3JzLCBkYXRhIGZyZXNobmVzcywgYW5kIHJlY2VudCBlcnJvcnMuXG4gKlxuICogUGhhc2UgNjogRGFzaGJvYXJkIFVJIENvbXBvbmVudHNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBDaGVja0NpcmNsZSwgWENpcmNsZSwgQ2xvY2sgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgTW9kZXJuQ2FyZCB9IGZyb20gJy4uL2F0b21zL01vZGVybkNhcmQnO1xuaW1wb3J0IHsgU3RhdHVzSW5kaWNhdG9yIH0gZnJvbSAnLi4vYXRvbXMvU3RhdHVzSW5kaWNhdG9yJztcbi8qKlxuICogR2V0IHN0YXR1cyB0eXBlIGZvciBTdGF0dXNJbmRpY2F0b3IgYmFzZWQgb24gc2VydmljZSBzdGF0dXNcbiAqL1xuY29uc3QgZ2V0U3RhdHVzVHlwZSA9IChzdGF0dXMpID0+IHtcbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgICBjYXNlICdvbmxpbmUnOlxuICAgICAgICAgICAgcmV0dXJuICdzdWNjZXNzJztcbiAgICAgICAgY2FzZSAnZGVncmFkZWQnOlxuICAgICAgICAgICAgcmV0dXJuICd3YXJuaW5nJztcbiAgICAgICAgY2FzZSAnb2ZmbGluZSc6XG4gICAgICAgIGNhc2UgJ3Vua25vd24nOlxuICAgICAgICAgICAgcmV0dXJuICdlcnJvcic7XG4gICAgfVxufTtcbi8qKlxuICogR2V0IGljb24gZm9yIHNlcnZpY2Ugc3RhdHVzXG4gKi9cbmNvbnN0IGdldFN0YXR1c0ljb24gPSAoc3RhdHVzKSA9PiB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnb25saW5lJzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSk7XG4gICAgICAgIGNhc2UgJ2RlZ3JhZGVkJzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSk7XG4gICAgICAgIGNhc2UgJ29mZmxpbmUnOlxuICAgICAgICBjYXNlICd1bmtub3duJzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KFhDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KTtcbiAgICB9XG59O1xuLyoqXG4gKiBGb3JtYXQgZGF0YSBmcmVzaG5lc3MgdGltZVxuICovXG5jb25zdCBmb3JtYXRGcmVzaG5lc3MgPSAobWludXRlcykgPT4ge1xuICAgIGlmIChtaW51dGVzIDwgMSlcbiAgICAgICAgcmV0dXJuICdKdXN0IG5vdyc7XG4gICAgaWYgKG1pbnV0ZXMgPCA2MClcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobWludXRlcyl9bSBhZ29gO1xuICAgIGNvbnN0IGhvdXJzID0gTWF0aC5yb3VuZChtaW51dGVzIC8gNjApO1xuICAgIGlmIChob3VycyA8IDI0KVxuICAgICAgICByZXR1cm4gYCR7aG91cnN9aCBhZ29gO1xuICAgIGNvbnN0IGRheXMgPSBNYXRoLnJvdW5kKGhvdXJzIC8gMjQpO1xuICAgIHJldHVybiBgJHtkYXlzfWQgYWdvYDtcbn07XG4vKipcbiAqIFN5c3RlbUhlYWx0aFBhbmVsIENvbXBvbmVudFxuICpcbiAqIENvbXByZWhlbnNpdmUgc3lzdGVtIGhlYWx0aCBtb25pdG9yaW5nIHdpdGg6XG4gKiAtIFNlcnZpY2Ugc3RhdHVzIGluZGljYXRvcnNcbiAqIC0gRGF0YSBmcmVzaG5lc3MgdHJhY2tpbmdcbiAqIC0gRXJyb3IgY291bnQgZGlzcGxheVxuICogLSBQZXJmb3JtYW5jZSBtZXRyaWNzIChvcHRpb25hbClcbiAqL1xuZXhwb3J0IGNvbnN0IFN5c3RlbUhlYWx0aFBhbmVsID0gKHsgaGVhbHRoLCBjbGFzc05hbWUgfSkgPT4ge1xuICAgIHJldHVybiAoX2pzeHMoTW9kZXJuQ2FyZCwgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgaG92ZXJhYmxlOiBmYWxzZSwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldIG1iLTRcIiwgY2hpbGRyZW46IFwiU3lzdGVtIEhlYWx0aFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0gdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiTG9naWMgRW5naW5lXCIgfSksIF9qc3goU3RhdHVzSW5kaWNhdG9yLCB7IHN0YXR1czogZ2V0U3RhdHVzVHlwZShoZWFsdGg/LmxvZ2ljRW5naW5lU3RhdHVzPy5zdGF0dXMgfHwgJ3Vua25vd24nKSwgdGV4dDogaGVhbHRoPy5sb2dpY0VuZ2luZVN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJywgc2l6ZTogXCJzbVwiLCBhbmltYXRlOiBoZWFsdGg/LmxvZ2ljRW5naW5lU3RhdHVzPy5zdGF0dXMgPT09ICdvbmxpbmUnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIlBvd2VyU2hlbGxcIiB9KSwgX2pzeChTdGF0dXNJbmRpY2F0b3IsIHsgc3RhdHVzOiBnZXRTdGF0dXNUeXBlKGhlYWx0aD8ucG93ZXJTaGVsbFN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJyksIHRleHQ6IGhlYWx0aD8ucG93ZXJTaGVsbFN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJywgc2l6ZTogXCJzbVwiLCBhbmltYXRlOiBoZWFsdGg/LnBvd2VyU2hlbGxTdGF0dXM/LnN0YXR1cyA9PT0gJ29ubGluZScgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0gdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiRmlsZSBTeXN0ZW1cIiB9KSwgX2pzeChTdGF0dXNJbmRpY2F0b3IsIHsgc3RhdHVzOiBnZXRTdGF0dXNUeXBlKGhlYWx0aD8uZmlsZVN5c3RlbVN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJyksIHRleHQ6IGhlYWx0aD8uZmlsZVN5c3RlbVN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJywgc2l6ZTogXCJzbVwiLCBhbmltYXRlOiBoZWFsdGg/LmZpbGVTeXN0ZW1TdGF0dXM/LnN0YXR1cyA9PT0gJ29ubGluZScgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0gdHJhbnNpdGlvbi1jb2xvcnNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiTmV0d29ya1wiIH0pLCBfanN4KFN0YXR1c0luZGljYXRvciwgeyBzdGF0dXM6IGdldFN0YXR1c1R5cGUoaGVhbHRoPy5uZXR3b3JrU3RhdHVzPy5zdGF0dXMgfHwgJ3Vua25vd24nKSwgdGV4dDogaGVhbHRoPy5uZXR3b3JrU3RhdHVzPy5zdGF0dXMgfHwgJ3Vua25vd24nLCBzaXplOiBcInNtXCIsIGFuaW1hdGU6IGhlYWx0aD8ubmV0d29ya1N0YXR1cz8uc3RhdHVzID09PSAnb25saW5lJyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTIgcm91bmRlZC1sZyBob3ZlcjpiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXSB0cmFuc2l0aW9uLWNvbG9ycyBtdC00IHB0LTQgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChDbG9jaywgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJEYXRhIEZyZXNobmVzc1wiIH0pXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXVwiLCBjaGlsZHJlbjogZm9ybWF0RnJlc2huZXNzKGhlYWx0aD8uZGF0YUZyZXNobmVzc01pbnV0ZXMgfHwgMCkgfSldIH0pLCAoaGVhbHRoPy5sYXN0RXJyb3JDb3VudCB8fCAwKSA+IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTIgcm91bmRlZC1sZyBiZy1bdmFyKC0tZGFuZ2VyKV0vMTAgYm9yZGVyIGJvcmRlci1bdmFyKC0tZGFuZ2VyKV0vMjBcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tZGFuZ2VyKV1cIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS1kYW5nZXIpXSBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJSZWNlbnQgRXJyb3JzXCIgfSldIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LVt2YXIoLS1kYW5nZXIpXVwiLCBjaGlsZHJlbjogaGVhbHRoPy5sYXN0RXJyb3JDb3VudCB8fCAwIH0pXSB9KSksIGhlYWx0aD8ubWVtb3J5VXNhZ2VNQiAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtMyBwdC0zIGJvcmRlci10IGJvcmRlci1bdmFyKC0tYm9yZGVyKV0gc3BhY2UteS0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC14c1wiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IFwiTWVtb3J5IFVzYWdlXCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXVwiLCBjaGlsZHJlbjogW2hlYWx0aC5tZW1vcnlVc2FnZU1CLnRvRml4ZWQoMCksIFwiIE1CXCJdIH0pXSB9KSwgaGVhbHRoPy5jcHVVc2FnZVBlcmNlbnQgIT09IHVuZGVmaW5lZCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC14c1wiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IFwiQ1BVIFVzYWdlXCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmb250LW1lZGl1bSB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXVwiLCBjaGlsZHJlbjogW2hlYWx0aC5jcHVVc2FnZVBlcmNlbnQudG9GaXhlZCgxKSwgXCIlXCJdIH0pXSB9KSldIH0pKV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTeXN0ZW1IZWFsdGhQYW5lbDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFJlY2VudEFjdGl2aXR5RmVlZCBDb21wb25lbnRcbiAqXG4gKiBEaXNwbGF5cyByZWNlbnQgc3lzdGVtIGFjdGl2aXR5IHdpdGggaWNvbnMsIHRpbWVzdGFtcHMsIGFuZCBkZXNjcmlwdGlvbnMuXG4gKiBTaG93cyBkaXNjb3ZlcnkgcnVucywgbWlncmF0aW9uIGV2ZW50cywgZXJyb3JzLCBhbmQgY29uZmlndXJhdGlvbiBjaGFuZ2VzLlxuICpcbiAqIFBoYXNlIDY6IERhc2hib2FyZCBVSSBDb21wb25lbnRzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBY3Rpdml0eSwgQWxlcnRDaXJjbGUsIENoZWNrQ2lyY2xlLCBTZWFyY2gsIERvd25sb2FkLCBTZXR0aW5ncywgQWxlcnRUcmlhbmdsZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBNb2Rlcm5DYXJkIH0gZnJvbSAnLi4vYXRvbXMvTW9kZXJuQ2FyZCc7XG4vKipcbiAqIEdldCBpY29uIGNvbXBvbmVudCBiYXNlZCBvbiBhY3Rpdml0eSB0eXBlXG4gKi9cbmNvbnN0IGdldEFjdGl2aXR5SWNvbiA9ICh0eXBlLCBzdGF0dXMpID0+IHtcbiAgICAvLyBTdGF0dXMtYmFzZWQgaWNvbnNcbiAgICBpZiAoc3RhdHVzID09PSAnZXJyb3InKSB7XG4gICAgICAgIHJldHVybiBfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLWRhbmdlcildXCIgfSk7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPT09ICd3YXJuaW5nJykge1xuICAgICAgICByZXR1cm4gX2pzeChBbGVydFRyaWFuZ2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLXdhcm5pbmcpXVwiIH0pO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgcmV0dXJuIF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tc3VjY2VzcyldXCIgfSk7XG4gICAgfVxuICAgIC8vIFR5cGUtYmFzZWQgaWNvbnNcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZGlzY292ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS1pbmZvKV1cIiB9KTtcbiAgICAgICAgY2FzZSAnbWlncmF0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLWFjY2VudC1wcmltYXJ5KV1cIiB9KTtcbiAgICAgICAgY2FzZSAnY29uZmlndXJhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChTZXR0aW5ncywgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIgfSk7XG4gICAgICAgIGNhc2UgJ3ZhbGlkYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuIF9qc3goQ2hlY2tDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tc3VjY2VzcyldXCIgfSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIgfSk7XG4gICAgfVxufTtcbi8qKlxuICogR2V0IGJhY2tncm91bmQgY29sb3IgYmFzZWQgb24gc3RhdHVzXG4gKi9cbmNvbnN0IGdldFN0YXR1c0JnQ29sb3IgPSAoc3RhdHVzKSA9PiB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgICAgcmV0dXJuICdiZy1bdmFyKC0tZGFuZ2VyKV0vMTAnO1xuICAgICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgICAgIHJldHVybiAnYmctW3ZhcigtLXdhcm5pbmcpXS8xMCc7XG4gICAgICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgICAgICAgICAgcmV0dXJuICdiZy1bdmFyKC0tc3VjY2VzcyldLzEwJztcbiAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICByZXR1cm4gJ2JnLVt2YXIoLS1pbmZvKV0vMTAnO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuICdiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXSc7XG4gICAgfVxufTtcbi8qKlxuICogRm9ybWF0IHRpbWVzdGFtcCB0byByZWxhdGl2ZSB0aW1lXG4gKi9cbmNvbnN0IGZvcm1hdFRpbWVzdGFtcCA9ICh0aW1lc3RhbXApID0+IHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUodGltZXN0YW1wKTtcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIGNvbnN0IGRpZmZNcyA9IG5vdy5nZXRUaW1lKCkgLSBkYXRlLmdldFRpbWUoKTtcbiAgICBjb25zdCBkaWZmTWlucyA9IE1hdGguZmxvb3IoZGlmZk1zIC8gNjAwMDApO1xuICAgIGNvbnN0IGRpZmZIb3VycyA9IE1hdGguZmxvb3IoZGlmZk1pbnMgLyA2MCk7XG4gICAgY29uc3QgZGlmZkRheXMgPSBNYXRoLmZsb29yKGRpZmZIb3VycyAvIDI0KTtcbiAgICBpZiAoZGlmZk1pbnMgPCAxKVxuICAgICAgICByZXR1cm4gJ0p1c3Qgbm93JztcbiAgICBpZiAoZGlmZk1pbnMgPCA2MClcbiAgICAgICAgcmV0dXJuIGAke2RpZmZNaW5zfW0gYWdvYDtcbiAgICBpZiAoZGlmZkhvdXJzIDwgMjQpXG4gICAgICAgIHJldHVybiBgJHtkaWZmSG91cnN9aCBhZ29gO1xuICAgIGlmIChkaWZmRGF5cyA8IDcpXG4gICAgICAgIHJldHVybiBgJHtkaWZmRGF5c31kIGFnb2A7XG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHtcbiAgICAgICAgbW9udGg6ICdzaG9ydCcsXG4gICAgICAgIGRheTogJ251bWVyaWMnXG4gICAgfSk7XG59O1xuLyoqXG4gKiBSZWNlbnRBY3Rpdml0eUZlZWQgQ29tcG9uZW50XG4gKlxuICogQWN0aXZpdHkgZmVlZCB3aXRoOlxuICogLSBUeXBlLWJhc2VkIGljb25zXG4gKiAtIFN0YXR1cyBpbmRpY2F0b3JzXG4gKiAtIFJlbGF0aXZlIHRpbWVzdGFtcHNcbiAqIC0gRW50aXR5IGNvdW50c1xuICogLSBFbXB0eSBzdGF0ZSBoYW5kbGluZ1xuICovXG5leHBvcnQgY29uc3QgUmVjZW50QWN0aXZpdHlGZWVkID0gKHsgYWN0aXZpdGllcywgY2xhc3NOYW1lLCBtYXhJdGVtcyA9IDEwIH0pID0+IHtcbiAgICBjb25zdCBkaXNwbGF5QWN0aXZpdGllcyA9IGFjdGl2aXRpZXMuc2xpY2UoMCwgbWF4SXRlbXMpO1xuICAgIHJldHVybiAoX2pzeHMoTW9kZXJuQ2FyZCwgeyBjbGFzc05hbWU6IGNsYXNzTmFtZSwgaG92ZXJhYmxlOiBmYWxzZSwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldIG1iLTRcIiwgY2hpbGRyZW46IFwiUmVjZW50IEFjdGl2aXR5XCIgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiBkaXNwbGF5QWN0aXZpdGllcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgLyogRW1wdHkgU3RhdGUgKi9cbiAgICAgICAgICAgICAgICBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBweS04XCIsIGNoaWxkcmVuOiBbX2pzeChBY3Rpdml0eSwgeyBjbGFzc05hbWU6IFwidy0xMiBoLTEyIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gb3BhY2l0eS0zMCBteC1hdXRvIG1iLTNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBcIk5vIHJlY2VudCBhY3Rpdml0eVwiIH0pXSB9KSkgOiAoXG4gICAgICAgICAgICAgICAgLyogQWN0aXZpdHkgTGlzdCAqL1xuICAgICAgICAgICAgICAgIGRpc3BsYXlBY3Rpdml0aWVzLm1hcCgoYWN0aXZpdHksIGluZGV4KSA9PiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2ZsZXggaXRlbXMtc3RhcnQgZ2FwLTMgcC0zIHJvdW5kZWQtbGcnLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMTUwJywgJ2hvdmVyOmJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldJywgZ2V0U3RhdHVzQmdDb2xvcihhY3Rpdml0eS5zdGF0dXMpLCBpbmRleCAhPT0gZGlzcGxheUFjdGl2aXRpZXMubGVuZ3RoIC0gMSAmJiAnYm9yZGVyLWIgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXScpLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC1zaHJpbmstMCBtdC0wLjVcIiwgY2hpbGRyZW46IGdldEFjdGl2aXR5SWNvbihhY3Rpdml0eS50eXBlLCBhY3Rpdml0eS5zdGF0dXMpIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgbWluLXctMFwiLCBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV0gdHJ1bmNhdGVcIiwgY2hpbGRyZW46IGFjdGl2aXR5LnRpdGxlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gbXQtMVwiLCBjaGlsZHJlbjogYWN0aXZpdHkuZGVzY3JpcHRpb24gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIG10LTJcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IGZvcm1hdFRpbWVzdGFtcChhY3Rpdml0eS50aW1lc3RhbXApIH0pLCBhY3Rpdml0eS5lbnRpdHlDb3VudCAhPT0gdW5kZWZpbmVkICYmIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS1hY2NlbnQtcHJpbWFyeSldIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBbYWN0aXZpdHkuZW50aXR5Q291bnQudG9Mb2NhbGVTdHJpbmcoKSwgXCIgaXRlbXNcIl0gfSkpLCBhY3Rpdml0eS51c2VyICYmIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBbXCJieSBcIiwgYWN0aXZpdHkudXNlcl0gfSkpXSB9KV0gfSldIH0sIGFjdGl2aXR5LmlkKSkpKSB9KSwgYWN0aXZpdGllcy5sZW5ndGggPiBtYXhJdGVtcyAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IHB0LTMgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXSB0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeHMoXCJidXR0b25cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS1hY2NlbnQtcHJpbWFyeSldIGhvdmVyOnRleHQtW3ZhcigtLWFjY2VudC1zZWNvbmRhcnkpXSB0cmFuc2l0aW9uLWNvbG9yc1wiLCBvbkNsaWNrOiAoKSA9PiB7IH0sIGNoaWxkcmVuOiBbXCJWaWV3IGFsbCBcIiwgYWN0aXZpdGllcy5sZW5ndGgsIFwiIGFjdGl2aXRpZXMgXFx1MjE5MlwiXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBSZWNlbnRBY3Rpdml0eUZlZWQ7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBRdWlja0FjdGlvbnNQYW5lbCBDb21wb25lbnRcbiAqXG4gKiBQcm92aWRlcyBxdWljayBuYXZpZ2F0aW9uIGJ1dHRvbnMgZm9yIGNvbW1vbiB0YXNrcy5cbiAqIEluY2x1ZGVzIFN0YXJ0IERpc2NvdmVyeSwgUnVuIE1pZ3JhdGlvbiwgVmlldyBSZXBvcnRzLCBhbmQgU2V0dGluZ3MuXG4gKlxuICogUGhhc2UgNjogRGFzaGJvYXJkIFVJIENvbXBvbmVudHNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyBQbGF5LCBGaWxlVGV4dCwgU2V0dGluZ3MsIERvd25sb2FkLCBVc2VycyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBNb2Rlcm5DYXJkIH0gZnJvbSAnLi4vYXRvbXMvTW9kZXJuQ2FyZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuLyoqXG4gKiBRdWlja0FjdGlvbnNQYW5lbCBDb21wb25lbnRcbiAqXG4gKiBRdWljayBhY3Rpb24gYnV0dG9ucyBmb3I6XG4gKiAtIFN0YXJ0aW5nIGRpc2NvdmVyeVxuICogLSBSdW5uaW5nIG1pZ3JhdGlvbnNcbiAqIC0gVmlld2luZyByZXBvcnRzXG4gKiAtIEFjY2Vzc2luZyBzZXR0aW5nc1xuICogLSBOYXZpZ2F0aW5nIHRvIGtleSB2aWV3c1xuICovXG5leHBvcnQgY29uc3QgUXVpY2tBY3Rpb25zUGFuZWwgPSAoeyBjbGFzc05hbWUgfSkgPT4ge1xuICAgIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGhvdmVyYWJsZTogZmFsc2UsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXSBtYi00XCIsIGNoaWxkcmVuOiBcIlF1aWNrIEFjdGlvbnNcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBjbGFzc05hbWU6IFwidy1mdWxsIGp1c3RpZnktc3RhcnRcIiwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy9kaXNjb3ZlcnknKSwgY2hpbGRyZW46IFtfanN4KFBsYXksIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlN0YXJ0IERpc2NvdmVyeVwiXSB9KSwgX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGNsYXNzTmFtZTogXCJ3LWZ1bGwganVzdGlmeS1zdGFydFwiLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL21pZ3JhdGlvbicpLCBjaGlsZHJlbjogW19qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlJ1biBNaWdyYXRpb25cIl0gfSksIF9qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBjbGFzc05hbWU6IFwidy1mdWxsIGp1c3RpZnktc3RhcnRcIiwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy91c2VycycpLCBjaGlsZHJlbjogW19qc3goVXNlcnMsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlZpZXcgVXNlcnNcIl0gfSksIF9qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBjbGFzc05hbWU6IFwidy1mdWxsIGp1c3RpZnktc3RhcnRcIiwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy9yZXBvcnRzJyksIGNoaWxkcmVuOiBbX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0yXCIgfSksIFwiVmlldyBSZXBvcnRzXCJdIH0pLCBfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgY2xhc3NOYW1lOiBcInctZnVsbCBqdXN0aWZ5LXN0YXJ0XCIsIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvc2V0dGluZ3MnKSwgY2hpbGRyZW46IFtfanN4KFNldHRpbmdzLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTJcIiB9KSwgXCJTZXR0aW5nc1wiXSB9KV0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBRdWlja0FjdGlvbnNQYW5lbDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIE92ZXJ2aWV3VmlldyBDb21wb25lbnRcbiAqXG4gKiBEYXNoYm9hcmQgb3ZlcnZpZXcgd2l0aCByZWFsIExvZ2ljIEVuZ2luZSBkYXRhIGludGVncmF0aW9uLlxuICogRGlzcGxheXMgcHJvamVjdCB0aW1lbGluZSwgc3RhdGlzdGljcywgc3lzdGVtIGhlYWx0aCwgYW5kIHJlY2VudCBhY3Rpdml0eS5cbiAqXG4gKiBQaGFzZSA3OiBDb21wbGV0ZSBEYXNoYm9hcmQgSW1wbGVtZW50YXRpb25cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyBSZWZyZXNoQ3csIFVzZXJzLCBMYXllcnMsIE1vbml0b3IsIFNlcnZlciwgQWxlcnRDaXJjbGUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlRGFzaGJvYXJkTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VEYXNoYm9hcmRMb2dpYyc7XG5pbXBvcnQgeyBQcm9qZWN0VGltZWxpbmVDYXJkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvamVjdFRpbWVsaW5lQ2FyZCc7XG5pbXBvcnQgeyBTdGF0aXN0aWNzQ2FyZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1N0YXRpc3RpY3NDYXJkJztcbmltcG9ydCB7IFN5c3RlbUhlYWx0aFBhbmVsIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvU3lzdGVtSGVhbHRoUGFuZWwnO1xuaW1wb3J0IHsgUmVjZW50QWN0aXZpdHlGZWVkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvUmVjZW50QWN0aXZpdHlGZWVkJztcbmltcG9ydCB7IFF1aWNrQWN0aW9uc1BhbmVsIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvUXVpY2tBY3Rpb25zUGFuZWwnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU3Bpbm5lcic7XG4vKipcbiAqIE92ZXJ2aWV3VmlldyBDb21wb25lbnRcbiAqXG4gKiBDb21wbGV0ZSBkYXNoYm9hcmQgaW1wbGVtZW50YXRpb24gd2l0aDpcbiAqIC0gUmVhbC10aW1lIGRhdGEgZnJvbSBMb2dpYyBFbmdpbmVcbiAqIC0gQXV0by1yZWZyZXNoIGV2ZXJ5IDMwIHNlY29uZHNcbiAqIC0gQ2xpY2thYmxlIG5hdmlnYXRpb24gY2FyZHNcbiAqIC0gU3lzdGVtIGhlYWx0aCBtb25pdG9yaW5nXG4gKiAtIFJlY2VudCBhY3Rpdml0eSBmZWVkXG4gKiAtIFF1aWNrIGFjdGlvbiBzaG9ydGN1dHNcbiAqL1xuY29uc3QgT3ZlcnZpZXdWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgc3RhdHMsIHByb2plY3QsIGhlYWx0aCwgYWN0aXZpdHksIGlzTG9hZGluZywgZXJyb3IsIHJlbG9hZCB9ID0gdXNlRGFzaGJvYXJkTG9naWMoKTtcbiAgICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gICAgLy8gTG9hZGluZyBzdGF0ZVxuICAgIGlmIChpc0xvYWRpbmcgJiYgIXN0YXRzKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgbWluLWgtWzYwMHB4XVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBjbGFzc05hbWU6IFwibXgtYXV0byBtYi00XCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IFwiTG9hZGluZyBkYXNoYm9hcmQuLi5cIiB9KV0gfSkgfSkpO1xuICAgIH1cbiAgICAvLyBFcnJvciBzdGF0ZVxuICAgIGlmIChlcnJvciAmJiAhc3RhdHMpIHtcbiAgICAgICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbCBtaW4taC1bNjAwcHhdXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBtYXgtdy1tZFwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctMTYgaC0xNiB0ZXh0LVt2YXIoLS1kYW5nZXIpXSBteC1hdXRvIG1iLTRcIiB9KSwgX2pzeChcImgyXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteGwgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXSBtYi0yXCIsIGNoaWxkcmVuOiBcIkZhaWxlZCB0byBMb2FkIERhc2hib2FyZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LVt2YXIoLS1kYW5nZXIpXSBtYi02XCIsIGNoaWxkcmVuOiBlcnJvciB9KSwgX2pzeHMoQnV0dG9uLCB7IG9uQ2xpY2s6IHJlbG9hZCwgdmFyaWFudDogXCJwcmltYXJ5XCIsIGNoaWxkcmVuOiBbX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlJldHJ5XCJdIH0pXSB9KSB9KSk7XG4gICAgfVxuICAgIC8vIE5vIGRhdGEgc3RhdGVcbiAgICBpZiAoIXN0YXRzIHx8ICFwcm9qZWN0KSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgbWluLWgtWzYwMHB4XVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIG1iLTRcIiwgY2hpbGRyZW46IFwiTm8gZGF0YSBhdmFpbGFibGVcIiB9KSwgX2pzeHMoQnV0dG9uLCB7IG9uQ2xpY2s6IHJlbG9hZCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgY2hpbGRyZW46IFtfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0yXCIgfSksIFwiUmVmcmVzaFwiXSB9KV0gfSkgfSkpO1xuICAgIH1cbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNiBzcGFjZS15LTYgb3ZlcmZsb3ctYXV0b1wiLCBcImRhdGEtdGVzdGlkXCI6IFwib3ZlcnZpZXctdmlld1wiLCBcImRhdGEtY3lcIjogXCJvdmVydmlldy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV1cIiwgY2hpbGRyZW46IFwiRGFzaGJvYXJkXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBtdC0xXCIsIGNoaWxkcmVuOiBcIk0mQSBEaXNjb3ZlcnkgU3VpdGUgT3ZlcnZpZXdcIiB9KV0gfSksIF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiByZWxvYWQsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgZGlzYWJsZWQ6IGlzTG9hZGluZywgY2hpbGRyZW46IFtfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IGB3LTQgaC00IG1yLTIgJHtpc0xvYWRpbmcgPyAnYW5pbWF0ZS1zcGluJyA6ICcnfWAgfSksIFwiUmVmcmVzaFwiXSB9KV0gfSksIF9qc3goUHJvamVjdFRpbWVsaW5lQ2FyZCwgeyBwcm9qZWN0OiBwcm9qZWN0IH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy00IGdhcC02XCIsIGNoaWxkcmVuOiBbX2pzeChTdGF0aXN0aWNzQ2FyZCwgeyB0aXRsZTogXCJVc2Vyc1wiLCB2YWx1ZTogc3RhdHM/LnRvdGFsVXNlcnMgfHwgMCwgZGlzY292ZXJlZDogc3RhdHM/LmRpc2NvdmVyZWRVc2VycywgbWlncmF0ZWQ6IHN0YXRzPy5taWdyYXRlZFVzZXJzLCBpY29uOiBfanN4KFVzZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02XCIgfSksIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvdXNlcnMnKSwgXCJkYXRhLWN5XCI6IFwic3RhdHMtdXNlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXRzLXVzZXJzXCIgfSksIF9qc3goU3RhdGlzdGljc0NhcmQsIHsgdGl0bGU6IFwiR3JvdXBzXCIsIHZhbHVlOiBzdGF0cz8udG90YWxHcm91cHMgfHwgMCwgZGlzY292ZXJlZDogc3RhdHM/LmRpc2NvdmVyZWRHcm91cHMsIG1pZ3JhdGVkOiBzdGF0cz8ubWlncmF0ZWRHcm91cHMsIGljb246IF9qc3goTGF5ZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTYgaC02XCIgfSksIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvZ3JvdXBzJyksIFwiZGF0YS1jeVwiOiBcInN0YXRzLWdyb3Vwc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdHMtZ3JvdXBzXCIgfSksIF9qc3goU3RhdGlzdGljc0NhcmQsIHsgdGl0bGU6IFwiQ29tcHV0ZXJzXCIsIHZhbHVlOiBzdGF0cz8udG90YWxDb21wdXRlcnMgfHwgMCwgZGlzY292ZXJlZDogc3RhdHM/LmRpc2NvdmVyZWRDb21wdXRlcnMsIGljb246IF9qc3goTW9uaXRvciwgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL2NvbXB1dGVycycpLCBcImRhdGEtY3lcIjogXCJzdGF0cy1jb21wdXRlcnNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXRzLWNvbXB1dGVyc1wiIH0pLCBfanN4KFN0YXRpc3RpY3NDYXJkLCB7IHRpdGxlOiBcIkluZnJhc3RydWN0dXJlXCIsIHZhbHVlOiBzdGF0cz8udG90YWxJbmZyYXN0cnVjdHVyZSB8fCAwLCBpY29uOiBfanN4KFNlcnZlciwgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL2luZnJhc3RydWN0dXJlJyksIFwiZGF0YS1jeVwiOiBcInN0YXRzLWluZnJhc3RydWN0dXJlXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0cy1pbmZyYXN0cnVjdHVyZVwiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMyBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibGc6Y29sLXNwYW4tMlwiLCBjaGlsZHJlbjogX2pzeChSZWNlbnRBY3Rpdml0eUZlZWQsIHsgYWN0aXZpdGllczogYWN0aXZpdHkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktNlwiLCBjaGlsZHJlbjogW2hlYWx0aCAmJiBfanN4KFN5c3RlbUhlYWx0aFBhbmVsLCB7IGhlYWx0aDogaGVhbHRoIH0pLCBfanN4KFF1aWNrQWN0aW9uc1BhbmVsLCB7fSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgdGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIHB0LTQgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXVwiLCBjaGlsZHJlbjogW1wiTGFzdCB1cGRhdGVkOiBcIiwgbmV3IERhdGUoKHN0YXRzPy5sYXN0RGF0YVJlZnJlc2ggPz8gMCkpLnRvTG9jYWxlU3RyaW5nKCksIFwiIHwgRGF0YSBzb3VyY2U6IFwiLCBzdGF0cz8uZGF0YVNvdXJjZSA/PyAwXSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IE92ZXJ2aWV3VmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=