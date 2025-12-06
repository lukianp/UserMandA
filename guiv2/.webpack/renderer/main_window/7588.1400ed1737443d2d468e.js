"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7588],{

/***/ 33523:
/*!***********************************************************!*\
  !*** ./src/renderer/components/molecules/ProgressBar.tsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * ProgressBar Component
 *
 * Progress indicator with percentage display and optional label.
 * Supports different variants and sizes.
 */


/**
 * ProgressBar Component
 */
const ProgressBar = ({ value, max = 100, variant = 'default', size = 'md', showLabel = true, label, labelPosition = 'inside', striped = false, animated = false, className, 'data-cy': dataCy, }) => {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    // Variant colors
    const variantClasses = {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-cyan-600',
    };
    // Background colors
    const bgClasses = {
        default: 'bg-blue-100',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        info: 'bg-cyan-100',
    };
    // Size classes
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full', className);
    const trackClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full rounded-full overflow-hidden', bgClasses[variant], sizeClasses[size]);
    const barClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('h-full transition-all duration-300 ease-out', variantClasses[variant], {
        // Striped pattern
        'bg-gradient-to-r from-transparent via-black/10 to-transparent bg-[length:1rem_100%]': striped,
        'animate-progress-stripes': striped && animated,
    });
    const labelText = label || (showLabel ? `${Math.round(percentage)}%` : '');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [labelText && labelPosition === 'outside' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-between mb-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium text-gray-700", children: labelText }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: trackClasses, role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: barClasses, style: { width: `${percentage}%` }, children: labelText && labelPosition === 'inside' && size !== 'sm' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full px-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs font-semibold text-white whitespace-nowrap", children: labelText }) })) }) })] }));
};
// Add animation for striped progress bars
const styles = `
@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
`;
// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'progress-bar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProgressBar);


/***/ }),

/***/ 53404:
/*!*********************************************************!*\
  !*** ./src/renderer/components/molecules/SearchBar.tsx ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SearchBar: () => (/* binding */ SearchBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * SearchBar Component
 *
 * Search input with icon, clear button, and debounced onChange.
 * Used for filtering lists and tables.
 */



/**
 * SearchBar Component
 */
const SearchBar = ({ value: controlledValue = '', onChange, placeholder = 'Search...', debounceDelay = 300, disabled = false, size = 'md', className, 'data-cy': dataCy, }) => {
    const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(controlledValue);
    // Sync with controlled value
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        setInputValue(controlledValue);
    }, [controlledValue]);
    // Debounced onChange
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const handler = setTimeout(() => {
            if (onChange && inputValue !== controlledValue) {
                onChange(inputValue);
            }
        }, debounceDelay);
        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, onChange, debounceDelay, controlledValue]);
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleClear = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setInputValue('');
        if (onChange) {
            onChange('');
        }
    }, [onChange]);
    // Size classes
    const sizeClasses = {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 text-base px-4',
        lg: 'h-12 text-lg px-5',
    };
    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Search, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


/***/ }),

/***/ 54618:
/*!******************************************************************!*\
  !*** ./src/renderer/hooks/useTeamsDiscoveryLogic.ts + 1 modules ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  useTeamsDiscoveryLogic: () => (/* binding */ useTeamsDiscoveryLogic)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./src/renderer/types/models/teams.ts
/**
 * Microsoft Teams Discovery Type Definitions
 * Defines all types for Microsoft Teams discovery
 */
const DEFAULT_TEAMS_CONFIG = {
    discoverTeams: true,
    discoverChannels: true,
    discoverMembers: true,
    discoverApps: true,
    discoverTabs: false,
    includeArchivedTeams: false,
    includeActivity: true,
    includeSettings: true,
    includeSharePointIntegration: true,
    includePrivateChannels: true,
    includeSharedChannels: true,
    includeChannelMessages: false,
    maxMessagesToScan: 1000,
    includeGuestUsers: true,
    includeMemberActivity: false,
    includeLicenseInfo: false,
    includeCustomApps: true,
    includeThirdPartyApps: true,
    analyzeAppPermissions: false,
    includeTabConfigurations: false,
    maxConcurrentQueries: 5,
    batchSize: 50,
    throttleDelay: 100,
    exportFormat: 'json',
    includeDetailedLogs: false,
};

;// ./src/renderer/hooks/useTeamsDiscoveryLogic.ts
/**
 * Microsoft Teams Discovery Logic Hook
 * Contains all business logic for Teams discovery view
 */


function useTeamsDiscoveryLogic() {
    // ============================================================================
    // State Management
    // ============================================================================
    const [config, setConfig] = (0,react.useState)(DEFAULT_TEAMS_CONFIG);
    const [result, setResult] = (0,react.useState)(null);
    const [progress, setProgress] = (0,react.useState)(null);
    const [isDiscovering, setIsDiscovering] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    // Templates
    const [templates, setTemplates] = (0,react.useState)([]);
    const [selectedTemplate, setSelectedTemplate] = (0,react.useState)(null);
    // Filters
    const [teamFilter, setTeamFilter] = (0,react.useState)({});
    const [channelFilter, setChannelFilter] = (0,react.useState)({});
    const [memberFilter, setMemberFilter] = (0,react.useState)({});
    const [appFilter, setAppFilter] = (0,react.useState)({});
    // UI state
    const [selectedTab, setSelectedTab] = (0,react.useState)('overview');
    // ============================================================================
    // Data Fetching
    // ============================================================================
    (0,react.useEffect)(() => {
        loadTemplates();
    }, []);
    const loadTemplates = async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
                functionName: 'Get-TeamsDiscoveryTemplates',
                parameters: {},
            });
            setTemplates(result.data?.templates || []);
        }
        catch (err) {
            console.error('Failed to load templates:', err);
        }
    };
    // ============================================================================
    // Discovery Execution
    // ============================================================================
    const startDiscovery = (0,react.useCallback)(async () => {
        setIsDiscovering(true);
        setError(null);
        setProgress({
            phase: 'initializing',
            phaseLabel: 'Initializing Teams discovery...',
            percentComplete: 0,
            itemsProcessed: 0,
            totalItems: 0,
            errors: 0,
            warnings: 0,
        });
        try {
            const unsubscribe = window.electronAPI.onProgress((data) => {
                // Convert ProgressData to TeamsDiscoveryProgress
                const progressData = {
                    phase: 'initializing',
                    phaseLabel: data.message || 'Processing...',
                    percentComplete: data.percentage,
                    itemsProcessed: data.itemsProcessed || 0,
                    totalItems: data.totalItems || 0,
                    errors: 0,
                    warnings: 0,
                };
                setProgress(progressData);
            });
            const discoveryResult = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
                functionName: 'Invoke-TeamsDiscovery',
                parameters: {
                    Config: config,
                },
            });
            if (discoveryResult.success && discoveryResult.data) {
                setResult(discoveryResult.data);
            }
            else {
                throw new Error(discoveryResult.error || 'Discovery failed');
            }
            setProgress(null);
            unsubscribe();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Discovery failed');
            setProgress(null);
        }
        finally {
            setIsDiscovering(false);
        }
    }, [config]);
    const cancelDiscovery = (0,react.useCallback)(async () => {
        try {
            await window.electronAPI.cancelExecution('teams-discovery');
            setIsDiscovering(false);
            setProgress(null);
        }
        catch (err) {
            console.error('Failed to cancel discovery:', err);
        }
    }, []);
    // ============================================================================
    // Template Management
    // ============================================================================
    const loadTemplate = (0,react.useCallback)((template) => {
        setSelectedTemplate(template);
        setConfig(template.config);
    }, []);
    const saveAsTemplate = (0,react.useCallback)(async (name, description) => {
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
                functionName: 'Save-TeamsDiscoveryTemplate',
                parameters: {
                    Name: name,
                    Description: description,
                    Config: config,
                },
            });
            await loadTemplates();
        }
        catch (err) {
            console.error('Failed to save template:', err);
            throw err;
        }
    }, [config]);
    // ============================================================================
    // Filtered Data
    // ============================================================================
    const filteredTeams = (0,react.useMemo)(() => {
        if (!result?.teams)
            return [];
        return result?.teams?.filter((team) => {
            if (teamFilter.searchText) {
                const search = teamFilter.searchText.toLowerCase();
                const matches = (team.displayName ?? '').toLowerCase().includes(search) ||
                    team.description?.toLowerCase().includes(search) ||
                    (team.mailNickname ?? '').toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (teamFilter.visibility?.length) {
                if (!teamFilter.visibility.includes(team.visibility))
                    return false;
            }
            if (teamFilter.minMemberCount !== undefined && team.memberCount < teamFilter.minMemberCount) {
                return false;
            }
            if (teamFilter.maxMemberCount !== undefined && team.memberCount > teamFilter.maxMemberCount) {
                return false;
            }
            if (teamFilter.isArchived !== undefined && team.isArchived !== teamFilter.isArchived) {
                return false;
            }
            if (teamFilter.hasGuests !== undefined) {
                const hasGuests = (team.guestCount ?? 0) > 0;
                if (hasGuests !== teamFilter.hasGuests)
                    return false;
            }
            if (teamFilter.classification?.length) {
                if (!team.classification || !teamFilter.classification.includes(team.classification)) {
                    return false;
                }
            }
            return true;
        });
    }, [result?.teams, teamFilter]);
    const filteredChannels = (0,react.useMemo)(() => {
        if (!result?.channels)
            return [];
        return result?.channels?.filter((channel) => {
            if (channelFilter.searchText) {
                const search = channelFilter.searchText.toLowerCase();
                const matches = (channel.displayName ?? '').toLowerCase().includes(search) ||
                    channel.description?.toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (channelFilter.channelTypes?.length) {
                if (!channelFilter.channelTypes.includes(channel.channelType))
                    return false;
            }
            if (channelFilter.minMessageCount !== undefined && channel.messageCount < channelFilter.minMessageCount) {
                return false;
            }
            if (channelFilter.hasFiles !== undefined) {
                const hasFiles = (channel.fileCount ?? 0) > 0;
                if (hasFiles !== channelFilter.hasFiles)
                    return false;
            }
            return true;
        });
    }, [result?.channels, channelFilter]);
    const filteredMembers = (0,react.useMemo)(() => {
        if (!result?.members)
            return [];
        return result?.members?.filter((member) => {
            if (memberFilter.searchText) {
                const search = memberFilter.searchText.toLowerCase();
                const matches = (member.displayName ?? '').toLowerCase().includes(search) ||
                    (member.email ?? '').toLowerCase().includes(search) ||
                    (member.userPrincipalName ?? '').toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (memberFilter.roles?.length) {
                if (!memberFilter.roles.includes(member.role))
                    return false;
            }
            if (memberFilter.isGuest !== undefined && member.isGuest !== memberFilter.isGuest) {
                return false;
            }
            if (memberFilter.accountEnabled !== undefined && member.accountEnabled !== memberFilter.accountEnabled) {
                return false;
            }
            if (memberFilter.hasLicense !== undefined) {
                const hasLicense = (member.assignedLicenses?.length ?? 0) > 0;
                if (hasLicense !== memberFilter.hasLicense)
                    return false;
            }
            return true;
        });
    }, [result?.members, memberFilter]);
    const filteredApps = (0,react.useMemo)(() => {
        if (!result?.apps)
            return [];
        return result?.apps?.filter((app) => {
            if (appFilter.searchText) {
                const search = appFilter.searchText.toLowerCase();
                const matches = (app.displayName ?? '').toLowerCase().includes(search);
                if (!matches)
                    return false;
            }
            if (appFilter.distributionMethods?.length) {
                if (!appFilter.distributionMethods.includes(app.distributionMethod))
                    return false;
            }
            return true;
        });
    }, [result?.apps, appFilter]);
    // ============================================================================
    // AG Grid Column Definitions
    // ============================================================================
    const teamColumns = (0,react.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Team Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 250,
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300,
        },
        {
            field: 'visibility',
            headerName: 'Visibility',
            sortable: true,
            filter: true,
            width: 120,
        },
        {
            field: 'memberCount',
            headerName: 'Members',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: 'ownerCount',
            headerName: 'Owners',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 90,
        },
        {
            field: 'guestCount',
            headerName: 'Guests',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 90,
        },
        {
            field: 'channelCount',
            headerName: 'Channels',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: 'isArchived',
            headerName: 'Status',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Archived' : 'Active'),
            width: 100,
        },
        {
            field: 'lastActivityDate',
            headerName: 'Last Activity',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
            width: 130,
        },
        {
            field: 'createdDateTime',
            headerName: 'Created',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
            width: 120,
        },
    ], []);
    const channelColumns = (0,react.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Channel Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 250,
        },
        {
            field: 'channelType',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 120,
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300,
        },
        {
            field: 'messageCount',
            headerName: 'Messages',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => params.value.toLocaleString(),
            width: 110,
        },
        {
            field: 'replyCount',
            headerName: 'Replies',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => params.value.toLocaleString(),
            width: 100,
        },
        {
            field: 'memberCount',
            headerName: 'Members',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 100,
        },
        {
            field: 'fileCount',
            headerName: 'Files',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 80,
        },
        {
            field: 'lastActivityDate',
            headerName: 'Last Activity',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
            width: 130,
        },
    ], []);
    const memberColumns = (0,react.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 200,
        },
        {
            field: 'email',
            headerName: 'Email',
            sortable: true,
            filter: true,
            width: 250,
        },
        {
            field: 'role',
            headerName: 'Role',
            sortable: true,
            filter: true,
            width: 100,
        },
        {
            field: 'isGuest',
            headerName: 'Type',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Guest' : 'Member'),
            width: 100,
        },
        {
            field: 'accountEnabled',
            headerName: 'Account Status',
            sortable: true,
            filter: true,
            valueFormatter: (params) => (params.value ? 'Active' : 'Disabled'),
            width: 130,
        },
        {
            field: 'messageCount',
            headerName: 'Messages',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => params.value?.toLocaleString() ?? 'N/A',
            width: 100,
        },
        {
            field: 'lastActiveDate',
            headerName: 'Last Active',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
            width: 120,
        },
    ], []);
    const appColumns = (0,react.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'App Name',
            sortable: true,
            filter: true,
            pinned: 'left',
            width: 250,
        },
        {
            field: 'version',
            headerName: 'Version',
            sortable: true,
            filter: true,
            width: 100,
        },
        {
            field: 'distributionMethod',
            headerName: 'Distribution',
            sortable: true,
            filter: true,
            width: 140,
        },
        {
            field: 'installedBy',
            headerName: 'Installed By',
            sortable: true,
            filter: true,
            width: 200,
        },
        {
            field: 'installedDate',
            headerName: 'Installed',
            sortable: true,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
            width: 120,
        },
    ], []);
    // ============================================================================
    // Export Functionality
    // ============================================================================
    const exportData = (0,react.useCallback)(async (options) => {
        if (!result)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportService.psm1',
                functionName: 'Export-TeamsDiscoveryData',
                parameters: {
                    Result: result,
                    Options: options,
                },
            });
        }
        catch (err) {
            console.error('Failed to export data:', err);
            throw err;
        }
    }, [result]);
    // ============================================================================
    // Return Hook API
    // ============================================================================
    return {
        // State
        config,
        setConfig,
        result,
        currentResult: result,
        progress,
        isDiscovering,
        error,
        // Templates
        templates,
        selectedTemplate,
        loadTemplate,
        saveAsTemplate,
        // Discovery control
        startDiscovery,
        cancelDiscovery,
        // Filtered data
        teams: filteredTeams,
        channels: filteredChannels,
        members: filteredMembers,
        apps: filteredApps,
        // Filters
        teamFilter,
        setTeamFilter,
        channelFilter,
        setChannelFilter,
        memberFilter,
        setMemberFilter,
        appFilter,
        setAppFilter,
        // AG Grid columns
        teamColumns,
        channelColumns,
        memberColumns,
        appColumns,
        // Export
        exportData,
        // UI
        selectedTab,
        setSelectedTab,
        // Statistics
        statistics: result?.statistics,
    };
}


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLDJCQUEyQixpQkFBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSwwQkFBMEIsaUJBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLHVCQUF1QixpQkFBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FB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Q0E7QUFDMEI7QUFDRTtBQUM1QjtBQUNBO0FBQ0E7QUFDTyxpQkFBaUIsOElBQThJO0FBQ3RLO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLDBDQUFJO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksdURBQUssV0FBVyw0RkFBNEYsc0RBQUksV0FBVyxXQUFXLDBDQUFJLG9GQUFvRixJQUFJLHNEQUFJLFdBQVcsb0JBQW9CLHlDQUF5QyxzREFBSSxXQUFXLFdBQVcsMENBQUksb0ZBQW9GLDhCQUE4QixzREFBSSxhQUFhLDhDQUE4QywwQ0FBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLDBDQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvUHJvZ3Jlc3NCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdHlwZXMvbW9kZWxzL3RlYW1zLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVRlYW1zRGlzY292ZXJ5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKlxuICogUHJvZ3Jlc3MgaW5kaWNhdG9yIHdpdGggcGVyY2VudGFnZSBkaXNwbGF5IGFuZCBvcHRpb25hbCBsYWJlbC5cbiAqIFN1cHBvcnRzIGRpZmZlcmVudCB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIFByb2dyZXNzQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgUHJvZ3Jlc3NCYXIgPSAoeyB2YWx1ZSwgbWF4ID0gMTAwLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgc2hvd0xhYmVsID0gdHJ1ZSwgbGFiZWwsIGxhYmVsUG9zaXRpb24gPSAnaW5zaWRlJywgc3RyaXBlZCA9IGZhbHNlLCBhbmltYXRlZCA9IGZhbHNlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gQ2FsY3VsYXRlIHBlcmNlbnRhZ2VcbiAgICBjb25zdCBwZXJjZW50YWdlID0gTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCAodmFsdWUgLyBtYXgpICogMTAwKSk7XG4gICAgLy8gVmFyaWFudCBjb2xvcnNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtNjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTYwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTYwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTYwMCcsXG4gICAgfTtcbiAgICAvLyBCYWNrZ3JvdW5kIGNvbG9yc1xuICAgIGNvbnN0IGJnQ2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWJsdWUtMTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTInLFxuICAgICAgICBtZDogJ2gtNCcsXG4gICAgICAgIGxnOiAnaC02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCd3LWZ1bGwnLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IHRyYWNrQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuJywgYmdDbGFzc2VzW3ZhcmlhbnRdLCBzaXplQ2xhc3Nlc1tzaXplXSk7XG4gICAgY29uc3QgYmFyQ2xhc3NlcyA9IGNsc3goJ2gtZnVsbCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgZWFzZS1vdXQnLCB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwge1xuICAgICAgICAvLyBTdHJpcGVkIHBhdHRlcm5cbiAgICAgICAgJ2JnLWdyYWRpZW50LXRvLXIgZnJvbS10cmFuc3BhcmVudCB2aWEtYmxhY2svMTAgdG8tdHJhbnNwYXJlbnQgYmctW2xlbmd0aDoxcmVtXzEwMCVdJzogc3RyaXBlZCxcbiAgICAgICAgJ2FuaW1hdGUtcHJvZ3Jlc3Mtc3RyaXBlcyc6IHN0cmlwZWQgJiYgYW5pbWF0ZWQsXG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbGFiZWwgfHwgKHNob3dMYWJlbCA/IGAke01hdGgucm91bmQocGVyY2VudGFnZSl9JWAgOiAnJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtsYWJlbFRleHQgJiYgbGFiZWxQb3NpdGlvbiA9PT0gJ291dHNpZGUnICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0xXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDBcIiwgY2hpbGRyZW46IGxhYmVsVGV4dCB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IHRyYWNrQ2xhc3Nlcywgcm9sZTogXCJwcm9ncmVzc2JhclwiLCBcImFyaWEtdmFsdWVub3dcIjogdmFsdWUsIFwiYXJpYS12YWx1ZW1pblwiOiAwLCBcImFyaWEtdmFsdWVtYXhcIjogbWF4LCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogYmFyQ2xhc3Nlcywgc3R5bGU6IHsgd2lkdGg6IGAke3BlcmNlbnRhZ2V9JWAgfSwgY2hpbGRyZW46IGxhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnaW5zaWRlJyAmJiBzaXplICE9PSAnc20nICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGgtZnVsbCBweC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC13aGl0ZSB3aGl0ZXNwYWNlLW5vd3JhcFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSB9KSB9KV0gfSkpO1xufTtcbi8vIEFkZCBhbmltYXRpb24gZm9yIHN0cmlwZWQgcHJvZ3Jlc3MgYmFyc1xuY29uc3Qgc3R5bGVzID0gYFxyXG5Aa2V5ZnJhbWVzIHByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGZyb20ge1xyXG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMXJlbSAwO1xyXG4gIH1cclxuICB0byB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAwIDA7XHJcbiAgfVxyXG59XHJcblxyXG4uYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzIHtcclxuICBhbmltYXRpb246IHByb2dyZXNzLXN0cmlwZXMgMXMgbGluZWFyIGluZmluaXRlO1xyXG59XHJcbmA7XG4vLyBJbmplY3Qgc3R5bGVzXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzLWJhci1zdHlsZXMnKSkge1xuICAgIGNvbnN0IHN0eWxlU2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlU2hlZXQuaWQgPSAncHJvZ3Jlc3MtYmFyLXN0eWxlcyc7XG4gICAgc3R5bGVTaGVldC50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlU2hlZXQpO1xufVxuZXhwb3J0IGRlZmF1bHQgUHJvZ3Jlc3NCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKlxuICogU2VhcmNoIGlucHV0IHdpdGggaWNvbiwgY2xlYXIgYnV0dG9uLCBhbmQgZGVib3VuY2VkIG9uQ2hhbmdlLlxuICogVXNlZCBmb3IgZmlsdGVyaW5nIGxpc3RzIGFuZCB0YWJsZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IFNlYXJjaCwgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFNlYXJjaEJhciA9ICh7IHZhbHVlOiBjb250cm9sbGVkVmFsdWUgPSAnJywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyID0gJ1NlYXJjaC4uLicsIGRlYm91bmNlRGVsYXkgPSAzMDAsIGRpc2FibGVkID0gZmFsc2UsIHNpemUgPSAnbWQnLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgW2lucHV0VmFsdWUsIHNldElucHV0VmFsdWVdID0gdXNlU3RhdGUoY29udHJvbGxlZFZhbHVlKTtcbiAgICAvLyBTeW5jIHdpdGggY29udHJvbGxlZCB2YWx1ZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoY29udHJvbGxlZFZhbHVlKTtcbiAgICB9LCBbY29udHJvbGxlZFZhbHVlXSk7XG4gICAgLy8gRGVib3VuY2VkIG9uQ2hhbmdlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9uQ2hhbmdlICYmIGlucHV0VmFsdWUgIT09IGNvbnRyb2xsZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKGlucHV0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBkZWJvdW5jZURlbGF5KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbaW5wdXRWYWx1ZSwgb25DaGFuZ2UsIGRlYm91bmNlRGVsYXksIGNvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIGNvbnN0IGhhbmRsZUlucHV0Q2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVDbGVhciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZSgnJyk7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoJycpO1xuICAgICAgICB9XG4gICAgfSwgW29uQ2hhbmdlXSk7XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC04IHRleHQtc20gcHgtMycsXG4gICAgICAgIG1kOiAnaC0xMCB0ZXh0LWJhc2UgcHgtNCcsXG4gICAgICAgIGxnOiAnaC0xMiB0ZXh0LWxnIHB4LTUnLFxuICAgIH07XG4gICAgY29uc3QgaWNvblNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtNCB3LTQnLFxuICAgICAgICBtZDogJ2gtNSB3LTUnLFxuICAgICAgICBsZzogJ2gtNiB3LTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3JlbGF0aXZlIGZsZXggaXRlbXMtY2VudGVyJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ3ctZnVsbCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0zMDAnLCAncGwtMTAgcHItMTAnLCAnYmctd2hpdGUgdGV4dC1ncmF5LTkwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgXG4gICAgLy8gRGlzYWJsZWRcbiAgICB7XG4gICAgICAgICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktNTAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSBsZWZ0LTMgdGV4dC1ncmF5LTQwMCBwb2ludGVyLWV2ZW50cy1ub25lJywgaWNvblNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBpbnB1dFZhbHVlLCBvbkNoYW5nZTogaGFuZGxlSW5wdXRDaGFuZ2UsIHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlciwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWxhYmVsXCI6IFwiU2VhcmNoXCIgfSksIGlucHV0VmFsdWUgJiYgIWRpc2FibGVkICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogaGFuZGxlQ2xlYXIsIGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgcmlnaHQtMycsICd0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIHJvdW5kZWQnLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJyksIFwiYXJpYS1sYWJlbFwiOiBcIkNsZWFyIHNlYXJjaFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogaWNvblNpemVDbGFzc2VzW3NpemVdIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaEJhcjtcbiIsIi8qKlxuICogTWljcm9zb2Z0IFRlYW1zIERpc2NvdmVyeSBUeXBlIERlZmluaXRpb25zXG4gKiBEZWZpbmVzIGFsbCB0eXBlcyBmb3IgTWljcm9zb2Z0IFRlYW1zIGRpc2NvdmVyeVxuICovXG5leHBvcnQgY29uc3QgREVGQVVMVF9URUFNU19DT05GSUcgPSB7XG4gICAgZGlzY292ZXJUZWFtczogdHJ1ZSxcbiAgICBkaXNjb3ZlckNoYW5uZWxzOiB0cnVlLFxuICAgIGRpc2NvdmVyTWVtYmVyczogdHJ1ZSxcbiAgICBkaXNjb3ZlckFwcHM6IHRydWUsXG4gICAgZGlzY292ZXJUYWJzOiBmYWxzZSxcbiAgICBpbmNsdWRlQXJjaGl2ZWRUZWFtczogZmFsc2UsXG4gICAgaW5jbHVkZUFjdGl2aXR5OiB0cnVlLFxuICAgIGluY2x1ZGVTZXR0aW5nczogdHJ1ZSxcbiAgICBpbmNsdWRlU2hhcmVQb2ludEludGVncmF0aW9uOiB0cnVlLFxuICAgIGluY2x1ZGVQcml2YXRlQ2hhbm5lbHM6IHRydWUsXG4gICAgaW5jbHVkZVNoYXJlZENoYW5uZWxzOiB0cnVlLFxuICAgIGluY2x1ZGVDaGFubmVsTWVzc2FnZXM6IGZhbHNlLFxuICAgIG1heE1lc3NhZ2VzVG9TY2FuOiAxMDAwLFxuICAgIGluY2x1ZGVHdWVzdFVzZXJzOiB0cnVlLFxuICAgIGluY2x1ZGVNZW1iZXJBY3Rpdml0eTogZmFsc2UsXG4gICAgaW5jbHVkZUxpY2Vuc2VJbmZvOiBmYWxzZSxcbiAgICBpbmNsdWRlQ3VzdG9tQXBwczogdHJ1ZSxcbiAgICBpbmNsdWRlVGhpcmRQYXJ0eUFwcHM6IHRydWUsXG4gICAgYW5hbHl6ZUFwcFBlcm1pc3Npb25zOiBmYWxzZSxcbiAgICBpbmNsdWRlVGFiQ29uZmlndXJhdGlvbnM6IGZhbHNlLFxuICAgIG1heENvbmN1cnJlbnRRdWVyaWVzOiA1LFxuICAgIGJhdGNoU2l6ZTogNTAsXG4gICAgdGhyb3R0bGVEZWxheTogMTAwLFxuICAgIGV4cG9ydEZvcm1hdDogJ2pzb24nLFxuICAgIGluY2x1ZGVEZXRhaWxlZExvZ3M6IGZhbHNlLFxufTtcbiIsIi8qKlxuICogTWljcm9zb2Z0IFRlYW1zIERpc2NvdmVyeSBMb2dpYyBIb29rXG4gKiBDb250YWlucyBhbGwgYnVzaW5lc3MgbG9naWMgZm9yIFRlYW1zIGRpc2NvdmVyeSB2aWV3XG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgREVGQVVMVF9URUFNU19DT05GSUcsIH0gZnJvbSAnLi4vdHlwZXMvbW9kZWxzL3RlYW1zJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VUZWFtc0Rpc2NvdmVyeUxvZ2ljKCkge1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBTdGF0ZSBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IFtjb25maWcsIHNldENvbmZpZ10gPSB1c2VTdGF0ZShERUZBVUxUX1RFQU1TX0NPTkZJRyk7XG4gICAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtwcm9ncmVzcywgc2V0UHJvZ3Jlc3NdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW2lzRGlzY292ZXJpbmcsIHNldElzRGlzY292ZXJpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLy8gVGVtcGxhdGVzXG4gICAgY29uc3QgW3RlbXBsYXRlcywgc2V0VGVtcGxhdGVzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRUZW1wbGF0ZSwgc2V0U2VsZWN0ZWRUZW1wbGF0ZV0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBGaWx0ZXJzXG4gICAgY29uc3QgW3RlYW1GaWx0ZXIsIHNldFRlYW1GaWx0ZXJdID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFtjaGFubmVsRmlsdGVyLCBzZXRDaGFubmVsRmlsdGVyXSA9IHVzZVN0YXRlKHt9KTtcbiAgICBjb25zdCBbbWVtYmVyRmlsdGVyLCBzZXRNZW1iZXJGaWx0ZXJdID0gdXNlU3RhdGUoe30pO1xuICAgIGNvbnN0IFthcHBGaWx0ZXIsIHNldEFwcEZpbHRlcl0gPSB1c2VTdGF0ZSh7fSk7XG4gICAgLy8gVUkgc3RhdGVcbiAgICBjb25zdCBbc2VsZWN0ZWRUYWIsIHNldFNlbGVjdGVkVGFiXSA9IHVzZVN0YXRlKCdvdmVydmlldycpO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBEYXRhIEZldGNoaW5nXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRUZW1wbGF0ZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgbG9hZFRlbXBsYXRlcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvVGVhbXNEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LVRlYW1zRGlzY292ZXJ5VGVtcGxhdGVzJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0VGVtcGxhdGVzKHJlc3VsdC5kYXRhPy50ZW1wbGF0ZXMgfHwgW10pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHRlbXBsYXRlczonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gRGlzY292ZXJ5IEV4ZWN1dGlvblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNEaXNjb3ZlcmluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldFByb2dyZXNzKHtcbiAgICAgICAgICAgIHBoYXNlOiAnaW5pdGlhbGl6aW5nJyxcbiAgICAgICAgICAgIHBoYXNlTGFiZWw6ICdJbml0aWFsaXppbmcgVGVhbXMgZGlzY292ZXJ5Li4uJyxcbiAgICAgICAgICAgIHBlcmNlbnRDb21wbGV0ZTogMCxcbiAgICAgICAgICAgIGl0ZW1zUHJvY2Vzc2VkOiAwLFxuICAgICAgICAgICAgdG90YWxJdGVtczogMCxcbiAgICAgICAgICAgIGVycm9yczogMCxcbiAgICAgICAgICAgIHdhcm5pbmdzOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IFByb2dyZXNzRGF0YSB0byBUZWFtc0Rpc2NvdmVyeVByb2dyZXNzXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBwaGFzZTogJ2luaXRpYWxpemluZycsXG4gICAgICAgICAgICAgICAgICAgIHBoYXNlTGFiZWw6IGRhdGEubWVzc2FnZSB8fCAnUHJvY2Vzc2luZy4uLicsXG4gICAgICAgICAgICAgICAgICAgIHBlcmNlbnRDb21wbGV0ZTogZGF0YS5wZXJjZW50YWdlLFxuICAgICAgICAgICAgICAgICAgICBpdGVtc1Byb2Nlc3NlZDogZGF0YS5pdGVtc1Byb2Nlc3NlZCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbEl0ZW1zOiBkYXRhLnRvdGFsSXRlbXMgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiAwLFxuICAgICAgICAgICAgICAgICAgICB3YXJuaW5nczogMCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldFByb2dyZXNzKHByb2dyZXNzRGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NvdmVyeVJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvVGVhbXNEaXNjb3ZlcnkucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLVRlYW1zRGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIENvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChkaXNjb3ZlcnlSZXN1bHQuc3VjY2VzcyAmJiBkaXNjb3ZlcnlSZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldFJlc3VsdChkaXNjb3ZlcnlSZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZGlzY292ZXJ5UmVzdWx0LmVycm9yIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdEaXNjb3ZlcnkgZmFpbGVkJyk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzRGlzY292ZXJpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2NvbmZpZ10pO1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24oJ3RlYW1zLWRpc2NvdmVyeScpO1xuICAgICAgICAgICAgc2V0SXNEaXNjb3ZlcmluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRQcm9ncmVzcyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnIpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBUZW1wbGF0ZSBNYW5hZ2VtZW50XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGxvYWRUZW1wbGF0ZSA9IHVzZUNhbGxiYWNrKCh0ZW1wbGF0ZSkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgc2V0Q29uZmlnKHRlbXBsYXRlLmNvbmZpZyk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHNhdmVBc1RlbXBsYXRlID0gdXNlQ2FsbGJhY2soYXN5bmMgKG5hbWUsIGRlc2NyaXB0aW9uKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRGlzY292ZXJ5L1RlYW1zRGlzY292ZXJ5LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1NhdmUtVGVhbXNEaXNjb3ZlcnlUZW1wbGF0ZScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBOYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBEZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgICAgIENvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IGxvYWRUZW1wbGF0ZXMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSB0ZW1wbGF0ZTonLCBlcnIpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfSwgW2NvbmZpZ10pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBGaWx0ZXJlZCBEYXRhXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGNvbnN0IGZpbHRlcmVkVGVhbXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQ/LnRlYW1zKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICByZXR1cm4gcmVzdWx0Py50ZWFtcz8uZmlsdGVyKCh0ZWFtKSA9PiB7XG4gICAgICAgICAgICBpZiAodGVhbUZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gdGVhbUZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9ICh0ZWFtLmRpc3BsYXlOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAgICAgdGVhbS5kZXNjcmlwdGlvbj8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgICh0ZWFtLm1haWxOaWNrbmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpO1xuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlcylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlYW1GaWx0ZXIudmlzaWJpbGl0eT8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZWFtRmlsdGVyLnZpc2liaWxpdHkuaW5jbHVkZXModGVhbS52aXNpYmlsaXR5KSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlYW1GaWx0ZXIubWluTWVtYmVyQ291bnQgIT09IHVuZGVmaW5lZCAmJiB0ZWFtLm1lbWJlckNvdW50IDwgdGVhbUZpbHRlci5taW5NZW1iZXJDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0ZWFtRmlsdGVyLm1heE1lbWJlckNvdW50ICE9PSB1bmRlZmluZWQgJiYgdGVhbS5tZW1iZXJDb3VudCA+IHRlYW1GaWx0ZXIubWF4TWVtYmVyQ291bnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVhbUZpbHRlci5pc0FyY2hpdmVkICE9PSB1bmRlZmluZWQgJiYgdGVhbS5pc0FyY2hpdmVkICE9PSB0ZWFtRmlsdGVyLmlzQXJjaGl2ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVhbUZpbHRlci5oYXNHdWVzdHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhc0d1ZXN0cyA9ICh0ZWFtLmd1ZXN0Q291bnQgPz8gMCkgPiAwO1xuICAgICAgICAgICAgICAgIGlmIChoYXNHdWVzdHMgIT09IHRlYW1GaWx0ZXIuaGFzR3Vlc3RzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVhbUZpbHRlci5jbGFzc2lmaWNhdGlvbj8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0ZWFtLmNsYXNzaWZpY2F0aW9uIHx8ICF0ZWFtRmlsdGVyLmNsYXNzaWZpY2F0aW9uLmluY2x1ZGVzKHRlYW0uY2xhc3NpZmljYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgW3Jlc3VsdD8udGVhbXMsIHRlYW1GaWx0ZXJdKTtcbiAgICBjb25zdCBmaWx0ZXJlZENoYW5uZWxzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0Py5jaGFubmVscylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdD8uY2hhbm5lbHM/LmZpbHRlcigoY2hhbm5lbCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNoYW5uZWxGaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IGNoYW5uZWxGaWx0ZXIuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSAoY2hhbm5lbC5kaXNwbGF5TmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgIGNoYW5uZWwuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFubmVsRmlsdGVyLmNoYW5uZWxUeXBlcz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjaGFubmVsRmlsdGVyLmNoYW5uZWxUeXBlcy5pbmNsdWRlcyhjaGFubmVsLmNoYW5uZWxUeXBlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoYW5uZWxGaWx0ZXIubWluTWVzc2FnZUNvdW50ICE9PSB1bmRlZmluZWQgJiYgY2hhbm5lbC5tZXNzYWdlQ291bnQgPCBjaGFubmVsRmlsdGVyLm1pbk1lc3NhZ2VDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjaGFubmVsRmlsdGVyLmhhc0ZpbGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNGaWxlcyA9IChjaGFubmVsLmZpbGVDb3VudCA/PyAwKSA+IDA7XG4gICAgICAgICAgICAgICAgaWYgKGhhc0ZpbGVzICE9PSBjaGFubmVsRmlsdGVyLmhhc0ZpbGVzKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSwgW3Jlc3VsdD8uY2hhbm5lbHMsIGNoYW5uZWxGaWx0ZXJdKTtcbiAgICBjb25zdCBmaWx0ZXJlZE1lbWJlcnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQ/Lm1lbWJlcnMpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiByZXN1bHQ/Lm1lbWJlcnM/LmZpbHRlcigobWVtYmVyKSA9PiB7XG4gICAgICAgICAgICBpZiAobWVtYmVyRmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBtZW1iZXJGaWx0ZXIuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSAobWVtYmVyLmRpc3BsYXlOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAgICAgKG1lbWJlci5lbWFpbCA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgIChtZW1iZXIudXNlclByaW5jaXBhbE5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtZW1iZXJGaWx0ZXIucm9sZXM/Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICghbWVtYmVyRmlsdGVyLnJvbGVzLmluY2x1ZGVzKG1lbWJlci5yb2xlKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1lbWJlckZpbHRlci5pc0d1ZXN0ICE9PSB1bmRlZmluZWQgJiYgbWVtYmVyLmlzR3Vlc3QgIT09IG1lbWJlckZpbHRlci5pc0d1ZXN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1lbWJlckZpbHRlci5hY2NvdW50RW5hYmxlZCAhPT0gdW5kZWZpbmVkICYmIG1lbWJlci5hY2NvdW50RW5hYmxlZCAhPT0gbWVtYmVyRmlsdGVyLmFjY291bnRFbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1lbWJlckZpbHRlci5oYXNMaWNlbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNMaWNlbnNlID0gKG1lbWJlci5hc3NpZ25lZExpY2Vuc2VzPy5sZW5ndGggPz8gMCkgPiAwO1xuICAgICAgICAgICAgICAgIGlmIChoYXNMaWNlbnNlICE9PSBtZW1iZXJGaWx0ZXIuaGFzTGljZW5zZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0sIFtyZXN1bHQ/Lm1lbWJlcnMsIG1lbWJlckZpbHRlcl0pO1xuICAgIGNvbnN0IGZpbHRlcmVkQXBwcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdD8uYXBwcylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdD8uYXBwcz8uZmlsdGVyKChhcHApID0+IHtcbiAgICAgICAgICAgIGlmIChhcHBGaWx0ZXIuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IGFwcEZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IChhcHAuZGlzcGxheU5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcHBGaWx0ZXIuZGlzdHJpYnV0aW9uTWV0aG9kcz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhcHBGaWx0ZXIuZGlzdHJpYnV0aW9uTWV0aG9kcy5pbmNsdWRlcyhhcHAuZGlzdHJpYnV0aW9uTWV0aG9kKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0sIFtyZXN1bHQ/LmFwcHMsIGFwcEZpbHRlcl0pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBBRyBHcmlkIENvbHVtbiBEZWZpbml0aW9uc1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCB0ZWFtQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUZWFtIE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBwaW5uZWQ6ICdsZWZ0JyxcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd2aXNpYmlsaXR5JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdWaXNpYmlsaXR5JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdtZW1iZXJDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTWVtYmVycycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnb3duZXJDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnT3duZXJzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDkwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2d1ZXN0Q291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0d1ZXN0cycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiA5MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdjaGFubmVsQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NoYW5uZWxzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpc0FyY2hpdmVkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gKHBhcmFtcy52YWx1ZSA/ICdBcmNoaXZlZCcgOiAnQWN0aXZlJyksXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2xhc3RBY3Rpdml0eURhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgQWN0aXZpdHknLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY3JlYXRlZERhdGVUaW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgY29uc3QgY2hhbm5lbENvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ2hhbm5lbCBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NoYW5uZWxUeXBlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMzAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ21lc3NhZ2VDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTWVzc2FnZXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlLnRvTG9jYWxlU3RyaW5nKCksXG4gICAgICAgICAgICB3aWR0aDogMTEwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3JlcGx5Q291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1JlcGxpZXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlLnRvTG9jYWxlU3RyaW5nKCksXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ21lbWJlckNvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdNZW1iZXJzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdmaWxlQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0ZpbGVzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDgwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2xhc3RBY3Rpdml0eURhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgQWN0aXZpdHknLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIGNvbnN0IG1lbWJlckNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2VtYWlsJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdFbWFpbCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAncm9sZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUm9sZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaXNHdWVzdCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVHlwZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiAocGFyYW1zLnZhbHVlID8gJ0d1ZXN0JyA6ICdNZW1iZXInKSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYWNjb3VudEVuYWJsZWQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FjY291bnQgU3RhdHVzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IChwYXJhbXMudmFsdWUgPyAnQWN0aXZlJyA6ICdEaXNhYmxlZCcpLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdtZXNzYWdlQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01lc3NhZ2VzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdOdW1iZXJDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZT8udG9Mb2NhbGVTdHJpbmcoKSA/PyAnTi9BJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbGFzdEFjdGl2ZURhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0xhc3QgQWN0aXZlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpIDogJ04vQScsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBhcHBDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzcGxheU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FwcCBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICB3aWR0aDogMjUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3ZlcnNpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1ZlcnNpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3RyaWJ1dGlvbk1ldGhvZCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzdHJpYnV0aW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpbnN0YWxsZWRCeScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnSW5zdGFsbGVkIEJ5JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpbnN0YWxsZWREYXRlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdJbnN0YWxsZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBFeHBvcnQgRnVuY3Rpb25hbGl0eVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBjb25zdCBleHBvcnREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRXhwb3J0L0V4cG9ydFNlcnZpY2UucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LVRlYW1zRGlzY292ZXJ5RGF0YScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBSZXN1bHQ6IHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgT3B0aW9uczogb3B0aW9ucyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGV4cG9ydCBkYXRhOicsIGVycik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICB9LCBbcmVzdWx0XSk7XG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFJldHVybiBIb29rIEFQSVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBTdGF0ZVxuICAgICAgICBjb25maWcsXG4gICAgICAgIHNldENvbmZpZyxcbiAgICAgICAgcmVzdWx0LFxuICAgICAgICBjdXJyZW50UmVzdWx0OiByZXN1bHQsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgLy8gVGVtcGxhdGVzXG4gICAgICAgIHRlbXBsYXRlcyxcbiAgICAgICAgc2VsZWN0ZWRUZW1wbGF0ZSxcbiAgICAgICAgbG9hZFRlbXBsYXRlLFxuICAgICAgICBzYXZlQXNUZW1wbGF0ZSxcbiAgICAgICAgLy8gRGlzY292ZXJ5IGNvbnRyb2xcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgLy8gRmlsdGVyZWQgZGF0YVxuICAgICAgICB0ZWFtczogZmlsdGVyZWRUZWFtcyxcbiAgICAgICAgY2hhbm5lbHM6IGZpbHRlcmVkQ2hhbm5lbHMsXG4gICAgICAgIG1lbWJlcnM6IGZpbHRlcmVkTWVtYmVycyxcbiAgICAgICAgYXBwczogZmlsdGVyZWRBcHBzLFxuICAgICAgICAvLyBGaWx0ZXJzXG4gICAgICAgIHRlYW1GaWx0ZXIsXG4gICAgICAgIHNldFRlYW1GaWx0ZXIsXG4gICAgICAgIGNoYW5uZWxGaWx0ZXIsXG4gICAgICAgIHNldENoYW5uZWxGaWx0ZXIsXG4gICAgICAgIG1lbWJlckZpbHRlcixcbiAgICAgICAgc2V0TWVtYmVyRmlsdGVyLFxuICAgICAgICBhcHBGaWx0ZXIsXG4gICAgICAgIHNldEFwcEZpbHRlcixcbiAgICAgICAgLy8gQUcgR3JpZCBjb2x1bW5zXG4gICAgICAgIHRlYW1Db2x1bW5zLFxuICAgICAgICBjaGFubmVsQ29sdW1ucyxcbiAgICAgICAgbWVtYmVyQ29sdW1ucyxcbiAgICAgICAgYXBwQ29sdW1ucyxcbiAgICAgICAgLy8gRXhwb3J0XG4gICAgICAgIGV4cG9ydERhdGEsXG4gICAgICAgIC8vIFVJXG4gICAgICAgIHNlbGVjdGVkVGFiLFxuICAgICAgICBzZXRTZWxlY3RlZFRhYixcbiAgICAgICAgLy8gU3RhdGlzdGljc1xuICAgICAgICBzdGF0aXN0aWNzOiByZXN1bHQ/LnN0YXRpc3RpY3MsXG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==