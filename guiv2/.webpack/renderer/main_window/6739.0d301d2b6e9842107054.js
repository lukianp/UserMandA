"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6739],{

/***/ 14676:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ useInfrastructureDiscoveryHubLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(84976);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_1__);
/**
 * Infrastructure Discovery Hub Logic Hook
 * Manages state and business logic for the central discovery dashboard
 */


/**
 * Default discovery modules registry
 */
const defaultDiscoveryModules = [
    {
        id: 'active-directory',
        name: 'Active Directory',
        icon: 'Database',
        description: 'Discover users, groups, computers, OUs, GPOs, and trust relationships from Active Directory',
        route: '/discovery/active-directory',
        status: 'idle',
    },
    {
        id: 'azure-infrastructure',
        name: 'Azure Infrastructure',
        icon: 'Cloud',
        description: 'Discover Azure resources, subscriptions, resource groups, and configurations',
        route: '/discovery/azure',
        status: 'idle',
    },
    {
        id: 'office365',
        name: 'Office 365',
        icon: 'Mail',
        description: 'Discover Microsoft 365 users, mailboxes, licenses, and configurations',
        route: '/discovery/office365',
        status: 'idle',
    },
    {
        id: 'exchange',
        name: 'Exchange',
        icon: 'Inbox',
        description: 'Discover Exchange servers, mailboxes, and email infrastructure',
        route: '/discovery/exchange',
        status: 'idle',
    },
    {
        id: 'sharepoint',
        name: 'SharePoint',
        icon: 'FolderTree',
        description: 'Discover SharePoint sites, libraries, and content',
        route: '/discovery/sharepoint',
        status: 'idle',
    },
    {
        id: 'teams',
        name: 'Microsoft Teams',
        icon: 'Users',
        description: 'Discover Teams, channels, and collaboration data',
        route: '/discovery/teams',
        status: 'idle',
    },
    {
        id: 'onedrive',
        name: 'OneDrive',
        icon: 'HardDrive',
        description: 'Discover OneDrive for Business storage and sharing',
        route: '/discovery/onedrive',
        status: 'idle',
    },
    {
        id: 'applications',
        name: 'Applications',
        icon: 'Package',
        description: 'Discover installed applications, dependencies, and versions',
        route: '/discovery/applications',
        status: 'idle',
    },
    {
        id: 'file-system',
        name: 'File System',
        icon: 'Folder',
        description: 'Discover file shares, permissions, and storage',
        route: '/discovery/file-system',
        status: 'idle',
    },
    {
        id: 'network',
        name: 'Network Infrastructure',
        icon: 'Network',
        description: 'Discover network topology, devices, and connections',
        route: '/discovery/network',
        status: 'idle',
    },
    {
        id: 'security',
        name: 'Security Infrastructure',
        icon: 'Shield',
        description: 'Discover security policies, compliance, and vulnerabilities',
        route: '/discovery/security',
        status: 'idle',
    },
    {
        id: 'sql-server',
        name: 'SQL Server',
        icon: 'Database',
        description: 'Discover SQL Server instances, databases, and configurations',
        route: '/discovery/sql-server',
        status: 'idle',
    },
    {
        id: 'vmware',
        name: 'VMware',
        icon: 'Server',
        description: 'Discover VMware virtual infrastructure and resources',
        route: '/discovery/vmware',
        status: 'idle',
    },
    {
        id: 'hyper-v',
        name: 'Hyper-V',
        icon: 'Server',
        description: 'Discover Hyper-V virtual machines and hosts',
        route: '/discovery/hyper-v',
        status: 'idle',
    },
    {
        id: 'aws',
        name: 'AWS Cloud',
        icon: 'Cloud',
        description: 'Discover Amazon Web Services resources and infrastructure',
        route: '/discovery/aws',
        status: 'idle',
    },
    {
        id: 'google-workspace',
        name: 'Google Workspace',
        icon: 'Mail',
        description: 'Discover Google Workspace users, groups, and data',
        route: '/discovery/google-workspace',
        status: 'idle',
    },
];
/**
 * Infrastructure Discovery Hub Logic Hook
 */
const useInfrastructureDiscoveryHubLogic = () => {
    const navigate = (0,react_router_dom__WEBPACK_IMPORTED_MODULE_1__.useNavigate)();
    // State
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        discoveryModules: [],
        recentActivity: [],
        activeDiscoveries: [],
        queuedDiscoveries: [],
        isLoading: true,
        filter: '',
        selectedCategory: null,
        sortBy: 'name',
    });
    /**
     * Load discovery modules and their status
     */
    const loadDiscoveryModules = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            // Load saved discovery status from localStorage
            const savedStatus = localStorage.getItem('discoveryModulesStatus');
            const statusMap = savedStatus ? JSON.parse(savedStatus) : {};
            // Merge with defaults
            const modules = defaultDiscoveryModules.map(module => ({
                ...module,
                lastRun: statusMap[module.id]?.lastRun,
                resultCount: statusMap[module.id]?.resultCount,
                status: statusMap[module.id]?.status || 'idle',
            }));
            setState(prev => ({ ...prev, discoveryModules: modules, isLoading: false }));
        }
        catch (error) {
            console.error('Failed to load discovery modules:', error);
            setState(prev => ({
                ...prev,
                discoveryModules: defaultDiscoveryModules,
                isLoading: false
            }));
        }
    }, []);
    /**
     * Load recent discovery activity
     */
    const loadRecentActivity = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        try {
            const savedActivity = localStorage.getItem('recentDiscoveryActivity');
            if (savedActivity) {
                const activity = JSON.parse(savedActivity);
                // Convert timestamp strings to Date objects
                const processedActivity = activity.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp),
                }));
                setState(prev => ({ ...prev, recentActivity: processedActivity }));
            }
        }
        catch (error) {
            console.error('Failed to load recent activity:', error);
        }
    }, []);
    /**
     * Load active discoveries
     */
    const loadActiveDiscoveries = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        // In a real implementation, this would query the backend for running discoveries
        // For now, we'll check localStorage for any in-progress discoveries
        try {
            const savedActive = localStorage.getItem('activeDiscoveries');
            if (savedActive) {
                const active = JSON.parse(savedActive);
                const processedActive = active.map(item => ({
                    ...item,
                    startTime: new Date(item.startTime),
                }));
                setState(prev => ({ ...prev, activeDiscoveries: processedActive }));
            }
        }
        catch (error) {
            console.error('Failed to load active discoveries:', error);
        }
    }, []);
    /**
     * Initialize data on mount
     */
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        loadDiscoveryModules();
        loadRecentActivity();
        loadActiveDiscoveries();
    }, [loadDiscoveryModules, loadRecentActivity, loadActiveDiscoveries]);
    /**
     * Subscribe to discovery progress updates
     */
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'discovery-progress') {
                setState(prev => {
                    const activeIndex = prev.activeDiscoveries.findIndex(a => a.id === data.id);
                    if (activeIndex >= 0) {
                        const updated = [...prev.activeDiscoveries];
                        updated[activeIndex] = {
                            ...updated[activeIndex],
                            progress: data.progress,
                            currentOperation: data.currentOperation,
                        };
                        return { ...prev, activeDiscoveries: updated };
                    }
                    return prev;
                });
            }
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, []);
    /**
     * Filter and sort discovery modules
     */
    const filteredAndSortedModules = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        let filtered = state.discoveryModules;
        // Apply text filter
        if (state.filter) {
            const searchLower = state.filter.toLowerCase();
            filtered = filtered.filter(module => (module.name ?? '').toLowerCase().includes(searchLower) ||
                (module.description ?? '').toLowerCase().includes(searchLower));
        }
        // Apply category filter (if implemented)
        // if (state.selectedCategory) {
        //   filtered = filtered.filter(m => m.category === state.selectedCategory);
        // }
        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (state.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'lastRun':
                    if (!a.lastRun && !b.lastRun)
                        return 0;
                    if (!a.lastRun)
                        return 1;
                    if (!b.lastRun)
                        return -1;
                    return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'resultCount':
                    return (b.resultCount || 0) - (a.resultCount || 0);
                default:
                    return 0;
            }
        });
        return sorted;
    }, [state.discoveryModules, state.filter, state.selectedCategory, state.sortBy]);
    /**
     * Launch discovery module
     */
    const launchDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((route) => {
        navigate(route);
    }, [navigate]);
    /**
     * Update discovery module status
     */
    const updateModuleStatus = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((moduleId, status, resultCount) => {
        setState(prev => {
            const updated = prev.discoveryModules.map(module => module.id === moduleId
                ? {
                    ...module,
                    status,
                    lastRun: new Date().toISOString(),
                    resultCount: resultCount ?? module.resultCount
                }
                : module);
            // Save to localStorage
            const statusMap = updated.reduce((acc, module) => {
                acc[module.id] = {
                    lastRun: module.lastRun,
                    resultCount: module.resultCount,
                    status: module.status,
                };
                return acc;
            }, {});
            localStorage.setItem('discoveryModulesStatus', JSON.stringify(statusMap));
            return { ...prev, discoveryModules: updated };
        });
    }, []);
    /**
     * Set filter text
     */
    const setFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((filter) => {
        setState(prev => ({ ...prev, filter }));
    }, []);
    /**
     * Set sort order
     */
    const setSortBy = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((sortBy) => {
        setState(prev => ({ ...prev, sortBy }));
    }, []);
    /**
     * Refresh all data
     */
    const refresh = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        loadDiscoveryModules();
        loadRecentActivity();
        loadActiveDiscoveries();
    }, [loadDiscoveryModules, loadRecentActivity, loadActiveDiscoveries]);
    return {
        // State
        discoveryModules: filteredAndSortedModules,
        recentActivity: state.recentActivity,
        activeDiscoveries: state.activeDiscoveries,
        queuedDiscoveries: state.queuedDiscoveries,
        isLoading: state.isLoading,
        filter: state.filter,
        sortBy: state.sortBy,
        // Actions
        launchDiscovery,
        updateModuleStatus,
        setFilter,
        setSortBy,
        refresh,
    };
};


/***/ }),

/***/ 53404:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   I: () => (/* binding */ SearchBar)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Search */ .vji, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUluZnJhc3RydWN0dXJlRGlzY292ZXJ5SHViTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0JhZGdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEluZnJhc3RydWN0dXJlIERpc2NvdmVyeSBIdWIgTG9naWMgSG9va1xuICogTWFuYWdlcyBzdGF0ZSBhbmQgYnVzaW5lc3MgbG9naWMgZm9yIHRoZSBjZW50cmFsIGRpc2NvdmVyeSBkYXNoYm9hcmRcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuLyoqXG4gKiBEZWZhdWx0IGRpc2NvdmVyeSBtb2R1bGVzIHJlZ2lzdHJ5XG4gKi9cbmNvbnN0IGRlZmF1bHREaXNjb3ZlcnlNb2R1bGVzID0gW1xuICAgIHtcbiAgICAgICAgaWQ6ICdhY3RpdmUtZGlyZWN0b3J5JyxcbiAgICAgICAgbmFtZTogJ0FjdGl2ZSBEaXJlY3RvcnknLFxuICAgICAgICBpY29uOiAnRGF0YWJhc2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIHVzZXJzLCBncm91cHMsIGNvbXB1dGVycywgT1VzLCBHUE9zLCBhbmQgdHJ1c3QgcmVsYXRpb25zaGlwcyBmcm9tIEFjdGl2ZSBEaXJlY3RvcnknLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvYWN0aXZlLWRpcmVjdG9yeScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2F6dXJlLWluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgbmFtZTogJ0F6dXJlIEluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgaWNvbjogJ0Nsb3VkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBBenVyZSByZXNvdXJjZXMsIHN1YnNjcmlwdGlvbnMsIHJlc291cmNlIGdyb3VwcywgYW5kIGNvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2F6dXJlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnb2ZmaWNlMzY1JyxcbiAgICAgICAgbmFtZTogJ09mZmljZSAzNjUnLFxuICAgICAgICBpY29uOiAnTWFpbCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgTWljcm9zb2Z0IDM2NSB1c2VycywgbWFpbGJveGVzLCBsaWNlbnNlcywgYW5kIGNvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L29mZmljZTM2NScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2V4Y2hhbmdlJyxcbiAgICAgICAgbmFtZTogJ0V4Y2hhbmdlJyxcbiAgICAgICAgaWNvbjogJ0luYm94JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBFeGNoYW5nZSBzZXJ2ZXJzLCBtYWlsYm94ZXMsIGFuZCBlbWFpbCBpbmZyYXN0cnVjdHVyZScsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9leGNoYW5nZScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3NoYXJlcG9pbnQnLFxuICAgICAgICBuYW1lOiAnU2hhcmVQb2ludCcsXG4gICAgICAgIGljb246ICdGb2xkZXJUcmVlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBTaGFyZVBvaW50IHNpdGVzLCBsaWJyYXJpZXMsIGFuZCBjb250ZW50JyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L3NoYXJlcG9pbnQnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICd0ZWFtcycsXG4gICAgICAgIG5hbWU6ICdNaWNyb3NvZnQgVGVhbXMnLFxuICAgICAgICBpY29uOiAnVXNlcnMnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFRlYW1zLCBjaGFubmVscywgYW5kIGNvbGxhYm9yYXRpb24gZGF0YScsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS90ZWFtcycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ29uZWRyaXZlJyxcbiAgICAgICAgbmFtZTogJ09uZURyaXZlJyxcbiAgICAgICAgaWNvbjogJ0hhcmREcml2ZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgT25lRHJpdmUgZm9yIEJ1c2luZXNzIHN0b3JhZ2UgYW5kIHNoYXJpbmcnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvb25lZHJpdmUnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbnMnLFxuICAgICAgICBuYW1lOiAnQXBwbGljYXRpb25zJyxcbiAgICAgICAgaWNvbjogJ1BhY2thZ2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIGluc3RhbGxlZCBhcHBsaWNhdGlvbnMsIGRlcGVuZGVuY2llcywgYW5kIHZlcnNpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2FwcGxpY2F0aW9ucycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2ZpbGUtc3lzdGVtJyxcbiAgICAgICAgbmFtZTogJ0ZpbGUgU3lzdGVtJyxcbiAgICAgICAgaWNvbjogJ0ZvbGRlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgZmlsZSBzaGFyZXMsIHBlcm1pc3Npb25zLCBhbmQgc3RvcmFnZScsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9maWxlLXN5c3RlbScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ25ldHdvcmsnLFxuICAgICAgICBuYW1lOiAnTmV0d29yayBJbmZyYXN0cnVjdHVyZScsXG4gICAgICAgIGljb246ICdOZXR3b3JrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBuZXR3b3JrIHRvcG9sb2d5LCBkZXZpY2VzLCBhbmQgY29ubmVjdGlvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvbmV0d29yaycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3NlY3VyaXR5JyxcbiAgICAgICAgbmFtZTogJ1NlY3VyaXR5IEluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgaWNvbjogJ1NoaWVsZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgc2VjdXJpdHkgcG9saWNpZXMsIGNvbXBsaWFuY2UsIGFuZCB2dWxuZXJhYmlsaXRpZXMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvc2VjdXJpdHknLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdzcWwtc2VydmVyJyxcbiAgICAgICAgbmFtZTogJ1NRTCBTZXJ2ZXInLFxuICAgICAgICBpY29uOiAnRGF0YWJhc2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFNRTCBTZXJ2ZXIgaW5zdGFuY2VzLCBkYXRhYmFzZXMsIGFuZCBjb25maWd1cmF0aW9ucycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9zcWwtc2VydmVyJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAndm13YXJlJyxcbiAgICAgICAgbmFtZTogJ1ZNd2FyZScsXG4gICAgICAgIGljb246ICdTZXJ2ZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFZNd2FyZSB2aXJ0dWFsIGluZnJhc3RydWN0dXJlIGFuZCByZXNvdXJjZXMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvdm13YXJlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnaHlwZXItdicsXG4gICAgICAgIG5hbWU6ICdIeXBlci1WJyxcbiAgICAgICAgaWNvbjogJ1NlcnZlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgSHlwZXItViB2aXJ0dWFsIG1hY2hpbmVzIGFuZCBob3N0cycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9oeXBlci12JyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnYXdzJyxcbiAgICAgICAgbmFtZTogJ0FXUyBDbG91ZCcsXG4gICAgICAgIGljb246ICdDbG91ZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgQW1hem9uIFdlYiBTZXJ2aWNlcyByZXNvdXJjZXMgYW5kIGluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2F3cycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2dvb2dsZS13b3Jrc3BhY2UnLFxuICAgICAgICBuYW1lOiAnR29vZ2xlIFdvcmtzcGFjZScsXG4gICAgICAgIGljb246ICdNYWlsJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBHb29nbGUgV29ya3NwYWNlIHVzZXJzLCBncm91cHMsIGFuZCBkYXRhJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2dvb2dsZS13b3Jrc3BhY2UnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuXTtcbi8qKlxuICogSW5mcmFzdHJ1Y3R1cmUgRGlzY292ZXJ5IEh1YiBMb2dpYyBIb29rXG4gKi9cbmV4cG9ydCBjb25zdCB1c2VJbmZyYXN0cnVjdHVyZURpc2NvdmVyeUh1YkxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgICAvLyBTdGF0ZVxuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBkaXNjb3ZlcnlNb2R1bGVzOiBbXSxcbiAgICAgICAgcmVjZW50QWN0aXZpdHk6IFtdLFxuICAgICAgICBhY3RpdmVEaXNjb3ZlcmllczogW10sXG4gICAgICAgIHF1ZXVlZERpc2NvdmVyaWVzOiBbXSxcbiAgICAgICAgaXNMb2FkaW5nOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6ICcnLFxuICAgICAgICBzZWxlY3RlZENhdGVnb3J5OiBudWxsLFxuICAgICAgICBzb3J0Qnk6ICduYW1lJyxcbiAgICB9KTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGRpc2NvdmVyeSBtb2R1bGVzIGFuZCB0aGVpciBzdGF0dXNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkRGlzY292ZXJ5TW9kdWxlcyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBpc0xvYWRpbmc6IHRydWUgfSkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTG9hZCBzYXZlZCBkaXNjb3Zlcnkgc3RhdHVzIGZyb20gbG9jYWxTdG9yYWdlXG4gICAgICAgICAgICBjb25zdCBzYXZlZFN0YXR1cyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkaXNjb3ZlcnlNb2R1bGVzU3RhdHVzJyk7XG4gICAgICAgICAgICBjb25zdCBzdGF0dXNNYXAgPSBzYXZlZFN0YXR1cyA/IEpTT04ucGFyc2Uoc2F2ZWRTdGF0dXMpIDoge307XG4gICAgICAgICAgICAvLyBNZXJnZSB3aXRoIGRlZmF1bHRzXG4gICAgICAgICAgICBjb25zdCBtb2R1bGVzID0gZGVmYXVsdERpc2NvdmVyeU1vZHVsZXMubWFwKG1vZHVsZSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLm1vZHVsZSxcbiAgICAgICAgICAgICAgICBsYXN0UnVuOiBzdGF0dXNNYXBbbW9kdWxlLmlkXT8ubGFzdFJ1bixcbiAgICAgICAgICAgICAgICByZXN1bHRDb3VudDogc3RhdHVzTWFwW21vZHVsZS5pZF0/LnJlc3VsdENvdW50LFxuICAgICAgICAgICAgICAgIHN0YXR1czogc3RhdHVzTWFwW21vZHVsZS5pZF0/LnN0YXR1cyB8fCAnaWRsZScsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGRpc2NvdmVyeU1vZHVsZXM6IG1vZHVsZXMsIGlzTG9hZGluZzogZmFsc2UgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgZGlzY292ZXJ5IG1vZHVsZXM6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgZGlzY292ZXJ5TW9kdWxlczogZGVmYXVsdERpc2NvdmVyeU1vZHVsZXMsXG4gICAgICAgICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIExvYWQgcmVjZW50IGRpc2NvdmVyeSBhY3Rpdml0eVxuICAgICAqL1xuICAgIGNvbnN0IGxvYWRSZWNlbnRBY3Rpdml0eSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNhdmVkQWN0aXZpdHkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmVjZW50RGlzY292ZXJ5QWN0aXZpdHknKTtcbiAgICAgICAgICAgIGlmIChzYXZlZEFjdGl2aXR5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZpdHkgPSBKU09OLnBhcnNlKHNhdmVkQWN0aXZpdHkpO1xuICAgICAgICAgICAgICAgIC8vIENvbnZlcnQgdGltZXN0YW1wIHN0cmluZ3MgdG8gRGF0ZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkQWN0aXZpdHkgPSBhY3Rpdml0eS5tYXAoaXRlbSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5pdGVtLFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKGl0ZW0udGltZXN0YW1wKSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCByZWNlbnRBY3Rpdml0eTogcHJvY2Vzc2VkQWN0aXZpdHkgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgcmVjZW50IGFjdGl2aXR5OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGFjdGl2ZSBkaXNjb3Zlcmllc1xuICAgICAqL1xuICAgIGNvbnN0IGxvYWRBY3RpdmVEaXNjb3ZlcmllcyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHF1ZXJ5IHRoZSBiYWNrZW5kIGZvciBydW5uaW5nIGRpc2NvdmVyaWVzXG4gICAgICAgIC8vIEZvciBub3csIHdlJ2xsIGNoZWNrIGxvY2FsU3RvcmFnZSBmb3IgYW55IGluLXByb2dyZXNzIGRpc2NvdmVyaWVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzYXZlZEFjdGl2ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY3RpdmVEaXNjb3ZlcmllcycpO1xuICAgICAgICAgICAgaWYgKHNhdmVkQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlID0gSlNPTi5wYXJzZShzYXZlZEFjdGl2ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkQWN0aXZlID0gYWN0aXZlLm1hcChpdGVtID0+ICh7XG4gICAgICAgICAgICAgICAgICAgIC4uLml0ZW0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoaXRlbS5zdGFydFRpbWUpLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGFjdGl2ZURpc2NvdmVyaWVzOiBwcm9jZXNzZWRBY3RpdmUgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGxvYWQgYWN0aXZlIGRpc2NvdmVyaWVzOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGRhdGEgb24gbW91bnRcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkRGlzY292ZXJ5TW9kdWxlcygpO1xuICAgICAgICBsb2FkUmVjZW50QWN0aXZpdHkoKTtcbiAgICAgICAgbG9hZEFjdGl2ZURpc2NvdmVyaWVzKCk7XG4gICAgfSwgW2xvYWREaXNjb3ZlcnlNb2R1bGVzLCBsb2FkUmVjZW50QWN0aXZpdHksIGxvYWRBY3RpdmVEaXNjb3Zlcmllc10pO1xuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZSB0byBkaXNjb3ZlcnkgcHJvZ3Jlc3MgdXBkYXRlc1xuICAgICAqL1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJPy5vblByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdkaXNjb3ZlcnktcHJvZ3Jlc3MnKSB7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZUluZGV4ID0gcHJldi5hY3RpdmVEaXNjb3Zlcmllcy5maW5kSW5kZXgoYSA9PiBhLmlkID09PSBkYXRhLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdGl2ZUluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBbLi4ucHJldi5hY3RpdmVEaXNjb3Zlcmllc107XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkW2FjdGl2ZUluZGV4XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi51cGRhdGVkW2FjdGl2ZUluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogZGF0YS5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T3BlcmF0aW9uOiBkYXRhLmN1cnJlbnRPcGVyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgLi4ucHJldiwgYWN0aXZlRGlzY292ZXJpZXM6IHVwZGF0ZWQgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJldjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogRmlsdGVyIGFuZCBzb3J0IGRpc2NvdmVyeSBtb2R1bGVzXG4gICAgICovXG4gICAgY29uc3QgZmlsdGVyZWRBbmRTb3J0ZWRNb2R1bGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCBmaWx0ZXJlZCA9IHN0YXRlLmRpc2NvdmVyeU1vZHVsZXM7XG4gICAgICAgIC8vIEFwcGx5IHRleHQgZmlsdGVyXG4gICAgICAgIGlmIChzdGF0ZS5maWx0ZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gc3RhdGUuZmlsdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihtb2R1bGUgPT4gKG1vZHVsZS5uYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxuICAgICAgICAgICAgICAgIChtb2R1bGUuZGVzY3JpcHRpb24gPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBcHBseSBjYXRlZ29yeSBmaWx0ZXIgKGlmIGltcGxlbWVudGVkKVxuICAgICAgICAvLyBpZiAoc3RhdGUuc2VsZWN0ZWRDYXRlZ29yeSkge1xuICAgICAgICAvLyAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKG0gPT4gbS5jYXRlZ29yeSA9PT0gc3RhdGUuc2VsZWN0ZWRDYXRlZ29yeSk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gU29ydFxuICAgICAgICBjb25zdCBzb3J0ZWQgPSBbLi4uZmlsdGVyZWRdLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdGUuc29ydEJ5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnbmFtZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xhc3RSdW4nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWEubGFzdFJ1biAmJiAhYi5sYXN0UnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYS5sYXN0UnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYi5sYXN0UnVuKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoYi5sYXN0UnVuKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShhLmxhc3RSdW4pLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBjYXNlICdzdGF0dXMnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5zdGF0dXMubG9jYWxlQ29tcGFyZShiLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVzdWx0Q291bnQnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGIucmVzdWx0Q291bnQgfHwgMCkgLSAoYS5yZXN1bHRDb3VudCB8fCAwKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzb3J0ZWQ7XG4gICAgfSwgW3N0YXRlLmRpc2NvdmVyeU1vZHVsZXMsIHN0YXRlLmZpbHRlciwgc3RhdGUuc2VsZWN0ZWRDYXRlZ29yeSwgc3RhdGUuc29ydEJ5XSk7XG4gICAgLyoqXG4gICAgICogTGF1bmNoIGRpc2NvdmVyeSBtb2R1bGVcbiAgICAgKi9cbiAgICBjb25zdCBsYXVuY2hEaXNjb3ZlcnkgPSB1c2VDYWxsYmFjaygocm91dGUpID0+IHtcbiAgICAgICAgbmF2aWdhdGUocm91dGUpO1xuICAgIH0sIFtuYXZpZ2F0ZV0pO1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBkaXNjb3ZlcnkgbW9kdWxlIHN0YXR1c1xuICAgICAqL1xuICAgIGNvbnN0IHVwZGF0ZU1vZHVsZVN0YXR1cyA9IHVzZUNhbGxiYWNrKChtb2R1bGVJZCwgc3RhdHVzLCByZXN1bHRDb3VudCkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBwcmV2LmRpc2NvdmVyeU1vZHVsZXMubWFwKG1vZHVsZSA9PiBtb2R1bGUuaWQgPT09IG1vZHVsZUlkXG4gICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgIC4uLm1vZHVsZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBsYXN0UnVuOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENvdW50OiByZXN1bHRDb3VudCA/PyBtb2R1bGUucmVzdWx0Q291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgOiBtb2R1bGUpO1xuICAgICAgICAgICAgLy8gU2F2ZSB0byBsb2NhbFN0b3JhZ2VcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1c01hcCA9IHVwZGF0ZWQucmVkdWNlKChhY2MsIG1vZHVsZSkgPT4ge1xuICAgICAgICAgICAgICAgIGFjY1ttb2R1bGUuaWRdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXN0UnVuOiBtb2R1bGUubGFzdFJ1bixcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Q291bnQ6IG1vZHVsZS5yZXN1bHRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBtb2R1bGUuc3RhdHVzLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkaXNjb3ZlcnlNb2R1bGVzU3RhdHVzJywgSlNPTi5zdHJpbmdpZnkoc3RhdHVzTWFwKSk7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5wcmV2LCBkaXNjb3ZlcnlNb2R1bGVzOiB1cGRhdGVkIH07XG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBTZXQgZmlsdGVyIHRleHRcbiAgICAgKi9cbiAgICBjb25zdCBzZXRGaWx0ZXIgPSB1c2VDYWxsYmFjaygoZmlsdGVyKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgZmlsdGVyIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogU2V0IHNvcnQgb3JkZXJcbiAgICAgKi9cbiAgICBjb25zdCBzZXRTb3J0QnkgPSB1c2VDYWxsYmFjaygoc29ydEJ5KSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgc29ydEJ5IH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogUmVmcmVzaCBhbGwgZGF0YVxuICAgICAqL1xuICAgIGNvbnN0IHJlZnJlc2ggPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGxvYWREaXNjb3ZlcnlNb2R1bGVzKCk7XG4gICAgICAgIGxvYWRSZWNlbnRBY3Rpdml0eSgpO1xuICAgICAgICBsb2FkQWN0aXZlRGlzY292ZXJpZXMoKTtcbiAgICB9LCBbbG9hZERpc2NvdmVyeU1vZHVsZXMsIGxvYWRSZWNlbnRBY3Rpdml0eSwgbG9hZEFjdGl2ZURpc2NvdmVyaWVzXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgZGlzY292ZXJ5TW9kdWxlczogZmlsdGVyZWRBbmRTb3J0ZWRNb2R1bGVzLFxuICAgICAgICByZWNlbnRBY3Rpdml0eTogc3RhdGUucmVjZW50QWN0aXZpdHksXG4gICAgICAgIGFjdGl2ZURpc2NvdmVyaWVzOiBzdGF0ZS5hY3RpdmVEaXNjb3ZlcmllcyxcbiAgICAgICAgcXVldWVkRGlzY292ZXJpZXM6IHN0YXRlLnF1ZXVlZERpc2NvdmVyaWVzLFxuICAgICAgICBpc0xvYWRpbmc6IHN0YXRlLmlzTG9hZGluZyxcbiAgICAgICAgZmlsdGVyOiBzdGF0ZS5maWx0ZXIsXG4gICAgICAgIHNvcnRCeTogc3RhdGUuc29ydEJ5LFxuICAgICAgICAvLyBBY3Rpb25zXG4gICAgICAgIGxhdW5jaERpc2NvdmVyeSxcbiAgICAgICAgdXBkYXRlTW9kdWxlU3RhdHVzLFxuICAgICAgICBzZXRGaWx0ZXIsXG4gICAgICAgIHNldFNvcnRCeSxcbiAgICAgICAgcmVmcmVzaCxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==