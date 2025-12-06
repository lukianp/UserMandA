"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1172],{

/***/ 11172:
/*!******************************************************************!*\
  !*** ./src/renderer/views/overview/OverviewView.tsx + 7 modules ***!
  \******************************************************************/
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
    const selectedSourceProfile = (0,useProfileStore.useProfileStore)(state => state.selectedSourceProfile);
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
            const electronAPI = (0,electron_api_fallback.getElectronAPI)();
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
            const electronAPI = (0,electron_api_fallback.getElectronAPI)();
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
        default: (0,clsx.clsx)('modern-card', hoverable && 'hover:scale-[1.01]'),
        metric: (0,clsx.clsx)('metric-card'),
        section: (0,clsx.clsx)('section-border'),
        glass: (0,clsx.clsx)('glass-card', 'p-5 m-2', hoverable && 'hover:scale-[1.01] hover:shadow-card-hover'),
    };
    const cardClasses = (0,clsx.clsx)(variantClasses[variant], onClick && 'cursor-pointer', className);
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
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-start mb-6", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h2", { className: "text-2xl font-bold text-[var(--text-primary)] mb-2", children: project.projectName }), (0,jsx_runtime.jsx)(Badge.Badge, { variant: getPhaseVariant(project.currentPhase), size: "md", children: project.currentPhase })] }), (0,jsx_runtime.jsx)("div", { className: "text-right", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm text-[var(--text-secondary)]", children: [(0,jsx_runtime.jsx)(lucide_react.Target, { className: "w-4 h-4" }), (0,jsx_runtime.jsxs)("span", { children: ["Target: ", formatDate(project.targetCutover)] })] }) })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-3 gap-6 mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsx)("div", { className: "text-4xl font-bold text-[var(--accent-primary)] mb-1", children: project.daysToCutover }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react.Calendar, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Days to Cutover" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsx)("div", { className: "text-4xl font-bold text-[var(--warning)] mb-1", children: project.daysToNextWave }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react.Clock, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Days to Next Wave" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]", children: [(0,jsx_runtime.jsxs)("div", { className: "text-4xl font-bold text-[var(--success)] mb-1", children: [project.completedWaves, "/", project.totalWaves] }), (0,jsx_runtime.jsxs)("div", { className: "text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1", children: [(0,jsx_runtime.jsx)(lucide_react.TrendingUp, { className: "w-4 h-4" }), (0,jsx_runtime.jsx)("span", { children: "Waves Completed" })] })] })] }), (0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-sm", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "Overall Progress" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [progressPercentage, "%"] })] }), (0,jsx_runtime.jsx)("div", { className: "w-full bg-[var(--card-bg-secondary)] rounded-full h-3", children: (0,jsx_runtime.jsx)("div", { className: "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full h-3 transition-all duration-500 ease-out", style: { width: `${progressPercentage}%` }, role: "progressbar", "aria-valuenow": progressPercentage, "aria-valuemin": 0, "aria-valuemax": 100 }) })] }), project.projectDescription && ((0,jsx_runtime.jsx)("div", { className: "mt-4 pt-4 border-t border-[var(--border)]", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)]", children: project.projectDescription }) }))] }));
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
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: (0,clsx.clsx)('transition-all duration-200', onClick && 'cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg', className), onClick: onClick, "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex-1", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)] mb-1 uppercase tracking-wide", children: title }), (0,jsx_runtime.jsx)("p", { className: "text-4xl font-bold text-[var(--text-primary)] mt-2", children: (value ?? 0).toLocaleString() })] }), icon && ((0,jsx_runtime.jsx)("div", { className: "text-[var(--accent-primary)] opacity-80", children: icon }))] }), (discovered !== undefined || migrated !== undefined) && ((0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]", children: [discovered !== undefined && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1", children: "Discovered" }), (0,jsx_runtime.jsx)("p", { className: "text-lg font-semibold text-[var(--info)]", children: (discovered ?? 0).toLocaleString() })] })), migrated !== undefined && ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1", children: "Migrated" }), (0,jsx_runtime.jsx)("p", { className: "text-lg font-semibold text-[var(--success)]", children: (migrated ?? 0).toLocaleString() })] }))] })), onClick && ((0,jsx_runtime.jsx)("div", { className: "mt-3 text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity", children: "Click to view details \u2192" }))] }));
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
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-[var(--text-primary)] mb-4", children: "System Health" }), (0,jsx_runtime.jsxs)("div", { className: "space-y-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Logic Engine" }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(health?.logicEngineStatus?.status || 'unknown'), text: health?.logicEngineStatus?.status || 'unknown', size: "sm", animate: health?.logicEngineStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "PowerShell" }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(health?.powerShellStatus?.status || 'unknown'), text: health?.powerShellStatus?.status || 'unknown', size: "sm", animate: health?.powerShellStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "File System" }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(health?.fileSystemStatus?.status || 'unknown'), text: health?.fileSystemStatus?.status || 'unknown', size: "sm", animate: health?.fileSystemStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors", children: [(0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Network" }), (0,jsx_runtime.jsx)(StatusIndicator.StatusIndicator, { status: getStatusType(health?.networkStatus?.status || 'unknown'), text: health?.networkStatus?.status || 'unknown', size: "sm", animate: health?.networkStatus?.status === 'online' })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors mt-4 pt-4 border-t border-[var(--border)]", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.Clock, { className: "w-4 h-4 text-[var(--text-secondary)]" }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--text-secondary)] font-medium", children: "Data Freshness" })] }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-[var(--text-primary)]", children: formatFreshness(health?.dataFreshnessMinutes || 0) })] }), (health?.lastErrorCount || 0) > 0 && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.AlertCircle, { className: "w-4 h-4 text-[var(--danger)]" }), (0,jsx_runtime.jsx)("span", { className: "text-sm text-[var(--danger)] font-medium", children: "Recent Errors" })] }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-bold text-[var(--danger)]", children: health?.lastErrorCount || 0 })] })), health?.memoryUsageMB && ((0,jsx_runtime.jsxs)("div", { className: "mt-3 pt-3 border-t border-[var(--border)] space-y-2", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-xs", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "Memory Usage" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [health.memoryUsageMB.toFixed(0), " MB"] })] }), health?.cpuUsagePercent !== undefined && ((0,jsx_runtime.jsxs)("div", { className: "flex justify-between text-xs", children: [(0,jsx_runtime.jsx)("span", { className: "text-[var(--text-secondary)]", children: "CPU Usage" }), (0,jsx_runtime.jsxs)("span", { className: "font-medium text-[var(--text-primary)]", children: [health.cpuUsagePercent.toFixed(1), "%"] })] }))] }))] })] }));
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
        return (0,jsx_runtime.jsx)(lucide_react.AlertCircle, { className: "w-4 h-4 text-[var(--danger)]" });
    }
    if (status === 'warning') {
        return (0,jsx_runtime.jsx)(lucide_react.AlertTriangle, { className: "w-4 h-4 text-[var(--warning)]" });
    }
    if (status === 'success') {
        return (0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-[var(--success)]" });
    }
    // Type-based icons
    switch (type) {
        case 'discovery':
            return (0,jsx_runtime.jsx)(lucide_react.Search, { className: "w-4 h-4 text-[var(--info)]" });
        case 'migration':
            return (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4 text-[var(--accent-primary)]" });
        case 'configuration':
            return (0,jsx_runtime.jsx)(lucide_react.Settings, { className: "w-4 h-4 text-[var(--text-secondary)]" });
        case 'validation':
            return (0,jsx_runtime.jsx)(lucide_react.CheckCircle, { className: "w-4 h-4 text-[var(--success)]" });
        default:
            return (0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-4 h-4 text-[var(--text-secondary)]" });
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
                (0,jsx_runtime.jsxs)("div", { className: "text-center py-8", children: [(0,jsx_runtime.jsx)(lucide_react.Activity, { className: "w-12 h-12 text-[var(--text-secondary)] opacity-30 mx-auto mb-3" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)]", children: "No recent activity" })] })) : (
                /* Activity List */
                displayActivities.map((activity, index) => ((0,jsx_runtime.jsxs)("div", { className: (0,clsx.clsx)('flex items-start gap-3 p-3 rounded-lg', 'transition-colors duration-150', 'hover:bg-[var(--card-bg-secondary)]', getStatusBgColor(activity.status), index !== displayActivities.length - 1 && 'border-b border-[var(--border)]'), children: [(0,jsx_runtime.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: getActivityIcon(activity.type, activity.status) }), (0,jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [(0,jsx_runtime.jsx)("p", { className: "text-sm font-medium text-[var(--text-primary)] truncate", children: activity.title }), (0,jsx_runtime.jsx)("p", { className: "text-xs text-[var(--text-secondary)] mt-1", children: activity.description }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mt-2", children: [(0,jsx_runtime.jsx)("span", { className: "text-xs text-[var(--text-secondary)]", children: formatTimestamp(activity.timestamp) }), activity.entityCount !== undefined && ((0,jsx_runtime.jsxs)("span", { className: "text-xs text-[var(--accent-primary)] font-medium", children: [activity.entityCount.toLocaleString(), " items"] })), activity.user && ((0,jsx_runtime.jsxs)("span", { className: "text-xs text-[var(--text-secondary)]", children: ["by ", activity.user] }))] })] })] }, activity.id)))) }), activities.length > maxItems && ((0,jsx_runtime.jsx)("div", { className: "mt-4 pt-3 border-t border-[var(--border)] text-center", children: (0,jsx_runtime.jsxs)("button", { className: "text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors", onClick: () => { }, children: ["View all ", activities.length, " activities \u2192"] }) }))] }));
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
    return ((0,jsx_runtime.jsxs)(ModernCard, { className: className, hoverable: false, children: [(0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-[var(--text-primary)] mb-4", children: "Quick Actions" }), (0,jsx_runtime.jsxs)("div", { className: "space-y-2", children: [(0,jsx_runtime.jsxs)(Button.Button, { variant: "primary", className: "w-full justify-start", onClick: () => navigate('/discovery'), children: [(0,jsx_runtime.jsx)(lucide_react.Play, { className: "w-4 h-4 mr-2" }), "Start Discovery"] }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/migration'), children: [(0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4 mr-2" }), "Run Migration"] }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/users'), children: [(0,jsx_runtime.jsx)(lucide_react.Users, { className: "w-4 h-4 mr-2" }), "View Users"] }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/reports'), children: [(0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-4 h-4 mr-2" }), "View Reports"] }), (0,jsx_runtime.jsxs)(Button.Button, { variant: "secondary", className: "w-full justify-start", onClick: () => navigate('/settings'), children: [(0,jsx_runtime.jsx)(lucide_react.Settings, { className: "w-4 h-4 mr-2" }), "Settings"] })] })] }));
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
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)(Spinner.Spinner, { size: "lg", className: "mx-auto mb-4" }), (0,jsx_runtime.jsx)("p", { className: "text-[var(--text-secondary)]", children: "Loading dashboard..." })] }) }));
    }
    // Error state
    if (error && !stats) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center max-w-md", children: [(0,jsx_runtime.jsx)(lucide_react.AlertCircle, { className: "w-16 h-16 text-[var(--danger)] mx-auto mb-4" }), (0,jsx_runtime.jsx)("h2", { className: "text-xl font-semibold text-[var(--text-primary)] mb-2", children: "Failed to Load Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-[var(--danger)] mb-6", children: error }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: reload, variant: "primary", children: [(0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4 mr-2" }), "Retry"] })] }) }));
    }
    // No data state
    if (!stats || !project) {
        return ((0,jsx_runtime.jsx)("div", { className: "flex items-center justify-center h-full min-h-[600px]", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)("p", { className: "text-[var(--text-secondary)] mb-4", children: "No data available" }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: reload, variant: "secondary", children: [(0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] }) }));
    }
    return ((0,jsx_runtime.jsxs)("div", { className: "p-6 space-y-6 overflow-auto", "data-testid": "overview-view", "data-cy": "overview-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex justify-between items-center", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-[var(--text-primary)]", children: "Dashboard" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-[var(--text-secondary)] mt-1", children: "M&A Discovery Suite Overview" })] }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: reload, variant: "secondary", size: "sm", disabled: isLoading, children: [(0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: `w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}` }), "Refresh"] })] }), (0,jsx_runtime.jsx)(ProjectTimelineCard, { project: project }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [(0,jsx_runtime.jsx)(StatisticsCard, { title: "Users", value: stats?.totalUsers || 0, discovered: stats?.discoveredUsers, migrated: stats?.migratedUsers, icon: (0,jsx_runtime.jsx)(lucide_react.Users, { className: "w-6 h-6" }), onClick: () => navigate('/users'), "data-cy": "stats-users", "data-testid": "stats-users" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Groups", value: stats?.totalGroups || 0, discovered: stats?.discoveredGroups, migrated: stats?.migratedGroups, icon: (0,jsx_runtime.jsx)(lucide_react.Layers, { className: "w-6 h-6" }), onClick: () => navigate('/groups'), "data-cy": "stats-groups", "data-testid": "stats-groups" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Computers", value: stats?.totalComputers || 0, discovered: stats?.discoveredComputers, icon: (0,jsx_runtime.jsx)(lucide_react.Monitor, { className: "w-6 h-6" }), onClick: () => navigate('/computers'), "data-cy": "stats-computers", "data-testid": "stats-computers" }), (0,jsx_runtime.jsx)(StatisticsCard, { title: "Infrastructure", value: stats?.totalInfrastructure || 0, icon: (0,jsx_runtime.jsx)(lucide_react.Server, { className: "w-6 h-6" }), onClick: () => navigate('/infrastructure'), "data-cy": "stats-infrastructure", "data-testid": "stats-infrastructure" })] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0,jsx_runtime.jsx)("div", { className: "lg:col-span-2", children: (0,jsx_runtime.jsx)(RecentActivityFeed, { activities: activity }) }), (0,jsx_runtime.jsxs)("div", { className: "space-y-6", children: [health && (0,jsx_runtime.jsx)(SystemHealthPanel, { health: health }), (0,jsx_runtime.jsx)(QuickActionsPanel, {})] })] }), (0,jsx_runtime.jsxs)("div", { className: "text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]", children: ["Last updated: ", new Date((stats?.lastDataRefresh ?? 0)).toLocaleString(), " | Data source: ", stats?.dataSource ?? 0] })] }));
};
/* harmony default export */ const overview_OverviewView = (OverviewView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLFdBQVcsNEZBQTRGLHNEQUFJLFdBQVcsV0FBVywwQ0FBSSxvRkFBb0YsSUFBSSxzREFBSSxXQUFXLG9CQUFvQix5Q0FBeUMsc0RBQUksV0FBVyxXQUFXLDBDQUFJLG9GQUFvRiw4QkFBOEIsc0RBQUksYUFBYSw4Q0FBOEMsMENBQUk7QUFDN2dCO0FBQ0E7QUFDQSxpQkFBaUIscUNBQXFDLHNEQUFJLFVBQVUsV0FBVywwQ0FBSTtBQUNuRjtBQUNBO0FBQ0EscUJBQXFCLHlEQUF5RCxzREFBSSxXQUFXLG1QQUFtUCxHQUFHLEdBQUcsS0FBSztBQUMzVjtBQUNBLGlFQUFlLEtBQUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZURhc2hib2FyZExvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvTW9kZXJuQ2FyZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvamVjdFRpbWVsaW5lQ2FyZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU3RhdGlzdGljc0NhcmQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1N5c3RlbUhlYWx0aFBhbmVsLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9SZWNlbnRBY3Rpdml0eUZlZWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1F1aWNrQWN0aW9uc1BhbmVsLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9vdmVydmlldy9PdmVydmlld1ZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogdXNlRGFzaGJvYXJkTG9naWMgSG9va1xuICpcbiAqIE1hbmFnZXMgZGFzaGJvYXJkIGRhdGEgbG9hZGluZywgYXV0by1yZWZyZXNoLCBhbmQgcmVhbC10aW1lIHVwZGF0ZXMuXG4gKiBJbnRlZ3JhdGVzIHdpdGggTG9naWMgRW5naW5lIHZpYSBkYXNoYm9hcmQgc2VydmljZSBBUElzLlxuICpcbiAqIFBoYXNlIDU6IERhc2hib2FyZCBGcm9udGVuZCBJbXBsZW1lbnRhdGlvblxuICogRml4ZWQ6IEFkZGVkIHByb2ZpbGVOYW1lIHBhcmFtZXRlciB0byBkYXNoYm9hcmQgbWV0aG9kIGNhbGxzXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgZ2V0RWxlY3Ryb25BUEkgfSBmcm9tICcuLi9saWIvZWxlY3Ryb24tYXBpLWZhbGxiYWNrJztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG4vKipcbiAqIERhc2hib2FyZCBsb2dpYyBob29rIHdpdGggYXV0by1yZWZyZXNoXG4gKlxuICogRmVhdHVyZXM6XG4gKiAtIExvYWRzIGFsbCBkYXNoYm9hcmQgZGF0YSBvbiBtb3VudFxuICogLSBBdXRvLXJlZnJlc2hlcyBldmVyeSAzMCBzZWNvbmRzXG4gKiAtIEhhbmRsZXMgZXJyb3JzIGdyYWNlZnVsbHlcbiAqIC0gUHJvdmlkZXMgbWFudWFsIHJlbG9hZCBmdW5jdGlvblxuICogLSBBbGVydCBhY2tub3dsZWRnbWVudFxuICpcbiAqIEByZXR1cm5zIERhc2hib2FyZCBzdGF0ZSBhbmQgYWN0aW9uc1xuICovXG5leHBvcnQgY29uc3QgdXNlRGFzaGJvYXJkTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3N0YXRzLCBzZXRTdGF0c10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcHJvamVjdCwgc2V0UHJvamVjdF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaGVhbHRoLCBzZXRIZWFsdGhdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2FjdGl2aXR5LCBzZXRBY3Rpdml0eV0gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gU3Vic2NyaWJlIHRvIHByb2ZpbGUgY2hhbmdlc1xuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlUHJvZmlsZSA9IHVzZVByb2ZpbGVTdG9yZShzdGF0ZSA9PiBzdGF0ZS5zZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgIC8qKlxuICAgICAqIExvYWQgYWxsIGRhc2hib2FyZCBkYXRhIGZyb20gYmFja2VuZCBzZXJ2aWNlc1xuICAgICAqL1xuICAgIGNvbnN0IGxvYWREYXNoYm9hcmREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICAvLyBHZXQgY3VycmVudCBwcm9maWxlIG5hbWUgZnJvbSB0aGUgaG9vayBzdWJzY3JpcHRpb25cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlRGFzaGJvYXJkTG9naWNdIHNlbGVjdGVkU291cmNlUHJvZmlsZTonLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgICAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcignTm8gYWN0aXZlIHByb2ZpbGUgc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNvbXBhbnlOYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t1c2VEYXNoYm9hcmRMb2dpY10gcHJvZmlsZU5hbWUgZXh0cmFjdGVkOicsIHByb2ZpbGVOYW1lKTtcbiAgICAgICAgICAgIC8vIEdldCBlbGVjdHJvbkFQSSB3aXRoIGZhbGxiYWNrXG4gICAgICAgICAgICBjb25zdCBlbGVjdHJvbkFQSSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgICAgICAvLyBQYXJhbGxlbCBmZXRjaCBhbGwgZGFzaGJvYXJkIGNvbXBvbmVudHMgKHBhc3MgcHJvZmlsZU5hbWUgdG8gbWV0aG9kcyB0aGF0IHJlcXVpcmUgaXQpXG4gICAgICAgICAgICBjb25zdCBbc3RhdHNSZXN1bHQsIHByb2plY3RSZXN1bHQsIGhlYWx0aFJlc3VsdCwgYWN0aXZpdHlSZXN1bHRdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgICAgIGVsZWN0cm9uQVBJLmRhc2hib2FyZC5nZXRTdGF0cyhwcm9maWxlTmFtZSksXG4gICAgICAgICAgICAgICAgZWxlY3Ryb25BUEkuZGFzaGJvYXJkLmdldFByb2plY3RUaW1lbGluZShwcm9maWxlTmFtZSksXG4gICAgICAgICAgICAgICAgZWxlY3Ryb25BUEkuZGFzaGJvYXJkLmdldFN5c3RlbUhlYWx0aCgpLFxuICAgICAgICAgICAgICAgIGVsZWN0cm9uQVBJLmRhc2hib2FyZC5nZXRSZWNlbnRBY3Rpdml0eShwcm9maWxlTmFtZSwgMTApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzdGF0ZSB3aXRoIGZldGNoZWQgZGF0YVxuICAgICAgICAgICAgc2V0U3RhdHMoc3RhdHNSZXN1bHQ/LnN1Y2Nlc3MgPyBzdGF0c1Jlc3VsdC5kYXRhIDogc3RhdHNSZXN1bHQpO1xuICAgICAgICAgICAgc2V0UHJvamVjdChwcm9qZWN0UmVzdWx0Py5zdWNjZXNzID8gcHJvamVjdFJlc3VsdC5kYXRhIDogcHJvamVjdFJlc3VsdCk7XG4gICAgICAgICAgICBzZXRIZWFsdGgoaGVhbHRoUmVzdWx0Py5zdWNjZXNzID8gaGVhbHRoUmVzdWx0LmRhdGEgOiBoZWFsdGhSZXN1bHQpO1xuICAgICAgICAgICAgLy8gSGFuZGxlIGFjdGl2aXR5UmVzdWx0IHdoaWNoIGNhbiBiZSBhcnJheSBvciByZXNwb25zZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFjdGl2aXR5UmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIHNldEFjdGl2aXR5KGFjdGl2aXR5UmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFjdGl2aXR5UmVzdWx0ICYmIHR5cGVvZiBhY3Rpdml0eVJlc3VsdCA9PT0gJ29iamVjdCcgJiYgJ3N1Y2Nlc3MnIGluIGFjdGl2aXR5UmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgc2V0QWN0aXZpdHkoYWN0aXZpdHlSZXN1bHQuc3VjY2VzcyA/IGFjdGl2aXR5UmVzdWx0LmRhdGEgOiBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRBY3Rpdml0eShbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyPy5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gbG9hZCBkYXNoYm9hcmQgZGF0YSc7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRGFzaGJvYXJkIGxvYWQgZXJyb3I6JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlXSk7XG4gICAgLyoqXG4gICAgICogQWNrbm93bGVkZ2UgYSBzeXN0ZW0gYWxlcnRcbiAgICAgKi9cbiAgICBjb25zdCBhY2tub3dsZWRnZUFsZXJ0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKGFsZXJ0SWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIGF3YWl0IGVsZWN0cm9uQVBJLmRhc2hib2FyZC5hY2tub3dsZWRnZUFsZXJ0KGFsZXJ0SWQpO1xuICAgICAgICAgICAgLy8gUmVmcmVzaCBoZWFsdGggZGF0YSB0byB1cGRhdGUgYWxlcnQgbGlzdFxuICAgICAgICAgICAgYXdhaXQgbG9hZERhc2hib2FyZERhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gYWNrbm93bGVkZ2UgYWxlcnQ6JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH0sIFtsb2FkRGFzaGJvYXJkRGF0YV0pO1xuICAgIC8qKlxuICAgICAqIEluaXRpYWwgbG9hZCBhbmQgYXV0by1yZWZyZXNoIHNldHVwXG4gICAgICogV2FpdCBmb3IgcHJvZmlsZSB0byBiZSBhdmFpbGFibGUgYmVmb3JlIGxvYWRpbmcgZGFzaGJvYXJkIGRhdGFcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICAvLyBPbmx5IGxvYWQgaWYgd2UgaGF2ZSBhIHByb2ZpbGVcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlRGFzaGJvYXJkTG9naWNdIFdhaXRpbmcgZm9yIHByb2ZpbGUgdG8gYmUgc2VsZWN0ZWQuLi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnW3VzZURhc2hib2FyZExvZ2ljXSBQcm9maWxlIGF2YWlsYWJsZSwgbG9hZGluZyBkYXNoYm9hcmQgZGF0YS4uLicpO1xuICAgICAgICAvLyBJbml0aWFsIGxvYWRcbiAgICAgICAgbG9hZERhc2hib2FyZERhdGEoKTtcbiAgICAgICAgLy8gQXV0by1yZWZyZXNoIGV2ZXJ5IDMwIHNlY29uZHNcbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBsb2FkRGFzaGJvYXJkRGF0YSgpO1xuICAgICAgICB9LCAzMDAwMCk7XG4gICAgICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBsb2FkRGFzaGJvYXJkRGF0YV0pOyAvLyBSZWxvYWQgd2hlbiBwcm9maWxlIGNoYW5nZXNcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGF0cyxcbiAgICAgICAgcHJvamVjdCxcbiAgICAgICAgaGVhbHRoLFxuICAgICAgICBhY3Rpdml0eSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgcmVsb2FkOiBsb2FkRGFzaGJvYXJkRGF0YSxcbiAgICAgICAgYWNrbm93bGVkZ2VBbGVydFxuICAgIH07XG59O1xuZXhwb3J0IGRlZmF1bHQgdXNlRGFzaGJvYXJkTG9naWM7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBNb2Rlcm5DYXJkIENvbXBvbmVudFxuICpcbiAqIE1vZGVybiBjYXJkIGNvbnRhaW5lciB3aXRoIGdyYWRpZW50IGJhY2tncm91bmRzLCBuZW9uIHNoYWRvd3MsIGFuZCBob3ZlciBlZmZlY3RzLlxuICpcbiAqIEVwaWMgMDogVUkvVVggUGFyaXR5IC0gUmVwbGFjZXMgV1BGIE1vZGVybkNhcmRTdHlsZVxuICogRmVhdHVyZXMgZ3JhZGllbnQgYmFja2dyb3VuZHMsIGJvcmRlciBhbmltYXRpb25zLCBhbmQgc2NhbGUgdHJhbnNmb3Jtcy5cbiAqXG4gKiBAY29tcG9uZW50XG4gKiBAZXhhbXBsZVxuICogYGBgdHN4XG4gKiA8TW9kZXJuQ2FyZD5cbiAqICAgPGgyPkNhcmQgVGl0bGU8L2gyPlxuICogICA8cD5DYXJkIGNvbnRlbnQ8L3A+XG4gKiA8L01vZGVybkNhcmQ+XG4gKlxuICogPE1vZGVybkNhcmQgaG92ZXJhYmxlPXtmYWxzZX0gdmFyaWFudD1cIm1ldHJpY1wiPlxuICogICA8TWV0cmljRGlzcGxheSB2YWx1ZT17MTIzNH0gbGFiZWw9XCJUb3RhbCBVc2Vyc1wiIC8+XG4gKiA8L01vZGVybkNhcmQ+XG4gKiBgYGBcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogTW9kZXJuQ2FyZCBDb21wb25lbnRcbiAqXG4gKiBSZXBsaWNhdGVzIFdQRiBNb2Rlcm5DYXJkU3R5bGUgd2l0aCBncmFkaWVudCBiYWNrZ3JvdW5kcyBhbmQgbmVvbiBlZmZlY3RzLlxuICogVXNlcyBkZXNpZ24gc3lzdGVtIGZyb20gRXBpYyAwIGFyY2hpdGVjdHVyZS5cbiAqL1xuZXhwb3J0IGNvbnN0IE1vZGVybkNhcmQgPSBSZWFjdC5tZW1vKCh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBob3ZlcmFibGUgPSB0cnVlLCBoZWFkZXIsIGZvb3Rlciwgb25DbGljaywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFZhcmlhbnQtc3BlY2lmaWMgY2xhc3Nlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiBjbHN4KCdtb2Rlcm4tY2FyZCcsIGhvdmVyYWJsZSAmJiAnaG92ZXI6c2NhbGUtWzEuMDFdJyksXG4gICAgICAgIG1ldHJpYzogY2xzeCgnbWV0cmljLWNhcmQnKSxcbiAgICAgICAgc2VjdGlvbjogY2xzeCgnc2VjdGlvbi1ib3JkZXInKSxcbiAgICAgICAgZ2xhc3M6IGNsc3goJ2dsYXNzLWNhcmQnLCAncC01IG0tMicsIGhvdmVyYWJsZSAmJiAnaG92ZXI6c2NhbGUtWzEuMDFdIGhvdmVyOnNoYWRvdy1jYXJkLWhvdmVyJyksXG4gICAgfTtcbiAgICBjb25zdCBjYXJkQ2xhc3NlcyA9IGNsc3godmFyaWFudENsYXNzZXNbdmFyaWFudF0sIG9uQ2xpY2sgJiYgJ2N1cnNvci1wb2ludGVyJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjYXJkQ2xhc3Nlcywgb25DbGljazogb25DbGljaywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgcm9sZTogb25DbGljayA/ICdidXR0b24nIDogdW5kZWZpbmVkLCB0YWJJbmRleDogb25DbGljayA/IDAgOiB1bmRlZmluZWQsIG9uS2V5RG93bjogb25DbGljayA/IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgfHwgZS5rZXkgPT09ICcgJykge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBvbkNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gOiB1bmRlZmluZWQsIGNoaWxkcmVuOiBbaGVhZGVyICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTQgcGItNCBib3JkZXItYiBib3JkZXItW3ZhcigtLWJvcmRlcildXCIsIGNoaWxkcmVuOiBoZWFkZXIgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImNhcmQtY29udGVudFwiLCBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGZvb3RlciAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtdC00IHB0LTQgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXVwiLCBjaGlsZHJlbjogZm9vdGVyIH0pKV0gfSkpO1xufSk7XG5Nb2Rlcm5DYXJkLmRpc3BsYXlOYW1lID0gJ01vZGVybkNhcmQnO1xuZXhwb3J0IGRlZmF1bHQgTW9kZXJuQ2FyZDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFByb2plY3RUaW1lbGluZUNhcmQgQ29tcG9uZW50XG4gKlxuICogRGlzcGxheXMgcHJvamVjdCB0aW1lbGluZSwgd2F2ZSBwcm9ncmVzcywgYW5kIGN1dG92ZXIgY291bnRkb3duLlxuICogU2hvd3MgY3VycmVudCBwaGFzZSwgZGF5cyB0byBtaWxlc3RvbmVzLCBhbmQgb3ZlcmFsbCBwcm9ncmVzcy5cbiAqXG4gKiBQaGFzZSA2OiBEYXNoYm9hcmQgVUkgQ29tcG9uZW50c1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2FsZW5kYXIsIENsb2NrLCBUcmVuZGluZ1VwLCBUYXJnZXQgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgTW9kZXJuQ2FyZCB9IGZyb20gJy4uL2F0b21zL01vZGVybkNhcmQnO1xuaW1wb3J0IHsgQmFkZ2UgfSBmcm9tICcuLi9hdG9tcy9CYWRnZSc7XG4vKipcbiAqIEdldCBiYWRnZSB2YXJpYW50IGJhc2VkIG9uIHByb2plY3QgcGhhc2VcbiAqL1xuY29uc3QgZ2V0UGhhc2VWYXJpYW50ID0gKHBoYXNlKSA9PiB7XG4gICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICBjYXNlICdDb21wbGV0ZSc6XG4gICAgICAgICAgICByZXR1cm4gJ3N1Y2Nlc3MnO1xuICAgICAgICBjYXNlICdNaWdyYXRpb24nOlxuICAgICAgICBjYXNlICdDdXRvdmVyJzpcbiAgICAgICAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgICAgIGNhc2UgJ1BsYW5uaW5nJzpcbiAgICAgICAgY2FzZSAnRGlzY292ZXJ5JzpcbiAgICAgICAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgICAgIGNhc2UgJ1ZhbGlkYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuICdwcmltYXJ5JztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnZGVmYXVsdCc7XG4gICAgfVxufTtcbi8qKlxuICogUHJvamVjdFRpbWVsaW5lQ2FyZCBDb21wb25lbnRcbiAqXG4gKiBDb21wcmVoZW5zaXZlIHByb2plY3QgdGltZWxpbmUgZGlzcGxheSB3aXRoOlxuICogLSBQcm9qZWN0IG5hbWUgYW5kIGN1cnJlbnQgcGhhc2VcbiAqIC0gQ291bnRkb3duIHRvIGN1dG92ZXIgYW5kIG5leHQgd2F2ZVxuICogLSBXYXZlIGNvbXBsZXRpb24gcHJvZ3Jlc3NcbiAqIC0gT3ZlcmFsbCBwcm9ncmVzcyBiYXJcbiAqL1xuZXhwb3J0IGNvbnN0IFByb2plY3RUaW1lbGluZUNhcmQgPSAoeyBwcm9qZWN0LCBjbGFzc05hbWUgfSkgPT4ge1xuICAgIGNvbnN0IHByb2dyZXNzUGVyY2VudGFnZSA9IHByb2plY3QudG90YWxXYXZlcyA+IDBcbiAgICAgICAgPyBNYXRoLnJvdW5kKChwcm9qZWN0LmNvbXBsZXRlZFdhdmVzIC8gcHJvamVjdC50b3RhbFdhdmVzKSAqIDEwMClcbiAgICAgICAgOiAwO1xuICAgIGNvbnN0IGZvcm1hdERhdGUgPSAoZGF0ZVN0cmluZykgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoZGF0ZVN0cmluZykudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHtcbiAgICAgICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICAgICAgZGF5OiAnbnVtZXJpYycsXG4gICAgICAgICAgICB5ZWFyOiAnbnVtZXJpYydcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGhvdmVyYWJsZTogZmFsc2UsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldIG1iLTJcIiwgY2hpbGRyZW46IHByb2plY3QucHJvamVjdE5hbWUgfSksIF9qc3goQmFkZ2UsIHsgdmFyaWFudDogZ2V0UGhhc2VWYXJpYW50KHByb2plY3QuY3VycmVudFBoYXNlKSwgc2l6ZTogXCJtZFwiLCBjaGlsZHJlbjogcHJvamVjdC5jdXJyZW50UGhhc2UgfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmlnaHRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogW19qc3goVGFyZ2V0LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJUYXJnZXQ6IFwiLCBmb3JtYXREYXRlKHByb2plY3QudGFyZ2V0Q3V0b3ZlcildIH0pXSB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTYgbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHAtNCByb3VuZGVkLWxnIGJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTR4bCBmb250LWJvbGQgdGV4dC1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBtYi0xXCIsIGNoaWxkcmVuOiBwcm9qZWN0LmRheXNUb0N1dG92ZXIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMVwiLCBjaGlsZHJlbjogW19qc3goQ2FsZW5kYXIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJEYXlzIHRvIEN1dG92ZXJcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBwLTQgcm91bmRlZC1sZyBiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC00eGwgZm9udC1ib2xkIHRleHQtW3ZhcigtLXdhcm5pbmcpXSBtYi0xXCIsIGNoaWxkcmVuOiBwcm9qZWN0LmRheXNUb05leHRXYXZlIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KENsb2NrLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IFwiRGF5cyB0byBOZXh0IFdhdmVcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlciBwLTQgcm91bmRlZC1sZyBiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtNHhsIGZvbnQtYm9sZCB0ZXh0LVt2YXIoLS1zdWNjZXNzKV0gbWItMVwiLCBjaGlsZHJlbjogW3Byb2plY3QuY29tcGxldGVkV2F2ZXMsIFwiL1wiLCBwcm9qZWN0LnRvdGFsV2F2ZXNdIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTFcIiwgY2hpbGRyZW46IFtfanN4KFRyZW5kaW5nVXAsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogXCJXYXZlcyBDb21wbGV0ZWRcIiB9KV0gfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC1zbVwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV1cIiwgY2hpbGRyZW46IFwiT3ZlcmFsbCBQcm9ncmVzc1wiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV1cIiwgY2hpbGRyZW46IFtwcm9ncmVzc1BlcmNlbnRhZ2UsIFwiJVwiXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy1mdWxsIGJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldIHJvdW5kZWQtZnVsbCBoLTNcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLVt2YXIoLS1hY2NlbnQtcHJpbWFyeSldIHRvLVt2YXIoLS1hY2NlbnQtc2Vjb25kYXJ5KV0gcm91bmRlZC1mdWxsIGgtMyB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi01MDAgZWFzZS1vdXRcIiwgc3R5bGU6IHsgd2lkdGg6IGAke3Byb2dyZXNzUGVyY2VudGFnZX0lYCB9LCByb2xlOiBcInByb2dyZXNzYmFyXCIsIFwiYXJpYS12YWx1ZW5vd1wiOiBwcm9ncmVzc1BlcmNlbnRhZ2UsIFwiYXJpYS12YWx1ZW1pblwiOiAwLCBcImFyaWEtdmFsdWVtYXhcIjogMTAwIH0pIH0pXSB9KSwgcHJvamVjdC5wcm9qZWN0RGVzY3JpcHRpb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBwdC00IGJvcmRlci10IGJvcmRlci1bdmFyKC0tYm9yZGVyKV1cIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogcHJvamVjdC5wcm9qZWN0RGVzY3JpcHRpb24gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgUHJvamVjdFRpbWVsaW5lQ2FyZDtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFN0YXRpc3RpY3NDYXJkIENvbXBvbmVudFxuICpcbiAqIENsaWNrYWJsZSBjYXJkIGRpc3BsYXlpbmcgZW50aXR5IHN0YXRpc3RpY3Mgd2l0aCBkaXNjb3ZlcmVkL21pZ3JhdGVkIGJyZWFrZG93bi5cbiAqIFVzZWQgZm9yIGRhc2hib2FyZCBvdmVydmlldyBtZXRyaWNzIChVc2VycywgR3JvdXBzLCBDb21wdXRlcnMsIGV0Yy4pXG4gKlxuICogUGhhc2UgNjogRGFzaGJvYXJkIFVJIENvbXBvbmVudHNcbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IE1vZGVybkNhcmQgfSBmcm9tICcuLi9hdG9tcy9Nb2Rlcm5DYXJkJztcbi8qKlxuICogU3RhdGlzdGljc0NhcmQgQ29tcG9uZW50XG4gKlxuICogSW50ZXJhY3RpdmUgc3RhdGlzdGljcyBkaXNwbGF5IHdpdGg6XG4gKiAtIExhcmdlIHZhbHVlIGRpc3BsYXlcbiAqIC0gT3B0aW9uYWwgaWNvblxuICogLSBEaXNjb3ZlcmVkL21pZ3JhdGVkIGJyZWFrZG93blxuICogLSBIb3ZlciBlZmZlY3RzIGZvciBuYXZpZ2F0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBTdGF0aXN0aWNzQ2FyZCA9ICh7IHRpdGxlLCB2YWx1ZSwgZGlzY292ZXJlZCwgbWlncmF0ZWQsIGljb24sIG9uQ2xpY2ssIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbHN4KCd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBvbkNsaWNrICYmICdjdXJzb3ItcG9pbnRlciBob3Zlcjpib3JkZXItW3ZhcigtLWFjY2VudC1wcmltYXJ5KV0gaG92ZXI6c2hhZG93LWxnJywgY2xhc3NOYW1lKSwgb25DbGljazogb25DbGljaywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIG1iLTEgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVcIiwgY2hpbGRyZW46IHRpdGxlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTR4bCBmb250LWJvbGQgdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV0gbXQtMlwiLCBjaGlsZHJlbjogKHZhbHVlID8/IDApLnRvTG9jYWxlU3RyaW5nKCkgfSldIH0pLCBpY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtW3ZhcigtLWFjY2VudC1wcmltYXJ5KV0gb3BhY2l0eS04MFwiLCBjaGlsZHJlbjogaWNvbiB9KSldIH0pLCAoZGlzY292ZXJlZCAhPT0gdW5kZWZpbmVkIHx8IG1pZ3JhdGVkICE9PSB1bmRlZmluZWQpICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0yIGdhcC0zIHB0LTQgYm9yZGVyLXQgYm9yZGVyLVt2YXIoLS1ib3JkZXIpXVwiLCBjaGlsZHJlbjogW2Rpc2NvdmVyZWQgIT09IHVuZGVmaW5lZCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMVwiLCBjaGlsZHJlbjogXCJEaXNjb3ZlcmVkXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS1pbmZvKV1cIiwgY2hpbGRyZW46IChkaXNjb3ZlcmVkID8/IDApLnRvTG9jYWxlU3RyaW5nKCkgfSldIH0pKSwgbWlncmF0ZWQgIT09IHVuZGVmaW5lZCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMVwiLCBjaGlsZHJlbjogXCJNaWdyYXRlZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1bdmFyKC0tc3VjY2VzcyldXCIsIGNoaWxkcmVuOiAobWlncmF0ZWQgPz8gMCkudG9Mb2NhbGVTdHJpbmcoKSB9KV0gfSkpXSB9KSksIG9uQ2xpY2sgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtMyB0ZXh0LXhzIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gb3BhY2l0eS0wIGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eVwiLCBjaGlsZHJlbjogXCJDbGljayB0byB2aWV3IGRldGFpbHMgXFx1MjE5MlwiIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFN0YXRpc3RpY3NDYXJkO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU3lzdGVtSGVhbHRoUGFuZWwgQ29tcG9uZW50XG4gKlxuICogRGlzcGxheXMgc3lzdGVtIGhlYWx0aCBzdGF0dXMgZm9yIExvZ2ljIEVuZ2luZSwgUG93ZXJTaGVsbCwgYW5kIG90aGVyIHNlcnZpY2VzLlxuICogU2hvd3Mgc2VydmljZSBzdGF0dXMgaW5kaWNhdG9ycywgZGF0YSBmcmVzaG5lc3MsIGFuZCByZWNlbnQgZXJyb3JzLlxuICpcbiAqIFBoYXNlIDY6IERhc2hib2FyZCBVSSBDb21wb25lbnRzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgQ2hlY2tDaXJjbGUsIFhDaXJjbGUsIENsb2NrIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IE1vZGVybkNhcmQgfSBmcm9tICcuLi9hdG9tcy9Nb2Rlcm5DYXJkJztcbmltcG9ydCB7IFN0YXR1c0luZGljYXRvciB9IGZyb20gJy4uL2F0b21zL1N0YXR1c0luZGljYXRvcic7XG4vKipcbiAqIEdldCBzdGF0dXMgdHlwZSBmb3IgU3RhdHVzSW5kaWNhdG9yIGJhc2VkIG9uIHNlcnZpY2Ugc3RhdHVzXG4gKi9cbmNvbnN0IGdldFN0YXR1c1R5cGUgPSAoc3RhdHVzKSA9PiB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnb25saW5lJzpcbiAgICAgICAgICAgIHJldHVybiAnc3VjY2Vzcyc7XG4gICAgICAgIGNhc2UgJ2RlZ3JhZGVkJzpcbiAgICAgICAgICAgIHJldHVybiAnd2FybmluZyc7XG4gICAgICAgIGNhc2UgJ29mZmxpbmUnOlxuICAgICAgICBjYXNlICd1bmtub3duJzpcbiAgICAgICAgICAgIHJldHVybiAnZXJyb3InO1xuICAgIH1cbn07XG4vKipcbiAqIEdldCBpY29uIGZvciBzZXJ2aWNlIHN0YXR1c1xuICovXG5jb25zdCBnZXRTdGF0dXNJY29uID0gKHN0YXR1cykgPT4ge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgJ29ubGluZSc6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChDaGVja0NpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pO1xuICAgICAgICBjYXNlICdkZWdyYWRlZCc6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pO1xuICAgICAgICBjYXNlICdvZmZsaW5lJzpcbiAgICAgICAgY2FzZSAndW5rbm93bic6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChYQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSk7XG4gICAgfVxufTtcbi8qKlxuICogRm9ybWF0IGRhdGEgZnJlc2huZXNzIHRpbWVcbiAqL1xuY29uc3QgZm9ybWF0RnJlc2huZXNzID0gKG1pbnV0ZXMpID0+IHtcbiAgICBpZiAobWludXRlcyA8IDEpXG4gICAgICAgIHJldHVybiAnSnVzdCBub3cnO1xuICAgIGlmIChtaW51dGVzIDwgNjApXG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1pbnV0ZXMpfW0gYWdvYDtcbiAgICBjb25zdCBob3VycyA9IE1hdGgucm91bmQobWludXRlcyAvIDYwKTtcbiAgICBpZiAoaG91cnMgPCAyNClcbiAgICAgICAgcmV0dXJuIGAke2hvdXJzfWggYWdvYDtcbiAgICBjb25zdCBkYXlzID0gTWF0aC5yb3VuZChob3VycyAvIDI0KTtcbiAgICByZXR1cm4gYCR7ZGF5c31kIGFnb2A7XG59O1xuLyoqXG4gKiBTeXN0ZW1IZWFsdGhQYW5lbCBDb21wb25lbnRcbiAqXG4gKiBDb21wcmVoZW5zaXZlIHN5c3RlbSBoZWFsdGggbW9uaXRvcmluZyB3aXRoOlxuICogLSBTZXJ2aWNlIHN0YXR1cyBpbmRpY2F0b3JzXG4gKiAtIERhdGEgZnJlc2huZXNzIHRyYWNraW5nXG4gKiAtIEVycm9yIGNvdW50IGRpc3BsYXlcbiAqIC0gUGVyZm9ybWFuY2UgbWV0cmljcyAob3B0aW9uYWwpXG4gKi9cbmV4cG9ydCBjb25zdCBTeXN0ZW1IZWFsdGhQYW5lbCA9ICh7IGhlYWx0aCwgY2xhc3NOYW1lIH0pID0+IHtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGhvdmVyYWJsZTogZmFsc2UsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXSBtYi00XCIsIGNoaWxkcmVuOiBcIlN5c3RlbSBIZWFsdGhcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwic3BhY2UteS0zXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkxvZ2ljIEVuZ2luZVwiIH0pLCBfanN4KFN0YXR1c0luZGljYXRvciwgeyBzdGF0dXM6IGdldFN0YXR1c1R5cGUoaGVhbHRoPy5sb2dpY0VuZ2luZVN0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJyksIHRleHQ6IGhlYWx0aD8ubG9naWNFbmdpbmVTdGF0dXM/LnN0YXR1cyB8fCAndW5rbm93bicsIHNpemU6IFwic21cIiwgYW5pbWF0ZTogaGVhbHRoPy5sb2dpY0VuZ2luZVN0YXR1cz8uc3RhdHVzID09PSAnb25saW5lJyB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTIgcm91bmRlZC1sZyBob3ZlcjpiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXSB0cmFuc2l0aW9uLWNvbG9yc1wiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJQb3dlclNoZWxsXCIgfSksIF9qc3goU3RhdHVzSW5kaWNhdG9yLCB7IHN0YXR1czogZ2V0U3RhdHVzVHlwZShoZWFsdGg/LnBvd2VyU2hlbGxTdGF0dXM/LnN0YXR1cyB8fCAndW5rbm93bicpLCB0ZXh0OiBoZWFsdGg/LnBvd2VyU2hlbGxTdGF0dXM/LnN0YXR1cyB8fCAndW5rbm93bicsIHNpemU6IFwic21cIiwgYW5pbWF0ZTogaGVhbHRoPy5wb3dlclNoZWxsU3RhdHVzPy5zdGF0dXMgPT09ICdvbmxpbmUnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkZpbGUgU3lzdGVtXCIgfSksIF9qc3goU3RhdHVzSW5kaWNhdG9yLCB7IHN0YXR1czogZ2V0U3RhdHVzVHlwZShoZWFsdGg/LmZpbGVTeXN0ZW1TdGF0dXM/LnN0YXR1cyB8fCAndW5rbm93bicpLCB0ZXh0OiBoZWFsdGg/LmZpbGVTeXN0ZW1TdGF0dXM/LnN0YXR1cyB8fCAndW5rbm93bicsIHNpemU6IFwic21cIiwgYW5pbWF0ZTogaGVhbHRoPy5maWxlU3lzdGVtU3RhdHVzPy5zdGF0dXMgPT09ICdvbmxpbmUnIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMiByb3VuZGVkLWxnIGhvdmVyOmJnLVt2YXIoLS1jYXJkLWJnLXNlY29uZGFyeSldIHRyYW5zaXRpb24tY29sb3JzXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIk5ldHdvcmtcIiB9KSwgX2pzeChTdGF0dXNJbmRpY2F0b3IsIHsgc3RhdHVzOiBnZXRTdGF0dXNUeXBlKGhlYWx0aD8ubmV0d29ya1N0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJyksIHRleHQ6IGhlYWx0aD8ubmV0d29ya1N0YXR1cz8uc3RhdHVzIHx8ICd1bmtub3duJywgc2l6ZTogXCJzbVwiLCBhbmltYXRlOiBoZWFsdGg/Lm5ldHdvcmtTdGF0dXM/LnN0YXR1cyA9PT0gJ29ubGluZScgfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0yIHJvdW5kZWQtbGcgaG92ZXI6YmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0gdHJhbnNpdGlvbi1jb2xvcnMgbXQtNCBwdC00IGJvcmRlci10IGJvcmRlci1bdmFyKC0tYm9yZGVyKV1cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goQ2xvY2ssIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiRGF0YSBGcmVzaG5lc3NcIiB9KV0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV1cIiwgY2hpbGRyZW46IGZvcm1hdEZyZXNobmVzcyhoZWFsdGg/LmRhdGFGcmVzaG5lc3NNaW51dGVzIHx8IDApIH0pXSB9KSwgKGhlYWx0aD8ubGFzdEVycm9yQ291bnQgfHwgMCkgPiAwICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0yIHJvdW5kZWQtbGcgYmctW3ZhcigtLWRhbmdlcildLzEwIGJvcmRlciBib3JkZXItW3ZhcigtLWRhbmdlcildLzIwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLWRhbmdlcildXCIgfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tZGFuZ2VyKV0gZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiUmVjZW50IEVycm9yc1wiIH0pXSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1bdmFyKC0tZGFuZ2VyKV1cIiwgY2hpbGRyZW46IGhlYWx0aD8ubGFzdEVycm9yQ291bnQgfHwgMCB9KV0gfSkpLCBoZWFsdGg/Lm1lbW9yeVVzYWdlTUIgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTMgcHQtMyBib3JkZXItdCBib3JkZXItW3ZhcigtLWJvcmRlcildIHNwYWNlLXktMlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIHRleHQteHNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBcIk1lbW9yeSBVc2FnZVwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV1cIiwgY2hpbGRyZW46IFtoZWFsdGgubWVtb3J5VXNhZ2VNQi50b0ZpeGVkKDApLCBcIiBNQlwiXSB9KV0gfSksIGhlYWx0aD8uY3B1VXNhZ2VQZXJjZW50ICE9PSB1bmRlZmluZWQgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIHRleHQteHNcIiwgY2hpbGRyZW46IFtfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBcIkNQVSBVc2FnZVwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1tZWRpdW0gdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV1cIiwgY2hpbGRyZW46IFtoZWFsdGguY3B1VXNhZ2VQZXJjZW50LnRvRml4ZWQoMSksIFwiJVwiXSB9KV0gfSkpXSB9KSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU3lzdGVtSGVhbHRoUGFuZWw7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBSZWNlbnRBY3Rpdml0eUZlZWQgQ29tcG9uZW50XG4gKlxuICogRGlzcGxheXMgcmVjZW50IHN5c3RlbSBhY3Rpdml0eSB3aXRoIGljb25zLCB0aW1lc3RhbXBzLCBhbmQgZGVzY3JpcHRpb25zLlxuICogU2hvd3MgZGlzY292ZXJ5IHJ1bnMsIG1pZ3JhdGlvbiBldmVudHMsIGVycm9ycywgYW5kIGNvbmZpZ3VyYXRpb24gY2hhbmdlcy5cbiAqXG4gKiBQaGFzZSA2OiBEYXNoYm9hcmQgVUkgQ29tcG9uZW50c1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWN0aXZpdHksIEFsZXJ0Q2lyY2xlLCBDaGVja0NpcmNsZSwgU2VhcmNoLCBEb3dubG9hZCwgU2V0dGluZ3MsIEFsZXJ0VHJpYW5nbGUgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTW9kZXJuQ2FyZCB9IGZyb20gJy4uL2F0b21zL01vZGVybkNhcmQnO1xuLyoqXG4gKiBHZXQgaWNvbiBjb21wb25lbnQgYmFzZWQgb24gYWN0aXZpdHkgdHlwZVxuICovXG5jb25zdCBnZXRBY3Rpdml0eUljb24gPSAodHlwZSwgc3RhdHVzKSA9PiB7XG4gICAgLy8gU3RhdHVzLWJhc2VkIGljb25zXG4gICAgaWYgKHN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgICAgICByZXR1cm4gX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS1kYW5nZXIpXVwiIH0pO1xuICAgIH1cbiAgICBpZiAoc3RhdHVzID09PSAnd2FybmluZycpIHtcbiAgICAgICAgcmV0dXJuIF9qc3goQWxlcnRUcmlhbmdsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS13YXJuaW5nKV1cIiB9KTtcbiAgICB9XG4gICAgaWYgKHN0YXR1cyA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgIHJldHVybiBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLXN1Y2Nlc3MpXVwiIH0pO1xuICAgIH1cbiAgICAvLyBUeXBlLWJhc2VkIGljb25zXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ2Rpc2NvdmVyeSc6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0taW5mbyldXCIgfSk7XG4gICAgICAgIGNhc2UgJ21pZ3JhdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNCB0ZXh0LVt2YXIoLS1hY2NlbnQtcHJpbWFyeSldXCIgfSk7XG4gICAgICAgIGNhc2UgJ2NvbmZpZ3VyYXRpb24nOlxuICAgICAgICAgICAgcmV0dXJuIF9qc3goU2V0dGluZ3MsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiIH0pO1xuICAgICAgICBjYXNlICd2YWxpZGF0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiBfanN4KENoZWNrQ2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IHRleHQtW3ZhcigtLXN1Y2Nlc3MpXVwiIH0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIF9qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiIH0pO1xuICAgIH1cbn07XG4vKipcbiAqIEdldCBiYWNrZ3JvdW5kIGNvbG9yIGJhc2VkIG9uIHN0YXR1c1xuICovXG5jb25zdCBnZXRTdGF0dXNCZ0NvbG9yID0gKHN0YXR1cykgPT4ge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgIHJldHVybiAnYmctW3ZhcigtLWRhbmdlcildLzEwJztcbiAgICAgICAgY2FzZSAnd2FybmluZyc6XG4gICAgICAgICAgICByZXR1cm4gJ2JnLVt2YXIoLS13YXJuaW5nKV0vMTAnO1xuICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgIHJldHVybiAnYmctW3ZhcigtLXN1Y2Nlc3MpXS8xMCc7XG4gICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgcmV0dXJuICdiZy1bdmFyKC0taW5mbyldLzEwJztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAnYmctW3ZhcigtLWNhcmQtYmctc2Vjb25kYXJ5KV0nO1xuICAgIH1cbn07XG4vKipcbiAqIEZvcm1hdCB0aW1lc3RhbXAgdG8gcmVsYXRpdmUgdGltZVxuICovXG5jb25zdCBmb3JtYXRUaW1lc3RhbXAgPSAodGltZXN0YW1wKSA9PiB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBkaWZmTXMgPSBub3cuZ2V0VGltZSgpIC0gZGF0ZS5nZXRUaW1lKCk7XG4gICAgY29uc3QgZGlmZk1pbnMgPSBNYXRoLmZsb29yKGRpZmZNcyAvIDYwMDAwKTtcbiAgICBjb25zdCBkaWZmSG91cnMgPSBNYXRoLmZsb29yKGRpZmZNaW5zIC8gNjApO1xuICAgIGNvbnN0IGRpZmZEYXlzID0gTWF0aC5mbG9vcihkaWZmSG91cnMgLyAyNCk7XG4gICAgaWYgKGRpZmZNaW5zIDwgMSlcbiAgICAgICAgcmV0dXJuICdKdXN0IG5vdyc7XG4gICAgaWYgKGRpZmZNaW5zIDwgNjApXG4gICAgICAgIHJldHVybiBgJHtkaWZmTWluc31tIGFnb2A7XG4gICAgaWYgKGRpZmZIb3VycyA8IDI0KVxuICAgICAgICByZXR1cm4gYCR7ZGlmZkhvdXJzfWggYWdvYDtcbiAgICBpZiAoZGlmZkRheXMgPCA3KVxuICAgICAgICByZXR1cm4gYCR7ZGlmZkRheXN9ZCBhZ29gO1xuICAgIHJldHVybiBkYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7XG4gICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICBkYXk6ICdudW1lcmljJ1xuICAgIH0pO1xufTtcbi8qKlxuICogUmVjZW50QWN0aXZpdHlGZWVkIENvbXBvbmVudFxuICpcbiAqIEFjdGl2aXR5IGZlZWQgd2l0aDpcbiAqIC0gVHlwZS1iYXNlZCBpY29uc1xuICogLSBTdGF0dXMgaW5kaWNhdG9yc1xuICogLSBSZWxhdGl2ZSB0aW1lc3RhbXBzXG4gKiAtIEVudGl0eSBjb3VudHNcbiAqIC0gRW1wdHkgc3RhdGUgaGFuZGxpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IFJlY2VudEFjdGl2aXR5RmVlZCA9ICh7IGFjdGl2aXRpZXMsIGNsYXNzTmFtZSwgbWF4SXRlbXMgPSAxMCB9KSA9PiB7XG4gICAgY29uc3QgZGlzcGxheUFjdGl2aXRpZXMgPSBhY3Rpdml0aWVzLnNsaWNlKDAsIG1heEl0ZW1zKTtcbiAgICByZXR1cm4gKF9qc3hzKE1vZGVybkNhcmQsIHsgY2xhc3NOYW1lOiBjbGFzc05hbWUsIGhvdmVyYWJsZTogZmFsc2UsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LVt2YXIoLS10ZXh0LXByaW1hcnkpXSBtYi00XCIsIGNoaWxkcmVuOiBcIlJlY2VudCBBY3Rpdml0eVwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogZGlzcGxheUFjdGl2aXRpZXMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgIC8qIEVtcHR5IFN0YXRlICovXG4gICAgICAgICAgICAgICAgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgcHktOFwiLCBjaGlsZHJlbjogW19qc3goQWN0aXZpdHksIHsgY2xhc3NOYW1lOiBcInctMTIgaC0xMiB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIG9wYWNpdHktMzAgbXgtYXV0byBtYi0zXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogXCJObyByZWNlbnQgYWN0aXZpdHlcIiB9KV0gfSkpIDogKFxuICAgICAgICAgICAgICAgIC8qIEFjdGl2aXR5IExpc3QgKi9cbiAgICAgICAgICAgICAgICBkaXNwbGF5QWN0aXZpdGllcy5tYXAoKGFjdGl2aXR5LCBpbmRleCkgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zIHAtMyByb3VuZGVkLWxnJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTE1MCcsICdob3ZlcjpiZy1bdmFyKC0tY2FyZC1iZy1zZWNvbmRhcnkpXScsIGdldFN0YXR1c0JnQ29sb3IoYWN0aXZpdHkuc3RhdHVzKSwgaW5kZXggIT09IGRpc3BsYXlBY3Rpdml0aWVzLmxlbmd0aCAtIDEgJiYgJ2JvcmRlci1iIGJvcmRlci1bdmFyKC0tYm9yZGVyKV0nKSwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtc2hyaW5rLTAgbXQtMC41XCIsIGNoaWxkcmVuOiBnZXRBY3Rpdml0eUljb24oYWN0aXZpdHkudHlwZSwgYWN0aXZpdHkuc3RhdHVzKSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG1pbi13LTBcIiwgY2hpbGRyZW46IFtfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldIHRydW5jYXRlXCIsIGNoaWxkcmVuOiBhY3Rpdml0eS50aXRsZSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldIG10LTFcIiwgY2hpbGRyZW46IGFjdGl2aXR5LmRlc2NyaXB0aW9uIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBtdC0yXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBmb3JtYXRUaW1lc3RhbXAoYWN0aXZpdHkudGltZXN0YW1wKSB9KSwgYWN0aXZpdHkuZW50aXR5Q291bnQgIT09IHVuZGVmaW5lZCAmJiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogW2FjdGl2aXR5LmVudGl0eUNvdW50LnRvTG9jYWxlU3RyaW5nKCksIFwiIGl0ZW1zXCJdIH0pKSwgYWN0aXZpdHkudXNlciAmJiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXVwiLCBjaGlsZHJlbjogW1wiYnkgXCIsIGFjdGl2aXR5LnVzZXJdIH0pKV0gfSldIH0pXSB9LCBhY3Rpdml0eS5pZCkpKSkgfSksIGFjdGl2aXRpZXMubGVuZ3RoID4gbWF4SXRlbXMgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXQtNCBwdC0zIGJvcmRlci10IGJvcmRlci1bdmFyKC0tYm9yZGVyKV0gdGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3hzKFwiYnV0dG9uXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1bdmFyKC0tYWNjZW50LXByaW1hcnkpXSBob3Zlcjp0ZXh0LVt2YXIoLS1hY2NlbnQtc2Vjb25kYXJ5KV0gdHJhbnNpdGlvbi1jb2xvcnNcIiwgb25DbGljazogKCkgPT4geyB9LCBjaGlsZHJlbjogW1wiVmlldyBhbGwgXCIsIGFjdGl2aXRpZXMubGVuZ3RoLCBcIiBhY3Rpdml0aWVzIFxcdTIxOTJcIl0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgUmVjZW50QWN0aXZpdHlGZWVkO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUXVpY2tBY3Rpb25zUGFuZWwgQ29tcG9uZW50XG4gKlxuICogUHJvdmlkZXMgcXVpY2sgbmF2aWdhdGlvbiBidXR0b25zIGZvciBjb21tb24gdGFza3MuXG4gKiBJbmNsdWRlcyBTdGFydCBEaXNjb3ZlcnksIFJ1biBNaWdyYXRpb24sIFZpZXcgUmVwb3J0cywgYW5kIFNldHRpbmdzLlxuICpcbiAqIFBoYXNlIDY6IERhc2hib2FyZCBVSSBDb21wb25lbnRzXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgUGxheSwgRmlsZVRleHQsIFNldHRpbmdzLCBEb3dubG9hZCwgVXNlcnMgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgTW9kZXJuQ2FyZCB9IGZyb20gJy4uL2F0b21zL01vZGVybkNhcmQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbi8qKlxuICogUXVpY2tBY3Rpb25zUGFuZWwgQ29tcG9uZW50XG4gKlxuICogUXVpY2sgYWN0aW9uIGJ1dHRvbnMgZm9yOlxuICogLSBTdGFydGluZyBkaXNjb3ZlcnlcbiAqIC0gUnVubmluZyBtaWdyYXRpb25zXG4gKiAtIFZpZXdpbmcgcmVwb3J0c1xuICogLSBBY2Nlc3Npbmcgc2V0dGluZ3NcbiAqIC0gTmF2aWdhdGluZyB0byBrZXkgdmlld3NcbiAqL1xuZXhwb3J0IGNvbnN0IFF1aWNrQWN0aW9uc1BhbmVsID0gKHsgY2xhc3NOYW1lIH0pID0+IHtcbiAgICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gICAgcmV0dXJuIChfanN4cyhNb2Rlcm5DYXJkLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lLCBob3ZlcmFibGU6IGZhbHNlLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV0gbWItNFwiLCBjaGlsZHJlbjogXCJRdWljayBBY3Rpb25zXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInNwYWNlLXktMlwiLCBjaGlsZHJlbjogW19qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgY2xhc3NOYW1lOiBcInctZnVsbCBqdXN0aWZ5LXN0YXJ0XCIsIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvZGlzY292ZXJ5JyksIGNoaWxkcmVuOiBbX2pzeChQbGF5LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTJcIiB9KSwgXCJTdGFydCBEaXNjb3ZlcnlcIl0gfSksIF9qc3hzKEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBjbGFzc05hbWU6IFwidy1mdWxsIGp1c3RpZnktc3RhcnRcIiwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy9taWdyYXRpb24nKSwgY2hpbGRyZW46IFtfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTJcIiB9KSwgXCJSdW4gTWlncmF0aW9uXCJdIH0pLCBfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgY2xhc3NOYW1lOiBcInctZnVsbCBqdXN0aWZ5LXN0YXJ0XCIsIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvdXNlcnMnKSwgY2hpbGRyZW46IFtfanN4KFVzZXJzLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTJcIiB9KSwgXCJWaWV3IFVzZXJzXCJdIH0pLCBfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgY2xhc3NOYW1lOiBcInctZnVsbCBqdXN0aWZ5LXN0YXJ0XCIsIG9uQ2xpY2s6ICgpID0+IG5hdmlnYXRlKCcvcmVwb3J0cycpLCBjaGlsZHJlbjogW19qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlZpZXcgUmVwb3J0c1wiXSB9KSwgX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGNsYXNzTmFtZTogXCJ3LWZ1bGwganVzdGlmeS1zdGFydFwiLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL3NldHRpbmdzJyksIGNoaWxkcmVuOiBbX2pzeChTZXR0aW5ncywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0yXCIgfSksIFwiU2V0dGluZ3NcIl0gfSldIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgUXVpY2tBY3Rpb25zUGFuZWw7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBPdmVydmlld1ZpZXcgQ29tcG9uZW50XG4gKlxuICogRGFzaGJvYXJkIG92ZXJ2aWV3IHdpdGggcmVhbCBMb2dpYyBFbmdpbmUgZGF0YSBpbnRlZ3JhdGlvbi5cbiAqIERpc3BsYXlzIHByb2plY3QgdGltZWxpbmUsIHN0YXRpc3RpY3MsIHN5c3RlbSBoZWFsdGgsIGFuZCByZWNlbnQgYWN0aXZpdHkuXG4gKlxuICogUGhhc2UgNzogQ29tcGxldGUgRGFzaGJvYXJkIEltcGxlbWVudGF0aW9uXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgUmVmcmVzaEN3LCBVc2VycywgTGF5ZXJzLCBNb25pdG9yLCBTZXJ2ZXIsIEFsZXJ0Q2lyY2xlIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZURhc2hib2FyZExvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlRGFzaGJvYXJkTG9naWMnO1xuaW1wb3J0IHsgUHJvamVjdFRpbWVsaW5lQ2FyZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1Byb2plY3RUaW1lbGluZUNhcmQnO1xuaW1wb3J0IHsgU3RhdGlzdGljc0NhcmQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21vbGVjdWxlcy9TdGF0aXN0aWNzQ2FyZCc7XG5pbXBvcnQgeyBTeXN0ZW1IZWFsdGhQYW5lbCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1N5c3RlbUhlYWx0aFBhbmVsJztcbmltcG9ydCB7IFJlY2VudEFjdGl2aXR5RmVlZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1JlY2VudEFjdGl2aXR5RmVlZCc7XG5pbXBvcnQgeyBRdWlja0FjdGlvbnNQYW5lbCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1F1aWNrQWN0aW9uc1BhbmVsJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL1NwaW5uZXInO1xuLyoqXG4gKiBPdmVydmlld1ZpZXcgQ29tcG9uZW50XG4gKlxuICogQ29tcGxldGUgZGFzaGJvYXJkIGltcGxlbWVudGF0aW9uIHdpdGg6XG4gKiAtIFJlYWwtdGltZSBkYXRhIGZyb20gTG9naWMgRW5naW5lXG4gKiAtIEF1dG8tcmVmcmVzaCBldmVyeSAzMCBzZWNvbmRzXG4gKiAtIENsaWNrYWJsZSBuYXZpZ2F0aW9uIGNhcmRzXG4gKiAtIFN5c3RlbSBoZWFsdGggbW9uaXRvcmluZ1xuICogLSBSZWNlbnQgYWN0aXZpdHkgZmVlZFxuICogLSBRdWljayBhY3Rpb24gc2hvcnRjdXRzXG4gKi9cbmNvbnN0IE92ZXJ2aWV3VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHN0YXRzLCBwcm9qZWN0LCBoZWFsdGgsIGFjdGl2aXR5LCBpc0xvYWRpbmcsIGVycm9yLCByZWxvYWQgfSA9IHVzZURhc2hib2FyZExvZ2ljKCk7XG4gICAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICAgIC8vIExvYWRpbmcgc3RhdGVcbiAgICBpZiAoaXNMb2FkaW5nICYmICFzdGF0cykge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIG1pbi1oLVs2MDBweF1cIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgY2xhc3NOYW1lOiBcIm14LWF1dG8gbWItNFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LVt2YXIoLS10ZXh0LXNlY29uZGFyeSldXCIsIGNoaWxkcmVuOiBcIkxvYWRpbmcgZGFzaGJvYXJkLi4uXCIgfSldIH0pIH0pKTtcbiAgICB9XG4gICAgLy8gRXJyb3Igc3RhdGVcbiAgICBpZiAoZXJyb3IgJiYgIXN0YXRzKSB7XG4gICAgICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGwgbWluLWgtWzYwMHB4XVwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgbWF4LXctbWRcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTE2IGgtMTYgdGV4dC1bdmFyKC0tZGFuZ2VyKV0gbXgtYXV0byBtYi00XCIgfSksIF9qc3goXCJoMlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhsIGZvbnQtc2VtaWJvbGQgdGV4dC1bdmFyKC0tdGV4dC1wcmltYXJ5KV0gbWItMlwiLCBjaGlsZHJlbjogXCJGYWlsZWQgdG8gTG9hZCBEYXNoYm9hcmRcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1bdmFyKC0tZGFuZ2VyKV0gbWItNlwiLCBjaGlsZHJlbjogZXJyb3IgfSksIF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiByZWxvYWQsIHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBjaGlsZHJlbjogW19qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTJcIiB9KSwgXCJSZXRyeVwiXSB9KV0gfSkgfSkpO1xuICAgIH1cbiAgICAvLyBObyBkYXRhIHN0YXRlXG4gICAgaWYgKCFzdGF0cyB8fCAhcHJvamVjdCkge1xuICAgICAgICByZXR1cm4gKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIG1pbi1oLVs2MDBweF1cIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBtYi00XCIsIGNoaWxkcmVuOiBcIk5vIGRhdGEgYXZhaWxhYmxlXCIgfSksIF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiByZWxvYWQsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIGNoaWxkcmVuOiBbX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMlwiIH0pLCBcIlJlZnJlc2hcIl0gfSldIH0pIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTYgc3BhY2UteS02IG92ZXJmbG93LWF1dG9cIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm92ZXJ2aWV3LXZpZXdcIiwgXCJkYXRhLWN5XCI6IFwib3ZlcnZpZXctdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtW3ZhcigtLXRleHQtcHJpbWFyeSldXCIsIGNoaWxkcmVuOiBcIkRhc2hib2FyZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtW3ZhcigtLXRleHQtc2Vjb25kYXJ5KV0gbXQtMVwiLCBjaGlsZHJlbjogXCJNJkEgRGlzY292ZXJ5IFN1aXRlIE92ZXJ2aWV3XCIgfSldIH0pLCBfanN4cyhCdXR0b24sIHsgb25DbGljazogcmVsb2FkLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcInNtXCIsIGRpc2FibGVkOiBpc0xvYWRpbmcsIGNoaWxkcmVuOiBbX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBgdy00IGgtNCBtci0yICR7aXNMb2FkaW5nID8gJ2FuaW1hdGUtc3BpbicgOiAnJ31gIH0pLCBcIlJlZnJlc2hcIl0gfSldIH0pLCBfanN4KFByb2plY3RUaW1lbGluZUNhcmQsIHsgcHJvamVjdDogcHJvamVjdCB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNCBnYXAtNlwiLCBjaGlsZHJlbjogW19qc3goU3RhdGlzdGljc0NhcmQsIHsgdGl0bGU6IFwiVXNlcnNcIiwgdmFsdWU6IHN0YXRzPy50b3RhbFVzZXJzIHx8IDAsIGRpc2NvdmVyZWQ6IHN0YXRzPy5kaXNjb3ZlcmVkVXNlcnMsIG1pZ3JhdGVkOiBzdGF0cz8ubWlncmF0ZWRVc2VycywgaWNvbjogX2pzeChVc2VycywgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL3VzZXJzJyksIFwiZGF0YS1jeVwiOiBcInN0YXRzLXVzZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0cy11c2Vyc1wiIH0pLCBfanN4KFN0YXRpc3RpY3NDYXJkLCB7IHRpdGxlOiBcIkdyb3Vwc1wiLCB2YWx1ZTogc3RhdHM/LnRvdGFsR3JvdXBzIHx8IDAsIGRpc2NvdmVyZWQ6IHN0YXRzPy5kaXNjb3ZlcmVkR3JvdXBzLCBtaWdyYXRlZDogc3RhdHM/Lm1pZ3JhdGVkR3JvdXBzLCBpY29uOiBfanN4KExheWVycywgeyBjbGFzc05hbWU6IFwidy02IGgtNlwiIH0pLCBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZSgnL2dyb3VwcycpLCBcImRhdGEtY3lcIjogXCJzdGF0cy1ncm91cHNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInN0YXRzLWdyb3Vwc1wiIH0pLCBfanN4KFN0YXRpc3RpY3NDYXJkLCB7IHRpdGxlOiBcIkNvbXB1dGVyc1wiLCB2YWx1ZTogc3RhdHM/LnRvdGFsQ29tcHV0ZXJzIHx8IDAsIGRpc2NvdmVyZWQ6IHN0YXRzPy5kaXNjb3ZlcmVkQ29tcHV0ZXJzLCBpY29uOiBfanN4KE1vbml0b3IsIHsgY2xhc3NOYW1lOiBcInctNiBoLTZcIiB9KSwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy9jb21wdXRlcnMnKSwgXCJkYXRhLWN5XCI6IFwic3RhdHMtY29tcHV0ZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0cy1jb21wdXRlcnNcIiB9KSwgX2pzeChTdGF0aXN0aWNzQ2FyZCwgeyB0aXRsZTogXCJJbmZyYXN0cnVjdHVyZVwiLCB2YWx1ZTogc3RhdHM/LnRvdGFsSW5mcmFzdHJ1Y3R1cmUgfHwgMCwgaWNvbjogX2pzeChTZXJ2ZXIsIHsgY2xhc3NOYW1lOiBcInctNiBoLTZcIiB9KSwgb25DbGljazogKCkgPT4gbmF2aWdhdGUoJy9pbmZyYXN0cnVjdHVyZScpLCBcImRhdGEtY3lcIjogXCJzdGF0cy1pbmZyYXN0cnVjdHVyZVwiLCBcImRhdGEtdGVzdGlkXCI6IFwic3RhdHMtaW5mcmFzdHJ1Y3R1cmVcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTMgZ2FwLTZcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImxnOmNvbC1zcGFuLTJcIiwgY2hpbGRyZW46IF9qc3goUmVjZW50QWN0aXZpdHlGZWVkLCB7IGFjdGl2aXRpZXM6IGFjdGl2aXR5IH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJzcGFjZS15LTZcIiwgY2hpbGRyZW46IFtoZWFsdGggJiYgX2pzeChTeXN0ZW1IZWFsdGhQYW5lbCwgeyBoZWFsdGg6IGhlYWx0aCB9KSwgX2pzeChRdWlja0FjdGlvbnNQYW5lbCwge30pXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHRleHQteHMgdGV4dC1bdmFyKC0tdGV4dC1zZWNvbmRhcnkpXSBwdC00IGJvcmRlci10IGJvcmRlci1bdmFyKC0tYm9yZGVyKV1cIiwgY2hpbGRyZW46IFtcIkxhc3QgdXBkYXRlZDogXCIsIG5ldyBEYXRlKChzdGF0cz8ubGFzdERhdGFSZWZyZXNoID8/IDApKS50b0xvY2FsZVN0cmluZygpLCBcIiB8IERhdGEgc291cmNlOiBcIiwgc3RhdHM/LmRhdGFTb3VyY2UgPz8gMF0gfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBPdmVydmlld1ZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqXG4gKiBTbWFsbCBsYWJlbCBjb21wb25lbnQgZm9yIHN0YXR1cyBpbmRpY2F0b3JzLCBjb3VudHMsIGFuZCB0YWdzLlxuICogU3VwcG9ydHMgbXVsdGlwbGUgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEJhZGdlID0gKHsgY2hpbGRyZW4sIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBkb3QgPSBmYWxzZSwgZG90UG9zaXRpb24gPSAnbGVhZGluZycsIHJlbW92YWJsZSA9IGZhbHNlLCBvblJlbW92ZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFZhcmlhbnQgc3R5bGVzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktODAwIGJvcmRlci1ncmF5LTIwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtODAwIGJvcmRlci1ibHVlLTIwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgYm9yZGVyLWdyZWVuLTIwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBib3JkZXIteWVsbG93LTIwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGJvcmRlci1yZWQtMjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwIHRleHQtY3lhbi04MDAgYm9yZGVyLWN5YW4tMjAwJyxcbiAgICB9O1xuICAgIC8vIERvdCBjb2xvciBjbGFzc2VzXG4gICAgY29uc3QgZG90Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktNTAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtNTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTUwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTUwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTUwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ3B4LTIgcHktMC41IHRleHQteHMnLFxuICAgICAgICBzbTogJ3B4LTIuNSBweS0wLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtMyBweS0xIHRleHQtc20nLFxuICAgICAgICBsZzogJ3B4LTMuNSBweS0xLjUgdGV4dC1iYXNlJyxcbiAgICB9O1xuICAgIGNvbnN0IGRvdFNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ2gtMS41IHctMS41JyxcbiAgICAgICAgc206ICdoLTIgdy0yJyxcbiAgICAgICAgbWQ6ICdoLTIgdy0yJyxcbiAgICAgICAgbGc6ICdoLTIuNSB3LTIuNScsXG4gICAgfTtcbiAgICBjb25zdCBiYWRnZUNsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2lubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41JywgJ2ZvbnQtbWVkaXVtIHJvdW5kZWQtZnVsbCBib3JkZXInLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gVmFyaWFudFxuICAgIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IGJhZGdlQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtkb3QgJiYgZG90UG9zaXRpb24gPT09ICdsZWFkaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0pLCBkb3QgJiYgZG90UG9zaXRpb24gPT09ICd0cmFpbGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCByZW1vdmFibGUgJiYgb25SZW1vdmUgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBvblJlbW92ZSwgY2xhc3NOYW1lOiBjbHN4KCdtbC0wLjUgLW1yLTEgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyJywgJ3JvdW5kZWQtZnVsbCBob3ZlcjpiZy1ibGFjay8xMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTEnLCB7XG4gICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAnaC00IHctNCc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiUmVtb3ZlXCIsIGNoaWxkcmVuOiBfanN4KFwic3ZnXCIsIHsgY2xhc3NOYW1lOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTIgdy0yJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmaWxsOiBcImN1cnJlbnRDb2xvclwiLCB2aWV3Qm94OiBcIjAgMCAyMCAyMFwiLCBjaGlsZHJlbjogX2pzeChcInBhdGhcIiwgeyBmaWxsUnVsZTogXCJldmVub2RkXCIsIGQ6IFwiTTQuMjkzIDQuMjkzYTEgMSAwIDAxMS40MTQgMEwxMCA4LjU4Nmw0LjI5My00LjI5M2ExIDEgMCAxMTEuNDE0IDEuNDE0TDExLjQxNCAxMGw0LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNCAxLjQxNEwxMCAxMS40MTRsLTQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0LTEuNDE0TDguNTg2IDEwIDQuMjkzIDUuNzA3YTEgMSAwIDAxMC0xLjQxNHpcIiwgY2xpcFJ1bGU6IFwiZXZlbm9kZFwiIH0pIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEJhZGdlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9