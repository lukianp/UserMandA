"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[6739],{

/***/ 14676:
/*!******************************************************************!*\
  !*** ./src/renderer/hooks/useInfrastructureDiscoveryHubLogic.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useInfrastructureDiscoveryHubLogic: () => (/* binding */ useInfrastructureDiscoveryHubLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ 84976);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_1__);
/**
 * Infrastructure Discovery Hub Logic Hook
 * Manages state and business logic for the central discovery dashboard
 */


/**
 * Default discovery modules registry
 * Contains all 47 discovery modules organized by category
 */
const defaultDiscoveryModules = [
    // =========================================================================
    // IDENTITY & ACCESS
    // =========================================================================
    {
        id: 'active-directory',
        name: 'Active Directory',
        icon: 'Database',
        description: 'Discover users, groups, computers, OUs, GPOs, and trust relationships from Active Directory',
        route: '/discovery/active-directory',
        status: 'idle',
    },
    {
        id: 'entra-id-app',
        name: 'Entra ID Apps',
        icon: 'Package',
        description: 'Discover Azure AD/Entra ID app registrations, service principals, and permissions',
        route: '/discovery/entra-id-app',
        status: 'idle',
    },
    {
        id: 'external-identity',
        name: 'External Identities',
        icon: 'Users',
        description: 'Discover guest users, B2B collaborators, and external identities',
        route: '/discovery/external-identity',
        status: 'idle',
    },
    {
        id: 'graph',
        name: 'Microsoft Graph',
        icon: 'Network',
        description: 'Discover Microsoft Graph API data including users, groups, and organizational data',
        route: '/discovery/graph',
        status: 'idle',
    },
    {
        id: 'multi-domain-forest',
        name: 'Multi-Domain Forest',
        icon: 'Network',
        description: 'Discover multi-domain AD forest structures, trusts, and cross-domain relationships',
        route: '/discovery/multi-domain-forest',
        status: 'idle',
    },
    {
        id: 'conditional-access',
        name: 'Conditional Access',
        icon: 'Shield',
        description: 'Discover conditional access policies, named locations, and authentication requirements',
        route: '/discovery/conditional-access',
        status: 'idle',
    },
    {
        id: 'gpo',
        name: 'Group Policy',
        icon: 'Folder',
        description: 'Discover Group Policy Objects, settings, and linked OUs',
        route: '/discovery/gpo',
        status: 'idle',
    },
    // =========================================================================
    // CLOUD PLATFORMS
    // =========================================================================
    {
        id: 'azure-infrastructure',
        name: 'Azure',
        icon: 'Cloud',
        description: 'Discover Azure resources, subscriptions, resource groups, and configurations',
        route: '/discovery/azure',
        status: 'idle',
    },
    {
        id: 'azure-resource',
        name: 'Azure Resource',
        icon: 'Server',
        description: 'Detailed discovery of Azure resources, VMs, storage, and networking',
        route: '/discovery/azure-resource',
        status: 'idle',
    },
    {
        id: 'aws',
        name: 'AWS',
        icon: 'Cloud',
        description: 'Discover Amazon Web Services resources and infrastructure',
        route: '/discovery/aws',
        status: 'idle',
    },
    {
        id: 'gcp',
        name: 'GCP',
        icon: 'Cloud',
        description: 'Discover Google Cloud Platform projects, resources, and services',
        route: '/discovery/gcp',
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
    // =========================================================================
    // MICROSOFT 365
    // =========================================================================
    {
        id: 'exchange',
        name: 'Exchange',
        icon: 'Mail',
        description: 'Discover Exchange servers, mailboxes, distribution groups, and transport rules',
        route: '/discovery/exchange',
        status: 'idle',
    },
    {
        id: 'sharepoint',
        name: 'SharePoint',
        icon: 'FolderTree',
        description: 'Discover SharePoint sites, libraries, lists, and permissions',
        route: '/discovery/sharepoint',
        status: 'idle',
    },
    {
        id: 'teams',
        name: 'Microsoft Teams',
        icon: 'Users',
        description: 'Discover Teams, channels, memberships, and collaboration data',
        route: '/discovery/teams',
        status: 'idle',
    },
    {
        id: 'onedrive',
        name: 'OneDrive',
        icon: 'HardDrive',
        description: 'Discover OneDrive for Business storage, sharing, and sync settings',
        route: '/discovery/onedrive',
        status: 'idle',
    },
    {
        id: 'office365',
        name: 'Office 365',
        icon: 'Package',
        description: 'Discover Microsoft 365 users, mailboxes, licenses, and configurations',
        route: '/discovery/office365',
        status: 'idle',
    },
    {
        id: 'intune',
        name: 'Intune',
        icon: 'Shield',
        description: 'Discover Intune managed devices, policies, and compliance status',
        route: '/discovery/intune',
        status: 'idle',
    },
    {
        id: 'power-platform',
        name: 'Power Platform',
        icon: 'Package',
        description: 'Discover Power Apps, Power Automate flows, and Power BI workspaces',
        route: '/discovery/power-platform',
        status: 'idle',
    },
    {
        id: 'powerbi',
        name: 'Power BI',
        icon: 'Database',
        description: 'Discover Power BI workspaces, reports, datasets, and sharing settings',
        route: '/discovery/powerbi',
        status: 'idle',
    },
    // =========================================================================
    // INFRASTRUCTURE
    // =========================================================================
    {
        id: 'file-system',
        name: 'File System',
        icon: 'Folder',
        description: 'Discover file shares, NTFS permissions, and storage utilization',
        route: '/discovery/file-system',
        status: 'idle',
    },
    {
        id: 'file-server',
        name: 'File Server',
        icon: 'Server',
        description: 'Discover file server configurations, shares, and DFS namespaces',
        route: '/discovery/file-server',
        status: 'idle',
    },
    {
        id: 'domain',
        name: 'Domain',
        icon: 'Network',
        description: 'Discover domain controllers, FSMO roles, and domain configuration',
        route: '/discovery/domain',
        status: 'idle',
    },
    {
        id: 'network',
        name: 'Network',
        icon: 'Network',
        description: 'Discover network topology, subnets, and IP address management',
        route: '/discovery/network',
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
        id: 'environment',
        name: 'Environment',
        icon: 'Server',
        description: 'Discover environment configuration, variables, and system settings',
        route: '/discovery/environment',
        status: 'idle',
    },
    {
        id: 'physical-server',
        name: 'Physical Server',
        icon: 'Server',
        description: 'Discover physical server hardware, BIOS, and firmware details',
        route: '/discovery/physical-server',
        status: 'idle',
    },
    {
        id: 'storage-array',
        name: 'Storage Array',
        icon: 'HardDrive',
        description: 'Discover SAN/NAS storage arrays, volumes, and LUNs',
        route: '/discovery/storage-array',
        status: 'idle',
    },
    {
        id: 'printer',
        name: 'Printers',
        icon: 'Server',
        description: 'Discover print servers, printers, and print queues',
        route: '/discovery/printer',
        status: 'idle',
    },
    {
        id: 'scheduled-task',
        name: 'Scheduled Tasks',
        icon: 'Package',
        description: 'Discover Windows scheduled tasks, triggers, and actions',
        route: '/discovery/scheduled-task',
        status: 'idle',
    },
    {
        id: 'backup-recovery',
        name: 'Backup & Recovery',
        icon: 'HardDrive',
        description: 'Discover backup jobs, retention policies, and recovery points',
        route: '/discovery/backup-recovery',
        status: 'idle',
    },
    {
        id: 'web-server',
        name: 'Web Server',
        icon: 'Network',
        description: 'Discover IIS sites, application pools, and web configurations',
        route: '/discovery/web-server',
        status: 'idle',
    },
    // =========================================================================
    // VIRTUALIZATION
    // =========================================================================
    {
        id: 'vmware',
        name: 'VMware',
        icon: 'Server',
        description: 'Discover VMware vCenter, ESXi hosts, VMs, and datastores',
        route: '/discovery/vmware',
        status: 'idle',
    },
    {
        id: 'hyper-v',
        name: 'Hyper-V',
        icon: 'Server',
        description: 'Discover Hyper-V hosts, virtual machines, and virtual switches',
        route: '/discovery/hyper-v',
        status: 'idle',
    },
    {
        id: 'virtualization',
        name: 'Virtualization',
        icon: 'Server',
        description: 'General virtualization discovery across multiple platforms',
        route: '/discovery/virtualization',
        status: 'idle',
    },
    // =========================================================================
    // DATABASE
    // =========================================================================
    {
        id: 'sql-server',
        name: 'SQL Server',
        icon: 'Database',
        description: 'Discover SQL Server instances, databases, and configurations',
        route: '/discovery/sql-server',
        status: 'idle',
    },
    {
        id: 'database-schema',
        name: 'Database Schema',
        icon: 'Database',
        description: 'Discover database schemas, tables, stored procedures, and relationships',
        route: '/discovery/database-schema',
        status: 'idle',
    },
    // =========================================================================
    // SECURITY
    // =========================================================================
    {
        id: 'security',
        name: 'Security',
        icon: 'Shield',
        description: 'Discover security policies, compliance status, and vulnerabilities',
        route: '/discovery/security',
        status: 'idle',
    },
    {
        id: 'certificate',
        name: 'Certificates',
        icon: 'Shield',
        description: 'Discover SSL/TLS certificates, expiration dates, and certificate stores',
        route: '/discovery/certificate',
        status: 'idle',
    },
    {
        id: 'certificate-authority',
        name: 'Certificate Authority',
        icon: 'Shield',
        description: 'Discover PKI infrastructure, CAs, and certificate templates',
        route: '/discovery/certificate-authority',
        status: 'idle',
    },
    {
        id: 'dlp',
        name: 'DLP',
        icon: 'Shield',
        description: 'Discover Data Loss Prevention policies and sensitive data locations',
        route: '/discovery/dlp',
        status: 'idle',
    },
    {
        id: 'palo-alto',
        name: 'Palo Alto',
        icon: 'Shield',
        description: 'Discover Palo Alto firewall rules, policies, and configurations',
        route: '/discovery/palo-alto',
        status: 'idle',
    },
    {
        id: 'panorama-interrogation',
        name: 'Panorama',
        icon: 'Shield',
        description: 'Discover Palo Alto Panorama managed devices and policies',
        route: '/discovery/panorama-interrogation',
        status: 'idle',
    },
    // =========================================================================
    // DATA & LICENSING
    // =========================================================================
    {
        id: 'data-classification',
        name: 'Data Classification',
        icon: 'Folder',
        description: 'Discover data classification labels, sensitivity, and compliance tags',
        route: '/discovery/data-classification',
        status: 'idle',
    },
    {
        id: 'licensing',
        name: 'Licensing',
        icon: 'Package',
        description: 'Discover software licenses, assignments, and usage',
        route: '/discovery/licensing',
        status: 'idle',
    },
    {
        id: 'dns-dhcp',
        name: 'DNS & DHCP',
        icon: 'Network',
        description: 'Discover DNS zones, records, DHCP scopes, and reservations',
        route: '/discovery/dns-dhcp',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNjczOS44NTZiNjAwNDNkODdiZjI0ZTAyYy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNrRTtBQUNuQjtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNB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Ozs7Ozs7Ozs7Ozs7OztBQzlEc0M7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQzBCO0FBQ0U7QUFDNUI7QUFDQTtBQUNBO0FBQ08saUJBQWlCLDhJQUE4STtBQUN0SztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QiwwQ0FBSTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLFdBQVcsNEZBQTRGLHNEQUFJLFdBQVcsV0FBVywwQ0FBSSxvRkFBb0YsSUFBSSxzREFBSSxXQUFXLG9CQUFvQix5Q0FBeUMsc0RBQUksV0FBVyxXQUFXLDBDQUFJLG9GQUFvRiw4QkFBOEIsc0RBQUksYUFBYSw4Q0FBOEMsMENBQUk7QUFDN2dCO0FBQ0E7QUFDQSxpQkFBaUIscUNBQXFDLHNEQUFJLFVBQVUsV0FBVywwQ0FBSTtBQUNuRjtBQUNBO0FBQ0EscUJBQXFCLHlEQUF5RCxzREFBSSxXQUFXLG1QQUFtUCxHQUFHLEdBQUcsS0FBSztBQUMzVjtBQUNBLGlFQUFlLEtBQUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUluZnJhc3RydWN0dXJlRGlzY292ZXJ5SHViTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0JhZGdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEluZnJhc3RydWN0dXJlIERpc2NvdmVyeSBIdWIgTG9naWMgSG9va1xuICogTWFuYWdlcyBzdGF0ZSBhbmQgYnVzaW5lc3MgbG9naWMgZm9yIHRoZSBjZW50cmFsIGRpc2NvdmVyeSBkYXNoYm9hcmRcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuLyoqXG4gKiBEZWZhdWx0IGRpc2NvdmVyeSBtb2R1bGVzIHJlZ2lzdHJ5XG4gKiBDb250YWlucyBhbGwgNDcgZGlzY292ZXJ5IG1vZHVsZXMgb3JnYW5pemVkIGJ5IGNhdGVnb3J5XG4gKi9cbmNvbnN0IGRlZmF1bHREaXNjb3ZlcnlNb2R1bGVzID0gW1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBJREVOVElUWSAmIEFDQ0VTU1xuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB7XG4gICAgICAgIGlkOiAnYWN0aXZlLWRpcmVjdG9yeScsXG4gICAgICAgIG5hbWU6ICdBY3RpdmUgRGlyZWN0b3J5JyxcbiAgICAgICAgaWNvbjogJ0RhdGFiYXNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciB1c2VycywgZ3JvdXBzLCBjb21wdXRlcnMsIE9VcywgR1BPcywgYW5kIHRydXN0IHJlbGF0aW9uc2hpcHMgZnJvbSBBY3RpdmUgRGlyZWN0b3J5JyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2FjdGl2ZS1kaXJlY3RvcnknLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdlbnRyYS1pZC1hcHAnLFxuICAgICAgICBuYW1lOiAnRW50cmEgSUQgQXBwcycsXG4gICAgICAgIGljb246ICdQYWNrYWdlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBBenVyZSBBRC9FbnRyYSBJRCBhcHAgcmVnaXN0cmF0aW9ucywgc2VydmljZSBwcmluY2lwYWxzLCBhbmQgcGVybWlzc2lvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvZW50cmEtaWQtYXBwJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnZXh0ZXJuYWwtaWRlbnRpdHknLFxuICAgICAgICBuYW1lOiAnRXh0ZXJuYWwgSWRlbnRpdGllcycsXG4gICAgICAgIGljb246ICdVc2VycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgZ3Vlc3QgdXNlcnMsIEIyQiBjb2xsYWJvcmF0b3JzLCBhbmQgZXh0ZXJuYWwgaWRlbnRpdGllcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9leHRlcm5hbC1pZGVudGl0eScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2dyYXBoJyxcbiAgICAgICAgbmFtZTogJ01pY3Jvc29mdCBHcmFwaCcsXG4gICAgICAgIGljb246ICdOZXR3b3JrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBNaWNyb3NvZnQgR3JhcGggQVBJIGRhdGEgaW5jbHVkaW5nIHVzZXJzLCBncm91cHMsIGFuZCBvcmdhbml6YXRpb25hbCBkYXRhJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2dyYXBoJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnbXVsdGktZG9tYWluLWZvcmVzdCcsXG4gICAgICAgIG5hbWU6ICdNdWx0aS1Eb21haW4gRm9yZXN0JyxcbiAgICAgICAgaWNvbjogJ05ldHdvcmsnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIG11bHRpLWRvbWFpbiBBRCBmb3Jlc3Qgc3RydWN0dXJlcywgdHJ1c3RzLCBhbmQgY3Jvc3MtZG9tYWluIHJlbGF0aW9uc2hpcHMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvbXVsdGktZG9tYWluLWZvcmVzdCcsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2NvbmRpdGlvbmFsLWFjY2VzcycsXG4gICAgICAgIG5hbWU6ICdDb25kaXRpb25hbCBBY2Nlc3MnLFxuICAgICAgICBpY29uOiAnU2hpZWxkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBjb25kaXRpb25hbCBhY2Nlc3MgcG9saWNpZXMsIG5hbWVkIGxvY2F0aW9ucywgYW5kIGF1dGhlbnRpY2F0aW9uIHJlcXVpcmVtZW50cycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9jb25kaXRpb25hbC1hY2Nlc3MnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdncG8nLFxuICAgICAgICBuYW1lOiAnR3JvdXAgUG9saWN5JyxcbiAgICAgICAgaWNvbjogJ0ZvbGRlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgR3JvdXAgUG9saWN5IE9iamVjdHMsIHNldHRpbmdzLCBhbmQgbGlua2VkIE9VcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9ncG8nLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBDTE9VRCBQTEFURk9STVNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAge1xuICAgICAgICBpZDogJ2F6dXJlLWluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgbmFtZTogJ0F6dXJlJyxcbiAgICAgICAgaWNvbjogJ0Nsb3VkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBBenVyZSByZXNvdXJjZXMsIHN1YnNjcmlwdGlvbnMsIHJlc291cmNlIGdyb3VwcywgYW5kIGNvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2F6dXJlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnYXp1cmUtcmVzb3VyY2UnLFxuICAgICAgICBuYW1lOiAnQXp1cmUgUmVzb3VyY2UnLFxuICAgICAgICBpY29uOiAnU2VydmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEZXRhaWxlZCBkaXNjb3Zlcnkgb2YgQXp1cmUgcmVzb3VyY2VzLCBWTXMsIHN0b3JhZ2UsIGFuZCBuZXR3b3JraW5nJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2F6dXJlLXJlc291cmNlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnYXdzJyxcbiAgICAgICAgbmFtZTogJ0FXUycsXG4gICAgICAgIGljb246ICdDbG91ZCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgQW1hem9uIFdlYiBTZXJ2aWNlcyByZXNvdXJjZXMgYW5kIGluZnJhc3RydWN0dXJlJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2F3cycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2djcCcsXG4gICAgICAgIG5hbWU6ICdHQ1AnLFxuICAgICAgICBpY29uOiAnQ2xvdWQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIEdvb2dsZSBDbG91ZCBQbGF0Zm9ybSBwcm9qZWN0cywgcmVzb3VyY2VzLCBhbmQgc2VydmljZXMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvZ2NwJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnZ29vZ2xlLXdvcmtzcGFjZScsXG4gICAgICAgIG5hbWU6ICdHb29nbGUgV29ya3NwYWNlJyxcbiAgICAgICAgaWNvbjogJ01haWwnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIEdvb2dsZSBXb3Jrc3BhY2UgdXNlcnMsIGdyb3VwcywgYW5kIGRhdGEnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvZ29vZ2xlLXdvcmtzcGFjZScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIE1JQ1JPU09GVCAzNjVcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAge1xuICAgICAgICBpZDogJ2V4Y2hhbmdlJyxcbiAgICAgICAgbmFtZTogJ0V4Y2hhbmdlJyxcbiAgICAgICAgaWNvbjogJ01haWwnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIEV4Y2hhbmdlIHNlcnZlcnMsIG1haWxib3hlcywgZGlzdHJpYnV0aW9uIGdyb3VwcywgYW5kIHRyYW5zcG9ydCBydWxlcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9leGNoYW5nZScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3NoYXJlcG9pbnQnLFxuICAgICAgICBuYW1lOiAnU2hhcmVQb2ludCcsXG4gICAgICAgIGljb246ICdGb2xkZXJUcmVlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBTaGFyZVBvaW50IHNpdGVzLCBsaWJyYXJpZXMsIGxpc3RzLCBhbmQgcGVybWlzc2lvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvc2hhcmVwb2ludCcsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3RlYW1zJyxcbiAgICAgICAgbmFtZTogJ01pY3Jvc29mdCBUZWFtcycsXG4gICAgICAgIGljb246ICdVc2VycycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgVGVhbXMsIGNoYW5uZWxzLCBtZW1iZXJzaGlwcywgYW5kIGNvbGxhYm9yYXRpb24gZGF0YScsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS90ZWFtcycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ29uZWRyaXZlJyxcbiAgICAgICAgbmFtZTogJ09uZURyaXZlJyxcbiAgICAgICAgaWNvbjogJ0hhcmREcml2ZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgT25lRHJpdmUgZm9yIEJ1c2luZXNzIHN0b3JhZ2UsIHNoYXJpbmcsIGFuZCBzeW5jIHNldHRpbmdzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L29uZWRyaXZlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnb2ZmaWNlMzY1JyxcbiAgICAgICAgbmFtZTogJ09mZmljZSAzNjUnLFxuICAgICAgICBpY29uOiAnUGFja2FnZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgTWljcm9zb2Z0IDM2NSB1c2VycywgbWFpbGJveGVzLCBsaWNlbnNlcywgYW5kIGNvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L29mZmljZTM2NScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2ludHVuZScsXG4gICAgICAgIG5hbWU6ICdJbnR1bmUnLFxuICAgICAgICBpY29uOiAnU2hpZWxkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBJbnR1bmUgbWFuYWdlZCBkZXZpY2VzLCBwb2xpY2llcywgYW5kIGNvbXBsaWFuY2Ugc3RhdHVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2ludHVuZScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3Bvd2VyLXBsYXRmb3JtJyxcbiAgICAgICAgbmFtZTogJ1Bvd2VyIFBsYXRmb3JtJyxcbiAgICAgICAgaWNvbjogJ1BhY2thZ2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFBvd2VyIEFwcHMsIFBvd2VyIEF1dG9tYXRlIGZsb3dzLCBhbmQgUG93ZXIgQkkgd29ya3NwYWNlcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9wb3dlci1wbGF0Zm9ybScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3Bvd2VyYmknLFxuICAgICAgICBuYW1lOiAnUG93ZXIgQkknLFxuICAgICAgICBpY29uOiAnRGF0YWJhc2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFBvd2VyIEJJIHdvcmtzcGFjZXMsIHJlcG9ydHMsIGRhdGFzZXRzLCBhbmQgc2hhcmluZyBzZXR0aW5ncycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9wb3dlcmJpJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgLy8gSU5GUkFTVFJVQ1RVUkVcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAge1xuICAgICAgICBpZDogJ2ZpbGUtc3lzdGVtJyxcbiAgICAgICAgbmFtZTogJ0ZpbGUgU3lzdGVtJyxcbiAgICAgICAgaWNvbjogJ0ZvbGRlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgZmlsZSBzaGFyZXMsIE5URlMgcGVybWlzc2lvbnMsIGFuZCBzdG9yYWdlIHV0aWxpemF0aW9uJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2ZpbGUtc3lzdGVtJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnZmlsZS1zZXJ2ZXInLFxuICAgICAgICBuYW1lOiAnRmlsZSBTZXJ2ZXInLFxuICAgICAgICBpY29uOiAnU2VydmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBmaWxlIHNlcnZlciBjb25maWd1cmF0aW9ucywgc2hhcmVzLCBhbmQgREZTIG5hbWVzcGFjZXMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvZmlsZS1zZXJ2ZXInLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdkb21haW4nLFxuICAgICAgICBuYW1lOiAnRG9tYWluJyxcbiAgICAgICAgaWNvbjogJ05ldHdvcmsnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIGRvbWFpbiBjb250cm9sbGVycywgRlNNTyByb2xlcywgYW5kIGRvbWFpbiBjb25maWd1cmF0aW9uJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2RvbWFpbicsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ25ldHdvcmsnLFxuICAgICAgICBuYW1lOiAnTmV0d29yaycsXG4gICAgICAgIGljb246ICdOZXR3b3JrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBuZXR3b3JrIHRvcG9sb2d5LCBzdWJuZXRzLCBhbmQgSVAgYWRkcmVzcyBtYW5hZ2VtZW50JyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L25ldHdvcmsnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdhcHBsaWNhdGlvbnMnLFxuICAgICAgICBuYW1lOiAnQXBwbGljYXRpb25zJyxcbiAgICAgICAgaWNvbjogJ1BhY2thZ2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIGluc3RhbGxlZCBhcHBsaWNhdGlvbnMsIGRlcGVuZGVuY2llcywgYW5kIHZlcnNpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2FwcGxpY2F0aW9ucycsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2Vudmlyb25tZW50JyxcbiAgICAgICAgbmFtZTogJ0Vudmlyb25tZW50JyxcbiAgICAgICAgaWNvbjogJ1NlcnZlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgZW52aXJvbm1lbnQgY29uZmlndXJhdGlvbiwgdmFyaWFibGVzLCBhbmQgc3lzdGVtIHNldHRpbmdzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2Vudmlyb25tZW50JyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAncGh5c2ljYWwtc2VydmVyJyxcbiAgICAgICAgbmFtZTogJ1BoeXNpY2FsIFNlcnZlcicsXG4gICAgICAgIGljb246ICdTZXJ2ZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIHBoeXNpY2FsIHNlcnZlciBoYXJkd2FyZSwgQklPUywgYW5kIGZpcm13YXJlIGRldGFpbHMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvcGh5c2ljYWwtc2VydmVyJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnc3RvcmFnZS1hcnJheScsXG4gICAgICAgIG5hbWU6ICdTdG9yYWdlIEFycmF5JyxcbiAgICAgICAgaWNvbjogJ0hhcmREcml2ZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgU0FOL05BUyBzdG9yYWdlIGFycmF5cywgdm9sdW1lcywgYW5kIExVTnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvc3RvcmFnZS1hcnJheScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3ByaW50ZXInLFxuICAgICAgICBuYW1lOiAnUHJpbnRlcnMnLFxuICAgICAgICBpY29uOiAnU2VydmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBwcmludCBzZXJ2ZXJzLCBwcmludGVycywgYW5kIHByaW50IHF1ZXVlcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9wcmludGVyJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnc2NoZWR1bGVkLXRhc2snLFxuICAgICAgICBuYW1lOiAnU2NoZWR1bGVkIFRhc2tzJyxcbiAgICAgICAgaWNvbjogJ1BhY2thZ2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFdpbmRvd3Mgc2NoZWR1bGVkIHRhc2tzLCB0cmlnZ2VycywgYW5kIGFjdGlvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvc2NoZWR1bGVkLXRhc2snLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICdiYWNrdXAtcmVjb3ZlcnknLFxuICAgICAgICBuYW1lOiAnQmFja3VwICYgUmVjb3ZlcnknLFxuICAgICAgICBpY29uOiAnSGFyZERyaXZlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBiYWNrdXAgam9icywgcmV0ZW50aW9uIHBvbGljaWVzLCBhbmQgcmVjb3ZlcnkgcG9pbnRzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2JhY2t1cC1yZWNvdmVyeScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3dlYi1zZXJ2ZXInLFxuICAgICAgICBuYW1lOiAnV2ViIFNlcnZlcicsXG4gICAgICAgIGljb246ICdOZXR3b3JrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBJSVMgc2l0ZXMsIGFwcGxpY2F0aW9uIHBvb2xzLCBhbmQgd2ViIGNvbmZpZ3VyYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L3dlYi1zZXJ2ZXInLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBWSVJUVUFMSVpBVElPTlxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB7XG4gICAgICAgIGlkOiAndm13YXJlJyxcbiAgICAgICAgbmFtZTogJ1ZNd2FyZScsXG4gICAgICAgIGljb246ICdTZXJ2ZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFZNd2FyZSB2Q2VudGVyLCBFU1hpIGhvc3RzLCBWTXMsIGFuZCBkYXRhc3RvcmVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L3Ztd2FyZScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2h5cGVyLXYnLFxuICAgICAgICBuYW1lOiAnSHlwZXItVicsXG4gICAgICAgIGljb246ICdTZXJ2ZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIEh5cGVyLVYgaG9zdHMsIHZpcnR1YWwgbWFjaGluZXMsIGFuZCB2aXJ0dWFsIHN3aXRjaGVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2h5cGVyLXYnLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgICAgaWQ6ICd2aXJ0dWFsaXphdGlvbicsXG4gICAgICAgIG5hbWU6ICdWaXJ0dWFsaXphdGlvbicsXG4gICAgICAgIGljb246ICdTZXJ2ZXInLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYWwgdmlydHVhbGl6YXRpb24gZGlzY292ZXJ5IGFjcm9zcyBtdWx0aXBsZSBwbGF0Zm9ybXMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvdmlydHVhbGl6YXRpb24nLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBEQVRBQkFTRVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB7XG4gICAgICAgIGlkOiAnc3FsLXNlcnZlcicsXG4gICAgICAgIG5hbWU6ICdTUUwgU2VydmVyJyxcbiAgICAgICAgaWNvbjogJ0RhdGFiYXNlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBTUUwgU2VydmVyIGluc3RhbmNlcywgZGF0YWJhc2VzLCBhbmQgY29uZmlndXJhdGlvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3Zlcnkvc3FsLXNlcnZlcicsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2RhdGFiYXNlLXNjaGVtYScsXG4gICAgICAgIG5hbWU6ICdEYXRhYmFzZSBTY2hlbWEnLFxuICAgICAgICBpY29uOiAnRGF0YWJhc2UnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIGRhdGFiYXNlIHNjaGVtYXMsIHRhYmxlcywgc3RvcmVkIHByb2NlZHVyZXMsIGFuZCByZWxhdGlvbnNoaXBzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2RhdGFiYXNlLXNjaGVtYScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIFNFQ1VSSVRZXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHtcbiAgICAgICAgaWQ6ICdzZWN1cml0eScsXG4gICAgICAgIG5hbWU6ICdTZWN1cml0eScsXG4gICAgICAgIGljb246ICdTaGllbGQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIHNlY3VyaXR5IHBvbGljaWVzLCBjb21wbGlhbmNlIHN0YXR1cywgYW5kIHZ1bG5lcmFiaWxpdGllcycsXG4gICAgICAgIHJvdXRlOiAnL2Rpc2NvdmVyeS9zZWN1cml0eScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2NlcnRpZmljYXRlJyxcbiAgICAgICAgbmFtZTogJ0NlcnRpZmljYXRlcycsXG4gICAgICAgIGljb246ICdTaGllbGQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFNTTC9UTFMgY2VydGlmaWNhdGVzLCBleHBpcmF0aW9uIGRhdGVzLCBhbmQgY2VydGlmaWNhdGUgc3RvcmVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2NlcnRpZmljYXRlJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnY2VydGlmaWNhdGUtYXV0aG9yaXR5JyxcbiAgICAgICAgbmFtZTogJ0NlcnRpZmljYXRlIEF1dGhvcml0eScsXG4gICAgICAgIGljb246ICdTaGllbGQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFBLSSBpbmZyYXN0cnVjdHVyZSwgQ0FzLCBhbmQgY2VydGlmaWNhdGUgdGVtcGxhdGVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2NlcnRpZmljYXRlLWF1dGhvcml0eScsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2RscCcsXG4gICAgICAgIG5hbWU6ICdETFAnLFxuICAgICAgICBpY29uOiAnU2hpZWxkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBEYXRhIExvc3MgUHJldmVudGlvbiBwb2xpY2llcyBhbmQgc2Vuc2l0aXZlIGRhdGEgbG9jYXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2RscCcsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ3BhbG8tYWx0bycsXG4gICAgICAgIG5hbWU6ICdQYWxvIEFsdG8nLFxuICAgICAgICBpY29uOiAnU2hpZWxkJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBQYWxvIEFsdG8gZmlyZXdhbGwgcnVsZXMsIHBvbGljaWVzLCBhbmQgY29uZmlndXJhdGlvbnMnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvcGFsby1hbHRvJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAncGFub3JhbWEtaW50ZXJyb2dhdGlvbicsXG4gICAgICAgIG5hbWU6ICdQYW5vcmFtYScsXG4gICAgICAgIGljb246ICdTaGllbGQnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2NvdmVyIFBhbG8gQWx0byBQYW5vcmFtYSBtYW5hZ2VkIGRldmljZXMgYW5kIHBvbGljaWVzJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L3Bhbm9yYW1hLWludGVycm9nYXRpb24nLFxuICAgICAgICBzdGF0dXM6ICdpZGxlJyxcbiAgICB9LFxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBEQVRBICYgTElDRU5TSU5HXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHtcbiAgICAgICAgaWQ6ICdkYXRhLWNsYXNzaWZpY2F0aW9uJyxcbiAgICAgICAgbmFtZTogJ0RhdGEgQ2xhc3NpZmljYXRpb24nLFxuICAgICAgICBpY29uOiAnRm9sZGVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBkYXRhIGNsYXNzaWZpY2F0aW9uIGxhYmVscywgc2Vuc2l0aXZpdHksIGFuZCBjb21wbGlhbmNlIHRhZ3MnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvZGF0YS1jbGFzc2lmaWNhdGlvbicsXG4gICAgICAgIHN0YXR1czogJ2lkbGUnLFxuICAgIH0sXG4gICAge1xuICAgICAgICBpZDogJ2xpY2Vuc2luZycsXG4gICAgICAgIG5hbWU6ICdMaWNlbnNpbmcnLFxuICAgICAgICBpY29uOiAnUGFja2FnZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgc29mdHdhcmUgbGljZW5zZXMsIGFzc2lnbm1lbnRzLCBhbmQgdXNhZ2UnLFxuICAgICAgICByb3V0ZTogJy9kaXNjb3ZlcnkvbGljZW5zaW5nJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGlkOiAnZG5zLWRoY3AnLFxuICAgICAgICBuYW1lOiAnRE5TICYgREhDUCcsXG4gICAgICAgIGljb246ICdOZXR3b3JrJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciBETlMgem9uZXMsIHJlY29yZHMsIERIQ1Agc2NvcGVzLCBhbmQgcmVzZXJ2YXRpb25zJyxcbiAgICAgICAgcm91dGU6ICcvZGlzY292ZXJ5L2Rucy1kaGNwJyxcbiAgICAgICAgc3RhdHVzOiAnaWRsZScsXG4gICAgfSxcbl07XG4vKipcbiAqIEluZnJhc3RydWN0dXJlIERpc2NvdmVyeSBIdWIgTG9naWMgSG9va1xuICovXG5leHBvcnQgY29uc3QgdXNlSW5mcmFzdHJ1Y3R1cmVEaXNjb3ZlcnlIdWJMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gICAgLy8gU3RhdGVcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgZGlzY292ZXJ5TW9kdWxlczogW10sXG4gICAgICAgIHJlY2VudEFjdGl2aXR5OiBbXSxcbiAgICAgICAgYWN0aXZlRGlzY292ZXJpZXM6IFtdLFxuICAgICAgICBxdWV1ZWREaXNjb3ZlcmllczogW10sXG4gICAgICAgIGlzTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiAnJyxcbiAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogbnVsbCxcbiAgICAgICAgc29ydEJ5OiAnbmFtZScsXG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBkaXNjb3ZlcnkgbW9kdWxlcyBhbmQgdGhlaXIgc3RhdHVzXG4gICAgICovXG4gICAgY29uc3QgbG9hZERpc2NvdmVyeU1vZHVsZXMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgaXNMb2FkaW5nOiB0cnVlIH0pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIExvYWQgc2F2ZWQgZGlzY292ZXJ5IHN0YXR1cyBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICAgICAgICAgY29uc3Qgc2F2ZWRTdGF0dXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGlzY292ZXJ5TW9kdWxlc1N0YXR1cycpO1xuICAgICAgICAgICAgY29uc3Qgc3RhdHVzTWFwID0gc2F2ZWRTdGF0dXMgPyBKU09OLnBhcnNlKHNhdmVkU3RhdHVzKSA6IHt9O1xuICAgICAgICAgICAgLy8gTWVyZ2Ugd2l0aCBkZWZhdWx0c1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlcyA9IGRlZmF1bHREaXNjb3ZlcnlNb2R1bGVzLm1hcChtb2R1bGUgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5tb2R1bGUsXG4gICAgICAgICAgICAgICAgbGFzdFJ1bjogc3RhdHVzTWFwW21vZHVsZS5pZF0/Lmxhc3RSdW4sXG4gICAgICAgICAgICAgICAgcmVzdWx0Q291bnQ6IHN0YXR1c01hcFttb2R1bGUuaWRdPy5yZXN1bHRDb3VudCxcbiAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXR1c01hcFttb2R1bGUuaWRdPy5zdGF0dXMgfHwgJ2lkbGUnLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBkaXNjb3ZlcnlNb2R1bGVzOiBtb2R1bGVzLCBpc0xvYWRpbmc6IGZhbHNlIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGRpc2NvdmVyeSBtb2R1bGVzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGRpc2NvdmVyeU1vZHVsZXM6IGRlZmF1bHREaXNjb3ZlcnlNb2R1bGVzLFxuICAgICAgICAgICAgICAgIGlzTG9hZGluZzogZmFsc2VcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIHJlY2VudCBkaXNjb3ZlcnkgYWN0aXZpdHlcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkUmVjZW50QWN0aXZpdHkgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzYXZlZEFjdGl2aXR5ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JlY2VudERpc2NvdmVyeUFjdGl2aXR5Jyk7XG4gICAgICAgICAgICBpZiAoc2F2ZWRBY3Rpdml0eSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2aXR5ID0gSlNPTi5wYXJzZShzYXZlZEFjdGl2aXR5KTtcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRpbWVzdGFtcCBzdHJpbmdzIHRvIERhdGUgb2JqZWN0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NlZEFjdGl2aXR5ID0gYWN0aXZpdHkubWFwKGl0ZW0gPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4uaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZShpdGVtLnRpbWVzdGFtcCksXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgcmVjZW50QWN0aXZpdHk6IHByb2Nlc3NlZEFjdGl2aXR5IH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHJlY2VudCBhY3Rpdml0eTonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhY3RpdmUgZGlzY292ZXJpZXNcbiAgICAgKi9cbiAgICBjb25zdCBsb2FkQWN0aXZlRGlzY292ZXJpZXMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIC8vIEluIGEgcmVhbCBpbXBsZW1lbnRhdGlvbiwgdGhpcyB3b3VsZCBxdWVyeSB0aGUgYmFja2VuZCBmb3IgcnVubmluZyBkaXNjb3Zlcmllc1xuICAgICAgICAvLyBGb3Igbm93LCB3ZSdsbCBjaGVjayBsb2NhbFN0b3JhZ2UgZm9yIGFueSBpbi1wcm9ncmVzcyBkaXNjb3Zlcmllc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgc2F2ZWRBY3RpdmUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWN0aXZlRGlzY292ZXJpZXMnKTtcbiAgICAgICAgICAgIGlmIChzYXZlZEFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IEpTT04ucGFyc2Uoc2F2ZWRBY3RpdmUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NlZEFjdGl2ZSA9IGFjdGl2ZS5tYXAoaXRlbSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5pdGVtLFxuICAgICAgICAgICAgICAgICAgICBzdGFydFRpbWU6IG5ldyBEYXRlKGl0ZW0uc3RhcnRUaW1lKSxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBhY3RpdmVEaXNjb3ZlcmllczogcHJvY2Vzc2VkQWN0aXZlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIGFjdGl2ZSBkaXNjb3ZlcmllczonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBkYXRhIG9uIG1vdW50XG4gICAgICovXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZERpc2NvdmVyeU1vZHVsZXMoKTtcbiAgICAgICAgbG9hZFJlY2VudEFjdGl2aXR5KCk7XG4gICAgICAgIGxvYWRBY3RpdmVEaXNjb3ZlcmllcygpO1xuICAgIH0sIFtsb2FkRGlzY292ZXJ5TW9kdWxlcywgbG9hZFJlY2VudEFjdGl2aXR5LCBsb2FkQWN0aXZlRGlzY292ZXJpZXNdKTtcbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gZGlzY292ZXJ5IHByb2dyZXNzIHVwZGF0ZXNcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZSA9IHdpbmRvdy5lbGVjdHJvbkFQST8ub25Qcm9ncmVzcz8uKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YS50eXBlID09PSAnZGlzY292ZXJ5LXByb2dyZXNzJykge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVJbmRleCA9IHByZXYuYWN0aXZlRGlzY292ZXJpZXMuZmluZEluZGV4KGEgPT4gYS5pZCA9PT0gZGF0YS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY3RpdmVJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gWy4uLnByZXYuYWN0aXZlRGlzY292ZXJpZXNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFthY3RpdmVJbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4udXBkYXRlZFthY3RpdmVJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IGRhdGEucHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9wZXJhdGlvbjogZGF0YS5jdXJyZW50T3BlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IC4uLnByZXYsIGFjdGl2ZURpc2NvdmVyaWVzOiB1cGRhdGVkIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlKVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH07XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIEZpbHRlciBhbmQgc29ydCBkaXNjb3ZlcnkgbW9kdWxlc1xuICAgICAqL1xuICAgIGNvbnN0IGZpbHRlcmVkQW5kU29ydGVkTW9kdWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBsZXQgZmlsdGVyZWQgPSBzdGF0ZS5kaXNjb3ZlcnlNb2R1bGVzO1xuICAgICAgICAvLyBBcHBseSB0ZXh0IGZpbHRlclxuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyKSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hMb3dlciA9IHN0YXRlLmZpbHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobW9kdWxlID0+IChtb2R1bGUubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikgfHxcbiAgICAgICAgICAgICAgICAobW9kdWxlLmRlc2NyaXB0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgY2F0ZWdvcnkgZmlsdGVyIChpZiBpbXBsZW1lbnRlZClcbiAgICAgICAgLy8gaWYgKHN0YXRlLnNlbGVjdGVkQ2F0ZWdvcnkpIHtcbiAgICAgICAgLy8gICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihtID0+IG0uY2F0ZWdvcnkgPT09IHN0YXRlLnNlbGVjdGVkQ2F0ZWdvcnkpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIFNvcnRcbiAgICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmZpbHRlcmVkXS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKHN0YXRlLnNvcnRCeSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKTtcbiAgICAgICAgICAgICAgICBjYXNlICdsYXN0UnVuJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhLmxhc3RSdW4gJiYgIWIubGFzdFJ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWEubGFzdFJ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWIubGFzdFJ1bilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIubGFzdFJ1bikuZ2V0VGltZSgpIC0gbmV3IERhdGUoYS5sYXN0UnVuKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3RhdHVzJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuc3RhdHVzLmxvY2FsZUNvbXBhcmUoYi5zdGF0dXMpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3Jlc3VsdENvdW50JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChiLnJlc3VsdENvdW50IHx8IDApIC0gKGEucmVzdWx0Q291bnQgfHwgMCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc29ydGVkO1xuICAgIH0sIFtzdGF0ZS5kaXNjb3ZlcnlNb2R1bGVzLCBzdGF0ZS5maWx0ZXIsIHN0YXRlLnNlbGVjdGVkQ2F0ZWdvcnksIHN0YXRlLnNvcnRCeV0pO1xuICAgIC8qKlxuICAgICAqIExhdW5jaCBkaXNjb3ZlcnkgbW9kdWxlXG4gICAgICovXG4gICAgY29uc3QgbGF1bmNoRGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soKHJvdXRlKSA9PiB7XG4gICAgICAgIG5hdmlnYXRlKHJvdXRlKTtcbiAgICB9LCBbbmF2aWdhdGVdKTtcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZGlzY292ZXJ5IG1vZHVsZSBzdGF0dXNcbiAgICAgKi9cbiAgICBjb25zdCB1cGRhdGVNb2R1bGVTdGF0dXMgPSB1c2VDYWxsYmFjaygobW9kdWxlSWQsIHN0YXR1cywgcmVzdWx0Q291bnQpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiB7XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkID0gcHJldi5kaXNjb3ZlcnlNb2R1bGVzLm1hcChtb2R1bGUgPT4gbW9kdWxlLmlkID09PSBtb2R1bGVJZFxuICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAuLi5tb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJ1bjogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHRDb3VudDogcmVzdWx0Q291bnQgPz8gbW9kdWxlLnJlc3VsdENvdW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDogbW9kdWxlKTtcbiAgICAgICAgICAgIC8vIFNhdmUgdG8gbG9jYWxTdG9yYWdlXG4gICAgICAgICAgICBjb25zdCBzdGF0dXNNYXAgPSB1cGRhdGVkLnJlZHVjZSgoYWNjLCBtb2R1bGUpID0+IHtcbiAgICAgICAgICAgICAgICBhY2NbbW9kdWxlLmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJ1bjogbW9kdWxlLmxhc3RSdW4sXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENvdW50OiBtb2R1bGUucmVzdWx0Q291bnQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogbW9kdWxlLnN0YXR1cyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICB9LCB7fSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZGlzY292ZXJ5TW9kdWxlc1N0YXR1cycsIEpTT04uc3RyaW5naWZ5KHN0YXR1c01hcCkpO1xuICAgICAgICAgICAgcmV0dXJuIHsgLi4ucHJldiwgZGlzY292ZXJ5TW9kdWxlczogdXBkYXRlZCB9O1xuICAgICAgICB9KTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogU2V0IGZpbHRlciB0ZXh0XG4gICAgICovXG4gICAgY29uc3Qgc2V0RmlsdGVyID0gdXNlQ2FsbGJhY2soKGZpbHRlcikgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGZpbHRlciB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFNldCBzb3J0IG9yZGVyXG4gICAgICovXG4gICAgY29uc3Qgc2V0U29ydEJ5ID0gdXNlQ2FsbGJhY2soKHNvcnRCeSkgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIHNvcnRCeSB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIFJlZnJlc2ggYWxsIGRhdGFcbiAgICAgKi9cbiAgICBjb25zdCByZWZyZXNoID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBsb2FkRGlzY292ZXJ5TW9kdWxlcygpO1xuICAgICAgICBsb2FkUmVjZW50QWN0aXZpdHkoKTtcbiAgICAgICAgbG9hZEFjdGl2ZURpc2NvdmVyaWVzKCk7XG4gICAgfSwgW2xvYWREaXNjb3ZlcnlNb2R1bGVzLCBsb2FkUmVjZW50QWN0aXZpdHksIGxvYWRBY3RpdmVEaXNjb3Zlcmllc10pO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIGRpc2NvdmVyeU1vZHVsZXM6IGZpbHRlcmVkQW5kU29ydGVkTW9kdWxlcyxcbiAgICAgICAgcmVjZW50QWN0aXZpdHk6IHN0YXRlLnJlY2VudEFjdGl2aXR5LFxuICAgICAgICBhY3RpdmVEaXNjb3Zlcmllczogc3RhdGUuYWN0aXZlRGlzY292ZXJpZXMsXG4gICAgICAgIHF1ZXVlZERpc2NvdmVyaWVzOiBzdGF0ZS5xdWV1ZWREaXNjb3ZlcmllcyxcbiAgICAgICAgaXNMb2FkaW5nOiBzdGF0ZS5pc0xvYWRpbmcsXG4gICAgICAgIGZpbHRlcjogc3RhdGUuZmlsdGVyLFxuICAgICAgICBzb3J0Qnk6IHN0YXRlLnNvcnRCeSxcbiAgICAgICAgLy8gQWN0aW9uc1xuICAgICAgICBsYXVuY2hEaXNjb3ZlcnksXG4gICAgICAgIHVwZGF0ZU1vZHVsZVN0YXR1cyxcbiAgICAgICAgc2V0RmlsdGVyLFxuICAgICAgICBzZXRTb3J0QnksXG4gICAgICAgIHJlZnJlc2gsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKlxuICogU2VhcmNoIGlucHV0IHdpdGggaWNvbiwgY2xlYXIgYnV0dG9uLCBhbmQgZGVib3VuY2VkIG9uQ2hhbmdlLlxuICogVXNlZCBmb3IgZmlsdGVyaW5nIGxpc3RzIGFuZCB0YWJsZXMuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IFNlYXJjaCwgWCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IFNlYXJjaEJhciA9ICh7IHZhbHVlOiBjb250cm9sbGVkVmFsdWUgPSAnJywgb25DaGFuZ2UsIHBsYWNlaG9sZGVyID0gJ1NlYXJjaC4uLicsIGRlYm91bmNlRGVsYXkgPSAzMDAsIGRpc2FibGVkID0gZmFsc2UsIHNpemUgPSAnbWQnLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgW2lucHV0VmFsdWUsIHNldElucHV0VmFsdWVdID0gdXNlU3RhdGUoY29udHJvbGxlZFZhbHVlKTtcbiAgICAvLyBTeW5jIHdpdGggY29udHJvbGxlZCB2YWx1ZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoY29udHJvbGxlZFZhbHVlKTtcbiAgICB9LCBbY29udHJvbGxlZFZhbHVlXSk7XG4gICAgLy8gRGVib3VuY2VkIG9uQ2hhbmdlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKG9uQ2hhbmdlICYmIGlucHV0VmFsdWUgIT09IGNvbnRyb2xsZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgIG9uQ2hhbmdlKGlucHV0VmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBkZWJvdW5jZURlbGF5KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbaW5wdXRWYWx1ZSwgb25DaGFuZ2UsIGRlYm91bmNlRGVsYXksIGNvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIGNvbnN0IGhhbmRsZUlucHV0Q2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShlLnRhcmdldC52YWx1ZSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVDbGVhciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZSgnJyk7XG4gICAgICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgICAgICAgb25DaGFuZ2UoJycpO1xuICAgICAgICB9XG4gICAgfSwgW29uQ2hhbmdlXSk7XG4gICAgLy8gU2l6ZSBjbGFzc2VzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC04IHRleHQtc20gcHgtMycsXG4gICAgICAgIG1kOiAnaC0xMCB0ZXh0LWJhc2UgcHgtNCcsXG4gICAgICAgIGxnOiAnaC0xMiB0ZXh0LWxnIHB4LTUnLFxuICAgIH07XG4gICAgY29uc3QgaWNvblNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtNCB3LTQnLFxuICAgICAgICBtZDogJ2gtNSB3LTUnLFxuICAgICAgICBsZzogJ2gtNiB3LTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3JlbGF0aXZlIGZsZXggaXRlbXMtY2VudGVyJywgY2xhc3NOYW1lKTtcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ3ctZnVsbCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0zMDAnLCAncGwtMTAgcHItMTAnLCAnYmctd2hpdGUgdGV4dC1ncmF5LTkwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwJywgJ3RyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgXG4gICAgLy8gRGlzYWJsZWRcbiAgICB7XG4gICAgICAgICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktNTAwIGN1cnNvci1ub3QtYWxsb3dlZCc6IGRpc2FibGVkLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSBsZWZ0LTMgdGV4dC1ncmF5LTQwMCBwb2ludGVyLWV2ZW50cy1ub25lJywgaWNvblNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBpbnB1dFZhbHVlLCBvbkNoYW5nZTogaGFuZGxlSW5wdXRDaGFuZ2UsIHBsYWNlaG9sZGVyOiBwbGFjZWhvbGRlciwgZGlzYWJsZWQ6IGRpc2FibGVkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWxhYmVsXCI6IFwiU2VhcmNoXCIgfSksIGlucHV0VmFsdWUgJiYgIWRpc2FibGVkICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogaGFuZGxlQ2xlYXIsIGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgcmlnaHQtMycsICd0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIHJvdW5kZWQnLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJyksIFwiYXJpYS1sYWJlbFwiOiBcIkNsZWFyIHNlYXJjaFwiLCBjaGlsZHJlbjogX2pzeChYLCB7IGNsYXNzTmFtZTogaWNvblNpemVDbGFzc2VzW3NpemVdIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFNlYXJjaEJhcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=